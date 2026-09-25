import { MouthBreedingObjective } from './types';

export const MOUTH_BREEDING_OBJECTIVES: MouthBreedingObjective[] = [
  {
    id: 'mouth-objective-distance-from-english',
    name: 'MAXIMUM DISTANCE FROM ENGLISH',
    description: 'Prefer donor machinery that changes several independent mouth axes while keeping semantic output intelligible by default.',
    preferredTraitTags: ['click', 'ejective', 'tone', 'consonant-heavy', 'phonation', 'mora', 'vowel-harmony'],
    relationshipBias: 'orthogonal',
    preserveIntelligibilityByDefault: true,
  },
  {
    id: 'mouth-objective-consonant-fuckery',
    name: 'MAXIMUM CONSONANT FUCKERY',
    description: 'Prefer click systems, ejectives, dense clusters, unusual rhotics, lateral noise, and large consonant palettes.',
    preferredTraitTags: ['click', 'ejective', 'cluster', 'rhotic', 'lateral', 'large-inventory', 'consonant-heavy'],
    relationshipBias: 'conflict',
    preserveIntelligibilityByDefault: true,
  },
  {
    id: 'mouth-objective-vowel-fuckery',
    name: 'MAXIMUM VOWEL FUCKERY',
    description: 'Prefer nasalization, harmony, vowel recoloring, length, phonation, and deliberately sparse or expanded vowel behavior.',
    preferredTraitTags: ['nasal', 'vowel-harmony', 'vowel-color', 'vowel-length', 'phonation', 'front-rounded', 'small-vowel'],
    relationshipBias: 'catalytic',
    preserveIntelligibilityByDefault: true,
  },
  {
    id: 'mouth-objective-mouth-percussion',
    name: 'MAXIMUM MOUTH PERCUSSION',
    description: 'Prefer consonantal events that can become audible rhythmic machinery.',
    preferredTraitTags: ['percussive', 'click', 'ejective', 'attack', 'glottal', 'gemination', 'cluster'],
    relationshipBias: 'cooperative',
    preserveIntelligibilityByDefault: true,
  },
  {
    id: 'mouth-objective-laryngeal',
    name: 'MAXIMUM LARYNGEAL ACTIVITY',
    description: 'Prefer glottal interruption, ejective attack, marked phonation, and back-of-mouth/laryngeal color.',
    preferredTraitTags: ['larynx', 'glottal', 'ejective', 'phonation', 'pharyngeal', 'creaky'],
    relationshipBias: 'catalytic',
    preserveIntelligibilityByDefault: true,
  },
  {
    id: 'mouth-objective-tonal',
    name: 'MAXIMUM TONAL INFORMATION',
    description: 'Prefer tone, pitch-accent, quantity, and timing systems that force melody to negotiate with language structure.',
    preferredTraitTags: ['tone', 'pitch-accent', 'quantity', 'mora', 'melody-control'],
    relationshipBias: 'cooperative',
    preserveIntelligibilityByDefault: true,
  },
  {
    id: 'mouth-objective-phonotactic-conflict',
    name: 'MAXIMUM PHONOTACTIC CONFLICT',
    description: 'Prefer donors whose syllable repair rules disagree, such as extreme clustering versus open-syllable pressure.',
    preferredTraitTags: ['cluster', 'open-syllable', 'repair', 'syllabic-consonant', 'small-inventory'],
    relationshipBias: 'conflict',
    preserveIntelligibilityByDefault: true,
  },
  {
    id: 'mouth-objective-minimum-mouth',
    name: 'MINIMUM POSSIBLE MOUTH',
    description: 'Constrain the available sound inventory and force source material through a deliberately tiny phonological channel.',
    preferredTraitTags: ['small-inventory', 'compression', 'lossy', 'small-vowel'],
    discouragedTraitTags: ['large-inventory', 'high-dimensional'],
    relationshipBias: 'cooperative',
    preserveIntelligibilityByDefault: false,
  },
  {
    id: 'mouth-objective-pathological-consistency',
    name: 'ONE MUTATION ESCAPES',
    description: 'Choose one highly audible trait and apply it with unreasonable consistency while leaving the rest of the mouth comparatively stable.',
    preferredTraitTags: ['micro-mutation', 'rhotic', 'glottal', 'lateral', 'ejective'],
    relationshipBias: 'balanced',
    preserveIntelligibilityByDefault: true,
  },
  {
    id: 'mouth-objective-musical-convertibility',
    name: 'MAXIMUM MUSICAL CONVERTIBILITY',
    description: 'Prefer traits with clear mappings to rhythm, melody, duration, timbre, or arrangement triggers.',
    preferredTraitTags: ['percussive', 'melody-control', 'timing', 'coupling', 'attack', 'duration'],
    relationshipBias: 'catalytic',
    preserveIntelligibilityByDefault: true,
  },
];

export const MOUTH_BREEDING_OBJECTIVE_BY_ID = new Map(
  MOUTH_BREEDING_OBJECTIVES.map((item) => [item.id, item]),
);
