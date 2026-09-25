import { 
  Files, 
  GitGraph, 
  Network, 
  Bot, 
  Scale, 
  Terminal, 
  Activity, 
  Play, 
  FileText,
  AlertTriangle,
  GitBranch,
  Server,
  Cpu,
  ShieldAlert
} from 'lucide-react';

export const ACTIVITY_VIEWS = {
  EXPLORER: 'explorer',
  PROJECTS: 'projects',
  NETWORK: 'network',
  MCP: 'mcp',
  GOVERNANCE: 'governance',
  CHAT: 'chat',
} as const;

export const PANEL_VIEWS = {
  TERMINAL: 'terminal',
  DIFF: 'diff',
  CI: 'ci',
  TRACE: 'trace',
} as const;

export const MOCK_FILES = [
  {
    id: '1',
    name: 'mirror-dissonance',
    type: 'folder',
    children: [
      { id: '2', name: 'core', type: 'folder', children: [
        { id: '3', name: 'invariant.ts', type: 'file', language: 'typescript' },
        { id: '4', name: 'prime-lattice.ts', type: 'file', language: 'typescript' }
      ]},
      { id: '5', name: 'adrs', type: 'folder', children: [
        { id: '6', name: '001-autonomy-vs-gov.md', type: 'file', language: 'markdown', hasTension: true },
        { id: '7', name: '002-prime-indexing.md', type: 'file', language: 'markdown' }
      ]},
      { id: '8', name: 'terraform', type: 'folder', children: [
        { id: '9', name: 'main.tf', type: 'file', language: 'hcl' },
        { id: '10', name: 'variables.tf', type: 'file', language: 'hcl' }
      ]}
    ]
  }
];

export const MOCK_FILE_CONTENT = {
  '001-autonomy-vs-gov.md': `
# ADR 001: Autonomy vs Governance in L0

## Context
The L0 invariant set requires strict adherence to the prime-index decomposition.
However, autonomous agents (MCPs) require freedom to optimize local dissonance.

## Tension
There is a fundamental tension between the global governance constraints and local agent autonomy.
- Governance requires deterministic state transitions.
- Autonomy requires probabilistic exploration.

## Decision
We will implement a "Tension Gutter" to visualize these conflicts in real-time.
Agents will be allowed to violate L1 invariants but MUST respect L0.

## Consequences
- Increased complexity in the Dissonance Graph.
- Higher observability requirements.
`,
  'invariant.ts': `
import { PrimeIndex } from './prime-lattice';

export class InvariantCheck {
  constructor(private readonly hash: string) {}

  public validate(state: any): boolean {
    // L0 Invariant Check
    if (state.entropy > 0.5) {
      throw new Error("L0 Invariant Violation: Entropy too high");
    }
    return true;
  }
}
`
};

export const MOCK_LOGS = [
  { id: 1, timestamp: '12:48:43', level: 'info', source: 'prime-index', message: 'Re-indexing lattice structure...' },
  { id: 2, timestamp: '12:48:44', level: 'warn', source: 'dissonance-diff', message: 'Drift detected in sector 7G' },
  { id: 3, timestamp: '12:48:45', level: 'info', source: 'mcp-agent-01', message: 'Optimizing local dissonance...' },
  { id: 4, timestamp: '12:48:46', level: 'error', source: 'governance', message: 'L0 Invariant check failed for agent-03' },
];
