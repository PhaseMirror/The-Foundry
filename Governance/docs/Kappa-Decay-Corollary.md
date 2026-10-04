<!-- LawfulRecursionVersion:1.0 -->
<!-- LawfulRecursionHash: 8167719f6b1d7b9ca6f0d463e9c8da4de84a5a1b5b9a5c15df684860b1d5b6e3 -->

# Corollary: The Free-α κ Schedule Is α := 4β, and α Is Absent From the Contraction Gate

**Fragment ID:** `KAPPA-DECAY-COROLLARY-001`
**Version:** 1.0 (4 October 2026)
**Status:** Proposed — corollary recorded; **adoption blocked**. See §6 and DEFECT-1..DEFECT-4.
**Type:** Derived corollary of an on-tree note. Amends nothing in the parent fragment.
**Parent fragment:** `Governance/docs/Ξ-Constitutional-Core.md` (LawfulRecursionVersion 1.0, 16 April 2026)
**Derived from:** `Governance/publications/Endogenous Spectral Self-Regulation in Tensor-Extended DAEs/templateArxiv.tex` (5 May 2026)

**Verifiable Anchor Command (parent fragment)**
`sha256sum Governance/docs/Ξ-Constitutional-Core.md`
**Output:** `8167719f6b1d7b9ca6f0d463e9c8da4de84a5a1b5b9a5c15df684860b1d5b6e3`

This fragment's own digest is the sidecar `Governance/docs/Kappa-Decay-Corollary.md.sha256`, verifiable with `sha256sum -c`. The digest is deliberately *not* embedded in this file; a self-referential in-file digest cannot be verified.

---

## 1. Claim under adjudication

A free-α schedule

$$\kappa(t) = \kappa_0\,e^{-\alpha t}$$

is quoted as a named object. It is not one. The Drive binds only the Lyapunov specialization of the 5 May 2026 note, whose exponent is not a free parameter. This fragment discharges the discrepancy: **α := 4β**, with β the gradient-descent gain on the gap Lyapunov function, and states the contraction check against the static κ budget.

---

## 2. Derivation of α := 4β (parent: 5 May note)

On-tree anchors, `.../Endogenous Spectral Self-Regulation in Tensor-Extended DAEs/templateArxiv.tex`:

| Step | Statement | Anchor |
|---|---|---|
| Lyap. candidate | $H(\Delta) := \tfrac12\Delta^2$ | L579–581 |
| Symmetric-mass substitution | $\Delta(\kappa) = 2\lvert\kappa\rvert \Rightarrow H(\kappa) = 2\kappa^2$ | L584–586 |
| Gradient | $\partial H/\partial\kappa = 4\kappa$ | L598–599 |
| Feedback law | $\dot\kappa = -\beta\,\partial H/\partial\kappa = -\beta\cdot 4\kappa = -4\beta\kappa$ | L600–603, restated L594, L310 |
| Closed form | $\kappa(t) = \kappa_0\,e^{-4\beta t}$ | L624–626, restated L203, L312 |
| Lyapunov decrease (Prop. B.1) | $\dot H = 4\kappa\cdot(-4\beta\kappa) = -16\beta\kappa^2 \le 0$, equality iff $\kappa = 0$ | L605–620 |

The factor **4** is not a tuning constant. It is $\partial H/\partial\kappa = 4\kappa$, i.e. the *twice-the-gap* derivative of the symmetric-mass case. Therefore the schedule's rate is pinned:

$$\boxed{\;\alpha := 4\beta\;}$$

Corollary (rate-normalized relaxation time). With $H(t) = 2\kappa_0^2 e^{-8\beta t}$ (L629–631), the time to reach $H(t_\alpha') \le \alpha' H(0)$ for $0<\alpha'<1$ is, from L632–641, $t_{\alpha'} \ge \ln(1/\alpha')/(8\beta)$. Substituting $\alpha := 4\beta$ eliminates β:

$$\boxed{\;t_{\alpha'} \ge \frac{\ln(1/\alpha')}{2\alpha}\;}$$

The relaxation time is a function of the *rate* alone. β and α carry no independent content: any claim of the form "tune β for the timescale" and "tune α for the timescale" is the same claim, and dropping the $4\beta$ derivation deletes the gap Lyapunov that is the sole justification for the decay.

---

## 3. Contraction check against the static κ budget

Parent fragment §4 (`Ξ-Constitutional-Core.md:31–35`) binds κ as a **static** global safety factor:

