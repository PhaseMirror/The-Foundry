# ADR-232: Recursive Phase Mirror Loop on Prime/

- Status: accepted
- Date: 2026-08-01
- Owners: phase-mirror-agent, the-guardian, the-publisher
- Tags: governance, mirror-loop, time-aware, daemon, drift
- Depends On: ADR-036 (Phase Mirror Governance), ADR-231 (RH–Multiplicity Formal Verification)
- Supersedes: ADR-402 (one-shot Phase Mirror Dissonance loop)
- Phase: phase-1

## 1. Context

The Prime/ repository states intent in many places at once: accepted ADRs
under `Governance/adr/accepted/`, whitepapers and papers under `paper/` and
`publications/`, goal and design notes scattered across `docs/`, `README.md`,
and the MOC theory, plus the ADR-231 RH–Multiplicity manuscript. The actual
development state lives in the Lean 4 corpus (`lean/`, `RH_Multiplicity/`), the
Rust crates (`rust/`), generated certificates (`data/`), and CI workflows
(`.github/workflows/`).

The existing loop (`scripts/phase_mirror_loop.py`) has three structural limits
that this ADR resolves:

1. **It is not continuous.** It is a one-shot analysis run by hand or cron; it
   cannot surface the moment a document goes stale against the code, or the
   moment the code falls behind a newly stated goal.
2. **It is not time-aware.** It detects that a gap exists but never decides
   *which side is stale*. When a claimed theorem is missing, the loop cannot
   say whether the document predates the implementation (docs should be
   updated) or the implementation lags a newer commitment (math/code should be
   updated).
3. **It is not recursive over Prime/.** It only harvests `docs/`,
   `publications/`, and root-level files against the single `lean/` subtree.
   Stated goals that live in `Governance/adr/`, `paper/`, or crate READMEs are
   invisible to it, and implementation evidence in `rust/` or generated
   artifacts is ignored.

The consequence is silent drift: a paper updated last week promises a theorem
the Lean corpus has not yet formalised, or a refactor last month changed the
implementation and the document never followed. Because there is no
deterministic rule for which side to fix, teams default to "fix whichever the
next commit happens to touch", which is exactly the wrong lever half the time.

## 2. Decision

Establish a **recursive phase mirror loop** over the entire Prime/ directory,
driven by a **sub-phase-mirror-agent daemon**, whose core operation is a
time-aware three-way classification:

> **match ⇒ GOLDEN** — the document and the implementation agree; no lever.
>
> **mismatch ⇒ compare modification times**:
> - math/code **newer** than the document ⇒ **DOC_STALE** — the implementation
>   moved first; **update the document**.
> - document **newer** than the math/code ⇒ **CODE_STALE** — the commitment
>   moved first; **update the math/code**.
>
> A missing implementation with no applicable timestamp evidence defaults to
> **CODE_STALE** (a stated goal with no backing artifact is a forward
> commitment, not a backward one).

### 2.1 The loop (ANALYZE → RESOLVE → TRIAGE → PLAN → EMIT)

The loop operates in five phases, mirroring but generalising
`scripts/phase_mirror_loop.py`:

1. **ANALYZE — harvest claims.** Recursively walk Prime/ (excluding build
   output, `.git`, `.lake`, `node_modules`, `target`) and collect:
   - **Document claims** (stated intent): named Lean declarations cited in
     prose or code fences (`theorem foo`, `` `foo` ``), numeric invariants,
     and purity guarantees, each tagged with the document path and its
     modification time.
   - **Implementation evidence** (developed reality): all Lean declarations
     (`theorem`/`lemma`/`def`/`abbrev`/`example`), Rust item names, and
     generated artifact files (`data/*.json`, CI workflows), each tagged with
     its file path and modification time.
2. **RESOLVE — pair claims to evidence.** Each document claim is matched to an
   implementation evidence entry by declaration name (normalised). A **match**
   is a name that resolves to a `sorry`-free declaration; anything else
   (missing declaration, `sorry`-discharging declaration, or a name that only
   matches a non-Lean item) is a **mismatch**.
