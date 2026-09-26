"""
ADR-022 Phase 1: Graph Verification Pass

Purpose:
    Link-time MLIR pass that verifies session graph coherence.
    Runs after coupling matrix construction, before spectral-small-gain.

Mathematical contract:
    Input: SessionGraph + coupling matrix
    Output: Verification result (PASS cert or diagnostic)
    
    Semantic: Checks contractivity (INV-1) and spectral stability
    Diagnostic: Human-readable report with failing pairs + suggestions

Provenance: MultiplicityFoundation/Meta-Relativity
Math Stack: Session graph verification, link-time certification
Registry: github.com/MultiplicityFoundation/Meta-Relativity
Date: 2026-03-17
"""

import numpy as np
from typing import Dict, Tuple

from pirtm.core.session_graph import SessionGraph, ModuleNode, create_session_graph
from pirtm.core.coherence_metrics import (
    CoherenceMeasurer, verify_session_coherence, GlobalCoherenceResult
)
from pirtm.governance.audit_trail import audit_event


def verify_session_graph_pass(
    modules: Dict[int, ModuleNode],
    coupling_matrix: np.ndarray,
    link_time: float = 1.0,
    session_id: str = "default"
) -> Tuple[bool, str]:
    """
    Verify session graph at link time.
    
    This is the main entry point for link-time verification.
    Runs after coupling matrix construction (pirtm_link.py).
    
    Steps:
    1. Create SessionGraph from modules and coupling matrix
    2. Validate graph structure
    3. Measure pairwise coherences
    4. Check spectral stability
    5. Generate diagnostics
    
    Args:
        modules: Dict[prime_index → ModuleNode]
        coupling_matrix: Weighted adjacency matrix (symmetric, unit diagonal)
        link_time: Time parameter for Ξ(t) evolution
        session_id: Session identifier
    
    Returns:
        (passed: bool, diagnostics: str)
    
    Raises:
        ValueError: If graph construction fails validation
    """
    # Build session graph
    session = create_session_graph(
        modules=modules,
        coupling_matrix=coupling_matrix,
        link_time=link_time,
        session_id=session_id
    )
    
    # Audit: verification started
    audit_event(
        stage="link",
        component="session_graph_verifier",
        event="verification_started",
        details={
            "session_id": session_id,
            "num_modules": len(session.nodes),
            "link_time": float(link_time),
        },
    )

    # Verify coherence
    measurer = CoherenceMeasurer()
    result = verify_session_coherence(session, measurer)

    # Audit: verification result
    audit_event(
        stage="link",
        component="session_graph_verifier",
        event="verification_completed",
        details={
            "session_id": session_id,
            "passed": bool(result.passed),
            "spectral_radius": float(result.spectral_radius),
            "failed_pairs": result.failed_pairs,
        },
    )

    return result.passed, result.diagnostics()


def link_with_session_verification(
    modules: Dict[int, ModuleNode],
    coupling_matrix: np.ndarray,
    link_time: float = 1.0,
    session_id: str = "default"
) -> GlobalCoherenceResult:
    """
    Full link-time verification with detailed result.
    
    Convenience function for testing and detailed analysis.
    Returns the full result object instead of just pass/fail.
    
    Args:
        modules: Dict[prime_index → ModuleNode]
        coupling_matrix: Weighted adjacency matrix
        link_time: Time parameter for Ξ(t)
        session_id: Session identifier
    
    Returns:
        GlobalCoherenceResult with full metrics and diagnostics
    """
    session = create_session_graph(
        modules=modules,
        coupling_matrix=coupling_matrix,
        link_time=link_time,
        session_id=session_id
    )
    
    measurer = CoherenceMeasurer()
    result = verify_session_coherence(session, measurer)
    
    return result


def format_verification_report(result: GlobalCoherenceResult) -> str:
    """
    Format verification result as comprehensive report.
    
    Args:
        result: GlobalCoherenceResult
    
    Returns:
        Formatted multi-line report string
    """
    lines = [
        "=" * 70,
        f"Session Graph Verification Report",
        f"Session ID: {result.session_id}",
        f"Status: {'PASS ✅' if result.passed else 'FAIL ❌'}",
        "=" * 70,
        ""
    ]
    
    # Metrics section
    lines.append("Metrics:")
    lines.append(f"  Dimensions: {result.coherence_matrix.shape[0]} modules")
    lines.append(f"  Spectral radius ρ = {result.spectral_radius:.6f}")
    lines.append(f"  Eigenvalues (I-C): {result.eigenvalues}")
    lines.append(f"  Measurement pairs: {len(result.pairwise_measurements)}")
    lines.append("")
    
    # Pairwise results
    if result.pairwise_measurements:
        lines.append("Pairwise coherences:")
        for (p_i, p_j), meas in sorted(result.pairwise_measurements.items()):
            status_icon = "✅" if meas.status == "pass" else "⚠️" if meas.status == "warn" else "❌"
            lines.append(
                f"  {status_icon} p{p_i} ↔ p{p_j}: "
                f"C={meas.coherence:.4f} "
                f"(pred={meas.predicted_decay:.4f}, obs={meas.observed_decay:.4f})"
            )
        lines.append("")
    
    # Diagnostics
    lines.append("Diagnostics:")
    lines.append(result.diagnostics())
    lines.append("")
    
    # Recommendations
    if not result.passed:
        lines.append("Recommendations:")
        if result.failed_pairs:
            lines.append(
                f"  • Increase link_time (currently {result.pairwise_measurements[result.failed_pairs[0]]} s)"
            )
            lines.append("    or reduce coupling strengths for failing pairs")
        if any(eig < -1e-10 for eig in result.eigenvalues):
            lines.append("  • Unstable eigenvalues detected: review coupling topology")
        lines.append("")
    
    lines.append("=" * 70)
    
    return "\n".join(lines)
