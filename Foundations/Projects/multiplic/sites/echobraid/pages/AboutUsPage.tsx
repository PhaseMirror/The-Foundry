
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Sparkles, 
  Users, 
  Home, 
  Brain, 
  ShieldCheck, 
  Sun,
  HandHelping,
  Library
} from 'lucide-react';

interface AboutUsPageProps {
  isDarkMode: boolean;
}

const AboutUsPage: React.FC<AboutUsPageProps> = ({ isDarkMode }) => {
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
        
        {/* Story Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mb-32"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent block mb-6">Our Story</span>
          <h1 className={`text-4xl md:text-6xl font-bold mb-10 leading-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Born from the <span className="italic font-medium text-stone-400">gap between brilliance and exhaustion.</span>
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed text-stone-500 font-medium max-w-3xl">
            We know what it feels like to be told we’re “so smart” and still come home exhausted, ashamed, and sure we’re somehow doing school wrong.
          </p>
        </motion.div>

        {/* The Why */}
        <section className="mb-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-3xl font-bold mb-8">The fluorescent classrooms felt too loud.</h2>
              <div className="space-y-6 text-lg leading-relaxed text-stone-500 font-medium">
                <p>
                  Many of us here are late-identified or openly neurodivergent. We’ve masked, burned out, and learned to translate ourselves into “acceptable” versions just to get through a day of learning that was never built with our nervous systems in mind.
                </p>
                <p>
                  Traditional education rewarded compliance and speed; our minds needed <strong>rhythm</strong>, space, and predictable patterns.
                </p>
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { icon: <ShieldCheck className="text-brand-accent" />, title: "Consent First", desc: "Regulation and safety are non-negotiables, not extras." },
                { icon: <Brain className="text-brand-accent" />, title: "Brain Learning", desc: "Revisiting core skills with depth instead of rushing past." },
                { icon: <Sun className="text-brand-accent" />, title: "Low-Stimulus", desc: "Built around quiet routines and calm, focused design." },
                { icon: <HandHelping className="text-brand-accent" />, title: "Valid Patterns", desc: "Needing more time or silence is never a failure mode." }
              ].map((item, i) => (
                <div key={i} className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900/40 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                  <div className="mb-4">{item.icon}</div>
                  <h4 className="font-bold text-sm uppercase tracking-widest mb-2">{item.title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Parents Section */}
        <section className="mb-40">
          <div className={`p-12 md:p-20 rounded-[4rem] relative overflow-hidden ${isDarkMode ? 'bg-zinc-900/40 border border-stone-800' : 'bg-brand-light border border-stone-100'}`}>
            <div className="max-w-3xl relative z-10">
              <Home className="text-brand-accent mb-8" size={32} />
              <h2 className="text-3xl font-bold mb-8">For Parents and Caregivers</h2>
              <p className="text-xl text-stone-500 leading-relaxed font-medium mb-12">
                Parenting a neurodivergent child inside systems that don’t fully see them is its own kind of double work. You’re translating between your child’s inner world and schools that often measure them by compliance rather than curiosity.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  { title: "To Feel Confident", desc: "Walking into learning spaces knowing what to expect, with tools that fit." },
                  { title: "To Feel Connected", desc: "Structured, consent-based ways to participate without being forced past limits." },
                  { title: "To Feel Valued", desc: "Treated as a whole person, not a problem to fix, with interests taken seriously." }
                ].map((item, i) => (
                  <div key={i}>
                    <h4 className="font-bold text-lg mb-4">{item.title}</h4>
                    <p className="text-sm text-stone-500 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final Statement */}
        <section className="text-center max-w-3xl mx-auto mb-40">
          <Heart className="text-brand-accent mx-auto mb-8" size={32} />
          <h2 className="text-3xl font-bold mb-8">You are exactly who we are building for.</h2>
          <p className="text-xl text-stone-500 leading-relaxed font-medium italic">
            "Our hope is that you feel less alone, less in 'advocate mode' all the time, and more like you finally have a learning space that is on your side."
          </p>
        </section>

        {/* Stewardship Section */}
        <section className={`pt-24 border-t ${isDarkMode ? 'border-stone-800' : 'border-stone-100'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${isDarkMode ? 'bg-zinc-900 text-brand-accent' : 'bg-stone-50 text-brand-accent'}`}>
                <Library size={28} />
              </div>
              <h2 className="text-2xl font-bold mb-6">Stewardship & Open Frameworks</h2>
              <p className={`text-xs font-bold uppercase tracking-[0.3em] ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                Citizen Gardens
              </p>
            </div>
            <div className="lg:col-span-2 space-y-12">
              <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-zinc-900/30 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                <p className="text-lg leading-relaxed text-stone-500 font-medium mb-8">
                  ΞchoBraid is stewarded by <strong className={isDarkMode ? 'text-stone-100' : 'text-stone-800'}>Citizen Gardens</strong>, a small literary charity and research studio dedicated to building sovereignty‑centered, neurodivergent‑affirming learning frameworks. Citizen Gardens develops and maintains the ΞchoBraid philosophy, curriculum, and safety architecture as open, evolving frameworks rather than a closed brand, so that families, educators, and communities can adapt them freely to local needs.
                </p>
                <p className="text-lg leading-relaxed text-stone-500 font-medium">
                  Rooted in Multiplicity Theory and trauma‑aware design, Citizen Gardens treats ΞchoBraid as both a practical curriculum product and a living definition of what sovereignty‑honoring education can look like in schools, pods, and community or justice‑linked settings. Through ΞchoBraid, Citizen Gardens works to make rigorous math, ethics, and AI safety research tangible in everyday classrooms and gardens—always with cognitive dignity, consent, and learner agency as the first constraints.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AboutUsPage;
