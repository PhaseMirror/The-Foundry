<!-- LawfulRecursionVersion:1.0 -->
<!-- LawfulRecursionHash: 8167719f6b1d7b9ca6f0d463e9c8da4de84a5a1b5b9a5c15df684860b1d5b6e3 -->

# Corollary: The Free-α κ Schedule Is α := 4β, and α Is Absent From the Contraction Gate

**Fragment ID:** `KAPPA-DECAY-COROLLARY-001`
**Version:** 1.1 (4 October 2026)
**Supersedes:** fragment digest `2137aef57499521a76cf0a42524c29eff4b44d29f569da489201d9d94a816d8b` (v1.0). That digest is **retired**: v1.0 mis-attributed the relaxation-time inequality at L640 to the asymmetric-mass case, and omitted DEFECT-5 and DEFECT-7. Corrections are itemised in §8.
**Status:** Proposed — corollary recorded; **adoption blocked**. See §6 and DEFECT-1..DEFECT-7.
**Provenance:** this fragment exists only in the working tree of branch `adr/0139-lexlean-declared-submodule` (commit `cbb967ef`). It is **not on `main`** (tip `c7187410`) and **not on `PhaseMirror/The-Foundry`**. Nothing here is ratified. See §8.
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

**Corollary C-0 (relaxation time — symmetric-mass case only).** All of §2's relaxation-time algebra presupposes $H(\kappa)=2\kappa^2$, i.e. $m_1 = m_2$ and $\Delta(\kappa)=2\lvert\kappa\rvert$ (L584–586). In the asymmetric case the gap has a nonzero floor, so $H$ approaches a positive constant (L318) and **no** $t_{\alpha'}$ exists for $\alpha' < H_\infty/H(0)$; the boxed rate formula is undefined there, not merely loosened. Do not cite it for $m_1 \neq m_2$.

**Corollary C-0′ (the parent is internally inconsistent; both forms are anchored).** The parent states the relaxation time twice, with different relation symbols:

| Parent location | Relation | Context |
|---|---|---|
| Main text, L222 | $t_\alpha = \ln(1/\alpha)/(8\beta)$ | equality |
| Appendix B.3, L640 | $t_\alpha \ge \ln(1/\alpha)/(8\beta)$ | inequality |

Both are on tree. Since $H(t)$ is strictly decreasing in $t$ for $\beta>0$, $\kappa_0>0$, the *boundary* — the first time the condition is attained — is the equality, and the *admissible set* $\{t : H(t)\le\alpha H(0)\}$ is $[\,t_\alpha,\infty)$ with the same $t_\alpha$, i.e. the inequality. Neither symbol is wrong; the parent simply never reconciles them, and DEFECT-6 records the drift. The distinction matters for a reader who treats the appendix's $\ge$ as a reportable lower bound and compares it against an independently measured crossing time.

