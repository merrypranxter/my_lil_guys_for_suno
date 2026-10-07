import assert from 'node:assert/strict';
import { LITTLE_GUYS } from '../src/data/littleGuys';
import {
  COMPOSITION_ENGINES,
  normalizeCompositionEngineIds,
} from '../src/data/compositionEngines';
import {
  getMusicSeedRecipe,
  getMusicMechanism,
} from '../src/data/musicSeedSystem';
import { SPECIALTY_WHOLE_STACK_RECIPES } from '../src/data/specialtyWholeStackRecipes';
import { SPECIALTY_COMPOSITION_PRESETS } from '../src/data/specialtyCompositionPresets';
import { generateProceduralTrack, TARGETS } from '../src/lib/proceduralGenerator';

const recipe = SPECIALTY_WHOLE_STACK_RECIPES.find(
  (item) => item.id === 'builtin-specialty-ecstatic-choir-never-arrives',
);
assert.ok(recipe, 'ecstatic choir specialty recipe should exist');

const guyIds = new Set(LITTLE_GUYS.map((item) => item.id));
for (const id of recipe.guyIds) {
  assert.ok(guyIds.has(id), 'recipe references unknown Little Guy: ' + id);
}

const engineIds = new Set(COMPOSITION_ENGINES.map((item) => item.id));
for (const id of recipe.compositionEngineIds) {
  assert.ok(engineIds.has(id), 'recipe references unknown composition engine: ' + id);
}
assert.deepEqual(
  normalizeCompositionEngineIds(recipe.compositionEngineIds),
  recipe.compositionEngineIds,
  'specialty recipe should obey per-dimension composition limits without silently dropping engines',
);

assert.ok(
  recipe.compositionEngineIds.includes('ensemble-antiphonal-choirs'),
  'recipe should contain an actual choir topology',
);
assert.ok(
  recipe.compositionEngineIds.includes('rhythm-coprime-cycles') &&
    recipe.compositionEngineIds.includes('rhythm-phase-shift'),
  'recipe should contain independent polyrhythmic clocks',
);
assert.ok(
  recipe.compositionEngineIds.includes('tuning-prime-lattice'),
  'recipe should contain a non-generic harmonic pitch world',
);

for (const id of [
  'sound-glass-harmonica',
  'sound-cristal-baschet',
  'sound-bowed-vibraphone',
  'sound-musical-saw',
  'sound-ondes-martenot',
  'sound-bowed-piano-strings',
]) {
  assert.ok(recipe.compositionEngineIds.includes(id), 'missing luminous sound source: ' + id);
}

assert.equal(recipe.musicStack?.length, 1, 'whole-stack recipe should load one intentional music recipe');
const musicRecipeId = recipe.musicStack?.[0]?.refId;
assert.equal(musicRecipeId, 'ecstatic-choir-never-arrives');

const musicRecipe = getMusicSeedRecipe(musicRecipeId!);
assert.ok(musicRecipe, 'music recipe should exist');
for (const mechanismId of musicRecipe.mechanismIds) {
  assert.ok(getMusicMechanism(mechanismId), 'music recipe references unknown mechanism: ' + mechanismId);
}

for (const id of [
  'choral-counterpoint-lattice',
  'polyharmonic-suspension-field',
  'perpetual-uplift',
  'luminous-friction-orchestra',
]) {
  assert.ok(musicRecipe.mechanismIds.includes(id), 'missing choir mechanism: ' + id);
}

const luminousPreset = SPECIALTY_COMPOSITION_PRESETS.find(
  (item) => item.id === 'builtin-composition-luminous-friction-orchestra',
);
assert.ok(luminousPreset, 'luminous friction composition preset should exist');
assert.equal(luminousPreset.compositionEngineIds.length, 6, 'instrument-only palette should stay focused');
assert.deepEqual(
  normalizeCompositionEngineIds(luminousPreset.compositionEngineIds),
  luminousPreset.compositionEngineIds,
  'instrument palette should obey composition dimension limits',
);
assert.deepEqual(
  luminousPreset.lockedEngineIds,
  luminousPreset.compositionEngineIds,
  'built-in instrument palette should lock its chosen sound sources when loaded',
);

