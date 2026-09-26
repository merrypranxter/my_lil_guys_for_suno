import { MusicStackItem, SavedStack } from '../types';

export interface AlteredStateStackRecipe extends SavedStack {
  description: string;
  instrumentSummary: string;
}

function recipeItem(
  conceptId: string,
  refId: string,
  strength: number,
  locked = true,
): MusicStackItem {
  return {
    instanceId: `builtin-${conceptId}-${refId}`,
    kind: 'recipe',
    refId,
    muted: false,
    locked,
    strength,
  };
}

/**
 * Whole-stack starting points for altered-state songs.
 *
 * Important jurisdiction rule:
 * - These presets intentionally leave WORLD completely unselected.
 * - The user's seed still owns the subject matter.
 * - Reality supplies format/role/body/venue/headspace/altered-state/tone.
 * - Composition supplies sound and musical physics.
 */
export const ALTERED_STATE_RECIPES: AlteredStateStackRecipe[] = [
  {
    id: 'builtin-trip-salvia-wrong-page',
    name: 'SALVIA — WRONG PAGE',
    description:
      'Deadpan public-access reality is processed as the wrong object for an absurdly long time while identity, memory, and meaning keep getting reassigned.',
    instrumentSummary:
      'prepared piano • sewing machine • daxophone • fluorescent ballast hum • accordion',
    guyIds: ['identity-accident', 'retcon-rat', 'recall-mold', 'taxonomy-goblin'],
    realityEngineIds: [
      'format-public-access-show',
      'role-public-access-host',
      'species-plant-intelligence',
      'venue-dream-customs',
      'headspace-bored-eternity',
      'altered-salvia-object-eternity',
      'tone-deadpan',
    ],
    compositionEngineIds: [
      'sound-prepared-piano',
      'sound-sewing-machine',
      'sound-daxophone',
      'sound-fluorescent-ballast',
      'sound-accordion',
      'ensemble-one-body-many-voices',
      'transmission-one-way-tv',
      'tuning-inharmonic-spectrum',
      'rhythm-rotating-accent',
      'spatial-rotating-ensemble',
      'damage-vhs-head-switching',
      'roleexchange-timbre-to-form',
      'temporal-return-to-start-different-context',
    ],
    musicStack: [
      recipeItem('salvia', 'jurisdiction-crash-test', 94),
      recipeItem('salvia', 'anchor-under-siege', 86),
      recipeItem('salvia', 'panic-engine', 64, false),
    ],
    musicControls: {
      stemminess: 88,
      kineticDensity: 82,
      socialInfection: 45,
      coupling: 80,
      interruption: 86,
      anchorStrength: 84,
      castSize: 62,
    },
    realityChaos: 3,
    mouthPromptMode: 'bracketed',
    mouthSemanticMode: 'inherit',
    createdAt: 0,
  },
  {
    id: 'builtin-trip-lsd-crosswire',
    name: 'LSD — SENSORY CROSSWIRE',
    description:
      'A relentlessly earnest guided tour where sensory channels trade jobs, associations overconnect, reference pitch splits, and the same path keeps revealing another path inside it.',
    instrumentSummary:
      'clean electric guitar • glass harmonica • bowed vibraphone • modular synth • mbira',
    guyIds: ['sensory-freak', 'alien-ruler', 'gaze-freezer', 'shadow-raccoon'],
    realityEngineIds: [
      'format-guided-tour',
      'role-tour-guide',
      'species-crystalline-being',
      'venue-human-museum',
      'headspace-associative-overconnectivity',
      'altered-lsd-sensory-crosswire',
      'tone-local-tv',
    ],
    compositionEngineIds: [
      'sound-electric-guitar-clean',
      'sound-glass-harmonica',
      'sound-bowed-vibraphone',
      'sound-modular-synth',
      'sound-mbira',
      'ensemble-round-canon',
      'transmission-dream-broadcast',
      'tuning-two-reference-frames',
      'rhythm-phase-shift',
      'spatial-stereo-mirror',
      'damage-wow-flutter',
      'roleexchange-space-rhythm',
      'temporal-nested-loops',
    ],
    musicStack: [
      recipeItem('lsd', 'double-time-hallucination', 88),
      recipeItem('lsd', 'anchor-under-siege', 84),
      recipeItem('lsd', 'vocal-relay-riot', 66, false),
    ],
    musicControls: {
      stemminess: 76,
      kineticDensity: 86,
      socialInfection: 55,
      coupling: 84,
      interruption: 62,
      anchorStrength: 88,
      castSize: 64,
    },
    realityChaos: 3,
    mouthPromptMode: 'bracketed',
    mouthSemanticMode: 'inherit',
    createdAt: 0,
  },
  {
    id: 'builtin-trip-dmt-reception',
    name: 'DMT — RECEPTION DESK',
    description:
      'A hyper-professional arrival system receives autonomous-seeming visitors while information arrives faster than the speaker can decide where it came from.',
    instrumentSummary:
      'Cristal Baschet • bowed vibraphone • modular synth • whisper cloud • dolphin click trains',
    guyIds: ['alien-ruler', 'sensory-freak', 'omission-cartographer', 'retcon-rat'],
    realityEngineIds: [
      'format-airport-announcement',
      'role-gate-announcer',
      'species-radio-wave-entity',
      'venue-alien-airport',
      'headspace-source-confusion',
      'altered-dmt-entity-reception',
      'tone-hyper-professional',
    ],
    compositionEngineIds: [
      'sound-cristal-baschet',
      'sound-bowed-vibraphone',
      'sound-modular-synth',
      'sound-whisper-cloud',
      'sound-dolphin-clicks',
      'ensemble-split-knowledge',
      'gesture-group-inhale-trigger',
      'transmission-alien-carrier',
      'tuning-prime-lattice',
      'rhythm-coprime-cycles',
      'spatial-concentric-rings',
      'damage-radio-interference',
      'roleexchange-noise-to-harmony',
      'temporal-fast-event-expanded',
    ],
    musicStack: [
      recipeItem('dmt', 'cast-of-freaks', 96),
      recipeItem('dmt', 'event-driven-variety-show', 84),
      recipeItem('dmt', 'anchor-under-siege', 76),
    ],
    musicControls: {
      stemminess: 86,
      kineticDensity: 92,
      socialInfection: 74,
      coupling: 86,
      interruption: 84,
      anchorStrength: 76,
      castSize: 96,
    },
    realityChaos: 4,
    mouthPromptMode: 'bracketed',
    mouthSemanticMode: 'inherit',
    createdAt: 0,
  },
  {
    id: 'builtin-trip-ketamine-backend',
    name: 'KETAMINE — BACKEND GEOMETRY',
    description:
      'Clinical black-box telemetry watches the self become remote geometry while rooms stretch into impossible distance and time stops agreeing on a master clock.',
    instrumentSummary:
      'bowed piano strings • metal tank resonance • long tunnel • bass clarinet • heartbeat',
    guyIds: ['substrate-smuggler', 'omission-cartographer', 'gaze-freezer', 'identity-accident'],
    realityEngineIds: [
      'format-black-box-recorder',
      'role-flight-controller',
      'species-ghost',
      'venue-interdimensional-motel',
      'headspace-depersonalized-distance',
      'altered-ketamine-geometric-dissociation',
      'tone-clinical',
    ],
    compositionEngineIds: [
      'sound-bowed-piano-strings',
      'sound-metal-tank-resonance',
      'sound-long-tunnel',
      'sound-bass-clarinet',
      'sound-heartbeat',
      'ensemble-live-recorded-double',
      'transmission-underwater-acoustic',
      'tuning-subharmonic-series',
      'rhythm-no-master-clock',
      'spatial-impossible-distance',
      'damage-time-stretch-artifact',
      'roleexchange-roomtone-drone',
      'temporal-slow-event-fast-world',
    ],
    musicStack: [
      recipeItem('ketamine', 'strip-it-to-the-bones', 98),
      recipeItem('ketamine', 'jurisdiction-crash-test', 92),
      recipeItem('ketamine', 'anchor-under-siege', 76),
    ],
    musicControls: {
      stemminess: 100,
      kineticDensity: 70,
      socialInfection: 25,
      coupling: 58,
      interruption: 72,
      anchorStrength: 82,
      castSize: 44,
    },
    realityChaos: 3,
    mouthPromptMode: 'bracketed',
    mouthSemanticMode: 'inherit',
    createdAt: 0,
  },
  {
    id: 'builtin-trip-nitrous-punchline',
    name: 'NITROUS — COSMIC PUNCHLINE',
    description:
      'A deadpan hotline repeatedly reaches total revelation, loses it at the exact moment of explanation, and starts over with increasing confidence.',
    instrumentSummary:
      'group inhale • circuit-bent toy • microwave beeps • vibraphone • hand claps',
    guyIds: ['recall-mold', 'retcon-rat', 'future-bastard', 'loop-ferret'],
    realityEngineIds: [
      'format-1-900-hotline',
      'role-bad-psychic',
      'species-time-loop-species',
      'venue-cosmic-truck-stop',
      'headspace-temporal-confusion',
      'altered-nitrous-revelation-loop',
      'tone-deadpan',
    ],
    compositionEngineIds: [
      'sound-group-inhale',
      'sound-circuit-bent-toy',
      'sound-microwave-beeps',
      'sound-vibraphone',
      'sound-hand-claps',
      'ensemble-echo-with-memory-loss',
      'gesture-group-inhale-trigger',
      'transmission-voicemail',
      'tuning-combination-tone',
      'rhythm-ratcheting',
      'spatial-mono-collapse',
      'damage-cd-skip',
      'roleexchange-production-hook',
      'temporal-loop-no-memory',
    ],
    musicStack: [
      recipeItem('nitrous', 'event-driven-variety-show', 94),
      recipeItem('nitrous', 'vocal-relay-riot', 86),
      recipeItem('nitrous', 'anchor-under-siege', 86),
    ],
    musicControls: {
      stemminess: 82,
      kineticDensity: 90,
      socialInfection: 72,
      coupling: 70,
      interruption: 96,
      anchorStrength: 86,
      castSize: 76,
    },
    realityChaos: 4,
    mouthPromptMode: 'bracketed',
    mouthSemanticMode: 'inherit',
    createdAt: 0,
  },
];
