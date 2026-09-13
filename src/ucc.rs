use num_rational::Rational64;
use thiserror::Error;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PrimeChannel {
    pub prime_index: u64,
    pub weight: Rational64, // Exact rational weight p^alpha
    pub defect: Rational64, // Associator defect Delta_p
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SkeletonState {
    pub operator_norm: Rational64, // Exact ||Xi(t)||
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TensorMapState {
    pub lipschitz_bound: Rational64, // Exact L_T
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RuntimeState {
    pub skeleton: SkeletonState,
    pub tensor_map: TensorMapState,
    pub active_channels: Vec<PrimeChannel>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ZeroModeExtraction {
    pub composite_lipschitz: Rational64, // L_Phi
    pub is_contractive: bool,
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum ConstitutionalGateError {
    #[error("SIG_GOV_KILL: Non-contractive composite operator norm L_Phi ({0}) >= 1")]
    ContractivityBreach(Rational64),

    #[error("SIG_GOV_KILL: Invalid rational denominator or arithmetic overflow")]
    ArithmeticFault,
}

/// Trait for extracting zero-mode invariants and auditing L0 contractivity.
pub trait ZeroModeExtractable {
    /// Extracts the zero-mode projection and evaluates composite Lipschitz bound L_Phi.
    fn extract_zero_mode(&self) -> Result<ZeroModeExtraction, ConstitutionalGateError>;

    /// Enforces the L0 Constitutional Gate: fails closed before any state mutation.
    fn assert_l0_constitutional_gate(&self) -> Result<(), ConstitutionalGateError> {
        let extraction = self.extract_zero_mode()?;
        if !extraction.is_contractive {
            return Err(ConstitutionalGateError::ContractivityBreach(
                extraction.composite_lipschitz,
            ));
        }
        Ok(())
    }
}

impl ZeroModeExtractable for RuntimeState {
    fn extract_zero_mode(&self) -> Result<ZeroModeExtraction, ConstitutionalGateError> {
        // Base term: ||Xi(t)|| * L_T
        let mut composite_l = self.skeleton.operator_norm * self.tensor_map.lipschitz_bound;

        // Sum channel contributions: sum (weight * defect)
        for channel in &self.active_channels {
            let channel_contribution = channel.weight * channel.defect;
            composite_l = composite_l + channel_contribution;
        }

        // Strict contractivity bound: L_Phi < 1
        let one = Rational64::from_integer(1);
        let is_contractive = composite_l < one;

        Ok(ZeroModeExtraction {
            composite_lipschitz: composite_l,
            is_contractive,
        })
    }
}

#[cfg(kani)]
mod verification {
    use super::*;

    #[kani::proof]
    #[kani::unwind(4)]
    fn verify_l0_constitutional_gate_soundness() {
        // Generate nondeterministic rational components
        let skel_num: i64 = kani::any();
        let skel_den: i64 = kani::any();
        let tm_num: i64 = kani::any();
        let tm_den: i64 = kani::any();

        // Enforce valid positive denominators and bounded positive ranges
        kani::assume(skel_den > 0 && tm_den > 0);
        kani::assume(skel_num >= 0 && skel_num <= 10_000);
        kani::assume(skel_den >= 1 && skel_den <= 10_000);
        kani::assume(tm_num >= 0 && tm_num <= 10_000);
        kani::assume(tm_den >= 1 && tm_den <= 10_000);

        let skeleton = SkeletonState {
            operator_norm: Rational64::new(skel_num, skel_den),
        };

        let tensor_map = TensorMapState {
            lipschitz_bound: Rational64::new(tm_num, tm_den),
        };

        let state = RuntimeState {
            skeleton,
            tensor_map,
            active_channels: vec![],
        };

        match state.assert_l0_constitutional_gate() {
            Ok(()) => {
                // If L0 gate passes, composite L_Phi MUST be strictly < 1
                let extraction = state.extract_zero_mode().unwrap();
                kani::assert(
                    extraction.composite_lipschitz < Rational64::from_integer(1),
                    "Gate passed only when L_Phi < 1",
                );
            }
            Err(ConstitutionalGateError::ContractivityBreach(l_phi)) => {
                // If gate rejected with breach, L_Phi MUST be >= 1
                kani::assert(
                    l_phi >= Rational64::from_integer(1),
                    "Gate rejected only when L_Phi >= 1",
                );
            }
            Err(_) => {}
        }
    }
}
