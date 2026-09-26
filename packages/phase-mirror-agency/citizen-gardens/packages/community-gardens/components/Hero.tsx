
import React from 'react';

interface HeroProps {
  onStartClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartClick }) => {
  return (
    <section className="relative h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=2000" 
          alt="Gardening background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10 text-white">
        <div className="max-w-3xl">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight drop-shadow-lg">
            Cultivate Your <span className="text-emerald-400 italic">Community</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-stone-100 max-w-2xl font-light leading-relaxed">
            Citizen Gardens is a network of local food activists building sustainable urban farms for a greener, healthier future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onStartClick}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-full text-lg font-bold transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-2"
            >
              Ask Our Garden AI
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            <a 
              href="#gardens"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-10 py-4 rounded-full text-lg font-bold transition-all text-center"
            >
              Explore Gardens
            </a>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
      </div>
    </section>
  );
};

export default Hero;
