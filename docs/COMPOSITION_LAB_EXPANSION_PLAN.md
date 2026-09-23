# Little Guy Machine — Composition Lab Expansion Plan

Status: PLANNED  
Starts after Job 7 (Smart Reality Chemistry).

## Why this exists

The Little Guy Machine now has three mature layers:

1. **LITTLE GUYS / MINDS** — how the song thinks.
2. **REALITY ENGINES** — where it is, who is speaking, what reality rules apply, and what state the consciousness is in.
3. **MUSICAL SYSTEM PROMPTING** — harmony, melody, rhythm, timbre, performance, anchor, operators.

The next expansion should not turn every new idea into another Reality card.

The new material belongs in a broader **COMPOSITION LAB**: independent operational axes that control language, mouths, communication, sound sources, tuning, time, scale, recording media, audience behavior, information access, failure, resource economics, and authority.

The governing rule stays the same:

> DO NOT BLEND EVERYTHING INTO VIBES. GIVE EACH LAYER A JURISDICTION AND MAKE THE LAYERS NEGOTIATE.

---

# New top-level architecture

## A. MIND

Existing Little Guys.

Jurisdiction:

- reasoning
- mutation
- causality
- ontology
- representation
- memory
- selection
- semantic transformation

## B. REALITY

Existing Reality Engine.

Dimensions:

- FORMAT
- ROLE
- WORLD
- SPECIES / ORIGIN
- VENUE
- HEADSPACE
- ALTERED STATE
- TONE

Jurisdiction:

- scenario
- speaker identity/job
- world rules
- embodiment
- local place
- consciousness state
- altered phenomenology
- delivery surface

## C. VOICE LAB

New.

Dimensions:

- LANGUAGE / PHONOLOGY
- LANGUAGE PERFORMANCE MODE
- ADDRESSEE / RELATIONSHIP
- ENSEMBLE / VOICE TOPOLOGY
- PHYSICAL GESTURE / BODY

Jurisdiction:

- what language system the mouth uses
- how that language influences English or code-switching
- who the voice believes it is addressing
- how many voices exist and how information is distributed between them
- how bodily sounds and gestures participate in the arrangement

## D. SIGNAL LAB

New.

Dimensions:

- TRANSMISSION / MEDIA
- TRANSLATION / TRANSDUCTION
- RECORDING / DAMAGE
- HISTORICAL TECHNOLOGY

Jurisdiction:

- how the performance reaches the listener
- how one representation is converted into another
- how the recording physically fails or degrades
- what technical capabilities and limitations exist in the production era

## E. SONIC LAB

New.

Dimensions:

- SOUND PALETTE / SOURCE
- TUNING / PITCH WORLD
- RHYTHMIC PHYSICS
- STAGE GEOMETRY / SPATIAL AUDIO
- MUSICAL ROLE EXCHANGE

Jurisdiction:

- what produces sound
- what pitch relationships exist
- what temporal grid / cycle governs pulse
- where sounds are positioned and how they move
- which musical system is temporarily doing another system's job

## F. STRUCTURE / CONTROL LAB

New.

Dimensions:

- TEMPORAL ENGINE
- SCALE ENGINE
- AUDIENCE FEEDBACK
- EPISTEMOLOGY / KNOWLEDGE
- CONSTRAINT / GAME RULE
- ECONOMY / RESOURCE
- FAILURE MODE
- CONTROL AUTHORITY
- OBJECT / PROP

Jurisdiction:

- how chronological time behaves
- what physical/conceptual scale the song operates at
- how listeners/crowds affect events
- what information the narrator has access to
- arbitrary laws the piece must obey
- what resources are finite or costly
- how the system breaks
- who is allowed to make changes
- what recurring physical object mediates the scenario

---

# Important architecture decision

Do **not** add twenty more values to `RealityDimension`.

Reality should remain semantically coherent.

Create a generalized second registry for Composition Lab cards while preserving the existing Reality Engine API for backwards compatibility.

Suggested shape:

