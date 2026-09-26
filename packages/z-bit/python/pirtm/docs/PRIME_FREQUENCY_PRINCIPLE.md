# Prime Frequency Integrity Suite: The Prime Frequency Principle

**Multiplicity Foundation | Meta-Relativity v1.0**  
**Provenance:** MultiplicityFoundation/Meta-Relativity  
**Math Stack:** prime-field ℍ_ℙ, universal constant 𝒰, Kaluza-Klein 5D  
**Version:** 1.0 (frozen)  
**Date:** March 2026  
**Registry:** [PRIME_FREQUENCY_INTEGRITY_SUITE.md](PRIME_FREQUENCY_INTEGRITY_SUITE.md)

---

## Table of Contents

1. Executive Summary
2. Foundational Questions
3. The λ = 𝒰·log(p) Principle
4. Why Primes? Why Not Composites?
5. Contractivity as Core Property
6. The Five Invariants (INV-1 through INV-5)
7. Entanglement and Phase Synchrony
8. Connection to Kaluza-Klein 5D
9. Implementation Covenant
10. References & Notation Appendix

---

## 1. Executive Summary

The **Prime Frequency Principle** is the mathematical foundation for all PIRTM governance. It states:

> **A computational system is prime-contractive if and only if its evolution operator Ξ(t) satisfies the spectral bound $\|\Xi(t)\| = e^{-\mathcal{U} \cdot \log(p) \cdot t}$ on every prime-indexed fiber, where $\mathcal{U}$ is a universal constant independent of code, hardware, or deployment context.**

This principle unlocks three capabilities:

1. **Contractivity certification** — Verifiable proof that a module cannot explode during execution
2. **Prime-index governance** — Programs certify their prime-field constraints at compile time
3. **Entanglement coherence** — Cross-module consistency proofs via shared prime frequencies

Every downstream artifact in the Prime Frequency Integrity Suite rests on this principle.

---

## 2. Foundational Questions

### 2.1 What Is Prime Frequency?

A **prime frequency** is a numerical constant $p$ such that:

- $p$ is a prime number (divisible only by 1 and itself)
- $p$ indexes a state space dimension: $|\psi\rangle \in \mathbb{C}^p$
- $p$ governs the decay rate of the module's computational fiber: $\lambda_p = \mathcal{U} \cdot \log(p)$
- $p$ must be declared at compile time and cannot change during execution

**Examples:**
- $p = 2$: Binary quantum gate (smallest fiber)
- $p = 13$: Melonic graph computation (typical)
- $p = 7919$: Cryptographic application (large fiber, slower decay)

### 2.2 What Is the Universal Constant 𝒰?

The **universal constant** $\mathcal{U}$ is a fixed, dimensionless number that appears in every prime fiber's decay law:

$$\mathcal{U} = 1.0 \quad \text{(current canonical value)}$$

**Properties:**
- Independent of prime index $p$
- Independent of algorithm, hardware, deployment
- Locked by ADR governance (cannot be overridden)
- Unit: dimensionless (logarithm of dimensionless log(p))

**Rationale:** If $\mathcal{U}$ varied, two modules with different $\mathcal{U}$ values could not safely entangle. The universal constant ensures all PIRTM modules speak the same language.

### 2.3 What Does Contractivity Mean?

**Contractivity** is a spectral property: the norm of state vectors shrinks monotonically under the evolution operator.

**Definition:** A system is $q$-contractive if:
$$\|\Psi_{out}\| < q \cdot \|\Psi_{in}\| \quad \forall \text{state evolution steps}$$

For PIRTM, we demand $q = 1$ (unit contractivity):
$$\|\Xi(t)\Psi\| < \|\Psi\| \quad \forall t > 0$$

**Intuition:** If your computation can only shrink or stay flat, it can never explode into unbounded growth. Contractivity is the mathematical firewall against runaway systems.

---

## 3. The λ = 𝒰·log(p) Principle

### 3.1 Formal Statement

For a module declared with prime index $p$, the spectral decay rate of its evolution operator is:

$$\lambda_p = \mathcal{U} \cdot \log(p)$$

