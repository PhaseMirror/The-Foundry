"""
PIRTM Contractivity Certification - ACE System (Phase 1+)

ACE (Asymmetric Convergence Envelope) system provides:
1. Convergence certification via witness commitments
2. Prime-indexed spectral bounds
3. PIRTM-native attestation projection for deterministic serialization

Refactored for backend abstraction (Phase 1 Liberation).
See ADR-006 for backend protocol, ADR-004 for contractivity semantics.
See ADR-010 for centralized threshold documentation.

Reference: docs/PHASE_1_EXPANDED.md (Days 5 refactoring)
          validators/ace/ (Full ACE implementation)
"""

from typing import Any, Dict, Optional
from ..backend import TensorBackend, Array, Scalar, current_backend
from ..constants import OPERATOR_CONTRACTIVITY_BOUND, DEFAULT_EPSILON, MARGIN_WARNING_THRESHOLD


class ContractivityCertificate:
    """
    Certificate that a trajectory is contractive.
    
    Attributes:
        epsilon: Contraction margin (ε in ||q_t|| < 1 - ε)
        confidence: Confidence level (e.g., 0.9999 for 99.99%)
        spectral_radius: Largest eigenvalue of system operator
        state_norm: Norm of final state
        trace_id: Unique identifier for this certification
        ace_proof: Optional legacy compatibility payload
    """
    
    def __init__(
        self,
        epsilon: Scalar,
        confidence: Scalar,
        spectral_radius: Scalar,
        state_norm: Scalar,
        trace_id: str = "pirtm_cert",
        ace_proof: Optional[Dict[str, Any]] = None,
    ):
        self.epsilon = float(epsilon)
        self.confidence = float(confidence)
        self.spectral_radius = float(spectral_radius)
        self.state_norm = float(state_norm)
        self.trace_id = trace_id
        self.ace_proof = ace_proof or {}
        
        # Verify invariants
        assert self.epsilon > 0, "epsilon must be positive"
        assert 0.0 < self.confidence <= 1.0, "confidence must be in (0, 1]"
        assert self.spectral_radius >= 0, "spectral_radius must be non-negative"
        assert self.state_norm >= 0, "state_norm must be non-negative"
    
    def is_valid(self) -> bool:
        """
        Check if certificate satisfies L0 invariant.
        
        ADR-010: Uses OPERATOR_CONTRACTIVITY_BOUND from pirtm.constants
        """
        # L0 invariant: state_norm < OPERATOR_CONTRACTIVITY_BOUND - epsilon
        return self.state_norm < (OPERATOR_CONTRACTIVITY_BOUND - self.epsilon)
    
    def contraction_margin(self) -> Scalar:
        """
        Remaining contraction margin: OPERATOR_CONTRACTIVITY_BOUND - ε - ||q_t||
        
        ADR-010: References OPERATOR_CONTRACTIVITY_BOUND from pirtm.constants
        """
        return (OPERATOR_CONTRACTIVITY_BOUND - self.epsilon) - self.state_norm
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize to dictionary (for storage/transmission)."""
        return {
            "epsilon": self.epsilon,
            "confidence": self.confidence,
            "spectral_radius": self.spectral_radius,
            "state_norm": self.state_norm,
            "trace_id": self.trace_id,
            "is_valid": self.is_valid(),
            "contraction_margin": self.contraction_margin(),
            "ace_proof": self.ace_proof,
        }

    def to_attestation(
        self,
        *,
        proof_hash: str,
        witness_commitment: str,
        trace_hash: str,
        certificate_kind: str,
        issued_at_epoch: int,
        verification_result: bool,
        prime_index: int | None = None,
        session_prime_vector: tuple[int, ...] = (),
        op_norm_T: float | None = None,
        identity_binding: str | None = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """Project this certificate into the canonical PIRTM-native attestation form."""
        from .attestation import PIRTMAttestation

        return PIRTMAttestation.from_contractivity_certificate(
            self,
            proof_hash=proof_hash,
            witness_commitment=witness_commitment,
            trace_hash=trace_hash,
            certificate_kind=certificate_kind,
            issued_at_epoch=issued_at_epoch,
            verification_result=verification_result,
            prime_index=prime_index,
            session_prime_vector=session_prime_vector,
            op_norm_T=op_norm_T,
            identity_binding=identity_binding,
            metadata=metadata,
        )


def certify_state(
    X: Array,
    Xi: Array,
    Lambda: Array,
    op_norm_T: float = 0.25,
    epsilon: Scalar = DEFAULT_EPSILON,
    confidence: Scalar = 0.9999,
    trace_id: str = "pirtm_cert",
    backend: Optional[TensorBackend] = None,
) -> ContractivityCertificate:
    """
    Create contractivity certificate for current state and operators.
    
    Args:
        X: Current state vector
        Xi: Coefficient operator matrix (must compute norm)
        Lambda: Aggregation operator matrix (must compute norm)
        op_norm_T: Lipschitz constant of nonlinear transformation (default 0.25 for sigmoid)
        epsilon: Contraction margin (default DEFAULT_EPSILON from pirtm.constants)
        confidence: Confidence level (default 0.9999)
        trace_id: Unique identifier for this trace
        backend: TensorBackend to use
    
    Returns:
        ContractivityCertificate instance
    
    Note (ADR-002, ADR-010):
        The contractivity condition is: q_t = ||Ξ|| + ||Λ||·L_T < OPERATOR_CONTRACTIVITY_BOUND - ε
        This function now computes the true spectral radius from operators,
        not as a proxy from state norm. The round-trip identity requires:
        cert.spectral_radius == q_t from step() for the same operators.
        
        OPERATOR_CONTRACTIVITY_BOUND is defined in pirtm.constants (see ADR-010).
        
        This is the basic runtime certification. PIRTM-native attestations are
        the canonical serialization surface for downstream tooling; any legacy
        third-party proof payloads remain compatibility-only.
    """
    if backend is None:
        backend = current_backend()
    
    state_norm = backend.norm(X)
    
    # Correct contractivity condition: q = ||Ξ|| + ||Λ||·L_T
    # No longer using state_norm as proxy (ADR-002 fix)
    spectral_radius = float(backend.norm(Xi)) + float(backend.norm(Lambda)) * op_norm_T
    
    cert = ContractivityCertificate(
        epsilon=epsilon,
        confidence=confidence,
        spectral_radius=spectral_radius,
        state_norm=state_norm,
        trace_id=trace_id,
    )
    
    return cert


class FormalStabilityCertificate:
    """
    Structured bridge between Python runtime metrics and Lean 4 formal theorems.
    
    This class emits stability metrics (norms, lambda_m, contraction constants)
    in a format that directly maps to the hypotheses of the Lean 4 proofs
    defined in PhaseMirror.PIRTM.RecursiveStability and Pirtm.Contractivity.
    
    Mapping (BRIDGE):
        - pirtm_contraction_const: Derived from lambda_m and L_G.
        - pirtm_step_lipschitz: Bound derived from ||Xi|| + ||Lambda|| * L_T.
        - pirtm_contraction_theorem: The overarching Banach guarantee.
    """
    
    def __init__(
        self,
        lambda_m: float,
        norm_Xi: float,
        norm_Lambda: float,
        L_T: float,
        epsilon: float = 0.05,
    ):
        self.lambda_m = float(lambda_m)
        self.norm_Xi = float(norm_Xi)
        self.norm_Lambda = float(norm_Lambda)
        self.L_T = float(L_T)
        self.epsilon = float(epsilon)
        
        # Intermediate formal metrics
        self.L_G = self.norm_Xi + self.norm_Lambda * self.L_T
        self.c_theory = 1.0 - self.lambda_m * (1.0 - self.L_G)
        self.margin = (1.0 - self.epsilon) - self.c_theory
        
    def to_bridge_dict(self) -> Dict[str, Any]:
        """
        Emits a dictionary compatible with the PIRTM_PROOF_MAP.md schema.
        """
        return {
            "lean_mapping": {
                "lambda_m": self.lambda_m,
                "L_G": self.L_G,
                "pirtm_contraction_const": self.c_theory,
                "pirtm_step_lipschitz_bound": self.L_G,
                "is_contractive": self.c_theory < 1.0,
                "is_certified": self.margin >= 0.0,
            },
            "runtime_metrics": {
                "norm_Xi": self.norm_Xi,
                "norm_Lambda": self.norm_Lambda,
                "L_T": self.L_T,
                "epsilon": self.epsilon,
                "margin": self.margin,
            },
            "proof_obligations": [
                {"theorem": "pirtm_step_lipschitz", "hypothesis": f"L_G = {self.L_G}"},
                {"theorem": "pirtm_contraction_theorem", "hypothesis": f"lambda_m = {self.lambda_m}, L_G = {self.L_G}"},
                {"theorem": "pirtm_fixed_point_exists", "guarantee": "Unique stability point exists"}
            ]
        }

    def verify_compliance(self) -> bool:
        """Checks if the current metrics satisfy the formal contraction hypotheses."""
        # Hypotheses: 0 < lambda_m <= 1 AND L_G < 1
        return (0.0 < self.lambda_m <= 1.0) and (self.L_G < 1.0)


def verify_trajectory(
    trajectory: list[Any],
    epsilon: Scalar = 0.05,
    backend: Optional[TensorBackend] = None,
) -> Dict[str, Any]:
    """
    Verify entire trajectory satisfies contractivity.
    
    Args:
        trajectory: List of state vectors over time
        epsilon: Contraction margin
        backend: TensorBackend to use
    
    Returns:
        Dict with verification results:
        - all_valid: True if all states satisfy invariant
        - violations: List of (t, state_norm) where invariant fails
        - max_margin: Minimum remaining contraction margin
    """
    if backend is None:
        backend = current_backend()
    
    violations = []
    margins = []
    
    margins: list[float] = []
    violations: list[tuple[int, float]] = []
    
    for t, X_t in enumerate(trajectory):
        norm_t = backend.norm(X_t)
        margin = (1.0 - epsilon) - norm_t
        margins.append(margin)
        
        if margin < 0:
            violations.append((t, float(norm_t)))
    
    return {
        "all_valid": len(violations) == 0,
        "violations": violations,
        "max_margin": float(min(margins)) if margins else 0.0,
        "total_steps": len(trajectory),
    }


__all__ = [
    "ContractivityCertificate",
    "certify_state",
    "verify_trajectory",
]
