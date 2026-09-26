import type { MusicControls, RealityChaosLevel } from '../types';
import type {
  CompiledStarterSeedStack,
  StarterSeedCollision,
  StarterSeedDefinition,
  StarterSeedJurisdiction,
  StarterSeedMusicRef,
  StarterSeedStackItem,
  StarterSeedValidationResult,
} from './types';

const CONTROL_KEYS: Array<keyof MusicControls> = [
  'stemminess',
  'kineticDensity',
  'socialInfection',
  'coupling',
  'interruption',
  'anchorStrength',
  'castSize',
];

function clamp(value: number, min = 0, max = 100): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function mergeMusicRefs(
  target: Map<string, StarterSeedMusicRef>,
  refs: StarterSeedMusicRef[] | undefined,
  intensity: number,
): void {
  if (!refs) return;

  refs.forEach((ref) => {
    const weighted = clamp((clamp(ref.strength) * intensity) / 100);
    const existing = target.get(ref.id);
    if (!existing) {
      target.set(ref.id, { id: ref.id, strength: weighted });
      return;
    }

    // Reinforcement is intentionally sublinear so stacking duplicate genes
    // strengthens a mechanism without instantly pinning it to 100.
    const strongest = Math.max(existing.strength, weighted);
    const remainder = Math.min(existing.strength, weighted);
    existing.strength = clamp(strongest + remainder * 0.3);
  });
}

function collisionDirective(
  jurisdiction: StarterSeedJurisdiction,
  seeds: StarterSeedDefinition[],
): string {
  const names = seeds.map((seed) => seed.name).join(' + ');
  const protectedOwner = seeds.find((seed) => seed.collisionMode === 'protect');
  const exclusiveOwner = seeds.find((seed) => seed.collisionMode === 'exclusive');

  if (exclusiveOwner) {
    return (
      'JURISDICTION COLLISION [' + jurisdiction + ']: ' +
      exclusiveOwner.name +
      ' claims this jurisdiction exclusively. Preserve its rule here; route the pressure from ' +
      seeds.filter((seed) => seed.id !== exclusiveOwner.id).map((seed) => seed.name).join(' + ') +
      ' into other jurisdictions instead of averaging or silently overriding.'
    );
  }

  if (protectedOwner) {
    return (
      'JURISDICTION COLLISION [' + jurisdiction + ']: ' +
      protectedOwner.name +
      ' supplies a protected invariant. Keep that invariant intact while ' +
      seeds.filter((seed) => seed.id !== protectedOwner.id).map((seed) => seed.name).join(' + ') +
      ' acts around it. Do not average the rules.'
    );
  }

  return (
    'JURISDICTION COLLISION [' + jurisdiction + ']: ' +
    names +
    ' all claim this dimension. DO NOT average them. Give each demand a distinct population, role, register, time-scale, section, or causal trigger and force the incompatible rules to negotiate while remaining audible.'
  );
}

function maxRealityChaos(
  current: RealityChaosLevel | undefined,
  next: RealityChaosLevel | undefined,
): RealityChaosLevel | undefined {
  if (!next) return current;
  if (!current) return next;
  return Math.max(current, next) as RealityChaosLevel;
}

export function validateStarterSeedRegistry(
  definitions: StarterSeedDefinition[],
): StarterSeedValidationResult {
  const errors: string[] = [];
  const ids = new Set<string>();

  definitions.forEach((seed) => {
    if (seed.schemaVersion !== 1) {
      errors.push(seed.id + ': unsupported schemaVersion ' + seed.schemaVersion);
    }
    if (!seed.id.trim()) errors.push('starter seed has an empty id');
    if (ids.has(seed.id)) errors.push('duplicate starter seed id: ' + seed.id);
    ids.add(seed.id);

    if (!seed.name.trim()) errors.push(seed.id + ': empty name');
    if (!seed.description.trim()) errors.push(seed.id + ': empty description');
    if (seed.defaultIntensity < 0 || seed.defaultIntensity > 100) {
      errors.push(seed.id + ': defaultIntensity must be 0..100');
    }
    if (seed.owns.length === 0) errors.push(seed.id + ': must own at least one jurisdiction');
    if (seed.operators.length === 0) errors.push(seed.id + ': must contain at least one executable operator');

    if (seed.category === 'worldPackage' && !seed.worldFrame) {
      errors.push(seed.id + ': worldPackage requires worldFrame');
    }
    if (seed.worldFrame && !seed.worldFrame.invariant.trim()) {
      errors.push(seed.id + ': worldFrame invariant may not be empty');
    }

    if (seed.category === 'instrumentPack') {
      const idsFromOutputs = seed.outputs?.compositionEngineIds || [];
      const roles = seed.instrumentRoles || [];
      if (idsFromOutputs.length === 0) {
        errors.push(seed.id + ': instrumentPack requires compositionEngineIds');
      }
      if (roles.length !== idsFromOutputs.length) {
        errors.push(seed.id + ': instrumentPack must assign one role per compositionEngineId');
      }
    }
  });

  return { valid: errors.length === 0, errors };
}

