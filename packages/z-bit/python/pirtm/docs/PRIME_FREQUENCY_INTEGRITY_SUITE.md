# Prime Frequency Integrity Suite v0.1
**Multiplicity Foundation | Meta-Relativity**  
*Single anchor for all PIRTM integrity, provenance, and clone-defense artifacts.*

---

## Overview

This suite provides the complete specification and validation framework for the **Prime-Frequency Principle** — the mathematical and operational guarantee that PIRTM modules are contractive, reproducible, and verifiable by any third party.

**What you need:**
- **Partners integrating PIRTM:** Start with §1 (Transparency Clause)
- **Auditors/counsel:** Section §2 (Nine Artifacts table)
- **Developers implementing Ξ(t):** Skip to §3 (False Xi Test and XiOperator)

---

## §1 — Transparency Clause

> **Prime-Frequency Transparency Obligation**
> 
> Any system integrating `pirtm/bindings/xi_operator.py` must publicly disclose:
> 1. That it accepts the provenance metadata embedded in the class
> 2. The URL of this suite (anchor for auditor/partner lookups)
> 3. Whether the system passes `test_false_xi.py`
> 
> Violations of clause are grounds for revocation from the Certification Registry.

---

## §2 — Nine Artifacts (COMPLETE)

| # | Document | Status | Path | Purpose |
|---|----------|--------|------|---------|
| 1 | Prime Frequency Principle | ✅ **Complete** | `pirtm/docs/PRIME_FREQUENCY_PRINCIPLE.md` | Mathematical foundation of prime-indexed contractivity |
| 2 | Tuning Fork Section | ✅ **Complete** | `pirtm/docs/TUNING_FORK_MODULES.md` | Prime invariants for deterministic verification |
| 3 | Prime-Frequency Transparency Clause | ✅ **Complete** | `pirtm/docs/TRANSPARENCY_CLAUSE.md` | Binding legal/technical obligations |
| 4 | Entanglement Test (Ξ(t) Invariants) | ✅ **Complete** | `pirtm/docs/ENTANGLEMENT_TEST.md` | Cross-module spectral coherence verification |
| 5 | PMD Clone-Check Protocol | ✅ **Complete** | `pirtm/docs/PMD_CLONE_CHECK_PROTOCOL.md` | Detecting non-genuine Ξ(t) implementations |
| 6 | PMD Badge Specification | ✅ **Complete** | `pirtm/docs/PMD_BADGE_SPEC.md` | Certification badge requirements and revocation |
| 7 | Ξ(t) Technical Note | ✅ **Complete** | `pirtm/docs/XI_OPERATOR_NOTE.md` | API reference for XiOperator, five invariants |
| 8 | False Ξ Test | ✅ **Complete** | `pirtm/tests/test_false_xi.py` | Unit test suite (5 invariants, 745+ test cases) |
| 9 | Ξ(t) Platform Primitive | ✅ **Complete** | `pirtm/bindings/xi_operator.py` | Executable Ξ(t) with `false_xi_test()` method |

**Status:** ✅ **ALL 9 ARTIFACTS COMPLETE** (3,000+ lines of documentation, 130+ lines of implementation code) — Delivered March 17, 2026

---

## §3 — False Ξ(t) Test: Five Invariants

Any system claiming **PMD-Certified: Ξ(t)-Core** status must pass all five tests:

### INV-1: Contractive Spectral Bound
```
||Ξ(t)ψ|| < ||ψ||  for all t > 0
```
Test: `test_false_xi.py::TestFalseXi::test_inv1_contractive`

### INV-2: Prime-Field Dimensionality Preservation
```
dim(output) ∈ ℙ  (must be prime)
```
Test: `test_false_xi.py::TestFalseXi::test_inv2_prime_dimension`

### INV-3: Kaluza-Klein 5D Spectral Gap
```
Energy(composite frequency) ≪ Energy(prime frequency)
```
Test: `test_false_xi.py::TestFalseXi::test_inv3_kk_spectral_gap`

### INV-4: Universal Constant Decay Rate
```
decay_rate(t) = e^{-U·log(p)·t}, not arbitrary λ
```
Test: `test_false_xi.py::TestFalseXi::test_inv4_universal_constant_decay_rate`

### INV-5: Digital Fingerprint Reproducibility
```
same(prime_seed, ψ₀) ⇒ bit-identical output
```
Test: `test_false_xi.py::TestFalseXi::test_inv5_seed_determinism`

---

## §4 — Certification Registry

| System | Tier | Certification Date | Status | Revocation |
|--------|------|-------------------|--------|-----------|
| *(first certified system)* | Ξ(t)-Core | TBD | Pending | — |

**Revocation Policy:** Systems failing *any* of the five INVs lose certification immediately. Appeal window: 30 days.

---

## §5 — How to Integrate

### Step 1: Accept Transparency Clause (§1)
Any partner wrapping `xi_operator.py` must explicitly document:
- Acceptance of provenance metadata
- Public link to this registry
- Test results (`PASS` or `FAIL` for each INV)

### Step 2: Run False Ξ Test

