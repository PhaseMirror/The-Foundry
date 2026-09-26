// export_mds.rs – Export BN254 Poseidon2 MDS matrix and round constants for Circom
// Run with `cargo run --bin export_mds` (add binary entry in Cargo.toml)

use ark_bn254::Fr;
use ark_sponge::{poseidon::PoseidonParameters, PoseidonSponge, poseidon::PoseidonConfig};
use ark_std::{println, format};

fn main() {
    // Poseidon2 parameters for BN254 (t=9, full rounds=8, partial rounds=57) – adjust as needed.
    // Using ark_sponge's default Poseidon2 parameters for Fr.
    let params: PoseidonParameters<Fr> = PoseidonConfig::default().to_parameters();

    // MDS matrix
    println!("// MDS matrix");
    for row in &params.mds {
        let row_str = row.iter().map(|v| format!("{}", v)).collect::<Vec<_>>().join(", ");
        println!("signal const MDS_ROW_{{}} = [{}];", row_str);
    }

    // Round constants
    println!("// Round constants");
    for (i, rc) in params.round_constants.iter().enumerate() {
        let rc_str = rc.iter().map(|v| format!("{}", v)).collect::<Vec<_>>().join(", ");
        println!("signal const RC_{{}} = [{}];", i, rc_str);
    }
}
