import React from 'react';
import { motion } from 'motion/react';

export function DissonanceGraph() {
  // Mock nodes for the DAG
  const nodes = [
    { id: 'core', x: 400, y: 200, label: 'Core Module', type: 'primary' },
    { id: 'auth', x: 250, y: 100, label: 'Auth Service', type: 'secondary' },
    { id: 'data', x: 550, y: 100, label: 'Data Layer', type: 'secondary' },
    { id: 'agent-1', x: 250, y: 300, label: 'MCP Agent 01', type: 'agent' },
    { id: 'agent-2', x: 550, y: 300, label: 'MCP Agent 02', type: 'agent' },
  ];

  const edges = [
    { from: 'auth', to: 'core' },
    { from: 'data', to: 'core' },
    { from: 'core', to: 'agent-1' },
    { from: 'core', to: 'agent-2' },
    { from: 'agent-1', to: 'agent-2', dashed: true },
  ];

  return (
    <div className="w-full h-[400px] bg-[#1e1e1e] relative overflow-hidden flex flex-col border border-[#333] rounded-lg">
      <div className="absolute top-4 left-4 z-10 bg-[#252526] p-3 rounded shadow-lg border border-[#333]">
        <div className="text-xs text-gray-400">
          <div className="flex items-center mb-1"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> Primary Module</div>
          <div className="flex items-center mb-1"><span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span> Secondary Module</div>
          <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Active Agent</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 800 400">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#555" />
            </marker>
          </defs>
          
          {edges.map((edge, i) => {
            const start = nodes.find(n => n.id === edge.from)!;
            const end = nodes.find(n => n.id === edge.to)!;
            return (
              <motion.line
                key={i}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="#555"
                strokeWidth="2"
                strokeDasharray={edge.dashed ? "5,5" : "0"}
                markerEnd="url(#arrowhead)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            );
          })}

          {nodes.map((node) => (
            <motion.g 
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <circle 
                cx={node.x} 
                cy={node.y} 
                r="30" 
                fill={node.type === 'primary' ? '#3b82f6' : node.type === 'agent' ? '#22c55e' : '#a855f7'} 
                className="cursor-pointer hover:stroke-white hover:stroke-2"
              />
              <text 
                x={node.x} 
                y={node.y + 45} 
                textAnchor="middle" 
                fill="#ccc" 
                fontSize="12"
                className="font-mono"
              >
                {node.label}
              </text>
              {node.type === 'agent' && (
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="34"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="1"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
            </motion.g>
          ))}
        </svg>
      </div>
    </div>
  );
}