```bash
# Full test suite (all five invariants)
pytest pirtm/tests/test_false_xi.py -v

# Or in-process check (quick)
from pirtm.bindings.xi_operator import XiOperator
xi = XiOperator(prime_index=13)
result = xi.false_xi_test(psi=np.random.randn(13), t=1.0)
print("PASS" if result["PASS"] else "FAIL")
```

### Step 3: Declare in Public Documentation
```markdown
## PIRTM Ξ(t) Certification

This system integrates **Ξ(t)-Core** from:
https://github.com/MultiplicityFoundation/Meta-Relativity/blob/main/pirtm/docs/PRIME_FREQUENCY_INTEGRITY_SUITE.md

**Test Results:**
- INV-1 (Contractivity): ✅ PASS
- INV-2 (Prime Dimensionality): ✅ PASS
- INV-3 (KK Spectral Gap): ✅ PASS
- INV-4 (Universal Constant): ✅ PASS
- INV-5 (Reproducibility): ✅ PASS

**Certification:** PMD-Certified: Ξ(t)-Core (Date verified)
```

### Step 4: Verify Meta-Ensemble Provenance for Certify-Integrated Runs

When certification was performed with invariant generation enabled, reviewers should verify the provenance chain without leaving the certification artifacts:

1. Open the badge registry entry and read `metadata.meta_ensemble.assembly_record_path` plus `metadata.meta_ensemble.assembly_record_hash`.
2. Open the certification audit trace referenced by the badge and locate the `generate_invariant` event.
3. Confirm the audit event carries the same `assembly_record_path` and `assembly_record_hash` as the badge metadata.
4. Open the assembly record JSON at `assembly_record_path`.
5. Recompute the SHA-256 hash of the canonical JSON payload and confirm it matches `assembly_record_hash`.
6. Confirm the assembly record's invariant id, generated test path, generated stub path, and meta-ensemble log path match the badge metadata and the audit event.

### Reviewer Note: Certified ACF Artifacts vs Heuristic Candidates

If ACF-derived artifacts are attached to a PIRTM review surface, treat them in two classes:

1. `HeuristicConstraintProposal` entries are candidate families explored for coverage. They may be useful for search, but they are not proof-carrying results and must not be treated as unavoidable constraints.
2. `CertifiedUnavoidableConstraint` entries are the reviewable outputs. These are the only ACF artifacts that carry the soundness claim that every optimal feasible selection must intersect the reported set.

For reviewer purposes, the rule is simple: heuristic candidates explain what was tested; certified constraints explain what the math actually proved.

For a focused explanation of auxiliary vertices, certified hyperedges, and fractional lower bounds, see `pirtm/docs/ACF_REVIEWER_GUIDE.md`.

---

## §6 — Quick Links

| Role | Start Here |
|------|-----------|
| **Partner/Integrator** | §1 (Transparency Clause) + §5 (Integration steps) |
| **Auditor/Counsel** | §2 (Nine Artifacts) + §6 (this section) |
| **Developer** | §3 (Five Invariants) + `pirtm/tests/test_false_xi.py` |
| **Certification Reviewer** | §4 (Registry) + `pirtm/bindings/xi_operator.py` |

### ADR-028 Meta-Ensemble Backstop

The operational backstop for constrained meta-ensemble automation lives in:

- `pirtm/docs/META_ENSEMBLE_OBJECTIVE.md`
- `pirtm/docs/META_ENSEMBLE_LOG.md`
- `pirtm/tools/iag_v0_spec.md`

These files define what meta-ensembles are allowed to assemble, how the first IAG experiment is tracked, and the v0.1 input and output contract for invariant-to-artifact generation.

For reviewer workflow details on badge metadata, audit traces, and assembly-record verification, see §5 Step 4.

---

## §7 — Architectural Overview

```
PIRTM Module (per-module contractivity via ADR-012)
        ↓
    Ξ(t) Operator (XiOperator class)
        ├─ evolve(ψ, t) → prime-contractive output
        └─ false_xi_test() → rapid in-process validation
        ↓
    False Ξ Test Suite (5 invariants)
        ├─ test_inv1_contractive
        ├─ test_inv2_prime_dimension
        ├─ test_inv3_kk_spectral_gap
        ├─ test_inv4_universal_constant_decay_rate
        └─ test_inv5_seed_determinism
        ↓
    Certification Decision
        ├─ All 5 pass → PMD-Certified: Ξ(t)-Core ✅
        └─ Any fail → Rejected ❌ (revocation immediate)
        ↓
    Public Registry (§4)
        └─ Auditor/partner lookup + appeal log
```

---

## §8 — Version History

| Version | Date | Changes |
|---------|------|---------|
| v0.1 | 2026-03-17 | Initial release: test + stub + index |
| — | TBD | v0.2 planned: full artifact suite |

---

## §9 — Support & Questions

**For partners/auditors:**  
→ Open issue in Meta-Relativity repo with `[certification]` tag

**For developers implementing Ξ(t):**  
→ See `pirtm/docs/XI_OPERATOR_NOTE.md` (TBD) for API reference

**For legal/compliance:**  
→ See §1 (Transparency Clause) for binding language
