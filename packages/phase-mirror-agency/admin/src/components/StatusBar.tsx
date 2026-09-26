import React from 'react';
import { GitBranch, Cloud, ShieldCheck, Activity, AlertCircle } from 'lucide-react';

export function StatusBar() {
  return (
    <div className="h-6 bg-[#007acc] text-white flex items-center px-3 text-xs select-none justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 hover:bg-white/10 px-1 rounded cursor-pointer">
          <GitBranch size={12} />
          <span>main*</span>
        </div>
        <div className="flex items-center space-x-1 hover:bg-white/10 px-1 rounded cursor-pointer">
          <Activity size={12} />
          <span>0 errors, 1 warning</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 hover:bg-white/10 px-1 rounded cursor-pointer" title="Environment Tier">
          <Cloud size={12} />
          <span>Cloud</span>
        </div>
        <div className="flex items-center space-x-1 hover:bg-white/10 px-1 rounded cursor-pointer" title="L0 Invariant Hash">
          <ShieldCheck size={12} />
          <span>L0: 8f3a2c</span>
        </div>
        <div className="flex items-center space-x-1 hover:bg-white/10 px-1 rounded cursor-pointer" title="MCP Health">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span>MCP: Healthy</span>
        </div>
        <div className="flex items-center space-x-1 hover:bg-white/10 px-1 rounded cursor-pointer text-amber-200" title="Active Tensions">
          <AlertCircle size={12} />
          <span>1 Active Tension</span>
        </div>
      </div>
    </div>
  );
}
