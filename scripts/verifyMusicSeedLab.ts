import assert from 'node:assert/strict';
import {
  DEFAULT_MUSIC_CONTROLS,
  MUSIC_MECHANISMS,
  MUSIC_SEED_RECIPES,
  compileMusicStack,
  getMusicMechanism,
  normalizeMusicControls,
  normalizeMusicStack,
  musicControlsToDirectives,
} from '../src/data/musicSeedSystem';

assert.ok(MUSIC_SEED_RECIPES.length >= 11, 'Expected the original recipes plus specialty additions');
assert.ok(MUSIC_SEED_RECIPES.some((recipe) => recipe.id === 'ecstatic-choir-never-arrives'), 'Ecstatic choir recipe should be registered');
assert.ok(MUSIC_MECHANISMS.length >= 20, 'Expected at least 20 music mechanisms');

const mechanismIds = MUSIC_MECHANISMS.map((item) => item.id);
assert.equal(new Set(mechanismIds).size, mechanismIds.length, 'Music mechanism IDs must be unique');

const recipeIds = MUSIC_SEED_RECIPES.map((item) => item.id);
assert.equal(new Set(recipeIds).size, recipeIds.length, 'Music recipe IDs must be unique');

for (const recipe of MUSIC_SEED_RECIPES) {
  assert.ok(recipe.mechanismIds.length > 0, recipe.name + ' must contain at least one mechanism');
  for (const mechanismId of recipe.mechanismIds) {
    assert.ok(getMusicMechanism(mechanismId), recipe.name + ' references missing mechanism ' + mechanismId);
  }
}

const stack = normalizeMusicStack([
  {
    instanceId: 'recipe_1',
    kind: 'recipe',
    refId: 'coupled-stampede',
    muted: false,
    locked: true,
    strength: 80,
  },
  {
    instanceId: 'mechanism_1',
    kind: 'mechanism',
    refId: 'vocal-relay',
    muted: false,
    locked: false,
    strength: 90,
  },
  {
    instanceId: 'muted_1',
    kind: 'mechanism',
    refId: 'hard-interrupts',
    muted: true,
    locked: false,
    strength: 100,
  },
]);

assert.equal(stack.length, 3, 'Valid stack items should survive normalization');
const compiled = compileMusicStack(stack, {
  ...DEFAULT_MUSIC_CONTROLS,
  stemminess: 95,
  kineticDensity: 90,
  coupling: 92,
});
assert.ok(compiled.recipes.some((recipe) => recipe.id === 'coupled-stampede'), 'Recipe macro should compile');
assert.ok(compiled.mechanisms.some((entry) => entry.mechanism.id === 'pulse-coupling-3-2'), 'Recipe should expand mechanisms');
assert.ok(compiled.mechanisms.some((entry) => entry.mechanism.id === 'vocal-relay'), 'Manual mechanism should remain active');
assert.ok(!compiled.mechanisms.some((entry) => entry.mechanism.id === 'hard-interrupts' && entry.sources.includes('manual')), 'Muted manual mechanism should not compile');
assert.ok(
  compiled.interactions.some((line) => line.includes('meter handoff')),
  'Coupling + vocal relay should create an interaction rule'
);
assert.ok(
  compiled.interactions.some((line) => line.includes('wall of sound')),
  'High stemminess + high density should create separation interaction'
);

const controls = normalizeMusicControls({
  stemminess: 500,
  coupling: -40,
  castSize: 73.4,
});
assert.equal(controls.stemminess, 100, 'Controls should clamp high values');
assert.equal(controls.coupling, 0, 'Controls should clamp low values');
assert.equal(controls.castSize, 73, 'Controls should round values');
assert.equal(controls.mouthFreakery, DEFAULT_MUSIC_CONTROLS.mouthFreakery, 'Legacy controls should receive Mouth Freakery default');
assert.equal(controls.techniqueMutation, DEFAULT_MUSIC_CONTROLS.techniqueMutation, 'Legacy controls should receive Technique Mutation default');
assert.equal(controls.vocalLegibility, DEFAULT_MUSIC_CONTROLS.vocalLegibility, 'Legacy controls should receive Vocal Legibility default');
assert.equal(controls.vocalPopulation, DEFAULT_MUSIC_CONTROLS.vocalPopulation, 'Legacy controls should receive Vocal Population default');

const vocalPhysics = normalizeMusicControls({
  mouthFreakery: 91,
  techniqueMutation: 83,
  vocalLegibility: 61,
  vocalPopulation: 88,
  kineticDensity: 94,
});
assert.equal(vocalPhysics.mouthFreakery, 91, 'Mouth Freakery should normalize independently');
assert.equal(vocalPhysics.techniqueMutation, 83, 'Technique Mutation should normalize independently');
assert.equal(vocalPhysics.vocalLegibility, 61, 'Vocal Legibility should normalize independently');
assert.equal(vocalPhysics.vocalPopulation, 88, 'Vocal Population should normalize independently');

const vocalDirectives = musicControlsToDirectives(vocalPhysics).join('\n');
assert.ok(vocalDirectives.includes('MOUTH FREAKERY 91/100'), 'Prompt directives should expose Mouth Freakery');
assert.ok(vocalDirectives.includes('TECHNIQUE MUTATION 83/100'), 'Prompt directives should expose Technique Mutation');
assert.ok(vocalDirectives.includes('VOCAL LEGIBILITY 61/100'), 'Prompt directives should expose Vocal Legibility');
assert.ok(vocalDirectives.includes('VOCAL POPULATION 88/100'), 'Prompt directives should expose Vocal Population');
assert.ok(vocalDirectives.includes('RESTRAINT / FUCK-OFF THRESHOLD'), 'Prompt directives should include anti-pileup restraint law');
assert.ok(vocalDirectives.includes('weirdness target 64'), 'Prompt directives should preserve the Suno working calibration');

console.log(
  'Music Seed Lab verification passed:',
  MUSIC_SEED_RECIPES.length + ' recipes,',
  MUSIC_MECHANISMS.length + ' mechanisms,',
  compiled.mechanisms.length + ' compiled mechanisms,',
  compiled.interactions.length + ' interaction rules.'
);
