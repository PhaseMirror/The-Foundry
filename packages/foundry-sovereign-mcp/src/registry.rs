use crate::eventlog::EventLog;
use crate::tools as fox;
use serde::de::DeserializeOwned;
use serde_json::{json, Value};

/// A single MCP tool exposed by the Founder OS gateway.
///
/// Implementations are intentionally thin: parse the JSON-RPC args, run the
/// certified executor from [`crate::tools`], persist the sealed envelope to
/// the provided ledger, and serialize the result.
pub trait McpTool: Send + Sync {
    fn name(&self) -> &'static str;
    fn description(&self) -> &'static str;
    fn input_schema(&self) -> Value;

    /// Execute the tool. `Ok(value)` carries the sealed envelope as JSON;
    /// `Err(value)` carries a structured violation vector. Both are embedded
    /// verbatim into the MCP `content[0].text` payload by the protocol layer.
    fn call(&self, args: Value, ledger: &mut EventLog) -> Result<Value, Value>;
}

/// Registry of registered MCP tools, backed by a static list.
pub struct ToolRegistry {
    tools: Vec<&'static dyn McpTool>,
}

impl ToolRegistry {
    pub fn new() -> Self {
        Self { tools: Vec::new() }
    }

    pub fn register(&mut self, tool: &'static dyn McpTool) {
        self.tools.push(tool);
    }

    pub fn has(&self, name: &str) -> bool {
        self.tools.iter().any(|t| t.name() == name)
    }

    /// MCP `tools/list` result body.
    pub fn list(&self) -> Value {
        let tools: Vec<Value> = self
            .tools
            .iter()
            .map(|t| {
                json!({
                    "name": t.name(),
                    "description": t.description(),
                    "inputSchema": t.input_schema(),
                })
            })
            .collect();
        json!({ "tools": tools })
    }

    /// MCP `tools/call` dispatch.
    pub fn call(&self, name: &str, args: Value, ledger: &mut EventLog) -> Result<Value, Value> {
        let tool = self
            .tools
            .iter()
            .find(|t| t.name() == name)
            .ok_or_else(|| {
                json!({ "status": "rejected", "reason": format!("unknown tool: {name}") })
            })?;
        tool.call(args, ledger).map_err(|violation| violation)
    }
}

impl Default for ToolRegistry {
    fn default() -> Self {
        Self::new()
    }
}

/// The full Founder OS tool set.
pub fn builtin_registry() -> ToolRegistry {
    let mut r = ToolRegistry::new();
    r.register(&WorkflowRun);
    r.register(&ContentCertify);
    r.register(&SequenceCompile);
    r.register(&LeadProcess);
    r.register(&ProofOfPractice);
    r.register(&ClientReceiptExport);
    r
}

fn text_payload(value: &Value) -> String {
    serde_json::to_string(value).unwrap_or_else(|_| "{}".into())
}

// ---------------------------------------------------------------------------

struct WorkflowRun;

impl McpTool for WorkflowRun {
    fn name(&self) -> &'static str {
        "workflow.run"
    }
    fn description(&self) -> &'static str {
        "Certified growth/funnel workflow execution. Rejects non-contractive or off-policy operation chains; seals a fail-closed CRMF envelope on success."
    }
    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "workflow_id": { "type": "string", "description": "Logical workflow id, e.g. founder-os/email-sequence/lead-nurture" },
                "context_hash": { "type": "string", "description": "32-byte hex lineage anchor (0x-prefixed)" },
                "actor_id": { "type": "string" },
                "proposed_ops": { "type": "array", "items": {
                    "type": "object",
                    "properties": {
                        "op_type": { "type": "string" },
                        "target": { "type": "string" }
                    },
                    "required": ["op_type", "target"]
                } }
            },
            "required": ["workflow_id", "context_hash", "proposed_ops"]
        })
    }
    fn call(&self, args: Value, ledger: &mut EventLog) -> Result<Value, Value> {
        let req: fox::WorkflowRequest = deserialize(args)?;
        match fox::execute_certified_workflow(req) {
            Ok(seal) => persist(ledger, seal),
            Err(violations) => Err(json!({ "status": "rejected", "violation_vector": violations })),
        }
    }
}

struct ContentCertify;

impl McpTool for ContentCertify {
    fn name(&self) -> &'static str {
        "content.certify"
    }
    fn description(&self) -> &'static str {
        "Certifies a content draft against brand invariants and issues content.publish permission as a CRMF envelope."
    }
    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "asset_type": { "type": "string" },
                "draft": { "type": "string" },
                "target_segment": { "type": "string" }
            },
            "required": ["asset_type", "draft", "target_segment"]
        })
    }
    fn call(&self, args: Value, ledger: &mut EventLog) -> Result<Value, Value> {
        let req: fox::ContentRequest = deserialize(args)?;
        match fox::execute_content_certify(req) {
            Ok(seal) => persist(ledger, seal),
            Err(violations) => Err(json!({ "status": "rejected", "violation_vector": violations })),
        }
    }
}

struct SequenceCompile;

