import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Globe,
  FileImage,
  Mail,
  ArrowRight,
  Upload,
  X,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type InputMode = 'message' | 'url' | 'image' | 'email';

interface ImageUploadData {
  base64: string;
  mimeType: string;
  name: string;
  previewUrl: string;
  size: number;
  isFromPaste?: boolean;
}

const SUPPORTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif'
];

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

interface InvestigationConsoleProps {
  onAnalyzeMessage: (text: string, imageBase64?: string, mimeType?: string) => void;
  onAnalyzeUrl: (url: string) => void;
  isLoading: boolean;
  activeMode: InputMode;
  setActiveMode: (mode: InputMode) => void;
  initialText?: string;
  initialUrl?: string;
  onSelectQuickSample?: (type: string) => void;
}

export const InvestigationConsole: React.FC<InvestigationConsoleProps> = ({
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
  const [emailText, setEmailText] = useState('');
  const [imageFile, setImageFile] = useState<ImageUploadData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pasteSuccessNotice, setPasteSuccessNotice] = useState(false);
  const [isUploadFocused, setIsUploadFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const pasteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialText) {
      if (activeMode === 'email') {
        setEmailText(initialText);
      } else {
        setMessageText(initialText);
      }
    }
  }, [initialText, activeMode]);

  useEffect(() => {
    if (initialUrl) {
      setUrlInput(initialUrl);
    }
  }, [initialUrl]);

  // Clean up Object URLs and timers on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      if (pasteTimeoutRef.current) {
        clearTimeout(pasteTimeoutRef.current);
      }
    };
  }, []);

  const handleRemoveImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setImageFile(null);
    setErrorMsg(null);
    setPasteSuccessNotice(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFile = (file: File, isFromPaste = false) => {
    const fileType = (file.type || '').toLowerCase();

    // Verify it is an image
    if (!fileType.startsWith('image/')) {
      setErrorMsg('Please upload a valid image (PNG, JPG, WEBP, GIF).');
      return;
    }

    // Verify supported image format
    if (!SUPPORTED_IMAGE_TYPES.includes(fileType)) {
      setErrorMsg('Unsupported image format. Please upload or paste PNG, JPG, WEBP, or GIF.');
      return;
    }

    // Check size limit: 8MB
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('File size exceeds 8MB. Please upload or paste a smaller screenshot or letter.');
      return;
    }

    // Clean up any existing preview URL
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];

      let fileName = file.name;
      if (!fileName || fileName === 'image.png' || fileName === 'blob') {
        const ext = fileType.split('/')[1] || 'png';
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        fileName = `clipboard-screenshot-${timestamp}.${ext}`;
      }

      setImageFile({
        base64,
        mimeType: file.type || 'image/png',
        name: fileName,
        size: file.size,
        previewUrl: objectUrl,
        isFromPaste
      });
      setErrorMsg(null);

      if (isFromPaste) {
        setPasteSuccessNotice(true);
        if (pasteTimeoutRef.current) clearTimeout(pasteTimeoutRef.current);
        pasteTimeoutRef.current = setTimeout(() => {
          setPasteSuccessNotice(false);
        }, 3500);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Failed to process image data. Please try uploading or pasting again.');
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file, false);
  };

  // Helper to extract image file from clipboard items or files
  const extractImageFromClipboard = (clipboardData: DataTransfer | null): File | null | 'unsupported' => {
    if (!clipboardData) return null;

    // 1. Inspect clipboard items
    const items = clipboardData.items;
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const mime = item.type.toLowerCase();
          if (!SUPPORTED_IMAGE_TYPES.includes(mime)) {
            return 'unsupported';
          }
          const blob = item.getAsFile();
          if (blob) {
            const ext = mime.split('/')[1] || 'png';
            const now = new Date();
            const pad = (n: number) => n.toString().padStart(2, '0');
            const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
            const fileName = blob.name && blob.name !== 'image.png' && blob.name !== 'blob'
              ? blob.name
              : `clipboard-screenshot-${timestamp}.${ext}`;
            return new File([blob], fileName, { type: blob.type || mime, lastModified: Date.now() });
          }
        }
      }
    }

    // 2. Fallback to clipboard files
    const files = clipboardData.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          if (!SUPPORTED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
            return 'unsupported';
          }
          return file;
        }
      }
    }

    return null;
  };

  // Handler for paste directly on the upload container
  const handleContainerPaste = (e: React.ClipboardEvent) => {
    const result = extractImageFromClipboard(e.clipboardData);

    if (result === 'unsupported') {
      e.preventDefault();
      setErrorMsg('Unsupported image format. Please paste PNG, JPG, WEBP, or GIF.');
      return;
    }

    if (result) {
      e.preventDefault();
      handleFile(result, true);
    }
  };

  // Window paste listener active strictly when in 'image' mode, guarding text inputs/textareas
  useEffect(() => {
    if (activeMode !== 'image') return;

    const handleDocumentPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      // Do NOT intercept if user is typing in any input, textarea, or contentEditable
      if (
        target &&
        (target.tagName === 'INPUT' ||
         target.tagName === 'TEXTAREA' ||
         target.isContentEditable)
      ) {
        return;
      }

      const result = extractImageFromClipboard(e.clipboardData);

      if (result === 'unsupported') {
        e.preventDefault();
        setErrorMsg('Unsupported image format. Please paste PNG, JPG, WEBP, or GIF.');
        return;
      }

      if (result) {
        e.preventDefault();
        handleFile(result, true);
      }
    };

    window.addEventListener('paste', handleDocumentPaste);
    return () => {
      window.removeEventListener('paste', handleDocumentPaste);
    };
  }, [activeMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (activeMode === 'message') {
      if (!messageText.trim() && !imageFile) {
        setErrorMsg('Please paste the suspicious message or conversation to investigate.');
        return;
      }
      onAnalyzeMessage(messageText, imageFile?.base64, imageFile?.mimeType);
    } else if (activeMode === 'email') {
      if (!emailText.trim()) {
        setErrorMsg('Please paste the suspicious email text, headers, or sender address.');
        return;
      }
      onAnalyzeMessage(`[SUSPICIOUS EMAIL CONTENT]\n${emailText}`);
    } else if (activeMode === 'image') {
      if (!imageFile && !messageText.trim()) {
        setErrorMsg('Please upload a document screenshot or paste relevant text for OCR verification.');
        return;
      }
      onAnalyzeMessage(messageText || 'Analyze document screenshot for letterhead and deposit red flags.', imageFile?.base64, imageFile?.mimeType);
    } else if (activeMode === 'url') {
      if (!urlInput.trim()) {
        setErrorMsg('Please enter a target website address or suspicious link.');
        return;
      }
      onAnalyzeUrl(urlInput);
    }
  };

  const modeOptions: { id: InputMode; label: string; icon: React.FC<{ className?: string }>; desc: string }[] = [
    { id: 'message', label: 'MESSAGE', icon: MessageSquare, desc: 'WhatsApp, SMS, Telegram, Chat' },
    { id: 'url', label: 'URL', icon: Globe, desc: 'Phishing Links, Portals, Domains' },
    { id: 'image', label: 'IMAGE / LETTER', icon: FileImage, desc: 'Appointment Letters, Passbooks, Slips' },
    { id: 'email', label: 'EMAIL', icon: Mail, desc: 'Spoofed Senders, Urgent Directives' }
  ];

  return (
    <div id="investigation-console" className="w-full max-w-4xl mx-auto">
      <div className="rounded-2xl bg-[#12141a] border border-zinc-800 shadow-2xl p-5 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        {/* Subtle decorative top border glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        {/* Console Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4 mb-6">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-400 font-semibold block mb-0.5">
              Secure Evidence Submission
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
              WHAT DO YOU WANT TO INVESTIGATE?
            </h2>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SANDBOXED ANALYSIS CONSOLE</span>
          </div>
        </div>

        {/* Input Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {modeOptions.map((mode) => {
            const Icon = mode.icon;
            const isSelected = activeMode === mode.id;

            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => { setActiveMode(mode.id); setErrorMsg(null); }}
                className={`relative flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-[#161922] border-zinc-800/80 text-slate-400 hover:text-slate-200 hover:bg-[#1c202c]'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-mono font-bold tracking-wider">{mode.label}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-sans hidden sm:block truncate max-w-full">
                  {mode.desc}
                </span>

                {isSelected && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute -bottom-[1px] left-4 right-4 h-0.5 bg-emerald-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {/* MODE: MESSAGE */}
            {activeMode === 'message' && (
              <motion.div
                key="mode-message"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                <div className="relative">
                  <textarea
                    id="console-message-textarea"
                    rows={6}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Paste the suspicious message, job offer, appointment letter, payment request, or conversation here..."
                    disabled={isLoading}
                    className="w-full bg-[#0a0c10] border border-zinc-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all font-sans leading-relaxed resize-y disabled:opacity-50"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center space-x-3 text-[11px] font-mono text-slate-500">
                    {messageText.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setMessageText('')}
                        className="text-slate-500 hover:text-red-400 flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    )}
                    <span>{messageText.length} characters</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* MODE: URL */}
            {activeMode === 'url' && (
              <motion.div
                key="mode-url"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                <div>
                  <label htmlFor="console-url-input" className="block text-xs font-mono text-slate-400 mb-2 uppercase">
                    Suspicious Website or Redirect Link
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-sm">
                      <Globe className="w-4 h-4 text-emerald-400" />
                    </div>
                    <input
                      id="console-url-input"
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://sbi-online-kyc-verification.xyz or paste link"
                      disabled={isLoading}
                      className="w-full bg-[#0a0c10] border border-zinc-800 rounded-xl pl-10 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#161922] border border-zinc-800 flex items-start space-x-2.5 text-xs font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">INFO:</span>
                  <span>
                    Our engine evaluates DNS structure, protocol security, registrar status, brand homograph spoofing, and entropy without executing untrusted payload scripts in your browser.
                  </span>
                </div>
              </motion.div>
            )}

            {/* MODE: IMAGE / LETTER */}
            {activeMode === 'image' && (
              <motion.div
                key="mode-image"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Subtle paste confirmation banner */}
                <AnimatePresence>
                  {pasteSuccessNotice && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono"
                    >
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="font-semibold">Image pasted from clipboard</span>
                      </div>
                      <span className="text-emerald-400/80 text-[11px] hidden sm:inline">
                        Preview generated · Ready for investigation
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  id="image-dropzone-container"
                  tabIndex={0}
                  role="region"
                  aria-label="Screenshot and document upload dropzone"
                  onFocus={() => setIsUploadFocused(true)}
                  onBlur={() => setIsUploadFocused(false)}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onPaste={handleContainerPaste}
                  onClick={() => {
                    if (!imageFile) fileInputRef.current?.click();
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !imageFile) {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-5 sm:p-7 text-center transition-all outline-none ${
                    isDragOver
                      ? 'border-emerald-400 bg-emerald-950/30'
                      : isUploadFocused
                      ? 'border-emerald-500/70 bg-emerald-950/20 ring-1 ring-emerald-500/30'
                      : imageFile
                      ? 'border-emerald-500/40 bg-emerald-950/15'
                      : 'border-zinc-800 hover:border-emerald-500/40 bg-[#0a0c10] cursor-pointer'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file, false);
                    }}
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                    className="hidden"
                  />

                  {imageFile ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#161922] p-3.5 sm:p-4 rounded-xl border border-emerald-500/30 gap-3 text-left">
                      <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                        {imageFile.previewUrl ? (
                          <div className="relative flex-shrink-0">
                            <img
                              src={imageFile.previewUrl}
                              alt={imageFile.name}
                              className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border border-emerald-500/40 shadow-md bg-black"
                            />
                            <div className="absolute inset-0 bg-emerald-950/20 rounded-lg pointer-events-none" />
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 flex-shrink-0">
                            <FileImage className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-mono text-white font-semibold truncate block max-w-xs sm:max-w-md">
                              {imageFile.name}
                            </span>
                            {imageFile.isFromPaste && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex-shrink-0">
                                Clipboard
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs font-mono text-slate-400">
                            <span className="text-emerald-400 uppercase font-semibold">
                              {imageFile.mimeType.replace('image/', '')}
                            </span>
                            {imageFile.size > 0 && (
                              <span>{formatFileSize(imageFile.size)}</span>
                            )}
                            <span className="text-emerald-400 flex items-center space-x-1">
                              <Check className="w-3 h-3 flex-shrink-0" />
                              <span>Ready for OCR &amp; analysis</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-red-400 hover:bg-zinc-800 border border-zinc-700/60 transition-colors cursor-pointer"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-900 flex items-center justify-center text-emerald-400 border border-zinc-800 shadow-inner">
                        <Upload className="w-6 h-6" />
                      </div>

                      <div>
                        <div className="text-sm font-mono text-slate-200">
                          Drop screenshot or appointment letter here, or{' '}
                          <span className="text-emerald-400 underline decoration-emerald-400/50 hover:text-emerald-300 font-medium">browse files</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 font-sans">
                        PNG, JPG, JPEG, WEBP, GIF up to 8MB · Analyzed with multimodal vision OCR
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
                    placeholder="e.g. Received via WhatsApp from unknown recruiter asking for ₹3,000 onboarding kit deposit..."
                    className="w-full bg-[#0a0c10] border border-zinc-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 font-sans"
                  />
                </div>
              </motion.div>
            )}

            {/* MODE: EMAIL */}
            {activeMode === 'email' && (
              <motion.div
                key="mode-email"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                <div className="relative">
                  <textarea
                    id="console-email-textarea"
                    rows={6}
                    value={emailText}
                    onChange={(e) => setEmailText(e.target.value)}
                    placeholder="Paste the suspicious email (including sender, subject line, body text, or full email headers)..."
                    disabled={isLoading}
                    className="w-full bg-[#0a0c10] border border-zinc-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all font-sans leading-relaxed resize-y disabled:opacity-50"
                  />
                  <div className="absolute bottom-3 right-3 text-[11px] font-mono text-slate-500">
                    {emailText.length} characters
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Validation Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submission Action Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              id="run-ai-investigation-button"
              type="submit"
              disabled={isLoading}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono text-sm uppercase tracking-wider font-bold transition-all duration-300 flex items-center justify-center space-x-2.5 cursor-pointer shadow-xl ${
                isLoading
                  ? 'bg-emerald-950 text-emerald-500 border border-emerald-800 cursor-not-allowed'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] active:scale-[0.98]'
              }`}
            >
              <span>{isLoading ? 'INVESTIGATION IN PROGRESS...' : 'RUN AI INVESTIGATION'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono text-center sm:text-right">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Dual-engine validation · Deterministic rules & Gemini AI</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
