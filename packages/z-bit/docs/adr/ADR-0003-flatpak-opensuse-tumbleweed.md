# ADR-0003: Package z-bit as a Flatpak for openSUSE Tumbleweed 2026

## Status
Accepted

## Date
2026-08-28

## Context
The z-bit project combines a Rust workspace (`zbit_core`, `zbit_affine`, `zbit_scripts`) with a Lean 4 formal verification layer (`AffineCore` shared library built via Lake). The current development environment requires:

1. A Rust toolchain (stable) with Cargo
2. Lean 4 toolchain (v4.34.0-rc2) with Lake
3. A C compiler (clang/LLVM) for Lean's code generation backend
4. Python 3.9+ for research simulations
5. Node.js 18+ for anchor scripts
6. Bitcoin Core v26+ for regtest mining integration

Distributing z-bit to end users on openSUSE Tumbleweed 2026 requires solving:
- Cross-distribution portability without requiring users to manually install Lean, Lake, or C toolchains
- Reproducible builds that match the mathematically-verified execution environment
- Sandboxed execution that satisfies the security constraints of the Affine Core formal verification layer
- Seamless integration with the `prism-btc` host application via the `libaffinecore.so` FFI boundary

## Decision Drivers
- **Reproducibility**: The Flatpak build must produce bit-identical artifacts across clean openSUSE Tumbleweed 2026 machines.
- **Security**: The Lean shared library and Rust verification proofs must be tamper-evident at the distribution layer.
- **Usability**: End users should install z-bit with a single `flatpak install` command without managing elan, Lake, or C toolchains.
- **openSUSE Alignment**: Use the distro's native Flatpak tooling (`flatpak-builder` 1.4.7+, `org.freedesktop.Platform` runtime available in Tumbleweed repos).
- **Lean Integration**: The `AffineCore` shared library must be built inside the Flatpak sandbox and exposed to the Rust FFI layer at runtime.

## Considered Options

### Option A: Traditional RPM Packaging (Rejected)
Package z-bit as a standard openSUSE RPM, bundling the Lean toolchain as a sub-package.

**Pros**:
- Native to openSUSE package manager
- Users get automatic security updates via `zypper`

**Cons**:
- Lean 4 has no stable RPM packaging in Tumbleweed; would require maintaining a custom `lean4` sub-package
- The C toolchain dependency (clang, llvm-ar, libstdc++) would pull in ~200MB of compiler runtime into the user's system namespace
- No sandboxing — the `libaffinecore.so` FFI boundary would share the host's memory space, violating the formal verification isolation assumptions
- RPM rebuilds for Lean version bumps are high-friction

### Option B: AppImage (Rejected)
Package z-bit as a self-contained AppImage with all dependencies bundled.

**Pros**:
- Single-file distribution
- No runtime daemon required

**Cons**:
- No sandboxing (runs with full user permissions)
- The Lean runtime (`libleanshared.so`) and Rust `libloading` dynamic loader conflict with AppImage's FUSE mount model for `LD_LIBRARY_PATH`
- No integration with openSUSE Tumbleweed's Flatpak-first desktop application model
- Updates require manual user intervention (no auto-update mechanism)

### Option C: Docker/Podman Container (Rejected)
Distribute z-bit as a rootless container image.

**Pros**:
- Complete filesystem isolation
- Reproducible build environment

**Cons**:
- Desktop integration (GUI, D-Bus, file access) requires complex `--device` and `--volume` flags
- The `prism-btc` mining workflow needs low-latency access to host `/dev` and USB hardware, which Docker Desktop patterns do not support cleanly
- Overkill for a CLI/mining tool that does not require full OS virtualization

### Option D: Flatpak with Bundled Lean SDK (Accepted)
Package z-bit as a Flatpak using `org.freedesktop.Platform` runtime, with the Lean 4 toolchain and `AffineCore` shared library built as internal Flatpak modules.

**Pros**:
- **Sandboxing**: Flatpak's `--env=LD_LIBRARY_PATH` and `--filesystem` permissions enforce the formal verification boundary
- **Reproducibility**: `flatpak-builder` produces deterministic builds from manifest + sources
- **openSUSE Native**: Tumbleweed ships `flatpak-builder` 1.4.7+ and Flathub runtime support
- **Lean Isolation**: The Lean C runtime (`libleanshared.so`) and `libaffinecore.so` are bundled inside the Flatpak, invisible to the host
- **Rust Toolchain**: Use `org.freedesktop.Sdk.Extension.rust-stable` for Cargo/rustc inside the sandbox
- **Auto-Updates**: Flathub or a custom repo delivers updates through `flatpak update`

**Cons**:
- Build complexity: Lean must be compiled from source inside the Flatpak sandbox (no pre-built Lean Flatpak extension exists)
- Larger download size (~150MB for Lean runtime + AffineCore shared library + Rust stdlib)
- `flatpak-builder` must be run with `--install-deps-from=flathub` to fetch the Rust SDK extension

## Decision
We will package z-bit as a Flatpak for openSUSE Tumbleweed 2026 using the following architecture:

1. **Base Runtime**: `org.freedesktop.Platform` 24.08 (or 25.08 when stabilized), matching Tumbleweed's Flatpak runtime version.
2. **SDK**: `org.freedesktop.Sdk` with extensions:
   - `org.freedesktop.Sdk.Extension.rust-stable` — provides rustc, cargo, and mold linker
   - `org.freedesktop.Sdk.Extension.llvm21` — provides clang/llvm-ar for Lean's C codegen
