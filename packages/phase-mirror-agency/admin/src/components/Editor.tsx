import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { MOCK_FILE_CONTENT } from '../constants';

interface EditorProps {
  activeFile: any;
  onCloseFile: () => void;
}

export function Editor({ activeFile, onCloseFile }: EditorProps) {
  if (!activeFile) {
    return (
      <div className="flex-1 bg-[#1e1e1e] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-2xl font-light mb-2">Phase Mirror Developer Interface</div>
          <div className="text-sm">Select a file to begin editing</div>
        </div>
      </div>
    );
  }

  const content = MOCK_FILE_CONTENT[activeFile.name as keyof typeof MOCK_FILE_CONTENT] || '// File content not loaded';
  const lines = content.split('\n');

  return (
    <div className="flex-1 bg-[#1e1e1e] flex flex-col overflow-hidden">
      {/* Tab Bar */}
      <div className="h-9 bg-[#252526] flex items-center overflow-x-auto">
        <div className="h-full bg-[#1e1e1e] flex items-center px-3 border-t-2 border-blue-500 text-sm text-white min-w-[120px] justify-between group">
          <span className="mr-2">{activeFile.name}</span>
          <button onClick={onCloseFile} className="opacity-0 group-hover:opacity-100 hover:bg-[#333] rounded p-0.5">
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="flex-1 overflow-auto font-mono text-sm relative">
        <div className="flex min-h-full">
          {/* Gutter */}
          <div className="w-16 bg-[#1e1e1e] border-r border-[#333] flex flex-col text-right select-none py-4">
            {lines.map((_, i) => {
              // Mock tension logic: highlight lines 8-12 in the ADR file
              const hasTension = activeFile.name.includes('autonomy') && i >= 8 && i <= 12;
              return (
                <div key={i} className="h-6 px-3 text-[#858585] relative flex items-center justify-end">
                  {hasTension && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-amber-500 rounded-full" title="Active Tension: Autonomy vs Governance" />
                  )}
                  {i + 1}
                </div>
              );
            })}
          </div>

          {/* Code Area */}
          <div className="flex-1 bg-[#1e1e1e] py-4 px-4 text-[#d4d4d4]">
            {lines.map((line, i) => {
               const hasTension = activeFile.name.includes('autonomy') && i >= 8 && i <= 12;
               return (
                <div key={i} className={`h-6 whitespace-pre ${hasTension ? 'bg-amber-500/10' : ''}`}>
                  {line}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