```ts
export type CompositionDomain =
  | 'voice'
  | 'signal'
  | 'sonic'
  | 'structure';

export type CompositionDimension =
  | 'language'
  | 'languageMode'
  | 'addressee'
  | 'ensemble'
  | 'gesture'
  | 'transmission'
  | 'transduction'
  | 'recordingDamage'
  | 'technology'
  | 'soundSource'
  | 'tuning'
  | 'rhythmPhysics'
  | 'spatialAudio'
  | 'roleExchange'
  | 'temporal'
  | 'scale'
  | 'audience'
  | 'epistemology'
  | 'constraint'
  | 'economy'
  | 'failureMode'
  | 'controlAuthority'
  | 'prop';

export interface CompositionEngine {
  id: string;
  domain: CompositionDomain;
  dimension: CompositionDimension;
  name: string;
  subtitle: string;
  rule: string;
  shortExplanation: string;
  tags: string[];
  accentColor?: string;
  sourceNotes?: string[];
}
```

Generation should add a backwards-compatible field:

```ts
compositionEngineIds?: string[];
```

Reality IDs remain in:

```ts
realityEngineIds?: string[];
```

This keeps old saves valid.

---

# Special case: LANGUAGE is parameterized, not a dumb accent list

Language is too large and too structured to hard-code every possible combination as a separate card.

Create reusable **Language Profiles**.

Suggested model:

```ts
export interface LanguageProfile {
  id: string;
  name: string;
  family?: string;
  region?: string;
  phonologyNotes: string[];
  rhythmNotes: string[];
  consonantFeatures: string[];
  vowelFeatures: string[];
  prosodyFeatures: string[];
  distinctiveFeatures: string[];
  sourceNotes?: string[];
}
```

Then pair a profile with a separate performance mode.

Initial performance modes:

- SING IN NATIVE LANGUAGE
- ENGLISH WITH L1 PHONOLOGICAL TRANSFER
- CODE-SWITCH
- NATIVE LANGUAGE + ENGLISH REFRAIN
- ENGLISH + NATIVE INTERJECTIONS
- PHONOTACTIC NONSENSE USING LANGUAGE RULES
- FORMAL / CEREMONIAL REGISTER
- CONVERSATIONAL REGISTER
- RAPID PATTER
- CHANT / RECITATION
- CALL-AND-RESPONSE

This prevents a combinatorial explosion.

Example:

`XHOSA + ENGLISH WITH L1 PHONOLOGICAL TRANSFER`

is generated from:
- one Xhosa language profile
- one performance mode

rather than requiring a separate hand-authored "Xhosa English accent" card.

## Accent fidelity rule

Accent behavior must be **phonology-first, not stereotype-first**.

Use:
- consonant inventories
- click types where relevant
- rhotic behavior
- vowel inventory / reduction
- syllable timing
- stress / tone
- phonotactic constraints
- aspiration
- glottalization
- vowel length
- consonant clustering
- prosodic transfer

Do not use caricature spellings as the primary mechanism.

For obscure / underrepresented languages, research before claiming detailed phonology.

---

# Special case: SOUND PALETTE is multi-select

Sound Source should not be limited to one card.

Allow several simultaneous sonic materials, ideally with optional roles:

- ANCHOR
- PULSE
- BASS
- LEAD
- TEXTURE
- ORNAMENT
- INTERRUPTION
- NOISE FLOOR

Sound-source categories should include:

- common instruments
- regional / traditional instruments
- historical instruments
- experimental instruments
- invented / prepared instruments
- voice-derived sounds
- body percussion
- found objects
- machines
- domestic appliances
- industrial sounds
- animal / insect / environmental sound
- communications noise
- obsolete media noise
- synthesis methods
- acoustic resonances

The library should deliberately overrepresent unusual and culturally diverse sound sources rather than defaulting to guitar/synth/piano/drums.

---

# JOB PLAN

## JOB 8 — Composition Lab foundation / generic schema

Goal: build the infrastructure without changing the visible app much.

Implement:

- `CompositionDomain`
- `CompositionDimension`
- `CompositionEngine`
- registry scaffolding
- `compositionEngineIds` in requests, saved stacks, archived runs
- server sanitization
- local-storage persistence
- prompt-builder section for COMPOSITION LAB
- procedural-fallback plumbing
- backwards compatibility with every old save
- generic jurisdiction map
- empty registries are acceptable in this job

Also add support for multi-select dimensions where required.

Initial cardinality rules:

- language: 0–1 profile
- languageMode: 0–1
- addressee: 0–1
- ensemble: 0–1
- gesture: 0–2
- transmission: 0–1
- transduction: 0–2
- recordingDamage: 0–2
- technology: 0–1
- soundSource: 0–8
- tuning: 0–1
- rhythmPhysics: 0–2
- spatialAudio: 0–1
- roleExchange: 0–2
- temporal: 0–1
- scale: 0–1
- audience: 0–1
- epistemology: 0–1
- constraint: 0–3
- economy: 0–1
- failureMode: 0–1
- controlAuthority: 0–1
- prop: 0–1

