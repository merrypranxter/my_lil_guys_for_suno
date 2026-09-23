# Job 11 — Voice Topology / Addressee / Physical Gesture Handoff

Status: COMPLETE

## What shipped

Job 11 populates the remaining three VOICE LAB dimensions planned for this phase:

- **ADDRESSEE / RELATIONSHIP**
- **ENSEMBLE / VOICE TOPOLOGY**
- **PHYSICAL GESTURE / BODY**

New runtime files:

- `src/data/voiceAddressees.ts`
- `src/data/voiceEnsembles.ts`
- `src/data/voiceGestures.ts`

Updated:

- `src/data/compositionEngines.ts`
- `src/lib/buildGenerationPrompt.ts`
- `src/lib/proceduralGenerator.ts`

---

# Counts

ADDRESSEE engines:

**37**

ENSEMBLE / VOICE TOPOLOGY engines:

**39**

PHYSICAL GESTURE engines:

**35**

New Job 11 engines:

**111**

Previous populated Composition Lab engines:

**336**

Current populated Composition Lab total:

**447**

Duplicate IDs across all currently populated Composition Lab content:

**0**

Cardinality remains:

- addressee: 0–1
- ensemble: 0–1
- gesture: 0–2

---

# ADDRESSEE / RELATIONSHIP

The Addressee dimension answers:

> WHO does the song believe it is talking to, and how does that change what can be assumed, explained, hidden, requested, repeated, translated, or strategically withheld?

This is not the same as ROLE.

ROLE is the speaker's job / obligation.

ADDRESSEE is the receiving relationship.

Example:

- ROLE = Customer Support Rep
- ADDRESSEE = Customer

is different from:

- ROLE = Customer Support Rep
- ADDRESSEE = Boss

The same job now reports upward instead of serving outward.

---

# Addressee engines

Examples include:

- lover / intimate partner
- enemy / adversary
- jury
- customer
- caller on hold
- dead relative
- future self
- past self
- deity / ultimate authority
- machine / system
- animal
- entire species
- person who cannot hear this
- audience that keeps misunderstanding
- trainee / new hire
- inanimate object
- unborn / not-yet-existing listener
- future archaeologist
- boss / supervisor
- subordinate / crew
- clone / duplicate self
- alien observer
- witness
- childhood self
- anonymous caller
- lost civilization
- distant descendants
- one specific stranger
- hostile crowd
- adoring audience
- person operating the recording
- unknown rescuer
- committee
- own body
- previous version of the song
- listener after the disaster
- no one / empty room

Every card changes information policy.

Examples:

### JURY

The singer distinguishes:
- claim
- evidence
- credibility
- causal link
- anticipated objection

### MACHINE / SYSTEM

The singer shifts toward:
- explicit commands
- parameters
- retries
- status checks
- disambiguation

### FUTURE SELF

The singer can use:
- warning
- prediction
- memory test
- future accountability
- instructions for later

### AUDIENCE THAT KEEPS MISUNDERSTANDING

The audience's recurring error forces:
- clarification
- redefinition
- rephrasing
- repair
- adaptation

---

# ENSEMBLE / VOICE TOPOLOGY

The Ensemble dimension answers:

> HOW MANY mouths exist, WHO owns which phrase or fact, WHO can interrupt, and HOW information moves between singers.

This is intentionally more structural than "solo / duet / choir".

Examples include:

- solo voice
- cooperative duet
- argumentative duet
- call and response
- Greek-chorus function
- four-part close harmony
- antiphonal choirs
- hocketed sentence
- relay narration
- speaker + unreliable interpreter
- swarm choir
- split-knowledge ensemble
- one body / many voices
- conflicting-memory choir
- lead voice gradually distributes
- unison → fracture
- round / canon
- whisper crowd
- rotating soloist
- questioner + responder panel
- telephone-chain voices
- choir inside choir
- leader + distorted echo group
- simultaneous translation choir
- crowd murmur → consensus
- one word per singer
- staggered entrance field
- live voice + recorded double
- majority / minority choir
- shared breath budget ensemble
- last-word inheritance
- register-segregated ensemble
- vocal rhythm section
- fact / rumor choir
- soloist with choir veto
- vanishing ensemble
- recruiting ensemble
- random-access voice bank
- echo choir with memory loss

