import {
  MouthTrait,
  MouthTraitRelationship,
  MouthTraitRelationshipRule,
} from './types';
import { getMouthTrait } from './traits';

function key(a: string, b: string): string {
  return [a, b].sort().join('|');
}

const RULES: MouthTraitRelationshipRule[] = [
  {
    traitAId: 'mouth-trait-extreme-cluster',
    traitBId: 'mouth-trait-open-syllable-pressure',
    relationship: 'competitive',
    explanation: 'One system rewards dense consonant adjacency while the other repairs toward vowel-ending syllables.',
    resolutionLaw: 'Accumulate consonants until open-syllable pressure forces repair; insert or expose a vowel, then allow clustering to begin again. Neither rule disappears.',
    severity: 5,
  },
  {
    traitAId: 'mouth-trait-consonantal-nucleus',
    traitBId: 'mouth-trait-open-syllable-pressure',
    relationship: 'competitive',
    explanation: 'Consonantal nuclei resist the same vowel-centered syllable architecture that open-syllable pressure prefers.',
    resolutionLaw: 'Consonantal nuclei may survive in bounded positions; open-syllable repair wins at selected phrase or stress boundaries, producing audible alternation between dry and vowel-rich states.',
    severity: 5,
  },
  {
    traitAId: 'mouth-trait-vowel-starvation',
    traitBId: 'mouth-trait-open-syllable-pressure',
    relationship: 'competitive',
    explanation: 'Vowel starvation minimizes vowel categories while open-syllable repair repeatedly needs audible vowel nuclei.',
    resolutionLaw: 'Use a very small reusable vowel set as repair material. The system may insert vowels often without expanding the vowel inventory.',
    severity: 4,
  },
  {
    traitAId: 'mouth-trait-huge-consonant-palette',
    traitBId: 'mouth-trait-tiny-inventory',
    relationship: 'mutuallyExclusive',
    explanation: 'One trait expands consonant distinctions while the other deliberately collapses the available segment inventory.',
    resolutionLaw: 'At high stability, keep the higher-pressure trait and suppress the other. At low stability, alternate between expanded and collapsed inventory states instead of averaging them.',
    severity: 5,
  },
  {
    traitAId: 'mouth-trait-alveolar-trill',
    traitBId: 'mouth-trait-uvular-rhotic',
    relationship: 'mutuallyExclusive',
    explanation: 'Both traits compete for the same rhotic targets using incompatible primary articulations.',
    resolutionLaw: 'At high stability, one rhotic realization owns the target class. At low stability, divide rhotics by position or alternate them by phrase; never mush them into a vague generic accent.',
    severity: 5,
  },
  {
    traitAId: 'mouth-trait-click-bantu',
    traitBId: 'mouth-trait-click-high-dimensional',
    relationship: 'competitive',
    explanation: 'Both traits define click organization, but at different levels of inventory complexity and role assignment.',
    resolutionLaw: 'Keep the integrated syllabic placement rule while allowing only a bounded subset of the high-dimensional click classes to occupy it.',
    severity: 4,
  },
  {
    traitAId: 'mouth-trait-lexical-tone',
    traitBId: 'mouth-trait-pitch-accent',
    relationship: 'competitive',
    explanation: 'Both traits claim lexical pitch organization but impose different kinds of pitch contrast.',
    resolutionLaw: 'Assign tone and pitch-accent pressure to separate lexical classes, cast roles, or phrase zones. Do not flatten them into generic melodic expressiveness.',
    severity: 4,
  },
  {
    traitAId: 'mouth-trait-mora-timing',
    traitBId: 'mouth-trait-three-way-quantity',
    relationship: 'competitive',
    explanation: 'Both systems claim fine-grained timing structure but divide duration differently.',
    resolutionLaw: 'Use mora-like timing as the base clock while quantity selects one, two, or three clock-weight classes. If instability is high, permit local clock disagreement.',
    severity: 4,
  },
  {
    traitAId: 'mouth-trait-vowel-harmony',
    traitBId: 'mouth-trait-agglutinative-chain',
    relationship: 'catalytic',
    explanation: 'Suffix growth creates exactly the environment in which harmony can repeatedly recolor added material.',
    resolutionLaw: 'Every new suffix-like layer inherits the active vowel-harmony class unless a defined boundary resets it.',
    severity: 4,
  },
  {
    traitAId: 'mouth-trait-nasal-harmony',
    traitBId: 'mouth-trait-nasal-vowels',
    relationship: 'catalytic',
    explanation: 'Local nasal-vowel contrast can act as the trigger for domain-wide nasal propagation.',
    resolutionLaw: 'A designated nasal vowel activates the harmony domain; nasality propagates until a blocker or boundary explicitly resets it.',
    severity: 4,
  },
  {
    traitAId: 'mouth-trait-lexical-tone',
    traitBId: 'mouth-trait-tone-plus-phonation',
    relationship: 'catalytic',
    explanation: 'Lexical pitch categories can trigger systematic changes in voice quality.',
    resolutionLaw: 'Map selected tone categories to stable phonation states so pitch changes cause timbral changes rather than independent random effects.',
    severity: 4,
  },
  {
    traitAId: 'mouth-trait-consonant-vowel-coupling',
    traitBId: 'mouth-trait-huge-consonant-palette',
    relationship: 'catalytic',
    explanation: 'A richer consonant palette creates more opportunities for consonant-controlled vowel recoloring.',
    resolutionLaw: 'Each consonant class owns a predictable neighboring-vowel color; expanding consonant categories expands timbral vowel outcomes without adding arbitrary vowel phonemes.',
    severity: 4,
  },
  {
    traitAId: 'mouth-trait-root-pattern-interlock',
    traitBId: 'mouth-trait-agglutinative-chain',
    relationship: 'cooperative',
    explanation: 'A patterned lexical core and an outer suffix chain can occupy different morphological layers.',
    resolutionLaw: 'Derive the internal root-pattern form first; then attach clearly segmented outer layers. Inner and outer morphology must remain audibly distinguishable.',
    severity: 3,
  },
  {
    traitAId: 'mouth-trait-root-pattern-interlock',
    traitBId: 'mouth-trait-vowel-harmony',
    relationship: 'unstable',
    explanation: 'Both systems may attempt to control vowel realization for different structural reasons.',
    resolutionLaw: 'Let root-pattern vowels define the lexical core while harmony may alter only eligible outer material. If mutation pressure rises, allow controlled leakage into the core.',
    severity: 4,
  },
  {
    traitAId: 'mouth-trait-bound-verb-packing',
    traitBId: 'mouth-trait-polysynthetic-suffix-chain',
    relationship: 'cooperative',
    explanation: 'Both favor information packing, but one emphasizes layered verb structure while the other emphasizes clause-like suffix accumulation.',
    resolutionLaw: 'Use one stable verbal core, then add a bounded sequence of functional layers. Prevent unbounded growth by respecting the genome stability control.',
    severity: 3,
  },
  {
    traitAId: 'mouth-trait-ejective-attack',
    traitBId: 'mouth-trait-glottal-stop',
    relationship: 'cooperative',
    explanation: 'Both use laryngeal closure but can occupy different consonantal or boundary roles.',
    resolutionLaw: 'Reserve ejective pressure for eligible stop/affricate attacks and glottal-stop punctuation for segmentation boundaries so they remain separately audible.',
    severity: 3,
  },
  {
    traitAId: 'mouth-trait-stod',
    traitBId: 'mouth-trait-glottal-stop',
    relationship: 'competitive',
    explanation: 'Both can create glottal interruption and may become perceptually redundant if unconstrained.',
    resolutionLaw: 'Assign one to lexical/stressed-syllable interruption and the other to explicit segment or phrase boundaries.',
    severity: 3,
  },
  {
    traitAId: 'mouth-trait-tiny-inventory',
    traitBId: 'mouth-trait-front-rounded-vowels',
    relationship: 'competitive',
    explanation: 'A deliberately tiny inventory limits the vowel distinctions available to a richer front-rounded field.',
    resolutionLaw: 'Keep only one or two front-rounded targets if the tiny inventory remains dominant; otherwise suppress the tiny-inventory rule for vowels while retaining consonant compression.',
    severity: 3,
  },
  {
    traitAId: 'mouth-trait-full-vowel-preservation',
    traitBId: 'mouth-trait-vowel-starvation',
    relationship: 'competitive',
    explanation: 'One rule preserves audible vowel nuclei while the other minimizes vowel variety and presence.',
    resolutionLaw: 'Preserve fullness only for the small set of surviving vowel anchors; do not add extra vowel categories.',
    severity: 3,
  },
];