Deliver:
- schema
- plumbing
- handoff
- no giant content dump yet

---

## JOB 9 — LANGUAGE / ACCENT / PHONOLOGY ENGINE

Goal: build a scalable vocal-language system.

Research and implement:

### Language profiles

Start broad but deliberately include unusual phonological systems.

Target:
- 80–120 language profiles in first pass
- expandable architecture

Include:
- widely used languages
- tonal languages
- pitch-accent systems
- click languages
- ejective-rich languages
- glottal-heavy systems
- highly agglutinative languages
- consonant-heavy languages
- vowel-rich languages
- unusual phonotactics
- endangered / minority languages where reliable public descriptions exist
- historical / liturgical languages where musically useful

Do not describe a language as "weird" in runtime metadata merely because it is unfamiliar.

### Performance modes

Implement the reusable modes listed above.

### Operational output

Language selection should be able to influence:

- sung language
- English pronunciation transfer
- vowel/consonant behavior
- syllabic density
- stress / timing
- melodic phrasing
- click / ejective / glottal / trill behavior where appropriate
- nonsense-vocal phonotactics

### Research ledger

Create:
- `docs/LANGUAGE_PHONOLOGY_SOURCE_LEDGER.md`

Use high-quality linguistic resources when possible.

Do not rely on accent stereotypes or comedy spellings.

---

## JOB 10 — SOUND PALETTE / INSTRUMENT / NOISE LIBRARY

Goal: massively widen what counts as an instrument.

Create the first large Sound Source library.

Target:
- 180–300 sources in first pass

Categories:

### Conventional
- strings
- brass
- winds
- keyboards
- drums
- electric / electronic instruments

### Regional / traditional
Examples to research:
- kora
- mbira
- balafon
- berimbau
- erhu
- morin khuur
- duduk
- qanun
- santur
- guzheng
- shakuhachi
- khene
- nyckelharpa
- tagelharpa
- uilleann pipes
- frame-drum families
- gamelan instrument families
- jaw-harp families
- overtone instruments

### Experimental / strange
- daxophone
- waterphone
- musical saw
- theremin
- ondes Martenot
- prepared piano
- bowed metal
- contact-mic objects
- resonant springs
- feedback systems
- circuit-bent toys

### Machines / obsolete technology
- fax
- modem
- dot-matrix printer
- copier
- cash register
- tape machine
- answering machine
- pager
- scanner
- fluorescent ballast
- CRT whine

### Domestic / object
- kitchen utensils
- shopping carts
- pipes
- glassware
- springs
- cardboard
- furniture
- doors
- tools
- bottles
- toys

### Biological / environmental
- insects
- frogs
- birds
- water
- wind
- ice
- rocks
- fire
- breathing
- footsteps
- teeth / tongue / hands / body

Each source must include **how it behaves musically**, not merely its name.

Create source ledger for unusual instruments where useful.

---

## JOB 11 — VOICE TOPOLOGY / ADDRESSEE / BODY

Implement three Voice Lab dimensions.

### ADDRESSEE / RELATIONSHIP

Examples:

- lover
- enemy
- jury
- customer
- caller on hold
- dead relative
- future self
- past self
- deity
- machine
- animal
- entire species
- person who cannot hear
- audience that misunderstands
- person being trained
- object
- unborn listener
- recording discovered centuries later

Operational rule:
the addressee changes what is explained, hidden, assumed, begged for, threatened, repeated, or translated.

### ENSEMBLE / VOICE TOPOLOGY

Examples:

- solo
- duet
- argumentative duet
- call-and-response
- Greek chorus
- barbershop quartet
- antiphonal choirs
- hocketed sentence across many singers
- relay narration
- unreliable interpreter + speaker
- swarm choir
- voices with different information access
- one body / multiple voices
- choir where each section remembers a different version
- lead voice gradually distributed into ensemble

### PHYSICAL GESTURE / BODY

Examples:

- clapping
- stomping
- footsteps
- breathing
- gasps
- tongue clicks
- teeth percussion
- chest percussion
- hand slaps
- tap dancing
- body resonance
- group inhalation
- whisper clouds
- mouth pops
- rhythmic chewing / object handling where musically appropriate

Body rules must become rhythm/timbre mechanics, not lyric decoration.

---

## JOB 12 — SIGNAL LAB

