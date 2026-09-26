// Realistic GFT Melonic Graph Module (Valid)
// Sigma compiler output representing a valid 2-colored melonic graph
// prime_index = 2 (lowest prime, fundamental building block)
// epsilon = 0.05 (contractivity margin for melonic sector)
// op_norm_T = 1.1 (tight operator norm bound for melonic scaling)

module @gft_melonic_valid {
  // L0 attributes (mandatory, transpile-time bounds)
  // prime_index = 2
  // epsilon = 0.05
  // op_norm_T = 1.1

  // Cumulant embedding for 2-colored graphs
  %cumulant = "pirtm.cumulant_embed"() {
    scale_k = 1.7976931348623157e+308 : f64,
    prime_mod = 2 : i64,
    order = 2 : i32
  } : () -> !pirtm.tensor

  // Melonic contraction (all legs paired)
  %contraction = "pirtm.tensor_contract"(%cumulant, %cumulant) {
    alpha = 0.05 : f64,
    num_legs = 4 : i32,
    contraction_pattern = "fully_paired"
  } : (!pirtm.tensor, !pirtm.tensor) -> !pirtm.tensor

  // Operator norm certification
  %cert = "pirtm.spectral_cert"(%contraction) {
    prime_mod = 2 : i64,
    norm_bound = 1.1 : f64
  } : (!pirtm.tensor) -> !pirtm.cert

  // Return certified tensor
  %result = "pirtm.return"(%contraction, %cert) : (!pirtm.tensor, !pirtm.cert) -> none
}
