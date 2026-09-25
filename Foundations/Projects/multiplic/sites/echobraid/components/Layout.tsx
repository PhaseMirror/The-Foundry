import React, { useState, useEffect } from 'react';
import { 
  Waves, Wind, PenTool, Compass, ShieldCheck, Users, GraduationCap, ChevronRight, ArrowRight, Menu, X, Lock, Moon, Sun, Home, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark' | 'dim'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as 'light' | 'dark' | 'dim';
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'dim');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        setTheme(e.newValue as any);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const toggleDarkMode = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const isDarkMode = theme === 'dark';

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Copilot', path: '/copilot' },
    { label: 'Curriculum', path: '/curriculum' },
    { label: 'Features', path: '/features' },
    { label: 'Services', path: '/services' },
  ];

  const footerGroups = [
    {
      title: 'Platform',
      links: [
        { label: 'About Us', path: '/about_us' },
        { label: 'Mission', path: '/mission' },
        { label: 'Philosophy', path: '/philosophy' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'FAQ', path: '/faq' },
        { label: 'Teaching', path: '/teaching' },
        { label: 'Using The App', path: '/demo' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', path: '/privacy_policy' },
        { label: 'Terms & Conditions', path: '/terms_conditions' },
        { label: 'Disclaimer', path: '/disclaimer' }
      ]
    }
  ];

  const currentView = location.pathname.substring(1) || 'home';

  return (
    <div className={`min-h-screen font-sans selection:bg-brand-accent/20 transition-colors duration-1000 ${
      theme === 'dark' ? 'bg-zinc-950 text-stone-300' : 
      theme === 'dim' ? 'bg-stone-100 text-stone-800' : 
      'bg-brand-light text-brand-dark'
    }`}>
      {currentView !== 'demo' && (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled || currentView !== 'home' ? (theme === 'dark' ? 'bg-zinc-950/90' : theme === 'dim' ? 'bg-stone-900/95 text-stone-100' : 'bg-white/90') + ' backdrop-blur-sm border-b border-stone-800/10 py-3' : 'bg-transparent py-8'}`}>
          <div className="container mx-auto px-8 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-4 group cursor-pointer">
              <span className={`font-medium text-xl tracking-tight transition-colors ${theme === 'dark' || theme === 'dim' ? 'text-stone-100' : 'text-stone-800'}`}>ΞchoBraid</span>
            </Link>

            <div className="hidden lg:flex items-center gap-10">
              {navItems.map((item) => (
                <Link 
                  key={item.label} 
                  to={item.path} 
                  className={`text-sm font-semibold transition-colors ${location.pathname === item.path ? 'text-brand-accent' : (theme === 'dark' ? 'text-stone-500 hover:text-brand-accent' : theme === 'dim' ? 'text-stone-400 hover:text-brand-accent' : 'text-stone-400 hover:text-brand-accent')}`}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={toggleDarkMode}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border hover:border-brand-accent/50 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-brand-accent' : theme === 'dim' ? 'bg-stone-800 border-stone-700 text-teal-400' : 'bg-white border-stone-200 text-stone-400'}`}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                </button>
              </div>
            </div>

            <button className={`lg:hidden p-2 ${theme === 'dark' || theme === 'dim' ? 'text-white' : 'text-brand-dark'}`} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      )}

      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed inset-0 z-40 pt-32 px-10 lg:hidden ${theme === 'dark' ? 'bg-zinc-950' : theme === 'dim' ? 'bg-stone-900' : 'bg-white'}`}
          >
            <div className="flex flex-col gap-10">
              {navItems.map((item) => (
                <Link 
                  key={item.label} 
                  to={item.path} 
                  className={`text-2xl text-left font-bold ${theme === 'dark' || theme === 'dim' ? 'text-stone-100' : 'text-stone-800'}`}
                >
                  {item.label}
                </Link>
              ))}
              <button 
                onClick={toggleDarkMode}
                className={`text-left text-sm font-bold uppercase tracking-[0.2em] ${theme === 'dark' || theme === 'dim' ? 'text-stone-500' : 'text-stone-400'}`}
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {children}
      </main>

      <footer className={`${currentView === 'demo' ? 'py-8' : 'pt-[80px] pb-[40px]'} border-t transition-colors duration-1000 ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950 border-white/5' : 'bg-brand-light border-stone-200/50'}`}>
        <div className="container mx-auto px-8">
          {currentView !== 'demo' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-1">
                <Link to="/" className="flex items-center gap-3 mb-6 group cursor-pointer w-fit">
                  <span className={`font-medium text-xl tracking-tight transition-colors ${theme === 'dark' || theme === 'dim' ? 'text-stone-100' : 'text-stone-800'}`}>ΞchoBraid</span>
                </Link>
                <p className={`text-sm ${theme === 'dark' || theme === 'dim' ? 'text-stone-500' : 'text-stone-500'}`}>
                  Empowering the next generation of creators and thinkers.
                </p>
              </div>
              
              {footerGroups.map((group) => (
                <div key={group.title}>
                  <h4 className={`font-semibold mb-6 uppercase tracking-wider text-xs ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-600'}`}>{group.title}</h4>
                  <ul className="space-y-4">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <Link to={link.path} className={`text-sm transition-colors ${theme === 'dark' || theme === 'dim' ? 'text-stone-500 hover:text-stone-300' : 'text-stone-500 hover:text-stone-700'}`}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          
          <div className={`flex flex-col md:flex-row justify-between items-center gap-4 ${currentView !== 'demo' ? 'pt-8 border-t border-stone-800/10' : ''}`}>
            <p className={`text-xs ${theme === 'dark' || theme === 'dim' ? 'text-stone-600' : 'text-stone-400'}`}>
              © {new Date().getFullYear()} EchoBraid. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy_policy" className={`text-xs transition-colors ${theme === 'dark' || theme === 'dim' ? 'text-stone-600 hover:text-stone-400' : 'text-stone-400 hover:text-stone-600'}`}>Privacy</Link>
              <Link to="/terms_conditions" className={`text-xs transition-colors ${theme === 'dark' || theme === 'dim' ? 'text-stone-600 hover:text-stone-400' : 'text-stone-400 hover:text-stone-600'}`}>Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
