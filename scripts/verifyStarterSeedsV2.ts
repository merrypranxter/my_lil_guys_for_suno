import assert from 'node:assert/strict';
import {
  STARTER_SEEDS,
  STARTER_SEEDS_BY_CATEGORY,
  compileStarterSeedStackV2,
  validateStarterSeedRegistryV2,
} from '../src/starterSeeds';
import type { StarterSeedDefinition } from '../src/starterSeeds';

const validation = validateStarterSeedRegistryV2(STARTER_SEEDS);
assert.equal(validation.valid, true, validation.errors.join('\n'));

assert(STARTER_SEEDS.length >= 38, 'Expected a substantial starter seed library');
assert.equal(STARTER_SEEDS_BY_CATEGORY.affect.length, 8);
assert.equal(STARTER_SEEDS_BY_CATEGORY.psychedelic.length, 8);
assert.equal(STARTER_SEEDS_BY_CATEGORY.motion.length, 6);
assert.equal(STARTER_SEEDS_BY_CATEGORY.social.length, 6);
assert.equal(STARTER_SEEDS_BY_CATEGORY.worldPackage.length, 6);
assert.equal(STARTER_SEEDS_BY_CATEGORY.instrumentPack.length, 4);

const stack = compileStarterSeedStackV2(STARTER_SEEDS, [
  { instanceId: 'a', seedId: 'affect-divine-exultation', intensity: 90, muted: false, locked: false },
  { instanceId: 'b', seedId: 'psy-lsd-prismatic-recursion', intensity: 80, muted: false, locked: false },
  { instanceId: 'c', seedId: 'world-midnight-call-in-radio', intensity: 100, muted: false, locked: true },
  { instanceId: 'd', seedId: 'instruments-wrong-ensemble-01', intensity: 85, muted: false, locked: false },
]);

assert.equal(stack.activeSeeds.length, 4);
assert(stack.protectedInvariants.some((item) => item.includes('radio')));
assert(stack.eventCues.includes('phone rings'));
assert.equal(stack.compositionEngineIds.length, 8);
assert(stack.directives.some((item) => item.includes('INSTRUMENT ROLE')));

// Duplicate seed instances are not secret weighting. Strongest explicit instance wins.
const duplicate = compileStarterSeedStackV2(STARTER_SEEDS, [
  { instanceId: 'weak', seedId: 'affect-divine-exultation', intensity: 20, muted: false, locked: false },
  { instanceId: 'strong', seedId: 'affect-divine-exultation', intensity: 90, muted: false, locked: true },
]);
assert.equal(duplicate.activeSeeds.length, 1);
assert.equal(duplicate.activeSeeds[0].intensity, 90);
assert.equal(duplicate.activeSeeds[0].locked, true);

// Fractional control contributions must cancel before final rounding.
const fractionalSeeds: StarterSeedDefinition[] = [
  {
    schemaVersion: 1,
    id: 'frac-plus',
    name: 'FRAC PLUS',
    category: 'motion',
    description: 'test',
    defaultIntensity: 50,
    tags: [],
    owns: ['kineticDensity'],
    biases: [],
    protects: [],
    forbids: [],
    operators: ['test'],
    outputs: { musicControlDeltas: { kineticDensity: 1 } },
  },
  {
    schemaVersion: 1,
    id: 'frac-minus',
    name: 'FRAC MINUS',
    category: 'motion',
    description: 'test',
    defaultIntensity: 50,
    tags: [],
    owns: ['kineticDensity'],
    biases: [],
    protects: [],
    forbids: [],
    operators: ['test'],
    outputs: { musicControlDeltas: { kineticDensity: -1 } },
  },
];
const fractional = compileStarterSeedStackV2(fractionalSeeds, [
  { instanceId: 'plus', seedId: 'frac-plus', intensity: 50, muted: false, locked: false },
  { instanceId: 'minus', seedId: 'frac-minus', intensity: 50, muted: false, locked: false },
]);
assert.equal(fractional.musicControlDeltas.kineticDensity, 0);

