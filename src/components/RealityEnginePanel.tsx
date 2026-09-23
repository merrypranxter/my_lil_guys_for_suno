import React, { useMemo, useState } from 'react';
import { Dices, FlaskConical, Lock, Search, Shuffle, Sparkles, Trash2, Unlock, X } from 'lucide-react';
import { RealityChaosLevel, RealityDimension, RealityEngine } from '../types';
import {
  REALITY_DIMENSION_JURISDICTIONS,
  REALITY_DIMENSION_LABELS,
  REALITY_ENGINES,
  getRealityEngine,
  getRealityEnginesByDimension,
} from '../data/realityEngines';
import {
  REALITY_CHAOS_LABELS,
  analyzeRealityChemistry,
  buildSmartRealitySet,
  chooseSmartRealityEngine,
  seededRandom,
} from '../lib/realityChemistry';

interface RealityEnginePanelProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  chaosLevel: RealityChaosLevel;
  onChaosChange: (level: RealityChaosLevel) => void;
  preferenceWeights?: Record<string, number>;
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

const CHAOS_COLORS: Record<RealityChaosLevel, string> = {
  1: '#39ff14',
  2: '#00f0ff',
  3: '#ff8a00',
  4: '#ff0055',
};

function engineSearchText(engine: RealityEngine) {
  return [
    engine.name,
    engine.subtitle,
    engine.rule,
    engine.shortExplanation,
    ...(engine.tags || []),
  ].join(' ').toLowerCase();
}

function randomSeed(prefix: string, selectedIds: string[], chaosLevel: RealityChaosLevel) {
  return prefix + '|' + Date.now() + '|' + selectedIds.join('|') + '|chaos=' + chaosLevel;
}

