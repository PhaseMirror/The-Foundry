# ADR-0xx: Full Wiring Plan for `pirtm-candle`

**Status**: Accepted  
**Date**: 2026-06-27  
**Owner**: Rust Core / PIRTM-Candle Lead  
**Related**: ADR-0xx-candle-integration.md, ADR-0xx-lean-formalization-mandate.md, ContractivityReceipt.json

## Context

`Prime/pirtm-candle/` exists as a crate skeleton with:
- `LambdaTrace`, `ContractivityReceipt`, `GovernanceStatus` types in `lib.rs`
- `LambdaMOp` contractivity operator in `contractivity.rs`
- `WitnessEmitter` per-step witness in `witness.rs`
- `TinyLlamaModel` / `GenerationConfig` stubs in `model.rs`
- `SedonaSpineEvaluator::evaluate_stop_rules` (fail-closed gate)
- **No real Candle model load or forward pass**

To produce governed TinyLlama inference that satisfies ADR-001..ADR-007, the crate must:
1. Load a real TinyLlama (or compatible Llama-2) checkpoint via `candle-core` / `candle-transformers`
2. Run a bounded forward pass emitting `LambdaTrace` at each step
3. Enforce Sedona Spine stop-rules before returning any token/string
4. Emit a `ContractivityReceipt` compliant with `ContractivityReceipt.json`
5. Expose `generate_governed` / `validate_trace` as the public API surface

## Decision

1. **Crate identity**: `pirtm-candle` (path: `Prime/pirtm-candle/pirtm-candle/`, package name: `pirtm-candle`).
2. **Math backend**: Copy `Prime/crates/core/src/{spectral,recurrence,lambda_bridge,gate,types}.rs` into `pirtm-candle/src/math/` as the spectral/contractivity substrate. No workspace path dependency — physically copied into the crate at build time.
3. **Model backend**: Use `candle-core` + `candle-transformers` for real Llama-family inference. The TinyLlama 1.1B config in `model.rs` becomes the reference model; weights are loaded from a `.safetensors` or GGUF path passed at runtime.
4. **Witness emission**: Every token-step calls `WitnessEmitter::emit_step`, which internally calls `LambdaMOp::scale_residual`. The `zero_spacings` array grows monotonically and is never downsampled.
5. **Stop-rule enforcement**: `SedonaSpineEvaluator::evaluate_stop_rules` (already in `lib.rs`) is the **only** gate. It checks:
   - `lambda_p * L_p < 1.0` (scalar collapse / contractivity floor)
   - `zero_spacings.length >= 1` (witness preservation)
   - (future) signature validity over `(witness_id || lambda_trace)`
6. **Public API surface**:
   ```rust
   pub struct TinyLlamaModel { ... }
   pub struct GenerationConfig { ... }
   pub struct ContractivityReceipt { ... }
   pub struct LambdaTrace { ... }
   
   impl TinyLlamaModel {
       pub fn load(config, device, model_path, lambda_m) -> Result<Self>;
       pub fn generate_governed(&self, prompt_tokens, config) -> Result<GovernedOutput>;
   }
   
   pub struct GovernedOutput {
       pub text: String,
       pub receipt: ContractivityReceipt,
   }
   
   pub fn witness_hash(text: &str, trace: &LambdaTrace) -> String;
   ```
7. **Copy-from-Prime rule**: Any project that needs governed inference copies the entire `Prime/pirtm-candle/` tree into its own source tree. No `path = "../../Prime/pirtm-candle"` workspace dependencies are permitted.
8. **MCP/CLI touchpoints**: `phase-mirror-mcp` `llm_generate` tool and `mirror-dissonance-cli` `llm-generate` command call `pirtm-candle`'s `generate_governed` via the copy-in pattern. Until copied in, they emit structured stubs (current state — acceptable).

## Wiring Plan (Execution Order)

### Phase 1 — Math substrate integration
- [ ] Create `Prime/pirtm-candle/src/math/mod.rs` re-exporting:
  - `spectral::SpectralGovernor`, `spectral::SpectralReport`
  - `recurrence::{step, StepInfo}`
  - `lambda_bridge::LambdaTraceBridge`
  - `gate::{EmissionGate, EmissionPolicy}`
  - `types::{Status, PrimeMask, ResonanceWord}`
- [ ] Physically copy `Prime/crates/core/src/spectral.rs`, `recurrence.rs`, `lambda_bridge.rs`, `gate.rs`, `types.rs` into `Prime/pirtm-candle/src/math/`.
- [ ] Add `nalgebra`, `ndarray` (optional, for spectral deps) to `Prime/pirtm-candle/Cargo.toml`.

