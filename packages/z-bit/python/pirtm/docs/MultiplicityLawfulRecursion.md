# Multiplicity Lawful Recursion (MLR) - Layer-II Spec Fragment

## 1. Ambient Multiplicity Space (H)
The ambient space for Layer-II evolution is defined as the tensor product of the prime-indexed sector, the continuous temporal sector, and the finite internal feature sector:

$$H := \ell^2(\mathbb{P}) \otimes L^2(\mathbb{R}) \otimes \mathbb{C}^d$$

where:
- $\ell^2(\mathbb{P})$ is the separable Hilbert space with basis $\{|p\rangle\}_{p \in \mathbb{P}}$ indexed by prime numbers.
- $L^2(\mathbb{R})$ represents the temporal/frequency support.
- $\mathbb{C}^d$ is the $d$-dimensional feature space.

## 2. Lawful Submanifold ($H_{lawful}$)
Evolution is constrained to a closed, convex submanifold defined by the fixed-point set of the composition of the Prime-Lawful Invariant Contract (PLIC) and the Ethical Projector ($P_E$):

$$H_{lawful} := \{ \psi \in H \mid \Pi_{CSL} \psi = \psi, P_E \psi = \psi \}$$

The composition $P_E \circ \Pi_{CSL}$ is assumed to be firmly nonexpansive under the **Compatibility Axiom**: the ethical viability kernel is invariant under the Prime-Lawful projection.

## 3. Channel-Resolved Update Rule
The discrete-time evolution of the multiplicity state $\psi_t$ follows the recursive law:

$$\psi_{t+1} = P_E \left[ \Pi_{CSL} \left( \psi_t + \sum_{p \in \mathbb{P}} \lambda_p (A_p(\psi_t) + B_p(\psi_t) + E_p(\psi_t, x_t)) \right) \right]$$

Where:
- $A_p, B_p, E_p$ are prime-indexed operators representing internal mixing, temporal convolution, and external coupling respectively.
- $\lambda_p$ is the channel-resolved multiplicity scalar: $\lambda_p \propto p^{-\sigma} \cdot \|A_p\|^{-1}$.

## 4. Contraction & Stability (The Multiplicity Limit)
Contraction is certified iff the supremum of the channel-wise Lipschitz bounds is strictly less than unity:

$$\sup_{p \in \mathbb{P}} \lambda_p (L_{A,p} + L_{B,p} + L_{E,p}) = c < 1$$

Under this condition, $\mathcal{F}: H_{lawful} \to H_{lawful}$ is a Banach contraction, ensuring a unique fixed point $\psi^*(x)$ and stable convergence of the MTPI stack.

## 5. Fock Embedding (Layer-II Bridge)
The transition to Layer-II introduces the second quantization of the multiplicity space:

$$\mathcal{F}(H) := \bigoplus_{n=0}^\infty \text{Sym}^n(H)$$

The canonical commutation relations (CCR) for the prime-indexed creators $a_p^\dagger$ and annihilators $a_p$ are:

$$[a_p, a_q^\dagger] = \delta_{pq} I, \quad [a_p, a_q] = [a_p^\dagger, a_q^\dagger] = 0$$

Divergence prevention is enforced by the Λ-stabilization of the number operator $\hat{N} = \sum a_p^\dagger a_p$, restricted to the lawful subspace $H_{lawful}$.
