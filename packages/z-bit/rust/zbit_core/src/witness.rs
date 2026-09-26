// Witness emission for CCRE accepted updates.
// Mirrors the Python `emit_witness` function.

use std::collections::HashMap;
use sha2::{Digest, Sha256};
use hex;

/// Emits a witness consisting of the transform ID and a SHA‑256 hash of the
/// parameters JSON representation (sorted by key for determinism).
pub fn emit_witness(transform_id: &str, parameters: &HashMap<String, f64>) -> HashMap<String, String> {
    let ordered: std::collections::BTreeMap<_, _> = parameters.iter().collect();
    let canonical = serde_json::to_string(&ordered).expect("serialization should succeed");
    let mut hasher = Sha256::new();
    hasher.update(canonical.as_bytes());
    let digest = hasher.finalize();
    let hash_hex = hex::encode(digest);
    let mut result = HashMap::new();
    result.insert("transform_id".to_string(), transform_id.to_string());
    result.insert("parameters_hash".to_string(), hash_hex);
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_emit_witness_deterministic() {
        let mut params = HashMap::new();
        params.insert("theta".to_string(), 0.5);
        params.insert("kappa".to_string(), 0.3);

        let w1 = emit_witness("test", &params);
        let w2 = emit_witness("test", &params);
        assert_eq!(w1.get("parameters_hash"), w2.get("parameters_hash"));
    }
}
