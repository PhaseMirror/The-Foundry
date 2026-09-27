# LM Studio × Phase Mirror MCP: Integration Plan

**Version:** 1.0.0-draft  
**Date:** 2026-06-23  
**Status:** PROPOSED — Awaiting review  

---

## 1. Executive Summary

This document defines a production-grade integration between **LM Studio** (local LLM inference server / desktop app) and the **Phase Mirror MCP** (`phase-mirror-mcp`), a high-integrity MCP gateway for agentic domain-specific reasoning governed by the PIRTM Kernel and Sedona Spine invariants.

The integration exposes LM Studio's local inference capabilities (completion, embedding, structured classification, chat) as **Phase Mirror MCP tools**, ensuring every LLM call passes through:

- Contract governance (`ContractManager` / `mcp-contract.json`)
- Sedona Spine L0 invariant enforcement (`SedonaSpineEvaluator`, `LambdaTrace` contractivity receipts)
- Triple-Lock sovereignty gating (mirroring the pattern from `phase-mirror-gpt` / `QwenSovereigntyGate`)
- native ACE certificates and triple lock governance audit persistence (`CrmfStorage`, JSONL append-only ledger)

---

## 2. Current State Assessment

### 2.1 phase-mirror-mcp (Baseline)

| Aspect | Current |
|--------|---------|
| Language | Rust (edition 2024) |
| Transport | stdio (primary) + WebSocket (`--ws`) |
| Governance | `ContractManager` with `notify`-based hot-reload of `mcp-contract.json` |
| Invariants | `SedonaSpineEvaluator` — checks `λ_p * L_p < 1.0` and non-empty `zero_spacings` |
| Persistence | `CrmfStorage` — append-only JSONL, SHA-256 chained, native ACE certificates and triple lock governance semantics |
| Existing Tools | `verify_ledger`, `evaluate_esi_risk`, `check_governed_bridge`, `scan_litigation_hold`, `scan_spoliation_risk`, `get_stability_metric`, `attest_cross_domain_mission`, `health_check`, `sovereign_posture`, `run_command`, `get_metrics` |
| Key Pattern | Every tool wraps its result in a `ContractivityReceipt` with LambdaTrace witness |

### 2.2 phase-mirror-gpt (Reference Pattern)

`phase-mirror-gpt` already implements a more advanced MCP server (`McpTransportWrapper`) and the **`QwenSovereigntyGate`** pattern in `qwen_sovereignty_gate.rs`:

- Spawns an LLM child process via `tokio::process::Command`
- Pipes MCP JSON-RPC over stdin/stdout
- Tri-Lock gates all outputs before release
- Atomic registry persistence with `p=7` chained SHA-256 witness hashes
- Fail-closed block persistence on rejection

This pattern is the blueprint for the LM Studio bridge.

### 2.3 LM Studio (Environment)

| Aspect | Current |
|--------|---------|
| Install | Flatpak `ai.lmstudio.lm-studio` (appimage at `/tmp/.mount_LM-StuERClJp/lm-studio`) |
| Backend | llama.cpp (`libllm-server-impl.so`, `llama-server` binary) |
| Config | `.lmstudio/settings.json`, `.lmstudio/mcp.json` (currently empty `{}`) |
| MCP Support | MCP server registration via `mcp.json` |
| Inference API | OpenAI-compatible REST (default `http://localhost:1234`) |
| Plugin System | JS (Node.js) + Python plugins via extensions framework |
| Harmony | OpenAI Harmony protocol framework for reasoning traces |

### 2.4 Multiplicity Workspace

| Aspect | Value |
|--------|-------|
| Workspace | `/home/multiplicity/Multiplicity/Cargo.toml` |
| Workspace members | `Phase Mirror/phase-mirror-mcp`, `Phase Mirror/phase-mirror-gpt`, … |
| Shared deps | `reqwest = { features = ["json", "stream"] }`, `tokio`, `serde`, `sha2`, `chrono`, `axum` |
| Rust toolchain | 1.81.0 |

