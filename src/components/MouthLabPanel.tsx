import React, { useEffect, useMemo, useState } from 'react';
import {
  Biohazard,
  BrainCircuit,
  Check,
  Dna,
  HeartPulse,
  Library,
  Microscope,
  RotateCcw,
  Save,
  Search,
  Shuffle,
  Trash2,
  X,
} from 'lucide-react';
import type {
  MouthGenome,
  MouthLabArchive,
  MouthPromptMode,
  MouthQuirkInstance,
  MouthSemanticMode,
  MouthTraitPressure,
} from '../mouthLab/types';
import {
  MOUTH_BREEDING_OBJECTIVES,
  MOUTH_DONORS,
  MOUTH_QUIRKS,
  applyMouthQuirk,
  applyMouthSpecimen,
  breedMouthGenome,
  captureMouthSpecimen,
  compileMouthPrompt,
  getMouthDonor,
  getMouthQuirkDefinition,
  getMouthTrait,
  instantiateMouthQuirk,
  knockoutMouthGenes,
  loadMouthLabArchive,
  projectMouthPhenotype,
  reidentifyMouthGenome,
  removeMouthQuirk,
  removeMouthSpecimen,
  removeMouthSpecies,
  saveMouthLabArchive,
  searchMouthDonors,
  upsertMouthGeneBundle,
  upsertMouthSpecimen,
  upsertMouthSpecies,
} from '../mouthLab';

interface MouthLabPanelProps {
  genome?: MouthGenome;
  promptMode: MouthPromptMode;
  semanticMode: MouthSemanticMode;
  sourceRunId?: string;
  onGenomeChange: (genome?: MouthGenome) => void;
  onPromptModeChange: (mode: MouthPromptMode) => void;
  onSemanticModeChange: (mode: MouthSemanticMode) => void;
  onNotice?: (message: string) => void;
}

type MouthTab = 'breed' | 'quirks' | 'inspect' | 'specimens';

const PRESSURES: MouthTraitPressure[] = ['low', 'medium', 'high', 'obsessive'];

const TAB_META: Record<MouthTab, { label: string; subtitle: string }> = {
  breed: { label: 'BREED LANGUAGES', subtitle: '2–6 parents • assign jurisdictions' },
  quirks: { label: 'QUIRK MONSTER', subtitle: 'tiny mutations become laws' },
  inspect: { label: 'DESIGN A MOUTH', subtitle: 'inspect / pressure / compiler' },
  specimens: { label: 'SPECIMEN ARCHIVE', subtitle: 'save the accidents worth keeping' },
};

