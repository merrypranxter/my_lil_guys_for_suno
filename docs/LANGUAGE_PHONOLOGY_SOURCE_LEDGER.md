# Language / Accent / Phonology Source Ledger

## Purpose

This document records the research basis and fidelity rules for Job 9 of the Little Guy Machine.

Runtime files:

- `src/data/languageProfiles.ts`
- `src/data/languageModes.ts`

The library is a **creative singing / vocal-phonology system**.

It is not:
- a claim that every speaker of a language has one accent;
- a dialect atlas;
- a pronunciation textbook;
- an ethnographic personality system;
- permission to imitate ethnic stereotypes.

The profiles deliberately compress large phonological systems into a few **musically actionable mechanisms**.

---

# Current scope

First-pass language profiles:

**104**

Reusable Language Performance Modes:

**11**

The library is intentionally broad, but it is not literally every language.

Glottolog reports thousands of spoken L1 languages, so this first pass should be understood as a diverse launch library rather than an exhaustive world-language catalog.

Architecture is expandable without another schema migration.

---

# Primary source families

## 1. PHOIBLE 2.0

https://phoible.org/

PHOIBLE is the primary cross-linguistic inventory sanity check.

PHOIBLE 2.0 describes itself as a repository of phonological inventory data compiled from source documents and tertiary databases.

The 2019 release contains:
- 3020 inventories
- 2186 distinct languages
- 3183 segment types

Important limitation:

PHOIBLE may contain multiple inventories for the same language because different source descriptions disagree.

That matters here.

Runtime cards therefore avoid pretending that one inventory is the final universal phonology of a language.

Useful entry points:

- https://phoible.org/inventories
- https://phoible.org/

Specific unusual-language examples consulted:

### Rotokas
https://phoible.org/languages/roto1249

The UPSID inventory displayed by PHOIBLE reports only 11 segments for Rotokas.

This supports using Rotokas as a deliberate **small-inventory / anti-complexity** profile.

Source trail:
- Firchow & Firchow 1969
- https://phoible.org/sources/firchow1969

### Tashlhiyt
https://phoible.org/inventories/view/2229

Used to sanity-check the highly consonant-heavy profile and small vowel core.

### Eastern Arrernte
https://phoible.org/languages/east2379

PHOIBLE contains multiple Eastern/Central Arrernte inventories from different sources.

That variation is exactly why the runtime profile stays mechanism-level rather than presenting one absolute inventory.

### Pitjantjatjara
Visible in the PHOIBLE UZ inventory collection:
https://phoible.org/contributors/UZ

---

## 2. WALS Online

https://wals.info/

WALS is used for typological context rather than as a pronunciation dictionary.

Relevant chapters:

### Consonant Inventories
https://wals.info/chapter/1

Used for:
- small versus large consonant systems;
- cross-linguistic caution about inventory size.

### Vowel Quality Inventories
https://wals.info/chapter/2

Used for:
- compact versus large vowel systems;
- five-vowel systems;
- understanding inventory comparisons separately from vowel length/nasalization.

### Glottalized Consonants
https://wals.info/chapter/7

Used for:
- ejectives;
- implosives / glottalized categories;
- geographic distribution;
- examples including Navajo, Quechua, Yucatec Maya, and Tlingit.

WALS specifically notes Tlingit among the relatively uncommon languages described with ejective fricatives.

### Front Rounded Vowels
https://wals.info/chapter/11

Used for:
- Germanic / Uralic / other profiles where front rounded vowels are an important color;
- caution that front-rounded-vowel descriptions can vary by analysis.

### Syllable Structure
https://wals.info/chapter/12

Used for:
- simple versus complex syllable structures;
- Hawaiian as a strong simple-syllable comparison;
- avoiding the false assumption that every language permits English-like clusters.

### Tone
https://wals.info/chapter/13

Used for:
- keeping tone distinct from ordinary intonation;
- treating lexical tone as meaning-bearing pitch structure rather than an optional melodic effect.

### Fixed Stress Locations
https://wals.info/chapter/14

Used for:
- initial / penultimate / other fixed-stress profiles.

### Weight-Sensitive Stress
https://wals.info/chapter/15

Used for:
- syllable weight as a stress mechanism;
- quantity-sensitive singing rules.

---

## 3. UCLA Phonetics Lab Archive

