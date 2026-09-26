# ADR-0005: Adopt Prime-Factor Graph Topology for Nearest-Neighbor Tunneling

## Status
Proposed (Phase Mirror Generated)

## Context
Phase 3 of the Implementation Plan claims `NearestNeighborBias (Metric-aware exploration)` is complete. However, the Phase Mirror audit reveals that the current `TunnelingDriver.get_nearest_neighbor_tunneling` simply couples adjacent 1D integer indices ($i \leftrightarrow i+1$). In a Prime-Indexed Fock space, integer adjacency has no physical or semantic meaning (e.g., states representing prime occupations $|2^1 3^0\rangle$ and $|2^0 3^1\rangle$ are not necessarily adjacent integers, yet are topologically adjacent via Hamming distance).

## Phase Mirror Governance

- **Hidden Assumptions**: We assumed a 1D scalar index mapping preserves the underlying geometric structure of the multi-prime Fock space. It does not.
- **Contradictions / Tensions**: **Topology Mismatch**. We claim "semantic dynamics" and metric-aware exploration, but our solver diffuses amplitude along an arbitrary scalar index, ignoring the multi-dimensional prime factorization structure entirely.
- **Lever Introduced**: **Prime-Factor Graph Tunneling**. We will replace the naive 1D coupling with a proper Hamming-distance based generator (e.g., `get_prime_coupled_tunneling`). Adjacency will be strictly defined by single-prime creation/annihilation paths.
- **Validation Metric**: The benchmark suite must show that diffusion using the Hamming-distance adjacency graph locates high-score nonces faster (fewer trials to first hit) than the naive 1D $i \leftrightarrow i+1$ coupling mode.

## Decision
1. Deprecate and remove `get_nearest_neighbor_tunneling` in `TunnelingDriver`.
2. Implement a true `NearestNeighborBias` matrix generator that respects the prime occupation vectors.
3. Update `run_bitcoin_simulation` to use this new semantic geometry for the tunneling term $H_{tunnel}$.
