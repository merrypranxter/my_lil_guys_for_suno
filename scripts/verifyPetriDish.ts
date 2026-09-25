import assert from 'node:assert/strict';
import { MUSIC_SEED_RECIPES } from '../src/data/musicSeedSystem';
import {
  createPetriDishExperiment,
  createSiblingGenomes,
  baseMechanismEnvironment,
  buildSiblingMusicStack,
  blendSiblingControls,
  normalizePetriDishExperiment,
  toggleDishSiblingSelected,
} from '../src/lib/petriDish';
import { parentFromRecipe } from '../src/lib/musicBreeding';
import { DEFAULT_MUSIC_CONTROLS } from '../src/data/musicSeedSystem';

const parentARecipe = MUSIC_SEED_RECIPES.find((recipe) => recipe.id === 'coupled-stampede');
const parentBRecipe = MUSIC_SEED_RECIPES.find((recipe) => recipe.id === 'panic-engine');
assert.ok(parentARecipe && parentBRecipe, 'Required parent recipes should exist');

const parentA = parentFromRecipe(parentARecipe);
const parentB = parentFromRecipe(parentBRecipe);

const cohortA = createSiblingGenomes(parentA, parentB, 'family-test', 4);
const cohortB = createSiblingGenomes(parentA, parentB, 'family-test', 4);

assert.equal(cohortA.length, 4, 'Expected four siblings');
assert.deepEqual(
  cohortA.map((genome) => genome.id),
  cohortB.map((genome) => genome.id),
  'Same parents + family seed must reproduce the same sibling genetics'
);
assert.equal(
  new Set(cohortA.map((genome) => genome.id)).size,
  cohortA.length,
  'Sibling seeds should produce distinct genomes inside one cohort'
);

const baseStack = [
  {
    instanceId: 'recipe',
    kind: 'recipe' as const,
    refId: 'anchor-under-siege',
    muted: false,
    locked: false,
    strength: 80,
  },
  {
    instanceId: 'mechanism',
    kind: 'mechanism' as const,
    refId: 'dry-separation',
    muted: false,
    locked: true,
    strength: 90,
  },
];

const baseEnvironment = baseMechanismEnvironment(baseStack);
assert.equal(baseEnvironment.length, 1, 'Frozen challenge should retain manual mechanism chips only');
assert.equal(baseEnvironment[0].kind, 'mechanism');

const experiment = createPetriDishExperiment({
  name: 'TEST DISH',
  familySeed: 'family-test',
  parentA,
  parentB,
  siblingCount: 4,
  challenge: {
    guyIds: ['taxonomy-goblin'],
    realityEngineIds: [],
    compositionEngineIds: [],
    realityChaos: 2,
    seed: 'same-song-seed',
    energy: 4,
    baseMusicStack: baseStack,
    baseMusicControls: DEFAULT_MUSIC_CONTROLS,
    recentFingerprints: [],
    forcedFingerprint: {
      genreFamily: 'fixed test family',
      harmony: 'fixed harmony',
      melody: 'fixed melody',
      rhythm: 'fixed rhythm',
      timbre: 'fixed timbre',
      vocal: 'fixed vocal',
      performance: 'fixed performance',
      production: 'fixed production',
    },
    likedSignals: ['test signal'],
  },
});

assert.equal(experiment.siblings.length, 4);
assert.equal(experiment.challenge.baseMusicStack.length, 1);
assert.equal(experiment.challenge.seed, 'same-song-seed');
assert.equal(experiment.challenge.forcedFingerprint.rhythm, 'fixed rhythm', 'Controlled dish should freeze one musical fingerprint');

for (const sibling of experiment.siblings) {
  const stack = buildSiblingMusicStack(experiment.challenge.baseMusicStack, sibling.genome);
  assert.equal(stack.filter((item) => item.kind === 'genome').length, 1, 'Each test stack should contain one sibling genome');
  assert.equal(stack.filter((item) => item.kind === 'mechanism').length, 1, 'Each test stack should preserve frozen manual mechanisms');

  const controls = blendSiblingControls(experiment.challenge.baseMusicControls, sibling.genome.controls);
  for (const value of Object.values(controls)) {
    assert.ok(value >= 0 && value <= 100, 'Blended controls must remain bounded');
  }
}

const selected = toggleDishSiblingSelected(experiment, experiment.siblings[0].id);
assert.equal(selected.siblings[0].selected, true, 'Human selection should be explicit and persisted');
assert.equal(selected.siblings.slice(1).some((item) => item.selected), false, 'Selecting one sibling must not auto-rank/select others');

const normalized = normalizePetriDishExperiment(JSON.parse(JSON.stringify(selected)));
assert.ok(normalized, 'Persisted experiment should normalize successfully');
assert.equal(normalized?.siblings.length, 4);
assert.equal(normalized?.siblings[0].selected, true);
assert.equal(normalized?.parentA.ref.name, experiment.parentA.ref.name);
assert.equal(normalized?.challenge.likedSignals[0], 'test signal');
assert.equal(normalized?.challenge.forcedFingerprint.production, 'fixed production');

console.log(
  'Petri Dish verification passed:',
  experiment.name,
  experiment.siblings.length + ' siblings,',
  'frozen seed=' + experiment.challenge.seed,
  '| explicit survivors=' + selected.siblings.filter((item) => item.selected).length
);
