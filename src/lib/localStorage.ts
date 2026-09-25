import { ArchivedRun, CompositionFavorite, CompositionPreset, GenomeFitnessRecord, GenomePromotionReason, MusicBredGenome, MusicControls, MusicFingerprint, MusicStackItem, PetriDishExperiment, RealityChaosLevel, RecentCompositionBuild, SavedStack } from '../types';
import type { MouthGenome, MouthPromptMode, MouthSemanticMode } from '../mouthLab/types';
import { normalizeMouthGenomeForGeneration } from '../mouthLab/promptCompiler';
import { fingerprintToLine } from '../data/musicTaxonomy';
import { getCompositionEngine, normalizeCompositionEngineIds } from '../data/compositionEngines';
import { DEFAULT_MUSIC_CONTROLS, compileMusicStack, getMusicMechanism, musicGenomePhenotypeSignature, normalizeMusicControls, normalizeMusicGenome, normalizeMusicStack, summarizeMusicStack } from '../data/musicSeedSystem';
import { normalizePetriDishExperiment } from './petriDish';
import { applySuccessSaturation, buildMechanismNoveltySignals, buildSemanticNoveltySignals, mechanismSaturationMap } from './noveltyPressure';

const STORAGE_KEYS = {
  SAVED_STACKS: 'lgm_saved_stacks_v1',
  LAST_STACK: 'lgm_last_stack_v1',
  LAST_REALITY_ENGINES: 'lgm_last_reality_engines_v1',
  LAST_COMPOSITION_ENGINES: 'lgm_last_composition_engines_v1',
  LAST_MUSIC_STACK: 'lgm_last_music_stack_v1',
  MUSIC_CONTROLS: 'lgm_music_controls_v1',
  BRED_MUSIC_GENOMES: 'lgm_bred_music_genomes_v1',
  GENOME_FITNESS: 'lgm_genome_fitness_v1',
  PETRI_DISHES: 'lgm_petri_dishes_v1',
  LOCKED_COMPOSITION_ENGINES: 'lgm_locked_composition_engines_v1',
  COMPOSITION_FAVORITES: 'lgm_composition_favorites_v1',
  COMPOSITION_PRESETS: 'lgm_composition_presets_v1',
  REALITY_CHAOS: 'lgm_reality_chaos_v1',
  ENERGY: 'lgm_energy_v1',
  LAST_SEED: 'lgm_last_seed_v1',
  RUN_ARCHIVE: 'lgm_run_archive_v1',
  LAST_MOUTH_GENOME: 'lgm_last_mouth_genome_v1',
  MOUTH_PROMPT_MODE: 'lgm_mouth_prompt_mode_v1',
  MOUTH_SEMANTIC_MODE: 'lgm_mouth_semantic_mode_v1',
};

const MAX_ARCHIVE_RUNS = 150;

export function getSavedStacks(): SavedStack[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_STACKS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((stack: any) => ({
      ...stack,
      guyIds: Array.isArray(stack?.guyIds) ? stack.guyIds : [],
      realityEngineIds: Array.isArray(stack?.realityEngineIds) ? stack.realityEngineIds : [],
      compositionEngineIds: Array.isArray(stack?.compositionEngineIds) ? stack.compositionEngineIds : [],
      musicStack: normalizeMusicStack(stack?.musicStack),
      musicControls: normalizeMusicControls(stack?.musicControls),
      mouthGenome: normalizeMouthGenomeForGeneration(stack?.mouthGenome),
      mouthPromptMode:
        stack?.mouthPromptMode === 'compact' || stack?.mouthPromptMode === 'descriptive'
          ? stack.mouthPromptMode
          : 'bracketed',
      mouthSemanticMode:
        stack?.mouthSemanticMode === 'englishMeaningAlienMouth'
          ? 'englishMeaningAlienMouth'
          : 'inherit',
    }));
  } catch (e) {
    console.error('Failed to load saved stacks from localStorage', e);
    return [];
  }
}

