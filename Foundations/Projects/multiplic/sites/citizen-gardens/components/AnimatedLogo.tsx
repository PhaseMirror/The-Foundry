import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedLogo: React.FC = () => {
  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-citizen-green/20 blur-lg rounded-full" />

      {/* Outer Ring - C */}
      <motion.div
        className="absolute inset-0 rounded-full border border-citizen-green/30 border-t-citizen-green border-r-transparent border-b-citizen-green/30 border-l-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Inner Ring - G */}
      <motion.div
        className="absolute inset-[6px] rounded-full border border-citizen-purple/30 border-t-transparent border-r-citizen-purple border-b-transparent border-l-citizen-purple/30"
        animate={{ rotate: -360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      {/* Tech Markers */}
      <motion.div 
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute top-0 left-1/2 w-1 h-1 bg-citizen-green rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_5px_#10b981]" />
      </motion.div>

      <motion.div 
        className="absolute inset-[6px]"
        animate={{ rotate: -360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-citizen-purple rounded-full -translate-x-1/2 translate-y-1/2 shadow-[0_0_5px_#8b5cf6]" />
      </motion.div>

      {/* Center Core */}
      <div className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10" />
      
      {/* Letters overlay - subtle */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
         {/* Could add letters here if needed, but the rings imply C and G */}
      </div>
    </div>
  );
};
