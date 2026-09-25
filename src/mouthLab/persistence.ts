import {
  MouthGenome,
  MouthLabArchive,
  MouthLinkedGeneBundle,
  MouthSpecimen,
} from './types';

export const MOUTH_LAB_ARCHIVE_STORAGE_KEY = 'little-guy-machine:mouth-lab-archive:v1';

export interface MouthArchiveStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export function createEmptyMouthLabArchive(): MouthLabArchive {
  return {
    version: 1,
    specimens: [],
    species: [],
    linkedGeneBundles: [],
    updatedAt: Date.now(),
  };
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of items) map.set(item.id, item);
  return [...map.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export function normalizeMouthLabArchive(value: Partial<MouthLabArchive> | null | undefined): MouthLabArchive {
  return {
    version: 1,
    specimens: uniqueById(Array.isArray(value?.specimens) ? value!.specimens! : []),
    species: uniqueById(Array.isArray(value?.species) ? value!.species! : []),
    linkedGeneBundles: uniqueById(
      Array.isArray(value?.linkedGeneBundles) ? value!.linkedGeneBundles! : [],
    ),
    updatedAt:
      typeof value?.updatedAt === 'number' && Number.isFinite(value.updatedAt)
        ? value.updatedAt
        : Date.now(),
  };
}

export function serializeMouthLabArchive(archive: MouthLabArchive): string {
  return JSON.stringify(normalizeMouthLabArchive(archive));
}

export function parseMouthLabArchive(raw: string | null | undefined): MouthLabArchive {
  if (!raw) return createEmptyMouthLabArchive();

  try {
    const parsed = JSON.parse(raw) as Partial<MouthLabArchive>;
    return normalizeMouthLabArchive(parsed);
  } catch {
    return createEmptyMouthLabArchive();
  }
}

export function loadMouthLabArchive(storage: MouthArchiveStorage): MouthLabArchive {
  return parseMouthLabArchive(storage.getItem(MOUTH_LAB_ARCHIVE_STORAGE_KEY));
}

export function saveMouthLabArchive(
  storage: MouthArchiveStorage,
  archive: MouthLabArchive,
): MouthLabArchive {
  const normalized = {
    ...normalizeMouthLabArchive(archive),
    updatedAt: Date.now(),
  };
  storage.setItem(MOUTH_LAB_ARCHIVE_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function clearMouthLabArchive(storage: MouthArchiveStorage): void {
  if (storage.removeItem) {
    storage.removeItem(MOUTH_LAB_ARCHIVE_STORAGE_KEY);
    return;
  }
  storage.setItem(MOUTH_LAB_ARCHIVE_STORAGE_KEY, JSON.stringify(createEmptyMouthLabArchive()));
}

export function upsertMouthSpecimen(
  archive: MouthLabArchive,
  specimen: MouthSpecimen,
): MouthLabArchive {
  const existing = archive.specimens.find((item) => item.id === specimen.id);
  const merged: MouthSpecimen = existing
    ? {
        ...existing,
        ...specimen,
        createdAt: existing.createdAt,
        updatedAt: Date.now(),
      }
    : specimen;

  return {
    ...archive,
    specimens: uniqueById([
      ...archive.specimens.filter((item) => item.id !== specimen.id),
      merged,
    ]),
    updatedAt: Date.now(),
  };
}

export function upsertMouthSpecies(
  archive: MouthLabArchive,
  genome: MouthGenome,
): MouthLabArchive {
  return {
    ...archive,
    species: uniqueById([
      ...archive.species.filter((item) => item.id !== genome.id),
      genome,
    ]),
    updatedAt: Date.now(),
  };
}

export function upsertMouthGeneBundle(
  archive: MouthLabArchive,
  bundle: MouthLinkedGeneBundle,
): MouthLabArchive {
  return {
    ...archive,
    linkedGeneBundles: uniqueById([
      ...archive.linkedGeneBundles.filter((item) => item.id !== bundle.id),
      bundle,
    ]),
    updatedAt: Date.now(),
  };
}

export function removeMouthSpecimen(
  archive: MouthLabArchive,
  specimenId: string,
): MouthLabArchive {
  return {
    ...archive,
    specimens: archive.specimens.filter((item) => item.id !== specimenId),
    updatedAt: Date.now(),
  };
}

export function removeMouthSpecies(
  archive: MouthLabArchive,
  genomeId: string,
): MouthLabArchive {
  return {
    ...archive,
    species: archive.species.filter((item) => item.id !== genomeId),
    updatedAt: Date.now(),
  };
}
