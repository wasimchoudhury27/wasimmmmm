import React, { useEffect, useState } from 'react';
import { RiskBand, EvidenceStrength } from '../types.js';
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface ThreatGaugeProps {
  score: number;
  riskLevel: RiskBand;
  evidenceStrength: EvidenceStrength;
  headline: string;
}

export const ThreatGauge: React.FC<ThreatGaugeProps> = ({
  score,
  riskLevel,
  evidenceStrength,
  headline
}) => {
  const [displayedScore, setDisplayedScore] = useState(0);

  // Animated counter
  useEffect(() => {
    let current = 0;
    const increment = Math.max(1, Math.floor(score / 35));
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayedScore(score);
        clearInterval(timer);
      } else {
        setDisplayedScore(current);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [score]);

  // Color config based on risk band
  const theme = {
    LOW: {
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
      badgeBg: 'bg-emerald-950/60',
      badgeBorder: 'border-emerald-500/40',
      badgeText: 'text-emerald-400',
      icon: ShieldCheck,
      desc: 'No major scam indicators detected in available evidence.'
    },
    MODERATE: {
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
      badgeBg: 'bg-amber-950/60',
      badgeBorder: 'border-amber-500/40',
      badgeText: 'text-amber-400',
      icon: AlertTriangle,
      desc: 'Moderate risk signals observed. Heightened vigilance required.'
    },
    HIGH: {
      color: '#f97316',
      bgGlow: 'rgba(249, 115, 22, 0.18)',
      badgeBg: 'bg-orange-950/60',
      badgeBorder: 'border-orange-500/40',
      badgeText: 'text-orange-400',
      icon: ShieldAlert,
      desc: 'Multiple high-risk scam patterns detected.'
    },
    CRITICAL: {
      color: '#ef4444',
      bgGlow: 'rgba(239, 68, 68, 0.22)',
      badgeBg: 'bg-red-950/70',
      badgeBorder: 'border-red-500/50',
      badgeText: 'text-red-400',
      icon: AlertOctagon,
      desc: 'Strong deceptive indicators detected. Extreme caution advised.'
    }
  }[riskLevel];

  const IconComponent = theme.icon;

  // SVG Gauge Math
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  // Use a 240-degree arc instead of full 360 for high-end security meter feel
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * (displayedScore / 100));

  return (
    <div className="relative rounded-2xl bg-[#12141a]/90 border border-zinc-800 p-6 md:p-8 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Background ambient lighting */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none filter blur-3xl opacity-50"
        style={{ backgroundColor: theme.bgGlow }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left: Gauge */}
        <div className="flex flex-col items-center">
          <div className="relative w-52 h-52 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-210" viewBox="0 0 200 200">
              {/* Background Track Arc */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#1e293b"
                strokeWidth="14"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeLinecap="round"
              />
              {/* Animated Value Arc */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={theme.color}
                strokeWidth="14"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.4s ease'
                }}
              />
            </svg>

            {/* Inner Score Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-medium">
                Threat Index
              </span>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-extrabold font-mono tracking-tight text-white">
                  {displayedScore}
                </span>
                <span className="text-xl font-mono text-slate-500 ml-1">/100</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                Dynamic Score
              </span>
            </div>
          </div>

          <div className="mt-2 text-center">
            <p className="text-[11px] text-slate-500 font-mono">
              Confidence Model: <span className="text-slate-300 font-semibold">{evidenceStrength} Evidence</span>
            </p>
          </div>
        </div>

        {/* Right: Assessment Breakdown & Status */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-mono font-semibold uppercase tracking-wider shadow-sm"
            style={{
              backgroundColor: theme.badgeBg.replace('bg-', ''),
              borderColor: theme.color + '40',
              color: theme.color
            }}
          >
            <IconComponent className="w-4 h-4" />
            <span>{riskLevel} RISK EVALUATION</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {headline}
          </h3>

          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            {theme.desc}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <div className="flex items-center space-x-2 bg-[#161922] px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-mono text-slate-300">
              <span className="text-slate-500">Evidence Strength:</span>
              <span className={`font-semibold ${
                evidenceStrength === 'Strong' ? 'text-emerald-400' :
                evidenceStrength === 'Moderate' ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {evidenceStrength}
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-[#161922] px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Multi-Signal Contextual Correlation</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 italic pt-1">
            * Risk assessment is derived from observable structural signals. It does not represent a legal or factual determination of fraud.
          </div>
        </div>
      </div>
    </div>
  );
};
