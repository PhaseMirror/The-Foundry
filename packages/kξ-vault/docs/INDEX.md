# Documentation Index for KΞ Vault

This directory holds the architectural and policy artifacts that define the KΞ Vault system. Each file is listed with its declared document ID, status, and role. Where a file's name and its declared ID disagree, the ID column is authoritative and the disagreement is recorded as a defect rather than silently reconciled.

## Governance corpus

| File | Declared ID | Status | Role |
|------|-------------|--------|------|
| `ADR_PM_KXI_001_KXi_Vault_v1.0.md` | PM-KXI-001 v1.0 | Proposed | Root decision. Two-person receipt control plane over local custody. §8 carries the data plane, control plane, publisher, cross-layer, and the C-01…C-20 correction ledger. |
| `ADR_PM_KXI_002_Production_Integration_v1.0.md` | PM-KXI-002 | **Withdrawn** | Collision record. The slot is held, not filled; production-integration content was written into it in error and now lives on PM-KXI-005. Original PM-KXI-002 body is unrecoverable. See §W1–W4. |
| `ADR_PM_KXI_003_Prime_Materia_License_v1.0.md` | PM-KXI-003 v1.0 | Proposed | Prime Materia License on KΞ objects. NOTICE and metadata, not Accept. §8 places license fields in the operational schemas. |
| `ADR_PM_KXI_005_Production_Integration_v1.0.md` | PM-KXI-005 v1.0 | Proposed | Live production integration. Software only. §8 carries the four-stage verification pipeline, renumbered defect plants D001–D007, the `prismpm/sdk-lock/3` proposal, the publisher manifest, roadmap, and metrics. |
| `Master KXi Vault ADR Blueprint.md` | — | Draft input | Source of the §8 operational extensions. A draft: it does not amend a seated ADR by being written down. Two of its predicate forms were **refused** as weaker than PM-KXI-001 §10. |

## Supporting artifacts

| File | Role |
|------|------|
| `ADR_1_Claim.tex` | Core claim statement for the KΞ Vault. |
| `ADR_2_Central_Tension.tex` | Analysis of the tension between lab velocity and civic refuse. |
| `KΞ Vault.txt` | Plain-text overview of concepts, component roles, and policy statements. |
| `ML-KEM-512 is NIST PQC.md` | Reference note on ML-KEM-512. Not bound by any ADR; ML-KEM transport is out of scope per PM-KXI-001 §15. |

## Numbering gaps

Cited IDs with no document in this corpus. Recorded, not renumbered — renumbering a governance corpus to hide a gap is itself a name-law violation under PM-KXI-001 §7.

| Cited ID | Cited by | Note |
|----------|----------|------|
| PM-KXI-002 | PM-KXI-003 parent chain | Body lost; slot withdrawn. Dangling citation. |
| PM-KXI-004 | PM-KXI-005 parent chain; R4 scope exclusion | No file. R4 scope is therefore unrecorded in this tree. |
| PM-KXI-006 | Blueprint `bindings.adr`; `prismpm.lock` proposal | No document. Removed from the lock binding set (PM-KXI-001 C-20). |

## Resolved defects

| Defect | Resolution |
|--------|-----------|
| Two files declared `PM-KXI-005`; neither matched its own filename | PM-KXI-004 file renamed to `ADR_PM_KXI_005_...` (sha256-verified, content unchanged); PM-KXI-002 slot withdrawn |
| Blueprint `isAccept` dropped `holder`, `sameKeyboard`, `signs049c`, `personNamed` | Refused. PM-KXI-001 §10 retained; blueprint form logged as C-01, guarded by plant D002 |
| Blueprint `mayExportPreimage` dropped the `acceptPath = 049c` gate | Refused. §10 retained; logged as C-02 |
| Blueprint named placeholder transaction `049c_text_v1` as the domain separator | Refused. Vault-scoped constant `PM-K2-ACCEPT-v1` retained; transaction name moved to `canonical_name` (C-03) |
| Blueprint `verified_implies_two_sigs` proved `→ true` by `trivial` | Replaced with a real invariant over `transition` (C-10) |
| Blueprint `lock_version: "2.0"` would orphan the SDK consumer | Rejected. Additive `prismpm/sdk-lock/3` preserving `schema` (C-17) |
| Blueprint `manifest.json` `public_ok` self-asserted by the publisher | Producer-computed only; `refused_assets` mandatory (C-19) |

Full ledger: PM-KXI-001 §8.6, PM-KXI-003 §8.5.

## How to use

- **Read order.** PM-KXI-001 first — §3 decision and §10 predicates are the law every other paper defers to. PM-KXI-003 and PM-KXI-005 extend it and may not narrow it.
- **Status is uniform.** All live ADRs are **Proposed**. Status flips only when two distinct cryptographic identities exist. G=0 in every one of them.
- **Law versus intent.** PM-KXI-001 §10 is law. The Lean in §8.2 is *draft target Lean, uncompiled* — the only `KXiVault.lex.tex` on this bench is a 48-line LaTeX documentation skeleton. See PM-KXI-001 §8.7 for the full observed-state table.
- **A blueprint is a draft.** Where the Blueprint and a seated ADR disagree, the ADR wins and the divergence is logged with a C-number.

## Prior drafts

`ADR_PM_KXI_001_...docx` and `ADR_PM_R4_001_Prime_Router_Roadmap_v1.0.docx` are referenced by earlier revisions of this index but are **not present** in this directory. PM-KXI-001 §16 binds `ADR_PM_KXI_001_KXi_Vault_v1.0.docx` as the source of record; that `.docx` is likewise absent, and the markdown is now the readable artifact.

---

*Maintained by hand. A generated index would need to reconcile filename against declared ID to be worth anything — that check is exactly the one whose absence let two files claim PM-KXI-005.*
