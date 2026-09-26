import React, { useMemo, useState } from 'react';
import { Lock, Shuffle, Sparkles, Trash2, Unlock, Volume2, VolumeX, X } from 'lucide-react';
import { STARTER_SEEDS, STARTER_SEEDS_BY_CATEGORY } from '../starterSeeds/library';
import { compileStarterSeedStackV2 } from '../starterSeeds/compilerV2';
import { createStarterSeedStackItem } from '../starterSeeds/runtime';
import type { StarterSeedCategory, StarterSeedStackItem } from '../starterSeeds/types';

const CATEGORY_ORDER: StarterSeedCategory[] = [
  'affect',
  'psychedelic',
  'motion',
  'social',
  'worldPackage',
  'instrumentPack',
];

const CATEGORY_LABELS: Record<StarterSeedCategory, string> = {
  affect: '☀ HAPPY SHIT',
  psychedelic: '🫠 PSYCHEDELIA',
  motion: '⚡ MOTION',
  social: '👯 PEOPLE',
  instrumentPack: '🪗 8-WAY INSTRUMENT CRASH',
  worldPackage: '📺 WORLD ANCHOR',
  texture: '✨ TEXTURE',
};

const SINGLETON_CATEGORIES = new Set<StarterSeedCategory>(['worldPackage', 'instrumentPack']);

interface StarterSeedPanelProps {
  stack: StarterSeedStackItem[];
  onChange: (stack: StarterSeedStackItem[]) => void;
  onBuild: () => void;
}

