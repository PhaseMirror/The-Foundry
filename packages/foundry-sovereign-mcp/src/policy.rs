use crate::tools::{LeadField, Operation, Violation};
use std::collections::HashSet;

/// Fail-closed policy validator for Founder OS certified execution.
///
/// Encapsulates the brand, funnel, PII, and proof-of-practice rule set that
/// every state mutation must satisfy before the certifier will seal an
/// envelope. The canonical serialization of this rule set is hashed into
/// every envelope via [`PolicyValidator::policy_hash`], binding the exact
/// policy revision that governed a certified side effect.
pub struct PolicyValidator {
    banned_phrases: HashSet<&'static str>,
    allowed_op_types: HashSet<&'static str>,
    pii_field_blacklist: HashSet<&'static str>,
    allowed_proof_actions: HashSet<&'static str>,
}

impl PolicyValidator {
    pub fn new() -> Self {
        let mut banned_phrases = HashSet::new();
        banned_phrases.insert("unverified_claim");
        banned_phrases.insert("guaranteed profit");
        banned_phrases.insert("get rich quick");
        banned_phrases.insert("free money");
        banned_phrases.insert("no downside");

        let mut allowed_op_types = HashSet::new();
        allowed_op_types.insert("email.send");
        allowed_op_types.insert("crm.update");
        allowed_op_types.insert("content.publish");
        allowed_op_types.insert("proof_of_practice.issue");
        allowed_op_types.insert("sequence.compile");
        allowed_op_types.insert("client.receipt.export");

        let mut pii_field_blacklist = HashSet::new();
        pii_field_blacklist.insert("email");
        pii_field_blacklist.insert("phone");
        pii_field_blacklist.insert("ssn");
        pii_field_blacklist.insert("credit_card");
        pii_field_blacklist.insert("iban");
        pii_field_blacklist.insert("passport");
        pii_field_blacklist.insert("dob");
        pii_field_blacklist.insert("home_address");

        let mut allowed_proof_actions = HashSet::new();
        allowed_proof_actions.insert("resolve_bottleneck");
        allowed_proof_actions.insert("calibration_contribution");
        allowed_proof_actions.insert("mentor_share");
        allowed_proof_actions.insert("verified_practice");

        Self {
            banned_phrases,
            allowed_op_types,
            pii_field_blacklist,
            allowed_proof_actions,
        }
    }

    /// Deterministic canonical serialization of the active rule set.
    ///
    /// BCS over the sorted rule vectors — identical for two validators whose
    /// rules coincide, regardless of insertion order.
    pub fn canonical_policy_bytes(&self) -> Vec<u8> {
        let mut banned: Vec<&str> = self.banned_phrases.iter().copied().collect();
        banned.sort_unstable();
        let mut ops: Vec<&str> = self.allowed_op_types.iter().copied().collect();
        ops.sort_unstable();
        let mut pii: Vec<&str> = self.pii_field_blacklist.iter().copied().collect();
        pii.sort_unstable();
        let mut proofs: Vec<&str> = self.allowed_proof_actions.iter().copied().collect();
        proofs.sort_unstable();
        bcs::to_bytes(&(banned, ops, pii, proofs)).expect("BCS serialization failed")
    }

    /// Poseidon-2 digest of the canonical policy rule set, bound into every
    /// envelope this validator certifies.
    pub fn policy_hash(&self) -> String {
        crate::poseidon::poseidon_hash_hex(&self.canonical_policy_bytes())
    }

