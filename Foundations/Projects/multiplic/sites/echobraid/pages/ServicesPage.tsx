
import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Server, 
  BarChart3, 
  Briefcase, 
  ShieldCheck, 
  Globe, 
  Lock, 
  FileText,
  Settings,
  Database,
  Users,
  Code,
  Sparkles,
  Home,
  CheckSquare,
  Cpu,
  Library,
  MessageSquare,
  BookOpen,
  Box
} from 'lucide-react';

interface ServicesPageProps {
  isDarkMode: boolean;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ isDarkMode }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`pt-16 pb-24 ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>
      <div className="container mx-auto px-8">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mb-32"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent block mb-6">Sovereignty First Services</span>
          <h1 className={`text-4xl md:text-6xl font-bold mb-10 leading-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Customized Support <span className="italic font-medium text-stone-400">& Systems.</span>
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed text-stone-500 font-medium max-w-3xl">
            From home routines to institutional nodes. We provide the infrastructure that honors neurodivergent signals across every learning context.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-40"
        >

          {/* 1. Home Routines Starter Kit */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${isDarkMode ? 'bg-zinc-900 text-brand-accent' : 'bg-stone-50 text-brand-accent'}`}>
                <CheckSquare size={28} />
              </div>
              <h2 className="text-3xl font-bold mb-6">Home Routines Starter Kit</h2>
              <p className="text-lg text-stone-500 font-medium leading-relaxed mb-8">
                Printable visual schedules, Arrival/Regulation/Warm‑Down scripts, and simple “Ξcho Routines” you can run in 5–10 minutes each day.
              </p>
              <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                <h4 className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-4">Implementation support</h4>
                <p className="text-sm text-stone-500 leading-relaxed font-medium">
                  Step‑by‑step guidance for introducing choice boards, calm corners, and communication warm‑ups without turning the home into a clinic or a classroom.
                </p>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className={`aspect-video rounded-[3rem] border border-dashed flex items-center justify-center ${isDarkMode ? 'border-stone-800 bg-zinc-900/10' : 'border-stone-200 bg-stone-50'}`}>
                <div className="text-center opacity-30">
                  <Sparkles size={48} className="mx-auto mb-4 text-brand-accent" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Visual Pack Preview</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* 2. Homeschool Implementation Support */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
             <div className="order-2 lg:order-1 flex gap-6">
                <div className={`p-8 rounded-[2.5rem] border flex-1 ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                  <FileText className="text-brand-accent mb-4" size={24} />
                  <h4 className="font-bold text-sm mb-2">Local Data Tools</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">Weekly check-ins for transitions and tool use, stored locally in binders or offline folders.</p>
                </div>
                <div className={`p-8 rounded-[2.5rem] border flex-1 ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                  <Users className="text-brand-accent mb-4" size={24} />
                  <h4 className="font-bold text-sm mb-2">Pod Consults</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">Mapping strands into a family's existing curriculum (Science, Arts, or Garden projects).</p>
                </div>
             </div>
             <div className="order-1 lg:order-2">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${isDarkMode ? 'bg-zinc-900 text-brand-accent' : 'bg-stone-50 text-brand-accent'}`}>
                <Box size={28} />
              </div>
              <h2 className="text-3xl font-bold mb-6">Homeschool & Micro‑school Support</h2>
              <p className="text-lg text-stone-500 font-medium leading-relaxed">
                Consultation packages to map ΞchoBraid strands into your existing learning environment, ensuring the philosophy is tailored to your specific context.
              </p>
            </div>
          </motion.section>

          {/* 3. Low-Stimulus App Mode for Home */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${isDarkMode ? 'bg-zinc-900 text-brand-accent' : 'bg-stone-50 text-brand-accent'}`}>
                <Home size={28} />
              </div>
              <h2 className="text-3xl font-bold mb-6">Low‑Stimulus App Mode for Home</h2>
              <p className="text-lg text-stone-500 font-medium leading-relaxed mb-8">
                A “home view” of the ΞchoBraid app with fewer options on screen, family‑friendly language, and clear “do not save” defaults.
              </p>
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-zinc-950/50 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <Cpu size={16} className="text-brand-accent" />
                  <h4 className="text-xs font-bold uppercase tracking-widest">Copilot Reflection Mode</h4>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">Reflection-only mode with parent-level control over what's stored or erased. No advice, just prompts and gentle paraphrasing.</p>
              </div>
            </div>
            <div className={`p-10 rounded-[3rem] border border-stone-100 flex flex-col justify-center items-center text-center ${isDarkMode ? 'bg-stone-900/40 border-stone-800' : 'bg-white shadow-sm'}`}>
              <div className="w-full aspect-[4/3] bg-brand-accent/5 rounded-2xl flex items-center justify-center mb-8">
                <div className="w-2/3 h-1/2 border border-brand-accent/20 rounded-lg relative">
                  <div className="absolute top-4 left-4 right-4 h-2 bg-brand-accent/10 rounded"></div>
                  <div className="absolute top-10 left-4 w-1/2 h-2 bg-brand-accent/10 rounded"></div>
                  <div className="absolute bottom-4 left-4 right-4 h-8 bg-brand-accent/10 rounded"></div>
                </div>
              </div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Interface: Reduced Complexity</p>
            </div>
          </motion.section>

          {/* 4. Resource Library and Stories */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
             <div className="order-2 lg:order-1">
                <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-6">Family Zines</h4>
                  <p className="text-sm text-stone-500 leading-relaxed font-medium mb-4">
                    Templates for families to write and share their own “day in our ΞchoBraid home” stories.
                  </p>
                  <p className="text-[10px] font-bold text-stone-400 italic">"Adaptation—not perfection—is the goal."</p>
                </div>
             </div>
             <div className="order-1 lg:order-2">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${isDarkMode ? 'bg-zinc-900 text-brand-accent' : 'bg-stone-50 text-brand-accent'}`}>
                <Library size={28} />
              </div>
              <h2 className="text-3xl font-bold mb-6">Resource Library & Family Stories</h2>
              <p className="text-lg text-stone-500 font-medium leading-relaxed">
                A curated digital library of stories, checklists, and example routines from other families using ΞchoBraid, emphasizing diverse neurodivergent profiles.
              </p>
            </div>
          </motion.section>

          {/* Divider to Institutional Section */}
          <div className="py-12 flex items-center gap-8">
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`}></div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.5em]">Institutional Infrastructure</span>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`}></div>
          </div>
          
          {/* Institutional 1. Multi-site Administration */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${isDarkMode ? 'bg-zinc-900 text-brand-accent' : 'bg-stone-50 text-brand-accent'}`}>
                <LayoutDashboard size={28} />
              </div>
              <h2 className="text-3xl font-bold mb-6">Multi-site Administration & Governance</h2>
              <p className="text-lg text-stone-500 font-medium leading-relaxed mb-8">
                Organization-level control panels designed to manage multiple campuses, pods, or clinical programs from a single dashboard.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: <Globe size={18}/>, text: "Centralized governance for distributed programs." },
                  { icon: <Users size={18}/>, text: "Role-based access (Teacher, Therapist, Admin)." },
                  { icon: <Settings size={18}/>, text: "Site-specific cadence and ethics policy settings." }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-sm font-bold text-stone-400">
                    <span className="text-brand-accent">{item.icon}</span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-6">Feature Spotlight</h4>
              <p className="text-sm text-stone-500 leading-relaxed font-medium">
                Enable or disable <strong className={isDarkMode ? 'text-white' : 'text-stone-900'}>UNPROVEN</strong> experimental features at the site level, ensuring compliance with local risk management and ethics frameworks.
              </p>
            </div>
          </motion.section>

          {/* Institutional 2. Local Node Hosting */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="order-2 lg:order-1">
              <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                <Database className="text-brand-accent mb-6" size={32} />
                <h3 className="text-xl font-bold mb-4">Configurable Retention</h3>
                <p className="text-sm text-stone-500 leading-relaxed font-medium">
                  Set rules for data decay: 24-hour erase, term-bound storage, or long-term archives, with learner-level deletion options always honored.
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${isDarkMode ? 'bg-zinc-900 text-brand-accent' : 'bg-stone-50 text-brand-accent'}`}>
                <Server size={28} />
              </div>
              <h2 className="text-3xl font-bold mb-6">Local Node Hosting</h2>
              <p className="text-lg text-stone-500 font-medium leading-relaxed mb-8">
                On-premise or region-local “ΞchoBraid Node” hosting so portfolios, metrics, and logs live under your institution’s control, never a central cloud.
              </p>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-stone-300 dark:border-stone-800">
                <ShieldCheck size={18} className="text-brand-accent" />
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Institution-level data sovereignty</p>
              </div>
            </div>
          </motion.section>

          {/* Institutional 3. Advanced Reporting */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${isDarkMode ? 'bg-zinc-900 text-brand-accent' : 'bg-stone-50 text-brand-accent'}`}>
                <BarChart3 size={28} />
              </div>
              <h2 className="text-3xl font-bold mb-6">Advanced but “Small” Reporting</h2>
              <p className="text-lg text-stone-500 font-medium leading-relaxed mb-8">
                Human-readable dashboards showing trends in regulation success, communication attempts, and participation—never scores or behaviorist labels.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Transition Success Rates",
                  "Q&A Ratios",
                  "Tool-use Frequency",
                  "Resonance Drift Data"
                ].map((tag, i) => (
                  <div key={i} className={`px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'bg-zinc-900/50 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                    {tag}
                  </div>
                ))}
              </div>
            </div>
            <div className={`p-10 rounded-[3rem] border flex flex-col justify-center items-center text-center ${isDarkMode ? 'bg-stone-900/40 border-stone-800' : 'bg-stone-900 text-stone-100 border-stone-800'}`}>
              <FileText className="text-brand-accent mb-6" size={40} />
              <h4 className="text-xl font-bold mb-4">IEP & Review Exports</h4>
              <p className="text-sm text-stone-400 leading-relaxed font-medium mb-8">
                One-click exports to PDF or CSV for family conferences, with explicit consent flows before sharing beyond the local node.
              </p>
            </div>
          </motion.section>

          {/* Institutional 4. Custom Bundles */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="order-2 lg:order-1">
              <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <Code size={20} className="text-brand-accent" />
                  <h4 className="text-sm font-bold uppercase tracking-widest">Integrations</h4>
                </div>
                <p className="text-sm text-stone-500 leading-relaxed font-medium mb-6">
                  API hooks and flat-file sync for referencing routines inside existing SIS/LMS systems without copying full learner histories.
                </p>
                <div className={`p-4 rounded-xl text-[10px] font-bold tracking-widest text-center ${isDarkMode ? 'bg-zinc-950 text-stone-500' : 'bg-stone-50 text-stone-400'}`}>
                  WHITE-LABEL & CO-BRANDING OPTIONS AVAILABLE
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${isDarkMode ? 'bg-zinc-900 text-brand-accent' : 'bg-stone-50 text-brand-accent'}`}>
                <Briefcase size={28} />
              </div>
              <h2 className="text-3xl font-bold mb-6">Custom Bundles & Integrations</h2>
              <p className="text-lg text-stone-500 font-medium leading-relaxed mb-8">
                Tailored ΞchoBraid bundles for specific contexts: early-grades autism classrooms, justice-linked programs, or higher-ed labs.
              </p>
              <div className="space-y-4">
                <p className="text-sm font-bold text-brand-accent flex items-center gap-2">
                  <Lock size={14} /> Consent-first patterns preserved
                </p>
                <p className="text-sm font-bold text-brand-accent flex items-center gap-2">
                  <Settings size={14} /> Adaptive pathway logic
                </p>
              </div>
            </div>
          </motion.section>

        </motion.div>

        {/* Final Statement */}
        <section className="text-center py-32">
          <p className="text-2xl md:text-3xl font-bold italic text-stone-400 leading-relaxed max-w-3xl mx-auto">
            "Extending infrastructure while honoring the core commitment to cognitive dignity and learner agency."
          </p>
        </section>

      </div>
    </div>
  );
};

export default ServicesPage;
