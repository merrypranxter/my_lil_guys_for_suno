# Job 12 — Signal Lab Handoff

Status: COMPLETE

## What shipped

Job 12 populates all four SIGNAL LAB dimensions:

- **TRANSMISSION / MEDIA**
- **TRANSLATION / TRANSDUCTION**
- **RECORDING / DAMAGE**
- **HISTORICAL TECHNOLOGY**

New runtime files:

- `src/data/signalTransmission.ts`
- `src/data/signalTransduction.ts`
- `src/data/signalRecordingDamage.ts`
- `src/data/signalTechnology.ts`

Updated:

- `src/data/compositionEngines.ts`
- `src/lib/buildGenerationPrompt.ts`
- `src/lib/proceduralGenerator.ts`

---

# Counts

TRANSMISSION / MEDIA engines:

**33**

TRANSLATION / TRANSDUCTION engines:

**37**

RECORDING / DAMAGE engines:

**36**

HISTORICAL TECHNOLOGY engines:

**35**

New Job 12 engines:

**141**

Previous populated Composition Lab engines:

**447**

Current populated Composition Lab total:

**588**

Duplicate IDs across all currently populated Composition Lab content:

**0**

Cardinality remains:

- transmission: 0–1
- transduction: 0–2
- recordingDamage: 0–2
- technology: 0–1

---

# TRANSMISSION / MEDIA

Transmission answers:

> HOW does the performance reach the listener, what information survives the channel, when can each side respond, and what does the medium itself permit?

Examples added:

- landline telephone
- 1-900 hotline
- voicemail
- answering machine
- public-address system
- intercom
- drive-thru speaker
- walkie-talkie
- CB radio
- scanner traffic
- AM radio
- shortwave
- pirate radio
- satellite relay
- radio-telescope receive-only
- baby monitor
- pager
- Morse radio
- cassette correspondence
- wax-cylinder message
- live stream
- broken video call
- voice note
- smart-speaker command channel
- emergency siren + voice
- airport gate microphone
- underwater acoustic link
- alien carrier wave
- dream broadcast
- extreme-latency radio
- one-way television
- numbers-station format
- museum headset / audio guide

Transmission is explicitly **not** treated as an EQ preset.

Examples:

### WALKIE-TALKIE

The channel is half-duplex.

Only one side can speak at a time.

That forces:
- explicit handoff
- clipped turns
- missed information if timing is wrong

### RADIO TELESCOPE

The receiving side does not know whether the source intended communication.

Therefore it must:
- integrate weak signal
- search repetition
- infer structure
- distinguish source from noise

### EXTREME-LATENCY RADIO

Replies can arrive years or centuries later.

The message must survive:
- obsolete context
- dead participants
- language drift
- irreversible decisions made before reply

---

# TRANSLATION / TRANSDUCTION

Transduction answers:

> WHAT source variable is converted into WHAT musical variable?

Every card requires a stable mapping.

Examples:

- words → Morse rhythm
- vowel height → pitch
- vowel backness → spatial position
- consonant attack → percussion
- sentence length → meter
- syllable count → subdivision
- color → chord
- brightness → register
- shape → rhythm
- body motion → filter
- body height → pitch
- distance → loudness
- temperature → tempo
- heart rate → tempo
- breath length → phrase length
- semantic certainty → consonance
- truth status → noise
- affect value → timbre
- word rarity → register
- number → pitch class
- number → duration
- date → meter
- name → melodic hash
- punctuation → rests
- capitalization → dynamics
- grammar → harmony
- question status → pitch transformation
- mistranslation → structural mutation
- confidence → event rate
- crowd volume → harmony
- applause density → tempo
- redaction → silence
- location label → reverb space
- time of day → spectral filter
- error count → instrument loss
- memory confidence → volume
- seed value → orchestration

## Important rule

The mapping must be inferable from repeated examples.

A transduction card is not permission to say:

> the color feels like a chord

It must actually define:
- source variable
- target parameter
- direction / lookup
- repeated causality

Two transduction cards may coexist.

The prompt tells the generator to assign them different source/target variables so they do not erase each other.

