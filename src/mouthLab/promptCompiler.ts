import {
  MouthCompiledPrompt,
  MouthGenome,
  MouthPromptCompileOptions,
  MouthPromptMode,
  MouthQuirkInstance,
  MouthSemanticMode,
  normalizeMouthSemanticMode,
  MouthTraitPressure,
} from './types';
import { getMouthDonor } from './donors';
import { getMouthTrait } from './traits';
import { getMouthQuirkDefinition } from './quirks';
import { projectMouthPhenotype } from './phenotype';
import { normalizeMouthDynamics, mouthCastLabel } from './dynamics';
import { clampMouthControl } from './determinism';
import { normalizeMouthEnvironment } from './environment';
import { compileMouthMusicalExpression, normalizeMouthMusicalExpression } from './expression';

const VALID_AXES = new Set([
  'semantics',
  'lexicon',
  'morphology',
  'syntax',
  'consonants',
  'vowels',
  'phonotactics',
  'syllableStructure',
  'airflow',
  'larynx',
  'phonation',
  'tone',
  'stress',
  'prosody',
  'timing',
  'orthography',
]);

function cleanText(value: unknown, max = 500): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function pressureLabel(pressure: MouthTraitPressure): string {
  return pressure === 'obsessive'
    ? 'OBSESSIVE — global law; reinforce repeatedly and do not let it fade into occasional flavor'
    : pressure === 'high'
      ? 'HIGH — clearly audible and consistently enforced'
      : pressure === 'medium'
        ? 'MEDIUM — recurrent and identifiable'
        : 'LOW — subtle, bounded influence';
}

function donorName(donorId?: string): string {
  if (!donorId) return 'UNASSIGNED';
  return getMouthDonor(donorId)?.name || donorId;
}

function traitName(traitId: string): string {
  return getMouthTrait(traitId)?.name || traitId;
}

function quirkName(quirkId: string): string {
  return getMouthQuirkDefinition(quirkId)?.name || quirkId;
}

function sanitizeQuirk(instance: any): MouthQuirkInstance | undefined {
  if (!instance || typeof instance !== 'object') return undefined;
  const definition = getMouthQuirkDefinition(String(instance.quirkId || ''));
  if (!definition) return undefined;

  const requestedTakeoverMode = String(instance.takeover?.mode || '');
  const takeoverMode: MouthQuirkInstance['takeover']['mode'] = (
    [
      'constant',
      'instant',
      'gradual',
      'stepwise',
      'eventTriggered',
      'oscillating',
      'oneWay',
    ] as MouthQuirkInstance['takeover']['mode'][]
  ).includes(requestedTakeoverMode as MouthQuirkInstance['takeover']['mode'])
    ? (requestedTakeoverMode as MouthQuirkInstance['takeover']['mode'])
    : definition.defaultTakeover.mode;

  return {
    id: cleanText(instance.id, 140) || 'quirk_instance_' + definition.id,
    quirkId: definition.id,
    enabled: instance.enabled !== false,
    frequency: clampMouthControl(instance.frequency, definition.defaultFrequency),
    consistency: clampMouthControl(instance.consistency, definition.defaultConsistency),
    exaggeration: clampMouthControl(instance.exaggeration, definition.defaultExaggeration),
    takeover: {
      mode: takeoverMode,
      startPercent: clampMouthControl(
        instance.takeover?.startPercent,
        definition.defaultTakeover.startPercent,
      ),
      endPercent: clampMouthControl(
        instance.takeover?.endPercent,
        definition.defaultTakeover.endPercent,
      ),
      steps:
        takeoverMode === 'stepwise'
          ? Math.max(2, Math.min(12, Number(instance.takeover?.steps) || definition.defaultTakeover.steps || 4))
          : undefined,
      trigger: cleanText(instance.takeover?.trigger || instance.trigger, 220) || undefined,
    },
    trigger: cleanText(instance.trigger || instance.takeover?.trigger, 220) || undefined,
    linkedTraitIds: Array.from(
      new Set<string>(
        (Array.isArray(instance.linkedTraitIds) ? instance.linkedTraitIds : [])
          .map((id: unknown) => String(id))
          .filter((id: string) => Boolean(getMouthTrait(id))),
      ),
    ).sort(),
    createdAt: Number.isFinite(instance.createdAt) ? Number(instance.createdAt) : Date.now(),
  };
}

