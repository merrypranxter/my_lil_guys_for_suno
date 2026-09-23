# Job 7 — Smart Reality Chemistry / Productive Collision Engine

Status: COMPLETE

## What changed

Job 7 turns Reality Engine randomization from a flat card lottery into a chemistry system.

The app now understands three separate ideas:

- **AFFINITY** — two engines naturally reinforce one another.
- **FRICTION** — two engines make incompatible demands.
- **PRODUCTIVE TENSION** — how much useful structure can be generated from the combination without collapsing into generic weirdness.

New core module:

- `src/lib/realityChemistry.ts`

---

## Chaos control

The Reality Engine UI now has four search behaviors:

### 1 — COHERENT

Prefer natural compatibility.

Examples:
- Workout VHS + Workout Instructor
- Weather Forecast + Meteorologist
- Hell + Hell Airport
- Bigfoot + Bigfoot Ranger Station

Friction is penalized unless enough shared structure exists to keep the system legible.

### 2 — ODD

Default.

Balance natural affinity with some contradiction and novelty.

This should produce combinations that make immediate sense but are not obvious.

### 3 — FUCKED

Actively seek productive contradiction.

Compatibility still matters enough to stop total mush, but friction becomes a major positive signal.

### 4 — UNREASONABLE

Maximize jurisdictional friction.

This does **not** mean random word salad.

Every selected engine still keeps its own job. The generator is instructed to make the contradiction happen at the seam between jurisdictions.

---

## Smart selection

The following UI actions now use chemistry-aware selection:

- RANDOMIZE REALITY
- SURPRISE ME
- per-dimension SMART ROLL

They no longer choose uniformly random cards.

A candidate is scored against the cards already selected.

Scoring considers:

- shared semantic tags
- naturally complementary dimensions
- naturally collision-prone dimensions
- curated high-value affinities
- curated productive conflicts
- novelty
- current chaos level
- learned preference weights from starred runs

Repeated rolls still include an elite-pool random component so the same combination does not always win.

---

## Locks still work

Locked dimensions remain fixed during:

- RANDOMIZE REALITY
- SURPRISE ME
- CLEAR UNLOCKED

The smart combiner constructs the remaining reality **around the locked cards**.

This is important.

Example:

Lock:
- FORMAT = Weather Forecast
- SPECIES = Mothman

Then move the chaos control from COHERENT to UNREASONABLE and repeatedly hit SURPRISE ME.

The machine searches for increasingly antagonistic ROLE / WORLD / VENUE / HEADSPACE / ALTERED / TONE layers while preserving Mothman weather television.

---

## Temporary Consciousness narrator

The panel now synthesizes the current configuration into a readable sentence.

Example structure:

> An aggressively cheerful bored-eternity mothman meteorologist is performing a weather forecast inside a hell airport, under the rules of Hell, while governed by Salvia Object Eternity.

This exists so a complicated eight-axis selection can be understood without mentally decoding eight chips.

---

## Live chemistry meter

The UI shows:

- affinity
- friction
- productive tension
- chemistry label

Labels include:

- SINGLE ENGINE
- COHERENT MACHINE
- ODD BUT STABLE
- PRODUCTIVE COLLISION
- FERAL NEGOTIATION
- UNREASONABLE BUT LEGAL

These numbers are heuristic creative scores, not scientific metrics.

---

## Collision Map

A new expandable **SHOW COLLISION MAP** panel exposes:

### STRONGEST SEAMS

The engine pairs currently doing the most useful work.

It shows pair-level affinity / friction and compact reasons such as:

- shared tags
- complementary jurisdictions
- jurisdictional collision
- curated affinity
- curated productive conflict

### NEGOTIATION ORDERS

The combiner generates explicit instructions for how the selected layers must interact.

Examples:

- FORMAT stays structurally legible while ALTERED STATE corrupts identity/time/perception from inside it.
- ROLE continues doing the job while HEADSPACE changes attention, salience, memory, interruption, or emotional weighting.
- WORLD defines global normality while VENUE supplies immediate procedures and objects.
- SPECIES changes embodiment rather than acting as costume vocabulary.
- TONE colors delivery but cannot erase mechanics.

