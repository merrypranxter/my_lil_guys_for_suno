import assert from 'node:assert/strict';
import {
  createBrainBackup,
  parseBrainBackup,
  restoreBrainBackup,
  serializeBrainBackup,
} from '../src/lib/brainBackup';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();

  get length() {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, String(value));
  }
}

const source = new MemoryStorage();
source.setItem('lgm_run_archive_v1', JSON.stringify([{ id: 'run-liked', starred: true, feedback: 'this slapped' }]));
source.setItem('lgm_genome_fitness_v1', JSON.stringify([{ phenotypeSignature: 'music-good', approvalCount: 3 }]));
source.setItem('lgm_mouth_fitness_v1', JSON.stringify([{ phenotypeSignature: 'mouth-good', approvalCount: 4 }]));
source.setItem('little-guy-machine:mouth-lab-archive:v1', JSON.stringify({ version: 1, species: [{ id: 'mouth_1' }] }));
source.setItem('unrelated-site-key', 'do not export me');

const backup = createBrainBackup(source);
assert.equal(backup.format, 'little-guy-machine-brain-backup');
assert.ok(backup.entries['lgm_run_archive_v1'], 'run archive should be backed up');
assert.ok(backup.entries['lgm_genome_fitness_v1'], 'music fitness should be backed up');
assert.ok(backup.entries['lgm_mouth_fitness_v1'], 'mouth fitness should be backed up');
assert.ok(backup.entries['little-guy-machine:mouth-lab-archive:v1'], 'Mouth Lab species archive should be backed up');
assert.ok(!backup.entries['unrelated-site-key'], 'unrelated localStorage must never leak into backup');

const serialized = serializeBrainBackup(source);
const parsed = parseBrainBackup(serialized);
assert.equal(Object.keys(parsed.entries).length, 4, 'backup parser should retain only app-owned keys');

const target = new MemoryStorage();
target.setItem('unrelated-site-key', 'keep me');
const restored = restoreBrainBackup(serialized, target);

assert.equal(restored.restoredKeys, 4);
assert.match(target.getItem('lgm_run_archive_v1') || '', /this slapped/);
assert.match(target.getItem('lgm_genome_fitness_v1') || '', /music-good/);
assert.match(target.getItem('lgm_mouth_fitness_v1') || '', /mouth-good/);
assert.match(target.getItem('little-guy-machine:mouth-lab-archive:v1') || '', /mouth_1/);
assert.equal(target.getItem('unrelated-site-key'), 'keep me', 'restore should not delete or overwrite unrelated site storage');

assert.throws(
  () => parseBrainBackup(JSON.stringify({ hello: 'nope' })),
  /not a valid Little Guy Machine brain backup/,
  'invalid files must be rejected',
);

console.log('Brain backup verification passed:', {
  keys: restored.restoredKeys,
  starredFeedbackRecovered: true,
  mouthSpeciesRecovered: true,
});
