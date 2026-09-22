import React from 'react';
import { X, ShieldCheck, Cpu, Lock, CheckCircle2, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-[#080d19] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-300"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wide">
                  HOW SCAMSHIELD WORKS
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Dual-Engine Architecture: Deterministic Rules &amp; Gemini AI
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm">
            {/* Engine 1: Deterministic */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase">
                <Cpu className="w-4 h-4" />
                <span>1. Zero-Tolerance Deterministic Rule Matrix</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                SCAMSHIELD operates with hard-coded zero-tolerance algorithms. When an unvetted message offers employment, housing, or lottery selection while simultaneously demanding an upfront deposit, laptop fee, or gate pass via UPI or bank transfer, the deterministic engine mandates an immediate critical threat classification.
              </p>
            </div>

            {/* Engine 2: Gemini Multimodal AI */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs font-bold uppercase">
                <Zap className="w-4 h-4" />
                <span>2. Gemini Multimodal Intelligence</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Our Gemini vision and language pipeline extracts semantic nuances, evaluates psychological coercion, checks for brand homoglyph spoofing in URLs, inspects letterheads for counterfeit artifacts, and correlates isolated signals into a cohesive forensic narrative.
              </p>
            </div>

            {/* Pillar 3: Privacy & Zero Storage */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                <Lock className="w-4 h-4" />
                <span>3. Ephemeral In-Memory Privacy</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Your submitted text, screenshots, and URLs are evaluated entirely in volatile memory. SCAMSHIELD retains zero logs, databases, or training snapshots of your submissions. Once your session ends, the evidence is permanently purged.
              </p>
            </div>

            {/* The 3-Step Doctrine */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                THE 3-STEP SECURITY DOCTRINE:
              </span>
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-300">
                  <div className="font-bold text-white mb-0.5">1. PAUSE</div>
                  <div className="text-[10px] text-slate-400">Ignore 2-hour timers</div>
                </div>
                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300">
                  <div className="font-bold text-white mb-0.5">2. VERIFY</div>
                  <div className="text-[10px] text-slate-400">Search official portals</div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
                  <div className="font-bold text-white mb-0.5">3. PROTECT</div>
                  <div className="text-[10px] text-slate-400">Block and report</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold transition-all"
            >
              Got It
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
