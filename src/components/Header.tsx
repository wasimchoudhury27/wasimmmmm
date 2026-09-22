import React from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Lock, Terminal } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="border-b border-zinc-800/80 bg-[#12141a]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <div 
          onClick={onReset}
          className="flex items-center space-x-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onReset?.()}
          id="header-brand-logo"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-transparent border border-emerald-500/30 group-hover:border-emerald-400 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:scale-105 transition-transform" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white font-mono">SCAM<span className="text-emerald-400">SHIELD</span></span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                v2.4 Live
              </span>
            </div>
            <p className="text-xs text-slate-400 tracking-wide font-sans">
              Pause. Verify. Protect.
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-6 text-xs text-slate-400 font-mono">
          <div className="flex items-center space-x-1.5 text-slate-300 bg-[#161922] px-2.5 py-1 rounded-full border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Dual-Engine: Deterministic + Gemini AI</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ephemeral Zero-Storage Privacy</span>
          </div>
        </div>
      </div>
    </header>
  );
};
