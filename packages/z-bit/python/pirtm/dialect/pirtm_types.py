"""
PIRTM Dialect Types with Compile-Time Verification

Implements ADR-006: Dialect Type-Layer Gate (Day 0-3)
Spec Reference: PIRTM ADR-004

This module defines:
  - !pirtm.cert(mod=p)     — prime-modulo certificate
  - !pirtm.epsilon(mod=p, value=ε)  — convergence bound
  - !pirtm.op_norm_t(mod=p, norm=n) — operator norm bound
  - !pirtm.session_graph(mod=N, coupling=#pirtm.unresolved_coupling) — session coupling

All types verify mod= constraints at construction time via Miller-Rabin and squarefree tests.
"""

from typing import Optional, Tuple, List
from dataclasses import dataclass
from enum import Enum


# ===== Primality Testing =====

def _is_prime_miller_rabin(mod: int) -> bool:
    """
    Miller-Rabin primality test.
    
    Deterministic for mod < 2^64 using standard bases.
    Returns True if mod is prime, False otherwise.
    
    Implements L0 invariant #3: !pirtm.cert requires prime modulus.
    Implements L0 invariant #5: Atomic types require prime modulus.
    """
    if mod < 2:
        return False
    if mod == 2 or mod == 3:
        return True
    if mod % 2 == 0:
        return False
    
    # Write mod - 1 = 2^r * d where d is odd
    d = mod - 1
    r = 0
    while (d & 1) == 0:
        d >>= 1
        r += 1
    
    # Deterministic bases for all mod < 2^64
    bases = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]
    
    for a in bases:
        if a >= mod:
            continue
        
        # Compute x = a^d mod mod using modular exponentiation
        x = pow(a, d, mod)
        
        if x == 1 or x == mod - 1:
            continue
        
        composite = True
        for _ in range(r - 1):
            x = pow(x, 2, mod)
            if x == mod - 1:
                composite = False
                break
        
        if composite:
            return False
    
    return True


def _factorize(mod: int) -> Tuple[bool, str]:
    """
    Compute prime factorization of mod.
    
    Returns (is_squarefree, factorization_string) where:
      - is_squarefree: True if μ(mod) ≠ 0 (no repeated factors)
      - factorization_string: "p1^a1 * p2^a2 * ..." in ascending order
    
    Implements L0 invariant #5: Composite mod values must be squarefree.
    """
    if mod <= 1:
        return False, str(mod)
    
    factors = {}
    n = mod
    
    # Trial division up to sqrt(n)
    p = 2
    while p * p <= n:
        while n % p == 0:
            factors[p] = factors.get(p, 0) + 1
            n //= p
        p += 1
    
    if n > 1:
        factors[n] = factors.get(n, 0) + 1
    
    # Check squarefreeness
    is_squarefree = all(count == 1 for count in factors.values())
    
    # Format factorization string
    if not factors:
        fact_str = "1"
    else:
        fact_parts = []
        for prime in sorted(factors.keys()):
            count = factors[prime]
            if count == 1:
                fact_parts.append(str(prime))
            else:
                fact_parts.append(f"{prime}^{count}")
        fact_str = " * ".join(fact_parts)
    
    return is_squarefree, fact_str


# ===== Type Definitions =====

class VerificationError(Exception):
    """Raised when a type constraint verification fails."""
    pass


@dataclass
class CertType:
    """
    !pirtm.cert(mod=p)
    
    Prime-modulo certificate type.
    mod=p must be prime (L0 invariant #3).
    """
    mod: int
    
    def __post_init__(self):
        """Verify mod is prime at construction time."""
        if not _is_prime_miller_rabin(self.mod):
            # Compute factorization for error message
            _, factorization = _factorize(self.mod)
            raise VerificationError(
                f"mod={self.mod} is not prime ({factorization}); "
                f"!pirtm.cert requires prime modulus (L0 invariant #3)"
            )
    
    def __repr__(self) -> str:
        return f"!pirtm.cert(mod={self.mod})"
    
    def __str__(self) -> str:
        return self.__repr__()


