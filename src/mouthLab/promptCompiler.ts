import {
  MouthCompiledPrompt,
  MouthGenome,
  MouthPromptCompileOptions,
  MouthPromptMode,
  MouthQuirkInstance,
  MouthSemanticMode,
  MouthTraitPressure,
} from './types';
import { getMouthDonor } from './donors';
import { getMouthTrait } from './traits';
import { getMouthQuirkDefinition } from './quirks';
import { projectMouthPhenotype } from './phenotype';
import { clampMouthControl } from './determinism';

const VALID_AXES = new Set([
  'semantics',
  'lexicon',
  'morphology',
  'syntax',
  'consonants',
  'vowels',
  'phonotactics',
  'syllableStructure',
  'airflow',
  'larynx',
  'phonation',
  'tone',
  'stress',
  'prosody',
  'timing',
  'orthography',
]);

function cleanText(value: unknown, max = 500): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function pressureWeight(pressure: MouthTraitPressure): number {
  return {
    low: 1,
    medium: 2,
    high: 3,
    obsessive: 4,
  }[pressure];
}

function pressureLabel(pressure: MouthTraitPressure): string {
  return pressure === 'obsessive'
    ? 'OBSESSIVE — global law; reinforce repeatedly and do not let it fade into occasional flavor'
    : pressure === 'high'
      ? 'HIGH — clearly audible and consistently enforced'
      : pressure === 'medium'
        ? 'MEDIUM — recurrent and identifiable'
        : 'LOW — subtle, bounded influence';
}

function donorName(donorId?: string): string {
  if (!donorId) return 'UNASSIGNED';
  return getMouthDonor(donorId)?.name || donorId;
}

function traitName(traitId: string): string {
  return getMouthTrait(traitId)?.name || traitId;
}

function quirkName(quirkId: string): string {
  return getMouthQuirkDefinition(quirkId)?.name || quirkId;
}

function sanitizeQuirk(instance: any): MouthQuirkInstance | undefined {
  if (!instance || typeof instance !== 'object') return undefined;
  const definition = getMouthQuirkDefinition(String(instance.quirkId || ''));
  if (!definition) return undefined;

  const takeoverMode = [
    'constant',
    'instant',
    'gradual',
    'stepwise',
    'eventTriggered',
    'oscillating',
    'oneWay',
  ].includes(instance.takeover?.mode)
    ? instance.takeover.mode
    : definition.defaultTakeover.mode;

  return {
    id: cleanText(instance.id, 140) || 'quirk_instance_' + definition.id,
    quirkId: definition.id,
    enabled: instance.enabled !== false,
    frequency: clampMouthControl(instance.frequency, definition.defaultFrequency),
    consistency: clampMouthControl(instance.consistency, definition.defaultConsistency),
    exaggeration: clampMouthControl(instance.exaggeration, definition.defaultExaggeration),
    takeover: {
      mode: takeoverMode,
      startPercent: clampMouthControl(
        instance.takeover?.startPercent,
        definition.defaultTakeover.startPercent,
      ),
      endPercent: clampMouthControl(
        instance.takeover?.endPercent,
        definition.defaultTakeover.endPercent,
      ),
      steps:
        takeoverMode === 'stepwise'
          ? Math.max(2, Math.min(12, Number(instance.takeover?.steps) || definition.defaultTakeover.steps || 4))
          : undefined,
      trigger: cleanText(instance.takeover?.trigger || instance.trigger, 220) || undefined,
    },
    trigger: cleanText(instance.trigger || instance.takeover?.trigger, 220) || undefined,
    linkedTraitIds: Array.from(
      new Set(
        (Array.isArray(instance.linkedTraitIds) ? instance.linkedTraitIds : [])
          .map((id: unknown) => String(id))
          .filter((id: string) => Boolean(getMouthTrait(id))),
      ),
    ).sort(),
    createdAt: Number.isFinite(instance.createdAt) ? Number(instance.createdAt) : Date.now(),
  };
}

