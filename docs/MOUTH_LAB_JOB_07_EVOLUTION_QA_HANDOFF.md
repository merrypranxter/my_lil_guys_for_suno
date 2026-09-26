# Mouth Lab Job 7 — Evolution + QA Handoff

Status: IMPLEMENTED ON BRANCH

Branch:

`mouth-lab/job-07-evolution-qa`

## What shipped

Job 7 completes the planned Mouth Lab roadmap.

New runtime file:

- `src/mouthLab/evolution.ts`

Updated:

- `src/mouthLab/types.ts`
- `src/mouthLab/index.ts`
- `src/mouthLab/quirks.ts`
- `src/mouthLab/promptCompiler.ts`
- `src/types.ts`
- `src/lib/localStorage.ts`
- `src/lib/petriDish.ts`
- `src/components/PetriDishPanel.tsx`
- `src/components/MouthLabPanel.tsx`
- `src/App.tsx`
- `package.json`
- `.github/workflows/build.yml`

New verification:

- `scripts/verifyMouthEvolution.ts`

## Species × species breeding

Mouth Lab can now breed whole lived Mouth genomes instead of returning to raw language donors.

A species parent contributes from its current state:

- inherited jurisdiction assignments;
- current trait pressures;
- current quirks;
- selected mutation scars;
- linked-gene bundles that remain relevant;
- semantic anchor;
- bounded dynamic-mouth behavior.

The child therefore descends from what the parent became, not merely from the language profiles that originally created it.

Species reproduction is deterministic:

> same two species + same breeding seed + same specimen assists = same offspring phenotype.

Generation is tracked explicitly through `MouthSpeciesLineage`.

## Lineage

An evolved child records:

- parent genome IDs;
- parent names;
- generation;
- breeding seed;
- trait inheritance by parent;
- quirk inheritance by parent;
- specimen assists;
- bounded trait mutations;
- bounded quirk mutations;
- genes that survived recent-use novelty penalties.

Lineage is part of genome identity and survives request normalization / persistence.

It is provenance, not lyric subject matter.

## Balanced crossover

The evolution engine aims near the parental average trait count rather than accumulating an ever-growing union.

Both parents are given a viable contribution opportunity.

The child is bounded to the existing Mouth Lab donor/trait registries and retains the six-donor ceiling.

Fitness can bias crossover, but does not bypass validity or registry constraints.

## Specimen-assisted evolution

Captured WHAT THE FUCK WAS THAT? specimens can enter reproduction.

They do two things:

1. linked traits/quirks receive crossover pressure;
2. one bounded specimen mutation may enter the child when mutation pressure allows it.

The specimen does not dump every captured property into every descendant.

A specimen mutation is recorded in lineage.

## Mouth phenotype signatures

`mouthGenomePhenotypeSignature()` creates a stable phenotype-level identity for reproductive feedback.

It focuses on:

- assignments;
- active quirks;
- dynamic rules;
- semantic anchor;
- intelligibility / stability.

Runtime IDs and timestamps do not create fake genetic uniqueness.

## Mouth fitness

Mouth Lab now has its own durable fitness records.

A starred run containing a Mouth genome can promote that phenotype into durable Mouth species breeding stock.

The star itself is deliberately weak evidence.

The feedback modal now exposes explicit:

- ★ INHERIT trait
- ✕ SUPPRESS trait
- ★ INHERIT quirk
- ✕ SUPPRESS quirk

Explicit votes are much stronger than a plain whole-run star.

This prevents:

> I liked one song containing a trill, therefore every future organism becomes RRRRRR forever.

## Fitness without monoculture

Durable preference and temporary ecological pressure are separate.

Mouth Lab records what the user liked.

It also measures recent trait saturation.

A repeatedly used gene can receive a temporary cooldown signal without deleting its positive fitness history.

Example:

> MOUTH COOLDOWN — ALVEOLAR TRILL appeared in 100% of recent species. Prefer a different mechanism unless explicitly locked or specifically liked.

