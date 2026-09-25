import {
  MusicBredGenome,
  MusicControls,
  MusicStackItem,
  PetriDishChallenge,
  PetriDishExperiment,
  PetriDishParentSnapshot,
  PetriDishResult,
  PetriDishSibling,
} from '../types';
import { normalizeMusicControls, normalizeMusicGenome, normalizeMusicStack } from '../data/musicSeedSystem';
import { breedMusicGenome, genomeToStackItem, MusicBreedingParent } from './musicBreeding';

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function cleanString(value: unknown, fallback = '', max = 500): string {
  return typeof value === 'string' ? value.slice(0, max) : fallback;
}

function normalizeFingerprint(value: any) {
  if (!value || typeof value !== 'object') return undefined;
  return {
    genreFamily: cleanString(value.genreFamily, '', 300),
    harmony: cleanString(value.harmony, '', 300),
    melody: cleanString(value.melody, '', 300),
    rhythm: cleanString(value.rhythm, '', 300),
    timbre: cleanString(value.timbre, '', 300),
    vocal: cleanString(value.vocal, '', 300),
    performance: cleanString(value.performance, '', 300),
    production: cleanString(value.production, '', 300),
  };
}

export function toParentSnapshot(parent: MusicBreedingParent): PetriDishParentSnapshot {
  return {
    ref: { ...parent.ref },
    mechanismIds: [...parent.mechanismIds],
    controls: normalizeMusicControls(parent.controls),
  };
}

export function snapshotToBreedingParent(snapshot: PetriDishParentSnapshot): MusicBreedingParent {
  return {
    ref: { ...snapshot.ref },
    mechanismIds: [...snapshot.mechanismIds],
    controls: normalizeMusicControls(snapshot.controls),
  };
}

export function createSiblingGenomes(
  parentA: MusicBreedingParent,
  parentB: MusicBreedingParent,
  familySeed: string,
  count: number
): MusicBredGenome[] {
  const siblingCount = clampInt(count, 2, 6, 4);
  const root = familySeed.trim() || 'dish-' + Date.now().toString(36);
  const genomes: MusicBredGenome[] = [];

  for (let index = 0; index < siblingCount; index += 1) {
    const breedingSeed = root + ':sibling:' + String(index + 1).padStart(2, '0');
    const genome = breedMusicGenome(parentA, parentB, breedingSeed);
    genomes.push({
      ...genome,
      name: genome.name + ' #' + (index + 1),
    });
  }

  return genomes;
}

export function baseMechanismEnvironment(stack: MusicStackItem[]): MusicStackItem[] {
  return normalizeMusicStack(stack)
    .filter((item) => item.kind === 'mechanism')
    .map((item) => ({ ...item }));
}

export function buildSiblingMusicStack(
  baseStack: MusicStackItem[],
  genome: MusicBredGenome,
  strength = 88
): MusicStackItem[] {
  const environment = baseMechanismEnvironment(baseStack);
  return [...environment, genomeToStackItem(genome, strength)];
}

export function blendSiblingControls(
  environment: MusicControls,
  genome: MusicControls
): MusicControls {
  const env = normalizeMusicControls(environment);
  const genes = normalizeMusicControls(genome);
  return normalizeMusicControls({
    stemminess: Math.round(env.stemminess * 0.55 + genes.stemminess * 0.45),
    kineticDensity: Math.round(env.kineticDensity * 0.55 + genes.kineticDensity * 0.45),
    socialInfection: Math.round(env.socialInfection * 0.55 + genes.socialInfection * 0.45),
    coupling: Math.round(env.coupling * 0.55 + genes.coupling * 0.45),
    interruption: Math.round(env.interruption * 0.55 + genes.interruption * 0.45),
    anchorStrength: Math.round(env.anchorStrength * 0.55 + genes.anchorStrength * 0.45),
    castSize: Math.round(env.castSize * 0.55 + genes.castSize * 0.45),
  });
}

