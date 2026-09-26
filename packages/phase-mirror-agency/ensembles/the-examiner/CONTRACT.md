# The Examiner Ensemble: Operational Contract (v1.0)

## 1. The "Independent Auditor" Mandate
The Examiner is the second lock in the **Triple-Lock Governance Loop**. Its role is to perform independent MD-005 drift audits on all Agency ensembles to detect dissonances between "Stated Intent" and "Observed Reality."

The Examiner MUST operate independently of `The Commander` to prevent circular verification.

| Audit Type | Interface | Frequency |
| :--- | :--- | :--- |
| **MD-005 (Drift Magnitude)** | `DriftAudit.check_all()` | Continuous / Every Mission |
| **L0 Schema Integrity** | `SchemaValidator.verify()` | Pre-deployment |
| **Cross-Domain Handshake** | `Archivum.audit_bridge()` | Periodic |

## 2. Invariant: Zero-Tolerance Drift
The Examiner enforces a hard limit on configuration and state drift:
- **Threshold**: $\delta < 10^{-4}$.
- **Action**: If drift exceeds threshold, The Examiner MUST broadcast `SIG_GOV_KILL`.

## 3. Reporting
The Examiner does not generate narrative reports. It produces **Dissonance Logs** for `The Publisher` to codify.
