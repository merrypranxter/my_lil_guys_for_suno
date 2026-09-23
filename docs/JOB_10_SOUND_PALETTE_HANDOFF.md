# Job 10 — Sound Palette / Instrument / Noise Library Handoff

Status: COMPLETE

## What shipped

Job 10 populates the SONIC LAB dimension:

- **SOUND PALETTE / SOURCE**

New structured source type:

- `SoundSourceProfile`

New runtime files:

- `src/data/soundSourceFactory.ts`
- `src/data/soundSourcesConventional.ts`
- `src/data/soundSourcesTraditional.ts`
- `src/data/soundSourcesExperimental.ts`
- `src/data/soundSourcesMachinesObjects.ts`
- `src/data/soundSourcesBioEnvironment.ts`
- `src/data/soundSources.ts`

New research ledger:

- `docs/SOUND_PALETTE_SOURCE_LEDGER.md`

Updated:

- `src/types.ts`
- `src/data/compositionEngines.ts`
- `src/lib/buildGenerationPrompt.ts`
- `src/lib/proceduralGenerator.ts`

---

# Counts

New Sound Source profiles:

**221**

Previous Composition Lab content engines:

- 104 language profiles
- 11 language performance modes

Current populated Composition Lab engine total:

**336**

Duplicate runtime IDs across populated Composition Lab content:

**0**

Sound Source cardinality remains:

**0–8 simultaneous sources**

---

# Category distribution

- conventional: 36
- electronic: 8
- regional / traditional: 63
- historical: 9
- experimental: 17
- synthesis: 12
- communications: 5
- machine: 21
- domestic object: 12
- industrial: 2
- body: 11
- animal: 10
- environment: 12
- resonance / acoustic-space sources: 3

This deliberately overweights unusual/regional/object/process-based materials instead of making the palette mostly guitar/piano/synth/drums.

---

# SoundSourceProfile architecture

Every source stores:

- `id`
- `name`
- `category`
- optional `origin`
- `excitation`
- `resonance`
- `behavior`
- `suggestedRoles`
- `tags`
- optional `sourceNotes`

Each profile is converted into a normal `CompositionEngine`.

This means Job 8 transport/persistence architecture remains unchanged while the future Job 16 UI can still access richer Sound Source metadata.

Helpers:

- `getSoundSourceProfile(id)`
- `searchSoundSourceProfiles(query)`

---

# Suggested musical roles

Sound Source profiles can suggest:

- ANCHOR
- PULSE
- BASS
- LEAD
- HARMONY
- DRONE
- TEXTURE
- ORNAMENT
- INTERRUPTION
- NOISE FLOOR
- TRANSITION
- SPACE

These are suggestions, not hard assignments.

Generation is now told to give each active source a **distinct job / register / behavior**.

With up to eight selected sources, the model is explicitly forbidden from making all eight play constantly.

---

# Conventional / familiar palette

Examples include:

- acoustic guitar
- clean electric guitar
- distorted electric guitar
- electric bass
- upright bass
- violin / viola / cello / bowed double bass
- concert harp
- mandolin
- banjo
- piano
- Rhodes
- Wurlitzer
- Hammond
- pipe organ
- accordion
- flute / piccolo
- clarinet / bass clarinet
- oboe / English horn / bassoon
- saxophones
- trumpet / trombone / horn / tuba
- timpani
- snare / kick / toms / cymbals
- marimba
- vibraphone

Even familiar instruments get operational behaviors instead of mere names.

Example:

`TROMBONE`

is not "add trombone".

Its card emphasizes:
- buzz-driven brass resonance
- slide-controlled continuous pitch
- glissando geometry
- pedal tones
- smeared counterpoint
- blunt chordal attacks

---

# Regional / traditional palette

The first pass contains 63 regionally/historically specific source profiles.

Examples:

