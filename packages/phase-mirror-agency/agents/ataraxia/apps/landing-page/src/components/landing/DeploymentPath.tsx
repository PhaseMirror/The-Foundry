"use client";

import { motion } from "framer-motion";
import { HardDrive, Network, Globe } from "lucide-react";

export default function DeploymentPath() {
  const tiers = [
    {
      name: "Tier 1: Sovereign Single Node",
      icon: <HardDrive className="h-8 w-8 text-accent-cyan" />,
      setting: "Clinic or Isolated Unit",
      connectivity: "Air-gapped / Local LAN",
      governance: "Local Immutable Ledger",
      failure: "Full Autonomy"
    },
    {
      name: "Tier 2: Local Clinical Cluster",
      icon: <Network className="h-8 w-8 text-accent-violet" />,
      setting: "Regional Hospital System",
      connectivity: "Managed Clinical Network",
      governance: "Consensus-based Provenance",
      failure: "High Availability (Local)"
    },
    {
      name: "Tier 3: Federated Fleet",
      icon: <Globe className="h-8 w-8 text-success-green" />,
      setting: "Global Health Network",
      connectivity: "Hybrid Cloud / Federated",
      governance: "Recursive Constitutional Root",
      failure: "Network Partition Resilient"
    }
  ];

  return (
    <section id="deployment" className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-6 mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-primary-text">
            Deployment Path
          </h2>
          <p className="text-secondary-text max-w-xl">
            Scale from a single sovereign node to a federated global fleet while maintaining unified governance invariants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <motion.div 
              key={tier.name}
              className="glass rounded-2xl p-8 border border-white/10 flex flex-col gap-8 hover:border-accent-cyan/20 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="p-4 bg-white/5 rounded-2xl w-fit">
                {tier.icon}
              </div>
              
              <h3 className="font-heading text-xl font-bold text-primary-text">
                {tier.name}
              </h3>

              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="block font-mono text-[8px] uppercase tracking-widest text-secondary-text">Typical Setting</span>
                  <span className="block text-primary-text text-sm">{tier.setting}</span>
                </div>
                <div className="space-y-1">
                  <span className="block font-mono text-[8px] uppercase tracking-widest text-secondary-text">Connectivity</span>
                  <span className="block text-primary-text text-sm">{tier.connectivity}</span>
                </div>
                <div className="space-y-1">
                  <span className="block font-mono text-[8px] uppercase tracking-widest text-secondary-text">Governance Mode</span>
                  <span className="block text-primary-text text-sm">{tier.governance}</span>
                </div>
                <div className="space-y-1">
                  <span className="block font-mono text-[8px] uppercase tracking-widest text-secondary-text">Failure Tolerance</span>
                  <span className="block text-primary-text text-sm">{tier.failure}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
