import { CompositionEngine, SoundSourceProfile } from '../types';
import { soundSourceToEngine } from './soundSourceFactory';
import { SOUND_SOURCES_CONVENTIONAL } from './soundSourcesConventional';
import { SOUND_SOURCES_TRADITIONAL } from './soundSourcesTraditional';
import { SOUND_SOURCES_EXPERIMENTAL } from './soundSourcesExperimental';
import { SOUND_SOURCES_MACHINES_OBJECTS } from './soundSourcesMachinesObjects';
import { SOUND_SOURCES_BIO_ENVIRONMENT } from './soundSourcesBioEnvironment';

export const SOUND_SOURCE_PROFILES: SoundSourceProfile[] = [
  ...SOUND_SOURCES_CONVENTIONAL,
  ...SOUND_SOURCES_TRADITIONAL,
  ...SOUND_SOURCES_EXPERIMENTAL,
  ...SOUND_SOURCES_MACHINES_OBJECTS,
  ...SOUND_SOURCES_BIO_ENVIRONMENT,
];

export const SOUND_SOURCE_ENGINES: CompositionEngine[] = SOUND_SOURCE_PROFILES.map(soundSourceToEngine);

export function getSoundSourceProfile(id: string): SoundSourceProfile | undefined {
  return SOUND_SOURCE_PROFILES.find((profile) => profile.id === id);
}

export function searchSoundSourceProfiles(query: string): SoundSourceProfile[] {
  const q = query.trim().toLowerCase();
  if (!q) return SOUND_SOURCE_PROFILES;

  return SOUND_SOURCE_PROFILES.filter((profile) =>
    [
      profile.name,
      profile.category,
      profile.origin || '',
      profile.excitation,
      profile.resonance,
      profile.behavior,
      ...profile.suggestedRoles,
      ...profile.tags,
    ].join(' ').toLowerCase().includes(q)
  );
}
