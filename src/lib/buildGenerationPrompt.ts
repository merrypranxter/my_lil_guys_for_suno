import { LITTLE_GUYS } from '../data/littleGuys';
import { MUSICAL_VOCABULARY_PROMPT, fingerprintToLine } from '../data/musicTaxonomy';
import { getMindMetadata } from '../data/mindMetadata';
import { getRealityEngines, REALITY_DIMENSION_JURISDICTIONS, REALITY_DIMENSION_LABELS } from '../data/realityEngines';
import { COMPOSITION_DIMENSION_JURISDICTIONS, COMPOSITION_DIMENSION_LABELS, getCompositionEngines } from '../data/compositionEngines';
import { BoxType, CompositionEngine, LittleGuy, MusicFingerprint, RealityChaosLevel, RealityEngine } from '../types';
import { REALITY_CHAOS_LABELS, analyzeRealityChemistry } from './realityChemistry';

export interface GenerationPromptParams {
  guyIds: string[];
  realityEngineIds?: string[];
  compositionEngineIds?: string[];
  realityChaos?: RealityChaosLevel;
  seed?: string;
  energy: number;
  recentFingerprints?: MusicFingerprint[];
  likedSignals?: string[];
}

export function buildMasterPrompt(params: GenerationPromptParams): { systemInstruction: string; userPrompt: string } {
  const { guyIds, realityEngineIds = [], compositionEngineIds = [], realityChaos = 2, seed, energy, recentFingerprints = [], likedSignals = [] } = params;

  const selectedGuys: LittleGuy[] = guyIds
    .map((id) => LITTLE_GUYS.find((g) => g.id === id))
    .filter((g): g is LittleGuy => Boolean(g));

  const fallbackGuy = LITTLE_GUYS[0];
  const guys: LittleGuy[] = selectedGuys.length > 0 ? selectedGuys : [fallbackGuy];

  const primaryGuy: LittleGuy = guys[0] || fallbackGuy;
  const secondaryGuys: LittleGuy[] = guys.slice(1);

  const realityEngines: RealityEngine[] = getRealityEngines(realityEngineIds);
  const realityChemistry = analyzeRealityChemistry(realityEngineIds);
  const chaosMeta = REALITY_CHAOS_LABELS[realityChaos];
  const realityChemistryBlock = realityEngines.length
    ? [
        'CHAOS TARGET: ' + chaosMeta.name + ' — ' + chaosMeta.short,
        realityChemistry.summary,
        'Temporary consciousness: ' + realityChemistry.narrator,
        'Strongest seams:',
        ...(realityChemistry.pairNotes.length ? realityChemistry.pairNotes.map((line) => '- ' + line) : ['- no cross-layer pair data']),
        'Negotiation orders:',
        ...realityChemistry.directives.map((line) => '- ' + line),
      ].join('\n')
    : 'No Reality chemistry because no Reality Engines are active.';

  const realityBreakdown = realityEngines.length
    ? realityEngines
        .map((engine) =>
          '[' + REALITY_DIMENSION_LABELS[engine.dimension] + ']: ' + engine.name + ' (' + engine.subtitle + ')\n' +
          'Jurisdiction contract: ' + REALITY_DIMENSION_JURISDICTIONS[engine.dimension] + '\n' +
          'Operational Rule: ' + engine.rule + '\n' +
          'Anti-decoration test: this engine must change structure, selection, behavior, assumptions, or procedure; themed vocabulary alone does not count.'
        )
        .join('\n\n')
    : 'NONE SELECTED — do not invent a Reality Engine unless the user seed explicitly supplies one.';


  const compositionEngines: CompositionEngine[] = getCompositionEngines(compositionEngineIds);
  const compositionBreakdown = compositionEngines.length
    ? compositionEngines
        .map((engine) =>
          '[' + COMPOSITION_DIMENSION_LABELS[engine.dimension] + ']: ' + engine.name + ' (' + engine.subtitle + ')\n' +
          'Jurisdiction contract: ' + COMPOSITION_DIMENSION_JURISDICTIONS[engine.dimension] + '\n' +
          'Operational Rule: ' + engine.rule + '\n' +
          'Anti-decoration test: this engine must create an audible, structural, informational, physical, or procedural consequence; naming the source or concept alone does not count.'
        )
        .join('\n\n')
    : 'NONE SELECTED — do not invent Composition Lab engines unless the user seed explicitly asks for a mechanism.';


  const activeLanguage = compositionEngines.find((engine) => engine.dimension === 'language');
  const activeLanguageMode = compositionEngines.find((engine) => engine.dimension === 'languageMode');
  const languageFidelityBlock = activeLanguage
    ? [
        'SELECTED LANGUAGE PROFILE: ' + activeLanguage.name,
        'SELECTED PERFORMANCE MODE: ' + (activeLanguageMode ? activeLanguageMode.name : 'NONE — treat the language profile as mouth/prosody guidance only; do not force non-English lyrics'),
        'FIDELITY RULES:',
        '- Phonology first, stereotype never.',
        '- Never infer personality, intelligence, ethnicity, social class, morality, or comic character from a language/accent.',
        '- Do not use eye-dialect misspelling as the main way to represent an accent.',
        '- If English-with-L1-transfer is active, keep the lyric text semantically English and express transfer through plausible segment, syllable, timing, and prosodic behavior.',
        '- If native-language singing is active and linguistic confidence is low, prefer short reliable phrases or explicitly non-lexical vocables rather than fabricated fluent-looking sentences.',
        '- Clicks, ejectives, pharyngeals, tone, pitch accent, vowel harmony, length, and other distinctive features are normal phonological mechanisms, not novelty sound effects.',
        '- Dialect-sensitive profile notes are tendencies, not universal claims about every speaker.',
      ].join('\n')
    : 'No language profile selected.';

  const energyLabels: Record<number, string> = {
    1: 'ENERGY LEVEL 1: Latent Drift / Subsurface Mutation (controlled but still engaging; subtle tension and motion)',
    2: 'ENERGY LEVEL 2: Low Hum / Controlled Asymmetry (steady propulsion, occasional structural interruptions)',
    3: 'ENERGY LEVEL 3: Steady Combustion / High Kinetic Tension (active propulsion, driving rhythm, pronounced transformations)',
    4: 'ENERGY LEVEL 4: High Reactor / Rapid Phase Shift (frenetic momentum, dense pressure, severe operational mutations)',
    5: 'ENERGY LEVEL 5: Critical Meltdown / Hyper-Drive Overload (maximum kinetic velocity and extreme structural stress)',
  };

  const stackBreakdown = guys
    .map((g, idx) => {
      const meta = getMindMetadata(g.id);
      const chemistryLine = 'Family: ' + meta.family + ' | Chaos: ' + meta.chaos + '/5 | Stack role: ' + meta.roleHint;
      if (idx === 0) {
        return '[POSITION 1 - PRIMARY GENERATIVE FOUNDATION]: ' + g.name + ' (' + g.subtitle + ')\n' +
          'Jurisdiction: ' + g.defaultJurisdiction + '\n' +
          chemistryLine + '\n' +
          'Operational Rule: ' + g.rule + '\n' +
          'Role: Establishes the core generative ontology, default baseline mechanics, and primary structural world.';
      }
      return '[POSITION ' + (idx + 1) + ' - MUTATOR / REGULATOR]: ' + g.name + ' (' + g.subtitle + ')\n' +
        'Jurisdiction: ' + g.defaultJurisdiction + '\n' +
        chemistryLine + '\n' +
        'Operational Rule: ' + g.rule + '\n' +
        'Role: Must actively mutate, constrain, damage, invert, or regulate Position 1 without erasing it. Force the systems to negotiate in separate jurisdictions.';
    })
    .join('\n\n');

  const recentBlock = recentFingerprints.length
    ? recentFingerprints.slice(0, 12).map((f, i) => (i + 1) + '. ' + fingerprintToLine(f)).join('\n')
    : 'No recent fingerprints recorded yet.';

  const likedBlock = likedSignals.length
    ? likedSignals.slice(0, 10).join('\n')
    : 'No explicit positive feedback recorded yet.';

  const systemInstruction = 'YOU ARE THE CORE INFERENCE ENGINE OF THE LITTLE GUY MACHINE.\n' +
    'Your purpose is to produce three precisely engineered creative outputs for SUNO music generation using cognitive/generative rules called Little Guys, plus compact metadata describing the musical territory selected.\n\n' +
    'CRITICAL ARCHITECTURAL DIRECTIVES:\n' +
    '1. NEVER produce generic weirdness salad or superficial surrealism. Cognitive rules are operational constraints and physical laws.\n' +
    '2. STACK NEGOTIATION IS MANDATORY. The primary guy establishes the world; secondary guys exert pressure only through their jurisdictions.\n' +
    '3. STACK CHEMISTRY IS OPERATIONAL. Mind family and chaos ratings are not decoration: low-chaos minds should stabilize, measure, narrate, or regulate; high-chaos minds should create real structural discontinuity. Do not let five minds all perform the same kind of weirdness. Preserve distinct jobs and productive friction.\n' +
    '4. MUSICAL TRADITIONS ARE RULE SYSTEMS, NOT LABELS. Harmony, melody, rhythm, timbre, vocal behavior, performance attitude, and production must receive separate jurisdiction. Do not simply write genre A + genre B + genre C.\n' +
    '5. ANTI-MONOCULTURE: recent musical fingerprints are evidence of territory already explored. Unless the user seed explicitly asks for repetition, move to genuinely different musical ancestry rather than swapping synonyms. If the last several runs were electronic, industrial, synth-heavy, glitchy, or mechanically clinical, preferentially move toward acoustic, vocal, ensemble, folk, dance-band, rock, theatrical, orchestral, communal, or other contrasting systems. Industrial/electronic is one option among many, never the default.\n' +
    '6. POSITIVE FEEDBACK IS A SOFT PREFERENCE SIGNAL. Starred runs and user notes indicate mechanisms worth revisiting, but do not clone a past song. Infer what property was liked, then express that property through new material.\n' +
    '7. REALITY ENGINES ARE A SEPARATE LAYER FROM MINDS. Minds govern generative cognition. Reality Engines govern format, role, world, species/origin, venue, headspace, altered-state phenomenology, or tone. Never collapse these layers into one adjective cloud.\n' +
    '8. REALITY ENGINE JURISDICTIONS ARE MANDATORY. A selected engine must perform work through its own jurisdiction. FORMAT changes sequence or event mechanics; ROLE changes obligations and diction; WORLD changes normal assumptions; SPECIES changes embodiment/reference frame; VENUE changes local constraints; HEADSPACE changes attention/salience/tempo; ALTERED STATE changes identity/time/embodiment/perception/reality-testing mechanics; TONE colors delivery without replacing mechanism.\n' +
    '9. COLLISIONS MUST NEGOTIATE, NOT BLEND. When two active layers conflict, generate from the seam and preserve both constraints rather than averaging them into generic surrealism.\n' +
    '10. REALITY CHAOS IS A SEARCH TARGET, NOT A VOLUME KNOB. COHERENT favors natural affinities; ODD balances affinity and friction; FUCKED seeks productive contradiction; UNREASONABLE maximizes jurisdictional friction while every selected engine must remain legible. Never satisfy chaos by random word salad.\n' +
    '11. COMPOSITION LAB IS A THIRD OPERATIONAL LAYER. It is neither Mind nor Reality. It governs mouths/language, ensemble topology, signal path, sound sources, tuning, rhythmic physics, spatial organization, chronology, information access, constraints, resources, failure, authority, and props. Each active Composition engine owns only its stated jurisdiction.\n' +
    '12. COMPOSITION ENGINES MUST BE AUDIBLE OR STRUCTURALLY TESTABLE. A language engine must alter phonology/prosody; transmission must alter information flow; damage must happen in time; tuning must alter intervals; rhythm physics must alter pulse organization; constraints/resources/failure/authority must create observable consequences. Do not reduce these engines to descriptive adjectives.\n' +
    '13. LANGUAGE / ACCENT FIDELITY: describe and perform phonological mechanisms, not ethnic caricatures. English-with-L1-transfer means approximate phonological/prosodic transfer, not comic misspelling. Native-language output must not fabricate confident fluent text when uncertain. Distinctive features such as clicks or tone are ordinary linguistic structure, not novelty effects.\n' +
    '14. OUTPUT FORMAT: valid JSON with keys style, lyrics, caption, fingerprint. fingerprint must contain genreFamily, harmony, melody, rhythm, timbre, vocal, performance, production.\n\n' +
    'TARGET CHARACTER COUNTS INCLUDING SPACES AND LINE BREAKS:\n' +
    'style: 975 to 999 characters.\n' +
    'lyrics: 4900 to 4999 characters.\n' +
    'caption: 490 to 499 characters.';

  const userPrompt = 'EXECUTE SUNO GENERATION REQUEST.\n\n' +
    'ACTIVE LITTLE GUY STACK:\n' + stackBreakdown + '\n\n' +
    'ACTIVE REALITY ENGINES:\n' + realityBreakdown + '\n\n' +
    'REALITY CHEMISTRY / COLLISION MAP:\n' + realityChemistryBlock + '\n\n' +
    'ACTIVE COMPOSITION LAB ENGINES:\n' + compositionBreakdown + '\n\n' +
    'LANGUAGE / ACCENT FIDELITY:\n' + languageFidelityBlock + '\n\n' +
    'COMPOSITION LAB NEGOTIATION RULE:\n' +
    'Keep Composition Lab mechanisms separate from scenario decoration. Multiple active engines may coexist in the same dimension where the registry allows it. Each one must perform measurable work through its own jurisdiction. Sound sources should receive musical jobs; signal media should alter transmission; language should alter mouth behavior; structural/control engines should create consequences that the song must respond to. Cross-domain chemistry is not yet precomputed, so preserve all mechanisms explicitly rather than averaging them.\n\n' +
    'REALITY ENGINE NEGOTIATION RULE:\n' +
    'Treat each selected engine as an operational law in its own jurisdiction. Do not merely name it or decorate lyrics with its vocabulary. If the format is a game show, the lyric architecture must actually behave like one. If the headspace is overloaded, attention and thread management must actually change. If an altered-state engine is active, use its defined phenomenological mechanism rather than generic drug imagery. Preserve productive incompatibility between layers. Use the collision map above to decide WHERE the song generates events: the high-friction seam should repeatedly force one jurisdiction to solve a problem created by another.\n\n' +
    'ENERGY PARAMETER:\n' + (energyLabels[energy] || energyLabels[3]) + '\n\n' +
    'OPTIONAL SEED / SUBJECT / EXPERIMENT:\n' +
    (seed && seed.trim() ? '"' + seed.trim() + '"' : 'NONE PROVIDED — derive subject organically from the primary Little Guy ontology') + '\n\n' +
    'RECENT TERRITORY — AVOID ACCIDENTAL REPETITION:\n' + recentBlock + '\n\n' +
    'POSITIVE PREFERENCE SIGNALS — PRESERVE THE LIKED PRINCIPLE, NOT THE SURFACE COPY:\n' + likedBlock + '\n\n' +
    'MUSICAL POSSIBILITY SPACE — THIS IS A LIBRARY, NOT A REQUIRED CHECKLIST:\n' + MUSICAL_VOCABULARY_PROMPT + '\n\n' +
    'BOX 1 — STYLE\n' +
    'TARGET: 975–999 characters. Use PRODUCTIVE CONTRADICTION UNDER CONSTRAINT. First choose distinct systems, then give each separate jurisdiction:\n' +
    '[HARMONY SYSTEM] chord behavior, voicing, consonance, dissonance, tension.\n' +
    '[MELODIC SYSTEM] ornament, pitch movement, contour, slides, runs, repetition.\n' +
    '[RHYTHMIC SYSTEM] pulse, subdivision, meter, syncopation, acceleration, silence, density.\n' +
    '[TIMBRE / ATMOSPHERE SYSTEM] instrumentation, sonic material, production character, space, surface.\n' +
    '[PERFORMANCE ATTITUDE] emotional and theatrical behavior.\n' +
    '[ANCHOR / INVARIANT] one recognizable element preserved while the rest mutates.\n' +
    'Invent 5–10 operators that transform behavior: hold A fixed while B migrates; compress X while stretching Y; make A behave like B without becoming B; preserve X while destabilizing everything around it; force incompatible temporal scales to coexist; return to the anchor in a more mutated form.\n' +
    'Do not begin from an industrial/electronic baseline. Choose musical ancestry deliberately and vary it from recent runs. Music should stay active and engaging unless the seed explicitly demands otherwise. No artist names.\n\n' +
    'BOX 2 — LYRICS / CONTROL\n' +
    'TARGET: 4900–4999 characters. Every non-sung cue, instrumental instruction, section name, sound effect, and tempo change goes in [SQUARE BRACKETS]. Lyrics may be dry explanation, procedural narration, factual description of what the song is doing, absurdly serious administrative language, phonetic nonsense, or combinations. Avoid neat default pop rhyme. Follow FORM → DESTABILIZE → FRACTURE → COLLAPSE → ANCHOR RETURNS → REFORM STRANGER.\n' +
    'VOCALS ARE A MUSICAL SYSTEM. Choose among many possibilities: scat, nonsense vocables, yodeling, melisma, hocketing, call-and-response, polyphony, dry speech-song, patter, recitative, falsetto flips, whistle register, nasal drones, overtone-rich sustain, ululation, choral writing, rhythmic consonants. If phonetic nonsense is used, hard consonants act as percussion, nasals as resonance, open vowels as sustained melody, rolled consonants as acceleration, dense syllables as compression, long vowels as stretched time, heavy syllables as bass weight.\n' +
    'The Little Guy stack must control lyric logic rather than merely being named. Reality Engines, when active, must visibly control scenario mechanics, speaker behavior, temporal/sensory logic, or delivery according to their jurisdictions. Composition Lab engines, when active, must visibly control vocal mechanics, signal behavior, sonic materials, musical physics, chronology, information, constraints, resources, failure, authority, or other assigned jurisdictions.\n\n' +
    'BOX 3 — CAPTION\n' +
    'TARGET: 490–499 characters. Compact publishable explanation of what the song does, which mechanisms govern it, and why the structure is strange. Take the mechanism seriously. Do not mention prompts or system instructions.\n\n' +
    'FINGERPRINT METADATA\n' +
    'Return a concise factual description of the actual musical choices you used. Each fingerprint field should be a short phrase, not a paragraph.\n\n' +
    'Return ONLY valid JSON with style, lyrics, caption, fingerprint.';

  return { systemInstruction, userPrompt };
}

