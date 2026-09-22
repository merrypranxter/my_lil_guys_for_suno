import { MusicFingerprint } from '../types';

export const MUSICAL_TAXONOMY = {
  genreFamilies: [
    'funk and soul band language',
    'garage rock and proto-punk abrasion',
    'doo-wop and vocal-group pop',
    'glam and theatrical rock',
    'psychedelic pop and acid-folk color',
    'cabaret, vaudeville, and music-hall staging',
    'gospel and ecstatic ensemble singing',
    'bluegrass and old-time string-band drive',
    'surf and twang instrumental rock',
    'disco and live dance-band propulsion',
    'house and club-music repetition',
    'jungle and breakbeat science',
    'electro and machine-funk',
    'art-rock and angular post-punk',
    'chanson and dramatic narrative song',
    'orchestral bombast and overture logic',
    'marching-band and parade mechanics',
    'lounge, exotica, and novelty arrangement',
    'folk dance and communal song',
    'jazz-combo interaction and improvisational tension',
    'raga-informed melodic development',
    'Latin dance and clave-centered ensemble logic',
    'minimalist repetition and phase process',
    'industrial and abrasive electronic music'
  ],
  harmony: [
    'tight close-position vocal harmony with contrary inner motion',
    'functional major/minor harmony interrupted by chromatic side-steps',
    'quartal voicing and suspended harmonic fields',
    'modal drone harmony with shifting scale-degree emphasis',
    'spectral overtone-derived chord fields',
    'blues-dominant harmony with unstable thirds',
    'parallel triads moving as a single block',
    'gospel extensions and delayed cadential release',
    'barbershop-style voice leading with ringing dominant tension',
    'whole-tone and augmented symmetry',
    'microtonal pure intervals rubbing against equal-tempered accompaniment',
    'pedal-tone harmony with rotating upper structures',
    'bitonal layers that retain separate tonal centers',
    'diatonic sweetness repeatedly interrupted by non-diatonic clusters'
  ],
  melody: [
    'fast scat-like contour with clipped consonant attacks',
    'long melismatic arcs that ignore bar lines',
    'raga-like ornament, slides, turns, and note hierarchy',
    'yodel register flips used as melodic punctuation',
    'whistled melody doubled imperfectly by another voice',
    'angular punk phrasing with narrow repetitive cells',
    'ornamental folk turns and call-and-response phrases',
    'chromatic cabaret patter that suddenly opens into sustained vowels',
    'gospel melisma answered by blunt unison hooks',
    'hocketed fragments passed between voices and instruments',
    'retrograde phrase returns with altered interval sizes',
    'stepwise nursery-simple motifs subjected to increasingly strange decoration'
  ],
  rhythm: [
    'deep funk pocket with syncopated sixteenth-note displacement',
    'swinging triplet subdivision under straight melodic phrasing',
    'footwork-speed kick logic with spacious upper layers',
    'clave-centered cross-rhythm',
    'motorik pulse with periodic missing beats',
    'waltz pulse invaded by duple accents',
    'additive Balkan-style asymmetric meter',
    'half-time stomp with rapid ornamental subdivisions',
    'breakbeat chopping with preserved backbeat landmarks',
    'disco four-on-the-floor with syncopated live percussion',
    'march cadence deformed by tuplets',
    'free-rubato vocal timing over an inflexible dance pulse',
    'polyrhythmic 3-against-4 and 5-against-4 coexistence',
    'shuffle groove with abrupt metric compression',
    'stuttering stop-start punk rhythm with hard silences'
  ],
  timbre: [
    'dry close-miked drums, electric bass, handclaps, and bright brass',
    'fuzz guitar, cheap organ, tambourine, and room bleed',
    'upright bass, brushed percussion, vibraphone, and breathy reeds',
    'banjo, fiddle, mandolin, stomps, and body percussion',
    'gospel piano, organ swells, handclaps, and massed voices',
    'surf guitar, spring reverb, floor toms, and tack piano',
    'Balkan brass, snare drum, accordion, and vocal shouts',
    'toy instruments, whistles, spoons, kazoo-like reeds, and orchestral percussion',
    'lush strings, harp, timpani, and absurdly oversized brass',
    'glass harmonica, bowed metal, prepared piano, and acoustic percussion',
    'analog synth bass, drum-machine transients, vocoder fragments, and hand percussion',
    'sampled breakbeats, sub-bass, chopped vocals, and bright digital stabs',
    'industrial metal percussion, distorted electronics, and tape abrasion'
  ],
  vocal: [
    'dry deadpan spoken narration',
    'rapid scat syllables functioning as percussion',
    'doo-wop nonsense vocables in stacked harmony',
    'operatic recitative with sudden comic overstatement',
    'yodeling with deliberate register cracks',
    'call-and-response between soloist and ensemble',
    'tight polyphonic counterpoint with independent lyric timing',
    'patter singing at near-spoken speed',
    'whispered ensemble rhythm under a full-voice lead',
    'falsetto flips and whistle-register punctuation',
    'open-vowel melisma with hard consonants reserved for downbeats',
    'nasal drone singing supporting brighter upper voices',
    'hocketed syllables split across multiple singers',
    'overtone-rich sustained singing used as a harmonic layer',
    'ululation and rolled consonants used as acceleration cues'
  ],
  performance: [
    'ecstatic and physically committed',
    'deadpan precision while the arrangement behaves absurdly',
    'cocky dance-floor swagger',
    'theatrical overstatement played completely straight',
    'communal singalong urgency',
    'garage-band recklessness with disciplined timing',
    'hyper-articulate nervous energy',
    'joyful competitive call-and-response',
    'ceremonial grandeur applied to trivial material',
    'sweetly earnest delivery against structurally hostile accompaniment'
  ],
  production: [
    '1960s-style mono room capture with bleed',
    '1970s dry studio band recording',
    'cheap four-track cassette saturation',
    'glossy 1980s wide stereo production',
    'tiny transistor-radio bandwidth as a recurring contrast',
    'pristine modern close-mic clarity',
    'live club room with audible audience-space reflections',
    'dub-like spatial throws and abrupt reverb dropouts',
    'bedroom recording with intentionally uneven gain staging',
    'large orchestral stage perspective',
    'hard digital editing with otherwise acoustic instrumentation',
    'abrasive industrial tape and metallic processing'
  ]
} as const;

