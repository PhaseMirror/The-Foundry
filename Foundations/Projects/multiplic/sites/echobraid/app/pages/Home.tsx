import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wind, MessageSquare, PenTool, Compass, Play, Trophy, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TILE_COLORS = {
  red: 'shadow-[0_0_30px_rgba(239,68,68,0.6)] border-red-500 bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400',
  yellow: 'shadow-[0_0_30px_rgba(234,179,8,0.6)] border-yellow-500 bg-yellow-50 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400',
  green: 'shadow-[0_0_30px_rgba(34,197,94,0.6)] border-green-500 bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400',
  blue: 'shadow-[0_0_30px_rgba(59,130,246,0.6)] border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
};

const TILE_HOVER_COLORS = {
  red: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:border-red-500/50 hover:bg-red-50/30 dark:hover:bg-red-900/20',
  yellow: 'hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:border-yellow-500/50 hover:bg-yellow-50/30 dark:hover:bg-yellow-900/20',
  green: 'hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:border-green-500/50 hover:bg-green-50/30 dark:hover:bg-green-900/20',
  blue: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/20',
};

const PrimeTile = ({ 
  to, 
  icon: Icon, 
  title, 
  delay, 
  color, 
  isGlowing, 
  onClick, 
  disabled = false 
}: { 
  to: string, 
  icon: any, 
  title: string, 
  delay?: string, 
  color: keyof typeof TILE_COLORS,
  isGlowing?: boolean,
  onClick?: () => void,
  disabled?: boolean
}) => {
  const content = (
    <>
      <div className={`mb-3 transition-colors duration-500 ${isGlowing ? 'text-current' : 'text-stone-400 dark:text-stone-600 group-hover:text-stone-700 dark:group-hover:text-stone-300'}`}>
        <Icon size={28} strokeWidth={1} />
      </div>
      <span className={`text-sm md:text-base font-medium tracking-wide transition-colors duration-500 ${isGlowing ? 'text-current' : 'text-stone-700 dark:text-stone-300'}`}>{title}</span>
      <div className={`absolute inset-0 border rounded-[2rem] transition-all duration-700 pointer-events-none ${isGlowing ? 'opacity-100 scale-100 border-current' : 'opacity-0 scale-90 border-stone-200 dark:border-stone-800 group-hover:opacity-100'}`} />
    </>
  );

  const baseClasses = `
    group relative w-32 h-32 md:w-36 md:h-36 flex flex-col items-center justify-center
    rounded-[2rem] transition-all duration-500 ease-out
    ${isGlowing ? TILE_COLORS[color] : `bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:scale-105 ${TILE_HOVER_COLORS[color]}`}
    ${delay || ''}
    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
  `;

  if (onClick) {
    return (
      <button onClick={onClick} disabled={disabled} className={baseClasses}>
        {content}
      </button>
    );
  }

  return (
    <Link to={to} className={baseClasses}>
      {content}
    </Link>
  );
};

