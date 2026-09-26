# 🏛️ Ataraxia Architectural Decision Records (ADRs)

This directory serves as the canonical registry for all architectural decisions governing the Ataraxia ecosystem, its healthcare infrastructure (AHGI), and its mathematical runtimes.

## 🧭 Governance Process

Decisions are governed by [ADR-AHGI-000](./accepted/ADR-AHGI-000-initialization.md).
- **Proposed:** Decisions currently under review.
- **Accepted:** Ratified decisions ready for implementation.
- **Implemented:** Decisions verified in the codebase.
- **Superseded/Rejected:** Historical records for architectural lineage.

---

## 📂 Master Index

### 🛡️ Governance & Constitution (AHGI)
- [ADR-AHGI-000: Constitutional Authority](./accepted/ADR-AHGI-000-initialization.md)
- [ADR-AHGI-001: AHGI Constitutional Scope](./proposed/ADR-AHGI-001.md)
- [ADR-AHGI-002: Archivum Integration Protocol](./proposed/ADR-AHGI-002.md)
- [ADR-AHGI-003: Thymos Runtime Specification](./accepted/ADR-AHGI-003-thymos-runtime.md)
- [ADR-AHGI-004: PEET Drift Engine](./accepted/ADR-AHGI-004-peet-drift-engine.md)

### 🏗️ Core Architecture (ARCH)
- [ADR-ARCH-001: LAN Sync Protocol](./accepted/ADR-ARCH-001-lan-sync.md)
- [ADR-MIG-001: Rust Package Migration](./accepted/ADR-MIG-001-rust-package-migration.md)

### 🧩 System Components
- **Identity & Policy:** [ALP-001](./accepted/ADR-ALP-001-alp-policy-plane.md), [ALP-002](./accepted/ADR-ALP-002-trust-levels.md), [WIT-001](./accepted/ADR-WIT-001-unified-witness.md)
- **Execution:** [SIG-001](./accepted/ADR-SIG-001-sigma-execution-kernel.md), [WF-001](./accepted/ADR-WF-001-declarative-workflows.md)
- **Interfaces:** [CLI-001](./accepted/ADR-CLI-001-tui-library.md), [GTM-001](./accepted/ADR-GTM-001-native-control-surfaces.md)
- **Integration:** [INT-001](./accepted/ADR-INT-001-legacy-adapters.md), [MCP-001](./accepted/ADR-MCP-001-mcp-native-boundaries.md)
- **Math:** [MATH-001](./accepted/ADR-MATH-001-mkt-constant-authority.md)

---

## 📦 Sub-Project ADRs

The following crates maintain local ADRs specific to their internal implementation:

- [**Echo Kernel**](../../crates/echo-kernel/adr-kernel-rs/docs/adr/ADR-INDEX.md)
- [**UMC Parom**](../../crates/umc-parom/docs/adrs/ADR-INDEX.md)
- [**Microsoft AGT Rust**](../../apps/microsoft-agt-rust/architecture/ADR-INDEX.md)

---

## 🛠️ Contribution
To propose a new decision, use the [ADR Template](./templates/adr-template.md) and submit a file to the `proposed/` directory.
