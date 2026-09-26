// Edge Case: Large Prime Module
// Tests L0-5: Miller-Rabin primality for large primes
// prime_index = 7919 (large prime)
// epsilon = 0.02 (tight bound)
// op_norm_T = 0.95 (subcritical spectral radius)

module @edge_case_large_prime {
  // L0 attributes with large prime
  // prime_index = 7919
  // epsilon = 0.02
  // op_norm_T = 0.95

  // Large prime modulus requires Miller-Rabin verification
  %cumulant = "pirtm.cumulant_embed"() {
    scale_k = 1.5e-308 : f64,
    prime_mod = 7919 : i64,  // 7919 is prime (verified by Miller-Rabin)
    order = 5 : i32
  } : () -> !pirtm.tensor

  // Subcritical spectral radius (< 1.0)
  %scaled = "pirtm.scale"(%cumulant) {
    factor = 0.95 : f64
  } : (!pirtm.tensor) -> !pirtm.tensor

  %cert = "pirtm.spectral_cert"(%scaled) {
    prime_mod = 7919 : i64,
    norm_bound = 0.95 : f64
  } : (!pirtm.tensor) -> !pirtm.cert

  %result = "pirtm.return"(%scaled, %cert) : (!pirtm.tensor, !pirtm.cert) -> none
}
