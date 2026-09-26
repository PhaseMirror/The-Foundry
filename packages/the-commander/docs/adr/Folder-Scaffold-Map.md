# Current Folder Scaffold Map (Phase Mirror Reconciled)

This map reflects the actual, compiling structure of the `the-commander` workspace, aligned with the Phase Mirror L0 invariant goals (ADR-031 and ADR-032).

```text
multiplicity-commander/
├── README.md
├── LICENSE
├── justfile
├── Cargo.toml                 # Root workspace manifest mapping crates/ and crates/pro/
│
├── crates/                    # Core Rust ecosystem and SDKs
│   ├── archive/               # Broken/deprecated crates isolated from the build graph
│   ├── commander-cli/         # Rust CLI for operators
│   ├── commander-core/        # Core orchestrator logic for CLI + UI
│   ├── mcp-server/            # Rust MCP Server logic
│   ├── phase-mirror/          # Mirror Dissonance Protocol core
│   ├── plst/                  # Prime Encoding and schemas
│   ├── ui-core/               # UI shared utilities
│   ├── rollback/              # Checkpoint and rollback management
│   ├── sigma/                 # Sigma kernel
│   ├── alp/                   # ALP native control surfaces
│   ├── shell/                 # TUI conflict resolvers
│   │
│   └── pro/                   # Specialized business logic and math crates
│       ├── archive/           # Broken/deprecated pro crates
│       ├── mirror-dissonance/ # Policy engine for Phase Mirror
│       ├── hcalc/             # High-performance calculations
│       ├── key-vault/         # Cryptographic key management
│       ├── pirtm/             # PIRTM execution models
│       └── ...                # Dozens of other aligned pro modules
│
├── daemon/                    # Canonical daemon runtime surfaces for Phase Mirror PMD (Python)
│   ├── __init__.py
│   ├── pmd_activation.py      # Typed phase mirror policy execution
│   └── tests/                 
│
├── api/                       # API definitions and schemas
│   └── mcp/                   # MCP-related specs
│
├── circuits/                  # Zero-knowledge circuit definitions
│   └── poseidon2/             
│
├── infra-config/              # Infrastructure manifests
│   ├── cli/                   
│   └── mcp/                   
│
├── profile-web4/              # Web application or dashboard profile
│   └── src/                   
│
├── scripts/                   # Utility bash/python scripts
│
├── state/                     # Local state persistence for the commander
│   ├── archivum/              
│   └── proposals/             
│
├── tests/                     # Top-level integration tests
│
└── docs/                      # Documentation and ADRs
    ├── adr/                   # Architecture Decision Records
    │   ├── proposed/          # ADRs pending approval
    │   ├── accepted/          # Approved ADRs
    │   └── Future-Architecture-Go-TS.md # Deprecated vision of Go/TS based scaffolding
    └── migration/             
```

### How the pieces relate (Rust-First Topology)

- **Rust Workspace**: The `Cargo.toml` at the root explicitly links over 50 crates in `crates/` and `crates/pro/`, ensuring `cargo check --workspace` builds the entire graph safely.
- **Phase Mirror Policy Engine**: Logic contained inside `crates/phase-mirror` and `crates/pro/mirror-dissonance` interacts with the python scripts in `daemon/` to validate L0 invariants.
- **Archiving Strategy**: Crates suffering from unresolvable dependency conflicts or rot are moved into `crates/archive/` or `crates/pro/archive/` to isolate them from breaking invariant composition. 
- **Legacy Architecture**: The previously mapped Go/TS based MCP configuration has been deferred to `Future-Architecture-Go-TS.md` until implementation exists.
