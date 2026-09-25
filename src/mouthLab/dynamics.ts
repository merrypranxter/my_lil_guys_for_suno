import {
  MouthCastProfile,
  MouthCastRole,
  MouthDynamics,
  MouthExpressionRule,
  MouthExpressionState,
  MouthGenome,
  MouthMutationAction,
  MouthMutationCurve,
  MouthMutationCurveShape,
  MouthMutationEvent,
  MouthQuirkInstance,
  MouthTransductionDirection,
  MouthTransductionRule,
} from './types';
import { getMouthDonor } from './donors';
import { getMouthTrait } from './traits';
import { getMouthQuirkDefinition, reidentifyMouthGenome } from './quirks';
import { clampMouthControl, hashMouthString, stableStringify } from './determinism';

export const MOUTH_CAST_ROLES: MouthCastRole[] = [
  'lead',
  'narrator',
  'crowd',
  'smallGroup',
  'freakVoice',
  'response',
  'whisper',
  'choir',
];

export const MOUTH_EXPRESSION_STATES: MouthExpressionState[] = [
  'dominant',
  'recessive',
  'latent',
  'triggered',
];

export const MOUTH_MUTATION_CURVE_SHAPES: MouthMutationCurveShape[] = [
  'linear',
  'step',
  'exponential',
  'oscillating',
];

export const MOUTH_MUTATION_ACTIONS: MouthMutationAction[] = [
  'activateTrait',
  'suppressTrait',
  'escalateTrait',
  'activateQuirk',
  'suppressQuirk',
  'infectCast',
  'swapCastMouth',
];

export const MOUTH_TRANSDUCTION_DIRECTIONS: MouthTransductionDirection[] = [
  'languageToMusic',
  'musicToLanguage',
];

