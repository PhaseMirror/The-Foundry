# ADR 2: WASM Integration for Q-Calculator Core

## Context
The Q-Calculator project contains a React-based frontend in `packages/q-calculator` and a Rust-based computational core in `Prime/ensembles/q-calculator`. The frontend needs to execute the `QAriCore` models which dictate contractivity bounds and transformations on high-dimensional vectors, as defined in `Prime/publications/Q-Calculator`. 

## Decision
We will compile the Rust core into WebAssembly (WASM) and import it directly into the React/Vite frontend. 

## Rationale
1. **Performance**: Executing mathematical models involving matrices (using `nalgebra`) in the client's browser avoids network latency and offloads computation from the server.
2. **Offline-first**: Running WASM allows the calculator to function without an active internet connection.
3. **Decoupling**: The Rust crate remains an independent module (`q-calculator-rs`) and can still be used in other Rust-based backends if needed, while seamlessly interacting with the TypeScript frontend via `wasm-bindgen`.

## Consequences
- The frontend build process will need to incorporate `vite-plugin-wasm` or standard WASM loading.
- We must provide concrete, non-generic wrappers around `QAriCore` to export them to JavaScript using `#[wasm_bindgen]`.