Archive:
https://archive.phonetics.ucla.edu/

Older companion site:
https://phonetics.ucla.edu/

Used for real recorded/phonetic examples and especially useful unusual-sound material.

Important licensing note:

The archive includes materials with differing rights. Runtime data uses descriptive phonetic facts only; it does **not** redistribute UCLA audio.

### Xhosa

Index / materials:
https://archive.phonetics.ucla.edu/Language/XHO/

A UCLA Xhosa word list explicitly contains click-bearing words and contrastive materials.

Used to support:
- click consonants as ordinary lexical consonants;
- Xhosa click mechanisms being integrated into syllables rather than added as novelty percussion.

### Nama / Khoekhoe

Teaching material:
https://phonetics.ucla.edu/vowels/chapter13/nama.html

Used to support:
- click articulation;
- tone-bearing examples.

### !Xóõ / Taa

Archive:
https://archive.phonetics.ucla.edu/Language/NMN/nmn.html

Used as an archival reality check for the very high-dimensional click/consonant profile.

### Juǀʼhoan

The UCLA archive includes Juǀʼhoan materials in its language index.

Used as a supporting audio/phonetic reference for the profile's click-rich system.

### Georgian

Example word lists:
https://archive.phonetics.ucla.edu/Language/KAT/

UCLA materials display contrasts such as:
- aspirated stops;
- ejective stops;
- dense clusters.

This supports the runtime rule that Georgian consonant articulation can behave like a percussion system while the vowel set stays comparatively stable.

### Navajo

Example word lists:
https://archive.phonetics.ucla.edu/Language/NAV/

UCLA materials show:
- tone;
- nasal vowels;
- vowel length;
- glottal stop;
- ejectives;
- lateral fricative material.

This supports the runtime profile's multiple independent lexical control channels.

### Welsh

Example word lists:
https://archive.phonetics.ucla.edu/Language/CYM/

UCLA material explicitly shows /ɬ/ in words written with Welsh `ll`.

This supports the **lateral-noise consonant** mechanism used in the Welsh card.

### Danish

Example word lists:
https://archive.phonetics.ucla.edu/Language/DAN/

UCLA transcriptions include glottal/stød-like material and a rich vowel system.

This supports treating stød / voice interruption as a real prosodic event rather than comedy spelling.

---

# Language classification source

## Glottolog

https://glottolog.org/

Glottolog is used as a classification / identification reference, not as the primary phonology source.

The Glottolog information page:
https://glottolog.org/glottolog/glottologinformation

describes:
- persistent Glottocodes;
- large-scale language/family classification;
- the fact that classifications can change as scholarship improves.

This reinforces an important runtime policy:

**family labels are metadata, not immutable truth claims.**

---

# Method used to create runtime profiles

Each Language Profile contains:

- family
- region
- consonant features
- vowel features
- prosody features
- rhythm notes
- compact phonology notes
- distinctive compositional mechanism
- tags
- source notes

The runtime engine then converts that into an operational rule.

The operational rule always says:

> Treat the selected language as a phonological rule system, never as a nationality costume.

---

# Why profiles are intentionally compressed

A real language can vary by:

- dialect
- age
- geography
- register
- contact history
- individual speaker
- speech rate
- sociolinguistic setting

Therefore runtime profiles favor mechanisms that remain musically useful even if a specific segment inventory differs by source.

Example:

Instead of claiming:

> EVERY Norwegian speaker uses exactly one pitch-accent realization.

the card says:

> Two lexical pitch-accent patterns occur in many varieties.

Similarly:

Instead of claiming:

> ALL Armenian has the same stop series.

the card explicitly marks the profile as dialect-sensitive.

---

# Accent / English-transfer policy

## English with L1 Phonological Transfer

This mode does **not** mean:

- imitate a nationality;
- write deliberately misspelled English;
- make the singer sound unintelligent;
- attach behavior/personality to an accent;
- exaggerate every distinctive phoneme.

It means:

The selected language profile may influence:

- syllable timing
- stress placement
- vowel reduction or preservation
- consonant cluster handling
- rhotic realization
- aspiration
- glottalization
- click availability where applicable
- lexical-tone / pitch-accent pressure
- vowel harmony
- consonant place
- length / gemination
- phonation
- resyllabification

These are **tendencies**, not mandatory properties of every bilingual speaker.

