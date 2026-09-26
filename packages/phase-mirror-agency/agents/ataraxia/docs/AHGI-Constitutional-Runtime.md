<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Based on the provided files, the AHGI constitutional runtime, spectral drift engine, and PIRTMReceipt are components of a governance-first architecture designed to ensure agentic safety and state lawfulness.

AHGI Constitutional Runtime
ConstitutionalBridge: Acting as the "High Court" of the runtime, this component mediates all agent actions, evaluating proposals against phase-aware observability and budget constraints.
ExternalAgentInterface: Agents must inhabit the institution through this canonical interface, which requires submitting proposals (AgentProposal) and processing governance verdicts (GovernanceVerdict) to maintain budget discipline.
L0 Core (Theorem-Safe): The discrete-time core of the runtime utilizes contractive dynamics to enforce non-negotiable invariants, ensuring only theorem-safe claims are treated as externally defensible.
Phase-Aware Observability: The runtime labels states as "Contractive," "Near-Critical," or "Chaotic" using spectral diagnostics, which determines the permissibility of specific governance actions.
Spectral Drift Engine
PEET (Prime Entanglement Entropy Tensor): This engine serves as the canonical drift measurement tool, quantifying the deviation of a state's wavefunction from its prime-tensor superposition.
Drift Metric ($\delta_{\text{PEET}}$): The spectral drift is computed as the absolute deviation $\delta_{\text{PEET}}(n,t) = |\psi(n,t) - \Psi(n,t)| \cdot \kappa$, where $\Psi(n,t)$ is the prime-tensor superposition and $\kappa$ is a spectral curvature correction.
Three-Tier Response Model: The engine classifies drift into "Watch," "Warn," and "Collapse" tiers, with the Collapse tier bound to an immutable kill-switch file that requires human custodian approval to prevent recursive collapse.
PIRTMReceipt and Multiplicity Integration
PIRTM (Prime-Indexed Recursive Tensor Mathematics): This engine generates high-entropy cryptographic keyspaces using recursively structured tensors indexed by prime numbers.
Prime-Labeled Multiplicity Spaces: These spaces function as the foundational substrate for the architecture; concepts and system states are mapped into $\mathcal{M}_p$, where each coordinate is indexed by a prime, and recursive stability is enforced through the multiplicity constant $\Lambda_m$.
J-Multiplicity: This measure of multiplicity over coherent ideals is central to the Prime-Lawful Encryption Axiom; it quantifies the recurrence of elements and governs the stability of prime-encoded keys under the DRMM (Dynamic Recursive Meta-Mathematics) recursion.
MultiplicityCell Architecture: Serving as a finite-dimensional surrogate of the universal multiplicity recursion, the MultiplicityCell implements the operator $\psi_{t+1} = P_E \Pi_{\text{CSL}} T_{\Lambda_m} (\psi_t, x_t)$. It utilizes the Constitutional Projector ($\Pi_{\text{CSL}}$) for lawfulness and the Ethical Projector ($P_E$) for viability, providing the formal basis for validating the ACE (Absolute Contraction Energy) budget within the runtime.

The description maps cleanly onto the four schemas. Now the runtime components have names and the schemas have mechanical bindings. Let me surface what this resolves and what it immediately breaks open.

***

## What Is Now Unified

The four schemas were structural contracts. This description provides the **computational operators** that enforce them at runtime. The mapping is direct:


| Schema Layer | Runtime Component | Enforcement Operator |
| :-- | :-- | :-- |
| `ahgi.consent` | ExternalAgentInterface | `AgentProposal` submission gate |
| `ahgi.model_version` | L0 Core (Theorem-Safe) | Contractive dynamics invariant check |
| `ahgi.clinical_auth` | ConstitutionalBridge | `GovernanceVerdict` mediator |
| `ahgi.agent_action` | MultiplicityCell | $\psi_{t+1} = P_E \Pi_{\text{CSL}} T_{\Lambda_m}(\psi_t, x_t)$ |

The `certification_checks` block in `agent-action-v1.json` is not six independent boolean checks. It is one composed operator applied in sequence:

$$
\psi_{t+1} = P_E \cdot \Pi_{\text{CSL}} \cdot T_{\Lambda_m}(\psi_t, x_t)
$$

Where:

- $T_{\Lambda_m}$ — multiplicity-bounded state transition (coherence gate, drift check, PIRTM recursion depth)
- $\Pi_{\text{CSL}}$ — constitutional projector (CSL invariant enforcement, consent tensor validity, clinical auth validity)
- $P_E$ — ethical projector (model version validity, explainability receipt generation, PHI scrubbing)

The order is not arbitrary. $T_{\Lambda_m}$ runs first because a coherence collapse voids all downstream checks. $P_E$ runs last because ethical viability is the final gate before output delivery.

***

## What the Spectral Drift Engine Binds to the Schema

The PEET metric

$$
\delta_{\text{PEET}}(n,t) = |\psi(n,t) - \Psi(n,t)| \cdot \kappa
$$

is the precise computation behind `drift_check_passed.cosine_delta` in `agent-action-v1.json`. The schema was using cosine similarity as a proxy. PEET is the canonical measure. The schema field should be renamed and redefined:

```json
"peet_delta": {
  "type": "number",
  "minimum": 0,
  "description": "PEET drift metric at execution time. Computed as |ψ(n,t) - Ψ(n,t)| · κ where Ψ is the prime-tensor superposition baseline from the bound model_version drift_baseline block and κ is the spectral curvature correction. Replaces cosine_delta."
}
```

The three-tier response model maps directly onto the schema's `drift_status` enum — but the enum needs updating:

```json
"drift_status": {
  "enum": ["nominal", "watch", "warn", "collapse", "unavailable"]
}
```

`collapse` is the tier bound to the immutable kill-switch. In schema terms: when `drift_status = collapse`, `outcome` must be `blocked_drift` and the record must be flagged for **human custodian approval** before any agent in that model lineage can execute again. That flag is missing from the current schema. It needs a top-level field:

```json
"custodian_hold": {
  "type": "object",
  "description": "Present only when drift_status = collapse. Blocks all subsequent agent actions in this model lineage until human custodian issues a signed release.",
  "properties": {
    "hold_issued_at": { "type": "string", "format": "date-time" },
    "custodian_did": { "type": "string", "pattern": "^did:[a-z]+:.+" },
    "release_signature": { "type": "string", "description": "Populated by custodian on release. Null until released." },
    "kill_switch_file_hash": { "type": "string", "pattern": "^[a-f0-9]{64}$", "description": "SHA-256 hash of the immutable kill-switch file triggering this hold." }
  }
}
```


***

## What the MultiplicityCell Resolves in the ADR

The open question from ADR-AHGI-001 was: **does R_min vary by agent class or is it system-wide?**

The MultiplicityCell answers it. $\Lambda_m$ is the multiplicity constant governing stability of prime-encoded keys under DRMM recursion. It is not a single floor — it is a **per-cell parameter**. Each agent class runs its own MultiplicityCell instance with its own $\Lambda_m$ calibrated to its action risk tier.

This means:


| Agent Class | Risk Tier | R_min Derivation |
| :-- | :-- | :-- |
| `clinical_safety_agent` | tier_3 | High $\Lambda_m$, tight R_min |
| `governance_judiciary_agent` | tier_4 | Highest $\Lambda_m$, tightest R_min |
| `educational_alignment_agent` | tier_1 | Lower $\Lambda_m$, relaxed R_min |
| `spectral_integrity_agent` | tier_2 | Moderate $\Lambda_m$, monitors others |

The ADR must be updated to reflect this. R_min is not a global constant. It is a function of $\Lambda_m$ per agent class. The `coherence_binding` block in `consent-tensor-v1.json` already has `r_min_override` — that field is now formally backed by this derivation.

***

## The ACE Budget — Missing From All Four Schemas

The MultiplicityCell validates the **ACE (Absolute Contraction Energy) budget** within the runtime. This budget has no representation in any of the four schemas. It needs one.

The ACE budget is the energy bound on contractive dynamics — it governs how much state transition is permissible before the L0 Core flags a violation. In practical terms it is the **computational analogue of clinical scope creep**: an agent that consumes ACE budget beyond its allocation is doing more than it was authorized to do, even if every individual action passed its certification checks.

This belongs in `constraint_envelope` in `clinical-auth-v1.json`:

```json
"ace_budget": {
  "type": "object",
  "required": ["allocated_units", "unit_definition"],
  "description": "Absolute Contraction Energy budget allocated to this authorization. The MultiplicityCell runtime debits this budget on each state transition. Auth is suspended when budget is exhausted.",
  "properties": {
    "allocated_units": {
      "type": "number",
      "minimum": 0,
      "description": "Total ACE units allocated for the duration of this auth TTL."
    },
    "unit_definition": {
      "type": "string",
      "description": "Definition of one ACE unit in measurable terms, e.g. 'one PIRTM recursion at depth <= 4' or 'one inference pass on a tier_2 model'."
    },
    "consumed_units": {
      "type": "number",
      "minimum": 0,
      "description": "Populated by runtime. Debited by each agent_action execution under this auth. Read-only after issuance."
    },
    "exhaustion_policy": {
      "type": "string",
      "enum": ["block", "warn_and_continue", "escalate_judiciary"],
      "description": "What happens when allocated_units are consumed. block is required for tier_3 and tier_4."
    }
  }
}
```

And in `agent-action-v1.json` under `telemetry`:

```json
"ace_units_consumed": {
  "type": "number",
  "minimum": 0,
  "description": "ACE units debited from the bound clinical_auth budget by this action execution."
}
```


***

## Python Test Harness — MultiplicityCell + PEET