---

# Strong Voice Topology examples

## HOCKETED SENTENCE

No one singer owns the sentence.

Meaning exists only through:
- timing
- handoff
- phrase segmentation
- ensemble coordination

## SPLIT-KNOWLEDGE ENSEMBLE

Each singer knows only a subset of the truth.

A voice cannot state information it has not received.

This gives later Job 17 a strong chemistry seam with EPISTEMOLOGY.

## ONE BODY / MANY VOICES

Several vocal agents share:
- one mouth
- one respiratory system
- one physical timing resource

They therefore cannot act as magically independent tracks without consequence.

## LIVE VOICE + RECORDED DOUBLE

One performer can adapt.

The recorded earlier self cannot.

The asymmetry creates actual temporal friction.

## TELEPHONE-CHAIN VOICES

Each singer hears only the singer immediately before them.

Information mutation is therefore local and cumulative.

## CHOIR WITH CONFLICTING MEMORIES

Different sections preserve incompatible versions of the same event.

The ensemble can harmonize musically while disagreeing factually.

---

# PHYSICAL GESTURE / BODY

The Gesture dimension answers:

> WHAT are performers physically doing, and HOW does that movement alter rhythm, breath, articulation, control, or form?

Job 10 already included body-based **Sound Sources**.

Job 11 deliberately does something different.

## Sound Source

Defines sonic material.

Example:

`TONGUE / MOUTH CLICKS`

means:
- dry percussive transient
- mouth-cavity timbre
- potential rhythmic source

## Gesture

Defines physical behavior over time.

Example:

`NON-LEXICAL TONGUE-CLICK RHYTHM`

means:
- where clicks occur
- how they function rhythmically
- how performers coordinate them
- how they remain distinct from lexical click consonants

That jurisdiction separation is intentional.

---

# Gesture engines

Examples include:

- hand-clap grid
- stomp / floor resonance
- footstep meter
- breath-gated phrasing
- group inhale trigger
- gasp interruption
- non-lexical tongue-click rhythm
- teeth-chatter tremolo
- chest / torso percussion
- thigh / hand-slap pattern
- finger-snap lattice
- hand-rub friction
- mouth-pop grid
- whisper motion
- tap-dance footwork
- heel / toe alternation
- pacing loop
- circular body motion
- weight-shift meter
- knee-slap counterbeat
- rhythmic jaw / chewing cycle
- object handoff rhythm
- reach / retract trigger
- hand shape ↔ vowel shape
- head-turn phrase control
- stand / sit form switch
- motion freeze
- synchronized bow / dip
- pointing passes the beat
- body-resonance hum
- breath hocket
- contact pulse
- motion-driven accelerando
- exertion / exhaustion decay
- mirrored gesture pair

---

# Physical plausibility rule

Gesture cards are required to remain physically plausible.

Examples:

## THIGH / HAND-SLAP PATTERN

The generator is told not to schedule impossible simultaneous hits for one performer.

## BREATH-GATED PHRASING

Long lines incur real breath cost.

Recovery may require:
- silence
- shorter text
- singer handoff
- staggered breathing

## MOTION-DRIVEN ACCELERANDO

Human motion controls event rate.

When the performer reaches a plausible movement ceiling, the music must:
- plateau
- redistribute
- or break

rather than assuming infinite acceleration.

## EXERTION / EXHAUSTION DECAY

Repeated safe movement may gradually reduce:
- precision
- timing
- breath availability
- amplitude

The card explicitly avoids injury simulation as the mechanism.

---

# Prompt-builder update

The master generation prompt now contains a dedicated:

## VOICE TOPOLOGY / ADDRESSEE / BODY

block.

It explicitly tells generation:

### ADDRESSEE

Must change:
- assumption
- disclosure
- withholding
- explanation
- repetition
- request strategy

not merely pronouns.

### ENSEMBLE

Must change:
- phrase ownership
- information distribution
- turn-taking
- interruption
- overlap
- memory
- vocal authority

