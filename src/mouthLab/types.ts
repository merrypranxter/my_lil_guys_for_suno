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

export interface MouthPhenotype {
  genomeId: string;
  activeTraits: MouthPhenotypeTrait[];
  suppressedTraits: MouthPhenotypeTrait[];
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
