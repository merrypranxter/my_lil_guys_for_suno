import { MindMetadata } from '../types';

const FALLBACK: MindMetadata = {
  family: 'meta',
  chaos: 3,
  compatibilityTags: ['general'],
  frictionTags: ['general'],
  recommendedPairings: [],
  roleHint: 'General-purpose cognitive mutator.',
};

export const MIND_METADATA: Record<string, MindMetadata> = {
  'retcon-rat': {
    family: 'mutation', chaos: 4,
    compatibilityTags: ['semantic', 'temporal', 'memory', 'causal'],
    frictionTags: ['meaning', 'continuity'],
    recommendedPairings: ['recall-mold', 'future-bastard', 'if-ghost', 'cosmic-clerk'],
    roleHint: 'Best as a mid-stack mutator that changes what earlier material means without erasing it.',
  },
  'emotion-cryptid': {
    family: 'perception', chaos: 3,
    compatibilityTags: ['emotion', 'sensorium', 'selection', 'memory'],
    frictionTags: ['affect', 'attention'],
    recommendedPairings: ['sensory-freak', 'utility-demon', 'recall-mold', 'gaze-freezer'],
    roleHint: 'Adds a precise nonhuman affective pressure system; useful when the stack needs motivation rather than more ontology.',
  },
  'taxonomy-goblin': {
    family: 'semantic', chaos: 4,
    compatibilityTags: ['classification', 'ontology', 'representation', 'alien'],
    frictionTags: ['category', 'identity'],
    recommendedPairings: ['identity-accident', 'root-surgeon', 'parasite-intern', 'alien-ruler'],
    roleHint: 'Strong primary mind: establishes the wrong category as literal world law.',
  },
  'future-bastard': {
    family: 'temporal', chaos: 4,
    compatibilityTags: ['temporal', 'causal', 'counterfactual', 'structure'],
    frictionTags: ['sequence', 'cause'],
    recommendedPairings: ['retcon-rat', 'if-ghost', 'hysteresis-hag', 'phase-banshee'],
    roleHint: 'Works best early in a stack so later minds must obey its fixed terminal condition.',
  },
  'property-thief': {
    family: 'representation', chaos: 4,
    compatibilityTags: ['ownership', 'ontology', 'agency', 'representation'],
    frictionTags: ['property', 'identity'],
    recommendedPairings: ['agency-thief', 'identity-accident', 'flow-ghoul', 'root-surgeon'],
    roleHint: 'Transfers one load-bearing property; pair with minds that recalculate consequences rather than merely decorate the theft.',
  },
  'hole-guy': {
    family: 'ontology', chaos: 5,
    compatibilityTags: ['absence', 'constraint', 'ontology', 'dependency'],
    frictionTags: ['primitive', 'continuity', 'repair'],
    recommendedPairings: ['root-surgeon', 'constraint-druid', 'cosmic-clerk', 'loop-ferret'],
    roleHint: 'High-chaos excision mind. Give it one primitive only; other minds should organize around the vacancy.',
  },
  'sensory-freak': {
    family: 'perception', chaos: 3,
    compatibilityTags: ['sensorium', 'observation', 'emotion', 'hidden-state'],
    frictionTags: ['perception', 'attention'],
    recommendedPairings: ['emotion-cryptid', 'observation-log', 'shadow-raccoon', 'scale-witch'],
    roleHint: 'Creates a detector for invisible structure, giving later minds a measurable signal to react to.',
  },
  'jpeg-brain': {
    family: 'representation', chaos: 4,
    compatibilityTags: ['compression', 'syntax', 'representation', 'collision'],
    frictionTags: ['information', 'distinction'],
    recommendedPairings: ['omission-cartographer', 'alien-ruler', 'lesion-wizard', 'retcon-rat'],
    roleHint: 'Useful when the stack needs destructive simplification and artifact-driven reconstruction.',
  },
  'cosmic-clerk': {
    family: 'narrative', chaos: 2,
    compatibilityTags: ['narrative', 'bureaucracy', 'stabilizer', 'procedure'],
    frictionTags: ['tone', 'awe'],
    recommendedPairings: ['hole-guy', 'phase-banshee', 'identity-accident', 'jurisdiction-eater'],
    roleHint: 'Low-chaos regulator: keeps impossible content dry, procedural, and legible while other minds mutate structure.',
  },
  'recall-mold': {
    family: 'memory', chaos: 4,
    compatibilityTags: ['memory', 'temporal', 'mutation', 'scar'],
    frictionTags: ['continuity', 'history'],
    recommendedPairings: ['retcon-rat', 'hysteresis-hag', 'future-bastard', 'gaze-freezer'],
    roleHint: 'Turns repetition into irreversible memory mutation; excellent for recurring anchors.',
  },
  'identity-accident': {
    family: 'ontology', chaos: 5,
    compatibilityTags: ['identity', 'ontology', 'classification', 'property'],
    frictionTags: ['category', 'logic'],
    recommendedPairings: ['taxonomy-goblin', 'property-thief', 'root-surgeon', 'symmetry-shiv'],
    roleHint: 'Maximum ontology collision. One literal identity is enough; other minds should exploit it rather than add more.',
  },
  'confident-machine': {
    family: 'causal', chaos: 3,
    compatibilityTags: ['axiom', 'causal', 'theory', 'narrative'],
    frictionTags: ['truth', 'explanation'],
    recommendedPairings: ['axiom-vandal', 'observation-log', 'heckler-priest', 'loop-ferret'],
    roleHint: 'Provides disciplined wrongness and keeps a stack internally coherent after a false premise enters.',
  },
  'observation-log': {
    family: 'perception', chaos: 2,
    compatibilityTags: ['observation', 'measurement', 'threshold', 'narrative'],
    frictionTags: ['interpretation', 'announcement'],
    recommendedPairings: ['phase-banshee', 'sensory-freak', 'confident-machine', 'scale-witch'],
    roleHint: 'Excellent regulator for high-chaos stacks: lets change emerge through evidence instead of announcing it.',
  },
  'axiom-vandal': {
    family: 'constraint', chaos: 5,
    compatibilityTags: ['axiom', 'constraint', 'causal', 'detour'],
    frictionTags: ['enabling-rule', 'solution-path'],
    recommendedPairings: ['detour-devil', 'confident-machine', 'budget-ghoul', 'root-surgeon'],
    roleHint: 'Destroys one load-bearing assumption and requires its negation to become useful.',
  },
  'shadow-raccoon': {
    family: 'perception', chaos: 3,
    compatibilityTags: ['attention', 'background', 'omission', 'systems'],
    frictionTags: ['salience', 'foreground'],
    recommendedPairings: ['omission-cartographer', 'sensory-freak', 'constraint-druid', 'agency-thief'],
    roleHint: 'Redirects attention to the hidden support system; often strongest as a second or third mind.',
  },
  'substrate-smuggler': {
    family: 'systems', chaos: 4,
    compatibilityTags: ['translation', 'systems', 'alien', 'causal'],
    frictionTags: ['domain', 'analogy'],
    recommendedPairings: ['alien-ruler', 'parasite-intern', 'root-surgeon', 'scale-witch'],
    roleHint: 'Moves the causal skeleton through a foreign domain and returns only the structural solution.',
  },
  'flow-ghoul': {
    family: 'ontology', chaos: 4,
    compatibilityTags: ['process', 'systems', 'conservation', 'scale'],
    frictionTags: ['objecthood', 'stability'],
    recommendedPairings: ['budget-ghoul', 'phase-banshee', 'scale-witch', 'agency-thief'],
    roleHint: 'Dissolves objects into rates and maintenance work; useful for making musical parameters behave like processes.',
  },
  'omission-cartographer': {
    family: 'semantic', chaos: 4,
    compatibilityTags: ['omission', 'semantic', 'perception', 'constraint'],
    frictionTags: ['naming', 'representation'],
    recommendedPairings: ['shadow-raccoon', 'jpeg-brain', 'alien-ruler', 'heckler-priest'],
    roleHint: 'Keeps a target absent while reconstructing it from independent consequences.',
  },
  'loop-ferret': {
    family: 'causal', chaos: 3,
    compatibilityTags: ['feedback', 'systems', 'causal', 'timing'],
    frictionTags: ['linear-cause', 'local-fix'],
    recommendedPairings: ['constraint-druid', 'phase-banshee', 'hysteresis-hag', 'budget-ghoul'],
    roleHint: 'Closes the feedback loop and finds the smallest relational change that alters the next return.',
  },
  'root-surgeon': {
    family: 'ontology', chaos: 5,
    compatibilityTags: ['dependency', 'ontology', 'axiom', 'recompile'],
    frictionTags: ['primitive', 'inheritance'],
    recommendedPairings: ['taxonomy-goblin', 'hole-guy', 'axiom-vandal', 'jurisdiction-eater'],
    roleHint: 'Replaces one primitive and recompiles only what actually depends on it.',
  },
  'parasite-intern': {
    family: 'systems', chaos: 5,
    compatibilityTags: ['systems', 'lifecycle', 'colonization', 'translation'],
    frictionTags: ['host-rule', 'repair'],
    recommendedPairings: ['substrate-smuggler', 'taxonomy-goblin', 'constraint-druid', 'phase-banshee'],
    roleHint: 'Imports a foreign lifecycle as an operating system. High chaos; pair with a regulator if clarity matters.',
  },
  'minority-mutant': {
    family: 'perception', chaos: 4,
    compatibilityTags: ['perception', 'plurality', 'selection', 'friction'],
    frictionTags: ['consensus', 'blend'],
    recommendedPairings: ['utility-demon', 'alien-ruler', 'symmetry-shiv', 'heckler-priest'],
    roleHint: 'Keeps incompatible readings separate and crowns the strangest valid one instead of averaging them.',
  },
  'alien-ruler': {
    family: 'semantic', chaos: 4,
    compatibilityTags: ['association', 'alien', 'selection', 'translation'],
    frictionTags: ['similarity', 'semantic-distance'],
    recommendedPairings: ['substrate-smuggler', 'minority-mutant', 'omission-cartographer', 'grandchild-goblin'],
    roleHint: 'Changes conceptual distance before association. Excellent idea-space opener.',
  },
  'lesion-wizard': {
    family: 'constraint', chaos: 5,
    compatibilityTags: ['constraint', 'cognition', 'prosthesis', 'detour'],
    frictionTags: ['operation', 'habit'],
    recommendedPairings: ['detour-devil', 'jpeg-brain', 'gaze-freezer', 'rule-breeder'],
    roleHint: 'Deletes one cognitive operation and forces a compensatory method to emerge.',
  },
  'detour-devil': {
    family: 'constraint', chaos: 4,
    compatibilityTags: ['detour', 'constraint', 'causal', 'procedure'],
    frictionTags: ['direct-route', 'optimization'],
    recommendedPairings: ['axiom-vandal', 'lesion-wizard', 'utility-demon', 'budget-ghoul'],
    roleHint: 'Bans the obvious route; success must appear as the side effect of another valid process.',
  },
  'utility-demon': {
    family: 'selection', chaos: 3,
    compatibilityTags: ['selection', 'fitness', 'value', 'alien'],
    frictionTags: ['taste', 'optimization'],
    recommendedPairings: ['grandchild-goblin', 'minority-mutant', 'emotion-cryptid', 'symmetry-shiv'],
    roleHint: 'Changes what counts as valuable while preserving hard validity constraints.',
  },
  'grandchild-goblin': {
    family: 'selection', chaos: 4,
    compatibilityTags: ['selection', 'lineage', 'future', 'mutation'],
    frictionTags: ['immediate-quality', 'greedy-choice'],
    recommendedPairings: ['rule-breeder', 'utility-demon', 'alien-ruler', 'jurisdiction-eater'],
    roleHint: 'Selects present ideas by the richness of their descendants rather than immediate polish.',
  },
  'gaze-freezer': {
    family: 'perception', chaos: 4,
    compatibilityTags: ['attention', 'observation', 'constraint', 'mutation'],
    frictionTags: ['inspection', 'mutability'],
    recommendedPairings: ['recall-mold', 'sensory-freak', 'lesion-wizard', 'shadow-raccoon'],
    roleHint: 'Turns observation into commitment: inspected properties freeze while novelty escapes elsewhere.',
  },
  'rule-breeder': {
    family: 'meta', chaos: 5,
    compatibilityTags: ['meta', 'lineage', 'mutation', 'selection'],
    frictionTags: ['fixed-rule', 'stacking'],
    recommendedPairings: ['grandchild-goblin', 'jurisdiction-eater', 'utility-demon', 'minority-mutant'],
    roleHint: 'Breeds irreducible offspring rules. Best used sparingly as a meta-layer above structurally different parents.',
  },
  'scale-witch': {
    family: 'perception', chaos: 4,
    compatibilityTags: ['scale', 'systems', 'perception', 'process'],
    frictionTags: ['scale-invariance', 'explanation'],
    recommendedPairings: ['flow-ghoul', 'substrate-smuggler', 'observation-log', 'phase-banshee'],
    roleHint: 'Forces micro, meso, and macro descriptions to disagree productively.',
  },
  'hysteresis-hag': {
    family: 'memory', chaos: 4,
    compatibilityTags: ['memory', 'temporal', 'feedback', 'path'],
    frictionTags: ['state-equivalence', 'reset'],
    recommendedPairings: ['recall-mold', 'loop-ferret', 'future-bastard', 'phase-banshee'],
    roleHint: 'Makes history part of state. Repeated sections can look similar yet behave differently because of their route.',
  },
  'budget-ghoul': {
    family: 'constraint', chaos: 3,
    compatibilityTags: ['conservation', 'constraint', 'systems', 'tradeoff'],
    frictionTags: ['free-gain', 'unpriced-change'],
    recommendedPairings: ['flow-ghoul', 'detour-devil', 'loop-ferret', 'constraint-druid'],
    roleHint: 'Adds a conservation law so every gain has a cost, leak, transfer, or stored debt.',
  },
  'heckler-priest': {
    family: 'constraint', chaos: 3,
    compatibilityTags: ['adversarial', 'semantic', 'narrative', 'constraint'],
    frictionTags: ['obvious-reading', 'flattening'],
    recommendedPairings: ['confident-machine', 'omission-cartographer', 'minority-mutant', 'cosmic-clerk'],
    roleHint: 'Stress-tests the obvious interpretation and forces the structure to survive hostile reading.',
  },
  'phase-banshee': {
    family: 'systems', chaos: 5,
    compatibilityTags: ['threshold', 'systems', 'temporal', 'feedback'],
    frictionTags: ['continuity', 'mere-intensity'],
    recommendedPairings: ['observation-log', 'hysteresis-hag', 'loop-ferret', 'scale-witch'],
    roleHint: 'Builds a real regime change: after the threshold, the governing rules are different, not merely louder.',
  },
  'agency-thief': {
    family: 'ontology', chaos: 4,
    compatibilityTags: ['agency', 'ownership', 'systems', 'narrative'],
    frictionTags: ['actor', 'control'],
    recommendedPairings: ['property-thief', 'shadow-raccoon', 'flow-ghoul', 'cosmic-clerk'],
    roleHint: 'Moves causation or intention away from its default owner and forces the system to respect the new actor map.',
  },
  'constraint-druid': {
    family: 'constraint', chaos: 4,
    compatibilityTags: ['constraint', 'systems', 'feedback', 'ecology'],
    frictionTags: ['independent-limits', 'local-fix'],
    recommendedPairings: ['loop-ferret', 'budget-ghoul', 'parasite-intern', 'hole-guy'],
    roleHint: 'Makes constraints interact, compete, shelter, and overgrow rather than acting as independent rules.',
  },
  'if-ghost': {
    family: 'causal', chaos: 4,
    compatibilityTags: ['counterfactual', 'temporal', 'causal', 'absence'],
    frictionTags: ['single-history', 'actuality'],
    recommendedPairings: ['future-bastard', 'retcon-rat', 'symmetry-shiv', 'hysteresis-hag'],
    roleHint: 'Lets an unrealized branch exert real causal and semantic pressure on the branch that happened.',
  },
  'symmetry-shiv': {
    family: 'selection', chaos: 4,
    compatibilityTags: ['selection', 'threshold', 'causal', 'asymmetry'],
    frictionTags: ['equivalence', 'balance'],
    recommendedPairings: ['minority-mutant', 'if-ghost', 'utility-demon', 'identity-accident'],
    roleHint: 'Starts from equal possibilities and amplifies one tiny bias into a whole irreversible world.',
  },
  'jurisdiction-eater': {
    family: 'meta', chaos: 5,
    compatibilityTags: ['meta', 'mutation', 'jurisdiction', 'translation'],
    frictionTags: ['fixed-domain', 'stable-role'],
    recommendedPairings: ['rule-breeder', 'root-surgeon', 'grandchild-goblin', 'retcon-rat'],
    roleHint: 'Mutates what a rule governs while it operates. Very high chaos; usually let one other mind act as an anchor.',
  },
};

export function getMindMetadata(id: string): MindMetadata {
  return MIND_METADATA[id] || FALLBACK;
}

export function pairingStrength(aId: string, bId: string): number {
  if (aId === bId) return -100;
  const a = getMindMetadata(aId);
  const b = getMindMetadata(bId);
  let score = 0;
  if (a.recommendedPairings.includes(bId)) score += 4;
  if (b.recommendedPairings.includes(aId)) score += 4;
  if (a.family !== b.family) score += 1.5;
  const sharedCompatibility = a.compatibilityTags.filter((tag) => b.compatibilityTags.includes(tag)).length;
  score += Math.min(2, sharedCompatibility * 0.5);
  const productiveFriction = a.frictionTags.filter((tag) => b.compatibilityTags.includes(tag)).length
    + b.frictionTags.filter((tag) => a.compatibilityTags.includes(tag)).length;
  score += Math.min(2, productiveFriction * 0.5);
  return score;
}
