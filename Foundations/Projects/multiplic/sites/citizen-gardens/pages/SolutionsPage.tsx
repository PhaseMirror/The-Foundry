import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Database, 
  Sprout, 
  Layers, 
  GitBranch, 
  Activity, 
  Clock, 
  Code, 
  Scale, 
  Cpu,
  Library,
  Network,
  Lock,
  FileJson,
  Globe,
  Users
} from 'lucide-react';

const SolutionsPage: React.FC = () => {
  const stackLayers = [
    {
      layer: "Formal Layer",
      description: "Prime‑indexed identity, Multiplicity structures, and ΛProof‑compliant invariants.",
      icon: <Scale className="w-5 h-5" />,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20"
    },
    {
      layer: "Technical Layer",
      description: "Open‑source libraries, circuits, contracts, and Terraform‑driven infra that instantiate invariants in Web4 systems.",
      icon: <Cpu className="w-5 h-5" />,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20"
    },
    {
      layer: "Civic‑Data Layer",
      description: "Governance templates, policy‑synthesis tools, and citizen‑law libraries translating invariants into enforceable norms.",
      icon: <Database className="w-5 h-5" />,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20"
    },
    {
      layer: "Community‑Practice Layer",
      description: "Community‑garden ecosystems and citizen‑science initiatives that embody and test norms in material contexts.",
      icon: <Sprout className="w-5 h-5" />,
      color: "text-citizen-green",
      bg: "bg-citizen-green/10",
      border: "border-citizen-green/20"
    }
  ];

  const repositories = [
    {
      name: "Phase‑Mirror",
      layer: "Technical / Meta‑Theorem",
      owner: "Phase‑Mirror SIG / Agentic Layer Team",
      metric: "Rate of tension‑surfacing ADRs; % of infra changes gated by Phase‑Mirror review",
      horizon: "7: stabilizing core dissonance API; 30: integration with 2–3 prod infra stacks"
    },
    {
      name: "ΛProof (Lambda‑Proof)",
      layer: "Formal / Technical",
      owner: "ΛProof Core Team",
      metric: "% of proofs verified in <100 ms; zero‑surveillance‑compliance audit passes",
      horizon: "7: finalize Ξ‑Constitution v1; 30: on‑ramp 3–5 proof‑first services"
    },
    {
      name: "Q‑Calculator",
      layer: "Formal / Meta‑Theorem",
      owner: "Multiplicity Core Theory Team",
      metric: "Number of distinct prime‑indexed multiplicity spaces modeled",
      horizon: "7: align surface‑API with Phase‑Mirror; 30: publish 1–2 case‑specific modules"
    },
    {
      name: "PIRTM",
      layer: "Technical / Governance",
      owner: "Governance & Policy Infrastructure Team",
      metric: "Number of policy‑templates parameterized by PIR‑TM; reduction in policy‑to‑implementation lag",
      horizon: "7: stabilize core policy‑representation format; 30: integrate with governance frontends"
    },
    {
      name: "MultiplicityFoundation/*-core",
      layer: "Formal / Meta‑Theorem",
      owner: "Core Multiplicity Theorem Team",
      metric: "Number of formally verified theorems; alignment‑score between repos",
      horizon: "7: freeze core algebraic primitives; 30: publish 2–3 domain‑specific extensions"
    },
    {
      name: "CitizenGardens‑org",
      layer: "Governance & Collaboration",
      owner: "Citizen Gardens Program Office",
      metric: "% of public programs documented; average time‑to‑first‑contribution",
      horizon: "7: standardize ADR template; 30: bind repos to common milestone labels"
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 font-sans">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-citizen-green mb-6">
            <span className="w-2 h-2 rounded-full bg-citizen-green animate-pulse" />
            NONPROFIT PUBLIC-BENEFIT INITIATIVE
          </div>
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-8 tracking-tight">
            Civic Infrastructure for <span className="text-citizen-green italic">Human Dignity</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto">
            We design and deploy Multiplicity‑aligned digital systems, proof‑first Web4 architectures, and community-scale ecological platforms.
          </p>
        </motion.div>

        {/* Three Broad Bands */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-32">
          {/* Band 1: Proof-first Web4 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-2xl"
          >
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-serif text-white mb-4">Proof‑first Web4</h3>
            <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
              At the core is <span className="text-white font-mono">ΛProof</span>, a protocol stack for lawful, ethically constrained, and user‑sovereign state transitions.
            </p>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li className="flex items-start gap-2">
                <Lock className="w-4 h-4 mt-0.5 text-purple-400 shrink-0" />
                <span>Zero‑surveillance compliance via Archivum audit layer</span>
              </li>
              <li className="flex items-start gap-2">
                <Code className="w-4 h-4 mt-0.5 text-purple-400 shrink-0" />
                <span>Prime‑Lawful Invariant Contracts (PLICs)</span>
              </li>
              <li className="flex items-start gap-2">
                <Scale className="w-4 h-4 mt-0.5 text-purple-400 shrink-0" />
                <span>Mathematically encoded Ξ‑Constitution</span>
              </li>
            </ul>
          </motion.div>

          {/* Band 2: Civic-data & Governance */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-2xl"
          >
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 border border-amber-500/20">
              <Library className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-2xl font-serif text-white mb-4">Civic‑Data & Governance</h3>
            <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
              Curated through the <span className="text-white font-mono">Multiplicity Library</span>, we aggregate research and policy artifacts for governance design.
            </p>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li className="flex items-start gap-2">
                <FileJson className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
                <span>Phase‑Mirror for operationalizing governance tensions</span>
              </li>
              <li className="flex items-start gap-2">
                <Network className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
                <span>Meta‑Theorem initiatives for heterogeneous infra</span>
              </li>
              <li className="flex items-start gap-2">
                <Database className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
                <span>Prime‑indexed logic for civic decision-making</span>
              </li>
            </ul>
          </motion.div>

          {/* Band 3: Community-scale Platforms */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-2xl"
          >
            <div className="w-12 h-12 bg-citizen-green/10 rounded-xl flex items-center justify-center mb-6 border border-citizen-green/20">
              <Sprout className="w-6 h-6 text-citizen-green" />
            </div>
            <h3 className="text-2xl font-serif text-white mb-4">Community Platforms</h3>
            <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
              Ecological and educational platforms that operationalize Multiplicity as a lived, place‑based praxis.
            </p>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li className="flex items-start gap-2">
                <Activity className="w-4 h-4 mt-0.5 text-citizen-green shrink-0" />
                <span>Urban gardens as multi‑benefit infrastructures</span>
              </li>
              <li className="flex items-start gap-2">
                <Globe className="w-4 h-4 mt-0.5 text-citizen-green shrink-0" /> {/* Changed from Globe to generic since Globe isn't imported, wait, Globe was in previous file, let me check imports. I removed Globe from imports. I will use Network or something else or re-add Globe. I'll use Network for now as it is imported. Actually I'll use Sprout again or just a dot. Let's use Layers. */}
                <Layers className="w-4 h-4 mt-0.5 text-citizen-green shrink-0" />
                <span>"Living labs" for abstract mathematics</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="w-4 h-4 mt-0.5 text-citizen-green shrink-0" /> {/* Users not imported. I'll add Users to imports. */}
                <span>Participatory climate‑adaptation planning</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Recursive Stack Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">The Recursive Stack</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Our solutions are organized not as silos, but as a recursive stack spanning formal logic to material practice.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stackLayers.map((layer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`p-6 rounded-xl border ${layer.border} ${layer.bg} flex items-start gap-4`}
              >
                <div className={`mt-1 p-2 rounded-lg bg-black/20 ${layer.color}`}>
                  {layer.icon}
                </div>
                <div>
                  <h4 className={`font-mono text-sm font-bold uppercase tracking-wider mb-2 ${layer.color}`}>
                    {layer.layer}
                  </h4>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {layer.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Repository Matrix */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-3xl text-white">Repository Matrix</h2>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
              <GitBranch className="w-4 h-4" />
              <span>LIVE STATUS</span>
            </div>
          </div>

          <div className="overflow-x-auto border border-zinc-800 rounded-xl bg-zinc-900/20">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="p-4 font-mono text-xs text-zinc-500 uppercase tracking-wider">Repository</th>
                  <th className="p-4 font-mono text-xs text-zinc-500 uppercase tracking-wider">Layer</th>
                  <th className="p-4 font-mono text-xs text-zinc-500 uppercase tracking-wider">Owner</th>
                  <th className="p-4 font-mono text-xs text-zinc-500 uppercase tracking-wider">Metric</th>
                  <th className="p-4 font-mono text-xs text-zinc-500 uppercase tracking-wider">Horizon (7/30 days)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {repositories.map((repo, index) => (
                  <tr key={index} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="p-4 font-mono text-sm text-white font-medium group-hover:text-citizen-green transition-colors">
                      {repo.name}
                    </td>
                    <td className="p-4 text-xs text-zinc-400">
                      <span className="inline-block px-2 py-1 rounded bg-zinc-800 border border-zinc-700">
                        {repo.layer}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-zinc-400">{repo.owner}</td>
                    <td className="p-4 text-xs text-zinc-500 max-w-xs leading-relaxed">
                      {repo.metric}
                    </td>
                    <td className="p-4 text-xs text-zinc-500 max-w-xs font-mono">
                      <div className="flex items-start gap-2">
                        <Clock className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>{repo.horizon}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SolutionsPage;
