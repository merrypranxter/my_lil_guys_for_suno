# Phase 5 — Petri Dish / Sibling Experiment Bench

## Purpose

Phase 4 added deterministic two-parent music genetics.

Phase 5 turns that genetics system into an **experimental bench**.

A Petri Dish creates several sibling genomes from the same parents, freezes one musical challenge around all of them, exposes the siblings to the same environment, and lets the human compare outcomes without an automatic winner.

The core experimental question is:

> If the environment stays fixed and only the sibling genetics change, what audible behavior changes?

---

## Human-selection rule

The Petri Dish does **not** assign a fitness score.

It does not rank siblings.

It does not choose a winner.

It does not automatically breed the “best” result.

The user explicitly marks survivors with SELECT / KEEP.

Exactly two selected survivors may then be bred.

This keeps selection legible and preserves human agency over what “interesting” means.

---

## Frozen challenge

Creating a dish snapshots:

- active Little Guys / Minds
- active Reality Engines
- active Composition Lab engines
- Reality Chaos
- energy
- normal generation seed
- recent musical fingerprints
- one explicitly frozen musical fingerprint used by every sibling
- liked/preference signals
- current global Music Seed controls
- manually stacked Music Mechanism chips

Current Recipe and Genome macros are intentionally excluded from the challenge environment.

Why:

If Parent A / Parent B or another genome stayed active outside the sibling genome, the experiment would no longer isolate sibling genetics cleanly.

Manual mechanism chips are retained because they act as explicit external environmental pressure.

The result is:

```
FROZEN ENVIRONMENT
+ sibling genome 1
+ sibling genome 2
+ sibling genome 3
...
```

Every sibling sees the same outer conditions.

---

## Sibling cohort genetics

A family uses:

```
Parent A
Parent B
Family Seed
Sibling Count
```

Each sibling gets a deterministic child seed:

```
<family-seed>:sibling:01
<family-seed>:sibling:02
<family-seed>:sibling:03
...
```

The same parents + same family seed + same sibling count reproduce the same cohort genetics.

Sibling genomes still obey Phase 4 rules:

- bounded genome size
- real contribution from both parents
- one invariant
- one crossover relationship law
- zero or one bounded mutation
- inherited control traits
- lineage receipt

---

## Genetic controls versus environment controls

The Petri Dish treats a sibling’s Music Controls as **genetic traits**.

The dish’s frozen Music Controls are **environment pressure**.

For each sibling, effective controls are a deterministic blend:

```
55% frozen environment
45% sibling genotype
```

This means the environment stays recognizably the same while genetic control differences remain audible.

The blend is applied independently to:

- Stemminess
- Kinetic Density
- Social Infection
- Coupling
- Interruption
- Anchor Strength
- Cast Size

---

## Two exposure modes

### FREE LOCAL PREVIEW

Runs the existing deterministic/procedural synthesizer in the browser.

Properties:

- zero model calls
- fast
- useful for checking whether sibling genetics are structurally different
- same frozen challenge
- safe to rerun without spending API quota

This is the default cheap experimental pass.

### RUN AI COMPARISON

Runs one normal generation request per sibling, sequentially.

The UI states the call count before execution.

Sequential execution is deliberate:

- reduces burst pressure
- preserves completed results if later siblings fail
- makes progress legible
- allows STOP during the cohort

Each result is stored back inside the dish.

---

## Result comparison

Each sibling card shows:

- sibling number
- genome name
- generation
- gene count
- mutation presence
- invariant
- crossover law
- mechanism IDs
- generation mode
- model used
- musical fingerprint
- STYLE
- CAPTION
- collapsible LYRICS / CONTROL

No single “score” is shown.

Comparison is qualitative and structural.

---

## OPEN / STACK / BREED

### OPEN IN MAIN LAB

Restores the frozen challenge into the main application:

- Minds
- Reality Engines
- Composition Lab
- Reality Chaos
- seed
- energy
- frozen manual music mechanisms
- selected sibling genome
- blended sibling/environment controls

If the dish already contains a result, its three boxes are shown as a preview.

The result is not silently added to the main archive until the user deliberately generates/archives from the main lab.

### STACK GENOME

Adds the sibling genome to the current Music Seed Lab without replacing the current experiment.

The genome is also preserved in the breeding library.

### BREED EXACTLY TWO SURVIVORS

The user must explicitly select exactly two sibling cards.

The survivor child uses a deterministic seed derived from:

- dish family seed
- the two selected genome IDs

The descendant is saved to the breeding library and can be stacked into the main lab.

---

## Persistence

Petri Dishes are stored locally.

A saved dish contains:

- complete parent snapshots
- frozen challenge
- sibling genomes
- selection state
- local/AI result payloads

Dishes are self-contained enough to survive deletion of a genome from the global breeding library.

Storage is bounded:

- newest 24 dishes normally
- emergency trim to 8 if browser storage becomes constrained

---

## No hidden confounds

The implementation intentionally avoids several confounds:

1. Existing recipe/genome macros are removed from the frozen environment.
2. Recent fingerprints and liked signals are snapshotted once when the dish is created.
3. The normal generation seed is frozen across siblings.
4. One musical fingerprint is selected once when the dish is created and is frozen across every sibling: genre family, harmony, melody, rhythm, timbre, vocal architecture, performance attitude, and production ancestry.
5. Manual mechanism pressure is frozen.
6. Parent identity and family seed deterministically reproduce sibling genetics.
7. Human survivor selection never changes automatically.

AI generation itself may still be stochastic because model sampling is not a deterministic physics engine. The request nevertheless receives the exact same frozen fingerprint and frozen outer challenge for each sibling, and returned fingerprint metadata is pinned to that experimental fingerprint so comparison labels do not drift.

That residual sampling stochasticity is visible rather than falsely described as controlled.

For the cheapest structural comparison, use FREE LOCAL PREVIEW first.

---

## Validation

`npm run verify:dish` checks:

- same parents + family seed reproduce the same sibling cohort
- siblings inside one cohort are genetically distinct
- built-in recipe/genome macros are excluded from frozen environment
- manual mechanism chips survive freezing
- each sibling test stack contains exactly one sibling genome
- blended controls remain bounded
- user selection is explicit and does not select other siblings
- persisted dishes normalize successfully

CI runs Petri Dish verification before production build.

---

## Next useful direction

The next strong expansion is **Assay Mode / controlled variable experiments**.

Instead of only varying genome, the user could freeze genetics and deliberately vary exactly one environmental variable across wells:

- same genome, different coupling values
- same genome, different Composition Lab rhythm physics
- same genome, different cast size
- same genome, different Reality Engine
- same genome, same everything except Stemminess

That would allow A/B/C experiments where one dimension changes at a time.

Petri Dish answers:

> Which child behaves differently?

Assay Mode would answer:

> Which environmental variable caused the difference?
