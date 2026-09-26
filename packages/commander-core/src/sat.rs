use anyhow::{Result, Context};
use ed25519_dalek::{SigningKey, Signer, VerifyingKey};
use multiplicity_common::types::SignedAdmissionToken;
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

pub struct SatIssuer {
    signing_key: SigningKey,
}

impl SatIssuer {
    pub fn new(signing_key: SigningKey) -> Self {
        Self { signing_key }
    }

    pub fn generate_random() -> Self {
        use rand::RngCore;
        let mut seed = [0u8; 32];
        rand::thread_rng().fill_bytes(&mut seed);
        let signing_key = SigningKey::from_bytes(&seed);
        Self { signing_key }
    }

    pub fn public_key(&self) -> VerifyingKey {
        self.signing_key.verifying_key()
    }

    pub fn issue_token(
        &self,
        caller_identity: String,
        server_binding: String,
        tool_name: String,
        capabilities: Vec<String>,
        constitution_version: String,
        ttl_seconds: u64,
        task_id: Option<String>,
    ) -> Result<SignedAdmissionToken> {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .context("Time went backwards")?
            .as_secs() as i64;
        
        let expires_at = now + ttl_seconds as i64;
        let token_id = Uuid::new_v4().to_string();

        let mut token = SignedAdmissionToken {
            token_id,
            task_id,
            issued_at: now,
            expires_at,
            caller_identity,
            server_binding,
            tool_name,
            capabilities_granted: capabilities,
            constitution_version,
            signature_scheme: "Ed25519".to_string(),
            signature: String::new(),
        };

        let payload = self.canonical_payload(&token)?;
        let signature = self.signing_key.sign(payload.as_bytes());
        token.signature = hex::encode(signature.to_bytes());

        Ok(token)
    }

    fn canonical_payload(&self, token: &SignedAdmissionToken) -> Result<String> {
        // serde_json::to_value uses BTreeMap internally for objects by default,
        // which guarantees lexicographical sorting of keys.
        // This matches Python's json.dumps(..., sort_keys=True).
        let mut val = serde_json::to_value(token)?;
        if let Some(obj) = val.as_object_mut() {
            obj.remove("signature");
        }
        
        Ok(serde_json::to_string(&val)?)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::Verifier;

    #[test]
    fn test_sat_issuance_and_verification() {
        let issuer = SatIssuer::generate_random();
        let token = issuer.issue_token(
            "commander-test".to_string(),
            "rust-mcp".to_string(),
            "list_tools".to_string(),
            vec!["read".to_string()],
            "1.0.0".to_string(),
            5,
            None,
        ).unwrap();

        assert_eq!(token.signature_scheme, "Ed25519");
        assert!(!token.signature.is_empty());

        let public_key = issuer.public_key();
        let mut val = serde_json::to_value(&token).unwrap();
        let signature_hex = val.as_object_mut().unwrap().remove("signature").unwrap().as_str().unwrap().to_string();
        let payload = serde_json::to_string(&val).unwrap();

        let signature_bytes = hex::decode(signature_hex).unwrap();
        let signature = ed25519_dalek::Signature::from_slice(&signature_bytes).unwrap();

        let result: Result<(), ed25519_dalek::SignatureError> = public_key.verify(payload.as_bytes(), &signature);
        assert!(result.is_ok());
    }
}
