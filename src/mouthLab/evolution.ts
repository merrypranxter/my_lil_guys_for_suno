import {
  MouthEvolutionRequest,
  MouthEvolutionResult,
  MouthFitnessRecord,
  MouthGenome,
  MouthJurisdictionAssignment,
  MouthQuirkInstance,
  MouthSpeciesLineage,
  MouthSpecimen,
  MouthTraitPressure,
} from './types';
import { getMouthDonor, MOUTH_DONORS } from './donors';
import { getMouthTrait } from './traits';
import {
  getMouthQuirkDefinition,
  instantiateMouthQuirk,
  reidentifyMouthGenome,
} from './quirks';
import {
  clampMouthControl,
  hashMouthString,
  makeMouthRng,
  MOUTH_PRESSURE_RANK,
  pressureFromRank,
  stableStringify,
} from './determinism';
import { projectMouthPhenotype } from './phenotype';
import { normalizeMouthDynamics } from './dynamics';

interface TraitCandidate {
  key: string;
  traitId: string;
  assignment: MouthJurisdictionAssignment;
  parentIds: string[];
  score: number;
  noveltyPenalty: number;
}

interface QuirkCandidate {
  quirkId: string;
  instances: MouthQuirkInstance[];
  parentIds: string[];
  score: number;
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function pressureRank(pressure: MouthTraitPressure): number {
  return MOUTH_PRESSURE_RANK[pressure] || 2;
}

function hasDynamics(genome: MouthGenome): boolean {
  const d = genome.dynamics;
  return Boolean(
    d &&
      (d.castProfiles.length ||
        d.expressionRules.length ||
        d.mutationCurves.length ||
        d.timeline.length ||
        d.transductions.length),
  );
}

function activeTraitIds(genome: MouthGenome): string[] {
  return unique(genome.assignments.flatMap((assignment) => assignment.traitIds)).sort();
}

function activeQuirkIds(genome: MouthGenome): string[] {
  return unique(
    genome.quirks.filter((quirk) => quirk.enabled).map((quirk) => quirk.quirkId),
  ).sort();
}

function canonicalDynamics(genome: MouthGenome) {
  const dynamics = normalizeMouthDynamics(genome.dynamics);
  return {
    castProfiles: dynamics.castProfiles.map((profile) => ({
      role: profile.role,
      assignments: profile.assignments.map((assignment) => ({
        axis: assignment.axis,
        donorId: assignment.donorId || '',
        traitIds: [...assignment.traitIds].sort(),
        pressure: assignment.pressure,
      })),
      quirkIds: profile.quirks.filter((quirk) => quirk.enabled).map((quirk) => quirk.quirkId).sort(),
    })),
    expressionRules: dynamics.expressionRules.map((rule) => ({
      targetType: rule.targetType,
      targetId: rule.targetId,
      state: rule.state,
      strength: rule.strength,
      trigger: rule.trigger || '',
      castRole: rule.castRole || '',
    })),
    mutationCurves: dynamics.mutationCurves.map((curve) => ({
      targetType: curve.targetType,
      targetId: curve.targetId,
      startPercent: curve.startPercent,
      endPercent: curve.endPercent,
      startStrength: curve.startStrength,
      endStrength: curve.endStrength,
      shape: curve.shape,
      castRole: curve.castRole || '',
    })),
    timeline: dynamics.timeline.map((event) => ({
      positionPercent: event.positionPercent,
      sectionLabel: event.sectionLabel || '',
      trigger: event.trigger || '',
      action: event.action,
      targetType: event.targetType || '',
      targetId: event.targetId || '',
      sourceCastRole: event.sourceCastRole || '',
      targetCastRole: event.targetCastRole || '',
      amount: event.amount,
    })),
    transductions: dynamics.transductions.map((rule) => ({
      direction: rule.direction,
      source: rule.source,
      target: rule.target,
      mapping: rule.mapping,
      strength: rule.strength,
      castRole: rule.castRole || '',
      trigger: rule.trigger || '',
    })),
  };
}

export function mouthGenomePhenotypeSignature(genome: MouthGenome): string {
  const signature = stableStringify({
    assignments: genome.assignments
      .map((assignment) => ({
        axis: assignment.axis,
        donorId: assignment.donorId || '',
        traitIds: [...assignment.traitIds].sort(),
        pressure: assignment.pressure,
      }))
      .sort((a, b) =>
        a.axis.localeCompare(b.axis) ||
        a.donorId.localeCompare(b.donorId) ||
        a.traitIds.join(',').localeCompare(b.traitIds.join(',')),
      ),
    quirks: genome.quirks
      .filter((quirk) => quirk.enabled)
      .map((quirk) => ({
        quirkId: quirk.quirkId,
        frequency: quirk.frequency,
        consistency: quirk.consistency,
        exaggeration: quirk.exaggeration,
        takeover: quirk.takeover,
      }))
      .sort((a, b) => a.quirkId.localeCompare(b.quirkId)),
    dynamics: canonicalDynamics(genome),
    semanticAnchorLanguageProfileId: genome.semanticAnchorLanguageProfileId || '',
    intelligibility: genome.intelligibility,
    stability: genome.stability,
  });

  return 'mouth_pheno_' + hashMouthString(signature).toString(36);
}

export function normalizeMouthFitnessRecord(value: unknown): MouthFitnessRecord | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as any;
  const signature =
    typeof raw.phenotypeSignature === 'string'
      ? raw.phenotypeSignature.trim().slice(0, 180)
      : '';
  if (!signature) return undefined;

