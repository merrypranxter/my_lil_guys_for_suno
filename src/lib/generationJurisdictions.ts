export interface SeedSovereigntyContract {
  rawSeed: string;
  literalAnchors: string[];
  hasSeed: boolean;
}

const SEED_STOPWORDS = new Set([
  'about','above','after','again','against','along','also','another','because','before','being','between',
  'could','does','doing','from','have','into','just','like','more','most','only','over','same','some','such',
  'than','that','their','them','then','there','these','they','this','through','under','very','what','when',
  'where','which','while','with','would','your','youre','were','been','will','shall','should','song','music',
  'make','using','use','want','wants','please','thing','stuff','shit'
]);

function normalizeToken(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9'’-]+/g, '').replace(/[’]/g, "'");
}

export function extractSeedAnchors(seed: string, maxAnchors = 8): string[] {
  const trimmed = seed.trim();
  if (!trimmed) return [];

  const quoted = Array.from(trimmed.matchAll(/["“”']([^"“”']{2,80})["“”']/g))
    .map((match) => match[1].trim().toLowerCase())
    .filter(Boolean);

  const words = trimmed
    .split(/\s+/)
    .map(normalizeToken)
    .filter((token) => token.length >= 4 && !SEED_STOPWORDS.has(token));

  const anchors = Array.from(new Set([...quoted, ...words]));
  return anchors.slice(0, Math.max(1, maxAnchors));
}

export function buildSeedSovereigntyContract(seed?: string): SeedSovereigntyContract {
  const rawSeed = (seed || '').trim();
  return {
    rawSeed,
    literalAnchors: extractSeedAnchors(rawSeed),
    hasSeed: Boolean(rawSeed),
  };
}

export function renderSeedSovereigntyContract(seed?: string): string {
  const contract = buildSeedSovereigntyContract(seed);
  if (!contract.hasSeed) {
    return [
      'NO EXPLICIT SEED PROVIDED.',
      'Subject matter may emerge from the LEAD mind, but no lower layer may pretend it came from user intent.',
    ].join('\n');
  }

  return [
    'SEED IS SOVEREIGN OVER SUBJECT MATTER.',
    'Protected seed, verbatim: "' + contract.rawSeed + '"',
    'Literal anchors worth preserving when natural: ' + (contract.literalAnchors.length ? contract.literalAnchors.join(' | ') : 'none extracted'),
    'Rules:',
    '- The seed owns WHAT the song is about, explicit named objects/people/places/concepts, and literal requested actions or attitudes.',
    '- Reality may stage, embody, narrate, or distort the seed, but may not replace the seed with a more convenient scenario.',
    '- Little Guys may transform causal logic, identity, memory, measurement, constraints, attention, or other cognitive relations AROUND the seed; they do not get to substitute their favorite topic.',
    '- Composition may change HOW the seed is sung, timed, arranged, transmitted, tuned, spatialized, damaged, or structurally organized; it does not own semantic subject matter.',
    '- Mouth Lab may change pronunciation, phonotactics, timing, tone, phonation, morphology pressure, and other explicitly assigned vocal mechanics; it does not get to replace the seed subject.',
    '- Music genomes may inherit musical mechanisms only. Genome names, parent names, and lineage lore are provenance, never lyric subject matter.',
    '- Formatting/count repair may shorten or expand wording without introducing a new concept, scenario, genre, character, or mechanism.',
  ].join('\n');
}

export function renderLayerJurisdictionMatrix(): string {
  return [
    'GENERATION AUTHORITY MATRIX — OWNERSHIP IS BY JURISDICTION, NOT BY LOUDEST PROMPT BLOCK:',
    '[SEED] owns subject, explicit semantic payload, named literals, requested attitude/action.',
    '[REALITY] owns stage, speaker role, world assumptions, species/body frame, venue, headspace, altered perception, delivery tone.',
    '[MINDS] own cognitive transformations and causal/logical operations applied to the seed inside the active reality.',
    '[COMPOSITION] owns sound, voice topology, timing, pitch, rhythm, signal path, source assignment, chronology of musical events, structural control, and other explicitly selected musical mechanics.',
    '[MOUTH LAB] owns only the explicitly assigned vocal-genetics axes: consonants, vowels, phonotactics, syllable structure, airflow, larynx, phonation, tone, stress, prosody, timing, morphology pressure, and bounded quirks. It does not own song subject or cultural identity.',
    '[GENOME / MUSIC SEED] owns inherited musical tendencies and mechanisms only; it fills musical defaults but may not colonize subject matter or scenario.',
    '[FORMATTER] owns JSON shape and character-count compliance only.',
    '',
    'COLLISION PRECEDENCE:',
    '- Explicit current user seed beats inherited semantic drift.',
    '- Explicit current Reality selection beats scenario accidentally implied by a Mind or Genome.',
    '- Explicit current Composition selection beats conflicting inherited musical defaults.',
    '- On a mouth axis explicitly assigned by Mouth Lab, the Mouth Lab genome beats conflicting generic/single-profile pronunciation guidance; Composition language rules may fill only unclaimed vocal axes.',
    '- Semantic seed ownership always beats Mouth Lab deformation: mouth mechanics may distort HOW words are realized without silently changing WHAT the user asked the song to mean.',
    '- A Genome may reinforce an explicitly selected Composition mechanism, but may not override it by repetition or ancestry.',
    '- Minds may create pressure at jurisdiction seams, but a seam is not permission to seize the neighboring layer.',
    '- When two layers conflict, preserve both by translating the conflict across the boundary instead of averaging them into generic weirdness.',
  ].join('\n');
}

export interface SeedCoverageReport {
  anchors: string[];
  matched: string[];
  missing: string[];
  coverage: number;
}

export function evaluateLiteralSeedCoverage(seed: string | undefined, texts: string[]): SeedCoverageReport {
  const anchors = extractSeedAnchors(seed || '');
  if (!anchors.length) return { anchors: [], matched: [], missing: [], coverage: 1 };

  const haystack = texts.join('\n').toLowerCase();
  const matched = anchors.filter((anchor) => haystack.includes(anchor));
  const missing = anchors.filter((anchor) => !matched.includes(anchor));

  return {
    anchors,
    matched,
    missing,
    coverage: matched.length / anchors.length,
  };
}
