import React, { useState } from 'react';
import { AnalysisResult } from '../types.js';
import { InvestigationRing } from './InvestigationRing.js';
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon, RotateCcw, Copy, Check, Sparkles, ArrowLeft, Globe, Layers } from 'lucide-react';

interface VerdictHeaderProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const VerdictHeader: React.FC<VerdictHeaderProps> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyReport = () => {
    const reportText = `SCAMSHIELD THREAT INVESTIGATION REPORT
Assessment ID: ${result.id}
Risk Verdict: ${result.riskLevel} (${result.threatScore}/100)
Confidence: ${result.evidenceStrength} Evidence
Summary: ${result.summary}

Primary Observable Evidence:
${result.primaryQuote ? `"${result.primaryQuote}"` : 'Multiple structural signals detected'}

Why SCAMSHIELD flagged this:
${result.whyThisScore}

Key Signals Isolated:
${result.signals.map((s, i) => `${i + 1}. [${s.category}] ${s.name} (+${s.scoreWeight} pts): ${s.whatDetected}`).join('\n')}

Defensive Recommendations:
${result.recommendedActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Generated via SCAMSHIELD Dual-Engine Security Platform (Pause. Verify. Protect.)`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const getVerdictTheme = () => {
    switch (result.riskLevel) {
      case 'CRITICAL':
        return {
          color: '#ef4444',
          badgeText: 'CRITICAL RISK',
          badgeClass: 'bg-red-950/80 text-red-400 border-red-500/50',
          icon: AlertOctagon,
          summaryBg: 'border-red-500/30'
        };
      case 'HIGH':
        return {
          color: '#f97316',
          badgeText: 'HIGH RISK',
          badgeClass: 'bg-orange-950/80 text-orange-400 border-orange-500/50',
          icon: ShieldAlert,
          summaryBg: 'border-orange-500/30'
        };
      case 'MODERATE':
        return {
          color: '#f59e0b',
          badgeText: 'MODERATE SUSPICION',
          badgeClass: 'bg-amber-950/80 text-amber-400 border-amber-500/50',
          icon: AlertTriangle,
          summaryBg: 'border-amber-500/30'
        };
      case 'LOW':
      default:
        return {
          color: '#10b981',
          badgeText: 'LOW RISK',
          badgeClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50',
          icon: ShieldCheck,
          summaryBg: 'border-emerald-500/30'
        };
    }
  };

  const theme = getVerdictTheme();
  const IconComponent = theme.icon;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Action Subbar with 44px+ touch-targets for mobile */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-[#12141a] border border-zinc-800 text-xs font-mono">
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <button
            type="button"
            onClick={onReset}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-lg bg-[#161922] hover:bg-zinc-800 border border-zinc-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center flex-shrink-0 touch-manipulation"
            title="Return to investigation console"
            aria-label="Back to investigation console"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-emerald-400 font-bold uppercase text-[11px] sm:text-xs">
                CASE DOSSIER #{result.id.slice(-8)}
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-400 text-[10px] sm:text-[11px] truncate max-w-xs">
                {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-slate-400 truncate max-w-md font-sans text-[11px] mt-0.5">
              Input: &ldquo;{result.inputSnippet}&rdquo;
            </p>
          </div>
        </div>

        {/* Buttons: 2-column grid on small mobile, flex row on sm+ */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
          <button
            type="button"
            onClick={handleCopyReport}
            className="min-h-[44px] flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-[#161922] hover:bg-zinc-800 border border-zinc-700 text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer touch-manipulation"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-emerald-400 font-semibold truncate">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">Copy Report</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="min-h-[44px] flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.15)] touch-manipulation"
          >
            <RotateCcw className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">New Scan</span>
          </button>
        </div>
      </div>

      {/* Main Forensic Verdict Card - Stack Vertically on Mobile without Overflow */}
      <div className={`rounded-2xl bg-[#12141a] border ${theme.summaryBg} p-4 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl`}>
        {/* Subtle accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: theme.color }}
        />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-10">
          {/* Circular Gauge / Investigation Ring (Centered & responsive) */}
          <div className="flex-shrink-0 w-full lg:w-auto flex justify-center">
            <InvestigationRing
              score={result.threatScore}
              riskLevel={result.riskLevel}
              signals={result.signals}
              size="hero"
            />
          </div>

          {/* Executive Verdict & Metadata */}
          <div className="flex-1 space-y-3 sm:space-y-4 text-center lg:text-left w-full min-w-0">
            {/* Verdict Pill */}
            <div
              className="inline-flex items-center space-x-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider shadow-sm"
              style={{
                borderColor: theme.color + '60',
                backgroundColor: theme.color + '15',
                color: theme.color
              }}
            >
              <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>{theme.badgeText} VERDICT</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight break-words">
              {result.headline}
            </h2>

            <p className="text-xs sm:text-sm lg:text-base text-slate-300 font-sans leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {result.summary}
            </p>

            {/* Observable Entity Indicators */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-[11px] sm:text-xs font-mono">
              <div className="flex items-center space-x-1.5 sm:space-x-2 bg-[#161922] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-zinc-800 text-slate-300">
                <span className="text-slate-500">Confidence:</span>
                <span className="text-emerald-400 font-semibold">{result.evidenceStrength}</span>
              </div>

              {result.extractedEntities.amounts && result.extractedEntities.amounts.length > 0 && (
                <div className="flex items-center space-x-1.5 bg-red-950/40 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-red-500/40 text-red-300">
                  <span className="text-red-400 font-bold">Demands:</span>
                  <span className="truncate max-w-[180px] sm:max-w-none">{result.extractedEntities.amounts.join(', ')}</span>
                </div>
              )}

              {result.extractedEntities.claimedOrg && (
                <div className="flex items-center space-x-1.5 bg-[#161922] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-zinc-800 text-slate-300">
                  <span className="text-slate-500">Entity:</span>
                  <span className="text-slate-200 font-semibold truncate max-w-[160px] sm:max-w-none">{result.extractedEntities.claimedOrg}</span>
                </div>
              )}

              <div className="flex items-center space-x-1.5 bg-[#161922] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-zinc-800 text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{result.aiAssisted ? 'Correlated with Gemini' : 'Rule Engine'}</span>
              </div>

              <a
                href="#threat-category-breakdown"
                className="flex items-center space-x-1.5 bg-[#161922] hover:bg-zinc-800 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 text-slate-300 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Threat Categories</span>
              </a>

              <a
                href="#geographic-threat-visualization"
                className="flex items-center space-x-1.5 bg-emerald-950/40 hover:bg-emerald-950/70 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-emerald-500/40 text-emerald-300 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Geographic Telemetry</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
