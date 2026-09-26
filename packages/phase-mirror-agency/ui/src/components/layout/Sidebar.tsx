import AtomicLogo from './AtomicLogo';
import { useState } from 'react';
import type { View } from '../../types';
import { LayoutDashboard, GitBranch, ShieldCheck, CpuChip, Archive, Users, Beaker, Cog6Tooth, Terminal as TerminalIcon } from 'lucide-react';

const NAV_ITEMS: { id: View; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'dissonance', label: 'Dissonance Graph', icon: GitBranch },
  { id: 'triple-lock', label: 'Triple-Lock', icon: ShieldCheck },
  { id: 'qcalc', label: 'Q-Calculator', icon: CpuChip },
  { id: 'pirtm', label: 'PIRTM Workspace', icon: Beaker },
  { id: 'mcp', label: 'MCP Terminal', icon: TerminalIcon },
  { id: 'archivum', label: 'Archivum', icon: Archive },
  { id: 'fleet', label: 'Fleet', icon: Users },
  { id: 'settings', label: 'Settings', icon: Cog6Tooth },
];

const Sidebar = ({ activeView, onViewChange, isCollapsed }: { activeView: View; onViewChange: (v: View) => void; isCollapsed: boolean }) => {
  return (
    <div
      className={`
        ${isCollapsed ? 'w-16' : 'w-64'} bg-[#09090b] flex flex-col h-screen shrink-0 z-20 transition-all duration-300 ease-in-out
      `}
    >
      <div className={`p-4 flex items-center h-14 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <AtomicLogo collapsed={isCollapsed} />
        {!isCollapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="font-bold text-zinc-100 text-sm tracking-tight font-mono">Agency</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">Online</p>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={isCollapsed ? item.label : ''}
              className={`
                w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${
                  activeView === item.id
                    ? 'bg-zinc-800/80 text-white shadow-sm border border-zinc-700/50'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }
                ${isCollapsed ? 'justify-center' : 'gap-3'}
              `}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${activeView === item.id ? 'text-sky-400' : 'text-zinc-500'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className={`p-4 border-t border-zinc-800 ${isCollapsed ? 'hidden' : 'block'}`}>
        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">System Status</span>
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          </div>
          <div className="text-xs text-zinc-300 font-mono space-y-1">
            <div className="flex justify-between"><span>MCP</span> <span className="text-green-400">Active</span></div>
            <div className="flex justify-between"><span>ALP</span> <span className="text-sky-400">Enforced</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
