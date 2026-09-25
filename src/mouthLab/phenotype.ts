import {
  MouthGenome,
  MouthPhenotype,
  MouthPhenotypeInteraction,
  MouthPhenotypeQuirk,
  MouthPhenotypeTrait,
  MouthTraitPressure,
} from './types';
import { getMouthTrait } from './traits';
import { getMouthQuirkDefinition } from './quirks';
import { getMouthTraitRelationship } from './conflictMatrix';
import { MOUTH_PRESSURE_RANK } from './determinism';

const INTELLIGIBILITY_RISK_TAGS = new Set([
  'lossy',
  'consonant-heavy',
  'vowel-sparse',
  'syllabic-consonant',
  'compression',
  'large-inventory',
  'high-dimensional',
]);

function audibilityFor(salience: number): MouthPhenotypeTrait['expectedAudibility'] {
  if (salience >= 84) return 'dominant';
  if (salience >= 62) return 'clear';
  if (salience >= 38) return 'intermittent';
  return 'subtle';
}

function pressureBase(pressure: MouthTraitPressure): number {
  return {
    low: 28,
    medium: 52,
    high: 76,
    obsessive: 96,
  }[pressure];
}

function traitSalience(
  traitId: string,
  pressure: MouthTraitPressure,
  intelligibility: number,
  mutation: number,
): number {
  const trait = getMouthTrait(traitId);
  if (!trait) return 0;

  let score = pressureBase(pressure);

  const riskCount = trait.tags.filter((tag) => INTELLIGIBILITY_RISK_TAGS.has(tag)).length;
  if (riskCount > 0) {
    const protection = intelligibility / 100;
    score -= Math.round(riskCount * 10 * protection);
  }

  if (trait.tags.includes('micro-mutation')) {
    score += Math.round(mutation * 0.12);
  }

  if (trait.tags.includes('coupling') || trait.tags.includes('contagion')) {
    score += Math.round(mutation * 0.06);
  }

  return Math.max(5, Math.min(100, Math.round(score)));
}

function interactionInstances(genome: MouthGenome): MouthPhenotypeInteraction[] {
  const traitIds = Array.from(
    new Set(genome.assignments.flatMap((assignment) => assignment.traitIds)),
  );

  const interactions: MouthPhenotypeInteraction[] = [];

  for (let i = 0; i < traitIds.length; i += 1) {
    for (let j = i + 1; j < traitIds.length; j += 1) {
      const rule = getMouthTraitRelationship(traitIds[i], traitIds[j]);
      if (!rule) continue;

      if (rule.relationship === 'orthogonal' && rule.severity <= 1) continue;

      interactions.push({
        traitAId: rule.traitAId,
        traitBId: rule.traitBId,
        relationship: rule.relationship,
        explanation: rule.explanation,
        resolutionLaw: rule.resolutionLaw,
        severity: rule.severity,
      });
    }
  }

  return interactions.sort(
    (a, b) =>
      b.severity - a.severity ||
      a.relationship.localeCompare(b.relationship) ||
      a.traitAId.localeCompare(b.traitAId),
  );
}

function assignmentTraitRows(genome: MouthGenome): MouthPhenotypeTrait[] {
  const rows: MouthPhenotypeTrait[] = [];

  for (const assignment of genome.assignments) {
    for (const traitId of assignment.traitIds) {
      if (!getMouthTrait(traitId)) continue;

      const salience = traitSalience(
        traitId,
        assignment.pressure,
        genome.intelligibility,
        genome.mutation,
      );

      rows.push({
        traitId,
        donorId: assignment.donorId,
        axis: assignment.axis,
        pressure: assignment.pressure,
        salience,
        consistency: Math.max(
          5,
          Math.min(
            100,
            Math.round(
              genome.stability * 0.72 +
              MOUTH_PRESSURE_RANK[assignment.pressure] * 7 +
              genome.mutation * 0.07,
            ),
          ),
        ),
        expectedAudibility: audibilityFor(salience),
      });
    }
  }

  return rows;
}


function quirkRows(genome: MouthGenome): MouthPhenotypeQuirk[] {
  return (genome.quirks || [])
    .filter((instance) => instance.enabled)
    .map((instance) => {
      const definition = getMouthQuirkDefinition(instance.quirkId);
      if (!definition) return undefined;

      let salience = Math.round(
        instance.frequency * 0.28 +
        instance.consistency * 0.34 +
        instance.exaggeration * 0.38,
      );

      const intelligibilityProtection = genome.intelligibility / 100;
      salience -= Math.round(
        definition.intelligibilityRisk * 5 * intelligibilityProtection,
      );
      salience = Math.max(5, Math.min(100, salience));

      return {
        instanceId: instance.id,
        quirkId: instance.quirkId,
        axis: definition.axis,
        frequency: instance.frequency,
        consistency: instance.consistency,
        exaggeration: instance.exaggeration,
        expectedAudibility: audibilityFor(salience),
        takeover: { ...instance.takeover },
      } satisfies MouthPhenotypeQuirk;
    })
    .filter((row): row is MouthPhenotypeQuirk => Boolean(row))
    .sort(
      (a, b) =>
        b.exaggeration + b.consistency + b.frequency -
          (a.exaggeration + a.consistency + a.frequency) ||
        a.quirkId.localeCompare(b.quirkId),
    );
}

