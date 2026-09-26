import type { MusicControls, RealityChaosLevel } from '../types';

export type StarterSeedCategory =
  | 'affect'
  | 'psychedelic'
  | 'motion'
  | 'social'
  | 'instrumentPack'
  | 'worldPackage'
  | 'texture';

export type StarterSeedJurisdiction =
  | 'emotionalValence'
  | 'harmonicTrajectory'
  | 'melodicBehavior'
  | 'rhythmicBehavior'
  | 'kineticDensity'
  | 'vocalBehavior'
  | 'socialBehavior'
  | 'form'
  | 'arrangement'
  | 'performance'
  | 'timbre'
  | 'production'
  | 'temporalPerception'
  | 'spatialPerception'
  | 'semanticWorld'
  | 'cast'
  | 'medium'
  | 'eventLogic'
  | 'instrumentation';

export type StarterSeedCollisionMode = 'negotiate' | 'protect' | 'exclusive';

export interface StarterSeedMusicRef {
  id: string;
  strength: number;
}

export interface StarterSeedWorldFrame {
  setting: string;
  medium: string;
  primaryCharacter: string;
  supportingCast: string[];
  recurringConcern: string;
  eventCues: string[];
  invariant: string;
}

export interface StarterSeedInstrumentRole {
  engineId: string;
  role: string;
  jurisdiction: string;
}

export interface StarterSeedOutputs {
  realityEngineIds?: string[];
  compositionEngineIds?: string[];
  musicRecipeRefs?: StarterSeedMusicRef[];
  musicMechanismRefs?: StarterSeedMusicRef[];
  musicControlDeltas?: Partial<Record<keyof MusicControls, number>>;
  realityChaos?: RealityChaosLevel;
  promptDirectives?: string[];
}

export interface StarterSeedDefinition {
  schemaVersion: 1;
  id: string;
  name: string;
  category: StarterSeedCategory;
  description: string;
  defaultIntensity: number;
  tags: string[];

  /**
   * What this seed is allowed to strongly control.
   * If multiple active seeds own the same jurisdiction, the compiler must
   * create an explicit negotiation instead of averaging them into mush.
   */
  owns: StarterSeedJurisdiction[];

  /** Things this seed encourages without claiming exclusive control over them. */
  biases: string[];

  /** Invariants that later systems should preserve unless the user explicitly unlocks them. */
  protects: string[];

  /** Anti-drift rules: outcomes this seed specifically refuses. */
  forbids: string[];

  /** Executable musical / semantic transformations. Avoid vague mood-only language. */
  operators: string[];

  collisionMode?: StarterSeedCollisionMode;
  outputs?: StarterSeedOutputs;

  /** Present only for coherent semantic world bundles. */
  worldFrame?: StarterSeedWorldFrame;

  /** Present only for instrument-pack bundles. */
  instrumentRoles?: StarterSeedInstrumentRole[];
}

export interface StarterSeedStackItem {
  instanceId: string;
  seedId: string;
  intensity: number;
  muted: boolean;
  locked: boolean;
}

export interface StarterSeedCollision {
  jurisdiction: StarterSeedJurisdiction;
  seedIds: string[];
  seedNames: string[];
  directive: string;
}

export interface CompiledStarterSeedStack {
  activeSeeds: Array<{
    seed: StarterSeedDefinition;
    intensity: number;
    locked: boolean;
  }>;

  realityEngineIds: string[];
  compositionEngineIds: string[];

  musicRecipeRefs: StarterSeedMusicRef[];
  musicMechanismRefs: StarterSeedMusicRef[];
  musicControlDeltas: Partial<Record<keyof MusicControls, number>>;
  realityChaos?: RealityChaosLevel;

  directives: string[];
  protectedInvariants: string[];
  forbiddenDrift: string[];
  eventCues: string[];
  collisions: StarterSeedCollision[];
}

export interface StarterSeedValidationResult {
  valid: boolean;
  errors: string[];
}
