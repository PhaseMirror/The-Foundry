
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Infinity, 
  PenTool, 
  Activity, 
  Clock, 
  Package, 
  ShieldAlert, 
  FileText, 
  Mic, 
  Palette, 
  Fingerprint,
  RotateCcw,
  Waves
} from 'lucide-react';

interface FeaturesPageProps {
  isDarkMode: boolean;
}

const FeaturesPage: React.FC<FeaturesPageProps> = ({ isDarkMode }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`pt-16 pb-24 ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>
      <div className="container mx-auto px-8">
        
        {/* Features Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mb-32"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent block mb-6">Capabilities</span>
          <h1 className={`text-4xl md:text-6xl font-bold mb-10 leading-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Tools designed for <span className="italic font-medium text-stone-400">resonance, not just results.</span>
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed text-stone-500 font-medium max-w-3xl">
            ΞchoBraid wraps your learning in predictable routines and soft signals, prioritizing safety and sovereignty above all else.
          </p>
        </motion.div>

        {/* The Core Three */}
        <section className="mb-40">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-3xl font-bold">The Core Three</h2>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`}></div>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Soft Loop */}
            <motion.div variants={itemVariants} className={`p-10 rounded-[2.5rem] border flex flex-col h-full ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
              <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent mb-8">
                <Infinity size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-6">Soft Loop</h3>
              <p className="text-stone-500 leading-relaxed font-medium mb-8 flex-grow">
                A low-demand reflective space. Start with a preference check (density, motion) and enter a timed pause with no performance targets.
              </p>
              <ul className="space-y-3 text-sm font-bold text-stone-400">
                <li className="flex gap-3">
                  <div className="w-1 h-1 bg-brand-accent rounded-full mt-2 shrink-0"></div>
                  <span>Optional breath prompts</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-1 h-1 bg-brand-accent rounded-full mt-2 shrink-0"></div>
                  <span>Local PDF exports</span>
                </li>
              </ul>
            </motion.div>

            {/* Holo-Scriptor */}
            <motion.div variants={itemVariants} className={`p-10 rounded-[2.5rem] border flex flex-col h-full ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
              <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent mb-8">
                <PenTool size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-6">Holo-Scriptor</h3>
              <p className="text-stone-500 leading-relaxed font-medium mb-8 flex-grow">
                A spiral journaling engine. Write, speak, or draw in layers. Each revisit invites a small extension, mirroring long-term mastery.
              </p>
              <div className="flex gap-4 mb-2">
                <FileText size={16} className="text-stone-400" />
                <Mic size={16} className="text-stone-400" />
                <Palette size={16} className="text-stone-400" />
              </div>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-4">Multi-Modal Inputs</p>
            </motion.div>

            {/* Coherence Map */}
            <motion.div variants={itemVariants} className={`p-10 rounded-[2.5rem] border flex flex-col h-full ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
              <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent mb-8">
                <Waves size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-6">Coherence Map</h3>
              <p className="text-stone-500 leading-relaxed font-medium mb-8 flex-grow">
                Soft signals about pacing and resonance. No grades—just invitations to slow down or take a break when entropy drifts.
              </p>
              <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-zinc-950/50' : 'bg-stone-50'}`}>
                <div className="flex items-center gap-3 text-brand-accent text-xs font-bold uppercase tracking-widest">
                  <Activity size={12} />
                  <span>Resonance Detection</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Routines & Tools */}
        <section className="mb-40 grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <div className="flex items-center gap-4 mb-12">
              <Clock className="text-brand-accent" size={24} />
              <h2 className="text-3xl font-bold">Ξcho Routines</h2>
            </div>
            <p className="text-lg text-stone-500 leading-relaxed font-medium mb-12">
              We weave features into a stable "clockwork" rhythm that reduces cognitive load, freeing energy for curiosity.
            </p>
            <div className="space-y-6">
              {[
                { label: 'Daily', title: 'Arrival Regulation & Reflection', desc: 'Predictable starts and ends to every learning day.' },
                { label: 'Weekly', title: 'Talking-Stick & Tool-Build', desc: 'Social connection and tangible kit creation.' },
                { label: 'Cycle', title: '6-Week Growth Pulse', desc: 'Simple baseline checks without high-stakes pressure.' },
              ].map((routine, i) => (
                <div key={i} className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900/30 border-stone-800' : 'bg-white border-stone-100'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-2 block">{routine.label}</span>
                  <h4 className="font-bold mb-2">{routine.title}</h4>
                  <p className="text-sm text-stone-500 font-medium">{routine.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4 mb-12">
              <Package className="text-brand-accent" size={24} />
              <h2 className="text-3xl font-bold">Offline-First Tools</h2>
            </div>
            <p className="text-lg text-stone-500 leading-relaxed font-medium mb-12">
              Tangible, low-cost tools that learners build themselves. Agency comes from being a tool-maker, not just a user.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                "Firebooks",
                "Visual Schedules",
                "Choice Boards",
                "Calm Kits",
                "Checklist Builders",
                "Micro-templates"
              ].map((tool, i) => (
                <div key={i} className={`flex items-center gap-4 p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900/20 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                  <div className="w-2 h-2 rounded-full bg-brand-accent/40"></div>
                  <span className="font-bold text-sm">{tool}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety & Memory */}
        <section className={`p-12 md:p-20 rounded-[4rem] relative overflow-hidden ${isDarkMode ? 'bg-stone-900/40 border border-stone-800' : 'bg-stone-900 text-stone-100'}`}>
          <div className="max-w-3xl relative z-10">
            <ShieldAlert className="text-brand-accent mb-8" size={32} />
            <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-stone-100'}`}>Safety, Consent, and Memory Control</h2>
            <p className="text-xl text-stone-400 leading-relaxed font-medium mb-12">
              Safety is embedded, not an add-on. We honor explicit opt-out paths and give you full control over how long your digital presence lasts.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Fingerprint className="text-brand-accent shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold mb-2">Default Privacy</h4>
                    <p className="text-sm text-stone-400 font-medium">Nothing is saved to the cloud unless you explicitly opt-in for a specific session.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <RotateCcw className="text-brand-accent shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold mb-2">Memory Decay</h4>
                    <p className="text-sm text-stone-400 font-medium">Choose "Erase after 24 hours" or "Local only" to keep your data truly yours.</p>
                  </div>
                </div>
              </div>
              
              <div className={`p-8 rounded-3xl border border-white/10 ${isDarkMode ? 'bg-zinc-950/50' : 'bg-white/5'}`}>
                <h4 className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-4">Proactive Controls</h4>
                <ul className="space-y-4 text-sm font-bold">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Pause / Quiet Shortcuts
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Reduced Verbal Load Mode
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Sensitive Topic Preview
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default FeaturesPage;
