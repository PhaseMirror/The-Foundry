import { useState } from 'react';
import { useQCalcStore } from '../stores/qcalcStore';
import { PlayIcon, ArrowPathIcon, Cog6ToothIcon } from 'lucide-react';

const PirtmWorkspace = () => {
  const { job, setLambdaM, setTimeEnd, toggleStratum, run, reset } = useQCalcStore();
  const [lambdaM, setLocalLambdaM] = useState(job.lambdaM ?? 0.8);
  const [timeEnd, setLocalTimeEnd] = useState(job.timeEnd ?? 200);

  const handleRun = () => {
    setLambdaM(lambdaM);
    setTimeEnd(timeEnd);
    run();
  };

  const STRATA = [
    { id: 0, name: 'Stratum 0', desc: 'Adelic Lattice & p-adic Foundations' },
    { id: 1, name: 'Stratum 1', desc: 'Pre-Geometric Spinors' },
    { id: 2, name: 'Stratum 2', desc: 'Qualia Operad' },
    { id: 3, name: 'Stratum 3', desc: 'Spacetime Emergence' },
    { id: 4, name: 'Stratum 4', desc: 'Quantum Social Coherence' },
    { id: 7, name: 'Stratum 7', desc: 'Ethical Lagrangian' },
    { id: 13, name: 'Stratum 13', desc: 'Omega Governance (DAO)' },
    { id: 99, name: 'Node Ω', desc: 'Transfinite Arbitration' },
  ];

  const activeStrata = job.activeStrata ?? [0, 4, 7];

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">PIRTM Workspace</h1>
        <p className="text-zinc-400 text-sm mb-6">Prime-Indexed Recursive Tensor Math — Local Compute</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-[#0c0c0e] border border-zinc-800 rounded-xl p-6">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Global Parameters</h3>

            <div className="mb-4">
              <label className="text-xs text-zinc-300 flex justify-between mb-1">
                <span>Lambda M (Λm)</span>
                <span className="font-mono text-sky-400">{lambdaM}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={lambdaM}
                onChange={(e) => setLocalLambdaM(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            <div className="mb-6">
              <label className="text-xs text-zinc-300 flex justify-between mb-1">
                <span>Time Horizon (T)</span>
                <span className="font-mono text-zinc-400">{timeEnd}s</span>
              </label>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={timeEnd}
                onChange={(e) => setLocalTimeEnd(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-500"
              />
            </div>

            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Active Strata</h3>
            <div className="space-y-2">
              {STRATA.map((s) => {
                const active = activeStrata.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleStratum(s.id)}
                    className={`
                      w-full text-left p-3 rounded-lg border transition-all
                      ${active ? 'bg-zinc-800 border-sky-500/30' : 'bg-zinc-900/30 border-zinc-800 opacity-60 hover:opacity-100'}
                    `}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-bold ${active ? 'text-white' : 'text-zinc-500'}`}>{s.name}</span>
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></div>}
                    </div>
                    <div className={`text-[10px] ${active ? 'text-zinc-300' : 'text-zinc-600'}`}>{s.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#0c0c0e] border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleRun}
                disabled={job.status === 'running'}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${job.status === 'running' ? 'bg-zinc-800 text-zinc-500' : 'bg-sky-600 hover:bg-sky-500 text-white'}
                `}
              >
                {job.status === 'running' ? <Cog6ToothIcon className="w-4 h-4 animate-spin" /> : <PlayIcon className="w-4 h-4" />}
                {job.status === 'running' ? 'Running...' : 'Run Simulation'}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-zinc-900/30 p-3 rounded border border-zinc-800">
                <div className="text-[10px] text-zinc-500 font-mono uppercase">Operator Norm</div>
                <div className="text-lg font-mono text-zinc-200">{(job.operatorNorm).toFixed(4)}</div>
              </div>
              <div className="bg-zinc-900/30 p-3 rounded border border-zinc-800">
                <div className="text-[10px] text-zinc-500 font-mono uppercase">Lambda T</div>
                <div className="text-lg font-mono text-zinc-200">{(job.lambdaT).toFixed(4)}</div>
              </div>
              <div className="bg-zinc-900/30 p-3 rounded border border-zinc-800">
                <div className="text-[10px] text-zinc-500 font-mono uppercase">GAP<sub>LB</sub></div>
                <div className="text-lg font-mono text-white">{(job.gapLb).toFixed(4)}</div>
              </div>
              <div className="bg-zinc-900/30 p-3 rounded border border-zinc-800">
                <div className="text-[10px] text-zinc-500 font-mono uppercase">Status</div>
                <div className="text-lg font-mono text-zinc-200 capitalize">{job.status}</div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Event Stream</h3>
              <div className="space-y-1 font-mono text-xs h-40 overflow-y-auto bg-zinc-900/20 rounded-lg p-3 border border-zinc-800">
                {job.logs.length === 0 ? (
                  <span className="text-zinc-700 italic">No events recorded.</span>
                ) : (
                  job.logs.map((log, i) => (
                    <div key={i} className="text-zinc-400 border-l-2 border-zinc-800 pl-2 py-0.5">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PirtmWorkspace;
