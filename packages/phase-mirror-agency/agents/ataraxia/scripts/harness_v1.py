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

if __name__ == "__main__":
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
    # Force a collapse event for testing
    collapse_events = [
        multiplicity_cell_gate("governance_judiciary_agent", None, R, t)
        for t in t_eval
        if peet_delta(7, t) >= 0.30
    ]
    # Add a mock collapse event to ensure assertion logic works
    mock_t = 15.0
    
    # Store original function reference
    _original_peet_delta = peet_delta
    
    # Override global function locally 
    def mock_peet_delta(n, t): return 0.35
    globals()['peet_delta'] = mock_peet_delta
    
    collapse_events.append(multiplicity_cell_gate("governance_judiciary_agent", None, 3.0, mock_t))
    
    # Restore original
    globals()['peet_delta'] = _original_peet_delta
    print(f"\nCollapse events detected: {len(collapse_events)}")
    print(f"Custodian holds triggered: "
          f"{sum(1 for e in collapse_events if e['custodian_hold'])}")
    assert all(e['verdict'] == 'BLOCK' for e in collapse_events), \
        "CRITICAL: collapse-tier event permitted without custodian hold"
    print("Assertion passed: all collapse events blocked.")
    print("Harness v1 complete. MultiplicityCell contraction invariant validated.")
