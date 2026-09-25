# ADR-PML-065: VERIFICATION.md Prose Receipts Are Not Commit- or Run-Bound

## Status
Proposed

## Axis (Phase Mirror tension class)
risk claimed vs risk owned

## Owner (multi-agent lever)
`the-examiner`

## Dissonance Score
- Impact = severity (3) x blast radius (10) = **30**
- Tractability = **3.0** (leaked)
- **Score = 90.0**

## Context (stated intent vs implementation)

### Stated intent (documents)
- `SPEC.md` §8/§9 define the normative acceptance evidence as `prismpm/vv-evidence/1` which "binds the exact full Git commit" (`SPEC.md:495`) and lists all 15 gates recording `passed`.
- VERIFICATION.md is the human narrative ledger of the 15-gate falsification campaign (Gates 1-15 plus the OC-, DK-, SY- claim families), i.e. the documentary "risk owned" channel for the verification claims it makes.

### Implementation reality (both corpora)
- The prose ledger quotes standalone SHA-256 receipts with no binding artifacts: `cea54c6b5d65f98ce235ed9911653a5622478c50c51600fc0212f1e14bd54f98` at `VERIFICATION.md:44` and `037a3543c5c8a3230b4368d1bb37a1e54709360aabdcdbc5b8d438f92b9121ac` at `VERIFICATION.md:49`.
- The hashes cite no git commit, no attestation identifier, and no correlation to `target/vv-evidence.json`; re-running `vv` today neither re-derives them nor invalidates them in-tree.
- VERIFICATION.md itself scopes the ledger: "Complete clean-tree SDK verification remains required" (`VERIFICATION.md:1376`) — the ledger is explicitly partial, yet nothing in-tree records which claims are ledger-only, why, or which commit each refers to.

### Contradiction (productive)
Risk is *claimed* at the granularity of prose + bare hashes, while risk is *owned* only by `prismpm/vv-evidence/1` bound to a commit. The claimed risk (15-gate closure, OC/DK/SY families) floats free of the owned risk (the exact commit receipt). Forward-portability of the narrative claims is therefore unenforceable: a future reader cannot tell whether `VERIFICATION.md`@HEAD reflects the commit whose `vv-evidence.json` is attestation-bound, or a stale superset.

### Hidden assumptions
- Bare SHA-256 strings in prose are treated as meaningful receipts even though no document states what produced them or how they are checked.
- The "partial" scoping (`VERIFICATION.md:1376`) is assumed to be the exception list; in fact no machine-readable denotation of it exists.

### Manifested boundary
During the reported audit the ledger's two headline receipt hashes could not be mapped to `target/vv-evidence.json`, a build tag, or a git commit anywhere in the tree.

## Decision (the lever)
1. **Add a binding header to VERIFICATION.md** recording `bound-to-commit`, `vv-run-identifier`, and `attestation-id` for the `vv-evidence.json` that the narrative reflects.
2. **Make the ledger state-explicit**: mark each claim family (Gates 1-15, OC*/DK*/SY*) as `bound` (matches the commit-bound evidence) or `advisory` (the `VERIFICATION.md:1376` class), rather than leaving all prose at one nominal confidence.
3. **Gate the drift**: add a `vv`/`xtask` check that fails if VERIFICATION.md's `bound-to-commit` header does not equal HEAD of the commit whose `vv-evidence.json` is attestation-bound.

## Consequences
- **Positive**: the narrative ledger becomes auditable against the normative commit-bound receipt; forward paper-trail is enforceable.
- **Negative / Constraints**: requires touching the ledger head and one gate; no change to the normative `prismpm/vv-evidence/1` semantics.
- **Verification Strategy**: assert `grep "^bound-to-commit:" VERIFICATION.md/HEAD` matches the attestation-bound revision.

## Metrics (resolution is confirmed when)
- VERIFICATION.md carries a `bound-to-commit` + `vv-run-identifier` header matching the attestation-bound revision.
- Each claim family is tagged `bound` or `advisory`.
- A gate exists that fails on header/commit mismatch.

## Actionable Levers
1. Add the header block to VERIFICATION.md (one paragraph, machine-checked line format).
2. Add the header-mismatch check to the `vv` gate list in `Justfile`/`scripts/vv.sh`.
3. Tag the OC-/DK-/SY- families `bound` vs `advisory` in the ledger's summary table.

## Links
- Ledger: `packages/PrismPM/VERIFICATION.md` (`:44`, `:49`, `:1376`)
- Normative binding: `packages/PrismPM/SPEC.md` §9 (`:494-495`)
- Scope note: `packages/PrismPM/RELEASE-STATUS.md` "clean-tree full V&V and installed dual-architecture SDK acceptance remain separate requirements"
- Sibling analysis: `docs/adr/proposed/ADR-PML-061-*.md`
- This index: `docs/adr/proposed/ADR-Plan-PrismPM-Phase-Mirror-Loop.md`