  const validTraits = (items: unknown) =>
    unique(
      (Array.isArray(items) ? items : [])
        .map((id: unknown) => String(id))
        .filter((id: string) => Boolean(getMouthTrait(id))),
    ).slice(0, 40);

  const validQuirks = (items: unknown) =>
    unique(
      (Array.isArray(items) ? items : [])
        .map((id: unknown) => String(id))
        .filter((id: string) => Boolean(getMouthQuirkDefinition(id))),
    ).slice(0, 40);

  const now = Date.now();
  return {
    phenotypeSignature: signature,
    genomeIds: unique(
      (Array.isArray(raw.genomeIds) ? raw.genomeIds : [])
        .map((id: unknown) => String(id).trim())
        .filter(Boolean),
    ).slice(0, 60),
    approved: raw.approved !== false,
    approvalCount: Math.max(
      1,
      Math.min(
        999,
        Number.isFinite(Number(raw.approvalCount))
          ? Math.round(Number(raw.approvalCount))
          : 1,
      ),
    ),
    likedTraitIds: validTraits(raw.likedTraitIds),
    dislikedTraitIds: validTraits(raw.dislikedTraitIds),
    likedQuirkIds: validQuirks(raw.likedQuirkIds),
    dislikedQuirkIds: validQuirks(raw.dislikedQuirkIds),
    sourceRunIds: unique(
      (Array.isArray(raw.sourceRunIds) ? raw.sourceRunIds : [])
        .map((id: unknown) => String(id).trim())
        .filter(Boolean),
    ).slice(0, 100),
    note: typeof raw.note === 'string' ? raw.note.slice(0, 1600) : '',
    createdAt: Number.isFinite(Number(raw.createdAt)) ? Number(raw.createdAt) : now,
    updatedAt: Number.isFinite(Number(raw.updatedAt)) ? Number(raw.updatedAt) : now,
  };
}

function fitnessMaps(records: MouthFitnessRecord[]) {
  const trait = new Map<string, number>();
  const quirk = new Map<string, number>();

  for (const raw of records) {
    const record = normalizeMouthFitnessRecord(raw);
    if (!record) continue;
    const approval = Math.min(3, Math.max(1, record.approvalCount));

    for (const id of record.likedTraitIds) {
      trait.set(id, (trait.get(id) || 0) + 3 + approval);
    }
    for (const id of record.dislikedTraitIds) {
      trait.set(id, (trait.get(id) || 0) - 5 - approval);
    }
    for (const id of record.likedQuirkIds) {
      quirk.set(id, (quirk.get(id) || 0) + 3 + approval);
    }
    for (const id of record.dislikedQuirkIds) {
      quirk.set(id, (quirk.get(id) || 0) - 5 - approval);
    }
  }

  return { trait, quirk };
}

