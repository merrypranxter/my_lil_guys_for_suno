import assert from 'node:assert/strict';
import {
  DEFAULT_MUSIC_CONTROLS,
  MUSIC_MECHANISMS,
  MUSIC_SEED_RECIPES,
  musicGenomePhenotypeSignature,
} from '../src/data/musicSeedSystem';
import {
  breedMusicGenome,
  genomeToStackItem,
  MusicBreedingParent,
  parentFromRecipe,
} from '../src/lib/musicBreeding';
import {
  getBredMusicGenomes,
  getGenomeFitnessRecord,
  getGenomeMechanismFitness,
  getMusicMechanismFitnessScores,
  getRunArchive,
  promoteBredMusicGenome,
  promoteGenomesFromRun,
  saveGeneratedRun,
  updateArchivedRun,
} from '../src/lib/localStorage';

class MemoryStorage {
  private data = new Map<string, string>();
  get length(): number { return this.data.size; }
  clear(): void { this.data.clear(); }
  getItem(key: string): string | null { return this.data.has(key) ? this.data.get(key)! : null; }
  key(index: number): string | null { return Array.from(this.data.keys())[index] ?? null; }
  removeItem(key: string): void { this.data.delete(key); }
  setItem(key: string, value: string): void { this.data.set(String(key), String(value)); }
}

(globalThis as any).localStorage = new MemoryStorage();
localStorage.clear();

const recipeA = MUSIC_SEED_RECIPES.find((recipe) => recipe.id === 'coupled-stampede');
const recipeB = MUSIC_SEED_RECIPES.find((recipe) => recipe.id === 'panic-engine');
assert.ok(recipeA && recipeB, 'Required breeding recipes should exist.');

const temporaryChild = breedMusicGenome(
  parentFromRecipe(recipeA),
  parentFromRecipe(recipeB),
  'fitness-temporary'
);

assert.equal(
  getBredMusicGenomes().length,
  0,
  'Being born must not automatically grant durable breeding status.'
);

const likedGene = temporaryChild.mechanismIds[0];
const dislikedGene =
  temporaryChild.mechanismIds.find((id) => id !== likedGene) || temporaryChild.mechanismIds[0];

promoteBredMusicGenome(temporaryChild, {
  reason: 'manual-promotion',
  likedMechanismIds: [likedGene],
  dislikedMechanismIds: [dislikedGene],
  note: 'QA explicit promotion',
});

assert.equal(getBredMusicGenomes().length, 1, 'Explicit promotion should admit a genome to durable breeding stock.');
const manualFitness = getGenomeFitnessRecord(temporaryChild);
assert.ok(manualFitness?.approved, 'Promoted phenotype should have an approved fitness record.');
assert.ok(manualFitness?.likedMechanismIds.includes(likedGene), 'Positive trait fitness should persist.');
if (dislikedGene !== likedGene) {
  assert.ok(manualFitness?.dislikedMechanismIds.includes(dislikedGene), 'Negative trait fitness should persist.');
}

localStorage.clear();

const run = saveGeneratedRun({
  guyIds: ['taxonomy-goblin'],
  realityEngineIds: [],
  compositionEngineIds: [],
  musicStack: [genomeToStackItem(temporaryChild, 88)],
  musicControls: temporaryChild.controls,
  realityChaos: 2,
  seed: 'fitness run',
  energy: 4,
  model: 'qa',
  style: 'style',
  lyrics: 'lyrics',
  caption: 'caption',
  charCounts: { style: 5, lyrics: 6, caption: 7 },
});

assert.equal(getBredMusicGenomes().length, 0, 'Archiving an unstarred run must not promote its genome.');

const starred = updateArchivedRun(run.id, {
  starred: true,
  feedback: 'Keep the first gene; suppress the second.',
  likedMechanismIds: [likedGene],
  dislikedMechanismIds: dislikedGene === likedGene ? [] : [dislikedGene],
});
assert.ok(starred, 'Starred archive update should succeed.');

const promotedCount = promoteGenomesFromRun(starred!);
assert.equal(promotedCount, 1, 'A starred run should promote each unique active genome phenotype once.');
assert.equal(getBredMusicGenomes().length, 1, 'Starred-run genome should enter durable breeding stock.');

const starredRecord = getGenomeFitnessRecord(temporaryChild);
assert.ok(starredRecord?.sourceRunIds.includes(run.id), 'Fitness record should remember the source run.');
assert.equal(starredRecord?.reason, 'starred-run');

const scores = getMusicMechanismFitnessScores();
assert.ok((scores[likedGene] || 0) > 0, 'Explicit INHERIT vote must create positive mechanism fitness.');
if (dislikedGene !== likedGene) {
  assert.ok((scores[dislikedGene] || 0) < 0, 'Explicit SUPPRESS vote must create negative mechanism fitness.');
}

const genomeFitness = getGenomeMechanismFitness(temporaryChild);
assert.ok((genomeFitness[likedGene] || 0) > 0, 'Promoted genome should expose positive inherited fitness.');
if (dislikedGene !== likedGene) {
  assert.ok((genomeFitness[dislikedGene] || 0) < 0, 'Promoted genome should expose negative inherited fitness.');
}

const ids = MUSIC_MECHANISMS.map((mechanism) => mechanism.id);
assert.ok(ids.length >= 10, 'Need enough mechanisms for fitness-biased crossover QA.');

const parentAIds = ids.slice(0, 7);
const parentBIds = ids.slice(7, 10);
const favored = parentAIds[0];
const suppressed = parentAIds[parentAIds.length - 1];

const parentA: MusicBreedingParent = {
  ref: { id: 'fitness-a', name: 'FITNESS A', kind: 'genome', generation: 1 },
  mechanismIds: parentAIds,
  controls: DEFAULT_MUSIC_CONTROLS,
  mechanismFitness: {
    [favored]: 1,
    [suppressed]: -1,
  },
};
const parentB: MusicBreedingParent = {
  ref: { id: 'fitness-b', name: 'FITNESS B', kind: 'genome', generation: 1 },
  mechanismIds: parentBIds,
  controls: DEFAULT_MUSIC_CONTROLS,
  mechanismFitness: {},
};

let favoredCount = 0;
let suppressedCount = 0;
for (let i = 0; i < 80; i += 1) {
  const child = breedMusicGenome(parentA, parentB, 'fitness-bias-' + i);
  if (child.mechanismIds.includes(favored)) favoredCount += 1;
  if (child.mechanismIds.includes(suppressed)) suppressedCount += 1;
}

assert.ok(
  favoredCount > suppressedCount,
  'Positive fitness should inherit more often than explicitly suppressed fitness across a cohort.'
);

const deterministicA = breedMusicGenome(parentA, parentB, 'deterministic-fitness');
const deterministicB = breedMusicGenome(parentA, parentB, 'deterministic-fitness');
assert.equal(
  musicGenomePhenotypeSignature(deterministicA),
  musicGenomePhenotypeSignature(deterministicB),
  'Fitness-biased crossover must remain deterministic for same parents + seed.'
);

assert.equal(getRunArchive()[0].likedMechanismIds?.[0], likedGene);
console.log(
  'Fitness selection verified:',
  'birth != durable parenthood,',
  'star/manual promotion admits genomes,',
  'trait-level positive/negative fitness persists,',
  'and favored inheritance beats suppressed inheritance (' + favoredCount + ' vs ' + suppressedCount + ').'
);
