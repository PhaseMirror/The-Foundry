# ADR-003: Sovereign Stack Implementation — Component Binding & Extension Surfaces

**Status**: Proposed
**Date**: 2026-07-20
**Authors**: Phase Mirror Governance
**Supersedes**: —  
**Superseded by**: —  
**Related**: [ADR-002: Sovereign Local-First DevOps Trajectory](ADR-002-sovereign-local-first-trajectory.md), [ADR-001: Combined Mandate](archives/adr/completed/ADR-001-Combined-Mandate.md), [ADR-106: Sovereign Stack](Prime/lean/Core/f1_square/docs/adr/ADR-106-Sovereign-Stack.md)

---

## Context

ADR-002 establishes the strategic trajectory: four sovereign surfaces (Chromium extension, VS Code extension, ESP32 bare-metal edge, local-first Archivum). It is intentionally high-level. This ADR translates that trajectory into a concrete, buildable component graph with new crates, binding contracts, and a sequenced implementation plan that can start landing in the current workspace.

The current workspace already contains the governance core:

- **`phase-mirror`** — L0 invariant checks (`l0_invariants.rs`), `LegislativeEngine` (`legislative.rs`), `L0Validator` (`validator.rs`).
- **`phase-mirror-client`** — `ConfigurationSeal`, `MultiplicityCertificate`, `PhaseMirrorVerifier` (five-stage verification lifecycle per ADR-117).
- **`phase_mirror_wasm`** — `verify_resonance_buffer` and `run_gik_diagnostic` exposed via `wasm_bindgen`.
- **`phase-mirror-mcp`** — Governed MCP tool suite (`verify_ledger`, `evaluate_esi_risk`, `check_governed_bridge`, etc.) with `ContractManager` and `CrmfStorage`.
- **`verification-harness`** — `AppendOnlyLog`, `RegHomRegistry`, `evaluate_governed_bridge` five-gate simulation.
- **`Prime/crates/archivum`** — Deterministic WASM execution substrate (`archivum-core`, `archivum-cli`, `archivum-guest`, `example-prime`) with CBOR + Fuel model (`spec/PRIME-ABI-v0.md`).
- **`Prime/lean/...`** — Lean 4 formalization layer (`contractive_successor_one`, `IsContractive`, `WitnessPreserved`).

What is missing is the **binding layer** that makes these components consumable by extension surfaces and bare-metal targets, and the **local-first persistence layer** that makes the stack sovereign when offline.

---

## Decision

Create the **Sovereign Stack** as six binding components. Four are new crates/directories; two are existing crates extended with new traits. All components share a single `ContractivityReceipt` envelope format and a common `ArchivumEvent` schema.

### Component Graph

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Sovereign Stack Core                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌───────────────┐  │
│  │ phase-mirror    │    │ phase-mirror-  │    │ verification- │  │
│  │ (L0 + Legislative│───▶│ client         │───▶│ harness       │  │
│  │  + Validator)   │    │ (Seal + Cert + │    │ (AuditLog +   │  │
│  └─────────────────┘    │  Verifier)     │    │  RegHom)      │  │
│         │               └─────────────────┘    └───────────────┘  │
│         │                       │                       │          │
│         ▼                       ▼                       ▼          │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐   │
│  │ phase-mirror-   │    │   archivum-local-first              │   │
│  │ surface         │    │   (local-first Archivum binding)    │   │
│  │ (shared surface │    │                                     │   │
│  │  abstraction)   │    │                                     │   │
│  └────────┬────────┘    └─────────────────┬───────────────────┘   │
│           │                               │                       │
│  ┌────────▼────────┐    ┌────────────────▼───────────────────┐   │
│  │ phase-mirror-   │    │   phase-mirror-edge                 │   │
│  │ extension-host  │    │   (no_std ESP32 kernel)             │   │
│  │ (Chromium + VS  │    │                                     │   │
│  │  Code bindings) │    │                                     │   │
│  └────────┬────────┘    └─────────────────────────────────────┘   │
│           │                                                       │
└───────────┼───────────────────────────────────────────────────────┘
            │
   ┌────────▼────────────┐
   │ phase-mirror-wasm   │ (existing; upstream for Chromium + VS Code)
   │ (browser/extension  │
   │  WASM module)       │
   └─────────────────────┘
