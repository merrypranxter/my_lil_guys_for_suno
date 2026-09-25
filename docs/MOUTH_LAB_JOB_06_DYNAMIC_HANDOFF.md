# Mouth Lab Job 6 — Dynamic Mouths Handoff

Status: IMPLEMENTED ON BRANCH

Branch:

`mouth-lab/job-06-dynamic-mouths`

## What shipped

Job 6 turns a static bred mouth into a vocal system that can change through cast roles, time, conditions, and musical feedback.

New runtime file:

- `src/mouthLab/dynamics.ts`

Updated:

- `src/mouthLab/types.ts`
- `src/mouthLab/quirks.ts`
- `src/mouthLab/promptCompiler.ts`
- `src/mouthLab/index.ts`
- `src/components/MouthLabPanel.tsx`
- `package.json`
- `.github/workflows/build.yml`

New verification:

- `scripts/verifyMouthDynamics.ts`

## Cast-specific mouths

A Mouth Lab genome can now carry independent static mouth snapshots for voice roles:

- lead
- narrator
- crowd
- small group
- freak voice
- response voice
- whisper voice
- choir

A cast mouth snapshots:

- donor ancestry;
- jurisdiction assignments;
- quirk state;
- intelligibility;
- stability;
- mutation.

The UI can assign either:

- the current active mouth;
- any saved species from the Specimen Archive.

Unassigned voice roles continue using the active base genome.

This means:

> lead can be an English/Spanish pathological-R mouth while the crowd is an English/Xhosa click-percussion mouth.

The compiler explicitly tells generation not to smear those systems into one generic accent.

## Gene expression states

Job 6 adds explicit expression rules:

- DOMINANT
- RECESSIVE
- LATENT
- TRIGGERED

Each rule has:

- target trait or quirk;
- strength 0–100;
- optional cast role;
- optional trigger.

Compiler behavior:

### DOMINANT

Express whenever eligible and override weaker competing expression.

### RECESSIVE

Stay weak unless dominant competition disappears or is suppressed.

### LATENT

Remain silent until a timeline event or explicit trigger activates the target.

### TRIGGERED

Remain off until the configured condition becomes true.

This is the new conditional-phonetics layer.

## Mutation curves

Traits and quirks can now mutate continuously across a song.

Curve shapes:

- linear
- step
- exponential
- oscillating

Each curve stores:

- trait/quirk target;
- start song position;
- end song position;
- start expression strength;
- end expression strength;
- optional cast role.

Example:

> global R trill starts at strength 20 at 15% of the song and reaches strength 100 by 80% using an exponential curve.

The compiler tells generation to treat intermediate values as real graded expression rather than random toggles.

## Mutation timeline

Discrete mutation events can be scheduled by:

- song position;
- section label;
- audible condition;
- or both position and condition.

Actions:

- activateTrait
- suppressTrait
- escalateTrait
- activateQuirk
- suppressQuirk
- infectCast
- swapCastMouth

Events store:

- action;
- target;
- source cast role;
- destination cast role;
- amount;
- trigger;
- song position.

State changes persist until another event explicitly changes them.

## Voice-to-voice infection

`infectCast` lets one role's mouth behavior spread into another.

Example:

> at 62%, after the crowd repeats the anchor three times, infect the CROWD with 88% of the LEAD mouth's active behavior.

This is separate from vague “backing vocals copy the lead.”

It is an explicit dynamic state transition.

## Mouth-role swapping

`swapCastMouth` allows two cast roles to exchange mouth systems at a scheduled or triggered moment.

This can produce:

> narrator inherits the freak voice mouth while the freak voice suddenly receives the narrator's clean anchor mouth.

## Language → music transduction

Job 6 ships reusable causal mapping presets including:

- clicks → offbeat percussion;
- vowel length → note duration;
- lexical tone → melody contour;
- mora count → rhythmic occupancy;
- glottal event → arrangement dropout.

These mappings do not merely describe correspondence.

The compiler requires the musical target to respond causally to the mouth event.

## Music → language reverse transduction

Reverse mappings also ship:

- high melodic register → rhotic trill;
- rhythmic density → syllable/consonant compression;
- loudness → phonation shift.

The mouth can therefore react to the music instead of only driving it.

## UI

A new Mouth Lab work area appears:

### DYNAMIC MOUTHS

It provides four editors:

1. CAST-SPECIFIC MOUTHS
2. GENE EXPRESSION / CONDITIONAL PHONETICS
3. MUTATION CURVES + MUTATION TIMELINE
4. LANGUAGE ↔ MUSIC TRANSDUCTION

The timeline includes a simple visual 0–100% song-position rail.

Clicking a mutation event on the rail removes it.

## Compiler integration

The existing Job 4 compiler now emits dynamic control language.

Bracketed output can include:

- `[CAST GENETICS: ...]`
- `[CONDITIONAL PHONETICS: ...]`
- `[MUTATION CURVE: ...]`
- `[MUTATION TIMELINE: ...]`
- `[TRANSDUCTION: ...]`

STYLE remains compact.

It only announces:

- cast mouth identities;
- that explicit transduction is active.

The detailed causal rules stay in LYRICS / CONTROL.

## Persistence and generation

Dynamic state is embedded inside the Mouth Lab genome.

Therefore the existing Job 5 persistence/request plumbing automatically carries:

- cast profiles;
- expression rules;
- mutation curves;
- timeline events;
- transductions.

This survives:

- active-mouth browser persistence;
- saved whole stacks;
- run archive;
- `/api/generate`;
- prompt compilation.

Incoming raw dynamic state is normalized before generation.

## Verification

`verify:mouth-dynamics` checks:

1. separate lead/crowd mouth snapshots;
2. cast profiles retain different genetics;
3. dominant expression;
4. triggered expression;
5. latent expression;
6. explicit mutation curves;
7. event-triggered cast infection;
8. trait suppression event;
9. language → music transduction;
10. music → language reverse transduction;
11. dynamic genome re-identification;
12. request normalization retains dynamics;
13. compiler emits all dynamic blocks;
14. master prompt receives dynamics;
15. active-mouth localStorage round-trip retains dynamics.

## Next

Job 7:

**EVOLUTION + QA**

Target:

- species × species breeding;
- specimen-assisted breeding;
- Mouth Lab fitness feedback from starred runs;
- phenotype-level anti-monoculture pressure;
- Petri/Assay compatibility;
- regression and mobile QA;
- final Mouth Lab documentation and release handoff.
