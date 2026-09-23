import { RealityDimension, RealityEngine } from '../types';
import { REALITY_ENGINES, getRealityEngine, getRealityEngines, getRealityEnginesByDimension } from '../data/realityEngines';

export type RealityChaosLevel = 1 | 2 | 3 | 4;

export interface RealityChemistryPair {
  aId: string;
  bId: string;
  affinity: number;
  friction: number;
  reasons: string[];
}

export interface RealityChemistryReport {
  affinity: number;
  friction: number;
  productiveTension: number;
  label: string;
  summary: string;
  narrator: string;
  pairNotes: string[];
  directives: string[];
}

const DIMENSION_ORDER: RealityDimension[] = [
  'format',
  'role',
  'world',
  'species',
  'venue',
  'headspace',
  'alteredState',
  'tone',
];

const NATURAL_DIMENSION_PAIRS = new Set([
  'format|role',
  'role|venue',
  'world|venue',
  'world|species',
  'species|venue',
  'headspace|tone',
  'headspace|alteredState',
  'format|tone',
]);

const FRICTION_DIMENSION_PAIRS = new Set([
  'format|alteredState',
  'role|headspace',
  'role|alteredState',
  'venue|alteredState',
  'species|headspace',
]);

const FRICTION_TAG_PAIRS: Array<[string, string]> = [
  ['professional', 'trashy'],
  ['formal', 'trashy'],
  ['elegant', 'goblin'],
  ['wholesome', 'hell'],
  ['clinical', 'ecstatic'],
  ['clinical', 'giddy'],
  ['calm', 'frenzy'],
  ['calm', 'panic'],
  ['corporate', 'carnival'],
  ['bureaucracy', 'ecstatic'],
  ['service', 'panic'],
  ['workout', 'dissociation'],
  ['game-show', 'dissociation'],
  ['hospitality', 'paranoia'],
  ['restaurant', 'identity'],
  ['training', 'semantic'],
  ['museum', 'amnesia'],
  ['weather', 'salience'],
];

const STRONG_AFFINITY_PAIRS: Record<string, number> = {
  'format-workout-vhs|role-workout-instructor': 28,
  'format-weather-forecast|role-meteorologist': 28,
  'format-menu-specials|role-maitre-d': 28,
  'format-circus-program|role-ringmaster': 28,
  'format-carnival-barker-spiel|role-carnival-barker': 28,
  'format-customer-support-call|role-customer-support-rep': 28,
  'format-late-night-psychic-ad|role-bad-psychic': 26,
  'format-airport-announcement|role-gate-announcer': 26,
  'format-flight-safety|role-flight-attendant': 26,
  'format-museum-audio-guide|role-museum-docent': 26,
  'format-telethon|role-telethon-host': 26,
  'format-morning-zoo-radio|role-morning-zoo-dj': 26,
  'format-home-shopping|role-home-shopping-host': 26,
  'format-infomercial|role-infomercial-pitcher': 26,
  'world-hell|venue-hell-airport': 24,
  'world-hell|venue-hell-gym': 24,
  'world-hell|venue-hell-call-center': 24,
  'world-saturn|venue-saturn-fitness-resort': 24,
  'world-alien-civilization|venue-alien-mall': 22,
  'world-alien-civilization|venue-alien-airport': 22,
  'world-cryptid-national-park|venue-bigfoot-ranger-station': 22,
  'species-mothman|venue-mothman-omen-center': 22,
  'species-bigfoot|venue-bigfoot-ranger-station': 22,
  'species-goblin|venue-goblin-flea-market': 22,
  'species-vampire|venue-vampire-supper-club': 22,
  'species-dragon|venue-dragon-airport-lounge': 22,
  'species-witch|venue-witch-farmers-market': 22,
  'altered-salvia-object-eternity|headspace-bored-eternity': 30,
  'altered-deliriant-false-ordinary|headspace-false-familiarity': 26,
  'altered-nitrous-revelation-loop|headspace-certainty-inflation': 18,
  'altered-dxm-body-remoteness|headspace-dissociated-detachment': 24,
};

