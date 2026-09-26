# Knot-in-Time: Constitutional Architecture for Sovereign AI (Rust Implementation)

`knot-in-time` is the high-performance Rust implementation of the Helix constitutional stack. It treats AI interaction as a governed energy landscape, providing mathematical and runtime core primitives for sovereign AI governance.

## Architecture

The system treats AI interaction as a governed energy landscape:
- $H_{\mathrm{free}}$: Policy constraints
- $H_{\mathrm{fold}}$: Advisory dynamics
- $H_{\mathrm{topo}}$: Ratified custodial override

The system utilizes an FZS-MK (Functorial Zeno Sheaf with Memory Kernel) runtime to enforce constitutional invariants.

## Core Features

- **Constitutional Runtime:** Hard enforcement of jurisdictional invariants.
- **Epistemic Integrity:** GICD scanning for authority and jurisdictional compliance.
- **Hamiltonian Federation:** Consensus-based drift synchronization across peers.
- **Sovereign Engine:** Non-Markovian master equation with Zeno-Ward projection for constitutional enforcement.
- **Constitutional Vocabulary:** Zeta-Attention mechanism with Boolean cohomology masks.

## Implementation

The project is implemented entirely in Rust for maximum performance, type safety, and formal verification compatibility.

## Development

Build the core project:
```bash
cd core
cargo build
cargo test
```

Formal verification (Lean 4):
```bash
cd proofs
lake build
```
