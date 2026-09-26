# ADR 3: Resolving Hybrid Inference Architectures (Local vs Gemini)

## Context
The project currently exhibits a contradiction in its AI inference strategy. `server.ts` provisions a local LLM via JSON-RPC to a spawned Rust binary (`phase-mirror-gpt` running SmolLM-360M), while `services/gemini.ts` uses `@google/genai` with `gemini-3-pro-preview` for "bringing artifacts to life". Furthermore, the `README.md` identifies the project as an AI Studio app dependent on a `GEMINI_API_KEY`. 

**Hidden Assumption:** The system assumes that it has seamless access to both a local Rust environment (with specific hardcoded paths like `/home/multiplicity/Multiplicity/Phase Mirror/...`) and an external network connection for Gemini, without a clear fallback mechanism or routing layer between them.

## Decision
We will formally adopt a hybrid "Phase Mirror" inference strategy:
1. **Local Guardian/Examiner:** The local `phase-mirror-gpt` (SmolLM) will be used exclusively for privacy-preserving, low-latency governance, Triple-Lock verification, and invariant checking. 
2. **Cloud Genius:** `gemini-3-pro-preview` will be used exclusively for high-complexity generative tasks (e.g., UI generation from images/artifacts). 
3. **Graceful Degradation:** If the local GPT binary is unavailable (e.g., running in an environment without the compiled Rust binary), the system will fallback to the simulated governance mode (already partially implemented but needing formalization).

## Consequences
- Requires refactoring `server.ts` to remove hardcoded user paths (`/home/multiplicity/...`) in favor of relative or environmentally injected paths.
- Establishes a clear boundary between semantic validation (Local) and creative generation (Cloud).
