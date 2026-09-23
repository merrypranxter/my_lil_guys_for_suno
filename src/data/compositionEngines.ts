import { CompositionDimension, CompositionDomain, CompositionEngine } from '../types';
import { LANGUAGE_PROFILE_ENGINES } from './languageProfiles';
import { LANGUAGE_MODE_ENGINES } from './languageModes';
import { SOUND_SOURCE_ENGINES } from './soundSources';
import { ADDRESSEE_ENGINES } from './voiceAddressees';
import { ENSEMBLE_ENGINES } from './voiceEnsembles';
import { GESTURE_ENGINES } from './voiceGestures';
import { TRANSMISSION_ENGINES } from './signalTransmission';
import { TRANSDUCTION_ENGINES } from './signalTransduction';
import { RECORDING_DAMAGE_ENGINES } from './signalRecordingDamage';
import { TECHNOLOGY_ENGINES } from './signalTechnology';
import { TUNING_ENGINES } from './sonicTuning';
import { RHYTHM_PHYSICS_ENGINES } from './sonicRhythmPhysics';
import { SPATIAL_AUDIO_ENGINES } from './sonicSpatialAudio';
import { ROLE_EXCHANGE_ENGINES } from './sonicRoleExchange';
import { TEMPORAL_ENGINES } from './structureTemporal';
import { SCALE_ENGINES } from './structureScale';
import { EPISTEMOLOGY_ENGINES } from './structureEpistemology';

/**
 * Composition Lab is separate from Reality Engine.
 *
 * Reality answers WHO / WHERE / WHAT REALITY / WHAT STATE.
 * Composition Lab answers HOW THE PERFORMANCE IS PHYSICALLY ORGANIZED:
 * language, voices, signal path, sound sources, tuning, rhythm physics,
 * chronology, constraints, failure, authority, and related control systems.
 *
 * Job 8 established the registry and jurisdiction contracts.
 * Job 9 populates LANGUAGE / PHONOLOGY and LANGUAGE PERFORMANCE MODE.
 * Job 10 populates SOUND PALETTE / SOURCE.
 * Job 11 populates ADDRESSEE / RELATIONSHIP, ENSEMBLE / VOICE TOPOLOGY,
 * and PHYSICAL GESTURE / BODY.
 * Job 12 populates TRANSMISSION / MEDIA, TRANSLATION / TRANSDUCTION,
 * RECORDING / DAMAGE, and HISTORICAL TECHNOLOGY.
 * Job 13 populates TUNING / PITCH WORLD, RHYTHMIC PHYSICS,
 * STAGE GEOMETRY / SPATIAL AUDIO, and MUSICAL ROLE EXCHANGE.
 * Job 14 populates TEMPORAL ENGINE, SCALE ENGINE, and EPISTEMOLOGY / KNOWLEDGE.
 * Remaining Structure / Control dimensions are populated in Job 15.
 */
export const COMPOSITION_ENGINES: CompositionEngine[] = [
  ...LANGUAGE_PROFILE_ENGINES,
  ...LANGUAGE_MODE_ENGINES,
  ...SOUND_SOURCE_ENGINES,
  ...ADDRESSEE_ENGINES,
  ...ENSEMBLE_ENGINES,
  ...GESTURE_ENGINES,
  ...TRANSMISSION_ENGINES,
  ...TRANSDUCTION_ENGINES,
  ...RECORDING_DAMAGE_ENGINES,
  ...TECHNOLOGY_ENGINES,
  ...TUNING_ENGINES,
  ...RHYTHM_PHYSICS_ENGINES,
  ...SPATIAL_AUDIO_ENGINES,
  ...ROLE_EXCHANGE_ENGINES,
  ...TEMPORAL_ENGINES,
  ...SCALE_ENGINES,
  ...EPISTEMOLOGY_ENGINES,
];

export const COMPOSITION_DOMAIN_LABELS: Record<CompositionDomain, string> = {
  voice: 'VOICE LAB',
  signal: 'SIGNAL LAB',
  sonic: 'SONIC LAB',
  structure: 'STRUCTURE / CONTROL LAB',
};

export const COMPOSITION_DIMENSION_LABELS: Record<CompositionDimension, string> = {
  language: 'LANGUAGE / PHONOLOGY',
  languageMode: 'LANGUAGE PERFORMANCE MODE',
  addressee: 'ADDRESSEE / RELATIONSHIP',
  ensemble: 'ENSEMBLE / VOICE TOPOLOGY',
  gesture: 'PHYSICAL GESTURE / BODY',
  transmission: 'TRANSMISSION / MEDIA',
  transduction: 'TRANSLATION / TRANSDUCTION',
  recordingDamage: 'RECORDING / DAMAGE',
  technology: 'HISTORICAL TECHNOLOGY',
  soundSource: 'SOUND PALETTE / SOURCE',
  tuning: 'TUNING / PITCH WORLD',
  rhythmPhysics: 'RHYTHMIC PHYSICS',
  spatialAudio: 'STAGE GEOMETRY / SPATIAL AUDIO',
  roleExchange: 'MUSICAL ROLE EXCHANGE',
  temporal: 'TEMPORAL ENGINE',
  scale: 'SCALE ENGINE',
  audience: 'AUDIENCE FEEDBACK',
  epistemology: 'EPISTEMOLOGY / KNOWLEDGE',
  constraint: 'CONSTRAINT / GAME RULE',
  economy: 'ECONOMY / RESOURCE',
  failureMode: 'FAILURE MODE',
  controlAuthority: 'CONTROL AUTHORITY',
  prop: 'OBJECT / PROP',
};

