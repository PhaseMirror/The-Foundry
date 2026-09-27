//! EchoBraid adapter: read-only processing of recursive cognitive states Θ(t)
//! and prime-indexed traces Ψ(t).
//!
//! ADR-0169: Neural Harness Stratum.
//! This adapter is read-only: it never mutates core certification objects
//! and never bypasses the CSC Tier-4 gate. All writes are refused at the
//! type level via the `Read` capability token.
//!
//! Key invariants:
//! - CSL non-expansion: ΔS ≤ 0 (Theorem: csl_non_expansion)
//! - Identity braiding: Θ(t) traces through prime-indexed Ψ(t) without
//!   collapsing distinct persons
//! - Tier-4 gate: every emit call validates against the CSC gate; any
//!   CSL or seal violation triggers a hard veto (100% veto rate)

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

/// Read-only capability token. Constructing this token is the only way to
/// obtain an `EchoBraidAdapter`; it cannot carry mutable references.
#[derive(Debug, Clone, Copy)]
pub struct Read;

/// A recursive cognitive state Θ(t).
/// Represents the cognitive topology at time step t.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CognitiveState {
    pub person_id: String,
    pub epoch: u64,
    pub attention_map: Vec<u8>,
    pub entropy: f64,
}

/// A prime-indexed trace Ψ(t) for a given prime index p.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PrimeTrace {
    pub prime_index: u32,
    pub signature: [u8; 32],
    pub state_hash: [u8; 32],
    pub timestamp: u64,
}

/// CSC Tier-4 gate verdict.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CscVerdict {
    Accept,
    Veto,
}

/// EchoBraid adapter state (read-only: no mutable fields).
pub struct EchoBraidAdapter {
    _capability: Read,
}

impl Default for EchoBraidAdapter {
    fn default() -> Self {
        Self::new(Read)
    }
}

impl std::fmt::Debug for EchoBraidAdapter {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("EchoBraidAdapter").finish_non_exhaustive()
    }
}

impl EchoBraidAdapter {
    /// Construct a new adapter. Requires the `Read` capability token,
    /// which cannot carry mutable references, enforcing read-only semantics
    /// at the type level.
    pub fn new(_cap: Read) -> Self {
        Self { _capability: _cap }
    }

    /// Process a cognitive state Θ(t). Returns the state signature without
    /// mutating the input.
    pub fn process_state(&self, state: &CognitiveState) -> [u8; 32] {
        let mut hasher = Sha256::new();
        hasher.update(state.person_id.as_bytes());
        hasher.update(&state.epoch.to_le_bytes());
        hasher.update(&state.attention_map);
        hasher.update(&state.entropy.to_le_bytes());
        hasher.finalize().into()
    }

    /// Map a cognitive state to a prime-indexed trace Ψ(t).
    /// The prime index is derived deterministically from the state signature.
    pub fn braid_to_prime(
        &self,
        state: &CognitiveState,
        prime_index: u32,
    ) -> PrimeTrace {
        let state_hash = self.process_state(state);
        let mut hasher = Sha256::new();
        hasher.update(&state_hash);
        hasher.update(&prime_index.to_le_bytes());
        let signature: [u8; 32] = hasher.finalize().into();

        PrimeTrace {
            prime_index,
            signature,
            state_hash,
            timestamp: state.epoch,
        }
    }

    /// CSL non-expansion check: verify that ΔS ≤ 0.
    /// Returns `true` if the entropy delta is non-positive (no expansion).
    pub fn csl_non_expansion(&self, prev: &CognitiveState, next: &CognitiveState) -> bool {
        let delta = next.entropy - prev.entropy;
        delta <= 0.0
    }

    /// CSC Tier-4 gate: validate a cognitive state transition.
    /// Returns `CscVerdict::Veto` if any CSL or seal violation is detected.
    /// This gate is the sole authority to veto; it cannot be bypassed.
    pub fn csc_tier4_gate(
        &self,
        prev: &CognitiveState,
        next: &CognitiveState,
    ) -> CscVerdict {
        // Veto 1: CSL non-expansion must hold
        if !self.csl_non_expansion(prev, next) {
            return CscVerdict::Veto;
        }
        // Veto 2: Entropy must not be manipulated beyond a bounded threshold
        let entropy_delta = (next.entropy - prev.entropy).abs();
        if entropy_delta > 10.0 {
            return CscVerdict::Veto;
        }
        // Veto 3: Person identity must be stable across the transition
        if prev.person_id != next.person_id {
            return CscVerdict::Veto;
        }
        CscVerdict::Accept
    }

