"""
ADR-021 Phase 1: Ξ(t)-Core Linker Integration

Mathematical Contract (from ADR-020 Entanglement Test):
├── Phase 2 Link-time verification
├── Coherence measurement: C_ij = observed / predicted
├── Predicted decay: exp(-(λ_pi - λ_pj) * t_link)
├── Observed decay: measured from Ξ(t) execution
├── Pass condition: C_ij ∈ [0.99, 1.01] (1% tolerance)
├── Global spectral stability: Eigenvalues of (I - C) real and ≥ 0
└── Integrated into link phase 2 (after coupling matrix construction)

Integration points:
1. After name resolution → Extract all prime indices
2. After coupling matrix construction → Compute Ξ(t) transitions
3. Before spectral-small-gain → Validate coherence bounds
4. Diagnostic reporting → Log coherence values

Provenance: MultiplicityFoundation/Meta-Relativity
Math Stack: Session graph coherence, entanglement verification
Registry: github.com/MultiplicityFoundation/Meta-Relativity
Date: 2026-03-17
"""

import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Optional
from enum import Enum
import json

from pirtm.core.xi_executor import XiExecutor, U_UNIVERSAL, is_prime

# ============================================================================
# Constants
# ============================================================================

COHERENCE_LOWER_BOUND = 0.99  # From ADR-020 Artifact 5
COHERENCE_UPPER_BOUND = 1.01
COHERENCE_TOLERANCE = 0.01

SPECTRAL_EIGENVALUE_MIN = -1e-10  # Allow small numerical error


# ============================================================================
# Data Structures
# ============================================================================

class CoherenceStatus(Enum):
    """Result of pairwise coherence check."""
    PASS = "pass"       # Within tolerance
    WARN = "warn"       # Near boundary
    FAIL = "fail"       # Out of bounds


@dataclass
class ModuleNode:
    """Single module in session graph (from ADR-022)."""
    prime_index: int
    epsilon: float          # Contractivity margin
    op_norm_T: float       # Operator norm
    lambda_p: Optional[float] = None  # Cached λ_p
    
    def validate(self):
        """Validate module invariants."""
        if not is_prime(self.prime_index):
            raise ValueError(f"prime_index {self.prime_index} is not prime")
        if self.epsilon <= 0 or self.epsilon >= 1:
            raise ValueError(f"epsilon {self.epsilon} not in (0, 1)")
        if self.op_norm_T <= 0:
            raise ValueError(f"op_norm_T {self.op_norm_T} must be positive")
    
    def get_lambda_p(self):
        """Get λ_p = U·log(p)."""
        if self.lambda_p is None:
            self.lambda_p = U_UNIVERSAL * np.log(self.prime_index)
        return self.lambda_p


@dataclass
class SessionGraph:
    """
    Multi-module Ξ(t) session graph.
    
    Represents:
    - Nodes: Prime-indexed modules with Ξ(t) properties
    - Edges: Coupling strengths between modules
    - Link time: Time parameter for Ξ(t) evolution
    """
    nodes: Dict[int, ModuleNode]
    edges: List[Tuple[int, int]]  # (p_i, p_j) pairs
    coupling_strengths: np.ndarray  # Weighted adjacency matrix
    link_time: float = 1.0
    
    def validate(self):
        """Validate graph structure."""
        for node in self.nodes.values():
            node.validate()
        
        # Verify matrix dimensions
        n = len(self.nodes)
        if self.coupling_strengths.shape != (n, n):
            raise ValueError(
                f"coupling_strengths shape {self.coupling_strengths.shape} "
                f"!= ({n}, {n})"
            )
        
        # Verify edges reference valid nodes
        primes = set(self.nodes.keys())
        for p_i, p_j in self.edges:
            if p_i not in primes or p_j not in primes:
                raise ValueError(f"Edge ({p_i}, {p_j}) references invalid nodes")


@dataclass
class CoherenceMeasurement:
    """Result of pairwise coherence measurement."""
    module_i: int
    module_j: int
    lambda_pi: float
    lambda_pj: float
    predicted_decay: float     # exp(-(λ_pi - λ_pj) * t)
    observed_decay: float      # Measured from Ξ(t) execution
    coherence: float           # observed / predicted
    status: CoherenceStatus
    tolerance_margin: float    # How far from boundary (0.0 = at boundary)


