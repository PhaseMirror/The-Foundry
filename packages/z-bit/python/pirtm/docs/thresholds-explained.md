# Conservation Thresholds: Two Different Questions

The PIRTM system enforces two independent thresholds at different layers to separate mathematical concerns from economic decisions.

---

## ❓ Two Questions, Two Thresholds

### 1️⃣ Operator Contractivity (L0 / pirtm.core)

**Question:** Is the module mathematically stable?  
**Threshold:** $q_t = \|\Xi_t\| + \|\Lambda_t\| \cdot L_T < 1.0 - \varepsilon$  
**Default:** $\varepsilon = 0.05$ → effective bound = **0.95**  
**Origin:** Lyapunov stability theory  
**Non-negotiable:** ✅ Yes — mathematics will not bend  

**Meaning:**
- Spectral radius must be < 1.0 for Lyapunov stability
- ε = 0.05 safety margin prevents rounding errors
- If violated: iterations produce unbounded growth → mathematical failure

**Example:**
```
beta = 5.0, lambda_decay = 0.8
q_t = 0.8 + (min(5.0/10, 0.5) × 0.25) = 0.8 + 0.125 = 0.925
0.925 < 0.95? YES ✅ → Module can initialize
```

**Reference:** [ADR-002](docs/adr/ADR-002-contraction-invariant.md), [ADR-001](docs/adr/ADR-001-margin-mechanism.md)

---

### 2️⃣ Marshalling Fidelity (L1 / pirtm.sigma)

**Question:** Is the communication cost acceptable?  
**Threshold:** `numeric_score ≥ 0.95` (error ≤ 5%)  
**Origin:** Pragmatic engineering tradeoff  
**Non-negotiable:** ❌ No — can be overridden with `on_failure="warn"`  

**Meaning:**
- Round-trip error ≤ 5% is economically acceptable
- Perfect fidelity is impossible; some loss is normal
- Can debate cost-benefit tradeoffs for this threshold

**Example:**
```
Round-trip error: 4.3% → numeric_score = 0.957
0.957 >= 0.95? YES ✅ → Marshalling is acceptable

Round-trip error: 7.2% → numeric_score = 0.928
0.928 >= 0.95? NO ❌ → Marshalling is unacceptable (but can warn instead of failing)
```

**Reference:** [ADR-006](docs/adr/ADR-006-contractivity-marshalling.md), [ADR-009](docs/adr/ADR-009-semantic-check-activation.md), [ADR-010](docs/adr/ADR-010-conservation-threshold.md)

---

## 🔀 What If Thresholds Conflict?

The two thresholds are **independent dimensions**. Sessions are evaluated on both:

| Operator<br/>Stable? | Fidelity<br/>Good? | Outcome | Reason |
|:--:|:--:|:--|:--|
| ✅ | ✅ | **Proceed** | Both gates pass; normal operation |
| ✅ | ⚠️ | **Warn** | Math OK, cost high; economic decision |
| ❌ | ✅ | **Fail** | Math broken; good comms can't fix unstable dynamics |
| ❌ | ⚠️ | **Fail** | Both broken; definitely can't proceed |

**Key principle:** Never override the operator threshold. Economic decisions (fidelity) *can* accommodate degradation; **mathematical decisions (stability) cannot.**

---

## 🛠️ Where Are These Thresholds Defined?

**Single source of truth:** [pirtm/constants.py](../pirtm/constants.py)

```python
# L0: Operator-level (absolute, non-negotiable)
OPERATOR_CONTRACTIVITY_BOUND = 1.0
DEFAULT_EPSILON = 0.05
MARGIN_WARNING_THRESHOLD = 0.05

# L1: Economic-level (pragmatic, overridable)
MARSHALLING_FIDELITY_THRESHOLD = 0.95
SPECTRAL_CONSERVATION_TOLERANCE = 0.02
```

**Usage locations:**
- `pirtm/core/certify.py` — Module certification uses `OPERATOR_CONTRACTIVITY_BOUND`
- `pirtm/sigma/cross_kernel_marshaller.py` — Marshalling uses `MARSHALLING_FIDELITY_THRESHOLD`
- `pirtm/sigma/session_spectral_gate.py` — Session verification uses `OPERATOR_CONTRACTIVITY_BOUND`

---

## 📋 Checklist: Understanding the System

- [ ] **Operator stability** (q_t < 0.95) is binary and non-negotiable
- [ ] **Marshalling fidelity** (error < 5%) is pragmatic and overridable
- [ ] The two thresholds are **orthogonal concerns**, not to be combined
- [ ] Both are defined **in one file** (`pirtm/constants.py`) for consistency
- [ ] Changes to thresholds require **cross-team ADR approval**
- [ ] WARNING and FAIL modes give appropriate diagnostic signals

---

## 🔍 Example: Full Validation Flow

```python
# Step 1: Load module, certify it passes operator threshold
cert = certify_state(X, Xi, Lambda)
if not cert.is_valid():  # Checks q_t < 0.95
    raise ContractivityError("Operator unstable; can't initialize")

# Step 2: Create session, verify multi-module stability
session_graph = SessionGraph(modules=[cert])
session_controller = PIRTMSessionController(session_graph)
# Raises SessionLevelInstabilityError if ρ(C·diag(γ)) >= 1.0

# Step 3: Marshal data across kernels
result, report = marshaller.marshal(source, target, data)
summary = report.check_summary()
# Checks: numeric_score >= 0.95 and semantic checks pass

if report.is_acceptable():
    proceed_with_session()
else:
    log_warning(f"Fidelity degraded to {report.numeric_score:.1%}")
    # Can still proceed if acceptable in context (cost-benefit analysis)
```

---

## 🎓 Why Two Separate Thresholds?

| Aspect | Operator | Marshalling |
|:--|:--|:--|
| **Question** | Mathematically stable? | Economically acceptable? |
| **Owner** | Core verification team | Economic model team |
| **Jurisdiction** | pirtm.core (certification) | pirtm.sigma (pragmatism) |
| **Overridable** | No—math is hard | Yes—in warn mode |
| **Source** | Lyapunov theory | Empirical engineering |
| **History** | Fixed for decades | May drift as infra improves |

**Combining them would obscure the tradeoffs.** A single formula like "q_t < f(fidelity_score)" would hide which team made which choice.

---

## 📌 Key Takeaways

1. **Operator contractivity** = mathematical requirement (q_t < 0.95)  
2. **Marshalling fidelity** = economic tolerance (error < 5%)  
3. **Both matter** independently; failure on either blocks session  
4. **Operator threshold is absolute**; fidelity allows cost-benefit debate  
5. **Single source of truth**: [pirtm/constants.py](../pirtm/constants.py)  
6. **Changes require ADR** to force cross-team alignment  

---

**See also:**
- [ADR-001: Margin Mechanism](docs/adr/ADR-001-margin-mechanism.md)
- [ADR-002: Contraction Invariant](docs/adr/ADR-002-contraction-invariant.md)
- [ADR-006: Contractivity in Marshalling](docs/adr/ADR-006-contractivity-marshalling.md)
- [ADR-009: Semantic Check Activation](docs/adr/ADR-009-semantic-check-activation.md)
- [ADR-010: Conservation Threshold Arbitration](docs/adr/ADR-010-conservation-threshold.md)
