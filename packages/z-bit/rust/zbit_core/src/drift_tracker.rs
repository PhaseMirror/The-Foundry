// Semantic drift checks for CCRE update proposals.

pub fn drift_holds(drift: f64, bound: f64) -> bool {
    drift < bound
}