export function mouthTraitSaturation(
  recentGenomes: MouthGenome[],
): Record<string, number> {
  const recent = recentGenomes.slice(0, 12);
  if (!recent.length) return {};

  const counts = new Map<string, number>();
  for (const genome of recent) {
    for (const traitId of activeTraitIds(genome)) {
      counts.set(traitId, (counts.get(traitId) || 0) + 1);
    }
  }

  return Object.fromEntries(
    [...counts.entries()].map(([traitId, count]) => [
      traitId,
      Math.round((count / recent.length) * 1000) / 1000,
    ]),
  );
}

export function buildMouthNoveltySignals(
  recentGenomes: MouthGenome[],
  limit = 8,
): string[] {
  const saturation = mouthTraitSaturation(recentGenomes);
  return Object.entries(saturation)
    .filter(([, ratio]) => ratio >= 0.5)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([traitId, ratio]) => {
      const name = getMouthTrait(traitId)?.name || traitId;
      return (
        'MOUTH COOLDOWN — ' +
        name +
        ' appeared in ' +
        Math.round(ratio * 100) +
        '% of recent saved/evolved species. Prefer a different mouth mechanism unless this trait is explicitly locked or specifically liked.'
      );
    });
}

function assignmentCandidates(
  parentA: MouthGenome,
  parentB: MouthGenome,
  fitnessRecords: MouthFitnessRecord[],
  recentGenomes: MouthGenome[],
  specimens: MouthSpecimen[],
  rng: () => number,
): TraitCandidate[] {
  const fitness = fitnessMaps(fitnessRecords).trait;
  const saturation = mouthTraitSaturation(recentGenomes);
  const specimenTraits = new Set(specimens.flatMap((specimen) => specimen.linkedTraitIds));
  const map = new Map<string, TraitCandidate>();

  const addFromParent = (parent: MouthGenome) => {
    for (const assignment of parent.assignments) {
      if (assignment.axis === 'semantics') continue;
      for (const traitId of assignment.traitIds) {
        const trait = getMouthTrait(traitId);
        if (!trait) continue;
        const key = assignment.axis + '|' + (assignment.donorId || '') + '|' + traitId;
        const existing = map.get(key);
        const noveltyPenalty = Math.round((saturation[traitId] || 0) * 12);
        const score =
          pressureRank(assignment.pressure) * 4 +
          (fitness.get(traitId) || 0) +
          (specimenTraits.has(traitId) ? 6 : 0) -
          noveltyPenalty +
          rng() * 1.5;

        if (existing) {
          existing.parentIds = unique([...existing.parentIds, parent.id]);
          existing.score = Math.max(existing.score, score) + 2;
          if (pressureRank(assignment.pressure) > pressureRank(existing.assignment.pressure)) {
            existing.assignment = {
              ...assignment,
              traitIds: [traitId],
            };
          }
        } else {
          map.set(key, {
            key,
            traitId,
            assignment: {
              ...assignment,
              traitIds: [traitId],
            },
            parentIds: [parent.id],
            score,
            noveltyPenalty,
          });
        }
      }
    }
  };

  addFromParent(parentA);
  addFromParent(parentB);

  return [...map.values()].sort(
    (a, b) =>
      b.score - a.score ||
      a.key.localeCompare(b.key),
  );
}

function canUseCandidate(
  candidate: TraitCandidate,
  assignments: MouthJurisdictionAssignment[],
): boolean {
  if (assignments.some((assignment) => assignment.traitIds.includes(candidate.traitId))) {
    return false;
  }

  const donorIds = new Set(
    assignments
      .map((assignment) => assignment.donorId)
      .filter((id): id is string => Boolean(id)),
  );
  if (candidate.assignment.donorId && !donorIds.has(candidate.assignment.donorId) && donorIds.size >= 6) {
    return false;
  }

  return true;
}

