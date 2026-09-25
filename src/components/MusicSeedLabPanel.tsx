import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Dices,
  Dna,
  FlaskConical,
  GitBranch,
  Lock,
  Minus,
  Plus,
  Shuffle,
  SlidersHorizontal,
  Trash2,
  Unlock,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { MusicBredGenome, MusicControls, MusicStackItem } from '../types';
import {
  DEFAULT_MUSIC_CONTROLS,
  MUSIC_MECHANISMS,
  MUSIC_SEED_RECIPES,
  compileMusicStack,
  getMusicMechanism,
  getMusicSeedRecipe,
  mechanismFamilies,
  musicGenomePhenotypeSignature,
  normalizeMusicControls,
} from '../data/musicSeedSystem';
import {
  breedMusicGenome,
  describeGenomeInheritance,
  genomeToStackItem,
  parentFromGenome,
  parentFromRecipe,
} from '../lib/musicBreeding';
import { applySuccessSaturation } from '../lib/noveltyPressure';
import {
  deleteBredMusicGenome,
  getBredMusicGenomes,
  getGenomeMechanismFitness,
  promoteBredMusicGenome,
} from '../lib/localStorage';

interface MusicSeedLabPanelProps {
  stack: MusicStackItem[];
  onChange: (items: MusicStackItem[]) => void;
  controls: MusicControls;
  onControlsChange: (controls: MusicControls) => void;
  preferenceWeights?: Record<string, number>;
  noveltySaturation?: Record<string, number>;
}

function makeItem(kind: 'recipe' | 'mechanism', refId: string, strength = 72): MusicStackItem {
  return {
    instanceId: kind + '_' + refId + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    kind,
    refId,
    muted: false,
    locked: false,
    strength,
  };
}

function blendRecipeControls(current: MusicControls, defaults: Partial<MusicControls> | undefined, fresh: boolean): MusicControls {
  if (!defaults) return current;
  if (fresh) return normalizeMusicControls({ ...current, ...defaults });
  const next = { ...current };
  (Object.keys(defaults) as Array<keyof MusicControls>).forEach((key) => {
    const incoming = defaults[key];
    if (typeof incoming !== 'number') return;
    next[key] = Math.round(current[key] * 0.6 + incoming * 0.4);
  });
  return normalizeMusicControls(next);
}

function labelFor(item: MusicStackItem): string {
  if (item.kind === 'genome') return item.genome?.name || item.refId;
  return item.kind === 'recipe'
    ? getMusicSeedRecipe(item.refId)?.name || item.refId
    : getMusicMechanism(item.refId)?.name || item.refId;
}

function descriptionFor(item: MusicStackItem): string {
  if (item.kind === 'genome') {
    const genome = item.genome;
    return genome
      ? 'Generation ' + genome.generation + ' bred genome • ' + genome.mechanismIds.length + ' mechanisms • ' + genome.lineage.invariant
      : 'Bred music genome';
  }
  return item.kind === 'recipe'
    ? getMusicSeedRecipe(item.refId)?.description || ''
    : getMusicMechanism(item.refId)?.shortExplanation || '';
}

