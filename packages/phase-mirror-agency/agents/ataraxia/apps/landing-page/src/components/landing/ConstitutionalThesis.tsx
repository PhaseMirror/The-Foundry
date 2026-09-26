"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function ConstitutionalThesis() {
  const steps = ["Reflect", "Surface tensions", "Decompose to levers", "Reach fixed point", "Act"];

  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6 flex flex-col items-center text-center">
        <motion.div 
          className="max-w-2xl flex flex-col gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-primary-text">
            Constitutional Thesis
          </h2>
          <p className="text-lg text-secondary-text leading-relaxed">
            Ataraxia does not act on first impression; it reflects, decomposes, and resolves until no unresolved tension remains. We ensure that every AI-driven action is a logical consequence of governed intent.
          </p>
        </motion.div>

        <div className="mt-16 w-full max-w-4xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 relative">
            {/* Connecting line (Desktop) */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-accent-cyan/20 -translate-y-1/2 hidden md:block -z-10" />
            
            {steps.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-4 relative">
                <motion.div 
                  className="h-4 w-4 rounded-full bg-accent-cyan shadow-[0_0_15px_rgba(77,226,230,0.5)]"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                />
                <motion.span 
                  className="font-mono text-[10px] uppercase tracking-widest text-secondary-text"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                >
                  {step}
                </motion.span>
                {i < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-accent-cyan/40 md:hidden" />
                )}
              </div>
            ))}
          </div>
        </div>

        <motion.div 
          className="mt-24 p-8 glass rounded-2xl max-w-xl border-l-4 border-l-accent-cyan"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <blockquote className="text-2xl md:text-3xl font-heading font-medium italic text-primary-text leading-tight">
            “Ataraxia does not manage uncertainty. It resolves it.”
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}
