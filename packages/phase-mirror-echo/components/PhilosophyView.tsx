import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  RefreshCw, 
  BarChart, 
  Clock, 
  RotateCcw, 
  CheckCircle2,
  Anchor,
  BookOpen,
  ArrowRight,
  Terminal,
  Activity,
  Sliders,
  Scale,
  FileText,
  Lock,
  Compass,
  AlertTriangle,
  Fingerprint,
  Zap,
  Cpu,
  Settings,
  ShieldAlert,
  Database
} from 'lucide-react';

interface PhilosophyViewProps {
  isDarkMode: boolean;
}

const PhilosophyView: React.FC<PhilosophyViewProps> = ({ isDarkMode }) => {
  // Loop state
  const [activeStep, setActiveStep] = useState<number>(1); // Step indices 0 to 4
  const [scanSpeed, setScanSpeed] = useState<number>(1);
  const [scannedCount, setScannedCount] = useState<number>(42);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  
  // Custom interactive slider state for Mathematical Scaling (Lambda Constant)
  const [systemComplexity, setSystemComplexity] = useState<number>(240);
  const [simulateDrift, setSimulateDrift] = useState<boolean>(false);

  // Self-Applied Dissonance interactive velocity state
  const [velocityRegulation, setVelocityRegulation] = useState<boolean>(true);

  // Auto incremental counter for scans to simulate realism
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      interval = setInterval(() => {
        setScannedCount(prev => prev + Math.floor(Math.random() * 3) + 1);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  // Compute values for Formula Simulator
  // Lambda_m multiplier scales with complexity logarithmically or linearly
  const computedLambda = (1.0 + Math.log10(systemComplexity / 10) * 0.42).toFixed(3);
  const activeLeversCount = Math.floor(systemComplexity / 45) + 4;
  const guardrailThreshold = Math.max(12, Math.min(98, Math.round(92.5 - (systemComplexity * 0.04)))).toFixed(1);
  const lawfulFrameStatus = systemComplexity > 750 
    ? 'Fail-Closed Buffer Triggered' 
    : systemComplexity > 450 
    ? 'Defensive Posture Active' 
    : systemComplexity > 150 
    ? 'Dynamic Equilibrium' 
    : 'Highly Coherent';

  // 5 Steps of the Mechanical Loop
  const loopSteps = [
    {
      num: "01",
      title: "Observation / Ingress",
      badge: "Observation Stage",
      tagline: "The Neutral Intake of Operative Fact",
      desc: "Before any governance logic is run, the protocol completes structural scans of system configurations, codebase components, access matrices, and stated policies. It translates them into standardized logic models without any preliminary bias or judgment.",
      icon: <Fingerprint size={20} className="text-brand-accent animate-pulse" />
    },
    {
      num: "02",
      title: "Mirror (The Reflection)",
      badge: "Mirror Step",
      tagline: "Neutral, Factual Status Reflection",
      desc: "The system reflects the current live state of code, integrations, and compliance claims directly, side-by-side with authorized system specifications. It creates a transparent, non-opinionated factual baseline that cannot be bypassed by prompts or manual configuration. No judgment or endorsement is made at this level.",
      icon: <Compass size={20} className="text-brand-accent" />
    },
    {
      num: "03",
      title: "Dissonance (The Tension)",
      badge: "Dissonance Mapping",
      tagline: "Identifying Systemwide Self-Contradictions",
      desc: "It systematically evaluates tension mappings—specifically detecting structural contradictions wherestated strategic intentions conflict with actual machine rules. A common example is claiming standard 'safe fail-safe operation' but allowing open agentic wildcard execution permissions. Crucially, the protocol highlights these as critical compiling failures.",
      icon: <ShieldAlert size={20} className="text-[#2dd4bf]" />
    },
    {
      num: "04",
      title: "Phase (The Lever)",
      badge: "Phase Synthesis",
      tagline: "Forcing Tensions into Deterministic Bindings",
      desc: "Every identified tension is programmatically converted into a strict, binding 'Lever'. The Lever cannot remain abstract. It must explicitly bind four clear constraints: an Owner, a verifiable Metric, a precise Horizon (timeline), and a deterministic Artifact (such as an ADR, migration spec, or Terraform rule). The 'OMHA' envelope secures closure.",
      icon: <Sliders size={20} className="text-brand-accent" />
    },
    {
      num: "05",
      title: "Commitment & Enforcement",
      badge: "Enforcement Pipeline",
      tagline: "Fail-Closed Continuous Realignment",
      desc: "These synthesized levers are fed continuously back into the compiler and deployment pipelines. If compliance thresholds or mathematical verification steps fail during checkout, Phase Mirror defaults to a strict, secure 'fail-closed' posture—immediately arresting unauthorized action and preventing drift.",
      icon: <Lock size={20} className="text-brand-accent" />
    }
  ];

  return (
    <div id="philosophy-view-container" className={`pt-24 pb-24 ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* SECTION 1: EPIC PHILOSOPHY HERO */}
        <motion.div 
          id="philosophy-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mb-24"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent block mb-6">Internal Axioms & Design Rules</span>
          <h1 className={`text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
            A Governance Protocol of <span className="italic font-normal text-stone-400">Mathematical Stability and Fact-Reflecting Alignment.</span>
          </h1>
          <p className="text-lg md:text-xl leading-relaxed text-stone-500 font-medium max-w-3xl">
            Phase Mirror abandons administrative guesswork and superficial checks. We treat software and governance as mathematically linked, proof-carrying artifacts. Systems can change instantly, but physical rules remain stable.
          </p>
        </motion.div>

        {/* SECTION 2: THE MECHANICAL LOOP IN-DEPTH */}
        <section id="mechanical-loop-section" className="mb-32">
          
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-stone-800/10 dark:border-stone-850/60 pb-8 mb-16 gap-4">
            <div>
              <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-brand-accent block mb-1">Methodology Engine</span>
              <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                The Mechanical Loop: Mirror, Dissonance, Phase
              </h2>
            </div>
            <p className="text-stone-500 text-sm md:text-right max-w-sm font-semibold">
              The continuous five-step operating loop that translates fuzzy architectural liabilities into strict, actionable logical &ldquo;levers&rdquo;.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Step Selection Controls (Left Column / col-span-5) */}
            <div className="lg:col-span-5 space-y-3.5">
              <span className="text-[10px] font-mono uppercase text-stone-500 font-bold tracking-widest block mb-1">
                CYCLE STAGES: SELECT TO EXAMINE
              </span>
              
              <div className="space-y-3">
                {loopSteps.map((step, idx) => {
                  const stepNum = idx + 1;
                  const isActive = activeStep === stepNum;
                  return (
                    <button
                      key={stepNum}
                      id={`btn-philosophical-loop-${stepNum}`}
                      onClick={() => setActiveStep(stepNum)}
                      className={`w-full p-5 lg:p-6 rounded-[2rem] text-left border transition-all duration-300 relative group cursor-pointer ${
                        isActive
                          ? 'bg-brand-accent/[0.06] border-[#2dd4bf]/40'
                          : 'bg-[#121214]/30 dark:bg-[#121215]/50 border-stone-800/10 dark:border-stone-850/50 hover:bg-[#1c1c1f]/40 dark:hover:bg-[#141416]/90'
                      }`}
                    >
                      {isActive && (
                        <div id={`active-indicator-bar-${stepNum}`} className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-accent rounded-r-full" />
                      )}
                      
                      <div className="flex items-center gap-4">
                        <span className={`font-mono text-sm font-black tracking-widest ${
                          isActive ? 'text-brand-accent' : 'text-stone-605 text-stone-600'
                        }`}>
                          {step.num}
                        </span>
                        
                        <div className="flex-1">
                          <h3 className={`text-base font-bold transition-colors ${
                            isActive 
                              ? (isDarkMode ? 'text-white' : 'text-stone-900') 
                              : (isDarkMode ? 'text-stone-400 group-hover:text-stone-200' : 'text-stone-700')
                          }`}>
                            {step.title}
                          </h3>
                          <span className="text-[11px] text-stone-500 font-medium block mt-0.5 leading-snug">
                            {step.tagline}
                          </span>
                        </div>

                        <div className={`transition-transform duration-300 ${isActive ? 'rotate-90 translate-x-1 opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                          <ArrowRight size={14} className={isActive ? 'text-brand-accent' : 'text-stone-500'} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Diagnostic Monitor (Right Column / col-span-7) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div id="interactive-mechanical-monitor" className={`rounded-[3.5rem] border p-8 md:p-10 h-full flex flex-col justify-between relative overflow-hidden ${
                isDarkMode ? 'bg-[#0b0b0d] border-stone-850' : 'bg-white border-stone-150 shadow-md'
              }`}>
                {/* Background ambient mesh */}
                <div className="absolute inset-0 bg-radial-at-t from-[#2dd4bf]/[0.02] to-transparent pointer-events-none" />
                
                {/* Stage information */}
                <div className="relative space-y-6">
                  
                  {/* Monitor Header Status */}
                  <div className="flex items-center justify-between border-b border-stone-800/10 dark:border-stone-850/50 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-brand-accent animate-ping" />
                      <span className="font-mono text-xs font-bold text-brand-accent tracking-widest uppercase">
                        Active Stage View
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-stone-500">
                      <span>Node Ref: PH-LOOP_0{activeStep}</span>
                      <span className="px-1.5 py-0.5 bg-black/60 border border-stone-850 rounded">STABLE</span>
                    </div>
                  </div>

                  {/* Active Step Content */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 rounded-xl">
                        {loopSteps[activeStep - 1].icon}
                      </div>
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#2dd4bf] font-extrabold block">
                          Phase Section 0{activeStep}
                        </span>
                        <h4 className={`text-xl font-bold ${isDarkMode ? 'text-stone-105' : 'text-stone-900'}`}>
                          {loopSteps[activeStep - 1].title}
                        </h4>
                      </div>
                    </div>

                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-605'} font-medium pt-2`}>
                      {loopSteps[activeStep - 1].desc}
                    </p>
                  </div>

                  {/* Interactive Visual Sandbox specifically adjusted to the selected step */}
                  <div className={`p-5 rounded-2xl border font-mono text-[11px] leading-relaxed relative ${
                    isDarkMode ? 'bg-black/60 border-stone-850' : 'bg-stone-50 border-stone-150'
                  }`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                        Live Simulation Output
                      </span>
                      <span className="text-[9px] text-[#2dd4bf] bg-[#2dd4bf]/10 px-1.5 py-0.5 rounded leading-none font-bold">
                        Interactive Logs
                      </span>
                    </div>

                    {/* RENDERING STEP SPECIFIC EXPERIMENTAL CONSOLES */}
                    {activeStep === 1 && (
                      <div id="sim-observation-panel" className="space-y-1.5 text-stone-500">
                        <div className="flex justify-between">
                          <span className="text-stone-400">&gt; Starting recursive workspace crawl...</span>
                          <span className="text-[#2dd4bf]">Running</span>
                        </div>
                        <div>&gt; Scanning directory structure and configurations (package.json, git metadata)</div>
                        <div className="text-stone-400">&gt; [Ingestion ID] file_ref::/api/auth_matrix.yaml</div>
                        <div className="text-stone-400">&gt; [Ingestion ID] code_ref::/src/controllers/adminController.ts</div>
                        <div className="text-[#2dd4bf] font-bold">&gt; Absolute variables mapped: {scannedCount} nodes. Status: Complete.</div>
                        <div className="pt-3 flex items-center justify-between">
                          <span className="text-[10px] text-stone-600">Scan Frequency Regulator: {scanSpeed}x</span>
                          <button 
                            id="btn-tune-scanner"
                            onClick={() => {
                              setScanSpeed(prev => prev === 3 ? 1 : prev + 1);
                              setScannedCount(prev => prev + 5);
                            }}
                            className="bg-[#2dd4bf]/10 text-[#2dd4bf] border border-[#2dd4bf]/20 px-2 py-0.5 rounded-md hover:bg-[#2dd4bf]/20 text-[10px] font-sans font-semibold cursor-pointer"
                          >
                            Accelerate Crawl
                          </button>
                        </div>
                      </div>
                    )}

                    {activeStep === 2 && (
                      <div id="sim-mirror-panel" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-stone-500 block border-b border-stone-800 pb-0.5">Raw Code Claims</span>
                          <span className="text-stone-400 text-[10px] line-clamp-3">
                            &ldquo;We have configured standard secure developer boundaries. No administrative credentials can leak.&rdquo;
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[#2dd4bf] block border-b border-stone-800 pb-0.5 font-bold">Reflected Fact</span>
                          <div className="text-stone-400 text-[10px]">
                            <span className="text-amber-500 font-bold block">WARN // env_leak_risk</span>
                            <span className="truncate block font-mono text-[9px] text-stone-500">process.env.ADMIN_KEY exposed client-side (line 42)</span>
                          </div>
                        </div>
                        <div className="col-span-1 md:col-span-2 pt-2 text-[10px] text-stone-600 italic">
                          Fact model created representing absolute structures without emotional interpretation or organizational bias.
                        </div>
                      </div>
                    )}

                    {activeStep === 3 && (
                      <div id="sim-dissonance-panel" className="space-y-2">
                        <div className="flex items-center gap-2.5 p-2 px-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                          <AlertTriangle size={14} className="shrink-0 animate-bounce" />
                          <div className="text-[10.5px]">
                            <strong>CONTRADICTION DETECTED (MAPPED AS DISSONANCE-112)</strong>
                          </div>
                        </div>
                        <div className="pl-1 text-stone-450 text-stone-400 mt-1 space-y-1">
                          <div><strong className="text-stone-300">Stated Policy:</strong> &ldquo;Strict Fail-Closed on third-party failure. Code compliance = 100% (MD-001)&rdquo;</div>
                          <div><strong className="text-stone-300">Live Config:</strong> &ldquo;authFallbackMode: &apos;allow_all_on_error&apos; (Non-compliant Bypass)&rdquo;</div>
                          <div className="text-[#2dd4bf] font-semibold">&gt; Integrity tension delta generated: 8.7 gap units (Action Block Required).</div>
                        </div>
                      </div>
                    )}

                    {activeStep === 4 && (
                      <div id="sim-phase-panel" className="space-y-2 text-xs">
                        <span className="text-[10px] font-mono text-stone-400 block border-b border-stone-850 pb-1">
                          Synthesized Phase Lever (Lever Envelope)
                        </span>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-[11px]">
                          <div><strong className="text-stone-450 dark:text-stone-450 font-bold">Owner:</strong> <span className="text-brand-accent">platform-security-lead</span></div>
                          <div><strong className="text-stone-450 dark:text-stone-450 font-bold">Metric:</strong> <span className="text-brand-accent">fallback_block_state === 1.0</span></div>
                          <div><strong className="text-stone-450 dark:text-stone-450 font-bold">Horizon:</strong> <span className="text-brand-accent">6 Hours (Severe Risk)</span></div>
                          <div><strong className="text-stone-450 dark:text-stone-450 font-bold">Artifact:</strong> <span className="text-brand-accent font-mono">ADRs/ADR-005-failclosed.md</span></div>
                        </div>
                        <div className="pt-1.5 text-[10px] text-stone-500">
                          Envelope metadata hash: <span className="text-stone-400 font-mono">0x7f2dd4bf...5089</span>
                        </div>
                      </div>
                    )}

                    {activeStep === 5 && (
                      <div id="sim-enforcement-panel" className="space-y-1.5">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CheckCircle2 size={12} />
                          <span className="font-bold text-[10.5px]">CI Pipeline Hook: Active Listener (Block Policy)</span>
                        </div>
                        <div className="text-stone-400">&gt; Evaluating merge request artifacts against bound Levers...</div>
                        
                        {simulateDrift ? (
                          <div className="p-2 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-[10.5px] mt-1">
                            <strong>[BLOCKED]</strong> Validation failed for Lever verification path. Defaulting to strict <strong>Fail-Closed</strong> state. Authorizations revoked.
                          </div>
                        ) : (
                          <div className="p-2 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-[10.5px] mt-1">
                            <strong>[PASSED]</strong> Levers verified. Artifact-evidence matches required bindings. Pipeline compilation complete.
                          </div>
                        )}

                        <div className="pt-2 flex justify-end">
                          <button
                            id="btn-simulate-drift"
                            onClick={() => setSimulateDrift(!simulateDrift)}
                            className={`px-3 py-1 rounded text-[10px] font-sans font-bold border transition-colors cursor-pointer ${
                              simulateDrift 
                                ? 'bg-amber-450/10 hover:bg-amber-450/20 border-amber-500 text-amber-500' 
                                : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-400'
                            }`}
                          >
                            {simulateDrift ? 'Reset to Safe Compile' : 'Simulate Drift / Failure'}
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </div>

                {/* Footer and controls */}
                <div className="pt-6 border-t border-stone-800/10 dark:border-stone-850/50 flex flex-wrap gap-4 items-center justify-between text-xs text-stone-500 font-semibold relative">
                  <span>Operates strictly offline/air-gapped.</span>
                  
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        id={`btn-dot-loop-${num}`}
                        onClick={() => setActiveStep(num)}
                        className={`h-2.5 w-2.5 rounded-full transition-all cursor-pointer ${
                          activeStep === num ? 'bg-brand-accent scale-125' : 'bg-stone-800/40 dark:bg-stone-700/60 hover:bg-stone-500'
                        }`}
                        title={`Go to Step ${num}`}
                      />
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

        </section>


        {/* SECTION 3: RECURSIVE GOVERNANCE & MATHEMATICAL SCALING */}
        <section id="recursive-governance-section" className="mb-32">
          
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-stone-800/10 dark:border-stone-850/60 pb-8 mb-16 gap-4">
            <div>
              <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#2dd4bf] block mb-1">Scale Dynamics</span>
              <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Governance as &ldquo;R&D of Productivity&rdquo;
              </h2>
            </div>
            <p className="text-stone-500 text-sm md:text-right max-w-sm font-semibold">
              The recursive protocol loop ensuring that Phase Mirror's own systems are governed by the same strict, proof-carrying metrics that we deploy.
            </p>
          </div>

          {/* Interactive Math Sandbox / Sliders */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
            
            {/* Interactive Control Panel for Mathematical Scaling (col-span-5) */}
            <div className={`p-8 lg:p-10 rounded-[3rem] border lg:col-span-12 xl:col-span-5 space-y-6 ${
              isDarkMode ? 'bg-[#0f0f11] border-stone-850' : 'bg-white border-stone-150 shadow-md'
            }`}>
              <div>
                <span className="text-[10px] font-mono text-[#2dd4bf] uppercase tracking-widest font-extrabold block">
                  Interactive Simulator
                </span>
                <h3 className={`text-xl font-bold mt-1 ${isDarkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                  Complexity Scaling Sandbox
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed font-semibold mt-1">
                  Adjust active infrastructure microservice nodes to observe how the Multiplicity Constant (<span className="font-mono text-[#2dd4bf] font-bold">&Lambda;_m</span>) dynamically scales system-wide governance thresholds.
                </p>
              </div>

              {/* Slider widget */}
              <div className="space-y-3.5 pt-4 border-t border-stone-800/10 dark:border-stone-850/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-400">Total Infrastructure Nodes (N):</span>
                  <span className="font-mono font-extrabold text-brand-accent text-sm bg-brand-accent/10 px-2.5 py-0.5 rounded">
                    {systemComplexity} Nodes
                  </span>
                </div>
                
                <input
                  type="range"
                  id="complexity-slider"
                  min="10"
                  max="1000"
                  step="10"
                  value={systemComplexity}
                  onChange={(e) => setSystemComplexity(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                />

                <div className="flex justify-between text-[10px] text-stone-600 font-bold font-mono">
                  <span>10 (Isolated Micro)</span>
                  <span>500 (Enterprise Ecosystem)</span>
                  <span>1000 (Complex Cluster)</span>
                </div>
              </div>

              {/* Formula and Real-time Readout Dashboard */}
              <div className="p-4 rounded-2xl bg-black border border-stone-850 space-y-3 font-mono text-xs text-stone-400">
                <div className="flex justify-between items-center border-b border-stone-850 pb-2">
                  <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider">Formula Outlines</span>
                  <span className="text-stone-600 text-[10px]">Real-time Calculation</span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span>Multiplicity Constant (&Lambda;_m)</span>
                  <span className="text-brand-accent font-bold text-sm">{computedLambda}x</span>
                </div>
                <div className="text-[10px] text-stone-600 italic -mt-1 leading-snug">
                  Formula: &Lambda;_m = 1.0 + ln(N / 10) * 0.42
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-stone-900">
                  <span>Enforcement Threshold limit</span>
                  <span className="text-amber-500 font-bold">{guardrailThreshold}%</span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-stone-900">
                  <span>Active Phase Levers</span>
                  <span className="text-stone-300 font-bold">{activeLeversCount}</span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-stone-900">
                  <span>Protocol Frame State</span>
                  <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded leading-none ${
                    systemComplexity > 750 
                      ? 'bg-rose-500/15 text-rose-400' 
                      : systemComplexity > 450 
                      ? 'bg-amber-500/15 text-amber-500' 
                      : 'bg-emerald-500/15 text-emerald-400'
                  }`}>
                    {lawfulFrameStatus}
                  </span>
                </div>
              </div>

              {/* Informative text below simulator */}
              <p className="text-[11.5px] text-stone-500 leading-relaxed font-semibold italic">
                {systemComplexity > 750 
                  ? "At scale configurations, the 'fail-closed' sensitivity increases. The system prioritizes strict systemwide absolute integrity over modular availability."
                  : "The multiplicity weights stabilize self-recursive system dependencies, preventing mathematical drift during ongoing autonomous node expansion."}
              </p>

            </div>

            {/* Expansions and Bento Cards describing loop details (col-span-7) */}
            <div className="lg:col-span-12 xl:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Self-Applied Dissonance */}
              <div className={`p-8 rounded-[2.5rem] border flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0f0f11]/60 border-stone-850' : 'bg-white border-stone-150 shadow-sm'
              }`}>
                <div className="space-y-4">
                  <div className="p-3.5 bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 text-[#2dd4bf] rounded-2xl w-fit">
                    <RefreshCw size={20} />
                  </div>
                  <h4 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    Self-Applied Dissonance
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                    The protocol explicitly audits and regulates its own development roadmap. Rather than pushing code features without bound, Phase Mirror tracks and calibrates its system-wide <strong className="text-stone-450 dark:text-stone-300 font-bold">Research Velocity</strong>. If our features outstrip our capacity to automatically verify rules (MD-001 through MD-005), our development governor slows down the feature pipeline instantly.
                  </p>
                </div>

                {/* Micro interactive slider for Velocity regulation */}
                <div className="pt-6 mt-6 border-t border-stone-850/60 flex items-center justify-between">
                  <div className="text-[11px] font-mono">
                    <span className="text-stone-500 font-bold">Velocity Governor: </span>
                    <span className={velocityRegulation ? 'text-brand-accent font-bold' : 'text-amber-500 font-bold'}>
                      {velocityRegulation ? 'STABLE (92% speed)' : 'OVERLOADED (145% speed)'}
                    </span>
                  </div>
                  <button 
                    id="btn-governor-toggle"
                    onClick={() => setVelocityRegulation(!velocityRegulation)}
                    className="p-1 px-2.5 rounded bg-black border border-stone-850 text-[10px] font-mono hover:border-stone-700 text-stone-400 cursor-pointer"
                  >
                    {velocityRegulation ? 'Deactivate Regulation' : 'Activate Regulation'}
                  </button>
                </div>
              </div>

              {/* Card 2: Mathematical Scaling via Lambda Constant */}
              <div className={`p-8 rounded-[2.5rem] border flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0f0f11]/60 border-stone-850' : 'bg-white border-stone-150 shadow-sm'
              }`}>
                <div className="space-y-4">
                  <div className="p-3.5 bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 text-[#2dd4bf] rounded-2xl w-fit">
                    <BarChart size={20} />
                  </div>
                  <h4 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    Mathematical Scaling
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                    The same weight systems used to stabilize recursive updates and alignments in multi-agent models—specifically the **Multiplicity Constant (<span className="font-mono text-[#2dd4bf] font-bold">&Lambda;_m</span>)**—are applied directly to scale Phase Mirror's internal guardrail thresholds. This ensures that the foundational **Lawful Frame** remains predictable, rigid, and safe, regardless of scaling.
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-stone-850/60 text-[10.5px] font-mono text-stone-500">
                  Current computed constant scaling ratio: <span className="text-[#2dd4bf] font-bold">{computedLambda}x buffer multipliers</span>
                </div>
              </div>

              {/* Card 3: Artifact-Driven Development */}
              <div className={`p-8 rounded-[2.5rem] border md:col-span-2 flex flex-col md:flex-row gap-6 justify-between items-start ${
                isDarkMode ? 'bg-[#0f0f11]/60 border-stone-850' : 'bg-white border-stone-150 shadow-sm'
              }`}>
                <div className="space-y-3 max-w-xl">
                  <div className="p-3.5 bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 text-[#2dd4bf] rounded-2xl w-fit">
                    <FileText size={20} />
                  </div>
                  <h4 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    Artifact-Driven Development
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                    We firmly reject abstract or subjective &ldquo;guidelines&rdquo; that are easily bypassed. Every single operational shift, database model update, security posture reconfiguration, and authorization permission block is designed, audited, and committed through explicit physical files: Architectural Decision Records (ADRs), Terraform scripts, and database schema migrations. If an action can&apos;t be translated into a deterministic file, it cannot enter the codebase.
                  </p>
                </div>

                <div className="w-full md:w-64 p-4 rounded-2xl bg-black/60 border border-stone-850 text-[10px] font-mono text-stone-500 space-y-1 shrink-0">
                  <span className="text-[9px] uppercase font-bold text-stone-605 text-stone-500 border-b border-stone-850 pb-1 block mb-2">
                    Committed Stack Artifacts
                  </span>
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>• /policies/MD-001.yaml</span>
                    <span className="text-[#2dd4bf]">Active</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>• /configs/env.config.json</span>
                    <span className="text-[#2dd4bf]">Mirrored</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>• /docs/ADR-005-FailClosed.md</span>
                    <span className="text-[#2dd4bf]">Enforced</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>• /database/schema.ts</span>
                    <span className="text-[#2dd4bf]">Verified</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </section>


        {/* SECTION 4: DEEP INSIGHT SAFEKEEPNG PANEL */}
        <section id="critical-insight-section">
          <div className="relative rounded-[4rem] p-10 md:p-16 overflow-hidden border border-brand-accent/20 bg-[#0c0c0e] shadow-2xl">
            
            {/* Glowing background circles */}
            <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-radial-gradient from-brand-accent/5 to-transparent blur-3xl pointer-events-none" />
            
            <div className="max-w-4xl relative space-y-8">
              
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-[#2dd4bf]/15 rounded-2xl text-[#2dd4bf]">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-brand-accent font-extrabold block">
                    Protocol Invariant Posture
                  </span>
                  <strong className="text-xs uppercase text-stone-500 font-bold">
                    ADR-005 SYSTEM LEVEL COMPILATION RULE
                  </strong>
                </div>
              </div>

              <blockquote className={`text-xl md:text-3xl font-black tracking-tight leading-snug ${
                isDarkMode ? 'text-white' : 'text-stone-100'
              }`}>
                &ldquo;Phase Mirror treats software and governance as <span className="text-brand-accent italic font-normal">proof-carrying artifacts</span>. If the mathematical verification of a governance shift fails, the system defaults to a fail-closed state to prevent governance drift.&rdquo;
              </blockquote>

              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-mono text-stone-500 border-t border-stone-850/60">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Enforcing mathematical invariants</span>
                </div>
                <div>MD-001 through MD-005 active</div>
                <div>Multiplicity constant (&Lambda;_m = {computedLambda}) applied</div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default PhilosophyView;
