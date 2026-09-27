# PhaseMirror ALP‑CNL Wiring

**Status:** Accepted  
**ID:** ADR-2026-07-24-PhaseMirror-ALP-CNL-Wiring  
**Date:** 2026‑07‑24

---

## Executive Summary
Integrate the PhaseMirror Agent with the Automated Legal Processor (ALP) and Controlled Natural Language (CNL) pipeline to enable automated generation of legal narratives from engine‑computed preservation risk levels, while strictly adhering to the Sedona Spine Mandate (zero‑drift, path‑of‑integrity).

---

## Context
- The PhaseMirror Agent currently transforms **engine‑computed facts** (risk level, retention duration) into human‑readable narratives.
- ALP provides a robust CNL serializer that converts structured legal facts into machine‑readable natural‑language artifacts.
- Existing ADRs are stored under `Governance/adr/` and must remain the single source of truth for all ESI‑related decisions.
- The Sedona Spine mandates that **no component may recompute or reinterpret risk levels**; all transformations must be pure mappings.

---

## Decision
1. **Create a TypeScript/WASM bridge** `phaseMirrorAlpCnlBridge.ts` in `PhaseMirror/Agents/` that:
   - Receives `PreservationFact` objects from the Rust Engine via the Sedona SDK.
   - Maps each fact to the ADR schema defined in `models/legalese-scopist/ADR`.
   - Calls the ALP CNL serializer (pinned to `v1.2.3`) to produce a CNL artifact.
   - Persists the resulting CNL document in `Governance/adr/generated/` and registers a reference in the corresponding ADR file.
2. **Externalize all policy‑driven mappings** in a declarative YAML file `templates/adr-alp-cnl.yaml`. The bridge reads this file at runtime; no hard‑coded logic is introduced.
3. **Enforce immutability** by marking the generated ADR entry with `status: Accepted` and forbidding any status change unless a new ADR supersedes it.
4. **Add CI validation** (see Production Hardening section of the ADR scaffolding) that runs the bridge against the test suite and fails on any drift.

---

## Consequences
- **Zero‑Drift Guarantee:** All risk levels flow directly from the Rust Engine → SDK → ADR → UI without recomputation.
- **Automated Narrative Generation:** Legal teams can now generate motion skeletons directly from CNL artifacts, reducing manual drafting effort.
- **Dependency Management:** Introduces a runtime dependency on `@phasemirror/alp-cnl@1.2.3`. The version is locked in `package.json` and audited in CI.
- **Traceability:** Each generated CNL file includes a header with the originating ADR ID, preserving a reconstructible provenance chain.
- **Extensibility:** Future legal variations can be added by extending `templates/adr-alp-cnl.yaml` without touching code.

---

## Supersedes
None.

---

## Links
- [Engine Core](file:///home/multiplicity/Multiplicity/PhaseMirror/models/legalese-scopist/)
- [Contract.md](file:///home/multiplicity/Multiplicity/PhaseMirror/models/legalese-scopist/CONTRACT.md)
- [ALP SDK README](file:///home/multiplicity/Multiplicity/PhaseMirror/ALP/README.md)
- [ADR Policy YAML](file:///home/multiplicity/Multiplicity/PhaseMirror/templates/adr-alp-cnl.yaml)

---

*Compliance with the Sedona Spine Mandate is verified in the bridge’s test suite (`ADR/Test.lean`).*
