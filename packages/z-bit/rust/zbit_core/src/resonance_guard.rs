/// Resonance safety checks for CCRE update proposals.
/// Mirrors the Python `resonance_holds` function.

pub fn resonance_holds(resonance: f64, lower: f64, upper: f64) -> bool {
    lower <= resonance && resonance <= upper
}
