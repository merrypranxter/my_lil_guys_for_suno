import { RealityDimension, RealityEngine } from '../types';
import { getRealityEnginesByDimension } from './realityEngines';

export type RealityChaosLevel = 0 | 1 | 2 | 3;

export interface RealityChaosPreset {
  level: RealityChaosLevel;
  name: string;
  subtitle: string;
  targetFriction: number;
  dimensionCount: [number, number];
}

export interface RealityCollisionReport {
  score: number;
  label: 'NATURAL FIT' | 'PRODUCTIVE FRICTION' | 'HIGH FRICTION' | 'GLORIOUSLY UNREASONABLE';
  explanation: string;
  strongestPairs: Array<{ a: string; b: string; score: number; reasons: string[] }>;
}

export const REALITY_CHAOS_PRESETS: RealityChaosPreset[] = [
  { level: 0, name: 'COHERENT', subtitle: 'Make the pieces naturally cooperate.', targetFriction: -2, dimensionCount: [4, 6] },
  { level: 1, name: 'ODD', subtitle: 'Mostly compatible, with one useful wrong turn.', targetFriction: 1, dimensionCount: [4, 7] },
  { level: 2, name: 'FUCKED', subtitle: 'Prefer productive jurisdictional collisions.', targetFriction: 4, dimensionCount: [5, 8] },
  { level: 3, name: 'COMPLETELY UNREASONABLE', subtitle: 'Seek maximum useful contradiction without pure noise.', targetFriction: 7, dimensionCount: [6, 8] },
];

const mundane = new Set(['professional', 'corporate', 'customer-service', 'service', 'hospitality', 'bureaucracy', 'training', 'local-tv', 'ordinary', 'domestic', 'wholesome', 'clinical', 'deadpan', 'weather', 'tourism']);
const cosmic = new Set(['cosmic', 'alien', 'dmt', 'salvia', 'psychedelic', 'eternity', 'time', 'ontology', 'interdimensional', 'astral', 'void', 'entity', 'hell', 'underworld']);
const kinetic = new Set(['fast', 'frenzy', 'urgent', 'kinetic', 'manic-energy', 'overstimulated', 'hype', 'ecstatic', 'giddy']);
const restrained = new Set(['deadpan', 'clinical', 'professional', 'flat-affect', 'calm', 'elegant', 'exhausted']);
const social = new Set(['social', 'dating', 'hotline', 'customer-service', 'host', 'empathy', 'connection', 'hospitality', 'talk-show']);
const solitary = new Set(['void', 'detached', 'dissociated', 'hyperfocus', 'object', 'eternity', 'remote']);
const procedural = new Set(['bureaucracy', 'procedure', 'training', 'court', 'dmv', 'inspection', 'service', 'airport', 'customer-service', 'professional']);
const destabilizing = new Set(['confusion', 'identity', 'slippage', 'salience', 'psychosis-inspired', 'dream', 'dissociation', 'semantic', 'amnesia', 'hallucination', 'recursion', 'overload']);

const explicitSynergies: Array<[string, string, number, string]> = [
  ['headspace-bored-eternity', 'altered-salvia-object-eternity', -6, 'eternity becomes a stable comic operating condition'],
  ['headspace-source-confusion', 'altered-dmt-entity-reception', -4, 'source attribution and autonomous-seeming contact reinforce one another'],
  ['headspace-semantic-confusion', 'altered-dmt-hyperdense-reception', -4, 'language failure has a concrete semantic-pressure cause'],
  ['headspace-false-familiarity', 'altered-deliriant-familiar-simulation', -5, 'false recognition and false social presence share one mechanism'],
  ['headspace-temporal-confusion', 'altered-nitrous-revelation-loop', -3, 'temporal instability supports revelation-loss cycling'],
  ['headspace-depersonalized-distance', 'altered-ketamine-geometric-dissociation', -4, 'self-distance cleanly extends into geometric selfhood'],
  ['headspace-37-tabs-open', 'altered-psychedelic-recursion', 3, 'parallel threads plus recursive perception create useful overload'],
  ['tone-aggressively-cheerful', 'world-hell', 5, 'bright delivery collides with infernal ontology'],
  ['tone-terrified-professional', 'world-hell', -2, 'professional duty gives terror something to fight against'],
];

function tags(engine: RealityEngine): Set<string> {
  return new Set((engine.tags || []).map((tag) => tag.toLowerCase()));
}

function overlap(a: Set<string>, b: Set<string>, pool: Set<string>): number {
  let count = 0;
  pool.forEach((tag) => {
    if (a.has(tag) && b.has(tag)) count += 1;
  });
  return count;
}

function hasAny(a: Set<string>, pool: Set<string>): boolean {
  for (const tag of pool) if (a.has(tag)) return true;
  return false;
}

