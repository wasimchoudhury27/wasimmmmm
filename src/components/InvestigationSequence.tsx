import React from 'react';
import { InvestigationRing } from './InvestigationRing.js';
import { CheckCircle2, Loader2, CircleDashed, Terminal, Shield } from 'lucide-react';
import { motion } from 'motion/react';

export interface InvestigationStage {
  step: string;
  label: string;
  detail: string;
}

export const INVESTIGATION_STAGES: InvestigationStage[] = [
  { step: '01', label: 'SCANNING MESSAGE TOKENS', detail: 'Parsing text structure, regex boundaries & entities' },
  { step: '02', label: 'CHECKING PAYMENT DEMANDS', detail: 'Scanning for deposits, UPI handles, onboarding fees, QR codes' },
  { step: '03', label: 'CHECKING URGENCY SIGNALS', detail: 'Evaluating countdown ultimatums, hour limits & psychological coercion' },
  { step: '04', label: 'IDENTIFYING IMPERSONATION', detail: 'Checking claimed company branding, unvetted direct selection & recruiter channels' },
  { step: '05', label: 'INSPECTING INFRASTRUCTURE', detail: 'Evaluating domain age, TLD risk, spoofing targets & protocol security' },
  { step: '06', label: 'BUILDING THREAT PROFILE', detail: 'Correlating multi-vector evidence weights & generating AI forensic assessment' }
];

interface InvestigationSequenceProps {
  currentStageIndex: number;
}

export const InvestigationSequence: React.FC<InvestigationSequenceProps> = ({ currentStageIndex }) => {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 py-8 px-4">
      {/* Central Ring Visual */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <InvestigationRing
          score={0}
          riskLevel="LOW"
          isAnalyzing={true}
          activeStageIndex={currentStageIndex}
          size="normal"
        />

        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold font-mono text-white tracking-wide uppercase">
            AI SECURITY INVESTIGATION IN PROGRESS
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Evaluating evidence through deterministic matrix and Gemini threat correlation
          </p>
        </div>
      </div>

      {/* Forensic Stages List */}
      <div className="rounded-2xl bg-[#12141a] border border-zinc-800 p-5 sm:p-6 shadow-2xl space-y-2.5 font-mono">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3 text-xs">
          <span className="text-emerald-400 font-bold tracking-wider">FORENSIC EXECUTION PIPELINE</span>
          <span className="text-slate-500">
            {Math.min(currentStageIndex + 1, 6)} OF 06 VERIFIED
          </span>
        </div>

        {INVESTIGATION_STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const isPending = idx > currentStageIndex;

          return (
            <div
              key={stage.step}
              className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                isCurrent
                  ? 'bg-emerald-950/40 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.12)]'
                  : isDone
                  ? 'bg-[#161922] border border-zinc-800/60 text-slate-300'
                  : 'opacity-40 border border-transparent text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span
                  className={`text-xs font-bold ${
                    isCurrent ? 'text-emerald-400' : isDone ? 'text-emerald-400' : 'text-slate-600'
                  }`}
                >
                  {stage.step}
                </span>

                <div className="min-w-0">
                  <div
                    className={`text-xs sm:text-sm font-semibold tracking-wide truncate ${
                      isCurrent ? 'text-white' : isDone ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {stage.label}
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans truncate hidden sm:block">
                    {stage.detail}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 ml-3">
                {isDone && (
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[11px] hidden sm:inline">Inspected</span>
                  </div>
                )}
                {isCurrent && (
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[11px] hidden sm:inline animate-pulse">Analyzing</span>
                  </div>
                )}
                {isPending && <CircleDashed className="w-4 h-4 text-slate-700" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
