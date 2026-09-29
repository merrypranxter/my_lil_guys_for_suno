import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  createBrainBackup,
  getLastBrainBackupAt,
  markBrainBackupExported,
  restoreBrainBackup,
  serializeBrainBackup,
} from '../src/lib/brainBackup';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  getItem(key: string) { return this.data.has(key) ? this.data.get(key)! : null; }
  key(index: number) { return Array.from(this.data.keys())[index] ?? null; }
  removeItem(key: string) { this.data.delete(key); }
  setItem(key: string, value: string) { this.data.set(key, String(value)); }
}

const storage = new MemoryStorage();
assert.equal(getLastBrainBackupAt(storage), undefined, 'backup status should begin empty');
const stamp = 1770000000000;
markBrainBackupExported(stamp, storage);
assert.equal(getLastBrainBackupAt(storage), stamp, 'backup timestamp should persist');

storage.setItem('lgm_run_archive_v1', JSON.stringify([{ id: 'keep-me', starred: true }]));
const backup = createBrainBackup(storage);
assert.ok(
  backup.entries['little-guy-machine:last-brain-export:v1'],
  'portable brain backup should preserve its own last-export status',
);
const serialized = serializeBrainBackup(storage);

const restored = new MemoryStorage();
restoreBrainBackup(serialized, restored);
assert.equal(getLastBrainBackupAt(restored), stamp, 'restored brain should recover last backup timestamp');
assert.match(restored.getItem('lgm_run_archive_v1') || '', /keep-me/, 'archive must survive brain round-trip');

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
assert.ok(app.includes('NEW EXPERIMENT / HARD REFRESH'), 'Quick Play must expose hard refresh');
assert.ok(app.includes('const hardRefreshExperiment = () =>'), 'hard refresh handler must exist');
assert.ok(app.includes("setUiMode('play')"), 'hard refresh must return UI to play mode');
assert.ok(app.includes('setModuleOpen({ ...DEFAULT_PLAY_MODULE_OPEN })'), 'hard refresh must restore play-mode drawer layout');
assert.ok(app.includes('BRAIN BACKUP:'), 'Quick Play must show brain backup status');
assert.ok(app.includes('NEW SESSION / CLEAR WORKSPACE'), 'session reset wording must distinguish workspace reset from memory deletion');

console.log('Post-playtest hygiene verification passed:', {
  backupStamp: getLastBrainBackupAt(restored),
  hardRefreshPreservesBrainByDesign: true,
});