export function normalizeMouthGenomeForGeneration(value: unknown): MouthGenome | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as any;

  const parentDonorIds = Array.from(
    new Set(
      (Array.isArray(raw.parentDonorIds) ? raw.parentDonorIds : [])
        .map((id: unknown) => String(id))
        .filter((id: string) => Boolean(getMouthDonor(id))),
    ),
  ).slice(0, 6);

  if (parentDonorIds.length < 2) return undefined;

  const assignments = (Array.isArray(raw.assignments) ? raw.assignments : [])
    .map((assignment: any) => {
      const axis = String(assignment?.axis || '');
      if (!VALID_AXES.has(axis)) return undefined;

      const donorId = assignment?.donorId && getMouthDonor(String(assignment.donorId))
        ? String(assignment.donorId)
        : undefined;

      const traitIds = Array.from(
        new Set(
          (Array.isArray(assignment?.traitIds) ? assignment.traitIds : [])
            .map((id: unknown) => String(id))
            .filter((id: string) => {
              const trait = getMouthTrait(id);
              if (!trait) return false;
              if (!trait.axes.includes(axis as any)) return false;
              if (donorId) {
                const donor = getMouthDonor(donorId);
                if (donor && !donor.traitIds.includes(id)) return false;
              }
              return true;
            }),
        ),
      ).sort();

      if (!traitIds.length && axis !== 'semantics') return undefined;

      const pressure: MouthTraitPressure = ['low', 'medium', 'high', 'obsessive'].includes(assignment?.pressure)
        ? assignment.pressure
        : 'medium';

      return {
        axis: axis as any,
        donorId,
        traitIds,
        pressure,
        locked: assignment?.locked === true,
      };
    })
    .filter(Boolean);

  if (!assignments.length) return undefined;

  const quirks = (Array.isArray(raw.quirks) ? raw.quirks : [])
    .map((item: any) => sanitizeQuirk(item))
    .filter((item: MouthQuirkInstance | undefined): item is MouthQuirkInstance => Boolean(item));

  const mutationScars = (Array.isArray(raw.mutationScars) ? raw.mutationScars : [])
    .slice(0, 16)
    .map((scar: any) => ({
      id: cleanText(scar?.id, 140) || 'mouth_scar_external',
      sourceOperation: ['gene-knockout', 'quirk-removal', 'specimen-application', 'manual'].includes(scar?.sourceOperation)
        ? scar.sourceOperation
        : 'manual',
      removedTraitIds: Array.from(
        new Set(
          (Array.isArray(scar?.removedTraitIds) ? scar.removedTraitIds : [])
            .map((id: unknown) => String(id))
            .filter((id: string) => Boolean(getMouthTrait(id))),
        ),
      ).sort(),
      removedQuirkIds: Array.from(
        new Set(
          (Array.isArray(scar?.removedQuirkIds) ? scar.removedQuirkIds : [])
            .map((id: unknown) => String(id))
            .filter((id: string) => Boolean(getMouthQuirkDefinition(id))),
        ),
      ).sort(),
      residualRule: cleanText(scar?.residualRule, 420),
      strength: clampMouthControl(scar?.strength, 25),
      createdAt: Number.isFinite(scar?.createdAt) ? Number(scar.createdAt) : Date.now(),
    }))
    .filter((scar: any) => scar.residualRule || scar.removedTraitIds.length || scar.removedQuirkIds.length);

  const linkedGeneBundles = (Array.isArray(raw.linkedGeneBundles) ? raw.linkedGeneBundles : [])
    .slice(0, 16)
    .map((bundle: any) => ({
      id: cleanText(bundle?.id, 140) || 'mouth_bundle_external',
      name: cleanText(bundle?.name, 160) || 'LINKED GENES',
      traitIds: Array.from(
        new Set(
          (Array.isArray(bundle?.traitIds) ? bundle.traitIds : [])
            .map((id: unknown) => String(id))
            .filter((id: string) => Boolean(getMouthTrait(id))),
        ),
      ).sort(),
      quirkIds: Array.from(
        new Set(
          (Array.isArray(bundle?.quirkIds) ? bundle.quirkIds : [])
            .map((id: unknown) => String(id))
            .filter((id: string) => Boolean(getMouthQuirkDefinition(id))),
        ),
      ).sort(),
      lockedTogether: bundle?.lockedTogether !== false,
      note: cleanText(bundle?.note, 360),
      createdAt: Number.isFinite(bundle?.createdAt) ? Number(bundle.createdAt) : Date.now(),
    }))
    .filter((bundle: any) => bundle.traitIds.length || bundle.quirkIds.length);

  return {
    id: cleanText(raw.id, 180) || 'mouth_external',
    name: cleanText(raw.name, 180) || 'MOUTH LAB GENOME',
    parentDonorIds,
    assignments: assignments as MouthGenome['assignments'],
    objectiveId: cleanText(raw.objectiveId, 180) || undefined,
    semanticAnchorLanguageProfileId: cleanText(raw.semanticAnchorLanguageProfileId, 180) || undefined,
    intelligibility: clampMouthControl(raw.intelligibility, 82),
    stability: clampMouthControl(raw.stability, 72),
    mutation: clampMouthControl(raw.mutation, 35),
    breedingSeed: cleanText(raw.breedingSeed, 240) || 'normalized-mouth-seed',
    quirks,
    mutationScars,
    linkedGeneBundles,
    createdAt: Number.isFinite(raw.createdAt) ? Number(raw.createdAt) : Date.now(),
  };
}

