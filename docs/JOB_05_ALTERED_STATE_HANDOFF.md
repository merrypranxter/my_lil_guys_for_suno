# Job 5 — ALTERED STATE Research + Library Handoff

Status: COMPLETE

## First: why the cards are not visible yet

That is expected.

Jobs 1–5 intentionally built the **data layer, prompt wiring, persistence, registries, and content libraries first**.

The full visible Reality Engine picker is **Job 6**.

So at this point:
- the app knows what Reality Engines are;
- it can resolve their IDs;
- it can pass selected IDs into generation;
- it can archive them;
- the libraries now exist;
- but ordinary users do not yet have the finished tabbed controls for selecting them.

Nothing is missing from the current UI by accident. The interface comes next.

---

# What shipped in Job 5

Job 5 populates the final previously-empty Reality Engine dimension:

- **ALTERED STATE**

New file:

- `src/data/realityAlteredStates.ts`

New research/source document:

- `docs/ALTERED_STATE_SOURCE_LEDGER.md`

Registry update:

- `src/data/realityEngines.ts` now imports and registers `ALTERED_STATE_ENGINES`.

At this point **all eight Reality Engine dimensions have data or infrastructure**:

1. FORMAT
2. ROLE
3. WORLD
4. SPECIES / ORIGIN
5. VENUE
6. HEADSPACE / STATE
7. ALTERED STATE
8. TONE

---

# Counts

New altered-state cards:

- **27**

Previous registry total:

- **233**

Current registry total:

- **260**

Duplicate IDs:

- **0**

All 27 Job 5 cards are correctly typed `dimension: 'alteredState'`.

---

# Source strategy

The altered-state library was not written from generic drug stereotypes.

It used three source tiers.

## Tier A — Ghost Erowid creative archive

Primary creative source.

Used:
- `merrypranxter/ghost-erowid-cosmology`
- Ghost Erowid Drive archives including Salvia, DXM, ketamine, nitrous, LSD, psilocybin and 2C-B material.

Important:
The Ghost archive contains valuable recurring motifs and project-specific cosmology, but it also contains speculative interpretations and exact-looking synthetic source counts from prior research sessions.

Those are treated as **creative project canon**, not automatically as verified pharmacological fact.

## Tier B — outside research / regulatory sources

Scientific and regulatory material was used to sanity-check broad effects such as:
- self/world distortion
- derealization
- body detachment
- time distortion
- synesthesia
- ego dissolution
- DMT entity-encounter reports
- MDMA social-affiliative effects
- anticholinergic delirium
- zolpidem complex sleep behaviors / amnesia
- nitrous dreamy detachment and time/body changes
- ketamine dissociation and space/body changes

Full references and distinctions are documented in:

`docs/ALTERED_STATE_SOURCE_LEDGER.md`

## Tier C — deliberate creative abstraction

Some of the best engines sharpen broad phenomenology into a songwriting mechanism.

Examples:

- **SALVIA OBJECT ETERNITY**
- **AMBIEN-AWAKE DOMESTIC DREAM LOGIC**
- **NITROUS COSMIC PUNCHLINE**
- **K-HOLE BACKEND**

The docs explicitly mark where the project is making an artistic abstraction rather than a scientific claim.

---

# ALTERED STATE cards

## Classic psychedelic family

- PSYCHEDELIC RECURSION
- LSD SENSORY CROSSWIRE
- PSILOCYBIN ORGANIC NETWORK
- MESCALINE MONUMENTAL ILLUMINATION

## DMT

- DMT HYPERDENSE RECEPTION
- DMT ENTITY RECEPTION DESK
- DMT THRESHOLD / CARRIER WAVE

## Salvia

- SALVIA OBJECT ETERNITY
- SALVIA PAGE-WHEEL
- SALVIA ZIPPER / FOLD

## DXM

- DXM BODY REMOTENESS
- DXM COLD ARCHITECTURE

## Deliriant family

- DELIRIANT FALSE ORDINARY REALITY
- DELIRIANT FAMILIAR SIMULATION

## MDMA

- MDMA AFFILIATIVE OVERFLOW