const generated = generateProceduralTrack({
  guyIds: recipe.guyIds,
  realityEngineIds: recipe.realityEngineIds,
  compositionEngineIds: recipe.compositionEngineIds,
  musicStack: recipe.musicStack,
  musicControls: recipe.musicControls,
  realityChaos: recipe.realityChaos,
  energy: 5,
  seed: 'secular ecstatic choir that keeps almost resolving but opens upward again',
  mouthPromptMode: recipe.mouthPromptMode,
  mouthSemanticMode: recipe.mouthSemanticMode,
});

assert.ok(generated.style.length >= TARGETS.style.min && generated.style.length <= TARGETS.style.max);
assert.ok(generated.lyrics.length >= TARGETS.lyrics.min && generated.lyrics.length <= TARGETS.lyrics.max);
assert.ok(generated.caption.length >= TARGETS.caption.min && generated.caption.length <= TARGETS.caption.max);
assert.match(generated.lyrics, /CHOIR|choir/);
assert.match(generated.lyrics, /resolution|cadence|suspension/i);
assert.match(generated.lyrics, /glass|Cristal|vibraphone|saw|Martenot|piano/i);


const bluegrass = SPECIALTY_WHOLE_STACK_RECIPES.find(
  (item) => item.id === 'builtin-specialty-bluegrass-particle-accelerator',
);
assert.ok(bluegrass, 'BLUEGRASS PARTICLE ACCELERATOR specialty recipe should exist');
assert.equal(
  bluegrass.musicStack?.[0]?.refId,
  'bluegrass-particle-accelerator',
  'Bluegrass preset should load its dedicated music recipe',
);
for (const id of bluegrass.guyIds) {
  assert.ok(guyIds.has(id), 'Bluegrass preset references unknown Little Guy: ' + id);
}
for (const id of bluegrass.compositionEngineIds) {
  assert.ok(engineIds.has(id), 'Bluegrass preset references unknown composition engine: ' + id);
}
assert.deepEqual(
  normalizeCompositionEngineIds(bluegrass.compositionEngineIds),
  bluegrass.compositionEngineIds,
  'Bluegrass preset should obey composition dimension limits without silently dropping temporal or acoustic sources',
);
for (const id of [
  'sound-banjo',
  'sound-violin',
  'sound-mandolin',
  'sound-resonator-guitar-dobro',
  'sound-upright-bass',
  'sound-acoustic-guitar',
  'rhythm-tempo-canon',
  'rhythm-polymeter',
  'roleexchange-rhythm-to-melody',
  'roleexchange-accompaniment-lead',
  'ensemble-rotating-soloist',
]) {
  assert.ok(bluegrass.compositionEngineIds.includes(id), 'Bluegrass preset missing composition engine: ' + id);
}
const bluegrassMusic = getMusicSeedRecipe('bluegrass-particle-accelerator');
assert.ok(bluegrassMusic, 'Bluegrass Particle Accelerator music recipe should exist');
for (const id of [
  'string-band-clock-split',
  'acoustic-activity-separation',
  'acoustic-handoff-collider',
  'breakdown-exposure-rebuild',
  'double-time-activity',
  'hocket-relay',
  'exposure-windows',
  'dry-separation',
  'anchor-survival',
]) {
  assert.ok(bluegrassMusic!.mechanismIds.includes(id), 'Bluegrass recipe missing music mechanism: ' + id);
}
assert.equal(bluegrass.musicControls?.stemminess, 96);
assert.equal(bluegrass.musicControls?.kineticDensity, 94);
assert.ok((bluegrass.musicControls?.coupling || 0) >= 85, 'Bluegrass preset should preserve several explicit temporal truths');
assert.ok((bluegrass.musicControls?.anchorStrength || 0) >= 80, 'Bluegrass preset should keep the tune/groove legible under high activity');