export function normalizeMouthGenomeForGeneration(value: unknown): MouthGenome | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as any;

  const parentDonorIds = Array.from(
    new Set<string>(
      (Array.isArray(raw.parentDonorIds) ? raw.parentDonorIds : [])
        .map((id: unknown) => String(id))
        .filter((id: string) => Boolean(getMouthDonor(id))),
    ),
  ).slice(0, 6);

  if (parentDonorIds.length < 2) return undefined;

  const assignments = (Array.isArray(raw.assignments) ? raw.assignments : [])
    .map((assignment: any) => {
      const axis = String(assignment?.axis || '');
      if (!VALID_AXES.has(axis)) return undefined;

      const donorId = assignment?.donorId && getMouthDonor(String(assignment.donorId))
        ? String(assignment.donorId)
        : undefined;

      const traitIds = Array.from(
        new Set(
          (Array.isArray(assignment?.traitIds) ? assignment.traitIds : [])
            .map((id: unknown) => String(id))
            .filter((id: string) => {
              const trait = getMouthTrait(id);
              if (!trait) return false;
              if (!trait.axes.includes(axis as any)) return false;
              if (donorId) {
                const donor = getMouthDonor(donorId);
                if (donor && !donor.traitIds.includes(id)) return false;
              }
              return true;
            }),
        ),
      ).sort();

      if (!traitIds.length && axis !== 'semantics') return undefined;

      const pressure: MouthTraitPressure = ['low', 'medium', 'high', 'obsessive'].includes(assignment?.pressure)
        ? assignment.pressure
        : 'medium';

      return {
        axis: axis as any,
        donorId,
        traitIds,
        pressure,
        locked: assignment?.locked === true,
      };
    })
    .filter(Boolean);

  if (!assignments.length) return undefined;

  const quirks = (Array.isArray(raw.quirks) ? raw.quirks : [])
    .map((item: any) => sanitizeQuirk(item))
    .filter((item: MouthQuirkInstance | undefined): item is MouthQuirkInstance => Boolean(item));

  const mutationScars = (Array.isArray(raw.mutationScars) ? raw.mutationScars : [])
    .slice(0, 16)
    .map((scar: any) => ({
      id: cleanText(scar?.id, 140) || 'mouth_scar_external',
      sourceOperation: ['gene-knockout', 'quirk-removal', 'specimen-application', 'environment-exposure', 'bottleneck', 'founder-effect', 'atavism', 'extinction', 'fossilize', 'speciate', 'manual'].includes(scar?.sourceOperation)
        ? scar.sourceOperation
        : 'manual',
      removedTraitIds: Array.from(
        new Set(
          (Array.isArray(scar?.removedTraitIds) ? scar.removedTraitIds : [])
            .map((id: unknown) => String(id))
            .filter((id: string) => Boolean(getMouthTrait(id))),
        ),
      ).sort(),
      removedQuirkIds: Array.from(
        new Set(
          (Array.isArray(scar?.removedQuirkIds) ? scar.removedQuirkIds : [])
            .map((id: unknown) => String(id))
            .filter((id: string) => Boolean(getMouthQuirkDefinition(id))),
        ),
      ).sort(),
      residualRule: cleanText(scar?.residualRule, 420),
      strength: clampMouthControl(scar?.strength, 25),
      createdAt: Number.isFinite(scar?.createdAt) ? Number(scar.createdAt) : Date.now(),
    }))
    .filter((scar: any) => scar.residualRule || scar.removedTraitIds.length || scar.removedQuirkIds.length);

  const fossils = (Array.isArray(raw.fossils) ? raw.fossils : [])
    .slice(0, 16)
    .map((fossil: any) => {
      const sourceType = fossil?.sourceType === 'quirk' ? 'quirk' : 'trait';
      const sourceId = cleanText(fossil?.sourceId, 180);
      const valid =
        sourceType === 'trait'
          ? Boolean(getMouthTrait(sourceId))
          : Boolean(getMouthQuirkDefinition(sourceId));
      if (!valid) return undefined;
      return {
        id: cleanText(fossil?.id, 180) || 'mouth_fossil_external',
        sourceType,
        sourceId,
        sourceName: cleanText(fossil?.sourceName, 180) ||
          (sourceType === 'trait' ? traitName(sourceId) : quirkName(sourceId)),
        musicalRule: cleanText(fossil?.musicalRule, 420),
        generation: Math.max(0, Math.min(99, Math.round(Number(fossil?.generation) || 0))),
        createdAt: Number.isFinite(fossil?.createdAt) ? Number(fossil.createdAt) : Date.now(),
      };
    })
    .filter(Boolean);

  const linkedGeneBundles = (Array.isArray(raw.linkedGeneBundles) ? raw.linkedGeneBundles : [])
    .slice(0, 16)
    .map((bundle: any) => ({
      id: cleanText(bundle?.id, 140) || 'mouth_bundle_external',
      name: cleanText(bundle?.name, 160) || 'LINKED GENES',
      traitIds: Array.from(
        new Set(
          (Array.isArray(bundle?.traitIds) ? bundle.traitIds : [])
            .map((id: unknown) => String(id))
            .filter((id: string) => Boolean(getMouthTrait(id))),
        ),
      ).sort(),
      quirkIds: Array.from(
        new Set(
          (Array.isArray(bundle?.quirkIds) ? bundle.quirkIds : [])
            .map((id: unknown) => String(id))
            .filter((id: string) => Boolean(getMouthQuirkDefinition(id))),
        ),
      ).sort(),
      lockedTogether: bundle?.lockedTogether !== false,
      note: cleanText(bundle?.note, 360),
      createdAt: Number.isFinite(bundle?.createdAt) ? Number(bundle.createdAt) : Date.now(),
    }))
    .filter((bundle: any) => bundle.traitIds.length || bundle.quirkIds.length);

  return {
    id: cleanText(raw.id, 180) || 'mouth_external',
    name: cleanText(raw.name, 180) || 'MOUTH LAB GENOME',
    parentDonorIds,
    assignments: assignments as MouthGenome['assignments'],
    objectiveId: cleanText(raw.objectiveId, 180) || undefined,
    semanticAnchorLanguageProfileId: cleanText(raw.semanticAnchorLanguageProfileId, 180) || undefined,
    intelligibility: clampMouthControl(raw.intelligibility, 82),
    stability: clampMouthControl(raw.stability, 72),
    mutation: clampMouthControl(raw.mutation, 35),
    musicalExpression: normalizeMouthMusicalExpression(raw.musicalExpression),
    breedingSeed: cleanText(raw.breedingSeed, 240) || 'normalized-mouth-seed',
    quirks,
    mutationScars: mutationScars as MouthGenome['mutationScars'],
    fossils: fossils as MouthGenome['fossils'],
    environment: normalizeMouthEnvironment(raw.environment),
    linkedGeneBundles: linkedGeneBundles as MouthGenome['linkedGeneBundles'],
    dynamics: normalizeMouthDynamics(raw.dynamics),
    lineage:
      raw.lineage && typeof raw.lineage === 'object'
        ? {
            parentGenomeIds: Array.from(
              new Set<string>(
                (Array.isArray(raw.lineage.parentGenomeIds) ? raw.lineage.parentGenomeIds : [])
                  .map((id: unknown) => cleanText(id, 180))
                  .filter(Boolean),
              ),
            ).slice(0, 6),
            parentNames: (Array.isArray(raw.lineage.parentNames) ? raw.lineage.parentNames : [])
              .map((name: unknown) => cleanText(name, 180))
              .filter(Boolean)
              .slice(0, 6),
            generation: Math.max(0, Math.min(99, Math.round(Number(raw.lineage.generation) || 0))),
            breedingSeed: cleanText(raw.lineage.breedingSeed, 240),
            inheritedTraitIdsByParent:
              raw.lineage.inheritedTraitIdsByParent && typeof raw.lineage.inheritedTraitIdsByParent === 'object'
                ? Object.fromEntries(
                    Object.entries(raw.lineage.inheritedTraitIdsByParent as Record<string, unknown>)
                      .slice(0, 6)
                      .map(([parentId, ids]) => [
                        cleanText(parentId, 180),
                        Array.from(
                          new Set<string>(
                            (Array.isArray(ids) ? ids : [])
                              .map((id: unknown) => String(id))
                              .filter((id: string) => Boolean(getMouthTrait(id))),
                          ),
                        ).slice(0, 16),
                      ]),
                  )
                : {},
            inheritedQuirkIdsByParent:
              raw.lineage.inheritedQuirkIdsByParent && typeof raw.lineage.inheritedQuirkIdsByParent === 'object'
                ? Object.fromEntries(
                    Object.entries(raw.lineage.inheritedQuirkIdsByParent as Record<string, unknown>)
                      .slice(0, 6)
                      .map(([parentId, ids]) => [
                        cleanText(parentId, 180),
                        Array.from(
                          new Set<string>(
                            (Array.isArray(ids) ? ids : [])
                              .map((id: unknown) => String(id))
                              .filter((id: string) => Boolean(getMouthQuirkDefinition(id))),
                          ),
                        ).slice(0, 16),
                      ]),
                  )
                : {},
            specimenIds: Array.from(
              new Set<string>(
                (Array.isArray(raw.lineage.specimenIds) ? raw.lineage.specimenIds : [])
                  .map((id: unknown) => cleanText(id, 180))
                  .filter(Boolean),
              ),
            ).slice(0, 16),
            mutationTraitIds: Array.from(
              new Set<string>(
                (Array.isArray(raw.lineage.mutationTraitIds) ? raw.lineage.mutationTraitIds : [])
                  .map((id: unknown) => String(id))
                  .filter((id: string) => Boolean(getMouthTrait(id))),
              ),
            ).slice(0, 16),
            mutationQuirkIds: Array.from(
              new Set<string>(
                (Array.isArray(raw.lineage.mutationQuirkIds) ? raw.lineage.mutationQuirkIds : [])
                  .map((id: unknown) => String(id))
                  .filter((id: string) => Boolean(getMouthQuirkDefinition(id))),
              ),
            ).slice(0, 16),
            noveltyPenaltyTraitIds: Array.from(
              new Set<string>(
                (Array.isArray(raw.lineage.noveltyPenaltyTraitIds) ? raw.lineage.noveltyPenaltyTraitIds : [])
                  .map((id: unknown) => String(id))
                  .filter((id: string) => Boolean(getMouthTrait(id))),
              ),
            ).slice(0, 16),
          }
        : undefined,
    createdAt: Number.isFinite(raw.createdAt) ? Number(raw.createdAt) : Date.now(),
  };
}

