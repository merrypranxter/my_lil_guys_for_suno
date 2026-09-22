import { LITTLE_GUYS } from '../data/littleGuys';
import { BoxType, LittleGuy } from '../types';

export interface ProceduralTrackParams {
  guyIds: string[];
  seed?: string;
  energy: number;
}

export interface ProceduralTrackResult {
  style: string;
  lyrics: string;
  caption: string;
}

// Exact character targets
export const TARGETS = {
  style: { min: 975, max: 999 },
  lyrics: { min: 4900, max: 4999 },
  caption: { min: 490, max: 499 },
};

export function clampAndPad(text: string, min: number, max: number, padSnippet: string): string {
  let result = text.trim();
  if (result.length > max) {
    result = result.slice(0, max);
    // Try to cut at clean punctuation if possible
    const lastPunct = Math.max(result.lastIndexOf('. '), result.lastIndexOf('] '));
    if (lastPunct > min) {
      result = result.slice(0, lastPunct + 1);
    }
  }

  while (result.length < min) {
    const diff = min - result.length;
    if (diff <= padSnippet.length) {
      result += ' ' + padSnippet.slice(0, diff - 1);
    } else {
      result += '\n' + padSnippet;
    }
  }

  if (result.length > max) {
    result = result.slice(0, max);
  }

  return result;
}

