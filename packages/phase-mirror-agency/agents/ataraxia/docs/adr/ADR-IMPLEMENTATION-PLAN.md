# Ataraxia ADR Implementation Plan: Production-Grade Architectural Governance

## 1. Analysis of Structural Gaps

Based on a comprehensive audit of the `models/ataraxia` documentation, the following structural gaps have been identified:

| Gap Category | Observations | Impact |
| :--- | :--- | :--- |
| **Fragmentation** | ADRs are scattered across `docs/`, `docs/adr/`, `apps/`, and `crates/` (e.g., `umc-parom`, `echo-kernel`). | High friction in discovering the current architectural state. |
| **Naming Divergence** | Inconsistent formats: `ADR-XXX-###`, `####-name.md`, and prose-based titles like `TUI REFACTOR.md`. | Difficult to sort, automate, or reference programmatically. |
| **Lifecycle Ambiguity** | Duplicate IDs across `proposed` and `accepted` folders; missing status/date metadata in several crate-level ADRs. | Risk of implementing superseded or rejected designs. |
| **Indexing Deficit** | No central registry or "map" of architectural decisions spanning the entire Ataraxia ecosystem. | Siloed knowledge; architectural drift between crates and global docs. |
| **Prose vs. Record** | Massive overview documents (e.g., `Agentic Governance Healthcare Infrastructure.md`) contain "hidden" decisions not formalized as records. | Hard to track changes to specific invariants over time. |

---

## 2. ADR Standard (The Ataraxia Format)

All future and migrated ADRs MUST adhere to the following standard:

### File Naming
`ADR-{SCOPE}-{ID}-{SLUG}.md`
- **Scope:** `ARCH` (Global), `AHGI` (Governance), `CLI`, `MATH`, or specific crate names (e.g., `UMC`).
- **ID:** 3-digit zero-padded number (e.g., `001`).
- **Slug:** Kebab-case descriptive title.

### Mandatory Metadata Header
```markdown
# ADR-{SCOPE}-{ID}: {Title}

- Status: proposed | accepted | implemented | verified | superseded | rejected
- Date: YYYY-MM-DD
- Owners: @handle or team-name
- Tags: [e.g., runtime, security, crypto]
- Depends On: [ADR-ID]
- Supersedes: [ADR-ID]
```

---

## 3. Implementation Roadmap

### Phase 1: Consolidation & Normalization (Immediate)
1.  **Registry Root:** Initialize `docs/adr/README.md` as the Master Index.
2.  **Global Move:** Relocate standalone ADRs in `docs/` (e.g., `ADR-AHGI-000-Initialization.md`) into `docs/adr/accepted/`.
3.  **Renaming Sprint:** Normalize filenames across the `docs/adr/` tree to match the `ADR-{SCOPE}-{ID}-{SLUG}.md` format.

### Phase 2: Crate-to-Global Linking (Short-term)
1.  **Manifest Pattern:** Each crate with internal ADRs must maintain a local `ADR-INDEX.md`.
2.  **Cross-Referencing:** Update the Master Index in `docs/adr/` to point to these local manifests, creating a "Hub and Spoke" documentation model.
3.  **Backfill Metadata:** Update crate-level ADRs (like those in `echo-kernel` and `umc-parom`) to include the standard metadata header.

### Phase 3: Tooling & Governance Integration (Medium-term)
1.  **Validation Script:** Add a `just lint-adr` command to check for naming collisions and metadata completeness.
2.  **Constitutional Anchor:** Explicitly link `ADR-AHGI-000` (Amendment Protocol) to the ADR lifecycle, requiring a "verified" status for any change affecting the `Ξ-Constitution`.
3.  **Decision Extraction:** Decompose large prose documents (like the AHGI overview) into discrete ADRs for technical invariants.

---

## 4. Master Index Scaffold (Draft)

*Proposed structure for `docs/adr/README.md`:*

- **Governance (AHGI):** [ADR-AHGI-000](./accepted/ADR-AHGI-000-initialization.md), [ADR-AHGI-003](./accepted/ADR-AHGI-003-thymos-runtime.md)
- **Core Architecture (ARCH):** [ADR-ARCH-001](./accepted/ADR-ARCH-001-lan-sync.md)
- **Math & Primes (MATH):** [ADR-MATH-001](./accepted/ADR-MATH-001-mkt-constant-authority.md)
- **Sub-Project Indices:**
    - [Echo Kernel ADRs](../../crates/echo-kernel/adr-kernel-rs/docs/adr/ADR-INDEX.md)
    - [UMC Parom ADRs](../../crates/umc-parom/docs/adrs/ADR-INDEX.md)
