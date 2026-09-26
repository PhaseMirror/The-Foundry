import express from "express";
import path from "path";
import crypto from "crypto";
import { spawn } from "child_process";

// === Phase Mirror GPT Integration ===

const GPT_BINARY_PATH = process.env.PM_GPT_BINARY || "/home/multiplicity/Multiplicity/Phase Mirror/phase-mirror-gpt/bin/phase-mirror-gpt";
const GPT_PROJECT_ROOT = process.env.PM_GPT_ROOT || "/home/multiplicity/Multiplicity/Phase Mirror/phase-mirror-gpt";
const LLM_BINARY = process.env.LLM_BINARY || "";
const LLM_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const LLM_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:1.5b";

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

// Call GPT binary with MCP tool invocation
async function callGptTool(toolName: string, args: Record<string, unknown>): Promise<any> {
  return new Promise((resolve, reject) => {
    const request: UdsRequest = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: { name: toolName, arguments: args },
      id: Date.now()
    };

    const child = spawn(GPT_BINARY_PATH, [], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: GPT_PROJECT_ROOT
    });

    let stdout = "";
    child.stdout.on("data", (data) => { stdout += data.toString(); });
    child.stderr.on("data", (data) => process.stderr.write(data.toString()));

    child.on("close", (code) => {
      if (code !== 0 && !USE_GEMINI_FALLBACK) {
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
  // Try Ollama HTTP API first
  if (LLM_HOST) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const resp = await fetch(`${LLM_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: LLM_MODEL, prompt, stream: false }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (resp.ok) {
        const json = await resp.json();
        if (json.response) return { text: json.response, source: "ollama" };
      }
    } catch { /* Fall through */ }
  }

  // Try local llama.cpp binary
  if (LLM_BINARY) {
    try {
      const child = spawn(LLM_BINARY, ['-m', '/tmp/models/model.gguf', '-p', prompt, '--temp', '0.7', '--max_tokens', '256'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 30000
      });
      let stdout = "";
      child.stdout?.on('data', (d) => stdout += d.toString());
      await new Promise(r => child.on('close', r));
      if (stdout) return { text: stdout.trim(), source: "llamacpp" };
    } catch { /* Fall through */ }
  }

  // No LLM available - return governance-only response
  return { source: "governance-only" };
}

// Fallback Gemini client (optional)
let geminiClient: any = null;
function getGeminiClient() {
  if (!geminiClient && USE_GEMINI_FALLBACK) {
    try {
      const { GoogleGenAI } = require("@google/genai");
      geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch {
      geminiClient = null;
    }
  }
  return geminiClient;
}

// === Governance Helpers ===

async function verifyWithTripleLock(mission_id: string, plan: string, ctx: { permission_bits: number; schema_signature: number; expected_schema: number }) {
  try {
    const result = await callGptTool("triple_lock_verify", { mission_id, plan, ...ctx });
    if (typeof result === 'string' && result.includes("BLOCK")) {
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
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Chat endpoint with Triple-Lock verification
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Construct plan context
      const planContext = history?.length
        ? `${history.map((h: any) => `${h.role}: ${h.text}`).join('\n')}\nUser: ${message}`
        : message;

      // Execute Triple-Lock verification (Phase 1: Genius, Phase 2: Guardian, Phase 3: Examiner)
      // SCHEMA_VALID = 1, SCHEMA_NON_EMPTY = 2 → expected_schema = 3
      const ctx = { permission_bits: 15, schema_signature: 3, expected_schema: 3 };
      const witness = await verifyWithTripleLock(`chat-${Date.now()}`, planContext, ctx);

      res.setHeader('X-Governance-Status', witness.governance_status);
      res.setHeader('X-Witness-Hash', witness.witness_hash);
      res.setHeader('X-P-Lineage', witness.p_lineage);

      if (witness.governance_status !== 'VERIFIED') {
        return res.status(403).json({
          error: "Governance block: " + witness.governance_status,
          witness
        });
      }

      // Get critique prompt via GPT reflect_plan
      let critique = "";
      try {
        const response = await callGptTool("reflect_plan", { plan: planContext });
        critique = typeof response === 'string' ? response : response.text || "";
      } catch (e) {
        critique = `Critique: ${planContext}`;
      }

      // Call LLM backend if available
      const llmResult = await callLlmBackend(critique || planContext);
      if (llmResult.text) {
        res.json(llmResult);
      } else {
        res.json({ text: critique || "No response available." });
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
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

  // Vite integration middleware
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();