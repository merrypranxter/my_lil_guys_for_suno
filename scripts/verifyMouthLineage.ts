import assert from 'node:assert/strict';
import {
  breedMouthGenome,
  breedMouthSpecies,
  evolveMouthSpecies,
  createEmptyMouthLabArchive,
  normalizeMouthLabArchive,
  upsertMouthSpecies,
} from '../src/mouthLab';

const founderA = breedMouthGenome({
  parentDonorIds: ['mouth-donor-english', 'mouth-donor-yoruba'],
  breedingSeed: 'lineage-founder-a',
  objectiveId: 'mouth-objective-distance-from-english',
  intelligibility: 82,
  stability: 70,
  mutation: 48,
}).genome;

const founderB = breedMouthGenome({
  parentDonorIds: ['mouth-donor-hungarian', 'mouth-donor-navajo'],
  breedingSeed: 'lineage-founder-b',
  objectiveId: 'mouth-objective-pathological-consistency',
  intelligibility: 76,
  stability: 68,
  mutation: 52,
}).genome;

assert.equal(founderA.lineage, undefined, 'freshly bred donor crosses should be G0 founders');
assert.equal(founderB.lineage, undefined, 'second donor cross should also be G0 founder');

const child = breedMouthSpecies({
  parentA: founderA,
  parentB: founderB,
  breedingSeed: 'lineage-child',
}).genome;

assert.equal(child.lineage?.generation, 1, 'two G0 founders should produce G1');
assert.deepEqual(
  child.lineage?.parentGenomeIds,
  [founderA.id, founderB.id],
  'G1 must store real genome parent IDs',
);
assert.deepEqual(
  child.lineage?.parentNames,
  [founderA.name, founderB.name],
  'G1 must store parent display names',
);
assert.ok(
  child.lineage?.inheritedTraitIdsByParent[founderA.id]?.length,
  'G1 should record inherited traits from parent A',
);
assert.ok(
  child.lineage?.inheritedTraitIdsByParent[founderB.id]?.length,
  'G1 should record inherited traits from parent B',
);

const grandchild = evolveMouthSpecies({
  parent: child,
  evolutionSeed: 'lineage-grandchild',
  mutationChance: 35,
}).genome;

assert.equal(grandchild.lineage?.generation, 2, 'self-evolving G1 should produce G2');
assert.deepEqual(
  grandchild.lineage?.parentGenomeIds,
  [child.id],
  'G2 self-evolution must point at the lived G1 state',
);
assert.deepEqual(
  grandchild.lineage?.parentNames,
  [child.name],
  'G2 should preserve the lived G1 parent name',
);

let archive = createEmptyMouthLabArchive();
archive = upsertMouthSpecies(archive, founderA);
archive = upsertMouthSpecies(archive, founderB);
archive = upsertMouthSpecies(archive, child);
archive = upsertMouthSpecies(archive, grandchild);
archive = normalizeMouthLabArchive(archive);

const restoredChild = archive.species.find((item) => item.id === child.id);
const restoredGrandchild = archive.species.find((item) => item.id === grandchild.id);

assert.deepEqual(
  restoredChild?.lineage?.parentGenomeIds,
  [founderA.id, founderB.id],
  'archive normalization must preserve G1 parent links',
);
assert.deepEqual(
  restoredGrandchild?.lineage?.parentGenomeIds,
  [child.id],
  'archive normalization must preserve G2 parent link',
);
assert.ok(
  archive.species.filter((item) => item.lineage?.parentGenomeIds.includes(child.id)).some((item) => item.id === grandchild.id),
  'direct descendants must be discoverable from saved lineage links',
);

console.log('Mouth lineage verification passed:', {
  founders: [founderA.id, founderB.id],
  child: child.id,
  grandchild: grandchild.id,
  generations: [0, 0, child.lineage?.generation, grandchild.lineage?.generation],
});
