# Job 15 — Audience / Rules / Resources / Failure / Authority / Prop Handoff

Status: COMPLETE

## What shipped

Job 15 populates the final six planned Structure / Control dimensions:

- **AUDIENCE FEEDBACK**
- **CONSTRAINT / GAME RULE**
- **ECONOMY / RESOURCE**
- **FAILURE MODE**
- **CONTROL AUTHORITY**
- **OBJECT / PROP**

New runtime files:

- `src/data/structureAudience.ts`
- `src/data/structureConstraints.ts`
- `src/data/structureEconomy.ts`
- `src/data/structureFailureModes.ts`
- `src/data/structureAuthority.ts`
- `src/data/structureProps.ts`

Updated:

- `src/data/compositionEngines.ts`
- `src/lib/buildGenerationPrompt.ts`
- `src/lib/proceduralGenerator.ts`

---

# Counts

AUDIENCE FEEDBACK:

**25**

CONSTRAINT / GAME RULE:

**35**

ECONOMY / RESOURCE:

**24**

FAILURE MODE:

**25**

CONTROL AUTHORITY:

**25**

OBJECT / PROP:

**25**

New Job 15 engines:

**159**

Previous populated Composition Lab total:

**841**

Populated Composition Lab total after Job 15:

# **1000**

Duplicate Job 15 IDs:

**0**

Cardinality remains:

- audience: 0–1
- constraint: 0–3
- economy: 0–1
- failureMode: 0–1
- controlAuthority: 0–1
- prop: 0–1

Job 15 completes the planned Composition Lab content population before the dedicated UI job.

---

# AUDIENCE FEEDBACK

Audience Feedback answers:

> WHAT does listener reaction physically change in the composition?

This remains distinct from ADDRESSEE.

ADDRESSEE changes how a speaker communicates to someone.

AUDIENCE FEEDBACK changes the composition *after the listeners react*.

Examples include:

- Applause Changes Meter
- Heckling Changes Lyrics
- Crowd Votes on Harmony
- Callers Request Mutations
- Dancers Force Tempo
- Judges Eliminate Instruments
- Audience Sings the Wrong Refrain
- Crowd Silence Freezes Form
- Booing Subtracts a Layer
- Cheering Adds a Layer
- Laughter Repeats the Setup
- Confusion Forces Explanation
- Chant Steals the Anchor
- Crowd Clap Phase Drift
- Audience Veto
- Score Unlocks Form
- Split Crowd / Split Song
- Audience Corrects the Call
- Standing Ovation Triggers Coda
- Walkout Shrinks the System
- Phone Lights Control Density
- Singalong Memory Test
- Audience Provides the Seed
- Encore Demand Returns It Wrong
- Audience Hostile Takeover

## Strong example: AUDIENCE SINGS THE WRONG REFRAIN

The audience repeatedly returns an incorrect refrain.

After a defined threshold, the performers must adopt the incorrect crowd version as the official anchor.

The crowd is therefore not ambience.

Collective memory rewrites the composition.

---

# CONSTRAINT / GAME RULE

Constraint answers:

> WHAT IS LEGAL, ILLEGAL, REQUIRED, OR IRREVERSIBLE?

Up to **three** constraints may coexist.

Examples include:

- Only Three Pitches
- One Rhythm Cell
- Every Section Loses One Instrument
- Every Section Gains One Instrument
- Every Repeated Noun Mutates
- No Sound Returns Unchanged
- Every Verse Preserves One Artifact
- Forbidden Interval
- Forbidden Beat Position
- Exact Symmetry Requirement
- No Exact Repeat / No Exact Mirror
- Every Eight Bars Two Systems Exchange Jobs
- One Word May Never Be Said
- Every Correction Creates a New Rule
- Questions Only
- No Chorus May Repeat
- One Vowel Per Section
- Alphabet Shrinks
- One-Syllable Lines
- Fixed Word Count Per Section
- Pitch May Only Move Up
- Pitch May Only Move Down
- Dynamics May Only Increase
- Density May Only Decrease
- One New Fact Per Section
- No New Material After Midpoint
- Anchor Must Appear Every Section
- Anchor May Never Keep the Same Job
- Every Lyric Line Must Cause an Event
- Every Event Gets Explained Later
- One System Must Always Be Silent
- Only Two Active Systems at Once
- No Backtracking
- Three Strikes
- Choose One / Lose the Rest

## Important distinction

CONSTRAINT is not ECONOMY.

### Constraint
Defines legality.

Example:

> Bass may never play beat four.

### Economy
Defines affordability.

Example:

> Bass may use beat four, but it costs one permit.

---

# ECONOMY / RESOURCE

Economy answers:

> WHAT IS FINITE, OWNED, PRICED, DEPLETED, CONSERVED, BORROWED, OR REPAID?

Examples:

- Notes Cost Oxygen
- Modulation Costs Memory
- Bass Frequencies Require Permits
- Choir Has Finite Syllables
- Instruments Barter for Beats
- Silence Earns Currency
- Loudness Consumes Power
- Repetition Depletes the Source
- Finite Attention Budget
- Finite Track Slots
- Frequency Real Estate
- Borrowed Beats Accrue Debt
- Dissonance Tax
- Rare Word Licenses
- Questions Cost Tokens
- Finite Repair Parts
- Authority Points
- Finite Memory Cache
- Finite Translation Budget
- Time Is Currency
- Noise Buys Clarity
- Motifs Pay Royalties
- Spatial Capacity
- Battery Drains

Economy rules now require explicit accounting.

Spending must:
- reduce a pool
- occupy a permit
- create debt
- transfer ownership
- or consume another named resource

Replenishment must have a source.

---

# FAILURE MODE

Failure Mode answers:

> HOW DOES THE SYSTEM BREAK, AND WHAT DOES THE BREAK INFECT NEXT?

Examples:

- Forgetting
- Overheating
- Mistranslation
- Buffer Overflow
- Tuning Drift
- Performer Replacement
- Resource Exhaustion
- Desynchronization
- Identity Collision
- Corrupted Memory
- Bureaucratic Deadlock
- Feedback Runaway
- Error Creates Error
- Cascading Deletion
- Stuck State
- False Success Signal
- False Alarm
- Silent Failure
- Partial Failure
- Intermittent Failure
- Version Mismatch
- Overflow Into Wrong Jurisdiction
- Control Loop Oscillation
- Checkpoint Restart
- Dead Letter

## Failure is not generic chaos

Example:

### BUFFER OVERFLOW

The system gets:
- a finite queue
- incoming event rate
- processing rate

When incoming events exceed capacity:
- events drop
- overwrite
- duplicate
- or spill elsewhere

depending on the card rule.

That is a failure mechanism.

"Everything gets glitchy" is not.

---

# CONTROL AUTHORITY

Control Authority answers:

> WHOSE DECISION IS VALID?

Examples:

- Conductor
- Audience
- Caller
- Percussionist
- Lead Vocalist
- Bass Player
- Algorithm
- Random Draw
- Weather
- Bureaucratic Terminal
- Youngest Singer
- Oldest Singer
- Nonexistent Supervisor
- Rotating Authority
- Authority Transfers After a Mistake
- Authority Transfers After Success
- Last Speaker Has Control
- Quietest Voice Has Control
- Loudest Voice Has Control
- Most Wrong Agent Controls Next
- Most Accurate Agent Controls Next
- Token Holder
- Majority Vote
- Minority Veto
- Two-Key Authority

The prompt now treats unauthorized changes as invalid.

Authority can therefore become a compositional state that:
- transfers
- rotates
- is spent
- is contested
- depends on evidence
- depends on physical possession
- or fails entirely

---

# OBJECT / PROP

Prop answers:

> WHICH PHYSICAL OBJECT KEEPS RETURNING, AND WHAT STATE DOES IT CARRY?

Examples:

- Telephone
- Menu
- Clipboard
- Receipt
- Key
- Suitcase
- Wheel
- Mirror
- Cassette
- Vending Machine
- Egg
- Rope
- Bell
- Giant Button
- Map
- Broken Remote
- Coin
- Ticket
- Rubber Stamp
- File Folder
- Flashlight
- Stopwatch
- Name Tag
- Sealed Envelope
- Rubber Duck

A Prop does not pass by merely appearing in lyrics.

It must accumulate:

- ownership
- contents
- damage
- marks
- location
- permission
- recording history
- price
- evidence
- control function
- or another persistent state

Example:

### CASSETTE

The same tape may:
- record a message
- be overwritten
- rewind
- degrade
- reveal an earlier take
- transfer information between people/times

Its history remains attached to the same object.

---

# Prompt-builder update

The master generation prompt now contains:

## STRUCTURE / CONTROL — AUDIENCE / RULES / RESOURCES / FAILURE / AUTHORITY / PROP

Rules explicitly state:

### AUDIENCE
Reaction must causally change a named variable.

### CONSTRAINT
Selected rules are hard invariants.

If several constraints conflict, expose the conflict and resolve it procedurally instead of silently violating one.

### ECONOMY
Track:
- finite pools
- prices
- ownership
- permits
- debt
- depletion
- replenishment

### FAILURE
Trigger a real break and propagate consequences.

### AUTHORITY
Only the authorized controller may perform designated changes until control legally transfers.