export function saveStackToFavorites(
  name: string,
  guyIds: string[],
  realityEngineIds: string[] = [],
  realityChaos: RealityChaosLevel = 2,
  compositionEngineIds: string[] = [],
  musicStack: MusicStackItem[] = [],
  musicControls: MusicControls = DEFAULT_MUSIC_CONTROLS,
  mouthGenome?: MouthGenome,
  mouthPromptMode: MouthPromptMode = 'bracketed',
  mouthSemanticMode: MouthSemanticMode = 'inherit'
): SavedStack[] {
  try {
    const current = getSavedStacks();
    const newStack: SavedStack = {
      id: 'stack_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim() || 'Stack of ' + guyIds.length + ' Guys',
      guyIds,
      realityEngineIds,
      compositionEngineIds,
      musicStack: normalizeMusicStack(musicStack),
      musicControls: normalizeMusicControls(musicControls),
      realityChaos,
      mouthGenome: normalizeMouthGenomeForGeneration(mouthGenome),
      mouthPromptMode,
      mouthSemanticMode,
      createdAt: Date.now(),
    };
    const updated = [newStack, ...current];
    localStorage.setItem(STORAGE_KEYS.SAVED_STACKS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save stack to localStorage', e);
    return [];
  }
}

export function deleteSavedStack(id: string): SavedStack[] {
  try {
    const current = getSavedStacks();
    const updated = current.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_STACKS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete stack from localStorage', e);
    return [];
  }
}

export function getLastStack(): string[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_STACK);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setLastStack(guyIds: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_STACK, JSON.stringify(guyIds));
  } catch {
    // ignore
  }
}

export function getLastRealityEngineIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_REALITY_ENGINES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function setLastRealityEngineIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_REALITY_ENGINES, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function getLastCompositionEngineIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_COMPOSITION_ENGINES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function setLastCompositionEngineIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_COMPOSITION_ENGINES, JSON.stringify(ids));
  } catch {
    // ignore
  }
}


export function getLastMusicStack(): MusicStackItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_MUSIC_STACK);
    return raw ? normalizeMusicStack(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function setLastMusicStack(items: MusicStackItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_MUSIC_STACK, JSON.stringify(normalizeMusicStack(items)));
  } catch {
    // ignore
  }
}


export function getLastMouthGenome(): MouthGenome | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_MOUTH_GENOME);
    return raw ? normalizeMouthGenomeForGeneration(JSON.parse(raw)) : undefined;
  } catch {
    return undefined;
  }
}

export function setLastMouthGenome(genome?: MouthGenome): void {
  try {
    if (!genome) {
      localStorage.removeItem(STORAGE_KEYS.LAST_MOUTH_GENOME);
      return;
    }
    const normalized = normalizeMouthGenomeForGeneration(genome);
    if (!normalized) {
      localStorage.removeItem(STORAGE_KEYS.LAST_MOUTH_GENOME);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.LAST_MOUTH_GENOME, JSON.stringify(normalized));
  } catch {
    // ignore
  }
}

export function getSavedMouthPromptMode(): MouthPromptMode {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.MOUTH_PROMPT_MODE);
    return value === 'compact' || value === 'descriptive' ? value : 'bracketed';
  } catch {
    return 'bracketed';
  }
}

export function setSavedMouthPromptMode(mode: MouthPromptMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MOUTH_PROMPT_MODE, mode);
  } catch {
    // ignore
  }
}

export function getSavedMouthSemanticMode(): MouthSemanticMode {
  try {
    return localStorage.getItem(STORAGE_KEYS.MOUTH_SEMANTIC_MODE) === 'englishMeaningAlienMouth'
      ? 'englishMeaningAlienMouth'
      : 'inherit';
  } catch {
    return 'inherit';
  }
}

export function setSavedMouthSemanticMode(mode: MouthSemanticMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MOUTH_SEMANTIC_MODE, mode);
  } catch {
    // ignore
  }
}

export function getSavedMusicControls(): MusicControls {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MUSIC_CONTROLS);
    return raw ? normalizeMusicControls(JSON.parse(raw)) : DEFAULT_MUSIC_CONTROLS;
  } catch {
    return DEFAULT_MUSIC_CONTROLS;
  }
}

export function setSavedMusicControls(controls: MusicControls): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MUSIC_CONTROLS, JSON.stringify(normalizeMusicControls(controls)));
  } catch {
    // ignore
  }
}



function validMechanismIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(
    value.filter(
      (item: unknown): item is string =>
        typeof item === 'string' && Boolean(getMusicMechanism(item))
    )
  )).slice(0, 24);
}