export function compileStarterSeedStack(
  registry: StarterSeedDefinition[],
  stack: StarterSeedStackItem[],
): CompiledStarterSeedStack {
  const registryMap = new Map(registry.map((seed) => [seed.id, seed]));
  const activeSeeds: CompiledStarterSeedStack['activeSeeds'] = [];

  const realityEngineIds: string[] = [];
  const compositionEngineIds: string[] = [];
  const recipeRefs = new Map<string, StarterSeedMusicRef>();
  const mechanismRefs = new Map<string, StarterSeedMusicRef>();
  const controlDeltas: Partial<Record<keyof MusicControls, number>> = {};

  const directives: string[] = [];
  const protectedInvariants: string[] = [];
  const forbiddenDrift: string[] = [];
  const eventCues: string[] = [];
  const jurisdictionOwners = new Map<StarterSeedJurisdiction, StarterSeedDefinition[]>();

  let realityChaos: RealityChaosLevel | undefined;

  stack.forEach((item) => {
    if (item.muted) return;
    const seed = registryMap.get(item.seedId);
    if (!seed) return;

    const intensity = clamp(item.intensity);
    activeSeeds.push({ seed, intensity, locked: item.locked });

    seed.owns.forEach((jurisdiction) => {
      const owners = jurisdictionOwners.get(jurisdiction) || [];
      owners.push(seed);
      jurisdictionOwners.set(jurisdiction, owners);
    });

    const prefix = seed.name + ' [' + intensity + '/100]';
    seed.operators.forEach((operator) => directives.push(prefix + ': ' + operator));
    (seed.outputs?.promptDirectives || []).forEach((directive) => directives.push(prefix + ': ' + directive));

    protectedInvariants.push(...seed.protects);
    forbiddenDrift.push(...seed.forbids);

    if (seed.worldFrame) {
      protectedInvariants.push(seed.worldFrame.invariant);
      eventCues.push(...seed.worldFrame.eventCues);
      directives.push(
        prefix +
          ': WORLD FRAME — ' +
          seed.worldFrame.setting +
          '; medium=' +
          seed.worldFrame.medium +
          '; primary=' +
          seed.worldFrame.primaryCharacter +
          '; recurring concern=' +
          seed.worldFrame.recurringConcern +
          '.'
      );
    }

    if (seed.instrumentRoles) {
      seed.instrumentRoles.forEach((role) => {
        directives.push(prefix + ': INSTRUMENT ROLE — ' + role.engineId + ' owns ' + role.jurisdiction + ': ' + role.role);
      });
    }

    realityEngineIds.push(...(seed.outputs?.realityEngineIds || []));
    compositionEngineIds.push(...(seed.outputs?.compositionEngineIds || []));

    mergeMusicRefs(recipeRefs, seed.outputs?.musicRecipeRefs, intensity);
    mergeMusicRefs(mechanismRefs, seed.outputs?.musicMechanismRefs, intensity);

    CONTROL_KEYS.forEach((key) => {
      const delta = seed.outputs?.musicControlDeltas?.[key];
      if (typeof delta !== 'number' || !Number.isFinite(delta)) return;
      const weighted = (delta * intensity) / 100;
      controlDeltas[key] = Math.round((controlDeltas[key] || 0) + weighted);
    });

    realityChaos = maxRealityChaos(realityChaos, seed.outputs?.realityChaos);
  });

  const collisions: StarterSeedCollision[] = [];
  jurisdictionOwners.forEach((owners, jurisdiction) => {
    const uniqueOwners = Array.from(new Map(owners.map((seed) => [seed.id, seed])).values());
    if (uniqueOwners.length < 2) return;

    const directive = collisionDirective(jurisdiction, uniqueOwners);
    collisions.push({
      jurisdiction,
      seedIds: uniqueOwners.map((seed) => seed.id),
      seedNames: uniqueOwners.map((seed) => seed.name),
      directive,
    });
    directives.push(directive);
  });

  return {
    activeSeeds,
    realityEngineIds: unique(realityEngineIds),
    compositionEngineIds: unique(compositionEngineIds),
    musicRecipeRefs: Array.from(recipeRefs.values()),
    musicMechanismRefs: Array.from(mechanismRefs.values()),
    musicControlDeltas: controlDeltas,
    realityChaos,
    directives: unique(directives),
    protectedInvariants: unique(protectedInvariants),
    forbiddenDrift: unique(forbiddenDrift),
    eventCues: unique(eventCues),
    collisions,
  };
}
