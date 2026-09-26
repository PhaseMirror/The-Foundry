export interface Agent {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'running' | 'stopped';
  metric?: string;
  horizon?: string;
  owner?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  agents?: string[];
}

export interface ADR {
  id: string;
  title: string;
  tags: string[];
  status: string;
  witness?: string;
  weight?: number;
}

export interface DissonanceNode {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'primary' | 'secondary' | 'agent';
}

export interface DissonanceEdge {
  from: string;
  to: string;
  dashed?: boolean;
}

export interface DissonanceGraph {
  nodes: DissonanceNode[];
  edges: DissonanceEdge[];
  meta: {
    source: string;
    version: string;
  };
}

export interface ArchivumEntry {
  id: string;
  timestamp: string;
  type: string;
  metadata: Record<string, unknown>;
  drift: number;
  status: string;
}

export interface DaemonMetrics {
  totalVerifications: number;
  verifiedCount: number;
  killCount: number;
  activeAgents: number;
  avgResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface TripleLockResult {
  id: string;
  witness_hash?: string;
  completion?: string;
  governance_status?: string;
}

export interface AuditResult {
  status: 'PASSED' | 'FAILED';
  output: string;
  exitCode: number;
}

export interface PublishResult {
  status: 'PUBLISHED' | 'FAILED';
  recursion_hash?: string;
  output: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}
