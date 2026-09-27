# ADR-RML-168: `run_gik_diagnostic` presents keyword matching as formal structure

## Status
Proposed

## Triage (time-aware phase mirror)
- Subject: `packages/PhaseMirror/phase_mirror_wasm/src/lib.rs:28-112`
- Verdict signature: `f558be5f8c8061a7`

## Context and Problem Statement

ADR-003 L20 lists `run_gik_diagnostic` as one of the crate's two exported
governance capabilities. `GIK` is not defined anywhere in the monorepo, and the
function's behavior is a keyword scorer wearing the visual language of a formal
method.

```rust
// src/lib.rs:33-42
let has_autonomy = prompt_lower.contains("autonomy") || prompt_lower.contains("autonomous");
let has_governance = prompt_lower.contains("governance") || prompt_lower.contains("binding");
let has_attestation = prompt_lower.contains("attestation") || prompt_lower.contains("witness");
let has_metric = prompt_lower.contains("metric") || prompt_lower.contains("observability");

let mut weight = 1;
if has_autonomy { weight *= 2; }
if has_governance { weight *= 3; }
if has_attestation { weight *= 5; }
if has_metric { weight *= 7; }
```

The multiplication of 2, 3, 5, and 7 is presented as `weight` and echoed into every
step as `primeFactors`. The factors are constants. They are not derived from the
prompt, and their primality has no bearing on the result. The product ranges over
{1, 2, 3, 5, 6, 7, 10, 14, 15, 21, 30, 35, 42, 70, 105, 210} and the priority
threshold at `src/lib.rs:82` is `weight >= 30`. Arbitrary.

Four specific problems.

### Every step carries the same decorative weight

`weight` and `primeFactors` are computed once at `src/lib.rs:38-51` and cloned
into all five step objects at `src/lib.rs:63, 74, 83, 94, 107`. They do not vary
per step. A field named `weight` on a step, identical across all steps, describes
nothing. It reads as a per-step confidence and is not one.

### The "Constraints" are a binary template, not an extraction

```rust
// src/lib.rs:58-62
"content": format!("Identified goal: \"{}\"\nConstraints: {}\nClaims: {}",
    prompt,
    if has_governance { "Regulatory compliance" } else { "None detected" },
    if has_autonomy { "Autonomy is required" } else { "" }
),
```

`Constraints` is either the literal string `Regulatory compliance` or
`None detected`. The prompt appears only as an echo of itself under
`Identified goal`. Nothing is extracted. `Claims` is empty whenever the prompt
lacks the substring `autonomy`, so the common case returns a field with no value
rather than omitting it.

### The levers are hardcoded, including their horizons

```rust
// src/lib.rs:90-91
"1. [DevOps] — Define governance forum — Metric: forum established within 2 weeks — Horizon: Q2\n{}"
if !has_attestation { "2. [Security] — Add attestation requirement — Metric: P5 weight included — Horizon: next sprint" }
else { "2. [Legal] — Review attestation compliance" }
```

`Horizon: Q2` is a literal. It is emitted for every prompt that reaches this
branch, in any quarter. The metric `P5 weight included` is self-referential: it is
satisfied by the scorer's own arithmetic, which requires only that the prompt
contained `attestation`. The lever asserts that a requirement was added when the
only evidence is that a word appeared in the input text.

This is the specific inversion `AGENTS.md` names: "Replace vibe claims with
mechanisms." The lever is the mechanism, and the metric is the observation that
produced it.

### The function does not implement the Phase Mirror method

`AGENTS.md` defines the method as Mirror (reflect the claim without endorsement),
Dissonance (identify tensions, contradictions, or missing bindings), and Phase
(small testable actions). The five emitted steps are Extract, Map Tensions, Rank,
Produce Levers, and Precision Question.

The "Map Tensions" step is two hardcoded strings selected by a boolean pair:

```rust
// src/lib.rs:69-72
if has_autonomy && has_governance { "Autonomy vs. Governance" } else { "No significant tension detected" }
if has_autonomy && !has_governance { "Autonomy (P2) requires Governance (P3) to be lawful." }
else if has_governance && !has_attestation { "Missing Attestation (P5)" } else { "Balanced" }
```

The labels P2, P3, and P5 correspond to nothing. The keyword set has four members
and they are numbered 2, 3, 5, and 7, so P2 and P3 are positions in a list that
starts at 1 and skips 4 and 6. There is no phase model here. The method's defining
move, reflecting a claim back without endorsing it, is absent: the output asserts
that governance is or is not required without surfacing the claim that would make
it contested.

