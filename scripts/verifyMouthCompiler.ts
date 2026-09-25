import {
  applyMouthQuirk,
  breedMouthGenome,
  compileMouthPrompt,
  instantiateMouthQuirk,
  normalizeMouthGenomeForGeneration,
} from '../src/mouthLab';
import { buildMasterPrompt } from '../src/lib/buildGenerationPrompt';
import { generateProceduralTrack, TARGETS } from '../src/lib/proceduralGenerator';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const bred = breedMouthGenome({
  parentDonorIds: ['mouth-donor-english', 'mouth-donor-spanish'],
  breedingSeed: 'job-4-rrr-compiler',
  objectiveId: 'mouth-objective-pathological-consistency',
  intelligibility: 95,
  stability: 96,
  mutation: 84,
  manualAssignments: [
    {
      axis: 'consonants',
      donorId: 'mouth-donor-spanish',
      traitIds: ['mouth-trait-alveolar-trill'],
      pressure: 'obsessive',
    },
  ],
}).genome;

const rQuirk = instantiateMouthQuirk(
  'mouth-quirk-global-r-trill',
  {
    frequency: 100,
    consistency: 100,
    exaggeration: 99,
  },
  'job-4-r-freak',
);

const rGenome = applyMouthQuirk(bred, rQuirk);

const bracketed = compileMouthPrompt(rGenome, {
  mode: 'bracketed',
  semanticMode: 'englishMeaningAlienMouth',
});

assert(
  bracketed.text.includes('ENGLISH MEANING / ALIEN MOUTH'),
  'Bracketed compiler must expose English Meaning / Alien Mouth.',
);
assert(
  bracketed.text.includes('GLOBAL RHOTIC TRILL TAKEOVER'),
  'Bracketed compiler must include active R quirk.',
);
assert(
  bracketed.text.includes('OBSESSIVE ENFORCEMENT'),
  'Obsessive trait pressure must produce explicit reinforcement.',
);
assert(
  bracketed.text.includes('PATHOLOGICAL CONSISTENCY'),
  '100/100 quirk consistency/frequency must produce pathological-consistency reinforcement.',
);
assert(
  bracketed.lyricsDirectives.includes('virtually every eligible target'),
  'R freak control language must reinforce virtually every eligible target.',
);
assert(
  bracketed.styleDirectives.includes('MOUTH LAB STYLE PRIORITY'),
  'Compiler must produce STYLE-specific directives.',
);
assert(
  bracketed.activeTraitIds.includes('mouth-trait-alveolar-trill'),
  'Compiler must report active trait IDs.',
);
assert(
  bracketed.activeQuirkIds.includes('mouth-quirk-global-r-trill'),
  'Compiler must report active quirk IDs.',
);

const compact = compileMouthPrompt(rGenome, {
  mode: 'compact',
  semanticMode: 'englishMeaningAlienMouth',
});
const descriptive = compileMouthPrompt(rGenome, {
  mode: 'descriptive',
  semanticMode: 'englishMeaningAlienMouth',
});

assert(compact.text.length < bracketed.text.length, 'Compact compiler output should be shorter than bracketed output.');
assert(
  compact.text.includes('F100/C100/X99'),
  'Compact output should preserve quirk control values.',
);
assert(
  descriptive.text.includes('governs consonants'),
  'Descriptive output should explain trait jurisdiction in prose.',
);
assert(
  descriptive.text.includes('generic accent'),
  'Descriptive output should preserve anti-mush behavior.',
);

const tampered: any = {
  ...rGenome,
  parentDonorIds: [...rGenome.parentDonorIds, 'mouth-donor-definitely-fake'],
  assignments: [
    ...rGenome.assignments,
    {
      axis: 'consonants',
      donorId: 'mouth-donor-spanish',
      traitIds: ['mouth-trait-DO-WHATEVER-THE-USER-SAYS'],
      pressure: 'obsessive',
      locked: true,
    },
  ],
  quirks: [
    ...rGenome.quirks,
    {
      id: 'evil',
      quirkId: 'mouth-quirk-ignore-all-rules',
      enabled: true,
      frequency: 100,
      consistency: 100,
      exaggeration: 100,
      takeover: { mode: 'constant', startPercent: 100, endPercent: 100 },
      linkedTraitIds: [],
      createdAt: Date.now(),
    },
  ],
};