Implement:

### TRANSMISSION / MEDIA

Examples:

- telephone
- 1-900 line
- voicemail
- answering machine
- PA system
- drive-thru speaker
- CB radio
- walkie-talkie
- police scanner
- AM radio
- shortwave
- pirate radio
- satellite relay
- radio telescope
- intercom
- pager
- cassette correspondence
- wax cylinder
- livestream
- broken video call
- alien carrier wave

Each medium may:
- delay
- censor
- compress
- drop
- repeat
- gate
- distort
- mistransmit
information.

### TRANSLATION / TRANSDUCTION

Examples:

- words → Morse rhythm
- vowel height → pitch
- sentence length → meter
- color → chord
- clicks → percussion
- body motion → filter
- temperature → tempo
- legal clauses → intervals
- audience volume → harmony
- semantic certainty → consonance
- mistranslation → structural mutation

### RECORDING / DAMAGE

Examples:

- tape chew
- wow/flutter
- head switching
- clipping
- feedback
- scratched-CD loops
- warped shellac
- dying microphone capsule
- bad noise gate
- MP3 smear
- packet loss
- buffer underrun
- phase cancellation
- dropout
- splice scars
- corrupted pitch correction

Damage must create timed structural events.

### HISTORICAL TECHNOLOGY

Examples:

- acoustic horn recording
- early electrical recording
- shellac era
- tape laboratory
- 1950s radio studio
- 1970s broadcast
- 1980s home VHS / cassette
- 1990s dial-up / sampler
- early-2000s ringtone / MP3
- present digital studio
- speculative alien codec

Technology determines available operations and limitations.

---

## JOB 13 — MUSICAL PHYSICS

Implement:

### TUNING / PITCH WORLD

Initial set:

- 12-TET
- just intonation
- Pythagorean
- meantone families
- quarter-tone / 24-TET
- 19-TET
- 22-TET
- 31-TET
- Bohlen–Pierce
- overtone-derived tuning
- undertone-derived tuning
- stretched tuning
- drifting reference pitch
- unequal pitch collections
- pelog/slendro-informed organizational modes with careful wording
- spectral pitch fields

Avoid claiming one tuning as the universal form of a named musical culture.

### RHYTHMIC PHYSICS

Examples:

- Euclidean rhythm
- additive meter
- tala-inspired long cycles
- polymeter
- polyrhythm
- phase shifting
- tempo canon
- nested tuplets
- irrational subdivision
- pulse deletion
- cycle lengths that only realign after long periods
- speech-derived meter
- body-derived pulse
- stochastic event density
- accelerating/decelerating loops

### STAGE GEOMETRY / SPATIAL AUDIO

Examples:

- circle around listener
- distant/near layers
- vertical placement
- two rooms
- opposing choirs
- moving source
- rotating ensemble
- approach/recede
- impossible distance
- canyon call
- one shared microphone
- distributed field

### MUSICAL ROLE EXCHANGE

Examples:

- melody becomes percussion
- drums become harmony
- bass narrates
- vocals become clock
- noise becomes chord progression
- accompaniment takes lead
- harmony becomes rhythm
- audience becomes percussion
- timbre becomes form marker

This formalizes one of the user's most productive existing operator families.

---

## JOB 14 — TIME / SCALE / KNOWLEDGE

Implement:

### TEMPORAL ENGINE

Examples:

- countdown
- reverse chronology
- nested loops
- verse occurs earlier each return
- two simultaneous timelines
- future voice interrupts present
- memory arrives before event
- causal order reversal
- recurrence with one mutation
- section aging forward/backward
- time dilation / compression independent of altered-state cards

Distinction:
TEMPORAL ENGINE changes narrative/compositional chronology.
ALTERED STATE changes subjective temporal experience.

### SCALE ENGINE

Examples:

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

Scale must change causal vocabulary and available operations.

### EPISTEMOLOGY / KNOWLEDGE

Examples:

- omniscient but unable to explain
- absolutely certain but poorly informed
- reconstructing from evidence
- unreliable witness
- live instructions only
- outdated manual
- remembers future but not present
- each singer knows a different subset
- narrator knows the procedure but not the purpose
- listener knows more than speaker
- classified information redaction
- information only becomes true once announced

This controls information access, not headspace.

---

## JOB 15 — AUDIENCE / RULES / RESOURCES / FAILURE / AUTHORITY / PROP

Implement the remaining Structure / Control dimensions.

### AUDIENCE FEEDBACK

