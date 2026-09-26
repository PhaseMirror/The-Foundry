
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
  BookOpen,
  Scale,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Activity,
  FileText,
  Layers,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CurriculumView from './components/CurriculumView';
import PhilosophyView from './components/PhilosophyView';
import AboutUsView from './components/AboutUsView';
import FeaturesView from './components/FeaturesView';
import CareersView from './components/CareersView';
import FAQView from './components/FAQView';
import TeachingView from './components/TeachingView';
import PrivacyPolicyView from './components/PrivacyPolicyView';
import TermsAndConditionsView from './components/TermsAndConditionsView';
import DisclaimerView from './components/DisclaimerView';
import CopilotView from './components/CopilotView';
import ServicesView from './components/ServicesView';
import DemoApp from './components/DemoApp';
import EnterpriseView from './components/EnterpriseView';
import AnalyticsView from './components/AnalyticsView';
import DigitalizingTitle from './components/DigitalizingTitle';
import DocumentationView from './components/DocumentationView';

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'features' | 'documentation' | 'curriculum' | 'philosophy' | 'about_us' | 'careers' | 'faq' | 'teaching' | 'privacy_policy' | 'terms_conditions' | 'disclaimer' | 'copilot' | 'services' | 'demo' | 'teachers_lounge' | 'analytics'>('home');
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
    { label: 'Analysis', view: 'analytics' },
    { label: 'Oracle', view: 'features' },
    { label: 'Enterprise', view: 'teachers_lounge' },
    { label: 'Features', view: 'demo' },
    { label: 'Services', view: 'services' },
  ];

  const footerGroups = [
    {
      title: 'Platform',
      links: ['About Us', 'Philosophy', 'Careers']
    },
    {
      title: 'Resources',
      links: ['FAQ', 'Protocol Academy', 'Documentation']
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

  const handleNavigate = (view: 'home' | 'features' | 'documentation' | 'curriculum' | 'philosophy' | 'about_us' | 'careers' | 'faq' | 'teaching' | 'privacy_policy' | 'terms_conditions' | 'disclaimer' | 'copilot' | 'services' | 'demo' | 'teachers_lounge' | 'analytics') => {
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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled || currentView !== 'home' ? (theme === 'dark' ? 'bg-zinc-950/90' : theme === 'dim' ? 'bg-stone-900/95 text-stone-100' : 'bg-white/90') + ' backdrop-blur-sm border-b border-stone-800/10 py-3' : 'bg-transparent py-8'}`}>
        <div className="container mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => handleNavigate('home')}>
            <DigitalizingTitle theme={theme} />
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <button 
                key={item.label} 
                onClick={() => handleNavigate(item.view as any)} 
                className={`text-sm font-semibold transition-all duration-300 ${
                  currentView === item.view 
                    ? 'text-[#2dd4bf] [text-shadow:0_0_12px_rgba(45,212,191,0.85)]' 
                    : `hover:text-[#2dd4bf] hover:[text-shadow:0_0_12px_rgba(45,212,191,0.85)] ${
                        theme === 'dark' ? 'text-stone-500' : theme === 'dim' ? 'text-stone-400' : 'text-stone-500'
                      }`
                }`}
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
                  className={`text-2xl text-left font-bold transition-all duration-300 ${
                    currentView === item.view 
                      ? 'text-[#2dd4bf] [text-shadow:0_0_12px_rgba(45,212,191,0.85)]' 
                      : `hover:text-[#2dd4bf] hover:[text-shadow:0_0_12px_rgba(45,212,191,0.85)] ${
                          theme === 'dark' || theme === 'dim' ? 'text-stone-300' : 'text-stone-800'
                        }`
                  }`}
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
                    <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-10 ${
                      theme === 'dark' ? 'text-stone-400' : theme === 'dim' ? 'text-stone-300' : 'text-stone-600'
                    }`}>
                      AI Autonomy vs. <br /> <span className={`italic font-medium ${theme === 'dark' ? 'text-stone-700' : 'text-stone-300'}`}>Enterprise Governance</span>
                    </h1>
                    <p className={`text-xl md:text-2xl max-w-3xl leading-relaxed mb-16 font-medium ${theme === 'dark' ? 'text-stone-500' : 'text-stone-500'}`}>
                      Manages agentic AI liability by surfacing productive contradictions in autonomous systems, naming hidden assumptions, and converting them into concrete levers with owners, metrics, and horizons.
                    </p>

                    <div className={`mt-20 flex flex-wrap gap-12 text-[11px] font-bold uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                      <span className="flex items-center gap-2"><ShieldCheck size={14} /> Sovereign</span>
                      <span className="flex items-center gap-2"><Scale size={14} /> Contractive</span>
                      <span className="flex items-center gap-2"><FileCheck size={14} /> Verifiable</span>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* Audience Section */}
              <section className={`py-20 ${theme === 'dark' ? 'bg-zinc-950' : 'bg-brand-light'}`}>
                <div className="container mx-auto px-8">
                  <div className="max-w-6xl">
                    <h2 className={`text-4xl font-bold mb-12 ${
                      theme === 'dark' ? 'text-stone-400' : theme === 'dim' ? 'text-stone-300' : 'text-stone-600'
                    }`}>Who it's for</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="flex gap-6 items-start">
                        <div className={`w-1 h-16 bg-brand-accent/30 rounded-full mt-1 flex-shrink-0`}></div>
                        <div>
                          <h4 className={`font-bold mb-4 uppercase tracking-[0.25em] text-xs ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>C-Suite</h4>
                          <p className="text-lg text-stone-500 leading-relaxed font-medium">
                            For industry leaders and governance executives who refuse to let agentic autonomy erode accountability. You set direction under permanent tension between velocity and liability. Phase Mirror gives you sovereignty over invariants and contractive levers with owners, metrics, and horizons. One clear decision here can cascade to your entire engineering organization.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-6 items-start">
                        <div className={`w-1 h-16 bg-brand-accent/30 rounded-full mt-1 flex-shrink-0`}></div>
                        <div>
                          <h4 className={`font-bold mb-4 uppercase tracking-[0.25em] text-xs ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>Developers</h4>
                          <p className="text-lg text-stone-500 leading-relaxed font-medium">
                            For technical leads and engineers who must turn C-Suite governance mandates into working, auditable systems. You live the daily friction of autonomy vs L0 enforcement and probabilistic outputs vs deterministic compliance. Phase Mirror supplies mirror-dissonance tooling, MCP integration, and artifact-first workflows so leadership decisions actually ship without breaking invariants.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Liability Management Framework */}
              <section id="research" className={`py-24 transition-colors duration-700 border-t ${theme === 'dark' ? 'bg-zinc-950 border-stone-900' : theme === 'dim' ? 'bg-stone-900/40 border-stone-800' : 'bg-stone-50/50 border-stone-100'}`}>
                <div className="container mx-auto px-8 max-w-6xl">
                  {/* Hero intro of section */}
                  <div className="max-w-4xl mb-16">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-accent mb-4 block">Systemic Architecture</span>
                    <h2 className={`text-3xl md:text-5xl font-bold tracking-tight mb-8 ${
                      theme === 'dark' ? 'text-stone-400' : theme === 'dim' ? 'text-stone-300' : 'text-stone-600'
                    }`}>
                      Liability Management Framework
                    </h2>
                    <p className={`text-lg md:text-xl leading-relaxed font-medium ${theme === 'dark' ? 'text-stone-400' : theme === 'dim' ? 'text-stone-300' : 'text-stone-500'}`}>
                      The Phase Mirror framework replaces vague AI governance with explicit liability management. It forces a trade-off between accuracy and compliance, requiring formal encoding of policy triggers to resolve inevitable conflicts between reasoning and rules.
                    </p>
                  </div>

                  {/* Key Liability Exposures (Dissonance) */}
                  <div className="mb-20">
                    <h3 className={`text-xs font-bold uppercase tracking-[0.25em] mb-8 ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-500'}`}>
                      Key Liability Exposures (Dissonance)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Expo 1 */}
                      <div className={`p-8 border rounded-2xl transition-all ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-900/40 border-stone-800/60 hover:border-stone-700/60' : 'bg-white border-stone-200/80 hover:border-stone-300 shadow-sm'}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <Activity size={18} className="text-brand-accent" />
                          <h4 className={`font-semibold text-lg ${theme === 'dark' || theme === 'dim' ? 'text-stone-200' : 'text-stone-800'}`}>Probabilistic vs. Binary</h4>
                        </div>
                        <p className={`leading-relaxed text-sm font-medium ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-500'}`}>
                          Machine-to-machine decision chains fail traditional liability models requiring binary compliance.
                        </p>
                      </div>

                      {/* Expo 2 */}
                      <div className={`p-8 border rounded-2xl transition-all ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-900/40 border-stone-800/60 hover:border-stone-700/60' : 'bg-white border-stone-200/80 hover:border-stone-300 shadow-sm'}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <Scale size={18} className="text-brand-accent" />
                          <h4 className={`font-semibold text-lg ${theme === 'dark' || theme === 'dim' ? 'text-stone-200' : 'text-stone-800'}`}>Autonomy vs. Deterministic Success</h4>
                        </div>
                        <p className={`leading-relaxed text-sm font-medium ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-500'}`}>
                          Agents require "permission to fail" during learning, which conflicts with high-stakes enterprise stability.
                        </p>
                      </div>

                      {/* Expo 3 */}
                      <div className={`p-8 border rounded-2xl transition-all ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-900/40 border-stone-800/60 hover:border-stone-700/60' : 'bg-white border-stone-200/80 hover:border-stone-300 shadow-sm'}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <Layers size={18} className="text-brand-accent" />
                          <h4 className={`font-semibold text-lg ${theme === 'dark' || theme === 'dim' ? 'text-stone-200' : 'text-stone-800'}`}>Reasoning vs. Data Hygiene</h4>
                        </div>
                        <p className={`leading-relaxed text-sm font-medium ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-500'}`}>
                          Causal agents expose hidden gaps in data integrity, creating liability for wrongful conclusions.
                        </p>
                      </div>

                      {/* Expo 4 */}
                      <div className={`p-8 border rounded-2xl transition-all ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-900/40 border-stone-800/60 hover:border-stone-700/60' : 'bg-white border-stone-200/80 hover:border-stone-300 shadow-sm'}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <EyeOff size={18} className="text-brand-accent" />
                          <h4 className={`font-semibold text-lg ${theme === 'dark' || theme === 'dim' ? 'text-stone-200' : 'text-stone-800'}`}>Transparency vs. Proprietary Logic</h4>
                        </div>
                        <p className={`leading-relaxed text-sm font-medium ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-500'}`}>
                          Reliance on third-party black boxes makes audits impossible.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Governance Levers */}
                  <div className="mb-20">
                    <h3 className={`text-sm font-bold uppercase tracking-[0.25em] mb-8 ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-500'}`}>
                      Governance Levers
                    </h3>
                    <div className={`overflow-x-auto border rounded-xl ${theme === 'dark' || theme === 'dim' ? 'border-stone-800 bg-stone-950' : 'border-stone-200 bg-white shadow-sm'}`}>
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className={`${theme === 'dark' || theme === 'dim' ? 'bg-stone-900/30 border-b border-stone-800 text-stone-200' : 'bg-stone-50 border-b border-stone-200 text-stone-800'} font-semibold`}>
                            <th className="p-4 pl-6 uppercase tracking-wider text-[11px] font-bold">Owner</th>
                            <th className="p-4 uppercase tracking-wider text-[11px] font-bold">Proposed Lever</th>
                            <th className="p-4 uppercase tracking-wider text-[11px] font-bold">Key Metric</th>
                            <th className="p-4 pr-6 uppercase tracking-wider text-[11px] font-bold">Horizon</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' || theme === 'dim' ? 'divide-stone-900 text-stone-300' : 'divide-stone-100 text-stone-600'}`}>
                          <tr>
                            <td className="p-4 pl-6 font-bold text-brand-accent">Governance</td>
                            <td className="p-4 font-semibold">Error Budget</td>
                            <td className={`p-4 font-medium ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-500'}`}>Allowable Failure Rate %</td>
                            <td className={`p-4 pr-6 font-semibold ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-600'}`}>30 Days</td>
                          </tr>
                          <tr>
                            <td className="p-4 pl-6 font-bold text-brand-accent">Legal</td>
                            <td className="p-4 font-semibold">Liability Tiers</td>
                            <td className={`p-4 font-medium ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-500'}`}>Audit Pass Rate</td>
                            <td className={`p-4 pr-6 font-semibold ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-600'}`}>60 Days</td>
                          </tr>
                          <tr>
                            <td className="p-4 pl-6 font-bold text-brand-accent">Ops</td>
                            <td className="p-4 font-semibold">Human-on-Exception Oversight</td>
                            <td className={`p-4 font-medium ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-500'}`}>Intervention Ratio</td>
                            <td className={`p-4 pr-6 font-semibold ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-600'}`}>45 Days</td>
                          </tr>
                          <tr>
                            <td className="p-4 pl-6 font-bold text-brand-accent">Eng</td>
                            <td className="p-4 font-semibold">Safety Guardrails</td>
                            <td className={`p-4 font-medium ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-500'}`}>Violation Rate (0%)</td>
                            <td className={`p-4 pr-6 font-semibold ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-600'}`}>21 Days</td>
                          </tr>
                          <tr>
                            <td className="p-4 pl-6 font-bold text-brand-accent">Data</td>
                            <td className="p-4 font-semibold">Causal Model Validation</td>
                            <td className={`p-4 font-medium ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-500'}`}>Graph Accuracy Score</td>
                            <td className={`p-4 pr-6 font-semibold ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-600'}`}>14 Days</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Grid of Required Artifacts & Callouts */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Required Artifacts */}
                    <div className="lg:col-span-6">
                      <h3 className={`text-sm font-bold uppercase tracking-[0.25em] mb-8 ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-500'}`}>
                        Required Artifacts
                      </h3>
                      <div className="space-y-6">
                        {[
                          { label: 'Spec', desc: 'Define acceptable error thresholds vs. policy violations.' },
                          { label: 'Contract', desc: 'Third-party liability tiers.' },
                          { label: 'SLA', desc: 'Commitment to audit standards and explainability.' },
                          { label: 'Dataset', desc: 'Causal validity score requirements.' },
                          { label: 'Kill-Switch', desc: 'Governance triggers for high-stakes agents.' }
                        ].map((art) => (
                          <div key={art.label} className="flex gap-4 items-start">
                            <div className="w-24 font-bold text-[10px] uppercase tracking-wider text-brand-accent py-1.5 px-2 border border-brand-accent/30 rounded text-center shrink-0">
                              {art.label}
                            </div>
                            <p className={`text-base font-medium leading-relaxed ${theme === 'dark' || theme === 'dim' ? 'text-stone-300' : 'text-stone-600'}`}>
                              {art.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Precision Question & Recommendation */}
                    <div className="lg:col-span-6 flex flex-col justify-between gap-8">
                      {/* Precision Question */}
                      <div className={`p-8 border rounded-2xl ${theme === 'dark' || theme === 'dim' ? 'bg-stone-900/30 border-stone-800/80' : 'bg-transparent border-stone-250'}`}>
                        <div className="flex gap-3 mb-4">
                          <HelpCircle size={18} className="text-brand-accent shrink-0 mt-0.5" />
                          <h4 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-500'}`}>
                            Precision Question
                          </h4>
                        </div>
                        <blockquote className={`text-xl md:text-2xl font-medium tracking-tight leading-relaxed italic ${theme === 'dark' || theme === 'dim' ? 'text-stone-100' : 'text-stone-900'}`}>
                          "Does the agent optimize for the most accurate outcome or the most compliant one?"
                        </blockquote>
                      </div>

                      {/* Recommendation */}
                      <div className={`p-8 border rounded-2xl ${theme === 'dark' || theme === 'dim' ? 'bg-stone-900/30 border-stone-800/80' : 'bg-transparent border-stone-250'}`}>
                        <div className="flex gap-3 mb-4">
                          <AlertTriangle size={18} className="text-brand-accent shrink-0 mt-0.5" />
                          <h4 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' || theme === 'dim' ? 'text-stone-400' : 'text-stone-500'}`}>
                            Recommendation
                          </h4>
                        </div>
                        <p className={`text-sm leading-relaxed font-semibold uppercase tracking-wider text-brand-accent mb-2`}>
                          Takeaway:
                        </p>
                        <p className={`text-base font-medium leading-relaxed ${theme === 'dark' || theme === 'dim' ? 'text-stone-300' : 'text-stone-600'}`}>
                          Leadership must explicitly encode this trade-off. When reasoning conflicts with rules, the system must escalate to a human exception handler rather than hallucinate compliance.
                        </p>
                      </div>
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
              <FeaturesView isDarkMode={theme === 'dark'} />
            </motion.div>
          )}

          {currentView === 'documentation' && (
            <motion.div
              key="documentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DocumentationView isDarkMode={theme === 'dark'} theme={theme} />
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
              <CurriculumView isDarkMode={theme === 'dark'} />
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
              <PhilosophyView isDarkMode={theme === 'dark'} />
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
              <AboutUsView isDarkMode={theme === 'dark'} />
            </motion.div>
          )}

          {currentView === 'careers' && (
            <motion.div
              key="careers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CareersView isDarkMode={theme === 'dark'} />
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
              <FAQView isDarkMode={theme === 'dark'} />
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
              <TeachingView isDarkMode={theme === 'dark'} />
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
              <PrivacyPolicyView isDarkMode={theme === 'dark'} />
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
              <TermsAndConditionsView isDarkMode={theme === 'dark'} />
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
              <DisclaimerView isDarkMode={theme === 'dark'} />
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
              <CopilotView isDarkMode={theme === 'dark'} />
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
              <ServicesView isDarkMode={theme === 'dark'} />
            </motion.div>
          )}

          {currentView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full animate-fadeIn"
            >
              <AnalyticsView isDarkMode={theme === 'dark'} theme={theme} />
            </motion.div>
          )}

          {currentView === 'teachers_lounge' && (
            <motion.div
              key="teachers_lounge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <EnterpriseView isDarkMode={theme === 'dark'} theme={theme} />
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
          <section className={`py-24 transition-colors border-t ${theme === 'dark' ? 'bg-zinc-950 border-stone-900' : theme === 'dim' ? 'bg-stone-900/40 border-stone-800' : 'bg-stone-50/50 border-stone-100'}`}>
            <div className="container mx-auto px-8 max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20 items-center">
                {/* 2/3 Left Column */}
                <div className="lg:col-span-2 text-left">
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-accent mb-4 block">
                    A TRUSTED FRAMEWORK SYSTEM FOR STRATEGIC DEFENSE
                  </span>
                  <h2 className={`text-3xl md:text-5xl font-bold tracking-tight mb-6 ${
                    theme === 'dark' ? 'text-stone-400' : theme === 'dim' ? 'text-stone-300' : 'text-stone-600'
                  }`}>
                    Ready to Map Your Agentic Risk Landscape?
                  </h2>
                  <p className={`text-lg leading-relaxed font-medium ${theme === 'dark' ? 'text-stone-400' : theme === 'dim' ? 'text-stone-300' : 'text-stone-500'}`}>
                    Phase Mirror methodology exposes critical gaps before compliance auditors trace them. Replace abstract hopes with mathematical system bindings. Complete an official diagnostic and align your Autonomy, Governance, and Accuracy to 100% unified resonance.
                  </p>
                </div>

                {/* 1/3 Right Column with Buttons */}
                <div className="lg:col-span-1 flex flex-col sm:flex-row lg:flex-col gap-4 justify-start lg:justify-center items-stretch w-full">
                  <button 
                    onClick={() => handleNavigate('demo')}
                    className={`px-8 py-4 border rounded-xl font-bold text-base transition-all transform hover:scale-105 text-center cursor-pointer ${
                      theme === 'dark' 
                        ? 'border-stone-800 text-stone-400 hover:border-red-500 hover:text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.35)]' 
                        : theme === 'dim'
                        ? 'border-stone-700 text-stone-300 hover:border-red-400 hover:text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : 'border-stone-250 text-stone-600 hover:border-red-500 hover:text-red-600 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                    }`}
                  >
                    Initiate Simulator Diagnostic
                  </button>
                  <button 
                    onClick={() => handleNavigate('curriculum')}
                    className={`px-8 py-4 border rounded-xl font-bold text-base transition-all transform hover:scale-105 text-center cursor-pointer ${
                      theme === 'dark' 
                        ? 'border-stone-800 text-stone-400 hover:border-blue-500 hover:text-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.35)]' 
                        : theme === 'dim'
                        ? 'border-stone-700 text-stone-300 hover:border-blue-400 hover:text-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                        : 'border-stone-250 text-stone-600 hover:border-blue-500 hover:text-blue-600 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    }`}
                  >
                    Download Strategic Blueprint
                  </button>
                  <button 
                    onClick={() => {
                      alert("Connecting with a Citizen Gardens verification engineer. You may also email support@phasemirror.com directly. Expected response: under 2 hours.");
                    }}
                    className={`px-8 py-4 border rounded-xl font-bold text-base transition-all transform hover:scale-105 text-center cursor-pointer ${
                      theme === 'dark' 
                        ? 'border-stone-800 text-stone-400 hover:border-emerald-500 hover:text-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.35)]' 
                        : theme === 'dim'
                        ? 'border-stone-700 text-stone-300 hover:border-emerald-400 hover:text-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'border-stone-250 text-stone-600 hover:border-emerald-500 hover:text-emerald-600 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    }`}
                  >
                    Contact Us
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className={`pt-[80px] pb-[40px] border-t transition-colors duration-1000 ${theme === 'dark' || theme === 'dim' ? 'bg-zinc-950 border-white/5' : 'bg-brand-light border-stone-200/50'}`}>
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-16">
            <div>
              <span className={`font-medium text-xl tracking-tight transition-colors ${theme === 'dark' || theme === 'dim' ? 'text-stone-100' : 'text-stone-800'}`}>Phase Mirror</span>
              <p className="text-stone-500 text-sm mt-8 leading-relaxed max-w-xs font-medium">
                Phase Mirror doesn't resolve dissonance, it names it.
              </p>
              <p className="text-stone-600 dark:text-stone-500 text-xs mt-4 font-mono leading-relaxed">
                &copy; 2026 Citizen Gardens.<br />
                All rights reserved.
              </p>
            </div>
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h5 className="font-bold text-[11px] mb-8 uppercase tracking-[0.3em] text-stone-400">{group.title}</h5>
                <ul className="space-y-4 text-sm font-bold text-stone-500">
                  {group.links.map((link) => {
                    const mapLinkToView = (lnk: string): string => {
                      if (lnk === 'About Us') return 'about_us';
                      if (lnk === 'Careers') return 'careers';
                      if (lnk === 'Philosophy') return 'philosophy';
                      if (lnk === 'FAQ') return 'faq';
                      if (lnk === 'Protocol Academy') return 'teaching';
                      if (lnk === 'Documentation') return 'documentation';
                      if (lnk === 'Privacy Policy') return 'privacy_policy';
                      if (lnk === 'Terms & Conditions') return 'terms_conditions';
                      if (lnk === 'Disclaimer') return 'disclaimer';
                      if (lnk === 'Copilot') return 'copilot';
                      if (lnk === 'Services') return 'services';
                      return '';
                    };
                    const targetVid = mapLinkToView(link);
                    const isSelected = currentView === targetVid;

                    return (
                      <li key={link}>
                        <button 
                          onClick={() => {
                            if (link === 'About Us') {
                              handleNavigate('about_us');
                            } else if (link === 'Careers') {
                              handleNavigate('careers');
                            } else if (link === 'Philosophy') {
                              handleNavigate('philosophy');
                            } else if (link === 'FAQ') {
                              handleNavigate('faq');
                            } else if (link === 'Protocol Academy') {
                              handleNavigate('teaching');
                            } else if (link === 'Documentation') {
                              handleNavigate('documentation');
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
                          className={`text-left transition-all duration-300 ${
                            isSelected 
                              ? 'text-[#2dd4bf] [text-shadow:0_0_12px_rgba(45,212,191,0.85)]' 
                              : `hover:text-[#2dd4bf] hover:[text-shadow:0_0_12px_rgba(45,212,191,0.85)] ${
                                  theme === 'dark' || theme === 'dim' ? 'text-stone-500' : 'text-stone-550'
                                }`
                          }`}
                        >
                          {link}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