const LEVEL_LENGTHS = [3, 5, 7, 11, 13, 17, 23];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState(false);
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [level, setLevel] = useState(0);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeTile, setActiveTile] = useState<string | null>(null);
  const [victory, setVictory] = useState(false);

  const tiles = [
    { id: 'red', to: '/loop', icon: Wind, title: 'Soft Loop' },
    { id: 'yellow', to: '/journal', icon: PenTool, title: 'Journal' },
    { id: 'green', to: '/planner', icon: Compass, title: 'Planner' },
    { id: 'blue', to: '/pulse', icon: Activity, title: 'Pulse' },
  ];

  const generateSequence = (length: number) => {
    const newSeq = [];
    for (let i = 0; i < length; i++) {
      newSeq.push(tiles[Math.floor(Math.random() * tiles.length)].id);
    }
    return newSeq;
  };

  const startGame = () => {
    setVictory(false);
    setGameMode(true);
    const initialLevel = 1;
    setLevel(initialLevel);
    const initialSeq = generateSequence(LEVEL_LENGTHS[initialLevel - 1]);
    setSequence(initialSeq);
    setUserSequence([]);
    // Small delay to let the UI update before showing sequence
    setTimeout(() => showSequence(initialSeq), 800);
  };

  const showSequence = async (seq: string[]) => {
    setIsShowingSequence(true);
    for (const tileId of seq) {
      setActiveTile(tileId);
      await new Promise(r => setTimeout(r, 600));
      setActiveTile(null);
      await new Promise(r => setTimeout(r, 200));
    }
    setIsShowingSequence(false);
  };

  const handleTileClick = (tileId: string) => {
    if (!gameMode || isShowingSequence || victory) return;

    setActiveTile(tileId);
    setTimeout(() => setActiveTile(null), 300);

    const newUserSeq = [...userSequence, tileId];
    setUserSequence(newUserSeq);

    // Check if correct
    if (tileId !== sequence[userSequence.length]) {
      // Game Over
      setGameMode(false);
      setLevel(0);
      setSequence([]);
      setUserSequence([]);
      return;
    }

    // Check if level complete
    if (newUserSeq.length === sequence.length) {
      if (level === LEVEL_LENGTHS.length) {
        setVictory(true);
        return;
      }
      
      // Next level
      const nextLevel = level + 1;
      setLevel(nextLevel);
      const nextSeq = generateSequence(LEVEL_LENGTHS[nextLevel - 1]);
      setSequence(nextSeq);
      setUserSequence([]);
      setTimeout(() => showSequence(nextSeq), 1000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:pl-20">
      <header className="mb-12 text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">ΞchoBraid</h1>
        <p className="text-stone-500 dark:text-stone-500 max-w-md mx-auto text-lg">
          {gameMode ? `Level ${level} / ${LEVEL_LENGTHS.length}` : 'Resonance tuning. Your pace is law here.'}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-2xl">
        {tiles.map((tile, idx) => (
          <PrimeTile 
            key={tile.id}
            to={tile.to} 
            icon={tile.icon} 
            title={tile.title} 
            color={tile.id as any}
            isGlowing={activeTile === tile.id}
            onClick={gameMode ? () => handleTileClick(tile.id) : undefined}
            delay={`animate-[fadeIn_1s_ease-out_${0.2 * (idx + 1)}s_forwards] opacity-0`}
          />
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-6 animate-[fadeIn_1s_ease-out_1s_forwards] opacity-0">
        <AnimatePresence mode="wait">
          {victory ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center text-center"
            >
              <Trophy className="text-yellow-500 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Victory!</h2>
              <p className="text-stone-500 mb-6">You've mastered the sequence.</p>
              <button 
                onClick={startGame}
                className="px-8 py-3 bg-stone-800 dark:bg-stone-200 text-stone-100 dark:text-stone-900 rounded-full font-bold hover:scale-105 transition-transform"
              >
                Play Again
              </button>
            </motion.div>
          ) : !gameMode ? (
            <div className="flex flex-col items-center gap-6">
              <button 
                onClick={startGame}
                className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 rounded-full font-bold transition-all duration-300 hover:scale-105 hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] active:bg-green-500 active:text-white active:shadow-[0_0_30px_rgba(34,197,94,0.6)] group"
              >
                <Play size={18} className="group-hover:scale-110 transition-transform" />
                Start Memory Game
              </button>
              <Link 
                to="/loop" 
                state={{ mode: 'silence' }}
                className="text-stone-500 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300 text-sm tracking-widest uppercase border-b border-transparent hover:border-stone-500 dark:hover:border-stone-500 transition-all pb-1"
              >
                Enter in Silence
              </Link>
            </div>
          ) : (
            <button 
              onClick={() => setGameMode(false)}
              className="text-stone-400 hover:text-stone-600 dark:text-stone-600 dark:hover:text-stone-400 text-sm uppercase tracking-widest"
            >
              Exit Game
            </button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Home;