# ADR-001: Project Structure

## Status
Accepted

## Context
PIRTM-Formal is a production-grade Lean 4 formalization project for Multiplicity Theory components. It must be modular, extensible, and verifiable without external dependencies (no mathlib).

## Decision
Structure the project as:
- `src/PIRTM/` - Core modules organized by mathematical domain
- `tests/` - Test harnesses invoking `#check` on key theorems
- `docs/ADRs/` - Decision records for each component

The Lake package `PIRTM` exports from `src/PIRTM/` with `PIRTM.Theorems` as the root module.

## Consequences
- Modular proofs can be developed independently
- No external dependencies reduce attack surface
- Build succeeds iff all theorems prove (no sorry in final)

## Appendix B: Spectral L0 Contractivity Formalization (2026-06-28)

### Overview
Hybrid Gershgorin + power iteration spectral contractivity enforcement for Multiplicity Theory execution substrate.

### Priority Policy (Defensive Publication)
1. **GERSHGORIN_DISK_BOUND_FIRST**: Safety-first early violation detection via Gershgorin disks
2. **POWER_ITERATION_CONFIRMATION_SECOND**: Exact spectral radius for final validation

If Gershgorin > 1-ε → L0_VIOLATION (early, safe)  
If PowerIteration > 1-ε → L0_VIOLATION (exact, required)  
If both < 1-ε → L0_PRESERVED

### Theorem Structure (Lean 4)
```lean
theorem spectral_l0_preserved
  (A : Matrix)
  (cert : GershgorinCertificate)
  (tier : Nat)
  (h_gershgorin : gershgorin_bound A cert < 1 - tier_epsilon tier)
  (h_power : power_iteration_limit A < 1 - tier_epsilon tier) :
  L0_contractivity_preserved A
```

### Dual-Bound ε Calibration
- Tier 1 (ε = 0.1): Conservative early violation threshold
- Tier 4 (ε = 0.01): Tight exact validation threshold
- Both bounds must satisfy < 1-ε for L0 preservation
- See: `Prime/substrates/multiplicity/lean/SpectralStability.lean`

### Convergence Rate Policy
- Rate = |λ_{k+1} - λ_k| / λ_{k+1} determines iteration count
- Rate < (1 - ε) → Fast convergence, adaptive early exit
- Rate ≥ (1 - ε) → Slow convergence, full iterations required
- Gershgorin provides safety fallback regardless of convergence speed

### Rust Implementation
- `SpectralGovernor::hybrid_spectral_radius` in `hologram-core/src/spectral.rs`
- `SpectralMetrics` tracks spectral_radius, gershgorin_radius, drift_score, convergence_rate, effective_iterations
- Convergence rate = |λ_{k+1} - λ_k| / λ_{k+1} enables adaptive early exit
- 143 tests pass; `cargo test --workspace` validates on every commit

### Completion Report (2026-06-28)
- **Status**: SPECTRAL_L0_STABLE
- **Artifacts**: `Prime/substrates/multiplicity/lean/SpectralStability.lean`
- **Bindings**: pirtm-candle + hologram-core synchronized
- **Governance**: L0 preserved via dual-bound ε policy
- **Next**: Phase 3 Multiplicity Theory substrate execution with tensor network lowering

### HoE Spectral Routing Policy
- **Escalation Trigger**: `spectral_radius ≥ 1 - ε_tier` → Human-on-Exception
- **Convergence Uncertainty**: `convergence_rate ≥ (1 - ε)` → Review required
- **Autonomy Gate**: Both bounds satisfied → Autonomous execution
- **Certificate Chain**: SpectralMetrics.witness_hash anchors HoE decisions

### Tier Selection → Contraction Margin Binding
| Tier | ε | Contraction Margin | HoE Frequency |
|------|---|-------------------|---------------|
| 1 | 0.10 | ≥ 0.9 | Conservative (frequent review) |
| 4 | 0.01 | ≥ 0.99 | Aggressive (rare escalation) |

Autonomy only when: `ρ < 1-ε` AND `rate < 1-ε`
Safety fallback: Gershgorin early detection regardless of convergence

### Phase 3 HITL Readiness
- **Spectral Certificate Format**: Ready for HoE escalation routing
- **Tier Propagation**: `SessionGraphOp::with_spectral` with tier parameter
- **Bindings**: pirtm-candle, hologram-core, Prime/crates/core synchronized
- **Status**: READY_FOR_HITL_INTEGRATION

### Phase 3 Runtime Implementation (2026-06-28)
- **Tensor Network Lowering**: Spectral L0 enforced via hybrid governor
- **Runtime Propagation**: tier parameter embedded in MLIR session_graph
- **HoE Escape Velocity**: Gershgorin fallback enables fast-path autonomous
- **Governance**: SpectralCertificates carry witness_hash for audit trail

### Phase 3 Ready Declaration (2026-06-28)
- **Status**: PHASE_3_READY
- **Tensor Network Lowering**: `emit_session_graph_with_matrix` computes spectral + convergence rate
- **HITL Scaffolding**: Tier propagated to runtime via MLIR attributes
- **Gershgorin Fast-Path**: Embedded for autonomous execution when stable
- **Governance**: No check_l0(0.9) fallback; tier-based ε sufficient
- **Next**: Compiler Engineering tensor network lowering + Phase 3 substrate execution

### Phase 3 Tensor Network Lowering Implementation (2026-06-29)
- **Status**: PHASE_3_TENSOR_LOWERING_COMPLETE
- **Tensor::matmul_with_tier**: Spectral L0 enforcement before GEMM execution
- **SessionGraphOp::with_spectral**: Tier-aware session graph construction with embedded metrics
- **HoERouter::route**: Escalation decision from ρ ≥ 1-ε_tier OR convergence_rate ≥ (1-ε)
- **SpectralGovernor**: Hybrid Gershgorin + power iteration in hologram-core + pirtm_core + crates/core
- **Metrics**: spectral_radius, gershgorin_radius, contraction_margin, convergence_rate, effective_iterations
- **Tier Propagation**: MLIR session_graph emits tier + convergence_rate attributes
- **Tests**: 148 tests pass (hologram-core 145 + crates/core 3); all workspace tests pass
- **Runtime Integration**: HoE escalation router with SpectralMetrics binding for L0 violation detection
- **Next**: Phase 4 Multi-server MCP routing

### Phase 5 Production Rollout (2026-06-29)
- **Status**: PHASE_5_DEPLOYMENT_READY
- **Spectral L0 Consistency**: All MCP servers validated before execution; HoE escalation blocks on ρ ≥ 1-ε_tier
- **Archivum Anchoring**: UnifiedWitness.witness_hash → Git ledger SHA-256; timestamp immutable
- **Tier ε Binding**: execution_receipt.multi_server_validation.{tier, epsilon, max_spectral_radius}
- **Workspace Tests**: Prime 49 tests pass; Commander 13 tests pass
- **Clippy**: 0 errors in Prime workspace; pre-existing warnings in multiplicity-common preserved
- **Next**: Phase 6 Python MCP policy proxy (production deployment)