function chooseTraitAssignments(
  parentA: MouthGenome,
  parentB: MouthGenome,
  request: MouthEvolutionRequest,
  rng: () => number,
): {
  assignments: MouthJurisdictionAssignment[];
  inheritedByParent: Record<string, string[]>;
  noveltyPenaltyTraitIds: string[];
} {
  const candidates = assignmentCandidates(
    parentA,
    parentB,
    request.fitnessRecords || [],
    request.recentGenomes || [],
    request.specimenAssist || [],
    rng,
  );

  const countA = activeTraitIds(parentA).length;
  const countB = activeTraitIds(parentB).length;
  const targetCount = Math.max(
    2,
    Math.min(8, Math.round((countA + countB) / 2)),
  );

  const assignments: MouthJurisdictionAssignment[] = [];
  const inheritedByParent: Record<string, string[]> = {
    [parentA.id]: [],
    [parentB.id]: [],
  };
  const noveltyPenaltyTraitIds: string[] = [];

  for (const parent of [parentA, parentB]) {
    const best = candidates.find(
      (candidate) =>
        candidate.parentIds.includes(parent.id) &&
        canUseCandidate(candidate, assignments),
    );
    if (!best) continue;
    assignments.push({ ...best.assignment, traitIds: [best.traitId] });
    inheritedByParent[parent.id].push(best.traitId);
    if (best.noveltyPenalty >= 6) noveltyPenaltyTraitIds.push(best.traitId);
  }

  for (const candidate of candidates) {
    if (assignments.length >= targetCount) break;
    if (!canUseCandidate(candidate, assignments)) continue;

    assignments.push({ ...candidate.assignment, traitIds: [candidate.traitId] });
    for (const parentId of candidate.parentIds) {
      if (inheritedByParent[parentId] && !inheritedByParent[parentId].includes(candidate.traitId)) {
        inheritedByParent[parentId].push(candidate.traitId);
      }
    }
    if (candidate.noveltyPenalty >= 6) noveltyPenaltyTraitIds.push(candidate.traitId);
  }

  return {
    assignments,
    inheritedByParent,
    noveltyPenaltyTraitIds: unique(noveltyPenaltyTraitIds).sort(),
  };
}

function donorForSpecimenTrait(
  traitId: string,
  parentA: MouthGenome,
  parentB: MouthGenome,
) {
  for (const parent of [parentA, parentB]) {
    const assignment = parent.assignments.find((item) => item.traitIds.includes(traitId));
    if (assignment?.donorId) return getMouthDonor(assignment.donorId);
  }

  const trait = getMouthTrait(traitId);
  if (!trait) return undefined;
  const donor = MOUTH_DONORS.find((item) =>
    trait.donorProfileIds.includes(item.languageProfileId),
  );
  return donor;
}

function maybeAddSpecimenMutation(
  assignments: MouthJurisdictionAssignment[],
  request: MouthEvolutionRequest,
  rng: () => number,
): string[] {
  const specimens = request.specimenAssist || [];
  if (!specimens.length) return [];

  const mutationChance = clampMouthControl(
    request.mutationChance,
    Math.round((request.parentA.mutation + request.parentB.mutation) / 2),
  ) / 100;
  if (rng() > Math.min(0.7, mutationChance)) return [];

  const existing = new Set(assignments.flatMap((assignment) => assignment.traitIds));
  const candidates = unique(specimens.flatMap((specimen) => specimen.linkedTraitIds))
    .filter((traitId) => !existing.has(traitId) && Boolean(getMouthTrait(traitId)))
    .sort();

  if (!candidates.length) return [];
  const traitId = candidates[Math.floor(rng() * candidates.length)];
  const trait = getMouthTrait(traitId);
  const donor = donorForSpecimenTrait(traitId, request.parentA, request.parentB);
  if (!trait || !donor) return [];

  const donorIds = new Set(
    assignments.map((assignment) => assignment.donorId).filter((id): id is string => Boolean(id)),
  );
  if (!donorIds.has(donor.id) && donorIds.size >= 6) return [];

  const axis = trait.axes.find((candidate) =>
    !assignments.some((assignment) => assignment.axis === candidate),
  ) || trait.axes[0];

  assignments.push({
    axis,
    donorId: donor.id,
    traitIds: [traitId],
    pressure: trait.defaultPressure,
    locked: false,
  });

  return [traitId];
}

