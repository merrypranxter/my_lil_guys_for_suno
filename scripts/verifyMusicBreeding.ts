import assert from 'node:assert/strict';
import {
  MUSIC_SEED_RECIPES,
  compileMusicStack,
  getMusicMechanism,
  normalizeMusicStack,
} from '../src/data/musicSeedSystem';
import {
  breedMusicGenome,
  genomeToStackItem,
  parentFromGenome,
  parentFromRecipe,
} from '../src/lib/musicBreeding';

const parentARecipe = MUSIC_SEED_RECIPES.find((recipe) => recipe.id === 'coupled-stampede');
const parentBRecipe = MUSIC_SEED_RECIPES.find((recipe) => recipe.id === 'panic-engine');
assert.ok(parentARecipe, 'Coupled Stampede recipe must exist');
assert.ok(parentBRecipe, 'Panic Engine recipe must exist');

const parentA = parentFromRecipe(parentARecipe);
const parentB = parentFromRecipe(parentBRecipe);

const child1 = breedMusicGenome(parentA, parentB, 'same-seed');
const child2 = breedMusicGenome(parentA, parentB, 'same-seed');

assert.equal(child1.id, child2.id, 'Same parents + same seed should reproduce child ID');
assert.deepEqual(child1.mechanismIds, child2.mechanismIds, 'Same parents + same seed should reproduce mechanism crossover');
assert.deepEqual(child1.controls, child2.controls, 'Same parents + same seed should reproduce inherited controls');
assert.equal(child1.lineage.relationshipLaw, child2.lineage.relationshipLaw, 'Same parents + same seed should reproduce relationship law');
assert.equal(child1.lineage.invariant, child2.lineage.invariant, 'Same parents + same seed should reproduce invariant');
assert.equal(child1.generation, 1, 'Two built-in G0 parents should produce G1 offspring');

assert.ok(child1.lineage.inheritedFromA.length >= 1, 'Child should inherit at least one mechanism from parent A');
assert.ok(child1.lineage.inheritedFromB.length >= 1, 'Child should inherit at least one mechanism from parent B');
assert.ok(child1.mechanismIds.length >= 3 && child1.mechanismIds.length <= 7, 'Child genome should stay bounded');
assert.ok(
  child1.lineage.inheritedFromA.every((id) => parentA.mechanismIds.includes(id)),
  'Parent A receipt may only claim actual parent A mechanisms'
);
assert.ok(
  child1.lineage.inheritedFromB.every((id) => parentB.mechanismIds.includes(id)),
  'Parent B receipt may only claim actual parent B mechanisms'
);
if (child1.lineage.mutationMechanismId) {
  assert.ok(getMusicMechanism(child1.lineage.mutationMechanismId), 'Mutation must be a valid mechanism');
  assert.ok(!parentA.mechanismIds.includes(child1.lineage.mutationMechanismId), 'Mutation should not already exist in parent A');
  assert.ok(!parentB.mechanismIds.includes(child1.lineage.mutationMechanismId), 'Mutation should not already exist in parent B');
}

const stackItem = genomeToStackItem(child1, 88);
const normalizedStack = normalizeMusicStack([stackItem]);
assert.equal(normalizedStack.length, 1, 'Embedded genome should survive stack normalization');
assert.equal(normalizedStack[0].kind, 'genome', 'Normalized child should remain a genome item');
assert.equal(normalizedStack[0].genome?.id, child1.id, 'Embedded genome ID should be preserved');

const compiled = compileMusicStack(normalizedStack, child1.controls);
assert.equal(compiled.genomes.length, 1, 'Compiled stack should retain active genome metadata');
assert.ok(compiled.mechanisms.length >= 3, 'Compiled genome should expand into its mechanisms');
assert.ok(
  compiled.interactions.some((line) => line.includes('GENOME LAW') && line.includes(child1.name)),
  'Genome invariant/relationship law should reach interaction compiler'
);

const secondGeneration = breedMusicGenome(parentFromGenome(child1), parentA, 'generation-two');
assert.equal(secondGeneration.generation, 2, 'G1 × G0 should produce G2');
assert.equal(secondGeneration.lineage.parentA.kind, 'genome', 'Second-generation lineage should record bred parent kind');

const differentSeed = breedMusicGenome(parentA, parentB, 'different-seed');
assert.notEqual(
  child1.lineage.breedingSeed,
  differentSeed.lineage.breedingSeed,
  'Different breeding seed should be recorded separately'
);

const invalid = normalizeMusicStack([
  {
    instanceId: 'bad',
    kind: 'genome',
    refId: 'fake',
    muted: false,
    locked: false,
    strength: 80,
    genome: {
      id: 'different-id',
      name: 'INVALID',
      mechanismIds: ['does-not-exist'],
    },
  },
]);
assert.equal(invalid.length, 0, 'Malformed/unresolvable embedded genomes must be rejected');

console.log(
  'Music genetics verification passed:',
  child1.name,
  'G' + child1.generation,
  child1.mechanismIds.length + ' genes,',
  child1.lineage.mutationMechanismId ? 'mutation=' + child1.lineage.mutationMechanismId : 'no mutation',
  '| second generation=' + secondGeneration.name
);
