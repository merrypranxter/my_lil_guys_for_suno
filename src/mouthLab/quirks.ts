import {
  MouthGenome,
  MouthQuirkDefinition,
  MouthQuirkInstance,
  MouthTakeoverCurve,
} from './types';
import {
  clampMouthControl,
  hashMouthString,
  stableStringify,
} from './determinism';

const constantCurve = (): MouthTakeoverCurve => ({
  mode: 'constant',
  startPercent: 100,
  endPercent: 100,
});

const gradualCurve = (): MouthTakeoverCurve => ({
  mode: 'gradual',
  startPercent: 15,
  endPercent: 100,
});

const stepCurve = (): MouthTakeoverCurve => ({
  mode: 'stepwise',
  startPercent: 20,
  endPercent: 100,
  steps: 4,
});

function q(
  id: string,
  name: string,
  category: MouthQuirkDefinition['category'],
  axis: MouthQuirkDefinition['axis'],
  target: string,
  transformation: string,
  origin: MouthQuirkDefinition['origin'],
  sourceTraitIds: string[],
  tags: string[],
  defaultFrequency: number,
  defaultConsistency: number,
  defaultExaggeration: number,
  defaultTakeover: MouthTakeoverCurve,
  intelligibilityRisk: MouthQuirkDefinition['intelligibilityRisk'],
  shortExplanation: string,
): MouthQuirkDefinition {
  return {
    id,
    name,
    category,
    axis,
    target,
    transformation,
    origin,
    sourceTraitIds,
    tags,
    defaultFrequency,
    defaultConsistency,
    defaultExaggeration,
    defaultTakeover,
    intelligibilityRisk,
    shortExplanation,
  };
}

