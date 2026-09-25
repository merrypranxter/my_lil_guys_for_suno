import {
  MouthGenome,
  MouthLinkedGeneBundle,
  MouthSpecimen,
  MouthSpecimenCaptureRequest,
  MouthSpecimenCategory,
  MouthSpecimenRecurrence,
} from './types';
import {
  applyMouthQuirk,
  getMouthQuirkDefinition,
  instantiateMouthQuirk,
  reidentifyMouthGenome,
} from './quirks';
import { getMouthTrait } from './traits';
import { hashMouthString, stableStringify } from './determinism';

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function specimenStrength(recurrence: MouthSpecimenRecurrence): number {
  return {
    once: 28,
    occasional: 48,
    repeated: 74,
    everyTime: 100,
  }[recurrence];
}

function inferCategory(text: string): MouthSpecimenCategory {
  const q = text.toLowerCase();

  if (/\br\b|rhotic|rolled|trill|pronounc|accent|consonant|vowel|click|ejective/.test(q)) {
    return 'pronunciation';
  }
  if (/creaky|breathy|glottal|voice quality|phonation|vocal fry/.test(q)) {
    return 'voiceQuality';
  }
  if (/timing|late|early|drag|rush|long|short|duration/.test(q)) {
    return 'timing';
  }
  if (/rhythm|beat|offbeat|syncop|pulse/.test(q)) {
    return 'rhythm';
  }
  if (/word|suffix|prefix|morph|mega-word|agglutin|root/.test(q)) {
    return 'morphology';
  }

  return 'unknown';
}

export function suggestMouthQuirksFromObservation(observation: string): string[] {
  const q = normalizeText(observation).toLowerCase();
  const suggestions: string[] = [];

  const add = (id: string) => {
    if (!suggestions.includes(id) && getMouthQuirkDefinition(id)) suggestions.push(id);
  };

  if (
    /(rolled|rolls|rolling|trilled|trill|rrrr|every.*r|all.*r)/.test(q) &&
    /r|rhotic/.test(q)
  ) {
    add('mouth-quirk-global-r-trill');
  }

  if (/uvular|back.*r|throat.*r|guttural.*r/.test(q)) {
    add('mouth-quirk-uvular-r-takeover');
  }

  if (/ejective|popp?ed|pop.*k|pop.*t|k.*pop|t.*pop/.test(q)) {
    add('mouth-quirk-ejective-k-t');
  }

  if (/glottal|catch|stød|stod|vocal fry/.test(q)) {
    add('mouth-quirk-glottal-stress-catch');
  }

  if (/final consonant|ends? disappear|cuts? off.*word|word.*clipp/.test(q)) {
    add('mouth-quirk-final-consonant-clipping');
  }

  if (/insert.*vowel|vowel.*between|break.*cluster|cluster.*vowel/.test(q)) {
    add('mouth-quirk-cluster-vowel-repair');
  }

  if (/cluster|consonants?.*pile|consonants?.*stack|vowels?.*disappear/.test(q)) {
    add('mouth-quirk-cluster-compression');
  }

  if (/nasal|nose|nasalized/.test(q)) {
    add('mouth-quirk-pre-nasal-vowel');
  }

  if (/creaky.*third|third.*creaky|every third/.test(q)) {
    add('mouth-quirk-every-third-creaky');
  }

  if (/long vowel|held vowel|vowel.*forever|stretch.*vowel/.test(q)) {
    add('mouth-quirk-long-vowel-overstretch');
  }

  if (/schwa|full vowel|every vowel.*clear|unstressed.*vowel/.test(q)) {
    add('mouth-quirk-no-schwa-collapse');
  }

  if (/rising|upward|every phrase.*up|ends?.*up/.test(q)) {
    add('mouth-quirk-phrase-final-rise');
  }

  if (/click.*offbeat|offbeat.*click|syncop.*click/.test(q)) {
    add('mouth-quirk-offbeat-click');
  }

  if (/high note.*r|r.*high note|pitch.*trill/.test(q)) {
    add('mouth-quirk-pitch-triggered-trill');
  }

  if (/repeat.*mutat|same word.*different|repeated.*corrupt/.test(q)) {
    add('mouth-quirk-repetition-corruption');
  }

  if (/breath.*word|word.*breath|aspirat.*onset/.test(q)) {
    add('mouth-quirk-breath-onset');
  }

  if (/prenasal|nasal.*stop|stop.*nasal/.test(q)) {
    add('mouth-quirk-prenasalized-stops');
  }

  if (/lateral|welsh.*ll|noisy.*l|hiss.*l/.test(q)) {
    add('mouth-quirk-lateral-noise-l');
  }

  return suggestions;
}

function recurrenceFromObservation(
  observation: string,
): MouthSpecimenRecurrence {
  const q = observation.toLowerCase();
  if (/every single|every fucking|every damn|every time|all of them|100%|constant/.test(q)) {
    return 'everyTime';
  }
  if (/kept|repeated|again and again|a lot|often/.test(q)) return 'repeated';
  if (/sometimes|occasionally|here and there|randomly/.test(q)) return 'occasional';
  return 'once';
}

