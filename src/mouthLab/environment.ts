import type {
  MouthEnvironmentExposure,
  MouthGenome,
  MouthTraitPressure,
} from './types';
import { getMouthDonor } from './donors';
import { getMouthTrait } from './traits';
import { makeMouthRng, MOUTH_PRESSURE_RANK, stableStringify } from './determinism';
import { reidentifyMouthGenome } from './quirks';

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function clampGenerations(value: number): number {
  return Math.max(1, Math.min(24, Math.round(Number.isFinite(value) ? value : 1)));
}

function environmentalTraitCount(pressure: MouthTraitPressure, generations: number): number {
  const pressureRank = MOUTH_PRESSURE_RANK[pressure] || 2;
  const generationBonus = generations >= 12 ? 2 : generations >= 5 ? 1 : 0;
  return Math.max(1, Math.min(4, pressureRank - 1 + generationBonus));
}

export function exposeMouthToEnvironment(
  genome: MouthGenome,
  options: {
    donorId: string;
    generations?: number;
    pressure?: MouthTraitPressure;
    seed?: string;
    note?: string;
  },
): MouthGenome {
  const donor = getMouthDonor(options.donorId);
  if (!donor) throw new Error('Unknown Mouth Lab environmental donor: ' + options.donorId);

  const generations = clampGenerations(options.generations ?? 1);
  const pressure = options.pressure || 'medium';
  const seed = options.seed?.trim() || 'mouth-environment-default';

  const inheritedTraitIds = new Set(
    genome.assignments.flatMap((assignment) => assignment.traitIds),
  );
  const candidates = donor.traitIds
    .filter((traitId) => {
      const trait = getMouthTrait(traitId);
      return Boolean(trait && !trait.axes.includes('semantics'));
    })
    .sort();

  if (!candidates.length) {
    throw new Error('Environmental donor has no usable non-semantic Mouth Lab traits: ' + donor.name);
  }

  const rng = makeMouthRng(
    stableStringify({
      genomeId: genome.id,
      donorId: donor.id,
      generations,
      pressure,
      seed,
    }),
  );

  const ranked = candidates
    .map((traitId, index) => ({
      traitId,
      inherited: inheritedTraitIds.has(traitId),
      roll: rng(),
      index,
    }))
    .sort((a, b) => {
      if (a.inherited !== b.inherited) return a.inherited ? 1 : -1;
      return a.roll - b.roll || a.index - b.index;
    });

  const scarTraitIds = ranked
    .slice(0, Math.min(environmentalTraitCount(pressure, generations), ranked.length))
    .map((entry) => entry.traitId);

  const exposure: MouthEnvironmentExposure = {
    id:
      'mouth_env_' +
      Math.abs(
        stableStringify({
          genomeId: genome.id,
          donorId: donor.id,
          generations,
          pressure,
          seed,
          scarTraitIds,
        })
          .split('')
          .reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0),
      ).toString(36),
    donorId: donor.id,
    generations,
    pressure,
    scarTraitIds,
    seed,
    note: options.note?.trim() || undefined,
    createdAt: Date.now(),
  };

  const withoutSameEnvironment = (genome.environmentExposures || []).filter(
    (item) => item.donorId !== donor.id,
  );

  return reidentifyMouthGenome({
    ...genome,
    environmentExposures: [...withoutSameEnvironment, exposure],
    createdAt: Date.now(),
  });
}

export function removeMouthEnvironmentExposure(
  genome: MouthGenome,
  exposureId: string,
): MouthGenome {
  return reidentifyMouthGenome({
    ...genome,
    environmentExposures: (genome.environmentExposures || []).filter(
      (exposure) => exposure.id !== exposureId,
    ),
    createdAt: Date.now(),
  });
}

export function mouthEnvironmentSummary(genome: MouthGenome): string[] {
  return (genome.environmentExposures || []).map((exposure) => {
    const donor = getMouthDonor(exposure.donorId);
    const traitNames = unique(
      exposure.scarTraitIds.map((traitId) => getMouthTrait(traitId)?.name || traitId),
    );
    return (
      (donor?.name || exposure.donorId) +
      ' environment × ' +
      exposure.generations +
      ' generation' +
      (exposure.generations === 1 ? '' : 's') +
      ' @ ' +
      exposure.pressure +
      ': ' +
      traitNames.join(' + ')
    );
  });
}
