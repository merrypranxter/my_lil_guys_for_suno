import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, FlaskConical, History, Info, Lock, Save, Shuffle, Search, Star, Trash2, Unlock, X } from 'lucide-react';
import { CompositionDimension, CompositionDomain, CompositionEngine, CompositionFavorite, CompositionPreset } from '../types';
import {
  COMPOSITION_DIMENSION_DOMAINS,
  COMPOSITION_DIMENSION_JURISDICTIONS,
  COMPOSITION_DIMENSION_LABELS,
  COMPOSITION_DIMENSION_LIMITS,
  COMPOSITION_DOMAIN_LABELS,
  COMPOSITION_ENGINES,
  getCompositionEngine,
  getCompositionEngines,
} from '../data/compositionEngines';
import {
  mutateCompositionSelection,
  randomizeAllComposition,
  randomizeCompositionDimension,
  randomizeCompositionDomain,
  sanitizeCompositionLocks,
} from '../lib/compositionRandomization';
import {
  deleteCompositionPreset,
  getCompositionFavorites,
  getCompositionPresets,
  getLockedCompositionEngineIds,
  getRecentCompositionBuilds,
  removeCompositionFavorite,
  saveCompositionPreset,
  setLockedCompositionEngineIds,
  upsertCompositionFavorite,
} from '../lib/localStorage';

interface CompositionLabPanelProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

const DOMAIN_ORDER: CompositionDomain[] = ['voice', 'signal', 'sonic', 'structure'];

const DIMENSION_ORDER: CompositionDimension[] = [
  'language',
  'languageMode',
  'addressee',
  'ensemble',
  'gesture',
  'transmission',
  'transduction',
  'recordingDamage',
  'technology',
  'soundSource',
  'tuning',
  'rhythmPhysics',
  'spatialAudio',
  'roleExchange',
  'temporal',
  'scale',
  'epistemology',
  'audience',
  'constraint',
  'economy',
  'failureMode',
  'controlAuthority',
  'prop',
];

const DOMAIN_ACCENTS: Record<CompositionDomain, string> = {
  voice: '#ff4fd8',
  signal: '#ffd24f',
  sonic: '#00f0ff',
  structure: '#a879ff',
};

function selectedCountForDimension(selectedIds: string[], dimension: CompositionDimension): number {
  return selectedIds.reduce((count, id) => {
    const engine = getCompositionEngine(id);
    return count + (engine?.dimension === dimension ? 1 : 0);
  }, 0);
}

function engineMatchesSearch(engine: CompositionEngine, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  return [
    engine.name,
    engine.subtitle,
    engine.shortExplanation,
    engine.rule,
    ...engine.tags,
  ].join(' ').toLowerCase().includes(q);
}

