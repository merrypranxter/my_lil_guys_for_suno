# Job 7 — Productive Collision + Chaos Control Handoff

Status: COMPLETE

## What changed

Random Reality generation is no longer blind.

Job 7 adds a deterministic rules layer that analyzes relationships among selected Reality Engines and lets the randomizers deliberately aim for different degrees of compatibility or contradiction.

New engine:

- `src/data/realityCompatibility.ts`

Updated UI:

- `src/components/RealityEnginePanel.tsx`

## Four chaos targets

The Reality panel now exposes:

- **COHERENT** — prefer naturally cooperating engines.
- **ODD** — mostly compatible with one or two useful wrong turns.
- **FUCKED** — deliberately seek productive jurisdictional collisions.
- **COMPLETELY UNREASONABLE** — push toward strong contradiction while still preferring structured friction over pure noise.

Both **RANDOMIZE REALITY** and **SURPRISE ME** use this intelligence.

Locks are still honored.

## How collision scoring works

The system does not use an LLM call.

It scores combinations locally from:

- shared tags
- contrasting tag families
- dimension relationships
- explicit high-value pair knowledge

That means randomization remains cheap and immediate.

Current contrast families include:

- mundane × cosmic
- kinetic × restrained
- social × solitary
- procedural × destabilizing

Shared operational tags reduce friction because the cards already have common ground.

Some dimension pairs also have baseline behavior:
- FORMAT × ROLE tends toward compatibility
- WORLD × VENUE tends toward compatibility
- HEADSPACE × ALTERED STATE gets extra collision potential
- TONE × WORLD gets extra collision potential

## Curated productive pair knowledge

The first explicit relationships include:

- BORED ETERNITY × SALVIA OBJECT ETERNITY
- SOURCE CONFUSION × DMT ENTITY RECEPTION
- SEMANTIC CONFUSION × DMT HYPERDENSE RECEPTION
- FALSE FAMILIARITY × DELIRIANT FAMILIAR SIMULATION
- TEMPORAL CONFUSION × NITROUS COSMIC PUNCHLINE
- DEPERSONALIZED DISTANCE × KETAMINE GEOMETRIC DISSOCIATION
- 37 TABS OPEN × PSYCHEDELIC RECURSION
- AGGRESSIVELY CHEERFUL × HELL
- TERRIFIED BUT PROFESSIONAL × HELL

These are seeds, not hard-coded recipes. The generic tag/dimension system still handles the rest of the 260-card space.

## Current Collision readout

When at least two Reality Engines are selected, the UI now shows:

- collision label
- normalized friction score
- explanation
- up to three strongest pair interactions and the reason they matter

Possible labels:

- NATURAL FIT
- PRODUCTIVE FRICTION
- HIGH FRICTION
- GLORIOUSLY UNREASONABLE

This is explanatory only. It never blocks a combination.

## Important design rule

There are **no forbidden combinations**.

High friction is not treated as an error.

The purpose is to preserve the project's original PRODUCTIVE CONTRADICTION UNDER CONSTRAINT idea:

> separate jurisdictions remain intact and are forced to negotiate.

The collision engine therefore distinguishes:

- compatibility
- useful contradiction
- strong contradiction

rather than:
- valid
- invalid

## Cost

Zero model calls.

The compatibility search runs locally against the existing card metadata.

## Google AI Studio

Pull latest `main`.

No migration or environment change is required.

The new chaos selector should appear inside the Reality Engine header under the main Reality controls.
