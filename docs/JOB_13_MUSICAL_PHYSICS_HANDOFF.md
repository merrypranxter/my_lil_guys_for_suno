# Job 13 — Musical Physics Handoff

Status: COMPLETE

## What shipped

Job 13 populates all four MUSICAL PHYSICS dimensions:

- **TUNING / PITCH WORLD**
- **RHYTHMIC PHYSICS**
- **STAGE GEOMETRY / SPATIAL AUDIO**
- **MUSICAL ROLE EXCHANGE**

New runtime files:

- `src/data/sonicTuning.ts`
- `src/data/sonicRhythmPhysics.ts`
- `src/data/sonicSpatialAudio.ts`
- `src/data/sonicRoleExchange.ts`

New research / fidelity ledger:

- `docs/MUSICAL_PHYSICS_SOURCE_LEDGER.md`

Updated:

- `src/data/compositionEngines.ts`
- `src/lib/buildGenerationPrompt.ts`
- `src/lib/proceduralGenerator.ts`

---

# Counts

TUNING / PITCH WORLD engines:

**32**

RHYTHMIC PHYSICS engines:

**43**

STAGE GEOMETRY / SPATIAL AUDIO engines:

**31**

MUSICAL ROLE EXCHANGE engines:

**34**

New Job 13 engines:

**140**

Previous populated Composition Lab engines:

**588**

Current populated Composition Lab total:

**728**

Duplicate Job 13 IDs:

**0**

All Job 13 IDs use dimension-specific prefixes not used by the previously populated Composition dimensions.

Cardinality remains:

- tuning: 0–1
- rhythmPhysics: 0–2
- spatialAudio: 0–1
- roleExchange: 0–2

---

# TUNING / PITCH WORLD

Tuning answers:

> WHAT pitch coordinate system exists before melody/harmony even begin?

The generator is now explicitly told:

> Do not write ordinary 12-TET material and sprinkle microtonal words over it.

The tuning system must change actual interval behavior.

First-pass cards include:

- 12-TET
- 5-limit just intonation
- 7-limit just intonation
- 11-limit just intonation
- Pythagorean tuning
- 1/4-comma meantone
- 1/3-comma meantone
- 19-EDO
- 22-EDO
- 24-EDO / quarter-tone grid
- 31-EDO
- 41-EDO
- 53-EDO
- Bohlen–Pierce
- harmonic-series field
- subharmonic / undertone-derived field
- adaptive just intonation
- drifting reference pitch
- stretched octave
- compressed octave
- inharmonic spectral field
- bell-spectrum field
- pélog-informed non-equidistant collection
- sléndro-informed five-step field
- prime-limit lattice
- combination-tone targeting
- octave-free ratio field
- golden-ratio pitch ladder
- Fibonacci-ratio field
- two competing reference pitches
- quantizer morph
- rotating unequal collection

---

# Important tuning distinctions

## Bohlen–Pierce

The runtime card explicitly changes the recurrence interval from:

`2:1 octave`

to:

`3:1 tritave`

with a 13-step equal division in the common equal-tempered form.

That means the generator must stop treating octaves as the native identity relationship.

## Adaptive JI

Pitch values may move when harmonic context changes.

The system is not allowed to keep one equal-tempered pitch value and merely describe it as "pure".

## Drifting Reference Pitch

The whole pitch coordinate frame moves.

Internal intervals remain coherent.

This is deliberately different from random detuning.

## Pélog / Sléndro informed

These cards are carefully named:

- `PÉLOG-INFORMED`
- `SLÉNDRO-INFORMED`

They do **not** claim one universal fixed tuning for named Indonesian traditions.

The exact pitch collection is piece-specific.

---

# RHYTHMIC PHYSICS

Rhythm Physics answers:

> WHAT is the actual law of time?

First-pass systems include:

- Euclidean rhythm
- Euclidean complement
- additive meter
- long cycle
- tāla-inspired cycle accounting
- polymeter
- polyrhythm
- gradual phase shift
- discrete phase rotation
- tempo canon
- nested tuplets
- irrational / tuplet-derived meter
- pulse deletion
- pulse insertion
- co-prime cycle interlock
- prime-length cells
- Fibonacci grouping
- Thue–Morse rhythm
- Fibonacci-word rhythm
- L-system rhythm
- cellular-automaton rhythm
- stochastic event density
- Markov rhythm states
- accelerating loop
- decelerating loop
- metric modulation
- rotating accent mask
- rhythmic palindrome
- mirror / complement rhythm
- isorhythmic talea/color mismatch
- speech-derived meter
- body-derived pulse
- swing-ratio drift
- microtiming orbit
- ratcheting subdivision
- density wave
- Golomb-ruler onset spacing
- modulo-counter rhythm
- chaotic-map density
- breathing meter
- fractal subdivision
- competing entrainment clocks
- no master clock

