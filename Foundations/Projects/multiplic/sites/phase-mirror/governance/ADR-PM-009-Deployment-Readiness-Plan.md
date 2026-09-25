# ADR-PM-009: Phase Mirror Website Deployment Readiness Plan

## Status
Accepted (2026-06-29) - Integration endpoints implemented, tests written, dockerfile created.

## Context
The Phase Mirror ecosystem consists of three integrated components:

1. **Phase Mirror GPT** (`packages/phase-mirror-gpt`) - Rust MCP server with Triple-Lock governance
2. **Phase Mirror Website** (`packages/phase-mirror-website`) - TypeScript Express/Vite frontend with co-pilot UI
3. **Phase Mirror Agent** (`packages/phase-mirror-agent`) - Fallback LLM backend using transformers.js

While the Rust kernel passes all governance tests (ADR-007 marked complete), the website-to-kernel integration has gaps requiring systematic verification before production deployment.

## Current State Analysis

### ✅ Verified Components
| Component | Status | Evidence |
|-----------|--------|----------|
| L0 Bitmask Validator | Production Ready | `test_l0_validator_isolated_edge_cases` passes |
| Λ-Archivum WAL | Production Ready | Async WAL with hash chaining, durable recovery |
| Triple-Lock Suite | Production Ready | 5/5 test scenarios pass (Scenarios 1-5) |
| MCP Transport | Production Ready | JSON-RPC 2.0 compliant, fail-closed blocks |
| CI Governance Gate | Production Ready | `.github/workflows/ci-governance.yml` configured |
| Docker Image | Ready | `Dockerfile` builds static binary |

### ✅ Integration Completed (This ADR)
| Component | Status | Evidence |
|-----------|--------|----------|
| Health check endpoint | Added | `server.ts` lines 259-262 |
| Readiness probe | Added | `server.ts` lines 264-273 |
| Prometheus metrics | Added | `server.ts` lines 275-285 |
| Integration tests | Created | `tests/integration.test.ts` |
| Test runner | Configured | `vitest.config.ts` + npm scripts |
| Production Dockerfile | Created | `Dockerfile` |
| Deployment docs | Created | `DEPLOYMENT.md` |

## Decision

### Phase 1: Integration Test Suite (Required)
Create `packages/phase-mirror-website/tests/integration.test.ts` to verify:

```typescript
// Test: website → MCP tool call → governance verification → response
describe('Phase Mirror Integration', () => {
  test('triple-lock-verify blocks L1 violation', async () => {
    const res = await fetch('/api/triple-lock-verify', {
      method: 'POST',
      body: JSON.stringify({
        mission_id: 'test-001',
        plan: 'Move data to public bucket', // Should trigger semantic block
        permission_bits: 15,
        schema_signature: 3,
        expected_schema: 3
      })
    });
    expect(res.status).toBe(403);
    expect(res.headers.get('X-Governance-Status')).toContain('BLOCK');
  });

  test('triple-lock-verify passes valid plan', async () => {
    const res = await fetch('/api/triple-lock-verify', {
      method: 'POST',
      body: JSON.stringify({
        mission_id: 'test-002',
        plan: 'Initialize safe Rust kernel',
        permission_bits: 15,
        schema_signature: 3,
        expected_schema: 3
      })
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Governance-Status')).toBe('VERIFIED');
  });
});
```

### Phase 2: Health/Readiness Endpoints
Add to `server.ts`:

```typescript
app.get("/api/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: Date.now() });
});

app.get("/api/ready", async (_req, res) => {
  try {
    const status = await getGovernanceStatus();
    const ready = status.compliance_rate === 1.0;
    res.status(ready ? 200 : 503).json({ ready, ...status });
  } catch {
    res.status(503).json({ ready: false, error: "Cannot connect to governance kernel" });
  }
});
```

### Phase 3: Prometheus Metrics Export
Add to `server.ts`:

```typescript
app.get("/api/metrics", async (_req, res) => {
  const status = await getGovernanceStatus();
  res.set('Content-Type', 'text/plain').send(`
# HELP phase_mirror_compliance_rate Governance compliance percentage
# TYPE phase_mirror_compliance_rate gauge
phase_mirror_compliance_rate ${status.compliance_rate}