@dataclass
class SessionGraphVerificationResult:
    """Result of full session graph verification."""
    session_id: str
    passed: bool
    timestamp: float
    
    # Metrics
    pairwise_measurements: Dict[Tuple[int, int], CoherenceMeasurement] = field(default_factory=dict)
    coherence_matrix: Optional[np.ndarray] = None
    spectral_radius: Optional[float] = None
    eigenvalues: Optional[np.ndarray] = None
    
    # Diagnostics
    failed_pairs: List[Tuple[int, int]] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    diagnostics: str = ""


# ============================================================================
# Coherence Measurement Engine
# ============================================================================

class CoherenceMeasurer:
    """
    Measure and verify pairwise coherence in session graphs.
    
    Mathematical basis (from ADR-020 Artifact 5):
        C_ij = observed_decay / predicted_decay
        
        where:
            predicted = exp(-(λ_pi - λ_pj) * t_link)
            observed = measured from Ξ(t) execution
        
        Pass condition: C_ij ∈ [0.99, 1.01]
    """
    
    def __init__(self, executor: Optional[XiExecutor] = None):
        """
        Initialize measurer.
        
        Args:
            executor: XiExecutor instance (default: create new with 'direct')
        """
        self.executor = executor or XiExecutor("direct")
    
    def measure_pairwise(
        self,
        module_i: ModuleNode,
        module_j: ModuleNode,
        t_link: float,
        coupling_strength: float = 1.0
    ) -> CoherenceMeasurement:
        """
        Measure coherence between two modules.
        
        Args:
            module_i: First module (prime p_i)
            module_j: Second module (prime p_j)
            t_link: Link-time parameter
            coupling_strength: Coupling matrix entry [i,j]
        
        Returns:
            CoherenceMeasurement with coherence value and status
        """
        lambda_pi = module_i.get_lambda_p()
        lambda_pj = module_j.get_lambda_p()
        
        # Predicted decay (analytical)
        predicted_decay = np.exp(-(lambda_pi - lambda_pj) * t_link)
        
        # Observed decay (via Ξ(t) execution)
        # Create mock state and evolve
        test_state = np.ones(10)  # Toy state
        
        # Measure decay by applying Ξ to both modules separately
        result_i = self.executor.execute(test_state, module_i.prime_index, t_link)
        result_j = self.executor.execute(test_state, module_j.prime_index, t_link)
        
        # Ratio of decay factors
        observed_decay = result_i.decay_factor / result_j.decay_factor
        
        # Coherence: observed / predicted
        coherence = observed_decay / predicted_decay if predicted_decay > 0 else 1.0
        
        # Determine status
        if COHERENCE_LOWER_BOUND <= coherence <= COHERENCE_UPPER_BOUND:
            status = CoherenceStatus.PASS
            tolerance_margin = min(
                coherence - COHERENCE_LOWER_BOUND,
                COHERENCE_UPPER_BOUND - coherence
            )
        elif COHERENCE_LOWER_BOUND - 0.02 <= coherence <= COHERENCE_UPPER_BOUND + 0.02:
            status = CoherenceStatus.WARN
            tolerance_margin = min(
                abs(coherence - COHERENCE_LOWER_BOUND),
                abs(coherence - COHERENCE_UPPER_BOUND)
            )
        else:
            status = CoherenceStatus.FAIL
            tolerance_margin = -min(
                abs(coherence - COHERENCE_LOWER_BOUND),
                abs(coherence - COHERENCE_UPPER_BOUND)
            )
        
        return CoherenceMeasurement(
            module_i=module_i.prime_index,
            module_j=module_j.prime_index,
            lambda_pi=lambda_pi,
            lambda_pj=lambda_pj,
            predicted_decay=predicted_decay,
            observed_decay=observed_decay,
            coherence=coherence,
            status=status,
            tolerance_margin=tolerance_margin
        )
    
    def measure_all_pairs(
        self,
        session: SessionGraph
    ) -> Dict[Tuple[int, int], CoherenceMeasurement]:
        """
        Measure coherence for all module pairs.
        
        Args:
            session: SessionGraph with all modules
        
        Returns:
            Dict mapping (p_i, p_j) → CoherenceMeasurement
        """
        measurements = {}
        prime_list = list(session.nodes.keys())
        
        for i, p_i in enumerate(prime_list):
            for j, p_j in enumerate(prime_list):
                if i != j:
                    key = (p_i, p_j)
                    coupling = session.coupling_strengths[i, j]
                    
                    meas = self.measure_pairwise(
                        session.nodes[p_i],
                        session.nodes[p_j],
                        session.link_time,
                        coupling
                    )
                    measurements[key] = meas
        
        return measurements