function chooseQuirks(
  parentA: MouthGenome,
  parentB: MouthGenome,
  request: MouthEvolutionRequest,
  rng: () => number,
): {
  quirks: MouthQuirkInstance[];
  inheritedByParent: Record<string, string[]>;
  mutationQuirkIds: string[];
} {
  const fitness = fitnessMaps(request.fitnessRecords || []).quirk;
  const specimenQuirks = new Set(
    (request.specimenAssist || []).flatMap((specimen) => specimen.quirkIds),
  );
  const map = new Map<string, QuirkCandidate>();

  for (const parent of [parentA, parentB]) {
    for (const instance of parent.quirks.filter((quirk) => quirk.enabled)) {
      if (!getMouthQuirkDefinition(instance.quirkId)) continue;
      const existing = map.get(instance.quirkId);
      const score =
        (fitness.get(instance.quirkId) || 0) +
        (specimenQuirks.has(instance.quirkId) ? 6 : 0) +
        instance.consistency / 20 +
        instance.frequency / 30 +
        rng();
      if (existing) {
        existing.parentIds = unique([...existing.parentIds, parent.id]);
        existing.instances.push(instance);
        existing.score = Math.max(existing.score, score) + 2;
      } else {
        map.set(instance.quirkId, {
          quirkId: instance.quirkId,
          instances: [instance],
          parentIds: [parent.id],
          score,
        });
      }
    }
  }

  const candidates = [...map.values()].sort(
    (a, b) => b.score - a.score || a.quirkId.localeCompare(b.quirkId),
  );
  const targetCount = Math.min(
    3,
    Math.round((activeQuirkIds(parentA).length + activeQuirkIds(parentB).length) / 2),
  );

  const chosen: MouthQuirkInstance[] = [];
  const inheritedByParent: Record<string, string[]> = {
    [parentA.id]: [],
    [parentB.id]: [],
  };

  for (const candidate of candidates.slice(0, targetCount)) {
    const source = [...candidate.instances].sort(
      (a, b) =>
        b.consistency - a.consistency ||
        b.frequency - a.frequency ||
        a.quirkId.localeCompare(b.quirkId),
    )[0];
    chosen.push(
      instantiateMouthQuirk(
        candidate.quirkId,
        {
          frequency: source.frequency,
          consistency: source.consistency,
          exaggeration: source.exaggeration,
          takeover: source.takeover,
          trigger: source.trigger,
          linkedTraitIds: source.linkedTraitIds,
        },
        request.breedingSeed + ':quirk:' + candidate.quirkId,
      ),
    );
    for (const parentId of candidate.parentIds) {
      inheritedByParent[parentId]?.push(candidate.quirkId);
    }
  }

  const mutationChance = clampMouthControl(
    request.mutationChance,
    Math.round((parentA.mutation + parentB.mutation) / 2),
  ) / 100;
  const novelSpecimenQuirks = unique([...specimenQuirks])
    .filter(
      (quirkId) =>
        !chosen.some((item) => item.quirkId === quirkId) &&
        Boolean(getMouthQuirkDefinition(quirkId)),
    )
    .sort();

  const mutationQuirkIds: string[] = [];
  if (novelSpecimenQuirks.length && chosen.length < 3 && rng() < Math.min(0.55, mutationChance)) {
    const quirkId = novelSpecimenQuirks[Math.floor(rng() * novelSpecimenQuirks.length)];
    const definition = getMouthQuirkDefinition(quirkId)!;
    chosen.push(
      instantiateMouthQuirk(
        quirkId,
        {
          frequency: Math.max(definition.defaultFrequency, 62),
          consistency: Math.max(definition.defaultConsistency, 68),
          exaggeration: definition.defaultExaggeration,
        },
        request.breedingSeed + ':specimen-mutation:' + quirkId,
      ),
    );
    mutationQuirkIds.push(quirkId);
  }

  return {
    quirks: chosen,
    inheritedByParent,
    mutationQuirkIds,
  };
}