function semanticModeFor(
  _genome: MouthGenome,
  requested: MouthSemanticMode | undefined,
): MouthSemanticMode {
  return normalizeMouthSemanticMode(requested);
}

function semanticPolicy(genome: MouthGenome, mode: MouthSemanticMode): string {
  if (mode === 'englishMeaningAlienMouth') {
    return [
      'ENGLISH MEANING / ALIEN MOUTH:',
      'Keep semantic propositions and lexical targets in intelligible English.',
      'English owns meaning, not mouth mechanics.',
      'Pronunciation, consonants, vowels, timing, tone, phonation, phonotactics, and morphology may be governed by the selected Mouth Lab traits.',
      'Do not translate into donor languages or fabricate fluent-looking donor-language text.',
      'When morphology acts on English, treat it as structural mutation pressure on English material.',
    ].join(' ');
  }

  if (mode === 'mixed') {
    return [
      'MIXED SEMANTICS:',
      'Keep a clearly intelligible semantic spine, but permit bounded regions where lexical material fractures into vocables, partial words, repeated morpheme-like fragments, and nonlexical mouth events.',
      'Meaning and nonmeaning may alternate, overlap, or be assigned to different cast roles.',
      'At least one recurring anchor phrase must remain intelligible enough to orient the listener.',
      'Do not present invented material as authentic donor-language speech.',
    ].join(' ');
  }

  if (mode === 'decay') {
    return [
      'SEMANTIC DECAY:',
      'Begin with clear propositions and recognizable lexical targets, then progressively erode semantics in a one-way trajectory.',
      'Sentence structure may collapse into fragments, fragments into pseudo-words, pseudo-words into phonemes, and phonemes into articulatory gestures.',
      'Preserve one or two semantic fossils as recurring anchors so the loss of meaning is audible rather than random.',
      'Do not reset to full clarity unless an explicit structural event commands it.',
    ].join(' ');
  }

  if (mode === 'nonsemantic') {
    return [
      'NONSEMANTIC MOUTH:',
      'The voice is not required to communicate lexical propositions.',
      'Use phonemes, vocables, breaths, clicks, trills, vowels, consonant bursts, hocketed fragments, and other mouth events as musical material.',
      'Phonetic organization must still obey the selected Mouth Lab genome and remain structurally purposeful.',
      'Do not fabricate or imply fluent speech in any donor language.',
    ].join(' ');
  }

  if (mode === 'evolving') {
    return [
      'EVOLVING SEMANTICS:',
      'Meaning itself is a stateful musical variable.',
      'Begin with a stable semantic mapping, then let repeated words, phrases, or vocal tokens acquire, lose, split, or exchange meanings only when explicit musical or structural triggers occur.',
      'Track those changes consistently after each trigger so semantic mutation has memory and ancestry.',
      'Retain at least one invariant referent so the listener can perceive the semantic evolution.',
      'Do not use arbitrary surreal substitution as a shortcut.',
    ].join(' ');
  }

  const anchor = genome.semanticAnchorLanguageProfileId
    ? 'Semantic anchor profile: ' + genome.semanticAnchorLanguageProfileId + '.'
    : 'No explicit semantic-anchor language is locked.';

  return anchor + ' Mouth mechanics may transform pronunciation and structure only within the genome jurisdictions.';
}
function takeoverText(instance: MouthQuirkInstance): string {
  const curve = instance.takeover;
  if (curve.mode === 'constant') return 'active throughout';
  if (curve.mode === 'instant') return 'switches on abruptly';
  if (curve.mode === 'gradual') return 'spreads gradually from ' + curve.startPercent + '% to ' + curve.endPercent + '%';
  if (curve.mode === 'stepwise') return 'spreads in ' + (curve.steps || 4) + ' steps from ' + curve.startPercent + '% to ' + curve.endPercent + '%';
  if (curve.mode === 'eventTriggered') return 'activates when ' + (instance.trigger || curve.trigger || 'the configured event occurs');
  if (curve.mode === 'oscillating') return 'oscillates between low and high expression';
  return 'once activated, takeover moves one way and does not reset';
}

