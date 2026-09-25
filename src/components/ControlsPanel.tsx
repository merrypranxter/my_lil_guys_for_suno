import React from 'react';
import { Sparkles, Zap, Dices, Loader2 } from 'lucide-react';

interface ControlsPanelProps {
  seed: string;
  onSeedChange: (newSeed: string) => void;
  energy: number;
  onEnergyChange: (level: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
}

const SEED_SUGGESTIONS = [
  'Subaquatic bureaucratic audit of decommissioned coral reefs',
  'Lithium battery choir failing a voltage stress test',
  'A calendar that counts backward into human teeth',
  'Supermarket intercom announcing a non-Euclidean recall',
  'Fungal telephony line operating on forgotten debt',
  'A high-speed rail locomotive powered by archival shame',
  'Deep sea mining telemetry documenting recursive static',
  'An air traffic controller negotiating with an impossible altitude',
  'The thermal expansion of obsolete library catalog cabinets',
  'A broken synthesizer that only outputs mathematical proofs of absence',
];

const ENERGY_DESCRIPTIONS: Record<number, { title: string; desc: string; color: string; border: string }> = {
  1: {
    title: '1: LATENT DRIFT',
    desc: 'Creeping anomalies, subterranean tension, low entropy',
    color: '#00f0ff',
    border: 'border-[#00f0ff]',
  },
  2: {
    title: '2: LOW HUM',
    desc: 'Controlled asymmetry, steady motoric pulse, sharp intermittent glitches',
    color: '#39ff14',
    border: 'border-[#39ff14]',
  },
  3: {
    title: '3: STEADY COMBUSTION',
    desc: 'Driving kinetic rhythm, pronounced fractures, active propulsion',
    color: '#ffdd00',
    border: 'border-[#ffdd00]',
  },
  4: {
    title: '4: HIGH REACTOR',
    desc: 'Frenetic tempo, dense sonic pressure, intense operational collisions',
    color: '#ff7700',
    border: 'border-[#ff7700]',
  },
  5: {
    title: '5: CRITICAL MELTDOWN',
    desc: 'Maximum kinetic overdrive, hyper-dense collision, total structural stress',
    color: '#ff0055',
    border: 'border-[#ff0055]',
  },
};

export function ControlsPanel({
  seed,
  onSeedChange,
  energy,
  onEnergyChange,
  onGenerate,
  isGenerating,
  canGenerate,
}: ControlsPanelProps) {
  const rollRandomSeed = () => {
    const randomSeed = SEED_SUGGESTIONS[Math.floor(Math.random() * SEED_SUGGESTIONS.length)];
    onSeedChange(randomSeed);
  };

  const currentEnergy = ENERGY_DESCRIPTIONS[energy] || ENERGY_DESCRIPTIONS[3];

  return (
    <div className="bg-[#0f121a] border border-[#202738] rounded-xl p-4 md:p-5 shadow-xl space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left: Seed Input (Col 6) */}
        <div className="lg:col-span-6 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>SONG / EXPERIMENT SEED — SOVEREIGN SUBJECT</span>
            </label>
            <button
              type="button"
              onClick={rollRandomSeed}
              className="flex items-center gap-1 text-[11px] font-mono text-[#00f0ff] hover:text-white transition-colors"
              title="Suggest an experimental topic"
            >
              <Dices className="w-3 h-3" />
              <span>Surprise Me</span>
            </button>
          </div>

          <div className="rounded-md border border-[#143540] bg-[#09171c] px-2.5 py-2 text-[10px] font-mono leading-relaxed text-[#78cddd]">
            Seed owns WHAT the song is about. Reality may stage it, minds may mutate its logic, and music systems may transform its sound — none of them may quietly replace it.
          </div>

          <div className="relative">
            <input
              type="text"
              value={seed}
              onChange={(e) => onSeedChange(e.target.value)}
              placeholder="e.g. Subaquatic bureaucratic audit, lithium battery choir, memory mold..."
              className="w-full bg-[#0a0c12] border border-[#262f42] rounded-lg px-3.5 py-2.5 text-xs md:text-sm font-mono text-white placeholder-[#4b5563] focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]"
            />
            {seed && (
              <button
                type="button"
                onClick={() => onSeedChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#64748b] hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Middle: Energy Level (Col 6) */}
        <div className="lg:col-span-6 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#ffdd00]" />
              <span>ENERGY LEVEL</span>
            </label>
            <span className="text-[11px] font-mono font-bold" style={{ color: currentEnergy.color }}>
              {currentEnergy.title}
            </span>
          </div>

          {/* 5-Step Buttons */}
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((lvl) => {
              const active = energy === lvl;
              const meta = ENERGY_DESCRIPTIONS[lvl];
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onEnergyChange(lvl)}
                  className={`py-2 px-1 rounded-md text-xs font-mono font-bold transition-all text-center ${
                    active
                      ? 'text-black shadow-lg scale-[1.02]'
                      : 'bg-[#141824] border border-[#232b3d] text-[#8e9bb0] hover:text-white hover:bg-[#1a2030]'
                  }`}
                  style={
                    active
                      ? {
                          backgroundColor: meta.color,
                          boxShadow: `0 0 15px ${meta.color}66`,
                        }
                      : {}
                  }
                >
                  Lv.{lvl}
                </button>
              );
            })}
          </div>

          <p className="text-[10px] font-mono text-[#7d8ba1] truncate">{currentEnergy.desc}</p>
        </div>
      </div>

      {/* Big Tactile Generate Button */}
      <div className="pt-2 border-t border-[#1c2230]">
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className={`w-full py-4 px-6 rounded-xl font-mono font-black text-sm md:text-base tracking-wider uppercase flex items-center justify-center gap-3 transition-all duration-200 ${
            !canGenerate
              ? 'bg-[#181c28] text-[#556177] cursor-not-allowed border border-[#222738]'
              : isGenerating
              ? 'bg-[#201524] text-[#ff0055] border border-[#ff0055] animate-pulse cursor-wait'
              : 'bg-gradient-to-r from-[#ff0055] via-[#bf00ff] to-[#00f0ff] text-white shadow-[0_0_25px_rgba(255,0,85,0.4)] hover:shadow-[0_0_35px_rgba(0,240,255,0.6)] hover:brightness-110 active:scale-[0.99]'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-[#00f0ff]" />
              <span>NEGOTIATING STACK & GENERATING THREE SUNO BOXES...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 fill-current" />
              <span>GENERATE THREE BOXES (STYLE, LYRICS, CAPTION)</span>
            </>
          )}
        </button>

        {!canGenerate && (
          <p className="text-center text-[11px] font-mono text-[#f87171] mt-2">
            Select at least one Little Guy from the menagerie or roll a stack to activate generator.
          </p>
        )}
      </div>
    </div>
  );
}
