# the_genius (Rust)

`the_genius` is a governed, safety-certified, and self-stewarding intelligence stack within the agiOS ecosystem. It implements the Z-MOD (Zeta-Mathematics Optimizer with Multiplicity Dynamics) framework.

## Architecture
The core logic has been fully migrated to a Rust-native architecture, leveraging the unified Z-MOD crates for high-performance optimization, safety, and governance.

- **`crates/zmod-substrate`**: Multiplicity-theoretic tensor substrate.
- **`crates/zmod-guardian`**: Safety invariant enforcement and governance.
- **`crates/zmod-optim`**: Zeta-guided optimizer dynamics.
- **`crates/zmod-resonance`**: Multi-agent shared substrate (CRMF).
- **`crates/genius-trainer`**: Rust-native training orchestrator.

## Development

### Building
```bash
cargo build --workspace
```

### Running the Trainer
```bash
cargo run -p genius-trainer
```

## Security & Governance
- **Zero Drift**: Preservation logic and safety constraints are enforced through formal Lean4 verification of the core optimization dynamics.
- **Autonomous Safety**: Integrated Guardian agents modulate the shared CRMF substrate to guarantee system stability and prevent divergence.