3. **TRIAGE — time-aware direction.** Classify every pairing:
   - **match** ⇒ **GOLDEN**, always, regardless of mtime: a `sorry` is
     unambiguous evidence the math/code has not fulfilled the document's claim
     of verification, so a declaration that still discharges via `sorry` is
     **CODE_STALE**, never a doc-update signal.
   - for every mismatch that does not resolve to any declaration:
     - `impl_mtime > doc_mtime` ⇒ `DOC_STALE`
     - `doc_mtime >= impl_mtime` (or no impl evidence exists) ⇒ `CODE_STALE`
 4. **PLAN — emit levers.** Cluster the non-GOLDEN tensions by document and
    emit **one plan ADR per stale document** into `Governance/adr/proposed/`
    under the `ADR-RML-###` namespace (Recursive Mirror Loop). Each plan
    states the document, a claim-by-claim table of every stale claim with its
    triage class and the single correct lever, and a verdict signature (a
    SHA-256 digest of the `(claim, verdict)` pairs) used to make re-runs
    idempotent. One document with N stale claims produces one plan ADR, not N
    near-identical files.
5. **EMIT — publish.** Regenerate the master index
   `ADR-Plan-Recursive-Phase-Mirror-Loop.md`, the full backlog, and the state
   ledger `state/recursive_phase_mirror.json`, which records the previous run
   for drift reporting.

### 2.2 The sub-phase-mirror-agent daemon

The loop runs as a daemon (`scripts/recursive_phase_mirror.py --watch N`). It
re-scans Prime/ every N seconds, recomputes triage, and:

- emits an `ADR-RML-###` plan ADR **only when a document's cluster is new or
  its verdict signature has changed class** (idempotent re-runs reuse the
  existing plan ID and do not duplicate or rewrite levers);
- appends a run entry to the state ledger with per-tension classification, so
  drift (a tension resolving, appearing, or flipping between DOC_STALE and
  CODE_STALE) is visible across runs;
- exits cleanly on `SIGINT`/`SIGTERM`, always leaving the ledger consistent.

A single-shot run (`--watch 0` or omitted) is provided for CI and manual use.

### 2.3 Namespace and artifact layout

| Artifact | Path |
|---|---|
| Accepted ADR | `Governance/adr/accepted/ADR-232-Recursive-Phase-Mirror-Loop-on-Prime.md` |
| Loop engine + daemon | `scripts/recursive_phase_mirror.py` |
| Orchestrator | `scripts/run_recursive_phase_mirror.sh` |
| Test harness | `scripts/test_recursive_phase_mirror.py` |
| Master index | `Governance/adr/proposed/ADR-Plan-Recursive-Phase-Mirror-Loop.md` |
| Full backlog | `Governance/adr/proposed/ADR-Plan-Recursive-Phase-Mirror-Loop.backlog.md` |
| Plan ADRs | `Governance/adr/proposed/ADR-RML-###.md` |
| State ledger | `state/recursive_phase_mirror.json` |
| CI | `.github/workflows/recursive-phase-mirror.yml` |

Plan ADRs use a distinct `ADR-RML-###` namespace so recursive-loop output is
auditable separately from the older one-shot `ADR-PML-###` plans. Each plan
ADR clusters all stale claims of one document, so the plan count tracks the
number of drifting documents (157 for the first Prime run) rather than the
number of mismatched claims (1402).

## 3. Alternatives Considered

| Option | Rejected because |
|---|---|
| Extend `phase_mirror_loop.py` in place | Its `SUBSYSTEM_MAP`, `DOC_RECURSE_SUBDIRS`, and frozen-doc logic hard-code the `docs/ + lean/` scope and the four tension axes; retrofitting recursion + timestamps would rewrite most of it and break the ADR-PML series it owns. |
| Git-blame based staleness (commit date, not mtime) | Requires a clean history and network/CI coupling; the repo has large untracked trees. mtime is the only timestamp guaranteed present in a fresh checkout. |
| Pure content-hash comparison | Detects *that* things differ, not *which side* is stale; gives no lever. Used only as a tie-breaker refinement (planned, see §5). |
| Semantics/LLM classification | Non-deterministic; violates the repo's determinism conventions. The loop is deliberately syntactic so any engineer can reproduce its verdict. |

## 4. Dependencies

- `scripts/phase_mirror_loop.py` remains as the historical one-shot loop for
  the ADR-PML series; ADR-232 does not delete it.
- `state/phase_mirror_loop.json` remains the one-shot ledger; the new ledger is
  `state/recursive_phase_mirror.json`.