function traitDirective(
  traitId: string,
  donorId: string | undefined,
  pressure: MouthTraitPressure,
): string {
  const trait = getMouthTrait(traitId);
  if (!trait) return '';

  return (
    trait.name +
    ' ← ' +
    donorName(donorId) +
    ': ' +
    trait.operation +
    ' Pressure=' +
    pressureLabel(pressure) +
    '.'
  );
}

function quirkDirective(instance: MouthQuirkInstance): string {
  const definition = getMouthQuirkDefinition(instance.quirkId);
  if (!definition) return '';

  return (
    definition.name +
    ': target=' +
    definition.target +
    '; rule=' +
    definition.transformation +
    '; frequency=' +
    instance.frequency +
    '/100; consistency=' +
    instance.consistency +
    '/100; exaggeration=' +
    instance.exaggeration +
    '/100; takeover=' +
    takeoverText(instance) +
    '.'
  );
}

function pressureReinforcementLines(genome: MouthGenome): string[] {
  const lines: string[] = [];

  for (const assignment of genome.assignments) {
    for (const traitId of assignment.traitIds) {
      if (assignment.pressure === 'obsessive') {
        lines.push(
          'OBSESSIVE ENFORCEMENT: ' +
            traitName(traitId) +
            ' is a global law. Repeat its requirement in performance decisions, preserve it through section changes, and do not let the model reduce it to occasional flavor.',
        );
      } else if (assignment.pressure === 'high') {
        lines.push(
          'HIGH ENFORCEMENT: ' +
            traitName(traitId) +
            ' must remain clearly audible across multiple sections.',
        );
      }
    }
  }

  for (const quirk of genome.quirks) {
    if (!quirk.enabled) continue;
    if (quirk.consistency >= 90 && quirk.frequency >= 90) {
      lines.push(
        'PATHOLOGICAL CONSISTENCY: ' +
          quirkName(quirk.quirkId) +
          ' should fire on virtually every eligible target; exceptions must be rare and structurally motivated.',
      );
    }
  }

  return lines;
}