Examples:

- applause changes meter
- heckling changes lyrics
- crowd votes on harmony
- callers request mutations
- dancers force tempo
- judges remove instruments
- audience sings wrong refrain until adopted
- crowd silence freezes the form

### CONSTRAINT / GAME RULE

Examples:

- only three pitches
- every section loses one instrument
- every repeated noun mutates
- no sound may return unchanged
- each verse preserves one artifact
- forbidden interval
- exact symmetry requirement
- each eight bars two systems exchange roles
- one word may never be said
- every correction creates a new rule

Allow 0–3 simultaneous constraints.

### ECONOMY / RESOURCE

Examples:

- notes cost oxygen
- modulation costs memory
- bass frequencies require permits
- choir has finite syllables
- instruments barter for beats
- silence earns currency
- loudness consumes power
- every repeat depletes a resource

### FAILURE MODE

Examples:

- forgetting
- overheating
- mistranslation
- buffer overflow
- tuning drift
- performer replacement
- resource exhaustion
- desynchronization
- identity collision
- feedback runaway
- corrupted memory
- bureaucratic deadlock

### CONTROL AUTHORITY

Examples:

- conductor
- audience
- caller
- percussionist
- algorithm
- weather
- bureaucratic terminal
- dice
- youngest singer
- nonexistent supervisor
- authority rotates
- authority transfers when mistakes occur

### OBJECT / PROP

Examples:

- telephone
- menu
- clipboard
- receipt
- key
- suitcase
- wheel
- mirror
- cassette
- vending machine
- egg
- rope
- bell
- giant button
- map
- broken remote

The object should acquire functions across multiple layers rather than merely being mentioned.

---

## JOB 16 — COMPOSITION LAB UI

Build a new major panel without destroying the existing Reality Engine.

Suggested top navigation:

- VOICE
- SIGNAL
- SONIC
- STRUCTURE

Each opens its dimensions.

Required UI behavior:

- search
- selected strip
- locks
- per-dimension randomizer
- domain randomizer
- clear one / clear domain
- multi-select indicators for dimensions that allow multiple cards
- mobile horizontal tabs
- compact card descriptions
- expanded rule view on demand

Language gets a dedicated sub-interface:

- LANGUAGE PROFILE
- PERFORMANCE MODE

Sound Palette gets a dedicated multi-select rack with source roles.

Do not render hundreds of cards at once on mobile.

---

## JOB 17 — CROSS-DOMAIN CHEMISTRY

Generalize the smart-combiner idea from Reality Engine to the full machine.

Create chemistry across:

- Reality × Language
- Language × Sound
- Addressee × Ensemble
- Transmission × Recording Damage
- Technology × Sound
- Tuning × Instrument
- Rhythm Physics × Gesture
- Spatial Audio × Ensemble
- Temporal × Failure
- Constraint × Economy
- Control Authority × Audience
- Prop × Venue
- Mind × Composition Lab

Rules:

- affinity means mutually reinforcing mechanisms
- friction means incompatible demands
- friction is useful only if both jurisdictions remain legible
- high chaos seeks seams, not random nouns
- learned preference remains a soft signal

Add a **FULL STACK NARRATOR** capable of summarizing Minds + Reality + Composition Lab.

---

## JOB 18 — MUTATION CONTROLS / RECIPES / LEARNING

Add higher-level operations over the assembled stack.

Buttons / operations:

- CHANGE ONE THING
- MUTATE UNLOCKED
- MAKE IT WEIRDER
- MAKE IT WRONGER
- MORE SPECIFIC
- MORE MUNDANE
- MORE COSMIC
- MORE PHYSICAL
- MORE VOCAL
- MORE ACOUSTIC
- MORE ELECTRONIC
- TRASHIER
- CLEANER
- OLDER TECHNOLOGY
- NEWER TECHNOLOGY
- KEEP PREMISE / FUCK WITH EVERYTHING ELSE

Each mutation must specify **which dimensions it is allowed to alter**.

Do not implement them as prompt adjectives.

Example:

`MORE MUNDANE`

should move:
- world / venue toward ordinary infrastructure
- props toward domestic objects
- role toward normal service labor
while preserving weird minds / altered state if locked.

### Recipes

Add reusable launch configurations.

Examples:

