use ark_bn254::Fr;
use ark_ff::{BigInteger, PrimeField};

/// Convert arbitrary bytes into a vector of field elements by chunking into
/// 31-byte blocks (safely below the 254-bit BN254 scalar modulus) and
/// interpreting each block as a little-endian integer reduced mod the field
/// order. The original byte length is appended first so that the element
/// sequence is injective over variable-length inputs.
pub fn bytes_to_field_elements(data: &[u8]) -> Vec<Fr> {
    let mut elements: Vec<Fr> = Vec::new();
    vectors::append_u32(&mut elements, data.len() as u32);
    for chunk in data.chunks(31) {
        let mut bytes = [0u8; 32];
        bytes[..chunk.len()].copy_from_slice(chunk);
        elements.push(Fr::from_le_bytes_mod_order(&bytes));
    }
    elements
}

/// Absorb the field-element sequence into the poseidon2 rate-2 sponge in
/// blocks of two, then squeeze the digest as a 32-byte little-endian value.
fn sponge_hash(elements: &[Fr]) -> [u8; 32] {
    let mut state: [Fr; 3] = [Fr::from(0u64), Fr::from(0u64), Fr::from(1u64)];
    let mut i = 0;
    while i < elements.len() {
        state[0] += elements[i];
        if i + 1 < elements.len() {
            state[1] += elements[i + 1];
        }
        state = poseidon2::permutation(state);
        i += 2;
    }
    let digest = state[0];
    output_bytes(digest)
}

/// Serialize a field element to 32 little-endian bytes (BN254 modulus < 2^254,
/// so the big-integer representation always fits in 32 bytes).
pub fn output_bytes(fe: Fr) -> [u8; 32] {
    let bytes = fe.into_bigint().to_bytes_le();
    let mut out = [0u8; 32];
    out.copy_from_slice(&bytes[..32]);
    out
}

/// Poseidon-2 hash of arbitrary bytes, returned as 32 bytes.
pub fn poseidon_hash_bytes(data: &[u8]) -> [u8; 32] {
    sponge_hash(&bytes_to_field_elements(data))
}

/// Poseidon-2 hash of arbitrary bytes, returned as a `0x`-prefixed hex string.
pub fn poseidon_hash_hex(data: &[u8]) -> String {
    format!("0x{}", hex::encode(poseidon_hash_bytes(data)))
}

/// Minimal little-endian helper for the length-seeding without pulling in the
/// full vec-append machinery.
mod vectors {
    use ark_bn254::Fr;
    use ark_ff::PrimeField;

    pub fn append_u32(v: &mut Vec<Fr>, n: u32) {
        let bytes = n.to_le_bytes();
        let mut wide = [0u8; 32];
        wide[..4].copy_from_slice(&bytes);
        v.push(Fr::from_le_bytes_mod_order(&wide));
    }
}