---

# RECORDING / DAMAGE

Recording Damage answers:

> HOW does the captured medium or signal fail over time?

Examples:

- tape chew
- wow / flutter
- VHS tracking / head-switching damage
- signal dropout
- splice scars
- scratched-CD loop
- digital disc skip
- low-bitrate codec smear
- packet loss
- buffer underrun
- clock jitter
- bit-depth collapse
- sample-rate decimation
- digital clipping
- analog saturation
- dying microphone capsule
- loose cable
- ground hum
- RF interference
- feedback runaway
- bad noise gate
- over-aggressive denoising
- phase cancellation
- one-channel failure
- shellac crackle
- warped record
- stuck groove
- tape print-through
- partial tape erasure
- multigeneration copy loss
- pitch-correction misfire
- extreme time-stretch artifacts
- bad resampling / aliasing
- corrupted file
- multitrack sync drift
- room-tone mismatch

The prompt explicitly forbids:

> generic lo-fi smear

unless the selected damage specifically requires it.

Damage should have:
- onset
- cause / threshold / location
- propagation
- recovery or permanent scar

where relevant.

Examples:

### TAPE PRINT-THROUGH

A strong future or past event leaks faintly across adjacent tape layers.

The ghost must correspond to a real event elsewhere in the recording.

### BAD NOISE GATE

Quiet material gets cut:
- breaths
- consonants
- decays
- room tails

The repair tool itself becomes a rhythmic failure engine.

### SCRATCHED CD LOOP

A tiny exact fragment repeats mechanically until the transport:
- recovers
- skips
- or stops

This remains distinct from analog stuck-groove behavior.

---

# HISTORICAL TECHNOLOGY

Technology answers:

> WHAT operations are physically/technically available, expensive, scarce, irreversible, or impossible?

Examples:

- acoustic horn recording era
- early electrical recording
- shellac-disc production
- wire recorder
- 1950s tape laboratory
- 1950s radio studio
- four-track tape
- 1970s analog multitrack
- 1980s home cassette
- 1980s VHS workflow
- early MIDI / drum-machine studio
- 1990s hardware sampler
- 1990s digital tape multitrack
- dial-up / low-bandwidth internet
- MiniDisc
- early desktop DAW
- ringtone / tiny-mobile era
- early MP3 / file-share era
- live loop-pedal rig
- modern DAW
- phone-mic recording
- smartphone social-video audio
- cloud collaboration
- generative performance system
- limited-voice hardware synth
- groovebox / pattern sequencer
- modular live rig
- broadcast cart-machine workflow
- home reel-to-reel
- cassette Portastudio
- public-access TV studio
- karaoke machine
- speculative alien codec
- speculative memory crystal
- speculative periodic-state recorder

## Important distinction

Technology is not a production-era adjective.

It constrains available operations.

Example:

### FOUR-TRACK TAPE

Track count is scarce.

Therefore:
- instruments share tracks
- bouncing creates commitment
- later edits may be impossible
- overdub planning matters

### MODERN DIGITAL STUDIO

Editing capability is abundant.

Therefore the generator is told **not to fake historical scarcity** unless some separate selected constraint creates it.

### ALIEN CODEC

The system must decide:
- what alien perception preserves
- what human-audible properties it discards

and then apply that codec rule consistently.

---

# Signal Lab prompt intelligence

The master prompt now includes:

## SIGNAL LAB / INFORMATION PHYSICS

It summarizes:

- active transmission
- up to two active transductions
- up to two active recording-damage mechanisms
- active technology

Rules now state:

### TRANSMISSION
changes:
- who can hear
- when they hear
- bandwidth
- latency
- reply capability
- routing

### TRANSDUCTION
requires:
- stable source variable
- stable target variable
- repeatable mapping

### RECORDING DAMAGE
requires:
- timed failure
- cause / threshold / location where applicable
- propagation or recovery behavior

### TECHNOLOGY
controls:
- available operations
- track count
- storage
- editing
- bandwidth
- live workflow
- physical commitment

The prompt explicitly separates channel failure from recording-medium failure.

---

