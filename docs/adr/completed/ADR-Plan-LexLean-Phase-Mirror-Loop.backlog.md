# Phase Mirror Dissonance Loop — LexLean Tension Backlog

> Authored audit backlog (2026-09-21) for the LexLean claim/binary plane.
> Full ranked detail of all 6 detected tensions. Each tension rolls up into
> a plan ADR (see `ADR-Plan-LexLean-Phase-Mirror-Loop.md`).

| # | Plan ADR | Axis | Sev | Radius | Tract | Score | Leak |
|---|----------|------|-----|--------|-------|-------|------|
| 1 | ADR-PML-058 | risk claimed vs risk owned | 4 | 10 | 5.0 | 200.0 | no |
| 2 | ADR-PML-060 | risk claimed vs risk owned | 4 | 12 | 4.0 | 192.0 | no |
| 3 | ADR-PML-057 | control desired vs available | 4 | 15 | 3.0 | 180.0 | no |
| 4 | ADR-PML-059 | intent vs operating incentives | 3 | 8 | 7.0 | 168.0 | no |
| 5 | ADR-PML-061 | control desired vs available | 3 | 9 | 6.0 | 162.0 | no |
| 6 | ADR-PML-062 | risk claimed vs risk owned | 3 | 7 | 7.0 | 147.0 | no |

## Per-tension detail

### 1. ADR-PML-058 — Atlas provenance plane single-bound (Score 200.0)
**Evidence**: `examples/uor-atlas/MIGRATION.md` (native tree
`79c3212…`, independent Lean tree `71fc050…`, both absent from release);
`CONFORMANCE.md` `VR-19` claims "native Atlas source graph is self-contained";
register rows are owned by the generated `Atlas.lex.tex`.
**Productive contradiction**: import-plane locality (VR-19) vs
content-plane provenance (external, frozen). **Levers**: re-import gate
(`just atlas-prov`), sampled shared-label cross-check vs Foundry module
(S4/S37/S38/S43), README/register wording.

### 2. ADR-PML-060 — audit instrumentation unnamed TCB (Score 192.0)
**Evidence**: SPEC §5.1 names 7 TCB items, omits the conformance
runner/xtask/registry parsers/just; `build` claims self-oracle via shipped
goldens; leanchecker is same-kernel (§4.2).
**Productive contradiction**: the auditor is the judged tree's own code.
**Levers**: itemize + pin instrumentation in the attestation (rustc/cargo/just
digests), clean-tarball release gate, planted-defect drill, parser-differential
test.

### 3. ADR-PML-057 — toolchain plane unbound (Score 180.0)
**Evidence**: LexLean `lean-toolchain` + SPEC §8.2 = 4.32.1 (tree
`f054605…`); Foundry `lean-toolchain` = 4.34.0-rc2; CF-14 refuses other
versions; §22.5 parser is pinned-form-only; observed PATH-shadowing incident.
**Productive contradiction**: two kernel-backed artifacts under exclusive
pins. **Levers**: root pin + per-package delta, cross-pin re-elaboration
(`state/toolchain-plane.json`), skeleton guard.

### 4. ADR-PML-059 — one-IR-two-tracks, single unqualified register (Score 168.0)
**Evidence**: README:3/9 "one semantic representation"; loader
`lexicon/mod.rs:171-178` routes bootstrap vs bootstrap-1.1; semantics vs
semantics-1.1 backends (3 vs 9, lowering 1 vs 2); SPEC §17.11 adds
`\semanticdata`; SM-16…22/DF-11/CL-20 are 1.1-only but §31 has no language
facet.
**Productive contradiction**: "223 IDs pass" is a four-way conjunction.
**Levers**: add `language` facet (schema v2), enforce in the model gate,
three-way accounting in README/CONFORMANCE, reword "one semantic
representation".

### 5. ADR-PML-061 — evidence not forward-portable (Score 162.0)
**Evidence**: §22.5/VR-10 accepts only pinned 4.32.1 `# print axioms` forms;
§17.11 budgets 100000/1000000000 fixed, "do not assert … every host"
(line 2391); determinism (R10/AR-08) is byte-scoped.
**Productive contradiction**: artifact determinism vs host-dependent
verification success. **Levers**: attest budgets+parser grammar in every
record, budget-superset import rule, versioned §22.5 forms + VR-10 delta
attestation drill.

### 6. ADR-PML-062 — release plane split (Score 147.0)
**Evidence**: README:26-27 docker `:0.3.0` verify + README:129 "all 223
pass"; RP-12/`just release` refuse until 1.0.0; no per-tag attestation.
**Productive contradiction**: "release refused" vs "pullable advertised
verification path". **Levers**: per-tag attestation ledger,
scoped README wording, immutable commit-level tags.

## Resolution log
- 2026-09-21: baseline authored (aggregate 1049.0); all six tensions Integrated - Deployment Ready.