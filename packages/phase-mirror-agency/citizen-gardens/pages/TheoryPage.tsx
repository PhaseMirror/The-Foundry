import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Variable, 
  FunctionSquare, 
  Network, 
  ShieldCheck, 
  Scale, 
  Activity, 
  Box, 
  Layers, 
  GitMerge, 
  Eye,
  Search
} from 'lucide-react';

// Hidden Object Component
const HiddenArtifact: React.FC<{ x: string; y: string; label: string; content: string }> = ({ x, y, label, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute z-0" style={{ top: y, left: x }}>
      <motion.button
        whileHover={{ scale: 1.2, opacity: 1 }}
        className="text-zinc-800 hover:text-purple-500 transition-colors opacity-20"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Box className="w-6 h-6" />
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute left-0 mt-2 w-64 bg-zinc-900 border border-purple-500/30 p-4 rounded-xl shadow-2xl z-50 backdrop-blur-md"
          >
            <h4 className="text-purple-400 text-xs font-mono uppercase mb-2">{label}</h4>
            <p className="text-zinc-300 text-sm leading-relaxed">{content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MathBlock: React.FC<{ children: React.ReactNode; label?: string }> = ({ children, label }) => (
  <div className="my-6 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl font-mono text-sm md:text-base overflow-x-auto relative group">
    {label && (
      <span className="absolute top-2 right-2 text-[10px] text-zinc-600 uppercase tracking-wider group-hover:text-zinc-400 transition-colors">
        {label}
      </span>
    )}
    <div className="text-zinc-300">
      {children}
    </div>
  </div>
);

const TheoryPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen pt-24 pb-20 font-sans relative overflow-hidden">
      {/* Background Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Hidden Objects Scattered */}
      <HiddenArtifact 
        x="10%" y="15%" 
        label="Artifact 001: The Void" 
        content="Before the count, there is the potential for relation. The empty set is not nothing; it is the absence of constraint." 
      />
      <HiddenArtifact 
        x="85%" y="25%" 
        label="Artifact 002: The Prime" 
        content="Primes are the atoms of structure. They cannot be torn apart, only combined. They are the perfect index for irreducible identity." 
      />
      <HiddenArtifact 
        x="5%" y="60%" 
        label="Artifact 003: The Loop" 
        content="Recursion is not repetition. It is the same logic applied to a new scale. A fractal is a loop that remembers where it came from." 
      />
      <HiddenArtifact 
        x="90%" y="80%" 
        label="Artifact 005: The Mirror" 
        content="Dissonance is information. When the mirror cracks, the cracks map the tension. Don't fix the mirror; read the cracks." 
      />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/20 border border-purple-500/30 text-xs font-mono text-purple-400 mb-6">
            <Variable className="w-3 h-3" />
            FORMAL DEFINITION
          </div>
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-8 tracking-tight">
            Multiplicity <span className="text-zinc-500">Theory</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto">
            A prime-indexed, recursively stable framework for modeling how elements interact, recombine, and preserve identity across scales.
          </p>
        </motion.div>

        {/* 1. Core Multiplicity Idea */}
        <section className="mb-32 max-w-5xl mx-auto">
          <div className="flex items-start gap-6">
            <div className="hidden md:flex flex-col items-center mt-2">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-mono text-sm">1</div>
              <div className="w-px h-full bg-zinc-800 my-2" />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-3xl text-white mb-6">From Counting to Structure</h2>
              <div className="prose prose-invert max-w-none text-zinc-400">
                <p>
                  In basic counting, multiplicity is merely the number of times an element appears in a multiset. 
                  In Multiplicity Theory, we lift this intuition from a static label to a <strong>relation-governed structure</strong>.
                </p>
                <div className="grid md:grid-cols-2 gap-8 my-8">
                  <div className="p-6 bg-zinc-900/30 rounded-xl border border-zinc-800">
                    <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                      <Variable className="w-4 h-4 text-zinc-500" />
                      Classical View
                    </h3>
                    <p className="text-sm">
                      Elements are static labels. <br/>
                      <span className="font-mono text-purple-400">Total = Sum(Multiplicities)</span>
                    </p>
                  </div>
                  <div className="p-6 bg-purple-900/10 rounded-xl border border-purple-500/20">
                    <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                      <FunctionSquare className="w-4 h-4 text-purple-400" />
                      Multiplicity View
                    </h3>
                    <p className="text-sm">
                      Elements are shaped by interaction records.<br/>
                      <span className="font-mono text-purple-400">Behavior = Set(x, y, m(x,y))</span>
                    </p>
                  </div>
                </div>
                <p>
                  A multiplicity space <span className="font-mono text-white">M</span> is a collection of elements <span className="font-mono text-white">x ∈ X</span>, 
                  but instead of just counting them, we track the interaction records that occur across scales. 
                  This recasts counting as a <strong>dynamical process</strong> driven by recurrence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Prime-Indexed Interaction Spaces */}
        <section className="mb-32 max-w-5xl mx-auto">
          <div className="flex items-start gap-6">
            <div className="hidden md:flex flex-col items-center mt-2">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-mono text-sm">2</div>
              <div className="w-px h-full bg-zinc-800 my-2" />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-3xl text-white mb-6">Prime-Indexed Interaction Spaces</h2>
              <p className="text-zinc-400 mb-6">
                We index all significant interactions via prime numbers. Because primes are irreducible, the decomposition of any state into prime-indexed components is canonical.
              </p>
              
              <MathBlock label="Global State Product">
                M(k) = ∏ (p_i ≤ k) M_(p_i)
              </MathBlock>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
                {[2, 3, 5, 7].map((prime) => (
                  <motion.div 
                    key={prime}
                    whileHover={{ scale: 1.05, borderColor: 'rgba(168, 85, 247, 0.5)' }}
                    className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-center cursor-help group"
                  >
                    <div className="text-2xl font-mono text-white mb-1">{prime}</div>
                    <div className="text-xs text-zinc-500 group-hover:text-purple-400 transition-colors">
                      Channel T_{prime}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <p className="text-zinc-400">
                A prime-indexed interaction tensor <span className="font-mono text-white">T</span> associates each prime <span className="font-mono text-white">p_i</span> with a multiplicity channel.
                This ensures that we can refine the structure iteratively without collapsing the identity of the underlying interactions.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Recursive Stability */}
        <section className="mb-32 max-w-5xl mx-auto">
          <div className="flex items-start gap-6">
            <div className="hidden md:flex flex-col items-center mt-2">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-mono text-sm">3</div>
              <div className="w-px h-full bg-zinc-800 my-2" />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-3xl text-white mb-6">Recursive Stability</h2>
              <p className="text-zinc-400 mb-6">
                "Recursively stable" means identity is preserved under feedback. We use a <strong>Multiplicity Functor F</strong> to lift operations from level <span className="font-mono text-white">k</span> to <span className="font-mono text-white">k+1</span>.
              </p>

              <div className="relative p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <Layers className="w-24 h-24 text-purple-500" />
                </div>
                
                <h3 className="text-white font-medium mb-4">The Functor F</h3>
                <ul className="space-y-4 text-zinc-400">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>Collects interaction records (x, y, p) from M(k)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>Aggregates them into composite entities z = ⟨x, y, p⟩</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>Assigns multiplicities m(z) = ∑ T_p(x, y)</span>
                  </li>
                </ul>
              </div>

              <p className="mt-6 text-zinc-400">
                This is the machinery behind <strong>Phase-Mirror</strong>. Instead of blind aggregation, it surfaces dissonance as a prime-indexed invariant-violation channel.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Interaction Algebras */}
        <section className="mb-32 max-w-5xl mx-auto">
          <div className="flex items-start gap-6">
            <div className="hidden md:flex flex-col items-center mt-2">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-mono text-sm">4</div>
              <div className="w-px h-full bg-zinc-800 my-2" />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-3xl text-white mb-6">Interaction Algebras</h2>
              <p className="text-zinc-400 mb-6">
                Identity is emergent from the history of interactions. We define an interaction algebra <span className="font-mono text-white">A</span> with operations:
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <div className="font-mono text-purple-400 text-xl mb-2">⊕_p</div>
                  <div className="text-sm text-zinc-400">Multiplicity-addition along prime channel p</div>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <div className="font-mono text-purple-400 text-xl mb-2">⊗_p</div>
                  <div className="text-sm text-zinc-400">Interaction-fusion along channel p</div>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <div className="font-mono text-purple-400 text-xl mb-2">R_p</div>
                  <div className="text-sm text-zinc-400">Reduction of composites back to base</div>
                </div>
              </div>

              <MathBlock label="Identity Signature">
                σ(x) = {'{'}(p_i, α_i) | α_i = interaction pattern of x in channel p_i{'}'}
              </MathBlock>
              
              <p className="text-zinc-400">
                This maps directly to the <strong>Q-Calculator</strong>. Each run is a multiplicity-preserving homomorphism that projects the interaction graph into countable invariants.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Infrastructure Invariants */}
        <section className="mb-32 max-w-5xl mx-auto">
          <div className="flex items-start gap-6">
            <div className="hidden md:flex flex-col items-center mt-2">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-mono text-sm">5</div>
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-3xl text-white mb-12">Infrastructure Invariants</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {/* ΛProof */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="group relative p-6 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <ShieldCheck className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-white font-serif text-xl mb-3">ΛProof</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                    Prime-indexed proof-only layers. Every state transition is tagged with a proof label living in a verification hierarchy.
                  </p>
                  <div className="text-xs font-mono text-purple-400/70">
                    M_proof = Audit Lattice
                  </div>
                </motion.div>

                {/* Phase-Mirror */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="group relative p-6 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <GitMerge className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-white font-serif text-xl mb-3">Phase-Mirror</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                    Dissonance as prime-indexed tension. Accumulates the "number of times" design choices pull in opposite directions.
                  </p>
                  <div className="text-xs font-mono text-purple-400/70">
                    D_p = Dissonance Tensor
                  </div>
                </motion.div>

                {/* PIRTM */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="group relative p-6 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Activity className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-white font-serif text-xl mb-3">PIRTM</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                    Policy and impact multiplicity. Modeling how outcomes are reached via distinct policy parameterizations.
                  </p>
                  <div className="text-xs font-mono text-purple-400/70">
                    Policy Lattices
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Summary Footer */}
        <div className="max-w-3xl mx-auto text-center border-t border-zinc-800 pt-16">
          <p className="text-zinc-500 italic">
            "Multiplicity is counting with recurrence, not just enumeration."
          </p>
        </div>

      </div>
    </div>
  );
};

export default TheoryPage;
