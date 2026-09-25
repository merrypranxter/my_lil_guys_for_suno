import React from 'react';
import { ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, LocateFixed } from 'lucide-react';

export type ModuleTone = 'cyan' | 'lime' | 'pink' | 'yellow' | 'coral' | 'violet' | 'blue' | 'red';

const TONES: Record<ModuleTone, { accent: string; soft: string; border: string; text: string }> = {
  cyan:   { accent: '#00f0ff', soft: 'rgba(0,240,255,0.08)', border: 'rgba(0,240,255,0.40)', text: '#9bf8ff' },
  lime:   { accent: '#39ff14', soft: 'rgba(57,255,20,0.08)', border: 'rgba(57,255,20,0.38)', text: '#b8ff9f' },
  pink:   { accent: '#ff4fd8', soft: 'rgba(255,79,216,0.08)', border: 'rgba(255,79,216,0.40)', text: '#ffb1ed' },
  yellow: { accent: '#ffd84d', soft: 'rgba(255,216,77,0.08)', border: 'rgba(255,216,77,0.40)', text: '#ffe995' },
  coral:  { accent: '#ff7a59', soft: 'rgba(255,122,89,0.08)', border: 'rgba(255,122,89,0.40)', text: '#ffb9a7' },
  violet: { accent: '#a855f7', soft: 'rgba(168,85,247,0.09)', border: 'rgba(168,85,247,0.42)', text: '#d7a7ff' },
  blue:   { accent: '#4f8cff', soft: 'rgba(79,140,255,0.09)', border: 'rgba(79,140,255,0.42)', text: '#a8c8ff' },
  red:    { accent: '#ff3f68', soft: 'rgba(255,63,104,0.08)', border: 'rgba(255,63,104,0.42)', text: '#ff9daf' },
};

export interface ModuleNavItem {
  id: string;
  label: string;
  tone: ModuleTone;
}

interface ModuleDockProps {
  items: ModuleNavItem[];
  activeId: string;
  onJump: (id: string) => void;
  onOpenAll: () => void;
  onCloseAll: () => void;
}

export function ModuleDock({ items, activeId, onJump, onOpenAll, onCloseAll }: ModuleDockProps) {
  return (
    <div className="sticky top-2 z-40 rounded-2xl border border-[#263044] bg-[#090c12]/95 p-2 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        <div className="flex shrink-0 items-center gap-1.5 px-2 text-[10px] font-mono font-bold tracking-[0.16em] text-[#657187]">
          <LocateFixed className="h-3.5 w-3.5" />
          FIND SHIT
        </div>

        {items.map((item) => {
          const tone = TONES[item.tone];
          const active = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onJump(item.id)}
              className="shrink-0 rounded-lg border px-2.5 py-1.5 text-[10px] font-mono font-bold tracking-wide transition-all"
              style={{
                borderColor: active ? tone.accent : tone.border,
                background: active ? tone.soft : '#0e121a',
                color: active ? '#ffffff' : tone.text,
                boxShadow: active ? `0 0 0 1px ${tone.accent}44, 0 0 18px ${tone.accent}20` : 'none',
              }}
              aria-current={active ? 'location' : undefined}
            >
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: tone.accent }} />
              {item.label}
            </button>
          );
        })}

        <div className="ml-auto flex shrink-0 gap-1 pl-2">
          <button
            type="button"
            onClick={onOpenAll}
            className="inline-flex items-center gap-1 rounded-lg border border-[#334155] bg-[#111827] px-2.5 py-1.5 text-[10px] font-mono font-bold text-[#cbd5e1] hover:border-white/50 hover:text-white"
            title="Open every module"
          >
            <ChevronsUpDown className="h-3.5 w-3.5" />
            OPEN ALL
          </button>
          <button
            type="button"
            onClick={onCloseAll}
            className="inline-flex items-center gap-1 rounded-lg border border-[#334155] bg-[#111827] px-2.5 py-1.5 text-[10px] font-mono font-bold text-[#cbd5e1] hover:border-white/50 hover:text-white"
            title="Collapse every module to its labeled header"
          >
            <ChevronsDownUp className="h-3.5 w-3.5" />
            TUCK ALL
          </button>
        </div>
      </div>
    </div>
  );
}

interface ModuleSectionProps {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  tone: ModuleTone;
  open: boolean;
  active?: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function ModuleSection({
  id,
  title,
  eyebrow,
  summary,
  tone,
  open,
  active = false,
  onToggle,
  children,
}: ModuleSectionProps) {
  const theme = TONES[tone];

  return (
    <section
      id={`module-${id}`}
      data-ui-module="true"
      data-module-id={id}
      className="scroll-mt-24 overflow-hidden rounded-2xl border bg-[#0c1017] shadow-xl transition-all"
      style={{
        borderColor: active ? theme.accent : theme.border,
        boxShadow: active ? `0 0 0 1px ${theme.accent}33, 0 14px 42px rgba(0,0,0,0.30)` : '0 12px 32px rgba(0,0,0,0.22)',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors md:px-5"
        style={{ background: `linear-gradient(90deg, ${theme.soft}, rgba(9,12,18,0.82) 62%)` }}
        aria-expanded={open}
        aria-controls={`module-${id}-body`}
      >
        <span
          className="h-9 w-1.5 shrink-0 rounded-full"
          style={{ background: theme.accent, boxShadow: `0 0 16px ${theme.accent}88` }}
        />

        <span className="min-w-0 flex-1">
          <span className="block text-[9px] font-mono font-bold uppercase tracking-[0.22em]" style={{ color: theme.text }}>
            {eyebrow}
          </span>
          <span className="mt-0.5 block text-sm font-mono font-black tracking-wide text-white md:text-base">
            {title}
          </span>
          <span className="mt-0.5 block truncate text-[10px] font-mono text-[#7d8ba1] md:text-xs">
            {summary}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-mono font-bold"
          style={{ borderColor: theme.border, color: theme.text, background: '#0a0d13' }}>
          {open ? 'TUCK AWAY' : 'OPEN'}
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </span>
      </button>

      {open && (
        <div
          id={`module-${id}-body`}
          className="border-t p-3 md:p-4"
          style={{ borderColor: theme.border }}
        >
          {children}
        </div>
      )}
    </section>
  );
}