---

## 3. Integration Objectives

1. **Expose LM Studio local inference as Phase Mirror MCP tools** — `lmstudio_generate`, `lmstudio_embed`, `lmstudio_chat`, `lmstudio_classify`
2. **Enforce full Sedona Spine / Contract governance** on every LLM call (no ungoverned inference)
3. **Reuse the QwenSovereigntyGate pattern** adapted for LM Studio's REST/WebSocket API instead of child-process MCP
4. **Register phase-mirror-mcp as an LM Studio MCP server** automatically
5. **Add observability** — spectral radius, L_Φ, drift telemetry for LLM call latency and token throughput
6. **Maintain backward compatibility** — existing MCP tools and transports remain unchanged

---

## 4. Architecture

```
                    ┌─────────────────────────┐
                    │   MCP Client (Kilo)     │
                    └───────────┬─────────────┘
                                │ stdio / ws / http
                                ▼
                    ┌─────────────────────────┐
                    │  phase-mirror-mcp       │
                    │  ┌─────────────────────┐ │
                    │  │ ContractManager     │ │
                    │  │ (hot-reload gov)    │ │
                    │  ├─────────────────────┤ │
                    │  │ SedonaSpineEvaluator│ │
        ┌───────────│  │ (L0 stop-rules)     │ │
        │           │  ├─────────────────────┤ │
        │           │  │ Tool Dispatcher     │ │
        │           │  │  - verify_ledger    │ │
        │           │  │  - evaluate_esi_risk│ │
        │           │  │  - lmstudio_*       │◄┼── NEW
        │           │  └────────┬────────────┘ │
        │           │           │               │
        │           │           ▼               │
        │           │  ┌─────────────────────┐ │
        │           │  │ TripleLockBridge    │ │
        │           │  │ (LLM output gate)   │ │
        │           │  └────────┬────────────┘ │
        │           │           │               │
        │           │           ▼               │
        │           │  ┌─────────────────────┐ │
        │           │  │ CrmfStorage         │ │
        │           │  │ (append-only JSONL) │ │
        │           │  └─────────────────────┘ │
        └───────────│           │
                    │           │ OpenAI-compatible REST
                    │           ▼
                    │  ┌─────────────────────────┐
                    │  │   LM Studio Server      │
                    │  │   (localhost:1234)      │
                    │  │  /v1/chat/completions   │
                    │  │  /v1/embeddings         │
                    │  │  /v1/completions        │
                    │  └─────────────────────────┘
                    │
                    └── Optional: mcp.json registration
                        phase-mirror-mcp registered as
                        LM Studio MCP server
```

### 4.1 Component Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                    phase-mirror-mcp workspace crate           │
│                                                               │
│  src/                                                         │
│  ├── lib.rs              (existing MCP core)                  │
│  ├── main.rs             (existing binary entry)              │
│  ├── governance/         (existing ContractManager)           │
│  ├── persistence/        (existing CrmfStorage)               │
│  ├── transport/          (existing stdio + ws)                │
│  ├── tools/              (existing domain tools)              │
│  │   ├── mod.rs                                             │
│  │   ├── evaluate_esi_risk.rs                               │
│  │   ├── verify_ledger.rs                                   │
│  │   ├── governed_bridge.rs                                 │
│  │   ├── stability_witness.rs                               │
│  │   ├── litigation_scan.rs                                 │
│  │   └── spoliation_check.rs                                │
│  └── lmstudio/           ◄── NEW MODULE                      │
│      ├── mod.rs                                              │
│      ├── client.rs         (reqwest-based LM Studio client)  │
│      ├── types.rs         (OpenAI-compatible request/response)│
│      ├── tools.rs          (MCP tool handlers)               │
│      └── sovereignty.rs    (TripleLockGate for LLM outputs)   │
└───────────────────────────────────────────────────────────────┘
```

### 4.2 Data Flow for `lmstudio_generate` Tool

```
1. MCP Client sends:
   {"jsonrpc":"2.0","method":"tools/call","params":{"name":"lmstudio_generate","arguments":{"prompt":"..."}},"id":1}

