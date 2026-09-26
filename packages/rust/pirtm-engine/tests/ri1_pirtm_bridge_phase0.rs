//! ri1-pirtm-bridge -- Phase 0 read-only schema check harness.
//!
//! Compiles the REAL on-tree artifact. `src/harmonia.rs` was previously pulled
//! in by `#[path]` because it was not declared in `src/lib.rs`, so the
//! `ri1-pirtm-contact-0.1` schema was outside the crate's compilation graph
//! and none of its own unit tests ran. It is now a declared module, so this
//! harness imports it through the crate root and the file's three unit tests
//! execute as part of the normal `cargo test` run.
//!
//! Name mapping requested -> on-tree:
//!   "pirs-contact-0.1"          -> HARMONIA_SCHEMA_VERSION = "ri1-pirtm-contact-0.1"
//!                                  (packages/rust/pirtm-engine/src/harmonia.rs:13)
//!   "phi_pi_epsilon_baseline()" -> HarmoniaContactArtifact::new_phi_pi_epsilon()
//!                                  (packages/rust/pirtm-engine/src/harmonia.rs:57)
//!
//! Decisions follow ADR/Sovereign.lean normative rules 1 and 2
//! (ADR/Sovereign.lean:323-355):
//!   VERIFIED        -- state exactly representable in the contact schema and
//!                      the transition satisfies ||L_m U|| < 1.
//!   REJECTED        -- representable, but the transition is not contractive.
//!                      MUST stay distinguishable from UNREPRESENTABLE (rule 2).
//!   UNREPRESENTABLE -- content cannot be expressed in the schema at all.
//!                      MUST stop before execution (rule 1).

use pirtm_engine::harmonia::{
    gibson_weight, HarmoniaContactArtifact, HarmoniaValidator, HARMONIA_SCHEMA_VERSION, PHI,
};

#[derive(Debug, PartialEq, Eq, Clone, Copy)]
enum Decision {
    Verified,
    Rejected,
    Unrepresentable,
}

impl std::fmt::Display for Decision {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(match self {
            Decision::Verified => "VERIFIED",
            Decision::Rejected => "REJECTED",
            Decision::Unrepresentable => "UNREPRESENTABLE",
        })
    }
}

fn base(phi: u64, pi: u64, eps: u64) -> HarmoniaContactArtifact {
    HarmoniaContactArtifact::new_phi_pi_epsilon(phi, pi, eps)
}

/// A state carrying a symbol with no prime binding: not expressible in the
/// schema. This is what an inbound foreign contact looks like.
fn unrepresentable_variant() -> HarmoniaContactArtifact {
    let mut a = base(1, 1, 1);
    a.state.insert("Omega".to_string(), 7);
    a
}

/// A state whose Gibson norm explodes far beyond the +1.03 slack.
fn norm_blowup_variant() -> HarmoniaContactArtifact {
    base(u64::MAX / 3, 1, 1)
}

/// Read-only first-contact decision for a Φπε TRANSITION.
fn decide_transition(
    prev: &HarmoniaContactArtifact,
    next: &HarmoniaContactArtifact,
) -> Decision {
    // Rule 1: every state symbol must bind to a prime in symbol_map. A symbol
    // with no prime binding cannot be expressed as a prime signature, so the
    // content is not representable and must stop before execution.
    for a in [prev, next] {
        if a.state.keys().any(|k| !a.symbol_map.contains_key(k)) {
            return Decision::Unrepresentable;
        }
        if a.schema != HARMONIA_SCHEMA_VERSION {
            return Decision::Unrepresentable;
        }
    }
    match HarmoniaValidator::validate_transition(prev, next) {
        Ok(r) if r.is_contractive && r.lambda_m_eff < 1.0 => Decision::Verified,
        _ => Decision::Rejected,
    }
}

fn decide_self(a: &HarmoniaContactArtifact) -> Decision {
    decide_transition(a, a)
}

// ---------------------------------------------------------------- baseline

#[test]
fn baseline_is_ri1_pirtm_contact_0_1() {
    let a = base(1, 2, 1);
    assert_eq!(a.schema, "ri1-pirtm-contact-0.1");
    assert_eq!(a.schema, HARMONIA_SCHEMA_VERSION);
    assert_eq!(a.prime_signature, "2^1 * 3^2 * 5^1");
    assert_eq!(a.compute_multiplicity_number(), 90); // 2^1 * 3^2 * 5^1
}

#[test]
fn baseline_decision_is_verified() {
    assert_eq!(decide_self(&base(1, 2, 1)), Decision::Verified);
}

// ------------------------------------------------------------- determinism