export const COMPOSITION_DIMENSION_DOMAINS: Record<CompositionDimension, CompositionDomain> = {
  language: 'voice',
  languageMode: 'voice',
  addressee: 'voice',
  ensemble: 'voice',
  gesture: 'voice',
  transmission: 'signal',
  transduction: 'signal',
  recordingDamage: 'signal',
  technology: 'signal',
  soundSource: 'sonic',
  tuning: 'sonic',
  rhythmPhysics: 'sonic',
  spatialAudio: 'sonic',
  roleExchange: 'sonic',
  temporal: 'structure',
  scale: 'structure',
  audience: 'structure',
  epistemology: 'structure',
  constraint: 'structure',
  economy: 'structure',
  failureMode: 'structure',
  controlAuthority: 'structure',
  prop: 'structure',
};

export const COMPOSITION_DIMENSION_JURISDICTIONS: Record<CompositionDimension, string> = {
  language: 'Phonological inventory, phonotactics, prosody, syllable behavior, and language-specific mouth mechanics.',
  languageMode: 'Whether lyrics use the selected language, English with first-language transfer, code-switching, chant, patter, phonotactic nonsense, or another defined performance mode.',
  addressee: 'Who is being addressed and therefore what is assumed, explained, hidden, begged for, threatened, translated, or repeated.',
  ensemble: 'How many voices exist, how phrases and information are distributed between them, and how vocal agents interact.',
  gesture: 'How breathing, clapping, stomping, clicks, footsteps, mouth sounds, and other bodily actions become rhythm or timbre.',
  transmission: 'The channel carrying the performance and how that channel delays, gates, drops, compresses, censors, repeats, or mistransmits information.',
  transduction: 'Rules that convert one representation into another, such as words to rhythm, color to harmony, gesture to filter movement, or certainty to consonance.',
  recordingDamage: 'Physical or digital failure of the recording medium as timed structural events rather than decorative lo-fi texture.',
  technology: 'The technical capabilities, editing methods, bandwidth, storage, and limitations available to the production system.',
  soundSource: 'The acoustic, electronic, biological, mechanical, environmental, or object-based materials that physically produce the sound.',
  tuning: 'Pitch relationships, interval behavior, reference pitch, temperament, and allowable pitch-space organization.',
  rhythmPhysics: 'Pulse organization, cycle length, subdivision, phase, polymeter, density, acceleration, and temporal-grid behavior.',
  spatialAudio: 'Where performers and sound sources exist relative to one another and the listener, including motion, distance, direction, and shared acoustic space.',
  roleExchange: 'Which musical system temporarily performs another system’s job, such as melody becoming percussion or noise becoming harmony.',
  temporal: 'Narrative and compositional chronology: loops, reversals, countdowns, simultaneous timelines, recurrence, and causal ordering.',
  scale: 'The physical or conceptual scale at which events are described and therefore which causes, objects, and operations are available.',
  audience: 'How listeners, callers, judges, dancers, or crowds causally alter meter, harmony, lyrics, instrumentation, or form.',
  epistemology: 'What each narrator or performer knows, does not know, incorrectly knows, or is allowed to reveal.',
  constraint: 'Explicit game rules and invariants that create observable compositional consequences.',
  economy: 'Finite resources, prices, budgets, permits, depletion, exchange, and conservation rules inside the composition.',
  failureMode: 'How the system breaks, how failure propagates, and what survives or mutates after the failure.',
  controlAuthority: 'Which agent is allowed to make compositional changes and how authority transfers, rotates, or is contested.',
  prop: 'A recurring physical object whose functions accumulate across layers and mediate events rather than merely appearing in lyrics.',
};

/**
 * Maximum number of simultaneously active engines per dimension.
 * 0 is never used here; a missing selection means zero active.
 */
export const COMPOSITION_DIMENSION_LIMITS: Record<CompositionDimension, number> = {
  language: 1,
  languageMode: 1,
  addressee: 1,
  ensemble: 1,
  gesture: 2,
  transmission: 1,
  transduction: 2,
  recordingDamage: 2,
  technology: 1,
  soundSource: 8,
  tuning: 1,
  rhythmPhysics: 2,
  spatialAudio: 1,
  roleExchange: 2,
  temporal: 1,
  scale: 1,
  audience: 1,
  epistemology: 1,
  constraint: 3,
  economy: 1,
  failureMode: 1,
  controlAuthority: 1,
  prop: 1,
};

export function getCompositionEngine(id: string): CompositionEngine | undefined {
  return COMPOSITION_ENGINES.find((engine) => engine.id === id);
}

export function getCompositionEngines(ids: string[]): CompositionEngine[] {
  return ids
    .map((id) => getCompositionEngine(id))
    .filter((engine): engine is CompositionEngine => Boolean(engine));
}

export function getCompositionEnginesByDimension(dimension: CompositionDimension): CompositionEngine[] {
  return COMPOSITION_ENGINES.filter((engine) => engine.dimension === dimension);
}

export function getCompositionEnginesByDomain(domain: CompositionDomain): CompositionEngine[] {
  return COMPOSITION_ENGINES.filter((engine) => engine.domain === domain);
}

/**
 * Enforces per-dimension cardinality while preserving the most recently
 * supplied IDs for dimensions that exceed their selection limit.
 */
export function normalizeCompositionEngineIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const valid = ids.filter((id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return Boolean(getCompositionEngine(id));
  });

  const counts = new Map<CompositionDimension, number>();
  const keptReversed: string[] = [];

  for (let i = valid.length - 1; i >= 0; i -= 1) {
    const id = valid[i];
    const engine = getCompositionEngine(id);
    if (!engine) continue;
    const used = counts.get(engine.dimension) || 0;
    const limit = COMPOSITION_DIMENSION_LIMITS[engine.dimension];
    if (used >= limit) continue;
    counts.set(engine.dimension, used + 1);
    keptReversed.push(id);
  }

  return keptReversed.reverse();
}