function mergedDynamics(
  parentA: MouthGenome,
  parentB: MouthGenome,
  chance: number,
  rng: () => number,
) {
  if (rng() > chance) return undefined;

  const a = normalizeMouthDynamics(parentA.dynamics);
  const b = normalizeMouthDynamics(parentB.dynamics);
  if (!hasDynamics(parentA) && !hasDynamics(parentB)) return undefined;

  const castProfiles = [...a.castProfiles, ...b.castProfiles]
    .sort(() => rng() - 0.5)
    .filter(
      (item, index, all) =>
        all.findIndex((candidate) => candidate.role === item.role) === index,
    )
    .slice(0, 6);

  const expressionRules = [...a.expressionRules, ...b.expressionRules]
    .sort(() => rng() - 0.5)
    .slice(0, 8);
  const mutationCurves = [...a.mutationCurves, ...b.mutationCurves]
    .sort(() => rng() - 0.5)
    .slice(0, 6);
  const timeline = [...a.timeline, ...b.timeline]
    .sort((x, y) => x.positionPercent - y.positionPercent || rng() - 0.5)
    .slice(0, 10);
  const transductions = [...a.transductions, ...b.transductions]
    .sort(() => rng() - 0.5)
    .slice(0, 6);

  return normalizeMouthDynamics({
    castProfiles,
    expressionRules,
    mutationCurves,
    timeline,
    transductions,
  });
}

function semanticAnchor(parentA: MouthGenome, parentB: MouthGenome): string | undefined {
  if (
    parentA.semanticAnchorLanguageProfileId &&
    parentA.semanticAnchorLanguageProfileId === parentB.semanticAnchorLanguageProfileId
  ) {
    return parentA.semanticAnchorLanguageProfileId;
  }
  if (
    parentA.semanticAnchorLanguageProfileId === 'lang-english' ||
    parentB.semanticAnchorLanguageProfileId === 'lang-english'
  ) {
    return 'lang-english';
  }
  return parentA.semanticAnchorLanguageProfileId || parentB.semanticAnchorLanguageProfileId;
}

function generatedName(parentA: MouthGenome, parentB: MouthGenome, generation: number, hash: string): string {
  const compactA = parentA.name.replace(/\s+MOUTH$/i, '').slice(0, 28);
  const compactB = parentB.name.replace(/\s+MOUTH$/i, '').slice(0, 28);
  return compactA + ' × ' + compactB + ' G' + generation + ' / ' + hash.toUpperCase();
}