---

## Curated affinities and productive conflicts

The engine contains a small high-confidence seed map in addition to tag-driven scoring.

Examples of affinities:

- Workout VHS × Workout Instructor
- Weather Forecast × Meteorologist
- Today's Specials × Maître D'
- Circus Program × Ringmaster
- Customer Support Call × Customer Support Rep
- Hell × Hell Airport / Hell Gym / Hell Call Center
- Saturn × Saturn Fitness Resort
- Mothman × Mothman Omen Center
- Bigfoot × Bigfoot Ranger Station
- Salvia Object Eternity × Bored Eternity

Examples of productive conflicts:

- Wholesome × Hell
- Elegant × Goblin
- Hyper-Professional × Manic Velocity
- Ominously Calm × Frenzy
- Aggressively Cheerful × Panic Under Function
- Workout VHS × K-Hole Backend
- Weather Forecast × Salvia Object Eternity
- Customer Support Call × Deliriant False Ordinary Reality
- Maître D' × Temporal Confusion
- Meteorologist × Aberrant Salience

The rest of the 260-card space is scored dynamically rather than requiring an impossible hand-authored pair table.

---

## Star learning now affects Reality rolls

Existing starred-run feedback now generates normalized Reality Engine preference weights.

Function added:

- `getLikedRealityWeights()`

A starred run increases the chance that its successful Reality mechanisms reappear in future smart rolls.

Written feedback gives the run a slightly larger weight.

This remains a **soft signal**.

It does not force exact repeats, and its influence is intentionally reduced at UNREASONABLE chaos.

Cards with learned positive weight display a small star score in the picker.

---

## Generator intelligence

`buildGenerationPrompt.ts` now receives:

- active Reality engines
- selected Reality chaos level
- chemistry summary
- temporary-consciousness description
- strongest collision seams
- negotiation directives

The prompt explicitly states:

> Reality chaos is a search target, not a volume knob.

The model is told not to satisfy high chaos by adding more random content.

Instead, it must repeatedly generate events from the strongest jurisdictional seam.

---

## Procedural fallback fixed

Previously the local / server procedural fallback accepted only Little Guy IDs and ignored Reality Engines.

That is now fixed.

`src/lib/proceduralGenerator.ts` now receives:

- `realityEngineIds`
- `realityChaos`

and writes Reality laws and collision chemistry into its STYLE, LYRICS / CONTROL, and CAPTION construction.

This means a temporary Gemini outage no longer silently deletes the entire Reality Engine configuration.

Both fallback paths were updated:

- browser fallback in `src/App.tsx`
- server fallback in `server.ts`

---

## Persistence

New global local-storage value:

- `lgm_reality_chaos_v1`

The selected chaos level survives reload.

Saved stacks now also store their Reality chaos level.

Archived generations record the Reality chaos level.

Markdown exports include it.

Positive-feedback context includes it.

Old stacks / runs remain valid because the new field is optional and defaults to ODD / level 2 where absent.

---

## Server plumbing

`server.ts` now:

- accepts `realityChaos`
- sanitizes it to 1–4
- defaults invalid / missing values to 2
- passes it to the AI prompt builder
- passes it to procedural fallback

---

## Changed / new files

New:

- `src/lib/realityChemistry.ts`

Updated:

- `src/types.ts`
- `src/components/RealityEnginePanel.tsx`
- `src/App.tsx`
- `src/lib/localStorage.ts`
- `src/lib/buildGenerationPrompt.ts`
- `src/lib/proceduralGenerator.ts`
- `server.ts`

---

## Current Reality registry

Still:

**260 cards**

Job 7 changes how the cards interact rather than inflating the library.

---

## Google AI Studio

Pull latest `main`.

The immediately visible changes should be inside Reality Engine:

- Temporary Consciousness sentence
- chemistry label and three scores
- COHERENT / ODD / FUCKED / UNREASONABLE buttons
- SMART ROLL
- collision-map drawer
- learned star weights on positively reinforced cards

No environment variable change is required.
