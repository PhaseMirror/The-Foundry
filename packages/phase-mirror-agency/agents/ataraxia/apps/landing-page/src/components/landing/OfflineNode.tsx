"use client";

import { motion } from "framer-motion";
import { Server, Zap, ShieldCheck, Database, LayoutGrid, Terminal } from "lucide-react";

export default function OfflineNode() {
  const components = [
    { name: "Thymos Runtime", icon: <Zap className="h-4 w-4" /> },
    { name: "Archivum Local Ledger", icon: <Database className="h-4 w-4" /> },
    { name: "PEET Sentinel", icon: <ShieldCheck className="h-4 w-4" /> },
    { name: "Consent DB", icon: <LayoutGrid className="h-4 w-4" /> },
    { name: "Agent Registry", icon: <Terminal className="h-4 w-4" /> },
    { name: "Model Weights", icon: <Server className="h-4 w-4" /> }
  ];

  return (
    <section id="sovereign" className="py-24 bg-background relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Content */}
        <motion.div 
          className="flex flex-col gap-6"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col gap-2">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-accent-cyan font-bold">Resilience Mode</h4>
            <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-primary-text leading-tight">
              Runs when the network does not.
            </h2>
          </div>
          <p className="text-lg text-secondary-text leading-relaxed">
            One workstation can operate a hospital in emergency mode. Governance remains local. Consent remains enforceable. Drift remains measurable. Audit trails remain intact.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="block font-mono text-[10px] text-accent-cyan uppercase mb-1">Local Audit</span>
              <span className="text-sm text-secondary-text">Immutable local ledger syncs on reconnection.</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="block font-mono text-[10px] text-accent-cyan uppercase mb-1">State Isolation</span>
              <span className="text-sm text-secondary-text">Full model inference without external dependencies.</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Node Diagram */}
        <div className="relative flex justify-center items-center">
          <div className="relative w-full max-w-md aspect-square">
            {/* The Node Box */}
            <motion.div 
              className="absolute inset-0 glass rounded-[2.5rem] border-2 border-accent-cyan/20 flex flex-col p-8 z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="h-3 w-3 rounded-full bg-accent-cyan animate-pulse" />
                <span className="font-mono text-xs text-primary-text tracking-widest uppercase">Ataraxia Sovereign Node v1.4</span>
              </div>

              <div className="grid grid-cols-2 gap-4 flex-grow">
                {components.map((comp, i) => (
                  <motion.div 
                    key={comp.name}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3 group hover:border-accent-cyan/40 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="text-accent-cyan group-hover:scale-110 transition-transform">{comp.icon}</div>
                    <span className="text-[10px] font-mono text-secondary-text leading-tight uppercase tracking-wider">{comp.name}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center font-mono text-[8px] text-secondary-text uppercase tracking-widest">
                <span>Memory: 128GB ECC</span>
                <span>Storage: 4TB NVMe Raid-1</span>
                <span>State: Locked</span>
              </div>
            </motion.div>

            {/* Background elements for the diagram */}
            <div className="absolute inset-0 bg-accent-cyan/10 blur-[100px] rounded-full -z-10" />
            <motion.div 
              className="absolute -inset-4 border border-accent-cyan/20 rounded-[3rem] -z-10"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