const detroit = SPECIALTY_WHOLE_STACK_RECIPES.find(
  (item) => item.id === 'builtin-specialty-detroit-assembly-line-possession',
);
assert.ok(detroit, 'DETROIT ASSEMBLY-LINE POSSESSION specialty recipe should exist');
assert.equal(
  detroit.musicStack?.[0]?.refId,
  'detroit-assembly-line-possession',
  'Detroit preset should load its dedicated music recipe',
);
for (const id of detroit.guyIds) {
  assert.ok(guyIds.has(id), 'Detroit preset references unknown Little Guy: ' + id);
}
for (const id of detroit.compositionEngineIds) {
  assert.ok(engineIds.has(id), 'Detroit preset references unknown composition engine: ' + id);
}
assert.deepEqual(
  normalizeCompositionEngineIds(detroit.compositionEngineIds),
  detroit.compositionEngineIds,
  'Detroit preset should obey composition dimension limits without silently dropping groove infrastructure',
);
for (const id of [
  'sound-electric-bass',
  'sound-kick-drum',
  'sound-snare-drum',
  'sound-hand-claps',
  'sound-electric-guitar-clean',
  'sound-grand-piano',
  'sound-trumpet',
  'sound-tenor-sax',
  'roleexchange-bass-narrates',
  'roleexchange-silence-downbeat',
  'ensemble-leader-echo',
]) {
  assert.ok(detroit.compositionEngineIds.includes(id), 'Detroit preset missing composition engine: ' + id);
}
const detroitMusic = getMusicSeedRecipe('detroit-assembly-line-possession');
assert.ok(detroitMusic, 'Detroit music recipe should exist');
for (const id of [
  'pocket-quarantine',
  'negative-space-replies',
  'assembly-line-microjobs',
  'outer-layer-possession',
  'call-response',
  'communal-infection',
  'dry-separation',
  'anchor-survival',
]) {
  assert.ok(detroitMusic!.mechanismIds.includes(id), 'Detroit recipe missing music mechanism: ' + id);
}
assert.equal(detroit.musicControls?.anchorStrength, 98);
assert.equal(detroit.musicControls?.stemminess, 90);
assert.ok((detroit.musicControls?.coupling || 100) < 50, 'Detroit pocket should favor one strong shared groove rather than maximum multi-clock coupling');
assert.ok((detroit.musicControls?.vocalLegibility || 0) >= 85, 'Detroit preset should keep lead/group vocals highly legible');

const mouthOpera = SPECIALTY_WHOLE_STACK_RECIPES.find((item) => item.id === 'builtin-specialty-mouth-opera');
assert.ok(mouthOpera, 'MOUTH OPERA specialty recipe should exist');
assert.equal(mouthOpera.musicStack?.[0]?.refId, 'mouth-opera', 'MOUTH OPERA should load its dedicated music recipe');
for (const id of mouthOpera.guyIds) {
  assert.ok(guyIds.has(id), 'MOUTH OPERA references unknown Little Guy: ' + id);
}
for (const id of mouthOpera.compositionEngineIds) {
  assert.ok(engineIds.has(id), 'MOUTH OPERA references unknown composition engine: ' + id);
}
assert.deepEqual(
  normalizeCompositionEngineIds(mouthOpera.compositionEngineIds),
  mouthOpera.compositionEngineIds,
  'MOUTH OPERA should obey composition limits without silently dropping anatomy engines',
);
for (const id of [
  'sound-breathing',
  'sound-heartbeat',
  'sound-hand-claps',
  'sound-tongue-clicks',
  'sound-teeth-chatter',
  'sound-mouth-pops',
  'sound-whisper-cloud',
  'sound-group-inhale',
  'roleexchange-consonants-drumkit',
  'roleexchange-vowels-harmony',
  'gesture-breath-gated',
  'gesture-tongue-click-rhythm',
  'ensemble-antiphonal-choirs',
]) {
  assert.ok(mouthOpera.compositionEngineIds.includes(id), 'MOUTH OPERA missing composition engine: ' + id);
}
const mouthOperaMusic = getMusicSeedRecipe('mouth-opera');
assert.ok(mouthOperaMusic, 'MOUTH OPERA music recipe should exist');
for (const id of [
  'body-only-orchestra',
  'anatomical-jurisdictions',
  'vocal-phase-transitions',
  'bel-canto-vowel-anchor',
  'phonetic-percussion',
  'hocket-relay',
  'body-percussion',
  'anchor-survival',
]) {
  assert.ok(mouthOperaMusic!.mechanismIds.includes(id), 'MOUTH OPERA missing music mechanism: ' + id);
}
assert.equal(mouthOpera.musicControls?.mouthFreakery, 100);
assert.equal(mouthOpera.musicControls?.techniqueMutation, 94);
assert.equal(mouthOpera.musicControls?.anchorStrength, 90);

