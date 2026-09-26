/**
 * AgencyClient.ts
 * 
 * Communication layer for the Discord Bot to interact with the Phase Mirror Agency Server.
 * Routes all governance requests through the verified MissionProtocol.
 */

const AGENCY_BASE_URL = process.env.AGENCY_BASE_URL || 'http://127.0.0.1:8082/v1';

export interface MissionResponse {
  id: string;
  witness_hash: string;
  completion: string;
  governance_status: 'VERIFIED' | 'WARNING' | 'FAILED';
}

export class AgencyClient {
  /**
   * Dispatch a mission to the Agency Server.
   */
  static async dispatchMission(mission: string, partition: string = 'discord'): Promise<MissionResponse> {
    try {
      const response = await fetch(`${AGENCY_BASE_URL}/agency/coding-commander/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mission, partition }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Agency mission dispatch failed');
      }

      return await response.json();
    } catch (error) {
      console.error('[AgencyClient] Dispatch Error:', error);
      throw error;
    }
  }

  /**
   * Check Agency Health.
   */
  static async checkHealth(): Promise<string> {
    try {
      const response = await fetch(`${AGENCY_BASE_URL}/health`);
      if (!response.ok) return 'OFFLINE';
      return await response.text();
    } catch (error) {
      return 'OFFLINE';
    }
  }
}
