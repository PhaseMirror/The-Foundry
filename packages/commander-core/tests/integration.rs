use multiplicity_commander_core::CommanderCore;
use multiplicity_sigma::{Workflow, Task};
use multiplicity_alp::policy::TrustLevel;
use multiplicity_common::types::UnifiedWitness;
use tempfile::tempdir;

fn setup_temp_repo() -> tempfile::TempDir {
    let dir = tempdir().unwrap();
    std::process::Command::new("git")
        .arg("init")
        .current_dir(dir.path())
        .output()
        .unwrap();

    let policy_dir = dir.path().join("policy").join("compliance");
    std::fs::create_dir_all(&policy_dir).unwrap();
    std::fs::write(policy_dir.join("soc2-hipaa-map.yaml"), "frameworks: []").unwrap();

    dir
}

#[tokio::test]
async fn test_run_workflow_happy_path_with_consensus() {
    let dir = setup_temp_repo();
    let commander = CommanderCore::new(dir.path());

    let task = Task {
        id: "task-1".to_string(),
        action: "echo 'Deploying'".to_string(),
        server_binding: None,
        tool_name: None,
    };

    let workflow = Workflow {
        name: "test-workflow".to_string(),
        tasks: vec![task],
        trust: Some(TrustLevel::Internal),
        consensus_proof: Some(hex::encode([0xCA, 0xFE, 0xBA, 0xBE])),
        threshold_met: Some(true),
    };

    let result = commander.run_workflow(workflow).await;
    assert!(result.is_ok(), "Workflow should succeed with valid consensus proof");

    let witness = result.unwrap();
    assert_eq!(witness.veto_status, "admitted");
    assert_eq!(witness.threshold_met, Some(true));
}

#[tokio::test]
async fn test_run_workflow_missing_proof_fails_consensus() {
    let dir = setup_temp_repo();
    let commander = CommanderCore::new(dir.path());

    let task = Task {
        id: "task-1".to_string(),
        action: "echo 'Deploying'".to_string(),
        server_binding: None,
        tool_name: None,
    };

    let workflow = Workflow {
        name: "test-workflow-no-proof".to_string(),
        tasks: vec![task],
        trust: Some(TrustLevel::Internal),
        consensus_proof: None,
        threshold_met: None,
    };

    let result = commander.run_workflow(workflow).await;
    assert!(result.is_err(), "Workflow should be rejected due to missing proof");
    
    let err_str = result.unwrap_err().to_string();
    assert!(err_str.contains("Missing consensus proof"));
}

#[tokio::test]
async fn test_run_workflow_invalid_proof_fails_consensus() {
    let dir = setup_temp_repo();
    let commander = CommanderCore::new(dir.path());

    let task = Task {
        id: "task-1".to_string(),
        action: "echo 'Deploying'".to_string(),
        server_binding: None,
        tool_name: None,
    };

    let workflow = Workflow {
        name: "test-workflow-bad-proof".to_string(),
        tasks: vec![task],
        trust: Some(TrustLevel::Internal),
        consensus_proof: Some(hex::encode([0xDE, 0xAD, 0xBE, 0xEF])),
        threshold_met: Some(true),
    };

    let result = commander.run_workflow(workflow).await;
    assert!(result.is_err(), "Workflow should be rejected due to invalid proof bytes");
    
    let err_str = result.unwrap_err().to_string();
    assert!(err_str.contains("Invalid STARK"));
}

#[tokio::test]
async fn test_run_workflow_threshold_not_met_fails() {
    let dir = setup_temp_repo();
    let commander = CommanderCore::new(dir.path());

    let task = Task {
        id: "task-1".to_string(),
        action: "echo 'Deploying'".to_string(),
        server_binding: None,
        tool_name: None,
    };

    let workflow = Workflow {
        name: "test-workflow-low-threshold".to_string(),
        tasks: vec![task],
        trust: Some(TrustLevel::Internal),
        consensus_proof: Some(hex::encode([0xCA, 0xFE, 0xBA, 0xBE])), // valid proof but low threshold
        threshold_met: Some(false),
    };

    let result = commander.run_workflow(workflow).await;
    assert!(result.is_err(), "Workflow should be rejected because threshold was not met");
    
    let err_str = result.unwrap_err().to_string();
    assert!(err_str.contains("Required threshold"));
}
