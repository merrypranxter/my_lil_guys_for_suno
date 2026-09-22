import React, { useState, useEffect } from 'react';
import { LITTLE_GUYS } from './data/littleGuys';
import { LittleGuy, BoxType, SavedStack, GenerationResponse } from './types';
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
} from './lib/localStorage';
import { AlertCircle, Layers, SlidersHorizontal, Sparkles } from 'lucide-react';

export default function App() {
  // Model & Server Status
  const [modelName, setModelName] = useState('gemini-3.1-flash-lite');
  const [hasApiKey, setHasApiKey] = useState(true);

  // Stack State
  const [stackGuyIds, setStackGuyIds] = useState<string[]>(() => {
    const saved = getLastStack();
    if (saved && saved.length > 0) return saved;
    // Default stack: Taxonomy Goblin -> Recall Mold -> Cosmic Clerk (from user prompt example!)
    return ['taxonomy-goblin', 'recall-mold', 'cosmic-clerk'];
  });

  // Saved Stacks
  const [savedStacks, setSavedStacks] = useState<SavedStack[]>(() => getSavedStacks());

  // Input & Energy State
  const [seed, setSeed] = useState<string>(() => getSavedSeed());
  const [energy, setEnergy] = useState<number>(() => getSavedEnergy());

  // Generation Output State
  const [outputs, setOutputs] = useState<{
    style: string;
    lyrics: string;
    caption: string;
  }>({
    style: '',
    lyrics: '',
    caption: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [repairingBox, setRepairingBox] = useState<BoxType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search filter for menagerie
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch server info on mount
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

  // Sync to localStorage
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

  // Stack Operations
  const handleToggleGuy = (guyId: string) => {
    setStackGuyIds((prev) => {
      if (prev.includes(guyId)) {
        return prev.filter((id) => id !== guyId);
      } else {
        return [...prev, guyId];
      }
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

  // Quick Roll Actions
  const handleRollOne = () => {
    const randomGuy = LITTLE_GUYS[Math.floor(Math.random() * LITTLE_GUYS.length)];
    setStackGuyIds([randomGuy.id]);
  };

  const handleRollStack = () => {
    // Pick 2 to 4 unique guys
    const count = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
    const shuffled = [...LITTLE_GUYS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count).map((g) => g.id);
    setStackGuyIds(selected);
  };

  const handleFuckMeUp = () => {
    // Select 3 to 5 strongly varied guys with distinct jurisdictions
    const count = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
    const shuffled = [...LITTLE_GUYS].sort(() => 0.5 - Math.random());

    // Filter to guarantee distinct jurisdictions if possible
    const chosen: LittleGuy[] = [];
    const usedJurisdictions = new Set<string>();

    for (const guy of shuffled) {
      if (!usedJurisdictions.has(guy.defaultJurisdiction)) {
        chosen.push(guy);
        usedJurisdictions.add(guy.defaultJurisdiction);
      }
      if (chosen.length >= count) break;
    }

    // Fill remaining if needed
    if (chosen.length < count) {
      for (const guy of shuffled) {
        if (!chosen.some((c) => c.id === guy.id)) {
          chosen.push(guy);
        }
        if (chosen.length >= count) break;
      }
    }

    setStackGuyIds(chosen.map((g) => g.id));
  };

  // Saved Stacks Operations
  const handleSaveStack = (name: string) => {
    const updated = saveStackToFavorites(name, stackGuyIds);
    setSavedStacks(updated);
  };

  const handleLoadSavedStack = (saved: SavedStack) => {
    setStackGuyIds(saved.guyIds);
  };

  const handleDeleteSavedStack = (id: string) => {
    const updated = deleteSavedStack(id);
    setSavedStacks(updated);
  };

  // Generation Handler
  const handleGenerate = async () => {
    if (stackGuyIds.length === 0 || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);

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
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const rawText = await response.text();
      let data: any = null;

      try {
        data = JSON.parse(rawText);
      } catch {
        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}. Please try again.`);
        }
        throw new Error('Server returned an unreadable response format.');
      }

      if (!response.ok) {
        throw new Error(data?.error || `HTTP error ${response.status}`);
      }

      if (data.model) {
        setModelName(data.model);
      }
      setOutputs({
        style: data.style || '',
        lyrics: data.lyrics || '',
        caption: data.caption || '',
      });

      if (data.notice) {
        setErrorMessage(data.notice);
      }

      // Smooth scroll to output on mobile
      setTimeout(() => {
        const outputElem = document.getElementById('output-section');
        if (outputElem) {
          outputElem.scrollIntoView({ behavior: 'smooth' });
        }
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

      // Seamless offline / high-demand fallback directly in browser
      if (isNetworkOrPattern || isAbort || err.message?.includes('high demand') || err.message?.includes('quota')) {
        try {
          const fallback = generateProceduralTrack({
            guyIds: stackGuyIds,
            seed,
            energy,
          });
          setModelName('procedural-synthesizer');
          setOutputs({
            style: fallback.style,
            lyrics: fallback.lyrics,
            caption: fallback.caption,
          });
          setErrorMessage('Notice: Output synthesized using the Little Guy procedural engine.');
          return;
        } catch (localErr) {
          console.error('Local fallback failed:', localErr);
        }
      }

      const friendlyMsg = isAbort
        ? 'Generation timed out. Please try again with a smaller stack or single guy.'
        : isNetworkOrPattern
        ? 'Network connection interrupted. Please click "Generate" again.'
        : err.message || 'Generation failed. Please try again.';
      setErrorMessage(friendlyMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Repair Individual Box Length Handler
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
        body: JSON.stringify({
          boxType: type,
          currentText,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const rawText = await response.text();
      let data: any = null;

      try {
        data = JSON.parse(rawText);
      } catch {
        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}`);
        }
        throw new Error('Server returned an unreadable response format.');
      }

      if (!response.ok) {
        throw new Error(data?.error || `HTTP repair error ${response.status}`);
      }

      if (data.model && data.model !== 'calibrator-engine') {
        setModelName(data.model);
      }
      if (data.repairedText) {
        setOutputs((prev) => ({
          ...prev,
          [type]: data.repairedText,
        }));
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn('Network/API repair unavailable; applying local algorithmic calibration:', err?.message || err);

      // Local precision calibrator guarantees instant resolution
      const target = TARGETS[type];
      if (target) {
        const paddingSnippet = `[CALIBRATION INVARIANT: Maintaining operational trajectory for ${type.toUpperCase()}. Baseline protocol sustained.]`;
        const calibrated = clampAndPad(currentText, target.min, target.max, paddingSnippet);
        setOutputs((prev) => ({
          ...prev,
          [type]: calibrated,
        }));
        setErrorMessage(`Calibrated ${type.toUpperCase()} to ${calibrated.length} characters (Target: ${target.min}–${target.max}).`);
      } else {
        setErrorMessage(`Failed to calibrate ${type} length: ${err.message}`);
      }
    } finally {
      setRepairingBox(null);
    }
  };

  // Active Little Guy objects in order
  const activeStackGuys: LittleGuy[] = stackGuyIds
    .map((id) => LITTLE_GUYS.find((g) => g.id === id))
    .filter((g): g is LittleGuy => Boolean(g));

  // Filtered guys for menagerie
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
      {/* Header */}
      <Header modelName={modelName} hasApiKey={hasApiKey} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Error Banner */}
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

        {/* Section 1 & 2: Active Stack & Machine Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Stack Panel (Order & Jurisdiction) */}
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

          {/* Controls Panel (Seed, Energy & Generate) */}
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

        {/* Section 3: The Three Suno Output Boxes */}
        <div id="output-section" className="space-y-4 pt-4 border-t border-[#1a202c]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base md:text-lg font-bold font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#39ff14] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00f0ff]" />
                <span>THREE SUNO GENERATION BOXES</span>
              </h2>
              <p className="text-xs font-mono text-[#7d8ba1]">
                Generated via single inference pass. Copy each box directly into Suno.
              </p>
            </div>

            {outputs.style && (
              <div className="text-xs font-mono text-[#39ff14] bg-[#0d2215] border border-[#1b502e] px-2.5 py-1 rounded">
                Output ready for Suno v3.5/v4
              </div>
            )}
          </div>

          {/* Three Grid/Stacked Output Boxes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* BOX 1: STYLE (Target 975–999 chars) */}
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

            {/* BOX 2: LYRICS / CONTROL (Target 4900–4999 chars) */}
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

            {/* BOX 3: CAPTION (Target 490–499 chars) */}
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

        {/* Section 4: Little Guy Menagerie */}
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

            {/* Search filter input */}
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

          {/* Menagerie Grid */}
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

      {/* Footer */}
      <footer className="border-t border-[#161a24] bg-[#090b0e] py-6 px-4 text-center font-mono text-xs text-[#526077]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>THE LITTLE GUY MACHINE • SUNO COGNITIVE PROMPT GENERATOR</span>
          <span>1 MODEL PASS • LOCAL PRESETS • ZERO BLOAT</span>
        </div>
      </footer>
    </div>
  );
}
