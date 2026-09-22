import React, { useState, useRef } from 'react';
import { Navbar } from './components/Navbar.js';
import { HeroSection } from './components/HeroSection.js';
import { InvestigationConsole, InputMode } from './components/InvestigationConsole.js';
import { EvidenceLibrary } from './components/EvidenceLibrary.js';
import { InvestigationSequence } from './components/InvestigationSequence.js';
import { InvestigationDashboard } from './components/InvestigationDashboard.js';
import { HowItWorksModal } from './components/HowItWorksModal.js';
import { AnalysisResult, DemoScenario } from './types.js';
import { Shield, Lock, Eye, AlertCircle, Fingerprint, Sparkles, Terminal } from 'lucide-react';

export default function App() {
  const [activeMode, setActiveMode] = useState<InputMode>('message');
  const [isLoading, setIsLoading] = useState(false);
  const [scanStageIndex, setScanStageIndex] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedDemoId, setSelectedDemoId] = useState<string | undefined>(undefined);
  const [presetText, setPresetText] = useState('');
  const [presetUrl, setPresetUrl] = useState('');
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const evidenceSectionRef = useRef<HTMLDivElement>(null);

  const scrollToEvidence = () => {
    evidenceSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Run Staged Investigation Animation alongside API Call
  const executeWithStagedAnimation = async (apiCall: () => Promise<AnalysisResult>) => {
    setIsLoading(true);
    setScanStageIndex(0);
    setError(null);
    setResult(null);

    // Staged progression timer (6 stages across ~1.6 seconds)
    const stageInterval = setInterval(() => {
      setScanStageIndex((prev) => {
        if (prev < 5) return prev + 1;
        return prev;
      });
    }, 280);

    try {
      const data = await apiCall();
      clearInterval(stageInterval);
      setScanStageIndex(5);

      // Brief cinematic hold on final stage before unveiling verdict
      setTimeout(() => {
        setResult(data);
        setIsLoading(false);
      }, 450);
    } catch (err: any) {
      clearInterval(stageInterval);
      setIsLoading(false);
      setError(err.message || 'Threat investigation could not be completed. Please verify your connection and try again.');
    }
  };

  // Analyze Message / Image / Email
  const handleAnalyzeMessage = (text: string, imageBase64?: string, mimeType?: string) => {
    executeWithStagedAnimation(async () => {
      const response = await fetch('/api/analyze/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, imageBase64, mimeType })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error during evidence analysis.');
      }

      return response.json();
    });
  };

  // Analyze URL
  const handleAnalyzeUrl = (url: string) => {
    executeWithStagedAnimation(async () => {
      const response = await fetch('/api/analyze/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error during URL threat inspection.');
      }

      return response.json();
    });
  };

  // Handle Demo Evidence Selection: loads evidence and starts investigation immediately
  const handleSelectDemo = (scenario: DemoScenario, autoSubmit: boolean = true) => {
    setSelectedDemoId(scenario.id);
    setError(null);

    if (scenario.type === 'url') {
      setActiveMode('url');
      setPresetUrl(scenario.content);
      if (autoSubmit) {
        handleAnalyzeUrl(scenario.content);
      }
    } else {
      setActiveMode('message');
      setPresetText(scenario.content);
      if (autoSubmit) {
        handleAnalyzeMessage(scenario.content);
      }
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setIsLoading(false);
    setSelectedDemoId(undefined);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 cyber-bg">
      {/* Top Navbar */}
      <Navbar
        onReset={handleReset}
        onSelectMode={(mode) => {
          setActiveMode(mode);
          setResult(null);
        }}
        onOpenHowItWorks={() => setHowItWorksOpen(true)}
        onScrollToEvidence={scrollToEvidence}
        isResultActive={!!result && !isLoading}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-12">
        {/* If no result and not loading, show the Investigation Workspace */}
        {!result && !isLoading && (
          <div className="space-y-12">
            {/* HERO SECTION */}
            <HeroSection />

            {/* CENTRAL INVESTIGATION CONSOLE */}
            <InvestigationConsole
              onAnalyzeMessage={handleAnalyzeMessage}
              onAnalyzeUrl={handleAnalyzeUrl}
              isLoading={isLoading}
              activeMode={activeMode}
              setActiveMode={setActiveMode}
              initialText={presetText}
              initialUrl={presetUrl}
            />

            {/* Error Banner if API error occurred */}
            {error && (
              <div className="max-w-4xl mx-auto p-4 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-sm font-mono flex items-center space-x-3 shadow-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* EVIDENCE LIBRARY (Curated Dockets for Instant Testing) */}
            <div ref={evidenceSectionRef}>
              <EvidenceLibrary
                onSelectScenario={handleSelectDemo}
                selectedId={selectedDemoId}
                isLoading={isLoading}
              />
            </div>

            {/* TRUST TELEMETRY & PRIVACY METRICS */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-mono text-slate-400">
              <div className="p-4 rounded-2xl bg-[#080d19]/80 border border-slate-800/80 flex items-start space-x-3 shadow-sm">
                <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-200 font-bold block mb-0.5 font-mono">Zero-Tolerance Matrix</span>
                  <span className="font-sans text-slate-400">Aggressive 90–100 index thresholds for advance recruitment & rental deposits.</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#080d19]/80 border border-slate-800/80 flex items-start space-x-3 shadow-sm">
                <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-200 font-bold block mb-0.5 font-mono">Multimodal Gemini AI</span>
                  <span className="font-sans text-slate-400">Deep semantic correlation, OCR letterhead inspection, and brand spoofing detection.</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#080d19]/80 border border-slate-800/80 flex items-start space-x-3 shadow-sm">
                <Lock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-200 font-bold block mb-0.5 font-mono">Ephemeral Zero-Storage</span>
                  <span className="font-sans text-slate-400">Volatile memory analysis only. No text, screenshots, or credentials ever stored.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOADING STATE: CINEMATIC INVESTIGATION SEQUENCE */}
        {isLoading && (
          <InvestigationSequence currentStageIndex={scanStageIndex} />
        )}

        {/* RESULT STATE: FORENSIC INVESTIGATION DASHBOARD */}
        {result && !isLoading && (
          <InvestigationDashboard
            result={result}
            onReset={handleReset}
          />
        )}
      </main>

      {/* HOW IT WORKS MODAL */}
      <HowItWorksModal
        isOpen={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
      />

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#04060d] py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300 font-mono">SCAMSHIELD AI</span>
            <span className="text-slate-700">|</span>
            <span className="text-cyan-400">Pause. Verify. Protect.</span>
            <span className="text-slate-700">|</span>
            <span>v2.4 Live Sec-Ops</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <button
              type="button"
              onClick={() => setHowItWorksOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              How It Works
            </button>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={scrollToEvidence}
              className="hover:text-cyan-400 transition-colors"
            >
              Evidence Library
            </button>
            <span className="text-slate-700">•</span>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-400 transition-colors"
            >
              CyberCrime.gov.in
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
