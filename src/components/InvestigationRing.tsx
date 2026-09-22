import React, { useEffect, useState } from 'react';
import { RiskBand, RiskSignal } from '../types.js';
import { CreditCard, Clock, UserCheck, Globe, Briefcase, Radio, ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export interface InvestigationRingProps {
  score: number;
  riskLevel: RiskBand;
  isAnalyzing?: boolean;
  activeStageIndex?: number;
  signals?: RiskSignal[];
  size?: 'normal' | 'compact' | 'hero';
}

interface OrbitalNode {
  id: string;
  name: string;
  label: string;
  angle: number; // in degrees: 0 = top, 60, 120, 180, 240, 300
  icon: React.FC<{ className?: string }>;
  category: string;
}

const ORBITAL_NODES: OrbitalNode[] = [
  { id: 'node-pay', name: 'PAYMENT', label: 'Payment Demand', angle: -90, icon: CreditCard, category: 'PAYMENT' },
  { id: 'node-urg', name: 'URGENCY', label: 'Coercive Deadline', angle: -30, icon: Clock, category: 'URGENCY' },
  { id: 'node-rec', name: 'RECRUITMENT', label: 'Unvetted Hiring', angle: 30, icon: Briefcase, category: 'EMPLOYMENT' },
  { id: 'node-lnk', name: 'LINK / DNS', label: 'URL & Infrastructure', angle: 90, icon: Globe, category: 'URL_STRUCTURE' },
  { id: 'node-ide', name: 'IDENTITY', label: 'Brand Impersonation', angle: 150, icon: UserCheck, category: 'IDENTITY' },
  { id: 'node-beh', name: 'BEHAVIOR', label: 'Social Engineering', angle: 210, icon: Radio, category: 'SOCIAL_ENG' }
];

export const InvestigationRing: React.FC<InvestigationRingProps> = ({
  score,
  riskLevel,
  isAnalyzing = false,
  activeStageIndex = 0,
  signals = [],
  size = 'normal'
}) => {
  const [displayedScore, setDisplayedScore] = useState(isAnalyzing ? 0 : score);
  const [hoveredNode, setHoveredNode] = useState<OrbitalNode | null>(null);

  useEffect(() => {
    if (isAnalyzing) return;
    let current = 0;
    const increment = Math.max(1, Math.floor(score / 30));
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
  }, [score, isAnalyzing]);

  // Color theme based on risk band
  const theme = {
    LOW: {
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.18)',
      badgeBg: 'bg-emerald-950/80',
      badgeBorder: 'border-emerald-500/50',
      badgeText: 'text-emerald-400',
      icon: ShieldCheck,
      statusLabel: 'VERIFIED LOW RISK'
    },
    MODERATE: {
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.18)',
      badgeBg: 'bg-amber-950/80',
      badgeBorder: 'border-amber-500/50',
      badgeText: 'text-amber-400',
      icon: AlertTriangle,
      statusLabel: 'MODERATE SUSPICION'
    },
    HIGH: {
      color: '#f97316',
      bgGlow: 'rgba(249, 115, 22, 0.22)',
      badgeBg: 'bg-orange-950/80',
      badgeBorder: 'border-orange-500/50',
      badgeText: 'text-orange-400',
      icon: ShieldAlert,
      statusLabel: 'HIGH THREAT DETECTED'
    },
    CRITICAL: {
      color: '#ef4444',
      bgGlow: 'rgba(239, 68, 68, 0.25)',
      badgeBg: 'bg-red-950/80',
      badgeBorder: 'border-red-500/50',
      badgeText: 'text-red-400',
      icon: AlertOctagon,
      statusLabel: 'CRITICAL SCAM RISK'
    }
  }[riskLevel];

  const IconComponent = theme.icon;

  // Normalized 360-unit coordinate system so that SVG and satellite nodes scale via responsive container
  const baseDim = 360;
  const center = baseDim / 2;
  const radius = baseDim * 0.32; // 115.2
  const orbitRadius = baseDim * 0.44; // 158.4
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270 degree arc
  const strokeDashoffset = isAnalyzing
    ? arcLength * 0.5
    : arcLength - arcLength * (displayedScore / 100);

  // Check if a category was triggered in results
  const isCategoryTriggered = (category: string) => {
    return signals.some((s) => s.category === category);
  };

  // Responsive container sizing to prevent horizontal overflow on small mobile screens
  const containerClasses = {
    hero: 'w-[250px] h-[250px] min-[360px]:w-[280px] min-[360px]:h-[280px] sm:w-[330px] sm:h-[330px] md:w-[360px] md:h-[360px]',
    compact: 'w-[190px] h-[190px] sm:w-[220px] sm:h-[220px] md:w-[240px] md:h-[240px]',
    normal: 'w-[230px] h-[230px] sm:w-[270px] sm:h-[270px] md:w-[300px] md:h-[300px]'
  }[size];

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none max-w-full mx-auto ${containerClasses}`}
      style={{ touchAction: 'manipulation' }}
    >
      {/* Dynamic ambient central glow */}
      <div
        className="absolute inset-0 rounded-full filter blur-2xl sm:blur-3xl pointer-events-none transition-all duration-700 opacity-60"
        style={{
          backgroundColor: isAnalyzing ? 'rgba(6, 182, 212, 0.15)' : theme.bgGlow
        }}
      />

      {/* SVG Canvas for Ring, Ticks, and Orbit Lines */}
      <svg
        className="w-full h-full transform -rotate-135 pointer-events-none"
        viewBox={`0 0 ${baseDim} ${baseDim}`}
      >
        {/* Outer Orbit Guide Track */}
        <circle
          cx={center}
          cy={center}
          r={orbitRadius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* Inner Gauge Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#131c2e"
          strokeWidth="12"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />

        {/* Active Animated Threat Arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={isAnalyzing ? '#06b6d4' : theme.color}
          strokeWidth="12"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{
            filter: `drop-shadow(0 0 10px ${isAnalyzing ? '#06b6d4' : theme.color})`
          }}
        />

        {/* Subtle Decorative Tick Rings */}
        {Array.from({ length: 24 }).map((_, i) => {
          const tickAngle = (i * 360) / 24;
          const rad = (tickAngle * Math.PI) / 180;
          const x1 = center + (radius - 18) * Math.cos(rad);
          const y1 = center + (radius - 18) * Math.sin(rad);
          const x2 = center + (radius - 24) * Math.cos(rad);
          const y2 = center + (radius - 24) * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          );
        })}
      </svg>

      {/* Center Core HUD readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 z-10 pointer-events-none">
        {isAnalyzing ? (
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-[9px] min-[360px]:text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-semibold block animate-pulse">
              ANALYZING EVIDENCE
            </span>
            <div className="text-2xl min-[360px]:text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
              STAGE 0{Math.min(activeStageIndex + 1, 6)}
            </div>
            <span className="text-[10px] min-[360px]:text-[11px] font-mono text-slate-400 block">
              Correlating Signals...
            </span>
          </div>
        ) : (
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-[8px] min-[360px]:text-[9px] sm:text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold block">
              SCAM THREAT INDEX
            </span>
            <div className="flex items-baseline justify-center">
              <span className="text-3xl min-[360px]:text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-white">
                {displayedScore}
              </span>
              <span className="text-sm min-[360px]:text-base sm:text-lg font-mono text-slate-500 ml-0.5 sm:ml-1">/100</span>
            </div>
            <div
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] min-[360px]:text-[10px] font-mono font-bold tracking-wider uppercase border shadow-sm ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`}
            >
              <IconComponent className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
              <span>{riskLevel}</span>
            </div>
          </div>
        )}
      </div>

      {/* 6 Orbital Satellite Nodes positioned via fluid percentages */}
      {ORBITAL_NODES.map((node, index) => {
        const rad = (node.angle * Math.PI) / 180;
        const xPercent = ((center + orbitRadius * Math.cos(rad)) / baseDim) * 100;
        const yPercent = ((center + orbitRadius * Math.sin(rad)) / baseDim) * 100;
        const NodeIcon = node.icon;

        // Is this node active during analysis?
        const isCurrentlyInspecting = isAnalyzing && activeStageIndex === index;
        const hasPassedInspection = isAnalyzing && activeStageIndex > index;
        // In result view, does it have a triggered threat signal?
        const isTriggered = !isAnalyzing && isCategoryTriggered(node.category);

        return (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: `${xPercent}%`,
              top: `${yPercent}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onMouseEnter={() => setHoveredNode(node)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => setHoveredNode(hoveredNode?.id === node.id ? null : node)}
            className="group cursor-pointer z-20 touch-manipulation"
          >
            <div
              className={`w-7 h-7 min-[360px]:w-8 min-[360px]:h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 border ${
                isCurrentlyInspecting
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 scale-115 shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse'
                  : isTriggered
                  ? 'bg-red-950/90 border-red-500 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                  : hasPassedInspection
                  ? 'bg-slate-900 border-slate-700 text-cyan-400'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <NodeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>

            {/* Micro Tag Tooltip on Hover / Touch */}
            <div
              className={`absolute -bottom-6 left-1/2 -translate-x-1/2 transition-opacity pointer-events-none whitespace-nowrap bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[9px] sm:text-[10px] font-mono text-slate-300 z-30 shadow-lg ${
                hoveredNode?.id === node.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              {node.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};
