# ADR-008: Phase Mirror Echo Integration

## Status
Proposed

## Context
Phase Mirror Echo is a TypeScript/Node.js frontend application that requires integration with the Phase Mirror GPT Rust kernel for governance-first AI assistance. This replaces direct Gemini API calls with Triple-Lock verified processing.

## Decision
Integrate Phase Mirror GPT via MCP JSON-RPC over child_process stdin/stdout, providing fail-closed governance enforcement for all chat interactions.

## Integration Architecture

### Child Process Architecture
```
Browser → Express API → phase-mirror-gpt binary (MCP) → Triple-Lock → Response
```

### Endpoints
| Endpoint | Function |
|----------|----------|
| `/api/chat` | Triple-Lock verified chat |
| `/api/triple-lock-verify` | Direct verification |
| `/api/governance-status` | Real-time compliance |
| `/api/validate-invariants` | L0 bitmask checks |

### Data Flow
1. Incoming message triggers `triple_lock_verify` MCP call
2. On VERIFIED: `reflect_plan` generates critique prompt
3. Headers: `X-Governance-Status`, `X-Witness-Hash`, `X-P-Lineage`

## Configuration
```bash
PM_GPT_BINARY=/path/to/phase-mirror-gpt/bin/phase-mirror-gpt
```

## Dependencies
- ADR-001 through ADR-007 (Phase Mirror GPT core)
- phase-mirror-gpt binary (production release)

## Consequences
- All responses are governance-verified before delivery
- Compliance rate drives system trust level
- p=7 lineage provides audit trail for all interactions