/// Checks if the contraction condition holds for a given kappa.
/// Mirrors the Python `contraction_holds` function.
pub fn contraction_holds(kappa: f64) -> bool {
    const CONTRACTION_THRESHOLD: f64 = 1.0;
    kappa < CONTRACTION_THRESHOLD
}
