# Mouth Lab Job 2 — Breeder + Conflict Matrix Handoff

Status: IMPLEMENTED ON BRANCH

Branch:

`mouth-lab/job-02-breeder`

## What shipped

Job 2 turns the Job 1 donor/trait foundation into an actual deterministic breeding engine.

New runtime files:

- `src/mouthLab/conflictMatrix.ts`
- `src/mouthLab/determinism.ts`
- `src/mouthLab/phenotype.ts`
- `src/mouthLab/breeder.ts`

Updated:

- `src/mouthLab/types.ts`
- `src/mouthLab/index.ts`
- `package.json`
- `.github/workflows/build.yml`

New verification:

- `scripts/verifyMouthBreeding.ts`

## Breeding contract

`breedMouthGenome()` accepts:

- 2–6 distinct parent donors;
- deterministic breeding seed;
- optional breeding objective;
- optional semantic anchor;
- intelligibility 0–100;
- stability 0–100;
- mutation 0–100;
- optional name;
- optional manually locked jurisdiction assignments.

Same canonical parents + controls + manual assignments + seed produce the same:

- genome ID;
- trait selection;
- jurisdiction allocation;
- pressures;
- phenotype projection.

`createdAt` is intentionally runtime metadata and is not part of the genotype hash.

## Jurisdictions

A trait is inherited with:

- donor;
- primary mouth axis;
- trait ID;
- pressure;
- lock state.

Auto breeding prefers unused mouth axes unless the selected objective explicitly rewards conflict.

Manual assignments are validated against:

- selected parents;
- donor trait ownership;
- valid trait axes.

Locked assignments survive automatic breeding unchanged.

## Parent contribution

The breeder attempts to give every selected donor a viable jurisdiction.

A donor may still contribute nothing if all of its useful traits are already represented or structurally redundant.

Such donors are returned in:

`excludedParentDonorIds`

with an explicit warning.

English may contribute semantics alone when selected as the semantic anchor.

## Conflict matrix

Job 2 distinguishes:

- orthogonal
- cooperative
- competitive
- catalytic
- parasitic
- mutually exclusive
- unstable

Important explicit rules include:

### Extreme clusters × open syllables

Relationship:

`competitive`

Law:

> Accumulate consonants until open-syllable pressure forces repair; insert/expose a vowel, then let clustering begin again.

### Huge consonant palette × tiny inventory

Relationship:

`mutuallyExclusive`

At high stability one wins.

At low stability they may alternate between expanded and collapsed states.

### Alveolar trill × uvular rhotic

Relationship:

`mutuallyExclusive`

The system does not average both into generic “foreign R.”

High stability chooses one owner.

Low stability may partition by position/phrase.

### Vowel harmony × agglutinative chain

Relationship:

`catalytic`

Every new suffix-like layer can inherit the active harmony class.

### Lexical tone × tone/phonation coupling

Relationship:

`catalytic`

Pitch category may trigger voice-quality state.

### Root-pattern interlock × suffix chain

Relationship:

`cooperative`

Internal root/pattern derivation happens first; external chained material stays separately legible.

## Genotype → phenotype

The genome stores intended rules.

The phenotype estimates what should be most audible.

Phenotype fields include:

- active traits;
- suppressed traits;
- salience;
- expected consistency;
- expected audibility;
- explicit pairwise interactions;
- top audible priorities;
- warnings.

This is deliberately separate from the future Suno prompt compiler.

## Intelligibility control

High intelligibility reduces the projected salience of traits most likely to destroy lexical legibility, such as:

- lossy inventory compression;
- extreme consonant density;
- vowel-sparse syllabification;
- large/high-dimensional inventory overload.

It does not automatically delete clicks, tone, trills, ejectives, or other distinctive traits.

## Stability control

Stability determines whether incompatible traits:

- resolve;
- suppress;
- partition;
- or alternate.

At high stability, mutually exclusive traits suppress the weaker phenotype.

At low stability, both can remain active as alternating states.

## Trait pressure

Pressure levels:

- low
- medium
- high
- obsessive

The breeding objective may raise pressure on especially relevant traits.

`ONE MUTATION ESCAPES` explicitly seeks a micro-mutation and drives the winning mutation toward `obsessive`.

Canonical example:

English semantic anchor + Spanish trill donor:

> every eligible R is expected to receive the same absurdly committed trill while lexical intelligibility remains protected.

## Verification cases

`verify:mouth-breeding` checks:

1. same parents + same seed => same genome ID and assignments;
2. four-parent breeding;
3. six-parent breeding;
4. 1 parent rejected;
5. 7 parents rejected;
6. Georgian clustering + Hawaiian open-syllable pressure survive as an explicit conflict;
7. manual Xhosa click and Japanese timing jurisdictions remain locked;
8. ONE MUTATION ESCAPES produces obsessive R-trill pressure;
9. high-stability alveolar/uvular rhotic conflict suppresses one;
10. low-stability rhotic conflict keeps both alive as alternating states.

## Not in Job 2

Still deliberately deferred:

- user-facing Mouth Lab UI;
- specimen capture;
- persisted species/specimens;
- mutation-over-time curves;
- cast-specific mouths;
- language/music transduction;
- Suno prompt compilation;
- GenerationRequest integration.

Those belong to later Mouth Lab jobs.

## Next

Job 3:

**QUIRK ENGINE + SPECIMENS**

Target:

- reusable micro-mutation schema;
- frequency / consistency / exaggeration;
- triggers and takeover curves;
- WHAT THE FUCK WAS THAT? specimen capture;
- linked genes;
- gene knockout;
- mutation scars;
- persistence.
