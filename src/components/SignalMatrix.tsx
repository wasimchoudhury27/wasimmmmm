import React, { useState } from 'react';
import { RiskSignal } from '../types.js';
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  Clock,
  Briefcase,
  UserCheck,
  Shield,
  Radio,
  Globe,
  Server,
  AlertCircle
} from 'lucide-react';

interface SignalMatrixProps {
  signals: RiskSignal[];
}

export const SignalMatrix: React.FC<SignalMatrixProps> = ({ signals }) => {
  const [expandedId, setExpandedId] = useState<string | null>(signals[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getCategoryIcon = (category: RiskSignal['category']) => {
    switch (category) {
      case 'PAYMENT':
        return CreditCard;
      case 'URGENCY':
        return Clock;
      case 'EMPLOYMENT':
        return Briefcase;
      case 'IDENTITY':
        return UserCheck;
      case 'FINANCIAL':
        return Shield;
      case 'SOCIAL_ENG':
        return Radio;
      case 'URL_STRUCTURE':
        return Globe;
      case 'DOMAIN_INTEL':
        return Server;
      default:
        return AlertCircle;
    }
  };

  const getSeverityStyle = (severity: RiskSignal['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          badge: 'bg-red-950/80 text-red-400 border-red-500/40',
          barFill: 'bg-red-500',
          barPercent: 100,
          label: 'CRITICAL RISK'
        };
      case 'HIGH':
        return {
          badge: 'bg-orange-950/80 text-orange-400 border-orange-500/40',
          barFill: 'bg-orange-500',
          barPercent: 75,
          label: 'HIGH RISK'
        };
      case 'MODERATE':
        return {
          badge: 'bg-amber-950/80 text-amber-400 border-amber-500/40',
          barFill: 'bg-amber-500',
          barPercent: 50,
          label: 'MODERATE RISK'
        };
      default:
        return {
          badge: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
          barFill: 'bg-emerald-500',
          barPercent: 25,
          label: 'LOW RISK'
        };
    }
  };

  if (signals.length === 0) {
    return (
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6 text-center text-slate-400 font-mono text-sm">
        No active risk signals triggered by observable patterns.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-bold text-white font-mono uppercase tracking-wide">
            Risk Signal Matrix
          </h4>
          <p className="text-xs text-slate-400">
            Click any dimension to inspect detected markers, threat rationale, and mitigation.
          </p>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/60">
          {signals.length} Signal{signals.length > 1 ? 's' : ''} Isolated
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {signals.map((sig) => {
          const isExpanded = expandedId === sig.id;
          const Icon = getCategoryIcon(sig.category);
          const style = getSeverityStyle(sig.severity);

          return (
            <div
              key={sig.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'bg-[#161922] border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                  : 'bg-[#12141a]/90 border-zinc-800/80 hover:border-zinc-700 hover:bg-[#161922]'
              }`}
            >
              {/* Clickable Header Row */}
              <button
                type="button"
                onClick={() => toggleExpand(sig.id)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-[#161922] border border-zinc-800 text-emerald-400 flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                        {sig.category.replace('_', ' ')}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${style.badge}`}>
                        {style.label}
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-white tracking-wide truncate mt-0.5">
                      {sig.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 flex-shrink-0">
                  {/* Visual Density Meter Bar */}
                  <div className="hidden sm:flex flex-col items-end w-28">
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${style.barFill}`}
                        style={{ width: `${style.barPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-1">
                      Weight: +{sig.scoreWeight}
                    </span>
                  </div>

                  <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Expanded Diagnostic Intelligence */}
              {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-zinc-800 bg-[#0e1015] space-y-4 text-sm">
                  {/* WHAT WAS DETECTED */}
                  <div>
                    <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                      <span>01 // WHAT WAS DETECTED</span>
                    </h5>
                    <p className="text-slate-300 mt-1.5 text-xs sm:text-sm leading-relaxed">
                      {sig.whatDetected}
                    </p>
                  </div>

                  {/* EVIDENCE FROM INPUT */}
                  {sig.evidence.length > 0 && (
                    <div>
                      <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                        <span>02 // EVIDENCE EXTRACTED FROM INPUT</span>
                      </h5>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {sig.evidence.map((ev, i) => (
                          <div
                            key={i}
                            className="bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs font-mono px-2.5 py-1.5 rounded-md max-w-full break-all"
                          >
                            &ldquo;{ev}&rdquo;
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WHY IT MATTERS */}
                  <div>
                    <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                      <span>03 // WHY IT MATTERS (THREAT RATIONALE)</span>
                    </h5>
                    <p className="text-slate-300 mt-1.5 text-xs sm:text-sm leading-relaxed">
                      {sig.whyItMatters}
                    </p>
                  </div>

                  {/* WHAT USER SHOULD DO */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                    <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center space-x-1.5">
                      <span>04 // WHAT YOU SHOULD DO</span>
                    </h5>
                    <p className="text-emerald-100 mt-1 text-xs sm:text-sm font-medium leading-relaxed">
                      {sig.recommendedAction}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
