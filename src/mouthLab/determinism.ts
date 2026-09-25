import { MouthTraitPressure } from './types';

export function hashMouthString(input: string): number {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function makeMouthRng(seedText: string): () => number {
  let state = hashMouthString(seedText) || 0x9e3779b9;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clampMouthControl(value: number | undefined, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export const MOUTH_PRESSURE_RANK: Record<MouthTraitPressure, number> = {
  low: 1,
  medium: 2,
  high: 3,
  obsessive: 4,
};

export function pressureFromRank(rank: number): MouthTraitPressure {
  if (rank >= 4) return 'obsessive';
  if (rank >= 3) return 'high';
  if (rank >= 2) return 'medium';
  return 'low';
}

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return '[' + value.map((item) => stableStringify(item)).join(',') + ']';
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return (
      '{' +
      Object.keys(record)
        .sort()
        .map((key) => JSON.stringify(key) + ':' + stableStringify(record[key]))
        .join(',') +
      '}'
    );
  }

  return JSON.stringify(value);
}