export const MOUTH_QUIRKS: MouthQuirkDefinition[] = [
  q(
    'mouth-quirk-global-r-trill',
    'GLOBAL RHOTIC TRILL TAKEOVER',
    'rhotic',
    'consonants',
    'every eligible rhotic',
    'realize the target as an audible tongue-tip trill or strongly repeated tap; preserve the rest of the pronunciation system',
    'trait-derived',
    ['mouth-trait-alveolar-trill'],
    ['rhotic', 'trill', 'pathological-consistency', 'micro-mutation'],
    100,
    100,
    95,
    constantCurve(),
    1,
    'The canonical RRRRRR mutation: one tiny rule escapes and applies with absurd commitment.',
  ),
  q(
    'mouth-quirk-r-tap-trill-alternation',
    'RHOTIC TAP / TRILL ALTERNATION',
    'rhotic',
    'consonants',
    'successive eligible rhotics',
    'alternate a single tap with a longer trill in a stable repeating pattern',
    'trait-derived',
    ['mouth-trait-alveolar-trill'],
    ['rhotic', 'trill', 'alternation'],
    85,
    92,
    78,
    stepCurve(),
    1,
    'Rhotic identity stays legible while articulation flips between tap and trill.',
  ),
  q(
    'mouth-quirk-uvular-r-takeover',
    'UVULAR R TAKEOVER',
    'rhotic',
    'consonants',
    'eligible rhotics',
    'replace eligible rhotics with a back-of-mouth uvular/fricative or uvular-trill color',
    'trait-derived',
    ['mouth-trait-uvular-rhotic'],
    ['rhotic', 'uvular', 'micro-mutation'],
    95,
    94,
    82,
    constantCurve(),
    2,
    'One rhotic system replaces another without dragging an entire language stereotype behind it.',
  ),
  q(
    'mouth-quirk-ejective-k-t',
    'K / T EJECTIVE POP',
    'consonant',
    'consonants',
    '/k/ and /t/-like stop attacks',
    'give selected stop attacks a compressed ejective-like pop while unrelated consonants remain stable',
    'trait-derived',
    ['mouth-trait-ejective-attack'],
    ['ejective', 'attack', 'percussive', 'micro-mutation'],
    72,
    92,
    84,
    constantCurve(),
    2,
    'Turns a narrow consonant class into recurring vocal percussion.',
  ),
  q(
    'mouth-quirk-glottal-stress-catch',
    'STRESSED-SYLLABLE GLOTTAL CATCH',
    'phonation',
    'larynx',
    'stressed or structurally prominent syllables',
    'insert a brief glottal catch or interruption at each selected prominence',
    'trait-derived',
    ['mouth-trait-stod', 'mouth-trait-glottal-stop'],
    ['glottal', 'stress', 'punctuation'],
    76,
    90,
    74,
    constantCurve(),
    2,
    'Makes glottal interruption behave like a compositional punctuation law.',
  ),
  q(
    'mouth-quirk-final-consonant-clipping',
    'FINAL CONSONANT CLIPPING',
    'consonant',
    'phonotactics',
    'word-final consonants',
    'shorten, weaken, or delete selected final consonants while preserving the lexical center of the word',
    'invented',
    [],
    ['final-consonant', 'clipping', 'lossy', 'repair'],
    68,
    82,
    65,
    gradualCurve(),
    3,
    'A bounded lossy mutation that makes endings progressively less stable.',
  ),
  q(
    'mouth-quirk-cluster-vowel-repair',
    'CLUSTER → VOWEL REPAIR',
    'pronunciation',
    'phonotactics',
    'dense consonant clusters',
    'insert a small recurring repair vowel when a cluster crosses the configured density threshold',
    'trait-derived',
    ['mouth-trait-open-syllable-pressure'],
    ['cluster', 'repair', 'vowel-insertion', 'conditional'],
    80,
    92,
    72,
    constantCurve(),
    2,
    'Dense clusters trigger their own vowel escape hatch.',
  ),
  q(
    'mouth-quirk-cluster-compression',
    'CONSONANT CLUSTER COMPRESSION',
    'consonant',
    'phonotactics',
    'adjacent consonants',
    'reduce intervening vowel material and let consonants pack together into denser attack groups',
    'trait-derived',
    ['mouth-trait-extreme-cluster'],
    ['cluster', 'compression', 'consonant-heavy'],
    70,
    88,
    78,
    gradualCurve(),
    4,
    'The inverse of repair: phrases dry out into denser consonant blocks.',
  ),
  q(
    'mouth-quirk-pre-nasal-vowel',
    'PRE-NASAL VOWEL NASALIZATION',
    'vowel',
    'vowels',
    'vowels immediately before nasal consonants',
    'increase nasal resonance on the target vowel while leaving unrelated vowels comparatively oral',
    'trait-derived',
    ['mouth-trait-nasal-vowels'],
    ['nasal', 'vowel', 'conditional'],
    88,
    94,
    66,
    constantCurve(),
    1,
    'A small context-triggered vowel mutation that remains easy to hear.',
  ),
  q(
    'mouth-quirk-nasal-contagion',
    'NASALITY ESCAPES CONTAINMENT',
    'vowel',
    'phonation',
    'a word or phrase after a nasal trigger',
    'once a configured nasal trigger occurs, propagate nasal resonance until the next reset boundary',
    'trait-derived',
    ['mouth-trait-nasal-harmony'],
    ['nasal', 'contagion', 'harmony', 'spread'],
    62,
    86,
    78,
    gradualCurve(),
    3,
    'A local nasal event becomes an infection that spreads through the phrase.',
  ),
  q(
    'mouth-quirk-every-third-creaky',
    'EVERY THIRD SYLLABLE GOES CREAKY',
    'phonation',
    'phonation',
    'every third eligible syllable',
    'switch the target syllable into a brief creaky/glottalized voice-quality state',
    'trait-derived',
    ['mouth-trait-glottalized-vowels', 'mouth-trait-tone-plus-phonation'],
    ['creaky', 'phonation', 'counting', 'periodic'],
    100,
    94,
    70,
    constantCurve(),
    2,
    'A deliberately mechanical voice-quality periodicity.',
  ),
  q(
    'mouth-quirk-long-vowel-overstretch',
    'LONG VOWELS GET RIDICULOUSLY LONG',
    'vowel',
    'timing',
    'already lengthened or stressed vowels',
    'stretch the target well beyond its surrounding syllables while preserving pitch and lexical center',
    'trait-derived',
    ['mouth-trait-vowel-length'],
    ['vowel-length', 'duration', 'exaggeration'],
    82,
    90,
    92,
    constantCurve(),
    2,
    'A duration rule that can become comically overcommitted without changing every vowel.',
  ),
  q(
    'mouth-quirk-no-schwa-collapse',
    'NO SCHWA COLLAPSE',
    'vowel',
    'vowels',
    'unstressed vowel positions',
    'keep unstressed vowels full and distinct instead of reducing them toward a neutral central vowel',
    'trait-derived',
    ['mouth-trait-full-vowel-preservation'],
    ['full-vowel', 'anti-reduction', 'clarity'],
    100,
    95,
    64,
    constantCurve(),
    1,
    'Makes rapid English sound structurally wrong while often staying highly intelligible.',
  ),
  q(
    'mouth-quirk-phrase-final-rise',
    'EVERY PHRASE ENDS UPWARD',
    'prosody',
    'prosody',
    'phrase endings',
    'force a noticeable rising terminal contour regardless of whether the phrase is semantically a question',
    'invented',
    [],
    ['phrase-final', 'pitch', 'prosody', 'pathological-consistency'],
    100,
    96,
    76,
    constantCurve(),
    1,
    'A prosodic law that keeps firing even when discourse meaning says it should not.',
  ),
  q(
    'mouth-quirk-offbeat-click',
    'CLICKS ONLY ON OFFBEATS',
    'consonant',
    'timing',
    'click-bearing consonantal events',
    'permit click events only when they align with offbeat or syncopated rhythmic positions',
    'trait-derived',
    ['mouth-trait-click-bantu', 'mouth-trait-click-high-dimensional'],
    ['click', 'offbeat', 'rhythm', 'conditional'],
    75,
    90,
    80,
    constantCurve(),
    2,
    'A speech trait becomes rhythmically conditional instead of globally sprayed everywhere.',
  ),
  q(
    'mouth-quirk-pitch-triggered-trill',
    'HIGH NOTE ACTIVATES R TRILL',
    'rhotic',
    'consonants',
    'eligible rhotics above a high-register threshold',
    'keep ordinary rhotics below the threshold and trill them aggressively above it',
    'trait-derived',
    ['mouth-trait-alveolar-trill'],
    ['rhotic', 'pitch-trigger', 'conditional'],
    90,
    90,
    90,
    {
      mode: 'eventTriggered',
      startPercent: 0,
      endPercent: 100,
      trigger: 'vocal pitch crosses the configured high-register threshold',
    },
    1,
    'The same word can change mouth physics depending on melodic register.',
  ),
  q(
    'mouth-quirk-repetition-corruption',
    'REPEATED WORDS MUTATE FARTHER',
    'mutation',
    'phonotactics',
    'repeated lexical material',
    'each exact repetition inherits one additional active phonetic mutation while preserving enough of the word to remain traceable',
    'invented',
    [],
    ['repetition', 'mutation', 'escalation', 'contagion'],
    100,
    88,
    84,
    stepCurve(),
    4,
    'Repetition becomes an evolutionary clock rather than a copy operation.',
  ),
  q(
    'mouth-quirk-breath-onset',
    'EVERY WORD STARTS WITH BREATH',
    'phonation',
    'airflow',
    'eligible word onsets',
    'precede the target onset with a short audible breath or aspiration gesture',
    'invented',
    [],
    ['breath', 'aspiration', 'onset', 'pathological-consistency'],
    92,
    90,
    62,
    constantCurve(),
    2,
    'A tiny pre-onset gesture makes the whole singer feel mechanically wrong.',
  ),
  q(
    'mouth-quirk-prenasalized-stops',
    'STOPS GROW NASAL LEAD-INS',
    'consonant',
    'consonants',
    'selected stop attacks',
    'prepend a brief fused nasal gesture to the stop without creating a separate syllable',
    'trait-derived',
    ['mouth-trait-prenasalized-attack'],
    ['prenasalized', 'attack', 'nasal', 'micro-mutation'],
    72,
    90,
    70,
    constantCurve(),
    2,
    'Selected consonants become two-stage attacks.',
  ),
  q(
    'mouth-quirk-lateral-noise-l',
    'L BECOMES LATERAL NOISE',
    'consonant',
    'consonants',
    'selected /l/-like targets',
    'push the target toward sustained lateral frication rather than an ordinary approximant',
    'trait-derived',
    ['mouth-trait-lateral-fricative'],
    ['lateral', 'fricative', 'noise', 'micro-mutation'],
    82,
    90,
    78,
    constantCurve(),
    2,
    'A narrow consonant substitution produces an unusually audible mouth texture.',
  ),
];

