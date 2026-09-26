use serde::{Deserialize, Serialize};
use std::fmt;

/// Receipt status for a seal that passed every check.
pub const CERTIFIED: &str = "CERTIFIED";
/// Receipt status for a seal that failed at least one check.
pub const REJECTED: &str = "REJECTED";
/// Receipt status for an action that never reached a seal.
pub const BLOCKED: &str = "BLOCKED";

/// The prefix every governed identifier carries.
pub const SHA256_PREFIX: &str = "sha256:";

/// Whether `value` is a well-formed `sha256:<64 lowercase hex>` identifier.
///
/// The historical `witness_id` was an arbitrary caller-supplied string that was
/// passed straight through into the receipt as `hash`, so a receipt could
/// attest to a witness that no digest identified. Validating at the boundary is
/// what makes the identifier mean something. See ADR-RML-162.
pub fn is_well_formed_hash(value: &str) -> bool {
    let Some(hex) = value.strip_prefix(SHA256_PREFIX) else {
        return false;
    };
    hex.len() == 64 && hex.bytes().all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
}

/// The four sovereign surfaces defined in ADR-002.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize,  )]
#[serde(rename_all = "kebab-case")]
pub enum SurfaceState {
    ChromiumExtension,
    VSCodeExtension,
    ESP32Edge,
    LocalFirstData,
}

impl fmt::Display for SurfaceState {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SurfaceState::ChromiumExtension => write!(f, "ChromiumExtension"),
            SurfaceState::VSCodeExtension => write!(f, "VSCodeExtension"),
            SurfaceState::ESP32Edge => write!(f, "ESP32Edge"),
            SurfaceState::LocalFirstData => write!(f, "LocalFirstData"),
        }
    }
}

/// The four phases of the Triple-Lock sequence.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Default)]
#[serde(rename_all = "kebab-case")]
pub enum TripleLockPhase {
    #[default]
    Genius,
    Guardian,
    Examiner,
    Completed,
    Failed,
}

impl fmt::Display for TripleLockPhase {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TripleLockPhase::Genius => write!(f, "Genius"),
            TripleLockPhase::Guardian => write!(f, "Guardian"),
            TripleLockPhase::Examiner => write!(f, "Examiner"),
            TripleLockPhase::Completed => write!(f, "Completed"),
            TripleLockPhase::Failed => write!(f, "Failed"),
        }
    }
}

/// The outcome of a governance check.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum GovernanceOutcome {
    Admissible,
    Blocked(Vec<String>),
    Degraded(String),
}

/// Unified receipt envelope emitted by every governed action.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContractivityReceipt {
    pub status: String,
    pub witness_id: String,
    pub lambda_trace: LambdaTrace,
    pub proof_hash: String,
    pub lean_manifest_hash: String,
    pub surface: SurfaceState,
    pub archivum_log: String,
    pub triple_lock_phase: TripleLockPhase,
}

impl ContractivityReceipt {
    pub fn ok(
        witness_id: String,
        surface: SurfaceState,
        archivum_log: String,
        lambda_p: f64,
        l_p: f64,
        zero_spacings: Vec<u64>,
    ) -> Self {
        Self {
            status: "OK".to_string(),
            witness_id,
            lambda_trace: LambdaTrace {
                lambda_p,
                l_p,
                zero_spacings,
            },
            proof_hash: String::new(),
            lean_manifest_hash: String::new(),
            surface,
            archivum_log,
            triple_lock_phase: TripleLockPhase::Completed,
        }
    }

    pub fn blocked(witness_id: String, surface: SurfaceState, _reasons: Vec<String>) -> Self {
        Self {
            status: "BLOCKED".to_string(),
            witness_id,
            lambda_trace: LambdaTrace {
                lambda_p: 0.0,
                l_p: 0.0,
                zero_spacings: Vec::new(),
            },
            proof_hash: String::new(),
            lean_manifest_hash: String::new(),
            surface,
            archivum_log: String::new(),
            triple_lock_phase: TripleLockPhase::Failed,
        }
    }

