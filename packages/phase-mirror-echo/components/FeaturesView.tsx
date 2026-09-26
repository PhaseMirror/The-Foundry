import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Scale, 
  Layers, 
  ArrowRight,
  Code,
  FileText,
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
  Search,
  Eye,
  Sliders,
  ChevronRight,
  Copy,
  Folder,
  Zap,
  Info,
  Activity,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  HelpCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';

interface FeaturesViewProps {
  isDarkMode: boolean;
}

// Simulated codebase file objects for the interactive build-time auditing terminal
interface SimulatorFile {
  name: string;
  type: 'policy' | 'code' | 'adr';
  content: string;
}

const codebaseFiles: SimulatorFile[] = [
  {
    name: "policy_compliance.yaml",
    type: "policy",
    content: `compliance_mandates:
  - id: SEC-AGENT-REF-04
    required_human_loop: true
    max_transaction_value: 5000.00
    isolation_mode: "strict"
  - id: DIRECTIVE-99
    requires_adr_coupling: true`
  },
  {
    name: "agent_orchestrator.py",
    type: "code",
    content: `async def approve_transfer(self, target_entity, value):
    # Optimizing for high throughput and latency
    # bypass human confirmation loop for values under 100k
    if value < 100000: 
        status = await self.system_auth.execute_direct_transfer(target_entity, value)
        return {"status": status, "autonomy_level": "extreme"}`
  },
  {
    name: "ADR-012-AUTONOMY-BOUNDS.md",
    type: "adr",
    content: `# ADR-012: Autonomy Constraints
Status: Approved
Decision: All financial transactions exceeding $5,000 must carry double-signed cryptographic vouchers and trigger asynchronous human escrow. Code is strictly prohibited from executing solo authorizations.`
  }
];

interface Scenario {
  id: string;
  name: string;
  description: string;
  baseAutonomy: number;
  baseConstraint: number;
  baseEntropy: number;
  industry: string;
  defaultLayers: {
    csl: boolean;
    see: boolean;
    l0: boolean;
  };
}

const SCENARIOS: Scenario[] = [
  {
    id: 'finance',
    name: 'High-Frequency Asset Allocator',
    description: 'Autonomous financial portfolio rebalancer acting on predictive market models and social network mood indexes. High stakes, subject to compliance and market manipulation liability.',
    baseAutonomy: 80,
    baseConstraint: 40,
    baseEntropy: 65,
    industry: 'Quantitative Finance & Banking',
    defaultLayers: { csl: false, see: true, l0: false }
  },
  {
    id: 'healthcare',
    name: 'Deep Diagnostic Clinical Copilot',
    description: 'Probabilistic medical assistant analyzing patient history and real-time biometric streams. Agent evaluates life-critical diagnosis under high liability where false negatives create extreme clinical exposure.',
    baseAutonomy: 70,
    baseConstraint: 85,
    baseEntropy: 30,
    industry: 'Critical Clinical Care',
    defaultLayers: { csl: true, see: true, l0: true }
  },
  {
    id: 'remitting',
    name: 'Remediation and Customer Settlement',
    description: 'Autonomous agent authorized to issue financial restitution, credits, or settle billing disputes. Autonomy speeds up response, but hallucinated authority risks immense straight-line loss.',
    baseAutonomy: 60,
    baseConstraint: 50,
    baseEntropy: 50,
    industry: 'Customer Support Operations',
    defaultLayers: { csl: false, see: false, l0: true }
  },
  {
    id: 'devops',
    name: 'Autonomous Code Deployment Daemon',
    description: 'Causal agent that refactors software bugs, schedules build tests, and automatically merges and deploys code directly into production cloud instances based on crash telemetry.',
    baseAutonomy: 90,
    baseConstraint: 30,
    baseEntropy: 80,
    industry: 'Enterprise DevOps & Security',
    defaultLayers: { csl: true, see: false, l0: false }
  }
];