function chooseSuppressed(
  a: MouthPhenotypeTrait,
  b: MouthPhenotypeTrait,
  lockedA: boolean,
  lockedB: boolean,
): MouthPhenotypeTrait {
  if (lockedA !== lockedB) return lockedA ? b : a;
  if (a.salience !== b.salience) return a.salience < b.salience ? a : b;

  const pressureDifference =
    MOUTH_PRESSURE_RANK[a.pressure] - MOUTH_PRESSURE_RANK[b.pressure];
  if (pressureDifference !== 0) return pressureDifference < 0 ? a : b;

  return a.traitId.localeCompare(b.traitId) > 0 ? a : b;
}

export function projectMouthPhenotype(genome: MouthGenome): MouthPhenotype {
  const interactions = interactionInstances(genome);
  const rows = assignmentTraitRows(genome);
  const activeQuirks = quirkRows(genome);
  const suppressedByTrait = new Map<string, string>();
  const warnings: string[] = [];

  const assignmentForTrait = (traitId: string) =>
    genome.assignments.find((assignment) => assignment.traitIds.includes(traitId));

  for (const interaction of interactions) {
    const rowA = rows.find((row) => row.traitId === interaction.traitAId);
    const rowB = rows.find((row) => row.traitId === interaction.traitBId);
    if (!rowA || !rowB) continue;

    if (interaction.relationship === 'mutuallyExclusive') {
      if (genome.stability >= 60) {
        const assignmentA = assignmentForTrait(rowA.traitId);
        const assignmentB = assignmentForTrait(rowB.traitId);
        const loser = chooseSuppressed(
          rowA,
          rowB,
          Boolean(assignmentA?.locked),
          Boolean(assignmentB?.locked),
        );
        const winner = loser.traitId === rowA.traitId ? rowB : rowA;
        suppressedByTrait.set(loser.traitId, winner.traitId);
      } else {
        rowA.consistency = Math.min(rowA.consistency, 58);
        rowB.consistency = Math.min(rowB.consistency, 58);
        warnings.push(
          'Low stability keeps mutually exclusive traits ' +
            rowA.traitId +
            ' and ' +
            rowB.traitId +
            ' alive as alternating states.',
        );
      }
    }

    if (interaction.relationship === 'competitive') {
      const penalty = Math.round((interaction.severity * genome.stability) / 45);
      const lower = rowA.salience <= rowB.salience ? rowA : rowB;
      lower.salience = Math.max(10, lower.salience - penalty);
      lower.expectedAudibility = audibilityFor(lower.salience);
    }

    if (interaction.relationship === 'catalytic') {
      rowA.salience = Math.min(100, rowA.salience + 4);
      rowB.salience = Math.min(100, rowB.salience + 4);
      rowA.expectedAudibility = audibilityFor(rowA.salience);
      rowB.expectedAudibility = audibilityFor(rowB.salience);
    }

    if (interaction.relationship === 'unstable') {
      const cap = Math.max(35, 92 - Math.round(genome.mutation * 0.45));
      rowA.consistency = Math.min(rowA.consistency, cap);
      rowB.consistency = Math.min(rowB.consistency, cap);
    }
  }

  const activeTraits = rows
    .filter((row) => !suppressedByTrait.has(row.traitId))
    .sort((a, b) => b.salience - a.salience || a.traitId.localeCompare(b.traitId));

  const suppressedTraits = rows
    .filter((row) => suppressedByTrait.has(row.traitId))
    .map((row) => ({
      ...row,
      suppressedByTraitId: suppressedByTrait.get(row.traitId),
      salience: Math.min(row.salience, 18),
      expectedAudibility: 'subtle' as const,
    }))
    .sort((a, b) => a.traitId.localeCompare(b.traitId));

  for (const row of suppressedTraits) {
    warnings.push(
      row.traitId +
        ' is suppressed by ' +
        row.suppressedByTraitId +
        ' at stability ' +
        genome.stability +
        '.',
    );
  }

  const priorityCandidates = [
    ...activeTraits.map((row) => ({
      id: row.traitId,
      score: row.salience,
    })),
    ...activeQuirks.map((row) => ({
      id: 'quirk:' + row.quirkId,
      score: Math.round(
        row.frequency * 0.28 +
        row.consistency * 0.34 +
        row.exaggeration * 0.38,
      ),
    })),
  ];

  const audiblePriority = priorityCandidates
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 5)
    .map((row) => row.id);

  const anchor = genome.semanticAnchorLanguageProfileId
    ? ' Semantic anchor: ' + genome.semanticAnchorLanguageProfileId + '.'
    : '';

  const summary =
    'Expected phenotype: ' +
    activeTraits.length +
    ' active traits and ' +
    activeQuirks.length +
    ' active quirks across ' +
    new Set([
      ...activeTraits.map((row) => row.axis),
      ...activeQuirks.map((row) => row.axis),
    ]).size +
    ' mouth jurisdictions; intelligibility ' +
    genome.intelligibility +
    '/100, stability ' +
    genome.stability +
    '/100, mutation ' +
    genome.mutation +
    '/100.' +
    anchor;

  return {
    genomeId: genome.id,
    activeTraits,
    suppressedTraits,
    activeQuirks,
    interactions,
    audiblePriority,
    summary,
    warnings,
  };
}
