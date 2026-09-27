import {
  MouthEnvironment,
  MouthEnvironmentMode,
  MouthEnvironmentRequest,
  MouthGenome,
  MouthMutationScar,
} from './types';
import { getMouthDonor } from './donors';
import { getMouthTrait } from './traits';
import {
  clampMouthControl,
  hashMouthString,
  makeMouthRng,
  stableStringify,
} from './determinism';
import { reidentifyMouthGenome } from './quirks';

const MODES: MouthEnvironmentMode[] = ['exposure', 'infection', 'isolation'];

function clean(value: unknown, max = 240): string {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
    : '';
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function normalizeMouthEnvironment(value: unknown): MouthEnvironment | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as any;
  const mode: MouthEnvironmentMode = MODES.includes(raw.mode) ? raw.mode : 'exposure';
  const sourceDonorId =
    mode !== 'isolation' && raw.sourceDonorId && getMouthDonor(String(raw.sourceDonorId))
      ? String(raw.sourceDonorId)
      : undefined;

  if (mode !== 'isolation' && !sourceDonorId) return undefined;

  const donor = sourceDonorId ? getMouthDonor(sourceDonorId) : undefined;
  const adaptationTraitIds = unique<string>(
    (Array.isArray(raw.adaptationTraitIds) ? raw.adaptationTraitIds : [])
      .map((id: unknown) => String(id))
      .filter((id: string) => Boolean(getMouthTrait(id)) && (!donor || donor.traitIds.includes(id))),
  ).slice(0, 6);

  return {
    mode,
    sourceDonorId,
    pressure: clampMouthControl(raw.pressure, 60),
    generations: Math.max(1, Math.min(24, Math.round(Number(raw.generations) || 1))),
    adaptationTraitIds,
    seed: clean(raw.seed) || 'mouth-environment',
    createdAt: Number.isFinite(raw.createdAt) ? Number(raw.createdAt) : Date.now(),
  };
}

function chooseAdaptations(
  genome: MouthGenome,
  sourceDonorId: string | undefined,
  pressure: number,
  generations: number,
  seed: string,
  mode: MouthEnvironmentMode,
): string[] {
  if (!sourceDonorId) return [];
  const donor = getMouthDonor(sourceDonorId);
  if (!donor) return [];

  const active = new Set(genome.assignments.flatMap((assignment) => assignment.traitIds));
  const rng = makeMouthRng(
    stableStringify({
      genomeId: genome.id,
      sourceDonorId,
      pressure,
      generations,
      seed,
      mode,
    }),
  );

  const candidates = donor.traitIds
    .filter((traitId) => Boolean(getMouthTrait(traitId)))
    .map((traitId) => ({
      traitId,
      score: (active.has(traitId) ? -1.5 : 1) + rng(),
    }))
    .sort((a, b) => b.score - a.score);

  const baseCount = pressure >= 85 ? 3 : pressure >= 55 ? 2 : 1;
  const generationBonus = generations >= 8 ? 1 : 0;
  const infectionBonus = mode === 'infection' && pressure >= 70 ? 1 : 0;
  return candidates.slice(0, Math.min(4, baseCount + generationBonus + infectionBonus)).map((row) => row.traitId);
}

function environmentResidualRule(
  environment: MouthEnvironment,
): string {
  if (environment.mode === 'isolation') {
    return (
      'ISOLATION SCAR: after ' + environment.generations +
      ' generations without outside linguistic input, timing and articulation retain compensatory drift. ' +
      'Treat this as lineage history, not a new donor language.'
    );
  }

  const donor = environment.sourceDonorId ? getMouthDonor(environment.sourceDonorId) : undefined;
  const traitNames = environment.adaptationTraitIds
    .map((id) => getMouthTrait(id)?.name || id)
    .join(', ');

  if (environment.mode === 'infection') {
    return (
      'ENVIRONMENTAL INFECTION SCAR: after ' + environment.generations +
      ' generations under ' + (donor?.name || environment.sourceDonorId) +
      ' pressure, the mouth retains compensatory responses to ' + (traitNames || 'the surrounding phonology') +
      '. The source language is ENVIRONMENT, NOT ANCESTRY; do not add it to the parent lineage.'
    );
  }

  return (
    'ENVIRONMENTAL EXPOSURE SCAR: after ' + environment.generations +
    ' generations surrounded by ' + (donor?.name || environment.sourceDonorId) +
    ', the mouth retains adaptation pressure around ' + (traitNames || 'the surrounding phonology') +
    '. The source language is ENVIRONMENT, NOT ANCESTRY; preserve the existing parent lineage.'
  );
}

export function applyMouthEnvironment(
  genome: MouthGenome,
  request: MouthEnvironmentRequest,
): MouthGenome {
  if (!genome?.id) throw new Error('A valid Mouth Lab genome is required before applying an environment.');
  const mode: MouthEnvironmentMode = MODES.includes(request.mode) ? request.mode : 'exposure';
  const pressure = clampMouthControl(request.pressure, 65);
  const generations = Math.max(1, Math.min(24, Math.round(Number(request.generations) || 1)));
  const seed = clean(request.seed) || 'mouth-environment';

  const sourceDonorId =
    mode === 'isolation'
      ? undefined
      : request.sourceDonorId && getMouthDonor(request.sourceDonorId)
        ? request.sourceDonorId
        : undefined;

  if (mode !== 'isolation' && !sourceDonorId) {
    throw new Error('Exposure and infection environments require a valid source language.');
  }

  const environment: MouthEnvironment = {
    mode,
    sourceDonorId,
    pressure,
    generations,
    adaptationTraitIds: chooseAdaptations(
      genome,
      sourceDonorId,
      pressure,
      generations,
      seed,
      mode,
    ),
    seed,
    createdAt: Date.now(),
  };

  const residualRule = environmentResidualRule(environment);
  const scar: MouthMutationScar = {
    id:
      'mouth_scar_env_' +
      hashMouthString(
        stableStringify({
          genomeId: genome.id,
          environment: { ...environment, createdAt: undefined },
          residualRule,
        }),
      ).toString(36),
    sourceOperation: 'environment-exposure',
    removedTraitIds: [],
    removedQuirkIds: [],
    residualRule,
    strength: pressure,
    createdAt: Date.now(),
  };

  return reidentifyMouthGenome({
    ...genome,
    environment,
    mutationScars: [
      ...genome.mutationScars.filter((item) => item.sourceOperation !== 'environment-exposure'),
      scar,
    ],
    createdAt: Date.now(),
  });
}

export function clearMouthEnvironment(genome: MouthGenome): MouthGenome {
  if (!genome.environment) return genome;
  return reidentifyMouthGenome({
    ...genome,
    environment: undefined,
    createdAt: Date.now(),
  });
}
