import { MouthGenome, MouthTechniqueDefinition, MouthTechniqueJob, MouthTechniquePaletteEntry } from './types';
import { getMouthTrait } from './traits';

function technique(
  id: string,
  name: string,
  family: MouthTechniqueDefinition['family'],
  description: string,
  jobs: MouthTechniqueJob[],
  traitTags: string[],
  mutationProperties: MouthTechniqueDefinition['mutationProperties'],
  minCooldownEvents: number,
  maxConsecutiveUses: number,
  intelligibilityCost: number,
  densityCost: number,
  promptRule: string,
  compatibleTechniqueIds: string[] = [],
  antagonisticTechniqueIds: string[] = [],
): MouthTechniqueDefinition {
  return { id, name, family, description, jobs, traitTags, mutationProperties, minCooldownEvents, maxConsecutiveUses, intelligibilityCost, densityCost, promptRule, compatibleTechniqueIds, antagonisticTechniqueIds };
}

export const MOUTH_TECHNIQUES: MouthTechniqueDefinition[] = [
  technique('tech-yodel-break','YODEL BREAK','register','Abrupt chest/head register alternation used as a structural switch, not pastoral decoration.',['transition','escalation'],['register','pitch','prosody'],['register','contour','rhythm'],2,2,22,34,'Use sudden register flips on selected syllables or phrase boundaries. Let the flip inherit the current melody or rhythm instead of starting a new song.',['tech-melisma-chain','tech-patter-burst'],['tech-creak-lock']),
  technique('tech-whistle-leap','WHISTLE LEAP','register','Very high whistle-like or flageolet gesture that behaves like a melodic projectile.',['punctuation','transition'],['pitch','vowel','tone'],['register','contour','function'],3,1,30,28,'Reserve extreme upper-register leaps for punctuation or answer gestures; do not wallpaper the whole performance with them.',['tech-vowel-catapult'],[]),
  technique('tech-patter-burst','PATTER BURST','rhythm','Compressed intelligible syllable stream with speech-like velocity.',['lead','percussion','escalation'],['timing','compression','consonant-heavy'],['rhythm','articulation','function'],1,2,12,42,'Compress words into rapid articulated runs while preserving enough consonant edges for the text to remain trackable.',['tech-consonant-drum','tech-yodel-break'],['tech-long-vowel-suspension']),
  technique('tech-scat-engine','SCAT ENGINE','phonetic','Nonlexical syllables selected for attack, vowel color, and rhythmic shape rather than semantic meaning.',['percussion','texture','response'],['syllable','phonotactics','vowel','consonant-heavy'],['rhythm','articulation','timbre'],1,3,48,38,'Build short repeatable vocable cells with audible internal rules; mutate one phonetic property at a time.',['tech-consonant-drum','tech-vowel-catapult'],[]),
  technique('tech-consonant-drum','CONSONANT DRUM','articulation','Hard consonants function as attacks, fills, and punctuation.',['percussion','punctuation'],['percussive','ejective','click','cluster','consonant-heavy'],['rhythm','articulation','function'],0,3,24,45,'Treat stops, clicks, trills, affricates, and dense clusters as timed attacks. Keep their placement patterned rather than random.',['tech-scat-engine','tech-patter-burst','tech-hocket-relay'],['tech-breath-cloud']),
  technique('tech-hocket-relay','HOCKET RELAY','ensemble','A phrase or phonetic cell is split across independent voices.',['response','percussion','escalation'],['timing','cast','percussive'],['rhythm','function','register'],1,3,18,46,'Split one line or cell across distinguishable mouths so no single voice owns the whole gesture. Preserve a shared pulse or phrase identity.',['tech-consonant-drum','tech-call-response-infection'],[]),
  technique('tech-trill-accelerator','TRILL ACCELERATOR','articulation','Rolled consonants become audible acceleration ramps.',['punctuation','transition','percussion'],['trill','rhotic','percussive'],['rhythm','articulation','function'],1,2,20,30,'Lengthen selected trills as acceleration devices, then release into the next event. Do not trill every available consonant unless the genome explicitly demands obsessive takeover.',['tech-patter-burst'],[]),
  technique('tech-ululation-wave','ULULATION WAVE','ornament','Fast repeated high oscillation used as a bounded wave event.',['texture','transition','escalation'],['prosody','vowel','tone'],['contour','rhythm','register'],3,1,36,36,'Use a short rapid oscillating vocal wave as a discrete event with a clear entrance and exit; it must hand something forward to the next phrase.',['tech-vowel-catapult'],[]),
  technique('tech-melisma-chain','MELISMA CHAIN','ornament','One syllable carries a long melodic chain without losing its identity.',['lead','anchor','transition'],['vowel','pitch','prosody'],['contour','rhythm','register'],2,2,14,24,'Stretch one intelligible syllable across multiple pitches; preserve the syllable as the anchor while its contour mutates.',['tech-yodel-break','tech-vowel-catapult'],['tech-patter-burst']),
  technique('tech-long-vowel-suspension','LONG VOWEL SUSPENSION','ornament','Open vowel freezes lexical time while harmony or rhythm continues moving.',['anchor','transition','texture'],['vowel','duration','open-syllable'],['rhythm','timbre','function'],2,1,18,12,'Hold an open vowel long enough that surrounding parts can change beneath it; use it as temporal contrast, not generic belting.',['tech-resonance-drone'],['tech-patter-burst']),
  technique('tech-vowel-catapult','VOWEL CATAPULT','register','An open vowel launches across a large pitch or register interval.',['punctuation','transition'],['vowel','pitch','open-syllable'],['contour','register','function'],2,2,16,26,'Launch a selected open vowel abruptly upward or downward while keeping its phonetic identity audible.',['tech-whistle-leap','tech-melisma-chain'],[]),
  technique('tech-creak-lock','CREAK LOCK','resonance','Brief glottal/creaky constriction freezes or punctures a phrase.',['punctuation','texture'],['glottal','creaky','larynx'],['articulation','rhythm','timbre'],2,2,20,18,'Use brief creaky or constricted events at structural stress points; never smear fry continuously across unrelated material.',['tech-glottal-gate'],['tech-yodel-break']),
  technique('tech-glottal-gate','GLOTTAL GATE','articulation','A glottal interruption behaves like an edit point or trapdoor.',['punctuation','transition'],['glottal','larynx','attack'],['rhythm','articulation','function'],1,2,12,22,'Insert a clean glottal interruption at selected boundaries so the phrase visibly changes state after the gate.',['tech-creak-lock','tech-patter-burst'],[]),
  technique('tech-breath-cloud','BREATH CLOUD','airflow','Unpitched breath temporarily becomes the foreground material.',['texture','transition'],['airflow','aspiration','breath'],['rhythm','timbre','function'],3,1,38,12,'Let breath noise briefly carry rhythm or texture, then return control to articulated material. Keep it bounded and purposeful.',['tech-resonance-drone'],['tech-consonant-drum']),
  technique('tech-resonance-drone','RESONANCE DRONE','resonance','Nasal or overtone-rich resonance acts as a sustained bed beneath active articulation.',['texture','anchor'],['nasal','resonance','tone'],['timbre','register','function'],2,2,26,18,'Sustain a stable resonant vowel or nasal field while another mouth behavior moves against it.',['tech-long-vowel-suspension','tech-breath-cloud'],[]),
  technique('tech-register-rupture','REGISTER RUPTURE','register','A line changes vocal register mid-gesture while keeping its rhythmic or semantic ancestry.',['transition','escalation'],['register','prosody','mutation'],['register','function','timbre'],2,2,18,30,'Move an ongoing phrase into a sharply different register without restarting its rhythm, words, or contour from zero.',['tech-yodel-break','tech-patter-burst'],[]),
  technique('tech-call-response-infection','CALL RESPONSE INFECTION','ensemble','A response voice copies one property of the lead and gradually acquires more.',['response','escalation'],['cast','mutation','timing'],['function','rhythm','articulation','register'],1,3,10,32,'Begin with a distinct response role. On later returns inherit exactly one audible property from the source voice at a time.',['tech-hocket-relay','tech-scat-engine'],[]),
  technique('tech-phoneme-stutter','PHONEME STUTTER','phonetic','A chosen phoneme repeats as a rhythmic cell without simulating involuntary speech.',['percussion','punctuation'],['phoneme','timing','micro-mutation'],['rhythm','articulation'],1,2,28,32,'Repeat a deliberately selected phoneme or syllable fragment as composed rhythmic material; keep the target consistent enough to read as a rule.',['tech-consonant-drum'],[]),
  technique('tech-syllable-elastic','SYLLABLE ELASTIC','rhythm','Syllable duration stretches and snaps while the phrase remains recognizable.',['lead','transition'],['timing','duration','stress'],['rhythm','contour'],1,3,14,24,'Alternate compressed and stretched syllables inside one recognizable phrase. Preserve word order while time deforms around it.',['tech-patter-burst','tech-long-vowel-suspension'],[]),
  technique('tech-mouth-orchestra-relay','MOUTH ORCHESTRA RELAY','ensemble','Different mouths successively take instrumental jobs: bass, percussion, lead, drone, fill.',['escalation','response','texture'],['cast','percussive','resonance','timing'],['function','timbre','register','rhythm'],2,2,22,48,'Rotate instrumental jobs between distinct vocal agents. Only one or two roles should mutate at a time; preserve cast identity and avoid generic choir stacking.',['tech-hocket-relay','tech-consonant-drum','tech-resonance-drone'],[]),
];