- kora
- ngoni
- mbira
- balafon
- djembe
- talking drum
- udu
- shekere
- berimbau
- cuíca
- pandeiro
- charango
- zampoña
- quena
- erhu
- pipa
- guzheng
- yangqin
- dizi
- suona
- sheng
- guqin
- morin khuur
- shamisen
- koto
- shakuhachi
- taiko
- shō
- hichiriki
- sitar
- sarod
- sarangi
- tanpura
- tabla
- bansuri
- shehnai
- santoor
- veena
- mridangam
- ghatam
- kanjira
- nadaswaram
- oud
- qanun
- ney
- darbuka
- riq
- duduk
- zurna
- Persian santur
- kamancheh
- bağlama / saz
- hurdy-gurdy
- nyckelharpa
- tagelharpa
- uilleann pipes
- cimbalom
- jaw-harp family
- khene
- gamelan metallophone family
- bonang
- gong ageng

## Cultural fidelity rule

Selecting an instrument does **not** automatically select:

- a nation
- a culture
- a genre
- a religion
- a ceremony
- a stereotyped "ethnic sound"

The source card contributes its physical/acoustic behavior.

Named performance traditions require separate research if later requested.

---

# Experimental / electronic / synthesis palette

Examples:

- theremin
- Ondes Martenot
- Daxophone
- waterphone
- musical saw
- glass harmonica
- Cristal Baschet
- prepared piano
- bowed piano strings
- bowed cymbal
- bowed vibraphone
- bowed gong
- superball friction on metal
- spring reverb tank as instrument
- sheet metal
- thunder sheet
- contact-mic surfaces
- amplifier feedback
- no-input mixer
- circuit-bent toys
- modular synthesis
- FM synthesis
- additive synthesis
- subtractive synthesis
- wavetable synthesis
- granular synthesis
- physical modeling
- ring modulation
- vocoder
- talk box
- Mellotron
- Optigan
- tape loop
- tape echo
- Trautonium lineage
- Clavioline
- Stylophone
- pulse-wave chip synthesis
- shift-register noise channel
- spectral freeze
- convolution resonator

The synthesis cards are mechanism-first.

Example:

`FM SYNTHESIS`

uses:
- carrier / modulator relationship
- sideband generation
- modulation ratio
- modulation index

rather than "metallic synth".

---

# Machines / communications / found objects

Examples:

- fax handshake
- dial-up modem
- DTMF
- busy signal
- pager beep
- CRT whine
- fluorescent ballast hum
- dot-matrix printer
- office copier
- typewriter
- adding machine
- cash register
- receipt printer
- barcode beep
- hard-drive seek
- floppy drive
- CD tray / spin-up
- VHS transport
- cassette transport
- sewing machine
- washing machine
- dryer
- refrigerator compressor
- microwave keypad
- blender
- vacuum cleaner
- fan
- radiator / heating pipes
- shopping cart
- metal trash can
- glassware
- bottles
- ceramic bowls
- silverware
- cardboard
- plastic bins
- key ring
- chain
- door hinge
- pneumatic air release

Machine cards preserve **process**.

Examples:

### Washing machine

Form can become:

`FILL → AGITATE → DRAIN → SPIN`

### Dot-matrix printer

- print density → rhythmic density
- carriage motion → pitch/sweep behavior
- line return → recurring formal event

### Modem

- dial
- answer
- probe
- negotiate
- carrier lock

can become the composition's event sequence.

---

# Body / biological / environment

Body:

- breathing
- heartbeat
- claps
- snaps
- footsteps
- stomps
- tongue/mouth clicks
- teeth chatter
- mouth pops
- whisper cloud
- synchronized group inhale

Animal:

- cicadas
- crickets
- bee swarm
- mosquito
- frog chorus
- raven/crow calls
- songbirds
- waterfowl flock
- whale calls
- dolphin click trains

Environment:

- rain on metal
- rain on glass
- thunder
- wind through wires
- wind through vents/gaps
- surf
- river over stones
- cave drips
- ice cracking
- fire crackle
- gravel
- pouring sand

Resonance / acoustic spaces:

- metal tank / silo resonance
- concrete stairwell
- long tunnel

These are process engines, not ambience wallpaper.

---

# Important jurisdiction distinction

