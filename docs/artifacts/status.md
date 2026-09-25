# Bound Status Record: ADR-0036 Bose Multiplicity (Phase S0–S5b Closed)

## 1. Mirror & Bounded Scope
- **Core Invariant:** Finite occupancy configuration $\mathbf{n} = (n_1, \dots, n_g)$ is isomorphic via Fundamental Theorem of Arithmetic (FTA) to prime signature $\mathcal{P}(\mathbf{n}) = \prod_{i=1}^g p_i^{n_i}$ with exact $p$-adic recovery $n_i = v_{p_i}(\mathcal{P}(\mathbf{n}))$.
- **Combinatorial Multiplicity:** Stars-and-bars count $\Omega_{\mathrm{BE}}(N, g) = \binom{N+g-1}{N}$ matches state space enumeration size $|\mathcal{B}_{N, g}|$ across all configurations ($N=1..20, g=3$, total 1,770 microstates).
- **Epistemic Invariant & Stop Rule:** Primes are coordinates for finite multiplicity occupancy, not physical modes. $\Omega_{\mathrm{BE}}$, $n_i$, and $v_p$ are three distinct multiplicities. Bose theorems do not move MSC, QSBS, or the $\mathbb{F}_1$ pairing.

---

## 2. Gated Verification Matrix (S0–S5b)

| Gate ID | Requirement | Formal Metric | Observed Execution Status |
| :--- | :--- | :--- | :--- |
| **S0** | Lake Tree Build | Standalone build in `Foundry/lean` + manifested axioms/sorry | **PASSED (10/10 jobs; `bose_test` exits 0)** |
| **S1b** | General Bijection Proof | $\Psi(\Phi(\mathbf{n})) = \mathbf{n}$ across all states in $\mathcal{B}_{1..5, 3}$ | **PASSED (100% FTA-backed recovery)** |
| **S2** | $(C, F)$ Independence | $(3, 1, 1) \to (3/5, 3/5, 120)$ vs $(3, 2, 0) \to (3/5, 2/5, 72)$ | **PASSED (Proved Distinct)** |
| **S3** | Finite Euler Product | $Z_3(\beta=2.0) = \prod_{p \in \{2, 3, 5\}} (1 - p^{-2})^{-1} = 25/16 = 1.5625$ | **PASSED (Exact Interface; no $\zeta$ overclaims)** |
| **S4** | Leakage Firewall | Zero leakage into civic, on-chain finality, or open RH statements | **LOCKED & ACTIVE** |
| **S5b** | Map Table & Stop Rule | $1,770$ states analyzed ($E_{\log}$ vs $E_{\text{linear}}$ degeneracy lift) | **PASSED (Stop Rule Applied)** |

---

## 3. Mechanism Coordinates: $(C, F)$

$$\boxed{C(m) = \frac{\max_p v_p(m)}{\Omega(m)}}, \qquad \boxed{F(m) = \frac{\omega(m)}{\Omega(m)}}$$

- **Concentration ($C$):** Measures macroscopic accumulation onto a single prime mode ($C = 1 \iff m = p^N$).
- **Fragmentation ($F$):** Measures active support mode spread ($F \in [1/N, g/N]$).
- **Coordinate Independence Witness:**
  - $\mathbf{n}_A = (3, 1, 1) \implies C = 3/5, \; F = 3/5, \; \Phi = 120$
  - $\mathbf{n}_B = (3, 2, 0) \implies C = 3/5, \; F = 2/5, \; \Phi = 72$
  - **Result:** $C(\mathbf{n}_A) = C(\mathbf{n}_B)$, but $F(\mathbf{n}_A) \neq F(\mathbf{n}_B)$ and $\Phi(\mathbf{n}_A) \neq \Phi(\mathbf{n}_B)$.

---

## 4. Gate S5b Map Table & Energy Spectrum Comparison

Representative sample from the 1,770 total configurations ($g=3, N=1\dots 20$):

| State $\mathbf{n}$ | Prime Sig ($m$) | $C(m)$ | $F(m)$ | $E_{\log} = \ln m$ | $E_{\text{linear}} = \sum n_i \epsilon_i$ |
| :---: | :---: | :---: | :---: | :---: | :---: |
| $(5, 0, 0)$ | 32 | 1.000 | 0.200 | 3.4657 | 0 |
| $(0, 5, 0)$ | 243 | 1.000 | 0.200 | 5.4931 | 5 |
| $(0, 0, 5)$ | 3125 | 1.000 | 0.200 | 8.0472 | 10 |
| $(3, 1, 1)$ | 120 | 0.600 | 0.600 | 4.7875 | 3 |
| $(3, 2, 0)$ | 72 | 0.600 | 0.400 | 4.2767 | 2 |
| $(2, 2, 1)$ | 180 | 0.400 | 0.600 | 5.1930 | 4 |
| $(2, 0, 3)$ | 500 | 0.600 | 0.400 | 6.2146 | 6 |

### Stop-Rule Evaluation:
1. Under $E_{\text{linear}}$, physical degeneracies exist (e.g., $(3, 2, 0)$ and $(4, 0, 1)$ both evaluate to $E = 2$).
2. Under $E_{\log} = \ln m$, every configuration maps to a unique integer $m \in \mathbb{N}$ (degeneracy is strictly $1$ due to FTA linear independence over $\mathbb{Q}$).
3. **Verdict**: $E_{\log}$ is a non-degenerate algebraic coordinate indexing. No novel physical force or emergent thermodynamic phase is observed.
4. **Action**: Stop rule enforced. Encoding theorems are preserved as rigorous combinatorics; physical cosmology claims remain discarded.

---

## 5. Formal Tree References
- Core Definitions: `Foundry/lean/Multiplicity/Bose/Core.lean`
- Machine-Checked Proofs: `Foundry/lean/Multiplicity/Bose/Proofs.lean`
- Evaluated Instances: `Foundry/lean/Multiplicity/Bose/Examples.lean`
- Gated Runner: `Foundry/lean/Multiplicity/Bose/Test.lean`
- Lake target: `lake exe bose_test` (Exit Code 0).
