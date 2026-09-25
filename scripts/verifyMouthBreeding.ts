import {
  breedMouthGenome,
  getMouthTraitRelationship,
  projectMouthPhenotype,
} from '../src/mouthLab';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function stableAssignments(value: ReturnType<typeof breedMouthGenome>) {
  return JSON.stringify(value.genome.assignments);
}

const fourParentRequest = {
  parentDonorIds: [
    'mouth-donor-english',
    'mouth-donor-cherokee',
    'mouth-donor-xhosa',
    'mouth-donor-japanese',
  ],
  breedingSeed: 'same-parents-same-seed',
  objectiveId: 'mouth-objective-distance-from-english',
  intelligibility: 84,
  stability: 73,
  mutation: 41,
};

const childA = breedMouthGenome(fourParentRequest);
const childB = breedMouthGenome(fourParentRequest);

assert(childA.genome.id === childB.genome.id, 'Same parents + seed must produce the same genome ID.');
assert(
  stableAssignments(childA) === stableAssignments(childB),
  'Same parents + seed must produce the same jurisdiction assignments.',
);
assert(
  JSON.stringify(childA.phenotype.activeTraits) ===
    JSON.stringify(childB.phenotype.activeTraits),
  'Same parents + seed must produce the same active phenotype.',
);

assert(
  childA.genome.parentDonorIds.length === 4,
  'Four-parent breeding should preserve four parent references.',
);
assert(
  childA.genome.semanticAnchorLanguageProfileId === 'lang-english',
  'Distance-from-English should preserve English semantics by default.',
);

const conflictChild = breedMouthGenome({
  parentDonorIds: ['mouth-donor-georgian', 'mouth-donor-hawaiian'],
  breedingSeed: 'constitutional-crisis-in-the-mouth',
  objectiveId: 'mouth-objective-phonotactic-conflict',
  intelligibility: 76,
  stability: 68,
  mutation: 46,
});

const conflictTraits = new Set(
  conflictChild.genome.assignments.flatMap((assignment) => assignment.traitIds),
);
assert(
  conflictTraits.has('mouth-trait-extreme-cluster'),
  'Georgian/Hawaiian conflict child should retain extreme clustering.',
);
assert(
  conflictTraits.has('mouth-trait-open-syllable-pressure'),
  'Georgian/Hawaiian conflict child should retain open-syllable pressure.',
);

const clusterVsOpen = getMouthTraitRelationship(
  'mouth-trait-extreme-cluster',
  'mouth-trait-open-syllable-pressure',
);
assert(clusterVsOpen?.relationship === 'competitive', 'Cluster/open-syllable relationship should be competitive.');
assert(
  conflictChild.phenotype.interactions.some(
    (interaction) =>
      interaction.relationship === 'competitive' &&
      new Set([interaction.traitAId, interaction.traitBId]).has(
        'mouth-trait-extreme-cluster',
      ) &&
      new Set([interaction.traitAId, interaction.traitBId]).has(
        'mouth-trait-open-syllable-pressure',
      ),
  ),
  'Conflict phenotype should expose the competitive interaction.',
);

const manualChild = breedMouthGenome({
  parentDonorIds: ['mouth-donor-xhosa', 'mouth-donor-japanese'],
  breedingSeed: 'manual-jurisdiction',
  objectiveId: 'mouth-objective-mouth-percussion',
  manualAssignments: [
    {
      axis: 'consonants',
      donorId: 'mouth-donor-xhosa',
      traitIds: ['mouth-trait-click-bantu'],
      pressure: 'obsessive',
    },
    {
      axis: 'timing',
      donorId: 'mouth-donor-japanese',
      traitIds: ['mouth-trait-mora-timing'],
      pressure: 'high',
    },
  ],
});

assert(
  manualChild.genome.assignments.some(
    (assignment) =>
      assignment.locked &&
      assignment.axis === 'consonants' &&
      assignment.donorId === 'mouth-donor-xhosa' &&
      assignment.pressure === 'obsessive',
  ),
  'Manual Xhosa click jurisdiction must remain locked and obsessive.',
);
assert(
  manualChild.genome.assignments.some(
    (assignment) =>
      assignment.locked &&
      assignment.axis === 'timing' &&
      assignment.donorId === 'mouth-donor-japanese',
  ),
  'Manual Japanese timing jurisdiction must remain locked.',
);

