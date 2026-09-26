"use client";

import { motion } from "framer-motion";
import { FileText, Search, Code, Shield } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent-violet/10 blur-[150px] -z-10" />
      
      <div className="mx-auto max-w-7xl px-6 flex flex-col items-center text-center">
        <motion.div 
          className="flex flex-col gap-8 items-center max-w-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-4xl md:text-6xl font-bold tracking-tight text-primary-text">
            Build on governed intelligence.
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button className="flex items-center gap-2 rounded-full border border-white/10 px-8 py-4 text-sm font-bold text-primary-text hover:bg-white/5 transition-all">
              <FileText className="h-4 w-4 text-accent-cyan" /> Read README
            </button>
            <button className="flex items-center gap-2 rounded-full border border-white/10 px-8 py-4 text-sm font-bold text-primary-text hover:bg-white/5 transition-all">
              <Search className="h-4 w-4 text-accent-violet" /> Review ADRs
            </button>
            <button className="flex items-center gap-2 rounded-full border border-white/10 px-8 py-4 text-sm font-bold text-primary-text hover:bg-white/5 transition-all">
              <Code className="h-4 w-4 text-success-green" /> Inspect Schemas
            </button>
          </div>
        </motion.div>

        <footer className="mt-32 w-full pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent-cyan" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-secondary-text">
              Governed by the Ξ-Constitution. Anchored by Archivum. Certified by PIRTM.
            </span>
          </div>

          <div className="flex gap-8">
            <a href="#" className="font-mono text-[10px] uppercase tracking-widest text-secondary-text hover:text-accent-cyan transition-colors">Documentation</a>
            <a href="#" className="font-mono text-[10px] uppercase tracking-widest text-secondary-text hover:text-accent-cyan transition-colors">GitHub</a>
            <a href="#" className="font-mono text-[10px] uppercase tracking-widest text-secondary-text hover:text-accent-cyan transition-colors">Security</a>
            <a href="#" className="font-mono text-[10px] uppercase tracking-widest text-secondary-text hover:text-accent-cyan transition-colors">Contact</a>
          </div>
        </footer>
      </div>
    </section>
  );
}
