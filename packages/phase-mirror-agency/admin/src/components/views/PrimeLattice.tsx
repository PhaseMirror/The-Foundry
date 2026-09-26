import React from 'react';

export function PrimeLattice() {
  // Mock lattice grid
  const gridSize = 8;
  const cells = Array.from({ length: gridSize * gridSize }, (_, i) => {
    const x = i % gridSize;
    const y = Math.floor(i / gridSize);
    // Mock drift
    const hasDrift = Math.random() > 0.9;
    const isStable = Math.random() > 0.3;
    return { x, y, hasDrift, isStable };
  });

  return (
    <div className="flex-1 bg-[#1e1e1e] p-8 flex flex-col items-center justify-center">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-light text-white mb-2">Prime Lattice Visualization</h2>
        <p className="text-gray-400 text-sm">Visualizing prime-index decomposition and structural drift.</p>
      </div>

      <div className="grid grid-cols-8 gap-2 p-4 bg-[#252526] rounded-lg border border-[#333]">
        {cells.map((cell, i) => (
          <div 
            key={i}
            className={`
              w-12 h-12 rounded-sm flex items-center justify-center text-xs font-mono transition-all duration-500 hover:scale-110 cursor-pointer
              ${cell.hasDrift ? 'bg-red-900/50 border border-red-500 text-red-200' : 
                cell.isStable ? 'bg-blue-900/20 border border-blue-500/30 text-blue-200' : 'bg-[#333] border border-[#444] text-gray-600'}
            `}
            title={`Cell ${cell.x},${cell.y} - ${cell.hasDrift ? 'DRIFT DETECTED' : cell.isStable ? 'Stable' : 'Empty'}`}
          >
            {cell.hasDrift ? 'DRIFT' : cell.isStable ? 'P-IDX' : ''}
          </div>
        ))}
      </div>

      <div className="mt-6 flex space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-900/20 border border-blue-500/30 mr-2"></div>
          <span className="text-gray-400">Stable Invariant</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-900/50 border border-red-500 mr-2"></div>
          <span className="text-gray-400">Structural Drift</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#333] border border-[#444] mr-2"></div>
          <span className="text-gray-400">Unmapped</span>
        </div>
      </div>
    </div>
  );
}
