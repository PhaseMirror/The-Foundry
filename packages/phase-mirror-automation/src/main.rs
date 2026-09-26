use clap::{Parser, Subcommand};
use phase_mirror_automation::governance::AutomationEvaluationContext;
use phase_mirror_automation::{KiloMcpServer, run_stdio_loop};
use phase_mirror_gpt::domain_invariants::SemanticPolicy;
use phase_mirror_gpt::validator::GovernanceTier;
use std::sync::Arc;

#[derive(Parser, Debug)]
#[command(name = "phase-mirror-automation")]
#[command(about = "Self-governing automation crate for Phase Mirror development", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Run the Kilo MCP stdio server
    Mcp,
    /// Verify a single action through L0+L1+Triple-Lock
    Verify {
        #[arg(short, long)]
        action: String,
    },
    /// Run Kani proofs for the workspace
    Kani {
        #[arg(short, long)]
        package: Option<String>,
    },
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();

    let cli = Cli::parse();
    let policy = Arc::new(SemanticPolicy::new());
    let server = Arc::new(KiloMcpServer::new(policy));

    match cli.command {
        Commands::Mcp => {
            run_stdio_loop(server).await?;
        }
        Commands::Verify { action } => {
            let ctx = AutomationEvaluationContext {
                permission_bits: 0b1111,
                schema_signature: 0b111,
                expected_schema: 0b111,
            };
            let outcome = server.governance.admit(
                &ctx,
                phase_mirror_automation::governance::AutomationEvent::KiloMcpInvoke,
                &action,
                GovernanceTier::Tier1Authoritative,
            );
            match outcome {
                phase_mirror_automation::governance::AutomationGovernanceOutcome::Allow => {
                    tracing::info!("ADMITTED: action passed all governance gates");
                }
                phase_mirror_automation::governance::AutomationGovernanceOutcome::Warn(msg) => {
                    tracing::warn!("WARN: {}", msg);
                }
                phase_mirror_automation::governance::AutomationGovernanceOutcome::Block(msg) => {
                    tracing::error!("BLOCKED: {}", msg);
                    std::process::exit(1);
                }
            }
        }
        Commands::Kani { package } => {
            let report =
                phase_mirror_automation::kani_runner::KaniRunner::verify(package.as_deref(), None)?;
            if report.success {
                tracing::info!("Kani verification passed");
            } else {
                tracing::error!("Kani verification failed: {}", report.stderr);
                std::process::exit(1);
            }
        }
    }

    Ok(())
}
