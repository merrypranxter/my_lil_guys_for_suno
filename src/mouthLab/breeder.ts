import {
  MouthAxis,
  MouthBreedingObjective,
  MouthBreedingRequest,
  MouthBreedingResult,
  MouthDonor,
  MouthJurisdictionAssignment,
  MouthManualAssignment,
  MouthTrait,
  MouthTraitPressure,
} from './types';
import { MOUTH_DONORS, getMouthDonor } from './donors';
import { MOUTH_TRAITS, getMouthTrait } from './traits';
import {
  MOUTH_BREEDING_OBJECTIVE_BY_ID,
  MOUTH_BREEDING_OBJECTIVES,
} from './objectives';
import { getMouthTraitRelationship } from './conflictMatrix';
import {
  clampMouthControl,
  hashMouthString,
  makeMouthRng,
  MOUTH_PRESSURE_RANK,
  pressureFromRank,
  stableStringify,
} from './determinism';
import { projectMouthPhenotype } from './phenotype';

interface Candidate {
  donor: MouthDonor;
  trait: MouthTrait;
  axis: MouthAxis;
  score: number;
}

function uniqueParentIds(ids: string[]): string[] {
  return Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean))).sort();
}

function objectiveFor(id?: string): MouthBreedingObjective {
  if (id) {
    const found = MOUTH_BREEDING_OBJECTIVE_BY_ID.get(id);
    if (!found) throw new Error('Unknown Mouth Lab breeding objective: ' + id);
    return found;
  }

  return MOUTH_BREEDING_OBJECTIVES[0];
}

function pressureForTrait(
  trait: MouthTrait,
  objective: MouthBreedingObjective,
): MouthTraitPressure {
  let rank = MOUTH_PRESSURE_RANK[trait.defaultPressure];

  const preferredMatches = trait.tags.filter((tag) =>
    objective.preferredTraitTags.includes(tag),
  ).length;
  const discouragedMatches = trait.tags.filter((tag) =>
    objective.discouragedTraitTags?.includes(tag),
  ).length;

  if (preferredMatches >= 2) rank += 1;
  if (discouragedMatches > 0) rank -= 1;

  if (
    objective.id === 'mouth-objective-pathological-consistency' &&
    trait.tags.includes('micro-mutation')
  ) {
    rank = 4;
  }

  return pressureFromRank(Math.max(1, Math.min(4, rank)));
}

function manualAssignmentKey(assignment: MouthManualAssignment): string {
  return [
    assignment.axis,
    assignment.donorId,
    [...assignment.traitIds].sort().join(','),
    assignment.pressure || '',
  ].join('|');
}

function validateManualAssignments(
  manualAssignments: MouthManualAssignment[],
  parentIds: Set<string>,
): MouthJurisdictionAssignment[] {
  const seen = new Set<string>();
  const out: MouthJurisdictionAssignment[] = [];

  for (const manual of [...manualAssignments].sort((a, b) =>
    manualAssignmentKey(a).localeCompare(manualAssignmentKey(b)),
  )) {
    const donor = getMouthDonor(manual.donorId);
    if (!donor) throw new Error('Unknown manual Mouth Lab donor: ' + manual.donorId);
    if (!parentIds.has(donor.id)) {
      throw new Error('Manual donor must be one of the selected parents: ' + donor.id);
    }
    if (!manual.traitIds.length) {
      throw new Error('Manual mouth assignment needs at least one trait: ' + donor.id);
    }

    const traitIds = Array.from(new Set(manual.traitIds)).sort();
    const key = manual.axis + '|' + donor.id + '|' + traitIds.join(',');
    if (seen.has(key)) continue;
    seen.add(key);

    for (const traitId of traitIds) {
      const trait = getMouthTrait(traitId);
      if (!trait) throw new Error('Unknown manual Mouth Lab trait: ' + traitId);
      if (!donor.traitIds.includes(traitId)) {
        throw new Error(
          'Trait ' + traitId + ' is not registered to donor ' + donor.id,
        );
      }
      if (!trait.axes.includes(manual.axis)) {
        throw new Error(
          'Trait ' +
            traitId +
            ' cannot own manual axis ' +
            manual.axis +
            '; valid axes: ' +
            trait.axes.join(', '),
        );
      }
    }

    out.push({
      axis: manual.axis,
      donorId: donor.id,
      traitIds,
      pressure:
        manual.pressure ||
        pressureForTrait(getMouthTrait(traitIds[0])!, MOUTH_BREEDING_OBJECTIVES[0]),
      locked: true,
    });
  }

  return out;
}

