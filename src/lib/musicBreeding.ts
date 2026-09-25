import {
  MusicBredGenome,
  MusicControls,
  MusicGenomeParentRef,
  MusicMechanism,
  MusicMechanismFamily,
  MusicSeedRecipe,
  MusicStackItem,
} from '../types';
import {
  DEFAULT_MUSIC_CONTROLS,
  MUSIC_MECHANISMS,
  getMusicMechanism,
  normalizeMusicControls,
} from '../data/musicSeedSystem';

export interface MusicBreedingParent {
  ref: MusicGenomeParentRef;
  mechanismIds: string[];
  controls: MusicControls;
}

const CONTROL_KEYS: Array<keyof MusicControls> = [
  'stemminess',
  'kineticDensity',
  'socialInfection',
  'coupling',
  'interruption',
  'anchorStrength',
  'castSize',
];

function hashString(input: string): number {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function makeRng(seedText: string): () => number {
  let state = hashString(seedText) || 0x9e3779b9;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function uniqueValidMechanisms(ids: string[]): string[] {
  return Array.from(new Set(ids.filter((id) => Boolean(getMusicMechanism(id)))));
}

function recipeControls(recipe: MusicSeedRecipe): MusicControls {
  return normalizeMusicControls({ ...DEFAULT_MUSIC_CONTROLS, ...(recipe.defaultControls || {}) });
}

export function parentFromRecipe(recipe: MusicSeedRecipe): MusicBreedingParent {
  return {
    ref: {
      id: recipe.id,
      name: recipe.name,
      kind: 'recipe',
      generation: 0,
    },
    mechanismIds: uniqueValidMechanisms(recipe.mechanismIds),
    controls: recipeControls(recipe),
  };
}

export function parentFromGenome(genome: MusicBredGenome): MusicBreedingParent {
  return {
    ref: {
      id: genome.id,
      name: genome.name,
      kind: 'genome',
      generation: genome.generation,
    },
    mechanismIds: uniqueValidMechanisms(genome.mechanismIds),
    controls: normalizeMusicControls(genome.controls),
  };
}

function mechanismFamilies(ids: string[]): Set<MusicMechanismFamily> {
  return new Set(
    ids
      .map((id) => getMusicMechanism(id)?.family)
      .filter((family): family is MusicMechanismFamily => Boolean(family))
  );
}

function choose<T>(items: T[], rng: () => number): T {
  return items[Math.min(items.length - 1, Math.floor(rng() * items.length))];
}

function shuffled<T>(items: T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function closestControlInvariant(a: MusicControls, b: MusicControls): { key: keyof MusicControls; value: number; label: string } {
  let bestKey = CONTROL_KEYS[0];
  let bestDistance = Infinity;
  for (const key of CONTROL_KEYS) {
    const distance = Math.abs(a[key] - b[key]);
    if (distance < bestDistance) {
      bestKey = key;
      bestDistance = distance;
    }
  }
  const value = Math.round((a[bestKey] + b[bestKey]) / 2);
  const label = bestKey.replace(/([A-Z])/g, ' $1').toUpperCase();
  return { key: bestKey, value, label };
}

function chooseInvariant(
  a: MusicBreedingParent,
  b: MusicBreedingParent,
  rng: () => number
): {
  text: string;
  forcedA: string[];
  forcedB: string[];
  preservedControl?: keyof MusicControls;
} {
  const sharedIds = a.mechanismIds.filter((id) => b.mechanismIds.includes(id));
  if (sharedIds.length > 0) {
    const id = choose(shuffled(sharedIds, rng), rng);
    const mech = getMusicMechanism(id)!;
    return {
      text: 'Shared invariant: ' + mech.name + ' survives the crossover unchanged.',
      forcedA: [id],
      forcedB: [id],
    };
  }

  const familiesA = mechanismFamilies(a.mechanismIds);
  const sharedFamilies = Array.from(familiesA).filter((family) =>
    b.mechanismIds.some((id) => getMusicMechanism(id)?.family === family)
  );
  if (sharedFamilies.length > 0) {
    const family = choose(shuffled(sharedFamilies, rng), rng);
    const fromA = shuffled(a.mechanismIds.filter((id) => getMusicMechanism(id)?.family === family), rng)[0];
    const fromB = shuffled(b.mechanismIds.filter((id) => getMusicMechanism(id)?.family === family), rng)[0];
    return {
      text:
        'Shared invariant: the ' +
        family.toUpperCase() +
        ' jurisdiction must remain legible even though each parent contributes a different mechanism.',
      forcedA: fromA ? [fromA] : [],
      forcedB: fromB ? [fromB] : [],
    };
  }

  const control = closestControlInvariant(a.controls, b.controls);
  return {
    text:
      'Shared invariant: ' +
      control.label +
      ' remains conserved near ' +
      control.value +
      '/100 while the mechanism set crosses over.',
    forcedA: [],
    forcedB: [],
    preservedControl: control.key,
  };
}

function relationLawFor(a: MusicMechanism, b: MusicMechanism): string {
  const key = [a.family, b.family].sort().join('|');
  const names = a.name + ' ↔ ' + b.name;

  const laws: Record<string, string> = {
    'rhythm|vocal':
      names + ': vocal recruitment, relay, or syllable density may change only at audible rhythmic alignment or misalignment events. The mouths must react to the clock rather than float above it.',
    'form|rhythm':
      names + ': major form changes are legal only when the rhythmic system reaches a defined collision, re-alignment, deletion, or false-resolution event.',
    'arrangement|rhythm':
      names + ': role migration or dropout must expose a different reading of the rhythmic substrate; arrangement changes cannot leave the groove interpretation unchanged.',
    'rhythm|texture':
      names + ': textural layers may enter, thicken, or disappear only when they reinforce or contradict a named rhythmic grouping. Texture becomes evidence about the clock.',
    'form|vocal':
      names + ': a vocal event must trigger the formal event. New sections cannot arrive by schedule alone; a call, interruption, relay, or population change must authorize them.',
    'arrangement|vocal':
      names + ': every major vocal handoff must inherit, vacate, or seize an arrangement role. New voices cannot merely stack on top of the previous owner.',
    'texture|vocal':
      names + ': social/vocal growth must alter physical texture through breath, clap, stomp, consonant attack, or another separately audible body layer.',
    'arrangement|form':
      names + ': formal transitions must redistribute or delete a real musical job. A section change with identical role ownership is invalid.',
    'arrangement|texture':
      names + ': textural thickening costs arrangement space. When one texture grows, another role must move, thin, or become temporarily exposed.',
    'form|texture':
      names + ': texture is the event clock for form: threshold changes in density or physical attack trigger sectional change.',
    'performance|vocal':
      names + ': group intensity may rise only through an explicit vocal handoff, response, or unison event; excitement must propagate through identifiable performers.',
    'performance|rhythm':
      names + ': performance intensity follows rhythmic instability. The cast may surge only when the clock crosses a measurable stress point.',
    'arrangement|performance':
      names + ': a performance surge must seize or surrender an arrangement role; intensity changes must alter who owns musical space.',
    'form|performance':
      names + ': the performers themselves authorize formal change through a discrete collective event rather than a conventional section count.',
    'performance|texture':
      names + ': collective intensity must leave a physical trace in the texture, and the texture must recede when the population disengages.',
  };

  return (
    laws[key] ||
    names +
      ': Parent A may intensify only after Parent B produces an audible state change; Parent B must then inherit one consequence from Parent A. The relationship is causal, not decorative.'
  );
}

function mutationCandidate(childIds: string[], parentUnion: Set<string>, rng: () => number): MusicMechanism | undefined {
  const childTags = new Set(
    childIds.flatMap((id) => getMusicMechanism(id)?.tags || [])
  );
  const childFamilies = mechanismFamilies(childIds);

  const candidates = MUSIC_MECHANISMS
    .filter((mechanism) => !parentUnion.has(mechanism.id) && !childIds.includes(mechanism.id))
    .map((mechanism) => {
      const tagScore = mechanism.tags.reduce((score, tag) => score + (childTags.has(tag) ? 2 : 0), 0);
      const familyScore = childFamilies.has(mechanism.family) ? 2 : 0;
      return { mechanism, score: tagScore + familyScore + mechanism.stemValue * 0.15 };
    })
    .sort((x, y) => y.score - x.score);

  if (!candidates.length) return undefined;
  const top = candidates.slice(0, Math.min(6, candidates.length));
  return choose(top, rng).mechanism;
}

function sanitizeNamePart(name: string): string[] {
  return name
    .replace(/[+&/]/g, ' ')
    .split(/\s+/)
    .map((word) => word.replace(/[^A-Za-z0-9-]/g, '').toUpperCase())
    .filter((word) => word.length > 2 && !['THE', 'AND', 'WITH', 'UNDER', 'ENGINE'].includes(word));
}

function generatedChildName(a: MusicBreedingParent, b: MusicBreedingParent, rng: () => number): string {
  const wordsA = sanitizeNamePart(a.ref.name);
  const wordsB = sanitizeNamePart(b.ref.name);
  const left = wordsA.length ? choose(wordsA, rng) : 'MUTANT';
  const right = wordsB.length ? choose(wordsB, rng) : 'HYBRID';
  const suffixes = ['CHIMERA', 'CROSS', 'OFFSPRING', 'FREAK', 'HYBRID'];
  const suffix = choose(suffixes, rng);
  return (left + ' ' + right + ' ' + suffix).replace(/\s+/g, ' ').trim();
}

function crossoverControls(
  a: MusicControls,
  b: MusicControls,
  rng: () => number,
  preservedControl?: keyof MusicControls
): MusicControls {
  const next: Partial<MusicControls> = {};
  for (const key of CONTROL_KEYS) {
    const average = (a[key] + b[key]) / 2;
    const inheritedBias = rng() < 0.5 ? a[key] : b[key];
    const blended = average * 0.65 + inheritedBias * 0.35;
    const jitter = key === preservedControl ? 0 : Math.round((rng() - 0.5) * 12);
    next[key] = Math.round(blended + jitter);
  }
  return normalizeMusicControls(next);
}

function pickFrictionPair(
  inheritedFromA: string[],
  inheritedFromB: string[],
  rng: () => number
): [MusicMechanism, MusicMechanism] {
  const aPool = inheritedFromA
    .map((id) => getMusicMechanism(id))
    .filter((item): item is MusicMechanism => Boolean(item));
  const bPool = inheritedFromB
    .map((id) => getMusicMechanism(id))
    .filter((item): item is MusicMechanism => Boolean(item));

  let bestPairs: Array<[MusicMechanism, MusicMechanism, number]> = [];
  for (const ma of aPool) {
    for (const mb of bPool) {
      if (ma.id === mb.id) continue;
      const familyBonus = ma.family === mb.family ? 0 : 3;
      const chaosSpread = Math.abs(ma.chaos - mb.chaos);
      const tagOverlap = ma.tags.filter((tag) => mb.tags.includes(tag)).length;
      bestPairs.push([ma, mb, familyBonus + chaosSpread + tagOverlap]);
    }
  }

  if (!bestPairs.length) {
    const fallbackA = aPool[0] || MUSIC_MECHANISMS[0];
    const fallbackB = bPool[0] || MUSIC_MECHANISMS[1] || MUSIC_MECHANISMS[0];
    return [fallbackA, fallbackB];
  }

  bestPairs = bestPairs.sort((x, y) => y[2] - x[2]);
  const topScore = bestPairs[0][2];
  const top = bestPairs.filter((pair) => pair[2] >= topScore - 1);
  const chosen = choose(top, rng);
  return [chosen[0], chosen[1]];
}

export function breedMusicGenome(
  parentA: MusicBreedingParent,
  parentB: MusicBreedingParent,
  breedingSeed: string,
  requestedName = ''
): MusicBredGenome {
  if (parentA.ref.id === parentB.ref.id && parentA.ref.kind === parentB.ref.kind) {
    throw new Error('Breeding requires two distinct parents.');
  }

  const idsA = uniqueValidMechanisms(parentA.mechanismIds);
  const idsB = uniqueValidMechanisms(parentB.mechanismIds);
  if (!idsA.length || !idsB.length) {
    throw new Error('Both parents need at least one valid music mechanism.');
  }

  const seedText =
    parentA.ref.kind + ':' + parentA.ref.id + '|' +
    parentB.ref.kind + ':' + parentB.ref.id + '|' +
    (breedingSeed.trim() || 'default-breeding-seed');
  const rng = makeRng(seedText);

  const invariant = chooseInvariant(parentA, parentB, rng);
  const inheritedFromA = [...invariant.forcedA];
  const inheritedFromB = [...invariant.forcedB];
  const child: string[] = Array.from(new Set([...inheritedFromA, ...inheritedFromB]));

  const targetBase = Math.round((idsA.length + idsB.length) / 2);
  const targetSize = Math.max(3, Math.min(7, targetBase + (rng() < 0.25 ? -1 : rng() > 0.8 ? 1 : 0)));

  const remainingA = shuffled(idsA.filter((id) => !child.includes(id)), rng);
  const remainingB = shuffled(idsB.filter((id) => !child.includes(id)), rng);

  if (!inheritedFromA.length && remainingA.length) {
    const id = remainingA.shift()!;
    inheritedFromA.push(id);
    child.push(id);
  }
  if (!inheritedFromB.length && remainingB.length) {
    const id = remainingB.shift()!;
    inheritedFromB.push(id);
    if (!child.includes(id)) child.push(id);
  }

  let turn: 'A' | 'B' = rng() < 0.5 ? 'A' : 'B';
  while (child.length < targetSize && (remainingA.length || remainingB.length)) {
    const source = turn === 'A' ? remainingA : remainingB;
    const inherited = turn === 'A' ? inheritedFromA : inheritedFromB;
    if (source.length) {
      const id = source.shift()!;
      if (!child.includes(id)) {
        child.push(id);
        inherited.push(id);
      }
    }
    turn = turn === 'A' ? 'B' : 'A';
  }

  const parentUnion = new Set([...idsA, ...idsB]);
  let mutationMechanismId: string | undefined;
  if (rng() < 0.35) {
    const mutation = mutationCandidate(child, parentUnion, rng);
    if (mutation) {
      mutationMechanismId = mutation.id;
      if (child.length >= 7) {
        const removable = child.filter(
          (id) => !invariant.forcedA.includes(id) && !invariant.forcedB.includes(id)
        );
        if (removable.length) {
          const removeId = choose(removable, rng);
          const index = child.indexOf(removeId);
          if (index >= 0) child.splice(index, 1);
        }
      }
      child.push(mutation.id);
    }
  }

  const [frictionA, frictionB] = pickFrictionPair(inheritedFromA, inheritedFromB, rng);
  const relationshipLaw = relationLawFor(frictionA, frictionB);
  const controls = crossoverControls(parentA.controls, parentB.controls, rng, invariant.preservedControl);
  const generation = Math.max(parentA.ref.generation, parentB.ref.generation) + 1;
  const deterministicHash = hashString(seedText + '|' + child.join(',') + '|' + relationshipLaw).toString(36);
  const name = requestedName.trim() || generatedChildName(parentA, parentB, rng);

  return {
    id: 'genome_' + deterministicHash,
    name,
    description:
      'Generation ' +
      generation +
      ' offspring of ' +
      parentA.ref.name +
      ' × ' +
      parentB.ref.name +
      '. ' +
      invariant.text,
    mechanismIds: Array.from(new Set(child)),
    controls,
    generation,
    createdAt: Date.now(),
    lineage: {
      parentA: parentA.ref,
      parentB: parentB.ref,
      breedingSeed: breedingSeed.trim() || 'default-breeding-seed',
      invariant: invariant.text,
      inheritedFromA: Array.from(new Set(inheritedFromA)),
      inheritedFromB: Array.from(new Set(inheritedFromB)),
      mutationMechanismId,
      relationshipLaw,
    },
  };
}

export function genomeToStackItem(genome: MusicBredGenome, strength = 82): MusicStackItem {
  return {
    instanceId: 'genome_' + genome.id + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    kind: 'genome',
    refId: genome.id,
    muted: false,
    locked: false,
    strength,
    genome,
  };
}

export function describeGenomeInheritance(genome: MusicBredGenome): string {
  const mechanismName = (id: string) => getMusicMechanism(id)?.name || id;
  const fromA = genome.lineage.inheritedFromA.map(mechanismName).join(', ') || 'none';
  const fromB = genome.lineage.inheritedFromB.map(mechanismName).join(', ') || 'none';
  const mutation = genome.lineage.mutationMechanismId
    ? mechanismName(genome.lineage.mutationMechanismId)
    : 'none';
  return [
    genome.lineage.parentA.name + ' → ' + fromA,
    genome.lineage.parentB.name + ' → ' + fromB,
    'mutation → ' + mutation,
    genome.lineage.invariant,
    genome.lineage.relationshipLaw,
  ].join('\n');
}
