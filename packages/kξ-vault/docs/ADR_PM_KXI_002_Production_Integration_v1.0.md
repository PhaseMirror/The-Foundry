**PM-KXI-002 — WITHDRAWN SLOT**

**Withdrawn: content lost, slot reserved**

No production-integration decision lives here. This slot is held, not filled.

| Field | Binding |
| :---- | :---- |
| Document ID | PM-KXI-002 · **Withdrawn** · 27 September 2026 |
| Status | Withdrawn. No live decision. No Accept. G=0. |
| Withdrawal reason | Filename/ID collision. See below. |
| Superseded in substance by | PM-KXI-005 (file `ADR_PM_KXI_005_Production_Integration_v1.0.md`) |
| Cites | PM-KXI-003 §8 lists PM-KXI-002 as a parent. That citation is now dangling. |
| Money / G | None. G=0. |

# **W1. Why this document is withdrawn**

On this bench, the file `ADR_PM_KXI_002_Production_Integration_v1.0.md` was byte-identical to `ADR_PM_KXI_004_Production_Integration_v1.0.md` except for one `Parent` line, and **both files declared the document ID `PM-KXI-005`**. Two different files claimed one document number, and neither file's name matched its own declared ID.

That is a name collision, not a drafting disagreement. `ADR-001` §7 already refuses homonym fusion as a defect class; the same rule applies to document numbers.

Verification of the collision, before correction:

```
$ diff <(tail -n +2 ADR_PM_KXI_002_Production_Integration_v1.0.md) \
       <(tail -n +2 ADR_PM_KXI_004_Production_Integration_v1.0.md)
11c11
< | Parent | PM-KXI-001; PM-K3-001; ... |
---
> | Parent | PM-KXI-001; PM-KXI-003; PM-KXI-004; ... |
```

One line differs. The bodies are the same paper.

# **W2. Correction applied**

1\. The later draft, whose `Parent` chain reaches `PM-KXI-003` and `PM-KXI-004`, was taken as the live production-integration paper and its file renamed to `ADR_PM_KXI_005_Production_Integration_v1.0.md` so that filename, declared ID, and blueprint binding all agree on `PM-KXI-005`. Rename verified by identical `sha256` before and after.

2\. This file is retained as the withdrawal record for the `PM-KXI-002` slot. The production-integration body that was wrongly written into it is not restated here; it lives on `PM-KXI-005`.

3\. The original `PM-KXI-002` body is **not recoverable from this tree**. The tree holds no version control, so no prior revision can be recovered. This is recorded as a gap, not papered over. If a genuine `PM-KXI-002` text exists elsewhere, it may be restored into this slot under a dated line, and `PM-KXI-003`'s parent citation becomes valid again.

# **W3. Outstanding numbering gaps**

| Cited ID | Cited by | Present in this corpus |
| :---- | :---- | :---- |
| PM-KXI-002 | `PM-KXI-003` parent chain | No. Withdrawn slot. Body lost. |
| PM-KXI-004 | `PM-KXI-005` parent chain; R4 scope exclusion | No. No file. |
| PM-KXI-006 | Blueprint `bindings.adr` and `prismpm.lock` proposal | No. See `PM-KXI-001` §8.6. |

A number cited as a parent is not thereby satisfied by a file. These three gaps are governance defects, and they are logged rather than renumbered, because renumbering a governance corpus to hide a gap is itself a name-law violation.

# **W4. What this slot does not do**

Does not integrate anything. Does not authorize a release. Does not Accept. Does not name K2. Does not open Week 1. Does not move funds. G=0.

An empty slot is honest. A filled slot with the wrong number is not.