#[test]
fn decision_is_deterministic_across_repeats() {
    let first = decide_self(&base(1, 2, 1));
    for _ in 0..64 {
        assert_eq!(
            decide_self(&base(1, 2, 1)),
            first,
            "decision must be stable across independent constructions"
        );
    }
    // every decision class is stable too
    for (a, b, want) in [
        (base(1, 1, 1), norm_blowup_variant(), Decision::Rejected),
        (base(1, 1, 1), unrepresentable_variant(), Decision::Unrepresentable),
    ] {
        for _ in 0..64 {
            assert_eq!(decide_transition(&a, &b), want);
        }
    }
}

#[test]
fn receipt_hash_is_deterministic() {
    // The SHA-256 witness is a function of (prev_sig, next_sig, lambda_eff)
    // only. Two independently constructed but equal states must agree.
    let a1 = base(1, 2, 1);
    let a2 = base(1, 2, 1);
    let r1 = HarmoniaValidator::validate_transition(&a1, &a1).unwrap();
    let r2 = HarmoniaValidator::validate_transition(&a2, &a2).unwrap();
    assert_eq!(r1.contractivity_hash, r2.contractivity_hash);
    assert_eq!(r1.contractivity_hash.len(), 64, "SHA-256 hex digest");
    assert_eq!(r1.norm_before, r2.norm_before);
    assert_eq!(r1.lambda_m_eff, r2.lambda_m_eff);
}

#[test]
fn serialization_roundtrips_identically() {
    let a = base(3, 1, 2);
    let json = serde_json::to_string_pretty(&a).unwrap();
    let back: HarmoniaContactArtifact = serde_json::from_str(&json).unwrap();
    assert_eq!(a, back);
    assert_eq!(decide_self(&a), decide_self(&back));
}

// ------------------------------------------------ the three decisions exist

#[test]
fn rejected_is_distinguishable_from_unrepresentable() {
    // ADR/Sovereign.lean:340-355 -- rule 2. A DENY at the authority gate can
    // never be conflated with an UNREPRESENTABLE at the representability gate.
    let prev = base(1, 1, 1);
    let rej = decide_transition(&prev, &norm_blowup_variant());
    let unrepr = decide_transition(&prev, &unrepresentable_variant());
    assert_eq!(rej, Decision::Rejected);
    assert_eq!(unrepr, Decision::Unrepresentable);
    assert_ne!(rej, unrepr, "rules 1 and 2 require distinct outcomes");
    assert_ne!(rej, Decision::Verified);
    assert_ne!(unrepr, Decision::Verified);
}

#[test]
fn unrepresentable_symbol_stops_before_execution() {
    // Rule 1: an UNREPRESENTABLE decision must not reach a contractivity
    // receipt. The on-tree accumulators silently SKIP symbols with no prime
    // binding (harmonia.rs:83-88, 97-100), so the validator ACCEPTS the
    // truncated state; decide_transition() is the layer that stops it.
    let a = unrepresentable_variant();
    assert!(!a.symbol_map.contains_key("Omega"));
    let r = HarmoniaValidator::validate_transition(&a, &a);
    assert!(
        r.is_ok(),
        "on-tree validator accepts a state with an unbound symbol; the \
         decide() layer is what rejects it"
    );
    assert_eq!(decide_self(&a), Decision::Unrepresentable);
}

// ------------------------------------------------------- DEFECT: L0 tautology
//
// ENCODED DEFECT, NOT A PASS. AGENTS.md forbids a stability gate that is a
// tautology. harmonia.rs:132 computes
//     lambda_m_eff = 0.97 * 1/(1 + |delta_norm| * 0.03)
// and harmonia.rs:134 gates on `lambda_m_eff < 1.0`. Because |delta_norm| >= 0
// the denominator is >= 1, so lambda_m_eff <= 0.97 for EVERY reachable input
// and the small-gain term can never fail. The L0 gate is unsatisfiable-in-
// reverse: it is a no-op. The only term that can reject is the separate
// `norm_after <= norm_before + 1.03` slack check.
//
// This test asserts the CURRENT defective invariant so the defect is
// falsifiable and machine-checkable. If someone repairs the formula this test
// FAILS, which is the intended signal: the fix must be recorded in the axiom
// ledger and this test updated, not silently left passing.