function semanticModeFor(
  genome: MouthGenome,
  requested: MouthSemanticMode | undefined,
): MouthSemanticMode {
  if (requested === 'englishMeaningAlienMouth') return requested;
  return 'inherit';
}

function semanticPolicy(genome: MouthGenome, mode: MouthSemanticMode): string {
  if (mode === 'englishMeaningAlienMouth') {
    return [
      'ENGLISH MEANING / ALIEN MOUTH:',
      'Keep semantic propositions and lexical targets in intelligible English.',
      'English owns meaning, not mouth mechanics.',
      'Pronunciation, consonants, vowels, timing, tone, phonation, phonotactics, and morphology may be governed by the selected Mouth Lab traits.',
      'Do not translate the lyrics into donor languages merely because their traits are active.',
      'Do not fabricate fluent-looking donor-language words or claim the hybrid output is authentic speech in a donor language.',
      'When a morphology trait acts on English, treat it as a structural mutation pressure on English material.',
    ].join(' ');
  }

  const anchor = genome.semanticAnchorLanguageProfileId
    ? 'Semantic anchor profile: ' + genome.semanticAnchorLanguageProfileId + '.'
    : 'No explicit semantic-anchor language is locked.';

  return anchor + ' Mouth mechanics may transform pronunciation and structure only within the genome jurisdictions.';
}

function takeoverText(instance: MouthQuirkInstance): string {
  const curve = instance.takeover;
  if (curve.mode === 'constant') return 'active throughout';
  if (curve.mode === 'instant') return 'switches on abruptly';
  if (curve.mode === 'gradual') return 'spreads gradually from ' + curve.startPercent + '% to ' + curve.endPercent + '%';
  if (curve.mode === 'stepwise') return 'spreads in ' + (curve.steps || 4) + ' steps from ' + curve.startPercent + '% to ' + curve.endPercent + '%';
  if (curve.mode === 'eventTriggered') return 'activates when ' + (instance.trigger || curve.trigger || 'the configured event occurs');
  if (curve.mode === 'oscillating') return 'oscillates between low and high expression';
  return 'once activated, takeover moves one way and does not reset';
}

function traitDirective(
  traitId: string,
  donorId: string | undefined,
  pressure: MouthTraitPressure,
): string {
  const trait = getMouthTrait(traitId);
  if (!trait) return '';

  return (
    trait.name +
    ' ← ' +
    donorName(donorId) +
    ': ' +
    trait.operation +
    ' Pressure=' +
    pressureLabel(pressure) +
    '.'
  );
}

function quirkDirective(instance: MouthQuirkInstance): string {
  const definition = getMouthQuirkDefinition(instance.quirkId);
  if (!definition) return '';

  return (
    definition.name +
    ': target=' +
    definition.target +
    '; rule=' +
    definition.transformation +
    '; frequency=' +
    instance.frequency +
    '/100; consistency=' +
    instance.consistency +
    '/100; exaggeration=' +
    instance.exaggeration +
    '/100; takeover=' +
    takeoverText(instance) +
    '.'
  );
}

function pressureReinforcementLines(genome: MouthGenome): string[] {
  const lines: string[] = [];

  for (const assignment of genome.assignments) {
    for (const traitId of assignment.traitIds) {
      if (assignment.pressure === 'obsessive') {
        lines.push(
          'OBSESSIVE ENFORCEMENT: ' +
            traitName(traitId) +
            ' is a global law. Repeat its requirement in performance decisions, preserve it through section changes, and do not let the model reduce it to occasional flavor.',
        );
      } else if (assignment.pressure === 'high') {
        lines.push(
          'HIGH ENFORCEMENT: ' +
            traitName(traitId) +
            ' must remain clearly audible across multiple sections.',
        );
      }
    }
  }

  for (const quirk of genome.quirks) {
    if (!quirk.enabled) continue;
    if (quirk.consistency >= 90 && quirk.frequency >= 90) {
      lines.push(
        'PATHOLOGICAL CONSISTENCY: ' +
          quirkName(quirk.quirkId) +
          ' should fire on virtually every eligible target; exceptions must be rare and structurally motivated.',
      );
    }
  }

  return lines;
}

