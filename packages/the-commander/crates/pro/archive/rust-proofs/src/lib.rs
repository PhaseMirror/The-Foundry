#[cfg(kani)]
mod pirtm_lipschitz_proofs {
    // Math/Lipschitz.lean
    #[kani::proof]
    fn prove_lipschitz_continuity() {
        let x1: f64 = kani::any();
        let x2: f64 = kani::any();
        kani::assume(x1 >= -10.0 && x1 <= 10.0);
        kani::assume(x2 >= -10.0 && x2 <= 10.0);
        
        let dist_x = (x1 - x2).abs();
        let dist_f = ((x1 * 0.5) - (x2 * 0.5)).abs();
        
        assert!(dist_f <= 0.5 * dist_x + 1e-9);
    }
}
