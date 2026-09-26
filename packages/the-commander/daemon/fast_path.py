"""G-04: Fast-path epsilon adjustment monitor.

Per ADR-031: A separate 2-second monitoring loop reads the ``L_Phi``
spectral activity signal. When ``L_Phi`` exceeds the threshold the loop
computes a bounded epsilon adjustment and routes it through the MCP tool
surface (``tool_epsilon_adjust``). Three caps prevent runaway adjustments:

- **Per-call delta cap**: |Δε| ≤ δ_max
- **Cumulative window cap**: Σ|Δε| ≤ C_max over a rolling 300-second window
- **Floor / ceiling**: ε_floor ≤ ε ≤ ε_ceiling
"""

from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass, field
from typing import Any

from contracts.shared.constants import (
    EPSILON_ADJUST_MAX_PER_CALL,
    EPSILON_MAX,
    EPSILON_MIN,
)


logger = logging.getLogger(__name__)

# Fast-path rate-limiting constants (ADR-031 G-04)
L_PHI_THRESHOLD: float = 0.8
DELTA_MAX: float = EPSILON_ADJUST_MAX_PER_CALL  # per-call delta cap
CUMULATIVE_CAP: float = 0.15                    # Σ|Δε| ≤ 0.15 in 300 s window
WINDOW_SECONDS: float = 300.0                   # cumulative cap rolling window
EPSILON_FLOOR: float = max(0.1, EPSILON_MIN)    # absolute lower bound
EPSILON_CEILING: float = min(0.9, EPSILON_MAX)  # absolute upper bound


@dataclass
class _AdjRecord:
    """A single bounded epsilon adjustment in the sliding window."""
    timestamp: float
    abs_delta: float


@dataclass
class FastPathMonitor:
    """Rate-limited fast-path epsilon adjustment surface (ADR-031 G-04).

    The monitor maintains a sliding window of recent adjustments to enforce
    the cumulative cap. All adjustments are routed through the MCP tool
    surface rather than applied directly so that governance integrity
    verification fires on every call.

    Args:
        current_epsilon: Mutable starting epsilon value.
        l_phi_threshold: L_Phi value above which an adjustment is triggered.
        delta_max: Per-call absolute delta cap.
        cumulative_cap: Maximum Σ|Δε| in the rolling window.
        window_seconds: Width of the rolling window in seconds.
        epsilon_floor: Hard lower bound on epsilon.
        epsilon_ceiling: Hard upper bound on epsilon.
        call_tool: Optional callable for MCP tool dispatch. When ``None``
                   the adjustment is applied internally (test / local mode).
    """

    current_epsilon: float = 0.05
    l_phi_threshold: float = L_PHI_THRESHOLD
    delta_max: float = DELTA_MAX
    cumulative_cap: float = CUMULATIVE_CAP
    window_seconds: float = WINDOW_SECONDS
    epsilon_floor: float = EPSILON_FLOOR
    epsilon_ceiling: float = EPSILON_CEILING
    call_tool: Any = None  # Callable[[str, dict], dict] | None

    _adjustment_history: list[_AdjRecord] = field(default_factory=list, init=False, repr=False)

    def _prune_window(self, now: float) -> None:
        cutoff = now - self.window_seconds
        self._adjustment_history = [
            r for r in self._adjustment_history if r.timestamp >= cutoff
        ]

    def _cumulative_in_window(self, now: float) -> float:
        self._prune_window(now)
        return sum(r.abs_delta for r in self._adjustment_history)

    def _clamp_delta(self, raw_delta: float, now: float) -> float:
        """Apply per-call and cumulative caps; return 0.0 if no budget left."""
        # Per-call cap
        capped = max(-self.delta_max, min(self.delta_max, raw_delta))
        abs_capped = abs(capped)

        # Cumulative cap
        used = self._cumulative_in_window(now)
        remaining = self.cumulative_cap - used
        if remaining <= 0.0:
            return 0.0
        if abs_capped > remaining:
            capped = remaining * (1.0 if raw_delta >= 0 else -1.0)

        return capped

    def adjust(self, l_phi: float, *, reason: str = "fast_path") -> dict[str, Any]:
        """Evaluate L_Phi and apply a bounded epsilon adjustment if above threshold.

        Args:
            l_phi: Current L_Phi spectral activity signal value.
            reason: Audit reason string passed to the tool call.

        Returns:
            dict with ``status`` (``"adjusted"`` | ``"below_threshold"`` |
            ``"capped"``), ``l_phi``, ``epsilon_before``, ``epsilon_after``,
            and ``delta_applied``.
        """
        if l_phi <= self.l_phi_threshold:
            return {
                "status": "below_threshold",
                "l_phi": l_phi,
                "threshold": self.l_phi_threshold,
                "epsilon_before": self.current_epsilon,
                "epsilon_after": self.current_epsilon,
                "delta_applied": 0.0,
            }

        now = time.time()
        # Proportional raw delta: push epsilon up proportional to excess L_Phi
        excess = l_phi - self.l_phi_threshold
        raw_delta = excess * self.delta_max  # scale: excess in [0,∞), capped downstream

        delta = self._clamp_delta(raw_delta, now)
        if delta == 0.0:
            return {
                "status": "capped",
                "l_phi": l_phi,
                "threshold": self.l_phi_threshold,
                "epsilon_before": self.current_epsilon,
                "epsilon_after": self.current_epsilon,
                "delta_applied": 0.0,
                "reason": "cumulative_cap_exhausted",
            }

        new_epsilon = self.current_epsilon + delta
        # Floor / ceiling enforcement
        new_epsilon = max(self.epsilon_floor, min(self.epsilon_ceiling, new_epsilon))
        actual_delta = new_epsilon - self.current_epsilon

        if actual_delta == 0.0:
            return {
                "status": "capped",
                "l_phi": l_phi,
                "epsilon_before": self.current_epsilon,
                "epsilon_after": self.current_epsilon,
                "delta_applied": 0.0,
                "reason": "epsilon_bounds",
            }

        epsilon_before = self.current_epsilon

        # Route through MCP tool surface if available
        if self.call_tool is not None:
            try:
                self.call_tool(
                    "tool_epsilon_adjust",
                    {"delta": actual_delta, "reason": reason},
                )
            except Exception:
                logger.exception("MCP tool_epsilon_adjust call failed in fast path")

        self.current_epsilon = new_epsilon
        self._adjustment_history.append(
            _AdjRecord(timestamp=now, abs_delta=abs(actual_delta))
        )

        logger.debug(
            "fast_path: L_Phi=%.3f, Δε=%.4f, ε: %.4f→%.4f",
            l_phi,
            actual_delta,
            epsilon_before,
            new_epsilon,
        )

        return {
            "status": "adjusted",
            "l_phi": l_phi,
            "threshold": self.l_phi_threshold,
            "epsilon_before": epsilon_before,
            "epsilon_after": self.current_epsilon,
            "delta_applied": actual_delta,
        }


