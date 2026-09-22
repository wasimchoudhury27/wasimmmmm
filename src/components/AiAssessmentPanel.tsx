import React from 'react';
import { AnalysisResult } from '../types.js';
import { Sparkles, HelpCircle, AlertTriangle, Target, CheckSquare, ShieldCheck, Quote } from 'lucide-react';

interface AiAssessmentPanelProps {
  result: AnalysisResult;
}

export const AiAssessmentPanel: React.FC<AiAssessmentPanelProps> = ({ result }) => {
  // Synthesize readable sections
  const whatHappened = result.summary;
  const whySuspicious = result.whyThisScore;

  // Infer scammer's objective from entities or signals
  const amounts = result.extractedEntities.amounts || [];
  const scammerWants =
    amounts.length > 0
      ? `The sender is seeking an immediate financial transfer (${amounts.join(' / ')}) under the guise of an upfront fee, deposit, or document processing charge before you can verify their legitimacy.`
      : result.signals.some((s) => s.category === 'URL_STRUCTURE')
      ? 'The sender is attempting to lure you to an unverified or lookalike external website to harvest credentials, banking PINs, or sensitive personal data.'
      : 'The sender is attempting to manipulate you into taking urgent action without independent verification or consultation.';

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              SCAMSHIELD&apos;S PLAIN-LANGUAGE ASSESSMENT
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Clear breakdown for quick personal or organizational evaluation
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          Plain-English Report
        </span>
      </div>

      {/* Featured Primary Smoking Gun Quote */}
      {result.primaryQuote && (
        <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/30 via-slate-900/60 to-slate-950/60 border border-red-500/40 relative overflow-hidden">
          <div className="flex items-start space-x-2.5 sm:space-x-3">
            <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-bold text-red-400 block">
                CRITICAL SMOKING-GUN EVIDENCE EXTRACTED:
              </span>
              <p className="text-xs sm:text-sm md:text-base font-medium text-red-200 font-mono italic break-words break-all">
                &ldquo;{result.primaryQuote}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Pillar 1: What Happened */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#080d19] border border-slate-800 space-y-2 sm:space-y-2.5">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 flex-shrink-0" />
            <span>1. What Happened</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed break-words">
            {whatHappened}
          </p>
        </div>

        {/* Pillar 2: Why It Is Suspicious */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#080d19] border border-slate-800 space-y-2 sm:space-y-2.5">
          <div className="flex items-center space-x-2 text-amber-400 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>2. Why It Is Suspicious</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed break-words">
            {whySuspicious}
          </p>
        </div>

        {/* Pillar 3: What The Scammer Wants */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#080d19] border border-slate-800 space-y-2 sm:space-y-2.5">
          <div className="flex items-center space-x-2 text-red-400 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <Target className="w-4 h-4 flex-shrink-0" />
            <span>3. What The Sender Wants</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed break-words">
            {scammerWants}
          </p>
        </div>

        {/* Pillar 4: Primary Next Step */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#080d19] border border-slate-800 space-y-2 sm:space-y-2.5">
          <div className="flex items-center space-x-2 text-emerald-400 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>4. Immediate Protective Rule</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed break-words">
            <strong className="text-emerald-300">Do not send funds or click suspicious links.</strong> Contact the organization through an independently verified phone number or official domain found on Google or official government directories.
          </p>
        </div>
      </div>
    </section>
  );
};
