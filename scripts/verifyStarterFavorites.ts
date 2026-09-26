import assert from 'node:assert/strict';
import { DEFAULT_MUSIC_CONTROLS } from '../src/data/musicSeedSystem';
import {
  getRunArchive,
  getSavedStacks,
  getStarterPreferenceSignals,
  getStarterSeedPreferenceWeights,
  runToMarkdown,
  saveGeneratedRun,
  saveStackToFavorites,
  updateArchivedRun,
} from '../src/lib/localStorage';

class MemoryStorage {
  private data = new Map<string, string>();
  get length(): number { return this.data.size; }
  clear(): void { this.data.clear(); }
  getItem(key: string): string | null { return this.data.has(key) ? this.data.get(key)! : null; }
  key(index: number): string | null { return Array.from(this.data.keys())[index] ?? null; }
  removeItem(key: string): void { this.data.delete(key); }
  setItem(key: string, value: string): void { this.data.set(String(key), String(value)); }
}

(globalThis as any).localStorage = new MemoryStorage();
localStorage.clear();

const starterStack = [
  {
    instanceId: 'starter_joy',
    seedId: 'affect-feral-euphoria',
    intensity: 91,
    muted: false,
    locked: false,
  },
  {
    instanceId: 'starter_world',
    seedId: 'world-mad-scientist-lab-show',
    intensity: 100,
    muted: false,
    locked: true,
    eventBridgeEnabled: true,
  },
  {
    instanceId: 'starter_motion',
    seedId: 'motion-pinball',
    intensity: 80,
    muted: false,
    locked: false,
  },
];

saveStackToFavorites(
  'MAD SCIENCE FAVORITE',
  ['taxonomy-goblin'],
  ['role-mad-scientist'],
  3,
  [],
  [],
  DEFAULT_MUSIC_CONTROLS,
  undefined,
  'bracketed',
  'inherit',
  starterStack,
);

const saved = getSavedStacks();
assert.equal(saved.length, 1);
assert.equal(saved[0].starterSeedStack?.length, 3, 'Whole-stack favorite should retain the Starter stack.');
assert.equal(
  saved[0].starterSeedStack?.find((item) => item.seedId === 'world-mad-scientist-lab-show')?.eventBridgeEnabled,
  true,
  'World event bridge state should persist inside whole-stack favorites.',
);

const run = saveGeneratedRun({
  guyIds: ['taxonomy-goblin'],
  realityEngineIds: ['role-mad-scientist'],
  compositionEngineIds: [],
  musicStack: [],
  musicControls: DEFAULT_MUSIC_CONTROLS,
  starterSeedStack: starterStack,
  realityChaos: 3,
  mouthGenome: undefined,
  mouthPromptMode: 'bracketed',
  mouthSemanticMode: 'inherit',
  seed: 'a machine that proves its own operator manual wrong',
  energy: 5,
  model: 'qa',
  style: 'style',
  lyrics: 'lyrics',
  caption: 'caption',
  charCounts: { style: 5, lyrics: 6, caption: 7 },
  fingerprint: undefined,
});

assert.equal(getRunArchive()[0].starterSeedStack?.length, 3, 'Generated run should snapshot Starter stack.');

const liked = updateArchivedRun(run.id, {
  starred: true,
  feedback: 'The mad scientist frame and pinball movement were the exact shit I liked.',
  likedStarterSeedIds: ['world-mad-scientist-lab-show', 'motion-pinball'],
  dislikedStarterSeedIds: ['affect-feral-euphoria'],
});
assert(liked);

const weights = getStarterSeedPreferenceWeights();
assert(weights['world-mad-scientist-lab-show'] > 0);
assert(weights['motion-pinball'] > 0);
assert(weights['affect-feral-euphoria'] < 0);
assert(
  Math.abs(weights['affect-feral-euphoria']) >= Math.abs(weights['motion-pinball']),
  'Explicit suppression should be at least as strong as explicit positive pressure before normalization.',
);

const signals = getStarterPreferenceSignals();
assert(signals.some((signal) => signal.includes('MAD SCIENTIST LAB SHOW')));
assert(signals.some((signal) => signal.includes('PINBALL')));
assert(signals.some((signal) => signal.includes('Explicitly suppress')));

const markdown = runToMarkdown(getRunArchive()[0]);
assert(markdown.includes('**Starter seed stack:**'));
assert(markdown.includes('MAD SCIENTIST LAB SHOW'));
assert(markdown.includes('**Liked starter seeds:**'));
assert(markdown.includes('world-mad-scientist-lab-show'));

updateArchivedRun(run.id, { starred: false });
const unstarredWeights = getStarterSeedPreferenceWeights();
assert.equal(Object.keys(unstarredWeights).length, 0, 'Unstarring should remove this run from learned Starter preference pressure.');

console.log('Starter favorites intelligence verification passed.');
