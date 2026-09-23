# Job 2 — FORMAT + ROLE Situation Library Handoff

Status: COMPLETE

## What shipped

Job 2 populates the first two Reality Engine dimensions:

- **FORMAT** — controls sequence, recurring segments, turn-taking, event mechanics, and lyric architecture.
- **ROLE** — controls speaker obligations, expertise, diction, procedures, and job behavior.

The library is split into dedicated data modules so later jobs can grow without turning one registry file into a giant wall of objects.

### New files

- `src/data/realityFormats.ts`
- `src/data/realityRoles.ts`

### Registry update

`src/data/realityEngines.ts` now imports and registers both libraries and exposes:

- `REALITY_ENGINES`
- `getRealityEngine(id)`
- `getRealityEngines(ids)`
- `getRealityEnginesByDimension(dimension)`

## Counts

- FORMAT cards: **39**
- ROLE cards: **39**
- Job 2 total: **78**
- Duplicate IDs: **0**

This deliberately lands at the high end of the planned 50–80 card target.

## FORMAT coverage

The FORMAT library includes operational structures for:

- 90s game shows
- dating shows
- trash daytime talk shows
- workout VHS tapes
- public-access TV
- infomercials
- home shopping
- late-night psychic ads
- 1-900 hotlines
- Humans Gone Wild-style alien late-night commercials
- weather forecasts
- traffic reports
- menu/specials presentation
- guided tours
- circus programs
- carnival barker spiels
- telethons
- airport announcements
- flight safety briefings
- court depositions
- museum audio guides
- training videos
- emergency broadcasts
- cooking shows
- morning zoo radio
- call-in radio
- cruise day programs
- auctions
- motivational seminars
- customer-support calls
- VHS dating profiles
- tabloid news specials
- VHS self-help tapes
- supermarket race shows
- physical challenge shows
- wheel-and-puzzle shows
- talent shows
- owner's manuals
- black-box recorder transcripts

Each card contains a structural rule. A FORMAT is invalid if it only changes vocabulary.

Example: `format-90s-game-show` requires contestants, rounds, scoring, prizes, buzzers, penalties, and a final round. It cannot satisfy the engine by merely saying "game show" or adding applause.

## ROLE coverage

The ROLE library includes:

- game-show host
- workout instructor
- maître d'
- waiter/sommelier
- interdimensional travel agent
- bad psychic
- infernal oracle
- hotline operator
- meteorologist
- tour guide
- ringmaster
- carnival barker
- customer-support rep
- concierge
- debt collector
- insurance adjuster
- museum docent
- flight attendant
- gate announcer
- public-access host
- wildlife narrator
- telethon host
- morning-zoo DJ
- call-in radio host
- cooking-show host
- real-estate agent
- life coach
- cruise director
- auctioneer
- daytime talk-show host
- infomercial pitcher
- home-shopping host
- tabloid reporter
- motivational guru
- mission/flight controller
- emergency announcer
- corporate trainer
- archaeologist
- field biologist

ROLE cards keep the speaker doing the job even when the surrounding world becomes impossible.

Example: `role-interdimensional-travel-agent` must compare destinations, explain visas, fees, return conditions, itinerary problems, and upgrades. "Cosmic travel vibes" alone do not satisfy the card.

## Combination examples now supported by the data layer

- `format-workout-vhs` + `role-workout-instructor`
- `format-late-night-psychic-ad` + `role-bad-psychic`
- `format-menu-specials` + `role-maitre-d`
- `format-guided-tour` + `role-interdimensional-travel-agent`
- `format-humans-gone-wild` + `role-wildlife-narrator`
- `format-90s-game-show` + `role-infernal-oracle`
- `format-weather-forecast` + `role-meteorologist`
- `format-circus-program` + `role-ringmaster`
- `format-customer-support-call` + `role-customer-support-rep`

WORLD / SPECIES / VENUE / HEADSPACE / ALTERED STATE / TONE are intentionally not populated yet; those belong to later jobs.

## Important current limitation

The Reality Engine UI does not exist yet. That is Job 6.

These 78 cards are now registered and available to the generation architecture, but normal users do not yet have the tabbed picker/randomizer interface. This is deliberate staging.

## Verification performed

- confirmed 39 FORMAT IDs
- confirmed all 39 FORMAT cards use `dimension: 'format'`
- confirmed 39 ROLE IDs
- confirmed all 39 ROLE cards use `dimension: 'role'`
- confirmed 78 total IDs
- confirmed zero duplicate IDs
- confirmed registry imports both libraries

## Google AI Studio

Pull latest `main`.

No storage migration is required.

Next planned job: **Job 3 — WORLD + SPECIES / ORIGIN + VENUE + TONE**.