$$\lambda_p = \kappa\,p^{-\sigma}\,\lVert A_p\rVert^{-1},\qquad 0 < \kappa < 1,$$
$$\sup_{p}\ \lambda_p\left(L_{A,p}+L_{B,p}+L_{E,p}\right) = c < 1 .$$

Write $L_p := L_{A,p}+L_{B,p}+L_{E,p}$ and define the κ-independent, α-independent **shape constant**

$$M := \sup_{p \in \mathcal{P}}\ p^{-\sigma}\, L_p\, \lVert A_p\rVert_{\mathrm{op}}^{-1},$$

the same supremum that the parent proof document defines as `M` at `Governance/multiplicity/Multiplicity_Lawful_Recursion.tex:585–589` (in its stricter fixed-point normalization, with a leading `1 +`). Then for a static κ, $c = \kappa M$, and the lemma at LRN:574–596 discharges the gate as $\kappa < 1/M$.

Now substitute the decaying schedule, $\kappa(t) = \kappa_0 e^{-\alpha t} = \kappa_0 e^{-4\beta t}$:

$$c(t) = \kappa(t)\,M = \kappa_0\,M\,e^{-4\beta t}.$$

**Corollary C-1 (α-independence of the contraction gate).** For $\beta > 0$ (hence $\alpha = 4\beta > 0$) and $\kappa_0 \ge 0$,

$$\sup_{p}\ \lambda_p(t)\,L_p < 1 \quad \forall\, t \ge 0 \quad\Longleftrightarrow\quad \kappa_0\,M < 1 .$$

*Proof.* $c(t) = \kappa_0 M e^{-4\beta t}$ is nonincreasing in $t$ with $\sup_{t\ge 0} c(t) = c(0^+) = \kappa_0 M$. $\square$

**Corollary C-2 (the decay never relaxes the budget).** For $\beta > 0$, $c(t) \le c(0^+)$ for all $t\ge 0$, with strict inequality for $t>0$ whenever $\kappa_0 M > 0$. The decaying schedule is therefore *never* more contractive than its own $t=0$ snapshot and relaxes monotonically toward it. Concretely, with $\rho_{\text{Lyap}} := \kappa(t)/\kappa_0$:

$$\sup_{t\ge0}\ \lambda_p(t)L_p \;=\; \kappa_0 M, \qquad \text{margin} \;=\; M\,(1-\kappa_0),$$

and **α appears in neither expression.**

**Corollary C-3 (α is a recovery parameter, not a stability parameter).** Under $\alpha := 4\beta$, the parent gate `sup_p λ_p L_p < 1` is fully determined by the pair $(\kappa_0, M)$. The rate α controls only *how fast* the schedule relaxes from $\kappa_0 M$ toward 0, i.e. only the time-to-steady-state at fixed, already-satisfied margin. Increasing α makes the transient steeper; it cannot create margin. **No choice of α can compensate for $\kappa_0 M \ge 1$.**

Consequences for the governance surface:

1. Any schedule of the form $\kappa_0 e^{-\alpha t}$ is admissible for the parent gate **iff** its $t=0$ value passes the static gate. The gate is checked at $t=0$ and nowhere else.
2. A decaying κ is therefore *governed by*, and adds nothing to, the static $0<\kappa<1$ budget. It is not a relaxation of §4; it is a restatement of it plus a decay.
3. The relaxation time (§2) is the only quantity α genuinely controls, and it is bounded below by the parent's own value (L640), which the parent writes as an inequality for the asymmetric-mass case where the gap has a floor (L318).

---

## 4. On-tree executable, as measured

`packages/rust/pirtm-monitor/src/lib.rs`, crate `pirtm-monitor`. Identical at commit `c7187410` and at current HEAD `8a0b6d9a`.

```rust
// L25–26
pub const KAPPA0: f64 = 1.0;
pub const ALPHA: f64  = 0.1;

// L86–90
pub fn compute_kappa(&mut self) -> f64 {
    let elapsed = self.start_time.elapsed().as_secs_f64();
    self.kappa_current = self.config.kappa0 * (-self.config.alpha * elapsed).exp();
    self.kappa_current
}

// L92–96
pub fn apply_gain(&mut self, raw_rho: f64) -> f64 {
    let kappa = self.compute_kappa();
    let attenuated = raw_rho * (1.0 - kappa).max(0.0);
    attenuated.max(0.0)
}
```

This is exactly $\kappa(t)=\kappa_0 e^{-\alpha t}$, open-loop on wall-clock time, with `start_time: Instant::now()` set in `ZenoController::new` (L81).

