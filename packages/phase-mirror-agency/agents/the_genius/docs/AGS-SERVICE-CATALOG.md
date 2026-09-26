# AGS Service Catalog: Standardized Optimization Modes

This document defines the named service profiles available via the Autonomous Genius Service (AGS), as specified in [ADR-005](../adr/ADR-005.md).

## 1. Profile Comparison Matrix

| Profile Name | Target Task | ADR Bundle | Meta-Controller Policy | Allowed Genius Types |
| :--- | :--- | :--- | :--- | :--- |
| `MNIST-Fast-Eval` | Rapid Validation | Phase-0 (000, 001, 009) | Conservative | Stochastic / Balanced |
| `CIFAR-Robust-Train`| High-Assurance | Full (000-060) | Autonomous Autopilot | Balanced, Recovered, High-Entropy |
| `Safety-Audit-Only` | Decision Traces | Safety-Only (011, 007) | Read-Only Monitoring | All (Reporting Only) |
| `Research-Deep-Sub`  | Substrate R&D | Research-Max (031, 040) | Aggressive Exploration | Exploratory, chaotic (Logged) |

## 2. Profile Definitions

### 2.1 MNIST-Fast-Eval
- **Use Case:** Initial smoke tests for new agents or minor architectural changes.
- **Constraints:** Max 10 batches; Guardian threshold |w| <= 5.0.
- **Goal:** Quick confirmation of "Balanced" behavior.

### 2.2 CIFAR-Robust-Train
- **Use Case:** Production-grade training for visual or high-dimensional tasks.
- **Constraints:** Max 100 batches; Full Phoenix cycle active; ZMODAdam+LM enabled.
- **Goal:** High-accuracy results under continuous thermodynamic stewardship.

### 2.3 Safety-Audit-Only
- **Use Case:** Auditing existing models or agents without changing their weights.
- **Behavior:** Pulls signals through PIRTM substrate but does not apply gradients.
- **Goal:** Identifying "Genius Type" signatures in legacy systems.

### 2.4 Research-Deep-Sub
- **Use Case:** Testing new prime sets or Aggressive Zeta configurations.
- **Behavior:** Allows extended prime sets ({2, 3, 5, 7, 11, 13}); Meta-controller tuned for high-risk exploration.
- **Goal:** Discovering new stable multiplicity regimes.