    /// A certified receipt, with every attestation supplied by the caller.
    ///
    /// `proof_hash` and `lean_manifest_hash` can only be produced by the Lean
    /// plane and the build respectively, and `archivum_log` only by the local
    /// log attesting its own tail. The previous `ok` constructor left all three
    /// as empty strings, so a receipt could be built that asserted `status:
    /// "OK"` while attesting to nothing. Requiring them here makes an
    /// unattested certificate unconstructible through the typed path.
    ///
    /// `status` and `triple_lock_phase` are set together, so the contradictory
    /// `status: "OK"` with `triple_lock_phase: Failed` state is no longer
    /// constructible. See ADR-RML-161 and ADR-RML-162.
    pub fn certified(
        witness_id: String,
        surface: SurfaceState,
        lambda_trace: LambdaTrace,
        proof_hash: String,
        lean_manifest_hash: String,
        archivum_log: String,
    ) -> Self {
        Self {
            status: CERTIFIED.to_string(),
            witness_id,
            lambda_trace,
            proof_hash,
            lean_manifest_hash,
            surface,
            archivum_log,
            triple_lock_phase: TripleLockPhase::Completed,
        }
    }

    /// A rejected receipt. Uses the same attestation parameters as
    /// [`ContractivityReceipt::certified`] so the two are symmetric and a
    /// rejection cannot be a degraded copy of a success.
    pub fn rejected(
        witness_id: String,
        surface: SurfaceState,
        lambda_trace: LambdaTrace,
        proof_hash: String,
        lean_manifest_hash: String,
        archivum_log: String,
    ) -> Self {
        Self {
            status: REJECTED.to_string(),
            witness_id,
            lambda_trace,
            proof_hash,
            lean_manifest_hash,
            surface,
            archivum_log,
            triple_lock_phase: TripleLockPhase::Failed,
        }
    }

    /// Whether this receipt is internally coherent.
    ///
    /// The typed constructors make an incoherent receipt unconstructible, but a
    /// receipt can also arrive by deserialization from a peer or an on-disk
    /// record, which bypasses the constructors entirely. This check is what a
    /// consumer runs on such a receipt before trusting it.
    pub fn is_coherent(&self) -> bool {
        let phase_matches_status = match self.status.as_str() {
            CERTIFIED => self.triple_lock_phase == TripleLockPhase::Completed,
            REJECTED | BLOCKED => self.triple_lock_phase == TripleLockPhase::Failed,
            _ => false,
        };
        phase_matches_status
            && self.lambda_trace.is_contractive()
            && is_well_formed_hash(&self.proof_hash)
            && is_well_formed_hash(&self.lean_manifest_hash)
    }
}

/// The single owner of the contractivity predicate.
///
/// This was previously restated in three places, and the restatements disagreed:
/// `LambdaTrace::is_contractive` used `lambda_p * l_p < 1.0`, the WASM
/// `evaluate_seal` compared a raw score against a caller-supplied bound, and the
/// ESP32 port used a third form. The governing invariant in Lean is
/// non-expansiveness on a discrete prime-index metric
/// (`PIRTM/lean/prime_tensors/CPIRTM.lean:20`,
/// `PIRTM/rust/pirtm-clinical/lean-harness/Math/Lipschitz.lean:12`):
/// `κ < 1 ∧ κ > 0`.
///
/// All surfaces call this so divergence becomes a test failure rather than a
/// latent disagreement. See ADR-RML-160.
pub fn is_contractive(score: f64, exclusive_bound: f64) -> bool {
    // A non-finite bound or score cannot be compared meaningfully, and NaN
    // would make every comparison false. Reject explicitly rather than relying
    // on IEEE semantics to fail closed by accident.
    if !score.is_finite() || !exclusive_bound.is_finite() {
        return false;
    }
    score > 0.0 && score < exclusive_bound
}

/// Whether `exclusive_bound` is a legal contractivity domain at all.
///
/// The domain is `(0.0, 1.0)`. A bound of `1.0` or above would admit
/// non-contractive scores; a bound at or below zero admits nothing. Callers that
/// take a bound from outside must check this before trusting a verdict derived
/// from it.
pub fn is_valid_contractivity_bound(exclusive_bound: f64) -> bool {
    exclusive_bound.is_finite() && exclusive_bound > 0.0 && exclusive_bound < 1.0
}

/// Lambda trace embedded in every ContractivityReceipt.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LambdaTrace {
    pub lambda_p: f64,
    pub l_p: f64,
    pub zero_spacings: Vec<u64>,
}

impl LambdaTrace {
    /// The composite Lipschitz constant of this trace.
    pub fn slope(&self) -> f64 {
        self.lambda_p * self.l_p
    }

