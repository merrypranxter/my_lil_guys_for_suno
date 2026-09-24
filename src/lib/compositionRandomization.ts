import { CompositionDimension, CompositionDomain } from '../types';
import {
  COMPOSITION_DIMENSION_DOMAINS,
  COMPOSITION_DIMENSION_LIMITS,
  getCompositionEngine,
  getCompositionEnginesByDimension,
  normalizeCompositionEngineIds,
} from '../data/compositionEngines';

function shuffled<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function defaultCountForDimension(dimension: CompositionDimension): number {
  const limit = COMPOSITION_DIMENSION_LIMITS[dimension];
  if (limit >= 8) return 4;
  if (limit >= 3) return 2;
  if (limit >= 2) return 2;
  return 1;
}

function idsForDimension(ids: string[], dimension: CompositionDimension): string[] {
  return ids.filter((id) => getCompositionEngine(id)?.dimension === dimension);
}

function uniqueValidLocks(selectedIds: string[], lockedIds: string[]): string[] {
  const selected = new Set(selectedIds);
  const seen = new Set<string>();
  return lockedIds.filter((id) => {
    if (!selected.has(id) || seen.has(id) || !getCompositionEngine(id)) return false;
    seen.add(id);
    return true;
  });
}

export function sanitizeCompositionLocks(selectedIds: string[], lockedIds: string[]): string[] {
  return uniqueValidLocks(selectedIds, lockedIds);
}

export function randomizeCompositionDimension(
  selectedIds: string[],
  lockedIds: string[],
  dimension: CompositionDimension,
  targetCount?: number
): string[] {
  const validSelected = normalizeCompositionEngineIds(selectedIds);
  const validLocks = uniqueValidLocks(validSelected, lockedIds);
  const lockSet = new Set(validLocks);

  const existingInDimension = idsForDimension(validSelected, dimension);
  const lockedInDimension = existingInDimension.filter((id) => lockSet.has(id));
  const limit = COMPOSITION_DIMENSION_LIMITS[dimension];

  const requested = typeof targetCount === 'number'
    ? targetCount
    : Math.max(existingInDimension.length, defaultCountForDimension(dimension));

  const desired = Math.max(
    lockedInDimension.length,
    Math.min(limit, Math.max(0, requested))
  );

  const pool = getCompositionEnginesByDimension(dimension)
    .filter((engine) => !lockSet.has(engine.id));

  const picked = shuffled(pool)
    .slice(0, Math.max(0, desired - lockedInDimension.length))
    .map((engine) => engine.id);

  const outsideDimension = validSelected.filter(
    (id) => getCompositionEngine(id)?.dimension !== dimension
  );

  return normalizeCompositionEngineIds([
    ...outsideDimension,
    ...lockedInDimension,
    ...picked,
  ]);
}

export function randomizeCompositionDomain(
  selectedIds: string[],
  lockedIds: string[],
  domain: CompositionDomain
): string[] {
  let next = normalizeCompositionEngineIds(selectedIds);
  const dimensions = (Object.keys(COMPOSITION_DIMENSION_DOMAINS) as CompositionDimension[])
    .filter((dimension) => COMPOSITION_DIMENSION_DOMAINS[dimension] === domain);

  const occupied = dimensions.filter((dimension) => idsForDimension(next, dimension).length > 0);

  if (occupied.length > 0) {
    for (const dimension of occupied) {
      const currentCount = idsForDimension(next, dimension).length;
      next = randomizeCompositionDimension(next, lockedIds, dimension, currentCount);
    }
    return next;
  }

  const seedCount = Math.min(dimensions.length, dimensions.length <= 2 ? dimensions.length : 3);
  for (const dimension of shuffled(dimensions).slice(0, seedCount)) {
    next = randomizeCompositionDimension(next, lockedIds, dimension);
  }

  return next;
}

export function randomizeAllComposition(
  selectedIds: string[],
  lockedIds: string[]
): string[] {
  let next = normalizeCompositionEngineIds(selectedIds);
  const occupiedDimensions = (Object.keys(COMPOSITION_DIMENSION_DOMAINS) as CompositionDimension[])
    .filter((dimension) => idsForDimension(next, dimension).length > 0);

  if (occupiedDimensions.length > 0) {
    for (const dimension of occupiedDimensions) {
      const currentCount = idsForDimension(next, dimension).length;
      next = randomizeCompositionDimension(next, lockedIds, dimension, currentCount);
    }
    return next;
  }

  const domains: CompositionDomain[] = ['voice', 'signal', 'sonic', 'structure'];

  for (const domain of domains) {
    const dimensions = (Object.keys(COMPOSITION_DIMENSION_DOMAINS) as CompositionDimension[])
      .filter((dimension) => COMPOSITION_DIMENSION_DOMAINS[dimension] === domain);
    const picks = shuffled(dimensions).slice(0, Math.min(2, dimensions.length));
    for (const dimension of picks) {
      next = randomizeCompositionDimension(next, lockedIds, dimension);
    }
  }

  return next;
}

export function mutateCompositionSelection(
  selectedIds: string[],
  lockedIds: string[]
): string[] {
  let next = normalizeCompositionEngineIds(selectedIds);
  const validLocks = uniqueValidLocks(next, lockedIds);
  const lockSet = new Set(validLocks);

  if (next.length === 0) {
    return randomizeAllComposition(next, validLocks);
  }

  const mutable = next.filter((id) => {
    if (lockSet.has(id)) return false;
    const engine = getCompositionEngine(id);
    if (!engine) return false;
    return getCompositionEnginesByDimension(engine.dimension).some(
      (candidate) => candidate.id !== id && !next.includes(candidate.id)
    );
  });

  if (mutable.length === 0) return next;

  const changeCount = Math.min(3, Math.max(1, Math.round(mutable.length * 0.25)));
  const chosen = shuffled(mutable).slice(0, changeCount);

  for (const oldId of chosen) {
    const oldEngine = getCompositionEngine(oldId);
    if (!oldEngine) continue;

    const alternatives = getCompositionEnginesByDimension(oldEngine.dimension)
      .filter((candidate) => candidate.id !== oldId && !next.includes(candidate.id));

    if (alternatives.length === 0) continue;

    const replacement = shuffled(alternatives)[0];
    next = next.map((id) => (id === oldId ? replacement.id : id));
  }

  return normalizeCompositionEngineIds(next);
}