export function createPetriDishExperiment(params: {
  name?: string;
  familySeed: string;
  parentA: MusicBreedingParent;
  parentB: MusicBreedingParent;
  siblingCount: number;
  challenge: PetriDishChallenge;
}): PetriDishExperiment {
  const now = Date.now();
  const familySeed = params.familySeed.trim() || 'dish-' + now.toString(36);
  const genomes = createSiblingGenomes(
    params.parentA,
    params.parentB,
    familySeed,
    params.siblingCount
  );

  const siblings: PetriDishSibling[] = genomes.map((genome, index) => ({
    id: 'sibling_' + genome.id + '_' + index,
    genome,
    breedingSeed: genome.lineage.breedingSeed,
    selected: false,
  }));

  return {
    id: 'dish_' + now + '_' + Math.random().toString(36).slice(2, 7),
    name: params.name?.trim() || params.parentA.ref.name + ' × ' + params.parentB.ref.name + ' DISH',
    createdAt: now,
    updatedAt: now,
    familySeed,
    parentA: toParentSnapshot(params.parentA),
    parentB: toParentSnapshot(params.parentB),
    challenge: normalizePetriDishChallenge(params.challenge),
    siblings,
  };
}

export function normalizePetriDishChallenge(value: any): PetriDishChallenge {
  const recentFingerprints = Array.isArray(value?.recentFingerprints)
    ? value.recentFingerprints.map(normalizeFingerprint).filter(Boolean).slice(0, 12)
    : [];
  const forcedFingerprint =
    normalizeFingerprint(value?.forcedFingerprint) ||
    recentFingerprints[0] || {
      genreFamily: 'deliberately unspecified ensemble ancestry',
      harmony: 'functional contrast with one persistent tension',
      melody: 'compact motif with traceable mutation',
      rhythm: 'steady pulse with explicit subdivision logic',
      timbre: 'clearly separated acoustic and vocal roles',
      vocal: 'distinct lead and response populations',
      performance: 'active, legible, physically committed',
      production: 'dry enough to expose arrangement roles',
    };
  const likedSignals = Array.isArray(value?.likedSignals)
    ? value.likedSignals.filter((item: unknown): item is string => typeof item === 'string').map((item: string) => item.slice(0, 900)).slice(0, 10)
    : [];

  return {
    guyIds: Array.isArray(value?.guyIds) ? value.guyIds.filter((item: unknown): item is string => typeof item === 'string').slice(0, 16) : [],
    realityEngineIds: Array.isArray(value?.realityEngineIds) ? value.realityEngineIds.filter((item: unknown): item is string => typeof item === 'string').slice(0, 32) : [],
    compositionEngineIds: Array.isArray(value?.compositionEngineIds) ? value.compositionEngineIds.filter((item: unknown): item is string => typeof item === 'string').slice(0, 64) : [],
    realityChaos: value?.realityChaos === 1 || value?.realityChaos === 2 || value?.realityChaos === 3 || value?.realityChaos === 4 ? value.realityChaos : 2,
    seed: cleanString(value?.seed, '', 300),
    energy: clampInt(value?.energy, 1, 5, 4),
    baseMusicStack: baseMechanismEnvironment(value?.baseMusicStack || []),
    baseMusicControls: normalizeMusicControls(value?.baseMusicControls),
    recentFingerprints: recentFingerprints as PetriDishChallenge['recentFingerprints'],
    forcedFingerprint,
    likedSignals,
  };
}

function normalizeParentSnapshot(value: any, fallbackName: string): PetriDishParentSnapshot | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const ref = value.ref && typeof value.ref === 'object' ? value.ref : {};
  const id = cleanString(ref.id, '', 120);
  const name = cleanString(ref.name, fallbackName, 120);
  const mechanismIds = Array.isArray(value.mechanismIds)
    ? value.mechanismIds.filter((item: unknown): item is string => typeof item === 'string').slice(0, 8)
    : [];
  if (!id || !mechanismIds.length) return undefined;

  return {
    ref: {
      id,
      name,
      kind: ref.kind === 'genome' ? 'genome' : 'recipe',
      generation: clampInt(ref.generation, 0, 99, 0),
    },
    mechanismIds,
    controls: normalizeMusicControls(value.controls),
  };
}