// Reference reinforcement must be independent of stack order.
const refSeeds: StarterSeedDefinition[] = [40, 40, 80].map((strength, index) => ({
  schemaVersion: 1,
  id: 'ref-' + index,
  name: 'REF ' + index,
  category: 'motion',
  description: 'test',
  defaultIntensity: 100,
  tags: [],
  owns: ['kineticDensity'],
  biases: [],
  protects: [],
  forbids: [],
  operators: ['test'],
  outputs: { musicMechanismRefs: [{ id: 'anchor-survival', strength }] },
}));
const orderA = compileStarterSeedStackV2(refSeeds, refSeeds.map((seed, index) => ({
  instanceId: 'a-' + index,
  seedId: seed.id,
  intensity: 100,
  muted: false,
  locked: false,
})));
const orderB = compileStarterSeedStackV2(refSeeds, [...refSeeds].reverse().map((seed, index) => ({
  instanceId: 'b-' + index,
  seedId: seed.id,
  intensity: 100,
  muted: false,
  locked: false,
})));
assert.equal(orderA.musicMechanismRefs[0].strength, orderB.musicMechanismRefs[0].strength);

// Bad instrument role mapping must be rejected even when counts happen to match.
const badInstrument: StarterSeedDefinition = {
  schemaVersion: 1,
  id: 'bad-instrument',
  name: 'BAD INSTRUMENT',
  category: 'instrumentPack',
  description: 'test',
  defaultIntensity: 50,
  tags: [],
  owns: ['instrumentation'],
  biases: [],
  protects: [],
  forbids: [],
  operators: ['test'],
  outputs: { compositionEngineIds: ['sound-piano', 'sound-bass-clarinet'] },
  instrumentRoles: [
    { engineId: 'sound-piano', jurisdiction: 'a', role: 'a' },
    { engineId: 'sound-piano', jurisdiction: 'b', role: 'b' },
  ],
};
const badInstrumentValidation = validateStarterSeedRegistryV2([badInstrument]);
assert.equal(badInstrumentValidation.valid, false);
assert(badInstrumentValidation.errors.some((item) => item.includes('duplicate instrument role')));
assert(badInstrumentValidation.errors.some((item) => item.includes('missing roles')));

// Unknown engine references fail validation instead of silently disappearing downstream.
const badRef: StarterSeedDefinition = {
  schemaVersion: 1,
  id: 'bad-ref',
  name: 'BAD REF',
  category: 'motion',
  description: 'test',
  defaultIntensity: 50,
  tags: [],
  owns: ['form'],
  biases: [],
  protects: [],
  forbids: [],
  operators: ['test'],
  outputs: { realityEngineIds: ['definitely-not-a-real-engine'] },
};
const badRefValidation = validateStarterSeedRegistryV2([badRef]);
assert.equal(badRefValidation.valid, false);
assert(badRefValidation.errors.some((item) => item.includes('unknown Reality Engine id')));

// Multiple exclusive claims must not silently pick first-by-order.
const exclusiveSeeds: StarterSeedDefinition[] = ['x', 'y'].map((id) => ({
  schemaVersion: 1,
  id: 'exclusive-' + id,
  name: 'EXCLUSIVE ' + id.toUpperCase(),
  category: 'motion',
  description: 'test',
  defaultIntensity: 100,
  tags: [],
  owns: ['rhythmicBehavior'],
  biases: [],
  protects: [],
  forbids: [],
  operators: ['test'],
  collisionMode: 'exclusive',
}));
const exclusive = compileStarterSeedStackV2(exclusiveSeeds, exclusiveSeeds.map((seed) => ({
  instanceId: seed.id,
  seedId: seed.id,
  intensity: 100,
  muted: false,
  locked: false,
})));
assert(exclusive.collisions[0].directive.includes('MULTIPLE EXCLUSIVE CLAIMS'));

console.log('Starter Seed Stack V2 + content library verification passed with ' + STARTER_SEEDS.length + ' seeds.');
