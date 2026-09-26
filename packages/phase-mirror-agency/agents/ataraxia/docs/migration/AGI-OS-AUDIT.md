# AGI-OS to The-Commander Integration Audit

## 1. Migration Targets (Python -> Rust)

The following Python packages and modules from `agiOS` have been identified for translation to Rust to satisfy the "Rust-heavy" stack requirement.

| Category | Source (agiOS) | Status | Target (the-commander) |
| :--- | :--- | :--- | :--- |
| **Core Math** | `src/multiplicity/mkt/` | **IN PROGRESS** | `crates/multiplicity-math` |
| **Sigma Kernel** | `packages/sigma_kernel/` | OPEN | `crates/sigma` (expansion) |
| **App Daemon** | `src/app/daemon/` | OPEN | `crates/commander-core` (expansion) |
| **Distributed State** | `state/dht/stateengine.py` | OPEN | `crates/commander-core/src/sync/` |
| **Knot Theory** | `src/multiplicity/library/` | OPEN | `crates/multiplicity-math/src/knot.rs` |

## 2. Excluded Modules (Third-Party)

Per user directive, the following modules are excluded from the translation mandate:
- **GitHub**: `packages/githubmcp` (already integrated as binary)
- **Microsoft**: `packages/microsoft-agt`
- **Vercel/Next.js**: `packages/mcp-handler-main` (likely dashboard related)
- **Google/Gemini**: `packages/models/gemini`

## 3. Discovered Dissonance (MKT Constants)

During the translation of `multiplicity-math`, a significant dissonance was identified in `agiOS/src/multiplicity/mkt/mkt_constants.py`:
- The formula `(PI - 1.0) / 2.0` yields `1.07`, but the provided numeric constant was `0.57`.
- The formula `1 / (2 * cos(1))` yields `0.925`, but the provided numeric constant was `0.877`.
- The Python script `mkt_jones.py` fails its own validation (`ln|J| = ln(10)`) when using the defined formulas.

**Resolution Plan**:
- Implement the "corrected" formulas in Rust to match the intended numeric constants:
  - `ALPHA_K = PI/2 - 1`
  - `Z_MARKOV = cos(0.5)`
- Document the fix in `ADR-MKT-001`.

## 4. Hardware/Environment Wiring

`agiOS` is configured as a Pop OS installation with systemd units:
- `agi-os-core.service`: Runs the autonomous node daemon.
- `agi-os-web.service`: Web interface.

**Integration Strategy**:
- `pscmd` will replace `agi_os/scripts/run_autonomous_node.py` as the primary service entry point.
- Rust-based daemon tasks will be integrated into the `sigma` loop.

---
*Audit completed 2026-05-22.*