function linkedBundleLines(genome: MouthGenome): string[] {
  return genome.linkedGeneBundles
    .filter((bundle) => bundle.lockedTogether)
    .map((bundle) => {
      const traits = bundle.traitIds.map(traitName);
      const quirks = bundle.quirkIds.map(quirkName);
      return (
        'LINKED GENE BUNDLE: keep together [' +
        [...traits, ...quirks].join(' + ') +
        ']. Do not preserve one while silently dropping the rest.'
      );
    });
}

function environmentLines(genome: MouthGenome): string[] {
  const environment = genome.environment;
  if (!environment) return [];

  if (environment.mode === 'isolation') {
    return [
      'LANGUAGE ECOLOGY — ISOLATION: ' +
        environment.generations +
        ' generation(s) without outside donor pressure at ' +
        environment.pressure +
        '/100. Treat resulting drift as lived history, not new ancestry.',
    ];
  }

  const donor = environment.sourceDonorId ? getMouthDonor(environment.sourceDonorId) : undefined;
  const adaptations = environment.adaptationTraitIds
    .map((id) => traitName(id))
    .join(', ');

  return [
    'LANGUAGE ECOLOGY — ' +
      environment.mode.toUpperCase() +
      ': surrounding ' +
      (donor?.name || environment.sourceDonorId || 'unknown source') +
      ' pressure=' +
      environment.pressure +
      '/100 for ' +
      environment.generations +
      ' generation(s). Adaptation targets: ' +
      (adaptations || 'general surrounding phonology') +
      '. ENVIRONMENT IS NOT ANCESTRY: do not add this source to parent donors unless it is already a true parent.',
  ];
}

function fossilLines(genome: MouthGenome): string[] {
  return (genome.fossils || []).map((fossil) =>
    'MUSICAL FOSSIL — ' + fossil.sourceName + ' went extinct from active mouth behavior at G' +
    fossil.generation + ' but persists outside the voice as music: ' + fossil.musicalRule +
    ' Do not restore the original vocal behavior unless an explicit later operation reactivates it.'
  );
}

function scarLines(genome: MouthGenome): string[] {
  return genome.mutationScars
    .filter((scar) => scar.strength > 0 && scar.residualRule)
    .map(
      (scar) =>
        'MUTATION SCAR ' +
        scar.strength +
        '/100: ' +
        scar.residualRule,
    );
}

function interactionLines(genome: MouthGenome): string[] {
  const phenotype = projectMouthPhenotype(genome);
  return phenotype.interactions
    .filter((interaction) => interaction.severity >= 3)
    .slice(0, 8)
    .map(
      (interaction) =>
        interaction.relationship.toUpperCase() +
        ' — ' +
        traitName(interaction.traitAId) +
        ' × ' +
        traitName(interaction.traitBId) +
        ': ' +
        interaction.resolutionLaw,
    );
}


function dynamicTargetName(targetType: 'trait' | 'quirk' | undefined, targetId: string | undefined): string {
  if (!targetId) return 'unspecified target';
  if (targetType === 'trait') return traitName(targetId);
  if (targetType === 'quirk') return quirkName(targetId);
  return targetId;
}

function castProfileLine(genome: MouthGenome): string[] {
  const profiles = genome.dynamics?.castProfiles || [];
  return profiles.map((profile) => {
    const traitParts = profile.assignments.flatMap((assignment) =>
      assignment.traitIds.map(
        (traitId) =>
          assignment.axis.toUpperCase() +
          '=' +
          traitName(traitId) +
          ' [' +
          assignment.pressure.toUpperCase() +
          ']',
      ),
    );
    const quirkParts = profile.quirks
      .filter((quirk) => quirk.enabled)
      .map((quirk) => quirkName(quirk.quirkId));

    return (
      'CAST MOUTH ' +
      mouthCastLabel(profile.role) +
      ' (' +
      profile.label +
      '): ' +
      [...traitParts, ...quirkParts].join('; ') +
      '. Keep this mouth specific to that voice role unless a timeline infection/swap explicitly transfers it.'
    );
  });
}

