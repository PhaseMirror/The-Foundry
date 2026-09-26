"use client";

import { motion } from "framer-motion";
import { Shield, Database, Lock, Terminal } from "lucide-react";

export default function ArchitectureLattice() {
  const layers = [
    {
      title: "Consent Tensor",
      icon: <Shield className="h-6 w-6 text-accent-cyan" />,
      role: "Multi-modal patient authorization",
      invariant: "Non-repudiable static leaf",
      anchor: "Archivum/ahgi.consent",
      artifact: "ahgi.consent.v1.json"
    },
    {
      title: "Model Version",
      icon: <Database className="h-6 w-6 text-accent-violet" />,
      role: "Certified weights and topology",
      invariant: "Fixed spectral hash",
      anchor: "Archivum/ahgi.model_version",
      artifact: "ahgi.model.spectral_hash"
    },
    {
      title: "Clinical Auth",
      icon: <Lock className="h-6 w-6 text-critical-red" />,
      role: "Physician-in-the-loop signing",
      invariant: "Dual-key cryptographic witness",
      anchor: "Archivum/ahgi.clinical_auth",
      artifact: "ahgi.witness_token"
    },
    {
      title: "Agent Action",
      icon: <Terminal className="h-6 w-6 text-success-green" />,
      role: "Decomposed operational commands",
      invariant: "Reversible command buffer",
      anchor: "Archivum/ahgi.agent_action",
      artifact: "ahgi.action_log"
    }
  ];

  const adrs = [
    { id: "ADR-000", title: "Constitutional Authority" },
    { id: "ADR-001", title: "Prime Index Authority" },
    { id: "ADR-002", title: "Archivum Integration" },
    { id: "ADR-003", title: "Thymos Runtime" },
    { id: "ADR-004", title: "PEET Drift Engine" }
  ];

  return (
    <section id="architecture" className="py-24 bg-background relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main Content: Interactive Cards */}
          <div className="lg:col-span-3">
            <motion.div 
              className="flex flex-col gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-primary-text">
                Architecture Lattice
              </h2>
              <p className="text-secondary-text max-w-xl">
                A recursive governance structure where each layer enforces a bound invariant anchored by Archivum.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {layers.map((layer, i) => (
                <motion.div
                  key={layer.title}
                  className="group relative glass rounded-2xl p-8 hover:border-accent-cyan/40 transition-all cursor-default overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:border-accent-cyan/20 transition-colors">
                      {layer.icon}
                    </div>
                    <span className="font-mono text-[8px] uppercase tracking-widest text-secondary-text opacity-50">
                      ID: {layer.title.toUpperCase().replace(" ", "_")}
                    </span>
                  </div>

                  <h3 className="font-heading text-2xl font-bold text-primary-text mb-2">
                    {layer.title}
                  </h3>
                  
                  {/* Default Content */}
                  <div className="space-y-4 group-hover:opacity-0 transition-opacity duration-300">
                    <p className="text-secondary-text text-sm">
                      {layer.role}
                    </p>
                  </div>

                  {/* Hover Content */}
                  <div className="absolute inset-x-8 bottom-8 space-y-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                    <div className="space-y-1">
                      <span className="block font-mono text-[8px] uppercase tracking-widest text-accent-cyan">Bound Invariant</span>
                      <span className="block text-primary-text text-xs">{layer.invariant}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="block font-mono text-[8px] uppercase tracking-widest text-accent-cyan">Archivum Anchor</span>
                      <span className="block text-primary-text text-xs">{layer.anchor}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="block font-mono text-[8px] uppercase tracking-widest text-accent-cyan">Example Artifact</span>
                      <span className="block text-primary-text text-xs font-mono">{layer.artifact}</span>
                    </div>
                  </div>

                  {/* Decorative corner accent */}
                  <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-accent-cyan/5 group-hover:bg-accent-cyan/10 transition-colors skew-x-12 translate-x-4 translate-y-4" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Side Rail: Accepted ADRs */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              <div className="flex flex-col gap-2">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-accent-cyan font-bold">Accepted ADRs</h4>
                <div className="h-[1px] w-full bg-accent-cyan/20" />
              </div>

              <div className="space-y-6">
                {adrs.map((adr, i) => (
                  <motion.div 
                    key={adr.id} 
                    className="flex flex-col gap-1 group cursor-pointer"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className="font-mono text-[10px] text-accent-cyan group-hover:text-primary-text transition-colors">{adr.id}</span>
                    <span className="text-sm text-secondary-text group-hover:text-accent-cyan transition-colors">{adr.title}</span>
                  </motion.div>
                ))}
              </div>

              <button className="w-full text-left font-mono text-[10px] text-accent-cyan hover:text-primary-text transition-colors flex items-center gap-2">
                View Repository Archives →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
