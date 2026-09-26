# ADR-002: Sovereign Local-First DevOps Trajectory

**Status**: Proposed
**Date**: 2026-07-20
**Authors**: Phase Mirror Governance
**Spec Reference**: Phase Mirror Tech Mission — Sovereign, Local-First, Extension-First, Bare-Metal Edge

---

## Context

Phase Mirror currently ships as a cloud-friendly Cargo workspace: Rust MCP servers, a WASM governance client, a React frontend, and a deterministic WASM execution subsystem (Archivum). While the Sedona Spine mandate (GEMINI.md) enforces zero-drift governance logic, the *deployment surfaces* remain dependent on host operating systems, browser runtimes, and network availability.

This creates a structural tension:

- **Sovereignty gap**: Governance receipts and Archivum entries are meaningful only if the host environment is trusted. Cloud-hosted frontends and third-party browser runtimes expand the attack surface.
- **Local-first gap**: The React frontend (`phase-mirror-echo/`) and MCP stdio servers assume a networked or at least multi-process host. Air-gapped or intermittent-connectivity environments cannot currently run the full stack.
- **Extension gap**: Users interact with Phase Mirror through CLI stdio or web UIs. There is no first-class extension surface for Chromium-based browsers or Visual Studio, which are the dominant developer and operator workspaces.
- **Bare-metal gap**: No component currently targets `no_std` or microcontroller-class hardware. The Lean 4 formalization layer (`lean/`) and Rust crates assume full OS abstractions.

The Xi-Constitution (docs/Ξ-Constitution.md) declares that "identity shall be recognized as lawful only if it is recursively reconstructible via prime-indexed canonical forms." A sovereign stack must therefore be reconstructible *locally*, without dependency on remote registries, cloud build caches, or vendor-controlled extension stores.

---

## Decision

Adopt a **Sovereign Local-First Trajectory** with four binding deployment surfaces, sequenced in three phases. All surfaces share the same governance core (Sedona Spine + Triple-Lock + Archivum) and emit identical `ContractivityReceipt` artifacts.

### Surface 1: Chromium Extension (Browser-Native Governance)

- Deliver Phase Mirror L0/L1 validation and Triple-Lock orchestration as a Chromium extension (`phase-mirror-extension/`).
- The extension bundles the existing `phase_mirror_wasm/` governance client as a WASM module, executed entirely within the browser's extension service worker or offscreen document.
- All state transitions emit `ContractivityReceipt` JSON objects stored in `chrome.storage.local` (or `browser.storage.local` for Firefox compatibility), with optional sync to a local Archivum file.
- The extension exposes a sidebar panel and context-menu actions for MCP tool governance, L0 invariant checks, and dissonance reporting.
- **Constraint**: The extension must not exfiltrate receipts or state to remote endpoints without explicit user consent. Default mode is fully offline.

### Surface 2: Visual Studio Extension (Developer-Native Governance)

- Deliver a VS Code extension (`phase-mirror-vscode/`) that wraps the same WASM governance client plus a thin Rust TCF (Trusted Compute Fragment) sidecar.
- The extension provides:
  - In-editor L0 invariant diagnostics (problem matchers reading `ContractivityReceipt` output).
  - Triple-Lock sequence visualizer (Genius → Guardian → Examiner status badges).
  - Archivum timeline view for the current workspace.
  - Governed prompt/response panel for AI coding assistants.
- The Rust sidecar communicates over stdio JSON-RPC, mirroring the existing MCP transport pattern. It is launched on-demand by the extension and terminated when idle.
- **Constraint**: The extension must remain functional when the sidecar is unavailable. Degraded mode shows last-known receipt and flags the gap.

### Surface 3: Bare-Metal Edge (ESP32 + `no_std` Rust)

- Port the core L0 invariant kernel (`phase-mirror/src/l0_invariants.rs`) and a subset of the Triple-Lock state machine to `no_std` Rust targeting the ESP32 (Xtensa LX6) and ESP32-S2/S3.
- The bare-metal target (`phase-mirror-edge/`) exposes:
  - A minimal L0 validator (bitmask checks, schema hash, drift magnitude, nonce freshness) running in ~128 KiB RAM.
  - A flash-backed Archivum shard (wear-leveled NVS partition) emitting `ContractivityReceipt` digests over UART or BLE.
  - A TinyLlama-compatible inference stub (quantized weights on SPIFFS) governed by the same `lambda_p * L_p < 1.0` stop-rule.
- Build toolchain: `espflash` + `probe-rs`, with CI matrix in `.github/workflows/esp32.yml`.
- **Constraint**: No dynamic allocation after initialization. All buffers are statically sized. The kernel must prove contractivity under the same Lean 4 theorems (cross-compiled proof obligations verified in `Prime/lean`).

### Surface 4: Local-First Data Layer (Archivum as Primary)

- Rebind the Archivum ledger from "WAL on host filesystem" to "local-first append-only log with optional peer sync."
- Every surface (extension, VS Code, ESP32) writes to a local `archivum.jsonl` file. Sync between surfaces uses a CRDT-inspired merge protocol (last-writer-wins with receipt hash tie-breaking).
- The local-first layer must satisfy:
  - **Offline admissibility**: All governance decisions are valid without network.
  - **Reconstructibility**: A full project history can be rebuilt from a single surface's local log.
  - **Sovereign seal**: The log is signed by the local device key (Ed25519), not a cloud KMS.

### Trajectory Phases

