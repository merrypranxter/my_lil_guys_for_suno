# Job 16B — Locks / Randomization / Mutation Handoff

Status: COMPLETE

## What shipped

Job 16B upgrades the playable Composition Lab with lock-aware exploration controls.

New runtime utility:

- `src/lib/compositionRandomization.ts`

Updated:

- `src/components/CompositionLabPanel.tsx`
- `src/lib/localStorage.ts`

---

# Lock system

Any selected Composition Lab engine can now be:

- LOCKED
- UNLOCKED

Locks are shown:

- directly on selected engine cards
- inside the Active Build tray
- inside the engine detail modal
- as a total LOCKED count in the Composition Lab header

Lock state is persisted locally under:

`lgm_locked_composition_engines_v1`

Locks are automatically pruned when an engine is no longer selected.

## Lock semantics

A lock protects an engine from:

- Randomize Dimension
- Randomize Cabinet
- Randomize All
- Mutate Current Build
- automatic replacement when a full dimension receives a new selection

Manual removal is still allowed.

That means LOCK means:

> keep this through machine changes

rather than:

> make this impossible for the user to remove.

---

# Full-dimension replacement

Job 16A rejected selection when a dimension was full.

Job 16B upgrades this.

When the user selects a new engine in a full dimension:

1. find the oldest selected engine in that dimension that is NOT locked;
2. remove it;
3. add the new selection.

If every selected engine in that dimension is locked:

- replacement is blocked;
- the UI tells the user to unlock one first.

This uses the canonical `COMPOSITION_DIMENSION_LIMITS`.

---

# RANDOMIZE DIMENSION

Button:

`RANDOMIZE DIMENSION`

Behavior:

- operates only on the currently viewed dimension;
- preserves every locked engine in that dimension;
- preserves an already occupied dimension's current selection count;
- when the dimension is empty, uses a useful default count based on its capacity:
  - max 1 → 1
  - max 2 → 2
  - max 3 → 2
  - Sound Source max 8 → 4
- respects canonical cardinality after randomization.

This makes it possible to browse one cabinet and repeatedly roll only one mechanism family.

---

# RANDOMIZE CABINET

Button:

`RANDOMIZE CABINET`

Behavior when the active cabinet already has selections:

- randomizes only its occupied dimensions;
- preserves the number of active engines in each occupied dimension;
- preserves all locks.

Behavior when the active cabinet is empty:

- seeds three random dimensions from that cabinet;
- fills each using its dimension-aware default count.

This avoids turning one cabinet roll into every possible dimension simultaneously.

---

# RANDOMIZE ALL

Button:

`RANDOMIZE ALL`

Behavior when a build already exists:

- randomizes the dimensions currently occupied by the build;
- preserves each occupied dimension's selection count;
- leaves every locked engine untouched;
- does NOT suddenly activate all 23 dimensions.

Behavior when the build is empty:

- seeds a balanced starting build;
- selects two random dimensions from each of:
  - Voice
  - Signal
  - Sonic
  - Structure / Control

This creates a useful cross-cabinet surprise build rather than a 23-dimension prompt avalanche.

---

# MUTATE CURRENT BUILD

Button:

`MUTATE CURRENT BUILD`

This is intentionally different from full randomization.

Behavior:

- preserves every locked engine;
- preserves the dimensions already in use;
- changes only a small slice of the unlocked active engines;
- mutation count is approximately 25% of mutable selections;
- minimum 1;
- maximum 3;
- replacements come from the SAME dimension.

This keeps the overall build identity while changing a few genes.

If no build exists:

- MUTATE seeds the same balanced cross-cabinet build used by Randomize All.

---

# Randomization utility

`src/lib/compositionRandomization.ts` contains pure selection helpers:

- `sanitizeCompositionLocks`
- `randomizeCompositionDimension`
- `randomizeCompositionDomain`
- `randomizeAllComposition`
- `mutateCompositionSelection`

The helpers:

- read canonical engine definitions;
- read canonical dimension limits;
- preserve locked IDs;
- normalize output through `normalizeCompositionEngineIds`;
- never intentionally exceed dimension limits.

---

# UI changes

The Composition Lab now includes a control row:

- RANDOMIZE DIMENSION
- RANDOMIZE CABINET
- RANDOMIZE ALL
- MUTATE CURRENT BUILD

Selected engine cards have a lock/unlock control.

Active Build chips now separate:

- lock/unlock
- engine label
- remove

This prevents accidental removal when the user only meant to protect an engine.

The detail modal also has a dedicated lock button.

---

# Example workflow

1. RANDOMIZE ALL
2. find something delightfully stupid:
   - 31-EDO
   - Hellish answering-machine damage
   - vocals as master clock
   - reverse chronology
3. lock the parts that worked
4. hit MUTATE CURRENT BUILD repeatedly
5. lock another interesting mutation
6. randomize one specific dimension when desired
7. Generate

The machine can now be explored by evolutionary hill-climbing instead of rebuilding a stack manually every time.

---

# Static verification

Verified:

- lock controls exist in cards, Active Build, and detail modal
- lock state persists through localStorage
- stale lock IDs are pruned when selections change
- Randomize Dimension is wired
- Randomize Cabinet is wired
- Randomize All is wired
- Mutate Current Build is wired
- full dimensions replace oldest unlocked selection
- all-locked full dimensions block replacement
- randomization utilities normalize against canonical cardinality
- Composition Lab panel lexical quote/bracket balance is clean
- randomization utility lexical quote/bracket balance is clean
- localStorage lexical quote/bracket balance is clean

A full package build / TypeScript compile was not executed from this GitHub-edit environment.

---

# Next planned job

## Job 16C — LAB PRESETS + FAVORITES

Add convenience memory specifically for Composition Lab:

- favorite/star individual engines
- optional note explaining why an engine is useful
- FAVORITES ONLY filter
- save Composition-only build preset
- name preset
- load preset
- delete preset
- recent Composition builds
- possibly one-click load from a recent archived run

The existing whole-stack Save feature already preserves Composition IDs.

Job 16C is about making exploration of 1000 engines much faster and giving the machine useful signals about what the user likes.

---

# After that

## Job 16D — QA + MOBILE POLISH

- actual build/typecheck
- fix any compile/runtime problems
- mobile overflow / sticky controls / modal testing
- stress-test large Sound Source dimension
- saved-stack regression
- lock/randomizer regression
- generation smoke test

