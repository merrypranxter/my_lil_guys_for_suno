# Job 9 — Language / Accent / Phonology Engine Handoff

Status: COMPLETE

## What shipped

Job 9 populates the first two VOICE LAB dimensions:

- **LANGUAGE / PHONOLOGY**
- **LANGUAGE PERFORMANCE MODE**

New runtime files:

- `src/data/languageProfiles.ts`
- `src/data/languageModes.ts`

New research ledger:

- `docs/LANGUAGE_PHONOLOGY_SOURCE_LEDGER.md`

Updated:

- `src/types.ts`
- `src/data/compositionEngines.ts`
- `src/lib/buildGenerationPrompt.ts`
- `src/lib/proceduralGenerator.ts`

---

# Counts

Language profiles:

**104**

Language performance modes:

**11**

New registered Composition Lab engines:

**115**

Duplicate runtime IDs in Job 9 data:

**0**

Cardinality remains:

- language: 0–1
- languageMode: 0–1

---

# Architecture

## LanguageProfile

Job 9 adds a reusable `LanguageProfile` type with:

- family
- region
- consonant features
- vowel features
- prosody features
- rhythm notes
- phonology notes
- distinctive compositional features
- tags
- source notes

Each profile is converted into a normal `CompositionEngine` at runtime.

That means the general Composition Lab selection/persistence/request machinery from Job 8 does not need a special second transport format.

The richer profile metadata still remains available for the dedicated language UI later.

Helpers added:

- `getLanguageProfile(id)`
- `searchLanguageProfiles(query)`

---

# Accent model

The system does **not** store "funny accent" cards.

It stores:

1. one LANGUAGE / PHONOLOGY profile;
2. one separate LANGUAGE PERFORMANCE MODE.

Example:

`XHOSA`

plus:

`ENGLISH WITH L1 PHONOLOGICAL TRANSFER`

means:

- lyrics remain semantically English;
- selected Xhosa phonological/prosodic features can influence the vocal behavior;
- the model is explicitly forbidden from replacing phonological transfer with comic spelling or personality stereotypes.

This keeps the architecture combinatorial instead of requiring a separate "Xhosa English accent", "French English accent", "Japanese English accent", etc. card for every language.

---

# Fidelity rules now injected into generation

The master prompt now includes a dedicated:

## LANGUAGE / ACCENT FIDELITY

section whenever a language is active.

Rules include:

- phonology first, stereotype never;
- never infer personality, intelligence, class, morality, or character from language/accent;
- do not use eye-dialect spelling as the main accent mechanism;
- English L1 transfer keeps the semantic lyric English;
- use segment, syllable, timing, and prosodic transfer rather than parody;
- clicks, ejectives, pharyngeals, tone, pitch accent, harmony, length, and phonation are normal linguistic structures;
- dialect-sensitive profile descriptions are tendencies, not universal claims;
- native-language output should not fabricate fluent-looking text when model confidence is weak.

If a LANGUAGE profile is selected without a LANGUAGE MODE, the generator is explicitly told:

**use it as mouth/prosody guidance only; do not automatically force non-English lyrics.**

---

# Native-language uncertainty rule

For common high-resource languages, the generation model may be able to produce normal lyrics directly.

For endangered / underdocumented languages, the runtime rules say:

- use coherent native-language text only when sufficiently confident;
- otherwise use short reliable phrases;
- or switch to explicitly non-lexical phonotactic vocables;
- never silently invent paragraphs and present them as authentic language.

This is one reason **PHONOTACTIC NONSENSE** is a first-class mode.

---

# Click languages are separate systems

The library does not have one generic "click language" button.

Separate first-pass profiles include:

- Zulu
- Xhosa
- Khoekhoe / Nama
- Juǀʼhoan
- Taa / !Xóõ
- Sandawe
- Hadza

Their rules differ.

Clicks are treated as speech consonants with place/accompaniment behavior, not a novelty sound-effect layer.

---

# Research basis

The source ledger documents the distinction between compact runtime abstraction and full linguistic description.

Primary research families:

- **PHOIBLE 2.0** — cross-linguistic phonological inventories
- **WALS Online** — typological context for tone, syllable structure, stress, vowel/consonant inventories, glottalized consonants, etc.
- **UCLA Phonetics Lab Archive** — recorded/phonetic materials, especially useful for Xhosa, Nama, Taa, Juǀʼhoan, Georgian, Navajo, Welsh, Danish, and other profiles
- **Glottolog** — language/family identification and classification context

The ledger explicitly warns that:
- sources may disagree;
- dialects differ;
- family classifications may change;
- a runtime profile is not a universal statement about every speaker.

---

# Especially fun profiles in the first pass

Some high-contrast systems now available under the hood:

- TAA / !XÓÕ — high-dimensional click/consonant system
- JUǀʼHOAN — click place + accompaniment + tone + vowel voice-quality pressure
- XHOSA — click consonants inside Bantu tonal syllable flow
- KHOEKHOE / NAMA — dense click-place/accompaniment system + tone
- HADZA — clicks plus ejective/laryngeal attacks
- GEORGIAN — extreme clusters + ejectives + aspiration
- NAVAJO — tone + nasalization + length + ejectives + lateral fricative
- TLINGIT — uvular/lateral systems plus rare ejective-fricative territory
- WELSH — /ɬ/ lateral-fricative vocal texture
- DANISH — stød / glottal interruption + large vowel space
- ESTONIAN — three-way quantity as timing control
- JAPANESE — mora timing + length + gemination + pitch accent
- PUNJABI — South Asian lexical tone
- YORUBA / IGBO / AKAN / EWE — tonal systems with different secondary vowel/consonant organization
- GUARANI — nasal harmony as a long-range resonance rule
- YUCATEC MAYA — tone + vowel length + phonation + ejectives
- NUXALK — extreme consonant clustering
- TASHLHIYT — consonant-heavy syllabification / consonantal nuclei territory
- UBYKH — enormous consonant palette against a tiny vowel system
- ROTOKAS — the opposite extreme: deliberately tiny inventory
- MARSHALLESE — consonant secondary articulation continuously recolors vowel realization
- EASTERN ARRERNTE / WARLPIRI / PITJANTJATJARA — high-resolution Australian coronal-place systems

---

# Language performance modes

1. `language-mode-native` — SING IN SELECTED LANGUAGE
2. `language-mode-english-l1-transfer` — ENGLISH WITH L1 PHONOLOGICAL TRANSFER
3. `language-mode-code-switch` — CODE-SWITCH
4. `language-mode-native-english-refrain` — SELECTED LANGUAGE + ENGLISH REFRAIN
5. `language-mode-english-native-interjections` — ENGLISH + SELECTED-LANGUAGE INTERJECTIONS
6. `language-mode-phonotactic-nonsense` — PHONOTACTIC NONSENSE
7. `language-mode-formal-ceremonial` — FORMAL / CEREMONIAL REGISTER
8. `language-mode-conversational` — CONVERSATIONAL REGISTER
9. `language-mode-rapid-patter` — RAPID PATTER
10. `language-mode-chant-recitation` — CHANT / RECITATION
11. `language-mode-call-response` — LANGUAGE CALL / RESPONSE

---

# Full first-pass profile registry

