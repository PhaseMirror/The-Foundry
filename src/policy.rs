use crate::tools::{Operation, Violation};
use std::collections::HashSet;

pub struct PolicyValidator {
    banned_phrases: HashSet<&'static str>,
    allowed_op_types: HashSet<&'static str>,
}

impl PolicyValidator {
    pub fn new() -> Self {
        let mut banned_phrases = HashSet::new();
        banned_phrases.insert("unverified_claim");
        banned_phrases.insert("guaranteed profit");
        banned_phrases.insert("get rich quick");

        let mut allowed_op_types = HashSet::new();
        allowed_op_types.insert("email.send");
        allowed_op_types.insert("crm.update");
        allowed_op_types.insert("content.publish");
        allowed_op_types.insert("proof_of_practice.issue");

        Self {
            banned_phrases,
            allowed_op_types,
        }
    }

    pub fn validate_operations(
        &self,
        ops: &[Operation],
        _context_hash: &str,
    ) -> Vec<Violation> {
        let mut violations = Vec::new();

        for op in ops {
            if !self.allowed_op_types.contains(op.op_type.as_str()) {
                violations.push(Violation {
                    field: "op_type".into(),
                    expected: "allowed operation type".into(),
                    actual: format!("unknown op_type: {}", op.op_type),
                });
            }
        }

        for op in ops {
            let combined = format!("{} {}", op.op_type, op.target);
            for banned in &self.banned_phrases {
                if combined.contains(banned) {
                    violations.push(Violation {
                        field: "brand_invariant".into(),
                        expected: "no banned phrases".into(),
                        actual: format!("found banned phrase '{}' in operation", banned),
                    });
                }
            }
        }

        let mut saw_crm_before = false;
        for op in ops {
            if op.op_type == "email.send" {
                if !saw_crm_before {
                    violations.push(Violation {
                        field: "funnel_reachability".into(),
                        expected: "crm.update before email.send".into(),
                        actual: "email.send attempted without prior crm.update".into(),
                    });
                }
            } else if op.op_type == "crm.update" {
                saw_crm_before = true;
            }
        }

        violations
    }

    pub fn validate_content(&self, draft: &str) -> Vec<Violation> {
        let mut violations = Vec::new();
        let draft_lower = draft.to_lowercase();

        for banned in &self.banned_phrases {
            if draft_lower.contains(banned) {
                violations.push(Violation {
                    field: "brand_invariant".into(),
                    expected: "no banned phrases".into(),
                    actual: format!("found banned phrase '{}' in content draft", banned),
                });
            }
        }

        violations
    }
}

impl Default for PolicyValidator {
    fn default() -> Self {
        Self::new()
    }
}

use num_rational::Ratio;

#[derive(Debug)]
pub struct ContractivityViolation;

#[derive(Debug, Clone)]
pub struct ZeroModeQuantities {
    pub xi_norm: Ratio<i64>,
    pub l_t: Ratio<i64>,
    pub lambda_p_sum: Ratio<i64>,
}

pub fn certify_state(zm: &ZeroModeQuantities, lambda_m: &Ratio<i64>) -> Result<(), ContractivityViolation> {
    let g_zm = zm.l_t * zm.lambda_p_sum;
    let rho = (zm.xi_norm + g_zm) * lambda_m;

    // Sedona Spine Mandate: ρ < 1 - 1e-6
    let margin = Ratio::new(999_999, 1_000_000);
    
    if rho >= margin {
        return Err(ContractivityViolation);
    }
    Ok(())
}

#[cfg(kani)]
mod ucc_kani_proofs {
    use super::*;

    #[kani::proof]
    fn verify_sedona_spine_margin() {
        let xi_num: i32 = kani::any();
        let xi_den: i32 = kani::any();
        kani::assume(xi_den != 0 && xi_num >= 0 && xi_den > 0);

        let zm = ZeroModeQuantities {
            xi_norm: Ratio::new(xi_num as i64, xi_den as i64),
            l_t: Ratio::new(1, 10),
            lambda_p_sum: Ratio::new(2, 10),
        };
        
        let lambda_m = Ratio::new(99, 100);
        let result = certify_state(&zm, &lambda_m);
        
        let g_zm_val = (1.0 / 10.0) * (2.0 / 10.0);
        let rho_approx = ((xi_num as f64 / xi_den as f64) + g_zm_val) * 0.99;

        if rho_approx >= 0.999999 {
            kani::assert(result.is_err(), "SIG_GOV_KILL: Expansive state permitted.");
        } else {
            kani::assert(result.is_ok(), "SIG_GOV_KILL: False positive halt.");
        }
    }
}
