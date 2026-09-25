import {
  MOUTH_QUIRKS,
  applyMouthQuirk,
  applyMouthSpecimen,
  breedMouthGenome,
  captureMouthSpecimen,
  clearMouthMutationScar,
  createEmptyMouthLabArchive,
  createLinkedGeneBundleFromSpecimen,
  getMouthTrait,
  instantiateMouthQuirk,
  knockoutMouthGenes,
  loadMouthLabArchive,
  parseMouthLabArchive,
  projectMouthPhenotype,
  saveMouthLabArchive,
  serializeMouthLabArchive,
  suggestMouthQuirksFromObservation,
  unlinkMouthGeneBundle,
  upsertMouthGeneBundle,
  upsertMouthSpecimen,
  upsertMouthSpecies,
} from '../src/mouthLab';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const quirkIds = MOUTH_QUIRKS.map((quirk) => quirk.id);
assert(
  new Set(quirkIds).size === quirkIds.length,
  'Mouth quirk IDs must be unique.',
);
assert(MOUTH_QUIRKS.length >= 15, 'Job 3 should ship a meaningful seed quirk library.');

for (const quirk of MOUTH_QUIRKS) {
  for (const traitId of quirk.sourceTraitIds) {
    assert(
      Boolean(getMouthTrait(traitId)),
      'Quirk ' + quirk.id + ' references unknown source trait ' + traitId,
    );
  }

  assert(
    quirk.defaultFrequency >= 0 && quirk.defaultFrequency <= 100,
    'Quirk frequency must be 0–100: ' + quirk.id,
  );
  assert(
    quirk.defaultConsistency >= 0 && quirk.defaultConsistency <= 100,
    'Quirk consistency must be 0–100: ' + quirk.id,
  );
  assert(
    quirk.defaultExaggeration >= 0 && quirk.defaultExaggeration <= 100,
    'Quirk exaggeration must be 0–100: ' + quirk.id,
  );
}

const base = breedMouthGenome({
  parentDonorIds: ['mouth-donor-english', 'mouth-donor-spanish'],
  breedingSeed: 'job-3-r-freak-base',
  objectiveId: 'mouth-objective-pathological-consistency',
  intelligibility: 95,
  stability: 94,
  mutation: 78,
  manualAssignments: [
    {
      axis: 'consonants',
      donorId: 'mouth-donor-spanish',
      traitIds: ['mouth-trait-alveolar-trill'],
      pressure: 'obsessive',
    },
  ],
}).genome;

assert(base.quirks.length === 0, 'Fresh bred genomes should start without explicit quirks.');
assert(base.mutationScars.length === 0, 'Fresh bred genomes should start without scars.');

const rQuirkA = instantiateMouthQuirk(
  'mouth-quirk-global-r-trill',
  {
    frequency: 100,
    consistency: 100,
    exaggeration: 99,
  },
  'rrrr-seed',
);
const rQuirkB = instantiateMouthQuirk(
  'mouth-quirk-global-r-trill',
  {
    frequency: 100,
    consistency: 100,
    exaggeration: 99,
  },
  'rrrr-seed',
);

assert(rQuirkA.id === rQuirkB.id, 'Same quirk controls + seed must produce the same instance ID.');

const withR = applyMouthQuirk(base, rQuirkA);
assert(withR.id !== base.id, 'Applying a quirk must produce a new genome identity.');
assert(withR.quirks.length === 1, 'Applied quirk must enter the genome.');

const rPhenotype = projectMouthPhenotype(withR);
assert(
  rPhenotype.activeQuirks.some(
    (quirk) => quirk.quirkId === 'mouth-quirk-global-r-trill',
  ),
  'Applied R quirk must appear in phenotype.',
);
assert(
  rPhenotype.audiblePriority.includes('quirk:mouth-quirk-global-r-trill'),
  'Pathological R quirk should be an audible phenotype priority.',
);

const observation =
  'The dude rolled EVERY SINGLE RRRRRR with SUCH ENTHUSIASM every fucking time.';
const suggestions = suggestMouthQuirksFromObservation(observation);
assert(
  suggestions.includes('mouth-quirk-global-r-trill'),
  'Wild-observation parser must recognize the canonical RRRRRR specimen.',
);

const specimen = captureMouthSpecimen({
  observedBehavior: observation,
  whyLiked:
    'Absurd consistency made it sound like a law instead of a random pronunciation accident.',
  sourceGenomeId: withR.id,
});

assert(specimen.recurrence === 'everyTime', 'EVERY SINGLE / every time should infer everyTime recurrence.');
assert(
  specimen.quirkIds.includes('mouth-quirk-global-r-trill'),
  'Captured R specimen should link to the global R trill quirk.',
);
assert(
  specimen.linkedTraitIds.includes('mouth-trait-alveolar-trill'),
  'Captured R specimen should retain source-trait ancestry.',
);

