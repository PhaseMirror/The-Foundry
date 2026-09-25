import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface BreathOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

const BreathOverlay: React.FC<BreathOverlayProps> = ({ isOpen, onClose, reason }) => {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [count, setCount] = useState(4);

  useEffect(() => {
    if (!isOpen) return;

    // 4-7-8 Breathing Pattern Simulation
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev === 1) {
          if (phase === 'Inhale') {
            setPhase('Hold');
            return 7;
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            return 8;
          } else {
            setPhase('Inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, phase]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-md flex flex-col items-center justify-center transition-opacity duration-500">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 transition-colors"
      >
        <X size={32} />
      </button>

      {reason && (
        <div className="absolute top-12 md:top-24 px-6 text-center animate-fade-in">
          <p className="text-stone-600 dark:text-stone-400 font-medium italic text-lg">{reason}</p>
        </div>
      )}

      <div className="relative flex items-center justify-center">
        {/* Breathing Circle */}
        <div 
          className={`
            w-64 h-64 rounded-full border-4 border-stone-300 dark:border-stone-700
            flex items-center justify-center
            transition-all duration-[1000ms] ease-in-out
            ${phase === 'Inhale' ? 'scale-125 bg-stone-100 dark:bg-stone-800' : ''}
            ${phase === 'Hold' ? 'scale-125 bg-stone-200 dark:bg-stone-800/80 border-stone-500 dark:border-stone-600' : ''}
            ${phase === 'Exhale' ? 'scale-100 bg-stone-50 dark:bg-stone-900' : ''}
          `}
        >
          <div className="text-center">
            <h2 className="text-3xl font-light text-stone-700 dark:text-stone-300 mb-2">{phase}</h2>
            <p className="text-xl text-stone-500 dark:text-stone-500 font-mono">{count}</p>
          </div>
        </div>
        
        {/* Outer Halo */}
        <div className={`
          absolute w-64 h-64 rounded-full bg-teal-100/30 dark:bg-teal-900/30 blur-3xl -z-10
          transition-all duration-[1000ms]
          ${phase === 'Inhale' ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}
        `} />
      </div>

      <div className="mt-12">
        <button 
          onClick={onClose}
          className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 text-sm tracking-widest uppercase border-b border-transparent hover:border-stone-600 dark:hover:border-stone-500 transition-all pb-1"
        >
          Return to Loop
        </button>
      </div>
    </div>
  );
};

export default BreathOverlay;