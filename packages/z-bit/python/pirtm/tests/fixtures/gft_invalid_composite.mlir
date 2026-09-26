// INVALID: Composite prime_mod violation
// This module violates L0-5: prime_mod must be prime
// Using prime_mod = 15 = 3 × 5 (composite)

module @gft_invalid_composite {
  // L0 attributes (bypassing validation for test purposes)
  // prime_index = 2
  // epsilon = 0.05
  // op_norm_T = 1.2

  // VIOLATION: prime_mod = 15 is composite (not prime)
  %cumulant = "pirtm.cumulant_embed"() {
    scale_k = 1.0e16 : f64,
    prime_mod = 15 : i64,  // ERROR: 15 = 3 × 5 (not prime!)
    order = 2 : i32
  } : () -> !pirtm.tensor

  %cert = "pirtm.spectral_cert"(%cumulant) {
    prime_mod = 15 : i64,
    norm_bound = 1.2 : f64
  } : (!pirtm.tensor) -> !pirtm.cert

  %result = "pirtm.return"(%cumulant, %cert) : (!pirtm.tensor, !pirtm.cert) -> none
}
