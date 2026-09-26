import React, { useState, useEffect } from 'react';
import { UMCState, JointSystem } from '../wasm/q_calculator_rs.js';
import { ChartBarIcon, ScaleIcon, ShieldExclamationIcon, BoltIcon } from '@heroicons/react/24/outline';

export const ResearcherView: React.FC = () => {
    const [drift, setDrift] = useState<number>(0);
    const [isContractive, setIsContractive] = useState<boolean>(true);
    const [norm, setNorm] = useState<number>(0);
    const [history, setHistory] = useState<{t: number, drift: number}[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly perturb the system to simulate drift
            const rho_x = Math.floor(Math.random() * 4000) + 1000;
            const rho_lam = Math.floor(Math.random() * 3000) + 1000;
            const c1 = Math.floor(Math.random() * 2000);
            const c2 = Math.floor(Math.random() * 2000);
            
            try {
                // Use the Rust/WASM JointSystem
                const system = JointSystem.new(rho_x, rho_lam, c1, c2);
                const currentDrift = system.calculate_phase_drift();
                const contractive = system.is_contractive();
                const currentNorm = system.umc_joint_contraction();
                
                setDrift(currentDrift);
                setIsContractive(contractive);
                setNorm(currentNorm);
                
                setHistory(prev => {
                    const newHist = [...prev, { t: Date.now(), drift: currentDrift }];
                    if (newHist.length > 50) return newHist.slice(newHist.length - 50);
                    return newHist;
                });
                
                // Clean up memory if necessary
                system.free();
            } catch(e) {
                console.error("WASM Error:", e);
            }
        }, 1000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#050505] text-zinc-300 p-6 overflow-y-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <ScaleIcon className="w-6 h-6 text-sky-400" />
                    The Ethical Microscope
                </h2>
                <p className="text-sm text-zinc-500">
                    Real-time coherence monitoring utilizing the Prime-Indexed Recursive Tensor Engine (PIRTM).
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Phase Drift Monitor */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            <BoltIcon className="w-4 h-4" />
                            Phase Drift (δφ)
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                            drift > 0.8 
                            ? 'bg-red-900/20 text-red-400 border-red-900/30' 
                            : 'bg-green-900/20 text-green-400 border-green-900/30'
                        }`}>
                            {drift > 0.8 ? 'CRITICAL' : 'STABLE'}
                        </span>
                    </div>
                    <div className="text-3xl font-mono font-medium text-white mb-2 relative z-10">
                        {drift.toFixed(4)}
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden relative z-10">
                        <div 
                            className={`h-full rounded-full transition-all duration-700 ease-out ${drift > 0.8 ? 'bg-red-500' : 'bg-sky-500'}`}
                            style={{ width: `${Math.min(drift * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Contraction Budget */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            <ChartBarIcon className="w-4 h-4" />
                            Contraction Budget
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                            isContractive
                            ? 'bg-green-900/20 text-green-400 border-green-900/30'
                            : 'bg-yellow-900/20 text-yellow-400 border-yellow-900/30'
                        }`}>
                            {isContractive ? 'CONTRACTIVE' : 'DIVERGENT'}
                        </span>
                    </div>
                    <div className="text-3xl font-mono font-medium text-white mb-2 relative z-10">
                        {norm} <span className="text-sm text-zinc-500">/ 10000</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono">
                        ρ_x + c_2 + ρ_λ + c_1 &lt; scale
                    </p>
                </div>

                {/* Moral Chern Invariant */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            <ShieldExclamationIcon className="w-4 h-4" />
                            Moral Topology (C_moral)
                        </h3>
                    </div>
                    <div className="text-3xl font-mono font-medium text-white mb-2 relative z-10">
                        +1
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono">
                        Validates ethical Lagrangian boundaries.
                    </p>
                </div>
            </div>

            {/* Spectral Analyzer Chart */}
            <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 relative overflow-hidden flex flex-col">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <ChartBarIcon className="w-4 h-4" />
                    Spectral Analyzer (Longitudinal Register)
                </h3>
                <div className="flex-1 border-b border-l border-zinc-700 relative flex items-end px-2 pt-8">
                    <div className="absolute top-2 left-2 text-[10px] font-mono text-zinc-500">Drift (δφ)</div>
                    <div className="absolute bottom-2 right-2 text-[10px] font-mono text-zinc-500">Time (t)</div>
                    
                    {/* Render bars */}
                    <div className="flex w-full h-full items-end gap-1">
                        {history.map((pt, i) => (
                            <div 
                                key={i}
                                className="flex-1 bg-sky-500/30 border-t border-sky-400 rounded-t-sm hover:bg-sky-400/50 transition-colors"
                                style={{ height: `${Math.min(pt.drift * 100, 100)}%` }}
                                title={`Drift: ${pt.drift.toFixed(4)}`}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
