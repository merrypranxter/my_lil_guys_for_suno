import assert from 'node:assert/strict';
import {
  applyMouthQuirk,
  breedMouthGenome,
  breedMouthSpecies,
  buildMouthNoveltySignals,
  captureMouthSpecimen,
  instantiateMouthQuirk,
  mouthGenomePhenotypeSignature,
} from '../src/mouthLab';
import {
  getMouthFitnessRecords,
  promoteMouthGenomeFromRun,
  saveGeneratedRun,
  updateArchivedRun,
} from '../src/lib/localStorage';
import { loadMouthLabArchive } from '../src/mouthLab/persistence';
import { normalizePetriDishChallenge } from '../src/lib/petriDish';

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.has(key) ? this.data.get(key)! : null; }
  setItem(key: string, value: string) { this.data.set(key, String(value)); }
  removeItem(key: string) { this.data.delete(key); }
  clear() { this.data.clear(); }
  key(index: number) { return [...this.data.keys()][index] || null; }
  get length() { return this.data.size; }
}
(globalThis as any).localStorage = new MemoryStorage();

const parentA0 = breedMouthGenome({
  parentDonorIds: ['mouth-donor-english', 'mouth-donor-spanish'],
  breedingSeed: 'job7-parent-a',
  objectiveId: 'mouth-objective-pathological-consistency',
  semanticAnchorLanguageProfileId: 'lang-english',
  intelligibility: 94,
  stability: 88,
  mutation: 80,
  manualAssignments: [
    {
      axis: 'consonants',
      donorId: 'mouth-donor-spanish',
      traitIds: ['mouth-trait-alveolar-trill'],
      pressure: 'obsessive',
    },
  ],
}).genome;

const parentA = applyMouthQuirk(
  parentA0,
  instantiateMouthQuirk(
    'mouth-quirk-global-r-trill',
    { frequency: 100, consistency: 100, exaggeration: 98 },
    'job7-parent-a-r',
  ),
);

const parentB = breedMouthGenome({
  parentDonorIds: ['mouth-donor-english', 'mouth-donor-xhosa'],
  breedingSeed: 'job7-parent-b',
  objectiveId: 'mouth-objective-mouth-percussion',
  semanticAnchorLanguageProfileId: 'lang-english',
  intelligibility: 86,
  stability: 75,
  mutation: 75,
  manualAssignments: [
    {
      axis: 'consonants',
      donorId: 'mouth-donor-xhosa',
      traitIds: ['mouth-trait-click-bantu'],
      pressure: 'high',
    },
  ],
}).genome;

const specimen = captureMouthSpecimen({
  name: 'MORA STOWAWAY',
  observedBehavior: 'The syllable timing suddenly became evenly cellular and length started consuming extra timing slots.',
  whyLiked: 'It made the mouth behave like a little timing machine.',
  linkedTraitIds: ['mouth-trait-mora-timing'],
  recurrence: 'repeated',
});

const childA = breedMouthSpecies({
  parentA,
  parentB,
  breedingSeed: 'job7-child-stable',
  specimenAssist: [specimen],
  mutationChance: 100,
});
const childARepeat = breedMouthSpecies({
  parentA,
  parentB,
  breedingSeed: 'job7-child-stable',
  specimenAssist: [specimen],
  mutationChance: 100,
});

assert.equal(childA.genome.id, childARepeat.genome.id, 'Same species parents + seed should reproduce the same child identity.');
assert.equal(childA.lineage.generation, 1, 'First species×species offspring should be G1.');
assert.ok(childA.lineage.inheritedTraitIdsByParent[parentA.id]?.length, 'Parent A must contribute active trait genetics.');
assert.ok(childA.lineage.inheritedTraitIdsByParent[parentB.id]?.length, 'Parent B must contribute active trait genetics.');
assert.deepEqual(childA.lineage.specimenIds, [specimen.id], 'Specimen assist should be recorded in lineage.');
assert.equal(childA.genome.semanticAnchorLanguageProfileId, 'lang-english', 'Shared English semantic anchor should survive species breeding.');
assert.equal(mouthGenomePhenotypeSignature(childA.genome), mouthGenomePhenotypeSignature(childARepeat.genome), 'Phenotype signature should be stable.');