function selectedTraitIds(assignments: MouthJurisdictionAssignment[]): Set<string> {
  return new Set(assignments.flatMap((assignment) => assignment.traitIds));
}

function usedAxes(assignments: MouthJurisdictionAssignment[]): Set<MouthAxis> {
  return new Set(assignments.map((assignment) => assignment.axis));
}

function chooseAxis(
  trait: MouthTrait,
  donor: MouthDonor,
  assignments: MouthJurisdictionAssignment[],
  objective: MouthBreedingObjective,
  rng: () => number,
): MouthAxis {
  const existingAxes = usedAxes(assignments);

  const scored = trait.axes.map((axis) => {
    let score = 0;
    if (donor.preferredAxes.includes(axis)) score += 5;

    const occupied = existingAxes.has(axis);
    if (objective.relationshipBias === 'conflict') {
      score += occupied ? 4 : 1;
    } else {
      score += occupied ? -5 : 4;
    }

    if (axis === 'semantics' || axis === 'lexicon') score -= 3;

    return { axis, score: score + rng() * 0.25 };
  });

  return scored.sort((a, b) => b.score - a.score)[0].axis;
}

function relationshipBiasScore(
  objective: MouthBreedingObjective,
  candidateTraitId: string,
  assignments: MouthJurisdictionAssignment[],
): number {
  const active = assignments.flatMap((assignment) => assignment.traitIds);
  if (!active.length) return 0;

  let score = 0;
  for (const activeId of active) {
    const relation = getMouthTraitRelationship(candidateTraitId, activeId);
    if (!relation) continue;

    if (objective.relationshipBias === 'cooperative') {
      if (relation.relationship === 'cooperative') score += 5;
      if (relation.relationship === 'catalytic') score += 3;
      if (relation.relationship === 'mutuallyExclusive') score -= 7;
    }

    if (objective.relationshipBias === 'catalytic') {
      if (relation.relationship === 'catalytic') score += 7;
      if (relation.relationship === 'cooperative') score += 2;
    }

    if (objective.relationshipBias === 'orthogonal') {
      if (relation.relationship === 'orthogonal') score += 5;
      if (relation.relationship === 'mutuallyExclusive') score -= 6;
    }

    if (objective.relationshipBias === 'conflict') {
      if (relation.relationship === 'competitive') score += 6;
      if (relation.relationship === 'mutuallyExclusive') score += 7;
      if (relation.relationship === 'unstable') score += 5;
      if (relation.relationship === 'orthogonal') score -= 2;
    }

    if (objective.relationshipBias === 'balanced') {
      if (relation.relationship === 'catalytic') score += 2;
      if (relation.relationship === 'mutuallyExclusive') score -= 2;
    }
  }

  return score;
}

function candidateScore(
  donor: MouthDonor,
  trait: MouthTrait,
  axis: MouthAxis,
  assignments: MouthJurisdictionAssignment[],
  objective: MouthBreedingObjective,
  rng: () => number,
): number {
  let score = 0;

  score +=
    trait.tags.filter((tag) => objective.preferredTraitTags.includes(tag)).length *
    7;
  score -=
    trait.tags.filter((tag) => objective.discouragedTraitTags?.includes(tag))
      .length * 7;

  if (donor.preferredAxes.includes(axis)) score += 3;
  if (!usedAxes(assignments).has(axis)) score += 3;

  score += relationshipBiasScore(objective, trait.id, assignments);

  if (trait.confidence === 'high') score += 2;
  if (trait.confidence === 'provisional') score -= 2;

  if (
    objective.id === 'mouth-objective-pathological-consistency' &&
    trait.tags.includes('micro-mutation')
  ) {
    score += 14;
  }

  return score + rng() * 0.5;
}

