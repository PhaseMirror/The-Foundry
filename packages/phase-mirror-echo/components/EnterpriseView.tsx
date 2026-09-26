import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Terminal, 
  RotateCcw, 
  Play, 
  ArrowRight, 
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
  Hash,
  Compass,
  Download,
  Database,
  Globe,
  Network
} from 'lucide-react';

interface EnterpriseViewProps {
  isDarkMode: boolean;
  theme?: 'light' | 'dark' | 'dim';
}

export const EnterpriseView: React.FC<EnterpriseViewProps> = ({ isDarkMode, theme = 'dark' }) => {
  // Navigation / Workspace Tabs
  const [activeTab, setActiveTab] = useState<'controls' | 'evidence'>('controls');

  // Interactive sequence states
  const [selectedStep, setSelectedStep] = useState<number>(0);

  // Surface Primitive States
  const [policyCodeActive, setPolicyCodeActive] = useState<boolean>(true);
  const [thresholdActive, setThresholdActive] = useState<boolean>(true);
  const [signedRecordsActive, setSignedRecordsActive] = useState<boolean>(true);
  const [escalationSlaActive, setEscalationSlaActive] = useState<boolean>(true);
  const [killSwitchActive, setKillSwitchActive] = useState<boolean>(false);

  // Numeric controllers for live simulation
  const [autonomyLevel, setAutonomyLevel] = useState<number>(85);
  const [constraintLevel, setConstraintLevel] = useState<number>(60);
  const [entropyLevel, setEntropyLevel] = useState<number>(25);

  // Simulated live event logger/auditor
  const [liveTraces, setLiveTraces] = useState<Array<{ id: string; time: string; source: string; text: string; status: 'info' | 'warn' | 'success' | 'danger' }>>([
    { id: '1', time: '19:00:10', source: 'POL', text: 'Policy signature verification complete.', status: 'success' },
    { id: '2', time: '19:00:15', source: 'SYS', text: 'VPC Gateway connection initialized on 0.0.0.0:3000.', status: 'info' },
    { id: '3', time: '19:00:22', source: 'SLA', text: 'Baseline latency trace recorded under SLA margins (8ms elapsed).', status: 'success' },
  ]);

  // Selected region and simulation parameters for Cluster Ingress Form
  const [selectedRegion, setSelectedRegion] = useState<string>('us-east5');
  const [networkType, setNetworkType] = useState<string>('gke-private-transit');
  const [clusterKey, setClusterKey] = useState<string>('pm-prod-key-77f6b');
  const [exportedConfig, setExportedConfig] = useState<string>('');
  const [showConfigLoader, setShowConfigLoader] = useState<boolean>(false);

  // Ref for trace autoscrolling
  const traceEndRef = useRef<HTMLDivElement>(null);

  // Generate interactive traces dynamically based on changes
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    const newId = String(Date.now());
    let addedTrace = null;

    if (!policyCodeActive) {
      addedTrace = { id: newId, time: timestamp, source: 'POL', text: 'CRITICAL: Policy-as-Code bypassed! Dynamic JSON filtering disabled.', status: 'danger' as const };
    } else if (killSwitchActive) {
      addedTrace = { id: newId, time: timestamp, source: 'SYS', text: 'HALT TRIGGER: Kill-switch hook is armed. Sub-15ms rollback recovery primed.', status: 'warn' as const };
    } else if (autonomyLevel > 80 && constraintLevel < 50) {
      addedTrace = { id: newId, time: timestamp, source: 'DRIFT', text: 'RISK FLOTATION: Low constraint bounds configured relative to autonomy. Out of boundary potential high.', status: 'warn' as const };
    } else {
      addedTrace = { id: newId, time: timestamp, source: 'ALIGN', text: 'System tracking within strict specification bounds. Resonance score stable.', status: 'success' as const };
    }

    if (addedTrace) {
      setLiveTraces(prev => [...prev.slice(-12), addedTrace]);
    }
  }, [policyCodeActive, killSwitchActive, autonomyLevel, constraintLevel]);

  // Trace auto scroll helper
  useEffect(() => {
    if (traceEndRef.current) {
      traceEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveTraces]);

  const stepsDetails = [
    {
      num: 'STEP 01',
      title: 'Extract Stated Goals',
      summary: 'Ingests agent specifications, prompt boundaries, and legacy telemetry limits.',
      execution: 'Ingests agent specifications, prompt boundaries, and legacy telemetry limits.',
      proposition: 'Establishes the initial safety and operational envelope parameters.',
      assetName: 'Produced Asset Boundary',
      specFile: 'PM_System_Draft.json',
      color: 'from-emerald-500/20 to-teal-500/10',
      badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
    },
    {
      num: 'STEP 02',
      title: 'Map Tensions',
      summary: 'Detects dialectical conflicts between model outputs, compliance goals, and legal risks.',
      execution: 'Detects dialectical conflicts between model outputs, compliance goals, and legal risks.',
      proposition: 'Visualizes overlap zones of regulatory frictional drag and operational drift.',
      assetName: 'Conflict Graph Matrix',
      specFile: 'PM_Tension_Map.json',
      color: 'from-amber-500/20 to-orange-500/10',
      badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10'
    },
    {
      num: 'STEP 03',
      title: 'Rank Tensions',
      summary: 'Calculates impact and feasibility index values to rank systemic operating vulnerabilities.',
      execution: 'Calculates impact and feasibility index values to rank systemic operating vulnerabilities.',
      proposition: 'Separates manageable procedural errors from systemic design breaches.',
      assetName: 'Priority Loss Matrix',
      specFile: 'PM_Risk_Matrix.json',
      color: 'from-rose-500/20 to-red-500/10',
      badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10'
    },
    {
      num: 'STEP 04',
      title: 'Produce Levers',
      summary: 'Generates specific metrics regulators with explicit owners, budgets, and horizons.',
      execution: 'Generates specific metrics regulators with explicit owners, budgets, and horizons.',
      proposition: 'Gives business leaders remote, software-enforced knobs of system compliance.',
      assetName: 'Audit Metrics Config',
      specFile: 'PM_Levers_Config.json',
      color: 'from-teal-500/20 to-cyan-500/10',
      badgeColor: 'border-teal-500/30 text-teal-400 bg-teal-500/10'
    },
    {
      num: 'STEP 05',
      title: 'Bind Governance',
      summary: 'Configures secure network spec bounds, fail-safes, and fallback rollback routes.',
      execution: 'Configures secure network spec bounds, fail-safes, and fallback rollback routes.',
      proposition: 'Restricts uncompliant output state progression strictly.',
      assetName: 'Policy Cryptogram Sign',
      specFile: 'PM01_Production_Lock.pem',
      color: 'from-purple-500/20 to-indigo-500/10',
      badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10'
    }
  ];

  // Dynamic calculations for Evidence and Telemetry Panel
  const calculatedCoverage = Math.min(100, Math.max(0, 
    90 + (policyCodeActive ? 4 : 0) + (thresholdActive ? 3 : 0) + (signedRecordsActive ? 2.42 : 0)
  ));

  const calculatedApproval = Math.min(100, Math.max(0, 
    100 - (entropyLevel * 0.25) + (constraintLevel * 0.1) - (autonomyLevel > 85 ? (autonomyLevel - 85) * 0.5 : 0)
  ));

  const calculatedViolations = !policyCodeActive && autonomyLevel > 90 ? 2 : killSwitchActive ? 0 : 0;

  const handleGenerateYAML = () => {
    setShowConfigLoader(true);
    setTimeout(() => {
      const yaml = `apiVersion: phasemirror.io/v1alpha1
kind: ClusterIngressPlane
metadata:
  name: determinism-control-plane
  namespace: pm-isolated-prod
spec:
  region: ${selectedRegion}
  vpcTransitNetwork:
    type: ${networkType}
    transitKey: "${clusterKey}"
    secureTunnelOnly: true
  governanceProfile:
    autonomousTarget: ${autonomyLevel}%
    constraintStrength: ${constraintLevel}%
    maximumAllowedEntropy: ${entropyLevel}%
  activeShields:
    policyAsCode: ${policyCodeActive}
    thresholdRegistry: ${thresholdActive}
    signedHmacRecords: ${signedRecordsActive}
    escalationSlaGateway: ${escalationSlaActive}
    killSwitchRevertHook: ${killSwitchActive}
  remediationHorizon:
    onFailurePolicy: rollback-context-snapshot
    latencyLimitMs: 15
status:
  isolationLevel: ABSOLUTE_PRIVATE_VPC_ENCLOSED
  ready: true`;
      setExportedConfig(yaml);
      setShowConfigLoader(false);
    }, 850);
  };

  const isDark = theme === 'dark' || theme === 'dim';

  return (
    <div className={`min-h-screen text-stone-300 transition-colors duration-1000 ${
      theme === 'dark' ? 'bg-[#030303] text-stone-300' :
      theme === 'dim' ? 'bg-stone-900 text-stone-300' :
      'bg-[#fcfbf9] text-stone-800'
    }`}>
      
      {/* HEADER SECTION (IMPOSING DESIGN) */}
      <section className="relative overflow-hidden min-h-[calc(100vh-98px)] flex items-center pt-[148px] pb-16 border-b border-stone-800/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2dd4bf]/5 to-transparent pointer-events-none opacity-40"></div>
        <div className="container mx-auto px-8 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            
            <div className="lg:col-span-8 text-left space-y-4">
              <span className={`text-xs font-mono font-bold uppercase tracking-[0.35em] block ${
                isDark ? 'text-[#2dd4bf]' : 'text-teal-600'
              }`}>
                DETERMINISTIC RUNTIME CONTROL PLANE
              </span>
              <h1 className={`text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] ${
                theme === 'dark' ? 'text-stone-400' : theme === 'dim' ? 'text-stone-300' : 'text-stone-600'
              }`}>
                A governed platform <br /> 
                <span className={isDark ? 'text-stone-500' : 'text-stone-400'}>for autonomous systems.</span>
              </h1>
              <p className={`text-base md:text-lg leading-relaxed font-medium max-w-2xl ${
                isDark ? 'text-stone-450' : 'text-stone-550'
              }`}>
                Phase Mirror turns agentic intent into measurable constraints. Every workload transaction is routed, validated, and logged under explicit specs, binary contracts, real-time telemetry, and automated rollback paths.
              </p>
            </div>

            {/* TAB SELECTOR CONTROLS */}
            <div className="lg:col-span-4 flex flex-col items-stretch space-y-3">
              <div className="text-[10px] font-mono tracking-widest text-stone-500 font-bold uppercase">
                CONTROL PLANE WORKSPACE VIEW:
              </div>
              <div className={`p-1.5 rounded-xl flex ${
                isDark ? 'bg-zinc-950 border border-stone-900' : 'bg-stone-100 border border-stone-200'
              }`}>
                <button
                  onClick={() => setActiveTab('controls')}
                  className={`flex-1 py-3 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'controls'
                      ? (isDark ? 'bg-zinc-900 border border-stone-800 text-teal-400 shadow-sm' : 'bg-white border border-stone-250 text-teal-600 shadow-sm')
                      : 'text-stone-500 hover:text-stone-400'
                  }`}
                >
                  <SlidersHorizontal size={13} /> View Controls
                </button>
                <button
                  onClick={() => setActiveTab('evidence')}
                  className={`flex-1 py-3 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-2 relative ${
                    activeTab === 'evidence'
                      ? (isDark ? 'bg-zinc-900 border border-stone-800 text-teal-400 shadow-sm' : 'bg-white border border-stone-250 text-teal-600 shadow-sm')
                      : 'text-stone-500 hover:text-stone-400'
                  }`}
                >
                  <Activity size={13} /> See Evidence
                  <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CORE OPERATING SEQUENCE TIMELINE / STEPPER */}
      <section className={`py-16 border-b ${
        isDark ? 'bg-[#070707] border-stone-900' : 'bg-stone-50/50 border-stone-200/60'
      }`}>
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="mb-10 text-left">
            <span className={`text-[10px] font-mono font-extrabold uppercase tracking-widest ${
              isDark ? 'text-teal-400' : 'text-teal-600'
            }`}>
              Platform Core Engine
            </span>
            <h2 className={`text-2xl md:text-3xl font-bold tracking-tight mt-1 ${
              isDark ? 'text-white' : 'text-stone-900'
            }`}>
              The Core Operating Sequence
            </h2>
            <p className={`text-sm mt-1 leading-relaxed ${
              isDark ? 'text-stone-500' : 'text-stone-500'
            }`}>
              Our sequential execution cycle continuously aligns active agent pathways with enterprise safety frameworks.
            </p>
          </div>

          {/* Stepper Grid (Horizontal Selector) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {stepsDetails.map((st, idx) => {
              const toIsSelected = selectedStep === idx;
              return (
                <button
                  key={st.num}
                  onClick={() => setSelectedStep(idx)}
                  className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                    toIsSelected 
                      ? (isDark ? 'border-teal-500 bg-teal-500/[0.04] ring-1 ring-teal-500/30' : 'border-teal-500 bg-teal-500/[0.02] shadow-sm')
                      : (isDark ? 'bg-black border-stone-900 hover:border-stone-800' : 'bg-white border-stone-200 hover:bg-stone-100')
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono font-extrabold tracking-wider ${
                      toIsSelected ? 'text-teal-400 font-bold' : 'text-stone-500'
                    }`}>
                      {st.num}
                    </span>
                    {toIsSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                    )}
                  </div>
                  <h4 className={`font-mono text-xs font-bold truncate ${
                    isDark ? 'text-stone-100' : 'text-stone-900'
                  }`}>
                    {st.title}
                  </h4>
                </button>
              );
            })}
          </div>

          {/* Expanded Step Details Pane */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={`p-6 md:p-8 rounded-3xl border ${
                isDark ? 'bg-[#030303] border-stone-900' : 'bg-white border-stone-200 shadow-sm'
              } relative overflow-hidden`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Visual diagram representation representing current step */}
                <div className="lg:col-span-4 flex flex-col justify-between h-full space-y-4">
                  <div>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                      stepsDetails[selectedStep].badgeColor
                    }`}>
                      {stepsDetails[selectedStep].num} // ACTIVE CHANNEL
                    </span>
                    <h3 className={`text-xl md:text-2xl font-extrabold tracking-tight mt-3 ${
                      isDark ? 'text-stone-100' : 'text-stone-900'
                    }`}>
                      {stepsDetails[selectedStep].title}
                    </h3>
                  </div>

                  {/* Produced Asset Card box */}
                  <div className={`p-4 rounded-xl border ${
                    isDark ? 'bg-zinc-950/60 border-stone-900/60' : 'bg-stone-50 border-stone-200'
                  } space-y-2`}>
                    <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-550 block">
                      ACTIVE OUTCOME BINDING:
                    </div>
                    <div className="font-semibold text-xs text-stone-400 sm:text-stone-500">
                      {stepsDetails[selectedStep].assetName}
                    </div>
                    <div className="flex items-center gap-2 border-t border-stone-850 pt-2 text-stone-300">
                      <FileText size={14} className="text-teal-400" />
                      <span className="font-mono text-xs font-bold text-teal-450 truncate">
                        {stepsDetails[selectedStep].specFile}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Narrative description column */}
                <div className="lg:col-span-8 space-y-6 lg:border-l lg:border-stone-800/10 lg:pl-8">
                  
                  <div>
                    <h5 className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold mb-1">
                      STEP MECHANICS:
                    </h5>
                    <p className={`text-sm leading-relaxed font-semibold ${
                      isDark ? 'text-stone-300' : 'text-stone-800'
                    }`}>
                      {stepsDetails[selectedStep].execution}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold mb-1">
                      VALUE PROPOSITION:
                    </h5>
                    <p className={`text-sm leading-relaxed ${
                      isDark ? 'text-stone-450' : 'text-stone-600'
                    }`}>
                      {stepsDetails[selectedStep].proposition}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center justify-between text-[11px] font-mono text-stone-500 border-t border-stone-800/10">
                    <span>SYSTEM STATE // SYNCHRONIZED</span>
                    <span>SPEC BINDING FACTOR // 1.00</span>
                  </div>

                </div>

              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* REACTION SYSTEM TABS (Controls vs. Evidence and metrics) */}
      <section className="py-16 container mx-auto px-8 max-w-7xl">
        <AnimatePresence mode="wait">
          {activeTab === 'controls' ? (
            <motion.div
              key="controls-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              <div>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                  isDark ? 'text-teal-400' : 'text-teal-600'
                }`}>
                  Core Control Surfaces
                </span>
                <h3 className={`text-2xl md:text-3xl font-extrabold tracking-tight mt-1 ${
                  isDark ? 'text-white' : 'text-stone-900'
                }`}>
                  Platform Control Primitives
                </h3>
                <p className={`text-sm leading-relaxed mt-1 ${
                  isDark ? 'text-stone-500' : 'text-stone-500'
                }`}>
                  These are the logical building blocks of Phase Mirror runtime enforcement. Precise, hardcoded constraints that cannot be bypassed.
                </p>
              </div>

              {/* Grid 1: Side control sliders & Active primitives board */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* 5 columns: Hardware Controls console */}
                <div className={`lg:col-span-5 p-6 rounded-3xl border space-y-6 ${
                  isDark ? 'bg-zinc-950/40 border-stone-900' : 'bg-stone-50/70 border-stone-200'
                }`}>
                  <div className="flex justify-between items-center border-b border-stone-800/10 pb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                      TELEMETRY TARGET TUNING
                    </span>
                    <button 
                      onClick={() => {
                        setAutonomyLevel(85);
                        setConstraintLevel(60);
                        setEntropyLevel(25);
                      }}
                      className="text-[10px] font-mono text-teal-400 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw size={10} /> Recalibrate
                    </button>
                  </div>

                  {/* Slider 1 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className={isDark ? 'text-stone-300' : 'text-stone-700'}>AUTONOMY PROFILE</span>
                      <span className="text-teal-400">{autonomyLevel}%</span>
                    </div>
                    <input 
                      type="range"
                      min="10"
                      max="100"
                      value={autonomyLevel}
                      onChange={(e) => setAutonomyLevel(Number(e.target.value))}
                      className="w-full accent-teal-400 cursor-pointer"
                    />
                    <p className="text-[10px] text-stone-500 leading-normal">
                      Specifies authorized model agency boundaries within runtime operations.
                    </p>
                  </div>

                  {/* Slider 2 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className={isDark ? 'text-stone-300' : 'text-stone-700'}>CONSTRAINT BOUND</span>
                      <span className="text-teal-400">{constraintLevel}%</span>
                    </div>
                    <input 
                      type="range"
                      min="10"
                      max="100"
                      value={constraintLevel}
                      onChange={(e) => setConstraintLevel(Number(e.target.value))}
                      className="w-full accent-teal-400 cursor-pointer"
                    />
                    <p className="text-[10px] text-stone-500 leading-normal">
                      Vigor of automated JSON assertion patterns configured on Ingress validation.
                    </p>
                  </div>

                  {/* Slider 3 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className={isDark ? 'text-stone-300' : 'text-stone-700'}>ALLOWED ENTROPY</span>
                      <span className="text-amber-500">{entropyLevel}%</span>
                    </div>
                    <input 
                      type="range"
                      min="5"
                      max="90"
                      value={entropyLevel}
                      onChange={(e) => setEntropyLevel(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-stone-500 leading-normal">
                      Linguistic fluctuation trigger ceiling. Exceeding triggers automated escalation trace.
                    </p>
                  </div>

                  {/* Operational status preview widget */}
                  <div className={`p-4 rounded-xl border ${
                    isDark ? 'bg-black/60 border-stone-900' : 'bg-white border-stone-250/70'
                  } space-y-1`}>
                    <div className="text-[10px] font-mono text-stone-500 font-extrabold uppercase">
                      TELEMETRY PRE-DIAGNOSTIC STATUS
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs font-bold">Resonance Profile:</span>
                      <span className={`text-xs font-mono font-extrabold flex items-center gap-1.5 ${
                        calculatedCoverage > 95 ? 'text-emerald-400' : 'text-amber-500'
                      }`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${calculatedCoverage > 95 ? 'bg-[#2dd4bf]' : 'bg-amber-500'}`}></span>
                        {calculatedCoverage > 95 ? 'OPTIMAL' : 'DEGRADED COHERENCE'}
                      </span>
                    </div>
                  </div>

                </div>

                {/* 7 columns: Toggleable Control surfaces */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Control Surface 1 */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    policyCodeActive 
                      ? (isDark ? 'bg-teal-950/10 border-[#2dd4bf]/45' : 'bg-white border-teal-500/70 shadow-sm')
                      : (isDark ? 'bg-zinc-950/20 border-stone-900 text-stone-500' : 'bg-white border-stone-200 text-stone-400')
                  }`}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-base font-extrabold tracking-tight ${
                            policyCodeActive ? (isDark ? 'text-white' : 'text-stone-900') : 'text-stone-500'
                          }`}>
                            Policy-as-Code
                          </h4>
                          <span className={`text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded ${
                            policyCodeActive ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-stone-500/10 text-stone-500'
                          }`}>
                            {policyCodeActive ? 'ACTIVE' : 'BYPASSED'}
                          </span>
                        </div>
                        <p className={`text-xs font-medium leading-relaxed ${
                          policyCodeActive ? (isDark ? 'text-stone-400' : 'text-stone-600') : 'text-stone-500'
                        }`}>
                          Enforces structured JSON filters on every incoming prompt context loop. Output state bounds are constrained on edge proxy.
                        </p>
                      </div>
                      <button 
                        onClick={() => setPolicyCodeActive(!policyCodeActive)}
                        className={`font-mono text-[10px] font-bold uppercase py-1.5 px-3 rounded-lg border cursor-pointer transition-colors ${
                          policyCodeActive 
                            ? (isDark ? 'bg-teal-500/10 text-teal-400 border-teal-550/30 hover:bg-teal-500/20' : 'bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100')
                            : (isDark ? 'bg-stone-900/40 text-stone-500 border-stone-850 hover:text-stone-400' : 'bg-stone-50 text-stone-400 border-stone-200 hover:text-stone-500')
                        }`}
                      >
                        {policyCodeActive ? 'DISABLE' : 'ENABLE'}
                      </button>
                    </div>
                    <div className="mt-3 pt-3 border-t border-stone-850/60 flex flex-wrap gap-4 text-[10px] font-mono">
                      <span>BOUND: Restricts out-of-boundary response generation variables strictly.</span>
                      <span className={`ml-auto font-bold uppercase ${policyCodeActive ? 'text-teal-400' : 'text-stone-500'}`}>
                        PROOF: Policy_Enforce_01
                      </span>
                    </div>
                  </div>

                  {/* Control Surface 2 */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    thresholdActive 
                      ? (isDark ? 'bg-teal-950/10 border-[#2dd4bf]/45' : 'bg-white border-teal-500/70 shadow-sm')
                      : (isDark ? 'bg-zinc-950/20 border-stone-900 text-stone-500' : 'bg-white border-stone-200 text-stone-400')
                  }`}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-base font-extrabold tracking-tight ${
                            thresholdActive ? (isDark ? 'text-white' : 'text-stone-900') : 'text-stone-500'
                          }`}>
                            Threshold Registry
                          </h4>
                          <span className={`text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded ${
                            thresholdActive ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-stone-500/10 text-stone-500'
                          }`}>
                            {thresholdActive ? 'ACTIVE' : 'BYPASSED'}
                          </span>
                        </div>
                        <p className={`text-xs font-medium leading-relaxed ${
                          thresholdActive ? (isDark ? 'text-stone-400' : 'text-stone-600') : 'text-stone-500'
                        }`}>
                          Maintains static limit parameters, token quotas, and SLA compliance boundaries before execution loops cascade.
                        </p>
                      </div>
                      <button 
                        onClick={() => setThresholdActive(!thresholdActive)}
                        className={`font-mono text-[10px] font-bold uppercase py-1.5 px-3 rounded-lg border cursor-pointer transition-colors ${
                          thresholdActive 
                            ? (isDark ? 'bg-teal-500/10 text-teal-400 border-teal-550/30 hover:bg-teal-500/20' : 'bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100')
                            : (isDark ? 'bg-stone-900/40 text-stone-500 border-stone-850 hover:text-stone-400' : 'bg-stone-50 text-stone-400 border-stone-200 hover:text-stone-500')
                        }`}
                      >
                        {thresholdActive ? 'DISABLE' : 'ENABLE'}
                      </button>
                    </div>
                    <div className="mt-3 pt-3 border-t border-stone-850/60 flex flex-wrap gap-4 text-[10px] font-mono">
                      <span>BOUND: Stops runaway agent loops instantly before budget depletion.</span>
                      <span className={`ml-auto font-bold uppercase ${thresholdActive ? 'text-teal-400' : 'text-stone-500'}`}>
                        PROOF: Registry_Limit_Set
                      </span>
                    </div>
                  </div>

                  {/* Control Surface 3 */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    signedRecordsActive 
                      ? (isDark ? 'bg-teal-950/10 border-[#2dd4bf]/45' : 'bg-white border-teal-500/70 shadow-sm')
                      : (isDark ? 'bg-zinc-950/20 border-stone-900 text-stone-500' : 'bg-white border-stone-200 text-stone-400')
                  }`}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-base font-extrabold tracking-tight ${
                            signedRecordsActive ? (isDark ? 'text-white' : 'text-stone-900') : 'text-stone-500'
                          }`}>
                            Signed Records
                          </h4>
                          <span className={`text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded ${
                            signedRecordsActive ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-stone-500/10 text-stone-500'
                          }`}>
                            {signedRecordsActive ? 'ACTIVE' : 'BYPASSED'}
                          </span>
                        </div>
                        <p className={`text-xs font-medium leading-relaxed ${
                          signedRecordsActive ? (isDark ? 'text-stone-400' : 'text-stone-600') : 'text-stone-500'
                        }`}>
                          Locks every agent transaction with cryptographic HMAC keys on write, building historical audit consensus.
                        </p>
                      </div>
                      <button 
                        onClick={() => setSignedRecordsActive(!signedRecordsActive)}
                        className={`font-mono text-[10px] font-bold uppercase py-1.5 px-3 rounded-lg border cursor-pointer transition-colors ${
                          signedRecordsActive 
                            ? (isDark ? 'bg-teal-500/10 text-teal-400 border-teal-550/30 hover:bg-teal-500/20' : 'bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100')
                            : (isDark ? 'bg-stone-900/40 text-stone-500 border-stone-850 hover:text-stone-400' : 'bg-stone-50 text-stone-400 border-stone-200 hover:text-stone-500')
                        }`}
                      >
                        {signedRecordsActive ? 'DISABLE' : 'ENABLE'}
                      </button>
                    </div>
                    <div className="mt-3 pt-3 border-t border-stone-850/60 flex flex-wrap gap-4 text-[10px] font-mono">
                      <span>BOUND: Maintains fully auditable trace paths of decision lineage.</span>
                      <span className={`ml-auto font-bold uppercase ${signedRecordsActive ? 'text-teal-400' : 'text-stone-500'}`}>
                        PROOF: Signed_Hmac_Chain
                      </span>
                    </div>
                  </div>

                  {/* Control Surface 4 */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    escalationSlaActive 
                      ? (isDark ? 'bg-teal-950/10 border-[#2dd4bf]/45' : 'bg-white border-teal-500/70 shadow-sm')
                      : (isDark ? 'bg-zinc-950/20 border-stone-900 text-stone-500' : 'bg-white border-stone-200 text-stone-400')
                  }`}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-base font-extrabold tracking-tight ${
                            escalationSlaActive ? (isDark ? 'text-white' : 'text-stone-900') : 'text-stone-500'
                          }`}>
                            Escalation SLA
                          </h4>
                          <span className={`text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded ${
                            escalationSlaActive ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-stone-500/10 text-stone-500'
                          }`}>
                            {escalationSlaActive ? 'ACTIVE' : 'BYPASSED'}
                          </span>
                        </div>
                        <p className={`text-xs font-medium leading-relaxed ${
                          escalationSlaActive ? (isDark ? 'text-stone-400' : 'text-stone-600') : 'text-stone-500'
                        }`}>
                          Directs anomalous payloads to verified human operators via secure gateway channels under drift zones.
                        </p>
                      </div>
                      <button 
                        onClick={() => setEscalationSlaActive(!escalationSlaActive)}
                        className={`font-mono text-[10px] font-bold uppercase py-1.5 px-3 rounded-lg border cursor-pointer transition-colors ${
                          escalationSlaActive 
                            ? (isDark ? 'bg-teal-500/10 text-teal-400 border-teal-550/30 hover:bg-teal-500/20' : 'bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100')
                            : (isDark ? 'bg-stone-900/40 text-stone-500 border-stone-850 hover:text-stone-400' : 'bg-stone-50 text-stone-400 border-stone-200 hover:text-stone-500')
                        }`}
                      >
                        {escalationSlaActive ? 'DISABLE' : 'ENABLE'}
                      </button>
                    </div>
                    <div className="mt-3 pt-3 border-t border-stone-850/60 flex flex-wrap gap-4 text-[10px] font-mono">
                      <span>BOUND: Enforces safe transition paths under high cognitive task drift.</span>
                      <span className={`ml-auto font-bold uppercase ${escalationSlaActive ? 'text-teal-400' : 'text-stone-500'}`}>
                        PROOF: Sla_Route_Specs
                      </span>
                    </div>
                  </div>

                  {/* Control Surface 5 */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    killSwitchActive 
                      ? (isDark ? 'bg-[#f43f5e]/5 border-[#f43f5e]/45' : 'bg-white border-rose-500/70 shadow-sm')
                      : (isDark ? 'bg-zinc-950/20 border-stone-900 text-stone-500' : 'bg-white border-stone-200 text-stone-400')
                  }`}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-base font-extrabold tracking-tight ${
                            killSwitchActive ? (isDark ? 'text-white' : 'text-stone-900') : 'text-stone-500'
                          }`}>
                            Kill-Switch Hook
                          </h4>
                          <span className={`text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded ${
                            killSwitchActive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' : 'bg-stone-500/10 text-stone-500'
                          }`}>
                            {killSwitchActive ? 'ARMED & READY' : 'RETIRED'}
                          </span>
                        </div>
                        <p className={`text-xs font-medium leading-relaxed ${
                          killSwitchActive ? (isDark ? 'text-stone-450' : 'text-stone-600') : 'text-stone-500'
                        }`}>
                          Forces immediate container cluster restart and configuration fallback when error budgets deplete.
                        </p>
                      </div>
                      <button 
                        onClick={() => setKillSwitchActive(!killSwitchActive)}
                        className={`font-mono text-[10px] font-bold uppercase py-1.5 px-3 rounded-lg border cursor-pointer transition-colors ${
                          killSwitchActive 
                            ? (isDark ? 'bg-[#f43f5e]/15 text-[#f43f5e] border-[#f43f5e]/30' : 'bg-rose-50 text-rose-600 border-rose-200')
                            : (isDark ? 'bg-stone-900/40 text-stone-500 border-stone-850 hover:text-stone-400' : 'bg-stone-50 text-stone-400 border-stone-200 hover:text-stone-500')
                        }`}
                      >
                        {killSwitchActive ? 'DISARM' : 'ARM HOOK'}
                      </button>
                    </div>
                    <div className="mt-3 pt-3 border-t border-stone-850/60 flex flex-wrap gap-4 text-[10px] font-mono">
                      <span>BOUND: Mitigates large systemic failures from unforeseen model bugs.</span>
                      <span className={`ml-auto font-bold uppercase ${killSwitchActive ? 'text-rose-400' : 'text-stone-500'}`}>
                        PROOF: Circuit_Breaker_Hook
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div
              key="evidence-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              <div>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                  isDark ? 'text-teal-400' : 'text-teal-600'
                }`}>
                  PROOF ENGINE OUTPUT
                </span>
                <h3 className={`text-2xl md:text-3xl font-extrabold tracking-tight mt-1 ${
                  isDark ? 'text-white' : 'text-stone-900'
                }`}>
                  Evidence & Real-Time Telemetry
                </h3>
                <p className={`text-sm leading-relaxed mt-1 ${
                  isDark ? 'text-stone-500' : 'text-stone-500'
                }`}>
                  We translate behavior parameters into immutable evidence logs. This secure operations console surfaces high-fidelity telemetry records for production audits.
                </p>
              </div>

              {/* Grid 2: Real-time telemetry board / Console Outputs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* 6 columns: Console Telemetry output cards */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                  
                  {/* Security alarm banner */}
                  <div className={`p-5 rounded-2xl border flex items-center justify-between ${
                    calculatedViolations > 0
                      ? 'bg-rose-500/[0.04] border-rose-500/40'
                      : 'bg-emerald-500/[0.04] border-emerald-500/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${
                        calculatedViolations > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'
                      }`}></span>
                      <div>
                        <div className={`text-xs font-mono font-extrabold uppercase tracking-wider ${
                          calculatedViolations > 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          ACTIVE SYSTEM ALARMS
                        </div>
                        <p className="text-xs text-stone-500 font-semibold">{calculatedViolations} ACTIVE VIOLATIONS FOUND</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono tracking-wider font-bold bg-stone-950 px-2 py-0.5 rounded text-stone-500 border border-stone-900">
                      SYS_OPERATIONS_MONITOR // VPC-04
                    </span>
                  </div>

                  {/* Status Indicator grid of 4 metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Safeguard Coverage */}
                    <div className={`p-5 rounded-2xl border space-y-1 ${
                      isDark ? 'bg-zinc-950/40 border-stone-900' : 'bg-white border-stone-200'
                    }`}>
                      <span className="text-[10px] font-mono text-stone-500 font-bold block uppercase">
                        Safeguard Coverage Ratio
                      </span>
                      <div className={`text-2xl font-mono font-extrabold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                        {calculatedCoverage.toFixed(2)}%
                      </div>
                      <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-stone-500 font-semibold">
                        <span className="text-emerald-400">⬤ NOMINAL</span>
                        <span>±0.01% Delta</span>
                      </div>
                    </div>

                    {/* Approval Precision */}
                    <div className={`p-5 rounded-2xl border space-y-1 ${
                      isDark ? 'bg-zinc-950/40 border-stone-900' : 'bg-white border-stone-200'
                    }`}>
                      <span className="text-[10px] font-mono text-stone-500 font-bold block uppercase">
                        Approval Precision Score
                      </span>
                      <div className="text-2xl font-mono font-extrabold text-stone-200">
                        {calculatedApproval.toFixed(2)}%
                      </div>
                      <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-stone-500 font-semibold">
                        <span className="text-[#2dd4bf]">⬤ OPTIMIZED</span>
                        <span>Linear growth</span>
                      </div>
                    </div>

                    {/* Audit Trail Pass Rate */}
                    <div className={`p-5 rounded-2xl border space-y-1 ${
                      isDark ? 'bg-zinc-950/40 border-stone-900' : 'bg-white border-stone-200'
                    }`}>
                      <span className="text-[10px] font-mono text-stone-500 font-bold block uppercase">
                        Audit Trail Pass Rate
                      </span>
                      <div className="text-2xl font-mono font-extrabold text-[#2dd4bf]">
                        {signedRecordsActive ? '100.00%' : '65.20%'}
                      </div>
                      <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-stone-500 font-semibold">
                        <span className={signedRecordsActive ? 'text-emerald-400' : 'text-amber-500 animate-pulse'}>
                          {signedRecordsActive ? '⬤ STABLE' : '▲ DISRUPTED'}
                        </span>
                        <span>No warnings</span>
                      </div>
                    </div>

                    {/* Intervention Ratio */}
                    <div className={`p-5 rounded-2xl border space-y-1 ${
                      isDark ? 'bg-zinc-950/40 border-stone-900' : 'bg-white border-stone-200'
                    }`}>
                      <span className="text-[10px] font-mono text-stone-500 font-bold block uppercase">
                        Intervention Ratio Score
                      </span>
                      <div className="text-2xl font-mono font-extrabold text-stone-400">
                        {(0.12 + (entropyLevel / 350)).toFixed(2)} Ratio
                      </div>
                      <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-stone-500 font-semibold">
                        <span className="text-[#2dd4bf]">⬤ OPTIMIZED</span>
                        <span>Under limit</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* 6 columns: Active Governance Bindings */}
                <div className={`lg:col-span-6 p-6 rounded-3xl border flex flex-col justify-between ${
                  isDark ? 'bg-zinc-950/30 border-stone-900' : 'bg-stone-50 border-stone-150'
                }`}>
                  <div>
                    <h4 className="text-[11px] font-mono text-stone-400 font-extrabold uppercase tracking-wider mb-4 border-b border-stone-800/10 pb-2">
                      Immutable Spec Bindings: Active Governance Bindings
                    </h4>
                    <p className="text-xs text-stone-500 leading-relaxed mb-4">
                      These contracts bind model decisions directly to core system constraints at the gateway boundary layer.
                    </p>

                    <div className="space-y-4">
                      
                      {/* Binding 1 */}
                      <div className="flex items-center justify-between gap-4 py-2 border-b border-stone-850/50">
                        <div>
                          <div className={`text-xs font-bold ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>Specification File</div>
                          <p className="text-[10px] text-stone-500">Binds dynamic context queues to secure client parameters statically.</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-block text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 rounded px-2 py-0.5 border border-emerald-500/25">
                            ENFORCED
                          </span>
                          <div className="text-[9px] font-mono text-stone-550 mt-1">BOUND_ENFORCE</div>
                        </div>
                      </div>

                      {/* Binding 2 */}
                      <div className="flex items-center justify-between gap-4 py-2 border-b border-stone-850/50">
                        <div>
                          <div className={`text-xs font-bold ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>Ingress Contract</div>
                          <p className="text-[10px] text-stone-500">Binds incoming request schemas to deterministic validation rules.</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-block text-[9px] font-mono font-bold bg-[#2dd4bf]/15 text-teal-400 rounded px-2 py-0.5 border border-[#2dd4bf]/25">
                            DEFINED
                          </span>
                          <div className="text-[9px] font-mono text-stone-550 mt-1">BOUND_ENFORCE</div>
                        </div>
                      </div>

                      {/* Binding 3 */}
                      <div className="flex items-center justify-between gap-4 py-2 border-b border-stone-850/50">
                        <div>
                          <div className={`text-xs font-bold ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>Response SLA</div>
                          <p className="text-[10px] text-stone-500">Binds latency and processing budgets to prevent cascading delays.</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-block text-[9px] font-mono font-bold bg-teal-500/10 text-teal-400 rounded px-2 py-0.5">
                            MONITORED
                          </span>
                          <div className="text-[9px] font-mono text-stone-550 mt-1">BOUND_ENFORCE</div>
                        </div>
                      </div>

                      {/* Binding 4 */}
                      <div className="flex items-center justify-between gap-4 py-2 border-b border-stone-850/50">
                        <div>
                          <div className={`text-xs font-bold ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>Registry Spec</div>
                          <p className="text-[10px] text-stone-500">Binds allowed operational drift scores directly to node alerts.</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-block text-[9px] font-mono font-bold bg-teal-500/10 text-teal-400 rounded px-2 py-0.5">
                            MONITORED
                          </span>
                          <div className="text-[9px] font-mono text-stone-550 mt-1">BOUND_ENFORCE</div>
                        </div>
                      </div>

                      {/* Binding 5 */}
                      <div className="flex items-center justify-between gap-4 py-2 pb-0">
                        <div>
                          <div className={`text-xs font-bold ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>Rollback Hook</div>
                          <p className="text-[10px] text-stone-500">Binds circuit breakers to immediate snapshot recovery channels.</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-block text-[9px] font-mono font-bold bg-[#f43f5e]/10 text-rose-450 rounded px-2 py-0.5 border border-[#f43f5e]/20">
                            ENFORCED
                          </span>
                          <div className="text-[9px] font-mono text-stone-550 mt-1">BOUND_ENFORCE</div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>

              {/* Console output stream */}
              <div className={`p-5 rounded-2xl border ${
                isDark ? 'bg-black border-stone-900' : 'bg-white border-stone-200 shadow-sm'
              }`}>
                <div className="flex justify-between items-center border-b border-stone-800/10 pb-3 mb-4">
                  <span className="text-[10px] font-mono font-bold text-stone-500 uppercase flex items-center gap-2">
                    <Terminal size={12} className="text-teal-400" /> LIVE BOUNDARY INTRUSION AUDIT LOGGER
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">● SECURE STREAM NOMINAL</span>
                </div>
                
                <div className="font-mono text-xs space-y-2 max-h-48 overflow-y-auto block leading-relaxed pr-2">
                  {liveTraces.map((trace) => (
                    <div key={trace.id} className="flex gap-4 items-start">
                      <span className="text-stone-550 text-[10px] shrink-0">{trace.time}</span>
                      <span className={`px-1.5 py-0.2 rounded font-extrabold text-[9px] tracking-wider shrink-0 ${
                        trace.status === 'warn' ? 'bg-amber-500/10 text-amber-500' :
                        trace.status === 'danger' ? 'bg-rose-500/10 text-rose-500' :
                        trace.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-stone-500/10 text-stone-400'
                      }`}>
                        [{trace.source}]
                      </span>
                      <span className={
                        trace.status === 'warn' ? 'text-amber-400 font-medium' :
                        trace.status === 'danger' ? 'text-rose-400 font-semibold' :
                        trace.status === 'success' ? 'text-stone-300' :
                        'text-stone-450'
                      }>
                        {trace.text}
                      </span>
                    </div>
                  ))}
                  <div ref={traceEndRef} />
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ISOLATED COMPLIANCE SECTION: ENTERPRISE ISOLATION */}
      <section className={`py-20 border-t border-b ${
        isDark ? 'bg-[#050505] border-stone-900/50' : 'bg-stone-50 border-stone-150'
      }`}>
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="max-w-4xl mb-12">
            <span className={`text-[10px] font-mono tracking-widest font-extrabold uppercase ${
              isDark ? 'text-[#2dd4bf]' : 'text-teal-600'
            }`}>
              VPC DEPLOY READY
            </span>
            <h3 className={`text-2xl md:text-4xl font-extrabold tracking-tight mt-1 ${
              isDark ? 'text-white' : 'text-stone-900'
            }`}>
              Enterprise Isolation
            </h3>
            <p className={`text-sm mt-2 max-w-2xl leading-relaxed ${
              isDark ? 'text-stone-400' : 'text-stone-600'
            }`}>
              Phase Mirror runtime deploys directly within your isolated private VPC clusters. Zero payload escapes boundary parameters, fulfilling strict financial and organizational regulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Box 1 */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 ${
              isDark ? 'bg-zinc-950/60 border-stone-900 hover:border-stone-800' : 'bg-white border-stone-200 hover:border-stone-300 shadow-sm'
            }`}>
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-stone-550 block">SECURE_EDGE_INFRA</span>
                <h4 className={`text-sm font-extrabold uppercase tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>VPC Enclosure</h4>
                <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                  Deploys directly within existing enterprise subnetworks, guaranteeing total payload isolation.
                </p>
              </div>
            </div>

            {/* Box 2 */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 ${
              isDark ? 'bg-zinc-950/60 border-stone-900 hover:border-stone-800' : 'bg-white border-stone-200 hover:border-stone-300 shadow-sm'
            }`}>
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-stone-550 block">CRYPTO_TRACE_INTEG</span>
                <h4 className={`text-sm font-extrabold uppercase tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>Audit Trailing Logs</h4>
                <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                  Generates local, HSM-signed binary logs detailing chronological agent decision hashes.
                </p>
              </div>
            </div>

            {/* Box 3 */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 ${
              isDark ? 'bg-zinc-950/60 border-stone-900 hover:border-stone-800' : 'bg-white border-stone-200 hover:border-stone-300 shadow-sm'
            }`}>
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-stone-550 block">ROLE_BOUND_SYS</span>
                <h4 className={`text-sm font-extrabold uppercase tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>RBAC Boundaries</h4>
                <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                  Enforces structural role limitations controlling who can adjust metrics dials.
                </p>
              </div>
            </div>

            {/* Box 4 */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 ${
              isDark ? 'bg-zinc-950/60 border-stone-900 hover:border-stone-800' : 'bg-white border-stone-200 hover:border-stone-300 shadow-sm'
            }`}>
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-stone-550 block">FAIL_SAFE_RECOVERY</span>
                <h4 className={`text-sm font-extrabold uppercase tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>Rollback Semantics</h4>
                <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                  Enforces sub-15ms reversion schedules returning cluster contexts to certified snapshots.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CALL TO ACTION: INTEGRATION FORM & CONFIGURATION EXPORTER */}
      <section className="py-20 container mx-auto px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-5 space-y-6">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
              isDark ? 'text-[#2dd4bf]' : 'text-teal-650'
            }`}>
              Initiate Control-Plane Integration
            </span>
            <h3 className={`text-2xl md:text-3xl font-extrabold tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-stone-900'
            }`}>
              Ready to secure your machine pipeline workloads?
            </h3>
            <p className={`text-sm leading-relaxed ${
              isDark ? 'text-stone-400' : 'text-stone-600'
            }`}>
              Establish definitive runtime rules across specifications, contracts, and safety alerts. Configure your private enclave parameters below and download the secure YAML specifications.
            </p>

            <div className={`p-5 rounded-2xl border text-xs leading-relaxed space-y-2 ${
              isDark ? 'bg-zinc-950/40 border-stone-900' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="font-mono text-[10px] text-stone-500 uppercase font-extrabold">Remediation Assurance:</div>
              <p className={isDark ? 'text-stone-350' : 'text-stone-600'}>
                Once active, the cluster ingress filters every response stream. Violations are instantly routed to secure storage, and anomalous processes undergo sub-15ms recovery to enforce continuous determinism.
              </p>
            </div>
          </div>

          {/* Interactive Form for generating configuration rules */}
          <div className="lg:col-span-7">
            <div className={`p-6 md:p-8 rounded-3xl border ${
              isDark ? 'bg-zinc-950 border-stone-900' : 'bg-white border-stone-250 shadow-md'
            }`}>
              <div className="flex justify-between items-center border-b border-stone-800/10 pb-4 mb-6">
                <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
                  <Globe size={13} className="text-teal-400" /> Register Cluster Ingress
                </span>
                <span className="text-[10px] text-stone-500 font-mono">Sandbox Workbench</span>
              </div>

              <div className="space-y-6">
                
                {/* Form Fields row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono text-stone-500 font-bold block">
                      Target Cloud Region
                    </label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-medium border focus:outline-none focus:border-teal-400 ${
                        isDark ? 'bg-black border-stone-850 text-stone-100' : 'bg-white border-stone-250 text-stone-800'
                      }`}
                    >
                      <option value="us-east5">us-east5 (Columbus, Ohio)</option>
                      <option value="us-central1">us-central1 (Iowa)</option>
                      <option value="europe-west9">europe-west9 (Paris)</option>
                      <option value="asia-east1">asia-east1 (Taiwan)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono text-stone-500 font-bold block">
                      VPC Transit Mechanism
                    </label>
                    <select
                      value={networkType}
                      onChange={(e) => setNetworkType(e.target.value)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-medium border focus:outline-none focus:border-teal-400 ${
                        isDark ? 'bg-black border-stone-850 text-stone-100' : 'bg-white border-stone-250 text-stone-800'
                      }`}
                    >
                      <option value="gke-private-transit">GKE Private Virtual Endpoint</option>
                      <option value="aws-transit-gateway">AWS Transit Gateway Enclosure</option>
                      <option value="vpn-ipsec-tunnel">Custom IPSec Tunnel Layer</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono text-stone-500 font-bold block">
                    Telemetry Encryption Key
                  </label>
                  <input
                    type="text"
                    value={clusterKey}
                    onChange={(e) => setClusterKey(e.target.value)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono border focus:outline-none focus:border-teal-400 ${
                      isDark ? 'bg-black border-stone-850 text-stone-100' : 'bg-white border-stone-250 text-stone-800'
                    }`}
                    placeholder="e.g. pm-prod-key-..."
                  />
                </div>

                {/* Submitting trigger button */}
                <div className="pt-2">
                  <button
                    onClick={handleGenerateYAML}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer ${
                      isDark 
                        ? 'bg-teal-400 text-stone-950 hover:bg-teal-300 hover:shadow-[0_0_15px_rgba(45,212,191,0.25)]'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    {showConfigLoader ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" /> Compiling Ingress Specifications...
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} /> Initialize Control-Plane Configuration
                      </>
                    )}
                  </button>
                </div>

                {/* Secure YAML Configuration display box */}
                <AnimatePresence>
                  {exportedConfig && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 pt-4 border-t border-stone-850/60"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold text-stone-500">
                          COMPILED SPECIFICATION MANIFEST:
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10">
                          VALIDATED
                        </span>
                      </div>
                      
                      {/* Codeblock layout */}
                      <pre className="p-4 rounded-xl font-mono text-[11px] leading-relaxed max-h-60 overflow-y-auto border bg-black border-stone-900 text-teal-350 block text-left">
                        {exportedConfig}
                      </pre>

                      <div className="flex justify-between items-center text-[10px] font-mono text-stone-500">
                        <span>Save to: `pm_ingress_manifest.yaml`</span>
                        <button 
                          onClick={() => {
                            // Simple text trigger copying or alert simulation
                            navigator.clipboard.writeText(exportedConfig);
                            alert('Configuration manifest successfully copied to clipboard.');
                          }}
                          className="text-teal-400 hover:underline flex items-center gap-1"
                        >
                          <Download size={11} /> Copy to Clipboard
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default EnterpriseView;
