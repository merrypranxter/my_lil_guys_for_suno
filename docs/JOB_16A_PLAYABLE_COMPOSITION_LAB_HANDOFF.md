# Job 16A — Playable Composition Lab Handoff

Status: COMPLETE

## Why this job existed

Jobs 8–15 built the Composition Lab data/intelligence but intentionally left it behind the wall.

Job 16A opens the cabinets.

The app can now browse and select the registered Composition Lab engines directly from the main interface.

---

# What shipped

New component:

- `src/components/CompositionLabPanel.tsx`

Updated:

- `src/App.tsx`

The panel is mounted directly below Reality Engine and uses the existing:

- `compositionEngineIds` app state
- localStorage persistence
- save-stack persistence
- archive persistence
- generation request payload
- procedural fallback

No new transport protocol was required.

---

# Playable-now features

## Cabinet navigation

Four top-level cabinets:

- VOICE LAB
- SIGNAL LAB
- SONIC LAB
- STRUCTURE / CONTROL LAB

## Dimension browsing

All current Composition dimensions are available:

VOICE:
- Language / Phonology
- Language Performance Mode
- Addressee / Relationship
- Ensemble / Voice Topology
- Physical Gesture / Body

SIGNAL:
- Transmission / Media
- Translation / Transduction
- Recording / Damage
- Historical Technology

SONIC:
- Sound Palette / Source
- Tuning / Pitch World
- Rhythmic Physics
- Stage Geometry / Spatial Audio
- Musical Role Exchange

STRUCTURE / CONTROL:
- Temporal Engine
- Scale Engine
- Epistemology / Knowledge
- Audience Feedback
- Constraint / Game Rule
- Economy / Resource
- Failure Mode
- Control Authority
- Object / Prop

---

# Engine browser

Each engine card now shows:

- name
- subtitle
- short explanation
- tags
- selected state
- add/remove action
- detail action

The browser is limited to the active dimension, so the UI never dumps all 1000 cards onto the screen at once.

---

# Search

Search works inside the active dimension across:

- name
- subtitle
- short explanation
- full operational rule
- tags

A SELECTED ONLY toggle is also available.

---

# Detail modal

Every engine can open a detail view showing:

- cabinet/domain
- dimension
- name
- subtitle
- short explanation
- full operational rule
- dimension jurisdiction
- tags
- add/remove action

This is important because many engines are mechanisms that cannot be understood from their title alone.

---

# Cardinality

The UI reads the existing canonical:

`COMPOSITION_DIMENSION_LIMITS`

For Job 16A, when a dimension is full:

- new selection is rejected
- the UI explains the current count/limit
- the user removes an existing engine before adding another

This deliberately avoids hidden automatic replacement until the lock/randomization job.

---

# Active Build

The Composition Lab now shows an ACTIVE BUILD tray.

Selected engines are grouped by dimension and display:

- engine name
- current dimension count
- dimension limit
- remove action
- clear dimension
- clear all

The header also shows:

- total registry count
- current active count

---

# Mobile behavior

The implementation uses:

- horizontal dimension scrolling
- responsive cabinet grid
- single-column engine cards on narrow screens
- modal engine details
- bounded scroll area for large libraries

This is the first playable mobile layout, not final mobile polish.

---

# Generation hookup

This was already present before Job 16A:

`App.tsx` sends:

`compositionEngineIds`

to:

- `/api/generate`
- procedural generation fallback
- archive
- saved stacks
- last-selection localStorage

Job 16A binds the new UI directly to that same state.

Therefore:

> selecting engines in Composition Lab and pressing the existing Generate button already uses them.

No separate Job 16D generation hookup is required for basic play.

---

# Static verification

Verified:

- Composition Lab panel is imported by App
- Composition Lab panel is mounted below Reality Engine
- all 23 current Composition dimensions are represented in UI ordering
- card selection reads canonical dimension limits
- selected IDs flow through existing app state
- panel TypeScript/TSX quote/bracket lexical balance is clean
- App quote/bracket lexical balance remains clean

A full package build was not executed from this GitHub-edit environment.

---

# Remaining jobs before polish

## Job 16B — LOCKS + RANDOMIZATION

Add:

- lock/unlock engine
- Randomize Dimension
- Randomize Cabinet
- Randomize All
- Mutate Current Build
- locked selections survive randomization
- full dimensions replace oldest/random unlocked only

This is NOT required to generate manually selected builds.

## Job 16C — LAB PRESETS + FAVORITES

Add dedicated Composition Lab convenience memory:

- save lab build
- load lab build
- favorite engine
- optional note on why an engine worked
- recent builds

The existing whole-stack Save function already preserves compositionEngineIds, so this is convenience UI rather than a blocker.

## Job 16D — QA + MOBILE POLISH

Run/fix:

- full build/typecheck
- large-library rendering
- mobile overflow
- modal behavior
- saved-selection regression
- generation regression
- empty/full dimension states

---

# Earliest playable point

**NOW — after Job 16A.**

Pull latest main, open Composition Lab, select engines, then use the existing Generate control.

Jobs 16B–16D make it faster, smarter, and nicer; they are not blockers for first play.