not merely voice count.

### GESTURE

Must change:
- timing
- breath
- articulation
- body percussion
- movement
- handoff
- physical resource use

not merely stage direction.

The prompt also explicitly separates:

- **Sound Source = sonic material**
- **Gesture = body behavior over time**

---

# Procedural fallback update

Procedural fallback now detects:

- one active addressee
- one active ensemble topology
- up to two active gestures

STYLE receives a Voice Topology summary.

LYRICS / CONTROL receives explicit instructions for:

- addressee disclosure behavior
- ensemble phrase / information distribution
- physical gesture consequences

This means the Voice Lab does not vanish during API failure.

---

# Example combinations

## CUSTOMER SUPPORT FROM HELL

- ROLE = Customer Support Rep
- ADDRESSEE = Caller on Hold
- ENSEMBLE = Speaker + Unreliable Interpreter
- GESTURE = Breath-Gated Phrasing

Now the support rep must:
- provide periodic hold updates
- survive mistranslation
- manage finite breath
- remain in service-role jurisdiction

## MOTHMAN PANEL SHOW

- SPECIES = Mothman
- FORMAT = Weather Forecast
- ADDRESSEE = Hostile Crowd
- ENSEMBLE = Questioner + Responder Panel
- GESTURE = Pointing Passes the Beat

The crowd resists.
The panel disagrees.
Pointing controls who may speak next.

## FUTURE-SELF RECORDING

- ADDRESSEE = Future Self
- ENSEMBLE = Live Voice + Recorded Double
- GESTURE = Motion Freeze

The current singer can react to a frozen earlier recording while bodily stillness suspends one musical process.

## PHONE TREE MUTATION

- ADDRESSEE = Audience That Keeps Misunderstanding
- ENSEMBLE = Telephone-Chain Voices
- LANGUAGE MODE = Code-Switch

Every local handoff can mutate the message while the final audience keeps forcing repair.

## ONE-LUNG CHOIR

- ENSEMBLE = Shared Breath Budget
- GESTURE = Breath Hocket
- GESTURE = Group Inhale Trigger

The ensemble now has an actual respiratory economy before Job 15 even adds formal resource engines.

---

# Static verification

Verified:

- ADDRESSEE: 37 cards
- ENSEMBLE: 39 cards
- GESTURE: 35 cards
- Job 11 total: 111
- correct dimension on every Job 11 card
- duplicate Job 11 IDs: 0
- populated Composition Lab IDs after Job 11: 447
- duplicate IDs across all populated Composition Lab data: 0
- registry imports / spreads all three Job 11 libraries
- prompt builder contains Voice Topology / Addressee / Body block
- procedural fallback contains Voice Topology handling
- cardinality remains addressee=1 / ensemble=1 / gesture=2
- Job 11 TypeScript files passed static quote / bracket balance inspection

A full package build was not executed from this environment.

---

# What is not visible yet

Still expected:

**Job 16 is the Composition Lab UI.**

Job 11 fills the Voice Lab cabinet.

It does not open the cabinet on screen yet.

The data is already registered and supported by the existing:

- composition ID transport
- persistence
- saved stacks
- archive
- server generation
- browser fallback
- server fallback

---

# Next planned job

## Job 12 — SIGNAL LAB

Populate:

### TRANSMISSION / MEDIA
telephone, 1-900, voicemail, answering machine, PA, CB, walkie-talkie, scanner, shortwave, satellite relay, radio telescope, pager, wax cylinder, livestream, alien carrier wave, etc.

### TRANSLATION / TRANSDUCTION
words → Morse, vowel height → pitch, color → chord, body motion → filter, certainty → consonance, mistranslation → mutation, etc.

### RECORDING / DAMAGE
tape chew, wow/flutter, head switching, scratched-CD loops, MP3 smear, packet loss, feedback, dying microphone, bad noise gate, splice scars, etc.

### HISTORICAL TECHNOLOGY
acoustic horn, shellac era, tape laboratory, 1950s radio studio, 1980s VHS/cassette, 1990s sampler/dial-up, ringtone/MP3 era, modern digital studio, speculative alien codec.
