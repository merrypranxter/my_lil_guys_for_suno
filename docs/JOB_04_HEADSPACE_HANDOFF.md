# Job 4 — HEADSPACE / STATE Library Handoff

Status: COMPLETE

## What shipped

Job 4 adds the **HEADSPACE / STATE** dimension as a real operational layer.

HEADSPACE governs:

- attention
- salience
- interruption
- working-memory pressure
- emotional weighting
- association
- source attribution
- temporal ordering
- self-processing
- behavioral tempo

It does **not** replace FORMAT, ROLE, WORLD, SPECIES, VENUE, or TONE.

### New file

- `src/data/realityHeadspaces.ts`

### Registry update

`src/data/realityEngines.ts` now imports and registers `HEADSPACE_ENGINES`.

ALTERED STATE remains the only unpopulated Reality Engine dimension and is reserved for Job 5.

## Counts

New Job 4 cards:

- HEADSPACE / STATE: **51**

Previous Reality Engine total after Job 3:

- **182**

Current Reality Engine total after Job 4:

- **233**

Duplicate IDs across all populated dimensions:

- **0**

## Design rule

Clinically loaded ideas are represented as **specific composition mechanics**, not as caricatures of diagnoses.

Examples:

- ADHD-inspired territory becomes **37 TABS OPEN**, **TASK-SWITCHING STORM**, **WORKING-MEMORY COLLAPSE**, and **HYPERFOCUS TUNNEL**.
- OCD-inspired territory becomes **CHECKING LOOP**, **INTRUSIVE THOUGHT INTERRUPTION**, **SYMMETRY PRESSURE**, and **COMPULSIVE COUNTING**.
- psychosis-spectrum-inspired territory becomes **ABERRANT SALIENCE**, **SOURCE CONFUSION**, **REFERENCE SATURATION**, **PARANOID PATTERN SATURATION**, and **ASSOCIATIVE OVERCONNECTIVITY**.

The runtime cards operate on attention, memory, salience, association, checking, source monitoring, or interpretation. They do not instruct the model to perform a generic "crazy person" voice.

## HEADSPACE coverage

The library includes:

- Bewilderment
- Confuddlement
- Overwhelmed
- Ecstatic Joy
- Euphoria
- Manic Velocity
- Frenzy
- Giddy
- Awe-Struck
- Panic Under Function
- Paranoid Pattern Saturation
- Hypervigilance
- Neurotic Recursion
- Obsessive Fixation
- Checking Loop
- Intrusive Thought Interruption
- Symmetry Pressure
- Indecision Branching
- Dissociated Detachment
- Depersonalized Distance
- Flat Affect
- Sleep-Deprived
- Half Asleep
- Caffeine Catastrophe
- Identity Slippage
- Déjà Vu Saturation
- False Familiarity
- Amnesia Loop
- Memory Contamination
- Temporal Confusion
- Semantic Confusion
- Sensory Overload
- 37 Tabs Open
- Aberrant Salience
- Source Confusion
- Reference Saturation
- Associative Overconnectivity
- Working-Memory Collapse
- Hyperfocus Tunnel
- Task-Switching Storm
- Rumination Loop
- Catastrophic Anticipation
- Compulsive Counting
- Emotional Contagion
- Ecstatic Reverence
- Bored Eternity
- Thought Cascade
- Social Overreading
- Certainty Inflation
- Conflicting Impulses
- Delayed Emotional Processing

## Especially important mechanisms

### 37 TABS OPEN

Maintains several concurrent thought threads:
- main task
- side association
- looping phrase
- environmental monitor
- unrelated problem
- urgent thought that disappears

Threads may interrupt, hocket, vanish, and later resume where they stopped.

This is intentionally stronger than simply writing "distracted."

### CHECKING LOOP

Runs:

`uncertainty → verify → temporary relief → new uncertainty → verify again`

Each cycle must be related but not identical.

### ABERRANT SALIENCE

Neutral details gain disproportionate importance.

The engine changes **felt significance and interpretation**, not objective world facts.

### SOURCE CONFUSION

The information itself can stay clear while its origin destabilizes:

- did I think it?
- hear it?
- remember it?
- receive it from another speaker?
- hear it from a recording?

### REFERENCE SATURATION

Neutral announcements, numbers, gestures, and media fragments increasingly feel personally directed at the speaker.

Again: interpretation changes; the world does not automatically confirm the interpretation.

### MANIC VELOCITY

Ideas, plans, confidence, associations, and speech proliferate faster than selection can prune them.

The rule explicitly requires **local intelligibility**. It is velocity and proliferation, not gibberish.

### BORED ETERNITY

Built directly for the useful comic state where an impossibly long condition has passed through terror and acceptance into routine boredom.

The speaker can be trapped as a rock for cosmic durations and mostly complain that nothing interesting has happened lately.

## Example combinations now supported

- Workout VHS + Workout Instructor + Saturn + Reptilian + Saturn Fitness Resort + **37 Tabs Open**
- Weather Forecast + Meteorologist + Haunted Suburbia + Mothman + Omen Center + **Aberrant Salience**
- Today's Specials + Maître D' + Underworld City + Skeleton + Vampire Supper Club + **Temporal Confusion**
- Customer Support Call + Support Rep + Interdimensional Bureaucracy + Robot Bureaucrat + Hell Call Center + **Checking Loop**
- Public Access Show + Public Access Host + Dream Realm + Human + Local Studio + **Semantic Confusion**
- Guided Tour + Tour Guide + Cryptid National Park + Bigfoot + Ranger Station + **Hypervigilance**
- Court Deposition + Infernal Oracle + Hell + Demon + Temporal Courtroom + **Source Confusion**
- 90s Game Show + Game Show Host + Hell + Demon + Hell Studio + **Ecstatic Joy**
- Museum Audio Guide + Museum Docent + Alien Civilization + Grey Alien + Museum of Humans + **False Familiarity**
- any later Salvia engine + any role/world + **Bored Eternity** for the "I have been this object for fourteen billion lifetimes and frankly I am bored" effect

## Verification performed

Static registry checks:

- FORMAT: 39 / correct dimension 39
- ROLE: 39 / correct dimension 39
- WORLD: 25 / correct dimension 25
- SPECIES: 29 / correct dimension 29
- VENUE: 30 / correct dimension 30
- TONE: 20 / correct dimension 20
- HEADSPACE: 51 / correct dimension 51
- total registered data IDs: **233**
- duplicate IDs: **0**
- HEADSPACE library registered in `REALITY_ENGINES`

## Important current limitation

The full Reality Engine selection UI is still Job 6.

The runtime architecture and data registry can resolve these cards now, but the finished tabbed picker/randomizer is intentionally not built yet.

## Google AI Studio

Pull latest `main`.

No storage migration is required.

Next planned job: **Job 5 — ALTERED STATE research + library**, using the Ghost Erowid vault/repo as the primary creative archive and supplementing it only where useful.
