import { ArchivedRun, MusicFingerprint, SavedStack } from '../types';
import { fingerprintToLine } from '../data/musicTaxonomy';

const STORAGE_KEYS = {
  SAVED_STACKS: 'lgm_saved_stacks_v1',
  LAST_STACK: 'lgm_last_stack_v1',
  ENERGY: 'lgm_energy_v1',
  LAST_SEED: 'lgm_last_seed_v1',
  RUN_ARCHIVE: 'lgm_run_archive_v1',
};

const MAX_ARCHIVE_RUNS = 150;

export function getSavedStacks(): SavedStack[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_STACKS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved stacks from localStorage', e);
    return [];
  }
}

export function saveStackToFavorites(name: string, guyIds: string[]): SavedStack[] {
  try {
    const current = getSavedStacks();
    const newStack: SavedStack = {
      id: 'stack_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim() || 'Stack of ' + guyIds.length + ' Guys',
      guyIds,
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
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load run archive', e);
    return [];
  }
}

function writeRunArchive(runs: ArchivedRun[]): ArchivedRun[] {
  const clipped = runs.slice(0, MAX_ARCHIVE_RUNS);
  localStorage.setItem(STORAGE_KEYS.RUN_ARCHIVE, JSON.stringify(clipped));
  return clipped;
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
      return 'POSITIVE EXAMPLE — ' + fingerprint + '.' + note;
    });
}

function safeFence(text: string): string {
  return text.replace(/\`\`\`/g, '\`\`\\\`');
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
