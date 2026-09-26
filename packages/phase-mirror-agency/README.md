# Phase Mirror Ecosystem Standalone Bundle

## Structure
- `citizen-gardens/`: The main frontend narrative site.
- `admin/`: The governance dashboard (Dissonance Graph, ADR Registry, CLI).
- `agency-server/`: The Node.js orchestrator and Rust engine proxy.
- `discord-bot/`: The real-time Discord governance interface.

## Prerequisites
- Node.js (>= 18)
- Rust (for engine binaries, though pre-compiled binaries are included in `agency-server/bin/`)

## Quick Start
1.  **Install Dependencies**:
    ```bash
    ./setup.sh
    ```
2.  **Start the Ecosystem**:
    ```bash
    ./start-all.sh
    ```
3.  **Run Test Harness**:
    ```bash
    ./test-harness.sh
    ```

## Integration Map
- **Frontend** -> **Agency Server** (`:8082`)
- **Admin Dashboard** -> **Agency Server** (`:8082`)
- **Discord Bot** -> **Agency Server** (`:8082`)
- **Agency Server** -> **Sedona Spine** (Rust Harness)

## Features
- **Archivum**: Immutable site registry and audit ledger.
- **MissionProtocol**: Deterministic architectural verification.
- **Dissonance Graph**: Live system tension visualization.
- **Verified CLI**: Restricted shell for governance tasks.