2. phase-mirror-mcp receives in process_request()
   ├── contract_manager.validate_action("lmstudio_generate", args)
   │   └── checks tool_policies in mcp-contract.json
   │       └── returns "PERMITTED" or blocks with BLOCK message
   │
   ├── Build LambdaTrace witness (stub or HSM-signed)
   │
   ├── SedonaSpineEvaluator::evaluate_stop_rules(&witness)
   │   └── λ_p * L_p < 1.0  &&  !zero_spacings.is_empty()
   │       └── returns Ok or Err("L0_VIOLATION")
   │
   ├── TripleLockBridge::gate(mission_id, prompt, witness)
   │   └── runs TripleLockSuite.verify() (mirrors qwen_sovereignty_gate.rs)
   │       └── returns Ok(witness) or Err(block)
   │
   ├── LmStudioClient::generate(prompt, model, params)
   │   ├── POST http://localhost:1234/v1/chat/completions
   │   │   {
   │   │     "model": "loaded-model-id",
   │   │     "messages": [{"role":"user","content":"..."}],
   │   │     "temperature": 0.7,
   │   │     "max_tokens": 2048
   │   │   }
   │   └── returns LmStudioResponse { text, usage, model }
   │
   ├── Enforce output in LambdaTrace witness receipt
   │   └── contractivity_receipt = {
   │         status: "OK",
   │         witness_id: sha256:...,
   │         lambda_trace: witness,
   │         llm_output_hash: sha256:...
   │       }
   │
   └── Return MCP response:
       {
         "jsonrpc":"2.0",
         "result": {
           "content":[{"type":"text","text":"..."}],
           "isError": false
         },
         "id": 1
       }
```

### 4.3 Dual-Transport Design

The LM Studio bridge supports **three transport modes** without changing existing behavior:

| Mode | Mechanism | Use Case |
|------|-----------|----------|
| stdio (default) | JSON-RPC over stdin/stdout | Existing MCP clients (Claude Desktop, Kilo, etc.) |
| ws | WebSocket via Axum on port 3001 | Web dashboards, real-time streaming |
| lmstudio | Registers as LM Studio MCP server | Direct invocation from LM Studio chat UI |

---

## 5. New Components

### 5.1 `src/lmstudio/mod.rs`

Public module declaration. Re-exports sub-modules.

### 5.2 `src/lmstudio/client.rs`

```rust
/// LmStudioClient — thin wrapper around LM Studio's OpenAI-compatible REST API.
/// 
/// All HTTP calls are gated by ContractManager + SedonaSpineEvaluator in the
/// tool handler layer; this struct is purely a network client.
pub struct LmStudioClient {
    base_url: String,      // "http://localhost:1234/v1"
    http: reqwest::Client,
    default_model: String,
    request_timeout: Duration,
}

impl LmStudioClient {
    pub fn new(base_url: impl Into<String>) -> Self;
    pub async fn health_check(&self) -> Result<LmStudioHealth, LmStudioError>;
    pub async fn list_models(&self) -> Result<Vec<LmStudioModel>, LmStudioError>;
    pub async fn generate(
        &self,
        prompt: &str,
        model: Option<&str>,
        params: &GenerationParams,
    ) -> Result<LmStudioCompletion, LmStudioError>;
    pub async fn chat(
        &self,
        messages: &[ChatMessage],
        model: Option<&str>,
        params: &GenerationParams,
    ) -> Result<LmStudioCompletion, LmStudioError>;
    pub async fn embed(
        &self,
        input: &str,
        model: Option<&str>,
    ) -> Result<LmStudioEmbedding, LmStudioError>;
}