export function StarterSeedPanel({ stack, onChange, onBuild }: StarterSeedPanelProps) {
  const [category, setCategory] = useState<StarterSeedCategory>('affect');
  const compiled = useMemo(() => compileStarterSeedStackV2(STARTER_SEEDS, stack), [stack]);
  const visible = STARTER_SEEDS_BY_CATEGORY[category] || [];
  const activeIds = new Set(stack.map((item) => item.seedId));

  const addSeed = (seedId: string) => {
    const seed = STARTER_SEEDS.find((item) => item.id === seedId);
    if (!seed) return;
    if (activeIds.has(seedId)) {
      onChange(stack.filter((item) => item.seedId !== seedId));
      return;
    }

    const created = createStarterSeedStackItem(seedId);
    if (!created) return;

    let next = [...stack];
    if (SINGLETON_CATEGORIES.has(seed.category)) {
      next = next.filter((item) => {
        const existing = STARTER_SEEDS.find((candidate) => candidate.id === item.seedId);
        return !existing || existing.category !== seed.category || item.locked;
      });
    }
    onChange([...next, created]);
  };

  const updateItem = (instanceId: string, patch: Partial<StarterSeedStackItem>) => {
    onChange(stack.map((item) => (item.instanceId === instanceId ? { ...item, ...patch } : item)));
  };

  const rerollCategory = () => {
    const candidates = visible.filter((seed) => !activeIds.has(seed.id));
    const pool = candidates.length ? candidates : visible;
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const retained = stack.filter((item) => {
      if (item.locked) return true;
      const seed = STARTER_SEEDS.find((candidate) => candidate.id === item.seedId);
      return !seed || seed.category !== category;
    });
    const created = createStarterSeedStackItem(pick.id);
    if (created) onChange([...retained, created]);
  };

  const clearUnlocked = () => onChange(stack.filter((item) => item.locked));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#ff4fd8]/35 bg-[#120d15] p-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono font-black tracking-[0.18em] text-[#ff9bea]">FAST START / INITIAL CONDITIONS</div>
            <div className="mt-1 max-w-3xl text-xs font-mono leading-relaxed text-[#aeb8c8]">
              Stack a feeling, altered-perception law, motion system, social behavior, one coherent world frame, and one eight-source instrument catastrophe. Then BUILD ME copies the emitted engines and music genes into the actual labs. The starter laws stay active so their operators and protected invariants survive generation.
            </div>
          </div>
          <button
            type="button"
            onClick={onBuild}
            disabled={!stack.some((item) => !item.muted)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#39ff14]/60 bg-[#102013] px-4 py-2.5 text-xs font-mono font-black text-[#c8ffba] shadow-[0_0_18px_rgba(57,255,20,0.12)] hover:border-[#39ff14] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles className="h-4 w-4" />
            BUILD ME
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORY_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setCategory(id)}
            className={
              'shrink-0 rounded-lg border px-3 py-2 text-[10px] font-mono font-black tracking-wide transition-all ' +
              (category === id
                ? 'border-[#ff4fd8] bg-[#2a1026] text-white'
                : 'border-[#30394c] bg-[#0b0f16] text-[#8d9ab0] hover:border-[#6b7280] hover:text-white')
            }
          >
            {CATEGORY_LABELS[id]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((seed) => {
          const active = activeIds.has(seed.id);
          return (
            <button
              key={seed.id}
              type="button"
              onClick={() => addSeed(seed.id)}
              className={
                'rounded-xl border p-3 text-left transition-all ' +
                (active
                  ? 'border-[#ff4fd8] bg-[#261020] shadow-[0_0_20px_rgba(255,79,216,0.10)]'
                  : 'border-[#273246] bg-[#0b0f16] hover:border-[#596579] hover:bg-[#101620]')
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-black text-white">{seed.name}</span>
                <span className="text-[9px] font-mono text-[#7c8aa0]">{seed.defaultIntensity}/100</span>
              </div>
              <div className="mt-1.5 text-[10px] font-mono leading-relaxed text-[#91a0b6]">{seed.description}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {seed.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded border border-[#283246] bg-[#0a0d13] px-1.5 py-0.5 text-[8px] font-mono text-[#657188]">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-[#344055] bg-[#090d13] p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono font-black tracking-[0.18em] text-[#ffd84d]">ACTIVE STARTER STACK</div>
            <div className="mt-1 text-[10px] font-mono text-[#69778d]">
              {compiled.activeSeeds.length} active • {compiled.collisions.length} jurisdiction collision{compiled.collisions.length === 1 ? '' : 's'} • {compiled.protectedInvariants.length} protected invariant{compiled.protectedInvariants.length === 1 ? '' : 's'}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={rerollCategory} className="inline-flex items-center gap-1.5 rounded-lg border border-[#42506a] px-2.5 py-1.5 text-[9px] font-mono font-bold text-[#b9c5d8] hover:text-white">
              <Shuffle className="h-3.5 w-3.5" /> REROLL THIS CATEGORY
            </button>
            <button type="button" onClick={clearUnlocked} className="inline-flex items-center gap-1.5 rounded-lg border border-[#5a2c39] px-2.5 py-1.5 text-[9px] font-mono font-bold text-[#ff9daf] hover:text-white">
              <Trash2 className="h-3.5 w-3.5" /> CLEAR UNLOCKED
            </button>
          </div>
        </div>

        {stack.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-[#2c3546] px-3 py-4 text-center text-[10px] font-mono text-[#5f6b80]">
            No starter seeds stacked. Pick whatever makes your nervous system go YES.
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {stack.map((item) => {
              const seed = STARTER_SEEDS.find((candidate) => candidate.id === item.seedId);
              if (!seed) return null;
              return (
                <div key={item.instanceId} className={'rounded-lg border p-2.5 ' + (item.muted ? 'border-[#252b36] bg-[#090b0f] opacity-55' : 'border-[#36445a] bg-[#0d121a]')}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="min-w-0 flex-1 text-[10px] font-mono font-black text-white">{seed.name}</span>
                    <button type="button" onClick={() => updateItem(item.instanceId, { muted: !item.muted })} className="rounded p-1 text-[#91a0b6] hover:bg-white/5 hover:text-white" title={item.muted ? 'Unmute' : 'Mute'}>
                      {item.muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    </button>
                    <button type="button" onClick={() => updateItem(item.instanceId, { locked: !item.locked })} className="rounded p-1 text-[#91a0b6] hover:bg-white/5 hover:text-white" title={item.locked ? 'Unlock' : 'Lock'}>
                      {item.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                    </button>
                    <button type="button" onClick={() => onChange(stack.filter((candidate) => candidate.instanceId !== item.instanceId))} className="rounded p-1 text-[#ff7896] hover:bg-white/5 hover:text-white" title="Remove">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={item.intensity}
                      onChange={(event) => updateItem(item.instanceId, { intensity: Number(event.target.value) })}
                      className="min-w-0 flex-1 accent-[#ff4fd8]"
                    />
                    <span className="w-12 text-right text-[9px] font-mono font-bold text-[#ffb1ed]">{item.intensity}/100</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {compiled.collisions.length > 0 && (
        <div className="rounded-xl border border-[#6c4c1a] bg-[#171207] p-3 text-[10px] font-mono leading-relaxed text-[#e8cb86]">
          <div className="font-black">NEGOTIATION DETECTED — GOOD.</div>
          <div className="mt-1 text-[#aa9464]">
            {compiled.collisions.slice(0, 3).map((collision) => collision.seedNames.join(' × ') + ' share ' + collision.jurisdiction).join(' • ')}
          </div>
        </div>
      )}
    </div>
  );
}
