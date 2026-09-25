import React from 'react';
import { AtomicStructureScene } from '../components/QuantumScene';
import { PilotRoadmap } from '../components/Diagrams';

const GardensPage: React.FC = () => {
  return (
    <div className="pt-32 pb-24">
      {/* Gardens Section */}
      <section id="gardens" className="py-24 bg-transparent relative z-10">
           <div className="container mx-auto px-6">
               <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
                   <div className="flex-1">
                       <span className="text-citizen-green text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Civic Infrastructure</span>
                       <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">Sovereign Urban Gardens</h2>
                       <p className="text-zinc-400 text-lg mb-6">
                          Community-controlled garden nodes that combine food production, training, and local governance. The goal: measurable gains in food security, safety, and dignity.
                       </p>
                       <ul className="space-y-4 text-zinc-300">
                           <li className="flex items-center gap-3">
                               <span className="w-2 h-2 bg-citizen-green rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                               Micro-lot (≤2,000 sq ft): Raised beds, tool locker, kiosk.
                           </li>
                           <li className="flex items-center gap-3">
                               <span className="w-2 h-2 bg-citizen-green rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                               Pocket Garden (2k-10k sq ft): Hoop house, cold storage, teaching zone.
                           </li>
                           <li className="flex items-center gap-3">
                               <span className="w-2 h-2 bg-citizen-green rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                               Community Farm (&gt;10k sq ft): Market stand, nursery, shared shed.
                           </li>
                       </ul>
                   </div>
                   <div className="flex-1 aspect-square md:aspect-video w-full relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl">
                       <AtomicStructureScene />
                       <div className="absolute bottom-4 left-4 right-4 text-center bg-black/50 backdrop-blur-sm p-2 rounded text-xs text-zinc-400 border border-zinc-700">
                           Visualization: The Socio-Atomic nucleus of a Sovereign Garden
                       </div>
                   </div>
               </div>

               <div id="roadmap" className="mt-32">
                  <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="font-serif text-4xl text-white mb-6">Fastest Path to Proof</h2>
                    <p className="text-zinc-400">Our strategic roadmap for deploying and validating Sovereign Urban Gardens.</p>
                  </div>
                  <PilotRoadmap />
               </div>
           </div>
      </section>
    </div>
  );
};

export default GardensPage;
