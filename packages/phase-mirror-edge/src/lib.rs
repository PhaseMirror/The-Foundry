#![no_std]

use core::fmt;

/// Minimal surface state for no_std targets.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
#[repr(u8)]
pub enum EdgeSurfaceState {
    ChromiumExtension = 0,
    VSCodeExtension = 1,
    ESP32Edge = 2,
    LocalFirstData = 3,
}

impl fmt::Display for EdgeSurfaceState {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            EdgeSurfaceState::ChromiumExtension => write!(f, "ChromiumExtension"),
            EdgeSurfaceState::VSCodeExtension => write!(f, "VSCodeExtension"),
            EdgeSurfaceState::ESP32Edge => write!(f, "ESP32Edge"),
            EdgeSurfaceState::LocalFirstData => write!(f, "LocalFirstData"),
        }
    }
}

/// Minimal Triple-Lock phase for no_std targets.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
#[repr(u8)]
pub enum EdgeTripleLockPhase {
    Genius = 0,
    Guardian = 1,
    Examiner = 2,
    Completed = 3,
    Failed = 4,
}

impl fmt::Display for EdgeTripleLockPhase {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            EdgeTripleLockPhase::Genius => write!(f, "Genius"),
            EdgeTripleLockPhase::Guardian => write!(f, "Guardian"),
            EdgeTripleLockPhase::Examiner => write!(f, "Examiner"),
            EdgeTripleLockPhase::Completed => write!(f, "Completed"),
            EdgeTripleLockPhase::Failed => write!(f, "Failed"),
        }
    }
}

/// Minimal ContractivityReceipt for no_std targets.
#[derive(Debug, Clone, PartialEq)]
#[repr(C)]
pub struct EdgeContractivityReceipt {
    pub status: [u8; 8],
    pub witness_id: [u8; 32],
    pub lambda_p: f64,
    pub l_p: f64,
    pub zero_spacings_len: u8,
    pub zero_spacings: [u64; 8],
    pub surface: EdgeSurfaceState,
    pub triple_lock_phase: EdgeTripleLockPhase,
}

impl EdgeContractivityReceipt {
    pub const fn ok(
        witness_id: [u8; 32],
        surface: EdgeSurfaceState,
        lambda_p: f64,
        l_p: f64,
        zero_spacings: [u64; 8],
        zero_spacings_len: u8,
    ) -> Self {
        Self {
            status: *b"OK\0\0\0\0\0\0",
            witness_id,
            lambda_p,
            l_p,
            zero_spacings_len,
            zero_spacings,
            surface,
            triple_lock_phase: EdgeTripleLockPhase::Completed,
        }
    }

    pub const fn blocked(witness_id: [u8; 32], surface: EdgeSurfaceState) -> Self {
        Self {
            status: *b"BLOCKED\0",
            witness_id,
            lambda_p: 0.0,
            l_p: 0.0,
            zero_spacings_len: 0,
            zero_spacings: [0; 8],
            surface,
            triple_lock_phase: EdgeTripleLockPhase::Failed,
        }
    }

    pub fn is_contractive(&self) -> bool {
        self.lambda_p * self.l_p < 1.0 && self.zero_spacings_len > 0
    }
}

/// Minimal L0 invariant check result for no_std targets.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum EdgeInvariantResult {
    Passed = 0,
    FailedSchemaHash = 1,
    FailedPermissionBits = 2,
    FailedDrift = 3,
    FailedNonce = 4,
    FailedWitness = 5,
}

/// Minimal L0 state for no_std targets.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(C)]
pub struct EdgeState {
    pub permission_bits: u16,
    pub drift_magnitude: u32, // scaled by 1000 (e.g., 300 = 0.3)
    pub nonce_age_ms: u32,
}

/// Minimal Triple-Lock state machine for no_std targets.
#[derive(Debug, Clone, PartialEq)]
pub struct EdgeTripleLockMachine {
    pub phase: EdgeTripleLockPhase,
    pub receipt: EdgeContractivityReceipt,
}