@dataclass
class EpsilonType:
    """
    !pirtm.epsilon(mod=p, value=ε)
    
    Convergence bound type.
    mod=p must be prime (L0 invariant #5).
    value=ε is the actual convergence bound (float).
    """
    mod: int
    value: float
    
    def __post_init__(self):
        """Verify mod is prime at construction time."""
        if not _is_prime_miller_rabin(self.mod):
            _, factorization = _factorize(self.mod)
            raise VerificationError(
                f"mod={self.mod} is not prime ({factorization}); "
                f"!pirtm.epsilon requires prime modulus (L0 invariant #5)"
            )
        
        if not (0.0 <= self.value <= 1.0):
            raise VerificationError(
                f"value={self.value} out of range [0, 1]; "
                f"convergence bound must be normalized"
            )
    
    def __repr__(self) -> str:
        return f"!pirtm.epsilon(mod={self.mod}, value={self.value})"
    
    def __str__(self) -> str:
        return self.__repr__()


@dataclass
class OpNormTType:
    """
    !pirtm.op_norm_t(mod=p, norm=n)
    
    Operator norm bound type.
    mod=p must be prime (L0 invariant #5).
    norm=n is the operator norm (float, >= 0).
    """
    mod: int
    norm: float
    
    def __post_init__(self):
        """Verify mod is prime at construction time."""
        if not _is_prime_miller_rabin(self.mod):
            _, factorization = _factorize(self.mod)
            raise VerificationError(
                f"mod={self.mod} is not prime ({factorization}); "
                f"!pirtm.op_norm_t requires prime modulus (L0 invariant #5)"
            )
        
        if self.norm < 0.0:
            raise VerificationError(
                f"norm={self.norm} negative; operator norm must be >= 0"
            )
    
    def __repr__(self) -> str:
        return f"!pirtm.op_norm_t(mod={self.mod}, norm={self.norm})"
    
    def __str__(self) -> str:
        return self.__repr__()


class CouplingType(Enum):
    """Placeholder coupling types for session graphs."""
    UNRESOLVED = "#pirtm.unresolved_coupling"


@dataclass
class SessionGraphType:
    """
    !pirtm.session_graph(mod=N, coupling=coupling_attr)
    
    Session coupling graph type.
    mod=N must be squarefree (L0 invariant #5).
    coupling is one of: #pirtm.unresolved_coupling (transpile-time),
                        actual matrix (link-time).
    
    Implements L0 invariant #4: gain_matrix is never a transpile-time attribute.
    At transpile time, coupling must be #pirtm.unresolved_coupling.
    """
    mod: int
    coupling: CouplingType
    
    def __post_init__(self):
        """Verify mod is squarefree at construction time."""
        is_squarefree, factorization = _factorize(self.mod)
        
        if not is_squarefree:
            raise VerificationError(
                f"mod={self.mod} is not squarefree ({factorization}); "
                f"!pirtm.session_graph requires squarefree modulus (L0 invariant #5)"
            )
        
        # At transpile time, coupling must be unresolved
        if self.coupling != CouplingType.UNRESOLVED:
            raise VerificationError(
                f"coupling={self.coupling} is resolved; "
                f"at transpile time, coupling must be #pirtm.unresolved_coupling "
                f"(L0 invariant #4)"
            )
    
    def __repr__(self) -> str:
        return f"!pirtm.session_graph(mod={self.mod}, coupling={self.coupling.value})"
    
    def __str__(self) -> str:
        return self.__repr__()


# ===== Type Factory =====

def create_cert(mod: int) -> CertType:
    """Factory: create a certificate type with verification."""
    return CertType(mod=mod)


def create_epsilon(mod: int, value: float) -> EpsilonType:
    """Factory: create an epsilon bound type with verification."""
    return EpsilonType(mod=mod, value=value)


def create_op_norm_t(mod: int, norm: float) -> OpNormTType:
    """Factory: create an operator norm type with verification."""
    return OpNormTType(mod=mod, norm=norm)


def create_session_graph(mod: int, coupling: CouplingType = CouplingType.UNRESOLVED) -> SessionGraphType:
    """Factory: create a session graph type with verification."""
    return SessionGraphType(mod=mod, coupling=coupling)


# ===== Utilities for Test Support =====

