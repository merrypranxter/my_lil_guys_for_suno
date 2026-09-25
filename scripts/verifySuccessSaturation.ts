import assert from 'node:assert/strict';
import { MUSIC_SEED_RECIPES } from '../src/data/musicSeedSystem';
import { breedMusicGenome, parentFromRecipe } from '../src/lib/musicBreeding';
import {
  getGenomeMechanismFitness,
  getNoveltyPressureSignals,
  getRecentMechanismSaturation,
  promoteBredMusicGenome,
  saveGeneratedRun,
} from '../src/lib/localStorage';
import {
  analyzeFingerprintExposure,
  applySuccessSaturation,
  renderFingerprintNoveltyPressure,
} from '../src/lib/noveltyPressure';
import { buildMasterPrompt } from '../src/lib/buildGenerationPrompt';
import { MusicFingerprint } from '../src/types';

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

assert.equal(applySuccessSaturation(0.8, 0.2), 0.8, 'Fresh traits should not be penalized.');
assert.ok(
  applySuccessSaturation(0.8, 1) < applySuccessSaturation(0.8, 0.5),
  'Higher recent saturation should create stronger temporary selection pressure.'
);

const recipeA = MUSIC_SEED_RECIPES.find((recipe) => recipe.id === 'coupled-stampede');
const recipeB = MUSIC_SEED_RECIPES.find((recipe) => recipe.id === 'panic-engine');
assert.ok(recipeA && recipeB, 'Required recipes should exist.');

const genome = breedMusicGenome(
  parentFromRecipe(recipeA),
  parentFromRecipe(recipeB),
  'phase-5-saturation'
);
assert.ok(genome.mechanismIds.length >= 2, 'Need at least two genome genes for cooldown QA.');

const hotGene = genome.mechanismIds[0];
const freshGene = genome.mechanismIds[1];

for (let i = 0; i < 8; i += 1) {
  saveGeneratedRun({
    guyIds: ['taxonomy-goblin'],
    realityEngineIds: [],
    compositionEngineIds: [],
    musicStack: [{
      instanceId: 'hot-' + i,
      kind: 'mechanism',
      refId: hotGene,
      muted: false,
      locked: false,
      strength: 85,
    }],
    realityChaos: 2,
    seed: 'saturation qa ' + i,
    energy: 4,
    model: 'qa',
    style: 'style',
    lyrics: 'lyrics',
    caption: 'caption',
    charCounts: { style: 5, lyrics: 6, caption: 7 },
  });
}

const saturation = getRecentMechanismSaturation(8);
assert.ok(
  (saturation[hotGene] || 0) >= 0.72,
  'A mechanism used across the entire recent window should enter cooling state.'
);
assert.equal(
  saturation[freshGene] || 0,
  0,
  'A genome gene absent from recent runs should remain fresh.'
);

const noveltySignals = getNoveltyPressureSignals(8);
assert.ok(
  noveltySignals.some((line) => line.includes(hotGene) && line.includes('SUCCESS SATURATION')),
  'Cooling mechanism should be emitted as a generation novelty signal.'
);

promoteBredMusicGenome(genome, {
  reason: 'manual-promotion',
  likedMechanismIds: [hotGene, freshGene],
  note: 'Both genes are liked; only one is overexposed.',
});
const genomeFitness = getGenomeMechanismFitness(genome);
assert.ok(
  (genomeFitness[freshGene] || 0) > (genomeFitness[hotGene] || 0),
  'Temporary saturation should reduce reproductive priority without deleting durable positive fitness.'
);

const repeatedFingerprint: MusicFingerprint = {
  genreFamily: 'dry cabaret funk',
  harmony: 'quartal meantone friction',
  melody: 'angular patter',
  rhythm: '3:2 collision',
  timbre: 'body percussion and reeds',
  vocal: 'hostile hocket cast',
  performance: 'camp procedural mania',
  production: 'warped record damage',
};
const recentFingerprints = Array.from({ length: 8 }, () => ({ ...repeatedFingerprint }));
const fingerprintStats = analyzeFingerprintExposure(recentFingerprints);
assert.ok(
  fingerprintStats.some((entry) => entry.field === 'rhythm' && entry.state === 'cooling'),
  'Repeated fingerprint fields should enter cooling state.'
);

const noveltyBlock = renderFingerprintNoveltyPressure(recentFingerprints);
assert.ok(noveltyBlock.includes('RECENT-HISTORY COOLDOWN'));
assert.ok(noveltyBlock.includes('3:2 collision'));

const prompt = buildMasterPrompt({
  guyIds: ['taxonomy-goblin'],
  seed: 'a neon tesseract arguing with a parking meter',
  energy: 4,
  recentFingerprints,
  noveltySignals,
});
assert.ok(prompt.userPrompt.includes('SUCCESS SATURATION / TEMPORARY COOLDOWNS:'));
assert.ok(prompt.userPrompt.includes('RECENT-HISTORY COOLDOWN'));
assert.ok(prompt.userPrompt.includes(hotGene));
assert.ok(
  prompt.systemInstruction.includes('A successful trait is not banned or forgotten'),
  'System contract should distinguish cooldown from permanent dislike.'
);

const frozenPrompt = buildMasterPrompt({
  guyIds: ['taxonomy-goblin'],
  seed: 'controlled sibling trial',
  energy: 4,
  recentFingerprints,
  forcedFingerprint: repeatedFingerprint,
  noveltySignals,
});
assert.ok(
  frozenPrompt.userPrompt.includes('SUCCESS SATURATION IS SUSPENDED FOR THIS CONTROLLED EXPERIMENT'),
  'Frozen Petri-style comparisons must suspend novelty pressure.'
);
assert.ok(
  frozenPrompt.userPrompt.includes('Mechanism-level cooldown signals are observational only during a frozen comparison'),
  'Mechanism cooldown must not contaminate controlled sibling comparisons.'
);

console.log(
  'Success saturation verified:',
  'recently dominant mechanisms cool automatically,',
  'liked fitness survives underneath the cooldown,',
  'fingerprint monoculture creates explicit novelty pressure,',
  'and controlled experiments bypass the ecological penalty.'
);
