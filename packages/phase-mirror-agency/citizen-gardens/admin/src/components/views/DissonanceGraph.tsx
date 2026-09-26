import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { agencyService, DissonanceGraphData } from '../../services/AgencyService';

export function DissonanceGraph() {
  const [data, setData] = useState<DissonanceGraphData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await agencyService.getDissonanceGraph();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch dissonance graph', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[400px] bg-[#1e1e1e] flex items-center justify-center border border-[#333] rounded-lg">
        <div className="text-blue-400 animate-pulse font-mono text-sm">LOADING DISSONANCE MAP...</div>
      </div>
    );
  }

  const { nodes, edges } = data || { nodes: [], edges: [] };
...

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