#[test]
fn defect_l0_small_gain_term_is_tautological() {
    let mut worst = f64::MIN;
    // sweep delta_norm over decades, including absurd magnitudes
    for k in 0..40u32 {
        let d = (k as f64) * 1e17;
        let lambda = 0.97 * (1.0 / (1.0 + d * 0.03));
        worst = worst.max(lambda);
        assert!(
            lambda <= 0.97,
            "lambda_m_eff {lambda} exceeded 0.97 at delta_norm={d}"
        );
        assert!(lambda < 1.0, "the small-gain term can never fail");
    }
    // and the same holds on the real validator across real artifacts
    for (p, n) in [
        (base(1, 1, 1), base(2, 2, 2)),
        (base(1, 1, 1), norm_blowup_variant()),
        (base(0, 0, 0), base(5, 5, 5)),
    ] {
        if let Ok(r) = HarmoniaValidator::validate_transition(&p, &n) {
            assert!(r.lambda_m_eff <= 0.97, "{}", r.lambda_m_eff);
        }
    }
    // The supremum of lambda_m_eff over the whole domain is exactly 0.97,
    // attained at delta_norm = 0. So `lambda_m_eff < 1.0` is decidable
    // without calling the validator at all.
    assert!((worst.max(0.97) - 0.97).abs() < 1e-12);
}

#[test]
fn defect_self_transition_is_always_contractive() {
    // delta_norm = 0 for prev == next, so every self-transition is admitted.
    // A state is therefore never rejected on its own account; rejection is
    // only ever relative to some other state. decide_self() can never yield
    // REJECTED, which is why the gate above probes transitions.
    for a in [base(0, 0, 0), base(1, 2, 1), norm_blowup_variant(), base(u64::MAX, u64::MAX, u64::MAX)] {
        let r = HarmoniaValidator::validate_transition(&a, &a).unwrap();
        assert!(r.is_contractive);
        assert_eq!(r.lambda_m_eff, 0.97);
        assert_ne!(decide_self(&a), Decision::Rejected);
    }
}

// ----------------------------------------------------------------- the gate

#[test]
fn phase0_gate_matrix() {
    // All rows are transitions FROM the baseline (Phi^1 Pi^1 Eps^1).
    // The +1.03 norm slack is TIGHT: raising the Pi count alone adds
    // xi(3) = log_Phi(3) = 2.28 > 1.03, so ordinary growth is REJECTED.
    // Only non-increasing transitions pass.
    let from = base(1, 1, 1);
    let self_ = base(1, 1, 1);
    let baseline = base(1, 2, 1);
    let shrink = base(1, 0, 1);
    let blowup = norm_blowup_variant();
    let unrepr = unrepresentable_variant();
    let cases: Vec<(&str, &HarmoniaContactArtifact, Decision)> = vec![
        ("(1,1,1) -> (1,1,1)  self-transition", &self_, Decision::Verified),
        ("(1,1,1) -> (1,0,1)  norm decreases", &shrink, Decision::Verified),
        ("(1,1,1) -> (1,2,1)  +xi(3)=+2.28 > +1.03 slack", &baseline, Decision::Rejected),
        ("(1,1,1) -> (MAX/3,1,1)  norm blowup", &blowup, Decision::Rejected),
        ("(1,1,1) -> Omega unbound symbol", &unrepr, Decision::Unrepresentable),
    ];
    for (label, next, want) in cases {
        let got = decide_transition(&from, next);
        assert_eq!(got, want, "{label}");
        println!("  {label:<50} -> {got}");
    }
    // the documented on-tree happy path is a SUBTRACTION
    let receipt = HarmoniaValidator::validate_transition(&baseline, &base(1, 1, 1)).unwrap();
    assert!(receipt.is_contractive);
    assert_eq!(receipt.status, "CERTIFIED_CONTRACTIVE");
}

#[test]
fn gibson_weights_are_strictly_increasing_in_prime() {
    // xi(p) = log_Phi(p) must be monotone on the bound primes 2 < 3 < 5.
    assert!(gibson_weight(2) < gibson_weight(3));
    assert!(gibson_weight(3) < gibson_weight(5));
    assert_eq!(gibson_weight(0), 0.0);
    assert_eq!(gibson_weight(1), 0.0);
    assert!((PHI - 1.0 - 1.0 / PHI).abs() < 1e-15, "Phi^2 = Phi + 1");
}

#[test]
fn state_is_a_btreemap_so_iteration_order_is_canonical() {
    // Determinism of every accumulator depends on canonical iteration order.
    let a = base(1, 1, 1);
    let mut reordered = std::collections::BTreeMap::new();
    reordered.insert("Epsilon".to_string(), 1u64);
    reordered.insert("Pi".to_string(), 1u64);
    reordered.insert("Phi".to_string(), 1u64);
    assert_eq!(
        &a.state,
        &reordered,
        "BTreeMap order is canonical, not insertion order"
    );
}