function linkedBundleLines(genome: MouthGenome): string[] {
  return genome.linkedGeneBundles
    .filter((bundle) => bundle.lockedTogether)
    .map((bundle) => {
      const traits = bundle.traitIds.map(traitName);
      const quirks = bundle.quirkIds.map(quirkName);
      return (
        'LINKED GENE BUNDLE: keep together [' +
        [...traits, ...quirks].join(' + ') +
        ']. Do not preserve one while silently dropping the rest.'
      );
    });
}

function scarLines(genome: MouthGenome): string[] {
  return genome.mutationScars
    .filter((scar) => scar.strength > 0 && scar.residualRule)
    .map(
      (scar) =>
        'MUTATION SCAR ' +
        scar.strength +
        '/100: ' +
        scar.residualRule,
    );
}

function interactionLines(genome: MouthGenome): string[] {
  const phenotype = projectMouthPhenotype(genome);
  return phenotype.interactions
    .filter((interaction) => interaction.severity >= 3)
    .slice(0, 8)
    .map(
      (interaction) =>
        interaction.relationship.toUpperCase() +
        ' — ' +
        traitName(interaction.traitAId) +
        ' × ' +
        traitName(interaction.traitBId) +
        ': ' +
        interaction.resolutionLaw,
    );
}

function compactText(genome: MouthGenome, mode: MouthSemanticMode): string {
  const assignments = genome.assignments
    .flatMap((assignment) =>
      assignment.traitIds.map(
        (traitId) =>
          assignment.axis.toUpperCase() +
          '=' +
          traitName(traitId) +
          ' from ' +
          donorName(assignment.donorId) +
          ' [' +
          assignment.pressure.toUpperCase() +
          ']',
      ),
    )
    .join('; ');

  const quirks = genome.quirks
    .filter((quirk) => quirk.enabled)
    .map(
      (quirk) =>
        quirkName(quirk.quirkId) +
        ' F' +
        quirk.frequency +
        '/C' +
        quirk.consistency +
        '/X' +
        quirk.exaggeration,
    )
    .join('; ');

  return [
    mode === 'englishMeaningAlienMouth'
      ? 'ENGLISH MEANING / ALIEN MOUTH: English semantics remain intelligible; donor languages control mouth mechanics only.'
      : semanticPolicy(genome, mode),
    assignments,
    quirks ? 'QUIRKS: ' + quirks : '',
    'Controls: intelligibility=' +
      genome.intelligibility +
      '; stability=' +
      genome.stability +
      '; mutation=' +
      genome.mutation +
      '.',
  ]
    .filter(Boolean)
    .join(' ');
}

function bracketedText(genome: MouthGenome, mode: MouthSemanticMode): string {
  const lines: string[] = [
    '[MOUTH LAB — ACTIVE VOCAL GENOME]',
    '[SEMANTIC POLICY: ' + semanticPolicy(genome, mode) + ']',
    '[GLOBAL CONTROLS: intelligibility=' +
      genome.intelligibility +
      '/100; stability=' +
      genome.stability +
      '/100; mutation=' +
      genome.mutation +
      '/100]',
  ];

  for (const assignment of genome.assignments) {
    if (!assignment.traitIds.length && assignment.axis === 'semantics') {
      lines.push(
        '[SEMANTICS: anchor=' +
          (genome.semanticAnchorLanguageProfileId || donorName(assignment.donorId)) +
          ']',
      );
      continue;
    }

    for (const traitId of assignment.traitIds) {
      lines.push(
        '[' +
          assignment.axis.toUpperCase() +
          ' JURISDICTION: ' +
          traitDirective(traitId, assignment.donorId, assignment.pressure) +
          ']',
      );
    }
  }

  for (const quirk of genome.quirks.filter((item) => item.enabled)) {
    lines.push('[QUIRK: ' + quirkDirective(quirk) + ']');
  }

  for (const line of pressureReinforcementLines(genome)) {
    lines.push('[ENFORCEMENT: ' + line + ']');
  }

  for (const line of interactionLines(genome)) {
    lines.push('[TRAIT NEGOTIATION: ' + line + ']');
  }

  for (const line of linkedBundleLines(genome)) {
    lines.push('[' + line + ']');
  }

  for (const line of scarLines(genome)) {
    lines.push('[' + line + ']');
  }

  lines.push(
    '[ANTI-CARICATURE: transplant operational phonetic/morphological mechanisms only. Do not invent personality, ethnicity, intelligence, social class, or comedy from a donor language. Do not use fake eye-dialect as the main representation.]',
  );

  return lines.join('\n');
}