| Phase | Horizon | Deliverable | Owner |
|-------|---------|-------------|-------|
| **Phase 1** | 30 days | Chromium extension MVP (WASM client + offline storage + L0 panel) | Frontend / Extension Eng. |
| **Phase 2** | 60 days | VS Code extension + Rust TCF sidecar + Archivum local-first binding | VS Extension / Rust Eng. |
| **Phase 3** | 90 days | ESP32 `no_std` kernel + NVS Archivum shard + CI matrix | Embedded / Lean Formalization |
| **Phase 4** | 120 days | Cross-surface CRDT sync + sovereign key rotation + production hardening | DevOps / Governance |

---

## Consequences

### Positive

- **Sovereignty by construction**: No surface requires cloud build caches, remote extension stores, or third-party AI APIs to function.
- **Local-first auditability**: Every governance event is reconstructible from a single device's local Archivum log.
- **Extension ubiquity**: Chromium and VS Code are the two dominant developer workspaces. First-class extensions eliminate context switching and increase adoption.
- **Bare-metal reach**: ESP32 deployment brings Phase Mirror governance to IoT/edge scenarios where cloud connectivity is physically impossible or politically undesirable.
- **Formal continuity**: The same Lean 4 theorems (`contractive_successor_one`, `IsContractive`, `WitnessPreserved`) bind all four surfaces. Proof obligations are checked at compile time for Rust and at verification time for WASM.

### Negative

- **Extension store dependency**: While the extensions are functionally offline, distribution through the Chrome Web Store or VS Code Marketplace requires vendor account maintenance and review processes. Mitigation: self-hosted `.crx`/`.vsix` release pipeline.
- **WASM binary size**: Bundling the governance client + TinyLlama stubs into a browser extension increases install footprint. Target < 8 MiB compressed.
- **ESP32 RAM ceiling**: The full L0 validator + Triple-Lock state machine exceeds ESP32 RAM when unoptimized. Requires aggressive `#[inline(never)]` partitioning and static buffer pooling.
- **Maintenance burden**: Four surfaces multiply the CI matrix, test matrix, and security patch surface.

### Risk

- **WASM- Lean gap**: The WASM client cannot carry full Lean 4 proof terms. Only digest hashes (`LEAN_PROOF_HASH_108_CORE`) are embedded. Risk of proof drift if the Rust kernel and Lean theorem are modified independently. Mitigation: CI gate enforces `lake build` hash matches embedded WASM constant.
- **Extension API volatility**: Chromium Manifest V3 and VS Code API changes may require rewrites. Mitigation: abstract extension APIs behind a shared Rust `extension-host` crate.
- **ESP32 supply chain**: The ESP32 toolchain depends on `espflash` and `probe-rs`, which are community-maintained. Mitigation: vendor critical patches and maintain a fallback OpenOCD configuration.

---

## Receipt Linkage

Every governed action across all four surfaces must carry:

```
witness_id: sha256:<64-hex-chars>
proof_hash: LEAN_PROOF_HASH_108_CORE
lean_manifest_hash: <lake-manifest.json sha256>
surface: ChromiumExtension | VSCodeExtension | ESP32Edge | LocalFirstData
archivum_log: <sha256 of local archivum.jsonl tail>
```

---

## Milestones

| Milestone | Owner | Horizon | Acceptance Criteria |
|-----------|-------|---------|---------------------|
| Chromium extension MVP ships | Frontend / Extension Eng. | 30 days | L0 panel active offline; ContractivityReceipt stored in `chrome.storage.local`; WASM client passes same test vectors as `phase_mirror_wasm`. |
| VS Code extension + TCF sidecar | VS Extension / Rust Eng. | 60 days | Extension marketplace `.vsix` built; sidecar launches on demand; problem matcher flags L0 violations; Archivum local-first binding passes CRDT merge test. |
| ESP32 `no_std` kernel boots | Embedded / Lean Formalization | 90 days | `espflash` loads kernel; NVS Archivum shard persists receipt; UART emits valid `ContractivityReceipt` JSON; CI matrix (`esp32`, `esp32s2`, `esp32s3`) green. |
| Cross-surface sync + hardening | DevOps / Governance | 120 days | CRDT merge reconciles divergent logs without receipt loss; sovereign key rotation scripted; all surfaces pass `lake build` hash verification. |

---

## References

- `docs/Ξ-Constitution.md` — Constitutional law governing all lawful systems.
- `GEMINI.md` — Sedona Spine mandate and PIRTM-lang roadmap.
- `README.md` — Current architecture overview (Rust workspace, WASM, React, MCP).
- `archives/adr/completed/ADR-001-Combined-Mandate.md` — Combined Sedona Spine governance framework.
- `archives/adr/completed/ADR-011-Sovereign-Boundary-Enforcement.md` — Sovereign boundary proof-terms.
- `Prime/lean/Core/f1_square/docs/adr/ADR-106-Sovereign-Stack.md` — Production-grade provenance and attestation layer.
- `docs/adr/ADR-0xx-lean-formalization-mandate.md` — Lean 4 formalization mandate for L0 invariants.
- `docs/adr/ADR-0xx-candle-integration.md` — TinyLlama inference governance (target for ESP32 stub).
- `phase_mirror_wasm/src/lib.rs` — Existing WASM governance client (upstream for Chromium/VS Code extensions).
- `Prime/crates/archivum/spec/PRIME-ABI-v0.md` — Deterministic WASM ABI (upstream for ESP32 guest shard).