function normalizeGenomeFitnessRecord(value: unknown): GenomeFitnessRecord | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as any;
  const phenotypeSignature =
    typeof raw.phenotypeSignature === 'string' ? raw.phenotypeSignature.trim().slice(0, 160) : '';
  if (!phenotypeSignature) return undefined;

  const reasons: GenomePromotionReason[] = ['starred-run', 'manual-promotion', 'petri-survivor', 'legacy'];
  const reason: GenomePromotionReason = reasons.includes(raw.reason) ? raw.reason : 'legacy';
  const now = Date.now();

  return {
    phenotypeSignature,
    genomeIds: Array.isArray(raw.genomeIds)
      ? Array.from(new Set<string>(raw.genomeIds.filter((id: unknown): id is string => typeof id === 'string' && Boolean(id.trim())))).slice(0, 40)
      : [],
    approved: raw.approved !== false,
    approvalCount: Math.max(1, Math.min(999, Number.isFinite(Number(raw.approvalCount)) ? Math.round(Number(raw.approvalCount)) : 1)),
    likedMechanismIds: validMechanismIds(raw.likedMechanismIds),
    dislikedMechanismIds: validMechanismIds(raw.dislikedMechanismIds),
    sourceRunIds: Array.isArray(raw.sourceRunIds)
      ? Array.from(new Set<string>(raw.sourceRunIds.filter((id: unknown): id is string => typeof id === 'string' && Boolean(id.trim())))).slice(0, 80)
      : [],
    note: typeof raw.note === 'string' ? raw.note.slice(0, 1600) : '',
    reason,
    createdAt: Number.isFinite(Number(raw.createdAt)) ? Number(raw.createdAt) : now,
    updatedAt: Number.isFinite(Number(raw.updatedAt)) ? Number(raw.updatedAt) : now,
  };
}

export function getGenomeFitnessRecords(): GenomeFitnessRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GENOME_FITNESS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => normalizeGenomeFitnessRecord(item))
      .filter((item): item is GenomeFitnessRecord => Boolean(item))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 240);
  } catch {
    return [];
  }
}

function writeGenomeFitnessRecords(records: GenomeFitnessRecord[]): GenomeFitnessRecord[] {
  const normalized = records
    .map((item) => normalizeGenomeFitnessRecord(item))
    .filter((item): item is GenomeFitnessRecord => Boolean(item));
  const deduped = normalized
    .filter((item, index, all) =>
      all.findIndex((candidate) => candidate.phenotypeSignature === item.phenotypeSignature) === index
    )
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 240);

  try {
    localStorage.setItem(STORAGE_KEYS.GENOME_FITNESS, JSON.stringify(deduped));
  } catch {
    // ignore
  }
  return deduped;
}

export function getGenomeFitnessRecord(genomeOrSignature: MusicBredGenome | string): GenomeFitnessRecord | undefined {
  const signature =
    typeof genomeOrSignature === 'string'
      ? genomeOrSignature
      : musicGenomePhenotypeSignature(genomeOrSignature);
  if (!signature) return undefined;
  return getGenomeFitnessRecords().find((record) => record.phenotypeSignature === signature);
}

export function upsertGenomeFitness(
  genome: MusicBredGenome,
  options: {
    reason?: GenomePromotionReason;
    likedMechanismIds?: string[];
    dislikedMechanismIds?: string[];
    sourceRunId?: string;
    note?: string;
  } = {}
): GenomeFitnessRecord | undefined {
  const normalized = normalizeMusicGenome(genome);
  if (!normalized) return undefined;
  const phenotypeSignature = musicGenomePhenotypeSignature(normalized);
  if (!phenotypeSignature) return undefined;

  const current = getGenomeFitnessRecords();
  const existing = current.find((item) => item.phenotypeSignature === phenotypeSignature);
  const liked = validMechanismIds(options.likedMechanismIds)
    .filter((id) => normalized.mechanismIds.includes(id));
  const disliked = validMechanismIds(options.dislikedMechanismIds)
    .filter((id) => normalized.mechanismIds.includes(id) && !liked.includes(id));
  const now = Date.now();

  const next: GenomeFitnessRecord = {
    phenotypeSignature,
    genomeIds: Array.from(new Set([normalized.id, ...(existing?.genomeIds || [])])),
    approved: true,
    approvalCount: Math.min(999, (existing?.approvalCount || 0) + 1),
    likedMechanismIds: Array.from(new Set([...(existing?.likedMechanismIds || []), ...liked]))
      .filter((id) => !disliked.includes(id)),
    dislikedMechanismIds: Array.from(new Set([...(existing?.dislikedMechanismIds || []), ...disliked]))
      .filter((id) => !liked.includes(id)),
    sourceRunIds: Array.from(new Set([
      ...(options.sourceRunId ? [options.sourceRunId] : []),
      ...(existing?.sourceRunIds || []),
    ])).slice(0, 80),
    note: options.note?.trim()
      ? options.note.trim().slice(0, 1600)
      : existing?.note || '',
    reason: options.reason || existing?.reason || 'manual-promotion',
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  writeGenomeFitnessRecords([
    next,
    ...current.filter((item) => item.phenotypeSignature !== phenotypeSignature),
  ]);
  return next;
}

export function getBredMusicGenomes(): MusicBredGenome[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BRED_MUSIC_GENOMES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => normalizeMusicGenome(item))
      .filter((item): item is MusicBredGenome => Boolean(item))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 120);
  } catch {
    return [];
  }
}

