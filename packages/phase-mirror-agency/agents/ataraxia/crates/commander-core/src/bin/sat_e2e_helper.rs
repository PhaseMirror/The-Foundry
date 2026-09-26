use multiplicity_commander_core::sat::SatIssuer;
use std::fs;
use std::path::PathBuf;
use clap::Parser;

#[derive(Parser)]
struct Args {
    #[arg(long)]
    output: PathBuf,
    #[arg(long)]
    pubkey_env_file: PathBuf,
}

fn main() -> anyhow::Result<()> {
    let args = Args::parse();
    
    let issuer = SatIssuer::generate_random();
    let pub_key_hex = hex::encode(issuer.public_key().to_bytes());
    
    let token = issuer.issue_token(
        "sat-e2e-tester".to_string(),
        "multiplicity-mcp-python".to_string(),
        "test_tool".to_string(),
        vec!["read".to_string(), "write".to_string()],
        "1.0.0".to_string(),
        60, // 60s TTL for CI safety
        Some("task-e2e-001".to_string()),
    )?;
    
    // Write token JSON
    let token_json = serde_json::to_string_pretty(&token)?;
    fs::write(&args.output, token_json)?;
    
    // Write pubkey env file
    let env_content = format!("COMMANDER_SAT_PUBLIC_KEY={}\n", pub_key_hex);
    fs::write(&args.pubkey_env_file, env_content)?;
    
    println!("SUCCESS: Issued SAT to {:?} and pubkey env to {:?}", args.output, args.pubkey_env_file);
    Ok(())
}
