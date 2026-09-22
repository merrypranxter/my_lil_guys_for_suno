import { LITTLE_GUYS } from '../data/littleGuys';
import { getMindMetadata, pairingStrength } from '../data/mindMetadata';
import { LittleGuy } from '../types';

export interface StackRecipe {
  id: string;
  name: string;
  description: string;
  guyIds: string[];
  chaos: number;
}

export interface StackChemistry {
  averageChaos: number;
  families: string[];
  jurisdictions: string[];
  pairingScore: number;
  label: 'controlled' | 'volatile' | 'feral' | 'critical';
}

export const STACK_RECIPES: StackRecipe[] = [
  {
    id: 'phase-scar',
    name: 'PHASE SCAR',
    description: 'A threshold event permanently changes what repeated material can become.',
    guyIds: ['phase-banshee', 'hysteresis-hag', 'recall-mold'],
    chaos: 4.3,
  },
  {
    id: 'alien-neighbors',
    name: 'ALIEN NEIGHBORS',
    description: 'Redefine conceptual distance, choose the weirdest valid branch, then amplify one tiny asymmetry.',
    guyIds: ['alien-ruler', 'minority-mutant', 'symmetry-shiv'],
    chaos: 4,
  },
  {
    id: 'collateral-success',
    name: 'COLLATERAL SUCCESS',
    description: 'Break the enabling rule, ban the direct route, and force every gain to pay a price.',
    guyIds: ['axiom-vandal', 'detour-devil', 'budget-ghoul'],
    chaos: 4,
  },
  {
    id: 'self-eating-brain',
    name: 'SELF-EATING BRAIN',
    description: 'Breed new rules while the jurisdiction of those rules mutates under selection pressure.',
    guyIds: ['rule-breeder', 'jurisdiction-eater', 'grandchild-goblin'],
    chaos: 5,
  },
  {
    id: 'bureaucratic-collapse',
    name: 'BUREAUCRATIC COLLAPSE',
    description: 'Treat impossible agency shifts and constraint ecology as routine administrative procedure.',
    guyIds: ['cosmic-clerk', 'constraint-druid', 'agency-thief', 'phase-banshee'],
    chaos: 3.8,
  },
  {
    id: 'haunted-timeline',
    name: 'HAUNTED TIMELINE',
    description: 'The ending backfills the present while unrealized branches and memory scars keep changing the route.',
    guyIds: ['future-bastard', 'if-ghost', 'retcon-rat', 'recall-mold'],
    chaos: 4.2,
  },
  {
    id: 'wrong-zoo-brain',
    name: 'WRONG ZOO BRAIN',
    description: 'Misclassify the subject, rewrite the primitive beneath it, and redistribute agency inside the new ontology.',
    guyIds: ['taxonomy-goblin', 'root-surgeon', 'agency-thief'],
    chaos: 4.3,
  },
  {
    id: 'forbidden-description',
    name: 'FORBIDDEN DESCRIPTION',
    description: 'Hide the obvious target, raid its attentional shadow, and defend the result against hostile flattening.',
    guyIds: ['omission-cartographer', 'shadow-raccoon', 'heckler-priest'],
    chaos: 3.3,
  },
  {
    id: 'flow-budget',
    name: 'FLOW BUDGET',
    description: 'Dissolve objects into processes, conserve one quantity, and close the feedback circuit.',
    guyIds: ['flow-ghoul', 'budget-ghoul', 'loop-ferret'],
    chaos: 3.3,
  },
  {
    id: 'cross-scale-infection',
    name: 'CROSS-SCALE INFECTION',
    description: 'Move the causal machine into a foreign substrate, force scale betrayal, then let a foreign lifecycle colonize it.',
    guyIds: ['substrate-smuggler', 'scale-witch', 'parasite-intern'],
    chaos: 4.3,
  },
];

function randomNoise(scale = 1): number {
  return Math.random() * scale;
}