const BY_ID = new Map(MOUTH_TECHNIQUES.map((item) => [item.id, item]));

export function getMouthTechnique(id: string): MouthTechniqueDefinition | undefined {
  return BY_ID.get(id);
}

function activeTags(genome: MouthGenome): Set<string> {
  const tags = new Set<string>();
  for (const assignment of genome.assignments) {
    tags.add(assignment.axis);
    for (const traitId of assignment.traitIds) {
      const trait = getMouthTrait(traitId);
      trait?.tags.forEach((tag) => tags.add(tag));
      trait?.axes.forEach((axis) => tags.add(axis));
    }
  }
  return tags;
}

export function deriveMouthTechniquePalette(genome: MouthGenome, limit = 8): MouthTechniquePaletteEntry[] {
  const tags = activeTags(genome);
  const expression = Math.max(0, Math.min(100, Math.round(genome.musicalExpression ?? 50)));
  const mutation = Math.max(0, Math.min(100, Math.round(genome.mutation ?? 35)));
  const intelligibility = Math.max(0, Math.min(100, Math.round(genome.intelligibility ?? 80)));

  return MOUTH_TECHNIQUES.map((item) => {
    const matches = item.traitTags.filter((tag) => tags.has(tag)).length;
    const costPenalty = Math.max(0, item.intelligibilityCost - (100 - intelligibility) * 0.35);
    const mutationBonus = mutation >= 60 && item.mutationProperties.length >= 3 ? 8 : 0;
    const expressionBonus = expression >= 65 ? 8 : expression <= 25 ? -10 : 0;
    const weight = Math.max(0, Math.min(100, Math.round(20 + matches * 18 + mutationBonus + expressionBonus - costPenalty * 0.35)));
    const job = item.jobs[(matches + item.id.length) % item.jobs.length];
    return {
      techniqueId: item.id,
      weight,
      job,
      reason: matches ? matches + ' active mouth-tag match' + (matches === 1 ? '' : 'es') : 'wild-card technique',
    };
  })
    .filter((entry) => entry.weight >= 24)
    .sort((a, b) => b.weight - a.weight || a.techniqueId.localeCompare(b.techniqueId))
    .slice(0, Math.max(1, Math.min(12, limit)));
}

