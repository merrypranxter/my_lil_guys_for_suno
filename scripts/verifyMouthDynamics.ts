import assert from 'node:assert/strict';
import {
  MOUTH_TRANSDUCTION_PRESETS,
  applyMouthQuirk,
  breedMouthGenome,
  compileMouthPrompt,
  createExpressionRule,
  createMouthCastProfile,
  createMutationCurve,
  createMutationEvent,
  createPresetTransduction,
  emptyMouthDynamics,
  instantiateMouthQuirk,
  normalizeMouthGenomeForGeneration,
  withMouthDynamics,
} from '../src/mouthLab';
import { buildMasterPrompt } from '../src/lib/buildGenerationPrompt';
import {
  getLastMouthGenome,
  setLastMouthGenome,
} from '../src/lib/localStorage';

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.has(key) ? this.data.get(key)! : null; }
  setItem(key: string, value: string) { this.data.set(key, String(value)); }
  removeItem(key: string) { this.data.delete(key); }
  clear() { this.data.clear(); }
  key(index: number) { return [...this.data.keys()][index] || null; }
  get length() { return this.data.size; }
}

(globalThis as any).localStorage = new MemoryStorage();

const leadBase = breedMouthGenome({
  parentDonorIds: ['mouth-donor-english', 'mouth-donor-spanish'],
  breedingSeed: 'job6-lead',
  objectiveId: 'mouth-objective-pathological-consistency',
  semanticAnchorLanguageProfileId: 'lang-english',
  intelligibility: 94,
  stability: 90,
  mutation: 70,
  manualAssignments: [
    {
      axis: 'consonants',
      donorId: 'mouth-donor-spanish',
      traitIds: ['mouth-trait-alveolar-trill'],
      pressure: 'obsessive',
    },
  ],
}).genome;

const lead = applyMouthQuirk(
  leadBase,
  instantiateMouthQuirk(
    'mouth-quirk-global-r-trill',
    { frequency: 100, consistency: 100, exaggeration: 98 },
    'job6-lead-r',
  ),
);

const crowd = breedMouthGenome({
  parentDonorIds: ['mouth-donor-english', 'mouth-donor-xhosa'],
  breedingSeed: 'job6-crowd',
  objectiveId: 'mouth-objective-mouth-percussion',
  semanticAnchorLanguageProfileId: 'lang-english',
  intelligibility: 84,
  stability: 72,
  mutation: 62,
  manualAssignments: [
    {
      axis: 'consonants',
      donorId: 'mouth-donor-xhosa',
      traitIds: ['mouth-trait-click-bantu'],
      pressure: 'high',
    },
  ],
}).genome;

const leadProfile = createMouthCastProfile('lead', lead, 'RRRR LEAD');
const crowdProfile = createMouthCastProfile('crowd', crowd, 'CLICK CROWD');

assert.equal(leadProfile.role, 'lead', 'Lead cast profile should keep its role.');
assert.ok(
  leadProfile.quirks.some((item) => item.quirkId === 'mouth-quirk-global-r-trill'),
  'Lead cast profile should snapshot the R quirk.',
);
assert.ok(
  crowdProfile.assignments.some((item) => item.traitIds.includes('mouth-trait-click-bantu')),
  'Crowd cast profile should snapshot click genetics.',
);

const dominantR = createExpressionRule(
  'quirk',
  'mouth-quirk-global-r-trill',
  'dominant',
  { strength: 100, castRole: 'lead' },
);
const triggeredClick = createExpressionRule(
  'trait',
  'mouth-trait-click-bantu',
  'triggered',
  {
    strength: 92,
    castRole: 'crowd',
    trigger: 'the crowd enters or steals the repeated anchor',
  },
);
const latentTrill = createExpressionRule(
  'trait',
  'mouth-trait-alveolar-trill',
  'latent',
  {
    strength: 85,
    castRole: 'crowd',
    trigger: 'infection event transfers lead rhotic behavior into the crowd',
  },
);

const rCurve = createMutationCurve({
  targetType: 'quirk',
  targetId: 'mouth-quirk-global-r-trill',
  startPercent: 15,
  endPercent: 80,
  startStrength: 20,
  endStrength: 100,
  shape: 'exponential',
  castRole: 'lead',
});

const infection = createMutationEvent({
  positionPercent: 62,
  sectionLabel: 'late bridge',
  trigger: 'crowd repeats the anchor three times',
  action: 'infectCast',
  sourceCastRole: 'lead',
  targetCastRole: 'crowd',
  amount: 88,
});

const suppress = createMutationEvent({
  positionPercent: 90,
  sectionLabel: 'final collapse',
  action: 'suppressTrait',
  targetType: 'trait',
  targetId: 'mouth-trait-click-bantu',
  targetCastRole: 'crowd',
  amount: 70,
});

const clicksToRhythm = createPresetTransduction('mouth-transduction-clicks-to-offbeats', 'crowd');
const highNoteToTrill = createPresetTransduction('mouth-transduction-high-note-to-trill', 'lead');

assert.equal(clicksToRhythm.direction, 'languageToMusic');
assert.equal(highNoteToTrill.direction, 'musicToLanguage');
assert.ok(
  MOUTH_TRANSDUCTION_PRESETS.some((item) => item.id === 'mouth-transduction-vowel-length-to-duration'),
  'Job 6 should ship language→music transduction presets.',
);

