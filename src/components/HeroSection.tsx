import React from 'react';
import { ShieldCheck, Cpu, Lock, Terminal, ArrowRight, Eye, Zap } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-4 pb-2">
      {/* Status Pill */}
      <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-wider uppercase shadow-[0_0_15px_rgba(6,182,212,0.12)]">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-slate-300 font-semibold">SCAMSHIELD AI</span>
        <span className="text-slate-600">|</span>
        <span className="text-cyan-300 font-bold">REAL-TIME FRAUD INVESTIGATION</span>
      </div>

      {/* Main Headline */}
      <div className="space-y-3">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Don&apos;t trust the message.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
            Investigate it.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-2xl mx-auto font-normal">
          Before you pay a deposit, accept an unvetted job offer, or click a suspicious link, submit the evidence to our dual-engine forensic intelligence platform.
        </p>
      </div>

      {/* Visual Pipeline Bar: INPUT -> INVESTIGATION -> EVIDENCE -> VERDICT -> ACTION */}
      <div className="pt-2">
        <div className="inline-flex items-center flex-wrap justify-center gap-1.5 sm:gap-2.5 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
          <span className="text-cyan-400 font-semibold">INPUT</span>
          <span className="text-slate-600">→</span>
          <span className="text-slate-300">INVESTIGATION</span>
          <span className="text-slate-600">→</span>
          <span className="text-slate-300">EVIDENCE</span>
          <span className="text-slate-600">→</span>
          <span className="text-amber-400 font-semibold">VERDICT</span>
          <span className="text-slate-600">→</span>
          <span className="text-emerald-400 font-semibold">ACTION</span>
        </div>
      </div>
    </section>
  );
};
