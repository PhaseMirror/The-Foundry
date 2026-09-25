
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  UserPlus, 
  Stethoscope, 
  AlertTriangle, 
  FileCode, 
  Lock, 
  School, 
  FlaskConical, 
  Clock, 
  Ban, 
  Scale, 
  ExternalLink,
  Mail,
  Phone
} from 'lucide-react';

interface TermsAndConditionsPageProps {
  isDarkMode: boolean;
}

const TermsAndConditionsPage: React.FC<TermsAndConditionsPageProps> = ({ isDarkMode }) => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`pt-16 pb-24 ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>
      <div className="container mx-auto px-8 max-w-4xl">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-accent block mb-6">Legal Framework</span>
          <h1 className={`text-4xl md:text-6xl font-bold mb-8 leading-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Terms & <span className="italic font-medium text-stone-400">Conditions.</span>
          </h1>
          <p className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-10">Last updated: February 12, 2026</p>
          <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-zinc-900/30 border-stone-800' : 'bg-brand-light border-stone-100'}`}>
            <p className="text-lg leading-relaxed text-stone-500 font-medium">
              Welcome to ΞchoBraid. These Terms govern your access to and use of our Service. By using ΞchoBraid, you agree to these Terms.
            </p>
          </div>
        </motion.div>

        <div className="space-y-20">
          
          {/* 1. Who We Are */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-4">
              <span className="text-brand-accent text-lg">01</span> Who we are
            </h2>
            <p className="text-stone-500 font-medium leading-relaxed mb-4">
              ΞchoBraid is a neurodivergent‑affirming learning space that provides curriculum, tools, and software to support ASD and other neurodivergent learners.
            </p>
            <p className="text-stone-500 font-medium leading-relaxed italic">
              Our design is guided by the principles of sovereignty, safety, low‑stimulus interfaces, and user‑controlled memory.
            </p>
          </motion.section>

          {/* 2. Eligibility */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-4">
              <span className="text-brand-accent text-lg">02</span> Eligibility and accounts
            </h2>
            <div className={`p-8 rounded-3xl border ${isDarkMode ? 'border-stone-800 bg-zinc-900/20' : 'border-stone-100 bg-stone-50'}`}>
              <ul className="space-y-4 text-sm text-stone-500 font-medium leading-relaxed">
                <li className="flex gap-4">
                  <UserPlus size={18} className="text-brand-accent shrink-0 mt-1" />
                  <span>You must be of legal age or have consent/supervision from a guardian to create an account.</span>
                </li>
                <li className="flex gap-4">
                  <ShieldCheck size={18} className="text-brand-accent shrink-0 mt-1" />
                  <span>Children under 13 may only use ΞchoBraid under adult‑managed accounts.</span>
                </li>
                <li className="flex gap-4">
                  <Lock size={18} className="text-brand-accent shrink-0 mt-1" />
                  <span>You are responsible for the confidentiality of your credentials.</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* 3. Non-Clinical */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-4 text-red-400/80">
              <Stethoscope size={24} className="text-red-400/60" /> Non‑clinical, educational use only
            </h2>
            <div className={`p-8 rounded-3xl border ${isDarkMode ? 'border-red-900/20 bg-red-950/10' : 'border-red-100 bg-red-50/30'}`}>
              <p className="text-stone-500 font-medium leading-relaxed mb-6">
                ΞchoBraid is an educational and support platform, not a medical, psychological, or crisis service.
              </p>
              <ul className="space-y-3 text-sm font-bold text-red-400/70">
                <li>• No diagnosis, treatment, or medical advice provided.</li>
                <li>• Not a substitute for professional clinical care.</li>
                <li>• In crisis, contact emergency services or a hotline immediately.</li>
              </ul>
            </div>
          </motion.section>

          {/* 4. Acceptable Use */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-4">
              <span className="text-brand-accent text-lg">04</span> Acceptable use
            </h2>
            <p className="text-sm text-stone-500 font-medium mb-6 italic">ΞchoBraid is a safe space. You agree NOT to:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Violate any laws or regulations.",
                "Harass, bully, or exploit others.",
                "Share hateful or inappropriate content.",
                "Attempt unauthorized system access.",
                "Reverse-engineer or disrupt safety mechanisms."
              ].map((rule, i) => (
                <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border ${isDarkMode ? 'border-stone-800' : 'border-stone-100 bg-white shadow-sm'}`}>
                  <Ban size={14} className="text-stone-400" />
                  <span className="text-xs font-bold text-stone-500">{rule}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* 5. IP */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-4">
              <span className="text-brand-accent text-lg">05</span> Content and intellectual property
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold mb-3">5.1 Our content</h3>
                <p className="text-sm text-stone-500 font-medium leading-relaxed">
                  All original content, graphics, and software are owned by ΞchoBraid. We grant you a limited, non‑exclusive license for personal, family, or educational use.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-3">5.2 Your content</h3>
                <p className="text-sm text-stone-500 font-medium leading-relaxed">
                  You retain ownership of content you create. By uploading, you grant us a limited license to process and display it to provide the Service to you.
                </p>
              </div>
            </div>
          </motion.section>

          {/* 6-8 */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-brand-accent uppercase tracking-widest text-[10px]"><Lock size={12}/> Privacy</div>
              <h3 className="text-lg font-bold">06. Data Practices</h3>
              <p className="text-xs text-stone-500 leading-relaxed">Governed by our Privacy Policy. Default "nothing saved" mode and data minimization are core commitments.</p>
            </div>
            <div className="space-y-4">
               <div className="flex items-center gap-2 font-bold text-brand-accent uppercase tracking-widest text-[10px]"><School size={12}/> Institutional</div>
              <h3 className="text-lg font-bold">07. School Use</h3>
              <p className="text-xs text-stone-500 leading-relaxed">Agencies agree to enter data-processing agreements and obtain all necessary consents locally.</p>
            </div>
            <div className="space-y-4">
               <div className="flex items-center gap-2 font-bold text-brand-accent uppercase tracking-widest text-[10px]"><FlaskConical size={12}/> Labs</div>
              <h3 className="text-lg font-bold">08. Experimental</h3>
              <p className="text-xs text-stone-500 leading-relaxed">Experimental features are marked "UNPROVEN". They must not be the sole basis for high-stakes decisions.</p>
            </div>
          </motion.section>

          {/* 9-11 */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-2xl font-bold mb-8">Disclaimers & Liability</h2>
            <div className="space-y-6">
              <div className={`p-8 rounded-3xl border ${isDarkMode ? 'border-stone-800' : 'border-stone-100 bg-stone-50'}`}>
                <div className="flex items-center gap-3 mb-4 text-stone-400">
                  <Clock size={18} />
                  <h4 className="font-bold text-sm uppercase tracking-widest">9. Availability</h4>
                </div>
                <p className="text-sm text-stone-500 font-medium leading-relaxed">
                  Provided "as is" and "as available". We strive for a stable, low-stimulus experience but do not guarantee uninterrupted service.
                </p>
              </div>
              <div className={`p-8 rounded-3xl border ${isDarkMode ? 'border-stone-800' : 'border-stone-100 bg-stone-50'}`}>
                <div className="flex items-center gap-3 mb-4 text-stone-400">
                  <AlertTriangle size={18} />
                  <h4 className="font-bold text-sm uppercase tracking-widest">10. Disclaimers</h4>
                </div>
                <p className="text-sm text-stone-500 font-medium leading-relaxed uppercase">
                  ΞchoBraid disclaims all warranties. We do not warrant that the service will meet specific requirements or achieve particular learning outcomes.
                </p>
              </div>
              <div className={`p-8 rounded-3xl border ${isDarkMode ? 'border-stone-800' : 'border-stone-100 bg-stone-50'}`}>
                <div className="flex items-center gap-3 mb-4 text-stone-400">
                  <Scale size={18} />
                  <h4 className="font-bold text-sm uppercase tracking-widest">11. Liability</h4>
                </div>
                <p className="text-sm text-stone-500 font-medium leading-relaxed">
                  Liability is limited to the amount paid in the preceding 12 months. For free tier users, the sole remedy is to stop using the Service.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section 
            variants={sectionVariants} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            className="pt-12 border-t border-stone-100 dark:border-stone-800"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <h3 className="text-lg font-bold mb-2">Questions?</h3>
                <p className="text-sm text-stone-500 font-medium">Reach out for clarity on these terms.</p>
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-brand-accent" />
                  <span className="text-sm font-bold">info@echobraid.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-brand-accent" />
                  <span className="text-sm font-bold">704-339-8788</span>
                </div>
              </div>
            </div>
          </motion.section>

        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;