export function scoreRealityPair(a: RealityEngine, b: RealityEngine): { score: number; reasons: string[] } {
  if (a.id === b.id) return { score: 0, reasons: [] };
  const at = tags(a);
  const bt = tags(b);
  let score = 0;
  const reasons: string[] = [];

  const shared = [...at].filter((tag) => bt.has(tag));
  if (shared.length) {
    score -= Math.min(3, shared.length);
    reasons.push('shared logic: ' + shared.slice(0, 3).join(', '));
  }

  const contrasts: Array<[Set<string>, Set<string>, string]> = [
    [mundane, cosmic, 'mundane machinery collides with cosmic ontology'],
    [kinetic, restrained, 'performance velocity fights restraint'],
    [social, solitary, 'social obligation fights isolation'],
    [procedural, destabilizing, 'procedure must survive destabilized cognition'],
  ];

  contrasts.forEach(([left, right, reason]) => {
    if ((hasAny(at, left) && hasAny(bt, right)) || (hasAny(bt, left) && hasAny(at, right))) {
      score += 3;
      reasons.push(reason);
    }
  });

  const dimensionPairs = new Set([a.dimension + ':' + b.dimension, b.dimension + ':' + a.dimension]);
  if (dimensionPairs.has('world:venue')) score -= 1;
  if (dimensionPairs.has('format:role')) score -= 1;
  if (dimensionPairs.has('headspace:alteredState')) score += 1;
  if (dimensionPairs.has('tone:world')) score += 1;

  explicitSynergies.forEach(([x, y, delta, reason]) => {
    if ((a.id === x && b.id === y) || (a.id === y && b.id === x)) {
      score += delta;
      reasons.push(reason);
    }
  });

  return { score, reasons };
}

export function analyzeRealityCollision(engines: RealityEngine[]): RealityCollisionReport {
  const pairs: RealityCollisionReport['strongestPairs'] = [];
  let score = 0;

  for (let i = 0; i < engines.length; i += 1) {
    for (let j = i + 1; j < engines.length; j += 1) {
      const result = scoreRealityPair(engines[i], engines[j]);
      score += result.score;
      if (result.reasons.length) {
        pairs.push({ a: engines[i].name, b: engines[j].name, score: result.score, reasons: result.reasons });
      }
    }
  }

  const normalized = engines.length > 1 ? Math.round((score / Math.max(1, engines.length - 1)) * 10) / 10 : 0;
  const label =
    normalized <= 0 ? 'NATURAL FIT'
      : normalized <= 2.5 ? 'PRODUCTIVE FRICTION'
        : normalized <= 5 ? 'HIGH FRICTION'
          : 'GLORIOUSLY UNREASONABLE';

  const strongestPairs = pairs
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
    .slice(0, 3);

  const explanation =
    label === 'NATURAL FIT'
      ? 'These engines share enough logic to cooperate without much mediation.'
      : label === 'PRODUCTIVE FRICTION'
        ? 'The stack contains useful disagreement: separate jurisdictions can negotiate without collapsing.'
        : label === 'HIGH FRICTION'
          ? 'Several layers want incompatible things. That conflict should become structure, not get blended away.'
          : 'This stack is intentionally unreasonable. Preserve each jurisdiction and make the contradictions negotiate onstage.';

  return { score: normalized, label, explanation, strongestPairs };
}

function choose<T>(items: T[]): T | undefined {
  if (!items.length) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

function candidateStackScore(stack: RealityEngine[], targetFriction: number): number {
  const report = analyzeRealityCollision(stack);
  return Math.abs(report.score - targetFriction);
}

export function generateRealityStack(
  dimensions: RealityDimension[],
  locked: RealityEngine[],
  chaos: RealityChaosLevel,
): RealityEngine[] {
  const preset = REALITY_CHAOS_PRESETS.find((item) => item.level === chaos) || REALITY_CHAOS_PRESETS[1];
  const lockedDimensions = new Set(locked.map((engine) => engine.dimension));
  const availableDimensions = dimensions.filter((dimension) => !lockedDimensions.has(dimension));
  const minCount = Math.max(locked.length, preset.dimensionCount[0]);
  const maxCount = Math.max(minCount, preset.dimensionCount[1]);
  const targetCount = Math.min(dimensions.length, minCount + Math.floor(Math.random() * (maxCount - minCount + 1)));
  const shuffledDimensions = [...availableDimensions].sort(() => Math.random() - 0.5);
  const selectedDimensions = shuffledDimensions.slice(0, Math.max(0, targetCount - locked.length));

  let stack = [...locked];

  selectedDimensions.forEach((dimension) => {
    const candidates = getRealityEnginesByDimension(dimension);
    if (!candidates.length) return;

    const sampled: RealityEngine[] = [];
    const sampleSize = Math.min(candidates.length, chaos >= 2 ? 18 : 12);
    while (sampled.length < sampleSize) {
      const pick = choose(candidates);
      if (pick && !sampled.some((item) => item.id === pick.id)) sampled.push(pick);
    }

    const ranked = sampled
      .map((candidate) => ({
        candidate,
        distance: candidateStackScore([...stack, candidate], preset.targetFriction),
      }))
      .sort((a, b) => a.distance - b.distance);

    const choiceWindow = chaos === 0 ? 2 : chaos === 1 ? 3 : 5;
    const pick = choose(ranked.slice(0, Math.min(choiceWindow, ranked.length)));
    if (pick) stack.push(pick.candidate);
  });

  return stack;
}
