export interface LittleGuy {
  id: string;
  name: string;
  subtitle: string;
  rule: string;
  defaultJurisdiction: string;
  shortExplanation: string;
  accentColor: string;
  glowClass: string;
  badgeLabel: string;
}

export type MindFamily =
  | 'mutation'
  | 'causal'
  | 'temporal'
  | 'semantic'
  | 'perception'
  | 'ontology'
  | 'constraint'
  | 'systems'
  | 'selection'
  | 'meta'
  | 'narrative'
  | 'memory'
  | 'representation';

export interface MindMetadata {
  family: MindFamily;
  chaos: 1 | 2 | 3 | 4 | 5;
  compatibilityTags: string[];
  frictionTags: string[];
  recommendedPairings: string[];
  roleHint: string;
}

export type RealityDimension =
  | 'format'
  | 'role'
  | 'world'
  | 'species'
  | 'venue'
  | 'headspace'
  | 'alteredState'
  | 'tone';

export interface RealityEngine {
  id: string;
  dimension: RealityDimension;
  name: string;
  subtitle: string;
  rule: string;
  shortExplanation: string;
  tags: string[];
  accentColor?: string;
  sourceNotes?: string[];
}


export type CompositionDomain =
  | 'voice'
  | 'signal'
  | 'sonic'
  | 'structure';

export type CompositionDimension =
  | 'language'
  | 'languageMode'
  | 'addressee'
  | 'ensemble'
  | 'gesture'
  | 'transmission'
  | 'transduction'
  | 'recordingDamage'
  | 'technology'
  | 'soundSource'
  | 'tuning'
  | 'rhythmPhysics'
  | 'spatialAudio'
  | 'roleExchange'
  | 'temporal'
  | 'scale'
  | 'audience'
  | 'epistemology'
  | 'constraint'
  | 'economy'
  | 'failureMode'
  | 'controlAuthority'
  | 'prop';

export interface CompositionEngine {
  id: string;
  domain: CompositionDomain;
  dimension: CompositionDimension;
  name: string;
  subtitle: string;
  rule: string;
  shortExplanation: string;
  tags: string[];
  accentColor?: string;
  sourceNotes?: string[];
}


export interface CompositionFavorite {
  engineId: string;
  note: string;
  createdAt: number;
  updatedAt: number;
}

export interface CompositionPreset {
  id: string;
  name: string;
  compositionEngineIds: string[];
  lockedEngineIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface RecentCompositionBuild {
  runId: string;
  createdAt: number;
  compositionEngineIds: string[];
  seed: string;
  model: string;
}


export interface LanguageProfile {
  id: string;
  name: string;
  family?: string;
  region?: string;
  consonantFeatures: string[];
  vowelFeatures: string[];
  prosodyFeatures: string[];
  rhythmNotes: string[];
  phonologyNotes: string[];
  distinctiveFeatures: string[];
  tags: string[];
  sourceNotes?: string[];
}


export type SoundSourceCategory =
  | 'conventional'
  | 'regionalTraditional'
  | 'historical'
  | 'experimental'
  | 'electronic'
  | 'machine'
  | 'domesticObject'
  | 'industrial'
  | 'body'
  | 'animal'
  | 'environment'
  | 'communications'
  | 'synthesis'
  | 'resonance';

export interface SoundSourceProfile {
  id: string;
  name: string;
  category: SoundSourceCategory;
  origin?: string;
  excitation: string;
  resonance: string;
  behavior: string;
  suggestedRoles: string[];
  tags: string[];
  sourceNotes?: string[];
}

export type RealityChaosLevel = 1 | 2 | 3 | 4;

export type BoxType = 'style' | 'lyrics' | 'caption';

export interface MusicFingerprint {
  genreFamily: string;
  harmony: string;
  melody: string;
  rhythm: string;
  timbre: string;
  vocal: string;
  performance: string;
  production: string;
}

export type MusicMechanismFamily =
  | 'rhythm'
  | 'vocal'
  | 'form'
  | 'arrangement'
  | 'texture'
  | 'performance';

export interface MusicMechanism {
  id: string;
  family: MusicMechanismFamily;
  name: string;
  shortExplanation: string;
  instruction: string;
  tags: string[];
  stemValue: 1 | 2 | 3 | 4 | 5;
  chaos: 1 | 2 | 3 | 4 | 5;
}

export interface MusicControls {
  stemminess: number;
  kineticDensity: number;
  socialInfection: number;
  coupling: number;
  interruption: number;
  anchorStrength: number;
  castSize: number;
}

export interface MusicSeedRecipe {
  id: string;
  name: string;
  description: string;
  startHere: string;
  mechanismIds: string[];
  defaultControls?: Partial<MusicControls>;
}

export interface MusicGenomeParentRef {
  id: string;
  name: string;
  kind: 'recipe' | 'genome';
  generation: number;
}

export interface MusicGenomeLineage {
  parentA: MusicGenomeParentRef;
  parentB: MusicGenomeParentRef;
  breedingSeed: string;
  invariant: string;
  inheritedFromA: string[];
  inheritedFromB: string[];
  mutationMechanismId?: string;
  relationshipLaw: string;
}

export interface MusicBredGenome {
  id: string;
  name: string;
  description: string;
  mechanismIds: string[];
  controls: MusicControls;
  generation: number;
  createdAt: number;
  lineage: MusicGenomeLineage;
}

export type MusicStackItemKind = 'recipe' | 'mechanism' | 'genome';

export interface MusicStackItem {
  instanceId: string;
  kind: MusicStackItemKind;
  refId: string;
  muted: boolean;
  locked: boolean;
  strength: number;
  genome?: MusicBredGenome;
}

export interface GenerationRequest {
  guyIds: string[];
  realityEngineIds?: string[];
  compositionEngineIds?: string[];
  musicStack?: MusicStackItem[];
  musicControls?: MusicControls;
  realityChaos?: RealityChaosLevel;
  seed?: string;
  energy: number;
  recentFingerprints?: MusicFingerprint[];
  likedSignals?: string[];
}

export interface GenerationResponse {
  style: string;
  lyrics: string;
  caption: string;
  fingerprint?: MusicFingerprint;
  charCounts: {
    style: number;
    lyrics: number;
    caption: number;
  };
  model?: string;
  error?: string;
}

export interface RepairRequest {
  boxType: BoxType;
  currentText: string;
  seed?: string;
  guyIds: string[];
  realityEngineIds?: string[];
  compositionEngineIds?: string[];
  musicStack?: MusicStackItem[];
  musicControls?: MusicControls;
  realityChaos?: RealityChaosLevel;
}

export interface SavedStack {
  id: string;
  name: string;
  guyIds: string[];
  realityEngineIds: string[];
  compositionEngineIds: string[];
  musicStack?: MusicStackItem[];
  musicControls?: MusicControls;
  realityChaos?: RealityChaosLevel;
  createdAt: number;
}

export interface ArchivedRun {
  id: string;
  createdAt: number;
  guyIds: string[];
  realityEngineIds: string[];
  compositionEngineIds: string[];
  musicStack?: MusicStackItem[];
  musicControls?: MusicControls;
  realityChaos?: RealityChaosLevel;
  seed: string;
  energy: number;
  model: string;
  style: string;
  lyrics: string;
  caption: string;
  charCounts: {
    style: number;
    lyrics: number;
    caption: number;
  };
  fingerprint?: MusicFingerprint;
  starred: boolean;
  feedback: string;
  feedbackTags?: string[];
}