const mouthRiot = SPECIALTY_WHOLE_STACK_RECIPES.find((item) => item.id === 'builtin-specialty-mouth-riot');
assert.ok(mouthRiot, 'MOUTH RIOT specialty recipe should exist');
assert.equal(mouthRiot.musicStack?.[0]?.refId, 'mouth-riot', 'MOUTH RIOT should load its music recipe');
const mouthRiotMusic = getMusicSeedRecipe('mouth-riot');
assert.ok(mouthRiotMusic, 'MOUTH RIOT music recipe should exist');
assert.equal(mouthRiot.musicControls?.kineticDensity, 91, 'MOUTH RIOT kinetic density calibration should stay explicit');
assert.equal(mouthRiot.musicControls?.mouthFreakery, 88, 'MOUTH RIOT mouth freakery calibration should stay explicit');
assert.equal(mouthRiot.musicControls?.techniqueMutation, 76, 'MOUTH RIOT mutation calibration should stay explicit');
assert.equal(mouthRiot.musicControls?.vocalLegibility, 64, 'MOUTH RIOT legibility floor should stay explicit');
assert.ok((mouthRiot.musicControls?.anchorStrength || 0) >= 80, 'MOUTH RIOT must protect a recognizable anchor');
assert.ok(mouthRiotMusic!.mechanismIds.includes('hocket-relay'), 'MOUTH RIOT should support hocket fracture');
assert.ok(mouthRiotMusic!.mechanismIds.includes('communal-infection'), 'MOUTH RIOT should support population infection');
assert.ok(mouthRiotMusic!.mechanismIds.includes('anchor-survival'), 'MOUTH RIOT should return to a surviving anchor');

const riotGenerated = generateProceduralTrack({
  guyIds: mouthRiot.guyIds,
  realityEngineIds: mouthRiot.realityEngineIds,
  compositionEngineIds: mouthRiot.compositionEngineIds,
  musicStack: mouthRiot.musicStack,
  musicControls: mouthRiot.musicControls,
  realityChaos: mouthRiot.realityChaos,
  energy: 5,
  seed: 'simple vocal anchor becomes a contagious mouth riot then comes back scarred',
  mouthPromptMode: mouthRiot.mouthPromptMode,
  mouthSemanticMode: mouthRiot.mouthSemanticMode,
});
assert.ok(riotGenerated.style.length >= TARGETS.style.min && riotGenerated.style.length <= TARGETS.style.max);
assert.ok(riotGenerated.lyrics.length >= TARGETS.lyrics.min && riotGenerated.lyrics.length <= TARGETS.lyrics.max);
assert.ok(riotGenerated.caption.length >= TARGETS.caption.min && riotGenerated.caption.length <= TARGETS.caption.max);
assert.match(riotGenerated.lyrics, /KINETIC DENSITY 91\/100/);
assert.match(riotGenerated.lyrics, /MOUTH FREAKERY 88\/100/);
assert.match(riotGenerated.lyrics, /TECHNIQUE MUTATION 76\/100/);
assert.match(riotGenerated.lyrics, /VOCAL LEGIBILITY 64\/100/);
assert.match(riotGenerated.lyrics, /RESTRAINT \/ FUCK-OFF THRESHOLD/);
assert.doesNotMatch(riotGenerated.lyrics, /91\s*BPM/i, 'Kinetic density must never compile as BPM');


const lithopsFace = SPECIALTY_WHOLE_STACK_RECIPES.find((item) => item.id === 'builtin-specialty-lithops-face');
assert.ok(lithopsFace, 'LITHOPS FACE specialty recipe should exist');
assert.equal(lithopsFace.musicStack?.[0]?.refId, 'lithops-face', 'LITHOPS FACE should load its dedicated music recipe');

for (const id of lithopsFace.guyIds) {
  assert.ok(guyIds.has(id), 'LITHOPS FACE references unknown Little Guy: ' + id);
}
for (const id of lithopsFace.compositionEngineIds) {
  assert.ok(engineIds.has(id), 'LITHOPS FACE references unknown composition engine: ' + id);
}
assert.deepEqual(
  normalizeCompositionEngineIds(lithopsFace.compositionEngineIds),
  lithopsFace.compositionEngineIds,
  'LITHOPS FACE should obey per-dimension composition limits without silently dropping engines',
);

