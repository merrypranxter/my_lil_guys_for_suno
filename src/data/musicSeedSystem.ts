import {
  MusicBredGenome,
  MusicControls,
  MusicMechanism,
  MusicMechanismFamily,
  MusicSeedRecipe,
  MusicStackItem,
} from '../types';

export const DEFAULT_MUSIC_CONTROLS: MusicControls = {
  stemminess: 55,
  kineticDensity: 62,
  socialInfection: 42,
  coupling: 48,
  interruption: 45,
  anchorStrength: 62,
  castSize: 42,
};

export const MUSIC_FEEDBACK_TAGS = [
  'THE GROOVE',
  'THE COUPLING',
  'THE VOICES',
  'THE YELLING / ENERGY',
  'THE ARRANGEMENT',
  'THE STEM SEPARATION',
  'THE INSTRUMENTS',
  'THE MUTATIONS',
  'THE CONTRASTS',
  'THE ANCHOR',
  'THE WHOLE FUCKING THING',
] as const;

export const MUSIC_MECHANISMS: MusicMechanism[] = [
  {
    id: 'pulse-coupling-3-2',
    family: 'rhythm',
    name: '3:2 COUPLING',
    shortExplanation: 'One shared subdivision, two valid accent maps: 3+3 against 2+2+2.',
    instruction:
      'Use one common six-pulse substrate. Give one population a 3+3 accent interpretation and another a 2+2+2 interpretation. Both readings must stay bodily legible; the pleasure comes from shared time with incompatible grouping, not from random meter changes.',
    tags: ['coupling', 'hemiola', 'shared-pulse', 'polyrhythm'],
    stemValue: 4,
    chaos: 3,
  },
  {
    id: 'meter-collision',
    family: 'rhythm',
    name: 'METER COLLISION',
    shortExplanation: 'Two rhythmic jurisdictions keep separate clocks while sharing enough landmarks to remain danceable.',
    instruction:
      'Assign incompatible meter or cycle logic to separate layers. Preserve recurring alignment points so the collision is measurable and physical. Do not smear the layers into generic syncopation.',
    tags: ['polymeter', 'cycle', 'friction'],
    stemValue: 4,
    chaos: 4,
  },
  {
    id: 'double-time-activity',
    family: 'rhythm',
    name: 'DOUBLE-TIME HALLUCINATION',
    shortExplanation: 'Base tempo and activity rate become separate variables.',
    instruction:
      'Keep a moderate, graspable base pulse while percussion, syllables, ornaments, or secondary figures operate at roughly double the event rate. The skeleton may walk while the bloodstream sprints.',
    tags: ['activity-rate', 'kinetic-density', 'double-time'],
    stemValue: 3,
    chaos: 3,
  },
  {
    id: 'false-resolution',
    family: 'rhythm',
    name: 'FALSE RESOLUTION',
    shortExplanation: 'Apparent rhythmic arrivals immediately reveal a new unresolved grouping.',
    instruction:
      'Create periodic moments that feel like rhythmic resolution, then preserve the pulse while changing which accents define the next cycle. Resolve tension into a stranger version of the same clock.',
    tags: ['resolution', 'accent', 'mutation'],
    stemValue: 2,
    chaos: 3,
  },
  {
    id: 'hard-interrupts',
    family: 'form',
    name: 'HARD INTERRUPTS',
    shortExplanation: 'New events are allowed to cut cleanly across the current section instead of politely waiting.',
    instruction:
      'Use abrupt stops, entries, spoken interruptions, instrument stabs, silence, or meter cuts as structural punctuation. Every interruption must have an identifiable cause and consequence.',
    tags: ['interrupt', 'cut', 'contrast'],
    stemValue: 4,
    chaos: 4,
  },
  {
    id: 'communal-infection',
    family: 'vocal',
    name: 'COMMUNAL INFECTION',
    shortExplanation: 'Excitement spreads from one performer to other humans over time.',
    instruction:
      'Begin with a limited vocal/social population. Let participation spread by trigger: answers, claps, stomps, shouted repeats, brief unisons, and chants accumulate section by section. Do not start with everybody already yelling.',
    tags: ['crowd', 'call-response', 'escalation', 'social'],
    stemValue: 5,
    chaos: 3,
  },
  {
    id: 'vocal-cast',
    family: 'vocal',
    name: 'VOCAL CAST',
    shortExplanation: 'Voices are characters with separate musical jobs, not one lead plus generic backing vocals.',
    instruction:
      'Create several distinguishable vocal populations such as lead, narrator, small group, crowd, heckler, or freak voice. Give each an entrance condition, rhythmic behavior, information role, and intensity range.',
    tags: ['ensemble', 'roles', 'voices'],
    stemValue: 5,
    chaos: 3,
  },
  {
    id: 'vocal-relay',
    family: 'vocal',
    name: 'VOCAL RELAY',
    shortExplanation: 'A phrase or function passes between voices instead of belonging to one singer.',
    instruction:
      'Transfer the same phrase, rule, or rhythmic function between distinct voices. Each handoff should preserve enough identity to hear the relay while changing articulation, register, grouping, or emotional heat.',
    tags: ['handoff', 'voices', 'role-exchange'],
    stemValue: 5,
    chaos: 3,
  },
  {
    id: 'call-response',
    family: 'vocal',
    name: 'CALL + RESPONSE',
    shortExplanation: 'One musical statement causes another population to answer rather than merely harmonize.',
    instruction:
      'Make calls generate actual responses with different timing or information. Answers may contradict, complete, rhythmically reinterpret, or physically reinforce the call.',
    tags: ['response', 'crowd', 'dialogue'],
    stemValue: 4,
    chaos: 2,
  },
  {
    id: 'phonetic-percussion',
    family: 'vocal',
    name: 'PHONETIC PERCUSSION',
    shortExplanation: 'Consonants and nonsense syllables do rhythmic work.',
    instruction:
      'Use hard consonants as transients, dense syllables as compressed runs, nasals as resonance, open vowels as sustain, and rolled consonants as acceleration. Nonsense must physically reinforce the arrangement.',
    tags: ['mouth', 'scat', 'consonants', 'percussion'],
    stemValue: 5,
    chaos: 3,
  },
  {
    id: 'hocket-relay',
    family: 'vocal',
    name: 'HOCKET RELAY',
    shortExplanation: 'Different performers split one line into interlocking fragments.',
    instruction:
      'Distribute a coherent phrase or motif across multiple performers so no single voice owns the whole line. Keep the handoffs crisp enough to hear each voice as a separate stem.',
    tags: ['hocket', 'ensemble', 'separation'],
    stemValue: 5,
    chaos: 3,
  },
  {
    id: 'event-driven-form',
    family: 'form',
    name: 'EVENT-DRIVEN FORM',
    shortExplanation: 'Sections happen because something triggers them, not because a verse counter says so.',
    instruction:
      'Build form from explicit causes: a buzzer freezes harmony, a reveal admits brass, a mistake changes meter, a crowd response recruits percussion, a failure strips the arrangement. Events should generate sections.',
    tags: ['form', 'trigger', 'cause'],
    stemValue: 4,
    chaos: 4,
  },
  {
    id: 'jurisdiction-dropout',
    family: 'arrangement',
    name: 'JURISDICTION DROPOUT',
    shortExplanation: 'Temporarily remove an entire musical function and expose what survives.',
    instruction:
      'Delete one full jurisdiction for a defined window: harmony, rhythm, bass, lead, or ensemble support. The surviving systems continue without quietly replacing the missing function unchanged.',
    tags: ['dropout', 'absence', 'stem-window'],
    stemValue: 5,
    chaos: 4,
  },
  {
    id: 'exposure-windows',
    family: 'arrangement',
    name: 'EXPOSURE WINDOWS',
    shortExplanation: 'Deliberately create moments where one or two parts can be heard nearly alone.',
    instruction:
      'Schedule clean exposure windows for bass, voice, percussion, unusual source, or paired stems. Reduce masking and shared wash during these windows so the isolated material remains musically useful.',
    tags: ['stems', 'solo', 'separation'],
    stemValue: 5,
    chaos: 2,
  },
  {
    id: 'role-migration',
    family: 'arrangement',
    name: 'ROLE MIGRATION',
    shortExplanation: 'A musical job travels from one sound source to another while remaining recognizable.',
    instruction:
      'Move a function such as melody, pulse, bass contour, or anchor between distinct sources. Preserve the function strongly enough to hear the migration; do not make every layer swap at once.',
    tags: ['role-exchange', 'migration', 'handoff'],
    stemValue: 5,
    chaos: 4,
  },
  {
    id: 'anchor-survival',
    family: 'arrangement',
    name: 'ANCHOR SURVIVAL',
    shortExplanation: 'One small recognizable thing survives while the rest of the machine mutates.',
    instruction:
      'Choose a compact riff, contour, phrase, rhythm cell, or whistle-like hook as invariant. Let surrounding systems mutate aggressively. The anchor may return scarred, but identity must remain audible.',
    tags: ['anchor', 'invariant', 'memory'],
    stemValue: 4,
    chaos: 2,
  },
  {
    id: 'body-percussion',
    family: 'texture',
    name: 'BODY PERCUSSION',
    shortExplanation: 'Hands, feet, breath, and bodies take real rhythmic jobs.',
    instruction:
      'Use claps, stomps, slaps, footfalls, breaths, or other bodily attacks as independent rhythmic layers. Assign them explicit accent maps and keep them distinguishable from the drum kit.',
    tags: ['clap', 'stomp', 'body', 'physical'],
    stemValue: 5,
    chaos: 2,
  },
  {
    id: 'dry-separation',
    family: 'texture',
    name: 'DRY SEPARATION',
    shortExplanation: 'Parts remain locally distinct instead of being glued into one reverberant soup.',
    instruction:
      'Favor distinct registers, articulation, close or local ambience, and limited shared wash. Let each important source keep a clear edge so stems can survive isolation.',
    tags: ['stems', 'dry', 'production', 'clarity'],
    stemValue: 5,
    chaos: 1,
  },
  {
    id: 'group-unison-burst',
    family: 'performance',
    name: 'GROUP UNISON BURST',
    shortExplanation: 'A crowd suddenly locks onto one short phrase, then releases it.',
    instruction:
      'Use brief high-impact group unisons as punctuation rather than continuous choir texture. The burst should feel socially recruited and rhythmically exact.',
    tags: ['crowd', 'unison', 'shout'],
    stemValue: 4,
    chaos: 2,
  },
  {
    id: 'township-rhythmic-brightness',
    family: 'texture',
    name: 'TOWNSHIP RHYTHMIC BRIGHTNESS',
    shortExplanation: 'Buoyant South African township-jive / kwela-adjacent motion without scenic caricature.',
    instruction:
      'Use bright clipped/offbeat guitar behavior, springy bass motion, handclap participation, and optional pennywhistle-like melodic brightness as structural rhythmic vocabulary. Keep it urban, kinetic, and musical; avoid safari imagery, generic "tribal" language, or decorative exoticism.',
    tags: ['township-jive', 'kwela-adjacent', 'bright', 'guitar', 'whistle'],
    stemValue: 4,
    chaos: 2,
  },
];

