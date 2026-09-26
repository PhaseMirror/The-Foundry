import { useEffect } from 'react';
import { useArchivumStore } from '../stores/archivumStore';
import { useGovernanceStore } from '../stores/governanceStore';
import { useMetricsStore } from '../stores/metricsStore';
import { useDissonanceStore } from '../stores/dissonanceStore';

const Archivum = () => {
  const entries = useArchivumStore((s) => s.entries);
  const fetchLedger = useArchivumStore((s) => s.fetchLedger);

  useEffect(() => {
    fetchLedger();
  }, []);

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Λ-Archivum</h1>
        <p className="text-zinc-400 text-sm mb-6">Immutable provenance ledger</p>

        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl overflow-hidden">
          {entries.length === 0 ? (
            <div className="p-12 text-center text-zinc-600 font-mono text-sm">No entries recorded.</div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {entries.map((entry) => (
                <div key={entry.id} className="p-4 hover:bg-zinc-900/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-sky-400">{entry.id}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{entry.timestamp}</span>
                  </div>
                  <div className="text-sm text-zinc-300 mb-1">{entry.type}</div>
                  <div className="text-xs text-zinc-500 font-mono break-all">
                    {JSON.stringify(entry.metadata).slice(0, 120)}
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

export default Archivum;