function clean(value: unknown, max = 300): string {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
    : '';
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function staticQuirk(instance: MouthQuirkInstance): MouthQuirkInstance | undefined {
  const definition = getMouthQuirkDefinition(instance?.quirkId);
  if (!definition) return undefined;
  return {
    ...instance,
    frequency: clampMouthControl(instance.frequency, definition.defaultFrequency),
    consistency: clampMouthControl(instance.consistency, definition.defaultConsistency),
    exaggeration: clampMouthControl(instance.exaggeration, definition.defaultExaggeration),
    linkedTraitIds: unique(
      (instance.linkedTraitIds || []).filter((id) => Boolean(getMouthTrait(id))),
    ).sort(),
    takeover: {
      ...instance.takeover,
      startPercent: clampMouthControl(instance.takeover?.startPercent, definition.defaultTakeover.startPercent),
      endPercent: clampMouthControl(instance.takeover?.endPercent, definition.defaultTakeover.endPercent),
    },
  };
}

export function mouthCastLabel(role: MouthCastRole): string {
  return {
    lead: 'LEAD',
    narrator: 'NARRATOR',
    crowd: 'CROWD',
    smallGroup: 'SMALL GROUP',
    freakVoice: 'FREAK VOICE',
    response: 'RESPONSE VOICE',
    whisper: 'WHISPER VOICE',
    choir: 'CHOIR',
  }[role];
}

export function createMouthCastProfile(
  role: MouthCastRole,
  genome: MouthGenome,
  label = '',
): MouthCastProfile {
  const signature = stableStringify({
    role,
    sourceGenomeId: genome.id,
    assignments: genome.assignments,
    quirks: genome.quirks.map(({ createdAt, ...item }) => item),
  });

  return {
    id: 'mouth_cast_' + hashMouthString(signature).toString(36),
    role,
    label: clean(label, 100) || mouthCastLabel(role),
    sourceGenomeId: genome.id,
    parentDonorIds: [...genome.parentDonorIds].sort(),
    assignments: genome.assignments.map((assignment) => ({
      ...assignment,
      traitIds: [...assignment.traitIds].sort(),
    })),
    quirks: genome.quirks.map((quirk) => ({
      ...quirk,
      linkedTraitIds: [...quirk.linkedTraitIds].sort(),
      takeover: { ...quirk.takeover },
    })),
    intelligibility: genome.intelligibility,
    stability: genome.stability,
    mutation: genome.mutation,
  };
}

function normalizeCastProfile(value: unknown): MouthCastProfile | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as any;
  const role = MOUTH_CAST_ROLES.includes(raw.role) ? raw.role as MouthCastRole : undefined;
  if (!role) return undefined;

  const parentDonorIds = unique<string>(
    (Array.isArray(raw.parentDonorIds) ? raw.parentDonorIds as unknown[] : [])
      .map((id: unknown) => String(id))
      .filter((id: string) => Boolean(getMouthDonor(id))),
  ).slice(0, 6);

  const assignments = (Array.isArray(raw.assignments) ? raw.assignments as unknown[] : [])
    .map((value: unknown) => {
      const assignment = value as any;
      const traitIds = unique(
        (Array.isArray(assignment?.traitIds) ? assignment.traitIds : [])
          .map((id: unknown) => String(id))
          .filter((id: string) => Boolean(getMouthTrait(id))),
      ).sort();
      if (!traitIds.length && assignment?.axis !== 'semantics') return undefined;
      return {
        axis: assignment.axis,
        donorId: assignment.donorId && getMouthDonor(String(assignment.donorId))
          ? String(assignment.donorId)
          : undefined,
        traitIds,
        pressure: ['low', 'medium', 'high', 'obsessive'].includes(assignment?.pressure)
          ? assignment.pressure
          : 'medium',
        locked: assignment?.locked === true,
      };
    })
    .filter((item): item is MouthCastProfile['assignments'][number] => Boolean(item));

  if (!assignments.length) return undefined;

  const quirks = (Array.isArray(raw.quirks) ? raw.quirks as unknown[] : [])
    .map((item: unknown) => staticQuirk(item as MouthQuirkInstance))
    .filter((item): item is MouthQuirkInstance => Boolean(item));

  const signature = stableStringify({
    role,
    sourceGenomeId: clean(raw.sourceGenomeId, 180),
    parentDonorIds,
    assignments,
    quirks: quirks.map(({ createdAt, ...item }) => item),
  });

  return {
    id: clean(raw.id, 180) || 'mouth_cast_' + hashMouthString(signature).toString(36),
    role,
    label: clean(raw.label, 100) || mouthCastLabel(role),
    sourceGenomeId: clean(raw.sourceGenomeId, 180) || undefined,
    parentDonorIds,
    assignments,
    quirks,
    intelligibility: clampMouthControl(raw.intelligibility, 82),
    stability: clampMouthControl(raw.stability, 72),
    mutation: clampMouthControl(raw.mutation, 35),
  };
}

function targetExists(targetType: 'trait' | 'quirk', targetId: string): boolean {
  return targetType === 'trait'
    ? Boolean(getMouthTrait(targetId))
    : Boolean(getMouthQuirkDefinition(targetId));
}

function normalizeExpressionRule(value: unknown): MouthExpressionRule | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as any;
  const targetType = raw.targetType === 'quirk' ? 'quirk' : raw.targetType === 'trait' ? 'trait' : undefined;
  const targetId = clean(raw.targetId, 180);
  if (!targetType || !targetId || !targetExists(targetType, targetId)) return undefined;
  const state = MOUTH_EXPRESSION_STATES.includes(raw.state) ? raw.state as MouthExpressionState : 'dominant';
  const castRole = MOUTH_CAST_ROLES.includes(raw.castRole) ? raw.castRole as MouthCastRole : undefined;

  const signature = stableStringify({
    targetType,
    targetId,
    state,
    castRole,
    trigger: clean(raw.trigger, 220),
    strength: clampMouthControl(raw.strength, 75),
  });

  return {
    id: clean(raw.id, 180) || 'mouth_expr_' + hashMouthString(signature).toString(36),
    targetType,
    targetId,
    state,
    strength: clampMouthControl(raw.strength, 75),
    trigger: clean(raw.trigger, 220) || undefined,
    castRole,
  };
}


