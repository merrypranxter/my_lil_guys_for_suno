import assert from 'node:assert/strict';
import { LITTLE_GUYS } from '../src/data/littleGuys';
import {
  buildSeedSovereigntyContract,
  detectDirectSeedUtterance,
  evaluateLiteralSeedCoverage,
  evaluateRequiredSeedLyricsCoverage,
  extractRequiredVerbatimSeedAnchors,
  renderLayerJurisdictionMatrix,
  renderSeedSovereigntyContract,
} from '../src/lib/generationJurisdictions';
import { buildMasterPrompt } from '../src/lib/buildGenerationPrompt';

const seed = 'joyous drag queen shenanigans in a 4 dimensional tesseract with citric acid';
const contract = buildSeedSovereigntyContract(seed);

assert.equal(contract.hasSeed, true);
assert.equal(contract.rawSeed, seed);
assert(contract.literalAnchors.includes('joyous'));
assert(contract.literalAnchors.includes('tesseract'));
assert(contract.literalAnchors.includes('citric'));

const renderedSeed = renderSeedSovereigntyContract(seed);
assert(renderedSeed.includes('SEED IS SOVEREIGN OVER SUBJECT MATTER.'));
assert(renderedSeed.includes(seed));
assert(renderedSeed.includes('Music genomes may inherit musical mechanisms only.'));

const matrix = renderLayerJurisdictionMatrix();
for (const layer of ['[SEED]', '[REALITY]', '[MINDS]', '[COMPOSITION]', '[GENOME / MUSIC SEED]', '[FORMATTER]']) {
  assert(matrix.includes(layer), 'Missing jurisdiction layer ' + layer);
}
assert(matrix.includes('Explicit current user seed beats inherited semantic drift.'));
assert(matrix.includes('Explicit current Composition selection beats conflicting inherited musical defaults.'));

const covered = evaluateLiteralSeedCoverage(seed, [
  'A joyous tesseract rotates while citric acid is measured.',
]);
assert(covered.coverage > 0);
assert(covered.matched.includes('tesseract'));

const drifted = evaluateLiteralSeedCoverage('tesseract citric acid', [
  'A hostile crowd argues about ontology and grammar.',
]);
assert.equal(drifted.coverage, 0);

const noSeed = evaluateLiteralSeedCoverage('', ['anything']);
assert.equal(noSeed.coverage, 1);
assert.equal(noSeed.anchors.length, 0);

const prompt = buildMasterPrompt({
  guyIds: [LITTLE_GUYS[0].id],
  seed,
  energy: 4,
});

assert(prompt.userPrompt.includes('SEED SOVEREIGNTY CONTRACT:'));
assert(prompt.userPrompt.includes('GENERATION JURISDICTION / AUTHORITY MATRIX:'));
assert(prompt.userPrompt.includes('SOVEREIGN SEED / SUBJECT / EXPERIMENT:'));
assert(prompt.userPrompt.includes(seed));
assert(prompt.systemInstruction.includes('Minds own cognitive transformation, not subject replacement'));
assert(prompt.systemInstruction.includes('MUSIC SEED STACK IS PRECOMPILED MUSICAL PHYSICS, NOT A PRESET AND NOT A STORY GENERATOR'));

console.log('Jurisdiction enforcement verified: seed sovereignty, layer ownership, collision precedence, and literal seed-drift detection.');


const directSeed = 'FUCK THIS SHIT';
const directContract = buildSeedSovereigntyContract(directSeed);
assert.equal(detectDirectSeedUtterance(directSeed), directSeed);
assert.deepEqual(directContract.requiredVerbatimLyricAnchors, [directSeed]);
assert(
  renderSeedSovereigntyContract(directSeed).includes('Direct standalone utterance anchor: FUCK THIS SHIT'),
  'Short standalone utterance should be classified as direct lyric material.',
);
assert.equal(
  evaluateRequiredSeedLyricsCoverage(directSeed, '[VERSE]\nFUCK THIS SHIT\nwe are done here').coverage,
  1,
  'Direct utterance should count only when present in sung/unbracketed lyric text.',
);
assert.equal(
  evaluateRequiredSeedLyricsCoverage(directSeed, '[SUBJECT: FUCK THIS SHIT]\nwe are done here').coverage,
  0,
  'A control/meta mention must not satisfy direct lyric coverage.',
);

const contextualQuotedSeed = 'furious at the machine, finally saying "FUCK YOU" while it keeps smiling';
assert.deepEqual(
  extractRequiredVerbatimSeedAnchors(contextualQuotedSeed),
  ['FUCK YOU'],
  'Quoted material inside a longer concept should be the only required verbatim anchor.',
);
assert.equal(
  evaluateRequiredSeedLyricsCoverage(
    contextualQuotedSeed,
    '[VERSE]\nThe machine keeps smiling while the pressure climbs\nFUCK YOU\nI stop negotiating',
  ).coverage,
  1,
);
const contextualContract = renderSeedSovereigntyContract(contextualQuotedSeed);
assert(contextualContract.includes('Preserve the broader meaning'));
assert(contextualContract.includes('FUCK YOU'));

const longConceptSeed = 'I am furious at this cheerful machine and want a song about refusing to cooperate with it anymore';
assert.equal(
  detectDirectSeedUtterance(longConceptSeed),
  undefined,
  'Long conceptual seeds should not be forced verbatim.',
);
assert.equal(
  extractRequiredVerbatimSeedAnchors(longConceptSeed).length,
  0,
  'Long unquoted concept should preserve meaning without requiring exact wording.',
);

const instructionSeed = 'make a song about FUCK THIS SHIT';
assert.equal(
  detectDirectSeedUtterance(instructionSeed),
  undefined,
  'Short instruction phrasing should not be mistaken for a direct utterance.',
);
