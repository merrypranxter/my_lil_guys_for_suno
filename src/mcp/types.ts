import type { GenerationRequest, GenerationResponse } from '../types';

export type ExperimentModeId =
  | 'petri-dish'
  | 'deep-bore'
  | 'crossbreed'
  | 'novelty-hunt'
  | 'favorite-dna'
  | 'operator-stress-test'
  | 'mutation-ladder'
  | 'family-tree'
  | 'alien-invasion'
  | 'anti-merry'
  | 'bone-picker'
  | 'tournament';

export type SelectionMode = 'assistant' | 'human' | 'mixed';

export interface LabGenerationConfig
  extends Pick<
    GenerationRequest,
    | 'guyIds'
    | 'realityEngineIds'
    | 'compositionEngineIds'
    | 'energy'
    | 'realityChaos'
    | 'likedSignals'
    | 'noveltySignals'
  > {}

export interface LabRecipe {
  id: ExperimentModeId;
  name: string;
  purpose: string;
  defaultPopulation: number;
  defaultDepth: number;
  selectionPressure: string[];
  phases: string[];
  stopRule: string;
  directiveBank: string[];
}

export interface LabResult {
  id: string;
  sessionId: string;
  generation: number;
  branchIndex: number;
  parentResultIds: string[];
  directive: string;
  createdAt: number;
  response: GenerationResponse;
  starred: boolean;
  feedback: string;
  tags: string[];
}

export interface LabGeneration {
  index: number;
  createdAt: number;
  phase: string;
  directives: string[];
  parentResultIds: string[];
  resultIds: string[];
  survivorIds: string[];
  selectionReason?: string;
}

export interface LabSession {
  id: string;
  label: string;
  mode: ExperimentModeId;
  rootSeed: string;
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'completed' | 'abandoned';
  population: number;
  depth: number;
  fuckAround: number;
  selectionMode: SelectionMode;
  generationConfig: LabGenerationConfig;
  generations: LabGeneration[];
  notes: string[];
}

export interface LabNotebook {
  version: 1;
  sessions: LabSession[];
  results: LabResult[];
}

export interface LabResultSummary {
  id: string;
  generation: number;
  branchIndex: number;
  parentResultIds: string[];
  directive: string;
  starred: boolean;
  feedback: string;
  tags: string[];
  model?: string;
  style: string;
  caption: string;
  lyricsPreview: string;
  fingerprint?: GenerationResponse['fingerprint'];
  error?: string;
}
