use std::process::Command;
use std::fs;
use std::path::Path;

#[test]
fn test_canonical_fwht_budget() {
    // Path to the circom file
    let circom_path = "../../circuits/poseidon2/fwht.circom";
    assert!(Path::new(circom_path).exists(), "Circuit file not found");

    // Verify circom binary is available
    let circom_check = Command::new("which").arg("circom").output();
    if circom_check.is_err() || !circom_check.unwrap().status.success() {
        println!("circom not installed – skipping constraint test");
        return;
    }

    // Compile circuit
    let output = Command::new("circom")
        .args(&[circom_path, "--r1cs", "--sym"])
        .output()
        .expect("Failed to run circom");
    assert!(output.status.success(), "circom compilation failed: {}", String::from_utf8_lossy(&output.stderr));

    // Read generated .r1cs file
    let r1cs_file = "fwht.r1cs";
    assert!(Path::new(r1cs_file).exists(), "R1CS file not generated");
    let data = fs::read(r1cs_file).expect("Unable to read .r1cs");

    // Constraint count is stored in bytes 8..12 (little‑endian u32) per circom spec
    let count_bytes = &data[8..12];
    let constraint_count = u32::from_le_bytes([count_bytes[0], count_bytes[1], count_bytes[2], count_bytes[3]]);

    const EXPECTED: u32 = 5_087;
    assert_eq!(constraint_count, EXPECTED, "Constraint count {} does not match expected {}", constraint_count, EXPECTED);
}
