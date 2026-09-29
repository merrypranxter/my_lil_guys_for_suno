export interface LittleGuyBrainBackup {
  format: 'little-guy-machine-brain-backup';
  version: 1;
  exportedAt: number;
  origin: string;
  entries: Record<string, string>;
}

const APP_KEY_PREFIXES = ['lgm_', 'little-guy-machine:'];
const LAST_BRAIN_EXPORT_KEY = 'little-guy-machine:last-brain-export:v1';

function isAppKey(key: string): boolean {
  return APP_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function createBrainBackup(storage: Storage = localStorage): LittleGuyBrainBackup {
  const entries: Record<string, string> = {};
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key || !isAppKey(key)) continue;
    const value = storage.getItem(key);
    if (value !== null) entries[key] = value;
  }

  return {
    format: 'little-guy-machine-brain-backup',
    version: 1,
    exportedAt: Date.now(),
    origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
    entries,
  };
}

export function serializeBrainBackup(storage: Storage = localStorage): string {
  return JSON.stringify(createBrainBackup(storage), null, 2);
}

export function parseBrainBackup(raw: string): LittleGuyBrainBackup {
  const parsed = JSON.parse(raw) as Partial<LittleGuyBrainBackup>;
  if (
    parsed?.format !== 'little-guy-machine-brain-backup' ||
    parsed.version !== 1 ||
    !parsed.entries ||
    typeof parsed.entries !== 'object'
  ) {
    throw new Error('That file is not a valid Little Guy Machine brain backup.');
  }

  const safeEntries = Object.fromEntries(
    Object.entries(parsed.entries)
      .filter(([key, value]) => isAppKey(key) && typeof value === 'string')
  );

  return {
    format: 'little-guy-machine-brain-backup',
    version: 1,
    exportedAt: Number.isFinite(parsed.exportedAt) ? Number(parsed.exportedAt) : Date.now(),
    origin: typeof parsed.origin === 'string' ? parsed.origin : 'unknown',
    entries: safeEntries,
  };
}

export function restoreBrainBackup(
  raw: string,
  storage: Storage = localStorage,
): { restoredKeys: number; exportedAt: number; origin: string } {
  const backup = parseBrainBackup(raw);
  for (const [key, value] of Object.entries(backup.entries)) {
    storage.setItem(key, value);
  }

  return {
    restoredKeys: Object.keys(backup.entries).length,
    exportedAt: backup.exportedAt,
    origin: backup.origin,
  };
}


export function getLastBrainBackupAt(storage: Storage = localStorage): number | undefined {
  const raw = storage.getItem(LAST_BRAIN_EXPORT_KEY);
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export function markBrainBackupExported(
  timestamp = Date.now(),
  storage: Storage = localStorage,
): number {
  storage.setItem(LAST_BRAIN_EXPORT_KEY, String(timestamp));
  return timestamp;
}
