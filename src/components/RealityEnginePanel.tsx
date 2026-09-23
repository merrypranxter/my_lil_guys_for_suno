import React, { useMemo, useState } from 'react';
import { Dices, Lock, Search, Shuffle, Sparkles, Trash2, Unlock, X } from 'lucide-react';
import { RealityDimension, RealityEngine } from '../types';
import {
  REALITY_DIMENSION_JURISDICTIONS,
  REALITY_DIMENSION_LABELS,
  REALITY_ENGINES,
  getRealityEngine,
  getRealityEnginesByDimension,
} from '../data/realityEngines';
import {
  analyzeRealityCollision,
  generateRealityStack,
  REALITY_CHAOS_PRESETS,
  RealityChaosLevel,
} from '../data/realityCompatibility';

interface RealityEnginePanelProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

const DIMENSIONS: RealityDimension[] = [
  'format',
  'role',
  'world',
  'species',
  'venue',
  'headspace',
  'alteredState',
  'tone',
];

const DIMENSION_COLORS: Record<RealityDimension, string> = {
  format: '#00f0ff',
  role: '#39ff14',
  world: '#bf00ff',
  species: '#ff4fd8',
  venue: '#ff8a00',
  headspace: '#ffe600',
  alteredState: '#ff0055',
  tone: '#7df9ff',
};

const RANDOM_POOL: RealityDimension[] = ['format', 'role', 'world', 'species', 'venue', 'headspace', 'alteredState', 'tone'];