async def epsilon_monitor_task(
    interval: float = 2.0,
    *,
    monitor: FastPathMonitor | None = None,
    l_phi_provider: Any = None,
    shutdown_event: asyncio.Event | None = None,
) -> None:
    """Asyncio task: monitor L_Phi on *interval*-second cadence (ADR-031 G-04).

    Args:
        interval: Poll interval in seconds. ADR-031 specifies τ_F = 2 s.
        monitor: :class:`FastPathMonitor` instance. A default instance is
                 created if not supplied.
        l_phi_provider: Callable ``() -> float`` that returns the current
                        L_Phi value. Returns 0.0 if ``None``.
        shutdown_event: ``asyncio.Event`` that, when set, causes the task
                        to exit gracefully.
    """
    resolved_monitor = monitor or FastPathMonitor()
    resolved_shutdown = shutdown_event or asyncio.Event()

    logger.info("epsilon_monitor_task started (interval=%.1fs)", interval)

    while not resolved_shutdown.is_set():
        try:
            l_phi = l_phi_provider() if l_phi_provider is not None else 0.0
            result = resolved_monitor.adjust(l_phi)
            if result["status"] == "adjusted":
                logger.info(
                    "fast_path adjustment: ε %.4f → %.4f (L_Phi=%.3f)",
                    result["epsilon_before"],
                    result["epsilon_after"],
                    l_phi,
                )
        except Exception:
            logger.exception("epsilon_monitor_task: unhandled error during adjust")

        try:
            await asyncio.wait_for(
                asyncio.shield(resolved_shutdown.wait()),
                timeout=interval,
            )
            # shutdown_event became set
            break
        except asyncio.TimeoutError:
            pass  # normal: wait expired, loop again

    logger.info("epsilon_monitor_task stopped")