# Procedural fallback

Procedural fallback now detects:

- transmission
- transduction
- recording damage
- technology

STYLE receives a compact Signal Lab summary.

LYRICS / CONTROL receives explicit instructions to:

- enforce channel limitations
- repeat transduction mappings consistently
- schedule damage as real events
- respect the selected technology's workflow constraints

Signal Lab therefore remains active during API fallback.

---

# Example combinations

## HELL CALL CENTER OVER BAD RADIO

- ROLE = Customer Support Rep
- VENUE = Hell Call Center
- TRANSMISSION = Walkie-Talkie
- DAMAGE = Bad Noise Gate
- TECHNOLOGY = 1980s Home Cassette

Now:
- only one party can transmit at once
- low-level syllables get chopped
- tape workflow constrains editing
- customer-service obligations remain intact

## MOTHMAN SHORTWAVE WEATHER

- FORMAT = Weather Forecast
- SPECIES = Mothman
- TRANSMISSION = Shortwave Radio
- TRANSDUCTION = Temperature → Tempo
- DAMAGE = Radio-Frequency Interference

Weather data literally changes tempo while distant reception fades and unrelated signals intrude.

## FAXED VOCAL GEOMETRY

- LANGUAGE = Xhosa
- LANGUAGE MODE = Phonotactic Nonsense
- TRANSDUCTION = Consonant Attack → Percussion
- TRANSDUCTION = Vowel Height → Pitch
- TRANSMISSION = Fax / coded-data-like channel via selected media/sound sources later

The mouth becomes both drum controller and pitch controller under a separate signal architecture.

## LOST MESSAGE TO FUTURE SELF

- ADDRESSEE = Future Self
- TRANSMISSION = Cassette Correspondence
- DAMAGE = Tape Print-Through
- TECHNOLOGY = Cassette Portastudio

Future phrases can literally leak faintly into earlier moments because of the medium.

## ALIEN COMPRESSION

- SPECIES = Grey Alien
- TRANSMISSION = Alien Carrier Wave
- TECHNOLOGY = Speculative Alien Codec
- DAMAGE = Corrupted File

The signal's encoding assumptions are unknown, its codec preserves nonhuman priorities, and stored corruption then destroys parts of the decoded result.

---

# Static verification

Verified:

- TRANSMISSION: 33 cards
- TRANSDUCTION: 37 cards
- RECORDING DAMAGE: 36 cards
- TECHNOLOGY: 35 cards
- Job 12 total: 141
- correct dimension on every Job 12 card
- duplicate Job 12 IDs: 0
- populated Composition Lab IDs after Job 12: 588
- duplicate IDs across all populated Composition Lab data: 0
- registry imports / spreads all four Signal Lab libraries
- prompt builder contains Signal Lab / Information Physics block
- procedural fallback contains Signal Lab handling
- cardinalities remain transmission=1 / transduction=2 / recordingDamage=2 / technology=1
- Job 12 TypeScript data / registry / prompt-builder files passed static quote / bracket balance inspection
- procedural fallback lexical balance: OK

A full package build was not executed from this environment.

---

# What is not visible yet

Still expected:

**Job 16 is the Composition Lab UI.**

Job 12 fills the Signal Lab cabinet.

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

## Job 13 — MUSICAL PHYSICS

Populate:

### TUNING / PITCH WORLD
12-TET, just intonation, Pythagorean, meantone, 19/22/24/31-TET, Bohlen-Pierce, harmonic-series pitch fields, stretched/drifting systems, etc.

### RHYTHMIC PHYSICS
Euclidean rhythm, additive meter, long cycles, polymeter, phase shifting, tempo canon, nested tuplets, pulse deletion, stochastic density, accelerating/decelerating loops, etc.

### STAGE GEOMETRY / SPATIAL AUDIO
circle, distance layers, two rooms, opposing choirs, moving sources, rotating ensemble, shared microphone, distributed field, etc.

### MUSICAL ROLE EXCHANGE
melody becomes percussion, drums become harmony, bass narrates, vocals become clock, noise becomes chord progression, timbre becomes form marker, etc.
