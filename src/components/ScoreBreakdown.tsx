import React from 'react';
import { ScoreBreakdownItem } from '../types.js';
import { Calculator, ArrowRight } from 'lucide-react';

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdownItem[];
  totalScore: number;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ breakdown, totalScore }) => {
  return (
    <div className="rounded-2xl bg-[#12141a] border border-zinc-800 p-6 md:p-7 space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800/60 text-emerald-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white font-mono uppercase tracking-wide">
              Deterministic Score Breakdown
            </h4>
            <p className="text-xs text-slate-400">
              Transparent additive mathematical modeling from isolated signals
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-slate-400 block">Final Threat Index</span>
          <span className="text-xl font-bold font-mono text-emerald-400">{totalScore} / 100</span>
        </div>
      </div>

      <div className="space-y-2.5 font-mono text-xs sm:text-sm">
        {breakdown.map((item, idx) => {
          const isCompound = item.category === 'COMPOUND';
          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                isCompound
                  ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                  : 'bg-[#161922] border-zinc-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-3">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isCompound ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center space-x-1.5 font-bold flex-shrink-0">
                <span className={isCompound ? 'text-amber-400' : 'text-emerald-400'}>
                  +{item.points}
                </span>
                <span className="text-slate-500 text-xs">pts</span>
              </div>
            </div>
          );
        })}

        {/* Summation line */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between px-3 text-slate-200 font-bold">
          <span className="uppercase text-xs tracking-wider text-slate-400">Evaluated Index Total</span>
          <div className="flex items-center space-x-2 text-base font-mono">
            <ArrowRight className="w-4 h-4 text-emerald-400" />
            <span className="text-white bg-[#161922] px-3 py-1 rounded-lg border border-emerald-500/40 text-emerald-300">
              {totalScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
            </span>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-500 font-mono italic">
        * Scored via SCAMSHIELD deterministic risk weight matrix. Individual weights and compound rules are bounded from 0 to 100.
      </div>
    </div>
  );
};
