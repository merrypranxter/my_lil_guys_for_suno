import { ArchivedRun, MusicFingerprint, RealityChaosLevel, SavedStack } from '../types';
import { fingerprintToLine } from '../data/musicTaxonomy';

const STORAGE_KEYS = {
  SAVED_STACKS: 'lgm_saved_stacks_v1',
  LAST_STACK: 'lgm_last_stack_v1',
  LAST_REALITY_ENGINES: 'lgm_last_reality_engines_v1',
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
    }));
  } catch (e) {
    console.error('Failed to load saved stacks from localStorage', e);
    return [];
  }
}

export function saveStackToFavorites(name: string, guyIds: string[], realityEngineIds: string[] = [], realityChaos: RealityChaosLevel = 2): SavedStack[] {
  try {
    const current = getSavedStacks();
    const newStack: SavedStack = {
      id: 'stack_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim() || 'Stack of ' + guyIds.length + ' Guys',
      guyIds,
      realityEngineIds,
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
      const context = 'stack=' + run.guyIds.join(' > ') + ' | reality=' + reality + ' | realityChaos=' + (run.realityChaos || 2) + ' | seed=' + (run.seed || '(none)') + ' | ';
      return 'POSITIVE EXAMPLE — ' + context + fingerprint + '.' + note;
    });
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
    '**Seed:** ' + (run.seed || '(none)'),
    '**Energy:** ' + run.energy,
    '**Model:** ' + run.model,
    '**Starred:** ' + (run.starred ? 'YES ★' : 'No'),
    '**Feedback:** ' + feedback,
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