Corollary (rate-normalized relaxation time). With $H(t) = 2\kappa_0^2 e^{-8\beta t}$ (L629–631) and the condition $H(t_{\alpha'}) \le \alpha' H(0)$ for $0<\alpha'<1$ (L632–638), the boundary time is $t_{\alpha'} = \ln(1/\alpha')/(8\beta)$. Substituting $\alpha := 4\beta$ eliminates β:

$$\boxed{\;t_{\alpha'} = \frac{\ln(1/\alpha')}{2\alpha}\;}$$

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
3. The relaxation time (§2, Corollary C-0) is the only quantity α genuinely controls, and it exists in the symmetric-mass case only. In the asymmetric case $H\to H_\infty>0$ (L318) and there is no $t_{\alpha'}$; the formula is undefined, not relaxed.
4. α does not appear in $c$, in the margin $M(1-\kappa_0)$, or in the admissibility condition $t_{\alpha'}$. Every one of those is a function of the shape constant $M$ and the initial gain $\kappa_0$ alone.

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
| DEFECT-5 | `certify_constants.rs` doc comment states the commutator bound as $C\le 2.71$ (L8) while the enforced constant is `C_MAX = 4.0` (L26); the gate at L132 and the test at L234 both check against 4.0. Compounding this, the quantity being certified is scaled to meet the threshold it is checked against (`H_SCALE = 0.02`, L151, "adjusted to meet C_MAX"; L217 "modest grid size to keep the commutator norm within C_MAX"), so the certification is circular and the documented 2.71 is unenforced in either code or test | `certify_constants.rs:8, 26, 132, 151, 217, 234` |
| DEFECT-6 | The parent note states its relaxation time three times, with both relation symbols: equality at main-text L222 ($t_\alpha=\ln(1/\alpha)/(8\beta)$) and again at L644 ($t_{95}=\ln20/(8\beta)$), inequality at appendix L640 ($t_\alpha\ge\ln(1/\alpha)/(8\beta)$), never reconciled. All three derive from the same symmetric-mass $H=2\kappa^2$. A downstream reader cannot tell whether $t_\alpha$ is a boundary or a bound without re-deriving the monotonicity of $H$. Not a mathematical error; an unreconciled-duplication defect that will propagate into any α := 4β citation | `templateArxiv.tex:222, 640, 644` |
| DEFECT-7 | `certify_commutator`'s doc comment states its **spectral norm** is computed (L126); L131 computes `sqrt(sum of all squared entries)`, the **Frobenius** norm. Since $\lVert A\rVert_F \ge \lVert A\rVert_{\mathrm{op}}$, the mismatch is *conservative* for the pass/fail gate — it cannot accept a matrix the spectral norm would reject — but the returned `f64` is not the quantity the doc names, and L8's "commutator norm" is likewise unlabelled. Any consumer comparing this value against a spectral-norm budget is comparing incommensurable quantities. Compounds DEFECT-5: the gate is a loose upper bound, checked against an unenforced 4.0, on a quantity scaled to pass it | `certify_constants.rs:8, 126, 131` |

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

---

## 8. Corrections to v1.0, and the standing of this fragment

### 8.1 Corrections applied

| # | v1.0 said | v1.1 says |
|---|---|---|
| 1 | §2 attributed the appendix inequality at L640 to "the asymmetric-mass case where the gap has a floor (L318)" | **Wrong attribution.** L640 sits in appendix B.3, which follows B.1's symmetric-mass heading and derives from $H(\kappa)=2\kappa^2$. The asymmetric remark at L318 is a separate statement in §3.4 and concerns the *existence* of a relaxation time, not its sign. Corrected via Corollary C-0 and consequence 3 of §3. |
| 2 | §2 presented $t_{\alpha'}\ge\ln(1/\alpha')/(2\alpha)$ as the parent's single form | The parent is internally inconsistent: equality at main-text L222, inequality at appendix L640. Both are on tree. The boundary time is the equality. Corrected via Corollary C-0′, with the drift recorded as part of DEFECT-5. |
| 3 | §4 prose read "Identical at commit `c7187410` and at current HEAD `8a0b6d9a`" with no method stated | Retained, and now bounded precisely. `git diff c7187410 8a0b6d9a -- packages/rust/pirtm-monitor/src/lib.rs packages/rust/engine/src/wasm_api.rs` is empty. `8a0b6d9abec1d954c6204af5d57485227936bc33` is a real object in this checkout and an ancestor of HEAD, so the diff is reproducible **here**. It is **not** on `main` (`git merge-base --is-ancestor 8a0b6d9a main` fails), so the row remains a local-only claim: no one with only `main` or only `PhaseMirror/The-Foundry` can rerun it. |
| 4 | No DEFECT-5 | Added: `certify_constants.rs` documents $C\le 2.71$ (L8), enforces `C_MAX = 4.0` (L26, L132, L234), and scales the certified quantity to meet the threshold it is checked against (L151, L217). |
| 5 | Header made no claim about branch placement | Header now states the fragment is confined to branch `adr/0139-lexlean-declared-submodule` and absent from `main`. |
| 6 | §4 gave the remote name as `origin` | The only remote in this clone is named **`The-Foundry`** (`.git/config` → `[remote "The-Foundry"]`, url `https://github.com/PhaseMirror/The-Foundry.git`). `git remote get-url origin` returns `No such remote 'origin'`. Branch sections in `.git/config` resolve through `remote = The-Foundry`. Corrected in §8.1 row 3 and in §8.3. |
| 7 | DEFECT-6 cited two on-tree forms | The parent states relaxation time three times, not twice: equality at L222 **and** L644, inequality at L640. |
| 8 | No DEFECT-7 | Added: `certify_commutator` documents a spectral norm (L126) and computes a Frobenius norm (L131). Conservative in direction, mislabelled in identity. |

### 8.2 What the v1.0 digest did and did not establish

Digest `2137aef57499521a76cf0a42524c29eff4b44d29f569da489201d9d94a816d8b` is **retired**. It attests to the v1.0 text only, and that text carried corrections 1 and 4 above. Any external record citing `2137aef5…` must be re-pointed at the current sidecar digest.

Two further limits on what any digest of this fragment can mean:

- It is verifiable only against the working tree of `adr/0139-lexlean-declared-submodule`. It is not reproducible from `main`, whose tip is `c7187410`, nor from any Drive-linked view, which does not contain this path.
- A content hash attests to *bytes*, never to adoption. §6's non-authorization clause and the `Proposed` status survive every digest recomputation. Landing this file on `main` discharges none of DEFECT-1…DEFECT-7 and creates no authority to substitute a decaying κ into `λ_p`.

### 8.3 Where each anchor is verifiable

| Anchor | Verifiable from |
|---|---|
| This fragment's bytes (`Governance/docs/Kappa-Decay-Corollary.md`) | this working tree only — branch `adr/0139-lexlean-declared-submodule` |
| Fragment digest | same; **not** from `main` (`git ls-tree main -- …` empty), **not** from `The-Foundry/main` |
| `c7187410` code facts (`pirtm-monitor`, `engine`) | `main`, `The-Foundry/main`, and this tree |
| `8a0b6d9a` and the zero-line `c7187410..8a0b6d9a` diff | this working tree only; not on `main` |
| `templateArxiv.tex` L222/L318/L584–626/L640/L644 | any tree containing the note — symmetric-mass derivation, independent of all branch claims |
| `Ξ-Constitutional-Core.md` digest `8167719f…` | any tree containing it; `Governance/Archive_and_Drafts/` copy is byte-identical |

The parent note's relaxation-time algebra is the one load-bearing claim in this fragment that is **not** branch-dependent, and it is the part that survives independent checking.