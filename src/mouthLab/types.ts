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

export interface MouthMutationScar {
  id: string;
  sourceOperation: 'gene-knockout' | 'quirk-removal' | 'specimen-application' | 'manual';
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
  breedingSeed: string;
  quirks: MouthQuirkInstance[];
  mutationScars: MouthMutationScar[];
  linkedGeneBundles: MouthLinkedGeneBundle[];
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