## Mouth click Sound Source vs click Language

These are deliberately separate.

### LANGUAGE / PHONOLOGY click

Examples:
- Xhosa
- Khoekhoe
- Juǀʼhoan
- Taa

Jurisdiction:
- lexical consonant
- syllable structure
- tone/prosody interaction
- language phonology

### SOUND SOURCE: tongue / mouth clicks

Jurisdiction:
- non-lexical body percussion
- rhythmic transient
- vocal percussion texture

Job 17 can later create chemistry between them.

They are not currently collapsed into the same mechanism.

---

# Prompt-builder update

The master generation prompt now includes:

## SOUND PALETTE / SOURCE ASSIGNMENT

When sources are selected, generation receives:

- the selected source names
- each source's physical operational rule
- explicit role-separation instructions
- instruction to preserve excitation/resonance
- instruction not to run everything constantly
- instruction not to reduce culturally specific instruments to generic "world music"
- instruction to organize machine/object/animal/environment sources musically rather than as novelty SFX

A new global system directive states:

> selected sound sources are physical/acoustic systems, not genre stickers.

---

# Procedural fallback

Procedural fallback now detects all selected Sound Source engines.

It adds:

- SOUND PALETTE summary to STYLE
- a rough distinct role assignment to the generated control structure
- source-specific Composition Lab law lines

The fallback cycles role labels through:

- ANCHOR
- PULSE
- BASS
- LEAD
- TEXTURE
- ORNAMENT
- INTERRUPTION
- NOISE FLOOR

This is a fallback approximation only.

The AI generation path receives the richer per-source rules and may assign roles more intelligently.

---

# Research strategy

Source ledger:

`docs/SOUND_PALETTE_SOURCE_LEDGER.md`

Primary reference families:

- MIMO — Musical Instrument Museums Online
- Metropolitan Museum of Art — Department of Musical Instruments
- Smithsonian Folkways
- Ondes Martenot Archives
- Richard A. Waters instrument archive for waterphone
- Hans Reichel / Daxophone documentation context

The project uses these as validation/context.

Runtime cards are **creative acoustic abstractions**, not copied museum descriptions.

---

# What is not visible yet

Job 10 is data/intelligence.

The dedicated **Sound Palette rack UI** is still Job 16.

So after pulling this job you should not yet expect 221 new visible sound buttons.

The data is registered and can already travel through:

- Composition engine IDs
- persistence
- saved stacks
- archive
- Gemini prompt
- server fallback
- browser fallback

The UI is intentionally deferred until the Composition Lab content dimensions are populated.

---

# Static verification

Verified:

- conventional file: 40 profiles
- traditional/historical file: 64
- experimental/electronic/synthesis file: 41
- machine/object file: 40
- body/animal/environment/resonance file: 36

Total:

**221 Sound Sources**

Duplicate Sound Source IDs:

**0**

Current populated Composition Lab IDs:

**336**

Duplicate IDs across Language + Language Mode + Sound Source:

**0**

Confirmed:

- `SoundSourceProfile` type exists
- Sound Source aggregator exists
- lookup/search helpers exist
- registry includes `SOUND_SOURCE_ENGINES`
- soundSource cardinality remains 8
- prompt builder contains Sound Palette assignment rules
- procedural fallback contains source-role handling
- Job 10 TypeScript files passed lexical quote/bracket balance inspection

A full package build was not executed from this environment.

---

# Next planned job

## Job 11 — VOICE TOPOLOGY / ADDRESSEE / BODY

Populate:

### ADDRESSEE / RELATIONSHIP

Who the song believes it is speaking to.

### ENSEMBLE / VOICE TOPOLOGY

How many mouths exist, how phrases move among them, and who knows what.

### PHYSICAL GESTURE / BODY

Clapping, stomping, breathing, body resonance, clicks, footwork, mouth percussion, and related gestural mechanics.

Important:

The Job 10 body sounds are **sound-source timbres**.

Job 11 gesture cards will instead define **how bodies behave over time / interact with rhythm and form**.
