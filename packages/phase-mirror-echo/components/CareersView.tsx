import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Cpu, 
  Workflow, 
  Scale, 
  Search, 
  Lock, 
  CheckCircle, 
  Network, 
  ChevronRight, 
  ShieldCheck, 
  HardDrive,
  Briefcase
} from 'lucide-react';

interface CareersViewProps {
  isDarkMode: boolean;
}

const CareersView: React.FC<CareersViewProps> = ({ isDarkMode }) => {
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  const jobs = [
    {
      id: 1,
      title: "Invariants Verification Engineer",
      team: "Protocol Math & Rigor",
      type: "Full-Time (Remote / Air-gapped)",
      location: "Citizen Gardens Research Lab",
      salary: "$145k – $185k • 0.15% Equity",
      summary: "Verify AI agent network pipelines against mathematical integrity properties, ensuring they default to fail-closed during structural drift.",
      requirements: [
        "Strong foundation in formal methods, TLA+, or Coq/Isabelle",
        "Expertise tracking runtime multi-agent loops and stability quotients",
        "Ability to translate organizational compliance rules into compile-time invariants",
        "Obsession with deterministic systems and zero-failure tolerance frameworks"
      ],
      mission: "Design and implement the mathematical guards that govern Phase Mirror's own recursive loops, maintaining the strict stability of our Multiplicity Constant (Λ_m)."
    },
    {
      id: 2,
      title: "Sovereign UI/UX Integrator",
      team: "Interface Design & Dignity",
      type: "Full-Time (Remote)",
      location: "Global Remote",
      salary: "$120k – $160k • 0.12% Equity",
      summary: "Craft beautiful, low-stimulus React interfaces that honor cognitive dignity and execute purely client-side without dark patterns or hidden trackers.",
      requirements: [
        "Unparalleled control of modern CSS, Tailwind, and React design systems",
        "Deep understanding of accessibility guidelines and cognitive load reduction",
        "Devotion to structural typography, proportional grid layouts, and meaningful motion",
        "Experience building fully offline or local-first decentralized applications"
      ],
      mission: "Ensure that our user interfaces feel incredibly calm, elegant, and predictable, making complex AI alignment and risk matrices intuitively scannable/actionable."
    },
    {
      id: 3,
      title: "Governance Protocol Architect",
      team: "System & Architecture",
      type: "Full-Time (Remote)",
      location: "London / Remote",
      salary: "$150k – $195k • 0.20% Equity",
      summary: "Architect the continuous integration hooks and CLI engines that parse repository states and compile them into Architectural Decision Records.",
      requirements: [
        "Extensive experience with compiler design, AST parsing, or CLI development in TypeScript/Rust",
        "Expertise in git hook automation and secure server-to-agent communication",
        "Deep integration knowledge of Node.js, Express, and Docker-sandboxed environments",
        "Familiarity with cloud infrastructures, Terraform, and secure container ingress routing"
      ],
      mission: "Construct the pipelines that scan client systems, map dissonances, and force fuzzy organizational plans into bound, deterministic Phase Levers."
    },
    {
      id: 4,
      title: "AI Safety Alignment Fellow",
      team: "Research & Citizen Gardens",
      type: "Contract (6-12 Months, Renewable)",
      location: "Cambridge, MA / Hybrid",
      salary: "$90k – $120k Grant Equivalent",
      summary: "Audit foundational model outputs for emergent agency, mapping the tension between declared alignment values and live operational benchmarks.",
      requirements: [
        "Ph.D. or deep published history in AI Safety, Ethics, or Applied Social Sciences",
        "Strong understanding of reinforcement learning feedback systems and reward-drift",
        "Ability to draft clear, evidence-carrying essays and technical ADR specs",
        "Passionate about the open stewardship of democratic, sovereign models"
      ],
      mission: "Map our weekly training curricula and audit frameworks, refining code norms MD-001 through MD-005 to reflect modern alignment vectors."
    }
  ];

  return (
    <div id="careers-view-container" className={`pt-24 pb-24 ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Careers Hero */}
        <motion.div 
          id="careers-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mb-24"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent block mb-6">Join Phase Mirror</span>
          <h1 className={`text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
            Help Us Align Software and <span className="italic font-normal text-stone-400">Systemic Integrity.</span>
          </h1>
          <p className="text-lg md:text-xl leading-relaxed text-stone-500 font-medium max-w-3xl">
            At Phase Mirror and Citizen Gardens, we reject the default mechanics of fast-breaking software. We are building a calm, rigorous, and proof-carrying future where humans remain firmly in control of autonomous agent systems.
          </p>
        </motion.div>

        {/* Culture / Philosophy Grid */}
        <section id="careers-culture-section" className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Lock className="text-brand-accent" size={24} />,
                title: "Air-Gapped Privacy",
                desc: "We prioritize local-first tools and zero-telemetry development, keeping user data sovereign and completely out of centralized databases."
              },
              {
                icon: <Scale className="text-brand-accent" size={24} />,
                title: "Mathematical Balance",
                desc: "We leverage rigorous mathematical constraints—such as the Multiplicity Constant (Λ_m)—to model and lock stable, fail-closed boundaries."
              },
              {
                icon: <Workflow className="text-brand-accent" size={24} />,
                title: "Artifact-Driven",
                desc: "We work directly through explicit, actionable artifacts (ADRs, specs, and Terraform scripts), eliminating abstract alignments from our process."
              }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className={`p-8 rounded-[2.5rem] border ${
                  isDarkMode ? 'bg-[#0f0f11]/65 border-stone-850' : 'bg-white border-stone-150 shadow-sm'
                }`}
              >
                <div className="p-3.5 bg-brand-accent/10 border border-brand-accent/20 rounded-2xl w-fit mb-6">
                  {item.icon}
                </div>
                <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{item.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed font-semibold">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Job Postings Section */}
        <section id="careers-jobs-section" className="mb-32">
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-stone-800/10 dark:border-stone-850/60 pb-8 mb-16 gap-4">
            <div>
              <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-brand-accent block mb-1">Open Positions</span>
              <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                Join Our Remote-First Team
              </h2>
            </div>
            <p className="text-stone-500 text-sm md:text-right max-w-sm font-semibold">
              We seek disciplined minds excited by algorithmic constraints, elegant design, and systemic truth.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Job List (col-span-5) */}
            <div className="lg:col-span-5 space-y-4">
              {jobs.map((job, idx) => {
                const isSelected = selectedJob === job.id || (selectedJob === null && idx === 0);
                const actualId = job.id;
                return (
                  <button
                    key={job.id}
                    id={`btn-job-posting-${job.id}`}
                    onClick={() => setSelectedJob(actualId)}
                    className={`w-full p-6 rounded-[2rem] text-left border transition-all duration-300 relative group cursor-pointer ${
                      isSelected
                        ? 'bg-brand-accent/[0.06] border-brand-accent/40'
                        : 'bg-[#121214]/30 dark:bg-[#121215]/50 border-stone-800/10 dark:border-stone-850/50 hover:bg-[#1c1c1f]/40 dark:hover:bg-[#141416]/90'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-accent rounded-r-full" />
                    )}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#2dd4bf] font-extrabold block mb-1">
                          {job.team}
                        </span>
                        <h3 className={`text-base font-bold transition-colors ${
                          isSelected 
                            ? (isDarkMode ? 'text-white' : 'text-stone-900') 
                            : (isDarkMode ? 'text-stone-400 group-hover:text-stone-200' : 'text-stone-700')
                        }`}>
                          {job.title}
                        </h3>
                        <span className="text-[11px] text-stone-500 font-medium block mt-1">
                          {job.type} • {job.location}
                        </span>
                      </div>
                      <ChevronRight 
                        size={16} 
                        className={`text-stone-500 shrink-0 mt-1 transition-transform ${
                          isSelected ? 'rotate-90 text-brand-accent' : 'group-hover:translate-x-1'
                        }`} 
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Job Details Panel (col-span-7) */}
            <div className="lg:col-span-7">
              {(() => {
                const currentJob = jobs.find(j => j.id === (selectedJob || 1)) || jobs[0];
                return (
                  <div 
                    id="job-details-panel" 
                    className={`rounded-[3.5rem] border p-8 md:p-10 h-full flex flex-col justify-between relative overflow-hidden ${
                      isDarkMode ? 'bg-[#0b0b0d] border-stone-850' : 'bg-white border-stone-150 shadow-md'
                    }`}
                  >
                    <div className="space-y-6 relative">
                      {/* Job title and Meta info */}
                      <div className="border-b border-stone-800/10 dark:border-stone-850/50 pb-6">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-mono text-[9.5px] uppercase text-brand-accent font-extrabold bg-brand-accent/10 px-2.5 py-0.5 rounded-full">
                            {currentJob.team}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono font-bold">
                            {currentJob.location}
                          </span>
                        </div>
                        <h3 className={`text-2xl font-black ${isDarkMode ? 'text-stone-200' : 'text-stone-900'}`}>
                          {currentJob.title}
                        </h3>
                        <p className="text-xs text-brand-accent font-mono font-bold mt-2">
                          {currentJob.salary} • {currentJob.type}
                        </p>
                      </div>

                      {/* Summary */}
                      <div className="space-y-2">
                        <h4 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                          What you will do
                        </h4>
                        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-605'} font-medium`}>
                          {currentJob.summary}
                        </p>
                      </div>

                      {/* Job Mission statement */}
                      <div className={`p-4 rounded-2xl border ${
                        isDarkMode ? 'bg-black/40 border-stone-850/80 text-stone-400' : 'bg-stone-50 border-stone-150 text-stone-600'
                      } text-xs leading-relaxed font-semibold filter saturate-[0.9]`}>
                        <strong className="text-brand-accent uppercase text-[10px] tracking-widest block mb-1">
                          Role Mission Scope
                        </strong>
                        {currentJob.mission}
                      </div>

                      {/* Requirements checklist */}
                      <div className="space-y-3 pt-2">
                        <h4 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                          Inherent Requirements
                        </h4>
                        <ul className="space-y-2.5">
                          {currentJob.requirements.map((req, rid) => (
                            <li key={rid} className="flex gap-3 text-xs text-stone-500 font-medium">
                              <ShieldCheck size={14} className="text-brand-accent shrink-0 mt-0.5" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Simple Submit application section */}
                    <div className="pt-8 mt-8 border-t border-stone-800/10 dark:border-stone-850/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <span className="text-[11px] font-semibold text-stone-500">
                        Interested? Submit your CV and Git profile.
                      </span>
                      <button 
                        id="btn-apply-job"
                        onClick={() => alert(`Application pipeline initiated for: ${currentJob.title}. Please email careers@phasemirror.com with your CV.`)}
                        className={`w-full sm:w-auto px-6 py-2.5 rounded-2xl text-xs font-bold hover:scale-105 transition-all text-center cursor-pointer ${
                          isDarkMode 
                            ? 'bg-brand-accent text-zinc-950 hover:brightness-110' 
                            : 'bg-brand-dark text-white hover:bg-brand-dark/95'
                        }`}
                      >
                        Transmit Application
                      </button>
                    </div>

                  </div>
                );
              })()}
            </div>

          </div>
        </section>

        {/* Global Citizen Gardens footer disclaimer inside page body */}
        <section id="careers-stewardship" className={`pt-12 border-t ${isDarkMode ? 'border-stone-850' : 'border-stone-150'} flex flex-col md:flex-row gap-10 justify-between items-start`}>
          <div className="max-w-xl">
            <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-2`}>
              Citizen Gardens Stewardship
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed font-semibold">
              Phase Mirror is maintained by Citizen Gardens, an applied ethics and technology research studio. We run as an egalitarian, high-autonomy research cluster. By joining us, you agree to treat code as a proof-carrying, safety-critical artifact of systemic governance.
            </p>
          </div>
          <div className="flex gap-4 font-mono text-[10px] text-[#2dd4bf] bg-[#2dd4bf]/5 border border-[#2dd4bf]/20 rounded-2xl p-4 shrink-0">
            <Cpu size={16} />
            <span className="font-bold">Zero-Trust • Air-Gapped Verification • Active Invariants</span>
          </div>
        </section>

      </div>
    </div>
  );
};

export default CareersView;
