"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Activity, Shield, Cpu } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 grid-overlay -z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background -z-10" />
      
      {/* Background Particle Drift (Subtle) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 -z-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 bg-accent-cyan rounded-full"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: Math.random()
            }}
            animate={{ 
              y: [null, "-20%"],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 5 + Math.random() * 10, 
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Content */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap gap-3">
            <Badge icon={<Cpu className="h-3 w-3" />} text="Offline-first sovereign node" />
            <Badge icon={<Activity className="h-3 w-3" />} text="Prime-indexed provenance" />
            <Badge icon={<Shield className="h-3 w-3" />} text="Constitutional runtime" />
          </div>

          <div className="flex flex-col gap-4">
            <motion.h1 
              className="font-heading text-6xl md:text-8xl font-bold tracking-tighter text-primary-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Ataraxia
            </motion.h1>
            <motion.p 
              className="font-heading text-2xl md:text-3xl text-accent-cyan font-medium leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Undisturbed equilibrium for clinical AI.
            </motion.p>
            <motion.p 
              className="text-lg text-secondary-text max-w-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              A governance-first runtime for clinical intelligence that resolves uncertainty through recursive decomposition, prime-indexed provenance, and offline sovereign deployment.
            </motion.p>
          </div>

          <motion.div 
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button className="flex items-center gap-2 rounded-full bg-accent-cyan px-8 py-4 text-sm font-bold text-background hover:opacity-90 transition-all">
              Read the Architecture <ArrowRight className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-2 rounded-full border border-white/10 px-8 py-4 text-sm font-bold text-primary-text hover:bg-white/5 transition-all">
              View Constitutional Stack <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>

        {/* Right Side: Governance Lattice Animation */}
        <div className="relative hidden lg:block">
          <div className="glass aspect-square rounded-3xl p-8 flex items-center justify-center overflow-hidden">
            <GovernanceLattice />
          </div>
          {/* Subtle glow behind the lattice */}
          <div className="absolute inset-0 bg-accent-cyan/10 blur-[120px] rounded-full -z-10" />
        </div>
      </div>
    </section>
  );
}

function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-accent-cyan">
      {icon}
      {text}
    </div>
  );
}

function GovernanceLattice() {
  const nodes = [
    { name: "ahgi.consent", x: 100, y: 100 },
    { name: "ahgi.model_version", x: 300, y: 150 },
    { name: "ahgi.agent_action", x: 150, y: 350 },
    { name: "ahgi.clinical_auth", x: 350, y: 300 },
  ];

  const connections = [
    [0, 1], [0, 2], [1, 3], [2, 3], [0, 3]
  ];

  return (
    <svg viewBox="0 0 450 450" className="w-full h-full">
      {/* Grid lines */}
      <defs>
        <pattern id="lattice-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(77, 226, 230, 0.1)" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lattice-grid)" />

      {/* Connections */}
      {connections.map(([start, end], i) => (
        <motion.line
          key={`conn-${i}`}
          x1={nodes[start].x}
          y1={nodes[start].y}
          x2={nodes[end].x}
          y2={nodes[end].y}
          stroke="#4DE2E6"
          strokeWidth="1"
          strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 2, delay: i * 0.2 }}
        />
      ))}

      {/* Pulsing signal flows */}
      {connections.map(([start, end], i) => (
        <motion.circle
          key={`pulse-${i}`}
          r="2"
          fill="#4DE2E6"
          initial={{ offset: 0 }}
          animate={{ 
            cx: [nodes[start].x, nodes[end].x],
            cy: [nodes[start].y, nodes[end].y],
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Nodes */}
      {nodes.map((node, i) => (
        <g key={`node-${i}`}>
          <motion.circle
            cx={node.x}
            cy={node.y}
            r="6"
            fill="#05070B"
            stroke="#4DE2E6"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: i * 0.2 }}
          />
          <motion.circle
            cx={node.x}
            cy={node.y}
            r="12"
            stroke="#4DE2E6"
            strokeWidth="1"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.5, 0], scale: [0.5, 2, 2.5] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
          />
          <text 
            x={node.x} 
            y={node.y + 24} 
            className="fill-secondary-text text-[10px] font-mono"
            textAnchor="middle"
          >
            {node.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
