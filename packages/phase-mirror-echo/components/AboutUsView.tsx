import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Brain, 
  Library, 
  Terminal, 
  Network, 
  Cpu, 
  Workflow, 
  Eye, 
  Activity,
  UserCheck
} from 'lucide-react';

interface AboutUsViewProps {
  isDarkMode: boolean;
}

const AboutUsView: React.FC<AboutUsViewProps> = ({ isDarkMode }) => {
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
    <div id="about-us-view-wrapper" className={`pt-24 pb-24 ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>
      <div className="container mx-auto px-8 max-w-7xl">
        
        {/* Origin Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mb-32"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent block mb-6">Our Origin</span>
          <h1 className={`text-4xl md:text-6xl font-black mb-10 leading-tight tracking-tight ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
            Born from the gap between <span className="italic font-normal text-stone-400">code complexity and systemic trust.</span>
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed text-stone-500 font-medium max-w-3xl">
            We know what it means to run faster than we can govern—to deploy autonomous agents across network infrastructure while hoping alignment resolves itself in the margins.
          </p>
        </motion.div>

        {/* The Why */}
        <section id="about-us-tension" className="mb-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-3xl font-extrabold mb-8 tracking-tight">The default tech stack is too quiet about its contradictions.</h2>
              <div className="space-y-6 text-base leading-relaxed text-stone-500 font-medium">
                <p>
                  Most software systems operate in a silent tension: they promise rapid developer acceleration on the surface while masking systemic structural drift underneath. We built Phase Mirror to name this friction openly.
                </p>
                <p>
                  We are a group of developers, researchers, and systems thinkers who believe AI operations should be deterministic, secure, and fully accountable rather than vibes-based. We replace the default "test and pray" deployment lifecycle with hard, evidence-carrying diagnostic constraints.
                </p>
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { icon: <ShieldCheck className="text-brand-accent" />, title: "Inherent Verification", desc: "Governance cannot be a downstream checklist; it must be compiled into the build system." },
                { icon: <Brain className="text-brand-accent" />, title: "Multiplicity Anchors", desc: "Modeling and protecting systems based on the mathematical realities of agent feedback loops." },
                { icon: <Terminal className="text-brand-accent" />, title: "Determinism Over Hype", desc: "We build tools that scan structure, verify invariants, and export raw proof-enforcing evidence." },
                { icon: <Network className="text-brand-accent" />, title: "Sovereign Trust Chains", desc: "Every model operation must map to explicit, human-mediated risk boundaries." }
              ].map((item, i) => (
                <div key={i} className={`p-8 rounded-[2rem] border ${isDarkMode ? 'bg-[#0e0e10]/60 border-stone-850' : 'bg-white border-stone-150 shadow-sm'}`}>
                  <div className="p-3.5 bg-brand-accent/5 border border-brand-accent/20 rounded-2xl w-fit mb-6">{item.icon}</div>
                  <h4 className="font-extrabold text-sm mb-3">{item.title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed font-semibold">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Mission Panel */}
        <section id="about-us-governance-panel" className="mb-40">
          <div className={`p-12 md:p-16 rounded-[3.5rem] relative overflow-hidden ${isDarkMode ? 'bg-[#0f0f12]/60 border border-stone-850' : 'bg-brand-light border border-stone-150'}`}>
            <div className="max-w-4xl relative z-10">
              <Workflow className="text-brand-accent mb-8" size={32} />
              <h2 className="text-3xl font-black mb-8 tracking-tight">Governance-as-Compilation</h2>
              <p className="text-lg md:text-xl text-stone-500 leading-relaxed font-medium mb-12">
                We believe security does not come from monitoring a runaway fire; it comes from preventing systemic contradictions before they are deployed. Phase Mirror defines a world where build-time safety checks are absolute and self-correcting.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  { title: "Statistically Stable", desc: "A candidate rule is verified dynamically to maintain an FPR ≤ 2% before full scale tier-promotion." },
                  { title: "Evidence-Citing", desc: "Every alerting process outputs exact files, lines, and system configurations to eliminate ambiguity." },
                  { title: "Consistently Fail-Closed", desc: "When systemic tension exceeds safety thresholds, pipelines safely halt rather than failing open." }
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-3xl border border-stone-800/10 dark:border-stone-850/50">
                    <h4 className="font-bold text-base mb-3 text-brand-accent">{item.title}</h4>
                    <p className="text-xs text-stone-500 leading-relaxed font-semibold">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Stewardship Callout */}
        <section id="about-us-philosophy-quote" className="text-center max-w-4xl mx-auto mb-40">
          <UserCheck className="text-brand-accent mx-auto mb-8" size={32} />
          <h2 className="text-3xl font-black mb-8">We write the rules for agent accountability.</h2>
          <p className="text-lg md:text-xl text-stone-500 leading-relaxed font-medium italic">
            "Our ultimate goal is to remove subjective reviews from systemic governance. By introducing mathematical stability thresholds and real-time friction mapping, we turn alignment from an abstract hope into a standard compile check."
          </p>
        </section>

        {/* Stewardship Section */}
        <section id="about-us-stewardship" className={`pt-24 border-t ${isDarkMode ? 'border-stone-850' : 'border-stone-150'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${isDarkMode ? 'bg-zinc-900 border border-stone-800 text-brand-accent' : 'bg-stone-50 border border-stone-150 text-brand-accent'}`}>
                <Library size={28} />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-4">Stewardship & Open Frameworks</h2>
              <p className={`text-xs font-bold uppercase tracking-[0.3em] ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                Citizen Gardens
              </p>
            </div>
            <div className="lg:col-span-2 space-y-12">
              <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-[#0c0c0e]/40 border-stone-850' : 'bg-white border-stone-150 shadow-sm'}`}>
                <p className="text-base leading-relaxed text-stone-500 font-medium mb-8">
                  Phase Mirror is stewarded by <strong className={isDarkMode ? 'text-stone-100' : 'text-stone-800'}>Citizen Gardens</strong>, an applied ethics and technology research studio dedicated to building sovereignty‑centered, high-integrity AI security frameworks. Citizen Gardens develops and maintains the Phase Mirror protocol, our command-line diagnostic tools, and the underlying mathematical engine as open-source, community-governed utilities.
                </p>
                <p className="text-base leading-relaxed text-stone-500 font-medium">
                  Rooted in Multiplicity Theory, air-gapped data compliance, and systemic vulnerability research, Citizen Gardens treats Phase Mirror as both a physical CLI pipeline product and a standard for safety-critical organizations. Through our work, we convert complex alignment concepts into practical git hooks and automated diagnostics—focusing on dignity, privacy, and systemic safety as the native constraints.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AboutUsView;
