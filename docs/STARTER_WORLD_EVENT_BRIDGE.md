# Starter World → Music Event Bridge

## Purpose

World Packages already provide a coherent semantic spine: a radio show, a lab demonstration, a game show, mission control, weather coverage, and so on.

The Event Bridge makes events inside that world **cause audible musical changes**.

The rule is:

> The world supplies the event. The active music stack supplies the consequence.

This prevents the world from becoming mere lyric flavor while also preventing the world package from dictating an entire musical style.

## Example

MIDNIGHT CALL-IN RADIO may expose cues such as:

- phone rings
- caller connects
- station ID
- commercial break
- line drops

With a vocal/social starter stack active, the bridge can resolve those cues into behaviors such as:

- phone rings → GROUP UNISON BURST
- caller connects → CALL + RESPONSE
- station ID → ANCHOR SURVIVAL
- commercial break → JURISDICTION DROPOUT
- line drops → EXPOSURE WINDOWS

The exact mapping is deterministic for the same starter stack.

## Active-stack-first rule

The bridge first expands Music Seed recipes and direct Music mechanisms already activated by Starter Seeds.

It then binds world cues to those mechanisms.

This preserves modularity:

- WORLD PACKAGE owns semantic events.
- MUSIC SEEDS own musical behavior.
- EVENT BRIDGE owns only the causal wire between them.

If no musical mechanisms are active, the bridge uses a small safe fallback pool so a World Package can still function on its own.

Fallback behavior is visible in the UI.

## Semantic heuristics

Some event types prefer certain musical consequences when those mechanisms are available.

Examples:

- ring / buzzer / alarm → HARD INTERRUPTS or EVENT-DRIVEN FORM
- caller / audience / assistant → CALL + RESPONSE, VOCAL RELAY, or COMMUNAL INFECTION
- station ID / baseline / measurement → ANCHOR SURVIVAL or EVENT-DRIVEN FORM
- commercial break / dead air / signal loss → JURISDICTION DROPOUT or EXPOSURE WINDOWS
- reveal / prize / triumphant event → GROUP UNISON BURST or FALSE RESOLUTION
- countdown → DOUBLE-TIME ACTIVITY or EVENT-DRIVEN FORM

These are preferences, not fixed stylistic presets.

## UI

Every active World Package gets an:

**EVENTS → MUSIC ON / OFF**

control.

When enabled, the Starter panel shows the resolved event map before generation.

The bridge defaults ON for World Packages, including older saved starter stacks that predate this feature.

Turning it OFF preserves the semantic world and its event cues but removes the musical causal wiring.

## Prompt contract

Each binding is compiled into an explicit law:

- the named world event must occur as part of the semantic frame;
- it must trigger the named musical behavior;
- the musical response must be audible;
- the mapping may not collapse into merely mentioning the cue in lyrics;
- the world-frame invariant must survive.

## Determinism

Bridge assignment is deterministic for the same active Starter stack.

This is important for repeatable experiments, Petri Dish comparisons, and favorites analysis.

## Current status

Implemented:

- deterministic event-binding compiler;
- active-music-first mechanism selection;
- semantic cue heuristics;
- fallback mechanism pool;
- per-world ON/OFF control;
- bridge preview in Starter UI;
- persistence through Starter stack storage;
- inclusion in the generation prompt;
- regression verification.

Future expansion can add user-editable individual bindings and custom event-action routing without changing this contract.
