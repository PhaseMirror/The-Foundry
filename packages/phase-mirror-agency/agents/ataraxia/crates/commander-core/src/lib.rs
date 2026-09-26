pub mod workflows;
pub mod mcp_client;
pub mod archivum;
pub mod sat;
pub mod sync;
pub mod events;

use std::path::{Path, PathBuf};
use std::process::Command;
use anyhow::{Result, anyhow, Context};
use multiplicity_common::{GitLedger, ConstitutionModel};
use multiplicity_common::types::McpRegistry;
use multiplicity_sigma::{SigmaKernel, Workflow};
use crate::archivum::ArchivumStore;
use crate::events::EventBus;

pub struct CommanderCore {
    pub repo_path: PathBuf,
    pub ledger: GitLedger,
    pub sigma: SigmaKernel,
    pub archivum: ArchivumStore,
    pub events: EventBus,
}

impl CommanderCore {
    pub fn new<P: AsRef<Path>>(repo_path: P) -> Self {
        let repo_path = repo_path.as_ref().to_path_buf();
        let ledger = GitLedger::new(&repo_path);
        let sigma = SigmaKernel::new(GitLedger::new(&repo_path));
        let events = EventBus::new();
        let mut archivum = ArchivumStore::new(GitLedger::new(&repo_path), events.sender());
        
        // Register AHGI namespaces with Phase 1 prime blocks (ADR-AHGI-001)
        archivum.register_namespace("ahgi.consent", (1000..1500).map(|i| i as u64).collect());
        archivum.register_namespace("ahgi.model_version", (2000..2500).map(|i| i as u64).collect());
        archivum.register_namespace("ahgi.clinical_auth", (3000..3500).map(|i| i as u64).collect());
        archivum.register_namespace("ahgi.agent_action", (4000..4500).map(|i| i as u64).collect());

        Self {
            repo_path,
            ledger,
            sigma,
            archivum,
            events,
        }
    }

    pub fn load_mcp_registry(&self) -> Result<McpRegistry> {
        let path = self.repo_path.join("state").join("mcp_registry.yaml");
        if !path.exists() {
            return Ok(McpRegistry { servers: vec![] });
        }
        let content = std::fs::read_to_string(&path)?;
        let registry: McpRegistry = serde_yaml::from_str(&content)?;
        Ok(registry)
    }

    pub fn save_mcp_registry(&self, registry: &McpRegistry) -> Result<()> {
        let path = self.repo_path.join("state").join("mcp_registry.yaml");
        let yaml = serde_yaml::to_string(registry)?;
        std::fs::write(&path, yaml)?;
        Ok(())
    }

    pub fn compute_binary_hash<P: AsRef<Path>>(&self, path: P) -> Result<String> {
        use sha2::{Sha256, Digest};
        use std::io::Read;

        let mut file = std::fs::File::open(path)?;
        let mut hasher = Sha256::new();
        let mut buffer = [0; 8192];
        while let Ok(n) = file.read(&mut buffer) {
            if n == 0 { break; }
            hasher.update(&buffer[..n]);
        }
        Ok(hex::encode(hasher.finalize()))
    }

    pub fn get_sat_issuer(&self) -> Result<crate::sat::SatIssuer> {
        let priv_key_hex = std::env::var("COMMANDER_SAT_PRIVATE_KEY")
            .context("COMMANDER_SAT_PRIVATE_KEY not set")?;
        let priv_key_bytes = hex::decode(priv_key_hex)?;
        let signing_key = ed25519_dalek::SigningKey::from_bytes(
            &priv_key_bytes.try_into().map_err(|_| anyhow!("Invalid private key length"))?
        );
        Ok(crate::sat::SatIssuer::new(signing_key))
    }

    pub fn verify_server_hash(&self, descriptor: &multiplicity_common::types::McpServerDescriptor) -> Result<bool> {
        if descriptor.hash == "none" {
            return Ok(true);
        }
        let full_path = self.repo_path.join(&descriptor.command);
        if !full_path.exists() {
            return Ok(false);
        }
        let current_hash = self.compute_binary_hash(full_path)?;
        Ok(current_hash == descriptor.hash)
    }

