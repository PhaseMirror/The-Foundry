# LLM Backend Integration Plan

## Status: ✅ Mock Testing Complete

### Verified
- `callLlmBackend()` integrated in `server.ts`
- Mock LLM returns reflection responses
- Governance blocks L1 violations (tested "public data")

## Production Integration Options

### Option A: Ollama (Recommended)
```bash
# Install
curl -fsSL https://ollama.com/install.sh | sh

# Start server
ollama serve &

# Pull model (1.5b params, ~1GB)
ollama pull qwen2.5:1.5b

# Run with LLM
OLLAMA_HOST=http://127.0.0.1:11434 OLLAMA_MODEL=qwen2.5:1.5b npm run dev
```

### Option B: llama.cpp Binary
```bash
# Build completed at /tmp/llama.cpp/
cd /tmp/llama.cpp/build
make -j$(nproc) llama-cli

# Download GGUF model
# (TinyLlama Q2_K ~1GB recommended)

# Run with LLM
LLM_BINARY=/tmp/llama.cpp/build/bin/llama-cli npm run dev
```

### Option C: LM Studio
If LM Studio becomes available:
```bash
LM_STUDIO_URL=http://127.0.0.1:1234/v1 npm run dev
```

## Architecture
```
Browser → Echo Server → Triple-Lock (verification) → LLM Backend → Governance Gate → Response
```

All outputs from LLM pass through `triple_lock_verify` before delivery.