function SliderRow({
  label,
  left,
  right,
  value,
  onChange,
}: {
  label: string;
  left: string;
  right: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-lg border border-[#252d3b] bg-[#0a0d13] px-3 py-2.5">
      <div className="flex items-center justify-between gap-2 font-mono">
        <span className="text-[10px] font-black tracking-wider text-white">{label}</span>
        <span className="text-[10px] font-black text-[#00f0ff]">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full accent-[#ff4fd8]"
      />
      <div className="mt-1 flex justify-between gap-4 text-[9px] font-mono text-[#64748b]">
        <span>{left}</span>
        <span className="text-right">{right}</span>
      </div>
    </label>
  );
}

export function MusicSeedLabPanel({
  stack,
  onChange,
  controls,
  onControlsChange,
  preferenceWeights = {},
  noveltySaturation = {},
}: MusicSeedLabPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [showRecipes, setShowRecipes] = useState(true);
  const [showMechanisms, setShowMechanisms] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showBreeder, setShowBreeder] = useState(false);
  const [genomes, setGenomes] = useState<MusicBredGenome[]>(() => getBredMusicGenomes());
  const [parentAId, setParentAId] = useState('');
  const [parentBId, setParentBId] = useState('');
  const [breedingSeed, setBreedingSeed] = useState('');
  const [childName, setChildName] = useState('');
  const [breedingError, setBreedingError] = useState<string | null>(null);
  const [lastBredGenome, setLastBredGenome] = useState<MusicBredGenome | null>(null);
  const [stackNotice, setStackNotice] = useState<string | null>(null);
  const compiled = useMemo(() => compileMusicStack(stack, controls), [stack, controls]);
  const selectionScore = (mechanismId: string) =>
    applySuccessSaturation(preferenceWeights[mechanismId] || 0, noveltySaturation[mechanismId] || 0);
  const recipeFreshness = (recipeId: string) => {
    const recipe = getMusicSeedRecipe(recipeId);
    if (!recipe || recipe.mechanismIds.length === 0) return 1;
    const average =
      recipe.mechanismIds.reduce((sum, id) => sum + (noveltySaturation[id] || 0), 0) /
      recipe.mechanismIds.length;
    return 1 - average;
  };
  const coolingMechanisms = MUSIC_MECHANISMS
    .filter((mechanism) => (noveltySaturation[mechanism.id] || 0) >= 0.72)
    .sort((a, b) => (noveltySaturation[b.id] || 0) - (noveltySaturation[a.id] || 0));

  const updateItem = (instanceId: string, patch: Partial<MusicStackItem>) => {
    onChange(stack.map((item) => item.instanceId === instanceId ? { ...item, ...patch } : item));
  };

  const removeItem = (instanceId: string) => {
    onChange(stack.filter((item) => item.instanceId !== instanceId));
  };

  const moveItem = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= stack.length) return;
    const next = [...stack];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  };

  const addRecipe = (recipeId: string) => {
    const recipe = getMusicSeedRecipe(recipeId);
    if (!recipe) return;
    const existing = stack.find((item) => item.kind === 'recipe' && item.refId === recipeId);
    if (existing) {
      if (existing.muted) updateItem(existing.instanceId, { muted: false });
      setStackNotice('Duplicate recipe blocked. One macro gets one vote; use its strength control if you want more influence.');
      return;
    }
    const fresh = stack.filter((item) => item.kind === 'recipe' && !item.muted).length === 0;
    onChange([...stack, makeItem('recipe', recipeId, 78)]);
    onControlsChange(blendRecipeControls(controls, recipe.defaultControls, fresh));
    setStackNotice(null);
  };

  const addMechanism = (mechanismId: string) => {
    const existing = stack.find((item) => item.kind === 'mechanism' && item.refId === mechanismId);
    if (existing) {
      if (existing.muted) updateItem(existing.instanceId, { muted: false });
      setStackNotice('Duplicate mechanism blocked. Extra copies no longer create secret weighting; raise strength explicitly instead.');
      return;
    }
    const weight = preferenceWeights[mechanismId] || 0;
    onChange([...stack, makeItem('mechanism', mechanismId, Math.round(70 + Math.min(20, weight * 20)))]);
    setStackNotice(null);
  };


  const addGenome = (genome: MusicBredGenome) => {
    const signature = musicGenomePhenotypeSignature(genome);
    const existing = stack.find(
      (item) => item.kind === 'genome' && musicGenomePhenotypeSignature(item.genome) === signature
    );
    if (existing) {
      if (existing.muted) updateItem(existing.instanceId, { muted: false });
      setStackNotice('Duplicate phenotype blocked. Same musical genes + controls + invariant + relationship law only get one vote.');
      return;
    }

    onChange([...stack, genomeToStackItem(genome)]);
    const nextControls = { ...controls };
    (Object.keys(genome.controls) as Array<keyof MusicControls>).forEach((key) => {
      nextControls[key] = Math.round(controls[key] * 0.55 + genome.controls[key] * 0.45);
    });
    onControlsChange(normalizeMusicControls(nextControls));
    setStackNotice(null);
  };

  const breedingParents = [
    ...MUSIC_SEED_RECIPES.map((recipe) => ({
      key: 'recipe:' + recipe.id,
      label: recipe.name + ' • G0',
      parent: parentFromRecipe(recipe),
    })),
    ...genomes.map((genome) => ({
      key: 'genome:' + genome.id,
      label: genome.name + ' • G' + genome.generation,
      parent: parentFromGenome(genome, getGenomeMechanismFitness(genome)),
    })),
  ];

  const resolveBreedingParent = (key: string) =>
    breedingParents.find((item) => item.key === key)?.parent;

  const breedSelectedParents = () => {
    setBreedingError(null);
    const parentA = resolveBreedingParent(parentAId);
    const parentB = resolveBreedingParent(parentBId);
    if (!parentA || !parentB) {
      setBreedingError('Pick two parents first.');
      return;
    }
    if (parentAId === parentBId) {
      setBreedingError('The same bastard cannot be both parents.');
      return;
    }

    try {
      const child = breedMusicGenome(parentA, parentB, breedingSeed, childName);
      setLastBredGenome(child);
      addGenome(child);
      setChildName('');
      setStackNotice(
        'New offspring is TEMPORARY. It can live in the current stack, but it cannot become a future parent until you explicitly promote it to breeding stock.'
      );
    } catch (error: any) {
      setBreedingError(error?.message || 'Breeding failed.');
    }
  };

  const promoteLastBredGenome = () => {
    if (!lastBredGenome) return;
    setGenomes(
      promoteBredMusicGenome(lastBredGenome, {
        reason: 'manual-promotion',
        note: 'Explicitly promoted from Music Seed Lab.',
      })
    );
    setStackNotice(
      lastBredGenome.name + ' promoted to durable breeding stock. It may now appear as a parent in future crosses.'
    );
  };

  const useFirstTwoActiveMacros = () => {
    const active = stack.filter((item) => !item.muted && (item.kind === 'recipe' || item.kind === 'genome')).slice(0, 2);
    if (active.length < 2) {
      setBreedingError('Need two active recipe/genome macros in the stack.');
      return;
    }
    setBreedingError(null);
    setParentAId(active[0].kind + ':' + active[0].refId);
    setParentBId(active[1].kind + ':' + active[1].refId);
    setShowBreeder(true);
  };

  const rollBreedingSeed = () => {
    setBreedingSeed('cross-' + Math.random().toString(36).slice(2, 9));
  };

  const rerollItem = (item: MusicStackItem) => {
    if (item.locked || item.kind === 'genome') return;
    if (item.kind === 'recipe') {
      const ranked = MUSIC_SEED_RECIPES
        .filter((recipe) => recipe.id !== item.refId)
        .sort((a, b) => recipeFreshness(b.id) - recipeFreshness(a.id));
      const pool = ranked.slice(0, Math.max(3, Math.ceil(ranked.length * 0.6)));
      if (!pool.length) return;
      const next = pool[Math.floor(Math.random() * pool.length)];
      updateItem(item.instanceId, { refId: next.id });
      onControlsChange(blendRecipeControls(controls, next.defaultControls, false));
      setStackNotice('Recipe reroll used success saturation: recent overexposed mechanism bundles were deprioritized, not banned.');
      return;
    }

    const current = getMusicMechanism(item.refId);
    const sameFamily = current
      ? MUSIC_MECHANISMS.filter((mechanism) => mechanism.family === current.family && mechanism.id !== current.id)
      : MUSIC_MECHANISMS.filter((mechanism) => mechanism.id !== item.refId);
    const weighted = [...sameFamily].sort((a, b) => selectionScore(b.id) - selectionScore(a.id));
    const pool = weighted.slice(0, Math.max(3, Math.ceil(weighted.length * 0.65)));
    if (!pool.length) return;
    updateItem(item.instanceId, { refId: pool[Math.floor(Math.random() * pool.length)].id });
  };

  const clearUnlocked = () => onChange(stack.filter((item) => item.locked));

  const noRecipe = () => onChange(stack.filter((item) => (item.kind !== 'recipe' && item.kind !== 'genome') || item.locked));

  const stemmySurprise = () => {
    const locked = stack.filter((item) => item.locked);
    const ranked = MUSIC_MECHANISMS
      .filter((mechanism) => mechanism.stemValue >= 4)
      .sort((a, b) => selectionScore(b.id) - selectionScore(a.id));
    const candidatePool = ranked.slice(0, Math.max(6, Math.ceil(ranked.length * 0.6)));
    const shuffled = [...candidatePool].sort(() => 0.5 - Math.random()).slice(0, 4);
    onChange([...locked, ...shuffled.map((mechanism) => makeItem('mechanism', mechanism.id, 82))]);
    onControlsChange(normalizeMusicControls({
      ...controls,
      stemminess: 94,
      kineticDensity: Math.max(controls.kineticDensity, 68),
    }));
  };

  const setControl = (key: keyof MusicControls, value: number) => {
    onControlsChange(normalizeMusicControls({ ...controls, [key]: value }));
  };

  return (
    <section className="rounded-2xl border border-[#4b2446] bg-[#0e0d14] shadow-[0_0_30px_rgba(255,79,216,0.08)] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="w-full p-4 md:p-5 flex items-start justify-between gap-4 text-left"
      >
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-[#ff4fd8]" />
            <h2 className="font-mono font-black tracking-wider text-white">SEED LAB — START ME SOMEWHERE</h2>
          </div>
          <p className="mt-1 text-[11px] font-mono text-[#8d99aa]">
            Recipes are stackable macro-chips. Mechanisms are stackable musical physics. Nothing here is a preset prison.
          </p>
        </div>
        <span className="text-[10px] font-mono text-[#ff9dea]">
          {stack.length} STACK ITEMS • {compiled.mechanisms.length} ACTIVE MECHANISMS
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[#2b2230] p-4 md:p-5 space-y-5">
          {coolingMechanisms.length > 0 && (
            <div className="rounded-lg border border-[#00f0ff]/30 bg-[#071a20] px-3 py-2.5 font-mono">
              <div className="text-[10px] font-black tracking-[0.12em] text-[#7eeeff]">
                SUCCESS SATURATION / COOLDOWN
              </div>
              <div className="mt-1 text-[10px] leading-relaxed text-[#76aab8]">
                {coolingMechanisms.length} recently overexposed trait{coolingMechanisms.length === 1 ? '' : 's'} are temporarily deprioritized in automatic rerolls, surprise rolls, and inheritance. Manual selection still wins.
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {coolingMechanisms.slice(0, 6).map((mechanism) => (
                  <span key={mechanism.id} className="rounded-full border border-[#214b57] bg-[#0b252d] px-2 py-1 text-[9px] text-[#9deeff]">
                    {mechanism.name} {Math.round((noveltySaturation[mechanism.id] || 0) * 100)}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {(stackNotice || compiled.suppressedDuplicates.length > 0) && (
            <div className="rounded-lg border border-[#f59e0b]/35 bg-[#231706] px-3 py-2.5 font-mono">
              <div className="text-[10px] font-black tracking-[0.12em] text-[#fbbf24]">
                GENETIC INBREEDING FILTER
              </div>
              <div className="mt-1 text-[10px] leading-relaxed text-[#c8a86a]">
                {stackNotice || (
                  compiled.suppressedDuplicates.reduce((sum, item) => sum + item.count, 0) +
                  ' pre-existing duplicate stack entr' +
                  (compiled.suppressedDuplicates.reduce((sum, item) => sum + item.count, 0) === 1 ? 'y is' : 'ies are') +
                  ' being ignored during generation. Highest explicit strength wins; duplicates add zero extra influence.'
                )}
              </div>
              {stackNotice && (
                <button
                  type="button"
                  onClick={() => setStackNotice(null)}
                  className="mt-1.5 text-[9px] text-[#fbbf24] hover:text-white"
                >
                  dismiss
                </button>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowRecipes((value) => !value)}
              className="px-3 py-2 rounded-lg border border-[#ff4fd8]/40 bg-[#251020] text-[#ff9dea] font-mono text-xs font-black hover:border-[#ff4fd8]"
            >
              + ADD RECIPE
            </button>
            <button
              type="button"
              onClick={() => setShowMechanisms((value) => !value)}
              className="px-3 py-2 rounded-lg border border-[#00f0ff]/40 bg-[#0c1d25] text-[#7eeeff] font-mono text-xs font-black hover:border-[#00f0ff]"
            >
              + ADD MECHANISM
            </button>
            <button
              type="button"
              onClick={() => setShowBreeder((value) => !value)}
              className="px-3 py-2 rounded-lg border border-[#a879ff]/45 bg-[#1b1230] text-[#c7a7ff] font-mono text-xs font-black hover:border-[#a879ff]"
            >
              <Dna className="inline-block w-3.5 h-3.5 mr-1" />
              BREED RECIPES
            </button>
            <button
              type="button"
              onClick={stemmySurprise}
              className="px-3 py-2 rounded-lg border border-[#39ff14]/35 bg-[#102417] text-[#86efac] font-mono text-xs font-black hover:border-[#39ff14]"
              title="Keep locked items, then roll high-stem-value mechanisms and crank stemminess."
            >
              <Dices className="inline-block w-3.5 h-3.5 mr-1" />
              SURPRISE ME, GIVE ME STEMS
            </button>
            <button
              type="button"
              onClick={noRecipe}
              className="px-3 py-2 rounded-lg border border-[#ff7b00]/40 bg-[#26160b] text-[#ffad66] font-mono text-xs font-black hover:border-[#ff7b00]"
              title="Remove unlocked recipe macros but keep your mechanism chips."
            >
              NO RECIPE, YOU COWARD
            </button>
            <button
              type="button"
              onClick={clearUnlocked}
              disabled={!stack.some((item) => !item.locked)}
              className="px-3 py-2 rounded-lg border border-[#4b5563] bg-[#11151d] text-[#9ca3af] font-mono text-xs font-black hover:text-white disabled:opacity-35"
            >
              <Trash2 className="inline-block w-3.5 h-3.5 mr-1" />
              CLEAR UNLOCKED
            </button>
          </div>

          {showRecipes && (
            <div className="rounded-xl border border-[#3c253a] bg-[#090a0f] p-3">
              <div className="mb-2 text-[10px] font-mono font-black tracking-[0.18em] text-[#ff9dea]">PRE-MADE SEED RECIPES — STACK AS MANY AS YOU WANT</div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {MUSIC_SEED_RECIPES.map((recipe) => (
                  <button
                    type="button"
                    key={recipe.id}
                    onClick={() => addRecipe(recipe.id)}
                    className="text-left rounded-xl border border-[#2d2634] bg-[#111018] p-3 hover:border-[#ff4fd8] transition-colors"
                  >
                    <div className="text-xs font-mono font-black text-white">{recipe.name}</div>
                    <div className="mt-1 text-[11px] leading-snug text-[#d1a9ca]">{recipe.startHere}</div>
                    <div className="mt-1.5 text-[10px] leading-snug text-[#748096]">{recipe.description}</div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-[9px] font-mono text-[#5f687a]">
                      <span>{recipe.mechanismIds.length} bundled mechanisms</span>
                      {recipeFreshness(recipe.id) < 0.35 && (
                        <span className="rounded border border-[#285264] bg-[#0b2028] px-1.5 py-0.5 text-[#7eeeff]">COOLING</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showBreeder && (
            <div className="rounded-xl border border-[#5a3a76] bg-[#0d0915] p-3 md:p-4 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[#c7a7ff]">
                    <Dna className="w-4 h-4" />
                    <span className="text-xs font-mono font-black tracking-[0.16em]">MUSIC GENETICS — BREED THE BASTARDS</span>
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed font-mono text-[#8d7ca8]">
                    Two-parent deterministic crossover. Child size stays near the parental average; each parent contributes real mechanisms; one invariant survives; 0–1 bounded mutation may occur. New children are temporary until YOU promote them to breeding stock. Trait feedback biases which parental genes reproduce.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={useFirstTwoActiveMacros}
                  className="shrink-0 rounded-lg border border-[#4a405c] bg-[#171221] px-2.5 py-1.5 text-[10px] font-mono text-[#c6b6d9] hover:text-white"
                >
                  USE FIRST TWO ACTIVE MACROS
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-[9px] font-mono font-black text-[#ff9dea]">PARENT A</span>
                  <select
                    value={parentAId}
                    onChange={(event) => setParentAId(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#3c3348] bg-[#090a0f] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#a879ff]"
                  >
                    <option value="">pick parent A…</option>
                    {breedingParents.map((item) => (
                      <option key={'a-' + item.key} value={item.key}>{item.label}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-[9px] font-mono font-black text-[#7eeeff]">PARENT B</span>
                  <select
                    value={parentBId}
                    onChange={(event) => setParentBId(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#3c3348] bg-[#090a0f] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00f0ff]"
                  >
                    <option value="">pick parent B…</option>
                    {breedingParents.map((item) => (
                      <option key={'b-' + item.key} value={item.key}>{item.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                <label className="block">
                  <span className="text-[9px] font-mono font-black text-[#ffe680]">BREEDING SEED</span>
                  <input
                    type="text"
                    value={breedingSeed}
                    onChange={(event) => setBreedingSeed(event.target.value)}
                    placeholder="same parents + same seed = same genetics"
                    className="mt-1 w-full rounded-lg border border-[#3c3348] bg-[#090a0f] px-3 py-2 text-xs font-mono text-white placeholder-[#5e5868] focus:outline-none focus:border-[#ffe680]"
                  />
                </label>
                <button
                  type="button"
                  onClick={rollBreedingSeed}
                  className="self-end rounded-lg border border-[#4a405c] bg-[#171221] px-3 py-2 text-[10px] font-mono text-[#ffe680] hover:border-[#ffe680]"
                >
                  ROLL SEED
                </button>
              </div>

              <label className="block">
                <span className="text-[9px] font-mono font-black text-[#86efac]">OPTIONAL CHILD NAME</span>
                <input
                  type="text"
                  value={childName}
                  onChange={(event) => setChildName(event.target.value)}
                  placeholder="leave blank and the genetics lab names the creature"
                  className="mt-1 w-full rounded-lg border border-[#3c3348] bg-[#090a0f] px-3 py-2 text-xs font-mono text-white placeholder-[#5e5868] focus:outline-none focus:border-[#39ff14]"
                />
              </label>

              {breedingError && (
                <div className="rounded-lg border border-[#7f1d1d] bg-[#2b1216] px-3 py-2 text-[10px] font-mono text-[#fca5a5]">
                  {breedingError}
                </div>
              )}

              <button
                type="button"
                onClick={breedSelectedParents}
                className="w-full rounded-xl border border-[#a879ff] bg-gradient-to-r from-[#2b1647] to-[#40122f] px-4 py-3 font-mono text-xs font-black text-white shadow-[0_0_20px_rgba(168,121,255,0.18)] hover:brightness-115"
              >
                🧬 BREED THE BASTARDS
              </button>

              {lastBredGenome && (
                <div className="rounded-xl border border-[#4b3d5f] bg-[#120f18] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-mono font-black text-white">{lastBredGenome.name}</div>
                      <div className="text-[9px] font-mono text-[#c7a7ff]">GENERATION {lastBredGenome.generation} • {lastBredGenome.mechanismIds.length} GENES</div>
                    </div>
                    <span className="rounded bg-[#a879ff] px-2 py-1 text-[9px] font-mono font-black text-black">NEW OFFSPRING</span>
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap text-[10px] leading-relaxed font-mono text-[#9ba7ba]">
                    {describeGenomeInheritance(lastBredGenome)}
                  </pre>
                  <div className="mt-3 rounded-lg border border-[#604d20] bg-[#1b1608] px-3 py-2">
                    <div className="text-[9px] font-mono font-black text-[#ffe680]">TEMPORARY OFFSPRING — ZERO REPRODUCTIVE PRIVILEGE YET</div>
                    <div className="mt-1 text-[9px] font-mono text-[#9e9368]">
                      Being born does not put this genome in the durable parent library.
                    </div>
                    <button
                      type="button"
                      onClick={promoteLastBredGenome}
                      className="mt-2 w-full rounded-lg border border-[#ffd84d] bg-[#2d2508] px-3 py-2 text-[10px] font-mono font-black text-[#ffe680] hover:bg-[#3a3009]"
                    >
                      ★ PROMOTE TO BREEDING STOCK
                    </button>
                  </div>
                </div>
              )}

              {genomes.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[9px] font-mono font-black tracking-[0.16em] text-[#9d8bb5]">
                    <GitBranch className="w-3.5 h-3.5" />
                    DURABLE BREEDING STOCK ({genomes.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                    {genomes.map((genome) => (
                      <div key={genome.id} className="rounded-xl border border-[#352d42] bg-[#100d15] p-3">
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => addGenome(genome)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <div className="font-mono font-black text-xs text-white truncate">{genome.name}</div>
                            <div className="mt-0.5 text-[9px] font-mono text-[#a879ff]">
                              G{genome.generation} • {genome.mechanismIds.length} genes • FITNESS-APPROVED
                            </div>
                            <div className="mt-1 text-[10px] leading-snug text-[#7f899a] line-clamp-2">{genome.description}</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setGenomes(deleteBredMusicGenome(genome.id))}
                            className="p-1.5 rounded border border-[#4a252d] bg-[#211116] text-[#f87171] hover:text-white"
                            title="Delete from breeding library; active stack copies survive."
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => addGenome(genome)}
                          className="mt-2 w-full rounded-lg border border-[#4a405c] bg-[#181320] px-2.5 py-1.5 text-[10px] font-mono font-black text-[#c7a7ff] hover:border-[#a879ff]"
                        >
                          + ADD OFFSPRING TO STACK
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {showMechanisms && (
            <div className="rounded-xl border border-[#253647] bg-[#090c11] p-3 space-y-3">
              <div className="text-[10px] font-mono font-black tracking-[0.18em] text-[#7eeeff]">MECHANISM CHIPS — BUILD THE PHYSICS BY HAND</div>
              {mechanismFamilies().map((family) => (
                <div key={family}>
                  <div className="mb-1.5 text-[9px] font-mono font-black uppercase tracking-wider text-[#64748b]">{family}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {MUSIC_MECHANISMS.filter((mechanism) => mechanism.family === family).map((mechanism) => (
                      <button
                        type="button"
                        key={mechanism.id}
                        onClick={() => addMechanism(mechanism.id)}
                        title={mechanism.shortExplanation}
                        className="rounded-full border border-[#2a4051] bg-[#101923] px-2.5 py-1.5 text-[10px] font-mono text-[#b7dff2] hover:border-[#00f0ff] hover:text-white"
                      >
                        + {mechanism.name}
                        {preferenceWeights[mechanism.id] ? <span className="ml-1 text-[#ffd84d]">★</span> : null}
                        {(noveltySaturation[mechanism.id] || 0) >= 0.72 ? <span className="ml-1 text-[#7eeeff]">↻</span> : null}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-mono font-black tracking-[0.18em] text-white">YOUR MUSICAL STACK</div>
                <div className="text-[10px] font-mono text-[#69758a]">Order matters. Duplicates do not secretly vote. ↻ means recently overexposed: automatic selection cools it down, but manual choices remain sovereign.</div>
              </div>
              <button
                type="button"
                onClick={() => setShowControls((value) => !value)}
                className="rounded-lg border border-[#30384a] bg-[#111620] px-2.5 py-1.5 text-[10px] font-mono text-[#cbd5e1] hover:text-white"
              >
                <SlidersHorizontal className="inline-block w-3 h-3 mr-1" />
                CONTROLS
              </button>
            </div>

            {stack.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#34303c] bg-[#090a0e] p-6 text-center text-xs font-mono text-[#667085]">
                Empty stack. Pick a recipe, add mechanism chips, or remain gloriously irresponsible.
              </div>
            ) : (
              <div className="space-y-2">
                {stack.map((item, index) => (
                  <div
                    key={item.instanceId}
                    className={
                      'rounded-xl border p-3 transition-opacity ' +
                      (item.muted
                        ? 'border-[#282b31] bg-[#0b0c10] opacity-45'
                        : item.kind === 'recipe'
                        ? 'border-[#4a2948] bg-[#151019]'
                        : item.kind === 'genome'
                        ? 'border-[#5a3a76] bg-[#120f18] shadow-[0_0_12px_rgba(168,121,255,0.08)]'
                        : 'border-[#234152] bg-[#0d151c]')
                    }
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={
                            'rounded px-1.5 py-0.5 text-[9px] font-mono font-black ' +
                            (item.kind === 'recipe'
                              ? 'bg-[#ff4fd8] text-black'
                              : item.kind === 'genome'
                              ? 'bg-[#a879ff] text-black'
                              : 'bg-[#00f0ff] text-black')
                          }>
                            {item.kind === 'recipe' ? 'RECIPE' : item.kind === 'genome' ? 'GENOME' : 'MECHANISM'}
                          </span>
                          <span className="font-mono font-black text-sm text-white truncate">{labelFor(item)}</span>
                          <span className="text-[10px] font-mono text-[#7c8799]">strength {item.strength}</span>
                          {item.locked && <span className="text-[9px] font-mono text-[#ffe680]">LOCKED</span>}
                          {item.muted && <span className="text-[9px] font-mono text-[#94a3b8]">MUTED</span>}
                        </div>
                        <div className="mt-1 text-[10px] text-[#7d8ba1]">
                          {descriptionFor(item)}
                        </div>
                        {item.kind === 'genome' && item.genome && (
                          <div className="mt-1 text-[9px] font-mono text-[#a879ff]">
                            {item.genome.lineage.parentA.name} × {item.genome.lineage.parentB.name}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1">
                        <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0} className="p-1.5 rounded border border-[#30384a] bg-[#111620] text-[#94a3b8] disabled:opacity-25" title="Move up"><ArrowUp className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => moveItem(index, 1)} disabled={index === stack.length - 1} className="p-1.5 rounded border border-[#30384a] bg-[#111620] text-[#94a3b8] disabled:opacity-25" title="Move down"><ArrowDown className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => updateItem(item.instanceId, { strength: Math.max(0, item.strength - 10) })} className="p-1.5 rounded border border-[#30384a] bg-[#111620] text-[#94a3b8]" title="Weaken"><Minus className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => updateItem(item.instanceId, { strength: Math.min(100, item.strength + 10) })} className="p-1.5 rounded border border-[#30384a] bg-[#111620] text-[#94a3b8]" title="Strengthen"><Plus className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => rerollItem(item)} disabled={item.locked || item.kind === 'genome'} className="p-1.5 rounded border border-[#423a26] bg-[#1c180d] text-[#ffd84d] disabled:opacity-25" title={item.kind === 'genome' ? 'Bred genomes keep their lineage; breed a new child instead.' : 'Reroll only this'}><Shuffle className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => updateItem(item.instanceId, { muted: !item.muted })} className="p-1.5 rounded border border-[#30384a] bg-[#111620] text-[#9fb0c7]" title={item.muted ? 'Unmute' : 'Mute'}>{item.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}</button>
                        <button type="button" onClick={() => updateItem(item.instanceId, { locked: !item.locked })} className="p-1.5 rounded border border-[#4b4026] bg-[#1c180d] text-[#ffe680]" title={item.locked ? 'Unlock' : 'Lock'}>{item.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}</button>
                        <button type="button" onClick={() => removeItem(item.instanceId)} className="p-1.5 rounded border border-[#4a252d] bg-[#211116] text-[#f87171]" title="Remove"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {compiled.mechanisms.length > 0 && (
            <div className="rounded-xl border border-[#253244] bg-[#090d12] p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[9px] font-mono font-black tracking-[0.18em] text-[#8aa0ba]">COMPILED ACTIVE PHYSICS</div>
                {compiled.genomes.length > 0 && (
                  <div className="text-[9px] font-mono text-[#a879ff]">{compiled.genomes.length} ACTIVE GENOME{compiled.genomes.length === 1 ? '' : 'S'}</div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {compiled.mechanisms.map((entry) => (
                  <span key={entry.mechanism.id} className="rounded-full border border-[#2b3b4f] bg-[#111827] px-2 py-1 text-[9px] font-mono text-[#a8d8ff]">
                    {entry.mechanism.name} {entry.strength}
                  </span>
                ))}
              </div>
              {compiled.interactions.length > 0 && (
                <div className="mt-2 text-[10px] font-mono text-[#b39bc8]">
                  {compiled.interactions.length} stack interaction{compiled.interactions.length === 1 ? '' : 's'} detected — the compiler will make the mechanisms negotiate instead of paste them together.
                </div>
              )}
            </div>
          )}

          {showControls && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-[10px] font-mono font-black tracking-[0.18em] text-[#ffe680]">GLOBAL MUSICAL PRESSURE</div>
                <button
                  type="button"
                  onClick={() => onControlsChange(DEFAULT_MUSIC_CONTROLS)}
                  className="text-[9px] font-mono text-[#79869a] hover:text-white"
                >
                  RESET
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <SliderRow label="STEMMINESS" left="melted together" right="dissect me" value={controls.stemminess} onChange={(value) => setControl('stemminess', value)} />
                <SliderRow label="KINETIC DENSITY" left="room to breathe" right="JESUS CHRIST" value={controls.kineticDensity} onChange={(value) => setControl('kineticDensity', value)} />
                <SliderRow label="SOCIAL INFECTION" left="one weirdo" right="entire building" value={controls.socialInfection} onChange={(value) => setControl('socialInfection', value)} />
                <SliderRow label="COUPLING" left="one clock" right="multiple rhythmic truths" value={controls.coupling} onChange={(value) => setControl('coupling', value)} />
                <SliderRow label="INTERRUPTION" left="finish your thought" right="ABSOLUTELY NOT" value={controls.interruption} onChange={(value) => setControl('interruption', value)} />
                <SliderRow label="ANCHOR" left="amnesia" right="that fucking thing again" value={controls.anchorStrength} onChange={(value) => setControl('anchorStrength', value)} />
                <SliderRow label="CAST SIZE" left="solo" right="municipal emergency" value={controls.castSize} onChange={(value) => setControl('castSize', value)} />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