    pub fn default_constitution() -> ConstitutionModel {
        let critique_results = (0..10).map(|i| multiplicity_common::constitution::CritiqueResult {
            critique_id: i,
            passed: true,
            reason: Some("Passed check".to_string()),
        }).collect();
        
        let prime_gates = vec![
            multiplicity_common::constitution::PrimeGate {
                action_name: "default-gate".to_string(),
                gate_value: 97, // a prime number
            }
        ];
        
        ConstitutionModel {
            state_norm: 1.0,
            drift_rate: 0.05,
            dynamic_lambda_m: Some(0.1),
            critique_results,
            prime_gates,
            contractivity_score: 0.7,
            kill_switch_active: false,
            rollback_anchor_sha: None,
            proof_anchor: None,
            audit_warnings: vec![],
            active_anchors: vec![],
            consecutive_failures: 0,
        }
    }

    pub fn load_constitution(&self) -> Result<ConstitutionModel> {
        let path = self.repo_path.join("state").join("constitution.json");
        if !path.exists() {
            let default_c = Self::default_constitution();
            let json = serde_json::to_string_pretty(&default_c)?;
            std::fs::create_dir_all(path.parent().unwrap())?;
            std::fs::write(&path, json)?;
            return Ok(default_c);
        }
        let content = std::fs::read_to_string(&path)?;
        let model: ConstitutionModel = serde_json::from_str(&content)?;
        Ok(model)
    }

    pub fn save_constitution(&self, model: &ConstitutionModel) -> Result<()> {
        let path = self.repo_path.join("state").join("constitution.json");
        let json = serde_json::to_string_pretty(model)?;
        std::fs::create_dir_all(path.parent().unwrap())?;
        std::fs::write(&path, json)?;
        Ok(())
    }

