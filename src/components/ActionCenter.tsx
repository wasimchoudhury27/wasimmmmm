import React, { useState } from 'react';
import { AnalysisResult } from '../types.js';
import {
  Ban,
  KeyRound,
  Building2,
  Flag,
  Copy,
  Check,
  Share2,
  ExternalLink,
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface ActionCenterProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const ActionCenter: React.FC<ActionCenterProps> = ({ result, onReset }) => {
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedAdvice, setCopiedAdvice] = useState(false);

  const handleCopyReport = () => {
    const report = `SCAMSHIELD CRITICAL SECURITY BRIEFING
Risk Level: ${result.riskLevel} (${result.threatScore}/100)
Assessment: ${result.summary}
Primary Evidence: ${result.primaryQuote ? `"${result.primaryQuote}"` : 'Flagged by forensic indicators'}
Action Required: Do not transfer money, share OTPs, or click unverified links.
Investigated via SCAMSHIELD (https://scamshield.ai)`;

    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleShareAdvice = () => {
    const advice = `⚠️ FRAUD ALERT: I just checked a suspicious message using SCAMSHIELD. It scored ${result.threatScore}/100 (${result.riskLevel}).
Rule of thumb: Legitimate employers and genuine landlords never demand advance fees, gate pass tokens, or equipment security deposits via UPI/GPay. Always verify directly!`;

    navigator.clipboard.writeText(advice);
    setCopiedAdvice(true);
    setTimeout(() => setCopiedAdvice(false), 2000);
  };

  const defensiveDirectives = [
    {
      title: 'DO NOT SEND MONEY',
      desc: 'Never transfer registration fees, laptop security deposits, or gate-pass token payments. Real employers and verified landlords will not ask for advance UPI transfers.',
      icon: Ban,
      badge: 'STRICT PROHIBITION',
      color: 'text-red-400',
      border: 'border-red-500/40',
      bg: 'bg-red-950/20'
    },
    {
      title: 'DO NOT SHARE OTPS OR IDS',
      desc: 'Do not provide Aadhaar/PAN scans, one-time passwords (OTPs), or online banking verification codes to unverified recruiters or agents.',
      icon: KeyRound,
      badge: 'SECURITY DIRECTIVE',
      color: 'text-amber-400',
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/20'
    },
    {
      title: 'VERIFY COMPANY DIRECTLY',
      desc: 'Look up the enterprise independently via Google, official corporate career portals, or MCA company records. Do not use phone numbers or links provided in the suspect message.',
      icon: Building2,
      badge: 'INDEPENDENT AUDIT',
      color: 'text-cyan-400',
      border: 'border-cyan-500/40',
      bg: 'bg-cyan-950/20'
    },
    {
      title: 'REPORT SENDER & BLOCK',
      desc: 'Block the sender on WhatsApp/SMS/Email immediately and submit details to official national cybercrime authorities to protect other potential victims.',
      icon: Flag,
      badge: 'INCIDENT LOGGING',
      color: 'text-indigo-400',
      border: 'border-indigo-500/40',
      bg: 'bg-indigo-950/20'
    }
  ];

  return (
    <section className="space-y-6 pt-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-400 font-semibold block">
            DEFENSIVE ACTION PROTOCOL
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
            WHAT SHOULD YOU DO NOW?
          </h3>
        </div>

        <span className="text-xs font-mono text-emerald-400/90 bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-800/40">
          Prioritized Safety Checklist
        </span>
      </div>

      {/* 4 Directives Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {defensiveDirectives.map((d, idx) => {
          const Icon = d.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border ${d.border} ${d.bg} bg-[#080d19] space-y-2.5 transition-all`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${d.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white font-mono tracking-tight">
                    {d.title}
                  </h4>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {d.badge}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                {d.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Secondary Tools and Share Bar */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#080d19] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/70 pb-4">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wide">
              INCIDENT SHARING &amp; REPORTING TOOLS
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-400 font-sans mt-0.5">
              Share actionable proof with contacts or national cybercrime authorities
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyReport}
              className="min-h-[44px] flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition-colors cursor-pointer touch-manipulation flex-1 sm:flex-initial"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-400 font-bold">Report Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span>Copy Dossier</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShareAdvice}
              className="min-h-[44px] flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition-colors cursor-pointer touch-manipulation flex-1 sm:flex-initial"
            >
              {copiedAdvice ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-400 font-bold">Advice Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span>Share Advice</span>
                </>
              )}
            </button>

            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-950/60 border border-red-500/40 text-xs font-mono text-red-300 transition-colors touch-manipulation w-full sm:w-auto"
            >
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Report to CyberCrime.gov</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
          <span className="text-[11px] sm:text-xs">Assessment Dossier: #{result.id}</span>
          <button
            type="button"
            onClick={onReset}
            className="min-h-[44px] flex items-center space-x-1.5 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer touch-manipulation py-2 px-3 rounded-lg hover:bg-slate-900"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Scan Another Message or URL</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
