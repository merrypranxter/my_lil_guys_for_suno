# Musical Physics Source Ledger

Status: Job 13 research ledger.

## Purpose

This document records the research basis and fidelity rules behind:

- `src/data/sonicTuning.ts`
- `src/data/sonicRhythmPhysics.ts`
- `src/data/sonicSpatialAudio.ts`
- `src/data/sonicRoleExchange.ts`

The Job 13 library is not a music-theory encyclopedia.

It is a set of **operational musical coordinate systems** for generation.

Each card must answer at least one of these questions:

- What pitch relationships are actually allowed?
- What clock/cycle/subdivision law governs time?
- Where do performers/sources exist physically?
- Which musical system is temporarily performing another system's job?

---

# Tuning / pitch-world sources

## Huygens-Fokker Foundation — Tuning Systems

https://huygens-fokker.org/en/tuningsystems/

Primary tuning-system reference for the first-pass equal-division and alternative-tuning cards.

The foundation's overview documents, among other systems:

- 12-tone equal temperament
- meantone systems
- 19-tone equal tuning
- 24-tone / quarter-tone equal tuning
- 31-tone equal tuning
- 41-tone equal tuning
- 53-tone equal tuning
- Bohlen–Pierce

The runtime abstractions preserve the main mathematical facts rather than copying historical prose.

Examples:

### 19-EDO

Runtime abstraction:

- octave divided into 19 equal steps
- finer chromatic distinctions than 12-TET
- useful meantone-adjacent behavior

### 24-EDO

Runtime abstraction:

- octave divided into 24 equal steps
- each step = 50 cents
- quarter-tones become native pitch steps rather than ornamental bends

### 31-EDO

Runtime abstraction:

- octave divided into 31 equal steps
- strong meantone relationship
- useful approximations of several low-prime intervals
- enharmonic distinctions need not collapse

### 53-EDO

Runtime abstraction:

- octave divided into 53 equal steps
- very close approximation of the pure fifth and many common just-ratio intervals

### Bohlen–Pierce

Runtime abstraction:

- repeating interval is 3:1, traditionally called the tritave
- common equal-tempered form divides the tritave into 13 equal steps
- octave equivalence is therefore not the native recurrence principle

The runtime card deliberately says:

> replace octave equivalence with tritave equivalence

rather than merely:

> use weird microtones

---

# Just intonation / ratio systems

The first pass includes:

- 5-limit just intonation
- 7-limit just intonation
- 11-limit just intonation
- Pythagorean tuning
- prime-limit lattice
- adaptive just intonation
- harmonic-series pitch field
- subharmonic / undertone-derived compositional field

Important wording rule:

`SUBHARMONIC / UNDERTONE-DERIVED FIELD` is described as a **mathematical compositional model**.

The runtime explicitly avoids claiming that ordinary acoustic bodies naturally emit a complete physical undertone series equivalent to the harmonic series.

---

# Spectral / inharmonic systems

The first pass includes:

- harmonic-series field
- inharmonic spectral field
- bell-spectrum field
- combination-tone targeting

These are mechanism-first.

Example:

`INHARMONIC SPECTRAL PITCH FIELD`

does not mean:

> make it metallic

It means:

- choose a source resonator/spectrum
- derive allowed pitch targets from its actual/imagined partial positions
- preserve the non-integer spacing as the harmonic grammar

---

# Pélog / sléndro wording policy

The runtime includes:

- `PÉLOG-INFORMED NON-EQUIDISTANT COLLECTION`
- `SLÉNDRO-INFORMED FIVE-STEP FIELD`

These are deliberately labeled **informed**, not universal tunings.

Reference layer:

The Metropolitan Museum of Art documents Javanese instruments tuned to named pélog and sléndro systems, including a saron panerus identified as sléndro-tuned and suling instruments identified as pélog.

Useful references:

https://www.metmuseum.org/art/collection/search/501374
https://www.metmuseum.org/art/collection/search/501345
https://www.metmuseum.org/art/collection/search/501347

Runtime anti-slop rule:

> Do not pretend there is one exact universal pélog or sléndro tuning shared by every ensemble/tradition.

Instead, those cards abstract only broad organizational ideas:

- pélog-informed = piece-specific unequal pitch collection
- sléndro-informed = piece-specific approximately even five-step organization

The exact pitch set is defined inside the generated piece.

---

# Rhythmic-physics sources

## Euclidean rhythm — Godfried Toussaint / McGill

Primary reference:

https://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf

Toussaint's paper shows how Euclidean/Bjorklund-style distribution can generate cyclic onset patterns by distributing a chosen number of attacks across a chosen number of slots as evenly as possible.

Runtime abstraction:

- choose integers k and n
- distribute k attacks across n steps
- preserve the cyclic pattern
- rotation changes phase, not the onset count/cycle length

The runtime deliberately does **not** claim that every rhythm in a musical culture is "really Euclidean".

The algorithm is used as a generative timing system.

Additional McGill reference:

https://cgm.cs.mcgill.ca/~godfried/teaching/mir-reading-assignments/Rhythm-Generation.pdf

Used as background for:
- cyclic rhythm geometry
- complement/interlock ideas
- algorithmic onset organization

---

## Gradual phase shifting — Steve Reich

Primary reference:

https://stevereich.com/composition/piano-phase/

Reich's description of `Piano Phase` explains the central process:

- two identical repeating patterns begin together
- one remains stable
- the other gradually increases tempo enough to move ahead
- a new phase relationship is reached and stabilized

