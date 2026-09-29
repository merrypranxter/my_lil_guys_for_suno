import { MouthGenome, MouthTechniqueInteraction, MouthTechniqueInteractionKind, MouthTechniquePaletteEntry } from './types';
import { deriveMouthTechniquePalette, getMouthTechnique } from './techniques';

const KIND_ORDER: MouthTechniqueInteractionKind[] = [
  'inheritContour',
  'inheritRhythm',
  'functionTransfer',
  'registerCascade',
  'hocketFracture',
  'phoneticCompression',
  'phoneticExpansion',
  'populationInfection',
  'acrobaticEscalation',
  'techniqueCollision',
];

function hash(text: string): number {
  let value = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function sharedProperty(sourceId: string, targetId: string, kind: MouthTechniqueInteractionKind) {
  const source = getMouthTechnique(sourceId)!;
  const target = getMouthTechnique(targetId)!;
  const preferred =
    kind === 'inheritContour' ? 'contour' :
    kind === 'inheritRhythm' ? 'rhythm' :
    kind === 'functionTransfer' ? 'function' :
    kind === 'registerCascade' ? 'register' :
    kind === 'hocketFracture' ? 'rhythm' :
    kind === 'phoneticCompression' ? 'articulation' :
    kind === 'phoneticExpansion' ? 'timbre' :
    kind === 'populationInfection' ? 'function' :
    kind === 'acrobaticEscalation' ? 'register' :
    'articulation';
  if (source.mutationProperties.includes(preferred) || target.mutationProperties.includes(preferred)) return preferred;
  return source.mutationProperties.find((property) => target.mutationProperties.includes(property)) || source.mutationProperties[0] || 'rhythm';
}

function directive(kind: MouthTechniqueInteractionKind, source: string, target: string, property: string): { trigger: string; preserve: string; directive: string } {
  if (kind === 'inheritContour') return { trigger: 'when the source gesture completes clearly', preserve: 'the source pitch-shape remains recognizable', directive: target + ' copies the contour of ' + source + ' while keeping its own vocal mechanism.' };
  if (kind === 'inheritRhythm') return { trigger: 'on the next recurrence of the rhythmic cell', preserve: 'timing ancestry survives the technique change', directive: target + ' inherits the exact attack/subdivision pattern of ' + source + ' without copying its timbre.' };
  if (kind === 'functionTransfer') return { trigger: 'after the source establishes a stable job', preserve: 'the musical job persists even though the mechanism changes', directive: 'Transfer the ' + property + ' job from ' + source + ' to ' + target + '; the successor must audibly continue the same structural function.' };
  if (kind === 'registerCascade') return { trigger: 'after a register-changing event', preserve: 'phrase identity and timing remain intact', directive: 'Pass the phrase from ' + source + ' to ' + target + ' at a sharply different register, then continue rather than restart.' };
  if (kind === 'hocketFracture') return { trigger: 'when one gesture has become predictable enough to split', preserve: 'shared pulse and phrase identity', directive: 'Fracture the established ' + source + ' gesture across ' + target + ' and another mouth; distribute attacks instead of doubling them.' };
  if (kind === 'phoneticCompression') return { trigger: 'when semantic material repeats', preserve: 'the source phrase remains inferable', directive: 'Compress ' + source + ' into denser syllables/consonant attacks and hand the compressed rhythm to ' + target + '.' };
  if (kind === 'phoneticExpansion') return { trigger: 'after a compact phonetic cell is established', preserve: 'one phoneme or vowel remains the audible fossil', directive: 'Expand one element of ' + source + ' into a longer ' + target + ' event; stretch time without inventing unrelated material.' };
  if (kind === 'populationInfection') return { trigger: 'on each structurally justified recurrence', preserve: 'each infected voice keeps its role identity', directive: source + ' infects ' + target + ' with only ' + property + ' first; later recurrences may transfer one additional property at a time.' };
  if (kind === 'acrobaticEscalation') return { trigger: 'when the gesture returns', preserve: 'same motif or phrase ancestry', directive: 'Each return passes from ' + source + ' toward ' + target + ' with one physically harder change; escalation must remain traceable, not random.' };
  return { trigger: 'when incompatible techniques are both structurally due', preserve: 'both techniques remain identifiable', directive: 'Let ' + source + ' and ' + target + ' collide without averaging into a hybrid mush. Give each a separate rhythmic/register jurisdiction and make the conflict cause the next event.' };
}

function compatiblePairs(palette: MouthTechniquePaletteEntry[]) {
  const pairs: Array<[MouthTechniquePaletteEntry, MouthTechniquePaletteEntry, boolean]> = [];
  for (let i = 0; i < palette.length; i += 1) {
    for (let j = i + 1; j < palette.length; j += 1) {
      const a = getMouthTechnique(palette[i].techniqueId)!;
      const b = getMouthTechnique(palette[j].techniqueId)!;
      const antagonistic = a.antagonisticTechniqueIds.includes(b.id) || b.antagonisticTechniqueIds.includes(a.id);
      const compatible = a.compatibleTechniqueIds.includes(b.id) || b.compatibleTechniqueIds.includes(a.id);
      if (compatible || antagonistic || a.family !== b.family) pairs.push([palette[i], palette[j], antagonistic]);
    }
  }
  return pairs;
}

export function deriveMouthTechniqueInteractions(genome: MouthGenome, limit = 5): MouthTechniqueInteraction[] {
  const palette = deriveMouthTechniquePalette(genome, 9);
  const pairs = compatiblePairs(palette);
  if (!pairs.length) return [];

  const mutation = Math.max(0, Math.min(100, Math.round(genome.mutation ?? 35)));
  const expression = Math.max(0, Math.min(100, Math.round(genome.musicalExpression ?? 0)));
  const desired = Math.max(1, Math.min(limit, mutation >= 80 ? 5 : mutation >= 55 ? 4 : mutation >= 30 ? 3 : 2));
  const seed = genome.breedingSeed + '|' + genome.id + '|' + mutation + '|' + expression;

  return pairs
    .map(([a, b, antagonistic], index) => {
      const source = getMouthTechnique(a.techniqueId)!;
      const target = getMouthTechnique(b.techniqueId)!;
      const roll = hash(seed + '|' + source.id + '|' + target.id + '|' + index);
      const kind = antagonistic ? 'techniqueCollision' : KIND_ORDER[roll % (KIND_ORDER.length - 1)];
      const transferProperty = sharedProperty(source.id, target.id, kind);
      const words = directive(kind, source.name, target.name, transferProperty);
      const intensity = Math.max(20, Math.min(100, Math.round((a.weight + b.weight + mutation) / 3)));
      return {
        id: 'mouth-interaction-' + (roll >>> 0).toString(36),
        kind,
        sourceTechniqueId: source.id,
        targetTechniqueId: target.id,
        transferProperty,
        trigger: words.trigger,
        intensity,
        preserve: words.preserve,
        directive: words.directive,
        score: a.weight + b.weight + (antagonistic ? 15 : 0) + (source.compatibleTechniqueIds.includes(target.id) ? 10 : 0) + (roll % 7),
      };
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, desired)
    .map(({ score: _score, ...interaction }) => interaction);
}

export function compileMouthTechniqueInteractions(genome: MouthGenome): string[] {
  const interactions = deriveMouthTechniqueInteractions(genome);
  if (!interactions.length) return [];
  return [
    'VOCAL INTERACTION ENGINE: techniques change one another through explicit cause→effect transfers. Do not add a new technique unless the previous event hands it a property, job, trigger, or conflict.',
    ...interactions.map((item) => {
      const source = getMouthTechnique(item.sourceTechniqueId)?.name || item.sourceTechniqueId;
      const target = getMouthTechnique(item.targetTechniqueId)?.name || item.targetTechniqueId;
      return item.kind.toUpperCase() + ' [' + item.intensity + '/100]: ' + source + ' → ' + target + '. Trigger=' + item.trigger + '. Transfer=' + item.transferProperty + '. Preserve=' + item.preserve + '. ' + item.directive;
    }),
    'MUTATION WITHOUT AMNESIA: every interaction inherits an audible fact from the previous state. Hard cuts are allowed when causally triggered; arbitrary full resets are forbidden.',
    'SOCIAL TRAFFIC LAW: population increases the number of possible relays, not mandatory simultaneity. Stagger entrances; let reactions create the traffic.',
    'LEGIBILITY FLOOR: preserve at least one graspable phrase, motif, pulse, role, or phonetic fossil while interactions escalate.',
    'FUCK-OFF GATE: if another interaction does not alter the trajectory, omit it. Substance outranks glitch density.',
  ];
}