- The Lean declaration/sorry scanner in `phase_mirror_loop.py` is the
  implementation model for the recursive scanner.
- ADR-231's `RH_Multiplicity/` tree is the first golden-match exemplar (its
  documents and declarations are in register).

## 5. Risks

- **mtime is not a proof of content drift.** A `touch` changes mtime without
  changing content. Mitigation: a claim that resolves to a `sorry`-free
  declaration is always GOLDEN regardless of mtime; mtime is only consulted
  for genuine mismatches. Future refinement (§7) adds content hashes as a
  secondary signal.
- **Timestamp skew from checkout.** Git does not always preserve mtimes on
  fresh clones, so a doc could be mis-classified once. Mitigation: CI always
  runs `--once` (not `--watch`) with `--no-state`, treating the first run as a
  snapshot; direction matters only when both timestamps come from the same
  checkout.
- **Noise from illustrative code fences.** Template/scaffold documents show
  Lean that is not a real claim. Mitigation: the recursive scanner carries the
  same `TEMPLATE_DOCS`/frozen-dir exclusions as the existing loop.
- **Stale proposed ADRs.** Old `ADR-RML-###` plans may reference resolved
  tensions. Mitigation: the loop re-scans its own `Governance/adr/proposed/`
  output and demotes any plan whose document's claims are now all GOLDEN,
  marking it `## Status: Resolved` in place rather than deleting it, preserving
  the audit trail.

## 6. Consequences

**Positive**
- Deterministic, time-aware lever selection: every mismatch gets exactly one
  correct direction (`DOC_STALE` vs `CODE_STALE`).
- Continuous surveillance: a daemon run surfaces drift within N seconds of it
  occurring, instead of on the next manual loop run.
- Full-repo coverage: intent in `Governance/adr/`, `paper/`, `docs/`, and crate
  READMEs is mirrored against evidence in `lean/`, `rust/`, and `data/`.
- Idempotent and auditable: a verdict signature per document cluster lets
  re-runs reuse plan IDs, and per-run classification in the state ledger gives
  drift deltas and a complete machine-checked audit trail.

**Negative / constraints**
- A new plan-ADR series (`ADR-RML-###`) and a new state ledger must be
  reconciled with existing governance tooling.
- The triage is syntactic: it proves *which* artifact is newer, not that the
  newer artifact is *correct*. Human review of the lever still applies.

## 7. Future Hardening

- Content-hash fingerprints per declaration and per document (SHA-256) so
  `touch`-only updates do not create false `CODE_STALE` levers.
- Per-subsystem timestamps (mirror `SUBSYSTEM_MAP`) so a doc about ROC engine
  is compared against `rust/roc/` rather than the newest file in the repo.
- Notify hooks (`--webhook URL`) so the daemon can post new `ADR-RML-###`
  levers to a channel on first emission.
- JSON schema for the state ledger and a `--validate` subcommand.

## 8. Validation Checklist

- [ ] `scripts/test_recursive_phase_mirror.py` passes (GOLDEN / DOC_STALE /
      CODE_STALE fixtures).
- [ ] `python3 scripts/recursive_phase_mirror.py --once` emits
      `ADR-Plan-Recursive-Phase-Mirror-Loop.md` + backlog + state ledger.
- [ ] Re-running with no changes emits identical plan IDs (idempotent).
- [ ] A document with N stale claims produces exactly one `ADR-RML-###` plan
      ADR listing all N claims (clustering, not one file per claim).
- [ ] A document whose claims have all resolved GOLDEN has its plan demoted to
      `## Status: Resolved` in place (not deleted).
- [ ] A `--watch` run re-scans after the interval and exits on `SIGTERM`.
- [ ] A claimed `sorry`-free declaration resolves to GOLDEN regardless of
      mtime.
- [ ] A `sorry`-discharging declaration resolves to CODE_STALE regardless of
      mtime.
- [ ] A missing declaration with `doc_mtime < impl_mtime` classifies
      `DOC_STALE`.
- [ ] A missing declaration with `doc_mtime >= impl_mtime` classifies
      `CODE_STALE`.
- [ ] Frozen/template documents are excluded from claim harvesting.
- [ ] Loop output lands in `Governance/adr/proposed/` (not `docs/adr/`).
- [ ] `--dry-run` writes nothing.
- [ ] Existing `scripts/phase_mirror_loop.py` still runs unchanged.
