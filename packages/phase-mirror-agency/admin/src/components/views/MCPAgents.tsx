import React, { useEffect, useState } from 'react';
import { Bot, Activity, Clock, Shield } from 'lucide-react';
import { agencyService, Agent } from '../../services/AgencyService';

export function MCPAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const result = await agencyService.getAgents();
        setAgents(result);
      } catch (error) {
        console.error('Failed to fetch agents', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-[#1e1e1e] flex items-center justify-center">
        <div className="text-blue-400 animate-pulse font-mono">SCANNING MCP REGISTRY...</div>
      </div>
    );
  }
...

  return (
    <div className="flex-1 bg-[#1e1e1e] p-6 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-light text-white">MCP Agent Registry</h2>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded flex items-center">
          <Bot size={16} className="mr-2" /> Spawn Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-[#252526] border border-[#333] rounded-lg p-4 hover:border-blue-500/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${agent.status === 'active' ? 'bg-green-900/30 text-green-400' : agent.status === 'warning' ? 'bg-amber-900/30 text-amber-400' : 'bg-gray-800 text-gray-400'}`}>
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{agent.name}</h3>
                  <span className="text-xs text-gray-500">ID: {agent.id}</span>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-500' : agent.status === 'warning' ? 'bg-amber-500' : 'bg-gray-500'}`} />
            </div>

            <div className="space-y-3 text-xs text-gray-400">
              <div className="flex justify-between items-center bg-[#1e1e1e] p-2 rounded">
                <span className="flex items-center"><Activity size={12} className="mr-2" /> Metric</span>
                <span className="text-white font-mono">{agent.metric}</span>
              </div>
              <div className="flex justify-between items-center bg-[#1e1e1e] p-2 rounded">
                <span className="flex items-center"><Clock size={12} className="mr-2" /> Horizon</span>
                <span className="text-white">{agent.horizon}</span>
              </div>
              <div className="flex justify-between items-center bg-[#1e1e1e] p-2 rounded">
                <span className="flex items-center"><Shield size={12} className="mr-2" /> Owner</span>
                <span className="text-white">{agent.owner}</span>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="flex-1 py-1.5 bg-[#333] hover:bg-[#444] text-white text-xs rounded">Inspect</button>
              <button className="flex-1 py-1.5 bg-[#333] hover:bg-red-900/50 hover:text-red-200 text-white text-xs rounded">Terminate</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
