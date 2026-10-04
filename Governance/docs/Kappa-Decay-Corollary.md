<!-- LawfulRecursionVersion:1.0 -->
<!-- LawfulRecursionHash: 8167719f6b1d7b9ca6f0d463e9c8da4de84a5a1b5b9a5c15df684860b1d5b6e3 -->

# Corollary: The Free-α κ Schedule Is α := 4β, and α Is Absent From the Contraction Gate

**Fragment ID:** `KAPPA-DECAY-COROLLARY-001`
**Version:** 2.0 (4 October 2026) — settled write
**Status:** **Proposed. Adoption blocked.**
**Parent fragment:** `Governance/docs/Ξ-Constitutional-Core.md` (LawfulRecursionVersion 1.0, 16 April 2026)
**Derived from:** `Governance/publications/Endogenous Spectral Self-Regulation in Tensor-Extended DAEs/templateArxiv.tex` (5 May 2026)
**Amends the parent fragment:** no.

**Verifiable Anchor Command (parent fragment)**
`sha256sum Governance/docs/Ξ-Constitutional-Core.md`
**Output:** `8167719f6b1d7b9ca6f0d463e9c8da4de84a5a1b5b9a5c15df684860b1d5b6e3`

> ## NON-AUTHORIZATION
> Until conditions 1–8 of §7 are met, **no Cell, manifest, or ledger entry may bind a decaying κ to `λ_p`**, and no change to `pirtm-monitor` may be represented as discharging `sup_p λ_p(t) L_p < 1`.
> Landing this file on `main` discharges none of DEFECT-1…DEFECT-8 and creates no authority to substitute a decaying κ into `λ_p`.
> A content hash attests to bytes. It never attests to adoption.

