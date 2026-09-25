import assert from 'node:assert/strict';
import { breedMouthGenome, instantiateMouthQuirk, applyMouthQuirk } from '../src/mouthLab';
import {
  getLastMouthGenome,
  getRunArchive,
  getSavedMouthPromptMode,
  getSavedMouthSemanticMode,
  getSavedStacks,
  runToMarkdown,
  saveGeneratedRun,
  saveStackToFavorites,
  setLastMouthGenome,
  setSavedMouthPromptMode,
  setSavedMouthSemanticMode,
} from '../src/lib/localStorage';

class MemoryStorage {
  private data = new Map<string, string>();

  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null;
  }

  setItem(key: string, value: string) {
    this.data.set(key, String(value));
  }

  removeItem(key: string) {
    this.data.delete(key);
  }

  clear() {
    this.data.clear();
  }

  key(index: number) {
    return [...this.data.keys()][index] || null;
  }

  get length() {
    return this.data.size;
  }
}

(globalThis as any).localStorage = new MemoryStorage();

const base = breedMouthGenome({
  parentDonorIds: [
    'mouth-donor-english',
    'mouth-donor-spanish',
    'mouth-donor-xhosa',
  ],
  breedingSeed: 'job-5-ui-test',
  objectiveId: 'mouth-objective-pathological-consistency',
  semanticAnchorLanguageProfileId: 'lang-english',
  intelligibility: 91,
  stability: 88,
  mutation: 67,
  manualAssignments: [
    {
      axis: 'consonants',
      donorId: 'mouth-donor-spanish',
      traitIds: ['mouth-trait-alveolar-trill'],
      pressure: 'obsessive',
    },
  ],
}).genome;

const quirk = instantiateMouthQuirk(
  'mouth-quirk-global-r-trill',
  { frequency: 100, consistency: 100, exaggeration: 98 },
  'job-5-ui-rrrr',
);
const genome = applyMouthQuirk(base, quirk);

setLastMouthGenome(genome);
setSavedMouthPromptMode('descriptive');
setSavedMouthSemanticMode('englishMeaningAlienMouth');

const restored = getLastMouthGenome();
assert.ok(restored, 'Active Mouth Lab genome should persist.');
assert.equal(restored!.id, genome.id, 'Persisted active genome identity should survive normalization.');
assert.equal(getSavedMouthPromptMode(), 'descriptive', 'Prompt mode should persist.');
assert.equal(
  getSavedMouthSemanticMode(),
  'englishMeaningAlienMouth',
  'Semantic mode should persist.',
);

saveStackToFavorites(
  'Mouth stack',
  ['taxonomy-goblin'],
  [],
  2,
  [],
  [],
  {
    stemminess: 50,
    kineticDensity: 50,
    socialInfection: 50,
    coupling: 50,
    interruption: 50,
    anchorStrength: 50,
    castSize: 3,
  },
  genome,
  'bracketed',
  'englishMeaningAlienMouth',
);

const stacks = getSavedStacks();
assert.equal(stacks.length, 1, 'Saved whole stack should exist.');
assert.equal(stacks[0].mouthGenome?.id, genome.id, 'Saved stack should carry the Mouth Lab genome.');
assert.equal(stacks[0].mouthPromptMode, 'bracketed', 'Saved stack should carry compiler mode.');
assert.equal(
  stacks[0].mouthSemanticMode,
  'englishMeaningAlienMouth',
  'Saved stack should carry semantic mode.',
);

const run = saveGeneratedRun({
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
    castSize: 3,
  },
  realityChaos: 2,
  mouthGenome: genome,
  mouthPromptMode: 'compact',
  mouthSemanticMode: 'englishMeaningAlienMouth',
  seed: 'RRRR vocal organism',
  energy: 4,
  model: 'qa',
  style: 'style',
  lyrics: 'lyrics',
  caption: 'caption',
  charCounts: { style: 5, lyrics: 6, caption: 7 },
});

const runs = getRunArchive();
assert.equal(runs.length, 1, 'Generated run should be archived.');
assert.equal(runs[0].mouthGenome?.id, genome.id, 'Archived run should retain mouth genome.');
assert.equal(runs[0].mouthPromptMode, 'compact', 'Archived run should retain prompt mode.');
assert.equal(
  runs[0].mouthSemanticMode,
  'englishMeaningAlienMouth',
  'Archived run should retain semantic mode.',
);

const markdown = runToMarkdown(run);
assert.ok(markdown.includes('Mouth Lab genome:'), 'Run export should document Mouth Lab.');
assert.ok(markdown.includes(genome.name), 'Run export should name the active mouth genome.');
assert.ok(
  markdown.includes('englishMeaningAlienMouth'),
  'Run export should preserve Mouth Lab semantic mode.',
);

setLastMouthGenome(undefined);
assert.equal(getLastMouthGenome(), undefined, 'Active mouth should be clearable without corrupting storage.');

console.log('Mouth Lab Job 5 UI persistence verification passed.');
console.log('  genome:', genome.id);
console.log('  saved stack mouth:', stacks[0].mouthGenome?.id);
console.log('  archived run mouth:', runs[0].mouthGenome?.id);
