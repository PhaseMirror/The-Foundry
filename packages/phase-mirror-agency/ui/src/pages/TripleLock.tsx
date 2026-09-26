import { useState } from 'react';
import { api } from '../api/client';
import type { MissionRequest } from '../../types';
import { PlayIcon, SquareIcon } from 'lucide-react';

const TripleLockInspector = () => {
  const [mission, setMission] = useState('');
  const [result, setResult] = useState<{ id: string; witness_hash?: string; governance_status?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDispatch = async () => {
    if (!mission.trim()) return;
    setLoading(true);
    try {
      const response = await api.tripleLock.dispatch({
        payload: mission,
        type: 'GovernanceVerification',
      });
      setResult(response);
    } catch (err: any) {
      setResult({ id: 'error', governance_status: 'FAILED', witness_hash: undefined });
    } finally {
      setLoading(false);
    }
  };

  const verified = result?.governance_status === 'VERIFIED';

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Triple-Lock Inspector</h1>
        <p className="text-zinc-400 text-sm mb-6">Dispatch missions through Guardian → Examiner → Publisher</p>

        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-6 mb-6">
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Mission Payload
          </label>
          <textarea
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            placeholder="Enter mission payload..."
            className="w-full bg-zinc-900/50 border border-zinc-700 text-sm text-zinc-100 rounded-lg p-4 font-mono focus:outline-none focus:border-sky-500 resize-none h-32"
          />

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleDispatch}
              disabled={loading || !mission.trim()}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${loading || !mission.trim() ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-500 text-white'}
              `}
            >
              {loading ? <SquareIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              {loading ? 'Dispatching...' : 'Dispatch'}
            </button>
          </div>
        </div>

        {result && (
          <div className={`
            border rounded-xl p-6
            ${verified ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-red-900/10 border-red-500/30'}
          `}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-300">Mission Result</h3>
              <span
                className={`
                  text-[10px] font-bold px-2 py-1 rounded border
                  ${verified ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/30' : 'bg-red-900/20 text-red-400 border-red-900/30'}
                `}
              >
                {result.governance_status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <div className="text-zinc-500 mb-1">Mission ID</div>
                <div className="text-zinc-300 break-all">{result.id}</div>
              </div>
              <div>
                <div className="text-zinc-500 mb-1">Witness Hash</div>
                <div className="text-zinc-300 break-all">{result.witness_hash || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripleLockInspector;