function expressionLines(genome: MouthGenome): string[] {
  return (genome.dynamics?.expressionRules || []).map((rule) => {
    const target = dynamicTargetName(rule.targetType, rule.targetId);
    const role = rule.castRole ? ' in ' + mouthCastLabel(rule.castRole) : '';
    const trigger = rule.trigger ? '; trigger=' + rule.trigger : '';
    const law =
      rule.state === 'dominant'
        ? 'express whenever eligible and override weaker competing expression'
        : rule.state === 'recessive'
          ? 'remain weak unless dominant competitors are absent, suppressed, or exhausted'
          : rule.state === 'latent'
            ? 'remain silent until a timeline event or explicit trigger activates it'
            : 'remain off until the stated trigger becomes true';

    return (
      'EXPRESSION ' +
      rule.state.toUpperCase() +
      role +
      ': ' +
      target +
      ' strength=' +
      rule.strength +
      '/100; ' +
      law +
      trigger +
      '.'
    );
  });
}


function mutationCurveLines(genome: MouthGenome): string[] {
  return (genome.dynamics?.mutationCurves || []).map((curve) => {
    const role = curve.castRole ? ' in ' + mouthCastLabel(curve.castRole) : '';
    return (
      'MUTATION CURVE' +
      role +
      ': ' +
      dynamicTargetName(curve.targetType, curve.targetId) +
      ' changes from ' +
      curve.startStrength +
      '/100 at ' +
      curve.startPercent +
      '% to ' +
      curve.endStrength +
      '/100 at ' +
      curve.endPercent +
      '% using a ' +
      curve.shape +
      ' curve. Treat intermediate values as real graded expression, not random toggles.'
    );
  });
}

function mutationTimelineLines(genome: MouthGenome): string[] {
  return (genome.dynamics?.timeline || []).map((event) => {
    const target = dynamicTargetName(event.targetType, event.targetId);
    const sourceRole = event.sourceCastRole ? mouthCastLabel(event.sourceCastRole) : '';
    const targetRole = event.targetCastRole ? mouthCastLabel(event.targetCastRole) : '';
    const castClause =
      event.action === 'infectCast'
        ? ' from ' + (sourceRole || 'active donor voice') + ' into ' + targetRole
        : event.action === 'swapCastMouth'
          ? ' between ' + (sourceRole || 'source voice') + ' and ' + targetRole
          : targetRole
            ? ' in ' + targetRole
            : '';
    const time =
      (event.sectionLabel ? event.sectionLabel + ' / ' : '') +
      event.positionPercent +
      '% of song';
    const trigger = event.trigger ? '; condition=' + event.trigger : '';

    return (
      'TIMELINE @ ' +
      time +
      ': ' +
      event.action +
      castClause +
      (event.targetId ? '; target=' + target : '') +
      '; amount=' +
      event.amount +
      '/100' +
      trigger +
      '. This state change must remain in force until another event explicitly reverses or replaces it.'
    );
  });
}

function transductionLines(genome: MouthGenome): string[] {
  return (genome.dynamics?.transductions || []).map((rule) => {
    const role = rule.castRole ? ' for ' + mouthCastLabel(rule.castRole) : '';
    const direction =
      rule.direction === 'languageToMusic'
        ? 'LANGUAGE → MUSIC'
        : 'MUSIC → LANGUAGE';
    return (
      direction +
      role +
      ': ' +
      rule.source +
      ' → ' +
      rule.target +
      ' at ' +
      rule.strength +
      '/100. Mapping: ' +
      rule.mapping +
      (rule.trigger ? ' Trigger: ' + rule.trigger + '.' : '')
    );
  });
}

function dynamicLines(genome: MouthGenome): string[] {
  return [
    ...castProfileLine(genome),
    ...expressionLines(genome),
    ...mutationCurveLines(genome),
    ...mutationTimelineLines(genome),
    ...transductionLines(genome),
    ...environmentLines(genome),
  ];
}

