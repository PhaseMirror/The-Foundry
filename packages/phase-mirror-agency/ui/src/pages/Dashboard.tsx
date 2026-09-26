import { useEffect } from 'react';
import { useGovernanceStore } from '../stores/governanceStore';
import { useMetricsStore } from '../stores/metricsStore';
import { ShieldCheckIcon, CpuChipIcon, UsersIcon, ArchiveIcon, ActivityIcon } from 'lucide-react';

const Dashboard = () => {
  const agents = useGovernanceStore((s) => s.agents);
  const metrics = useMetricsStore((s) => s.metrics);

  useEffect(() => {
    useGovernanceStore.getState().fetchAgents();
    useMetricsStore.getState().fetchMetrics();
  }, []);

  const activeAgents = agents.filter((a) => a.status === 'active').length;

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Agency Dashboard</h1>
          <p className="text-zinc-400 text-sm">Phase Mirror Meta-Ensemble — Local Dev HQ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-sky-900/10 rounded-lg border border-sky-500/20">
                <CpuChipIcon className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <div className="text-xs text-zinc-500 font-mono uppercase">Governance</div>
                <div className="text-xl font-bold text-white">{metrics?.totalVerifications ?? 0}</div>
              </div>
            </div>
            <div className="text-xs text-zinc-500">Total verifications since boot</div>
          </div>

          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-900/10 rounded-lg border border-emerald-500/20">
                <UsersIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs text-zinc-500 font-mono uppercase">Active Agents</div>
                <div className="text-xl font-bold text-white">{activeAgents}</div>
              </div>
            </div>
            <div className="text-xs text-zinc-500">of {agents.length} registered</div>
          </div>

          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-900/10 rounded-lg border border-amber-500/20">
                <ActivityIcon className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-xs text-zinc-500 font-mono uppercase">Memory</div>
                <div className="text-xl font-bold text-white">{metrics?.memoryUsage ?? 0} MB</div>
              </div>
            </div>
            <div className="text-xs text-zinc-500">Heap used (Node.js)</div>
          </div>
        </div>

        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-zinc-300 mb-4 flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-sky-400" />
            System Health
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="flex justify-between p-3 bg-zinc-900/30 rounded border border-zinc-800">
              <span className="text-zinc-500">Agency Server</span>
              <span className="text-green-400">ONLINE</span>
            </div>
            <div className="flex justify-between p-3 bg-zinc-900/30 rounded border border-zinc-800">
              <span className="text-zinc-500">Phase Mirror GPT</span>
              <span className="text-green-400">READY</span>
            </div>
            <div className="flex justify-between p-3 bg-zinc-900/30 rounded border border-zinc-800">
              <span className="text-zinc-500">ALP Gate</span>
              <span className="text-green-400">ACTIVE</span>
            </div>
            <div className="flex justify-between p-3 bg-zinc-900/30 rounded border border-zinc-800">
              <span className="text-zinc-500">Q-Calculator</span>
              <span className="text-zinc-400">STANDBY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