impl McpTool for SequenceCompile {
    fn name(&self) -> &'static str {
        "sequence.compile"
    }
    fn description(&self) -> &'static str {
        "Compiles an SOP/curriculum delta set and binds its PWEH lineage to the previous SOP state hash."
    }
    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "sop_id": { "type": "string" },
                "prev_sop_hash": { "type": "string", "description": "32-byte hex lineage anchor" },
                "actor_id": { "type": "string" },
                "step_deltas": { "type": "array", "items": {
                    "type": "object",
                    "properties": {
                        "op_type": { "type": "string" },
                        "target": { "type": "string" }
                    },
                    "required": ["op_type", "target"]
                } }
            },
            "required": ["sop_id", "prev_sop_hash", "step_deltas"]
        })
    }
    fn call(&self, args: Value, ledger: &mut EventLog) -> Result<Value, Value> {
        let req: fox::SequenceCompileRequest = deserialize(args)?;
        match fox::execute_sequence_compile(req) {
            Ok(seal) => persist(ledger, seal),
            Err(violations) => Err(json!({ "status": "rejected", "violation_vector": violations })),
        }
    }
}

struct LeadProcess;

impl McpTool for LeadProcess {
    fn name(&self) -> &'static str {
        "lead.process"
    }
    fn description(&self) -> &'static str {
        "Hydrates a lead only through the declared field allowlist; PII field names and PII value fingerprints fail closed."
    }
    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "context_hash": { "type": "string" },
                "actor_id": { "type": "string" },
                "lead_fields": { "type": "array", "items": {
                    "type": "object",
                    "properties": {
                        "field": { "type": "string" },
                        "value": { "type": "string" }
                    },
                    "required": ["field", "value"]
                } },
                "allowed_fields": { "type": "array", "items": { "type": "string" } }
            },
            "required": ["lead_fields", "allowed_fields"]
        })
    }
    fn call(&self, args: Value, ledger: &mut EventLog) -> Result<Value, Value> {
        let req: fox::LeadProcessRequest = deserialize(args)?;
        match fox::execute_lead_process(req) {
            Ok(seal) => persist(ledger, seal),
            Err(violations) => Err(json!({ "status": "rejected", "violation_vector": violations })),
        }
    }
}

struct ProofOfPractice;

impl McpTool for ProofOfPractice {
    fn name(&self) -> &'static str {
        "proof_of_practice.issue"
    }
    fn description(&self) -> &'static str {
        "Issues a Proof-of-Practice certificate for a certified community action — the mandatory precondition for MSC issuance."
    }
    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "member_id": { "type": "string" },
                "evidence_hash": { "type": "string" },
                "action_type": { "type": "string", "enum": ["resolve_bottleneck", "calibration_contribution", "mentor_share", "verified_practice"] },
                "actor_id": { "type": "string" }
            },
            "required": ["member_id", "evidence_hash", "action_type"]
        })
    }
    fn call(&self, args: Value, ledger: &mut EventLog) -> Result<Value, Value> {
        let req: fox::ProofOfPracticeRequest = deserialize(args)?;
        match fox::execute_proof_of_practice(req) {
            Ok(seal) => persist(ledger, seal),
            Err(violations) => Err(json!({ "status": "rejected", "violation_vector": violations })),
        }
    }
}

struct ClientReceiptExport;

impl McpTool for ClientReceiptExport {
    fn name(&self) -> &'static str {
        "client.receipt.export"
    }
    fn description(&self) -> &'static str {
        "Exports a client-verifiable delivery receipt bound to a policy bundle. Zero-knowledge anchor remains empty until mtpi-certifier proof integration."
    }
    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "client_id": { "type": "string" },
                "payload_hash": { "type": "string" },
                "policy_bundle": { "type": "array", "items": { "type": "string" } },
                "actor_id": { "type": "string" }
            },
            "required": ["client_id", "payload_hash", "policy_bundle"]
        })
    }
    fn call(&self, args: Value, ledger: &mut EventLog) -> Result<Value, Value> {
        let req: fox::ClientReceiptRequest = deserialize(args)?;
        match fox::execute_client_receipt_export(req) {
            Ok(seal) => persist(ledger, seal),
            Err(violations) => Err(json!({ "status": "rejected", "violation_vector": violations })),
        }
    }
}

fn deserialize<T: DeserializeOwned>(args: Value) -> Result<T, Value> {
    serde_json::from_value(args).map_err(|e| {
        json!({
            "status": "rejected",
            "violation_vector": [{
                "field": "request_schema",
                "expected": "valid tool argument JSON",
                "actual": e.to_string()
            }]
        })
    })
}

fn persist(ledger: &mut EventLog, seal: fox::SealedEnvelope) -> Result<Value, Value> {
    let sequence = ledger.append(&seal.envelope).map_err(|e| {
        json!({
            "status": "rejected",
            "reason": "ledger append failed; side effect blocked",
            "error": e.to_string()
        })
    })?;
    let mut value = serde_json::to_value(&seal.envelope)
        .map_err(|e| json!({ "status": "rejected", "reason": e.to_string() }))?;
    if let Some(obj) = value.as_object_mut() {
        obj.insert("ledger_sequence".into(), json!(sequence));
        obj.insert("status".into(), json!("accepted"));
        obj.insert("receipt_id".into(), json!(seal.receipt_id));
        obj.insert("envelope_hash".into(), json!(seal.envelope_hash));
    }
    Ok(value)
}

/// Helper used by the HTTP/stdio layers to serialize a response block.
pub fn mcp_text(value: &Value, is_error: bool) -> Value {
    json!({
        "content": [{ "type": "text", "text": text_payload(value) }],
        "isError": is_error
    })
}