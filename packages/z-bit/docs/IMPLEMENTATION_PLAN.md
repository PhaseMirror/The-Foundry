# Bitcoin ZRSD + PWEH Implementation Plan

This document outlines the phased implementation of the Prime-Weighted Execution Hashing (PWEH) and Zeta-Recursive Semantic Dynamics (ZRSD) for Bitcoin mining research.

## Phase 0: Scaffold (COMPLETE)
- [x] Create ADR-0002: PWEH Schema.
- [x] Define `pweh_step.schema.json`.

## Phase 1: Attestation Pipeline (COMPLETE)
**Goal**: Build the tamper-evident logging infrastructure.
- [x] Implement `PWEHLogger` in Python (compatible with `zrsd` package).
- [x] Implement `CanonicalSerializer` (JSON-based, deterministic).
- [x] Implement `HashChain` (SHA-256 recursive update).
- [x] Add `Verifier` to replay and validate logs.

## Phase 2: Oracle & Feedback (COMPLETE)
**Goal**: Connect simulation to SHA-256 metrics.
- [x] Implement `Sha256Oracle` (Double-SHA256 scoring).
- [x] Implement `NonceDecoder` (State-to-candidate mapping).
- [x] Define `Xi_oracle` (Feedback residual operator).

## Phase 3: Dynamics & Resonance (COMPLETE)
**Goal**: Enhance ZRSD solver with Bitcoin-specific terms.
- [x] Integrate `Xi_oracle` into `zrsd` solver loop.
- [x] Implement `TunnelingDriver` (Off-diagonal prime couplings).
- [x] Implement `NearestNeighborBias` (Metric-aware exploration).
- [x] Optional: Grover-style discrete marking step.

## Phase 4: Benchmarking (COMPLETE)
**Goal**: Empirically validate the resonance advantage.
- [x] Implement Baseline samplers (Uniform, Dephasing-only).
- [x] Execute multi-seed comparison on prime-indexed registers.
- [x] Generate `benchmark_results.csv` with performance metrics.

## Component Map
- `agi-os/bitcoin/docs/`: ADRs and specifications.
- `agi-os/bitcoin/schemas/`: JSON schemas for attestation.
- `agi-os/packages/zrsd/src/zrsd/resonance/`: Core dynamics extension.
- `agi-os/bitcoin/scripts/`: Runners and validation scripts.