function writeBredMusicGenomes(genomes: MusicBredGenome[]): MusicBredGenome[] {
  const normalized = genomes
    .map((item) => normalizeMusicGenome(item))
    .filter((item): item is MusicBredGenome => Boolean(item));
  const deduped = normalized
    .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 120);
  try {
    localStorage.setItem(STORAGE_KEYS.BRED_MUSIC_GENOMES, JSON.stringify(deduped));
  } catch {
    // ignore
  }
  return deduped;
}

export function saveBredMusicGenome(genome: MusicBredGenome): MusicBredGenome[] {
  const normalized = normalizeMusicGenome(genome);
  if (!normalized) return getBredMusicGenomes();
  const current = getBredMusicGenomes().filter((item) => item.id !== normalized.id);
  return writeBredMusicGenomes([normalized, ...current]);
}

export function promoteBredMusicGenome(
  genome: MusicBredGenome,
  options: {
    reason?: GenomePromotionReason;
    likedMechanismIds?: string[];
    dislikedMechanismIds?: string[];
    sourceRunId?: string;
    note?: string;
  } = {}
): MusicBredGenome[] {
  const normalized = normalizeMusicGenome(genome);
  if (!normalized) return getBredMusicGenomes();
  upsertGenomeFitness(normalized, options);
  return saveBredMusicGenome(normalized);
}

export function promoteGenomesFromRun(run: ArchivedRun): number {
  if (!run.starred) return 0;
  const seen = new Set<string>();
  let promoted = 0;

  for (const item of normalizeMusicStack(run.musicStack || [])) {
    if (item.kind !== 'genome' || !item.genome) continue;
    const genome = normalizeMusicGenome(item.genome);
    if (!genome) continue;
    const signature = musicGenomePhenotypeSignature(genome);
    if (!signature || seen.has(signature)) continue;
    seen.add(signature);

    promoteBredMusicGenome(genome, {
      reason: 'starred-run',
      likedMechanismIds: run.likedMechanismIds || [],
      dislikedMechanismIds: run.dislikedMechanismIds || [],
      sourceRunId: run.id,
      note: run.feedback,
    });
    promoted += 1;
  }

  return promoted;
}


export function deleteBredMusicGenome(id: string): MusicBredGenome[] {
  return writeBredMusicGenomes(getBredMusicGenomes().filter((item) => item.id !== id));
}


export function getPetriDishes(): PetriDishExperiment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PETRI_DISHES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => normalizePetriDishExperiment(item))
      .filter((item): item is PetriDishExperiment => Boolean(item))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 24);
  } catch {
    return [];
  }
}

function writePetriDishes(dishes: PetriDishExperiment[]): PetriDishExperiment[] {
  const normalized = dishes
    .map((item) => normalizePetriDishExperiment(item))
    .filter((item): item is PetriDishExperiment => Boolean(item));
  const deduped = normalized
    .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 24);
  try {
    localStorage.setItem(STORAGE_KEYS.PETRI_DISHES, JSON.stringify(deduped));
  } catch (e) {
    console.warn('Petri Dish storage hit browser limits; keeping newest experiments only.', e);
    try {
      const reduced = deduped.slice(0, 8);
      localStorage.setItem(STORAGE_KEYS.PETRI_DISHES, JSON.stringify(reduced));
      return reduced;
    } catch {
      return getPetriDishes();
    }
  }
  return deduped;
}

export function savePetriDish(experiment: PetriDishExperiment): PetriDishExperiment[] {
  const normalized = normalizePetriDishExperiment(experiment);
  if (!normalized) return getPetriDishes();
  const current = getPetriDishes().filter((item) => item.id !== normalized.id);
  return writePetriDishes([normalized, ...current]);
}

export function deletePetriDish(id: string): PetriDishExperiment[] {
  return writePetriDishes(getPetriDishes().filter((item) => item.id !== id));
}


export function getLockedCompositionEngineIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCKED_COMPOSITION_ENGINES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function setLockedCompositionEngineIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOCKED_COMPOSITION_ENGINES, JSON.stringify(ids));
  } catch {
    // ignore
  }
}


export function getCompositionFavorites(): CompositionFavorite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPOSITION_FAVORITES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item: any) => typeof item?.engineId === 'string' && Boolean(getCompositionEngine(item.engineId)))
      .map((item: any) => ({
        engineId: item.engineId,
        note: typeof item.note === 'string' ? item.note : '',
        createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
        updatedAt: typeof item.updatedAt === 'number' ? item.updatedAt : Date.now(),
      }));
  } catch {
    return [];
  }
}

