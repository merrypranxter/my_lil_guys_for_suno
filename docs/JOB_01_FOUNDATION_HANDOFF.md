# Job 1 — Foundation Handoff

Status: COMPLETE

This job establishes the Reality Engine architecture without adding the large content libraries or the major UI yet.

## What changed

- Added Reality Engine core types:
  - `RealityDimension`
  - `RealityEngine`
  - `realityEngineIds` on generation, repair, saved stacks, and archived runs.
- Added `src/data/realityEngines.ts` as the registry/scaffold.
- Defined eight Reality Engine dimensions:
  - FORMAT
  - ROLE
  - WORLD
  - SPECIES / ORIGIN
  - VENUE
  - HEADSPACE / STATE
  - ALTERED STATE
  - TONE
- Added explicit jurisdiction contracts for each dimension.
- Updated prompt construction so Little Guys and Reality Engines remain separate systems.
- Added anti-decoration and anti-slop rules:
  - Reality Engines must change behavior, assumptions, procedure, structure, attention, embodiment, etc.
  - Merely inserting themed vocabulary does not count.
  - Conflicting layers should negotiate at the seam instead of averaging into generic surrealism.
- Added server-side sanitization and request plumbing for `realityEngineIds`.
- Added app state plumbing for future Reality Engine selection UI.
- Added localStorage persistence for last-selected Reality Engines.
- Updated saved stack and archived-run persistence.
- Old saved stacks/runs are normalized with `realityEngineIds: []`, so they remain usable.
- Starred feedback signals now retain Reality Engine context.
- Markdown run exports now include Reality Engine selections.

## Important current limitation

The registry is intentionally empty after Job 1.

That means the existing app should behave like the old app until later jobs populate Reality Engine cards and the UI exposes them. This is deliberate backwards compatibility, not missing data.

## Google AI Studio

Pull the latest `main`. No special migration step is required.

The new architecture is ready for Job 2, which will populate FORMAT and ROLE situation cards.
