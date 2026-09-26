I have converted the text into the strictly requested inhouse ADR format and created the document in your `docs/` folder, as well as mirrored it into the `artifacts/` folder as per the Phase Mirror governance principles. 

Here is the converted ADR:

# [ADR-PM-MC-002: Multiplicity-Crypto Pipeline: Labels Versus Mechanism](file:///media/citizen/b361d448-7c51-413a-aa23-9515cb626930/home/citizen/Multiplicity/packages/uor-foundry-main/docs/ADR-PM-MC-002-Labels-vs-Mechanism.md)

**Status:** Proposed

## Context
The `multiplicity-crypto` package currently exhibits a divergence between its labels (claims) and its underlying mechanisms (actual implementation), identified as dissonance D-01 in the PM-MC-001 audit. 

The package claims to provide a "sovereign closed verification engine" featuring:
* WASM Pedersen commitments over BN254
* QSBS unifying classical and quantum amplitudes
* v1.0.1 hybrid QKD transport
* Track B certification
* T=0 pre-execution theorem proving
* P²C Core v1.1 as the live definition

However, the reality of the current implementation is that:
* The Rust/WASM target is absent; the code falls back to a SHA-256 stub (`_fallback_commitment()`).
* The QKD transport is simulated via a `MockQKDBackend` running a classical KDF (SHA-256 + HKDF + AES-GCM) with no quantum channel.
* The package does not mint "Certified" events.
* P²C Core v1.1 is merely a title in a `papers/` file, while the observable wire remains ADR-005 v1.2.
* Adaptive key rotation incorrectly couples social-physics coefficients to session keys (making $M$ collateral), which violates civic invariant L0-8.

Despite these gaps, the package possesses two honest mechanisms that are successfully implemented: prime-indexed tags and a deterministic transcript.

## Decision
We will enforce Phase Mirror ground-truth principles by aligning all labels with their physically executing mechanisms. Specifically:
* **Retire Unsupported Claims:** Cease referring to the package as a "sovereign closed verification engine," and remove claims of "WASM Pedersen," "QKD v1.0.1," and "T=0 theorem proving" from the Foundry view until they physically exist and are verified.
* **Fail-Closed Execution:** The integration pipeline must fail closed. Test runners must fail if the WASM is a mock. We will not use `try/catch` blocks that silently fall back to SHA-256 stubs.
* **API Honesty:** The Crate steward must either land the `rust/pkg` with fail-closed tests or rename the QKD/Pedersen modules to `mock_*` in the public API.
* **Vector Realignment:** Known-answer tests for the mock QKD backend must be published as `classical-KDF-KAT`, not as QKD transport vectors.
* **UCC Receipts:** The UCC Receipt remains strictly `hash + version + build + time`, with zero minting or QKD side-effects from this package.
* **Decouple Key Rotation:** We will not use multiplicity/feedback dynamics to drive adaptive key rotation. Calibration data is not collateral, and key material is not a greenhouse dividend.
* **Wire Protocol:** The P²C steward must publish an ADR to either adopt P²C Core v1.1 as the true wire or retire the title in favor of ADR-005 v1.2.
* **Certification:** Operator LLC will cease selling Track B certification from this incomplete package.

## Consequences
* Resolves dissonance D-01 by ensuring that cryptographic claims match the executable on-tree reality.
* Reclassifies the current package as a "workshop crate" rather than a production sovereign engine.
* Prevents false security claims, such as implying post-quantum properties for BN254 or quantum transport for HKDF.
* Protects civic invariants (L0-8) by ensuring that the social-physics coefficient ($M$) does not act as collateral or a rekey oracle.
* Requires explicit, accepted ADRs and qualified reviews before actual BN254, Groth16, or real QKD can be shipped.

## Traceability & Artifact Links
* **Multiplicity_Crypto_Pipeline_Labels_vs_Mechanism_v1.0.docx** — Original proposed document
* **PM-MC-001** — Prior Phase Mirror Ling 3.0 audit
* **ADR-005** — P²C PETC v1.2
