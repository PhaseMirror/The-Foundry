"""G-07: Daemon observability — status reporting, metrics, event log, signals.

Per ADR-031 G-07: The daemon exposes runtime state through:

1. A ``latest_heartbeat.yaml`` status file updated on every heartbeat cycle.
2. A ``daemon_metrics.json`` file with aggregate counters (uptime, heartbeats,
   events processed, errors, epsilon adjustments).
3. Operator signals: ``SIGUSR1`` dumps current state to stderr;
   ``SIGUSR2`` toggles verbose logging.
4. An in-memory event log queryable by type and time.
"""

from __future__ import annotations

import json
import logging
import signal
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


logger = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).resolve().parents[1]
DAEMON_DIR = REPO_ROOT / "daemon"
DEFAULT_STATUS_PATH = DAEMON_DIR / "latest_heartbeat.yaml"
DEFAULT_METRICS_PATH = DAEMON_DIR / "daemon_metrics.json"


@dataclass
class DaemonEventRecord:
    """A single structured event entry in the in-memory event log."""

    timestamp: float
    event_type: str
    data: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        return {
            "timestamp": self.timestamp,
            "event_type": self.event_type,
            "data": self.data,
        }


@dataclass
class DaemonMetrics:
    """Aggregate counters maintained across the daemon lifetime."""

    started_at: float = field(default_factory=time.time)
    heartbeat_count: int = 0
    event_count: int = 0
    error_count: int = 0
    epsilon_adjustment_count: int = 0
    kill_switch_triggers: int = 0
    rollback_triggers: int = 0
    operator_halt_triggers: int = 0

    def uptime_seconds(self) -> float:
        return time.time() - self.started_at

    def to_dict(self) -> dict[str, Any]:
        return {
            "started_at": self.started_at,
            "uptime_seconds": self.uptime_seconds(),
            "heartbeat_count": self.heartbeat_count,
            "event_count": self.event_count,
            "error_count": self.error_count,
            "epsilon_adjustment_count": self.epsilon_adjustment_count,
            "kill_switch_triggers": self.kill_switch_triggers,
            "rollback_triggers": self.rollback_triggers,
            "operator_halt_triggers": self.operator_halt_triggers,
        }


