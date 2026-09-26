import { useState, useEffect } from 'react';
import { useMetricsStore } from '../../stores/metricsStore';
import { ShieldCheckIcon, GlobeAltIcon, HashtagIcon, ClipboardDocumentCheckIcon, InformationCircleIcon, Cog6ToothIcon } from 'lucide-react';

const RightPanel = () => {
  const metrics = useMetricsStore((s) => s.metrics);
  const [contraction, setContraction] = useState(0.84);
  const [primeCounts, setPrimeCounts] = useState({ 2: 3, 3: 2, 5: 1, 7: 1 });

  useEffect(() => {
    const interval = setInterval(() => {
      setContraction(0.8 + Math.random() * 0.05);
      if (Math.random() > 0.7) {
        setPrimeCounts((prev) => ({
          ...prev,
          [Math.random() > 0.5 ? 2 : 3]: prev[2] + 1,
        }));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const isSafe = contraction < 1.0;

  return (
    <div className="w-80 bg-[#09090b] flex flex-col h-screen shrink-0 overflow-y-auto z-20">
      {/* Safety Meter */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4" />
            Safety Meter
          </h3>
          <span
            className={`
              text-[10px] font-bold px-1.5 py-0.5 rounded border
              ${isSafe ? 'bg-green-900/10 text-green-400 border-green-900/30' : 'bg-red-900/10 text-red-400 border-red-900/30'}
            `}
          >
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
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-zinc-900/30 p-2 rounded border border-zinc-800">
            <div className="text-[10px] text-zinc-500 font-mono uppercase">Operator Norm</div>
            <div className="text-sm font-mono text-zinc-200">{(contraction * 0.72).toFixed(4)}</div>
          </div>
          <div className="bg-zinc-900/30 p-2 rounded border border-zinc-800">
            <div className="text-[10px] text-zinc-500 font-mono uppercase">Lambda T</div>
            <div className="text-sm font-mono text-zinc-200">{(contraction * 0.28).toFixed(4)}</div>
          </div>
        </div>

        <div className="bg-zinc-900/30 p-3 rounded border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase">GAP<sub>LB</sub> = 1 - ||K̂||</div>
            <div className="text-lg font-mono text-white font-medium">{(1.0 - contraction).toFixed(4)}</div>
          </div>
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
          <div className="px-3 py-1.5 rounded-full bg-sky-900/20 border border-sky-500/30 flex items-center gap-2 text-sky-300 text-xs font-medium truncate max-w-[140px]">
            <GlobeAltIcon className="w-3 h-3" />
            Multiplicity
          </div>
          <div className="px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700 flex items-center gap-2 text-zinc-300 text-xs font-medium truncate max-w-[140px]">
            <ShieldCheckIcon className="w-3 h-3" />
            CSL-1
          </div>
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
                {prime}
                <sup className="text-zinc-500 text-xs ml-0.5">{count as number}</sup>
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
            <div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Record Hash</div>
              <div className="font-mono text-xs text-zinc-300 break-all bg-zinc-900/30 p-2 rounded border border-zinc-800/50">0x7f3a8b2c9e1d</div>
            </div>
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
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
