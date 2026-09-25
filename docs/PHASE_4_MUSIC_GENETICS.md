# Phase 4 — Music Genetics / Deterministic Recipe Breeding

## Purpose

Phase 3 made Music Seed recipes and mechanisms stackable.

Phase 4 makes those stackable musical systems **breedable**.

The goal is not to auto-evolve songs into mush. The goal is controlled two-parent inheritance:

- two identifiable parents
- deterministic breeding seed
- bounded child size
- balanced contribution
- one explicit shared invariant
- one new relationship law created from parental friction
- at most one bounded mutation
- visible lineage receipt
- human choice remains in charge

No Gemini call is used for breeding. Genetics is local and deterministic.

---

## Parent types

A parent can be:

1. a built-in Seed Recipe (generation 0)
2. a previously bred Music Genome (generation 1+)

Bred genomes can therefore breed again.

A G1 × G0 child becomes G2 because child generation is:

```
max(parentA.generation, parentB.generation) + 1
```

---

## Deterministic law

The breeding engine hashes:

```
parent A identity
+
parent B identity
+
breeding seed
```

That deterministic stream controls:

- child-size jitter
- inherited mechanism selection
- crossover order
- bounded mutation
- relationship-law pair selection
- inherited control crossover
- generated child name

The same two parents and the same breeding seed reproduce the same genetics.

`createdAt` is archival metadata and is not part of the genotype.

---

## Genome structure

A bred genome contains:

- stable ID
- name
- description
- mechanism IDs
- inherited global music controls
- generation number
- creation timestamp
- lineage receipt

The lineage receipt stores:

- Parent A
- Parent B
- breeding seed
- shared invariant
- mechanisms inherited from Parent A
- mechanisms inherited from Parent B
- optional mutation mechanism
- relationship law created by the crossover

---

## Structural ancestry requirement

The child is **not** the union of both parents.

Its mechanism count stays near the average parental size, bounded to a small usable genome.

At least one real mechanism must be inherited from each parent.

The engine alternates parental contribution during crossover instead of allowing one parent to swallow the other.

Duplicate inherited mechanisms collapse to one gene.

---

## Shared invariant

Every child receives one declared invariant.

Priority:

### 1. Shared mechanism
If both parents already contain the same mechanism, one shared mechanism is conserved exactly.

### 2. Shared mechanism family
If the parents share no exact mechanism but both contain the same jurisdiction family (rhythm, vocal, form, arrangement, texture, performance), that family becomes the invariant and each parent contributes a mechanism from it.

### 3. Shared control tendency
If the parents share neither exact mechanisms nor a mechanism family, the engine finds the global control dimension where their values are closest and conserves that pressure during crossover.

Examples:

- Anchor Survival remains fixed.
- The RHYTHM jurisdiction must remain legible.
- COUPLING stays near 78/100 while the mechanism set mutates.

---

## Relationship law

The child does not merely inherit mechanisms.

It also receives a **new causal relationship between one Parent A mechanism and one Parent B mechanism**.

The engine chooses a high-friction inherited pair and creates a law such as:

- vocal recruitment may change only at rhythmic alignment/misalignment events
- formal transitions are legal only at meter collisions or re-alignment points
- new voices must seize or vacate real arrangement roles
- social growth must leave a physical trace through claps, stomps, breath, or consonant attack
- texture thickening costs arrangement space
- performance intensity follows rhythmic instability

This is the key anti-concatenation rule.

Parents do not simply sit next to one another. The child has a new dependency relationship they did not have separately.

---

## Bounded mutation

Each birth may receive **zero or one** mutation.

Mutation:

- must be a valid known mechanism
- cannot already exist in either parent
- is selected from nearby/compatible musical territory using tags and family relevance
- cannot expand the genome beyond the hard maximum

Mutation is therefore novelty under constraint, not random mechanism spam.

---

## Control inheritance

The child also inherits:

- Stemminess
- Kinetic Density
- Social Infection
- Coupling
- Interruption
- Anchor Strength
- Cast Size

For each control:

- parental values are averaged
- one parent contributes a mild bias
- a small deterministic jitter may occur
- the control chosen as a fallback invariant receives no jitter

When a child is added to the active stack, its inherited controls softly pull the current global control state rather than replacing it completely.

---

## UI

Music Seed Lab now has:

**BREED RECIPES**

The breeder provides:

- Parent A selector
- Parent B selector
- breeding seed
- random seed button
- optional child name
- BREED THE BASTARDS button
- visible genetics receipt
- persistent lineage library

There is also:

**USE FIRST TWO ACTIVE MACROS**

This copies the first two active Recipe/Genome macros into the breeder.

---

## Bred genome stack behavior

A bred genome is a first-class stack macro.

It can be:

- stacked beside built-in recipes
- stacked beside other bred genomes
- strengthened
- weakened
- muted
- locked
- reordered
- removed
- saved inside a whole-stack preset
- archived inside generated runs

It cannot be "rerolled" in place because that would silently destroy lineage.

To change genetics, breed another child.

---

## Genome library

Bred genomes are stored locally in a persistent breeding library.

Deleting a genome from the breeding library does **not** invalidate copies already placed into active/saved stacks because each active Genome stack item embeds its complete genome and lineage.

This avoids dangling references.

---

## Prompt integration

The Music Seed compiler expands active bred genomes into:

- inherited mechanisms
- inherited strength
- invariant law
- crossover relationship law

Generation is instructed that lineage is not decorative metadata.

The invariant and relationship law must produce audible or structurally testable consequences.

Bred genomes therefore work in:

- normal Gemini generation
- procedural fallback generation
- whole-stack saving
- run archive export
- starred preference learning

---

## Human agency / no automatic evolution

Phase 4 does **not** automatically select winners or breed generations without the user.

There is no hidden fitness score choosing what survives.

The machine can create descendants.

The human decides which descendants deserve another generation.

That preserves the useful part of evolutionary search without turning the app into an autonomous optimization loop.

---

## Verification

`npm run verify:breeding` tests:

- same parents + same seed reproduce the same child genetics
- both parents contribute real mechanisms
- child genome size stays bounded
- mutation is valid and absent from both parents
- embedded genomes survive stack normalization
- compiled genomes expand into mechanisms
- genome laws reach the interaction compiler
- G1 × G0 creates G2
- malformed embedded genomes are rejected

CI runs breeding verification before build.

---

## Next useful direction

After Phase 4, the strongest next expansion is a **Petri Dish / lineage experiment bench**:

- select several sibling genomes
- generate all under the same frozen challenge
- compare outcomes without changing their genetics
- human selects one or more
- explicitly OPEN / STACK / BREED chosen descendants
- no automatic winner

That would turn breeding from a one-child curiosity into a controlled experimental ecology.