**Provenance.** This fragment exists only in the working tree of branch `adr/0139-lexlean-declared-submodule` (commit `cbb967ef`). It is **not on `main`** (`git ls-tree main -- Governance/docs/Kappa-Decay-Corollary.md` is empty; `main`'s tip is `c7187410`) and **not on `PhaseMirror/The-Foundry`**. Every claim anchored to that branch is a local claim. Three superseded drafts of this fragment carried digests `2137aef5…`, `bbf0e507…`, and `7d0f0a21…`; none is a settled artifact, and the latter two are not recoverable from this tree. This write carries exactly one digest, recorded in the sidecar `Kappa-Decay-Corollary.md.sha256` and verifiable with `sha256sum -c` from the repository root. The digest is deliberately not embedded here; a self-referential in-file digest cannot be verified.

---

## 1. The claim under adjudication

A free-α schedule

$$\kappa(t) = \kappa_0\,e^{-\alpha t}$$

is quoted as a named object. It is not one. The governing fragment binds only the Lyapunov specialization of the 5 May 2026 note, whose exponent is not a free parameter. This fragment discharges the discrepancy: **α := 4β**, with β the gradient-descent gain on the gap Lyapunov function, together with a contraction check against the static κ budget.

---

## 2. Derivation of α := 4β

On-tree anchors in `.../Endogenous Spectral Self-Regulation in Tensor-Extended DAEs/templateArxiv.tex`:

| Step | Statement | Anchor |
|---|---|---|
| Lyapunov candidate | $H(\Delta) := \tfrac12\Delta^2$ | L579–581 |
| Symmetric-mass substitution | $\Delta(\kappa) = 2\lvert\kappa\rvert \Rightarrow H(\kappa) = 2\kappa^2$ | L584–586 |
| Gradient | $\partial H/\partial\kappa = 4\kappa$ | L598–599 |
| Feedback law | $\dot\kappa = -\beta\,\partial H/\partial\kappa = -\beta\cdot 4\kappa = -4\beta\kappa$ | L600–603, restated L594, L310 |
| Closed form | $\kappa(t) = \kappa_0\,e^{-4\beta t}$ | L624–626, restated L203, L312 |
| Lyapunov decrease (Prop. B.1) | $\dot H = 4\kappa\cdot(-4\beta\kappa) = -16\beta\kappa^2 \le 0$, equality iff $\kappa = 0$ | L605–620 |

The factor **4** is not a tuning constant. It is $\partial H/\partial\kappa = 4\kappa$, the twice-the-gap derivative of the symmetric-mass case. The rate is therefore pinned:

$$\boxed{\;\alpha := 4\beta\;}$$

Any claim of the form "tune β for the timescale" and "tune α for the timescale" is the same claim. Dropping the $4\beta$ derivation deletes the gap Lyapunov that is the sole justification for the decay.

### 2.1 The relaxation time, and where it does not exist

**Corollary C-0 (symmetric-mass case only).** All relaxation-time algebra presupposes $H(\kappa)=2\kappa^2$, i.e. $m_1 = m_2$ (L584–586). In the asymmetric case the gap has a nonzero floor, so $H$ approaches a positive constant $H_\infty > 0$ (L318); **no finite $t_{\alpha'}$ exists** once $\alpha' H(0) < H_\infty$. The formula is undefined there, not merely loosened. Do not cite it for $m_1 \neq m_2$.

**Corollary C-0′ (the parent states this five times, across four locations, with both relation symbols).**

| Parent location | Verbatim | Relation | Reading |
|---|---|---|---|
| Main text, L223 | `t_\alpha = \frac{\ln(1/\alpha)}{8\beta}.` | equality | boundary time |
| Main text, L227–228 | `t_{95} = \frac{\ln 20}{8\beta}.` | equality | boundary time, α = 0.05 |
| Appendix B.3, L640 | `t_\alpha \ge \frac{\ln(1/\alpha)}{8\beta}.` | **inequality** | admissible set $[t_\alpha,\infty)$ |
| Appendix B.3, L644–645 | `t_{95} = \frac{\ln 20}{8\beta}.` | equality | boundary time, four lines under the inequality |
| Summary, L792 | `is $t_\alpha \ge \ln(1/\alpha)/(8\beta)$; in particular, $t_{95} = \ln 20/(8\beta)$.` | **both, one line** | the two readings compressed together without comment |

The relation symbol appears three times as `=` (L223, L227, L644) and twice as `≥` (L640, L792); the `t_{95}` equality is stated twice identically (L227, L644). All five derive from the same symmetric-mass $H = 2\kappa^2$, and the parent never reconciles them (DEFECT-6). Since $H(t)$ is strictly decreasing in $t$ for $\beta>0$, $\kappa_0>0$, the boundary is the equality and the admissible set is the inequality carrying the same value; neither symbol is wrong. The ambiguity is load-bearing for any reader who treats L640 or L792 as a reportable lower bound and compares it against an independently measured crossing time — and L792 is the worst instance, being the summary a reader is most likely to quote.

**Corollary (rate-normalized relaxation time).** With $H(t) = 2\kappa_0^2 e^{-8\beta t}$ (L629–631) and $H(t_{\alpha'}) \le \alpha' H(0)$ for $0<\alpha'<1$ (L632–638), the boundary time is $t_{\alpha'} = \ln(1/\alpha')/(8\beta)$. Substituting $\alpha := 4\beta$ eliminates β:

$$\boxed{\;t_{\alpha'} = \frac{\ln(1/\alpha')}{2\alpha}\;}$$

The relaxation time is a function of the *rate* alone.

---

## 3. Contraction check against the static κ budget

The parent fragment binds κ as a **static** global safety factor (`Ξ-Constitutional-Core.md:29, 31–35`):

$$\lambda_p = \kappa\,p^{-\sigma}\,\lVert A_p\rVert^{-1},\qquad 0 < \kappa < 1,$$
$$\sup_{p}\ \lambda_p\left(L_{A,p}+L_{B,p}+L_{E,p}\right) = c < 1 .$$

**The condition is strict, not non-strict.** The gate is `c < 1` (`Ξ-Constitutional-Core.md:34`), and the parent proof document discharges it as $\kappa < 1/M$ yielding $c \le \kappa M < 1$ (`Multiplicity_Lawful_Recursion.tex:592–596`). Both halves are strict: the sufficient condition on κ is $\kappa < 1/M$, and the conclusion requires $\kappa M < 1$, not $\le$. The borderline $\kappa_0 M = 1$ therefore **fails** the gate; it is not an admissible degenerate case.

Write $L_p := L_{A,p}+L_{B,p}+L_{E,p}$ and define the κ-independent, α-independent **shape constant**

$$M := \sup_{p \in \mathcal{P}}\ p^{-\sigma}\, L_p\, \lVert A_p\rVert_{\mathrm{op}}^{-1},$$

the same supremum the parent proof document defines as `M` at `Governance/multiplicity/Multiplicity_Lawful_Recursion.tex:585–589` (in its stricter fixed-point normalization, with a leading `1 +`). For static κ, $c = \kappa M$, and the lemma at LRN:574–596 discharges the gate as $\kappa < 1/M$.

Substituting the decaying schedule, $\kappa(t) = \kappa_0 e^{-\alpha t} = \kappa_0 e^{-4\beta t}$:

$$c(t) = \kappa(t)\,M = \kappa_0\,M\,e^{-4\beta t}.$$

**Corollary C-1 (α-independence of the contraction gate).** For $\beta > 0$ (hence $\alpha = 4\beta > 0$) and $\kappa_0 \ge 0$,

$$\sup_{p}\ \lambda_p(t)\,L_p < 1 \quad \forall\, t \ge 0 \quad\Longleftrightarrow\quad \kappa_0\,M < 1 .$$

*Proof.* $c(t) = \kappa_0 M e^{-4\beta t}$ is nonincreasing in $t$ with $\sup_{t\ge0} c(t) = c(0^+) = \kappa_0 M$. $\square$

**Corollary C-2 (the decay never relaxes the budget).** For $\beta > 0$, $c(t) \le c(0^+)$ for all $t\ge 0$, strictly for $t>0$ whenever $\kappa_0 M > 0$. The decaying schedule is never more contractive than its own $t=0$ snapshot and relaxes monotonically toward it. With $\rho_{\text{Lyap}} := \kappa(t)/\kappa_0$:

$$\sup_{t\ge0}\ \lambda_p(t)L_p \;=\; \kappa_0 M, \qquad \text{margin} \;=\; M\,(1-\kappa_0),$$

and **α appears in neither expression.**

**Corollary C-3 (α is a recovery rate, not a stability parameter).** The parent gate is fully determined by the pair $(\kappa_0, M)$. The rate α controls only how fast the schedule relaxes from $\kappa_0 M$ toward 0 — the time to steady state at an already-satisfied margin. Increasing α makes the transient steeper; it cannot create margin. **No choice of α can compensate for $\kappa_0 M \ge 1$.**

Consequences for the governance surface:

1. Any schedule of the form $\kappa_0 e^{-\alpha t}$ is admissible for the parent gate **iff** its $t=0$ value passes the static gate. The gate is checked at $t=0$ and nowhere else.
2. A decaying κ is *governed by*, and adds nothing to, the static $0<\kappa<1$ budget. It is not a relaxation of the parent §4; it is a restatement of it plus a decay.
3. The relaxation time (§2.1, C-0) is the only quantity α genuinely controls, and it exists in the symmetric-mass case only.
4. α appears in neither $c$, nor the margin $M(1-\kappa_0)$, nor the admissibility condition $t_{\alpha'}$. Each is a function of $M$ and $\kappa_0$ alone.

---

## 4. On-tree executable, as measured

`packages/rust/pirtm-monitor/src/lib.rs`, crate `pirtm-monitor`.

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

**On-tree invariance.** `git diff c7187410 8a0b6d9a -- packages/rust/pirtm-monitor/src/lib.rs packages/rust/engine/src/wasm_api.rs` is empty; the measured text is identical at both commits. Scope caveat: `c7187410` is on `main`, but `8a0b6d9a` is **not** (`git merge-base --is-ancestor 8a0b6d9a main` fails), so the invariance claim is a local one — rerunnable only on a tree holding that commit. The `c7187410`-only facts below are not subject to that caveat.

**Finding α is unbound.** The crate contains **zero** occurrences of `beta` (`grep -rni beta packages/rust/pirtm-monitor/src/` → no matches). The only parent of `ALPHA = 0.1` would be β, and β is absent. Formally $\alpha := 4\beta$ would require $\beta = 0.025\ \mathrm{s}^{-1}$ to be *declared and justified*; today `ALPHA` is a bare float literal with no $H$, no $\partial H/\partial\kappa$, and no Lyapunov certificate.

**Finding κ₀ = 1.0 is outside the budget.** `KAPPA0 = 1.0` gives $\kappa(0^+) = 1 \notin (0,1)$, so the parent's `0 < κ < 1` is violated at every process start. By C-1 the gate becomes $\kappa_0 M < 1 \iff M < 1$: the safety factor contributes **exactly zero margin** ($M(1-\kappa_0) = 0$), and the monitor's contractivity rests entirely on the unaudited $M$. By C-3, $\alpha = 0.1$ does not repair this.

**Finding the attenuation is anti-monotone.** `apply_gain` multiplies by $(1-\kappa(t))^{+}$, which *increases* toward 1 as κ decays. Closed-form evaluation of the source expression at the source constants, $\alpha=0.1$, $\kappa_0=1.0$:

| $t$ (s) | $\kappa(t)=e^{-0.1t}$ | attenuation $1-\kappa$ | $\rho_{\text{attenuated}}$ at $\rho=1.2$ |
|---|---|---|---|
| 0 | 1.000 | 0.000 | 0.000 |
| 6.93 | 0.500 | 0.500 | 0.600 |
| 11.51 | 0.316 | 0.684 | 0.821 |
| 23.03 | 0.100 | 0.900 | 1.080 |
| $\infty$ | 0.000 | 1.000 | 1.200 |

The gate ramps monotonically in wall-clock time, independent of measured drift. The consequence is not that the monitor becomes uniformly more or less conservative, but that **gate sensitivity is a function of uptime rather than of measured state**: at $t=0^+$ every ρ, including $\rho \ge \rho_{\text{halt}}$, is multiplied to zero and silently suppressed; the same magnitude at $t\approx23.03$ s is passed at 90% and trips the halt. Identical drift magnitudes receive opposite verdicts based only on when they occur. ADR-003 characterizes this code as a gain that "attenuates drift" and states "the Zeno gain ensures that small drifts are naturally suppressed over time" (`docs/adr/completed/ADR-003-ward-monitor-zeno-finton.md:13, 25`); the executed form suppresses *all* drift for the first seconds then admits it back toward the raw value, distinguishing neither small drift from large, nor drift from fault.

**Finding restart resets the schedule.** `start_time: Instant::now()` (L81) returns κ to $\kappa_0 = 1.0$ on any process restart and restarts the ramp from zero attenuation. A restart is the only mechanism that re-arms total suppression, so a fault that escalated to a visible kill late in one run is silently hidden by the next.

---

## 5. The contractivity gate: signature, implementation, spec

### 5.1 Signature and implementation

`packages/rust/pirtm-monitor/src/certify_constants.rs:127–137`, verbatim:

```rust
/// Certify the commutator bound C = ‖[D, H_m]‖.
///
/// We discretise the Hilbert space with a uniform grid of size `grid_n`.
/// The operator D is diagonal in the prime basis, H_m is the Fourier multiplier.
/// The commutator matrix is assembled and its spectral norm is computed.
pub fn certify_commutator(grid_n: usize) -> Result<f64, CertError> {
    let d = diagonal_d_matrix(grid_n);
    let h = fourier_multiplier_matrix(grid_n);
    let comm = matrix_sub(&mat_mul(&d, &h), &mat_mul(&h, &d));
    let norm = comm.iter().flat_map(|row| row.iter()).map(|v| v * v).sum::<f64>().sqrt();
    if norm <= C_MAX {
        Ok(norm)
    } else {
        Err(CertError(format!("Commutator norm {} exceeds C_MAX {}", norm, C_MAX)))
    }
}
```

The gate is `norm <= C_MAX` at L132 — **non-strict**, on a Frobenius value. Note the contrast with the Core's own gate, which is strict (§3).

### 5.2 Reachability — the gate is not in the library

`lib.rs` declares **no modules**: its only `mod` is `#[cfg(test)] mod tests` at L291. `mod certify_constants;` appears solely in `main.rs:3`. Therefore:

- Any crate depending on `pirtm-monitor` **as a library** receives `WardMonitor`, `ZenoController`, and `MonitorConfig`, and **never receives the gate**. A Cell linking the library ships with the κ schedule of §4 and without the only certified bound in the crate.
- The sole production entry is `main.rs:6` → `run_certification()` (L212–221), which `std::process::exit(1)`s on `Err`. Nothing else calls `certify_commutator`; the only other caller is the test at L233.

`run_certification`'s own comment reads `// Example parameters that satisfy the ledger thresholds.` (L213), with `certify_alpha(32, 10.0, 0.95)` and `certify_commutator(64)` — that is, the inputs are *selected* to pass rather than derived from the system being certified.

### 5.3 There is no formal specification

No Lean statement of this gate exists. `Foundations/UOR/Structures.lean` declares `CommutatorState` with `commutatorValue : Option P.Decimal` (L614–616) and a `Commutator` observable (L800). Both are **type declarations holding an optional decimal**: no norm identity, no `≤ C_MAX`, no distinction between operator and Frobenius norm, and no theorem of any kind.

This changes the character of DEFECT-7. It is **not** a spec-versus-implementation mismatch — there is no spec to violate. It is a doc-comment-versus-implementation mismatch with no formal specification on either side, which means the class of checker that would ordinarily catch it (Kani, or a Lean statement written separately from the code) has nothing to check against. The precondition your track call names is unmet on the spec side, not the implementation side.

A third, unrelated contractivity gate is documented at `packages/multiplicity-crypto/docs/ADR-073-Contractivity-Gate.md` (Status: Accepted), over `ts/src/feedback.ts:36–57`, gating on `contractivity_score > 0 && contractivity_score <= 1.0`. That ADR also records "No per-channel ledger" logging $(\lambda_p, L_p, \lambda_p L_p, ACE_p, projector\_status)$, and orders that documentation referencing "c < 1 enforcement" be removed or qualified as "inequality implemented, not wired to Core ledger" absent tests. So three distinct gates are in play — the Core's strict `sup_p λ_p L_p < 1`, this Rust Frobenius `norm <= C_MAX`, and a TypeScript score predicate — with no artifact reconciling them.

---

## 6. Excluded and not-claimed

- The Sedona Spine form $\kappa(t)=\kappa_0\exp(-1/\min_k\lvert\rho_k-\Im(\log\langle M\rangle)\rvert)$ (`packages/rust/materia_commons/sedona-spine/Sedona Spine.tex:427, 626`) is **state-dependent**, not wall-clock decay. No claim is made about it here.
- The entropy-adaptive κ via $\Psi(H_\pi)$ (`packages/z-bit/docs/ADR Scaffold_ ZRSD + PWEH Research.md`) is not an exponential schedule. Excluded.
- ADR-003's $\kappa(t)=\kappa_0 e^{-\alpha t}$ (`:13`) is a **runtime drift-attenuation gain in a different subsystem** from the parent's per-channel spectral safety factor. The two share the letter κ and are never composed in any on-tree document. This fragment does not merge them.
- No per-channel $L_p$, no $\lVert A_p\rVert$, and no $p^{-\sigma}$ exist in `pirtm-monitor`. The gate at L124 is driven by a provider-supplied scalar `ManifoldState::lambda_l_product`, never recomputed from κ. **The monitor cannot discharge `sup_p λ_p(t) L_p < 1` at all**; §3 is a proof about a schedule the crate does not feed into the spectral budget.
- The absence of a formal gate specification (§5.3) is established by *absence of a matching declaration* in `Foundations/`, not by an exhaustive proof that none exists anywhere in the repository.
- No program was executed. Every number in §4 is closed-form evaluation of the source expression at the source constants, plus the on-tree constant values. The only κ-touching test, `test_zeno_compute_kappa_decays` (L308–316), asserts $k_2 < k_1$ after a 100 ms sleep and certifies no rate, no budget, and no restart behaviour.
- `ALPHA = 0.1` (`lib.rs:26`) and `ALPHA_MIN = 0.103` (`certify_constants.rs:23`) are distinct quantities sharing one name in one crate, the decay rate sitting below the certified floor. Recorded as a collision hazard; no relation between them is asserted.

---

## 7. Defects and conditions precedent to adoption

| ID | Defect | Evidence |
|---|---|---|
| DEFECT-1 | `KAPPA0 = 1.0` violates `0 < κ < 1` at $t=0^+$; by C-1 the gate degenerates to $M < 1$ with zero κ margin | `lib.rs:25`; Core:29 |
| DEFECT-2 | `ALPHA` is unbound: no β, no $H$, no Lyapunov certificate; $\alpha := 4\beta$ is unbacked | `lib.rs:26`; zero `beta` matches in crate |
| DEFECT-3 | `apply_gain`'s $(1-\kappa)^{+}$ is anti-monotone in the decay: gate sensitivity tracks uptime, not measured drift, so equal drift magnitudes get opposite verdicts by time | `lib.rs:92–96`, §4 table |
| DEFECT-4 | Restart resets $\kappa \to \kappa_0$, re-arming total suppression and hiding faults escalated late in the prior run | `lib.rs:81` |
| DEFECT-5 | `certify_constants.rs` documents the commutator bound as $C\le 2.71$ (L8) while this copy enforces `C_MAX = 4.0` (L26); the gate (L132) and test (L234) both check 4.0. **The bound is not merely stale in one file — the two copies of this crate disagree by exactly one line.** `packages/rust/monitor/src/certify_constants.rs:26` sets `C_MAX = 2.71`, matching its own doc comment, while `packages/rust/pirtm-monitor/src/certify_constants.rs:26` sets `4.0` under an identical comment saying 2.71 — a 47.6% silent widening of a certified bound, in whichever crate is built. Compounding this, the certified quantity is scaled to meet the threshold it is checked against (`H_SCALE = 0.02`, L151, "adjusted to meet C_MAX"; L217, "modest grid size to keep the commutator norm within C_MAX"), so the certification is circular and the documented bound is unenforced in both code and test | `pirtm-monitor/src/certify_constants.rs:8, 26, 132, 151, 217, 234`; `monitor/src/certify_constants.rs:26` |
| DEFECT-6 | The parent states its relaxation time **five times across four locations** with both relation symbols and never reconciles them: equality at L223 (`t_\alpha = \ln(1/\alpha)/(8\beta)`), equality at L227–228 (`t_{95} = \ln 20/(8\beta)`), **inequality** at L640, equality again at L644–645, and at L792 both symbols on a single summary line. `=` appears three times, `≥` twice. A reader cannot tell whether $t_\alpha$ is a boundary or a bound without re-deriving the monotonicity of $H$, and the summary line a reader is most likely to quote is the one that compresses both readings without comment. Not a mathematical error; an unreconciled duplication that will propagate into any α := 4β citation | `templateArxiv.tex:223, 227, 640, 644, 792` |
| DEFECT-7 | `certify_commutator`'s doc comment states its **spectral norm** is computed (L126); L131 computes $\sqrt{\sum_{ij}a_{ij}^2}$, the **Frobenius** norm. Since $\lVert A\rVert_F \ge \lVert A\rVert_{\mathrm{op}}$ (Frobenius is the $\ell^2$ norm of the singular values; $\sigma_{\max}^2 \le \sum_i \sigma_i^2$), a pass at L132 implies $\lVert A\rVert_{\mathrm{op}} \le \lVert A\rVert_F < C_{\max}$ — the spectral norm clears. A **fail** does not: a matrix may have $\lVert A\rVert_F \ge C_{\max}$ with $\sigma_{\max} < C_{\max}$. The gate therefore cannot accept a matrix the spectral norm would reject, but can reject one it would accept. **The risk direction is liveness (spurious halts), not divergence.** Magnitude of the false-reject rate depends on the singular-value spread: near rank-one, $F \approx \mathrm{op}$ and the gap is negligible; flat spectrum, $F \approx \sqrt{n}\,\mathrm{op}$. The returned `f64` is not the documented quantity, so any consumer matching it against a spectral budget compares incommensurable numbers, and if `C_MAX` was calibrated against the operator norm every downstream statement about proximity to the bound is off by the $F/\mathrm{op}$ gap. Compounds DEFECT-5 | `certify_constants.rs:8, 126, 131` |
| DEFECT-8 | The contractivity gate is **unreachable from the library**: `lib.rs` declares no modules, and `mod certify_constants;` appears only in `main.rs:3`. Any crate depending on `pirtm-monitor` as a library receives `WardMonitor` and `ZenoController` and never receives `certify_commutator`. The only production entry is `main.rs:6` → `run_certification()`, whose comment reads "Example parameters that satisfy the ledger thresholds" — the inputs are selected to pass, not derived from the system under certification. Compounding this, **no formal specification of the gate exists**: `Foundations/UOR/Structures.lean` declares only `CommutatorState.commutatorValue : Option P.Decimal` (L614–616) and a `Commutator` observable (L800), with no norm identity, no `≤ C_MAX`, and no theorem. DEFECT-7 is therefore doc-versus-implementation with no spec on either side, not spec-versus-implementation | `certify_constants.rs:127–137, 212–221`; `lib.rs:291`; `main.rs:3, 6`; `Structures.lean:614–616, 800` |

Adoption of any decaying κ requires **all** of the following, none of which this fragment supplies:

1. $\kappa_0$ declared in $(0,1)$ and certified against $M$ so that $\kappa_0 M < 1$ with recorded margin $M(1-\kappa_0) > 0$ — closing DEFECT-1.
2. A declared, sourced β (equivalently $\alpha := 4\beta$) with its $H$ and $\partial H/\partial\kappa$ on tree, so the decay is a gradient flow and not a literal — closing DEFECT-2.
3. A resolved attenuation direction: either κ enters as a multiplier on the spectral budget as the parent intends, or the uptime ramp is removed in favour of a measured-state gate — closing DEFECT-3.
4. Restart-continuity, or explicit and logged re-arm semantics — closing DEFECT-4.
5. A per-channel ledger carrying $(\lambda_p, L_p, \lambda_p L_p)$ for each p, digested into a `LawfulRecursionHash`, per the parent's §7 (`Ξ-Constitutional-Core.md:58, 65`).
6. A new `LawfulRecursionVersion` (> 1.1) with a recomputed parent `LawfulRecursionHash`, the parent being declared immutable (`Ξ-Constitutional-Core.md:4`).
7. A formal specification of the gate written separately from its implementation — a Lean or Kani statement of which norm is bounded and against what — so that DEFECT-7 becomes mechanically checkable rather than doc-only — closing DEFECT-8.
8. An ADR reconciling ADR-MC-001's `stability_constants: Λ_m and α` (`docs/adr/completed/ADR-MC-001-Manifest.md:17`) with the parent's κ and σ — a live vocabulary mismatch blocking any Cell manifest that carries a decay rate.

---

## 8. Anchor drift in the parent fragment (not repaired here)

- `Governance/docs/MOC.md:2, 11, 12` claims `LawfulRecursionHash: 099c79aa1d5f5435c93d3dcd0c2bc83264c9da488861258a47b8feb73648c194`. The actual digest of `Governance/docs/Ξ-Constitutional-Core.md` is `8167719f6b1d7b9ca6f0d463e9c8da4de84a5a1b5b9a5c15df684860b1d5b6e3`. **MOC's anchor does not verify.**
- MOC's anchor command `cat multiplicity/Ξ-Constitutional-Core.md | sha256sum` names a path that does not exist on tree.
- `Governance/docs/Ξ-Constitutional-Core.md:5` and its byte-identical copy `Governance/Archive_and_Drafts/Ξ-Constitutional-Core.md:5` both carry `**LawfulRecursionHash:** [computed on commit]`, a placeholder `packages/multiplicity-crypto/docs/ADR-074-LawfulRecursionHash.md:30` (Status: Accepted) forbids shipping.
- A third byte-identical copy exists at `packages/rust/apex/apex-goldilocks/docs/governance/Ξ-Constitutional-Core.md`. No hash pins any of the three.

Recorded so that this fragment's own anchor is not mistaken for a repair of those. Repair is a separate change against a separate owner.

---

## 9. Verifiability scope

Which anchors survive outside the branch tree on which this fragment was written:

| Anchor | Verifiable from |
|---|---|
| This fragment's bytes | this working tree only — branch `adr/0139-lexlean-declared-submodule` |
| This fragment's digest | same; **not** from `main` (`git ls-tree main -- …` empty), **not** from `PhaseMirror/The-Foundry` |
| `c7187410` code facts (`pirtm-monitor`, `engine`) | `main`, `The-Foundry/main`, and this tree |
| `8a0b6d9a` and the empty `c7187410..8a0b6d9a` diff | this working tree only; `8a0b6d9a` is not on `main` |
| `templateArxiv.tex` L222, L318, L584–626, L640, L644 | **any tree containing the note** |
| `Ξ-Constitutional-Core.md` digest `8167719f…` | any tree containing it; the `Archive_and_Drafts` copy is byte-identical |
| `certify_commutator` signature, doc comment, Frobenius line, and `norm <= C_MAX` gate | any tree containing `packages/rust/pirtm-monitor/` |
| `C_MAX = 4.0` vs the sibling copy's `2.71` | requires **both** crates; each alone shows only its own value |
| absence of a Lean specification for the gate | any tree containing `Foundations/UOR/Structures.lean`; a future file would overturn it |

The load-bearing claims of §2 — the derivative, the feedback law, and the boundary/inequality readings — rest on the parent note alone and are checkable from `templateArxiv.tex` by anyone holding it. The claims of §4 rest on `c7187410` and travel with `main`. Nothing in this fragment depends on the branch it was written on except its own bytes.