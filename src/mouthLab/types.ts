export type MouthAxis =
  | 'semantics'
  | 'lexicon'
  | 'morphology'
  | 'syntax'
  | 'consonants'
  | 'vowels'
  | 'phonotactics'
  | 'syllableStructure'
  | 'airflow'
  | 'larynx'
  | 'phonation'
  | 'tone'
  | 'stress'
  | 'prosody'
  | 'timing'
  | 'orthography';

export type MouthTraitCategory =
  | 'segment'
  | 'syllable'
  | 'prosody'
  | 'timing'
  | 'phonation'
  | 'morphology'
  | 'syntax'
  | 'anchor';

export type MouthTraitPressure = 'low' | 'medium' | 'high' | 'obsessive';

export type MouthTraitRelationship =
  | 'orthogonal'
  | 'cooperative'
  | 'competitive'
  | 'catalytic'
  | 'parasitic'
  | 'mutuallyExclusive'
  | 'unstable';

export type MouthResearchConfidence = 'high' | 'medium' | 'provisional';

export type MouthTechniqueFamily =
  | 'register'
  | 'articulation'
  | 'ornament'
  | 'rhythm'
  | 'phonetic'
  | 'resonance'
  | 'ensemble'
  | 'airflow';

export type MouthTechniqueJob =
  | 'lead'
  | 'punctuation'
  | 'percussion'
  | 'texture'
  | 'response'
  | 'transition'
  | 'anchor'
  | 'escalation';

export interface MouthTechniqueDefinition {
  id: string;
  name: string;
  family: MouthTechniqueFamily;
  description: string;
  jobs: MouthTechniqueJob[];
  traitTags: string[];
  compatibleTechniqueIds: string[];
  antagonisticTechniqueIds: string[];
  mutationProperties: Array<'contour' | 'rhythm' | 'register' | 'articulation' | 'function' | 'timbre'>;
  minCooldownEvents: number;
  maxConsecutiveUses: number;
  intelligibilityCost: number;
  densityCost: number;
  promptRule: string;
}

export interface MouthTechniquePaletteEntry {
  techniqueId: string;
  weight: number;
  job: MouthTechniqueJob;
  reason: string;
}

export type MouthTechniqueInteractionKind =
  | 'inheritContour'
  | 'inheritRhythm'
  | 'functionTransfer'
  | 'registerCascade'
  | 'hocketFracture'
  | 'phoneticCompression'
  | 'phoneticExpansion'
  | 'populationInfection'
  | 'acrobaticEscalation'
  | 'techniqueCollision';

export interface MouthTechniqueInteraction {
  id: string;
  kind: MouthTechniqueInteractionKind;
  sourceTechniqueId: string;
  targetTechniqueId: string;
  transferProperty: 'contour' | 'rhythm' | 'register' | 'articulation' | 'function' | 'timbre';
  trigger: string;
  intensity: number;
  preserve: string;
  directive: string;
}

export type MouthCastRole =
  | 'lead'
  | 'narrator'
  | 'crowd'
  | 'smallGroup'
  | 'freakVoice'
  | 'response'
  | 'whisper'
  | 'choir';

export type MouthExpressionState = 'dominant' | 'recessive' | 'latent' | 'triggered';

export type MouthDynamicTargetType = 'trait' | 'quirk';

export interface MouthCastProfile {
  id: string;
  role: MouthCastRole;
  label: string;
  sourceGenomeId?: string;
  parentDonorIds: string[];
  assignments: MouthJurisdictionAssignment[];
  quirks: MouthQuirkInstance[];
  intelligibility: number;
  stability: number;
  mutation: number;
}

export interface MouthExpressionRule {
  id: string;
  targetType: MouthDynamicTargetType;
  targetId: string;
  state: MouthExpressionState;
  strength: number;
  trigger?: string;
  castRole?: MouthCastRole;
}

export type MouthMutationAction =
  | 'activateTrait'
  | 'suppressTrait'
  | 'escalateTrait'
  | 'activateQuirk'
  | 'suppressQuirk'
  | 'infectCast'
  | 'swapCastMouth';

export interface MouthMutationEvent {
  id: string;
  positionPercent: number;
  sectionLabel?: string;
  trigger?: string;
  action: MouthMutationAction;
  targetType?: MouthDynamicTargetType;
  targetId?: string;
  sourceCastRole?: MouthCastRole;
  targetCastRole?: MouthCastRole;
  amount: number;
}

