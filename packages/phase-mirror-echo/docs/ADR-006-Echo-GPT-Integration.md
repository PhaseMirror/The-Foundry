# ADR-006: Phase Mirror Echo ↔ GPT Integration

## Status
Proposed → Draft → Accepted → Implemented → Verified

## Context
Phase Mirror Echo (React/TSX frontend) currently operates with a Gemini-powered chat endpoint. Phase Mirror GPT (Rust backend) provides Triple-Lock verification, governance enforcement, and the Invariant Consistency Oracle. This ADR formalizes their integration for production-grade agentic liability management.

## Decision
Integrate Phase Mirror Echo with Phase Mirror GPT via a Unix Domain Socket bridge for Triple-Lock verification of all chat interactions.

## Integration Architecture

### 1. Communication Bridge
- **Pattern**: Unix Domain Socket (`/.pm-unix/pm-gpt-bridge.sock`)
- **Protocol**: JSON-RPC 2.0 with strict schema validation
- **Boundary**: Echo sandbox → GPT kernel (process isolation maintained)

### 2. Triple-Lock Enforcement Points

| Component | Echo Entry Point | GPT Validator | Enforcement |
|-----------|-----------------|-------------|-------------|
| Genius (Draft) | `/api/chat` payload | `transport.rs` | JSON parse validation (-32700 on failure) |
| Guardian (L1) | `CopilotView` message | `domain_invariants.rs` | Semantic block on policy violation |
| Guardian (L0-Tel) | User context session | `telemetry.rs` | 100% compliance floor check |
| Guardian (L0-Bit) | Permission context | `validator.rs` | Bitmask validation against PERM_* |
| Examiner (Cert) | Response witness | `archivum.rs` | Merkle chain append with witness_hash |

### 3. API Surface Extension

```typescript
// New endpoints to be added to server.ts
POST /api/triple-lock-verify   // Execute full Triple-Lock sequence
POST /api/governance-status   // Get current floor metrics
POST /api/validate-invariants // Single L0 invariant check
```

### 4. Session Contract

```typescript
interface IntegratedSession {
  sessionId: string;        // UUID v7
  traceId: string;          // For distributed tracing
  permissionBits: number;     // L0 bitmask
  schemaSignature: number;    // Schema integrity bits
  expectedSchema: number;     // Expected baseline
}
```

### 5. Fail-Closed Semantics
- Any Triple-Lock block returns HTTP 403 with `X-Governance-Status: BLOCKED` header
- Witness hash is returned in `X-Witness-Hash` header for tracing
- All interactions logged to Λ-Archivum with p=7 lineage

## Consequences

### Positive
- Production-grade liability enforcement on all AI interactions
- Deterministic governance traceability via witness hashes
- Seamless sandbox-to-kernel verification pipeline

### Negative
- Additional latency (~14ms L0 hot-path floor check)
- Requires `GEMINI_API_KEY` + local Rust binary coordination
- Socket permissions must be hardened for production

## Implementation Checklist
- [ ] Add `/api/triple-lock-verify` endpoint to `server.ts`
- [ ] Add Rust UDS server wrapper for Triple-Lock functions
- [ ] Extend `CopilotView.tsx` with governance status indicator
- [ ] Add witness hash display in UI badge
- [ ] Update `DemoApp` simulator to show actual vs simulated governance
- [ ] Document integration in `README.md`

## References
- ADR-005: Triple-Lock Mapping
- MCP Contract: `mcp-contract.json`
- Policy Schema: `config/policy.toml`