impl EdgeTripleLockMachine {
    pub const fn new() -> Self {
        Self {
            phase: EdgeTripleLockPhase::Genius,
            receipt: EdgeContractivityReceipt {
                status: [0; 8],
                witness_id: [0; 32],
                lambda_p: 0.0,
                l_p: 0.0,
                zero_spacings_len: 0,
                zero_spacings: [0; 8],
                surface: EdgeSurfaceState::ESP32Edge,
                triple_lock_phase: EdgeTripleLockPhase::Genius,
            },
        }
    }

    pub fn advance(&mut self, receipt: &EdgeContractivityReceipt) -> Result<EdgeTripleLockPhase, LockError> {
        self.receipt = receipt.clone();
        self.phase = receipt.triple_lock_phase;
        Ok(self.phase)
    }

    pub fn current_phase(&self) -> EdgeTripleLockPhase {
        self.phase
    }
}

impl Default for EdgeTripleLockMachine {
    fn default() -> Self {
        Self::new()
    }
}

/// Lock error for no_std targets.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(C)]
pub struct LockError {
    pub code: u8,
}

impl LockError {
    pub const fn new(code: u8) -> Self {
        Self { code }
    }
}

impl fmt::Display for LockError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "LockError(code={})", self.code)
    }
}

/// Minimal L0 check for no_std targets.
pub trait EdgeL0Check {
    fn check(state: &EdgeState) -> EdgeInvariantResult;
}

/// Default implementation of EdgeL0Check.
pub struct DefaultEdgeL0Checker;

impl EdgeL0Check for DefaultEdgeL0Checker {
    fn check(state: &EdgeState) -> EdgeInvariantResult {
        const RESERVED_BITS_MASK: u16 = 0b1111_0000_0000_0000;
        const DRIFT_THRESHOLD: u32 = 300; // 0.3 * 1000
        const MAX_NONCE_AGE_MS: u32 = 3_600_000;

        if state.permission_bits & RESERVED_BITS_MASK != 0 {
            return EdgeInvariantResult::FailedPermissionBits;
        }
        if state.drift_magnitude > DRIFT_THRESHOLD {
            return EdgeInvariantResult::FailedDrift;
        }
        if state.nonce_age_ms > MAX_NONCE_AGE_MS {
            return EdgeInvariantResult::FailedNonce;
        }
        EdgeInvariantResult::Passed
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn edge_receipt_contractivity() {
        let receipt = EdgeContractivityReceipt::ok(
            [0xAB; 32],
            EdgeSurfaceState::ESP32Edge,
            0.95,
            0.90,
            [1, 3, 5, 7, 0, 0, 0, 0],
            4,
        );
        assert!(receipt.is_contractive());

        let blocked = EdgeContractivityReceipt::blocked([0xCD; 32], EdgeSurfaceState::ESP32Edge);
        assert!(!blocked.is_contractive());
    }

    #[test]
    fn edge_l0_check_passes() {
        let state = EdgeState {
            permission_bits: 0x0FFF,
            drift_magnitude: 200,
            nonce_age_ms: 1_000,
        };
        assert_eq!(
            DefaultEdgeL0Checker::check(&state),
            EdgeInvariantResult::Passed
        );
    }

    #[test]
    fn edge_l0_check_fails_reserved_bits() {
        let state = EdgeState {
            permission_bits: 0xF000,
            drift_magnitude: 200,
            nonce_age_ms: 1_000,
        };
        assert_eq!(
            DefaultEdgeL0Checker::check(&state),
            EdgeInvariantResult::FailedPermissionBits
        );
    }

    #[test]
    fn edge_triple_lock_machine() {
        let mut machine = EdgeTripleLockMachine::new();
        assert_eq!(machine.current_phase(), EdgeTripleLockPhase::Genius);

        let receipt = EdgeContractivityReceipt::ok(
            [0x12; 32],
            EdgeSurfaceState::ESP32Edge,
            0.95,
            0.90,
            [1, 2, 3, 0, 0, 0, 0, 0],
            3,
        );
        machine.advance(&receipt).unwrap();
        assert_eq!(machine.current_phase(), EdgeTripleLockPhase::Completed);
    }
}