**Finding α is unbound.** The crate contains **zero** occurrences of `beta` (`grep -rni beta packages/rust/pirtm-monitor/src/` → no matches). The only parent of `ALPHA = 0.1` would be β, and β is absent. Formally $\alpha := 4\beta$ would require $\beta = 0.025\ \mathrm{s}^{-1}$ to be *declared and justified*; today `ALPHA` is a bare float literal with no $H$, no $\partial H/\partial\kappa$, and no Lyapunov certificate.

**Finding κ₀ = 1.0 is outside the budget.** `KAPPA0 = 1.0` gives $\kappa(0^+) = 1 \notin (0,1)$, so the parent fragment's `0 < κ < 1` is violated at every process start. By Corollary C-1 the gate becomes $\kappa_0 M < 1 \iff M < 1$: the safety factor contributes **exactly zero margin**, and the monitor's contractivity rests entirely on the unaudited $M$. By Corollary C-3, $\alpha = 0.1$ does not repair this.

**Finding the decay direction is anti-monotone.** `apply_gain` multiplies by $(1-\kappa(t))^{+}$, which *increases* toward 1 as $\kappa$ decays. Measured consequences at $\alpha = 0.1$, $\kappa_0 = 1.0$:

| $t$ (s) | $\kappa(t)=e^{-0.1t}$ | attenuation $1-\kappa$ | $\rho_{\text{attenuated}}$ at $\rho=1.2$ |
|---|---|---|---|
| 0 | 1.000 | 0.000 | 0.000 |
| 6.93 | 0.500 | 0.500 | 0.600 |
| 11.51 | 0.316 | 0.684 | 0.821 |
| 23.03 | 0.100 | 0.900 | 1.080 |
| $\infty$ | 0.000 | 1.000 | 1.200 |

The gain therefore ramps the ρ kill-gate (`rho_halt = 1.0`, L22, L168) monotonically in wall-clock time, independent of measured drift. The consequence is not that the monitor becomes more or less conservative on average, but that **gate sensitivity is a function of uptime rather than of measured state**: at $t=0^+$ every $\rho$, including $\rho \ge \rho_{\text{halt}}$, is multiplied to 0 and silently suppressed; the same magnitude at $t \approx 23.03$ s is passed through at 90% and trips the halt. Identical drift magnitudes receive opposite verdicts depending only on when they occur. ADR-003 characterizes the same code as a gain that "attenuates drift" and states "the Zeno gain ensures that small drifts are naturally suppressed over time" (`docs/adr/completed/ADR-003-ward-monitor-zeno-finton.md:13, 25`); the executed form suppresses *all* drift for the first seconds, then admits it back toward the raw value, so it distinguishes neither small drift from large, nor drift from fault.

**Finding restart resets the schedule.** `start_time: Instant::now()` (L81) means any process restart returns $\kappa$ to $\kappa_0 = 1.0$ and restarts the release ramp from zero attenuation. A restart is thus the only mechanism that re-arms total suppression, so a fault that escalated to a visible kill late in one run is silently hidden by the next restart.

---

## 5. Excluded and not-claimed

- The Sedona Spine form $\kappa(t)=\kappa_0\exp(-1/\min_k\lvert\rho_k-\Im(\log\langle M\rangle)\rvert)$ (`packages/rust/materia_commons/sedona-spine/Sedona Spine.tex`) is **state-dependent**, not wall-clock decay. It is not the schedule of §2 and this fragment makes no claim about it.
- The entropy-adaptive $\kappa(t)$ via $\Psi(H_\pi)$ (`packages/z-bit/docs/ADR Scaffold_ ZRSD + PWEH Research.md`) is **not** an exponential schedule. Excluded.
- ADR-003's $\kappa(t)=\kappa_0 e^{-\alpha t}$ (`:13`) is a **runtime drift-attenuation gain in a different subsystem** from the parent fragment's per-channel spectral safety factor. The two share the letter κ and are never composed in any on-tree document. This fragment does not merge them.
- No per-channel $L_p$, no $\lVert A_p\rVert$, and no $p^{-\sigma}$ exist in `pirtm-monitor`. The gate at L124 is driven by a provider-supplied scalar `ManifoldState::lambda_l_product`, not recomputed from κ. **The monitor therefore cannot discharge `sup_p λ_p(t) L_p < 1` at all**; §3 is a proof about a schedule the crate does not yet feed into the spectral budget.
- `ALPHA = 0.1` (`lib.rs:26`) and `ALPHA_MIN = 0.103` (`certify_constants.rs:23`, a certified quadrature floor for an unrelated compact integral) are distinct quantities sharing one name in one crate, with the decay rate sitting below the certified floor. Recorded as a collision hazard; no relation between them is asserted.
- No run was executed. Every number in §4 is closed-form evaluation of the source expression at the source constants, plus the on-tree constant values. The sole `κ`-touching test, `test_zeno_compute_kappa_decays` (L308–316), asserts only $k_2 < k_1$ after a 100 ms sleep and certifies no rate, no budget, and no restart behaviour.

