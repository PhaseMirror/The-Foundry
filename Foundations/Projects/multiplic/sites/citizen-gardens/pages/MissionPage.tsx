import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Heart, Users, Leaf, Globe, Coins } from 'lucide-react';

const PillarCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-citizen-green/50 transition-all group">
    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-citizen-green mb-4 group-hover:scale-110 transition-transform">
      <Icon size={20} />
    </div>
    <h4 className="font-serif text-lg text-white mb-2">{title}</h4>
    <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
  </div>
);

const MissionPage: React.FC = () => {
  return (
    <div className="pt-32 pb-24">
      {/* Our Mission */}
      <section className="py-24 bg-transparent relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-citizen-green text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
            >
              Our Purpose
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-5xl md:text-7xl text-white mb-8"
            >
              Our Mission
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 text-xl leading-relaxed"
            >
              To nurture the conditions for individuals and communities to thrive — intellectually, socially, and ecologically — through systems that honor contribution, foster interdependence, and regenerate both human and environmental well-being.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PillarCard 
              icon={Zap}
              title="Multiplicity & Social Reciprocity"
              desc="We quantify and value human interactions through Multiplicity Theory, turning reciprocity into a regenerative force within communities."
            />
            <PillarCard 
              icon={Heart}
              title="Public Benefit & Community Care"
              desc="Structured as a nonprofit, we promote public health, quality of life, and environmental stewardship over profit."
            />
            <PillarCard 
              icon={Users}
              title="Inclusive Participation & Equity"
              desc="Membership is open to all; we honor diverse backgrounds, perspectives, and contributions as essential nutrients in our civic garden."
            />
            <PillarCard 
              icon={Leaf}
              title="Environmental Stewardship"
              desc="Through the Economy League Multiplicity (ELM), we elevate sustainability, justice, and responsible resource use as foundational practices."
            />
            <PillarCard 
              icon={Globe}
              title="Emergent Governance"
              desc="We reject top-down control in favor of participatory governance where each member is a co-author in our shared future."
            />
            <PillarCard 
              icon={Coins}
              title="Reward Systems"
              desc="Members are recognized and rewarded through Ingenuity Awards, Opportunity Rewards, and other contribution-based systems."
            />
          </div>
        </div>
      </section>

      {/* Multiplicity as Living Definition */}
      <section className="py-24 bg-zinc-900/30 border-t border-zinc-800 relative z-10">
        <div className="container mx-auto px-6 text-center max-w-4xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-12">Multiplicity as Living Definition</h2>
          <p className="text-zinc-400 text-xl leading-relaxed mb-12 italic">
            "In a multiplicative society, no one wins alone — because no one is alone. We rise together, not because we must, but because it is the only thing worth rising for."
          </p>
          <p className="text-zinc-500 leading-relaxed">
            We are the literary charity that keeps this definition alive — ensuring that Multiplicity remains not an abstraction, but a lineage of action. Every garden planted, every credit issued, every story told is an act of literary charity protecting a living definition from disappearance.
          </p>
        </div>
      </section>
    </div>
  );
};

export default MissionPage;
