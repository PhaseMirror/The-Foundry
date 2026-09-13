use founder_os_sovereign_mcp::envelope::{CrmfEnvelope, SealSpec, GENESIS_STATE_HASH};
use founder_os_sovereign_mcp::eventlog::EventLog;
use founder_os_sovereign_mcp::tools::{
    execute_client_receipt_export, execute_lead_process, execute_proof_of_practice,
    execute_sequence_compile, ClientReceiptRequest, LeadField, LeadProcessRequest,
    Operation, ProofOfPracticeRequest, SequenceCompileRequest,
};
use std::time::{SystemTime, UNIX_EPOCH};

const CTX: &str = "0xabababababababababababababababababababababababababababababababab";

#[test]
fn sequence_compile_binds_lineage() {
    let prev = GENESIS_STATE_HASH;
    let req = SequenceCompileRequest {
        sop_id: "founder-os/curriculum/email-101".into(),
        prev_sop_hash: prev.into(),
        actor_id: "test".into(),
        step_deltas: vec![
            Operation { op_type: "crm.update".into(), target: "lesson:1".into() },
            Operation { op_type: "email.send".into(), target: "lesson:1-followup".into() },
        ],
    };
    let seal = execute_sequence_compile(req.clone()).unwrap();
    assert_eq!(seal.envelope.tool, "sequence.compile");
    assert_eq!(seal.envelope.prev_state_hash, prev);
    assert!(seal.envelope.verify_bcs_digest());

    // Re-running the same delta set against the same anchor is deterministic.
    let again = execute_sequence_compile(req).unwrap();
    assert_eq!(seal.envelope_hash, again.envelope_hash);
}

#[test]
fn sequence_compile_rejects_bad_sop_hash() {
    let req = SequenceCompileRequest {
        sop_id: "founder-os/curriculum/email-101".into(),
        prev_sop_hash: "0xshort".into(),
        actor_id: "test".into(),
        step_deltas: vec![Operation { op_type: "crm.update".into(), target: "lesson:1".into() }],
    };
    let violations = execute_sequence_compile(req).unwrap_err();
    assert!(violations.iter().any(|v| v.field == "state_hash"));
}

#[test]
fn lead_processing_enforces_pii_boundary() {
    let ok = LeadProcessRequest {
        context_hash: CTX.into(),
        actor_id: "test".into(),
        lead_fields: vec![
            LeadField { field: "first_name".into(), value: "Ada".into() },
            LeadField { field: "company".into(), value: "Analytical Engines".into() },
        ],
        allowed_fields: vec!["first_name".into(), "company".into()],
    };
    let seal = execute_lead_process(ok).unwrap();
    assert_eq!(seal.envelope.tool, "lead.process");
    assert!(seal.envelope.verify_bcs_digest());

    let pii = LeadProcessRequest {
        context_hash: CTX.into(),
        actor_id: "test".into(),
        lead_fields: vec![LeadField { field: "email".into(), value: "ada@analytical.dev".into() }],
        allowed_fields: vec!["email".into()],
    };
    let violations = execute_lead_process(pii).unwrap_err();
    assert!(
        violations.iter().any(|v| v.field == "pii_field_blacklist" || v.field == "pii_value_fingerprint"),
        "got: {violations:?}"
    );

    let unauthorized = LeadProcessRequest {
        context_hash: CTX.into(),
        actor_id: "test".into(),
        lead_fields: vec![LeadField { field: "salary".into(), value: "250000".into() }],
        allowed_fields: vec!["first_name".into()],
    };
    let violations = execute_lead_process(unauthorized).unwrap_err();
    assert!(violations.iter().any(|v| v.field == "pii_boundary"));
}

#[test]
fn proof_of_practice_requires_certified_action() {
    let ok = ProofOfPracticeRequest {
        member_id: "member_01".into(),
        evidence_hash: "0xabc".into(),
        action_type: "resolve_bottleneck".into(),
        actor_id: "test".into(),
    };
    let seal = execute_proof_of_practice(ok).unwrap();
    assert_eq!(seal.envelope.tool, "proof_of_practice.issue");
    assert_eq!(
        seal.envelope.side_effect_permissions,
        vec!["proof_of_practice.issue:allowed"]
    );

    let bad = ProofOfPracticeRequest {
        member_id: "member_01".into(),
        evidence_hash: "0xabc".into(),
        action_type: "vanity_like".into(),
        actor_id: "test".into(),
    };
    let violations = execute_proof_of_practice(bad).unwrap_err();
    assert!(violations.iter().any(|v| v.field == "proof_action"));
}

