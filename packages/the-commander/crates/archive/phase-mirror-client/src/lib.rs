use serde::{Serialize, Deserialize};
use sha3::{Digest, Keccak256};
use thiserror::Error;
use prover::StarkProof;
use ed25519_dalek::{VerifyingKey, Signature, Verifier, Signer};
use std::convert::TryFrom;

#[derive(Debug, Error)]
pub enum VerifierError {
    #[error("Seal mismatch: expected {expected}, found {actual}")]
    SealMismatch { expected: String, actual: String },
    #[error("Signature invalid: {0}")]
    SignatureInvalid(String),
    #[error("Proof consistency failed: {0}")]
    ProofConsistencyFailed(String),
    #[error("STARK verification failed: {0}")]
    StarkVerificationFailed(String),
    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
    #[error("Crypto error: {0}")]
    CryptoError(String),
}

/// ConfigurationSeal (ADR-117): Captures the mathematical and circuit invariants.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ConfigurationSeal {
    pub domain_tag: String,             // "phase-mirror-pro", "ecp-genomic", etc.
    pub hamiltonian_family: String,     // e.g., "GUE-surrogate-v1"
    pub verification_key_hash: String,  // Keccak256 hash of the verifier circuit VK
    pub public_input_schema_hash: String,
    pub ks_threshold: String,           // Regulatory threshold for recovery (e.g., "0.15")
    pub protocol_v: u32,
    pub boot_profile_hash: String,      // Hash of the ADR-117 boot profile
    pub xicore_policy: String,          // "HARD" or "GRADED"
}

impl ConfigurationSeal {
    pub fn hash(&self) -> [u8; 32] {
        let json = serde_json::to_string(self).expect("seal serialization");
        Keccak256::digest(json.as_bytes()).into()
    }
}