function normalizeMutationCurve(value: unknown): MouthMutationCurve | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as any;
  const targetType = raw.targetType === 'quirk' ? 'quirk' : raw.targetType === 'trait' ? 'trait' : undefined;
  const targetId = clean(raw.targetId, 180);
  if (!targetType || !targetId || !targetExists(targetType, targetId)) return undefined;

  const shape = MOUTH_MUTATION_CURVE_SHAPES.includes(raw.shape)
    ? raw.shape as MouthMutationCurveShape
    : 'linear';
  const startPercent = clampMouthControl(raw.startPercent, 0);
  const endPercent = Math.max(startPercent, clampMouthControl(raw.endPercent, 100));
  const castRole = MOUTH_CAST_ROLES.includes(raw.castRole)
    ? raw.castRole as MouthCastRole
    : undefined;

  const signature = stableStringify({
    targetType,
    targetId,
    startPercent,
    endPercent,
    startStrength: clampMouthControl(raw.startStrength, 0),
    endStrength: clampMouthControl(raw.endStrength, 100),
    shape,
    castRole,
  });

  return {
    id: clean(raw.id, 180) || 'mouth_curve_' + hashMouthString(signature).toString(36),
    targetType,
    targetId,
    startPercent,
    endPercent,
    startStrength: clampMouthControl(raw.startStrength, 0),
    endStrength: clampMouthControl(raw.endStrength, 100),
    shape,
    castRole,
  };
}

function normalizeMutationEvent(value: unknown): MouthMutationEvent | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as any;
  const action = MOUTH_MUTATION_ACTIONS.includes(raw.action)
    ? raw.action as MouthMutationAction
    : undefined;
  if (!action) return undefined;

  const targetType = raw.targetType === 'quirk' ? 'quirk' : raw.targetType === 'trait' ? 'trait' : undefined;
  const targetId = clean(raw.targetId, 180) || undefined;
  if (targetType && targetId && !targetExists(targetType, targetId)) return undefined;

  const sourceCastRole = MOUTH_CAST_ROLES.includes(raw.sourceCastRole)
    ? raw.sourceCastRole as MouthCastRole
    : undefined;
  const targetCastRole = MOUTH_CAST_ROLES.includes(raw.targetCastRole)
    ? raw.targetCastRole as MouthCastRole
    : undefined;

  if ((action === 'infectCast' || action === 'swapCastMouth') && !targetCastRole) return undefined;

  const signature = stableStringify({
    positionPercent: clampMouthControl(raw.positionPercent, 50),
    sectionLabel: clean(raw.sectionLabel, 100),
    trigger: clean(raw.trigger, 220),
    action,
    targetType,
    targetId,
    sourceCastRole,
    targetCastRole,
    amount: clampMouthControl(raw.amount, 100),
  });

  return {
    id: clean(raw.id, 180) || 'mouth_event_' + hashMouthString(signature).toString(36),
    positionPercent: clampMouthControl(raw.positionPercent, 50),
    sectionLabel: clean(raw.sectionLabel, 100) || undefined,
    trigger: clean(raw.trigger, 220) || undefined,
    action,
    targetType,
    targetId,
    sourceCastRole,
    targetCastRole,
    amount: clampMouthControl(raw.amount, 100),
  };
}

function normalizeTransduction(value: unknown): MouthTransductionRule | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as any;
  const direction = MOUTH_TRANSDUCTION_DIRECTIONS.includes(raw.direction)
    ? raw.direction as MouthTransductionDirection
    : undefined;
  if (!direction) return undefined;

  const source = clean(raw.source, 180);
  const target = clean(raw.target, 180);
  const mapping = clean(raw.mapping, 420);
  if (!source || !target || !mapping) return undefined;

  const castRole = MOUTH_CAST_ROLES.includes(raw.castRole) ? raw.castRole as MouthCastRole : undefined;
  const signature = stableStringify({
    direction,
    source,
    target,
    mapping,
    strength: clampMouthControl(raw.strength, 70),
    castRole,
    trigger: clean(raw.trigger, 220),
  });

  return {
    id: clean(raw.id, 180) || 'mouth_transduction_' + hashMouthString(signature).toString(36),
    direction,
    source,
    target,
    mapping,
    strength: clampMouthControl(raw.strength, 70),
    castRole,
    trigger: clean(raw.trigger, 220) || undefined,
  };
}

