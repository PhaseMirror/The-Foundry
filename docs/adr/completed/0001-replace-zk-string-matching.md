# ADR 0001: Replace ZK String Matching with Cryptographic Verification

## Status
Proposed

## Context
The `LegislativeEngine::verify_zk` function claims to verify zero-knowledge proofs. The current implementation performs prefix matching on the string "LEAN". String prefix matching provides zero security guarantees and operates entirely on trust.

## Decision
We will remove string matching. We will integrate a zero-knowledge verification library (e.g., `risc0-zkvm`, `sp1`, or Lean 4 proof checker). The `verify_zk` function will parse the proof artifact and mathematically verify the cryptographic proof against a known verifier image ID or theorem statement.

## Consequences
- Unverified string artifacts will fail validation.
- Transition operations will require computationally valid proofs.
- Vibe-based proof validation is eliminated.