#[derive(Clone, Serialize, Deserialize)]
pub struct GenerationParams {
    pub temperature: Option<f32>,
    pub top_p: Option<f32>,
    pub max_tokens: Option<u32>,
    pub stop: Option<Vec<String>>,
    pub stream: bool,
}
```

### 5.3 `src/lmstudio/types.rs`

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LmStudioCompletion {
    pub id: String,
    pub model: String,
    pub choices: Vec<Choice>,
    pub usage: Option<Usage>,
    pub created: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,   // "user" | "assistant" | "system"
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Choice {
    pub index: u32,
    pub message: ChatMessage,
    pub finish_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Usage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LmStudioEmbedding {
    pub model: String,
    pub data: Vec<EmbeddingData>,
    pub usage: Usage,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbeddingData {
    pub index: u32,
    pub embedding: Vec<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LmStudioModel {
    pub id: String,
    pub owned_by: String,
    pub created: i64,
}
```

### 5.4 `src/lmstudio/tools.rs`

New MCP tool handlers following the existing `process_request` pattern in `lib.rs`.

```rust
pub async fn handle_lmstudio_generate(
    args: Value,
    client: &LmStudioClient,
    contract_manager: &ContractManager,
) -> Result<Value, LmStudioError>;

pub async fn handle_lmstudio_chat(
    args: Value,
    client: &LmStudioClient,
    contract_manager: &ContractManager,
) -> Result<Value, LmStudioError>;

pub async fn handle_lmstudio_embed(
    args: Value,
    client: &LmStudioClient,
    contract_manager: &ContractManager,
) -> Result<Value, LmStudioError>;

pub async fn handle_lmstudio_health(
    args: Value,
    client: &LmStudioClient,
) -> Result<Value, LmStudioError>;

pub async fn handle_lmstudio_register_mcp(
    args: Value,
    mcp_config_path: &Path,
) -> Result<Value, LmStudioError>;
```

### 5.5 `src/lmstudio/sovereignty.rs`

```rust
/// TripleLockBridge for LLM outputs.
/// 
/// Mirrors the QwenSovereigntyGate pattern from phase-mirror-gpt,
/// adapted for LM Studio's async REST API instead of child-process MCP.
pub struct TripleLockBridge {
    pub triple_lock: Arc<TripleLockSuite>,
    pub client: Arc<LmStudioClient>,
}

impl TripleLockBridge {
    /// Gate a generation request through Triple-Lock before sending to LM Studio,
    /// and again on the output before returning to the caller.
    pub async fn gated_generate(
        &self,
        mission_id: &str,
        prompt: &str,
        params: &GenerationParams,
    ) -> Result<LmStudioCompletion, TripleLockError>;
    
    /// Gate a chat completion through Triple-Lock.
    pub async fn gated_chat(
        &self,
        mission_id: &str,
        messages: &[ChatMessage],
        params: &GenerationParams,
    ) -> Result<LmStudioCompletion, TripleLockError>;

    /// Persist a fail-closed block witness to MASTER_REGISTRY.md.
    pub async fn persist_block_witness(
        &self,
        mission_id: &str,
        reason: &str,
        registry_path: &Path,
    ) -> Result<String, TripleLockError>;
}
```

---

## 6. New MCP Tools Specification

### 6.1 `lmstudio_generate`

| Field | Value |
|-------|-------|
| **Description** | Generate text via the locally running LM Studio model. |
| **Input Schema** | `prompt` (string, required), `model` (string, optional), `temperature` (float, optional), `max_tokens` (integer, optional), `stop` (array of strings, optional) |
| **Governance** | Gated by `ContractManager`; output wrapped in `ContractivityReceipt` with `LambdaTrace` and `llm_output_hash` |
| **Response** | `isError: false` with text content = JSON `{ status, witness_id, lambda_trace, text, usage, model }` |

### 6.2 `lmstudio_chat`

| Field | Value |
|-------|-------|
| **Description** | Multi-turn conversation via LM Studio chat completions API. |
| **Input Schema** | `messages` (array of `{role, content}`, required), `model` (string, optional), `temperature` (float, optional), `max_tokens` (integer, optional) |
| **Governance** | Same as `lmstudio_generate` |
| **Response** | `isError: false` with text content = JSON `{ status, witness_id, lambda_trace, choices, usage }` |