function descriptiveText(genome: MouthGenome, mode: MouthSemanticMode): string {
  const clauses = genome.assignments.flatMap((assignment) =>
    assignment.traitIds.map((traitId) => {
      const trait = getMouthTrait(traitId);
      if (!trait) return '';
      return (
        donorName(assignment.donorId) +
        '-derived ' +
        trait.name.toLowerCase() +
        ' governs ' +
        assignment.axis +
        ', with ' +
        assignment.pressure +
        ' pressure'
      );
    }),
  );

  const quirkClauses = genome.quirks
    .filter((quirk) => quirk.enabled)
    .map((quirk) => {
      const def = getMouthQuirkDefinition(quirk.quirkId);
      return def
        ? def.name.toLowerCase() +
            ' targets ' +
            def.target +
            ' at ' +
            quirk.consistency +
            '% consistency'
        : '';
    })
    .filter(Boolean);

  return (
    semanticPolicy(genome, mode) +
    ' Build the vocal organism so ' +
    clauses.filter(Boolean).join('; ') +
    (quirkClauses.length ? '. Superimpose these bounded mutations: ' + quirkClauses.join('; ') : '') +
    '. Preserve separate jurisdictions and expose conflicts procedurally instead of averaging them into a generic accent.'
  );
}

function styleDirectives(genome: MouthGenome, mode: MouthSemanticMode): string {
  const phenotype = projectMouthPhenotype(genome);
  const priorities = phenotype.audiblePriority.slice(0, 5).map((id) =>
    id.startsWith('quirk:')
      ? quirkName(id.slice('quirk:'.length))
      : traitName(id),
  );

  return [
    '[MOUTH LAB STYLE PRIORITY: ' + (priorities.join(' > ') || 'none') + ']',
    '[MOUTH LAB SEMANTICS: ' + semanticPolicy(genome, mode) + ']',
    '[MOUTH LAB PERFORMANCE: preserve separate mouth jurisdictions; high/obsessive traits must remain audible across section changes; conflict rules create events rather than mush.]',
  ].join(' ');
}

function lyricsDirectives(genome: MouthGenome, mode: MouthSemanticMode): string {
  const parts = [
    '[MOUTH LAB CONTROL]',
    '[' + semanticPolicy(genome, mode) + ']',
    ...genome.assignments.flatMap((assignment) =>
      assignment.traitIds.map(
        (traitId) =>
          '[' +
          assignment.axis.toUpperCase() +
          ': ' +
          traitDirective(traitId, assignment.donorId, assignment.pressure) +
          ']',
      ),
    ),
    ...genome.quirks
      .filter((quirk) => quirk.enabled)
      .map((quirk) => '[QUIRK: ' + quirkDirective(quirk) + ']'),
    ...pressureReinforcementLines(genome).map((line) => '[ENFORCEMENT: ' + line + ']'),
    ...interactionLines(genome).map((line) => '[NEGOTIATION: ' + line + ']'),
    ...scarLines(genome).map((line) => '[' + line + ']'),
  ];

  return parts.join('\n');
}

export function compileMouthPrompt(
  rawGenome: MouthGenome | unknown,
  options: MouthPromptCompileOptions = {},
): MouthCompiledPrompt {
  const genome = normalizeMouthGenomeForGeneration(rawGenome);
  if (!genome) {
    throw new Error('Invalid Mouth Lab genome for prompt compilation.');
  }

  const mode: MouthPromptMode = options.mode || 'bracketed';
  const semanticMode = semanticModeFor(genome, options.semanticMode);
  const phenotype = projectMouthPhenotype(genome);

  const text =
    mode === 'compact'
      ? compactText(genome, semanticMode)
      : mode === 'descriptive'
        ? descriptiveText(genome, semanticMode)
        : bracketedText(genome, semanticMode);

  return {
    mode,
    semanticMode,
    text,
    styleDirectives: styleDirectives(genome, semanticMode),
    lyricsDirectives: lyricsDirectives(genome, semanticMode),
    summary:
      phenotype.summary +
      ' Mouth Lab prompt mode=' +
      mode +
      '; semantic mode=' +
      semanticMode +
      '.',
    activeTraitIds: Array.from(
      new Set(genome.assignments.flatMap((assignment) => assignment.traitIds)),
    ).sort(),
    activeQuirkIds: Array.from(
      new Set(genome.quirks.filter((quirk) => quirk.enabled).map((quirk) => quirk.quirkId)),
    ).sort(),
    warnings: [...phenotype.warnings],
  };
}
