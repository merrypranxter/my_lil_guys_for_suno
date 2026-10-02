import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import type { GenerationRequest } from '../types';
import { LITTLE_GUYS } from '../data/littleGuys';
import { REALITY_ENGINES } from '../data/realityEngines';
import { COMPOSITION_ENGINES } from '../data/compositionEngines';
import { MUSIC_MECHANISMS, MUSIC_SEED_RECIPES } from '../data/musicSeedSystem';
import { checkLilGuysConnection, generateWithLilGuys, lilGuysAppUrl } from './apiClient';
import { EXPERIMENT_MODE_IDS, LAB_RECIPES, getLabRecipe, recipePhase, suggestedDirectives } from './recipes';
import { createId, getResult, loadNotebook, notebookLocation, updateNotebook } from './store';
import type {
  ExperimentModeId,
  LabGeneration,
  LabGenerationConfig,
  LabResult,
  LabResultSummary,
  LabSession,
  SelectionMode,
} from './types';

const selectionModeSchema = z.enum(['assistant', 'human', 'mixed']);
const experimentModeSchema = z.enum(EXPERIMENT_MODE_IDS);

function textResult(value: unknown) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return { content: [{ type: 'text' as const, text }] };
}

function errorResult(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: 'text' as const, text: message }],
    isError: true,
  };
}

function buildMusicStack(
  musicMechanismIds: string[] = [],
  musicRecipeIds: string[] = [],
): NonNullable<GenerationRequest['musicStack']> {
  const mechanismSet = new Set(MUSIC_MECHANISMS.map((item) => item.id));
  const recipeSet = new Set(MUSIC_SEED_RECIPES.map((item) => item.id));

  const unknownMechanisms = musicMechanismIds.filter((id) => !mechanismSet.has(id));
  const unknownRecipes = musicRecipeIds.filter((id) => !recipeSet.has(id));
  if (unknownMechanisms.length || unknownRecipes.length) {
    const pieces = [
      unknownMechanisms.length ? 'Unknown music mechanism IDs: ' + unknownMechanisms.join(', ') : '',
      unknownRecipes.length ? 'Unknown music recipe IDs: ' + unknownRecipes.join(', ') : '',
    ].filter(Boolean);
    throw new Error(pieces.join('. ') + '. Use lab_catalog before lab_start.');
  }

  return [
    ...Array.from(new Set(musicRecipeIds)).map((id, index) => ({
      instanceId: 'mcp_recipe_' + index + '_' + id,
      kind: 'recipe' as const,
      refId: id,
      muted: false,
      locked: false,
      strength: 100,
    })),
    ...Array.from(new Set(musicMechanismIds)).map((id, index) => ({
      instanceId: 'mcp_mechanism_' + index + '_' + id,
      kind: 'mechanism' as const,
      refId: id,
      muted: false,
      locked: false,
      strength: 100,
    })),
  ];
}

function summarizeResult(result: LabResult, includeLyrics = false): LabResultSummary {
  const lyrics = result.response.lyrics || '';
  return {
    id: result.id,
    generation: result.generation,
    branchIndex: result.branchIndex,
    parentResultIds: result.parentResultIds,
    directive: result.directive,
    starred: result.starred,
    feedback: result.feedback,
    tags: result.tags,
    model: result.response.model,
    style: result.response.style || '',
    caption: result.response.caption || '',
    lyricsPreview: includeLyrics ? lyrics : lyrics.slice(0, 900),
    fingerprint: result.response.fingerprint,
    error: result.response.error,
  };
}

function clipSignal(value: string, limit = 850): string {
  const clean = value.trim().replace(/\s+/g, ' ');
  return clean.length <= limit ? clean : clean.slice(0, limit - 1) + '…';
}

function resultSignal(result: LabResult): string {
  const lyricDNA = (result.response.lyrics || '')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);
  const styleDNA = (result.response.style || '').replace(/\s+/g, ' ').trim().slice(0, 220);
  const pieces = [
    'PARENT DIRECTIVE: ' + result.directive,
    result.response.caption ? 'CAPTION DNA: ' + result.response.caption : '',
    styleDNA ? 'STYLE DNA: ' + styleDNA : '',
    lyricDNA ? 'LYRIC DNA: ' + lyricDNA : '',
    result.feedback ? 'USER FEEDBACK: ' + result.feedback : '',
    result.response.fingerprint
      ? 'FINGERPRINT: ' + Object.values(result.response.fingerprint).filter(Boolean).join(' | ')
      : '',
  ].filter(Boolean);
  return clipSignal('ANCESTOR SIGNAL — preserve the useful mechanism, not the exact wording. ' + pieces.join(' — '));
}

