import React from 'react';
import { DEMO_SCENARIOS } from '../data/demoScenarios.js';
import { DemoScenario } from '../types.js';
import { Sparkles, Briefcase, Home, Link2, FileText } from 'lucide-react';

interface DemoBarProps {
  onSelectScenario: (scenario: DemoScenario) => void;
  selectedId?: string;
}

export const DemoBar: React.FC<DemoBarProps> = ({ onSelectScenario, selectedId }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'demo-job':
        return Briefcase;
      case 'demo-rental':
        return Home;
      case 'demo-url':
        return Link2;
      default:
        return FileText;
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#12141a] via-[#161922] to-[#12141a] border border-emerald-500/30 p-4 sm:p-5 shadow-[0_0_20px_rgba(16,185,129,0.08)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono uppercase tracking-wider font-bold text-white">
            Instant Judge Demos (Fictional Test Scenarios)
          </span>
        </div>
        <span className="text-[11px] font-mono text-emerald-400/80 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/50">
          Click any preset to pre-fill & analyze
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {DEMO_SCENARIOS.map((sc) => {
          const Icon = getIcon(sc.id);
          const isSelected = selectedId === sc.id;

          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc)}
              type="button"
              className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer group ${
                isSelected
                  ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-[#161922] border-zinc-800 hover:border-zinc-700 hover:bg-[#1b1f2b] text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                <span className="text-xs font-mono font-bold tracking-tight">
                  {sc.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 leading-snug font-sans">
                {sc.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