export function breedMouthSpecies(request: MouthEvolutionRequest): MouthEvolutionResult {
  const parentA = request.parentA;
  const parentB = request.parentB;
  if (!parentA?.id || !parentB?.id) {
    throw new Error('Mouth species breeding requires two valid genome parents.');
  }
  if (parentA.id === parentB.id) {
    throw new Error('Mouth species breeding requires two distinct genome parents.');
  }

  const breedingSeed = request.breedingSeed.trim() || 'mouth-evolution-default';
  const rng = makeMouthRng(
    stableStringify({
      parentIds: [parentA.id, parentB.id].sort(),
      breedingSeed,
      specimenIds: (request.specimenAssist || []).map((specimen) => specimen.id).sort(),
    }),
  );

  const traitSelection = chooseTraitAssignments(parentA, parentB, request, rng);
  const mutationTraitIds = maybeAddSpecimenMutation(
    traitSelection.assignments,
    request,
    rng,
  );
  const quirkSelection = chooseQuirks(parentA, parentB, request, rng);

  const anchor = semanticAnchor(parentA, parentB);
  if (anchor) {
    traitSelection.assignments.push({
      axis: 'semantics',
      donorId:
        [...parentA.parentDonorIds, ...parentB.parentDonorIds]
          .map((id) => getMouthDonor(id))
          .find((donor) => donor?.languageProfileId === anchor)?.id,
      traitIds: [],
      pressure: 'high',
      locked: true,
    });
  }

  const selectedDonors = unique(
    traitSelection.assignments
      .map((assignment) => assignment.donorId)
      .filter((id): id is string => Boolean(id)),
  ).slice(0, 6);

  for (const fallback of unique([...parentA.parentDonorIds, ...parentB.parentDonorIds])) {
    if (selectedDonors.length >= 2) break;
    if (!selectedDonors.includes(fallback) && getMouthDonor(fallback)) {
      selectedDonors.push(fallback);
    }
  }

  const generation =
    Math.max(parentA.lineage?.generation || 0, parentB.lineage?.generation || 0) + 1;
  const preserveDynamicsChance = clampMouthControl(
    request.preserveDynamicsChance,
    55,
  ) / 100;

  const parentTraitCount = Math.max(1, activeTraitIds(parentA).length + activeTraitIds(parentB).length);
  const weightedIntelligibility = Math.round(
    (parentA.intelligibility * activeTraitIds(parentA).length +
      parentB.intelligibility * activeTraitIds(parentB).length) /
      parentTraitCount,
  );

  const lineage: MouthSpeciesLineage = {
    parentGenomeIds: [parentA.id, parentB.id],
    parentNames: [parentA.name, parentB.name],
    generation,
    breedingSeed,
    inheritedTraitIdsByParent: traitSelection.inheritedByParent,
    inheritedQuirkIdsByParent: quirkSelection.inheritedByParent,
    specimenIds: (request.specimenAssist || []).map((specimen) => specimen.id).sort(),
    mutationTraitIds,
    mutationQuirkIds: quirkSelection.mutationQuirkIds,
    noveltyPenaltyTraitIds: traitSelection.noveltyPenaltyTraitIds,
  };

  const signature = stableStringify({
    lineage,
    assignments: traitSelection.assignments,
    quirks: quirkSelection.quirks.map(({ createdAt, ...quirk }) => quirk),
  });
  const hash = hashMouthString(signature).toString(36);

  const genome: MouthGenome = {
    id: 'mouth_evo_' + hash,
    name:
      request.requestedName?.trim() ||
      generatedName(parentA, parentB, generation, hash),
    parentDonorIds: selectedDonors,
    assignments: traitSelection.assignments.sort(
      (a, b) =>
        a.axis.localeCompare(b.axis) ||
        (a.donorId || '').localeCompare(b.donorId || '') ||
        a.traitIds.join(',').localeCompare(b.traitIds.join(',')),
    ),
    objectiveId: parentA.objectiveId || parentB.objectiveId,
    semanticAnchorLanguageProfileId: anchor,
    intelligibility: clampMouthControl(weightedIntelligibility, 82),
    stability: clampMouthControl(
      Math.round((parentA.stability + parentB.stability) / 2),
      72,
    ),
    mutation: clampMouthControl(
      Math.round((parentA.mutation + parentB.mutation) / 2),
      35,
    ),
    breedingSeed,
    quirks: quirkSelection.quirks,
    mutationScars: [...parentA.mutationScars, ...parentB.mutationScars]
      .sort(() => rng() - 0.5)
      .slice(0, 4),
    linkedGeneBundles: unique(
      [...parentA.linkedGeneBundles, ...parentB.linkedGeneBundles].map((bundle) => bundle.id),
    )
      .map((id) =>
        [...parentA.linkedGeneBundles, ...parentB.linkedGeneBundles].find((bundle) => bundle.id === id)!,
      )
      .filter((bundle) =>
        bundle.traitIds.some((id) => traitSelection.assignments.some((assignment) => assignment.traitIds.includes(id))) ||
        bundle.quirkIds.some((id) => quirkSelection.quirks.some((quirk) => quirk.quirkId === id)),
      )
      .slice(0, 8),
    dynamics: mergedDynamics(parentA, parentB, preserveDynamicsChance, rng),
    lineage,
    createdAt: Date.now(),
  };

  const identified = reidentifyMouthGenome(genome);
  const phenotype = projectMouthPhenotype(identified);
  const noveltyPenalties = traitSelection.noveltyPenaltyTraitIds.map((traitId) => {
    const name = getMouthTrait(traitId)?.name || traitId;
    return name + ' survived recent-use cooldown because its crossover score still beat alternatives.';
  });

  const warnings = [...phenotype.warnings];
  if (!traitSelection.inheritedByParent[parentA.id]?.length) {
    warnings.push(parentA.name + ' contributed no active trait after crossover.');
  }
  if (!traitSelection.inheritedByParent[parentB.id]?.length) {
    warnings.push(parentB.name + ' contributed no active trait after crossover.');
  }
  if (mutationTraitIds.length || quirkSelection.mutationQuirkIds.length) {
    warnings.push(
      'Specimen-assisted bounded mutation entered the child: ' +
        [...mutationTraitIds, ...quirkSelection.mutationQuirkIds].join(', '),
    );
  }

  return {
    genome: identified,
    phenotype,
    lineage,
    warnings,
    noveltyPenalties,
  };
}