function favoriteSignals(results: LabResult[]): string[] {
  return results
    .filter((item) => item.starred)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6)
    .map((item) => {
      const note = item.feedback ? ' Feedback: ' + item.feedback : '';
      return clipSignal('STARRED HISTORY — ' + (item.response.caption || item.response.style || item.id) + note);
    });
}

function sessionSummary(session: LabSession, results: LabResult[]) {
  const recipe = getLabRecipe(session.mode);
  const sessionResults = results.filter((item) => item.sessionId === session.id);
  const lastGeneration = session.generations[session.generations.length - 1];
  return {
    id: session.id,
    label: session.label,
    mode: session.mode,
    recipe: recipe.name,
    rootSeed: session.rootSeed,
    status: session.status,
    population: session.population,
    depth: session.depth,
    fuckAround: session.fuckAround,
    selectionMode: session.selectionMode,
    generationsCompleted: session.generations.length,
    resultCount: sessionResults.length,
    starredCount: sessionResults.filter((item) => item.starred).length,
    latestSurvivors: lastGeneration?.survivorIds || [],
    stopRule: recipe.stopRule,
    updatedAt: session.updatedAt,
  };
}

function scientistRunbook(session: LabSession): string {
  const recipe = getLabRecipe(session.mode);
  return [
    'LIL GUYS LAB RUNBOOK',
    'Mode: ' + recipe.name,
    'Root seed: ' + session.rootSeed,
    'Selection mode: ' + session.selectionMode,
    'Population target: ' + session.population,
    'Maximum generations: ' + session.depth,
    'Fuck-around level: ' + session.fuckAround + '/100',
    '',
    'Selection pressure:',
    ...recipe.selectionPressure.map((item) => '- ' + item),
    '',
    'Loop:',
    '1. Call lab_generate_generation.',
    '2. Inspect the returned results. Use lab_get_result for full lyrics when needed.',
    session.selectionMode === 'human'
      ? '3. Ask the human which results survive, then call lab_select_survivors.'
      : '3. Choose survivors according to the recipe. Do not assign fake numerical quality scores; preserve useful diversity. Call lab_select_survivors and record why.',
    '4. Call lab_next_move. Continue until the stop rule or configured depth is reached.',
    '5. Call lab_finish, then lab_export_suno.',
    '',
    'Stop rule: ' + recipe.stopRule,
    'Do not ask the human to copy/paste intermediate prompts. The tools carry state and ancestry.',
  ].join('\n');
}

function makeGenerationRequest(
  session: LabSession,
  generation: number,
  phase: string,
  directive: string,
  parentResults: LabResult[],
  allResults: LabResult[],
): GenerationRequest {
  const recipe = getLabRecipe(session.mode);
  const config = session.generationConfig;
  const parents = parentResults.map(resultSignal);
  const favorites = favoriteSignals(allResults);

  const likedSignals = [
    ...(config.likedSignals || []),
    ...parents,
    ...(session.mode === 'favorite-dna' ? favorites : []),
  ].slice(-10);

  const noveltySignals = [
    ...(config.noveltySignals || []),
    'LAB MODE — ' + recipe.name + '. ' + recipe.purpose,
    'LAB PHASE — generation ' + generation + ': ' + phase + '.',
    'LAB MUTATION DIRECTIVE — ' + directive,
    ...(session.mode === 'anti-merry'
      ? favorites.map((signal) => 'ANTI-PREFERENCE PRESSURE — deliberately avoid cloning this historical attractor: ' + signal)
      : []),
  ].slice(-10);

  return {
    guyIds: config.guyIds || [],
    realityEngineIds: config.realityEngineIds || [],
    compositionEngineIds: config.compositionEngineIds || [],
    musicStack: config.musicStack || [],
    musicControls: config.musicControls,
    realityChaos: config.realityChaos || 2,
    seed: session.rootSeed,
    energy: config.energy ?? 4,
    likedSignals,
    noveltySignals,
  };
}

