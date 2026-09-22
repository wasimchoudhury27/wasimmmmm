import React from 'react';
import { CheckCircle2, Loader2, CircleDashed } from 'lucide-react';

export interface ScanStageDef {
  number: string;
  label: string;
  detail: string;
}

export const SCAN_STAGES: ScanStageDef[] = [
  { number: '01', label: 'Reading content', detail: 'Parsing text structure & extracting entities' },
  { number: '02', label: 'Extracting signals', detail: 'Isolating contextual triggers & risk keywords' },
  { number: '03', label: 'Checking payment indicators', detail: 'Scanning for deposit, UPI, fees, and money requests' },
  { number: '04', label: 'Evaluating urgency', detail: 'Analyzing deadline pressure & artificial scarcity cues' },
  { number: '05', label: 'Inspecting identity patterns', detail: 'Cross-checking organizational channels & recruiter email' },
  { number: '06', label: 'Analyzing URL/domain signals', detail: 'Evaluating TLD risk, spoofing heuristics & encryption' },
  { number: '07', label: 'Calculating threat index', detail: 'Synthesizing multi-signal weighted scoring & AI explanation' }
];

interface ScanProgressProps {
  currentStageIndex: number;
}

export const ScanProgress: React.FC<ScanProgressProps> = ({ currentStageIndex }) => {
  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl bg-[#12141a] border border-emerald-500/30 p-6 sm:p-8 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden backdrop-blur-xl">
      {/* Scanning laser animation beam */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />

      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Scam Threat Analysis in Progress
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluating observable signals through multi-dimensional risk matrix
          </p>
        </div>
        <div className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
          Stage {Math.min(currentStageIndex + 1, 7)} / 07
        </div>
      </div>

      <div className="space-y-3 font-mono">
        {SCAN_STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const isPending = idx > currentStageIndex;

          return (
            <div
              key={stage.number}
              className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                isCurrent
                  ? 'bg-emerald-950/40 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)] translate-x-1'
                  : isDone
                  ? 'bg-[#161922] border border-zinc-800/80 text-slate-300'
                  : 'opacity-40 border border-transparent text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <span className={`text-xs font-bold ${isCurrent ? 'text-emerald-400' : isDone ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {stage.number}
                </span>
                <div>
                  <div className={`text-sm font-semibold tracking-wide ${isCurrent ? 'text-white' : isDone ? 'text-slate-200' : 'text-slate-400'}`}>
                    {stage.label}
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans">
                    {stage.detail}
                  </div>
                </div>
              </div>

              <div>
                {isDone && (
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[11px]">Verified</span>
                  </div>
                )}
                {isCurrent && (
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[11px] animate-pulse">Inspecting</span>
                  </div>
                )}
                {isPending && (
                  <CircleDashed className="w-4 h-4 text-slate-700" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