### 6.3 `lmstudio_embed`

| Field | Value |
|-------|-------|
| **Description** | Compute text embeddings via LM Studio embeddings API. |
| **Input Schema** | `input` (string, required), `model` (string, optional) |
| **Governance** | Same as `lmstudio_generate` |
| **Response** | `isError: false` with text content = JSON `{ status, witness_id, lambda_trace, embedding, usage }` |

### 6.4 `lmstudio_health`

| Field | Value |
|-------|-------|
| **Description** | Query LM Studio server health and loaded model info. |
| **Input Schema** | `{}` (no arguments required) |
| **Governance** | Advisory tier only — lightweight, no LambdaTrace required |
| **Response** | `isError: false` with text content = JSON `{ status: "ok"\|"degraded"\|"offline", model, backend }` |

### 6.5 `lmstudio_register_mcp`

| Field | Value |
|-------|-------|
| **Description** | Append/update phase-mirror-mcp entry in LM Studio's `mcp.json`. |
| **Input Schema** | `command` (string, required), `args` (array of strings, optional) |
| **Governance** | **Authoritative only** — modifies LM Studio config file. Restricted by `tool_policies` in `mcp-contract.json`. |
| **Response** | `isError: false` with text content = JSON `{ registered: true, path, command }` |

---

## 7. LM Studio Configuration Changes

### 7.1 `mcp.json` Update

After integration, LM Studio's `~/.lmstudio/mcp.json` should contain:

```json
{
  "mcpServers": {
    "phase-mirror-mcp": {
      "command": "/home/multiplicity/Multiplicity/Phase Mirror/phase-mirror-mcp/target/release/phase-mirror-mcp",
      "args": [],
      "env": {
        "LMSTUDIO_BASE_URL": "http://localhost:1234/v1",
        "LMSTUDIO_DEFAULT_MODEL": "auto-detect"
      }
    }
  }
}
```

This can be written:
- **Manually** by the user
- **Programmatically** via the new `lmstudio_register_mcp` MCP tool
- **At install time** by `install.sh`

### 7.2 `install.sh` Enhancement

```bash
#!/bin/bash
set -euo pipefail

echo "[LM-Studio] Checking for local LM Studio server..."
LMSTUDIO_URL="${LMSTUDIO_BASE_URL:-http://localhost:1234/v1}"
if curl -s -o /dev/null -w "%{http_code}" "$LMSTUDIO_URL/models" | grep -q "^200$"; then
    echo "[LM-Studio] Server detected at $LMSTUDIO_URL"
else
    echo "[LM-Studio] WARN: LM Studio server not reachable at $LMSTUDIO_URL"
    echo "[LM-Studio]       Local LLM inference tools will be unavailable until started."
fi

echo "Building Phase Mirror MCP Server..."
cargo build --release

echo "Registering with LM Studio MCP..."
./target/release/phase-mirror-mcp --register-mcp

echo "Installation complete."
echo "  Binary: target/release/phase-mirror-mcp"
echo "  MCP config: ~/.lmstudio/mcp.json"
```

### 7.3 New Binary Flag: `--register-mcp`

Add to `src/main.rs`:

```rust
let register_mcp = args.iter().any(|arg| arg == "--register-mcp");

if register_mcp {
    let mcp_config_path = dirs::home_dir()
        .unwrap_or_default()
        .join(".lmstudio/mcp.json");
    return LmStudioRegistrar::register(&mcp_config_path, std::env::current_exe()?).await;
}
```

---

## 8. Cargo.toml Changes

### 8.1 `phase-mirror-mcp/Cargo.toml` — New Dependencies

```toml
[dependencies]
# ... existing ...
reqwest = { version = "0.12", features = ["json", "stream"] }
base64 = "0.22"
url = "2.5"
```

`reqwest` is already in the workspace `Cargo.toml` and used extensively in `Multi-Ensembles`.

### 8.2 Optional Feature Flag