export function RealityEnginePanel({
  selectedIds,
  onChange,
  chaosLevel,
  onChaosChange,
  preferenceWeights = {},
}: RealityEnginePanelProps) {
  const [activeDimension, setActiveDimension] = useState<RealityDimension>('format');
  const [search, setSearch] = useState('');
  const [lockedDimensions, setLockedDimensions] = useState<RealityDimension[]>([]);
  const [showChemistryDetails, setShowChemistryDetails] = useState(false);

  const selected = selectedIds
    .map((id) => getRealityEngine(id))
    .filter((engine): engine is RealityEngine => Boolean(engine));

  const selectedByDimension = useMemo(() => {
    const map = new Map<RealityDimension, RealityEngine>();
    selected.forEach((engine) => map.set(engine.dimension, engine));
    return map;
  }, [selectedIds.join('|')]);

  const chemistry = useMemo(() => analyzeRealityChemistry(selectedIds), [selectedIds.join('|')]);

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
    const rng = seededRandom(randomSeed('dimension:' + dimension, selectedIds, chaosLevel));
    const pick = chooseSmartRealityEngine(dimension, selectedIds, chaosLevel, rng, preferenceWeights);
    if (!pick) return;
    const withoutDimension = selectedIds.filter((id) => getRealityEngine(id)?.dimension !== dimension);
    onChange([...withoutDimension, pick.id]);
  };

  const toggleLock = (dimension: RealityDimension) => {
    setLockedDimensions((prev) =>
      prev.includes(dimension) ? prev.filter((item) => item !== dimension) : [...prev, dimension],
    );
  };

  const randomizeReality = () => {
    onChange(buildSmartRealitySet({
      currentIds: selectedIds,
      lockedDimensions,
      chaos: chaosLevel,
      dimensions: DIMENSIONS,
      seed: randomSeed('full', selectedIds, chaosLevel),
      preferenceWeights,
    }));
  };

  const surpriseMe = () => {
    const unlockedCount = DIMENSIONS.filter((dimension) => !lockedDimensions.includes(dimension)).length;
    const baseCount = chaosLevel === 1 ? 3 : chaosLevel === 2 ? 4 : chaosLevel === 3 ? 5 : 6;
    const wobble = Math.floor(Math.random() * 3);
    const count = Math.min(unlockedCount, baseCount + wobble);
    onChange(buildSmartRealitySet({
      currentIds: selectedIds,
      lockedDimensions,
      chaos: chaosLevel,
      dimensions: DIMENSIONS,
      count,
      seed: randomSeed('surprise', selectedIds, chaosLevel),
      preferenceWeights,
    }));
  };

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
              Smart combiner: preserve jurisdictions, measure chemistry, and choose collisions on purpose instead of making adjective soup.
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

        <div className="mt-4 rounded-xl border border-[#263044] bg-[#080b11] p-3 md:p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[9px] font-mono font-bold tracking-[0.18em] text-[#657188]">TEMPORARY CONSCIOUSNESS</div>
              <div className="mt-1 text-xs md:text-sm text-white leading-relaxed">{chemistry.narrator}</div>
            </div>
            <div className="flex-none text-left lg:text-right">
              <div className="font-mono text-[10px] tracking-wider" style={{ color: CHAOS_COLORS[chaosLevel] }}>
                {chemistry.label}
              </div>
              <div className="text-[10px] font-mono text-[#728095]">
                affinity {chemistry.affinity} · friction {chemistry.friction} · tension {chemistry.productiveTension}
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {([1, 2, 3, 4] as RealityChaosLevel[]).map((level) => {
              const active = chaosLevel === level;
              const meta = REALITY_CHAOS_LABELS[level];
              const color = CHAOS_COLORS[level];
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => onChaosChange(level)}
                  className={'rounded-lg border px-2 py-2 text-center transition-all ' + (active ? 'bg-[#151923]' : 'bg-[#0b0e14] border-[#283143] hover:border-[#45526a]')}
                  style={active ? { borderColor: color, boxShadow: '0 0 14px ' + color + '22' } : {}}
                  title={meta.short}
                >
                  <div className="text-[9px] md:text-[10px] font-mono font-black" style={{ color: active ? color : '#a4afbf' }}>{meta.name}</div>
                  <div className="hidden md:block mt-0.5 text-[8px] font-mono text-[#5f6d83]">{meta.short}</div>
                </button>
              );
            })}
          </div>

          {selected.length >= 2 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowChemistryDetails((value) => !value)}
                className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#8ea0b8] hover:text-white"
              >
                <FlaskConical className="w-3 h-3" />
                {showChemistryDetails ? 'HIDE COLLISION MAP' : 'SHOW COLLISION MAP'}
              </button>
              {showChemistryDetails && (
                <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <div className="rounded-lg border border-[#242d3d] bg-[#0b0e14] p-2.5">
                    <div className="text-[9px] font-mono font-bold text-[#ff9dea] mb-1">STRONGEST SEAMS</div>
                    {chemistry.pairNotes.length ? chemistry.pairNotes.map((note) => (
                      <div key={note} className="text-[9px] md:text-[10px] font-mono text-[#8c9aaf] leading-relaxed">• {note}</div>
                    )) : <div className="text-[10px] font-mono text-[#66758a]">No pair data yet.</div>}
                  </div>
                  <div className="rounded-lg border border-[#242d3d] bg-[#0b0e14] p-2.5">
                    <div className="text-[9px] font-mono font-bold text-[#00f0ff] mb-1">NEGOTIATION ORDERS</div>
                    {chemistry.directives.slice(0, 4).map((directive) => (
                      <div key={directive} className="text-[9px] md:text-[10px] font-mono text-[#8c9aaf] leading-relaxed">• {directive}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
            No Reality Engines selected. Pick cards or let the chemistry engine assemble a temporary consciousness.
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
              <Sparkles className="w-3 h-3" /> SMART ROLL
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
            const preference = preferenceWeights[engine.id] || 0;
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
                  <div className="flex items-center gap-1.5">
                    {preference > 0 && <span className="text-[8px] font-mono text-[#ffe680]" title="Star feedback has positively weighted this engine">★{Math.round(preference * 100)}</span>}
                    <span className="flex-none w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: active ? '0 0 10px ' + color : 'none' }} />
                  </div>
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

        <div className="mt-3 text-right text-[9px] font-mono text-[#4f5c70]">
          {visibleCards.length} shown • {REALITY_ENGINES.length} total reality cards
        </div>
      </div>
    </section>
  );
}
