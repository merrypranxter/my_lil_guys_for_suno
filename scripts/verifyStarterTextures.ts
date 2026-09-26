import assert from 'node:assert/strict';
import { STARTER_SEEDS, STARTER_SEEDS_BY_CATEGORY } from '../src/starterSeeds/library';
import { compileStarterSeedStackV2, validateStarterSeedRegistryV2 } from '../src/starterSeeds/compilerV2';
import { starterSeedPromptBlock } from '../src/starterSeeds/runtime';

const textureSeeds = STARTER_SEEDS_BY_CATEGORY.texture || [];
assert.equal(textureSeeds.length, 13, 'Expected the full tactile texture starter pack.');

const required = [
  'texture-glittering',
  'texture-rubbery',
  'texture-effervescent',
  'texture-chrome',
  'texture-sticky',
  'texture-crunchy',
  'texture-bubbling',
  'texture-prismatic',
  'texture-wet',
  'texture-spring-loaded',
  'texture-toybox-physical',
  'texture-cheap-analog',
  'texture-hyper-clean-impossible-object',
];

for (const id of required) {
  const seed = STARTER_SEEDS.find((item) => item.id === id);
  assert(seed, id + ' should exist.');
  assert.equal(seed!.category, 'texture');
  assert(seed!.operators.length >= 2, id + ' should contain executable texture operators.');
  assert(
    (seed!.outputs?.promptDirectives || []).some((line) => line.includes('TEXTURE PHYSICS')),
    id + ' should translate the adjective into explicit audio physics.',
  );
  assert(
    seed!.forbids.length > 0,
    id + ' should include anti-drift rules so the texture does not collapse into a generic adjective.',
  );
}

const validation = validateStarterSeedRegistryV2(STARTER_SEEDS);
assert.equal(validation.valid, true, validation.errors.join('\n'));

const stack = [
  { instanceId: 'glitter', seedId: 'texture-glittering', intensity: 88, muted: false, locked: false },
  { instanceId: 'chrome', seedId: 'texture-chrome', intensity: 76, muted: false, locked: false },
  { instanceId: 'toybox', seedId: 'texture-toybox-physical', intensity: 82, muted: false, locked: false },
];

const compiled = compileStarterSeedStackV2(STARTER_SEEDS, stack);
assert.equal(compiled.activeSeeds.length, 3);
assert(
  compiled.collisions.some((collision) => collision.jurisdiction === 'timbre'),
  'Stacked texture seeds should explicitly negotiate shared timbre jurisdiction rather than average into mush.',
);
assert(
  compiled.directives.some((line) => line.includes('TEXTURE PHYSICS')),
  'Compiled Starter stack should retain operational texture directives.',
);
assert(
  compiled.musicControlDeltas.stemminess && compiled.musicControlDeltas.stemminess > 0,
  'Texture pack should be able to increase separation/stemminess when appropriate.',
);

const prompt = starterSeedPromptBlock(stack);
assert(prompt.includes('GLITTERING'));
assert(prompt.includes('CHROME'));
assert(prompt.includes('TOYBOX PHYSICAL'));
assert(prompt.includes('JURISDICTION COLLISION [timbre]'));
assert(prompt.includes('micro-transients'));
assert(prompt.includes('mechanical clicks'));

console.log('Starter texture / sensory seed verification passed.');
