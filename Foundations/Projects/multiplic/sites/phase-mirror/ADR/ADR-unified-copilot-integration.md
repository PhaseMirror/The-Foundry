# ADR-XXXX: Unified Local-First Co-Pilot Integration Plan

## Status

Proposed

## Context

The Phase Mirror system currently has three partially-integrated components that serve the same purpose: local language model inference. The goal is a fully in-house, offline-capable co-pilot agent. Today the integration is brittle, with duplicated LLM paths, disconnected governance, and no end-to-end local inference from the website UI.

| Layer | Location | Tech | Actual Use |
|-------|----------|------|-----------|
| Frontend API | `phase-mirror-website/server.ts` | Node/Express | Triple-Lock gate only; LLM fallback chain is disconnected from Rust kernel |
| JS Agent | `phase-mirror-agent/index.ts` | TS/HuggingFace Transformers | Direct browser import; **never called by `callGptTool`** |
| Rust GPT | `phase-mirror-gpt/src/` | Rust/pirtm-candle | Governance + stub LLM; `reflect_plan` returns prompt, not completion |
| MCP Server | `phase-mirror-mcp/src/` | Rust/stdio+ws | Separate governance contract; **not consumed by website or GPT binary** |

### Current `/api/chat` flow (broken)

```
POST /api/chat
  → verifyWithTripleLock (spawns phase-mirror-gpt binary)
  → callLlmBackend(fullPrompt)
      ├── Mock (env flag)
      ├── Ollama HTTP (env flag)
      ├── llama.cpp binary (env flag)
      └── phase-mirror-agent (JS) ← loads SmolLM-360M
            └── ❌ generate_governed (Rust real LLM) IS NEVER CALLED
```

### Failure modes

1. **Dual model load**: JS agent loads 360M params via WASM; Rust `LlmClient` also loads the same or a dummy model. Memory doubles.
2. **Governance gap**: JS agent responses bypass the contract manager; only the Triple-Lock check runs.
3. **Binary path mismatch**: `.env.local` points to `phase-mirror-gpt/bin/phase-mirror-gpt` which doesn't exist; build output goes to `target/release/`.
4. **MCP server orphaned**: `phase-mirror-mcp` is a perfectly good stdio MCP server but nothing connects to it.
5. **Stub LLM**: `llm_generate.rs` returns `"Prompt received: ..., generated X tokens"` — not actual inference.

---

## Decision

Consolidate to a **single local inference path** through the Rust kernel, reduce the JS agent to a thin optional browser-side fallback, and wire the MCP server as the optional external surface.

### Target Architecture

```
Browser ↔ Express API ↔ phase-mirror-gpt (Rust, stdio child)

phase-mirror-gpt internals:
  McpTransportWrapper
    ├── triple_lock_verify  → TripleLockSuite → Archivum
    ├── reflect_plan        → MirrorCoordinator → LlmClient → pirtm-candle
    └── generate_governed   → LlmClient → pirtm-candle (with contract check)

phase-mirror-mcp (separate binary, stdio/ws):
    └── Consumed by IDE / external MCP clients via `lmstudio_register_mcp`
```

---

## Implementation Plan (4 steps)

### Step 1 — Fix the build & binary path

| File | Change |
|------|--------|
| `packages/phase-mirror-website/.env.local` | `PM_GPT_BINARY` → `target/release/phase-mirror-gpt` relative to the gpt root, or use absolute path from `cargo build --release` |
| `server.ts` | After `process.env.PM_GPT_ROOT` resolution, confirm binary exists before spawning; reject with clear error if missing |

**Validation**: `POST /api/health` returns `healthy`; `POST /api/triple-lock-verify` returns `VERIFIED` with a real witness hash from the Rust kernel (not the JS simulator).

### Step 2 — Wire real LLM generation end-to-end

#### 2a. Upgrade `generate_governed` to do real inference

`packages/phase-mirror-mcp/src/tools/llm_generate.rs`:

- Replace `LlamaModel::load_dummy` with `LlmClient`-equivalent path that loads actual model weights from `LLM_MODEL_PATH` / `LLM_CONFIG_PATH`
- Use real tokenizer (`tokenizer.json`) instead of byte-mod-1000 stub
- Return decoded text, not a placeholder string
- Keep the `ContractManager::validate_action` governance gate **before** model load (fail-closed)

#### 2b. Call `generate_governed` from the website

`packages/phase-mirror-website/server.ts`:

- Add `generate_governed` to `callGptTool`'s MMIO dispatch (it already sends any `tools/call` — the Rust side already handles it, just confirm the tool name matches)
- After Triple-Lock `VERIFIED`, call `generate_governed` with the user prompt
- Parse the response text and return it to the client

#### 2c. Remove JS agent from the primary path

- `callLlmBackend` should try `generate_governed` (via `callGptTool`) **first**
- Keep JS agent only if `LLM_MOCK=true` or binary unavailable
- `phase-mirror-agent` package can stay but should be clearly marked `experimental-fallback`

### Step 3 — Align MCP contracts

The website currently spawns `phase-mirror-gpt` directly, not `phase-mirror-mcp`. Both binaries share governance concepts but have divergent contracts.

| Decision | Rationale |
|----------|-----------|
| `phase-mirror-gpt` is the **primary runtime** for the website | It owns `MirrorCoordinator`, `TripleLockSuite`, `LlmClient`, and the architecture |
| `phase-mirror-mcp` is the **external MCP surface** for IDE integration | It exposes `lmstudio_*` tools and the legacy governance tools; run via `--features lmstudio` |
| Both read `mcp-contract.json` — keep single source of truth | `phase-mirror-mcp` already does this; `phase-mirror-gpt` reads `config/policy.toml` for semantic policy. Add a `ContractManager` to `phase-mirror-gpt` and load the same `mcp-contract.json` |

### Step 4 — Model management

| Question | Resolution |
|----------|-----------|
| Which model to ship? | SmolLM-360M (already bundled) or Qwen2.5-1.5B (recommended in `LLM_INTEGRATION_PLAN.md`). Both run on CPU. |
| Where does the model live? | `packages/phase-mirror-agent/SmolLM-360M/` — shared path, referenced by `LLM_MODEL_PATH` env var |
| Tokenizer? | Must include `tokenizer.json` in the model directory; `llm_client.rs` already checks for it |
| First-run UX? | If model missing, show download progress in the website UI; `pirtm-candle` already supports `progress_callback` |

---

## Consequences

### Positive

- Single inference path → easier debugging, half the memory footprint
- All LLM calls pass through `ContractManager` → governance is no longer optional
- `phase-mirror-mcp` finds its real role (IDE/agent surface) instead of duplicating the website
- True offline-first: no WASM + Rust double-load

### Negative / Risk

- Removing the JS agent as primary path means CPU-only inference (no GPU acceleration in current `LlmClient` — uses `Device::Cpu`)
- Model warm-up adds latency to first chat message (~1-3s for 360M, ~5-10s for 1.5B)
- If the Rust binary crashes, the entire `/api/chat` fails (currently the JS agent would survive)

### Neutral

- `phase-mirror-agent` npm package stays in `node_modules` but becomes a rarely-used fallback
- `phase-mirror-mcp` binary is unchanged; just properly documented as the MCP server

---

## Checklist Before Implementation

- [ ] Run `cargo build --release` in `packages/phase-mirror-gpt` and confirm binary exists
- [ ] Confirm `SmolLM-360M/model.safetensors` + `config.json` + `tokenizer.json` are complete
- [ ] Confirm `tokenizer.json` exists in the model directory (JS agent uses `AutoTokenizer` but Rust code expects `tokenizer.json`)
- [ ] Run existing `governance` tests: `cargo test --test governance` in `packages/phase-mirror-gpt` and `packages/phase-mirror-mcp`
- [ ] Confirm `phase-mirror-mcp` `lmstudio_register_mcp` tool works for IDE integration
