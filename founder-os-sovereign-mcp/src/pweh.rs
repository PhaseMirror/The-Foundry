use crate::poseidon::{bytes_to_field_elements, output_bytes};
use crate::tools::Operation;
use ark_bn254::Fr;
use ark_ff::PrimeField;
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

/// Decode a `0x`-prefixed 32-byte state hash into 32 raw bytes.
/// Rejects everything else — malformed or truncated lineage inputs must fail
/// closed rather than silently degrade the accumulator.
fn decode_state_hash(prev_state_hash: &str) -> Result<[u8; 32], String> {
    let stripped = prev_state_hash.strip_prefix("0x").unwrap_or(prev_state_hash);
    if stripped.len() != 64 {
        return Err(format!(
            "invalid state hash: expected 32-byte hex (64 chars), got {} chars",
            stripped.len()
        ));
    }
    let bytes = hex::decode(stripped).map_err(|e| format!("invalid state hash hex: {e}"))?;
    let mut out = [0u8; 32];
    out.copy_from_slice(&bytes);
    Ok(out)
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
///
/// # Errors
///
/// Returns `Err` when `prev_state_hash` is not well-formed 32-byte hex.
pub fn compute_pweh_lineage(prev_state_hash: &str, ops: &[Operation]) -> Result<String, String> {
    let prev_bytes = decode_state_hash(prev_state_hash)?;

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

    Ok(format!("0x{}", hex::encode(output_bytes(state[0]))))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::envelope::GENESIS_STATE_HASH;

    fn op(t: &str) -> Operation {
        Operation {
            op_type: t.into(),
            target: "segment:active-trial".into(),
        }
    }

    #[test]
    fn lineage_is_order_sensitive() {
        let ctx = "0xabababababababababababababababababababababababababababababababab";
        let a = [op("crm.update")];
        let b = [op("crm.update"), op("email.send")];
        let ab = compute_pweh_lineage(ctx, &a).unwrap();
        let ba = compute_pweh_lineage(ctx, &b).unwrap();
        assert_ne!(ab, ba, "different op sets must not collide");
        assert!(ab.starts_with("0x"));
        assert_eq!(ab.len(), 66);
    }

    #[test]
    fn malformed_prev_hash_fails_closed() {
        assert!(compute_pweh_lineage("0xabc123", &[]).is_err());
        assert!(compute_pweh_lineage("not-hex", &[]).is_err());
        assert!(compute_pweh_lineage(GENESIS_STATE_HASH, &[]).is_ok());
    }
}