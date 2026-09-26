import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  ShieldCheck, 
  Globe, 
  Lock, 
  FileText, 
  Settings, 
  Database, 
  Users, 
  Code, 
  Sparkles, 
  CheckSquare, 
  Cpu, 
  Library, 
  HelpCircle, 
  ArrowRight, 
  DollarSign, 
  Award, 
  GraduationCap, 
  Scale, 
  Layers, 
  Check, 
  X, 
  Gauge, 
  Hourglass, 
  TrendingUp, 
  Compass, 
  FileCheck,
  Server,
  Zap,
  ChevronRight,
  Calculator,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';

interface ServicesViewProps {
  isDarkMode: boolean;
}

type TabType = 'consulting' | 'saas_compliance' | 'implementation_ops' | 'academy_exams' | 'gtm_financials';

const ServicesView: React.FC<ServicesViewProps> = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<TabType>('consulting');

  // Strategic Consulting interactive states
  const [diagnosticOrgSize, setDiagnosticOrgSize] = useState<'mid' | 'ent' | 'global'>('ent');
  const [selectedRetainer, setSelectedRetainer] = useState<'advisor' | 'partner' | 'board'>('partner');

  // T&M Estimator state
  const [estRules, setEstRules] = useState<number>(3);
  const [estIntegrationHours, setEstIntegrationHours] = useState<number>(40);
  const [estPipelineHours, setEstPipelineHours] = useState<number>(20);
  const [estMigrationHours, setEstMigrationHours] = useState<number>(10);

  // Platform Tier state for comparison highlighting
  const [selectedTier, setSelectedTier] = useState<'community' | 'team' | 'business' | 'enterprise'>('business');

  // Year filter for revenue projections
  const [projectionYear, setProjectionYear] = useState<1 | 2 | 3>(2);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  // Diagnostic sizes metadata
  const diagnosticData = {
    mid: {
      label: "Mid-Market",
      employees: "500–2,000 employees",
      fee: "$75,000–$125,000",
      duration: "6 weeks",
      timeline: [
        { phase: "Week 1-2", task: "Executive Discovery", deliverable: "Stakeholder interviews (5-8), document review" },
        { phase: "Week 2-3", task: "Tension Mapping", deliverable: "Ranked dissonance matrix with impact × tractability scores" },
        { phase: "Week 3-4", task: "Lever Development", deliverable: "10-15 actionable levers with owners, metrics, horizons" },
        { phase: "Week 4-5", task: "Governance Artifacts", deliverable: "Spec, SLA templates, kill-switch protocols" },
        { phase: "Week 5-6", task: "Board Presentation", deliverable: "Template C Board Packet output with risk register" }
      ]
    },
    ent: {
      label: "Enterprise",
      employees: "2,000–10,000 employees",
      fee: "$150,000–$250,000",
      duration: "8–10 weeks",
      timeline: [
        { phase: "Week 1-3", task: "Executive Discovery", deliverable: "Stakeholder interviews (12-15), cross-departmental documentation audit" },
        { phase: "Week 3-5", task: "Tension Mapping", deliverable: "Multi-point tension matrix, baseline drift models" },
        { phase: "Week 5-7", task: "Lever Development", deliverable: "15-20 codified governance levers mapped to custom micro-invariants" },
        { phase: "Week 7-9", task: "Governance Artifacts", deliverable: "Enforceable SLA spec, regulatory pre-flight configs, automatic triage protocols" },
        { phase: "Week 9-10", task: "Board Presentation", deliverable: "Board meeting package, legal risk register & insurance model alignment" }
      ]
    },
    global: {
      label: "Global Enterprise",
      employees: "10,000+ employees",
      fee: "$300,000–$500,000",
      duration: "12–16 weeks",
      timeline: [
        { phase: "Week 1-4", task: "Executive/Global Discovery", deliverable: "Global stakeholder interviews (25+), code lineage & pipeline taxonomy mapping" },
        { phase: "Week 4-7", task: "Tension Mapping", deliverable: "Jurisdictional policy friction matrix, federated oracle deployment assessments" },
        { phase: "Week 7-10", task: "Lever Development", deliverable: "30+ custom enterprise governance metrics, dynamic compliance rules mapping" },
        { phase: "Week 10-13", task: "Governance Artifacts", deliverable: "Enterprise compliance manuals, cross-entity backup models, hard break overrides" },
        { phase: "Week 13-16", task: "Board & Regulator Review", deliverable: "Executive committee presentations, global audit-ready reports, sovereign compliance files" }
      ]
    }
  };

  // Advisory retainers metadata
  const retainerData = {
    advisor: {
      title: "Advisor",
      fee: "$10,000/month",
      access: "4 hours/month advisory calls, general email access",
      response: "24–48 hours",
      bestFor: "Small tech teams wanting high-level guidance.",
      valueYield: "$50,000/month value equivalent (5X)"
    },
    partner: {
      title: "Strategic Partner",
      fee: "$25,000/month",
      access: "Unlimited ad-hoc advisory calls, quarterly on-site synthesis sessions",
      response: "4–8 hours",
      bestFor: "Fast-scaling SaaS/enterprise scaling automated code pipelines.",
      valueYield: "$125,000/month value equivalent via premium liability protection (5X)"
    },
    board: {
      title: "Board Advisor",
      fee: "$50,000/month",
      access: "Direct board of directors meeting attendance, emergency risk/crisis response support",
      response: "2 hours",
      bestFor: "Publicly traded companies requiring ironclad compliance governance.",
      valueYield: "$250,000/month value equivalent via expedited crisis mitigation (5X)"
    }
  };

  // SaaS Features Matrix metadata
  const saasFeatures = [
    { name: "Core Rules (MD-001–005)", community: true, team: true, business: true, enterprise: true, scope: "Base structural safety validation" },
    { name: "Extended Rule Registry", community: false, team: true, business: true, enterprise: true, scope: "Access to verified community rules library" },
    { name: "Custom Rule Development", community: false, team: false, business: "3 included", enterprise: "Unlimited", scope: "Custom constraint building" },
    { name: "Cloud Dashboard", community: false, team: true, business: true, enterprise: true, scope: "Visual analytics telemetry and event logs" },
    { name: "SSO/SAML Authentication", community: false, team: false, business: true, enterprise: true, scope: "Okta / Auth0 secure tenant linking" },
    { name: "Audit Log Export", community: false, team: false, business: true, enterprise: true, scope: "Cryptographically signed compliance records" },
    { name: "Calibration Data Access", community: false, team: false, business: "Read-only", enterprise: "Full API", scope: "Retrieve and map absolute truth states" },
    { name: "Dedicated Cluster Instance", community: false, team: false, business: false, enterprise: true, scope: "Physical isolate container environment" },
    { name: "Guaranteed SLA", community: "None", team: "99.0%", business: "99.5%", enterprise: "99.9%", scope: "Platform availability & uptime specs" },
    { name: "Dedicated Support Priority", community: "Community", team: "Email (24hr)", business: "Priority (4hr)", enterprise: "TAM + 1hr critical response", scope: "Direct ticketing pathways" }
  ];

  // Financial model data
  const revenueHistory = [
    { name: "Consulting", Year1: 600000, Year2: 1200000, Year3: 1875000, percentY1: "60%", percentY3: "25%" },
    { name: "Platform ARR", Year1: 150000, Year2: 900000, Year3: 2625000, percentY1: "15%", percentY3: "35%" },
    { name: "Enterprise Seats", Year1: 100000, Year2: 450000, Year3: 1500000, percentY1: "10%", percentY3: "20%" },
    { name: "Support SLAs", Year1: 50000, Year2: 240000, Year3: 750000, percentY1: "5%", percentY3: "10%" },
    { name: "Certification", Year1: 50000, Year2: 120000, Year3: 375000, percentY1: "5%", percentY3: "5%" },
    { name: "Training", Year1: 50000, Year2: 900000, Year3: 375000, percentY1: "5%", percentY3: "5%" }
  ];

  // Calculate overall platform revenue sum
  const totalRejectionsY1 = 1000000;
  const totalRejectionsY2 = 3000000;
  const totalRejectionsY3 = 7500000;

  // T&M Estimator calculation
  const calculatedTMValue = useMemo(() => {
    const rulesCost = estRules * 2500;
    const integrationCost = estIntegrationHours * 250;
    const pipelineCost = estPipelineHours * 250;
    const migrationCost = estMigrationHours * 200;
    return rulesCost + integrationCost + pipelineCost + migrationCost;
  }, [estRules, estIntegrationHours, estPipelineHours, estMigrationHours]);

  return (
    <div className={`min-h-screen pt-20 pb-28 ${isDarkMode ? 'bg-zinc-950 text-stone-300' : 'bg-stone-50 text-stone-800'}`}>
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Header Block Banner */}
        <div className="mb-14 border-b pb-8 border-stone-200 dark:border-zinc-900 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-brand-accent text-xs font-bold uppercase tracking-[0.3em] mb-3">
              <Layers size={14} /> Formal Capability Suite
            </div>
            <h1 className={`text-4xl md:text-5xl font-black tracking-tight mb-4 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              Phase Mirror Services Catalog
            </h1>
            <p className={`text-base md:text-lg leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              Addressing the complete lifecycle of structural AI governance. Move from initial strategic alignment 
              diagnostics towards enterprise seat scaling, continuous pipeline validation, and compliance certifications.
            </p>
          </div>
          <div className={`px-4 py-3 rounded-2xl border text-xs font-mono font-bold flex items-center gap-2 shrink-0 ${
            isDarkMode ? 'bg-zinc-900/60 border-stone-800' : 'bg-white shadow-xs border-stone-200'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Land & Expand System: v1.07</span>
          </div>
        </div>

        {/* Dynamic Navigation Tabs (Enterprise Dashboard style) */}
        <div className="mb-10 flex flex-wrap gap-1 p-1 rounded-2xl bg-stone-200/50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-850">
          {[
            { id: 'consulting', label: 'I. Strategic Consulting', icon: <Briefcase size={16} /> },
            { id: 'saas_compliance', label: 'II. SaaS & Compliance Packs', icon: <Cpu size={16} /> },
            { id: 'implementation_ops', label: 'III. Implementation & T&M', icon: <Settings size={16} /> },
            { id: 'academy_exams', label: 'IV. Academy & Credentials', icon: <GraduationCap size={16} /> },
            { id: 'gtm_financials', label: 'V. Finance & GTM', icon: <TrendingUp size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-brand-accent/20 text-[#2dd4bf] dark:text-[#2dd4bf] shadow-md border border-[#2dd4bf]/20'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Tab View Frame */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
            className="space-y-10"
          >

            {/* TAB 1: STRATEGIC CONSULTING */}
            {activeTab === 'consulting' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Column Left (Diagnostic + Interactive Timelines) */}
                <div className="lg:col-span-8 space-y-8">
                  
                  {/* Flagship AI Governance Diagnostic Card */}
                  <div className={`p-8 rounded-[2.5rem] border ${
                    isDarkMode ? 'bg-zinc-950 border-stone-850' : 'bg-white shadow-md border-stone-200/80'
                  }`}>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-[10px] font-mono uppercase bg-[#2dd4bf]/10 text-[#2dd4bf] px-2.5 py-1 rounded font-extrabold tracking-wider">
                          Flagship Strategic Engagement
                        </span>
                        <h2 className={`text-2xl font-black tracking-tight mt-3 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                          A. AI Governance Diagnostic
                        </h2>
                      </div>
                      <div className="text-right">
                        <span className="text-stone-500 text-xs font-bold uppercase font-mono block">Estimated Fee</span>
                        <span className="text-[#2dd4bf] font-black text-xl font-mono">{diagnosticData[diagnosticOrgSize].fee}</span>
                      </div>
                    </div>

                    <p className={`text-sm mb-6 leading-relaxed font-semibold ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      <strong>Purpose:</strong> Surface the productive contradictions between AI autonomy and enterprise governance requirements. 
                      Translating high-level abstract risk policies into concrete, mathematically auditable mechanical levers and control metrics.
                    </p>

                    <div className="p-4 rounded-2xl bg-brand-accent/[0.04] border border-brand-accent/15 text-xs mb-8">
                      <strong>Diagnostic Methodology:</strong> Extract Target Invariants &rarr; Map Semantic Tensions &rarr; Rank Risk Matrices &rarr; Produce Concrete Lever Output &rarr; Bind Precision Questions.
                    </div>

                    {/* Interactive Organization Selector */}
                    <div className="mb-6">
                      <span className="text-xs font-bold text-stone-400 block mb-3 uppercase tracking-wider">Select Organization Structure:</span>
                      <div className="grid grid-cols-3 gap-3">
                        {(['mid', 'ent', 'global'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => setDiagnosticOrgSize(size)}
                            className={`p-3 rounded-xl text-center border font-bold text-xs transition-colors duration-250 cursor-pointer ${
                              diagnosticOrgSize === size
                                ? 'bg-brand-accent/10 border-brand-accent text-white font-extrabold'
                                : 'border-stone-800 bg-transparent text-stone-500 hover:text-stone-300'
                            }`}
                          >
                            <span className="block font-black uppercase text-[10px]">{diagnosticData[size].label}</span>
                            <span className="text-[9px] font-mono font-medium block text-stone-500 mt-1">{diagnosticData[size].employees}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Diagnostic Timeline */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-800/10 dark:border-stone-850 pb-2">
                        {diagnosticData[diagnosticOrgSize].duration} Planned Delivery Timeline
                      </h4>
                      <div className="divide-y divide-stone-800/20 dark:divide-stone-850">
                        {diagnosticData[diagnosticOrgSize].timeline.map((step, i) => (
                          <div key={i} className="py-2.5 flex flex-col md:flex-row md:items-baseline justify-between gap-2 text-xs">
                            <span className="font-mono text-[#2dd4bf] font-black w-24 shrink-0 uppercase tracking-wider">{step.phase}</span>
                            <span className={`font-semibold md:w-48 shrink-0 ${isDarkMode ? 'text-stone-100' : 'text-stone-900'}`}>{step.task}</span>
                            <span className="text-stone-500 font-medium grow md:text-right">{step.deliverable}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Compliance Accuracy Tradeoff Workshop */}
                  <div className={`p-8 rounded-[2.5rem] border ${
                    isDarkMode ? 'bg-zinc-950 border-stone-850' : 'bg-white shadow-md border-stone-200/80'
                  }`}>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded font-extrabold tracking-wider">
                          Executive Policy Calibration
                        </span>
                        <h2 className={`text-2xl font-black mt-3 tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                          B. Compliance-Accuracy Tradeoff Workshop
                        </h2>
                      </div>
                      <div className="text-right">
                        <span className="text-stone-500 text-xs font-bold uppercase font-mono block">Facilitation</span>
                        <span className="text-amber-500 font-black text-lg font-mono">$35,000–$50,000</span>
                      </div>
                    </div>

                    <p className={`text-sm mb-6 leading-relaxed font-semibold ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      <strong>Does the agent optimize for the most accurate outcome or the most compliant one?</strong> This is not a trivial technology configuration—it is the defining governance choice that dictates legal liability architecture. This 2-day facilitated intensive ensures this foundational tradeoff is debated, mapped, and committed directly into system policy.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-black border-stone-850' : 'bg-stone-50 border-stone-100'}`}>
                        <div className="flex justify-between items-baseline mb-2">
                          <strong className="text-[#2dd4bf] block tracking-wide font-mono">DAY 1 Focus</strong>
                          <span className="text-[10px] bg-stone-850 p-0.5 px-1.5 rounded text-stone-500">Mapping</span>
                        </div>
                        <p className="text-stone-500 mb-3 font-semibold text-[11px]">Map legacy AI system surfaces, identify core liability exposures, and expose deep metric tension points.</p>
                        <hr className="border-stone-800/10 dark:border-stone-850/40 my-2" />
                        <span className={`block font-bold ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>Deliverable Artifacts:</span>
                        <span className="text-stone-500 font-medium block mt-0.5">• Active AI Systems inventory list, Risk heat mapping vector matrix</span>
                      </div>

                      <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-black border-stone-850' : 'bg-stone-50 border-stone-100'}`}>
                        <div className="flex justify-between items-baseline mb-2">
                          <strong className="text-[#2dd4bf] block tracking-wide font-mono">DAY 2 Focus</strong>
                          <span className="text-[10px] bg-stone-850 p-0.5 px-1.5 rounded text-stone-500">Codification</span>
                        </div>
                        <p className="text-stone-500 mb-3 font-semibold text-[11px]">Define acceptable system error budgets, escalation protocols, and hard-lined compliance override rules.</p>
                        <hr className="border-stone-800/10 dark:border-stone-850/40 my-2" />
                        <span className={`block font-bold ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>Deliverable Artifacts:</span>
                        <span className="text-stone-500 font-medium block mt-0.5">• Phase Mirror policy document, raw exception handler specification yml</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Column Right (Advisory retainers, terms & positioning) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Advisory Retainer Card Selector */}
                  <div className={`p-6 rounded-[2.5rem] border ${
                    isDarkMode ? 'bg-zinc-950 border-stone-850' : 'bg-white shadow-md border-stone-200/80'
                  }`}>
                    <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-stone-400 block mb-2 font-extrabold">// SECTION I.C</span>
                    <h3 className={`text-xl font-black mb-4 tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      Advisory Retainers
                    </h3>
                    <p className={`text-xs leading-relaxed mb-6 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      Ongoing expert advisory for mature entities seeking continuous strategic oversight and ad-hoc dispute triage counseling.
                    </p>

                    {/* Retainer selector options */}
                    <div className="space-y-3 mb-6">
                      {Object.entries(retainerData).map(([key, data]) => (
                        <div
                          key={key}
                          onClick={() => setSelectedRetainer(key as 'advisor' | 'partner' | 'board')}
                          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${
                            selectedRetainer === key
                              ? 'bg-[#2dd4bf]/10 border-[#2dd4bf]/40'
                              : 'hover:bg-stone-950/20 border-transparent bg-[#111112]/20 dark:bg-[#1a1a1c]/20'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-extrabold text-xs text-white">{data.title}</span>
                            <span className="font-mono text-[#2dd4bf] font-black text-xs">{data.fee}</span>
                          </div>
                          <span className="text-[10px] text-stone-500 font-semibold block leading-tight">{data.access}</span>
                          {selectedRetainer === key && (
                            <div className="mt-3 pt-3 border-t border-[#2dd4bf]/15 text-[10px] text-stone-400 flex justify-between">
                              <span>SLA Delay: <strong>{data.response}</strong></span>
                              <span className="text-[#2dd4bf] font-bold font-mono">Yield: 5X</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-black border border-stone-900 text-[11px] space-y-2">
                      <div className="flex justify-between font-mono">
                        <span className="text-stone-500">Contract Invariant:</span>
                        <span className="text-[#2dd4bf] font-extrabold">Standard Terms</span>
                      </div>
                      <p className="text-stone-500 font-medium">
                        Advisory retainers maintain a strict **6-month minimum commitment**, subject to standard **90-day written termination notices**.
                      </p>
                      <hr className="border-stone-900/60 my-1" />
                      <p className="text-amber-500/80 font-bold font-mono text-[9px] uppercase tracking-wider">
                        ★ VALUE POSITIONING (THE 5X RULE):
                      </p>
                      <p className="text-stone-500 leading-snug">
                        Every dollar committed to continuous governance must yield at least five-fold returns ($5x) via mitigated platform downtime liability and expedited pipeline throughput.
                      </p>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: SAAS & COMPLIANCE PACKS */}
            {activeTab === 'saas_compliance' && (
              <div className="space-y-10">

                {/* Introductory Banner */}
                <div className={`p-8 rounded-[2.5rem] border ${
                  isDarkMode ? 'bg-zinc-950 border-stone-850' : 'bg-white border-stone-200 shadow-md'
                }`}>
                  <span className="text-[10px] font-mono uppercase bg-[#2dd4bf]/10 text-[#2dd4bf] px-2.5 py-1 rounded font-extrabold tracking-wider">
                    SaaS & Open-Core Infrastructure
                  </span>
                  <h2 className={`text-2xl font-black mt-3 tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    II. Open-Core Platform Services
                  </h2>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    The Phase Mirror Oracle forms the open-source technical core—a compiler and CLI utility that outputs auditable, deterministic dissonance mapping.
                    Hosted services follow a secure open-core subscription paradigm designed to keep production analytical servers federated and isolated.
                  </p>
                </div>

                {/* SaaS Tier Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { key: 'community', title: 'Community', price: 'Free', target: 'Developers, Small Teams', desc: 'Core CLI constraints, Apache 2.0 self-hosted baseline.' },
                    { key: 'team', title: 'Team', price: '$6,000/yr', target: 'SaaS, High-Growth Startups', desc: '10 developer seats, basic cloud event dashboard, 24h support SLA.' },
                    { key: 'business', title: 'Business', price: '$36,000/yr', target: 'Mid-Market Operations', desc: '50 developer seats, full custom rules index, SSO, 4h priority assistance.' },
                    { key: 'enterprise', title: 'Enterprise', price: 'Custom ($100k+)', target: 'Global Fortune 500', desc: 'Unlimited developer seats, dedicated physically host isolates, TAM, 1h emergency SLA.' }
                  ].map((tier) => (
                    <div
                      key={tier.key}
                      onClick={() => setSelectedTier(tier.key as any)}
                      className={`p-6 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        selectedTier === tier.key
                          ? 'bg-[#2dd4bf]/5 border-[#2dd4bf] shadow-md ring-1 ring-[#2dd4bf]/20'
                          : 'bg-zinc-950/20 dark:bg-zinc-900/10 border-stone-200 dark:border-stone-850 hover:border-stone-750'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                          <span className={`text-sm font-black uppercase tracking-tight ${selectedTier === tier.key ? 'text-white' : 'text-stone-300'}`}>
                            {tier.title}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-stone-500 text-right">{tier.target}</span>
                        </div>
                        <h4 className="text-2xl font-mono font-black text-[#2dd4bf]">{tier.price}</h4>
                        <p className="text-[11px] text-stone-500 font-semibold leading-relaxed">{tier.desc}</p>
                      </div>
                      <div className="pt-4 border-t border-stone-850/60 mt-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center">
                        {selectedTier === tier.key ? '★ Selected Tier' : 'Select to inspect'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* SaaS Feature Matrix Grid */}
                <div className={`border rounded-[2.5rem] overflow-hidden ${
                  isDarkMode ? 'border-stone-850 bg-black/40' : 'border-stone-200 bg-stone-50 shadow-sm'
                }`}>
                  <div className="p-6 border-b border-stone-850 text-xs flex justify-between items-center bg-zinc-950/50">
                    <div>
                      <strong className="text-white block">Oracle Interactive Platform Matrix</strong>
                      <span className="text-stone-500">Highlighting features matching our current tier parameters.</span>
                    </div>
                    <span className="text-[9px] font-mono uppercase bg-brand-accent/20 p-1.5 px-3 rounded text-brand-accent font-black">
                      Active: {selectedTier.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-stone-850 bg-black/20 text-stone-400 text-[10px] tracking-wider uppercase">
                          <th className="p-4 pl-6">Capabilities Vector</th>
                          <th className="p-4">Community</th>
                          <th className="p-4">Team</th>
                          <th className="p-4">Business</th>
                          <th className="p-4 pr-6">Enterprise</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-850/30 text-[11px] font-medium text-stone-400">
                        {saasFeatures.map((feat, i) => (
                          <tr key={i} className="hover:bg-stone-900/5">
                            <td className="p-4 pl-6">
                              <span className="font-bold text-stone-200 block">{feat.name}</span>
                              <span className="text-[9.5px] text-stone-550 block font-semibold">{feat.scope}</span>
                            </td>
                            
                            {/* Community Render */}
                            <td className={`p-4 ${selectedTier === 'community' ? 'bg-[#2dd4bf]/5 font-bold text-[#2dd4bf]' : ''}`}>
                              {typeof feat.community === 'boolean' ? (
                                feat.community ? <Check size={16} className="text-emerald-500" /> : <X size={16} className="text-stone-650" />
                              ) : feat.community}
                            </td>

                            {/* Team Render */}
                            <td className={`p-4 ${selectedTier === 'team' ? 'bg-[#2dd4bf]/5 font-bold text-[#2dd4bf]' : ''}`}>
                              {typeof feat.team === 'boolean' ? (
                                feat.team ? <Check size={16} className="text-emerald-500" /> : <X size={16} className="text-stone-650" />
                              ) : feat.team}
                            </td>

                            {/* Business Render */}
                            <td className={`p-4 ${selectedTier === 'business' ? 'bg-[#2dd4bf]/5 font-bold text-[#2dd4bf]' : ''}`}>
                              {typeof feat.business === 'boolean' ? (
                                feat.business ? <Check size={16} className="text-emerald-500" /> : <X size={16} className="text-stone-650" />
                              ) : typeof feat.business === 'string' && feat.business.includes('3') ? (
                                <span className="text-emerald-400">{feat.business}</span>
                              ) : feat.business}
                            </td>

                            {/* Enterprise Render */}
                            <td className={`p-4 pr-6 ${selectedTier === 'enterprise' ? 'bg-[#2dd4bf]/5 font-bold text-[#2dd4bf]' : ''}`}>
                              {typeof feat.enterprise === 'boolean' ? (
                                feat.enterprise ? <Check size={16} className="text-emerald-500" /> : <X size={16} className="text-stone-650" />
                              ) : <span className="text-emerald-400">{feat.enterprise}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* section II.A: Compliance Packs (Add-On Modules) */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-[#2dd4bf]/10 text-[#2dd4bf] p-1 px-2 rounded font-extrabold">
                      II.A Add-On Modules
                    </span>
                    <h3 className={`text-xl font-black tracking-tight mt-3 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      Sovereign Compliance Packs
                    </h3>
                    <p className="text-xs text-stone-500 font-semibold mt-1">
                      Proprietary industrial extensions licensed separately from the open-core base, enabling industry-specific validation schemas.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {[
                      { title: "AI Governance Essentials", price: "$12,000/yr", content: "NIST AI risk management framework mapping, ISO 42001 system alignments, baseline audit workbook templates." },
                      { title: "Financial Services", price: "$25,000/yr", content: "SEC algorithmic model disclosures, banking model risk controls (SR 11-7 validation), fair-lending invariant suites." },
                      { title: "Healthcare & Life Sciences", price: "$25,000/yr", content: "HIPAA analytical data pipelines, FDA SaMD Software-as-Medical-Device guidance mapping, medical decision controls." },
                      { title: "EU AI Act Readiness", price: "$30,000/yr", content: "High-risk system classification audit tools, automated conformity assessment logs, compliance registry templates." },
                      { title: "Agentic AI Governance", price: "$35,000/yr", content: "Autonomy-vs-governance tension checks, stochastic output threshold bounds, liability ownership tier specs." }
                    ].map((pack, i) => (
                      <div key={i} className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0f0f11] border-stone-850' : 'bg-white border-stone-200'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <strong className="text-white dark:text-white text-xs font-bold leading-tight block pr-2">{pack.title}</strong>
                          <span className="text-[#2dd4bf] font-mono text-[10px] font-bold shrink-0">{pack.price}</span>
                        </div>
                        <p className={`text-[10.5px] leading-relaxed ${isDarkMode ? 'text-stone-500': 'text-stone-500'} font-medium`}>
                          {pack.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* section II.B: Enterprise Seat Bundles */}
                <div className="space-y-4 pt-6 border-t border-stone-850/40">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-500 p-1 px-2 rounded font-extrabold">
                      II.B Pack Bundles
                    </span>
                    <h3 className={`text-xl font-black tracking-tight mt-3 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      Enterprise Seat Bundles
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { title: "Governance Starter", seats: "25 Seats", platform: "Business Tier", packs: "1 Pack Included", support: "Standard Support SLA", price: "$60,000/year" },
                      { title: "Compliance Pro", seats: "100 Seats", platform: "Business Tier", packs: "2 Packs Included", support: "Priority Support SLA", price: "$150,000/year" },
                      { title: "Enterprise Unlimited", seats: "Unlimited Seats", platform: "Enterprise ISO Core", packs: "All Packs Included", support: "Technical Account Manager (TAM)", price: "$350,000+ /year" }
                    ].map((pack, idx) => (
                      <div key={idx} className={`p-6 rounded-[2rem] border relative overflow-hidden ${
                        isDarkMode ? 'bg-zinc-950 border-stone-850' : 'bg-white shadow-xs border-stone-200'
                      }`}>
                        <div className="flex justify-between items-baseline mb-4">
                          <strong className="text-white font-extrabold text-sm">{pack.title}</strong>
                          <span className="text-amber-500 font-mono text-xs font-black">{pack.price}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-stone-500 uppercase font-mono">
                          <div className="p-2 bg-black/40 rounded border border-stone-900/65">{pack.seats}</div>
                          <div className="p-2 bg-black/40 rounded border border-stone-900/65">{pack.platform}</div>
                          <div className="p-2 bg-black/40 rounded border border-stone-900/65">{pack.packs}</div>
                          <div className="p-2 bg-black/40 rounded border border-stone-900/65">{pack.support}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: IMPLEMENTATION & SERVICES */}
            {activeTab === 'implementation_ops' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Deployment Packages Card */}
                <div className="lg:col-span-8 space-y-8">
                  
                  {/* Platform Impl packages */}
                  <div className={`p-8 rounded-[2.5rem] border ${
                    isDarkMode ? 'bg-zinc-950 border-stone-850' : 'bg-white border-stone-200 shadow-md'
                  }`}>
                    <span className="text-[10px] font-mono uppercase bg-[#2dd4bf]/10 text-[#2dd4bf] px-2.5 py-1 rounded font-extrabold tracking-wider">
                      Fixed-Price Operational Delivery
                    </span>
                    <h2 className={`text-2xl font-black mt-3 tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      III.A Platform Integration & Deployment
                    </h2>
                    <p className={`text-sm leading-relaxed mb-6 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      We translate diagnostic strategy into working code pipelines. These predefined implementation 
                      packages deploy the Phase Mirror Oracle, establish runtime invariants, and tie audits directly into existing VCS checkruns.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { title: "Starter", scope: "Single build repository, 5 core rule maps, GitHub Actions CI integration.", price: "$15,000", timeline: "2 Weeks" },
                        { title: "Professional", scope: "Multi-repo structure codebase, custom rule design (3 invariants), dynamic Terraform pipeline infrastructure.", price: "$45,000", timeline: "4–6 Weeks" },
                        { title: "Enterprise", scope: "Corporate-wide deployment, unified SSO identity, 10 custom organization rules, isolated cluster deployment environments.", price: "$120,000–$200,000", timeline: "8–12 Weeks" }
                      ].map((pkg, idx) => (
                        <div key={idx} className={`p-5 rounded-2xl border flex flex-col justify-between ${
                          isDarkMode ? 'bg-black border-stone-850' : 'bg-stone-50 border-stone-150'
                        }`}>
                          <div className="space-y-2">
                            <div className="flex justify-between items-baseline mb-2">
                              <strong className="text-[#2dd4bf] text-xs font-bold font-mono">{pkg.title}</strong>
                              <span className="text-[9px] bg-stone-850 p-0.5 px-2 rounded text-stone-500 font-bold">{pkg.timeline}</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-stone-500 font-semibold">{pkg.scope}</p>
                          </div>
                          <div className="pt-4 border-t border-stone-850/60 mt-4 flex justify-between items-end">
                            <span className="text-stone-600 font-mono text-[9px] uppercase font-bold">Flat Price</span>
                            <span className="text-white dark:text-white font-black text-xs font-mono">{pkg.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 p-4 rounded-xl border border-dashed border-stone-800 text-[10.5px] text-stone-500 text-center uppercase tracking-widest font-bold">
                      Delivery Milestone Framework: 30% Initiation fee • 40% Midpoint verification • 30% Acceptance approval
                    </div>

                  </div>

                  {/* Operational Framework Development Checklist */}
                  <div className={`p-8 rounded-[2.5rem] border ${
                    isDarkMode ? 'bg-zinc-950 border-stone-850' : 'bg-white border-stone-200 shadow-md'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded font-extrabold tracking-wider">
                          Section III.B Governance Mechanics
                        </span>
                        <h3 className={`text-xl font-black mt-3 tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                          B. Governance Framework Development
                        </h3>
                      </div>
                      <span className="text-amber-500 font-mono text-xs font-black py-1 px-3 bg-amber-500/10 rounded">
                        $50,000–$150,000
                      </span>
                    </div>
                    <p className={`text-xs mb-6 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      Building the underlying legal-technical structures required to enforce compliance bounds consistently:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      {[
                        { title: "1. Spec Document Spec", desc: "Formally declares boundaries for tolerable system performance discrepancies vs critical policy violation thresholds." },
                        { title: "2. Liability Tier Contracts", desc: "Establishes structured accountability agreements boundary mapping legal risk between developers and platform providers." },
                        { title: "3. Service Level Commitments", desc: "Strict commitments outlining auditable proof generation speed, accuracy pipelines, and explainability standards." },
                        { title: "4. Automated Kill-Switch Maps", desc: "Pre-approved automation trigger limits defining automatic rollbacks and deployment blocks." },
                        { title: "5. Dataset Adequacy Requirements", desc: "Verification criteria scoring absolute model validity and testing against systemic drift patterns." }
                      ].map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <CheckCircleIcon className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                          <div>
                            <strong className="text-white dark:text-white block">{item.title}</strong>
                            <p className="text-stone-500 text-[10.5px] leading-snug">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Column Right (Time & Materials Estimator and TAM guidelines) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Dynamic Cost Estimator card */}
                  <div className={`p-6 rounded-[2.5rem] border ${
                    isDarkMode ? 'bg-zinc-950 border-stone-850' : 'bg-white border-stone-200 shadow-md'
                  }`}>
                    <div className="flex gap-1 items-center text-[10px] uppercase font-mono text-stone-500 tracking-wider">
                      <Calculator size={13} /> Time & Materials Custom Estimator
                    </div>
                    <h3 className={`text-lg font-black mt-3 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      III.C Custom Scope Calculator
                    </h3>
                    <p className="text-stone-500 text-[10px] font-semibold leading-relaxed mb-6 block">
                      Estimate custom continuous calibration, legacy migrations, and custom rule design services dynamically based on expected allocations:
                    </p>

                    <div className="space-y-4">
                      {/* Slider Custom Rule */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-stone-400 font-bold">Custom Rules ($2,500/ea)</span>
                          <span className="font-mono text-white font-extrabold">{estRules}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={estRules}
                          onChange={(e) => setEstRules(parseInt(e.target.value))}
                          className="w-full accent-[#2dd4bf] h-1 bg-stone-900 rounded"
                        />
                      </div>

                      {/* Slider 2 Integration hours */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-stone-400 font-bold">Integration hours ($250/h)</span>
                          <span className="font-mono text-white font-extrabold">{estIntegrationHours}h</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="80"
                          step="5"
                          value={estIntegrationHours}
                          onChange={(e) => setEstIntegrationHours(parseInt(e.target.value))}
                          className="w-full accent-[#2dd4bf] h-1 bg-stone-900 rounded"
                        />
                      </div>

                      {/* Slider 3 Pipeline configuration hours */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-stone-400 font-bold">Pipeline Tuning ($250/h)</span>
                          <span className="font-mono text-white font-extrabold">{estPipelineHours}h</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="80"
                          step="5"
                          value={estPipelineHours}
                          onChange={(e) => setEstPipelineHours(parseInt(e.target.value))}
                          className="w-full accent-[#2dd4bf] h-1 bg-stone-900 rounded"
                        />
                      </div>

                      {/* Slider 4 Legacy migration hours */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-stone-400 font-bold">Legacy Migration ($200/h)</span>
                          <span className="font-mono text-white font-extrabold">{estMigrationHours}h</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="80"
                          step="5"
                          value={estMigrationHours}
                          onChange={(e) => setEstMigrationHours(parseInt(e.target.value))}
                          className="w-full accent-[#2dd4bf] h-1 bg-stone-900 rounded"
                        />
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-stone-850/80 flex justify-between items-baseline">
                      <span className="text-stone-500 font-mono text-[9px] uppercase font-bold">Estimated Cost:</span>
                      <span className="text-[#2dd4bf] font-black text-xl font-mono">${calculatedTMValue.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* TAM spotlight card */}
                  <div className={`p-6 rounded-[2.5rem] border ${
                    isDarkMode ? 'bg-[#0f0f12] border-stone-850' : 'bg-stone-50 border-stone-200'
                  }`}>
                    <div className="flex gap-1.5 items-center text-[9px] uppercase tracking-wider text-amber-500 font-bold font-mono">
                      <Sparkles size={12} className="text-amber-500" /> Dedicated Enterprise Resource
                    </div>
                    <h3 className="text-zinc-150 dark:text-white font-extrabold text-sm mt-3 mb-2">Technical Account Manager (TAM)</h3>
                    <p className="text-[10px] text-stone-500 leading-normal mb-4 font-semibold">
                      For premium Enterprise customers, a dedicated senior engineer is allocated as a direct operational partner:
                    </p>
                    <ul className="space-y-2 text-[10px] text-stone-500 font-semibold list-disc list-inside">
                      <li>Serves as your primary infrastructure liaison and emergency conduit.</li>
                      <li>Develops full understanding of localized VCS rules and CI frameworks.</li>
                      <li>Tracks custom rules index adjustments and schedules quarterly rollups.</li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-stone-850/60 flex justify-between text-[10px] font-mono">
                      <span className="text-stone-500">Standalone Pricing:</span>
                      <span className="text-amber-500 font-bold">$48,000/year</span>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 4: ACADEMY & CERTIFICATIONS */}
            {activeTab === 'academy_exams' && (
              <div className="space-y-10">
                
                {/* Intro section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.4em] text-[#2dd4bf] block mb-4">VI. CNCF-Modeled Standard Certification</span>
                    <h2 className={`text-3xl font-black mb-4 tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      Phase Mirror Academy & Credentials
                    </h2>
                    <p className={`text-sm leading-relaxed font-semibold ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      Certification pathways generate long-term industry credibility, platform optimization compliance-checks, and broad operational consistency. Following CNCF specifications, we deliver both personal developer-level certs and formal organizational implementation certs.
                    </p>
                  </div>
                  
                  {/* Visually stunning certification path */}
                  <div className={`p-6 rounded-[2.5rem] border ${
                    isDarkMode ? 'bg-zinc-950 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
                  }`}>
                    <span className="text-[9px] font-mono text-stone-500 uppercase font-black block mb-4">Official Practitioner Certification Pipeline</span>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-[10px] text-center uppercase tracking-wider font-extrabold text-stone-400">
                      
                      <div className="p-3 bg-black border border-stone-900 w-full md:w-32 rounded-xl">
                        <span className="text-stone-500 text-[8px] block">Level 1 // Entry</span>
                        <span className="text-white">PMA</span>
                        <span className="text-[8px] text-stone-550 block mt-1">Associate</span>
                      </div>

                      <ChevronRight className="rotate-90 md:rotate-0 text-[#2dd4bf]" size={16} />

                      <div className="p-3 bg-black border border-stone-950 w-full md:w-32 rounded-xl ring-1 ring-[#2dd4bf]/20">
                        <span className="text-[#2dd4bf] text-[8px] block">Level 2 // Expert</span>
                        <span className="text-white">CPMP</span>
                        <span className="text-[8px] text-[#2dd4bf] block mt-1">Practitioner</span>
                      </div>

                      <ChevronRight className="rotate-90 md:rotate-0 text-[#2dd4bf]" size={16} />

                      <div className="p-3 bg-black border border-stone-900 w-full md:w-32 rounded-xl">
                        <span className="text-stone-500 text-[8px] block">Level 3 // Leader</span>
                        <span className="text-white">CPMA</span>
                        <span className="text-[8px] text-stone-550 block mt-1">Architect</span>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Credentials grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Category A: Practitioner Credentials */}
                  <div className={`p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-zinc-950 border-stone-850' : 'bg-white border-stone-200 shadow-sm'}`}>
                    <div className="flex items-center gap-2 mb-6 text-xs text-stone-500 uppercase font-mono font-bold">
                      <Award className="text-[#2dd4bf]" size={16} /> Level VI.A - Individual Standards
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { title: "Phase Mirror Associate (PMA)", fee: "$395", audience: "Governance analysts, QA directors, audit staff", details: "Online MCQ • 90 Minutes exam window limit", renewal: "Annual ($195)" },
                        { title: "Certified Phase Mirror Practitioner (CPMP)", fee: "$595", audience: "Senior engineers, compliance leads, DevOps professionals", details: "Scenario-based simulation sandbox environment • 2 Hours", renewal: "Biennial ($295)" },
                        { title: "Certified Phase Mirror Architect (CPMA)", fee: "$995", audience: "Federated architects, directors, governance officers", details: "Full sandbox execution panel • 3 Hours interactive exam", renewal: "Biennial ($495)" }
                      ].map((cert, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-black/40 border border-stone-900/60 flex flex-col justify-between gap-3">
                          <div className="flex justify-between items-baseline">
                            <span className="font-extrabold text-white text-xs leading-snug">{cert.title}</span>
                            <span className="text-[#2dd4bf] font-mono text-xs font-black">{cert.fee}</span>
                          </div>
                          <p className="text-[10px] text-stone-500 leading-normal font-semibold font-sans">
                            <strong>Target Audience:</strong> {cert.audience} <br />
                            <strong>Format:</strong> {cert.details}
                          </p>
                          <div className="pt-2 border-t border-stone-900/50 flex justify-between font-mono text-[9px] text-stone-500 uppercase font-extrabold">
                            <span>Renewal cadence:</span>
                            <span className="text-[#2dd4bf]">{cert.renewal}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category B: Vendor / Organization Certifications */}
                  <div className={`p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-zinc-950 border-stone-850' : 'bg-white border-stone-200 shadow-sm'}`}>
                    <div className="flex items-center gap-2 mb-6 text-xs text-stone-500 uppercase font-mono font-bold">
                      <Scale className="text-amber-500" size={16} /> Level VI.B - Implementation Licenses
                    </div>

                    <div className="space-y-4">
                      {[
                        { title: "Certified Implementation", fee: "$5,000 /yr", audience: "AI product vendors & software platforms", req: "Must pass automated test suite framework, annual security registry verification audit." },
                        { title: "Certified Consulting Partner", fee: "$10,000 /yr", audience: "Systems integration teams, IT counseling boutiques", req: "Requires at least 2 certified CPMPs on active staff rolls, 1 approved client project peer-review." },
                        { title: "Certified Training Provider", fee: "$7,500 /yr", audience: "Corporate education firms & public trainers", req: "Course curriculum mapping verification, direct instructor vetting panel checks." }
                      ].map((cert, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-black/40 border border-stone-900/60 flex flex-col justify-between gap-3">
                          <div className="flex justify-between items-baseline">
                            <span className="font-extrabold text-white text-xs leading-snug">{cert.title}</span>
                            <span className="text-amber-400 font-mono text-xs font-black">{cert.fee}</span>
                          </div>
                          <p className="text-[10px] text-stone-500 leading-normal font-semibold">
                            <strong>Target Entity:</strong> {cert.audience} <br />
                            <strong>Audited Bounds:</strong> {cert.req}
                          </p>
                          <div className="pt-2 border-t border-stone-900/50 flex justify-between font-mono text-[9px] text-stone-500 uppercase font-bold">
                            <span>Rights mapping:</span>
                            <span className="text-amber-400">Phase Mirror Certified Trademark Seal</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section VII - Courses Catalog and corporate subscriptions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-stone-850/40 pt-10">
                  
                  {/* Left (Courses List) */}
                  <div className="lg:col-span-8 space-y-4">
                    <div>
                      <span className="text-[9px] font-mono uppercase bg-[#2dd4bf]/10 text-[#2dd4bf] p-1 px-2.5 rounded font-extrabold tracking-wider">
                        VII.A Training Catalog
                      </span>
                      <h3 className={`text-xl font-black mt-3 mb-1 tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        Educational Courses Index
                      </h3>
                    </div>

                    <div className="overflow-x-auto border border-stone-850 rounded-2xl bg-stone-950/25">
                      <table className="w-full text-xs text-left text-stone-400">
                        <thead>
                          <tr className="border-b border-stone-850 bg-black/40 uppercase text-[9px] tracking-wider text-stone-550 font-bold">
                            <th className="p-3 pl-4">Course Identifier</th>
                            <th className="p-3">Method</th>
                            <th className="p-3">Hours</th>
                            <th className="p-3">User Price</th>
                            <th className="p-3 pr-4 text-right">Corporate Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-850/30 text-[10.5px]">
                          {[
                            { name: "PMD Foundations", format: "Self-paced LMS", hours: "8 hours", indVal: "$299", corpVal: "$199/seat (min 10)" },
                            { name: "Applied Phase Mirror for AI Governance", format: "Virtual Instructor-led", hours: "2 days", indVal: "$1,495", corpVal: "$1,195/seat (min 5)" },
                            { name: "Phase Mirror Implementation Workshop", format: "Interactive Hands-on", hours: "3 days", indVal: "$2,495", corpVal: "$1,995/seat (min 5)" },
                            { name: "Executive AI Governance Briefing", format: "Private Facilitated", hours: "Half-day", indVal: "N/A", corpVal: "$15,000 flat rate" },
                            { name: "PMA Prep Course", format: "Self-paced prep suite", hours: "4 hours", indVal: "$149", corpVal: "$99/seat (min 20)" },
                            { name: "CPMP Prep Course", format: "Interactive seminar", hours: "1 day", indVal: "$495", corpVal: "$395/seat (min 10)" }
                          ].map((course, idx) => (
                            <tr key={idx} className="hover:bg-stone-900/5">
                              <td className="p-3 pl-4 font-bold text-white leading-snug">{course.name}</td>
                              <td className="p-3 font-semibold text-stone-500">{course.format}</td>
                              <td className="p-3 font-mono font-medium text-stone-400">{course.hours}</td>
                              <td className="p-3 font-mono text-emerald-400">{course.indVal}</td>
                              <td className="p-3 pr-4 text-right font-mono text-stone-300">{course.corpVal}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right (Corporate subsidies) */}
                  <div className="lg:col-span-4 space-y-4">
                    <div>
                      <span className="text-[9px] font-mono uppercase bg-amber-500/10 text-amber-500 p-1 px-2.5 rounded font-extrabold tracking-wider">
                        VII.B Subscriptions
                      </span>
                      <h3 className={`text-xl font-black mt-3 mb-1 tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        Corporate Subscriptions
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {[
                        { title: "Team Pack", fee: "$5,000/yr", contents: "10 LMS Seats, unlimited self-paced access, 5 official PMA exam vouchers." },
                        { title: "Department Pack", fee: "$15,000/yr", contents: "50 LMS Seats, all self-paced tools, 2 live ILT workshops, 20 PMA exam vouchers." },
                        { title: "Enterprise Unlimited", fee: "$50,000+ /yr", contents: "Unlimited LMS accounts, full training library, custom workshops, 50 CPMP + PMA vouchers." }
                      ].map((sub, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl border ${
                          isDarkMode ? 'bg-[#0f0f11] border-stone-850' : 'bg-white border-stone-200 shadow-xs'
                        }`}>
                          <div className="flex justify-between items-baseline mb-2">
                            <strong className="text-white text-xs">{sub.title}</strong>
                            <span className="text-amber-500 font-mono text-xs font-black">{sub.fee}</span>
                          </div>
                          <p className="text-[10px] text-stone-500 leading-snug font-semibold">{sub.contents}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 5: FINANCIALS & GTM ALIGNMENT */}
            {activeTab === 'gtm_financials' && (
              <div className="space-y-10">
                
                {/* Visual grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left side: Interactive Recharts Graph */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className={`p-6 rounded-[2.5rem] border ${
                      isDarkMode ? 'bg-zinc-950 border-stone-850' : 'bg-white border-stone-200'
                    }`}>
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <span className="text-[10px] font-mono uppercase bg-[#2dd4bf]/10 text-[#2dd4bf] px-2.5 py-1 rounded font-extrabold">
                            Section VIII Financial Projections
                          </span>
                          <h3 className={`text-xl font-black mt-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                            Revenue Generation & Mix Strategy
                          </h3>
                        </div>
                        
                        {/* Interactive Year filter */}
                        <div className="flex rounded-lg overflow-hidden border border-stone-800 bg-black text-[9.5px] font-mono">
                          {([1, 2, 3] as const).map((year) => (
                            <button
                              key={year}
                              onClick={() => setProjectionYear(year)}
                              className={`p-1.5 px-3 uppercase font-black cursor-pointer transition-colors ${
                                projectionYear === year ? 'bg-[#2dd4bf]/20 text-[#2dd4bf]' : 'text-stone-500 hover:text-white'
                              }`}
                            >
                              Year {year}
                            </button>
                          ))}
                        </div>
                      </div>

                      <p className={`text-xs mb-6 font-semibold leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        The service model shifts dynamically from heavy specialized consulting services (60%) during Year 1 towards automated high-margin product platform ARR subscriptions (35%) by Year 3. Total systemic revenue moves from **$1.0M** (Y1) to **$3.0M** (Y2) to **$7.5M** (Y3).
                      </p>

                      {/* Line/Bar Composed Chart (Recharts) */}
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={revenueHistory}
                            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                          >
                            <defs>
                              <linearGradient id="colorArr" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} />
                            <YAxis stroke="#555" fontSize={10} tickLine={false} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#000', 
                                border: '1px solid #333', 
                                borderRadius: '15px',
                                fontFamily: 'monospace',
                                fontSize: '11px',
                                color: '#fff'
                              }} 
                            />
                            <Legend />
                            <Area type="monotone" dataKey={`Year${projectionYear}`} fillOpacity={1} fill="url(#colorArr)" stroke="#2dd4bf" name={`Projected Revenue (Y${projectionYear})`} />
                            <Bar dataKey={`Year${projectionYear}`} barSize={12} fill="#ffb454" radius={[4, 4, 0, 0]} name={`Allocation ($)`} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>

                    </div>
                  </div>

                  {/* Right side: Revenue mix metrics */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className={`p-6 rounded-[2.5rem] border flex flex-col justify-between h-full ${
                      isDarkMode ? 'bg-zinc-950 border-stone-850' : 'bg-white border-stone-200'
                    }`}>
                      <div>
                        <span className="text-[9px] font-mono text-stone-500 uppercase font-black block mb-2">// MATURITY STAGE MIX</span>
                        <h4 className="text-sm font-black text-white dark:text-white mb-4">Service Mix Evolution Matrix</h4>
                        
                        <div className="space-y-3 font-mono text-[10px]">
                          {[
                            { name: "Consulting (Diagnostic / Workshop)", y1: "60%", y3: "25%" },
                            { name: "Platform SaaS Core ARR", y1: "15%", y3: "35%" },
                            { name: "Enterprise Seat Subscriptions", y1: "10%", y3: "20%" },
                            { name: "Continuous Support SLA & Support contracts", y1: "5%", y3: "10%" },
                            { name: "Compliance Certifications", y1: "5%", y3: "5%" },
                            { name: "Academy & Corporate training plans", y1: "5%", y3: "5%" }
                          ].map((item, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-black/40 border border-stone-900/40 flex justify-between gap-2">
                              <div>
                                <span className="block text-white font-extrabold">{item.name}</span>
                              </div>
                              <div className="text-right whitespace-nowrap shrink-0">
                                <span className="text-stone-500 block">Y1: <strong className="text-stone-300">{item.y1}</strong></span>
                                <span className="text-[#2dd4bf] block font-black">Y3: {item.y3}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 p-4 rounded-xl bg-black border border-stone-900 flex justify-between items-center text-xs">
                        <span className="font-mono text-stone-500">Total Projections Year {projectionYear}:</span>
                        <span className="text-[#2dd4bf] font-black font-mono">
                          ${(projectionYear === 1 ? totalRejectionsY1 : projectionYear === 2 ? totalRejectionsY2 : totalRejectionsY3).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Section IX GTM: Customer Journey */}
                <div className={`p-8 rounded-[2.5rem] border ${
                  isDarkMode ? 'bg-zinc-950 border-stone-850' : 'bg-white border-stone-200 shadow-xs'
                }`}>
                  <span className="text-[10px] font-mono uppercase bg-[#2dd4bf]/10 text-[#2dd4bf] px-2.5 py-1 rounded font-extrabold tracking-wider">
                    IX. Go-To-Market Execution
                  </span>
                  <h3 className={`text-2xl font-black mt-3 mb-6 tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    The Client Lifecycle & Ingress Funnel
                  </h3>

                  {/* Flow chart funnel */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 text-center text-xs font-mono font-bold uppercase tracking-wider relative">
                    
                    <div className="p-5 rounded-2xl bg-black/50 border border-stone-900 text-stone-150">
                      <span className="text-stone-500 block text-[9.5px]">01 // AWARENESS</span>
                      <strong className="block text-white mt-1">Thought Leadership</strong>
                      <span className="text-stone-500 font-medium text-[8px] block mt-1">White papers, risk metrics releases, podcasts</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-black/50 border border-stone-900 text-stone-150">
                      <span className="text-stone-500 block text-[9.5px]">02 // EVALUATION</span>
                      <strong className="block text-white mt-1">Diagnostic / Pilot</strong>
                      <span className="text-stone-500 font-medium text-[8px] block mt-1">AI Diagnostics, compliance-accuracy tradeoff sessions</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-black/50 border border-stone-900 ring-1 ring-[#2dd4bf]/20 text-stone-150">
                      <span className="text-[#2dd4bf] block text-[9.5px]">03 // ADOPTION</span>
                      <strong className="block text-white mt-1">Implementation SaaS</strong>
                      <span className="text-stone-500 font-medium text-[8px] block mt-1">SaaS business platform tier, standard course training</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-black/50 border border-stone-900 text-stone-150">
                      <span className="text-stone-500 block text-[9.5px]">04 // EXPANSION</span>
                      <strong className="block text-white mt-1">Enterprise Bundles</strong>
                      <span className="text-stone-500 font-medium text-[8px] block mt-1">Proprietary compliance packs, unlimited developer seats, TAMs</span>
                    </div>

                  </div>

                  {/* Land and expand motion specifications table */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest pb-1 border-b border-stone-850">
                      Typical Land & Expand Paths
                    </h4>
                    <div className="divide-y divide-stone-850 text-xs">
                      {[
                        { entry: "Platform Community Tier", path: "Developer self-test &rarr; SMB team transition &rarr; Business cluster", trigger: "System hits volume limits, security audits call for custom SSO bindings." },
                        { entry: "AI Governance Diagnostic", path: "Consulting engagement &rarr; Framework development &rarr; Enterprise SaaS seats", trigger: "Board presentation identifies policy mismatch, mandate for automated pipeline blocks." },
                        { entry: "Corporate Training Subscription", path: "Staff academy prep &rarr; Conformance certification &rarr; Advisory retainer", trigger: "Compliance officer orders developer testing sandbox, requires continuous expert advisory access." },
                        { entry: "Retainer Advisory Counsel", path: "High-level risk triage &rarr; Full custom rule mapping &rarr; Add-On Compliance packs", trigger: "Regulatory shift (such as EU AI Act) triggers urgent requirement for specific audit templates." }
                      ].map((path, idx) => (
                        <div key={idx} className="py-3 flex flex-col md:flex-row md:items-baseline justify-between gap-2 font-sans font-medium text-stone-500">
                          <span className="font-extrabold text-[#2dd4bf] w-48 shrink-0">{path.entry}</span>
                          <span className="grow font-bold text-stone-300 select-none flex items-center gap-1.5" dangerouslySetInnerHTML={{ __html: path.path }} />
                          <span className="md:w-64 shrink-0 text-stone-550 dark:text-stone-500 text-right text-[11px] leading-snug">{path.trigger}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section X: Alignment with Phase Mirror License v1.0 */}
                <div className={`p-8 rounded-[2.5rem] border ${
                  isDarkMode ? 'bg-[#0b0b0c] border-stone-850' : 'bg-white border-stone-200'
                }`}>
                  <div className="flex gap-2 items-center text-xs text-stone-500 font-mono mb-4 uppercase font-bold">
                    <Scale size={14} className="text-[#2dd4bf]" /> Section X Regulatory Licensing Framework
                  </div>
                  <h3 className={`text-xl font-black mb-3 tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    Phase Mirror License v1.0 Service Compatibility
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed font-semibold mb-6">
                    All professional and platform services align strictly inside the regulatory limits established under Phase Mirror License v1.0. This framework protects open-source redistribution of core modules while safeguarding hosted services revenue boundaries.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-[10px]">
                    {[
                      { item: "Platform (Self-Hosted CLI)", status: "Permitted under base license", details: "Developers and teams retain absolute freedom to run, modify, and build custom rules self-hosted on regional infrastructure freely." },
                      { item: "Platform (Managed/SaaS)", status: "Proof Labs Exclusive", details: "Federated SaaS dashboard instances require specific commercial agreements, protecting managed infrastructure services revenue." },
                      { item: "Compliance Pack Add-ons", status: "Proprietary Licenses", details: "Industry-specific regulatory rules mapping (Financial, Healthcare, EU AI Act) operate under separate proprietary seat keys." }
                    ].map((lic, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-black border border-stone-900 flex flex-col justify-between gap-3">
                        <div className="flex justify-between items-baseline border-b border-stone-900 pb-2">
                          <span className="font-extrabold text-stone-300">{lic.item}</span>
                          <span className="text-[#2dd4bf] font-extrabold text-[9px] uppercase">{lic.status}</span>
                        </div>
                        <p className="text-stone-500 leading-relaxed font-sans text-[10.5px]">
                          {lic.details}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Dynamic final footer quote block */}
        <section className={`p-12 md:p-16 rounded-[3.5rem] border text-center mt-12 relative overflow-hidden ${
          isDarkMode 
            ? 'bg-gradient-to-r from-zinc-950 to-[#0b0b0c] border-stone-850' 
            : 'bg-white border-stone-150 shadow-sm'
        }`}>
          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <Info className="text-[#2dd4bf] mx-auto opacity-40 mb-2 animate-bounce-subtle" size={24} />
            <p className="text-lg md:text-xl font-bold font-serif italic text-stone-400 leading-relaxed">
              "Phase Mirror positions AI governance as an actionable corporate operating system—not merely a constraint tool, 
              but a cohesive methodology that organizations adopt systematically, ensuring cognitive safety and mathematical accountability."
            </p>
            <div className="pt-2">
              <span className="text-[9px] font-mono text-stone-550 font-bold uppercase tracking-[0.4em]">Comprehensive Portfolio • End-To-End Invariants Assurance</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

// Simple inline CheckCircleIcon
const CheckCircleIcon: React.FC<{ className?: string, size?: number }> = ({ className, size = 16 }) => {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
};

export default ServicesView;