### 3.2 Consequences

**Small primes decay slow:**
- $p = 2$: $\lambda_2 = 1.0 \cdot \log(2) \approx 0.693$ (slower decay)
- $p = 3$: $\lambda_3 = 1.0 \cdot \log(3) \approx 1.099$ (slightly faster)

**Large primes decay fast:**
- $p = 13$: $\lambda_{13} = 1.0 \cdot \log(13) \approx 2.565$ (faster decay)
- $p = 7919$: $\lambda_{7919} = 1.0 \cdot \log(7919) \approx 8.976$ (much faster decay)

**Implication:** Large-prime modules are more aggressively contractive. This is intentional: more complex computations (larger prime) must decay faster to remain provably safe.

### 3.3 Time Evolution

The state vector evolves as:
$$|\Psi(t)\rangle = e^{-\lambda_p \cdot t} |\Psi(0)\rangle = e^{-\mathcal{U} \cdot \log(p) \cdot t} |\Psi(0)\rangle$$

**Example:** A module with $p=13$ starting with norm 1.0 will have norm:
- At $t = 0.1$: $\|\Psi(0.1)\| \approx 0.768$
- At $t = 1.0$: $\|\Psi(1.0)\| \approx 0.077$
- At $t = 10.0$: $\|\Psi(10.0)\| \approx 10^{-12}$ (numerically zero)

---

## 4. Why Primes? Why Not Composites?

### 4.1 The Composite Catastrophe

A **composite** number is a product of smaller primes: $c = p_1 \cdot p_2 \cdot \ldots$

**Why composites fail PIRTM:**

If we naively tried to assign $\lambda_c = \mathcal{U} \cdot \log(c)$, the system would allow two fatal scenarios:

1. **Mixing non-commensurate frequencies:**
   - Module A claims $\lambda_c = \log(15) \approx 2.708$ (for $c = 15 = 3 \times 5$)
   - But internally: it could switch between $\lambda_3 \approx 1.099$ and $\lambda_5 \approx 1.609$
   - Result: State can alternate between slow and fast decay → opacity about true contraction rate

