# ADR Population Guide for ZRSD, PWEH, \(\Lambda_m\), and Fidelity Decisions

## Overview
This guide turns the current ADR scaffold into an implementation-ready decision set. It focuses on five needs: how to populate the scaffold with \(\Lambda_m\) details, a worked ADR example for PWEH adoption, a pre-implementation review checklist, git version-control practices for ADRs, and template variations for quantum state fidelity decisions.[cite:170][cite:163][cite:105]

## 1. Next steps to populate the ADR scaffold with \(\Lambda_m\) details

### What \(\Lambda_m\) must mean in the codebase
The first population step is to stop treating \(\Lambda_m\) as a general philosophical placeholder and define it as a finite set of software-visible responsibilities. In the current architecture, the cleanest framing is that \(\Lambda_m\) acts as a bounded weighting and certification functional over operators, state transitions, and acceptance rules.[cite:128][cite:169]

Use four concrete ADR sub-decisions:

1. **Representation ADR** — define whether \(\Lambda_m\) is implemented as a scalar schedule, a diagonal weighting operator, a family of per-prime weights, or a composed certification functional.
2. **Norm ADR** — define which multiplicity norm is used in code: spectral norm, trace norm, Frobenius norm, or a custom weighted norm, and state why that norm is computationally and mathematically appropriate.[cite:125][cite:128]
3. **Certification ADR** — define what it means for a step to be “\(\Lambda_m\)-admissible,” such as bounded operator norm, bounded feedback gain, or monotone/non-destructive change in a fidelity or trace-distance diagnostic.[cite:128][cite:169]
4. **Logging ADR** — define exactly which \(\Lambda_m\)-derived quantities are written to the PWEH step record.

### Recommended fields to add to the scaffold now
Add a dedicated \(\Lambda_m\) section to each relevant ADR with these fields:

- **Formal definition**: precise equation or pseudocode for the current implementation.
- **Operational role**: weighting, certification, scheduling, or rejection gate.
- **Inputs**: primes, operators, state summaries, oracle residuals.
- **Outputs**: scalar weight, boolean certification, adjusted coefficient, logged metadata.
- **Bounds**: numerical constraints required for stability.
- **Failure behavior**: warn, reject step, clip value, or stop run.
- **Observability**: which metrics are exported for analysis.

### Immediate sequence
Populate the scaffold in this order:

| Step | ADR | Why first |
|---|---|---|
| 1 | ADR-0005 \(\Lambda_m\) certification contract | Gives all agents a shared meaning of admissibility. |
| 2 | ADR-0002 trajectory serialization | Ensures \(\Lambda_m\) values are captured in logs. |
| 3 | ADR-0003 oracle definition | Needed to specify how \(\Lambda_m\) interacts with feedback. |
| 4 | ADR-0004 benchmark protocol | Needed to compare \(\Lambda_m\)-gated vs ungated runs fairly. |
| 5 | ADR-0006 tunneling admission criteria | Needed only after the base contract is stable. |

This order keeps \(\Lambda_m\) from becoming an after-the-fact annotation. It becomes part of the runtime contract from the start.

## 2. Example ADR for adopting PWEH in the mining repo

Below is a compact Nygard/MADR-style example adapted to the current program.[cite:170][cite:163][cite:168]

# ADR-0002: Adopt Prime-Weighted Execution Hashing for Experiment and Mining Trajectories

## Status
Proposed

## Date
2026-05-08

## Context and problem statement
The project needs a tamper-evident way to record how a search trajectory was produced, not just whether a final candidate passed an oracle test. The simulation and mining research track produces time-ordered operator applications, oracle scores, and certification values that must be replayable and auditable across agents and benchmark runs.[cite:89][cite:87]

## Decision drivers
- Need deterministic replay of experiment logs.
- Need order-sensitive path attestation.
- Need compatibility with SHA-256-based workflows and post-quantum authenticity checkpoints.[cite:89][cite:87]
- Need room to log \(\Lambda_m\)-derived values without redefining the chain format later.

## Considered options
- Plain JSON logs with no chain.
- Standard append-only hash chain.
- Prime-Weighted Execution Hashing with canonical step schema and checkpoint signatures.

## Decision
Adopt Prime-Weighted Execution Hashing as the canonical trajectory attestation mechanism for all simulation and mining experiments. Each step record will be serialized canonically and hashed into an order-sensitive chain. Every fixed number of steps, the current chain head will be signed for authenticity.[cite:89][cite:87]

## Canonical step fields
- `run_id`
- `step_index`
- `time`
- `active_prime`
- `operator_id`
- `operator_norm_mult`
- `lambda_m_cert`
- `oracle_score`
- `state_digest`
- `metadata`

## Consequences
### Positive
- Makes trajectory tampering evident.[cite:89]
- Allows replay verification by independent agents.[cite:87]
- Keeps \(\Lambda_m\) and oracle diagnostics attached to the same evidentiary chain.

### Negative
- Increases logging and storage overhead.
- Forces early standardization of serialization.
- May outpace the maturity of the search algorithm itself.

### Follow-up decisions
- ADR-0003 oracle-score schema.
- ADR-0005 \(\Lambda_m\) certification contract.
- ADR-0008 signature algorithm selection.

## 3. Checklist for reviewing an ADR before agent implementation

Use this as the gate before an ADR becomes actionable for coding agents.

### Problem and scope
- [ ] The ADR describes one decision, not a bundle of unrelated choices.[cite:168]
- [ ] The problem statement is concrete and implementation-relevant.
- [ ] In-scope and out-of-scope boundaries are explicit.
- [ ] The owning component or repo path is named.