class DaemonObservability:
    """Centralised observability surface for the long-running daemon.

    Args:
        status_path: Path for the YAML status file.
        metrics_path: Path for the JSON metrics file.
        max_event_log_size: Maximum number of events retained in memory.
    """

    def __init__(
        self,
        *,
        status_path: Path = DEFAULT_STATUS_PATH,
        metrics_path: Path = DEFAULT_METRICS_PATH,
        max_event_log_size: int = 1000,
    ) -> None:
        self._status_path = status_path
        self._metrics_path = metrics_path
        self._max_event_log_size = max_event_log_size
        self._metrics = DaemonMetrics()
        self._event_log: list[DaemonEventRecord] = []
        self._verbose_logging = False

    # ------------------------------------------------------------------
    # Metrics helpers
    # ------------------------------------------------------------------

    @property
    def metrics(self) -> DaemonMetrics:
        return self._metrics

    def record_heartbeat(self, report: dict[str, Any]) -> None:
        """Increment heartbeat counter and append to event log."""
        self._metrics.heartbeat_count += 1
        self._append_event("heartbeat", report)

    def record_event(self, event_type: str, data: dict[str, Any]) -> None:
        """Increment event counter and append to event log."""
        self._metrics.event_count += 1
        self._append_event(event_type, data)

    def record_error(self, error: str, context: dict[str, Any] | None = None) -> None:
        """Increment error counter and append to event log."""
        self._metrics.error_count += 1
        self._append_event("error", {"error": error, **(context or {})})

    def record_epsilon_adjustment(self, report: dict[str, Any]) -> None:
        """Increment epsilon adjustment counter."""
        self._metrics.epsilon_adjustment_count += 1
        self._append_event("epsilon_adjustment", report)

    def record_kill_switch(self, reason: str) -> None:
        self._metrics.kill_switch_triggers += 1
        self._append_event("kill_switch", {"reason": reason})

    def record_rollback(self, reason: str) -> None:
        self._metrics.rollback_triggers += 1
        self._append_event("rollback", {"reason": reason})

    def record_operator_halt(self, reason: str) -> None:
        self._metrics.operator_halt_triggers += 1
        self._append_event("operator_halt", {"reason": reason})

    # ------------------------------------------------------------------
    # File I/O
    # ------------------------------------------------------------------

    def write_status(self, status_data: dict[str, Any]) -> None:
        """Write *status_data* to the YAML status file.

        The status file is read by operators and monitoring tools.  The
        write is best-effort; errors are logged but not raised.
        """
        try:
            from mcp_server._yaml import dump_yaml_file  # local import to avoid circular deps

            payload = {
                "recorded_at": time.time(),
                "uptime_seconds": self._metrics.uptime_seconds(),
                **status_data,
            }
            self._status_path.parent.mkdir(parents=True, exist_ok=True)
            dump_yaml_file(self._status_path, payload)
        except Exception:
            logger.exception("Failed to write daemon status file")

    def export_metrics(self) -> dict[str, Any]:
        """Return the current metrics dict and write it to the JSON file.

        Returns:
            dict representation of :class:`DaemonMetrics`.
        """
        metrics_dict = self._metrics.to_dict()
        try:
            self._metrics_path.parent.mkdir(parents=True, exist_ok=True)
            self._metrics_path.write_text(
                json.dumps(metrics_dict, indent=2, sort_keys=True),
                encoding="utf-8",
            )
        except Exception:
            logger.exception("Failed to write daemon metrics file")
        return metrics_dict

    # ------------------------------------------------------------------
    # Event log queries
    # ------------------------------------------------------------------

    def query_events(
        self,
        *,
        event_type: str | None = None,
        since: float | None = None,
        limit: int | None = None,
    ) -> list[dict[str, Any]]:
        """Query the in-memory event log.

        Args:
            event_type: Filter by event type string (exact match).
            since: Unix epoch; only return events after this timestamp.
            limit: Maximum number of events to return (most recent first).

        Returns:
            List of event dicts ordered from oldest to newest.
        """
        results = self._event_log

        if event_type is not None:
            results = [e for e in results if e.event_type == event_type]

        if since is not None:
            results = [e for e in results if e.timestamp >= since]

        if limit is not None:
            results = results[-limit:]

        return [e.to_dict() for e in results]

    # ------------------------------------------------------------------
    # Signal handlers
    # ------------------------------------------------------------------

    def install_signal_handlers(self) -> None:
        """Install SIGUSR1 (state dump) and SIGUSR2 (log verbosity toggle)."""
        if not hasattr(signal, "SIGUSR1"):
            logger.debug("SIGUSR1/SIGUSR2 not available on this platform; skipping")
            return
        signal.signal(signal.SIGUSR1, self._handle_sigusr1)
        signal.signal(signal.SIGUSR2, self._handle_sigusr2)
        logger.debug("Signal handlers installed (SIGUSR1=state dump, SIGUSR2=log toggle)")

    def _handle_sigusr1(self, _signum: int, _frame: Any) -> None:
        """Dump current daemon state to stderr on SIGUSR1."""
        state = {
            "metrics": self._metrics.to_dict(),
            "recent_events": self.query_events(limit=10),
        }
        print(
            json.dumps(state, indent=2, sort_keys=True),
            file=sys.stderr,
        )

    def _handle_sigusr2(self, _signum: int, _frame: Any) -> None:
        """Toggle verbose (DEBUG) logging on SIGUSR2."""
        self._verbose_logging = not self._verbose_logging
        level = logging.DEBUG if self._verbose_logging else logging.INFO
        logging.getLogger().setLevel(level)
        logger.info(
            "SIGUSR2: log level set to %s",
            "DEBUG" if self._verbose_logging else "INFO",
        )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _append_event(self, event_type: str, data: dict[str, Any]) -> None:
        record = DaemonEventRecord(
            timestamp=time.time(),
            event_type=event_type,
            data=data,
        )
        self._event_log.append(record)
        # Trim to max size
        if len(self._event_log) > self._max_event_log_size:
            self._event_log = self._event_log[-self._max_event_log_size :]