function choose<T>(items: T[]): T | undefined {
  if (!items.length) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

function engineSearchText(engine: RealityEngine) {
  return [
    engine.name,
    engine.subtitle,
    engine.rule,
    engine.shortExplanation,
    ...(engine.tags || []),
  ].join(' ').toLowerCase();
}

export function RealityEnginePanel({ selectedIds, onChange }: RealityEnginePanelProps) {
  const [activeDimension, setActiveDimension] = useState<RealityDimension>('format');
  const [search, setSearch] = useState('');
  const [lockedDimensions, setLockedDimensions] = useState<RealityDimension[]>([]);
  const [chaosLevel, setChaosLevel] = useState<RealityChaosLevel>(1);

  const selected = selectedIds
    .map((id) => getRealityEngine(id))
    .filter((engine): engine is RealityEngine => Boolean(engine));

  const selectedByDimension = useMemo(() => {
    const map = new Map<RealityDimension, RealityEngine>();
    selected.forEach((engine) => map.set(engine.dimension, engine));
    return map;
  }, [selectedIds.join('|')]);

  const collisionReport = useMemo(() => analyzeRealityCollision(selected), [selectedIds.join('|')]);

  const visibleCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = getRealityEnginesByDimension(activeDimension);
    if (!q) return base;
    return base.filter((engine) => engineSearchText(engine).includes(q));
  }, [activeDimension, search]);

  const selectEngine = (engine: RealityEngine) => {
    const withoutDimension = selectedIds.filter((id) => getRealityEngine(id)?.dimension !== engine.dimension);
    if (selectedByDimension.get(engine.dimension)?.id === engine.id) {
      onChange(withoutDimension);
      return;
    }
    onChange([...withoutDimension, engine.id]);
  };

  const clearDimension = (dimension: RealityDimension) => {
    onChange(selectedIds.filter((id) => getRealityEngine(id)?.dimension !== dimension));
  };

  const randomizeDimension = (dimension: RealityDimension) => {
    if (lockedDimensions.includes(dimension)) return;
    const pick = choose(getRealityEnginesByDimension(dimension));
    if (!pick) return;
    const withoutDimension = selectedIds.filter((id) => getRealityEngine(id)?.dimension !== dimension);
    onChange([...withoutDimension, pick.id]);
  };

  const toggleLock = (dimension: RealityDimension) => {
    setLockedDimensions((prev) =>
      prev.includes(dimension) ? prev.filter((item) => item !== dimension) : [...prev, dimension],
    );
  };

  const intelligentRandomize = (forceAllDimensions: boolean) => {
    const locked = selected.filter((engine) => lockedDimensions.includes(engine.dimension));
    const dimensions = forceAllDimensions
      ? RANDOM_POOL
      : [...RANDOM_POOL].sort(() => Math.random() - 0.5);

    const stack = generateRealityStack(dimensions, locked, forceAllDimensions ? Math.max(1, chaosLevel) as RealityChaosLevel : chaosLevel);

    if (forceAllDimensions) {
      const present = new Set(stack.map((engine) => engine.dimension));
      RANDOM_POOL.forEach((dimension) => {
        if (present.has(dimension) || lockedDimensions.includes(dimension)) return;
        const pick = choose(getRealityEnginesByDimension(dimension));
        if (pick) stack.push(pick);
      });
    }

    onChange(stack.map((engine) => engine.id));
  };

  const randomizeReality = () => intelligentRandomize(true);
  const surpriseMe = () => intelligentRandomize(false);

  const clearUnlocked = () => {
    onChange(selectedIds.filter((id) => lockedDimensions.includes(getRealityEngine(id)?.dimension as RealityDimension)));
  };

  return (
    <section className="rounded-2xl border border-[#2a3347] bg-[#0d1017] shadow-2xl overflow-hidden">
      <div className="p-4 md:p-5 border-b border-[#222a39] bg-gradient-to-r from-[#111522] via-[#15101d] to-[#0c1518]">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono font-black tracking-wider text-white">
              <span className="text-[#ff4fd8]">✦</span>
              REALITY ENGINE
              <span className="rounded-full border border-[#3a455c] px-2 py-0.5 text-[10px] text-[#91a0b8]">
                {selected.length}/8 ACTIVE
              </span>
            </div>
            <p className="mt-1 text-[11px] md:text-xs font-mono text-[#7d8ba1]">
              WHERE the song thinks it is, WHO is speaking, WHAT is happening, and WHAT STATE reality is in.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex gap-2">
            <button type="button" onClick={randomizeReality} className="px-3 py-2 rounded-lg border border-[#bf00ff]/60 bg-[#1b1023] text-[#e7a7ff] hover:text-white font-mono text-[11px] font-bold inline-flex items-center justify-center gap-1.5">
              <Shuffle className="w-3.5 h-3.5" /> RANDOMIZE REALITY
            </button>
            <button type="button" onClick={surpriseMe} className="px-3 py-2 rounded-lg border border-[#ff4fd8]/60 bg-[#251020] text-[#ff9dea] hover:text-white font-mono text-[11px] font-bold inline-flex items-center justify-center gap-1.5">
              <Dices className="w-3.5 h-3.5" /> SURPRISE ME
            </button>
            <button type="button" onClick={clearUnlocked} className="px-3 py-2 rounded-lg border border-[#334155] bg-[#111827] text-[#9aa7ba] hover:text-white font-mono text-[11px] inline-flex items-center justify-center gap-1.5 sm:col-auto col-span-2">
              <Trash2 className="w-3.5 h-3.5" /> CLEAR UNLOCKED
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#2b3447] bg-[#080b11] p-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex items-center gap-2 min-w-fit">
              <Sparkles className="w-3.5 h-3.5 text-[#ffe600]" />
              <span className="text-[10px] font-mono font-black text-white tracking-wider">COLLISION INTELLIGENCE</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 flex-1">
              {REALITY_CHAOS_PRESETS.map((preset) => (
                <button
                  key={preset.level}
                  type="button"
                  onClick={() => setChaosLevel(preset.level)}
                  title={preset.subtitle}
                  className={'rounded-md border px-2 py-1.5 text-[9px] font-mono font-bold transition-all ' + (chaosLevel === preset.level ? 'border-[#ffe600] bg-[#2a2608] text-[#fff37a]' : 'border-[#293246] bg-[#0e121a] text-[#77859a] hover:text-white')}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 text-[9px] font-mono text-[#69778c]">
            Randomizers now search for combinations near this collision level instead of blindly picking cards.
          </div>
        </div>

        {selected.length > 0 ? (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {DIMENSIONS.map((dimension) => {
              const engine = selectedByDimension.get(dimension);
              if (!engine) return null;
              const locked = lockedDimensions.includes(dimension);
              const color = DIMENSION_COLORS[dimension];
              return (
                <div key={engine.id} className="flex-none rounded-lg border bg-[#090c12] px-2.5 py-2 min-w-[150px]" style={{ borderColor: color + '66' }}>
                  <div className="flex items-center justify-between gap-2">
                    <button type="button" onClick={() => setActiveDimension(dimension)} className="min-w-0 text-left">
                      <div className="text-[9px] font-mono font-bold tracking-widest" style={{ color }}>{REALITY_DIMENSION_LABELS[dimension]}</div>
                      <div className="text-[11px] font-mono font-bold text-white truncate max-w-[125px]">{engine.name}</div>
                    </button>
                    <div className="flex items-center">
                      <button type="button" onClick={() => toggleLock(dimension)} className="p-1 text-[#7d8ba1] hover:text-white" title={locked ? 'Unlock this dimension' : 'Lock this dimension'}>
                        {locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </button>
                      {!locked && (
                        <button type="button" onClick={() => clearDimension(dimension)} className="p-1 text-[#7d8ba1] hover:text-[#ff6b8b]" title="Clear">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-[#30394c] bg-[#090c12] px-3 py-2 text-[11px] font-mono text-[#657188]">
            No Reality Engines selected yet. Pick individual cards below or hit SURPRISE ME and let the machine make a bad decision.
          </div>
        )}
      </div>

      <div className="border-b border-[#222a39] bg-[#090c12]">
        <div className="flex overflow-x-auto">
          {DIMENSIONS.map((dimension) => {
            const active = activeDimension === dimension;
            const picked = selectedByDimension.get(dimension);
            const locked = lockedDimensions.includes(dimension);
            const color = DIMENSION_COLORS[dimension];
            return (
              <button
                key={dimension}
                type="button"
                onClick={() => setActiveDimension(dimension)}
                className={'relative flex-none px-3 md:px-4 py-3 text-[10px] md:text-[11px] font-mono font-bold tracking-wide border-b-2 transition-colors ' + (active ? 'bg-[#121722] text-white' : 'border-transparent text-[#718096] hover:text-white')}
                style={active ? { borderBottomColor: color } : {}}
              >
                <span>{REALITY_DIMENSION_LABELS[dimension]}</span>
                {picked && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: '0 0 8px ' + color }} />}
                {locked && <Lock className="inline ml-1 w-2.5 h-2.5" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
          <div>
            <div className="font-mono font-black text-sm" style={{ color: DIMENSION_COLORS[activeDimension] }}>
              {REALITY_DIMENSION_LABELS[activeDimension]}
            </div>
            <p className="text-[10px] md:text-[11px] font-mono text-[#748198] max-w-3xl">
              {REALITY_DIMENSION_JURISDICTIONS[activeDimension]}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => randomizeDimension(activeDimension)} disabled={lockedDimensions.includes(activeDimension)} className="px-2.5 py-1.5 rounded-md border border-[#334155] text-[10px] font-mono text-[#a8b3c5] hover:text-white disabled:opacity-40 inline-flex items-center gap-1">
              <Dices className="w-3 h-3" /> RANDOM
            </button>
            <button type="button" onClick={() => toggleLock(activeDimension)} className="px-2.5 py-1.5 rounded-md border border-[#334155] text-[10px] font-mono text-[#a8b3c5] hover:text-white inline-flex items-center gap-1">
              {lockedDimensions.includes(activeDimension) ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              {lockedDimensions.includes(activeDimension) ? 'LOCKED' : 'LOCK'}
            </button>
          </div>
        </div>

        <label className="relative block mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5f6d83]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={'Search ' + REALITY_DIMENSION_LABELS[activeDimension].toLowerCase() + '...'}
            className="w-full rounded-lg border border-[#273044] bg-[#080a0f] pl-9 pr-9 py-2.5 text-xs font-mono text-white placeholder-[#526077] focus:outline-none focus:border-[#00f0ff]"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#657188] hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1">
          {visibleCards.map((engine) => {
            const active = selectedByDimension.get(engine.dimension)?.id === engine.id;
            const color = engine.accentColor || DIMENSION_COLORS[engine.dimension];
            return (
              <button
                key={engine.id}
                type="button"
                onClick={() => selectEngine(engine)}
                className={'group text-left rounded-xl border p-3.5 transition-all ' + (active ? 'bg-[#161321] text-white' : 'bg-[#0a0d13] border-[#242d3d] hover:bg-[#101520] hover:border-[#3a465c]')}
                style={active ? { borderColor: color, boxShadow: '0 0 18px ' + color + '22' } : {}}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-mono font-black text-xs leading-tight" style={{ color: active ? color : '#e5e7eb' }}>{engine.name}</div>
                  <span className="flex-none w-2 h-2 mt-0.5 rounded-full" style={{ backgroundColor: color, boxShadow: active ? '0 0 10px ' + color : 'none' }} />
                </div>
                <div className="mt-1 text-[10px] font-mono text-[#8b98aa]">{engine.subtitle}</div>
                <div className="mt-2 text-[11px] leading-relaxed text-[#b4bdca]">{engine.shortExplanation}</div>
                {engine.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {engine.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded border border-[#2a3343] bg-[#0c1017] px-1.5 py-0.5 text-[9px] font-mono text-[#718096]">{tag}</span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {visibleCards.length === 0 && (
          <div className="py-10 text-center font-mono text-xs text-[#64748b]">
            No reality card matched "{search}" in {REALITY_DIMENSION_LABELS[activeDimension]}.
          </div>
        )}

        {selected.length >= 2 && (
          <div className="mt-4 rounded-xl border border-[#30384a] bg-[#090c12] p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[9px] font-mono font-bold tracking-widest text-[#78869b]">CURRENT COLLISION</div>
                <div className="text-xs font-mono font-black text-white">{collisionReport.label}</div>
              </div>
              <div className="rounded-full border border-[#3a4558] px-2.5 py-1 text-[10px] font-mono text-[#b8c3d4]">
                friction {collisionReport.score > 0 ? '+' : ''}{collisionReport.score}
              </div>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed font-mono text-[#8d9aab]">{collisionReport.explanation}</p>
            {collisionReport.strongestPairs.length > 0 && (
              <div className="mt-2 space-y-1">
                {collisionReport.strongestPairs.map((pair, index) => (
                  <div key={pair.a + pair.b + index} className="text-[9px] font-mono text-[#66758a]">
                    <span className="text-[#aab6c7]">{pair.a}</span> × <span className="text-[#aab6c7]">{pair.b}</span>
                    {' — '}{pair.reasons[0]}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-3 text-right text-[9px] font-mono text-[#4f5c70]">
          {visibleCards.length} shown • {REALITY_ENGINES.length} total reality cards
        </div>
      </div>
    </section>
  );
}