function compactText(genome: MouthGenome, mode: MouthSemanticMode): string {
  const assignments = genome.assignments
    .flatMap((assignment) =>
      assignment.traitIds.map(
        (traitId) =>
          assignment.axis.toUpperCase() +
          '=' +
          traitName(traitId) +
          ' from ' +
          donorName(assignment.donorId) +
          ' [' +
          assignment.pressure.toUpperCase() +
          ']',
      ),
    )
    .join('; ');

  const quirks = genome.quirks
    .filter((quirk) => quirk.enabled)
    .map(
      (quirk) =>
        quirkName(quirk.quirkId) +
        ' F' +
        quirk.frequency +
        '/C' +
        quirk.consistency +
        '/X' +
        quirk.exaggeration,
    )
    .join('; ');

  return [
    semanticPolicy(genome, mode),
    assignments,
    quirks ? 'QUIRKS: ' + quirks : '',
    dynamicLines(genome).length
      ? 'DYNAMICS: cast=' + (genome.dynamics?.castProfiles.length || 0) +
        '; expression=' + (genome.dynamics?.expressionRules.length || 0) +
        '; curves=' + (genome.dynamics?.mutationCurves.length || 0) +
        '; timeline=' + (genome.dynamics?.timeline.length || 0) +
        '; transduction=' + (genome.dynamics?.transductions.length || 0) + '.'
      : '',
    'Controls: intelligibility=' +
      genome.intelligibility +
      '; stability=' +
      genome.stability +
      '; mutation=' +
      genome.mutation +
      '.',
  ]
    .filter(Boolean)
    .join(' ');
}

function bracketedText(genome: MouthGenome, mode: MouthSemanticMode): string {
  const lines: string[] = [
    '[MOUTH LAB — ACTIVE VOCAL GENOME]',
    '[SEMANTIC POLICY: ' + semanticPolicy(genome, mode) + ']',
    '[GLOBAL CONTROLS: intelligibility=' +
      genome.intelligibility +
      '/100; stability=' +
      genome.stability +
      '/100; mutation=' +
      genome.mutation +
      '/100]',
  ];

  for (const assignment of genome.assignments) {
    if (!assignment.traitIds.length && assignment.axis === 'semantics') {
      lines.push(
        '[SEMANTICS: anchor=' +
          (genome.semanticAnchorLanguageProfileId || donorName(assignment.donorId)) +
          ']',
      );
      continue;
    }

    for (const traitId of assignment.traitIds) {
      lines.push(
        '[' +
          assignment.axis.toUpperCase() +
          ' JURISDICTION: ' +
          traitDirective(traitId, assignment.donorId, assignment.pressure) +
          ']',
      );
    }
  }

  for (const quirk of genome.quirks.filter((item) => item.enabled)) {
    lines.push('[QUIRK: ' + quirkDirective(quirk) + ']');
  }

  for (const line of pressureReinforcementLines(genome)) {
    lines.push('[ENFORCEMENT: ' + line + ']');
  }

  for (const line of interactionLines(genome)) {
    lines.push('[TRAIT NEGOTIATION: ' + line + ']');
  }

  for (const line of linkedBundleLines(genome)) {
    lines.push('[' + line + ']');
  }

  for (const line of environmentLines(genome)) {
    lines.push('[' + line + ']');
  }

  for (const line of fossilLines(genome)) {
    lines.push('[' + line + ']');
  }

  for (const line of scarLines(genome)) {
    lines.push('[' + line + ']');
  }

  for (const line of castProfileLine(genome)) {
    lines.push('[CAST GENETICS: ' + line + ']');
  }

  for (const line of expressionLines(genome)) {
    lines.push('[CONDITIONAL PHONETICS: ' + line + ']');
  }

  for (const line of mutationCurveLines(genome)) {
    lines.push('[MUTATION CURVE: ' + line + ']');
  }

  for (const line of mutationTimelineLines(genome)) {
    lines.push('[MUTATION TIMELINE: ' + line + ']');
  }

  for (const line of transductionLines(genome)) {
    lines.push('[TRANSDUCTION: ' + line + ']');
  }

  lines.push(
    '[ANTI-CARICATURE: transplant operational phonetic/morphological mechanisms only. Do not invent personality, ethnicity, intelligence, social class, or comedy from a donor language. Do not use fake eye-dialect as the main representation.]',
  );

  return lines.join('\n');
}

function descriptiveText(genome: MouthGenome, mode: MouthSemanticMode): string {
  const clauses = genome.assignments.flatMap((assignment) =>
    assignment.traitIds.map((traitId) => {
      const trait = getMouthTrait(traitId);
      if (!trait) return '';
      return (
        donorName(assignment.donorId) +
        '-derived ' +
        trait.name.toLowerCase() +
        ' governs ' +
        assignment.axis +
        ', with ' +
        assignment.pressure +
        ' pressure'
      );
    }),
  );

  const quirkClauses = genome.quirks
    .filter((quirk) => quirk.enabled)
    .map((quirk) => {
      const def = getMouthQuirkDefinition(quirk.quirkId);
      return def
        ? def.name.toLowerCase() +
            ' targets ' +
            def.target +
            ' at ' +
            quirk.consistency +
            '% consistency'
        : '';
    })
    .filter(Boolean);

  return (
    semanticPolicy(genome, mode) +
    ' Build the vocal organism so ' +
    clauses.filter(Boolean).join('; ') +
    (quirkClauses.length ? '. Superimpose these bounded mutations: ' + quirkClauses.join('; ') : '') +
    (dynamicLines(genome).length ? '. Dynamic behavior: ' + dynamicLines(genome).join(' ') : '') +
    '. Preserve separate jurisdictions and expose conflicts procedurally instead of averaging them into a generic accent.'
  );
}

