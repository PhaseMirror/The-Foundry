import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  UserPlus, 
  AlertTriangle, 
  FileCode, 
  Lock, 
  Ban, 
  Scale, 
  Mail,
  Terminal,
  Cpu,
  Workflow
} from 'lucide-react';

interface TermsAndConditionsViewProps {
  isDarkMode: boolean;
}

const TermsAndConditionsView: React.FC<TermsAndConditionsViewProps> = ({ isDarkMode }) => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div id="terms-view-container" className={`pt-24 pb-24 ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>
      <div className="container mx-auto px-8 max-w-4xl">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent block mb-6">Legal Framework</span>
          <h1 className={`text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
            Terms & <span className="italic font-normal text-stone-400">Conditions.</span>
          </h1>
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-10 font-mono">Last updated: June 11, 2026</p>
          <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-[#0b0b0d]/50 border-stone-850' : 'bg-brand-light border-stone-150'}`}>
            <p className="text-base leading-relaxed text-stone-500 font-semibold leading-relaxed">
              Welcome to Phase Mirror. These Terms govern your access to, compilation of, and usage of our CLI, MCP servers, and diagnostic rules. By initiating scans or mounting our validation endpoints, you agree to these terms.
            </p>
          </div>
        </motion.div>

        <div className="space-y-20">
          
          {/* 1. Who We Are */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className={`text-2xl font-black mb-6 flex items-center gap-4 ${isDarkMode ? 'text-stone-200' : 'text-stone-900'}`}>
              <span className="text-brand-accent font-mono text-lg">01.</span> Scope of Service
            </h2>
            <p className="text-stone-500 font-semibold text-xs md:text-sm leading-relaxed mb-4">
              Phase Mirror is a diagnostic software product designed to map architectural dissonance and verify semantic/boundary invariants across multi-agent system codebases.
            </p>
            <p className="text-stone-500 font-semibold text-xs md:text-sm leading-relaxed italic">
              All tools are stewarded and compiled by Citizen Gardens, aiming to enforce deterministic alignment checks under a local-first engineering framework.
            </p>
          </motion.section>

          {/* 2. License and Integrity */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className={`text-2xl font-black mb-6 flex items-center gap-4 ${isDarkMode ? 'text-stone-200' : 'text-stone-900'}`}>
              <span className="text-brand-accent font-mono text-lg">02.</span> Eligibility & Registration
            </h2>
            <div className={`p-8 rounded-3xl border ${isDarkMode ? 'border-stone-850 bg-[#0f0f12]/30' : 'border-stone-150 bg-stone-50'}`}>
              <ul className="space-y-4 text-xs text-stone-500 font-semibold leading-relaxed">
                <li className="flex gap-4">
                  <UserPlus size={18} className="text-brand-accent shrink-0 mt-1" />
                  <span>You must be an authorized representative of your development group to establish enterprise seat licenses.</span>
                </li>
                <li className="flex gap-4">
                  <ShieldCheck size={18} className="text-brand-accent shrink-0 mt-1" />
                  <span>Local static analysis requires pre-allocated license tokens placed in your repository configuration.</span>
                </li>
                <li className="flex gap-4">
                  <Lock size={18} className="text-brand-accent shrink-0 mt-1" />
                  <span>Your organization is solely responsible for protecting all server-side API keys and repository configs.</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* 3. Non-Relational Warning */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-4 text-red-400">
              <Terminal size={24} className="text-red-405 shrink-0" /> Local Pre-Deployment Auditing Only
            </h2>
            <div className={`p-8 rounded-3xl border ${isDarkMode ? 'border-red-900/20 bg-red-950/10' : 'border-red-100 bg-red-50/20'}`}>
              <p className="text-stone-500 font-semibold text-xs md:text-sm leading-relaxed mb-6">
                Phase Mirror operates purely as a compile-time advisory, diagnostic tool. It is not an active network monitoring service or an online anti-intrusion firewall.
              </p>
              <ul className="space-y-3 text-xs font-bold text-red-400">
                <li>• No real-time payload traffic blocking or stateful packet tracking is provided.</li>
                <li>• All outcomes represent static or stochastic model audits.</li>
                <li>• Deploying agents in mission-critical hardware requires independent, manual controls.</li>
              </ul>
            </div>
          </motion.section>

          {/* 4. Acceptable Conduct */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className={`text-2xl font-black mb-6 flex items-center gap-4 ${isDarkMode ? 'text-stone-200' : 'text-stone-900'}`}>
              <span className="text-brand-accent font-mono text-lg">04.</span> Acceptable Use Invariants
            </h2>
            <p className="text-xs text-stone-500 font-semibold mb-6 italic">To maintain systemic integrity, you agree NEVER to:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Use the CLI to generate malicious or exploit-carrying codebases.",
                "Reverse-engineer, tamper with, or brute-force our validation licenses.",
                "Inject mock or fraudulent metrics to bypass critical Tier A gates.",
                "Overload the false-positive registry with high-volume denial attacks.",
                "Export our diagnostic engine code into un-vetted, hostile model vectors."
              ].map((rule, i) => (
                <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border ${isDarkMode ? 'border-stone-850 bg-black/20' : 'border-stone-150 bg-white shadow-sm'}`}>
                  <Ban size={14} className="text-stone-400 shrink-0" />
                  <span className="text-xs font-bold text-stone-500 leading-relaxed">{rule}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* 5. IP and Stewardship */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className={`text-2xl font-black mb-6 flex items-center gap-4 ${isDarkMode ? 'text-stone-200' : 'text-stone-900'}`}>
              <span className="text-brand-accent font-mono text-lg">05.</span> Proprietary Assets & Open Source
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-base font-bold mb-3">5.1 Open & Stewarded Tools</h3>
                <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                  Our core CLI binary, open Tier A registries, and standard configuration scripts are intellectual properties stewarded open-source by Citizen Gardens. You may use, adapt, and compile them freely in compliance with standard permissive licenses.
                </p>
              </div>
              <div>
                <h3 className="text-base font-bold mb-3">5.2 Closed Enterprise Rules</h3>
                <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                  Premium Tier B semantic schemas, custom model adapters, and private enterprise compliance databases provided under contract remain the proprietary assets of Citizen Gardens or respective partner developers.
                </p>
              </div>
            </div>
          </motion.section>

          {/* 6-8 */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-mono font-bold text-brand-accent uppercase tracking-widest text-[10px]"><Lock size={12}/> Confined Data</div>
              <h3 className="text-base font-bold">06. Confidentiality</h3>
              <p className="text-xs text-stone-550 dark:text-stone-400 leading-relaxed font-semibold"> Scans are execution-isolated. We do not inspect, cache, or parse developer codebase objects on our network hosts.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-mono font-bold text-brand-accent uppercase tracking-widest text-[10px]"><Workflow size={12}/> Drifts</div>
              <h3 className="text-base font-bold">07. Custom Rules</h3>
              <p className="text-xs text-stone-550 dark:text-stone-400 leading-relaxed font-semibold">Customers creating custom rules agree to maintain continuous validation probes to prevent false-positive alert floods.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-mono font-bold text-brand-accent uppercase tracking-widest text-[10px]"><Cpu size={12}/> Mathematics</div>
              <h3 className="text-base font-bold">08. Lambda Limits</h3>
              <p className="text-xs text-[#2dd4bf] leading-relaxed font-semibold">Drifts in the Multiplicity Constant (Lambda_m) represent analytical estimations, not standard physical laws or financial warranties.</p>
            </div>
          </motion.section>

          {/* 9-11 */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className={`text-2xl font-black mb-8 ${isDarkMode ? 'text-stone-200' : 'text-stone-900'}`}>Liability Limits & Arbitration</h2>
            <div className="space-y-6">
              <div className={`p-8 rounded-3xl border ${isDarkMode ? 'border-stone-850' : 'border-stone-150 bg-stone-50'}`}>
                <div className="flex items-center gap-3 mb-4 text-stone-400">
                  <Terminal size={18} />
                  <h4 className="font-bold text-sm uppercase tracking-widest">9. Software Availability</h4>
                </div>
                <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                  The tools and registry APIs are provided \"as is\" and \"as available\" without explicit uptime guarantees. Local CI hooks run entirely at the mercy of individual host resources.
                </p>
              </div>
              <div className={`p-8 rounded-3xl border ${isDarkMode ? 'border-stone-850' : 'border-stone-150 bg-stone-50'}`}>
                <div className="flex items-center gap-3 mb-4 text-stone-400">
                  <AlertTriangle size={18} />
                  <h4 className="font-bold text-sm uppercase tracking-widest">10. No Warranty of Alignment</h4>
                </div>
                <p className="text-xs text-stone-500 font-semibold leading-relaxed uppercase">
                  Citizen Gardens makes no direct warranty that executing static checks will stop all emergent model behaviors, prevent all codebase vulnerabilities, or fulfill regulatory legal mandates automatically.
                </p>
              </div>
              <div className={`p-8 rounded-3xl border ${isDarkMode ? 'border-stone-850' : 'border-stone-150 bg-stone-50'}`}>
                <div className="flex items-center gap-3 mb-4 text-stone-400">
                  <Scale size={18} />
                  <h4 className="font-bold text-sm uppercase tracking-widest">11. Legal Redress Limits</h4>
                </div>
                <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                  All disputes are subject to binding technical arbitration. Total financial liability for any licensing dispute is strictly capped at the exact fees paid to Citizen Gardens for Phase Mirror licenses in the preceding 6 months.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section 
            variants={sectionVariants} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            className="pt-12 border-t border-stone-800/10 dark:border-stone-850/60"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <h3 className="text-lg font-bold mb-2">Technical Counsel Query</h3>
                <p className="text-xs text-stone-500 font-semibold leading-relaxed">Reach out for custom regulatory licensing structures or enterprise audit models.</p>
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-brand-accent" />
                  <span className="text-xs font-mono font-bold">compliance@phasemirror.com</span>
                </div>
              </div>
            </div>
          </motion.section>

        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsView;
