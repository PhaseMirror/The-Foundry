//! Entry point for Rust replacements of Z‑Bit utility scripts.

use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "zbit-scripts")]
#[command(version = "0.1.0")]
#[command(about = "Rust replacements for Z‑Bit Python scripts")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Run the Bitcoin simulation (Rust version)
    RunBitcoinSim,
    /// Benchmark resonance (Rust version)
    BenchmarkResonance,
}

fn main() {
    let cli = Cli::parse();
    match cli.command {
        Commands::RunBitcoinSim => {
            println!("Running Bitcoin simulation (Rust version)...");
            // TODO: implement the simulation logic or call into zbit_core.
        }
        Commands::BenchmarkResonance => {
            println!("Benchmarking resonance (Rust version)...");
            // TODO: implement the benchmark or call into zbit_core.
        }
    }
}
