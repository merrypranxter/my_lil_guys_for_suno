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

export interface GenerationRequest {
  guyIds: string[];
  realityEngineIds?: string[];
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
}

export interface SavedStack {
  id: string;
  name: string;
  guyIds: string[];
  realityEngineIds: string[];
  createdAt: number;
}

export interface ArchivedRun {
  id: string;
  createdAt: number;
  guyIds: string[];
  realityEngineIds: string[];
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
}