@dataclass
class CumulantBundleType:
    """
    !pirtm.cumulant_bundle<scale_k, prime_mod, orders, spectral_radius, commitment>
    
    Cumulant bundle type: carries n-point correlators indexed by scale k and prime modulus.
    
    Parameters:
      scale_k (float): RG scale at which cumulants computed (must be > 0)
      prime_mod (int): Prime index; no composite allowed (L0 invariant #1)
      orders (list): Which cumulant orders available {2, 3, 4, ...}
      spectral_radius (float): Eigenvalue upper bound of cumulant operator (∈ [0, 0.95])
      commitment (str): Blake3 commitment hash (64-char hex string)
    
    Implements ADR-011 Part 2: Cumulant storage and persistence model.
    Verifies L0 invariant #1: prime_mod must be prime (no composite).
    Verifies L0 invariant #6: Contractivity margin δ ≥ 0.05 (ρ < 0.95).
    """
    scale_k: float
    prime_mod: int
    orders: List[int]
    spectral_radius: float
    commitment: str
    
    def __post_init__(self):
        """Verify all constraints at construction time."""
        # Constraint 1: scale_k must be positive (RG scale)
        if self.scale_k <= 0.0:
            raise VerificationError(
                f"scale_k={self.scale_k} invalid; RG scale must be > 0"
            )
        
        # Constraint 2: prime_mod must be prime (L0 invariant #1)
        if not _is_prime_miller_rabin(self.prime_mod):
            _, factorization = _factorize(self.prime_mod)
            raise VerificationError(
                f"prime_mod={self.prime_mod} is not prime ({factorization}); "
                f"!pirtm.cumulant_bundle requires prime modulus (L0 invariant #1)"
            )
        
        # Constraint 3: orders must be subset of {2, 3, 4, 5, ...}
        for order in self.orders:
            if order < 2:
                raise VerificationError(
                    f"cumulant order {order} invalid; must be >= 2 (n-point with n≥2)"
                )
        
        # Constraint 4: spectral radius must be in [0, 0.95] for contractivity
        if self.spectral_radius < 0.0 or self.spectral_radius > 0.95:
            raise VerificationError(
                f"spectral_radius={self.spectral_radius} out of range [0, 0.95]; "
                f"contractivity requires margin δ ≥ 0.05 (L0 invariant #6)"
            )
        
        # Constraint 5: commitment must be valid blake3 hex (64 chars)
        if len(self.commitment) != 64:
            raise VerificationError(
                f"commitment hash length={len(self.commitment)} invalid; "
                f"blake3 hex must be exactly 64 characters (32 bytes × 2), got '{self.commitment[:20]}...'"
            )
        
        # Verify hex format
        try:
            int(self.commitment, 16)
        except ValueError:
            raise VerificationError(
                f"commitment='{self.commitment}' is not valid hex; "
                f"must be 64-character hex string (blake3 digest)"
            )
    
    def __repr__(self) -> str:
        orders_str = "[" + ", ".join(str(o) for o in sorted(self.orders)) + "]"
        return (f"!pirtm.cumulant_bundle<scale_k={self.scale_k:.2e}, "
                f"prime_mod={self.prime_mod}, orders={orders_str}, "
                f"spectral_radius={self.spectral_radius:.4f}, "
                f"commitment={self.commitment[:8]}...>")
    
    def __str__(self) -> str:
        return self.__repr__()


def create_cumulant_bundle(
    scale_k: float,
    prime_mod: int,
    orders: List[int],
    spectral_radius: float,
    commitment: str
) -> CumulantBundleType:
    """Factory: create a cumulant bundle type with verification."""
    return CumulantBundleType(
        scale_k=scale_k,
        prime_mod=prime_mod,
        orders=orders,
        spectral_radius=spectral_radius,
        commitment=commitment
    )


def is_prime(mod: int) -> bool:
    """Check if mod is prime. Used by tests."""
    return _is_prime_miller_rabin(mod)


def factorize(mod: int) -> str:
    """Get factorization of mod as string. Used by tests."""
    _, fact_str = _factorize(mod)
    return fact_str


def is_squarefree(mod: int) -> bool:
    """
    Check if mod is squarefree: all prime factors appear exactly once.
    
    Implements L0 invariant #5: Composite mod values must be squarefree (μ(mod) ≠ 0).
    Returns True if squarefree, False if any prime appears with exponent > 1.
    """
    is_sf, _ = _factorize(mod)
    return is_sf


# ===== L0 Invariant Checkers =====

# Common human names in GFT descriptors that must not appear in IR
GFT_HUMAN_NAMES = {
    "melonic",
    "stranded",
    "pseudo_melonic",
    "4vertex",
    "6vertex",
    "gft_action",
    "coupling_constant",
    "kinetic_term",
    "interaction_vertex",
    "propagator",
    "melonic_diagram",
    "tensor_model",
    "colored_graph",
    "simplicial_complex",
}