export function generateProceduralTrack(params: ProceduralTrackParams): ProceduralTrackResult {
  const { guyIds, seed = '', energy = 3 } = params;

  const selectedGuys = guyIds
    .map((id) => LITTLE_GUYS.find((g) => g.id === id))
    .filter((g): g is LittleGuy => Boolean(g));

  const guys = selectedGuys.length > 0 ? selectedGuys : [LITTLE_GUYS[0]];
  const primary = guys[0];
  const secondaries = guys.slice(1);

  const subject = seed && seed.trim() ? seed.trim() : primary.name;

  // Energy-specific sound profiles
  const tempoRanges: Record<number, string> = {
    1: '78 BPM half-time drift',
    2: '104 BPM motoric pulse',
    3: '128 BPM driving velocity',
    4: '152 BPM hyper-syncopated pressure',
    5: '176 BPM breakcore meltdown',
  };

  const tempo = tempoRanges[energy] || '130 BPM';

  // --- 1. BUILD STYLE STRING (Target: 975 - 999 chars) ---
  const secondaryStyleClauses = secondaries.length > 0
    ? secondaries.map((s) => `[MUTATOR: ${s.name}] applies ${s.defaultJurisdiction} constraint: "${s.shortExplanation}"`).join('. ')
    : `[MUTATOR: MONO-STATE] single ontological focus under strict constraint`;

  let baseStyle = `[TEMPO: ${tempo}] [HARMONY SYSTEM: Microtonal frequency drift, suspended fourth cluster collisions, chromatic bass pedal anchoring shifting modal centers, sudden tonal dropouts]. [MELODIC SYSTEM: Stepped angular staccato synth leads, glitch-ornamented phrase repetition, retrograde pitch inversions responding to subject: ${subject}]. [RHYTHMIC SYSTEM: Polyrhythmic 5/4 over 4/4 syncopated mechanical kick, compressed transient snaps, sudden metric modulation, accelerating hi-hat ratchets]. [TIMBRE / ATMOSPHERE: Industrial tape grit, sub-audible low rumble, hyper-saturated metallic resonance, granular room reverb, analog filter sweeps]. [PERFORMANCE ATTITUDE: Surgical clinical detachment alternating with frantic kinetic overdrive]. [ANCHOR / INVARIANT: Persistent 100Hz square-wave tone remains static while surrounding structures mutate]. [PRIMARY OPERATOR: ${primary.name}] enforces ${primary.defaultJurisdiction}: ${primary.shortExplanation}. ${secondaryStyleClauses}. Operational contradiction strictly preserved.`;

  const stylePadSnippet = `[TRANSFORMATION RULE: Maintain kinetic tempo invariant while harmonic centers rotate through systematic phase-cancelling registers, producing relentless recursive propulsion].`;
  const style = clampAndPad(baseStyle, TARGETS.style.min, TARGETS.style.max, stylePadSnippet);

  // --- 2. BUILD LYRICS / CONTROL STRING (Target: 4900 - 4999 chars) ---
  const sections = [
    `[Intro - Sub-Bass Calibration at ${tempo}]
[Low drone hums at 45Hz. Metric grid initialization sequence active.]
Telemetry signal 00-A: baseline ontological parameters verified.
Subject initialized: "${subject}".
${primary.name} asserts sovereign jurisdiction over ${primary.defaultJurisdiction}.
[Dry mechanical click. Hi-hats enter in staggered triplet subdivisions.]
Status check: memory buffers intact.
Observe the initial coordinate before the first operator fires.
Nothing has moved yet. Everything is still registered as true.`,

    `[Verse 1 - Procedural Telemetry]
[Sub-bass pulses steadily. Dry snare snaps on the offbeats.]
We catalog the container by its designated serial label.
Item zero-one: the boundary wall is exactly two meters high.
Item zero-two: the recorded weight matches the manifest on file.
We mark the requisition sheet with a dry pencil stroke.
Everything behaves according to standard clerical inventory.
[Bassline drops an octave. Distortion filter opens 20%.]
No anomalies detected in the baseline registry.
The primary mechanism (${primary.name}) holds the room stationary.
Every noun corresponds to exactly one physical coordinate.
Step forward. Log the measurement. Await confirmation.
The meter does not deviate from 4/4.
Yet the acoustic horizon already begins to tilt.`,

    `[Pre-Chorus - Phase Inversion Cues]
[Tempo accelerates slightly. Glitch filter sweeps upward.]
Did you hear the acoustic gap between syllables?
That was not a pause in the recording.
That was ${primary.defaultJurisdiction} losing its fixed anchor.
[Rhythmic snare roll crescendo with white-noise wash.]
Prepare for the primary operational collision!`,

    `[Chorus - Ontological Rupture]
[FULL KINETIC PEAK - Distorted analog leads and thunderous sub-bass kicks.]
${primary.name} strikes the foundation!
The established meaning begins to buckle under retroactive recoil!
We rewrite the ledger while the ink is still wet!
What was solid in verse one is now an administrative phantom!
[Lead synth bends microtonally upward by 75 cents.]
You cannot return to the baseline coordinate!
The invariant holds, but the world has rotated underneath!
Subject "${subject}" is re-indexed under new protocol!
[Stutter-edit beat cut: 0.5 seconds dead silence.]`,

    `[Post-Chorus - Structural Artifacts]
[Half-time groove enters with heavy side-chained reverb.]
Residual harmonics ring at 1.2 kilohertz.
Notice what remains when the primary noun is dissolved.
Only the operational rule continues to execute:
"${primary.rule.slice(0, 120)}..."
The ledger records the vacancy as an active variable.`,

    `[Verse 2 - Secondary Mutation Cycle]
[Tempo returns to ${tempo}. Percussion becomes irregular 5/8 syncopation.]
Now the secondary mutators apply their localized pressure.
${secondaries.length > 0 ? secondaries.map((s) => `[${s.name}]: Enforcing ${s.defaultJurisdiction} violation.`).join('\n') : '[HOMOGENOUS EXTENSION]: Amplifying primary contradiction across all frequency bands.'}
The walls we measured at two meters are now defined as a species of sediment.
We test the classification with a clinical calibration hammer.
The sound it makes is not wood or stone—it is a bureaucratic receipt.
[Tape stop effect followed by instant aggressive restart.]
Item zero-three has been reassigned to an alien jurisdiction.
The observers in the control booth do not sound alarms.
They simply update the maintenance schedule to account for the void.
Keep the motor running. Keep the pulse locked.
We are moving deeper into the phase space of the subject.`,

    `[Bridge - Deep Algorithmic Breakdown]
[All drums drop out. Deep resonant sub-oscillator and dry whispered spoken word.]
Listen closely to the telemetry log:
Timestamp 04:12:09.
The causal predecessor has been backfilled.
The terminal event was fixed before the song began.
Every verse was simply the necessary ancestor of this fracture.
[A solitary 808 kick begins beating at 60 BPM like a slow cardiac pump.]
Do you feel the pressure in the invariant register?
100Hz square-wave. Unflinching. Unforgiving.
It watched the entire track dismantle itself and did not blink.
[Arpeggiated synth line ascends rapidly in diminished fifths.]
Rebuilding sequence initiated in five, four, three, two...`,

    `[Guitar/Synth Solo - Hyper-Velocity Meltdown]
[MAXIMUM ENERGY OVERLOAD - Rapid double-time breakbeats, screaming synthesizer leads, extreme stereophonic panning.]
[Direction: Aggressive pitch modulation, bit-crushed saturation, rhythmic stutter gates.]
Everything that was deleted now returns with distorted polarity!
The retcon has consumed the introduction!
Verse one now means the exact opposite of what you thought you heard!
The inventory was never an inventory—it was a quarantine notice!`,

    `[Chorus - Final Transmuted Reprise]
[Full instrumental array firing at 100% capacity.]
${primary.name} stands upon the altered wreckage!
The Little Guy Machine has completed its recursive cycle!
Subject "${subject}" is fully re-architected!
We preserve the revised ontology into permanent storage!
No apologies! No retreat! The new state is permanent!
[Massive wall of sound hits final sustained unison chord.]`,

    `[Outro - Signal Decay and Ledger Sealing]
[Echoing feedback decays into distance. Clockwork metronome ticks quietly.]
All operational variables logged and archived.
Jurisdiction: ${primary.defaultJurisdiction} remains modified.
Terminal status: COHERENT ANOMALY.
Final reading: 0.0001% divergence from predicted deviation.
[Single dry relay switch click.]
[End of sequence.]`,
  ];

  let baseLyrics = sections.join('\n\n');

  const lyricsPadSnippet = `[STRUCTURAL REPETITION: The invariant register continues to pulse in steady mechanical increments, affirming that the operational rules established by ${primary.name} remain active in the background architecture, preventing total epistemic decay while the rhythmic cycle sustains momentum through the designated terminal coordinate.]`;
  const lyrics = clampAndPad(baseLyrics, TARGETS.lyrics.min, TARGETS.lyrics.max, lyricsPadSnippet);

  // --- 3. BUILD CAPTION STRING (Target: 490 - 499 chars) ---
  const secNames = secondaries.map((s) => s.name).join(' & ');
  const mutatorText = secNames ? ` mutated under ${secNames}` : ` under disciplined operational constraint`;

  let baseCaption = `This track deploys ${primary.name} as primary generative architecture${mutatorText}. Anchored around "${subject}", the composition enforces strict structural tension: baseline mechanics establish an administrative inventory before systemic pressure forces retroactive ontological revision. Rather than surreal decoration, the sonic collisions function as literal physical laws governed by ${primary.defaultJurisdiction}.`;

  const captionPadSnippet = ` Precision calibrated for Little Guy Machine telemetry.`;
  const caption = clampAndPad(baseCaption, TARGETS.caption.min, TARGETS.caption.max, captionPadSnippet);

  return {
    style,
    lyrics,
    caption,
  };
}
