# Phase 5: Descriptor → MLIR Round-Trip, ACF Integration, Ensemble Ledger, Day 90 Benchmark

**Status**: In Progress (2026-03-18)  
**Gates Unlocked**: 7/7 ADR gates passing  
**Objective**: Close remaining gaps, achieve end-to-end verified execution  

---

## Phase 5 Overview

Phase 5 is the **integration & validation sprint** that ties together all components:

| Component | Purpose | Owner | Status |
|-----------|---------|-------|--------|
| **Descriptor Round-Trip** | Verify descriptor → MLIR → execution → comparison | Core PIRTM | In Progress |
| **ACF Type System** | Embed Aspectual Counting into MLIR IR types | Meta-Relativity | In Progress |
| **Ensemble Ledger** | Multi-prime session graph linking with audit trails | Meta-Ensembles | In Progress |
| **Day 90 Benchmark** | Performance (10× NumPy @ 512-dim) + compliance | Spectral | In Progress |

---

## 1. Descriptor → MLIR Round-Trip Validation

### Goal
Verify that a descriptor can be **compressed** into MLIR, **decompressed** back to Python representation, executed deterministically, and compared to reference implementation.

### Architecture

```
Descriptor (JSON)
    ↓
[Phase 2] MLIREmitter → MLIR bytecode
    ↓
[Phase 5] MLIRDecompiler → Python AST
    ↓
[Phase 1] Backend execution (NumPy reference)
    ↓
Verification: Floating-point equivalence + audit trail determinism
```

### Key Files
- `pirtm/transpiler/mlir_decompiler.py` — **NEW**
  - Extract recurrence parameters from MLIR
  - Reconstruct Python/NumPy execution model
  - Validate L0 invariants
  
- `pirtm/tests/test_phase5_round_trip.py` — **NEW**
  - 4 descriptors (basic, composite, multi-module, tight coupling)
  - Compare NumPy vs. MLIR execution
  - Floating-point tolerance: ±1e-6

### Test Cases
1. **basic_contractive_system.json** (1 module)
   - Prime: 7919, ε: 0.05, ‖T‖: 0.9
   
2. **composite_modulus_system.json** (composite mod)
   - Prime: 7921 = 89², ε: 0.1, ‖T‖: 0.95
   
3. **multimodule_network.json** (3 primes)
   - Primes: 3, 5, 7; coupled via coherence matrix
   
4. **tightly_coupled_system.json** (coupling r=0.7)
   - High spectral radius; tests stability

---

## 2. Aspectual Counting Type System Integration

### Goal
Embed ACF counting semantics into PIRTM IR so that **conflict hypergraph reductions** are first-class in the type system.

### Architecture

```
ACF Types (aspectual_counting/) 
    ↓
[Phase 5] ACF → MLIR Custom Type
    ↓
Type-safe recurrence with aspect-preserving bijections
    ↓
MLIR verifier enforces aspectual invariants
```

### Key Files
- `pirtm/dialect/acf_types.td` — **NEW**
  - Define `!pirtm.acf_count` type
  - Operators: `pirtm.acf.aspect`, `pirtm.acf.join`, `pirtm.acf.meet`
  
- `pirtm/dialect/acf_types.cpp` — **NEW**
  - Type verifier (INV-1: refinement monotonicity)
  - Aspect-preserving bijection checker
  
- `pirtm/tests/test_phase5_acf_types.py` — **NEW**
  - Minimal Theseus witness integration
  - ACF hypergraph as session graph metadata

### Integration Points
1. `pirtm.module` gains `aspectual_metadata` attribute
2. `pirtm.session_graph` stores conflict hypergraph as JSON
3. Verifier checks: meet-join bounds, refinement monotonicity

### Test Cases
- Gate 1: Aspect-preserving bijections preserve count
- Gate 2: Refinement is monotonic
- Gate 3: Theseus witness embedded in session metadata

---

## 3. Ensemble Ledger Multi-Prime Session Tests

### Goal
Verify that **ensemble ledger** can link multiple PIRTM modules with ACF conflict resolution and produce deterministic session graphs.

### Architecture

```
[Module i: Prime p_i, epsilon_i, ACF]
    ↓ ensemble_ledger.link()
[Module j: Prime p_j, epsilon_j, ACF]
    ↓
SessionGraph with:
  - Coherence matrix (pairwise spectral stability)
  - Conflict resolution (ACF selection from MUS2)
  - Audit trail (every linking decision)
```

### Key Files
- `meta_ensembles/core/pirtm_acf_ledger.py` — **NEW**
  - Extended ledger with ACF/MUS2 conflict selection
  - `link_with_acf()` method
  
