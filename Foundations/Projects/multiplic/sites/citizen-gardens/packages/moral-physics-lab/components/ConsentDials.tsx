import React from 'react';
import { ConsentState } from '../types';

interface ConsentDialsProps {
  consent: ConsentState;
  onChange: (newConsent: ConsentState) => void;
  disabled?: boolean;
}

const ConsentDials: React.FC<ConsentDialsProps> = ({ consent, onChange, disabled = false }) => {
  
  const update = (key: keyof ConsentState, value: any) => {
    onChange({ ...consent, [key]: value });
  };

  return (
    <div className={`bg-moral-800/50 backdrop-blur-sm border border-moral-700 rounded-xl p-5 space-y-6 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-center border-b border-moral-700 pb-3">
        <h3 className="text-sm font-mono font-bold text-moral-accent tracking-wider uppercase">Sovereignty Control Plane</h3>
        {consent.isRevoked && <span className="text-xs text-moral-danger font-bold animate-pulse">REVOKED</span>}
      </div>

      {/* Cognitive Exploration Dial */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400 font-mono">
          <span>Cognitive Exploration</span>
          <span>{consent.cognitiveExploration}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={consent.cognitiveExploration}
          onChange={(e) => update('cognitiveExploration', parseInt(e.target.value))}
          className="w-full h-2 bg-moral-700 rounded-lg appearance-none cursor-pointer accent-moral-accent"
        />
        <p className="text-[10px] text-gray-500">Limits how deep the system can probe for correlations.</p>
      </div>

      {/* Emotional Depth Dial */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400 font-mono">
          <span>Emotional Depth</span>
          <span>{consent.emotionalDepth}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={consent.emotionalDepth}
          onChange={(e) => update('emotionalDepth', parseInt(e.target.value))}
          className="w-full h-2 bg-moral-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <p className="text-[10px] text-gray-500">Controls semantic resolution of trauma encoding.</p>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <button
          onClick={() => update('institutionalSharing', !consent.institutionalSharing)}
          className={`p-3 rounded-lg border text-xs font-mono transition-all duration-300 ${
            consent.institutionalSharing 
              ? 'bg-moral-500/20 border-moral-500 text-moral-400' 
              : 'bg-moral-900 border-moral-700 text-gray-500'
          }`}
        >
          Share w/ Institutions
          <div className={`w-2 h-2 rounded-full mt-2 ${consent.institutionalSharing ? 'bg-green-400' : 'bg-red-400'}`}></div>
        </button>

        <button
          onClick={() => update('simulationOnly', !consent.simulationOnly)}
          className={`p-3 rounded-lg border text-xs font-mono transition-all duration-300 ${
            consent.simulationOnly 
              ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
              : 'bg-moral-900 border-moral-700 text-gray-500'
          }`}
        >
          Simulation Only
          <div className={`w-2 h-2 rounded-full mt-2 ${consent.simulationOnly ? 'bg-amber-400' : 'bg-gray-600'}`}></div>
        </button>
      </div>

      {/* The Kill Switch */}
      <div className="pt-4 border-t border-moral-700">
        <button
          onClick={() => update('isRevoked', !consent.isRevoked)}
          className={`w-full py-2 px-4 rounded font-mono text-xs font-bold border transition-colors ${
            consent.isRevoked
              ? 'bg-green-900/30 border-green-500 text-green-400 hover:bg-green-900/50'
              : 'bg-red-900/30 border-red-500 text-red-400 hover:bg-red-900/50'
          }`}
        >
          {consent.isRevoked ? "RESTORE SOVEREIGNTY (UN-REVOKE)" : "REVOKE ENTIRE TENSOR"}
        </button>
        <p className="text-[10px] text-center text-gray-600 mt-2">
          Revoking instantly decouples your prime index from all calculations.
        </p>
      </div>
    </div>
  );
};

export default ConsentDials;