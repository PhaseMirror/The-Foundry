import React, { useState, useEffect } from 'react';
import { Tensor, Policy } from './types';
import { INITIAL_TENSORS, AVAILABLE_POLICIES } from './constants';
import HypergraphCanvas from './components/HypergraphCanvas';
import TensorCard from './components/TensorCard';
import Dashboard from './components/Dashboard';
import TensorModal from './components/TensorModal';

// Mock function to simulate next prime number for ID
const getNextPrime = (currentPrimes: number[]) => {
    let num = currentPrimes[currentPrimes.length - 1] + 1;
    while (true) {
        let isPrime = true;
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) { isPrime = false; break; }
        }
        if (isPrime) return num;
        num++;
    }
};

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'survivor' | 'simulator' | 'governance'>('survivor');
  
  // App State
  const [tensors, setTensors] = useState<Tensor[]>(INITIAL_TENSORS);
  const [policies, setPolicies] = useState<Policy[]>(AVAILABLE_POLICIES);
  const [lambdaM, setLambdaM] = useState<number>(1.2); // Initial moral drift
  const [lambdaHistory, setLambdaHistory] = useState<{time: string, value: number}[]>([]);
  
  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTensorId, setEditingTensorId] = useState<string | null>(null);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Simulation Tick (Lambda Evolution)
  useEffect(() => {
    const interval = setInterval(() => {
        // Calculate drift based on active policies and tensor states
        let driftDelta = 0.0;
        
        // Policies impact
        policies.forEach(p => {
            if (p.active) driftDelta += p.impactVector.lambdaModifier * 0.1;
        });

        // Tensors impact (unresolved harm increases drift)
        tensors.forEach(t => {
            if (!t.consent.isRevoked) {
                // High harm + Low Dignity = Drift
                if (t.semanticAxes.systemicHarm > 0.7 && t.semanticAxes.dignity < 0.3) {
                    driftDelta += 0.05;
                }
                // High Resilience helps correct
                if (t.semanticAxes.resilience > 0.8) {
                    driftDelta -= 0.02;
                }
            }
        });

        // Add random fluctuation (Entropy)
        driftDelta += (Math.random() - 0.5) * 0.1;

        setLambdaM(prev => {
            const next = Math.max(0, Math.min(10, prev + driftDelta));
            setLambdaHistory(h => {
                const newHistory = [...h, { time: new Date().toLocaleTimeString(), value: next }];
                if (newHistory.length > 20) newHistory.shift();
                return newHistory;
            });
            return next;
        });

    }, 2000);

    return () => clearInterval(interval);
  }, [policies, tensors]);

  const handleResetSimulation = () => {
    setTensors(INITIAL_TENSORS);
    setPolicies(AVAILABLE_POLICIES);
    setLambdaM(1.2);
    setLambdaHistory([]);
    setEditingTensorId(null);
    setIsModalOpen(false);
    addNotification("Simulation reset to initial parameters.", "info");
  };

  const openCreateModal = () => {
    setEditingTensorId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (id: string) => {
    setEditingTensorId(id);
    setIsModalOpen(true);
  };

  const handleModalSave = (data: Partial<Tensor>) => {
    if (editingTensorId) {
      // Edit mode
      setTensors(tensors.map(t => {
        if (t.id === editingTensorId) {
          return {
            ...t,
            name: data.name || t.name,
            narrativeSummary: data.narrativeSummary!,
            semanticAxes: data.semanticAxes!,
            consent: data.consent!
          };
        }
        return t;
      }));
      addNotification("Tensor configuration updated.", "success");
    } else {
      // Create mode
      const newPrime = getNextPrime(tensors.map(t => t.primeIndex));
      const newTensor: Tensor = {
        id: `t-${Date.now()}`,
        primeIndex: newPrime,
        name: data.name || `Anonymous Survivor (p=${newPrime})`,
        narrativeSummary: data.narrativeSummary!,
        semanticAxes: data.semanticAxes!,
        consent: data.consent!,
        entanglementFactor: Math.random(),
        timestamp: Date.now()
      };
      setTensors([...tensors, newTensor]);
      setActiveTab('simulator');
      addNotification("New Tensor encoded into the field.", "success");
    }
  };

  const handleTogglePolicy = (id: string) => {
    setPolicies(policies.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  return (
    <div className="flex flex-col h-screen bg-[#050508] text-slate-200 font-sans selection:bg-moral-accent selection:text-black overflow-hidden relative">
      
      {/* Notifications Container */}
      <div className="absolute top-20 right-6 z-[60] flex flex-col space-y-2 pointer-events-none">
          {notifications.map(n => (
              <div key={n.id} className={`pointer-events-auto px-4 py-2 rounded shadow-lg border text-xs font-mono animate-fade-in-down ${
                  n.type === 'success' ? 'bg-green-900/80 border-green-500 text-green-100' :
                  n.type === 'error' ? 'bg-red-900/80 border-red-500 text-red-100' :
                  'bg-moral-800/90 border-moral-500 text-blue-100'
              }`}>
                  {n.message}
              </div>
          ))}
      </div>

      {/* Navbar */}
      <header className="flex-none h-16 border-b border-moral-800 flex items-center justify-between px-6 bg-moral-900/50 backdrop-blur-md z-50">
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-moral-500 to-moral-accent flex items-center justify-center font-mono font-bold text-black shadow-lg shadow-moral-500/20">
                MP
            </div>
            <div>
                <h1 className="font-bold tracking-tight text-white leading-tight">Moral Physics Lab</h1>
                <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Citizen Gardens Initiative</p>
            </div>
        </div>

        <nav className="flex space-x-1 bg-moral-900 p-1 rounded-lg border border-moral-800">
            {(['survivor', 'simulator', 'governance'] as const).map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                        activeTab === tab 
                        ? 'bg-moral-700 text-white shadow-sm' 
                        : 'text-gray-400 hover:text-gray-200 hover:bg-moral-800/50'
                    }`}
                >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} Mode
                </button>
            ))}
        </nav>

        <div className="flex items-center space-x-4">
            <button 
                onClick={handleResetSimulation}
                className="hidden md:block px-3 py-1 text-[10px] font-mono border border-red-900 bg-red-900/20 text-red-400 rounded hover:bg-red-900/40 transition-colors"
            >
                RESET SIMULATION
            </button>
             <div className="text-right hidden md:block">
                 <p className="text-[10px] text-gray-500 font-mono">System Integrity</p>
                 <p className="text-xs font-mono text-green-400">98.4% NOMINAL</p>
             </div>
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative flex overflow-hidden">
        
        {/* Left Panel: Survivor/Tensor Management */}
        <aside className={`w-96 border-r border-moral-800 bg-[#0a0b14] flex flex-col transition-all duration-500 absolute md:relative z-20 h-full ${activeTab === 'survivor' ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-80'}`}>
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white">Lived Experience</h2>
                    <p className="text-xs text-gray-500">The Moral Field Registry</p>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button 
                  onClick={openCreateModal}
                  className="w-full py-3 mb-8 bg-moral-accent hover:bg-cyan-400 text-black font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Encode New Tensor</span>
                </button>

                <div className="border-t border-moral-800 pt-6 flex-1">
                    <h3 className="text-xs font-mono text-gray-500 uppercase mb-4 tracking-wider">Active Tensors</h3>
                    <div className="space-y-3 pb-8">
                        {tensors.map(t => (
                            <TensorCard 
                                key={t.id}
                                tensor={t} 
                                onEdit={() => openEditModal(t.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </aside>

        {/* Center Panel: Simulation Canvas */}
        <section className="flex-1 relative flex flex-col bg-[#050508]">
             {/* Canvas Container */}
             <div className="flex-1 p-4 relative overflow-hidden">
                <HypergraphCanvas tensors={tensors} lambdaM={lambdaM} policies={policies} />
                
                {/* Overlay Controls */}
                <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
                     <div className="bg-moral-900/80 backdrop-blur border border-moral-700 rounded-xl p-4 flex items-center space-x-4 pointer-events-auto max-w-2xl mx-auto">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-moral-700 hover:bg-moral-600 transition-colors">
                             <span className="text-white">▶</span>
                        </button>
                        <div className="flex-1">
                            <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                                <span>Timeline: 2024</span>
                                <span>Forecast: 2030</span>
                            </div>
                            <div className="h-1 bg-moral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-moral-accent w-1/3"></div>
                            </div>
                        </div>
                     </div>
                </div>
             </div>
        </section>

        {/* Right Panel: Governance Dashboard (Slide-over) */}
        <aside className={`w-96 border-l border-moral-800 bg-[#0a0b14] flex flex-col transition-all duration-500 absolute right-0 h-full z-20 ${activeTab === 'governance' ? 'translate-x-0' : 'translate-x-full hidden md:flex md:w-80'}`}>
            <div className="p-6 h-full flex flex-col overflow-y-auto custom-scrollbar">
                <h2 className="text-lg font-bold mb-1 text-white">Governance & Audit</h2>
                <p className="text-xs text-gray-500 mb-6">Monitor systemic moral drift (Λm).</p>
                
                <Dashboard 
                    lambdaHistory={lambdaHistory} 
                    policies={policies}
                    onTogglePolicy={handleTogglePolicy}
                />
            </div>
        </aside>

        {/* Tensor Creator/Editor Modal */}
        <TensorModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
          mode={editingTensorId ? 'edit' : 'create'}
          initialData={editingTensorId ? tensors.find(t => t.id === editingTensorId) : null}
        />

      </main>
    </div>
  );
};

export default App;