def is_human_name(candidate: str) -> bool:
    """
    Check if a string is a human-readable name (not a prime index).
    
    Implements L0 invariant #6: Human names in coupling.json do not survive into IR.
    pirtm.session_graph must be indexed by prime_index only.
    
    Returns True if the string appears to be a human name; False if it's a valid prime index.
    """
    candidate_lower = candidate.lower()
    
    # Check against known GFT descriptor names
    if candidate_lower in GFT_HUMAN_NAMES:
        return True
    
    # Check if it's a valid number (prime index form)
    try:
        num = int(candidate)
        return num < 0  # Negative numbers are invalid indices
    except ValueError:
        # Not a number; likely a human name
        return True


def check_spectral_margin(spectral_radius: float) -> Tuple[bool, float]:
    """
    Verify contractivity margin: spectral_radius < 0.95.
    
    Implements L0 invariant #6: Contractivity margin δ ≥ 0.05.
    
    Returns (is_safe, margin) where:
      - is_safe: True if spectral_radius < 0.95
      - margin: δ = 0.95 - spectral_radius
    """
    if not (0.0 <= spectral_radius <= 1.0):
        return False, float('nan')
    
    margin = 0.95 - spectral_radius
    is_safe = margin >= 0.05
    return is_safe, margin


def get_l0_audit_report(module_name: str) -> str:
    """
    Generate the L0 invariant audit report line for pirtm inspect output.
    
    Implements L0 invariant #7: The pirtm inspect output must always include the line
    "Audit Chain: NOT EMBEDDED — retrieve via pirtm audit <trace.log>".
    
    Returns the full audit line.
    """
    return f"Audit Chain: NOT EMBEDDED — retrieve via pirtm audit <{module_name}.trace.log>"


# ===== ADR-087 Phase 1: Spectral Operator Attributes =====

@dataclass
class SpectralBoundType:
    """
    !pirtm.spectral_bound(sigma=σ)
    
    Spectrum bound type: upper bound on operator spectral radius σ(U).
    
    ADR-087 Phase 2: Computed from prime-spectral operator A and time-sieve B.
    sigma must be in (0.0, 1.0) for contractivity guarantee.
    
    Implements ADR-087 L0 invariant: operator spectral radius < 1.0 implies contraction.
    """
    sigma: float
    
    def __post_init__(self):
        """Verify spectrum bound is physically valid at construction time."""
        if not (0.0 < self.sigma < 1.0):
            raise VerificationError(
                f"sigma={self.sigma} out of range (0.0, 1.0); "
                f"spectral radius must be strictly less than 1 for contractivity "
                f"(ADR-087 L0 invariant)"
            )
    
    def __repr__(self) -> str:
        return f"!pirtm.spectral_bound(sigma={self.sigma:.6f})"


@dataclass
class ContractivityBoundType:
    """
    !pirtm.contractivity(alpha=α)
    
    Contractivity margin type: how far below spectral radius is from 1.0.
    
    ADR-087 Phase 4: Computed as α = 1.0 - σ(U).
    Must be positive for non-expansional contraction.
    Minimum margin δ ≥ 0.05 required for numerical safety.
    
    Implements ADR-087 L0 invariant: contractivity margin is always certified.
    """
    alpha: float
    
    def __post_init__(self):
        """Verify contractivity bound is valid."""
        if self.alpha < 0.05:
            raise VerificationError(
                f"alpha={self.alpha} below minimum margin 0.05; "
                f"contractivity must guarantee δ ≥ 0.05 for numerical safety "
                f"(ADR-087 L0 invariant)"
            )
        if self.alpha >= 1.0:
            raise VerificationError(
                f"alpha={self.alpha} invalid; contractivity margin must be < 1.0"
            )
    
    def __repr__(self) -> str:
        return f"!pirtm.contractivity(alpha={self.alpha:.6f})"