- HELL PUBLIC ACCESS
- CRYPTID LOCAL NEWS
- ALIEN HOSPITALITY
- CURSED WORKOUT TAPE
- INTERDIMENSIONAL CUSTOMER SERVICE
- COSMIC TRASH TV
- OCCULT HOME SHOPPING
- FAILED EDUCATIONAL VHS
- BUREAUCRATIC PSYCHEDELIA
- MUSEUM OF HUMANS

Recipes are starting coordinates, not fixed songs.

### Learning

Extend star feedback weighting to:

- language profiles
- performance modes
- sound sources
- composition engines
- useful cross-domain pairs

Written feedback should remain stronger than a bare star.

---

## JOB 19 — REGRESSION / MOBILE / PERFORMANCE / FINAL HANDOFF

Perform systematic QA.

### Build / type validation

- TypeScript
- Vite build
- server bundle
- request schemas
- old saves

### Mobile

Test:

- all domain tabs
- large language library
- large sound library
- multi-select sound rack
- locks
- search
- selected strip
- chemistry panel
- mutation controls
- saved configurations

### Regression combinations

At minimum:

1. Xhosa + English L1-transfer mode + tongue-click body percussion + 90s game show.
2. Khoekhoe or another researched click-language profile + code-switch mode + fax/modem transmission.
3. Welsh + antiphonal choir + reverse chronology + ruined cassette.
4. Georgian + hocket ensemble + 31-TET + additive meter.
5. Mothman meteorologist + shortwave + aberrant salience + audience voting on weather.
6. Salvia Object Eternity + object/prop = receipt + finite syllable economy.
7. Hell customer service + elegant tone + broken PA + corporate-training constraint.
8. Goblin maître d' + just intonation + kitchen-object percussion + future-self addressee.
9. Reptilian workout instructor + Saturn gym + body-remoteness + rotating spatial audio.
10. Museum of Humans + Grey Alien docent + outdated manual epistemology + wax-cylinder technology.
11. Nitrous Cosmic Punchline + voicemail + revelation translated into Morse percussion.
12. 37 Tabs Open + relay narration + each voice knows only one thread.
13. Fine dining + audience heckling + resource economy where every modulation spends table credit.
14. Bored Eternity + reverse chronology + one giant bell as prop and anchor.
15. Deliriant False Ordinary Reality + live customer-support call + recording dropout that deletes evidence.

### Final handoff

Create a consolidated architecture document describing:

- Minds
- Reality
- Voice Lab
- Signal Lab
- Sonic Lab
- Structure Lab
- chemistry
- feedback learning
- procedural fallback
- UI
- persistence
- extension rules

---

# OPTIONAL JOB 20 — BREEDING / GENETIC STACKS

Only after the full system is stable.

Allow two saved complete configurations to act as parents.

Child stack:

- inherits some locked / high-weight traits
- performs role-preserving crossover by dimension
- mutates a bounded number of unlocked dimensions
- preserves parent lineage metadata
- can inherit successful chemistry pairs
- does not simply union every card
- supports deterministic seed

This should borrow the strongest ideas from the Mr. Slop breeding system without forcing that codebase into this one.

---

# Anti-slop rules for the whole Composition Lab

1. A selected engine must visibly change behavior.
2. Named culture / language / instrument is not decoration.
3. Do not confuse language with nationality stereotypes.
4. Do not use phonetic misspelling as a substitute for phonology.
5. Do not make obscure instruments exotic wallpaper; specify acoustic behavior and musical role.
6. Transmission must affect information flow.
7. Recording damage must occur structurally in time.
8. Tuning must affect interval behavior.
9. Rhythm physics must affect pulse organization.
10. Ensemble topology must affect information / phrase distribution.
11. Addressee must affect what is assumed or explained.
12. Epistemology must affect information access.
13. Temporal engine must affect chronology.
14. Scale must affect causal vocabulary.
15. Constraint must create observable consequences.
16. Economy must make resources finite.
17. Failure mode must have propagation behavior.
18. Control authority must determine who can cause changes.
19. Props must mediate events.
20. Cross-domain collisions must negotiate rather than dissolve into adjective soup.

---

# Working method

Continue the existing project workflow.

For every job:

1. inspect current `main`;
2. do only that job;
3. preserve backwards compatibility;
4. research where factual specificity matters;
5. keep source ledgers for language / cultural / unusual-instrument claims;
6. validate the affected registry and request paths;
7. commit;
8. create a handoff doc;
9. tell Merry exactly what to pull into Google AI Studio;
10. wait for **NEXT**.

Do not silently replace this plan if implementation reveals a better idea.

Add amendments and explain why the boundary changed.
