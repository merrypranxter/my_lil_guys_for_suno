import { SavedStack } from '../types';

const STORAGE_KEYS = {
  SAVED_STACKS: 'lgm_saved_stacks_v1',
  LAST_STACK: 'lgm_last_stack_v1',
  ENERGY: 'lgm_energy_v1',
  LAST_SEED: 'lgm_last_seed_v1',
};

export function getSavedStacks(): SavedStack[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_STACKS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved stacks from localStorage', e);
    return [];
  }
}

export function saveStackToFavorites(name: string, guyIds: string[]): SavedStack[] {
  try {
    const current = getSavedStacks();
    const newStack: SavedStack = {
      id: 'stack_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim() || `Stack of ${guyIds.length} Guys`,
      guyIds,
      createdAt: Date.now(),
    };
    const updated = [newStack, ...current];
    localStorage.setItem(STORAGE_KEYS.SAVED_STACKS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save stack to localStorage', e);
    return [];
  }
}

export function deleteSavedStack(id: string): SavedStack[] {
  try {
    const current = getSavedStacks();
    const updated = current.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_STACKS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete stack from localStorage', e);
    return [];
  }
}

export function getLastStack(): string[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_STACK);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setLastStack(guyIds: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_STACK, JSON.stringify(guyIds));
  } catch {
    // ignore
  }
}

export function getSavedEnergy(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENERGY);
    if (!raw) return 4; // Default energetic level
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) || parsed < 1 || parsed > 5 ? 4 : parsed;
  } catch {
    return 4;
  }
}

export function setSavedEnergy(energy: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ENERGY, energy.toString());
  } catch {
    // ignore
  }
}

export function getSavedSeed(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SEED) || '';
  } catch {
    return '';
  }
}

export function setSavedSeed(seed: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SEED, seed);
  } catch {
    // ignore
  }
}
