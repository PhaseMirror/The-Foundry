# Z-Bit Suggested Enhancements

This document tracks planned and speculative enhancements for the Z-Bit module, categorized by impact and technical domain, focused on the Multiplicity stack.

## 1. Integration & Developer Experience (DX)

- **[M] Z-Bit CLI**: Create a single command-line tool `zbit` that handles anchoring, simulation, and verification.
  - `zbit anchor create --receipts <file>`
  - `zbit sim run --mode resonance`
  - `zbit verify <anchor-proof>`
- **[L] Auto-Configurator**: A tool to automatically detect and configure local Bitcoin Core regtest settings for the `anchor_regtest.sh` script.

## 2. Protocol & Security

- **[H] PWEH-Anchored Metadata**: Extend the `AnchorProof` to include a summary of the PWEH (Prime-Weighted Execution Hash) log. This would prove that the anchor was generated following the certified ZRSD dynamics.
- **[M] MuSig2 Collaborative Anchoring**: Replace the `I_XONLY` single-key internal path with a MuSig2 aggregated key. This allows multiple aggregators to co-sign anchors without revealing their individual keys.
- **[M] Timelocked Policy Branching**: Add more Taproot leaves for complex recovery policies, such as "Aggregator key + Admin key" (immediate) vs "Aggregator key alone" (after 1000 blocks).
- **[H] Zero-Surveillance Soft Reveal**: Utilize ZK-proofs (e.g., Groth16) to prove that a commitment exists in a Bitcoin block without revealing the specific `anchor_root` or transaction ID until necessary.

## 3. Performance & Scaling

- **[M] Fock-Space Optimization**: Optimize the `pirtm` recursive tensor operations by implementing a sparse matrix backend for high-dimensional Fock spaces.
- **[L] Batching Efficiency**: Implement a more sophisticated Merkle tree (e.g., Tiger or BLAKE3) for receipt batching if the number of receipts exceeds $10^6$ per epoch.

## 4. Formal Verification

- **[M] Lean4 ZRSD Stability Proofs**: Formally prove that the ZRSD feedback loop remains within the `StabilityGate` contractive bounds under all prime distributions.
- **[M] Taproot Descriptor Invariants**: Formally verify that the generated Taproot descriptors are always Miniscript-compliant and spendable under the defined timelocks.

## 5. Telemetry & Observability

- **[M] Phase Mirror Dashboard**: A real-time visualizer for ZRSD simulations, showing Fock space amplitudes, prime occupation shifts, and SHA-256 residual resonance.
- **[L] Grafana Integration**: Export PWEH benchmark metrics to Prometheus/Grafana for long-term tracking of "Certified" performance gains.

---

### Legend
- **[H]**: High Impact / High Priority
- **[M]**: Medium Impact / Medium Priority
- **[L]**: Low Impact / Speculative
