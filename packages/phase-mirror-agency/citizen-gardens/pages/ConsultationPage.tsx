import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, RefreshCw, Network, Globe, ShieldCheck } from 'lucide-react';

const ConsultationPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 font-sans relative overflow-hidden">
      {/* Background Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="container mx-auto px-6 relative z-10 max-w-4xl">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-citizen-green/10 border border-citizen-green/20 text-xs font-mono text-citizen-green mb-6 uppercase tracking-widest">
            Consultation Services
          </div>
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-8 tracking-tight">
            Phase <span className="text-zinc-500">Mirror</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto">
            Phase Mirror can be framed as the living "governor" of Citizen Gardens rather than a single analytic product: it is the decision environment that keeps the whole architecture coherent, adaptive, and self‑sustaining.
          </p>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-24">
          
          {/* What Phase Mirror is */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-8 md:gap-16"
          >
            <div className="md:w-1/3 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-citizen-green" />
              </div>
              <h2 className="font-serif text-3xl text-white">What Phase Mirror is</h2>
            </div>
            <div className="md:w-2/3 prose prose-invert max-w-none text-zinc-400">
              <p>
                <strong>A governance engine:</strong> Phase Mirror encodes how Citizen Gardens senses, reflects, and decides—across finance, ecology, partnerships, and knowledge—so that every layer obeys the same trust‑first logic.
              </p>
              <p>
                <strong>A recursive mirror:</strong> It continuously reflects data about community, environment, and operations back into the organization, so strategies, budgets, and designs can reconfigure themselves without losing identity.
              </p>
            </div>
          </motion.section>

          {/* Role in self‑sustaining architectures */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-8 md:gap-16"
          >
            <div className="md:w-1/3 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                <RefreshCw className="w-6 h-6 text-citizen-green" />
              </div>
              <h2 className="font-serif text-3xl text-white">Role in self‑sustaining architectures</h2>
            </div>
            <div className="md:w-2/3 prose prose-invert max-w-none text-zinc-400">
              <p>
                It binds together modular "garden" architectures—legal entities, data flows, credit systems, physical sites—so they can autonomously balance inputs and outputs (money, attention, labor, materials) over time.
              </p>
              <p>
                Feedback loops (metrics, dashboards, simulations, narrative reporting) are routed through Phase Mirror so that Citizen Gardens can detect drift from its public‑benefit mission and correct course early.
              </p>
              <p>
                Because the rules of adaptation live in Phase Mirror, new projects can plug into an existing self‑sustaining pattern instead of reinventing governance, risk, and ethics from scratch.
              </p>
            </div>
          </motion.section>

          {/* Why it unlocks “a vast array of consultation” */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-8 md:gap-16"
          >
            <div className="md:w-1/3 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                <Briefcase className="w-6 h-6 text-citizen-green" />
              </div>
              <h2 className="font-serif text-3xl text-white">Why it unlocks "a vast array of consultation"</h2>
            </div>
            <div className="md:w-2/3 prose prose-invert max-w-none text-zinc-400">
              <p>
                Externally, Phase Mirror becomes a consultation substrate: the same decision logics that govern Citizen Gardens can be parameterized for cities, nonprofits, cooperatives, and ethical businesses.
              </p>
              <p>It can support consultation around:</p>
              <ul>
                <li><strong>Civic architecture</strong> (charters, trust frameworks, data governance)</li>
                <li><strong>Ecological and food‑system planning</strong> (garden networks, local supply webs)</li>
                <li><strong>Socio‑technical systems</strong> (AI tooling, credit systems, reputational metrics)</li>
              </ul>
              <p>
                Because it is already used to run a real, mission‑driven infrastructure, clients aren't buying abstract advice; they are adopting a tested decision grammar that can be tuned to their own multiplicity of contexts.
              </p>
            </div>
          </motion.section>

          {/* How this fits the emerging philosophy */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-8 md:gap-16"
          >
            <div className="md:w-1/3 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                <Network className="w-6 h-6 text-citizen-green" />
              </div>
              <h2 className="font-serif text-3xl text-white">How this fits the emerging philosophy</h2>
            </div>
            <div className="md:w-2/3 prose prose-invert max-w-none text-zinc-400">
              <p>
                Citizen Gardens treats trust as its core product; Phase Mirror is the operationalization of that: a way to ensure decisions remain legible, auditable, and aligned with human dignity and ecological reciprocity.
              </p>
              <p>
                In Multiplicity‑theoretic terms, Phase Mirror manages a space of prime‑labeled interactions (legal, social, ecological, digital) and preserves pattern‑identity as those interactions recurse across scales.
              </p>
            </div>
          </motion.section>

        </div>
      </div>
    </div>
  );
};

export default ConsultationPage;
