use crate::envelope::{CrmfEnvelope, SealSpec, ZkAnchor, GENESIS_STATE_HASH};
use crate::policy::PolicyValidator;
use crate::pweh::compute_pweh_lineage;
use crate::ucc::{PrimeChannel, RuntimeState, SkeletonState, TensorMapState, ZeroModeExtractable};
use num_rational::Rational64;
use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// Request / response wire types (serde JSON via MCP tools/call).
// ---------------------------------------------------------------------------

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Operation {
    pub op_type: String,
    pub target: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct WorkflowRequest {
    pub workflow_id: String,
    pub context_hash: String,
    #[serde(default = "default_actor_id")]
    pub actor_id: String,
    pub proposed_ops: Vec<Operation>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ContentRequest {
    pub asset_type: String,
    pub draft: String,
    pub target_segment: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SequenceCompileRequest {
    pub sop_id: String,
    pub prev_sop_hash: String,
    #[serde(default = "default_actor_id")]
    pub actor_id: String,
    pub step_deltas: Vec<Operation>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LeadField {
    pub field: String,
    pub value: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LeadProcessRequest {
    #[serde(default = "default_context_hash")]
    pub context_hash: String,
    #[serde(default = "default_actor_id")]
    pub actor_id: String,
    pub lead_fields: Vec<LeadField>,
    pub allowed_fields: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProofOfPracticeRequest {
    pub member_id: String,
    pub evidence_hash: String,
    pub action_type: String,
    #[serde(default = "default_actor_id")]
    pub actor_id: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ClientReceiptRequest {
    pub client_id: String,
    pub payload_hash: String,
    pub policy_bundle: Vec<String>,
    #[serde(default = "default_actor_id")]
    pub actor_id: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Violation {
    pub field: String,
    pub expected: String,
    pub actual: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CrmfResponse {
    pub status: String,
    pub receipt_id: Option<String>,
    pub envelope_hash: Option<String>,
    pub violation_vector: Option<Vec<Violation>>,
}

/// A certified, sealed envelope plus the audit fields exposed to callers.
#[derive(Debug, Clone)]
pub struct SealedEnvelope {
    pub receipt_id: String,
    pub envelope_hash: String,
    pub envelope: CrmfEnvelope,
}

fn default_actor_id() -> String {
    "mcp:founder-os-sovereign".into()
}

fn default_context_hash() -> String {
    GENESIS_STATE_HASH.into()
}

// ---------------------------------------------------------------------------
// Execution helpers
// ---------------------------------------------------------------------------

/// Build the UCC zero-mode runtime state for an operation chain.
///
/// Deliberately minimal model (see ADR): `L_Phi = n·L_T + Σ(weight·defect)` in
/// ℚ, with `L_T = 1/10`, per-op `weight = 1/10`, `defect = 1/10`. A batch of
/// more than 9 operations exceeds the contractivity bound and halts.
fn runtime_state_for(ops: &[Operation]) -> RuntimeState {
    let n = ops.len() as i64;
    RuntimeState {
        skeleton: SkeletonState {
            operator_norm: Rational64::new(n, 1),
        },
        tensor_map: TensorMapState {
            lipschitz_bound: Rational64::new(1, 10),
        },
        active_channels: ops
            .iter()
            .enumerate()
            .map(|(i, _)| PrimeChannel {
                prime_index: i as u64,
                weight: Rational64::new(1, 10),
                defect: Rational64::new(1, 10),
            })
            .collect(),
    }
}

/// Run segment (a) of the certification pipeline and return either the
/// violations that must halt the proposal or a validated op chain.
fn validate_contractivity(ops: &[Operation]) -> Result<(), Vec<Violation>> {
    if let Err(e) = runtime_state_for(ops).assert_l0_constitutional_gate() {
        return Err(vec![Violation {
            field: "lip_bound".into(),
            expected: "L_Phi < 1 (contractive transition)".into(),
            actual: format!("SIG_GOV_KILL: {e}"),
        }]);
    }
    Ok(())
}

/// Seal a certified transition into a CRMF envelope (covers PWEH digest,
/// policy hash binding, side-effect permissions, and actor provenance).
fn seal_envelope(
    validator: &PolicyValidator,
    tool: &str,
    workflow_id: &str,
    actor_id: &str,
    prev_state_hash: &str,
    state_hash: String,
    ops: &[Operation],
    zk_anchor: Option<ZkAnchor>,
) -> SealedEnvelope {
    let envelope = CrmfEnvelope::seal(SealSpec {
        tool: tool.into(),
        workflow_id: workflow_id.into(),
        actor_id: actor_id.into(),
        prev_state_hash: prev_state_hash.into(),
        state_hash: state_hash.clone(),
        policy_hash: validator.policy_hash(),
        side_effect_permissions: validator.permitted_side_effects(ops),
        zk_anchor,
    });
    SealedEnvelope {
        receipt_id: envelope.envelope_id.clone(),
        envelope_hash: envelope.state_hash.clone(),
        envelope,
    }
}

// ---------------------------------------------------------------------------
// The six certified Founder OS tools
// ---------------------------------------------------------------------------

/// Certified growth / funnel workflow execution.
pub fn execute_certified_workflow(req: WorkflowRequest) -> Result<SealedEnvelope, Vec<Violation>> {
    let validator = PolicyValidator::new();

    let violations = validator.validate_operations(&req.proposed_ops, &req.context_hash);
    if !violations.is_empty() {
        return Err(violations);
    }
    validate_contractivity(&req.proposed_ops)?;

    let context = if req.context_hash.trim().is_empty() {
        GENESIS_STATE_HASH
    } else {
        req.context_hash.as_str()
    };
    let state_hash = compute_pweh_lineage(context, &req.proposed_ops).map_err(|e| {
        vec![Violation {
            field: "state_hash".into(),
            expected: "32-byte hex context_hash".into(),
            actual: e,
        }]
    })?;

    Ok(seal_envelope(
        &validator,
        "workflow.run",
        &req.workflow_id,
        &req.actor_id,
        context,
        state_hash,
        &req.proposed_ops,
        None,
    ))
}

/// Content asset certification (brand invariants + publish permission).
pub fn execute_content_certify(req: ContentRequest) -> Result<SealedEnvelope, Vec<Violation>> {
    let validator = PolicyValidator::new();

    let violations = validator.validate_content(&req.draft);
    if !violations.is_empty() {
        return Err(violations);
    }

    let publish_op = Operation {
        op_type: "content.publish".into(),
        target: req.target_segment.clone(),
    };
    validate_contractivity(std::slice::from_ref(&publish_op))?;

    let payload = format!("{}|{}|{}", req.asset_type, req.draft, req.target_segment);
    let state_hash = crate::poseidon::poseidon_hash_hex(payload.as_bytes());

    Ok(seal_envelope(
        &validator,
        "content.certify",
        &format!("founder-os/content/{}", req.asset_type),
        &default_actor_id(),
        GENESIS_STATE_HASH,
        state_hash,
        std::slice::from_ref(&publish_op),
        None,
    ))
}

/// SOP / curriculum sequence compilation with lineage binding.
pub fn execute_sequence_compile(
    req: SequenceCompileRequest,
) -> Result<SealedEnvelope, Vec<Violation>> {
    let validator = PolicyValidator::new();

    let violations = validator.validate_sequence_deltas(&req.step_deltas);
    if !violations.is_empty() {
        return Err(violations);
    }
    validate_contractivity(&req.step_deltas)?;

    let prev = if req.prev_sop_hash.trim().is_empty() {
        GENESIS_STATE_HASH
    } else {
        req.prev_sop_hash.as_str()
    };
    let state_hash = compute_pweh_lineage(prev, &req.step_deltas).map_err(|e| {
        vec![Violation {
            field: "state_hash".into(),
            expected: "32-byte hex prev_sop_hash".into(),
            actual: e,
        }]
    })?;

    let compile_op = Operation {
        op_type: "sequence.compile".into(),
        target: req.sop_id.clone(),
    };
    let mut ops = req.step_deltas.clone();
    ops.push(compile_op);

    Ok(seal_envelope(
        &validator,
        "sequence.compile",
        &format!("founder-os/sop/{}", req.sop_id),
        &req.actor_id,
        prev,
        state_hash,
        &ops,
        None,
    ))
}

/// Lead processing with fail-closed PII boundary enforcement.
pub fn execute_lead_process(req: LeadProcessRequest) -> Result<SealedEnvelope, Vec<Violation>> {
    let validator = PolicyValidator::new();

    let violations = validator.validate_lead(&req.lead_fields, &req.allowed_fields);
    if !violations.is_empty() {
        return Err(violations);
    }

    // Canonicalize before hashing: sort fields by name so digest is
    // insensitive to JSON key ordering.
    let mut canonical = req.lead_fields.clone();
    canonical.sort_by(|a, b| a.field.cmp(&b.field));
    let mut allowed = req.allowed_fields.clone();
    allowed.sort_unstable();
    let digest_bytes = bcs::to_bytes(&(canonical, allowed)).expect("BCS serialization failed");
    let state_hash = crate::poseidon::poseidon_hash_hex(&digest_bytes);

    let crm_op = Operation {
        op_type: "crm.update".into(),
        target: "lead:hydrated".into(),
    };

    Ok(seal_envelope(
        &validator,
        "lead.process",
        "founder-os/leads/hydration",
        &req.actor_id,
        &req.context_hash,
        state_hash,
        std::slice::from_ref(&crm_op),
        None,
    ))
}

/// Community Proof-of-Practice certification (MSC issuance precondition).
pub fn execute_proof_of_practice(
    req: ProofOfPracticeRequest,
) -> Result<SealedEnvelope, Vec<Violation>> {
    let validator = PolicyValidator::new();

    let violations = validator.validate_proof_action(&req.action_type);
    if !violations.is_empty() {
        return Err(violations);
    }

    let digest_bytes =
        bcs::to_bytes(&(req.member_id.as_str(), req.evidence_hash.as_str(), req.action_type.as_str()))
            .expect("BCS serialization failed");
    let state_hash = crate::poseidon::poseidon_hash_hex(&digest_bytes);

    let pop_op = Operation {
        op_type: "proof_of_practice.issue".into(),
        target: req.member_id.clone(),
    };

    Ok(seal_envelope(
        &validator,
        "proof_of_practice.issue",
        &format!("founder-os/community/{}", req.member_id),
        &req.actor_id,
        GENESIS_STATE_HASH,
        state_hash,
        std::slice::from_ref(&pop_op),
        None,
    ))
}

/// Client delivery receipt export (zero-data-leakage audit artifact).
///
/// The envelope's zero-knowledge anchor is intentionally `None` until the
/// mtpi-certifier Groth16/Plonk-over-BN254 pipeline produces a verifiable
/// proof. The server never fabricates a proof certificate — see
/// [`SealedEnvelope::envelope.zero_knowledge_verified`].
pub fn execute_client_receipt_export(
    req: ClientReceiptRequest,
) -> Result<SealedEnvelope, Vec<Violation>> {
    let validator = PolicyValidator::new();

    if req.policy_bundle.is_empty() {
        return Err(vec![Violation {
            field: "policy_bundle".into(),
            expected: "non-empty client policy bundle".into(),
            actual: "cannot certify a delivery under an empty policy bundle".into(),
        }]);
    }

    let mut bundle = req.policy_bundle.clone();
    bundle.sort_unstable();
    bundle.dedup();
    let digest_bytes =
        bcs::to_bytes(&(req.client_id.as_str(), req.payload_hash.as_str(), bundle))
            .expect("BCS serialization failed");
    let state_hash = crate::poseidon::poseidon_hash_hex(&digest_bytes);

    let export_op = Operation {
        op_type: "client.receipt.export".into(),
        target: req.client_id.clone(),
    };

    Ok(seal_envelope(
        &validator,
        "client.receipt.export",
        &format!("founder-os/clients/{}", req.client_id),
        &req.actor_id,
        GENESIS_STATE_HASH,
        state_hash,
        std::slice::from_ref(&export_op),
        None,
    ))
}