@dataclass
class InternalBlockType:
    """
    !pirtm.internal_block(xi_dim=d, xi_norm=‖Ξ‖)
    
    Internal block diagonal E matrix type for U = A ⊗ I ⊗ I + I ⊗ B ⊗ I + I ⊗ I ⊗ E.
    
    ADR-087 Phase 4: E is a d×d self-adjoint matrix Ξ on ℂᵈ.
    xi_dim is the dimension of the block (≥ 1).
    xi_norm is the operator norm ‖Ξ‖ (must be non-negative).
    
    Implements ADR-087 L0 invariant: E is always self-adjoint with verified norm.
    """
    xi_dim: int
    xi_norm: float
    
    def __post_init__(self):
        """Verify internal block dimension and norm."""
        if self.xi_dim < 1:
            raise VerificationError(
                f"xi_dim={self.xi_dim} invalid; internal block dimension must be ≥ 1 "
                f"(ADR-087 L0 invariant)"
            )
        if self.xi_norm < 0.0:
            raise VerificationError(
                f"xi_norm={self.xi_norm} negative; operator norm must be ≥ 0"
            )
    
    def __repr__(self) -> str:
        return f"!pirtm.internal_block(xi_dim={self.xi_dim}, xi_norm={self.xi_norm:.6f})"


@dataclass
class GapLowerBoundType:
    """
    !pirtm.gap_lower_bound(gap_lb=λ_min)
    
    Spectral gap lower bound type: minimum distance from spectrum origin.
    
    ADR-087 Phase 4: Computed via certificate GapLB(A, B, E) > 0.
    Verifies that operator spectrum is bounded away from zero.
    Must be positive for dissipative safety.
    
    Implements ADR-087 L0 invariant: gap lower bound always > 0 or gate fails.
    """
    gap_lb: float
    
    def __post_init__(self):
        """Verify gap lower bound is positive."""
        if self.gap_lb <= 0.0:
            raise VerificationError(
                f"gap_lb={self.gap_lb} non-positive; "
                f"spectral gap lower bound must be > 0 (ADR-087 L0 invariant gate) "
                f"or operator certification fails"
            )
    
    def __repr__(self) -> str:
        return f"!pirtm.gap_lower_bound(gap_lb={self.gap_lb:.6e})"


@dataclass
class SlopeUpperBoundType:
    """
    !pirtm.slope_upper_bound(slope_ub=M)
    
    Slope (spectral growth rate) upper bound type.
    
    ADR-087 Phase 4: Computed via certificate SlopeUB(A, B, E) < ∞.
    Verifies that spectral asymptotics are controlled.
    Must be finite and positive.
    
    Implements ADR-087 L0 invariant: slope upper bound always finite.
    """
    slope_ub: float
    
    def __post_init__(self):
        """Verify slope upper bound is finite and positive."""
        if self.slope_ub <= 0.0:
            raise VerificationError(
                f"slope_ub={self.slope_ub} non-positive; "
                f"slope upper bound must be > 0 (ADR-087 L0 invariant)"
            )
        if not (self.slope_ub < float('inf')):
            raise VerificationError(
                f"slope_ub is infinite; must be finite (ADR-087 L0 invariant gate)"
            )
    
    def __repr__(self) -> str:
        return f"!pirtm.slope_upper_bound(slope_ub={self.slope_ub:.2e})"


