import { LANGUAGE_PROFILES } from '../src/data/languageProfiles';
import {
  MOUTH_BREEDING_OBJECTIVES,
  MOUTH_DONORS,
  MOUTH_TRAITS,
} from '../src/mouthLab';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertUnique(label: string, ids: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }

  assert(duplicates.size === 0, label + ' duplicate IDs: ' + [...duplicates].join(', '));
}

const languageProfileIds = new Set(LANGUAGE_PROFILES.map((item) => item.id));
const traitIds = new Set(MOUTH_TRAITS.map((item) => item.id));

assertUnique('Mouth trait', MOUTH_TRAITS.map((item) => item.id));
assertUnique('Mouth donor', MOUTH_DONORS.map((item) => item.id));
assertUnique('Mouth objective', MOUTH_BREEDING_OBJECTIVES.map((item) => item.id));

assert(MOUTH_DONORS.length >= 25, 'Expected at least 25 seed donors, found ' + MOUTH_DONORS.length);
assert(MOUTH_TRAITS.length >= 20, 'Expected at least 20 seed traits, found ' + MOUTH_TRAITS.length);

for (const donor of MOUTH_DONORS) {
  assert(
    languageProfileIds.has(donor.languageProfileId),
    'Donor ' + donor.id + ' references missing language profile ' + donor.languageProfileId,
  );

  for (const traitId of donor.traitIds) {
    assert(traitIds.has(traitId), 'Donor ' + donor.id + ' references missing trait ' + traitId);
  }

  assert(donor.sourceNotes.length > 0, 'Donor ' + donor.id + ' needs source notes');
  assert(
    donor.doNotClaim.length > 0 || donor.confidence === 'high',
    'Lower-confidence donor ' + donor.id + ' needs doNotClaim guidance',
  );
}

for (const traitItem of MOUTH_TRAITS) {
  assert(traitItem.axes.length > 0, 'Trait ' + traitItem.id + ' has no mouth axes');
  assert(traitItem.donorProfileIds.length > 0, 'Trait ' + traitItem.id + ' has no donor profiles');
  assert(traitItem.sourceNotes.length > 0, 'Trait ' + traitItem.id + ' needs source notes');

  if (traitItem.category === 'morphology') {
    assert(
      traitItem.sourceNotes.some((note) => /^https?:\/\//.test(note)),
      'Morphology trait ' + traitItem.id + ' needs a direct research URL',
    );
  }

  for (const profileId of traitItem.donorProfileIds) {
    assert(
      languageProfileIds.has(profileId),
      'Trait ' + traitItem.id + ' references missing language profile ' + profileId,
    );
  }
}

for (const objective of MOUTH_BREEDING_OBJECTIVES) {
  assert(
    objective.preferredTraitTags.length > 0,
    'Objective ' + objective.id + ' has no preferred tags',
  );
}

const genericBadDonors = MOUTH_DONORS.filter((donor) =>
  /(^|\s)(mayan|african|asian|indigenous)(\s|$)/i.test(donor.name),
);
assert(
  genericBadDonors.length === 0,
  'Generic donor labels are forbidden: ' + genericBadDonors.map((item) => item.name).join(', '),
);

console.log('Mouth Lab foundation verification passed.');
console.log('  language profiles available: ' + LANGUAGE_PROFILES.length);
console.log('  seed donors: ' + MOUTH_DONORS.length);
console.log('  transferable traits: ' + MOUTH_TRAITS.length);
console.log('  breeding objectives: ' + MOUTH_BREEDING_OBJECTIVES.length);
