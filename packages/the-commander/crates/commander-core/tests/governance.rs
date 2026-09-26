use multiplicity_commander_core::CommanderCore;
use multiplicity_sigma::Workflow;
use std::fs;
use std::path::PathBuf;

#[tokio::test]
async fn test_workflow_witness_generation() {
    // Setup a temporary repo-like structure or use current
    let repo_root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).parent().unwrap().parent().unwrap().to_path_buf();
    let core = CommanderCore::new(&repo_root);
    
    let workflow = Workflow {
        name: "ci-gated-test-workflow".to_string(),
        tasks: vec![
            multiplicity_sigma::Task {
                id: "ci-test-task".to_string(),
                action: "echo 'CI verification'".to_string(),
                server_binding: None,
                tool_name: None,
            }
        ],
        trust: Some(multiplicity_alp::policy::TrustLevel::Internal),
    };
    
    // 1. Run the workflow
    let result = core.run_workflow(workflow).await;
    assert!(result.is_ok(), "Workflow should run successfully: {:?}", result.err());
    
    // 2. Verify witness exists in state/archivum/witnesses.jsonl
    let witness_path = repo_root.join("state").join("archivum").join("witnesses.jsonl");
    assert!(witness_path.exists(), "witnesses.jsonl should exist at {:?}", witness_path);
    
    // 3. Assert that the witness contains the correct action_id
    let content = fs::read_to_string(&witness_path).expect("Failed to read witnesses.jsonl");
    assert!(content.contains("ci-gated-test-workflow"), "witnesses.jsonl should contain 'ci-gated-test-workflow'");
    
    // 4. Validate schema (basic check)
    let last_line = content.lines().last().unwrap();
    let witness: serde_json::Value = serde_json::from_str(last_line).expect("Witness should be valid JSON");
    assert_eq!(witness["action_id"], "ci-gated-test-workflow");
    assert_eq!(witness["veto_status"], "admitted");
}

#[tokio::test]
async fn test_external_workflow_sandboxing() {
    let repo_root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).parent().unwrap().parent().unwrap().to_path_buf();
    let core = CommanderCore::new(&repo_root);
    
    // 1. Define an external workflow that attempts to read an env var
    let workflow = multiplicity_sigma::Workflow {
        name: "external-sandbox-test".to_string(),
        tasks: vec![
            multiplicity_sigma::Task {
                id: "sandbox-check".to_string(),
                // This command should return 0 if GITHUB_TOKEN is NOT set (sandboxed)
                action: "if [ -z \"$GITHUB_TOKEN\" ]; then exit 0; else exit 1; fi".to_string(),
                server_binding: None,
                tool_name: None,
            }
        ],
        trust: Some(multiplicity_alp::policy::TrustLevel::External),
    };
    
    // Set a dummy GITHUB_TOKEN in parent env to ensure it's cleared in sandbox
    std::env::set_var("GITHUB_TOKEN", "should-be-hidden");
    
    let result = core.run_workflow(workflow).await;
    match &result {
        Err(e) => eprintln!("Workflow error: {:?}", e),
        Ok(_) => {}
    };
    assert!(result.is_ok(), "External workflow should run successfully in sandbox");
    
    let witness = result.unwrap();
    assert_eq!(witness.veto_status, "admitted");
    
    // 2. Verify that the task actually finished successfully (exit 0)
    let task_res = &witness.execution_receipt["tasks"][0];
    assert_eq!(task_res["exit_code"], 0, "Env var should have been cleared in sandbox");
}

