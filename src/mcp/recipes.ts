import type { ExperimentModeId, LabRecipe } from './types';

export const EXPERIMENT_MODE_IDS = [
  'petri-dish',
  'deep-bore',
  'crossbreed',
  'novelty-hunt',
  'favorite-dna',
  'operator-stress-test',
  'mutation-ladder',
  'family-tree',
  'alien-invasion',
  'anti-merry',
  'bone-picker',
  'tournament',
] as const satisfies readonly ExperimentModeId[];

export const LAB_RECIPES: LabRecipe[] = [
  {
    id: 'petri-dish',
    name: 'PETRI DISH',
    purpose: 'Keep several weird possibilities alive at once. Explore first; do not converge too early.',
    defaultPopulation: 6,
    defaultDepth: 4,
    selectionPressure: [
      'Preserve conceptual diversity.',
      'Keep at least one coherent branch and one dangerous-looking outlier.',
      'Prefer mechanisms that create new consequences rather than decorative randomness.',
    ],
    phases: ['SPAWN', 'DIVERGE', 'COLLIDE', 'HARVEST'],
    stopRule: 'Stop at the configured depth, or earlier only when every living branch has become repetitive.',
    directiveBank: [
      'Interpret the seed through a new causal mechanism without replacing its subject.',
      'Change who or what has agency while preserving the seed.',
      'Make one hidden assumption in the previous idea physically real.',
      'Turn a metaphorical relation into an operational rule.',
      'Create a social or crowd behavior that emerges from the seed.',
      'Push the strongest implication one level further than feels reasonable.',
      'Preserve the core idea but change the scale radically.',
      'Introduce one contradiction that the song must actually obey.',
    ],
  },
  {
    id: 'deep-bore',
    name: 'DEEP BORE',
    purpose: 'Take one conceptual vein and drill downward instead of constantly changing subjects.',
    defaultPopulation: 5,
    defaultDepth: 7,
    selectionPressure: [
      'Prefer descendants that reveal a deeper mechanism in the same conceptual family.',
      'Penalize unrelated novelty.',
      'Keep one alternative branch in reserve in case the main vein goes sterile.',
    ],
    phases: ['FIND VEIN', 'DRILL', 'PRESSURIZE', 'DRILL AGAIN', 'EXPOSE MECHANISM', 'OVERDRIVE', 'HARVEST'],
    stopRule: 'Stop after three consecutive generations fail to reveal a genuinely new implication, mechanism, or consequence.',
    directiveBank: [
      'Take the most interesting causal relation and ask what causes that.',
      'Keep the same subject and expose a hidden dependency.',
      'Turn the current consequence into the next generation cause.',
      'Remove a convenient assumption and see what the system must do instead.',
      'Make the mechanism recur at a smaller or larger scale.',
      'Follow the weirdest consequence without adding a new topic.',
    ],
  },
  {
    id: 'crossbreed',
    name: 'CROSSBREED',
    purpose: 'Force two distinct surviving ideas to share one conceptual organism.',
    defaultPopulation: 6,
    defaultDepth: 5,
    selectionPressure: [
      'Choose parents that are meaningfully different.',
      'Require visible inheritance from both parents.',
      'Reward friction between parent mechanisms instead of averaging them into mush.',
    ],
    phases: ['FOUNDERS', 'PAIR', 'HYBRIDIZE', 'STABILIZE', 'HARVEST'],
    stopRule: 'Stop when the hybrid has a coherent rule of its own rather than merely mentioning both parents.',
    directiveBank: [
      'Combine the parent mechanisms so each one constrains the other.',
      'Let parent A control cause while parent B controls consequence.',
      'Let one parent become the environment and the other become the organism.',
      'Make the parents compete for control of the same event.',
      'Fuse only their operational rules; discard surface imagery.',
    ],
  },
  {
    id: 'novelty-hunt',
    name: 'NOVELTY HUNT',
    purpose: 'Search for mechanisms unlike the recent population and unlike the obvious interpretation of the seed.',
    defaultPopulation: 8,
    defaultDepth: 4,
    selectionPressure: [
      'Prefer structural novelty over random nouns.',
      'Reject descendants that merely paraphrase existing branches.',
      'Keep outputs that are hard to classify but still clearly descend from the seed.',
    ],
    phases: ['SCATTER', 'DISTANCE', 'OUTLIERS', 'HARVEST'],
    stopRule: 'Stop when the newest population is mostly recombinations of mechanisms already observed.',
    directiveBank: [
      'Use a relation or process not yet used in this session.',
      'Avoid the dominant metaphor from the previous generation.',
      'Invert what counts as measurement, evidence, or success.',
      'Make the system behave according to an unfamiliar distance or similarity rule.',
      'Move the weirdness from imagery into procedure.',
      'Create an emergent rule from many small local actions.',
    ],
  },
  {
    id: 'favorite-dna',
    name: 'FAVORITE DNA',
    purpose: 'Use starred history as soft genetic material without simply repeating old favorites.',
    defaultPopulation: 6,
    defaultDepth: 5,
    selectionPressure: [
      'Preserve deep traits from favorites, not surface phrasing.',
      'Prefer unfamiliar combinations of previously successful mechanisms.',
      'Avoid cloning one favorite wholesale.',
    ],
    phases: ['EXTRACT', 'RECOMBINE', 'MUTATE', 'DISTANCE CHECK', 'HARVEST'],
    stopRule: 'Stop when the session produces descendants recognizably related to favorites but not reducible to any one of them.',
    directiveBank: [
      'Recombine two successful traits that have not previously appeared together.',
      'Keep a favorite structural behavior but replace its narrative role.',
      'Preserve the favorite energy while changing the causal engine.',
      'Use favorite traits as constraints, then force one alien rule through them.',
      'Keep what historically worked while deliberately avoiding familiar wording.',
    ],
  },
  {
    id: 'operator-stress-test',
    name: 'OPERATOR STRESS TEST',
    purpose: 'Hold the seed stable and compare what different cognitive operations actually do to it.',
    defaultPopulation: 8,
    defaultDepth: 2,
    selectionPressure: [
      'Do not choose a single winner too early.',
      'Compare transformations by mechanism, not polish.',
      'Notice which operators consistently create useful behavior.',
    ],
    phases: ['BASELINE', 'RETEST'],
    stopRule: 'Stop after the configured comparison passes; this is a diagnostic experiment, not an endless lineage.',
    directiveBank: [
      'Cause and effect must exchange jobs.',
      'Roles must exchange without changing the underlying event.',
      'Memory of the event must alter the event itself.',
      'Measurement changes the thing being measured.',
      'A constraint becomes the source of new behavior.',
      'Meaning recoils onto the speaker who produced it.',
      'A local rule produces a global crowd behavior.',
      'Representation and represented object disagree about which one is real.',
    ],
  },
  {
    id: 'mutation-ladder',
    name: 'MUTATION LADDER',
    purpose: 'Walk the same idea from conservative to feral and locate the interesting break point.',
    defaultPopulation: 6,
    defaultDepth: 3,
    selectionPressure: [
      'Compare mutation intensity rather than treating maximum chaos as automatically better.',
      'Look for the threshold where new structure appears before coherence collapses.',
    ],
    phases: ['CALIBRATE', 'BREAKPOINT', 'HARVEST'],
    stopRule: 'Stop after a useful mutation breakpoint is identified and sampled again.',
    directiveBank: [
      '10 percent mutation: preserve almost everything and alter one relation.',
      '25 percent mutation: change one mechanism and one role.',
      '45 percent mutation: alter several relations but preserve the subject.',
      '65 percent mutation: permit major structural mutation while keeping ancestry visible.',
      '85 percent mutation: keep only the conceptual nucleus and one inherited behavior.',
      '100 percent mutation pressure: rebuild from the seed while deliberately avoiding the obvious lineage.',
    ],
  },
  {
    id: 'family-tree',
    name: 'FAMILY TREE',
    purpose: 'Let multiple lineages diverge independently before crossing distant relatives later.',
    defaultPopulation: 6,
    defaultDepth: 6,
    selectionPressure: [
      'Maintain at least two lineages with distinct mechanisms.',
      'Avoid repeatedly selecting siblings that are nearly identical.',
      'Cross distant branches only after they have developed recognizable identities.',
    ],
    phases: ['FOUNDERS', 'BRANCH', 'BRANCH', 'DISTANCE', 'REUNION', 'HARVEST'],
    stopRule: 'Stop once at least two mature branches have been crossed and the descendant shows ancestry from both.',
    directiveBank: [
      'Develop this branch without borrowing the dominant mechanism from its siblings.',
      'Give this lineage its own recurring rule.',
      'Push this branch toward a different scale than the others.',
      'Make this lineage solve the seed with a different causal architecture.',
      'Cross two distant branch rules without averaging them.',
    ],
  },
  {
    id: 'alien-invasion',
    name: 'ALIEN INVASION',
    purpose: 'Inject one deliberately foreign mechanism into a mature lineage and observe assimilation, rejection, or explosion.',
    defaultPopulation: 5,
    defaultDepth: 5,
    selectionPressure: [
      'Keep the lineage recognizable before the invasion.',
      'The foreign rule must have operational consequences.',
      'Preserve both successful assimilation and spectacular incompatibility.',
    ],
    phases: ['ESTABLISH', 'INVADE', 'REACTION', 'ADAPT', 'HARVEST'],
    stopRule: 'Stop once the foreign mechanism is either integrated into a stable new rule or clearly rejected by the lineage.',
    directiveBank: [
      'Introduce one rule from a completely different conceptual domain.',
      'Make the foreign rule behave like an invasive species rather than decoration.',
      'Force the existing system to spend resources responding to the intruder.',
      'Let the host lineage mutate in response to the invasion.',
      'Preserve one branch where the invasion fails catastrophically.',
    ],
  },
  {
    id: 'anti-merry',
    name: 'ANTI-MERRY',
    purpose: 'Deliberately search outside the gravitational pull of starred historical preferences.',
    defaultPopulation: 7,
    defaultDepth: 4,
    selectionPressure: [
      'Prefer mechanisms unlike the starred archive.',
      'Do not become bland merely because familiar tricks are forbidden.',
      'Reward genuinely different structure, pacing, voice, or causality.',
    ],
    phases: ['REPULSION', 'NEW TERRITORY', 'STABILIZE', 'HARVEST'],
    stopRule: 'Stop when at least a few outputs feel structurally unfamiliar without becoming generic.',
    directiveBank: [
      'Avoid the strongest recurring traits in the favorite archive.',
      'Use a mechanism that would normally be under-selected.',
      'Change the kind of intelligence the song seems to have.',
      'Prefer restraint in the dimension that is usually most exaggerated.',
      'Move complexity into a different musical or conceptual layer than usual.',
    ],
  },
  {
    id: 'bone-picker',
    name: 'BONE PICKER',
    purpose: 'Recursively strip one idea for implications until the machine stops finding meat.',
    defaultPopulation: 4,
    defaultDepth: 9,
    selectionPressure: [
      'Choose the branch with the most unresolved consequences.',
      'Do not switch subjects to manufacture novelty.',
      'Track what has already been extracted so later generations must go deeper.',
    ],
    phases: ['CUT', 'SCRAPE', 'CRACK', 'MARROW', 'MICROFRACTURE', 'REASSEMBLE'],
    stopRule: 'Stop after three generations in a row produce no new causal mechanism, implication, perspective, or musical behavior.',
    directiveBank: [
      'Extract one implication not yet stated.',
      'Ask what this rule forces to happen next.',
      'Ask what must already be true for this mechanism to work.',
      'Find the edge case that breaks the current explanation.',
      'Follow the consequence nobody in the previous generation addressed.',
      'Turn a leftover contradiction into the next mechanism.',
    ],
  },
  {
    id: 'tournament',
    name: 'TOURNAMENT',
    purpose: 'Run several independent populations, then cross survivors from different pools.',
    defaultPopulation: 8,
    defaultDepth: 5,
    selectionPressure: [
      'Do not let one early interpretation dominate every pool.',
      'Select survivors for distinct strengths rather than a single universal criterion.',
      'Final crosses should combine genuinely different lineages.',
    ],
    phases: ['POOLS', 'POOL SURVIVORS', 'SEMIFINAL', 'CROSS', 'HARVEST'],
    stopRule: 'Stop after survivors from independent pools have been crossed and the final population contains multiple viable directions.',
    directiveBank: [
      'Treat this as an independent pool with its own interpretation.',
      'Develop a mechanism unlike the other current pools.',
      'Keep the strongest rule from this pool and remove decorative baggage.',
      'Cross two pool survivors while preserving what made each one distinct.',
      'Produce multiple finals rather than collapsing to one winner.',
    ],
  },
];

