# Job 16D — QA / Build / Mobile Polish Handoff

Status: COMPLETE

## Result

The Composition Lab opening round is complete.

The repository now has:

- a production build/typecheck CI workflow
- a Composition Lab regression smoke suite
- production server smoke coverage
- mobile overflow fixes
- dependency compatibility cleanup

The latest verified code commit before this handoff is:

`dfd381361adcbcf04abd050a21f04c63908d40d1`

That commit passed:

- dependency install
- TypeScript typecheck
- Composition Lab regression smoke tests
- production client/server build
- production server boot
- `GET /api/info` smoke request

---

# 1. BUILD SYSTEM FIX

The first real CI run exposed an existing dependency conflict:

- Vite 8.3.1 expects optional peer `esbuild ^0.27.0 || ^0.28.0`
- the repo declared `esbuild ^0.25.0`

Fixed:

`package.json`

from:

`"esbuild": "^0.25.0"`

to:

`"esbuild": "^0.28.0"`

After that change:

- npm install succeeded
- typecheck succeeded
- production build succeeded

---

# 2. CI ADDED

New workflow:

`.github/workflows/build.yml`

Runs on pushes to main and pull requests.

Current verification pipeline:

1. checkout
2. Node 22 setup
3. `npm install`
4. `npm run lint`
5. `npm run verify:composition`
6. `npm run build`
7. boot production server
8. curl `/api/info`

This turns future regressions into visible failures instead of silent breakage.

---

# 3. COMPOSITION LAB REGRESSION SUITE

New file:

`scripts/verifyCompositionLab.ts`

New package script:

`npm run verify:composition`

The smoke suite verifies:

- registry contains exactly 1000 Composition engines
- all engine IDs are unique
- every registered dimension has content
- every engine sits in the correct domain
- normalization respects canonical cardinality limits
- Randomize All seeds a valid cross-cabinet build
- lock-aware dimension randomization preserves locks
- Mutate Current Build preserves locks and build size
- favorites persist
- favorite notes become generation preference signals
- stale favorite IDs are ignored safely
- Composition-only presets persist
- stale presets are ignored safely
- preset lock IDs remain valid
- whole-stack saves still preserve Composition IDs
- recent generated Composition builds are recoverable
- Composition favorite signals reach the master prompt
- selected Composition engines reach the master prompt
- procedural fallback receives active Composition engines
- procedural fallback still respects strict Suno output ranges

Latest passing smoke output included:

- registry: 1000
- normalized max-cardinality selection: 37
- random seeded build: valid across all four cabinets
- favorite signal test: pass
- preset test: pass
- whole-stack compatibility: pass
- recent-build recovery: pass
- fallback STYLE: within 975–999
- fallback LYRICS: within 4900–4999
- fallback CAPTION: within 490–499

---

# 4. PRODUCTION SERVER SMOKE

The CI now boots:

`NODE_ENV=production node dist/server.cjs`

and verifies:

`GET http://127.0.0.1:3000/api/info`

Latest passing response:

`{"status":"online","model":"gemini-3.5-flash-lite","hasApiKey":false}`

No API key is required for this health check.

This proves:

- server bundle boots
- Express routing is alive
- production static/server path initializes
- API route is reachable

---

# 5. MOBILE POLISH

Updated:

`src/components/CompositionLabPanel.tsx`

Small-screen fixes:

- Composition Lab title/badge row now wraps rather than overflowing
- Active Build chips are capped to available width
- long engine names truncate inside chips instead of forcing horizontal page overflow

Existing mobile-friendly behavior retained:

- cabinet grid collapses to two columns
- dimension tabs scroll horizontally
- randomization controls wrap
- engine list becomes one column
- detail modal is viewport-bounded and scrollable
- favorite-note modal is viewport-bounded
- saved/recent build columns stack vertically
- Sound Source library is dimension-scoped rather than rendering the full 1000-engine registry

---

# 6. VITE CONFIG CLEANUP

Updated:

`vite.config.ts`

Changed deprecated/future-warning-prone:

`__dirname`

usage to:

`import.meta.dirname`

Also cleaned the damaged em-dash comment encoding.

The Vite native-config warning is gone.

---

# 7. LARGE LIBRARY CHECK

The heaviest single browsing dimension is Sound Source.

Current Sound Source source libraries contain approximately 221 cards across:

- conventional sources
- regional/traditional sources
- experimental/electronic sources
- machines/objects
- biological/environmental sources

The UI renders only the currently active dimension and contains that list inside a bounded scroll region.

The app never renders all 1000 Composition cards at once.

---

# 8. PRODUCTION BUILD RESULT

Latest production build passed.

Vite transformed:

`1714 modules`

Approximate built client sizes:

- HTML: 1.31 kB
- CSS: 59.45 kB / 10.13 kB gzip
- JS: 991.11 kB / 308.81 kB gzip

Server bundle:

approximately 775 kB plus sourcemap.

Vite still emits a non-blocking warning that the main JS chunk is larger than 500 kB.

This is expected because the client ships a large 1000-engine registry plus the rest of the app.

It is not a build failure.

Potential future optimization:

- lazy-load Composition Lab data/UI
- split large data registries into async chunks

That is optimization work, not a blocker for play.

---

# 9. WHAT IS NOW VERIFIED

Verified by CI and regression scripts:

- 1000-engine registry integrity
- no duplicate Composition IDs
- selection cardinality
- lock preservation
- randomization
- mutation
- favorite storage
- favorite learning signal
- preset storage
- stale-memory filtering
- whole-stack compatibility
- recent-build restoration
- master-prompt Composition plumbing
- procedural fallback Composition plumbing
- strict output lengths
- production typecheck
- production client build
- production server build
- production server startup
- `/api/info` route

---

# 10. WHAT STILL REQUIRES HUMAN PLAY

Automated CI cannot judge whether the interface feels good on the user's actual phone or whether generated Suno material is creatively successful.

The next step is no longer an implementation job.

It is:

## PLAY TEST

Recommended first session:

1. pull latest main into Google AI Studio
2. open Composition Lab
3. hit RANDOMIZE ALL
4. inspect the Active Build
5. lock 1–3 interesting mechanisms
6. MUTATE CURRENT BUILD
7. generate
8. star any engine that clearly contributed something good
9. add a quick "why I liked this" note
10. save any especially good Composition stack as a preset

Any problems discovered during normal use should become small targeted fixes rather than another giant build round.

---

# Round status

Jobs 8–15:

CONTENT / ENGINE POPULATION — COMPLETE

Job 16A:

PLAYABLE CABINET UI — COMPLETE

Job 16B:

LOCKS / RANDOMIZATION / MUTATION — COMPLETE

Job 16C:

PRESETS / FAVORITES / PREFERENCE MEMORY — COMPLETE

Job 16D:

BUILD / QA / MOBILE POLISH — COMPLETE

## THIS ROUND IS COMPLETE.

The machine is ready to play.