#[tokio::test]
async fn test_external_workflow_mcp_blocking() {
    let repo_root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).parent().unwrap().parent().unwrap().to_path_buf();
    let core = CommanderCore::new(&repo_root);
    
    // Define an external workflow that attempts to call an MCP tool (mutating by default)
    let workflow = multiplicity_sigma::Workflow {
        name: "external-mcp-block-test".to_string(),
        tasks: vec![
            multiplicity_sigma::Task {
                id: "mcp-attempt".to_string(),
                action: "{}".to_string(),
                server_binding: Some("multiplicity-mcp-rust".to_string()),
                tool_name: Some("test_tool".to_string()),
            }
        ],
        trust: Some(multiplicity_alp::policy::TrustLevel::External),
    };
    
    let result = core.run_workflow(workflow).await;
    
    // The workflow should be blocked by ALP policy and return an error
    assert!(result.is_err(), "Workflow should be blocked by policy");
    let err_str = result.err().unwrap().to_string();
    assert!(err_str.contains("blocked by policy"), "Error should mention policy blockage");
    assert!(err_str.contains("Trust Level Violation"), "Error should mention Trust Level Violation");
}

#[test]
fn test_compose_external_blocked_from_governed_server() {
    let yaml = r#"
name: bad-external
version: "1.0"
trust: external
server_binding: multiplicity-mcp-rust  # must be rejected
steps:
  - id: probe
    tool: list_tools
    args: {}
"#;
    let tmp_dir = tempfile::tempdir().unwrap();
    let file_path = tmp_dir.path().join("bad-external.sigma.yaml");
    std::fs::write(&file_path, yaml).unwrap();
    
    let result = mirror_dissonance::compose::compile(&file_path);
    assert!(result.is_err(), "external workflow on governed server must fail validation");
    let err_msg = result.unwrap_err().to_string();
    assert!(err_msg.contains("server_binding=sandbox"), "Error should mention server_binding=sandbox requirement: {}", err_msg);
}

#[test]
fn test_external_witness_replication_rejection() {
    use multiplicity_common::replication::ReplicationConfig;
    use multiplicity_common::types::TrustLevel;
    
    let config = ReplicationConfig::default();
    
    // In Option X, only Internal-trust witnesses replicate.
    assert!(config.replicate_trust_levels.contains(&TrustLevel::Internal));
    assert!(!config.replicate_trust_levels.contains(&TrustLevel::External), "External witnesses must not be in replication allowlist");
    
    // Simulate a check that would run on a Replica before pushing
    let external_witness_trust = TrustLevel::External;
    let should_replicate = config.replicate_trust_levels.contains(&external_witness_trust);
    
    assert!(!should_replicate, "Replica must not attempt to replicate External-trust witness");
}

#[test]
fn test_compose_validate_valid_workflow() {
    let yaml = r#"
name: audit-scan
version: "1.0"
trust: internal
server_binding: multiplicity-mcp-rust
steps:
  - id: list-issues
    tool: list_issues
    args:
      owner: "MultiplicityFoundation"
      repo: "the-commander"
"#;
    let tmp_dir = tempfile::tempdir().unwrap();
    let file_path = tmp_dir.path().join("valid-workflow.sigma.yaml");
    std::fs::write(&file_path, yaml).unwrap();
    
    let result = mirror_dissonance::compose::compile(&file_path);
    assert!(result.is_ok(), "valid workflow should compile: {:?}", result.err());
    let workflow = result.unwrap();
    assert_eq!(workflow.name, "audit-scan");
    assert_eq!(workflow.tasks.len(), 1);
}

#[test]
fn test_compose_compile_output() {
    let yaml = r#"
name: test-compile
version: "1.0"
trust: internal
server_binding: sandbox
steps:
  - id: step1
    tool: echo
    args:
      message: "hello"
"#;
    let tmp_dir = tempfile::tempdir().unwrap();
    let file_path = tmp_dir.path().join("test-compile.sigma.yaml");
    std::fs::write(&file_path, yaml).unwrap();
    
    let result = mirror_dissonance::compose::compile(&file_path);
    assert!(result.is_ok(), "workflow should compile: {:?}", result.err());
    let workflow = result.unwrap();
    assert_eq!(workflow.name, "test-compile");
    assert_eq!(workflow.tasks[0].id, "step1");
    assert_eq!(workflow.tasks[0].action, "echo");
}