const STRONG_FRICTION_PAIRS: Record<string, number> = {
  'tone-wholesome|world-hell': 26,
  'tone-elegant|species-goblin': 22,
  'tone-hyper-professional|headspace-manic-velocity': 25,
  'tone-ominously-calm|headspace-frenzy': 25,
  'tone-aggressively-cheerful|headspace-panic-under-function': 26,
  'format-workout-vhs|altered-k-hole-backend': 30,
  'format-workout-vhs|altered-dxm-body-remoteness': 24,
  'format-weather-forecast|altered-salvia-object-eternity': 25,
  'format-menu-specials|altered-salvia-object-eternity': 24,
  'format-customer-support-call|altered-deliriant-false-ordinary': 26,
  'role-maitre-d|headspace-temporal-confusion': 22,
  'role-meteorologist|headspace-aberrant-salience': 22,
  'role-corporate-trainer|headspace-semantic-confusion': 24,
  'role-game-show-host|headspace-dissociated-detachment': 20,
  'species-robot-bureaucrat|headspace-ecstatic-joy': 22,
};

function orderedPairKey(a: string, b: string): string {
  return a < b ? a + '|' + b : b + '|' + a;
}

function dimensionPairKey(a: RealityDimension, b: RealityDimension): string {
  return a < b ? a + '|' + b : b + '|' + a;
}

function tagSet(engine: RealityEngine): Set<string> {
  return new Set((engine.tags || []).map((tag) => tag.toLowerCase()));
}

function overlapCount(a: Set<string>, b: Set<string>): number {
  let count = 0;
  a.forEach((tag) => {
    if (b.has(tag)) count += 1;
  });
  return count;
}

function hasCrossTagFriction(a: Set<string>, b: Set<string>): string[] {
  const reasons: string[] = [];
  for (const [left, right] of FRICTION_TAG_PAIRS) {
    if ((a.has(left) && b.has(right)) || (a.has(right) && b.has(left))) {
      reasons.push(left.toUpperCase() + ' ↔ ' + right.toUpperCase());
    }
  }
  return reasons;
}

export function analyzeRealityPair(a: RealityEngine, b: RealityEngine): RealityChemistryPair {
  const aTags = tagSet(a);
  const bTags = tagSet(b);
  const shared = overlapCount(aTags, bTags);
  const dimKey = dimensionPairKey(a.dimension, b.dimension);
  const idKey = orderedPairKey(a.id, b.id);
  const frictionTags = hasCrossTagFriction(aTags, bTags);

  let affinity = Math.min(28, shared * 6);
  let friction = 0;
  const reasons: string[] = [];

  if (shared > 0) reasons.push(shared + ' shared tag' + (shared === 1 ? '' : 's'));
  if (NATURAL_DIMENSION_PAIRS.has(dimKey)) {
    affinity += 7;
    reasons.push('complementary jurisdictions');
  }
  if (FRICTION_DIMENSION_PAIRS.has(dimKey)) {
    friction += 7;
    reasons.push('jurisdictional collision');
  }

  const strongAffinity = STRONG_AFFINITY_PAIRS[idKey] || 0;
  const strongFriction = STRONG_FRICTION_PAIRS[idKey] || 0;
  if (strongAffinity) {
    affinity += strongAffinity;
    reasons.push('curated affinity');
  }
  if (strongFriction) {
    friction += strongFriction;
    reasons.push('curated productive conflict');
  }

  if (frictionTags.length) {
    friction += frictionTags.length * 9;
    reasons.push(...frictionTags);
  }

  // Different jurisdictions with little semantic overlap are useful rather than neutral:
  // they force the combiner to negotiate instead of merely repeating one theme.
  if (a.dimension !== b.dimension && shared === 0) {
    friction += 3;
  }

  return {
    aId: a.id,
    bId: b.id,
    affinity: Math.min(100, affinity),
    friction: Math.min(100, friction),
    reasons,
  };
}

function articleName(engine?: RealityEngine): string {
  if (!engine) return '';
  return engine.name.toLowerCase();
}

export function describeRealityConfiguration(ids: string[]): string {
  const engines = getRealityEngines(ids);
  const byDimension = new Map<RealityDimension, RealityEngine>();
  engines.forEach((engine) => byDimension.set(engine.dimension, engine));

  const format = byDimension.get('format');
  const role = byDimension.get('role');
  const world = byDimension.get('world');
  const species = byDimension.get('species');
  const venue = byDimension.get('venue');
  const headspace = byDimension.get('headspace');
  const altered = byDimension.get('alteredState');
  const tone = byDimension.get('tone');

  if (!engines.length) return 'No temporary reality assembled yet.';

  const subjectParts: string[] = [];
  if (tone) subjectParts.push(articleName(tone));
  if (headspace) subjectParts.push(articleName(headspace));
  if (species) subjectParts.push(articleName(species));
  if (role) subjectParts.push(articleName(role));

  const clauses: string[] = [];
  if (format) clauses.push('performing a ' + articleName(format));
  if (venue) clauses.push('inside ' + articleName(venue));
  else if (world) clauses.push('in ' + articleName(world));
  if (world && venue) clauses.push('under the rules of ' + articleName(world));
  if (altered) clauses.push('while governed by ' + articleName(altered));

  const subject = subjectParts.length ? subjectParts.join(' ') : 'temporary consciousness';
  return (subject.charAt(0).toUpperCase() + subject.slice(1)) + (clauses.length ? ' is ' + clauses.join(', ') : '') + '.';
}

