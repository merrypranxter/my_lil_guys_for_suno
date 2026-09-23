import { LITTLE_GUYS } from '../data/littleGuys';
import { chooseDiverseFingerprint } from '../data/musicTaxonomy';
import { getRealityEngines, REALITY_DIMENSION_JURISDICTIONS, REALITY_DIMENSION_LABELS } from '../data/realityEngines';
import { COMPOSITION_DIMENSION_JURISDICTIONS, COMPOSITION_DIMENSION_LABELS, getCompositionEngines } from '../data/compositionEngines';
import { BoxType, CompositionEngine, LittleGuy, MusicFingerprint, RealityChaosLevel, RealityEngine } from '../types';
import { REALITY_CHAOS_LABELS, analyzeRealityChemistry } from './realityChemistry';

export interface ProceduralTrackParams {
  guyIds: string[];
  realityEngineIds?: string[];
  compositionEngineIds?: string[];
  realityChaos?: RealityChaosLevel;
  seed?: string;
  energy: number;
  recentFingerprints?: MusicFingerprint[];
}

export interface ProceduralTrackResult {
  style: string;
  lyrics: string;
  caption: string;
  fingerprint: MusicFingerprint;
}

export const TARGETS = {
  style: { min: 975, max: 999 },
  lyrics: { min: 4900, max: 4999 },
  caption: { min: 490, max: 499 },
};

export function clampAndPad(text: string, min: number, max: number, padSnippet: string): string {
  let result = text.trim();
  if (result.length > max) {
    result = result.slice(0, max);
    const lastPunct = Math.max(result.lastIndexOf('. '), result.lastIndexOf('] '));
    if (lastPunct > min) {
      result = result.slice(0, lastPunct + 1);
    }
  }

  while (result.length < min) {
    const diff = min - result.length;
    if (diff <= padSnippet.length + 1) {
      result += ' ' + padSnippet.slice(0, Math.max(0, diff - 1));
    } else {
      result += '\n' + padSnippet;
    }
  }

  if (result.length > max) {
    result = result.slice(0, max);
  }

  return result;
}

function tempoForEnergy(energy: number, rhythm: string): string {
  const ranges: Record<number, string> = {
    1: '96–112 BPM',
    2: '112–126 BPM',
    3: '126–142 BPM',
    4: '142–162 BPM',
    5: '162–184 BPM',
  };
  const base = ranges[energy] || ranges[3];
  if (rhythm.includes('waltz')) return base + ' felt in three';
  if (rhythm.includes('half-time')) return base + ' with a heavy half-time body';
  if (rhythm.includes('rubato')) return base + ' instrumental grid under elastic vocal time';
  return base;
}

function realityLawLines(engines: RealityEngine[]): string {
  if (!engines.length) return '[REALITY ENGINE: none selected; do not invent one.]';
  return engines.map((engine) =>
    '[' + REALITY_DIMENSION_LABELS[engine.dimension] + ' — ' + engine.name + ']\n' +
    engine.shortExplanation + '\n' +
    '[JURISDICTION: ' + REALITY_DIMENSION_JURISDICTIONS[engine.dimension] + ']'
  ).join('\n');
}


function compositionLawLines(engines: CompositionEngine[]): string {
  if (!engines.length) return '[COMPOSITION LAB: no engines selected.]';
  return engines.map((engine) =>
    '[' + COMPOSITION_DIMENSION_LABELS[engine.dimension] + ' — ' + engine.name + ']\n' +
    engine.shortExplanation + '\n' +
    '[COMPOSITION JURISDICTION: ' + COMPOSITION_DIMENSION_JURISDICTIONS[engine.dimension] + ']'
  ).join('\n');
}

