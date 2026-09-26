import type { MusicControls, RealityChaosLevel } from '../types';
import { getRealityEngine } from '../data/realityEngines';
import { getCompositionEngine } from '../data/compositionEngines';
import { getMusicMechanism, getMusicSeedRecipe } from '../data/musicSeedSystem';
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

function collectMusicRefs(
  target: Map<string, number[]>,
  refs: StarterSeedMusicRef[] | undefined,
  intensity: number,
): void {
  if (!refs) return;
  refs.forEach((ref) => {
    const weighted = clamp((clamp(ref.strength) * intensity) / 100);
    const values = target.get(ref.id) || [];
    values.push(weighted);
    target.set(ref.id, values);
  });
}

function finalizeMusicRefs(target: Map<string, number[]>): StarterSeedMusicRef[] {
  return Array.from(target.entries()).map(([id, strengths]) => {
    const sorted = [...strengths].sort((a, b) => b - a);
    const strongest = sorted[0] || 0;
    const remainder = sorted.slice(1).reduce((sum, value) => sum + value, 0);
    return { id, strength: clamp(strongest + remainder * 0.3) };
  });
}

function dedupeStarterStack(stack: StarterSeedStackItem[]): StarterSeedStackItem[] {
  const strongest = new Map<string, StarterSeedStackItem>();
  stack.forEach((item) => {
    if (item.muted) return;
    const current = strongest.get(item.seedId);
    if (!current || clamp(item.intensity) > clamp(current.intensity)) {
      strongest.set(item.seedId, item);
    }
  });
  return Array.from(strongest.values());
}