function randomSeed(prefix = 'mouth') {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function intensityClass(pressure: MouthTraitPressure): string {
  if (pressure === 'obsessive') return 'border-[#ff3f68] bg-[#2a1018] text-[#ff9daf]';
  if (pressure === 'high') return 'border-[#ff9f43] bg-[#24170f] text-[#ffd29a]';
  if (pressure === 'medium') return 'border-[#a855f7] bg-[#1a1126] text-[#d7a7ff]';
  return 'border-[#334155] bg-[#111827] text-[#94a3b8]';
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function MouthLabPanel({
  genome,
  promptMode,
  semanticMode,
  sourceRunId,
  onGenomeChange,
  onPromptModeChange,
  onSemanticModeChange,
  onNotice,
}: MouthLabPanelProps) {
  const [tab, setTab] = useState<MouthTab>('breed');
  const [parentIds, setParentIds] = useState<string[]>(
    () => genome?.parentDonorIds?.slice(0, 6) || ['mouth-donor-english', 'mouth-donor-spanish']
  );
  const [objectiveId, setObjectiveId] = useState(
    () => genome?.objectiveId || 'mouth-objective-distance-from-english'
  );
  const [breedingSeed, setBreedingSeed] = useState(() => genome?.breedingSeed || randomSeed('breed'));
  const [intelligibility, setIntelligibility] = useState(() => genome?.intelligibility ?? 84);
  const [stability, setStability] = useState(() => genome?.stability ?? 74);
  const [mutation, setMutation] = useState(() => genome?.mutation ?? 42);
  const [donorQuery, setDonorQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [archive, setArchive] = useState<MouthLabArchive>(() => {
    try {
      return loadMouthLabArchive(window.localStorage);
    } catch {
      return { version: 1, specimens: [], species: [], linkedGeneBundles: [], updatedAt: Date.now() };
    }
  });
  const [specimenOpen, setSpecimenOpen] = useState(false);
  const [specimenObservation, setSpecimenObservation] = useState('');
  const [specimenWhy, setSpecimenWhy] = useState('');
  const [specimenName, setSpecimenName] = useState('');
  const [quirkQuery, setQuirkQuery] = useState('');
  const [geneToAdd, setGeneToAdd] = useState('');

  const phenotype = useMemo(() => (genome ? projectMouthPhenotype(genome) : undefined), [genome]);
  const activeTraitIds = useMemo(
    () => new Set(genome?.assignments.flatMap((assignment) => assignment.traitIds) || []),
    [genome]
  );
  const availableParentGenes = useMemo(() => {
    if (!genome) return [];
    const rows: Array<{ traitId: string; donorId: string }> = [];
    for (const donorId of genome.parentDonorIds) {
      const donor = getMouthDonor(donorId);
      if (!donor) continue;
      for (const traitId of donor.traitIds) {
        if (!activeTraitIds.has(traitId) && !rows.some((row) => row.traitId === traitId)) {
          rows.push({ traitId, donorId });
        }
      }
    }
    return rows;
  }, [genome, activeTraitIds]);
  const compiledPreview = useMemo(() => {
    if (!genome) return '';
    try {
      return compileMouthPrompt(genome, { mode: promptMode, semanticMode }).text;
    } catch {
      return '';
    }
  }, [genome, promptMode, semanticMode]);

  const visibleDonors = useMemo(() => searchMouthDonors(donorQuery), [donorQuery]);
  const visibleQuirks = useMemo(() => {
    const q = quirkQuery.trim().toLowerCase();
    if (!q) return MOUTH_QUIRKS;
    return MOUTH_QUIRKS.filter((quirk) =>
      [quirk.name, quirk.shortExplanation, quirk.target, ...quirk.tags]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [quirkQuery]);

  useEffect(() => {
    if (!genome) return;
    setParentIds(genome.parentDonorIds.slice(0, 6));
    setObjectiveId(genome.objectiveId || 'mouth-objective-distance-from-english');
    setBreedingSeed(genome.breedingSeed);
    setIntelligibility(genome.intelligibility);
    setStability(genome.stability);
    setMutation(genome.mutation);
  }, [genome?.id]);

  const announce = (message: string) => {
    setNotice(message);
    onNotice?.(message);
  };

  const commitArchive = (next: MouthLabArchive) => {
    let saved = next;
    try {
      saved = saveMouthLabArchive(window.localStorage, next);
    } catch {
      // Keep in-memory archive functional even if browser storage is unavailable.
    }
    setArchive(saved);
    return saved;
  };

  const toggleParent = (donorId: string) => {
    setParentIds((current) => {
      if (current.includes(donorId)) return current.filter((id) => id !== donorId);
      if (current.length >= 6) {
        announce('Six parents is the current maximum. Somebody has to leave the orgy.');
        return current;
      }
      return [...current, donorId];
    });
  };

  const breed = (ids = parentIds, objective = objectiveId, seedValue = breedingSeed) => {
    if (ids.length < 2) {
      announce('Pick at least two language parents before breeding a mouth.');
      return;
    }

    try {
      const result = breedMouthGenome({
        parentDonorIds: ids,
        breedingSeed: seedValue || randomSeed('breed'),
        objectiveId: objective,
        semanticAnchorLanguageProfileId: ids.includes('mouth-donor-english') ? 'lang-english' : undefined,
        intelligibility,
        stability,
        mutation,
      });
      onGenomeChange(result.genome);
      setParentIds(result.genome.parentDonorIds);
      setBreedingSeed(result.genome.breedingSeed);
      setTab('inspect');
      announce(
        'Bred ' + result.genome.parentDonorIds.length + '-parent mouth: ' +
        result.phenotype.activeTraits.length + ' active traits, ' +
        result.phenotype.interactions.length + ' explicit interactions.'
      );
    } catch (error: any) {
      announce(error?.message || 'Mouth breeding failed.');
    }
  };

  const quickFreak = () => {
    const nonEnglish = MOUTH_DONORS.filter((donor) => donor.id !== 'mouth-donor-english');
    const shuffled = [...nonEnglish].sort(() => Math.random() - 0.5);
    const count = 3 + Math.floor(Math.random() * 2);
    const ids = ['mouth-donor-english', ...shuffled.slice(0, count - 1).map((donor) => donor.id)];
    const objectives = MOUTH_BREEDING_OBJECTIVES.filter(
      (item) => item.id !== 'mouth-objective-minimum-mouth'
    );
    const objective = objectives[Math.floor(Math.random() * objectives.length)].id;
    const nextSeed = randomSeed('quick-freak');
    setParentIds(ids);
    setObjectiveId(objective);
    setBreedingSeed(nextSeed);
    breed(ids, objective, nextSeed);
  };

  const randomDistantParent = () => {
    const candidates = MOUTH_DONORS.filter(
      (donor) => !parentIds.includes(donor.id) && donor.traitIds.length > 0
    );
    if (!candidates.length || parentIds.length >= 6) return;
    const donor = candidates[Math.floor(Math.random() * candidates.length)];
    setParentIds((current) => [...current, donor.id]);
    announce('Added random distant parent: ' + donor.name + '.');
  };

  const saveSpecies = () => {
    if (!genome) return;
    commitArchive(upsertMouthSpecies(archive, genome));
    announce('Saved ' + genome.name + ' to the Mouth Lab species archive.');
  };

  const clearGenome = () => {
    onGenomeChange(undefined);
    announce('Active mouth cleared. Archive specimens/species were left alone.');
  };

  const setAssignmentPressure = (index: number, pressure: MouthTraitPressure) => {
    if (!genome) return;
    const assignments = genome.assignments.map((assignment, assignmentIndex) =>
      assignmentIndex === index ? { ...assignment, pressure } : assignment
    );
    onGenomeChange(reidentifyMouthGenome({ ...genome, assignments, createdAt: Date.now() }));
  };

  const knockOutTrait = (traitId: string) => {
    if (!genome) return;
    const trait = getMouthTrait(traitId);
    const next = knockoutMouthGenes(genome, {
      traitIds: [traitId],
      residualRule:
        'The full ' + (trait?.name || traitId) +
        ' gene was knocked out in DESIGN A MOUTH. A faint historical bias may remain without owning an active jurisdiction.',
      scarStrength: 18,
    });
    onGenomeChange(next);
    announce('Knocked out gene: ' + (trait?.name || traitId) + '.');
  };

  const addParentGene = () => {
    if (!genome || !geneToAdd) return;
    const candidate = availableParentGenes.find((row) => row.traitId === geneToAdd);
    const trait = getMouthTrait(geneToAdd);
    if (!candidate || !trait) return;
    const axis = trait.axes[0];
    const assignments = [
      ...genome.assignments,
      {
        axis,
        donorId: candidate.donorId,
        traitIds: [trait.id],
        pressure: trait.defaultPressure,
        locked: true,
      },
    ];
    onGenomeChange(
      reidentifyMouthGenome({
        ...genome,
        assignments,
        createdAt: Date.now(),
      })
    );
    announce('Added locked gene: ' + trait.name + ' from ' + (getMouthDonor(candidate.donorId)?.name || candidate.donorId) + '.');
    setGeneToAdd('');
  };

  const addQuirk = (quirkId: string) => {
    if (!genome) {
      announce('Breed or load a mouth before infecting it with a quirk.');
      return;
    }
    const instance = instantiateMouthQuirk(quirkId, {}, genome.id);
    onGenomeChange(applyMouthQuirk(genome, instance));
    setTab('quirks');
    announce('Quirk installed: ' + (getMouthQuirkDefinition(quirkId)?.name || quirkId) + '.');
  };

  const removeQuirk = (quirkId: string) => {
    if (!genome) return;
    onGenomeChange(removeMouthQuirk(genome, quirkId));
  };

  const updateQuirk = (
    instance: MouthQuirkInstance,
    patch: Partial<Pick<MouthQuirkInstance, 'frequency' | 'consistency' | 'exaggeration' | 'takeover'>>
  ) => {
    if (!genome) return;
    const next = instantiateMouthQuirk(
      instance.quirkId,
      {
        frequency: patch.frequency ?? instance.frequency,
        consistency: patch.consistency ?? instance.consistency,
        exaggeration: patch.exaggeration ?? instance.exaggeration,
        takeover: patch.takeover ?? instance.takeover,
        trigger: patch.takeover?.trigger || instance.trigger,
        linkedTraitIds: instance.linkedTraitIds,
      },
      genome.id + ':' + instance.quirkId
    );
    onGenomeChange(applyMouthQuirk(genome, next));
  };

  const captureSpecimen = (alsoApply: boolean) => {
    if (!specimenObservation.trim()) {
      announce('Tell me what the fuck happened first.');
      return;
    }

    const specimen = captureMouthSpecimen({
      name: specimenName,
      observedBehavior: specimenObservation,
      whyLiked: specimenWhy,
      sourceRunId,
      sourceGenomeId: genome?.id,
    });

    let nextArchive = upsertMouthSpecimen(archive, specimen);
    if (alsoApply && genome) {
      const applied = applyMouthSpecimen(genome, specimen);
      onGenomeChange(applied.genome);
      nextArchive = upsertMouthGeneBundle(nextArchive, applied.bundle);
      announce(
        'Captured specimen and infected the current mouth with ' +
        applied.appliedQuirkIds.length +
        ' recognized quirk' +
        (applied.appliedQuirkIds.length === 1 ? '' : 's') +
        '.'
      );
    } else {
      announce(
        specimen.quirkIds.length
          ? 'Captured specimen. Recognized: ' + specimen.quirkIds.map((id) => getMouthQuirkDefinition(id)?.name || id).join(', ') + '.'
          : 'Captured specimen as a wild observation. No existing quirk matched yet.'
      );
    }

    commitArchive(nextArchive);
    setSpecimenName('');
    setSpecimenObservation('');
    setSpecimenWhy('');
    setSpecimenOpen(false);
    setTab('specimens');
  };

  const applySpecimen = (specimenId: string) => {
    if (!genome) {
      announce('Load or breed a mouth before applying a specimen.');
      return;
    }
    const specimen = archive.specimens.find((item) => item.id === specimenId);
    if (!specimen) return;
    const applied = applyMouthSpecimen(genome, specimen);
    onGenomeChange(applied.genome);
    commitArchive(upsertMouthGeneBundle(archive, applied.bundle));
    announce('Applied specimen: ' + specimen.name + '.');
  };

  const loadSpecies = (speciesId: string) => {
    const species = archive.species.find((item) => item.id === speciesId);
    if (!species) return;
    onGenomeChange(species);
    setTab('inspect');
    announce('Loaded archived species: ' + species.name + '.');
  };

  return (
    <div className="space-y-4">
      {notice && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-[#ff4fd8]/35 bg-[#1a0e19] px-3 py-2.5 text-xs font-mono text-[#ffb1ed]">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="text-[#ffb1ed]/60 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(TAB_META) as MouthTab[]).map((id) => {
          const active = tab === id;
          const meta = TAB_META[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={
                'rounded-xl border p-3 text-left transition-all ' +
                (active
                  ? 'border-[#ff4fd8] bg-[#241126] shadow-[0_0_20px_rgba(255,79,216,0.15)]'
                  : 'border-[#263044] bg-[#0a0e15] hover:border-[#ff4fd8]/50')
              }
            >
              <div className="text-[10px] font-mono font-black tracking-[0.16em] text-[#ff8fe6]">{meta.label}</div>
              <div className="mt-1 text-[10px] font-mono text-[#6f7d92]">{meta.subtitle}</div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <button
          type="button"
          onClick={quickFreak}
          className="group rounded-xl border border-[#39ff14]/50 bg-[#0e1a10] px-4 py-3 text-left hover:border-[#39ff14] hover:shadow-[0_0_22px_rgba(57,255,20,0.12)]"
        >
          <div className="flex items-center gap-2 text-sm font-mono font-black text-[#b8ff9f]">
            <Shuffle className="h-4 w-4" />
            QUICK FREAK
          </div>
          <div className="mt-1 text-[10px] font-mono text-[#7d8ba1]">
            Pick several structurally useful parents, choose an objective, breed immediately.
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSpecimenOpen(true)}
          className="rounded-xl border border-[#ffd84d]/50 bg-[#201b0d] px-4 py-3 font-mono font-black text-[#ffe995] hover:border-[#ffd84d]"
        >
          <span className="inline-flex items-center gap-2">
            <Microscope className="h-4 w-4" />
            WHAT THE FUCK WAS THAT?
          </span>
        </button>
      </div>

      {tab === 'breed' && (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-[#293246] bg-[#090d14] p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-mono font-black tracking-wide text-white">LANGUAGE PARENTS</div>
                  <div className="text-[10px] font-mono text-[#66758c]">{parentIds.length}/6 selected • minimum 2</div>
                </div>
                <button
                  type="button"
                  onClick={randomDistantParent}
                  disabled={parentIds.length >= 6}
                  className="rounded-lg border border-[#334155] bg-[#111827] px-2.5 py-1.5 text-[10px] font-mono font-bold text-[#cbd5e1] hover:border-[#00f0ff] disabled:opacity-40"
                >
                  + RANDOM DISTANT PARENT
                </button>
              </div>

              <label className="mb-3 flex items-center gap-2 rounded-lg border border-[#243044] bg-[#0e131d] px-3 py-2">
                <Search className="h-3.5 w-3.5 text-[#5f718b]" />
                <input
                  value={donorQuery}
                  onChange={(event) => setDonorQuery(event.target.value)}
                  placeholder="search donors / traits / families"
                  className="min-w-0 flex-1 bg-transparent text-xs font-mono text-white outline-none placeholder:text-[#506078]"
                />
              </label>

              <div className="grid max-h-[420px] gap-2 overflow-y-auto pr-1 md:grid-cols-2 [scrollbar-width:thin]">
                {visibleDonors.map((donor) => {
                  const selected = parentIds.includes(donor.id);
                  return (
                    <button
                      key={donor.id}
                      type="button"
                      onClick={() => toggleParent(donor.id)}
                      className={
                        'rounded-xl border p-3 text-left transition-all ' +
                        (selected
                          ? 'border-[#00f0ff] bg-[#0c2027]'
                          : 'border-[#263044] bg-[#0d1119] hover:border-[#00f0ff]/45')
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-mono font-black text-white">{donor.name}</div>
                        <span className={
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ' +
                          (selected ? 'border-[#00f0ff] bg-[#00f0ff] text-black' : 'border-[#3b465a] text-transparent')
                        }>
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <div className="mt-1 text-[10px] leading-relaxed text-[#7d8ba1]">{donor.whyUseful}</div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {donor.traitIds.slice(0, 4).map((traitId) => (
                          <span key={traitId} className="rounded bg-[#141b27] px-1.5 py-0.5 text-[9px] font-mono text-[#9aa9bf]">
                            {getMouthTrait(traitId)?.name || traitId}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-[#293246] bg-[#090d14] p-3">
                <div className="text-xs font-mono font-black text-white">BREEDING OBJECTIVE</div>
                <div className="mt-2 space-y-1.5">
                  {MOUTH_BREEDING_OBJECTIVES.map((objective) => (
                    <button
                      key={objective.id}
                      type="button"
                      onClick={() => setObjectiveId(objective.id)}
                      className={
                        'w-full rounded-lg border p-2.5 text-left ' +
                        (objectiveId === objective.id
                          ? 'border-[#a855f7] bg-[#1c1028]'
                          : 'border-[#263044] bg-[#0d1119] hover:border-[#a855f7]/50')
                      }
                    >
                      <div className="text-[10px] font-mono font-black text-[#d7a7ff]">{objective.name}</div>
                      <div className="mt-1 text-[9px] leading-relaxed text-[#718096]">{objective.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#293246] bg-[#090d14] p-3 space-y-3">
                <div className="text-xs font-mono font-black text-white">GLOBAL MOUTH CONTROLS</div>
                {[
                  ['INTELLIGIBILITY', intelligibility, setIntelligibility],
                  ['STABILITY', stability, setStability],
                  ['MUTATION', mutation, setMutation],
                ].map(([label, value, setter]) => (
                  <label key={String(label)} className="block">
                    <div className="mb-1 flex justify-between text-[10px] font-mono text-[#8493aa]">
                      <span>{String(label)}</span>
                      <span className="font-black text-white">{String(value)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Number(value)}
                      onChange={(event) => (setter as React.Dispatch<React.SetStateAction<number>>)(Number(event.target.value))}
                      className="w-full accent-[#ff4fd8]"
                    />
                  </label>
                ))}

                <label className="block">
                  <div className="mb-1 text-[10px] font-mono text-[#8493aa]">BREEDING SEED</div>
                  <div className="flex gap-2">
                    <input
                      value={breedingSeed}
                      onChange={(event) => setBreedingSeed(event.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-[#283348] bg-[#0d121b] px-2.5 py-2 text-xs font-mono text-white outline-none focus:border-[#ff4fd8]"
                    />
                    <button
                      type="button"
                      onClick={() => setBreedingSeed(randomSeed('breed'))}
                      className="rounded-lg border border-[#334155] px-2.5 text-[#94a3b8] hover:border-[#ff4fd8] hover:text-white"
                    >
                      <Shuffle className="h-4 w-4" />
                    </button>
                  </div>
                </label>

                <button
                  type="button"
                  onClick={() => breed()}
                  disabled={parentIds.length < 2}
                  className="w-full rounded-xl border border-[#ff4fd8] bg-[#ff4fd8] px-4 py-3 text-sm font-mono font-black text-black hover:bg-[#ff79df] disabled:opacity-40"
                >
                  BREED THE BASTARDS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'quirks' && (
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-[#293246] bg-[#090d14] p-3">
            <div className="mb-2 flex items-center gap-2">
              <Biohazard className="h-4 w-4 text-[#ff3f68]" />
              <div className="text-xs font-mono font-black text-white">QUIRK LIBRARY</div>
            </div>
            <label className="mb-3 flex items-center gap-2 rounded-lg border border-[#243044] bg-[#0e131d] px-3 py-2">
              <Search className="h-3.5 w-3.5 text-[#5f718b]" />
              <input
                value={quirkQuery}
                onChange={(event) => setQuirkQuery(event.target.value)}
                placeholder="trill, glottal, click, breath, mutation..."
                className="min-w-0 flex-1 bg-transparent text-xs font-mono text-white outline-none placeholder:text-[#506078]"
              />
            </label>
            <div className="max-h-[540px] space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
              {visibleQuirks.map((quirk) => {
                const active = genome?.quirks.some((item) => item.quirkId === quirk.id);
                return (
                  <div key={quirk.id} className="rounded-xl border border-[#263044] bg-[#0d1119] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[11px] font-mono font-black text-[#ff9daf]">{quirk.name}</div>
                        <div className="mt-1 text-[10px] leading-relaxed text-[#76859c]">{quirk.shortExplanation}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => active ? removeQuirk(quirk.id) : addQuirk(quirk.id)}
                        className={
                          'shrink-0 rounded-lg border px-2 py-1 text-[9px] font-mono font-black ' +
                          (active
                            ? 'border-[#ff3f68] bg-[#2a1018] text-[#ff9daf]'
                            : 'border-[#39ff14]/40 bg-[#0e1a10] text-[#b8ff9f]')
                        }
                      >
                        {active ? 'REMOVE' : '+ INFECT'}
                      </button>
                    </div>
                    <div className="mt-2 text-[9px] font-mono text-[#56657a]">
                      target: {quirk.target} • default F{quirk.defaultFrequency}/C{quirk.defaultConsistency}/X{quirk.defaultExaggeration}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {!genome ? (
              <div className="rounded-2xl border border-dashed border-[#39445a] p-8 text-center text-xs font-mono text-[#718096]">
                Breed or load a mouth first. Then we can give it one incredibly stupid rule and make that rule everybody else’s problem.
              </div>
            ) : genome.quirks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#39445a] p-8 text-center text-xs font-mono text-[#718096]">
                No explicit quirks installed yet. The inherited language traits are still active.
              </div>
            ) : (
              genome.quirks.map((instance) => {
                const definition = getMouthQuirkDefinition(instance.quirkId);
                if (!definition) return null;
                return (
                  <div key={instance.id} className="rounded-2xl border border-[#ff3f68]/35 bg-[#130d13] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-mono font-black text-white">{definition.name}</div>
                        <div className="mt-1 text-[10px] text-[#76859c]">{definition.transformation}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuirk(instance.quirkId)}
                        className="rounded-lg border border-[#51303a] p-1.5 text-[#ff9daf] hover:border-[#ff3f68]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      {[
                        ['FREQUENCY', instance.frequency, 'frequency'],
                        ['CONSISTENCY', instance.consistency, 'consistency'],
                        ['EXAGGERATION', instance.exaggeration, 'exaggeration'],
                      ].map(([label, value, key]) => (
                        <label key={String(label)} className="block">
                          <div className="mb-1 flex justify-between text-[9px] font-mono text-[#8493aa]">
                            <span>{String(label)}</span>
                            <span className="text-white">{String(value)}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={Number(value)}
                            onChange={(event) =>
                              updateQuirk(instance, { [String(key)]: clamp(Number(event.target.value)) } as any)
                            }
                            className="w-full accent-[#ff3f68]"
                          />
                        </label>
                      ))}
                    </div>

                    <div className="mt-3">
                      <div className="mb-1 text-[9px] font-mono text-[#8493aa]">TAKEOVER</div>
                      <select
                        value={instance.takeover.mode}
                        onChange={(event) =>
                          updateQuirk(instance, {
                            takeover: {
                              ...instance.takeover,
                              mode: event.target.value as MouthQuirkInstance['takeover']['mode'],
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[#303b50] bg-[#0d121b] px-2.5 py-2 text-xs font-mono text-white outline-none"
                      >
                        {['constant', 'instant', 'gradual', 'stepwise', 'eventTriggered', 'oscillating', 'oneWay'].map((mode) => (
                          <option key={mode} value={mode}>{mode}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {tab === 'inspect' && (
        <div className="space-y-4">
          {!genome ? (
            <div className="rounded-2xl border border-dashed border-[#39445a] p-8 text-center">
              <Dna className="mx-auto h-8 w-8 text-[#4d5c73]" />
              <div className="mt-2 text-sm font-mono font-black text-[#94a3b8]">NO ACTIVE MOUTH</div>
              <div className="mt-1 text-xs font-mono text-[#657187]">Breed one, quick-freak one, or load a saved species.</div>
            </div>
          ) : (
            <>
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <div className="rounded-2xl border border-[#a855f7]/35 bg-[#120d1a] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-mono font-bold tracking-[0.16em] text-[#c88cff]">ACTIVE GENOME</div>
                      <div className="mt-1 text-lg font-mono font-black text-white">{genome.name}</div>
                      <div className="mt-1 text-[10px] font-mono text-[#7d8ba1]">
                        {genome.parentDonorIds.map((id) => getMouthDonor(id)?.name || id).join(' × ')}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={saveSpecies}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#39ff14]/45 bg-[#0e1a10] px-2.5 py-2 text-[10px] font-mono font-black text-[#b8ff9f]"
                      >
                        <Save className="h-3.5 w-3.5" />
                        SAVE SPECIES
                      </button>
                      <button
                        type="button"
                        onClick={clearGenome}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#51303a] bg-[#160d11] px-2.5 py-2 text-[10px] font-mono font-black text-[#ff9daf]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        CLEAR ACTIVE
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 text-xs leading-relaxed text-[#aab5c7]">{phenotype?.summary}</div>
                  {phenotype?.warnings?.length ? (
                    <div className="mt-2 space-y-1">
                      {phenotype.warnings.map((warning, index) => (
                        <div key={index} className="text-[10px] font-mono text-[#f7b267]">⚠ {warning}</div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-[#293246] bg-[#090d14] p-3">
                  <div className="text-[9px] font-mono font-bold text-[#657187]">SEMANTIC MODE</div>
                  <button
                    type="button"
                    onClick={() =>
                      onSemanticModeChange(
                        semanticMode === 'englishMeaningAlienMouth' ? 'inherit' : 'englishMeaningAlienMouth'
                      )
                    }
                    className={
                      'mt-2 w-full rounded-lg border px-3 py-2 text-[10px] font-mono font-black ' +
                      (semanticMode === 'englishMeaningAlienMouth'
                        ? 'border-[#00f0ff] bg-[#0c2027] text-[#9bf8ff]'
                        : 'border-[#334155] bg-[#111827] text-[#94a3b8]')
                    }
                  >
                    {semanticMode === 'englishMeaningAlienMouth' ? 'ENGLISH MEANING / ALIEN MOUTH: ON' : 'INHERIT SEMANTICS'}
                  </button>

                  <div className="mt-3 text-[9px] font-mono font-bold text-[#657187]">COMPILER VIEW</div>
                  <select
                    value={promptMode}
                    onChange={(event) => onPromptModeChange(event.target.value as MouthPromptMode)}
                    className="mt-2 w-full rounded-lg border border-[#303b50] bg-[#0d121b] px-2.5 py-2 text-[10px] font-mono text-white"
                  >
                    <option value="bracketed">BRACKETED</option>
                    <option value="compact">COMPACT</option>
                    <option value="descriptive">DESCRIPTIVE</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
                <div className="space-y-2">
                  <div className="rounded-xl border border-[#39ff14]/25 bg-[#0b1510] p-3">
                    <div className="text-[9px] font-mono font-bold tracking-[0.14em] text-[#91d87e]">MANUAL GENE EDITOR</div>
                    <div className="mt-2 flex gap-2">
                      <select
                        value={geneToAdd}
                        onChange={(event) => setGeneToAdd(event.target.value)}
                        className="min-w-0 flex-1 rounded-lg border border-[#2d3c34] bg-[#0d121b] px-2.5 py-2 text-[10px] font-mono text-white"
                      >
                        <option value="">ADD AN UNUSED PARENT GENE...</option>
                        {availableParentGenes.map((row) => (
                          <option key={row.traitId} value={row.traitId}>
                            {(getMouthTrait(row.traitId)?.name || row.traitId) + ' ← ' + (getMouthDonor(row.donorId)?.name || row.donorId)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={addParentGene}
                        disabled={!geneToAdd}
                        className="rounded-lg border border-[#39ff14]/50 bg-[#102016] px-3 py-2 text-[9px] font-mono font-black text-[#b8ff9f] disabled:opacity-35"
                      >
                        ADD GENE
                      </button>
                    </div>
                    <div className="mt-1.5 text-[9px] leading-relaxed text-[#61736a]">
                      Only genes actually carried by the selected parents are offered here. Manual additions are locked to their donor instead of becoming fake free-floating language traits.
                    </div>
                  </div>

                  {genome.assignments.map((assignment, index) => (
                    <div key={assignment.axis + ':' + index} className="rounded-xl border border-[#293246] bg-[#0c1119] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-[9px] font-mono font-bold tracking-[0.14em] text-[#7d8ba1]">{assignment.axis.toUpperCase()}</div>
                          <div className="mt-0.5 text-xs font-mono font-black text-white">
                            {assignment.traitIds.length
                              ? assignment.traitIds.map((id) => getMouthTrait(id)?.name || id).join(' + ')
                              : 'SEMANTIC ANCHOR'}
                          </div>
                          <div className="mt-1 text-[9px] font-mono text-[#607087]">
                            donor: {assignment.donorId ? getMouthDonor(assignment.donorId)?.name || assignment.donorId : 'anchor'}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          {PRESSURES.map((pressure) => (
                            <button
                              key={pressure}
                              type="button"
                              disabled={!assignment.traitIds.length}
                              onClick={() => setAssignmentPressure(index, pressure)}
                              className={
                                'rounded-md border px-1.5 py-1 text-[8px] font-mono font-black disabled:opacity-30 ' +
                                (assignment.pressure === pressure
                                  ? intensityClass(pressure)
                                  : 'border-[#2f394c] bg-[#0b1018] text-[#59687d]')
                              }
                            >
                              {pressure.toUpperCase()}
                            </button>
                          ))}
                          {assignment.traitIds.length === 1 && (
                            <button
                              type="button"
                              onClick={() => knockOutTrait(assignment.traitIds[0])}
                              className="ml-1 rounded-md border border-[#51303a] bg-[#160d11] p-1 text-[#ff9daf] hover:border-[#ff3f68]"
                              title="Knock this gene out and leave a mutation scar"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-[#293246] bg-[#090d14] p-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-black text-white">
                      <HeartPulse className="h-4 w-4 text-[#39ff14]" />
                      AUDIBLE PHENOTYPE
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {phenotype?.activeTraits.map((trait) => (
                        <div key={trait.traitId + trait.axis} className="flex items-center justify-between gap-3 text-[10px] font-mono">
                          <span className="text-[#b8c4d6]">{getMouthTrait(trait.traitId)?.name || trait.traitId}</span>
                          <span className="text-[#8a9bb2]">{trait.expectedAudibility} • {trait.salience}</span>
                        </div>
                      ))}
                      {phenotype?.activeQuirks.map((quirk) => (
                        <div key={quirk.instanceId} className="flex items-center justify-between gap-3 text-[10px] font-mono">
                          <span className="text-[#ff9daf]">{getMouthQuirkDefinition(quirk.quirkId)?.name || quirk.quirkId}</span>
                          <span className="text-[#8a9bb2]">{quirk.expectedAudibility}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#293246] bg-[#090d14] p-3">
                    <div className="text-xs font-mono font-black text-white">TRAIT COLLISIONS</div>
                    <div className="mt-2 space-y-2">
                      {phenotype?.interactions.length ? phenotype.interactions.map((interaction, index) => (
                        <div key={index} className="rounded-lg border border-[#2a3448] bg-[#0d121b] p-2">
                          <div className="text-[9px] font-mono font-black text-[#ffd84d]">{interaction.relationship.toUpperCase()}</div>
                          <div className="mt-1 text-[10px] text-[#9aa9bf]">
                            {getMouthTrait(interaction.traitAId)?.name} × {getMouthTrait(interaction.traitBId)?.name}
                          </div>
                          <div className="mt-1 text-[9px] leading-relaxed text-[#657187]">{interaction.resolutionLaw}</div>
                        </div>
                      )) : (
                        <div className="text-[10px] font-mono text-[#657187]">No high-value trait collisions in this phenotype yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#00f0ff]/30 bg-[#08151a] p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-mono font-black text-[#9bf8ff]">
                  <BrainCircuit className="h-4 w-4" />
                  COMPILED MOUTH PREVIEW
                </div>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-[#163643] bg-[#071016] p-3 text-[10px] leading-relaxed text-[#b7dfe5] [scrollbar-width:thin]">
                  {compiledPreview || 'Nothing compiled yet.'}
                </pre>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'specimens' && (
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-[#293246] bg-[#090d14] p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-mono font-black text-white">SPECIMENS</div>
                <div className="text-[10px] font-mono text-[#657187]">{archive.specimens.length} captured accidents</div>
              </div>
              <button
                type="button"
                onClick={() => setSpecimenOpen(true)}
                className="rounded-lg border border-[#ffd84d]/50 bg-[#201b0d] px-2.5 py-1.5 text-[9px] font-mono font-black text-[#ffe995]"
              >
                + CAPTURE
              </button>
            </div>
            <div className="space-y-2">
              {archive.specimens.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#344056] p-5 text-center text-[10px] font-mono text-[#657187]">
                  No specimens yet. When Suno does some bizarre little mouth thing you love, hit WHAT THE FUCK WAS THAT?
                </div>
              ) : archive.specimens.map((specimen) => (
                <div key={specimen.id} className="rounded-xl border border-[#344056] bg-[#0d121b] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-mono font-black text-[#ffe995]">{specimen.name}</div>
                      <div className="mt-1 text-[10px] leading-relaxed text-[#a1aec0]">{specimen.observedBehavior}</div>
                      {specimen.whyLiked && <div className="mt-1 text-[9px] italic text-[#6f7d92]">liked because: {specimen.whyLiked}</div>}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        commitArchive(removeMouthSpecimen(archive, specimen.id));
                        announce('Deleted specimen: ' + specimen.name + '.');
                      }}
                      className="text-[#66758c] hover:text-[#ff9daf]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {specimen.quirkIds.map((id) => (
                      <span key={id} className="rounded bg-[#25111d] px-1.5 py-0.5 text-[8px] font-mono text-[#ff9daf]">
                        {getMouthQuirkDefinition(id)?.name || id}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => applySpecimen(specimen.id)}
                    disabled={!genome}
                    className="mt-2 rounded-lg border border-[#39ff14]/40 bg-[#0e1a10] px-2 py-1.5 text-[9px] font-mono font-black text-[#b8ff9f] disabled:opacity-35"
                  >
                    APPLY TO ACTIVE MOUTH
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#293246] bg-[#090d14] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Library className="h-4 w-4 text-[#a855f7]" />
              <div>
                <div className="text-xs font-mono font-black text-white">SAVED SPECIES</div>
                <div className="text-[10px] font-mono text-[#657187]">{archive.species.length} genomes</div>
              </div>
            </div>
            <div className="space-y-2">
              {archive.species.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#344056] p-5 text-center text-[10px] font-mono text-[#657187]">
                  Save a mouth from DESIGN A MOUTH and it will live here.
                </div>
              ) : archive.species.map((species) => (
                <div key={species.id} className="rounded-xl border border-[#344056] bg-[#0d121b] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-mono font-black text-[#d7a7ff]">{species.name}</div>
                      <div className="mt-1 text-[9px] font-mono text-[#728096]">
                        {species.parentDonorIds.map((id) => getMouthDonor(id)?.name || id).join(' × ')}
                      </div>
                      <div className="mt-1 text-[9px] font-mono text-[#5f6e84]">
                        {species.assignments.flatMap((assignment) => assignment.traitIds).length} traits • {species.quirks.length} quirks
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        commitArchive(removeMouthSpecies(archive, species.id));
                        announce('Deleted species: ' + species.name + '.');
                      }}
                      className="text-[#66758c] hover:text-[#ff9daf]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadSpecies(species.id)}
                    className="mt-2 rounded-lg border border-[#a855f7]/50 bg-[#180d24] px-2 py-1.5 text-[9px] font-mono font-black text-[#d7a7ff]"
                  >
                    LOAD SPECIES
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {specimenOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-[#ffd84d]/55 bg-[#0b0f16] p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-mono font-black text-[#ffe995]">
                  <Microscope className="h-5 w-5" />
                  WHAT THE FUCK WAS THAT?
                </div>
                <div className="mt-1 text-[10px] font-mono text-[#718096]">
                  Describe the weird vocal accident in normal human language. The local matcher will connect it to known quirks when it can.
                </div>
              </div>
              <button type="button" onClick={() => setSpecimenOpen(false)} className="text-[#718096] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block">
                <div className="mb-1 text-[9px] font-mono font-bold text-[#77869d]">OPTIONAL NAME</div>
                <input
                  value={specimenName}
                  onChange={(event) => setSpecimenName(event.target.value)}
                  placeholder="RRRRR MANIAC #1"
                  className="w-full rounded-lg border border-[#303b50] bg-[#0d121b] px-3 py-2 text-xs font-mono text-white outline-none focus:border-[#ffd84d]"
                />
              </label>
              <label className="block">
                <div className="mb-1 text-[9px] font-mono font-bold text-[#77869d]">WHAT HAPPENED?</div>
                <textarea
                  value={specimenObservation}
                  onChange={(event) => setSpecimenObservation(event.target.value)}
                  rows={5}
                  placeholder="The dude rolled EVERY SINGLE RRRRRR with SUCH ENTHUSIASM every fucking time."
                  className="w-full resize-y rounded-lg border border-[#303b50] bg-[#0d121b] px-3 py-2 text-xs leading-relaxed text-white outline-none focus:border-[#ffd84d]"
                />
              </label>
              <label className="block">
                <div className="mb-1 text-[9px] font-mono font-bold text-[#77869d]">WHY DID YOU LIKE IT?</div>
                <textarea
                  value={specimenWhy}
                  onChange={(event) => setSpecimenWhy(event.target.value)}
                  rows={3}
                  placeholder="It was so absurdly consistent that it sounded like a law of physics."
                  className="w-full resize-y rounded-lg border border-[#303b50] bg-[#0d121b] px-3 py-2 text-xs leading-relaxed text-white outline-none focus:border-[#ffd84d]"
                />
              </label>

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => captureSpecimen(false)}
                  className="rounded-lg border border-[#ffd84d]/45 bg-[#201b0d] px-3 py-2 text-[10px] font-mono font-black text-[#ffe995]"
                >
                  SAVE SPECIMEN
                </button>
                <button
                  type="button"
                  onClick={() => captureSpecimen(true)}
                  disabled={!genome}
                  className="rounded-lg border border-[#39ff14] bg-[#39ff14] px-3 py-2 text-[10px] font-mono font-black text-black disabled:opacity-35"
                >
                  SAVE + INFECT CURRENT MOUTH
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
