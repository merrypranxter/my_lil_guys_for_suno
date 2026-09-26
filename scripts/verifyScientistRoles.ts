import assert from 'node:assert/strict';
import { getRealityEngine } from '../src/data/realityEngines';
import { analyzeRealityPair } from '../src/lib/realityChemistry';
import { STARTER_SEEDS } from '../src/starterSeeds/library';
import { validateStarterSeedRegistryV2 } from '../src/starterSeeds/compilerV2';

const scientist = getRealityEngine('role-scientist');
const madScientist = getRealityEngine('role-mad-scientist');
const training = getRealityEngine('format-training-video');
const publicAccess = getRealityEngine('format-public-access-show');

assert(scientist, 'SCIENTIST role should be registered.');
assert(madScientist, 'MAD SCIENTIST role should be registered.');
assert.equal(scientist!.dimension, 'role');
assert.equal(madScientist!.dimension, 'role');
assert(scientist!.rule.includes('distinguish observation from inference'));
assert(madScientist!.rule.includes('every new catastrophe comes from a specific intervention'));

assert(training && publicAccess);
assert(
  analyzeRealityPair(training!, scientist!).affinity >= 28,
  'Training-video scientist should be a strong coherent pairing.',
);
assert(
  analyzeRealityPair(publicAccess!, madScientist!).affinity >= 24,
  'Public-access mad scientist should be a useful coherent pairing.',
);

const controlled = STARTER_SEEDS.find((seed) => seed.id === 'world-controlled-lab-demo');
const madLab = STARTER_SEEDS.find((seed) => seed.id === 'world-mad-scientist-lab-show');
assert(controlled, 'Controlled lab starter world should exist.');
assert(madLab, 'Mad scientist lab starter world should exist.');
assert(controlled!.outputs?.realityEngineIds?.includes('role-scientist'));
assert(madLab!.outputs?.realityEngineIds?.includes('role-mad-scientist'));

const validation = validateStarterSeedRegistryV2(STARTER_SEEDS);
assert.equal(validation.valid, true, validation.errors.join('\n'));

console.log('Scientist Reality roles verification passed.');
