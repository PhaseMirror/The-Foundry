
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  ShieldCheck, 
  HandHelping, 
  Sparkles, 
  Fingerprint,
  RefreshCw,
  Compass,
  Heart
} from 'lucide-react';

interface MissionPageProps {
  isDarkMode: boolean;
}

const MissionPage: React.FC<MissionPageProps> = ({ isDarkMode }) => {
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
        
        {/* Mission Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mb-32"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent block mb-6">Our Mission</span>
          <h1 className={`text-4xl md:text-6xl font-bold mb-10 leading-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            To lawfully honor <br /> <span className="italic font-medium text-stone-400">every learner’s signal.</span>
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed text-stone-500 font-medium max-w-3xl">
            ΞchoBraid weaves trauma‑aware architecture with genuinely personalized education to build worlds where neurodivergent learners feel safe enough to grow.
          </p>
        </motion.div>

        {/* Core Pillars */}
        <section className="mb-40">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-3xl font-bold">Foundation of Trust</h2>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`}></div>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <ShieldCheck className="text-brand-accent" />,
                title: "Inherent Safety",
                desc: "Sovereignty, safety, and consent are built into the math and the software—not added on later as an afterthought."
              },
              {
                icon: <RefreshCw className="text-brand-accent" />,
                title: "Spiral Growth",
                desc: "Self‑correcting education principles guide our curricula, ensuring we revisit core skills with more depth as learners feel ready."
              },
              {
                icon: <HandHelping className="text-brand-accent" />,
                title: "Adaptive Space",
                desc: "Tools that adapt in real time to a learner’s cognitive and emotional state, instead of forcing them to adapt to the system."
              }
            ].map((pillar, i) => (
              <motion.div key={i} variants={itemVariants} className={`p-10 rounded-[2.5rem] border ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                <div className="mb-6">{pillar.icon}</div>
                <h3 className="text-xl font-bold mb-4">{pillar.title}</h3>
                <p className="text-stone-500 leading-relaxed font-medium text-sm">{pillar.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* The Ethics of Memory */}
        <section className="mb-40">
          <div className={`p-12 md:p-20 rounded-[4rem] relative overflow-hidden ${isDarkMode ? 'bg-stone-900/30 border border-stone-800' : 'bg-brand-light border border-stone-100'}`}>
            <div className="max-w-3xl relative z-10">
              <Fingerprint className="text-brand-accent mb-8" size={32} />
              <h2 className="text-3xl font-bold mb-8">Dignity by Design</h2>
              <p className="text-xl text-stone-500 leading-relaxed font-medium mb-10">
                Our work turns anticipatory silence, ethical firewalls, and user‑controlled memory into everyday classroom practices. Personalized learning never comes at the cost of stability.
              </p>
              <div className="flex flex-wrap gap-4">
                {["Anticipatory Silence", "Ethical Firewalls", "User Memory Control", "Signal Honoring"].map((item, i) => (
                  <span key={i} className={`px-5 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'border-stone-800 bg-zinc-950/50 text-stone-400' : 'border-stone-200 bg-white text-stone-500'}`}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Vision */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                <Compass size={24} />
              </div>
              <h2 className="text-4xl font-bold leading-tight">Supported enough to shape your own path.</h2>
              <p className="text-lg text-stone-500 font-medium leading-relaxed">
                Across homes, schools, and therapeutic settings, our mission is simple: build coherent worlds where neurodivergent learners can feel confident enough to be themselves, and supported enough to shape their own educational paths.
              </p>
            </div>
            <div className="relative">
              <div className={`aspect-square rounded-[3rem] border flex items-center justify-center p-12 ${isDarkMode ? 'bg-zinc-900/20 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                <div className="text-center">
                  <Heart className="text-brand-accent mx-auto mb-6 opacity-40" size={48} />
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">Centered on the Learner</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final Statement */}
        <section className="text-center max-w-2xl mx-auto py-20">
          <p className="text-2xl md:text-3xl font-bold italic text-stone-400 leading-relaxed">
            "Confident enough to be themselves, and supported enough to shape their own educational paths."
          </p>
        </section>

      </div>
    </div>
  );
};

export default MissionPage;