### Phase 2 — Real Candle model forward pass
- [ ] Add `candle-transformers` + `candle-nn` to `Prime/pirtm-candle/Cargo.toml`.
- [ ] In `model.rs`, replace `TinyLlamaModel::load` stub with a real `candle_transformers::models::llama::Llama::load` (or equivalent for TinyLlama GGUF).
- [ ] Implement `forward_step` that runs one transformer block, captures residual norms, and feeds them to `WitnessEmitter::emit_step`.
- [ ] Ensure `Device::Cpu` is the default fallback; CUDA/Metal are runtime-detected.

### Phase 3 — Governed generation pipeline
- [ ] Implement `GovernedOutput` in `lib.rs`.
- [ ] Implement `TinyLlamaModel::generate_governed`:
  1. Tokenize prompt (stub BPE or real `tokenizers` crate).
  2. Loop `max_tokens` times:
     - Run forward step.
     - Call `WitnessEmitter::emit_step(step, token_id, residual_norm, ...)`.
     - Sample next token (`temperature`, `top_p`).
  3. Assemble `LambdaTrace` from final witness chain.
  4. Call `SedonaSpineEvaluator::evaluate_stop_rules(&trace)`.
  5. Return `GovernedOutput { text, receipt }`.
- [ ] Implement `witness_hash` (SHA-256 over canonical `(text || sorted lambda_trace JSON)`).

### Phase 4 — Test and verify
- [ ] Add `tests/governed_generation.rs`:
  - Load TinyLlama with `lambda_m = 0.95`.
  - Generate 8 tokens with stub or real model.
  - Assert `receipt.lambda_trace.zero_spacings.len() == tokens_generated`.
  - Assert `receipt.lambda_trace.lambda_p * receipt.lambda_trace.l_p < 1.0`.
  - Assert `receipt.status == "OK"`.
- [ ] Run `cargo test -p pirtm-candle` from a project that has copied it in.
- [ ] Verify `ContractivityReceipt.json` example passes the Python harness.

### Phase 5 — Downstream wiring
- [ ] Copy `Prime/pirtm-candle/` into `packages/phase-mirror-mcp/` (as `vendor/pirtm-candle/` or inline into `tools/llm_generate.rs`).
- [ ] Replace the current stub `LambdaTrace` in `phase-mirror-mcp/src/tools/llm_generate.rs` with the real `pirtm_candle::LambdaTrace`.
- [ ] Replace the stub in `packages/phase-mirror-cli/mirror-dissonance-cli/src/main.rs` similarly.
- [ ] Update `ci-governance.yml` to expect a real pirtm-candle copy step (currently skips gracefully if absent).

## Consequences

- **Positive**: Pure-Rust inference path with machine-checked contractivity witness on every step; fully offline; Candle CPU/CUDA/Metal portable; math substrate is auditable Lean-tagged Rust.
- **Negative**: Binary size grows (~2–4 MB for CPU TinyLlama 4-bit); `nalgebra` adds compile time; real GGUF loading requires `candle-transformers` version alignment.
- **Risk**: The Lean theorem `contractive_successor_one` covers only the `Successor` expression variant — full attention-block contractivity under PIRTM remains unverified. This is a **known open item**; current scope limits contractivity gating to residual-norm scalar bounds.

## Receipt linkage (post-wiring)

```
witness_id: sha256:<hash of (text || lambda_trace canonical JSON)>
proof_hash: LEAN_PROOF_HASH_108_CORE
lean_manifest_hash: <copy of Prime/substrates/lean/lake-manifest.json sha256>
contractivity_receipt_version: 1.0.0
```

## Open items

| Item | Owner | Horizon |
|------|-------|---------|
| Real `candle-transformers` Llama forward pass | Candle Integration | 7 days |
| SpectralGovernor → LambdaMOp bridge (real eigenvalues from attention tensors) | Math Backend | 14 days |
| BPE tokenizer stub → real `tokenizers` crate | Candle Integration | 7 days |
| Signature over `(witness_id || lambda_trace)` | Governance | 7 days |
| Full attention contractivity theorem in Lean | Lean Formalization | 14 days |

## References

- `Prime/pirtm-candle/src/{lib,contractivity,witness,model}.rs`
- `Prime/crates/core/src/{spectral,recurrence,lambda_bridge,gate,types}.rs`
- `ContractivityReceipt.json`
- `docs/adr/ADR-0xx-candle-integration.md`
- `Substrates/lean/PIRTM/Core.lean` (via Prime/)