export const MUSIC_SEED_RECIPES: MusicSeedRecipe[] = [
  {
    id: 'coupled-stampede',
    name: 'COUPLED STAMPEDE',
    description: 'Frantic, physical, lots of voices, stomping and clapping — but the groove still locks.',
    startHere: 'You want frantic crazy, lots of voices, stomping, clapping and people yelling words? Start here.',
    mechanismIds: ['pulse-coupling-3-2', 'communal-infection', 'body-percussion', 'anchor-survival', 'township-rhythmic-brightness'],
    defaultControls: { stemminess: 72, kineticDensity: 84, socialInfection: 88, coupling: 90, interruption: 54, anchorStrength: 72, castSize: 78 },
  },
  {
    id: 'jurisdiction-crash-test',
    name: 'JURISDICTION CRASH TEST',
    description: 'Separate systems obey incompatible rules and periodically lose an entire musical function.',
    startHere: 'You want several musical systems doing incompatible shit without becoming soup? Start here.',
    mechanismIds: ['meter-collision', 'jurisdiction-dropout', 'dry-separation', 'anchor-survival'],
    defaultControls: { stemminess: 82, kineticDensity: 66, coupling: 76, interruption: 68, anchorStrength: 76 },
  },
  {
    id: 'panic-engine',
    name: 'PANIC ENGINE',
    description: 'New identifiable events keep arriving before the previous thing fully settles.',
    startHere: 'You want OH SHIT SOMETHING ELSE IS HAPPENING energy? Start here.',
    mechanismIds: ['hard-interrupts', 'event-driven-form', 'double-time-activity', 'dry-separation'],
    defaultControls: { stemminess: 74, kineticDensity: 94, interruption: 92, anchorStrength: 58 },
  },
  {
    id: 'narrator-and-mob',
    name: 'NARRATOR + MOB',
    description: 'One intelligible central voice gets progressively invaded by excited humans.',
    startHere: 'You want one sensible person slowly losing control of the room? Start here.',
    mechanismIds: ['vocal-cast', 'communal-infection', 'call-response', 'group-unison-burst'],
    defaultControls: { stemminess: 78, socialInfection: 92, castSize: 86, kineticDensity: 70 },
  },
  {
    id: 'cast-of-freaks',
    name: 'CAST OF FREAKS',
    description: 'Not backup singers: a population of distinct vocal agents with different jobs.',
    startHere: 'You want a host, crowd, little group, freak voice and lead all doing different shit? Start here.',
    mechanismIds: ['vocal-cast', 'vocal-relay', 'hocket-relay', 'role-migration'],
    defaultControls: { stemminess: 88, socialInfection: 66, castSize: 96, interruption: 58 },
  },
  {
    id: 'event-driven-variety-show',
    name: 'EVENT-DRIVEN VARIETY SHOW',
    description: 'Form reacts to cues, mistakes, reveals, buzzers and social events instead of verse/chorus habit.',
    startHere: 'You want the arrangement to change because shit happens? Start here.',
    mechanismIds: ['event-driven-form', 'hard-interrupts', 'group-unison-burst', 'call-response'],
    defaultControls: { stemminess: 70, kineticDensity: 76, interruption: 90, castSize: 68 },
  },
  {
    id: 'anchor-under-siege',
    name: 'ANCHOR UNDER SIEGE',
    description: 'Destroy everything except one recognizable thing, then let even that return scarred.',
    startHere: 'You want one tiny musical object surviving increasingly rude treatment? Start here.',
    mechanismIds: ['anchor-survival', 'role-migration', 'false-resolution', 'hard-interrupts'],
    defaultControls: { stemminess: 65, interruption: 74, anchorStrength: 98, coupling: 54 },
  },
  {
    id: 'double-time-hallucination',
    name: 'DOUBLE-TIME HALLUCINATION',
    description: 'The song skeleton walks while its bloodstream runs twice as fast.',
    startHere: 'You want frantic without simply typing a stupidly high BPM? Start here.',
    mechanismIds: ['double-time-activity', 'meter-collision', 'phonetic-percussion'],
    defaultControls: { kineticDensity: 96, coupling: 70, stemminess: 62, interruption: 48 },
  },
  {
    id: 'vocal-relay-riot',
    name: 'VOCAL RELAY RIOT',
    description: 'Speech becomes melody becomes hocket becomes percussion becomes yelling.',
    startHere: 'You want voices passing the song around until language turns into rhythm? Start here.',
    mechanismIds: ['vocal-relay', 'hocket-relay', 'phonetic-percussion', 'call-response', 'communal-infection'],
    defaultControls: { stemminess: 92, kineticDensity: 82, socialInfection: 78, castSize: 88 },
  },
  {
    id: 'strip-it-to-the-bones',
    name: 'STRIP IT TO THE BONES',
    description: 'Composition deliberately exposes isolated parts so the stems are worth stealing later.',
    startHere: 'You do not care what the song is yet; you want GOOD FUCKING STEMS. Start here.',
    mechanismIds: ['exposure-windows', 'jurisdiction-dropout', 'dry-separation', 'role-migration'],
    defaultControls: { stemminess: 100, kineticDensity: 56, interruption: 70, anchorStrength: 68 },
  },
];

