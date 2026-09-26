# ADR-007: Phase Mirror GPT as Primary Backend (Google Dependency Removal)

## Status
Proposed → Draft → Accepted → Implemented → Verified

## Context
Phase Mirror Echo currently depends on Google's Gemini API (`@google/genai`) for chat functionality. Phase Mirror GPT provides a sovereign, auditable LLM inference system with built-in Triple-Lock governance. This ADR formalizes the replacement of external AI dependencies with the internal Phase Mirror GPT kernel.

## Decision
Replace `@google/genai` with native Phase Mirror GPT invocation via Unix Domain Socket (UDS) transport, enforcing Triple-Lock verification on all LLM interactions.

## Architecture

### Current State (Gemini-dependent)
```
Echo Frontend
  └─> server.ts (express)
       └─> @google/genai (Gemini 3.5-flash)
            └─> External API call
```

### Target State (Sovereign)
```
Echo Frontend
  └─> server.ts (express)
       └─> UDS Bridge (/tmp/pm-gpt.sock)
            └─> phase-mirror-gpt (Rust MCP server)
                 ├─> Triple-Lock Verification
                 ├─> Semantic Policy (L1)
                 ├─> Telemetry Compliance (L0-Tel)
                 └─> Invariant Validation (L0-Bit)
```

## Implementation Plan

### Phase 1: UDS Integration Layer
1. Create `./.pm-unix/` directory for socket placement
2. Implement `UdsClient` in `server.ts` for Phase Mirror GPT communication
3. Replace `/api/chat` to route through GPT kernel instead of Gemini

### Phase 2: LLM Engine Replacement
4. Remove `@google/genai` from `package.json` dependencies
5. Add `reflect_plan` tool invocation to `/api/chat` handler
6. Cache compiled Rust binary in `build-dir/bin/phase-mirror-gpt`

### Phase 3: Governance Enforcement
7. All chat requests pass through `triple_lock_verify` first
8. Responses include `X-Witness-Hash` header for traceability
9. Fail-closed semantics: Blocked requests return HTTP 403

## API Changes

### `/api/chat` (Modified)
```typescript
// Before: Direct Gemini call
POST /api/chat { message, history, files? }

// After: GPT kernel with verification
POST /api/chat { 
  message: string, 
  history?: Array<{role, text}>,
  permission_bits?: number,
  schema_signature?: number,
  expected_schema?: number
}
```

### Response Headers Added
- `X-Governance-Status` - VERIFIED, BLOCKED:L0, BLOCKED:L1
- `X-Witness-Hash` - SHA-256 hash of verification
- `X-P-Lineage` - p=7 provenance chain identifier

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| UDS socket permissions | Use `chmod 600` with dedicated service user |
| Binary availability | Compile fallback: npm run build with esbuild output |
| Response latency | Cache verified session states, async streaming |
| Model capability | Qwen integration via `qwen_sovereignty_gate.rs` |

## Rollback Plan
- Keep Gemini integration behind `USE_GEMINI_FALLBACK=true` env flag
- Serve stale cache on GPT kernel failure
- Emergency `REVERT_TO_GEMINI` kill switch

## Deployment Checklist
- [ ] Build Rust binary for target platform (`cargo build --release`)
- [ ] Place binary at `/build-dir/bin/phase-mirror-gpt`
- [ ] Create UDS socket handler in server.ts
- [ ] Remove `@google/genai` dependency
- [ ] Update `Cargo.toml` with Qwen inference features
- [ ] Add smoke tests for GPT kernel availability
- [ ] Update documentation in `/.env.local`

## References
- MCP Contract: `mcp-contract.json` (tools: `reflect_plan`, `triple_lock_verify`)
- Rust Binary: `bin/phase-mirror-gpt`
- Governance: ADR-005, ADR-006