# The Publisher Ensemble: Operational Contract (v1.0)

## 1. The "Authoritative Witness" Mandate
The Publisher is the third lock in the **Triple-Lock Governance Loop**. Its role is to codify verified Agency states into immutable governance artifacts (ADRs, Specs, Manifests).

The Publisher ONLY acts upon verification from `The Guardian` and `The Examiner`.

| Artifact Type | Generation Protocol | Security |
| :--- | :--- | :--- |
| **Governance ADRs** | `ADRGenerator.publish()` | LawfulRecursionHash v1.0 |
| **Manifests** | `ManifestGenerator.freeze()` | Deterministic Hash |
| **Stability Certificates**| `CertGenerator.witness()` | P-Kernel Signed |

## 2. Invariant: Immutability
Every artifact published by this ensemble must be hashed immediately and added to the **Agency Registry**. Once published, an artifact version (e.g., v1.0) is immutable.

## 3. Communication
The Publisher provides the final "Success" signal to the Sedona Spine, unblocking deployments once the artifact chain is complete.