const dynamics = {
  ...emptyMouthDynamics(),
  castProfiles: [leadProfile, crowdProfile],
  expressionRules: [dominantR, triggeredClick, latentTrill],
  mutationCurves: [rCurve],
  timeline: [infection, suppress],
  transductions: [clicksToRhythm, highNoteToTrill],
};

const dynamicGenome = withMouthDynamics(lead, dynamics);
assert.notEqual(dynamicGenome.id, lead.id, 'Adding dynamics must change genome identity.');
assert.equal(dynamicGenome.dynamics?.castProfiles.length, 2);
assert.equal(dynamicGenome.dynamics?.mutationCurves.length, 1);
assert.equal(dynamicGenome.dynamics?.timeline.length, 2);
assert.equal(dynamicGenome.dynamics?.transductions.length, 2);

const normalized = normalizeMouthGenomeForGeneration(
  JSON.parse(JSON.stringify(dynamicGenome)),
);
assert.ok(normalized, 'Dynamic genome should survive generation normalization.');
assert.equal(normalized!.dynamics?.castProfiles.length, 2, 'Cast profiles should survive normalization.');
assert.equal(normalized!.dynamics?.expressionRules.length, 3, 'Expression rules should survive normalization.');
assert.equal(normalized!.dynamics?.mutationCurves[0].shape, 'exponential', 'Curve shape should survive normalization.');
assert.equal(normalized!.dynamics?.timeline[0].action, 'infectCast', 'Timeline actions should survive normalization.');
assert.equal(normalized!.dynamics?.transductions.length, 2, 'Transductions should survive normalization.');

const compiled = compileMouthPrompt(dynamicGenome, {
  mode: 'bracketed',
  semanticMode: 'englishMeaningAlienMouth',
});

assert.ok(compiled.text.includes('CAST GENETICS'), 'Compiler should emit cast-specific mouth rules.');
assert.ok(compiled.text.includes('RRRR LEAD'), 'Compiler should identify the lead mouth.');
assert.ok(compiled.text.includes('CLICK CROWD'), 'Compiler should identify the crowd mouth.');
assert.ok(compiled.text.includes('CONDITIONAL PHONETICS'), 'Compiler should emit expression-state laws.');
assert.ok(compiled.text.includes('DOMINANT'), 'Dominant expression should compile.');
assert.ok(compiled.text.includes('TRIGGERED'), 'Triggered expression should compile.');
assert.ok(compiled.text.includes('LATENT'), 'Latent expression should compile.');
assert.ok(compiled.text.includes('MUTATION CURVE'), 'Compiler should emit graded mutation curves.');
assert.ok(compiled.text.includes('exponential curve'), 'Compiler should preserve mutation curve shape.');
assert.ok(compiled.text.includes('MUTATION TIMELINE'), 'Compiler should emit mutation events.');
assert.ok(compiled.text.includes('infectCast'), 'Voice-to-voice infection should compile.');
assert.ok(compiled.text.includes('LANGUAGE → MUSIC'), 'Language-to-music transduction should compile.');
assert.ok(compiled.text.includes('MUSIC → LANGUAGE'), 'Reverse transduction should compile.');
assert.ok(
  compiled.lyricsDirectives.includes('crowd repeats the anchor three times'),
  'Event-triggered spread condition should reach lyrics/control.',
);
assert.ok(
  compiled.styleDirectives.includes('CAST MOUTHS'),
  'STYLE directives should signal multiple cast mouths without dumping the full genome.',
);
assert.ok(
  compiled.styleDirectives.includes('MOUTH TRANSDUCTION ACTIVE'),
  'STYLE directives should signal causal transduction.',
);

const master = buildMasterPrompt({
  guyIds: [],
  realityEngineIds: [],
  compositionEngineIds: [],
  seed: 'dynamic mouth test',
  energy: 4,
  mouthGenome: dynamicGenome,
  mouthPromptMode: 'bracketed',
  mouthSemanticMode: 'englishMeaningAlienMouth',
});

assert.ok(master.userPrompt.includes('CAST GENETICS'), 'Master prompt should receive cast genetics.');
assert.ok(master.userPrompt.includes('MUTATION TIMELINE'), 'Master prompt should receive timeline controls.');
assert.ok(master.userPrompt.includes('LANGUAGE → MUSIC'), 'Master prompt should receive transduction rules.');

setLastMouthGenome(dynamicGenome);
const restored = getLastMouthGenome();
assert.ok(restored, 'Dynamic genome should survive active-mouth localStorage persistence.');
assert.equal(restored!.dynamics?.castProfiles.length, 2);
assert.equal(restored!.dynamics?.mutationCurves.length, 1);
assert.equal(restored!.dynamics?.timeline.length, 2);
assert.equal(restored!.dynamics?.transductions.length, 2);

console.log('Mouth Lab Job 6 dynamic-mouth verification passed.');
console.log('  cast profiles:', dynamicGenome.dynamics?.castProfiles.length);
console.log('  expression rules:', dynamicGenome.dynamics?.expressionRules.length);
console.log('  mutation curves:', dynamicGenome.dynamics?.mutationCurves.length);
console.log('  timeline events:', dynamicGenome.dynamics?.timeline.length);
console.log('  transductions:', dynamicGenome.dynamics?.transductions.length);