let specimenMutationFound = false;
for (let index = 0; index < 80; index += 1) {
  const result = breedMouthSpecies({
    parentA,
    parentB,
    breedingSeed: 'job7-specimen-mutant-' + index,
    specimenAssist: [specimen],
    mutationChance: 100,
  });
  if (result.lineage.mutationTraitIds.includes('mouth-trait-mora-timing')) {
    specimenMutationFound = true;
    assert.ok(
      result.genome.assignments.some((assignment) => assignment.traitIds.includes('mouth-trait-mora-timing')),
      'A specimen-assisted trait mutation must actually enter the child genotype.',
    );
    break;
  }
}
assert.ok(specimenMutationFound, 'Specimen assistance should be capable of bounded novel trait mutation.');

const recent = Array.from({ length: 8 }, (_, index) => ({
  ...parentA,
  id: parentA.id + '-recent-' + index,
}));
const noveltySignals = buildMouthNoveltySignals(recent, 8);
assert.ok(
  noveltySignals.some((signal) => signal.includes('ALVEOLAR TRILL')),
  'Repeated mouth genes should generate anti-monoculture cooldown signals.',
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
  mouthGenome: parentA,
  mouthPromptMode: 'bracketed',
  mouthSemanticMode: 'englishMeaningAlienMouth',
  seed: 'job7 starred mouth fitness',
  energy: 4,
  model: 'qa',
  style: 'style',
  lyrics: 'lyrics',
  caption: 'caption',
  charCounts: { style: 5, lyrics: 6, caption: 7 },
});

const starred = updateArchivedRun(run.id, {
  starred: true,
  feedback: 'The absurd R commitment was the thing I liked.',
  likedMouthTraitIds: ['mouth-trait-alveolar-trill'],
  dislikedMouthTraitIds: [],
  likedMouthQuirkIds: ['mouth-quirk-global-r-trill'],
  dislikedMouthQuirkIds: [],
});
assert.ok(starred, 'Starred run update should succeed.');
assert.equal(promoteMouthGenomeFromRun(starred!), true, 'Starred Mouth Lab run should create fitness and breeding stock.');

const fitness = getMouthFitnessRecords();
assert.equal(fitness.length, 1, 'Mouth phenotype fitness should dedupe by phenotype signature.');
assert.ok(fitness[0].likedTraitIds.includes('mouth-trait-alveolar-trill'), 'Explicit liked mouth trait should persist.');
assert.ok(fitness[0].likedQuirkIds.includes('mouth-quirk-global-r-trill'), 'Explicit liked mouth quirk should persist.');

const archive = loadMouthLabArchive(localStorage);
assert.ok(archive.species.some((species) => species.id === parentA.id), 'Starred mouth phenotype should enter durable species breeding stock.');

const petriChallenge = normalizePetriDishChallenge({
  guyIds: ['taxonomy-goblin'],
  realityEngineIds: [],
  compositionEngineIds: [],
  realityChaos: 2,
  seed: 'frozen challenge',
  energy: 4,
  baseMusicStack: [],
  baseMusicControls: {
    stemminess: 50,
    kineticDensity: 50,
    socialInfection: 50,
    coupling: 50,
    interruption: 50,
    anchorStrength: 50,
    castSize: 3,
  },
  recentFingerprints: [],
  likedSignals: [],
  mouthGenome: childA.genome,
  mouthPromptMode: 'descriptive',
  mouthSemanticMode: 'englishMeaningAlienMouth',
});
assert.equal(petriChallenge.mouthGenome?.id, childA.genome.id, 'Petri challenge should freeze the active mouth genome.');
assert.equal(petriChallenge.mouthPromptMode, 'descriptive', 'Petri challenge should freeze mouth compiler mode.');
assert.equal(petriChallenge.mouthSemanticMode, 'englishMeaningAlienMouth', 'Petri challenge should freeze mouth semantic mode.');

console.log('Mouth Lab Job 7 evolution/QA verification passed.');
console.log('  child:', childA.genome.id);
console.log('  phenotype:', mouthGenomePhenotypeSignature(childA.genome));
console.log('  novelty signals:', noveltySignals.length);
console.log('  fitness records:', fitness.length);
console.log('  archived species:', archive.species.length);
