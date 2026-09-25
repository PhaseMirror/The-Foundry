import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Policy } from '../types';

interface DashboardProps {
  lambdaHistory: { time: string; value: number }[];
  policies: Policy[];
  onTogglePolicy: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ lambdaHistory, policies, onTogglePolicy }) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPolicies = policies.filter(p => {
    // Filter by status
    if (filterStatus === 'active' && !p.active) return false;
    if (filterStatus === 'inactive' && p.active) return false;
    
    // Filter by search
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col space-y-6 pr-2">
      
      {/* Chart Section */}
      <div className="bg-moral-800/30 p-4 rounded-xl border border-moral-700/50 shrink-0">
        <h3 className="text-sm font-mono text-gray-300 mb-4 flex items-center">
            <span className="w-2 h-2 bg-moral-accent rounded-full mr-2 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
            Λm Drift History
        </h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lambdaHistory}>
              <defs>
                <linearGradient id="colorLambda" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#64748b" fontSize={10} domain={[0, 10]} width={20} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9', fontSize: '12px' }}
                itemStyle={{ color: '#f1f5f9' }}
              />
              <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorLambda)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Policy Operator Panel */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-col space-y-3 mb-4 shrink-0">
            <h3 className="text-sm font-mono text-gray-300 uppercase tracking-widest border-b border-moral-700 pb-2">
                Active Statute Simulation
            </h3>
            
            {/* Filters */}
            <div className="flex space-x-2">
                <input 
                    type="text" 
                    placeholder="Search policies..." 
                    className="flex-1 bg-moral-900 border border-moral-700 rounded px-2 py-1 text-xs text-white focus:border-moral-accent outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select 
                    className="bg-moral-900 border border-moral-700 rounded px-2 py-1 text-xs text-gray-300 outline-none"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
        </div>
        
        <div className="overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {filteredPolicies.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-600 font-mono">
                    No policies matching criteria.
                </div>
            )}
            {filteredPolicies.map(policy => (
                <div key={policy.id} className={`flex items-start justify-between bg-moral-900/50 border p-3 rounded-lg transition-all ${
                    policy.active ? 'border-moral-accent/30 shadow-[0_0_10px_rgba(6,182,212,0.05)]' : 'border-moral-800 hover:border-moral-700'
                }`}>
                    <div className="flex-1 mr-4">
                        <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`text-sm font-semibold ${policy.active ? 'text-white' : 'text-gray-400'}`}>{policy.name}</h4>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-tight mb-2">{policy.description}</p>
                        <div className="flex space-x-3 text-[9px] font-mono bg-black/20 p-1.5 rounded w-fit">
                            <span className={policy.impactVector.dignityModifier < 0 ? 'text-red-400' : 'text-green-400'}>
                                DIG: {policy.impactVector.dignityModifier > 0 ? '+' : ''}{policy.impactVector.dignityModifier}
                            </span>
                            <span className="text-gray-600">|</span>
                            <span className={policy.impactVector.lambdaModifier > 0 ? 'text-red-400' : 'text-green-400'}>
                                Λm: {policy.impactVector.lambdaModifier > 0 ? '+' : ''}{policy.impactVector.lambdaModifier}
                            </span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => onTogglePolicy(policy.id)}
                        className={`mt-1 w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ease-in-out focus:outline-none ${policy.active ? 'bg-moral-accent' : 'bg-moral-700'}`}
                    >
                        <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${policy.active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </button>
                </div>
            ))}
        </div>
      </div>

      {/* Audit Log / Zeno Monitor */}
      <div className="bg-moral-900/80 rounded-xl border border-moral-800 p-4 shrink-0 mt-auto">
         <h3 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-1">Zeno Monitoring Protocol</h3>
         <div className="space-y-2 text-[10px] font-mono text-gray-500">
            <div className="flex justify-between">
                <span>Ethical Measurements / sec:</span>
                <span className="text-moral-accent">402 Hz</span>
            </div>
            <div className="flex justify-between">
                <span>Dignity Conservation:</span>
                <span className="text-green-500">NOMINAL</span>
            </div>
            <div className="flex justify-between">
                <span>Last Collapse Event:</span>
                <span>T-minus 42h</span>
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-moral-500">
                <span>Quantum State: Coherent</span>
                <div className="w-1.5 h-1.5 bg-moral-500 rounded-full animate-pulse"></div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default Dashboard;