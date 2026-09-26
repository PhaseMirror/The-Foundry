// INVALID: Missing epsilon attribute
// Violates L0-2: Must have exactly one epsilon

module @gft_invalid_missing_epsilon {
  // L0 attributes - MISSING EPSILON!
  // prime_index = 2
  // op_norm_T = 1.2
  // NOTE: epsilon is missing

  %cumulant = "pirtm.cumulant_embed"() {
    scale_k = 1.0e16 : f64,
    prime_mod = 2 : i64,
    order = 2 : i32
  } : () -> !pirtm.tensor

  %cert = "pirtm.spectral_cert"(%cumulant) {
    prime_mod = 2 : i64,
    norm_bound = 1.2 : f64
  } : (!pirtm.tensor) -> !pirtm.cert

  %result = "pirtm.return"(%cumulant, %cert) : (!pirtm.tensor, !pirtm.cert) -> none
}