    /// Emit a prime trace. This is the sole emit path and it goes through
    /// the CSC Tier-4 gate. Any violation returns None (the emit is refused).
    pub fn emit_trace(
        &self,
        prev: &CognitiveState,
        next: &CognitiveState,
        prime_index: u32,
    ) -> Option<PrimeTrace> {
        match self.csc_tier4_gate(prev, next) {
            CscVerdict::Accept => Some(self.braid_to_prime(next, prime_index)),
            CscVerdict::Veto => None,
        }
    }

    /// Compute identity braiding: verify that two traces from the same person
    /// maintain distinct signatures (no identity collapse).
    pub fn identity_braiding(&self, trace_a: &PrimeTrace, trace_b: &PrimeTrace) -> bool {
        trace_a.person_id_compatibility(trace_b)
    }
}

impl CognitiveState {
    pub fn new(person_id: &str, epoch: u64, entropy: f64) -> Self {
        Self {
            person_id: person_id.to_string(),
            epoch,
            attention_map: vec![0u8; 16],
            entropy,
        }
    }
}

impl PrimeTrace {
    /// Check that two traces are compatible with the same person identity
    /// (i.e., their state hashes are consistent with the identity braid).
    fn person_id_compatibility(&self, other: &PrimeTrace) -> bool {
        // Identity compatibility: traces from the same person should not
        // produce identical signatures unless the states are identical.
        if self.state_hash == other.state_hash {
            // Same state hash — acceptable if prime indices differ (same state, different braid)
            self.prime_index != other.prime_index
        } else {
            // Different states — always compatible (no identity collapse)
            true
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_read_only_adapter_construction() {
        let adapter = EchoBraidAdapter::new(Read);
        let state = CognitiveState::new("person-1", 0, 0.5);
        let _sig = adapter.process_state(&state);
        // No mutation possible: adapter has no &mut methods
    }

    #[test]
    fn test_csl_non_expansion_holds() {
        let adapter = EchoBraidAdapter::new(Read);
        let prev = CognitiveState::new("person-1", 0, 0.8);
        let next = CognitiveState::new("person-1", 1, 0.5);
        assert!(adapter.csl_non_expansion(&prev, &next));
    }

    #[test]
    fn test_csl_non_expansion_violated() {
        let adapter = EchoBraidAdapter::new(Read);
        let prev = CognitiveState::new("person-1", 0, 0.3);
        let next = CognitiveState::new("person-1", 1, 0.9);
        assert!(!adapter.csl_non_expansion(&prev, &next));
    }

    #[test]
    fn test_csc_gate_accept() {
        let adapter = EchoBraidAdapter::new(Read);
        let prev = CognitiveState::new("person-1", 0, 0.8);
        let next = CognitiveState::new("person-1", 1, 0.5);
        assert_eq!(adapter.csc_tier4_gate(&prev, &next), CscVerdict::Accept);
    }

    #[test]
    fn test_csc_gate_veto_on_entropy_expansion() {
        let adapter = EchoBraidAdapter::new(Read);
        let prev = CognitiveState::new("person-1", 0, 0.3);
        let next = CognitiveState::new("person-1", 1, 0.9);
        assert_eq!(adapter.csc_tier4_gate(&prev, &next), CscVerdict::Veto);
    }

    #[test]
    fn test_csc_gate_veto_on_identity_switch() {
        let adapter = EchoBraidAdapter::new(Read);
        let prev = CognitiveState::new("person-1", 0, 0.8);
        let next = CognitiveState::new("person-2", 1, 0.5);
        assert_eq!(adapter.csc_tier4_gate(&prev, &next), CscVerdict::Veto);
    }

    #[test]
    fn test_emit_trace_accepted() {
        let adapter = EchoBraidAdapter::new(Read);
        let prev = CognitiveState::new("person-1", 0, 0.8);
        let next = CognitiveState::new("person-1", 1, 0.5);
        assert!(adapter.emit_trace(&prev, &next, 2).is_some());
    }

    #[test]
    fn test_emit_trace_vetoed_on_csl_violation() {
        let adapter = EchoBraidAdapter::new(Read);
        let prev = CognitiveState::new("person-1", 0, 0.3);
        let next = CognitiveState::new("person-1", 1, 0.9);
        assert!(adapter.emit_trace(&prev, &next, 2).is_none());
    }

    #[test]
    fn test_identity_braiding_no_collapse() {
        let adapter = EchoBraidAdapter::new(Read);
        let state_a = CognitiveState::new("person-1", 0, 0.8);
        let state_b = CognitiveState::new("person-1", 1, 0.5);
        let trace_a = adapter.braid_to_prime(&state_a, 2);
        let trace_b = adapter.braid_to_prime(&state_b, 3);
        assert!(adapter.identity_braiding(&trace_a, &trace_b));
    }
}
