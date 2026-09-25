# ADR-PM-008: Production SmolLM Integration with Sedona Spine

## Status
Proposed

## Context
SmolLM-360M weights exist in `packages/phase-mirror-agent/SmolLM-360M/`. Goal: integrate it as a **governed LLM backend** that complies with:
- Sedona Spine L0 invariants (deterministic legal risk engine)
- Phase Mirror governance (Triple-Lock verification on all inputs/outputs)
- PIRTM convergence (|k| < 1 on recursive tensor operations)

## Decision

### 1. Model Preparation
SmolLM uses safetensors format - compatible with candle:
```
packages/phase-mirror-agent/SmolLM-360M/
├── model.safetensors (1.4GB)
├── config.json
└── tokenizer.json
```

### 2. Governance Layer Integration
Echo server (`server.ts`) implements `callLlmBackend()` with:
- Pre-execution: `triple_lock_verify` on prompt (TripleLockSuite)
- Execution: Rust binary with candle LLM (via MCP stdin/stdout)
- Post-execution: Witness recorded in Λ-Archivum

### 3. Sedona Spine Binding
All LLM interactions pass through ADR-003 binding:
- Rust kernel validates `permission_bits`, `schema_signature`, `expected_schema`
- `Λ-Archivum` logs all `mission_id`, prompt hash, response hash
- Zero drift: `RiskLevel` enum tracked in GovernedGeneration receipt

### 4. LLM Backend Options
**A. Rust + Candle (Production)** - ~2GB RAM footprint:
```bash
export LLM_MODEL_PATH=/path/to/SmolLM-360M/model.safetensors
export LLM_CONFIG_PATH=/path/to/SmolLM-360M/config.json
```

**B. Ollama (Alternative)**:
```bash
export LLM_HOST=http://127.0.0.1:11434
export LLM_MODEL=qwen2.5:1.5b
```

**C. Mock Mode (Development)**:
```bash
export LLM_MOCK=true
```

## Implementation Steps
1. Configure `LLM_MODEL_PATH` and `LLM_CONFIG_PATH` for candle loading
2. Verify Triple-Lock blocks semantic violations before LLM call
3. Register in `MASTER_REGISTRY.md` with witness hash chaining
4. CI Gate: `cargo test --release -p phase-mirror-gpt -- --nocapture`

## Verification Gates
- [x] L1 Semantic blocklist rejects "public", "DROP TABLE" 
- [x] L0 Schema validation on bitmask operations
- [x] p=7 witness chaining in MASTER_REGISTRY.md
- [ ] Sedona Spine spectral compliance verified (<60s inference)