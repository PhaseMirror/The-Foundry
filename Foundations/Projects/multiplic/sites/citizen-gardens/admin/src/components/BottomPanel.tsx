import React from 'react';
import { Terminal, Activity, Play, FileText } from 'lucide-react';
import { PANEL_VIEWS, MOCK_LOGS } from '../constants';

interface BottomPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  height: number;
}

export function BottomPanel({ activeTab, onTabChange, isExpanded, onToggleExpand, height }: BottomPanelProps) {
  const tabs = [
    { id: PANEL_VIEWS.TERMINAL, label: 'TERMINAL', icon: Terminal },
    { id: PANEL_VIEWS.DIFF, label: 'DISSONANCE DIFF', icon: Activity },
    { id: PANEL_VIEWS.CI, label: 'CI PIPELINE', icon: Play },
    { id: PANEL_VIEWS.TRACE, label: 'TRACE LOGS', icon: FileText },
  ];

  if (!isExpanded) return null;

  return (
    <div 
      className="bg-[#1e1e1e] border-t border-[#333] flex flex-col flex-shrink-0"
      style={{ height }}
    >
      <div className="flex items-center px-4 border-b border-[#333]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`mr-6 py-2 text-xs font-medium flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-white text-white' 
                : 'border-transparent text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            <tab.icon size={12} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-2 font-mono text-xs text-[#cccccc]">
        {activeTab === PANEL_VIEWS.TERMINAL && (
          <div className="space-y-1">
            <div className="text-green-400">➜  mirror-dissonance git:(main) <span className="text-white">md trace --watch</span></div>
            <div className="text-gray-400">[INFO] Initializing Phase Mirror environment...</div>
            <div className="text-gray-400">[INFO] Connected to cloud dev container (us-east-1)</div>
            <div className="text-blue-400">[TRACE] Prime Index: 7823.11.9a</div>
          </div>
        )}
        {activeTab === PANEL_VIEWS.TRACE && (
          <div className="space-y-1">
            {MOCK_LOGS.map((log) => (
              <div key={log.id} className="flex space-x-2">
                <span className="text-gray-500">[{log.timestamp}]</span>
                <span className={`
                  ${log.level === 'info' ? 'text-blue-400' : ''}
                  ${log.level === 'warn' ? 'text-amber-400' : ''}
                  ${log.level === 'error' ? 'text-red-400' : ''}
                `}>{log.level.toUpperCase()}</span>
                <span className="text-purple-400">[{log.source}]</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === PANEL_VIEWS.DIFF && (
          <div className="flex h-full">
            <div className="w-1/2 border-r border-[#333] p-2">
              <div className="text-xs font-bold text-gray-500 mb-2">COMMIT A (HEAD~1)</div>
              <div className="font-mono text-xs space-y-1">
                <div className="text-gray-400">Prime Index: 7823.11.9a</div>
                <div className="text-gray-400">Entropy: 0.42</div>
                <div className="text-gray-400">Vector: [0.1, 0.4, 0.9]</div>
              </div>
            </div>
            <div className="w-1/2 p-2">
              <div className="text-xs font-bold text-gray-500 mb-2">COMMIT B (HEAD)</div>
              <div className="font-mono text-xs space-y-1">
                <div className="text-blue-400">Prime Index: 7823.11.9b</div>
                <div className="text-green-400">Entropy: 0.38 (-0.04)</div>
                <div className="text-gray-400">Vector: [0.1, <span className="text-amber-400">0.5</span>, 0.9]</div>
              </div>
            </div>
          </div>
        )}
        {activeTab === PANEL_VIEWS.CI && (
          <div className="space-y-2 p-2">
             <div className="flex items-center text-green-400">
               <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
               <span>Build & Lint (Core) - Passed (45s)</span>
             </div>
             <div className="flex items-center text-green-400">
               <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
               <span>Unit Tests - Passed (12s)</span>
             </div>
             <div className="flex items-center text-amber-400">
               <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
               <span>Integration Tests (Dissonance) - Running...</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
