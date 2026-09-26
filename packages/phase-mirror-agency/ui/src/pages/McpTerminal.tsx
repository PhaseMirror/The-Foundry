import { useState } from 'react';
import { api } from '../api/client';

const MCPTerminal = () => {
  const [logs, setLogs] = useState<{ time: string; tool: string; args: Record<string, unknown>; status: string; result?: unknown }[]>([]);
  const [toolName, setToolName] = useState('health_check');
  const [argsJson, setArgsJson] = useState('{}');
  const [loading, setLoading] = useState(false);

  const handleCall = async () => {
    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(argsJson || '{}');
    } catch {
      args = { raw: argsJson };
    }

    const entry = {
      time: new Date().toLocaleTimeString(),
      tool: toolName,
      args,
      status: 'dispatched',
    };
    setLogs((prev) => [entry, ...prev.slice(0, 49)]);
    setLoading(true);

    try {
      const result = await api.alp.evaluate({
        id: toolName,
        payload: args,
        mutating: true,
        server_binding: undefined,
      });

      setLogs((prev) =>
        prev.map((log, i) =>
          i === 0
            ? {
                ...log,
                status: result.allowed !== false ? 'allowed' : 'blocked',
                result: { risk: result.risk, evaluated_by: result.evaluated_by },
              }
            : log
        )
      );
    } catch (err: any) {
      setLogs((prev) =>
        prev.map((log, i) =>
          i === 0 ? { ...log, status: 'error', result: { error: err.detail || err.message } } : log
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">MCP Terminal</h1>
        <p className="text-zinc-400 text-sm mb-6">Governed tool calls through the ALP gate</p>

        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Tool Name</label>
              <input
                type="text"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-700 text-sm text-zinc-100 rounded-lg p-2 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Arguments (JSON)</label>
              <input
                type="text"
                value={argsJson}
                onChange={(e) => setArgsJson(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-700 text-sm text-zinc-100 rounded-lg p-2 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            onClick={handleCall}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              loading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-500 text-white'
            }`}
          >
            {loading ? 'Evaluating...' : 'Dispatch Tool Call'}
          </button>
        </div>

        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-6">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Call Log</h3>
          <div className="space-y-2 font-mono text-xs h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <span className="text-zinc-700 italic">No tool calls recorded.</span>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-zinc-400 border-l-2 border-sky-500/30 pl-3 py-1">
                  <div className="flex justify-between">
                    <span className="text-sky-400">{log.tool}</span>
                    <span className="text-zinc-600">{log.time}</span>
                  </div>
                  <div className="text-zinc-500 break-all">{JSON.stringify(log.args)}</div>
                  <div className={`mt-1 ${log.status === 'blocked' || log.status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {log.status.toUpperCase()}
                    {log.result && ` — ${JSON.stringify(log.result)}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCPTerminal;
