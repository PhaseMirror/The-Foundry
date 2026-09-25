import express from "express";
import { PhaseMirrorAgent } from 'phase-mirror-agent';
import path from "path";
import crypto from "crypto";
import { spawn } from "child_process";

const GPT_PROJECT_ROOT = process.env.PM_GPT_ROOT || "/home/multiplicity/Multiplicity/Phase Mirror/packages/phase-mirror-gpt";
const GPT_BINARY_PATH = process.env.PM_GPT_BINARY || "/home/multiplicity/Multiplicity/Phase Mirror/target/release/phase-mirror-gpt";
const LLM_MODEL_PATH = process.env.LLM_MODEL_PATH || "/home/multiplicity/Multiplicity/Phase Mirror/packages/phase-mirror-agent/models/tinyllama-1.1b/model.safetensors";
const LLM_CONFIG_PATH = process.env.LLM_CONFIG_PATH || "/home/multiplicity/Multiplicity/Phase Mirror/packages/phase-mirror-agent/models/tinyllama-1.1b/config.json";

// JSON-RPC request type for MCP
interface UdsRequest {
  jsonrpc: "2.0";
  method: "tools/call";
  params: {
    name: string;
    arguments: Record<string, unknown>;
  };
  id: number;
}

import fs from "fs";

// Call GPT binary with MCP tool invocation
async function callGptTool(toolName: string, args: Record<string, unknown>): Promise<any> {
  return new Promise((resolve, reject) => {
    const request: UdsRequest = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: { name: toolName, arguments: args },
      id: Date.now()
    };

    if (!fs.existsSync(GPT_BINARY_PATH)) {
      return reject(new Error(`GPT binary not found at ${GPT_BINARY_PATH}. Run 'cargo build --release' in packages/phase-mirror-gpt.`));
    }

    const child = spawn(GPT_BINARY_PATH, [], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: GPT_PROJECT_ROOT,
      env: {
        ...process.env,
        LLM_MODEL_PATH: LLM_MODEL_PATH,
        LLM_CONFIG_PATH: LLM_CONFIG_PATH,
        RUST_LOG: "info"
      },
      timeout: 300000
    });

    let stdout = "";
    child.stdout.on("data", (data) => { stdout += data.toString(); });
    child.stderr.on("data", (data) => process.stderr.write(data.toString()));

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`GPT binary exited with code ${code}`));
        return;
      }
      const lines = stdout.trim().split("\n").filter(l => l.startsWith('{'));
      if (lines.length > 0) {
        try {
          const resp = JSON.parse(lines[lines.length - 1]);
          const content = resp?.result?.content?.[0]?.text;
          if (resp?.error) {
            reject(new Error(resp.error.message || "GPT tool error"));
            return;
          }
          if (content) {
            try { resolve(JSON.parse(content)); } catch { resolve(content); }
          } else {
            resolve(stdout);
          }
        } catch (e) {
          resolve(stdout);
        }
      } else {
        resolve({ text: stdout });
      }
    });

    child.stdin.write(JSON.stringify(request) + "\n");
    child.stdin.end();
  });
}

