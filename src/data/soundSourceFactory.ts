import { CompositionEngine, SoundSourceCategory, SoundSourceProfile } from '../types';

export const SOUND_SOURCE_GENERAL_SOURCES = [
  'MIMO — Musical Instrument Museums Online; broad public-collection instrument database and Hornbostel-Sachs resources',
  'The Metropolitan Museum of Art — Department of Musical Instruments; global historical instrument collection',
  'Smithsonian Folkways — world/traditional instrument recordings and contextual liner notes',
];

export function soundSource(
  id: string,
  name: string,
  category: SoundSourceCategory,
  excitation: string,
  resonance: string,
  behavior: string,
  suggestedRoles: string[],
  tags: string[] = [],
  origin?: string,
  sourceNotes: string[] = SOUND_SOURCE_GENERAL_SOURCES,
): SoundSourceProfile {
  return {
    id: 'sound-' + id,
    name,
    category,
    origin,
    excitation,
    resonance,
    behavior,
    suggestedRoles,
    tags: ['sound-source', category, ...tags],
    sourceNotes,
  };
}

export function soundSourceToEngine(profile: SoundSourceProfile): CompositionEngine {
  return {
    id: profile.id,
    domain: 'sonic',
    dimension: 'soundSource',
    name: profile.name,
    subtitle: [profile.category, profile.origin].filter(Boolean).join(' • '),
    rule:
      'Use ' + profile.name + ' as a real sonic material, not a noun in a genre list. ' +
      'EXCITATION: ' + profile.excitation + ' ' +
      'RESONANCE: ' + profile.resonance + ' ' +
      'MUSICAL BEHAVIOR: ' + profile.behavior + ' ' +
      'SUGGESTED ROLES: ' + profile.suggestedRoles.join(', ') + '. ' +
      'If multiple SOUND SOURCES are active, give each a distinct job or register and preserve its characteristic attack, sustain, noise, resonance, or articulation.',
    shortExplanation: profile.behavior,
    tags: profile.tags,
    accentColor: '#ff9f1c',
    sourceNotes: profile.sourceNotes,
  };
}
