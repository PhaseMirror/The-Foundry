import { useEffect } from 'react';
import { useFleetStore } from '../stores/fleetStore';
import { ShieldCheckIcon, CpuChipIcon, ArchiveIcon, UsersIcon } from 'lucide-react';

const Fleet = () => {
  const agents = useFleetStore((s) => s.agents);
  const fetchAgents = useFleetStore((s) => s.fetchAgents);

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Fleet</h1>
        <p className="text-zinc-400 text-sm mb-6">Registered agents and harnesses</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
                    <UsersIcon className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-100">{agent.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{agent.id}</div>
                  </div>
                </div>
                <span
                  className={`
                    text-[10px] font-bold px-2 py-0.5 rounded-full border
                    ${agent.status === 'active' || agent.status === 'running' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}
                  `}
                >
                  {agent.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-zinc-900/40 rounded p-2 border border-zinc-800/50">
                  <div className="text-[9px] text-zinc-500 uppercase font-bold">Metric</div>
                  <div className="text-xs text-zinc-300">{agent.metric || '—'}</div>
                </div>
                <div className="bg-zinc-900/40 rounded p-2 border border-zinc-800/50">
                  <div className="text-[9px] text-zinc-500 uppercase font-bold">Horizon</div>
                  <div className="text-xs text-zinc-300">{agent.horizon || '—'}</div>
                </div>
              </div>

              <div className="text-[10px] text-zinc-500 font-mono">Owner: {agent.owner || 'Unknown'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Fleet;
