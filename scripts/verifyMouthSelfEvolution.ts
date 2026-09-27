import assert from 'node:assert/strict';
import {
  applyMouthEnvironment,
  breedMouthGenome,
  evolveMouthSpecies,
} from '../src/mouthLab';

const base = breedMouthGenome({
  parentDonorIds: ['mouth-donor-english', 'mouth-donor-navajo'],
  breedingSeed: 'self-evolution-base',
  objectiveId: 'mouth-objective-pathological-consistency',
  semanticAnchorLanguageProfileId: 'lang-english',
  intelligibility: 88,
  stability: 74,
  mutation: 64,
  manualAssignments: [
    {
      axis: 'vowels',
      donorId: 'mouth-donor-navajo',
      traitIds: ['mouth-trait-ejective-attack'],
      pressure: 'high',
    },
  ],
}).genome;

const raised = applyMouthEnvironment(base, {
  mode: 'exposure',
  sourceDonorId: 'mouth-donor-tashlhiyt',
  pressure: 82,
  generations: 5,
  seed: 'tashlhiyt-childhood',
});

const originalParents = [...raised.parentDonorIds];
assert.ok(!originalParents.includes('mouth-donor-tashlhiyt'), 'environment must start outside ancestry');

const first = evolveMouthSpecies({
  parent: raised,
  evolutionSeed: 'self-evolution-stable',
  mutationChance: 72,
});
const firstRepeat = evolveMouthSpecies({
  parent: raised,
  evolutionSeed: 'self-evolution-stable',
  mutationChance: 72,
});

assert.equal(first.genome.id, firstRepeat.genome.id, 'same parent + seed must reproduce the same descendant');
assert.equal(first.lineage.generation, 1, 'G0 self-evolution should produce G1');
assert.deepEqual(first.lineage.parentGenomeIds, [raised.id], 'self-evolution must have exactly one genome parent');
assert.deepEqual(first.lineage.parentNames, [raised.name], 'self-evolution lineage should name the one parent');
assert.deepEqual(first.genome.parentDonorIds, originalParents, 'self-evolution must preserve true donor ancestry');
assert.ok(!first.genome.parentDonorIds.includes('mouth-donor-tashlhiyt'), 'environment must not become a donor parent');
assert.equal(first.genome.environment?.sourceDonorId, 'mouth-donor-tashlhiyt', 'current environment may continue with the lineage');
assert.equal(first.genome.environment?.generations, 6, 'active environment should age one generation with the lineage');
assert.ok(first.lineage.inheritedTraitIdsByParent[raised.id]?.length, 'parent active traits should be recorded as inherited');

const second = evolveMouthSpecies({
  parent: first.genome,
  evolutionSeed: 'self-evolution-next',
  mutationChance: 72,
});

assert.equal(second.lineage.generation, 2, 'evolving G1 should produce G2');
assert.deepEqual(second.lineage.parentGenomeIds, [first.genome.id], 'G2 parent must be the lived G1 state, not the original ancestor');
assert.deepEqual(second.genome.parentDonorIds, originalParents, 'ancestry must stay stable across repeated self-evolution');
assert.equal(second.genome.environment?.generations, 7, 'environmental exposure should continue advancing one generation at a time');

const conservative = evolveMouthSpecies({
  parent: raised,
  evolutionSeed: 'self-evolution-conservative',
  mutationChance: 0,
});

assert.equal(conservative.lineage.generation, 1, 'even a conservative generation should advance lineage time');
assert.deepEqual(conservative.genome.parentDonorIds, originalParents, 'zero mutation must not alter ancestry');
assert.equal(conservative.lineage.mutationTraitIds.length, 0, 'zero mutation should not activate a new parent gene');
assert.equal(conservative.lineage.mutationQuirkIds.length, 0, 'zero mutation should not mutate quirk expression');

let dormantGeneActivated = false;
for (let index = 0; index < 80; index += 1) {
  const result = evolveMouthSpecies({
    parent: raised,
    evolutionSeed: 'self-evolution-dormant-' + index,
    mutationChance: 100,
  });
  if (result.lineage.mutationTraitIds.length) {
    dormantGeneActivated = true;
    for (const traitId of result.lineage.mutationTraitIds) {
      const donorAssignment = result.genome.assignments.find((assignment) => assignment.traitIds.includes(traitId));
      assert.ok(donorAssignment?.donorId, 'activated gene should retain a donor assignment');
      assert.ok(
        originalParents.includes(donorAssignment!.donorId!),
        'newly activated self-evolution genes must come from true parent ancestry',
      );
    }
    break;
  }
}
assert.ok(dormantGeneActivated, 'high mutation pressure should be capable of activating a dormant gene from existing ancestry');

console.log('Mouth Lab self-evolution verification passed:', {
  base: raised.id,
  g1: first.genome.id,
  g2: second.genome.id,
  parents: originalParents,
  environmentGenerations: second.genome.environment?.generations,
});
