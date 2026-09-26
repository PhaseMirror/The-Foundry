Here is the Architecture Decision Record (ADR) converted from the provided defensive publication text, strictly following your required format:

```markdown
# ADR-037: Prime Range, Irreducibility Certificates, and Hardware Constants

**Status:** Proposed

## Context
The Gate U phase of the Multiplicity Theory roadmap transitions the PIRTM MLIR dialect from a software abstraction to a hardware specification. Currently, key hardware constants required for the Gate U⋆ spectral pipeline—such as the convergence threshold and pipeline depth—are undeclared at the ADR level. They appear as inconsistent "magic numbers" across `pirtm_core/hw_dispatch.py`, the MLIR TableGen definitions, and the HLS kernel, making drift undetectable during review. Furthermore, the single-block-diagonal ASIC routing optimization relies on an irreducibility assumption for the session weight matrix that currently lacks a formal certificate contract. A hardware-aware governance framework is needed to strictly enforce these constants and invariants at the silicon layer.

## Decision
We will declare five hardware constants as a normative single source of truth:
1. `HW_EPSILON` ($\varepsilon_{hw}$) = $2^{-20}$
2. `HW_CONTRACTION_CEILING` ($r_{hw}$) = 0.9
3. `HW_SPECTRAL_DEPTH` ($d_{hw}$) = 132
4. `HW_PRIME_MAX` ($P_{max}$) = $2^{31} - 1$
5. `HW_EIGENVALUE_GAP` ($\delta_{gap}$) = 0.01

All hardware-targeting code paths must derive these values via import; magic number overrides are strictly forbidden. 

Additionally, we will:
* Define the irreducibility certificate as a first-class artifact, requiring a rank check before applying ASIC-specific block-diagonal routing optimizations.
* Implement a three-verdict spectral pipeline emitting CONTRACTIVE, VIOLATION, or SPECTRAL_UNCERTAIN.
* Embed the hardware constants into the Tier 1/2 governance commitment hash ($C = H(\text{tier} \parallel t \parallel p_i \parallel \varepsilon_{hw} \parallel r_{hw} \parallel d_{hw})$) to cryptographically lock the configuration.

## Consequences
* The canonical spectral pipeline depth is fixed at 132 cycles, eliminating the erroneous 150-cycle estimate and establishing a precise latency budget (≈840 cycles).
* Any FPGA/ASIC bitstream compiled against stale or modified hardware constants will produce an invalid commitment hash, guaranteeing rejection by the driver before dispatch.
* The addition of the `SPECTRAL_UNCERTAIN` verdict routes edge-case matrices with degenerate eigenvalue gaps to software fallback, closing a critical false-CONTRACTIVE safety hole.
* The bounded prime index domain ($P_{max} = 2^{31}-1$) establishes a fixed hardware boundary for the on-die Prime Router's factorization lookup tables.
* A pre-computation cost of $O(n^2)$ is introduced at Tier 0 to execute the irreducibility rank check prior to Tier 2 ASIC crossbar routing.

## Traceability & Artifact Links
* **[Source Document]** `Multiplicity_Native_Hardware_Acceleration.pdf` — Original proposed document
```