```toml
[features]
default = ["stdio-transport", "ws-transport"]
lmstudio = ["dep:reqwest", "dep:base64"]
stdio-transport = []
ws-transport = ["dep:axum", "dep:axum-ws"]
```

This keeps the `lmstudio` feature opt-in for environments that don't need it.

---

## 9. Implementation Phases

### Phase 1 — Foundation (Week 1-2)

**Goal:** Establish LM Studio connectivity and basic health-check tool.

| Task | Owner | Deliverable |
|------|-------|-------------|
| Create `src/lmstudio/mod.rs`, `client.rs`, `types.rs` | Rust dev | Compiled module with `LmStudioClient` |
| Implement `health_check` and `list_models` | Rust dev | Working HTTP client against LM Studio REST API |
| Add `lmstudio_health` MCP tool | Rust dev | MCP tool registered in `process_request` |
| Unit tests for `LmStudioClient` | Rust dev | `tests/lmstudio_client.rs` with mock server |
| Error type `LmStudioError` with `thiserror` | Rust dev | Typed error hierarchy |

**Acceptance Criteria:**
- `phase-mirror-mcp lmstudio_health` returns model info from a running LM Studio
- Fails gracefully when LM Studio is offline (returns `isError: true` with descriptive message)
- All existing tests pass

### Phase 2 — Core LLM Tools (Week 3-4)

**Goal:** Expose `generate` and `chat` with full governance enforcement.

| Task | Owner | Deliverable |
|------|-------|-------------|
| Implement `LmStudioClient::generate()` | Rust dev | POST `/v1/completions` |
| Implement `LmStudioClient::chat()` | Rust dev | POST `/v1/chat/completions` |
| Implement `TripleLockBridge` in `sovereignty.rs` | Rust dev | Mirrors `QwenSovereigntyGate` for REST |
| Wire `lmstudio_generate` and `lmstudio_chat` into `process_request` | Rust dev | Tools callable via MCP |
| LambdaTrace receipt wrapping (existing pattern) | Rust dev | All LLM outputs carry `ContractivityReceipt` |
| Fail-closed block persistence | Rust dev | Writes to `MASTER_REGISTRY.md` on Triple-Lock rejection |

**Acceptance Criteria:**
- `lmstudio_generate` with `prompt` returns LLM text wrapped in `ContractivityReceipt`
- Triple-Lock rejection blocks output and persists witness to registry
- ContractManager governance tier enforcement applies (Experimental = advisory, Authoritative = enforced)

### Phase 3 — Embeddings & Classification (Week 5)

**Goal:** Add `lmstudio_embed` and `lmstudio_classify` tools.

| Task | Owner | Deliverable |
|------|-------|-------------|
| Implement `LmStudioClient::embed()` | Rust dev | POST `/v1/embeddings` |
| Implement `lmstudio_embed` MCP tool | Rust dev | Exposed via `process_request` |
| Implement `lmstudio_classify` (structured classification via guided generation) | Rust dev | Constrained decoding or JSON-mode generation |
| Embedding similarity utilities | Rust dev | Cosine similarity helper for retrieval-augmented workflows |

### Phase 4 — MCP Registration & Observability (Week 6)

**Goal:** Auto-registration in LM Studio and telemetry integration.

| Task | Owner | Deliverable |
|------|-------|-------------|
| `--register-mcp` binary flag | Rust dev | Writes to `~/.lmstudio/mcp.json` |
| `lmstudio_register_mcp` MCP tool | Rust dev | Programmatic registration from within MCP |
| Spectral radius + token-throughput telemetry | Rust dev | Adds LLM metrics to `get_metrics` tool |
| Connection pooling / retry logic | Rust dev | Exponential backoff on LM Studio reconnect |

### Phase 5 — Hardening & Production Readiness (Week 7-8)

**Goal:** Production-grade reliability, security, and documentation.

