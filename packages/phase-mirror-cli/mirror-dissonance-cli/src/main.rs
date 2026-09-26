// Licensed under the Phase Mirror License, Version 1.0
// See the LICENSE file in the project root for more information.

mod types;
mod engine;
mod privacy;
mod feedback;

use clap::{Parser, ValueEnum};
use std::path::PathBuf;
use std::path::Path;
use crate::types::{Outcome, DissonanceReport, Witness, Scanner};
use crate::engine::{L0SchemaScanner, MD002PinningScanner};
use crate::feedback::FpStore;
use chrono::Utc;
use sha2::{Sha256, Digest};

#[derive(Parser)]
#[command(name = "mirror-dissonance")]
#[command(about = "Phase Mirror Oracle CLI - Governance-as-Compilation", long_about = None)]
struct Cli {
    /// Operation mode
    #[arg(long, value_enum, default_value_t = EventMode::PullRequest)]
    mode: EventMode,

    /// Root directory to scan
    #[arg(short, long, default_value = ".")]
    root: PathBuf,

    /// Output path for the report
    #[arg(short, long, default_value = "dissonance_report.json")]
    output: PathBuf,

    /// Path to the False Positive Store (JSON)
    #[arg(long, default_value = "fp_store.json")]
    fp_store: PathBuf,

    /// Redact sensitive information (file paths)
    #[arg(long)]
    redact: bool,
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, PartialOrd, Ord, ValueEnum)]
enum EventMode {
    PullRequest,
    MergeGroup,
    Drift,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    println!("--- Phase Mirror Oracle CLI: Initiating Scan ({:?}) ---", cli.mode);

    let fp_store = FpStore::load(&cli.fp_store).unwrap_or_else(|_| {
        eprintln!("[WARN] Failed to load FP Store, defaulting to standard enforcement.");
        FpStore::default()
    });

    let l0_scanners: Vec<Box<dyn Scanner>> = vec![
        Box::new(L0SchemaScanner),
    ];

    let l1_scanners: Vec<Box<dyn Scanner>> = vec![
        Box::new(MD002PinningScanner),
    ];

    let mut all_violations = Vec::new();
    let mut l0_status = Outcome::PASS;

    // 1. Run L0 Invariants
    for scanner in l0_scanners {
        match scanner.scan(&cli.root) {
            Ok(v) => all_violations.extend(v),
            Err(e) => {
                eprintln!("[CRITICAL] L0 Failure ({}): {}", scanner.id(), e);
                std::process::exit(110);
            }
        }
    }

    if all_violations.iter().any(|v| matches!(v.severity, Outcome::BLOCK)) {
        l0_status = Outcome::BLOCK;
    }

    // 2. Run L1 Policies if L0 passed
    if matches!(l0_status, Outcome::PASS) {
        for scanner in l1_scanners {
            match scanner.scan(&cli.root) {
                Ok(mut violations) => {
                    // Apply Adaptive Feedback (ADR-PM-001 Section 4.3)
                    for v in &mut violations {
                        if matches!(v.severity, Outcome::BLOCK) && fp_store.should_downgrade(&v.rule_id, 0.15) {
                            println!("[INFO] Adaptive Feedback: Downgrading {} due to high FPR.", v.rule_id);
                            v.severity = Outcome::WARN;
                            v.evidence.message = format!("[DEGRADED POLICY] {}", v.evidence.message);
                        }
                    }
                    all_violations.extend(violations);
                }
                Err(_) => {
                    // Fail-closed ADR-005
                    std::process::exit(110);
                }
            }
        }
    }

    let final_outcome = if all_violations.iter().any(|v| matches!(v.severity, Outcome::BLOCK)) {
        Outcome::BLOCK
    } else if all_violations.iter().any(|v| matches!(v.severity, Outcome::WARN)) {
        Outcome::WARN
    } else {
        Outcome::PASS
    };

    let mut report = DissonanceReport {
        version: "1.0".to_string(),
        event_mode: match cli.mode {
            EventMode::PullRequest => "pull_request".to_string(),
            EventMode::MergeGroup => "merge_group".to_string(),
            EventMode::Drift => "drift".to_string(),
        },
        outcome: final_outcome.clone(),
        l0_status,
        violations: all_violations,
        witness: Witness {
            id: format!("wit-{}", Utc::now().timestamp()),
            hash: compute_workspace_hash(&cli.root),
            timestamp: Utc::now().to_rfc3339(),
        },
    };

    if cli.redact {
        report = report.redact();
    }

    let report_json = serde_json::to_string_pretty(&report)?;
    std::fs::write(&cli.output, report_json)?;

    println!("Scan Complete. Outcome: {:?}", final_outcome);
    println!("Report saved to: {:?}", cli.output);

    if matches!(final_outcome, Outcome::BLOCK) {
        std::process::exit(1);
    }

    Ok(())
}

/// Compute a SHA-256 hash of all source files in the workspace.
///
/// Walks the directory tree, collecting file contents (skipping .git, target, node_modules),
/// and produces a deterministic hash. This provides a tamper-evident witness for the scan.
fn compute_workspace_hash(root: &Path) -> String {
    use walkdir::WalkDir;

    let mut hasher = Sha256::new();

    // Collect paths sorted for deterministic hashing
    let mut paths: Vec<_> = WalkDir::new(root)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
        .filter(|e| {
            let path_str = e.path().to_string_lossy();
            !path_str.contains("/.git/")
                && !path_str.contains("/target/")
                && !path_str.contains("/node_modules/")
                && !path_str.contains("/vendor/")
        })
        .map(|e| e.path().to_path_buf())
        .collect();

    paths.sort();

    for path in &paths {
        // Hash the relative path
        if let Ok(rel) = path.strip_prefix(root) {
            hasher.update(rel.to_string_lossy().as_bytes());
        }
        hasher.update(b"\0");

        // Hash the file contents
        if let Ok(content) = std::fs::read(path) {
            hasher.update(&content);
        }
        hasher.update(b"\n");
    }

    format!("sha256:{}", hex::encode(hasher.finalize()))
}
