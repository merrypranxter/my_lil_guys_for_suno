import assert from 'node:assert/strict';
import {
  applyMouthEvolutionaryOperation,
  breedMouthGenome,
  compileMouthPrompt,
} from '../src/mouthLab';

function activeTraits(genome: any): string[] {
  return Array.from(new Set(genome.assignments.flatMap((a: any) => a.traitIds)));
}

const base = breedMouthGenome({
  parentDonorIds: ['mouth-donor-english', 'mouth-donor-navajo', 'mouth-donor-hungarian'],
  breedingSeed: 'fuckery-base',
  objectiveId: 'mouth-objective-distance-from-english',
  intelligibility: 82,
  stability: 72,
  mutation: 55,
}).genome;

const originalDonors = [...base.parentDonorIds];
const baseTraitCount = activeTraits(base).length;

const bottleneckA = applyMouthEvolutionaryOperation({
  genome: base,
  operation: 'bottleneck',
  seed: 'same-bottleneck',
  intensity: 78,
});
const bottleneckB = applyMouthEvolutionaryOperation({
  genome: base,
  operation: 'bottleneck',
  seed: 'same-bottleneck',
  intensity: 78,
});
assert.equal(bottleneckA.genome.id, bottleneckB.genome.id, 'same bottleneck seed should be deterministic');
assert.deepEqual(bottleneckA.genome.parentDonorIds, originalDonors, 'bottleneck must preserve donor ancestry');
assert.ok(activeTraits(bottleneckA.genome).length <= baseTraitCount, 'bottleneck should not add traits');
assert.equal(bottleneckA.genome.lineage?.parentGenomeIds[0], base.id, 'bottleneck descendant should point to lived parent');
assert.ok(bottleneckA.genome.mutationScars.some((s) => s.sourceOperation === 'bottleneck'));

const founder = applyMouthEvolutionaryOperation({
  genome: base,
  operation: 'founder-effect',
  seed: 'founder',
  intensity: 72,
});
assert.deepEqual(founder.genome.parentDonorIds, originalDonors, 'founder effect must preserve donor ancestry');
assert.ok(founder.genome.mutationScars.some((s) => s.sourceOperation === 'founder-effect'));

const extinctionTarget = activeTraits(base)[0];
assert.ok(extinctionTarget, 'base needs an active trait for extinction test');
const extinct = applyMouthEvolutionaryOperation({
  genome: base,
  operation: 'extinction',
  seed: 'extinction',
  targetId: extinctionTarget,
  intensity: 80,
});
assert.ok(!activeTraits(extinct.genome).includes(extinctionTarget), 'extinction target must leave active expression');
assert.ok(extinct.genome.mutationScars.some((s) => s.sourceOperation === 'extinction' && s.removedTraitIds.includes(extinctionTarget)));

const atavism = applyMouthEvolutionaryOperation({
  genome: extinct.genome,
  operation: 'atavism',
  seed: 'bring-it-back',
  targetId: extinctionTarget,
  intensity: 85,
});
assert.ok(activeTraits(atavism.genome).includes(extinctionTarget), 'atavism should restore extinct ancestral trait');
assert.deepEqual(atavism.genome.parentDonorIds, originalDonors, 'atavism must not invent donor ancestry');
assert.ok(atavism.genome.mutationScars.some((s) => s.sourceOperation === 'atavism'));

const fossilTarget = activeTraits(base).find((id) => id !== extinctionTarget) || activeTraits(base)[0];
const fossilized = applyMouthEvolutionaryOperation({
  genome: base,
  operation: 'fossilize',
  seed: 'fossil',
  targetId: fossilTarget,
  intensity: 70,
});
assert.ok(!activeTraits(fossilized.genome).includes(fossilTarget), 'fossilized trait must leave active mouth genetics');
assert.ok(fossilized.genome.fossils?.some((f) => f.sourceId === fossilTarget), 'fossil record must be stored');
const compiledFossil = compileMouthPrompt(fossilized.genome, { mode: 'bracketed', semanticMode: 'inherit' });
assert.ok(compiledFossil.lyricsDirectives.includes('MUSICAL FOSSIL'), 'fossil must reach lyrics/control compiler');
assert.ok(compiledFossil.styleDirectives.includes('MUSICAL FOSSIL'), 'fossil must reach style compiler');

const speciated = applyMouthEvolutionaryOperation({
  genome: base,
  operation: 'speciate',
  seed: 'species-branch',
  intensity: 88,
});
assert.equal(speciated.genome.lineage?.generation, 1, 'G0 speciation should create G1 branch');
assert.deepEqual(speciated.genome.lineage?.parentGenomeIds, [base.id], 'speciation branch should record one lived parent');
assert.deepEqual(speciated.genome.parentDonorIds, originalDonors, 'speciation cannot alter donor ancestry');
assert.ok(speciated.genome.mutationScars.some((s) => s.sourceOperation === 'speciate'));

console.log('Mouth evolutionary fuckery verification passed:', {
  baseTraits: baseTraitCount,
  bottleneckTraits: activeTraits(bottleneckA.genome).length,
  extinct: extinctionTarget,
  atavismRestored: activeTraits(atavism.genome).includes(extinctionTarget),
  fossil: fossilized.genome.fossils?.[0]?.sourceName,
  speciated: speciated.genome.id,
});
