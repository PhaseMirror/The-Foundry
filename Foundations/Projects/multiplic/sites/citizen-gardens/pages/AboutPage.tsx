import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Heart, Leaf, Users, Zap, Globe, BookOpen, Scale, Cpu, Coins, ChevronLeft, ChevronRight } from 'lucide-react';



const TeamMemberCard = ({ name, role, quote, initial, email, phone }: { name: string, role: string, quote: string, initial: string, email?: string, phone?: string }) => {
  return (
    <div className="flex flex-col md:flex-row gap-8 items-center bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full">
       <div className="w-24 h-24 rounded-full bg-gradient-to-br from-citizen-purple to-citizen-green p-[2px] flex-shrink-0">
          <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden">
             <span className="font-serif text-2xl text-white">{initial}</span>
          </div>
       </div>
       <div className="text-center md:text-left flex-1">
          <h3 className="font-serif text-xl text-white mb-1">{name}</h3>
          <p className="text-citizen-purple font-medium mb-3 uppercase tracking-widest text-[10px]">{role}</p>
          <p className="text-zinc-400 leading-relaxed mb-4 italic text-xs">
             "{quote}"
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
             {email && <a href={`mailto:${email}`} className="text-[10px] text-citizen-green hover:underline">{email}</a>}
             {email && phone && <span className="text-zinc-600 hidden md:inline">|</span>}
             {phone && <span className="text-[10px] text-zinc-500">{phone}</span>}
          </div>
       </div>
    </div>
  );
};

