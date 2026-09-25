import { ArchivedRun, MusicFingerprint } from '../types';
import { compileMusicStack, getMusicMechanism } from '../data/musicSeedSystem';

export const NOVELTY_WINDOW = 8;

const RECENCY_WEIGHTS = [1, 0.9, 0.78, 0.66, 0.54, 0.42, 0.32, 0.24];

export type SaturationState = 'fresh' | 'warm' | 'saturated' | 'cooling';

export interface MechanismExposureStat {
  mechanismId: string;
  appearances: number;
  consecutive: number;
  weightedExposure: number;
  saturation: number;
  state: SaturationState;
}

export interface FingerprintExposureStat {
  field: keyof MusicFingerprint;
  value: string;
  appearances: number;
  weightedExposure: number;
  saturation: number;
  state: SaturationState;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function stateFor(saturation: number): SaturationState {
  if (saturation >= 0.72) return 'cooling';
  if (saturation >= 0.5) return 'saturated';
  if (saturation >= 0.25) return 'warm';
  return 'fresh';
}

function exposureDenominator(): number {
  return RECENCY_WEIGHTS.reduce((sum, value) => sum + value, 0);
}

export function analyzeMechanismExposure(
  runs: ArchivedRun[],
  limit = NOVELTY_WINDOW
): MechanismExposureStat[] {
  const recent = runs.slice(0, Math.max(1, Math.min(limit, NOVELTY_WINDOW)));
  const denominator = exposureDenominator();
  const seen = new Map<string, { appearances: number; weighted: number; recentFlags: boolean[] }>();

  recent.forEach((run, index) => {
    const weight = RECENCY_WEIGHTS[index] || 0;
    const ids = new Set(
      compileMusicStack(run.musicStack || [], run.musicControls).mechanisms.map((entry) => entry.mechanism.id)
    );

    for (const id of ids) {
      const current = seen.get(id) || { appearances: 0, weighted: 0, recentFlags: [] };
      current.appearances += 1;
      current.weighted += weight;
      seen.set(id, current);
    }

    for (const [id, current] of seen.entries()) {
      current.recentFlags[index] = ids.has(id);
    }
  });

  return Array.from(seen.entries())
    .map(([mechanismId, entry]) => {
      let consecutive = 0;
      for (let i = 0; i < recent.length; i += 1) {
        if (!entry.recentFlags[i]) break;
        consecutive += 1;
      }
      const base = denominator > 0 ? entry.weighted / denominator : 0;
      const consecutiveBonus = Math.min(0.2, consecutive * 0.04);
      const saturation = clamp01(base + consecutiveBonus);
      return {
        mechanismId,
        appearances: entry.appearances,
        consecutive,
        weightedExposure: Math.round(entry.weighted * 100) / 100,
        saturation: Math.round(saturation * 100) / 100,
        state: stateFor(saturation),
      };
    })
    .sort((a, b) => b.saturation - a.saturation || b.appearances - a.appearances);
}

export function mechanismSaturationMap(runs: ArchivedRun[], limit = NOVELTY_WINDOW): Record<string, number> {
  const out: Record<string, number> = {};
  for (const stat of analyzeMechanismExposure(runs, limit)) {
    out[stat.mechanismId] = stat.saturation;
  }
  return out;
}

export function applySuccessSaturation(preference: number, saturation: number): number {
  const normalizedPreference = Number.isFinite(preference) ? preference : 0;
  const normalizedSaturation = clamp01(Number.isFinite(saturation) ? saturation : 0);

  // No penalty while a trait is merely fresh/warm. Once it becomes common,
  // recency pressure grows smoothly to a maximum -0.9 selection adjustment.
  const penalty =
    normalizedSaturation <= 0.35
      ? 0
      : ((normalizedSaturation - 0.35) / 0.65) * 0.9;

  return Math.max(-1, Math.min(1, Math.round((normalizedPreference - penalty) * 100) / 100));
}

function normalizeFingerprintValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

const FINGERPRINT_FIELDS: Array<keyof MusicFingerprint> = [
  'genreFamily',
  'harmony',
  'melody',
  'rhythm',
  'timbre',
  'vocal',
  'performance',
  'production',
];

export function analyzeFingerprintExposure(
  fingerprints: MusicFingerprint[],
  limit = NOVELTY_WINDOW
): FingerprintExposureStat[] {
  const recent = fingerprints.slice(0, Math.max(1, Math.min(limit, NOVELTY_WINDOW)));
  const denominator = exposureDenominator();
  const buckets = new Map<string, { field: keyof MusicFingerprint; value: string; appearances: number; weighted: number }>();

  recent.forEach((fingerprint, index) => {
    const weight = RECENCY_WEIGHTS[index] || 0;
    for (const field of FINGERPRINT_FIELDS) {
      const value = normalizeFingerprintValue(fingerprint[field] || '');
      if (!value) continue;
      const key = field + '::' + value;
      const current = buckets.get(key) || { field, value, appearances: 0, weighted: 0 };
      current.appearances += 1;
      current.weighted += weight;
      buckets.set(key, current);
    }
  });

  return Array.from(buckets.values())
    .map((entry) => {
      const saturation = clamp01(denominator > 0 ? entry.weighted / denominator : 0);
      return {
        field: entry.field,
        value: entry.value,
        appearances: entry.appearances,
        weightedExposure: Math.round(entry.weighted * 100) / 100,
        saturation: Math.round(saturation * 100) / 100,
        state: stateFor(saturation),
      };
    })
    .sort((a, b) => b.saturation - a.saturation || b.appearances - a.appearances);
}

export function renderFingerprintNoveltyPressure(
  fingerprints: MusicFingerprint[],
  forcedFingerprint?: MusicFingerprint
): string {
  if (forcedFingerprint) {
    return [
      'SUCCESS SATURATION IS SUSPENDED FOR THIS CONTROLLED EXPERIMENT.',
      'The frozen fingerprint is experimental control and must remain unchanged even if recent-history pressure would normally cool it down.',
    ].join('\n');
  }

  const hot = analyzeFingerprintExposure(fingerprints)
    .filter((entry) => entry.state === 'saturated' || entry.state === 'cooling')
    .slice(0, 8);

  if (!hot.length) {
    return 'No fingerprint field is saturated enough to require a cooldown. Explore freely while still avoiding exact recent copies.';
  }

  return [
    'RECENT-HISTORY COOLDOWN — THESE ARE TEMPORARILY OVEREXPOSED, NOT PERMANENTLY BANNED:',
    ...hot.map((entry) =>
      '- ' + entry.field + ' = "' + entry.value + '" appeared in ' + entry.appearances +
      ' of the last ' + Math.min(fingerprints.length, NOVELTY_WINDOW) +
      ' fingerprinted runs; saturation ' + Math.round(entry.saturation * 100) + '% (' + entry.state.toUpperCase() + ').'
    ),
    'Unless the current seed or explicit current selection requires one of these values, move elsewhere. If one must remain, mutate at least two other load-bearing fingerprint dimensions rather than performing a synonym swap.',
  ].join('\n');
}

export function buildMechanismNoveltySignals(runs: ArchivedRun[], limit = 8): string[] {
  return analyzeMechanismExposure(runs, limit)
    .filter((entry) => entry.state === 'saturated' || entry.state === 'cooling')
    .slice(0, 8)
    .map((entry) => {
      const mechanism = getMusicMechanism(entry.mechanismId);
      const name = mechanism?.name || entry.mechanismId;
      return (
        'SUCCESS SATURATION — ' + name + ' [' + entry.mechanismId + '] appeared in ' +
        entry.appearances + ' of the last ' + Math.min(runs.length, limit, NOVELTY_WINDOW) +
        ' runs; pressure=' + Math.round(entry.saturation * 100) + '% ' + entry.state.toUpperCase() +
        '. It remains legal when explicitly selected, but automatic selection/reinforcement should prefer fresher traits. If it stays, change its partners and at least two surrounding musical dimensions.'
      );
    });
}
