/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WasmQAri } from './wasm/q_calculator_rs.js';
import CopilotView from './components/CopilotView';
import { ResearcherView } from './components/ResearcherView';
import {
  ChatBubbleLeftRightIcon,
  ShareIcon,
  ShieldCheckIcon,
  ScaleIcon,
  CpuChipIcon,
  RectangleStackIcon,
  GlobeAltIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  HashtagIcon,
  PlayIcon,
  DocumentTextIcon,
  FolderIcon,
  TrashIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  KeyIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  ClipboardDocumentCheckIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  EllipsisHorizontalIcon,
  CloudIcon,
  LinkIcon,
  BeakerIcon,
  PauseIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  FingerPrintIcon,
  PlusIcon,
  UserIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import {
  ShieldCheckIcon as ShieldCheckSolid,
  BoltIcon as BoltSolid,
  TrophyIcon,
  SparklesIcon as SparklesSolid
} from '@heroicons/react/24/solid';

// --- Types ---
type View = 'compose' | 'sources' | 'workflows' | 'ledger' | 'csl' | 'arbitration' | 'quantum' | 'simulator' | 'projects' | 'researcher';

interface SourceFile {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
  status: 'synced' | 'local' | 'uploading';
  isShared: boolean;
  isEnabled: boolean;
}

interface Stratum {
  id: number;
  name: string;
  desc: string;
  color: string;
}

// --- Data Constants ---
const STRATA_REGISTRY: Stratum[] = [
  { id: 0, name: 'Stratum 0', desc: 'Adelic Lattice & p-adic Foundations', color: 'text-indigo-400' },
  { id: 1, name: 'Stratum 1', desc: 'Pre-Geometric Spinors', color: 'text-blue-400' },
  { id: 2, name: 'Stratum 2', desc: 'Qualia Operad', color: 'text-sky-400' },
  { id: 3, name: 'Stratum 3', desc: 'Spacetime Emergence', color: 'text-teal-400' },
  { id: 4, name: 'Stratum 4', desc: 'Quantum Social Coherence', color: 'text-emerald-400' },
  { id: 7, name: 'Stratum 7', desc: 'Ethical Lagrangian', color: 'text-yellow-400' },
  { id: 13, name: 'Stratum 13', desc: 'Omega Governance (DAO)', color: 'text-purple-400' },
  { id: 99, name: 'Node Ω', desc: 'Transfinite Arbitration', color: 'text-rose-400' },
];

// --- Components ---

// Atomic Logo Component
const AtomicLogo = ({ collapsed }: { collapsed?: boolean }) => (
  <div className={`
    bg-sky-900/20 rounded-lg flex items-center justify-center border border-sky-500/30 text-sky-400 relative overflow-hidden group shadow-[0_0_15px_rgba(14,165,233,0.15)]
    transition-all duration-300
    ${collapsed ? 'w-8 h-8' : 'w-8 h-8'}
  `}>
    <div className="absolute inset-0 bg-sky-500/10 blur-sm"></div>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 relative z-10">
      <circle cx="12" cy="12" r="3" className="fill-sky-500/20 stroke-none" />
      <path d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z" className="opacity-30" />
      <path d="M12 21c4.97 0 9-2.03 9-4.5S16.97 12 12 12s-9 2.03-9 4.5 4.03 4.5 9 4.5z" className="opacity-60 rotate-45 origin-center" />
      <path d="M12 21c4.97 0 9-2.03 9-4.5S16.97 12 12 12s-9 2.03-9 4.5 4.03 4.5 9 4.5z" className="opacity-60 -rotate-45 origin-center" />
    </svg>
  </div>
);
// 1. Sidebar Navigation (Left)
const Sidebar = ({ 
  activeView, 
  onViewChange, 
  isCollapsed 
}: { 
  activeView: View; 
  onViewChange: (v: View) => void;
  isCollapsed: boolean; 
}) => {
  const items: { id: View; label: string; icon: React.ElementType }[] = [
    { id: 'compose', label: 'Copilot', icon: ChatBubbleLeftRightIcon },
    { id: 'simulator', label: 'Simulator', icon: BeakerIcon },
    { id: 'researcher', label: 'Research Tools', icon: BoltIcon },
    { id: 'projects', label: 'Projects', icon: Squares2X2Icon },
    { id: 'sources', label: 'Sources', icon: FolderIcon },
    { id: 'workflows', label: 'Workflows', icon: ShareIcon },
    { id: 'ledger', label: 'Ledger', icon: RectangleStackIcon },
    { id: 'csl', label: 'Jurisdiction & CSL', icon: ShieldCheckIcon },
    { id: 'arbitration', label: 'Arbitration', icon: ScaleIcon },
    { id: 'quantum', label: 'Quantum', icon: CpuChipIcon },
  ];

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-[#09090b] flex flex-col h-screen shrink-0 z-20 transition-all duration-300 ease-in-out`}>
      <div className={`p-4 flex items-center h-14 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <AtomicLogo collapsed={isCollapsed} />
        {!isCollapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="font-bold text-zinc-100 text-sm tracking-tight font-mono">Q-Calculator</h1>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
               <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">Online</p>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            title={isCollapsed ? item.label : ''}
            className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === item.id
                ? 'bg-zinc-800/80 text-white shadow-sm border border-zinc-700/50'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            } ${isCollapsed ? 'justify-center' : 'gap-3'}`}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 ${activeView === item.id ? 'text-sky-400' : 'text-zinc-500'}`} />
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className={`p-4 border-t border-zinc-800 ${isCollapsed ? 'hidden' : 'block'}`}>
        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">System Status</span>
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          </div>
          <div className="text-xs text-zinc-300 font-mono space-y-1">
            <div className="flex justify-between"><span>Node ∞</span> <span className="text-green-400">Active</span></div>
            <div className="flex justify-between"><span>CSL</span> <span className="text-sky-400">Enforced</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Right Sidebar (Safety & Context)
interface RightPanelProps {
  jurisdiction: string;
  cslLevel: string;
}

const RightPanel = ({ jurisdiction, cslLevel }: RightPanelProps) => {
  // Mock data for the safety meter
  const [contraction, setContraction] = useState(0.84);
  const [primeCounts, setPrimeCounts] = useState({ 2: 3, 3: 2, 5: 1, 7: 1 });

  useEffect(() => {
    const interval = setInterval(() => {
      setContraction(0.8 + Math.random() * 0.05);
      if (Math.random() > 0.7) {
        setPrimeCounts(prev => ({
          ...prev,
          [Math.random() > 0.5 ? 2 : 3]: prev[2] + 1
        }));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const isSafe = contraction < 1.0;
  
  // Derived metrics for safety
  const opNorm = (contraction * 0.72).toFixed(4);
  const lambdaT = (contraction * 0.28).toFixed(4);
  const gapLB = (1.0 - contraction).toFixed(4);

  return (
    <div className="w-80 bg-[#09090b] flex flex-col h-screen shrink-0 overflow-y-auto z-20">
      {/* Safety Meter */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4" />
            Safety Meter
          </h3>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
            isSafe 
              ? 'bg-green-900/10 text-green-400 border-green-900/30' 
              : 'bg-red-900/10 text-red-400 border-red-900/30'
          }`}>
            {isSafe ? 'SAFE' : 'CRITICAL'}
          </span>
        </div>

        <div className="relative mb-6">
          <div className="flex justify-between text-xs text-zinc-400 mb-1 font-mono">
            <span>Contraction Budget</span>
            <span className="text-zinc-200">{contraction.toFixed(3)}</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${isSafe ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${(contraction / 1.2) * 100}%` }}
            ></div>
          </div>
          {/* Threshold Marker */}
          <div className="absolute top-4 left-[83.33%] w-px h-3 bg-red-500/50"></div> 
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-zinc-900/30 p-2 rounded border border-zinc-800">
            <div className="text-[10px] text-zinc-500 font-mono uppercase">|Ξ| Norm</div>
            <div className="text-sm font-mono text-zinc-200">{opNorm}</div>
          </div>
          <div className="bg-zinc-900/30 p-2 rounded border border-zinc-800">
            <div className="text-[10px] text-zinc-500 font-mono uppercase">|Λ||T|</div>
            <div className="text-sm font-mono text-zinc-200">{lambdaT}</div>
          </div>
        </div>

        <div className="bg-zinc-900/30 p-3 rounded border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase">GAP<sub>LB</sub> = 1 - ||K̂||</div>
            <div className="text-lg font-mono text-white font-medium">{gapLB}</div>
          </div>
          <ChevronRightIcon className="w-4 h-4 text-zinc-600" />
        </div>
      </div>

      {/* Jurisdiction & CSL */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
            <GlobeAltIcon className="w-5 h-5 text-sky-400" />
            Jurisdiction & CSL
          </h3>
          <Cog6ToothIcon className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors" />
        </div>

        <div className="flex gap-2 mb-6">
          <div className="px-3 py-1.5 rounded-full bg-sky-900/20 border border-sky-500/30 flex items-center gap-2 text-sky-300 text-xs font-medium truncate max-w-[140px]" title={jurisdiction}>
            <GlobeAltIcon className="w-3 h-3" />
            {jurisdiction}
          </div>
          <div className="px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700 flex items-center gap-2 text-zinc-300 text-xs font-medium truncate max-w-[140px]" title={cslLevel}>
            <ShieldCheckIcon className="w-3 h-3" />
            {cslLevel.split(' ')[0]}
          </div>
        </div>

        <div className="mb-2">
          <div className="text-xs text-zinc-500 font-medium mb-2 uppercase tracking-wide">Execution Mode</div>
          <div className="grid grid-cols-3 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
            <button className="text-[10px] py-1.5 rounded text-zinc-500 hover:text-zinc-300 transition-colors">Silent</button>
            <button className="text-[10px] py-1.5 rounded bg-zinc-800 text-zinc-200 shadow-sm border border-zinc-700 font-medium">Supervised</button>
            <button className="text-[10px] py-1.5 rounded text-zinc-500 hover:text-zinc-300 transition-colors">Tribunal</button>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-3 mt-3">
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            Explain-as-you-go with checkpoints for approval when risk flags appear.
          </p>
        </div>
      </div>

      {/* Prime Ledger (PETC) */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <HashtagIcon className="w-4 h-4" />
            Prime Ledger (PETC)
          </h3>
          <InformationCircleIcon className="w-4 h-4 text-zinc-600 hover:text-zinc-400 cursor-pointer" />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {Object.entries(primeCounts).map(([prime, count]) => (
            <div key={prime} className="bg-zinc-900/50 border border-zinc-800 p-2 rounded flex flex-col items-center">
              <span className="text-lg font-mono text-cyan-400 leading-none mb-1">
                {prime}<sup className="text-zinc-500 text-xs ml-0.5">{count as number}</sup>
              </span>
              <span className="text-[9px] text-zinc-500 font-mono uppercase">M(e) = {Math.pow(Number(prime), count as number).toString().slice(0, 4)}</span>
            </div>
          ))}
        </div>

        <div className="bg-[#051111] border border-cyan-900/30 rounded p-3 relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-[9px] text-cyan-700/80 font-mono uppercase mb-1">Conservation Signature</div>
            <div className="font-mono text-cyan-400 text-lg">Π = 2,520</div>
            <div className="text-[10px] text-zinc-500 mt-2 leading-tight">Additive exponents certified for tensor conservation</div>
          </div>
          <div className="absolute right-[-10px] top-[-10px] w-16 h-16 bg-cyan-500/10 rounded-full blur-xl"></div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
             <div className="w-8 h-8 rounded-full bg-cyan-900/20 flex items-center justify-center border border-cyan-500/20">
                <BoltSolid className="w-4 h-4 text-cyan-500" />
             </div>
          </div>
        </div>
      </div>

      {/* Provenance Widget */}
      <div className="p-4 flex-1">
        <div className="border border-zinc-800 rounded-xl bg-[#0c0c0e] p-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <ClipboardDocumentCheckIcon className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-bold text-zinc-200">Provenance</h3>
                </div>
                <span className="text-xs font-mono text-zinc-600">step_042</span>
            </div>
            
            <div className="space-y-4">
                {/* Record Hash */}
                <div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Record Hash</div>
                    <div className="font-mono text-xs text-zinc-300 break-all bg-zinc-900/30 p-2 rounded border border-zinc-800/50">0x7f3a8b2c9e1d</div>
                </div>
                {/* Parent Hash */}
                <div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Parent Hash</div>
                    <div className="font-mono text-xs text-zinc-500 break-all bg-zinc-900/30 p-2 rounded border border-zinc-800/50">0x4e2f6a1b8c9d</div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-zinc-900/50 rounded p-2 border border-zinc-800">
                        <div className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Actor</div>
                        <div className="text-xs text-zinc-300 font-medium">PIRTM_Engine</div>
                    </div>
                    <div className="bg-zinc-900/50 rounded p-2 border border-zinc-800">
                        <div className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Timestamp</div>
                        <div className="text-xs text-zinc-300 font-medium">10:32:18 AM</div>
                    </div>
                </div>
            </div>

            <button className="w-full mt-5 flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors group py-2 border border-transparent hover:border-zinc-800 rounded">
                <span className="text-teal-400 group-hover:text-teal-300 transition-colors flex items-center gap-2">
                   <ArrowTopRightOnSquareIcon className="w-3 h-3 group-hover:scale-110 transition-transform" />
                   View raw JSON
                </span>
            </button>
        </div>
      </div>
    </div>
  );
};

// 3. Core Views

// --- Simulator View ---
const SimulatorView = () => {
    const [activeStrata, setActiveStrata] = useState<number[]>([0, 4, 7]);
    const [lambdaM, setLambdaM] = useState(0.8);
    const [timeEnd, setTimeEnd] = useState(200);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [dataPoints, setDataPoints] = useState<{t: number, entropy: number, gamma: number, ethics: number}[]>([]);
    const [simPrompt, setSimPrompt] = useState("");

    const toggleStratum = (id: number) => {
        setActiveStrata(prev => 
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id].sort((a,b) => a-b)
        );
    };

    const resetSimulation = () => {
        setIsRunning(false);
        setProgress(0);
        setLogs([]);
        setDataPoints([]);
    };

    useEffect(() => {
        if (!isRunning) return;

        try {
            const tStart = performance.now();
            // Using WasmQAri to compute contractivity loop
            // WasmQAri.new(epsilon, op_norm_t, max_steps, tol)
            const core = WasmQAri.new(0.05, lambdaM, timeEnd, 1e-6);
            
            const x0 = new Float64Array([1.0, 1.0]);
            const xi = new Float64Array([0.1, 0.1]);
            const lam = new Float64Array([0.1, 0.1]);
            const g = new Float64Array([0.0, 0.0]);
            
            // run_simulation returns the fixed point as Float64Array
            const result = core.run_simulation(x0, xi, lam, g, 2);
            const tEnd = performance.now();
            
            setLogs(prev => [`[${new Date().toLocaleTimeString()}] WASM Execution time: ${(tEnd - tStart).toFixed(2)}ms`, ...prev.slice(0, 4)]);
            setLogs(prev => [`[${new Date().toLocaleTimeString()}] WASM Convergence Result: [${result[0].toFixed(4)}, ${result[1].toFixed(4)}]`, ...prev.slice(0, 4)]);
            
            setProgress(100);
            
            setDataPoints(prev => [
                ...prev.slice(-49), 
                { t: 100, entropy: Math.abs(result[0]), gamma: Math.abs(result[1]), ethics: 0.9 }
            ]);
            setIsRunning(false);
        } catch (err: any) {
             setLogs(prev => [`[${new Date().toLocaleTimeString()}] WASM Error: ${err.toString()}`, ...prev.slice(0, 4)]);
             setIsRunning(false);
        }
    }, [isRunning, lambdaM, timeEnd]);

    return (
        <div className="flex h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Left Config Panel */}
            <div className="w-80 border-r border-zinc-800 p-6 flex flex-col bg-zinc-900/10 overflow-y-auto">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-1">Scenario Builder</h2>
                    <p className="text-xs text-zinc-500">Configure recursive strata parameters.</p>
                </div>

                {/* Global Params */}
                <div className="mb-6 space-y-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <AdjustmentsHorizontalIcon className="w-4 h-4" /> Global Parameters
                    </h3>
                    <div>
                        <label className="text-xs text-zinc-300 flex justify-between mb-1">
                            <span>Universal Constant (Λm)</span>
                            <span className="font-mono text-sky-400">{lambdaM}</span>
                        </label>
                        <input 
                            type="range" min="0.1" max="2.0" step="0.1" 
                            value={lambdaM} onChange={(e) => setLambdaM(parseFloat(e.target.value))}
                            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-zinc-300 flex justify-between mb-1">
                            <span>Time Horizon (T)</span>
                            <span className="font-mono text-zinc-400">{timeEnd}s</span>
                        </label>
                        <input 
                            type="range" min="50" max="1000" step="50" 
                            value={timeEnd} onChange={(e) => setTimeEnd(parseInt(e.target.value))}
                            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-500"
                        />
                    </div>
                </div>

                {/* Strata Toggles */}
                <div className="flex-1">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Active Strata</h3>
                    <div className="space-y-2">
                        {STRATA_REGISTRY.map(s => (
                            <button 
                                key={s.id}
                                onClick={() => toggleStratum(s.id)}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${
                                    activeStrata.includes(s.id) 
                                        ? 'bg-zinc-800 border-sky-500/30' 
                                        : 'bg-zinc-900/30 border-zinc-800 opacity-60 hover:opacity-100'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`text-xs font-bold ${activeStrata.includes(s.id) ? 'text-white' : 'text-zinc-500'}`}>{s.name}</span>
                                    {activeStrata.includes(s.id) && <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></div>}
                                </div>
                                <div className={`text-[10px] ${s.color}`}>{s.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Viz Area */}
            <div className="flex-1 flex flex-col p-8 bg-[#050505] relative overflow-hidden">
                 {/* Grid Background */}
                <div className="absolute inset-0 opacity-[0.03]" 
                    style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
                </div>

                {/* Header Actions */}
                <div className="flex items-center justify-between mb-8 z-10 gap-4">
                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            value={simPrompt}
                            onChange={(e) => setSimPrompt(e.target.value)}
                            placeholder="Describe simulation scenario (e.g. 'Adelic phase transition with high entropy')..."
                            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg pl-4 pr-12 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors shadow-inner font-mono"
                        />
                         <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                             <button 
                                onClick={() => setIsRunning(!isRunning)}
                                className={`p-1.5 rounded-md transition-all flex items-center justify-center ${
                                    isRunning 
                                        ? 'bg-zinc-800 text-zinc-400 hover:text-white' 
                                        : 'bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-900/20'
                                }`}
                                title={isRunning ? "Pause" : "Run"}
                            >
                                {isRunning ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                         <button 
                            onClick={resetSimulation}
                            className="p-2 text-zinc-500 hover:text-white transition-colors bg-zinc-900/30 rounded-lg border border-zinc-800 hover:border-zinc-700"
                            title="Reset Simulation"
                        >
                            <ArrowPathIcon className="w-5 h-5" />
                        </button>
                        <div className="font-mono text-zinc-500 text-xs bg-zinc-900/30 px-3 py-2 rounded-lg border border-zinc-800/50 min-w-[120px] text-center">
                            t: {(progress * (timeEnd / 100)).toFixed(1)} / {timeEnd}.0
                        </div>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="flex-1 border border-zinc-800 bg-zinc-900/20 rounded-xl relative overflow-hidden mb-6 flex items-end px-2 pb-2 gap-1 z-10">
                    {dataPoints.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-mono text-sm">
                            Ready to initialize field Ξ(t)...
                        </div>
                    )}
                    {dataPoints.map((pt, i) => (
                        <div key={i} className="flex-1 flex flex-col justify-end gap-0.5 h-full opacity-80 hover:opacity-100 transition-opacity group">
                            {/* Ethics Bar */}
                            <div style={{height: `${pt.ethics * 40}%`}} className="w-full bg-yellow-500/20 border-t border-yellow-500/50 rounded-t-sm relative"></div>
                             {/* Gamma Bar */}
                             <div style={{height: `${pt.gamma * 30}%`}} className="w-full bg-emerald-500/20 border-t border-emerald-500/50 rounded-t-sm"></div>
                            {/* Entropy Bar */}
                            <div style={{height: `${pt.entropy * 20}%`}} className="w-full bg-sky-500/30 border-t border-sky-500 rounded-t-sm"></div>
                        </div>
                    ))}
                </div>

                {/* Event Logs */}
                <div className="h-40 border-t border-zinc-800 pt-4 z-10">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Event Stream</h3>
                    <div className="space-y-1 font-mono text-xs">
                        {logs.length === 0 ? <span className="text-zinc-700 italic">No events recorded.</span> : 
                         logs.map((log, i) => (
                            <div key={i} className="text-zinc-400 border-l-2 border-zinc-800 pl-2 py-0.5">
                                {log}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- Compose View (Main) ---
const ComposeView = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<{id: number, name: string, status: 'pending'|'running'|'done'|'error', details?: string}[]>([]);
  const [finalResult, setFinalResult] = useState<string | null>(null);
  
  // Features Toggles
  const [deepThinkEnabled, setDeepThinkEnabled] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  // Upload Menu State
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRun = () => {
    if (!prompt.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    setIsRunning(true);
    setSteps([]);
    setFinalResult(null);
    setPrompt('');

    // Simulate Orchestrator Plan
    const newSteps = [
      { id: 1, name: 'Orchestrator: Plan Generation', status: 'pending' as const, details: 'Model: Qwen2.5-72B-Instruct' },
      { id: 2, name: 'PIRTM: Tensor Compute', status: 'pending' as const, details: 'Model: gemini-3-pro-preview (Symbolic)' },
      { id: 3, name: 'Graviton: Arbitration', status: 'pending' as const, details: 'Node ∞ Check' },
      { id: 4, name: 'CSL: Policy Verification', status: 'pending' as const, details: 'GDPR + Ethical Overlay' },
    ];
    setSteps(newSteps);

    // Simulate Execution Sequence
    let currentStep = 0;
    const interval = setInterval(() => {
      const stepIndex = currentStep;
      setSteps(prev => {
        const next = [...prev];
        if (stepIndex > 0) next[stepIndex - 1].status = 'done';
        if (stepIndex < next.length) {
          next[stepIndex].status = 'running';
        }
        return next;
      });

      if (stepIndex >= newSteps.length) {
        clearInterval(interval);
        setIsRunning(false);
        const result = `Based on the recursive analysis using PIRTM, the system has converged to a stable solution.\n\nThe calculated value is 42.00000001 (ϵ < 1e-9).\n\nArbitration confirmed this result against symbolic baselines with a confidence score of 0.998.`;
        setFinalResult(result);
        setMessages(prev => [...prev, { role: 'assistant', content: result }]);
      }
      currentStep++;
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full relative">
      {/* Chat History & Execution Timeline */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-48 space-y-6">
        {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                <SparklesIcon className="w-12 h-12 text-zinc-700" />
                <p className="text-sm font-medium">How can I help you today?</p>
            </div>
        )}
        
        {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' 
                        ? 'bg-sky-600/20 border border-sky-500/30 text-sky-100 rounded-tr-sm' 
                        : 'bg-zinc-900/50 border border-zinc-800 text-zinc-300 rounded-tl-sm'
                }`}>
                    {msg.content}
                </div>
            </div>
        ))}

        {steps.length > 0 && !finalResult && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
                Analyzing Request...
            </h3>
            
            <div className="border border-zinc-800 rounded-lg bg-zinc-900/30 overflow-hidden">
              {steps.map((step) => (
                <div key={step.id} className={`p-4 border-b border-zinc-800 last:border-0 flex items-start gap-4 transition-colors ${step.status === 'running' ? 'bg-sky-900/10' : ''}`}>
                  <div className="mt-1">
                    {step.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-zinc-700"></div>}
                    {step.status === 'running' && <div className="w-4 h-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin"></div>}
                    {step.status === 'done' && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${step.status === 'running' ? 'text-sky-400' : step.status === 'done' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {step.name}
                      </span>
                      {step.status === 'done' && <span className="text-[10px] font-mono text-zinc-600">142ms</span>}
                    </div>
                    {step.details && (
                      <p className="text-xs text-zinc-500 mt-1 font-mono">{step.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area (Pinned to Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent">
        <div className="relative group">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleRun();
                }
            }}
            placeholder="Message Copilot..."
            className="w-full bg-zinc-900/80 backdrop-blur-md border border-zinc-700 rounded-2xl p-4 pb-16 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 min-h-[140px] resize-none font-sans transition-colors shadow-2xl"
          />
          
          <div className="absolute bottom-3 left-4 flex items-center gap-3">
             <button 
               onClick={() => setDeepThinkEnabled(!deepThinkEnabled)}
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                 deepThinkEnabled 
                   ? 'bg-sky-500/10 border-sky-500/30 text-sky-300' 
                   : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-500 hover:text-zinc-300'
               }`}
             >
                {deepThinkEnabled ? <SparklesSolid className="w-3.5 h-3.5" /> : <SparklesIcon className="w-3.5 h-3.5" />}
                Deep Think
             </button>

             <button 
               onClick={() => setWebSearchEnabled(!webSearchEnabled)}
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                 webSearchEnabled 
                   ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' 
                   : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-500 hover:text-zinc-300'
               }`}
             >
                <MagnifyingGlassIcon className="w-3.5 h-3.5" />
                Web Search
             </button>
          </div>

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <div className="relative">
                {showUploadMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#18181b] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
                        <button 
                            onClick={() => { fileInputRef.current?.click(); setShowUploadMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs text-zinc-300 hover:bg-sky-900/20 hover:text-sky-400 transition-colors text-left"
                        >
                            <FolderIcon className="w-4 h-4" />
                            File Upload
                        </button>
                        <button 
                            onClick={() => setShowUploadMenu(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs text-zinc-300 hover:bg-sky-900/20 hover:text-sky-400 transition-colors text-left"
                        >
                            <CloudIcon className="w-4 h-4" />
                            Google Drive
                        </button>
                        <button 
                            onClick={() => setShowUploadMenu(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs text-zinc-300 hover:bg-sky-900/20 hover:text-sky-400 transition-colors text-left border-t border-zinc-800"
                        >
                            <LinkIcon className="w-4 h-4" />
                            Web Address
                        </button>
                    </div>
                )}
                
                <input ref={fileInputRef} type="file" className="hidden" />

                <button 
                    onClick={() => setShowUploadMenu(!showUploadMenu)}
                    className={`p-2 rounded-full transition-colors ${showUploadMenu ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                >
                    <DocumentTextIcon className="w-5 h-5" />
                </button>
            </div>

            <button 
              onClick={handleRun}
              disabled={isRunning || !prompt}
              className={`flex items-center justify-center p-2 rounded-full font-medium transition-all ${
                isRunning || !prompt 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/20'
              }`}
            >
              {isRunning ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ArrowUpTrayIcon className="w-5 h-5 rotate-90" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Projects View ---
const ProjectsView = ({ onViewChange }: { onViewChange: (v: View) => void }) => {
  const [query, setQuery] = useState("");
  
  const projects = [
      { id: "qproj-001", name: "FLRW Q‑diagnostics", owner: "you", status: "Active", provenanceId: "ledg_1234", lastRun: "2025-12-05", metrics: { runs: 12, passes: 12, residual: "1.2e-120" } },
      { id: "qproj-002", name: "Starobinsky scaling", owner: "you", status: "Active", provenanceId: "ledg_1250", lastRun: "2025-12-07", metrics: { runs: 6, passes: 6, residual: "O(1)" } },
      { id: "qproj-003", name: "BH background sandbox", owner: "lab", status: "Paused", provenanceId: "ledg_1299", lastRun: "2025-11-23", metrics: { runs: 2, passes: 1 } },
      { id: "qproj-004", name: "Tensor Network Renormalization", owner: "you", status: "Blocked", provenanceId: "ledg_1402", lastRun: "2025-12-01", metrics: { runs: 5, passes: 0, residual: "NaN" } },
  ];

  const filtered = projects.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <Squares2X2Icon className="w-8 h-8 text-teal-400" />
                    Projects
                </h2>
                <p className="text-zinc-400 text-sm">Manage computational workspaces and recursive definitions.</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input 
                        type="text"
                        placeholder="Search projects..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="bg-zinc-900/50 border border-zinc-700 text-sm rounded-md pl-9 pr-4 py-2 text-zinc-200 focus:outline-none focus:border-sky-500 w-64"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded shadow-lg shadow-sky-900/20 transition-all">
                    <PlusIcon className="w-4 h-4" />
                    New Project
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(p => (
                <div key={p.id} className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-base font-bold text-zinc-100 group-hover:text-sky-400 transition-colors">{p.name}</h3>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    p.status === 'Active' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/30' :
                                    p.status === 'Paused' ? 'bg-amber-900/20 text-amber-400 border-amber-900/30' :
                                    'bg-red-900/20 text-red-400 border-red-900/30'
                                }`}>
                                    {p.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                                <span>{p.id}</span>
                                <span>•</span>
                                <span>Last run {p.lastRun}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={() => onViewChange('compose')}
                                className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded border border-zinc-800 transition-colors"
                            >
                                Open <ChevronRightIcon className="w-3 h-3" />
                            </button>
                             <button 
                                onClick={() => onViewChange('ledger')}
                                className="flex items-center gap-1 text-xs font-medium text-teal-500/80 hover:text-teal-400 px-3 py-1.5 transition-colors"
                            >
                                Ledger
                            </button>
                        </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-zinc-900/40 rounded p-2 border border-zinc-800/50">
                            <div className="text-[9px] text-zinc-500 uppercase font-bold">Runs</div>
                            <div className="font-mono text-zinc-300">{p.metrics.runs}</div>
                        </div>
                         <div className="bg-zinc-900/40 rounded p-2 border border-zinc-800/50">
                            <div className="text-[9px] text-zinc-500 uppercase font-bold">Passes</div>
                            <div className="font-mono text-zinc-300">{p.metrics.passes}</div>
                        </div>
                         <div className="bg-zinc-900/40 rounded p-2 border border-zinc-800/50">
                            <div className="text-[9px] text-zinc-500 uppercase font-bold">Residual</div>
                            <div className="font-mono text-zinc-300">{p.metrics.residual}</div>
                        </div>
                    </div>

                    {/* Footer / Provenance */}
                    <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/20 p-2 rounded border border-zinc-800/30">
                        <FingerPrintIcon className="w-3.5 h-3.5 text-teal-500/70" />
                        <span className="font-mono text-[10px]">{p.provenanceId}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

// --- Sources View ---
const SourcesView = ({ 
  sources, 
  onAdd, 
  onRemove, 
  onShare,
  onToggleEnabled 
}: { 
  sources: SourceFile[]; 
  onAdd: (f: File) => void; 
  onRemove: (id: string) => void;
  onShare: (id: string) => void;
  onToggleEnabled: (id: string) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onAdd(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onAdd(e.target.files[0]);
    }
  };

  return (
    <div className="p-8 pb-16 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        onChange={handleChange}
      />

      {/* Unified Header & Upload Zone */}
      <div 
        className={`mb-8 border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${
          dragActive 
            ? 'border-sky-500 bg-sky-900/10 scale-[1.01]' 
            : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-600 hover:bg-zinc-900/30'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center transition-colors ${dragActive ? 'bg-sky-500/20' : 'bg-zinc-800 group-hover:bg-zinc-700'}`}>
           <CloudArrowUpIcon className={`w-8 h-8 ${dragActive ? 'text-sky-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Source Manager</h2>
        <p className="text-zinc-400 text-sm max-w-md mx-auto mb-2">Upload, manage, and share research artifacts with the network.</p>
        <p className="text-zinc-600 text-[10px] uppercase font-mono tracking-widest mt-4">Drop files or click to browse (PDF, JSON, CSV, LaTeX)</p>
      </div>

      {/* File List */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl flex flex-col mb-8">
        <div className="bg-zinc-900/50 px-6 py-3 border-b border-zinc-800 grid grid-cols-12 gap-4 text-xs font-mono text-zinc-500 uppercase font-medium rounded-t-xl">
          <div className="col-span-4">Name</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2">Network Status</div>
          <div className="col-span-2 text-center">In Context</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div>
          {sources.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-zinc-600">
              <FolderIcon className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-sm">No sources uploaded</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {sources.map((file) => (
                <div key={file.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-zinc-900/30 transition-colors group first:rounded-t-none last:rounded-b-xl">
                  <div className={`col-span-4 flex items-center gap-3 transition-opacity ${!file.isEnabled ? 'opacity-40' : 'opacity-100'}`}>
                    <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <DocumentTextIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-200 truncate">{file.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{file.type} • {file.date}</div>
                    </div>
                  </div>
                  
                  <div className={`col-span-2 text-sm font-mono transition-opacity ${!file.isEnabled ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {file.size}
                  </div>
                  
                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium border ${
                      file.status === 'synced' ? 'bg-green-900/20 text-green-400 border-green-900/30' : 
                      file.status === 'uploading' ? 'bg-blue-900/20 text-blue-400 border-blue-900/30' :
                      'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {file.status === 'synced' && <CheckCircleIcon className="w-3 h-3" />}
                      {file.status === 'uploading' && <ArrowPathIcon className="w-3 h-3 animate-spin" />}
                      {file.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="col-span-2 flex justify-center">
                     <button
                        onClick={() => onToggleEnabled(file.id)}
                        className={`w-9 h-5 rounded-full p-1 transition-all ${file.isEnabled ? 'bg-sky-600' : 'bg-zinc-700'}`}
                        title={file.isEnabled ? "Remove from reasoning context" : "Add to reasoning context"}
                     >
                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${file.isEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                     </button>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onShare(file.id)}
                      className={`p-2 rounded transition-colors ${file.isShared ? 'text-sky-400 bg-sky-900/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                      title={file.isShared ? "Shared with Network" : "Share with Network"}
                    >
                      <ShareIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onRemove(file.id)}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                      title="Remove Source"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- CSL View ---
const CSLView = ({
  jurisdiction,
  setJurisdiction,
  cslLevel,
  setCslLevel,
}: {
  jurisdiction: string;
  setJurisdiction: (j: string) => void;
  cslLevel: string;
  setCslLevel: (l: string) => void;
}) => {
  const [activeMode, setActiveMode] = useState<'Silent'|'Supervised'|'Tribunal'>('Supervised');
  const [cslActive, setCslActive] = useState(true);

  return (
    <div className="p-8 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Conscious Sovereignty Layer</h2>
          <p className="text-zinc-400 text-sm">Configure ethical boundaries, jurisdiction overlays, and participation consent.</p>
        </div>
        <div className={`px-4 py-2 rounded-lg border flex items-center gap-3 ${cslActive ? 'bg-green-900/10 border-green-900/30' : 'bg-red-900/10 border-red-900/30'}`}>
          <div>
            <div className={`text-sm font-bold ${cslActive ? 'text-green-400' : 'text-red-400'}`}>
              {cslActive ? 'CSL Protection Active' : 'Protection Disabled'}
            </div>
            <div className="text-[10px] text-zinc-500">
              {cslActive ? 'Your computations are protected by ethical governance' : 'WARNING: Running in unprotected mode'}
            </div>
          </div>
          <button 
            onClick={() => setCslActive(!cslActive)}
            className={`w-10 h-5 rounded-full p-1 transition-colors ${cslActive ? 'bg-green-600' : 'bg-zinc-700'}`}
          >
            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${cslActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Jurisdiction Selection */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <GlobeAltIcon className="w-4 h-4 text-sky-400" />
            Jurisdiction
          </h3>
          <div className="space-y-2">
            {['EU-Research', 'US-Commercial', 'Asia-Academic', 'Global-Open'].map((j) => (
              <button 
                key={j}
                onClick={() => setJurisdiction(j)}
                className={`w-full flex items-center justify-between p-3 rounded border transition-all ${
                  jurisdiction === j 
                    ? 'bg-sky-900/20 border-sky-500/50 ring-1 ring-sky-500/20' 
                    : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {j.includes('EU') ? '🇪🇺' : j.includes('US') ? '🇺🇸' : j.includes('Asia') ? '🇯🇵' : '🌐'}
                  </span>
                  <div className="text-left">
                    <div className={`text-sm font-medium ${jurisdiction === j ? 'text-sky-200' : 'text-zinc-400'}`}>{j}</div>
                    <div className="text-[10px] text-zinc-600">
                      {j.includes('EU') ? 'Europe' : j.includes('US') ? 'Americas' : j.includes('Asia') ? 'Asia Pacific' : 'Worldwide'}
                    </div>
                  </div>
                </div>
                {jurisdiction === j && <CheckCircleIcon className="w-5 h-5 text-sky-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* Policy Level */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-sky-400" />
            Policy Level
          </h3>
          <div className="space-y-2">
            {['CSL-01 Basic', 'CSL-02 Standard', 'CSL-03 Enhanced', 'CSL-04 Strict'].map((lvl) => (
              <button 
                key={lvl}
                onClick={() => setCslLevel(lvl)}
                className={`w-full flex items-center justify-between p-3 rounded border transition-all ${
                  cslLevel === lvl 
                    ? 'bg-teal-900/20 border-teal-500/50 ring-1 ring-teal-500/20' 
                    : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${cslLevel === lvl ? 'border-teal-500' : 'border-zinc-600'}`}>
                    {cslLevel === lvl && <div className="w-2 h-2 bg-teal-500 rounded-full"></div>}
                  </div>
                  <div className="text-left">
                    <div className={`text-sm font-medium ${cslLevel === lvl ? 'text-teal-200' : 'text-zinc-400'}`}>
                      {lvl.split(' ')[0]} <span className="font-bold">{lvl.split(' ').slice(1).join(' ')}</span>
                    </div>
                    <div className="text-[10px] text-zinc-600">
                      {lvl.includes('01') ? 'Minimal consent requirements' : lvl.includes('02') ? 'Standard sovereignty controls' : lvl.includes('03') ? 'Full ethical governance' : 'Maximum sovereignty protection'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selection */}
        <div className="col-span-full bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BoltSolid className="w-4 h-4 text-sky-400" />
            Execution Mode
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'Silent', icon: '⚡', desc: 'Minimal narration; still logs provenance and certificates' },
              { id: 'Supervised', icon: '👁️', desc: 'Explain-as-you-go with checkpoints for user approval' },
              { id: 'Tribunal', icon: '🛡️', desc: 'Node∞ arbitration when ambiguity or conflict detected' }
            ].map((mode) => (
              <button 
                key={mode.id}
                onClick={() => setActiveMode(mode.id as any)}
                className={`p-4 rounded-lg border text-left transition-all h-full ${
                  activeMode === mode.id 
                    ? 'bg-sky-900/20 border-sky-500/50 text-sky-100 ring-1 ring-sky-500/20' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                }`}
              >
                <div className="mb-2 text-2xl">{mode.icon}</div>
                <div className="font-bold mb-1">{mode.id}</div>
                <div className="text-[11px] opacity-70 leading-relaxed">
                  {mode.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Arbitration View ---
const ArbitrationView = () => {
  const [status, setStatus] = useState<'pending' | 'resolved'>('pending');

  return (
    <div className="p-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Graviton Tribunal (Node ∞)</h2>
          <p className="text-zinc-400 text-sm">Conflict resolution and semantic arbitration interface.</p>
        </div>
        <div className={`px-3 py-1 text-xs font-mono rounded border ${
          status === 'pending' 
            ? 'bg-yellow-900/30 text-yellow-500 border-yellow-700/50'
            : 'bg-green-900/30 text-green-500 border-green-700/50'
        }`}>
          Status: {status.toUpperCase()}
        </div>
      </div>

      {status === 'resolved' ? (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/30 p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-green-900/20 flex items-center justify-center mb-4">
            <TrophyIcon className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Arbitration Complete</h3>
          <p className="text-zinc-400 max-w-md mx-auto mb-6">
            Candidate A (PIRTM Engine) was ratified as the authoritative result based on Prime Manifold consistency.
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => setStatus('pending')}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded transition-colors"
            >
              Simulate New Conflict
            </button>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded transition-colors">
              View Decision Log
            </button>
          </div>
        </div>
      ) : (
        /* Active Conflict Mockup */
        <div className="border border-zinc-800 rounded-xl overflow-hidden mb-8">
          <div className="bg-zinc-900/50 px-6 py-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
              Case #492-AX: Divergent Outputs
            </span>
            <span className="text-xs text-zinc-600 font-mono">Timestamp: 10:42:15.002</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
            {/* Candidate A */}
            <div className="p-6 bg-zinc-900/10 hover:bg-zinc-900/30 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-green-900/50 text-green-400 text-[10px] px-2 py-1 rounded border border-green-800">Recommended</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                  PIRTM Engine
                </span>
                <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-green-400 font-mono">Score: 0.94</span>
              </div>
              <div className="font-mono text-sm text-zinc-300 mb-4 bg-black p-4 rounded border border-zinc-800">
                <div className="text-[10px] text-zinc-500 mb-1">RESULT</div>
                <div className="text-lg text-teal-400 mb-2">√π / 2 ≈ 0.886227</div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-teal-500 w-[94%]"></div>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Confidence Score</span>
                  <span>0.94</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Method</div>
                <div className="text-sm text-zinc-300">Gaussian Quadrature</div>
                <div className="bg-zinc-900/50 p-3 rounded text-xs text-zinc-400 mt-2 border border-zinc-800/50">
                  <InformationCircleIcon className="w-3 h-3 inline mr-1 -mt-0.5" />
                  Highest precision with verified symbolic derivation and numeric confirmation
                </div>
              </div>
            </div>

            {/* Candidate B */}
            <div className="p-6 bg-zinc-900/10 hover:bg-zinc-900/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Sympy Solver
                </span>
                <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-blue-400 font-mono">Score: 0.91</span>
              </div>
              <div className="font-mono text-sm text-zinc-300 mb-4 bg-black p-4 rounded border border-zinc-800">
                <div className="text-[10px] text-zinc-500 mb-1">RESULT</div>
                <div className="text-lg text-blue-400 mb-2">√π / 2</div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-blue-500 w-[91%]"></div>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Confidence Score</span>
                  <span>0.91</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Method</div>
                <div className="text-sm text-zinc-300">Symbolic Integration</div>
                <div className="bg-zinc-900/50 p-3 rounded text-xs text-zinc-400 mt-2 border border-zinc-800/50">
                  <InformationCircleIcon className="w-3 h-3 inline mr-1 -mt-0.5" />
                  Pure symbolic result, lacks numeric precision estimate
                </div>
              </div>
              <button className="w-full mt-4 py-2 border border-zinc-700 rounded text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                Override
              </button>
            </div>

            {/* Candidate C */}
            <div className="p-6 bg-zinc-900/10 hover:bg-zinc-900/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  Monte Carlo
                </span>
                <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-purple-400 font-mono">Score: 0.78</span>
              </div>
              <div className="font-mono text-sm text-zinc-300 mb-4 bg-black p-4 rounded border border-zinc-800">
                <div className="text-[10px] text-zinc-500 mb-1">RESULT</div>
                <div className="text-lg text-purple-400 mb-2">0.886 ± 0.003</div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-purple-500 w-[78%]"></div>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Confidence Score</span>
                  <span>0.78</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Method</div>
                <div className="text-sm text-zinc-300">Statistical Sampling</div>
                <div className="bg-zinc-900/50 p-3 rounded text-xs text-zinc-400 mt-2 border border-zinc-800/50">
                  <InformationCircleIcon className="w-3 h-3 inline mr-1 -mt-0.5" />
                  Statistical estimate with uncertainty bounds, lower precision
                </div>
              </div>
              <button className="w-full mt-4 py-2 border border-zinc-700 rounded text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                Override
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 px-6 py-4 border-t border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-900/10 px-3 py-1.5 rounded border border-amber-900/30">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>Tribunal Fallback: Invoke Node∞ tribunal when alignment cannot be restored automatically</span>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-amber-900/20 text-amber-500 hover:bg-amber-900/40 text-xs font-bold uppercase tracking-wide rounded border border-amber-900/50 transition-colors flex items-center gap-2">
                Invoke Tribunal <ChevronRightIcon className="w-3 h-3" />
              </button>
              <button 
                onClick={() => setStatus('resolved')}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase tracking-wide rounded shadow-lg shadow-green-900/20 flex items-center gap-2"
              >
                <CheckCircleIcon className="w-4 h-4" />
                Ratify Winner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Quantum View ---
const QuantumView = () => {
  const [divergence, setDivergence] = useState(0.0023);
  const [history, setHistory] = useState<number[]>(new Array(40).fill(0.0023));

  useEffect(() => {
    const interval = setInterval(() => {
      setDivergence(prev => {
        const next = Math.max(0, prev + (Math.random() - 0.5) * 0.0005);
        setHistory(h => [...h.slice(1), next]);
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 pb-16 max-w-5xl mx-auto w-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <CpuChipIcon className="w-8 h-8 text-teal-400" />
          Quantum View
        </h2>
        <p className="text-zinc-400 text-sm">Dual view: symbolic branch vs. quantum branch with live divergence meter ϵ(t)</p>
      </div>

      <div className="bg-[#050505] border border-zinc-800 rounded-xl relative overflow-hidden flex flex-col p-6 mb-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 z-10">
          <div className="flex items-center gap-3">
            <ArrowPathIcon className="w-5 h-5 text-green-500 animate-pulse" />
            <div>
              <div className="text-sm font-bold text-zinc-200">Divergence Meter ϵ(t)</div>
              <div className="text-xs text-zinc-500">Real-time symbolic ↔ quantum consistency</div>
            </div>
          </div>
          <div className="bg-green-900/20 text-green-400 text-xs px-3 py-1 rounded-full border border-green-900/50">
            Synchronized
          </div>
        </div>

        {/* Live Graph - Expanded to content height */}
        <div className="h-48 w-full bg-zinc-900/30 rounded border border-zinc-800 mb-4 relative overflow-hidden flex items-end px-1 gap-1">
          {history.map((h, i) => (
            <div 
              key={i} 
              className="flex-1 bg-teal-500/50 rounded-t-sm transition-all duration-100" 
              style={{ height: `${(h / 0.01) * 100}%` }}
            ></div>
          ))}
          <div className="absolute top-2 right-2 text-xs font-mono text-zinc-500">ε_max = 0.01</div>
          <div className="absolute bottom-2 left-2 text-xs font-mono text-zinc-500">0</div>
        </div>

        {/* Big Number */}
        <div className="text-center mb-2 font-mono text-3xl font-bold text-teal-400 tabular-nums">
          ϵ(t) = {divergence.toFixed(6)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Symbolic Branch */}
        <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl p-6 relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <BoltIcon className="w-5 h-5" />
              Symbolic Branch
            </div>
            <div className="text-xs font-mono text-zinc-600">124 steps</div>
          </div>
          
          <div className="bg-[#0c0c0e] p-6 rounded border border-zinc-800 font-mono text-lg text-zinc-300 mb-6 shadow-inner">
            <div className="text-[10px] text-zinc-600 uppercase mb-2">Current State</div>
            |ψ⟩ = α|0⟩ + β|1⟩
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">Norm</div>
              <div className="text-zinc-200 font-mono">1.0000</div>
            </div>
            <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">Fidelity</div>
              <div className="text-zinc-200 font-mono">0.9987</div>
            </div>
          </div>
        </div>

        {/* Quantum Branch */}
        <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl p-6 relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-teal-500"></div>
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-2 text-teal-400 font-bold">
              <CpuChipIcon className="w-5 h-5" />
              Quantum Branch
            </div>
            <div className="text-xs font-mono text-zinc-600">128 steps</div>
          </div>
          
          <div className="bg-[#0c0c0e] p-6 rounded border border-zinc-800 font-mono text-lg text-zinc-300 mb-6 shadow-inner relative">
            <div className="text-[10px] text-zinc-600 uppercase mb-2">Current State</div>
            ρ = |ψ⟩⟨ψ| + ε·I
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <CpuChipIcon className="w-24 h-24" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">Norm</div>
              <div className="text-zinc-200 font-mono">0.9998</div>
            </div>
            <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">Fidelity</div>
              <div className="text-zinc-200 font-mono">0.9976</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button className="px-6 py-3 bg-teal-900/20 text-teal-400 border border-teal-900/50 hover:bg-teal-900/30 rounded text-sm font-bold flex items-center gap-2 transition-colors">
          <ArrowPathIcon className="w-4 h-4" /> Resynchronize
        </button>
        <button className="px-6 py-3 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded text-sm font-bold flex items-center gap-2 transition-colors">
          <InformationCircleIcon className="w-4 h-4" /> View Trace
        </button>
      </div>
    </div>
  );
};

// --- Workflow View (DAG) ---
const WorkflowsView = () => {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    }));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const delta = e.deltaY < 0 ? 1 : -1;
    setTransform(prev => {
        const newScale = Math.min(Math.max(0.2, prev.scale + delta * zoomIntensity), 3);
        return { ...prev, scale: newScale };
    });
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
            <ShareIcon className="w-8 h-8 text-teal-400" />
            Workflows
          </h2>
          <p className="text-zinc-400 text-sm">Visual DAG of tool calls with live statuses and timings (Drag to pan, Scroll to zoom)</p>
        </div>
        <button className="p-2 text-zinc-400 hover:text-white rounded hover:bg-zinc-800">
          <EllipsisHorizontalIcon className="w-6 h-6" />
        </button>
      </div>

      <div 
        ref={containerRef}
        className={`flex-1 bg-[#050505] border border-zinc-800 rounded-xl relative overflow-hidden flex items-center justify-center p-12 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-[0.05]" 
             style={{
                 backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', 
                 backgroundSize: '24px 24px',
                 transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                 transformOrigin: 'center'
             }}>
        </div>

        {/* Transformation Group */}
        <div 
            className="relative w-full h-full flex items-center transition-transform duration-75 ease-out"
            style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                transformOrigin: 'center'
            }}
        >
            {/* SVG Connectors */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#52525b" />
                </marker>
            </defs>
            
            {/* Path 1: Input -> PIRTM */}
            <path d="M 280 300 C 330 300, 330 300, 380 300" stroke="#52525b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
            
            {/* Path 2: PIRTM -> Sympy */}
            <path d="M 580 300 C 630 300, 630 200, 680 200" stroke="#52525b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
            
            {/* Path 3: PIRTM -> Search */}
            <path d="M 580 300 C 630 300, 630 400, 680 400" stroke="#52525b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />

            {/* Path 4: Sympy -> Arbitrate */}
            <path d="M 880 200 C 930 200, 930 280, 980 280" stroke="#52525b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />

            {/* Path 5: Search -> Arbitrate */}
            <path d="M 880 400 C 930 400, 930 320, 980 320" stroke="#52525b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
            </svg>

            {/* DAG Nodes */}
            {/* Node 1: Input */}
            <div className="absolute left-[80px] top-[270px] w-[200px] bg-teal-900/20 border border-teal-500/50 p-4 rounded-lg backdrop-blur-sm shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-teal-100">Input Parser</span>
                </div>
                <div className="h-1 w-full bg-teal-900/50 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-teal-500 w-full"></div>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>status: OK</span>
                <span>12ms</span>
                </div>
            </div>

            {/* Node 2: PIRTM */}
            <div className="absolute left-[380px] top-[270px] w-[200px] bg-teal-900/20 border border-teal-500/50 p-4 rounded-lg backdrop-blur-sm shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-teal-100">PIRTM Engine</span>
                </div>
                <div className="h-1 w-full bg-teal-900/50 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-teal-500 w-full"></div>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>status: OK</span>
                <span>89ms</span>
                </div>
            </div>

            {/* Node 3: Sympy (Running) */}
            <div className="absolute left-[680px] top-[170px] w-[200px] bg-blue-900/20 border border-blue-500/50 p-4 rounded-lg backdrop-blur-sm shadow-[0_0_15px_rgba(59,130,246,0.1)] animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                <PlayIcon className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-100">Sympy Solver</span>
                </div>
                <div className="h-1 w-full bg-blue-900/50 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-blue-500 w-[60%] animate-[loading_1s_ease-in-out_infinite]"></div>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>status: RUN</span>
                <span>...</span>
                </div>
            </div>

            {/* Node 4: Search (Waiting) */}
            <div className="absolute left-[680px] top-[370px] w-[200px] bg-zinc-900/80 border border-zinc-700 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                <ClockIcon className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-bold text-zinc-400">Search Engine</span>
                </div>
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-zinc-600 w-0"></div>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>status: WAIT</span>
                <span>--</span>
                </div>
            </div>

            {/* Node 5: Arbitration (Locked) */}
            <div className="absolute left-[980px] top-[270px] w-[200px] bg-zinc-900/40 border border-zinc-800 border-dashed p-4 rounded-lg backdrop-blur-sm opacity-60">
                <div className="flex items-center gap-2 mb-2">
                <KeyIcon className="w-4 h-4 text-zinc-600" />
                <span className="text-xs font-bold text-zinc-500">Arbitration</span>
                </div>
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-zinc-600 w-0"></div>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                <span>status: LOCK</span>
                <span>--</span>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg">
            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Total Steps</div>
            <div className="text-2xl font-mono text-white">6</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg">
            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Completed</div>
            <div className="text-2xl font-mono text-white">2</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg">
            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Running</div>
            <div className="text-2xl font-mono text-blue-400 animate-pulse">1</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg">
            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Est. Time</div>
            <div className="text-2xl font-mono text-zinc-400">~2.3s</div>
        </div>
      </div>
    </div>
  );
};

// --- Ledger View ---
const LedgerView = () => {
  const [entries] = useState([
    { id: '0x9a...f2', time: '10:42:01', action: 'PIRTM_COMPUTE', hash: '8f7d...2a1b' },
    { id: '0x1b...c4', time: '10:41:58', action: 'CSL_VERIFY', hash: 'e4c1...992d' },
    { id: '0x7e...33', time: '10:41:45', action: 'PLAN_GEN', hash: '11a0...ff3e' },
    { id: '0x2d...88', time: '10:41:42', action: 'USER_PROMPT', hash: '00c2...11b2' },
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Transfinite Ledger</h2>
          <p className="text-zinc-400 text-sm">Immutable audit trail of all computational steps.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded transition-colors">
          <HashtagIcon className="w-4 h-4" />
          Export JSONL
        </button>
      </div>

      <div className="border border-zinc-800 rounded-xl bg-[#0c0c0e] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900/50 text-zinc-500 font-mono uppercase text-xs">
            <tr>
              <th className="px-6 py-3 font-medium">Block ID</th>
              <th className="px-6 py-3 font-medium">Timestamp</th>
              <th className="px-6 py-3 font-medium">Action</th>
              <th className="px-6 py-3 font-medium">State Hash</th>
              <th className="px-6 py-3 font-medium text-right">Verify</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 font-mono text-zinc-300">
            {entries.map((entry, i) => (
              <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                <td className="px-6 py-4 text-sky-400">{entry.id}</td>
                <td className="px-6 py-4 text-zinc-500">{entry.time}</td>
                <td className="px-6 py-4">
                  <span className="bg-zinc-800 px-2 py-1 rounded text-xs border border-zinc-700">{entry.action}</span>
                </td>
                <td className="px-6 py-4 text-zinc-500">{entry.hash}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-green-500 hover:text-green-400">
                    <ShieldCheckIcon className="w-5 h-5 ml-auto" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Placeholder View ---
const PlaceholderView = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-zinc-500">
    <RectangleStackIcon className="w-16 h-16 mb-4 opacity-20" />
    <h3 className="text-lg font-medium text-zinc-400">{title}</h3>
    <p className="text-sm">Module initialized. Waiting for input stream.</p>
  </div>
);

// --- Main App Component ---
const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('compose');
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(true);
  
  // Shared State
  const [jurisdiction, setJurisdiction] = useState('EU-Research');
  const [cslLevel, setCslLevel] = useState('CSL-03 Enhanced');

  // State for Sources
  const [sources, setSources] = useState<SourceFile[]>([
    { id: 'src-001', name: 'ethics_protocol_v2.pdf', size: '2.4 MB', type: 'PDF', date: '2023-11-10', status: 'synced', isShared: true, isEnabled: true },
    { id: 'src-002', name: 'q_dataset_raw.csv', size: '156 MB', type: 'CSV', date: '2023-11-12', status: 'local', isShared: false, isEnabled: true },
    { id: 'src-003', name: 'arbitration_logs.json', size: '45 KB', type: 'JSON', date: '2023-11-14', status: 'synced', isShared: false, isEnabled: false },
  ]);

  const handleAddSource = (file: File) => {
    const newSource: SourceFile = {
        id: `src-${Date.now().toString().slice(-4)}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        date: new Date().toISOString().split('T')[0],
        status: 'uploading',
        isShared: false,
        isEnabled: true
    };
    
    setSources(prev => [newSource, ...prev]);
    
    // Simulate upload finish
    setTimeout(() => {
        setSources(prev => prev.map(s => s.id === newSource.id ? { ...s, status: 'synced' } : s));
    }, 2000);
  };

  const handleRemoveSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const handleShareSource = (id: string) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, isShared: !s.isShared } : s));
  };

  const handleToggleSourceEnabled = (id: string) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, isEnabled: !s.isEnabled } : s));
  };

  return (
    <div className="flex h-screen bg-black text-zinc-200 overflow-hidden font-sans selection:bg-sky-500/30">
      <Sidebar activeView={activeView} onViewChange={setActiveView} isCollapsed={isLeftCollapsed} />
      
      {/* Left Divider (Clickable) */}
      <div 
        className="w-1 bg-zinc-900 border-l border-r border-zinc-800 hover:bg-sky-500 cursor-col-resize transition-colors z-30 flex items-center justify-center group"
        onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
        title="Toggle Sidebar"
      >
        <div className="h-8 w-0.5 bg-zinc-600 rounded group-hover:bg-white transition-colors"></div>
      </div>

      <main className="flex-1 flex flex-col min-w-0 bg-[#0c0c0e] relative">
        {/* Top Bar / Breadcrumbs */}
        <div className="h-14 border-b border-zinc-800 flex items-center px-6 justify-between bg-[#09090b]">
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
                <span>Workspace</span>
                <span>/</span>
                <span className="text-zinc-200 capitalize">{activeView}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-mono bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800">
                <ClockIcon className="w-3 h-3" />
                <span>{new Date().toISOString().split('T')[0]}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-zinc-400" />
            </div>
          </div>
        </div>

        {/* View Content */}
        <div className="flex-1 overflow-auto">
          {activeView === 'compose' && <ComposeView />}
          {activeView === 'simulator' && <SimulatorView />}
          {activeView === 'researcher' && <ResearcherView />}
          {activeView === 'projects' && <ProjectsView onViewChange={setActiveView} />}
          {activeView === 'sources' && (
            <SourcesView 
              sources={sources} 
              onAdd={handleAddSource} 
              onRemove={handleRemoveSource}
              onShare={handleShareSource}
              onToggleEnabled={handleToggleSourceEnabled}
            />
          )}
          {activeView === 'workflows' && <WorkflowsView />}
          {activeView === 'ledger' && <LedgerView />}
          {activeView === 'csl' && (
            <CSLView 
                jurisdiction={jurisdiction} 
                setJurisdiction={setJurisdiction} 
                cslLevel={cslLevel} 
                setCslLevel={setCslLevel} 
            />
          )}
          {activeView === 'arbitration' && <ArbitrationView />}
          {activeView === 'quantum' && <QuantumView />}
          {activeView === 'copilot' && (
            <div className="w-full h-full overflow-y-auto bg-stone-950">
              <CopilotView isDarkMode={true} />
            </div>
          )}
        </div>
      </main>

      {/* Right Divider (Clickable) */}
      <div 
        className="w-1 bg-zinc-900 border-l border-r border-zinc-800 hover:bg-sky-500 cursor-col-resize transition-colors z-30 flex items-center justify-center group"
        onClick={() => setIsRightOpen(!isRightOpen)}
        title="Toggle Safety Panel"
      >
        <div className="h-8 w-0.5 bg-zinc-600 rounded group-hover:bg-white transition-colors"></div>
      </div>

      {isRightOpen && (
        <RightPanel jurisdiction={jurisdiction} cslLevel={cslLevel} />
      )}
    </div>
  );
};

export default App;
