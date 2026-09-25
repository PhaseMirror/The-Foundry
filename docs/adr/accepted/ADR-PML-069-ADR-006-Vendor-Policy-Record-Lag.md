# ADR-PML-069: ADR-006 lean4-prod Vendor Policy Is Operational but the Record Remains Proposed

## Status
Proposed

## Axis (Phase Mirror tension class)
control desired vs available

## Owner (multi-agent lever)
`the-publisher`

## Dissonance Score
- Impact = severity (2) x blast radius (3) = **6**
- Tractability = **4.0** (leaked)
- **Score = 24.0**

## Context (stated intent vs implementation)

### Stated intent (documents)
- ADR-006 (`docs/adr/006-lean4-prod-upstream.md`) is the dependency-management record for the lean4-prod fork. Its Status reads **Proposed**. Its Decision defines "vendored artifacts are release artifacts" with a fork contingency (`vendor/lean4-prod/UPSTREAM_STATUS.md`, `model/dependencies.toml` pin `ac84a4de575e2e531ddb6453c86b84a6794fe48b`), and RELEASE-STATUS.md:94-127 tracks the 15 upstream contributions (issue 70, PRs 38-69).

### Implementation reality (PrismPM corpus)
- The policy the ADR proposes is already the operating, normative state: CONFORMANCE.md's Cited Authorities table lists the acquired lean4-prod-fork values (LEAN-REL-4-32-1, LAKE, LEANCHECKER bindings with SHA-256); RELEASE-STATUS.md declares the 0.3.0 release acceptance closure complete; README.md states "Version 0.3.0 is the accepted production-system SDK release"; SPEC.md §8 binds the verification pipeline to the pinned fork revision.
- The record therefore lags the implementation: the governing decision is today's normative authority, yet its governance entry is still "Proposed" — the exact "record lag" condition the phase-mirror plane exists to catch.

### Contradiction (productive)
A governance entry marked Proposed that is relied upon as the binding decision creates a false-open signal: a reader concludes the vendoring/fork posture is still under discussion while every normative document already depends on it. The honest states are "Accepted (with Phase-2 ecosystem-merge materialization pending in RELEASE-STATUS)" or "Superseded by RELEASE-STATUS-driven release tracking".

### Hidden assumptions
- No other doc formalizes the "vendored artifacts are release artifacts" policy; ADR-006 remains its only home, so the lag cannot be attributed to a successor document.
- Phase 1 (SDK release) achieved and Phase 2 (ecosystem release) in flight is a status distinction the record does not perform, since it stays flat "Proposed".

### Manifested boundary
Cross-read during the reported audit: `docs/adr/006` (Proposed) vs CONFORMANCE.md cited authorities / RELEASE-STATUS release-closure / README accepted-release text. Independent of this authored pass, PrismPM's own ADR-006 references RELEASE-STATUS.md continuously, i.e. the timeline inconsistency is visible from inside the plane.

## Decision (the lever)
1. **Promote ADR-006 to Accepted** with a status line recording "Phase 1 (SDK) closure achieved; Phase 2 (ecosystem-release) merge materialization still tracked in RELEASE-STATUS.md" — the decision text is unchanged, only the status and the phase denotation are corrected.
2. **Or supersede**: if the operative posture has moved to the fork contingency / RELEASE-STATUS-led tracking, record ADR-006 as Superseded by a maintenance ADR and keep the vendor policy text as normative.
3. **Policy**: define that a Proposed ADR may not be cited by CONFORMANCE.md Cited Authorities (add to the conformance-id registry hygiene rule).

## Consequences
- **Positive**: the governance record matches the normative reality; the false-open signal closes; the Cited-authorities hygiene rule becomes mechanically checkable.
- **Negative / Constraints**: promotion requires PrismPM owner sign-off (the ADR is a release-governance artifact); no code or corpus change.
- **Verification Strategy**: grep CONFORMANCE.md Cited Authorities for any ADR-status string and confirm none is Proposed.

## Metrics (resolution is confirmed when)
- ADR-006 status reads Accepted (or Superseded) with the phase denotation, matching RELEASE-STATUS.md.
- A hygiene rule exists: Proposed ADRs may not appear in Cited-authorities / contract tables.
- The index's dangling-entry count for PrismPM docs/adr is 0.

## Actionable Levers
1. Rewrite ADR-006's Status block (Accepted + phase materialization note).
2. Add the advocacy check to the phase-mirror loop's document detector (no Proposed ADR in a normative citation table).
3. Cross-check ADR-002 (crates.io bootstrap, also Proposed): consistent with reality (not yet performed) — leave unchanged, but note it in the backlog as the next record to watch.

## Links
- Record: `packages/PrismPM/docs/adr/006-lean4-prod-upstream.md`
- Operational normativity: `packages/PrismPM/CONFORMANCE.md` (Cited authorities), `packages/PrismPM/RELEASE-STATUS.md`, `packages/PrismPM/README.md`
- Sibling record at risk: `packages/PrismPM/docs/adr/002-crates-io-bootstrap.md`
- This index: `docs/adr/proposed/ADR-Plan-PrismPM-Phase-Mirror-Loop.md`