function styleDirectives(genome: MouthGenome, mode: MouthSemanticMode): string {
  const phenotype = projectMouthPhenotype(genome);
  const musicalExpression = compileMouthMusicalExpression(genome);
  const priorities = phenotype.audiblePriority.slice(0, 5).map((id) =>
    id.startsWith('quirk:')
      ? quirkName(id.slice('quirk:'.length))
      : traitName(id),
  );

  return [
    '[MOUTH LAB STYLE PRIORITY: ' + (priorities.join(' > ') || 'none') + ']',
    '[MOUTH LAB SEMANTICS: ' + semanticPolicy(genome, mode) + ']',
    '[MOUTH LAB PERFORMANCE: preserve separate mouth jurisdictions; high/obsessive traits must remain audible across section changes; conflict rules create events rather than mush.]',
    musicalExpression.styleDirectives,
    ...(genome.dynamics?.castProfiles.length
      ? ['[CAST MOUTHS: ' + genome.dynamics.castProfiles.map((profile) => mouthCastLabel(profile.role) + '=' + profile.label).join(' | ') + ']']
      : []),
    ...(genome.dynamics?.transductions.length
      ? ['[MOUTH TRANSDUCTION ACTIVE: language and music may drive one another only through the explicit mappings in LYRICS/CONTROL.]']
      : []),
  ].join(' ');
}

function lyricsDirectives(genome: MouthGenome, mode: MouthSemanticMode): string {
  const musicalExpression = compileMouthMusicalExpression(genome);
  const parts = [
    '[MOUTH LAB CONTROL]',
    musicalExpression.lyricsDirectives,
    '[' + semanticPolicy(genome, mode) + ']',
    ...genome.assignments.flatMap((assignment) =>
      assignment.traitIds.map(
        (traitId) =>
          '[' +
          assignment.axis.toUpperCase() +
          ': ' +
          traitDirective(traitId, assignment.donorId, assignment.pressure) +
          ']',
      ),
    ),
    ...genome.quirks
      .filter((quirk) => quirk.enabled)
      .map((quirk) => '[QUIRK: ' + quirkDirective(quirk) + ']'),
    ...pressureReinforcementLines(genome).map((line) => '[ENFORCEMENT: ' + line + ']'),
    ...interactionLines(genome).map((line) => '[NEGOTIATION: ' + line + ']'),
    ...environmentLines(genome).map((line) => '[' + line + ']'),
    ...fossilLines(genome).map((line) => '[' + line + ']'),
    ...scarLines(genome).map((line) => '[' + line + ']'),
    ...castProfileLine(genome).map((line) => '[CAST GENETICS: ' + line + ']'),
    ...expressionLines(genome).map((line) => '[CONDITIONAL PHONETICS: ' + line + ']'),
    ...mutationCurveLines(genome).map((line) => '[MUTATION CURVE: ' + line + ']'),
    ...mutationTimelineLines(genome).map((line) => '[MUTATION TIMELINE: ' + line + ']'),
    ...transductionLines(genome).map((line) => '[TRANSDUCTION: ' + line + ']'),
  ];

  return parts.join('\n');
}

export function compileMouthPrompt(
  rawGenome: MouthGenome | unknown,
  options: MouthPromptCompileOptions = {},
): MouthCompiledPrompt {
  const genome = normalizeMouthGenomeForGeneration(rawGenome);
  if (!genome) {
    throw new Error('Invalid Mouth Lab genome for prompt compilation.');
  }

  const mode: MouthPromptMode = options.mode || 'bracketed';
  const semanticMode = semanticModeFor(genome, options.semanticMode);
  const phenotype = projectMouthPhenotype(genome);

  const text =
    mode === 'compact'
      ? compactText(genome, semanticMode)
      : mode === 'descriptive'
        ? descriptiveText(genome, semanticMode)
        : bracketedText(genome, semanticMode);

  return {
    mode,
    semanticMode,
    text,
    styleDirectives: styleDirectives(genome, semanticMode),
    lyricsDirectives: lyricsDirectives(genome, semanticMode),
    summary:
      phenotype.summary +
      ' Mouth Lab prompt mode=' +
      mode +
      '; semantic mode=' +
      semanticMode +
      '; cast mouths=' +
      (genome.dynamics?.castProfiles.length || 0) +
      '; mutation curves=' +
      (genome.dynamics?.mutationCurves.length || 0) +
      '; timeline events=' +
      (genome.dynamics?.timeline.length || 0) +
      '; transductions=' +
      (genome.dynamics?.transductions.length || 0) +
      '.',
    activeTraitIds: Array.from(
      new Set(genome.assignments.flatMap((assignment) => assignment.traitIds)),
    ).sort(),
    activeQuirkIds: Array.from(
      new Set(genome.quirks.filter((quirk) => quirk.enabled).map((quirk) => quirk.quirkId)),
    ).sort(),
    warnings: [...phenotype.warnings],
  };
}