```

### New Component 1: `phase-mirror-surface` (shared surface abstraction)

**Purpose**: A Rust crate defining the common data contracts and state machine used by all four sovereign surfaces. It is the " lingua franca " between the governance core and the UI/extension/edge layers.

**Location**: `packages/phase-mirror-surface/`

**Key types**:

- `ArchivumEvent` — canonical append-only event (timestamp, surface_id, witness_id, receipt_json, signature).
- `ContractivityReceipt` — unified receipt envelope (status, lambda_trace, proof_hash, surface).
- `SurfaceState` — enum `{ ChromiumExtension, VSCodeExtension, ESP32Edge, LocalFirstData }`.
- `TripleLockPhase` — enum `{ Genius, Guardian, Examiner, Completed, Failed }`.
- `GovernanceOutcome` — enum `{ Admissible, Blocked(Vec<String>), Degraded(String) }`.

**Binding contract**: Every surface must implement `SurfaceAdapter` trait:

```rust
pub trait SurfaceAdapter {
    fn surface_id(&self) -> SurfaceState;
    fn emit_receipt(&self, receipt: ContractivityReceipt) -> Result<(), SurfaceError>;
    fn read_receipts(&self, since: i64) -> Result<Vec<ContractivityReceipt>, SurfaceError>;
    fn triple_lock_status(&self) -> Result<TripleLockPhase, SurfaceError>;
}
```

**Dependency**: Depends on `phase-mirror` (re-export `State`, `InvariantCheckResult`) and `phase-mirror-client` (re-export `ConfigurationSeal`, `OracleStatus`).

### New Component 2: `phase-mirror-extension-host` (Chromium + VS Code bindings)

**Purpose**: A Rust library compiled to WASM (for Chromium) and native staticlib (for VS Code sidecar) that encapsulates all extension-host API interactions. This isolates the rest of the stack from Chromium Manifest V3 or VS Code API volatility.

**Location**: `packages/phase-mirror-extension-host/`

**Targets**:

1. **WASM target** (`wasm32-unknown-unknown`): Used by `phase-mirror-chromium` extension. Exposes:
   - `chrome.storage.local` read/write via `web-sys` + `wasm-bindgen`.
   - Context-menu and sidebar panel lifecycle.
   - Offline-first sync queue (deferred writes when `navigator.onLine` is false).

2. **Native target** (`x86_64-unknown-linux-gnu`, `aarch64-apple-darwin`, `x86_64-pc-windows-msvc`): Used by `phase-mirror-vscode` sidecar. Exposes:
   - Stdio JSON-RPC server (mirrors `phase-mirror-mcp` transport).
   - File-system watcher for workspace `archivum.jsonl`.
   - Problem-matcher JSON emitter for VS Code diagnostics API.

**Key constraint**: The extension-host must never call into `phase-mirror-client` crypto directly in the WASM target. Instead, it receives pre-computed `ContractivityReceipt` JSON from `phase_mirror_wasm` and stores/transmits it.

### New Component 3: `archivum-local-first` (local-first data layer)

**Purpose**: Replace the current `CrmfStorage` JSONL-on-host-filesystem model with a local-first, CRDT-mergeable, Ed25519-signed append-only log that works identically on desktop, browser extension storage, and ESP32 NVS.

**Location**: `packages/archivum-local-first/`

**Key types**:

- `LocalArchivum` — owns a single `archivum.jsonl` file (or equivalent partition).
- `ArchivumEntry` — `{ id: Uuid, timestamp_ms: i64, surface: SurfaceState, receipt: ContractivityReceipt, signature: Ed25519Signature }`.
- `MergeResult` — `{ accepted: Vec<ArchivumEntry>, conflicts: Vec<(ArchivumEntry, ArchivumEntry)> }`.
- `SovereignKeyPair` — Ed25519 key pair generated on first run, stored in platform-specific keystore (browser: `chrome.storage.local` encrypted; desktop: OS keyring; ESP32: NVS flash).

**Merge protocol**:
- Last-writer-wins by `timestamp_ms`.
- Tie-breaker: lexicographic comparison of `receipt.witness_id` SHA-256 hash.
- Conflicts are never silently dropped; they are logged as `ArchivumConflict` events with both receipts preserved.

**Dependency**: Uses `phase-mirror-surface` for `ArchivumEvent` and `ContractivityReceipt`. Uses `ed25519-dalek` for signing.

### New Component 4: `phase-mirror-edge` (ESP32 `no_std` kernel)

**Purpose**: A stripped-down, `no_std` Rust port of the L0 invariant kernel and Triple-Lock state machine that runs on ESP32 (Xtensa LX6) and ESP32-S2/S3.

**Location**: `packages/phase-mirror-edge/`

**Targets**:
- `xtensa-esp32-none-elf`
- `xtensa-esp32s2-none-elf`
- `xtensa-esp32s3-none-elf`

**Key modules**:

- `l0_edge.rs` — Minimal L0 validator. Bitmask checks, schema hash equality, drift bound, nonce freshness. No `chrono`; uses `embedded_svc::time`.
- `triple_lock_edge.rs` — State machine with three phases. No dynamic allocation; uses static buffers (`heapless::Vec<u8, 256>`).
- `archivum_nvs.rs` — Flash-backed shard using `esp-idf-svc::storage::Nvs`. Each entry is a CBOR-encoded `ArchivumEntry` with wear-leveling across NVS partitions.
- `uart_emitter.rs` — Emits `ContractivityReceipt` JSON over UART or BLE GATT.

**Memory budget**: ≤128 KiB RAM, ≤256 KiB flash for kernel + static buffers.

**Proof binding**: The ESP32 kernel implements the same logical predicates as `phase-mirror/src/l0_invariants.rs`. Cross-compiled proof obligations are verified in `Prime/lean/` by a new CI job (`esp32-lean-check.yml`) that hashes the Lean proof output and compares it to a `#define` in `l0_edge.rs`.