export const MOUTH_QUIRK_BY_ID = new Map(MOUTH_QUIRKS.map((item) => [item.id, item]));

export function getMouthQuirkDefinition(id: string): MouthQuirkDefinition | undefined {
  return MOUTH_QUIRK_BY_ID.get(id);
}

export function searchMouthQuirks(query: string): MouthQuirkDefinition[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return MOUTH_QUIRKS;

  return MOUTH_QUIRKS.filter((item) =>
    [
      item.name,
      item.target,
      item.transformation,
      item.shortExplanation,
      ...item.tags,
    ]
      .join(' ')
      .toLowerCase()
      .includes(needle),
  );
}

export function instantiateMouthQuirk(
  quirkId: string,
  overrides: Partial<
    Pick<
      MouthQuirkInstance,
      'enabled' | 'frequency' | 'consistency' | 'exaggeration' | 'takeover' | 'trigger' | 'linkedTraitIds'
    >
  > = {},
  seed = '',
): MouthQuirkInstance {
  const definition = getMouthQuirkDefinition(quirkId);
  if (!definition) throw new Error('Unknown Mouth Lab quirk: ' + quirkId);

  const frequency = clampMouthControl(overrides.frequency, definition.defaultFrequency);
  const consistency = clampMouthControl(
    overrides.consistency,
    definition.defaultConsistency,
  );
  const exaggeration = clampMouthControl(
    overrides.exaggeration,
    definition.defaultExaggeration,
  );
  const takeover = overrides.takeover
    ? {
        ...overrides.takeover,
        startPercent: clampMouthControl(overrides.takeover.startPercent, 0),
        endPercent: clampMouthControl(overrides.takeover.endPercent, 100),
      }
    : { ...definition.defaultTakeover };

  const signature = stableStringify({
    quirkId,
    frequency,
    consistency,
    exaggeration,
    takeover,
    trigger: overrides.trigger || takeover.trigger || '',
    linkedTraitIds: [...(overrides.linkedTraitIds || definition.sourceTraitIds)].sort(),
    seed,
  });

  return {
    id: 'quirk_instance_' + hashMouthString(signature).toString(36),
    quirkId,
    enabled: overrides.enabled ?? true,
    frequency,
    consistency,
    exaggeration,
    takeover,
    trigger: overrides.trigger || takeover.trigger,
    linkedTraitIds: Array.from(
      new Set(overrides.linkedTraitIds || definition.sourceTraitIds),
    ).sort(),
    createdAt: Date.now(),
  };
}

