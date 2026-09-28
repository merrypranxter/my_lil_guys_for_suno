import assert from 'node:assert/strict';
import type { ArchivedRun } from '../src/types';
import {
  getMouthContextPreferenceScores,
  getMouthContextPreferencesForRun,
} from '../src/lib/localStorage';
import {
  applyMouthEnvironment,
  applyMouthEvolutionaryOperation,
  breedMouthGenome,
} from '../src/mouthLab';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  getItem(key: string) { return this.data.has(key) ? this.data.get(key)! : null; }
  key(index: number) { return Array.from(this.data.keys())[index] ?? null; }
  removeItem(key: string) { this.data.delete(key); }
  setItem(key: string, value: string) { this.data.set(key, String(value)); }
}

const base = breedMouthGenome({
  parentDonorIds: ['mouth-donor-english', 'mouth-donor-spanish'],
  breedingSeed: 'feedback-base',
  objectiveId: 'mouth-objective-distance-from-english',
  intelligibility: 78,
  stability: 66,
  mutation: 58,
}).genome;

const ecological = applyMouthEnvironment(base, {
  mode: 'infection',
  sourceDonorId: 'mouth-donor-tashlhiyt',
  pressure: 80,
  generations: 5,
  seed: 'feedback-ecology',
}).genome;

const evolved = applyMouthEvolutionaryOperation({
  genome: ecological,
  operation: 'speciate',
  seed: 'feedback-speciate',
  intensity: 85,
}).genome;

const run: ArchivedRun = {
  id: 'run_feedback_context',
  createdAt: Date.now(),
  guyIds: ['taxonomy-goblin'],
  realityEngineIds: [],
  compositionEngineIds: [],
  musicStack: [],
  musicControls: {
    stemminess: 50,
    kineticDensity: 50,
    socialInfection: 50,
    coupling: 50,
    interruption: 50,
    anchorStrength: 50,
    castSize: 50,
  },
  realityChaos: 2,
  mouthGenome: { ...evolved, musicalExpression: 88 },
  mouthPromptMode: 'bracketed',
  mouthSemanticMode: 'evolving',
  seed: 'feedback test',
  energy: 4,
  model: 'test',
  style: 'style',
  lyrics: 'lyrics',
  caption: 'caption',
  charCounts: { style: 5, lyrics: 6, caption: 7 },
  starred: true,
  feedback: 'liked the evolutionary mouth taking over the arrangement',
  feedbackTags: ['weird-in-a-good-way'],
  likedMouthContextKeys: [
    'semantic:evolving',
    'expression:whole-organism',
    'environment:infection',
    'evolution:speciate',
  ],
  dislikedMouthContextKeys: ['compiler:bracketed'],
};

const prefs = getMouthContextPreferencesForRun(run);
const keys = prefs.map((item) => item.key);

assert.ok(keys.includes('semantic:evolving'));
assert.ok(keys.includes('expression:whole-organism'));
assert.ok(keys.includes('environment:infection'));
assert.ok(keys.includes('evolution:speciate'));
assert.ok(keys.includes('compiler:bracketed'));

const storage = new MemoryStorage();
(globalThis as any).localStorage = storage;
storage.setItem('lgm_run_archive_v1', JSON.stringify([run]));

const scores = getMouthContextPreferenceScores();
assert.ok(scores['semantic:evolving'] > 0, 'explicit liked semantic mode should score positive');
assert.ok(scores['expression:whole-organism'] > 0, 'explicit liked expression band should score positive');
assert.ok(scores['environment:infection'] > 0, 'explicit liked ecology should score positive');
assert.ok(scores['evolution:speciate'] > 0, 'explicit liked evolutionary operation should score positive');
assert.ok(scores['compiler:bracketed'] < 0, 'explicit disliked compiler mode should score negative');

const weakRun = {
  ...run,
  id: 'run_weak_context',
  likedMouthContextKeys: [],
  dislikedMouthContextKeys: [],
};
storage.setItem('lgm_run_archive_v1', JSON.stringify([weakRun]));
const weakScores = getMouthContextPreferenceScores();
assert.ok(weakScores['semantic:evolving'] > 0, 'whole-run star should still produce weak positive evidence');

console.log('Mouth feedback genetics verification passed:', {
  contextKeys: keys,
  explicitScores: scores,
  weakScores,
});
