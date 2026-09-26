import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Send, 
  Trash2, 
  Upload, 
  FileText, 
  AlertCircle, 
  Cpu, 
  CheckCircle2, 
  RefreshCw, 
  X,
  FileCode,
  FileCheck,
  ShieldAlert,
  Flame,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  fileName?: string;
}

interface AttachedFile {
  name: string;
  size: string;
  mimeType: string;
  data: string; // Base64 or plain text data
  readableSize?: string;
}

interface AnalyticsViewProps {
  isDarkMode: boolean;
  theme: 'light' | 'dark' | 'dim';
}

// Custom parser to format bold, headers, lists, code blocks in Terminal messages without using external markdown library
const renderTerminalText = (text: string, isDark: boolean) => {
  const lines = text.split('\n');
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  return lines.map((line, index) => {
    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const codeHTML = (
          <pre key={`code-${index}`} className="my-3 p-4 rounded-lg bg-black border border-stone-800 text-[#2dd4bf] font-mono text-xs overflow-x-auto leading-relaxed max-w-full text-left">
            <code>{codeBlockLines.join('\n')}</code>
          </pre>
        );
        codeBlockLines = [];
        return codeHTML;
      } else {
        inCodeBlock = true;
        return null;
      }
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return null;
    }

    // Headers
    if (line.startsWith('### ')) {
      return (
        <h4 key={index} className="text-sm font-bold uppercase tracking-wider text-[#2dd4bf] mt-4 mb-2">
          {line.substring(4)}
        </h4>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h3 key={index} className="text-base font-extrabold uppercase tracking-widest text-[#2dd4bf] mt-6 mb-3 border-b border-[#2dd4bf]/20 pb-1">
          {line.substring(3)}
        </h3>
      );
    }
    if (line.startsWith('# ')) {
      return (
        <h2 key={index} className="text-lg font-black uppercase tracking-widest text-[#2dd4bf] mt-8 mb-4">
          {line.substring(2)}
        </h2>
      );
    }

    // Bullets
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const bulletText = line.trim().substring(2);
      return (
        <div key={index} className="flex gap-2 items-start my-1.5 ml-4 leading-relaxed text-xs">
          <span className="text-[#2dd4bf]">•</span>
          <span>{parseInlineFormatting(bulletText)}</span>
        </div>
      );
    }

    // Standard paragraphs
    if (line.trim() === '') {
      return <div key={index} className="h-2"></div>;
    }

    return (
      <p key={index} className="text-xs leading-relaxed my-1 font-mono text-left">
        {parseInlineFormatting(line)}
      </p>
    );
  }).filter(Boolean);
};

