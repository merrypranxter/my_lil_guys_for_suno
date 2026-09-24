import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Dices,
  FlaskConical,
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
import { MusicControls, MusicStackItem } from '../types';
import {
  DEFAULT_MUSIC_CONTROLS,
  MUSIC_MECHANISMS,
  MUSIC_SEED_RECIPES,
  compileMusicStack,
  getMusicMechanism,
  getMusicSeedRecipe,
  mechanismFamilies,
  normalizeMusicControls,
} from '../data/musicSeedSystem';

interface MusicSeedLabPanelProps {
  stack: MusicStackItem[];
  onChange: (items: MusicStackItem[]) => void;
  controls: MusicControls;
  onControlsChange: (controls: MusicControls) => void;
  preferenceWeights?: Record<string, number>;
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
  return item.kind === 'recipe'
    ? getMusicSeedRecipe(item.refId)?.name || item.refId
    : getMusicMechanism(item.refId)?.name || item.refId;
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
}: MusicSeedLabPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [showRecipes, setShowRecipes] = useState(true);
  const [showMechanisms, setShowMechanisms] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const compiled = useMemo(() => compileMusicStack(stack, controls), [stack, controls]);

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
    const fresh = stack.filter((item) => item.kind === 'recipe' && !item.muted).length === 0;
    onChange([...stack, makeItem('recipe', recipeId, 78)]);
    onControlsChange(blendRecipeControls(controls, recipe.defaultControls, fresh));
  };

  const addMechanism = (mechanismId: string) => {
    const weight = preferenceWeights[mechanismId] || 0;
    onChange([...stack, makeItem('mechanism', mechanismId, Math.round(70 + Math.min(20, weight * 20)))]);
  };

  const rerollItem = (item: MusicStackItem) => {
    if (item.locked) return;
    if (item.kind === 'recipe') {
      const pool = MUSIC_SEED_RECIPES.filter((recipe) => recipe.id !== item.refId);
      if (!pool.length) return;
      const next = pool[Math.floor(Math.random() * pool.length)];
      updateItem(item.instanceId, { refId: next.id });
      onControlsChange(blendRecipeControls(controls, next.defaultControls, false));
      return;
    }

    const current = getMusicMechanism(item.refId);
    const sameFamily = current
      ? MUSIC_MECHANISMS.filter((mechanism) => mechanism.family === current.family && mechanism.id !== current.id)
      : MUSIC_MECHANISMS.filter((mechanism) => mechanism.id !== item.refId);
    const weighted = [...sameFamily].sort((a, b) => (preferenceWeights[b.id] || 0) - (preferenceWeights[a.id] || 0));
    const pool = weighted.slice(0, Math.max(3, Math.ceil(weighted.length * 0.7)));
    if (!pool.length) return;
    updateItem(item.instanceId, { refId: pool[Math.floor(Math.random() * pool.length)].id });
  };

  const clearUnlocked = () => onChange(stack.filter((item) => item.locked));

  const noRecipe = () => onChange(stack.filter((item) => item.kind !== 'recipe' || item.locked));

  const stemmySurprise = () => {
    const locked = stack.filter((item) => item.locked);
    const candidates = MUSIC_MECHANISMS
      .filter((mechanism) => mechanism.stemValue >= 4)
      .sort((a, b) => (preferenceWeights[b.id] || 0) - (preferenceWeights[a.id] || 0));
    const shuffled = [...candidates].sort(() => 0.5 - Math.random()).slice(0, 4);
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
                    <div className="mt-2 text-[9px] font-mono text-[#5f687a]">{recipe.mechanismIds.length} bundled mechanisms</div>
                  </button>
                ))}
              </div>
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
                <div className="text-[10px] font-mono text-[#69758a]">Order matters. Recipes expand into mechanisms; duplicate mechanisms reinforce instead of cloning text.</div>
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
                      (item.muted ? 'border-[#282b31] bg-[#0b0c10] opacity-45' : item.kind === 'recipe'
                        ? 'border-[#4a2948] bg-[#151019]'
                        : 'border-[#234152] bg-[#0d151c]')
                    }
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={
                            'rounded px-1.5 py-0.5 text-[9px] font-mono font-black ' +
                            (item.kind === 'recipe' ? 'bg-[#ff4fd8] text-black' : 'bg-[#00f0ff] text-black')
                          }>
                            {item.kind === 'recipe' ? 'RECIPE' : 'MECHANISM'}
                          </span>
                          <span className="font-mono font-black text-sm text-white truncate">{labelFor(item)}</span>
                          <span className="text-[10px] font-mono text-[#7c8799]">strength {item.strength}</span>
                          {item.locked && <span className="text-[9px] font-mono text-[#ffe680]">LOCKED</span>}
                          {item.muted && <span className="text-[9px] font-mono text-[#94a3b8]">MUTED</span>}
                        </div>
                        <div className="mt-1 text-[10px] text-[#7d8ba1]">
                          {item.kind === 'recipe'
                            ? getMusicSeedRecipe(item.refId)?.description
                            : getMusicMechanism(item.refId)?.shortExplanation}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1">
                        <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0} className="p-1.5 rounded border border-[#30384a] bg-[#111620] text-[#94a3b8] disabled:opacity-25" title="Move up"><ArrowUp className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => moveItem(index, 1)} disabled={index === stack.length - 1} className="p-1.5 rounded border border-[#30384a] bg-[#111620] text-[#94a3b8] disabled:opacity-25" title="Move down"><ArrowDown className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => updateItem(item.instanceId, { strength: Math.max(0, item.strength - 10) })} className="p-1.5 rounded border border-[#30384a] bg-[#111620] text-[#94a3b8]" title="Weaken"><Minus className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => updateItem(item.instanceId, { strength: Math.min(100, item.strength + 10) })} className="p-1.5 rounded border border-[#30384a] bg-[#111620] text-[#94a3b8]" title="Strengthen"><Plus className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => rerollItem(item)} disabled={item.locked} className="p-1.5 rounded border border-[#423a26] bg-[#1c180d] text-[#ffd84d] disabled:opacity-25" title="Reroll only this"><Shuffle className="w-3.5 h-3.5" /></button>
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
              <div className="text-[9px] font-mono font-black tracking-[0.18em] text-[#8aa0ba]">COMPILED ACTIVE PHYSICS</div>
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
