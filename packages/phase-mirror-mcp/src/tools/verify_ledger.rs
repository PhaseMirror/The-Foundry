use phase_mirror::{check_l0_invariants, L0Policy, State as KernelState};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LedgerBlock {
    pub index: u64,
    pub timestamp: i64,
    pub data: String,
    pub previous_hash: String,
    pub hash: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Ledger {
    pub chain: Vec<LedgerBlock>,
}

impl Ledger {
    pub fn verify(&self) -> bool {
        if self.chain.is_empty() {
            return true;
        }
        for i in 1..self.chain.len() {
            if self.chain[i].previous_hash != self.chain[i - 1].hash {
                return false;
            }
        }
        true
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Nonce {
    pub value: String,
    pub issued_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PhaseMirrorState {
    pub schema_version: String,
    pub schema_hash: String,
    pub permission_bits: u16,
    pub drift_magnitude: f64,
    pub nonce: Nonce,
    pub contraction_witness_score: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyLedgerRequest {
    pub ledger: Vec<LedgerBlock>,
    pub current_state: PhaseMirrorState,
    /// The SHA-256 digest of the schema artifact this deployment serves.
    ///
    /// The kernel used to compare against a hardcoded
    /// `EXPECTED_SCHEMA_HASH = "f7a8b9c0d1e2f3g4"`, which is not a hexadecimal
    /// string and so could never equal a real digest. The predicate was
    /// satisfied only by echoing the placeholder back. See ADR-RML-159.
    ///
    /// Both fields are optional on the wire so that older clients still parse,
    /// but an absent value produces the default policy, which
    /// `L0Policy::validate` rejects. Omitting them fails the invariant check
    /// rather than passing it.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub expected_schema_hash: Option<String>,
    /// Strict upper bound for the contraction witness. Validated to lie in
    /// `(0.0, 1.0]`. Defaults to `1.0`, the strictest legal exclusive bound.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub contraction_witness_exclusive_max: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyLedgerResponse {
    pub ledger_valid: bool,
    pub invariants_passed: bool,
    pub failed_checks: Vec<String>,
    pub violations: Option<HashMap<String, String>>,
}

/// Convert the wire state into the canonical kernel state.
///
/// `PhaseMirrorState` and `phase_mirror::State` carry identical fields, so this
/// is a field move rather than a reinterpretation. The two types are kept
/// separate so the wire contract of the MCP tool can evolve independently of
/// the kernel.
impl From<PhaseMirrorState> for KernelState {
    fn from(state: PhaseMirrorState) -> Self {
        KernelState {
            schema_version: state.schema_version,
            schema_hash: state.schema_hash,
            permission_bits: state.permission_bits,
            drift_magnitude: state.drift_magnitude,
            nonce: phase_mirror::Nonce {
                value: state.nonce.value,
                issued_at: state.nonce.issued_at,
            },
            contraction_witness_score: state.contraction_witness_score,
        }
    }
}

/// Build the deployment policy from the request.
///
/// An absent digest yields `L0Policy::default()`, whose `expected_schema_hash`
/// is empty. `L0Policy::validate` rejects that, so the kernel reports a
/// `schema_hash` violation and the gate fails closed. There is no path by which
/// an unspecified policy produces `invariants_passed: true`.
fn policy_from(req: &VerifyLedgerRequest) -> L0Policy {
    L0Policy {
        expected_schema_hash: req.expected_schema_hash.clone().unwrap_or_default(),
        contraction_witness_exclusive_max: req
            .contraction_witness_exclusive_max
            .unwrap_or(1.0),
        ..L0Policy::default()
    }
}

pub fn verify_ledger_integrity(req: VerifyLedgerRequest) -> VerifyLedgerResponse {
    let policy = policy_from(&req);

    let ledger = Ledger {
        chain: req.ledger,
    };
    let ledger_valid = ledger.verify();

    let state = req.current_state;

    // The L0 predicates live in exactly one place. This tool used to restate
    // them against its own constants, which is how the placeholder digest and
    // the `score == 1.0` witness check drifted out of step with the kernel.
    // See ADR-RML-159.
    let result = check_l0_invariants(&state.into(), &policy, None);

    VerifyLedgerResponse {
        ledger_valid,
        invariants_passed: result.passed,
        failed_checks: result.failed_checks,
        violations: result.violations,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use phase_mirror::is_well_formed_digest;

    const REAL_DIGEST: &str =
        "c60340700661949c07d26031b73b549682b00b910a86e56b055df3de148c5e7c";

    fn state(witness: Option<f64>, hash: &str) -> PhaseMirrorState {
        PhaseMirrorState {
            schema_version: "1.0.0".to_string(),
            schema_hash: hash.to_string(),
            permission_bits: 0,
            drift_magnitude: 0.1,
            nonce: Nonce {
                value: "n".repeat(64),
                issued_at: chrono::Utc::now().timestamp_millis(),
            },
            contraction_witness_score: witness,
        }
    }

    fn request(witness: Option<f64>, hash: &str) -> VerifyLedgerRequest {
        VerifyLedgerRequest {
            ledger: Vec::new(),
            current_state: state(witness, hash),
            expected_schema_hash: Some(REAL_DIGEST.to_string()),
            contraction_witness_exclusive_max: None,
        }
    }

    #[test]
    fn real_digest_and_contractive_witness_pass() {
        let r = verify_ledger_integrity(request(Some(0.95), REAL_DIGEST));
        assert!(r.invariants_passed, "{:?}", r.violations);
    }

    #[test]
    fn absent_policy_fails_closed() {
        let mut req = request(Some(0.95), REAL_DIGEST);
        req.expected_schema_hash = None;
        let r = verify_ledger_integrity(req);
        assert!(!r.invariants_passed);
        assert!(r.failed_checks.contains(&"schema_hash".to_string()));
    }

    #[test]
    fn historical_placeholder_hash_is_rejected() {
        let r = verify_ledger_integrity(request(Some(0.95), "f7a8b9c0d1e2f3g4"));
        assert!(!r.invariants_passed);
        assert!(r.failed_checks.contains(&"schema_hash".to_string()));
    }

    #[test]
    fn witness_of_exactly_one_is_rejected() {
        let r = verify_ledger_integrity(request(Some(1.0), REAL_DIGEST));
        assert!(!r.invariants_passed);
        assert!(r.failed_checks.contains(&"contraction_witness".to_string()));
    }

    #[test]
    fn missing_witness_fails_closed() {
        let r = verify_ledger_integrity(request(None, REAL_DIGEST));
        assert!(!r.invariants_passed);
        assert!(r.failed_checks.contains(&"contraction_witness".to_string()));
    }

    #[test]
    fn exclusive_bound_above_one_is_rejected() {
        let mut req = request(Some(0.95), REAL_DIGEST);
        req.contraction_witness_exclusive_max = Some(1.5);
        assert!(!verify_ledger_integrity(req).invariants_passed);
    }

    #[test]
    fn sha256_prefixed_digest_is_equivalent_to_bare_hex() {
        let prefixed = format!("sha256:{}", REAL_DIGEST);
        assert!(is_well_formed_digest(&prefixed));
        let r = verify_ledger_integrity(request(Some(0.95), &prefixed));
        assert!(r.invariants_passed, "{:?}", r.violations);
    }
}
