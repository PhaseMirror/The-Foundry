# hologram-ai & Phase Mirror Governed Inference

**An orchestrated, formally verified, in-browser and cloud-native AI application on the hologram substrate**. 

This workspace is the foundational execution runtime for the Phase Mirror Agency. It downloads models from HuggingFace, compiles them into content-addressed (κ-form) `.holo` archives, and runs them. Following our recent integrations with the `Prime` stack, this runtime now operates as a completely **standalone governed node** via the `hologram-api` MCP server.

This repository is **docs-as-code / BDD-driven / V&V-gated**, following the [UOR-Atlas-UTQC] methodology: every feature begins as a Gherkin definition, and every claim is validated against an authority this repository did not author.

## Where things are

| Path | Role |
|---|---|
| [`docs/conceptual-model/`](docs/conceptual-model/) | The conceptual authority (prose): what the system is, the k-representation principle, the normative user journey. |
| [`docs/adrs/`](docs/adrs/) | Architecture Decision Records (e.g., ADR-001 Standalone API, ADR-002 Deployment). |
| [`model/`](model/) | The conceptual model as typed data: the dictionary, the status ledger, and parametric use-cases. |
| [`apps/hologram-api/`](apps/hologram-api/) | The governed Model Context Protocol (MCP) server. Handles dynamic routing and exposes `/health` and `/ready` probes. |
| [`apps/web/`](apps/web/) | The browser application (React + the wasm binding) + the browser BDD suite. |
| [`crates/hologram-cnl/`](crates/hologram-cnl/) | The standalone mathematical topological gate. Evaluates natural language constraints using Abductive Logic Programming (ALP) prior to any generation. |
| [`crates/hologram-archivum/`](crates/hologram-archivum/) | The internal ledger system mapping cryptographic provenance (via `UnifiedWitness` SHA-256) for every model generation. |
| [`crates/`](crates/) | The core Rust workspace handling inference, quantization, and model compilation. |
| [`xtask/`](xtask/) | Automation: oracle verification, pin checks, the conformance ledger, fixture generation. |

## The Governed User Journey

The application's contract is one journey, verified end-to-end:

1. **Download & Route** — The `hologram-api` reads domains (e.g., `legal_scopist`) and hot-swaps to the correct model mapping via `routing.yaml`. Models stream directly into the OPFS/Disk κ-store.
2. **Compile** — A parametric decoder graph is built from the model's manifest, compiled to a weightless k-form `.holo`.
3. **Verify Bounds (CNL)** — Before generation starts, the `hologram-cnl` gate asserts that generation constraints mathematically adhere to the domain's legal policy (e.g., Temperature = 0.0). Blocked requests are instantly halted.
4. **Run** — Content-addressed elision inference executes without a standard KV-cache.
5. **Log (Archivum)** — Every inference event hashes into an immutable JSONL ledger providing absolute legal provenance.

## Quickstart & Deployment

### Local Development Gate
```sh
just            # list tasks
just vv         # the full local gate (fmt, lint, test, bdd, honesty, oracles, journey, api-test)
just api-build  # Build the standalone MCP server binary
just report     # the conformance ledger
```

### Production Deployment (Docker-Compose)
The engine is ready for cloud-native orchestration with built-in Kubernetes-compatible liveness probes (`/health`, `/ready`).
```sh
docker-compose -f docker-compose.api.yml up -d
```
Volumes are mapped for persistent `.holo` graphs, the `routing.yaml`, and the `Archivum` ledger.

## Verification & validation

Every dictionary row carries a status that is a *contract on what the suite may assert*. A mechanical **honesty meta-gate** enforces the model ⇄ features ⇄ witnesses links and forbids asserting open claims. `just vv` runs the whole gate set including the newly integrated `api-test` lanes; CI mirrors it job-for-job.

External authorities: ONNX Runtime, BLAKE3 test vectors, HuggingFace Hub, and the pinned [hologram]/[holospaces] substrate witnesses. 

[hologram]: https://github.com/Hologram-Technologies/hologram
[holospaces]: https://github.com/Hologram-Technologies/holospaces
[UOR-Atlas-UTQC]: https://github.com/afflom/UOR-Atlas-UTQC
