import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import SoftLoop from './pages/SoftLoop';
import Journal from './pages/Journal';

import Settings from './pages/Settings';
import Pulse from './pages/Pulse';
import Planner from './pages/Planner';
import Library from './pages/Library';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC<{ 
  onNavigate?: (view: any) => void,
  theme?: 'light' | 'dark' | 'dim',
  setTheme?: (theme: 'light' | 'dark' | 'dim') => void
}> = ({ onNavigate, theme, setTheme }) => {
  // Dyslexic Font Initialization
  useEffect(() => {
    const isDyslexic = localStorage.getItem('font-dyslexic') === 'true';
    if (isDyslexic) {
      document.documentElement.classList.add('font-dyslexic');
    } else {
      document.documentElement.classList.remove('font-dyslexic');
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="font-sans text-stone-800 dark:text-stone-200 selection:bg-teal-100 selection:text-stone-900 dark:selection:bg-teal-900 dark:selection:text-stone-100 min-h-screen flex flex-col md:flex-row transition-all duration-300">
        <Navigation onNavigate={onNavigate} />
        <main className="flex-1 pt-20 md:pt-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/loop" element={<SoftLoop />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/pulse" element={<Pulse />} />
            <Route path="/planner" element={<Planner />} />
                        <Route path="/library" element={<Library />} />
            <Route path="/settings" element={<Settings theme={theme} setTheme={setTheme} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;