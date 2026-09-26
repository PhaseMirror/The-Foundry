"""T-08: Production Hardening — thread-safety, snapshot, lifecycle gates.

Provides:
- CognitiveRuntime: thread-safe session manager with lifecycle gates
- SessionSnapshot: portable session state capture
- Runtime health checks and session enumeration
"""

from __future__ import annotations

import json
import threading
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

from .prime_identity import PrimeRegistry
from .session import CognitiveSession, ReasonStep, SessionStatus
from .rain_index import RAINIndex


# ─── Snapshot ────────────────────────────────────────────────────────


@dataclass(frozen=True)
class SessionSnapshot:
    """Portable session state capture."""

    prime_id: int
    status: str
    step_count: int
    max_spectral_radius: float
    contraction_bound: float
    timestamp: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "prime_id": self.prime_id,
            "status": self.status,
            "step_count": self.step_count,
            "max_spectral_radius": self.max_spectral_radius,
            "contraction_bound": self.contraction_bound,
            "timestamp": self.timestamp,
        }

    @classmethod
    def from_session(cls, session: CognitiveSession) -> "SessionSnapshot":
        max_rho = 0.0
        if session.steps:
            max_rho = max(s.spectral_radius for s in session.steps)
        return cls(
            prime_id=session.prime_id,
            status=session.status.value,
            step_count=len(session.steps),
            max_spectral_radius=max_rho,
            contraction_bound=session.contraction_bound,
            timestamp=time.time(),
        )


# ─── Runtime ─────────────────────────────────────────────────────────


class CognitiveRuntime:
    """Thread-safe runtime for managing cognitive sessions.

    Provides:
    - Session creation with unique prime IDs
    - Lifecycle gate enforcement (must be ACTIVE to admit steps)
    - Thread-safe operations
    - Snapshot capture for all sessions
    - Health check reporting
    """

    def __init__(self, contraction_bound: float = 0.99) -> None:
        self._registry = PrimeRegistry()
        self._sessions: Dict[int, CognitiveSession] = {}
        self._rain_indices: Dict[int, RAINIndex] = {}
        self._lock = threading.Lock()
        self._contraction_bound = contraction_bound
        self._created_count = 0

    @property
    def session_count(self) -> int:
        with self._lock:
            return len(self._sessions)

    @property
    def created_count(self) -> int:
        with self._lock:
            return self._created_count

    # ── session management ───────────────────────────────────────────

    def create_session(self) -> CognitiveSession:
        """Create a new cognitive session with a unique prime ID."""
        with self._lock:
            pid = self._registry.allocate()
            session = CognitiveSession(
                prime_id=pid,
                contraction_bound=self._contraction_bound,
            )
            self._sessions[pid] = session
            self._rain_indices[pid] = RAINIndex(pid)
            self._created_count += 1
            return session

    def get_session(self, prime_id: int) -> Optional[CognitiveSession]:
        with self._lock:
            return self._sessions.get(prime_id)

    def list_sessions(self) -> List[int]:
        with self._lock:
            return list(self._sessions.keys())

    def remove_session(self, prime_id: int) -> bool:
        with self._lock:
            if prime_id in self._sessions:
                del self._sessions[prime_id]
                self._rain_indices.pop(prime_id, None)
                return True
            return False

    # ── step admission with lifecycle gate ───────────────────────────

    def admit_step(self, prime_id: int, step: ReasonStep) -> bool:
        """Admit a reasoning step, enforcing lifecycle gates.

        Returns True if step was admitted, False if session is not ACTIVE.
        Raises KeyError if session does not exist.
        """
        with self._lock:
            session = self._sessions.get(prime_id)
            if session is None:
                raise KeyError(f"Session {prime_id} not found")
            if session.status != SessionStatus.ACTIVE:
                return False
            session.admit_step(step)
            # Also record in RAIN index
            rain = self._rain_indices.get(prime_id)
            if rain is not None:
                rain.record_step(
                    step_index=step.step_id,
                    spectral_radius=step.spectral_radius,
                )
            return True

    # ── lifecycle transitions ────────────────────────────────────────

    def converge_session(self, prime_id: int) -> bool:
        with self._lock:
            session = self._sessions.get(prime_id)
            if session is None:
                raise KeyError(f"Session {prime_id} not found")
            if session.status != SessionStatus.ACTIVE:
                return False
            session.transition(SessionStatus.CONVERGED)
            return True

    def freeze_session(self, prime_id: int) -> bool:
        with self._lock:
            session = self._sessions.get(prime_id)
            if session is None:
                raise KeyError(f"Session {prime_id} not found")
            if session.status != SessionStatus.ACTIVE:
                return False
            session.transition(SessionStatus.FROZEN)
            return True

    # ── snapshots ────────────────────────────────────────────────────

    def snapshot(self, prime_id: int) -> SessionSnapshot:
        with self._lock:
            session = self._sessions.get(prime_id)
            if session is None:
                raise KeyError(f"Session {prime_id} not found")
            return SessionSnapshot.from_session(session)

    def snapshot_all(self) -> List[SessionSnapshot]:
        with self._lock:
            return [SessionSnapshot.from_session(s) for s in self._sessions.values()]

    # ── health check ─────────────────────────────────────────────────

    def health_check(self) -> Dict[str, Any]:
        with self._lock:
            total = len(self._sessions)
            active = sum(1 for s in self._sessions.values() if s.status == SessionStatus.ACTIVE)
            converged = sum(1 for s in self._sessions.values() if s.status == SessionStatus.CONVERGED)
            frozen = sum(1 for s in self._sessions.values() if s.status == SessionStatus.FROZEN)

            max_rhos = []
            for s in self._sessions.values():
                if s.steps:
                    max_rhos.append(max(st.spectral_radius for st in s.steps))

            return {
                "total_sessions": total,
                "active": active,
                "converged": converged,
                "frozen": frozen,
                "max_spectral_radius": max(max_rhos) if max_rhos else 0.0,
                "all_contractive": all(r < 1.0 for r in max_rhos),
                "rain_coverage": self._rain_coverage(),
            }

    def _rain_coverage(self) -> float:
        coverages = []
        for rain in self._rain_indices.values():
            coverages.append(rain.coverage())
        if not coverages:
            return 1.0
        return sum(coverages) / len(coverages)

    # ── RAIN access ──────────────────────────────────────────────────

    def get_rain_index(self, prime_id: int) -> Optional[RAINIndex]:
        with self._lock:
            return self._rain_indices.get(prime_id)
