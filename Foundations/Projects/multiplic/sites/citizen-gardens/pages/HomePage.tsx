import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Heart, Shield, GraduationCap, BookOpen, Code, Database, Zap, ArrowRightLeft, Link as LinkIcon, Lock, User, Sprout, PenTool } from 'lucide-react';

const WorkstreamCard = ({ title, icon: Icon, desc }: { title: string, icon: any, desc: string }) => (
  <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-citizen-green/50 hover:bg-zinc-900 transition-all duration-300 group">
    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-citizen-green mb-4 group-hover:scale-110 transition-transform">
      <Icon size={20} />
    </div>
    <h3 className="font-serif text-xl text-zinc-100 mb-2">{title}</h3>
    <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
  </div>
);

const HomePage: React.FC = () => {
  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Hero Section */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-lexend text-[31px] md:text-[67px] font-light leading-tight mb-8 text-[#cccccc]"
          >
            Literary Charity for the <br/>
            Reciprocity of Multiplicity.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-12"
          >
            A nonprofit R&D shop for civic infrastructure. We prototype systems that increase dignity, reciprocity, and ecological stewardship.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-center gap-6"
          >
             <button onClick={scrollToSection('mission')} className="px-8 py-3 bg-transparent border border-zinc-700 text-white rounded-full hover:border-citizen-purple hover:text-citizen-purple transition-all font-medium tracking-wide text-sm">
                Explore Mission
             </button>
             <a href="/theory" className="px-8 py-3 bg-transparent border border-zinc-700 text-white rounded-full hover:border-citizen-green hover:text-citizen-green transition-all font-medium tracking-wide text-sm flex items-center">
                The Science
             </a>
          </motion.div>
        </div>
      </header>

      <main>
        {/* Mission / Intro */}
        <section id="mission" className="py-24 bg-transparent relative z-10">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div>
                   <h2 className="font-serif text-4xl text-white mb-6">A Multiplicative Revolution</h2>
                   <div className="w-20 h-1 bg-citizen-green mb-8"></div>
                   <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                      Citizen Gardens invites individuals and organizations to join a philanthropic journey rooted in <strong>Multiplicity</strong>. We believe that positive change is most impactful when it addresses a broad spectrum of needs through holistic empowerment.
                   </p>
                   <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                      We cultivate a garden of change where the seeds of philanthropy, reciprocity, and creativity blossom into a brighter, more equitable future.
                   </p>
                   <div className="grid grid-cols-2 gap-4 mt-8">
                       <div className="p-4 border-l-2 border-citizen-purple">
                           <h4 className="text-white font-serif text-xl mb-1">Non-Profit</h4>
                           <p className="text-xs text-zinc-500 uppercase tracking-wider">501(c)(3) Organization</p>
                       </div>
                       <div className="p-4 border-l-2 border-citizen-green">
                           <h4 className="text-white font-serif text-xl mb-1">Open Source</h4>
                           <p className="text-xs text-zinc-500 uppercase tracking-wider">Public Benefit Platform</p>
                       </div>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <WorkstreamCard 
                        title="Civic Prototypes" 
                        icon={Leaf}
                        desc="Integrated living-labor nodes (housing + gardens + training) tailored to local conditions." 
                    />
                    <WorkstreamCard 
                        title="Participation Economy" 
                        icon={Heart}
                        desc="Time-banking and reciprocal credits. Rewards for ingenuity, designation, and sharing." 
                    />
                    <WorkstreamCard 
                        title="Trust Tools" 
                        icon={Shield}
                        desc="Consent-respecting digital platforms and shared ledgers for collective authorship." 
                    />
                    <WorkstreamCard 
                        title="Learning Systems" 
                        icon={GraduationCap}
                        desc="Multi-generational, multi-modal curricula. Schools as co-learning ecosystems." 
                    />
                </div>
            </div>
          </div>
        </section>

        {/* Literary Charity Section */}
        <section className="py-24 bg-zinc-900/30 border-t border-zinc-800 relative z-10">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <span className="text-citizen-purple text-xs font-bold tracking-[0.2em] uppercase mb-4 block">The Living Body</span>
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-8">We Carry Meanings, Not Just Books.</h2>
              <p className="text-zinc-400 text-xl leading-relaxed mb-12">
                Most definitions are static. Ours is a living body. <strong className="text-white">Literary Charity</strong> is the act of protecting civic language—like Multiplicity and Reciprocity—from being diluted. We treat every essay, ledger entry, and shared story as the 'code' that runs our community.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                  <BookOpen className="text-citizen-green mb-4" size={24} />
                  <h3 className="text-white font-serif text-xl mb-3">The Narrative</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Lived experiences that define our "Why." Stories that provide the context and justification for every action recorded.
                  </p>
                </div>
                <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                  <Code className="text-citizen-purple mb-4" size={24} />
                  <h3 className="text-white font-serif text-xl mb-3">The Protocol</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    The rules of engagement and the math of Multiplicity. The technical framework that ensures fairness and transparency.
                  </p>
                </div>
                <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                  <Database className="text-citizen-green mb-4" size={24} />
                  <h3 className="text-white font-serif text-xl mb-3">The Ledger</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    The transparent record of who did what and how it moved the needle. A sovereign memory of our collective energy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ELM Section */}
        <section className="py-24 bg-transparent border-t border-zinc-800 relative z-10">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-citizen-green text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Economy League Multiplicity</span>
                <h2 className="font-serif text-4xl md:text-5xl text-white mb-8">A New Rule of Counting: No One Wins Alone.</h2>
                <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                  In <strong className="text-white">Economy League Multiplicity (ELM)</strong>, an unpaired individual has zero effective social energy. Value is unlocked the moment we interact. We don’t count people; we count the multiplicity of their relationships.
                </p>
                <div className="p-6 bg-citizen-green/5 border border-citizen-green/20 rounded-xl">
                  <p className="text-citizen-green text-sm italic">"A framework where an individual's social energy is zero until paired through reciprocity. Value is in relationships, not individuals."</p>
                </div>
              </div>
              
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 md:p-12">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Set Theory</span>
                    <div className="flex flex-col gap-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <div key={n} className="w-10 h-10 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-600 font-mono text-xs">
                          #{n}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-zinc-600 italic leading-tight">"Duplicates are erased. Individuals are isolated."</p>
                  </div>
                  
                  <div className="space-y-6">
                    <span className="text-citizen-purple text-[10px] uppercase tracking-widest font-bold">Social Physics</span>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-citizen-purple/20 border border-citizen-purple/40 flex items-center justify-center text-citizen-purple font-mono text-xs">1</div>
                        <span className="text-zinc-700">×</span>
                        <div className="w-10 h-10 rounded-lg bg-citizen-purple/20 border border-citizen-purple/40 flex items-center justify-center text-citizen-purple font-mono text-xs">2</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-700 ml-5">×</span>
                        <div className="w-10 h-10 rounded-lg bg-citizen-purple/20 border border-citizen-purple/40 flex items-center justify-center text-citizen-purple font-mono text-xs">3</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-700 ml-5">×</span>
                        <div className="w-10 h-10 rounded-lg bg-citizen-purple/20 border border-citizen-purple/40 flex items-center justify-center text-citizen-purple font-mono text-xs">4</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-700 ml-5">×</span>
                        <div className="w-10 h-10 rounded-lg bg-citizen-purple/20 border border-citizen-purple/40 flex items-center justify-center text-citizen-purple font-mono text-xs">5</div>
                      </div>
                    </div>
                    <p className="text-[10px] text-citizen-purple italic leading-tight">"Value is unlocked through interaction, not isolation."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Credits Section */}
        <section className="py-24 bg-zinc-900/50 border-t border-zinc-800 relative z-10">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-citizen-purple text-xs font-bold tracking-[0.2em] uppercase mb-4 block">The Credit System</span>
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">From Invisible Labor to Measured Reciprocity.</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-zinc-950/50 border border-zinc-800 rounded-2xl hover:border-citizen-green/30 transition-colors">
                <Zap className="text-citizen-green mb-4" size={24} />
                <h3 className="text-white font-serif text-lg mb-2">The Spark</h3>
                <p className="text-citizen-green text-[10px] uppercase tracking-widest font-bold mb-3">Ingenuity & Designation</p>
                <p className="text-zinc-500 text-sm leading-relaxed">Recognizing the creative labor of naming problems and designing solutions.</p>
              </div>
              <div className="p-6 bg-zinc-950/50 border border-zinc-800 rounded-2xl hover:border-citizen-purple/30 transition-colors">
                <ArrowRightLeft className="text-citizen-purple mb-4" size={24} />
                <h3 className="text-white font-serif text-lg mb-2">The Flow</h3>
                <p className="text-citizen-purple text-[10px] uppercase tracking-widest font-bold mb-3">Opportunity & Sharing</p>
                <p className="text-zinc-500 text-sm leading-relaxed">Measuring the movement of resources, tools, and access through the network.</p>
              </div>
              <div className="p-6 bg-zinc-950/50 border border-zinc-800 rounded-2xl hover:border-citizen-green/30 transition-colors">
                <LinkIcon className="text-citizen-green mb-4" size={24} />
                <h3 className="text-white font-serif text-lg mb-2">The Bridge</h3>
                <p className="text-citizen-green text-[10px] uppercase tracking-widest font-bold mb-3">Sponsorship Credits</p>
                <p className="text-zinc-500 text-sm leading-relaxed">Quantifying the energy used to pull others into the circle of value.</p>
              </div>
              <div className="p-6 bg-zinc-950/50 border border-zinc-800 rounded-2xl hover:border-citizen-purple/30 transition-colors">
                <Lock className="text-citizen-purple mb-4" size={24} />
                <h3 className="text-white font-serif text-lg mb-2">The Weight of Trust</h3>
                <p className="text-citizen-purple text-[10px] uppercase tracking-widest font-bold mb-3">Intrinsic Credits</p>
                <p className="text-zinc-500 text-sm leading-relaxed">Earned through consistent care. Non-exchangeable; the only way to access high-level governance.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Volumes Section */}
        <section className="py-24 bg-transparent border-t border-zinc-800 relative z-10">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-16 items-start">
              <div className="lg:w-1/3 lg:sticky lg:top-32">
                <span className="text-citizen-green text-xs font-bold tracking-[0.2em] uppercase mb-4 block">The Chapters</span>
                <h2 className="font-serif text-4xl text-white mb-6">Stories That Become Systems.</h2>
                <p className="text-zinc-400 leading-relaxed">
                  We don't just write about gardens; we build them. Our 'Chapters' are real-world sites—Sovereign Urban Gardens and Justice Pathways—where the bylaws are written in soil and sweat.
                </p>
              </div>
              
              <div className="lg:w-2/3 w-full space-y-4">
                {[
                  { vol: 'Vol I', title: 'The Garden', desc: 'Food Sovereignty Protocols' },
                  { vol: 'Vol II', title: 'The Gate', desc: 'Re-entry & Justice Frameworks' },
                  { vol: 'Vol III', title: 'The Ledger', desc: 'Open-Source Governance Code' },
                  { vol: 'Vol IV', title: 'The Weave', desc: 'Social Fabric Repair Kits' },
                  { vol: 'Vol V', title: 'The Lens', desc: 'Community Data Trusts' },
                ].map((item, i) => (
                  <div key={i} className="group flex items-center justify-between p-8 border-b border-zinc-800 hover:bg-zinc-900/50 transition-all cursor-default">
                    <div className="flex items-center gap-8">
                      <span className="font-mono text-zinc-600 text-xs tracking-widest">{item.vol}</span>
                      <div>
                        <h3 className="text-white font-serif text-2xl group-hover:text-citizen-green transition-colors">{item.title}</h3>
                        <p className="text-zinc-500 text-sm mt-1">{item.desc}</p>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-citizen-green transition-colors">
                      <ArrowRightLeft size={16} className="text-zinc-700 group-hover:text-citizen-green" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="py-24 bg-zinc-900/30 border-t border-zinc-800 relative z-10">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-citizen-purple text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Get Involved</span>
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">Choose How You Want to Multiply.</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-10 bg-zinc-950 border border-zinc-800 rounded-3xl hover:border-citizen-green/50 transition-all group">
                <User className="text-citizen-green mb-6 group-hover:scale-110 transition-transform" size={32} />
                <h3 className="text-white font-serif text-2xl mb-4">The Author</h3>
                <p className="text-zinc-400 text-sm mb-8 italic">"I have a story to tell."</p>
                <div className="space-y-4 pt-6 border-t border-zinc-900">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600 uppercase tracking-widest">Action</span>
                    <span className="text-zinc-300">Submit field notes</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600 uppercase tracking-widest">Reward</span>
                    <span className="text-citizen-green">Participation Credits</span>
                  </div>
                </div>
              </div>
              
              <div className="p-10 bg-zinc-950 border border-zinc-800 rounded-3xl hover:border-citizen-purple/50 transition-all group">
                <Sprout className="text-citizen-purple mb-6 group-hover:scale-110 transition-transform" size={32} />
                <h3 className="text-white font-serif text-2xl mb-4">The Gardener</h3>
                <p className="text-zinc-400 text-sm mb-8 italic">"I have hands to work."</p>
                <div className="space-y-4 pt-6 border-t border-zinc-900">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600 uppercase tracking-widest">Action</span>
                    <span className="text-zinc-300">Join a physical site</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600 uppercase tracking-widest">Reward</span>
                    <span className="text-citizen-purple">ELM counted energy</span>
                  </div>
                </div>
              </div>
              
              <div className="p-10 bg-zinc-950 border border-zinc-800 rounded-3xl hover:border-citizen-green/50 transition-all group">
                <PenTool className="text-citizen-green mb-6 group-hover:scale-110 transition-transform" size={32} />
                <h3 className="text-white font-serif text-2xl mb-4">The Architect</h3>
                <p className="text-zinc-400 text-sm mb-8 italic">"I want to build the rules."</p>
                <div className="space-y-4 pt-6 border-t border-zinc-900">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600 uppercase tracking-widest">Action</span>
                    <span className="text-zinc-300">Annotate the Lexicon</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600 uppercase tracking-widest">Reward</span>
                    <span className="text-citizen-green">Intrinsic Credits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default HomePage;
