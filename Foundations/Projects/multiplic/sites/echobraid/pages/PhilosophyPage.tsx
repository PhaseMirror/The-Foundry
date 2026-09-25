
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  RefreshCw, 
  HardDrive, 
  BarChart, 
  Clock, 
  RotateCcw, 
  Sun, 
  CheckCircle2,
  Anchor,
  BookOpen,
  Heart
} from 'lucide-react';

interface PhilosophyPageProps {
  isDarkMode: boolean;
}

const PhilosophyPage: React.FC<PhilosophyPageProps> = ({ isDarkMode }) => {
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
    <div className={`pt-16 pb-20 ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>
      <div className="container mx-auto px-8">
        
        {/* Philosophy Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mb-32"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent block mb-6">Our Philosophy</span>
          <h1 className={`text-4xl md:text-6xl font-bold mb-10 leading-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            A Curriculum of <span className="italic font-medium text-stone-400">Sovereignty, Rhythm, and Growth.</span>
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed text-stone-500 font-medium max-w-3xl">
            ΞchoBraid is an architectural response to the neurological chaos that can overwhelm neurodivergent minds, built on a deep respect for the learner's inner world.
          </p>
        </motion.div>

        {/* Guiding Principles */}
        <section className="mb-40">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-3xl font-bold">Guiding Principles</h2>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`}></div>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-10"
          >
            {[
              {
                icon: <ShieldCheck className="text-brand-accent" />,
                title: "Sovereignty + Safety",
                desc: "Prioritizing learner agency and predictable structures. Safety is achieved through consent-based dialogue, reduced verbal load, and explicit opt-out mechanisms."
              },
              {
                icon: <RefreshCw className="text-brand-accent" />,
                title: "Recursion > Coverage",
                desc: "Deep mastery over superficial exposure. We revisit core capabilities—communication, regulation, and tool-making—each time with increasing complexity."
              },
              {
                icon: <HardDrive className="text-brand-accent" />,
                title: "Low-Cost, Offline-First",
                desc: "Focusing on simple, tangible tools like 'Firebooks'. Ensuring learning can happen anywhere without the distraction of constant connectivity."
              },
              {
                icon: <BarChart className="text-brand-accent" />,
                title: "Evidence First",
                desc: "Instructional decisions are never guesswork. We use observable, straightforward data from baseline assessments and weekly checks to guide our approach."
              }
            ].map((principle, i) => (
              <motion.div key={i} variants={itemVariants} className={`p-10 rounded-[2.5rem] border ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-white border-stone-100'}`}>
                <div className="mb-6">{principle.icon}</div>
                <h3 className="text-xl font-bold mb-4">{principle.title}</h3>
                <p className="text-stone-500 leading-relaxed font-medium">{principle.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* The Rhythm of Learning */}
        <section className="mb-40">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl font-bold mb-6">The Rhythm of Learning</h2>
            <p className="text-xl text-stone-500 leading-relaxed font-medium">
              Multi-layered clockwork that frees up cognitive resources, allowing students to focus on learning rather than navigating uncertainty.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`p-8 rounded-[2rem] border ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
              <Sun className="text-brand-accent mb-6" size={24} />
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">The Daily Beat</h4>
              <ul className="space-y-6">
                {['Arrival Regulation', 'Communication Warm-up', 'Reflection'].map((item, i) => (
                  <li key={i} className="flex gap-4 items-center">
                    <CheckCircle2 size={16} className="text-brand-accent/40" />
                    <span className="font-bold text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`p-8 rounded-[2rem] border ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
              <RotateCcw className="text-brand-accent mb-6" size={24} />
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">The Weekly Pulse</h4>
              <ul className="space-y-6">
                {['Talking-Stick Circle', 'The Tool-Build', 'The Literacy Return', 'Micro-challenge'].map((item, i) => (
                  <li key={i} className="flex gap-4 items-center">
                    <CheckCircle2 size={16} className="text-brand-accent/40" />
                    <span className="font-bold text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`p-8 rounded-[2rem] border ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
              <Clock className="text-brand-accent mb-6" size={24} />
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">The 6-Week Cycle</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                Establish a baseline, implement one new strategy, track progress with simple metrics, and revise for the next cycle.
              </p>
            </div>
          </div>
        </section>

        {/* Spiral Strands */}
        <section className="mb-40">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-3xl font-bold">Spiral Strands</h2>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`}></div>
          </div>

          <div className={`overflow-hidden rounded-[2.5rem] border ${isDarkMode ? 'border-stone-800' : 'border-stone-100 bg-white shadow-sm'}`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDarkMode ? 'bg-zinc-900/50' : 'bg-stone-50'}>
                  <th className="p-8 font-bold text-xs uppercase tracking-widest text-stone-400 w-1/4">Spiral Strand</th>
                  <th className="p-8 font-bold text-xs uppercase tracking-widest text-stone-400 w-1/4">Early (3–5)</th>
                  <th className="p-8 font-bold text-xs uppercase tracking-widest text-stone-400 w-1/4">Middle (8–10)</th>
                  <th className="p-8 font-bold text-xs uppercase tracking-widest text-stone-400 w-1/4">Later (14–17)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                <tr>
                  <td className="p-8 align-top">
                    <div className="flex items-center gap-3 font-bold">
                      <BookOpen size={16} className="text-brand-accent" />
                      Communication & Literacy
                    </div>
                  </td>
                  <td className="p-8 text-sm text-stone-500 leading-relaxed font-medium align-top">
                    Picture-based Firebooks. Scribing dictated stories.
                  </td>
                  <td className="p-8 text-sm text-stone-500 leading-relaxed font-medium align-top">
                    Writing in short journals and using TTS tools.
                  </td>
                  <td className="p-8 text-sm text-stone-500 leading-relaxed font-medium align-top">
                    Advanced literacy, leading seminars, case studies.
                  </td>
                </tr>
                <tr>
                  <td className="p-8 align-top">
                    <div className="flex items-center gap-3 font-bold">
                      <Anchor size={16} className="text-brand-accent" />
                      Systems & Tool-Making
                    </div>
                  </td>
                  <td className="p-8 text-sm text-stone-500 leading-relaxed font-medium align-top">
                    Simple tools like emotion cards or choice boards.
                  </td>
                  <td className="p-8 text-sm text-stone-500 leading-relaxed font-medium align-top">
                    Custom study kits and task-breakdown cards.
                  </td>
                  <td className="p-8 text-sm text-stone-500 leading-relaxed font-medium align-top">
                    Micro-services, planner templates, resource maps.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Conclusion */}
        <section className={`p-16 rounded-[4rem] text-center ${isDarkMode ? 'bg-stone-900/40' : 'bg-brand-light border border-stone-100'}`}>
          <div className="max-w-3xl mx-auto">
            <Heart className="text-brand-accent mx-auto mb-8" size={32} />
            <h2 className="text-3xl font-bold mb-8">Cultivating a Coherent World</h2>
            <p className="text-xl text-stone-500 leading-relaxed font-medium">
              We replace anxiety with trust and confusion with predictability. ΞchoBraid is more than a curriculum; it is a framework for building educational spaces where every student feels secure enough to flourish.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default PhilosophyPage;