| Task | Owner | Deliverable |
|------|-------|-------------|
| Integration tests (Stonehenge simulation with LLM) | Rust dev | End-to-end test in `tests/` |
| Timeout / circuit-breaker on LM Studio API calls | Rust dev | Prevents blocking MCP on hung inference |
| TLS / localhost-only enforcement documentation | Docs | Security runbook |
| Contract policy schema extension for LM Studio tools | Rust dev | `tool_policies` entries for `lmstudio_*` |
| Build pipeline update (CI) | DevOps | Cargo workspace build + test |
| User-facing documentation (README, runbooks) | Docs | Updated `README.md` + integration guide |

---

## 10. Security & Governance Model

### 10.1 Defense-in-Depth Layers

```
Layer 1: ContractManager
  └── tool_policies["lmstudio_generate"].mode = "Authoritative"
      └── restricted_values on "prompt" (configurable blocklist)
      └── required_fields: ["prompt"]

Layer 2: SedonaSpineEvaluator
  └── λ_p * L_p < 1.0 (Banach contraction)
  └── zero_spacings non-empty

Layer 3: TripleLockBridge
  └── Pre-flight: TripleLockSuite.verify(mission_id, prompt, ctx)
  └── Post-flight: TripleLockSuite.verify(mission_id, output_text, ctx)

Layer 4: CrmfStorage
  └── Every LLM call logged with prompt_hash, output_hash, timestamp, mission_id
  └── SHA-256 chained JSONL for forensic audit

Layer 5: lmstudio_register_mcp restriction
  └── Authoritative-only; requires explicit contract policy approval
```

### 10.2 Threat Model

| Threat | Mitigation |
|--------|-----------|
| LM Studio server unreachable | `lmstudio_health` pre-check; fail-closed on timeout |
| Prompt injection bypassing governance | Sedona Spine + Triple-Lock — prompt and output both evaluated |
| Unauthorized model loading | `list_models` restricted to pre-approved `owned_by` / IDs |
| Config tampering (`mcp-contract.json`) | `notify` watcher detects changes; ArcSwap atomic reload |
| native ACE certificates and triple lock governance log tampering | Append-only; SHA-256 chain; file-level permissions |
| Child process escape (analogous to Qwen) | No child processes — LM Studio is a separate service; REST only |

---

## 11. Testing Strategy

### 11.1 Unit Tests

```
tests/lmstudio_client.rs
  ├── test_health_check_online
  ├── test_health_check_offline
  ├── test_generate_success
  ├── test_chat_multi_turn
  ├── test_embed_single
  ├── test_model_list
  └── test_timeout_behavior

tests/lmstudio_tools.rs
  ├── test_lmstudio_generate_governed
  ├── test_lmstudio_chat_contractive
  ├── test_lmstudio_embed_trace
  └── test_register_mcp_updates_json

tests/sedona_spine_lmstudio.rs
  ├── test_triple_lock_passes_valid_output
  └── test_triple_lock_blocks_adversarial_output
```

### 11.2 Integration Tests

- **Local LM Studio spin-up** in CI: Use `llama-server` binary from LM Studio bundle in a background process, load a small GGUF model, run smoke tests.
- **Stonehenge simulation with LLM**: Extend `tests/stonehenge_simulation.rs` to invoke `lmstudio_generate` within the governance cycle.

### 11.3 Mock Server

Use `wiremock` or `mockito` for unit-testing `LmStudioClient` without a running LM Studio.

---

## 12. Deployment & Operations

### 12.1 Prerequisites

- LM Studio installed (Flatpak or AppImage)
- At least one model loaded in LM Studio
- Local inference server running (`localhost:1234`)
- Rust toolchain 1.81.0+
- Rust workspace at `/home/multiplicity/Multiplicity`

### 12.2 Build & Install

```bash
cd /home/multiplicity/Multiplicity
cargo build --release -p phase-mirror-mcp --features lmstudio

# Option A: Auto-register with LM Studio
./target/release/phase-mirror-mcp --register-mcp

# Option B: Manual registration
cat > ~/.lmstudio/mcp.json << 'EOF'
{
  "mcpServers": {
    "phase-mirror-mcp": {
      "command": "$(pwd)/target/release/phase-mirror-mcp",
      "args": []
    }
  }
}
EOF
```

