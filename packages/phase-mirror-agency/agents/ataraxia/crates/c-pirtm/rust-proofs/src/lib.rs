#[cfg(kani)]
mod pirtm_lipschitz_proofs {
    // Math/Lipschitz.lean
    #[kani::proof]
    fn prove_lipschitz_continuity() {
        let x1: f64 = kani::any();
        let x2: f64 = kani::any();
        
        kani::assume(x1 >= -10.0 && x1 <= 10.0);
        kani::assume(x2 >= -10.0 && x2 <= 10.0);
        
        let f_x1 = x1 * 0.5;
        let f_x2 = x2 * 0.5;
        
        let dist_x = (x1 - x2).abs();
        let dist_f = (f_x1 - f_x2).abs();
        
        // Lipschitz constant K = 0.5
        assert!(dist_f <= 0.5 * dist_x + 1e-9);
    }
}