---

## 6. Defects and conditions precedent to adoption

| ID | Defect | Evidence |
|---|---|---|
| DEFECT-1 | `KAPPA0 = 1.0` violates `0 < κ < 1` at $t=0^+$; by C-1 the gate degenerates to $M < 1$ with zero κ margin | `lib.rs:25`; Core:29 |
| DEFECT-2 | `ALPHA` is unbound: no β, no $H$, no Lyapunov certificate; $\alpha := 4\beta$ is unbacked | `lib.rs:26`; zero `beta` matches in crate |
| DEFECT-3 | `apply_gain`'s $(1-\kappa)^{+}$ is anti-monotone in the decay: gate sensitivity tracks uptime, not measured drift, so equal drift magnitudes get opposite verdicts by time | `lib.rs:92–96`, §4 table |
| DEFECT-4 | Restart resets $\kappa \to \kappa_0$, re-arming total suppression and hiding faults escalated late in the prior run | `lib.rs:81` |

Adoption of any decaying κ requires **all** of the following, none of which this fragment supplies:

1. $\kappa_0$ declared in $(0,1)$ and certified against $M$ so that $\kappa_0 M < 1$ with recorded margin $M(1-\kappa_0) > 0$ — closing DEFECT-1.
2. A declared, sourced β (equivalently $\alpha := 4\beta$) with its $H$ and $\partial H/\partial\kappa$ on tree, so the decay is a gradient flow and not a literal — closing DEFECT-2.
3. A resolved attenuation direction: either $\kappa$ enters as a multiplier on the spectral budget as the parent §4 intends, or the uptime ramp is removed in favour of a measured-state gate — closing DEFECT-3.
4. Restart-continuity or explicit, logged re-arm semantics — closing DEFECT-4.
5. A per-channel ledger carrying $(\lambda_p, L_p, \lambda_p L_p)$ for each p, digested into a `LawfulRecursionHash`, per Core §7 (`Ξ-Constitutional-Core.md:58, 65`).
6. A new `LawfulRecursionVersion` (> 1.1) with a recomputed parent `LawfulRecursionHash`, since the parent fragment is declared immutable (Core:4).
7. An ADR reconciling ADR-MC-001's `stability_constants: Λ_m and α` (`docs/adr/completed/ADR-MC-001-Manifest.md:17`) with the parent fragment's κ and σ — a live vocabulary mismatch that blocks any Cell manifest carrying a decay rate.

**Non-authorization.** Until conditions 1–7 are met, no Cell, manifest, or ledger entry may bind a decaying κ to `λ_p`, and no change to `pirtm-monitor` may be represented as discharging `sup_p λ_p(t) L_p < 1`.

---

## 7. Anchor drift observed while writing this fragment (not repaired here)

- `Governance/docs/MOC.md:2,11,12` claims `LawfulRecursionHash: 099c79aa1d5f5435c93d3dcd0c2bc83264c9da488861258a47b8feb73648c194` for the parent fragment. The actual digest of `Governance/docs/Ξ-Constitutional-Core.md` is `8167719f6b1d7b9ca6f0d463e9c8da4de84a5a1b5b9a5c15df684860b1d5b6e3`. **MOC's anchor does not verify.**
- MOC's anchor command `cat multiplicity/Ξ-Constitutional-Core.md | sha256sum` names a path that does not exist on tree.
- `Governance/docs/Ξ-Constitutional-Core.md:5` and its byte-identical copy `Governance/Archive_and_Drafts/Ξ-Constitutional-Core.md:5` both carry `**LawfulRecursionHash:** [computed on commit]`, a placeholder that `packages/multiplicity-crypto/docs/ADR-074-LawfulRecursionHash.md:30` (Status: Accepted) forbids shipping.
- A third byte-identical copy exists at `packages/rust/apex/apex-goldilocks/docs/governance/Ξ-Constitutional-Core.md`; no hash pins any of the three.

Recorded here so that this fragment's own anchor is not mistaken for a repair of those. Repair is a separate change against a separate owner.