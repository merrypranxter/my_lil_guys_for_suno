import { getMusicMechanism, getMusicSeedRecipe } from '../data/musicSeedSystem';
import type {
  CompiledStarterSeedStack,
  StarterSeedEventBinding,
  StarterSeedEventBridgePlan,
  StarterSeedStackItem,
} from './types';

const FALLBACK_MECHANISMS = [
  'event-driven-form',
  'hard-interrupts',
  'anchor-survival',
  'exposure-windows',
  'vocal-relay',
  'role-migration',
  'group-unison-burst',
  'jurisdiction-dropout',
] as const;

const CUE_PREFERENCES: Array<{ terms: string[]; mechanisms: string[] }> = [
  {
    terms: ['ring', 'buzzer', 'alarm', 'alert', 'warning', 'spike', 'gasp', 'switch', 'goes live'],
    mechanisms: ['hard-interrupts', 'event-driven-form', 'group-unison-burst'],
  },
  {
    terms: ['caller', 'connect', 'assistant', 'contestant', 'audience', 'supervisor', 'crew', 'guest', 'reporter'],
    mechanisms: ['call-response', 'vocal-relay', 'communal-infection', 'vocal-cast'],
  },
  {
    terms: ['station id', 'baseline', 'score update', 'map', 'telemetry', 'measurement', 'case note', 'identity verified'],
    mechanisms: ['anchor-survival', 'event-driven-form', 'exposure-windows'],
  },
  {
    terms: ['commercial', 'break', 'dead air', 'line drops', 'loss of signal', 'hold', 'dropout'],
    mechanisms: ['jurisdiction-dropout', 'exposure-windows', 'hard-interrupts'],
  },
  {
    terms: ['reveal', 'all-clear', 'closure', 'prize', 'final', 'triumphant'],
    mechanisms: ['group-unison-burst', 'false-resolution', 'anchor-survival'],
  },
  {
    terms: ['new round', 'new hypothesis', 'replication', 'reacquisition', 'go-no-go', 'next caller'],
    mechanisms: ['role-migration', 'false-resolution', 'event-driven-form'],
  },
  {
    terms: ['countdown', 'timing', 'timer'],
    mechanisms: ['double-time-activity', 'event-driven-form', 'hard-interrupts'],
  },
];

const ACTION_BY_MECHANISM: Record<string, string> = {
  'hard-interrupts': 'Cut cleanly across the current section with a stop, stab, silence, or abrupt re-entry; the cue must have an audible consequence.',
  'event-driven-form': 'Make this cue begin the next formal event or section instead of waiting for a verse/chorus boundary.',
  'group-unison-burst': 'Recruit a brief exact ensemble unison as punctuation, then release it instead of turning it into a constant choir.',
  'call-response': 'Force a different performer population to answer the cue with new timing or information.',
  'vocal-relay': 'Hand one phrase, rule, or rhythmic function to another voice while preserving enough identity to hear the transfer.',
  'communal-infection': 'Recruit one additional human layer because of the cue: answer, clap, stomp, shout, chant, or brief unison.',
  'vocal-cast': 'Bring a distinct cast member or vocal population forward to perform its assigned job.',
  'anchor-survival': 'Expose or restate the protected anchor so the listener can reorient before mutation resumes.',
  'exposure-windows': 'Strip masking away and expose one or two parts nearly alone for a short window.',
  'jurisdiction-dropout': 'Remove one entire musical function for a defined window; surviving systems must continue without secretly replacing it.',
  'role-migration': 'Transfer one recognizable musical job to a different source or performer because this cue occurred.',
  'false-resolution': 'Create an apparent arrival, then preserve the pulse while revealing a new unresolved grouping.',
  'double-time-activity': 'Keep the base pulse stable while secondary activity suddenly moves at roughly double the event rate.',
  'meter-collision': 'Foreground a second accent map or cycle against the existing pulse while preserving measurable alignment points.',
  'phonetic-percussion': 'Turn the cue phrase or response into rhythmic consonants and mouth attacks that reinforce the arrangement.',
  'body-percussion': 'Translate the cue into a distinct clap, stomp, slap, footfall, or breath accent layer.',
  'dry-separation': 'Clear shared wash around the cue so the responding source is exposed with a sharp local edge.',
  'hocket-relay': 'Split the cue response across performers so no single voice owns the whole line.',
  'township-rhythmic-brightness': 'Answer the cue with a short buoyant offbeat guitar, bass, clap, or whistle-like rhythmic event.',
};

