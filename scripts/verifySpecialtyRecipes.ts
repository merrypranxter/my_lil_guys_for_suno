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