export function analyzeRealityChemistry(ids: string[]): RealityChemistryReport {
  const engines = getRealityEngines(ids);
  if (engines.length < 2) {
    return {
      affinity: engines.length ? 55 : 0,
      friction: 0,
      productiveTension: engines.length ? 18 : 0,
      label: engines.length ? 'SINGLE ENGINE' : 'EMPTY',
      summary: engines.length ? 'One reality law is active; there is not enough material for cross-layer chemistry yet.' : 'No Reality Engines selected.',
      narrator: describeRealityConfiguration(ids),
      pairNotes: [],
      directives: engines.length ? ['Let the active engine do visible operational work rather than decorative vocabulary.'] : [],
    };
  }

  const pairs: RealityChemistryPair[] = [];
  for (let i = 0; i < engines.length; i += 1) {
    for (let j = i + 1; j < engines.length; j += 1) {
      pairs.push(analyzeRealityPair(engines[i], engines[j]));
    }
  }

  const affinityRaw = pairs.reduce((sum, pair) => sum + pair.affinity, 0) / Math.max(1, pairs.length);
  const frictionRaw = pairs.reduce((sum, pair) => sum + pair.friction, 0) / Math.max(1, pairs.length);
  const coverage = new Set(engines.map((engine) => engine.dimension)).size;
  const affinity = Math.round(Math.min(100, affinityRaw * 2.3 + coverage * 3));
  const friction = Math.round(Math.min(100, frictionRaw * 3 + Math.max(0, coverage - 3) * 2));
  const productiveTension = Math.round(Math.min(100, affinity * 0.48 + friction * 0.72));

  let label = 'NEGOTIATED ODDITY';
  if (friction < 20 && affinity >= 55) label = 'COHERENT MACHINE';
  else if (friction < 38) label = 'ODD BUT STABLE';
  else if (friction < 63) label = 'PRODUCTIVE COLLISION';
  else if (friction < 82) label = 'FERAL NEGOTIATION';
  else label = 'UNREASONABLE BUT LEGAL';

  const strongest = [...pairs]
    .sort((a, b) => (b.friction + b.affinity * 0.45) - (a.friction + a.affinity * 0.45))
    .slice(0, 4);

  const pairNotes = strongest.map((pair) => {
    const a = getRealityEngine(pair.aId);
    const b = getRealityEngine(pair.bId);
    const reason = pair.reasons.length ? ' — ' + pair.reasons.slice(0, 2).join(', ') : '';
    return (a?.name || pair.aId) + ' × ' + (b?.name || pair.bId) + ': affinity ' + pair.affinity + ', friction ' + pair.friction + reason;
  });

  const directives: string[] = [
    'Preserve each selected jurisdiction. Never solve a collision by averaging both engines into generic surrealism.',
    'Use the strongest friction seam as an event generator: one layer creates a problem and another must solve it using only its own procedures.',
  ];

  const byDimension = new Map<RealityDimension, RealityEngine>();
  engines.forEach((engine) => byDimension.set(engine.dimension, engine));
  if (byDimension.has('format') && byDimension.has('alteredState')) {
    directives.push('FORMAT must remain structurally legible while ALTERED STATE corrupts identity, time, embodiment, perception, or reality-testing inside that structure.');
  }
  if (byDimension.has('role') && byDimension.has('headspace')) {
    directives.push('ROLE keeps job obligations alive while HEADSPACE changes what gets noticed, remembered, prioritized, interrupted, or emotionally weighted.');
  }
  if (byDimension.has('world') && byDimension.has('venue')) {
    directives.push('WORLD defines what is normal globally; VENUE supplies immediate objects, procedures, bottlenecks, and local hazards.');
  }
  if (byDimension.has('species')) {
    directives.push('SPECIES must change embodiment or sensory assumptions; do not use species as costume vocabulary.');
  }
  if (byDimension.has('tone')) {
    directives.push('TONE changes delivery only. It may contradict events, but it cannot erase procedural or phenomenological mechanics.');
  }

  return {
    affinity,
    friction,
    productiveTension,
    label,
    summary: label + ' — affinity ' + affinity + '/100, friction ' + friction + '/100, productive tension ' + productiveTension + '/100.',
    narrator: describeRealityConfiguration(ids),
    pairNotes,
    directives,
  };
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededRandom(seed: string): () => number {
  let state = hashString(seed || 'reality-engine');
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function scoreCandidate(candidate: RealityEngine, selected: RealityEngine[], chaos: RealityChaosLevel, randomNoise: number): number {
  if (!selected.length) return 20 + randomNoise * 20;
  const pairScores = selected.map((other) => analyzeRealityPair(candidate, other));
  const affinity = pairScores.reduce((sum, pair) => sum + pair.affinity, 0) / pairScores.length;
  const friction = pairScores.reduce((sum, pair) => sum + pair.friction, 0) / pairScores.length;
  const sameTagNovelty = selected.some((other) => overlapCount(tagSet(candidate), tagSet(other)) > 0) ? 0 : 8;

  if (chaos === 1) return affinity * 1.4 - friction * 1.1 + randomNoise * 12;
  if (chaos === 2) return affinity * 1.0 + friction * 0.55 + sameTagNovelty + randomNoise * 16;
  if (chaos === 3) return affinity * 0.65 + friction * 1.15 + sameTagNovelty * 1.2 + randomNoise * 20;
  return affinity * 0.15 + friction * 1.75 + sameTagNovelty * 1.6 + randomNoise * 28;
}

export function chooseSmartRealityEngine(
  dimension: RealityDimension,
  selectedIds: string[],
  chaos: RealityChaosLevel,
  rng: () => number = Math.random,
): RealityEngine | undefined {
  const selected = getRealityEngines(selectedIds).filter((engine) => engine.dimension !== dimension);
  const candidates = getRealityEnginesByDimension(dimension);
  if (!candidates.length) return undefined;

  const ranked = candidates
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(candidate, selected, chaos, rng()),
    }))
    .sort((a, b) => b.score - a.score);

  // Pick from a small elite pool so repeated rolls remain surprising instead of deterministic.
  const poolSize = chaos === 1 ? Math.min(4, ranked.length) : chaos === 2 ? Math.min(6, ranked.length) : Math.min(9, ranked.length);
  const pool = ranked.slice(0, poolSize);
  return pool[Math.floor(rng() * pool.length)]?.candidate || ranked[0]?.candidate;
}

