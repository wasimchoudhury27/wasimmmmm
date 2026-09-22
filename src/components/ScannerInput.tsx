import React, { useState, useRef } from 'react';
import { MessageSquare, Globe, Image as ImageIcon, ShieldAlert, ArrowRight, Upload, X, AlertCircle } from 'lucide-react';
import { DEMO_SCENARIOS } from '../data/demoScenarios.js';

interface ScannerInputProps {
  onAnalyzeMessage: (text: string, imageBase64?: string, mimeType?: string) => void;
  onAnalyzeUrl: (url: string) => void;
  isLoading: boolean;
  activeMode: 'message' | 'url' | 'image';
  setActiveMode: (mode: 'message' | 'url' | 'image') => void;
  initialText?: string;
  initialUrl?: string;
}

export const ScannerInput: React.FC<ScannerInputProps> = ({
  onAnalyzeMessage,
  onAnalyzeUrl,
  isLoading,
  activeMode,
  setActiveMode,
  initialText = '',
  initialUrl = ''
}) => {
  const [messageText, setMessageText] = useState(initialText);
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [imageFile, setImageFile] = useState<{ base64: string; mimeType: string; name: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync when initial text changes (e.g. from demo bar)
  React.useEffect(() => {
    if (initialText) setMessageText(initialText);
  }, [initialText]);

  React.useEffect(() => {
    if (initialUrl) setUrlInput(initialUrl);
  }, [initialUrl]);

  const handleChipClick = (scenarioId: string) => {
    const sc = DEMO_SCENARIOS.find(s => s.id === scenarioId);
    if (sc) {
      if (sc.type === 'url') {
        setActiveMode('url');
        setUrlInput(sc.content);
      } else {
        setActiveMode('message');
        setMessageText(sc.content);
      }
      setErrorMsg(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 8MB. Please upload a smaller screenshot.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setImageFile({
        base64,
        mimeType: file.type,
        name: file.name
      });
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        setImageFile({
          base64,
          mimeType: file.type,
          name: file.name
        });
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (activeMode === 'message' || activeMode === 'image') {
      if (!messageText.trim() && !imageFile) {
        setErrorMsg('Please paste a message or upload a document screenshot to analyze.');
        return;
      }
      onAnalyzeMessage(messageText, imageFile?.base64, imageFile?.mimeType);
    } else {
      if (!urlInput.trim()) {
        setErrorMsg('Please enter a website link or domain address.');
        return;
      }
      onAnalyzeUrl(urlInput);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Primary Scanner Container Card */}
      <div className="rounded-2xl bg-[#12141a] border border-zinc-800 shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        {/* Subtle top emerald line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/90 pb-4 mb-6">
          <button
            type="button"
            onClick={() => { setActiveMode('message'); setErrorMsg(null); }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all duration-200 cursor-pointer ${
              activeMode === 'message'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161922] border border-transparent'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Message / Job Offer</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMode('url'); setErrorMsg(null); }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all duration-200 cursor-pointer ${
              activeMode === 'url'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161922] border border-transparent'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Check a URL</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMode('image'); setErrorMsg(null); }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all duration-200 cursor-pointer ${
              activeMode === 'image'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161922] border border-transparent'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Letter / Screenshot OCR</span>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* MODE 1: MESSAGE SCANNER */}
          {activeMode === 'message' && (
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  id="scanner-message-input"
                  rows={6}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Paste a suspicious message, job offer, appointment letter, payment request or rental message..."
                  disabled={isLoading}
                  className="w-full bg-[#161922] border border-zinc-700/80 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans leading-relaxed resize-y disabled:opacity-50"
                />
                <div className="absolute bottom-3 right-3 text-[11px] font-mono text-slate-500">
                  {messageText.length} characters
                </div>
              </div>

              {/* Example Input Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-mono text-slate-500 mr-1">
                  Example inputs:
                </span>
                <button
                  type="button"
                  onClick={() => handleChipClick('demo-job')}
                  className="px-2.5 py-1 rounded-lg bg-[#161922] hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-slate-300 hover:text-emerald-300 transition-colors"
                >
                  &ldquo;Job Offer&rdquo;
                </button>
                <button
                  type="button"
                  onClick={() => handleChipClick('demo-rental')}
                  className="px-2.5 py-1 rounded-lg bg-[#161922] hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-slate-300 hover:text-emerald-300 transition-colors"
                >
                  &ldquo;Rental Deposit&rdquo;
                </button>
                <button
                  type="button"
                  onClick={() => handleChipClick('demo-url')}
                  className="px-2.5 py-1 rounded-lg bg-[#161922] hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-slate-300 hover:text-emerald-300 transition-colors"
                >
                  &ldquo;Payment Request&rdquo;
                </button>
                <button
                  type="button"
                  onClick={() => handleChipClick('demo-appointment')}
                  className="px-2.5 py-1 rounded-lg bg-[#161922] hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-slate-300 hover:text-emerald-300 transition-colors"
                >
                  &ldquo;Appointment Letter&rdquo;
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: URL SCANNER */}
          {activeMode === 'url' && (
            <div className="space-y-3">
              <div>
                <label htmlFor="scanner-url-input" className="block text-xs font-mono text-slate-400 mb-2 uppercase">
                  Website or Suspicious Link
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-sm">
                    <Globe className="w-4 h-4 text-emerald-400" />
                  </div>
                  <input
                    id="scanner-url-input"
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com or paste full link"
                    disabled={isLoading}
                    className="w-full bg-[#161922] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="text-xs text-slate-500 font-mono">
                Safe analysis: The server performs structural and heuristic risk inspection without executing remote malicious scripts in your browser.
              </div>
            </div>
          )}

          {/* MODE 3: LETTER / SCREENSHOT OCR SCANNER */}
          {activeMode === 'image' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  imageFile
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-zinc-700 hover:border-emerald-500/40 bg-[#161922]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />

                {imageFile ? (
                  <div className="flex items-center justify-between bg-[#12141a] p-3 rounded-xl border border-zinc-800">
                    <div className="flex items-center space-x-3 text-left">
                      <div className="p-2 rounded bg-emerald-950 text-emerald-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-mono text-white font-medium block truncate max-w-xs">
                          {imageFile.name}
                        </span>
                        <span className="text-xs font-mono text-emerald-400">
                          Ready for multimodal OCR & letterhead verification
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setImageFile(null); }}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-zinc-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#12141a] flex items-center justify-center text-emerald-400 border border-zinc-800">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-mono text-slate-200">
                      Drag & drop appointment letter or chat screenshot, or <span className="text-emerald-400 underline">browse</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Supports PNG, JPG, WEBP (Offer letters, WhatsApp chats, payment demands)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                  Additional context or notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="e.g. Received via WhatsApp from unverified number..."
                  className="w-full bg-[#161922] border border-zinc-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions & Trust Statement */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              id="analyze-threat-button"
              type="submit"
              disabled={isLoading}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono text-sm uppercase tracking-wider font-bold transition-all duration-300 flex items-center justify-center space-x-2.5 cursor-pointer shadow-lg ${
                isLoading
                  ? 'bg-emerald-950 text-emerald-500 border border-emerald-800 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.45)]'
              }`}
            >
              <span>{isLoading ? 'ANALYZING THREAT SIGNALS...' : activeMode === 'url' ? 'SCAN URL' : 'ANALYZE THREAT'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

            <p className="text-[11px] text-slate-500 text-center sm:text-right font-mono">
              Risk assessment is based on observable signals. Always verify independently.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
