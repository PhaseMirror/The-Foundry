
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ImpactStats from './components/ImpactStats';
import GardenAssistant from './components/GardenAssistant';
import GardenGrid from './components/GardenGrid';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <Hero onStartClick={() => setIsAssistantOpen(true)} />
        
        <section id="impact" className="py-20 bg-emerald-950 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">Growing Our Impact</h2>
            <ImpactStats />
          </div>
        </section>

        <section id="gardens" className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-bold mb-4">Our Community Gardens</h2>
              <p className="text-stone-600 max-w-2xl mx-auto">Discover active plots where neighbors come together to cultivate fresh organic produce and build lasting relationships.</p>
            </div>
            <GardenGrid />
          </div>
        </section>

        <section id="mission" className="py-20 bg-stone-100">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://picsum.photos/seed/community-garden/800/600" 
                alt="People gardening together" 
                className="rounded-2xl shadow-xl"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6 text-emerald-900">The Citizen Gardens Mission</h2>
              <p className="text-lg text-stone-700 mb-6 leading-relaxed">
                We believe that fresh, healthy food is a fundamental human right. By transforming neglected urban spaces into productive community gardens, we're not just growing vegetables—we're growing resilience, education, and belonging.
              </p>
              <ul className="space-y-4 mb-8">
                {['Zero Hunger Initiatives', 'Urban Ecology Education', 'Community Empowerment', 'Sustainable Local Sourcing'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">✓</span>
                    <span className="font-semibold text-stone-800">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105">
                Join the Movement
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      {/* AI Assistant Button & Modal */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setIsAssistantOpen(true)}
          className="w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-emerald-500 transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
        </button>
      </div>

      {isAssistantOpen && (
        <GardenAssistant onClose={() => setIsAssistantOpen(false)} />
      )}
    </div>
  );
};

export default App;
