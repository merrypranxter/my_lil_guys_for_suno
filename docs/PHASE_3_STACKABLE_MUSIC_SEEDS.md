# Phase 3 — Stackable Music Seed Recipes + Mechanism Compiler

## Why this exists

The Little Guy Machine already answers **who is thinking** (Minds), **what reality the song is trapped inside** (Reality Engine), and **how the performance is physically organized** (Composition Lab).

Phase 3 adds a fourth layer:

> **What kind of musical machine are we starting with?**

This layer is deliberately **not a genre preset system**. Seed Recipes are reusable starting configurations made from smaller musical mechanisms. They can be stacked, reordered, muted, locked, weakened, strengthened, rerolled individually, or ignored entirely.

The goal is to make it easy to start from a recognizable behavior without domesticating experimentation.

---

## Architecture

Generation now has four independent layers:

1. **Little Guys / Minds** — cognitive operations and generative laws.
2. **Reality Engines** — scenario, role, world, perception, altered state, and related ontology.
3. **Composition Lab** — mouths, signal paths, sound sources, tuning, rhythmic physics, chronology, constraints, resources, failure, authority, props.
4. **Music Seed Lab** — musical starting physics, stackable macro-recipes, mechanism chips, and global pressure controls.

The Music Seed Lab compiles before generation:

```
recipe macros
    ↓ expand
mechanism contributions
    ↓ deduplicate / reinforce
stack interactions
    ↓
global musical pressure
    ↓
prompt directives
```

Duplicate mechanisms reinforce. They do not repeat prompt text.

Conflicting mechanisms are required to negotiate through separate jurisdictions rather than averaging into generic "experimental" mush.

---

## Starter Seed Recipes

Phase 3 ships with 10 macro-recipes:

### COUPLED STAMPEDE
Frantic, physical, communal motion built from 3:2 shared-pulse coupling, body percussion, contagious group participation, an anchor, and township-jive / kwela-adjacent rhythmic brightness.

### JURISDICTION CRASH TEST
Several systems obey incompatible laws. Musical functions may disappear temporarily so surviving systems become audible.

### PANIC ENGINE
High event-arrival rate. Something identifiable keeps happening before the previous event fully settles.

### NARRATOR + MOB
One intelligible central voice gets progressively surrounded and recruited into group behavior.

### CAST OF FREAKS
A real vocal population: lead, narrator, small group, crowd, freak voice, etc. Each has a separate musical job.

### EVENT-DRIVEN VARIETY SHOW
Form changes because events happen: interruptions, reveals, failures, responses, mistakes, cues.

### ANCHOR UNDER SIEGE
One compact recognizable element survives increasingly severe mutation.

### DOUBLE-TIME HALLUCINATION
Base tempo and activity rate are separated so a moderate pulse can support extremely fast event flow.

### VOCAL RELAY RIOT
Speech, song, hocket, phonetic percussion, response, and group behavior pass musical information between voices.

### STRIP IT TO THE BONES
High-stemminess arrangement designed to deliberately expose useful isolated material.

The permanent escape hatch is:

**NO RECIPE, YOU COWARD**

It removes unlocked recipe macros while preserving manually chosen mechanisms.

---

## Mechanism Library

Phase 3 ships with 20 mechanism chips across six families.

### Rhythm
- 3:2 Coupling
- Meter Collision
- Double-Time Hallucination
- False Resolution

### Vocal
- Communal Infection
- Vocal Cast
- Vocal Relay
- Call + Response
- Phonetic Percussion
- Hocket Relay

### Form
- Hard Interrupts
- Event-Driven Form

### Arrangement
- Jurisdiction Dropout
- Exposure Windows
- Role Migration
- Anchor Survival

### Texture
- Body Percussion
- Dry Separation
- Township Rhythmic Brightness

### Performance
- Group Unison Burst

Mechanisms have:
- family
- executable instruction
- tags
- stem value
- chaos value

---

## Stack Operations

Every active recipe or mechanism is represented as a stack item with:

- order
- strength (0–100)
- muted state
- locked state

The UI supports:

- add recipe
- add mechanism
- reorder
- strengthen / weaken
- reroll only this
- mute / unmute
- lock / unlock
- remove
- clear unlocked