function writeCompositionFavorites(items: CompositionFavorite[]): CompositionFavorite[] {
  const deduped = items.filter((item, index, all) =>
    all.findIndex((candidate) => candidate.engineId === item.engineId) === index
  ).slice(0, 300);
  try {
    localStorage.setItem(STORAGE_KEYS.COMPOSITION_FAVORITES, JSON.stringify(deduped));
  } catch {
    // ignore
  }
  return deduped;
}

export function upsertCompositionFavorite(engineId: string, note = ''): CompositionFavorite[] {
  const engine = getCompositionEngine(engineId);
  if (!engine) return getCompositionFavorites();

  const current = getCompositionFavorites();
  const existing = current.find((item) => item.engineId === engineId);
  const now = Date.now();
  const next: CompositionFavorite = existing
    ? { ...existing, note, updatedAt: now }
    : { engineId, note, createdAt: now, updatedAt: now };

  return writeCompositionFavorites([
    next,
    ...current.filter((item) => item.engineId !== engineId),
  ]);
}

export function removeCompositionFavorite(engineId: string): CompositionFavorite[] {
  return writeCompositionFavorites(
    getCompositionFavorites().filter((item) => item.engineId !== engineId)
  );
}

export function getCompositionFavoriteSignals(limit = 8): string[] {
  return getCompositionFavorites()
    .slice(0, limit)
    .map((favorite) => {
      const engine = getCompositionEngine(favorite.engineId);
      const label = engine ? engine.name + ' [' + engine.dimension + ']' : favorite.engineId;
      const note = favorite.note.trim() ? ' User note: ' + favorite.note.trim() : '';
      return 'COMPOSITION FAVORITE — ' + label + '.' + note;
    });
}

export function getCompositionPresets(): CompositionPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPOSITION_PRESETS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((preset: any) => {
        const compositionEngineIds = normalizeCompositionEngineIds(
          Array.isArray(preset?.compositionEngineIds) ? preset.compositionEngineIds : []
        );
        const valid = new Set(compositionEngineIds);
        const lockedEngineIds = (Array.isArray(preset?.lockedEngineIds) ? preset.lockedEngineIds : [])
          .filter((id: unknown): id is string => typeof id === 'string' && valid.has(id));
        return {
          id: typeof preset?.id === 'string' ? preset.id : 'comp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          name: typeof preset?.name === 'string' && preset.name.trim() ? preset.name.trim() : 'Untitled Composition Build',
          compositionEngineIds,
          lockedEngineIds,
          createdAt: typeof preset?.createdAt === 'number' ? preset.createdAt : Date.now(),
          updatedAt: typeof preset?.updatedAt === 'number' ? preset.updatedAt : Date.now(),
        } as CompositionPreset;
      })
      .filter((preset) => preset.compositionEngineIds.length > 0);
  } catch {
    return [];
  }
}

function writeCompositionPresets(presets: CompositionPreset[]): CompositionPreset[] {
  const clipped = presets.slice(0, 80);
  try {
    localStorage.setItem(STORAGE_KEYS.COMPOSITION_PRESETS, JSON.stringify(clipped));
  } catch {
    // ignore
  }
  return clipped;
}

export function saveCompositionPreset(name: string, compositionEngineIds: string[], lockedEngineIds: string[]): CompositionPreset[] {
  const ids = normalizeCompositionEngineIds(compositionEngineIds);
  if (ids.length === 0) return getCompositionPresets();

  const selected = new Set(ids);
  const locks = lockedEngineIds.filter((id) => selected.has(id));
  const now = Date.now();
  const preset: CompositionPreset = {
    id: 'comp_' + now + '_' + Math.random().toString(36).slice(2, 7),
    name: name.trim() || 'Composition Build ' + new Date(now).toLocaleString(),
    compositionEngineIds: ids,
    lockedEngineIds: locks,
    createdAt: now,
    updatedAt: now,
  };

  return writeCompositionPresets([preset, ...getCompositionPresets()]);
}

export function deleteCompositionPreset(id: string): CompositionPreset[] {
  return writeCompositionPresets(getCompositionPresets().filter((preset) => preset.id !== id));
}

export function getRecentCompositionBuilds(limit = 8): RecentCompositionBuild[] {
  const seen = new Set<string>();
  const builds: RecentCompositionBuild[] = [];

  for (const run of getRunArchive()) {
    const ids = normalizeCompositionEngineIds(run.compositionEngineIds || []);
    if (ids.length === 0) continue;
    const signature = [...ids].sort().join('|');
    if (seen.has(signature)) continue;
    seen.add(signature);
    builds.push({
      runId: run.id,
      createdAt: run.createdAt,
      compositionEngineIds: ids,
      seed: run.seed || '',
      model: run.model || '',
    });
    if (builds.length >= limit) break;
  }

  return builds;
}

