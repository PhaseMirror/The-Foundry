import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Activity, Play, FileText } from 'lucide-react';
import { PANEL_VIEWS, MOCK_LOGS } from '../constants';
import { agencyService } from '../services/AgencyService';

interface BottomPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  height: number;
}

export function BottomPanel({ activeTab, onTabChange, isExpanded, onToggleExpand, height }: BottomPanelProps) {
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLines, setTerminalLines] = useState<Array<{ type: 'input' | 'output' | 'error', text: string }>>([
    { type: 'output', text: '[INFO] Initializing Phase Mirror environment...' },
    { type: 'output', text: '[INFO] Connected to cloud dev container (us-east-1)' },
    { type: 'output', text: '[TRACE] Prime Index: 7823.11.9a' },
  ]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim();
    setTerminalLines(prev => [...prev, { type: 'input', text: cmd }]);
    setTerminalInput('');

    try {
      const response = await agencyService.executeCLI(cmd);
      setTerminalLines(prev => [...prev, { type: 'output', text: response.output }]);
    } catch (error: any) {
      setTerminalLines(prev => [...prev, { type: 'error', text: error.message }]);
    }
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

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
          <div className="flex flex-col h-full font-mono">
            <div className="flex-1 overflow-y-auto space-y-1 pb-4">
              {terminalLines.map((line, i) => (
                <div key={i} className={
                  line.type === 'input' ? 'text-white' : 
                  line.type === 'error' ? 'text-red-400' : 'text-gray-400'
                }>
                  {line.type === 'input' && <span className="text-green-400 mr-2">➜</span>}
                  <pre className="inline whitespace-pre-wrap">{line.text}</pre>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
            <form onSubmit={handleCommand} className="flex items-center mt-auto border-t border-[#333] pt-2">
              <span className="text-green-400 mr-2 shrink-0">➜</span>
              <input 
                type="text" 
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                className="bg-transparent border-none outline-none text-white w-full p-0"
                autoFocus
                placeholder="Enter command (e.g. ls, pwd, phase-mirror analyze)..."
              />
            </form>
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
