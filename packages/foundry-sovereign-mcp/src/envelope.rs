use crate::poseidon::poseidon_hash_hex;
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

/// Version tag of the CRMF envelope schema. Bump on any breaking field change.
pub const CRMFR_VERSION: u32 = 1;

/// Well-known genesis state hash for the first event in a Founder OS lineage.
///
/// Any ledger whose first envelope does not anchor to this value is
/// rejected by [`CrmfEnvelope::verify_genesis`].
pub const GENESIS_STATE_HASH: &str =
    "0x0000000000000000000000000000000000000000000000000000000000000000";

/// Reserved zero-knowledge anchor slot.
///
/// When the mtpi-certifier GCC/Groth16-Plonk pipeline over BN254 is
/// integrated, an anchor referencing the submitted proof is written here.
/// Until a proof is actually produced and verifiable, [`CrmfEnvelope::zk_anchor`]
/// stays `None` and [`CrmfEnvelope::zero_knowledge_verified`] is `false` —
/// the server never fabricates a proof certificate.
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct ZkAnchor {
    /// Curve identifier of the proof system.
    pub curve: String,
    /// Proving scheme name (e.g. "Groth16", "Plonk").
    pub scheme: String,
    /// Receipt returned by the mtpi-certifier submission.
    pub certifier_receipt: String,
    /// Unix seconds at which the proof was submitted for certifier.
    pub submitted_at: u64,
}

/// Fail-closed CRMF envelope binding a certified Founder OS side effect.
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct CrmfEnvelope {
    /// CRMF schema version ([`CRMFR_VERSION`]).
    pub version: u32,
    /// Human-readable receipt identifier derived from the state hash.
    pub envelope_id: String,
    /// MCP tool that produced this envelope.
    pub tool: String,
    /// Logical workflow being executed (e.g. `founder-os/email-sequence/...`).
    pub workflow_id: String,
    /// Actor identifier, including provenance of the reflexive LLM.
    pub actor_id: String,
    /// Hash of the state this envelope extends.
    pub prev_state_hash: String,
    /// PWEH / Poseidon-2 digest of the certified transition.
    pub state_hash: String,
    /// Poseidon-2 digest of the canonical policy rule set enforced.
    pub policy_hash: String,
    /// Ops the certifier explicitly permitted as side effects.
    pub side_effect_permissions: Vec<String>,
    /// Certifier implementation identity ([`crate::CERTIFIER_VERSION`]).
    pub certifier_version: String,
    /// Reserved slot for zero-knowledge certification.
    pub zk_anchor: Option<ZkAnchor>,
    /// Poseidon-2 digest over the BCS-canonicalized public payload; allows
    /// offline re-verification that no public field was altered in storage.
    pub bcs_payload_digest: String,
    /// Unix seconds of sealing. Not trusted for ordering — the event log
    /// chain supplies ordering via `prev_state_hash` links.
    pub timestamp: u64,
}

/// Inputs required to seal an envelope after certification has passed.
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SealSpec {
    pub tool: String,
    pub workflow_id: String,
    pub actor_id: String,
    pub prev_state_hash: String,
    pub state_hash: String,
    pub policy_hash: String,
    pub side_effect_permissions: Vec<String>,
    pub zk_anchor: Option<ZkAnchor>,
}

fn unix_now_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

impl CrmfEnvelope {
    /// Seal a certified transition into a CRMF envelope.
    ///
    /// # Panics
    ///
    /// Panics only if the state hash or policy hash is not well-formed hex —
    /// callers are expected to produce these from [`crate::poseidon`] and
    /// [`crate::pweh`], which always do.
    pub fn seal(spec: SealSpec) -> CrmfEnvelope {
        let timestamp = unix_now_secs();
        let mut envelope = CrmfEnvelope {
            version: CRMFR_VERSION,
            envelope_id: format!(
                "crmf_{}",
                spec.state_hash
                    .trim_start_matches("0x")
                    .chars()
                    .take(14)
                    .collect::<String>()
            ),
            tool: spec.tool,
            workflow_id: spec.workflow_id,
            actor_id: spec.actor_id,
            prev_state_hash: spec.prev_state_hash,
            state_hash: spec.state_hash,
            policy_hash: spec.policy_hash,
            side_effect_permissions: spec.side_effect_permissions,
            certifier_version: crate::CERTIFIER_VERSION.into(),
            zk_anchor: spec.zk_anchor,
            bcs_payload_digest: String::new(),
            timestamp,
        };
        // Digest over the full envelope body with the digest field blanked, so
        // verification (which blanks the same field) recomputes identically.
        envelope.bcs_payload_digest =
            poseidon_hash_hex(&bcs::to_bytes(&envelope).expect("BCS serialization failed"));
        envelope
    }

    /// True when this envelope extends a ledger whose previous entry carried
    /// `state_hash == self.prev_state_hash` (or is the genesis anchor).
    pub fn verify_prev_link(&self, prev: &CrmfEnvelope) -> bool {
        self.prev_state_hash == prev.state_hash
    }

    /// True when this envelope is admissible as the head of a lineage.
    pub fn verify_genesis(&self) -> bool {
        self.prev_state_hash == GENESIS_STATE_HASH
    }

    /// Recompute the BCS payload digest and check it matches the sealed value.
    ///
    /// This detects silent mutation of any public audit field after sealing.
    pub fn verify_bcs_digest(&self) -> bool {
        let mut copy = self.clone();
        copy.bcs_payload_digest = String::new();
        let recomputed =
            poseidon_hash_hex(&bcs::to_bytes(&copy).expect("BCS serialization failed"));
        recomputed == self.bcs_payload_digest
    }

    /// True when a t=0 zero-knowledge certification has actually been
    /// produced by the mtpi-certifier pipeline for this envelope.
    pub fn zero_knowledge_verified(&self) -> bool {
        self.zk_anchor.is_some()
    }
}