export function emptyMouthDynamics(): MouthDynamics {
  return {
    castProfiles: [],
    expressionRules: [],
    mutationCurves: [],
    timeline: [],
    transductions: [],
  };
}

export function normalizeMouthDynamics(value: unknown): MouthDynamics {
  if (!value || typeof value !== 'object') return emptyMouthDynamics();
  const raw = value as any;

  const castProfiles = (Array.isArray(raw.castProfiles) ? raw.castProfiles as unknown[] : [])
    .map((item: unknown) => normalizeCastProfile(item))
    .filter((item: MouthCastProfile | undefined): item is MouthCastProfile => Boolean(item))
    .filter((item: MouthCastProfile, index: number, all: MouthCastProfile[]) =>
      all.findIndex((candidate: MouthCastProfile) => candidate.role === item.role) === index
    );

  const expressionRules = (Array.isArray(raw.expressionRules) ? raw.expressionRules as unknown[] : [])
    .map((item: unknown) => normalizeExpressionRule(item))
    .filter((item: MouthExpressionRule | undefined): item is MouthExpressionRule => Boolean(item));

  const mutationCurves = (Array.isArray(raw.mutationCurves) ? raw.mutationCurves as unknown[] : [])
    .map((item: unknown) => normalizeMutationCurve(item))
    .filter((item: MouthMutationCurve | undefined): item is MouthMutationCurve => Boolean(item));

  const timeline = (Array.isArray(raw.timeline) ? raw.timeline as unknown[] : [])
    .map((item: unknown) => normalizeMutationEvent(item))
    .filter((item: MouthMutationEvent | undefined): item is MouthMutationEvent => Boolean(item))
    .sort((a: MouthMutationEvent, b: MouthMutationEvent) =>
      a.positionPercent - b.positionPercent || a.id.localeCompare(b.id)
    );

  const transductions = (Array.isArray(raw.transductions) ? raw.transductions as unknown[] : [])
    .map((item: unknown) => normalizeTransduction(item))
    .filter((item: MouthTransductionRule | undefined): item is MouthTransductionRule => Boolean(item));

  return {
    castProfiles,
    expressionRules,
    mutationCurves,
    timeline,
    transductions,
  };
}

export function withMouthDynamics(genome: MouthGenome, dynamics: MouthDynamics): MouthGenome {
  return reidentifyMouthGenome({
    ...genome,
    dynamics: normalizeMouthDynamics(dynamics),
    createdAt: Date.now(),
  });
}

export function createExpressionRule(
  targetType: 'trait' | 'quirk',
  targetId: string,
  state: MouthExpressionState,
  options: {
    strength?: number;
    trigger?: string;
    castRole?: MouthCastRole;
  } = {},
): MouthExpressionRule {
  const normalized = normalizeExpressionRule({
    targetType,
    targetId,
    state,
    strength: options.strength ?? 75,
    trigger: options.trigger,
    castRole: options.castRole,
  });
  if (!normalized) throw new Error('Invalid Mouth Lab expression rule.');
  return normalized;
}


export function createMutationCurve(
  input: Omit<MouthMutationCurve, 'id'> & { id?: string },
): MouthMutationCurve {
  const normalized = normalizeMutationCurve(input);
  if (!normalized) throw new Error('Invalid Mouth Lab mutation curve.');
  return normalized;
}

export function createMutationEvent(
  input: Omit<MouthMutationEvent, 'id'> & { id?: string },
): MouthMutationEvent {
  const normalized = normalizeMutationEvent(input);
  if (!normalized) throw new Error('Invalid Mouth Lab mutation event.');
  return normalized;
}

export function createTransductionRule(
  input: Omit<MouthTransductionRule, 'id'> & { id?: string },
): MouthTransductionRule {
  const normalized = normalizeTransduction(input);
  if (!normalized) throw new Error('Invalid Mouth Lab transduction rule.');
  return normalized;
}

