# LLM Backend Integration Plan

## Goal
Add actual AI responses to `/api/chat` using a locally-run, governance-gated LLM backend.

## Recommended Stack: Ollama + llama.cpp
- **Ollama**: ~50MB CLI, single binary, runs quantized GGUF models
- **Model**: `qwen2.5:1.5b` or `gemma3:270m` (~300MB-1GB, production-ready)
- **Integration**: MCP subprocess bridge via JSON-RPC

## Architecture
```
Browser → Echo Server → phase-mirror-gpt (MCP) → QwenSovereigntyGate → Ollama LLM → Triple-Lock → Response
```

## Implementation Steps

### 1. Install Ollama (one-time)
```bash
curl -fsSL https://ollama.com/install.sh | sh
# Add to PATH: ~/.local/bin/ollama
```

### 2. Pull Model
```bash
ollama pull qwen2.5:1.5b  # 1.5b params, ~1GB
# Alternative: ollama pull gemma3:270m  # smaller, ~300MB
```

### 3. Configure Environment
```bash
# In .env or shell
OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:1.5b
```

### 4. Connect to Echo Server
Modify `server.ts` to:
- After `reflect_plan` returns critique prompt
- Call Ollama API `/api/generate`
- Pass response through `triple_lock_verify` before returning

### 5. Security Model
- All prompts pass L1 semantic blocklist first (pre-LLM)
- All LLM outputs pass Triple-Lock before delivery
- No raw LLM output reaches the user without verification

## Resource Requirements
- RAM: 2-4GB for 1.5b model
- Disk: ~1GB model cache
- CPU: AVX2 support (most modern x86_64)

## Deployment Commands
```bash
# Start LLM server
ollama serve &

# Start Echo (with LLM integration)
OLLAMA_MODEL=qwen2.5:1.5b npm run dev
```

## Alternative: Direct llama.cpp
If Ollama unavailable, compile llama.cpp:
```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp && make -j$(nproc)
./llama-cli -m /path/to/model.gguf -p "prompt" --json-schema
```