export function generateProceduralTrack(params: ProceduralTrackParams): ProceduralTrackResult {
  const {
    guyIds,
    realityEngineIds = [],
    compositionEngineIds = [],
    realityChaos = 2,
    seed = '',
    energy = 3,
    recentFingerprints = [],
  } = params;

  const selectedGuys = guyIds
    .map((id) => LITTLE_GUYS.find((g) => g.id === id))
    .filter((g): g is LittleGuy => Boolean(g));

  const guys = selectedGuys.length > 0 ? selectedGuys : [LITTLE_GUYS[0]];
  const primary = guys[0];
  const secondaries = guys.slice(1);
  const subject = seed && seed.trim() ? seed.trim() : primary.name;
  const fingerprint = chooseDiverseFingerprint(recentFingerprints);
  const tempo = tempoForEnergy(energy, fingerprint.rhythm);

  const realityEngines = getRealityEngines(realityEngineIds);
  const compositionEngines = getCompositionEngines(compositionEngineIds);
  const activeLanguage = compositionEngines.find((engine) => engine.dimension === 'language');
  const activeLanguageMode = compositionEngines.find((engine) => engine.dimension === 'languageMode');
  const activeSoundSources = compositionEngines.filter((engine) => engine.dimension === 'soundSource');
  const activeAddressee = compositionEngines.find((engine) => engine.dimension === 'addressee');
  const activeEnsemble = compositionEngines.find((engine) => engine.dimension === 'ensemble');
  const activeGestures = compositionEngines.filter((engine) => engine.dimension === 'gesture');
  const activeTransmission = compositionEngines.find((engine) => engine.dimension === 'transmission');
  const activeTransductions = compositionEngines.filter((engine) => engine.dimension === 'transduction');
  const activeRecordingDamage = compositionEngines.filter((engine) => engine.dimension === 'recordingDamage');
  const activeTechnology = compositionEngines.find((engine) => engine.dimension === 'technology');
  const activeTuning = compositionEngines.find((engine) => engine.dimension === 'tuning');
  const activeRhythmPhysics = compositionEngines.filter((engine) => engine.dimension === 'rhythmPhysics');
  const activeSpatialAudio = compositionEngines.find((engine) => engine.dimension === 'spatialAudio');
  const activeRoleExchange = compositionEngines.filter((engine) => engine.dimension === 'roleExchange');
  const chemistry = analyzeRealityChemistry(realityEngineIds);
  const chaosMeta = REALITY_CHAOS_LABELS[realityChaos];

  const secondaryStyleClauses = secondaries.length > 0
    ? secondaries.map((s) => '[MUTATOR ' + s.name + ': ' + s.defaultJurisdiction + ' forces ' + s.shortExplanation + ']').join(' ')
    : '[MUTATOR: single-rule pressure remains active throughout]';

  const realityStyleClause = realityEngines.length
    ? '[REALITY MACHINE: ' + chemistry.label + '; chaos=' + chaosMeta.name + '; affinity=' + chemistry.affinity + '; friction=' + chemistry.friction + '. ' +
      realityEngines.map((engine) => REALITY_DIMENSION_LABELS[engine.dimension] + '=' + engine.name).join('; ') + '.]'
    : '[REALITY MACHINE: no external reality layers selected.]';


  const compositionStyleClause = compositionEngines.length
    ? '[COMPOSITION LAB: ' + compositionEngines.map((engine) => COMPOSITION_DIMENSION_LABELS[engine.dimension] + '=' + engine.name).join('; ') + '. Each mechanism must remain independently audible or structurally testable.]'
    : '[COMPOSITION LAB: no extra composition engines selected.]';


  const languageStyleClause = activeLanguage
    ? '[LANGUAGE SYSTEM: ' + activeLanguage.name + '; mode=' + (activeLanguageMode?.name || 'phonology/prosody guidance only') + '. Phonology first; no eye-dialect or ethnic caricature.]'
    : '[LANGUAGE SYSTEM: none selected.]';


  const soundPaletteClause = activeSoundSources.length
    ? '[SOUND PALETTE: ' + activeSoundSources.map((engine, index) => (index + 1) + '=' + engine.name).join('; ') + '. Give every source a separate job/register; preserve attack, sustain, resonance, and noise behavior; do not run every source constantly.]'
    : '[SOUND PALETTE: no extra sources selected.]';


  const voiceTopologyClause = (activeAddressee || activeEnsemble || activeGestures.length)
    ? '[VOICE TOPOLOGY: addressee=' + (activeAddressee?.name || 'unspecified') + '; ensemble=' + (activeEnsemble?.name || 'unspecified') + '; gestures=' + (activeGestures.length ? activeGestures.map((engine) => engine.name).join(' + ') : 'none') + '. Addressee changes disclosure; ensemble changes phrase/information distribution; gesture changes timing, breath, or movement.]'
    : '[VOICE TOPOLOGY: no extra addressee/ensemble/gesture rules selected.]';


  const signalLabClause = (activeTransmission || activeTransductions.length || activeRecordingDamage.length || activeTechnology)
    ? '[SIGNAL LAB: transmission=' + (activeTransmission?.name || 'none') + '; transduction=' + (activeTransductions.length ? activeTransductions.map((engine) => engine.name).join(' + ') : 'none') + '; damage=' + (activeRecordingDamage.length ? activeRecordingDamage.map((engine) => engine.name).join(' + ') : 'none') + '; technology=' + (activeTechnology?.name || 'none') + '. Transmission changes delivery; transduction uses stable mappings; damage occurs as timed failure; technology limits available operations.]'
    : '[SIGNAL LAB: no extra signal rules selected.]';


  const musicalPhysicsClause = (activeTuning || activeRhythmPhysics.length || activeSpatialAudio || activeRoleExchange.length)
    ? '[MUSICAL PHYSICS: tuning=' + (activeTuning?.name || 'default') + '; rhythm=' + (activeRhythmPhysics.length ? activeRhythmPhysics.map((engine) => engine.name).join(' + ') : 'none') + '; spatial=' + (activeSpatialAudio?.name || 'none') + '; roleExchange=' + (activeRoleExchange.length ? activeRoleExchange.map((engine) => engine.name).join(' + ') : 'none') + '. Tuning changes interval geometry; rhythm changes time organization; space changes placement/motion; role exchange transfers jobs.]'
    : '[MUSICAL PHYSICS: no extra coordinate-system rules selected.]';

  const baseStyle =
    '[GENRE/PERFORMANCE FAMILY: ' + fingerprint.genreFamily + '] ' +
    '[TEMPO: ' + tempo + '] ' +
    '[HARMONY SYSTEM: ' + fingerprint.harmony + '. Harmony owns chord motion and tension only.] ' +
    '[MELODIC SYSTEM: ' + fingerprint.melody + '. Melody owns contour and ornament only.] ' +
    '[RHYTHMIC SYSTEM: ' + fingerprint.rhythm + '. Rhythm owns pulse, subdivision, interruption, and density.] ' +
    '[TIMBRE / ATMOSPHERE: ' + fingerprint.timbre + '; produced as ' + fingerprint.production + '.] ' +
    '[VOCAL SYSTEM: ' + fingerprint.vocal + '.] ' +
    '[PERFORMANCE ATTITUDE: ' + fingerprint.performance + '.] ' +
    realityStyleClause + ' ' +
    compositionStyleClause + ' ' +
    languageStyleClause + ' ' +
    soundPaletteClause + ' ' +
    voiceTopologyClause + ' ' +
    signalLabClause + ' ' +
    musicalPhysicsClause + ' ' +
    '[ANCHOR / INVARIANT: a short recurring three-note or three-syllable figure returns recognizably after every mutation.] ' +
    '[OPERATOR 1: hold rhythmic identity fixed while harmony migrates.] ' +
    '[OPERATOR 2: make the vocal system behave like percussion without becoming percussion.] ' +
    '[OPERATOR 3: compress one section while stretching the next.] ' +
    '[OPERATOR 4: force the highest-friction Reality seam to create an event while both jurisdictions remain legible.] ' +
    '[PRIMARY ' + primary.name + ': ' + primary.shortExplanation + '] ' +
    secondaryStyleClauses;

  const stylePad = '[OPERATOR: preserve the anchor while one different jurisdiction mutates at each return; collisions must negotiate instead of blending into generic weirdness.]';
  const style = clampAndPad(baseStyle, TARGETS.style.min, TARGETS.style.max, stylePad);

  const secondaryLines = secondaries.length
    ? secondaries.map((s) => '[' + s.name + ' enters through ' + s.defaultJurisdiction + ']\n' + s.shortExplanation).join('\n')
    : '[No secondary mutator; the primary rule recursively pressures itself.]';

  const realityLines = realityLawLines(realityEngines);
  const compositionLines = compositionLawLines(compositionEngines);
  const chemistryLines = realityEngines.length
    ? '[REALITY CHEMISTRY: ' + chemistry.summary + ']\n' +
      '[TEMPORARY CONSCIOUSNESS: ' + chemistry.narrator + ']\n' +
      chemistry.directives.slice(0, 4).map((directive) => '[NEGOTIATION ORDER: ' + directive + ']').join('\n')
    : '[REALITY CHEMISTRY: no active Reality Engines.]';

  const sections = [
    '[FORM — establish the musical world]\n' +
      '[Arrangement: ' + fingerprint.timbre + ']\n' +
      (activeSoundSources.length ? '[SOUND SOURCE ROLES: assign ' + activeSoundSources.map((engine, index) => engine.name + '=' + ['ANCHOR','PULSE','BASS','LEAD','TEXTURE','ORNAMENT','INTERRUPTION','NOISE FLOOR'][index % 8]).join('; ') + '.]\n' : '') +
      '[Production: ' + fingerprint.production + ']\n' +
      '[Rhythm establishes: ' + fingerprint.rhythm + ']\n' +
      '[Vocal behavior establishes: ' + fingerprint.vocal + ']\n' +
      (activeAddressee ? '[ADDRESSEE: ' + activeAddressee.name + ' — change what the lyric assumes, explains, withholds, repeats, or asks.]\n' : '') +
      (activeEnsemble ? '[ENSEMBLE TOPOLOGY: ' + activeEnsemble.name + ' — enforce who owns each phrase, fact, response, overlap, or interruption.]\n' : '') +
      (activeGestures.length ? '[PHYSICAL GESTURES: ' + activeGestures.map((engine) => engine.name).join(' + ') + ' — make gesture alter timing, breath, articulation, or body-percussion rather than acting as silent stage direction.]\n' : '') +
      (activeTransmission ? '[TRANSMISSION: ' + activeTransmission.name + ' — enforce who can hear what, when, and with what channel limits.]\n' : '') +
      (activeTransductions.length ? '[TRANSDUCTION: ' + activeTransductions.map((engine) => engine.name).join(' + ') + ' — preserve stable source→target mappings.]\n' : '') +
      (activeRecordingDamage.length ? '[RECORDING DAMAGE: ' + activeRecordingDamage.map((engine) => engine.name).join(' + ') + ' — schedule real failure events with causes or thresholds.]\n' : '') +
      (activeTechnology ? '[TECHNOLOGY: ' + activeTechnology.name + ' — do not use operations outside the selected workflow unless another engine explicitly enables them.]\n' : '') +
      (activeTuning ? '[TUNING: ' + activeTuning.name + ' — make interval relationships obey this pitch world instead of defaulting silently to 12-TET.]\n' : '') +
      (activeRhythmPhysics.length ? '[RHYTHMIC PHYSICS: ' + activeRhythmPhysics.map((engine) => engine.name).join(' + ') + ' — keep every selected clock/cycle/process audible and separately traceable.]\n' : '') +
      (activeSpatialAudio ? '[SPATIAL AUDIO: ' + activeSpatialAudio.name + ' — placement and movement must change arrangement behavior, not just stereo width.]\n' : '') +
      (activeRoleExchange.length ? '[ROLE EXCHANGE: ' + activeRoleExchange.map((engine) => engine.name).join(' + ') + ' — explicitly transfer the named musical jobs while preserving recognizable source identity.]\n' : '') +
      'Subject: ' + subject + '.\n' +
      'The first pass is deliberately legible. The listener is given a stable specimen before any mutation begins.\n' +
      primary.name + ' controls ' + primary.defaultJurisdiction + '.\n' +
      'Nothing else is permitted to steal that jurisdiction.\n' +
      realityLines + '\n' +
      compositionLines + '\n' +
      '[Anchor appears: three compact notes or syllables, clean and memorable.]\n' +
      'Record the anchor exactly. It will return after the system damages everything around it.',

    '[DESTABILIZE — separate jurisdictions begin negotiating]\n' +
      '[Harmony changes according to: ' + fingerprint.harmony + ']\n' +
      '[Melody refuses to imitate harmony and follows: ' + fingerprint.melody + ']\n' +
      '[Rhythm remains governed by: ' + fingerprint.rhythm + ']\n' +
      chemistryLines + '\n' +
      'The song does not blend these instructions into one vague style. Each rule keeps its own job.\n' +
      (activeTransmission ? 'The transmission medium changes information flow rather than merely EQ.\n' : '') +
      (activeTransductions.length ? 'Every transduction rule repeats its mapping consistently enough to be inferred.\n' : '') +
      (activeRecordingDamage.length ? 'Recording damage happens at specific moments and changes what survives the medium.\n' : '') +
      (activeTechnology ? 'The selected technology constrains editing, track count, bandwidth, storage, or live workflow where applicable.\n' : '') +
      (activeTuning ? 'Pitch behavior is generated inside the selected tuning coordinate system.\n' : '') +
      (activeRhythmPhysics.length ? 'Rhythmic processes operate as real clocks, cycles, phase relations, or density laws rather than descriptive oddness.\n' : '') +
      (activeSpatialAudio ? 'Spatial placement changes source relationships and handoffs.\n' : '') +
      (activeRoleExchange.length ? 'Musical role transfers happen at explicit moments and leave the original identity traceable.\n' : '') +
      'The highest-friction Reality seam creates the next problem. One Reality layer must respond using only the procedures of its own jurisdiction.\n' +
      'Any active Composition Lab engine must produce a concrete audible or structural consequence rather than merely being named.\n' +
      secondaryLines + '\n' +
      '[Anchor returns unchanged for one bar.]\n' +
      'That unchanged return makes the surrounding deformation measurable.',

    '[VOCAL ENGINE — use the mouth as part of the arrangement]\n' +
      '[Primary vocal technique: ' + fingerprint.vocal + ']\n' +
      (activeLanguage ? '[LANGUAGE FIDELITY: ' + activeLanguage.name + ' with ' + (activeLanguageMode?.name || 'phonology/prosody guidance only') + '; preserve phonological mechanics without stereotype.]\n' : '') +
      '[Hard consonants become transient attacks: tk, kk, pt, dr.]\n' +
      '[Nasals become resonance: mm, nn, ng.]\n' +
      '[Open vowels become sustained melody: aa, oh, ee.]\n' +
      '[Rolled consonants accelerate agitation: rrr-ra, trrra.]\n' +
      '[Dense syllables compress time: kratak-tikka-brradan.]\n' +
      '[Long vowels stretch the same clock: aaaaaa—oooooo.]\n' +
      'The nonsense is not decorative. Its phonetics physically reinforce the selected rhythmic and melodic systems.\n' +
      'If ROLE is active, diction still performs the job. If HEADSPACE is active, interruptions and salience visibly alter delivery without deleting the role. If ADDRESSEE is active, the lyric must visibly change what it assumes or reveals. If ENSEMBLE is active, distribute information/phrases according to its topology. If GESTURE is active, bodily movement must produce audible timing, breath, or articulation consequences.',

    '[FRACTURE — incompatible temporal scales coexist]\n' +
      '[Keep the main pulse recognizable.]\n' +
      '[Compress percussion activity into a short dense burst.]\n' +
      '[Stretch one vocal phrase across several bars.]\n' +
      '[Move harmonic tension slowly while melodic ornament moves quickly.]\n' +
      'The subject remains ' + subject + ', but the method of describing it becomes unstable.\n' +
      'FORMAT must remain structurally legible while any altered-state law damages time, identity, embodiment, source attribution, or reality testing from inside the format.\n' +
      '[Anchor attempts to return, but one interval or syllable has been altered.]\n' +
      'The system recognizes the anchor anyway. That recognition is now doing structural work.',

    '[COLLAPSE — remove support instead of merely getting louder]\n' +
      '[Drop one entire musical jurisdiction for a short interval: harmony vanishes while rhythm and voice continue.]\n' +
      '[Then reverse it: rhythm thins to silence while harmony and sustained voice remain.]\n' +
      'The composition discovers which relationships were load-bearing.\n' +
      primary.name + ' remains active even when instrumentation changes.\n' +
      'The Little Guy rule is therefore heard as a causal law, not a costume.\n' +
      '[Reality collision remains active: no layer is allowed to evaporate merely because another became extreme.]\n' +
      '[Performance attitude intensifies: ' + fingerprint.performance + ']\n' +
      '[Brief silence.]\n' +
      'The silence is counted as an event, not an absence.',

    '[ANCHOR RETURNS — recognizable, damaged, useful]\n' +
      '[Return the original three-note or three-syllable figure.]\n' +
      '[Preserve its contour.]\n' +
      '[Change exactly one property inherited from the fracture.]\n' +
      'The anchor now proves that identity can survive mutation without staying pristine.\n' +
      'One voice states what changed. Another voice performs the consequence.\n' +
      'The Reality Engine with the strongest friction is now forced to cooperate with the layer it resisted most.\n' +
      '[Call and response between explanation and enactment.]',

    '[REFORM STRANGER — rebuild from the scar rather than resetting]\n' +
      '[Full arrangement returns using ' + fingerprint.timbre + ']\n' +
      '[Production space remains ' + fingerprint.production + ']\n' +
      'Do not restore the opening exactly. The final form must inherit the damage that proved useful.\n' +
      'Harmony keeps one displaced tension. Melody keeps one mutated ornament. Rhythm keeps one interruption. Voice keeps one transformed phonetic habit.\n' +
      secondaryLines + '\n' +
      '[Final anchor return: instantly recognizable, structurally altered, fully integrated.]\n' +
      'The song ends because Minds, music systems, and Reality jurisdictions have negotiated a new coherent law set—not because contradiction disappeared.',

    '[OUTRO — document the experiment without draining its energy]\n' +
      'Genre family used: ' + fingerprint.genreFamily + '.\n' +
      'Harmony jurisdiction: ' + fingerprint.harmony + '.\n' +
      'Melodic jurisdiction: ' + fingerprint.melody + '.\n' +
      'Rhythmic jurisdiction: ' + fingerprint.rhythm + '.\n' +
      'Vocal jurisdiction: ' + fingerprint.vocal + '.\n' +
      'Reality chemistry: ' + chemistry.label + '.\n' +
      'Composition Lab engines: ' + (compositionEngines.length ? compositionEngines.map((engine) => engine.name).join(', ') : 'none') + '.\n' +
      '[One last compact anchor. End immediately after recognition.]'
  ];

  const lyricsPad =
    '[EXTENSION OPERATOR: repeat the current rule through a different jurisdiction only; preserve the anchor and the active Reality collision; every extra measure must demonstrate causal transformation rather than decorative complexity.]';
  const lyrics = clampAndPad(sections.join('\n\n'), TARGETS.lyrics.min, TARGETS.lyrics.max, lyricsPad);

  const secNames = secondaries.map((s) => s.name).join(' and ');
  const mutationPhrase = secNames
    ? ' while ' + secNames + ' apply separate jurisdictional pressure'
    : ' while the same rule recursively pressures its own consequences';

  const realityCaption = realityEngines.length
    ? ' The Reality stack is ' + chemistry.label.toLowerCase() + ': ' + chemistry.narrator
    : '';
  const compositionCaption = compositionEngines.length
    ? ' Composition Lab adds ' + compositionEngines.map((engine) => engine.name).join(', ') + ' as operational constraints.'
    : '';

  const baseCaption =
    'This run treats ' + primary.name + ' as a musical law' + mutationPhrase + '. ' +
    'Its sound world uses ' + fingerprint.genreFamily + ', with ' + fingerprint.rhythm + ' controlling pulse and ' +
    fingerprint.vocal + ' controlling the mouth as an instrument.' + realityCaption + compositionCaption + ' ' +
    'The anchor survives each fracture and returns carrying one useful scar.';

  const captionPad = ' The final form preserves negotiated mutation instead of resetting.';
  const caption = clampAndPad(baseCaption, TARGETS.caption.min, TARGETS.caption.max, captionPad);

  return { style, lyrics, caption, fingerprint };
}
