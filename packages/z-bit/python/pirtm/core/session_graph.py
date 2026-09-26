"""
ADR-022 Phase 1: Session Graph Data Structure

Purpose:
    Represent multi-module Ξ(t) network topology with topology-aware invariants.

Mathematical contract:
    - Graph of ModuleNodes (prime-indexed)
    - Weighted adjacency matrix (coupling strengths)
    - Laplacian matrix (for spectral analysis)
    - All primes Miller-Rabin validated
    - Coupling matrix symmetric with unit diagonal

Provenance: MultiplicityFoundation/Meta-Relativity
Math Stack: Graph topology, spectral graph theory
Registry: github.com/MultiplicityFoundation/Meta-Relativity
Date: 2026-03-17
"""

import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Optional
from pirtm.core.xi_executor import is_prime, U_UNIVERSAL


# ============================================================================
# Data Structures
# ============================================================================

@dataclass
class ModuleNode:
    """
    Single module in session graph.
    
    Invariants:
    - prime_index: Must pass Miller-Rabin (40 rounds)
    - epsilon: Contractivity margin ∈ (0, 1)
    - op_norm_T: Operator norm > 0
    - lambda_p: λ_p = U·log(prime_index), cached
    """
    
    prime_index: int
    epsilon: float
    op_norm_T: float
    lambda_p: Optional[float] = None
    
    def validate(self) -> None:
        """
        Verify modular invariants.
        
        Raises:
            ValueError if any invariant violated
        """
        # INV-2: Prime validation (Miller-Rabin)
        if not is_prime(self.prime_index):
            raise ValueError(
                f"prime_index {self.prime_index} is not prime "
                f"(required by INV-2)"
            )
        
        # Contractivity margin
        if not (0 < self.epsilon < 1):
            raise ValueError(
                f"epsilon {self.epsilon} ∉ (0, 1) "
                f"(required for contractivity)"
            )
        
        # Operator norm
        if self.op_norm_T <= 0:
            raise ValueError(
                f"op_norm_T {self.op_norm_T} must be > 0"
            )
    
    def get_lambda_p(self) -> float:
        """
        Get λ_p = U·log(p), cached.
        
        Returns:
            λ_p value (float)
        """
        if self.lambda_p is None:
            self.lambda_p = U_UNIVERSAL * np.log(self.prime_index)
        return self.lambda_p
    
    def __repr__(self) -> str:
        """String representation."""
        return (
            f"ModuleNode(p={self.prime_index}, "
            f"ε={self.epsilon:.3f}, "
            f"‖T‖={self.op_norm_T:.3f})"
        )


