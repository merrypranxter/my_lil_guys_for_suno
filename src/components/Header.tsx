import { Cpu, Terminal, Sparkles, Zap } from 'lucide-react';

interface HeaderProps {
  modelName: string;
  hasApiKey: boolean;
}

export function Header({ modelName, hasApiKey }: HeaderProps) {
  return (
    <header className="relative border-b border-[#222736] bg-[#0c0e14]/90 backdrop-blur-md px-4 py-4 md:py-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Logo & Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff0055] via-[#bf00ff] to-[#00f0ff] p-[1.5px] shadow-[0_0_20px_rgba(255,0,85,0.4)]">
              <div className="w-full h-full bg-[#0b0c10] rounded-[7px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-[#39ff14] animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#ff0055] via-[#00f0ff] to-[#39ff14] font-mono">
                THE LITTLE GUY MACHINE
              </h1>
              <p className="text-xs md:text-sm font-mono text-[#8e9bb0] tracking-wide">
                Tiny incompatible lyric brains. Make them negotiate.
              </p>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161a24] border border-[#2a3245] text-[#93c5fd]">
            <Terminal className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>SUNO PROMPT ENGINE</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161a24] border border-[#2a3245] text-[#86efac]">
            <Zap className="w-3.5 h-3.5 text-[#39ff14]" />
            <span>1 CALL / GEN</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161a24] border border-[#3b2d54] text-[#f472b6]">
            <Sparkles className="w-3.5 h-3.5 text-[#ff0055]" />
            <span className="truncate max-w-[140px] sm:max-w-none">{modelName}</span>
          </div>

          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded border text-[10px] ${
              hasApiKey
                ? 'bg-[#0f2415] border-[#1f5e33] text-[#4ade80]'
                : 'bg-[#291417] border-[#6b1e2a] text-[#f87171]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${hasApiKey ? 'bg-[#22c55e] animate-ping' : 'bg-[#ef4444]'}`} />
            <span>{hasApiKey ? 'KEY CONNECTED' : 'KEY MISSING'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
