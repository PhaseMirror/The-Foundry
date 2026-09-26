import React from 'react';
import GardenScene from './components/Garden/GardenScene';

function App() {
  return (
    <div className="w-full h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-widest text-green-400">SUG DAO // PHASE MIRROR</h1>
        <div className="flex gap-4">
          <span className="px-3 py-1 bg-green-900 text-green-200 rounded text-sm font-mono">LIVE TELEMETRY</span>
        </div>
      </header>
      
      <div className="w-full bg-blue-900/40 text-blue-200 text-sm font-mono p-2 text-center border-b border-blue-900">
        🔬 <strong>Pilot Mode</strong> — This is a live research deployment. All metrics are experimental and subject to refinement. Your feedback is invaluable.
      </div>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 relative">
          <div className="absolute top-4 left-4 z-10 text-sm font-mono text-gray-400">
            PREMIUM WEBGL GARDEN RENDERING
          </div>
          <GardenScene />
        </div>
        
        <div className="border-l border-gray-800 p-6 flex flex-col gap-6 bg-black overflow-y-auto">
          <div>
            <h2 className="text-sm text-gray-500 mb-2 font-mono">EMBODIED CHECK-IN</h2>
            <div className="p-4 border border-gray-800 rounded bg-gray-900">
              <p className="text-xs text-gray-400 mb-4">Select your nervous system state.</p>
              <div className="flex flex-col gap-2">
                <button className="text-left px-4 py-2 hover:bg-gray-800 rounded border border-gray-700">Ventral (Engaged)</button>
                <button className="text-left px-4 py-2 hover:bg-gray-800 rounded border border-gray-700">Sympathetic (Mobilized)</button>
                <button className="text-left px-4 py-2 hover:bg-gray-800 rounded border border-gray-700">Dorsal (Shutdown)</button>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-sm text-gray-500 mb-2 font-mono">COHERENCE METRICS</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-green-900 rounded bg-green-950/20 flex flex-col items-center">
                <span className="text-xs text-green-500">RESONANCE</span>
                <span className="text-2xl font-bold text-green-400">72.4%</span>
              </div>
              <div className="p-4 border border-blue-900 rounded bg-blue-950/20 flex flex-col items-center">
                <span className="text-xs text-blue-500">SOVEREIGNTY</span>
                <span className="text-2xl font-bold text-blue-400">68.1%</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
