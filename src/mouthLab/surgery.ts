import {
  MouthGenome,
  MouthMutationScar,
} from './types';
import { getMouthTrait } from './traits';
import { getMouthQuirkDefinition } from './quirks';
import { hashMouthString, stableStringify } from './determinism';

export interface MouthGeneKnockoutRequest {
  traitIds?: string[];
  quirkIds?: string[];
  residualRule?: string;
  scarStrength?: number;
  removeLinkedGenes?: boolean;
}

function clamp(value: number | undefined, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function reidentify(genome: MouthGenome): MouthGenome {
  const signature = stableStringify({
    parentDonorIds: genome.parentDonorIds,
    assignments: genome.assignments,
    objectiveId: genome.objectiveId,
    semanticAnchorLanguageProfileId: genome.semanticAnchorLanguageProfileId,
    intelligibility: genome.intelligibility,
    stability: genome.stability,
    mutation: genome.mutation,
    breedingSeed: genome.breedingSeed,
    quirks: genome.quirks.map(({ createdAt, ...item }) => item),
    mutationScars: genome.mutationScars.map(({ createdAt, ...item }) => item),
    linkedGeneBundles: genome.linkedGeneBundles.map(({ createdAt, ...item }) => item),
  });
  return {
    ...genome,
    id: 'mouth_' + hashMouthString(signature).toString(36),
    createdAt: Date.now(),
  };
}

export function knockoutMouthGenes(
  genome: MouthGenome,
  request: MouthGeneKnockoutRequest,
): MouthGenome {
  const requestedTraitIds = uniqueSorted(request.traitIds || []);
  const requestedQuirkIds = uniqueSorted(request.quirkIds || []);

  for (const traitId of requestedTraitIds) {
    if (!getMouthTrait(traitId)) {
      throw new Error('Unknown Mouth Lab trait knockout target: ' + traitId);
    }
  }

  for (const quirkId of requestedQuirkIds) {
    if (!getMouthQuirkDefinition(quirkId)) {
      throw new Error('Unknown Mouth Lab quirk knockout target: ' + quirkId);
    }
  }

  const removedTraits = new Set(requestedTraitIds);
  const removedQuirks = new Set(requestedQuirkIds);

  if (request.removeLinkedGenes) {
    for (const bundle of genome.linkedGeneBundles) {
      const touched =
        bundle.traitIds.some((id) => removedTraits.has(id)) ||
        bundle.quirkIds.some((id) => removedQuirks.has(id));
      if (!touched || !bundle.lockedTogether) continue;

      for (const id of bundle.traitIds) removedTraits.add(id);
      for (const id of bundle.quirkIds) removedQuirks.add(id);
    }
  }

  const assignments = genome.assignments
    .map((assignment) => ({
      ...assignment,
      traitIds: assignment.traitIds.filter((id) => !removedTraits.has(id)),
    }))
    .filter(
      (assignment) =>
        assignment.traitIds.length > 0 || assignment.axis === 'semantics',
    );

  const quirks = genome.quirks.filter(
    (instance) =>
      !removedQuirks.has(instance.quirkId) &&
      !instance.linkedTraitIds.some((id) => removedTraits.has(id)),
  );

  for (const instance of genome.quirks) {
    if (!quirks.some((candidate) => candidate.id === instance.id)) {
      removedQuirks.add(instance.quirkId);
    }
  }

  const touchedBundles = genome.linkedGeneBundles.filter(
    (bundle) =>
      bundle.traitIds.some((id) => removedTraits.has(id)) ||
      bundle.quirkIds.some((id) => removedQuirks.has(id)),
  );

  const linkedGeneBundles = genome.linkedGeneBundles
    .map((bundle) => ({
      ...bundle,
      traitIds: bundle.traitIds.filter((id) => !removedTraits.has(id)),
      quirkIds: bundle.quirkIds.filter((id) => !removedQuirks.has(id)),
    }))
    .filter((bundle) => bundle.traitIds.length > 0 || bundle.quirkIds.length > 0);

  const removedTraitIds = uniqueSorted([...removedTraits]);
  const removedQuirkIds = uniqueSorted([...removedQuirks]);

  if (!removedTraitIds.length && !removedQuirkIds.length) return genome;

  const strength = clamp(request.scarStrength, 28);
  const defaultResidual =
    'The removed gene no longer owns an active jurisdiction, but a faint behavioral scar may survive as reduced timing, articulation, or phrase-level bias.';

  const scar: MouthMutationScar = {
    id:
      'mouth_scar_' +
      hashMouthString(
        stableStringify({
          genomeId: genome.id,
          removedTraitIds,
          removedQuirkIds,
          residualRule: request.residualRule || defaultResidual,
          strength,
          touchedBundleIds: touchedBundles.map((bundle) => bundle.id).sort(),
        }),
      ).toString(36),
    sourceOperation:
      removedTraitIds.length && !removedQuirkIds.length
        ? 'gene-knockout'
        : removedQuirkIds.length && !removedTraitIds.length
          ? 'quirk-removal'
          : 'gene-knockout',
    removedTraitIds,
    removedQuirkIds,
    residualRule: request.residualRule || defaultResidual,
    strength,
    createdAt: Date.now(),
  };

  return reidentify({
    ...genome,
    assignments,
    quirks,
    linkedGeneBundles,
    mutationScars: [...genome.mutationScars, scar],
  });
}

export function clearMouthMutationScar(
  genome: MouthGenome,
  scarId: string,
): MouthGenome {
  if (!genome.mutationScars.some((scar) => scar.id === scarId)) return genome;

  return reidentify({
    ...genome,
    mutationScars: genome.mutationScars.filter((scar) => scar.id !== scarId),
  });
}

export function unlinkMouthGeneBundle(
  genome: MouthGenome,
  bundleId: string,
): MouthGenome {
  const bundle = genome.linkedGeneBundles.find((item) => item.id === bundleId);
  if (!bundle) return genome;

  return reidentify({
    ...genome,
    linkedGeneBundles: genome.linkedGeneBundles.map((item) =>
      item.id === bundleId ? { ...item, lockedTogether: false } : item,
    ),
  });
}
