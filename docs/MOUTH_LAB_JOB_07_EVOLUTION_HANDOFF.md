# Mouth Lab Job 7 — Evolution + QA Handoff

Status: COMPLETE

Branch:

`mouth-lab/job-07-evolution-qa`

## What shipped

Job 7 closes the planned Mouth Lab roadmap with an evolutionary lifecycle, explicit fitness, anti-monoculture pressure, controlled sibling assays, Petri compatibility, and release-grade regression coverage.

New runtime file:

- `src/mouthLab/evolution.ts`

Updated:

- `src/mouthLab/types.ts`
- `src/mouthLab/quirks.ts`
- `src/mouthLab/promptCompiler.ts`
- `src/mouthLab/index.ts`
- `src/lib/localStorage.ts`
- `src/lib/petriDish.ts`
- `src/components/PetriDishPanel.tsx`
- `src/components/MouthLabPanel.tsx`
- `src/App.tsx`
- `src/types.ts`
- `package.json`
- `.github/workflows/build.yml`

New verification:

- `scripts/verifyMouthEvolution.ts`

## Species × species evolution

Mouth Lab species can now breed directly from their current lived genomes.

Inheritance operates on the actual current state:

- active traits;
- trait pressure;
- quirks;
- linked genes;
- scars;
- semantic anchor;
- intelligibility / stability / mutation controls;
- bounded dynamic-mouth state.

The engine does not jump backward to the original donor languages.

Each child stores lineage with:

- parent genome IDs;
- parent names;
- generation;
- breeding seed;
- inherited traits by parent;
- inherited quirks by parent;
- specimen assists;
- bounded trait/quirk mutations;
- novelty-cooldown survivors.

Same parent phenotypes + same seed + same specimen assists produce the same child identity.

## Specimen-assisted mutation

Captured WHAT THE FUCK WAS THAT? specimens can assist species reproduction.

A specimen can:

- increase inheritance pressure for linked traits / quirks;
- contribute one bounded novel mutation when mutation pressure permits.

It cannot dump its entire captured state into the child.

This keeps specimens useful without turning one lucky accident into a genome-wide takeover.

## Mouth fitness

Starred generated runs can now teach Mouth Lab at the gene level.

Explicit feedback options:

- ★ INHERIT mouth trait
- ✕ SUPPRESS mouth trait
- ★ INHERIT mouth quirk
- ✕ SUPPRESS mouth quirk

A plain whole-run star is intentionally weak evidence.

Explicit gene votes are the strong reproductive signal.

Starred Mouth Lab phenotypes enter durable species breeding stock.

## Anti-monoculture behavior

Preference and recent saturation are separate systems.

If a mouth trait appears repeatedly across recent phenotypes, it receives temporary ecological cooldown pressure during species crossover.

The preference is not erased.

A strongly liked or structurally important trait can still survive cooldown.

This prevents a favorite freak behavior from automatically colonizing every future mouth.

## EVOLUTION UI

The Mouth Lab UI now contains an EVOLUTION work area with:

- species parent A;
- species parent B;
- deterministic breeding seed;
- optional specimen assists;
- BREED DESCENDANT;
- lineage-aware child preview;
- LOAD CHILD;
- SAVE CHILD AS SPECIES;
- positive mouth-fitness signal counts;
- active anti-monoculture cooldown notices.

## Mouth Assay

Mouth Assay breeds deterministic sibling families locally.

Inputs:

- two species parents;
- optional specimen assists;
- family seed;
- sibling count 2–6.

The assay:

- uses zero generation-model calls;
- derives separate sibling seeds;
- selects no hidden winner;
- lets the user inspect, load, or save any sibling.

This is controlled genetic comparison rather than ranking.

## Petri compatibility

Petri Dish challenge snapshots now freeze Mouth Lab state:

- mouth genome;
- compiler mode;
- semantic mode.

Local and AI Petri siblings receive the same frozen mouth environment.

Opening a Petri sibling restores that mouth state with the rest of the challenge.

Mouth Lab is therefore no longer an uncontrolled hidden variable during music-genome comparison.

## Run archive and feedback

Archived runs now preserve explicit Mouth Lab feedback:

- liked mouth traits;
- disliked mouth traits;
- liked mouth quirks;
- disliked mouth quirks.

Markdown run export includes the same information.

The existing feedback modal now exposes Mouth Lab gene voting when the run contains a mouth genome.

## Phenotype signatures

Mouth Lab now computes a phenotype signature from operational state rather than display name or timestamp.

The signature covers:

- assignments;
- pressure;
- active quirks;
- dynamic cast/expression/timeline/transduction state;
- semantic anchor;
- intelligibility;
- stability.

Fitness records deduplicate against this phenotype identity.

## Verification

`verify:mouth-evolution` checks:

1. deterministic species × species breeding;
2. G1 lineage creation;
3. both parents contribute live traits;
4. specimen assist is recorded;
5. shared English semantic anchor survives;
6. phenotype signatures are stable;
7. bounded specimen mutation can enter the child;
8. repeated traits create anti-monoculture cooldown signals;
9. explicit starred-run mouth trait fitness persists;
10. explicit starred-run mouth quirk fitness persists;
11. starred mouth phenotype enters durable species stock;
12. Petri challenge freezes the mouth genome;
13. Petri challenge freezes compiler mode;
14. Petri challenge freezes semantic mode.

Full CI also runs all previous Mouth Lab and existing Little Guy Machine regression suites, typecheck, build, and production-server smoke.

## Mouth Lab roadmap status

Jobs 1–7 are complete:

1. Foundation / donor + trait vault
2. Breeder + conflict matrix
3. Quirk engine + specimens
4. Prompt compiler
5. User interface
6. Dynamic mouths
7. Evolution + QA

The next work should be iteration based on real use rather than another mandatory architecture phase.
