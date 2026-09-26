import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Terminal, 
  RotateCcw, 
  Play, 
  ArrowRight, 
  Info, 
  Lock, 
  Unlock, 
  Pause, 
  FileText, 
  RefreshCw, 
  SlidersHorizontal,
  Home,
  ChevronRight,
  Sparkles,
  Layers,
  Check,
  Zap,
  HelpCircle,
  HelpCircle as QuestionIcon,
  Download
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

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

interface DemoAppProps {
  onNavigate: (view: any) => void;
  theme: 'light' | 'dark' | 'dim';
  setTheme: (theme: 'light' | 'dark' | 'dim') => void;
}

export const DemoApp: React.FC<DemoAppProps> = ({ onNavigate, theme, setTheme }) => {
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

  // Stepper loop sequence
  const [activeStep, setActiveStep] = useState(0);

  // Keep track of the last 10 simulation steps for Enterprise Liability Score
  const [liabilityHistory, setLiabilityHistory] = useState<Array<{ step: number, score: number }>>(() => {
    // Seed with 10 initial logical values relative to starting conditions
    const initialScore = 42;
    return Array.from({ length: 10 }, (_, i) => ({
      step: i + 1,
      score: Math.max(10, Math.min(95, initialScore + Math.round(Math.sin(i * 0.8) * 12 + (i % 3 === 0 ? 5 : -4))))
    }));
  });

  // References to scroll targets
  const simulatorRef = useRef<HTMLDivElement>(null);
  const criticalPathRef = useRef<HTMLDivElement>(null);

  const scrollToSimulator = () => {
    if (simulatorRef.current) {
      simulatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToCriticalPath = () => {
    if (criticalPathRef.current) {
      criticalPathRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const downloadSimulationJSON = () => {
    const finalComplianceValue = Math.min(100, Math.max(0, 
      100 - rawLiabilityScore + 
      (l0Active ? 20 : 0)
    ));

    const dataToExport = {
      timestamp: new Date().toISOString(),
      scenario: {
        id: selectedScenario.id,
        name: selectedScenario.name,
        industry: selectedScenario.industry,
        description: selectedScenario.description
      },
      inputs: {
        autonomyLevel: autonomy,
        regulatoryConstraint: constraint,
        semanticEntropy: entropy,
        consciousSovereigntyLayer: cslActive,
        entropyEngine: seeActive,
        l0ComplianceKeys: l0Active
      },
      metrics: {
        enterpriseLiabilityScore: Math.round(rawLiabilityScore),
        operationalExecutionVelocity: Math.round(operationalVelocity),
        causalConsistencyAccuracy: Math.round(causalConsistency),
        finalCompliance: Math.round(finalComplianceValue)
      },
      systemStatus: {
        state: systemStatus,
        reason: statusReason
      },
      telemetryHistory: liabilityHistory.map(item => ({
        step: item.step,
        liabilityScore: item.score
      })),
      logs: logs
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `phase_mirror_simulation_${selectedScenario.id}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    setLiabilityHistory(prev => {
      const roundedScore = Math.round(rawLiabilityScore);
      const lastItem = prev[prev.length - 1];
      if (lastItem && lastItem.score === roundedScore) {
        return prev;
      }
      const nextStep = (lastItem ? lastItem.step : 0) + 1;
      const updated = [...prev, { step: nextStep, score: roundedScore }];
      if (updated.length > 10) {
        return updated.slice(updated.length - 10);
      }
      return updated;
    });
  }, [rawLiabilityScore]);

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

  // Initial setup
  useEffect(() => {
    setLogs([
      `[CRITICAL] Phase Mirror Developer Diagnostic Console Ready.`,
      `[INFO] Select a high-stakes AI deployment scenario to begin risk modeling.`,
      `[INFO] Target environment: ${selectedScenario.industry}`
    ]);
  }, []);

  // Stepper Sequence Steps data
  const steps = [
    {
      label: 'Stage 01: Extract',
      title: 'Extract',
      summary: 'Surface design limits and implicit fears.',
      details: 'Formulates baseline requirements through structured agent interviews and legacy telemetry audit parses. Maps system parameters to highlight operational risks early.',
      artifact: 'PM_Divergence_Draft.json',
      coefficient: 'Safeguard Coverage Ratio',
      value: '89.4%'
    },
    {
      label: 'Stage 02: Map Tensions',
      title: 'Map Tensions',
      summary: 'Analyze dialectical clashing zones.',
      details: 'Deconstructs internal friction points between autonomous model optimization and rigid corporate bounding limits. Formulates potential bypass maps.',
      artifact: 'PM_Tension_Map.json',
      coefficient: 'Divergence Overlap Ratio',
      value: '42.1%'
    },
    {
      label: 'Stage 03: Rank Tensions',
      title: 'Rank Tensions',
      summary: 'Prioritize using impact / tractability indices.',
      details: 'Filters operational risks through enterprise loss matrices. Selects high-exposure decision points (such as live-execution financial bounds) for immediate code lockdown.',
      artifact: 'PM_Risk_Matrix.json',
      coefficient: 'Criticality Priority Factor',
      value: '0.85/1.00'
    },
    {
      label: 'Stage 04: Produce Levers',
      title: 'Produce Levers',
      summary: 'Configure actual metrics parameters.',
      details: 'Generates specific telemetry bounds, structured validator response payloads, and active context tracking anchors implemented as hard code constraints.',
      artifact: 'PM_Levers_Config.json',
      coefficient: 'Telemetry Precision Ratio',
      value: '99.5%'
    },
    {
      label: 'Stage 05: Bind Governance',
      title: 'Bind Governance',
      summary: 'Lock-in specification contracts and alerts.',
      details: 'Deploys signed policy schemas and active guardrail layers directly into production container ingress. Plugs code loops straight into the compliance metrics dashboard.',
      artifact: 'PM01_Production_Lock.pem',
      coefficient: 'Enforcement Integrity Factor',
      value: '1.00'
    }
  ];

  const currentStep = steps[activeStep];

  return (
    <div className={`min-h-screen pt-28 pb-16 transition-colors duration-1000 ${theme === 'dark' || theme === 'dim' ? 'bg-[#030303] text-stone-300' : 'bg-[#faf9f6] text-stone-900'}`}>
      
      {/* SECTION 1: HERO OUTCOME BINDING */}
      <section className="container mx-auto px-8 max-w-7xl mb-16 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 text-left space-y-6">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#2dd4bf] block">
              SYSTEM OUTCOME BINDING
            </span>
            <h1 className={`text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] ${theme === 'dark' ? 'text-stone-400' : theme === 'dim' ? 'text-stone-300' : 'text-stone-600'}`}>
              Govern the critical path <span className="text-[#2dd4bf]">before it drifts.</span>
            </h1>
            <p className="text-lg leading-relaxed font-normal text-stone-500 max-w-2xl">
              Phase Mirror turns autonomous system claims into auditable constraints. We establish explicit, machine-enforced bindings for specifications, contracts, SLAs, telemetry, and kill-switches. Build secure trust loops into your production workflows now.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={scrollToSimulator}
                className={`px-6 py-4 border rounded-xl font-bold transition-all transform hover:scale-105 flex items-center gap-2 cursor-pointer ${
                  theme === 'dark' 
                    ? 'border-stone-800 text-stone-400 hover:border-red-500 hover:text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.35)]' 
                    : theme === 'dim'
                    ? 'border-stone-700 text-stone-300 hover:border-red-400 hover:text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                    : 'border-stone-250 text-stone-600 hover:border-red-500 hover:text-red-600 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                }`}
              >
                Start Diagnostic <ArrowRight size={16} />
              </button>
              <button 
                onClick={scrollToCriticalPath}
                className={`px-6 py-4 border rounded-xl font-bold transition-all transform hover:scale-105 cursor-pointer ${
                  theme === 'dark' 
                    ? 'border-stone-800 text-stone-400 hover:border-blue-500 hover:text-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.35)]' 
                    : theme === 'dim'
                    ? 'border-stone-700 text-stone-300 hover:border-blue-400 hover:text-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                    : 'border-stone-250 text-stone-600 hover:border-blue-500 hover:text-blue-600 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                }`}
              >
                See Critical Path Scope
              </button>
            </div>
          </div>

          {/* GATEWAY MONITOR CARD */}
          <div className="lg:col-span-5">
            <div className={`p-8 rounded-[2rem] border relative overflow-hidden ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950/80 border-stone-900' : 'bg-white border-stone-200/60 shadow-md'}`}>
              
              {/* Scanlines / tech background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2dd4bf]/5 to-transparent pointer-events-none opacity-40"></div>
              
              <div className="relative space-y-6">
                <div className="flex justify-between items-center border-b border-stone-800/15 pb-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#2dd4bf] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-pulse"></span>
                    GATEWAY MONITOR
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#2dd4bf]/15 text-[#2dd4bf] px-2 py-0.5 rounded">
                    STATE: SECURE
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-mono text-stone-500 mb-1">BOUND_SPEC //</div>
                  <p className="text-xs leading-relaxed font-semibold text-stone-400">
                    Specifications represent explicit bounds. Any deviation triggers immediate containment procedures.
                  </p>
                </div>

                {/* Recharts sparkline for Enterprise Liability Score trend */}
                <div className={`p-4 rounded-xl border ${theme === 'dark' || theme === 'dim' ? 'bg-black/30 border-stone-850' : 'bg-stone-50 border-stone-200'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-stone-500">Liability Trend (Last 10 steps)</span>
                    <span className="text-[10px] font-mono font-bold text-[#2dd4bf]">{rawLiabilityScore.toFixed(0)}/100</span>
                  </div>
                  <div className="h-12 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={liabilityHistory}>
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#2dd4bf" 
                          strokeWidth={2} 
                          dot={{ r: 1.5, fill: '#2dd4bf', strokeWidth: 0 }} 
                          activeDot={{ r: 3.5, fill: '#ef4444' }}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-stone-900 text-stone-100 px-2 py-1 rounded text-[9px] font-mono border border-stone-750">
                                  Score: <span className="text-[#2dd4bf] font-bold">{payload[0].value}%</span>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recharts Radar Chart for System Balance Matrix */}
                <div className={`p-4 rounded-xl border ${theme === 'dark' || theme === 'dim' ? 'bg-black/30 border-stone-850' : 'bg-stone-50 border-stone-200'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-stone-500">System Balance Matrix</span>
                    <span className="text-[10px] font-mono font-bold text-[#2dd4bf]">// ACTIVE_BALANCE</span>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="68%" data={[
                        { subject: 'Autonomy', value: autonomy },
                        { subject: 'Constraint', value: constraint },
                        { subject: 'Entropy', value: entropy },
                        { subject: 'Consistency', value: causalConsistency }
                      ]}>
                        <PolarGrid stroke={theme === 'dark' || theme === 'dim' ? '#292524' : '#e7e5e4'} />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ 
                            fill: theme === 'dark' || theme === 'dim' ? '#a8a29e' : '#57534e', 
                            fontSize: 9, 
                            fontFamily: 'JetBrains Mono, monospace',
                            fontWeight: '600'
                          }} 
                        />
                        <PolarRadiusAxis 
                          angle={30} 
                          domain={[0, 100]} 
                          tick={false}
                          axisLine={false}
                        />
                        <Radar 
                          name="System Balance" 
                          dataKey="value" 
                          stroke="#2dd4bf" 
                          fill="#2dd4bf" 
                          fillOpacity={0.2} 
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className={`p-4 rounded-xl border ${theme === 'dark' || theme === 'dim' ? 'bg-black/40 border-stone-903' : 'bg-stone-50 border-stone-200'}`}>
                    <div className="text-2xl font-mono font-extrabold text-[#2dd4bf]">100%</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-stone-500 mt-1">Determinism</div>
                  </div>
                  <div className={`p-4 rounded-xl border ${theme === 'dark' || theme === 'dim' ? 'bg-black/40 border-stone-903' : 'bg-stone-50 border-stone-200'}`}>
                    <div className="text-2xl font-mono font-extrabold text-stone-400">&lt; 14ms</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-stone-500 mt-1">Policy Latency</div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-stone-500">
                  <span>SPEC_LOCK // ACTIVE</span>
                  <span>SYSTEM_RESONANCE // COMPLIANT</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: STAGED DEPLOYMENT METHODOLOGY */}
      <section ref={criticalPathRef} className={`py-20 border-t border-b scroll-mt-24 ${theme === 'dark' || theme === 'dim' ? 'bg-[#050505] border-stone-900/50' : 'bg-stone-50 border-stone-200/40'}`}>
        <div className="container mx-auto px-8 max-w-7xl">
          
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#2dd4bf] block mb-3">STAGED DEPLOYMENT METHODOLOGY</span>
            <h2 className={`text-3xl md:text-5xl font-bold tracking-tight mb-4 ${theme === 'dark' ? 'text-stone-400' : theme === 'dim' ? 'text-stone-300' : 'text-stone-600'}`}>
              First Release Scope: <br />
              The Critical Path.
            </h2>
            <p className="text-base text-stone-500 leading-relaxed font-medium">
              We focus strictly on the vital workloads. Phase Mirror governs five essential runtime anchors in v1. We establish safe boundaries here before expanding horizontal autonomy.
            </p>
          </div>

          {/* EXCLUSIONS RECORD BANNER */}
          <div className="mb-12 p-6 rounded-2xl border border-rose-500/10 bg-rose-500/[0.02] flex items-start gap-4">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500 shrink-0">
              <span className="font-extrabold text-lg line-through leading-none block">✕</span>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-1">EXCLUSIONS RECORD:</h4>
              <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                Non-critical jobs, offline analytics, internal admin interfaces, and service sidecars are explicitly kept out of scope for v1. This enforces tight, localized risk boundaries.
              </p>
            </div>
          </div>

          {/* Bento-style Anchor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Anchor 1 */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950/60 border-stone-850' : 'bg-white border-stone-200/80 shadow-sm'}`}>
              <div>
                <span className="text-2xl font-mono font-bold text-[#2dd4bf] block mb-4">01</span>
                <h4 className={`font-bold text-sm uppercase tracking-tight mb-2 ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-900'}`}>Primary API Container</h4>
              </div>
              <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                Secures ingress endpoint routes, payload schemas, and sanitizes outgoing probabilistic responses.
              </p>
            </div>

            {/* Anchor 2 */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950/60 border-stone-850' : 'bg-white border-stone-200/80 shadow-sm'}`}>
              <div>
                <span className="text-2xl font-mono font-bold text-[#2dd4bf] block mb-4">02</span>
                <h4 className={`font-bold text-sm uppercase tracking-tight mb-2 ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-905'}`}>Auth & Session Storage</h4>
              </div>
              <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                Guarantees state persistence and cryptographically binds verified identity tokens to model context queues.
              </p>
            </div>

            {/* Anchor 3 */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950/60 border-stone-850' : 'bg-white border-stone-200/80 shadow-sm'}`}>
              <div>
                <span className="text-2xl font-mono font-bold text-[#2dd4bf] block mb-4">03</span>
                <h4 className={`font-bold text-sm uppercase tracking-tight mb-2 ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-905'}`}>Rollback Behavior</h4>
              </div>
              <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                Triggers instantaneous, automated revert to the last authenticated stable-state context block upon budget violation.
              </p>
            </div>

            {/* Anchor 4 */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950/60 border-stone-850' : 'bg-white border-stone-200/80 shadow-sm'}`}>
              <div>
                <span className="text-2xl font-mono font-bold text-[#2dd4bf] block mb-4">04</span>
                <h4 className={`font-bold text-sm uppercase tracking-tight mb-2 ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-905'}`}>Observability & Logs</h4>
              </div>
              <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                Maintains immutable local audit trails logging continuous divergence vectors against compliance rules.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 3: FIVE CONCRETE OPERATIONAL LAYERS */}
      <section className="py-20 container mx-auto px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-stone-500 block">Auditable Control Mechanisms</span>
            <h2 className={`text-3xl md:text-5xl font-bold tracking-tight mb-4 ${theme === 'dark' ? 'text-stone-400' : theme === 'dim' ? 'text-stone-300' : 'text-stone-600'}`}>
              Five Concrete Operational Layers
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed font-semibold">
              Governance is a physical state, not a strategy. We map mechanisms directly to observable telemetry outputs.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-6">
            
            {/* Layer 1 */}
            <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950/40 border-stone-900' : 'bg-white border-stone-150 shadow-sm'}`}>
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2dd4bf] bg-[#2dd4bf]/10 px-2 py-0.5 rounded">
                  ENFORCED
                </span>
                <h3 className={`text-base font-extrabold tracking-tight ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-900'}`}>Specifications</h3>
                <p className="text-xs text-stone-500 font-semibold leading-relaxed max-w-xl">
                  Enforces strict structural mapping of multi-agent request-response boundaries.
                </p>
              </div>
              <div className="border-t md:border-t-0 md:border-l border-stone-800/15 md:pl-6 pt-4 md:pt-0">
                <div className="text-[10px] font-mono font-bold tracking-wider text-stone-400 mb-1">Observable Result //</div>
                <p className="text-xs text-[#2dd4bf] font-bold">Eliminates unbounded execution paths; logs absolute deterministic execution compliance.</p>
              </div>
            </div>

            {/* Layer 2 */}
            <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950/40 border-stone-900' : 'bg-white border-stone-150 shadow-sm'}`}>
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                  ACTIVE
                </span>
                <h3 className={`text-base font-extrabold tracking-tight ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-900'}`}>Contracts</h3>
                <p className="text-xs text-stone-500 font-semibold leading-relaxed max-w-xl">
                  Locks state machine inputs with cryptographically signed JSON schemas before calling next.
                </p>
              </div>
              <div className="border-t md:border-t-0 md:border-l border-stone-800/15 md:pl-6 pt-4 md:pt-0">
                <div className="text-[10px] font-mono font-bold tracking-wider text-stone-400 mb-1">Observable Result //</div>
                <p className="text-xs text-[#2dd4bf] font-bold">Guarantees execution block integrity; instantly isolates invalid context payloads.</p>
              </div>
            </div>

            {/* Layer 3 */}
            <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950/40 border-stone-900' : 'bg-white border-stone-150 shadow-sm'}`}>
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2dd4bf] bg-[#2dd4bf]/10 px-2 py-0.5 rounded">
                  MONITORED
                </span>
                <h3 className={`text-base font-extrabold tracking-tight ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-900'}`}>SLAs</h3>
                <p className="text-xs text-stone-500 font-semibold leading-relaxed max-w-xl">
                  Monitors real-time compliance latencies, latency budget consumption, and token volume ratios.
                </p>
              </div>
              <div className="border-t md:border-t-0 md:border-l border-stone-800/15 md:pl-6 pt-4 md:pt-0">
                <div className="text-[10px] font-mono font-bold tracking-wider text-stone-400 mb-1">Observable Result //</div>
                <p className="text-xs text-[#2dd4bf] font-bold">Limits processing costs dynamically; prevents infinite cascading execution loops.</p>
              </div>
            </div>

            {/* Layer 4 */}
            <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950/40 border-stone-900' : 'bg-white border-stone-150 shadow-sm'}`}>
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                  ACTIVE
                </span>
                <h3 className={`text-base font-extrabold tracking-tight ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-900'}`}>Telemetry</h3>
                <p className="text-xs text-stone-500 font-semibold leading-relaxed max-w-xl">
                  Streams live divergence ratios, validation scores, and anomalous vector weights.
                </p>
              </div>
              <div className="border-t md:border-t-0 md:border-l border-stone-800/15 md:pl-6 pt-4 md:pt-0">
                <div className="text-[10px] font-mono font-bold tracking-wider text-stone-400 mb-1">Observable Result //</div>
                <p className="text-xs text-stone-400 font-bold">Maintains human-interpretable dashboard metrics mapping operational drift.</p>
              </div>
            </div>

            {/* Layer 5 */}
            <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950/40 border-stone-900' : 'bg-white border-stone-150 shadow-sm'}`}>
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f43f5e] bg-rose-500/10 px-2 py-0.5 rounded">
                  ENFORCED
                </span>
                <h3 className={`text-base font-extrabold tracking-tight ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-900'}`}>Kill-Switches</h3>
                <p className="text-xs text-stone-500 font-semibold leading-relaxed max-w-xl">
                  Automates circuit breaker triggers which isolate system nodes when failure budgets deplete.
                </p>
              </div>
              <div className="border-t md:border-t-0 md:border-l border-stone-800/15 md:pl-6 pt-4 md:pt-0">
                <div className="text-[10px] font-mono font-bold tracking-wider text-stone-400 mb-1">Observable Result //</div>
                <p className="text-xs text-[#f43f5e] font-bold">Protects critical databases; forces transition to safe offline diagnostic states.</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 4: OPERATING LOOP SEQUENCE (INTERACTIVE STEPPER) */}
      <section className={`py-20 border-t border-b ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950/60 border-stone-900/40' : 'bg-stone-50/50 border-stone-200/40'}`}>
        <div className="container mx-auto px-8 max-w-7xl">
          
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#2dd4bf] block mb-3">Operating Loop Sequence</span>
            <h2 className={`text-3xl md:text-5xl font-bold tracking-tight mb-4 ${theme === 'dark' ? 'text-stone-400' : theme === 'dim' ? 'text-stone-300' : 'text-stone-600'}`}>
              Managing, Not "Solving," Contradiction.
            </h2>
            <p className="text-base text-stone-500 leading-relaxed font-semibold">
              We do not promise a perfect, static solution. Phase Mirror methodology implements a recursive loop that maps, balances, and locks in operational constraints dynamically.
            </p>
          </div>

          {/* Timeline / Stepper Header */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {steps.map((st, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={st.title}
                  onClick={() => setActiveStep(idx)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isActive 
                      ? 'border-[#2dd4bf] bg-[#2dd4bf]/5 ring-1 ring-[#2dd4bf]/30 shadow-sm' 
                      : (theme === 'dark' || theme === 'dim' ? 'bg-black/30 border-stone-900 hover:border-stone-850' : 'bg-white border-stone-200 hover:border-stone-300')
                  }`}
                >
                  <span className={`text-[10px] font-mono uppercase font-extrabold tracking-wider block mb-1 ${isActive ? 'text-[#2dd4bf]' : 'text-stone-500'}`}>
                    Stage 0{idx + 1}
                  </span>
                  <span className="font-extrabold text-xs block truncate">{st.title}</span>
                </button>
              );
            })}
          </div>

          {/* Stepper Detail View */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`p-8 rounded-[2rem] border ${theme === 'dark' || theme === 'dim' ? 'bg-black border-stone-900' : 'bg-white border-stone-150 shadow-sm'}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                <div className="md:col-span-8 space-y-4">
                  <span className="text-[10px] font-mono tracking-widest text-[#2dd4bf] bg-[#2dd4bf]/10 px-2 py-0.5 rounded font-extrabold uppercase">
                    ACTIVE STEP // DETAILS
                  </span>
                  <h3 className={`text-2xl font-extrabold tracking-tight ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-950'}`}>
                    {currentStep.title}: <span className="font-semibold text-stone-500 text-lg md:text-xl block md:inline md:ml-1">{currentStep.summary}</span>
                  </h3>
                  <p className="text-sm text-stone-500 leading-relaxed font-medium">
                    {currentStep.details}
                  </p>
                </div>

                <div className="md:col-span-4 space-y-4 md:border-l md:border-stone-800/10 md:pl-8">
                  <div>
                    <span className="text-[10px] font-mono tracking-wider font-bold text-stone-550 block mb-1">ARTIFACT PRODUCED:</span>
                    <span className="font-mono text-xs font-bold text-[#2dd4bf] bg-[#2dd4bf]/5 py-1 px-2 border border-[#2dd4bf]/15 rounded block w-fit">
                      {currentStep.artifact}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-wider font-bold text-stone-550 block mb-1">MEASURABLE COEFFICIENT</span>
                    <span className="text-xs font-bold">{currentStep.coefficient}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-wider font-bold text-stone-550 block mb-1">CURRENT VALUE</span>
                    <span className="text-sm font-mono font-extrabold text-[#2dd4bf]">{currentStep.value}</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* SECTION 5: DISSONANCE ENFORCEMENT LEDGER (THE PROOF MATRIX) */}
      <section className="py-20 container mx-auto px-8 max-w-7xl">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-stone-500 block mb-3">Dissonance Enforcement Ledger</span>
          <h2 className={`text-3xl md:text-5xl font-bold tracking-tight mb-4 ${theme === 'dark' ? 'text-stone-400' : theme === 'dim' ? 'text-stone-300' : 'text-stone-600'}`}>
            The Proof Matrix
          </h2>
          <p className="text-base text-stone-500 leading-relaxed font-semibold">
            What is actually enforced? We map our governance mechanisms directly to systemic ownership logs, target thresholds, and intervention horizons.
          </p>
        </div>

        {/* Ledger Table Container */}
        <div className={`border rounded-[1.5rem] overflow-hidden ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950/40 border-stone-900' : 'bg-white border-stone-200/80 shadow-sm'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b border-stone-800/10 font-mono text-[10px] font-bold uppercase tracking-wider text-stone-550 ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-900/30' : 'bg-[#faf9f6]'}`}>
                  <th className="p-5">Tension Under Governance</th>
                  <th className="p-5">Auditable Enforced Metric</th>
                  <th className="p-5">Compliance Owner</th>
                  <th className="p-5">Remediation Horizon</th>
                  <th className="p-5">Target Value</th>
                  <th className="p-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-stone-500 leading-relaxed">
                
                {/* Row 1 */}
                <tr className="border-b border-stone-800/10 hover:bg-[#2dd4bf]/[0.02] transition-colors">
                  <td className={`p-5 font-bold ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-900'}`}>Autonomy vs. Governance</td>
                  <td className="p-5 font-mono text-stone-400">Safeguard Coverage Ratio</td>
                  <td className="p-5">Governance Director</td>
                  <td className="p-5">30 Days</td>
                  <td className="p-5 font-mono text-[#2dd4bf]">&gt;= 95.0%</td>
                  <td className="p-5 text-right">
                    <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      COMPLIANT
                    </span>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="border-b border-stone-800/10 hover:bg-[#2dd4bf]/[0.02] transition-colors">
                  <td className={`p-5 font-bold ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-900'}`}>Bayesian vs. Binary Legal</td>
                  <td className="p-5 font-mono text-stone-400">Audit Trail Pass Rate</td>
                  <td className="p-5">Legal Affairs Counsel</td>
                  <td className="p-5">60 Days</td>
                  <td className="p-5 font-mono text-[#2dd4bf]">100% Deterministic</td>
                  <td className="p-5 text-right">
                    <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      COMPLIANT
                    </span>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="border-b border-stone-800/10 hover:bg-[#2dd4bf]/[0.02] transition-colors">
                  <td className={`p-5 font-bold ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-900'}`}>Transparency vs. Proprietary</td>
                  <td className="p-5 font-mono text-stone-400">SLA Boundary Violations</td>
                  <td className="p-5">Security Lead</td>
                  <td className="p-5">14 Days</td>
                  <td className="p-5 font-mono text-[#2dd4bf]">0 Absolute Violations</td>
                  <td className="p-5 text-right">
                    <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      COMPLIANT
                    </span>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="border-b border-stone-800/10 hover:bg-[#2dd4bf]/[0.02] transition-colors">
                  <td className={`p-5 font-bold ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-900'}`}>Prediction to Agency Shift</td>
                  <td className="p-5 font-mono text-stone-400">Human Intervention Ratio</td>
                  <td className="p-5">Product Manager</td>
                  <td className="p-5">45 Days</td>
                  <td className="p-5 font-mono text-amber-500">&lt; 3.0%</td>
                  <td className="p-5 text-right">
                    <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      WARNING
                    </span>
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="hover:bg-[#2dd4bf]/[0.02] transition-colors">
                  <td className={`p-5 font-bold ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-900'}`}>Precision vs. Platform Scale</td>
                  <td className="p-5 font-mono text-stone-400">Model Verification Score</td>
                  <td className="p-5">Principal Engineer</td>
                  <td className="p-5">21 Days</td>
                  <td className="p-5 font-mono text-[#2dd4bf]">&gt;= 99.8%</td>
                  <td className="p-5 text-right">
                    <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      COMPLIANT
                    </span>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 6: PHASE MIRROR INTEGRATED SIMULATOR LAB (Relocated to Oracle page) */}
      <section ref={simulatorRef} className="hidden">
        <div className="container mx-auto px-8 max-w-7xl">
          
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#2dd4bf] block mb-3">INTEGRATION LAB</span>
            <h2 className={`text-3xl md:text-5xl font-extrabold tracking-tight mb-4 ${theme === 'dark' ? 'text-stone-400' : theme === 'dim' ? 'text-stone-300' : 'text-stone-600'}`}>
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
                        : (theme === 'dark' || theme === 'dim' ? 'bg-zinc-950 border-stone-900 hover:border-stone-800' : 'bg-white border-stone-200 hover:border-stone-300')
                    }`}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#2dd4bf] mb-1.5">{sc.industry}</p>
                    <h4 className={`font-bold text-xs mb-1 ${isActive ? (theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-950') : ''}`}>{sc.name}</h4>
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
              <div className={`p-8 rounded-[2rem] border ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950/60 border-stone-900' : 'bg-white border-stone-150 shadow-sm'}`}>
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
              <div className={`p-8 rounded-[2rem] border ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950/60 border-stone-900' : 'bg-white border-stone-150 shadow-sm'}`}>
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
                        : (theme === 'dark' || theme === 'dim' ? 'bg-zinc-900/10 border-stone-900 hover:border-stone-800' : 'bg-stone-100/50 border-stone-200 hover:border-stone-300')
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
                        : (theme === 'dark' || theme === 'dim' ? 'bg-zinc-900/10 border-stone-900 hover:border-stone-800' : 'bg-stone-100/50 border-stone-200 hover:border-stone-300')
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
                        : (theme === 'dark' || theme === 'dim' ? 'bg-zinc-900/10 border-stone-900 hover:border-stone-800' : 'bg-stone-100/50 border-stone-200 hover:border-stone-300')
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
              <div className={`p-8 rounded-[2rem] border ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950/60 border-stone-900' : 'bg-white border-stone-150 shadow-sm'}`}>
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
                        className={`h-1.5 rounded-full transition-all duration-350 ${rawLiabilityScore > 55 ? 'bg-rose-500' : rawLiabilityScore > 35 ? 'bg-amber-500' : 'bg-teal-550'}`} 
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
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
                      <Terminal size={12} className="text-[#2dd4bf]" /> Telemetry Trace Output
                    </span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={downloadSimulationJSON}
                        className="text-[9px] font-mono font-bold uppercase tracking-wider text-stone-400 hover:text-[#2dd4bf] bg-stone-900 hover:bg-stone-850 px-2.5 py-1 rounded border border-stone-805 flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-[0_0_10px_rgba(45,212,191,0.2)]"
                        title="Download simulation data as JSON"
                      >
                        <Download size={10} /> Export JSON
                      </button>
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500/80"></span>
                        <span className="w-2 h-2 rounded-full bg-amber-500/80"></span>
                        <span className="w-2 h-2 rounded-full bg-[#2dd4bf]/80"></span>
                      </div>
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
                      if (log.includes('[DANGER]')) color = 'text-rose-400 font-semibold';
                      if (log.includes('WARNING:')) color = 'text-amber-400';
                      if (log.includes('SUCCESS:')) color = 'text-teal-400';
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

      {/* SECTION 7: ENTERPRISE DEPLOYMENT OPTIONS / LICENSING (Relocated to Oracle page) */}
      <section className="hidden">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-stone-500 block mb-3">Enterprise Deployment Options</span>
          <h2 className={`text-3xl md:text-5xl font-bold tracking-tight mb-4 ${theme === 'dark' ? 'text-stone-400' : theme === 'dim' ? 'text-stone-300' : 'text-stone-600'}`}>
            Production-Isolated Licensing
          </h2>
          <p className="text-base text-stone-500 leading-relaxed font-semibold">
            Select the appropriate deployment tier matching your contract depth requirements and service level limits.
          </p>
        </div>

        {/* Pricing Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Plan 1: Community */}
          <div className={`p-6 rounded-[2rem] border flex flex-col justify-between ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950/40 border-stone-900' : 'bg-white border-stone-200 shadow-sm'}`}>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-extrabold uppercase tracking-wide">Community</h4>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className={`text-3xl font-extrabold font-mono ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-950'}`}>$0</span>
                  <span className="text-stone-500 text-xs font-semibold">Free Forever</span>
                </div>
              </div>
              
              <div className="space-y-2 border-t border-b border-stone-800/10 py-4 text-[11px] font-mono leading-relaxed text-stone-500 uppercase">
                <div>Enforcement: <span className="text-stone-300 font-bold block">Local Sandbox Enforce</span></div>
                <div>Audit Trails: <span className="text-stone-300 font-bold block">Local Console Only</span></div>
                <div>Isolation: <span className="text-stone-300 font-bold block">Shared Work Containers</span></div>
                <div>SLA Limit: <span className="text-stone-300 font-bold block">Community Support</span></div>
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
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center mt-6 transition-colors border ${theme === 'dark' || theme === 'dim' ? 'border-stone-800 text-stone-300 hover:bg-stone-900/30' : 'border-stone-200 text-stone-700 hover:bg-stone-100'}`}
            >
              Start Sandbox
            </button>
          </div>

          {/* Plan 2: Team */}
          <div className={`p-6 rounded-[2rem] border flex flex-col justify-between ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950/40 border-stone-900' : 'bg-white border-stone-200 shadow-sm'}`}>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-extrabold uppercase tracking-wide">Team</h4>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className={`text-3xl font-extrabold font-mono ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-950'}`}>$45</span>
                  <span className="text-stone-500 text-xs font-semibold">Per User / Month</span>
                </div>
              </div>
              
              <div className="space-y-2 border-t border-b border-stone-800/10 py-4 text-[11px] font-mono leading-relaxed text-stone-500 uppercase">
                <div>Enforcement: <span className="text-stone-300 font-bold block">Federated Enforce Group</span></div>
                <div>Audit Trails: <span className="text-stone-300 font-bold block">S3 Sync Archive Log</span></div>
                <div>Isolation: <span className="text-stone-300 font-bold block">Protected Namespace</span></div>
                <div>SLA Limit: <span className="text-stone-300 font-bold block">24 Hour Reaction Time</span></div>
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
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center mt-6 transition-colors border ${theme === 'dark' || theme === 'dim' ? 'border-stone-800 text-stone-300 hover:bg-stone-900/30' : 'border-stone-200 text-stone-700 hover:bg-stone-100'}`}
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
                  <span className={`text-3xl font-extrabold font-mono ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-950'}`}>$180</span>
                  <span className="text-stone-500 text-xs font-semibold">Per User / Month</span>
                </div>
              </div>
              
              <div className="space-y-2 border-t border-b border-stone-850 py-4 text-[11px] font-mono leading-relaxed text-stone-500 uppercase">
                <div>Enforcement: <span className="text-stone-300 font-bold block">Org-wide Control Chain</span></div>
                <div>Audit Trails: <span className="text-stone-300 font-bold block">Signed JWT Secure Sync</span></div>
                <div>Isolation: <span className="text-stone-300 font-bold block">Dedicated VPC Space</span></div>
                <div>SLA Limit: <span className="text-stone-300 font-bold block">4 Hour SLA Guarantee</span></div>
              </div>

              <ul className="space-y-2.5 text-xs text-stone-305 font-semibold">
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
          <div className={`p-6 rounded-[2rem] border flex flex-col justify-between ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950/40 border-stone-900' : 'bg-white border-stone-200 shadow-sm'}`}>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-extrabold uppercase tracking-wide">Enterprise</h4>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className={`text-3xl font-extrabold font-mono ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-950'}`}>Custom</span>
                  <span className="text-stone-500 text-xs font-semibold">Tailored Quotation</span>
                </div>
              </div>
              
              <div className="space-y-2 border-t border-b border-stone-800/10 py-4 text-[11px] font-mono leading-relaxed text-stone-500 uppercase">
                <div>Enforcement: <span className="text-stone-300 font-bold block">Total Physics Air-gap</span></div>
                <div>Audit Trails: <span className="text-stone-300 font-bold block">On-prem HSM Bound Crypt</span></div>
                <div>Isolation: <span className="text-stone-300 font-bold block">Fully Isolated Appliance</span></div>
                <div>SLA Limit: <span className="text-stone-300 font-bold block">Under 15 Min SLA Veto</span></div>
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
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center mt-6 transition-colors border ${theme === 'dark' || theme === 'dim' ? 'border-stone-800 text-stone-300 hover:bg-stone-900/30' : 'border-stone-200 text-stone-700 hover:bg-stone-100'}`}
            >
              Contact Architecture
            </button>
          </div>

        </div>
      </section>

      {/* BOTTOM CTA CARD */}
      <section className="py-12 container mx-auto px-8 max-w-7xl">
        <div className={`p-10 rounded-[2.5rem] border text-center relative overflow-hidden ${theme === 'dark' || theme === 'dim' ? 'bg-[#050505] border-stone-900' : 'bg-stone-50 border-stone-150 shadow-sm'}`}>
          <div className="absolute inset-0 bg-[#2dd4bf]/[0.01] pointer-events-none"></div>
          
          <div className="max-w-2xl mx-auto space-y-6 relative">
            <h3 className={`text-2xl md:text-4xl font-extrabold tracking-tight ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-stone-950'}`}>
              Ready to secure your path?
            </h3>
            <p className="text-sm font-semibold text-stone-500 leading-relaxed">
              Unlock complete audit logs, state rolls, deterministic telemetry metrics, and custom boundaries today. Bring integrity to autonomous decision layers.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <button 
                onClick={scrollToSimulator}
                className={`px-6 py-3.5 border rounded-xl font-bold text-xs uppercase tracking-wider transition-all transform hover:scale-105 cursor-pointer ${
                  theme === 'dark' 
                    ? 'border-stone-800 text-stone-400 hover:border-red-500 hover:text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.35)]' 
                    : theme === 'dim'
                    ? 'border-stone-700 text-stone-300 hover:border-red-400 hover:text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                    : 'border-stone-250 text-stone-600 hover:border-red-500 hover:text-red-600 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                }`}
              >
                Start Diagnostic
              </button>
              <button 
                onClick={scrollToSimulator}
                className={`px-6 py-3.5 border rounded-xl font-bold text-xs uppercase tracking-wider transition-all transform hover:scale-105 cursor-pointer ${
                  theme === 'dark' 
                    ? 'border-stone-800 text-stone-400 hover:border-blue-500 hover:text-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.35)]' 
                    : theme === 'dim'
                    ? 'border-stone-700 text-stone-300 hover:border-blue-400 hover:text-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                    : 'border-stone-250 text-stone-600 hover:border-blue-500 hover:text-blue-600 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                }`}
              >
                Navigate Workbench Demo
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default DemoApp;
