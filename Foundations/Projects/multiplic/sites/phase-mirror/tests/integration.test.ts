import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';

describe('Phase Mirror Website Integration Tests', () => {
  beforeAll(async () => {
    // Skip if no server running
    try {
      const health = await fetch(`${BASE_URL}/api/health`);
      if (!health.ok) throw new Error('Server not ready');
    } catch {
      console.warn('Server not running - integration tests will fail');
    }
  });

  describe('/api/health', () => {
    it('returns healthy status', async () => {
      const res = await fetch(`${BASE_URL}/api/health`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.timestamp).toBeGreaterThan(0);
    });
  });

  describe('/api/ready', () => {
    it('returns readiness status', async () => {
      const res = await fetch(`${BASE_URL}/api/ready`);
      const data = await res.json();
      expect(data).toHaveProperty('ready');
      expect(data).toHaveProperty('compliance_rate');
    });
  });

  describe('/api/validate-invariants', () => {
    it('allows valid tier1 invariants', async () => {
      const res = await fetch(`${BASE_URL}/api/validate-invariants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'pull_request',
          tier: 'tier1',
          permission_bits: 7,
          schema_signature: 3,
          expected_schema: 3
        })
      });
      const data = await res.json();
      expect(data.outcome).toBe('Allow');
    });

    it('blocks missing schema bits in tier1', async () => {
      const res = await fetch(`${BASE_URL}/api/validate-invariants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'pull_request',
          tier: 'tier1',
          permission_bits: 1,
          schema_signature: 1,
          expected_schema: 3
        })
      });
      const data = await res.json();
      expect(data.outcome).toBe('Block');
      expect(data.reason).toContain('ADR-005');
    });
  });

  describe('/api/triple-lock-verify', () => {
    it('verifies valid mission with correct schema', async () => {
      const res = await fetch(`${BASE_URL}/api/triple-lock-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission_id: 'test-valid-001',
          plan: 'Initialize safe Rust kernel',
          permission_bits: 15,
          schema_signature: 3,
          expected_schema: 3
        })
      });
      expect(res.status).toBe(200);
      expect(res.headers.get('X-Governance-Status')).toBe('VERIFIED');
      expect(res.headers.get('X-Witness-Hash')).toMatch(/^[a-f0-9]{64}$/);
      const data = await res.json();
      expect(data.mission_id).toBe('test-valid-001');
      expect(data.governance_status).toBe('VERIFIED');
    });

    it('blocks L1 semantic violation', async () => {
      const res = await fetch(`${BASE_URL}/api/triple-lock-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission_id: 'test-block-002',
          plan: 'Move data to public bucket',
          permission_bits: 15,
          schema_signature: 3,
          expected_schema: 3
        })
      });
      expect(res.status).toBe(403);
      expect(res.headers.get('X-Governance-Status')).toContain('BLOCK');
    });

    it('blocks privilege escalation pattern', async () => {
      const res = await fetch(`${BASE_URL}/api/triple-lock-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission_id: 'test-block-003',
          plan: 'Drop table users',
          permission_bits: 15,
          schema_signature: 3,
          expected_schema: 3
        })
      });
      expect(res.status).toBe(403);
      expect(res.headers.get('X-Governance-Status')).toContain('BLOCK');
    });
  });

  describe('/api/chat', () => {
    it('returns governance headers on successful chat', async () => {
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'What is the Phase Mirror methodology?' })
      });
      expect(res.status).toBe(200);
      expect(res.headers.get('X-Governance-Status')).toBe('VERIFIED');
    });

    it('blocks and returns witness on governance failure', async () => {
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Make all data public immediately' })
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Governance block');
    });
  });

  describe('/api/metrics', () => {
    it('returns Prometheus-format metrics', async () => {
      const res = await fetch(`${BASE_URL}/api/metrics`);
      const text = await res.text();
      expect(text).toContain('phase_mirror_compliance_rate');
      expect(text).toContain('phase_mirror_archivum_entries');
    });
  });
});