const RULE_BY_KEY = new Map(RULES.map((rule) => [key(rule.traitAId, rule.traitBId), rule]));

function sharedAxes(a: MouthTrait, b: MouthTrait): string[] {
  return a.axes.filter((axis) => b.axes.includes(axis));
}

function sharedTags(a: MouthTrait, b: MouthTrait): string[] {
  return a.tags.filter((tag) => b.tags.includes(tag));
}

export function inferMouthTraitRelationship(
  traitA: MouthTrait,
  traitB: MouthTrait,
): MouthTraitRelationshipRule {
  const explicit = RULE_BY_KEY.get(key(traitA.id, traitB.id));
  if (explicit) return explicit;

  const axes = sharedAxes(traitA, traitB);
  const tags = sharedTags(traitA, traitB);

  let relationship: MouthTraitRelationship = 'orthogonal';
  let severity: 1 | 2 | 3 | 4 | 5 = 1;
  let explanation = 'The traits occupy substantially different mouth jurisdictions.';
  let resolutionLaw = 'Keep both traits separately audible and do not let one become a vague description of the other.';

  if (axes.length === 0) {
    relationship = 'orthogonal';
    severity = 1;
  } else if (tags.includes('coupling') || tags.includes('harmony') || tags.includes('contagion')) {
    relationship = 'catalytic';
    severity = 3;
    explanation = 'The traits share a jurisdiction and one contains an explicit propagation/coupling mechanism.';
    resolutionLaw = 'Use the first audible state change as a trigger for the second trait rather than running them as unrelated decorations.';
  } else if (traitA.category === traitB.category && axes.length >= 2) {
    relationship = 'competitive';
    severity = 3;
    explanation = 'The traits make overlapping claims on multiple mouth axes.';
    resolutionLaw = 'Partition the shared jurisdiction by position, phrase, or trigger so each rule remains identifiable.';
  } else {
    relationship = 'cooperative';
    severity = 2;
    explanation = 'The traits share a mouth axis but can coexist if their roles remain explicit.';
    resolutionLaw = 'Keep one trait as the base state and let the other modify a named subset of that state.';
  }

  return {
    traitAId: traitA.id,
    traitBId: traitB.id,
    relationship,
    explanation,
    resolutionLaw,
    severity,
  };
}

export function getMouthTraitRelationship(
  traitAId: string,
  traitBId: string,
): MouthTraitRelationshipRule | undefined {
  if (traitAId === traitBId) return undefined;

  const traitA = getMouthTrait(traitAId);
  const traitB = getMouthTrait(traitBId);
  if (!traitA || !traitB) return undefined;

  return inferMouthTraitRelationship(traitA, traitB);
}

export function getExplicitMouthTraitRelationshipRules(): MouthTraitRelationshipRule[] {
  return [...RULES];
}
