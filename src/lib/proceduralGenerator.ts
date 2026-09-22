import { LITTLE_GUYS } from '../data/littleGuys';
import { chooseDiverseFingerprint } from '../data/musicTaxonomy';
import { BoxType, LittleGuy, MusicFingerprint } from '../types';

export interface ProceduralTrackParams {
  guyIds: string[];
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

export function generateProceduralTrack(params: ProceduralTrackParams): ProceduralTrackResult {
  const { guyIds, seed = '', energy = 3, recentFingerprints = [] } = params;

  const selectedGuys = guyIds
    .map((id) => LITTLE_GUYS.find((g) => g.id === id))
    .filter((g): g is LittleGuy => Boolean(g));

  const guys = selectedGuys.length > 0 ? selectedGuys : [LITTLE_GUYS[0]];
  const primary = guys[0];
  const secondaries = guys.slice(1);
  const subject = seed && seed.trim() ? seed.trim() : primary.name;
  const fingerprint = chooseDiverseFingerprint(recentFingerprints);
  const tempo = tempoForEnergy(energy, fingerprint.rhythm);

  const secondaryStyleClauses = secondaries.length > 0
    ? secondaries.map((s) => '[MUTATOR ' + s.name + ': ' + s.defaultJurisdiction + ' forces ' + s.shortExplanation + ']').join(' ')
    : '[MUTATOR: single-rule pressure remains active throughout]';

  const baseStyle =
    '[GENRE/PERFORMANCE FAMILY: ' + fingerprint.genreFamily + '] ' +
    '[TEMPO: ' + tempo + '] ' +
    '[HARMONY SYSTEM: ' + fingerprint.harmony + '. Harmony owns chord motion and tension only.] ' +
    '[MELODIC SYSTEM: ' + fingerprint.melody + '. Melody owns contour and ornament only.] ' +
    '[RHYTHMIC SYSTEM: ' + fingerprint.rhythm + '. Rhythm owns pulse, subdivision, interruption, and density.] ' +
    '[TIMBRE / ATMOSPHERE: ' + fingerprint.timbre + '; produced as ' + fingerprint.production + '.] ' +
    '[VOCAL SYSTEM: ' + fingerprint.vocal + '.] ' +
    '[PERFORMANCE ATTITUDE: ' + fingerprint.performance + '.] ' +
    '[ANCHOR / INVARIANT: a short recurring three-note or three-syllable figure returns recognizably after every mutation.] ' +
    '[OPERATOR 1: hold rhythmic identity fixed while harmony migrates.] ' +
    '[OPERATOR 2: make the vocal system behave like percussion without becoming percussion.] ' +
    '[OPERATOR 3: compress one section while stretching the next.] ' +
    '[OPERATOR 4: return the anchor with one structural scar added.] ' +
    '[PRIMARY ' + primary.name + ': ' + primary.shortExplanation + '] ' +
    secondaryStyleClauses;

  const stylePad = '[OPERATOR: preserve the anchor while one different jurisdiction mutates at each return, preventing genre salad and preserving causal contrast.]';
  const style = clampAndPad(baseStyle, TARGETS.style.min, TARGETS.style.max, stylePad);

  const secondaryLines = secondaries.length
    ? secondaries.map((s) => '[' + s.name + ' enters through ' + s.defaultJurisdiction + ']\n' + s.shortExplanation).join('\n')
    : '[No secondary mutator; the primary rule recursively pressures itself.]';

  const sections = [
    '[FORM — establish the musical world]\n' +
      '[Arrangement: ' + fingerprint.timbre + ']\n' +
      '[Production: ' + fingerprint.production + ']\n' +
      '[Rhythm establishes: ' + fingerprint.rhythm + ']\n' +
      '[Vocal behavior establishes: ' + fingerprint.vocal + ']\n' +
      'Subject: ' + subject + '.\n' +
      'The first pass is deliberately legible. The listener is given a stable specimen before any mutation begins.\n' +
      primary.name + ' controls ' + primary.defaultJurisdiction + '.\n' +
      'Nothing else is permitted to steal that jurisdiction.\n' +
      '[Anchor appears: three compact notes or syllables, clean and memorable.]\n' +
      'Record the anchor exactly. It will return after the system damages everything around it.',

    '[DESTABILIZE — separate jurisdictions begin negotiating]\n' +
      '[Harmony changes according to: ' + fingerprint.harmony + ']\n' +
      '[Melody refuses to imitate harmony and follows: ' + fingerprint.melody + ']\n' +
      '[Rhythm remains governed by: ' + fingerprint.rhythm + ']\n' +
      'The song does not blend these instructions into one vague style. Each rule keeps its own job.\n' +
      'When harmony leans toward release, melody may refuse it. When rhythm accelerates internally, the vocal line may stretch a vowel across the pressure.\n' +
      secondaryLines + '\n' +
      '[Anchor returns unchanged for one bar.]\n' +
      'That unchanged return makes the surrounding deformation measurable.',

    '[VOCAL ENGINE — use the mouth as part of the arrangement]\n' +
      '[Primary vocal technique: ' + fingerprint.vocal + ']\n' +
      '[Hard consonants become transient attacks: tk, kk, pt, dr.]\n' +
      '[Nasals become resonance: mm, nn, ng.]\n' +
      '[Open vowels become sustained melody: aa, oh, ee.]\n' +
      '[Rolled consonants accelerate agitation: rrr-ra, trrra.]\n' +
      '[Dense syllables compress time: kratak-tikka-brradan.]\n' +
      '[Long vowels stretch the same clock: aaaaaa—oooooo.]\n' +
      'The nonsense is not decorative. Its phonetics physically reinforce the selected rhythmic and melodic systems.\n' +
      'The singer explains the change while also enacting it: consonants shorten, vowels lengthen, and the line becomes its own instrumentation.',

    '[FRACTURE — incompatible temporal scales coexist]\n' +
      '[Keep the main pulse recognizable.]\n' +
      '[Compress percussion activity into a short dense burst.]\n' +
      '[Stretch one vocal phrase across several bars.]\n' +
      '[Move harmonic tension slowly while melodic ornament moves quickly.]\n' +
      'The subject remains ' + subject + ', but the method of describing it becomes unstable.\n' +
      'A statement begins as dry explanation and ends as phonetic mechanics.\n' +
      'A repeated phrase loses one ordinary word and gains one operational sound.\n' +
      '[Anchor attempts to return, but one interval or syllable has been altered.]\n' +
      'The system recognizes the anchor anyway. That recognition is now doing structural work.',

    '[COLLAPSE — remove support instead of merely getting louder]\n' +
      '[Drop one entire jurisdiction for a short interval: harmony vanishes while rhythm and voice continue.]\n' +
      '[Then reverse it: rhythm thins to silence while harmony and sustained voice remain.]\n' +
      'The composition discovers which relationships were load-bearing.\n' +
      primary.name + ' remains active even when instrumentation changes.\n' +
      'The Little Guy rule is therefore heard as a causal law, not a costume.\n' +
      '[Performance attitude intensifies: ' + fingerprint.performance + ']\n' +
      'The musicians commit harder to the contradiction instead of smoothing it out.\n' +
      '[Brief silence.]\n' +
      'The silence is counted as an event, not an absence.',

    '[ANCHOR RETURNS — recognizable, damaged, useful]\n' +
      '[Return the original three-note or three-syllable figure.]\n' +
      '[Preserve its contour.]\n' +
      '[Change exactly one property inherited from the fracture.]\n' +
      'The anchor now proves that identity can survive mutation without staying pristine.\n' +
      'The singer names what changed in plain language.\n' +
      'Then the ensemble demonstrates it again without explanation.\n' +
      '[Call and response between explanation and enactment.]\n' +
      'One voice states the rule. Another voice performs the consequence. The instruments answer with the same relationship in their own jurisdiction.',

    '[REFORM STRANGER — rebuild from the scar rather than resetting]\n' +
      '[Full arrangement returns using ' + fingerprint.timbre + ']\n' +
      '[Production space remains ' + fingerprint.production + ']\n' +
      'Do not restore the opening exactly. The final form must inherit the damage that proved useful.\n' +
      'Harmony keeps one displaced tension. Melody keeps one mutated ornament. Rhythm keeps one interruption. Voice keeps one transformed phonetic habit.\n' +
      secondaryLines + '\n' +
      '[Final anchor return: instantly recognizable, structurally altered, fully integrated.]\n' +
      'The song ends because the system has reached a new coherent rule set, not because a conventional chorus count has been satisfied.',

    '[OUTRO — document the experiment without draining its energy]\n' +
      'Genre family used: ' + fingerprint.genreFamily + '.\n' +
      'Harmony jurisdiction: ' + fingerprint.harmony + '.\n' +
      'Melodic jurisdiction: ' + fingerprint.melody + '.\n' +
      'Rhythmic jurisdiction: ' + fingerprint.rhythm + '.\n' +
      'Vocal jurisdiction: ' + fingerprint.vocal + '.\n' +
      'Performance behavior: ' + fingerprint.performance + '.\n' +
      '[One last compact anchor. End immediately after recognition.]'
  ];

  const lyricsPad =
    '[EXTENSION OPERATOR: repeat the current rule through a different jurisdiction only; preserve the anchor, avoid adding a new genre label, and make every extra measure demonstrate a causal transformation rather than decorative complexity.]';
  const lyrics = clampAndPad(sections.join('\n\n'), TARGETS.lyrics.min, TARGETS.lyrics.max, lyricsPad);

  const secNames = secondaries.map((s) => s.name).join(' and ');
  const mutationPhrase = secNames
    ? ' while ' + secNames + ' apply separate jurisdictional pressure'
    : ' while the same rule recursively pressures its own consequences';

  const baseCaption =
    'This run treats ' + primary.name + ' as a musical law' + mutationPhrase + '. ' +
    'Its sound world uses ' + fingerprint.genreFamily + ', with ' + fingerprint.rhythm + ' controlling pulse and ' +
    fingerprint.vocal + ' controlling the mouth as an instrument. Harmony, melody, rhythm, timbre, and performance never collapse into genre salad; the anchor survives each fracture and returns carrying one useful scar.';

  const captionPad = ' The final form preserves the mutation instead of resetting.';
  const caption = clampAndPad(baseCaption, TARGETS.caption.min, TARGETS.caption.max, captionPad);

  return { style, lyrics, caption, fingerprint };
}