The runtime card abstracts the **process**:

`GRADUAL PHASE SHIFT`

It does not attempt to imitate a specific composition.

Related references:

https://stevereich.com/composition/violin-phase/
https://stevereich.com/composition/clapping-music/

These support the distinction between:

- gradual phase shifting
- discrete stepwise phase rotation

The runtime therefore has separate cards for those two mechanisms.

---

# Tāla-inspired wording policy

The runtime card is named:

`TĀLA-INSPIRED CYCLE ACCOUNTING`

not:

`TĀLA`

because it intentionally abstracts only a structural idea.

Wesleyan University describes solkattu as a spoken-syllable and hand-gesture system used to teach/communicate rhythmic ideas in South Indian performing arts and explicitly connects it to understanding Karnatak tāla / meter.

References:

https://www.wesleyan.edu/music/ensembles/south_indian_percussion.html
https://wesomeka.wesleyan.edu/vim2/items/show/17

Runtime abstraction:

- long repeating cycle
- explicitly marked subdivisions
- return point
- internal hierarchy

The card explicitly says:

> do not claim to reproduce a named tāla or performance tradition unless separately researched

This prevents one generic "Indian rhythm" button.

---

# Mathematical / algorithmic rhythm systems

The first pass also includes creative/model-derived algorithmic systems:

- Fibonacci grouping
- Thue–Morse
- Fibonacci word
- L-system rhythm
- cellular-automaton rhythm
- stochastic event density
- Markov rhythm states
- prime-length cycles
- co-prime cycle interlock
- modulo counters
- bounded chaotic-map density
- Golomb-ruler-like onset spacing
- fractal subdivision

These are **model-designed compositional operators**, not claims about traditional musical practice.

Where a card uses a mathematical object such as:
- Thue–Morse
- Fibonacci
- modulo arithmetic
- L-systems
- cellular automata

the musical mapping is explicitly defined inside the card.

No card claims that the mathematical sequence has inherent cultural or aesthetic superiority.

---

# Stage geometry / spatial audio

The spatial library is operational rather than source-history driven.

Examples:

- circle around listener
- rotating ensemble
- orbiting soloist
- near / far layers
- two rooms
- room-to-room relay
- canyon call
- one shared microphone
- moving microphone
- distributed field
- concentric rings
- empty center
- fixed center source
- crossing paths
- spiral inward / outward
- vertical stack
- front / back alternation
- occluded wall
- doorway gate
- Doppler-like pass
- impossible distance
- acoustic shadow
- moving listener
- mono collapse
- expanding field

These cards are primarily model-designed spatial composition mechanisms.

Important rule:

> spatial audio must change arrangement behavior, not just pan values.

Example:

`ONE SHARED MICROPHONE`

means:
- performers physically compete for proximity
- mix authority comes from movement
- simultaneous closeness creates crowding

not:

> apply mono vintage microphone effect

---

# Musical role exchange

The Role Exchange library formalizes an existing project principle:

> musical systems can exchange jobs without becoming one another.

Examples:

- melody → percussion
- percussion → melody
- drums → harmony
- harmony → rhythm
- bass narrates
- vocals → master clock
- noise → chord progression
- accompaniment → lead
- lead → texture
- texture → lead
- timbre → form marker
- audience → percussion
- silence → downbeat
- reverb → harmony
- echo → counterpoint
- noise floor → pulse
- room tone → drone
- consonants → drum kit
- vowels → harmony
- lyrics → conductor
- ornament → anchor
- production artifact → hook
- feedback → bassline
- space → rhythm
- rhythm → space

These are model-designed composition operators, not external musicological claims.

The central fidelity rule is:

> transfer the JOB while preserving enough of the source identity for the listener to hear the transfer.

Example:

`MELODY → PERCUSSION`

must preserve recognizable attack contour.

It is not satisfied by:
- muting the melody
- adding random drums
- saying "the melody became percussive"

---

# Cardinality

Job 13 uses the Job 8 cardinality design:

- tuning: 0–1
- rhythmPhysics: 0–2
- spatialAudio: 0–1
- roleExchange: 0–2

Why:

### Tuning

One active pitch coordinate system prevents accidental averaging of incompatible tuning laws.

### Rhythm Physics

Two systems can coexist if:
- they control different layers
- or different time scales

### Spatial Audio

One primary stage geometry prevents contradictory global scenes before Job 17 chemistry exists.

### Role Exchange

Two exchanges can coexist when:
- directions are explicit
- timing is explicit
- they do not silently swap every role at once

---

# Anti-slop rules

1. Tuning changes actual interval geometry.
2. Microtonal does not mean random pitch bend.
3. Equal divisions must preserve their actual step grid.
4. Ratio systems must preserve ratio relationships.
5. Bohlen–Pierce does not use octave equivalence as its native recurrence.
6. Pélog/sléndro labels must remain variability-aware and non-universalizing.
7. Rhythmic physics requires a real clock/cycle/subdivision/process.
8. "Odd meter" is not enough to satisfy an algorithmic rhythm card.
9. Phase shifting must create changing relative phase.
10. Polymeter and polyrhythm are not interchangeable.
11. Spatial cards alter placement/motion/occlusion/depth, not generic stereo width.
12. Role Exchange must transfer a real musical job.
13. Source identity should remain traceable through the role transfer.
14. Math-derived systems are creative operators, not mystical claims.
15. Culture-linked terms are not genre stickers.
