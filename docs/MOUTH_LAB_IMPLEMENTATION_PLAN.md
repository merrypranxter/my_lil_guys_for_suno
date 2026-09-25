# Mouth Lab — implementation plan

Status: JOB 3 QUIRK ENGINE IMPLEMENTED

Mouth Lab turns language profiles into transferable vocal machinery.

It is not an accent picker.

Core rule:

> Do not blend whole languages vaguely. Harvest specific operational traits, assign them jurisdictions, and force the jurisdictions to negotiate.

The existing Job 9 language/phonology library remains the research substrate. Mouth Lab does not replace the 104 language profiles; it projects selected profiles into a trait/genetics layer.

## Why this is a separate module

The existing Composition Lab language system is intentionally cardinality 0–1.

Mouth Lab needs:

- 2–6 language parents;
- trait-level inheritance;
- non-overlapping mouth jurisdictions;
- deliberate trait conflict;
- micro-mutations such as “trill every R”;
- specimens captured from accidental Suno behavior;
- reusable bred species;
- mutation through time;
- cast-specific mouths;
- language-to-music transduction.

Those requirements justify a self-contained module rather than inflating the existing language dropdown.

## Jobs

### Job 1 — FOUNDATION / DONOR + TRAIT VAULT — COMPLETE

Deliver:

- Mouth Lab types;
- transferable trait vault;
- curated high-contrast donor registry referencing existing language profiles;
- breeding-objective registry;
- verification script;
- no UI;
- no generation-request changes.

Acceptance:

- at least 25 curated seed donors;
- at least 20 transferable traits;
- every donor references a real Job 9 language profile;
- every trait references real donor profiles;
- no generic “Mayan”, “African”, “Asian”, or “Indigenous” donor;
- source/caution metadata survives into the new layer.

### Job 2 — BREEDER + CONFLICT MATRIX — COMPLETE

Deliver:

- deterministic 2–6-parent breeding;
- automatic jurisdiction assignment;
- manual jurisdiction overrides;
- cooperative / orthogonal / competitive / catalytic / parasitic / mutually-exclusive / unstable relationships;
- genotype-to-phenotype projection;
- trait-pressure system;
- intelligibility and stability controls.

### Job 3 — QUIRK ENGINE + SPECIMENS — IMPLEMENTED

Deliver:

- micro-mutation objects;
- frequency / consistency / exaggeration / takeover controls;
- ONE MUTATION ESCAPES behavior;
- specimen capture;
- linked traits;
- gene knockout;
- mutation scars;
- local persistence.

Canonical acceptance specimen:

> intelligible English while every eligible R receives an absurdly committed trill.

### Job 4 — PROMPT COMPILER

Deliver:

- compact export;
- bracketed/system export;
- descriptive export;
- trait-pressure-aware prompt reinforcement;
- English Meaning / Alien Mouth mode;
- GenerationRequest integration while preserving old requests.

### Job 5 — MOUTH LAB UI

Deliver:

- 2–6 parent multi-select;
- QUICK FREAK;
- BREED LANGUAGES;
- DESIGN A MOUTH;
- QUIRK MONSTER;
- WHAT THE FUCK WAS THAT?;
- SPECIMEN ARCHIVE;
- breeding-objective buttons;
- genome/phenotype inspection.

### Job 6 — DYNAMIC MOUTHS

Deliver:

- cast-specific mouth assignment;
- mutation curves;
- event-triggered trait spread;
- dominant / recessive / latent / triggered traits;
- language-to-music transduction;
- music-to-language reverse transduction;
- conditional phonetics.

### Job 7 — EVOLUTION + QA

Deliver:

- breed species with species/specimens;
- favorite feedback as fitness pressure without turning the main machine into a favorites recycler;
- Petri/Assay compatibility;
- novelty and anti-monoculture compatibility;
- regression tests;
- build/mobile QA;
- handoff documentation.

## Job 1 design decisions

### Existing LanguageProfile remains canonical

Mouth Lab donors reference LanguageProfile.id.

They do not duplicate the full language description.

This preserves the existing Job 9 research ledger and prevents two divergent descriptions of the same language.

### Trait vault is the real gene pool

Languages are donors.

Traits are what breeding actually moves.

Examples:

- alveolar trill;
- click integration;
- ejective attack;
- lexical tone;
- mora timing;
- vowel harmony;
- open-syllable pressure;
- extreme clustering;
- consonantal nuclei;
- glottal interruption;
- consonant-to-vowel recoloring.

### Morphology is represented in the schema but not hallucinated

The current Job 9 source ledger is primarily phonological.

Therefore Job 1 does not silently invent detailed morphology for Cherokee, Inuktitut, Arabic, or other donors.

Those axes are present in the type system so a dedicated morphology source pass can populate them later without a migration.

This is deliberate.

### English is allowed to be only the semantic anchor

A future genome may preserve English semantics and English lexical material while giving pronunciation, timing, phonotactics, tone, and phonation to non-English donors.

That is the planned ENGLISH MEANING / ALIEN MOUTH mode.

## Job 1 branch

mouth-lab/job-01-foundation
