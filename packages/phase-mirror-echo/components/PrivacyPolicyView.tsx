import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Mail, 
  Phone, 
  Lock, 
  Database, 
  Trash2, 
  EyeOff, 
  FileText,
  UserCheck,
  Globe,
  Terminal,
  Activity
} from 'lucide-react';

interface PrivacyPolicyViewProps {
  isDarkMode: boolean;
}

const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ isDarkMode }) => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div id="privacy-policy-view-container" className={`pt-24 pb-24 ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>
      <div className="container mx-auto px-8 max-w-4xl">
        
        {/* Policy Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent block mb-6">Legal Framework</span>
          <h1 className={`text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
            Privacy <span className="italic font-normal text-stone-400">Policy.</span>
          </h1>
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-10 font-mono">Last updated: June 11, 2026</p>
          <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-[#0b0b0d]/50 border-stone-850' : 'bg-brand-light border-stone-150'}`}>
            <p className="text-lg leading-relaxed text-stone-500 font-semibold italic">
              "Phase Mirror does not harvest your secrets or index your codebases. This policy defines how we safeguard your source confidentiality, local telemetry, and credentials."
            </p>
          </div>
        </motion.div>

        <div className="space-y-24">
          
          {/* 1. Who We Are */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-black mb-8 flex items-center gap-4">
              <span className="text-brand-accent font-mono text-lg">01.</span> Operational Entities
            </h2>
            <div className="space-y-6 text-stone-500 font-semibold text-sm leading-relaxed">
              <p>Phase Mirror is a diagnostic software product stewarded by Citizen Gardens, an applied engineering and technology research studio.</p>
              <p>We work exclusively under a zero-telemetry, local-analysis paradigm to verify the soundness and safety of autonomous agent workflows.</p>
              <div className="flex flex-col sm:flex-row gap-6 mt-8">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-brand-accent" />
                  <span className="text-xs font-mono font-bold">compliance@phasemirror.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Terminal size={16} className="text-brand-accent" />
                  <span className="text-xs font-mono font-bold">github.com/citizen-gardens</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* 2. Core Commitments */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-black mb-8 flex items-center gap-4">
              <span className="text-brand-accent font-mono text-lg">02.</span> Privacy of Invariants
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <EyeOff size={20}/>, title: "Zero Data-Harvesting", text: "We do not transmit, cache, or process client source code on our network servers." },
                { icon: <Database size={20}/>, title: "Local Computations", text: "Static code audits and compliance analysis operate purely within your local environment." },
                { icon: <Trash2 size={20}/>, title: "No Telemetry", text: "No diagnostic tracing or aggregated performance trackers are injected in your CLI." }
              ].map((item, i) => (
                <div key={i} className={`p-6 rounded-2xl border ${isDarkMode ? 'border-stone-850' : 'border-stone-150 bg-white shadow-sm'}`}>
                  <div className="text-white/40 p-2 border border-stone-800 rounded-lg w-fit mb-4 bg-zinc-950">{item.icon}</div>
                  <h4 className="font-extrabold text-sm mb-2">{item.title}</h4>
                  <p className="text-xs text-stone-500 font-semibold leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* 3. What We Collect */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-black mb-8 flex items-center gap-4">
              <span className="text-brand-accent font-mono text-lg">03.</span> Telemetry Limits
            </h2>
            <div className="space-y-12">
              <div>
                <h3 className="text-lg font-bold mb-4">3.1 Direct Operational Data</h3>
                <ul className="space-y-4 text-stone-500 font-semibold text-xs leading-relaxed">
                  <li>• <strong className={isDarkMode ? 'text-white' : 'text-stone-800'}>License Tokens & Accounts:</strong> Customer representative names, billing email addresses, and encrypted verification credentials.</li>
                  <li>• <strong className={isDarkMode ? 'text-white' : 'text-stone-800'}>CLI Metrics:</strong> Run logs, execution durations, and error reports exported willingly by developers during support cases.</li>
                  <li>• <strong className={isDarkMode ? 'text-white' : 'text-stone-800'}>Communications:</strong> Feature queries, dispute logs in the false-positive registry, or email threads.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">3.2 Local Telemetry Logs</h3>
                <p className="text-xs text-stone-500 mb-4 leading-relaxed font-semibold">To debug runtime CLI glitches locally, Phase Mirror dumps temporary trace records on your workstation. This file is local-only:</p>
                <ul className="space-y-3 text-stone-500 font-semibold text-xs leading-relaxed">
                  <li>• Node.js version, platform OS types, and dependency checksum tables.</li>
                  <li>• Scan frequencies and active constraint identifiers.</li>
                  <li>• Match results and compile outcomes.</li>
                </ul>
                <p className="mt-6 text-xs font-mono font-bold text-brand-accent uppercase tracking-widest bg-brand-accent/5 p-3 rounded-xl border border-brand-accent/10">No repository contents are uploaded. Phase Mirror contains no search trackers or ad platforms.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                  <Activity size={18} className="text-brand-accent" />
                  3.3 Invariants Tracking & API Rules
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed font-semibold">Your custom policy rules stay compiled on your local systems. When executing checks, we do not require network access to a central server unless you optionally opt-in to fetch the updated global Tier A rules registry.</p>
              </div>
            </div>
          </motion.section>

          {/* 4. How We Use Information */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-black mb-8 flex items-center gap-4">
              <span className="text-brand-accent font-mono text-lg">04.</span> Usage of Advisory Traces
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-stone-500 leading-relaxed">
              <li className={`p-4 rounded-xl border ${isDarkMode ? 'border-stone-850' : 'bg-stone-50 border-stone-150'}`}>• Verifying developer seat licenses</li>
              <li className={`p-4 rounded-xl border ${isDarkMode ? 'border-stone-850' : 'bg-stone-50 border-stone-150'}`}>• Compiling regional compliance schemas</li>
              <li className={`p-4 rounded-xl border ${isDarkMode ? 'border-stone-850' : 'bg-stone-50 border-stone-150'}`}>• Resolving rule execution errors</li>
              <li className={`p-4 rounded-xl border ${isDarkMode ? 'border-stone-850' : 'bg-stone-50 border-stone-150'}`}>• Transmitting critical security advisories</li>
            </ul>
            <p className="mt-8 text-xs font-bold text-red-400">We do not monetize your security data. Your code diagnostics remain 100% confidential and owned by your organization.</p>
          </motion.section>

          {/* 5. Storage Modes */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-black mb-8 flex items-center gap-4">
              <span className="text-brand-accent font-mono text-lg">05.</span> Telemetry Lifecycle
            </h2>
            <div className="space-y-4">
              {[
                { title: "Air-Gapped Sandbox Runs", desc: "No execution data persists outside your local container environment." },
                { title: "Ephemeral Registry Storage", desc: "Disputed False-Positive matches uploaded to the registry are retained for 30 days then scrubbed." },
                { title: "Local-First Storage", desc: "Configuration databases and run logs reside entirely inside your repository `.git/phase-mirror` folder." }
              ].map((mode, i) => (
                <div key={i} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0f0f12]/40 border-stone-850' : 'bg-white border-stone-150 shadow-sm'}`}>
                  <h4 className="font-extrabold text-sm mb-1">{mode.title}</h4>
                  <p className="text-xs text-stone-500 font-semibold leading-relaxed">{mode.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* 6. Legal & Government Queries */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-black mb-8 flex items-center gap-4">
              <span className="text-brand-accent font-mono text-lg">06.</span> Legal Boundaries
            </h2>
            <div className="space-y-6 text-xs text-stone-500 font-semibold leading-relaxed">
              <p>Since we do not compile or cache your codebases or secrets onto our network databases, we are mathematically incapable of providing customer code repositories to third parties or state regulators.</p>
              <p>We believe in absolute source confidentiality. For more complex, enterprise-managed cloud validation nodes, all database objects are protected using tenant-isolated hardware encryption chips (KMS) with keys held exclusively by the customer.</p>
            </div>
          </motion.section>

          {/* 7-9. Rights, Security, Transfers */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                <UserCheck size={18} className="text-brand-accent" />
                7. Audit Access
              </h3>
              <p className="text-xs text-stone-500 font-semibold leading-relaxed">You hold full visibility of all tracing parameters. You can export, flush, or edit your local registries instantly.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                <Lock size={18} className="text-brand-accent" />
                8. Encryption Specs
              </h3>
              <p className="text-xs text-stone-500 font-semibold leading-relaxed">License validations utilize TLS 1.3 encryption. Internal data objects utilize AES-256 standard encryption keys.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                <Globe size={18} className="text-brand-accent" />
                9. Global Scope
              </h3>
              <p className="text-xs text-stone-500 font-semibold leading-relaxed">We operate in full compliance with ISO 27001 architectures and GDPR sovereignty laws, ensuring strict regional confinement of service data.</p>
            </div>
          </motion.section>

          {/* 10. Research and Stewardship */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-black mb-8 flex items-center gap-4">
              <span className="text-brand-accent font-mono text-lg">10.</span> Ethical Research Invariants
            </h2>
            <div className="p-8 rounded-[3rem] border border-brand-accent/20 space-y-6 bg-brand-accent/[0.02]">
              <p className="text-xs text-stone-500 font-semibold leading-relaxed">Citizen Gardens coordinates theoretical computer science and systems ethics research. All empirical research published utilizes wholly anonymized, synthetically generated mock traces to model Lambda_m parameters.</p>
              <p className="text-xs text-stone-400 italic">"Our diagnostics are built to protect cognitive dignity and model systems integrity in standard corporate workflows."</p>
            </div>
          </motion.section>

          {/* 11. Policy Updates */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="pb-12"
          >
            <h2 className="text-2xl font-black mb-8 flex items-center gap-4">
              <span className="text-brand-accent font-mono text-lg">11.</span> Procedural Changes
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed font-semibold mb-6">We revise this policy only as necessary to accommodate newer cryptographic standards or protocol upgrades. Major changes require a 30-day git notification period.</p>
            <div className="mt-16 pt-8 border-t border-stone-800/10 dark:border-stone-850/60">
               <p className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest text-center">
                 PHASE MIRROR — SYSTEM PRIVACY ENFORCEMENT PROTOCOL
               </p>
            </div>
          </motion.section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyView;
