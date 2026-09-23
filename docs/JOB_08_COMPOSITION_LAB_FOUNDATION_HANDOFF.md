# Job 8 — Composition Lab Foundation / Generic Schema Handoff

Status: COMPLETE

## Purpose

Job 8 establishes the infrastructure for the new **COMPOSITION LAB** without dumping hundreds of cards into the UI yet.

The app now has three independent operational layers:

1. **LITTLE GUYS / MINDS** — how the song thinks.
2. **REALITY ENGINES** — who / where / what reality / what state.
3. **COMPOSITION LAB** — how the performance is physically and structurally organized.

Composition Lab is deliberately not folded into Reality Engine.

---

# New core types

Added to `src/types.ts`:

- `CompositionDomain`
- `CompositionDimension`
- `CompositionEngine`

Domains:

- `voice`
- `signal`
- `sonic`
- `structure`

Dimensions:

### VOICE
- language
- languageMode
- addressee
- ensemble
- gesture

### SIGNAL
- transmission
- transduction
- recordingDamage
- technology

### SONIC
- soundSource
- tuning
- rhythmPhysics
- spatialAudio
- roleExchange

### STRUCTURE / CONTROL
- temporal
- scale
- audience
- epistemology
- constraint
- economy
- failureMode
- controlAuthority
- prop

Total Composition dimensions:

**23**

---

# Registry scaffold

New file:

`src/data/compositionEngines.ts`

The registry is intentionally empty in Job 8:

`COMPOSITION_ENGINES = []`

Jobs 9–15 populate it.

The scaffold already defines:

- domain labels
- dimension labels
- dimension → domain mapping
- jurisdiction contracts
- selection limits
- lookup helpers
- dimension/domain filters
- cardinality normalization

---

# Cardinality rules

The generic registry now knows which dimensions are single-select and which are multi-select.

Current limits:

- language: 1
- languageMode: 1
- addressee: 1
- ensemble: 1
- gesture: 2
- transmission: 1
- transduction: 2
- recordingDamage: 2
- technology: 1
- soundSource: 8
- tuning: 1
- rhythmPhysics: 2
- spatialAudio: 1
- roleExchange: 2
- temporal: 1
- scale: 1
- audience: 1
- epistemology: 1
- constraint: 3
- economy: 1
- failureMode: 1
- controlAuthority: 1
- prop: 1

`normalizeCompositionEngineIds()` enforces these limits while preserving the most recently supplied selections.

This is the foundation for things like:

- eight simultaneous sound sources
- two recording-damage systems
- three game constraints
- one tuning system
- one addressee
- two body gestures

without making every dimension endlessly stackable.

---

# Request / archive schema

Added backwards-compatible:

`compositionEngineIds?: string[]`

to:

- `GenerationRequest`
- `RepairRequest`

Added normalized stored arrays to:

- `SavedStack`
- `ArchivedRun`

Old saved data remains valid because local-storage readers normalize missing Composition Lab fields to:

`[]`

---

# App state plumbing

`src/App.tsx` now owns:

`compositionEngineIds`

The state:

- loads from local storage
- persists on change
- saves with favorite stacks
- restores with favorite stacks
- archives with generated runs
- sends with `/api/generate`
- reaches browser procedural fallback

There is intentionally **no Composition Lab UI yet**.

That UI remains Job 16.

---

# Local storage

New key:

`lgm_last_composition_engines_v1`

New helpers:

- `getLastCompositionEngineIds()`
- `setLastCompositionEngineIds()`

Saved stacks now retain Composition Lab selections.

Archived runs now retain Composition Lab selections.

Markdown run exports now include:

`Composition engines: ...`

Starred-run positive preference context also carries the Composition IDs, so later learning work can use them without reworking old archives.

---

# Server plumbing

`server.ts` now accepts:

`compositionEngineIds`

The server:

1. sanitizes the incoming ID list;
2. allows enough request capacity for multi-select dimensions;
3. passes the IDs through `normalizeCompositionEngineIds()`;
4. sends the normalized selection to the AI prompt builder;
5. sends the same normalized selection to server procedural fallback.

Unknown IDs are rejected by the registry normalizer.

Once Jobs 9–15 populate the registry, the same path starts working without another request-schema migration.

---

# Prompt-builder architecture

`src/lib/buildGenerationPrompt.ts` now has a distinct:

## ACTIVE COMPOSITION LAB ENGINES

section.

Each active engine receives:

- dimension label
- name
- subtitle
- jurisdiction contract
- operational rule
- anti-decoration test

The core prompt explicitly distinguishes:

- Mind
- Reality
- Composition Lab

Composition Lab rules now state that selected mechanisms must be **audible or structurally testable**.

Examples encoded into the architecture:

- language changes phonology / prosody
- transmission changes information flow
- recording damage happens in time
- tuning changes interval behavior
- rhythmic physics changes pulse organization
- constraints / resources / failure / authority create observable consequences

No cross-domain chemistry is invented yet.

That remains Job 17.

---

# Procedural fallback

`src/lib/proceduralGenerator.ts` now accepts:

- `compositionEngineIds`

and resolves Composition Lab engines through the generic registry.

When Composition cards exist, fallback generation will include:

- Composition Lab style contracts
- per-engine jurisdiction lines in lyrics/control
- explicit anti-decoration behavior
- active Composition engine names in the procedural caption

This means later Composition Lab features do not disappear when Gemini is unavailable.

---

# Backwards compatibility

Existing Reality Engine behavior is unchanged when no Composition Lab engines are selected.

Existing saved stacks without `compositionEngineIds` load as:

`[]`

Existing archived runs without `compositionEngineIds` load as:

`[]`

Existing Reality IDs remain in `realityEngineIds`.

No Composition dimensions were added to `RealityDimension`.

This was deliberate.

---

# Static verification completed

Verified:

- all **23 Composition dimensions** have labels
- all 23 have domain mappings
- all 23 have jurisdiction contracts
- all 23 have cardinality limits
- App request path contains `compositionEngineIds`
- browser fallback contains `compositionEngineIds`
- server generation path contains `compositionEngineIds`
- server fallback contains `compositionEngineIds`
- prompt builder resolves Composition Lab engines separately
- procedural fallback resolves Composition Lab engines separately
- local storage normalizes old missing arrays
- server uses the cardinality normalizer

A full `npm run lint` / `npm run build` was not executed from this environment; verification here is static repository-path inspection.

---

# Visible behavior after pulling

Almost none yet — intentionally.

Job 8 is wiring.

The existing app should look essentially the same because:

- the Composition registry currently has zero cards;
- the Composition Lab UI is reserved for Job 16.

The important result is that Jobs 9–15 can now add content without repeatedly changing request/archive/storage architecture.

---

# Next planned job

## Job 9 — LANGUAGE / ACCENT / PHONOLOGY ENGINE

Next we build:

- reusable Language Profiles
- 80–120 initial languages
- unusual / underrepresented phonological systems
- click-language profiles
- tonal / pitch-accent profiles
- ejective / glottal / trill / unusual phonotactic systems
- native-language singing
- English with L1 phonological transfer
- code-switching
- native language + English refrain
- phonotactic nonsense
- chant / recitation / patter / conversational modes

and:

`docs/LANGUAGE_PHONOLOGY_SOURCE_LEDGER.md`

The runtime rule remains:

**phonology first, stereotype never.**
