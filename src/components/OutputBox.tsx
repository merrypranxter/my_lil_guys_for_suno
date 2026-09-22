import React, { useState } from 'react';
import { Copy, Check, Wrench, Loader2, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { BoxType } from '../types';

interface OutputBoxProps {
  type: BoxType;
  title: string;
  subtitle: string;
  targetRange: { min: number; max: number; yellowTolerance: number };
  content: string;
  onRepair: (type: BoxType) => Promise<void>;
  isRepairing: boolean;
}

export function OutputBox({
  type,
  title,
  subtitle,
  targetRange,
  content,
  onRepair,
  isRepairing,
}: OutputBoxProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const charCount = content.length;
  const { min, max, yellowTolerance } = targetRange;

  // Determine status color
  // Green: within [min, max]
  // Yellow: within [min - yellowTolerance, max + yellowTolerance]
  // Red: outside that
  let statusColor = 'text-[#f87171] border-[#7f1d1d] bg-[#291215]'; // Red
  let statusLabel = 'OFF TARGET';
  let diffLabel = '';

  if (charCount >= min && charCount <= max) {
    statusColor = 'text-[#4ade80] border-[#14532d] bg-[#0c2415]'; // Green
    statusLabel = 'PERFECT HIT';
    diffLabel = `${charCount} chars`;
  } else if (charCount >= min - yellowTolerance && charCount <= max + yellowTolerance) {
    statusColor = 'text-[#fde047] border-[#713f12] bg-[#2a1d0d]'; // Yellow
    statusLabel = 'NEAR TARGET';
    const diff = charCount < min ? `-${min - charCount}` : `+${charCount - max}`;
    diffLabel = `${diff} chars`;
  } else {
    const diff = charCount < min ? `-${min - charCount}` : `+${charCount - max}`;
    diffLabel = `${diff} chars`;
  }

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy for iframes
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format content for lyrics by highlighting [brackets] nicely
  const renderFormattedContent = () => {
    if (!content) {
      return (
        <span className="text-[#4b5563] italic font-mono text-xs">
          Awaiting generation run. Select Little Guys and click Generate.
        </span>
      );
    }

    if (type !== 'lyrics') {
      return <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#e2e8f0]">{content}</pre>;
    }

    // Bracket parsing for Lyrics box to make Suno cues pop
    const parts = content.split(/(\[[^\]]+\])/g);
    return (
      <div className="font-mono text-xs leading-relaxed text-[#cbd5e1] whitespace-pre-wrap">
        {parts.map((part, index) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            return (
              <span
                key={index}
                className="inline-block px-1.5 py-0.5 my-0.5 rounded bg-[#1e2738] border border-[#3b82f6]/40 text-[#60a5fa] font-bold"
              >
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="bg-[#0f121a] border border-[#202738] rounded-xl overflow-hidden flex flex-col shadow-xl">
      {/* Box Header */}
      <div className="px-4 py-3 bg-[#131722] border-b border-[#1f2638] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase">{title}</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c2232] border border-[#2d374f] text-[#94a3b8]">
              Target: {min}–{max} chars
            </span>
          </div>
          <p className="text-[11px] font-mono text-[#7d8ba1]">{subtitle}</p>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex items-center gap-2">
          {content && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono font-bold ${statusColor}`}
              title={`Target: ${min}-${max} chars`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{charCount} chars</span>
              <span className="opacity-75 text-[10px]">({statusLabel} {diffLabel})</span>
            </div>
          )}

          {/* Expand toggle */}
          {content && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded bg-[#1a202e] border border-[#2d374e] text-[#94a3b8] hover:text-white"
              title={expanded ? 'Collapse box' : 'Expand full content'}
            >
              {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!content}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs font-bold transition-all ${
              copied
                ? 'bg-[#39ff14] text-black shadow-[0_0_12px_rgba(57,255,20,0.5)]'
                : 'bg-[#1e2536] border border-[#313c54] text-white hover:border-[#00f0ff] hover:text-[#00f0ff] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>COPIED!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>COPY</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div
        className={`p-4 bg-[#0a0c12] overflow-y-auto font-mono transition-all ${
          expanded
            ? 'max-h-[85vh]'
            : type === 'lyrics'
            ? 'max-h-80 md:max-h-96'
            : 'max-h-48 md:max-h-56'
        }`}
      >
        {renderFormattedContent()}
      </div>

      {/* Bottom Toolbar: Repair Length option */}
      {content && (
        <div className="px-4 py-2 bg-[#10141f] border-t border-[#1c2232] flex items-center justify-between text-[11px] font-mono text-[#64748b]">
          <span>
            {charCount >= min && charCount <= max ? (
              <span className="text-[#39ff14]">Exact target window satisfied</span>
            ) : (
              <span>Outside strict target window ({charCount < min ? `Under by ${min - charCount}` : `Over by ${charCount - max}`})</span>
            )}
          </span>

          <button
            type="button"
            onClick={() => onRepair(type)}
            disabled={isRepairing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#181d2a] border border-[#2b354b] text-[#93c5fd] hover:text-white hover:border-[#3b82f6] disabled:opacity-50 transition-colors active:scale-95"
            title="Perform a targeted calibration call to adjust this box's character count into the exact target range"
          >
            {isRepairing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-[#00f0ff]" />
                <span>CALIBRATING LENGTH...</span>
              </>
            ) : (
              <>
                <Wrench className="w-3 h-3 text-[#ffdd00]" />
                <span>REPAIR LENGTH</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
