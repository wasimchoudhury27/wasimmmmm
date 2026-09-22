import React, { useState } from 'react';
import { RiskSignal } from '../types.js';
import { CreditCard, Clock, Briefcase, UserCheck, Shield, Radio, Globe, Server, AlertCircle, ChevronDown, ChevronUp, Quote, LayoutGrid, List } from 'lucide-react';
import { motion } from 'motion/react';

interface EvidenceTimelineProps {
  signals: RiskSignal[];
}

export const EvidenceTimeline: React.FC<EvidenceTimelineProps> = ({ signals }) => {
  const [expandedId, setExpandedId] = useState<string | null>(signals[0]?.id || null);
  const [layoutMode, setLayoutMode] = useState<'timeline' | 'grid'>('timeline');

  const getSignalIcon = (category: RiskSignal['category']) => {
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

  const getSeverityBadge = (severity: RiskSignal['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-950/80 text-red-400 border-red-500/50';
      case 'HIGH':
        return 'bg-orange-950/80 text-orange-400 border-orange-500/50';
      case 'MODERATE':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/50';
      case 'LOW':
      default:
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50';
    }
  };

  if (signals.length === 0) {
    return (
      <div className="rounded-2xl bg-[#080d19] border border-slate-800 p-6 sm:p-8 text-center text-slate-400 font-mono text-xs sm:text-sm">
        No high-confidence threat signals isolated in this content.
      </div>
    );
  }

  return (
    <section className="space-y-4 sm:space-y-6">
      {/* Header with Title and Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 sm:pb-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-cyan-400 font-semibold block">
            FORENSIC EVIDENCE ANALYSIS
          </span>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-mono tracking-tight mt-0.5">
            WHY SCAMSHIELD FLAGGED THIS
          </h3>
        </div>

        <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="text-[11px] sm:text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
            {signals.length} Signal{signals.length > 1 ? 's' : ''} Isolated
          </div>

          <div className="p-0.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center text-xs font-mono">
            <button
              type="button"
              onClick={() => setLayoutMode('timeline')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-md transition-colors cursor-pointer flex items-center space-x-1 touch-manipulation ${
                layoutMode === 'timeline'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Timeline stream view"
              aria-label="Timeline stream view"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-md transition-colors cursor-pointer flex items-center space-x-1 touch-manipulation ${
                layoutMode === 'grid'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Signal grid view"
              aria-label="Signal grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Signal Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* TIMELINE MODE */}
      {layoutMode === 'timeline' && (
        <div className="relative border-l-2 border-slate-800/80 ml-2.5 sm:ml-4 pl-4 sm:pl-8 space-y-4 sm:space-y-6">
          {signals.map((sig, index) => {
            const isExpanded = expandedId === sig.id;
            const Icon = getSignalIcon(sig.category);
            const badgeClass = getSeverityBadge(sig.severity);
            const stepNumber = String(index + 1).padStart(2, '0');

            return (
              <div key={sig.id} className="relative group">
                {/* Compact responsive timeline indicator dot */}
                <div className="absolute -left-[23px] sm:-left-[39px] top-3.5 sm:top-4 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#050811] border-2 border-cyan-500/60 flex items-center justify-center text-[9px] sm:text-[10px] font-mono font-bold text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  {stepNumber}
                </div>

                {/* Expandable Forensic Card with Large Touch Target */}
                <div
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? 'bg-[#080d19] border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.08)]'
                      : 'bg-[#080d19]/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Clickable Header Row with minimum 48px touch target */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : sig.id)}
                    className="w-full text-left min-h-[48px] sm:min-h-[56px] p-3 sm:p-5 flex items-center justify-between gap-3 cursor-pointer touch-manipulation focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0 flex-1">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 flex-shrink-0">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap gap-y-1">
                          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                            {sig.category.replace('_', ' ')}
                          </span>
                          <span className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase font-bold ${badgeClass}`}>
                            {sig.severity}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                            +{sig.scoreWeight} pts
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base lg:text-lg font-bold text-white font-mono tracking-tight truncate mt-0.5">
                          {sig.name}
                        </h4>
                      </div>
                    </div>

                    <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-400 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Body Content */}
                  <div className="px-3 sm:px-5 pb-4 sm:pb-5 pt-0 space-y-3.5 font-sans text-xs sm:text-sm">
                    {/* Extracted Evidence Quotes */}
                    {sig.evidence.length > 0 && (
                      <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1.5">
                        <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-amber-400/90 font-bold block">
                          EXTRACTED QUOTE EVIDENCE:
                        </span>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {sig.evidence.map((ev, i) => (
                            <div
                              key={i}
                              className="bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs font-mono px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg flex items-center space-x-1.5 sm:space-x-2 max-w-full break-words"
                            >
                              <Quote className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 flex-shrink-0" />
                              <span className="break-all">&ldquo;{ev}&rdquo;</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* What SCAMSHIELD detected */}
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                        WHAT WAS OBSERVED:
                      </span>
                      <p className="text-slate-200 text-xs sm:text-sm leading-relaxed break-words">
                        {sig.whatDetected}
                      </p>
                    </div>

                    {/* Why it matters */}
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold block mb-1">
                        WHY IT MATTERS:
                      </span>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed break-words">
                        {sig.whyItMatters}
                      </p>
                    </div>

                    {/* Recommended mitigation (shown when expanded) */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3 sm:p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-100"
                      >
                        <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block mb-1">
                          DEFENSIVE MITIGATION:
                        </span>
                        <p className="text-xs sm:text-sm leading-relaxed font-medium break-words">
                          {sig.recommendedAction}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GRID MODE: Stacks Vertically on Mobile (1 col) without Overflow */}
      {layoutMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {signals.map((sig, index) => {
            const isExpanded = expandedId === sig.id;
            const Icon = getSignalIcon(sig.category);
            const badgeClass = getSeverityBadge(sig.severity);
            const stepNumber = String(index + 1).padStart(2, '0');

            return (
              <div
                key={sig.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'bg-[#080d19] border-cyan-500/40 shadow-lg'
                    : 'bg-[#080d19]/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Header button */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : sig.id)}
                  className="w-full text-left min-h-[50px] p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer touch-manipulation focus:outline-none"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 flex-shrink-0">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="text-[9px] sm:text-[10px] font-mono text-cyan-400 font-bold">
                          #{stepNumber}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${badgeClass}`}>
                          {sig.severity}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          +{sig.scoreWeight} pts
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white font-mono truncate mt-0.5">
                        {sig.name}
                      </h4>
                    </div>
                  </div>

                  <div className="w-7 h-7 flex items-center justify-center text-slate-400 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0">
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {/* Details */}
                <div className="px-3.5 pb-4 pt-0 space-y-2.5 text-xs">
                  <p className="text-slate-300 leading-relaxed break-words">
                    {sig.whatDetected}
                  </p>

                  {sig.evidence.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 font-mono text-[11px] text-amber-200 italic break-all">
                      &ldquo;{sig.evidence[0]}&rdquo;
                    </div>
                  )}

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 font-sans space-y-1.5"
                    >
                      <span className="text-[9px] font-mono text-cyan-400 uppercase font-bold block">
                        DEFENSIVE MITIGATION:
                      </span>
                      <p className="text-xs leading-relaxed">
                        {sig.recommendedAction}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
