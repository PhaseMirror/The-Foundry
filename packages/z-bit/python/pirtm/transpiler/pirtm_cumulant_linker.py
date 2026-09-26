"""
PIRTM Cumulant Linker: Resolve cumulant bundles across linked modules.

Implements ADR-011 Part 4: Three-pass linking protocol for cumulant bundle resolution.

This module:
  1. Collects all cumulant bundles from individual modules
  2. Constructs coupling matrix from cumulant correlations
  3. Computes global spectral radius (network-wide bound)

Spec Reference:
  - ADR-011: Cumulant Storage and Persistence Model
  - ADR-013: Multiplicity Ensemble Aggregation (uses coupling matrix)
"""

import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timezone

from pirtm.transpiler.pirtm_emitter_cumulants import CumulantRecord, CumulantBytecodeSection


@dataclass
class CumulantBundle:
    """Resolved cumulant bundle for linking."""
    scale_k: float
    prime_mod: int
    orders: List[int]
    spectral_radius: float
    commitment: str
    data: Dict[int, np.ndarray]  # order -> cumulant data


@dataclass
class CouplingMatrix:
    """Global coupling matrix computed from cumulants."""
    scales: List[float]
    primes: List[int]
    matrix: np.ndarray  # Shape (len(primes), len(primes))
    spectral_radius: float
    condition_number: float
    timestamp: str