---

# Important rhythm distinctions

## Polymeter vs Polyrhythm

These remain separate cards.

### POLYMETER

Different metric cycles share a pulse.

The cycles realign later.

### POLYRHYTHM

Different subdivision counts occupy the same time span.

The distinction is encoded into the runtime rules.

## Phase shifting

The library separates:

- gradual phase shifting
- discrete phase rotation

The first changes relative phase by a temporary tempo difference.

The second jumps one pattern by discrete offsets.

## Euclidean rhythm

The card requires explicit:

- `k` onsets
- `n` slots
- cyclic distribution

Rotation may move the pattern but cannot silently alter:
- onset count
- cycle length

## Tāla-inspired

The card deliberately abstracts:

- long cycle
- internal hierarchy
- subdivisions
- return point

It explicitly says not to claim a named traditional tāla without separate research.

---

# STAGE GEOMETRY / SPATIAL AUDIO

Spatial Audio answers:

> WHERE is every active source, and WHAT does movement or architecture do to the arrangement?

First-pass cards include:

- circle around listener
- rotating ensemble
- orbiting soloist
- approach / recede
- near / far layers
- opposing choirs
- two rooms
- room-to-room relay
- canyon call
- one shared microphone
- moving microphone
- distributed field
- concentric rings
- empty center
- immovable center source
- crossing paths
- spiral inward
- spiral outward
- vertical stack
- elevation carousel
- front / back alternation
- diagonal stage
- behind a wall
- doorway as spatial gate
- Doppler-like pass
- impossible distance
- acoustic shadow
- moving listener
- stereo mirror
- wide field → mono collapse
- mono point → expanding field

---

# Spatial anti-slop rule

Spatial Audio does not mean:

> wide stereo

Every card must alter:

- placement
- movement
- distance
- angle
- elevation
- occlusion
- room boundaries
- capture point
- or handoff behavior

Example:

## ONE SHARED MICROPHONE

This means performers physically compete for one capture point.

Balance changes through movement.

It is not a "vintage mono mic" effect preset.

---

# MUSICAL ROLE EXCHANGE

This dimension formalizes one of the project's strongest preexisting composition principles:

> systems can exchange JOBS without simply becoming one another.

First-pass cards include:

- melody → percussion
- percussion → melody
- drums → harmony
- harmony → rhythm
- rhythm → melodic contour
- bass narrates
- vocals → master clock
- noise → chord progression
- accompaniment takes lead
- lead → texture
- texture → lead
- timbre → form marker
- form → timbre
- audience → percussion
- silence → downbeat
- rests → melodic contour
- reverb → harmony
- echo → counterpoint
- noise floor → pulse
- room tone → drone
- breath → bass function
- consonants → drum kit
- vowels → harmony
- lyrics → conductor
- anchor → disruption
- ornament → anchor
- bass → percussion
- percussion → bass
- production artifact → hook
- feedback → bassline
- dynamics → melodic contour
- register → form
- space → rhythm
- rhythm → space

---

# Role-exchange fidelity rule

A valid exchange must include:

1. SOURCE SYSTEM
2. DESTINATION JOB
3. MOMENT / PHASE OF TRANSFER
4. enough preserved source identity to hear what changed

Example:

`MELODY → PERCUSSION`

is not satisfied by:

- muting the melody
- adding drums
- writing "melody becomes percussion"

It must preserve enough attack contour or phrase identity that the listener can recognize the former melody after pitch responsibility has been removed.

---

# Prompt-builder update

The master prompt now contains:

## MUSICAL PHYSICS / COORDINATE SYSTEM

It summarizes:

- active tuning
- up to two rhythm-physics engines
- active spatial-audio engine
- up to two role-exchange engines

Generation rules now explicitly say:

### TUNING
changes interval geometry.

### RHYTHM PHYSICS
changes:
- pulse
- cycle
- subdivision
- phase
- density
- alignment

### SPATIAL AUDIO
changes:
- placement
- movement
- distance
- angle
- elevation
- occlusion
- room relation

### ROLE EXCHANGE
transfers a real musical responsibility.

The prompt also states:

> these are causal laws, not vibe adjectives.

---

# Procedural fallback

Procedural fallback now detects:

- tuning
- rhythm physics
- spatial audio
- role exchange

STYLE receives a compact Musical Physics summary.

LYRICS / CONTROL receives explicit laws for:

- interval system
- active clocks/cycles
- placement/movement
- role transfer

This keeps Job 13 mechanisms alive during model/API fallback.

---

# Research basis

Source ledger:

`docs/MUSICAL_PHYSICS_SOURCE_LEDGER.md`

External references used for factual grounding include:

- Huygens-Fokker Foundation tuning-system documentation
- Godfried Toussaint / McGill material on Euclidean rhythms
- Steve Reich's own notes on phase-shifting processes
- Metropolitan Museum of Art collection records for pélog/sléndro-labeled Javanese instruments
- Wesleyan University material on South Indian solkattu / tāla

The ledger explicitly separates:

- externally grounded music-theory facts
- model-designed compositional operators

Examples of model-designed operators:

- Thue–Morse rhythm mapping
- L-system rhythm
- cellular-automaton rhythm
- chaotic-map density
- Fibonacci ratio field
- spatial geometry mechanisms
- most Role Exchange cards

These are creative systems, not claims about traditional musical practice.

---

# Example combinations

## GEORGIAN MACHINE CHOIR

- LANGUAGE = Georgian
- ENSEMBLE = Hocketed Sentence
- TUNING = 31-EDO
- RHYTHM = Additive Meter
- RHYTHM = Euclidean Rhythm

Now:
- clustered/ejective vocal articulation remains distinct
- sentence ownership is distributed across voices
- pitch lives in 31 divisions
- additive grouping governs meter
- Euclidean attacks govern another rhythmic layer

## SATURN ROTATING WORKOUT

- FORMAT = Workout VHS
- ROLE = Workout Instructor
- WORLD = Saturn
- SPATIAL = Rotating Ensemble
- RHYTHM = Body-Derived Pulse
- ROLE EXCHANGE = Vocals → Master Clock

The instructor's mouth/body now literally controls the timing while the ensemble rotates.

## DIAL-UP BELL UNIVERSE

- TRANSMISSION = Dial-up / modem-like channel
- TUNING = Bell-Spectrum Field
- DAMAGE = Packet Loss
- ROLE EXCHANGE = Noise → Chord Progression

Noise is not decoration:
- modem/noise behavior becomes harmonic function
- packet loss removes timed chunks
- pitch follows inharmonic bell geometry

## ONE-MIC HELL QUARTET

- WORLD = Hell
- ENSEMBLE = Four-Part Close Harmony
- SPATIAL = One Shared Microphone
- TUNING = 7-Limit JI
- ROLE EXCHANGE = Silence → Downbeat

The quartet must physically negotiate the microphone while tuning and negative-space pulse remain active.

## BOHLEN–PIERCE GAME SHOW

- FORMAT = 90s Game Show
- TUNING = Bohlen–Pierce
- RHYTHM = Rotating Accent Mask
- ROLE EXCHANGE = Audience → Percussion

The game-show surface remains recognizable while the pitch world no longer treats the octave as the native recurrence interval.

---

# Static verification

Verified:

- TUNING: 32 cards
- RHYTHMIC PHYSICS: 43 cards
- SPATIAL AUDIO: 31 cards
- ROLE EXCHANGE: 34 cards
- Job 13 total: 140
- correct dimension on every Job 13 card
- duplicate Job 13 IDs: 0
- expected populated Composition Lab total after Job 13: 728
- registry imports / spreads all four Job 13 libraries
- cardinalities remain tuning=1 / rhythmPhysics=2 / spatialAudio=1 / roleExchange=2
- prompt builder contains Musical Physics / Coordinate System block
- procedural fallback contains Musical Physics handling
- all Job 13 runtime files, registry, prompt builder, and procedural fallback passed static quote / bracket balance inspection

A full package build was not executed from this environment.

---

# What is not visible yet

Still expected:

**Job 16 is the Composition Lab UI.**

Job 13 fills the Musical Physics cabinet.

It does not open the cabinet on screen yet.

The data is already registered and travels through the existing Composition Lab:

- request transport
- persistence
- saves
- archive
- server generation
- browser fallback
- server fallback

---

# Next planned job

## Job 14 — TIME / SCALE / KNOWLEDGE

Populate:

### TEMPORAL ENGINE
- countdown
- reverse chronology
- nested loops
- verse moves earlier each return
- simultaneous timelines
- future voice interrupts present
- memory arrives before event
- causal-order reversal
- recurrence with mutation
- section aging forward / backward

### SCALE ENGINE
- subatomic
- molecular
- cellular
- anatomical
- organism
- room
- building
- neighborhood
- city
- planetary
- stellar
- galactic
- cosmological
- continuous zoom
- recursive scale nesting

### EPISTEMOLOGY / KNOWLEDGE
- omniscient but unable to explain
- absolutely certain but poorly informed
- reconstructing from evidence
- unreliable witness
- live instructions only
- outdated manual
- remembers future but not present
- each singer knows a different subset
- narrator knows procedure but not purpose
- listener knows more than speaker
- classified redaction
- information only becomes true once announced

Important distinction:

`TEMPORAL ENGINE` changes chronology.

`ALTERED STATE` changes subjective temporal experience.

`EPISTEMOLOGY` changes information access.

`HEADSPACE` changes attention/salience.

Keep those jurisdictions separate.
