import type { CompositionPreset } from '../types';

export interface SpecialtyCompositionPreset extends CompositionPreset {
  description: string;
  instrumentSummary: string;
}

export const SPECIALTY_COMPOSITION_PRESETS: SpecialtyCompositionPreset[] = [
  {
    id: 'builtin-composition-luminous-friction-orchestra',
    name: 'LUMINOUS FRICTION ORCHESTRA',
    description:
      'A secular radiant experimental palette built from sustained glass, bowed metal, continuous-pitch glide, and long beating partials. Gorgeous and uncanny without turning into church, gothic ambience, or generic angel soundtrack.',
    instrumentSummary:
      'glass harmonica • Cristal Baschet • bowed vibraphone • musical saw • Ondes Martenot • bowed piano strings',
    compositionEngineIds: [
      'sound-glass-harmonica',
      'sound-cristal-baschet',
      'sound-bowed-vibraphone',
      'sound-musical-saw',
      'sound-ondes-martenot',
      'sound-bowed-piano-strings',
    ],
    lockedEngineIds: [
      'sound-glass-harmonica',
      'sound-cristal-baschet',
      'sound-bowed-vibraphone',
      'sound-musical-saw',
      'sound-ondes-martenot',
      'sound-bowed-piano-strings',
    ],
    createdAt: 0,
    updatedAt: 0,
  },
];