export function getLabRecipe(id: ExperimentModeId): LabRecipe {
  const recipe = LAB_RECIPES.find((item) => item.id === id);
  if (!recipe) throw new Error('Unknown experiment mode: ' + id);
  return recipe;
}

export function recipePhase(recipe: LabRecipe, generation: number): string {
  if (!recipe.phases.length) return 'EXPERIMENT';
  return recipe.phases[Math.min(generation, recipe.phases.length - 1)];
}

export function suggestedDirectives(
  recipe: LabRecipe,
  generation: number,
  population: number,
  fuckAround: number,
): string[] {
  const count = Math.max(1, Math.min(12, population));
  const bank = recipe.directiveBank.length ? recipe.directiveBank : ['Mutate the previous idea in one meaningful way.'];
  const offset = generation % bank.length;
  const intensity =
    fuckAround >= 80
      ? ' Mutation pressure: feral. Preserve ancestry, but allow violent structural change.'
      : fuckAround >= 55
        ? ' Mutation pressure: high. Prefer non-obvious consequences.'
        : fuckAround >= 30
          ? ' Mutation pressure: medium. Keep the lineage legible.'
          : ' Mutation pressure: low. Change one important thing at a time.';

  return Array.from({ length: count }, (_, index) => {
    const base = bank[(offset + index) % bank.length];
    return base + intensity;
  });
}
