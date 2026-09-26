# ADR 001: Phase Mirror Agent Strategic Implementation Framework

## Status
Proposed

## Context
Phase Mirror is defined as a diagnostic governance oracle designed to detect structural contradictions between AI system permissions and actual infrastructure capabilities. Unlike traditional runtime firewalls, a Phase Mirror Agent operates at build-time and change-time, converting identified "dissonances" into actionable levers.

The agent is required to address structural gaps such as immutable anchors vs. versioned drifts, declarative governance vs. non-executable enforcement, and the need for spectral radius simulation tolerance.

## Decision
We will implement the Phase Mirror Agent based on a hierarchical validation system and a specific operational loop designed for high performance and governance precision.

### 1. Technical Architecture: The Oracle
The agent implements three distinct validation tiers:
- **L0 (Foundation Validation)**: Always-on, non-configurable checks for schema integrity, permission bits, nonce freshness, and drift magnitude. Target latency: ≤100 ns p99.
- **L1 (Policy Alignment)**: Rule evaluation (MD-001 through MD-005) for branch protection, circuit breakers, and pass/warn/block decisions. Target latency: ≤1 ms p99.
- **L2 (Deep Analysis)**: Semantic analysis and explicit audits for complex governance gaps. Target latency: ≤100 ms p99.

### 2. The Operational Loop (Mirror → Dissonance → Phase)
The agent follows a five-step process to move from raw input to governed action:
1. **Extract**: Identify goals, claims, constraints, stakeholders, and time horizons from the input.
2. **Map Tensions**: Analyze components for contradictions (e.g., Autonomy vs. Determinism or Compliance vs. Accuracy).
3. **Rank Tensions**: Prioritize issues using the formula: Impact × Tractability.
4. **Produce Output Blocks**:
   - **Dissonance Report**: A bulleted, non-emotive confrontation of core issues.
   - **Levers**: Actionable interventions formatted as [Owner] — Lever — Metric — Horizon.
   - **Optional Artifact**: A relevant quote, riddle, or checklist.
5. **Pose Precision Question**: A single, sharp question used only to resolve blocking ambiguities.

### 3. Core Rule Registry (MD-Series)
The agent's decision logic is governed by a versioned set of core rules:
- **MD-001**: Branch protection alignment.
- **MD-002**: Autonomy vs. compliance policy encoding.
- **MD-003**: Probabilistic output handling (Bayesian logic vs. Binary compliance).
- **MD-004**: Liability framework gaps (shifting from user to designer).
- **MD-005**: Configuration drift detection.

## Implementation Guidelines
- **Stance**: Synthetic, short, declarative, and non-emotive. Explicitly avoid "vibes," moralizing, or fluff.
- **Artifacts**:
  - **Spec**: Formal definitions of acceptable errors vs. policy violations.
  - **SLA**: Commitments to audit pass rates and explainability standards.
  - **Kill-Switch**: Triggers for rolling back agentic plans that depend on "hope" rather than deterministic mechanisms.

## Consequences
- Requires high-performance execution environments for L0/L1 checks.
- Formalizes governance into actionable "levers" rather than passive reports.
- Ensures all AI-generated work product adheres to a verifiable provenance chain.