Locked items survive destructive stack operations.

---

## Global Musical Controls

Seven global controls modify the compiled musical system independently of recipe selection:

- **Stemminess** — fused mix ↔ dissectable arrangement
- **Kinetic Density** — breathing room ↔ relentless event flow
- **Social Infection** — one performer ↔ participation spreads through the room
- **Coupling** — one clock ↔ multiple valid rhythmic truths
- **Interruption** — phrases finish ↔ frequent causal cuts
- **Anchor Strength** — rapid replacement ↔ unmistakable invariant
- **Cast Size** — solo ↔ populated vocal ecosystem

Stemminess is not a quality score. At high values it explicitly requests:
- register separation
- role separation
- local instead of universal wash
- exposure windows
- parts that remain musically useful when isolated

High kinetic density + high stemminess therefore means **events rotate through distinct actors** instead of everyone playing continuously.

---

## Interaction Compiler

The compiler currently contains explicit cross-mechanism interaction laws.

Examples:

- **3:2 Coupling + Vocal Relay**
  - different relay voices inherit opposing pulse interpretations.

- **Anchor Survival + Role Migration**
  - the invariant migrates between sources while remaining recognizable.

- **Communal Infection + Vocal Cast**
  - the full cast cannot appear immediately; recruitment becomes part of the form.

- **Jurisdiction Dropout + Exposure Windows**
  - dropout events become intentional stem-harvest windows.

- **Hard Interrupts + Event-Driven Form**
  - interruptions must cause downstream form changes.

- **High Stemminess + High Kinetic Density**
  - rapid events rotate across distinguishable sources instead of creating a wall of sound.

- **High Social Infection + Body Percussion**
  - newly recruited performers bring new claps, stomps, breaths, or foot patterns.

- **High Coupling + Rhythm Mechanisms**
  - multiple clocks must share a substrate or recurring alignment point so complexity stays bodily graspable.

This interaction layer is intentionally hand-authored first. It can expand as successful combinations are discovered.

---

## Feedback Learning

Starred generations now learn two different things independently:

### Mind preference
Which Little Guys / cognitive combinations were useful.

### Music mechanism preference
Which musical physics were useful.

Quick feedback tags include:
- The Groove
- The Coupling
- The Voices
- The Yelling / Energy
- The Arrangement
- The Stem Separation
- The Instruments
- The Mutations
- The Contrasts
- The Anchor
- The Whole Fucking Thing

Free-text feedback remains available.

Future mechanism rerolls may softly bias toward mechanisms found in starred runs, but favorites do not become mandatory.

---

## Persistence

Whole-stack saves now preserve:

- Little Guys
- Reality Engines
- Reality Chaos
- Composition Lab engines
- Music Seed stack
- Music Seed global controls

Generated-run archives also store the active Music Seed stack, controls, and feedback tags.

Older saved data remains valid because all new fields are optional and normalized on load.

---

## Generation Plumbing

Music Seed data is passed through:

- React application state
- localStorage
- saved whole stacks
- run archive
- `/api/generate`
- master prompt compiler
- procedural fallback engine

The fallback therefore honors the same recipe/mechanism physics when Gemini is unavailable.

---

## Validation

`npm run verify:seed` checks:

- exactly 10 starter recipes
- at least 20 mechanisms
- unique IDs
- all recipe mechanism references resolve
- muted mechanisms do not compile
- recipe macros expand correctly
- manually stacked mechanisms survive compilation
- 3:2 Coupling + Vocal Relay produces its meter-handoff interaction
- high Stemminess + Kinetic Density produces the anti-wall-of-sound interaction
- global controls clamp correctly

CI runs the Music Seed Lab verification before the production build.

---

## Deliberately deferred

Not part of this phase:

- recipe breeding
- automatic favorite-audio analysis
- automatic mechanism invention
- cloud sync of user-created recipes
- generalized pairwise chemistry across every mechanism
- genetic/evolutionary recipe populations

The schema leaves room for those later.

The immediate goal is simpler:

> Start somewhere useful, stack the physics, preserve good accidents, and never let a recipe become a cage.