- `meta_ensembles/tests/test_phase5_ensemble_acf.py` — **NEW**
  - 2-module, 3-module, 5-module test cases
  - Verify coherence matrix ∈ [0.99, 1.01]
  - Check audit trail determinism

### Test Cases
1. **2-prime system** (p=3, p=5)
   - Simple coherence check
   
2. **3-prime system** (p=3, p=5, p=7)
   - Full coupling matrix validation
   
3. **5-prime multi-ensemble** (primes: 3,5,7,11,13)
   - Ensemble aggregation with conflict resolution
   - ACF selects minimal conflict set

---

## 4. Day 90 Performance Benchmark

### Goal
Verify that **spectral operator identification** (AAA + Wetterich solver) achieves **≥10× NumPy speedup** on 512-dimensional tensors while maintaining proof validity.

### Architecture

```
[NumPy Reference Implementation]
    ↓ (baseline: 500ms @ 512-dim)
    ↓
[C++ Standalone Runtime + LLVM Codegen]
    ↓ (target: ≤50ms @ 512-dim, 10× speedup)
    ↓
Verification:
  - Numerical error within tolerance (±1e-4)
  - Contractivity proof still valid
  - Audit trail reproducible
```

### Key Files
- `pirtm/mlir/phase4_benchmark.py` — **NEW**
  - Compile descriptor → MLIR → LLVM → .so
  - Time C++ execution
  - Compare vs. NumPy reference
  
- `pirtm/tests/test_phase5_day90_benchmark.py` — **NEW**
  - 5 problem sizes: 64, 128, 256, 512, 1024 dimensions
  - Measure: compilation time, runtime, peak memory
  - Pass: speedup ≥10× AND numerical error < 1e-4

### Metrics
| Dimension | NumPy (ms) | Target (ms) | Speedup | Status |
|-----------|-----------|-----------|---------|--------|
| 64        | 20        | <2        | 10×    | ? |
| 128       | 80        | <8        | 10×    | ? |
| 256       | 320       | <32       | 10×    | ? |
| 512       | 1280      | <128      | 10×    | ? |
| 1024      | 5120      | <512      | 10×    | ? |

---

## Phase 5 Exit Criteria

Gates to close:
- ✅ **7/7 ADR gates** passing (inherited from Phase 4)
- ⬜ **Round-trip validation**: Descriptor → MLIR → execution (4/4 descriptors pass)
- ⬜ **ACF integration**: Aspectual Counting types embedded, verifier enforces invariants
- ⬜ **Ensemble ledger**: Multi-prime sessions link deterministically
- ⬜ **Day 90 benchmark**: ≥10× speedup @ 512-dim, proof valid

### Final Metrics
- **Test suite**: 200+ new tests (Round-Trip + ACF + Ensemble + Benchmark)
- **Code coverage**: 95%+ (transpiler, spectral, ensemble)
- **Documentation**: 3 new ADRs (ADR-024, ADR-025, ADR-026)
- **Deployment readiness**: All L0 invariants verified in C++

---

## Sequencing & Dependencies

```
Week 1 (Days 1–3):
  → Round-trip validation (unblocks ACF integration)
  → ACF type system (depend: round-trip)

Week 2 (Days 4–6):
  → Ensemble ledger (depend: round-trip + ACF)
  → ACF selection in ledger

Week 3 (Days 7–8):
  → Day 90 benchmark (depend: all above)
  → Compliance verification
  → Final gate check
```

---

## Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| MLIR ↔ Python mapping lossy | Unit tests for each parameter extraction |
| ACF type verifier complex | Test incrementally (Gate 1 → Gate 2 → Gate 3) |
| Ensemble concurrent linking | Use deterministic seeding + audit trail replay |
| C++ performance < 10× | Fallback: profile LLVM IR, optimize codegen |

---

## Success Criteria

```
✅ All 200+ Phase 5 tests pass
✅ Descriptor round-trip: 4/4 examples verified
✅ ACF types: Minimal Theseus witness embedded  
✅ Ensemble: 5-prime system links deterministically
✅ Day 90: Speedup ≥10× on 512-dim tensors
✅ Audit: Complete reproducibility chain
```

---

## Next: Implementation Checklist

- [ ] Task 1.1: Create MLIRDecompiler class
- [ ] Task 1.2: Round-trip tests for 4 descriptors
- [ ] Task 2.1: Define ACF types in TableGen
- [ ] Task 2.2: ACF verifier pass (C++)
- [ ] Task 3.1: Extend ensemble_ledger with ACF
- [ ] Task 3.2: Multi-prime session tests
- [ ] Task 4.1: MLIR → LLVM → .so compilation
- [ ] Task 4.2: Day 90 benchmark & metrics
- [ ] Final: Gate verification + documentation