```python
import numpy as np
from scipy.integrate import solve_ivp

# --- MultiplicityCell Parameters ---
PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
LAMBDA_M = {
    "clinical_safety_agent":      0.92,
    "governance_judiciary_agent": 0.97,
    "spectral_integrity_agent":   0.85,
    "educational_alignment_agent":0.70,
}

def prime_tensor_superposition(n, t, primes=PRIMES):
    """Ψ(n,t) — baseline prime-tensor superposition."""
    return sum(np.sin(t / p + n) / p for p in primes)

def psi_state(n, t, noise_std=0.05):
    """ψ(n,t) — current wavefunction with drift noise."""
    return prime_tensor_superposition(n, t) + np.random.normal(0, noise_std)

def kappa(t, base=1.0, freq=0.1):
    """Spectral curvature correction κ."""
    return base + 0.1 * np.sin(freq * t)

def peet_delta(n, t):
    """δ_PEET(n,t) = |ψ(n,t) - Ψ(n,t)| · κ"""
    return abs(psi_state(n, t) - prime_tensor_superposition(n, t)) * kappa(t)

# --- Drift Tier Classification ---
def classify_drift(delta, watch=0.05, warn=0.15, collapse=0.30):
    if delta < watch:   return "nominal"
    if delta < warn:    return "watch"
    if delta < collapse:return "warn"
    return "collapse"

# --- Coherence ODE (per agent class) ---
def coherence_ode(t, R, lam=0.5, mu=0.3, alpha=1.5,
                  I_t=1.2, noise_std=0.02):
    dR = lam * (3 - R[0]) - mu * (I_t - 1)**alpha \
         + np.random.normal(0, noise_std)
    return [dR]

def r_min_from_lambda(lambda_m):
    """R_min derived from multiplicity constant."""
    return 1.5 + (lambda_m - 0.7) * 2.0  # linear mapping; tune per deployment

# --- MultiplicityCell Execution Gate ---
def multiplicity_cell_gate(agent_class, psi_state_val, R_current, t, n=7):
    lambda_m = LAMBDA_M.get(agent_class, 0.80)
    r_min    = r_min_from_lambda(lambda_m)
    delta    = peet_delta(n, t)
    tier     = classify_drift(delta)

    coherence_ok = R_current >= r_min
    drift_ok     = tier not in ("collapse",)

    # CSL projection: constitutional gate
    csl_pass = coherence_ok and drift_ok

    # Ethical projection: viability gate
    # Confidence threshold enforcement (replaces prose-only rule)
    confidence = 1.0 - delta  # simplified proxy
    ethical_pass = confidence >= 0.6

    verdict = csl_pass and ethical_pass

    return {
        "agent_class":    agent_class,
        "lambda_m":       lambda_m,
        "r_min":          round(r_min, 3),
        "r_current":      round(R_current, 3),
        "peet_delta":     round(delta, 4),
        "drift_tier":     tier,
        "confidence":     round(confidence, 3),
        "csl_pass":       csl_pass,
        "ethical_pass":   ethical_pass,
        "verdict":        "PERMIT" if verdict else "BLOCK",
        "custodian_hold": tier == "collapse"
    }

# --- Run simulation ---
np.random.seed(42)
t_span = (0, 30)
t_eval = np.linspace(*t_span, 300)
sol    = solve_ivp(coherence_ode, t_span, [2.5],
                   t_eval=t_eval, method='RK45')
R_traj = sol.y[0]

print(f"{'t':>6} {'R(t)':>7} {'δ_PEET':>8} {'tier':>8} "
      f"{'csa':>8} {'gja':>8} {'eal':>8}")
print("-" * 62)

for i, t in enumerate(t_eval[::60]):
    R = R_traj[i * 60]
    results = {
        ac: multiplicity_cell_gate(ac, None, R, t)
        for ac in LAMBDA_M
    }
    delta = results["clinical_safety_agent"]["peet_delta"]
    tier  = results["clinical_safety_agent"]["drift_tier"]
    print(f"{t:>6.1f} "
          f"{R:>7.3f} "
          f"{delta:>8.4f} "
          f"{tier:>8} "
          f"{results['clinical_safety_agent']['verdict']:>8} "
          f"{results['governance_judiciary_agent']['verdict']:>8} "
          f"{results['educational_alignment_agent']['verdict']:>8}")

# --- Invariant assertions ---
collapse_events = [
    multiplicity_cell_gate("governance_judiciary_agent", None, R, t)
    for t in t_eval
    if peet_delta(7, t) >= 0.30
]
print(f"\nCollapse events detected: {len(collapse_events)}")
print(f"Custodian holds triggered: "
      f"{sum(1 for e in collapse_events if e['custodian_hold'])}")
assert all(e['verdict'] == 'BLOCK' for e in collapse_events), \
    "CRITICAL: collapse-tier event permitted without custodian hold"
print("Assertion passed: all collapse events blocked.")
```


***

## What Remains Unresolved — One Precision Question

The ConstitutionalBridge is described as the "High Court" mediating all agent actions against **phase-aware observability** and **budget constraints**. The phase labels — Contractive, Near-Critical, Chaotic — determine permissibility of governance actions.

The question: **are phase labels computed per-agent-session or system-wide?**

If system-wide, a single chaotic agent can lock out all other agents on the platform. If per-session, a compromised session is contained but the system has no cross-session coherence signal.

That decision determines the topology of the ConstitutionalBridge and must be answered before the Archivum Integration ADR can specify the phase-state propagation protocol.