function collisionDirective(
  jurisdiction: StarterSeedJurisdiction,
  seeds: StarterSeedDefinition[],
): string {
  const names = seeds.map((seed) => seed.name).join(' + ');
  const exclusiveOwners = seeds.filter((seed) => seed.collisionMode === 'exclusive');
  const protectedOwners = seeds.filter((seed) => seed.collisionMode === 'protect');

  if (exclusiveOwners.length > 1) {
    return (
      'JURISDICTION COLLISION [' + jurisdiction + ']: MULTIPLE EXCLUSIVE CLAIMS — ' +
      exclusiveOwners.map((seed) => seed.name).join(' + ') +
      '. Do not choose a winner by stack order. Partition this jurisdiction into explicit non-overlapping sub-scopes, roles, populations, or time windows so every exclusive claim remains exclusive inside its assigned scope.'
    );
  }

  if (exclusiveOwners.length === 1) {
    const exclusiveOwner = exclusiveOwners[0];
    return (
      'JURISDICTION COLLISION [' + jurisdiction + ']: ' +
      exclusiveOwner.name +
      ' claims this jurisdiction exclusively. Preserve its rule here; route pressure from ' +
      seeds.filter((seed) => seed.id !== exclusiveOwner.id).map((seed) => seed.name).join(' + ') +
      ' into other jurisdictions instead of averaging or silently overriding.'
    );
  }

  if (protectedOwners.length > 0) {
    const protectedNames = protectedOwners.map((seed) => seed.name).join(' + ');
    const others = seeds.filter((seed) => !protectedOwners.some((owner) => owner.id === seed.id));
    return (
      'JURISDICTION COLLISION [' + jurisdiction + ']: protected owners ' +
      protectedNames +
      ' supply invariants. Keep those invariants intact while ' +
      (others.length ? others.map((seed) => seed.name).join(' + ') : 'the remaining active systems') +
      ' acts around them. Do not average the rules.'
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

export function validateStarterSeedRegistryV2(
  definitions: StarterSeedDefinition[],
): StarterSeedValidationResult {
  const errors: string[] = [];
  const ids = new Set<string>();

  definitions.forEach((seed) => {
    if (seed.schemaVersion !== 1) errors.push(seed.id + ': unsupported schemaVersion ' + seed.schemaVersion);
    if (!seed.id.trim()) errors.push('starter seed has an empty id');
    if (ids.has(seed.id)) errors.push('duplicate starter seed id: ' + seed.id);
    ids.add(seed.id);

    if (!seed.name.trim()) errors.push(seed.id + ': empty name');
    if (!seed.description.trim()) errors.push(seed.id + ': empty description');
    if (!Number.isFinite(seed.defaultIntensity) || seed.defaultIntensity < 0 || seed.defaultIntensity > 100) {
      errors.push(seed.id + ': defaultIntensity must be a finite number from 0..100');
    }
    if (seed.owns.length === 0) errors.push(seed.id + ': must own at least one jurisdiction');
    if (seed.operators.length === 0) errors.push(seed.id + ': must contain at least one executable operator');

    if (seed.category === 'worldPackage' && !seed.worldFrame) {
      errors.push(seed.id + ': worldPackage requires worldFrame');
    }
    if (seed.worldFrame && !seed.worldFrame.invariant.trim()) {
      errors.push(seed.id + ': worldFrame invariant may not be empty');
    }

    const realityIds = seed.outputs?.realityEngineIds || [];
    realityIds.forEach((id) => {
      if (!getRealityEngine(id)) errors.push(seed.id + ': unknown Reality Engine id ' + id);
    });

    const compositionIds = seed.outputs?.compositionEngineIds || [];
    compositionIds.forEach((id) => {
      if (!getCompositionEngine(id)) errors.push(seed.id + ': unknown Composition Engine id ' + id);
    });

    (seed.outputs?.musicRecipeRefs || []).forEach((ref) => {
      if (!getMusicSeedRecipe(ref.id)) errors.push(seed.id + ': unknown Music Seed recipe id ' + ref.id);
    });
    (seed.outputs?.musicMechanismRefs || []).forEach((ref) => {
      if (!getMusicMechanism(ref.id)) errors.push(seed.id + ': unknown Music mechanism id ' + ref.id);
    });

    if (seed.category === 'instrumentPack') {
      const roles = seed.instrumentRoles || [];
      const roleIds = roles.map((role) => role.engineId);
      const uniqueRoleIds = new Set(roleIds);
      const uniqueCompositionIds = new Set(compositionIds);

      if (compositionIds.length === 0) errors.push(seed.id + ': instrumentPack requires compositionEngineIds');
      if (roles.length !== compositionIds.length) errors.push(seed.id + ': instrumentPack must assign one role per compositionEngineId');
      if (uniqueRoleIds.size !== roleIds.length) errors.push(seed.id + ': instrumentPack contains duplicate instrument role engine IDs');

      const missingRoles = Array.from(uniqueCompositionIds).filter((id) => !uniqueRoleIds.has(id));
      const extraRoles = Array.from(uniqueRoleIds).filter((id) => !uniqueCompositionIds.has(id));
      if (missingRoles.length) errors.push(seed.id + ': instrumentPack missing roles for ' + missingRoles.join(', '));
      if (extraRoles.length) errors.push(seed.id + ': instrumentPack roles reference unselected instruments ' + extraRoles.join(', '));
    }
  });

  return { valid: errors.length === 0, errors };
}

export function compileStarterSeedStackV2(
  registry: StarterSeedDefinition[],
  stack: StarterSeedStackItem[],
): CompiledStarterSeedStack {
  const registryMap = new Map(registry.map((seed) => [seed.id, seed]));
  const activeSeeds: CompiledStarterSeedStack['activeSeeds'] = [];

  const realityEngineIds: string[] = [];
  const compositionEngineIds: string[] = [];
  const recipeContributions = new Map<string, number[]>();
  const mechanismContributions = new Map<string, number[]>();
  const rawControlDeltas: Partial<Record<keyof MusicControls, number>> = {};

  const directives: string[] = [];
  const protectedInvariants: string[] = [];
  const forbiddenDrift: string[] = [];
  const eventCues: string[] = [];
  const jurisdictionOwners = new Map<StarterSeedJurisdiction, StarterSeedDefinition[]>();
  let realityChaos: RealityChaosLevel | undefined;

  dedupeStarterStack(stack).forEach((item) => {
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
          '; supporting cast=' +
          seed.worldFrame.supportingCast.join(', ') +
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
    collectMusicRefs(recipeContributions, seed.outputs?.musicRecipeRefs, intensity);
    collectMusicRefs(mechanismContributions, seed.outputs?.musicMechanismRefs, intensity);

    CONTROL_KEYS.forEach((key) => {
      const delta = seed.outputs?.musicControlDeltas?.[key];
      if (typeof delta !== 'number' || !Number.isFinite(delta)) return;
      rawControlDeltas[key] = (rawControlDeltas[key] || 0) + (delta * intensity) / 100;
    });

    realityChaos = maxRealityChaos(realityChaos, seed.outputs?.realityChaos);
  });

  const controlDeltas: Partial<Record<keyof MusicControls, number>> = {};
  CONTROL_KEYS.forEach((key) => {
    const value = rawControlDeltas[key];
    if (typeof value === 'number') controlDeltas[key] = Math.round(value);
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
    musicRecipeRefs: finalizeMusicRefs(recipeContributions),
    musicMechanismRefs: finalizeMusicRefs(mechanismContributions),
    musicControlDeltas: controlDeltas,
    realityChaos,
    directives: unique(directives),
    protectedInvariants: unique(protectedInvariants),
    forbiddenDrift: unique(forbiddenDrift),
    eventCues: unique(eventCues),
    collisions,
  };
}
