# ADR-0124: Sedona Spine: Records, Kiln, Private Proof

**Status:** Proposed

## Context
UOR Foundry is R&D civic infrastructure where everyone is a Founder of their own uniqueness on the platform. However, decentralized hold rules drift if computed independently by UI or client agents. Without a centralized "spine," every UI invents its own litigation-hold math and agents paint their own risk color. There is a need to establish a computational machinery on a separate plane from the civic L0 to handle ESI (Electronically Stored Information) and stability rules, ensuring records do not vanish, unstable transitions do not fire, and users can privately prove they followed the rules.

Currently, the `Foundry/CONTRACT.md` recites a "Wyoming DUNA / Autonomous DAO Membrane" and "zero residual human discretion," but the civic stack binds W.S. 17-22 and W.S. 17-32, not W.S. 17-31 DAO LLC. Members still vote on land, and humans ratify WardMonitor states into policy. Engine-generated ESI risk is not a substitute for a member assembly. Furthermore, the hold engine evaluates stability in IEEE-754 (Float) which is an internal kiln defect since float drift is a spoliation risk.

## Decision
We establish the **Sedona Spine** as the ultimate legal record-keeper, kiln, and certifier, implemented as a Rust engine and WASM SDK.
* All ESI preservation-risk logic must route through the Sedona Spine Rust engine. The path of integrity is: `Engine → CompilationResult → UnifiedWitness → ledger anchor → UI`.
* Agents and UI pages MUST NOT independently calculate preservation risk levels or retention durations. The Sedona engine emits a `CompilationResult` with a `RiskLevel` of Critical, High, or Medium. Unstable state is Critical.
* The Sedona Spine operates on a separate computational plane from the civic L0. It does not replace a member vote, practice law, or act as a DAO LLC under W.S. 17-31.
* The "kiln" enforces safety before a state fires: before the Foundry accepts a state transition claiming stability, the proposal must show the contraction bound ($c < 1$ and $||G||_1 < 1.0$). If it cannot, the kiln refuses the firing.
* Profiles must not mix planes (e.g., encoding civic L0 as a spectral-norm inequality or contraction as a membership bylaw).
* Replace `Float` in `SedonaRiskModel` inputs with the ADR-001 fixed-point scale N = 1024 to eliminate float drift.
* External organizations can generate data locally and use the `mtpi-certifier` protocol to prove they did not expand past non-expansion invariants without shipping the underlying proprietary corpus.
* Correct the `CONTRACT.md` statute citation to W.S. 17-22 / 17-32, retiring the W.S. 17-31 DAO LLC reference.

## Consequences
* **Zero Client-Side Risk Calculation:** The engine path must be published on the Foundry view. UI pages computing local risk levels are treated as defects and must be removed within 21 days.
* **Float Eradication from Kernel:** `Float` in `SedonaRiskModel` inputs will be replaced with the ADR-001 fixed-point scale, or the module quarantined as Experimental within 30 days.
* **Contract Correction:** The wrong chapter (W.S. 17-31) and the phrase "zero residual human discretion" will be retired from the public contract text in `CONTRACT.md` within 14 days.
* **Profile Adherence:** PrismPM profiles that mix civic L0 with $||G||_1$ will fail acceptance.
* **Clear Record Custody:** A split register will exist mapping which ESI belongs to the association (UNA) and which to the operator shop within 21 days.

## Traceability & Artifact Links
* **Source Document** `Sedona_Spine_Records_Kiln_Private_Proof_v1.0.docx` — Original proposed document
