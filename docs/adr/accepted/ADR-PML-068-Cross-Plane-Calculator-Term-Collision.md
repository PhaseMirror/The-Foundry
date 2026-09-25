# ADR-PML-068: Cross-Plane "Calculator" Term Collision Between PrismPM Contracts and Foundry ADR-0121/0122

## Status
Proposed

## Axis (Phase Mirror tension class)
intent vs operating incentives

## Owner (multi-agent lever)
`the-guardian`

## Dissonance Score
- Impact = severity (3) x blast radius (6) = **18**
- Tractability = **2.0** (leaked)
- **Score = 36.0**

## Context (stated intent vs implementation)

### Stated intent (documents)
- The PrismPM S-plane normatively defines "calculator" as a bounded portable application artifact: SPEC.md §9 (`:500`) names `prism-calculator = 0.1.0`, `Calculator.holo`, and the calculator-example Pages app; CONTRACTS.md (:35) declares the mechanical contract `prismpm/calculator-baseline/1` (`closed`; `exact-major`; shape-validated against `schemas/calculator-baseline.schema.json`); the CalculatorSystem reference model and `examples/Calculator/` codify it.
- Foundry's pending ADRs re-scope the same word: `docs/adr/proposed/ADR-0121-Physics-Calculator-Scope.md` decides the phrase "unified physics calculator" is an "undefined vibe claim" with no mechanical bindings, and `docs/adr/proposed/ADR-0122-Physics-Integration-Boundary.md` strictly segregates physics modules from the fail-closed crypto interlocks.

### Implementation reality (both corpora)
- Both planes use the token "calculator" with disjoint meanings and no cross-reference: PrismPM's is a normatively-scoped, schema-locked S-plane artifact; Foundry's ADR-0121/0122 treat "physics calculator" as an untethered label to be defined away.
- Nothing in either document binds the other: ADR-0121/0122 do not cite `prismpm/calculator-baseline/1` (or `Calculator.holo`/`CalculatorSystem`), and SPEC/CONTRACTS do not anticipate the Foundry re-scoping. The shared word will collide on the first Foundry/PrismPM integration touchpoint (the published PrismPM ADR-007 posture: Foundry portal integration) and in any term-gated search across the phased corpora.

### Contradiction (productive)
Two nominally-consistent planes (PrismPM portable calculator artifact; Foundry physics-calc-vibe elimination) use the identical token for non-identical concepts, and each document set is locally sound on the assumption that the other plane's meaning does not leak. The unresolved semantic overlap is a maintainable intersection bug: a future ADR or conformance ID referencing "calculator" will be ambiguous, and the disambiguation is not stated anywhere.

### Hidden assumptions
- "Calculator" is unambiguous within each plane's local doc set (false across planes).
- ADR-0121/0122 acceptance (if it proceeds) fully closes the physics-calc question without naming the PrismPM calculator artifact (it does not).

### Manifested boundary
During the reported audit the same token was found normatively defined in PrismPM (CONTRACTS.md:35, SPEC.md:500) and re-scoped in Foundry proposed ADRs (`docs/adr/proposed/ADR-0121-*`, `ADR-0122-*`), with zero cross-citation.

## Decision (the lever)
1. **Name the binding**: record in this index that the only *mechanical* S-plane "calculator" contract is `prismpm/calculator-baseline/1` + `Calculator.holo`; the Foundry ADR-0121/0122 "physics calculator" phrasing must resolve against that artifact (bind to it, supersede it, or drop the label).
2. **Amend ADR-0121/0122** (when next touched) with a cross-plane reference block citing `prismpm/calculator-baseline/1` and stating the disambiguation explicitly.
3. **Add a cross-plane term gate** to a future Foundry loop iteration (or PrismPM parity gate per ADR-PML-066) scanning both planes for shared tokens ("calculator") that lack an explicit disambiguation link.

## Consequences
- **Positive**: the "calculator" token becomes single-meaning across planes or explicitly disambiguated; integration ADRs will not inherit an ambiguous semanteme.
- **Negative / Constraints**: resolution action depends on Foundry ADR-0121/0122 (pending) and on a maintainer to add the cross-reference; hence the constrained tractability.
- **Verification Strategy**: term-gate a new proposed ADR containing "calculator" and confirm it requires a disambiguation reference.

## Metrics (resolution is confirmed when)
- ADR-0121/0122 (or their successors) cite `prismpm/calculator-baseline/1` / `Calculator.holo` and state the disambiguation.
- A cross-plane term gate exists and flags unlinked shared tokens.
- This index links both planes (it already does).

## Actionable Levers
1. Append the cross-plane reference block to ADR-0121/ADR-0122.
2. Record the disambiguation in this index (done) and in `packages/PrismPM/docs/adr/README.md` linkage.
3. Add the shared-token gate to the Foundry loop / a PrismPM parity gate.

## Links
- PrismPM contract: `packages/PrismPM/CONTRACTS.md:35` (`prismpm/calculator-baseline/1`)
- PrismPM artifact set: `packages/PrismPM/SPEC.md:500`
- Foundry re-scope: `docs/adr/proposed/ADR-0121-Physics-Calculator-Scope.md`, `docs/adr/proposed/ADR-0122-Physics-Integration-Boundary.md`
- This index: `docs/adr/proposed/ADR-Plan-PrismPM-Phase-Mirror-Loop.md`