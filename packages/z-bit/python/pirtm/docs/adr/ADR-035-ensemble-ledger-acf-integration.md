# ADR-035: Ensemble Ledger ACF Integration

- **Status:** Proposed
- **Date:** 2026-04-15
- **Owners:** Lead PIRTM Theorist, Eng
- **Related ADRs:** ADR-013 (Ensemble Ledger), ADR-021 (Link-time Verification), PHASE_5_ARCHITECTURE.md
- **Systems:** meta_ensembles, pirtm_link

---

## 1. Context

Phase 5 of the PIRTM architecture mandates the integration of the Aspectual Counting Framework (ACF) into the Ensemble Ledger. This integration is crucial for enabling **deterministic session graph generation** and **MUS2-gated conflict resolution** in multi-prime ensembles. The goal is to ensure that interactions between modules, even with conflicting aspectual constraints, are resolved according to a mathematically sound and auditable protocol.

---

## 2. Decision

We will extend the `EnsembleLedger` with ACF-specific functionality, creating `PirtmAcfLedger`, to manage and resolve module conflicts during the linking process.

### 2.1 ACF-Aware Module Registry
The `PirtmAcfLedger` will store ACF metadata alongside module information:
- `prime_index`: The declared prime for the module.
- `aspects`: Serialized dictionary of aspectual counts for the module.
- `weights`: Serialized dictionary mapping bridge names to their weights (integers).
- `mus_family`: Serialized list of conflicting bridge pairs (MUS2 edges).

### 2.2 MUS2 Conflict Resolution
The `link_with_acf` method will:
1. **Aggregate ACF Data**: Collect all declared aspects, weights, and MUS edges from registered modules.
2. **Build Conflict Graph**: Construct a `MUS2ConflictGraph` from the aggregated bridge names and MUS2 edges.
3. **Select Independent Set**: Use `select_max_weight_independent_set` to choose the highest-weight set of bridges that do not conflict. This ensures that the selection is both maximal in weight and respects pairwise constraints.
4. **Spectral Analysis**: Perform the standard spectral radius check (ADR-021) on the resulting (filtered) coupling matrix.
5. **Audit Logging**: Record the selected bridges, total weight, resolution method, and contractivity verdict in a new `conflict_resolution_log` table.

---

## 3. Rationale

- **Deterministic Linking**: Explicit conflict resolution ensures that ensemble linking is deterministic and predictable, regardless of module order or registration sequence.
- **Lawful State Space**: MUS2 selection guarantees that the resulting session graph adheres to the 'lawfulness' constraint by resolving conflicts based on highest weight and minimizing redundancy.
- **Auditable Decisions**: Logging the selection process provides a transparent and verifiable record of how conflicts were resolved, crucial for debugging and trust.
- **Extensibility**: The MUS2 approach is foundational and can be extended to higher-order conflicts (MUSk) if needed in the future.

---

## 4. Implementation Details

- **New Module**: `meta_ensembles/core/pirtm_acf_ledger.py` implements `PirtmAcfLedger`.
- **New Table**: `conflict_resolution_log` added to the ledger's SQLite schema.
- **Testing**: New tests in `meta_ensembles/tests/test_phase5_ensemble_acf.py` verify:
    - 2-prime system coherence (no conflicts).
    - 3-prime system MUS2 selection (correct bridge chosen).
    - 5-prime system determinism and correct bridge selection with complex conflicts.

---

## 5. Impact

- **Code / Modules**: `meta_ensembles/core/pirtm_acf_ledger.py`, `meta_ensembles/tests/test_phase5_ensemble_acf.py`.
- **Protocols**: Ensemble linking now incorporates explicit ACF conflict resolution.
- **Verification**: New tests ensure correctness of the MUS2 selection and audit logging.