3. **Lean Build Module**: Compile Lean 4 v4.34.0-rc2 from source inside the Flatpak sandbox as a private module. Output `libleanshared.so` and `lake` to `/app/lean/`.
4. **AffineCore Build Module**: Run `lake build` inside the sandbox to produce `libaffinecore.so` → `/app/lib/libaffinecore.so`.
5. **Rust Build Module**: Use `flatpak-cargo-generator.py` to vendor Cargo dependencies, then build the Rust workspace with `cargo build --release --all-features`.
6. **Runtime Linking**: The Rust `zbit_affine` crate loads `libaffinecore.so` from `/app/lib/` via `libloading`.
7. **Permissions**: The Flatpak requires `--share=ipc` for Lean's threading model and `--device=dri` only if GUI tools are added later. The CLI binary needs no special D-Bus or socket access.

### Flatpak Manifest Structure
```
com.multiplicity.z-bit/
├── com.multiplicity.z-bit.json
├── com.multiplicity.z-bit.desktop
├── com.multiplicity.z-bit.metainfo.xml
├── com.multiplicity.z-bit.svg
└── modules/
    ├── rust-stable-extension/     (sdk-extension: rust-stable)
    ├── llvm21-extension/           (sdk-extension: llvm21)
    ├── lean4/                       (build from source: leanprover/lean4:v4.34.0-rc2)
    ├── affine-core/                 (lake build → libaffinecore.so)
    └── z-bit-rust/                  (cargo build → zbit-scripts binary)
```

### Build Commands
```bash
# Install runtime and SDK
flatpak install flathub org.freedesktop.Platform//24.08 org.freedesktop.Sdk//24.08
flatpak install flathub org.freedesktop.Sdk.Extension.rust-stable//24.08
flatpak install flathub org.freedesktop.Sdk.Extension.llvm21//24.08

# Build Flatpak
flatpak-builder --user --install --force-clean --install-deps-from=flathub \
  build-dir com.multiplicity.z-bit.json

# Run
flatpak run com.multiplicity.z-bit
```

## Phase Mirror Governance
- **Hidden Assumptions**: We assume Lean 4's C backend produces ABI-stable shared libraries across patch releases of the toolchain. A Lean minor version bump may require rebuilding `libaffinecore.so`.
- **Contradictions / Tensions**: Lean's shared library build requires `moreLinkArgs` for `libleanshared.so`, but Flatpak's `ld` path resolution differs from NixOS. The Lean community confirms shared libraries are not designed for `dlopen`/`dlclose` cycles; we treat `libaffinecore.so` as a load-once, never-unload capability.
- **Lever Introduced**: Bundling the Lean toolchain as a Flatpak module isolates the C runtime and formal verification layer from the host, preserving the mathematically-guaranteed execution boundary.
- **Validation Metric**: `flatpak-builder` completes all 45 Lean build jobs + Rust compilation in under 10 minutes on a 4-core Tumbleweed machine. The produced `libaffinecore.so` hash matches the host-built reference.

## Consequences

### Positive
- **Reproducible Distribution**: Every user gets the exact same Lean-verified `libaffinecore.so` regardless of host distro version
- **Security Isolation**: The Rust FFI loader and Lean runtime execute inside the Flatpak sandbox; host filesystem access is explicitly gated
- **openSUSE Alignment**: Uses Tumbleweed's native Flatpak tooling without requiring custom OBS packages for Lean
- **CI/CD Ready**: The manifest can be built in GitHub Actions or GitLab CI using `flatpak/flatpak-builder` with the `--install-deps-from=flathub` flag

### Negative
- **Build Complexity**: Lean must be compiled from source inside the sandbox (~2-3 minutes on CI). Pre-built Lean binaries cannot be used because they hardcode host-specific `rpath` and `LD_LIBRARY_PATH` values.
- **Image Size**: The Flatpak bundle will be ~180-220MB due to the Lean runtime, C compiler, and Rust standard library. This is larger than a bare Rust binary but acceptable for a formal-verification-enabled application.
- **Lean Version Pinning**: The manifest pins `leanprover/lean4:v4.34.0-rc2`. Any Lean upgrade requires updating the manifest's `lean-src` module commit SHA and rebuilding.

### Neutral
- **Runtime Permissions**: The Flatpak requests `--share=ipc` for Lean's multi-threaded GC. This is standard for applications using POSIX shared memory and does not grant network or filesystem access.
- **Python/Node.js**: The `zbit_scripts` Rust binary replaces the Python/Node.js research scripts for production use. The Flatpak does not bundle Python or Node.js; if research scripts are needed, they should be packaged as a separate Flatpak (`com.multiplicity.z-bit.research`).

## Traceability & Artifact Links
- **[Lean Toolchain]** `leanprover/lean4:v4.34.0-rc2` — Pinned source for Lean 4 compiler and Lake build system
- **[Shared Library]** `lean4/.lake/build/lib/libaffinecore.so` — Built output loaded by `zbit_affine` via `libloading`
- **[Rust FFI]** `rust/zbit_affine/src/lib.rs` — Runtime loader with hardcoded `/app/lib/libaffinecore.so` path
- **[Flatpak Manifest]** `flatpak/com.multiplicity.z-bit.json` — Canonical build recipe
- **[CI Script]** `.github/workflows/flatpak.yml` — Automated Flatpak build and publish to Flathub

## Follow-up Decisions
- ADR-0004: CI/CD pipeline for automated Flatpak builds on Tumbleweed
- ADR-0005: Flathub submission criteria and metadata (`metainfo.xml` update frequency)
- ADR-0006: Lean version upgrade policy (semantic vs. rolling pin in manifest)
