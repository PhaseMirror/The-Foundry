use clap::{Parser, Subcommand, Args};
use multiplicity_commander_core::CommanderCore;
use multiplicity_commander_core::mcp_client::McpClient;
use multiplicity_commander_core::workflows::load_all_workflows;
use hex;

#[derive(Parser)]
#[command(name = "pscmd")]
#[command(about = "PhaseSpace Commander CLI - Governance-first runtime terminal shell", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
    /// Launch the Terminal UI dashboard
    #[arg(long)]
    pub tui: bool,
}

#[derive(Subcommand)]
enum Commands {
    /// Workflows management
    Workflows(WorkflowArgs),
    /// Governance status and verification
    Governance(GovernanceArgs),
    /// MCP capability check
    Mcp(McpArgs),
    /// Archivum ledger management
    Archivum(ArchivumArgs),
    /// Declarative workflow composition
    Compose {
        #[command(subcommand)]
        action: ComposeAction,
    },
}

#[derive(clap::Subcommand)]
enum ComposeAction {
    /// Validate a .sigma.yaml file and report errors with context.
    Validate {
        /// Path to the .sigma.yaml file
        #[arg(value_name = "FILE")]
        path: std::path::PathBuf,
    },
    /// Compile a .sigma.yaml file and print the resulting Workflow as JSON.
    Compile {
        /// Path to the .sigma.yaml file
        #[arg(value_name = "FILE")]
        path: std::path::PathBuf,
    },
}

#[derive(Args)]
struct ArchivumArgs {
    #[command(subcommand)]
    command: ArchivumSubcommands,
}

#[derive(Subcommand)]
enum ArchivumSubcommands {
    /// List all past witnesses in the ledger
    Log,
}

#[derive(Args)]
struct WorkflowArgs {
    #[command(subcommand)]
    command: WorkflowSubcommands,
}

#[derive(Subcommand)]
enum WorkflowSubcommands {
    /// List all available workflows (levers and custom)
    List,
    /// Run a specific workflow through policy admissibility and execution kernel
    Run {
        /// Name of the workflow to run
        name: String,
    },
}

#[derive(Args)]
struct GovernanceArgs {
    #[command(subcommand)]
    command: GovernanceSubcommands,
}

#[derive(Subcommand)]
enum GovernanceSubcommands {
    /// Check constitutional model properties and veto status
    Status,
}

#[derive(Args)]
struct McpArgs {
    #[command(subcommand)]
    command: McpSubcommands,
}

#[derive(Subcommand)]
enum McpSubcommands {
    /// List all registered MCP servers and their capabilities
    List,
    /// Attest to a server's binary by updating its hash in the registry
    Attest {
        /// ID of the server to attest
        id: String,
    },
}

