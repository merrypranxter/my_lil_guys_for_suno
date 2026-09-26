import { DEFAULT_MUSIC_CONTROLS } from '../data/musicSeedSystem';
import { getRealityEngine } from '../data/realityEngines';
import { getCompositionEngine } from '../data/compositionEngines';
import type { MusicControls, MusicStackItem, RealityChaosLevel } from '../types';
import { STARTER_SEEDS } from './library';
import { compileStarterSeedStackV2 } from './compilerV2';
import type { CompiledStarterSeedStack, StarterSeedStackItem } from './types';

const STORAGE_KEY = 'lgm_starter_seed_stack_v1';
const STARTER_INSTANCE_PREFIX = 'starter-seed:';

function clamp100(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function normalizeStarterSeedStack(value: unknown): StarterSeedStackItem[] {
  if (!Array.isArray(value)) return [];
  const known = new Set(STARTER_SEEDS.map((seed) => seed.id));
  const strongest = new Map<string, StarterSeedStackItem>();

  value.slice(0, 24).forEach((raw: any, index) => {
    if (!raw || typeof raw !== 'object') return;
    const seedId = typeof raw.seedId === 'string' ? raw.seedId : '';
    if (!known.has(seedId)) return;

    const item: StarterSeedStackItem = {
      instanceId:
        typeof raw.instanceId === 'string' && raw.instanceId.trim()
          ? raw.instanceId.slice(0, 160)
          : 'starter_' + index + '_' + seedId,
      seedId,
      intensity: clamp100(Number(raw.intensity)),
      muted: Boolean(raw.muted),
      locked: Boolean(raw.locked),
    };

    const current = strongest.get(seedId);
    if (!current || item.intensity > current.intensity) strongest.set(seedId, item);
  });

  return Array.from(strongest.values());
}

export function createStarterSeedStackItem(seedId: string): StarterSeedStackItem | undefined {
  const seed = STARTER_SEEDS.find((item) => item.id === seedId);
  if (!seed) return undefined;
  return {
    instanceId: 'starter_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    seedId,
    intensity: seed.defaultIntensity,
    muted: false,
    locked: seed.category === 'worldPackage',
  };
}

export function getLastStarterSeedStack(): StarterSeedStackItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return normalizeStarterSeedStack(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return [];
  }
}

export function setLastStarterSeedStack(stack: StarterSeedStackItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeStarterSeedStack(stack)));
  } catch {
    // Browser storage can be unavailable in restricted contexts.
  }
}

export interface StarterSeedApplyState {
  realityEngineIds: string[];
  compositionEngineIds: string[];
  musicStack: MusicStackItem[];
  musicControls: MusicControls;
  realityChaos: RealityChaosLevel;
}

export interface StarterSeedApplyResult extends StarterSeedApplyState {
  compiled: CompiledStarterSeedStack;
}

export function applyStarterSeedStackToLab(
  stackValue: StarterSeedStackItem[],
  current: StarterSeedApplyState,
): StarterSeedApplyResult {
  const stack = normalizeStarterSeedStack(stackValue);
  const compiled = compileStarterSeedStackV2(STARTER_SEEDS, stack);

  const emittedReality = compiled.realityEngineIds
    .map((id) => getRealityEngine(id))
    .filter((engine): engine is NonNullable<ReturnType<typeof getRealityEngine>> => Boolean(engine));
  const touchedRealityDimensions = new Set(emittedReality.map((engine) => engine.dimension));
  const realityEngineIds = [
    ...current.realityEngineIds.filter((id) => {
      const engine = getRealityEngine(id);
      return !engine || !touchedRealityDimensions.has(engine.dimension);
    }),
    ...compiled.realityEngineIds,
  ].filter((id, index, all) => all.indexOf(id) === index);

  const emittedComposition = compiled.compositionEngineIds
    .map((id) => getCompositionEngine(id))
    .filter((engine): engine is NonNullable<ReturnType<typeof getCompositionEngine>> => Boolean(engine));
  const touchedCompositionDimensions = new Set(emittedComposition.map((engine) => engine.dimension));
  const compositionEngineIds = [
    ...current.compositionEngineIds.filter((id) => {
      const engine = getCompositionEngine(id);
      return !engine || !touchedCompositionDimensions.has(engine.dimension);
    }),
    ...compiled.compositionEngineIds,
  ].filter((id, index, all) => all.indexOf(id) === index);

  const preservedMusic = current.musicStack.filter(
    (item) => !item.instanceId.startsWith(STARTER_INSTANCE_PREFIX),
  );
  const emittedMusic: MusicStackItem[] = [
    ...compiled.musicRecipeRefs.map((ref) => ({
      instanceId: STARTER_INSTANCE_PREFIX + 'recipe:' + ref.id,
      kind: 'recipe' as const,
      refId: ref.id,
      muted: false,
      locked: false,
      strength: ref.strength,
    })),
    ...compiled.musicMechanismRefs.map((ref) => ({
      instanceId: STARTER_INSTANCE_PREFIX + 'mechanism:' + ref.id,
      kind: 'mechanism' as const,
      refId: ref.id,
      muted: false,
      locked: false,
      strength: ref.strength,
    })),
  ];

  const musicControls: MusicControls = { ...current.musicControls };
  (Object.keys(compiled.musicControlDeltas) as Array<keyof MusicControls>).forEach((key) => {
    const delta = compiled.musicControlDeltas[key];
    if (typeof delta !== 'number') return;
    musicControls[key] = clamp100(DEFAULT_MUSIC_CONTROLS[key] + delta);
  });

  return {
    compiled,
    realityEngineIds,
    compositionEngineIds,
    musicStack: [...preservedMusic, ...emittedMusic],
    musicControls,
    realityChaos: compiled.realityChaos || current.realityChaos,
  };
}

export function starterSeedPromptBlock(stackValue: StarterSeedStackItem[]): string {
  const stack = normalizeStarterSeedStack(stackValue);
  if (!stack.length) return 'NO STARTER SEED STACK ACTIVE.';
  const compiled = compileStarterSeedStackV2(STARTER_SEEDS, stack);
  const lines = [
    'STARTER SEEDS ARE INITIAL-CONDITION LAWS. They may shape affect, perception, motion, social behavior, instrumentation roles, or semantic world framing, but they may not replace the sovereign user subject.',
    ...compiled.activeSeeds.map(({ seed, intensity, locked }) =>
      '[' + seed.category.toUpperCase() + ' — ' + seed.name + ' | ' + intensity + '/100' + (locked ? ' | LOCKED' : '') + '] ' + seed.description
    ),
    ...(compiled.directives.length ? ['OPERATORS:', ...compiled.directives.map((line) => '- ' + line)] : []),
    ...(compiled.protectedInvariants.length
      ? ['PROTECTED INVARIANTS:', ...compiled.protectedInvariants.map((line) => '- ' + line)]
      : []),
    ...(compiled.forbiddenDrift.length
      ? ['FORBIDDEN DRIFT:', ...compiled.forbiddenDrift.map((line) => '- ' + line)]
      : []),
    ...(compiled.eventCues.length
      ? ['WORLD EVENT CUES:', ...compiled.eventCues.map((line) => '- ' + line)]
      : []),
  ];
  return lines.join('\n');
}
