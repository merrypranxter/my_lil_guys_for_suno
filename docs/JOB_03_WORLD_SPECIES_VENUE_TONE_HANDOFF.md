# Job 3 — WORLD + SPECIES / ORIGIN + VENUE + TONE Handoff

Status: COMPLETE

## What shipped

Job 3 populates four additional Reality Engine dimensions:

- **WORLD** — background ontology, institutions, hazards, assumptions, and what counts as normal.
- **SPECIES / ORIGIN** — embodiment, sensory assumptions, native priorities, physical constraints, and reference frame.
- **VENUE** — immediate local setting, available objects, procedures, spatial constraints, and affordances.
- **TONE** — delivery surface and performance coloration without replacing the operational mechanics of the other layers.

### New files

- `src/data/realityWorlds.ts`
- `src/data/realitySpecies.ts`
- `src/data/realityVenues.ts`
- `src/data/realityTones.ts`

### Registry update

`src/data/realityEngines.ts` now registers:

- FORMAT
- ROLE
- WORLD
- SPECIES / ORIGIN
- VENUE
- TONE

HEADSPACE and ALTERED STATE remain intentionally unpopulated until Jobs 4 and 5.

## Counts

Existing Job 2:
- FORMAT: **39**
- ROLE: **39**

New Job 3:
- WORLD: **25**
- SPECIES / ORIGIN: **29**
- VENUE: **30**
- TONE: **20**

Job 3 total: **104 new cards**

Current Reality Engine registry total: **182 cards**

Duplicate IDs across all six populated dimensions: **0**

## WORLD coverage

WORLD cards include:

- Hell
- Purgatory
- Heaven with bad administration
- Saturn
- alien civilization
- parallel Earth
- interdimensional bureaucracy
- dream realm
- fae realm
- Atlantis
- Hollow Earth
- post-apocalypse
- haunted suburbia
- abandoned space mall
- interdimensional truck stop
- cursed cruise line
- monster resort
- cryptid national park
- ancient future
- occult shopping center
- doomed amusement park
- underworld city
- old Moon colony
- failed utopia
- eternal night market

WORLD cards are operational. Example: `world-hell` does not merely add brimstone vocabulary. Hell must behave like a jurisdiction with labor, queues, services, commerce, schedules, and administrative consequences.

## SPECIES / ORIGIN coverage

SPECIES cards include:

- reptilian
- grey alien
- insectoid hive being
- cephalopod psychic
- crystalline being
- gas-giant floater
- fungal collective
- radio-wave entity
- time-loop species
- Bigfoot
- Mothman
- Chupacabra
- Jersey Devil
- Loch creature
- goblin
- demon
- vampire
- witch
- fae
- skeleton
- dragon
- kraken
- mermaid / siren
- living slime
- living scarecrow
- ghost
- robot bureaucrat
- plant intelligence
- colony organism

These are embodiment engines, not costumes.

Example: `species-skeleton` must account for absent flesh, breath, digestion, facial musculature, temperature regulation, and weight distribution. `species-radio-wave-entity` must reason through bandwidth, transmission, reception, interference, and compatible hardware.

## VENUE coverage

VENUE cards include:

- Hell airport
- Hell gym
- Hell buffet
- Hell call center
- Hell casino
- Hell spa
- Hell game-show studio
- alien mall
- alien airport
- alien zoo
- alien nightclub
- alien school
- alien gym
- Museum of Humans
- Bigfoot ranger station
- Mothman omen center
- goblin flea market
- vampire supper club
- dragon airport lounge
- witch farmers market
- mermaid boardwalk
- haunted supper club
- Saturn fitness resort
- interdimensional DMV
- dream customs
- temporal courtroom
- cosmic OSHA inspection site
- interdimensional motel
- cosmic truck stop
- monster convention hall

VENUE is deliberately narrower than WORLD.

Example:
- WORLD = Hell
- VENUE = airport

Hell determines the background ontology and institutions.
Airport determines gates, baggage, security, screening, boarding, and local movement.

## TONE coverage

TONE cards include:

- aggressively cheerful
- terrified but professional
- hyper-professional
- sleazy late-night cable
- wholesome
- trashy
- elegant
- exhausted
- smug certainty
- deadpan
- breathless hype
- sanctimonious
- glamorous
- petty irritation
- camp
- corporate training voice
- local-TV earnestness
- clinical
- evangelical sales energy
- ominously calm

TONE is explicitly prevented from becoming another scenario engine.

Example:
`tone-terrified-professional` may change breath, pacing, emphasis, and emotional leakage, but it cannot delete the ROLE's duties or the FORMAT's mechanics.

## Example combinations now supported by the data layer

- 90s Game Show + Game Show Host + Hell + Demon + Hell Game Show Studio + Aggressively Cheerful
- Workout VHS + Workout Instructor + Saturn + Reptilian + Saturn Fitness Resort + Hyper-Professional
- Weather Forecast + Meteorologist + Haunted Suburbia + Mothman + Mothman Omen Center + Local-TV Earnestness
- Today's Specials + Maître D' + Underworld City + Skeleton + Vampire Supper Club + Elegant
- Guided Tour + Tour Guide + Cryptid National Park + Bigfoot + Bigfoot Ranger Station + Wholesome
- Late-Night Psychic Ad + Bad Psychic + Occult Shopping Center + Fae + Interdimensional Motel + Sleazy Late-Night Cable
- Customer Support Call + Customer Support Rep + Interdimensional Bureaucracy + Robot Bureaucrat + Hell Call Center + Exhausted
- Humans Gone Wild + Wildlife Narrator + Alien Civilization + Grey Alien + Museum of Humans + Breathless Hype

## Verification performed

Static registry sanity checks:

- FORMAT cards: 39 / all dimension=FORMAT
- ROLE cards: 39 / all dimension=ROLE
- WORLD cards: 25 / all dimension=WORLD
- SPECIES cards: 29 / all dimension=SPECIES
- VENUE cards: 30 / all dimension=VENUE
- TONE cards: 20 / all dimension=TONE
- total IDs: 182
- duplicate IDs: 0
- all six populated libraries registered in `REALITY_ENGINES`

## Important current limitation

The selection UI is still intentionally deferred to Job 6.

The data and prompt architecture can resolve these IDs now, but ordinary app users do not yet have the final tabbed Reality Engine picker/randomizer.

## Google AI Studio

Pull latest `main`.

No storage migration is required.

Next planned job: **Job 4 — HEADSPACE / STATE library**.