    pub fn is_contractive(&self) -> bool {
        // `zero_spacings` is a structural precondition, not a contractivity
        // question: a trace with no zero spacings has not been measured, so it
        // cannot be certified. The numeric predicate itself is owned by
        // [`is_contractive`].
        !self.zero_spacings.is_empty() && is_contractive(self.slope(), 1.0)
    }
}

/// Canonical append-only event stored in the local-first Archivum.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArchivumEvent {
    pub id: String,
    pub timestamp_ms: i64,
    pub surface: SurfaceState,
    pub witness_id: String,
    pub receipt_json: String,
    pub signature: String,
}

impl ArchivumEvent {
    pub fn new(
        surface: SurfaceState,
        witness_id: String,
        receipt_json: String,
        signature: String,
        timestamp_ms: i64,
    ) -> Self {
        let id = uuid::Uuid::new_v4().to_string();
        Self {
            id,
            timestamp_ms,
            surface,
            witness_id,
            receipt_json,
            signature,
        }
    }
}

/// Surface-agnostic L0 check contract.
///
/// Implemented by `phase-mirror`, `phase-mirror-edge`, and the WASM wrapper.
pub trait L0Check {
    type Input;
    type Output;
    fn check(state: Self::Input) -> Self::Output;
}

/// Surface-agnostic Triple-Lock state machine contract.
///
/// Implemented by `phase-mirror` and `phase-mirror-edge`.
pub trait TripleLockMachine {
    type Receipt;
    fn advance(&mut self, witness: &Self::Receipt) -> Result<TripleLockPhase, LockError>;
    fn current_phase(&self) -> TripleLockPhase;
}

/// Errors that can occur during Triple-Lock advancement.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error("Lock error: {message}")]
pub struct LockError {
    pub message: String,
}

impl LockError {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
        }
    }
}

/// Every sovereign surface must implement this adapter.
pub trait SurfaceAdapter {
    fn surface_id(&self) -> SurfaceState;
    fn emit_receipt(&self, receipt: &ContractivityReceipt) -> Result<(), SurfaceError>;
    fn read_receipts(&self, since_ms: i64) -> Result<Vec<ContractivityReceipt>, SurfaceError>;
    fn triple_lock_status(&self) -> Result<TripleLockPhase, SurfaceError>;
}

/// Errors that can occur when interacting with a sovereign surface.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error("Surface error: {message}")]
pub struct SurfaceError {
    pub message: String,
}

impl SurfaceError {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn lambda_trace_contractivity() {
        let trace = LambdaTrace {
            lambda_p: 0.95,
            l_p: 0.90,
            zero_spacings: vec![1, 3, 5, 7],
        };
        assert!(trace.is_contractive());

        let trace2 = LambdaTrace {
            lambda_p: 0.99,
            l_p: 0.99,
            zero_spacings: vec![],
        };
        assert!(!trace2.is_contractive());
    }

    #[test]
    fn receipt_ok_construction() {
        let receipt = ContractivityReceipt::ok(
            "witness-1".to_string(),
            SurfaceState::LocalFirstData,
            "archivum-1".to_string(),
            0.95,
            0.90,
            vec![1, 3, 5, 7],
        );
        assert_eq!(receipt.status, "OK");
        assert_eq!(receipt.surface, SurfaceState::LocalFirstData);
        assert!(receipt.lambda_trace.is_contractive());
    }

    #[test]
    fn receipt_blocked_construction() {
        let receipt = ContractivityReceipt::blocked(
            "witness-2".to_string(),
            SurfaceState::ESP32Edge,
            vec!["drift too high".to_string()],
        );
        assert_eq!(receipt.status, "BLOCKED");
        assert_eq!(receipt.surface, SurfaceState::ESP32Edge);
        assert!(!receipt.lambda_trace.is_contractive());
    }
}

/// Tests for the shared contractivity predicate and receipt coherence.
///
/// These encode ADR-RML-160 clause 4 and ADR-RML-162 clause 4. The regression
/// cases at the bottom are the ones that failed before those clauses existed.
#[cfg(test)]
mod contractivity_tests {
    use super::*;

    const HASH_A: &str =
        "sha256:c60340700661949c07d26031b73b549682b00b910a86e56b055df3de148c5e7c";
    const HASH_B: &str =
        "sha256:0000000000000000000000000000000000000000000000000000000000000001";

    fn trace(slope: f64) -> LambdaTrace {
        LambdaTrace {
            lambda_p: slope,
            l_p: 1.0,
            zero_spacings: vec![7],
        }
    }

