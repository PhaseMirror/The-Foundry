
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  RefreshCw, 
  HardDrive, 
  BarChart, 
  TreePine, 
  Grid3X3, 
  Zap, 
  Cpu, 
  Users, 
  GraduationCap,
  Layers
} from 'lucide-react';

interface CurriculumViewProps {
  isDarkMode: boolean;
}

const CurriculumView: React.FC<CurriculumViewProps> = ({ isDarkMode }) => {
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
    <div className={`pt-32 pb-20 ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>
      <div className="container mx-auto px-8">
        
        {/* Intro */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mb-24"
        >
          <h1 className={`text-4xl md:text-6xl font-bold mb-8 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
            PHASΞ MIRROR Curricular <span className="italic font-medium text-stone-400">Architecture</span>
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed text-stone-500 font-medium">
            A sovereignty-first, ASD-centered ecosystem designed for predictable, trauma-aware rhythms. Our pathways wrap around any academic content as a regulatory shell.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-32"
        >
          
          {/* 1. ASD Aligned Curriculum */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <div className="w-12 h-12 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent mb-6">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-3xl font-bold mb-4">ASD–Aligned Core</h2>
              <p className="text-stone-500 font-medium leading-relaxed">
                The regulatory layer: sovereignty-first structures that build agency through recursive growth cycles.
              </p>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { icon: <ShieldCheck size={18}/>, title: "Sovereignty & Safety", desc: "Consent-based routines and explicit opt-out mechanisms." },
                { icon: <RefreshCw size={18}/>, title: "Recursion & Coverage", desc: "Core capabilities revisited every 6-week cycle with increasing complexity." },
                { icon: <HardDrive size={18}/>, title: "Offline-First", desc: "Firebooks and visual schedules before screens." },
                { icon: <BarChart size={18}/>, title: "Evidence-First", desc: "Micro-metrics to prove safety and growth." }
              ].map((item, i) => (
                <div key={i} className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900/50 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                  <div className="flex items-center gap-3 mb-4 text-brand-accent">
                    {item.icon}
                    <h4 className="font-bold text-sm uppercase tracking-widest">{item.title}</h4>
                  </div>
                  <p className="text-stone-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* 2. K-8 Learning Garden */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 mb-6">
                <TreePine size={24} />
              </div>
              <h2 className="text-3xl font-bold mb-4">K–8 Learning Garden</h2>
              <p className="text-stone-500 font-medium leading-relaxed">
                A systems and citizenship curriculum using skip-logic to adapt pathways while building teamwork and empathy.
              </p>
            </div>
            <div className="lg:col-span-2">
              <div className={`p-1 bg-stone-100/10 rounded-[2rem] ${isDarkMode ? 'bg-zinc-900/30' : 'bg-stone-50'}`}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-px overflow-hidden rounded-[2rem]">
                  {[
                    { band: "K", theme: "Exploring Our World Together" },
                    { band: "1st", theme: "Connected Communities" },
                    { band: "2nd", theme: "Our World, Our Responsibility" },
                    { band: "3rd", theme: "Building a Better Tomorrow" },
                    { band: "4th", theme: "Understanding Our World" },
                    { band: "5th", theme: "Exploring Connections" },
                    { band: "6th", theme: "Our Place in the World" },
                    { band: "7th", theme: "Interdisciplinary Explorations" },
                    { band: "8th", theme: "Preparing for the Future" },
                  ].map((band, i) => (
                    <div key={i} className={`p-6 ${isDarkMode ? 'bg-zinc-950/40' : 'bg-white'}`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent block mb-2">{band.band}</span>
                      <p className="text-xs font-bold leading-snug">{band.theme}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* 3. Diagrammatic Math */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-6">
                <Grid3X3 size={24} />
              </div>
              <h2 className="text-3xl font-bold mb-4">Diagrammatic Math</h2>
              <p className="text-stone-500 font-medium leading-relaxed">
                Operations over axioms. Learners manipulate diagrams across Geometry (G), Number (N), and Quantum (Q) frames.
              </p>
            </div>
            <div className="lg:col-span-2 space-y-4">
              {[
                { age: "4–6", title: "String Town", desc: "Move Bingo and Prime Blocks." },
                { age: "7–10", title: "Upper Primary", desc: "Flows, fractions, and symmetry labs." },
                { age: "11–13", title: "Middle School", desc: "Markov walk mats and harmonic strings." },
                { age: "14–18", title: "Secondary", desc: "Linear diagrams and info flows." },
                { age: "Adult", title: "Advanced Studio", desc: "Categories, spectra, and zeta diagrams." },
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between p-6 rounded-2xl border ${isDarkMode ? 'border-stone-800 bg-zinc-900/30' : 'border-stone-100 bg-white'}`}>
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-bold text-stone-500 w-12">{item.age}</span>
                    <h4 className="font-bold">{item.title}</h4>
                  </div>
                  <span className="text-sm text-stone-500">{item.desc}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* 4. Quantum & 5. Meta-ML Row */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-zinc-900/50 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
              <Zap className="text-yellow-500 mb-6" size={32} />
              <h3 className="text-2xl font-bold mb-4">Quantum & Phenomenology</h3>
              <p className="text-stone-500 font-medium mb-8 leading-relaxed">Integrated tracks from ages 10 to Postdoc, blending labs with tensor-based thinking.</p>
              <ul className="space-y-3 text-sm font-bold text-stone-400">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-yellow-500 rounded-full"></div> Particle Zoo Scavenger Hunts</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-yellow-500 rounded-full"></div> Dice-based Randomness Games</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-yellow-500 rounded-full"></div> Phenomenology Spiral</li>
              </ul>
            </div>
            <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-zinc-900/50 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
              <Cpu className="text-purple-500 mb-6" size={32} />
              <h3 className="text-2xl font-bold mb-4">Meta-ML & AI Collab</h3>
              <p className="text-stone-500 font-medium mb-8 leading-relaxed">Teaching humans how to collaborate with AI using MML loops and prompt protocols.</p>
              <ul className="space-y-3 text-sm font-bold text-stone-400">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div> Design–Prompt–Revise loops</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div> G/E/C Safe AI Protocols</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div> Collaboration Metrics</li>
              </ul>
            </div>
          </motion.section>

          {/* 6. Multiplicity Umbrella */}
          <motion.section variants={itemVariants} className={`p-12 rounded-[3.5rem] relative overflow-hidden ${isDarkMode ? 'bg-stone-900/50' : 'bg-stone-900 text-stone-100'}`}>
            <div className="relative z-10 max-w-2xl">
              <Layers className="text-brand-accent mb-6" size={32} />
              <h2 className="text-3xl font-bold mb-6">Multiplicity-as-Relationship</h2>
              <p className="text-xl leading-relaxed text-stone-400 mb-10 font-medium">
                The "culture layer" that frames all other curricula. We teach "many-truth" awareness, psychological safety, and epistemic humility across all bands.
              </p>
              <div className="flex flex-wrap gap-4">
                {["Dialogue Protocols", "Conflict Literacy", "Epistemic Humility", "Trust Building"].map((tag, i) => (
                  <span key={i} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-bold tracking-widest">{tag}</span>
                ))}
              </div>
            </div>
          </motion.section>

          {/* 7. Community Dynamics (Higher Ed) */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-1">
              <div className="w-12 h-12 bg-stone-500/10 rounded-xl flex items-center justify-center text-stone-500 mb-6">
                <Users size={24} />
              </div>
              <h2 className="text-3xl font-bold mb-4">Higher Ed & Community</h2>
              <p className="text-stone-500 font-medium leading-relaxed">
                Professional programs for applying Multiplicity Theory to family and community dialogue, mediation, and systems work.
              </p>
            </div>
            <div className="lg:col-span-2">
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
                 <div className={`p-8 rounded-3xl border ${isDarkMode ? 'border-stone-800' : 'border-stone-100 bg-white'}`}>
                    <h4 className="font-bold mb-2">Applied Labs</h4>
                    <p className="text-sm text-stone-500 leading-relaxed font-medium">Repair mediation, belonging data, and community design sprints.</p>
                 </div>
                 <div className={`p-8 rounded-3xl border ${isDarkMode ? 'border-stone-800' : 'border-stone-100 bg-white'}`}>
                    <h4 className="font-bold mb-2">Core Outcomes</h4>
                    <p className="text-sm text-stone-500 leading-relaxed font-medium">Perspective integration, measurement literacy, and data stewardship.</p>
                 </div>
              </div>
            </div>
          </motion.section>

        </motion.div>
      </div>
    </div>
  );
};

export default CurriculumView;
