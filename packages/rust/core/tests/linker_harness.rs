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
use pirtm_rs::{
    CouplingConfig, ModuleInput, ModuleMetadata, PIRTMBytecode, PirtmLinkWithEnsemble, SessionSpec,
};
use std::fs;
use tempfile::tempdir;

#[test]
fn test_spectral_small_gain_pass_fail() {
    let dir = tempdir().unwrap();
    let config_path = dir.path().join("coupling.json");

    // 1. Create a certified bytecode module
    let bytecode = PIRTMBytecode {
        metadata: ModuleMetadata {
            name: "ModuleA".to_string(),
            prime_index: 7,
            epsilon: 0.05,
            op_norm_t: 0.8,
            identity_commitment: "0xABC".to_string(),
        },
        proof_hash: "hash123".to_string(),
        mlir_source: "pirtm.module...".to_string(),
    };
    let bc_path = dir.path().join("modA.pirtm.bc");
    fs::write(&bc_path, serde_json::to_string(&bytecode).unwrap()).unwrap();

    // 2. Test PASS (r = 0.7)
    let config_pass = CouplingConfig {
        version: "1.0".to_string(),
        sessions: vec![SessionSpec {
            name: "Session1".to_string(),
            modules: vec![ModuleInput {
                alias: "modA".to_string(),
                path: "modA.pirtm.bc".to_string(),
            }],
            coupling_matrix: vec![vec![0.7]],
        }],
        cross_session_coupling: None,
    };
    fs::write(&config_path, serde_json::to_string(&config_pass).unwrap()).unwrap();

    let mut linker_pass =
        PirtmLinkWithEnsemble::new(config_path.to_str().unwrap(), dir.path().to_str().unwrap())
            .unwrap();

    let seal_pass = linker_pass.link().unwrap();
    assert!(seal_pass.global_spectral_radius < 0.701);
    assert!(seal_pass.is_contractive, "Expected r=0.7 to be contractive");

    // 3. Test FAIL (r = 1.1)
    let config_fail = CouplingConfig {
        version: "1.0".to_string(),
        sessions: vec![SessionSpec {
            name: "Session1".to_string(),
            modules: vec![ModuleInput {
                alias: "modA".to_string(),
                path: "modA.pirtm.bc".to_string(),
            }],
            coupling_matrix: vec![vec![1.1]],
        }],
        cross_session_coupling: None,
    };
    fs::write(&config_path, serde_json::to_string(&config_fail).unwrap()).unwrap();

    let mut linker_fail =
        PirtmLinkWithEnsemble::new(config_path.to_str().unwrap(), dir.path().to_str().unwrap())
            .unwrap();

    let seal_fail = linker_fail.link().unwrap();
    assert!(seal_fail.global_spectral_radius > 1.099);
    assert!(
        !seal_fail.is_contractive,
        "Expected r=1.1 to be non-contractive"
    );
}

#[test]
fn test_l0_6_commitment_collision() {
    let dir = tempdir().unwrap();
    let config_path = dir.path().join("coupling.json");

    // Create two modules with SAME identity_commitment
    let bc1 = PIRTMBytecode {
        metadata: ModuleMetadata {
            name: "Mod1".to_string(),
            prime_index: 2,
            epsilon: 0.05,
            op_norm_t: 0.1,
            identity_commitment: "STOLEN_IDENTITY".to_string(),
        },
        proof_hash: "h1".to_string(),
        mlir_source: "".to_string(),
    };
    let bc2 = PIRTMBytecode {
        metadata: ModuleMetadata {
            name: "Mod2".to_string(),
            prime_index: 3,
            epsilon: 0.05,
            op_norm_t: 0.1,
            identity_commitment: "STOLEN_IDENTITY".to_string(), // Collision!
        },
        proof_hash: "h2".to_string(),
        mlir_source: "".to_string(),
    };

    fs::write(
        dir.path().join("bc1.pirtm.bc"),
        serde_json::to_string(&bc1).unwrap(),
    )
    .unwrap();
    fs::write(
        dir.path().join("bc2.pirtm.bc"),
        serde_json::to_string(&bc2).unwrap(),
    )
    .unwrap();

    let config = CouplingConfig {
        version: "1.0".to_string(),
        sessions: vec![
            SessionSpec {
                name: "S1".to_string(),
                modules: vec![ModuleInput {
                    alias: "a1".to_string(),
                    path: "bc1.pirtm.bc".to_string(),
                }],
                coupling_matrix: vec![vec![0.5]],
            },
            SessionSpec {
                name: "S2".to_string(),
                modules: vec![ModuleInput {
                    alias: "a2".to_string(),
                    path: "bc2.pirtm.bc".to_string(),
                }],
                coupling_matrix: vec![vec![0.5]],
            },
        ],
        cross_session_coupling: None,
    };
    fs::write(&config_path, serde_json::to_string(&config).unwrap()).unwrap();

    let mut linker =
        PirtmLinkWithEnsemble::new(config_path.to_str().unwrap(), dir.path().to_str().unwrap())
            .unwrap();

    let result = linker.link();
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Pass 2 Violation (L0.6)"));
}
