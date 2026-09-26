# ADR-0128: Template Lock Integrity Precedes Capability Registration

**Status:** Accepted

## Context
packages/foundry-web/foundry-web-main/template-contract.json declares prismpm.lock and template.lock in its required_paths array, alongside the seven paths that are present. Both lock files are absent from the tree. The Justfile makes this the first recipe of the acceptance boundary: `vv: template-check fmt-check model lint test features bdd deny`, and template-check runs `cargo run -q -p xtask -- check-model`, `audit-bootstrap`, `prismpm template check`, and `prismpm lock check`. The contract's own AGENTS.md states that the trust root is checked independently of generated project content and that universal policy files are byte-bound by template.lock. A gate that names a trust root which is not on disk is not a weakened gate; it is an uninstantiable one, so no capability registered under this contract can be evidenced until the locks exist.

## Decision
prismpm.lock and template.lock are restored as byte-bound trust-root artifacts and `just template-check` passes before any row is added to model/ids.toml. Lock restoration is the first step of the build-out series, not a prerequisite of it: the lock content is taken from the exact SDK image and policy revision that the restored files name, never hand-authored to satisfy the checker. `just vv` is not reported as runnable, and no capability is described as gated, until both locks are present and the template-check recipe succeeds.

## Consequences
* The acceptance boundary becomes instantiable; before this, `just vv` cannot complete and no downstream conformance ID is evidence
* Lock content is bound to a named SDK image and policy revision, so template drift is a detectable diff rather than an unverifiable claim
* Capability registration under ADR-0129 is deferred until this decision is implemented, preserving the R3 order
* No conformance ID in model/ids.toml may be added ahead of the locks without voiding the gate it claims to satisfy

## Traceability & Artifact Links
* **[Source File]** `packages/foundry-web/foundry-web-main/template-contract.json` — Declares prismpm.lock and template.lock in required_paths; both absent on tree
* **[Source File]** `packages/foundry-web/foundry-web-main/Justfile` — `vv` acceptance boundary; template-check runs `prismpm template check` and `prismpm lock check`
* **[Specification Doc]** `packages/foundry-web/foundry-web-main/AGENTS.md` — Universal rules R1-R6 and the trust-root/template boundary
