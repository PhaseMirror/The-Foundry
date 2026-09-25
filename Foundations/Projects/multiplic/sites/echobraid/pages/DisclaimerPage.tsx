
import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  Stethoscope, 
  PhoneCall, 
  FlaskConical, 
  UserCheck, 
  Scale, 
  Info,
  ShieldAlert
} from 'lucide-react';

interface DisclaimerPageProps {
  isDarkMode: boolean;
}

const DisclaimerPage: React.FC<DisclaimerPageProps> = ({ isDarkMode }) => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`pt-16 pb-24 ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>
      <div className="container mx-auto px-8 max-w-4xl">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent block mb-6">Legal Framework</span>
          <h1 className={`text-4xl md:text-6xl font-bold mb-8 leading-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Legal <span className="italic font-medium text-stone-400">Disclaimer.</span>
          </h1>
          <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-red-950/10 border-red-900/20' : 'bg-red-50/30 border-red-100'}`}>
            <p className="text-lg leading-relaxed text-stone-500 font-medium flex gap-4">
              <AlertCircle className="text-red-400 shrink-0 mt-1" size={24} />
              <span>
                ΞchoBraid is an educational and support platform, not a medical or emergency service.
              </span>
            </p>
          </div>
        </motion.div>

        <div className="space-y-20">
          
          {/* Medical Disclaimer */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-start gap-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-zinc-900 text-brand-accent' : 'bg-stone-50 text-brand-accent'}`}>
                <Stethoscope size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-6">Not Medical Advice</h2>
                <div className="space-y-6 text-stone-500 font-medium leading-relaxed">
                  <p>
                    ΞchoBraid is designed to provide neurodivergent‑affirming learning tools, routines, and reflections, but it does not diagnose, treat, or prevent any medical, psychiatric, or psychological condition.
                  </p>
                  <p>
                    Any content, suggestions, or signals shown (including prompts, reflections, or optional dashboards) are for <strong className={isDarkMode ? 'text-white' : 'text-stone-900'}>informational and educational purposes only</strong>. They are not a substitute for professional advice from qualified clinicians.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Emergency Protocols */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-zinc-950/40 border-stone-800' : 'bg-stone-900 text-stone-100 border-stone-800'}`}>
              <div className="flex items-center gap-4 mb-8 text-red-400">
                <PhoneCall size={28} />
                <h2 className="text-2xl font-bold">Emergency Situations</h2>
              </div>
              <p className="text-lg leading-relaxed mb-8 opacity-80">
                If you believe you or someone else may be at risk of harm, in crisis, or experiencing an emergency, call your local emergency number or crisis hotline immediately.
              </p>
              <div className={`p-6 rounded-2xl border border-white/10 ${isDarkMode ? 'bg-zinc-900' : 'bg-white/5'}`}>
                <p className="text-sm font-bold uppercase tracking-widest text-center">
                  Do not rely on ΞchoBraid for emergency support, crisis intervention, or life‑safety decisions.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Professional Help */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-6">Seek Professional Guidance</h2>
                <p className="text-stone-500 font-medium leading-relaxed mb-6">
                  Always seek the advice of a physician, psychologist, or other qualified provider with any questions you may have regarding a medical or mental‑health condition.
                </p>
                <p className="text-stone-500 font-medium leading-relaxed italic">
                  Never disregard professional advice or delay seeking it because of something you read, see, or do inside ΞchoBraid.
                </p>
              </div>
              <div className={`aspect-square rounded-[3rem] flex items-center justify-center p-12 ${isDarkMode ? 'bg-zinc-900/20' : 'bg-brand-light border border-stone-100'}`}>
                <Info size={48} className="text-brand-accent opacity-30" />
              </div>
            </div>
          </motion.section>

          {/* Unproven Features */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-start gap-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-zinc-900 text-brand-accent' : 'bg-stone-50 text-brand-accent'}`}>
                <FlaskConical size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-6">Experimental & "UNPROVEN" Features</h2>
                <div className="space-y-6 text-stone-500 font-medium leading-relaxed">
                  <p>
                    ΞchoBraid includes experimental and clearly labeled <strong className="text-brand-accent">“UNPROVEN”</strong> features (such as coherence dashboards).
                  </p>
                  <p>
                    These are intended for cautious, supervised use only and must not be used as the sole basis for high‑stakes decisions about a learner, such as clinical diagnosis, discipline, or placement.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* User Responsibility */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className={`p-10 rounded-[2.5rem] border ${isDarkMode ? 'bg-zinc-900/30 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
              <div className="flex items-center gap-4 mb-6">
                <UserCheck className="text-brand-accent" size={24} />
                <h2 className="text-2xl font-bold">User Responsibility</h2>
              </div>
              <p className="text-stone-500 font-medium leading-relaxed mb-6">
                By using ΞchoBraid, you agree that you are responsible for how you apply any information or tools from the software.
              </p>
              <div className="pt-6 border-t border-stone-100 dark:border-stone-800 flex items-center gap-3">
                <Scale className="text-stone-400" size={18} />
                <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">
                  ΞchoBraid is not liable for decisions you make based on your use of the platform.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Final Statement */}
          <motion.section 
            variants={sectionVariants} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            className="text-center py-12"
          >
            <ShieldAlert className="text-brand-accent mx-auto mb-6 opacity-30" size={32} />
            <p className="text-xs font-bold text-stone-400 uppercase tracking-[0.4em]">
              Sovereignty • Safety • Rhythm
            </p>
          </motion.section>

        </div>
      </div>
    </div>
  );
};

export default DisclaimerPage;