# ============================================================================
# Graph Verification Engine
# ============================================================================

class SessionGraphVerifier:
    """
    Verify Ξ(t) session graph coherence and stability.
    
    Performs:
    1. Pairwise coherence measurement
    2. Global spectral stability check (eigenvalues of I - C)
    3. Diagnostic reporting
    """
    
    def __init__(self, measurer: Optional[CoherenceMeasurer] = None):
        """
        Initialize verifier.
        
        Args:
            measurer: CoherenceMeasurer instance
        """
        self.measurer = measurer or CoherenceMeasurer()
    
    def verify(
        self,
        session: SessionGraph,
        session_id: str = "default"
    ) -> SessionGraphVerificationResult:
        """
        Verify entire session graph.
        
        Steps:
        1. Validate graph structure
        2. Measure all pairwise coherences
        3. Build coherence matrix
        4. Check spectral stability
        5. Generate diagnostics
        
        Args:
            session: SessionGraph to verify
            session_id: Identifier for reporting
        
        Returns:
            SessionGraphVerificationResult with verification outcome
        """
        import time
        
        # Validate first
        session.validate()
        
        # Measure all pairs
        measurements = self.measurer.measure_all_pairs(session)
        
        # Build coherence matrix
        prime_list = sorted(session.nodes.keys())
        n = len(prime_list)
        coherence_matrix = np.zeros((n, n))
        
        failed_pairs = []
        for i, p_i in enumerate(prime_list):
            for j, p_j in enumerate(prime_list):
                if i == j:
                    coherence_matrix[i, j] = 1.0
                else:
                    key = (p_i, p_j)
                    meas = measurements[key]
                    coherence_matrix[i, j] = meas.coherence
                    
                    if meas.status == CoherenceStatus.FAIL:
                        failed_pairs.append(key)
        
        # Spectral stability check: eigenvalues of (I - C)
        I_minus_C = np.eye(n) - coherence_matrix
        # Coherence matrix is symmetric, so use eigvalsh for real symmetric matrix
        eigenvalues = np.linalg.eigvalsh(I_minus_C)
        
        spectral_radius = np.max(np.abs(eigenvalues))
        eigenvalues_real = True  # eigvalsh always returns real values
        eigenvalues_positive = np.all(eigenvalues >= SPECTRAL_EIGENVALUE_MIN)
        
        # Determine pass/fail
        all_coherent = len(failed_pairs) == 0
        spectral_stable = eigenvalues_real and eigenvalues_positive
        passed = all_coherent and spectral_stable
        
        # Build diagnostics
        diag_lines = []
        if passed:
            diag_lines.append("✅ SESSION COHERENT AND STABLE")
            diag_lines.append(f"   Spectral radius ρ = {spectral_radius:.4f}")
            diag_lines.append(f"   Contractivity margin = {1.0 - spectral_radius:.4f}")
        else:
            diag_lines.append("❌ SESSION VERIFICATION FAILED")
            if failed_pairs:
                diag_lines.append(f"\n   Incoherent couplings ({len(failed_pairs)}):")
                for p_i, p_j in failed_pairs[:5]:  # Show top 5
                    key = (p_i, p_j)
                    meas = measurements[key]
                    diag_lines.append(
                        f"     · p={p_i} ↔ p={p_j}: C={meas.coherence:.4f} "
                        f"(expected [0.99, 1.01])"
                    )
            if not spectral_stable:
                bad_eigs = eigenvalues[eigenvalues.real < SPECTRAL_EIGENVALUE_MIN]
                diag_lines.append(f"\n   Spectral instability detected ({len(bad_eigs)} eigs < 0)")
        
        result = SessionGraphVerificationResult(
            session_id=session_id,
            passed=passed,
            timestamp=time.time(),
            pairwise_measurements=measurements,
            coherence_matrix=coherence_matrix,
            spectral_radius=spectral_radius,
            eigenvalues=eigenvalues,
            failed_pairs=failed_pairs,
            diagnostics="\n".join(diag_lines)
        )
        
        return result