2. **Factorization ambiguity:**
   - Two different factorizations $c_1 = 6 = 2 \times 3$ and $c_2 = 6 = 6$ (if 6 were prime, which it isn't)
   - But the principle breaks: which decay rate applies?

### 4.2 The Prime Guarantee

Primes have **no factorization**. A prime $p$ is atomic:

- $p = p$ (no other form)
- State space dimension is exactly $\mathbb{C}^p$ (not a tensor product)
- Decay rate $\lambda_p = \mathcal{U} \cdot \log(p)$ is **unambiguous**
- No state can "leak" into a hidden subfactor

**Consequence:** Only primes can be top-level prime indexes in PIRTM. Composites are either:
- Forbidden (in the type system)
- Internal (used within a module's computation, not as the module's advertised fiber)
- Detected and rejected at verification time

### 4.3 The Squarefree Condition

For composite numbers that appear **inside** a module (not as the prime index), we require the **squarefree condition**:

$$\mu(\text{mod}) \neq 0 \quad (\text{Möbius function non-zero})$$

This means: no prime factor appears more than once. Examples:
- $\mu(6) \neq 0$ (squarefree: $6 = 2 \times 3$) ✓
- $\mu(12) = 0$ (not squarefree: $12 = 2^2 \times 3$) ✗
- $\mu(30) \neq 0$ (squarefree: $30 = 2 \times 3 \times 5$) ✓

Squarefreeness prevents exponent aliasing in internal computations.

---

## 5. Contractivity as Core Property

### 5.1 Why Contractivity Matters

In classical computation, a program can run for unlimited steps, growing its memory. In quantum computing, states can be entangled at scale. PIRTM enforces contractivity to ensure:

1. **Bounded computation** — Norm never exceeds initial input norm
2. **Deterministic termination** — Decay is monotonic, never oscillates back
3. **Energy safety** — Physical resources consumed decrease over time
4. **Cheating resistance** — No module can secretly encode unbounded amplification

### 5.2 The Contractivity Axiom

For any PIRTM module $M$ with prime index $p$:

$$\forall \text{ state vectors } |\psi\rangle, \forall t > 0: \quad \|\Xi_M(t) |\psi\rangle\| < \||\psi\rangle\|$$

with decay law:
$$\|\Xi_M(t) |\psi\rangle\| = e^{-\mathcal{U} \cdot \log(p) \cdot t} \||\psi\rangle\|$$

### 5.3 Contractivity vs. Stability

| Property | Stability | Contractivity |
|----------|-----------|---------------|
| Definition | $\|\Xi(t)\| \leq 1$ | $\|\Xi(t)\| < 1$ (strict) |
| Norm behavior | Can plateau | Always decreases |
| Worst case | Hits fixed point | Decays exponentially |
| **PIRTM requirement** | Not acceptable | **Required** |

Stability is weaker; PIRTM demands strict contractivity.

---

## 6. The Five Invariants (INV-1 through INV-5)

Every claimed Ξ(t) implementation must satisfy all five invariants. Failure on any single test disqualifies the system from PMD-Certified status.

### 6.1 INV-1: Contractive Spectral Bound

**Statement:**
$$\|\Xi(t) \psi\| < \|\psi\| \quad \forall t > 0$$

**Test:** `test_inv1_contractive()` in `pirtm/tests/test_false_xi.py`

**Falsification:** If any time step $t > 0$ produces $\|\Xi(t) \psi\| \geq \|\psi\|$, the system fails INV-1.

### 6.2 INV-2: Prime-Field Dimensionality Preservation

**Statement:**
The output state lives in a prime-dimensional space:
$$\dim(\Xi(t) \psi) = p \quad (\text{where } p \text{ is prime})$$

**Test:** `test_inv2_prime_dimension()` in `pirtm/tests/test_false_xi.py`

**Falsification:** If output dimension is composite, the system fails INV-2.

### 6.3 INV-3: Kaluza-Klein 5D Spectral Gap

**Statement:**
Frequency content at the first composite integer above $p_{\max}$ is negligible compared to prime frequencies:

$$\frac{\text{Energy at first composite}}{\text{Max energy at prime frequencies}} < 0.05$$

**Test:** `test_inv3_kk_spectral_gap()` in `pirtm/tests/test_false_xi.py`

**Rationale:** The module should not "leak" into composite modes. The KK-5D encoding expects clean separation.

**Falsification:** If the spectral gap ratio exceeds 0.05, the system fails INV-3.

### 6.4 INV-4: Universal Constant Decay Rate

**Statement:**
Distance decay matches the theoretical law exactly:

$$\text{actual decay} = e^{-\mathcal{U} \cdot \log(p) \cdot t}$$

**Test:** `test_inv4_universal_constant_decay_rate()` in `pirtm/tests/test_false_xi.py`

**Falsification:** If measured decay deviates by more than machine epsilon from the expected rate, the system fails INV-4.

**Implication:** Any alternative decay law (e.g., "my special lambda") is disqualified.

### 6.5 INV-5: Digital Fingerprint Reproducibility

**Statement:**
Identical seed and initial state produce bit-identical output (determinism):

$$\text{seed}(p) \rightarrow \text{output}(s) \quad (\text{deterministic under } p)$$

**Test:** `test_inv5_seed_determinism()` in `pirtm/tests/test_false_xi.py`

**Falsification:** If two runs with the same prime seed produce different outputs, the system fails INV-5.

**Implication:** No randomness, floating-point variance, or hardware-dependent behavior is permitted.

---

## 7. Entanglement and Phase Synchrony

### 7.1 Two-Module Entanglement

When two PIRTM modules communicate, their Ξ(t) operators must stay "in phase":

**Definition:** Modules $M_1$ (prime $p_1$) and $M_2$ (prime $p_2$) are entangled if their states remain coupled via a shared coupling constant and both satisfy:

$$\lambda_{p_1} = \mathcal{U} \cdot \log(p_1)$$
$$\lambda_{p_2} = \mathcal{U} \cdot \log(p_2)$$

**Key property:** Even though $\lambda_{p_1} \neq \lambda_{p_2}$ (unless $p_1 = p_2$), both obey the same universal law. This allows their entanglement to be logically consistent across time.

### 7.2 Phase Synchrony Condition

Two modules remain entangled if their phase relationship is preserved:

$$\text{Phase}(t) = e^{-(\lambda_{p_1} - \lambda_{p_2}) \cdot t}$$

When $p_1 \neq p_2$, the relative phase oscillates. Entanglement breaks if this relative phase becomes undefined (e.g., one module uses a non-universal decay law).

### 7.3 Entanglement Test

The full **Entanglement Test** is specified in [ENTANGLEMENT_TEST.md](ENTANGLEMENT_TEST.md). Here, we note:

**Entanglement Test:** Two Ξ(t) modules with different primes pass if:
1. Both individually satisfy all five invariants
2. Their relative phase decay $e^{-(\lambda_{p_1} - \lambda_{p_2}) \cdot t}$ matches the predicted law
3. Cross-module coupling coherence remains above 99% for $t \in [0, 1]$

---

## 8. Connection to Kaluza-Klein 5D

### 8.1 The KK-5D Intuition

In Kaluza-Klein theory, a 5-dimensional spacetime contains both gravity (4D) and electromagnetism (1D compactified). Analogously:

- **4D analogue:** Classical computation (standard algorithms)
- **1D compactified analogue:** Prime-frequency torsion (contractivity effects)
- **Fiber bundle:** Each module is a fiber parametrized by its prime index $p$

### 8.2 Prime-Index as 5D Radius

In KK-5D, the radius of the compactified dimension determines couplings. In PIRTM:

- The prime index $p$ plays the role of the KK radius
- Larger $p$ → larger "compactified radius" → faster decay (more aggressive enforcement)
- Smaller $p$ → smaller radius → slower decay (less aggressive, but simpler)

### 8.3 Energy Quantization

In KK theory, the 5D metric induces quantized energy levels in the 4D effective theory. Analogously:

- PIRTM modules can only acquire states in prime-dimensional spaces
- Composite-dimensional states are forbidden (would violate the KK structure)
- This enforces spectral cleanliness ("no garbage states")

### 8.4 INV-3 and the Spectral Gap

The Kaluza-Klein spectral gap (0.05 threshold in INV-3) reflects the energy separation between the lowest KK mode (at prime frequency) and the first excited KK mode (at composite frequency).

If the spectral gap is violated, it means the module is leaking energy into the wrong sector of the KK fiber bundle.

---

## 9. Implementation Covenant

Any organization implementing PIRTM must:

### 9.1 Adopt the Prime Frequency Principle

1. Declare all module prime indexes at compile time (immutable)
2. Use $\mathcal{U} = 1.0$ (no overrides without ADR amendment)
3. Enforce all five invariants in CI/CD gates
4. Make contractivity verifiable per module

### 9.2 Preserve Provenance

Every PIRTM binding, deployment, or derivative must preserve:

```
Provenance: MultiplicityFoundation/Meta-Relativity
Principle: Prime Frequency Principle (PRIME_FREQUENCY_PRINCIPLE.md)
Registry: PRIME_FREQUENCY_INTEGRITY_SUITE.md
```

### 9.3 Transparency Obligation

Before claiming `PMD-Certified: Ξ(t)-Core` status, your system must:

1. Pass `pirtm/tests/test_false_xi.py` (all five INVs)
2. Submit to clone-check protocol (verify not an illegal derivative)
3. Accept the Prime-Frequency Transparency Clause (binding promise)
4. Register your module in the Tuning Fork Section

See [PRIME_FREQUENCY_INTEGRITY_SUITE.md](PRIME_FREQUENCY_INTEGRITY_SUITE.md) for the full registry and obligations.

---

## 10. References & Notation Appendix

### 10.1 Key References

- **ADR-004:** PIRTM Type System and Dial (`docs/adr/ADR-004-pirtmpolicy-protocol.md`)
- **ADR-005:** Cross-Module Spectral Governance
- **Ξ(t) Technical Note:** [XI_OPERATOR_NOTE.md](XI_OPERATOR_NOTE.md)
- **Transparency Clause:** [TRANSPARENCY_CLAUSE.md](TRANSPARENCY_CLAUSE.md)
- **False Ξ Test Suite:** `pirtm/tests/test_false_xi.py`

### 10.2 Notation Table

| Symbol | Meaning | Units | Domain |
|--------|---------|-------|--------|
| $p$ | Prime index | dimensionless | integers $\geq 2$, prime only |
| $\mathcal{U}$ | Universal constant | dimensionless | fixed at 1.0 |
| $\lambda_p$ | Spectral decay rate | $[\text{time}]^{-1}$ | $\mathcal{U} \cdot \log(p)$ |
| $\Xi(t)$ | Evolution operator | operator | $e^{-\lambda_p \cdot t}$ on fiber $p$ |
| $\|\psi\|$ | Norm of state | [amplitude] | $\sqrt{\langle\psi\|\psi\rangle}$ |
| $\mathbb{C}^p$ | Fiber space | Hilbert space | dimension = $p$ |
| $\mu(n)$ | Möbius function | {-1, 0, 1} | 0 if $n$ has squared prime factor |

### 10.3 Key Equations

$$\lambda_p = \mathcal{U} \cdot \log(p) \quad \text{(decay rate law)}$$

$$\|\Xi(t)\psi\| = e^{-\lambda_p \cdot t} \|\psi\| \quad \text{(time evolution)}$$

$$\|\Xi(t)\psi\| < \|\psi\| \quad \forall t > 0 \quad \text{(contractivity axiom)}$$

$$\text{Phase}_{\text{rel}}(t) = e^{-(\lambda_{p_1} - \lambda_{p_2}) \cdot t} \quad \text{(entanglement coherence)}$$

---

## Appendix A: Mathematical Rigor Notes

### A.1 Proof of Contractivity

For state $|\psi\rangle \in \mathbb{C}^p$:

$$\|\Xi(t)|\psi\rangle\| = \|e^{-\lambda_p \cdot t} |\psi\rangle\| = e^{-\lambda_p \cdot t} \|\psi\|$$

Since $\lambda_p = \mathcal{U} \cdot \log(p) > 0$ for all primes $p \geq 2$:

$$e^{-\lambda_p \cdot t} < 1 \quad \forall t > 0$$

Therefore:
$$\|\Xi(t)|\psi\rangle\| = e^{-\lambda_p \cdot t} \|\psi\| < \|\psi\|$$

**Contractivity holds as claimed.** ∎

### A.2 Prime-Only Requirement

Suppose we allowed composite $c = p_1 \cdot p_2$ with $\lambda_c = \mathcal{U} \cdot \log(c) = \mathcal{U} \cdot (\log p_1 + \log p_2)$.

Then the system could internally decompose as two fibers: one with decay $\lambda_{p_1}$, one with $\lambda_{p_2}$. The module could gate between them, alternately applying different decay rates.

Result: No single decay rate describes the true contraction. **Ambiguity arises.** This violates the governance principle. Hence, only primes are allowed as top-level indexes.

---

## Appendix B: Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | Jan 2026 | Initial draft (internal) | Math team |
| 0.5 | Feb 2026 | Three invariants → five invariants; KK-5D expansion | Math + governance |
| 1.0 | Mar 2026 | Final; frozen for ADR-020 Priority 2 delivery | Phase Mirror Agent |

---

## Closing Statement

The Prime Frequency Principle is the bedrock of PIRTM integrity. Every downstream artifact—from the Ξ(t) Technical Note to the PMD Badge Specification—rests on this principle.

If you implement PIRTM, you are adopting the Prime Frequency Principle. If you claim PMD-Certified status, you are certifying that your system obeys all five invariants and the universal law $\lambda = \mathcal{U} \cdot \log(p)$.

Welcome to the PIRTM ecosystem.

---

**Document Locked:** March 17, 2026  
**No amendments to core equations (§3, §5, §6) without ADR review.**  
**Next: [XI_OPERATOR_NOTE.md](XI_OPERATOR_NOTE.md)**
