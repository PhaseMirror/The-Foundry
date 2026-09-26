# Meta-Ensemble Objective

Multiplicity Foundation | Meta-Relativity v1.0

## What Meta-Ensembles Are For

Meta-ensembles in PIRTM automate the construction of PIRTM-conformant modules and tests, not free-form code generation.

Every artifact a meta-ensemble produces must satisfy:

1. Prime-frequency coherence: the artifact's core loop operates at a prime-indexed frequency.
2. Xi(t) contractivity: any operator the artifact exposes must pass INV-1 through INV-5 in `pirtm/tests/test_false_xi.py`.
3. Explainability: the ensemble must log why each assembly step was taken in terms of PIRTM invariants rather than implementation convenience.
4. Registry entry: every assembled artifact receives a row in `pirtm/docs/PRIME_FREQUENCY_INTEGRITY_SUITE.md` before it is considered complete.

## What Meta-Ensembles Are Not For

- Generating arbitrary Python, MLIR, or binding code unconstrained by PIRTM invariants.
- Bypassing the False Xi test suite to accelerate delivery.
- Producing cosmetically PIRTM-compliant code that lacks genuine prime-field dimensionality or contractive dynamics.

## Invariants Meta-Ensembles Must Always Enforce

| Invariant | Enforcement Point |
|---|---|
| INV-1: Contractive spectral bound | Every generated operator class |
| INV-2: Prime-field dimensionality | Every generated state space |
| INV-3: KK 5D spectral gap | Every generated signal module |
| INV-4: Universal constant residue | Every generated decay or evolution function |
| INV-5: Digital fingerprint reproducibility | Every generated seed-dependent module |
| PFP: Prime period stability | Every generated binding loop |

## Refusal Policy

A meta-ensemble that cannot explain its own assembly steps in terms of the invariants above must not commit its output to this repository.

The log entry in `pirtm/docs/META_ENSEMBLE_LOG.md` is not optional. It is the assembly record.