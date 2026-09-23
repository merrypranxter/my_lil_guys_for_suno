# Job 6 — Reality Engine UI Handoff

Status: COMPLETE

## The important part

**The Reality Engines are visible now.**

Job 6 adds the first full interactive Reality Engine picker to the main app.

Component:

- `src/components/RealityEnginePanel.tsx`

Integrated into:

- `src/App.tsx`

The panel appears after the Little Guy stack / seed / energy controls and before the generated Suno boxes.

---

# Visible controls

Eight horizontally scrollable tabs:

1. FORMAT
2. ROLE
3. WORLD
4. SPECIES / ORIGIN
5. VENUE
6. HEADSPACE / STATE
7. ALTERED STATE
8. TONE

Each tab displays the cards belonging to that dimension.

Selecting a card replaces the current selection in that dimension.

Selecting the already-active card toggles it off.

This intentionally makes each Reality dimension a knob rather than an endlessly accumulating pile.

---

# Selected Reality strip

The top of the panel shows the current Reality stack as compact chips.

Each selected chip shows:

- dimension
- engine name
- lock state
- clear control

The strip scrolls horizontally on narrow/mobile screens.

---

# Locks

Every dimension can be locked.

Locked dimensions survive:

- RANDOMIZE REALITY
- SURPRISE ME
- CLEAR UNLOCKED

Per-dimension randomization is disabled while that dimension is locked.

Locks are intentionally UI-session state in this first pass. Selected engine IDs themselves already persist through the existing local-storage system.

---

# Random controls

## RANDOMIZE REALITY

Chooses one engine from every unlocked dimension.

Useful when Merry wants a full maximalist stack.

## SURPRISE ME

Chooses a variable subset of 3–6 unlocked dimensions and randomizes only those.

This creates incomplete combinations too, so every result is not forced into an eight-layer monster.

Locked dimensions remain intact.

## RANDOM

Each dimension has its own random button.

## CLEAR UNLOCKED

Clears all currently unlocked Reality dimensions without destroying locked choices.

---

# Search

Every dimension has a live search box.

Search covers:

- name
- subtitle
- operational rule
- short explanation
- tags

Search is scoped to the active dimension so mobile results remain manageable.

---

# Card UI

Cards show:

- name
- subtitle
- short explanation
- up to four tags
- accent indicator
- selected glow

The long operational rule is intentionally not dumped into the visible card. It still goes into generation through the existing prompt-building system.

This keeps 260 cards browseable on a phone.

---

# Mobile behavior

The interface is intentionally built mobile-first:

- tab row horizontally scrolls
- selected strip horizontally scrolls
- action buttons collapse into a compact grid
- cards become one column on small screens
- two columns at small/tablet width
- three columns at XL desktop
- card area has a capped vertical scroll so opening HEADSPACE does not create a six-mile page

---

# Existing wiring reused

Job 6 does not invent a second Reality state system.

It uses the existing:

`realityEngineIds`

state already present in `App.tsx`.

That means visible selections immediately inherit the previous Jobs' infrastructure:

- local persistence
- saved-stack persistence
- archive persistence
- generation request payload
- server sanitization
- prompt resolution
- prompt injection

No storage migration is required.

---

# Current content count

The picker exposes the complete current registry:

- FORMAT: 39
- ROLE: 39
- WORLD: 25
- SPECIES / ORIGIN: 29
- VENUE: 30
- HEADSPACE / STATE: 51
- ALTERED STATE: 27
- TONE: 20

**TOTAL: 260**

---

# Example build now possible from the UI

Merry can manually select:

- FORMAT — workout VHS
- ROLE — infernal oracle / instructor-type role
- WORLD — Hell
- SPECIES — reptilian
- VENUE — hell gym
- HEADSPACE — 37 tabs open
- ALTERED — Salvia Object Eternity
- TONE — aggressively cheerful

Then generation receives those selected IDs through the existing request pipeline.

---

# Google AI Studio

Pull latest `main`.

The visible UI work is now in the repository.

No environment-variable change and no storage migration are required.

If AI Studio is already open on an older checkout/build, it needs to sync/pull the new main revision before the panel can appear.
