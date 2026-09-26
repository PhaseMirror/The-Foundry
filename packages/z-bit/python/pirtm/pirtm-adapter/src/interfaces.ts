// PIRTM adapter type definitions
// PM-2460 / ADR-073: Proof layer interfaces

/**
 * A fully-resolved PIRTM proof packet.
 * Carries the cryptographic commitment produced by the transpile-time
 * contractivity check together with the module binding parameters.
 */
export type PirtmProof = {
  /** 0x-prefixed SHA-256 hex digest of (prime_index || tensor body) */
  proof: string;
  /** Module prime index from !pirtm_proof section */
  primeIndex: number;
  /** Contraction factor ε ∈ (0, 1) */
  epsilon: number;
  /** Operator norm of transition tensor T */
  opNormT: number;
  /** SHA-256 of (prime_index|epsilon|op_norm_T) — proof-of-binding */
  proofHash: string;
  /** Arbitrary public signals emitted alongside the proof */
  publicSignals: Record<string, unknown>;
};

/** Input contract for executePirtm */
export type PirtmRequest = {
  viewPath: string;
  logic: string;
  context: Record<string, unknown>;
  /** Override prime index (defaults to module metadata) */
  primeIndex?: number;
  /** Override epsilon (defaults to module metadata) */
  epsilon?: number;
};

/** Module-level binding parameters extracted from !pirtm_proof section */
export type ModuleMetadata = {
  /** Prime index: identifies the CRT residue class for this module */
  primeIndex: number;
  /** Contraction factor ε ∈ (0, 1) */
  epsilon: number;
  /** Operator (spectral) norm of the transition tensor T */
  opNormT: number;
  /** Optional pre-computed proof hash */
  proofHash?: string;
  /** Filesystem path to the module artifact */
  modulePath?: string;

  // -------------------------------------------------------------------------
  // Kronecker-Sum attributes — ADR-088 (Meta-Relativity Phase 1)
  // -------------------------------------------------------------------------

  /** Prime-diagonal exponent σ for A = Dσ + K; (Dσ)_pp = p^{-σ}. Must be > 0. */
  sigma?: number;
  /**
   * Hilbert-Schmidt exponent α for Gram kernel K_pq = p^{-α} q^{-α} h(…).
   * MUST be strictly > 0.5 (open HS condition) — validated at transpile time.
   */
  alpha?: number;
  /** Dimension d of the internal Ξ block (Cᵈ space). Must be ≥ 1 integer. */
  xi_block_dim?: number;
  /**
   * Spectral gap lower bound GapLB = δS − 2Σ|wₚ|bₚ.
   * Set to 0 at transpile time (unresolved); filled by link-time certification pass.
   */
  gap_lb?: number;
  /**
   * Slope upper bound SlopeUB = Σ|wₚ|Lₚ.
   * Set to 0 at transpile time (unresolved); filled by link-time certification pass.
   */
  slope_ub?: number;
  /**
   * Cached K positive-semi-definite result from validatePrimeSpectralBasis.
   * Not stored in the binary section — set by the adapter at certification time.
   */
  kPSD?: boolean;
};

/** Individual check within a ValidationResult */
export type ValidationCheck = {
  name: string;
  passed: boolean;
  detail?: string;
};

/** Aggregate result of validatePirtmModule */
export type ValidationResult = {
  valid: boolean;
  /** Name of the first failing check, if any */
  reason?: string;
  checks: ValidationCheck[];
};

/** Lifecycle status of a PIRTM module */
export type PirtmStatus = 'pending' | 'certified' | 'rejected' | 'error';
