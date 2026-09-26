# ADR-0xx: Candle-Integration for TinyLlama Inference

**Status**: Draft  
**Date**: 2026-06-27  
**Owner**: Rust Core / Candle Integration Lead  
**Related**: ADR-001..ADR-007, Porting TinyLlama.md

## Context

TinyLlama (1.1B, Llama-2 architecture) must run as a governed Rust inference engine within the Phase Mirror stack. Existing scaffolding shells `pirtm-candle/` (Cargo.toml + src/lib.rs stub) and `Ensembles/sigmatics-core/` exist but lack production wiring.

Candle is Hugging Face’s pure-Rust ML framework supporting CPU/CUDA/Metal/WASM backends and native LLaMA-family model loading. The integration must satisfy:

- **L0 bounds**: every forward pass emits `LambdaTrace` with `zero_spacings` array, `lambda_p`, `L_p`.
- **Fail-closed**: `SIG_GOV_KILL` triggers when `lambda_p * L_p >= 1.0` or `zero_spacings` is empty.
- **Witness preservation**: full `zero_spacings` arrays (not scalars) retained on every generation step.
- **MCP/CLI exposure**: governed generation must be callable via `phase-mirror-mcp` tools and `mirror-dissonance-cli`.

## Decision

1. **Engine**: Use `pirtm-candle` crate as the production TinyLlama inference engine.
2. **Wrapper pattern**: Candle handles tensor/attention/FFN; `LambdaMOp` wrapper scales residuals and emits `LambdaTrace`.
3. **Governance layer**: `SedonaSpineEvaluator::evaluate_stop_rules` gates output before MCP/CLI release.
4. **Receipt format**: `ContractivityReceipt` (status, witness_id, lambda_trace) is the mandatory output artifact.
5. **MCP tool**: `generate_governed` in `phase-mirror-mcp` routes through contractivity check before returning tokens.
6. **CLI commands**: `mirror-oracle llm-generate` and `mirror-oracle llm-validate` in `phase-mirror-cli`.

## Consequences

- Positive: Pure-Rust inference, edge deployable, MCP/CLI native governance hooks, Lean-verified contractivity proofs bindable via `proof_hash`.
- Negative: Candle binary size (~2-4MB for CPU TinyLlama 4-bit); WASM bundle needs separate CI target; Lean proof `dist_successor` covers only Successor variant—full attention contractivity deferred to next ADR.
- Risk: Post-hoc `Lambda_m` wrapping on frozen weights may not achieve `epsilon_ag <= 1e-6` without PIRTM-augmented retraining. Precision question from `Porting TinyLlama.md` remains open.

## Receipt linkage

Every output step must carry:
```
witness_id: sha256:<hash>
proof_hash: LEAN_PROOF_HASH_108_CORE  # from Substrates/lean/PIRTM/Core.lean
lean_manifest_hash: <lake-manifest.json sha256>
```

## Milestones

| Milestone | Owner | Horizon |
|-----------|-------|---------|
| pirtm-candle compiles + tests pass | Rust Core | 7 days |
| MCP `generate_governed` tool wired | MCP-Server | 7 days |
| CLI `llm-generate`/`llm-validate` | CLI/Governance | 7 days |
| Lean `contractive_successor_one` theorem linked | Lean Formalization | 14 days |
| CI: Candle build + governance gate | DevOps | 7 days |
| Precision question resolved (perplexity vs contractivity) | Governance | 14 days |

## References

- `docs/adr/Porting TinyLlama.md`
- `pirtm-candle/src/{lib,contractivity,witness,model}.rs`
- `Substrates/lean/PIRTM/Core.lean`
- `phase-mirror-mcp/src/lib.rs`