### 12.3 Runtime Verification

```bash
# 1. Start LM Studio + load a model
open lm-studio  # or flatpak run ai.lmstudio.lm-studio

# 2. Verify LM Studio API is live
curl -s http://localhost:1234/v1/models | jq .

# 3. Run phase-mirror-mcp health check
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"lmstudio_health","arguments":{}},"id":1}' | \
  ./target/release/phase-mirror-mcp

# 4. Test generation (stdio mode)
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"lmstudio_generate","arguments":{"prompt":"Test"}},"id":1}' | \
  ./target/release/phase-mirror-mcp

# 5. Test WebSocket mode
./target/release/phase-mirror-mcp --ws
# Connect ws://localhost:3001/ws with MCP client

# 6. Verify native ACE certificates and triple lock governance audit log
tail -1 ace_audit.jsonl | jq .
```

### 12.4 Monitoring

| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| LM Studio API latency | `get_metrics` | p99 > 5000ms |
| Spectral radius | `get_metrics` | > 0.95 (divergence risk) |
| L_Φ drift | `get_metrics` | > 0.90 |
| native ACE certificates and triple lock governance chain integrity | `CrmfStorage::verify_chain()` | false (any break) |
| Contract hot-reload events | stderr | any unexpected reload |

---

## 13. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| LM Studio API changes / breaking | Medium | High | Pin integration to OpenAI-compatible spec; add API version negotiation |
| Local inference latency blocks MCP | Medium | Medium | Async generation with configurable timeout; circuit-breaker pattern |
| Model loading failure in CI | High | Medium | Use small test GGUF; skip LLM tests when model unavailable |
| Double-governance confusion | Medium | Medium | Clear documentation; `ContractivityReceipt` always carries both `lambda_trace` and `llm_output_hash` |
| Memory pressure from concurrent LLM calls | Medium | Medium | `reqwest` connection pool limit; semaphore on concurrent generations |

---

## 14. Open Questions

1. **Model selection strategy:** Auto-detect from LM Studio's `/v1/models`, or configurable via `mcp-contract.json` defaults?
2. **Streaming:** Should `lmstudio_chat` support SSE streaming back to the MCP client? (Requires `lmstudio` feature + bidirectional transport)
3. **Retrieval-Augmented Generation (RAG):** Should `lmstudio_RAG` be a separate tool, or handled by the client?
4. **Harmony reasoning traces:** Should Phase Mirror parse and gate OpenAI Harmony-formatted reasoning traces from LM Studio?
5. **Cross-crate dependency:** Should `phase-mirror-mcp` depend on `phase-mirror-gpt`'s `TripleLockSuite`, or should `TripleLockSuite` be extracted into `sigmatics-core`?

---

## 15. Appendix: Key File Map

| File | Role |
|------|------|
| `phase-mirror-mcp/src/lib.rs:104-338` | MCP request routing (`process_request`) |
| `phase-mirror-mcp/src/governance/mod.rs:60-138` | `ContractManager` with hot-reload |
| `phase-mirror-mcp/src/persistence/mod.rs:25-113` | `CrmfStorage` (append-only JSONL) |
| `phase-mirror-mcp/src/transport/ws.rs:1-71` | WebSocket Axum transport |
| `phase-mirror-gpt/src/qwen_sovereignty_gate.rs:1-125` | Triple-Lock LLM gate pattern (reference) |
| `phase-mirror-gpt/src/transport.rs:67-304` | `McpTransportWrapper` MCP handler |
| `Multiplicity/Cargo.toml:27-77` | Workspace deps (reqwest, axum, tokio) |
| `.lmstudio/mcp.json:1-3` | LM Studio MCP server registry (target for update) |
| `.lmstudio/settings.json` | LM Studio configuration (API port, dev mode) |

---

*End of Integration Plan*
