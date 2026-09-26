# ADR-0135: packages/foundry-web Is Tracked and Runs the Acceptance Gate in CI

**Status:** Accepted

## Context
`git ls-files packages/foundry-web` returns no paths: nothing in the package is tracked, and the same holds for packages/foundry-web-example. The working tree nonetheless contains .next/, target/, and node_modules/ inside the package, and the package's .gitignore covers /target/, /reports/, criterion/, and fuzz working state but lists none of .next/, node_modules/, or tsconfig.tsbuildinfo, so a first `git add` would stage build output. The package carries its own four workflows, including .github/workflows/prismpm.yml and bootstrap.yml, which are themselves inside the untracked tree and therefore run nowhere. Nothing executes `just vv` against this package. The consequences for this series are direct: every other decision here is enforced by a gate, and today no gate observes the code those decisions govern.

## Decision
The package is added to version control with build output and dependency directories excluded, extending the package .gitignore to cover .next/, node_modules/, and tsconfig.tsbuildinfo before the first commit so no generated artifact enters history. The package's CI runs the same `just vv` boundary locally, in the digest-pinned devcontainer, as the contract requires, and a failing gate is non-negotiable. Until the package is tracked and gated, no decision in this series may be described as enforced, and no conformance ID registered under ADR-0129 may be reported as gated; both are recorded as decided but unenforced until the gate observes them.

## Consequences
* Every gate in this series gains an execution point, so ADR-0128 through ADR-0134 stop being decisions without an observer
* Build output and dependency directories are excluded before the first commit, keeping generated artifacts out of history
* CI runs the full `vv` boundary rather than a reduced path, so a slice cannot be used for release
* Enforcement status is reported honestly until this decision lands: the series is decided, the gate is not yet running

## Traceability & Artifact Links
* **[Source File]** `packages/foundry-web/foundry-web-main/.gitignore` — Excludes Rust and fuzz output; omits .next/, node_modules/, and tsconfig.tsbuildinfo
* **[Source File]** `packages/foundry-web/foundry-web-main/.github/workflows/prismpm.yml` — Package CI workflow, present inside the untracked tree and running nowhere
* **[Source File]** `packages/foundry-web/foundry-web-main/Justfile` — The `vv` boundary that CI must run and may not reduce
* **[Specification Doc]** `packages/foundry-web/foundry-web-main/AGENTS.md` — `just vv` as the complete acceptance boundary; no reduced release path
