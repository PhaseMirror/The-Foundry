# ADR-0134: The ADR Routes Are the Only Write Path, Validated Against the Persisted Registry

**Status:** Accepted

## Context
app/api/adr/route.ts documents its POST as routing a new proposal into the engine's docs/adr/, and app/api/adr/registry/route.ts POST accepts an arbitrary ADR array and returns `valid = checks.uniqueIds && checks.acyclic && checks.noConflicts` computed by the partial validator described in ADR-0131. The validated array is client-supplied and is not compared with the persisted registry, so the route certifies a set the engine never stored. The transition route validates one move in isolation, with no check that the target ADR exists or that the current status matches the persisted record, so a transition can be reported valid against a registry state that does not exist. Nothing binds the three write-adjacent routes to one persisted-state read, which leaves the engine registry and the portal's view of it free to diverge.

## Decision
POST /api/adr is the single write path to the engine registry. Every write is validated against the persisted registry rather than against client-supplied state: a proposal must be unique against stored IDs, must not introduce a supersession cycle against stored records, and a status transition must start from the stored status of the named ADR and must name an existing successor when moving Accepted to Superseded. POST /api/adr/registry validates a set only as a dry-run against the stored registry and labels its result as such; it does not report validity for a set the engine did not persist. The three routes read persisted state through the one registry read established in ADR-0131, with no local array standing in for it.

## Consequences
* The portal can no longer certify a registry that the engine did not store, closing the gap between validated input and persisted state
* A transition reported valid is guaranteed to start from the ADR's real stored status and to name a real successor
* The dry-run route is labeled as a dry run, so its result is not read as a durability or persistence claim
* Write validation becomes a registered capability under the route-surface suite with negative scenarios for duplicate ID, introduced cycle, and unknown successor, satisfying R5

## Traceability & Artifact Links
* **[Source File]** `packages/foundry-web/foundry-web-main/app/api/adr/route.ts` — Proposal write path documented as routing into the engine's docs/adr/
* **[Source File]** `packages/foundry-web/foundry-web-main/app/api/adr/registry/route.ts` — POST validates a client-supplied array and returns a bare validity verdict
* **[Source File]** `packages/foundry-web/foundry-web-main/app/api/adr/validate-transition/route.ts` — Validates one transition without reference to persisted status or successor existence
* **[Source File]** `packages/foundry-web/foundry-web-main/app/api/adr/audit/route.ts` — Audit surface over the same registry, subject to the same single-read rule
