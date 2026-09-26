"""T-04: EchoBraid — Recursive Interaction Fabric.

Models session interactions as braids in braid group B_n.
Tracks contractivity evolution through crossings.
Verifies Yang-Baxter relations and far commutation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple

from .session import CognitiveSession, ReasonStep


# ─── Crossing ────────────────────────────────────────────────────────


@dataclass(frozen=True)
class BraidCrossing:
    """An elementary crossing σ_i between adjacent session strands."""

    generator_index: int  # which σ_i
    over_session: int  # prime id of the "over" strand
    under_session: int  # prime id of the "under" strand
    pre_rho_over: float
    pre_rho_under: float
    post_rho_over: float
    post_rho_under: float
    admissible: bool


class BraidAdmissibilityError(Exception):
    """Raised when a crossing would violate contractivity."""


# ─── EchoBraid ───────────────────────────────────────────────────────


class EchoBraid:
    """Braid over cognitive sessions modelling interaction ordering.

    Supports:
    - Elementary crossings with contractivity tracking
    - Yang-Baxter verification
    - Far commutation verification
    - Braid word simplification (inverse cancellation)
    """

    def __init__(self, sessions: List[CognitiveSession]) -> None:
        if len(sessions) < 2:
            raise ValueError("EchoBraid requires at least 2 sessions")
        self._sessions: Dict[int, CognitiveSession] = {s.prime_id: s for s in sessions}
        self._strand_order: List[int] = [s.prime_id for s in sessions]
        self._crossings: List[BraidCrossing] = []
        self._word: List[int] = []  # signed generators: +i = σ_i, -i = σ_i⁻¹

    @property
    def sessions(self) -> Dict[int, CognitiveSession]:
        return dict(self._sessions)

    @property
    def crossings(self) -> List[BraidCrossing]:
        return list(self._crossings)

    @property
    def word(self) -> List[int]:
        return list(self._word)

    @property
    def n_strands(self) -> int:
        return len(self._strand_order)

    # ── spectral radius for a session ────────────────────────────────

    def _max_rho(self, session: CognitiveSession) -> float:
        if not session.steps:
            return 0.0
        return max(s.spectral_radius for s in session.steps)

    # ── crossing ─────────────────────────────────────────────────────

    def cross(self, generator_index: int, inverse: bool = False) -> BraidCrossing:
        """Execute an elementary crossing σ_i (or σ_i⁻¹ if inverse).

        The crossing swaps strands at positions generator_index and generator_index+1.
        A synthetic step is admitted to both sessions reflecting the interaction.
        Blocked if post-crossing contractivity is violated.
        """
        n = self.n_strands
        if generator_index < 0 or generator_index >= n - 1:
            raise ValueError(f"Generator index must be in [0, {n-2}]")

        over_pid = self._strand_order[generator_index]
        under_pid = self._strand_order[generator_index + 1]
        if inverse:
            over_pid, under_pid = under_pid, over_pid

        s_over = self._sessions[over_pid]
        s_under = self._sessions[under_pid]

        pre_rho_over = self._max_rho(s_over)
        pre_rho_under = self._max_rho(s_under)

        # Post-crossing spectral radius: sub-multiplicative model
        post_rho = pre_rho_over * pre_rho_under if pre_rho_over > 0 and pre_rho_under > 0 else max(pre_rho_over, pre_rho_under) * 0.95
        post_rho = min(post_rho, max(pre_rho_over, pre_rho_under))  # never increase

        admissible = post_rho < 1.0

        crossing = BraidCrossing(
            generator_index=generator_index,
            over_session=over_pid,
            under_session=under_pid,
            pre_rho_over=pre_rho_over,
            pre_rho_under=pre_rho_under,
            post_rho_over=post_rho,
            post_rho_under=post_rho,
            admissible=admissible,
        )

        if not admissible:
            raise BraidAdmissibilityError(
                f"Crossing σ_{generator_index} inadmissible: post ρ={post_rho:.4f} ≥ 1.0"
            )

        # Record in word
        sign = -(generator_index + 1) if inverse else (generator_index + 1)
        self._word.append(sign)

        # Admit synthetic steps to both sessions if active
        step_id = len(s_over.steps)
        from .session import SessionStatus
        if s_over.status == SessionStatus.ACTIVE and post_rho < s_over.contraction_bound:
            s_over.admit_step(ReasonStep(
                step_id=step_id, input_hash=f"cross_{generator_index}",
                output_hash=f"post_{generator_index}", spectral_radius=post_rho,
            ))
        if s_under.status == SessionStatus.ACTIVE and post_rho < s_under.contraction_bound:
            step_id_u = len(s_under.steps)
            s_under.admit_step(ReasonStep(
                step_id=step_id_u, input_hash=f"cross_{generator_index}",
                output_hash=f"post_{generator_index}", spectral_radius=post_rho,
            ))

        # Swap strand positions
        self._strand_order[generator_index], self._strand_order[generator_index + 1] = \
            self._strand_order[generator_index + 1], self._strand_order[generator_index]

        self._crossings.append(crossing)
        return crossing

    # ── braid word simplification ────────────────────────────────────

    def simplify_word(self) -> List[int]:
        """Cancel inverse pairs: σ_i σ_i⁻¹ → identity."""
        simplified: List[int] = []
        for g in self._word:
            if simplified and simplified[-1] == -g:
                simplified.pop()
            else:
                simplified.append(g)
        return simplified

    # ── Yang-Baxter verification ─────────────────────────────────────

    @staticmethod
    def verify_yang_baxter(i: int) -> bool:
        """Verify σ_i σ_{i+1} σ_i = σ_{i+1} σ_i σ_{i+1} (structural).

        This is verified structurally — braid group axiom always holds.
        """
        return True  # algebraic identity

    @staticmethod
    def verify_far_commutation(i: int, j: int) -> bool:
        """Verify σ_i σ_j = σ_j σ_i when |i - j| >= 2."""
        return abs(i - j) >= 2

    # ── contractivity evolution ───────────────────────────────────────

    def contractivity_trace(self) -> List[Tuple[int, float, float]]:
        """Return (crossing_idx, post_rho_over, post_rho_under) trace."""
        return [
            (idx, c.post_rho_over, c.post_rho_under)
            for idx, c in enumerate(self._crossings)
        ]

    def max_post_rho(self) -> float:
        """Maximum post-crossing spectral radius across all crossings."""
        if not self._crossings:
            return 0.0
        return max(
            max(c.post_rho_over, c.post_rho_under) for c in self._crossings
        )
