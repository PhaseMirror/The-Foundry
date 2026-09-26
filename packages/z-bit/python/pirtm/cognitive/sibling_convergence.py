"""T-07: Sibling Convergence — Multi-session convergence guarantees.

Given n cognitive sessions whose braid interactions form an EchoBraid,
verify that the coupled system converges (all sessions reach CONVERGED
status within bounded steps).

Uses:
- Spectral radius tracking from CognitiveSession
- Contractivity composition from contractivity module
- EchoBraid crossing traces
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

from .contractivity import verify_contractivity, estimate_convergence, verify_composition_contractivity
from .echobraid import EchoBraid
from .session import CognitiveSession, SessionStatus


# ─── Convergence report ─────────────────────────────────────────────


@dataclass
class ConvergenceReport:
    """Result of a sibling convergence check."""

    converged: bool
    max_rho: float
    session_rhos: Dict[int, float]  # prime_id -> max ρ
    composition_bound: float
    estimated_steps: Optional[int]
    violations: List[str] = field(default_factory=list)

    def is_gate_t_compliant(self) -> bool:
        return self.converged and len(self.violations) == 0


# ─── Sibling convergence verifier ────────────────────────────────────


class SiblingConvergenceVerifier:
    """Verify that a set of interacting sessions will converge.

    A system of n sessions converges if:
    1. Each individual session has ρ(T_i) < 1
    2. All pairwise compositions maintain ρ(T_i ⊗ T_j) < 1
    3. The maximum coupled spectral radius < 1
    """

    def __init__(self, sessions: List[CognitiveSession], braid: Optional[EchoBraid] = None):
        self._sessions = {s.prime_id: s for s in sessions}
        self._braid = braid

    def check_individual(self) -> Dict[int, Tuple[bool, float]]:
        """Check each session individually for contractivity."""
        results: Dict[int, Tuple[bool, float]] = {}
        for pid, session in self._sessions.items():
            rho = _session_max_rho(session)
            results[pid] = (rho < 1.0, rho)
        return results

    def check_pairwise(self) -> List[Tuple[int, int, bool, float]]:
        """Check all pairwise session compositions."""
        pids = sorted(self._sessions.keys())
        results: List[Tuple[int, int, bool, float]] = []
        for i in range(len(pids)):
            for j in range(i + 1, len(pids)):
                ok, bound = verify_composition_contractivity(
                    self._sessions[pids[i]], self._sessions[pids[j]],
                )
                results.append((pids[i], pids[j], ok, bound))
        return results

    def check_braid_trace(self) -> List[str]:
        """Check that all braid crossings maintained contractivity."""
        if self._braid is None:
            return []
        violations: List[str] = []
        for idx, rho_o, rho_u in self._braid.contractivity_trace():
            if rho_o >= 1.0:
                violations.append(f"Crossing {idx}: over ρ={rho_o:.4f} ≥ 1")
            if rho_u >= 1.0:
                violations.append(f"Crossing {idx}: under ρ={rho_u:.4f} ≥ 1")
        return violations

    def verify(self) -> ConvergenceReport:
        """Run the full sibling convergence check."""
        violations: List[str] = []

        # Individual checks
        individual = self.check_individual()
        session_rhos: Dict[int, float] = {}
        for pid, (ok, rho) in individual.items():
            session_rhos[pid] = rho
            if not ok:
                violations.append(f"Session {pid}: ρ={rho:.4f} ≥ 1")

        # Pairwise checks
        pairwise = self.check_pairwise()
        composition_bound = 0.0
        for pid_a, pid_b, ok, bound in pairwise:
            composition_bound = max(composition_bound, bound)
            if not ok:
                violations.append(f"Pair ({pid_a}, {pid_b}): composition bound={bound:.4f} ≥ 1")

        # Braid trace checks
        violations.extend(self.check_braid_trace())

        max_rho = max(session_rhos.values()) if session_rhos else 0.0
        converged = len(violations) == 0 and max_rho < 1.0

        estimated_steps = None
        if converged and max_rho > 0:
            # Find the session with highest rho to estimate steps
            worst_pid = max(session_rhos, key=session_rhos.get)  # type: ignore[arg-type]
            worst_est = estimate_convergence(self._sessions[worst_pid])
            estimated_steps = worst_est.estimated_steps_to_converge

        return ConvergenceReport(
            converged=converged,
            max_rho=max_rho,
            session_rhos=session_rhos,
            composition_bound=composition_bound,
            estimated_steps=estimated_steps,
            violations=violations,
        )


# ─── Batch convergence ───────────────────────────────────────────────


def verify_sibling_convergence(
    sessions: List[CognitiveSession],
    braid: Optional[EchoBraid] = None,
) -> ConvergenceReport:
    """Convenience function for sibling convergence verification."""
    return SiblingConvergenceVerifier(sessions, braid).verify()


# ─── helpers ─────────────────────────────────────────────────────────


def _session_max_rho(session: CognitiveSession) -> float:
    if not session.steps:
        return 0.0
    return max(s.spectral_radius for s in session.steps)