export function captureMouthSpecimen(
  request: MouthSpecimenCaptureRequest,
): MouthSpecimen {
  const observedBehavior = normalizeText(request.observedBehavior);
  if (!observedBehavior) {
    throw new Error('A Mouth Lab specimen needs an observed behavior.');
  }

  const inferredQuirkIds = suggestMouthQuirksFromObservation(observedBehavior);
  const quirkIds = Array.from(
    new Set([...(request.quirkIds || []), ...inferredQuirkIds]),
  )
    .filter((id) => Boolean(getMouthQuirkDefinition(id)))
    .sort();

  const linkedTraitIds = Array.from(new Set(request.linkedTraitIds || []))
    .filter((id) => Boolean(getMouthTrait(id)))
    .sort();

  for (const quirkId of quirkIds) {
    const definition = getMouthQuirkDefinition(quirkId);
    for (const traitId of definition?.sourceTraitIds || []) {
      if (getMouthTrait(traitId) && !linkedTraitIds.includes(traitId)) {
        linkedTraitIds.push(traitId);
      }
    }
  }
  linkedTraitIds.sort();

  const recurrence =
    request.recurrence || recurrenceFromObservation(observedBehavior);
  const category =
    request.category || inferCategory(observedBehavior);
  const whyLiked = normalizeText(request.whyLiked || '');
  const tags = Array.from(
    new Set([
      ...(request.tags || []),
      category,
      recurrence,
      ...quirkIds.flatMap(
        (quirkId) => getMouthQuirkDefinition(quirkId)?.tags || [],
      ),
    ]),
  ).sort();

  const signature = stableStringify({
    observedBehavior,
    whyLiked,
    category,
    recurrence,
    sourceRunId: request.sourceRunId || '',
    sourceGenomeId: request.sourceGenomeId || '',
    quirkIds,
    linkedTraitIds,
    tags,
  });
  const now = Date.now();

  return {
    id: 'mouth_specimen_' + hashMouthString(signature).toString(36),
    name:
      normalizeText(request.name || '') ||
      (quirkIds.length === 1
        ? getMouthQuirkDefinition(quirkIds[0])?.name || 'UNNAMED SPECIMEN'
        : 'WILD MOUTH SPECIMEN'),
    observedBehavior,
    whyLiked,
    category,
    recurrence,
    sourceRunId: request.sourceRunId,
    sourceGenomeId: request.sourceGenomeId,
    quirkIds,
    linkedTraitIds,
    linkedGeneBundleIds: [],
    tags,
    createdAt: now,
    updatedAt: now,
  };
}

export function createLinkedGeneBundleFromSpecimen(
  specimen: MouthSpecimen,
  name = '',
): MouthLinkedGeneBundle {
  const signature = stableStringify({
    specimenId: specimen.id,
    traitIds: specimen.linkedTraitIds,
    quirkIds: specimen.quirkIds,
  });

  return {
    id: 'mouth_bundle_' + hashMouthString(signature).toString(36),
    name: normalizeText(name) || specimen.name + ' LINKED GENES',
    traitIds: [...specimen.linkedTraitIds].sort(),
    quirkIds: [...specimen.quirkIds].sort(),
    lockedTogether: true,
    note:
      specimen.whyLiked ||
      'Captured from specimen ' +
        specimen.id +
        '; keep the observed trait combination together unless explicitly unlinked.',
    createdAt: Date.now(),
  };
}

export interface ApplySpecimenResult {
  genome: MouthGenome;
  appliedQuirkIds: string[];
  missingTraitIds: string[];
  bundle: MouthLinkedGeneBundle;
}

export function applyMouthSpecimen(
  genome: MouthGenome,
  specimen: MouthSpecimen,
): ApplySpecimenResult {
  let next = genome;
  const strength = specimenStrength(specimen.recurrence);
  const appliedQuirkIds: string[] = [];

  for (const quirkId of specimen.quirkIds) {
    const definition = getMouthQuirkDefinition(quirkId);
    if (!definition) continue;

    const instance = instantiateMouthQuirk(
      quirkId,
      {
        frequency: Math.max(definition.defaultFrequency, strength),
        consistency: Math.max(definition.defaultConsistency, strength),
        exaggeration:
          specimen.recurrence === 'everyTime'
            ? Math.max(definition.defaultExaggeration, 88)
            : definition.defaultExaggeration,
        linkedTraitIds: specimen.linkedTraitIds,
      },
      specimen.id,
    );

    next = applyMouthQuirk(next, instance);
    appliedQuirkIds.push(quirkId);
  }

  const genomeTraitIds = new Set(
    next.assignments.flatMap((assignment) => assignment.traitIds),
  );
  const missingTraitIds = specimen.linkedTraitIds.filter(
    (traitId) => !genomeTraitIds.has(traitId),
  );

  const bundle = createLinkedGeneBundleFromSpecimen(specimen);
  next = reidentifyMouthGenome({
    ...next,
    linkedGeneBundles: [
      ...next.linkedGeneBundles.filter((item) => item.id !== bundle.id),
      bundle,
    ].sort((a, b) => a.id.localeCompare(b.id)),
    mutationScars: [
      ...next.mutationScars,
      {
        id:
          'mouth_scar_' +
          hashMouthString(
            stableStringify({
              specimenId: specimen.id,
              genomeId: next.id,
              appliedQuirkIds,
              missingTraitIds,
            }),
          ).toString(36),
        sourceOperation: 'specimen-application',
        removedTraitIds: [],
        removedQuirkIds: [],
        residualRule:
          'Specimen ' +
          specimen.name +
          ' entered the genome. Missing source traits remain historical ancestry only until explicitly bred or assigned.',
        strength,
        createdAt: Date.now(),
      },
    ],
    createdAt: Date.now(),
  });

  return {
    genome: next,
    appliedQuirkIds,
    missingTraitIds,
    bundle,
  };
}