function candidateScore(candidate: LittleGuy, chosen: LittleGuy[], mode: 'balanced' | 'feral', preferenceWeights: Record<string, number>): number {
  const meta = getMindMetadata(candidate.id);
  let score = randomNoise(2.2) + Math.min(1.1, (preferenceWeights[candidate.id] || 0) * 0.9);

  const chosenFamilies = new Set(chosen.map((g) => getMindMetadata(g.id).family));
  const chosenJurisdictions = new Set(chosen.map((g) => g.defaultJurisdiction));

  if (!chosenFamilies.has(meta.family)) score += mode === 'feral' ? 2.3 : 1.7;
  else score -= 0.9;

  if (!chosenJurisdictions.has(candidate.defaultJurisdiction)) score += 1.2;
  else score -= 2.4;

  for (const existing of chosen) {
    score += pairingStrength(existing.id, candidate.id);
  }

  const targetChaos = mode === 'feral' ? 4.6 : 3.2;
  score -= Math.abs(meta.chaos - targetChaos) * (mode === 'feral' ? 0.8 : 0.45);

  if (mode === 'feral' && meta.chaos >= 4) score += 1.4;
  if (mode === 'balanced' && meta.chaos === 2) score += 0.3;

  return score;
}

function choosePrimary(pool: LittleGuy[], mode: 'balanced' | 'feral', preferenceWeights: Record<string, number>): LittleGuy {
  const candidates = [...pool].sort((a, b) => {
    const am = getMindMetadata(a.id);
    const bm = getMindMetadata(b.id);
    const target = mode === 'feral' ? 4.5 : 3.2;
    const as = -Math.abs(am.chaos - target) + randomNoise(1.7) + Math.min(0.9, (preferenceWeights[a.id] || 0) * 0.7);
    const bs = -Math.abs(bm.chaos - target) + randomNoise(1.7) + Math.min(0.9, (preferenceWeights[b.id] || 0) * 0.7);
    return bs - as;
  });
  return candidates[0] || pool[0];
}

export function buildSmartStack(
  count: number,
  mode: 'balanced' | 'feral' = 'balanced',
  pool: LittleGuy[] = LITTLE_GUYS,
  preferenceWeights: Record<string, number> = {}
): LittleGuy[] {
  if (!pool.length || count <= 0) return [];
  const targetCount = Math.max(1, Math.min(count, pool.length));
  const chosen: LittleGuy[] = [choosePrimary(pool, mode, preferenceWeights)];

  while (chosen.length < targetCount) {
    const remaining = pool.filter((g) => !chosen.some((c) => c.id === g.id));
    if (!remaining.length) break;

    const ranked = remaining
      .map((candidate) => ({ candidate, score: candidateScore(candidate, chosen, mode, preferenceWeights) }))
      .sort((a, b) => b.score - a.score);

    // Keep a little mutation pressure instead of always taking the mathematically top candidate.
    const window = ranked.slice(0, Math.min(4, ranked.length));
    const pick = window[Math.floor(Math.random() * window.length)]?.candidate || ranked[0].candidate;
    chosen.push(pick);
  }

  return chosen;
}

export function getStackChemistry(stack: LittleGuy[]): StackChemistry {
  if (!stack.length) {
    return {
      averageChaos: 0,
      families: [],
      jurisdictions: [],
      pairingScore: 0,
      label: 'controlled',
    };
  }

  const metas = stack.map((g) => getMindMetadata(g.id));
  const averageChaos = metas.reduce((sum, meta) => sum + meta.chaos, 0) / metas.length;
  const families = Array.from(new Set(metas.map((meta) => meta.family)));
  const jurisdictions = Array.from(new Set(stack.map((g) => g.defaultJurisdiction)));

  let totalPairScore = 0;
  let pairs = 0;
  for (let i = 0; i < stack.length; i++) {
    for (let j = i + 1; j < stack.length; j++) {
      totalPairScore += pairingStrength(stack[i].id, stack[j].id);
      pairs += 1;
    }
  }
  const pairingScore = pairs ? totalPairScore / pairs : 0;

  let label: StackChemistry['label'] = 'controlled';
  if (averageChaos >= 4.5) label = 'critical';
  else if (averageChaos >= 3.8) label = 'feral';
  else if (averageChaos >= 2.8) label = 'volatile';

  return {
    averageChaos: Math.round(averageChaos * 10) / 10,
    families,
    jurisdictions,
    pairingScore: Math.round(pairingScore * 10) / 10,
    label,
  };
}

export function resolveRecipe(recipeId: string): LittleGuy[] {
  const recipe = STACK_RECIPES.find((item) => item.id === recipeId);
  if (!recipe) return [];
  return recipe.guyIds
    .map((id) => LITTLE_GUYS.find((g) => g.id === id))
    .filter((g): g is LittleGuy => Boolean(g));
}
