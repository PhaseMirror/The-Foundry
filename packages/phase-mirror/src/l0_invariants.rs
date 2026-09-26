use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::Utc;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Nonce {
    pub value: String,
    pub issued_at: i64, // Unix timestamp in milliseconds
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct State {
    pub schema_version: String,
    pub schema_hash: String,
    pub permission_bits: u16,
    pub drift_magnitude: f64,
    pub nonce: Nonce,
    pub contraction_witness_score: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InvariantCheckResult {
    pub passed: bool,
    pub failed_checks: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub violations: Option<HashMap<String, String>>,
}

const EXPECTED_SCHEMA_VERSION: &str = "1.0.0";
const RESERVED_PERMISSION_BITS_MASK: u16 = 0b1111000000000000;
const DRIFT_THRESHOLD: f64 = 0.3;
const NONCE_LIFETIME_MS: i64 = 3600000;
const MAX_FUTURE_SKEW_MS: i64 = 60_000;
const MIN_NONCE_LENGTH: usize = 64;

/// Deployment policy for the L0 kernel.
///
/// The expected schema hash is a required input rather than a compile-time
/// constant. It used to be the literal `"f7a8b9c0d1e2f3g4"`, which is not a
/// hexadecimal string and therefore cannot be the output of any digest. A
/// caller satisfied the check by echoing the placeholder back, so the predicate
/// bound nothing. See ADR-RML-159.
///
/// The value must be the digest of the schema artifact this deployment actually
/// serves. `sha256::<64-hex>` values (the `witness_id` convention) are accepted
/// as-is; a bare 64-hex digest is also accepted. Anything else is rejected by
/// [`L0Policy::validate`], so a placeholder cannot reach the comparison.
#[derive(Debug, Clone)]
pub struct L0Policy {
    pub expected_schema_version: String,
    pub expected_schema_hash: String,
    pub drift_threshold: f64,
    pub nonce_lifetime_ms: i64,
    pub max_future_skew_ms: i64,
    /// Exclusive upper bound on the contraction witness score.
    ///
    /// This is the boundary of the contractive interval, not a score. `1.0` is
    /// the correct and strictest value, because the predicate is
    /// `score < contraction_witness_exclusive_max`, and `score < 1.0` is exactly
    /// the Lean invariant `κ < 1`
    /// (`PIRTM/rust/pirtm-clinical/lean-harness/Math/Lipschitz.lean:12`).
    ///
    /// This was `score == 1.0`, exact float equality against the one value the
    /// formal layer rejects, so every genuinely contractive score failed and only
    /// the non-contractive boundary passed. See ADR-RML-159.
    ///
    /// A bound above 1.0 is rejected by [`L0Policy::validate`], because it would
    /// admit non-contractive scores.
    pub contraction_witness_exclusive_max: f64,
}

impl Default for L0Policy {
    fn default() -> Self {
        Self {
            expected_schema_version: EXPECTED_SCHEMA_VERSION.to_string(),
            expected_schema_hash: String::new(),
            drift_threshold: DRIFT_THRESHOLD,
            nonce_lifetime_ms: NONCE_LIFETIME_MS,
            max_future_skew_ms: MAX_FUTURE_SKEW_MS,
            contraction_witness_exclusive_max: 1.0,
        }
    }
}

impl L0Policy {
    /// Reject a policy that cannot bind to anything.
    ///
    /// Returns the reasons. An empty result means the policy is usable.
    pub fn validate(&self) -> Vec<String> {
        let mut errors = Vec::new();
        if !is_well_formed_digest(&self.expected_schema_hash) {
            errors.push(format!(
                "expected_schema_hash is not a well-formed digest: {:?}. \
                 Expected 64 lowercase hex characters, optionally prefixed with `sha256:`. \
                 A placeholder or truncated value cannot bind a state to a schema and is \
                 rejected before any comparison happens.",
                self.expected_schema_hash
            ));
        }
        // The bound is the exclusive upper limit of the contractive interval, so
        // 1.0 is the strictest admissible value and anything above it would admit
        // non-contractive scores.
        if !(self.contraction_witness_exclusive_max > 0.0
            && self.contraction_witness_exclusive_max <= 1.0)
        {
            errors.push(format!(
                "contraction_witness_exclusive_max must lie in (0, 1]; it is the exclusive \
                 upper bound of the contractive interval and a value above 1.0 would admit \
                 non-contractive scores. Got {}",
                self.contraction_witness_exclusive_max
            ));
        }
        if self.drift_threshold < 0.0 {
            errors.push(format!(
                "drift_threshold must be non-negative, got {}",
                self.drift_threshold
            ));
        }
        if self.nonce_lifetime_ms <= 0 {
            errors.push(format!(
                "nonce_lifetime_ms must be positive, got {}",
                self.nonce_lifetime_ms
            ));
        }
        if self.max_future_skew_ms < 0 {
            errors.push(format!(
                "max_future_skew_ms must be non-negative, got {}",
                self.max_future_skew_ms
            ));
        }
        errors
    }
}

/// True when `value` is 64 lowercase hex characters, with an optional
/// `sha256:` prefix.
pub fn is_well_formed_digest(value: &str) -> bool {
    let body = value.strip_prefix("sha256:").unwrap_or(value);
    body.len() == 64 && body.bytes().all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
}

/// Normalise a digest to bare 64-hex form for comparison, so a
/// `sha256:`-prefixed policy value and an unprefixed state value agree.
fn normalize_digest(value: &str) -> &str {
    value.strip_prefix("sha256:").unwrap_or(value)
}

/// Run the L0 kernel against `state` under `policy`.
///
/// `policy.expected_schema_hash` is a required, well-formed digest. When it is
/// absent or malformed the kernel fails closed with a `schema_hash` violation
/// and the reason, rather than comparing against a placeholder. Call
/// [`L0Policy::validate`] first to surface the reason before the call.
///
/// `now_ms` is injectable so the nonce predicates are testable without a clock.
/// It is an `Option` rather than a required argument for compatibility; the
/// kernel reads the wall clock when it is `None`.
pub fn check_l0_invariants(
    state: &State,
    policy: &L0Policy,
    now_ms: Option<i64>,
) -> InvariantCheckResult {
    let now = now_ms.unwrap_or_else(|| Utc::now().timestamp_millis());

    // Fail closed on an unusable policy. A placeholder digest is not a weaker
    // check, it is no check, and silently accepting it is what allowed this
    // defect to persist behind a green build.
    let policy_errors = policy.validate();
    let policy_valid = policy_errors.is_empty();

    let schema_valid = policy_valid
        && is_well_formed_digest(&state.schema_hash)
        && state.schema_version == policy.expected_schema_version
        && normalize_digest(&state.schema_hash) == normalize_digest(&policy.expected_schema_hash);

    let permissions_valid = (state.permission_bits & RESERVED_PERMISSION_BITS_MASK) == 0;

    let drift_valid = state.drift_magnitude >= 0.0 && state.drift_magnitude <= policy.drift_threshold;

    let age = now - state.nonce.issued_at;
    // Future-dated nonces are rejected outright; small clock skew is tolerated up
    // to an explicit bound. Previously `age >= 0` meant any future timestamp was
    // rejected, which turned ordinary skew into a hard failure while a wildly
    // future nonce that a skew tolerance would admit had no bound at all.
    let skew = -age;
    let nonce_valid = !state.nonce.value.is_empty()
        && state.nonce.value.len() >= MIN_NONCE_LENGTH
        && skew <= policy.max_future_skew_ms
        && age < policy.nonce_lifetime_ms;

    // Strict contraction: 0 < score < bound, with bound < 1. `None` fails closed.
    // Absence of a contraction witness is not evidence of contraction.
    let witness_valid = match state.contraction_witness_score {
        Some(score) => {
            score.is_finite()
                && score > 0.0
                && score < policy.contraction_witness_exclusive_max
        }
        None => false,
    };

    
    if schema_valid && permissions_valid && drift_valid && nonce_valid && witness_valid {
        return InvariantCheckResult {
            passed: true,
            failed_checks: Vec::new(),
            violations: None,
        };
    }
    
    let mut failed_checks = Vec::new();
    let mut violations = HashMap::new();
    
    if !schema_valid {
        failed_checks.push("schema_hash".to_string());
        let reason = if !policy_valid {
            format!(
                "L0 policy is unusable, so the schema binding cannot be evaluated. {}",
                policy_errors.join(" ")
            )
        } else if !is_well_formed_digest(&state.schema_hash) {
            format!(
                "State schema_hash is not a well-formed digest: {:?}. \
                 Expected 64 lowercase hex characters, optionally prefixed with `sha256:`.",
                state.schema_hash
            )
        } else {
            format!(
                "Schema binding mismatch. Expected version: {}, hash: {}. Got version: {}, hash: {}",
                policy.expected_schema_version,
                policy.expected_schema_hash,
                state.schema_version,
                state.schema_hash
            )
        };
        violations.insert("schema_hash".to_string(), reason);
    }
    
    if !permissions_valid {
        failed_checks.push("permission_bits".to_string());
        violations.insert("permission_bits".to_string(), format!("Reserved bits are set. Permission bits: {:016b}", state.permission_bits));
    }
    
    if !drift_valid {
        failed_checks.push("drift_magnitude".to_string());
        violations.insert("drift_magnitude".to_string(), format!("Drift magnitude exceeds threshold. Value: {}, threshold: {}", state.drift_magnitude, policy.drift_threshold));
    }
    
    if !nonce_valid {
        failed_checks.push("nonce_freshness".to_string());
        if state.nonce.value.is_empty() {
            violations.insert("nonce_freshness".to_string(), "Nonce value is missing".to_string());
        } else if state.nonce.value.len() < MIN_NONCE_LENGTH {
            violations.insert("nonce_freshness".to_string(), "Nonce value is too short".to_string());
        } else if skew > policy.max_future_skew_ms {
            violations.insert("nonce_freshness".to_string(), format!("Nonce timestamp is too far in the future. Skew: {}ms, max allowed: {}ms", skew, policy.max_future_skew_ms));
        } else {
            violations.insert("nonce_freshness".to_string(), format!("Nonce is expired or stale. Age: {}ms, lifetime: {}ms", age, policy.nonce_lifetime_ms));
        }
    }
    
    if !witness_valid {
        failed_checks.push("contraction_witness".to_string());
        let reason = match state.contraction_witness_score {
            None => "No contraction witness score was supplied. Absence of a witness is not \
                     evidence of contraction, so this fails closed."
                .to_string(),
            Some(score) => format!(
                "Contraction witness score is outside the contractive interval. Score: {:?}, \
                 required: 0.0 < score < {}",
                score, policy.contraction_witness_exclusive_max
            ),
        };
        violations.insert("contraction_witness".to_string(), reason);
    }
    
    InvariantCheckResult {
        passed: false,
        failed_checks,
        violations: Some(violations),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// A real, well-formed digest. Not a digest of any schema artifact: the
    /// kernel compares the state against policy, it does not recompute the
    /// schema. Derived here only so the constant is unambiguously 64 hex
    /// characters rather than a hand-typed string of the wrong length.
    const REAL_DIGEST: &str =
        "c60340700661949c07d26031b73b549682b00b910a86e56b055df3de148c5e7c";

    fn policy() -> L0Policy {
        L0Policy {
            expected_schema_hash: REAL_DIGEST.to_string(),
            ..L0Policy::default()
        }
    }

    fn state_at(now: i64) -> State {
        State {
            schema_version: EXPECTED_SCHEMA_VERSION.to_string(),
            schema_hash: REAL_DIGEST.to_string(),
            permission_bits: 0,
            drift_magnitude: 0.1,
            nonce: Nonce {
                value: "a".repeat(MIN_NONCE_LENGTH),
                issued_at: now - 1_000,
            },
            contraction_witness_score: Some(0.95),
        }
    }

    /// The placeholder that ADR-RML-159 identified must never be accepted, and
    /// must never be the value a policy is allowed to carry.
    #[test]
    fn placeholder_hash_is_not_a_well_formed_digest() {
        assert!(!is_well_formed_digest("f7a8b9c0d1e2f3g4"));
        assert!(!is_well_formed_digest(""));
        assert!(!is_well_formed_digest("deadbeef"));
        assert!(!is_well_formed_digest(&"z".repeat(64)));
        assert!(!is_well_formed_digest(&"A".repeat(64)), "uppercase is not canonical hex");
    }

    #[test]
    fn well_formed_digests_are_accepted_with_and_without_prefix() {
        assert!(is_well_formed_digest(REAL_DIGEST));
        assert!(is_well_formed_digest(&format!("sha256:{}", REAL_DIGEST)));
        assert!(!is_well_formed_digest(&format!("sha256:{}", "f7a8b9c0d1e2f3g4")));
    }

    #[test]
    fn a_well_formed_state_passes() {
        let now = 1_700_000_000_000;
        let result = check_l0_invariants(&state_at(now), &policy(), Some(now));
        assert!(
            result.passed,
            "expected pass, failed: {:?}",
            result.violations
        );
    }

    /// The regression that matters: a caller echoing the old placeholder must
    /// not reach `passed: true`.
    #[test]
    fn placeholder_hash_in_state_is_rejected() {
        let now = 1_700_000_000_000;
        let mut state = state_at(now);
        state.schema_hash = "f7a8b9c0d1e2f3g4".to_string();
        let result = check_l0_invariants(&state, &policy(), Some(now));
        assert!(!result.passed);
        assert!(result.failed_checks.contains(&"schema_hash".to_string()));
    }

    #[test]
    fn unusable_policy_fails_closed() {
        let now = 1_700_000_000_000;
        // Policy carrying the placeholder, and an otherwise perfect state.
        let bad_policy = L0Policy {
            expected_schema_hash: "f7a8b9c0d1e2f3g4".to_string(),
            ..L0Policy::default()
        };
        let mut state = state_at(now);
        state.schema_hash = "f7a8b9c0d1e2f3g4".to_string();
        let result = check_l0_invariants(&state, &bad_policy, Some(now));
        assert!(
            !result.passed,
            "a placeholder policy must not certify: the state echoes the placeholder"
        );
        assert!(result.failed_checks.contains(&"schema_hash".to_string()));
    }

    #[test]
    fn default_policy_is_rejected_because_it_carries_no_digest() {
        let errors = L0Policy::default().validate();
        assert!(
            !errors.is_empty(),
            "the default policy must not be usable, or the kernel silently fail-opens"
        );
    }

    /// The boundary the formal layer forbids. This is the ADR-RML-159 headline
    /// defect: `== 1.0` accepted the one value Lean's `κ < 1` rejects.
    #[test]
    fn witness_score_of_exactly_one_is_rejected() {
        let now = 1_700_000_000_000;
        let mut state = state_at(now);
        state.contraction_witness_score = Some(1.0);
        let result = check_l0_invariants(&state, &policy(), Some(now));
        assert!(!result.passed, "κ = 1.0 is not contractive");
        assert!(result
            .failed_checks
            .contains(&"contraction_witness".to_string()));
    }

    #[test]
    fn genuinely_contractive_scores_are_accepted() {
        let now = 1_700_000_000_000;
        for score in [0.5, 0.9, 0.95, 0.999, 0.999_999] {
            let mut state = state_at(now);
            state.contraction_witness_score = Some(score);
            let result = check_l0_invariants(&state, &policy(), Some(now));
            assert!(
                result.passed,
                "score {score} is contractive and must pass, failed: {:?}",
                result.violations
            );
        }
    }

    #[test]
    fn non_contractive_scores_are_rejected() {
        let now = 1_700_000_000_000;
        for score in [0.0, -0.5, 1.0, 1.5, f64::NAN, f64::INFINITY] {
            let mut state = state_at(now);
            state.contraction_witness_score = Some(score);
            let result = check_l0_invariants(&state, &policy(), Some(now));
            assert!(!result.passed, "score {score} must not certify");
        }
    }

    #[test]
    fn absent_witness_fails_closed() {
        let now = 1_700_000_000_000;
        let mut state = state_at(now);
        state.contraction_witness_score = None;
        let result = check_l0_invariants(&state, &policy(), Some(now));
        assert!(!result.passed, "no witness is not evidence of contraction");
    }

    #[test]
    fn small_clock_skew_is_tolerated_but_wild_future_nonces_are_not() {
        let now = 1_700_000_000_000;
        let p = policy();

        // 30s of skew, inside the 60s tolerance.
        let mut state = state_at(now);
        state.nonce.issued_at = now + 30_000;
        assert!(check_l0_invariants(&state, &p, Some(now)).passed);

        // One day in the future, outside it.
        let mut state = state_at(now);
        state.nonce.issued_at = now + 86_400_000;
        let result = check_l0_invariants(&state, &p, Some(now));
        assert!(!result.passed);
        assert!(result.failed_checks.contains(&"nonce_freshness".to_string()));
    }

    #[test]
    fn expired_nonce_is_rejected() {
        let now = 1_700_000_000_000;
        let mut state = state_at(now);
        state.nonce.issued_at = now - policy().nonce_lifetime_ms - 1;
        let result = check_l0_invariants(&state, &policy(), Some(now));
        assert!(!result.passed);
        assert!(result.failed_checks.contains(&"nonce_freshness".to_string()));
    }

    #[test]
    fn prefixed_and_bare_digests_agree() {
        let now = 1_700_000_000_000;
        let p = L0Policy {
            expected_schema_hash: format!("sha256:{}", REAL_DIGEST),
            ..L0Policy::default()
        };
        let result = check_l0_invariants(&state_at(now), &p, Some(now));
        assert!(result.passed, "prefix normalisation failed: {:?}", result.violations);
    }

    #[test]
    fn policy_rejects_an_out_of_range_witness_bound() {
        // Above 1.0 would admit non-contractive scores. Below or equal to zero
        // admits nothing at all.
        for bound in [1.5, 2.0, 0.0, -1.0] {
            let p = L0Policy {
                contraction_witness_exclusive_max: bound,
                ..L0Policy::default()
            };
            assert!(
                !p.validate().is_empty(),
                "bound {bound} must be rejected: the Lean invariant is κ < 1"
            );
        }
    }

    /// 1.0 is the strictest admissible bound, not an invalid one: the predicate
    /// is `score < bound`, so a bound of 1.0 *is* `κ < 1`.
    #[test]
    fn unit_bound_is_the_strictest_admissible_value() {
        let p = L0Policy {
            expected_schema_hash: REAL_DIGEST.to_string(),
            contraction_witness_exclusive_max: 1.0,
            ..L0Policy::default()
        };
        assert!(p.validate().is_empty(), "{:?}", p.validate());

        let now = 1_700_000_000_000;
        let mut state = state_at(now);
        state.contraction_witness_score = Some(0.999_999);
        assert!(check_l0_invariants(&state, &p, Some(now)).passed);

        state.contraction_witness_score = Some(1.0);
        assert!(!check_l0_invariants(&state, &p, Some(now)).passed);
    }
}

