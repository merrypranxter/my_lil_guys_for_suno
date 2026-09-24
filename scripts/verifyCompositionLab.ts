import assert from 'node:assert/strict';
import {
  COMPOSITION_DIMENSION_DOMAINS,
  COMPOSITION_DIMENSION_LIMITS,
  COMPOSITION_ENGINES,
  getCompositionEngine,
  getCompositionEnginesByDimension,
  normalizeCompositionEngineIds,
} from '../src/data/compositionEngines';
import { LITTLE_GUYS } from '../src/data/littleGuys';
import {
  mutateCompositionSelection,
  randomizeAllComposition,
  randomizeCompositionDimension,
} from '../src/lib/compositionRandomization';
import {
  getCompositionFavoriteSignals,
  getCompositionFavorites,
  getCompositionPresets,
  getRecentCompositionBuilds,
  getRunArchive,
  getSavedStacks,
  saveCompositionPreset,
  saveGeneratedRun,
  saveStackToFavorites,
  upsertCompositionFavorite,
} from '../src/lib/localStorage';
import { buildMasterPrompt } from '../src/lib/buildGenerationPrompt';
import { generateProceduralTrack, TARGETS } from '../src/lib/proceduralGenerator';
import { CompositionDimension } from '../src/types';

class MemoryStorage {
  private data = new Map<string, string>();

  get length(): number {
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
    this.data.set(String(key), String(value));
  }
}

(globalThis as any).localStorage = new MemoryStorage();

function countByDimension(ids: string[], dimension: CompositionDimension): number {
  return ids.filter((id) => getCompositionEngine(id)?.dimension === dimension).length;
}

function assertCardinality(ids: string[]): void {
  for (const [dimension, limit] of Object.entries(COMPOSITION_DIMENSION_LIMITS) as [CompositionDimension, number][]) {
    const count = countByDimension(ids, dimension);
    assert.ok(count <= limit, dimension + ' exceeded limit: ' + count + ' > ' + limit);
  }
}

function assertRange(text: string, min: number, max: number, label: string): void {
  assert.ok(text.length >= min, label + ' below minimum: ' + text.length + ' < ' + min);
  assert.ok(text.length <= max, label + ' above maximum: ' + text.length + ' > ' + max);
}

console.log('Composition Lab QA: starting');

assert.equal(COMPOSITION_ENGINES.length, 1000, 'Composition registry should contain exactly 1000 engines');
assert.equal(new Set(COMPOSITION_ENGINES.map((engine) => engine.id)).size, COMPOSITION_ENGINES.length, 'Composition engine IDs must be unique');

for (const dimension of Object.keys(COMPOSITION_DIMENSION_LIMITS) as CompositionDimension[]) {
  const engines = getCompositionEnginesByDimension(dimension);
  assert.ok(engines.length > 0, dimension + ' should have at least one engine');
  assert.ok(
    engines.every((engine) => COMPOSITION_DIMENSION_DOMAINS[dimension] === engine.domain),
    dimension + ' contains an engine registered under the wrong domain'
  );
}

const intentionallyOverfull = COMPOSITION_ENGINES.map((engine) => engine.id);
const normalized = normalizeCompositionEngineIds(intentionallyOverfull);
assertCardinality(normalized);
assert.ok(normalized.length > 0, 'Normalization should preserve a usable selection');

const seeded = randomizeAllComposition([], []);
assert.ok(seeded.length > 0, 'Randomize All should seed an empty build');
assertCardinality(seeded);
const seededDomains = new Set(seeded.map((id) => getCompositionEngine(id)?.domain).filter(Boolean));
assert.equal(seededDomains.size, 4, 'An empty Randomize All should seed all four cabinets');

const rhythmPool = getCompositionEnginesByDimension('rhythmPhysics');
assert.ok(rhythmPool.length >= 3, 'Rhythm Physics needs enough cards for lock/randomization QA');
const initialRhythm = rhythmPool.slice(0, 2).map((engine) => engine.id);
const lockedRhythm = initialRhythm[0];
const randomizedRhythm = randomizeCompositionDimension(initialRhythm, [lockedRhythm], 'rhythmPhysics', 2);
assert.ok(randomizedRhythm.includes(lockedRhythm), 'Randomize Dimension must preserve locked engines');
assert.equal(countByDimension(randomizedRhythm, 'rhythmPhysics'), 2, 'Randomize Dimension should preserve requested count');
assertCardinality(randomizedRhythm);

const mutationBase = [
  ...initialRhythm,
  getCompositionEnginesByDimension('tuning')[0].id,
  getCompositionEnginesByDimension('temporal')[0].id,
  getCompositionEnginesByDimension('constraint')[0].id,
];
const mutated = mutateCompositionSelection(mutationBase, [lockedRhythm]);
assert.ok(mutated.includes(lockedRhythm), 'Mutate Current Build must preserve locked engines');
assert.equal(mutated.length, mutationBase.length, 'Mutation should preserve build size');
assertCardinality(mutated);