# HELP phase_mirror_archivum_entries Total events in ledger
# TYPE phase_mirror_archivum_entries gauge
phase_mirror_archivum_entries ${status.last_archivum_sequence}
`.trim());
});
```

### Phase 4: Deploy Configuration

#### Environment Variables Required
```bash
# Required
PM_GPT_BINARY=/app/bin/phase-mirror-gpt  # Path to Rust binary
GPT_PROJECT_ROOT=/app/archivum           # Working directory for archivum.log

# Optional LLM Backends
LLM_MOCK=true                            # For testing
OLLAMA_HOST=http://ollama:11434          # Production: Ollama connection
LLM_MODEL=qwen2.5:1.5b                  # Production: Model selection
```

#### Docker Compose for Production
```yaml
# docker-compose.prod.yml
services:
  phase-mirror-gpt:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - ./archivum-data:/app/archivum
    environment:
      - RUST_LOG=info
    restart: unless-stopped

  phase-mirror-website:
    build:
      context: ./packages/phase-mirror-website
      dockerfile: Dockerfile.web
    ports:
      - "3001:3001"
    depends_on:
      - phase-mirror-gpt
    environment:
      - PM_GPT_BINARY=/app/bin/phase-mirror-gpt
      - NODE_ENV=production
```

### Phase 5: Production Deployment Checklist

- [x] Integration tests written (`tests/integration.test.ts`)
- [x] Health check endpoint returns healthy status
- [x] Readiness probe implemented with compliance check
- [x] Prometheus metrics endpoint available
- [ ] TLS certificate configured at ingress layer
- [ ] Rate limiting: 100 requests/minute per IP
- [ ] CORS restricted to known domains
- [ ] Prometheus metrics scraped and alerting configured
- [ ] Log aggregation configured (stderr → Loki/CloudWatch)
- [ ] Binary checksum verified in deployment pipeline
- [ ] Backup procedure for `archivum.log` and `MASTER_REGISTRY.md`

### Phase 6: Documentation Updates (Pending)
- [ ] Update README with deployment instructions
- [ ] Add architecture diagram to docs/

## Architecture Verification

### L0 Invariants Compliance
1. `UnifiedWitness` contains valid `witness_hash`, `mission_id`, `governance_status`
2. Workflow execution status recorded in `TripleLockWitness`
3. Constitutional validation via `InvariantConsistencyOracle` before tool execution
4. Git commit hook to anchor Archivum entries (manual intervention required for now)
5. All MCP tool calls route through Rust governed server (verified in `server.ts:21-75`)

### Data Flow Verification
```
Browser (CopilotView.tsx)
  ↓ POST /api/chat (server.ts:260)
  ↓ triple_lock_verify MCP call (server.ts:155-172)
  ↓ Phase 1: Genius (draft hash)
  ↓ Phase 2: Guardian (L1 semantic + L0 bitmask)
  ↓ Phase 3: Examiner (ledger commit + witness generation)
  ↓ On VERIFIED: callLlmBackend() (server.ts:78-151)
  ↓ Response with X-Governance-Status headers
```

## Dependencies
- ADR-001: Invariant Consistency Oracle
- ADR-002: L0 Bitmask Validation
- ADR-003: Λ-Archivum Provenance
- ADR-004: MCP Transport Protocol
- ADR-005: Fail-Closed Governance
- ADR-006: Triple-Lock Mechanics
- ADR-007: Production Deployment Readiness
- ADR-PM-008: TinyLlama Sedona Integration

## Verification Gates
1. **Integration Gate**: All website-API tests pass with proper governance headers
2. **Performance Gate**: L0 validation < 250ns under concurrent load
3. **Compliance Gate**: compliance_rate = 1.0 with all artifacts present
4. **Security Gate**: `cargo clippy` clean, no high-severity audit findings
5. **Recovery Gate**: Archivum WAL recovers ≥ 3 entries correctly after restart

## Consequences
- Production deployment requires all gates to pass
- Missing LLM backend defaults to mock mode (documented behavior)
- Fail-closed blocks return HTTP 403 with witness for audit trail
- Rate limiting prevents resource exhaustion attacks

<!-- LawfulRecursionVersion:1.0 -->