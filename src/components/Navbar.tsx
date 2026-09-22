import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, Globe, FileText, HelpCircle, Menu, X, RotateCcw, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onReset: () => void;
  onSelectMode: (mode: 'message' | 'url' | 'image' | 'email') => void;
  onOpenHowItWorks: () => void;
  onScrollToEvidence: () => void;
  isResultActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onReset,
  onSelectMode,
  onOpenHowItWorks,
  onScrollToEvidence,
  isResultActive
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#050811]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={onReset}
          className="flex items-center space-x-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onReset()}
          id="navbar-brand-logo"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-indigo-500/10 border border-cyan-500/30 group-hover:border-cyan-400 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <ShieldCheck className="w-5 h-5 text-cyan-400 group-hover:scale-105 transition-transform" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white font-mono">
                SCAM<span className="text-cyan-400">SHIELD</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                AI SEC-OPS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans tracking-wide">
              Pause. Verify. Protect.
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => { onReset(); onSelectMode('message'); }}
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900/80 transition-colors"
          >
            Investigate
          </button>
          <button
            type="button"
            onClick={() => { onReset(); onSelectMode('url'); }}
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900/80 transition-colors"
          >
            URL Scanner
          </button>
          <button
            type="button"
            onClick={() => { onReset(); onSelectMode('image'); }}
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900/80 transition-colors"
          >
            Document OCR
          </button>
          <button
            type="button"
            onClick={onScrollToEvidence}
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900/80 transition-colors"
          >
            Evidence Library
          </button>
          <button
            type="button"
            onClick={onOpenHowItWorks}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900/80 transition-colors flex items-center space-x-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How It Works</span>
          </button>
        </nav>

        {/* Right Status / Actions */}
        <div className="hidden sm:flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">AI INVESTIGATOR:</span>
            <span className="text-emerald-400 font-semibold">PROTECTED</span>
          </div>

          {isResultActive && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Scan</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center space-x-2">
          {isResultActive && (
            <button
              type="button"
              onClick={onReset}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400"
              title="New Investigation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#070b16] px-4 py-4 space-y-2 font-mono text-sm">
          <button
            type="button"
            onClick={() => { onReset(); onSelectMode('message'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900"
          >
            Investigate Message
          </button>
          <button
            type="button"
            onClick={() => { onReset(); onSelectMode('url'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900"
          >
            URL Scanner
          </button>
          <button
            type="button"
            onClick={() => { onReset(); onSelectMode('image'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900"
          >
            Document & Letter OCR
          </button>
          <button
            type="button"
            onClick={() => { onScrollToEvidence(); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900"
          >
            Evidence Library
          </button>
          <button
            type="button"
            onClick={() => { onOpenHowItWorks(); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-cyan-400 hover:bg-slate-900 flex items-center justify-between"
          >
            <span>How ScamShield Works</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
