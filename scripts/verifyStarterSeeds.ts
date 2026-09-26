import assert from 'node:assert/strict';
import { compileStarterSeedStack, validateStarterSeedRegistry } from '../src/starterSeeds';

const registry = [
  {
    schemaVersion: 1 as const,
    id: 'divine-test',
    name: 'DIVINE TEST',
    category: 'affect' as const,
    description: 'Verification seed for positive-valence harmonic lift.',
    defaultIntensity: 80,
    tags: ['test'],
    owns: ['emotionalValence', 'harmonicTrajectory'] as const,
    biases: ['upward motion'],
    protects: ['positive emotional valence'],
    forbids: ['melancholy creep'],
    operators: ['Each return expands upward and recruits more voices.'],
    outputs: {
      musicControlDeltas: { socialInfection: 20, anchorStrength: 10 },
      musicMechanismRefs: [{ id: 'communal-infection', strength: 80 }],
    },
  },
  {
    schemaVersion: 1 as const,
    id: 'laughing-test',
    name: 'LAUGHING TEST',
    category: 'social' as const,
    description: 'Verification seed for laughter contagion.',
    defaultIntensity: 60,
    tags: ['test'],
    owns: ['socialBehavior', 'emotionalValence'] as const,
    biases: ['breath rhythm'],
    protects: ['joy remains audible'],
    forbids: ['solemn drift'],
    operators: ['A chuckle becomes a rhythmic trigger and spreads performer by performer.'],
    outputs: {
      musicControlDeltas: { socialInfection: 30 },
      musicMechanismRefs: [{ id: 'communal-infection', strength: 70 }],
    },
  },
  {
    schemaVersion: 1 as const,
    id: 'radio-test',
    name: 'MIDNIGHT RADIO TEST',
    category: 'worldPackage' as const,
    description: 'Verification world package.',
    defaultIntensity: 100,
    tags: ['test'],
    owns: ['semanticWorld', 'cast', 'medium', 'eventLogic'] as const,
    biases: ['deadpan continuity'],
    protects: ['the broadcast remains identifiable'],
    forbids: ['world frame silently disappears'],
    operators: ['Every major musical rupture is still treated as part of the live broadcast.'],
    collisionMode: 'protect' as const,
    worldFrame: {
      setting: 'tiny AM station after midnight',
      medium: 'live call-in radio',
      primaryCharacter: 'dry night DJ',
      supportingCast: ['callers', 'engineer', 'station voice'],
      recurringConcern: 'callers report versions of the same unexplained event',
      eventCues: ['phone rings', 'caller connects', 'station ID', 'commercial break'],
      invariant: 'the DJ keeps trying to conduct an ordinary radio show',
    },
    outputs: {
      realityEngineIds: ['format-call-in-radio', 'role-radio-dj', 'format-call-in-radio'],
      realityChaos: 2 as const,
    },
  },
];

const validation = validateStarterSeedRegistry(registry.map((seed) => ({
  ...seed,
  owns: [...seed.owns],
})));
assert.equal(validation.valid, true, validation.errors.join('\n'));

const compiled = compileStarterSeedStack(
  registry.map((seed) => ({ ...seed, owns: [...seed.owns] })),
  [
    { instanceId: 'a', seedId: 'divine-test', intensity: 100, muted: false, locked: false },
    { instanceId: 'b', seedId: 'laughing-test', intensity: 100, muted: false, locked: false },
    { instanceId: 'c', seedId: 'radio-test', intensity: 100, muted: false, locked: true },
  ],
);

assert.equal(compiled.activeSeeds.length, 3);
assert.equal(compiled.realityEngineIds.length, 2, 'reality IDs should dedupe');
assert(compiled.protectedInvariants.includes('the DJ keeps trying to conduct an ordinary radio show'));
assert(compiled.eventCues.includes('phone rings'));
assert.equal(compiled.collisions.length, 1);
assert.equal(compiled.collisions[0].jurisdiction, 'emotionalValence');
assert(compiled.collisions[0].directive.includes('DO NOT average'));
assert.equal(compiled.musicMechanismRefs.length, 1, 'duplicate mechanism refs should reinforce');
assert(compiled.musicMechanismRefs[0].strength > 80, 'duplicate mechanism contribution should reinforce sublinearly');
assert.equal(compiled.musicControlDeltas.socialInfection, 50);
assert.equal(compiled.realityChaos, 2);

const badValidation = validateStarterSeedRegistry([
  {
    ...registry[2],
    owns: [...registry[2].owns],
    id: 'bad-world',
    worldFrame: undefined,
  },
]);
assert.equal(badValidation.valid, false);
assert(badValidation.errors.some((error) => error.includes('worldPackage requires worldFrame')));

console.log('Starter Seed Stack verification passed.');
