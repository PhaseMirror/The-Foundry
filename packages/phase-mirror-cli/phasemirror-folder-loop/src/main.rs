// Licensed under the Phase Mirror License, Version 1.0
// See the LICENSE file in the project root for more information.

use clap::Parser;
use std::path::PathBuf;

use phasemirror_folder_loop::engine::{self, FolderLoopConfig, DEFAULT_ITERATIONS};
use phasemirror_folder_loop::error::FolderLoopError;

/// PhaseMirror Folder-Loop: run the loop over an input folder, write the
/// report to an output folder.
#[derive(Parser, Debug)]
#[command(
    name = "phasemirror-folder-loop",
    version,
    about = "Run the PhaseMirror loop over a folder and emit a report (ADR-0001).",
    long_about = None
)]
struct Cli {
    /// Folder containing the sources the loop runs over.
    #[arg(short, long, default_value = ".")]
    input: PathBuf,

    /// Folder the report (loop_report.json / loop_report.md) is written to.
    #[arg(short, long, default_value = "report")]
    output: PathBuf,

    /// Number of loop iterations applied to each entry.
    #[arg(long, default_value_t = DEFAULT_ITERATIONS)]
    iterations: u64,
}

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();

    let config = FolderLoopConfig {
        input: cli.input,
        output: cli.output,
        iterations: cli.iterations,
    };

    println!(
        "--- PhaseMirror Folder-Loop: scanning {} -> {} ---",
        config.input.display(),
        config.output.display()
    );

    let report = match engine::run(&config) {
        Ok(r) => r,
        Err(e @ FolderLoopError::InputNotFound(_))
        | Err(e @ FolderLoopError::InputNotDirectory(_))
        | Err(e @ FolderLoopError::InputNotReadable(_))
        | Err(e @ FolderLoopError::OutputNotWritable(_)) => {
            eprintln!("[ERROR] configuration failed: {e}");
            // Fail-closed: a misconfigured run must not silently succeed.
            std::process::exit(2);
        }
        Err(e) => {
            eprintln!("[ERROR] loop failed: {e}");
            std::process::exit(1);
        }
    };

    let json_path = match engine::write_report(&report) {
        Ok(p) => p,
        Err(e) => {
            eprintln!("[ERROR] failed to write report: {e}");
            std::process::exit(1);
        }
    };

    println!(
        "Scan complete. entries={}, ok={}, warn={}, error={}",
        report.entries_scanned, report.counts.ok, report.counts.warn, report.counts.error
    );
    println!("Report saved to: {}", json_path.display());

    if !report.is_success() {
        std::process::exit(1);
    }

    Ok(())
}
