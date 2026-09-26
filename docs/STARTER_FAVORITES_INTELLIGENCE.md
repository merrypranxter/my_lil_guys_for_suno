# Starter Favorites Intelligence

## Purpose

The existing star/feedback system already learns from whole runs, Music Seed mechanisms, Minds, Reality Engines, Composition favorites, and Mouth Lab traits.

This phase makes **Starter Seeds first-class experimental provenance**.

The machine now records the exact Starter stack that produced a run, lets the user say which Starter ingredients actually mattered, and uses those explicit votes as a **soft reroll bias**.

It does not auto-select a favorite recipe and it does not ban a disliked one.

## What gets archived

Every generated run now snapshots the active Starter stack:

- seed ID
- intensity
- muted state
- lock state
- World → Music event-bridge state

Whole-stack favorites also save and restore the Starter stack.

Older saves/runs remain valid; missing Starter stacks normalize to an empty array.

## Feedback semantics

The feedback modal now exposes active Starter seeds from the archived run itself.

For each active Starter seed:

- **★ MORE LIKE THIS**
- **✕ LESS OF THIS**

These votes are separate from:

- whole-song star
- free-text note
- quick tags
- Music mechanism inheritance votes
- Mouth Lab inheritance votes

This matters because a user may love a generated track while specifically disliking one ingredient that happened to be active.

## Evidence strength

A whole-song star with no Starter-specific vote is weak evidence:

- active Starter seed: +0.2

Explicit votes are strong evidence:

- MORE LIKE THIS: +2.0
- LESS OF THIS: -2.5

Scores are normalized after aggregation.

When a run contains any explicit Starter votes, unvoted Starter seeds from that run remain neutral rather than receiving the weak whole-run boost.

## Human agency rule

Starter preference learning is deliberately non-authoritative.

Learned scores:

- show **★ LEARNED** or **↓ LESS** badges on Starter cards;
- softly alter the probability of **REROLL THIS CATEGORY**;
- produce preference signals for future generation context.

Learned scores do **not**:

- auto-select Starter seeds;
- prevent manual selection;
- silently replace a current stack;
- ban negatively rated seeds;
- override locks;
- override the current user's explicit choices.

Manual clicks remain sovereign.

## Reroll weighting

Positive learned pressure increases a seed's chance during category reroll.

Negative learned pressure decreases that chance but never reduces it to zero.

This makes reroll increasingly useful without turning the Starter library into a recommendation feed that collapses onto one successful formula.

## Generation preference context

Recent starred runs with Starter stacks emit a dedicated:

**STARTER STACK FITNESS SIGNAL**

This records:

- the Starter stack and intensity values;
- explicit positive Starter votes;
- explicit negative Starter votes;
- the user's free-text feedback note.

These signals join the existing preference context sent into generation.

## Exports

Markdown run exports now include:

- Starter seed stack;
- liked Starter seed IDs;
- suppressed Starter seed IDs.

This keeps external analysis tools able to reconstruct what produced a favorite.

## Relationship to success saturation

Starter preferences are durable user preference.

They should eventually receive the same ecological distinction already used by Music Seed genetics:

- **preference** = what the user has demonstrated liking;
- **recency saturation** = what has been used too often lately.

This phase implements preference learning first.

A later phase may add Starter-specific recency saturation so a beloved Starter can cool down temporarily without losing its learned positive fitness.
