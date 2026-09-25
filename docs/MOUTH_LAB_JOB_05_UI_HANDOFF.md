# Mouth Lab Job 5 — User Interface Handoff

Status: IMPLEMENTED ON BRANCH

Branch:

`mouth-lab/job-05-ui`

## What shipped

Job 5 makes Mouth Lab usable from the main Little Guy Machine interface.

New component:

- `src/components/MouthLabPanel.tsx`

Updated:

- `src/App.tsx`
- `src/lib/localStorage.ts`
- `package.json`
- `.github/workflows/build.yml`

New verification:

- `scripts/verifyMouthUi.ts`

## Main app module

Mouth Lab is now a first-class module in the sticky module dock.

It sits between Composition Lab and Suno Output.

The module summary shows:

- active parent count;
- active inherited trait count;
- active quirk count.

No active genome is required for legacy generation.

## Four Mouth Lab work areas

### BREED LANGUAGES

Provides:

- searchable donor library;
- multi-select 2–6 parent breeding;
- parent trait previews;
- + RANDOM DISTANT PARENT;
- breeding-objective picker;
- intelligibility slider;
- stability slider;
- mutation slider;
- editable deterministic breeding seed;
- BREED THE BASTARDS.

The UI uses the Job 2 breeder directly.

### QUIRK MONSTER

Provides:

- searchable quirk library;
- install/remove controls;
- active quirk editor;
- frequency 0–100;
- consistency 0–100;
- exaggeration 0–100;
- takeover-mode selection.

Quirk changes produce new genome identities through the Job 3 quirk engine.

### DESIGN A MOUTH

Provides:

- active genome identity;
- parent lineage;
- phenotype summary;
- phenotype warnings;
- inherited jurisdiction list;
- LOW / MEDIUM / HIGH / OBSESSIVE pressure editing;
- active-trait audibility readout;
- active-quirk audibility readout;
- explicit trait-collision display;
- compiler-mode selector;
- ENGLISH MEANING / ALIEN MOUTH toggle;
- live compiled-mouth preview;
- SAVE SPECIES;
- CLEAR ACTIVE.

### SPECIMEN ARCHIVE

Provides:

- saved wild vocal specimens;
- saved Mouth Lab species/genomes;
- apply specimen to active mouth;
- load archived species;
- delete specimen/species;
- persistent archive through the Job 3 archive adapter.

## QUICK FREAK

A global Mouth Lab shortcut now:

1. keeps English as a semantic parent;
2. chooses additional donor systems;
3. chooses a breeding objective;
4. generates a new breeding seed;
5. breeds immediately.

The resulting genome becomes the active generation genome.

## WHAT THE FUCK WAS THAT?

The UI now exposes the Job 3 specimen capture flow.

The modal accepts:

- optional specimen name;
- plain-language observation;
- why the behavior was liked.

Example:

> The dude rolled EVERY SINGLE RRRRRR with SUCH ENTHUSIASM every fucking time.

The existing local specimen matcher can recognize known quirks.

Two actions are available:

- SAVE SPECIMEN;
- SAVE + INFECT CURRENT MOUTH.

The second option applies recognized quirks immediately and stores linked-gene information.

The interface does not claim to acoustically analyze a song. It records the human observation and maps only patterns the local quirk matcher knows.

## Current-mouth persistence

The active Mouth Lab state now survives browser reloads:

- active genome;
- prompt compiler mode;
- semantic mode.

Persistence uses normalized Mouth Lab data, not arbitrary raw objects.

## Whole-stack persistence

Favorite whole-stack saves now also retain:

- Mouth Lab genome;
- compiler mode;
- semantic mode.

Loading an old stack remains valid because absent Mouth Lab data normalizes to inactive/default settings.

## Run archive persistence

Generated runs now retain:

- Mouth Lab genome;
- prompt mode;
- semantic mode.

Markdown run export documents the active Mouth Lab configuration.

## Generation integration

The main Generate path now sends:

- `mouthGenome`
- `mouthPromptMode`
- `mouthSemanticMode`

to `/api/generate`.

The local procedural fallback receives the exact same active Mouth Lab state.

This completes the UI → request → compiler → generation pipeline built in Jobs 1–4.

## Verification

`verify:mouth-ui` checks:

1. active genome persistence;
2. prompt-mode persistence;
3. semantic-mode persistence;
4. whole-stack save/load with Mouth Lab genome;
5. whole-stack compiler-mode preservation;
6. whole-stack semantic-mode preservation;
7. generated-run archive with Mouth Lab genome;
8. generated-run compiler-mode preservation;
9. generated-run semantic-mode preservation;
10. Markdown run export contains Mouth Lab context;
11. active mouth can be cleared without corrupting storage.

Build/typecheck also compile the full React Mouth Lab UI.

## Not in Job 5

Still deferred:

- automatic audio analysis from uploaded Suno stems;
- cast-specific mouths;
- full section-by-section mutation timelines;
- language ↔ music transduction;
- evolutionary species breeding;
- trait-level fitness learning from starred songs.

## Next

Job 6:

**CAST MOUTHS + MUTATION TIMELINE**

Target:

- different Mouth Lab genomes per singer/voice role;
- lead / crowd / freak voice / ensemble jurisdictions;
- scheduled trait infection;
- section-triggered takeovers;
- voice-to-voice contagion;
- role exchange between mouth systems;
- explicit timeline visualization.
