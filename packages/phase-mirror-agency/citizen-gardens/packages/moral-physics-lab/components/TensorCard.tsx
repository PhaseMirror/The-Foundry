import React from 'react';
import { Tensor } from '../types';

interface TensorCardProps {
  tensor: Tensor;
  onEdit?: () => void;
}

const TensorCard: React.FC<TensorCardProps> = ({ tensor, onEdit }) => {
  const isRevoked = tensor.consent.isRevoked;

  return (
    <div 
      onClick={onEdit}
      className={`relative group p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
      isRevoked 
        ? 'bg-gray-900/50 border-gray-800 opacity-60 grayscale' 
        : 'bg-[#121420] border-moral-800/60 hover:border-moral-accent/50 hover:bg-[#1a1d2e] hover:shadow-lg hover:shadow-moral-accent/5'
    }`}>
      
      {/* Header Row: Name & Status */}
      <div className="flex justify-between items-start mb-2">
        <h4 className={`font-semibold text-sm leading-tight ${isRevoked ? 'text-gray-500' : 'text-gray-100 group-hover:text-moral-accent transition-colors'}`}>
          {tensor.name}
        </h4>
        {isRevoked && (
          <span className="text-[9px] font-bold bg-red-900/30 text-red-500 border border-red-900/50 px-1.5 py-0.5 rounded tracking-wider uppercase">
            Revoked
          </span>
        )}
      </div>

      {/* Metadata Row: ID & Prime Index */}
      <div className="flex items-center space-x-3 text-[10px] font-mono text-gray-500 mb-3 border-b border-white/5 pb-2">
        <span className="bg-white/5 px-1.5 py-0.5 rounded text-gray-400">p={tensor.primeIndex}</span>
        <span className="opacity-70">ID: {tensor.id}</span>
        <span className="ml-auto opacity-50">α: {tensor.entanglementFactor.toFixed(2)}</span>
      </div>

      {/* Narrative Section */}
      <div className="mb-4">
        <p className={`text-xs italic leading-relaxed line-clamp-3 ${isRevoked ? 'text-gray-600' : 'text-gray-400'}`}>
          "{tensor.narrativeSummary}"
        </p>
      </div>

      {/* Axes Visualization */}
      <div className="grid grid-cols-3 gap-2 h-16 bg-black/20 rounded-lg p-2 border border-white/5">
        {/* Dignity */}
        <div className="flex flex-col justify-end space-y-1">
          <div className="w-full bg-gray-800/50 rounded-sm h-full relative overflow-hidden">
            <div 
              className="absolute bottom-0 w-full bg-green-500/60 transition-all duration-1000"
              style={{ height: `${tensor.semanticAxes.dignity * 100}%` }}
            />
          </div>
          <span className="text-[8px] uppercase text-center text-gray-600 font-mono tracking-tighter">Dig</span>
        </div>
        
        {/* Harm */}
        <div className="flex flex-col justify-end space-y-1">
          <div className="w-full bg-gray-800/50 rounded-sm h-full relative overflow-hidden">
            <div 
              className="absolute bottom-0 w-full bg-red-500/60 transition-all duration-1000"
              style={{ height: `${tensor.semanticAxes.systemicHarm * 100}%` }}
            />
          </div>
          <span className="text-[8px] uppercase text-center text-gray-600 font-mono tracking-tighter">Harm</span>
        </div>

        {/* Resilience */}
        <div className="flex flex-col justify-end space-y-1">
          <div className="w-full bg-gray-800/50 rounded-sm h-full relative overflow-hidden">
            <div 
              className="absolute bottom-0 w-full bg-blue-500/60 transition-all duration-1000"
              style={{ height: `${tensor.semanticAxes.resilience * 100}%` }}
            />
          </div>
          <span className="text-[8px] uppercase text-center text-gray-600 font-mono tracking-tighter">Res</span>
        </div>
      </div>
      
      {/* Edit Hint Overlay */}
      {!isRevoked && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[9px] bg-moral-700 text-white px-2 py-1 rounded shadow-sm border border-moral-600">Edit</span>
        </div>
      )}
    </div>
  );
};

export default TensorCard;