    /// Validate an ordered chain of proposed operations.
    ///
    /// Enforces, in order:
    /// 1. every op type is on the allowlist;
    /// 2. no banned phrase appears in any operation;
    /// 3. funnel reachability — `crm.update` must precede `email.send`.
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
            let combined = format!("{}|{}", op.op_type, op.target);
            for banned in &self.banned_phrases {
                if combined.to_lowercase().contains(banned) {
                    violations.push(Violation {
                        field: "brand_invariant".into(),
                        expected: "no banned phrases".into(),
                        actual: format!("found banned phrase '{banned}' in operation"),
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

    /// Validate a content asset draft against brand invariants.
    pub fn validate_content(&self, draft: &str) -> Vec<Violation> {
        let mut violations = Vec::new();
        let draft_lower = draft.to_lowercase();

        for banned in &self.banned_phrases {
            if draft_lower.contains(banned) {
                violations.push(Violation {
                    field: "brand_invariant".into(),
                    expected: "no banned phrases".into(),
                    actual: format!("found banned phrase '{banned}' in content draft"),
                });
            }
        }

        violations
    }

    /// Validate a lead payload against the PII boundary.
    ///
    /// Only fields named by `allowed_fields` may be hydrated, and no field
    /// name on the PII blacklist (nor a value that fingerprints as PII) is
    /// permitted to pass the boundary.
    pub fn validate_lead(&self, fields: &[LeadField], allowed_fields: &[String]) -> Vec<Violation> {
        let allowed: HashSet<&str> = allowed_fields.iter().map(String::as_str).collect();
        let mut violations = Vec::new();

        if allowed.is_empty() {
            violations.push(Violation {
                field: "pii_boundary".into(),
                expected: "non-empty allowed_fields allowlist".into(),
                actual: "empty allowlist would permit zero-field writes".into(),
            });
        }

        for f in fields {
            if !allowed.contains(f.field.as_str()) {
                violations.push(Violation {
                    field: "pii_boundary".into(),
                    expected: format!("field in allowlist {:?}", allowed_fields),
                    actual: format!("field '{}' not authorized for hydration", f.field),
                });
            }
            if self.pii_field_blacklist.contains(f.field.as_str()) {
                violations.push(Violation {
                    field: "pii_field_blacklist".into(),
                    expected: "no PII field names".into(),
                    actual: format!("field '{}' is on the PII blacklist", f.field),
                });
            }
            if looks_like_pii(&f.field, &f.value) {
                violations.push(Violation {
                    field: "pii_value_fingerprint".into(),
                    expected: "value free of PII fingerprints".into(),
                    actual: format!("value of '{}' fingerprints as sensitive PII", f.field),
                });
            }
        }

        violations
    }

    /// Validate a proof-of-practice action type.
    pub fn validate_proof_action(&self, action_type: &str) -> Vec<Violation> {
        if self.allowed_proof_actions.contains(action_type) {
            Vec::new()
        } else {
            vec![Violation {
                field: "proof_action".into(),
                expected: "certified proof-of-practice action type".into(),
                actual: format!("unknown action_type: '{action_type}'"),
            }]
        }
    }

    /// Validate a sequence compilation delta set (reuses the operation
    /// allowlist + funnel rules).
    pub fn validate_sequence_deltas(&self, deltas: &[Operation]) -> Vec<Violation> {
        self.validate_operations(deltas, "")
    }

    /// Derive the explicit side-effect permission set the certifier grants
    /// for a validated operation chain.
    pub fn permitted_side_effects(&self, ops: &[Operation]) -> Vec<String> {
        ops.iter()
            .map(|op| {
                if self.allowed_op_types.contains(op.op_type.as_str()) {
                    format!("{}:allowed", op.op_type)
                } else {
                    format!("{}:denied", op.op_type)
                }
            })
            .collect()
    }
}

impl Default for PolicyValidator {
    fn default() -> Self {
        Self::new()
    }
}

fn looks_like_pii(field: &str, value: &str) -> bool {
    let lower = value.to_lowercase();
    // Conservative structural fingerprints; deliberately simple and documented
    // as replaceable with a dedicated PII classifier.
    let has_email = lower.contains('@') && lower.contains('.') && !lower.contains(' ');
    let digits: usize = value.chars().filter(|c| c.is_ascii_digit()).count();
    let has_phone_like = digits >= 10 && value.len() <= 20 && !value.contains(' ') && field != "phone";
    let has_ssn_like = digits == 9 && value.contains('-');

    has_email || has_phone_like || has_ssn_like
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

/// Sedona Spine zero-mode certification gate: ρ = (ξ + L_T·Σλ_p)·Λ_m < 1 - 1e-6.
///
/// This is the T=0 mathematical certification that the state transition is
/// contractive in ℚ. Exact rational arithmetic — no float rounding anywhere.
pub fn certify_state(zm: &ZeroModeQuantities, lambda_m: &Ratio<i64>) -> Result<(), ContractivityViolation> {
    let g_zm = &zm.l_t * &zm.lambda_p_sum;
    let rho = (&zm.xi_norm + &g_zm) * lambda_m;

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
    #[kani::unwind(64)]
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