@dataclass
class SessionGraph:
    """
    Multi-module Ξ(t) network topology.
    
    Graph invariants:
    - All nodes have distinct primes
    - Edges reference valid node primes
    - Coupling matrix is symmetric
    - Diagonal = 1.0 (self-loops = identity)
    - Off-diagonal ∈ [0, 1] (coupling strengths)
    
    Mathematical representation:
        G = (V, E, W)
        where:
            V = {ModuleNode_p : p ∈ primes}
            E = {(p_i, p_j) : coupling}
            W = symmetric matrix with W[i,j] = coupling strength
    """
    
    nodes: Dict[int, ModuleNode]
    edges: List[Tuple[int, int]]
    coupling_strengths: np.ndarray
    link_time: float = 1.0
    session_id: str = "default"
    
    def validate(self) -> None:
        """
        Verify session graph structure and invariants.
        
        Checks:
        1. All ModuleNodes valid (INV-2, contractivity, etc.)
        2. All edges reference valid primes
        3. Coupling matrix correct shape
        4. Coupling matrix symmetric
        5. Coupling diagonal = 1.0
        
        Raises:
            ValueError if any invariant violated
        """
        # Validate nodes
        for prime_idx, node in self.nodes.items():
            node.validate()
            if node.prime_index != prime_idx:
                raise ValueError(
                    f"Node key {prime_idx} ≠ node.prime_index {node.prime_index}"
                )
        
        # Validate edges
        primes = set(self.nodes.keys())
        for p_i, p_j in self.edges:
            if p_i not in primes or p_j not in primes:
                raise ValueError(
                    f"Edge ({p_i}, {p_j}) references invalid nodes. "
                    f"Valid primes: {primes}"
                )
        
        # Validate matrix shape
        n = len(self.nodes)
        if self.coupling_strengths.shape != (n, n):
            raise ValueError(
                f"Coupling matrix shape {self.coupling_strengths.shape} "
                f"≠ ({n}, {n})"
            )
        
        # Validate symmetry
        if not np.allclose(
            self.coupling_strengths,
            self.coupling_strengths.T,
            atol=1e-10
        ):
            raise ValueError("Coupling matrix is not symmetric")
        
        # Validate diagonal = 1.0
        diag = np.diag(self.coupling_strengths)
        if not np.allclose(diag, 1.0, atol=1e-10):
            raise ValueError(
                f"Coupling diagonal not all 1.0: {diag}"
            )
        
        # Validate entries ∈ [0, 1]
        if not np.all((self.coupling_strengths >= -1e-10) & 
                      (self.coupling_strengths <= 1.0 + 1e-10)):
            raise ValueError(
                "Coupling strengths not in [0, 1]"
            )
        
        # Validate link_time
        if self.link_time < 0:
            raise ValueError(f"link_time {self.link_time} < 0")
    
    def get_laplacian(self) -> np.ndarray:
        """
        Compute graph Laplacian L = D - A.
        
        where:
            D = diagonal matrix with row sums
            A = adjacency (coupling strength) matrix
        
        Returns:
            Laplacian matrix (symmetric, positive semidefinite)
        
        Notes:
            Eigenvalues of L describe graph connectivity.
            λ_0 = 0 always (corresponds to constant vector).
            λ_1 > 0 iff graph is connected (algebraic connectivity).
        """
        n = len(self.nodes)
        D = np.diag(np.sum(self.coupling_strengths, axis=1))
        L = D - self.coupling_strengths
        return L
    
    def num_nodes(self) -> int:
        """Number of modules in graph."""
        return len(self.nodes)
    
    def num_edges(self) -> int:
        """Number of couplings in graph."""
        return len(self.edges)
    
    def is_connected(self) -> bool:
        """
        Check if graph is connected.
        
        Uses Laplacian algebraic connectivity:
            λ_1 > 0 iff graph is connected
        
        Returns:
            bool: True if connected
        """
        laplacian = self.get_laplacian()
        eigenvalues = np.linalg.eigvalsh(laplacian)
        # Sort ascending
        eigenvalues = np.sort(eigenvalues)
        # Second smallest eigenvalue (λ_1) = algebraic connectivity
        if len(eigenvalues) > 1:
            return eigenvalues[1] > 1e-10
        else:
            return True  # Single node trivially connected
    
    def __repr__(self) -> str:
        """String representation."""
        return (
            f"SessionGraph("
            f"nodes={self.num_nodes()}, "
            f"edges={self.num_edges()}, "
            f"t={self.link_time}, "
            f"id={self.session_id})"
        )


# ============================================================================
# Factory Functions
# ============================================================================

def create_session_graph(
    modules: Dict[int, ModuleNode],
    coupling_matrix: np.ndarray,
    link_time: float = 1.0,
    session_id: str = "default"
) -> SessionGraph:
    """
    Create and validate a session graph.
    
    Args:
        modules: Dict[prime_index → ModuleNode]
        coupling_matrix: Weighted adjacency matrix
        link_time: Time parameter for Ξ(t) evolution
        session_id: Session identifier
    
    Returns:
        SessionGraph (validated)
    
    Raises:
        ValueError if construction fails validation
    """
    # Extract edges from coupling matrix
    primes = sorted(modules.keys())
    edges = []
    
    for i, p_i in enumerate(primes):
        for j, p_j in enumerate(primes):
            if i < j and coupling_matrix[i, j] > 1e-10:
                edges.append((p_i, p_j))
    
    # Create graph
    graph = SessionGraph(
        nodes=modules,
        edges=edges,
        coupling_strengths=coupling_matrix,
        link_time=link_time,
        session_id=session_id
    )
    
    # Validate before returning
    graph.validate()
    
    return graph
