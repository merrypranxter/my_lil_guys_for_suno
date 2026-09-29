import { MusicStackItem, SavedStack } from '../types';

export interface SpecialtyWholeStackRecipe extends SavedStack {
  description: string;
  instrumentSummary: string;
  vibeSummary: string;
}

function recipeItem(refId: string, strength = 100, locked = true): MusicStackItem {
  return {
    instanceId: 'builtin-specialty-' + refId,
    kind: 'recipe',
    refId,
    muted: false,
    locked,
    strength,
  };
}

export const SPECIALTY_WHOLE_STACK_RECIPES: SpecialtyWholeStackRecipe[] = [
  {
    id: 'builtin-specialty-mouth-riot',
    name: 'MOUTH RIOT',
    description:
      'A vocal-system preset built around a simple recognizable anchor: distinct mouths ornament it, flip register, fracture into hockets, relay jobs, infect one another, become percussion/instruments, then return the anchor scarred but legible.',
    vibeSummary:
      'Hyperactive, social, acrobatic, funny, physical, highly structured; maximum mouth consequences without pure-glitch collapse.',
    instrumentSummary:
      'voices as lead • percussion • relay • hocket • response • texture • instrument',
    guyIds: ['sensory-freak', 'loop-ferret'],
    realityEngineIds: [],
    compositionEngineIds: [
      'ensemble-antiphonal-choirs',
      'gesture-breath-hocket',
      'gesture-group-inhale-trigger',
    ],
    musicStack: [
      recipeItem('mouth-riot', 100),
    ],
    musicControls: {
      stemminess: 92,
      kineticDensity: 91,
      socialInfection: 90,
      coupling: 78,
      interruption: 66,
      anchorStrength: 84,
      castSize: 88,
      mouthFreakery: 88,
      techniqueMutation: 76,
      vocalLegibility: 64,
      vocalPopulation: 86,
    },
    realityChaos: 2,
    mouthPromptMode: 'bracketed',
    mouthSemanticMode: 'mixed',
    createdAt: 0,
  },
  {
    id: 'builtin-specialty-ecstatic-choir-never-arrives',
    name: 'ECSTATIC CHOIR — NEVER ARRIVES',
    description:
      'A secular triumphant choir made from interlocking independent lines, co-prime rhythmic cycles, simultaneous harmonic planes, and repeated almost-cadences that keep opening upward instead of resolving.',
    vibeSummary:
      'Fun, ecstatic, radiant, weird, huge, forward-moving; never churchy, gothic, solemn, or generic cinematic angel choir.',
    instrumentSummary:
      'glass harmonica • Cristal Baschet • bowed vibraphone • musical saw • Ondes Martenot • bowed piano strings',
    guyIds: ['sensory-freak', 'alien-ruler', 'loop-ferret'],
    realityEngineIds: [],
    compositionEngineIds: [
      'sound-glass-harmonica',
      'sound-cristal-baschet',
      'sound-bowed-vibraphone',
      'sound-musical-saw',
      'sound-ondes-martenot',
      'sound-bowed-piano-strings',
      'ensemble-antiphonal-choirs',
      'gesture-breath-hocket',
      'gesture-group-inhale-trigger',
      'tuning-prime-lattice',
      'rhythm-coprime-cycles',
      'rhythm-phase-shift',
      'spatial-concentric-rings',
    ],
    musicStack: [
      recipeItem('ecstatic-choir-never-arrives', 100),
    ],
    musicControls: {
      stemminess: 86,
      kineticDensity: 80,
      socialInfection: 96,
      coupling: 96,
      interruption: 18,
      anchorStrength: 90,
      castSize: 100,
    mouthFreakery: 52,
    techniqueMutation: 45,
    vocalLegibility: 68,
    vocalPopulation: 48,
    },
    realityChaos: 2,
    mouthPromptMode: 'bracketed',
    mouthSemanticMode: 'inherit',
    createdAt: 0,
  },
];