class CumulantLinkResolver:
    """
    Three-pass resolution protocol for cumulant bundles.
    
    Pass 1: Collect all bundles from modules
    Pass 2: Construct coupling matrix from cumulant correlations
    Pass 3: Compute global spectral radius (with contractivity check)
    
    Usage:
        resolver = CumulantLinkResolver()
        bundles = resolver.pass_1_collect(modules)
        coupling_matrix, scales, primes = resolver.pass_2_construct_coupling_matrix(bundles)
        spectral_radius = resolver.pass_3_global_spectral_radius(coupling_matrix)
    """
    
    def __init__(self, verbose: bool = False):
        """
        Initialize linker.
        
        Args:
            verbose: Enable diagnostic output
        """
        self.verbose = verbose
        self.cumulant_map: Dict[Tuple[float, int], CumulantBundle] = {}
        self.diagnostics: List[str] = []
    
    def pass_1_collect(self, bytecode_sections: List[CumulantBytecodeSection]) -> Dict[Tuple[float, int], CumulantBundle]:
        """
        Pass 1: Collect all cumulant bundles from bytecode sections.
        
        Args:
            bytecode_sections: List of CumulantBytecodeSection objects from modules
        
        Returns:
            Cumulant map: (scale_k, prime_mod) -> CumulantBundle
        
        Raises:
            ValueError: If modules have conflicting cumulants for same (scale_k, prime_mod)
        """
        self.cumulant_map = {}
        
        for section in bytecode_sections:
            for record in section.records:
                key = (record.scale_k, record.prime_mod)
                
                # Check for conflicts (same scale and prime, different data)
                if key in self.cumulant_map:
                    existing = self.cumulant_map[key]
                    # Check if this order already exists
                    if record.order in existing.data:
                        if not np.allclose(existing.data[record.order], record.data, rtol=1e-10):
                            raise ValueError(
                                f"Cumulant conflict at scale_k={record.scale_k}, prime_mod={record.prime_mod}: "
                                f"two modules provided different data for order {record.order}"
                            )
                    else:
                        # New order for existing (scale, prime) — add it
                        existing.orders.append(record.order)
                        existing.data[record.order] = record.data
                else:
                    # New bundle
                    bundle = CumulantBundle(
                        scale_k=record.scale_k,
                        prime_mod=record.prime_mod,
                        orders=[record.order],
                        spectral_radius=record.spectral_radius,
                        commitment=record.commitment,
                        data={record.order: record.data}
                    )
                    self.cumulant_map[key] = bundle
        
        if self.verbose:
            msg = f"✓ Pass 1 (Collect): Found {len(self.cumulant_map)} unique cumulant bundles"
            print(msg)
            self.diagnostics.append(msg)
        
        return self.cumulant_map
    
    def pass_2_construct_coupling_matrix(
        self,
        bundles: Optional[Dict[Tuple[float, int], CumulantBundle]] = None
    ) -> Tuple[CouplingMatrix, List[float], List[int]]:
        """
        Pass 2: Construct coupling matrix from cumulant correlations.
        
        The coupling matrix M[i,j] measures correlation between cumulants of primes i and j.
        Computed from C^(3) (three-point) cumulants at shared scales.
        
        Args:
            bundles: Cumulant map from Pass 1 (or use self.cumulant_map)
        
        Returns:
            (CouplingMatrix, scales, primes) tuple
        
        Raises:
            ValueError: If no cumulants available or singular matrix
        """
        if bundles is None:
            bundles = self.cumulant_map
        
        if not bundles:
            raise ValueError("No cumulants to link (empty cumulant_map)")
        
        # Extract unique scales and primes
        scales = sorted(set(k[0] for k in bundles.keys()))
        primes = sorted(set(k[1] for k in bundles.keys()))
        
        if len(primes) < 2:
            raise ValueError(f"Need at least 2 primes for coupling matrix, got {len(primes)}")
        
        # Initialize coupling matrix
        n = len(primes)
        coupling_matrix = np.zeros((n, n))
        
        # Populate matrix: M[i,j] = correlation of C^(3) between prime[i] and prime[j]
        for i, p1 in enumerate(primes):
            for j, p2 in enumerate(primes):
                if i == j:
                    # Diagonal: self-coupling (norm of own C^(3))
                    c3_data = self._get_cumulant_data(bundles, p1, 3, scales)
                    if c3_data is not None and len(c3_data) > 0:
                        coupling_matrix[i, j] = np.linalg.norm(c3_data)
                else:
                    # Off-diagonal: cross-correlation
                    c3_p1 = self._get_cumulant_data(bundles, p1, 3, scales)
                    c3_p2 = self._get_cumulant_data(bundles, p2, 3, scales)
                    
                    if c3_p1 is not None and c3_p2 is not None and len(c3_p1) > 0 and len(c3_p2) > 0:
                        # Correlation = dot product / (norm1 * norm2)
                        if len(c3_p1) == len(c3_p2):
                            corr = np.dot(c3_p1, c3_p2) / (np.linalg.norm(c3_p1) * np.linalg.norm(c3_p2) + 1e-16)
                            coupling_matrix[i, j] = corr
        
        # Normalize (optional: scale by Frobenius norm)
        frobenius_norm = np.linalg.norm(coupling_matrix, 'fro')
        if frobenius_norm > 0:
            coupling_matrix = coupling_matrix / frobenius_norm
        
        # Compute condition number
        try:
            cond = np.linalg.cond(coupling_matrix)
        except np.linalg.LinAlgError:
            cond = np.inf
        
        result = CouplingMatrix(
            scales=scales,
            primes=primes,
            matrix=coupling_matrix,
            spectral_radius=0.0,  # Will be set in Pass 3
            condition_number=cond,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        
        if self.verbose:
            msg = (f"✓ Pass 2 (Construct): Coupling matrix {n}×{n}, "
                   f"condition_number={cond:.4f}")
            print(msg)
            self.diagnostics.append(msg)
        
        return result, scales, primes
    
    def pass_3_global_spectral_radius(
        self,
        coupling_matrix: CouplingMatrix
    ) -> Tuple[float, bool]:
        """
        Pass 3: Compute global spectral radius (network-wide stability bound).
        
        For contractivity, global ρ must satisfy: ρ < 0.95 (margin δ ≥ 0.05).
        
        Args:
            coupling_matrix: CouplingMatrix from Pass 2
        
        Returns:
            (spectral_radius, is_safe) tuple where:
              - spectral_radius: largest eigenvalue magnitude
              - is_safe: True if ρ < 0.95, False otherwise
        
        Raises:
            ValueError: If eigenvalue computation fails
        """
        try:
            eigenvalues = np.linalg.eigvals(coupling_matrix.matrix)
            spectral_radius = float(np.max(np.abs(eigenvalues)))
        except np.linalg.LinAlgError as e:
            raise ValueError(f"Failed to compute eigenvalues: {e}")
        
        # Update coupling matrix
        coupling_matrix.spectral_radius = spectral_radius
        
        # Check contractivity margin
        is_safe = spectral_radius < 0.95
        margin = 1.0 - spectral_radius
        
        # Emit diagnostic
        if is_safe:
            msg = (f"✓ Pass 3 (Spectral Radius): ρ={spectral_radius:.4f} < 0.95 "
                   f"(margin={margin:.4f})")
        else:
            msg = (f"⚠ Pass 3 (Spectral Radius): ρ={spectral_radius:.4f} > 0.95 "
                   f"(margin={margin:.4f}) — CONTRACTIVITY VIOLATED")
        
        if self.verbose:
            print(msg)
        self.diagnostics.append(msg)
        
        return spectral_radius, is_safe
    
    def link_all(
        self,
        bytecode_sections: List[CumulantBytecodeSection]
    ) -> Tuple[float, bool, CouplingMatrix]:
        """
        Execute all three passes in sequence.
        
        Args:
            bytecode_sections: List of cumulant bytecode sections from modules
        
        Returns:
            (global_spectral_radius, is_safe, coupling_matrix) tuple
        
        Raises:
            ValueError: If any pass fails
        """
        # Pass 1: Collect
        self.pass_1_collect(bytecode_sections)
        
        # Pass 2: Construct coupling matrix
        coupling_matrix, scales, primes = self.pass_2_construct_coupling_matrix()
        
        # Pass 3: Global spectral radius
        spectral_radius, is_safe = self.pass_3_global_spectral_radius(coupling_matrix)
        
        return spectral_radius, is_safe, coupling_matrix
    
    def get_diagnostics(self) -> List[str]:
        """
        Get all diagnostic messages emitted during linking.
        
        Returns:
            List of diagnostic strings
        """
        return self.diagnostics
    
    @staticmethod
    def _get_cumulant_data(
        bundles: Dict[Tuple[float, int], CumulantBundle],
        prime_mod: int,
        order: int,
        scales: List[float]
    ) -> Optional[np.ndarray]:
        """
        Retrieve cumulant data for a specific prime and order across all scales.
        
        Args:
            bundles: Cumulant map
            prime_mod: Prime modulus to lookup
            order: Cumulant order (e.g., 3 for C^(3))
            scales: List of scales to search
        
        Returns:
            Concatenated cumulant data across scales, or None if not found
        """
        data_parts = []
        
        for scale_k in scales:
            key = (scale_k, prime_mod)
            if key in bundles:
                bundle = bundles[key]
                if order in bundle.data:
                    data_parts.append(bundle.data[order])
        
        if not data_parts:
            return None
        
        return np.concatenate(data_parts)


class CumulantLinkDiagnostics:
    """
    Diagnostic reporter for linking operations.
    
    Emits formatted diagnostics per ADR-012 L0 invariant audit.
    """
    
    def __init__(self):
        """Initialize diagnostics collector."""
        self.records: List[Dict[str, any]] = []
    
    def emit(self, level: str, message: str):
        """
        Emit a diagnostic record.
        
        Args:
            level: "✓" (pass), "⚠" (warning), "✗" (fail)
            message: Diagnostic message
        """
        record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": level,
            "message": message
        }
        self.records.append(record)
        
        # Also print to stdout
        print(f"[{record['timestamp']}] Cumulant Link: {level} {message}")
    
    def summary(self) -> Dict[str, any]:
        """
        Get summary of diagnostics.
        
        Returns:
            Dict with counts of passes, warnings, failures
        """
        passes = sum(1 for r in self.records if r["level"] == "✓")
        warnings = sum(1 for r in self.records if r["level"] == "⚠")
        failures = sum(1 for r in self.records if r["level"] == "✗")
        
        return {
            "total": len(self.records),
            "passes": passes,
            "warnings": warnings,
            "failures": failures,
            "is_healthy": failures == 0
        }
