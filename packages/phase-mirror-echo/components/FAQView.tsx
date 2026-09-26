import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  ChevronDown, 
  Info, 
  Users, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Database, 
  Monitor, 
  CreditCard,
  MessageCircle,
  Terminal,
  Scale,
  Activity,
  Workflow
} from 'lucide-react';

interface FAQViewProps {
  isDarkMode: boolean;
}

const FAQView: React.FC<FAQViewProps> = ({ isDarkMode }) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const faqs = [
    {
      question: "What is Phase Mirror?",
      answer: "Phase Mirror is a high-integrity diagnostic paradigm and compilation checker for AI governance. By utilizing git-integrated tests, an MCP server, and a developer-first CLI, Phase Mirror helps engineering teams trace, audit, and mathematically constrain autonomous agent behaviors so that they align with operational policies and system boundaries.",
      icon: <Info size={20} />
    },
    {
      question: "Who is Phase Mirror designed for?",
      answer: "It is built for platform engineers, AI safety researchers, security teams, and CTOs who are deploying complex multi-agent systems and require absolute deterministic proof that their AI agents cannot act outside of authorized bounds or create system-level contradictions.",
      icon: <Users size={20} />
    },
    {
      question: "How does Phase Mirror differ from traditional runtime firewalls?",
      answer: "Traditional security tools look at requests retrospectively at run time. Phase Mirror enforces 'Governance-as-Compilation.' It maps systemic 'dissonance'—contradictions between an AI's stated instructions and actual system configurations—prior to deployment. Build failures are used intentionally as necessary safety brakes.",
      icon: <Zap size={20} />
    },
    {
      question: "What is the 5-step Mechanical Loop?",
      answer: "Phase Mirror structures system-governance into five precise, repeating steps: 1. Mirror (Reflecting exact codes/claims), 2. Dissonance (Identifying structural contradictions), 3. Phase (Converting tensions into clear Owner/Metric/Horizon/Artifact levers), 4. Action (Executing corrective changes), and 5. Recalibration (Verifying math benchmarks).",
      icon: <Clock size={20} />
    },
    {
      question: "What is the Multiplicity Constant (Λ_m)?",
      answer: "The Multiplicity Constant (Λ_m) is a mathematical coefficient designed by Citizen Gardens that gauges the stability and feedback bounds of multi-agent execution graphs. If Λ_m drifts beyond safe parameters, the agent cycles are flagged as unstable, preventing cascading recursive loop failures.",
      icon: <Activity size={20} />
    },
    {
      question: "Tell me about the Phase Mirror Oracle CLI (@mirror-dissonance/cli).",
      answer: "The CLI is the operational engine that translates your governance policy files into concrete check constraints. It hooks cleanly into your git configuration and standard CI/CD runners, generating tamper-proof evidence artifacts on every successful compile.",
      icon: <Terminal size={20} />
    },
    {
      question: "How does the Model Context Protocol (MCP) server fit in?",
      answer: "Our MCP server integrates the Oracle directly into your LLM developer environments, providing real-time, context-aware instructions to models as they generate code. This forces coding models to write compliant files from the very first stroke.",
      icon: <Monitor size={20} />
    },
    {
      question: "Does Phase Mirror send my proprietary code or API keys to the cloud?",
      answer: "Absolutely not. The Oracle is completely local-first and designed to run in air-gapped container pipelines. It uses static analysis and local verification checks. We keep your API keys hidden server-side, ensuring zero data-harvesting or outbound leaking of secrets.",
      icon: <Database size={20} />
    },
    {
      question: "How can I define custom rule registries?",
      answer: "You specify your constraints in standard configuration schemas. Rules are categorized under Tier A (Boundary/Structural alignment checking for unpinned binaries, open ports, etc.) and Tier B (Semantic alignment of agent instructions, trusting chains, and policy coherence).",
      icon: <Workflow size={20} />
    },
    {
      question: "What is the 2% Rule for Tier Promotion?",
      answer: "To transition an custom rule from Tier A to Tier B, it must maintain a False-Positive Rate (FPR) of ≤ 2% over its last 50 production-mirror cycles. This protocol ensures high-integrity alerts and prevents developer notification fatigue.",
      icon: <Scale size={20} />
    },
    {
      question: "How is Phase Mirror stewarded?",
      answer: "Phase Mirror is stewarded by Citizen Gardens, an applied ethics and technology research studio. We maintain our core engine, rules, and scripts under open licenses, preventing closed-platform lock-ins and ensuring compliance remains a public scientific good.",
      icon: <ShieldCheck size={20} />
    },
    {
      question: "What are the pricing and licensing structures?",
      answer: "The core Oracle CLI and standard Tier A rule package are fully open and free. High-volume enterprise support tiers, premium custom Tier B rule maps, and managed validation endpoints are available to secure mission-critical pipelines.",
      icon: <CreditCard size={20} />
    }
  ];

  return (
    <div id="faq-view-wrapper" className={`pt-24 pb-24 ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>
      <div className="container mx-auto px-8 max-w-7xl">
        
        {/* FAQ Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mb-24"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent block mb-6">FAQ</span>
          <h1 className={`text-4xl md:text-6xl font-black mb-10 leading-tight tracking-tight ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
            Answers for <br /><span className="italic font-normal text-stone-400">compliant systems.</span>
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed text-stone-500 font-medium max-w-2xl">
            Everything you need to know about the Phase Mirror protocol, our local-first CLI, rules registry, and mathematical invariants.
          </p>
        </motion.div>

        {/* FAQ Grid */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-[2rem] border overflow-hidden transition-all duration-300 ${
                isDarkMode ? 'bg-[#0f0f12]/40 border-stone-850' : 'bg-white border-stone-150 shadow-sm'
              }`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-8 flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isDarkMode ? 'bg-[#060607]/80 text-[#2dd4bf] border border-[#2dd4bf]/20' : 'bg-stone-50 text-brand-accent border border-stone-150'
                  }`}>
                    {faq.icon}
                  </div>
                  <h3 className={`text-base md:text-lg font-bold group-hover:text-brand-accent transition-colors ${
                    isDarkMode ? 'text-stone-100' : 'text-stone-900'
                  }`}>
                    {faq.question}
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  className="text-stone-500"
                >
                  <ChevronDown size={20} />
                </motion.div>
              </button>
              
              <motion.div
                initial={false}
                animate={{ height: openIndex === index ? 'auto' : 0, opacity: openIndex === index ? 1 : 0 }}
                className="overflow-hidden"
              >
                <div className="px-8 md:px-24 pb-8 text-stone-550 dark:text-stone-400 text-sm leading-relaxed font-semibold">
                  <p className="max-w-3xl border-t border-stone-800/10 dark:border-stone-850/60 pt-6">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Support Section */}
        <section className={`mt-32 p-12 md:p-20 rounded-[4rem] text-center ${
          isDarkMode ? 'bg-[#0c0c0e]/40 border border-stone-850' : 'bg-brand-light border border-stone-150 shadow-sm'
        }`}>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black tracking-tight mb-6">Need targeted counsel?</h2>
            <p className="text-base text-stone-500 font-semibold mb-12 leading-relaxed">
              Our safety teams can help your development group design custom Tier B rules, mathematically bind your system endpoints, and configure custom continuous integration hooks.
            </p>
            <button 
              onClick={() => alert("Connecting with a Citizen Gardens verification engineer. Please email support@phasemirror.com.")}
              className={`px-10 py-4 rounded-2xl font-bold transition-all hover:scale-105 cursor-pointer ${
                isDarkMode ? 'bg-brand-accent text-zinc-950' : 'bg-brand-dark text-white'
              }`}
            >
              Verify My Systems
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default FAQView;