function candidateForDonor(
  donor: MouthDonor,
  assignments: MouthJurisdictionAssignment[],
  objective: MouthBreedingObjective,
  rng: () => number,
): Candidate | undefined {
  const selected = selectedTraitIds(assignments);

  const candidates = donor.traitIds
    .filter((traitId) => !selected.has(traitId))
    .map((traitId) => getMouthTrait(traitId))
    .filter((trait): trait is MouthTrait => Boolean(trait))
    .map((trait) => {
      const axis = chooseAxis(trait, donor, assignments, objective, rng);
      return {
        donor,
        trait,
        axis,
        score: candidateScore(donor, trait, axis, assignments, objective, rng),
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.trait.id.localeCompare(b.trait.id) ||
        a.axis.localeCompare(b.axis),
    );

  return candidates[0];
}

function allCandidates(
  donors: MouthDonor[],
  assignments: MouthJurisdictionAssignment[],
  objective: MouthBreedingObjective,
  rng: () => number,
): Candidate[] {
  const selected = selectedTraitIds(assignments);

  return donors
    .flatMap((donor) =>
      donor.traitIds
        .filter((traitId) => !selected.has(traitId))
        .map((traitId) => getMouthTrait(traitId))
        .filter((trait): trait is MouthTrait => Boolean(trait))
        .map((trait) => {
          const axis = chooseAxis(trait, donor, assignments, objective, rng);
          return {
            donor,
            trait,
            axis,
            score: candidateScore(donor, trait, axis, assignments, objective, rng),
          };
        }),
    )
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.donor.id.localeCompare(b.donor.id) ||
        a.trait.id.localeCompare(b.trait.id),
    );
}

function addCandidate(
  candidate: Candidate,
  assignments: MouthJurisdictionAssignment[],
  objective: MouthBreedingObjective,
): void {
  assignments.push({
    axis: candidate.axis,
    donorId: candidate.donor.id,
    traitIds: [candidate.trait.id],
    pressure: pressureForTrait(candidate.trait, objective),
    locked: false,
  });
}

function setPathologicalConsistency(
  assignments: MouthJurisdictionAssignment[],
  objective: MouthBreedingObjective,
): void {
  if (objective.id !== 'mouth-objective-pathological-consistency') return;

  const candidates = assignments
    .flatMap((assignment) =>
      assignment.traitIds.map((traitId) => ({
        assignment,
        trait: getMouthTrait(traitId),
      })),
    )
    .filter(
      (entry): entry is { assignment: MouthJurisdictionAssignment; trait: MouthTrait } =>
        Boolean(entry.trait),
    )
    .sort((a, b) => {
      const aMicro = a.trait.tags.includes('micro-mutation') ? 1 : 0;
      const bMicro = b.trait.tags.includes('micro-mutation') ? 1 : 0;
      if (aMicro !== bMicro) return bMicro - aMicro;
      return a.trait.id.localeCompare(b.trait.id);
    });

  if (!candidates.length) return;

  const winner = candidates[0].assignment;
  if (!winner.locked) winner.pressure = 'obsessive';

  for (const entry of candidates.slice(1)) {
    if (!entry.assignment.locked && entry.assignment.pressure === 'obsessive') {
      entry.assignment.pressure = 'medium';
    }
  }
}

function canonicalAssignments(
  assignments: MouthJurisdictionAssignment[],
): MouthJurisdictionAssignment[] {
  return [...assignments].sort((a, b) => {
    return (
      a.axis.localeCompare(b.axis) ||
      (a.donorId || '').localeCompare(b.donorId || '') ||
      a.traitIds.join(',').localeCompare(b.traitIds.join(','))
    );
  });
}

function generatedName(donors: MouthDonor[], hash: string): string {
  const names = donors.map((donor) => donor.name);
  if (names.length <= 3) return names.join(' × ') + ' MOUTH';
  return names.slice(0, 2).join(' × ') + ' + ' + (names.length - 2) + ' MORE / ' + hash.toUpperCase();
}

function contributorSet(assignments: MouthJurisdictionAssignment[]): Set<string> {
  return new Set(
    assignments
      .map((assignment) => assignment.donorId)
      .filter((id): id is string => Boolean(id)),
  );
}

export function breedMouthGenome(request: MouthBreedingRequest): MouthBreedingResult {
  const parentDonorIds = uniqueParentIds(request.parentDonorIds);

  if (parentDonorIds.length < 2 || parentDonorIds.length > 6) {
    throw new Error('Mouth Lab breeding requires 2–6 distinct parent donors.');
  }

  const donors = parentDonorIds.map((id) => {
    const donor = getMouthDonor(id);
    if (!donor) throw new Error('Unknown Mouth Lab parent donor: ' + id);
    return donor;
  });

  const objective = objectiveFor(request.objectiveId);
  const intelligibility = clampMouthControl(
    request.intelligibility,
    objective.preserveIntelligibilityByDefault ? 82 : 58,
  );
  const stability = clampMouthControl(request.stability, 72);
  const mutation = clampMouthControl(request.mutation, 35);
  const breedingSeed = request.breedingSeed.trim() || 'default-mouth-seed';

  const manualAssignments = validateManualAssignments(
    request.manualAssignments || [],
    new Set(parentDonorIds),
  );

  const canonicalRequest = {
    parentDonorIds,
    objectiveId: objective.id,
    semanticAnchorLanguageProfileId:
      request.semanticAnchorLanguageProfileId ||
      (objective.preserveIntelligibilityByDefault ? 'lang-english' : undefined),
    intelligibility,
    stability,
    mutation,
    breedingSeed,
    manualAssignments,
  };

  const seedText = stableStringify(canonicalRequest);
  const rng = makeMouthRng(seedText);
  const assignments: MouthJurisdictionAssignment[] = [...manualAssignments];
  const warnings: string[] = [];

  const semanticAnchorLanguageProfileId =
    canonicalRequest.semanticAnchorLanguageProfileId;

  if (
    semanticAnchorLanguageProfileId &&
    !assignments.some((assignment) => assignment.axis === 'semantics')
  ) {
    const anchorDonor = donors.find(
      (donor) => donor.languageProfileId === semanticAnchorLanguageProfileId,
    );

    assignments.push({
      axis: 'semantics',
      donorId: anchorDonor?.id,
      traitIds: [],
      pressure: 'high',
      locked: true,
    });
  }

  for (const donor of donors) {
    if (assignments.some((assignment) => assignment.donorId === donor.id)) continue;
    const candidate = candidateForDonor(donor, assignments, objective, rng);
    if (candidate) addCandidate(candidate, assignments, objective);
  }

  const automaticTraitCount = assignments.reduce(
    (count, assignment) => count + assignment.traitIds.length,
    0,
  );
  const extraTarget =
    Math.min(8, Math.max(automaticTraitCount, parentDonorIds.length + (rng() < 0.65 ? 1 : 2)));

  while (
    assignments.reduce((count, assignment) => count + assignment.traitIds.length, 0) <
    extraTarget
  ) {
    const candidates = allCandidates(donors, assignments, objective, rng);
    if (!candidates.length) break;
    addCandidate(candidates[0], assignments, objective);
  }

  setPathologicalConsistency(assignments, objective);

  const orderedAssignments = canonicalAssignments(assignments);
  const contributors = contributorSet(orderedAssignments);
  const excludedParentDonorIds = parentDonorIds.filter(
    (donorId) => !contributors.has(donorId),
  );

  for (const donorId of excludedParentDonorIds) {
    const donor = getMouthDonor(donorId);
    warnings.push(
      (donor?.name || donorId) +
        ' contributed no unique viable jurisdiction to this offspring. It remains a selected parent but has no active gene in the current genotype.',
    );
  }

  const genotypeSignature = stableStringify({
    ...canonicalRequest,
    assignments: orderedAssignments,
  });
  const hash = hashMouthString(genotypeSignature).toString(36);

  const genome = {
    id: 'mouth_' + hash,
    name: request.requestedName?.trim() || generatedName(donors, hash),
    parentDonorIds,
    assignments: orderedAssignments,
    objectiveId: objective.id,
    semanticAnchorLanguageProfileId,
    intelligibility,
    stability,
    mutation,
    breedingSeed,
    createdAt: Date.now(),
  };

  const phenotype = projectMouthPhenotype(genome);

  return {
    genome,
    phenotype,
    excludedParentDonorIds,
    warnings: [...warnings, ...phenotype.warnings],
  };
}

export function findMouthDonorsForObjective(objectiveId: string): MouthDonor[] {
  const objective = objectiveFor(objectiveId);

  return MOUTH_DONORS
    .map((donor) => {
      const score = donor.traitIds.reduce((total, traitId) => {
        const trait = getMouthTrait(traitId);
        if (!trait) return total;
        const preferred = trait.tags.filter((tag) =>
          objective.preferredTraitTags.includes(tag),
        ).length;
        const discouraged = trait.tags.filter((tag) =>
          objective.discouragedTraitTags?.includes(tag),
        ).length;
        return total + preferred * 5 - discouraged * 5;
      }, 0);
      return { donor, score };
    })
    .sort((a, b) => b.score - a.score || a.donor.name.localeCompare(b.donor.name))
    .map((entry) => entry.donor);
}

export function describeMouthGenome(result: MouthBreedingResult): string {
  const assignmentLines = result.genome.assignments.map((assignment) => {
    const donor = assignment.donorId ? getMouthDonor(assignment.donorId)?.name : undefined;
    const traits = assignment.traitIds
      .map((id) => getMouthTrait(id)?.name || id)
      .join(', ');
    return (
      assignment.axis.toUpperCase() +
      ' ← ' +
      (donor || result.genome.semanticAnchorLanguageProfileId || 'UNASSIGNED') +
      (traits ? ' :: ' + traits : '') +
      ' [' +
      assignment.pressure.toUpperCase() +
      ']'
    );
  });

  return [
    result.genome.name,
    'seed: ' + result.genome.breedingSeed,
    ...assignmentLines,
    result.phenotype.summary,
  ].join('\n');
}