### Decision quality
- [ ] The chosen option is stated in one sentence near the top.[cite:170]
- [ ] At least two alternatives were considered.[cite:163]
- [ ] Trade-offs are explicit, including at least one downside.
- [ ] The ADR avoids untestable metaphysical language in the acceptance criteria.

### Technical precision
- [ ] Terms such as “fidelity,” “trace distance,” “oracle score,” and “certification” are defined consistently.[cite:105][cite:128]
- [ ] Equations or pseudocode map to actual modules or functions.
- [ ] Runtime inputs and outputs are named.
- [ ] Failure behavior is specified.
- [ ] Logging requirements are specified.

### Validation and evidence
- [ ] There is a test or benchmark plan attached.
- [ ] Success metrics are measurable.
- [ ] Evidence links to experiments, code, or cited rationale.
- [ ] Baseline comparison rules are included where performance is claimed.

### Agent handoff
- [ ] Work packages are small enough for separate agents.
- [ ] Dependencies between ADRs are listed.
- [ ] Review owner and next review date are present.
- [ ] “Done” criteria are included.

## 4. How to version control ADRs in a git repo

A common ADR practice is to store the records in the same git repository as the code they affect, often in `adr/`, `docs/adr/`, or `architecture/decisions/`, so the records evolve with the implementation.[cite:170][cite:155][cite:164] Teams also sometimes keep cross-cutting architectural ADRs in a shared documentation repository when a decision spans many services or repos.[cite:162]

### Recommended repo practice for this project
- Store local repo ADRs in `research/adr/` or `docs/adr/`.
- Use zero-padded numbering, such as `0001-zrsd-pweh-scaffold.md`.[cite:163][cite:170]
- Never rename an accepted ADR number; supersede it with a new ADR instead.[cite:168]
- Link code changes to ADR IDs in commit messages and pull requests.
- Keep one ADR per file.

### Suggested git workflow
```bash
mkdir -p docs/adr
cp output/adr-scaffold-zrsd-pweh.md docs/adr/0001-zrsd-pweh-scaffold.md

git add docs/adr/0001-zrsd-pweh-scaffold.md

git commit -m "adr: add 0001 ZRSD+PWEH modular scaffold"
```

For updates:
- Minor wording or citation fixes: amend the same ADR.
- Meaningful decision change while still proposed: update the ADR and note the revision in the file.
- Accepted decision later changed: create a new ADR, mark the older one as superseded, and cross-link both records.[cite:168][cite:162]

### Useful git conventions
- Commit prefix: `adr:`
- PR label: `architecture-decision`
- Branch naming: `adr/0005-lambdam-contract`, `adr/0008-signature-selection`
- Add an ADR index file that lists status, title, and supersession chain.

## 5. ADR template variations for quantum state fidelity decisions

Quantum fidelity decisions are slightly different from ordinary software ADRs because they often involve metric selection, convention mismatches, and trade-offs between fidelity and trace-distance diagnostics. Qiskit documents fidelity for density matrices as
\[
F(\rho_1, \rho_2) = \mathrm{Tr}\left[\sqrt{\sqrt{\rho_1}\rho_2\sqrt{\rho_1}}\right]^2,
\]
and fidelity is commonly paired with trace distance using the Fuchs–van de Graaf inequalities.[cite:105][cite:128]

The practical implication is that fidelity ADRs should explicitly record which convention and companion metric the project uses, because different toolkits and papers can use slightly different fidelity conventions or related measures.[cite:99][cite:105]

### Variation A — Metric selection ADR
Use when choosing between fidelity, trace distance, infidelity, or process-level measures.

**Extra sections to add:**
- Mathematical definition.
- Library convention notes.
- Computational cost.
- Why this metric is interpretable for the task.
- Acceptable thresholds.

### Variation B — Threshold ADR
Use when deciding a threshold such as “accept a state if fidelity exceeds \(\theta\).”

**Extra sections to add:**
- Threshold source.
- Calibration method.
- False-positive / false-negative consequences.
- Interaction with \(\Lambda_m\) certification.

### Variation C — Diagnostic bundle ADR
Use when fidelity is not enough alone and must be paired with trace distance, entropy, or diversity metrics.[cite:128][cite:169]

**Extra sections to add:**
- Primary metric.
- Secondary metrics.
- Tie-break rules.
- Reporting format.

### Example mini-template for fidelity ADRs
```md
# ADR-00XX: Use fidelity plus trace distance for state-alignment diagnostics

## Status
Proposed

## Context and problem statement
The project needs a stable way to measure whether simulated quantum states are moving toward the target state while remaining comparable across solver configurations.

## Decision
Use state fidelity as the primary alignment metric and trace distance as the secondary bounding metric.

## Definitions
- Fidelity: [insert exact definition used in code]
- Trace distance: [insert exact definition used in code]
- Bound used: Fuchs–van de Graaf inequalities

## Rationale
Fidelity is interpretable for target alignment, while trace distance provides complementary bounds and is often easier to estimate or reason about.

## Consequences
- Positive:
- Negative:
- Follow-up:
```

## Recommended immediate ADR population set
Populate these next, in order:

1. **ADR-0002** — PWEH adoption and canonical step schema.
2. **ADR-0005** — \(\Lambda_m\) certification contract and logged quantities.
3. **ADR-0003** — Oracle score definition and feedback residual.
4. **ADR-0004** — Benchmark fairness and baseline budget rules.
5. **ADR-0009** — Fidelity and trace-distance metric conventions.[cite:105][cite:128]

That sequence gives the coding agents a stable contract for logging, gating, scoring, and measuring before they touch advanced levers such as tunneling or Grover-style control.[cite:106][cite:149]
