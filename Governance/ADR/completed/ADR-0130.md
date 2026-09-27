# ADR-0130: Suite Partition by Enforcement Boundary

**Status:** Accepted

## Context
features/suites/README.md fixes the shape: one Gherkin file per suite, one scenario per conformance ID, each tagged with its ID and honesty level, and the `suite` field of an ids.toml row names the file its scenario lives in. `just bdd` fails if an ID has no scenario, a scenario has no ID, or an ID has no test whose name ends in it lowercased with underscores. The web surface has no such partition. Its behavior separates along four boundaries that fail in different ways and are owned by different files: registry integrity (lib/engine-invariants.ts and its Lean counterparts), engine access (lib/engine-bridge.ts), the route surface (app/api/adr, app/api/foundry, app/api/research), and process execution (app/api/terminal). A single suite would make a terminal execution defect indistinguishable from a registry invariant defect, and would let `just bdd` pass while one boundary is untested.

## Decision
The register is partitioned into five suites named by the enforcement boundary they cover, and each ids.toml row names its suite in that row: `registry-integrity` for the ADR/Core invariant mirrors, `engine-access` for registry reads and status, `route-surface` for the nine API route modules, `terminal-execution` for process invocation, and `presentation` for view and layout wiring. A boundary that has no registered ID contributes no suite file, and a suite file is not created ahead of the IDs that will populate it. Partitioning is by failure owner, not by file count, so a route that spans two boundaries is registered under the boundary whose rule it enforces.

## Consequences
* A defect in process execution, registry integrity, engine access, route shape, or presentation is attributable to exactly one suite
* `just bdd` can no longer pass with one boundary untested, because an ID with no scenario fails it independently of the others
* The five suite names become the required value domain for the `suite` field, making ids.toml self-describing
* No suite file is created until the register populates it, avoiding empty features that would read as coverage

## Traceability & Artifact Links
* **[Specification Doc]** `packages/foundry-web/foundry-web-main/features/suites/README.md` — Defines the one-file-per-suite and one-scenario-per-ID contract
* **[Source File]** `packages/foundry-web/foundry-web-main/Justfile` — `bdd` and `features` recipes inside the `vv` boundary
* **[Source File]** `packages/foundry-web/foundry-web-main/lib/engine-invariants.ts` — Registry-integrity boundary: acyclicity, conflict, and transition mirrors
* **[Source File]** `packages/foundry-web/foundry-web-main/lib/engine-bridge.ts` — Engine-access boundary: registry read and status aggregation
* **[Source File]** `packages/foundry-web/foundry-web-main/app/api/terminal/route.ts` — Process-execution boundary invoked by the terminal view
