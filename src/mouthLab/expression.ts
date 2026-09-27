import type { MouthGenome, MouthTraitPressure } from './types';
import { getMouthTrait } from './traits';
import { clampMouthControl, MOUTH_PRESSURE_RANK } from './determinism';
import { reidentifyMouthGenome } from './quirks';

export type MouthMusicalExpressionBand =
  | 'articulation'
  | 'phrasing'
  | 'melody'
  | 'orchestration'
  | 'wholeOrganism';

export interface MouthMusicalExpressionCompile {
  level: number;
  band: MouthMusicalExpressionBand;
  label: string;
  styleDirectives: string;
  lyricsDirectives: string;
}

export const MOUTH_EXPRESSION_BANDS: Array<{
  min: number;
  max: number;
  band: MouthMusicalExpressionBand;
  label: string;
  help: string;
}> = [
  {
    min: 0,
    max: 19,
    band: 'articulation',
    label: 'MOUTH ONLY',
    help: 'Language genetics stay inside pronunciation and vocal articulation.',
  },
  {
    min: 20,
    max: 39,
    band: 'phrasing',
    label: 'PHRASING / RHYTHM',
    help: 'Syllables, attacks, stress, and vowel duration may reshape vocal phrasing and rhythmic accents.',
  },
  {
    min: 40,
    max: 59,
    band: 'melody',
    label: 'MELODY / RHYTHM',
    help: 'Mouth behavior may constrain melodic contour, note length, rhythmic subdivision, and accent patterns.',
  },
  {
    min: 60,
    max: 79,
    band: 'orchestration',
    label: 'HARMONY / INSTRUMENTS',
    help: 'Mouth genetics may alter harmony, timbre, instrumentation, register, and stem roles through explicit mappings.',
  },
  {
    min: 80,
    max: 100,
    band: 'wholeOrganism',
    label: 'WHOLE MUSICAL ORGANISM',
    help: 'Language events may trigger section changes, orchestration, stem recruitment, breakdowns, and form.',
  },
];

export function normalizeMouthMusicalExpression(value: unknown): number {
  return clampMouthControl(Number(value), 0);
}

export function mouthMusicalExpressionBand(level: number) {
  const normalized = normalizeMouthMusicalExpression(level);
  return (
    MOUTH_EXPRESSION_BANDS.find((item) => normalized >= item.min && normalized <= item.max) ||
    MOUTH_EXPRESSION_BANDS[0]
  );
}

export function withMouthMusicalExpression(genome: MouthGenome, level: number): MouthGenome {
  return reidentifyMouthGenome({
    ...genome,
    musicalExpression: normalizeMouthMusicalExpression(level),
    createdAt: Date.now(),
  });
}

function pressureRank(pressure: MouthTraitPressure): number {
  return MOUTH_PRESSURE_RANK[pressure] || 2;
}

function activeTraits(genome: MouthGenome) {
  return genome.assignments
    .flatMap((assignment) =>
      assignment.traitIds.map((traitId) => ({
        traitId,
        pressure: assignment.pressure,
        trait: getMouthTrait(traitId),
      })),
    )
    .filter((row) => Boolean(row.trait))
    .sort(
      (a, b) =>
        pressureRank(b.pressure) - pressureRank(a.pressure) ||
        a.traitId.localeCompare(b.traitId),
    );
}

function traitBridgeLines(genome: MouthGenome, maxTraits: number): string[] {
  return activeTraits(genome)
    .slice(0, maxTraits)
    .map((row, index) => {
      const affordances = row.trait?.musicalAffordances || [];
      const affordance = affordances[index % Math.max(1, affordances.length)] || row.trait?.shortExplanation || '';
      return (
        row.trait!.name +
        ' → ' +
        affordance +
        '. Keep this mapping stable enough to be recognized when the trait recurs.'
      );
    });
}

export function compileMouthMusicalExpression(genome: MouthGenome): MouthMusicalExpressionCompile {
  const level = normalizeMouthMusicalExpression(genome.musicalExpression);
  const meta = mouthMusicalExpressionBand(level);
  const style: string[] = [
    '[MOUTH EXPRESSION: ' + level + '/100 — ' + meta.label + ']',
  ];
  const lyrics: string[] = [
    '[MOUTH EXPRESSION LEVEL: ' + level + '/100 — ' + meta.label + ']',
  ];

  if (level < 20) {
    const boundary =
      'Keep Mouth Lab causality inside vocal articulation. Do not make harmony, instrumentation, or form obey mouth genetics unless an explicit hand-authored transduction says so.';
    style.push('[MOUTH EXPRESSION BOUNDARY: ' + boundary + ']');
    lyrics.push('[MOUTH EXPRESSION BOUNDARY: ' + boundary + ']');
  }

  if (level >= 20) {
    style.push(
      '[PHRASING BRIDGE: syllable density, stress, consonant attacks, and vowel duration may change phrase length, accent placement, breath spacing, and local rhythmic emphasis.]',
    );
    lyrics.push(
      '[LANGUAGE → PHRASING/RHYTHM: recurring mouth events must create repeatable changes in phrase length, accent placement, breath spacing, or local subdivision.]',
    );
    for (const line of traitBridgeLines(genome, 2)) {
      lyrics.push('[TRAIT → RHYTHM: ' + line + ']');
    }
  }

  if (level >= 40) {
    style.push(
      '[MELODIC BRIDGE: tone, prosody, vowel duration, and syllable weight may constrain melodic contour, note duration, repetition, and rhythmic subdivision.]',
    );
    lyrics.push(
      '[LANGUAGE → MELODY: map eligible tone/prosody/duration events into melodic contour or note-length consequences; preserve the mapping instead of improvising a new one each time.]',
    );
    for (const line of traitBridgeLines(genome, 3)) {
      lyrics.push('[TRAIT → MELODY: ' + line + ']');
    }
  }

  if (level >= 60) {
    style.push(
      '[ORCHESTRATION BRIDGE: vowel resonance, phonation, consonant attack, morphology, and prosodic boundaries may choose timbre, register, harmonic function, stem role, or instrument entry through explicit causal mappings.]',
    );
    lyrics.push(
      '[LANGUAGE → HARMONY / INSTRUMENTS: define stable mappings from recurring mouth classes to timbre, register, harmony, or instrument/stem behavior. Do not convert this into generic synesthetic adjectives.]',
    );
    for (const line of traitBridgeLines(genome, 4)) {
      lyrics.push('[TRAIT → ORCHESTRATION: ' + line + ']');
    }
  }

  if (level >= 80) {
    style.push(
      '[WHOLE-ORGANISM BRIDGE: threshold mouth events may trigger section changes, stem recruitment, breakdowns, harmonic resets, density changes, or formal mutations while the anchor remains recognizable.]',
    );
    lyrics.push(
      '[LANGUAGE → FORM: define explicit threshold events. A repeated phonological/morphological event may open or close sections, recruit or remove stems, alter density, or mutate the arrangement; consequences persist until another valid event changes state.]',
    );
  }

  if (genome.dynamics?.transductions.length) {
    const precedence =
      'Explicit Dynamic Mouth transductions outrank this automatic Mouth Expression bridge wherever the two specify different mappings.';
    style.push('[TRANSDUCTION PRECEDENCE: ' + precedence + ']');
    lyrics.push('[TRANSDUCTION PRECEDENCE: ' + precedence + ']');
  }

  return {
    level,
    band: meta.band,
    label: meta.label,
    styleDirectives: style.join(' '),
    lyricsDirectives: lyrics.join('\n'),
  };
}
