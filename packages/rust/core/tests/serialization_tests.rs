// QUARANTINED: this target tests an API surface that no longer exists.
//
// `pirtm_rs` (packages/rust/pirtm-rs/src/lib.rs) is now a 7-line shim exporting
// only `gates`, `rta`, `uac_loss`, `tether_policy`, `hilbert_polya`, `jury`.
// Every type imported below -- CouplingConfig, ModuleInput, ModuleMetadata,
// PIRTMBytecode, PirtmLinkWithEnsemble, SessionSpec, step, EmissionGate,
// EmissionPolicy, compute_proof_hash, PIRTMGovernanceSection,
// PIRTMProofSection, PIRTMRuntime, PETCLedger -- is gone from the crate.
//
// The file is kept on-tree and compiled to an empty test binary by default
// because leaving it enabled is strictly worse than quarantining it: an
// uncompilable test target aborts `cargo test` for the whole package, so these
// three files were masking the 13 live unit tests in src/tests.rs. They were
// never running; they were preventing anything from running.
//
// The assertions are NOT edited to match current reality. Weakening a test to
// agree with observed behaviour is the failure mode D-03 documents, and
// inventing replacement types would fabricate a contract nobody specified.
// Restoring these requires recovering the removed `pirtm_rs` API -- an owner
// decision, tracked as D-17. Enable with: cargo test --features legacy-removed-api
#![cfg(feature = "legacy-removed-api")]
use pirtm_rs::{compute_proof_hash, PIRTMGovernanceSection, PIRTMProofSection, PIRTMRuntime};
use std::collections::HashMap;
use tempfile::tempdir;

#[test]
fn test_binary_serialization_roundtrip() {
    let dir = tempdir().unwrap();
    let bin_path = dir.path().join("pirtm_runtime.bin");

    let prime = 7;
    let epsilon = 0.05;
    let op_norm_t = 0.8;
    let proof_hash = compute_proof_hash(prime, epsilon, op_norm_t);

    let mut session_map = HashMap::new();
    session_map.insert("SessionA".to_string(), prime);

    let runtime = PIRTMRuntime {
        proof: PIRTMProofSection {
            prime_index: prime,
            epsilon,
            op_norm_t,
            contractivity_check: "PASS".to_string(),
            proof_hash: proof_hash.clone(),
        },
        governance: PIRTMGovernanceSection {
            ensemble_hash: "ensemble123".to_string(),
            global_spectral_radius: 0.85,
            is_contractive: true,
            timestamp: 123456789.0,
            session_map,
        },
        code: b"MLIR_BYTECODE_CONTENT".to_vec(),
    };

    // Save
    runtime
        .save(bin_path.to_str().unwrap())
        .expect("Save failed");

    // Load
    let loaded = PIRTMRuntime::load(bin_path.to_str().unwrap()).expect("Load failed");

    assert_eq!(loaded.proof.prime_index, prime);
    assert_eq!(loaded.proof.proof_hash, proof_hash);
    assert_eq!(loaded.governance.ensemble_hash, "ensemble123");
    assert_eq!(loaded.code, b"MLIR_BYTECODE_CONTENT");
}

#[test]
fn test_inspect_mandatory_output() {
    let mut session_map = HashMap::new();
    session_map.insert("SessionA".to_string(), 7);

    let runtime = PIRTMRuntime {
        proof: PIRTMProofSection {
            prime_index: 7,
            epsilon: 0.05,
            op_norm_t: 0.8,
            contractivity_check: "PASS".to_string(),
            proof_hash: "hash".to_string(),
        },
        governance: PIRTMGovernanceSection {
            ensemble_hash: "govhash".to_string(),
            global_spectral_radius: 0.85,
            is_contractive: true,
            timestamp: 0.0,
            session_map,
        },
        code: vec![],
    };

    let output = runtime.inspect();
    println!("{}", output);

    // L0.7: The pirtm inspect output must always include...
    assert!(output.contains("Audit Chain: NOT EMBEDDED — retrieve via pirtm audit <trace.log>"));
    assert!(output.contains("=== PIRTM SEAL INSPECTION ==="));
}
