import {
  applyMouthEnvironment,
  breedMouthGenome,
  breedMouthSpecies,
  clearMouthEnvironment,
  compileMouthPrompt,
  normalizeMouthGenomeForGeneration,
} from '../src/mouthLab';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const base = breedMouthGenome({
  parentDonorIds: ['mouth-donor-english', 'mouth-donor-yoruba'],
  breedingSeed: 'ecology-base',
  objectiveId: 'mouth-objective-distance-from-english',
  semanticAnchorLanguageProfileId: 'lang-english',
  intelligibility: 82,
  stability: 70,
  mutation: 45,
}).genome;

const originalParents = [...base.parentDonorIds];

const exposed = applyMouthEnvironment(base, {
  mode: 'exposure',
  sourceDonorId: 'mouth-donor-tashlhiyt',
  pressure: 84,
  generations: 6,
  seed: 'raised-in-tashlhiyt-pressure',
});

assert(exposed.environment?.sourceDonorId === 'mouth-donor-tashlhiyt', 'environment source should persist');
assert(exposed.environment?.mode === 'exposure', 'environment mode should persist');
assert(exposed.environment?.adaptationTraitIds.length, 'strong exposure should choose adaptation targets');
assert(
  JSON.stringify(exposed.parentDonorIds) === JSON.stringify(originalParents),
  'environment must not rewrite true parent ancestry',
);
assert(
  !exposed.parentDonorIds.includes('mouth-donor-tashlhiyt'),
  'environment donor must not silently become a parent',
);

const scar = exposed.mutationScars.find((item) => item.sourceOperation === 'environment-exposure');
assert(Boolean(scar), 'environment should leave a lived-history scar');
assert(
  scar!.residualRule.includes('ENVIRONMENT, NOT ANCESTRY'),
  'environment scar must explicitly preserve the ancestry boundary',
);

const normalized = normalizeMouthGenomeForGeneration(exposed);
assert(Boolean(normalized?.environment), 'environment should survive generation normalization');
assert(
  normalized!.parentDonorIds.join('|') === originalParents.join('|'),
  'normalization must not promote environment into ancestry',
);

const compiled = compileMouthPrompt(exposed, {
  mode: 'bracketed',
  semanticMode: 'englishMeaningAlienMouth',
});
assert(compiled.text.includes('LANGUAGE ECOLOGY — EXPOSURE'), 'compiler should expose ecology pressure');
assert(compiled.text.includes('ENVIRONMENT IS NOT ANCESTRY'), 'compiler should enforce ancestry boundary');
assert(compiled.text.includes('TASHLHIYT'), 'compiler should name the environmental source');

const cleared = clearMouthEnvironment(exposed);
assert(!cleared.environment, 'current environment should be clearable');
assert(
  cleared.mutationScars.some((item) => item.sourceOperation === 'environment-exposure'),
  'clearing the current environment should not erase lived-history scars',
);

const second = breedMouthGenome({
  parentDonorIds: ['mouth-donor-english', 'mouth-donor-hungarian'],
  breedingSeed: 'ecology-second-parent',
  objectiveId: 'mouth-objective-pathological-consistency',
  semanticAnchorLanguageProfileId: 'lang-english',
  intelligibility: 84,
  stability: 76,
  mutation: 38,
}).genome;

const child = breedMouthSpecies({
  parentA: exposed,
  parentB: second,
  breedingSeed: 'ecology-child',
}).genome;

assert(
  !child.environment,
  'offspring should not automatically inherit the parents current physical environment',
);
assert(
  child.mutationScars.some((item) => item.sourceOperation === 'environment-exposure'),
  'offspring may inherit environmental scars as lineage history',
);
assert(
  !child.parentDonorIds.includes('mouth-donor-tashlhiyt'),
  'inherited environmental scars must not falsify donor ancestry',
);

const isolated = applyMouthEnvironment(base, {
  mode: 'isolation',
  pressure: 65,
  generations: 9,
  seed: 'closed-room',
});
assert(isolated.environment?.mode === 'isolation', 'isolation ecology should work without a donor');
assert(!isolated.environment?.sourceDonorId, 'isolation must not invent a source language');
assert(
  isolated.mutationScars.some((item) => item.residualRule.includes('ISOLATION SCAR')),
  'isolation should leave a distinct historical scar',
);

console.log('Mouth Lab language ecology verification passed:', {
  originalParents,
  environmentalSource: exposed.environment?.sourceDonorId,
  adaptations: exposed.environment?.adaptationTraitIds,
  childParents: child.parentDonorIds,
});
