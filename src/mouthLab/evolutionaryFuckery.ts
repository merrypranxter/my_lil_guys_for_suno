import {
  MouthEvolutionaryOperationRequest,
  MouthEvolutionaryOperationResult,
  MouthFossil,
  MouthGenome,
  MouthJurisdictionAssignment,
  MouthMutationScar,
  MouthQuirkInstance,
  MouthSpeciesLineage,
} from './types';
import { getMouthDonor } from './donors';
import { getMouthTrait } from './traits';
import { getMouthQuirkDefinition, reidentifyMouthGenome } from './quirks';
import {
  clampMouthControl,
  hashMouthString,
  makeMouthRng,
  MOUTH_PRESSURE_RANK,
  pressureFromRank,
  stableStringify,
} from './determinism';

function activeTraitIds(genome: MouthGenome): string[] {
  return Array.from(new Set(genome.assignments.flatMap((a) => a.traitIds)));
}
function activeQuirkIds(genome: MouthGenome): string[] {
  return Array.from(new Set(genome.quirks.filter((q) => q.enabled).map((q) => q.quirkId)));
}
function choose<T>(items: T[], rng: () => number): T | undefined {
  if (!items.length) return undefined;
  return items[Math.floor(rng() * items.length)];
}
function scar(
  genome: MouthGenome,
  sourceOperation: MouthMutationScar['sourceOperation'],
  seed: string,
  text: string,
  strength: number,
  removedTraitIds: string[] = [],
  removedQuirkIds: string[] = [],
): MouthMutationScar {
  return {
    id: 'mouth_scar_' + sourceOperation.replace(/-/g, '_') + '_' +
      hashMouthString(stableStringify({ genome: genome.id, seed, text })).toString(36),
    sourceOperation,
    removedTraitIds,
    removedQuirkIds,
    residualRule: text,
    strength,
    createdAt: Date.now(),
  };
}
function nextLineage(
  parent: MouthGenome,
  seed: string,
  mutationTraitIds: string[] = [],
  mutationQuirkIds: string[] = [],
): MouthSpeciesLineage {
  return {
    parentGenomeIds: [parent.id],
    parentNames: [parent.name],
    generation: (parent.lineage?.generation || 0) + 1,
    breedingSeed: seed,
    inheritedTraitIdsByParent: { [parent.id]: activeTraitIds(parent) },
    inheritedQuirkIdsByParent: { [parent.id]: activeQuirkIds(parent) },
    specimenIds: [],
    mutationTraitIds,
    mutationQuirkIds,
    noveltyPenaltyTraitIds: [],
  };
}
function descendant(
  parent: MouthGenome,
  patch: Partial<MouthGenome>,
  seed: string,
  name: string,
  mutationTraitIds: string[] = [],
  mutationQuirkIds: string[] = [],
): MouthGenome {
  return reidentifyMouthGenome({
    ...parent,
    ...patch,
    name,
    breedingSeed: seed,
    parentDonorIds: [...parent.parentDonorIds],
    lineage: nextLineage(parent, seed, mutationTraitIds, mutationQuirkIds),
    createdAt: Date.now(),
  });
}
function dormantAncestralTraits(genome: MouthGenome): Array<{ traitId: string; donorId: string }> {
  const active = new Set(activeTraitIds(genome));
  const rows: Array<{ traitId: string; donorId: string }> = [];
  for (const donorId of genome.parentDonorIds) {
    const donor = getMouthDonor(donorId);
    if (!donor) continue;
    for (const traitId of donor.traitIds) {
      if (!active.has(traitId) && getMouthTrait(traitId) && !rows.some((r) => r.traitId === traitId)) {
        rows.push({ traitId, donorId });
      }
    }
  }
  return rows;
}
function removeTrait(assignments: MouthJurisdictionAssignment[], traitId: string): MouthJurisdictionAssignment[] {
  return assignments
    .map((a) => ({ ...a, traitIds: a.traitIds.filter((id) => id !== traitId) }))
    .filter((a) => a.axis === 'semantics' || a.traitIds.length > 0);
}

