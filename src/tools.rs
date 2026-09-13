use crate::pweh::compute_pweh_lineage;
use crate::policy::PolicyValidator;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct WorkflowRequest {
    pub workflow_id: String,
    pub context_hash: String,
    pub proposed_ops: Vec<Operation>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Operation {
    pub op_type: String,
    pub target: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ContentRequest {
    pub asset_type: String,
    pub draft: String,
    pub target_segment: String,
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

#[derive(Debug)]
pub struct SealedEnvelope {
    pub receipt_id: String,
    pub envelope_hash: String,
}

pub fn execute_certified_workflow(req: WorkflowRequest) -> Result<SealedEnvelope, Vec<Violation>> {
    let validator = PolicyValidator::new();
    let violations = validator.validate_operations(&req.proposed_ops, &req.context_hash);
    if !violations.is_empty() {
        return Err(violations);
    }

    let pweh_hash = compute_pweh_lineage(&req.context_hash, &req.proposed_ops);

    Ok(SealedEnvelope {
        receipt_id: format!("crmf_{}", &pweh_hash[..14]),
        envelope_hash: pweh_hash,
    })
}

pub fn execute_content_certify(req: ContentRequest) -> Result<SealedEnvelope, Vec<Violation>> {
    let validator = PolicyValidator::new();
    let violations = validator.validate_content(&req.draft);
    if !violations.is_empty() {
        return Err(violations);
    }

    let payload = format!("{}|{}|{}", req.asset_type, req.draft, req.target_segment);
    let envelope_hash = crate::poseidon::poseidon_hash_hex(payload.as_bytes());

    Ok(SealedEnvelope {
        receipt_id: format!("crmf_{}", &envelope_hash[..14]),
        envelope_hash,
    })
}
