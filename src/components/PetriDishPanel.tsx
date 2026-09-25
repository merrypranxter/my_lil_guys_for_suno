import React, { useMemo, useRef, useState } from 'react';
import {
  Beaker,
  Check,
  Clipboard,
  Copy,
  Dna,
  FlaskConical,
  GitBranch,
  Layers3,
  LoaderCircle,
  Play,
  Save,
  Sparkles,
  Star,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import {
  MusicBredGenome,
  MusicControls,
  MusicStackItem,
  PetriDishExperiment,
  PetriDishResult,
  PetriDishSibling,
  RealityChaosLevel,
} from '../types';
import { MUSIC_SEED_RECIPES, normalizeMusicControls } from '../data/musicSeedSystem';
import { chooseDiverseFingerprint } from '../data/musicTaxonomy';
import {
  breedMusicGenome,
  genomeToStackItem,
  parentFromGenome,
  parentFromRecipe,
} from '../lib/musicBreeding';
import {
  baseMechanismEnvironment,
  blendSiblingControls,
  buildSiblingMusicStack,
  clearDishResults,
  createPetriDishExperiment,
  snapshotToBreedingParent,
  toggleDishSiblingSelected,
  updateDishSiblingResult,
} from '../lib/petriDish';
import { generateProceduralTrack } from '../lib/proceduralGenerator';
import {
  deletePetriDish,
  getBredMusicGenomes,
  getCompositionFavoriteSignals,
  getLikedPreferenceSignals,
  getMusicPreferenceSignals,
  getPetriDishes,
  getRecentFingerprints,
  saveBredMusicGenome,
  savePetriDish,
} from '../lib/localStorage';

interface PetriDishPanelProps {
  guyIds: string[];
  realityEngineIds: string[];
  compositionEngineIds: string[];
  realityChaos: RealityChaosLevel;
  seed: string;
  energy: number;
  musicStack: MusicStackItem[];
  musicControls: MusicControls;
  onOpenSibling: (experiment: PetriDishExperiment, sibling: PetriDishSibling) => void;
  onStackSibling: (genome: MusicBredGenome) => void;
}

function randomSeed(prefix = 'dish') {
  return prefix + '-' + Math.random().toString(36).slice(2, 9);
}

function resultFromProcedural(
  output: ReturnType<typeof generateProceduralTrack>
): PetriDishResult {
  return {
    mode: 'local',
    style: output.style,
    lyrics: output.lyrics,
    caption: output.caption,
    fingerprint: output.fingerprint,
    model: 'procedural-synthesizer',
    charCounts: {
      style: output.style.length,
      lyrics: output.lyrics.length,
      caption: output.caption.length,
    },
    createdAt: Date.now(),
  };
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
}

function geneticSummary(sibling: PetriDishSibling): string {
  const genome = sibling.genome;
  const mutation = genome.lineage.mutationMechanismId
    ? ' • mutation ' + genome.lineage.mutationMechanismId
    : '';
  return (
    'G' +
    genome.generation +
    ' • ' +
    genome.mechanismIds.length +
    ' genes' +
    mutation
  );
}

export function PetriDishPanel({
  guyIds,
  realityEngineIds,
  compositionEngineIds,
  realityChaos,
  seed,
  energy,
  musicStack,
  musicControls,
  onOpenSibling,
  onStackSibling,
}: PetriDishPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [dishes, setDishes] = useState<PetriDishExperiment[]>(() => getPetriDishes());
  const [activeDishId, setActiveDishId] = useState<string>(() => getPetriDishes()[0]?.id || '');
  const [parentAId, setParentAId] = useState('');
  const [parentBId, setParentBId] = useState('');
  const [familySeed, setFamilySeed] = useState('');
  const [dishName, setDishName] = useState('');
  const [siblingCount, setSiblingCount] = useState(4);
  const [busyMode, setBusyMode] = useState<'local' | 'ai' | null>(null);
  const [progress, setProgress] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [survivorChild, setSurvivorChild] = useState<MusicBredGenome | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activeDish = useMemo(
    () => dishes.find((dish) => dish.id === activeDishId) || null,
    [dishes, activeDishId]
  );

  const bredLibrary = getBredMusicGenomes();
  const parentOptions = [
    ...MUSIC_SEED_RECIPES.map((recipe) => ({
      key: 'recipe:' + recipe.id,
      label: recipe.name + ' • G0',
      parent: parentFromRecipe(recipe),
    })),
    ...bredLibrary.map((genome) => ({
      key: 'genome:' + genome.id,
      label: genome.name + ' • G' + genome.generation,
      parent: parentFromGenome(genome),
    })),
  ];

  const resolveParent = (key: string) =>
    parentOptions.find((item) => item.key === key)?.parent;

  const commitDish = (next: PetriDishExperiment) => {
    const updated = savePetriDish(next);
    setDishes(updated);
    setActiveDishId(next.id);
  };

  const createDish = () => {
    setMessage(null);
    const parentA = resolveParent(parentAId);
    const parentB = resolveParent(parentBId);
    if (!parentA || !parentB) {
      setMessage('Pick two parents first.');
      return;
    }
    if (parentAId === parentBId) {
      setMessage('One parent cannot impregnate itself in this particular laboratory.');
      return;
    }
    if (!guyIds.length) {
      setMessage('The frozen challenge needs at least one Little Guy.');
      return;
    }

    const challengeLikedSignals = [
      ...getCompositionFavoriteSignals(4),
      ...getMusicPreferenceSignals(4),
      ...getLikedPreferenceSignals(5),
    ].slice(0, 10);
    const frozenRecentFingerprints = getRecentFingerprints(12);
    const frozenFingerprint = chooseDiverseFingerprint(frozenRecentFingerprints);

    const experiment = createPetriDishExperiment({
      name: dishName,
      familySeed: familySeed || randomSeed('family'),
      parentA,
      parentB,
      siblingCount,
      challenge: {
        guyIds: [...guyIds],
        realityEngineIds: [...realityEngineIds],
        compositionEngineIds: [...compositionEngineIds],
        realityChaos,
        seed,
        energy,
        baseMusicStack: baseMechanismEnvironment(musicStack),
        baseMusicControls: normalizeMusicControls(musicControls),
        recentFingerprints: frozenRecentFingerprints,
        forcedFingerprint: frozenFingerprint,
        likedSignals: challengeLikedSignals,
      },
    });

    commitDish(experiment);
    setSurvivorChild(null);
    setMessage(
      'Dish frozen. Recipe/genome macros were excluded from the environment so sibling genetics remain the main variable.'
    );
  };

  const chooseFirstTwoActiveMacros = () => {
    const macros = musicStack
      .filter((item) => !item.muted && (item.kind === 'recipe' || item.kind === 'genome'))
      .slice(0, 2);
    if (macros.length < 2) {
      setMessage('Need two active recipe/genome macros in the main stack.');
      return;
    }
    setParentAId(macros[0].kind + ':' + macros[0].refId);
    setParentBId(macros[1].kind + ':' + macros[1].refId);
    setExpanded(true);
    setMessage('Loaded the first two active macros as parents.');
  };

  const updateSelected = (siblingId: string) => {
    if (!activeDish) return;
    commitDish(toggleDishSiblingSelected(activeDish, siblingId));
  };

  const clearResults = () => {
    if (!activeDish || busyMode) return;
    commitDish(clearDishResults(activeDish));
    setSurvivorChild(null);
    setMessage('Dish results cleared. Genetics and frozen challenge preserved.');
  };

  const runLocalPreview = async () => {
    if (!activeDish || busyMode) return;
    setBusyMode('local');
    setMessage(null);
    let next = activeDish;

    try {
      for (let index = 0; index < activeDish.siblings.length; index += 1) {
        const sibling = activeDish.siblings[index];
        setProgress('Locally synthesizing sibling ' + (index + 1) + ' / ' + activeDish.siblings.length + '…');
        await new Promise((resolve) => setTimeout(resolve, 15));
        const siblingStack = buildSiblingMusicStack(activeDish.challenge.baseMusicStack, sibling.genome);
        const siblingControls = blendSiblingControls(
          activeDish.challenge.baseMusicControls,
          sibling.genome.controls
        );
        const output = generateProceduralTrack({
          guyIds: activeDish.challenge.guyIds,
          realityEngineIds: activeDish.challenge.realityEngineIds,
          compositionEngineIds: activeDish.challenge.compositionEngineIds,
          musicStack: siblingStack,
          musicControls: siblingControls,
          realityChaos: activeDish.challenge.realityChaos,
          seed: activeDish.challenge.seed,
          energy: activeDish.challenge.energy,
          recentFingerprints: activeDish.challenge.recentFingerprints,
          forcedFingerprint: activeDish.challenge.forcedFingerprint,
        });
        next = updateDishSiblingResult(next, sibling.id, resultFromProcedural(output));
        commitDish(next);
      }
      setMessage('Free local dish complete. Same frozen challenge, different sibling genomes.');
    } catch (error: any) {
      setMessage('Local dish failed: ' + (error?.message || String(error)));
    } finally {
      setBusyMode(null);
      setProgress('');
    }
  };

  const runAiComparison = async () => {
    if (!activeDish || busyMode) return;
    setBusyMode('ai');
    setMessage(null);
    const controller = new AbortController();
    abortRef.current = controller;
    let next = activeDish;

    try {
      for (let index = 0; index < activeDish.siblings.length; index += 1) {
        if (controller.signal.aborted) break;
        const sibling = activeDish.siblings[index];
        setProgress(
          'AI sibling ' +
            (index + 1) +
            ' / ' +
            activeDish.siblings.length +
            ' — one generation call per organism…'
        );

        const siblingStack = buildSiblingMusicStack(
          activeDish.challenge.baseMusicStack,
          sibling.genome
        );
        const siblingControls = blendSiblingControls(
          activeDish.challenge.baseMusicControls,
          sibling.genome.controls
        );

        const timeout = setTimeout(() => controller.abort(), 70000);
        let result: PetriDishResult;
        try {
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              guyIds: activeDish.challenge.guyIds,
              realityEngineIds: activeDish.challenge.realityEngineIds,
              compositionEngineIds: activeDish.challenge.compositionEngineIds,
              musicStack: siblingStack,
              musicControls: siblingControls,
              realityChaos: activeDish.challenge.realityChaos,
              seed: activeDish.challenge.seed,
              energy: activeDish.challenge.energy,
              recentFingerprints: activeDish.challenge.recentFingerprints,
              forcedFingerprint: activeDish.challenge.forcedFingerprint,
              likedSignals: activeDish.challenge.likedSignals,
            }),
          });
          const raw = await response.text();
          const data = JSON.parse(raw || '{}');
          if (!response.ok) throw new Error(data?.error || 'HTTP ' + response.status);
          const style = String(data.style || '');
          const lyrics = String(data.lyrics || '');
          const caption = String(data.caption || '');
          result = {
            mode: 'ai',
            style,
            lyrics,
            caption,
            fingerprint: data.fingerprint,
            model: String(data.model || 'unknown'),
            charCounts: data.charCounts || {
              style: style.length,
              lyrics: lyrics.length,
              caption: caption.length,
            },
            notice: data.notice,
            createdAt: Date.now(),
          };
        } catch (error: any) {
          if (controller.signal.aborted) throw error;
          result = {
            mode: 'ai',
            style: '',
            lyrics: '',
            caption: '',
            model: 'failed',
            charCounts: { style: 0, lyrics: 0, caption: 0 },
            error: error?.message || String(error),
            createdAt: Date.now(),
          };
        } finally {
          clearTimeout(timeout);
        }

        next = updateDishSiblingResult(next, sibling.id, result);
        commitDish(next);
      }

      if (!controller.signal.aborted) {
        setMessage('AI dish complete. No winner was chosen for you; pick the freaks yourself.');
      }
    } catch (error: any) {
      if (controller.signal.aborted) {
        setMessage('AI dish stopped. Completed sibling results were preserved.');
      } else {
        setMessage('AI dish interrupted: ' + (error?.message || String(error)));
      }
    } finally {
      abortRef.current = null;
      setBusyMode(null);
      setProgress('');
    }
  };

  const stopRun = () => {
    abortRef.current?.abort();
  };

  const openSibling = (sibling: PetriDishSibling) => {
    if (!activeDish) return;
    saveBredMusicGenome(sibling.genome);
    onOpenSibling(activeDish, sibling);
    setMessage('Opened ' + sibling.genome.name + ' in the main lab with its frozen challenge restored.');
  };

  const stackSibling = (sibling: PetriDishSibling) => {
    saveBredMusicGenome(sibling.genome);
    onStackSibling(sibling.genome);
    setMessage('Stacked ' + sibling.genome.name + ' into the current main experiment.');
  };

  const breedSelectedSurvivors = () => {
    if (!activeDish) return;
    const selected = activeDish.siblings.filter((sibling) => sibling.selected);
    if (selected.length !== 2) {
      setMessage('Select exactly two survivors to breed them.');
      return;
    }

    try {
      const survivorSeed =
        activeDish.familySeed +
        ':survivor:' +
        [selected[0].genome.id, selected[1].genome.id].sort().join(':');
      const child = breedMusicGenome(
        parentFromGenome(selected[0].genome),
        parentFromGenome(selected[1].genome),
        survivorSeed
      );
      saveBredMusicGenome(child);
      setSurvivorChild(child);
      setMessage(
        'Survivors bred. New G' +
          child.generation +
          ' genome saved to the breeding library. Nothing was auto-selected.'
      );
    } catch (error: any) {
      setMessage('Survivor breeding failed: ' + (error?.message || String(error)));
    }
  };

  const stackSurvivorChild = () => {
    if (!survivorChild) return;
    onStackSibling(survivorChild);
    setMessage('Stacked new descendant ' + survivorChild.name + '.');
  };

  const removeDish = (id: string) => {
    const remaining = deletePetriDish(id);
    setDishes(remaining);
    if (activeDishId === id) {
      setActiveDishId(remaining[0]?.id || '');
      setSurvivorChild(null);
    }
  };

  const selectedCount = activeDish?.siblings.filter((sibling) => sibling.selected).length || 0;

  return (
    <section className="rounded-2xl border border-[#315a4a] bg-[#0b1110] shadow-[0_0_30px_rgba(57,255,20,0.05)] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="w-full p-4 md:p-5 flex items-start justify-between gap-4 text-left"
      >
        <div>
          <div className="flex items-center gap-2">
            <Beaker className="w-4 h-4 text-[#86efac]" />
            <h2 className="font-mono font-black tracking-wider text-white">PETRI DISH — SIBLING EXPERIMENT BENCH</h2>
          </div>
          <p className="mt-1 text-[11px] font-mono text-[#86a696]">
            Breed siblings, freeze one challenge around all of them, compare without a hidden winner, then OPEN / STACK / BREED the freaks you choose.
          </p>
        </div>
        <span className="text-[10px] font-mono text-[#86efac]">
          {dishes.length} DISH{dishes.length === 1 ? '' : 'ES'}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[#243f34] p-4 md:p-5 space-y-5">
          <div className="rounded-xl border border-[#274436] bg-[#08100d] p-3 md:p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono font-black tracking-[0.18em] text-[#86efac]">NEW DISH</div>
                <p className="mt-1 text-[10px] font-mono text-[#71887c]">
                  Current Minds, Reality, Composition Lab, energy, seed, preference context, and manual mechanism chips become the frozen environment. Current recipe/genome macros are excluded so the siblings are the main changing variable.
                </p>
              </div>
              <button
                type="button"
                onClick={chooseFirstTwoActiveMacros}
                className="shrink-0 rounded-lg border border-[#375646] bg-[#0f1a15] px-2.5 py-1.5 text-[10px] font-mono text-[#a7c7b4] hover:text-white"
              >
                USE FIRST TWO ACTIVE MACROS
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label>
                <span className="text-[9px] font-mono font-black text-[#ff9dea]">PARENT A</span>
                <select
                  value={parentAId}
                  onChange={(event) => setParentAId(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#2f4439] bg-[#070b09] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff4fd8]"
                >
                  <option value="">pick parent A…</option>
                  {parentOptions.map((item) => (
                    <option key={'dish-a-' + item.key} value={item.key}>{item.label}</option>
                  ))}
                </select>
              </label>

              <label>
                <span className="text-[9px] font-mono font-black text-[#7eeeff]">PARENT B</span>
                <select
                  value={parentBId}
                  onChange={(event) => setParentBId(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#2f4439] bg-[#070b09] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00f0ff]"
                >
                  <option value="">pick parent B…</option>
                  {parentOptions.map((item) => (
                    <option key={'dish-b-' + item.key} value={item.key}>{item.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-2 items-end">
              <label>
                <span className="text-[9px] font-mono font-black text-[#ffe680]">FAMILY SEED</span>
                <input
                  value={familySeed}
                  onChange={(event) => setFamilySeed(event.target.value)}
                  placeholder="same family seed reproduces sibling genetics"
                  className="mt-1 w-full rounded-lg border border-[#2f4439] bg-[#070b09] px-3 py-2 text-xs font-mono text-white placeholder-[#55625a] focus:outline-none focus:border-[#ffe680]"
                />
              </label>
              <label>
                <span className="text-[9px] font-mono font-black text-[#c7a7ff]">SIBLINGS</span>
                <select
                  value={siblingCount}
                  onChange={(event) => setSiblingCount(Number(event.target.value))}
                  className="mt-1 w-full rounded-lg border border-[#2f4439] bg-[#070b09] px-3 py-2 text-xs font-mono text-white"
                >
                  {[2, 3, 4, 5, 6].map((count) => (
                    <option key={count} value={count}>{count}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => setFamilySeed(randomSeed('family'))}
                className="rounded-lg border border-[#4f4b2d] bg-[#1d1a0e] px-3 py-2 text-[10px] font-mono text-[#ffe680] hover:border-[#ffe680]"
              >
                ROLL FAMILY SEED
              </button>
            </div>

            <label className="block">
              <span className="text-[9px] font-mono font-black text-[#86efac]">OPTIONAL DISH NAME</span>
              <input
                value={dishName}
                onChange={(event) => setDishName(event.target.value)}
                placeholder="e.g. MOTOR COUSINS / STEM GREMLIN TRIAL"
                className="mt-1 w-full rounded-lg border border-[#2f4439] bg-[#070b09] px-3 py-2 text-xs font-mono text-white placeholder-[#55625a] focus:outline-none focus:border-[#39ff14]"
              />
            </label>

            <button
              type="button"
              onClick={createDish}
              className="w-full rounded-xl border border-[#39ff14]/60 bg-[#102417] px-4 py-3 text-xs font-mono font-black text-[#b8ffb0] hover:border-[#39ff14]"
            >
              🧫 FREEZE CHALLENGE + BREED SIBLINGS
            </button>
          </div>

          {dishes.length > 0 && (
            <div className="rounded-xl border border-[#283a32] bg-[#090d0b] p-3">
              <div className="mb-2 text-[9px] font-mono font-black tracking-[0.16em] text-[#779486]">SAVED DISHES</div>
              <div className="flex flex-wrap gap-2">
                {dishes.map((dish) => (
                  <div
                    key={dish.id}
                    className={
                      'inline-flex items-center rounded-lg border ' +
                      (dish.id === activeDishId
                        ? 'border-[#39ff14]/60 bg-[#112019]'
                        : 'border-[#283a32] bg-[#0c1210]')
                    }
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDishId(dish.id);
                        setSurvivorChild(null);
                      }}
                      className="px-3 py-2 text-[10px] font-mono text-[#b4c7bb] hover:text-white"
                    >
                      {dish.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDish(dish.id)}
                      className="p-2 text-[#697c70] hover:text-[#f87171]"
                      title="Delete dish"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeDish && (
            <>
              <div className="rounded-xl border border-[#315a4a] bg-[#0b1511] p-3 md:p-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-[#86efac]" />
                      <span className="font-mono font-black text-sm text-white">{activeDish.name}</span>
                      <span className="rounded bg-[#173323] px-2 py-0.5 text-[9px] font-mono font-black text-[#86efac]">
                        FROZEN
                      </span>
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-[#92a79a]">
                      {activeDish.parentA.ref.name} × {activeDish.parentB.ref.name} • family seed {activeDish.familySeed}
                    </div>
                    <div className="mt-1 text-[10px] font-mono text-[#687b70]">
                      Challenge: {activeDish.challenge.guyIds.length} Minds • {activeDish.challenge.realityEngineIds.length} Reality • {activeDish.challenge.compositionEngineIds.length} Composition • {activeDish.challenge.baseMusicStack.length} manual music mechanisms • energy {activeDish.challenge.energy} • seed “{activeDish.challenge.seed || '(blank)'}”
                    </div>
                    <div className="mt-1 text-[10px] font-mono text-[#7d9185]">
                      Frozen musical fingerprint: {activeDish.challenge.forcedFingerprint.genreFamily} • {activeDish.challenge.forcedFingerprint.rhythm} • {activeDish.challenge.forcedFingerprint.vocal}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={runLocalPreview}
                      disabled={Boolean(busyMode)}
                      className="rounded-lg border border-[#39ff14]/45 bg-[#102417] px-3 py-2 text-[10px] font-mono font-black text-[#a7ff9f] disabled:opacity-40"
                      title="Runs entirely in the browser using the procedural synthesizer. Zero model calls."
                    >
                      <Zap className="inline-block w-3.5 h-3.5 mr-1" />
                      FREE LOCAL PREVIEW
                    </button>
                    <button
                      type="button"
                      onClick={runAiComparison}
                      disabled={Boolean(busyMode)}
                      className="rounded-lg border border-[#00f0ff]/45 bg-[#0b2027] px-3 py-2 text-[10px] font-mono font-black text-[#7eeeff] disabled:opacity-40"
                      title={'Uses ' + activeDish.siblings.length + ' generation calls, sequentially.'}
                    >
                      <Sparkles className="inline-block w-3.5 h-3.5 mr-1" />
                      RUN AI COMPARISON ({activeDish.siblings.length} CALLS)
                    </button>
                    <button
                      type="button"
                      onClick={clearResults}
                      disabled={Boolean(busyMode)}
                      className="rounded-lg border border-[#4a5050] bg-[#111716] px-3 py-2 text-[10px] font-mono text-[#9eaaa4] disabled:opacity-40"
                    >
                      CLEAR RESULTS
                    </button>
                  </div>
                </div>

                {busyMode && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-[#315a4a] bg-[#09100d] px-3 py-2">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#b4c7bb]">
                      <LoaderCircle className="w-3.5 h-3.5 animate-spin text-[#86efac]" />
                      {progress}
                    </div>
                    {busyMode === 'ai' && (
                      <button
                        type="button"
                        onClick={stopRun}
                        className="text-[10px] font-mono font-black text-[#fca5a5] hover:text-white"
                      >
                        STOP AFTER THIS MESS
                      </button>
                    )}
                  </div>
                )}

                {message && (
                  <div className="mt-3 rounded-lg border border-[#33463c] bg-[#0c1310] px-3 py-2 text-[10px] font-mono text-[#a4b8ab]">
                    {message}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {activeDish.siblings.map((sibling, index) => {
                  const result = sibling.result;
                  return (
                    <article
                      key={sibling.id}
                      className={
                        'rounded-2xl border p-4 ' +
                        (sibling.selected
                          ? 'border-[#ffd84d] bg-[#17170d] shadow-[0_0_18px_rgba(255,216,77,0.08)]'
                          : 'border-[#2c4036] bg-[#0a100d]')
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded bg-[#a879ff] px-1.5 py-0.5 text-[9px] font-mono font-black text-black">
                              SIBLING {index + 1}
                            </span>
                            <span className="font-mono font-black text-sm text-white truncate">
                              {sibling.genome.name}
                            </span>
                          </div>
                          <div className="mt-1 text-[9px] font-mono text-[#a99abd]">
                            {geneticSummary(sibling)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateSelected(sibling.id)}
                          className={
                            'rounded-lg border px-2.5 py-1.5 text-[10px] font-mono font-black ' +
                            (sibling.selected
                              ? 'border-[#ffd84d] bg-[#332b0d] text-[#ffe680]'
                              : 'border-[#39463e] bg-[#111814] text-[#85968c] hover:text-white')
                          }
                        >
                          {sibling.selected ? <><Check className="inline w-3 h-3 mr-1" />KEEP</> : 'SELECT'}
                        </button>
                      </div>

                      <div className="mt-3 rounded-lg border border-[#2b2735] bg-[#0d0b11] p-2.5">
                        <div className="text-[9px] font-mono font-black text-[#c7a7ff]">INVARIANT</div>
                        <div className="mt-1 text-[10px] leading-relaxed text-[#9d95a7]">
                          {sibling.genome.lineage.invariant}
                        </div>
                        <div className="mt-2 text-[9px] font-mono font-black text-[#7eeeff]">CROSSOVER LAW</div>
                        <div className="mt-1 text-[10px] leading-relaxed text-[#8199a3]">
                          {sibling.genome.lineage.relationshipLaw}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {sibling.genome.mechanismIds.map((id) => (
                          <span key={id} className="rounded-full border border-[#353344] bg-[#11101a] px-2 py-1 text-[9px] font-mono text-[#b8acd0]">
                            {id}
                          </span>
                        ))}
                      </div>

                      {result ? (
                        <div className="mt-4 space-y-3">
                          {result.error ? (
                            <div className="rounded-lg border border-[#7f1d1d] bg-[#2b1216] px-3 py-2 text-[10px] font-mono text-[#fca5a5]">
                              {result.error}
                            </div>
                          ) : (
                            <>
                              <div className="flex flex-wrap items-center gap-2 text-[9px] font-mono">
                                <span className={result.mode === 'local' ? 'text-[#86efac]' : 'text-[#7eeeff]'}>
                                  {result.mode === 'local' ? 'LOCAL PREVIEW' : 'AI RUN'}
                                </span>
                                <span className="text-[#65746c]">{result.model}</span>
                              </div>

                              {result.fingerprint && (
                                <div className="flex flex-wrap gap-1.5">
                                  {[
                                    result.fingerprint.genreFamily,
                                    result.fingerprint.rhythm,
                                    result.fingerprint.vocal,
                                    result.fingerprint.production,
                                  ].filter(Boolean).map((item) => (
                                    <span key={item} className="rounded border border-[#293b33] bg-[#0e1713] px-2 py-1 text-[9px] font-mono text-[#9fcab0]">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="rounded-lg border border-[#27382f] bg-[#07100b] p-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[9px] font-mono font-black text-[#ff9dea]">STYLE</span>
                                  <button type="button" onClick={() => copyText(result.style)} className="text-[#738278] hover:text-white" title="Copy style"><Copy className="w-3 h-3" /></button>
                                </div>
                                <div className="mt-1 max-h-28 overflow-y-auto whitespace-pre-wrap text-[10px] leading-relaxed text-[#a7b3ac]">
                                  {result.style}
                                </div>
                              </div>

                              <div className="rounded-lg border border-[#27382f] bg-[#07100b] p-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[9px] font-mono font-black text-[#7eeeff]">CAPTION</span>
                                  <button type="button" onClick={() => copyText(result.caption)} className="text-[#738278] hover:text-white" title="Copy caption"><Copy className="w-3 h-3" /></button>
                                </div>
                                <div className="mt-1 whitespace-pre-wrap text-[10px] leading-relaxed text-[#a7b3ac]">
                                  {result.caption}
                                </div>
                              </div>

                              <details className="rounded-lg border border-[#27382f] bg-[#07100b] p-2.5">
                                <summary className="cursor-pointer text-[9px] font-mono font-black text-[#ffe680]">
                                  LYRICS / CONTROL ({result.charCounts.lyrics})
                                </summary>
                                <div className="mt-2 flex justify-end">
                                  <button type="button" onClick={() => copyText(result.lyrics)} className="text-[#738278] hover:text-white" title="Copy lyrics"><Copy className="w-3 h-3" /></button>
                                </div>
                                <div className="mt-1 max-h-72 overflow-y-auto whitespace-pre-wrap text-[10px] leading-relaxed text-[#a7b3ac]">
                                  {result.lyrics}
                                </div>
                              </details>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-lg border border-dashed border-[#2c4036] p-4 text-center text-[10px] font-mono text-[#607269]">
                          Not exposed to the frozen challenge yet.
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => openSibling(sibling)}
                          className="rounded-lg border border-[#00f0ff]/35 bg-[#0b2027] px-3 py-2 text-[10px] font-mono font-black text-[#7eeeff] hover:border-[#00f0ff]"
                        >
                          <Play className="inline-block w-3 h-3 mr-1" />
                          OPEN IN MAIN LAB
                        </button>
                        <button
                          type="button"
                          onClick={() => stackSibling(sibling)}
                          className="rounded-lg border border-[#a879ff]/35 bg-[#1b1230] px-3 py-2 text-[10px] font-mono font-black text-[#c7a7ff] hover:border-[#a879ff]"
                        >
                          <Layers3 className="inline-block w-3 h-3 mr-1" />
                          STACK GENOME
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="rounded-xl border border-[#50451f] bg-[#17140a] p-3 md:p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[#ffe680]">
                      <Star className="w-4 h-4" />
                      <span className="text-xs font-mono font-black">SURVIVOR PEN</span>
                    </div>
                    <p className="mt-1 text-[10px] font-mono text-[#9b9272]">
                      {selectedCount} selected. There is no automated fitness score. Selection means exactly what you clicked and nothing more.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={breedSelectedSurvivors}
                    disabled={selectedCount !== 2}
                    className="rounded-lg border border-[#ffd84d] bg-[#2d2508] px-3 py-2 text-[10px] font-mono font-black text-[#ffe680] disabled:opacity-35"
                  >
                    <Dna className="inline-block w-3.5 h-3.5 mr-1" />
                    BREED EXACTLY TWO SURVIVORS
                  </button>
                </div>

                {survivorChild && (
                  <div className="mt-3 rounded-xl border border-[#5a3a76] bg-[#130e1b] p-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-4 h-4 text-[#c7a7ff]" />
                          <span className="font-mono font-black text-sm text-white">{survivorChild.name}</span>
                          <span className="text-[9px] font-mono text-[#a879ff]">G{survivorChild.generation}</span>
                        </div>
                        <div className="mt-1 text-[10px] leading-relaxed text-[#9c91aa]">
                          {survivorChild.lineage.invariant}
                        </div>
                        <div className="mt-1 text-[10px] leading-relaxed text-[#79919b]">
                          {survivorChild.lineage.relationshipLaw}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={stackSurvivorChild}
                        className="shrink-0 rounded-lg border border-[#a879ff] bg-[#1b1230] px-3 py-2 text-[10px] font-mono font-black text-[#c7a7ff]"
                      >
                        + STACK NEW DESCENDANT
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
