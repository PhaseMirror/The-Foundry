use founder_os_sovereign_mcp::poseidon::{poseidon_hash_bytes, poseidon_hash_hex};
use founder_os_sovereign_mcp::pweh::compute_pweh_lineage;
use founder_os_sovereign_mcp::policy::PolicyValidator;
use founder_os_sovereign_mcp::tools::{execute_certified_workflow, execute_content_certify, ContentRequest, WorkflowRequest, Operation};

fn valid_workflow() -> WorkflowRequest {
    WorkflowRequest {
        workflow_id: "founder-os/email-sequence/lead-nurture".into(),
        context_hash: "0xabc123".into(),
        proposed_ops: vec![
            Operation { op_type: "crm.update".into(), target: "field:last_touch".into() },
            Operation { op_type: "email.send".into(), target: "segment:active-trial".into() },
        ],
    }
}

#[test]
fn workflow_accepts_certified_sequence() {
    let result = execute_certified_workflow(valid_workflow());
    assert!(result.is_ok(), "certified sequence must be accepted");
}

#[test]
fn workflow_rejects_email_without_prior_crm_update() {
    let req = WorkflowRequest {
        workflow_id: "founder-os/email-sequence/lead-nurture".into(),
        context_hash: "0xabc123".into(),
        proposed_ops: vec![
            Operation { op_type: "email.send".into(), target: "segment:active-trial".into() },
        ],
    };
    let result = execute_certified_workflow(req);
    let violations = result.unwrap_err();
    assert!(
        violations.iter().any(|v| v.field == "funnel_reachability"),
        "expected funnel_reachability violation, got: {violations:?}"
    );
}

#[test]
fn workflow_rejects_unknown_op_type() {
    let req = WorkflowRequest {
        workflow_id: "founder-os/funnel/unknown".into(),
        context_hash: "0xabc123".into(),
        proposed_ops: vec![
            Operation { op_type: "skynet.begin".into(), target: "".to_string() },
        ],
    };
    let result = execute_certified_workflow(req);
    assert!(result.is_err());
}

#[test]
fn content_certify_rejects_banned_phrase() {
    let req = ContentRequest {
        asset_type: "social_post".into(),
        draft: "This course offers guaranteed profit in 30 days".into(),
        target_segment: "founders".into(),
    };
    let result = execute_content_certify(req);
    let violations = result.unwrap_err();
    assert!(
        violations.iter().any(|v| v.field == "brand_invariant"),
        "expected brand_invariant violation, got: {violations:?}"
    );
}

#[test]
fn pweh_lineage_is_order_sensitive() {
    let op_a = Operation { op_type: "crm.update".into(), target: "field:last_touch".into() };
    let op_b = Operation { op_type: "email.send".into(), target: "segment:active-trial".into() };
    let ctx = "0x32defc8bdb57dc5aa75e";

    let hash_ab = compute_pweh_lineage(ctx, &[op_a.clone(), op_b.clone()]);
    let hash_ba = compute_pweh_lineage(ctx, &[op_b, op_a]);
    assert_ne!(hash_ab, hash_ba, "operation order must change the lineage hash");
}

#[test]
fn poseidon_hash_is_deterministic() {
    let h1 = poseidon_hash_hex(b"founder-os");
    let h2 = poseidon_hash_hex(b"founder-os");
    assert_eq!(h1, h2);
    assert!(h1.starts_with("0x"));
    assert_eq!(poseidon_hash_bytes(b"founder-os").len(), 32);
}

#[test]
fn poseidon_hash_sensitive_to_input() {
    assert_ne!(poseidon_hash_hex(b"brand"), poseidon_hash_hex(b"brand1"));
}

#[test]
fn policy_funnel_rule_property() {
    let validator = PolicyValidator::new();
    let ctx = "0x0";
    let empty: Vec<Operation> = Vec::new();
    assert!(validator.validate_operations(&empty, ctx).is_empty());

    let single_crm = vec![Operation { op_type: "crm.update".into(), target: "f:x".into() }];
    assert!(validator.validate_operations(&single_crm, ctx).is_empty());

    let single_email = vec![Operation { op_type: "email.send".into(), target: "s:y".into() }];
    assert!(!validator.validate_operations(&single_email, ctx).is_empty());
}