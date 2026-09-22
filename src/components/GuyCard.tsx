import React, { useState } from 'react';
import { LittleGuy } from '../types';
import { LITTLE_GUYS } from '../data/littleGuys';
import { getMindMetadata } from '../data/mindMetadata';
import { Plus, Check, ChevronDown, ChevronUp, Layers, Flame, GitBranch } from 'lucide-react';

interface GuyCardProps {
  guy: LittleGuy;
  isSelected: boolean;
  stackPosition: number | null;
  onToggle: (guyId: string) => void;
}

export function GuyCard({ guy, isSelected, stackPosition, onToggle }: GuyCardProps) {
  const [expanded, setExpanded] = useState(false);
  const meta = getMindMetadata(guy.id);
  const pairingNames = meta.recommendedPairings
    .map((id) => LITTLE_GUYS.find((g) => g.id === id)?.name)
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div
      onClick={() => onToggle(guy.id)}
      className={`group relative rounded-xl border p-3.5 transition-all duration-200 cursor-pointer select-none flex flex-col justify-between ${
        isSelected
          ? `bg-[#131722] ${guy.glowClass}`
          : 'bg-[#10131c] border-[#202738] hover:border-[#38435e] hover:bg-[#141824]'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border"
              style={{
                borderColor: `${guy.accentColor}66`,
                color: guy.accentColor,
                backgroundColor: `${guy.accentColor}15`,
              }}
            >
              {guy.badgeLabel}
            </span>

            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-[#2f3a4d] bg-[#0d1118] text-[#9fb0c7]">
              {meta.family}
            </span>

            <span
              className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-[#4b2f2f] bg-[#1a1010] text-[#ffb4a2] inline-flex items-center gap-1"
              title={`Chaos rating ${meta.chaos} / 5`}
            >
              <Flame className="w-2.5 h-2.5" />
              {meta.chaos}/5
            </span>

            {stackPosition !== null && (
              <span className="flex items-center gap-1 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-white text-black shadow-sm animate-pulse">
                <Layers className="w-2.5 h-2.5" />
                {stackPosition === 1 ? '#1 PRIMARY' : `#${stackPosition}`}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(guy.id);
            }}
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-transform active:scale-90 ${
              isSelected
                ? 'bg-white text-black shadow-md'
                : 'bg-[#1e2433] text-[#7d8ba1] group-hover:text-white group-hover:bg-[#283145]'
            }`}
            title={isSelected ? 'Remove from stack' : 'Add to stack'}
          >
            {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>

        <h3 className="text-sm font-bold tracking-tight text-white font-mono group-hover:text-[#00f0ff] transition-colors">
          {guy.name}
        </h3>
        <p className="text-[11px] font-mono font-medium text-[#7d8ba1] mb-2">{guy.subtitle}</p>
        <p className="text-xs text-[#a0aec0] leading-relaxed mb-3">{guy.shortExplanation}</p>
      </div>

      <div className="pt-2 border-t border-[#1c2230] mt-auto">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#62728d]">
          <span className="truncate">
            Jurisdiction: <span className="text-[#94a3b8]">{guy.defaultJurisdiction}</span>
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="flex items-center gap-0.5 text-[10px] text-[#00f0ff] hover:underline hover:text-white"
          >
            {expanded ? (
              <>
                <span>Less</span>
                <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>Rule + Chemistry</span>
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        </div>

        {expanded && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-2.5 p-2.5 rounded-lg bg-[#0a0c12] border border-[#232a3b] text-[11px] font-mono text-[#cbd5e1] leading-normal space-y-3"
          >
            <div>
              <span className="text-[#39ff14] font-bold block mb-1">OPERATIONAL LAW:</span>
              {guy.rule}
            </div>

            <div>
              <span className="text-[#00f0ff] font-bold block mb-1">STACK ROLE:</span>
              {meta.roleHint}
            </div>

            <div>
              <span className="text-[#ff9dea] font-bold block mb-1">COMPATIBILITY TAGS:</span>
              <div className="flex flex-wrap gap-1">
                {meta.compatibilityTags.map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 rounded border border-[#3a2940] bg-[#16101a] text-[#e9b7ff]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {pairingNames.length > 0 && (
              <div>
                <span className="text-[#ffd84d] font-bold mb-1 flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  RECOMMENDED PAIRINGS:
                </span>
                <div className="text-[#d7c77b]">{pairingNames.join(' • ')}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
