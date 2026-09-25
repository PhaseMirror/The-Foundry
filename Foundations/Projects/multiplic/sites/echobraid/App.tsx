
import React, { useState, useEffect } from 'react';
import { 
  Waves, 
  Wind, 
  PenTool, 
  Compass, 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  ChevronRight, 
  ArrowRight,
  Menu,
  X,
  Lock,
  Moon,
  Sun,
  Home,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CurriculumPage from './pages/CurriculumPage';
import PhilosophyPage from './pages/PhilosophyPage';
import AboutUsPage from './pages/AboutUsPage';
import FeaturesPage from './pages/FeaturesPage';
import MissionPage from './pages/MissionPage';
import FAQPage from './pages/FAQPage';
import TeachingPage from './pages/TeachingPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import DisclaimerPage from './pages/DisclaimerPage';
import CopilotPage from './pages/CopilotPage';
import ServicesPage from './pages/ServicesPage';
import DemoApp from './app/App';
import PulsePage from './app/PulsePage';

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'features' | 'curriculum' | 'philosophy' | 'about_us' | 'mission' | 'faq' | 'teaching' | 'privacy_policy' | 'terms_conditions' | 'disclaimer' | 'copilot' | 'services' | 'demo' | 'pulse' | 'teachers_lounge'>('demo');
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
    
    // For Tailwind's dark mode (class strategy)
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

  const toggleDarkMode = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const isDarkMode = theme === 'dark';

  const navItems = [
    { label: 'Home', view: 'home' },
    { label: 'Copilot', view: 'copilot' },
    { label: 'Curriculum', view: 'curriculum' },
    { label: 'Features', view: 'features' },
    { label: 'Services', view: 'services' },
  ];

  const footerGroups = [
    {
      title: 'Platform',
      links: ['About Us', 'Mission', 'Philosophy']
    },
    {
      title: 'Resources',
      links: ['FAQ', 'Teaching', 'Using The App']
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms & Conditions', 'Disclaimer']
    }
  ];

  const lowMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, ease: "easeOut" as any }
  };

  const handleNavigate = (view: 'home' | 'features' | 'curriculum' | 'philosophy' | 'about_us' | 'mission' | 'faq' | 'teaching' | 'privacy_policy' | 'terms_conditions' | 'disclaimer' | 'copilot' | 'services' | 'demo' | 'pulse' | 'teachers_lounge') => {
    setCurrentView(view);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-brand-accent/20 transition-colors duration-1000 ${
      theme === 'dark' ? 'bg-zinc-950 text-stone-300' : 
      theme === 'dim' ? 'bg-stone-100 text-stone-800' : 
      'bg-brand-light text-brand-dark'
    }`}>
      
      {/* Navigation */}
      {currentView !== 'demo' && (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled || currentView !== 'home' ? (theme === 'dark' ? 'bg-zinc-950/90' : theme === 'dim' ? 'bg-stone-900/95 text-stone-100' : 'bg-white/90') + ' backdrop-blur-sm border-b border-stone-800/10 py-3' : 'bg-transparent py-8'}`}>
          <div className="container mx-auto px-8 flex justify-between items-center">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => handleNavigate('home')}>
              <span className={`font-medium text-xl tracking-tight transition-colors ${theme === 'dark' || theme === 'dim' ? 'text-stone-100' : 'text-stone-800'}`}>ΞchoBraid</span>
            </div>

            <div className="hidden lg:flex items-center gap-10">
              {navItems.map((item) => (
                <button 
                  key={item.label} 
                  onClick={() => handleNavigate(item.view as any)} 
                  className={`text-sm font-semibold transition-colors ${currentView === item.view ? 'text-brand-accent' : (theme === 'dark' ? 'text-stone-500 hover:text-brand-accent' : theme === 'dim' ? 'text-stone-400 hover:text-brand-accent' : 'text-stone-400 hover:text-brand-accent')}`}
                >
                  {item.label}
                </button>
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

      {/* Mobile Menu */}
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
                <button 
                  key={item.label} 
                  onClick={() => handleNavigate(item.view as any)} 
                  className={`text-2xl text-left font-bold ${theme === 'dark' || theme === 'dim' ? 'text-stone-100' : 'text-stone-800'}`}
                >
                  {item.label}
                </button>
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
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Hero Section */}
              <section id="home" className="relative pt-[114px] pb-20 overflow-hidden">
                <div className="container mx-auto px-8 relative z-10">
                  <motion.div {...lowMotion} className="max-w-4xl">
                    <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-10 ${theme === 'dark' ? 'text-stone-100' : 'text-stone-800'}`}>
                      Learning that honors <br /> <span className={`italic font-medium ${theme === 'dark' ? 'text-stone-700' : 'text-stone-300'}`}>your signal.</span>
                    </h1>
                    <p className={`text-xl md:text-2xl max-w-xl leading-relaxed mb-16 font-medium ${theme === 'dark' ? 'text-stone-500' : 'text-stone-500'}`}>
                      ΞchoBraid is an unpressured learning space. No accounts, no noise—just rhythm and growth.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-6 flex-wrap">
                      <button 
                        onClick={() => handleNavigate('demo')}
                        className={`px-10 py-4 border rounded-2xl font-bold transition-all text-lg transform hover:scale-105 ${theme === 'dark' ? 'bg-transparent border-stone-800 text-stone-400 hover:border-green-500 hover:text-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]' : 'bg-transparent border-stone-200 text-stone-600 hover:border-green-500 hover:text-green-600 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]'}`}
                      >
                        Student Portal
                      </button>
                      <button 
                        onClick={() => handleNavigate('teachers_lounge')}
                        className={`px-10 py-4 border rounded-2xl font-bold transition-all text-lg transform hover:scale-105 ${theme === 'dark' ? 'bg-transparent border-stone-800 text-stone-400 hover:border-red-500 hover:text-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-transparent border-stone-200 text-stone-600 hover:border-red-500 hover:text-red-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]'}`}
                      >
                        Teachers Lounge
                      </button>
                      <button 
                        onClick={() => handleNavigate('curriculum')}
                        className={`px-10 py-4 border rounded-2xl font-bold transition-all text-lg transform hover:scale-105 ${theme === 'dark' ? 'bg-transparent border-stone-800 text-stone-400 hover:border-blue-500 hover:text-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-transparent border-stone-200 text-stone-600 hover:border-blue-500 hover:text-blue-600 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]'}`}
                      >
                        View Curriculum
                      </button>
                    </div>

                    <div className={`mt-20 flex flex-wrap gap-12 text-[11px] font-bold uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                      <span className="flex items-center gap-2"><ShieldCheck size={14} /> Sovereignty</span>
                      <span className="flex items-center gap-2"><Wind size={14} /> Low-Stimulus</span>
                      <span className="flex items-center gap-2"><Lock size={14} /> Private</span>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* Audience Section */}
              <section className={`py-20 ${theme === 'dark' ? 'bg-zinc-950' : 'bg-brand-light'}`}>
                <div className="container mx-auto px-8">
                  <div className="max-w-3xl">
                    <h2 className={`text-4xl font-bold mb-12 ${theme === 'dark' ? 'text-stone-100' : 'text-stone-800'}`}>Who it's for</h2>
                    <div className="space-y-16">
                      <div className="flex gap-8 items-start">
                        <div className={`w-1 h-12 bg-brand-accent/30 rounded-full mt-1`}></div>
                        <div>
                          <h4 className={`font-bold mb-4 uppercase tracking-[0.25em] text-xs ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>Learners & Families</h4>
                          <p className="text-xl text-stone-500 leading-relaxed font-medium">Predictable routines, offline-first tools, and the choice to opt-out at every step.</p>
                        </div>
                      </div>
                      <div className="flex gap-8 items-start">
                        <div className={`w-1 h-12 bg-brand-accent/30 rounded-full mt-1`}></div>
                        <div>
                          <h4 className={`font-bold mb-4 uppercase tracking-[0.25em] text-xs ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>Educators</h4>
                          <p className="text-xl text-stone-500 leading-relaxed font-medium">Short cycles and evidence-first adjustments for classroom success.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Ethics & Safety */}
              <section id="research" className={`py-20 ${theme === 'dark' ? 'bg-zinc-950' : 'bg-stone-900'} text-stone-400`}>
                <div className="container mx-auto px-8">
                  <div className="max-w-4xl">
                    <h2 className="text-4xl font-bold mb-16 text-stone-100">Designed for cognitive dignity.</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                      <p className="leading-relaxed text-xl font-medium">
                        Silence is allowed. Consent is asked at every turn. Memory is yours to control—you can pause, go quiet, or erase any session data instantly.
                      </p>
                      <p className="leading-relaxed text-xl font-medium">
                        Our system detects resonance drift and automatically triggers supportive pauses if it senses distress. Safety is the first priority.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {currentView === 'features' && (
            <motion.div
              key="features"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FeaturesPage isDarkMode={theme === 'dark'} />
            </motion.div>
          )}

          {currentView === 'curriculum' && (
            <motion.div
              key="curriculum"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CurriculumPage isDarkMode={theme === 'dark'} />
            </motion.div>
          )}

          {currentView === 'philosophy' && (
            <motion.div
              key="philosophy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PhilosophyPage isDarkMode={theme === 'dark'} />
            </motion.div>
          )}

          {currentView === 'about_us' && (
            <motion.div
              key="about_us"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AboutUsPage isDarkMode={theme === 'dark'} />
            </motion.div>
          )}

          {currentView === 'mission' && (
            <motion.div
              key="mission"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <MissionPage isDarkMode={theme === 'dark'} />
            </motion.div>
          )}

          {currentView === 'faq' && (
            <motion.div
              key="faq"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FAQPage isDarkMode={theme === 'dark'} />
            </motion.div>
          )}

          {currentView === 'teaching' && (
            <motion.div
              key="teaching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TeachingPage isDarkMode={theme === 'dark'} />
            </motion.div>
          )}

          {currentView === 'privacy_policy' && (
            <motion.div
              key="privacy_policy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PrivacyPolicyPage isDarkMode={theme === 'dark'} />
            </motion.div>
          )}

          {currentView === 'terms_conditions' && (
            <motion.div
              key="terms_conditions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TermsAndConditionsPage isDarkMode={theme === 'dark'} />
            </motion.div>
          )}

          {currentView === 'disclaimer' && (
            <motion.div
              key="disclaimer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DisclaimerPage isDarkMode={theme === 'dark'} />
            </motion.div>
          )}

          {currentView === 'copilot' && (
            <motion.div
              key="copilot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CopilotPage isDarkMode={theme === 'dark'} />
            </motion.div>
          )}

          {currentView === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ServicesPage isDarkMode={theme === 'dark'} />
            </motion.div>
          )}

          {currentView === 'pulse' && (
            <motion.div
              key="pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PulsePage />
            </motion.div>
          )}

          {currentView === 'teachers_lounge' && (
            <motion.div
              key="teachers_lounge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="container mx-auto px-8 py-20 text-center"
            >
              <h2 className={`text-4xl font-bold mb-8 ${theme === 'dark' ? 'text-stone-100' : 'text-stone-800'}`}>Teachers Lounge</h2>
              <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                A dedicated space for educators to collaborate, share resources, and discuss student progress. Coming soon.
              </p>
            </motion.div>
          )}

          {currentView === 'demo' && (
            <motion.div
              key="demo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full min-h-screen"
            >
              <DemoApp 
                onNavigate={handleNavigate} 
                theme={theme} 
                setTheme={setTheme} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final CTA */}
        {currentView !== 'demo' && (
          <section className={`py-[95px] transition-colors ${theme === 'dark' ? 'bg-zinc-950' : 'bg-brand-light'}`}>
            <div className="container mx-auto px-8 text-center">
              <h2 className={`text-5xl font-bold mb-16 ${theme === 'dark' ? 'text-stone-100' : 'text-stone-800'}`}>Ready?</h2>
              <div className="flex flex-col sm:flex-row gap-8 justify-center">
                <button 
                  onClick={() => handleNavigate(currentView === 'home' ? 'curriculum' : 'home')}
                  className={`px-12 py-5 rounded-2xl font-bold transition-all text-xl transform hover:scale-105 hover:brightness-110 ${theme === 'dark' ? 'bg-brand-accent text-zinc-950' : 'bg-brand-dark text-white'}`}
                >
                  Get Started
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className={`${currentView === 'demo' ? 'py-8' : 'pt-[80px] pb-[40px]'} border-t transition-colors duration-1000 ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950 border-white/5' : 'bg-brand-light border-stone-200/50'}`}>
        <div className="container mx-auto px-8">
          {currentView !== 'demo' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-16">
              <div>
                <span className={`font-medium text-xl tracking-tight transition-colors ${theme === 'dark' || theme === 'dim' ? 'text-stone-100' : 'text-stone-800'}`}>ΞchoBraid</span>
                <p className="text-stone-500 text-sm mt-8 leading-relaxed max-w-xs font-medium">
                  Empowering neurodivergent learners through trauma-aware software.
                </p>
              </div>
              {footerGroups.map((group) => (
                <div key={group.title}>
                  <h5 className="font-bold text-[11px] mb-8 uppercase tracking-[0.3em] text-stone-400">{group.title}</h5>
                  <ul className="space-y-4 text-sm font-bold text-stone-500">
                    {group.links.map((link) => (
                      <li key={link}>
                        <button 
                          onClick={() => {
                            if (link === 'About Us') {
                              handleNavigate('about_us');
                            } else if (link === 'Mission') {
                              handleNavigate('mission');
                            } else if (link === 'Philosophy') {
                              handleNavigate('philosophy');
                            } else if (link === 'FAQ') {
                              handleNavigate('faq');
                            } else if (link === 'Teaching') {
                              handleNavigate('teaching');
                            } else if (link === 'Using The App') {
                              handleNavigate('features');
                            } else if (link === 'Privacy Policy') {
                              handleNavigate('privacy_policy');
                            } else if (link === 'Terms & Conditions') {
                              handleNavigate('terms_conditions');
                            } else if (link === 'Disclaimer') {
                              handleNavigate('disclaimer');
                            } else if (link === 'Copilot') {
                              handleNavigate('copilot');
                            } else if (link === 'Services') {
                              handleNavigate('services');
                            }
                          }}
                          className="hover:text-brand-accent text-left transition-colors"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;