export const MOUTH_TRANSDUCTION_PRESETS: Array<{
  id: string;
  name: string;
  description: string;
  rule: Omit<MouthTransductionRule, 'id'>;
}> = [
  {
    id: 'mouth-transduction-clicks-to-offbeats',
    name: 'CLICKS → OFFBEAT PERCUSSION',
    description: 'Click-bearing vocal events become rhythmic attack instructions.',
    rule: {
      direction: 'languageToMusic',
      source: 'click consonant events',
      target: 'rhythm',
      mapping: 'Each clearly articulated click event claims an offbeat or syncopated percussion accent; percussion mirrors the click class without replacing the voice.',
      strength: 82,
    },
  },
  {
    id: 'mouth-transduction-vowel-length-to-duration',
    name: 'VOWEL LENGTH → NOTE DURATION',
    description: 'Long/short vocal quantity becomes melodic duration.',
    rule: {
      direction: 'languageToMusic',
      source: 'vowel length / quantity',
      target: 'duration',
      mapping: 'Lengthened vowels force proportionally longer sustained notes; clipped vowels force short note values while pitch identity remains stable.',
      strength: 88,
    },
  },
  {
    id: 'mouth-transduction-tone-to-melody',
    name: 'LEXICAL TONE → MELODY CONTOUR',
    description: 'Pitch categories constrain the sung contour instead of becoming decoration.',
    rule: {
      direction: 'languageToMusic',
      source: 'lexical tone or pitch category',
      target: 'melody',
      mapping: 'Preserve relative pitch-category relationships inside the melody; melodic contour must negotiate with the active tone pattern instead of ignoring it.',
      strength: 78,
    },
  },
  {
    id: 'mouth-transduction-mora-to-rhythm',
    name: 'MORA COUNT → RHYTHMIC GRID',
    description: 'Mora-like timing determines subdivision occupancy.',
    rule: {
      direction: 'languageToMusic',
      source: 'mora timing',
      target: 'rhythm',
      mapping: 'Treat each mora-like timing unit as one rhythmic occupancy cell; length and gemination consume additional cells instead of being squeezed into one beat.',
      strength: 84,
    },
  },
  {
    id: 'mouth-transduction-glottal-to-interruption',
    name: 'GLOTTAL EVENT → ARRANGEMENT CUT',
    description: 'Glottal catches can punch holes in the arrangement.',
    rule: {
      direction: 'languageToMusic',
      source: 'glottal interruption',
      target: 'arrangement',
      mapping: 'Selected glottal closures trigger micro-dropouts or hard arrangement cuts aligned to the vocal interruption.',
      strength: 72,
    },
  },
  {
    id: 'mouth-transduction-high-note-to-trill',
    name: 'HIGH NOTE → RHOTIC TRILL',
    description: 'Melodic register conditionally changes pronunciation.',
    rule: {
      direction: 'musicToLanguage',
      source: 'melody: high-register threshold',
      target: 'quirk:mouth-quirk-pitch-triggered-trill',
      mapping: 'Below the threshold use the ordinary rhotic; when the melody crosses the high-register threshold, eligible R sounds switch into an aggressive trill.',
      strength: 92,
    },
  },
  {
    id: 'mouth-transduction-density-to-compression',
    name: 'RHYTHMIC DENSITY → SYLLABLE COMPRESSION',
    description: 'Busy music forces the mouth to pack material harder.',
    rule: {
      direction: 'musicToLanguage',
      source: 'density',
      target: 'phonotactics',
      mapping: 'As event density rises, compress syllabic spacing and allow stronger consonant clustering; when density falls, restore clearer vowel separation.',
      strength: 76,
    },
  },
  {
    id: 'mouth-transduction-dynamics-to-phonation',
    name: 'LOUDNESS → PHONATION SHIFT',
    description: 'Dynamic level drives voice-quality mutation.',
    rule: {
      direction: 'musicToLanguage',
      source: 'dynamics',
      target: 'phonation',
      mapping: 'Quiet passages stay comparatively modal/breathy; louder peaks increase creaky, glottal, or compressed phonation according to the active Mouth Lab traits.',
      strength: 68,
    },
  },
];

export function createPresetTransduction(
  presetId: string,
  castRole?: MouthCastRole,
): MouthTransductionRule {
  const preset = MOUTH_TRANSDUCTION_PRESETS.find((item) => item.id === presetId);
  if (!preset) throw new Error('Unknown Mouth Lab transduction preset: ' + presetId);
  return createTransductionRule({
    ...preset.rule,
    castRole,
  });
}