localStorage.clear();

localStorage.setItem('lgm_composition_favorites_v1', JSON.stringify([
  { engineId: 'stale-engine-that-no-longer-exists', note: 'stale', createdAt: 1, updatedAt: 1 },
]));
assert.equal(getCompositionFavorites().length, 0, 'Stale favorite IDs should be ignored safely');

const favoriteEngine = rhythmPool[0];
upsertCompositionFavorite(favoriteEngine.id, 'I like that the timing rule stays audible and structural.');
const favorites = getCompositionFavorites();
assert.equal(favorites.length, 1, 'Favorite should persist');
assert.equal(favorites[0].engineId, favoriteEngine.id, 'Favorite should keep engine ID');
const favoriteSignals = getCompositionFavoriteSignals(5);
assert.ok(favoriteSignals[0]?.includes('timing rule stays audible'), 'Favorite note should become a generation preference signal');

const presetIds = [
  favoriteEngine.id,
  getCompositionEnginesByDimension('tuning')[0].id,
  getCompositionEnginesByDimension('prop')[0].id,
];
localStorage.setItem('lgm_composition_presets_v1', JSON.stringify([
  {
    id: 'stale-preset',
    name: 'STALE',
    compositionEngineIds: ['stale-engine-that-no-longer-exists'],
    lockedEngineIds: ['stale-engine-that-no-longer-exists'],
    createdAt: 1,
    updatedAt: 1,
  },
]));
assert.equal(getCompositionPresets().length, 0, 'Preset with only stale engines should be ignored safely');

saveCompositionPreset('QA PRESET', presetIds, [favoriteEngine.id]);
const presets = getCompositionPresets();
assert.equal(presets.length, 1, 'Composition preset should persist');
assert.deepEqual(presets[0].compositionEngineIds, presetIds, 'Preset should restore normalized composition IDs');
assert.deepEqual(presets[0].lockedEngineIds, [favoriteEngine.id], 'Preset should preserve valid locks');

const guyId = LITTLE_GUYS[0].id;

saveStackToFavorites('WHOLE STACK QA', [guyId], [], 2, presetIds);
const wholeStacks = getSavedStacks();
assert.equal(wholeStacks.length, 1, 'Whole-stack save should still persist after Composition Lab changes');
assert.deepEqual(wholeStacks[0].compositionEngineIds, presetIds, 'Whole-stack save should retain Composition engines');
saveGeneratedRun({
  guyIds: [guyId],
  realityEngineIds: [],
  compositionEngineIds: presetIds,
  realityChaos: 2,
  seed: 'qa smoke test',
  energy: 4,
  model: 'qa',
  style: 'qa',
  lyrics: 'qa',
  caption: 'qa',
  charCounts: { style: 2, lyrics: 2, caption: 2 },
});
assert.equal(getRunArchive().length, 1, 'Archived smoke run should persist');
const recent = getRecentCompositionBuilds(6);
assert.equal(recent.length, 1, 'Recent Composition build should be derived from archive');
assert.deepEqual(recent[0].compositionEngineIds, presetIds, 'Recent build should preserve Composition selection');

const prompt = buildMasterPrompt({
  guyIds: [guyId],
  compositionEngineIds: presetIds,
  energy: 4,
  likedSignals: favoriteSignals,
});
const promptText = prompt.systemInstruction + '\n' + prompt.userPrompt;
assert.ok(promptText.includes('COMPOSITION FAVORITE'), 'Favorite preference signal should reach master prompt');
assert.ok(promptText.includes(favoriteEngine.name), 'Selected Composition engine should reach master prompt');

const fallback = generateProceduralTrack({
  guyIds: [guyId],
  compositionEngineIds: presetIds,
  seed: 'qa smoke test',
  energy: 4,
});
assertRange(fallback.style, TARGETS.style.min, TARGETS.style.max, 'STYLE');
assertRange(fallback.lyrics, TARGETS.lyrics.min, TARGETS.lyrics.max, 'LYRICS');
assertRange(fallback.caption, TARGETS.caption.min, TARGETS.caption.max, 'CAPTION');
assert.ok(fallback.lyrics.includes(favoriteEngine.name), 'Procedural fallback should carry active Composition engine into control lyrics');

console.log('Composition Lab QA: PASS');
console.log(JSON.stringify({
  registry: COMPOSITION_ENGINES.length,
  normalizedSelectionSize: normalized.length,
  seededBuildSize: seeded.length,
  favoriteSignals: favoriteSignals.length,
  presets: presets.length,
  wholeStacks: wholeStacks.length,
  recentBuilds: recent.length,
  fallbackLengths: {
    style: fallback.style.length,
    lyrics: fallback.lyrics.length,
    caption: fallback.caption.length,
  },
}, null, 2));