export function getMusicMechanism(id: string): MusicMechanism | undefined {
  return MUSIC_MECHANISMS.find((item) => item.id === id);
}

export function getMusicSeedRecipe(id: string): MusicSeedRecipe | undefined {
  return MUSIC_SEED_RECIPES.find((item) => item.id === id);
}

function clamp100(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function normalizeMusicControls(value?: Partial<MusicControls> | null): MusicControls {
  const source = value || {};
  return {
    stemminess: clamp100(source.stemminess, DEFAULT_MUSIC_CONTROLS.stemminess),
    kineticDensity: clamp100(source.kineticDensity, DEFAULT_MUSIC_CONTROLS.kineticDensity),
    socialInfection: clamp100(source.socialInfection, DEFAULT_MUSIC_CONTROLS.socialInfection),
    coupling: clamp100(source.coupling, DEFAULT_MUSIC_CONTROLS.coupling),
    interruption: clamp100(source.interruption, DEFAULT_MUSIC_CONTROLS.interruption),
    anchorStrength: clamp100(source.anchorStrength, DEFAULT_MUSIC_CONTROLS.anchorStrength),
    castSize: clamp100(source.castSize, DEFAULT_MUSIC_CONTROLS.castSize),
  };
}

export function normalizeMusicGenome(value: unknown): MusicBredGenome | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as any;
  const id = typeof raw.id === 'string' ? raw.id.trim().slice(0, 120) : '';
  const name = typeof raw.name === 'string' ? raw.name.trim().slice(0, 120) : '';
  const mechanismIds: string[] = Array.isArray(raw.mechanismIds)
    ? Array.from(new Set<string>(
        raw.mechanismIds.filter(
          (item: unknown): item is string => typeof item === 'string' && Boolean(getMusicMechanism(item))
        )
      )).slice(0, 8)
    : [];
  if (!id || !name || mechanismIds.length === 0) return undefined;

  const lineageRaw = raw.lineage && typeof raw.lineage === 'object' ? raw.lineage : {};
  const parent = (candidate: any, fallbackName: string) => ({
    id: typeof candidate?.id === 'string' ? candidate.id.slice(0, 120) : 'unknown',
    name: typeof candidate?.name === 'string' ? candidate.name.slice(0, 120) : fallbackName,
    kind: candidate?.kind === 'genome' ? 'genome' as const : 'recipe' as const,
    generation: Math.max(0, Math.min(99, Number.isFinite(Number(candidate?.generation)) ? Math.round(Number(candidate.generation)) : 0)),
  });
  const sanitizeMechanismIds = (items: unknown): string[] =>
    Array.isArray(items)
      ? Array.from(new Set<string>(
          items.filter(
            (item: unknown): item is string => typeof item === 'string' && Boolean(getMusicMechanism(item))
          )
        )).slice(0, 8)
      : [];

  return {
    id,
    name,
    description: typeof raw.description === 'string' ? raw.description.slice(0, 600) : '',
    mechanismIds,
    controls: normalizeMusicControls(raw.controls),
    generation: Math.max(1, Math.min(99, Number.isFinite(Number(raw.generation)) ? Math.round(Number(raw.generation)) : 1)),
    createdAt: Number.isFinite(Number(raw.createdAt)) ? Number(raw.createdAt) : Date.now(),
    lineage: {
      parentA: parent(lineageRaw.parentA, 'Parent A'),
      parentB: parent(lineageRaw.parentB, 'Parent B'),
      breedingSeed: typeof lineageRaw.breedingSeed === 'string' ? lineageRaw.breedingSeed.slice(0, 180) : 'default-breeding-seed',
      invariant: typeof lineageRaw.invariant === 'string' ? lineageRaw.invariant.slice(0, 700) : 'Invariant not recorded.',
      inheritedFromA: sanitizeMechanismIds(lineageRaw.inheritedFromA),
      inheritedFromB: sanitizeMechanismIds(lineageRaw.inheritedFromB),
      mutationMechanismId:
        typeof lineageRaw.mutationMechanismId === 'string' && getMusicMechanism(lineageRaw.mutationMechanismId)
          ? lineageRaw.mutationMechanismId
          : undefined,
      relationshipLaw: typeof lineageRaw.relationshipLaw === 'string'
        ? lineageRaw.relationshipLaw.slice(0, 1000)
        : 'Parents must remain audibly distinguishable while their inherited mechanisms negotiate.',
    },
  };
}

