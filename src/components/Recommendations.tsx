import React from 'react';
import { ShieldCheck, CheckCircle, Copy, Check, ExternalLink } from 'lucide-react';

interface RecommendationsProps {
  actions: string[];
  summary: string;
  whyThisScore: string;
  primaryQuote?: string;
  threatScore: number;
}

export const Recommendations: React.FC<RecommendationsProps> = ({
  actions,
  summary,
  whyThisScore,
  primaryQuote,
  threatScore
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyReport = () => {
    const reportText = `SCAMSHIELD Threat Assessment Report
Threat Index: ${threatScore}/100
Summary: ${summary}

Why this score:
${whyThisScore}

Recommended Protective Actions:
${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Generated via SCAMSHIELD — Pause. Verify. Protect.`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* "WHY DID I GET THIS SCORE?" EXPLANATION SECTION */}
      <div className="rounded-2xl bg-[#12141a] border border-emerald-500/30 p-6 md:p-7 shadow-[0_0_20px_rgba(16,185,129,0.06)] space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h4 className="text-base font-bold text-white font-mono uppercase tracking-wide">
              Why Did I Get This Score?
            </h4>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Plain-Language Threat Analysis
          </span>
        </div>

        <div className="text-slate-200 text-sm sm:text-base leading-relaxed font-sans">
          {whyThisScore}
        </div>

        {primaryQuote && (
          <div className="p-3.5 rounded-xl bg-[#161922] border border-zinc-800 flex items-start space-x-3">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider flex-shrink-0 pt-0.5">
              Key Observable Evidence:
            </span>
            <span className="text-xs sm:text-sm font-mono text-emerald-300 break-words font-medium">
              &ldquo;{primaryQuote}&rdquo;
            </span>
          </div>
        )}
      </div>

      {/* RECOMMENDED ACTIONS PANEL */}
      <div className="rounded-2xl bg-[#12141a] border border-zinc-800 p-6 md:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800/60 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                Protective Next Steps
              </h4>
              <p className="text-xs text-slate-400">
                Context-aware recommendations based on detected signals
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyReport}
            type="button"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#161922] hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Report Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-3 font-sans">
          {actions.map((act, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-[#161922] border border-zinc-800/80 hover:border-zinc-700 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5">
                0{idx + 1}
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {act}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