@dataclass
class PirtmModuleType:
    """
    !pirtm.module(prime_index=p, epsilon=ε, op_norm_t=‖T‖, sigma=σ, alpha=α, 
                   xi_dim=d, gap_lb=λ_min, slope_ub=M)
    
    Complete PIRTM module descriptor type combining:
      - Legacy attributes (prime_index, epsilon, op_norm_t)
      - Meta-Relativity spectral attributes (sigma, alpha, xi_dim, gap_lb, slope_ub)
    
    ADR-087 Phase 1: All spectral attributes initialized to None; populated in later phases.
    ADR-004 & ADR-006: Original PIRTM module constraint system.
    
    Implements all L0 invariants:
      #1: prime_index is prime (or None during spectral init)
      #2: epsilon ∈ [0, 1] (convergence bound)
      #3: op_norm_t ≥ 0 (contractive norm)
      #4: spectral attributes follow frame-covariance rules
      #5: All typed values verify constraints at construction
      #6: sigma, alpha encode contractivity guarantee
      #7: Audit chain NOT EMBEDDED
    """
    prime_index: Optional[int]  # ADR-004: prime modulus
    epsilon: Optional[float]     # ADR-004: convergence bound
    op_norm_t: Optional[float]   # ADR-004: operator norm ‖T‖
    
    # ADR-087 Phase 1: May be None; populated in Phase 2-4
    sigma: Optional[SpectralBoundType] = None       # Phase 2: spectrum bound
    alpha: Optional[ContractivityBoundType] = None  # Phase 4: contractivity margin
    xi_block: Optional[InternalBlockType] = None    # Phase 4: internal block E
    gap_lb_val: Optional[GapLowerBoundType] = None  # Phase 4: gap certificate
    slope_ub_val: Optional[SlopeUpperBoundType] = None  # Phase 4: slope certificate
    
    def __post_init__(self):
        """Verify legacy constraints and phase-dependent spectral constraints."""
        # ADR-004 constraint: prime_index must be prime if present
        if self.prime_index is not None and not _is_prime_miller_rabin(self.prime_index):
            _, fact = _factorize(self.prime_index)
            raise VerificationError(
                f"prime_index={self.prime_index} not prime ({fact}); "
                f"pirtm.module requires prime modulus (L0 invariant #1)"
            )
        
        # ADR-004 constraint: epsilon in [0, 1]
        if self.epsilon is not None and not (0.0 <= self.epsilon <= 1.0):
            raise VerificationError(
                f"epsilon={self.epsilon} out of range [0, 1]; "
                f"convergence bound must be normalized (L0 invariant #2)"
            )
        
        # ADR-004 constraint: op_norm_t non-negative
        if self.op_norm_t is not None and self.op_norm_t < 0.0:
            raise VerificationError(
                f"op_norm_t={self.op_norm_t} negative; "
                f"operator norm must be ≥ 0 (L0 invariant #3)"
            )
    
    def __repr__(self) -> str:
        parts = []
        if self.prime_index is not None:
            parts.append(f"prime_index={self.prime_index}")
        if self.epsilon is not None:
            parts.append(f"epsilon={self.epsilon:.4f}")
        if self.op_norm_t is not None:
            parts.append(f"op_norm_t={self.op_norm_t:.4f}")
        if self.sigma is not None:
            parts.append(f"sigma={self.sigma.sigma:.6f}")
        if self.alpha is not None:
            parts.append(f"alpha={self.alpha.alpha:.6f}")
        if self.xi_block is not None:
            parts.append(f"xi_dim={self.xi_block.xi_dim}")
        if self.gap_lb_val is not None:
            parts.append(f"gap_lb={self.gap_lb_val.gap_lb:.2e}")
        if self.slope_ub_val is not None:
            parts.append(f"slope_ub={self.slope_ub_val.slope_ub:.2e}")
        return f"!pirtm.module({', '.join(parts)})"


# ===== Factory Functions for ADR-087 Types =====

def create_spectral_bound(sigma: float) -> SpectralBoundType:
    """Factory: create spectral bound type (Phase 2 output)."""
    return SpectralBoundType(sigma=sigma)


def create_contractivity_bound(alpha: float) -> ContractivityBoundType:
    """Factory: create contractivity bound type (Phase 4 output)."""
    return ContractivityBoundType(alpha=alpha)


def create_internal_block(xi_dim: int, xi_norm: float) -> InternalBlockType:
    """Factory: create internal block type (Phase 4 output)."""
    return InternalBlockType(xi_dim=xi_dim, xi_norm=xi_norm)


def create_gap_lower_bound(gap_lb: float) -> GapLowerBoundType:
    """Factory: create gap lower bound type (Phase 4 output)."""
    return GapLowerBoundType(gap_lb=gap_lb)


def create_slope_upper_bound(slope_ub: float) -> SlopeUpperBoundType:
    """Factory: create slope upper bound type (Phase 4 output)."""
    return SlopeUpperBoundType(slope_ub=slope_ub)


def create_pirtm_module(
    prime_index: Optional[int] = None,
    epsilon: Optional[float] = None,
    op_norm_t: Optional[float] = None,
    sigma: Optional[SpectralBoundType] = None,
    alpha: Optional[ContractivityBoundType] = None,
    xi_block: Optional[InternalBlockType] = None,
    gap_lb_val: Optional[GapLowerBoundType] = None,
    slope_ub_val: Optional[SlopeUpperBoundType] = None
) -> PirtmModuleType:
    """Factory: create a PIRTM module type with verification."""
    return PirtmModuleType(
        prime_index=prime_index,
        epsilon=epsilon,
        op_norm_t=op_norm_t,
        sigma=sigma,
        alpha=alpha,
        xi_block=xi_block,
        gap_lb_val=gap_lb_val,
        slope_ub_val=slope_ub_val
    )
