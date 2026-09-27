# ADR-PML-066: Published-Crate Normative Doc Channel Is Duplicated with No Parity Gate

## Status
Proposed

## Axis (Phase Mirror tension class)
intent vs operating incentives

## Owner (multi-agent lever)
`the-publisher`

## Dissonance Score
- Impact = severity (3) x blast radius (6) = **18**
- Tractability = **4.0** (leaked)
- **Score = 72.0**

## Context (stated intent vs implementation)

### Stated intent (documents)
- The normative surface is the set of *root* documents: SPEC.md, CONFORMANCE.md, README.md, ERRORS.md, RELEASE-STATUS.md, CHANGELOG.md. Their claims are granted by Appendix A conformance IDs and the `model/` registers (`CONTRACTS.md` header: "R1: the model is the single source").
- The published crate is the SDK deliverable; `crates/prismpm/` ships the project's docs alongside the Rust crate.

### Implementation reality (PrismPM corpus)
- As of 2026-09-22, `crates/prismpm/{SPEC,CONFORMANCE,README,ERRORS}.md` are **byte-identical** (whitespace-normalized) to the root documents. Verified by direct diff during this audit.
- There is **no enforced parity**: a grep of `Justfile`, `scripts/*.sh`, and `xtask/src` for doc-copy/parity checks over `crates/prismpm` finds no gate; the only `crates/prismpm` reference in `xtask` is a source path (`xtask/src/audit.rs:898`), not a doc check. Nothing prevents a future edit that diverges the crate docs from the root normatives.
- Precedent in this monorepo's own history: the deleted `platform_model/` fork of PrismPM's SPEC/CONFORMANCE drifted — dropping 17 CONFORMANCE cited-authority rows and rewriting 20 SPEC passages — while still presenting as "PrismPM documentation."

### Contradiction (productive)
The intent is "one normative source, R1" (`CONTRACTS.md`) and one delivered doc set; the incentive profile of the published crate is to carry its own copy. Without a parity gate the two honest expectations silently decouple: a reader of the crate sees the correct documents today and no binding, reproducible guarantee that the crate ships the current normative text on the next release.

### Hidden assumptions
- "Byte-identical today" is assumed to mean "enforced"; it is not.
- Crate publication is assumed to regenerate docs from root at pack time; no such regeneration exists (`xtask` pack path only packages code/stock files).

### Manifested boundary
The audit's parity spot-check (4/4 documents identical) required a manual diff; the checked-in duplicate channel has no mechanical continuity.

## Decision (the lever)
1. **Add a doc-parity gate** `scripts/check-doc-parity.sh` that byte-compares `{SPEC,CONFORMANCE,README,ERRORS}.md` between root and `crates/prismpm/` and fails on divergence; wire it into the `vv` gate sequence and CI (`release.yml`).
2. **Prefer generated shipping**: make `xtask` copy the root normatives into `crates/prismpm/` at pack time so the crate always ships current text, and gate on "no git-tracked divergence after copy".

## Consequences
- **Positive**: the crate doc channel can never become a `platform_model`-style semantic fork again; publication continuity is mechanical.
- **Negative / Constraints**: touching CI + pack path requires a PrismPM-maintainer change; the ADR itself only records the tension and the gate contract.
- **Verification Strategy**: run `check-doc-parity.sh`; delete one word in a crate doc and confirm the gate fails.

## Metrics (resolution is confirmed when)
- `scripts/check-doc-parity.sh` exists, is wired into `vv` and `release.yml`, and fails on divergence.
- Crate packaging copies root normatives (option) with no tracked divergence after copy.
- A CI regression (introduce a 1-line crate-doc edit in a branch) produces a gate failure.

## Actionable Levers
1. Author `scripts/check-doc-parity.sh` (diff loop over the four docs; exit 1 on mismatch).
2. Add `check-doc-parity` to the `vv` gate list and a step in `.github/workflows/release.yml`.
3. Adopt the pack-time copy in `xtask` for the next release.

## Links
- Drifted fork post-mortem: this repo history — pre-deletion `platform_model/SPEC.md`, `platform_model/CONFORMANCE.md`
- Normativity rule: `packages/PrismPM/CONTRACTS.md` header ("Do not edit. R1: the model is the single source.")
- Current duplicates: `packages/PrismPM/crates/prismpm/{SPEC,CONFORMANCE,README,ERRORS}.md`
- This index: `docs/adr/proposed/ADR-Plan-PrismPM-Phase-Mirror-Loop.md`