    pub async fn run_workflow(&self, workflow: Workflow) -> Result<multiplicity_common::types::UnifiedWitness> {
        tracing::info!("CommanderCore: running workflow: {}", workflow.name);
        
        // 1. Load active constitution
        let constitution = self.load_constitution()?;
        
        // 2. Validate action against ALP policy
        let trust = workflow.trust.as_ref().unwrap_or(&multiplicity_alp::policy::TrustLevel::Internal);
        
        // Find first server binding if any, to report to ALP
        let server_binding = workflow.tasks.iter().find_map(|t| t.server_binding.clone());
        
        let action = multiplicity_alp::Action {
            id: workflow.name.clone(),
            payload: serde_json::to_value(&workflow)?,
            mutating: true,
            server_binding,
        };
        let policy_engine = multiplicity_alp::PolicyEngine::new(constitution.clone(), None);
        let report = policy_engine.validate_action(&action, trust)?;

        // Notify the unified event bus
        self.events.publish(crate::events::UnifiedEvent::PolicyEvaluated {
            action_id: workflow.name.clone(),
            report: report.clone(),
        });

        
        let timestamp = chrono::Utc::now().to_rfc3339();
        let witness_id = format!("wit-{}-{}", workflow.name, chrono::Utc::now().timestamp_nanos_opt().unwrap_or(0));
        
        if !report.allowed {
            let witness = multiplicity_common::types::UnifiedWitness {
                witness_id,
                action_id: workflow.name.clone(),
                timestamp,
                compliance_evidence: report.reason.clone(),
                execution_receipt: serde_json::json!({
                    "status": "vetoed",
                    "reason": report.reason
                }),
                contractivity_score: constitution.contractivity_score,
                veto_status: "vetoed".to_string(),
            };
            self.archivum.write_witness(&witness)?;
            return Err(anyhow!("Workflow execution blocked by policy: {}", report.reason));
        }
        
        // 3. Execute tasks
        let mut task_results = Vec::new();
        let mut workflow_success = true;
        
        for task in &workflow.tasks {
            tracing::info!("Executing task: {} with action: {}", task.id, task.action);
            
            let (exit_code, stdout, stderr) = if let Some(ref server_id) = task.server_binding {
                // 3a. Execute via MCP server binding
                let registry = self.load_mcp_registry()?;
                let server = registry.servers.iter().find(|s| &s.id == server_id)
                    .ok_or_else(|| anyhow!("Server binding '{}' not found in registry", server_id))?;
                
                if !self.verify_server_hash(server)? {
                    return Err(anyhow!("Server '{}' is INSECURE (hash mismatch). Use 'pscmd mcp attest' to verify.", server_id));
                }

                let tool_name = task.tool_name.as_ref()
                    .ok_or_else(|| anyhow!("Task '{}' has server_binding but no tool_name", task.id))?;

                tracing::info!("Routing tool call '{}' to server '{}'", tool_name, server_id);

                // Prepare environment for the child server
                let mut envs = std::collections::HashMap::new();
                envs.insert("MCP_SERVER_ID".to_string(), server_id.clone());
                
                // If ALP is required, issue a SAT and pass the public key
                let mut args_val: serde_json::Value = serde_json::from_str(&task.action).unwrap_or(serde_json::json!({}));
                
                if server.alp_required {
                    let issuer = self.get_sat_issuer()?;
                    let pub_key = hex::encode(issuer.public_key().to_bytes());
                    envs.insert("COMMANDER_SAT_PUBLIC_KEY".to_string(), pub_key);
                    
                    let token = issuer.issue_token(
                        "pscmd-operator".to_string(),
                        server_id.clone(),
                        tool_name.clone(),
                        vec!["execute".to_string()], // Default capability
                        "1.0.0".to_string(),
                        server.sat_ttl_seconds.unwrap_or(5),
                        Some(task.id.clone()),
                    )?;
                    
                    // Inject In-band SAT (ADR-MCP-003)
                    if let Some(obj) = args_val.as_object_mut() {
                        obj.insert("_sat".to_string(), serde_json::to_value(token)?);
                    }
                }

                // Spawn the specific server and call the tool
                let mut client = if server.command == "python3" {
                    crate::mcp_client::McpClient::spawn("python3", &server.args.iter().map(|s| s.as_str()).collect::<Vec<_>>(), &envs).await?
                } else {
                    crate::mcp_client::McpClient::spawn(&server.command, &server.args.iter().map(|s| s.as_str()).collect::<Vec<_>>(), &envs).await?
                };

                match client.call_tool(tool_name, args_val).await {
                    Ok(res) => (0, serde_json::to_string(&res)?, "".to_string()),
                    Err(e) => (1, "".to_string(), e.to_string()),
                }
            } else {
                // 3b. Execute as local shell command
                let trust = workflow.trust.as_ref().unwrap_or(&multiplicity_alp::policy::TrustLevel::Internal);
                
                let mut command = Command::new("bash");
                command.arg("-c").arg(&task.action);

                if trust == &multiplicity_alp::policy::TrustLevel::External {
                    tracing::info!("Spawning EXTERNAL task '{}' in sandbox", task.id);
                    let sandbox_dir = self.repo_path.join("state").join("sandbox").join(&workflow.name);
                    std::fs::create_dir_all(&sandbox_dir)?;
                    
                    command.env_clear()
                        .env("PATH", std::env::var("PATH").unwrap_or_default())
                        .env("SANDBOX_DIR", &sandbox_dir)
                        .current_dir(&sandbox_dir);
                } else {
                    command.current_dir(&self.repo_path);
                }

                let output = command.output()?;

                let exit_code = output.status.code().unwrap_or(-1);
                let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
                let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
                (exit_code, stdout, stderr)
            };

            task_results.push(serde_json::json!({
                "id": task.id,
                "command": task.action,
                "server_binding": task.server_binding,
                "exit_code": exit_code,
                "stdout": stdout,
                "stderr": stderr,
            }));
            
            if exit_code != 0 {
                workflow_success = false;
                break;
            }
        }
        
        let status = if workflow_success { "completed" } else { "failed" };
        
        // 4. Sigma transition commit (always try to register execution status)
        let transition = self.sigma.execute_workflow(workflow.clone()).await?;
        
        // 5. Create Unified Witness
        let witness = multiplicity_common::types::UnifiedWitness {
            witness_id,
            action_id: workflow.name.clone(),
            timestamp,
            compliance_evidence: report.reason.clone(),
            execution_receipt: serde_json::json!({
                "status": status,
                "sigma_transition_id": transition.id,
                "tasks": task_results,
            }),
            contractivity_score: constitution.contractivity_score,
            veto_status: "admitted".to_string(),
        };
        
        // 6. Write to Archivum
        self.archivum.write_witness(&witness)?;
        
        if !workflow_success {
            return Err(anyhow!("Workflow tasks failed execution"));
        }
        
        Ok(witness)
    }
}