function normalizeDishResult(value: any): PetriDishResult | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const style = cleanString(value.style, '', 2500);
  const lyrics = cleanString(value.lyrics, '', 8000);
  const caption = cleanString(value.caption, '', 1500);
  if (!style && !lyrics && !caption && !value.error) return undefined;

  return {
    mode: value.mode === 'ai' ? 'ai' : 'local',
    style,
    lyrics,
    caption,
    fingerprint: normalizeFingerprint(value.fingerprint),
    model: cleanString(value.model, 'unknown', 160),
    charCounts: {
      style: clampInt(value?.charCounts?.style, 0, 20000, style.length),
      lyrics: clampInt(value?.charCounts?.lyrics, 0, 50000, lyrics.length),
      caption: clampInt(value?.charCounts?.caption, 0, 10000, caption.length),
    },
    notice: value.notice ? cleanString(value.notice, '', 800) : undefined,
    error: value.error ? cleanString(value.error, '', 1000) : undefined,
    createdAt: Number.isFinite(Number(value.createdAt)) ? Number(value.createdAt) : Date.now(),
  };
}

export function normalizePetriDishExperiment(value: unknown): PetriDishExperiment | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as any;
  const id = cleanString(raw.id, '', 140);
  const name = cleanString(raw.name, 'Untitled Petri Dish', 160);
  const parentA = normalizeParentSnapshot(raw.parentA, 'Parent A');
  const parentB = normalizeParentSnapshot(raw.parentB, 'Parent B');
  if (!id || !parentA || !parentB) return undefined;

  const siblings: PetriDishSibling[] = Array.isArray(raw.siblings)
    ? raw.siblings
        .map((item: any, index: number) => {
          const genome = normalizeMusicGenome(item?.genome);
          if (!genome) return null;
          return {
            id: cleanString(item?.id, 'sibling_' + genome.id + '_' + index, 160),
            genome,
            breedingSeed: cleanString(item?.breedingSeed, genome.lineage.breedingSeed, 240),
            selected: Boolean(item?.selected),
            result: normalizeDishResult(item?.result),
          } as PetriDishSibling;
        })
        .filter((item: PetriDishSibling | null): item is PetriDishSibling => Boolean(item))
        .slice(0, 6)
    : [];

  if (siblings.length < 2) return undefined;

  return {
    id,
    name,
    createdAt: Number.isFinite(Number(raw.createdAt)) ? Number(raw.createdAt) : Date.now(),
    updatedAt: Number.isFinite(Number(raw.updatedAt)) ? Number(raw.updatedAt) : Date.now(),
    familySeed: cleanString(raw.familySeed, 'dish-seed', 240),
    parentA,
    parentB,
    challenge: normalizePetriDishChallenge(raw.challenge),
    siblings,
  };
}

export function updateDishSiblingResult(
  experiment: PetriDishExperiment,
  siblingId: string,
  result: PetriDishResult
): PetriDishExperiment {
  return {
    ...experiment,
    updatedAt: Date.now(),
    siblings: experiment.siblings.map((sibling) =>
      sibling.id === siblingId ? { ...sibling, result } : sibling
    ),
  };
}

export function toggleDishSiblingSelected(
  experiment: PetriDishExperiment,
  siblingId: string
): PetriDishExperiment {
  return {
    ...experiment,
    updatedAt: Date.now(),
    siblings: experiment.siblings.map((sibling) =>
      sibling.id === siblingId ? { ...sibling, selected: !sibling.selected } : sibling
    ),
  };
}

export function clearDishResults(experiment: PetriDishExperiment): PetriDishExperiment {
  return {
    ...experiment,
    updatedAt: Date.now(),
    siblings: experiment.siblings.map((sibling) => ({
      ...sibling,
      result: undefined,
    })),
  };
}