---

# Click-language policy

The project originally requested "that clicking language."

The system deliberately does not collapse click languages into one category.

Current separate profiles include:

- Zulu
- Xhosa
- Khoekhoe / Nama
- Juǀʼhoan
- Taa / !Xóõ
- Sandawe
- Hadza

Their cards do not treat clicks as novelty sound effects.

Clicks remain consonants with their own:
- places of articulation;
- accompaniments;
- laryngeal properties;
- relationship to the vowel;
- relationship to tone where relevant.

This distinction is important because the languages do **not** have interchangeable click systems.

---

# Other deliberately high-contrast profiles

The first pass includes profiles selected partly because their sound systems create useful musical constraints.

Examples:

### Ubykh

Runtime abstraction:
- extremely large consonant palette;
- very small vowel system in classical descriptions;
- consonants become the primary timbral orchestra.

### Rotokas

Runtime abstraction:
- exceptionally small phonemic inventory in a classic description;
- functions as the opposite of Ubykh/Taa.

### Nuxalk

Runtime abstraction:
- very consonant-heavy forms and extreme cluster possibilities;
- permits vocal writing where obvious vowels are sparse.

### Tashlhiyt

Runtime abstraction:
- dense consonant sequences;
- analyses allowing consonantal nuclei/syllabification;
- small core vowel inventory.

### Georgian

Runtime abstraction:
- clusters + ejectives + aspiration.

### Welsh

Runtime abstraction:
- voiceless lateral fricative /ɬ/.

### Estonian

Runtime abstraction:
- three-way quantity as a timing engine.

### Japanese

Runtime abstraction:
- mora timing + length + gemination + pitch accent.

### Yoruba / Igbo / Akan / Ewe

Runtime abstraction:
- tone as lexical structure;
- separate vowel-harmony or segmental systems where applicable.

### Punjabi

Runtime abstraction:
- a South Asian lexical-tone profile rather than reducing Indo-Aryan phonology to aspiration/retroflexion alone.

### Marshallese

Runtime abstraction:
- consonant secondary articulation strongly conditions vowel realization;
- useful as an acoustic coupling system.

---

# Native-language output policy

The app can request lyrics in the selected language.

However, profile presence alone does **not** guarantee that a generative model can produce high-quality grammatical text in every language.

Therefore the runtime mode says:

- if confidence is high, use coherent native-language lyrics;
- if confidence is low, use short reliable material;
- or use explicit non-lexical vocables governed by the phonology;
- do not fabricate fluent-looking paragraphs and silently present them as authentic.

This is especially important for endangered / underdocumented languages.

---

# Phonotactic nonsense policy

PHONOTACTIC NONSENSE is a first-class mode because it solves a real creative problem.

It allows:

- Xhosa-like click placement without pretending the vocables are Xhosa words;
- Georgian-like cluster logic without fabricating Georgian;
- Hawaiian-like open-syllable vocables;
- Japanese mora-governed nonsense;
- Taa-like high-dimensional articulatory systems;
- Turkish-like harmony-governed vocables.

Generated syllables must be identified internally as **non-lexical**.

---

# Known limitations / future expansion

1. 104 profiles are not exhaustive.
2. Several profiles summarize large dialect continua.
3. Some prosodic analyses remain contested in linguistic literature.
4. Singing phonology can differ substantially from ordinary speech.
5. English L1 transfer is speaker-specific and cannot be predicted perfectly from language identity.
6. The project currently stores one language profile at a time.
7. Future work may add dialect / variety subprofiles where there is enough value and reliable sourcing.
8. Job 17 will eventually add cross-domain chemistry between language, sound source, rhythm, ensemble, and Reality layers.

---

# Runtime anti-stereotype rules

1. Phonology first, stereotype never.
2. Never infer personality from language/accent.
3. Never infer intelligence from language/accent.
4. Never use "funny spelling" as the primary accent mechanism.
5. Treat clicks, ejectives, pharyngeals, tone, etc. as normal linguistic structures.
6. Mark dialect-sensitive claims as tendencies.
7. Do not claim native-language fluency when uncertain.
8. For low-confidence languages, phonotactic vocables are preferable to fake sentences.
9. Cultural/religious performance traditions are separate from phonology unless explicitly researched.
10. Language family metadata must not be used as a proxy for musical genre.
