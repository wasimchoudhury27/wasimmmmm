import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, ExternalLink, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';

interface FixedDisclaimerProps {
  onLearnMore?: () => void;
}

export const FixedDisclaimer: React.FC<FixedDisclaimerProps> = ({ onLearnMore }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      id="fixed-investigation-disclaimer"
      aria-label="Security Risk Assessment Disclaimer"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-amber-500/40 bg-[#12141a]/95 backdrop-blur-md shadow-[0_-8px_30px_rgba(0,0,0,0.7)] transition-all duration-300"
    >
      {/* Top micro-accent bar with glowing signal */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-500/20 via-amber-400 to-amber-500/20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
          {/* Left section: Icon + Philosophy + Core Disclaimer */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-1 rounded-md bg-amber-950/80 border border-amber-500/50 text-amber-400 flex-shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="font-mono font-bold text-amber-400 uppercase tracking-wider text-[10px] sm:text-[11px]">
                  ASSESSMENT NOTICE:
                </span>
                <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-mono text-[9px] sm:text-[10px] uppercase font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Pause. Verify. Protect.</span>
                </span>
              </div>

              <p className="text-slate-300 text-[11px] sm:text-xs mt-0.5 font-sans leading-snug truncate sm:whitespace-normal">
                SCAMSHIELD provides automated heuristic risk scores, not legal fraud determinations.
                <span className="text-amber-200 font-medium hidden sm:inline"> Always verify independently before transferring funds or sharing credentials.</span>
              </p>
            </div>
          </div>

          {/* Right section: Action pill / toggle for detailed guideline */}
          <div className="flex items-center space-x-2 flex-shrink-0 justify-end">
            <button
              type="button"
              id="disclaimer-toggle-guidelines"
              onClick={() => setIsExpanded(prev => !prev)}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#161922] hover:bg-zinc-800 border border-zinc-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 font-mono text-[10px] sm:text-[11px] transition-colors cursor-pointer"
              aria-expanded={isExpanded}
            >
              <span>{isExpanded ? 'Hide Protocol' : 'Protocol'}</span>
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-amber-400" />
              ) : (
                <ChevronUp className="w-3 h-3 text-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Protocol Drawer for Deeper Guidance */}
        {isExpanded && (
          <div 
            id="disclaimer-expanded-protocol"
            className="mt-3 pt-3 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-mono animate-fadeIn"
          >
            <div className="p-2.5 rounded-lg bg-[#161922] border border-zinc-800 flex items-start space-x-2">
              <span className="text-emerald-400 font-bold">1. PAUSE</span>
              <p className="text-slate-400 font-sans">
                Never react hurriedly to manufactured countdowns or threat of offer cancellation.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-[#161922] border border-zinc-800 flex items-start space-x-2">
              <span className="text-amber-400 font-bold">2. VERIFY</span>
              <p className="text-slate-400 font-sans">
                Look up corporate switchboards or trusted government portals directly, avoiding provided links.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-[#161922] border border-zinc-800 flex items-start space-x-2">
              <span className="text-emerald-400 font-bold">3. PROTECT</span>
              <p className="text-slate-400 font-sans">
                Report suspicious communications to cybercrime portals (<span className="text-slate-300">cybercrime.gov.in</span>) and freeze compromised channels.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
