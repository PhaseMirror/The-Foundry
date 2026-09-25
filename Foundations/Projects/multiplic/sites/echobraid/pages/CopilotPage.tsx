
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  ShieldCheck, 
  EyeOff, 
  Activity, 
  MessageSquare, 
  Zap, 
  PauseCircle, 
  Eraser, 
  Heart,
  Ban,
  Layers,
  Sparkles
} from 'lucide-react';

interface CopilotPageProps {
  isDarkMode: boolean;
}

const CopilotPage: React.FC<CopilotPageProps> = ({ isDarkMode }) => {
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
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mb-32"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent block mb-6">AI Architecture</span>
          <h1 className={`text-4xl md:text-6xl font-bold mb-10 leading-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            The ΞchoBraid <span className="italic font-medium text-stone-400">AI Copilot.</span>
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed text-stone-500 font-medium max-w-3xl">
            A trauma‑aware, neurodivergent‑aligned assistant that lives inside the environment to support reflection, planning, and gentle scaffolding.
          </p>
        </motion.div>

        {/* What it is for */}
        <section className="mb-40">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-3xl font-bold">What it is for</h2>
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
                icon: <MessageSquare className="text-brand-accent" />,
                title: "Clearer Language",
                desc: "Helping rephrase goals, scripts, and routines in clearer, kinder language for families and educators."
              },
              {
                icon: <Sparkles className="text-brand-accent" />,
                title: "Gentle Reflection",
                desc: "Offering reflection prompts in Soft Loop or HoloScriptor without pushing for disclosure or speed."
              },
              {
                icon: <Zap className="text-brand-accent" />,
                title: "Small Next Steps",
                desc: "Suggesting small tweaks inside the curriculum, like adjusting an Ξcho Routine or ToolBuild artifact."
              }
            ].map((item, i) => (
              <motion.div key={i} variants={itemVariants} className={`p-10 rounded-[2.5rem] border ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                <div className="mb-6">{item.icon}</div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-stone-500 leading-relaxed font-medium text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="mt-20 flex items-center justify-center min-h-[120px]">
            <p className="text-center text-stone-400 font-bold uppercase tracking-[0.3em] text-[17px] italic max-w-xl leading-relaxed">
              "Designed to stabilize and clarify, not to judge, score, or maximize engagement."
            </p>
          </div>
        </section>

        {/* How it works under the hood */}
        <section className="mb-40">
          <div className="flex flex-col lg:flex-row gap-20 items-start">
            <div className="lg:w-1/3 sticky top-32">
              <h2 className="text-3xl font-bold mb-8">How it works</h2>
              <p className="text-lg text-stone-500 font-medium leading-relaxed">
                The Copilot wraps a language model in three additional layers to ensure cognitive sovereignty and anticipatory silence.
              </p>
              <div className="mt-12 flex justify-center lg:justify-start">
                <div className={`p-8 rounded-[3rem] border ${isDarkMode ? 'bg-zinc-900/20' : 'bg-brand-light'}`}>
                  <Layers size={48} className="text-brand-accent opacity-20" />
                </div>
              </div>
            </div>

            <div className="lg:w-2/3 space-y-12">
              {[
                {
                  title: "Semantic Entropy Engine",
                  desc: "Continuously estimates when conversation is drifting toward instability or distress using linguistic, tonal, and behavioral signals."
                },
                {
                  title: "12 Harm‑Prevention Layer",
                  desc: "An ethical firewall that can blacklist harmful phrases, insert consent checks, and trigger protective silence instead of pushing forward."
                },
                {
                  title: "Forecast Entropy Gradient",
                  desc: "Anticipates drift before it crashes, offering options like 'pause,' 'slow down,' or 'continue' when the system predicts rising strain."
                }
              ].map((layer, i) => (
                <div key={i} className={`p-8 md:p-12 rounded-[3.5rem] border ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                  <span className="text-[10px] font-bold text-brand-accent uppercase tracking-[0.4em] block mb-4">Layer 0{i+1}</span>
                  <h3 className="text-2xl font-bold mb-4">{layer.title}</h3>
                  <p className="text-stone-500 leading-relaxed font-medium">{layer.desc}</p>
                </div>
              ))}
              <div className={`p-8 rounded-[2rem] border border-dashed ${isDarkMode ? 'border-stone-800' : 'border-stone-200'}`}>
                <p className="text-xs text-stone-400 font-medium leading-relaxed">
                  All of this is governed by the <strong className={isDarkMode ? 'text-stone-100' : 'text-stone-800'}>Conscious Sovereignty Layer (CSL)</strong> and the <strong className={isDarkMode ? 'text-stone-100' : 'text-stone-800'}>"Silence Anticipation Principle,"</strong> which formalize non‑coercive stillness as a first‑class behavior.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy, memory, and control */}
        <section className="mb-40">
          <div className={`p-12 md:p-20 rounded-[4rem] relative overflow-hidden ${isDarkMode ? 'bg-stone-900/40 border border-stone-800' : 'bg-stone-900 text-stone-100 border-stone-800'}`}>
            <div className="max-w-3xl relative z-10">
              <ShieldCheck className="text-brand-accent mb-8" size={32} />
              <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-stone-100'}`}>Privacy, Memory, and Control</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <EyeOff size={20} className="text-brand-accent mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold mb-2">Data-Minimal Design</h4>
                      <p className="text-sm text-stone-400 leading-relaxed font-medium">"Nothing saved" is the default. 24-hour erase, local-only, and export modes are clearly labeled.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Eraser size={20} className="text-brand-accent mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold mb-2">Ethical Memory</h4>
                      <p className="text-sm text-stone-400 leading-relaxed font-medium">User-controlled memory is an ethical requirement. Delete sensitive sessions instantly.</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <Activity size={20} className="text-brand-accent mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold mb-2">Opt-in Sensors</h4>
                      <p className="text-sm text-stone-400 leading-relaxed font-medium">Any optional sensor streams (e.g., HRV) are strictly opt‑in and revocable at any time.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <PauseCircle size={20} className="text-brand-accent mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold mb-2">12.3 Proactive Pause</h4>
                      <p className="text-sm text-stone-400 leading-relaxed font-medium">The system anticipates drift and invites you to slow down before you feel overwhelmed.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What the Copilot is not */}
        <section className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-4 mb-8">
              <Ban className="text-red-400" size={24} />
              <h2 className="text-3xl font-bold">What the Copilot is not</h2>
            </div>
            <ul className="space-y-6">
              <li className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-zinc-950/50 border-stone-800' : 'bg-stone-50 border-stone-100 shadow-sm'}`}>
                <p className="text-sm text-stone-500 font-medium leading-relaxed">
                  It is <strong className={isDarkMode ? 'text-white' : 'text-stone-900'}>not a therapist, clinician, or emergency service</strong>, and it is not designed to diagnose or treat any condition.
                </p>
              </li>
              <li className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-zinc-950/50 border-stone-800' : 'bg-stone-50 border-stone-100 shadow-sm'}`}>
                <p className="text-sm text-stone-500 font-medium leading-relaxed">
                  Experimental features are never intended as the sole basis for high-stakes <strong className={isDarkMode ? 'text-white' : 'text-stone-900'}>disciplinary, diagnostic, or placement decisions</strong>.
                </p>
              </li>
            </ul>
          </div>
          <div className="text-center">
            <Heart size={48} className="text-brand-accent mx-auto mb-8 opacity-20" />
            <p className="text-xl text-stone-500 leading-relaxed font-medium italic">
              "ΞchoBraid’s AI Copilot is, by construction, a cautious co‑processor: it would rather slow down, go quiet, or hand control back to the human than override a user’s pace or sovereignty."
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default CopilotPage;
