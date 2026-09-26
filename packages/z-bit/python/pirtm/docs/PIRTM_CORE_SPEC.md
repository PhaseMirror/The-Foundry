<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# draft that one-page PIRTM-Core spec in this ultra-strict mode (zero non-math nouns) so you have a concrete template to work from.

Here is a **one-page, Layer-I-only PIRTM-Core spec**: only spaces, maps, Λₘ, and the contraction result. No physics, no cognition, no semantics.[^1]

***

## PIRTM-Core: Prime-Indexed Recursive Tensor Mathematics (Formal Layer Only)

### 1. Basic objects

Let:

- $\mathbb{P}$ denote the set of prime numbers.
- For each $p \in \mathbb{P}$, let $e_p$ be a basis element of a separable Hilbert space $H_P$ with inner product $\langle \cdot, \cdot \rangle_{H_P}$.
- Let $H_T$ be a separable Hilbert space (for example, $L^2(\mathbb{R})$ or $\ell^2(\mathbb{Z})$).
- Let $H_F = \mathbb{C}^d$ for some fixed $d \in \mathbb{N}$.

Define the **multiplicity space**:

$$
\mathcal{H} := H_P \widehat{\otimes} H_T \widehat{\otimes} H_F,
$$

equipped with the Hilbert norm $\|\cdot\|$ induced by the tensor product.[^1]

Let $\mathcal{X}$ be a Banach space of inputs with norm $\|\cdot\|_{\mathcal{X}}$.

### 2. Prime-indexed operators

For each $p \in \mathbb{P}$, let $A_p : \mathcal{H} \to \mathcal{H}$ be a bounded linear operator. Assume:

- There exists a sequence $(\alpha_p)_{p \in \mathbb{P}} \subset [0, \infty)$ such that

$$
\|A_p\| \le \alpha_p \quad \forall p \in \mathbb{P},
$$

and

$$
\sum_{p \in \mathbb{P}} \alpha_p < \infty.
$$

Define the **multiplicity operator**:

$$
M := \sum_{p \in \mathbb{P}} A_p,
$$

which is well-defined and bounded on $\mathcal{H}$ by the above convergence condition.

Let $B : \mathcal{H} \times \mathcal{X} \to \mathcal{H}$ be a map that is linear in its first argument and measurable in its second argument.

Define the **prime-indexed recursive operator**:

$$
G(\Psi, x) := M\Psi + B(\Psi, x),
\quad
(\Psi, x) \in \mathcal{H} \times \mathcal{X}.
$$

### 3. Λₘ–governed update

Let $\Lambda_m \in \mathbb{R}$ be a scalar parameter. Define the **Λₘ–update map**:

$$
T_{\Lambda_m}(\Psi, x)
:=
(1 - \Lambda_m)\,\Psi + \Lambda_m\, G(\Psi, x),
\quad
(\Psi, x) \in \mathcal{H} \times \mathcal{X}.
$$

We view the recursion

$$
\Psi_{t+1} = T_{\Lambda_m}(\Psi_t, x_t),
\quad t = 0, 1, 2, \dots,
$$

as the PIRTM-Core evolution on $\mathcal{H}$ driven by a sequence $(x_t)$ in $\mathcal{X}$.

### 4. Stability assumptions

We impose the following **Lipschitz condition** on G:

- There exists a constant $L_G \in [0, 1)$ such that for all $\Psi_1, \Psi_2 \in \mathcal{H}$ and all $x \in \mathcal{X}$,

$$
\|G(\Psi_1, x) - G(\Psi_2, x)\|
\le
L_G \,\|\Psi_1 - \Psi_2\|.
$$

In particular, since $G(\Psi, x) = M\Psi + B(\Psi, x)$, this implies a bound on the operator norm of M plus the contribution from B.[^1]

We choose $\Lambda_m \in (0, 1]$. Define

$$
c(\Lambda_m) := (1 - \Lambda_m) + \Lambda_m L_G
= 1 - \Lambda_m(1 - L_G).
$$

Then $c(\Lambda_m) < 1$ for all such $\Lambda_m$.

### 5. Λₘ contraction theorem (PIRTM-Core)

**Theorem (Λₘ contraction).**
Let $\mathcal{H}$, $\mathcal{X}$, M, B, G, and $T_{\Lambda_m}$ be as defined above, and assume the Lipschitz condition on G with $L_G < 1$. Let $\Lambda_m \in (0, 1]$. Fix any $x \in \mathcal{X}$ and consider the map

$$
T_{\Lambda_m}^x : \mathcal{H} \to \mathcal{H}, \quad
T_{\Lambda_m}^x(\Psi) := T_{\Lambda_m}(\Psi, x).
$$

Then:

1. $T_{\Lambda_m}^x$ is a contraction on $\mathcal{H}$ with contraction constant $c(\Lambda_m) = 1 - \Lambda_m(1 - L_G) < 1$.
2. There exists a unique $\Psi^\ast(x) \in \mathcal{H}$ such that

$$
\Psi^\ast(x) = T_{\Lambda_m}^x(\Psi^\ast(x)).
$$
3. For any initial $\Psi_0 \in \mathcal{H}$, the sequence defined by

$$
\Psi_{t+1} = T_{\Lambda_m}^x(\Psi_t),
$$

satisfies

$$
\|\Psi_t - \Psi^\ast(x)\|
\le
c(\Lambda_m)^t \,\|\Psi_0 - \Psi^\ast(x)\|,
\quad t = 0, 1, 2, \dots.
$$

*Proof (outline).*
For any $\Psi_1, \Psi_2 \in \mathcal{H}$,

$$
\begin{aligned}
\|T_{\Lambda_m}^x(\Psi_1) - T_{\Lambda_m}^x(\Psi_2)\|
&=
\|(1 - \Lambda_m)(\Psi_1 - \Psi_2) + \Lambda_m( G(\Psi_1, x) - G(\Psi_2, x) )\| \\
&\le
(1 - \Lambda_m)\|\Psi_1 - \Psi_2\|
+ \Lambda_m L_G \|\Psi_1 - \Psi_2\| \\
&=
c(\Lambda_m)\|\Psi_1 - \Psi_2\|.
\end{aligned}
$$

Thus $T_{\Lambda_m}^x$ is a contraction with constant $c(\Lambda_m) < 1$. Since $\mathcal{H}$ is complete, Banach’s fixed point theorem gives uniqueness of $\Psi^\ast(x)$ and exponential convergence of the iterates. ∎

***

If you want, we can next add **one purely algebraic example** (e.g., finite-dimensional $\mathcal{H}$ with diagonal A_p) that instantiates this spec without invoking any non-mathematical vocabulary.

<div align="center">⁂</div>

[^1]: Multiplicity-Machine-Learning-Inventory.pdf

