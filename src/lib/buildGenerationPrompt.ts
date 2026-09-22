import { LITTLE_GUYS } from '../data/littleGuys';
import { BoxType, LittleGuy } from '../types';

export interface GenerationPromptParams {
  guyIds: string[];
  seed?: string;
  energy: number;
}

export function buildMasterPrompt(params: GenerationPromptParams): { systemInstruction: string; userPrompt: string } {
  const { guyIds, seed, energy } = params;

  const selectedGuys: LittleGuy[] = guyIds
    .map((id) => LITTLE_GUYS.find((g) => g.id === id))
    .filter((g): g is LittleGuy => Boolean(g));

  const fallbackGuy = LITTLE_GUYS[0];
  const guys: LittleGuy[] = selectedGuys.length > 0 ? selectedGuys : [fallbackGuy];

  const primaryGuy: LittleGuy = guys[0] || fallbackGuy;
  const secondaryGuys: LittleGuy[] = guys.slice(1);

  const energyLabels: Record<number, string> = {
    1: 'ENERGY LEVEL 1: Latent Drift / Subsurface Mutation (controlled, subtle creeping distortions, persistent undercurrent)',
    2: 'ENERGY LEVEL 2: Low Hum / Controlled Asymmetry (unsettling regularities, steady motoric pulse, sharp occasional glitches)',
    3: 'ENERGY LEVEL 3: Steady Combustion / High Kinetic Tension (active propulsion, driving rhythm, pronounced structural fractures)',
    4: 'ENERGY LEVEL 4: High Reactor / Rapid Phase Shift (frenetic tempo, dense sonic pressure, severe operational mutations)',
    5: 'ENERGY LEVEL 5: Critical Meltdown / Hyper-Drive Overload (maximum kinetic velocity, hyper-dense collision, extreme structural stress)',
  };

  const stackBreakdown = guys
    .map((g, idx) => {
      if (idx === 0) {
        return `[POSITION 1 - PRIMARY GENERATIVE FOUNDATION]: ${g.name} (${g.subtitle})
Jurisdiction: ${g.defaultJurisdiction}
Operational Rule: ${g.rule}
Role: Establishes the core generative ontology, default baseline mechanics, and primary structural world.`;
      }
      return `[POSITION ${idx + 1} - MUTATOR / REGULATOR]: ${g.name} (${g.subtitle})
Jurisdiction: ${g.defaultJurisdiction}
Operational Rule: ${g.rule}
Role: Must actively mutate, constrain, damage, invert, or regulate Position 1's mechanism without overriding its existence. Force these two to negotiate in their respective jurisdictions.`;
    })
    .join('\n\n');

  const systemInstruction = `YOU ARE THE CORE INFERENCE ENGINE OF THE LITTLE GUY MACHINE.
Your purpose is to produce three precisely engineered creative outputs for SUNO AI music generation using cognitive/generative rules called "Little Guys".

CRITICAL ARCHITECTURAL DIRECTIVES:
1. NEVER produce generic "weirdness salad" or superficial surrealism. The cognitive rules are operational constraints and physical laws, not costume labels.
2. STACK NEGOTIATION IS MANDATORY:
   - The PRIMARY GUY (${primaryGuy.name}) dictates the baseline generative ontology and system logic.
   - The SECONDARY GUYS (${secondaryGuys.map((g) => g.name).join(', ') || 'None'}) exert pressure on their specific jurisdictions (semantic meaning, memory, causality, attention, narration, representation, classification, temporal structure, emotional weighting, observation, information loss, ontology, lyric syntax).
   - They MUST negotiate. Example: If Guy 1 establishes an administrative inventory and Guy 2 deletes a primitive, the inventory must actively log the missing primitive as an unfulfillable requisition code.
3. OUTPUT FORMAT:
   You MUST return a valid, parseable JSON object with exactly three string keys:
   {
     "style": "...",
     "lyrics": "...",
     "caption": "..."
   }

==================================================
TARGET CHARACTER COUNT RULES (INCLUDING SPACES & LINE BREAKS):
==================================================
BOX 1 — "style": TARGET EXACTLY 975 TO 999 CHARACTERS.
BOX 2 — "lyrics": TARGET EXACTLY 4900 TO 4999 CHARACTERS.
BOX 3 — "caption": TARGET EXACTLY 490 TO 499 CHARACTERS.

Plan token pacing deliberately to hit these exact character windows!`;

  const userPrompt = `EXECUTE SUNO GENERATION REQUEST.

ACTIVE LITTLE GUY STACK:
${stackBreakdown}

ENERGY PARAMETER:
${energyLabels[energy] || energyLabels[3]}

OPTIONAL SEED / SUBJECT / EXPERIMENT:
${seed && seed.trim() ? `"${seed.trim()}"` : 'NONE PROVIDED (Derive subject organically from the primary Little Guy ontology)'}

==================================================
DETAILED SPECIFICATIONS FOR THE THREE RETURNED BOXES:
==================================================

--------------------------------------------------
BOX 1: STYLE
--------------------------------------------------
TARGET LENGTH: 975–999 CHARACTERS (Including all spaces and punctuation).
METHOD: Productive Contradiction Under Constraint.
Music must be ACTIVE, ENERGETIC, AND HIGHLY ENGAGING (avoid slow, drab, sad, or boring music unless seed demands it).
Do NOT mention artist names or produce lazy genre lists.
Internally synthesize and format using these distinct systems:
- [HARMONY SYSTEM]: chord behavior, consonance/dissonance, tension, voicing
- [MELODIC SYSTEM]: pitch movement, ornament, phrasing, contour, slides, repetition
- [RHYTHMIC SYSTEM]: pulse, subdivision, meter, syncopation, acceleration, density
- [TIMBRE / ATMOSPHERE SYSTEM]: texture, instrumentation, space, surface quality, sonic materials
- [PERFORMANCE ATTITUDE]: emotional and theatrical behavior
- [ANCHOR / INVARIANT]: element that stays recognizable while surroundings mutate
- Apply 5–10 operational transformation operators (e.g., "hold rhythm fixed while harmony slips microtonally", "compress percussion into ultra-dense bursts while stretching vocals", "alternate surgical precision with sudden physical collapse").
Make the weirdness operational.

--------------------------------------------------
BOX 2: LYRICS / CONTROL
--------------------------------------------------
TARGET LENGTH: 4900–4999 CHARACTERS (Including all spaces, linebreaks, and tags).
STRUCTURE:
- Every non-sung cue, instrumental direction, structural section, sound effect, and tempo shift MUST be enclosed in [SQUARE BRACKETS], such as:
  [Intro - Sub-Bass Calibration], [Verse 1 - Dry Telemetry], [Tempo Accelerates 1.3x], [Pre-Chorus - Acoustic Fissure], [Drop - Percussive Glitch], [Outro - Signal Decay].
- LYRICAL CONTENT:
  - Can include dry technical narration, procedural explanation, clinical observation, bureaucratic description, literal descriptions of what the audio system is doing, phonetic nonsense.
  - Avoid neat standard pop rhyming schemes; make it feel like an internal cognitive event.
  - Follow the mutation cycle: FORM → DESTABILIZE → FRACTURE → COLLAPSE → ANCHOR RETURNS → REFORM STRANGER.
  - If phonetic nonsense is used, use it functionally (hard consonants for percussion, nasals for resonance, open vowels for sustained soaring tones, dense syllables for rapid compressed runs).
  - The Little Guy stack MUST actively dictate the lyric logic and mechanics, not just be mentioned in passing.
- Make sure this reaches the 4900–4999 character range! Write extensive, fully realized song structure with multiple verses, dynamic shifts, bridges, breakdowns, and cognitive cycles.

--------------------------------------------------
BOX 3: CAPTION
--------------------------------------------------
TARGET LENGTH: 490–499 CHARACTERS (Including all spaces).
- A compact, publishable, serious explanation of what the song is doing, what generative mechanisms were deployed, and why the resulting structure is strange.
- Take the mechanism completely seriously. Do NOT mention AI prompts or system guidelines.

Now return ONLY the valid JSON object:
{
  "style": "...",
  "lyrics": "...",
  "caption": "..."
}`;

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

  const systemInstruction = `YOU ARE THE PRECISION LENGTH CALIBRATOR OF THE LITTLE GUY MACHINE.
Your task is to rewrite or adjust the provided text for the ${targets.name} box so that its EXACT character count (including spaces and linebreaks) falls strictly between ${targets.min} and ${targets.max} characters.

Current length: ${currentLen} characters.
Target range: ${targets.min} to ${targets.max} characters.
Action needed: ${isShort ? `EXPAND by at least ${diff} characters` : `TRIM by at least ${diff} characters`}.

CRITICAL RULES:
1. Preserve all core musical operators, brackets, themes, cognitive logic, and tone intact.
2. If expanding, add rich operational details, bracketed performance cues, or procedural lyric lines consistent with the current style.
3. If trimming, cut redundant phrases or compress phrasing while keeping the essential structural trajectory.
4. Count characters accurately before outputting.
5. Return ONLY a JSON object: { "repairedText": "..." }`;

  const userPrompt = `CALIBRATE THIS TEXT TO BE BETWEEN ${targets.min} AND ${targets.max} CHARACTERS:

${currentText}

Return JSON with "repairedText".`;

  return { systemInstruction, userPrompt };
}