const bundle = createLinkedGeneBundleFromSpecimen(specimen);
assert(bundle.lockedTogether, 'Specimen-linked genes should default to locked together.');
assert(
  bundle.quirkIds.includes('mouth-quirk-global-r-trill'),
  'Linked bundle should include the captured quirk.',
);

const applied = applyMouthSpecimen(base, specimen);
assert(
  applied.appliedQuirkIds.includes('mouth-quirk-global-r-trill'),
  'Applying the specimen should install its quirk.',
);
assert(
  applied.missingTraitIds.length === 0,
  'Manual Spanish trill base should already contain the specimen source trait.',
);
assert(
  applied.genome.linkedGeneBundles.some((item) => item.id === applied.bundle.id),
  'Applied specimen should preserve a linked-gene bundle in the genome.',
);
assert(
  applied.genome.mutationScars.some(
    (scar) => scar.sourceOperation === 'specimen-application',
  ),
  'Applying a wild specimen should leave a historical mutation scar.',
);

const knockout = knockoutMouthGenes(applied.genome, {
  traitIds: ['mouth-trait-alveolar-trill'],
  removeLinkedGenes: true,
  residualRule:
    'The R no longer fully trills, but stressed rhotics may retain a faint single-tap scar.',
  scarStrength: 31,
});

assert(
  !knockout.assignments.some((assignment) =>
    assignment.traitIds.includes('mouth-trait-alveolar-trill'),
  ),
  'Gene knockout must remove the target trait from active assignments.',
);
assert(
  !knockout.quirks.some(
    (quirk) => quirk.quirkId === 'mouth-quirk-global-r-trill',
  ),
  'Linked-gene knockout must remove the linked R quirk.',
);
assert(
  knockout.mutationScars.some(
    (scar) =>
      scar.removedTraitIds.includes('mouth-trait-alveolar-trill') &&
      scar.residualRule.includes('single-tap scar'),
  ),
  'Knockout should preserve the configured mutation scar.',
);

const latestScar = knockout.mutationScars[knockout.mutationScars.length - 1];
const scarCleared = clearMouthMutationScar(knockout, latestScar.id);
assert(
  !scarCleared.mutationScars.some((scar) => scar.id === latestScar.id),
  'Mutation scars should be explicitly clearable.',
);

const unlinked = unlinkMouthGeneBundle(applied.genome, applied.bundle.id);
assert(
  unlinked.linkedGeneBundles.some(
    (item) => item.id === applied.bundle.id && item.lockedTogether === false,
  ),
  'Linked bundles should be explicitly unlinkable.',
);

const rising = instantiateMouthQuirk(
  'mouth-quirk-pitch-triggered-trill',
  {
    takeover: {
      mode: 'eventTriggered',
      startPercent: 0,
      endPercent: 100,
      trigger: 'above C5',
    },
    trigger: 'above C5',
  },
  'high-note-r',
);
assert(
  rising.takeover.mode === 'eventTriggered' && rising.trigger === 'above C5',
  'Conditional quirks must retain explicit trigger/takeover behavior.',
);

const memory = new Map<string, string>();
const storage = {
  getItem(key: string) {
    return memory.get(key) || null;
  },
  setItem(key: string, value: string) {
    memory.set(key, value);
  },
  removeItem(key: string) {
    memory.delete(key);
  },
};

let archive = createEmptyMouthLabArchive();
archive = upsertMouthSpecimen(archive, specimen);
archive = upsertMouthSpecies(archive, applied.genome);
archive = upsertMouthGeneBundle(archive, applied.bundle);

const saved = saveMouthLabArchive(storage, archive);
const loaded = loadMouthLabArchive(storage);

assert(loaded.specimens.length === 1, 'Specimen archive must survive storage roundtrip.');
assert(loaded.species.length === 1, 'Species archive must survive storage roundtrip.');
assert(
  loaded.linkedGeneBundles.length === 1,
  'Linked-gene archive must survive storage roundtrip.',
);
assert(
  loaded.specimens[0].id === specimen.id,
  'Persisted specimen identity must survive roundtrip.',
);

const raw = serializeMouthLabArchive(saved);
const reparsed = parseMouthLabArchive(raw);
assert(
  reparsed.specimens[0].id === specimen.id,
  'Serialized archive must parse back into the same specimen.',
);

const broken = parseMouthLabArchive('{this is absolutely not json');
assert(
  broken.specimens.length === 0 && broken.species.length === 0,
  'Broken persisted data should safely fall back to an empty archive.',
);

console.log('Mouth Lab Job 3 quirk/specimen verification passed.');
console.log('  seed quirks: ' + MOUTH_QUIRKS.length);
console.log('  captured specimen: ' + specimen.id);
console.log('  applied genome: ' + applied.genome.id);
console.log('  knockout scars: ' + knockout.mutationScars.length);