// Simple inline parser for bold **text** and `code` markers
const parseInlineFormatting = (text: string) => {
  const parts: React.ReactNode[] = [];
  let currentWord = "";
  let i = 0;

  while (i < text.length) {
    if (text.startsWith('**', i)) {
      if (currentWord) {
        parts.push(currentWord);
        currentWord = "";
      }
      const closeIdx = text.indexOf('**', i + 2);
      if (closeIdx !== -1) {
        parts.push(<strong key={`b-${i}`} className="text-white font-extrabold">{text.substring(i + 2, closeIdx)}</strong>);
        i = closeIdx + 2;
      } else {
        currentWord += '**';
        i += 2;
      }
    } else if (text.startsWith('`', i)) {
      if (currentWord) {
        parts.push(currentWord);
        currentWord = "";
      }
      const closeIdx = text.indexOf('`', i + 1);
      if (closeIdx !== -1) {
        parts.push(<code key={`code-${i}`} className="bg-black text-[#2dd4bf] px-1.5 py-0.5 rounded font-mono text-[10px] border border-stone-800">{text.substring(i + 1, closeIdx)}</code>);
        i = closeIdx + 1;
      } else {
        currentWord += '`';
        i += 1;
      }
    } else {
      currentWord += text[i];
      i++;
    }
  }

  if (currentWord) {
    parts.push(currentWord);
  }

  return parts.length > 0 ? parts : text;
};

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ isDarkMode, theme }) => {
  const isDark = theme === 'dark' || theme === 'dim';
  
  // States
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `# PHASE MIRROR // SYSTEM ANALYTICS TERMINAL
Active Interface: Phase Mirror Agent v1.0.8 (Deterministic Trust Engine)
Compliance Status: ACTIVE

Welcome. I am the cognitive sentinel of Phase Mirror. I don't resolve system dissonance, I names it. 

I can analyze your autonomous claims, SLAs, contracts, and system metrics parameters to map potential drift vectors. Upload a specifications document, or type a query to examine.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Self-Destruct States & Handlers
  const [countdown, setCountdown] = useState<number>(300);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const startSelfDestructTimer = () => {
    if (!timerActive) {
      setTimerActive(true);
    }
  };

  const triggerSelfDestruct = () => {
    setTimerActive(false);
    setCountdown(300);
    setInputText('');
    setAttachedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setMessages(prev => [
      ...prev,
      {
        id: 'destruct-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        role: 'model',
        text: `### [CRITICAL REDACTION] AUTO SELF-DESTRUCT MECHANISM ACTUATED
All local context parsing, text buffers, and uploaded documents have been completely expelled.
System memory scrub sequence completed autonomously.

- Input buffers: WIPED
- Active files: EXPELLED
- Session compliance: RE-ARMED

Hover over or interact with any input feature to begin subsequent 300-second compliance countdown.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            triggerSelfDestruct();
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages container internally only
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Extract / Parse File Payload for Multiple Files
  const processUploadedFiles = (filesList: FileList) => {
    setIsUploading(true);
    const filesArray = Array.from(filesList);
    const loadedFiles: AttachedFile[] = [];
    let completedCount = 0;

    if (filesArray.length === 0) {
      setIsUploading(false);
      return;
    }

    filesArray.forEach((file) => {
      const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          loadedFiles.push({
            name: file.name,
            size: sizeStr,
            mimeType: file.type || 'text/plain',
            data: e.target.result as string
          });
        }
        completedCount++;
        if (completedCount === filesArray.length) {
          setAttachedFiles(prev => [...prev, ...loadedFiles]);
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        completedCount++;
        if (completedCount === filesArray.length) {
          setIsUploading(false);
        }
      };

      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFiles(e.target.files);
    }
  };

  const removeAttachedFile = (indexToRemove: number) => {
    setAttachedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit Prompt to Server API
  const handleSendMessage = async (textToSend?: string) => {
    const finalQuery = textToSend || inputText;
    if (!finalQuery.trim() && attachedFiles.length === 0) return;

    setInputText('');
    
    // Add user message to history
    const userMsgId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const newUserMessage: Message = {
      id: userMsgId,
      role: 'user',
      text: finalQuery,
      fileName: attachedFiles.length > 0 
        ? attachedFiles.map(f => f.name).join(', ') 
        : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsProcessing(true);

    // Keep state of current files and reset panel attachment immediately
    const tempAttachedFiles = [...attachedFiles];
    setAttachedFiles([]);

    try {
      // Map message history to suitable API format
      const clientHistory = messages.slice(1).map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: finalQuery,
          history: clientHistory,
          files: tempAttachedFiles.map(f => ({
            name: f.name,
            mimeType: f.mimeType,
            data: f.data
          })),
          file: tempAttachedFiles[0] ? {
            name: tempAttachedFiles[0].name,
            mimeType: tempAttachedFiles[0].mimeType,
            data: tempAttachedFiles[0].data
          } : undefined
        })
      });

      if (!response.ok) {
        const errPayload = await response.json();
        throw new Error(errPayload.error || 'Failed to fetch model response.');
      }

      const data = await response.json();

      setMessages(prev => [...prev, {
        id: 'model-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        role: 'model',
        text: `### [CRITICAL ERROR] TERMINAL FAILURE\nSystem returned code 500 when calling GenAI. ${err.message || 'Verification pipeline offline.'}\n\nPlease check that your GEMINI_API_KEY is properly saved inside AI Studio Secrets menu.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsProcessing(false);
    }
  };



  const clearSession = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        role: 'model',
        text: `# TERMINAL REBOOTED // ENGINE STATE COMPLIANT
Agentic session cleared successfully. Let's start fresh.
Prepare your system specs, variables or query above!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className={`min-h-screen pt-28 pb-16 transition-colors duration-1000 ${
      isDark ? 'bg-[#030303] text-stone-300' : 'bg-[#faf9f6] text-stone-900'
    }`}>
      
      <div className="container mx-auto px-8 max-w-6xl relative">
        
        {/* ================= NEW HERO: NAVIGATING EVERYDAY DISSONANCE ================= */}
        <section id="everyday-dissonance-hero" className="mb-20 text-left border-b border-stone-200 dark:border-stone-900 pb-16">
          <div className="max-w-4xl space-y-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-[#2dd4bf] border border-[#2dd4bf]/20 px-3 py-1 rounded inline-block bg-[#2dd4bf]/5">
              PERSPECTIVE // COGNITIVE GEOMETRY
            </span>
            <h1 className="text-4xl md:text-6xl font-serif text-stone-900 dark:text-white tracking-tight leading-none">
              Navigating Everyday Dissonance with Phase Mirror
            </h1>
            <p className="text-base md:text-lg text-stone-500 leading-relaxed font-semibold">
              Integrity is a compilation-time invariant, not a post-hoc checks parameter. Most personal and organizational failures do not arise from lack of ambition, but from severe drift between claims and environments. We apply formal check-gate methods to daily human habits.
            </p>
          </div>

          {/* Grid: Problem vs Solution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 items-stretch">
            
            {/* The Vague Intention (Vibes) Panel */}
            <div className={`p-8 rounded-[2rem] border text-left flex flex-col justify-between ${
              isDark ? 'bg-[#09090b]/40 border-stone-900' : 'bg-stone-50 border-stone-200 shadow-xs'
            }`}>
              <div>
                <span className="font-mono text-[9px] font-bold text-rose-500 uppercase tracking-widest block mb-4">
                  [THE STATUS QUO] // THE DRIFT OF ABSTRACT CLAIMS
                </span>
                <h3 className="text-xl font-bold tracking-tight mb-3">The Problem: Vague Intentions</h3>
                <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                  Most personal habits remain as abstract statements or vague projections. Without a structured check-gate compiler, ambition decays rapidly into systemic cognitive dissonance.
                </p>
                
                <div className="space-y-3 mt-6">
                  <div className="flex gap-3 items-start text-xs font-mono text-stone-500 border-l border-stone-200 dark:border-stone-850 pl-4 py-1">
                    <span className="text-rose-500 font-bold">drift_01</span>
                    <span>"I'll try to eat a bit healthier next week."</span>
                  </div>
                  <div className="flex gap-3 items-start text-xs font-mono text-stone-500 border-l border-stone-200 dark:border-stone-850 pl-4 py-1">
                    <span className="text-rose-500 font-bold">drift_02</span>
                    <span>"We definitely should catch up more often."</span>
                  </div>
                  <div className="flex gap-3 items-start text-xs font-mono text-stone-500 border-l border-stone-200 dark:border-stone-850 pl-4 py-1">
                    <span className="text-rose-500 font-bold">drift_03</span>
                    <span>"I will remember to complete my taxes tonight."</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-stone-200 dark:border-stone-900 flex justify-between text-[10px] font-mono text-stone-400">
                <span>RELIABILITY INDEX: LOW</span>
                <span>SYSTEMIC VULNERABILITY</span>
              </div>
            </div>

            {/* The Binding Artifacts (Phase Mirror) Panel */}
            <div className={`p-8 rounded-[2rem] border text-left flex flex-col justify-between ${
              isDark ? 'bg-zinc-950/20 border-[#2dd4bf]/20' : 'bg-teal-500/[0.01] border-[#2dd4bf]/20 shadow-xs'
            }`}>
              <div>
                <span className="font-mono text-[9px] font-bold text-[#2dd4bf] uppercase tracking-widest block mb-4">
                  [THE COMPILER METHOD] // REPRESENTING CLAIMS AS STATE
                </span>
                <h3 className="text-xl font-bold tracking-tight mb-3">The Solution: Binding Artifacts</h3>
                <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                  Phase Mirror replaces vaporous desires with hard administrative compilation targets. Invariants are locked at design-time, forcing the physical parameters to compile correctly.
                </p>

                <div className="space-y-4 mt-6">
                  {/* Spec */}
                  <div className="flex gap-3 items-start text-xs">
                    <span className="py-0.5 px-2 bg-[#2dd4bf]/10 text-teal-600 dark:text-[#2dd4bf] text-[9.5px] font-mono font-bold rounded uppercase">The Spec</span>
                    <p className="text-stone-500 font-semibold text-[11.5px]">
                      Instead of "trying to be healthier," you compile a fixed meal plan.
                    </p>
                  </div>
                  {/* Protocol */}
                  <div className="flex gap-3 items-start text-xs">
                    <span className="py-0.5 px-2 bg-[#2dd4bf]/10 text-teal-600 dark:text-[#2dd4bf] text-[9.5px] font-mono font-bold rounded uppercase">The Protocol</span>
                    <p className="text-stone-500 font-semibold text-[11.5px]">
                      Instead of "talking more," you place a recurring 15-minute sync on the calendar.
                    </p>
                  </div>
                  {/* Governance Trigger */}
                  <div className="flex gap-3 items-start text-xs">
                    <span className="py-0.5 px-2 bg-[#2dd4bf]/10 text-teal-600 dark:text-[#2dd4bf] text-[9.5px] font-mono font-bold rounded uppercase">The Trigger</span>
                    <p className="text-stone-500 font-semibold text-[11.5px]">
                      Instead of "trying to remember," you set a hard automated reminder or "kill-switch."
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-stone-200 dark:border-stone-900 flex justify-between text-[10px] font-mono text-teal-600 dark:text-[#2dd4bf]">
                <span>DETERMINISTIC VERIFICATION</span>
                <span>INVARIANT LOCK: SECURE</span>
              </div>
            </div>

          </div>

          {/* Everyday Methodology Grid block */}
          <div className="mt-16 space-y-6">
            <div className="max-w-xl text-left">
              <span className="font-mono text-xs text-[#2dd4bf] font-bold tracking-widest uppercase mb-2 block">
                SYSTEM STEPS FOR INDIVIDUAL GROWTH
              </span>
              <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-100 tracking-tight">
                The Core Methodology: Mirror, Dissonance, Phase
              </h2>
              <p className="text-xs text-stone-500 font-semibold mt-1.5 leading-relaxed">
                Break down abstract cognitive friction into three actionable, mathematical, and deterministic stages.
              </p>
            </div>

            {/* High fidelity horizontal block representation */}
            <div className={`overflow-hidden border rounded-3xl ${
              isDark ? 'bg-[#09090b]/30' : 'bg-white'
            } border-stone-200 dark:border-stone-900`}>
              <div className="overflow-x-auto text-xs md:text-sm">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className={`border-b ${
                      isDark ? 'border-stone-850 bg-[#0d0d10]' : 'border-stone-150 bg-stone-50/50'
                    }`}>
                      <th className="p-5 font-bold uppercase tracking-wider text-xs w-1/4 text-stone-400">Stage</th>
                      <th className="p-5 font-bold uppercase tracking-wider text-xs w-2/5 text-stone-400">Action</th>
                      <th className="p-5 font-bold uppercase tracking-wider text-xs w-2/5 text-[#2dd4bf] font-mono">Everyday Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/50 dark:divide-[#1a1a20] font-semibold text-stone-500">
                    <tr className="text-xs">
                      <td className="p-5 font-bold text-stone-900 dark:text-stone-300 font-mono text-[11px] uppercase tracking-wider text-[#2dd4bf]">
                        Mirror
                      </td>
                      <td className="p-5 leading-relaxed">
                        Reflect the current state exactly as it is, without judgment.
                      </td>
                      <td className="p-5 text-stone-400 font-mono italic">
                        "I want to start a side project, but I spend 4 hours a night on my phone and have no desk."
                      </td>
                    </tr>
                    <tr className="text-xs">
                      <td className="p-5 font-bold text-stone-900 dark:text-stone-300 font-mono text-[11px] uppercase tracking-wider text-amber-500">
                        Dissonance
                      </td>
                      <td className="p-5 leading-relaxed">
                        Identify structural contradictions and missing bindings.
                      </td>
                      <td className="p-5 text-stone-400 font-mono italic">
                        My goal (productivity) is in direct conflict with my environment and current habits (distraction).
                      </td>
                    </tr>
                    <tr className="text-xs">
                      <td className="p-5 font-bold text-stone-900 dark:text-stone-300 font-mono text-[11px] uppercase tracking-wider text-[#2dd4bf]">
                        Phase
                      </td>
                      <td className="p-5 leading-relaxed">
                        Propose small, testable shifts with an owner, metric, and horizon.
                      </td>
                      <td className="p-5 text-[#2dd4bf] font-mono">
                        Lever: Put phone in another room at 8PM. Metric: 2h of work. Horizon: 7 days.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Precision Question for Personal Growth banner */}
          <div className={`mt-12 p-8 rounded-[2rem] border text-left relative ${
            isDark ? 'bg-zinc-950/40 border-stone-900' : 'bg-stone-50 border-stone-200'
          }`}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#2dd4bf] block mb-2.5">
              THE PRECISION QUESTION FOR PERSONAL GROWTH
            </span>
            <blockquote className="text-xl md:text-2xl font-serif text-stone-900 dark:text-white leading-tight font-medium max-w-3xl">
              "Am I optimizing for immediate comfort or for long-term structural stability?"
            </blockquote>
            <p className="text-[11px] text-stone-500 font-semibold mt-3 font-mono">
              // Use this single, sharp question to force a decision when stuck between two paths.
            </p>
          </div>
        </section>

        {/* VIEW TITLE */}
        <div className="mb-10 text-left">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#2dd4bf] bg-[#2dd4bf]/10 px-3 py-1 rounded inline-flex items-center gap-2 mb-4">
            <Cpu size={12} className="animate-pulse" /> COGNITIVE COMPLIANCE AGENT
          </span>
          <h1 className={`text-4xl font-extrabold tracking-tight leading-[1.1] ${theme === 'dark' ? 'text-stone-400' : theme === 'dim' ? 'text-stone-300' : 'text-stone-600'}`}>
            Trust Loop Analytics Terminal
          </h1>
          <p className="text-sm leading-relaxed font-normal text-stone-500 mt-2 max-w-2xl">
            Test the live Phase Mirror Agent. Feed system specifications, SLAs, logs, or operational parameters to name cognitive drifts, bound probabilistic vulnerabilities, and synthesize deterministic invariants.
          </p>
        </div>

        {/* TWO-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* TERMINAL CHAT WINDOW (8 COLS) */}
          <div className="lg:col-span-8 flex flex-col h-[650px] rounded-2xl border border-stone-800 bg-black overflow-hidden relative shadow-[0_15px_50px_-25px_rgba(45,212,191,0.15)]">
            
            {/* TERMINAL HEADER */}
            <div className="h-12 border-b border-stone-900 bg-zinc-950/80 backdrop-blur-sm px-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-3 style-circle h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 style-circle h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 style-circle h-3 rounded-full bg-[#2dd4bf]/80"></span>
                <span className="font-mono text-[11px] font-extrabold text-stone-500 uppercase ml-4 tracking-widest flex items-center gap-1.5">
                  <Terminal size={12} className="text-[#2dd4bf]" /> Agent-v1.0.8 // localhost
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={clearSession}
                  className="font-mono text-[10px] font-bold text-stone-550 hover:text-rose-400 transition-colors flex items-center gap-1 uppercase"
                  title="Clear Console History"
                >
                  <RefreshCw size={11} /> Reset
                </button>
              </div>
            </div>

            {/* MESSAGE CONTAINER */}
            <div ref={scrollContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6 font-mono text-xs text-stone-300 scrollbar-thin">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex flex-col space-y-1.5 ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* Timestamp & Sender */}
                    <div className="flex items-center gap-2 text-[10px] text-stone-500 font-bold mb-0.5">
                      <span>{msg.role === 'user' ? 'SYSTEM_CLIENT' : 'PHASE_MIRROR_AGENT'}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Bubble */}
                    <div className={`p-4 rounded-xl max-w-[90%] text-left relative overflow-hidden break-words leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-[#2dd4bf]/5 border border-[#2dd4bf]/30 text-stone-200' 
                        : 'bg-zinc-950/60 border border-stone-900 text-stone-300'
                    }`}>
                      {msg.role === 'user' ? (
                        <div className="space-y-2">
                          {msg.fileName && (
                            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#2dd4bf] border-b border-[#2dd4bf]/10 pb-1.5 mb-2">
                              <FileCheck size={12} /> Context: {msg.fileName}
                            </div>
                          )}
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      ) : (
                        renderTerminalText(msg.text, true)
                      )}
                    </div>
                  </div>
                ))}
              </AnimatePresence>

              {/* Processing Pulsing Loader */}
              {isProcessing && (
                <div className="flex flex-col space-y-1.5 items-start">
                  <div className="flex items-center gap-2 text-[10px] text-stone-500 font-bold">
                    <span>PHASE_MIRROR_AGENT</span>
                    <span>•</span>
                    <span className="text-[#2dd4bf] animate-pulse">TRANSMITTING...</span>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950/60 border border-stone-900 text-stone-300 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-ping"></span>
                    <span className="font-mono text-xs font-bold text-[#2dd4bf]">Running semantic evaluation framework...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ATTACHED FILES CHIPS */}
            {attachedFiles.length > 0 && (
              <div className="px-5 py-2 border-t border-stone-900 bg-zinc-950 flex flex-wrap gap-2 shrink-0 font-mono text-[10px] text-stone-400 max-h-[85px] overflow-y-auto scrollbar-thin">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-[#2dd4bf]/5 border border-[#2dd4bf]/20 px-2 py-1 rounded inline-flex">
                    <span className="text-stone-300 truncate max-w-[120px]">{file.name}</span>
                    <span className="text-[9px] text-[#2dd4bf]/70 shrink-0 font-bold">{file.size}</span>
                    <button 
                      onClick={() => removeAttachedFile(idx)}
                      className="text-stone-500 hover:text-white transition-colors ml-1 focus:outline-none shrink-0"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* SEND / INPUT TOOLBAR */}
            <div className="p-4 border-t border-stone-900 bg-zinc-950/50 shrink-0" onMouseEnter={startSelfDestructTimer}>
              <div className="flex items-center gap-3 bg-[#030303] border border-stone-850 rounded-xl p-2 focus-within:border-[#2dd4bf]/40 transition-all">
                
                <input 
                  type="file"
                  id="analytics-file-upload"
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  className="hidden"
                  accept=".txt,.json,.md,.csv,.log,.png,.jpg,.jpeg"
                  multiple
                />

                <input 
                  type="text"
                  onMouseEnter={startSelfDestructTimer}
                  onFocus={startSelfDestructTimer}
                  placeholder={attachedFiles.length > 0 ? `Ask questions about these ${attachedFiles.length} files...` : "phase-mirror-agent ~ % type your system claims or questions here..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-transparent border-0 outline-none text-stone-200 placeholder-stone-600 font-mono text-xs py-1"
                />

                <button
                  onClick={() => handleSendMessage()}
                  onMouseEnter={startSelfDestructTimer}
                  disabled={!inputText.trim() && attachedFiles.length === 0}
                  className="px-4 py-2 bg-[#2dd4bf] text-black font-extrabold uppercase text-[10px] tracking-wider rounded-lg flex items-center gap-1.5 hover:bg-[#2dd4bf]/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                >
                  COMPILE <Send size={11} />
                </button>
              </div>
            </div>

          </div>

          {/* PRESSETS & DRAG-DROP SIDEBAR (4 COLS) */}
          <div className="lg:col-span-4 flex flex-col h-[650px] justify-between space-y-4">
            
            {/* SELF-DESTRUCT WIDGET */}
            <div className={`p-3.5 rounded-2xl border font-mono transition-all duration-500 overflow-hidden relative ${
              timerActive 
                ? 'bg-rose-500/[0.01] border-rose-500/20' 
                : (isDark ? 'bg-[#050505] border-stone-900/60' : 'bg-white border-stone-200/80 shadow-xs')
            }`}>
              {/* Fine CRT scanline background style */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />

              <div className="flex items-center justify-between mb-2.5 relative z-10">
                <div className="flex items-center gap-1.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                    timerActive ? 'bg-rose-500 animate-pulse' : 'bg-teal-400'
                  }`} />
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                    timerActive ? 'text-rose-400' : (isDark ? 'text-stone-400' : 'text-stone-600')
                  }`}>
                    {timerActive ? '// DESTRUCT SEQUENCE' : '// COMPLIANCE COVENANT'}
                  </span>
                </div>
                <span className={`text-[8px] font-extrabold tracking-widest px-2 py-0.5 rounded font-mono border ${
                  timerActive 
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/15' 
                    : 'bg-[#2dd4bf]/10 text-[#2dd4bf] border-[#2dd4bf]/10'
                }`}>
                  {timerActive ? 'DECAYING' : 'SECURE'}
                </span>
              </div>

              {/* Monospaced Digital Chrono Readout */}
              <div className="text-center py-2.5 relative z-10">
                <div className="inline-flex items-baseline gap-0.5">
                  <span className={`text-4xl font-black tracking-wider font-mono transition-all duration-300 ${
                    timerActive 
                      ? 'text-rose-500 [text-shadow:0_0_12px_rgba(239,68,68,0.4)]' 
                      : (isDark ? 'text-white' : 'text-stone-900')
                  }`}>
                    {formatCountdown(countdown)}
                  </span>
                  <span className={`text-[10px] font-bold tracking-widest ${
                    timerActive ? 'text-rose-600' : 'text-[#2dd4bf]'
                  }`}>
                    s
                  </span>
                </div>
                <div className={`text-[8px] font-bold uppercase transition-colors duration-300 mt-1 tracking-[0.15em] ${
                  timerActive ? 'text-stone-400' : 'text-stone-500'
                }`}>
                  {timerActive ? 'volatile cache self-purges on expiry' : 'armed on interactive input'}
                </div>
              </div>

              {/* Progress Track */}
              <div className="h-1 bg-stone-950 rounded-full overflow-hidden mb-3 border border-stone-900/40 relative z-10">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    timerActive ? 'bg-rose-500' : 'bg-[#2dd4bf]'
                  }`}
                  style={{ width: `${(countdown / 300) * 100}%` }}
                />
              </div>

              {/* Parameter Feed Grid */}
              <div className="grid grid-cols-2 gap-2 text-[9px] uppercase pt-2.5 border-t border-stone-900/40 font-mono text-stone-500 relative z-10">
                <div>
                  <span className="block text-[8px] tracking-wider text-stone-600">Active Buffer</span>
                  <span className={`font-bold ${timerActive ? 'text-rose-400' : (isDark ? 'text-stone-300' : 'text-stone-800')}`}>
                    {attachedFiles.length > 0 ? `${attachedFiles.length} FILES` : '0 DOCUMENTS'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] tracking-wider text-stone-600">Session Status</span>
                  <span className="font-bold text-[#2dd4bf]">
                    deterministic
                  </span>
                </div>
              </div>
            </div>

            {/* FILE DRAG & DROP CARD */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onMouseEnter={startSelfDestructTimer}
              className={`p-4 rounded-xl border text-center relative overflow-hidden transition-all duration-300 flex-1 flex flex-col justify-center ${
                dragActive 
                  ? 'border-[#2dd4bf] bg-[#2dd4bf]/5' 
                  : (isDark ? 'bg-[#050505] border-stone-900' : 'bg-stone-50 border-stone-200/60 shadow-xs')
              }`}
            >
              <div className="absolute inset-0 bg-[#2dd4bf]/[0.01] pointer-events-none"></div>
              
              <div className="flex flex-col items-center justify-center py-2 h-full">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 border ${
                  dragActive ? 'border-[#2dd4bf] bg-[#2dd4bf]/10 text-[#2dd4bf]' : 'border-stone-800 bg-black text-stone-500'
                }`}>
                  <Upload size={14} className={dragActive ? 'animate-bounce' : ''} />
                </div>
                
                <h3 className={`text-xs font-bold font-mono tracking-wider uppercase mb-1 ${isDark ? 'text-stone-300' : 'text-stone-850'}`}>
                  Ingest Target Context
                </h3>
                <p className="text-[9px] font-mono text-stone-500 mb-3 max-w-xs leading-normal">
                  Drag-and-drop multiple contract specs (.json/.md/.txt), telemetry logs, or schemas.
                </p>

                {attachedFiles.length > 0 && (
                  <div className="w-full max-h-[110px] overflow-y-auto space-y-1.5 scrollbar-thin text-left border-y border-stone-900/60 py-2 my-2.5">
                    {attachedFiles.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-black/40 border border-stone-900 px-2 py-1 rounded text-[9px] font-mono">
                        <span className="text-stone-300 truncate max-w-[150px]" title={f.name}>{f.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-stone-500 text-[8px]">{f.size}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAttachedFile(idx);
                            }}
                            className="text-stone-500 hover:text-rose-400 p-0.5 focus:outline-none"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  onMouseEnter={startSelfDestructTimer}
                  className="px-3.5 py-1.5 border border-stone-800 hover:border-teal-500 hover:text-white rounded-lg font-mono text-[9px] uppercase font-bold tracking-wider cursor-pointer bg-black/40 text-stone-400 transition-colors"
                >
                  Locate Resource File
                </button>
              </div>
            </div>


            {/* TRUST ENGINE STATS */}
            <div className={`p-4 rounded-xl border font-mono text-[10px] text-stone-500 space-y-3 ${
              isDark ? 'bg-[#050505] border-stone-900/60' : 'bg-stone-50 border-stone-200/60 shadow-xs'
            }`}>
              <h3 className="font-bold text-[#2dd4bf] uppercase tracking-wider flex items-center gap-1.5">
                <Cpu size={12} /> Compliance Engine Parameters
              </h3>
              
              <div className="space-y-1.5 font-mono text-[9px]">
                <div className="flex justify-between border-b border-stone-900/40 pb-1">
                  <span>Inference Engine //</span>
                  <span className="text-stone-300">gemini-3.5-flash</span>
                </div>
                <div className="flex justify-between border-b border-stone-900/40 pb-1">
                  <span>Cognitive Limit //</span>
                  <span className="text-stone-300">Stateless Proxy</span>
                </div>
                <div className="flex justify-between border-b border-stone-900/40 pb-1">
                  <span>File Ingestion Maximum //</span>
                  <span className="text-stone-300">15 MB Payload</span>
                </div>
                <div className="flex justify-between">
                  <span>Resonance Threshold //</span>
                  <span className="text-[#2dd4bf]">100% Deterministic</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AnalyticsView;
