# Mouth Lab Job 4 — Prompt Compiler Handoff

Status: IMPLEMENTED ON BRANCH

Branch:

`mouth-lab/job-04-prompt-compiler`

## What shipped

Job 4 turns Mouth Lab genomes into generation-ready vocal control language.

New runtime file:

- `src/mouthLab/promptCompiler.ts`

Updated:

- `src/mouthLab/types.ts`
- `src/mouthLab/index.ts`
- `src/types.ts`
- `src/lib/buildGenerationPrompt.ts`
- `src/lib/generationJurisdictions.ts`
- `src/lib/proceduralGenerator.ts`
- `server.ts`
- `package.json`
- `.github/workflows/build.yml`

New verification:

- `scripts/verifyMouthCompiler.ts`

## Compiler modes

`compileMouthPrompt()` supports:

- `compact`
- `bracketed`
- `descriptive`

All three use the same validated genome.

The mode changes presentation, not the underlying trait set.

## English Meaning / Alien Mouth

Semantic modes:

- `inherit`
- `englishMeaningAlienMouth`

When `englishMeaningAlienMouth` is active:

- semantic propositions stay English;
- lexical targets stay intelligible English;
- Mouth Lab donors may own pronunciation, consonants, vowels, phonotactics, timing, tone, phonation, morphology pressure, and other assigned vocal mechanics;
- the compiler explicitly forbids silently translating into donor languages;
- the compiler explicitly forbids fabricating fluent-looking donor-language text;
- morphology transfer is framed as structural pressure on English material, not authentic donor-language grammar.

## Trait-pressure-aware enforcement

Pressure levels now affect compiler language:

### LOW

Subtle bounded influence.

### MEDIUM

Recurrent and identifiable.

### HIGH

Clearly audible across multiple sections.

### OBSESSIVE

A global law.

OBSESSIVE traits receive an additional enforcement directive telling generation not to reduce them to occasional flavor.

Quirks with both frequency and consistency at or above 90 receive an additional:

`PATHOLOGICAL CONSISTENCY`

directive.

This is the compiler behavior needed for the canonical:

> roll every eligible R with absurd commitment

case.

## Quirk compilation

Every active quirk compiles:

- target;
- transformation;
- frequency;
- consistency;
- exaggeration;
- takeover mode;
- trigger when applicable.

Supported takeover rendering includes:

- constant;
- instant;
- gradual;
- stepwise;
- event-triggered;
- oscillating;
- one-way.

Example:

> HIGH NOTE ACTIVATES R TRILL

can compile as a conditional vocal law rather than a global accent.

## Conflict compilation

The compiler projects the genome through the Job 2 phenotype layer.

High-severity interactions are rendered as explicit negotiation laws.

Example:

### extreme consonant clustering × open-syllable pressure

The compiler does not average the traits.

It emits the resolution rule:

> accumulate consonants until open-syllable pressure forces repair; insert/expose a vowel; clustering may then begin again.

## Linked genes

Locked specimen gene bundles compile as keep-together requirements.

This protects cases where the observed magic came from a combination of traits and quirks rather than one isolated gene.

## Mutation scars

Residual mutation scars may enter the prompt as bounded low-strength historical behavior.

A knockout therefore may remove the full gene while preserving an explicitly configured remnant such as:

> stressed rhotics retain a faint single-tap scar.

## Sanitization boundary

`normalizeMouthGenomeForGeneration()` validates incoming request genomes before prompt use.

It removes or rejects:

- unknown donor IDs;
- unknown trait IDs;
- traits assigned to invalid axes;
- traits assigned to a donor that does not own them;
- unknown quirk IDs;
- invalid takeover modes;
- unbounded control values.

Free-form names and notes are not used as trait instructions.

Generation receives known registry mechanisms rather than arbitrary user-supplied fake trait IDs.

## GenerationRequest integration

Optional request fields now exist:

- `mouthGenome`
- `mouthPromptMode`
- `mouthSemanticMode`

They are optional.

Old requests with none of those fields remain valid.

Server generation:

1. normalizes the incoming Mouth Lab genome;
2. sanitizes prompt/semantic modes;
3. passes the normalized genome to the master prompt builder;
4. passes the same normalized genome to the procedural fallback.

## Master prompt integration

When Mouth Lab is active, the generation prompt includes:

`MOUTH LAB / VOCAL GENOME`

The global system contract now states:

- Mouth Lab is vocal genetics, not an accent preset;
- selected traits own only their assigned axes;
- quirks are narrow operational laws;
- donor mechanisms do not imply ethnicity, personality, intelligence, class, or comic character;
- Mouth Lab has precedence over conflicting generic/single-profile pronunciation guidance on axes it explicitly owns;
- seed semantics still outrank vocal deformation.

Composition Lab language behavior may fill only unclaimed mouth axes.

## STYLE integration

The compiler supplies a compact Mouth Lab STYLE priority block.

It tells generation which phenotype traits/quirks should remain most audible without spending the entire STYLE character budget on linguistic explanation.

## LYRICS / CONTROL integration

The compiler supplies bracketed vocal-control directives containing the actual operational rules.

This is where:

- obsessive R trills;
- click placement;
- glottal catches;
- timing rules;
- morphology pressure;
- takeover curves;
- interaction laws;
- scars

are reinforced.

## Procedural fallback

If AI generation is unavailable, Mouth Lab does not disappear.

The local procedural generator now receives:

- genome;
- prompt mode;
- semantic mode.

It adds a compact Mouth Lab clause to STYLE and the detailed compiled Mouth Lab control block to LYRICS / CONTROL while preserving the strict Suno character targets.

## Jurisdiction matrix

The central generation jurisdiction map now includes Mouth Lab as its own layer.

Mouth Lab owns only explicitly assigned vocal-genetics axes.

It does not own:

- subject;
- scenario;
- cultural identity;
- generic musical ancestry.

Collision rule:

> on an explicitly claimed mouth axis, Mouth Lab beats conflicting generic/single-profile pronunciation guidance.

But:

> semantic seed ownership always beats Mouth Lab deformation.

## Verification

`verify:mouth-compiler` checks:

1. bracketed export;
2. compact export;
3. descriptive export;
4. English Meaning / Alien Mouth policy;
5. obsessive trait reinforcement;
6. pathological quirk consistency;
7. STYLE-specific Mouth Lab directives;
8. LYRICS/CONTROL-specific directives;
9. unknown donor/trait/quirk filtering;
10. master prompt integration;
11. jurisdiction/preference system rules;
12. backward-compatible legacy requests;
13. procedural fallback integration;
14. strict procedural character counts.

## Not in Job 4

Still deferred:

- user-facing Mouth Lab controls;
- parent picker UI;
- Quirk Monster UI;
- WHAT THE FUCK WAS THAT? modal;
- Specimen Archive UI;
- cast-specific mouths;
- full mutation timelines;
- language ↔ music transduction;
- evolutionary species breeding.

## Next

Job 5:

**MOUTH LAB UI**

Target:

- 2–6 parent multi-select;
- QUICK FREAK;
- BREED LANGUAGES;
- DESIGN A MOUTH;
- QUIRK MONSTER;
- WHAT THE FUCK WAS THAT?;
- SPECIMEN ARCHIVE;
- breeding-objective buttons;
- genome/phenotype inspection;
- save/load through the Job 3 archive layer.