export function CompositionLabPanel({ selectedIds, onChange }: CompositionLabPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [activeDomain, setActiveDomain] = useState<CompositionDomain>('voice');
  const [activeDimension, setActiveDimension] = useState<CompositionDimension>('language');
  const [query, setQuery] = useState('');
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [detailEngineId, setDetailEngineId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [lockedIds, setLockedIds] = useState<string[]>(() => getLockedCompositionEngineIds());
  const [favorites, setFavorites] = useState<CompositionFavorite[]>(() => getCompositionFavorites());
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [presets, setPresets] = useState<CompositionPreset[]>(() => getCompositionPresets());
  const [presetName, setPresetName] = useState('');
  const [favoriteNoteEngineId, setFavoriteNoteEngineId] = useState<string | null>(null);
  const [favoriteNoteDraft, setFavoriteNoteDraft] = useState('');

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const lockedSet = useMemo(() => new Set(lockedIds), [lockedIds]);
  const favoriteSet = useMemo(() => new Set(favorites.map((item) => item.engineId)), [favorites]);
  const favoriteById = useMemo(
    () => new Map(favorites.map((item) => [item.engineId, item] as const)),
    [favorites]
  );
  const selectedEngines = useMemo(() => getCompositionEngines(selectedIds), [selectedIds]);
  const recentBuilds = getRecentCompositionBuilds(6);

  const dimensionsForDomain = useMemo(
    () => DIMENSION_ORDER.filter((dimension) => COMPOSITION_DIMENSION_DOMAINS[dimension] === activeDomain),
    [activeDomain]
  );

  const visibleEngines = useMemo(
    () => COMPOSITION_ENGINES.filter((engine) => {
      if (engine.dimension !== activeDimension) return false;
      if (selectedOnly && !selectedSet.has(engine.id)) return false;
      if (favoritesOnly && !favoriteSet.has(engine.id)) return false;
      return engineMatchesSearch(engine, query);
    }),
    [activeDimension, query, selectedOnly, favoritesOnly, selectedSet, favoriteSet]
  );

  const detailEngine = detailEngineId ? getCompositionEngine(detailEngineId) : undefined;

  useEffect(() => {
    setLockedIds((current) => {
      const next = sanitizeCompositionLocks(selectedIds, current);
      if (next.length === current.length && next.every((id, index) => id === current[index])) return current;
      return next;
    });
  }, [selectedIds]);

  useEffect(() => {
    setLockedCompositionEngineIds(lockedIds);
  }, [lockedIds]);

  const toggleLock = (engineId: string) => {
    if (!selectedSet.has(engineId)) return;
    setLockedIds((current) =>
      current.includes(engineId)
        ? current.filter((id) => id !== engineId)
        : [...current, engineId]
    );
    setNotice(null);
  };

  const toggleFavorite = (engine: CompositionEngine) => {
    const existing = favoriteById.get(engine.id);
    if (existing) {
      setFavorites(removeCompositionFavorite(engine.id));
      setNotice('Removed ' + engine.name + ' from favorites.');
      if (favoriteNoteEngineId === engine.id) setFavoriteNoteEngineId(null);
      return;
    }

    setFavorites(upsertCompositionFavorite(engine.id, ''));
    setFavoriteNoteEngineId(engine.id);
    setFavoriteNoteDraft('');
    setNotice('Starred ' + engine.name + '. Add an optional note so the generator knows what you liked about it.');
  };

  const openFavoriteNote = (engine: CompositionEngine) => {
    const existing = favoriteById.get(engine.id);
    if (!existing) {
      setFavorites(upsertCompositionFavorite(engine.id, ''));
    }
    setFavoriteNoteEngineId(engine.id);
    setFavoriteNoteDraft(existing?.note || '');
  };

  const saveFavoriteNote = () => {
    if (!favoriteNoteEngineId) return;
    const engine = getCompositionEngine(favoriteNoteEngineId);
    setFavorites(upsertCompositionFavorite(favoriteNoteEngineId, favoriteNoteDraft.trim()));
    setNotice(engine ? 'Saved why you like ' + engine.name + '.' : 'Saved favorite note.');
    setFavoriteNoteEngineId(null);
    setFavoriteNoteDraft('');
  };

  const saveCurrentPreset = () => {
    if (selectedIds.length === 0) {
      setNotice('Pick at least one Composition Lab engine before saving a preset.');
      return;
    }
    const next = saveCompositionPreset(presetName, selectedIds, lockedIds);
    setPresets(next);
    setPresetName('');
    setNotice('Saved Composition-only preset.');
  };

  const loadPreset = (preset: CompositionPreset) => {
    onChange(preset.compositionEngineIds);
    setLockedIds(sanitizeCompositionLocks(preset.compositionEngineIds, preset.lockedEngineIds));
    setNotice('Loaded preset: ' + preset.name);
  };

  const removePreset = (presetId: string) => {
    setPresets(deleteCompositionPreset(presetId));
    setNotice('Deleted Composition Lab preset.');
  };

  const loadRecentBuild = (engineIds: string[]) => {
    onChange(engineIds);
    setLockedIds([]);
    setNotice('Loaded Composition engines from a recent generated run.');
  };

  const changeDomain = (domain: CompositionDomain) => {
    setActiveDomain(domain);
    const firstDimension = DIMENSION_ORDER.find((dimension) => COMPOSITION_DIMENSION_DOMAINS[dimension] === domain);
    if (firstDimension) setActiveDimension(firstDimension);
    setQuery('');
    setSelectedOnly(false);
    setNotice(null);
  };

  const toggleEngine = (engine: CompositionEngine) => {
    setNotice(null);

    if (selectedSet.has(engine.id)) {
      onChange(selectedIds.filter((id) => id !== engine.id));
      setLockedIds((current) => current.filter((id) => id !== engine.id));
      return;
    }

    const limit = COMPOSITION_DIMENSION_LIMITS[engine.dimension];
    const used = selectedCountForDimension(selectedIds, engine.dimension);

    if (used >= limit) {
      const oldestUnlocked = selectedIds.find((id) => {
        const selectedEngine = getCompositionEngine(id);
        return selectedEngine?.dimension === engine.dimension && !lockedSet.has(id);
      });

      if (!oldestUnlocked) {
        setNotice(
          COMPOSITION_DIMENSION_LABELS[engine.dimension] +
            ' is full and every active engine there is locked. Unlock one to replace it.'
        );
        return;
      }

      onChange([
        ...selectedIds.filter((id) => id !== oldestUnlocked),
        engine.id,
      ]);
      setLockedIds((current) => current.filter((id) => id !== oldestUnlocked));
      setNotice('Replaced the oldest unlocked ' + COMPOSITION_DIMENSION_LABELS[engine.dimension] + ' engine.');
      return;
    }

    onChange([...selectedIds, engine.id]);
  };

  const clearDimension = (dimension: CompositionDimension) => {
    const removed = new Set(
      selectedIds.filter((id) => getCompositionEngine(id)?.dimension === dimension)
    );
    onChange(
      selectedIds.filter((id) => {
        const engine = getCompositionEngine(id);
        return engine?.dimension !== dimension;
      })
    );
    setLockedIds((current) => current.filter((id) => !removed.has(id)));
    setNotice(null);
  };

  const clearAll = () => {
    onChange([]);
    setLockedIds([]);
    setNotice(null);
  };

  const applyRandomized = (nextIds: string[], message: string) => {
    const normalizedLocks = sanitizeCompositionLocks(nextIds, lockedIds);
    onChange(nextIds);
    setLockedIds(normalizedLocks);
    setNotice(message);
  };

  const randomizeDimension = () => {
    const next = randomizeCompositionDimension(selectedIds, lockedIds, activeDimension);
    applyRandomized(next, 'Randomized ' + COMPOSITION_DIMENSION_LABELS[activeDimension] + '. Locked engines stayed put.');
  };

  const randomizeCabinet = () => {
    const next = randomizeCompositionDomain(selectedIds, lockedIds, activeDomain);
    applyRandomized(next, 'Randomized ' + COMPOSITION_DOMAIN_LABELS[activeDomain] + '. Locked engines stayed put.');
  };

  const randomizeAll = () => {
    const next = randomizeAllComposition(selectedIds, lockedIds);
    applyRandomized(next, selectedIds.length
      ? 'Randomized the active build while preserving its occupied dimensions and every lock.'
      : 'Seeded a balanced random build across all four cabinets.');
  };

  const mutateBuild = () => {
    const next = mutateCompositionSelection(selectedIds, lockedIds);
    applyRandomized(next, selectedIds.length
      ? 'Mutated a small slice of the build. Most of it stayed intact; locks were untouched.'
      : 'No build existed, so MUTATE seeded a balanced random build.');
  };

  const groupedSelected = useMemo(() => {
    return DIMENSION_ORDER.map((dimension) => ({
      dimension,
      engines: selectedEngines.filter((engine) => engine.dimension === dimension),
    })).filter((group) => group.engines.length > 0);
  }, [selectedEngines]);

  const currentUsed = selectedCountForDimension(selectedIds, activeDimension);
  const currentLimit = COMPOSITION_DIMENSION_LIMITS[activeDimension];

  return (
    <section className="rounded-2xl border border-[#252d3b] bg-[#0d1017] shadow-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="w-full px-4 md:px-5 py-4 flex items-center justify-between gap-4 text-left bg-gradient-to-r from-[#111521] via-[#11101d] to-[#10151d] hover:from-[#151a28] transition-colors"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-[#00f0ff] flex-shrink-0" />
            <h2 className="font-mono font-black tracking-[0.12em] text-sm md:text-base text-white">
              COMPOSITION LAB
            </h2>
            <span className="rounded-full border border-[#39445a] bg-[#090b10] px-2 py-0.5 text-[10px] font-mono text-[#aeb8c8]">
              {COMPOSITION_ENGINES.length} ENGINES
            </span>
            {selectedIds.length > 0 && (
              <span className="rounded-full border border-[#ff4fd8]/50 bg-[#ff4fd8]/10 px-2 py-0.5 text-[10px] font-mono font-bold text-[#ff9dea]">
                {selectedIds.length} ACTIVE
              </span>
            )}
            {lockedIds.length > 0 && (
              <span className="rounded-full border border-[#ffe680]/50 bg-[#ffe680]/10 px-2 py-0.5 text-[10px] font-mono font-bold text-[#ffe680]">
                {lockedIds.length} LOCKED
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] md:text-xs font-mono text-[#7d8ba1]">
            Open the cabinets. Choose physical rules for voice, signal, sound, time, resources, failure, and control.
          </p>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-[#7d8ba1]" /> : <ChevronDown className="w-5 h-5 text-[#7d8ba1]" />}
      </button>

      {expanded && (
        <div className="p-4 md:p-5 space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {DOMAIN_ORDER.map((domain) => {
              const active = domain === activeDomain;
              const count = selectedEngines.filter((engine) => engine.domain === domain).length;
              const accent = DOMAIN_ACCENTS[domain];
              return (
                <button
                  key={domain}
                  type="button"
                  onClick={() => changeDomain(domain)}
                  className={
                    'rounded-xl border px-3 py-3 text-left transition-all font-mono ' +
                    (active
                      ? 'bg-[#151a24] border-white/25 shadow-lg'
                      : 'bg-[#090c12] border-[#232b3d] hover:border-[#46536b]')
                  }
                  style={active ? { boxShadow: '0 0 18px ' + accent + '22', borderColor: accent + '88' } : undefined}
                >
                  <div className="text-[11px] md:text-xs font-black tracking-wider" style={{ color: accent }}>
                    {COMPOSITION_DOMAIN_LABELS[domain]}
                  </div>
                  <div className="mt-1 text-[10px] text-[#778397]">
                    {count > 0 ? count + ' active' : 'nothing selected'}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {dimensionsForDomain.map((dimension) => {
              const active = dimension === activeDimension;
              const used = selectedCountForDimension(selectedIds, dimension);
              const limit = COMPOSITION_DIMENSION_LIMITS[dimension];

              return (
                <button
                  key={dimension}
                  type="button"
                  onClick={() => {
                    setActiveDimension(dimension);
                    setQuery('');
                    setSelectedOnly(false);
                    setNotice(null);
                  }}
                  className={
                    'flex-shrink-0 rounded-lg border px-3 py-2 font-mono text-[10px] md:text-[11px] transition-colors ' +
                    (active
                      ? 'bg-[#18202b] border-[#00f0ff]/70 text-white'
                      : 'bg-[#090c12] border-[#232b3d] text-[#8c98aa] hover:text-white hover:border-[#46536b]')
                  }
                >
                  {COMPOSITION_DIMENSION_LABELS[dimension]}
                  <span className={used > 0 ? 'ml-2 text-[#39ff14]' : 'ml-2 text-[#556177]'}>
                    {used}/{limit}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-[#232b3d] bg-[#090c12] p-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-xs font-bold text-white">
                  {COMPOSITION_DIMENSION_LABELS[activeDimension]}
                  <span className="ml-2 text-[#6f7d92] font-normal">
                    {currentUsed}/{currentLimit}
                  </span>
                </div>
                <p className="mt-1 text-[10px] md:text-[11px] leading-relaxed font-mono text-[#768399]">
                  {COMPOSITION_DIMENSION_JURISDICTIONS[activeDimension]}
                </p>
              </div>

              {currentUsed > 0 && (
                <button
                  type="button"
                  onClick={() => clearDimension(activeDimension)}
                  className="self-start md:self-auto rounded-lg border border-[#5b2832] bg-[#2a1118] px-3 py-2 text-[10px] font-mono text-[#fca5a5] hover:border-[#ef4444]"
                >
                  CLEAR DIMENSION
                </button>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[#2a3345] bg-[#090c12] p-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={randomizeDimension}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#00f0ff]/40 bg-[#06202a] px-3 py-2 text-[10px] font-mono font-black text-[#74f7ff] hover:border-[#00f0ff]"
              >
                <Shuffle className="w-3.5 h-3.5" />
                RANDOMIZE DIMENSION
              </button>
              <button
                type="button"
                onClick={randomizeCabinet}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#ff4fd8]/40 bg-[#251023] px-3 py-2 text-[10px] font-mono font-black text-[#ff9dea] hover:border-[#ff4fd8]"
              >
                <Shuffle className="w-3.5 h-3.5" />
                RANDOMIZE CABINET
              </button>
              <button
                type="button"
                onClick={randomizeAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#ffe680]/40 bg-[#27200b] px-3 py-2 text-[10px] font-mono font-black text-[#ffe680] hover:border-[#ffe680]"
              >
                <Shuffle className="w-3.5 h-3.5" />
                RANDOMIZE ALL
              </button>
              <button
                type="button"
                onClick={mutateBuild}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#a879ff]/50 bg-[#1b102b] px-3 py-2 text-[10px] font-mono font-black text-[#c7a8ff] hover:border-[#a879ff]"
              >
                <Shuffle className="w-3.5 h-3.5" />
                MUTATE CURRENT BUILD
              </button>
            </div>
            <p className="mt-2 text-[10px] font-mono text-[#657287]">
              Lock anything you love. Randomizers never replace locked engines. MUTATE changes only a small fraction of the unlocked build.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748b]" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={'Search ' + COMPOSITION_DIMENSION_LABELS[activeDimension].toLowerCase() + '...'}
                className="w-full rounded-lg border border-[#232b3d] bg-[#080a0f] py-2.5 pl-9 pr-3 text-xs font-mono text-white placeholder-[#556177] focus:outline-none focus:border-[#00f0ff]"
              />
            </label>

            <button
              type="button"
              onClick={() => setSelectedOnly((value) => !value)}
              className={
                'rounded-lg border px-3 py-2.5 text-[10px] font-mono font-bold transition-colors ' +
                (selectedOnly
                  ? 'border-[#39ff14]/70 bg-[#39ff14]/10 text-[#8dff78]'
                  : 'border-[#232b3d] bg-[#080a0f] text-[#7d8ba1] hover:text-white')
              }
            >
              SELECTED ONLY
            </button>
            <button
              type="button"
              onClick={() => setFavoritesOnly((value) => !value)}
              className={
                'inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-[10px] font-mono font-bold transition-colors ' +
                (favoritesOnly
                  ? 'border-[#ffd84d]/70 bg-[#2d2508] text-[#ffe680]'
                  : 'border-[#232b3d] bg-[#080a0f] text-[#7d8ba1] hover:text-white')
              }
            >
              <Star className="w-3.5 h-3.5" fill={favoritesOnly ? 'currentColor' : 'none'} />
              FAVORITES ONLY
            </button>
          </div>

          {notice && (
            <div className="flex items-start justify-between gap-3 rounded-lg border border-[#854d0e] bg-[#241b0c] px-3 py-2.5 text-[11px] font-mono text-[#fde68a]">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss composition notice">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[640px] overflow-y-auto pr-1">
            {visibleEngines.map((engine) => {
              const selected = selectedSet.has(engine.id);
              const accent = engine.accentColor || DOMAIN_ACCENTS[engine.domain];

              return (
                <div
                  key={engine.id}
                  className={
                    'rounded-xl border p-3.5 transition-all ' +
                    (selected
                      ? 'bg-[#141924] border-white/25'
                      : 'bg-[#090c12] border-[#232b3d] hover:border-[#46536b]')
                  }
                  style={selected ? { borderColor: accent + '99', boxShadow: '0 0 14px ' + accent + '1f' } : undefined}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => toggleEngine(engine)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="font-mono font-black text-xs tracking-wide" style={{ color: selected ? accent : '#f8fafc' }}>
                        {engine.name}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-[#8d99aa]">
                        {engine.subtitle}
                      </div>
                    </button>

                    <div className="flex flex-shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleFavorite(engine)}
                        className={
                          'p-1.5 rounded-md border transition-colors ' +
                          (favoriteSet.has(engine.id)
                            ? 'border-[#ffd84d]/60 bg-[#2d2508] text-[#ffe680]'
                            : 'border-[#273247] text-[#8290a5] hover:text-[#ffe680] hover:border-[#ffd84d]')
                        }
                        aria-label={(favoriteSet.has(engine.id) ? 'Unfavorite ' : 'Favorite ') + engine.name}
                        title={favoriteSet.has(engine.id) ? 'Remove from favorites' : 'Star this engine'}
                      >
                        <Star className="w-3.5 h-3.5" fill={favoriteSet.has(engine.id) ? 'currentColor' : 'none'} />
                      </button>
                      {favoriteSet.has(engine.id) && (
                        <button
                          type="button"
                          onClick={() => openFavoriteNote(engine)}
                          className="p-1.5 rounded-md border border-[#273247] text-[#8290a5] hover:text-white hover:border-[#ff4fd8]"
                          aria-label={'Edit favorite note for ' + engine.name}
                          title="Why do you like this?"
                        >
                          <span className="text-[10px] font-mono font-black">✎</span>
                        </button>
                      )}
                      {selected && (
                        <button
                          type="button"
                          onClick={() => toggleLock(engine.id)}
                          className={
                            'p-1.5 rounded-md border transition-colors ' +
                            (lockedSet.has(engine.id)
                              ? 'border-[#ffe680]/60 bg-[#332b0d] text-[#ffe680]'
                              : 'border-[#273247] text-[#8290a5] hover:text-white hover:border-[#ffe680]')
                          }
                          aria-label={(lockedSet.has(engine.id) ? 'Unlock ' : 'Lock ') + engine.name}
                          title={lockedSet.has(engine.id) ? 'Unlock for randomization' : 'Protect from randomization'}
                        >
                          {lockedSet.has(engine.id) ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDetailEngineId(engine.id)}
                        className="p-1.5 rounded-md border border-[#273247] text-[#8290a5] hover:text-white hover:border-[#00f0ff]"
                        aria-label={'Show details for ' + engine.name}
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleEngine(engine)}
                    className="mt-3 block w-full text-left"
                  >
                    <p className="text-[10px] md:text-[11px] leading-relaxed text-[#98a4b7]">
                      {engine.shortExplanation}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {engine.tags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[#253047] bg-[#0d111a] px-2 py-0.5 text-[9px] font-mono text-[#6f7d92]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div
                      className={
                        'mt-3 rounded-md px-2.5 py-1.5 text-center text-[10px] font-mono font-black ' +
                        (selected
                          ? 'bg-[#142518] text-[#8dff78] border border-[#2c6a37]'
                          : 'bg-[#111622] text-[#8d99aa] border border-[#273247]')
                      }
                    >
                      {selected ? (lockedSet.has(engine.id) ? 'ACTIVE + LOCKED — TAP TO REMOVE' : 'ACTIVE — TAP TO REMOVE') : 'TAP TO ADD'}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {visibleEngines.length === 0 && (
            <div className="py-10 text-center rounded-xl border border-dashed border-[#283247] bg-[#090c12] text-xs font-mono text-[#657287]">
              No engines match this view.
            </div>
          )}

          <div className="rounded-xl border border-[#2b3343] bg-[#0a0d13] overflow-hidden">
            <div className="px-3.5 py-3 border-b border-[#232b3d] flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-mono font-black text-xs text-[#ffe680]">
                  ACTIVE BUILD — {selectedIds.length} ENGINE{selectedIds.length === 1 ? '' : 'S'}
                </div>
                <div className="text-[10px] font-mono text-[#66758b] mt-0.5">
                  These IDs already flow into generation, saves, archive, and fallback.
                </div>
              </div>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#5b2832] bg-[#2a1118] px-2.5 py-1.5 text-[10px] font-mono text-[#fca5a5] hover:border-[#ef4444]"
                >
                  <Trash2 className="w-3 h-3" />
                  CLEAR ALL
                </button>
              )}
            </div>

            {groupedSelected.length > 0 ? (
              <div className="p-3 space-y-3">
                {groupedSelected.map(({ dimension, engines }) => (
                  <div key={dimension}>
                    <div className="mb-1.5 flex items-center gap-2 text-[9px] font-mono font-black tracking-widest text-[#68788f]">
                      {COMPOSITION_DIMENSION_LABELS[dimension]}
                      <span>{engines.length}/{COMPOSITION_DIMENSION_LIMITS[dimension]}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {engines.map((engine) => (
                        <div
                          key={engine.id}
                          className={
                            'inline-flex items-center rounded-full border bg-[#121824] text-[10px] font-mono text-[#d6deea] ' +
                            (lockedSet.has(engine.id) ? 'border-[#ffe680]/60' : 'border-[#3a465b]')
                          }
                        >
                          <button
                            type="button"
                            onClick={() => toggleLock(engine.id)}
                            className="pl-2.5 pr-1.5 py-1.5 text-[#8d99aa] hover:text-[#ffe680]"
                            title={lockedSet.has(engine.id) ? 'Unlock for randomization' : 'Protect from randomization'}
                            aria-label={(lockedSet.has(engine.id) ? 'Unlock ' : 'Lock ') + engine.name}
                          >
                            {lockedSet.has(engine.id) ? <Lock className="w-3 h-3 text-[#ffe680]" /> : <Unlock className="w-3 h-3" />}
                          </button>
                          <span className="py-1.5">{engine.name}</span>
                          <button
                            type="button"
                            onClick={() => toggleEngine(engine)}
                            className="pl-1.5 pr-2.5 py-1.5 text-[#7d8ba1] hover:text-[#ff8fab]"
                            title="Remove from active build"
                            aria-label={'Remove ' + engine.name}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-[11px] font-mono text-[#64748b]">
                No active Composition Lab engines yet. Pick some weird shit.
              </div>
            )}
          </div>
        </div>
      )}

      {detailEngine && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setDetailEngineId(null);
          }}
        >
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-[#39445a] bg-[#0c1017] shadow-2xl">
            <div className="sticky top-0 bg-[#0c1017]/95 backdrop-blur border-b border-[#252d3b] p-4 md:p-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-[9px] font-mono font-black tracking-[0.16em] text-[#718097]">
                  {COMPOSITION_DOMAIN_LABELS[detailEngine.domain]} • {COMPOSITION_DIMENSION_LABELS[detailEngine.dimension]}
                </div>
                <h3 className="mt-1 text-base md:text-lg font-mono font-black text-white">
                  {detailEngine.name}
                </h3>
                <p className="mt-1 text-xs font-mono text-[#8d99aa]">{detailEngine.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailEngineId(null)}
                className="p-1.5 text-[#7d8ba1] hover:text-white"
                aria-label="Close Composition Lab detail"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 md:p-5 space-y-4">
              <div>
                <div className="text-[10px] font-mono font-black tracking-wider text-[#ff9dea]">WHAT IT DOES</div>
                <p className="mt-1.5 text-sm leading-relaxed text-[#d0d8e5]">{detailEngine.shortExplanation}</p>
              </div>

              <div>
                <div className="text-[10px] font-mono font-black tracking-wider text-[#00f0ff]">FULL OPERATIONAL RULE</div>
                <p className="mt-1.5 rounded-xl border border-[#253047] bg-[#080b10] p-3.5 text-xs md:text-sm leading-relaxed font-mono text-[#b9c4d5]">
                  {detailEngine.rule}
                </p>
              </div>

              <div>
                <div className="text-[10px] font-mono font-black tracking-wider text-[#ffe680]">JURISDICTION</div>
                <p className="mt-1.5 text-xs leading-relaxed font-mono text-[#8795a9]">
                  {COMPOSITION_DIMENSION_JURISDICTIONS[detailEngine.dimension]}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {detailEngine.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-[#2a364c] bg-[#111722] px-2.5 py-1 text-[10px] font-mono text-[#8190a5]">
                    {tag}
                  </span>
                ))}
              </div>

              {selectedSet.has(detailEngine.id) && (
                <button
                  type="button"
                  onClick={() => toggleLock(detailEngine.id)}
                  className={
                    'w-full rounded-xl border px-4 py-3 font-mono font-black text-xs transition-colors ' +
                    (lockedSet.has(detailEngine.id)
                      ? 'border-[#ffe680]/60 bg-[#332b0d] text-[#ffe680] hover:border-[#ffe680]'
                      : 'border-[#3a465b] bg-[#121824] text-[#cbd5e1] hover:border-[#ffe680]')
                  }
                >
                  {lockedSet.has(detailEngine.id) ? '🔒 LOCKED — TAP TO UNLOCK' : 'UNLOCKED — PROTECT FROM RANDOMIZATION'}
                </button>
              )}

              <button
                type="button"
                onClick={() => toggleEngine(detailEngine)}
                className={
                  'w-full rounded-xl border px-4 py-3 font-mono font-black text-xs transition-colors ' +
                  (selectedSet.has(detailEngine.id)
                    ? 'border-[#7f1d1d] bg-[#2b1216] text-[#fca5a5] hover:border-[#ef4444]'
                    : 'border-[#166534] bg-[#102417] text-[#86efac] hover:border-[#39ff14]')
                }
              >
                {selectedSet.has(detailEngine.id) ? 'REMOVE FROM ACTIVE BUILD' : 'ADD TO ACTIVE BUILD'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
