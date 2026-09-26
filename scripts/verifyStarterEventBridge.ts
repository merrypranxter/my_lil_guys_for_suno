import assert from 'node:assert/strict';
import { STARTER_SEEDS } from '../src/starterSeeds/library';
import { compileStarterSeedStackV2 } from '../src/starterSeeds/compilerV2';
import { compileStarterEventBridge } from '../src/starterSeeds/eventBridge';
import { normalizeStarterSeedStack, starterSeedPromptBlock } from '../src/starterSeeds/runtime';

const stack = normalizeStarterSeedStack([
  {
    instanceId: 'world',
    seedId: 'world-midnight-call-in-radio',
    intensity: 100,
    muted: false,
    locked: false,
  },
  {
    instanceId: 'joy',
    seedId: 'affect-divine-exultation',
    intensity: 90,
    muted: false,
    locked: false,
  },
]);

const worldItem = stack.find((item) => item.seedId === 'world-midnight-call-in-radio');
assert(worldItem, 'World item should survive normalization.');
assert.equal(worldItem!.eventBridgeEnabled, true, 'Old/persisted world items should default the event bridge ON.');

const compiled = compileStarterSeedStackV2(STARTER_SEEDS, stack);
const bridge = compileStarterEventBridge(compiled, stack);

assert.equal(bridge.enabledWorldSeedIds.length, 1);
assert(bridge.bindings.length >= 5);
assert(bridge.bindings.some((binding) => binding.cue === 'phone rings'));
assert(
  bridge.bindings.every((binding) => binding.directive.includes('Keep the world frame intact')),
  'Every binding should preserve the semantic world frame.',
);
assert(
  bridge.bindings.some((binding) => binding.source === 'active-stack'),
  'When musical genes are active, the bridge should preferentially use them.',
);

const promptBlock = starterSeedPromptBlock(stack);
assert(promptBlock.includes('WORLD → MUSIC EVENT BRIDGE:'));
assert(promptBlock.includes('phone rings'));
assert(promptBlock.includes('audible structural response'));

const offStack = normalizeStarterSeedStack([
  {
    instanceId: 'world-off',
    seedId: 'world-midnight-call-in-radio',
    intensity: 100,
    muted: false,
    locked: false,
    eventBridgeEnabled: false,
  },
]);
const offCompiled = compileStarterSeedStackV2(STARTER_SEEDS, offStack);
const offBridge = compileStarterEventBridge(offCompiled, offStack);
assert.equal(offBridge.bindings.length, 0, 'Explicit OFF must completely disable world-to-music bindings.');
assert(!starterSeedPromptBlock(offStack).includes('WORLD → MUSIC EVENT BRIDGE:'));

const fallbackStack = normalizeStarterSeedStack([
  {
    instanceId: 'lab',
    seedId: 'world-mad-scientist-lab-show',
    intensity: 100,
    muted: false,
    locked: false,
  },
]);
const fallbackCompiled = compileStarterSeedStackV2(STARTER_SEEDS, fallbackStack);
const fallbackBridge = compileStarterEventBridge(fallbackCompiled, fallbackStack);
assert(fallbackBridge.bindings.length > 0);
assert(
  fallbackBridge.bindings.some((binding) => binding.source === 'fallback'),
  'A world package used alone should still have a minimal audible event bridge.',
);
assert(
  fallbackBridge.bindings.some((binding) => binding.cue === 'knife switch thrown'),
  'New mad-scientist world events should be bridged.',
);

const bridgeA = compileStarterEventBridge(compiled, stack);
const bridgeB = compileStarterEventBridge(compiled, stack);
assert.deepEqual(bridgeA, bridgeB, 'Event bridge compilation must be deterministic.');

console.log('Starter world → music event bridge verification passed.');