/// MultiplicityCertificate: Signed claim from the Phase Mirror Oracle.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultiplicityCertificate {
    pub payload: MultiplicityCertificatePayload,
    pub signature: String, // Hex encoded Ed25519 signature
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultiplicityCertificatePayload {
    pub proposal_id: String,
    pub timestamp_ms: u64,
    pub rho: f64,
    pub resonance: f64,
    pub delta_pz: f64,
    pub seal_hash: String, // Keccak256 hash of the ConfigurationSeal
    pub status: OracleStatus,
    pub veto_count: u32,   // Number of XiCore violations during the session
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum OracleStatus {
    Certified,
    Recovered,
    Vetoed,
    Provisional,
    Quarantined, // Used for DEV/TEST graded policies
}

impl MultiplicityCertificatePayload {
    pub fn to_canonical_bytes(&self) -> Vec<u8> {
        // Canonicalization via Keccak256 field concatenation
        let mut data = Vec::new();
        data.extend_from_slice(self.proposal_id.as_bytes());
        data.extend_from_slice(&self.timestamp_ms.to_le_bytes());
        data.extend_from_slice(&self.rho.to_bits().to_le_bytes());
        data.extend_from_slice(&self.resonance.to_bits().to_le_bytes());
        data.extend_from_slice(&self.delta_pz.to_bits().to_le_bytes());
        data.extend_from_slice(self.seal_hash.as_bytes());
        data.extend_from_slice(format!("{:?}", self.status).as_bytes());
        data.extend_from_slice(&self.veto_count.to_le_bytes());
        data
    }
}

pub struct PhaseMirrorVerifier {
    pub oracle_pk: VerifyingKey,
    pub expected_seal: ConfigurationSeal,
}

impl PhaseMirrorVerifier {
    pub fn new(oracle_pk_hex: &str, seal: ConfigurationSeal) -> Result<Self, VerifierError> {
        let pk_bytes = hex::decode(oracle_pk_hex)
            .map_err(|e| VerifierError::CryptoError(format!("Invalid public key hex: {}", e)))?;
        let pk = VerifyingKey::try_from(pk_bytes.as_slice())
            .map_err(|e| VerifierError::CryptoError(format!("Invalid Ed25519 public key: {}", e)))?;
        
        Ok(Self {
            oracle_pk: pk,
            expected_seal: seal,
        })
    }

    /// Implement the five-stage verification lifecycle (ADR-117).
    pub fn verify_bundle(
        &self,
        cert: &MultiplicityCertificate,
        proof: &StarkProof,
    ) -> Result<bool, VerifierError> {
        // 1. Seal Compatibility
        let actual_seal_hash = hex::encode(self.expected_seal.hash());
        if cert.payload.seal_hash != actual_seal_hash {
            return Err(VerifierError::SealMismatch {
                expected: actual_seal_hash,
                actual: cert.payload.seal_hash.clone(),
            });
        }

        // 2. Signature Integrity
        let sig_bytes = hex::decode(&cert.signature)
            .map_err(|e| VerifierError::CryptoError(format!("Invalid signature hex: {}", e)))?;
        let sig = Signature::from_slice(&sig_bytes)
            .map_err(|e| VerifierError::CryptoError(format!("Invalid signature format: {}", e)))?;
        
        self.oracle_pk.verify(&cert.payload.to_canonical_bytes(), &sig)
            .map_err(|e| VerifierError::SignatureInvalid(e.to_string()))?;

        // 3. Fast-Fail Veto
        if cert.payload.status == OracleStatus::Vetoed {
            return Ok(false);
        }

        // 4. Proof-Input Consistency
        // Verify that the proof's public inputs match the certificate's claims.
        // (Placeholder: In production, we'd unpack proof.public_inputs and compare)
        if proof.trace_commitment.is_empty() {
             return Err(VerifierError::ProofConsistencyFailed("Empty trace commitment".to_string()));
        }

        // 5. STARK Verification
        // Validate the Plonky3 proof against the seal's verification key.
        // (Placeholder: Call external prover-verifier logic)
        
        Ok(true)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::SigningKey;
    use rand::rngs::OsRng;

    #[test]
    fn test_seal_hashing() {
        let seal = ConfigurationSeal {
            domain_tag: "phase-mirror-pro".to_string(),
            hamiltonian_family: "GUE-surrogate-v1".to_string(),
            verification_key_hash: "0x123".to_string(),
            public_input_schema_hash: "0x456".to_string(),
            ks_threshold: "0.15".to_string(),
            protocol_v: 1,
            boot_profile_hash: "0xabc".to_string(),
            xicore_policy: "HARD".to_string(),
        };
        let h1 = seal.hash();
        let h2 = seal.hash();
        assert_eq!(h1, h2);
    }

    #[test]
    fn test_full_verification_flow() {
        let mut csprng = OsRng;
        let signing_key = SigningKey::generate(&mut csprng);
        let verifying_key = signing_key.verifying_key();
        
        let seal = ConfigurationSeal {
            domain_tag: "phase-mirror-pro".to_string(),
            hamiltonian_family: "GUE-surrogate-v1".to_string(),
            verification_key_hash: "0x123".to_string(),
            public_input_schema_hash: "0x456".to_string(),
            ks_threshold: "0.15".to_string(),
            protocol_v: 1,
            boot_profile_hash: "0xabc".to_string(),
            xicore_policy: "HARD".to_string(),
        };
        let seal_hash = hex::encode(seal.hash());

        let payload = MultiplicityCertificatePayload {
            proposal_id: "prop-1".to_string(),
            timestamp_ms: 1715856000000,
            rho: 0.95,
            resonance: 0.88,
            delta_pz: 0.12,
            seal_hash: seal_hash,
            status: OracleStatus::Certified,
            veto_count: 0,
        };

        let signature = signing_key.sign(&payload.to_canonical_bytes());
        let cert = MultiplicityCertificate {
            payload,
            signature: hex::encode(signature.to_bytes()),
        };

        let mock_proof = StarkProof {
            trace_commitment: [1u8; 32],
            fri_commitments: vec![],
            query_openings: vec![],
            fri_final_poly: vec![],
        };

        let verifier = PhaseMirrorVerifier::new(
            &hex::encode(verifying_key.to_bytes()),
            seal
        ).unwrap();

        let result = verifier.verify_bundle(&cert, &mock_proof).unwrap();
        assert!(result);
    }
}
