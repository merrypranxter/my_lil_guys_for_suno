import React, { useState, useEffect } from 'react';
import { LITTLE_GUYS } from './data/littleGuys';
import { ArchivedRun, LittleGuy, BoxType, SavedStack, GenerationResponse } from './types';
import { generateProceduralTrack, clampAndPad, TARGETS } from './lib/proceduralGenerator';
import { Header } from './components/Header';
import { GuyCard } from './components/GuyCard';
import { StackPanel } from './components/StackPanel';
import { ControlsPanel } from './components/ControlsPanel';
import { OutputBox } from './components/OutputBox';
import {
  getLastStack,
  setLastStack,
  getSavedEnergy,
  setSavedEnergy,
  getSavedSeed,
  setSavedSeed,
  getSavedStacks,
  saveStackToFavorites,
  deleteSavedStack,
  getRunArchive,
  saveGeneratedRun,
  updateArchivedRun,
  getRecentFingerprints,
  getLikedPreferenceSignals,
  runToMarkdown,
  archiveToMarkdown,
} from './lib/localStorage';
import { AlertCircle, Archive, Download, Layers, MessageSquare, Sparkles, Star, X } from 'lucide-react';

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [modelName, setModelName] = useState('gemini-3.1-flash-lite');
  const [hasApiKey, setHasApiKey] = useState(true);

  const [stackGuyIds, setStackGuyIds] = useState<string[]>(() => {
    const saved = getLastStack();
    if (saved && saved.length > 0) return saved;
    return ['taxonomy-goblin', 'recall-mold', 'cosmic-clerk'];
  });

  const [savedStacks, setSavedStacks] = useState<SavedStack[]>(() => getSavedStacks());
  const [seed, setSeed] = useState<string>(() => getSavedSeed());
  const [energy, setEnergy] = useState<number>(() => getSavedEnergy());

  const [outputs, setOutputs] = useState({
    style: '',
    lyrics: '',
    caption: '',
  });

  const [currentRun, setCurrentRun] = useState<ArchivedRun | null>(null);
  const [archiveCount, setArchiveCount] = useState(() => getRunArchive().length);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackDraft, setFeedbackDraft] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [repairingBox, setRepairingBox] = useState<BoxType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/info')
      .then(async (res) => {
        const text = await res.text();
        return JSON.parse(text);
      })
      .then((data) => {
        if (data.model) setModelName(data.model);
        if (typeof data.hasApiKey === 'boolean') setHasApiKey(data.hasApiKey);
      })
      .catch(() => {
        // Dev server / offline fallback
      });
  }, []);

  useEffect(() => {
    setLastStack(stackGuyIds);
  }, [stackGuyIds]);

  const handleSeedChange = (newSeed: string) => {
    setSeed(newSeed);
    setSavedSeed(newSeed);
  };

  const handleEnergyChange = (level: number) => {
    setEnergy(level);
    setSavedEnergy(level);
  };

  const handleToggleGuy = (guyId: string) => {
    setStackGuyIds((prev) => {
      if (prev.includes(guyId)) return prev.filter((id) => id !== guyId);
      return [...prev, guyId];
    });
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setStackGuyIds((prev) => {
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleRemove = (guyId: string) => {
    setStackGuyIds((prev) => prev.filter((id) => id !== guyId));
  };

  const handleClear = () => {
    setStackGuyIds([]);
  };

  const handleRollOne = () => {
    const randomGuy = LITTLE_GUYS[Math.floor(Math.random() * LITTLE_GUYS.length)];
    setStackGuyIds([randomGuy.id]);
  };

  const handleRollStack = () => {
    const count = Math.floor(Math.random() * 3) + 2;
    const shuffled = [...LITTLE_GUYS].sort(() => 0.5 - Math.random());
    setStackGuyIds(shuffled.slice(0, count).map((g) => g.id));
  };

  const handleFuckMeUp = () => {
    const count = Math.floor(Math.random() * 3) + 3;
    const shuffled = [...LITTLE_GUYS].sort(() => 0.5 - Math.random());
    const chosen: LittleGuy[] = [];
    const usedJurisdictions = new Set<string>();

    for (const guy of shuffled) {
      if (!usedJurisdictions.has(guy.defaultJurisdiction)) {
        chosen.push(guy);
        usedJurisdictions.add(guy.defaultJurisdiction);
      }
      if (chosen.length >= count) break;
    }

    if (chosen.length < count) {
      for (const guy of shuffled) {
        if (!chosen.some((c) => c.id === guy.id)) chosen.push(guy);
        if (chosen.length >= count) break;
      }
    }

    setStackGuyIds(chosen.map((g) => g.id));
  };

  const handleSaveStack = (name: string) => {
    setSavedStacks(saveStackToFavorites(name, stackGuyIds));
  };

  const handleLoadSavedStack = (saved: SavedStack) => {
    setStackGuyIds(saved.guyIds);
  };

  const handleDeleteSavedStack = (id: string) => {
    setSavedStacks(deleteSavedStack(id));
  };

  const archiveGeneration = (data: GenerationResponse, effectiveModel: string) => {
    const style = data.style || '';
    const lyrics = data.lyrics || '';
    const caption = data.caption || '';
    const run = saveGeneratedRun({
      guyIds: [...stackGuyIds],
      seed,
      energy,
      model: effectiveModel,
      style,
      lyrics,
      caption,
      charCounts: data.charCounts || {
        style: style.length,
        lyrics: lyrics.length,
        caption: caption.length,
      },
      fingerprint: data.fingerprint,
    });
    setCurrentRun(run);
    setArchiveCount(getRunArchive().length);
  };

  const handleGenerate = async () => {
    if (stackGuyIds.length === 0 || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setCurrentRun(null);

    const recentFingerprints = getRecentFingerprints(12);
    const likedSignals = getLikedPreferenceSignals(10);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guyIds: stackGuyIds,
          seed,
          energy,
          recentFingerprints,
          likedSignals,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const rawText = await response.text();
      let data: GenerationResponse & { notice?: string };

      try {
        data = JSON.parse(rawText);
      } catch {
        if (!response.ok) throw new Error('Server returned HTTP ' + response.status + '. Please try again.');
        throw new Error('Server returned an unreadable response format.');
      }

      if (!response.ok) throw new Error(data?.error || 'HTTP error ' + response.status);

      const effectiveModel = data.model || modelName;
      if (data.model) setModelName(data.model);

      setOutputs({
        style: data.style || '',
        lyrics: data.lyrics || '',
        caption: data.caption || '',
      });
      archiveGeneration(data, effectiveModel);

      if (data.notice) setErrorMessage(data.notice);

      setTimeout(() => {
        document.getElementById('output-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn('Primary generation interrupted, deploying Little Guy engine:', err?.message || err);

      const isAbort = err.name === 'AbortError' || err.message?.includes('aborted');
      const isNetworkOrPattern =
        err.name === 'TypeError' ||
        err.message?.includes('Load failed') ||
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('pattern') ||
        err.message?.includes('NetworkError');

      if (isNetworkOrPattern || isAbort || err.message?.includes('high demand') || err.message?.includes('quota')) {
        try {
          const fallback = generateProceduralTrack({
            guyIds: stackGuyIds,
            seed,
            energy,
            recentFingerprints,
          });
          const fallbackResponse: GenerationResponse = {
            style: fallback.style,
            lyrics: fallback.lyrics,
            caption: fallback.caption,
            fingerprint: fallback.fingerprint,
            model: 'procedural-synthesizer',
            charCounts: {
              style: fallback.style.length,
              lyrics: fallback.lyrics.length,
              caption: fallback.caption.length,
            },
          };
          setModelName('procedural-synthesizer');
          setOutputs({
            style: fallback.style,
            lyrics: fallback.lyrics,
            caption: fallback.caption,
          });
          archiveGeneration(fallbackResponse, 'procedural-synthesizer');
          setErrorMessage('Notice: Output synthesized using the diverse Little Guy procedural engine.');
          return;
        } catch (localErr) {
          console.error('Local fallback failed:', localErr);
        }
      }

      const friendlyMsg = isAbort
        ? 'Generation timed out. Please try again with a smaller stack or single guy.'
        : isNetworkOrPattern
        ? 'Network connection interrupted. Please click Generate again.'
        : err.message || 'Generation failed. Please try again.';
      setErrorMessage(friendlyMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const persistRepairToArchive = (type: BoxType, repairedText: string) => {
    if (!currentRun) return;
    const patch: any = {
      charCounts: {
        ...currentRun.charCounts,
        [type]: repairedText.length,
      },
    };
    patch[type] = repairedText;
    const updated = updateArchivedRun(currentRun.id, patch);
    if (updated) setCurrentRun(updated);
  };

  const handleRepairBox = async (type: BoxType) => {
    const currentText = outputs[type];
    if (!currentText || repairingBox) return;

    setRepairingBox(type);
    setErrorMessage(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch('/api/repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boxType: type, currentText }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const rawText = await response.text();
      let data: any = null;

      try {
        data = JSON.parse(rawText);
      } catch {
        if (!response.ok) throw new Error('Server returned HTTP ' + response.status);
        throw new Error('Server returned an unreadable response format.');
      }

      if (!response.ok) throw new Error(data?.error || 'HTTP repair error ' + response.status);

      if (data.model && data.model !== 'calibrator-engine') setModelName(data.model);
      if (data.repairedText) {
        setOutputs((prev) => ({ ...prev, [type]: data.repairedText }));
        persistRepairToArchive(type, data.repairedText);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn('Network/API repair unavailable; applying local algorithmic calibration:', err?.message || err);

      const target = TARGETS[type];
      if (target) {
        const paddingSnippet = '[CALIBRATION INVARIANT: Maintaining operational trajectory for ' + type.toUpperCase() + '. Baseline protocol sustained.]';
        const calibrated = clampAndPad(currentText, target.min, target.max, paddingSnippet);
        setOutputs((prev) => ({ ...prev, [type]: calibrated }));
        persistRepairToArchive(type, calibrated);
        setErrorMessage('Calibrated ' + type.toUpperCase() + ' to ' + calibrated.length + ' characters (Target: ' + target.min + '–' + target.max + ').');
      } else {
        setErrorMessage('Failed to calibrate ' + type + ' length: ' + err.message);
      }
    } finally {
      setRepairingBox(null);
    }
  };

  const openFeedback = () => {
    if (!currentRun) return;
    setFeedbackDraft(currentRun.feedback || '');
    setFeedbackOpen(true);
  };

  const savePositiveFeedback = () => {
    if (!currentRun) return;
    const updated = updateArchivedRun(currentRun.id, {
      starred: true,
      feedback: feedbackDraft.trim(),
    });
    if (updated) setCurrentRun(updated);
    setFeedbackOpen(false);
  };

  const unstarCurrent = () => {
    if (!currentRun) return;
    const updated = updateArchivedRun(currentRun.id, { starred: false });
    if (updated) setCurrentRun(updated);
    setFeedbackOpen(false);
  };

  const exportCurrent = () => {
    if (!currentRun) return;
    const stamp = new Date(currentRun.createdAt).toISOString().replace(/[:.]/g, '-');
    downloadText('little-guy-run-' + stamp + '.md', runToMarkdown(currentRun));
  };

  const exportAll = () => {
    const runs = getRunArchive();
    const stamp = new Date().toISOString().slice(0, 10);
    downloadText('little-guy-machine-archive-' + stamp + '.md', archiveToMarkdown(runs));
  };

  const activeStackGuys: LittleGuy[] = stackGuyIds
    .map((id) => LITTLE_GUYS.find((g) => g.id === id))
    .filter((g): g is LittleGuy => Boolean(g));

  const filteredGuys = LITTLE_GUYS.filter((guy) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      guy.name.toLowerCase().includes(q) ||
      guy.subtitle.toLowerCase().includes(q) ||
      guy.rule.toLowerCase().includes(q) ||
      guy.defaultJurisdiction.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-[#e0e6ed]">
      <Header modelName={modelName} hasApiKey={hasApiKey} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8 space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#2b1216] border border-[#7f1d1d] text-[#fca5a5] flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm font-mono shadow-lg animate-shake">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#ef4444]" />
              <span>{errorMessage}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-3 py-1 bg-[#ef4444] text-black font-bold rounded hover:bg-[#f87171] transition-colors disabled:opacity-50"
              >
                Retry Now
              </button>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-white hover:underline text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <StackPanel
              stackGuys={activeStackGuys}
              onReorder={handleReorder}
              onRemove={handleRemove}
              onClear={handleClear}
              onRollOne={handleRollOne}
              onRollStack={handleRollStack}
              onFuckMeUp={handleFuckMeUp}
              savedStacks={savedStacks}
              onSaveStack={handleSaveStack}
              onLoadSavedStack={handleLoadSavedStack}
              onDeleteSavedStack={handleDeleteSavedStack}
            />
          </div>

          <div className="lg:col-span-5">
            <ControlsPanel
              seed={seed}
              onSeedChange={handleSeedChange}
              energy={energy}
              onEnergyChange={handleEnergyChange}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              canGenerate={stackGuyIds.length > 0}
            />
          </div>
        </div>

        <div id="output-section" className="space-y-4 pt-4 border-t border-[#1a202c]">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-3">
            <div>
              <h2 className="text-base md:text-lg font-bold font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#39ff14] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00f0ff]" />
                <span>THREE SUNO GENERATION BOXES</span>
              </h2>
              <p className="text-xs font-mono text-[#7d8ba1]">
                Every completed run is archived locally. Recent musical territory is used to fight accidental genre monoculture.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={exportAll}
                disabled={archiveCount === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#334155] bg-[#111827] text-[#cbd5e1] hover:border-[#00f0ff] hover:text-white disabled:opacity-40"
              >
                <Archive className="w-3.5 h-3.5" />
                EXPORT ALL .MD ({archiveCount})
              </button>

              {currentRun && (
                <>
                  <button
                    type="button"
                    onClick={exportCurrent}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#334155] bg-[#111827] text-[#cbd5e1] hover:border-[#39ff14] hover:text-white"
                  >
                    <Download className="w-3.5 h-3.5" />
                    EXPORT CURRENT .MD
                  </button>

                  <button
                    type="button"
                    onClick={openFeedback}
                    className={
                      'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border font-bold transition-colors ' +
                      (currentRun.starred
                        ? 'border-[#ffd84d] bg-[#2d2508] text-[#ffe680] hover:bg-[#3a3009]'
                        : 'border-[#ff4fd8] bg-[#251020] text-[#ff9dea] hover:bg-[#35152d]')
                    }
                  >
                    <Star className="w-3.5 h-3.5" fill={currentRun.starred ? 'currentColor' : 'none'} />
                    {currentRun.starred ? 'LIKED — EDIT FEEDBACK' : 'STAR THIS'}
                  </button>
                </>
              )}
            </div>
          </div>

          {currentRun?.fingerprint && (
            <div className="rounded-xl border border-[#252d3b] bg-[#0d1017] px-4 py-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7d8ba1] mb-2">
                musical fingerprint saved with this run
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                {[
                  currentRun.fingerprint.genreFamily,
                  currentRun.fingerprint.rhythm,
                  currentRun.fingerprint.vocal,
                  currentRun.fingerprint.production,
                ].map((item) => (
                  <span key={item} className="px-2 py-1 rounded border border-[#273248] bg-[#111827] text-[#a8d8ff]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-12">
              <OutputBox
                type="style"
                title="BOX 1 — STYLE"
                subtitle="Productive Contradiction Under Constraint (Harmony, Melody, Rhythm, Timbre, Attitude, Anchor, Operators)"
                targetRange={{ min: 975, max: 999, yellowTolerance: 50 }}
                content={outputs.style}
                onRepair={handleRepairBox}
                isRepairing={repairingBox === 'style'}
              />
            </div>

            <div className="lg:col-span-12">
              <OutputBox
                type="lyrics"
                title="BOX 2 — LYRICS / CONTROL"
                subtitle="Mutation Cycle: Form → Destabilize → Fracture → Collapse → Anchor Returns → Reform Stranger. Bracketed directives."
                targetRange={{ min: 4900, max: 4999, yellowTolerance: 200 }}
                content={outputs.lyrics}
                onRepair={handleRepairBox}
                isRepairing={repairingBox === 'lyrics'}
              />
            </div>

            <div className="lg:col-span-12">
              <OutputBox
                type="caption"
                title="BOX 3 — CAPTION"
                subtitle="Compact publishable explanation of structural mechanisms and sonic trajectory"
                targetRange={{ min: 490, max: 499, yellowTolerance: 35 }}
                content={outputs.caption}
                onRepair={handleRepairBox}
                isRepairing={repairingBox === 'caption'}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-[#1a202c]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base md:text-lg font-bold font-mono tracking-wider text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#ff0055]" />
                <span>LITTLE GUY MENAGERIE ({LITTLE_GUYS.length})</span>
              </h2>
              <p className="text-xs font-mono text-[#7d8ba1]">
                Click any specimen to add or remove from current stack. Selected cards glow with individual neon signatures.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter guys or rules..."
                className="w-full bg-[#0a0c12] border border-[#232b3d] rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder-[#556177] focus:outline-none focus:border-[#00f0ff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredGuys.map((guy) => {
              const stackIndex = stackGuyIds.indexOf(guy.id);
              const isSelected = stackIndex !== -1;
              return (
                <GuyCard
                  key={guy.id}
                  guy={guy}
                  isSelected={isSelected}
                  stackPosition={isSelected ? stackIndex + 1 : null}
                  onToggle={handleToggleGuy}
                />
              );
            })}
          </div>

          {filteredGuys.length === 0 && (
            <div className="py-12 text-center text-xs font-mono text-[#64748b]">
              No Little Guy matched "{searchQuery}".
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-[#161a24] bg-[#090b0e] py-6 px-4 text-center font-mono text-xs text-[#526077]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>THE LITTLE GUY MACHINE • SUNO COGNITIVE PROMPT GENERATOR</span>
          <span>DIVERSE MUSIC MEMORY • STAR FEEDBACK • MARKDOWN ARCHIVE</span>
        </div>
      </footer>

      {feedbackOpen && currentRun && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#ff4fd8]/50 bg-[#0d1017] shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 p-5 border-b border-[#252d3b]">
              <div>
                <h3 className="font-mono font-bold text-[#ffe680] flex items-center gap-2">
                  <Star className="w-4 h-4" fill="currentColor" />
                  TEACH THE LITTLE BASTARD
                </h3>
                <p className="mt-1 text-xs font-mono text-[#8d99aa]">
                  Tell it what worked. Future runs receive this as a positive preference signal without simply cloning the song.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackOpen(false)}
                className="p-1 text-[#7d8ba1] hover:text-white"
                aria-label="Close feedback"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <label className="block">
                <span className="text-xs font-mono text-[#ff9dea] flex items-center gap-2 mb-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  WHAT DID YOU LIKE ABOUT THIS?
                </span>
                <textarea
                  value={feedbackDraft}
                  onChange={(e) => setFeedbackDraft(e.target.value)}
                  placeholder="Examples: the scat fighting the barbershop harmony; the rhythm was peppy without becoming EDM; the dry narrator turning into animal noises; the acoustic instruments; the way the anchor kept mutating..."
                  rows={6}
                  className="w-full resize-y rounded-xl border border-[#30384a] bg-[#080a0f] p-3 text-sm text-white placeholder-[#566173] focus:outline-none focus:border-[#ff4fd8]"
                />
              </label>

              {currentRun.fingerprint && (
                <div className="text-[11px] font-mono text-[#7d8ba1] rounded-lg border border-[#232b3d] bg-[#0a0c12] p-3">
                  <div className="text-[#a8d8ff] mb-1">It will also remember the musical fingerprint:</div>
                  {currentRun.fingerprint.genreFamily} • {currentRun.fingerprint.rhythm} • {currentRun.fingerprint.vocal} • {currentRun.fingerprint.production}
                </div>
              )}

              <div className="flex flex-wrap justify-between gap-2">
                {currentRun.starred ? (
                  <button
                    type="button"
                    onClick={unstarCurrent}
                    className="px-4 py-2 rounded-lg border border-[#5b2330] text-[#ff9aa9] font-mono text-xs hover:bg-[#2b1216]"
                  >
                    UNSTAR
                  </button>
                ) : <span />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#334155] text-[#a8b3c5] font-mono text-xs hover:text-white"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={savePositiveFeedback}
                    className="px-4 py-2 rounded-lg bg-[#ffd84d] text-black font-mono font-bold text-xs hover:bg-[#ffe680]"
                  >
                    ★ SAVE AS LIKED
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
