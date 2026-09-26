import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Calendar, 
  CheckSquare, 
  MessageSquare,
  BarChart2,
  Lightbulb,
  Globe,
  Sparkles,
  Layers,
  Heart,
  ArrowRight,
  Shield,
  Zap,
  HelpCircle,
  TrendingUp
} from 'lucide-react';

interface TeachingViewProps {
  isDarkMode: boolean;
}

const TeachingView: React.FC<TeachingViewProps> = ({ isDarkMode }) => {
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
    <div id="protocol-academy-view" className={`pt-24 pb-32 transition-colors duration-300 ${isDarkMode ? 'text-stone-300 bg-[#070708]' : 'text-stone-800 bg-[#fbfbfa]'}`}>
      <div className="container mx-auto px-8 max-w-7xl">
        
        {/* At a Glance Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mb-20"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-[#2dd4bf] block"></span>
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-[#2dd4bf] block">
              At a Glance: Protocol Academy
            </span>
          </div>
          
          <h1 id="academy-title" className={`text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight ${isDarkMode ? 'text-stone-200' : 'text-stone-900'}`}>
            Equipping Global <span className="italic font-normal text-stone-400">Human Potential.</span>
          </h1>
          
          <p className="text-lg md:text-xl leading-relaxed text-stone-500 font-medium max-w-3xl">
            The Protocol Academy is a global framework designed to cultivate <strong className={isDarkMode ? 'text-stone-300' : 'text-stone-700'}>distributed human potential</strong> and <strong className={isDarkMode ? 'text-stone-300' : 'text-stone-700'}>sovereign stewardship</strong> within the Phase Mirror ecosystem. It shifts the focus from rigid compliance to <strong className="text-[#2dd4bf] font-semibold">adaptive capability amplification</strong>, empowering a remote workforce to navigate complex digital environments alongside automated systems.
          </p>
        </motion.div>

        {/* I. Core Orchestration Pillars */}
        <section id="section-pillars" className="mb-32 scroll-mt-28">
          <div className="flex items-center gap-4 mb-12">
            <span className="font-mono text-xs text-[#2dd4bf] font-bold tracking-widest uppercase">MODULE I</span>
            <h2 className="text-2xl font-black tracking-tight text-stone-400 dark:text-stone-300">Core Orchestration Pillars</h2>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-stone-850' : 'bg-stone-200/70'}`}></div>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: <Globe className="text-[#2dd4bf]" size={22} />,
                title: "Decentralized Empowerment",
                desc: "Enlisting global talent and validating unique problem-solving styles before they interact with the control plane."
              },
              {
                icon: <Sparkles className="text-brand-accent animate-pulse" size={22} />,
                title: "Adaptive Capability Amplification",
                desc: "Cultivating human intuition and creative sovereignty over rigid, traditional compliance drills."
              },
              {
                icon: <Heart className="text-[#2dd4bf]" size={22} />,
                title: "Synergistic System Balance",
                desc: "Synchronizing human purpose with automated systemic bounds to resolve dissonance and prevent drift."
              },
              {
                icon: <Users className="text-brand-accent" size={22} />,
                title: "Synchronized Distributed Practices",
                desc: "Establishing an ecosystem of shared accountability through continuous learning, peer reviews, and deep mentoring."
              }
            ].map((pillar, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants} 
                className={`p-8 rounded-[2rem] border transition-all duration-300 group hover:scale-[1.02] ${
                  isDarkMode 
                    ? 'bg-[#0b0b0e] border-stone-850 hover:bg-[#0f0f14]' 
                    : 'bg-white border-stone-150 hover:shadow-md'
                }`}
              >
                <div className="p-3 bg-brand-accent/5 border border-brand-accent/15 rounded-xl w-fit mb-5 group-hover:border-[#2dd4bf]/40 transition-colors">
                  {pillar.icon}
                </div>
                <h3 className="text-base font-bold mb-3 tracking-tight">{pillar.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed font-semibold">{pillar.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* II. The Cultivation & Integration Arc */}
        <section id="section-arc" className="mb-32 scroll-mt-28">
          <div className="flex items-center gap-4 mb-12">
            <span className="font-mono text-xs text-[#2dd4bf] font-bold tracking-widest uppercase">MODULE II</span>
            <h2 className="text-2xl font-black tracking-tight text-stone-400 dark:text-stone-300">The Cultivation & Integration Arc</h2>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-stone-850' : 'bg-stone-200/70'}`}></div>
          </div>

          <div className={`p-10 md:p-14 rounded-[3rem] border ${isDarkMode ? 'bg-[#09090b] border-stone-850' : 'bg-stone-50 border-stone-200/50 shadow-sm'}`}>
            <div className="max-w-3xl mb-12">
              <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-[#2dd4bf] uppercase bg-[#2dd4bf]/10 px-3 py-1 rounded w-fit block mb-4">
                Six-Week Curricular Progression
              </span>
              <p className="text-sm text-stone-500 font-semibold leading-relaxed">
                New operators progress through a structured, high-fidelity journey to transition from latent organic capability to active, trust-centered system engagement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              {[
                { 
                  week: "Discovery (Weeks 1-2)", 
                  title: "Mapping Native Potentials", 
                  desc: "Mapping native creative abilities, spatial contexts, and organic problem-solving rhythms within interactive playground spaces." 
                },
                { 
                  week: "Cohesion (Weeks 3-5)", 
                  title: "Remote Stabilization Sprints", 
                  desc: "Running mock stabilization sprints in high-fidelity, remote test environments to balance digital variables with manual empathy." 
                },
                { 
                  week: "Stewardship (Week 6)", 
                  title: "Live Global Integration", 
                  desc: "Full integration into the live global network to orchestrate resilient, self-reflecting, zero-drift applications with signed compliance bounds." 
                }
              ].map((step, i) => (
                <div key={i} className="relative group">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-xs font-mono font-black text-[#2dd4bf] bg-[#2dd4bf]/5 border border-[#2dd4bf]/20 px-3 py-1 rounded-full">{step.week}</span>
                    <div className={`h-px flex-1 ${isDarkMode ? 'bg-stone-800' : 'bg-stone-200'}`}></div>
                  </div>
                  <h4 className="text-base font-bold mb-3 group-hover:text-[#2dd4bf] transition-colors">{step.title}</h4>
                  <p className="text-xs text-stone-500 font-semibold leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* III. Operational Rhythms & Workshops */}
        <section id="section-rhythms" className="mb-32 scroll-mt-28">
          <div className="flex items-center gap-4 mb-12">
            <span className="font-mono text-xs text-[#2dd4bf] font-bold tracking-widest uppercase">MODULE III</span>
            <h2 className="text-2xl font-black tracking-tight text-stone-400 dark:text-stone-300">Operational Rhythms & Workshops</h2>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-stone-850' : 'bg-stone-200/70'}`}></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* Rhythms Grid */}
            <div className="space-y-6">
              {[
                { 
                  title: "Continuous Context Harmonization", 
                  meta: "Daily, 10m",
                  desc: "Evaluating qualitative insights to ensure automated logic matches local human reality, ethics, and diverse perspectives." 
                },
                { 
                  title: "Distributed Team Synchronization", 
                  meta: "Weekly, 20m",
                  desc: "Regional interactive meetups for tracking context drift, aligning milestones, and mentoring newer cohorts in sandboxed networks." 
                },
                { 
                  title: "Holistic Sovereign Reflections", 
                  meta: "Monthly, 40m",
                  desc: "Reviewing long-term systemic health, sharing structural discoveries, and formulating stable co-existence guidelines." 
                }
              ].map((rhythm, i) => (
                <div key={i} className={`p-6 rounded-2xl border transition-all duration-300 hover:border-[#2dd4bf]/30 ${isDarkMode ? 'bg-[#09090b] border-stone-850' : 'bg-white border-stone-150 shadow-sm'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-sm text-stone-400 dark:text-stone-200">{rhythm.title}</h4>
                    <span className="text-[10px] font-mono font-bold text-brand-accent bg-brand-accent/5 px-2.5 py-0.5 rounded-full">{rhythm.meta}</span>
                  </div>
                  <p className="text-xs text-stone-500 font-semibold leading-relaxed">{rhythm.desc}</p>
                </div>
              ))}
            </div>

            {/* Global Enablement Workshops Feature Card */}
            <div className={`p-8 md:p-10 rounded-[2.5rem] border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#0a0a0d] border-stone-850' : 'bg-stone-50 border-stone-200/60 shadow-inner'
            }`}>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#2dd4bf] bg-[#2dd4bf]/5 px-3 py-1 rounded border border-[#2dd4bf]/15 w-fit block mb-6">
                  GLOBAL ENABLEMENT WORKSHOPS
                </span>
                <p className="text-sm text-stone-500 font-semibold leading-relaxed mb-6">
                  Every month, our global workforce participates in core interactive simulations. These workshops are specifically calculated to build high cohesion across distributed networks:
                </p>
                <ul className="space-y-4 text-xs font-semibold text-stone-500">
                  <li className="flex items-start gap-3">
                    <span className="p-1 rounded bg-[#2dd4bf]/10 text-[#2dd4bf] mt-0.5"><CheckSquare size={12} /></span>
                    <div>
                      <strong className={isDarkMode ? 'text-stone-300' : 'text-stone-700'}>Cross-Cultural Co-existence:</strong> Aligning localized cultural frameworks with standard machine contracts.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="p-1 rounded bg-[#2dd4bf]/10 text-[#2dd4bf] mt-0.5"><CheckSquare size={12} /></span>
                    <div>
                      <strong className={isDarkMode ? 'text-stone-300' : 'text-stone-700'}>Chaotic Flow Mitigation:</strong> Simulating unannounced network interruptions to test resilient peer-to-peer organization.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="p-1 rounded bg-[#2dd4bf]/10 text-[#2dd4bf] mt-0.5"><CheckSquare size={12} /></span>
                    <div>
                      <strong className={isDarkMode ? 'text-stone-300' : 'text-stone-700'}>Open Spec Customization:</strong> Contributing directly to the operational specifications via collaborative version controls.
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="mt-8 pt-6 border-t border-stone-800/10 dark:border-stone-850 flex items-center justify-between text-xs font-mono">
                <span className="text-[#2dd4bf] font-bold">NEXT SESSION: REALTIME DRILL #402</span>
                <span className="text-stone-500">ENROLLMENT OPEN</span>
              </div>
            </div>
          </div>
        </section>

        {/* IV. Critical Insights: Sovereign Talent Dimensions */}
        <section id="section-table" className="mb-32 scroll-mt-28">
          <div className="flex items-center gap-4 mb-12">
            <span className="font-mono text-xs text-[#2dd4bf] font-bold tracking-widest uppercase">MODULE IV</span>
            <h2 className="text-2xl font-black tracking-tight text-stone-400 dark:text-stone-300">Sovereign Talent Dimensions</h2>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-stone-850' : 'bg-stone-200/70'}`}></div>
          </div>

          <div className={`overflow-hidden border rounded-[2rem] ${isDarkMode ? 'bg-[#09090b] border-stone-850' : 'bg-white border-stone-200 shadow-sm'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'bg-[#0d0d11] border-stone-850' : 'bg-stone-50/50 border-stone-150'}`}>
              <h3 className="font-bold text-base text-stone-400 dark:text-stone-200">Critical Insights Checklist</h3>
              <p className="text-xs text-stone-500 font-semibold mt-1">Sovereign workforce competencies compared across core execution boundaries.</p>
            </div>
            
            <div className="overflow-x-auto text-xs md:text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-stone-850 text-stone-400 bg-stone-900/10' : 'border-stone-150 text-stone-600 bg-stone-50/20'}`}>
                    <th className="p-6 font-bold uppercase tracking-wider text-xs w-1/4">Dimension</th>
                    <th className="p-6 font-bold uppercase tracking-wider text-xs">Key Focus Areas & Strategic Objectives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/10 dark:divide-stone-850">
                  {[
                    {
                      dim: "Decentralized Agility",
                      focus: "Timezone-agnostic workflows, local sandboxed experimentation, and resilient peer-to-peer communication during isolation bounds."
                    },
                    {
                      dim: "Continuous Evolution",
                      focus: "Peer-to-peer mentoring initiatives, iterative skill pivoting, and bridging manual human artistry with deep code invariants."
                    },
                    {
                      dim: "Mindful Harmonization",
                      focus: "Resolving functional tension through diverse perspectives, documenting decisions in open Architecture Decision Records (ADRs), and preventing context drift."
                    }
                  ].map((row, i) => (
                    <tr key={i} className={`transition-colors duration-200 ${isDarkMode ? 'hover:bg-stone-900/25' : 'hover:bg-stone-50/50'}`}>
                      <td className="p-6 font-black text-stone-400 dark:text-stone-200 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf]"></span>
                        {row.dim}
                      </td>
                      <td className="p-6 text-stone-500 font-semibold leading-relaxed">{row.focus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* The Critical Gap Alert Callout */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`p-10 rounded-[3rem] border ${
            isDarkMode 
              ? 'bg-zinc-950/40 border-red-950/30' 
              : 'bg-red-50/10 border-red-100/40'
          }`}
        >
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="p-4 bg-red-500/10 border border-red-500/25 text-[#2dd4bf] rounded-2xl w-fit flex-shrink-0 animate-pulse">
              <Shield size={24} className="text-red-500" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-red-500 tracking-[0.25em] block mb-2">
                SYSTEM CORRELATION NOTE
              </span>
              <p className="text-xs font-semibold uppercase text-stone-500 tracking-widest mb-4">
                THE L0 BOUNDARY DECOUPLING
              </p>
              <p className="text-sm md:text-base leading-relaxed text-stone-500 font-medium">
                <strong className="text-red-500 font-bold">Critical Gap:</strong> While the Protocol Academy focuses heavily on cultivating human capability and creative stewardship, the <strong className={isDarkMode ? 'text-stone-300' : 'text-stone-700'}>Phase Mirror Oracle</strong> serves as the strict technical counterpart, enforcing absolute L0 invariants (like schema integrity and permission bits) at sub-100ns latency to guarantee the infrastructure supports this human sovereignty.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Closing Curriculum Statement */}
        <section className="text-center mt-32 pt-16 border-t border-stone-800/10 dark:border-stone-850 font-sans">
          <p className="text-xl font-bold italic text-stone-500 leading-relaxed max-w-3xl mx-auto">
            "Sovereignty is not given, it is calibrated continuous by collaborative minds."
          </p>
        </section>

      </div>
    </div>
  );
};

export default TeachingView;