export function getSavedRealityChaos(): RealityChaosLevel {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REALITY_CHAOS);
    const parsed = raw ? parseInt(raw, 10) : 2;
    return parsed >= 1 && parsed <= 4 ? (parsed as RealityChaosLevel) : 2;
  } catch {
    return 2;
  }
}

export function setSavedRealityChaos(level: RealityChaosLevel): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REALITY_CHAOS, String(level));
  } catch {
    // ignore
  }
}

export function getSavedEnergy(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENERGY);
    if (!raw) return 4;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) || parsed < 1 || parsed > 5 ? 4 : parsed;
  } catch {
    return 4;
  }
}

export function setSavedEnergy(energy: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ENERGY, energy.toString());
  } catch {
    // ignore
  }
}

export function getSavedSeed(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SEED) || '';
  } catch {
    return '';
  }
}

export function setSavedSeed(seed: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SEED, seed);
  } catch {
    // ignore
  }
}

export function getRunArchive(): ArchivedRun[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RUN_ARCHIVE);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((run: any) => ({
      ...run,
      guyIds: Array.isArray(run?.guyIds) ? run.guyIds : [],
      realityEngineIds: Array.isArray(run?.realityEngineIds) ? run.realityEngineIds : [],
      compositionEngineIds: Array.isArray(run?.compositionEngineIds) ? run.compositionEngineIds : [],
      musicStack: normalizeMusicStack(run?.musicStack),
      musicControls: normalizeMusicControls(run?.musicControls),
      mouthGenome: normalizeMouthGenomeForGeneration(run?.mouthGenome),
      mouthPromptMode:
        run?.mouthPromptMode === 'compact' || run?.mouthPromptMode === 'descriptive'
          ? run.mouthPromptMode
          : 'bracketed',
      mouthSemanticMode:
        run?.mouthSemanticMode === 'englishMeaningAlienMouth'
          ? 'englishMeaningAlienMouth'
          : 'inherit',
      feedbackTags: Array.isArray(run?.feedbackTags) ? run.feedbackTags.filter((tag: unknown) => typeof tag === 'string') : [],
      likedMechanismIds: validMechanismIds(run?.likedMechanismIds),
      dislikedMechanismIds: validMechanismIds(run?.dislikedMechanismIds),
    }));
  } catch (e) {
    console.error('Failed to load run archive', e);
    return [];
  }
}

function writeRunArchive(runs: ArchivedRun[]): ArchivedRun[] {
  const clipped = runs.slice(0, MAX_ARCHIVE_RUNS);
  try {
    localStorage.setItem(STORAGE_KEYS.RUN_ARCHIVE, JSON.stringify(clipped));
    return clipped;
  } catch (e) {
    console.warn('Run archive hit browser storage limits; trimming older runs.', e);
    const reduced = clipped.slice(0, 60);
    try {
      localStorage.setItem(STORAGE_KEYS.RUN_ARCHIVE, JSON.stringify(reduced));
      return reduced;
    } catch (inner) {
      console.error('Could not persist run archive', inner);
      return getRunArchive();
    }
  }
}

export function saveGeneratedRun(run: Omit<ArchivedRun, 'id' | 'createdAt' | 'starred' | 'feedback'>): ArchivedRun {
  const archived: ArchivedRun = {
    ...run,
    id: 'run_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
    createdAt: Date.now(),
    starred: false,
    feedback: '',
  };
  writeRunArchive([archived, ...getRunArchive()]);
  return archived;
}

export function updateArchivedRun(id: string, patch: Partial<ArchivedRun>): ArchivedRun | null {
  const runs = getRunArchive();
  let updatedRun: ArchivedRun | null = null;
  const updated = runs.map((run) => {
    if (run.id !== id) return run;
    updatedRun = { ...run, ...patch, id: run.id, createdAt: run.createdAt };
    return updatedRun;
  });
  writeRunArchive(updated);
  return updatedRun;
}

export function getRecentFingerprints(limit = 10): MusicFingerprint[] {
  return getRunArchive()
    .map((run) => run.fingerprint)
    .filter((f): f is MusicFingerprint => Boolean(f))
    .slice(0, limit);
}

