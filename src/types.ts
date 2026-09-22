export interface LittleGuy {
  id: string;
  name: string;
  subtitle: string;
  rule: string;
  defaultJurisdiction: string;
  shortExplanation: string;
  accentColor: string; // Tailwind color token or hex
  glowClass: string;
  badgeLabel: string;
}

export type BoxType = 'style' | 'lyrics' | 'caption';

export interface GenerationRequest {
  guyIds: string[];
  seed?: string;
  energy: number; // 1 to 5
}

export interface GenerationResponse {
  style: string;
  lyrics: string;
  caption: string;
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
}

export interface SavedStack {
  id: string;
  name: string;
  guyIds: string[];
  createdAt: number;
}