### PROP
Keep physical-object state/history across sections.

The prompt also explicitly distinguishes:

- Audience Feedback from Addressee
- Economy from Constraint

---

# Procedural fallback

Procedural fallback now detects all six Job 15 dimensions.

STYLE receives a compact Structure / Control summary.

LYRICS / CONTROL receives explicit laws for:

- audience causality
- constraint enforcement
- resource accounting
- failure propagation
- valid authority
- persistent object state

These rules therefore remain active during model/API fallback.

---

# Example combinations

## HELL GAME SHOW RESOURCE DISASTER

- FORMAT = 90s Game Show
- WORLD = Hell
- AUDIENCE = Crowd Votes on Harmony
- CONSTRAINT = Three Strikes
- ECONOMY = Bass Frequencies Require Permits
- FAILURE = Bureaucratic Deadlock
- AUTHORITY = Bureaucratic Terminal
- PROP = Giant Button

The audience chooses harmony.

Bass needs permits.

Violations accumulate.

The terminal can deadlock.

The giant button remains a stateful high-stakes action.

## PSYCHIC HOTLINE WITH FINITE QUESTIONS

- FORMAT = 1-900 Hotline
- ROLE = Bad Psychic
- AUDIENCE = Callers Request Mutations
- CONSTRAINT = Questions Only
- ECONOMY = Questions Cost Tokens
- AUTHORITY = Caller
- PROP = Telephone

The caller controls changes, but every question spends a finite budget.

The telephone is simultaneously transmission medium and persistent prop without collapsing those jurisdictions.

## BROKEN FUTURE MUSEUM

- FORMAT = Museum Audio Guide
- TEMPORAL = Out-of-Order Records
- EPISTEMOLOGY = Reconstructing From Evidence
- FAILURE = Version Mismatch
- PROP = File Folder
- CONSTRAINT = Every Event Gets Explained Later

The archive contains incompatible versions.

Events arrive before explanations.

The folder physically accumulates the evidence needed to repair chronology.

## CROWD STEALS THE SONG

- AUDIENCE = Chant Steals the Anchor
- AUTHORITY = Audience
- CONSTRAINT = Anchor May Never Keep the Same Job
- ECONOMY = Motifs Pay Royalties
- FAILURE = Feedback Runaway

The audience can seize the anchor.

Every return changes its job.

Every reuse transfers resources.

Crowd reinforcement can eventually run away.

---

# Static verification

Verified:

- AUDIENCE: 25
- CONSTRAINT: 35
- ECONOMY: 24
- FAILURE MODE: 25
- CONTROL AUTHORITY: 25
- PROP: 25

Job 15 total:

**159**

Duplicate Job 15 IDs:

**0**

Previous total:

**841**

New populated Composition Lab total:

# **1000**

Confirmed:

- all six Job 15 libraries are registered
- cardinalities remain audience=1 / constraint=3 / economy=1 / failureMode=1 / controlAuthority=1 / prop=1
- master prompt contains the dedicated final Structure / Control block
- procedural fallback contains final Structure / Control handling
- all six Job 15 data files passed static quote/bracket balance inspection
- registry, prompt builder, and procedural fallback passed static quote/bracket balance inspection

A full package build was not executed from this environment.

---

# What is visible now?

Still the same answer:

**the dedicated Composition Lab controls are not open yet.**

That is intentional.

Jobs 9–15 populated the intelligence/data first.

Job 16 is now finally the UI job.

---

# Next planned job

## Job 16 — COMPOSITION LAB UI

Open the cabinets.

Planned interface should expose the populated dimensions as selectable, searchable, lockable controls while keeping the existing Little Guy + Reality Engine workflows intact.

Priorities:

1. clear domain grouping:
   - VOICE LAB
   - SIGNAL LAB
   - SONIC LAB
   - STRUCTURE / CONTROL LAB

2. dimension tabs / filters

3. search across the **1000 populated Composition engines**

4. per-dimension cardinality enforcement

5. special multi-select experiences:
   - Sound Palette: up to 8
   - Constraints: up to 3
   - Rhythm Physics: up to 2
   - Role Exchange: up to 2
   - Transduction: up to 2
   - Recording Damage: up to 2
   - Gesture: up to 2

6. randomize:
   - one dimension
   - one domain
   - full Composition Lab

7. locks so randomization preserves chosen mechanisms

8. selected-engine strip / readable stack summary

9. clear/reset controls

10. mobile layout that does not become a 1000-button nightmare

11. preserve:
   - request transport
   - saves
   - archive
   - feedback
   - fallback
   - old saved runs

Job 16 is where the user should finally start **seeing all this shit**.