export type MouthMutationCurveShape = 'linear' | 'step' | 'exponential' | 'oscillating';

export interface MouthMutationCurve {
  id: string;
  targetType: MouthDynamicTargetType;
  targetId: string;
  startPercent: number;
  endPercent: number;
  startStrength: number;
  endStrength: number;
  shape: MouthMutationCurveShape;
  castRole?: MouthCastRole;
}

export type MouthTransductionDirection = 'languageToMusic' | 'musicToLanguage';

export type MouthMusicVariable =
  | 'rhythm'
  | 'melody'
  | 'duration'
  | 'timbre'
  | 'dynamics'
  | 'arrangement'
  | 'harmony'
  | 'density';

export interface MouthTransductionRule {
  id: string;
  direction: MouthTransductionDirection;
  source: string;
  target: string;
  mapping: string;
  strength: number;
  castRole?: MouthCastRole;
  trigger?: string;
}

export interface MouthDynamics {
  castProfiles: MouthCastProfile[];
  expressionRules: MouthExpressionRule[];
  mutationCurves: MouthMutationCurve[];
  timeline: MouthMutationEvent[];
  transductions: MouthTransductionRule[];
}


export interface MouthSpeciesLineage {
  parentGenomeIds: string[];
  parentNames: string[];
  generation: number;
  breedingSeed: string;
  inheritedTraitIdsByParent: Record<string, string[]>;
  inheritedQuirkIdsByParent: Record<string, string[]>;
  specimenIds: string[];
  mutationTraitIds: string[];
  mutationQuirkIds: string[];
  noveltyPenaltyTraitIds: string[];
}

export interface MouthFitnessRecord {
  phenotypeSignature: string;
  genomeIds: string[];
  approved: boolean;
  approvalCount: number;
  likedTraitIds: string[];
  dislikedTraitIds: string[];
  likedQuirkIds: string[];
  dislikedQuirkIds: string[];
  sourceRunIds: string[];
  note: string;
  createdAt: number;
  updatedAt: number;
}

export interface MouthEvolutionRequest {
  parentA: MouthGenome;
  parentB: MouthGenome;
  breedingSeed: string;
  requestedName?: string;
  specimenAssist?: MouthSpecimen[];
  fitnessRecords?: MouthFitnessRecord[];
  recentGenomes?: MouthGenome[];
  mutationChance?: number;
  preserveDynamicsChance?: number;
}

export interface MouthSelfEvolutionRequest {
  parent: MouthGenome;
  evolutionSeed: string;
  requestedName?: string;
  mutationChance?: number;
  specimenAssist?: MouthSpecimen[];
  fitnessRecords?: MouthFitnessRecord[];
  recentGenomes?: MouthGenome[];
}

export interface MouthEvolutionResult {
  genome: MouthGenome;
  phenotype: MouthPhenotype;
  lineage: MouthSpeciesLineage;
  warnings: string[];
  noveltyPenalties: string[];
}


export type MouthPromptMode = 'compact' | 'bracketed' | 'descriptive';

export const MOUTH_SEMANTIC_MODES = [
  'inherit',
  'englishMeaningAlienMouth',
  'mixed',
  'decay',
  'nonsemantic',
  'evolving',
] as const;

export type MouthSemanticMode = (typeof MOUTH_SEMANTIC_MODES)[number];

export function normalizeMouthSemanticMode(value: unknown): MouthSemanticMode {
  return MOUTH_SEMANTIC_MODES.includes(value as MouthSemanticMode)
    ? (value as MouthSemanticMode)
    : 'inherit';
}

export interface MouthPromptCompileOptions {
  mode?: MouthPromptMode;
  semanticMode?: MouthSemanticMode;
  includePhenotype?: boolean;
}

export interface MouthCompiledPrompt {
  mode: MouthPromptMode;
  semanticMode: MouthSemanticMode;
  text: string;
  styleDirectives: string;
  lyricsDirectives: string;
  summary: string;
  activeTraitIds: string[];
  activeQuirkIds: string[];
  warnings: string[];
}

export type MouthQuirkOrigin = 'trait-derived' | 'invented' | 'captured';

export type MouthQuirkCategory =
  | 'pronunciation'
  | 'rhotic'
  | 'consonant'
  | 'vowel'
  | 'timing'
  | 'prosody'
  | 'phonation'
  | 'morphology'
  | 'mutation';

