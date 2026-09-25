
import React from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  ChevronDown, 
  Info, 
  Users, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Database, 
  Monitor, 
  CreditCard,
  MessageCircle,
  Stethoscope
} from 'lucide-react';

interface FAQPageProps {
  isDarkMode: boolean;
}

const FAQPage: React.FC<FAQPageProps> = ({ isDarkMode }) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const faqs = [
    {
      question: "What is ΞchoBraid?",
      answer: "ΞchoBraid is a neurodivergent‑affirming learning space that combines an ASD‑aligned curriculum with low‑stimulus software to support learners from childhood through adulthood. It centers predictable routines, learner sovereignty, and offline‑first tools so that learning feels safe, coherent, and sustainable.",
      icon: <Info size={20} />
    },
    {
      question: "Who is ΞchoBraid for?",
      answer: "ΞchoBraid is designed for autistic and otherwise neurodivergent learners, their families, and the educators and therapists who support them. The curriculum is age‑banded (K–adult) and can be used in home, school, and clinical settings.",
      icon: <Users size={20} />
    },
    {
      question: "How is this different from other learning apps?",
      answer: "Most platforms optimize for engagement and speed; ΞchoBraid optimizes for coherence, safety, and consent. Instead of scores and streaks, you get short cycles, simple evidence of growth, and opt‑in signals like Soft Loop, Holo‑Scriptor, and Coherence Map.",
      icon: <Zap size={20} />
    },
    {
      question: "What does a typical ΞchoBraid day look like?",
      answer: "A day is framed by three Ξcho Routines: Arrival Regulation, a Communication Warm‑up, and a closing Reflection. Across the week, learners participate in Talking‑Stick Circles, Tool‑Build sessions, and Literacy Returns, all with explicit opt‑out paths and clear visuals.",
      icon: <Clock size={20} />
    },
    {
      question: "Is ΞchoBraid a replacement for school or therapy?",
      answer: "No. ΞchoBraid is a support layer that can sit alongside school, homeschooling, or therapeutic programs. It offers structure, tools, and curriculum that educators and clinicians can integrate into their existing plans, not a diagnosis or treatment service.",
      icon: <Stethoscope size={20} />
    },
    {
      question: "How does personalization work?",
      answer: "ΞchoBraid uses spiral strands (Regulation, Communication, Social Reciprocity, Systems Tool‑Making, Ethics, Data‑Informed Adaptation) that repeat with increasing complexity over time. Within each 6‑week cycle, families and educators choose focus strands, track a few simple metrics, and adjust one variable at a time based on what actually helps the learner.",
      icon: <HelpCircle size={20} />
    },
    {
      question: "How do you keep neurodivergent learners from feeling overwhelmed?",
      answer: "The design is intentionally low‑stimulus, with adjustable visual density, optional motion, short tasks, and clear timers you can hide. ΞchoBraid also emphasizes reduced verbal load, previewing changes, sensory‑friendly options, and routine‑based transitions to reduce anxiety.",
      icon: <Zap size={20} />
    },
    {
      question: "How does ΞchoBraid handle safety and consent?",
      answer: "ΞchoBraid’s architecture is grounded in the ΞchoThread framework, which includes an ethical firewall (the 12 layer), anticipatory silence, and user‑controlled memory. In practice, that means explicit consent prompts around sensitive content, visible Pause/Quiet controls, and clear ways to opt out or erase a session.",
      icon: <ShieldCheck size={20} />
    },
    {
      question: "What happens to my data?",
      answer: "By default, nothing is saved unless you explicitly opt in for that session. You can choose “Erase after 24 hours,” “Local only,” or export to PDF; there is no cross‑site tracking and analytics are aggregate and privacy‑first.",
      icon: <Database size={20} />
    },
    {
      question: "Do learners need an account?",
      answer: "You can try the 2‑minute demo with no account at all; demo flows default to “Do not save anything.” Accounts for minors require verified adult consent, and school deployments use clear data‑processing agreements.",
      icon: <ShieldCheck size={20} />
    },
    {
      question: "What devices do I need?",
      answer: "ΞchoBraid runs in a modern browser and is designed to work on standard laptops or tablets; the curriculum itself is offline‑first and heavily paper‑friendly. Core tools like Firebooks, visual schedules, and calm kits can be used entirely without screens if needed.",
      icon: <Monitor size={20} />
    },
    {
      question: "How much does it cost?",
      answer: "The core app and a starter set of curriculum cards are free to use. Additional “Pro Site” plans for schools and clinics are planned with transparent pricing and comparison tables.",
      icon: <CreditCard size={20} />
    },
    {
      question: "I’m a parent. Where should I start?",
      answer: "Most families begin with the Ξcho Routines and a simple Tool‑Build, such as creating a personal calm kit or visual schedule. The “For Families” section offers quick‑start guides, printable templates, and suggestions for a gentle first 6‑week cycle.",
      icon: <MessageCircle size={20} />
    },
    {
      question: "I’m an educator or therapist. How do I integrate this?",
      answer: "You can use ΞchoBraid as a daily opener/closer, a weekly Talking‑Stick Circle, or as a structured intervention block aligned with IEP or therapy goals. The “For Educators” pages include implementation checklists, consent‑based scripts, and sample lesson integrations.",
      icon: <Users size={20} />
    }
  ];

  return (
    <div className={`pt-16 pb-24 ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>
      <div className="container mx-auto px-8">
        
        {/* FAQ Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mb-24"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent block mb-6">Resources</span>
          <h1 className={`text-4xl md:text-6xl font-bold mb-10 leading-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Answers for <br /><span className="italic font-medium text-stone-400">curious minds.</span>
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed text-stone-500 font-medium max-w-2xl">
            Everything you need to know about the ΞchoBraid environment, from data privacy to daily routines.
          </p>
        </motion.div>

        {/* FAQ Grid */}
        <div className="max-w-5xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-[2rem] border overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-zinc-900/30 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-8 flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-zinc-950 text-brand-accent' : 'bg-stone-50 text-brand-accent'}`}>
                    {faq.icon}
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-brand-accent transition-colors">
                    {faq.question}
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  className="text-stone-400"
                >
                  <ChevronDown size={20} />
                </motion.div>
              </button>
              
              <motion.div
                initial={false}
                animate={{ height: openIndex === index ? 'auto' : 0, opacity: openIndex === index ? 1 : 0 }}
                className="overflow-hidden"
              >
                <div className={`px-24 pb-10 text-stone-500 leading-relaxed font-medium`}>
                  <p className="max-w-3xl">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Support Section */}
        <section className={`mt-32 p-12 md:p-20 rounded-[4rem] text-center ${isDarkMode ? 'bg-zinc-900/40 border border-stone-800' : 'bg-brand-light border border-stone-100'}`}>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Still have questions?</h2>
            <p className="text-lg text-stone-500 font-medium mb-12">
              Our community and support teams are here to help you navigate your first cycles.
            </p>
            <button className={`px-10 py-4 rounded-2xl font-bold transition-all ${isDarkMode ? 'bg-brand-accent text-zinc-950' : 'bg-brand-dark text-white'}`}>
              Contact Support
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default FAQPage;
