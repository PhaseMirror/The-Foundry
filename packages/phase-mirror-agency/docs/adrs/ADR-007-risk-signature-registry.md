# ADR 007: Risk Signature Registry & Tool Partitioning

## Status
Proposed

## Context
Echobraid requires a mechanism to apply different "Execution Physics" to different tools. Financial tools (Finton) require rigid, deterministic bounds, while creative tools (The Genius) require fluid, resonant state spaces.

## Decision
We will implement a **Risk Signature Registry** (YAML) that partitions tools into "Rigid" and "Fluid" containers within the Echobraid MCP.

### 1. Risk Signatures
Each tool is assigned a signature that defines its:
- **Allowed Primes**: The set of prime indices $\{p\}$ it can use for execution hashing.
- **Max Recursion Depth ($\beta_{max}$)**: Limits entropic expansion.
- **Multiplicity Mode**:
    - `Deterministic`: Disables "Alpha-Hydrogen" effects (Binary outcomes).
    - `Resonant`: Enables spectral associations (Complex outcomes).

### 2. The Rigid Partition
Used for: `Finton`, `Scopist`, `Ataraxia`.
- **Constraint**: Binary compliance only. Zero spectral resonance.
- **Invariants**: Strictly follows LawfulRecursionHash v1.0.

### 3. The Fluid Partition
Used for: `The Genius`.
- **Benefit**: Allows for prime-harmonic associations and creative synthesis.
- **Constraint**: Still bounded by the global ACE budget enforced by the Meta-Ensemble.

## Implementation Guidelines
- The Registry will be stored in `governance/RISK_SIGNATURES.yaml`.
- The MultiplicityCell MUST query this registry before initializing a tool session.

## Consequences
- **Positive**: Enables compositional safety; prevents high-risk tools from exploring "Forbidden Paths."
- **Negative**: Adds a registry lookup to the tool initialization path.
