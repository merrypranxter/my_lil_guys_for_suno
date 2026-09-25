import { LANGUAGE_PROFILES } from '../data/languageProfiles';
import { MouthDonor } from './types';

const LEDGER = 'docs/LANGUAGE_PHONOLOGY_SOURCE_LEDGER.md';

function donor(
  profileId: string,
  name: string,
  whyUseful: string,
  traitIds: string[],
  preferredAxes: MouthDonor['preferredAxes'],
  doNotClaim: string[] = [],
  confidence: MouthDonor['confidence'] = 'high',
): MouthDonor {
  return {
    id: 'mouth-donor-' + profileId.replace(/^lang-/, ''),
    languageProfileId: profileId,
    name,
    whyUseful,
    traitIds,
    preferredAxes,
    confidence,
    sourceNotes: [LEDGER, 'src/data/languageProfiles.ts#' + profileId],
    doNotClaim,
  };
}

export const MOUTH_DONORS: MouthDonor[] = [
  donor(
    'lang-english',
    'ENGLISH',
    'Useful primarily as a semantic/lexical anchor and as the baseline system that other traits can visibly deform.',
    [],
    ['semantics', 'lexicon', 'stress', 'timing'],
    ['Do not treat one English variety as the universal neutral accent.'],
  ),
  donor(
    'lang-spanish',
    'SPANISH',
    'Clear trill/tap territory, stable five-vowel pressure, and comparatively full unstressed vowels make it ideal for single-trait outbreaks.',
    ['mouth-trait-alveolar-trill', 'mouth-trait-full-vowel-preservation'],
    ['consonants', 'vowels', 'timing'],
  ),
  donor(
    'lang-french',
    'FRENCH',
    'Useful for uvular rhotic color, nasal/front-rounded vowels, and phrase-level prominence.',
    ['mouth-trait-uvular-rhotic', 'mouth-trait-nasal-vowels', 'mouth-trait-front-rounded-vowels', 'mouth-trait-phrase-prosody'],
    ['consonants', 'vowels', 'prosody'],
    ['Do not collapse all French varieties into one rhotic or prosodic realization.'],
  ),
  donor(
    'lang-danish',
    'DANISH',
    'Adds stød/glottal-interruption pressure plus a broad vowel-color space.',
    ['mouth-trait-stod', 'mouth-trait-front-rounded-vowels'],
    ['larynx', 'phonation', 'vowels'],
    ['Stød is not generic vocal fry and should not be applied randomly to every syllable.'],
  ),
  donor(
    'lang-estonian',
    'ESTONIAN',
    'A clean donor for three-way quantity and timing mutation.',
    ['mouth-trait-three-way-quantity'],
    ['timing', 'prosody', 'vowels', 'consonants'],
  ),
  donor(
    'lang-georgian',
    'GEORGIAN',
    'Dense clusters plus ejective/aspirated attack contrasts create strong consonant percussion.',
    ['mouth-trait-extreme-cluster', 'mouth-trait-ejective-attack'],
    ['consonants', 'phonotactics', 'airflow'],
  ),
  donor(
    'lang-arabic-msa',
    'ARABIC — MODERN STANDARD PROFILE',
    'Useful for pharyngeal/uvular/emphatic color, gemination, and strong consonant-vowel interaction.',
    ['mouth-trait-pharyngeal-emphatic', 'mouth-trait-gemination'],
    ['consonants', 'vowels', 'larynx', 'timing'],
    ['This donor is a formal MSA-oriented abstraction; do not present it as the phonology of every Arabic variety.'],
  ),
  donor(
    'lang-turkish',
    'TURKISH',
    'A strong vowel-harmony donor for long-range agreement rules.',
    ['mouth-trait-vowel-harmony'],
    ['vowels', 'phonotactics'],
  ),
  donor(
    'lang-hungarian',
    'HUNGARIAN',
    'Useful for vowel harmony plus front-rounded vowel color.',
    ['mouth-trait-vowel-harmony', 'mouth-trait-front-rounded-vowels'],
    ['vowels', 'phonotactics'],
  ),
  donor(
    'lang-mandarin',
    'MANDARIN CHINESE',
    'A tonal donor for mapping syllable pitch categories into melody constraints.',
    ['mouth-trait-lexical-tone'],
    ['tone', 'prosody'],
    ['Tone categories and sandhi are richer than a generic four-arrow caricature.'],
  ),
  donor(
    'lang-cantonese',
    'CANTONESE',
    'A dense tonal donor useful when many syllable-level pitch categories need to remain distinct.',
    ['mouth-trait-lexical-tone'],
    ['tone', 'prosody'],
    ['Do not reduce the system to a fixed number of tones without variety/context qualification.'],
  ),
  donor(
    'lang-vietnamese',
    'VIETNAMESE — NORTHERN-LEANING PROFILE',
    'Useful for coupling lexical pitch with laryngeal/phonation behavior.',
    ['mouth-trait-lexical-tone', 'mouth-trait-tone-plus-phonation'],
    ['tone', 'phonation', 'larynx'],
    ['The runtime profile is northern-leaning; do not generalize it to every Vietnamese variety.'],
  ),
  donor(
    'lang-japanese',
    'JAPANESE',
    'Mora timing, length, gemination, and pitch-accent pressure make it an unusually strong timing donor.',
    ['mouth-trait-mora-timing', 'mouth-trait-vowel-length', 'mouth-trait-gemination', 'mouth-trait-pitch-accent'],
    ['timing', 'syllableStructure', 'tone'],
    ['Pitch-accent behavior varies substantially by dialect.'],
  ),
  donor(
    'lang-hawaiian',
    'HAWAIIAN',
    'Small inventory plus open-syllable and mora/length pressure makes it a powerful antagonist to cluster-heavy donors.',
    ['mouth-trait-open-syllable-pressure', 'mouth-trait-vowel-length', 'mouth-trait-glottal-stop', 'mouth-trait-tiny-inventory', 'mouth-trait-full-vowel-preservation'],
    ['phonotactics', 'syllableStructure', 'vowels', 'timing'],
  ),
  donor(
    'lang-yoruba',
    'YORUBA',
    'Three-level lexical tone plus strong open-syllable pressure offers clear pitch and syllable jurisdictions.',
    ['mouth-trait-lexical-tone', 'mouth-trait-open-syllable-pressure'],
    ['tone', 'phonotactics', 'vowels'],
  ),
  donor(
    'lang-xhosa',
    'XHOSA',
    'Click consonants integrated into ordinary Bantu syllable/tonal structure make an excellent click donor without novelty-sound-effect framing.',
    ['mouth-trait-click-bantu', 'mouth-trait-lexical-tone', 'mouth-trait-prenasalized-attack'],
    ['consonants', 'airflow', 'tone'],
  ),
  donor(
    'lang-khoekhoe',
    'KHOEKHOE / NAMA',
    'High-resolution click place/accompaniment behavior makes it useful for assigning different click classes different musical jobs.',
    ['mouth-trait-click-high-dimensional'],
    ['consonants', 'airflow', 'larynx'],
  ),
  donor(
    'lang-juhoan',
    'JUǀʼHOAN',
    'Rich click inventory plus tone, nasalization, and phonation creates a multi-axis articulatory donor.',
    ['mouth-trait-click-high-dimensional', 'mouth-trait-lexical-tone', 'mouth-trait-nasal-vowels', 'mouth-trait-tone-plus-phonation', 'mouth-trait-huge-consonant-palette'],
    ['consonants', 'airflow', 'phonation', 'tone'],
  ),
  donor(
    'lang-taa',
    'TAA / !XÓÕ',
    'One of the strongest extreme-mouth donors: enormous click/consonant space plus tone and phonation dimensions.',
    ['mouth-trait-click-high-dimensional', 'mouth-trait-lexical-tone', 'mouth-trait-nasal-vowels', 'mouth-trait-glottalized-vowels', 'mouth-trait-huge-consonant-palette', 'mouth-trait-tone-plus-phonation'],
    ['consonants', 'airflow', 'larynx', 'phonation', 'tone'],
    ['Use language-specific click distinctions; do not treat this as a generic template for all click languages.'],
  ),
  donor(
    'lang-navajo',
    'NAVAJO',
    'Combines ejectives, glottal/lateral consonants, vowel length/nasalization, and lexical tone across independent axes.',
    ['mouth-trait-ejective-attack', 'mouth-trait-lateral-fricative', 'mouth-trait-nasal-vowels', 'mouth-trait-vowel-length', 'mouth-trait-lexical-tone', 'mouth-trait-glottal-stop'],
    ['consonants', 'vowels', 'larynx', 'tone', 'timing'],
  ),
  donor(
    'lang-tlingit',
    'TLINGIT',
    'Useful for ejective/lateral/uvular consonant territory and rare attack colors.',
    ['mouth-trait-ejective-attack'],
    ['consonants', 'airflow', 'larynx'],
    ['Dialect-sensitive inventory details should remain mechanism-level.'],
  ),
  donor(
    'lang-guarani',
    'GUARANI',
    'Nasal harmony can behave like a long-range resonance infection across a word or phrase.',
    ['mouth-trait-nasal-harmony', 'mouth-trait-nasal-vowels', 'mouth-trait-glottal-stop'],
    ['vowels', 'phonation', 'phonotactics'],
  ),
  donor(
    'lang-yucatec-maya',
    'YUCATEC MAYA',
    'Tone, vowel length, glottalization/phonation, and ejectives provide several separable jurisdictions.',
    ['mouth-trait-ejective-attack', 'mouth-trait-vowel-length', 'mouth-trait-lexical-tone', 'mouth-trait-glottalized-vowels', 'mouth-trait-glottal-stop'],
    ['consonants', 'vowels', 'larynx', 'tone', 'timing'],
    ['This is Yucatec Maya specifically, not a generic Mayan-language profile.'],
  ),
  donor(
    'lang-cherokee',
    'CHEROKEE',
    'Tone/length plus a relatively compact consonant system provide a distinct donor without pretending one generic Indigenous sound exists.',
    ['mouth-trait-lexical-tone', 'mouth-trait-vowel-length'],
    ['tone', 'vowels', 'timing'],
    ['Morphological/polysynthetic breeding is intentionally deferred until the dedicated morphology source pass; do not invent it from the phonology profile.'],
  ),
  donor(
    'lang-inuktitut',
    'INUKTITUT',
    'Velar/uvular contrast, length, and assimilation provide strong mouth-position and timing behavior.',
    ['mouth-trait-vowel-length'],
    ['consonants', 'phonotactics', 'timing'],
    ['Polysynthetic word-building is intentionally deferred until the morphology source pass.'],
  ),
  donor(
    'lang-nuxalk',
    'NUXALK',
    'Extreme consonant clustering creates a powerful high-density antagonist to open-syllable donors.',
    ['mouth-trait-extreme-cluster'],
    ['consonants', 'phonotactics', 'syllableStructure'],
  ),
  donor(
    'lang-tashlhiyt',
    'TASHLHIYT',
    'Dense consonant sequences and consonantal-nucleus analyses make it ideal for vowel-starvation and syllable-boundary experiments.',
    ['mouth-trait-extreme-cluster', 'mouth-trait-consonantal-nucleus', 'mouth-trait-vowel-starvation', 'mouth-trait-pharyngeal-emphatic'],
    ['consonants', 'phonotactics', 'syllableStructure', 'vowels'],
    ['Consonantal-nucleus behavior is analysis-sensitive; use it as a bounded creative mechanism, not a universal claim about every utterance.'],
  ),
  donor(
    'lang-ubykh',
    'UBYKH',
    'An enormous consonant palette against a tiny vowel system creates maximum consonant-color / minimum-vowel asymmetry.',
    ['mouth-trait-huge-consonant-palette', 'mouth-trait-vowel-starvation'],
    ['consonants', 'vowels', 'airflow'],
    ['Ubykh is historical/extinct; do not imply a living speech community.'],
  ),
  donor(
    'lang-rotokas',
    'ROTOKAS',
    'A deliberately tiny segment inventory makes an excellent lossy-compression donor.',
    ['mouth-trait-tiny-inventory'],
    ['consonants', 'vowels', 'phonotactics'],
  ),
  donor(
    'lang-marshallese',
    'MARSHALLESE',
    'Secondary articulation strongly recolors neighboring vowels, giving us a direct causal consonant-to-vowel operator.',
    ['mouth-trait-consonant-vowel-coupling'],
    ['consonants', 'vowels', 'phonotactics'],
  ),
  donor(
    'lang-welsh',
    'WELSH',
    'The voiceless lateral fricative supplies a distinctive sustained-noise consonant that can be isolated as a micro-mutation.',
    ['mouth-trait-lateral-fricative'],
    ['consonants', 'airflow'],
  ),
];

export const MOUTH_DONOR_BY_ID = new Map(MOUTH_DONORS.map((item) => [item.id, item]));
export const MOUTH_DONOR_BY_LANGUAGE_PROFILE_ID = new Map(
  MOUTH_DONORS.map((item) => [item.languageProfileId, item]),
);

export function getMouthDonor(id: string): MouthDonor | undefined {
  return MOUTH_DONOR_BY_ID.get(id);
}

export function getMouthDonorForLanguageProfile(profileId: string): MouthDonor | undefined {
  return MOUTH_DONOR_BY_LANGUAGE_PROFILE_ID.get(profileId);
}

export function searchMouthDonors(query: string): MouthDonor[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return MOUTH_DONORS;

  return MOUTH_DONORS.filter((item) => {
    const profile = LANGUAGE_PROFILES.find((candidate) => candidate.id === item.languageProfileId);
    return [
      item.name,
      item.whyUseful,
      profile?.family ?? '',
      profile?.region ?? '',
      ...(profile?.tags ?? []),
      ...item.traitIds,
    ]
      .join(' ')
      .toLowerCase()
      .includes(needle);
  });
}
