import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calculator, Divide, Hash, Network, Share2, Sigma, ArrowRight } from 'lucide-react';

const MultiplicityPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 font-sans">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-purple-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            CORE THEORY
          </div>
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-8 tracking-tight">
            The Basics of <span className="text-purple-400 italic">Counting</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto">
            Standard arithmetic counts individuals as separate atoms. Multiplicity counts relationships, contexts, and the overlapping textures of shared identity.
          </p>
        </motion.div>

        {/* The Problem with "One" */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl text-white mb-6">The Problem with "One"</h2>
            <p className="text-zinc-400 leading-relaxed mb-6">
              In traditional systems (like voting or banking), you are a single, atomic "1". This ignores the reality that you are a father, a neighbor, a gardener, and a citizen all at once.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              When we force multidimensional humans into one-dimensional databases, we lose the <strong>context</strong> that makes cooperation possible. We treat strangers and neighbors exactly the same.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 flex items-center justify-center aspect-square"
          >
            <div className="text-center">
              <div className="text-6xl font-mono text-zinc-600 mb-4">1 + 1 = 2</div>
              <div className="text-sm text-zinc-500 uppercase tracking-widest">Standard Arithmetic</div>
            </div>
          </motion.div>
        </div>

        {/* Prime-Indexed Identity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
           <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 flex items-center justify-center aspect-square order-2 md:order-1"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 text-4xl font-mono text-purple-400 mb-4">
                <span>2</span>
                <span className="text-zinc-600">×</span>
                <span>3</span>
                <span className="text-zinc-600">×</span>
                <span>5</span>
                <span className="text-zinc-600">=</span>
                <span className="text-white">30</span>
              </div>
              <div className="text-sm text-zinc-500 uppercase tracking-widest">Prime Decomposition</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 md:order-2"
          >
            <h2 className="font-serif text-3xl text-white mb-6">Prime-Indexed Identity</h2>
            <p className="text-zinc-400 leading-relaxed mb-6">
              Multiplicity uses <strong>prime numbers</strong> to represent contexts. If "Gardeners" is 2, "Teachers" is 3, and "Locals" is 5, then a local teacher-gardener is the unique product: <strong>30</strong>.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              This allows us to mathematically decompose any group into its constituent contexts without needing a central list of names. It is privacy-preserving by design.
            </p>
          </motion.div>
        </div>

        {/* The Q-Calculator */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-12 mb-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 mb-6">
              <Calculator className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-3xl text-white mb-4">The Q-Calculator</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              A computational framework for decomposing multiplicity spaces and identity interactions into prime-indexed components.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-black/20 rounded-xl border border-zinc-800/50">
              <Divide className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-white font-medium mb-2">Decomposition</h3>
              <p className="text-sm text-zinc-500">Breaking down complex social intersections into fundamental prime factors.</p>
            </div>
            <div className="p-6 bg-black/20 rounded-xl border border-zinc-800/50">
              <Network className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-white font-medium mb-2">Intersection</h3>
              <p className="text-sm text-zinc-500">Calculating the precise overlap of communities using greatest common divisors (GCD).</p>
            </div>
            <div className="p-6 bg-black/20 rounded-xl border border-zinc-800/50">
              <Share2 className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-white font-medium mb-2">Union</h3>
              <p className="text-sm text-zinc-500">Merging distinct identity spaces while preserving their unique provenance.</p>
            </div>
          </div>
        </div>

        {/* Core Concepts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          <div className="p-8 rounded-2xl bg-zinc-900/20 border border-zinc-800">
            <h3 className="font-serif text-xl text-white mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5 text-zinc-500" />
              Ordinal vs. Cardinal
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              We move beyond simple headcounts (cardinality) to understand the structure and position of participants (ordinality) within the network graph.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-zinc-900/20 border border-zinc-800">
            <h3 className="font-serif text-xl text-white mb-4 flex items-center gap-2">
              <Sigma className="w-5 h-5 text-zinc-500" />
              Plurality
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Acknowledging that "the people" is not a monolith, but a shifting coalition of intersecting groups, each with valid but distinct claims.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-24">
          <h2 className="font-serif text-3xl text-white mb-6">Ready to explore the full theory?</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-8">
            Dive deeper into the mathematical and philosophical foundations of Multiplicity, including ΛProof and the Ξ-Constitution.
          </p>
          <Link 
            to="/theory"
            className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-medium transition-colors"
          >
            Dive Deeper
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default MultiplicityPage;