1. `lang-english` — ENGLISH
2. `lang-spanish` — SPANISH
3. `lang-french` — FRENCH
4. `lang-portuguese` — PORTUGUESE
5. `lang-italian` — ITALIAN
6. `lang-german` — GERMAN
7. `lang-dutch` — DUTCH
8. `lang-swedish` — SWEDISH
9. `lang-norwegian` — NORWEGIAN
10. `lang-danish` — DANISH
11. `lang-icelandic` — ICELANDIC
12. `lang-irish` — IRISH
13. `lang-scottish-gaelic` — SCOTTISH GAELIC
14. `lang-welsh` — WELSH
15. `lang-breton` — BRETON
16. `lang-basque` — BASQUE
17. `lang-albanian` — ALBANIAN
18. `lang-greek` — GREEK
19. `lang-russian` — RUSSIAN
20. `lang-ukrainian` — UKRAINIAN
21. `lang-polish` — POLISH
22. `lang-czech` — CZECH
23. `lang-romanian` — ROMANIAN
24. `lang-hungarian` — HUNGARIAN
25. `lang-finnish` — FINNISH
26. `lang-estonian` — ESTONIAN
27. `lang-northern-sami` — NORTHERN SÁMI
28. `lang-georgian` — GEORGIAN
29. `lang-armenian` — ARMENIAN
30. `lang-chechen` — CHECHEN
31. `lang-avar` — AVAR
32. `lang-lezgian` — LEZGIAN
33. `lang-arabic-msa` — ARABIC — MODERN STANDARD PROFILE
34. `lang-hebrew-modern` — HEBREW — MODERN
35. `lang-persian` — PERSIAN
36. `lang-kurdish-kurmanji` — KURDISH — KURMANJI
37. `lang-turkish` — TURKISH
38. `lang-azerbaijani` — AZERBAIJANI
39. `lang-kazakh` — KAZAKH
40. `lang-kyrgyz` — KYRGYZ
41. `lang-mongolian` — MONGOLIAN — KHALKHA PROFILE
42. `lang-hindi` — HINDI
43. `lang-urdu` — URDU
44. `lang-bengali` — BENGALI
45. `lang-punjabi` — PUNJABI — EASTERN TONAL PROFILE
46. `lang-nepali` — NEPALI
47. `lang-tamil` — TAMIL
48. `lang-telugu` — TELUGU
49. `lang-kannada` — KANNADA
50. `lang-malayalam` — MALAYALAM
51. `lang-sanskrit-classical` — SANSKRIT — CLASSICAL PHONOLOGY PROFILE
52. `lang-mandarin` — MANDARIN CHINESE
53. `lang-cantonese` — CANTONESE
54. `lang-vietnamese` — VIETNAMESE — NORTHERN-LEANING PROFILE
55. `lang-thai` — THAI
56. `lang-lao` — LAO
57. `lang-khmer` — KHMER
58. `lang-burmese` — BURMESE
59. `lang-japanese` — JAPANESE
60. `lang-korean` — KOREAN
61. `lang-ainu` — AINU
62. `lang-indonesian` — INDONESIAN
63. `lang-javanese` — JAVANESE
64. `lang-tagalog` — TAGALOG / FILIPINO PHONOLOGY PROFILE
65. `lang-maori` — MĀORI
66. `lang-hawaiian` — HAWAIIAN
67. `lang-samoan` — SAMOAN
68. `lang-tongan` — TONGAN
69. `lang-fijian` — FIJIAN
70. `lang-swahili` — SWAHILI
71. `lang-yoruba` — YORUBA
72. `lang-igbo` — IGBO
73. `lang-akan` — AKAN / TWI-LEANING PROFILE
74. `lang-ewe` — EWE
75. `lang-hausa` — HAUSA
76. `lang-somali` — SOMALI
77. `lang-amharic` — AMHARIC
78. `lang-zulu` — ZULU
79. `lang-xhosa` — XHOSA
80. `lang-khoekhoe` — KHOEKHOE / NAMA
81. `lang-juhoan` — JUǀʼHOAN
82. `lang-taa` — TAA / !XÓÕ
83. `lang-sandawe` — SANDAWE
84. `lang-hadza` — HADZA
85. `lang-navajo` — NAVAJO
86. `lang-tlingit` — TLINGIT
87. `lang-inuktitut` — INUKTITUT
88. `lang-kalaallisut` — KALAALLISUT / GREENLANDIC
89. `lang-mohawk` — MOHAWK
90. `lang-quechua` — QUECHUA — SOUTHERN HIGHLAND PROFILE
91. `lang-aymara` — AYMARA
92. `lang-guarani` — GUARANI
93. `lang-nahuatl` — NAHUATL
94. `lang-yucatec-maya` — YUCATEC MAYA
95. `lang-mapudungun` — MAPUDUNGUN
96. `lang-cherokee` — CHEROKEE
97. `lang-nuxalk` — NUXALK
98. `lang-tashlhiyt` — TASHLHIYT
99. `lang-ubykh` — UBYKH
100. `lang-rotokas` — ROTOKAS
101. `lang-warlpiri` — WARLPIRI
102. `lang-arrernte-eastern` — EASTERN ARRERNTE
103. `lang-pitjantjatjara` — PITJANTJATJARA
104. `lang-marshallese` — MARSHALLESE

---

# Procedural fallback

The procedural fallback now detects:

- active language profile
- active language mode

and writes a dedicated LANGUAGE SYSTEM / LANGUAGE FIDELITY instruction into STYLE and LYRICS / CONTROL.

Therefore the language mechanism is not silently lost during API outages.

---

# What is NOT visible yet

The data is registered now, but the dedicated Composition Lab UI is still **Job 16**.

So pulling this commit does **not** yet produce a giant language browser on screen.

Job 9 deliberately finishes the language intelligence/library first.

The future UI can search the profile metadata by:

- name
- family
- region
- click
- tone
- ejective
- front rounded
- vowel harmony
- extreme clusters
- small inventory
- pitch accent
- etc.

without another data-model rewrite.

---

# Static verification

Verified by repository inspection:

- 104 language profile IDs
- 11 language-mode IDs
- 0 duplicate Job 9 IDs
- profile registry imported into Composition Lab
- mode registry imported into Composition Lab
- `LanguageProfile` type present
- language search/lookup helpers present
- prompt builder contains LANGUAGE / ACCENT FIDELITY block
- procedural fallback contains language fidelity handling
- language cardinality remains 1
- languageMode cardinality remains 1
- lexical/bracket balance checks passed on all Job 9 TypeScript files

A full `npm run lint` / `npm run build` could not be executed from this environment because the working runtime cannot reach GitHub/npm to materialize/install the repository. Static repository validation was performed instead.

---

# Next planned job

## Job 10 — SOUND PALETTE / INSTRUMENT / NOISE LIBRARY

Target:

**180–300 sound sources**

including:

- conventional instruments
- regional/traditional instruments
- historical instruments
- experimental instruments
- prepared / invented instruments
- machines
- obsolete media technology
- domestic objects
- industrial objects
- body sounds
- animals / insects
- environmental sounds
- communications noise
- synthesis systems
- resonant materials

Each source gets a musical behavior, not just a noun.