const AboutPage: React.FC = () => {
  const [currentMember, setCurrentMember] = useState(0);

  const teamMembers = [
    {
      name: "Ryan O. van Gelder",
      role: "Founder & CVO",
      initial: "R",
      quote: "To live in a multiplicative world is to count differently. To see that 1 is never just 1. That every act, every element, every node, contains more than itself."
    },
    {
      name: "Tyler van Osdol",
      role: "Chief Operations Officer",
      initial: "T",
      quote: "Efficiency is not the reduction of effort, but the optimization of flow. We build the conduits so that reciprocity can move without friction."
    },
    {
      name: "Kara Olivarria",
      role: "Chief Education Officer",
      initial: "K",
      quote: "Education is the soil of the soul. We don't just teach facts; we cultivate the curiosity that allows a community to grow its own wisdom."
    }
  ];

  const nextMember = () => setCurrentMember((prev) => (prev + 1) % teamMembers.length);
  const prevMember = () => setCurrentMember((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);

  return (
    <div className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="py-24 bg-transparent relative z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-citizen-green text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
            >
              Our Identity
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-5xl md:text-7xl text-white mb-8"
            >
              About Citizen Gardens
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 text-xl leading-relaxed mb-12"
            >
              Citizen Gardens is a nonprofit public benefit organization, literary charity, and social investment credit union dedicated to prototyping a multiplicative society — one rooted in reciprocity, where civic infrastructure supports human dignity, environmental stewardship, and social coherence.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-8 bg-zinc-900/80 border border-zinc-800 rounded-3xl italic text-zinc-300 text-lg leading-relaxed"
            >
              "We operate on a foundational belief: no one wins alone. In a world that reduces people to data points, we protect the depth of human connection — counting every act of mutual giving and receiving as real social energy, turning invisible labor into sovereign infrastructure."
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-24 bg-zinc-900/30 border-t border-zinc-800 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div id="who-we-are-content">
              <h2 className="font-serif text-4xl text-white mb-8">Who We Are</h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                We are not a metaphor — we are the model. Citizen Gardens is a living, evolving system that embodies the principles of a multiplicative society in real time. Every process, practice, and partnership reflects the social architecture we propose for the world beyond our walls.
              </p>
              <p className="text-zinc-400 text-lg leading-relaxed">
                As both a literary charity and a civic R&D organization, our work spans creativity, care, governance, and education — but our core mission remains constant: to cultivate the conditions for a society where every voice matters and every life flourishes. We achieve this not through blueprints, but through growing things that live.
              </p>
            </div>
            <div className="relative flex flex-col justify-center h-full min-h-[300px]">
              <div className="relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMember}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TeamMemberCard {...teamMembers[currentMember]} />
                  </motion.div>
                </AnimatePresence>
              </div>
              
              <div className="flex items-center justify-between mt-8">
                <div className="flex gap-2">
                  {teamMembers.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentMember(i)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${currentMember === i ? 'bg-citizen-green w-6' : 'bg-zinc-800'}`}
                    />
                  ))}
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={prevMember}
                    className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-citizen-green hover:text-citizen-green transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={nextMember}
                    className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-citizen-green hover:text-citizen-green transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* What We Do */}
      <section className="py-24 bg-zinc-900/30 border-t border-zinc-800 relative z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <h2 className="font-serif text-4xl text-white mb-6">What We Do</h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Citizen Gardens operates as a nonprofit R&D shop for civic infrastructure — designing, testing, and publishing open-source frameworks that increase dignity, reciprocity, and ecological stewardship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-citizen-green/10 border border-citizen-green/30 flex items-center justify-center text-citizen-green">
                <Leaf size={24} />
              </div>
              <h3 className="font-serif text-2xl text-white">Sovereign Urban Gardens (SUG)</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Community-controlled garden nodes that combine food production, training, and local governance. Our sites transform vacant urban spaces into sovereignty nodes — growing not just vegetables, but music, mentorship, language, and healing — targeting ≥300 households served per year.
              </p>
            </div>
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-citizen-purple/10 border border-citizen-purple/30 flex items-center justify-center text-citizen-purple">
                <Scale size={24} />
              </div>
              <h3 className="font-serif text-2xl text-white">Criminal Justice & Reentry</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                A non-carceral, dignity-first department that designs reentry, diversion, and restorative programs for justice-impacted individuals. Our Rapid Reentry Sprints aim to cut missed court events by 30%, and our Diversion Micro-Courts offer community accountability as an alternative to the traditional justice system.
              </p>
            </div>
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-citizen-green/10 border border-citizen-green/30 flex items-center justify-center text-citizen-green">
                <Cpu size={24} />
              </div>
              <h3 className="font-serif text-2xl text-white">Civic R&D & Technology</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                We develop open-source civic tools — including ΛProof, EchoBraid, and Phase Mirror — that serve as SaaS infrastructure and consultation services grounded in Multiplicity Theory and social physics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ELM Section */}
      <section className="py-24 bg-transparent border-t border-zinc-800 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="font-serif text-4xl text-white mb-8">The Economy League Multiplicity (ELM)</h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                Our economic model redefines wealth as community well-being. Rather than monetary exchange, members earn credits for contributions of time, skill, and care.
              </p>
              <div className="space-y-4">
                {[
                  { title: 'Ingenuity Awards', desc: 'For creative solutions and innovation' },
                  { title: 'Opportunity Rewards', desc: 'For volunteering, governance, and project management' },
                  { title: 'Designation Rewards', desc: 'For contributing land, tools, or intellectual property for community use' },
                  { title: 'Sharing Rewards', desc: 'For bringing new members into the community' },
                  { title: 'Intrinsic Credits', desc: 'Non-exchangeable reputation metrics that track trust and eligibility for leadership' },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <h4 className="text-white font-medium text-sm mb-1">{item.title}</h4>
                    <p className="text-zinc-500 text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-10 bg-zinc-900 border border-zinc-800 rounded-3xl">
              <h3 className="font-serif text-2xl text-white mb-6">The Greenhouse Model</h3>
              <p className="text-zinc-400 leading-relaxed mb-8">
                Members can stake credits to fund community projects — receiving "living dividends" like produce, services, or community access in return.
              </p>
              <div className="aspect-video rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-citizen-green/10 to-transparent"></div>
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-full border border-citizen-green/30 flex items-center justify-center animate-bounce">
                    <Coins className="text-citizen-green" size={24} />
                  </div>
                  <div className="w-16 h-16 rounded-full border border-citizen-purple/30 flex items-center justify-center animate-bounce [animation-delay:0.2s]">
                    <Leaf className="text-citizen-purple" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Governance */}
      <section className="py-24 bg-transparent border-t border-zinc-800 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-4xl text-white mb-8">Governance</h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                Our internal structure rejects rigid hierarchies in favor of open, participatory flow. We operate as a recursive network of sovereign contributors, each empowered to initiate, evolve, and resonate with collective decisions.
              </p>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Governance is distributed into Sovereignty Nodes — local councils that operate via consent and resonance, ensuring that decisions emerge from collective agreement rather than top-down imposition. All frameworks — from garden blueprints to governance protocols — are published as open-source resources to encourage global replication.
              </p>
            </div>
            <div className="p-12 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-citizen-green/10 flex items-center justify-center text-citizen-green flex-shrink-0">1</div>
                  <p className="text-zinc-400 text-sm">Recursive network of sovereign contributors.</p>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-citizen-purple/10 flex items-center justify-center text-citizen-purple flex-shrink-0">2</div>
                  <p className="text-zinc-400 text-sm">Sovereignty Nodes operating via consent and resonance.</p>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-citizen-green/10 flex items-center justify-center text-citizen-green flex-shrink-0">3</div>
                  <p className="text-zinc-400 text-sm">Open-source frameworks for global replication.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="py-24 bg-zinc-900/30 border-t border-zinc-800 relative z-10">
        <div className="container mx-auto px-6 text-center max-w-3xl mx-auto">
          <p className="text-zinc-300 text-2xl font-serif leading-relaxed">
            Citizen Gardens is not the endpoint. It is a doorway. The real inheritance of this work is the world we get to live in — a world where reciprocity replaces rivalry, where creation outweighs consumption, and where everyone gets to participate in the making of meaning.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
