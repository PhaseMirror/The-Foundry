use crate::poseidon::{bytes_to_field_elements, output_bytes};
use crate::tools::Operation;
use ark_bn254::Fr;
use ark_ff::{PrimeField};
use sha2::{Digest, Sha256};

/// Deterministically map an operation to a prime weight. Uses SHA-256 over the
/// BCS bytes; this is not part of the cryptographic lineage itself, it only
/// chooses the multiplier per operation type/target.
fn prime_weight(op: &Operation) -> u64 {
    let mut hasher = Sha256::new();
    let op_bytes = bcs::to_bytes(op).expect("BCS serialization failed");
    hasher.update(op_bytes);
    let hash_bytes = hasher.finalize();
    let numeric = u64::from_be_bytes(hash_bytes[..8].try_into().unwrap());
    let mut n = (numeric % 100_000) + 2;
    loop {
        if is_prime(n) {
            return n;
        }
        n += 1;
    }
}

fn is_prime(n: u64) -> bool {
    if n < 2 {
        return false;
    }
    if n == 2 {
        return true;
    }
    if n.is_multiple_of(2) {
        return false;
    }
    let limit = (n as f64).sqrt() as u64 + 1;
    for i in (3..=limit).step_by(2) {
        if n.is_multiple_of(i) {
            return false;
        }
    }
    true
}

fn u128_bytes_to_fe(bytes: &[u8]) -> Fr {
    let mut wide = [0u8; 32];
    wide[..bytes.len()].copy_from_slice(bytes);
    Fr::from_le_bytes_mod_order(&wide)
}

/// Prime-Weighted Execution Hash (PWEH) lineage accumulator.
///
/// Seeds a width-3 state from the previous state hash, then folds each
/// operation in as `state[0] += prime·H(op)`, `state[1] += H(op)` followed by a
/// Poseidon2 permutation. The permutation chaining makes the accumulator
/// order-sensitive: reordering, retyping, or retargeting an operation changes
/// every subsequent permutation and therefore the final digest.
///
/// This is deliberately a chained construction rather than a bare XOR sponge:
/// XOR accumulation is commutative and would silently admit reordering of the
/// same operation set.
pub fn compute_pweh_lineage(prev_state_hash: &str, ops: &[Operation]) -> String {
    let prev_bytes = hex::decode(prev_state_hash.trim_start_matches("0x"))
        .expect("Invalid previous state hash: expected even-length hex");

    let mut state: [Fr; 3] = [
        u128_bytes_to_fe(prev_bytes.get(..16).unwrap_or_default()),
        u128_bytes_to_fe(prev_bytes.get(16..).unwrap_or_default()),
        Fr::from(1u64),
    ];
    state = poseidon2::permutation(state);

    for op in ops {
        let op_bytes = bcs::to_bytes(op).expect("BCS serialization failed");
        let op_elements = bytes_to_field_elements(&op_bytes);
        let op_hash = poseidon2::hash([op_elements[0], Fr::from(op_elements.len() as u64)]);
        let weight = Fr::from(prime_weight(op));

        state[0] += weight * op_hash;
        state[1] += op_hash;
        state = poseidon2::permutation(state);
    }

    format!("0x{}", hex::encode(output_bytes(state[0])))
}