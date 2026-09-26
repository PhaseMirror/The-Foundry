use founder_os_sovereign_mcp::envelope::GENESIS_STATE_HASH;
use founder_os_sovereign_mcp::poseidon::{poseidon_hash_bytes, poseidon_hash_hex};
use founder_os_sovereign_mcp::policy::PolicyValidator;
use founder_os_sovereign_mcp::pweh::compute_pweh_lineage;
use founder_os_sovereign_mcp::tools::{
    execute_certified_workflow, execute_content_certify, ContentRequest, Operation,
    WorkflowRequest,
};

fn valid_workflow() -> WorkflowRequest {
    WorkflowRequest {
        workflow_id: "founder-os/email-sequence/lead-nurture".into(),
        context_hash: GENESIS_STATE_HASH.into(),
        actor_id: "test".into(),
        proposed_ops: vec![
            Operation {
                op_type: "crm.update".into(),
                target: "field:last_touch".into(),
            },
            Operation {
                op_type: "email.send".into(),
                target: "segment:active-trial".into(),
            },
        ],
    }
}

#[test]
fn workflow_accepts_certified_sequence() {
    let result = execute_certified_workflow(valid_workflow());
    let seal = result.expect("certified sequence must be accepted");
    assert_eq!(seal.envelope.tool, "workflow.run");
    assert_eq!(seal.envelope.side_effect_permissions, vec!["crm.update:allowed", "email.send:allowed"]);
    assert!(seal.envelope.verify_bcs_digest());
    assert!(!seal.envelope.zero_knowledge_verified());
}

#[test]
fn workflow_rejects_email_without_prior_crm_update() {
    let req = WorkflowRequest {
        workflow_id: "founder-os/email-sequence/lead-nurture".into(),
        context_hash: GENESIS_STATE_HASH.into(),
        actor_id: "test".into(),
        proposed_ops: vec![Operation {
            op_type: "email.send".into(),
            target: "segment:active-trial".into(),
        }],
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
        context_hash: GENESIS_STATE_HASH.into(),
        actor_id: "test".into(),
        proposed_ops: vec![Operation {
            op_type: "skynet.begin".into(),
            target: "".to_string(),
        }],
    };
    let result = execute_certified_workflow(req);
    assert!(result.is_err());
}

#[test]
fn workflow_is_tamper_evident() {
    let seal = valid_workflow();
    let s1 = execute_certified_workflow(seal.clone()).unwrap();
    let s2 = execute_certified_workflow(seal).unwrap();
    assert_eq!(s1.envelope_hash, s2.envelope_hash, "deterministic lineage expected");
    assert!(s1.envelope.verify_bcs_digest());
    assert!(s1.envelope.verify_genesis());
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
fn content_certify_is_deterministic() {
    let req = ContentRequest {
        asset_type: "social_post".into(),
        draft: "Build leverage with proven systems".into(),
        target_segment: "founders".into(),
    };
    let s1 = execute_content_certify(req.clone()).unwrap();
    let s2 = execute_content_certify(req).unwrap();
    assert_eq!(s1.envelope_hash, s2.envelope_hash);
    assert_eq!(s1.envelope.tool, "content.certify");
}

#[test]
fn pweh_lineage_is_order_sensitive() {
    let op_a = Operation {
        op_type: "crm.update".into(),
        target: "field:last_touch".into(),
    };
    let op_b = Operation {
        op_type: "email.send".into(),
        target: "segment:active-trial".into(),
    };
    let ctx = "0xabababababababababababababababababababababababababababababababab";

    let hash_ab = compute_pweh_lineage(ctx, &[op_a.clone(), op_b.clone()]).unwrap();
    let hash_ba = compute_pweh_lineage(ctx, &[op_b, op_a]).unwrap();
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
    let ctx = GENESIS_STATE_HASH;
    let empty: Vec<Operation> = Vec::new();
    assert!(validator.validate_operations(&empty, ctx).is_empty());

    let single_crm = vec![Operation {
        op_type: "crm.update".into(),
        target: "f:x".into(),
    }];
    assert!(validator.validate_operations(&single_crm, ctx).is_empty());

    let single_email = vec![Operation {
        op_type: "email.send".into(),
        target: "s:y".into(),
    }];
    assert!(!validator.validate_operations(&single_email, ctx).is_empty());
}

#[test]
fn policy_hash_is_stable_across_instances() {
    let a = PolicyValidator::new();
    let b = PolicyValidator::new();
    assert_eq!(a.policy_hash(), b.policy_hash());
    assert_eq!(a.canonical_policy_bytes(), b.canonical_policy_bytes());
    assert!(a.policy_hash().starts_with("0x"));
}