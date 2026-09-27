import assert from 'node:assert/strict';
import {
  breedMouthGenome,
  breedMouthSpecies,
  compileMouthMusicalExpression,
  compileMouthPrompt,
  evolveMouthSpecies,
  mouthMusicalExpressionBand,
  normalizeMouthGenomeForGeneration,
  withMouthMusicalExpression,
} from '../src/mouthLab';
import { generateProceduralTrack, TARGETS } from '../src/lib/proceduralGenerator';

const base = breedMouthGenome({
  parentDonorIds: ['mouth-donor-english', 'mouth-donor-spanish'],
  breedingSeed: 'expression-base',
  objectiveId: 'mouth-objective-pathological-consistency',
  semanticAnchorLanguageProfileId: 'lang-english',
  intelligibility: 90,
  stability: 78,
  mutation: 42,
  manualAssignments: [
    {
      axis: 'consonants',
      donorId: 'mouth-donor-spanish',
      traitIds: ['mouth-trait-alveolar-trill'],
      pressure: 'obsessive',
    },
  ],
}).genome;

assert.equal(base.musicalExpression, 0, 'newly bred mouths should default to contained mouth-only expression');
assert.equal(mouthMusicalExpressionBand(0).band, 'articulation');
assert.equal(mouthMusicalExpressionBand(25).band, 'phrasing');
assert.equal(mouthMusicalExpressionBand(45).band, 'melody');
assert.equal(mouthMusicalExpressionBand(65).band, 'orchestration');
assert.equal(mouthMusicalExpressionBand(90).band, 'wholeOrganism');

const at0 = compileMouthMusicalExpression(base);
assert.ok(at0.lyricsDirectives.includes('MOUTH EXPRESSION BOUNDARY'), '0 should explicitly contain Mouth Lab inside articulation');
assert.ok(!at0.lyricsDirectives.includes('LANGUAGE → FORM'), '0 must not authorize whole-form control');

const at25Genome = withMouthMusicalExpression(base, 25);
const at25 = compileMouthMusicalExpression(at25Genome);
assert.ok(at25.lyricsDirectives.includes('LANGUAGE → PHRASING/RHYTHM'), '25 should activate phrasing/rhythm bridge');
assert.ok(!at25.lyricsDirectives.includes('LANGUAGE → MELODY'), '25 should not activate melodic bridge');

const at45Genome = withMouthMusicalExpression(base, 45);
const at45 = compileMouthMusicalExpression(at45Genome);
assert.ok(at45.lyricsDirectives.includes('LANGUAGE → MELODY'), '45 should activate melodic bridge');
assert.ok(!at45.lyricsDirectives.includes('LANGUAGE → HARMONY / INSTRUMENTS'), '45 should not activate orchestration bridge');

const at65Genome = withMouthMusicalExpression(base, 65);
const at65 = compileMouthMusicalExpression(at65Genome);
assert.ok(at65.lyricsDirectives.includes('LANGUAGE → HARMONY / INSTRUMENTS'), '65 should activate harmony/instrument bridge');
assert.ok(!at65.lyricsDirectives.includes('LANGUAGE → FORM'), '65 should not activate whole-form bridge');

const at90Genome = withMouthMusicalExpression(base, 90);
const at90 = compileMouthMusicalExpression(at90Genome);
assert.ok(at90.lyricsDirectives.includes('LANGUAGE → FORM'), '90 should activate whole-form bridge');
assert.ok(at90.lyricsDirectives.includes('TRAIT → RHYTHM'), 'high expression should carry trait-specific musical mappings');
assert.ok(at90.lyricsDirectives.includes('ALVEOLAR TRILL'), 'trait bridge should name the actual inherited mouth trait');

assert.notEqual(at90Genome.id, base.id, 'changing musical expression should create a distinct genome identity');
assert.deepEqual(at90Genome.parentDonorIds, base.parentDonorIds, 'expression must not alter ancestry');
assert.deepEqual(at90Genome.assignments, base.assignments, 'expression must not rewrite mouth genetics');

const normalizedHigh = normalizeMouthGenomeForGeneration({ ...base, musicalExpression: 999 });
const normalizedLow = normalizeMouthGenomeForGeneration({ ...base, musicalExpression: -99 });
assert.equal(normalizedHigh?.musicalExpression, 100, 'generation normalization should clamp expression at 100');
assert.equal(normalizedLow?.musicalExpression, 0, 'generation normalization should clamp expression at 0');

const compiledPrompt = compileMouthPrompt(at90Genome, {
  mode: 'bracketed',
  semanticMode: 'englishMeaningAlienMouth',
});
assert.ok(compiledPrompt.styleDirectives.includes('WHOLE-ORGANISM BRIDGE'), 'STYLE directives should receive whole-organism expression');
assert.ok(compiledPrompt.lyricsDirectives.includes('LANGUAGE → FORM'), 'LYRICS/CONTROL should receive whole-organism mappings');

const secondBase = breedMouthGenome({
  parentDonorIds: ['mouth-donor-english', 'mouth-donor-yoruba'],
  breedingSeed: 'expression-second',
  objectiveId: 'mouth-objective-distance-from-english',
  semanticAnchorLanguageProfileId: 'lang-english',
  intelligibility: 86,
  stability: 70,
  mutation: 38,
}).genome;
const parentA = withMouthMusicalExpression(base, 20);
const parentB = withMouthMusicalExpression(secondBase, 80);
const child = breedMouthSpecies({
  parentA,
  parentB,
  breedingSeed: 'expression-child',
});
assert.equal(child.genome.musicalExpression, 50, 'species breeding should inherit the average expression level');

const selfChild = evolveMouthSpecies({
  parent: at65Genome,
  evolutionSeed: 'expression-self',
  mutationChance: 0,
});
assert.equal(selfChild.genome.musicalExpression, 65, 'self-evolution should preserve musical expression unless explicitly edited');

const procedural = generateProceduralTrack({
  guyIds: [],
  realityEngineIds: [],
  compositionEngineIds: [],
  energy: 4,
  seed: 'mouth expression full organism test',
  mouthGenome: at90Genome,
  mouthSemanticMode: 'englishMeaningAlienMouth',
});
assert.ok(procedural.style.length >= TARGETS.style.min && procedural.style.length <= TARGETS.style.max);
assert.ok(procedural.lyrics.length >= TARGETS.lyrics.min && procedural.lyrics.length <= TARGETS.lyrics.max);
assert.ok(procedural.caption.length >= TARGETS.caption.min && procedural.caption.length <= TARGETS.caption.max);
assert.ok(procedural.lyrics.includes('LANGUAGE → FORM'), 'procedural fallback should preserve whole-organism mouth expression');

console.log('Mouth musical expression verification passed:', {
  bands: [0, 25, 45, 65, 90].map((level) => mouthMusicalExpressionBand(level).label),
  childExpression: child.genome.musicalExpression,
  proceduralLyrics: procedural.lyrics.length,
});