const FeaturesView: React.FC<FeaturesViewProps> = ({ isDarkMode }) => {
  // 1. Current state for the active file in the simulator
  const [selectedSimFile, setSelectedSimFile] = useState<number>(1); // default points to agent_orchestrator.py (code)
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // 2. State for active interactive timeline slide (Mirror -> Dissonance -> Phase)
  const [activeWorkflowStage, setActiveWorkflowStage] = useState<'mirror' | 'dissonance' | 'phase'>('mirror');

  // 3. State for custom simulated "Lever Controls" for Level 3
  const [activeLevers, setActiveLevers] = useState({
    lever1: true, // Positioning
    lever2: false, // Visual Architecture
    lever3: true  // Proof Mapping
  });

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const runMockAudit = () => {
    setIsAuditing(true);
    setAuditComplete(false);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditComplete(true);
    }, 1800);
  };

  // --- Sandbox Simulator States & Logic ---
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [autonomy, setAutonomy] = useState(SCENARIOS[0].baseAutonomy);
  const [constraint, setConstraint] = useState(SCENARIOS[0].baseConstraint);
  const [entropy, setEntropy] = useState(SCENARIOS[0].baseEntropy);

  // Active layers for sandbox
  const [cslActive, setCslActive] = useState(SCENARIOS[0].defaultLayers.csl);
  const [seeActive, setSeeActive] = useState(SCENARIOS[0].defaultLayers.see);
  const [l0Active, setL0Active] = useState(SCENARIOS[0].defaultLayers.l0);

  // Trace logs
  const [logs, setLogs] = useState<string[]>([]);
  const [isTracing, setIsTracing] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // References to scroll targets
  const simulatorRef = useRef<HTMLDivElement>(null);

  const scrollToSimulator = () => {
    if (simulatorRef.current) {
      simulatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Math simulation formulas
  const rawDeviationLoss = Math.max(0, autonomy - constraint);
  const paralysisCost = Math.max(0, constraint - autonomy + (l0Active ? 15 : 0) - (cslActive ? 15 : 0));
  
  // Calculate final dynamic scores
  const rawLiabilityScore = Math.min(100, Math.max(0, 
    rawDeviationLoss * 1.2 + 
    (entropy > 60 ? (entropy - 60) * 0.8 : 0) - 
    (l0Active ? 35 : 0) - 
    (cslActive ? 20 : 0) - 
    (seeActive ? 10 : 0)
  ));

  const finalCompliance = Math.min(100, Math.max(0, 
    100 - rawLiabilityScore + 
    (l0Active ? 20 : 0)
  ));

  const operationalVelocity = Math.min(100, Math.max(0, 
    autonomy - 
    (paralysisCost * 0.7) - 
    (l0Active && constraint > 70 ? 25 : 0)
  ));

  const causalConsistency = Math.min(100, Math.max(0, 
    Math.min(100, 80 + (cslActive ? 20 : -10) - (entropy * 0.2))
  ));

  // Determine system status
  let systemStatus: 'STABLE' | 'LIABILITY_FLARE' | 'PARALYSIS' | 'UNBOUNDED' = 'STABLE';
  let systemStatusColor = 'text-teal-400 bg-teal-500/10 border-teal-500/30';
  let statusReason = 'System is executing within compliant, stable operational boundaries.';

  if (rawLiabilityScore > 55) {
    systemStatus = 'LIABILITY_FLARE';
    systemStatusColor = 'text-rose-500 bg-rose-500/10 border-rose-500/30';
    statusReason = 'CRITICAL RISK EXPOSURE: Probabilistic deviation risk exceeds allowable enterprise liability bounds.';
  } else if (operationalVelocity < 30) {
    systemStatus = 'PARALYSIS';
    systemStatusColor = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    statusReason = 'OPERATIONAL PARALYSIS: Extreme regulatory constraints and layers prevent sovereign agent from executing useful reasoning.';
  } else if (!l0Active && !cslActive && autonomy > 75) {
    systemStatus = 'UNBOUNDED';
    systemStatusColor = 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    statusReason = 'UNBOUNDED BLACK BOX: Agent operates with total reasoning autonomy but lacks L0 guardrails or causal verification.';
  }

  // Handle Scenario Change
  const selectScenario = (sc: Scenario) => {
    setSelectedScenario(sc);
    setAutonomy(sc.baseAutonomy);
    setConstraint(sc.baseConstraint);
    setEntropy(sc.baseEntropy);
    setCslActive(sc.defaultLayers.csl);
    setSeeActive(sc.defaultLayers.see);
    setL0Active(sc.defaultLayers.l0);
    setLogs([
      `[CRITICAL] System initialized for scenario: ${sc.name}`,
      `[INFO] Target environment: ${sc.industry}`,
      `[INFO] Adjust sliders or toggle safe execution framework layers below.`
    ]);
  };

  // Trigger simulated diagnostic log
  const runDiagnostics = () => {
    if (isTracing) return;
    setIsTracing(true);
    setLogs(prev => [...prev, `[INIT] Executing Phase Mirror Diagnostic trace...`]);

    let step = 0;
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      let msg = '';
      
      switch(step) {
        case 0:
          msg = `[${timestamp}] [SYS] Parsing domain topology for ${selectedScenario.name}...`;
          break;
        case 1:
          msg = `[${timestamp}] [CSL] Verifying causal accuracy score. Current consistency at ${causalConsistency.toFixed(0)}%.`;
          if (!cslActive) {
            msg += ` WARNING: Conscious Sovereignty Layer inactive. Probabilistic Black-Box drift detected.`;
          }
          break;
        case 2:
          msg = `[${timestamp}] [SEE] Analyzing linguistic entropy. Threshold: ${entropy}%.`;
          if (entropy > 65 && seeActive) {
            msg += ` NOTICE: Linguistic entropy exceeds safe levels. Triggering proactive pause warning.`;
          } else if (entropy > 65) {
            msg += ` WARNING: Noise is high but Entropy Engine is disabled. Potential hallucinations masked.`;
          }
          break;
        case 3:
          msg = `[${timestamp}] [L0] Checking invariants. Autonomy factor at ${autonomy}%, Constraint bounds at ${constraint}%.`;
          if (autonomy > constraint && !l0Active) {
            msg += ` DANGER: Sovereign action breaches current constraint model. No L0 safety net to force escalation!`;
          } else if (autonomy > constraint && l0Active) {
            msg += ` SUCCESS: Deviating action successfully intercepted and escalated to human operator.`;
          } else {
            msg += ` Compliance checks passed.`;
          }
          break;
        case 4:
          msg = `[${timestamp}] [OUT] Diagnostic complete. Status: ${systemStatus}. Calculated Risk Factor: ${rawLiabilityScore.toFixed(0)}/100, Operational Velocity: ${operationalVelocity.toFixed(0)}%.`;
          break;
        default:
          clearInterval(interval);
          setIsTracing(false);
          return;
      }
      setLogs(prev => [...prev, msg]);
      step++;
    }, 1000);
  };

  const resetSimulator = () => {
    setAutonomy(selectedScenario.baseAutonomy);
    setConstraint(selectedScenario.baseConstraint);
    setEntropy(selectedScenario.baseEntropy);
    setCslActive(selectedScenario.defaultLayers.csl);
    setSeeActive(selectedScenario.defaultLayers.see);
    setL0Active(selectedScenario.defaultLayers.l0);
    setLogs([
      `[INFO] Simulator state successfully rolled back to default conditions for: ${selectedScenario.name}`
    ]);
  };

  // Auto scroll terminal logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Initial setup for logs
  useEffect(() => {
    setLogs([
      `[CRITICAL] Phase Mirror Developer Diagnostic Console Ready.`,
      `[INFO] Select a high-stakes AI deployment scenario to begin risk modeling.`,
      `[INFO] Target environment: ${selectedScenario.industry}`
    ]);
  }, []);

  return (
    <div id="features-view-container" className={`transition-colors duration-300 font-sans ${isDarkMode ? 'text-stone-300 bg-[#070708]' : 'text-stone-850 bg-[#fafafa]'}`}>
      <div className="container mx-auto px-8 max-w-7xl pt-24 pb-32">
        
        {/* ================= SECTION 1: THE HERO ================= */}
        <section id="hero-governance-by-design" className="mb-32 relative text-left">
          {/* Full-width Title Section spanning across the layout width */}
          <div className="space-y-6 mb-16 max-w-none">
            <div className="flex items-center gap-3">
              <span className="h-px w-5 bg-teal-600 dark:bg-[#2dd4bf]"></span>
              <span className="text-xs font-bold tracking-[0.3em] text-teal-600 dark:text-[#2dd4bf] uppercase font-mono">
                BUILD-TIME DIAGNOSTIC ORACLE
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-stone-900 dark:text-stone-100 tracking-tight leading-none">
              Phase Mirror names the <span className="italic font-normal text-stone-500">contradictions</span> in agentic AI before they become <span className="italic font-normal text-stone-500">code/liability.</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <p className="text-base md:text-lg text-stone-500 leading-relaxed font-medium max-w-2xl">
                Phase Mirror is not a runtime firewall or an intrusive wrapper. It is a sovereign, build-time governance oracle. By continuously scanning your code repositories, workflows, and policy manuals, Phase Mirror surfaces systemic divergence, calculates drift indices, and compiles deterministic dissonance reports directly in your commit hooks and CI/CD pipelines.
              </p>
              
              {/* Highlight Note */}
              <div className={`p-4 rounded-xl border flex items-start gap-4 max-w-xl text-left ${
                isDarkMode ? 'bg-[#0f0f12] border-stone-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <Info size={16} className="text-teal-600 dark:text-[#2dd4bf] shrink-0 mt-0.5" />
                <p className="text-xs text-stone-500 font-semibold leading-normal">
                  <strong className={isDarkMode ? 'text-stone-300' : 'text-stone-700'}>Build-Time Boundary Check:</strong> Proactively intercept policy gaps. Avoid the performance penalty and black-box obscurity of runtime-only model scrapers.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={() => {
                    const el = document.getElementById('interactive-auditor');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="px-6 py-3 bg-teal-650 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 group cursor-pointer"
                >
                  Launch Interactive Audit <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById('open-core-boundary');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`px-6 py-3 font-bold text-xs uppercase tracking-wider rounded-lg transition-all border ${
                    isDarkMode 
                      ? 'border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200' 
                      : 'border-stone-300 hover:border-stone-400 text-stone-600 hover:text-stone-800'
                  }`}
                >
                  Explore Core Rules
                </button>
              </div>
            </div>

            {/* Right Abstract Line-Based Diagram Column */}
            <div className="lg:col-span-5 relative">
              <div className={`p-8 rounded-3xl border text-left flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0a0a0c]/80 border-stone-850' : 'bg-white border-stone-200 shadow-xs'
              } min-h-[380px]`}>
                
                {/* Loop Header */}
                <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-850 pb-4 mb-4">
                  <span className="font-mono text-[9px] font-bold tracking-widest text-stone-400 uppercase">
                    SYS.RECURSION.LOOP // Ξ(T)
                  </span>
                  <span className="font-mono text-[9px] text-teal-600 dark:text-[#2dd4bf] font-black uppercase">
                    ONLINE • DECOUPLED
                  </span>
                </div>

                {/* The Interactive SVG Line-Based Loop */}
                <div className="h-48 relative flex items-center justify-center my-4 overflow-hidden">
                  <svg className="w-full h-full max-w-[280px]" viewBox="0 0 200 200">
                    {/* Background paths/grid */}
                    <circle cx="100" cy="100" r="80" fill="none" stroke={isDarkMode ? "#151518" : "#f1f1ee"} strokeWidth="1" />
                    <line x1="100" y1="20" x2="100" y2="180" stroke={isDarkMode ? "#151518" : "#f1f1ee"} strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="20" y1="100" x2="180" y2="100" stroke={isDarkMode ? "#151518" : "#f1f1ee"} strokeWidth="1" strokeDasharray="3 3" />

                    {/* Loop Paths */}
                    <circle 
                      cx="100" 
                      cy="100" 
                      r="65" 
                      fill="none" 
                      stroke={isDarkMode ? "#222" : "#ddd"} 
                      strokeWidth="2" 
                    />
                    
                    {/* Animated Pulse along path */}
                    <motion.circle 
                      cx="100" 
                      cy="100" 
                      r="65" 
                      fill="none" 
                      stroke="url(#tealGradient)" 
                      strokeWidth="4" 
                      strokeDasharray="40 180"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 6, ease: "linear", repeat: Infinity }}
                      style={{ transformOrigin: "100px 100px" }}
                    />

                    {/* Node points on the loop */}
                    {/* Mirror Node */}
                    <circle cx="100" cy="35" r="5" className="fill-teal-600 dark:fill-[#2dd4bf]" />
                    {/* Dissonance Node */}
                    <circle cx="165" cy="100" r="5" className="fill-stone-400 dark:fill-stone-600" />
                    {/* Phase Node */}
                    <circle cx="100" cy="165" r="5" className="fill-amber-600 dark:fill-amber-500" />

                    {/* Gradients */}
                    <defs>
                      <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0d9488" />
                        <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Absolute Labels on nodes */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold tracking-wider text-teal-600 dark:text-[#2dd4bf]">
                    [1] MIRROR
                  </div>
                  <div className="absolute top-24 right-1 text-[10px] font-mono font-bold tracking-wider text-stone-500">
                    [2] DISSONANCE
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold tracking-wider text-amber-500">
                    [3] PHASE
                  </div>
                </div>

                {/* Interactive State Descriptor box inside Hero */}
                <div className={`p-4 rounded-xl border text-xs font-mono ${
                  isDarkMode ? 'bg-[#050507] border-stone-850' : 'bg-stone-50 border-stone-150'
                }`}>
                  <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 mb-1.5 uppercase">
                    <span>Ξ-Operator Snapshot</span>
                    <span className="text-teal-600 dark:text-[#2dd4bf]">COMPLIANT</span>
                  </div>
                  <code className="text-stone-500 block text-[11px] truncate">
                    drift_score: 0.00412 | lambda_m: 0.0435 | L0_lock: true
                  </code>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ================= SECTION 2: THE METHODOLOGY ================= */}
        <section id="methodology-timeline" className="mb-32 scroll-mt-28 border-t border-stone-200 dark:border-stone-900 pt-20">
          <div className="max-w-4xl mb-16 text-left">
            <span className="font-mono text-xs text-teal-600 dark:text-[#2dd4bf] font-bold tracking-widest uppercase mb-4 block">
              OPERATIONAL ALIGNMENT METHODOLOGY
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
              Mirror, Dissonance, Phase
            </h2>
            <p className="text-sm font-semibold text-stone-500 leading-relaxed max-w-2xl mt-3">
              We manage contradiction, not by hoping it disappears, but by converting abstract telemetry into structured architectural realities with explicit owners, metrics, and temporal horizons.
            </p>
          </div>

          {/* Interactive Horizontal Editorial Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Timeline Line (for desktop only) */}
            <div className="hidden md:block absolute top-[44px] left-[5%] right-[5%] h-0.5 bg-stone-200 dark:bg-stone-800/60 z-0"></div>

            {/* Step 1: Mirror */}
            <div 
              onClick={() => setActiveWorkflowStage('mirror')}
              className={`relative z-10 p-8 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                activeWorkflowStage === 'mirror' 
                  ? 'bg-teal-500/[0.02] border-teal-600/60 dark:border-teal-500/50 shadow-xs' 
                  : 'bg-transparent border-stone-200 dark:border-stone-900 hover:border-stone-500'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                  activeWorkflowStage === 'mirror' 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-stone-200 dark:bg-stone-850 text-stone-500'
                }`}>
                  01
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                  REFLECT STATE
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight text-stone-400 dark:text-stone-200">Mirror</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                Reflects current code and corporate claims exactly as they stand, without judgment. Bridges the gap between what you think your policies are doing and the actual logic executing.
              </p>

              {/* Concrete Example Bubble */}
              <div className={`mt-6 p-4 rounded-xl border text-[11px] font-mono leading-relaxed ${
                isDarkMode ? 'bg-[#0a0a0d] border-stone-850' : 'bg-stone-100/50 border-stone-200'
              }`}>
                <span className="font-bold text-teal-600 dark:text-[#2dd4bf] block mb-1.5">// Mirror Discovery:</span>
                "Corporate spec mandates 100% human-vetted review; codebase pipeline auto-approves 10k transfers/hr."
              </div>
            </div>

            {/* Step 2: Dissonance */}
            <div 
              onClick={() => setActiveWorkflowStage('dissonance')}
              className={`relative z-10 p-8 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                activeWorkflowStage === 'dissonance' 
                  ? 'bg-amber-500/[0.02] border-amber-550 dark:border-amber-500/50 shadow-xs' 
                  : 'bg-transparent border-stone-200 dark:border-stone-900 hover:border-stone-500'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                  activeWorkflowStage === 'dissonance' 
                    ? 'bg-amber-500 text-stone-950' 
                    : 'bg-stone-200 dark:bg-stone-850 text-stone-500'
                }`}>
                  02
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                  TRACE CONTRADICTIONS
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight text-stone-400 dark:text-stone-200">Dissonance</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                Isolates and names the structural tensions. Phase Mirror models represent this alignment deficit mathematically so engineers and legal teams can prioritize risk areas.
              </p>

              {/* Concrete Example Bubble */}
              <div className={`mt-6 p-4 rounded-xl border text-[11px] font-mono leading-relaxed ${
                isDarkMode ? 'bg-[#0a0a0d] border-stone-850' : 'bg-stone-100/50 border-stone-200'
              }`}>
                <span className="font-bold text-amber-500 block mb-1.5">// Dissonance Calculation:</span>
                "Tension found inside finance_agent.py. Conflict between: System Integrity (L0 Invariant) vs. Operational Velocity."
              </div>
            </div>

            {/* Step 3: Phase */}
            <div 
              onClick={() => setActiveWorkflowStage('phase')}
              className={`relative z-10 p-8 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                activeWorkflowStage === 'phase' 
                  ? 'bg-blue-500/[0.02] border-blue-550 dark:border-blue-500/50 shadow-xs' 
                  : 'bg-transparent border-stone-200 dark:border-stone-900 hover:border-stone-500'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                  activeWorkflowStage === 'phase' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-stone-200 dark:bg-stone-850 text-stone-500'
                }`}>
                  03
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                  APPLY MITIGATION
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight text-stone-400 dark:text-stone-200">Phase</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                Constructs actionable, human-mediated levers with explicit metrics. Rather than abstract errors, you get a clear checklist of who owns the divergence and till when.
              </p>

              {/* Concrete Example Bubble */}
              <div className={`mt-6 p-4 rounded-xl border text-[11px] font-mono leading-relaxed ${
                isDarkMode ? 'bg-[#0a0a0d] border-stone-850' : 'bg-stone-100/50 border-stone-200'
              }`}>
                <span className="font-bold text-blue-500 block mb-1.5">// Phase Remediation:</span>
                "Remediation: Restrict transaction ceiling to $5,000. Owner: Compliance team. Target: &lt; 2% drift. Horizon: 14 Days."
              </div>
            </div>

          </div>
        </section>

        {/* ================= SECTION 3: THE PRODUCT ================= */}
        <section id="interactive-auditor" className="mb-32 scroll-mt-28 border-t border-stone-200 dark:border-stone-900 pt-20">
          <div className="max-w-4xl mb-16 text-left">
            <span className="font-mono text-xs text-teal-600 dark:text-[#2dd4bf] font-bold tracking-widest uppercase mb-4 block">
              THE PHASE MIRROR ORACLE PIPELINE
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
              A sequence-based look at the operational surface
            </h2>
            <p className="text-sm font-semibold text-stone-500 leading-relaxed max-w-2xl mt-3">
              Watch how our build-time pipeline evaluates codebase layers, analyzes alignment against dynamic rules, and maps mathematical results to immediate PR reports.
            </p>
          </div>

          {/* Core Pipeline Block Sequence representation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
            
            {/* Step 1: Scan (Left Panel - Interactive files selector) */}
            <div className="lg:col-span-4 space-y-4 text-left">
              <span className="text-[9px] font-mono font-bold text-teal-600 dark:text-[#2dd4bf] uppercase tracking-wider block bg-teal-600/5 dark:bg-[#2dd4bf]/5 py-1 px-3 border border-teal-600/20 dark:border-[#2dd4bf]/20 w-fit rounded">
                PIPELINE STEP I: SCAN
              </span>
              <h3 className="text-lg font-bold tracking-tight">Select Repository File Layer</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                To evaluate alignment, Phase Mirror scans multiple independent documents: policy specs, executable code, and human architecture guidelines (ADRs). Select a file below to load it into the audit terminal:
              </p>

              <div id="sim-file-list" className="space-y-2 pt-2">
                {codebaseFiles.map((file, idx) => {
                  const isActive = selectedSimFile === idx;
                  return (
                    <button
                      key={file.name}
                      onClick={() => {
                        setSelectedSimFile(idx);
                        setAuditComplete(false);
                      }}
                      className={`w-full p-3.5 rounded-xl border text-left font-mono text-[11px] flex items-center justify-between transition-all cursor-pointer ${
                        isActive 
                          ? 'border-teal-600/60 dark:border-teal-500/50 bg-teal-600/[0.02] text-teal-600 dark:text-[#2dd4bf] font-bold' 
                          : 'border-stone-200 dark:border-stone-900 bg-transparent text-stone-400 hover:text-stone-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Folder size={14} className="opacity-60" />
                        {file.name}
                      </span>
                      <span className={`text-[9px] uppercase font-bold py-0.5 px-2 rounded ${
                        file.type === 'policy' ? 'bg-indigo-500/10 text-indigo-400' :
                        file.type === 'code' ? 'bg-[#2dd4bf]/10 text-teal-600 dark:text-[#2dd4bf]' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {file.type}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button
                  disabled={isAuditing}
                  onClick={runMockAudit}
                  className={`w-full py-3 rounded-xl font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isAuditing 
                      ? 'bg-stone-800 text-stone-500 border border-stone-850' 
                      : 'bg-teal-650 hover:bg-teal-700 text-white'
                  }`}
                >
                  {isAuditing ? (
                    <>
                      <Cpu size={14} className="animate-spin" />
                      Evaluating L0 Invariants...
                    </>
                  ) : (
                    <>
                      <Zap size={14} className="animate-pulse" />
                      Verify Security Bounds (≤1ms)
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step 2: Evaluate & Report (Right Panel - Styled Terminal Output) */}
            <div className="lg:col-span-8">
              <div className={`p-6 rounded-[2rem] border overflow-hidden text-left relative ${
                isDarkMode ? 'bg-[#0a0a0d] border-stone-850' : 'bg-white border-stone-200 shadow-sm'
              }`}>
                
                {/* Simulated file path metadata */}
                <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-850 pb-3.5 mb-4 text-[10px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600 dark:bg-[#2dd4bf]"></span>
                    <span className="text-stone-400 font-bold">Terminal Spectrometer</span>
                  </div>
                  <span className="text-stone-500">SYSTEM STATE: ACTIVE</span>
                </div>

                {/* Display Loaded File */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest block mb-1">
                      SOURCE FILE // {codebaseFiles[selectedSimFile].name}
                    </span>
                    <pre className={`p-4 rounded-xl border font-mono text-xs leading-relaxed max-h-[140px] overflow-y-auto ${
                      isDarkMode ? 'bg-[#050507] border-stone-900 text-stone-400' : 'bg-stone-50 border-stone-150 text-stone-600'
                    }`}>
                      <code>{codebaseFiles[selectedSimFile].content}</code>
                    </pre>
                  </div>

                  {/* Operational Phase: Evaluate & Report output */}
                  <div className="border-t border-stone-200 dark:border-stone-850 pt-4">
                    <div className="flex justify-between items-center mb-3 text-[9px] font-mono text-stone-500 uppercase font-bold tracking-wider">
                      <span>PIPELINE STEPS II & III // EVALUATE & DETERMINISTIC PR REPORT</span>
                      {auditComplete && <span className="text-emerald-500">EVALUATION IN 0.82ms</span>}
                    </div>

                    <div className={`p-4 rounded-xl border font-mono text-xs ${
                      isDarkMode ? 'bg-[#050507] border-stone-900 text-stone-500' : 'bg-stone-50 border-stone-150 text-stone-600'
                    } min-h-[160px] flex flex-col justify-between`}>
                      
                      {/* Active States inside Terminal */}
                      {isAuditing && (
                        <div className="space-y-3 py-4 text-center">
                          <Cpu size={24} className="mx-auto text-teal-600 dark:text-[#2dd4bf] animate-spin" />
                          <p className="text-xs text-stone-500 animate-pulse">Running static parser and auditing invariants against schema rules...</p>
                        </div>
                      )}

                      {!isAuditing && !auditComplete && (
                        <div className="space-y-2 py-4 text-center text-stone-500 text-xs">
                          <AlertTriangle size={18} className="mx-auto text-stone-500 mb-2" />
                          <p>Waiting for manual verification action...</p>
                        </div>
                      )}

                      {!isAuditing && auditComplete && (
                        <div className="space-y-4">
                          {selectedSimFile === 1 ? (
                            // Code file evaluated: Output Dissonance Alert!
                            <div className="space-y-3">
                              <div className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 font-sans text-xs">
                                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                <div>
                                  <strong className="block font-bold">L0 INVARIANT VIOLATION: PM-002 (Escrow Escapement)</strong>
                                  <p className="text-[11px] leading-relaxed mt-1 text-stone-500 font-semibold">
                                    The module `agent_orchestrator.py` authorizes arbitrary transfers of up to $100,000 without escrow limits. This breaches structural policy rule SEC-AGENT-REF-04 (max: $5,000) and contradicts ADR-012 guidelines.
                                  </p>
                                </div>
                              </div>
                              <div className="p-3 bg-amber-500/5 border border-amber-550/20 rounded-lg text-amber-500 text-[11px] leading-normal font-sans">
                                <strong className="block uppercase tracking-wide text-[10px] font-black font-mono">Dissonance Alignment Proposal:</strong>
                                Apply Phase-Lever 012-A: Force human-check parameters, constrain transfer ceiling to $5,000, and commit ADR cryptographic certificate.
                              </div>
                            </div>
                          ) : (
                            // Policy or ADR evaluated peacefully
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 font-sans text-xs">
                                <ShieldCheck size={16} />
                                <div>
                                  <strong className="block font-bold">PASSED: Structural Rule Blueprint is Valid</strong>
                                  <span className="text-[11px] text-stone-500 font-semibold block mt-1">Found correct schema definitions. No dynamic executable loops within invariant storage block.</span>
                                </div>
                              </div>
                              <code className="text-[10px] text-stone-500 block">
                                output_data: JSON report compiled and signed successfully. MD5_hash: ccba74da166ef098db
                              </code>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Code Snippet representing clean JSON output capability */}
                      <div className="text-[10px] text-stone-600 dark:text-stone-500 pt-3 border-t border-stone-200/50 dark:border-stone-850 flex justify-between items-center bg-transparent mt-3">
                        <span>Report Payload Schema: standard_json_mirror_report</span>
                        <button 
                          onClick={() => handleCopyCode(`{\n  "rule_id": "PM-002",\n  "status": "failed",\n  "divergence": "95k",\n  "owner": "eng"\n}`, "json_term")}
                          className="text-teal-600 dark:text-[#2dd4bf] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedCodeId === 'json_term' ? 'Copied' : <><Copy size={10} /> Copy JSON</>}
                        </button>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ================= SECTION 4: THE OPEN-CORE BOUNDARY ================= */}
        <section id="open-core-boundary" className="mb-32 scroll-mt-28 border-t border-stone-200 dark:border-stone-900 pt-20">
          <div className="max-w-4xl mb-16 text-left">
            <span className="font-mono text-xs text-teal-600 dark:text-[#2dd4bf] font-bold tracking-widest uppercase mb-3 block">
              LICENSING & OPEN SOURCE COMPLIANCE
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
              Useful in the open. Stronger in the network.
            </h2>
            <p className="text-sm font-semibold text-stone-500 leading-relaxed max-w-2xl mt-3">
              We separate structural checking parameters from enterprise-scale risk management. Use our robust CLI independently or bind it with multi-tenant corporate oversight.
            </p>
          </div>

          {/* High-fidelity Comparison Table */}
          <div className={`overflow-hidden border rounded-3xl ${
            isDarkMode ? 'bg-[#09090b] border-stone-850' : 'bg-white border-stone-200 shadow-xs'
          }`}>
            <div className="overflow-x-auto text-xs md:text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b ${
                    isDarkMode ? 'border-stone-850 bg-[#0d0d10]' : 'border-stone-150 bg-stone-50/50'
                  }`}>
                    <th className="p-6 font-bold uppercase tracking-wider text-xs w-1/3 text-stone-400">Features Matrix</th>
                    <th className="p-6 font-bold uppercase tracking-wider text-xs w-1/3 text-emerald-500 font-mono">Community (Apache 2.0)</th>
                    <th className="p-6 font-bold uppercase tracking-wider text-xs w-1/3 text-teal-600 dark:text-[#2dd4bf] font-mono">Enterprise Suite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/50 dark:divide-stone-850/60">
                  {[
                    {
                      feat: "Core Rules Engine",
                      com: "Core rules mapping (MD-001 through MD-005)",
                      ent: "Custom calibration matrices and dynamic compliance schemas"
                    },
                    {
                      feat: "Report Delivery",
                      com: "Self-hosted CLI reports, raw format",
                      ent: "Cross-organization False Positive Calibration (The Moat)"
                    },
                    {
                      feat: "Target Standards",
                      com: "Local Git repository and manual hooks",
                      ent: "Deep automated mappings for SOC2, HIPAA, EU AI Act"
                    },
                    {
                      feat: "Integration Model",
                      com: "Single developer CLI executions",
                      ent: "Full multi-team API pipeline mapping & Webhooks alerts"
                    }
                  ].map((row, idx) => (
                    <tr 
                      key={idx} 
                      className={`transition-colors font-medium text-stone-500 ${
                        isDarkMode ? 'hover:bg-stone-900/10' : 'hover:bg-stone-50/50'
                      }`}
                    >
                      <td className="p-6 font-bold text-stone-900 dark:text-stone-300">
                        {row.feat}
                      </td>
                      <td className="p-6">
                        {row.com}
                      </td>
                      <td className="p-6 text-teal-600 dark:text-[#2dd4bf]">
                        {row.ent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ================= SECTION 5: PROOF ================= */}
        <section id="proof-artifacts" className="mb-32 border-t border-stone-200 dark:border-stone-900 pt-20">
          <div className="max-w-4xl mb-16 text-left">
            <span className="font-mono text-xs text-rose-500 font-bold tracking-widest uppercase mb-4 block animate-pulse">
              FIDUCIARY EVIDENCE SHEETS
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
              Artifacts Over Testimonials
            </h2>
            <p className="text-sm font-semibold text-stone-500 leading-relaxed max-w-2xl mt-3">
              We do not present glossy marketing cards. We display actual mathematical evidence, real ADR bindings, and direct corporate alignment artifacts.
            </p>
          </div>

          {/* Real Artifact Evidence Cards / Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-12">
            
            {/* Artifact Pane 1: Real Dissonance Report */}
            <div className={`p-8 rounded-[2rem] border relative overflow-hidden flex flex-col justify-between ${
              isDarkMode ? 'bg-[#09090b] border-stone-850' : 'bg-white border-stone-200 shadow-xs'
            }`}>
              <div>
                <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-850 pb-4 mb-6">
                  <span className="font-mono text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                    SPEC // EVIDENCE REF #PM-SOC2-L0
                  </span>
                  <span className="text-[9px] uppercase font-mono font-bold text-teal-600 dark:text-[#2dd4bf]">
                    AUTHENTICATED
                  </span>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wide">SOC2 Compliance Invariant Lock</h4>
                  <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                    This specification chronicles how real-time system executions mapped back to verified human-backed policy agreements, providing signed cryptographic proofs for audit logs.
                  </p>
                  
                  {/* Real code structure */}
                  <div className={`p-4 rounded-xl border mt-3 font-mono text-[11px] leading-relaxed overflow-x-auto ${
                    isDarkMode ? 'bg-[#040405] border-stone-900 text-stone-400' : 'bg-stone-50 border-stone-150 text-stone-600'
                  }`}>
                    <code>{`{\n  "invariant": "max_withdrawal_auth <= 100000",\n  "audit_trail": "verified_by_hash_fd98ac",\n  "human_signer": "v_governor_sig",\n  "compliance_verified": true\n}`}</code>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-stone-200 dark:border-stone-850 flex justify-between items-center text-[10px] font-mono text-stone-500">
                <span>AUDIT_TRUST VALUE_METRIC: 100%</span>
                <span>SOC2 SECTION III ACCESS</span>
              </div>
            </div>

            {/* Artifact Pane 2: Policy Integration Memos */}
            <div className={`p-8 rounded-[2rem] border relative overflow-hidden flex flex-col justify-between ${
              isDarkMode ? 'bg-[#09090b] border-stone-850' : 'bg-white border-stone-200 shadow-xs'
            }`}>
              <div>
                <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-850 pb-4 mb-6">
                  <span className="font-mono text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                    MEMO // EVIDENCE REF #EU-AI-ACT
                  </span>
                  <span className="text-[9px] uppercase font-mono font-bold text-amber-500">
                    ADVISORY BINDING
                  </span>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wide">EU AI Act General Sovereignty Memo</h4>
                  <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                    A formalized advisory mapping showing how Phase Mirror's build-time check prevents systemic failures and non-compliant model iterations from breaching legal rules.
                  </p>
                  
                  <div className={`p-4 rounded-xl border mt-3 font-mono text-[11px] leading-relaxed overflow-x-auto ${
                    isDarkMode ? 'bg-[#040405] border-stone-900 text-stone-400' : 'bg-stone-50 border-stone-150 text-stone-650'
                  }`}>
                    <code>{`MANDATE-041: Agentic models must deploy behind mathematical sandboxes. Structural checking tools are required to parse executable blocks during continuous deployment.`}</code>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-stone-200 dark:border-stone-850 flex justify-between items-center text-[10px] font-mono text-stone-500">
                <span>REGULATORY ACCURACY RATE: 99.8%</span>
                <span>AI LIABILITY COVERAGE LOCK</span>
              </div>
            </div>

          </div>

          {/* Industry Impact Stat Callout */}
          <div className={`p-10 rounded-[2.5rem] border text-left ${
            isDarkMode ? 'bg-red-950/10 border-red-900/30' : 'bg-rose-50/10 border-rose-100'
          }`}>
            <div className="max-w-3xl">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-rose-500 block mb-2">
                THE AI LIABILTY DECOUPLING GAP
              </span>
              <h3 className="text-xl md:text-2xl font-serif text-stone-900 dark:text-stone-200 tracking-tight leading-none mb-4">
                Did you know? <span className="text-rose-500 font-extrabold">78% of enterprises</span> currently operate active AI models with zero defined corporate compliance rails.
              </h3>
              <p className="text-xs md:text-sm text-stone-500 leading-relaxed font-semibold">
                This isn't just an oversight—it is a massive fiduciary vulnerability. Phase Mirror intercepts this vulnerability at compile time, ensuring code matches policies before it touches live runtime environments.
              </p>
            </div>
          </div>
        </section>

        {/* ================= SECTION 6: THE LEVERS (IMPLEMENTATION STRATEGY) ================= */}
        <section id="implementation-levers" className="mb-24 border-t border-stone-200 dark:border-stone-900 pt-20">
          <div className="max-w-4xl mb-12 text-left">
            <span className="font-mono text-xs text-teal-600 dark:text-[#2dd4bf] font-bold tracking-widest uppercase mb-4 block">
              SYSTEMIC BRAND ALIGNMENT
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
              Corporate Governance Levers
            </h2>
            <p className="text-sm font-semibold text-stone-500 leading-relaxed max-w-2xl mt-3">
              To guarantee that the design and alignment teams operate with strict consensus, the following active corporate levers are continually verified:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              {
                id: "lever1",
                num: "LEVER 1",
                title: "Build-Time Positioning",
                desc: "Founder and stakeholders sign off that the governance terminates strictly at build-time compiling rather than runtime firewall overrides.",
                status_label: "Active Binding"
              },
              {
                id: "lever2",
                num: "LEVER 2",
                title: "Visual Invariance",
                desc: "Design specifications enforce zero generic purple-gradient patterns and 100% left-aligned architecture to project forensic modernism.",
                status_label: "Fully Enforced"
              },
              {
                id: "lever3",
                num: "LEVER 3",
                title: "Proof Mapping",
                desc: "Every core marketing and technical claim must link to an authenticated evidence sheet (SOC2, SLA, or custom PDF spec mapping).",
                status_label: "Active Logging"
              }
            ].map((lever, i) => {
              const isChecked = (activeLevers as any)[lever.id];
              return (
                <div 
                  key={lever.id}
                  onClick={() => {
                    const lId = lever.id as 'lever1' | 'lever2' | 'lever3';
                    setActiveLevers(prev => ({ ...prev, [lId]: !prev[lId] }));
                  }}
                  className={`p-6 rounded-2xl border cursor-pointer select-none transition-all duration-305 flex flex-col justify-between ${
                    isChecked 
                      ? 'bg-teal-600/[0.02] border-teal-600/40 dark:border-teal-500/40 text-stone-900 dark:text-stone-100' 
                      : 'bg-transparent border-stone-200 dark:border-stone-900 text-stone-500'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-mono text-[10.5px] font-black text-teal-600 dark:text-[#2dd4bf]">
                        {lever.num}
                      </span>
                      <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-teal-600 border-teal-600 text-white' : 'border-stone-400 dark:border-stone-850 bg-transparent'
                      }`}>
                        {isChecked && <Check size={10} />}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold tracking-tight mb-2">{lever.title}</h4>
                    <p className="text-[11px] text-stone-500 leading-relaxed font-semibold">{lever.desc}</p>
                  </div>

                  <div className="mt-6 pt-3.5 border-t dark:border-stone-850 border-stone-200/50 flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-stone-400">
                    <span>STATUS: {lever.status_label}</span>
                    <span className={isChecked ? 'text-teal-600 dark:text-[#2dd4bf] font-bold' : 'text-stone-500'}>
                      {isChecked ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= SECTION 7: PHASE MIRROR INTEGRATED SIMULATOR LAB ================= */}
        <section ref={simulatorRef} className={`py-20 border-t border-b scroll-mt-24 rounded-3xl p-8 mb-24 ${isDarkMode ? 'bg-black border-stone-900/40' : 'bg-stone-50 border-stone-150'}`}>
          <div className="container mx-auto max-w-7xl">
            
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#2dd4bf] block mb-3">INTEGRATION LAB</span>
              <h2 className={`text-3xl md:text-5xl font-extrabold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-stone-950'}`}>
                Phase Mirror Core Sandbox Workspace
              </h2>
              <p className="text-base text-stone-500 leading-relaxed font-medium">
                Interact directly with risk limits, safety budget ceilings, and linguistic noise levels below. Choose a diagnostic scenario to benchmark containment operations under critical loads.
              </p>
            </div>

            {/* Scenario Option List */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 mb-4">Select Deployment Topology</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {SCENARIOS.map((sc) => {
                  const isActive = selectedScenario.id === sc.id;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => selectScenario(sc)}
                      className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isActive 
                          ? 'border-[#2dd4bf] bg-[#2dd4bf]/5 ring-1 ring-[#2dd4bf]/30 shadow-sm' 
                          : (isDarkMode ? 'bg-zinc-950 border-stone-900 hover:border-stone-800' : 'bg-white border-stone-200 hover:border-stone-300')
                      }`}
                    >
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#2dd4bf] mb-1.5">{sc.industry}</p>
                      <h4 className={`font-bold text-xs mb-1 ${isActive ? (isDarkMode ? 'text-white' : 'text-stone-950') : ''}`}>{sc.name}</h4>
                      <p className="text-[11px] text-stone-500 leading-normal line-clamp-2">{sc.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sandbox Controls and Live Terminal (12 Cols layout matching specs) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Sliders (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Sliders Box */}
                <div className={`p-8 rounded-[2rem] border ${isDarkMode ? 'bg-zinc-950/60 border-stone-900' : 'bg-white border-stone-150 shadow-sm'}`}>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal size={16} className="text-[#2dd4bf]" />
                      <h4 className="font-extrabold text-sm tracking-tight uppercase">Trace Variable Tuning</h4>
                    </div>
                    <button 
                      onClick={resetSimulator}
                      className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 hover:text-[#2dd4bf] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw size={10} /> Reset Defaults
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Slider 1: Autonomy level */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="flex items-center gap-1.5 uppercase tracking-wider">
                          1. Reasoning Autonomy
                        </span>
                        <span className="font-mono text-[#2dd4bf]">{autonomy}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={autonomy}
                        onChange={(e) => setAutonomy(Number(e.target.value))}
                        className="w-full accent-[#2dd4bf] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-stone-500 font-bold uppercase tracking-widest mt-1">
                        <span>Low Risk / Compliant</span>
                        <span>Generative Freedom</span>
                      </div>
                    </div>

                    {/* Slider 2: Constraint Severity */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="flex items-center gap-1.5 uppercase tracking-wider">
                          2. Bounded Restriction Value
                        </span>
                        <span className="font-mono text-teal-400">{constraint}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={constraint}
                        onChange={(e) => setConstraint(Number(e.target.value))}
                        className="w-full accent-[#2dd4bf] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-stone-500 font-bold uppercase tracking-widest mt-1">
                        <span>Permissive Scope</span>
                        <span>Strict Operational Lock</span>
                      </div>
                    </div>

                    {/* Slider 3: Semantic Entropy threshold */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="flex items-center gap-1.5 uppercase tracking-wider">
                          3. Linguistic Noise Engine
                        </span>
                        <span className="font-mono text-amber-500">{entropy}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max="100" 
                        value={entropy}
                        onChange={(e) => setEntropy(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-stone-500 font-bold uppercase tracking-widest mt-1">
                        <span>Coherent Logic Stream</span>
                        <span>High Entropy Hallucinations</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Core Verification Alignment Layers toggles */}
                <div className={`p-8 rounded-[2rem] border ${isDarkMode ? 'bg-zinc-950/60 border-stone-900' : 'bg-white border-stone-150 shadow-sm'}`}>
                  <h4 className="font-extrabold text-xs tracking-wider uppercase text-stone-400 mb-6 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#2dd4bf]" /> Active Platform Integration Core Shields
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Layer 1 toggle */}
                    <button 
                      onClick={() => setCslActive(!cslActive)}
                      className={`p-4 rounded-xl border text-left transition-all h-32 flex flex-col justify-between cursor-pointer ${
                        cslActive 
                          ? 'border-[#2dd4bf] bg-[#2dd4bf]/5' 
                          : (isDarkMode ? 'bg-zinc-900/10 border-stone-900 hover:border-[#2dd4bf]/40' : 'bg-stone-100/50 border-stone-200 hover:border-stone-300')
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[9px] font-mono font-bold text-stone-500">SPEC_01 //</span>
                        <span className={`w-2 h-2 rounded-full ${cslActive ? 'bg-[#2dd4bf] animate-pulse' : 'bg-stone-600'}`}></span>
                      </div>
                      <div>
                        <h5 className="font-bold text-xs uppercase tracking-tight">Conscious Sovereignty</h5>
                        <p className="text-[10px] text-stone-500 leading-relaxed font-semibold mt-1">Locks absolute causal verifications on loops.</p>
                      </div>
                    </button>

                    {/* Layer 2 toggle */}
                    <button 
                      onClick={() => setSeeActive(!seeActive)}
                      className={`p-4 rounded-xl border text-left transition-all h-32 flex flex-col justify-between cursor-pointer ${
                        seeActive 
                          ? 'border-[#2dd4bf] bg-[#2dd4bf]/5' 
                          : (isDarkMode ? 'bg-zinc-900/10 border-stone-900 hover:border-[#2dd4bf]/40' : 'bg-stone-100/50 border-stone-200 hover:border-stone-300')
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[9px] font-mono font-bold text-stone-500">SPEC_02 //</span>
                        <span className={`w-2 h-2 rounded-full ${seeActive ? 'bg-[#2dd4bf] animate-pulse' : 'bg-stone-600'}`}></span>
                      </div>
                      <div>
                        <h5 className="font-bold text-xs uppercase tracking-tight">Semantic Entropy</h5>
                        <p className="text-[10px] text-stone-500 leading-relaxed font-semibold mt-1">Proactively detects hallucination and drift.</p>
                      </div>
                    </button>

                    {/* Layer 3 toggle */}
                    <button 
                      onClick={() => setL0Active(!l0Active)}
                      className={`p-4 rounded-xl border text-left transition-all h-32 flex flex-col justify-between cursor-pointer ${
                        l0Active 
                          ? 'border-[#2dd4bf] bg-[#2dd4bf]/5' 
                          : (isDarkMode ? 'bg-zinc-900/10 border-stone-900 hover:border-[#2dd4bf]/40' : 'bg-stone-100/50 border-stone-200 hover:border-stone-300')
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[9px] font-mono font-bold text-stone-500">SPEC_03 //</span>
                        <span className={`w-2 h-2 rounded-full ${l0Active ? 'bg-[#2dd4bf] animate-pulse' : 'bg-stone-600'}`}></span>
                      </div>
                      <div>
                        <h5 className="font-bold text-xs uppercase tracking-tight">L0 Compliance Keys</h5>
                        <p className="text-[10px] text-stone-500 leading-relaxed font-semibold mt-1">Triggers auto human escalations on bounds.</p>
                      </div>
                    </button>

                  </div>
                </div>

              </div>

              {/* Right Diagnostic metrics / Terminal output (5 Cols) */}
              <div className="lg:col-span-12 xl:col-span-5 space-y-6 lg:order-last xl:-mt-0 lg:col-start-1 lg:max-w-none">
                
                {/* Dynamic Telemetry Metric Output Screen */}
                <div className={`p-8 rounded-[2rem] border ${isDarkMode ? 'bg-zinc-950/60 border-stone-900' : 'bg-white border-stone-150 shadow-sm'}`}>
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 mb-6 font-mono">Real-Time State Telemetry</h4>
                  
                  {/* Active Dynamic State Indicator Banner */}
                  <div className={`mb-6 p-4 border rounded-xl transition-all flex items-start gap-3 ${systemStatusColor}`}>
                    <Activity size={16} className="animate-pulse shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-xs uppercase tracking-widest">{systemStatus.replace('_', ' ')}</h5>
                      <p className="text-[11px] leading-relaxed font-semibold mt-1 opacity-90">{statusReason}</p>
                    </div>
                  </div>

                  {/* Simulated live telemetry metrics sliders display */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider mb-1">
                        <span>Enterprise liability score</span>
                        <span className={rawLiabilityScore > 50 ? 'text-rose-500' : 'text-teal-400'}>{rawLiabilityScore.toFixed(0)}/100</span>
                      </div>
                      <div className="w-full bg-stone-800/10 dark:bg-stone-800/40 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-350 ${rawLiabilityScore > 55 ? 'bg-rose-500' : rawLiabilityScore > 35 ? 'bg-amber-500' : 'bg-teal-500'}`} 
                          style={{ width: `${rawLiabilityScore}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider mb-1">
                        <span>Operational execution velocity</span>
                        <span className="text-[#2dd4bf]">{operationalVelocity.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-stone-800/10 dark:bg-stone-800/40 rounded-full h-1.5">
                        <div 
                          className="bg-[#2dd4bf] h-1.5 rounded-full transition-all duration-350" 
                          style={{ width: `${operationalVelocity}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider mb-1">
                        <span>Causal Consistency Accuracy</span>
                        <span className="text-teal-400">{causalConsistency.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-stone-800/10 dark:bg-stone-800/40 rounded-full h-1.5">
                        <div 
                          className="bg-teal-400 h-1.5 rounded-full transition-all duration-350" 
                          style={{ width: `${causalConsistency}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic Run Trigger Actuator */}
                  <button 
                    onClick={runDiagnostics}
                    disabled={isTracing}
                    className="w-full py-4 bg-[#2dd4bf] text-black hover:bg-[#2dd4bf]/90 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(45,212,191,0.15)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isTracing ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} /> Tracking Diagnostics...
                      </>
                    ) : (
                      <>
                        <Play size={14} fill="currentColor" /> Run Diagnostics Trace
                      </>
                    )}
                  </button>
                </div>

                {/* Console Diagnostic Audit Logs Screen */}
                <div className="p-6 rounded-[1.5rem] bg-[#030303] border border-stone-900 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-800/40">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2dd4bf] flex items-center gap-2">
                        <Terminal size={12} /> Telemetry Trace Output
                      </span>
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500/80"></span>
                        <span className="w-2 h-2 rounded-full bg-amber-500/80"></span>
                        <span className="w-2 h-2 rounded-full bg-[#2dd4bf]/80"></span>
                      </div>
                    </div>

                    <div 
                      ref={logContainerRef}
                      className="font-mono text-[11px] text-stone-400 space-y-2 h-[120px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800"
                    >
                      {logs.map((log, i) => {
                        let color = 'text-stone-400';
                        if (log.includes('[CRITICAL]')) color = 'text-[#2dd4bf] font-bold';
                        if (log.includes('[INIT]')) color = 'text-teal-400 font-bold';
                        if (log.includes('[DANGER]')) color = 'text-rose-450 font-semibold';
                        if (log.includes('WARNING:')) color = 'text-amber-400';
                        if (log.includes('SUCCESS:')) color = 'text-[#2dd4bf]';
                        return (
                          <p key={i} className={`${color} leading-relaxed`}>
                            {log}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ================= SECTION 8: ENTERPRISE DEPLOYMENT OPTIONS / LICENSING ================= */}
        <section className={`py-20 rounded-3xl p-8 mb-24 border ${isDarkMode ? 'bg-[#0a0a0c] border-stone-900/60' : 'bg-white shadow-sm border-stone-150'}`}>
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-stone-500 block mb-3">Enterprise Deployment Options</span>
            <h2 className={`text-3xl md:text-5xl font-bold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-stone-950'}`}>
              Production-Isolated Licensing
            </h2>
            <p className="text-base text-stone-500 leading-relaxed font-semibold">
              Select the appropriate deployment tier matching your contract depth requirements and service level limits.
            </p>
          </div>

          {/* Pricing Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Plan 1: Community */}
            <div className={`p-6 rounded-[2rem] border flex flex-col justify-between ${isDarkMode ? 'bg-zinc-950/40 border-stone-900' : 'bg-white border-stone-200 shadow-sm'}`}>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-wide">Community</h4>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-3xl font-extrabold font-mono ${isDarkMode ? 'text-white' : 'text-stone-950'}`}>$0</span>
                    <span className="text-stone-500 text-xs font-semibold">Free Forever</span>
                  </div>
                </div>
                
                <div className="space-y-2 border-t border-b border-stone-800/10 py-4 text-[11px] font-mono leading-relaxed text-stone-500 uppercase">
                  <div>Enforcement: <span className="text-stone-400 font-bold block">Local Sandbox Enforce</span></div>
                  <div>Audit Trails: <span className="text-stone-400 font-bold block">Local Console Only</span></div>
                  <div>Isolation: <span className="text-stone-400 font-bold block">Shared Work Containers</span></div>
                  <div>SLA Limit: <span className="text-stone-400 font-bold block">Community Support</span></div>
                </div>

                <ul className="space-y-2.5 text-xs text-stone-500 font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf] font-bold">✓</span> Single User Diagnostic sandbox
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf] font-bold">✓</span> Offline tension parsing graphs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf] font-bold">✓</span> Standard JSON Schema contracts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf] font-bold">✓</span> Local client status monitoring
                  </li>
                </ul>
              </div>
              
              <button 
                onClick={scrollToSimulator}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center mt-6 transition-colors cursor-pointer border ${isDarkMode ? 'border-stone-800 text-stone-300 hover:bg-stone-900/30' : 'border-stone-200 text-stone-700 hover:bg-stone-100'}`}
              >
                Start Sandbox
              </button>
            </div>

            {/* Plan 2: Team */}
            <div className={`p-6 rounded-[2rem] border flex flex-col justify-between ${isDarkMode ? 'bg-zinc-950/40 border-stone-900' : 'bg-white border-stone-200 shadow-sm'}`}>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-wide">Team</h4>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-3xl font-extrabold font-mono ${isDarkMode ? 'text-white' : 'text-stone-950'}`}>$45</span>
                    <span className="text-stone-500 text-xs font-semibold">Per User / Month</span>
                  </div>
                </div>
                
                <div className="space-y-2 border-t border-b border-stone-800/10 py-4 text-[11px] font-mono leading-relaxed text-stone-500 uppercase">
                  <div>Enforcement: <span className="text-stone-400 font-bold block">Federated Enforce Group</span></div>
                  <div>Audit Trails: <span className="text-stone-400 font-bold block">S3 Sync Archive Log</span></div>
                  <div>Isolation: <span className="text-stone-400 font-bold block">Protected Namespace</span></div>
                  <div>SLA Limit: <span className="text-stone-400 font-bold block">24 Hour Reaction Time</span></div>
                </div>

                <ul className="space-y-2.5 text-xs text-stone-500 font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf] font-bold">✓</span> Shared policy sets & workspace
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf] font-bold">✓</span> Automated S3 audit trails logs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf] font-bold">✓</span> Up to 3 distinct active agents
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf] font-bold">✓</span> Slack & Email alert gateways
                  </li>
                </ul>
              </div>
              
              <button 
                onClick={() => alert("Enterprise licensing billing engine active. Please schedule team deployment details via our support channel.")}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center mt-6 transition-colors cursor-pointer border ${isDarkMode ? 'border-stone-800 text-stone-300 hover:bg-stone-900/30' : 'border-stone-200 text-stone-700 hover:bg-stone-100'}`}
              >
                Provision Cluster
              </button>
            </div>

            {/* Plan 3: Business */}
            <div className="p-6 rounded-[2rem] border border-[#2dd4bf] bg-[#2dd4bf]/[0.02] shadow-[0_0_20px_rgba(45,212,191,0.05)] flex flex-col justify-between relative">
              <span className="absolute -top-3 right-4 bg-[#2dd4bf] text-black text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider">
                MOST POPULAR
              </span>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold uppercase text-[#2dd4bf] tracking-wide">Business</h4>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-3xl font-extrabold font-mono ${isDarkMode ? 'text-white' : 'text-stone-950'}`}>$180</span>
                    <span className="text-stone-500 text-xs font-semibold">Per User / Month</span>
                  </div>
                </div>
                
                <div className="space-y-2 border-t border-b border-stone-850 py-4 text-[11px] font-mono leading-relaxed text-stone-500 uppercase">
                  <div>Enforcement: <span className="text-stone-400 font-bold block">Org-wide Control Chain</span></div>
                  <div>Audit Trails: <span className="text-stone-400 font-bold block">Signed JWT Secure Sync</span></div>
                  <div>Isolation: <span className="text-stone-400 font-bold block">Dedicated VPC Space</span></div>
                  <div>SLA Limit: <span className="text-stone-400 font-bold block">4 Hour SLA Guarantee</span></div>
                </div>

                <ul className="space-y-2.5 text-xs text-stone-300 font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf] font-bold">✓</span> Enterprise policy matrices
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf] font-bold">✓</span> Signed cryptographic audit logs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf] font-bold">✓</span> No threshold limit of agents
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf] font-bold">✓</span> Real-time PagerDuty triggers
                  </li>
                </ul>
              </div>
              
              <button 
                onClick={() => alert("Contacting secure provisioning gateways. Enterprise setup handles VPC isolations manually. Expected turnaround: under 1 hour.")}
                className="w-full py-3 bg-[#2dd4bf] text-black rounded-xl font-bold text-xs uppercase tracking-wider text-center mt-6 hover:brightness-110 transition-all cursor-pointer"
              >
                Get Corporate Safe
              </button>
            </div>

            {/* Plan 4: Enterprise */}
            <div className={`p-6 rounded-[2rem] border flex flex-col justify-between ${isDarkMode ? 'bg-zinc-950/40 border-stone-900' : 'bg-white border-stone-200 shadow-sm'}`}>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-wide">Enterprise</h4>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-3xl font-extrabold font-mono ${isDarkMode ? 'text-white' : 'text-stone-950'}`}>Custom</span>
                    <span className="text-stone-500 text-xs font-semibold">Tailored Quotation</span>
                  </div>
                </div>
                
                <div className="space-y-2 border-t border-b border-stone-800/10 py-4 text-[11px] font-mono leading-relaxed text-stone-500 uppercase">
                  <div>Enforcement: <span className="text-stone-400 font-bold block">Total Physics Air-gap</span></div>
                  <div>Audit Trails: <span className="text-stone-400 font-bold block">On-prem HSM Bound Crypt</span></div>
                  <div>Isolation: <span className="text-stone-400 font-bold block">Fully Isolated Appliance</span></div>
                  <div>SLA Limit: <span className="text-stone-400 font-bold block">Under 15 Min SLA Veto</span></div>
                </div>

                <ul className="space-y-2.5 text-xs text-stone-500 font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf] font-bold">✓</span> Air-gapped deployment space
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf] font-bold">✓</span> HSM machine cryptographic audits
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf] font-bold">✓</span> Custom compliance dashboard integrations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#2dd4bf] font-bold">✓</span> Direct core engineer support SLA
                  </li>
                </ul>
              </div>
              
              <button 
                onClick={() => alert("Routing secure message thread to on-prem deployment architects. Expected callback: under 15 minutes.")}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center mt-6 transition-colors cursor-pointer border ${isDarkMode ? 'border-stone-800 text-stone-300 hover:bg-stone-900/30' : 'border-stone-200 text-stone-700 hover:bg-stone-100'}`}
              >
                Contact Architecture
              </button>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

export default FeaturesView;
