# ADR-MCP-004: Multi-Server Spectral L0 Validation

## Status
Accepted (2026-06-29)

## Context
Phase 3 Step 4 requires multi-server MCP routing with HoE escalation. When multiple MCP servers are invoked in a workflow, each must undergo spectral L0 validation before execution. The central tension is maintaining L0 invariant consistency across nodes while enabling HoE escalation for violating metrics.

## Decision
**Spectral L0 Consistency First**: Multi-server validation prioritizes spectral L0 consistency across all nodes. No server may proceed past the ALP gate until all spectral checks pass. HoE escalation takes precedence over autonomous execution when any node reports ρ ≥ 1-ε_tier.

### Multi-Server Validator Flow
```
1. Collect SpectralMetrics from each MCP server
2. Route via HoERouter to determine per-server decision
3. Track worst decision (Escalate > Review > Autonomous)
4. If any node escalates, create UnifiedWitness and halt
5. Proceed only if all nodes are Autonomous
```

### Tier Epsilon Policy Propagation
The tier ε margin is propagated via `MultiServerValidation`:
- `tier` field in `UnifiedWitness.execution_receipt.multi_server_validation`
- `epsilon` computed from tier, recorded as evidence
- `max_spectral_radius` across all servers recorded for audit

## Consequences
- **Positive**: All servers validated before any execution; L0 invariant preserved
- **Positive**: Multi-server witness anchored in Archivum with complete audit trail
- **Negative**: Slightly higher latency for multi-server workflows due to validation aggregation

## Verification
- `MultiServerValidator::validate_servers` returns aggregated decision
- `UnifiedWitness.witness_hash` recorded for multi-server escalations
- `cargo test --test governance` passes with 7 tests

## Dependencies
- ADR-MCP-002: Tool Registry (source of truth for server bindings)
- ADR-MCP-003: SAT for token-based admission (server attestation)
- Phase 3 Step 3: MCP Tool Descriptor Registry (complete)

## Owner
Compiler Engineering

## Metric
Multi-server MCP enforces spectral L0 + tier ε across nodes. HoE escalation triggered on ρ ≥ 1-ε_tier.

## Horizon
Complete (2026-06-29)

## Metric Recorded
- `cargo test --test governance` passes (7 tests)
- Multi-server validator enforces tier ε across nodes
- HoE escalation triggered on spectral radius violation
- UnifiedWitness anchored in Archivum for multi-server decisions