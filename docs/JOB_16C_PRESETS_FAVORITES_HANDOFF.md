# Job 16C — Composition Lab Presets / Favorites / Preference Memory Handoff

Status: COMPLETE

## What shipped

Job 16C adds dedicated Composition Lab memory so the 1000-engine library is easier to reuse and the generator can learn what mechanisms the user likes.

Updated:

- `src/types.ts`
- `src/lib/localStorage.ts`
- `src/components/CompositionLabPanel.tsx`
- `src/App.tsx`
- `src/lib/buildGenerationPrompt.ts`

No new server endpoint was required.

---

# 1. FAVORITE INDIVIDUAL ENGINES

Every Composition Lab engine can now be starred.

Star controls appear:

- directly on engine cards
- inside the engine detail modal

Favorite state persists locally.

Storage key:

`lgm_composition_favorites_v1`

Favorites survive page reloads independently of whether the engine is currently selected.

---

# 2. OPTIONAL "WHY I LIKE THIS" NOTES

Starring an engine opens an optional note editor.

The note UI is labeled:

`TEACH THE COMPOSITION LAB`

Examples of intended feedback:

- "I like the way this turns a physical limitation into structure."
- "I like the unstable rhythm, not the noisy production."
- "This works great with dry factual narration."
- "I like when this mechanism causes another system to solve a problem."

A favorite may exist with:

- no note
- a note added later
- an edited note

Favorite notes can also be opened from an already-starred engine card or detail modal.

---

# 3. FAVORITES ONLY FILTER

The engine browser now has:

`FAVORITES ONLY`

This works alongside:

- current dimension
- search query
- SELECTED ONLY

So the user can quickly browse, for example:

> only favorite RHYTHMIC PHYSICS engines

without searching the entire registry manually.

---

# 4. FAVORITES NOW TEACH GENERATION

This is not just a bookmark system.

`src/App.tsx` now combines:

- up to 5 Composition Lab favorite signals
- up to 7 starred-run preference signals

then passes the first 10 total preference signals into the existing generation request.

Composition favorite signal example:

`COMPOSITION FAVORITE — EUCLIDEAN RHYTHM [rhythmPhysics]. User note: I like that the rule stays mathematically audible instead of becoming generic odd time.`

The master generation prompt now explicitly says:

- Composition Lab engine favorites are soft preference signals
- infer the liked principle
- do not clone a past song
- do not force a favorite engine into every generation

So starring an engine can teach the generator what mechanism family the user likes without turning favorites into hard requirements.

---

# 5. COMPOSITION-ONLY PRESETS

The Composition Lab now has a dedicated preset saver.

UI:

`SAVE COMPOSITION-ONLY PRESET`

A preset stores:

- name
- Composition engine IDs
- current Composition lock IDs
- created / updated timestamps

Storage key:

`lgm_composition_presets_v1`

This is intentionally separate from the existing whole-stack save system.

Existing whole-stack saves still preserve:

- Little Guys
- Reality Engines
- Composition Engines
- Reality chaos

Composition presets are a faster way to reuse only the mechanism layer.

---

# 6. LOAD / DELETE PRESETS

Saved Composition builds appear directly inside the Lab.

Each preset displays:

- name
- engine count
- locked-engine count

Clicking the preset loads:

- its Composition engine selections
- its saved locks

Delete removes only that Composition preset.

The library is capped at 80 stored Composition presets.

---

# 7. RECENT GENERATED BUILDS

The Composition Lab now exposes:

`RECENT GENERATED BUILDS`

These are derived from the existing run archive.

Behavior:

- uses runs with Composition engines
- normalizes engine IDs through current registry rules
- de-duplicates identical Composition selections
- shows up to 6 recent unique builds in the UI
- one click reloads the Composition engine set

Loading a recent run build intentionally starts with no locks.

The user can then lock the pieces they want and continue mutating.

---

# 8. New types

Added:

`CompositionFavorite`

Fields:

- engineId
- note
- createdAt
- updatedAt

Added:

`CompositionPreset`

Fields:

- id
- name
- compositionEngineIds
- lockedEngineIds
- createdAt
- updatedAt

Added:

`RecentCompositionBuild`

Fields:

- runId
- createdAt
- compositionEngineIds
- seed
- model

---

# 9. New localStorage helpers

Added:

- `getCompositionFavorites`
- `upsertCompositionFavorite`
- `removeCompositionFavorite`
- `getCompositionFavoriteSignals`
- `getCompositionPresets`
- `saveCompositionPreset`
- `deleteCompositionPreset`
- `getRecentCompositionBuilds`

Stored favorites and presets are validated against the current Composition registry when loaded.

Preset Composition IDs are normalized through:

`normalizeCompositionEngineIds`

Saved lock IDs are kept only if their engines still exist in the saved selection.

---

# 10. Intended play loop

The app now supports this workflow:

1. RANDOMIZE ALL
2. Generate
3. Star an engine that produced an interesting mechanism
4. Tell the machine WHY it worked
5. Lock active engines worth preserving
6. MUTATE CURRENT BUILD
7. Generate again
8. Save a Composition-only preset if the whole mechanism stack is worth keeping
9. Later reload the preset or a Recent Generated Build
10. Filter FAVORITES ONLY when constructing something manually

This creates three different kinds of memory:

### LOCK
"Keep this in the current evolutionary session."

### FAVORITE
"I generally like what this mechanism does."

### PRESET
"This exact Composition mechanism stack is worth reusing."

They intentionally do different jobs.

---

# Static verification

Verified:

- Composition favorite / preset types added
- favorites storage key exists
- presets storage key exists
- favorite add/remove/update helpers exist
- favorite note UI exists
- FAVORITES ONLY filter exists
- card star controls exist
- detail star/note controls exist
- Composition-only save UI exists
- preset load/delete UI exists
- recent generated build UI exists
- recent builds de-duplicate Composition selections
- favorite signals are added to generation preference signals
- prompt explicitly treats Composition favorites as soft preferences
- `src/types.ts` lexical quote/bracket balance clean
- `src/lib/localStorage.ts` lexical quote/bracket balance clean
- `src/components/CompositionLabPanel.tsx` lexical quote/bracket balance clean
- `src/App.tsx` lexical quote/bracket balance clean

A full package build / TypeScript compile has still not been executed from this GitHub-edit environment.

---

# Next planned job

## Job 16D — QA / BUILD / MOBILE POLISH

This is the last job in the Composition Lab opening round.

Required:

1. run actual package install/build/typecheck where possible
2. fix TypeScript / runtime errors
3. verify the 1000-engine registry renders
4. verify Sound Source large-library behavior
5. verify mobile cabinet/dimension overflow
6. verify engine detail + favorite-note modals on narrow screens
7. verify presets reload selections + locks correctly
8. verify stale favorites/presets are safely ignored
9. verify randomizers preserve locks
10. verify full-dimension oldest-unlocked replacement
11. verify generation request receives Composition IDs
12. verify favorite preference signals reach the master prompt
13. verify saved whole stacks still load correctly
14. smoke-test generation and fallback paths

After Job 16D, this round is actually finished and ready for normal play rather than implementation mode.
