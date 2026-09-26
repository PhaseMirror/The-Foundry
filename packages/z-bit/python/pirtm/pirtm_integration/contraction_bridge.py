"""Contraction and spectral bridges for PIRTM integration.

Connects PIRTM's contraction certification system with the existing
CRMF, ACE, and spectral governance implementations.
"""

from dataclasses import dataclass
from typing import Callable, Dict, Optional, Tuple
import numpy as np

from pirtm.core.recurrence import step as pirtm_step


@dataclass(frozen=True)
class LegacyCertificateLevel:
    """Compatibility enum-like wrapper for legacy bridge callers."""

    name: str


@dataclass(frozen=True)
class LegacyAceCertificate:
    """Compatibility view over current PIRTM runtime certification data."""

    certified: bool
    level: LegacyCertificateLevel
    contraction_q: float
    bias_norm: float


@dataclass(frozen=True)
class LegacyStepInfo:
    """Minimal adapter for the historical bridge-facing step information."""

    q_t: float
    bias_norm: float
    state_norm: float


@dataclass(frozen=True)
class LegacySpectralReport:
    """Lightweight report object replacing the removed legacy governor API."""

    spectral_radius: float
    operator_norm: float
    epsilon: float
    is_contractive: bool
    margin: float

    def to_dict(self) -> Dict[str, float | bool]:
        return {
            "spectral_radius": self.spectral_radius,
            "operator_norm": self.operator_norm,
            "epsilon": self.epsilon,
            "is_contractive": self.is_contractive,
            "margin": self.margin,
        }


class LegacySpectralGovernor:
    """Explicit legacy adapter for integration code that still expects a governor object."""

    def __init__(
        self,
        operator_matrix: np.ndarray,
        transform: Callable[[np.ndarray], np.ndarray],
        dim: int,
        op_norm_T: float,
        epsilon: float = 0.05,
    ):
        self.operator_matrix = operator_matrix
        self.transform = transform
        self.dim = dim
        self.op_norm_T = op_norm_T
        self.epsilon = epsilon

    def report(self) -> LegacySpectralReport:
        spectral_radius = float(np.max(np.abs(np.linalg.eigvals(self.operator_matrix))))
        margin = 1.0 - spectral_radius
        return LegacySpectralReport(
            spectral_radius=spectral_radius,
            operator_norm=self.op_norm_T,
            epsilon=self.epsilon,
            is_contractive=spectral_radius < 1.0 - self.epsilon,
            margin=margin,
        )


SpectralGovernor = LegacySpectralGovernor
SpectralReport = LegacySpectralReport


def ace_certificate(info: LegacyStepInfo, epsilon: float) -> LegacyAceCertificate:
    """Bridge current PIRTM runtime metadata into the historical ACE-style certificate shape."""

    certified = info.q_t < 1.0 - epsilon
    if info.q_t < 1.0 - epsilon:
        level = LegacyCertificateLevel("PASS")
    elif info.q_t < 1.0:
        level = LegacyCertificateLevel("WARN")
    else:
        level = LegacyCertificateLevel("FAIL")

    return LegacyAceCertificate(
        certified=certified,
        level=level,
        contraction_q=info.q_t,
        bias_norm=info.bias_norm,
    )


class ContractionBridge:
    """Bridges PIRTM contraction system with existing CRMF/ACE implementations.
    
    This allows existing modules to leverage PIRTM's certified contraction
    guarantees without full refactoring.
    """
    
    def __init__(self, epsilon: float = 0.05):
        """Initialize contraction bridge.
        
        Args:
            epsilon: Minimum contraction margin (default 0.05)
        """
        self.epsilon = epsilon
        
    def certify_convergence(
        self,
        operator: np.ndarray,
        state: np.ndarray,
        prime_decomposition: Optional[Dict[int, float]] = None
    ) -> Tuple[bool, float, Dict]:
        """Certify that operator-state pair contracts.
        
        Args:
            operator: Linear operator T
            state: Current state X_t
            prime_decomposition: Optional prime decomposition for metadata
            
        Returns:
            Tuple of (is_stable, spectral_radius, metadata_dict)
        """
        # Compute spectral radius
        eigenvalues = np.linalg.eigvals(operator)
        spectral_radius = float(np.max(np.abs(eigenvalues)))
        
        # Check contraction (spectral radius < 1 - epsilon)
        is_stable = spectral_radius < (1.0 - self.epsilon)
        
        metadata = {
            "spectral_radius": spectral_radius,
            "contraction_margin": 1.0 - spectral_radius,
            "epsilon": self.epsilon,
            "operator_norm": float(np.linalg.norm(operator, ord=2)),
            "state_norm": float(np.linalg.norm(state)),
        }
        
        if prime_decomposition:
            metadata["prime_decomposition"] = prime_decomposition
            
        return is_stable, spectral_radius, metadata
    
    def create_crmf_certificate(
        self,
        trace_id: str,
        spectral_radius: float,
        metadata: Dict
    ) -> Dict:
        """Create CRMF-compatible certificate from PIRTM data.
        
        This allows existing CRMF code to use PIRTM certification.
        
        Args:
            trace_id: Unique trace identifier
            spectral_radius: Computed spectral radius
            metadata: Additional metadata
            
        Returns:
            CRMF ContractionCertificate-compatible dict
        """
        return {
            "trace_id": trace_id,
            "spectral_radius": spectral_radius,
            "is_stable": spectral_radius < 1.0,
            "metadata": metadata,
        }
    
    def pirtm_step_to_crmf(
        self,
        x0: np.ndarray,
        operator: np.ndarray,
        trace_id: str = "pirtm_bridge"
    ) -> Tuple[np.ndarray, Dict]:
        """Execute PIRTM step and return CRMF-compatible results.
        
        Args:
            x0: Initial state
            operator: System operator T
            trace_id: Trace identifier
            
        Returns:
            Tuple of (next_state, crmf_certificate)
        """
        # Set up PIRTM parameters
        Xi_t = np.zeros((len(x0), len(x0)))
        Lam_t = np.eye(len(x0))
        g_t = np.zeros(len(x0))
        
        def T(x):
            return operator @ x
        
        # Execute PIRTM step
        try:
            x1, metadata = pirtm_step(
                X_t=x0,
                Xi_t=Xi_t,
                Lambda_t=Lam_t,
                G_t=g_t,
                T_func=T,
            )

            info = LegacyStepInfo(
                q_t=float(np.max(np.abs(np.linalg.eigvals(operator)))),
                bias_norm=float(np.linalg.norm(x1 - x0)),
                state_norm=float(np.linalg.norm(x1)),
            )
            
            # Create ACE certificate
            cert = ace_certificate(info, epsilon=self.epsilon)
            
            # Convert to CRMF format
            crmf_cert = self.create_crmf_certificate(
                trace_id=trace_id,
                spectral_radius=info.q_t,
                metadata={
                    "ace_certified": cert.certified,
                    "ace_level": cert.level.name,
                    "contraction_q": info.q_t,
                    "bias_norm": info.bias_norm,
                    "epsilon": self.epsilon,
                    "backend": metadata.get("backend"),
                }
            )
            
            return x1, crmf_cert
            
        except Exception as e:
            # Fallback: simple operator application
            x1 = operator @ x0
            spectral_radius = float(np.linalg.norm(operator, ord=2))
            
            crmf_cert = self.create_crmf_certificate(
                trace_id=trace_id,
                spectral_radius=spectral_radius,
                metadata={
                    "error": str(e),
                    "fallback_mode": True,
                }
            )
            
            return x1, crmf_cert


