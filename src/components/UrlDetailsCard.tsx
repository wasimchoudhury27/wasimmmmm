import React from 'react';
import { UrlDetails } from '../types.js';
import { Globe, Lock, Unlock, AlertTriangle, ShieldCheck, Server, Hash, FileCode } from 'lucide-react';

interface UrlDetailsCardProps {
  details: UrlDetails;
}

export const UrlDetailsCard: React.FC<UrlDetailsCardProps> = ({ details }) => {
  return (
    <div className="rounded-2xl bg-[#12141a] border border-zinc-800 p-4 sm:p-6 md:p-7 space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 sm:pb-4 gap-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 flex-shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-white font-mono uppercase tracking-wide truncate">
              URL &amp; Domain Intelligence
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate">
              DNS, protocol encryption, and spoofing analysis
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {details.isHttps ? (
            <span className="flex items-center space-x-1 text-[11px] sm:text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 sm:px-2.5 py-1 rounded border border-emerald-800/50">
              <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>HTTPS</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-[11px] sm:text-xs font-mono text-red-400 bg-red-950/60 px-2 sm:px-2.5 py-1 rounded border border-red-800/50">
              <Unlock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Insecure HTTP</span>
            </span>
          )}
        </div>
      </div>

      {/* Grid of properties */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs font-mono">
        {/* Hostname / Domain */}
        <div className="p-3.5 rounded-xl bg-[#161922] border border-zinc-800">
          <span className="text-slate-500 uppercase block mb-1">Target Host</span>
          <span className="text-slate-100 font-semibold break-all text-sm font-mono">
            {details.domain}
          </span>
        </div>

        {/* TLD Extension */}
        <div className="p-3.5 rounded-xl bg-[#161922] border border-zinc-800">
          <span className="text-slate-500 uppercase block mb-1">Top-Level Domain (TLD)</span>
          <div className="flex items-center space-x-2">
            <span className="text-slate-200 font-semibold text-sm">.{details.tld}</span>
            {['xyz', 'top', 'work', 'click', 'loan', 'buzz'].includes(details.tld) && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                High Risk TLD
              </span>
            )}
          </div>
        </div>

        {/* Brand Spoofing / Impersonation */}
        <div className="p-3.5 rounded-xl bg-[#161922] border border-zinc-800">
          <span className="text-slate-500 uppercase block mb-1">Impersonation Target</span>
          {details.lookalikeTarget ? (
            <span className="text-red-400 font-bold flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Spoofs {details.lookalikeTarget}</span>
            </span>
          ) : (
            <span className="text-slate-400">None detected</span>
          )}
        </div>

        {/* Domain Age (Mandatory: Never invent domain age) */}
        <div className="p-3.5 rounded-xl bg-[#161922] border border-zinc-800">
          <span className="text-slate-500 uppercase block mb-1">Domain Age Record</span>
          <span className="text-amber-300 font-medium">
            {details.domainAgeStatus}
          </span>
        </div>

        {/* Subdomains */}
        <div className="p-3.5 rounded-xl bg-[#161922] border border-zinc-800">
          <span className="text-slate-500 uppercase block mb-1">Subdomain Hierarchy</span>
          <span className="text-slate-300">
            {details.subdomains.length > 0 ? (
              <span className="text-emerald-300">{details.subdomains.join('.')} ({details.subdomains.length} level)</span>
            ) : (
              'Apex / Root Domain'
            )}
          </span>
        </div>

        {/* Punycode / IP Check */}
        <div className="p-3.5 rounded-xl bg-[#161922] border border-zinc-800">
          <span className="text-slate-500 uppercase block mb-1">Encoding & Host Type</span>
          <span className="text-slate-300">
            {details.isIpAddress ? 'Raw IP Host' : details.isPunycode ? 'Punycode IDN Detected' : 'Standard DNS Domain'}
          </span>
        </div>
      </div>

      {details.flaggedKeywords.length > 0 && (
        <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center flex-wrap gap-2 text-xs font-mono">
          <span className="text-slate-500">Observable Traps:</span>
          {details.flaggedKeywords.map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded bg-zinc-800 text-slate-300 border border-zinc-700">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