These signals join the existing novelty context during main generation.

Species crossover also directly subtracts recent-use pressure from overexposed genes.

A very strong / explicitly useful gene can still survive the cooldown; lineage records that fact.

## EVOLUTION UI

Mouth Lab now has a sixth work area:

### EVOLUTION

It provides:

- active + saved species parent selectors;
- deterministic species breeding seed;
- optional specimen assists;
- BREED DESCENDANT;
- visible generation;
- child phenotype;
- specimen-mutation count;
- LOAD CHILD;
- SAVE CHILD AS SPECIES;
- current mouth fitness signal counts;
- current anti-monoculture cooldown warnings.

Children remain temporary until explicitly saved as species.

## Mouth Assay

The EVOLUTION work area also includes:

### MOUTH ASSAY — SIBLING FAMILY

It freezes:

- two species parents;
- selected specimen assists;
- fitness environment;
- recent-species novelty environment;
- a family seed.

It then produces 2–6 deterministic sibling genomes using sibling-specific seeds.

This costs zero model calls.

The UI does not rank or choose a winner.

Each sibling can be loaded or explicitly saved.

## Petri Dish compatibility

Existing music Petri Dish experiments now freeze Mouth Lab as part of the challenge.

A dish stores:

- Mouth genome;
- Mouth compiler mode;
- Mouth semantic mode.

Both free local sibling previews and AI sibling comparisons receive the same frozen Mouth state.

Opening a Petri sibling restores that frozen Mouth state into the main lab.

This keeps the music genome as the changing Petri variable rather than accidentally changing vocal genetics between siblings.

## Star feedback integration

The main TEACH THE LITTLE BASTARD modal now handles both:

- music-mechanism fitness;
- Mouth Lab trait/quirk fitness.

A starred Mouth phenotype is added to the Mouth species archive so it can become a future species parent.

Explicit mouth-gene votes are stored with the run and included in Markdown exports.

## Run archive / export

Archived runs now preserve:

- liked Mouth trait IDs;
- disliked Mouth trait IDs;
- liked Mouth quirk IDs;
- disliked Mouth quirk IDs.

Markdown export prints those reproductive votes alongside music-mechanism votes.

## Mobile QA

The expanded feedback modal now has a viewport-bounded scroll container.

This prevents the new music + Mouth fitness controls from becoming inaccessible on small screens.

Mouth Lab panels continue using responsive one-column fallbacks before expanding to multi-column layouts.

## Determinism QA

Dynamic crossover no longer uses random comparator sorting.

It uses seeded pre-ranked shuffling before deterministic sorting / slicing.

That avoids sort-engine comparator-order dependence while preserving seeded variety.

## Verification

`verify:mouth-evolution` checks:

1. deterministic species × species reproduction;
2. generation tracking;
3. meaningful inheritance from both parents;
4. semantic-anchor preservation;
5. specimen-assist lineage;
6. bounded specimen mutation can enter a descendant;
7. phenotype signatures are stable;
8. recent mouth overuse creates cooldown pressure;
9. explicit starred-run trait fitness persists;
10. explicit starred-run quirk fitness persists;
11. starred Mouth phenotype enters durable species stock;
12. Petri challenge freezes Mouth genome;
13. Petri challenge freezes compiler mode;
14. Petri challenge freezes semantic mode.

The repository CI still runs every previous regression suite before build and production-server smoke.

## Mouth Lab roadmap status

Jobs 1–7 are complete:

1. donor + trait vault;
2. breeder + conflict matrix;
3. quirks + specimens;
4. Suno prompt compiler;
5. user interface;
6. dynamic mouths;
7. evolution + fitness + Petri / Assay + QA.

Future Mouth Lab work is optional expansion rather than required architecture completion.

Possible future experiments include:

- audio/stem-assisted specimen extraction;
- richer multi-generation lineage visualization;
- crossbreeding Mouth genomes with Music genome fitness environments;
- learned specimen clustering;
- downloadable/importable species packs.