// LLM Backend Integration - Ollama API or local binary
async function callLlmBackend(prompt: string): Promise<{text?: string; source: string}> {
  if (process.env.LLM_MOCK === "true") {
    return { text: `[PHASE MIRROR ENGINE] Mock Response\n\n1. MIRROR: Observing your input: "${prompt.slice(0, 60)}..."\n2. DISSONANCE: I detect potential cognitive drift between your stated invariant and the observed environmental parameters.\n3. PHASE: Recommend executing a testable shift with a hard metric horizon to re-align with constitutional constraints.`, source: "mock-llm" };
  }

  // Primary: Rust kernel via generate_governed (local-first, governed inference)
  try {
    const result = await callGptTool("generate_governed", { 
      prompt, 
      max_tokens: 16, 
      temperature: 0.7 
    });
    const text = typeof result === 'string' ? result : (result as any)?.text;
    if (text && !text.startsWith("LLM generation failed")) {
      return { text, source: "phase-mirror-gpt" };
    }
    if (text) {
      console.warn("GPT kernel generation error:", text);
    }
  } catch (e: any) { 
    console.error("GPT kernel generation failed:", e);
  }

  // Secondary: Ollama HTTP API
  if (process.env.LLM_HOST) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const resp = await fetch(`${process.env.LLM_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: process.env.LLM_MODEL, prompt, stream: false }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (resp.ok) {
        const json = await resp.json();
        if (json.response) return { text: json.response, source: "ollama" };
      }
    } catch { /* Fall through */ }
  }

  // Tertiary: local llama.cpp binary
  if (process.env.LLM_BINARY) {
    try {
      const child = spawn(process.env.LLM_BINARY, ['-m', '/tmp/models/model.gguf', '-p', prompt, '--temp', '0.7', '--max_tokens', '256'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 30000
      });
      let stdout = "";
      child.stdout.on('data', (d) => stdout += d.toString());
      
      return new Promise((resolve) => {
        child.on('close', () => {
          if (stdout) {
            try { resolve(JSON.parse(stdout)); } catch { resolve({ text: stdout, source: "llama.cpp" }); }
          } else {
            resolve({ text: stdout, source: "llama.cpp" });
          }
        });
      });
    } catch { /* Fall through */ }
  }

  // Quaternary: JS agent fallback (only if binary unavailable)
  try {
    const { PhaseMirrorAgent } = await import('phase-mirror-agent');
    
    if (!(global as any)._phaseMirrorAgent) {
      (global as any)._phaseMirrorAgent = new PhaseMirrorAgent();
      await (global as any)._phaseMirrorAgent.load();
    }
    const agent = (global as any)._phaseMirrorAgent;

    let methodology = "Phase Mirror Methodology";
    try {
      const fs = await import("fs");
      const path = await import("path");
      methodology = fs.readFileSync(path.join(process.cwd(), "../../The Phase of Mirror Dissonance.md"), "utf8");
    } catch(e) {}
    
    const systemPrompt = `You are the Phase Mirror Agent, an AI cognitive assistant. Analyze the user request according to the following principles:\n\n${methodology}`;
    const responseText = await agent.analyze(prompt, systemPrompt);
    return { text: responseText, source: "phase-mirror-agent" };
  } catch (e: any) { 
    console.error("Agent error:", e);
    /* Fall through */ 
  }

  return { text: "[SYSTEM OFFLINE] No deterministic compiler engine available on the network.", source: "fallback" };
}

// === Governance Helpers ===

async function verifyWithTripleLock(mission_id: string, plan: string, ctx: { permission_bits: number; schema_signature: number; expected_schema: number }) {
  try {
    const result = await callGptTool("triple_lock_verify", { mission_id, plan, ...ctx });
    if (typeof result === 'string' && result.includes("BLOCK")) {
      console.error("TRIPLE LOCK BLOCKED in Rust binary:", result, "Plan Context:", plan);
      const match = result.match(/"governance_status":\s*"([^"]+)"/);
      return {
        mission_id,
        witness_hash: crypto.createHash('sha256').update(`${mission_id}:${plan}`).digest('hex'),
        governance_status: match ? match[1] : 'BLOCKED',
        p_lineage: `p=7:seq:fallback_witness`
      };
    }
    return result;
  } catch {
    return simulateTripleLockVerify(mission_id, plan, ctx);
  }
}

async function simulateTripleLockVerify(mission_id: string, plan: string, ctx: any) {
  const draftHash = crypto.createHash('sha256').update(plan).digest('hex');

  const violatedPatterns = ['public', 'drop table', 'execute'];
  const semanticViolation = violatedPatterns.find(p => plan.toLowerCase().includes(p));

  if (semanticViolation) {
    return {
      mission_id,
      witness_hash: crypto.createHash('sha256').update(`${mission_id}:${draftHash}:BLOCKED`).digest('hex'),
      governance_status: "BLOCKED:L1",
      p_lineage: `p=7:seq:semantic_violation:${semanticViolation}`
    };
  }

  const complianceCheck = (ctx.permission_bits & ctx.expected_schema) === ctx.expected_schema;
  if (!complianceCheck) {
    return {
      mission_id,
      witness_hash: crypto.createHash('sha256').update(`${mission_id}:${draftHash}:BLOCKED`).digest('hex'),
      governance_status: 'BLOCKED:L0_STRUCTURAL',
      p_lineage: `p=7:seq:l0_violation:${crypto.randomBytes(4).toString('hex')}`
    };
  }

  return {
    mission_id,
    witness_hash: crypto.createHash('sha256').update(`${mission_id}:${draftHash}`).digest('hex'),
    governance_status: 'VERIFIED',
    p_lineage: `p=7:seq:${Date.now()}`
  };
}

function validateInvariants(event_type: string, tier: string, ctx: any) {
  const compliance = (ctx.permission_bits & ctx.expected_schema) === ctx.expected_schema;

  if (!compliance && tier === 'tier1') {
    return { outcome: 'Block', reason: 'ADR-005: Critical Schema Violation' };
  }

  if (!compliance && tier === 'tier2') {
    return { outcome: 'Warning', reason: 'Experimental Schema Mismatch detected' };
  }

  if ((ctx.permission_bits & 0b10) === 0b10 && (ctx.permission_bits & 0b1000) !== 0b1000) {
    return { outcome: tier === 'tier1' ? 'Block' : 'Warning',
             reason: tier === 'tier1' ? 'ADR-005: Privilege Escalation Attempt' : 'Unprivileged write pattern observed' };
  }

  return { outcome: 'Allow', reason: null };
}

async function getGovernanceStatus() {
  try {
    const status = await callGptTool("get_governance_status", {});
    if (typeof status === 'string') {
      try {
        return JSON.parse(status);
      } catch {
        return { compliance_rate: 1.0, system_state: 'SECURE' };
      }
    }
    return status;
  } catch {
    return {
      compliance_rate: 100.0,
      policy_version: 'ADR-006',
      system_state: 'SECURE',
      invariant_status: {
        l0_validator: 'ACTIVE',
        l1_policy: 'LOADED',
        p7_chain: 'CONTINUOUS'
      }
    };
  }
}

// === Server Bootstrap ===

async function startServer() {
   const app = express();
   const phaseMirrorAgent = new PhaseMirrorAgent();
   await phaseMirrorAgent.load();
   const PORT: number = parseInt(process.env.PORT || '3001', 10);

   app.use(express.json({ limit: '15mb' }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "healthy", timestamp: Date.now() });
  });

  // Readiness probe for orchestrators
  app.get("/api/ready", async (_req, res) => {
    try {
      const status = await getGovernanceStatus();
      const ready = status.compliance_rate === 1.0;
      res.status(ready ? 200 : 503).json({ ready, ...status });
    } catch {
      res.status(503).json({ ready: false, error: "Cannot connect to governance kernel" });
    }
  });

  // Prometheus metrics endpoint
  app.get("/api/metrics", async (_req, res) => {
    try {
      const status = await getGovernanceStatus();
      const metrics = `# HELP phase_mirror_compliance_rate Governance compliance percentage
# TYPE phase_mirror_compliance_rate gauge
phase_mirror_compliance_rate ${status.compliance_rate}

# HELP phase_mirror_archivum_entries Total events in ledger
# TYPE phase_mirror_archivum_entries gauge
phase_mirror_archivum_entries ${status.last_archivum_sequence || 0}
`.trim();
      res.set('Content-Type', 'text/plain').send(metrics);
    } catch {
      res.status(500).json({ error: "Failed to retrieve metrics" });
    }
  });

  // Chat endpoint with Triple-Lock verification
  app.post("/api/chat", async (req, res) => {
     try {
       const { message, history, file, files } = req.body;

       if (!message && !file && (!files || files.length === 0)) {
         return res.status(400).json({ error: "Message or file is required" });
       }

       // Construct plan context for governance verification
       const planContext = history?.length
         ? `${history.map((h: any) => `${h.role}: ${h.text}`).join('\n')}\nUser: ${message}`
         : message || "Please analyze the attached document.";

       const fullPrompt = planContext;

       // Governance verification
       const ctx = { permission_bits: 15, schema_signature: 3, expected_schema: 3 };
       const witness = await verifyWithTripleLock(`chat-${Date.now()}`, planContext, ctx);

       res.setHeader('X-Governance-Status', witness.governance_status);
       res.setHeader('X-Witness-Hash', witness.witness_hash);
       res.setHeader('X-P-Lineage', witness.p_lineage);

       if (witness.governance_status !== 'VERIFIED') {
         return res.status(403).json({ error: "Governance block: " + witness.governance_status, witness });
       }

       // Directly use PhaseMirrorAgent for response (bypassing external LLM backends)
       try {
         const responseText = await phaseMirrorAgent.analyze(fullPrompt);
         res.json({ text: responseText });
       } catch (agentError: any) {
         console.error("Agent generation failed:", agentError);
         res.status(503).json({ error: agentError.message || "Native agent unavailable" });
       }
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Streaming chat endpoint (SSE)
  app.post("/api/chat/stream", async (req, res) => {
     const { message, history, file, files } = req.body;

     if (!message && !file && (!files || files.length === 0)) {
       return res.status(400).json({ error: "Message or file is required" });
     }

     res.setHeader("Content-Type", "text/event-stream");
     res.setHeader("Cache-Control", "no-cache");
     res.setHeader("Connection", "keep-alive");

     const planContext = history?.length
       ? `${history.map((h: any) => `${h.role}: ${h.text}`).join('\n')}\nUser: ${message}`
       : message || "Please analyze the attached document.";
     const fullPrompt = planContext;

     try {
       const ctx = { permission_bits: 15, schema_signature: 3, expected_schema: 3 };
       const witness = await verifyWithTripleLock(`chat-${Date.now()}`, planContext, ctx);

       res.write(`event: meta\ndata: ${JSON.stringify({ witness_hash: witness.witness_hash, governance_status: witness.governance_status })}\n\n`);

       if (witness.governance_status !== "VERIFIED") {
         res.write(`event: error\ndata: ${JSON.stringify({ error: "Governance block: " + witness.governance_status })}\n\n`);
         res.end();
         return;
       }

       const responseText = await phaseMirrorAgent.analyze(fullPrompt);
       const words = responseText.split(/(?=\s)/);
       for (const word of words) {
         res.write(`data: ${JSON.stringify({ text: word })}\n\n`);
       }
       res.write("event: done\ndata: {}\n\n");
       res.end();
       return;
     } catch (error: any) {
       res.write(`event: error\ndata: ${JSON.stringify({ error: error.message || "Stream error" })}\n\n`);
       res.end();
       return;
     }
  });

  // Direct analysis endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });
      const response = await phaseMirrorAgent.analyze(prompt);
      res.json({ text: response });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Triple-Lock Integration Endpoints
  app.post("/api/triple-lock-verify", async (req, res) => {
    try {
      const { mission_id, plan, permission_bits, schema_signature, expected_schema } = req.body;

      if (!mission_id || !plan) {
        return res.status(400).json({ error: "mission_id and plan are required" });
      }

      // Default ctx with valid schema bits (SCHEMA_VALID | SCHEMA_NON_EMPTY = 3)
      const ctx = {
        permission_bits: permission_bits ?? 15,
        schema_signature: schema_signature ?? 3,
        expected_schema: expected_schema ?? 3
      };

      const witness = await verifyWithTripleLock(mission_id, plan, ctx);

      res.setHeader('X-Governance-Status', witness.governance_status);
      res.setHeader('X-Witness-Hash', witness.witness_hash);
      res.setHeader('X-P-Lineage', witness.p_lineage);

      if (witness.governance_status === 'VERIFIED') {
        res.json(witness);
      } else {
        res.status(403).json({ error: witness.governance_status, witness });
      }
    } catch (error: any) {
      console.error("Triple-Lock verification error:", error);
      res.status(500).json({ error: error.message || "Triple-Lock verification failed" });
    }
  });

  app.post("/api/governance-status", async (req, res) => {
    try {
      const status = await getGovernanceStatus();
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to retrieve governance status" });
    }
  });

  app.post("/api/validate-invariants", async (req, res) => {
    try {
      const { event_type, tier, permission_bits, schema_signature, expected_schema } = req.body;

      if (!event_type || !tier) {
        return res.status(400).json({ error: "event_type and tier are required" });
      }

      const ctx = {
        permission_bits: permission_bits || 0,
        schema_signature: schema_signature || 0,
        expected_schema: expected_schema || 0
      };

      const outcome = validateInvariants(event_type, tier, ctx);
      res.json(outcome);
    } catch (error: any) {
      res.status(500).json({ error: "Invariant validation failed" });
    }
  });

  app.post("/api/tools/legal_verify", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "text is required" });

      const result = await callGptTool("legal_verify", { text });
      const content = typeof result === 'string' ? result : (result as any)?.text;
      if (content) {
        try {
          res.json(JSON.parse(content));
        } catch {
          res.json({ result: { content: [{ text: content }] } });
        }
      } else {
        res.json(result);
      }
    } catch (error: any) {
      res.status(500).json({ error: "Legal verify failed: " + error.message });
    }
  });

  // Vite integration middleware
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // Use custom to prevent Vite from handling HTML/404s automatically
    });
    
    app.use(vite.middlewares);

    app.use(async (req, res, next) => {
      // If it's a direct file request that vite should handle, let vite handle it
      if (req.originalUrl.includes('.') && !req.originalUrl.endsWith('.html')) {
        return next();
      }
      try {
        const fs = await import('fs/promises');
        let template = await fs.readFile(path.join(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) {
          next(err);
        }
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();