export function describeMouthQuirkInstance(instance: MouthQuirkInstance): string {
  const definition = getMouthQuirkDefinition(instance.quirkId);
  if (!definition) return instance.quirkId;

  return [
    definition.name,
    'target: ' + definition.target,
    'rule: ' + definition.transformation,
    'frequency ' + instance.frequency + '/100',
    'consistency ' + instance.consistency + '/100',
    'exaggeration ' + instance.exaggeration + '/100',
    'takeover ' + instance.takeover.mode,
    instance.trigger ? 'trigger: ' + instance.trigger : '',
  ]
    .filter(Boolean)
    .join(' • ');
}

function canonicalQuirkInstances(quirks: MouthQuirkInstance[]): MouthQuirkInstance[] {
  return [...quirks]
    .map((instance) => ({
      ...instance,
      linkedTraitIds: [...instance.linkedTraitIds].sort(),
      takeover: { ...instance.takeover },
    }))
    .sort(
      (a, b) =>
        a.quirkId.localeCompare(b.quirkId) ||
        a.id.localeCompare(b.id),
    );
}

function reidentifyGenome(genome: MouthGenome): MouthGenome {
  const signature = stableStringify({
    parentDonorIds: genome.parentDonorIds,
    assignments: genome.assignments,
    objectiveId: genome.objectiveId,
    semanticAnchorLanguageProfileId: genome.semanticAnchorLanguageProfileId,
    intelligibility: genome.intelligibility,
    stability: genome.stability,
    mutation: genome.mutation,
    breedingSeed: genome.breedingSeed,
    quirks: canonicalQuirkInstances(genome.quirks).map(({ createdAt, ...item }) => item),
    mutationScars: genome.mutationScars.map(({ createdAt, ...item }) => item),
    linkedGeneBundles: genome.linkedGeneBundles.map(({ createdAt, ...item }) => item),
  });

  return {
    ...genome,
    id: 'mouth_' + hashMouthString(signature).toString(36),
  };
}

export function applyMouthQuirk(
  genome: MouthGenome,
  quirk: MouthQuirkInstance,
): MouthGenome {
  if (!getMouthQuirkDefinition(quirk.quirkId)) {
    throw new Error('Cannot apply unknown Mouth Lab quirk: ' + quirk.quirkId);
  }

  const withoutSame = genome.quirks.filter((item) => item.quirkId !== quirk.quirkId);
  return reidentifyGenome({
    ...genome,
    quirks: canonicalQuirkInstances([...withoutSame, quirk]),
    createdAt: Date.now(),
  });
}

export function removeMouthQuirk(
  genome: MouthGenome,
  quirkId: string,
): MouthGenome {
  return reidentifyGenome({
    ...genome,
    quirks: genome.quirks.filter((item) => item.quirkId !== quirkId),
    createdAt: Date.now(),
  });
}