### Extended Component 5: `phase-mirror` (new traits for edge parity)

**Purpose**: Add two traits to the existing `phase-mirror` crate so that the desktop, WASM, and ESP32 implementations share compile-time interface contracts.

**New traits**:

```rust
/// Surface-agnostic L0 check. Implemented by phase-mirror, phase-mirror-edge, and phase-mirror-wasm.
pub trait L0Check {
    type Input;
    type Output;
    fn check(state: Self::Input) -> Self::Output;
}

/// Surface-agnostic Triple-Lock state machine.
pub trait TripleLockMachine {
    type Receipt;
    fn advance(&mut self, witness: &Self::Receipt) -> Result<TripleLockPhase, LockError>;
    fn current_phase(&self) -> TripleLockPhase;
}
```

**Existing `LegislativeEngine`** implements `L0Check` for `State -> InvariantCheckResult`.  
**New `phase-mirror-edge`** implements `L0Check` for `EdgeState -> EdgeInvariantResult`.  
**New `phase-mirror-wasm`** wrapper implements `L0Check` for `JsValue -> JsValue`.

### Extended Component 6: `phase-mirror-mcp` (new tool: `attest_cross_surface_mission`)

**Purpose**: Add a new MCP tool that binds all four surfaces into a single attestation event, fulfilling the local-first mission.

**New tool**: `attest_cross_surface_mission`

```rust
pub async fn attest_cross_surface_mission(
    surfaces: Vec<SurfaceState>,
    mission_json: &str,
    contract_manager: &ContractManager,
    ace_storage: &Mutex<CrmfStorage>,
) -> Result<CrossSurfaceAttestation, GovernanceError>
```

**Behavior**:
1. Validates `mission_json` against L0 invariants via `phase-mirror` crate.
2. Generates a `UnifiedWitness` via `LegislativeEngine::transition`.
3. Emits a `ContractivityReceipt` with `surface: LocalFirstData`.
4. Writes the receipt to `archivum-local-first` (local-first log).
5. Returns a `CrossSurfaceAttestation` containing the receipt plus per-surface `SurfaceStatus` (online/degraded/offline).

---

## Surface Implementation Detail

### Chromium Extension (`phase-mirror-chromium`)

- **Manifest V3** service worker + offscreen document.
- WASM bundle: recompiled `phase_mirror_wasm` + `phase-mirror-extension-host` (WASM target).
- Storage: `chrome.storage.local` for receipts; `IndexedDB` for large `archivum.jsonl` shards.
- UI: Sidebar panel (`phase-mirror-panel.html`) with L0 status badge, Triple-Lock progress bar, dissonance feed.
- Offline mode: All logic runs in service worker. Sync to remote endpoints is opt-in and gated by `attest_cross_surface_mission`.

### VS Code Extension (`phase-mirror-vscode`)

