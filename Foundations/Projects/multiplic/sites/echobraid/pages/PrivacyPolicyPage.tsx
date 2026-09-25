
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Mail, 
  Phone, 
  Lock, 
  Database, 
  Trash2, 
  Mic, 
  EyeOff, 
  FileText,
  UserCheck,
  Globe,
  RefreshCcw
} from 'lucide-react';

interface PrivacyPolicyPageProps {
  isDarkMode: boolean;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ isDarkMode }) => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`pt-16 pb-24 ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>
      <div className="container mx-auto px-8 max-w-4xl">
        
        {/* Policy Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent block mb-6">Legal Framework</span>
          <h1 className={`text-4xl md:text-6xl font-bold mb-8 leading-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Privacy <span className="italic font-medium text-stone-400">Policy.</span>
          </h1>
          <p className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-10">Last updated: February 12, 2026</p>
          <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900/30 border-stone-800' : 'bg-brand-light border-stone-100'}`}>
            <p className="text-xl leading-relaxed text-stone-500 font-medium italic">
              "ΞchoBraid is designed to honor your signal, not harvest your data. This policy explains what we collect, why we collect it, and how you stay in control."
            </p>
          </div>
        </motion.div>

        <div className="space-y-24">
          
          {/* 1. Who We Are */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-4">
              <span className="text-brand-accent">1.</span> Who we are
            </h2>
            <div className="space-y-6 text-stone-500 font-medium leading-relaxed">
              <p>ΞchoBraid is a neurodivergent‑affirming learning space for ASD and other neurodivergent learners, their families, and educators.</p>
              <p>Our products and curriculum follow the principles of sovereignty, safety, low‑stimulus design, and user‑controlled memory.</p>
              <div className="flex flex-col sm:flex-row gap-6 mt-8">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-brand-accent" />
                  <span className="text-sm">info@echobraid.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-brand-accent" />
                  <span className="text-sm">704-339-8788</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* 2. Core Commitments */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-4">
              <span className="text-brand-accent">2.</span> Core privacy commitments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <EyeOff size={20}/>, title: "Opt-in by Default", text: "We do not save demo sessions unless you explicitly choose to save them." },
                { icon: <Database size={20}/>, title: "Minimum Storage", text: "We store the minimum needed for the shortest time, often locally." },
                { icon: <Trash2 size={20}/>, title: "Total Deletion", text: "You can request data deletion or erase it yourself inside the app." }
              ].map((item, i) => (
                <div key={i} className={`p-6 rounded-2xl border ${isDarkMode ? 'border-stone-800' : 'border-stone-100 bg-white shadow-sm'}`}>
                  <div className="text-brand-accent mb-4">{item.icon}</div>
                  <h4 className="font-bold text-sm mb-2">{item.title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* 3. What We Collect */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-4">
              <span className="text-brand-accent">3.</span> What we collect
            </h2>
            <div className="space-y-12">
              <div>
                <h3 className="text-lg font-bold mb-4">3.1 Information you provide directly</h3>
                <ul className="space-y-4 text-stone-500 font-medium text-sm">
                  <li>• <strong className={isDarkMode ? 'text-white' : 'text-stone-800'}>Account details:</strong> Adult's name, email, and password. Optional roles like parent or therapist.</li>
                  <li>• <strong className={isDarkMode ? 'text-white' : 'text-stone-800'}>Learner information:</strong> Nicknames, age bands, or sensory support notes (setup by an adult).</li>
                  <li>• <strong className={isDarkMode ? 'text-white' : 'text-stone-800'}>Learning content:</strong> Journal entries, drawings, or lesson plans created in-app.</li>
                  <li>• <strong className={isDarkMode ? 'text-white' : 'text-stone-800'}>Communication:</strong> Feedback forms, bug reports, or support emails.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">3.2 Information collected automatically</h3>
                <p className="text-sm text-stone-500 mb-4">To keep the service running smoothly and improve it, we collect limited technical data:</p>
                <ul className="space-y-3 text-stone-500 font-medium text-sm">
                  <li>• Device and browser type</li>
                  <li>• Approximate region (anonymized at the IP level)</li>
                  <li>• Basic usage events (e.g., "Curriculum card opened")</li>
                </ul>
                <p className="mt-6 text-xs font-bold text-brand-accent uppercase tracking-widest">No cross‑site tracking or behavioral ad trackers are used.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                  <Mic size={18} className="text-brand-accent" />
                  3.3 Optional sensor and biometric data
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed font-medium">Experimental features may offer sensors (microphone or HRV) to support regulation. These are <strong className={isDarkMode ? 'text-white' : 'text-stone-800'}>always opt‑in</strong> and clearly labeled. You can turn them off at any time.</p>
              </div>
            </div>
          </motion.section>

          {/* 4. How We Use Information */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-4">
              <span className="text-brand-accent">4.</span> How we use your information
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-stone-500 font-medium">
              <li className={`p-4 rounded-xl border ${isDarkMode ? 'border-stone-800' : 'bg-stone-50 border-stone-100'}`}>• Provide core app features</li>
              <li className={`p-4 rounded-xl border ${isDarkMode ? 'border-stone-800' : 'bg-stone-50 border-stone-100'}`}>• Maintain safety and stability</li>
              <li className={`p-4 rounded-xl border ${isDarkMode ? 'border-stone-800' : 'bg-stone-50 border-stone-100'}`}>• Improve accessibility in aggregate</li>
              <li className={`p-4 rounded-xl border ${isDarkMode ? 'border-stone-800' : 'bg-stone-50 border-stone-100'}`}>• Communicate updates and changes</li>
            </ul>
            <p className="mt-8 text-sm font-bold text-red-400">We do not sell your personal data. We do not use learner data for targeted advertising.</p>
          </motion.section>

          {/* 5. Data Storage & Retention */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-4">
              <span className="text-brand-accent">5.</span> Data storage modes and retention
            </h2>
            <div className="space-y-4">
              {[
                { title: "Demo mode (default)", desc: "Nothing is saved; activities are processed in real time and discarded." },
                { title: "Erase after 24 hours", desc: "Content is stored for up to 24 hours, then automatically deleted." },
                { title: "Local-only", desc: "Data is stored on your device or a local server you control." },
                { title: "Export", desc: "Export content to PDF or other formats for your own records." }
              ].map((mode, i) => (
                <div key={i} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-zinc-950/40 border-stone-800' : 'bg-white border-stone-100 shadow-sm'}`}>
                  <h4 className="font-bold text-sm mb-1">{mode.title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">{mode.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* 6. Children and Minors */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-4">
              <span className="text-brand-accent">6.</span> Children and minors
            </h2>
            <div className="space-y-6 text-sm text-stone-500 font-medium leading-relaxed">
              <p>We design for child safety from the ground up. We do not allow children under 13 to create accounts without verified adult consent.</p>
              <p>For school deployments, we operate under data-processing agreements with the institution. We encourage adults to use pseudonyms or initials whenever full names are not needed.</p>
            </div>
          </motion.section>

          {/* 7. Sharing and Disclosure */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-4">
              <span className="text-brand-accent">7.</span> Sharing and disclosure
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-widest text-stone-400">Service Providers</h4>
                <p className="text-xs text-stone-500 leading-relaxed">Trusted partners (hosting, analytics) who must follow strict privacy contracts.</p>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-widest text-stone-400">Institutions</h4>
                <p className="text-xs text-stone-500 leading-relaxed">Authorized school staff under written agreements for institutional deployments.</p>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-widest text-stone-400">Legal Requirements</h4>
                <p className="text-xs text-stone-500 leading-relaxed">Only if required by law or to protect someone's safety.</p>
              </div>
            </div>
          </motion.section>

          {/* 8-10. Rights, Security, Transfers */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                <UserCheck size={18} className="text-brand-accent" />
                8. Your rights
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">You may access, correct, or request deletion of your data. You can often exercise these rights directly within the app.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                <Lock size={18} className="text-brand-accent" />
                9. Security
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">We use encryption in transit and strict access controls. No system is perfect, but we review our safety architecture regularly.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                <Globe size={18} className="text-brand-accent" />
                10. Transfers
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">Your info may be processed in other countries. We use standard contractual clauses to ensure protection across borders.</p>
            </div>
          </motion.section>

          {/* 11. Research and Small Data */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-4">
              <span className="text-brand-accent">11.</span> Research and "small data"
            </h2>
            <div className="p-8 rounded-[3rem] border border-brand-accent/20 space-y-6">
              <p className="text-sm text-stone-500 font-medium leading-relaxed">We primarily use aggregate, anonymized analytics to understand usage patterns. Identifiable research requires <strong className={isDarkMode ? 'text-white' : 'text-stone-800'}>explicit consent</strong> and ethics review.</p>
              <p className="text-xs text-stone-400 italic">"Experimental metrics are clearly labeled as UNPROVEN until validated."</p>
            </div>
          </motion.section>

          {/* 12. Changes */}
          <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="pb-12"
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-4">
              <span className="text-brand-accent">12.</span> Changes to this policy
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed font-medium">We update this policy as technology and legal requirements evolve. We will update the "Last updated" date and provide notice for material changes.</p>
            <div className="mt-16 pt-8 border-t border-stone-100 dark:border-stone-800">
               <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center">
                 ΞchoBraid — Designed for Cognitive Dignity
               </p>
            </div>
          </motion.section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
