<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# ADR Scaffold: ZRSD + PWEH Research-to-Engineering Track

## Document status

- Status: Draft scaffold
- Date: 2026-05-08
- Decision owners: Primatician research lead, coding agents, verification lead
- Scope: ZRSD, PWEH, $\Lambda_m$, oracle feedback, tunneling, nearest-neighbor geometry, Grover-style control

## Phase Mirror Governance (Mandatory for each Slice)
- **Hidden Assumptions**: [What are we taking for granted that isn't yet in the code?]
- **Contradictions / Tensions**: [Name the core system conflicts this decision creates or resolves.]
- **Lever Introduced**: [Specific mechanism, operator, or parameter added.]
- **Validation Metric**: [How we empirically measure success in the PWEH log or benchmark.]

## ADR purpose

This ADR scaffold captures the minimum structure needed to coordinate coding agents while research continues. It separates what is already implementable from what remains conjectural, so engineering can proceed without overcommitting to unvalidated claims.

## Context

The current research program treats nonce search as a prime-indexed dynamical process on a truncated Hilbert space, implemented with QuTiP-style Lindblad evolution and potentially augmented by tunneling drivers, nearest-neighbor geometry, and Grover-style marking. Earlier benchmark discussion established that bare ZRSD without oracle feedback did not show an advantage in the toy regime, which makes the oracle-coupling term, baseline comparisons, and trajectory attestation the essential near-term engineering focus.[^1][^2][^3][^4]

The cryptographic side is better grounded: SHA-256 is standardized, QuTiP supports deterministic and stochastic open-system evolution, and post-quantum authenticity can be layered through modern signature standards rather than by invoking an unspecified “PQC hash.” This makes a PWEH-style execution log and verification pipeline a practical first implementation target.[^2][^5][^6]

## Core decision

Build the system as a modular research platform with four separable layers:

1. **Dynamics layer** — ZRSD state evolution, including optional tunneling driver terms.[^7][^1]
2. **Oracle layer** — real scoring and feedback, initially classical SHA-256-based metrics.[^5]
3. **Attestation layer** — PWEH-style canonical trajectory hashing and checkpoint signing.[^6][^5]
4. **Evaluation layer** — reproducible benchmarks against strong baselines, with fidelity and trial-count metrics.[^4][^8]

This modularization keeps the null-result risk localized: if search advantage fails to appear, the attestation and verification layers still remain valuable deliverables.[^4][^5]

## Decision drivers

- Need a clean handoff to coding agents.
- Need to isolate validated components from speculative ones.
- Need experiment logs that are replayable and auditable.
- Need a fair path to test tunneling, nearest-neighbor bias, and Grover-style marking independently before combining them.[^3][^9][^10]
- Need compatibility with current QuTiP patterns for time-dependent Hamiltonians and stochastic trajectories.[^11][^12][^2]

## In scope

- QuTiP simulation harness for $N=3$, $N=4$, and $N=8$ prime registers.[^1][^11]
- Canonical encoding of trajectory steps for PWEH.
- SHA-256 or double-SHA256 toy and real threshold oracles.[^5]
- Oracle-feedback term $\Xi_{\text{oracle}}(t)$.
- Optional tunneling driver implemented as valid off-diagonal couplings, preferably benchmarked first against a standard transverse-field baseline.[^9][^7]
- Optional nearest-neighbor graph over occupation strings using Hamming distance and fidelity diagnostics.[^8][^10]
- Optional Grover-style discrete control step only if implemented as a realizable oracle-plus-diffusion pair.[^13][^3]

## Out of scope for first coding wave

- Claims of production Bitcoin mining advantage.
- Claims of asymptotic speedup over black-box search.
- Hardware ASIC or photonic implementation.
- Consensus-layer Bitcoin protocol changes.
- Metaphysical or ontological claims as engineering acceptance criteria.

## Architectural slices

### Slice A — Simulation core

**Goal:** Create a stable, testable open-system simulation environment.

**Components:**

- Prime register builder.
- Base multiplicity operator $M$.
- ZRSD Hamiltonian $H_\zeta$.
- Collapse operators $L_k$.
- Time-dependent Hamiltonian support via QuTiP-approved interfaces.[^12][^11]

**Acceptance checks:**

- Runs deterministically with fixed seeds where applicable.
- Produces trajectories and density-matrix outputs.
- Computes expectation values and fidelity curves after solve completion.[^8][^11]

### Slice B — Oracle and control

**Goal:** Connect state evolution to an external success criterion.

**Components:**

- State-to-candidate decoder.
- Double-SHA256 oracle interface.[^5]
- Residual/closeness metric for $\Xi_{\text{oracle}}(t)$.
- Optional discrete marking layer for Grover-style experiments.[^14][^3]

**Acceptance checks:**

- Oracle calls are counted explicitly.
- Feedback term is bounded and logged.
- Baseline samplers can use the same oracle budget.

### Slice C — Attestation

**Goal:** Make every trajectory replayable and tamper-evident.

**Canonical step schema:**

- `run_id`
- `step_index`
- `time`
- `active_prime`
- `operator_id`
- `operator_norm_mult`
- `state_digest` or measurement digest
- `oracle_score`
- `metadata` (seed, difficulty target, experiment tag)

**Hash chain:**

$$
S_t = H\bigl(S_{t-1} \parallel t \parallel p_i \parallel \mathrm{id}(A_t) \parallel \|A_t\|_{\mathrm{mult}} \parallel M_t\bigr)
$$

with a standard cryptographic hash and periodic signatures for authenticity.[^6][^5]

**Acceptance checks:**

- Replay of a saved log reproduces the same hash chain.
- Any mutation to step order or metadata changes the final digest.
- Checkpoint signatures verify correctly.[^15][^6]

### Slice D — Benchmarking

**Goal:** Decide whether any lever adds real search value.

**Baseline arms:**

- Uniform random sampler.
- Dephasing-only dynamics.[^1]
- ZRSD base dynamics.[^1]
- ZRSD + tunneling.[^7]
- ZRSD + oracle feedback.
- Strong classical heuristic such as simulated annealing or beam/local search.

**Metrics:**

- Mean trials to first hit.
- Distribution of trials to first hit.
- Success rate within budget.
