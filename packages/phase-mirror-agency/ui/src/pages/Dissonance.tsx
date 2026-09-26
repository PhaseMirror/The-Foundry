import { useEffect } from 'react';
import { useDissonanceStore } from '../stores/dissonanceStore';
import { DissonanceGraph } from '../types';

const DissonanceGraphView = () => {
  const graph = useDissonanceStore((s) => s.graph);
  const loading = useDissonanceStore((s) => s.loading);
  const fetchGraph = useDissonanceStore((s) => s.fetchGraph);

  useEffect(() => {
    fetchGraph();
  }, []);

  if (loading) {
    return <div className="p-8 text-zinc-500 font-mono">Loading dissonance graph...</div>;
  }

  if (!graph) {
    return <div className="p-8 text-zinc-500 font-mono">No graph data available.</div>;
  }

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Dissonance Graph</h1>
        <p className="text-zinc-400 text-sm mb-6">Live system tensions — source: {graph.meta.source} v{graph.meta.version}</p>

        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Nodes ({graph.nodes.length})</h3>
              <div className="space-y-2">
                {graph.nodes.map((node) => (
                  <div key={node.id} className="flex items-center gap-3 p-2 bg-zinc-900/30 rounded border border-zinc-800">
                    <div
                      className={`
                        w-2 h-2 rounded-full
                        ${node.type === 'primary' ? 'bg-sky-400' : node.type === 'secondary' ? 'bg-amber-400' : 'bg-emerald-400'}
                      `}
                    ></div>
                    <div>
                      <div className="text-sm text-zinc-200">{node.label}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{node.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Edges ({graph.edges.length})</h3>
              <div className="space-y-2">
                {graph.edges.map((edge, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-zinc-900/30 rounded border border-zinc-800 text-xs font-mono text-zinc-400">
                    <span>{edge.from}</span>
                    <span className="text-zinc-600">→</span>
                    <span>{edge.to}</span>
                    {edge.dashed && <span className="text-zinc-600 text-[10px] ml-auto">dashed</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DissonanceGraphView;
