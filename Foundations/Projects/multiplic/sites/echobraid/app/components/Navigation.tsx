import React, { useState } from 'react';
import { Home, MessageCircle, PenTool, Activity, Settings, Menu, X, Library } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

interface NavigationProps {
  onNavigate?: (view: any) => void;
}

const Navigation: React.FC<NavigationProps> = ({ onNavigate }) => {
  const location = useLocation();
  const [showMainMenu, setShowMainMenu] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/library', icon: Library, label: 'Library' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const mainMenuItems = [
    { label: 'Home', view: 'home' },
    { label: 'Copilot', view: 'copilot' },
    { label: 'Curriculum', view: 'curriculum' },
    { label: 'Features', view: 'features' },
    { label: 'Services', view: 'services' },
  ];

  return (
    <nav className="fixed top-0 w-full md:w-20 md:h-screen md:left-0 bg-white/80 dark:bg-stone-950/80 md:bg-stone-50/50 dark:md:bg-stone-950/50 backdrop-blur-md border-b md:border-b-0 md:border-r border-stone-200 dark:border-stone-800 z-40 flex md:flex-col justify-around md:justify-between items-center py-4 md:py-8 transition-colors duration-300">
      {/* Logo */}
      <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-2xl bg-stone-800 dark:bg-stone-200 text-stone-100 dark:text-stone-900 font-bold text-xl mb-4">
        ΞB
      </div>

      <div className="flex md:flex-col justify-around md:justify-center items-center md:gap-8 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`p-3 rounded-2xl transition-all duration-300 group relative ${
                isActive 
                  ? 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-100' 
                  : 'text-stone-500 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900'
              }`}
              aria-label={item.label}
            >
              <item.icon size={24} strokeWidth={1.5} />
              {/* Tooltip for desktop */}
              <span className="hidden md:block absolute left-14 bg-stone-800 dark:bg-stone-700 text-stone-50 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Hamburger Menu for Main App Navigation */}
      <div className="relative">
        <button 
          onClick={() => setShowMainMenu(!showMainMenu)}
          className={`p-3 rounded-2xl transition-all duration-300 ${
            showMainMenu 
              ? 'bg-stone-800 dark:bg-stone-200 text-stone-100 dark:text-stone-900' 
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900'
          }`}
          aria-label="Main Menu"
        >
          {showMainMenu ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
        </button>

        {showMainMenu && (
          <div className="absolute bottom-16 md:bottom-0 md:left-16 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl p-4 min-w-[200px] animate-fade-in z-50">
            <p className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-600 font-bold mb-3 px-2">Main Menu</p>
            <div className="flex flex-col gap-1">
              {mainMenuItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => {
                    onNavigate?.(item.view);
                    setShowMainMenu(false);
                  }}
                  className="text-left px-3 py-2 rounded-xl text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;