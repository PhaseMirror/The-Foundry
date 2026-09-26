# ADR-0030: Adaptive Threshold Enforcement for False Positive Rate Degradation

> **Status**: Proposed  
> **Date**: 2026-06-18  
> **Authors**: Antigravity  
> **Spec Reference**: Phase 2: Dissonance Scan Adaptive Feedback (ADR-PM-001)

---

## Problem Statement

As the Phase Mirror governance boundary scales, rigid enforcement of compliance policies (such as the unpinned binary check under `MD-002`) can block developer execution pipelines for valid test configurations and mock scripts. Standard fail-closed mechanisms ensure safety but increase integration friction, leading developers to attempt to bypass the rules entirely. A system is needed to dynamically downgrade policies when false-positive rates indicate the rule is overly broad in practice, without deleting the audit trail.

---

## Solution

Formalize and enforce the **Adaptive Feedback Loop** with a 15% false-positive rate threshold:

1.  **False Positive Store**: Utilize a structured `fp_store.json` database to track total violations and active developer overrides for each compliance rule.
2.  **Adaptive Feedback Loop Integration**: Widen the `mirror-dissonance-cli` validation engine to run rules against historical statistics:
    $$\text{FPR} = \frac{\text{user\_overrides}}{\text{total\_violations}}$$
3.  **15% Threshold Rule**: If a policy's measured False Positive Rate (FPR) exceeds `0.15` (15%), downgrade its severity from `BLOCK` to `WARN`.
4.  **Audit Preservation**: Prepend `[DEGRADED POLICY]` to any downgraded violation message to ensure full transparency for security auditing while allowing CI/CD pipelines to pass (exiting with code `0`).

---

## Consequences

### Positive

- **Pipeline Availability**: Prevents verified mock/test files from halting deployment pipelines.
- **Dynamic Policy Tuning**: Enables compliance teams to identify overly strict rules programmatically.
- **Unbroken Audit Lineage**: Keeps all violations in `dissonance_report.json` instead of ignoring them.

### Negative

- **Policy Leakage Risk**: A high rate of developer bypass could temporarily degrade enforcement of a vital check until statistics are reviewed.
- **Configuration Management**: Requires maintaining and versioning `fp_store.json` across environments.

---

## Alternatives Considered

### Alternative A: Global Rule Exclusions

**Description**: Add path-based glob patterns to exclude specific directories (e.g., `test/`, `mock/`) from scans.  
**Rejection Reason**: Static exclusions create permanent blind spots where insecure binaries could be committed. The adaptive model ensures that violations are still scanned, logged, and audited.

---

## Rationale

By implementing a mathematical threshold for policy degradation, the system balances security integrity (L0/L1 baseline) with operational agility. It ensures that the Ξ-Constitution remains adaptive and responsive to actual development practices rather than being a static hurdle.

---

## Acceptance Criteria

- [ ] `mirror-dissonance-cli` successfully loads the `fp_store.json`.
- [ ] If FPR is $> 15\%$, severe violations are downgraded to `WARN`.
- [ ] Downgraded violations include the `[DEGRADED POLICY]` prefix.
- [ ] The CLI returns an exit code of `0` when there are no remaining active `BLOCK` violations.

---

## References

- [ADR-0002: Constitutional Runbook Verification](./ADR-0002-constitutional-runbook-verification.md)
- [ADR-0029: Global Archivum Sync & WAN Replication](./ADR-0029-global-archivum-sync-& WAN Replication.md)