export function buildSmartRealitySet(params: {
  currentIds?: string[];
  lockedDimensions?: RealityDimension[];
  chaos?: RealityChaosLevel;
  dimensions?: RealityDimension[];
  count?: number;
  seed?: string;
}): string[] {
  const {
    currentIds = [],
    lockedDimensions = [],
    chaos = 2,
    dimensions = DIMENSION_ORDER,
    count,
    seed = String(Date.now()),
  } = params;

  const rng = seededRandom(seed);
  const locked = new Set(lockedDimensions);
  const targetDimensions = dimensions.filter((dimension) => !locked.has(dimension));
  const shuffled = [...targetDimensions].sort(() => rng() - 0.5);
  const wanted = typeof count === 'number' ? Math.max(0, Math.min(count, shuffled.length)) : shuffled.length;
  const selectedDims = new Set(shuffled.slice(0, wanted));

  let next = currentIds.filter((id) => {
    const dim = getRealityEngine(id)?.dimension;
    return dim ? locked.has(dim) : false;
  });

  for (const dimension of DIMENSION_ORDER) {
    if (!selectedDims.has(dimension)) continue;
    const pick = chooseSmartRealityEngine(dimension, next, chaos, rng);
    if (pick) next.push(pick.id);
  }

  return Array.from(new Set(next));
}

export const REALITY_CHAOS_LABELS: Record<RealityChaosLevel, { name: string; short: string }> = {
  1: { name: 'COHERENT', short: 'favor natural compatibility' },
  2: { name: 'ODD', short: 'balanced affinity + friction' },
  3: { name: 'FUCKED', short: 'seek productive contradiction' },
  4: { name: 'UNREASONABLE', short: 'maximize jurisdictional friction' },
};

export function allRealityDimensions(): RealityDimension[] {
  return [...DIMENSION_ORDER];
}

export function realityRegistrySize(): number {
  return REALITY_ENGINES.length;
}