export function getLikedPreferenceSignals(limit = 10): string[] {
  return getRunArchive()
    .filter((run) => run.starred)
    .slice(0, limit)
    .map((run) => {
      const fingerprint = run.fingerprint ? fingerprintToLine(run.fingerprint) : 'fingerprint unavailable';
      const note = run.feedback.trim() ? ' User specifically liked: ' + run.feedback.trim() : '';
      const reality = run.realityEngineIds.length ? run.realityEngineIds.join(' > ') : '(none)';
      const composition = run.compositionEngineIds.length ? run.compositionEngineIds.join(' > ') : '(none)';
      const music = summarizeMusicStack(run.musicStack || [], run.musicControls);
      const tags = run.feedbackTags?.length ? ' Feedback tags: ' + run.feedbackTags.join(', ') + '.' : '';
      const context = 'stack=' + run.guyIds.join(' > ') + ' | reality=' + reality + ' | composition=' + composition + ' | music=' + music + ' | realityChaos=' + (run.realityChaos || 2) + ' | seed=' + (run.seed || '(none)') + ' | ';
      return 'POSITIVE EXAMPLE — ' + context + fingerprint + '.' + tags + note;
    });
}

export function getMusicPreferenceSignals(limit = 8): string[] {
  return getRunArchive()
    .filter((run) => run.starred && (run.musicStack?.length || run.feedbackTags?.length || run.likedMechanismIds?.length || run.dislikedMechanismIds?.length))
    .slice(0, limit)
    .map((run) => {
      const stack = summarizeMusicStack(run.musicStack || [], run.musicControls);
      const tags = run.feedbackTags?.length ? ' User tagged: ' + run.feedbackTags.join(', ') + '.' : '';
      const liked = run.likedMechanismIds?.length ? ' Breed-positive mechanisms: ' + run.likedMechanismIds.join(', ') + '.' : '';
      const disliked = run.dislikedMechanismIds?.length ? ' Suppress-inheritance mechanisms: ' + run.dislikedMechanismIds.join(', ') + '.' : '';
      const note = run.feedback.trim() ? ' User note: ' + run.feedback.trim() : '';
      return 'MUSIC FITNESS SIGNAL — ' + stack + '.' + tags + liked + disliked + note;
    });
}

export function getMusicMechanismFitnessScores(limit = 60): Record<string, number> {
  const scores: Record<string, number> = {};
  const starred = getRunArchive().filter((run) => run.starred).slice(0, limit);

  for (const run of starred) {
    const liked = validMechanismIds(run.likedMechanismIds);
    const disliked = validMechanismIds(run.dislikedMechanismIds);
    const explicit = liked.length > 0 || disliked.length > 0;

    if (explicit) {
      for (const id of liked) scores[id] = (scores[id] || 0) + 2.0;
      for (const id of disliked) scores[id] = (scores[id] || 0) - 2.5;
      continue;
    }

    // A whole-run star with no trait selection is weak evidence, not permission
    // to make every active mechanism genetically dominant forever.
    const compiled = compileMusicStack(run.musicStack || [], run.musicControls);
    for (const entry of compiled.mechanisms) {
      scores[entry.mechanism.id] = (scores[entry.mechanism.id] || 0) + 0.25;
    }
  }

  const maxAbs = Math.max(0, ...Object.values(scores).map((value) => Math.abs(value)));
  if (maxAbs <= 0) return scores;
  for (const id of Object.keys(scores)) {
    scores[id] = Math.round((scores[id] / maxAbs) * 100) / 100;
  }
  return scores;
}

export function getRecentMechanismSaturation(limit = 8): Record<string, number> {
  return mechanismSaturationMap(getRunArchive(), limit);
}

export function getNoveltyPressureSignals(limit = 8): string[] {
  const runs = getRunArchive();
  return [
    ...buildMechanismNoveltySignals(runs, limit),
    ...buildSemanticNoveltySignals(runs, limit),
  ].slice(0, 10);
}

export function getGenomeMechanismFitness(genome: MusicBredGenome): Record<string, number> {
  const normalized = normalizeMusicGenome(genome);
  if (!normalized) return {};

  const global = getMusicMechanismFitnessScores();
  const record = getGenomeFitnessRecord(normalized);
  const saturation = getRecentMechanismSaturation();
  const out: Record<string, number> = {};

  for (const id of normalized.mechanismIds) {
    let score = global[id] || 0;
    if (record?.likedMechanismIds.includes(id)) score += 1;
    if (record?.dislikedMechanismIds.includes(id)) score -= 1;

    // Fitness is durable preference; saturation is temporary ecological pressure.
    // A beloved gene can cool down without being forgotten.
    out[id] = applySuccessSaturation(score, saturation[id] || 0);
  }

  return out;
}

export function getLikedMusicMechanismWeights(limit = 60): Record<string, number> {
  const signed = getMusicMechanismFitnessScores(limit);
  const positive: Record<string, number> = {};
  for (const [id, score] of Object.entries(signed)) {
    if (score > 0) positive[id] = score;
  }
  return positive;
}