export function buildRepairPrompt(boxType: BoxType, currentText: string): { systemInstruction: string; userPrompt: string } {
  const targets = {
    style: { min: 975, max: 999, name: 'STYLE' },
    lyrics: { min: 4900, max: 4999, name: 'LYRICS / CONTROL' },
    caption: { min: 490, max: 499, name: 'CAPTION' },
  }[boxType];

  const currentLen = currentText.length;
  const isShort = currentLen < targets.min;
  const diff = isShort ? targets.min - currentLen : currentLen - targets.max;

  const systemInstruction = 'YOU ARE THE PRECISION LENGTH CALIBRATOR OF THE LITTLE GUY MACHINE.\n' +
    'Rewrite or adjust the provided ' + targets.name + ' text so its exact character count, including spaces and line breaks, falls between ' + targets.min + ' and ' + targets.max + '.\n\n' +
    'Current length: ' + currentLen + '. Target: ' + targets.min + '–' + targets.max + '. ' +
    (isShort ? 'Expand by at least ' + diff + ' characters.' : 'Trim by at least ' + diff + ' characters.') + '\n\n' +
    'Preserve core musical operators, brackets, themes, cognitive logic, and tone. Expand with meaningful operational details, not padding. Trim redundancy before substance. Return only JSON: {"repairedText":"..."}';

  const userPrompt = 'CALIBRATE THIS TEXT TO ' + targets.min + '–' + targets.max + ' CHARACTERS:\n\n' +
    currentText + '\n\nReturn JSON with repairedText.';

  return { systemInstruction, userPrompt };
}
