# PhiPiEpsilon — LexLean edition

A bounded routing policy written as a **LexLean semantic module**. It uses the
same source format, toolchain, and verification pipeline as PrismPM, so it can
be pulled into Prism instead of existing as handwritten Lean.

Nothing here models consciousness, agency, free will, emotion, or human
consent. `Intent` is a label from an upstream classifier; a `Decision` is a tag
telling a runtime what to do next. The Φπε operator math is not encoded.

## Layout

| File | Role |
|---|---|
| `src/PhiPiEpsilon.lex.tex` | **The authoritative source.** LexLean generates all Lean from it. |
| `tools/gen_core.py` | Helper that writes the `.lex.tex` file from readable Python. Edit this, re-run it, then verify. |
| `lexlean.toml`, `lexlean.lock` | LexLean project and lock (language 1.1, the same setup as PrismPM's Calculator). |
| `lakefile.toml`, `lean-toolchain`, `lake-manifest.json` | Lean workspace, pinned to `leanprover/lean4:v4.32.1`. |

There is no handwritten `.lean` file, which PrismPM's rules require.

## How this differs from the handwritten `Core.lean`

LexLean only accepts a fixed set of proof steps: `rfl`, `decide`, `simp only`
over named definitions, `constructor`, `cases`, `induction`, `congr 1`, and
applying an earlier theorem. It has no `intro` and no "there exists", and
`cases` cannot split a raw `Bool`. The policy is the same, but it is written
differently:

- **Theorems are exact Boolean equations**, not one-way implications. For
  example, `isReflect (route st a) = (isOrdinary a.intent && isBelow …)` states
  soundness and completeness in one line.
- **The threshold check is a small inductive.** `thresholdOf risk threshold` is
  `below` when `Nat.blt risk threshold` is true, otherwise `atOrAbove`, and the
  router branches on that value.
- **T7 has no "there exists".** It becomes: an action is permitted exactly when
  the decision is normal *and* the stored authorization is valid for that
  action now.
- **Stricter axiom result:** every declaration uses **no axioms**, not even
  `propext`.

## Types

| Type | Meaning |
|---|---|
| `Intent` | The seven input classes. |
| `PauseReason` | `forcedResolution` or `paradoxSpiral`. |
| `RefusalReason` | `safeBoundary` (neutral, with no details about the input) or `riskAtOrAboveThreshold`. |
| `Decision` | `reflect` (normal response), `pause r`, or `refuse r`. There is no error case. |
| `DecisionKind` | `normal`, `pause`, `refusal`; `Decision.kind` maps each decision to one of these. |
| `Threshold` | `below` or `atOrAbove`; `thresholdOf` computes it from risk and threshold. |
| `ExternalAction` | An action identified by a number. |
| `Authorization` | Permission for one action ID, with an expiry time and a revoked flag. |
| `Context` | Classifier label, pressure count, recursion depth. |
| `Assessment` | Intent plus `riskScore`. |
| `SystemState` | `riskThreshold`, optional `authorization`, clock `now`. |

## Functions

- `assess`: `riskScore = baseRisk intent + pressure + recursionDepth`. Base risk is 0/0/1/3 for the ordinary intents and 10 for the boundary intents.
- `routeWith intent threshold`: coercive → `refuse safeBoundary`; forcedResolution or paradoxSpiral → `pause`; any other intent → `reflect` if `below`, otherwise `refuse riskAtOrAboveThreshold`.
- `route st a = routeWith a.intent (thresholdOf a.riskScore st.riskThreshold)`, and `decideFor st ctx = route st (assess ctx)`.
- `Authorization.isValidFor`: not revoked, same action ID, and `now < expiresAt`.
- `mayPerformExternalAction`: only a `reflect` decision can act, and only with a valid stored authorization.

## Theorems (all verified, all axiom-free)

| Policy rule | Theorem(s) |
|---|---|
| Coercive → neutral safe boundary | `coercive_gives_safe_boundary` |
| Forced-resolution → pause (kind = pause) | `forcedResolution_gives_pause` |
| Paradox-spiral → pause (kind = pause) | `paradoxSpiral_gives_pause` |
| Reflection only for ordinary intents below threshold, and always then | `routeWith_reflect_exact`, `route_reflects_iff_ordinary_and_below_threshold` |
| At or above threshold never reflects | `routeWith_at_or_above_threshold_never_reflects`, `{exploratory,declarative,reflective,ambiguous}_at_or_above_threshold_refused` |
| Pauses happen exactly on the two pause intents | `routeWith_pause_exact`, `route_pauses_iff_pause_intent` |
| External action ⇔ normal decision ∧ valid authorization | `mayPerform_exact` |
| No authorization → no action | `no_authorization_no_action` |
| Pauses and refusals never act | `pause_never_acts`, `refusal_never_acts` |
| Revoked authorization is invalid | `revoked_authorization_invalid` |
| Pause, refusal, and normal are distinct | `pause_is_not_refusal_or_normal`, `refusal_is_not_pause_or_normal`, `normal_is_not_pause_or_refusal` |
| `assess` keeps the label | `assess_intent` |
| Concrete checks, including threshold boundary 4/5/6 vs 5 | `demo_*` |

**Limit:** the classifier is outside Lean. The theorems guarantee behavior
*given* the label and counts, not that the label is correct.

## Checking locally

LexLean `0.3.0` is bundled in PrismPM at `vendor/lexlean`.

```bash
# Option A: the published container (it carries the Lean 4.32.1 toolchain)
docker run --rm -v "$PWD:/work" ghcr.io/afflom/lexlean:0.3.0 verify

# Option B: build LexLean from PrismPM's vendored copy
cargo install --locked --path /path/to/PrismPM-main/vendor/lexlean
elan toolchain install leanprover/lean4:v4.32.1

# In this project folder:
python3 tools/gen_core.py   # only if you edited the generator
lexlean lock
lexlean check               # parse, link and type-check the IR
lexlean verify              # generate Lean, compile, leanchecker replay, exact axiom audit
```

A successful run prints `verified 1 module; attestation <hash>` and writes
`.lexlean/verified/<hash>/attestation.json`, which lists each declaration with
its observed axioms (all empty here).

## Bundle contents (handoff)

- `vendor/lexlean-0.3.0.crate`: the exact LexLean 0.3.0 source crate from
  PrismPM's `vendor/lexlean` (MIT or Apache-2.0). Unpack it with
  `tar xzf lexlean-0.3.0.crate`, then run `cargo install --locked --path lexlean-0.3.0`.
  It requires Rust ≥ 1.97.
- `reference/PhiPiEpsilon.generated.lean.txt`: the Lean that LexLean generated
  on the verified run, for reading only. It is renamed to `.txt` so it is never
  mistaken for source, since PrismPM forbids committed `.lean` files. LexLean
  regenerates it on `lexlean build` / `verify`.
- Verified attestation of this exact source:
  `e547c88f778c8e4b9ad8ffe7a1d144d144d5d63ac02ffca26ffa8181dd0c576d`
  (LexLean 0.3.0, `leanprover/lean4:v4.32.1`, 55 declarations, 0 axioms observed).

Everything here is plain text or a source crate, so nothing is tied to a
particular CPU architecture. LexLean and the Lean toolchain must be built or
installed on the target machine.
