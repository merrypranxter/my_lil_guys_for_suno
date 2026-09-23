# Sound Palette / Instrument / Noise Source Ledger

Status: Job 10 research ledger.

## Purpose

This ledger documents the source strategy behind the first `SOUND PALETTE / SOURCE` library.

Runtime files:

- `src/data/soundSourceFactory.ts`
- `src/data/soundSourcesConventional.ts`
- `src/data/soundSourcesTraditional.ts`
- `src/data/soundSourcesExperimental.ts`
- `src/data/soundSourcesMachinesObjects.ts`
- `src/data/soundSourcesBioEnvironment.ts`
- `src/data/soundSources.ts`

The library is designed for **musically actionable behavior**, not catalog trivia.

Every Sound Source profile stores:

- excitation method
- resonant body / acoustic behavior
- compositional behavior
- suggested musical roles
- tags
- optional origin/context
- source notes

The runtime rule is:

> A sound source must do audible work. Merely naming an instrument, machine, animal, or object does not count.

---

# Current scope

First-pass Sound Source profiles:

**221**

Category distribution:

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
- resonance / acoustic space: 3

The `soundSource` dimension allows up to **8 simultaneous sources**.

The system therefore treats Sound Palette more like an instrument rack than a single dropdown.

---

# Main source families

## MIMO — Musical Instrument Museums Online

https://mimo-international.com/MIMO/

Used as the broadest museum/public-collection reference layer.

MIMO describes itself as a freely accessible database for instruments held in public collections and also publishes technical documentation including a revision of Hornbostel-Sachs classification.

Useful for:

- validating that named historical/traditional instruments are real distinct instrument types;
- instrument-family context;
- avoiding collapsing unrelated instruments into generic categories.

The runtime does **not** copy museum descriptions. It converts instrument mechanics into concise compositional behavior.

---

## The Metropolitan Museum of Art — Musical Instruments

https://www.metmuseum.org/departments/musical-instruments

The Met maintains a large historical/global musical-instrument collection spanning cultures and eras.

Used as a second reference layer for:

- global instrument diversity;
- historical instruments;
- construction/material context;
- instrument-family comparison.

The project uses acoustic behavior, not cultural costume, as the primary runtime mechanism.

---

## Smithsonian Folkways

World collection:
https://folkways.si.edu/world

Rare-instrument collection:
https://folkways.si.edu/musics-of-the-earth-astonishing-and-rare-instruments/world/music/album/smithsonian

Used especially as contextual support for:

- regional/traditional instruments;
- the fact that instruments are embedded in specific performance practices rather than interchangeable "world music" color;
- unusual acoustic materials and instrument-making traditions.

Runtime cards intentionally avoid assigning a complete cultural performance tradition based only on the instrument name.

---

# Specific experimental-instrument references

## Ondes Martenot

Ondes Martenot Archives:
https://ondes.net/
https://ondes.net/about/

Used to support the runtime profile's key mechanics:

- early electronic instrument lineage;
- continuous expressive pitch control;
- pressure/dynamic control;
- resonant diffuser / loudspeaker coloration.

The runtime card therefore treats it as an expressive continuous electronic line, not a generic "vintage synth".

---

## Waterphone

Richard A. Waters instrument archive:
https://www.richardawaters.com/instruments.php

Used to support:

- metal rods / resonant vessel;
- bowing / striking / friction possibilities;
- liquid movement changing resonance;
- unstable inharmonic metallic behavior.

The runtime card turns those physical mechanics into:

- moving metallic cluster
- water-driven pitch drift
- bowed/struck transition texture

rather than merely saying "horror sound".

---

## Daxophone

Hans Reichel / Daxophone references are used for the core mechanical description:

- friction-excited wooden tongue/blade;
- bow excitation;
- variable effective vibrating length;
- contact amplification;
- vocal / animal-like formant behavior.

The runtime card therefore treats the Daxophone as a **quasi-vocal wooden friction lead**, not a novelty sample.

---

# Traditional / regional instrument policy

The library intentionally includes many culturally specific instruments:

- kora
- mbira
- balafon
- talking drum
- berimbau
- erhu
- pipa
- guzheng
- sheng
- guqin
- morin khuur
- shamisen
- koto
- shakuhachi
- shō
- sitar
- sarod
- sarangi
- tanpura
- tabla
- bansuri
- veena
- mridangam
- ghatam
- oud
- qanun
- ney
- duduk
- kamancheh
- bağlama
- hurdy-gurdy
- nyckelharpa
- uilleann pipes
- khene
- gamelan metallophones
- bonang
- gong ageng
- and others

Important fidelity rule:

> Selecting an instrument does not automatically select a culture, genre, ceremony, religion, or national identity.

Example:

**GAMELAN METALLOPHONE FAMILY** may contribute:

- interlocking parts
- register stratification
- damping
- gong-cycle hierarchy