    #[test]
    fn contractive_scores_are_below_one() {
        assert!(is_contractive(0.5, 1.0));
        assert!(is_contractive(0.95, 1.0));
        assert!(is_contractive(0.999_999, 1.0));
    }

    #[test]
    fn boundary_and_non_contractive_scores_are_rejected() {
        // The Lean invariant is `κ < 1`, so exactly 1.0 is non-contractive.
        assert!(!is_contractive(1.0, 1.0));
        assert!(!is_contractive(1.5, 1.0));
        // `κ > 0` is the other half; a score of zero proves nothing.
        assert!(!is_contractive(0.0, 1.0));
        assert!(!is_contractive(-0.1, 1.0));
    }

    #[test]
    fn non_finite_scores_fail_closed() {
        assert!(!is_contractive(f64::NAN, 1.0));
        assert!(!is_contractive(f64::INFINITY, 1.0));
        assert!(!is_contractive(0.5, f64::NAN));
    }

    #[test]
    fn bound_domain_is_open_and_below_one() {
        assert!(is_valid_contractivity_bound(0.5));
        assert!(!is_valid_contractivity_bound(1.0));
        assert!(!is_valid_contractivity_bound(1.5));
        assert!(!is_valid_contractivity_bound(0.0));
        assert!(!is_valid_contractivity_bound(-1.0));
        assert!(!is_valid_contractivity_bound(f64::NAN));
    }

    #[test]
    fn lambda_trace_delegates_to_the_shared_predicate() {
        assert!(trace(0.9).is_contractive());
        assert!(!trace(1.0).is_contractive());
        // An unmeasured trace cannot be certified even at slope 0.
        let unmeasured = LambdaTrace {
            lambda_p: 0.0,
            l_p: 1.0,
            zero_spacings: Vec::new(),
        };
        assert!(!unmeasured.is_contractive());
    }

    #[test]
    fn hash_format_is_validated() {
        assert!(is_well_formed_hash(HASH_A));
        assert!(!is_well_formed_hash(&HASH_A[7..]), "bare hex is not the id format");
        assert!(!is_well_formed_hash("f7a8b9c0d1e2f3g4"));
        assert!(!is_well_formed_hash(&HASH_A.to_uppercase()));
        assert!(!is_well_formed_hash(""));
    }

    #[test]
    fn certified_receipt_is_coherent() {
        let r = ContractivityReceipt::certified(
            HASH_A.to_string(),
            SurfaceState::ChromiumExtension,
            trace(0.9),
            HASH_B.to_string(),
            HASH_A.to_string(),
            "archivum:tail:9".to_string(),
        );
        assert_eq!(r.status, CERTIFIED);
        assert_eq!(r.triple_lock_phase, TripleLockPhase::Completed);
        assert!(r.is_coherent());
    }

    #[test]
    fn rejected_receipt_binds_phase_to_status() {
        let r = ContractivityReceipt::rejected(
            HASH_A.to_string(),
            SurfaceState::ESP32Edge,
            trace(1.4),
            HASH_B.to_string(),
            HASH_A.to_string(),
            "archivum:tail:9".to_string(),
        );
        assert_eq!(r.status, REJECTED);
        assert_eq!(r.triple_lock_phase, TripleLockPhase::Failed);
    }

    #[test]
    fn contradictory_receipt_from_the_wire_is_detected() {
        // Deserialization bypasses the typed constructors, so the incoherent
        // state the old schema permitted can still arrive from a peer. It must
        // be caught by `is_coherent`.
        let mut r = ContractivityReceipt::certified(
            HASH_A.to_string(),
            SurfaceState::VSCodeExtension,
            trace(0.9),
            HASH_B.to_string(),
            HASH_A.to_string(),
            "archivum:tail:9".to_string(),
        );
        r.triple_lock_phase = TripleLockPhase::Failed;
        assert!(!r.is_coherent(), "OK receipt with Failed phase must be incoherent");
    }

    #[test]
    fn legacy_ok_constructor_leaves_receipt_incoherent() {
        // `ok` is retained for existing callers but produces a receipt with no
        // attestations, which `is_coherent` must reject. This is the intended
        // visible failure called out in ADR-RML-159.
        let r = ContractivityReceipt::ok(
            HASH_A.to_string(),
            SurfaceState::ChromiumExtension,
            "archivum:tail:9".to_string(),
            0.9,
            1.0,
            vec![7],
        );
        assert_eq!(r.status, "OK");
        assert!(!r.is_coherent(), "unattested receipt must not certify");
    }
}