class SpectralBridge:
    """Bridges PIRTM spectral analysis with existing implementations.
    
    Provides unified interface for spectral radius computation,
    decomposition, and stability analysis.
    """
    
    def __init__(self):
        """Initialize spectral bridge."""
        self.governor = None
        
    def compute_spectral_radius(
        self,
        operator: np.ndarray,
        method: str = "eigenvalue"
    ) -> float:
        """Compute spectral radius using specified method.
        
        Args:
            operator: Matrix to analyze
            method: "eigenvalue" (exact) or "power_iteration" (approximate)
            
        Returns:
            Spectral radius value
        """
        if method == "eigenvalue":
            eigenvalues = np.linalg.eigvals(operator)
            return float(np.max(np.abs(eigenvalues)))
        
        elif method == "power_iteration":
            # Use power iteration for large matrices
            n = operator.shape[0]
            x = np.random.randn(n)
            x = x / np.linalg.norm(x)
            
            for _ in range(100):  # iterations
                x_new = operator @ x
                x_new_norm = np.linalg.norm(x_new)
                if x_new_norm < 1e-10:
                    break
                x = x_new / x_new_norm
                
            return float(x_new_norm)
        
        else:
            raise ValueError(f"Unknown method: {method}")
    
    def create_spectral_governor(self, operator: np.ndarray) -> SpectralGovernor:
        """Create PIRTM SpectralGovernor for advanced analysis.
        
        Args:
            operator: System operator to govern
            
        Returns:
            Configured SpectralGovernor instance
        """
        self.governor = SpectralGovernor(
            operator_matrix=operator,
            transform=lambda x: operator @ x,
            dim=operator.shape[0],
            op_norm_T=float(np.linalg.norm(operator, ord=2)),
        )
        return self.governor
    
    def analyze_stability(
        self,
        operator: np.ndarray,
        epsilon: float = 0.05
    ) -> Dict:
        """Comprehensive stability analysis using PIRTM.
        
        Args:
            operator: System operator
            epsilon: Required contraction margin
            
        Returns:
            Dictionary with stability metrics
        """
        spectral_radius = self.compute_spectral_radius(operator)
        operator_norm = float(np.linalg.norm(operator, ord=2))
        
        # Check various stability conditions
        is_contractive = spectral_radius < 1.0 - epsilon
        is_stable = spectral_radius < 1.0
        is_bounded = operator_norm < float('inf')
        
        # Compute condition number
        try:
            cond_number = float(np.linalg.cond(operator))
        except:
            cond_number = float('inf')
        
        return {
            "spectral_radius": spectral_radius,
            "operator_norm": operator_norm,
            "condition_number": cond_number,
            "is_contractive": is_contractive,
            "is_stable": is_stable,
            "is_bounded": is_bounded,
            "contraction_margin": 1.0 - spectral_radius if is_stable else None,
            "epsilon": epsilon,
        }
    
    def bridge_to_ace(
        self,
        operator: np.ndarray,
        state: np.ndarray,
        prime_decomposition: Optional[Dict[int, float]] = None
    ) -> Dict:
        """Bridge spectral analysis to ACE certification format.
        
        Args:
            operator: System operator
            state: Current state
            prime_decomposition: Optional prime decomposition
            
        Returns:
            ACE-compatible certification data
        """
        stability = self.analyze_stability(operator)
        
        return {
            "X_n": float(np.linalg.norm(state)),
            "R_t": stability["spectral_radius"],
            "theta_epsilon": stability["epsilon"],
            "is_stable": stability["is_stable"],
            "spectral_analysis": stability,
            "prime_decomposition": prime_decomposition or {},
        }