export type MouthTakeoverMode =
  | 'constant'
  | 'instant'
  | 'gradual'
  | 'stepwise'
  | 'eventTriggered'
  | 'oscillating'
  | 'oneWay';

export interface MouthTakeoverCurve {
  mode: MouthTakeoverMode;
  startPercent: number;
  endPercent: number;
  steps?: number;
  trigger?: string;
}

export interface MouthQuirkDefinition {
  id: string;
  name: string;
  category: MouthQuirkCategory;
  axis: MouthAxis;
  target: string;
  transformation: string;
  origin: MouthQuirkOrigin;
  sourceTraitIds: string[];
  tags: string[];
  defaultFrequency: number;
  defaultConsistency: number;
  defaultExaggeration: number;
  defaultTakeover: MouthTakeoverCurve;
  intelligibilityRisk: 1 | 2 | 3 | 4 | 5;
  shortExplanation: string;
}

export interface MouthQuirkInstance {
  id: string;
  quirkId: string;
  enabled: boolean;
  frequency: number;
  consistency: number;
  exaggeration: number;
  takeover: MouthTakeoverCurve;
  trigger?: string;
  linkedTraitIds: string[];
  createdAt: number;
}

export type MouthSpecimenRecurrence =
  | 'once'
  | 'occasional'
  | 'repeated'
  | 'everyTime';

export type MouthSpecimenCategory =
  | 'pronunciation'
  | 'rhythm'
  | 'voiceQuality'
  | 'timing'
  | 'morphology'
  | 'accentish'
  | 'unknown';

