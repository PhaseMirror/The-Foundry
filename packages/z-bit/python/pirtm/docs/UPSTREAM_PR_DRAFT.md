# Draft Upstream PR: Direct-Sum Operator Norm Lemma

**Title**: [FEAT] Add direct-sum operator norm lemma for uniformly bounded maps

**Description**:
This PR adds a general lemma for calculating the operator norm of a direct sum of continuous linear maps between normed spaces.

Specifically, for a collection of maps $T_i: E_i \to F_i$, the norm of the direct sum $\bigoplus T_i$ is given by $\sup_i \|T_i\|$.

**Mathematical Context**:
This result is essential for functional analysis workflows involving sectorwise linear maps and is a prerequisite for more specialized stability proofs in many-body physics and recursive trust models.

**Changes**:
- Added `ContinuousLinearMap.norm_directSum_le` to `Mathlib.Analysis.NormedSpace.ContinuousLinearMap`.
- Added supporting lemmas for bounded linear maps on $\ell^p$ sums.

**Checklist**:
- [x] Follows Mathlib naming conventions.
- [x] Includes docstrings in standard format.
- [x] Proof is minimized and idiomatic.
