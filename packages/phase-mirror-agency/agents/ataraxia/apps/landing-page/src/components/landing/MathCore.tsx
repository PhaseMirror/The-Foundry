"use client";

import { motion } from "framer-motion";
import { InlineMath, BlockMath } from "react-katex";
import { Check } from "lucide-react";

export default function MathCore() {
  const points = ["Contractive", "Observable", "Explainable", "Auditable"];

  return (
    <section id="math" className="py-24 bg-background border-y border-white/5 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center gap-6 mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-primary-text">
            Mathematical Core
          </h2>
          <p className="text-secondary-text max-w-2xl">
            Ataraxia governance is not advisory; it is a mathematical constraint on state transitions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Equation 1 */}
          <motion.div 
            className="glass rounded-2xl p-8 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-6">
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent-cyan">State Transition Projection</span>
            </div>
            <div className="py-12 flex justify-center text-accent-cyan text-2xl">
              <BlockMath math="\psi_{t+1} = P_E \cdot \Pi_{\text{CSL}} \cdot T_{\Lambda_m}(\psi_t, x_t)" />
            </div>
            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-sm text-secondary-text">
                “The MultiplicityCell advances state under constitutional and ethical projection.”
              </p>
            </div>
          </motion.div>

          {/* Equation 2 */}
          <motion.div 
            className="glass rounded-2xl p-8 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-6">
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent-cyan">PEET Drift Measurement</span>
            </div>
            <div className="py-12 flex justify-center text-accent-cyan text-2xl">
              <BlockMath math="\delta_{\text{PEET}}(n,t) = |\psi(n,t) - \Psi(n,t)| \cdot \kappa" />
            </div>
            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-sm text-secondary-text">
                “PEET measures spectral deviation from the certified prime-tensor baseline.”
              </p>
            </div>
          </motion.div>
        </div>

        {/* Benefits Row */}
        <div className="mt-16 flex flex-wrap justify-center gap-4 md:gap-12">
          {points.map((point, i) => (
            <motion.div 
              key={point}
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + (i * 0.1) }}
            >
              <div className="h-5 w-5 rounded-full bg-success-green/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-success-green" />
              </div>
              <span className="font-heading text-lg font-medium text-primary-text">{point}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
