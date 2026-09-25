import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  Terminal, 
  HelpCircle, 
  ShieldAlert, 
  Notebook, 
  Cpu, 
  Scale, 
  Info,
  Shield
} from 'lucide-react';

interface DisclaimerViewProps {
  isDarkMode: boolean;
}

const DisclaimerView: React.FC<DisclaimerViewProps> = ({ isDarkMode }) => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div id="disclaimer-view-wrapper" className={`pt-24 pb-24 ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>
      <div className="container mx-auto px-8 max-w-4xl">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent block mb-6">Legal Framework</span>
          <h1 className={`text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
            System <span className="italic font-normal text-stone-400">Disclaimer.</span>
          </h1>
          <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-red-950/10 border-red-900/20' : 'bg-red-50/20 border-red-100/50'}`}>
            <p className="text-base leading-relaxed text-stone-550 dark:text-stone-400 font-semibold flex gap-4">
              <AlertCircle className="text-red-400 shrink-0 mt-1" size={24} />
              <span>
                Phase Mirror is an engineering diagnostic tool and advisory verification system, not a financial, corporate-liability description, or legal compliance shield.
              </span>
            </p>
          </div>
        </motion.div>

        <div className="space-y-20">
          
          {/* Engineering Advisory Disclaimer */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-start gap-6">
              <div className={`p-3 rounded-2xl flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-[#0f0f12] border border-stone-850 text-brand-accent' : 'bg-stone-50 border border-stone-150 text-brand-accent'}`}>
                <Cpu size={24} />
              </div>
              <div>
                <h2 className={`text-2xl font-black mb-6 ${isDarkMode ? 'text-stone-200' : 'text-stone-900'}`}>No System Out-of-Box Absolutes</h2>
                <div className="space-y-6 text-stone-500 font-semibold text-sm leading-relaxed">
                  <p>
                    The Phase Mirror CLI, rules registry registries, and model boundaries provide structural audit capabilities based on inputs provided by the user. They do not constitute an active, absolute proof of complete platform safety or ironclad resistance to cyber-intrusions.
                  </p>
                  <p>
                    All diagnostic reports, alerts, and calculated parameters (including the Multiplicity Constant <strong className="text-brand-accent">λ_m</strong>) are for <strong className={isDarkMode ? 'text-stone-200' : 'text-stone-900'}>informational, engineering, and educational use</strong>. They are not a replacement for comprehensive, manual, professional penetration testing, hardware security audits, or formal corporate risk assessments.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Absolute Fail-Closed Actions */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-[#0c0c0e]/50 border-stone-850' : 'bg-stone-900 text-stone-100 border-stone-800'}`}>
              <div className="flex items-center gap-4 mb-8 text-red-400">
                <Terminal size={28} />
                <h2 className="text-2xl font-black tracking-tight">Active Invariant Interventions</h2>
              </div>
              <p className="text-base leading-relaxed mb-8 opacity-80">
                Phase Mirror's CI/CD hook integrations are designed to deliberately fail-closed, blocking builds and stopping deployment systems when severe policy contradictions (dissonances) are discovered.
              </p>
              <div className={`p-6 rounded-2xl border border-white/10 ${isDarkMode ? 'bg-black/30' : 'bg-white/5'}`}>
                <p className="text-xs font-mono font-bold uppercase tracking-widest text-center text-red-400">
                  Citizen Gardens and Phase Mirror are not liable for operational downtime, delivery delays, or server lockouts resulting from automated fail-closed security actions.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Independent Verification */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className={`text-2xl font-black tracking-tight mb-6 ${isDarkMode ? 'text-stone-200' : 'text-stone-900'}`}>Seek Professional Security Guidance</h2>
                <p className="text-stone-500 font-semibold text-xs md:text-sm leading-relaxed mb-6">
                  You must always seek independent validation from certified cybersecurity firms, regulatory counsel, and systems auditors when assessing mission-critical systems, health services, financial transaction channels, or military components.
                </p>
                <p className="text-stone-500 font-semibold text-xs md:text-sm leading-relaxed italic">
                  Never deploy unmonitored autonomous models into consumer-facing environments without manual redundancy controls, regardless of the score or 'alignment proofs' exported by Phase Mirror.
                </p>
              </div>
              <div className={`aspect-square rounded-[3rem] flex items-center justify-center p-12 ${isDarkMode ? 'bg-[#0b0b0c] border border-stone-850' : 'bg-brand-light border border-stone-150'}`}>
                <Info size={48} className="text-brand-accent opacity-30" />
              </div>
            </div>
          </motion.section>

          {/* Stochastic Calculations */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-start gap-6">
              <div className={`p-3 rounded-2xl flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-[#0f0f12] border border-stone-850 text-brand-accent' : 'bg-stone-50 border border-stone-150 text-brand-accent'}`}>
                <AlertCircle size={24} />
              </div>
              <div>
                <h2 className={`text-2xl font-black mb-6 ${isDarkMode ? 'text-stone-200' : 'text-stone-900'}`}>Stochastic Modeling & "UNPROVEN" Rules</h2>
                <div className="space-y-6 text-stone-500 font-semibold text-sm leading-relaxed">
                  <p>
                    Rules residing in custom schemas or under testing flags are labeled as <strong className="text-brand-accent">“UNPROVEN”</strong>.
                  </p>
                  <p>
                    These rules operate on stochastic, empirical patterns. They require deliberate engineering observation and should not be used as the exclusive logic for locking real-time, physical control structures, air-gapped network nodes, or financial transfer layers.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* User Liability */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className={`p-10 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#0b0b0d]/50 border-stone-850' : 'bg-white border-stone-150 shadow-sm'}`}>
              <div className="flex items-center gap-4 mb-6">
                <Scale className="text-brand-accent" size={24} />
                <h2 className={`text-2xl font-black mb-1 ${isDarkMode ? 'text-stone-200' : 'text-stone-900'}`}>User Risk & Liability</h2>
              </div>
              <p className="text-stone-500 font-semibold text-sm leading-relaxed mb-6">
                By integrating Phase Mirror cli, scripts, or rules, you acknowledge and agree that your development organization bears the ultimate risk of model execution, code security, and architectural alignment.
              </p>
              <div className="pt-6 border-t border-stone-800/10 dark:border-stone-850/60 flex items-center gap-3">
                <ShieldAlert className="text-stone-400 shrink-0" size={18} />
                <p className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-widest leading-relaxed">
                  Phase Mirror is not liable for indirect, incidental, or systemic damages resulting from agent operation or alignment failures.
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
            <motion.div
              id="disclaimer-shield-wrapper"
              whileHover={{ scale: 1.15, rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="inline-block cursor-pointer mb-6"
            >
              <Shield 
                id="disclaimer-closing-shield-icon"
                className="text-[#2dd4bf] mx-auto drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" 
                size={36} 
              />
            </motion.div>
            <p id="disclaimer-closing-motto" className="text-xs font-bold text-stone-400 uppercase tracking-[0.4em]">
              Sovereignty • Safety • Rhythm
            </p>
          </motion.section>

        </div>
      </div>
    </div>
  );
};

export default DisclaimerView;