export function normalizeMusicStack(value: unknown): MusicStackItem[] {
  if (!Array.isArray(value)) return [];
  const out: MusicStackItem[] = [];

  value.slice(0, 24).forEach((raw: any, index) => {
    if (!raw || typeof raw !== 'object') return;
    const kind = raw.kind === 'recipe' || raw.kind === 'mechanism' || raw.kind === 'genome' ? raw.kind : null;
    const refId = typeof raw.refId === 'string' ? raw.refId.trim() : '';
    if (!kind || !refId) return;
    if (kind === 'recipe' && !getMusicSeedRecipe(refId)) return;
    if (kind === 'mechanism' && !getMusicMechanism(refId)) return;
    const genome = kind === 'genome' ? normalizeMusicGenome(raw.genome) : undefined;
    if (kind === 'genome' && (!genome || genome.id !== refId)) return;

    out.push({
      instanceId:
        typeof raw.instanceId === 'string' && raw.instanceId.trim()
          ? raw.instanceId.slice(0, 120)
          : kind + '_' + refId + '_' + index,
      kind,
      refId,
      muted: Boolean(raw.muted),
      locked: Boolean(raw.locked),
      strength: clamp100(raw.strength, 70),
      ...(genome ? { genome } : {}),
    });
  });

  return out;
}