mod tui;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    
    // Initialize CommanderCore targeting the current repository root
    let core = std::sync::Arc::new(CommanderCore::new("."));

    if cli.tui {
        let state = std::sync::Arc::new(std::sync::RwLock::new(tui::app::AppState::new()));
        
        // Initial data load
        {
            let workflows = load_all_workflows(&core.repo_path)?;
            let mut s = state.write().unwrap();
            s.workflows = workflows.iter().map(|w| {
                let last_witness = core.archivum.get_last_witness_for_workflow(&w.name).unwrap_or(None);
                tui::app::WorkflowSummary {
                    id: w.name.clone(),
                    name: w.name.clone(),
                    trust: format!("{:?}", w.trust.as_ref().unwrap_or(&multiplicity_alp::policy::TrustLevel::Internal)),
                    server: "N/A".to_string(),
                    alp_status: "PASS".to_string(),
                    last_run: last_witness.as_ref().map(|lw| lw.timestamp.clone()).unwrap_or("Never".to_string()),
                    last_sat_token_id: None,
                    last_witness_sha: last_witness.map(|lw| lw.witness_id),
                }
            }).collect();
        }

        let state_sse = std::sync::Arc::clone(&state);
        tokio::spawn(async move {
            tui::sse::run_sse_listener(state_sse).await;
        });

        tui::run(state).await?;
        return Ok(());
    }

    match cli.command.ok_or_else(|| anyhow::anyhow!("No command specified. Use --tui or a subcommand."))? {
        Commands::Workflows(wf_args) => match wf_args.command {
            WorkflowSubcommands::List => {
                let workflows = load_all_workflows(&core.repo_path)?;
                if workflows.is_empty() {
                    println!("No workflows found.");
                } else {
                    println!("============================================================");
                    println!("AVAILABLE WORKFLOWS:");
                    println!("============================================================");
                    for wf in workflows {
                        println!("- Workflow Name: {}", wf.name);
                        for (idx, task) in wf.tasks.iter().enumerate() {
                            println!("  Step {}: [Task: {}]", idx + 1, task.id);
                            println!("    Command: {}", task.action);
                        }
                        println!("------------------------------------------------------------");
                    }
                }
            }
            WorkflowSubcommands::Run { name } => {
                let workflows = load_all_workflows(&core.repo_path)?;
                let wf = workflows.into_iter().find(|w| w.name == name);
                
                let wf = match wf {
                    Some(w) => w,
                    None => {
                        anyhow::bail!("Workflow '{}' not found.", name);
                    }
                };

                println!("============================================================");
                println!("RUNNING WORKFLOW: {}", wf.name);
                println!("============================================================");
                
                match core.run_workflow(wf).await {
                    Ok(witness) => {
                        println!("\nExecution completed successfully.");
                        println!("Witness ID: {}", witness.witness_id);
                        println!("Compliance Evidence: {}", witness.compliance_evidence);
                        println!("Contractivity Score: {}", witness.contractivity_score);
                        println!("Veto Status: {}", witness.veto_status);
                        println!("\nWitness Execution Receipt JSON:");
                        println!("{}", serde_json::to_string_pretty(&witness.execution_receipt)?);
                    }
                    Err(e) => {
                        eprintln!("\nWorkflow execution failed or was blocked by policy:");
                        eprintln!("Error: {}", e);
                        std::process::exit(1);
                    }
                }
            }
        },
        Commands::Governance(gov_args) => match gov_args.command {
            GovernanceSubcommands::Status => {
                let constitution = core.load_constitution()?;
                println!("============================================================");
                println!("Ξ-CONSTITUTION GOVERNANCE STATUS:");
                println!("============================================================");
                println!("State Norm:          {}", constitution.state_norm);
                println!("Drift Rate:          {}", constitution.drift_rate);
                println!("Contractivity Score: {}", constitution.contractivity_score);
                println!("Consecutive Failures:{}", constitution.consecutive_failures);
                println!("Kill Switch Active:  {}", constitution.kill_switch_active);
                
                if let Some(ref sha) = constitution.rollback_anchor_sha {
                    println!("Rollback Anchor SHA: {}", sha);
                }
                if let Some(ref sha) = constitution.proof_anchor {
                    println!("Proof Anchor:        {}", sha);
                }
                
                println!("Active Anchors:      {:?}", constitution.active_anchors);
                println!("Audit Warnings:      {:?}", constitution.audit_warnings);
                
                println!("------------------------------------------------------------");
                println!("Prime Gates:");
                for gate in &constitution.prime_gates {
                    println!("  - Action: {}, Value: {}", gate.action_name, gate.gate_value);
                }
                
                println!("------------------------------------------------------------");
                print!("Veto Status:         ");
                match constitution.validate() {
                    Ok(()) => {
                        println!("PASS (All L0 constitutional invariants satisfied)");
                    }
                    Err(err) => {
                        println!("VIOLATED!");
                        println!("  Invariant violated: {}", err.invariant);
                        println!("  Details:            {}", err.detail);
                    }
                }
                println!("============================================================");
            }
        },
        Commands::Mcp(mcp_args) => match mcp_args.command {
            McpSubcommands::List => {
                let registry = core.load_mcp_registry()?;
                println!("============================================================");
                println!("REGISTERED MCP SERVERS:");
                println!("============================================================");
                
                for s in registry.servers {
                    let status = match core.verify_server_hash(&s) {
                        Ok(true) => "VERIFIED",
                        Ok(false) => "INSECURE (Hash Mismatch)",
                        Err(_) => "ERROR (Path Not Found)",
                    };
                    
                    println!("- ID:     {}", s.id);
                    println!("  Name:   {}", s.name);
                    println!("  Status: {}", status);
                    if let Some(ref w) = s.warning {
                        println!("  Notice: {}", w);
                    }
                    
                    if status == "VERIFIED" {
                        println!("  Querying capabilities...");
                        let mut envs = std::collections::HashMap::new();
                        envs.insert("MCP_SERVER_ID".to_string(), s.id.clone());
                        
                        // For listing, we might need a public key if the server is fail-closed
                        if s.alp_required {
                             // During list, we don't have a private key to issue tokens, 
                             // but we can generate a ephemeral one just to allow the server to start
                             let ephemeral_issuer = multiplicity_commander_core::sat::SatIssuer::generate_random();
                             envs.insert("COMMANDER_SAT_PUBLIC_KEY".to_string(), hex::encode(ephemeral_issuer.public_key().to_bytes()));
                        }

                        let mut client = if s.command == "python3" {
                             McpClient::spawn("python3", &s.args.iter().map(|s| s.as_str()).collect::<Vec<_>>(), &envs).await?
                        } else {
                             McpClient::spawn(&s.command, &s.args.iter().map(|s| s.as_str()).collect::<Vec<_>>(), &envs).await?
                        };
                        let tools = client.list_tools().await?;
                        println!("  Tools:  {}", serde_json::to_string(&tools)?);
                    }
                    println!("------------------------------------------------------------");
                }
                println!("============================================================");
            }
            McpSubcommands::Attest { id } => {
                let mut registry = core.load_mcp_registry()?;
                let server = registry.servers.iter_mut().find(|s| s.id == id);
                
                match server {
                    Some(s) => {
                        let full_path = core.repo_path.join(&s.command);
                        if !full_path.exists() {
                            anyhow::bail!("Server command path not found: {:?}", full_path);
                        }
                        let new_hash = core.compute_binary_hash(full_path)?;
                        s.hash = new_hash.clone();
                        core.save_mcp_registry(&registry)?;
                        println!("SUCCESS: Server '{}' attested with new hash: {}", id, new_hash);
                    }
                    None => {
                        anyhow::bail!("Server with ID '{}' not found in registry.", id);
                    }
                }
            }
        },
        Commands::Archivum(arch_args) => match arch_args.command {
            ArchivumSubcommands::Log => {
                let witnesses = core.archivum.read_witnesses()?;
                if witnesses.is_empty() {
                    println!("No witnesses found in Archivum.");
                } else {
                    println!("{:<30} {:<30} {:<10} {}", "TIMESTAMP", "ACTION_ID", "STATUS", "WITNESS_ID");
                    println!("{}", "-".repeat(100));
                    for w in witnesses {
                        let status = w.veto_status.clone();
                        println!("{:<30} {:<30} {:<10} {}", w.timestamp, w.action_id, status, w.witness_id);
                    }
                }
            }
        },
        Commands::Compose { action } => match action {
            ComposeAction::Validate { path } => {
                match mirror_dissonance::compose::compile(&path) {
                    Ok(wf) => {
                        println!("✓ valid — compiled to workflow '{}'", wf.name);
                    }
                    Err(e) => {
                        eprintln!("✗ {:#}", e);
                        std::process::exit(1);
                    }
                }
            }
            ComposeAction::Compile { path } => {
                let wf = mirror_dissonance::compose::compile(&path)?;
                println!("{}", serde_json::to_string_pretty(&wf)?);
            }
        },
    }

    Ok(())
}