function markdownForResults(session: LabSession, results: LabResult[]): string {
  const recipe = getLabRecipe(session.mode);
  const lines: string[] = [
    '# Lil Guys Lab Export — ' + session.label,
    '',
    '- Session: ' + session.id,
    '- Mode: ' + recipe.name,
    '- Root seed: ' + session.rootSeed,
    '- Status: ' + session.status,
    '- Fuck-around: ' + session.fuckAround + '/100',
    '',
  ];

  for (const result of results) {
    lines.push(
      '## G' + result.generation + ' / Branch ' + (result.branchIndex + 1),
      '',
      '**Result ID:** ' + result.id,
      '',
      '**Directive:** ' + result.directive,
      '',
      result.parentResultIds.length ? '**Parents:** ' + result.parentResultIds.join(', ') : '**Parents:** founder',
      '',
      result.starred ? '**Starred:** yes' : '**Starred:** no',
      result.feedback ? '**Feedback:** ' + result.feedback : '',
      '',
      '### STYLE',
      result.response.style || '',
      '',
      '### LYRICS',
      result.response.lyrics || '',
      '',
      '### CAPTION',
      result.response.caption || '',
      '',
      '---',
      '',
    );
  }

  return lines.join('\n');
}

export function createLilGuysMcpServer(): McpServer {
  const server = new McpServer({
    name: 'lil-guys-lab',
    version: '0.1.0',
  });

  server.registerTool(
    'lab_check_connection',
    {
      description: 'Check whether the MCP lab can reach the Lil Guys app generation server.',
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const info = await checkLilGuysConnection();
        return textResult({
          ...info,
          notebook: notebookLocation(),
        });
      } catch (error) {
        return errorResult(
          (error instanceof Error ? error.message : String(error)) +
            ' Target app URL: ' +
            lilGuysAppUrl() +
            '. Set LIL_GUYS_APP_URL to the deployed Lil Guys URL or run npm run dev locally.',
        );
      }
    },
  );

  server.registerTool(
    'lab_list_recipes',
    {
      description: 'List the available pre-programmed Lil Guys experiment modes and their selection pressures.',
      inputSchema: z.object({}),
    },
    async () =>
      textResult(
        LAB_RECIPES.map((recipe) => ({
          id: recipe.id,
          name: recipe.name,
          purpose: recipe.purpose,
          defaultPopulation: recipe.defaultPopulation,
          defaultDepth: recipe.defaultDepth,
          selectionPressure: recipe.selectionPressure,
          phases: recipe.phases,
          stopRule: recipe.stopRule,
        })),
      ),
  );

  server.registerTool(
    'lab_catalog',
    {
      description:
        'Browse the actual Lil Guys creative vocabulary so the connected AI can choose real Mind, Reality, Composition, mechanism, or music-recipe IDs instead of inventing them.',
      inputSchema: z.object({
        kind: z.enum(['minds', 'reality', 'composition', 'music-mechanisms', 'music-recipes']),
        query: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(30),
      }),
    },
    async ({ kind, query, limit }) => {
      try {
        const q = query?.trim().toLowerCase() || '';
        const contains = (parts: unknown[]) =>
          !q || parts.filter(Boolean).join(' ').toLowerCase().includes(q);

        let rows: any[] = [];
        if (kind === 'minds') {
          rows = LITTLE_GUYS
            .filter((item) => contains([item.id, item.name, item.subtitle, item.rule, item.shortExplanation]))
            .map((item) => ({
              id: item.id,
              name: item.name,
              subtitle: item.subtitle,
              rule: item.rule,
              jurisdiction: item.defaultJurisdiction,
              explanation: item.shortExplanation,
            }));
        } else if (kind === 'reality') {
          rows = REALITY_ENGINES
            .filter((item) => contains([item.id, item.name, item.dimension, item.rule, item.shortExplanation, ...(item.tags || [])]))
            .map((item) => ({
              id: item.id,
              name: item.name,
              dimension: item.dimension,
              rule: item.rule,
              explanation: item.shortExplanation,
              tags: item.tags,
            }));
        } else if (kind === 'composition') {
          rows = COMPOSITION_ENGINES
            .filter((item) => contains([item.id, item.name, item.domain, item.dimension, item.rule, item.shortExplanation, ...(item.tags || [])]))
            .map((item) => ({
              id: item.id,
              name: item.name,
              domain: item.domain,
              dimension: item.dimension,
              rule: item.rule,
              explanation: item.shortExplanation,
              tags: item.tags,
            }));
        } else if (kind === 'music-mechanisms') {
          rows = MUSIC_MECHANISMS
            .filter((item) => contains([item.id, item.name, item.family, item.instruction, item.shortExplanation, ...(item.tags || [])]))
            .map((item) => ({
              id: item.id,
              name: item.name,
              family: item.family,
              instruction: item.instruction,
              explanation: item.shortExplanation,
              chaos: item.chaos,
              stemValue: item.stemValue,
              tags: item.tags,
            }));
        } else {
          rows = MUSIC_SEED_RECIPES
            .filter((item) => contains([item.id, item.name, item.description, item.startHere, ...(item.mechanismIds || [])]))
            .map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              startHere: item.startHere,
              mechanismIds: item.mechanismIds,
            }));
        }

        return textResult({
          kind,
          query: query || '',
          matched: rows.length,
          returned: Math.min(rows.length, limit),
          items: rows.slice(0, limit),
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'lab_start',
    {
      description:
        'Start a persistent Lil Guys experiment session. The returned runbook tells the connected AI how to conduct the session without human copy/paste.',
      inputSchema: z.object({
        seed: z.string().min(1).describe('The sovereign Lil Guys seed / subject.'),
        mode: experimentModeSchema.default('petri-dish'),
        label: z.string().optional(),
        population: z.number().int().min(1).max(12).optional(),
        depth: z.number().int().min(1).max(12).optional(),
        fuckAround: z.number().int().min(0).max(100).default(65),
        selectionMode: selectionModeSchema.default('assistant'),
        guyIds: z.array(z.string()).max(64).optional(),
        realityEngineIds: z.array(z.string()).max(24).optional(),
        compositionEngineIds: z.array(z.string()).max(64).optional(),
        musicMechanismIds: z.array(z.string()).max(24).optional(),
        musicRecipeIds: z.array(z.string()).max(12).optional(),
        energy: z.number().min(1).max(5).optional(),
        realityChaos: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
        likedSignals: z.array(z.string()).max(10).optional(),
        noveltySignals: z.array(z.string()).max(10).optional(),
      }),
    },
    async (args) => {
      try {
        const recipe = getLabRecipe(args.mode as ExperimentModeId);
        const now = Date.now();
        const config: LabGenerationConfig = {
          guyIds: args.guyIds || [],
          realityEngineIds: args.realityEngineIds || [],
          compositionEngineIds: args.compositionEngineIds || [],
          musicStack: buildMusicStack(args.musicMechanismIds || [], args.musicRecipeIds || []),
          energy: args.energy ?? 4,
          realityChaos: args.realityChaos ?? 2,
          likedSignals: args.likedSignals || [],
          noveltySignals: args.noveltySignals || [],
        };
        const session: LabSession = {
          id: createId('session'),
          label: args.label?.trim() || recipe.name + ' — ' + args.seed.slice(0, 48),
          mode: args.mode as ExperimentModeId,
          rootSeed: args.seed.trim(),
          createdAt: now,
          updatedAt: now,
          status: 'active',
          population: args.population ?? recipe.defaultPopulation,
          depth: args.depth ?? recipe.defaultDepth,
          fuckAround: args.fuckAround,
          selectionMode: args.selectionMode as SelectionMode,
          generationConfig: config,
          generations: [],
          notes: [],
        };
        await updateNotebook((notebook) => {
          notebook.sessions.unshift(session);
        });
        return textResult({
          session: sessionSummary(session, []),
          runbook: scientistRunbook(session),
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'lab_generate_generation',
    {
      description:
        'Generate the next population for a lab session. One Lil Guys generation request is made per directive, sequentially. Omit directives to use the recipe defaults.',
      inputSchema: z.object({
        sessionId: z.string().min(1),
        directives: z.array(z.string().min(1)).min(1).max(12).optional(),
        parentResultIds: z.array(z.string()).max(6).optional(),
      }),
    },
    async ({ sessionId, directives, parentResultIds }) => {
      try {
        const notebook = await loadNotebook();
        const session = notebook.sessions.find((item) => item.id === sessionId);
        if (!session) throw new Error('Lab session not found: ' + sessionId);
        if (session.status !== 'active') throw new Error('Lab session is not active.');
        if (session.generations.length >= session.depth) {
          throw new Error('Configured generation depth has been reached. Finish or extend the session.');
        }

        const recipe = getLabRecipe(session.mode);
        const generation = session.generations.length;
        const phase = recipePhase(recipe, generation);
        const previous = session.generations[generation - 1];
        const resolvedParentIds =
          parentResultIds && parentResultIds.length
            ? parentResultIds
            : previous?.survivorIds?.length
              ? previous.survivorIds
              : [];

        if (generation > 0 && resolvedParentIds.length === 0 && session.mode !== 'operator-stress-test') {
          throw new Error('No survivors selected from the previous generation. Call lab_select_survivors first.');
        }

        const parentResults = resolvedParentIds.map((id) => {
          const result = notebook.results.find((item) => item.id === id);
          if (!result) throw new Error('Parent result not found: ' + id);
          return result;
        });

        const activeDirectives =
          directives && directives.length
            ? directives.slice(0, 12)
            : suggestedDirectives(recipe, generation, session.population, session.fuckAround);

        const created: LabResult[] = [];
        for (let index = 0; index < activeDirectives.length; index += 1) {
          const directive = activeDirectives[index];
          const request = makeGenerationRequest(
            session,
            generation,
            phase,
            directive,
            parentResults,
            notebook.results,
          );
          try {
            const response = await generateWithLilGuys(request);
            created.push({
              id: createId('result'),
              sessionId,
              generation,
              branchIndex: index,
              parentResultIds: resolvedParentIds,
              directive,
              createdAt: Date.now(),
              response,
              starred: false,
              feedback: '',
              tags: [],
            });
          } catch (error) {
            created.push({
              id: createId('result'),
              sessionId,
              generation,
              branchIndex: index,
              parentResultIds: resolvedParentIds,
              directive,
              createdAt: Date.now(),
              response: {
                style: '',
                lyrics: '',
                caption: '',
                charCounts: { style: 0, lyrics: 0, caption: 0 },
                error: error instanceof Error ? error.message : String(error),
              },
              starred: false,
              feedback: '',
              tags: ['generation-error'],
            });
          }
        }

        const generationRecord: LabGeneration = {
          index: generation,
          createdAt: Date.now(),
          phase,
          directives: activeDirectives,
          parentResultIds: resolvedParentIds,
          resultIds: created.map((item) => item.id),
          survivorIds: [],
        };

        await updateNotebook((fresh) => {
          const target = fresh.sessions.find((item) => item.id === sessionId);
          if (!target) throw new Error('Lab session disappeared while generating.');
          if (target.generations.length !== generation) {
            throw new Error('Session advanced while this generation was running. Results were not attached.');
          }
          target.generations.push(generationRecord);
          target.updatedAt = Date.now();
          fresh.results.push(...created);
        });

        return textResult({
          sessionId,
          generation,
          phase,
          apiCalls: created.length,
          selectionPressure: recipe.selectionPressure,
          results: created.map((item) => summarizeResult(item)),
          next:
            session.selectionMode === 'human'
              ? 'Show these results to the human and ask which survive. Then call lab_select_survivors.'
              : 'Inspect these results and choose survivors according to the recipe pressure. Do not invent a numeric quality score. Call lab_select_survivors with the IDs and a short reason.',
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'lab_select_survivors',
    {
      description: 'Record the survivors from the newest generation and preserve the selection reason in lineage history.',
      inputSchema: z.object({
        sessionId: z.string().min(1),
        resultIds: z.array(z.string()).min(1).max(6),
        reason: z.string().min(1),
        starSelected: z.boolean().default(false),
      }),
    },
    async ({ sessionId, resultIds, reason, starSelected }) => {
      try {
        const updated = await updateNotebook((notebook) => {
          const session = notebook.sessions.find((item) => item.id === sessionId);
          if (!session) throw new Error('Lab session not found: ' + sessionId);
          const generation = session.generations[session.generations.length - 1];
          if (!generation) throw new Error('This session has no generated population yet.');
          const allowed = new Set(generation.resultIds);
          const invalid = resultIds.filter((id) => !allowed.has(id));
          if (invalid.length) {
            throw new Error('Survivors must come from the newest generation. Invalid: ' + invalid.join(', '));
          }

          generation.survivorIds = Array.from(new Set(resultIds));
          generation.selectionReason = reason.trim();
          session.updatedAt = Date.now();

          if (starSelected) {
            for (const result of notebook.results) {
              if (generation.survivorIds.includes(result.id)) result.starred = true;
            }
          }
          return session;
        });

        return textResult({
          sessionId,
          survivors: updated.generations[updated.generations.length - 1]?.survivorIds || [],
          next: 'Call lab_next_move to decide whether to evolve again or harvest.',
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'lab_feedback',
    {
      description: 'Star/unstar a result and attach free-text feedback or tags. Starred history becomes soft genetic material for FAVORITE DNA.',
      inputSchema: z.object({
        resultId: z.string().min(1),
        starred: z.boolean().optional(),
        feedback: z.string().max(2000).optional(),
        tags: z.array(z.string().max(80)).max(20).optional(),
      }),
    },
    async ({ resultId, starred, feedback, tags }) => {
      try {
        const updated = await updateNotebook((notebook) => {
          const result = notebook.results.find((item) => item.id === resultId);
          if (!result) throw new Error('Lab result not found: ' + resultId);
          if (typeof starred === 'boolean') result.starred = starred;
          if (typeof feedback === 'string') result.feedback = feedback.trim();
          if (tags) result.tags = Array.from(new Set(tags.map((item) => item.trim()).filter(Boolean)));
          const session = notebook.sessions.find((item) => item.id === result.sessionId);
          if (session) session.updatedAt = Date.now();
          return result;
        });
        return textResult(summarizeResult(updated));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'lab_get_result',
    {
      description: 'Get one complete lab result including full Suno STYLE, LYRICS, CAPTION, ancestry, feedback, and fingerprint.',
      inputSchema: z.object({ resultId: z.string().min(1) }),
    },
    async ({ resultId }) => {
      try {
        return textResult(await getResult(resultId));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'lab_get_session',
    {
      description: 'Get session state, generation history, recipe rules, and compact result previews.',
      inputSchema: z.object({
        sessionId: z.string().min(1),
        includeLyrics: z.boolean().default(false),
      }),
    },
    async ({ sessionId, includeLyrics }) => {
      try {
        const notebook = await loadNotebook();
        const session = notebook.sessions.find((item) => item.id === sessionId);
        if (!session) throw new Error('Lab session not found: ' + sessionId);
        const results = notebook.results
          .filter((item) => item.sessionId === sessionId)
          .sort((a, b) => a.generation - b.generation || a.branchIndex - b.branchIndex);
        return textResult({
          session,
          recipe: getLabRecipe(session.mode),
          results: results.map((item) => summarizeResult(item, includeLyrics)),
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'lab_list_sessions',
    {
      description: 'List recent MCP lab sessions stored in the local notebook.',
      inputSchema: z.object({
        limit: z.number().int().min(1).max(100).default(20),
      }),
    },
    async ({ limit }) => {
      try {
        const notebook = await loadNotebook();
        return textResult(
          notebook.sessions
            .slice()
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, limit)
            .map((session) => sessionSummary(session, notebook.results)),
        );
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'lab_next_move',
    {
      description: 'Return the next recommended action for an active session based on its recipe and current generation state.',
      inputSchema: z.object({ sessionId: z.string().min(1) }),
    },
    async ({ sessionId }) => {
      try {
        const notebook = await loadNotebook();
        const session = notebook.sessions.find((item) => item.id === sessionId);
        if (!session) throw new Error('Lab session not found: ' + sessionId);
        const recipe = getLabRecipe(session.mode);

        if (session.status !== 'active') {
          return textResult({ action: 'export', reason: 'Session is no longer active.' });
        }
        if (!session.generations.length) {
          return textResult({ action: 'generate', reason: 'No population exists yet.', phase: recipePhase(recipe, 0) });
        }

        const latest = session.generations[session.generations.length - 1];
        if (!latest.survivorIds.length) {
          return textResult({
            action: session.selectionMode === 'human' ? 'ask-human-to-select' : 'select-survivors',
            generation: latest.index,
            selectionPressure: recipe.selectionPressure,
          });
        }

        if (session.generations.length >= session.depth) {
          return textResult({
            action: 'finish-and-export',
            reason: 'Configured depth reached.',
            stopRule: recipe.stopRule,
          });
        }

        return textResult({
          action: 'generate',
          nextGeneration: session.generations.length,
          phase: recipePhase(recipe, session.generations.length),
          parentResultIds: latest.survivorIds,
          stopRule: recipe.stopRule,
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'lab_finish',
    {
      description: 'Mark a lab session completed or abandoned. This does not delete its notebook history.',
      inputSchema: z.object({
        sessionId: z.string().min(1),
        status: z.enum(['completed', 'abandoned']).default('completed'),
        note: z.string().max(2000).optional(),
      }),
    },
    async ({ sessionId, status, note }) => {
      try {
        const session = await updateNotebook((notebook) => {
          const target = notebook.sessions.find((item) => item.id === sessionId);
          if (!target) throw new Error('Lab session not found: ' + sessionId);
          target.status = status;
          target.updatedAt = Date.now();
          if (note?.trim()) target.notes.push(note.trim());
          return target;
        });
        return textResult({
          sessionId,
          status: session.status,
          next: 'Call lab_export_suno to harvest Suno-ready outputs.',
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'lab_export_suno',
    {
      description: 'Export Suno-ready STYLE / LYRICS / CAPTION packages from a session as Markdown.',
      inputSchema: z.object({
        sessionId: z.string().min(1),
        onlyStarred: z.boolean().default(false),
        onlySurvivors: z.boolean().default(true),
      }),
    },
    async ({ sessionId, onlyStarred, onlySurvivors }) => {
      try {
        const notebook = await loadNotebook();
        const session = notebook.sessions.find((item) => item.id === sessionId);
        if (!session) throw new Error('Lab session not found: ' + sessionId);
        let results = notebook.results
          .filter((item) => item.sessionId === sessionId)
          .sort((a, b) => a.generation - b.generation || a.branchIndex - b.branchIndex);

        if (onlyStarred) results = results.filter((item) => item.starred);
        if (onlySurvivors) {
          const finalSelectedGeneration = session.generations
            .slice()
            .reverse()
            .find((generation) => generation.survivorIds.length > 0);
          const survivorIds = new Set(finalSelectedGeneration?.survivorIds || []);
          const survivors = results.filter((item) => survivorIds.has(item.id));
          if (survivors.length) results = survivors;
        }

        return textResult(markdownForResults(session, results));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerPrompt(
    'run-lab-experiment',
    {
      title: 'Run a Lil Guys Lab experiment',
      description: 'Conduct a pre-programmed multi-generation Lil Guys experiment without copy/paste between generations.',
      argsSchema: z.object({
        seed: z.string().describe('The starting Lil Guys seed.'),
        mode: experimentModeSchema.default('petri-dish'),
        fuckAround: z.string().optional().describe('Optional 0-100 chaos/mutation preference.'),
        depth: z.string().optional().describe('Optional maximum generation count.'),
      }),
    },
    ({ seed, mode, fuckAround, depth }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: [
              'Run a Lil Guys MCP Lab experiment now.',
              'Seed: ' + seed,
              'Mode: ' + mode,
              fuckAround ? 'Fuck-around level: ' + fuckAround : '',
              depth ? 'Maximum generations: ' + depth : '',
              '',
              'Before lab_start, use lab_catalog when useful to choose real Lil Guys / Reality / Composition / music mechanism / music recipe IDs. Prefer legible productive collisions over undifferentiated random soup. If I did not ask for a specific stack, choose a small diverse stack rather than forcing historical favorites.',
              'Start with lab_start using selectionMode=assistant unless I explicitly ask to choose survivors myself.',
              'Then conduct the experiment by repeatedly using lab_generate_generation, inspecting results, selecting survivors according to the named recipe, and calling lab_next_move.',
              'Do not ask me to copy/paste intermediate material.',
              'Do not assign fake numerical art-quality scores. Preserve meaningful diversity and record why each survivor was kept.',
              'When the stop rule or configured depth is reached, call lab_finish and lab_export_suno.',
              'The final deliverable is the small set of Suno-ready STYLE / LYRICS / CAPTION packages, plus a short lineage summary.',
            ]
              .filter(Boolean)
              .join('\n'),
          },
        },
      ],
    }),
  );

  return server;
}
