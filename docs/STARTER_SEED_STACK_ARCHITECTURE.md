# Starter Seed Stack — Phase 1 Architecture

## Purpose

The Little Guy Machine already has independent systems for Minds, Reality Engines, Composition Lab, and Music Seed Lab.

The Starter Seed Stack sits **before** those systems. It exists to make starting a session fast without turning the app into a preset jukebox.

A starter seed is not a complete prompt. It is a compact packet of initial conditions.

Examples:

- AFFECT — Divine Exultation
- PSYCHEDELIC — LSD: Prismatic Recursion
- MOTION — Double-Time Bloodstream
- SOCIAL — Laughing Fit
- INSTRUMENT PACK — eight incompatible instruments with separate jobs
- WORLD PACKAGE — Midnight Call-In Radio
- TEXTURE — later expansion

Existing Music Seed recipes such as Coupled Stampede, Panic Engine, Anchor Under Siege, etc. remain behavioral architecture rather than being duplicated here.

## Core rule

**Stacked seeds negotiate. They do not average.**

Each seed declares jurisdictions it owns. If two active seeds own the same jurisdiction, the compiler emits a negotiation law instead of splitting the difference.

Example:

- rigid pulse owns RHYTHMIC BEHAVIOR
- elastic subdivision also owns RHYTHMIC BEHAVIOR

The compiler must not produce "medium elasticity."

It instead requires separate populations, roles, registers, time-scales, sections, or causal triggers that keep both rules audible.

## Seed schema

Every seed declares:

- id / name / category
- default intensity
- tags
- OWNS — dimensions the seed controls strongly
- BIASES — tendencies it encourages
- PROTECTS — invariants that later systems should preserve
- FORBIDS — explicit anti-drift rules
- OPERATORS — executable transformations
- collision mode
- outputs into existing engine layers

Optional outputs may target:

- Reality Engine IDs
- Composition Engine IDs
- Music Seed recipe references
- Music mechanism references
- Music control deltas
- Reality Chaos

This lets a starter seed initialize existing systems without replacing them.

## Categories

Phase 1 schema recognizes:

- affect
- psychedelic
- motion
- social
- instrumentPack
- worldPackage
- texture

More categories can be added deliberately later.

## World Packages

World Packages are intentionally more internally coherent than ordinary musical seeds.

They may bundle:

- setting
- medium
- primary character
- supporting cast
- recurring concern
- event cues
- protected semantic invariant

Example:

MIDNIGHT CALL-IN RADIO

- setting: tiny AM station after midnight
- medium: live call-in broadcast
- primary: dry night DJ
- supporting cast: callers, engineer, station voice
- recurring concern: callers report variations of one unexplained event
- event cues: phone ring, caller connects, station ID, commercial break
- invariant: the DJ keeps trying to conduct an ordinary radio program

The world package has semantic priority **only inside its semantic jurisdictions**. It does not force genre or musical style.

The music may mutate beyond recognition while the broadcast remains the human handhold.

## Instrument Packs

An instrument pack is not just a random list.

It contains Composition Lab engine IDs plus one role assignment per instrument.

The point is:

**eight instruments + eight jobs**

Examples of jobs:

- pulse
- bass punctuation
- sustained harmony
- melodic ornament
- vocalist response
- structural damage cue
- transition signal
- invariant

Instrument packs therefore inherit the same jurisdiction principle as the rest of the machine.

## Intensity

Every active stack item has 0–100 intensity.

Intensity scales:

- mechanism contribution
- music-control pressure
- directive strength metadata

Intensity does not remove protected invariants.

## Protected invariants

Protected invariants are collected explicitly.

Examples:

- positive emotional valence
- the radio show remains identifiable
- one melodic anchor survives
- laughter remains socially contagious

Future prompt plumbing should state that these survive later mutation unless the user explicitly unlocks them.

## Collision modes

NEGotiate (default)
: incompatible owners coexist through distinct roles/time scales/sections/triggers.

PROTECT
: one seed supplies an invariant that other seeds act around.

EXCLUSIVE
: one seed owns that jurisdiction; competing pressure is rerouted elsewhere instead of averaged.

World Packages will usually use PROTECT for their semantic frame.

## Compiler output

The Phase 1 compiler returns:

- active resolved seeds
- deduplicated Reality Engine IDs
- deduplicated Composition Engine IDs
- reinforced Music recipe/mechanism references
- weighted Music control deltas
- maximum requested Reality Chaos
- executable directives
- protected invariants
- forbidden drift
- world event cues
- explicit jurisdiction collisions

No UI or generation plumbing is changed in Phase 1.

That is deliberate: first establish a stable genetic packet and compiler contract; then populate the library and connect it to the app.

## Next phase

Phase 2 will create the first real content library:

- 12–15 positive affect seeds
- LSD / DMT / Salvia phenomenology seeds
- motion / kinetic seeds
- social states
- coherent world packages
- instrument collision packs built only from Composition Lab sources that actually exist in the repository

After content verification, the stack can be wired into persistence, the generation prompt, and UI.
