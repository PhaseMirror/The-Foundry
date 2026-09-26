# Changelog

All notable changes to the PIRTM compiler and governance stack are documented in this file.

## [1.1.0] - 2026-09-02

### Added
- **PIRTM TUI & Background Daemon (`pirtmd` / `pirtm-tui`)**: Interactive Ratatui split-pane editor and WebSocket background daemon with 14 slash commands and live LSP diagnostic feeds.
- **Formal Lean 4 Proof Modules (ADR-049–ADR-056)**:
  - Poseidon2 ZK receipt flag conjunction (`ADR-049`)
  - Multi-node Sentinel consensus quorum soundness (`ADR-050`)
  - Local PC installation protocol soundness (`ADR-051`)
  - PETC valuation additive homomorphism & ACE weighted-$\ell_1$ soft-thresholding (`ADR-052`)
  - Universal Multiplicity Constant $\Lambda_m$ fail-closed precedence & PMRO $2\sqrt{N}$ associator defect bound (`ADR-053`)
  - Regge-NCG action density operator norm bound & CDT spectral dimension proxy ($1.2 \le D_s(t) \le 2.0$) (`ADR-054`)
  - Exact rational 1-norm contractivity gate $\|G\|_1 < 1$ in $\mathbb{Q}$ (`ADR-055`)
  - Collaborative CRDT state convergence & contractivity $\|G\|_1 < 1$ preservation (`ADR-056`)
- **Kani Proof Suite**: Model checking harnesses across `adr_rust` crates.

### Changed
- Realigned legal entity and trade name to **Citizen Gardens UNA d/b/a The Prime Materia Commons** (Wyoming W.S. 17-22).
- Replaced floating-point scaling membranes ($10^6$) with canonical exact rational constructor `Ensemble::from_rationals` over reduced `PosRat` in $\mathbb{Q}$.

### Verified
- `lake test`: 100% green across all 25 Lean 4 formal proof modules.
- `cargo test --workspace`: 100% green across all 28 Rust workspace crates.

## [1.0.0-mvp] - 2026-09-01

### Added
- Initial MVP release of PIRTM compiler and MOC kernel
- Lean 4 Axiom-Clean core (`lean/ADR/*.lean`, `lean/PIRTM.lean`)
- Rust compiler pipeline (`pirtm-parser`, `pirtm-mlir`, `pirtm-compiler`)
- Runtime execution engine (`pirtm-engine`) with real LLVM IR path
- WardMonitor drift detection and Zeno controller (`pirtm-monitor`)
- Standard library primitives (`pirtm-stdlib`)
- MLIR lowering for control flow, structs, enums, and FFI
- JSON parser end-to-end example (`examples/json_parser.pirtm`)
- Sedona Spine CI workflow with zero-drift toolchain locking
- Architecture Decision Records (ADR-018 through ADR-030)

### Verified
- All 28 Rust test suites pass
- Lean 4 formal proofs verified without `sorry` in core modules