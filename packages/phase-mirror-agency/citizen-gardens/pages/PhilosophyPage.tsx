import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Leaf, Cpu, Scale } from 'lucide-react';

const PhilosophyPage: React.FC = () => {
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
            Our Philosophy
          </div>
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-8 tracking-tight">
            Trust as <span className="text-zinc-500">Infrastructure</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto">
            Citizen Gardens is a nonprofit, open-source civic infrastructure project that treats trust as its core product, integrating community, technology, and ecology to support human dignity and environmental stewardship.
          </p>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-24">
          
          {/* Core commitments */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-8 md:gap-16"
          >
            <div className="md:w-1/3 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-citizen-green" />
              </div>
              <h2 className="font-serif text-3xl text-white">Core Commitments</h2>
            </div>
            <div className="md:w-2/3 prose prose-invert max-w-none text-zinc-400">
              <p>
                Citizen Gardens is organized as a nonprofit public‑benefit and 501(c)(3)‑style social initiative, explicitly oriented toward betterment of the general public rather than profit.
              </p>
              <p>
                Its stated mission is to design and deploy civic infrastructure that supports human dignity, environmental stewardship, and resilient local communities.
              </p>
              <p>
                The core engineering principle is that "trust is the product," so governance, technology, and finance are all designed around verifiable reliability and accountability rather than extractive monetization.
              </p>
            </div>
          </motion.section>

          {/* Community, reciprocity, and public benefit */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-8 md:gap-16"
          >
            <div className="md:w-1/3 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-citizen-green" />
              </div>
              <h2 className="font-serif text-3xl text-white">Community & Reciprocity</h2>
            </div>
            <div className="md:w-2/3 prose prose-invert max-w-none text-zinc-400">
              <p>
                Citizen Gardens frames itself as a community‑driven initiative, working with local residents, organizations, and public agencies rather than on top of them.
              </p>
              <p>
                It emphasizes reciprocal relationships: participants contribute time, knowledge, data, or resources and receive shared tools, visibility, and support in return.
              </p>
              <p>
                As a "Literary Charity Organization and Non‑Profit Social Investment Credit Union," it treats cultural work, education, and social credit as core civic infrastructure, not side projects.
              </p>
            </div>
          </motion.section>

          {/* Ecology, food, and place */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-8 md:gap-16"
          >
            <div className="md:w-1/3 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                <Leaf className="w-6 h-6 text-citizen-green" />
              </div>
              <h2 className="font-serif text-3xl text-white">Ecology, Food, & Place</h2>
            </div>
            <div className="md:w-2/3 prose prose-invert max-w-none text-zinc-400">
              <p>
                The project uses gardening, urban agriculture, and green‑space design as concrete ways to promote food security, environmental stewardship, and neighborhood quality of life.
              </p>
              <p>
                Gardens are treated as civic spaces where people practice ecological citizenship—linking everyday land care with democratic participation and shared norms.
              </p>
              <p>
                Educational programming around ecology, ethnobotany, environmental psychology, and public health is framed as part of a larger "Multiplicity Library" of interconnected disciplines.
              </p>
            </div>
          </motion.section>

          {/* Technology, data, and AI */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-8 md:gap-16"
          >
            <div className="md:w-1/3 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6 text-citizen-green" />
              </div>
              <h2 className="font-serif text-3xl text-white">Technology, Data, & AI</h2>
            </div>
            <div className="md:w-2/3 prose prose-invert max-w-none text-zinc-400">
              <p>
                Citizen Gardens explicitly positions itself where "technological innovation meets community reciprocity," offering digital tools, analytics, and AI‑driven insights to communities and aligned businesses.
              </p>
              <p>
                Data and automation are used to illuminate community trends and ecological patterns, with the aim of augmenting local decision‑making rather than replacing it.
              </p>
              <p>
                The organization maintains open‑source code and documentation, reflecting a commitment to transparent, inspectable infrastructure over black‑box platforms.
              </p>
            </div>
          </motion.section>

          {/* Governance, law, and multiplicity */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-8 md:gap-16"
          >
            <div className="md:w-1/3 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                <Scale className="w-6 h-6 text-citizen-green" />
              </div>
              <h2 className="font-serif text-3xl text-white">Governance & Multiplicity</h2>
            </div>
            <div className="md:w-2/3 prose prose-invert max-w-none text-zinc-400">
              <p>
                The Citizen Gardens library includes domains like applied mathematics, network science, sociology, law, and Multiplicity Theory, signaling a philosophy that civic systems are complex, multi‑scale networks rather than simple linear pipelines.
              </p>
              <p>
                As a non‑profit civic credit union, it orients finance toward strategic and literary charity, community gardens, and other public‑benefit programs instead of private accumulation.
              </p>
              <p>
                Legal and administrative materials (mission, provisions, code of conduct, trust & security, terms, privacy) are treated as core educational artifacts, reinforcing the idea that governance should be legible and participatory.
              </p>
            </div>
          </motion.section>

        </div>
      </div>
    </div>
  );
};

export default PhilosophyPage;
