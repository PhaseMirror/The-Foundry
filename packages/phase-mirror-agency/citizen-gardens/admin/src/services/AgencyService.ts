/**
 * AgencyService.ts
 * 
 * Scoped service for interacting with the Phase Mirror Agency Server.
 * Strictly adheres to the Sedona Spine Mandate: All governance logic 
 * is computed by the Rust Engine (Cold Machine) and proxied through Node.js.
 */

const AGENCY_BASE_URL = 'http://127.0.0.1:8082/v1';

export interface MissionRequest {
  mission: string;
  partition?: string;
}
export interface MissionResponse {
  id: string;
  witness_hash: string;
  completion: string;
  governance_status: 'VERIFIED' | 'WARNING' | 'FAILED';
}

export interface DissonanceGraphData {
  nodes: Array<{ id: string; x: number; y: number; label: string; type: 'primary' | 'secondary' | 'agent' }>;
  edges: Array<{ from: string; to: string; dashed?: boolean }>;
}

export interface CLIResponse {
  output: string;
  exitCode: number;
}

export interface Agent {
  id: string;
  name: string;
  status: 'active' | 'warning' | 'idle';
  metric: string;
  horizon: string;
  owner: string;
}

export interface ArchivumEntry {
  id: string; // Proof Hash / CID
  timestamp: string;
  type: string;
  metadata: any;
  drift: number;
  status: 'Archived' | 'On-Chain' | 'Pending';
}

export const MISSION_TYPES = {
  VERIFY_ADR: 'verify-adr',
  ANALYZE_DISSONANCE: 'analyze-dissonance',
  AUDIT_COMPLIANCE: 'audit-compliance',
  GENERATE_TERRAFORM: 'generate-terraform',
} as const;

class AgencyService {
  /**
   * Check the health of the Agency Server.
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${AGENCY_BASE_URL}/health`);
      if (!response.ok) return false;
      const text = await response.text();
      return text.includes('ONLINE');
    } catch (error) {
      console.error('[AgencyService] Health check failed:', error);
      return false;
    }
  }

  /**
   * Fetch the live Dissonance Graph.
   */
  async getDissonanceGraph(): Promise<DissonanceGraphData> {
    const response = await fetch(`${AGENCY_BASE_URL}/agency/dissonance/graph`);
    if (!response.ok) throw new Error('Failed to fetch dissonance graph');
    return await response.json();
  }

  /**
   * Execute a CLI command.
   */
  async executeCLI(command: string): Promise<CLIResponse> {
    const response = await fetch(`${AGENCY_BASE_URL}/agency/cli/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'CLI execution failed');
    }
    return await response.json();
  }

  /**
   * Fetch the list of active agents.
   */
  async getAgents(): Promise<Agent[]> {
    const response = await fetch(`${AGENCY_BASE_URL}/agency/agents`);
    if (!response.ok) throw new Error('Failed to fetch agents');
    return await response.json();
  }

  /**
   * Register a new entry in the Archivum (Site Registration).
   */
  async registerSite(siteData: any): Promise<ArchivumEntry> {
    const response = await fetch(`${AGENCY_BASE_URL}/agency/archivum/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(siteData),
    });
    if (!response.ok) throw new Error('Registration failed');
    const result = await response.json();
    
    // Save the hash to the browser (localStorage) as requested
    const registrations = JSON.parse(localStorage.getItem('cg_registrations') || '[]');
    registrations.push(result);
    localStorage.setItem('cg_registrations', JSON.stringify(registrations));
    
    return result;
  }

  /**
   * Fetch the Archivum Ledger.
   */
  async getArchivumLedger(): Promise<ArchivumEntry[]> {
    const response = await fetch(`${AGENCY_BASE_URL}/agency/archivum/ledger`);
    if (!response.ok) throw new Error('Failed to fetch ledger');
    return await response.json();
  }

  /**
   * Dispatch a mission to the Coding Commander (Rust Harness).
   * Used for ADR verification and deterministic architectural logic.
   */
  async dispatchMission(request: MissionRequest): Promise<MissionResponse> {
...

    try {
      const response = await fetch(`${AGENCY_BASE_URL}/agency/coding-commander/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mission: request.mission,
          partition: request.partition || 'default',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Mission dispatch failed');
      }

      return await response.json();
    } catch (error) {
      console.error('[AgencyService] Mission dispatch error:', error);
      throw error;
    }
  }

  /**
   * Specific helper to verify an ADR.
   */
  async verifyADR(adrId: string, content: string): Promise<MissionResponse> {
    return this.dispatchMission({
      mission: `Verify ADR ${adrId}: ${content.substring(0, 100)}...`,
      partition: 'governance'
    });
  }
}

export const agencyService = new AgencyService();
export default agencyService;
