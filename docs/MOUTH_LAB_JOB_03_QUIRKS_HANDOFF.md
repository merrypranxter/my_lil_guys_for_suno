# Mouth Lab Job 3 — Quirk Engine + Specimens Handoff

Status: IMPLEMENTED ON BRANCH

Branch:

`mouth-lab/job-03-quirks-specimens`

## What shipped

Job 3 adds the system for tiny vocal mutations that can become global laws, plus a specimen archive model for capturing weird accidental Suno behavior.

New runtime files:

- `src/mouthLab/quirks.ts`
- `src/mouthLab/specimens.ts`
- `src/mouthLab/surgery.ts`
- `src/mouthLab/persistence.ts`

Updated:

- `src/mouthLab/types.ts`
- `src/mouthLab/breeder.ts`
- `src/mouthLab/phenotype.ts`
- `src/mouthLab/index.ts`
- `package.json`
- `.github/workflows/build.yml`

New verification:

- `scripts/verifyMouthQuirks.ts`

## Quirk model

A quirk is smaller than a language donor.

It can target one narrow behavior such as:

- every eligible R becomes an exaggerated trill;
- K/T-like stops gain ejective attack;
- phrase endings always rise;
- every third syllable becomes creaky;
- long vowels become absurdly long;
- clusters force vowel repair;
- clicks occur only on offbeats;
- high pitch activates R trill;
- repeated words mutate farther each time.

Each quirk stores:

- target;
- transformation;
- axis;
- origin;
- source trait ancestry;
- tags;
- frequency 0–100;
- consistency 0–100;
- exaggeration 0–100;
- takeover curve;
- optional trigger;
- intelligibility risk.

## Takeover curves

Supported modes:

- constant
- instant
- gradual
- stepwise
- eventTriggered
- oscillating
- oneWay

A quirk can therefore be:

> active from line one

or:

> hidden until the singer crosses a pitch threshold

or:

> spreading in steps through the song.

## Seed quirk library

Job 3 ships a first reusable quirk set including:

- GLOBAL RHOTIC TRILL TAKEOVER
- RHOTIC TAP / TRILL ALTERNATION
- UVULAR R TAKEOVER
- K / T EJECTIVE POP
- STRESSED-SYLLABLE GLOTTAL CATCH
- FINAL CONSONANT CLIPPING
- CLUSTER → VOWEL REPAIR
- CONSONANT CLUSTER COMPRESSION
- PRE-NASAL VOWEL NASALIZATION
- NASALITY ESCAPES CONTAINMENT
- EVERY THIRD SYLLABLE GOES CREAKY
- LONG VOWELS GET RIDICULOUSLY LONG
- NO SCHWA COLLAPSE
- EVERY PHRASE ENDS UPWARD
- CLICKS ONLY ON OFFBEATS
- HIGH NOTE ACTIVATES R TRILL
- REPEATED WORDS MUTATE FARTHER
- EVERY WORD STARTS WITH BREATH
- STOPS GROW NASAL LEAD-INS
- L BECOMES LATERAL NOISE

## Canonical R freak

The canonical specimen remains:

> The dude rolled EVERY SINGLE RRRRRR with SUCH ENTHUSIASM every fucking time.

The local observation parser recognizes that description and proposes:

`mouth-quirk-global-r-trill`

The captured specimen records:

- observation;
- why it was liked;
- recurrence;
- category;
- quirk ancestry;
- source trait ancestry;
- tags;
- optional source run/genome.

EVERY SINGLE / every time language maps to `everyTime` recurrence.

## WHAT THE FUCK WAS THAT? model

`captureMouthSpecimen()` is the runtime foundation for the future UI button.

It accepts a human observation and can infer known quirk candidates locally.

It does not pretend to do acoustic analysis.

That remains future work.

## Linked genes

A specimen can become a linked gene bundle.

A linked bundle stores:

- trait IDs;
- quirk IDs;
- whether the set should remain locked together;
- why the combination mattered.

This supports the case where the magic was not one trait but a particular bundle of behaviors.

## Applying a specimen

`applyMouthSpecimen()`:

1. instantiates the specimen quirks;
2. scales recurrence into reusable pressure;
3. applies the quirks to a genome;
4. creates a linked-gene bundle;
5. reports source traits that are ancestry-only because the current genome does not actually contain them;
6. leaves a specimen-application mutation scar.

The system therefore distinguishes:

> inherited active gene

from:

> historical ancestry / observed association.

## Gene knockout

`knockoutMouthGenes()` supports explicit A/B experiments.

You can remove:

- one or more traits;
- one or more quirks;
- an entire linked bundle when `removeLinkedGenes` is enabled.

The removed behavior can leave a mutation scar.

Example:

> Full R trill is gone, but stressed rhotics retain a faint single-tap scar.

This is deliberate: reset does not have to mean pristine.

## Mutation scars

Scars record:

- source operation;
- removed traits;
- removed quirks;
- residual rule;
- strength;
- creation time.

Scars can also be explicitly cleared.

## Genotype → phenotype changes

Phenotype projection now includes active quirks.

Quirk audibility is estimated from:

- frequency;
- consistency;
- exaggeration;
- intelligibility protection;
- quirk intelligibility risk.

Quirks can appear in audible priority ahead of ordinary inherited traits when they are sufficiently dominant.

## Persistence

Job 3 adds a testable storage adapter instead of directly hard-coding browser APIs.

Archive contents:

- specimens;
- saved species/genomes;
- linked gene bundles.

Helpers support:

- parse;
- serialize;
- load;
- save;
- clear;
- upsert/remove specimens;
- upsert/remove species;
- upsert bundles.

The future UI can pass `window.localStorage` into this layer without making the domain model browser-dependent.

## Verification cases

`verify:mouth-quirks` checks:

1. quirk IDs are unique;
2. source traits exist;
3. quirk controls stay in 0–100 bounds;
4. same quirk settings + seed => same quirk instance ID;
5. applying a quirk changes genome identity;
6. phenotype exposes active quirks;
7. canonical RRRRRR observation is recognized;
8. EVERY SINGLE / every time infers everyTime recurrence;
9. captured specimen keeps source-trait ancestry;
10. specimen application creates a linked bundle and mutation scar;
11. linked-gene knockout removes both source trait and linked quirk;
12. mutation scar survives and can be cleared;
13. bundles can be explicitly unlinked;
14. event-triggered quirks preserve their trigger;
15. archive storage round-trips specimens/species/bundles;
16. malformed persisted JSON safely resets to an empty archive.

## Not in Job 3

Still deferred:

- Mouth Lab user interface;
- Suno prompt compiler;
- GenerationRequest integration;
- audio analysis;
- cast-specific mouths;
- full song mutation timelines;
- language ↔ music transduction;
- evolutionary species breeding.

## Next

Job 4:

**PROMPT COMPILER**

Target:

- compact Mouth Lab export;
- bracketed/system export;
- descriptive export;
- trait-pressure-aware repetition;
- quirk-aware control language;
- English Meaning / Alien Mouth;
- GenerationRequest integration without breaking existing requests.
