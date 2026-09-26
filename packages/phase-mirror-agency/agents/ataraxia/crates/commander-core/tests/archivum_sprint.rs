use multiplicity_commander_core::CommanderCore;
use multiplicity_common::types::UnifiedWitness;
use tempfile::tempdir;

#[tokio::test]
async fn test_archivum_prime_anchoring() {
    let dir = tempdir().unwrap();
    // Initialize git repo in temp dir for Archivum git commits
    std::process::Command::new("git")
        .arg("init")
        .current_dir(dir.path())
        .output()
        .unwrap();

    let mut core = CommanderCore::new(dir.path());
    
    // 1. Verify namespaces are registered
    assert!(core.archivum.resolve(1000, "ahgi.consent").is_err()); // Not assigned yet

    // 2. Anchor a record
    let proof = core.archivum.anchor("record-001", "ahgi.consent", "hash-abc").unwrap();
    assert_eq!(proof.prime_index, 1000);
    assert_eq!(proof.namespace, "ahgi.consent");
    assert!(proof.verify());

    // 3. Resolve the prime
    let resolved_id = core.archivum.resolve(1000, "ahgi.consent").unwrap();
    assert_eq!(resolved_id, "record-001");

    // 4. Test auto-anchoring in write_witness
    let witness = UnifiedWitness {
        witness_id: "wit-001".to_string(),
        action_id: "ahgi.inference".to_string(),
        timestamp: "2026-05-26T00:00:00Z".to_string(),
        compliance_evidence: "passed".to_string(),
        execution_receipt: serde_json::json!({}),
        contractivity_score: 1.0,
        veto_status: "admitted".to_string(),
    };

    core.archivum.write_witness(&witness).unwrap();
    
    // Check that it consumed a prime from ahgi.agent_action (starts at 4000)
    let resolved_wit = core.archivum.resolve(4000, "ahgi.agent_action").unwrap();
    assert_eq!(resolved_wit, "wit-001");
}