export function getLikedMindWeights(limit = 30): Record<string, number> {
  const weights: Record<string, number> = {};
  const starred = getRunArchive().filter((run) => run.starred).slice(0, limit);

  for (const run of starred) {
    const feedbackBoost = run.feedback.trim() ? 1.35 : 1;
    run.guyIds.forEach((id, index) => {
      const positionBoost = index === 0 ? 1.15 : 1;
      weights[id] = (weights[id] || 0) + feedbackBoost * positionBoost;
    });
  }

  const max = Math.max(0, ...Object.values(weights));
  if (max <= 0) return weights;

  for (const id of Object.keys(weights)) {
    weights[id] = Math.round((weights[id] / max) * 100) / 100;
  }
  return weights;
}

export function getLikedRealityWeights(limit = 40): Record<string, number> {
  const weights: Record<string, number> = {};
  const starred = getRunArchive().filter((run) => run.starred).slice(0, limit);

  for (const run of starred) {
    const feedbackBoost = run.feedback.trim() ? 1.4 : 1;
    const engineCount = Math.max(1, run.realityEngineIds.length);
    run.realityEngineIds.forEach((id) => {
      const specificityBoost = engineCount <= 4 ? 1.1 : 1;
      weights[id] = (weights[id] || 0) + feedbackBoost * specificityBoost;
    });
  }

  const max = Math.max(0, ...Object.values(weights));
  if (max <= 0) return weights;

  for (const id of Object.keys(weights)) {
    weights[id] = Math.round((weights[id] / max) * 100) / 100;
  }
  return weights;
}

function safeFence(text: string): string {
  return text.split('```').join('``\\`');
}

export function runToMarkdown(run: ArchivedRun): string {
  const date = new Date(run.createdAt).toISOString();
  const fingerprint = run.fingerprint ? fingerprintToLine(run.fingerprint) : 'Not recorded';
  const feedback = run.feedback.trim() || 'None';
  return [
    '# LITTLE GUY MACHINE — RUN',
    '',
    '**Run ID:** ' + run.id,
    '**Created:** ' + date,
    '**Stack:** ' + run.guyIds.join(' → '),
    '**Reality engines:** ' + (run.realityEngineIds.length ? run.realityEngineIds.join(' → ') : '(none)'),
    '**Reality chaos:** ' + (run.realityChaos || 2),
    '**Composition engines:** ' + (run.compositionEngineIds.length ? run.compositionEngineIds.join(' → ') : '(none)'),
    '**Music seed stack:** ' + summarizeMusicStack(run.musicStack || [], run.musicControls),
    '**Mouth Lab genome:** ' + (run.mouthGenome
      ? run.mouthGenome.name + ' [' + run.mouthGenome.parentDonorIds.join(' × ') + ']'
      : '(none)'),
    '**Mouth compiler mode:** ' + (run.mouthPromptMode || 'bracketed'),
    '**Mouth semantic mode:** ' + (run.mouthSemanticMode || 'inherit'),
    '**Seed:** ' + (run.seed || '(none)'),
    '**Energy:** ' + run.energy,
    '**Model:** ' + run.model,
    '**Starred:** ' + (run.starred ? 'YES ★' : 'No'),
    '**Feedback:** ' + feedback,
    '**Feedback tags:** ' + (run.feedbackTags?.length ? run.feedbackTags.join(', ') : 'None'),
    '**Breed-positive mechanisms:** ' + (run.likedMechanismIds?.length ? run.likedMechanismIds.join(', ') : 'None'),
    '**Suppress-inheritance mechanisms:** ' + (run.dislikedMechanismIds?.length ? run.dislikedMechanismIds.join(', ') : 'None'),
    '**Musical fingerprint:** ' + fingerprint,
    '**Character counts:** style ' + run.charCounts.style + ' / lyrics ' + run.charCounts.lyrics + ' / caption ' + run.charCounts.caption,
    '',
    '## STYLE',
    '',
    '\`\`\`text',
    safeFence(run.style),
    '\`\`\`',
    '',
    '## LYRICS / CONTROL',
    '',
    '\`\`\`text',
    safeFence(run.lyrics),
    '\`\`\`',
    '',
    '## CAPTION',
    '',
    '\`\`\`text',
    safeFence(run.caption),
    '\`\`\`',
    ''
  ].join('\n');
}

export function archiveToMarkdown(runs = getRunArchive()): string {
  const header = [
    '# LITTLE GUY MACHINE — RUN ARCHIVE',
    '',
    'Exported: ' + new Date().toISOString(),
    'Runs: ' + runs.length,
    'Starred: ' + runs.filter((run) => run.starred).length,
    '',
    '---',
    ''
  ].join('\n');
  return header + runs.map(runToMarkdown).join('\n---\n\n');
}