#[test]
fn client_receipt_requires_policy_bundle_and_reserves_zk() {
    let req = ClientReceiptRequest {
        client_id: "acme-corp".into(),
        payload_hash: "0xpayload".into(),
        policy_bundle: vec!["data-egress:allowlist".into(), "pii:mask-any".into()],
        actor_id: "test".into(),
    };
    let seal = execute_client_receipt_export(req).unwrap();
    assert_eq!(seal.envelope.tool, "client.receipt.export");
    assert_eq!(seal.envelope.side_effect_permissions, vec!["client.receipt.export:allowed"]);
    // Honest contract: no zero-knowledge certificate is fabricated.
    assert!(!seal.envelope.zero_knowledge_verified());

    let empty = ClientReceiptRequest {
        client_id: "acme-corp".into(),
        payload_hash: "0xpayload".into(),
        policy_bundle: vec![],
        actor_id: "test".into(),
    };
    let violations = execute_client_receipt_export(empty).unwrap_err();
    assert!(violations.iter().any(|v| v.field == "policy_bundle"));
}

#[test]
fn ucc_gate_halts_oversized_batches() {
    let req = SequenceCompileRequest {
        sop_id: "founder-os/sop/toobig".into(),
        prev_sop_hash: GENESIS_STATE_HASH.into(),
        actor_id: "test".into(),
        step_deltas: (0..12)
            .map(|i| Operation {
                op_type: "crm.update".into(),
                target: format!("field:{i}"),
            })
            .collect(),
    };
    let violations = execute_sequence_compile(req).unwrap_err();
    assert!(
        violations.iter().any(|v| v.field == "lip_bound"),
        "expected SIG_GOV_KILL contractivity halt, got: {violations:?}"
    );
}

#[test]
fn event_log_integration_chain() {
    let dir = std::env::temp_dir().join(format!("foe_tools_{}", now()));
    let mut log = EventLog::open(&dir).unwrap();

    let seq = SequenceCompileRequest {
        sop_id: "founder-os/sop/one".into(),
        prev_sop_hash: GENESIS_STATE_HASH.into(),
        actor_id: "test".into(),
        step_deltas: vec![Operation { op_type: "crm.update".into(), target: "f:1".into() }],
    };
    let s1 = execute_sequence_compile(seq.clone()).unwrap();
    assert_eq!(log.append(&s1.envelope).unwrap(), 1);

    // Chain the second compile onto the first envelope's state hash.
    let s2 = execute_sequence_compile(SequenceCompileRequest {
        prev_sop_hash: s1.envelope.state_hash.clone(),
        ..seq
    })
    .unwrap();
    assert_eq!(log.append(&s2.envelope).unwrap(), 2);

    let verdict = log.verify_chain().unwrap();
    assert!(verdict.is_clean(), "{:?}", verdict.tamper_evidence);
    assert_eq!(verdict.entries, 2);
    std::fs::remove_dir_all(&dir).ok();
}

#[test]
fn envelope_detects_field_mutation() {
    let env = CrmfEnvelope::seal(SealSpec {
        tool: "workflow.run".into(),
        workflow_id: "founder-os/t".into(),
        actor_id: "alice".into(),
        prev_state_hash: GENESIS_STATE_HASH.into(),
        state_hash: CTX.into(),
        policy_hash: "0xppp".into(),
        side_effect_permissions: vec!["email.send:allowed".into()],
        zk_anchor: None,
    });
    assert!(env.verify_bcs_digest());
    assert!(env.verify_genesis());

    let mut mutated = env.clone();
    mutated.actor_id = "mallory".into();
    assert!(!mutated.verify_bcs_digest());
}

fn now() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos() as u64
}