## Considered Options

### Option 1: Remove `run_gik_diagnostic` from the crate
It is a prompt-scoring heuristic with no relationship to L0 verification, the
contractivity receipt, or the Triple-Lock state machine.
- Pros: The crate's exported surface is then only the governance path, which is
  coherent. Removes the largest source of unearned formalism in the package.
- Cons: Something is calling it. `ADR-RML-010` lists it as a claimed symbol, and
  the GlassConsole is described at `src/lib.rs:158` as a consumer of crate output.

### Option 2: Keep it, rename the fields, drop the false formality
Rename `weight` to `keyword_score`, drop `primeFactors` entirely, remove the P2/P3/P5
labels, make `Horizon: Q2` a caller-supplied parameter or remove it, and change the
step titled `Map Tensions` to state plainly that tension detection is not
implemented.
- Pros: Preserves the function and its callers. Every false signal is removed. The
  remaining function is honestly a keyword scorer, which is a legitimate thing to
  have.
- Cons: Reduces a function that presents itself as a diagnostic to a word counter.
  That reduction is the accurate description of what it is.

### Option 3: Implement the real method
Build the Mirror/Dissonance/Phase pipeline over the actual Phase Mirror data, with
tensions extracted from governance state and levers carrying owners and metrics
derived from evidence.
- Pros: Delivers what `AGENTS.md` specifies and what ADR-003 L20 implies.
- Cons: This is a new feature, not an ADR. It is a different order of work than the
  other seventeen dissonances and should not be conflated with them.

## Decision Outcome

Option 2 now, Option 3 as separate work.

1. Rename `weight` to `keyword_score` and document it as an unvalidated substring
   hit count, with the multiplier constants named as arbitrary in a comment.
2. Delete `primeFactors`. It is a constant list dressed as a computation.
3. Delete the `P2`, `P3`, `P5` labels from the tension text. They index nothing.
4. `Horizon: Q2` and `next sprint` become parameters of the function, defaulting to
   omitted rather than to a literal. A function that emits a quarter for every
   caller has one.
5. The `Map Tensions` step is retitled to `Keyword Observations` and its content
   states that it reports keyword co-occurrence, not detected tension. `No
   significant tension detected` becomes `no tension analysis implemented`, which
   is true and does not imply a clean result.
6. Amend ADR-003 L20 to record that `run_gik_diagnostic` is a keyword heuristic, not
   a governance diagnostic, and that a real Mirror/Dissonance/Phase implementation
   is outstanding. This keeps the automated mirror from re-flagging a name that is
   claimed but not delivered.
7. Record Option 3 as the intended successor in the ADR-003 amendment, with the
   note that it needs the L0 and contractivity predicates from ADR-RML-159 and
   ADR-RML-160 as inputs, since a tension detector that cannot read governance
   state can only read prose.

Clause 7 is the substantive point. A dissonance surface that reads only the prompt
string will always be a heuristic. The method requires access to the governed
state, which is exactly what this crate currently lacks.

## Consequences

### Positive
- No output of this function asserts a quarter, a tension, or a formal factor that
  the computation does not support.
- The rename makes the next reader's first question "what does this actually
  measure", which is the correct question.
- ADR-003 L20 stops carrying a claim the function never met, reducing RML ledger
  noise.

### Negative
- The output is visibly less impressive. Four of the five steps become thin. That
  is an accurate description of the function.
- Any consumer parsing `primeFactors` or the P-labels breaks. Nothing in the
  monorepo was found to parse them, and the output is a JSON string array with no
  declared consumer, but the break is real and should be noted in the publish
  bump.
- This ADR reduces the claimed capability of the crate's second export to its
  actual capability. That is the point, and it should be stated plainly in the
  ADR-003 amendment rather than discovered later.

### Verification Strategy
Snapshot tests over a fixed prompt corpus asserting the output contains no
`primeFactors` key, no `P2`/`P3`/`P5` token, and no `Horizon` value when the
parameter is omitted. A test asserting the docstring-level claim matches behavior,
so the next false-formality addition is caught by a test rather than by review.

## Links
- Index: `ADR-RML-158.md` (dissonance D15)
- Subject: `packages/PhaseMirror/phase_mirror_wasm/src/lib.rs:28-112`
- Method: `AGENTS.md`
- Claim: `Governance/ADR/accepted/ADR-003-sovereign-stack-implementation.md:20`
- Predicates needed for a real implementation: `ADR-RML-159.md`, `ADR-RML-160.md`