## Nitrous oxide

- NITROUS COSMIC PUNCHLINE
- NITROUS MEMBRANE POP

## Ketamine

- KETAMINE GEOMETRIC DISSOCIATION
- K-HOLE BACKEND

## Zolpidem / Ambien-inspired creative state

- AMBIEN-AWAKE DOMESTIC DREAM LOGIC

## Other / adjunct altered states

- ANESTHESIA EMERGENCE
- FEVER DREAM
- HYPNAGOGIC LEAK
- LUCID DREAM WITH BAD ADMIN CONTROLS
- SLEEP-DEPRIVATION MICRODREAM
- 2C-B AESTHETIC DEBUG MODE
- AFTERGLOW COSMIC DOMESTICITY

---

# Strong cards worth testing first

## SALVIA OBJECT ETERNITY

Core rule:

The narrator does **not** remain a person who thinks they became an object.

The new object / surface / mechanism / syllable / architectural fragment becomes the literal self.

The identity feels ancient and unquestionable.

Time expands until the emotional sequence can become:

terror → acceptance → routine → boredom → petty complaint

This is deliberately compatible with HEADSPACE = BORED ETERNITY.

Example conceptual combination:

- ALTERED = Salvia Object Eternity
- HEADSPACE = Bored Eternity
- FORMAT = Weather Forecast
- ROLE = Meteorologist
- SPECIES = Mothman

The meteorologist may become the Doppler radar itself and have been scanning the county for geological ages.

## NITROUS COSMIC PUNCHLINE

Runs:

`total revelation → obvious cosmic joke → attempt to explain → loss during translation → rediscovery`

The loop is the composition.

## AMBIEN-AWAKE DOMESTIC DREAM LOGIC

Rule:

An absurd household action feels completely logical **at the moment it is chosen**.

Later, memory and justification degrade.

The narrator encounters evidence of their own recent decisions without access to why those decisions made sense.

This card contains no instructions for reproducing a real medication effect.

## DELIRIANT FALSE ORDINARY REALITY

No psychedelic self-awareness.

No colorful "tripping" language.

The impossible person/object/event is accepted as normal until continuity failures accumulate.

## DMT HYPERDENSE RECEPTION

Meaning arrives faster than language can serialize it.

Lyrics repeatedly try to decompress a complete conceptual packet and fail.

## DXM BODY REMOTENESS

Splits:
- intention
- proprioception
- body feedback
- voice
- movement

into delayed or partially disconnected channels.

## KETAMINE GEOMETRIC DISSOCIATION

Self reduces from:
- person
- to viewpoint
- to location
- to vector
- to spatial relation

---

# Safety / fidelity constraints embedded in the research plan

The library contains no:
- dosage guidance
- procurement
- preparation
- administration technique
- redosing strategy
- mixing advice
- optimization advice

The source ledger explicitly warns future maintainers not to import those categories from technical vault files.

The goal is **phenomenology as composition machinery**, not real-world drug instruction.

---

# Verification

Static checks completed:

- FORMAT: 39
- ROLE: 39
- WORLD: 25
- SPECIES: 29
- VENUE: 30
- TONE: 20
- HEADSPACE: 51
- ALTERED STATE: 27

Current total:

**260 Reality Engine cards**

Duplicate IDs:

**0**

ALTERED STATE registry import:

**confirmed**

---

# Google AI Studio

Pull latest `main`.

No storage migration is required.

## Next planned job

**Job 6 — REALITY ENGINE UI**

This is the job where all this shit finally becomes **visible and clickable**.

Planned visible controls:

- FORMAT
- ROLE
- WORLD
- SPECIES
- VENUE
- HEADSPACE
- ALTERED
- TONE

plus:
- search
- selected-engine strip
- per-dimension randomize
- clear controls
- locks
- RANDOMIZE REALITY
- SURPRISE ME
- mobile layout

After Job 6, you should actually be able to sit there on your phone and build things like:

**Workout VHS + Infernal Oracle + Saturn + Reptilian + Hell Gym + 37 Tabs Open + Salvia Object Eternity + Aggressively Cheerful**

without typing the IDs manually.