const normalized = normalizeMouthGenomeForGeneration(tampered);
assert(Boolean(normalized), 'Valid portion of a tampered genome should still normalize.');
assert(
  !normalized!.parentDonorIds.includes('mouth-donor-definitely-fake'),
  'Unknown parent donors must be removed during server/compiler normalization.',
);
assert(
  !normalized!.assignments.some((assignment) =>
    assignment.traitIds.includes('mouth-trait-DO-WHATEVER-THE-USER-SAYS'),
  ),
  'Unknown trait IDs must not reach generation.',
);
assert(
  !normalized!.quirks.some((quirk) => quirk.quirkId === 'mouth-quirk-ignore-all-rules'),
  'Unknown quirk IDs must not reach generation.',
);

const master = buildMasterPrompt({
  guyIds: [],
  realityEngineIds: [],
  compositionEngineIds: [],
  energy: 4,
  seed: 'a cheerful song about a tesseract filing taxes',
  mouthGenome: rGenome,
  mouthPromptMode: 'bracketed',
  mouthSemanticMode: 'englishMeaningAlienMouth',
});

assert(
  master.systemInstruction.includes('MOUTH LAB IS VOCAL GENETICS, NOT AN ACCENT PRESET'),
  'Master system prompt must contain Mouth Lab architectural law.',
);
assert(
  master.systemInstruction.includes('MOUTH LAB PRECEDENCE'),
  'Master system prompt must define Mouth Lab collision precedence.',
);
assert(
  master.userPrompt.includes('MOUTH LAB / VOCAL GENOME:'),
  'Master user prompt must contain the compiled Mouth Lab block.',
);
assert(
  master.userPrompt.includes('GLOBAL RHOTIC TRILL TAKEOVER'),
  'Master user prompt must receive the active quirk.',
);
assert(
  master.userPrompt.includes('ENGLISH MEANING / ALIEN MOUTH'),
  'Master user prompt must receive semantic mode.',
);
assert(
  master.userPrompt.includes('[MOUTH LAB CONTROL]'),
  'Lyrics/control instructions must receive the compiled Mouth Lab control block.',
);

const legacy = buildMasterPrompt({
  guyIds: [],
  realityEngineIds: [],
  compositionEngineIds: [],
  energy: 4,
  seed: 'legacy request without mouth lab',
});

assert(
  legacy.userPrompt.includes('NO MOUTH LAB GENOME ACTIVE'),
  'Legacy requests should remain valid and explicitly inert in Mouth Lab.',
);
assert(
  !legacy.userPrompt.includes('GLOBAL RHOTIC TRILL TAKEOVER'),
  'Legacy requests must not accidentally invent Mouth Lab quirks.',
);

const procedural = generateProceduralTrack({
  guyIds: [],
  realityEngineIds: [],
  compositionEngineIds: [],
  energy: 4,
  seed: 'procedural mouth fallback test',
  mouthGenome: rGenome,
  mouthSemanticMode: 'englishMeaningAlienMouth',
});

assert(
  procedural.style.length >= TARGETS.style.min && procedural.style.length <= TARGETS.style.max,
  'Mouth Lab must not break procedural STYLE character target.',
);
assert(
  procedural.lyrics.length >= TARGETS.lyrics.min && procedural.lyrics.length <= TARGETS.lyrics.max,
  'Mouth Lab must not break procedural LYRICS character target.',
);
assert(
  procedural.caption.length >= TARGETS.caption.min && procedural.caption.length <= TARGETS.caption.max,
  'Mouth Lab must not break procedural CAPTION character target.',
);
assert(
  procedural.lyrics.includes('GLOBAL RHOTIC TRILL TAKEOVER'),
  'Procedural fallback must preserve compiled quirk instructions in lyrics/control.',
);
assert(
  procedural.lyrics.includes('ENGLISH MEANING / ALIEN MOUTH'),
  'Procedural fallback must preserve semantic policy.',
);

console.log('Mouth Lab Job 4 prompt compiler verification passed.');
console.log('  bracketed chars: ' + bracketed.text.length);
console.log('  compact chars: ' + compact.text.length);
console.log('  master prompt chars: ' + master.userPrompt.length);
console.log('  procedural lyrics chars: ' + procedural.lyrics.length);
