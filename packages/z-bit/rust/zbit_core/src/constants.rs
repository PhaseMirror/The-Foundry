// Constants translated from Python
pub const DRIFT_GUARD_DEFAULT: f64 = 0.3;
pub const CONTRACTION_THRESHOLD: f64 = 1.0;
pub const RESONANCE_MIN_DEFAULT: f64 = 0.3;
pub const RESONANCE_MAX_DEFAULT: f64 = 0.7;
pub const LIPSCHITZ_ALPHA_DEFAULT: f64 = 0.3;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_constants() {
        assert!(CONTRACTION_THRESHOLD > 0.0);
        assert!(RESONANCE_MIN_DEFAULT < RESONANCE_MAX_DEFAULT);
    }
}
