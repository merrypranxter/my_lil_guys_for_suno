import assert from 'node:assert/strict';
import { DEFAULT_MUSIC_CONTROLS } from '../src/data/musicSeedSystem';
import { buildMasterPrompt } from '../src/lib/buildGenerationPrompt';
import {
  applyStarterSeedStackToLab,
  normalizeStarterSeedStack,
  starterSeedPromptBlock,
} from '../src/starterSeeds/runtime';

const starterStack = normalizeStarterSeedStack([
  { instanceId: 'joy', seedId: 'affect-divine-exultation', intensity: 90, muted: false, locked: false },
  { instanceId: 'world', seedId: 'world-midnight-call-in-radio', intensity: 100, muted: false, locked: true },
  { instanceId: 'instruments', seedId: 'instruments-wrong-ensemble-01', intensity: 85, muted: false, locked: false },
]);

assert.equal(starterStack.length, 3);

const applied = applyStarterSeedStackToLab(starterStack, {
  realityEngineIds: [],
  compositionEngineIds: [],
  musicStack: [],
  musicControls: { ...DEFAULT_MUSIC_CONTROLS },
  realityChaos: 2,
});

assert(applied.realityEngineIds.includes('format-call-in-radio'));
assert.equal(applied.compositionEngineIds.length, 8);
assert(applied.musicStack.some((item) => item.instanceId.startsWith('starter-seed:')));
assert(applied.musicControls.socialInfection > DEFAULT_MUSIC_CONTROLS.socialInfection);

const appliedTwice = applyStarterSeedStackToLab(starterStack, {
  realityEngineIds: applied.realityEngineIds,
  compositionEngineIds: applied.compositionEngineIds,
  musicStack: applied.musicStack,
  musicControls: applied.musicControls,
  realityChaos: applied.realityChaos,
});

assert.equal(
  appliedTwice.musicStack.filter((item) => item.instanceId.startsWith('starter-seed:')).length,
  applied.musicStack.filter((item) => item.instanceId.startsWith('starter-seed:')).length,
  'BUILD ME should replace its own emitted music genes instead of duplicating them',
);
assert.deepEqual(
  appliedTwice.musicControls,
  applied.musicControls,
  'Repeated BUILD ME with the same stack should not compound control deltas',
);

const block = starterSeedPromptBlock(starterStack);
assert(block.includes('MIDNIGHT CALL-IN RADIO'));
assert(block.includes('PROTECTED INVARIANTS'));
assert(block.includes('phone rings'));

const prompt = buildMasterPrompt({
  guyIds: ['taxonomy-goblin'],
  starterSeedStack: starterStack,
  realityEngineIds: applied.realityEngineIds,
  compositionEngineIds: applied.compositionEngineIds,
  musicStack: applied.musicStack,
  musicControls: applied.musicControls,
  realityChaos: applied.realityChaos,
  seed: 'a fluorescent tax form folding itself into a tesseract',
  energy: 4,
});

assert(prompt.userPrompt.includes('STARTER SEED STACK / INITIAL CONDITIONS'));
assert(prompt.userPrompt.includes('DIVINE EXULTATION'));
assert(prompt.userPrompt.includes('the host keeps trying to conduct an ordinary live radio show'));
assert(prompt.systemInstruction.includes('STARTER SEEDS ARE INITIAL CONDITIONS'));

const pitchStack = normalizeStarterSeedStack([{ instanceId: 'pitch', seedId: 'tuning-prestandard-432', intensity: 85, muted: false, locked: true }]);
assert.equal(pitchStack.length, 1);
const pitchApplied = applyStarterSeedStackToLab(pitchStack, {
  realityEngineIds: [],
  compositionEngineIds: ['tuning-pythagorean'],
  musicStack: [],
  musicControls: { ...DEFAULT_MUSIC_CONTROLS },
  realityChaos: 2,
});
assert.deepEqual(pitchApplied.compositionEngineIds, ['tuning-pythagorean']);
const pitchPrompt = buildMasterPrompt({
  guyIds: ['taxonomy-goblin'],
  starterSeedStack: pitchStack,
  compositionEngineIds: pitchApplied.compositionEngineIds,
  seed: 'a frantic vocal quartet',
  energy: 4,
});
assert(pitchPrompt.userPrompt.includes('A4=432 Hz'));
assert(pitchPrompt.userPrompt.includes('PYTHAGOREAN TUNING'));
assert(!starterSeedPromptBlock([{ ...pitchStack[0], muted: true }]).includes('A4=432 Hz'));

console.log('Starter Seed UI/runtime verification passed.');
