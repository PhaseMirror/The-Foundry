import React, { useState, useEffect, useRef } from 'react';
import { ToggleLeft, ToggleRight, Trash2, Moon, Sun, Info } from 'lucide-react';
import { SavedReflection } from '../types';

interface SettingsProps {
  theme?: 'light' | 'dark' | 'dim';
  setTheme?: (theme: 'light' | 'dark' | 'dim') => void;
}

const Settings: React.FC<SettingsProps> = ({ theme = 'dark', setTheme }) => {
  const [micEnabled, setMicEnabled] = useState(false);
  const [retention, setRetention] = useState('24h');
  const [showMemoryInfo, setShowMemoryInfo] = useState(false);
  const [plannerLength, setPlannerLength] = useState('Week');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [savedReflections, setSavedReflections] = useState<SavedReflection[]>(() => {
    return JSON.parse(localStorage.getItem('echo_saved_reflections') || '[]');
  });
  
  const [dyslexicFont, setDyslexicFont] = useState(() => {
    return localStorage.getItem('font-dyslexic') === 'true';
  });

  const toggleDyslexicFont = () => {
    const newValue = !dyslexicFont;
    setDyslexicFont(newValue);
    localStorage.setItem('font-dyslexic', newValue.toString());
    if (newValue) {
      document.documentElement.classList.add('font-dyslexic');
    } else {
      document.documentElement.classList.remove('font-dyslexic');
    }
  };



  const removeReflection = (id: string) => {
    const updated = savedReflections.filter(r => r.id !== id);
    setSavedReflections(updated);
    localStorage.setItem('echo_saved_reflections', JSON.stringify(updated));
  };

  const purgeData = () => {
    if (window.confirm("Incinerate all local session data? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 md:pl-20 p-6 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12">
          <h1 className="text-2xl font-light text-stone-700 dark:text-stone-200 mb-2">Settings & Consent</h1>
          <p className="text-stone-500 dark:text-stone-500 text-sm">You control the memory and the senses.</p>
        </header>

        <section className="space-y-8">
            {/* Appearance */}
            <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 transition-colors duration-300 shadow-sm">
                <h2 className="text-stone-700 dark:text-stone-300 font-medium mb-6">Appearance</h2>
                
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400">
                             {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                        </div>
                        <div>
                            <div className="text-stone-800 dark:text-stone-200">Interface Theme</div>
                            <div className="text-xs text-stone-500 dark:text-stone-500">Choose your visual environment</div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'light', label: 'Light', desc: 'Standard' },
                            { id: 'dim', label: 'Dim', desc: 'Warm' },
                            { id: 'dark', label: 'Dark', desc: 'Low Light' }
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTheme?.(t.id as any)}
                                className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all ${
                                    theme === t.id 
                                    ? 'bg-stone-800 dark:bg-stone-100 border-stone-800 dark:border-stone-100 text-stone-50 dark:text-stone-900' 
                                    : 'bg-stone-50 dark:bg-stone-800 border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600'
                                }`}
                            >
                                <span className="text-sm font-medium">{t.label}</span>
                                <span className="text-[10px] opacity-60">{t.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-stone-800 dark:text-stone-200">Dyslexia-Friendly Font</div>
                        <div className="text-xs text-stone-500 dark:text-stone-500">Enable Lexend (High Readability)</div>
                    </div>
                    <button onClick={toggleDyslexicFont} className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors">
                        {dyslexicFont ? <ToggleRight size={32} className="text-teal-400" /> : <ToggleLeft size={32} />}
                    </button>
                </div>
            </div>



            {/* Planner Settings */}
            <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 transition-colors duration-300 shadow-sm">
                <h2 className="text-stone-700 dark:text-stone-300 font-medium mb-6">Planner</h2>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-stone-800 dark:text-stone-200">Planner Length</div>
                        <div className="text-xs text-stone-500 dark:text-stone-500">Choose your planning horizon</div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {['Week', 'Biweekly', 'Month'].map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setPlannerLength(opt)}
                                className={`py-2 px-4 rounded-xl text-sm transition-all ${ plannerLength === opt ? 'bg-stone-800 dark:bg-stone-100 text-stone-50 dark:text-stone-900' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-stone-800 dark:text-stone-200">Notifications</div>
                        <div className="text-xs text-stone-500 dark:text-stone-500">Receive reminders for upcoming events</div>
                    </div>
                    <button onClick={() => setNotificationsEnabled(!notificationsEnabled)} className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors">
                        {notificationsEnabled ? <ToggleRight size={32} className="text-teal-400" /> : <ToggleLeft size={32} />}
                    </button>
                </div>
            </div>

            {/* Sensory & Input */}
            <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 transition-colors duration-300 shadow-sm">
                <h2 className="text-stone-700 dark:text-stone-300 font-medium mb-6">Sensors</h2>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-stone-800 dark:text-stone-200">Microphone</div>
                        <div className="text-xs text-stone-500 dark:text-stone-500">Allows tone analysis (local processing)</div>
                    </div>
                    <button onClick={() => setMicEnabled(!micEnabled)} className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors">
                        {micEnabled ? <ToggleRight size={32} className="text-teal-400" /> : <ToggleLeft size={32} />}
                    </button>
                </div>
            </div>

            {/* Memory */}
            <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 transition-colors duration-300 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-stone-700 dark:text-stone-300 font-medium">Memory Horizon</h2>
                  <button 
                    onClick={() => setShowMemoryInfo(!showMemoryInfo)}
                    className={`p-1.5 rounded-full transition-colors ${showMemoryInfo ? 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-100' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`}
                    title="What is Memory Horizon?"
                  >
                    <Info size={18} />
                  </button>
                </div>

                {showMemoryInfo && (
                  <div className="mb-6 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl text-xs text-stone-600 dark:text-stone-400 leading-relaxed border border-stone-100 dark:border-stone-800 animate-fade-in">
                    Memory Horizon determines how long your session data is stored locally in your browser. 
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li><span className="font-semibold">Immediate:</span> Data is cleared as soon as you close the tab.</li>
                      <li><span className="font-semibold">24h / 7d:</span> Data persists for the specified duration.</li>
                      <li><span className="font-semibold">Never:</span> Data stays until you manually select 'Incinerate'.</li>
                    </ul>
                    <p className="mt-2 text-stone-400 dark:text-stone-500 italic">EchoBraid never uploads your journal or chat history to a server.</p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {['Immediate', '24h', '7d', 'Never'].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => setRetention(opt)}
                            className={`py-2 px-4 rounded-xl text-sm transition-all ${
                                retention === opt 
                                ? 'bg-stone-800 dark:bg-stone-100 text-stone-50 dark:text-stone-900' 
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* Saved Reflections List */}
                <div className="mb-8">
                    <h3 className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-600 font-bold mb-4">Saved Reflections</h3>
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {savedReflections.length === 0 ? (
                            <div className="py-8 text-center border-2 border-dashed border-stone-100 dark:border-stone-800 rounded-2xl">
                                <p className="text-xs text-stone-400 dark:text-stone-600">No reflections saved yet.</p>
                            </div>
                        ) : (
                            savedReflections.map((ref) => (
                                <div key={ref.id} className="group flex flex-col p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-100 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                                                {new Date(ref.timestamp).toLocaleDateString()} • {new Date(ref.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                            <span className="text-[10px] text-stone-500 dark:text-stone-400 italic truncate max-w-[180px]">
                                                {ref.promptText}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => removeReflection(ref.id)}
                                            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-stone-700 dark:text-stone-300 line-clamp-2 leading-relaxed">
                                        {ref.text}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="pt-6 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center">
                    <span className="text-sm text-stone-600 dark:text-stone-400">Purge all local data now</span>
                    <button 
                      onClick={purgeData}
                      className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                        <span>Incinerate</span>
                    </button>
                </div>
            </div>
        </section>

        <div className="mt-12 text-center">
            <p className="text-xs text-stone-400 dark:text-stone-600 font-mono">
                EchoBraid v0.1 • Ξ12 Safety Layer Active
            </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;