for (const id of [
  'transduction-shape-rhythm',
  'rhythm-additive-meter',
  'rhythm-entrainment-conflict',
  'spatial-stereo-mirror',
  'tuning-two-reference-frames',
  'constraint-one-rhythm-cell',
  'constraint-anti-symmetry',
  'constraint-anchor-every-section',
  'sound-contact-mic-table',
  'sound-gravel-foot',
  'sound-prepared-piano',
  'sound-glass-harmonica',
  'sound-bowed-piano-strings',
  'sound-modular-synth',
  'sound-sand-pour',
  'sound-oboe',
]) {
  assert.ok(lithopsFace.compositionEngineIds.includes(id), 'LITHOPS FACE missing composition engine: ' + id);
}

const lithopsMusic = getMusicSeedRecipe('lithops-face');
assert.ok(lithopsMusic, 'LITHOPS FACE music recipe should exist');
for (const mechanismId of lithopsMusic!.mechanismIds) {
  assert.ok(getMusicMechanism(mechanismId), 'LITHOPS FACE references unknown mechanism: ' + mechanismId);
}
for (const id of [
  'lithops-bilateral-click',
  'lithops-split-speed',
  'lithops-fissure-delay',
  'lithops-capillary-gate',
  'lithops-median-seam',
  'lithops-crypsis-reveal',
  'lithops-flower-powder',
  'lithops-fracture-branch',
  'lithops-macro-grain',
  'lithops-fixed-gaze',
]) {
  assert.ok(lithopsMusic!.mechanismIds.includes(id), 'LITHOPS FACE missing music mechanism: ' + id);
}

assert.equal(lithopsFace.musicControls?.stemminess, 96);
assert.equal(lithopsFace.musicControls?.coupling, 97);
assert.equal(lithopsFace.musicControls?.anchorStrength, 98);
assert.equal(lithopsFace.musicControls?.vocalLegibility, 92);
assert.equal(lithopsFace.realityChaos, 2);

const lithopsGenerated = generateProceduralTrack({
  guyIds: lithopsFace.guyIds,
  realityEngineIds: lithopsFace.realityEngineIds,
  compositionEngineIds: lithopsFace.compositionEngineIds,
  musicStack: lithopsFace.musicStack,
  musicControls: lithopsFace.musicControls,
  realityChaos: lithopsFace.realityChaos,
  energy: 5,
  seed: 'My face is being resorbed into flowering stone.',
  mouthPromptMode: lithopsFace.mouthPromptMode,
  mouthSemanticMode: lithopsFace.mouthSemanticMode,
});
assert.ok(lithopsGenerated.style.length >= TARGETS.style.min && lithopsGenerated.style.length <= TARGETS.style.max);
assert.ok(lithopsGenerated.lyrics.length >= TARGETS.lyrics.min && lithopsGenerated.lyrics.length <= TARGETS.lyrics.max);
assert.ok(lithopsGenerated.caption.length >= TARGETS.caption.min && lithopsGenerated.caption.length <= TARGETS.caption.max);

console.log('Lithops Face verification passed:', {
  minds: lithopsFace.guyIds.length,
  engines: lithopsFace.compositionEngineIds.length,
  mechanisms: lithopsMusic!.mechanismIds.length,
  controls: lithopsFace.musicControls,
  style: lithopsGenerated.style.length,
  lyrics: lithopsGenerated.lyrics.length,
  caption: lithopsGenerated.caption.length,
});

console.log('MOUTH RIOT verification passed:', {
  controls: mouthRiot.musicControls,
  style: riotGenerated.style.length,
  lyrics: riotGenerated.lyrics.length,
  caption: riotGenerated.caption.length,
});

console.log('Specialty whole-stack recipe verification passed:', {
  name: recipe.name,
  engines: recipe.compositionEngineIds.length,
  mechanisms: musicRecipe.mechanismIds.length,
  style: generated.style.length,
  lyrics: generated.lyrics.length,
  caption: generated.caption.length,
});