export interface CompiledMusicMechanism {
  mechanism: MusicMechanism;
  strength: number;
  sources: string[];
}

export interface CompiledMusicStack {
  recipes: MusicSeedRecipe[];
  genomes: MusicBredGenome[];
  mechanisms: CompiledMusicMechanism[];
  interactions: string[];
  controls: MusicControls;
}

function hasMechanism(compiled: CompiledMusicMechanism[], id: string): boolean {
  return compiled.some((item) => item.mechanism.id === id);
}

export function compileMusicStack(
  stackValue: unknown,
  controlsValue?: Partial<MusicControls> | null
): CompiledMusicStack {
  const stack = normalizeMusicStack(stackValue).filter((item) => !item.muted);
  const controls = normalizeMusicControls(controlsValue);
  const recipes: MusicSeedRecipe[] = [];
  const genomes: MusicBredGenome[] = [];
  const contributions = new Map<string, { strengths: number[]; sources: string[] }>();

  const addContribution = (mechanismId: string, strength: number, source: string) => {
    if (!getMusicMechanism(mechanismId)) return;
    const existing = contributions.get(mechanismId) || { strengths: [], sources: [] };
    existing.strengths.push(clamp100(strength, 70));
    existing.sources.push(source);
    contributions.set(mechanismId, existing);
  };

  stack.forEach((item) => {
    if (item.kind === 'mechanism') {
      addContribution(item.refId, item.strength, 'manual');
      return;
    }

    if (item.kind === 'genome') {
      const genome = normalizeMusicGenome(item.genome);
      if (!genome) return;
      genomes.push(genome);
      genome.mechanismIds.forEach((mechanismId) => addContribution(mechanismId, item.strength, genome.name));
      return;
    }

    const recipe = getMusicSeedRecipe(item.refId);
    if (!recipe) return;
    recipes.push(recipe);
    recipe.mechanismIds.forEach((mechanismId) => addContribution(mechanismId, item.strength, recipe.name));
  });

  const mechanisms: CompiledMusicMechanism[] = [];
  contributions.forEach((entry, mechanismId) => {
    const mechanism = getMusicMechanism(mechanismId);
    if (!mechanism) return;
    const max = Math.max(...entry.strengths);
    const rest = entry.strengths.reduce((sum, value) => sum + value, 0) - max;
    mechanisms.push({
      mechanism,
      strength: Math.min(100, Math.round(max + rest * 0.3)),
      sources: Array.from(new Set(entry.sources)),
    });
  });

  const interactions: string[] = [];
  if (hasMechanism(mechanisms, 'pulse-coupling-3-2') && hasMechanism(mechanisms, 'vocal-relay')) {
    interactions.push('Assign different relay voices to opposing 3:2 pulse interpretations; the phrase handoff must also be a meter handoff.');
  }
  if (hasMechanism(mechanisms, 'anchor-survival') && hasMechanism(mechanisms, 'role-migration')) {
    interactions.push('Let the invariant migrate between sources while preserving its contour or rhythmic identity strongly enough to recognize every transfer.');
  }
  if (hasMechanism(mechanisms, 'communal-infection') && hasMechanism(mechanisms, 'vocal-cast')) {
    interactions.push('Do not activate the full cast immediately. Recruitment is part of the form: later voices must join because earlier voices trigger them.');
  }
  if (hasMechanism(mechanisms, 'jurisdiction-dropout') && hasMechanism(mechanisms, 'exposure-windows')) {
    interactions.push('Use each jurisdiction dropout as a stem-harvest window; the survivors must remain musically interesting when heard nearly alone.');
  }
  if (hasMechanism(mechanisms, 'hard-interrupts') && hasMechanism(mechanisms, 'event-driven-form')) {
    interactions.push('Every hard interruption must trigger a form change or reveal a new rule; do not use random edits with no downstream consequence.');
  }
  if (controls.stemminess >= 80 && controls.kineticDensity >= 75) {
    interactions.push('High stemminess plus high kinetic density means rotate fast events through distinct actors instead of stacking everything into a wall of sound.');
  }
  if (controls.socialInfection >= 75 && hasMechanism(mechanisms, 'body-percussion')) {
    interactions.push('Let social recruitment spread into the body: new voices bring new claps, stomps, breaths, or foot patterns rather than only adding harmony.');
  }
  if (controls.coupling >= 80 && mechanisms.some((item) => item.mechanism.family === 'rhythm')) {
    interactions.push('Multiple rhythmic truths must share a common substrate or recurring alignment point so complexity remains physically graspable.');
  }

  genomes.forEach((genome) => {
    interactions.push(
      'GENOME LAW — ' + genome.name + ' [generation ' + genome.generation + ']: ' +
      genome.lineage.invariant + ' ' + genome.lineage.relationshipLaw
    );
  });

  return { recipes, genomes, mechanisms, interactions, controls };
}

