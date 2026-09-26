# Architecture: the_guardian

the_guardian is the safety-certified sidecar for the Z-MOD optimization stack.

## Directory Structure
- `docs/adr/`: Architecture Decision Records.
- `policies/`: Declarative YAML safety and legal policies.
- `src/`: Rust-native implementation logic.
- `tests/`: Governance and safety simulation tests.

## Security Mandates
- **Intercept-Verify-Authorize:** All proposals from `the_genius` MUST be halted until cleared by the `ACEGuardian`.
- **Policy-as-Code:** No safety logic may be hardcoded. Use `policies/*.yaml` for domain-specific safety sets $S$.
- **Auditability:** Every Guardian action must produce a machine-readable audit trail for forensic review.
