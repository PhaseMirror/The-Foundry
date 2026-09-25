
import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  ShieldCheck, 
  RefreshCw, 
  HardDrive, 
  Clock, 
  Users, 
  Hammer, 
  RotateCcw, 
  Calendar, 
  CheckSquare, 
  MessageSquare,
  BarChart2,
  Lightbulb
} from 'lucide-react';

interface TeachingPageProps {
  isDarkMode: boolean;
}

const TeachingPage: React.FC<TeachingPageProps> = ({ isDarkMode }) => {
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
          className="max-w-4xl mb-24"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent block mb-6">For Educators</span>
          <h1 className={`text-4xl md:text-6xl font-bold mb-10 leading-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Teaching with <br /><span className="italic font-medium text-stone-400">Sovereignty and Rhythm.</span>
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed text-stone-500 font-medium max-w-2xl">
            Implementation guides and routines designed to wrap around any academic content as a regulatory shell.
          </p>
        </motion.div>

        {/* Core Principles */}
        <section className="mb-40">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl font-bold">Core Teaching Principles</h2>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`}></div>
          </div>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <ShieldCheck className="text-brand-accent" />,
                title: "Sovereignty & Safety",
                desc: "Center learner agency, predictable structure, and consent‑based dialogue. Always provide explicit ways to opt out or change modality."
              },
              {
                icon: <RefreshCw className="text-brand-accent" />,
                title: "Recursion over Coverage",
                desc: "Revisit core capabilities at increasing complexity instead of racing through topics. Use short cycles to make growth visible."
              },
              {
                icon: <HardDrive className="text-brand-accent" />,
                title: "Low‑Cost, Offline‑First",
                desc: "Assume minimal tech: Firebooks and printed visuals are enough. Advanced tools are always optional research add-ons."
              }
            ].map((principle, i) => (
              <motion.div key={i} variants={itemVariants} className={`p-10 rounded-[2.5rem] border ${isDarkMode ? 'bg-zinc-900/30 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                <div className="mb-6">{principle.icon}</div>
                <h3 className="text-xl font-bold mb-4">{principle.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed font-medium">{principle.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Daily Ξcho Routines */}
        <section className="mb-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-8">Daily Ξcho Routines</h2>
              <p className="text-lg text-stone-500 font-medium mb-10">
                A 10–20 minute total bookend for any subject to reduce "cold start" distress and frame the day.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Arrival Regulation (3–7 min)", desc: "Visual schedule check-in and one regulation option (quiet corner, movement circuit, or breath prompt)." },
                  { title: "Communication Warm-Up (5–10 min)", desc: "Short multimodal prompts with reduced verbal load. Response options: speaking, drawing, AAC, or gesture cards." },
                  { title: "Reflection (3–5 min)", desc: "Multimodal closing: 'One thing I did, learned, or noticed.' The option to pass is always honored." }
                ].map((routine, i) => (
                  <div key={i} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-zinc-950/50 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Clock size={16} className="text-brand-accent" />
                      <h4 className="font-bold text-sm">{routine.title}</h4>
                    </div>
                    <p className="text-xs text-stone-500 font-medium leading-relaxed">{routine.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className={`aspect-square rounded-[4rem] flex items-center justify-center p-12 ${isDarkMode ? 'bg-zinc-900/20' : 'bg-brand-light border border-stone-100'}`}>
              <div className="text-center">
                <RotateCcw size={48} className="text-brand-accent opacity-30 mx-auto mb-6" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400">The Rhythmic Shell</p>
              </div>
            </div>
          </div>
        </section>

        {/* Weekly Practices */}
        <section className="mb-40">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-3xl font-bold">Weekly Signature Practices</h2>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`}></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users size={24} />,
                title: "Talking‑Stick Circle",
                time: "20–30 min",
                desc: "Physical tokens and role cards. Normalize passing as success, not failure."
              },
              {
                icon: <Hammer size={24} />,
                title: "Tool‑Build Session",
                time: "30–45 min",
                desc: "Learners create a small tool to solve a real problem (checklists, calm cards, timers)."
              },
              {
                icon: <BookOpen size={24} />,
                title: "Literacy Return",
                time: "15–20 min",
                desc: "Re-read a Firebook from 1-3 weeks ago. Add one new annotation to notice growth."
              }
            ].map((practice, i) => (
              <div key={i} className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900/30 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                <div className="text-brand-accent mb-6">{practice.icon}</div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold">{practice.title}</h4>
                  <span className="text-[10px] font-bold text-stone-400">{practice.time}</span>
                </div>
                <p className="text-sm text-stone-500 font-medium leading-relaxed">{practice.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Six-Week Cycle */}
        <section className="mb-40">
          <div className={`p-12 md:p-20 rounded-[4rem] ${isDarkMode ? 'bg-stone-900/30' : 'bg-brand-dark text-stone-100'}`}>
            <h2 className="text-3xl font-bold mb-12">The Six‑Week Ξcho Cycle</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { week: "Week 0", title: "Setup", desc: "Map sensory supports and take 2-3 simple baselines (transition success, Q/A ratio, or tool use)." },
                { week: "Weeks 1–5", title: "Run One Change", desc: "Run routines and weekly practices. Choose one target strand and change only one variable (e.g. visual timers)." },
                { week: "Week 6", title: "Showcase & Review", desc: "Learners present tools. Re-run baseline probes, compare data, and co-plan the next cycle." }
              ].map((step, i) => (
                <div key={i} className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">{step.week}</span>
                    <div className="h-px flex-1 bg-white/10"></div>
                  </div>
                  <h4 className="text-xl font-bold mb-4">{step.title}</h4>
                  <p className="text-sm text-stone-400 font-medium leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Classroom Practices Grid */}
        <section className="mb-40">
           <h2 className="text-3xl font-bold mb-16 text-center">Classroom Practices</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className={`p-10 rounded-[2.5rem] border ${isDarkMode ? 'bg-zinc-900/30 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                <Calendar className="text-brand-accent mb-6" size={28} />
                <h4 className="font-bold mb-4 uppercase tracking-widest text-xs">ASD-Critical Supports</h4>
                <ul className="text-sm text-stone-500 space-y-3 font-medium">
                  <li>• Visual schedules & timers</li>
                  <li>• Predictable seating</li>
                  <li>• Noise-reduction options</li>
                  <li>• Written/pictorial instructions</li>
                </ul>
              </div>
              <div className={`p-10 rounded-[2.5rem] border ${isDarkMode ? 'bg-zinc-900/30 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                <CheckSquare className="text-brand-accent mb-6" size={28} />
                <h4 className="font-bold mb-4 uppercase tracking-widest text-xs">Task Design</h4>
                <ul className="text-sm text-stone-500 space-y-3 font-medium">
                  <li>• Single-variable experiments</li>
                  <li>• First–then boards</li>
                  <li>• Movement breaks</li>
                  <li>• Explicit literal deadlines</li>
                </ul>
              </div>
              <div className={`p-10 rounded-[2.5rem] border ${isDarkMode ? 'bg-zinc-900/30 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                <MessageSquare className="text-brand-accent mb-6" size={28} />
                <h4 className="font-bold mb-4 uppercase tracking-widest text-xs">Consent Scripts</h4>
                <ul className="text-sm text-stone-500 space-y-3 font-medium">
                  <li>• "Continue, slow down, or pause?"</li>
                  <li>• Explicit rule: Silence is allowed</li>
                  <li>• Normalizing the "Pass"</li>
                  <li>• Choice of interaction channel</li>
                </ul>
              </div>
           </div>
        </section>

        {/* Data & Evidence */}
        <section className="mb-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <h2 className="text-3xl font-bold mb-8">Evidence without Overwhelm</h2>
              <p className="text-lg text-stone-500 font-medium mb-10">
                Pick 2–3 simple metrics per cycle to prove safety and growth without high-stakes pressure.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Literacy", desc: "Reading probes, written/AAC response clarity." },
                  { title: "Sovereignty", desc: "Number of student-made tools or peer re-use." },
                  { title: "Dialogue", desc: "Participation frequency and respected opt-outs." },
                  { title: "Hygiene", desc: "Local storage control and anonymization." }
                ].map((metric, i) => (
                  <div key={i} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-zinc-950/50 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                    <BarChart2 size={16} className="text-brand-accent mb-2" />
                    <h4 className="font-bold text-xs uppercase tracking-widest mb-1">{metric.title}</h4>
                    <p className="text-[10px] text-stone-500 font-medium">{metric.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className={`p-12 rounded-[3.5rem] border ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-brand-light border-stone-100'}`}>
              <Lightbulb className="text-brand-accent mb-6" size={32} />
              <h3 className="text-2xl font-bold mb-6">Example Integration</h3>
              <div className="space-y-4 text-stone-500 font-medium leading-relaxed">
                <p className="text-sm">1. <strong>Bookend:</strong> Start with Arrival Regulation and shared word/drawing.</p>
                <p className="text-sm">2. <strong>Main Lesson:</strong> "Green City" project using role cards and visual checklists.</p>
                <p className="text-sm">3. <strong>Close:</strong> Reflection and log one simple metric (e.g. "Who used their own tool?").</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final Statement */}
        <section className="text-center py-20">
          <p className="text-2xl md:text-3xl font-bold italic text-stone-400 leading-relaxed max-w-3xl mx-auto">
            "Ξcho Routines + Weekly Practices + 6-Week Cycles wrap around any curriculum to ensure sovereignty and safety."
          </p>
        </section>

      </div>
    </div>
  );
};

export default TeachingPage;