const rFreak = breedMouthGenome({
  parentDonorIds: ['mouth-donor-english', 'mouth-donor-spanish'],
  breedingSeed: 'rrr-madness',
  objectiveId: 'mouth-objective-pathological-consistency',
  intelligibility: 94,
  stability: 96,
  mutation: 82,
});

const trillAssignment = rFreak.genome.assignments.find((assignment) =>
  assignment.traitIds.includes('mouth-trait-alveolar-trill'),
);
assert(Boolean(trillAssignment), 'R-freak child should inherit alveolar trill.');
assert(
  trillAssignment?.pressure === 'obsessive',
  'ONE MUTATION ESCAPES should drive the trill to obsessive pressure.',
);
const trillPhenotype = rFreak.phenotype.activeTraits.find(
  (trait) => trait.traitId === 'mouth-trait-alveolar-trill',
);
assert(Boolean(trillPhenotype), 'R-freak trill should survive into phenotype.');
assert(
  (trillPhenotype?.consistency || 0) >= 85,
  'Stable obsessive R-freak should have very high expected consistency.',
);

const rhoticConflict = breedMouthGenome({
  parentDonorIds: ['mouth-donor-spanish', 'mouth-donor-french'],
  breedingSeed: 'two-rs-enter-one-r-leaves',
  objectiveId: 'mouth-objective-consonant-fuckery',
  stability: 92,
  intelligibility: 88,
  manualAssignments: [
    {
      axis: 'consonants',
      donorId: 'mouth-donor-spanish',
      traitIds: ['mouth-trait-alveolar-trill'],
      pressure: 'high',
    },
    {
      axis: 'consonants',
      donorId: 'mouth-donor-french',
      traitIds: ['mouth-trait-uvular-rhotic'],
      pressure: 'high',
    },
  ],
});

assert(
  rhoticConflict.phenotype.suppressedTraits.length >= 1,
  'High-stability mutually exclusive rhotics should suppress one phenotype trait.',
);
assert(
  rhoticConflict.phenotype.interactions.some(
    (interaction) => interaction.relationship === 'mutuallyExclusive',
  ),
  'Rhotic conflict should be explicitly marked mutually exclusive.',
);

const lowStabilityRhoticGenome = {
  ...rhoticConflict.genome,
  stability: 25,
  id: rhoticConflict.genome.id + '-unstable',
};
const lowStabilityRhotic = projectMouthPhenotype(lowStabilityRhoticGenome);
assert(
  lowStabilityRhotic.suppressedTraits.length === 0,
  'Low stability should keep mutually exclusive rhotics alive as alternating states.',
);
assert(
  lowStabilityRhotic.warnings.some((warning) => warning.includes('alternating states')),
  'Low-stability mutually exclusive traits should emit an alternation warning.',
);

const sixParent = breedMouthGenome({
  parentDonorIds: [
    'mouth-donor-cherokee',
    'mouth-donor-xhosa',
    'mouth-donor-japanese',
    'mouth-donor-yucatec-maya',
    'mouth-donor-tashlhiyt',
    'mouth-donor-marshallese',
  ],
  breedingSeed: 'six-parent-freak',
  objectiveId: 'mouth-objective-distance-from-english',
});

assert(sixParent.genome.parentDonorIds.length === 6, 'Six-parent breeding must be supported.');
assert(
  sixParent.genome.assignments.flatMap((assignment) => assignment.traitIds).length >= 6,
  'Six-parent breeding should produce a substantial trait set.',
);

let tooFewThrew = false;
try {
  breedMouthGenome({
    parentDonorIds: ['mouth-donor-xhosa'],
    breedingSeed: 'invalid',
  });
} catch {
  tooFewThrew = true;
}
assert(tooFewThrew, 'One-parent breeding must be rejected.');

let tooManyThrew = false;
try {
  breedMouthGenome({
    parentDonorIds: [
      'mouth-donor-english',
      'mouth-donor-spanish',
      'mouth-donor-french',
      'mouth-donor-japanese',
      'mouth-donor-xhosa',
      'mouth-donor-georgian',
      'mouth-donor-hawaiian',
    ],
    breedingSeed: 'invalid',
  });
} catch {
  tooManyThrew = true;
}
assert(tooManyThrew, 'Seven-parent breeding must be rejected.');

console.log('Mouth Lab Job 2 breeding verification passed.');
console.log('  deterministic genome:', childA.genome.id);
console.log('  conflict interactions:', conflictChild.phenotype.interactions.length);
console.log('  R-freak priority:', rFreak.phenotype.audiblePriority.join(', '));
console.log('  six-parent active traits:', sixParent.phenotype.activeTraits.length);
