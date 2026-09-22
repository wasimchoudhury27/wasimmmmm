import React from 'react';
import { DEMO_SCENARIOS } from '../data/demoScenarios.js';
import { DemoScenario } from '../types.js';
import { Briefcase, Home, Link2, FileCheck, ArrowRight, ShieldAlert, Sparkles, Fingerprint } from 'lucide-react';
import { motion } from 'motion/react';

interface EvidenceLibraryProps {
  onSelectScenario: (scenario: DemoScenario, autoSubmit?: boolean) => void;
  selectedId?: string;
  isLoading?: boolean;
}

export const EvidenceLibrary: React.FC<EvidenceLibraryProps> = ({
  onSelectScenario,
  selectedId,
  isLoading = false
}) => {
  const getEvidenceMetadata = (id: string) => {
    switch (id) {
      case 'demo-job':
        return {
          docketId: 'EV-JOB-0912',
          badgeText: 'JOB OFFER',
          threatType: 'Advance-Fee Recruitment Scam',
          signalTags: ['₹4,999 Security Fee', 'Direct Selection', '2-Hour Pressure'],
          icon: Briefcase,
          accentBorder: 'hover:border-emerald-500/50',
          accentGlow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]'
        };
      case 'demo-rental':
        return {
          docketId: 'EV-RENT-4401',
          badgeText: 'RENTAL DEPOSIT',
          threatType: 'Advance Gate-Pass Deposit Fraud',
          signalTags: ['₹10,000 QR Deposit', 'Owner Out of Town', 'Instant Viewing Bait'],
          icon: Home,
          accentBorder: 'hover:border-amber-500/50',
          accentGlow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.12)]'
        };
      case 'demo-url':
        return {
          docketId: 'EV-URL-8823',
          badgeText: 'PAYMENT LINK',
          threatType: 'Spoofed Banking KYC Phishing',
          signalTags: ['Disposable .xyz TLD', 'SBI Brand Homograph', 'Insecure Transport'],
          icon: Link2,
          accentBorder: 'hover:border-red-500/50',
          accentGlow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.12)]'
        };
      case 'demo-appointment':
      default:
        return {
          docketId: 'EV-DOC-6105',
          badgeText: 'APPOINTMENT',
          threatType: 'Fake Corporate Onboarding Directive',
          signalTags: ['₹3,450 Biometric Fee', 'Legal Threat Ultimatums', '60-Min Timer'],
          icon: FileCheck,
          accentBorder: 'hover:border-emerald-500/50',
          accentGlow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]'
        };
    }
  };

  return (
    <section id="evidence-library-section" className="w-full max-w-6xl mx-auto space-y-4 pt-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-[#161922] border border-zinc-800 text-emerald-400">
            <Fingerprint className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              EVIDENCE LIBRARY — REAL-WORLD SCAM ARCHETYPES
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Curated forensic case dockets for instant test evaluation
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-emerald-400/90 bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-800/40">
          Click any docket to load & investigate
        </div>
      </div>

      {/* Grid of Evidence Dockets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEMO_SCENARIOS.map((sc) => {
          const meta = getEvidenceMetadata(sc.id);
          const Icon = meta.icon;
          const isSelected = selectedId === sc.id;

          return (
            <motion.div
              key={sc.id}
              whileHover={{ y: -4, transition: { duration: 0.15 } }}
              className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer relative overflow-hidden group ${meta.accentBorder} ${meta.accentGlow} ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : 'bg-[#12141a] border-zinc-800/80 hover:bg-[#161922]'
              }`}
              onClick={() => onSelectScenario(sc, true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectScenario(sc, true)}
            >
              {/* Top Case Docket ID & Badge */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                    {meta.docketId}
                  </span>
                  <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-[#161922] border border-zinc-800 text-[10px] font-mono text-slate-300">
                    <Icon className="w-3 h-3 text-emerald-400" />
                    <span className="font-semibold">{meta.badgeText}</span>
                  </div>
                </div>

                {/* Threat Type Title */}
                <h4 className="text-sm font-bold text-white font-mono tracking-tight leading-snug group-hover:text-emerald-300 transition-colors mb-1.5">
                  {sc.title}
                </h4>

                <p className="text-xs text-slate-400 font-sans leading-relaxed line-clamp-2 mb-3">
                  {meta.threatType}
                </p>

                {/* Key Forensic Signals Tag Pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {meta.signalTags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161922] border border-zinc-800 text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-zinc-800/70 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors text-[11px]">
                  {sc.type === 'url' ? 'Check Link' : 'Inspect Copy'}
                </span>
                <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">
                  <span>Investigate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
