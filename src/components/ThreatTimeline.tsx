import React, { useState, useMemo } from 'react';
import { AnalysisResult, RiskSignal } from '../types.js';
import {
  Clock,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Briefcase,
  UserCheck,
  Radio,
  Globe,
  ChevronRight,
  ChevronLeft,
  Quote,
  Flame,
  ArrowRight,
  Layers,
  Sparkles,
  Sliders,
  AlignLeft,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ThreatTimelineProps {
  result: AnalysisResult;
}

export interface TimelineMilestone {
  id: string;
  stepNumber: number;
  phaseName: string;
  stageTitle: string;
  category: RiskSignal['category'] | 'HOOK' | 'ULTIMATUM';
  severity: RiskSignal['severity'];
  pointsContribution: number;
  cumulativeScore: number;
  textPosition: {
    startChar: number;
    endChar: number;
    percentage: number;
    paragraphIndex: number;
  };
  quoteText: string;
  whatDetected: string;
  psychologicalIntent: string;
  signalRef?: RiskSignal;
}

export const ThreatTimeline: React.FC<ThreatTimelineProps> = ({ result }) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'stepper' | 'stream'>('stepper');
  const [showFullTextContext, setShowFullTextContext] = useState<boolean>(true);

  const fullText = result.rawInputText || result.inputSnippet || '';

  // Extract chronological threat milestones based on input text sequence
  const milestones: TimelineMilestone[] = useMemo(() => {
    const rawText = fullText;
    const lowerText = rawText.toLowerCase();

    // Map each signal to its earliest occurrence in the text
    const matchedItems: {
      signal: RiskSignal;
      earliestPos: number;
      bestQuote: string;
    }[] = [];

    result.signals.forEach((sig) => {
      let earliestPos = Infinity;
      let bestQuote = '';

      if (sig.evidence && sig.evidence.length > 0) {
        for (const ev of sig.evidence) {
          const cleanEv = ev.trim().toLowerCase();
          const pos = lowerText.indexOf(cleanEv);
          if (pos !== -1 && pos < earliestPos) {
            earliestPos = pos;
            bestQuote = ev;
          }
        }
      }

      // If exact quote wasn't located verbatim, search by signal name or whatDetected keywords
      if (earliestPos === Infinity) {
        const keywords = sig.name.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
        for (const kw of keywords) {
          const pos = lowerText.indexOf(kw);
          if (pos !== -1 && pos < earliestPos) {
            earliestPos = pos;
            bestQuote = sig.evidence[0] || sig.whatDetected;
            break;
          }
        }
      }

      // Default fallback position based on category
      if (earliestPos === Infinity) {
        if (sig.category === 'EMPLOYMENT' || sig.category === 'IDENTITY') earliestPos = 20;
        else if (sig.category === 'URGENCY') earliestPos = Math.floor(rawText.length * 0.4);
        else if (sig.category === 'PAYMENT' || sig.category === 'FINANCIAL') earliestPos = Math.floor(rawText.length * 0.7);
        else earliestPos = Math.floor(rawText.length * 0.5);
        bestQuote = sig.evidence[0] || sig.whatDetected;
      }

      matchedItems.push({
        signal: sig,
        earliestPos,
        bestQuote: bestQuote || sig.whatDetected
      });
    });

    // Sort strictly by position in the input text (chronological flow)
    matchedItems.sort((a, b) => a.earliestPos - b.earliestPos);

    // Calculate cumulative threat trajectory
    let runningScore = 0;
    const items: TimelineMilestone[] = [];

    matchedItems.forEach((item, index) => {
      const sig = item.signal;
      const pts = sig.scoreWeight || 20;
      runningScore = Math.min(100, runningScore + pts);

      // Paragraph calculation
      const textUpToPos = rawText.slice(0, item.earliestPos);
      const paragraphIndex = textUpToPos.split(/\n\s*\n/).length;
      const percentage = rawText.length > 0 ? Math.min(100, Math.round((item.earliestPos / rawText.length) * 100)) : 50;

      // Determine phase label & psychological intent
      let phaseName = `PHASE 0${index + 1}`;
      let stageTitle = sig.name;
      let psychologicalIntent = sig.whyItMatters;

      if (index === 0 && (sig.category === 'EMPLOYMENT' || sig.category === 'IDENTITY')) {
        phaseName = 'PHASE 01: THE PRETEXT HOOK';
        stageTitle = 'Trust Acquisition & Bait';
        psychologicalIntent = 'Lowers victim defenses through perceived authority, flattery, or an unvetted instant selection.';
      } else if (sig.category === 'URGENCY') {
        phaseName = `PHASE 0${index + 1}: PSYCHOLOGICAL COERCION`;
        stageTitle = 'Manufactured Deadline Pressure';
        psychologicalIntent = 'Pre-empts rational verification and third-party consultation by creating an artificial expiration countdown.';
      } else if (sig.category === 'PAYMENT' || sig.category === 'FINANCIAL') {
        phaseName = `PHASE 0${index + 1}: FINANCIAL REQUISITION`;
        stageTitle = 'The Monetary Extraction Trap';
        psychologicalIntent = 'Demands non-refundable transfer (UPI/GPay/Deposit/Vendor Checkout) framed as routine or refundable.';
      } else if (index === matchedItems.length - 1 && runningScore >= 80) {
        phaseName = `PHASE 0${index + 1}: THE FORFEITURE ULTIMATUM`;
        stageTitle = 'Consequence Threat & Final Push';
        psychologicalIntent = 'Uses threat of cancellation, legal penalty, or lost opportunity to force immediate compliance.';
      }

      items.push({
        id: `milestone-${sig.id || index}`,
        stepNumber: index + 1,
        phaseName,
        stageTitle,
        category: sig.category,
        severity: sig.severity,
        pointsContribution: pts,
        cumulativeScore: runningScore,
        textPosition: {
          startChar: item.earliestPos,
          endChar: item.earliestPos + item.bestQuote.length,
          percentage,
          paragraphIndex
        },
        quoteText: item.bestQuote,
        whatDetected: sig.whatDetected,
        psychologicalIntent,
        signalRef: sig
      });
    });

    // If no signals were identified, generate an informational timeline item
    if (items.length === 0) {
      items.push({
        id: 'milestone-empty',
        stepNumber: 1,
        phaseName: 'PHASE 01: INGESTION & SCAN',
        stageTitle: 'Baseline Content Evaluation',
        category: 'HOOK',
        severity: 'LOW',
        pointsContribution: 0,
        cumulativeScore: result.threatScore,
        textPosition: { startChar: 0, endChar: rawText.length, percentage: 100, paragraphIndex: 1 },
        quoteText: rawText.slice(0, 150) || 'Analyzed content',
        whatDetected: 'No critical advance-fee or high-threat triggers were isolated in sequential analysis.',
        psychologicalIntent: 'The communication appears conversational or standard without obvious deceptive progression.',
      });
    }

    return items;
  }, [fullText, result.signals, result.threatScore]);

  const activeMilestone = milestones[activeStepIndex] || milestones[0];

  const getSeverityBadgeClass = (severity: RiskSignal['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-950/80 text-red-400 border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      case 'HIGH':
        return 'bg-orange-950/80 text-orange-400 border-orange-500/60 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
      case 'MODERATE':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/60';
      case 'LOW':
      default:
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/60';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PAYMENT':
      case 'FINANCIAL':
        return CreditCard;
      case 'URGENCY':
        return Clock;
      case 'EMPLOYMENT':
        return Briefcase;
      case 'IDENTITY':
        return UserCheck;
      case 'SOCIAL_ENG':
        return Radio;
      case 'URL_STRUCTURE':
      case 'DOMAIN_INTEL':
        return Globe;
      default:
        return AlertTriangle;
    }
  };

  return (
    <section id="threat-timeline-section" className="space-y-4 sm:space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 sm:pb-4">
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex-shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-cyan-400 font-bold">
                CHRONOLOGICAL ATTACK ANATOMY
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300">
                {milestones.length} Stages
              </span>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-mono tracking-tight mt-0.5 truncate">
              THREAT TIMELINE
            </h3>
          </div>
        </div>

        {/* View Mode Toggle & Text Context Button */}
        <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-between sm:justify-end flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowFullTextContext(!showFullTextContext)}
            className={`min-h-[40px] flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer touch-manipulation ${
              showFullTextContext
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Text In Context</span>
            <span className="sm:hidden">Context</span>
          </button>

          <div className="p-0.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewMode('stepper')}
              className={`min-h-[38px] px-3 py-1 rounded-md transition-colors cursor-pointer touch-manipulation ${
                viewMode === 'stepper'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Step-by-Step
            </button>
            <button
              type="button"
              onClick={() => setViewMode('stream')}
              className={`min-h-[38px] px-3 py-1 rounded-md transition-colors cursor-pointer touch-manipulation ${
                viewMode === 'stream'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Stream
            </button>
          </div>
        </div>
      </div>

      {/* STEPPER MODE: Interactive Scrubbing Track */}
      {viewMode === 'stepper' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Progress Bar / Scrub Track */}
          <div className="rounded-2xl bg-[#080d19] border border-slate-800 p-4 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 text-xs font-mono text-slate-400 mb-3 sm:mb-4">
              <span className="text-cyan-400 font-bold tracking-wider text-[11px] sm:text-xs">
                CHRONOLOGICAL READING PROGRESSION
              </span>
              <div className="flex items-center space-x-2 text-[11px] sm:text-xs">
                <span>Threat Velocity:</span>
                <span className="text-red-400 font-bold flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>+{activeMilestone.pointsContribution} pts in Phase 0{activeMilestone.stepNumber}</span>
                </span>
              </div>
            </div>

            {/* Stepper Track Nodes with generous touch-targets */}
            <div className="relative pt-3 sm:pt-4 pb-2 overflow-x-auto">
              {/* Connecting conduit line */}
              <div className="absolute top-7 sm:top-8 left-4 right-4 h-1 bg-slate-800 rounded-full pointer-events-none" />
              <div
                className="absolute top-7 sm:top-8 left-4 h-1 bg-gradient-to-r from-cyan-500 via-amber-400 to-red-500 rounded-full transition-all duration-300 pointer-events-none"
                style={{
                  width: `${(activeStepIndex / Math.max(1, milestones.length - 1)) * 92}%`
                }}
              />

              <div className="relative flex justify-between items-center z-10 min-w-[280px]">
                {milestones.map((m, idx) => {
                  const isActive = idx === activeStepIndex;
                  const isPassed = idx < activeStepIndex;
                  const Icon = getCategoryIcon(m.category);

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setActiveStepIndex(idx)}
                      className="group flex flex-col items-center cursor-pointer focus:outline-none touch-manipulation min-w-[44px] min-h-[44px] justify-center"
                      aria-label={`Phase ${m.stepNumber}: ${m.stageTitle}`}
                    >
                      <div
                        className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-200 border ${
                          isActive
                            ? 'bg-cyan-950 border-cyan-400 text-cyan-300 scale-110 shadow-[0_0_20px_rgba(6,182,212,0.4)] ring-2 ring-cyan-500/20'
                            : isPassed
                            ? 'bg-slate-900 border-slate-700 text-slate-300'
                            : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                      </div>

                      <span
                        className={`text-[9px] sm:text-[10px] font-mono mt-1.5 font-bold tracking-tight ${
                          isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'
                        }`}
                      >
                        0{m.stepNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stepper Navigation Buttons with 44px touch targets */}
            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-800/80 mt-3 sm:mt-4 text-xs font-mono">
              <button
                type="button"
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                className="min-h-[44px] flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation"
              >
                <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs">Prev</span>
              </button>

              <span className="text-slate-400 text-[10px] sm:text-[11px]">
                {activeStepIndex + 1} / {milestones.length}
              </span>

              <button
                type="button"
                disabled={activeStepIndex === milestones.length - 1}
                onClick={() => setActiveStepIndex((prev) => Math.min(milestones.length - 1, prev + 1))}
                className="min-h-[44px] flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation"
              >
                <span className="text-[11px] sm:text-xs">Next</span>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </button>
            </div>
          </div>

          {/* Active Milestone Deep Dive Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Left 7 cols: Forensic Anatomy of Current Phase */}
            <div className="lg:col-span-7 rounded-2xl bg-[#080d19] border border-cyan-500/30 p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    {activeMilestone.phaseName}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-[10px] sm:text-[11px] font-mono text-slate-400">
                    Paragraph {activeMilestone.textPosition.paragraphIndex}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase ${getSeverityBadgeClass(activeMilestone.severity)}`}>
                    {activeMilestone.severity}
                  </span>
                  <span className="text-[11px] sm:text-xs font-mono text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/60 font-semibold">
                    +{activeMilestone.pointsContribution} pts
                  </span>
                </div>
              </div>

              {/* Title & Detected Pattern */}
              <div>
                <h4 className="text-base sm:text-lg lg:text-xl font-bold font-mono text-white tracking-tight break-words">
                  {activeMilestone.stageTitle}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 leading-relaxed break-words">
                  {activeMilestone.whatDetected}
                </p>
              </div>

              {/* Observable Quote Box */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-1.5 shadow-inner">
                <div className="flex items-center space-x-2 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  <Quote className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Observable Excerpt from Text:</span>
                </div>
                <p className="text-xs sm:text-sm font-mono text-amber-200 font-medium italic leading-relaxed break-words break-all">
                  &ldquo;{activeMilestone.quoteText}&rdquo;
                </p>
              </div>

              {/* Psychological Intent Deconstruction */}
              <div className="p-3 sm:p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                  ATTACK INTENT &amp; PSYCHOLOGICAL MECHANIC:
                </span>
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed break-words">
                  {activeMilestone.psychologicalIntent}
                </p>
              </div>

              {/* Cumulative Threat Bar at this Phase */}
              <div className="space-y-1.5 pt-1 sm:pt-2">
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono">
                  <span className="text-slate-400">Cumulative Threat:</span>
                  <span className="font-bold text-white font-mono">
                    {activeMilestone.cumulativeScore} <span className="text-slate-500 text-[10px]">/ 100</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      activeMilestone.cumulativeScore >= 80
                        ? 'bg-red-500'
                        : activeMilestone.cumulativeScore >= 50
                        ? 'bg-amber-400'
                        : 'bg-cyan-400'
                    }`}
                    style={{ width: `${activeMilestone.cumulativeScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right 5 cols: Live Text In Context Viewer */}
            <div className="lg:col-span-5 rounded-2xl bg-[#080d19] border border-slate-800 p-4 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                    <AlignLeft className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold uppercase text-[11px] sm:text-xs">Evidence In Text Context</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    ~{activeMilestone.textPosition.percentage}% of message
                  </span>
                </div>

                <p className="text-[11px] sm:text-xs text-slate-400 font-sans">
                  Notice how deceptive cues build upon preceding sentences:
                </p>

                {/* Highlighted text preview box */}
                <div className="p-3 rounded-xl bg-[#050811] border border-slate-800 max-h-48 sm:max-h-64 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-text break-words">
                  {fullText.length > 0 ? (
                    (() => {
                      const quote = activeMilestone.quoteText;
                      const idx = fullText.toLowerCase().indexOf(quote.toLowerCase());
                      if (idx === -1) {
                        return fullText;
                      }
                      const before = fullText.slice(0, idx);
                      const match = fullText.slice(idx, idx + quote.length);
                      const after = fullText.slice(idx + quote.length);

                      return (
                        <>
                          <span className="opacity-50">{before}</span>
                          <mark className="bg-amber-500/30 text-amber-200 border-b-2 border-amber-400 px-1 py-0.5 rounded font-bold shadow-sm">
                            {match}
                          </mark>
                          <span className="opacity-50">{after}</span>
                        </>
                      );
                    })()
                  ) : (
                    <span>No textual content available.</span>
                  )}
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] sm:text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Vector: {activeMilestone.category}</span>
                <span className="text-cyan-400 font-semibold">Stage 0{activeMilestone.stepNumber} of 0{milestones.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STREAM MODE: Complete Chronological Timeline List */}
      {viewMode === 'stream' && (
        <div className="space-y-4">
          <div className="relative border-l-2 border-slate-800 ml-4 pl-6 sm:pl-8 space-y-6">
            {milestones.map((m, idx) => {
              const Icon = getCategoryIcon(m.category);
              return (
                <div key={m.id} className="relative group">
                  {/* Step Dot */}
                  <div className="absolute -left-[33px] sm:-left-[41px] top-4 w-7 h-7 rounded-full bg-[#050811] border-2 border-cyan-500/70 flex items-center justify-center text-[10px] font-mono font-bold text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    0{m.stepNumber}
                  </div>

                  {/* Card */}
                  <div className="rounded-2xl bg-[#080d19] border border-slate-800 p-5 space-y-3.5 hover:border-slate-700 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                            {m.phaseName}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-white font-mono">
                            {m.stageTitle}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase ${getSeverityBadgeClass(m.severity)}`}>
                          {m.severity}
                        </span>
                        <span className="text-xs font-mono text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/60 font-semibold">
                          +{m.pointsContribution} pts
                        </span>
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs text-amber-200 italic">
                      &ldquo;{m.quoteText}&rdquo;
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-0.5">
                          OBSERVED PATTERN:
                        </span>
                        <p className="text-slate-300 leading-relaxed">
                          {m.whatDetected}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-0.5">
                          PSYCHOLOGICAL LEVERAGE:
                        </span>
                        <p className="text-slate-300 leading-relaxed">
                          {m.psychologicalIntent}
                        </p>
                      </div>
                    </div>

                    {/* Footer progress bar */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>Position in text: ~{m.textPosition.percentage}% (Paragraph {m.textPosition.paragraphIndex})</span>
                      <span className="text-slate-300 font-bold">
                        Cumulative Threat: <span className="text-cyan-400">{m.cumulativeScore}/100</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
