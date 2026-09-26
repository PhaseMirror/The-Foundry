import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Scale, 
  Layers, 
  Globe, 
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Search,
  Copy,
  Check,
  Code,
  ArrowRight,
  LifeBuoy,
  FileText,
  AlertTriangle,
  ExternalLink,
  Sliders
} from 'lucide-react';

interface DocumentationViewProps {
  isDarkMode: boolean;
  theme?: 'light' | 'dark' | 'dim';
}

interface DocTopic {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface DocCategory {
  id: string;
  title: string;
  topics: DocTopic[];
}

const DocumentationView: React.FC<DocumentationViewProps> = ({ isDarkMode, theme = 'dark' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopicId, setActiveTopicId] = useState('intro');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'getting-started': true,
    'core-concepts': true,
    'ops-toolchain': false,
    'academy': false,
    'enterprise': false,
    'technical-specs': true
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Content rendering helpers
  const CodeBlock = ({ code, language = 'bash' }: { code: string, language?: string }) => {
    const blockId = useMemo(() => Math.random().toString(36).substr(2, 9), [code]);
    return (
      <div className={`relative rounded-xl border my-5 overflow-hidden font-mono text-xs ${
        isDarkMode ? 'bg-[#0a0a0d] border-stone-850' : 'bg-stone-50 border-stone-200'
      }`}>
        <div className={`flex justify-between items-center px-4 py-2 text-[10px] uppercase font-bold tracking-wider border-b ${
          isDarkMode ? 'bg-[#0f0f14]/80 border-stone-850 text-stone-500' : 'bg-stone-100/80 border-stone-200 text-stone-500'
        }`}>
          <span>{language}</span>
          <button 
            onClick={() => handleCopy(code, blockId)}
            className="flex items-center gap-1.5 hover:text-[#2dd4bf] transition-colors"
          >
            {copiedId === blockId ? (
              <>
                <Check size={11} className="text-[#2dd4bf]" />
                <span className="text-[#2dd4bf]">Copied</span>
              </>
            ) : (
              <>
                <Copy size={11} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto leading-relaxed text-stone-400 dark:text-stone-300">
          <code>{code}</code>
        </pre>
      </div>
    );
  };

  const docsData: DocCategory[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      topics: [
        {
          id: 'intro',
          title: 'Introduction to Phase Mirror',
          content: (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#2dd4bf] bg-[#2dd4bf]/10 px-3 py-1 rounded inline-block mb-3">
                  STABILITY & ALIGNMENT
                </span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">Introduction to Phase Mirror</h2>
                <p className="text-stone-500 font-medium leading-relaxed text-base">
                  Phase Mirror is a multi-dimensional system alignment substrate designed to manage agentic AI liability. Rather than hiding or ignoring contradictions in autonomous systems, Phase Mirror surface productive contradictions, establishes explicit governance rules (Tier A / Tier B), and converts abstract telemetry into real-time physical parameters with owners, metrics, and horizons.
                </p>
              </div>

              <div className={`p-6 border rounded-2xl ${isDarkMode ? 'bg-[#0a0a0d] border-stone-850' : 'bg-stone-50 border-stone-200 shadow-sm'}`}>
                <h3 className="font-bold text-sm mb-2 text-stone-400 dark:text-stone-250">Why Phase Mirror?</h3>
                <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                  Large Language Models and autonomous agents operate via probabilistic pathways. When integrated into critical infrastructure, their decision boundaries split. Phase Mirror matches this probabilistic drift against structural, absolute laws (L0 invariants), providing a self-governing runtime guard that prevents context contamination and wild behavioral drift.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3 tracking-tight">Core Architecture Goals</h3>
                <ul className="space-y-3.5 text-xs text-stone-500 font-semibold leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-[#2dd4bf] mt-0.5">•</span>
                    <div>
                      <strong className={isDarkMode ? 'text-stone-300' : 'text-stone-700'}>Sovereign Hand-offs:</strong> Guaranteeing that human decision-making remains the ultimate anchor of administrative actions.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2dd4bf] mt-0.5">•</span>
                    <div>
                      <strong className={isDarkMode ? 'text-stone-300' : 'text-stone-700'}>Inflow Isolation:</strong> Automatically sandboxing foreign prompt structures and untrusted package updates before compile boundaries.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2dd4bf] mt-0.5">•</span>
                    <div>
                      <strong className={isDarkMode ? 'text-stone-300' : 'text-stone-700'}>Dissonance Serialization:</strong> Chronicling and serializing conflicting logic so audit teams can inspect, weigh, and resolve failures silently.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )
        },
        {
          id: 'quickstart',
          title: 'Quick Start Guide',
          content: (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#2dd4bf] bg-[#2dd4bf]/10 px-3 py-1 rounded inline-block mb-3">
                  DEPLOYMENT IN 5 MINUTES
                </span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">Quick Start Guide</h2>
                <p className="text-stone-500 font-medium leading-relaxed text-base">
                  Get your first Phase Mirror agent alignment terminal running locally. We distribute standard tooling via NPM, enabling immediate IDE binding or git pre-commit triggers.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold mb-3">1. Install global CLI package</h3>
                <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                  Use your package manager to fetch the latest compiled rule substrate. This tool exposes the command-line interface for checking local file trees against constraint models.
                </p>
                <CodeBlock code="npm install -g @mirror-dissonance/cli" language="bash" />
              </div>

              <div>
                <h3 className="text-base font-bold mb-3">2. Initialize Local Config</h3>
                <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                  Generate a baseline rule map. This populates `.mirror-rc` containing L0 invariant definitions, compliance targets, and the required telemetry paths.
                </p>
                <CodeBlock code="mirror-cli init --integrity-level A" language="bash" />
              </div>

              <div>
                <h3 className="text-base font-bold mb-3">3. Execute First Alignment Audit</h3>
                <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                  Point the mirror at your repository to run static checking and evaluate current agent risk parameters:
                </p>
                <CodeBlock code="mirror-cli audit --target ./src" language="bash" />
              </div>

              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/15 text-xs text-stone-500 leading-relaxed font-semibold">
                <span className="font-extrabold uppercase text-amber-500 block mb-1">PRO-TIP: GIT HOOK INTEGRATION</span>
                For automated sandboxing, add `mirror-cli verify-precommit` directly inside your `.git/hooks/pre-commit` script to block compliance violations before pushing.
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'core-concepts',
      title: 'Core Concepts',
      topics: [
        {
          id: 'mirror-loop',
          title: 'The Mirror Loop (Ξ)',
          content: (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#2dd4bf] bg-[#2dd4bf]/10 px-3 py-1 rounded inline-block mb-3">
                  SYSTEMIC DYNAMIC
                </span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">The Mirror Loop (Ξ)</h2>
                <p className="text-stone-500 font-medium leading-relaxed text-base">
                  At the heart of Phase Mirror lies the recursive alignment function, represented mathematically as the <strong className={isDarkMode ? 'text-stone-300' : 'text-stone-700'}>Ξ(t) Operator</strong>. This system serves as a live, automated state referee.
                </p>
              </div>

              <p className="text-xs md:text-sm text-stone-500 leading-relaxed font-semibold">
                Rather than treating software as static files, the Mirror Loop tracks how active logic behaves in response to models over time. If a model behaves in direct opposition to user intent or compliance rules, the loop isolates that path, calculates the "dissonance index", and routes resolution options synchronously.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                {[
                  { title: "I. Mirror State", desc: "Monitors active environment variables, trace logs, and package integrity to capture a pristine baseline snapshot." },
                  { title: "II. Dissonance Check", desc: "Triggers comparative algorithms to identify conflict parameters (e.g., untowner commits, context drift)." },
                  { title: "III. Phase Shift", desc: "Adjusts runtime levers or fires automated fail-closed mechanics if system metrics cross safety boundaries." }
                ].map((item, i) => (
                  <div key={i} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#09090c] border-stone-850' : 'bg-white border-stone-150 shadow-sm'}`}>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#2dd4bf] mb-2">{item.title}</h4>
                    <p className="text-[11px] text-stone-500 font-semibold leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className={`p-6 border-l-2 border-[#2dd4bf] rounded-r-2xl ${isDarkMode ? 'bg-[#0e0e11]/40' : 'bg-stone-50'}`}>
                <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                  <strong>The Operational Mantra:</strong> We do not attempt to "solve" contradiction permanently. We manage, audit, and trace it. By acknowledging contradiction, we turn agent errors into governed configuration handles.
                </p>
              </div>
            </div>
          )
        },
        {
          id: 'l0-invariants',
          title: 'L0 Invariants & Oracle',
          content: (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono font-bold tracking-[0.25em] text-red-500 bg-red-500/10 px-3 py-1 rounded inline-block mb-3">
                  CRITICAL CODE INTEGRITY
                </span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">L0 Invariants & Oracle</h2>
                <p className="text-stone-500 font-medium leading-relaxed text-base">
                  What supports human sovereignty at scale? The **Phase Mirror Oracle**—a technical, low-overhead hardware and software layer that enforces core laws (L0 invariants).
                </p>
              </div>

              <div className="space-y-4 text-xs md:text-sm text-stone-500 font-semibold leading-relaxed">
                <p>
                  An <strong className={isDarkMode ? 'text-stone-300' : 'text-stone-700'}>L0 Invariant</strong> is a mathematical, non-negotiable threshold defined by the security and system architect. These rules cannot be modified, side-stepped, or overrule-calibrated by dynamic models.
                </p>
                <p>
                  Execution is processed at sub-100ns latency to prevent any bottlenecks in high-frequency message channels. It specifically watches:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "File Schema Validation", value: "Strict binary matching coordinates ensuring configuration files match perfect structured layouts with no metadata extensions." },
                  { label: "Permission Bit Locking", value: "Blocks write actions to security domains, secrets stores, and infrastructure controls except via signed authorization vectors." },
                  { label: "Static Output Pinning", value: "Ensures critical status outcomes and routing flags remain mathematically bounded regardless of context contamination." },
                  { label: "System Core Quarantine", value: "Triggers physical sandbox decoupling if untrusted processes bypass container borders or access host networks." }
                ].map((inv, i) => (
                  <div key={i} className={`p-5 rounded-xl border ${isDarkMode ? 'bg-[#0a0a0d] border-stone-850' : 'bg-[#fafafc] border-stone-150'}`}>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#2dd4bf] block mb-1">{inv.label}</span>
                    <p className="text-[11px] text-stone-500 font-semibold leading-relaxed">{inv.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'ops-toolchain',
      title: 'Operational Toolchain',
      topics: [
        {
          id: 'cli-ref',
          title: 'CLI Commands Reference',
          content: (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#2dd4bf] bg-[#2dd4bf]/10 px-3 py-1 rounded inline-block mb-3">
                  COMMAND LINE SPECIFICATION
                </span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">CLI Commands Reference</h2>
                <p className="text-stone-500 font-medium leading-relaxed text-base">
                  Exhaustive parameters, options, and expected outputs for the `@mirror-dissonance/cli` executable binary.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold uppercase font-mono tracking-wider text-stone-400 dark:text-stone-250">1. `mirror-cli init`</h3>
                  <p className="text-xs text-stone-500 font-semibold leading-relaxed mt-1">
                    Bootstraps Phase Mirror configuration rules. Creates local blueprints.
                  </p>
                  <CodeBlock code="mirror-cli init --integrity-level [A|B] --config-path [path]" />
                </div>

                <div>
                  <h3 className="text-sm font-extrabold uppercase font-mono tracking-wider text-stone-400 dark:text-stone-250">2. `mirror-cli audit`</h3>
                  <p className="text-xs text-stone-500 font-semibold leading-relaxed mt-1">
                    Parses absolute rule sets and checks file layers, active trees, and container bindings. Returns non-zero exit codes on integrity failure.
                  </p>
                  <CodeBlock code="mirror-cli audit --target ./src --depth 5 --json-output" />
                </div>

                <div>
                  <h3 className="text-sm font-extrabold uppercase font-mono tracking-wider text-stone-400 dark:text-stone-250">3. `mirror-cli verify-rules`</h3>
                  <p className="text-xs text-stone-500 font-semibold leading-relaxed mt-1">
                    Evaluates custom enterprise compliance profiles against live database endpoints. Useful for CI/CD pipeline blocking.
                  </p>
                  <CodeBlock code="mirror-cli verify-rules --file ./rules.json --strict" />
                </div>
              </div>
            </div>
          )
        },
        {
          id: 'mcp-server',
          title: 'Model Context Protocol (MCP)',
          content: (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#2dd4bf] bg-[#2dd4bf]/10 px-3 py-1 rounded inline-block mb-3">
                  COGNITIVE AI LINKING
                </span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">Model Context Protocol</h2>
                <p className="text-stone-500 font-medium leading-relaxed text-base">
                  Integrate Phase Mirror directly into developer agents and modern cognitive platforms like Claude, Cursor, and VS Code. Our MCP Server exposes custom action tools.
                </p>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                By declaring the Phase Mirror MCP Server in your local editor environment, developer agents can automatically query the local constraint engine, write valid audit traces, and verify sandbox status without leaving their terminal contexts.
              </p>

              <div>
                <h3 className="text-sm font-bold mb-2">Exposed MCP Tools</h3>
                <div className="space-y-4">
                  {[
                    { tool: "analyze_dissonance", desc: "Triggers recursive context mapping to locate logic contradictions and return corrective code levers." },
                    { tool: "check_adr_compliance", desc: "Cross-checks recent code changes against human-vetted Architecture Decision Records (ADRs) to flag drift." },
                    { tool: "verify_ledger", desc: "Returns cryptographically signed compliance badges validating code sandbox safety metrics." },
                    { tool: "validate_l0_invariants", desc: "Queries live permission matrices to ensure critical infrastructure layers remain uncompromised." }
                  ].map((item, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#09090b] border-stone-850' : 'bg-stone-50 border-stone-200'}`}>
                      <code className="text-xs text-[#2dd4bf] font-black">{item.tool}</code>
                      <p className="text-[11px] text-stone-500 leading-relaxed font-semibold mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2">Example Configuration (`mcp-config.json`)</h3>
                <CodeBlock code={JSON.stringify({
  "mcpServers": {
    "mirror-dissonance": {
      "command": "npx",
      "args": ["-y", "@mirror-dissonance/mcp-server", "start"],
      "env": {
        "PHASE_MIRROR_MODE": "local",
        "INTEGRITY_COMPLIANCE_LEVEL": "A"
      }
    }
  }
}, null, 2)} language="json" />
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'academy',
      title: 'Protocol Academy',
      topics: [
        {
          id: 'academy-path',
          title: 'The Cultivation Path',
          content: (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#2dd4bf] bg-[#2dd4bf]/10 px-3 py-1 rounded inline-block mb-3">
                  STABILITY ENABLMENT
                </span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">The Cultivation Path</h2>
                <p className="text-stone-500 font-medium leading-relaxed text-base">
                  Our structured onboarding structure is tailored for remote-first teams and distributed human potential. Transition cohorts gracefully into high-stability live environments.
                </p>
              </div>

              <div className="relative border-l border-[#2dd4bf]/40 pl-6 space-y-8 ml-3 my-8">
                {[
                  { step: "Week 1-2: Discovery", desc: "Mapping baseline creative potentials, communication styles, and spatial rhythms using local sandboxed environments." },
                  { step: "Week 3-5: Cohesion", desc: "Interactive regional simulations using team testbeds to resolve dynamic conflicts, prevent drift, and map contradictions." },
                  { step: "Week 6: Stewardship", desc: "Full validation checks. Launch operators on live corporate control channels protected by mathematical safety metrics." }
                ].map((item, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 bg-[#2dd4bf] rounded-full border-4 border-[#070708]"></span>
                    <h4 className="font-bold text-xs text-stone-400 dark:text-stone-200">{item.step}</h4>
                    <p className="text-[11px] text-stone-500 font-semibold leading-relaxed mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'enterprise',
      title: 'Enterprise & Governance',
      topics: [
        {
          id: 'licensing',
          title: 'Licensing & Compliance Structures',
          content: (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#2dd4bf] bg-[#2dd4bf]/10 px-3 py-1 rounded inline-block mb-3">
                  GOVERNANCE COMPLIANCE
                </span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">Licensing & Compliance Structures</h2>
                <p className="text-stone-500 font-medium leading-relaxed text-base">
                  Phase Mirror is distributed with clear modular boundaries to suit varying scales of enterprise risk, from isolated client setups to multi-tenant validation channels.
                </p>
              </div>

              <div className={`p-6 border rounded-[1.5rem] ${isDarkMode ? 'bg-[#09090b] border-stone-850' : 'bg-white border-stone-150 shadow-sm'}`}>
                <h3 className="font-bold text-xs uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-2">
                  <Scale size={14} className="text-[#2dd4bf]" /> Standard Tier A Package (Open)
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                  Includes the core Oracle client, basic CLI check engines, local `.mirror-rc` parameters, and manual dissonance logs. Perfect for small remote engineering outfits and individual testing.
                </p>
              </div>

              <div className={`p-6 border rounded-[1.5rem] ${isDarkMode ? 'bg-[#0c0c10] border-amber-950/20' : 'bg-stone-50 border-stone-250 shadow-sm'}`}>
                <h3 className="font-bold text-xs uppercase tracking-wider text-amber-500 mb-4 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-amber-500 animate-pulse" /> Enterprise Compliance Suite (Tier B)
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                  Exposes high-frequency L0 monitoring API, real-time Slack/Webhooks alerts, automated pre-commit container isolation scripts, full team training licenses, and detailed dispute-handling registries. Backed by corporate execution warranties.
                </p>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'technical-specs',
      title: 'Technical Specs',
      topics: [
        {
          id: 'handoff-spec',
          title: 'Engineering Handoff Spec',
          content: (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#2dd4bf] bg-[#2dd4bf]/10 px-3 py-1 rounded inline-block mb-3">
                  SPECIFICATIONS BLUEPRINT // v1.0.4
                </span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">Engineering Handoff Specification</h2>
                <p className="text-stone-500 font-medium leading-relaxed text-base">
                  The absolute structural layout guidelines, creative token catalogs, and visual wireframe matrices compiled for developers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3 p-5 rounded-2xl border dark:bg-[#09090b] dark:border-stone-850 bg-stone-50 border-stone-200">
                  <h5 className="text-[#2dd4bf] font-bold uppercase tracking-wider text-xs">1. Platform Wireframe Map</h5>
                  <p className="leading-relaxed text-[11px] text-stone-500">
                    Desktop layout enforces a 12-column Grid spanning strict component alignments. Mobile responsive layout collapses elements sequentially, placing the crucial metrics parameters prominently inside standalone glass-boxes.
                  </p>
                  <div className="bg-black/40 border border-stone-900/40 p-3 rounded font-mono text-[10px] text-stone-500 leading-normal space-y-1">
                    <div>W_GRID → Section (Header)</div>
                    <div className="pl-2">→ Section (Hero Grid - Span 8 / Span 4)</div>
                    <div className="pl-2">→ Section (Critical Promise Flow)</div>
                    <div className="pl-2">→ Section (Stepper Horizontal Progress)</div>
                    <div className="pl-2">→ Section (Ledger Density-5 Matrix)</div>
                  </div>
                </div>

                <div className="space-y-3 p-5 rounded-2xl border dark:bg-[#09090b] dark:border-stone-850 bg-stone-50 border-stone-200">
                  <h5 className="text-[#2dd4bf] font-bold uppercase tracking-wider text-xs">2. Core Copy Strategy</h5>
                  <p className="leading-relaxed text-[11px] text-stone-500">
                    All headers enforce Space Grotesk styling. Sub-headers use classic Inter with exact margins. Measurable claims avoid marketing verbs, sticking to strict nouns and measurable system telemetry parameters.
                  </p>
                  <ul className="space-y-1 text-[11px] text-stone-400 font-semibold list-disc pl-4">
                    <li>"Govern the critical path with specs."</li>
                    <li>"Authentication and session storage bounded."</li>
                    <li>"Determine allowed failure latitude."</li>
                    <li>"SLA thresholds and telemetry controls."</li>
                  </ul>
                </div>

                <div className="space-y-3 p-5 rounded-2xl border dark:bg-[#09090b] dark:border-stone-850 bg-stone-50 border-stone-200">
                  <h5 className="text-[#2dd4bf] font-bold uppercase tracking-wider text-xs">3. Creative System Tokens</h5>
                  <p className="leading-relaxed text-[11px] text-stone-500">
                    Dark theme parameters explicitly match the classic JetBrains styling guidelines. High contrast primary action points use pure Cyan-400 text elements to allow eye-safe readability on dark screens.
                  </p>
                  <div className="bg-black/40 border border-stone-900/40 p-3 rounded font-mono text-[10px] text-stone-500 leading-normal space-y-1">
                    <div>CRITICAL_BG: <span className="text-white">#030303</span></div>
                    <div>CORE_CYAN: <span className="text-[#2dd4bf]">#2dd4bf</span></div>
                    <div>AUDIT_OK: <span className="text-teal-400">#2dd4bf</span></div>
                    <div>ALARM_SLA: <span className="text-rose-500">#f43f5e</span></div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      ]
    }
  ];

  // Helper to flat-map for easy search operations
  const allTopics = useMemo(() => {
    return docsData.flatMap(cat => cat.topics.map(top => ({ ...top, catId: cat.id, catTitle: cat.title })));
  }, [docsData]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return docsData;
    const q = searchQuery.toLowerCase();
    return docsData.map(cat => {
      const matchedTopics = cat.topics.filter(t => 
        t.title.toLowerCase().includes(q)
      );
      return {
        ...cat,
        topics: matchedTopics
      };
    }).filter(cat => cat.topics.length > 0);
  }, [searchQuery, docsData]);

  const activeTopic = useMemo(() => {
    return allTopics.find(t => t.id === activeTopicId) || allTopics[0];
  }, [activeTopicId, allTopics]);

  return (
    <div id="documentation-view" className={`pt-24 pb-32 transition-colors duration-300 ${
      isDarkMode ? 'text-stone-300 bg-[#070708]' : 'text-stone-800 bg-[#fbfbfa]'
    }`}>
      <div className="container mx-auto px-8 max-w-7xl">
        <div className="mb-12 border-b border-stone-800/10 dark:border-stone-850/60 pb-8">
          <span className="text-[10px] font-mono font-bold tracking-[0.4em] text-[#2dd4bf] block mb-2">Phase Mirror Core Spec</span>
          <h1 className={`text-4xl md:text-5xl font-black tracking-tight ${isDarkMode ? 'text-stone-200' : 'text-stone-900'}`}>
            Documentation Library
          </h1>
          <p className="text-xs md:text-sm text-stone-500 leading-relaxed font-semibold mt-2">
            The mathematical runtime instructions, compliance schemas, and operational guides.
          </p>
        </div>

        {/* 2-Column Desktop Grid, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
          
          {/* Left Column (1/4 Width) - Interactive Topic Tree */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Search Input */}
            <div id="doc-search-box" className="relative group">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                isDarkMode ? 'text-stone-600 group-focus-within:text-[#2dd4bf]' : 'text-stone-400 group-focus-within:text-[#2dd4bf]'
              }`} size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search specs & APIs..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#2dd4bf] transition-all border ${
                  isDarkMode 
                    ? 'bg-[#0f0f12] border-stone-850 focus:border-[#2dd4bf] text-stone-300 placeholder-stone-600'
                    : 'bg-stone-50 border-stone-200 focus:border-[#2dd4bf] text-stone-800 placeholder-stone-400'
                }`}
              />
            </div>

            {/* Tree Navigation Container */}
            <div id="doc-tree-nav" className={`p-4 rounded-2xl border ${
              isDarkMode ? 'bg-[#0a0a0d] border-stone-850/80' : 'bg-white border-stone-200/80 shadow-sm'
            }`}>
              <span className="text-[9px] font-mono font-bold tracking-widest text-stone-500 uppercase block mb-4 px-2">
                Document Topics
              </span>
              
              <ul className="space-y-4">
                {filteredData.map((cat) => {
                  const isExpanded = expandedCategories[cat.id] || searchQuery.trim() !== '';
                  const hasActiveTopicInCat = cat.topics.some(t => t.id === activeTopicId);

                  return (
                    <li key={cat.id} className="space-y-1">
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className={`w-full flex items-center justify-between text-left px-2 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                          hasActiveTopicInCat 
                            ? 'text-stone-400 dark:text-stone-200' 
                            : 'text-stone-500 hover:text-stone-400'
                        }`}
                      >
                        <span>{cat.title}</span>
                        {isExpanded ? <ChevronDown size={12} className="text-stone-600" /> : <ChevronRight size={12} className="text-stone-600" />}
                      </button>

                      {/* Nested Topics Tree */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.ul 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pl-3 border-l dark:border-stone-850/60 border-stone-200/80 ml-2.5 mt-1 space-y-1 overflow-hidden"
                          >
                            {cat.topics.map((topic) => {
                              const isActive = topic.id === activeTopicId;
                              return (
                                <li key={topic.id}>
                                  <button
                                    onClick={() => setActiveTopicId(topic.id)}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between group ${
                                      isActive 
                                        ? 'bg-[#2dd4bf]/5 text-[#2dd4bf] font-bold border-l-2 border-[#2dd4bf] pl-2 shadow-[inset_1px_0_0_0_rgba(45,212,191,0.2)]'
                                        : `hover:text-[#2dd4bf] ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`
                                    }`}
                                  >
                                    <span className="truncate">{topic.title}</span>
                                    {isActive && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-ping shrink-0 ml-2"></span>
                                    )}
                                  </button>
                                </li>
                              );
                            })}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}

                {filteredData.length === 0 && (
                  <div className="text-center py-6 text-stone-500 text-xs">
                    No matching topics found.
                  </div>
                )}
              </ul>
            </div>

            {/* Quick Links / Troubleshooting Box */}
            <div className={`p-5 rounded-2xl border text-xs ${
              isDarkMode ? 'bg-[#0f0f14]/40 border-stone-850' : 'bg-stone-50/50 border-stone-200'
            }`}>
              <h4 className="font-extrabold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <LifeBuoy size={12} className="text-[#2dd4bf]" /> Resource Center
              </h4>
              <p className="text-[11px] text-stone-500 leading-relaxed font-semibold">
                Can't find a parameter structure? Write directly to our validation engineers at `audit@phasemirror.com`.
              </p>
              <div className="mt-3.5 pt-3.5 border-t dark:border-stone-850 border-stone-200/60">
                <a 
                  href="mailto:support@phasemirror.com" 
                  className="text-[#2dd4bf] hover:underline font-bold inline-flex items-center gap-1.5"
                >
                  Create Support Ticket <ArrowRight size={11} />
                </a>
              </div>
            </div>

          </div>

          {/* Right Column (3/4 Width) - Detailed Document Reader */}
          <div className="lg:col-span-3">
            
            {/* Main Interactive Viewer Frame */}
            <div id="doc-active-content" className={`p-8 md:p-12 rounded-[2.5rem] border min-h-[500px] transition-all duration-300 ${
              isDarkMode 
                ? 'bg-[#0b0b0d] border-stone-850/80 hover:bg-[#0d0d10]' 
                : 'bg-white border-stone-150 hover:shadow-sm'
            }`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTopic.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Category Breadcrumb */}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-[#2dd4bf] uppercase mb-4">
                    <span>{activeTopic.catTitle}</span>
                    <ChevronRight size={10} />
                    <span className="opacity-60">{activeTopic.title}</span>
                  </div>

                  {/* Render Custom Topic JSX */}
                  <div className="prose prose-stone dark:prose-invert max-w-none text-stone-400 dark:text-stone-300">
                    {activeTopic.content}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Nav: Cycle Topics quickly */}
            <div className="mt-8 flex justify-between items-center text-xs">
              {(() => {
                const currentIndex = allTopics.findIndex(t => t.id === activeTopic.id);
                const prevTopic = allTopics[currentIndex - 1];
                const nextTopic = allTopics[currentIndex + 1];

                return (
                  <>
                    {prevTopic ? (
                      <button
                        onClick={() => setActiveTopicId(prevTopic.id)}
                        className={`flex items-center gap-2 font-bold uppercase tracking-wider transition-all hover:text-[#2dd4bf] ${
                          isDarkMode ? 'text-stone-500' : 'text-stone-600'
                        }`}
                      >
                        <ChevronRight className="rotate-180" size={14} /> Back: {prevTopic.title}
                      </button>
                    ) : <div />}

                    {nextTopic ? (
                      <button
                        onClick={() => setActiveTopicId(nextTopic.id)}
                        className={`flex items-center gap-2 font-bold uppercase tracking-wider transition-all hover:text-[#2dd4bf] ml-auto ${
                          isDarkMode ? 'text-stone-500' : 'text-stone-600'
                        }`}
                      >
                        Next: {nextTopic.title} <ChevronRight size={14} />
                      </button>
                    ) : <div />}
                  </>
                );
              })()}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default DocumentationView;
