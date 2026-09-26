# Daemon

## PMD Zone Classification (ADR-021, ADR-022)

**Zone**: 2 — Daemon Runtime  
**Role**: Self-monitoring orchestration loop; scheduling and watchdog coordination  

### Scope

**In scope**:
- Heartbeat scheduling and execution
- Health monitoring and drift detection
- Orchestration of other Zone 2 modules (digital twin, rollback, ensemble, mcp_server)
- Daemon lifecycle management

**Out of scope**:
- Live system organ control (use `packages/controllers/`, `packages/automata/` instead)
- Policy evaluation (use `policy/phase_mirror/` instead)
- State storage (use `state/` instead)

### Consumers

- `mcp_server/` — registers and calls daemon tools
- External automation — triggers daemon via MCP or scripts
- `rollback/` — consumes drift detection for trigger evaluation

### Dependencies

- `digital_twin/` — retrieves live state for monitoring
- `ensemble/` — coordinates multi-tenant operations
- `rollback/` — evaluates triggers on drift
- `state/` — reads current runtime state

---

This directory is the canonical PMD daemon-loop root from `ADR-022`.

Wave 2 now anchors the first daemon runtime surface here:

- `watchdog.py` records canonical heartbeats against the digital twin
- `scheduler.py` provides the first actual daemon heartbeat entrypoint for one-shot or fixed-interval runs
- drift detection routes into the rollback trigger vocabulary
- future scheduling and upgrade loops can extend this package instead of scattering into experiments or scripts

This is still a minimal implementation. It establishes the canonical watchdog path without claiming a full autonomous daemon loop.