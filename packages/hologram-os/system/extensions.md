# Extension Architecture

Hologram OS is designed to be extensible while maintaining its zero-trust, mathematically verified foundation. This document defines how external extensions—such as those from the PhaseMirror ecosystem—integrate into the Hologram OS substrate.

## 1. The Extension Model

Extensions in Hologram OS are not privileged binaries; they are content-addressed **Holospaces** or **WASM modules** running in strictly isolated sandboxes. 

Since Hologram OS runs entirely in the browser, extensions must target the web platform:
* **WASM Modules**: Compute-heavy extensions (like PhaseMirror's verification engines) are compiled to WebAssembly.
* **Service Workers / Web Workers**: Standard logic and bridging protocols run in isolated workers.

## 2. Integration with PhaseMirror

PhaseMirror enforces strict architectural governance and formal methods. To integrate its toolset (such as `phase-mirror-extension-host`, `sedona_spine`, and `phase_mirror_wasm`) into Hologram OS, the following architectural mapping applies:

### A. Self-Verifying Extension Modules
Every PhaseMirror extension payload is treated as a self-verifying object (`did:holo:sha256:...`). When Hologram OS loads a PhaseMirror WASM validator, the engine re-derives its hash. If the hash matches, the extension is loaded; otherwise, it is fail-closed. 

### B. The Host Boundary (WASM Storage & Native Bridging)
PhaseMirror's `phase-mirror-extension-host` provides both `native_storage` and `wasm_storage`. In Hologram OS, only the `wasm_storage` capability is exposed. The OS acts as the native bridging layer, injecting content-addressed virtual file systems into the PhaseMirror WASM sandbox.

### C. Capability Enforcement (UCAN)
PhaseMirror agents require access to the system graph to detect documentation/code dissonance. Instead of direct disk access, Hologram OS grants scoped **UCAN capability chains** to the PhaseMirror extension. The extension can request to read a specific component's `os/etc/conformance.jsonld` to verify compliance with ADR-015 (On-Tree Ground Truth).

## 3. Communication over MCP
AI agents orchestrating these extensions (like `phase-mirror-agent`) connect to the OS over the **Model Context Protocol (MCP)**.
- Hologram OS advertises `verify_object` and `resolve_object`.
- The PhaseMirror extension exposes its own tools via the OS's MCP bridge, allowing AI agents to trigger dissonance checks seamlessly.

## 4. Zero Tolerance for Simulation
In alignment with PhaseMirror's principles and Hologram OS's Law L5 (Verify by Re-derivation), extensions cannot mock their telemetry or provide unverified proofs. A PhaseMirror extension returning a verification result must sign its output, allowing the Hologram OS resolver to independently re-derive the proof.
