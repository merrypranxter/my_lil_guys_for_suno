import assert from 'node:assert/strict';
import {
  MUSIC_SEED_RECIPES,
  compileMusicStack,
  dedupeMusicStackForGeneration,
  musicGenomePhenotypeSignature,
} from '../src/data/musicSeedSystem';
import {
  breedMusicGenome,
  genomeToStackItem,
  parentFromRecipe,
} from '../src/lib/musicBreeding';
import { buildMasterPrompt } from '../src/lib/buildGenerationPrompt';

const parentARecipe = MUSIC_SEED_RECIPES.find((recipe) => recipe.id === 'coupled-stampede');
const parentBRecipe = MUSIC_SEED_RECIPES.find((recipe) => recipe.id === 'panic-engine');
assert.ok(parentARecipe && parentBRecipe, 'Required recipes must exist');

const parentA = parentFromRecipe(parentARecipe);
const parentB = parentFromRecipe(parentBRecipe);
const genome = breedMusicGenome(parentA, parentB, 'phase-3-surgery', 'DO NOT LEAK THIS GENOME NAME');

const renamedClone = {
  ...genome,
  id: genome.id + '_clone',
  name: 'TOTALLY DIFFERENT DISPLAY NAME',
  generation: genome.generation + 7,
  createdAt: genome.createdAt + 12345,
  lineage: {
    ...genome.lineage,
    parentA: { ...genome.lineage.parentA, name: 'SECRET PARENT ALPHA' },
    parentB: { ...genome.lineage.parentB, name: 'SECRET PARENT OMEGA' },
  },
};

assert.equal(
  musicGenomePhenotypeSignature(genome),
  musicGenomePhenotypeSignature(renamedClone),
  'Display name, ID, generation, timestamps, and parent names must not alter phenotype identity.'
);

const mutatedClone = {
  ...renamedClone,
  lineage: {
    ...renamedClone.lineage,
    relationshipLaw: renamedClone.lineage.relationshipLaw + ' Additional musical consequence.',
  },
};
assert.notEqual(
  musicGenomePhenotypeSignature(genome),
  musicGenomePhenotypeSignature(mutatedClone),
  'Changing a real phenotype law must change phenotype identity.'
);

const duplicateRecipes = [
  {
    instanceId: 'recipe-low',
    kind: 'recipe' as const,
    refId: 'coupled-stampede',
    muted: false,
    locked: false,
    strength: 60,
  },
  {
    instanceId: 'recipe-high',
    kind: 'recipe' as const,
    refId: 'coupled-stampede',
    muted: false,
    locked: false,
    strength: 90,
  },
];
const singleRecipe = [duplicateRecipes[1]];

const duplicateRecipeCompiled = compileMusicStack(duplicateRecipes);
const singleRecipeCompiled = compileMusicStack(singleRecipe);
assert.equal(duplicateRecipeCompiled.recipes.length, 1, 'Duplicate recipe macros must compile once.');
assert.equal(duplicateRecipeCompiled.suppressedDuplicates.length, 1);
assert.deepEqual(
  duplicateRecipeCompiled.mechanisms.map((entry) => [entry.mechanism.id, entry.strength]),
  singleRecipeCompiled.mechanisms.map((entry) => [entry.mechanism.id, entry.strength]),
  'Duplicate recipe copies must not reinforce mechanism strength.'
);

const duplicateMechanisms = [
  {
    instanceId: 'mechanism-a',
    kind: 'mechanism' as const,
    refId: 'vocal-relay',
    muted: false,
    locked: false,
    strength: 55,
  },
  {
    instanceId: 'mechanism-b',
    kind: 'mechanism' as const,
    refId: 'vocal-relay',
    muted: false,
    locked: false,
    strength: 97,
  },
];
const dedupedMechanisms = dedupeMusicStackForGeneration(duplicateMechanisms);
assert.equal(dedupedMechanisms.stack.length, 1);
assert.equal(dedupedMechanisms.stack[0].strength, 97, 'Strongest explicit duplicate must win.');
assert.equal(dedupedMechanisms.suppressedDuplicates[0].count, 1);

const genomeItemA = genomeToStackItem(genome, 70);
const genomeItemB = {
  ...genomeToStackItem(renamedClone, 92),
  instanceId: 'renamed-phenotype-copy',
};
const compiledGenomes = compileMusicStack([genomeItemA, genomeItemB], genome.controls);
assert.equal(compiledGenomes.genomes.length, 1, 'Same phenotype under different genealogy labels must compile once.');
assert.equal(compiledGenomes.genomePhenotypes.length, 1);
assert.equal(compiledGenomes.suppressedDuplicates.reduce((sum, item) => sum + item.count, 0), 1);
assert(
  compiledGenomes.interactions.some((line) => line.includes('GENOME PHENOTYPE LAW')),
  'Generation should receive phenotype law, not genealogy narrative.'
);

const prompt = buildMasterPrompt({
  guyIds: ['taxonomy-goblin'],
  musicStack: [genomeItemA, genomeItemB],
  musicControls: genome.controls,
  seed: 'a fluorescent tesseract filing taxes in zero gravity',
  energy: 4,
});

for (const forbidden of [
  genome.name,
  renamedClone.name,
  genome.lineage.parentA.name,
  genome.lineage.parentB.name,
  renamedClone.lineage.parentA.name,
  renamedClone.lineage.parentB.name,
]) {
  assert(!prompt.userPrompt.includes(forbidden), 'Genealogy metadata leaked into generation prompt: ' + forbidden);
}

assert(prompt.userPrompt.includes('ACTIVE BRED GENOME PHENOTYPES:'));
assert(prompt.userPrompt.includes('Duplicate copies NEVER increase strength'));
assert(prompt.userPrompt.includes(musicGenomePhenotypeSignature(genome)));

console.log(
  'Genome surgery verified:',
  'phenotype identity ignores genealogy labels,',
  'duplicate recipes/mechanisms/genomes do not secretly stack weight,',
  'and generation receives musical phenotype laws without family-tree leakage.'
);