export function applyMouthEvolutionaryOperation(
  request: MouthEvolutionaryOperationRequest,
): MouthEvolutionaryOperationResult {
  const parent = request.genome;
  const seed = request.seed.trim() || 'mouth-evolutionary-fuckery';
  const intensity = clampMouthControl(request.intensity, 65);
  const rng = makeMouthRng(stableStringify({ parent: parent.id, operation: request.operation, seed, intensity, targetId: request.targetId || '' }));
  const generation = (parent.lineage?.generation || 0) + 1;
  const prefix = request.requestedName?.trim() || parent.name.replace(/\s+G\d+.*$/i, '');
  const traits = activeTraitIds(parent);
  const quirks = activeQuirkIds(parent);

  if (request.operation === 'atavism') {
    const scarTraits = parent.mutationScars.flatMap((s) => s.removedTraitIds).filter((id) => Boolean(getMouthTrait(id)));
    const candidates = dormantAncestralTraits(parent);
    const requested = request.targetId
      ? candidates.find((c) => c.traitId === request.targetId)
      : undefined;
    const fallbackFromScar = scarTraits
      .map((traitId) => ({
        traitId,
        donorId: parent.parentDonorIds.find((id) => getMouthDonor(id)?.traitIds.includes(traitId)) || '',
      }))
      .find((c) => c.donorId && candidates.some((x) => x.traitId === c.traitId));
    const selected = requested || fallbackFromScar || choose(candidates, rng);
    if (!selected) throw new Error('No dormant ancestral trait is available for atavism.');
    const trait = getMouthTrait(selected.traitId)!;
    const assignment: MouthJurisdictionAssignment = {
      axis: trait.axes[0],
      donorId: selected.donorId,
      traitIds: [selected.traitId],
      pressure: intensity >= 80 ? 'obsessive' : intensity >= 55 ? 'high' : trait.defaultPressure,
      locked: false,
    };
    const s = scar(parent, 'atavism', seed, 'ATAVISM: ' + trait.name + ' reappeared from existing ancestry after being dormant/lost. No new donor entered the lineage.', intensity);
    const genome = descendant(parent, {
      assignments: [...parent.assignments, assignment],
      mutationScars: [...parent.mutationScars, s].slice(-16),
    }, seed, prefix + ' G' + generation + ' / ATAVISM', [selected.traitId]);
    return { genome, operation: request.operation, summary: trait.name + ' reappeared from ancestral potential.', affectedTraitIds: [selected.traitId], affectedQuirkIds: [] };
  }

  if (request.operation === 'extinction' || request.operation === 'fossilize') {
    const traitTarget = request.targetId && traits.includes(request.targetId) ? request.targetId : undefined;
    const quirkTarget = request.targetId && quirks.includes(request.targetId) ? request.targetId : undefined;
    const targetType = traitTarget ? 'trait' : quirkTarget ? 'quirk' : (rng() < 0.75 && traits.length ? 'trait' : 'quirk');
    const selectedTrait = targetType === 'trait' ? (traitTarget || choose(traits, rng)) : undefined;
    const selectedQuirk = targetType === 'quirk' ? (quirkTarget || choose(quirks, rng)) : undefined;
    if (!selectedTrait && !selectedQuirk) throw new Error('Nothing active is available to remove.');

    let assignments = parent.assignments.map((a) => ({ ...a, traitIds: [...a.traitIds] }));
    let nextQuirks = parent.quirks.map((q) => ({ ...q, takeover: { ...q.takeover } }));
    let fossils = [...(parent.fossils || [])];
    const affectedTraitIds: string[] = [];
    const affectedQuirkIds: string[] = [];
    let label = '';

    if (selectedTrait) {
      const trait = getMouthTrait(selectedTrait)!;
      assignments = removeTrait(assignments, selectedTrait);
      affectedTraitIds.push(selectedTrait);
      label = trait.name;
      if (request.operation === 'fossilize') {
        const fossil: MouthFossil = {
          id: 'mouth_fossil_' + hashMouthString(parent.id + seed + selectedTrait).toString(36),
          sourceType: 'trait',
          sourceId: selectedTrait,
          sourceName: trait.name,
          musicalRule: trait.musicalAffordances[0] || ('Preserve the extinct ' + trait.name + ' as a recurring non-vocal musical gesture.'),
          generation,
          createdAt: Date.now(),
        };
        fossils.push(fossil);
      }
    } else if (selectedQuirk) {
      const def = getMouthQuirkDefinition(selectedQuirk)!;
      nextQuirks = nextQuirks.filter((q) => q.quirkId !== selectedQuirk);
      affectedQuirkIds.push(selectedQuirk);
      label = def.name;
      if (request.operation === 'fossilize') {
        const fossil: MouthFossil = {
          id: 'mouth_fossil_' + hashMouthString(parent.id + seed + selectedQuirk).toString(36),
          sourceType: 'quirk',
          sourceId: selectedQuirk,
          sourceName: def.name,
          musicalRule: def.transformation + ' survives outside the voice as a stable instrumental/rhythmic artifact.',
          generation,
          createdAt: Date.now(),
        };
        fossils.push(fossil);
      }
    }

    const op = request.operation;
    const text = op === 'fossilize'
      ? 'FOSSILIZATION: ' + label + ' went extinct as an active mouth behavior but survives as a musical fossil. Do not restore the vocal behavior unless later atavism explicitly does so.'
      : 'EXTINCTION: ' + label + ' disappeared from active expression. Preserve the absence and any downstream consequences.';
    const s = scar(parent, op, seed, text, intensity, affectedTraitIds, affectedQuirkIds);
    const genome = descendant(parent, {
      assignments,
      quirks: nextQuirks,
      fossils,
      mutationScars: [...parent.mutationScars, s].slice(-16),
    }, seed, prefix + ' G' + generation + ' / ' + op.toUpperCase(), [], []);
    return {
      genome,
      operation: op,
      summary: text,
      affectedTraitIds,
      affectedQuirkIds,
      fossil: op === 'fossilize' ? fossils[fossils.length - 1] : undefined,
    };
  }

  if (request.operation === 'bottleneck' || request.operation === 'founder-effect') {
    const semantic = parent.assignments.filter((a) => a.axis === 'semantics');
    const mutable = parent.assignments.filter((a) => a.axis !== 'semantics');
    const survivalRatio = Math.max(0.25, 1 - intensity / 130);
    const targetCount = Math.max(1, Math.round(mutable.length * survivalRatio));
    const ranked = mutable.map((a) => ({ a, score: (a.locked ? 2 : 0) + rng() })).sort((x, y) => y.score - x.score);
    let survivors = ranked.slice(0, targetCount).map(({ a }) => ({ ...a, traitIds: [...a.traitIds] }));
    if (request.operation === 'founder-effect') {
      survivors = survivors.map((a) => ({
        ...a,
        pressure: pressureFromRank(Math.min(4, MOUTH_PRESSURE_RANK[a.pressure] + (rng() < 0.7 ? 1 : 0))),
      }));
    }
    const survivorTraits = new Set(survivors.flatMap((a) => a.traitIds));
    const removedTraits = traits.filter((id) => !survivorTraits.has(id));
    const quirkKeep = Math.max(0, Math.round(parent.quirks.length * survivalRatio));
    const nextQuirks = [...parent.quirks].sort(() => rng() - 0.5).slice(0, quirkKeep);
    const keptQuirks = new Set(nextQuirks.map((q) => q.quirkId));
    const removedQuirks = quirks.filter((id) => !keptQuirks.has(id));
    const label = request.operation === 'bottleneck' ? 'BOTTLENECK' : 'FOUNDER EFFECT';
    const text = label + ': lineage passed through a restricted survivor set. Lost mechanisms remain historically absent unless later atavism restores ancestral potential.';
    const s = scar(parent, request.operation, seed, text, intensity, removedTraits, removedQuirks);
    const genome = descendant(parent, {
      assignments: [...semantic, ...survivors],
      quirks: nextQuirks,
      mutationScars: [...parent.mutationScars, s].slice(-16),
    }, seed, prefix + ' G' + generation + ' / ' + label);
    return { genome, operation: request.operation, summary: text, affectedTraitIds: removedTraits, affectedQuirkIds: removedQuirks };
  }

  // SPECIATE
  const drifted = parent.assignments.map((a) => {
    if (a.locked || a.axis === 'semantics') return { ...a, traitIds: [...a.traitIds] };
    const delta = rng() < intensity / 100 ? (rng() < 0.5 ? -1 : 1) : 0;
    return {
      ...a,
      traitIds: [...a.traitIds],
      pressure: pressureFromRank(Math.max(1, Math.min(4, MOUTH_PRESSURE_RANK[a.pressure] + delta))),
    };
  });
  const dormant = dormantAncestralTraits(parent);
  const activation = intensity >= 55 ? choose(dormant, rng) : undefined;
  const mutationTraitIds: string[] = [];
  if (activation) {
    const trait = getMouthTrait(activation.traitId)!;
    drifted.push({
      axis: trait.axes[0],
      donorId: activation.donorId,
      traitIds: [activation.traitId],
      pressure: intensity >= 80 ? 'high' : trait.defaultPressure,
      locked: false,
    });
    mutationTraitIds.push(activation.traitId);
  }
  const s = scar(parent, 'speciate', seed, 'SPECIATION: this branch diverged from its parent lineage under sustained internal drift. Treat it as a distinct saved species while preserving the same donor ancestry.', intensity);
  const genome = descendant(parent, {
    assignments: drifted,
    stability: clampMouthControl(parent.stability - Math.round(intensity / 8), parent.stability),
    mutation: clampMouthControl(parent.mutation + Math.round(intensity / 10), parent.mutation),
    mutationScars: [...parent.mutationScars, s].slice(-16),
  }, seed, prefix + ' G' + generation + ' / SPECIATED', mutationTraitIds);
  return { genome, operation: 'speciate', summary: s.residualRule, affectedTraitIds: mutationTraitIds, affectedQuirkIds: [] };
}