- **TypeScript** extension host (`src/extension.ts`) launching a Rust TCF sidecar.
- Sidecar binary: `phase-mirror-extension-host` (native target) compiled as staticlib and linked into a small `main.rs` binary.
- Communication: stdio JSON-RPC (same wire format as `phase-mirror-mcp`).
- Diagnostics: Problem matcher parses `ContractivityReceipt` output and decorates the Problems pane.
- Degraded mode: If sidecar fails to launch, extension shows last receipt from workspace `archivum.jsonl` and flags `SurfaceStatus::Degraded`.

### ESP32 Edge (`phase-mirror-edge`)

- Build: `cargo build --target xtensa-esp32-none-elf -p phase-mirror-edge`.
- Flash: `espflash --chip esp32 target/xtensa-esp32-none-elf/release/phase-mirror-edge`.
- Runtime: L0 validator runs on every UART command. Triple-Lock state machine persists in RTC slow memory.
- Archivum: NVS partition named `pm_archivum`. Wear leveling via circular buffer of 256 entries.
- Emission: On each `Completed` phase, emits `{ "witness_id": "...", "status": "OK", "surface": "ESP32Edge" }` over UART at 115200 baud.

---

## Data Flow: Local-First Archivum

```
User Action (desktop / browser / ESP32)
         │
         ▼
  phase-mirror (L0 check)
         │
         ▼
  phase-mirror-client (Seal + Cert)
         │
         ▼
  phase-mirror-surface (ContractivityReceipt)
         │
         ▼
  archivum-local-first (sign + append)
         │
    ┌────┴────┐
    │         │
 chrome.storage  workspace file  ESP32 NVS
    │         │
    └────┬────┘
         │
    CRDT merge (on sync)
         │
         ▼
  Unified Archivum Log
```

---

## Consequences

### Positive

- **Concrete binding**: Every existing crate has a defined role and a new trait or extension point. No surface is orphaned.
- **Proof continuity**: The same `ContractivityReceipt` schema and Lean proof hash bind all six components. A CI job can diff proof hashes across targets.
- **Local-first by construction**: `archivum-local-first` is the primary write path; cloud sync is an optional downstream consumer, not a dependency.
- **Extension volatility isolation**: `phase-mirror-extension-host` isolates the stack from Chromium/VS Code API churn. Only that crate needs rewriting when APIs change.
- **ESP32 reach**: `phase-mirror-edge` proves that the governance core is not tied to full OS abstractions. The `L0Check` trait makes the parity explicit at compile time.

### Negative

- **Crate proliferation**: Six crates increase workspace complexity and CI matrix. Mitigation: `phase-mirror-surface` and `archivum-local-first` are pure Rust with no platform-specific dependencies; CI only needs `cargo check --all-targets`.
- **WASM binary size**: Adding `phase-mirror-extension-host` + `archivum-local-first` to the WASM bundle may exceed Chromium extension service-worker limits. Mitigation: lazy-load `archivum-local-first` only when sync is requested.
- **ESP32 maintenance**: `xtensa-esp32` targets require `espflash` and `probe-rs` toolchains that lag upstream Rust releases. Mitigation: pin toolchain in `rust-toolchain.toml` and vendor critical patches.
- **Surface parity risk**: Feature creep on desktop may leave ESP32 behind. Mitigation: `L0Check` trait ensures any new L0 predicate must be implemented for all three targets or the build fails.

### Risk

- **Key management**: `archivum-local-first` generates Ed25519 keys on first run. Lost keys mean lost receipt provenance. Mitigation: exportable seed phrase stored as 12-word mnemonic in platform keystore.
- **CRDT edge cases**: Conflicting receipts from the same surface at the same millisecond are resolved by witness-ID hash, which may surprise users. Mitigation: surface-level monotonic clocks (e.g., ESP32 RTC) ensure timestamp monotonicity within a single device.
- **Lean proof drift**: If `phase-mirror/src/l0_invariants.rs` is modified without updating the corresponding Lean theorems, the ESP32 CI job will catch the hash mismatch but the desktop build will not. Mitigation: `cargo deny` or custom CI lint enforces that any change to `l0_invariants.rs` triggers `lake build` in `Prime/lean/`.

---

## Receipt Linkage

Every governed action must carry the unified envelope:

