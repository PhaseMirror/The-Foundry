# ADR-0132: Registry Invariant Parity Is Layered, and Split-Source Rules Are Refused

**Status:** Accepted

## Context
lib/engine-invariants.ts presents its checks as TypeScript mirrors of invariants proven in ADR/Proofs.lean and exercised by ADR/Properties.lean, and requires that they stay in exact agreement with ADR.Core semantics. Two agreements do not hold. First, checkNoConflicts detects only the literal string form `NOT(<decision>)`. That matches ADR/Core.lean ConflictsWith, which is correct, but ADR/Core.lean documents ConflictsWith as the syntactic layer only and names the semantic layer as Contradictory over embedded PropTerm claims, enforced by ADRRegistry.noClaimConflicts. The semantic layer is never checked in TypeScript, and the header's claim of exact agreement with Core semantics is therefore broader than what the code implements. Second, transitionIsAllowedFormal tests only the status pair, while ADR/Core.lean ValidTransition is an inductive whose Accepted-to-Superseded case requires a successor ID, and app/api/adr/validate-transition/route.ts separately reimplements the table and does enforce that successor. The same Lean rule therefore has two TypeScript sources that disagree, and the stricter one is the route rather than the library. The cited name `validTransition` resolves to a third file, lean/MTPI/ADR.lean, not to ADR/Core.lean, leaving the authority ambiguous.

## Decision
Each mirrored rule names one authority, one file, and one implementation. Conflict checking is declared as the syntactic layer only and is reported under that name, so no caller reads a syntactic pass as registry-wide conflict freedom; the semantic PropTerm layer is registered as its own capability against ADRRegistry.noClaimConflicts rather than being implied by a comment. transitionIsAllowedFormal is deleted as a duplicate: app/api/adr/validate-transition/route.ts becomes the single TypeScript entry point for ValidTransition, including the successor-ID requirement, and it is bound to ADR/Core.lean as the authority with the `validTransition` citation corrected to that file. The header's blanket 'exact agreement' wording is replaced by a per-rule statement of which layer is mirrored.

## Consequences
* A registry that is syntactically conflict-free but semantically contradictory can no longer be reported as valid by /api/adr/registry
* The Accepted-to-Superseded transition has one implementation, so the successor-ID requirement cannot be dropped by editing the library copy
* The Lean authority for lifecycle transitions is unambiguous: ADR/Core.lean, not lean/MTPI/ADR.lean
* Any future mirror is registered as a capability under the registry-integrity suite with a scenario naming the layer it covers, per ADR-0130

## Traceability & Artifact Links
* **[Source File]** `packages/foundry-web/foundry-web-main/lib/engine-invariants.ts` — checkNoConflicts covers the syntactic layer only; transitionIsAllowedFormal omits the successor ID
* **[Lean Declaration]** `ADR/Core.lean` — ValidTransition inductive requiring a successor for Accepted-to-Superseded; ConflictsWith named the syntactic layer, with Contradictory as the semantic layer
* **[Lean Declaration]** `ADR/Properties.lean` — check_no_conflicts_sound and registry_conflict_free over the same predicates
* **[Source File]** `packages/foundry-web/foundry-web-main/app/api/adr/validate-transition/route.ts` — Second, stricter implementation of the transition table, including the successor-ID requirement
