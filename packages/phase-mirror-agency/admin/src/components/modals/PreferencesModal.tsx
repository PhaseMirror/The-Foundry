import React, { useState, useEffect } from 'react';
import { X, Save, Cpu, Zap, MessageSquare, Code } from 'lucide-react';
import { motion } from 'motion/react';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: any) => void;
  initialPreferences?: any;
}

const AVAILABLE_MODELS = [
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Best for complex reasoning and coding tasks.', icon: Cpu },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and efficient for high-volume tasks.', icon: Zap },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'High intelligence and multimodal capabilities.', icon: MessageSquare },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Excellent for coding and creative writing.', icon: Code },
];

export function PreferencesModal({ isOpen, onClose, onSave, initialPreferences }: PreferencesModalProps) {
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-pro');
  const [chatModel, setChatModel] = useState('gemini-1.5-pro');
  const [codeModel, setCodeModel] = useState('gemini-1.5-pro');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialPreferences) {
      setSelectedModel(initialPreferences.globalModel || 'gemini-1.5-pro');
      setChatModel(initialPreferences.chatModel || 'gemini-1.5-pro');
      setCodeModel(initialPreferences.codeModel || 'gemini-1.5-pro');
    }
  }, [initialPreferences]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onSave({
        globalModel: selectedModel,
        chatModel,
        codeModel
      });
      setIsLoading(false);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-4 border-b border-[#333] shrink-0">
          <h2 className="text-lg font-medium text-white flex items-center">
            <Cpu className="mr-2 text-blue-500" size={20} />
            AI Model Preferences
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Global Default Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Default Model</h3>
              <p className="text-xs text-gray-500">This model will be used for all AI interactions unless overridden below.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AVAILABLE_MODELS.map((model) => (
                  <div 
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`cursor-pointer border rounded-lg p-4 transition-all ${
                      selectedModel === model.id 
                        ? 'bg-blue-900/20 border-blue-500 ring-1 ring-blue-500' 
                        : 'bg-[#252526] border-[#333] hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-md ${selectedModel === model.id ? 'bg-blue-600 text-white' : 'bg-[#333] text-gray-400'}`}>
                          <model.icon size={18} />
                        </div>
                        <div>
                          <h4 className={`text-sm font-medium ${selectedModel === model.id ? 'text-white' : 'text-gray-300'}`}>
                            {model.name}
                          </h4>
                        </div>
                      </div>
                      {selectedModel === model.id && (
                        <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-3 ml-11">
                      {model.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-[#333]" />

            {/* Specific Overrides */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Feature Overrides</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[#252526] p-4 rounded-lg border border-[#333]">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="text-purple-400" size={20} />
                    <div>
                      <h4 className="text-sm font-medium text-white">Chat & Conversations</h4>
                      <p className="text-xs text-gray-500">Model used for the global chat interface.</p>
                    </div>
                  </div>
                  <select 
                    value={chatModel}
                    onChange={(e) => setChatModel(e.target.value)}
                    className="bg-[#1e1e1e] border border-[#333] text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500"
                  >
                    {AVAILABLE_MODELS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between bg-[#252526] p-4 rounded-lg border border-[#333]">
                  <div className="flex items-center space-x-3">
                    <Code className="text-green-400" size={20} />
                    <div>
                      <h4 className="text-sm font-medium text-white">Code Generation</h4>
                      <p className="text-xs text-gray-500">Model used for autocomplete and refactoring.</p>
                    </div>
                  </div>
                  <select 
                    value={codeModel}
                    onChange={(e) => setCodeModel(e.target.value)}
                    className="bg-[#1e1e1e] border border-[#333] text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500"
                  >
                    {AVAILABLE_MODELS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-[#333] bg-[#1e1e1e] flex justify-end space-x-3 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
          >
            <Save size={18} className="mr-2" />
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