export const MUSICAL_VOCABULARY_PROMPT = [
  'GENRE/PERFORMANCE FAMILIES: ' + MUSICAL_TAXONOMY.genreFamilies.join('; '),
  'HARMONY OPTIONS: ' + MUSICAL_TAXONOMY.harmony.join('; '),
  'MELODIC OPTIONS: ' + MUSICAL_TAXONOMY.melody.join('; '),
  'RHYTHMIC OPTIONS: ' + MUSICAL_TAXONOMY.rhythm.join('; '),
  'TIMBRE OPTIONS: ' + MUSICAL_TAXONOMY.timbre.join('; '),
  'VOCAL OPTIONS: ' + MUSICAL_TAXONOMY.vocal.join('; '),
  'PERFORMANCE OPTIONS: ' + MUSICAL_TAXONOMY.performance.join('; '),
  'PRODUCTION OPTIONS: ' + MUSICAL_TAXONOMY.production.join('; ')
].join('\n');

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function recentText(recent: MusicFingerprint[]): string {
  return recent.map((f) => Object.values(f).join(' ')).join(' ').toLowerCase();
}

function choose<T extends readonly string[]>(pool: T, recent: MusicFingerprint[], salt = 0): string {
  const used = recentText(recent);
  const scored = pool.map((item, index) => {
    const needle = normalize(item).split(' ').slice(0, 4).join(' ');
    const penalty = needle && used.includes(needle) ? 100 : 0;
    return { item, score: penalty + Math.random() * 20 + ((index + salt) % 7) * 0.01 };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored[0].item;
}

export function chooseDiverseFingerprint(recent: MusicFingerprint[] = []): MusicFingerprint {
  const trimmed = recent.slice(0, 12);
  return {
    genreFamily: choose(MUSICAL_TAXONOMY.genreFamilies, trimmed, 1),
    harmony: choose(MUSICAL_TAXONOMY.harmony, trimmed, 2),
    melody: choose(MUSICAL_TAXONOMY.melody, trimmed, 3),
    rhythm: choose(MUSICAL_TAXONOMY.rhythm, trimmed, 4),
    timbre: choose(MUSICAL_TAXONOMY.timbre, trimmed, 5),
    vocal: choose(MUSICAL_TAXONOMY.vocal, trimmed, 6),
    performance: choose(MUSICAL_TAXONOMY.performance, trimmed, 7),
    production: choose(MUSICAL_TAXONOMY.production, trimmed, 8)
  };
}

export function fingerprintToLine(f: MusicFingerprint): string {
  return [
    f.genreFamily,
    'harmony=' + f.harmony,
    'melody=' + f.melody,
    'rhythm=' + f.rhythm,
    'timbre=' + f.timbre,
    'vocal=' + f.vocal,
    'performance=' + f.performance,
    'production=' + f.production
  ].join(' | ');
}