but the generator should not automatically claim it is performing an authentic named Indonesian genre unless that is separately requested and researched.

Similarly:

**SITAR** contributes:

- sympathetic resonance
- bends
- drone relationship
- bright buzzing bridge behavior

rather than "make it sound Indian".

---

# Experimental / synthesis policy

Experimental and electronic sources are also treated as causal systems.

Examples:

## FM synthesis

Operational mechanism:
- carrier/modulator interaction
- sideband generation
- modulation ratio/index changes

The card therefore changes spectrum through a known synthesis relationship rather than just saying "metallic synth".

## Granular synthesis

Operational mechanism:
- grain size
- density
- redistribution in time
- source-recognition continuum

The card can therefore move one source among:
- rhythm
- swarm
- freeze
- spectral mist

## No-input mixer

Operational mechanism:
- feedback routing
- self-oscillation
- nonlinear instability

The card uses state changes between:
- squeal
- pulse
- rumble
- clipping / chaos

rather than treating feedback as generic noise.

## Spectral freeze

Operational mechanism:
- freeze a spectral snapshot
- sustain a transient beyond its normal duration
- slowly mutate spectral components

This converts a moment into a drone rather than merely adding reverb.

---

# Machine / obsolete-technology policy

Machine sounds are not just retro props.

Examples:

## Dot-matrix printer

The runtime uses:
- print-head chatter
- data density
- carriage travel
- line return

as rhythm/form.

## Fax / modem

The runtime uses:
- handshake stages
- carrier
- chirps
- negotiation
- success/failure states

as event structure.

## VHS transport

The runtime uses:
- load
- transport
- head-drum / servo motion
- eject

as sectional mechanics.

## Washing machine

The runtime explicitly maps:
- fill
- agitate
- drain
- spin

onto form.

This is the desired pattern for machine sources:

> preserve the machine's real process and let that process organize music.

---

# Body / biological policy

Body and animal sounds are legitimate musical materials.

Examples:

- breath
- claps
- snaps
- footsteps
- stomps
- mouth clicks
- teeth chatter
- whispers
- group inhale
- cicadas
- crickets
- bee swarm
- frog chorus
- bird calls
- whale calls
- dolphin clicks

Important distinction:

`TONGUE CLICKS / MOUTH CLICKS` is a **body-percussion source**.

It is **not** the same thing as a lexical click consonant in a language such as Xhosa, Khoekhoe, Juǀʼhoan, or Taa.

The Language Engine retains jurisdiction over linguistic clicks.

The Sound Source engine retains jurisdiction over non-lexical body percussion.

That separation is deliberate.

---

# Environment / resonance policy

Environmental sources are modeled as processes.

Examples:

## Rain on metal

Control variables:
- droplet density
- strike material
- panel resonance

Musical output:
- stochastic pulse
- granular high-frequency texture

## Wind through wires

Control variables:
- wind speed
- wire tension
- aerodynamic excitation

Musical output:
- unstable aeolian drone
- beating / detuning

## Ice cracking

Control variables:
- fracture
- propagation
- sheet resonance

Musical output:
- sharp rupture
- dispersive chirp
- low groan

## Long tunnel resonance

Control variables:
- propagation distance
- reflection delay
- position

Musical output:
- echo-derived secondary meter
- comb filtering
- moving acoustic color

Again, the requirement is **process**, not ambience wallpaper.

---

# Suggested source roles

Every Sound Source can suggest one or more jobs such as:

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

The generator is explicitly instructed to assign separate jobs when several sources are active.

This prevents an eight-source palette from becoming eight nouns in one sentence.

---

# Known limitations

1. 221 sources are broad, not exhaustive.
2. A named traditional instrument can have many regional construction/performance variants.
3. Suggested roles are compositional possibilities, not claims about traditional usage.
4. Some machine/environment cards are process abstractions rather than fixed "instrument" objects.
5. Animal/environment recordings depend heavily on species, microphone, distance, and habitat.
6. Job 13 will later add tuning/rhythmic/spatial systems that can further constrain these sources.
7. Job 17 will add cross-domain chemistry such as Language × Sound, Tuning × Instrument, and Rhythm × Gesture.
8. The dedicated Sound Palette rack UI remains Job 16.

---

# Runtime anti-slop rules

1. Preserve physical excitation.
2. Preserve resonant behavior.
3. Give every selected source a musical job.
4. Do not run every source constantly.
5. Do not use "world music" as a substitute for instrument mechanics.
6. Do not infer a whole culture from one instrument.
7. Machine sounds should preserve process/state transitions.
8. Environment sounds should preserve physical process.
9. Body sounds remain distinct from language phonemes unless explicitly coupled later.
10. Found objects must be organized rhythmically/spectrally/causally rather than used as random novelty.
11. Multiple sources require register/role separation.
12. Weird source does not automatically mean horror.