function band(value: number, low: string, mid: string, high: string): string {
  if (value >= 75) return high;
  if (value <= 30) return low;
  return mid;
}

export function musicControlsToDirectives(controlsValue?: Partial<MusicControls> | null): string[] {
  const controls = normalizeMusicControls(controlsValue);
  return [
    'STEMMINESS ' + controls.stemminess + '/100 — ' + band(controls.stemminess, 'allow fused production and shared ambience.', 'keep important roles distinguishable with periodic exposure.', 'prioritize register separation, dry/local effects, exposed windows, and parts that survive soloing.'),
    'KINETIC DENSITY ' + controls.kineticDensity + '/100 — ' + band(controls.kineticDensity, 'leave substantial breathing room between events.', 'maintain steady activity with contrast.', 'maintain relentless event flow without sacrificing legibility.'),
    'SOCIAL INFECTION ' + controls.socialInfection + '/100 — ' + band(controls.socialInfection, 'keep participation mostly individual.', 'allow selective call-and-response and recruitment.', 'let excitement spread visibly from one performer to many.'),
    'COUPLING ' + controls.coupling + '/100 — ' + band(controls.coupling, 'favor one dominant clock.', 'permit occasional competing groupings.', 'sustain multiple simultaneously valid rhythmic interpretations.'),
    'INTERRUPTION ' + controls.interruption + '/100 — ' + band(controls.interruption, 'let phrases usually finish.', 'use periodic structural cuts.', 'allow frequent hard interruptions that cause downstream changes.'),
    'ANCHOR STRENGTH ' + controls.anchorStrength + '/100 — ' + band(controls.anchorStrength, 'permit rapid forgetting and replacement.', 'return recognizable material after mutation.', 'make one invariant unmistakable even under severe transformation.'),
    'CAST SIZE ' + controls.castSize + '/100 — ' + band(controls.castSize, 'favor one or two vocal agents.', 'use a small distinguishable ensemble.', 'use a populated cast with clearly separated vocal jobs.'),
  ];
}

export function summarizeMusicStack(stackValue: unknown, controlsValue?: Partial<MusicControls> | null): string {
  const compiled = compileMusicStack(stackValue, controlsValue);
  const recipes = compiled.recipes.map((item) => item.name).join(' + ') || 'NO RECIPE';
  const genomes = compiled.genomes.map((item) => item.name + ' G' + item.generation).join(' + ') || 'NO GENOME';
  const mechanisms = compiled.mechanisms.map((item) => item.mechanism.name).join(' + ') || 'no mechanism chips';
  return 'recipes=' + recipes + ' | genomes=' + genomes + ' | mechanisms=' + mechanisms + ' | stemminess=' + compiled.controls.stemminess + ' | coupling=' + compiled.controls.coupling;
}

export function mechanismFamilies(): MusicMechanismFamily[] {
  return ['rhythm', 'vocal', 'form', 'arrangement', 'texture', 'performance'];
}
