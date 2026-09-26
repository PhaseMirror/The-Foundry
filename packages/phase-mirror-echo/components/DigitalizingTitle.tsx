import React, { useState, useEffect, useRef } from 'react';

interface DigitalizingTitleProps {
  theme: 'light' | 'dark' | 'dim';
  className?: string;
}

const DigitalizingTitle: React.FC<DigitalizingTitleProps> = ({ theme, className = '' }) => {
  const originalText = "Phase Mirror";
  const [displayText, setDisplayText] = useState(originalText);
  const [isDigitalizing, setIsDigitalizing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const chars = "▲▼█░▒▓01λ∮∑ΦΨΛ_/[ ]#<>";

  const triggerDigitalization = () => {
    if (isDigitalizing) return;
    setIsDigitalizing(true);

    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(() => {
        return originalText
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) {
              return originalText[index];
            }
            // Scramble remaining characters
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("");
      });

      iteration += 1 / 3; // Multi-step resolve for a high-fidelity rolling cyber effect
      if (iteration >= originalText.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(originalText);
        setIsDigitalizing(false);
      }
    }, 40);
  };

  // Run on mount and establish a slow continuous periodic sync sweep
  useEffect(() => {
    // Slight delay before initial digitalization on mount
    const initialDelay = setTimeout(() => {
      triggerDigitalization();
    }, 600);

    const periodicTimer = setInterval(() => {
      triggerDigitalization();
    }, 15000); 

    return () => {
      clearTimeout(initialDelay);
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearInterval(periodicTimer);
    };
  }, []);

  const textClass = theme === 'dark' || theme === 'dim'
    ? 'text-stone-100 group-hover:text-[#2dd4bf] text-shadow-glow'
    : 'text-stone-800 group-hover:text-emerald-600';

  return (
    <div 
      className={`relative flex items-center gap-2 group select-none ${className}`}
      onMouseEnter={triggerDigitalization}
    >
      <span className={`font-mono font-black text-xl tracking-widest transition-all duration-300 ${textClass}`}>
        {displayText}
      </span>
      {/* Interactive signal pulse beacon */}
      <span className={`w-1.5 h-4.5 rounded-sm transition-all duration-300 ${
        isDigitalizing 
          ? 'bg-[#2dd4bf] animate-pulse scale-y-125 shadow-[0_0_8px_#2dd4bf]' 
          : 'bg-stone-500/20 group-hover:bg-[#2dd4bf] group-hover:shadow-[0_0_6px_#2dd4bf]'
      }`} />
    </div>
  );
};

export default DigitalizingTitle;
