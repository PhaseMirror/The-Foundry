import React, { useState, useEffect } from 'react';
import { Tensor, ConsentState } from '../types';
import ConsentDials from './ConsentDials';

interface TensorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Tensor>) => void;
  initialData?: Tensor | null;
  mode: 'create' | 'edit';
}

const TensorModal: React.FC<TensorModalProps> = ({ isOpen, onClose, onSave, initialData, mode }) => {
  const [name, setName] = useState('');
  const [narrative, setNarrative] = useState('');
  const [axes, setAxes] = useState({ dignity: 0.5, systemicHarm: 0.5, resilience: 0.5 });
  const [consent, setConsent] = useState<ConsentState>({
    cognitiveExploration: 50,
    emotionalDepth: 50,
    institutionalSharing: false,
    simulationOnly: true,
    isRevoked: false
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === 'edit') {
        setName(initialData.name);
        setNarrative(initialData.narrativeSummary);
        setAxes(initialData.semanticAxes);
        setConsent(initialData.consent);
      } else {
        // Reset for create mode
        setName('');
        setNarrative('');
        setAxes({ dignity: 0.5, systemicHarm: 0.5, resilience: 0.5 });
        setConsent({
          cognitiveExploration: 50,
          emotionalDepth: 50,
          institutionalSharing: false,
          simulationOnly: true,
          isRevoked: false
        });
      }
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSave({
      name: name.trim() || undefined, // undefined lets the parent generate a default if needed
      narrativeSummary: narrative,
      semanticAxes: axes,
      consent: consent
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f111a] border border-moral-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b border-moral-800 bg-[#0f111a] sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {mode === 'edit' ? 'Edit Tensor Configuration' : 'Encode New Tensor'}
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-1">
              {mode === 'edit' ? `Modifying Prime Index p=${initialData?.primeIndex}` : 'New Prime Index will be assigned cryptographically.'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Metadata Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Subject Name / Alias (Optional)</label>
              <input 
                type="text"
                className="w-full bg-moral-900 border border-moral-700 rounded-lg p-3 text-sm focus:border-moral-accent outline-none text-gray-200"
                placeholder={mode === 'create' ? "Auto-generated if empty" : ""}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Testimony Narrative</label>
              <textarea 
                className="w-full bg-moral-900 border border-moral-700 rounded-lg p-3 text-sm focus:border-moral-accent outline-none min-h-[100px] text-gray-300 placeholder-gray-600"
                placeholder="Describe the systemic failure..."
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Semantic Axes Sliders */}
            <div className="bg-moral-800/30 p-4 rounded-xl border border-moral-800 space-y-4">
              <p className="text-xs font-mono font-bold text-gray-400 uppercase border-b border-moral-800 pb-2">Semantic Axes</p>
              
              {/* Dignity */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span className="uppercase tracking-wider">Dignity</span>
                  <span className="font-mono text-green-400">{(axes.dignity * 100).toFixed(0)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" 
                  value={axes.dignity}
                  onChange={e => setAxes({...axes, dignity: parseFloat(e.target.value)})}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
              </div>

              {/* Harm */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span className="uppercase tracking-wider">Systemic Harm</span>
                  <span className="font-mono text-red-400">{(axes.systemicHarm * 100).toFixed(0)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" 
                  value={axes.systemicHarm}
                  onChange={e => setAxes({...axes, systemicHarm: parseFloat(e.target.value)})}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              {/* Resilience */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span className="uppercase tracking-wider">Resilience</span>
                  <span className="font-mono text-blue-400">{(axes.resilience * 100).toFixed(0)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" 
                  value={axes.resilience}
                  onChange={e => setAxes({...axes, resilience: parseFloat(e.target.value)})}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
            
            {/* Consent Controls */}
            <ConsentDials consent={consent} onChange={setConsent} />
          </div>
        </div>

        <div className="p-6 border-t border-moral-800 bg-moral-900/50 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-moral-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!narrative.trim()}
            className={`px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition-all ${
              !narrative.trim() 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-moral-accent text-black hover:bg-cyan-400 shadow-cyan-500/20'
            }`}
          >
            {mode === 'edit' ? 'Save Changes' : 'Encode Tensor'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TensorModal;