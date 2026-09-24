import { ArchivedRun, CompositionFavorite, CompositionPreset, MusicControls, MusicFingerprint, MusicStackItem, RealityChaosLevel, RecentCompositionBuild, SavedStack } from '../types';
import { fingerprintToLine } from '../data/musicTaxonomy';
import { getCompositionEngine, normalizeCompositionEngineIds } from '../data/compositionEngines';
import { DEFAULT_MUSIC_CONTROLS, compileMusicStack, normalizeMusicControls, normalizeMusicStack, summarizeMusicStack } from '../data/musicSeedSystem';

const STORAGE_KEYS = {
  SAVED_STACKS: 'lgm_saved_stacks_v1',
  LAST_STACK: 'lgm_last_stack_v1',
  LAST_REALITY_ENGINES: 'lgm_last_reality_engines_v1',
  LAST_COMPOSITION_ENGINES: 'lgm_last_composition_engines_v1',
  LAST_MUSIC_STACK: 'lgm_last_music_stack_v1',
  MUSIC_CONTROLS: 'lgm_music_controls_v1',
  LOCKED_COMPOSITION_ENGINES: 'lgm_locked_composition_engines_v1',
  COMPOSITION_FAVORITES: 'lgm_composition_favorites_v1',
  COMPOSITION_PRESETS: 'lgm_composition_presets_v1',
  REALITY_CHAOS: 'lgm_reality_chaos_v1',
  ENERGY: 'lgm_energy_v1',
  LAST_SEED: 'lgm_last_seed_v1',
  RUN_ARCHIVE: 'lgm_run_archive_v1',
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
  musicControls: MusicControls = DEFAULT_MUSIC_CONTROLS
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
      feedbackTags: Array.isArray(run?.feedbackTags) ? run.feedbackTags.filter((tag: unknown) => typeof tag === 'string') : [],
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
    .filter((run) => run.starred && (run.musicStack?.length || run.feedbackTags?.length))
    .slice(0, limit)
    .map((run) => {
      const stack = summarizeMusicStack(run.musicStack || [], run.musicControls);
      const tags = run.feedbackTags?.length ? ' User tagged: ' + run.feedbackTags.join(', ') + '.' : '';
      const note = run.feedback.trim() ? ' User note: ' + run.feedback.trim() : '';
      return 'MUSIC MECHANISM FAVORITE — ' + stack + '.' + tags + note;
    });
}

export function getLikedMusicMechanismWeights(limit = 40): Record<string, number> {
  const weights: Record<string, number> = {};
  const starred = getRunArchive().filter((run) => run.starred).slice(0, limit);

  for (const run of starred) {
    const compiled = compileMusicStack(run.musicStack || [], run.musicControls);
    const tagBoost = run.feedbackTags?.length ? 1.25 : 1;
    const noteBoost = run.feedback.trim() ? 1.2 : 1;
    for (const entry of compiled.mechanisms) {
      const strengthBoost = 0.6 + entry.strength / 100;
      weights[entry.mechanism.id] = (weights[entry.mechanism.id] || 0) + strengthBoost * tagBoost * noteBoost;
    }
  }

  const max = Math.max(0, ...Object.values(weights));
  if (max <= 0) return weights;
  for (const id of Object.keys(weights)) {
    weights[id] = Math.round((weights[id] / max) * 100) / 100;
  }
  return weights;
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
    '**Seed:** ' + (run.seed || '(none)'),
    '**Energy:** ' + run.energy,
    '**Model:** ' + run.model,
    '**Starred:** ' + (run.starred ? 'YES ★' : 'No'),
    '**Feedback:** ' + feedback,
    '**Feedback tags:** ' + (run.feedbackTags?.length ? run.feedbackTags.join(', ') : 'None'),
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