export interface MouthSpecimen {
  id: string;
  name: string;
  observedBehavior: string;
  whyLiked: string;
  category: MouthSpecimenCategory;
  recurrence: MouthSpecimenRecurrence;
  sourceRunId?: string;
  sourceGenomeId?: string;
  quirkIds: string[];
  linkedTraitIds: string[];
  linkedGeneBundleIds: string[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface MouthSpecimenCaptureRequest {
  name?: string;
  observedBehavior: string;
  whyLiked?: string;
  category?: MouthSpecimenCategory;
  recurrence?: MouthSpecimenRecurrence;
  sourceRunId?: string;
  sourceGenomeId?: string;
  quirkIds?: string[];
  linkedTraitIds?: string[];
  tags?: string[];
}

export interface MouthLinkedGeneBundle {
  id: string;
  name: string;
  traitIds: string[];
  quirkIds: string[];
  lockedTogether: boolean;
  note: string;
  createdAt: number;
}

export type MouthEnvironmentMode = 'exposure' | 'infection' | 'isolation';

export interface MouthEnvironment {
  mode: MouthEnvironmentMode;
  sourceDonorId?: string;
  pressure: number;
  generations: number;
  adaptationTraitIds: string[];
  seed: string;
  createdAt: number;
}

export interface MouthEnvironmentRequest {
  mode: MouthEnvironmentMode;
  sourceDonorId?: string;
  pressure?: number;
  generations?: number;
  seed?: string;
}

export type MouthEvolutionaryOperation =
  | 'bottleneck'
  | 'founder-effect'
  | 'atavism'
  | 'extinction'
  | 'fossilize'
  | 'speciate';

export interface MouthFossil {
  id: string;
  sourceType: 'trait' | 'quirk';
  sourceId: string;
  sourceName: string;
  musicalRule: string;
  generation: number;
  createdAt: number;
}

export interface MouthEvolutionaryOperationRequest {
  genome: MouthGenome;
  operation: MouthEvolutionaryOperation;
  seed: string;
  intensity?: number;
  targetId?: string;
  requestedName?: string;
}

export interface MouthEvolutionaryOperationResult {
  genome: MouthGenome;
  operation: MouthEvolutionaryOperation;
  summary: string;
  affectedTraitIds: string[];
  affectedQuirkIds: string[];
  fossil?: MouthFossil;
}

export interface MouthMutationScar {
  id: string;
  sourceOperation: 'gene-knockout' | 'quirk-removal' | 'specimen-application' | 'environment-exposure' | 'bottleneck' | 'founder-effect' | 'atavism' | 'extinction' | 'fossilize' | 'speciate' | 'manual';
  removedTraitIds: string[];
  removedQuirkIds: string[];
  residualRule: string;
  strength: number;
  createdAt: number;
}

export interface MouthLabArchive {
  version: 1;
  specimens: MouthSpecimen[];
  species: MouthGenome[];
  linkedGeneBundles: MouthLinkedGeneBundle[];
  updatedAt: number;
}

export interface MouthTrait {
  id: string;
  name: string;
  category: MouthTraitCategory;
  axes: MouthAxis[];
  shortExplanation: string;
  operation: string;
  tags: string[];
  musicalAffordances: string[];
  donorProfileIds: string[];
  defaultPressure: MouthTraitPressure;
  confidence: MouthResearchConfidence;
  sourceNotes: string[];
  cautions?: string[];
}

export interface MouthDonor {
  id: string;
  languageProfileId: string;
  name: string;
  whyUseful: string;
  traitIds: string[];
  preferredAxes: MouthAxis[];
  confidence: MouthResearchConfidence;
  sourceNotes: string[];
  doNotClaim: string[];
}

export type MouthBreedingRelationshipBias =
  | 'balanced'
  | 'cooperative'
  | 'conflict'
  | 'orthogonal'
  | 'catalytic';

export interface MouthBreedingObjective {
  id: string;
  name: string;
  description: string;
  preferredTraitTags: string[];
  discouragedTraitTags?: string[];
  relationshipBias: MouthBreedingRelationshipBias;
  preserveIntelligibilityByDefault: boolean;
}

export interface MouthJurisdictionAssignment {
  axis: MouthAxis;
  donorId?: string;
  traitIds: string[];
  pressure: MouthTraitPressure;
  locked: boolean;
}

export interface MouthGenome {
  id: string;
  name: string;
  parentDonorIds: string[];
  assignments: MouthJurisdictionAssignment[];
  objectiveId?: string;
  semanticAnchorLanguageProfileId?: string;
  intelligibility: number;
  stability: number;
  mutation: number;
  musicalExpression: number;
  breedingSeed: string;
  quirks: MouthQuirkInstance[];
  mutationScars: MouthMutationScar[];
  fossils?: MouthFossil[];
  environment?: MouthEnvironment;
  linkedGeneBundles: MouthLinkedGeneBundle[];
  dynamics?: MouthDynamics;
  lineage?: MouthSpeciesLineage;
  createdAt: number;
}

export interface MouthManualAssignment {
  axis: MouthAxis;
  donorId: string;
  traitIds: string[];
  pressure?: MouthTraitPressure;
}

export interface MouthBreedingRequest {
  parentDonorIds: string[];
  breedingSeed: string;
  objectiveId?: string;
  semanticAnchorLanguageProfileId?: string;
  intelligibility?: number;
  stability?: number;
  mutation?: number;
  requestedName?: string;
  manualAssignments?: MouthManualAssignment[];
}

export interface MouthTraitRelationshipRule {
  traitAId: string;
  traitBId: string;
  relationship: MouthTraitRelationship;
  explanation: string;
  resolutionLaw: string;
  severity: 1 | 2 | 3 | 4 | 5;
}

export interface MouthPhenotypeTrait {
  traitId: string;
  donorId?: string;
  axis: MouthAxis;
  pressure: MouthTraitPressure;
  salience: number;
  consistency: number;
  expectedAudibility: 'subtle' | 'intermittent' | 'clear' | 'dominant';
  suppressedByTraitId?: string;
}

export interface MouthPhenotypeInteraction {
  traitAId: string;
  traitBId: string;
  relationship: MouthTraitRelationship;
  explanation: string;
  resolutionLaw: string;
  severity: 1 | 2 | 3 | 4 | 5;
}

export interface MouthPhenotypeQuirk {
  instanceId: string;
  quirkId: string;
  axis: MouthAxis;
  frequency: number;
  consistency: number;
  exaggeration: number;
  expectedAudibility: 'subtle' | 'intermittent' | 'clear' | 'dominant';
  takeover: MouthTakeoverCurve;
}

export interface MouthPhenotype {
  genomeId: string;
  activeTraits: MouthPhenotypeTrait[];
  suppressedTraits: MouthPhenotypeTrait[];
  activeQuirks: MouthPhenotypeQuirk[];
  interactions: MouthPhenotypeInteraction[];
  audiblePriority: string[];
  summary: string;
  warnings: string[];
}

export interface MouthBreedingResult {
  genome: MouthGenome;
  phenotype: MouthPhenotype;
  excludedParentDonorIds: string[];
  warnings: string[];
}