function hash(input: string): number {
  let value = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    value ^= input.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function mechanismIdsFromCompiled(compiled: CompiledStarterSeedStack): string[] {
  const ids = compiled.musicMechanismRefs.map((ref) => ref.id);
  compiled.musicRecipeRefs.forEach((ref) => {
    const recipe = getMusicSeedRecipe(ref.id);
    if (recipe) ids.push(...recipe.mechanismIds);
  });
  return unique(ids).filter((id) => Boolean(getMusicMechanism(id)));
}

function preferredMechanisms(cue: string): string[] {
  const lower = cue.toLowerCase();
  return unique(
    CUE_PREFERENCES
      .filter((rule) => rule.terms.some((term) => lower.includes(term)))
      .flatMap((rule) => rule.mechanisms),
  );
}

function chooseMechanism(cue: string, pool: string[], salt: string): string {
  const preferences = preferredMechanisms(cue);
  for (const id of preferences) {
    if (pool.includes(id)) return id;
  }

  const preferredFallback = preferences.find((id) => Boolean(getMusicMechanism(id)));
  if (pool.length === 0 && preferredFallback) return preferredFallback;

  const effective = pool.length ? pool : [...FALLBACK_MECHANISMS];
  return effective[hash(salt + '|' + cue) % effective.length];
}

function actionFor(mechanismId: string): string {
  if (ACTION_BY_MECHANISM[mechanismId]) return ACTION_BY_MECHANISM[mechanismId];
  const mechanism = getMusicMechanism(mechanismId);
  return mechanism
    ? mechanism.shortExplanation + ' Make the world cue the causal trigger for that behavior.'
    : 'Make the world cue cause an audible structural change.';
}

export function compileStarterEventBridge(
  compiled: CompiledStarterSeedStack,
  stack: StarterSeedStackItem[],
): StarterSeedEventBridgePlan {
  const stackBySeed = new Map(stack.map((item) => [item.seedId, item]));
  const availableMechanismIds = mechanismIdsFromCompiled(compiled);
  const bindings: StarterSeedEventBinding[] = [];
  const enabledWorldSeedIds: string[] = [];

  compiled.activeSeeds.forEach(({ seed }) => {
    if (!seed.worldFrame) return;
    const item = stackBySeed.get(seed.id);
    if (item?.eventBridgeEnabled === false) return;

    enabledWorldSeedIds.push(seed.id);
    seed.worldFrame.eventCues.forEach((cue, index) => {
      const mechanismId = chooseMechanism(
        cue,
        availableMechanismIds,
        seed.id + '|' + index,
      );
      const mechanism = getMusicMechanism(mechanismId);
      if (!mechanism) return;

      const source: StarterSeedEventBinding['source'] =
        availableMechanismIds.includes(mechanismId) ? 'active-stack' : 'fallback';

      bindings.push({
        worldSeedId: seed.id,
        worldName: seed.name,
        cue,
        mechanismId,
        mechanismName: mechanism.name,
        source,
        directive:
          'WHEN [' +
          cue +
          '] happens in ' +
          seed.name +
          ': trigger ' +
          mechanism.name +
          '. ' +
          actionFor(mechanismId) +
          ' Keep the world frame intact; do not merely mention the cue in lyrics.',
      });
    });
  });

  return {
    enabledWorldSeedIds: unique(enabledWorldSeedIds),
    availableMechanismIds,
    bindings,
  };
}
