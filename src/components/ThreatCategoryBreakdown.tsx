import React, { useState } from 'react';
import type { AnalysisResult, SignalSeverity } from '../types.ts';
import {
  deriveThreatCategories,
  type ThreatCategoryData
} from '../utils/threatCategories.ts';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Fingerprint,
  CreditCard,
  Briefcase,
  KeyRound,
  MessageSquareWarning,
  Server,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ThreatCategoryBreakdownProps {
  result: AnalysisResult;
}

export const ThreatCategoryBreakdown: React.FC<ThreatCategoryBreakdownProps> = ({
  result
}) => {
  const summary = deriveThreatCategories(result);
  const { categories, totalThreatPoints, dominantCategory } = summary;

  // Selected category filter (null = all)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(
    categories[0]?.id || null
  );
  const [viewMode, setViewMode] = useState<'both' | 'bars' | 'tags'>('both');

  // Map category ID to relevant Lucide icon
  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'phishing':
        return ExternalLink;
      case 'brand_impersonation':
        return Fingerprint;
      case 'urgency_manipulation':
        return Clock;
      case 'payment_fraud':
        return CreditCard;
      case 'employment_fraud':
        return Briefcase;
      case 'credential_harvesting':
        return KeyRound;
      case 'social_engineering':
        return MessageSquareWarning;
      case 'infrastructure_anomalies':
        return Server;
      default:
        return AlertTriangle;
    }
  };

  // Color styles per severity
  const getSeverityStyle = (severity: SignalSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          textColor: 'text-red-400',
          bgColor: 'bg-red-950/70',
          borderColor: 'border-red-500/40',
          barGradient: 'from-red-600 via-rose-500 to-red-400',
          pillClass: 'bg-red-950/80 text-red-300 border-red-500/50',
          badgeText: 'CRITICAL',
          accentColor: '#ef4444'
        };
      case 'HIGH':
        return {
          textColor: 'text-orange-400',
          bgColor: 'bg-orange-950/70',
          borderColor: 'border-orange-500/40',
          barGradient: 'from-orange-600 via-amber-500 to-orange-400',
          pillClass: 'bg-orange-950/80 text-orange-300 border-orange-500/50',
          badgeText: 'HIGH',
          accentColor: '#f97316'
        };
      case 'MODERATE':
        return {
          textColor: 'text-amber-400',
          bgColor: 'bg-amber-950/70',
          borderColor: 'border-amber-500/40',
          barGradient: 'from-amber-600 via-yellow-500 to-amber-400',
          pillClass: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
          badgeText: 'MODERATE',
          accentColor: '#f59e0b'
        };
      case 'LOW':
      default:
        return {
          textColor: 'text-emerald-400',
          bgColor: 'bg-emerald-950/70',
          borderColor: 'border-emerald-500/40',
          barGradient: 'from-emerald-600 via-teal-500 to-emerald-400',
          pillClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
          badgeText: 'LOW',
          accentColor: '#10b981'
        };
    }
  };

  // Filtered categories according to active tag selection
  const displayedCategories = selectedCategoryId
    ? categories.filter((c) => c.id === selectedCategoryId)
    : categories;

  // Zero-threat state
  if (categories.length === 0) {
    return (
      <div
        id="threat-category-breakdown"
        className="rounded-2xl bg-[#12141a] border border-zinc-800 p-5 sm:p-7 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800/60 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wide">
                Threat Categories Identified
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Taxonomic classification of malicious vectors and behavioral markers
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-semibold">
            0 Flagged (Clean)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-emerald-300 font-mono">
              No Threat Categories Triggered
            </h4>
            <p className="text-xs text-slate-300 max-w-xl font-sans">
              Analyzed for Phishing, Brand Impersonation, Urgency Manipulation, and Payment Demands.
              No coercive patterns or adversarial structural signatures were isolated in this input.
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-wrap justify-center text-[11px] font-mono text-emerald-400">
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
              Phishing: Clean
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
              Impersonation: None
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
              Urgency: Nominal
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="threat-category-breakdown"
      className="rounded-2xl bg-[#12141a] border border-zinc-800 p-4 sm:p-6 lg:p-7 shadow-2xl relative overflow-hidden space-y-6"
    >
      {/* Top Header with taxonomy title & view toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 shadow-inner flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wide">
                Identified Threat Categories
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-500/40 text-[10px] sm:text-xs font-mono font-bold">
                {categories.length} {categories.length === 1 ? 'Category' : 'Categories'} Flagged
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Visual breakdown of scam tactics, behavioral coercion, and deceptive vectors
            </p>
          </div>
        </div>

        {/* Right side controls: Dominant tag & View Mode Switcher */}
        <div className="flex items-center space-x-2 self-start sm:self-auto flex-wrap">
          {dominantCategory && (
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#161922] border border-zinc-800 text-xs font-mono text-slate-300">
              <span className="text-slate-500">Primary:</span>
              <span className="text-amber-400 font-semibold">{dominantCategory.name}</span>
            </div>
          )}

          {/* View Mode Buttons (Touch-target friendly) */}
          <div className="inline-flex rounded-lg bg-[#161922] p-1 border border-zinc-800 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setViewMode('both')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'both'
                  ? 'bg-zinc-700/80 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Combined
            </button>
            <button
              type="button"
              onClick={() => setViewMode('bars')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'bars'
                  ? 'bg-zinc-700/80 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Progress Bars
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tags')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'tags'
                  ? 'bg-zinc-700/80 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tag List
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Segment Composite Threat Distribution Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Composite Threat Surface Share</span>
          </span>
          <span className="text-slate-400 text-[11px]">
            {totalThreatPoints} total risk weight pts
          </span>
        </div>

        {/* Stacked Proportional Bar */}
        <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800 flex gap-0.5">
          {categories.map((cat) => {
            const style = getSeverityStyle(cat.severity);
            const proportion = Math.max(8, Math.round((cat.score / Math.max(1, totalThreatPoints)) * 100));
            return (
              <div
                key={cat.id}
                title={`${cat.name}: ${cat.percentage}% intensity (+${cat.score} pts)`}
                style={{ width: `${proportion}%` }}
                onClick={() => setSelectedCategoryId((prev) => (prev === cat.id ? null : cat.id))}
                className={`h-full rounded-full cursor-pointer transition-all duration-300 hover:opacity-100 opacity-90 bg-gradient-to-r ${style.barGradient} ${
                  selectedCategoryId === cat.id ? 'ring-2 ring-white scale-y-110' : ''
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* 1. VISUAL TAG LIST: Quick scannable badges with category indicators & score contribution */}
      {(viewMode === 'both' || viewMode === 'tags') && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              <span>Threat Category Tags (Click to focus)</span>
            </span>
            {selectedCategoryId && (
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className="text-[11px] font-mono text-emerald-400 hover:underline cursor-pointer"
              >
                Clear filter (Show all)
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-0.5">
            {/* "All" Tag */}
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer flex items-center space-x-2 border touch-manipulation ${
                selectedCategoryId === null
                  ? 'bg-zinc-800 border-zinc-600 text-white shadow-md'
                  : 'bg-[#161922] border-zinc-800 text-slate-400 hover:text-slate-200 hover:border-zinc-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Categories ({categories.length})</span>
            </button>

            {/* Individual Category Tags */}
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.id);
              const style = getSeverityStyle(cat.severity);
              const isSelected = selectedCategoryId === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(isSelected ? null : cat.id)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer flex items-center space-x-2.5 border touch-manipulation ${
                    isSelected
                      ? `${style.bgColor} ${style.borderColor} ${style.textColor} ring-2 ring-emerald-400/50 shadow-lg scale-[1.02]`
                      : 'bg-[#161922] border-zinc-800/90 text-slate-300 hover:bg-[#1a1e2a] hover:border-zinc-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${style.textColor} flex-shrink-0`} />
                  <span className="font-semibold">{cat.name}</span>

                  {/* Severity Tag Pill */}
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${style.pillClass}`}
                  >
                    {style.badgeText}
                  </span>

                  {/* Score Weight Pill */}
                  <span className="text-[11px] text-slate-400 font-mono">
                    +{cat.score} pts
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. VISUAL PROGRESS BARS BREAKDOWN: Detailed cards with calibrated progress bars */}
      {(viewMode === 'both' || viewMode === 'bars') && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Taxonomic Severity & Intensity Progress Bars
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Showing {displayedCategories.length} of {categories.length}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {displayedCategories.map((cat) => {
              const Icon = getCategoryIcon(cat.id);
              const style = getSeverityStyle(cat.severity);
              const isExpanded = expandedCategoryId === cat.id;

              return (
                <div
                  key={cat.id}
                  className={`rounded-xl border transition-all p-3.5 sm:p-4 bg-[#161922] ${
                    selectedCategoryId === cat.id
                      ? `${style.borderColor} ring-1 ring-emerald-500/30`
                      : 'border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  {/* Top Header of Category Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className={`p-2 rounded-lg border ${style.bgColor} ${style.borderColor} ${style.textColor} flex-shrink-0`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white font-mono">
                            {cat.name}
                          </h4>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${style.pillClass}`}
                          >
                            {style.badgeText} SEVERITY
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {cat.signalCount} {cat.signalCount === 1 ? 'signal' : 'signals'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-sans line-clamp-1 mt-0.5">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar Metrics Badges */}
                    <div className="flex items-center space-x-3 self-end sm:self-auto flex-shrink-0 font-mono text-xs">
                      <div className="text-right">
                        <span className="text-slate-500 text-[10px] block">Weight</span>
                        <span className={`font-bold ${style.textColor}`}>+{cat.score} pts</span>
                      </div>
                      <div className="text-right pl-2 border-l border-zinc-800">
                        <span className="text-slate-500 text-[10px] block">Intensity</span>
                        <span className="font-bold text-white">{cat.percentage}%</span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCategoryId((prev) => (prev === cat.id ? null : cat.id))
                        }
                        className="p-1.5 rounded-lg bg-[#12141a] hover:bg-zinc-800 border border-zinc-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        title={isExpanded ? 'Collapse indicators' : 'Inspect indicators'}
                        aria-label={isExpanded ? 'Collapse indicators' : 'Inspect indicators'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* VISUAL PROGRESS BAR */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Threat Intensity Progress</span>
                      <span className={style.textColor}>{cat.percentage}% of category ceiling</span>
                    </div>

                    {/* Calibrated Progress Track */}
                    <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800/90 relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${style.barGradient} relative shadow-sm`}
                      >
                        {/* Shimmer line inside progress bar */}
                        <div className="absolute inset-0 bg-white/15 opacity-60 rounded-full" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Key Trigger Tags (Observable Evidence Chips) */}
                  {cat.indicators.length > 0 && (
                    <div className="mt-3 flex items-center flex-wrap gap-1.5 text-[11px] font-mono">
                      <span className="text-slate-500 text-[10px] uppercase">Key Triggers:</span>
                      {cat.indicators.slice(0, 3).map((ind, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-[#12141a] border border-zinc-800 text-slate-300 truncate max-w-[260px]"
                        >
                          &ldquo;{ind}&rdquo;
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expandable Deep Rationale & Defensive Protocol */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mt-3 pt-3 border-t border-zinc-800/80 space-y-2.5"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs font-sans">
                          {/* Why this matters */}
                          <div className="p-3 rounded-lg bg-[#12141a] border border-zinc-800/90 space-y-1">
                            <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">
                              Taxonomic Rationale
                            </span>
                            <p className="text-slate-300 leading-relaxed">
                              {cat.description}
                            </p>
                          </div>

                          {/* Defensive recommendation */}
                          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                            <span className="text-[11px] font-mono uppercase text-emerald-400 font-semibold block flex items-center space-x-1">
                              <Sparkles className="w-3 h-3 flex-shrink-0" />
                              <span>Neutralization Protocol</span>
                            </span>
                            <p className="text-emerald-200/90 leading-relaxed">
                              {cat.defensiveAction}
                            </p>
                          </div>
                        </div>

                        {/* Associated Signals List */}
                        {cat.signals.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-mono uppercase text-slate-500">
                              Correlated Detection Rules:
                            </span>
                            <div className="space-y-1">
                              {cat.signals.map((sig) => (
                                <div
                                  key={sig.id}
                                  className="flex items-center justify-between text-xs font-mono p-2 rounded-md bg-[#12141a] border border-zinc-800/60"
                                >
                                  <span className="text-slate-300 truncate pr-2">
                                    • {sig.name}
                                  </span>
                                  <span className={`flex-shrink-0 ${style.textColor} font-semibold`}>
                                    +{sig.scoreWeight} pts
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-slate-500 gap-1.5 border-t border-zinc-800/60">
        <span className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>Classified via SCAMSHIELD Multi-Vector Threat Intelligence Engine</span>
        </span>
        <span className="italic">
          Categories evaluate intent, linguistic coercion, identity spoofing, and infrastructure
        </span>
      </div>
    </div>
  );
};
