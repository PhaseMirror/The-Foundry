import React from 'react';
import { Globe, Clock, User, GitCommit, Zap } from 'lucide-react';

export function GlobalActivity() {
  const activities = [
    { id: 1, type: 'commit', user: 'Architect-Alpha', action: 'pushed to', target: 'main', message: 'Update L0 invariant constraints', time: '2m ago' },
    { id: 2, type: 'alert', user: 'System', action: 'detected', target: 'Sector 7G', message: 'Structural drift exceeding 0.4', time: '5m ago' },
    { id: 3, type: 'agent', user: 'Agent-01', action: 'optimized', target: 'Local Dissonance', message: 'Reduced entropy by 0.05', time: '12m ago' },
    { id: 4, type: 'governance', user: 'Architect-Beta', action: 'opened', target: 'ADR-004', message: 'Recursive Feedback Limits proposal', time: '1h ago' },
    { id: 5, type: 'deploy', user: 'CI/CD', action: 'deployed', target: 'us-east-1', message: 'Successfully deployed v2.4.0', time: '2h ago' },
    { id: 6, type: 'commit', user: 'Dev-Gamma', action: 'merged', target: 'feature/lattice-v2', message: 'Prime Lattice visualization update', time: '3h ago' },
    { id: 7, type: 'agent', user: 'Agent-03', action: 'flagged', target: 'Invariant Check', message: 'L0 violation in sub-module core', time: '4h ago' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'commit': return <GitCommit size={16} className="text-blue-400" />;
      case 'alert': return <Zap size={16} className="text-amber-400" />;
      case 'agent': return <Globe size={16} className="text-green-400" />; // Reusing Globe for agent/general
      case 'governance': return <User size={16} className="text-purple-400" />;
      case 'deploy': return <Clock size={16} className="text-gray-400" />;
      default: return <Globe size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="flex-1 bg-[#1e1e1e] flex flex-col">
      <div className="p-6 border-b border-[#333]">
        <h2 className="text-xl font-light text-white mb-2">Global Activity Log</h2>
        <p className="text-gray-400 text-sm">Real-time stream of system-wide events, commits, and agent actions.</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
          {activities.map((activity) => (
            <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[#333] bg-[#252526] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                {getIcon(activity.type)}
              </div>
              
              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#252526] p-4 rounded border border-[#333] shadow-sm">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-200 text-sm">{activity.user}</div>
                  <time className="font-caveat font-medium text-indigo-500 text-xs">{activity.time}</time>
                </div>
                <div className="text-slate-400 text-xs">
                  <span className="text-gray-500">{activity.action}</span> <span className="text-blue-300">{activity.target}</span>
                </div>
                <div className="text-slate-300 text-sm mt-1">{activity.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
