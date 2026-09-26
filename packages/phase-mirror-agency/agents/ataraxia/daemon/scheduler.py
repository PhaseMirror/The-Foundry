"""G-01/G-02: Daemon heartbeat scheduler — sync and async surfaces.

The module provides both a legacy synchronous ``run_heartbeat_loop``
(preserved for backward compatibility) and a new async
``heartbeat_task`` coroutine that runs inside the ``asyncio.gather``
call in :mod:`daemon.__main__`.
"""

from __future__ import annotations

import asyncio
import logging
import sys
import time
from typing import TYPE_CHECKING, Any

from .watchdog import DaemonWatchdog
from .startup_verification import startup_verification_gate

if TYPE_CHECKING:
    from .observability import DaemonObservability

logger = logging.getLogger(__name__)


# Module-level initialization: verify immutability before any heartbeat operations
_immutability_verified = False
_verification_error: str | None = None

def _ensure_immutability_verified() -> None:
    """Verify immutability once per daemon process lifetime."""
    global _immutability_verified, _verification_error
    
    if _immutability_verified:
        return  # Already checked in this process
    
    if not startup_verification_gate(engage_kill_switch=True):
        _verification_error = "Immutability verification failed; daemon halting"
        print(f"FATAL: {_verification_error}", file=sys.stderr)
        sys.exit(1)
    
    _immutability_verified = True


def run_heartbeat_once(
    *,
    label: str | None = None,
    watchdog: DaemonWatchdog | None = None,
) -> dict[str, Any]:
    """Execute one daemon heartbeat cycle against the canonical watchdog."""
    _ensure_immutability_verified()
    resolved_watchdog = watchdog or DaemonWatchdog(persist_epsilon_state=True)
    return resolved_watchdog.heartbeat(label=label)


def run_heartbeat_loop(
    *,
    interval_seconds: float = 60.0,
    iterations: int | None = None,
    label_prefix: str = "daemon-loop",
    watchdog: DaemonWatchdog | None = None,
) -> list[dict[str, Any]]:
    """Run repeated daemon heartbeats with a simple fixed interval scheduler."""
    _ensure_immutability_verified()
    resolved_watchdog = watchdog or DaemonWatchdog(persist_epsilon_state=True)
    reports: list[dict[str, Any]] = []
    run_count = 0

    while iterations is None or run_count < iterations:
        label = f"{label_prefix}-{run_count + 1}"
        reports.append(resolved_watchdog.heartbeat(label=label))
        run_count += 1
        if iterations is not None and run_count >= iterations:
            break
        time.sleep(interval_seconds)

    return reports


async def heartbeat_task(
    interval: float = 60.0,
    *,
    watchdog: DaemonWatchdog | None = None,
    observability: "DaemonObservability | None" = None,
    shutdown_event: asyncio.Event | None = None,
) -> None:
    """Asyncio task: periodic heartbeat loop at *interval*-second cadence (ADR-031 G-02).

    Runs :meth:`~daemon.watchdog.DaemonWatchdog.heartbeat` every *interval*
    seconds and records the result in the observability surface. Exits
    gracefully when *shutdown_event* is set.

    Args:
        interval: Heartbeat period in seconds. ADR-031 specifies τ_H = 60 s.
        watchdog: :class:`~daemon.watchdog.DaemonWatchdog` instance. A
                  fresh instance with state persistence enabled is created
                  if not supplied.
        observability: :class:`~daemon.observability.DaemonObservability`
                       instance for recording metrics. Optional.
        shutdown_event: ``asyncio.Event`` that, when set, causes the task
                        to exit gracefully.
    """
    resolved_watchdog = watchdog or DaemonWatchdog(persist_epsilon_state=True)
    resolved_shutdown = shutdown_event or asyncio.Event()
    run_count = 0

    logger.info("heartbeat_task started (interval=%.0fs)", interval)

    while not resolved_shutdown.is_set():
        run_count += 1
        label = f"daemon-async-{run_count}"
        try:
            report = resolved_watchdog.heartbeat(label=label)
            if observability is not None:
                observability.record_heartbeat(report)
                observability.write_status(report)
            logger.debug("heartbeat #%d: status=%s diff=%.4f", run_count, report.get("status"), report.get("diff_score", 0.0))
        except Exception:
            logger.exception("heartbeat_task: unhandled error during heartbeat #%d", run_count)
            if observability is not None:
                observability.record_error(f"heartbeat_{run_count}_failed")

        try:
            await asyncio.wait_for(
                asyncio.shield(resolved_shutdown.wait()),
                timeout=interval,
            )
            break  # shutdown_event became set
        except asyncio.TimeoutError:
            pass  # normal: interval elapsed, loop again

    logger.info("heartbeat_task stopped after %d cycles", run_count)