```
{
  "witness_id": "sha256:<64-hex-chars>",
  "proof_hash": "LEAN_PROOF_HASH_108_CORE",
  "lean_manifest_hash": "<lake-manifest.json sha256>",
  "surface": "ChromiumExtension | VSCodeExtension | ESP32Edge | LocalFirstData",
  "archivum_log": "<sha256 of local archivum.jsonl tail>",
  "triple_lock_phase": "Completed",
  "lambda_trace": {
    "lambda_p": 0.95,
    "L_p": 0.90,
    "zero_spacings": [1, 3, 5, 7]
  }
}
```

---

## Milestones

| Milestone | Owner | Horizon | Acceptance Criteria |
|-----------|-------|---------|---------------------|
| `phase-mirror-surface` crate lands | Rust Core | 14 days | `L0Check` and `SurfaceAdapter` traits compile on `x86_64-unknown-linux-gnu`; `phase-mirror` implements `L0Check`; all existing tests pass. |
| `archivum-local-first` crate lands | Rust Core | 21 days | `LocalArchivum` appends and merges 3 divergent logs without receipt loss; Ed25519 signature verification passes; CI job `archivum-merge-test` green. |
| `phase-mirror-extension-host` WASM target lands | Frontend / Extension Eng. | 30 days | `phase_mirror_wasm` + `extension-host` compile to WASM < 2 MiB; `chrome.storage.local` write/read round-trip passes in Playwright test. |
| VS Code sidecar binary ships | VS Extension / Rust Eng. | 45 days | Staticlib links into 5 MB binary; stdio JSON-RPC handshake passes; problem matcher emits L0 violations in VS Code test host. |
| ESP32 `phase-mirror-edge` boots | Embedded / Lean Formalization | 60 days | `espflash` loads kernel; NVS persists 256 receipts; UART emits valid JSON; CI matrix (`esp32`, `esp32s2`, `esp32s3`) green; `lake build` hash matches `l0_edge.rs` `const LEAN_PROOF_HASH`. |
| Cross-surface `attest_cross_surface_mission` MCP tool | MCP / Governance | 60 days | Tool emits receipt with `surface: LocalFirstData`; `archivum-local-first` append verified; `CrossSurfaceAttestation` includes all four `SurfaceStatus` values. |

---

## CI/CD Matrix

```yaml
jobs:
  rust-core:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        target: [x86_64-unknown-linux-gnu]
    steps:
      - cargo check --workspace --all-targets
      - cargo test --workspace

  wasm-surface:
    runs-on: ubuntu-latest
    steps:
      - cargo check --target wasm32-unknown-unknown -p phase_mirror_wasm -p phase-mirror-extension-host
      - wasm-pack test --node

  esp32-edge:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        target: [xtensa-esp32-none-elf, xtensa-esp32s2-none-elf, xtensa-esp32s3-none-elf]
    steps:
      - cargo check --target ${{ matrix.target }} -p phase-mirror-edge
      - lake build  # in Prime/lean/
      - ./scripts/verify_lean_hash.sh  # ensures l0_edge.rs const matches lake output

  archivum-merge:
    runs-on: ubuntu-latest
    steps:
      - cargo test -p archivum-local-first
```

---

## References

- [ADR-002: Sovereign Local-First DevOps Trajectory](ADR-002-sovereign-local-first-trajectory.md) — Strategic foundation.
- [ADR-001: Combined Mandate](archives/adr/completed/ADR-001-Combined-Mandate.md) — Sedona Spine governance framework.
- [ADR-106: Sovereign Stack](Prime/lean/Core/f1_square/docs/adr/ADR-106-Sovereign-Stack.md) — Production-grade provenance and attestation layer.
- `phase-mirror/src/l0_invariants.rs` — Existing L0 invariant kernel (desktop baseline).
- `phase-mirror/src/legislative.rs` — LegislativeEngine with Ψ transition operator.
- `phase-mirror-client/src/lib.rs` — ConfigurationSeal, MultiplicityCertificate, PhaseMirrorVerifier.
- `phase_mirror_wasm/src/lib.rs` — Existing WASM governance client.
- `phase-mirror-mcp/src/tools/mod.rs` — Governed MCP tool suite.
- `verification-harness/src/lib.rs` — AppendOnlyLog, RegHomRegistry, governed bridge simulation.
- `Prime/crates/archivum/spec/PRIME-ABI-v0.md` — Deterministic WASM ABI specification.