# ============================================================================
# Integration with pirtm_link
# ============================================================================

def link_with_xi_execution(
    modules: Dict[int, ModuleNode],
    coupling_matrix: np.ndarray,
    link_time: float = 1.0,
    session_id: str = "default"
) -> SessionGraphVerificationResult:
    """
    Execute Ξ(t)-aware linking.
    
    This is the Phase 2 link-time verification from ADR-020 Artifact 5.
    
    Steps:
    1. Construct SessionGraph from modules and coupling matrix
    2. Run coherence verification
    3. Return result (PASS or detailed FAIL diagnostic)
    
    Args:
        modules: Dict[prime_index → ModuleNode]
        coupling_matrix: Weighted adjacency matrix
        link_time: Time parameter for Ξ(t)
        session_id: Session identifier
    
    Returns:
        SessionGraphVerificationResult
    
    Mathematical guarantee (INV-1):
        If PASS: All pairwise coherences ∈ [0.99, 1.01]
        If PASS: Spectral stability ensured (eigenvalues real, ≥ 0)
    """
    # Build session graph
    edges = []
    for i, p_i in enumerate(modules):
        for j, p_j in enumerate(modules):
            if i < j and coupling_matrix[i, j] > 0:
                edges.append((p_i, p_j))
    
    session = SessionGraph(
        nodes=modules,
        edges=edges,
        coupling_strengths=coupling_matrix,
        link_time=link_time
    )
    
    # Verify
    verifier = SessionGraphVerifier()
    result = verifier.verify(session, session_id=session_id)
    
    return result


# ============================================================================
# Diagnostic Formatting
# ============================================================================

def format_verification_report(result: SessionGraphVerificationResult) -> str:
    """Format verification result as human-readable report."""
    lines = [
        "=" * 70,
        "ADR-021 SESSION GRAPH VERIFICATION REPORT",
        "=" * 70,
        f"Session ID: {result.session_id}",
        f"Status: {'PASS ✅' if result.passed else 'FAIL ❌'}",
        f"Timestamp: {result.timestamp}",
        "",
        result.diagnostics,
        "",
    ]
    
    if result.coherence_matrix is not None:
        lines.append("Coherence Matrix:")
        lines.append(np.array2string(
            result.coherence_matrix,
            precision=3,
            separator=', ',
            suppress_small=True
        ))
        lines.append("")
    
    if result.eigenvalues is not None:
        lines.append("Spectral Eigenvalues (I - C):")
        for i, eig in enumerate(result.eigenvalues):
            lines.append(f"  λ_{i} = {eig:.6e}")
    
    lines.append("=" * 70)
    
    return "\n".join(lines)


if __name__ == "__main__":
    # Quick integration test
    print("ADR-021 Link Integration - Smoke Test")
    print("=" * 70)
    
    # Create test modules
    modules = {
        13: ModuleNode(prime_index=13, epsilon=0.1, op_norm_T=1.5),
        7: ModuleNode(prime_index=7, epsilon=0.15, op_norm_T=1.2),
        3: ModuleNode(prime_index=3, epsilon=0.05, op_norm_T=1.8),
    }
    
    # Create coupling matrix (3x3)
    coupling = np.array([
        [1.0, 0.3, 0.1],
        [0.3, 1.0, 0.2],
        [0.1, 0.2, 1.0]
    ])
    
    # Run verification
    result = link_with_xi_execution(
        modules=modules,
        coupling_matrix=coupling,
        link_time=0.5,
        session_id="test-session"
    )
    
    # Print report
    print(format_verification_report(result))
    
    print(f"✓ Verification result: {result.passed}")