export function compileMouthTechniquePalette(genome: MouthGenome): string[] {
  const palette = deriveMouthTechniquePalette(genome);
  if (!palette.length) return [];
  const selected = new Set(palette.map((entry) => entry.techniqueId));
  const lines = [
    'MOUTH TECHNIQUE ECOLOGY: Techniques are available behaviors, not a checklist. Rotate them through jobs; do not fire the whole library simultaneously.',
  ];
  for (const entry of palette) {
    const item = getMouthTechnique(entry.techniqueId)!;
    const allies = item.compatibleTechniqueIds.filter((id) => selected.has(id)).map((id) => getMouthTechnique(id)?.name).filter(Boolean);
    const enemies = item.antagonisticTechniqueIds.filter((id) => selected.has(id)).map((id) => getMouthTechnique(id)?.name).filter(Boolean);
    lines.push(
      item.name + ' [' + entry.weight + '/100; job=' + entry.job + '; cooldown=' + item.minCooldownEvents + ' events; max-run=' + item.maxConsecutiveUses + ']: ' +
      item.promptRule +
      (allies.length ? ' Compatible relay: ' + allies.join(', ') + '.' : '') +
      (enemies.length ? ' Do not stack simultaneously with: ' + enemies.join(', ') + '.' : ''),
    );
  }
  lines.push('TECHNIQUE MUTATION LAW: transfer only one property at a time (contour, rhythm, register, articulation, function, or timbre). Every mutation must retain audible ancestry.');
  lines.push('REPETITION LAW: cooldown and max-run are anti-habit rules. Repetition is allowed when it develops a pattern; reflexive reuse without a new consequence is forbidden.');
  return lines;
}
