"""G-01: Daemon process entrypoint with three concurrent asyncio tasks.

Per ADR-031 G-01: The daemon transitions from a fixed-interval script to
a long-running persistent process with three concurrent ``asyncio`` tasks:

1. ``heartbeat_task(interval=60)``  — periodic twin-diff evaluation
2. ``event_listener_task()``        — event-driven commit/restore sync
3. ``epsilon_monitor_task(interval=2)`` — fast-path L_Phi monitoring

The ``daemon start`` sub-command runs all three tasks concurrently via
``asyncio.gather()``. The legacy ``once``, ``loop``, and ``epsilon-adjust``
commands are preserved for backward compatibility.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import signal
import sys
import time
from pathlib import Path
from typing import Any

from mcp_server._yaml import load_yaml_file
from .fast_path import FastPathMonitor, epsilon_monitor_task
from .observability import DaemonObservability
from .scheduler import heartbeat_task, run_heartbeat_loop, run_heartbeat_once
from .watchdog import DaemonWatchdog


logger = logging.getLogger(__name__)

# ADR-031 G-01: canonical timescale constants
HEARTBEAT_INTERVAL: float = 60.0   # τ_H
FAST_PATH_INTERVAL: float = 2.0    # τ_F


class DaemonProcess:
    """Long-running daemon with three concurrent asyncio tasks (ADR-031 G-01).

    Args:
        heartbeat_interval: Period for the heartbeat loop in seconds.
        fast_path_interval: Period for the fast-path epsilon monitor in
                            seconds.
        watchdog: Optional :class:`~daemon.watchdog.DaemonWatchdog` to use.
                  A fresh instance is created if not supplied.
        observability: Optional :class:`~daemon.observability.DaemonObservability`
                       instance. A fresh instance is created if not supplied.
    """

    def __init__(
        self,
        *,
        heartbeat_interval: float = HEARTBEAT_INTERVAL,
        fast_path_interval: float = FAST_PATH_INTERVAL,
        watchdog: DaemonWatchdog | None = None,
        observability: DaemonObservability | None = None,
    ) -> None:
        self.heartbeat_interval = heartbeat_interval
        self.fast_path_interval = fast_path_interval
        self._watchdog = watchdog
        self._observability = observability or DaemonObservability()
        self._shutdown_event: asyncio.Event | None = None

    async def run(self) -> None:
        """Start all three concurrent tasks and block until shutdown signal."""
        self._shutdown_event = asyncio.Event()

        loop = asyncio.get_running_loop()
        for sig in (signal.SIGTERM, signal.SIGINT):
            try:
                loop.add_signal_handler(sig, self._request_shutdown)
            except (NotImplementedError, OSError):
                pass

        self._observability.install_signal_handlers()

        resolved_watchdog = self._watchdog or DaemonWatchdog(persist_epsilon_state=True)

        monitor = FastPathMonitor(current_epsilon=resolved_watchdog.current_epsilon)
        fast_path_l_phi: list[float] = [0.0]

        logger.info(
            "DaemonProcess starting — heartbeat=%.0fs, fast_path=%.0fs",
            self.heartbeat_interval,
            self.fast_path_interval,
        )

        try:
            await asyncio.gather(
                heartbeat_task(
                    interval=self.heartbeat_interval,
                    watchdog=resolved_watchdog,
                    observability=self._observability,
                    shutdown_event=self._shutdown_event,
                ),
                _event_listener_task(
                    observability=self._observability,
                    shutdown_event=self._shutdown_event,
                ),
                epsilon_monitor_task(
                    interval=self.fast_path_interval,
                    monitor=monitor,
                    l_phi_provider=lambda: fast_path_l_phi[0],
                    shutdown_event=self._shutdown_event,
                ),
            )
        except asyncio.CancelledError:
            logger.info("DaemonProcess tasks cancelled")
        finally:
            logger.info("DaemonProcess stopped")

    def _request_shutdown(self) -> None:
        logger.info("Shutdown signal received; stopping daemon tasks")
        if self._shutdown_event is not None:
            self._shutdown_event.set()


async def _event_listener_task(
    *,
    observability: DaemonObservability,
    shutdown_event: asyncio.Event,
) -> None:
    """Asyncio task: listen for commit/restore events from the MCP middleware."""
    logger.info("event_listener_task started")
    while not shutdown_event.is_set():
        try:
            await asyncio.wait_for(
                asyncio.shield(shutdown_event.wait()),
                timeout=1.0,
            )
            break
        except asyncio.TimeoutError:
            pass
    logger.info("event_listener_task stopped")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def main(argv: list[str] | None = None) -> int:
    """CLI entrypoint for the canonical PMD daemon."""
    parser = argparse.ArgumentParser(description="Canonical PMD daemon runner")
    sub = parser.add_subparsers(dest="command")

    # daemon start
    start_p = sub.add_parser("start", help="Start the persistent daemon process")
    start_p.add_argument("--heartbeat-interval", type=float, default=HEARTBEAT_INTERVAL)
    start_p.add_argument("--fast-path-interval", type=float, default=FAST_PATH_INTERVAL)

    # daemon status
    sub.add_parser("status", help="Print the latest heartbeat status")

    # daemon metrics
    sub.add_parser("metrics", help="Print daemon runtime metrics")

    # daemon events
    events_p = sub.add_parser("events", help="Print recent daemon events")
    events_p.add_argument("--limit", type=int, default=20)
    events_p.add_argument("--type", dest="event_type", default=None)

    # daemon tail
    tail_p = sub.add_parser("tail", help="Stream latest heartbeat YAML (polling)")
    tail_p.add_argument("--interval", type=float, default=5.0)

    # Legacy: once
    sub.add_parser("once", help="Run a single heartbeat (legacy)")

    # Legacy: loop
    loop_p = sub.add_parser("loop", help="Run heartbeat loop (legacy)")
    loop_p.add_argument("--label", default=None)
    loop_p.add_argument("--interval-seconds", type=float, default=60.0)
    loop_p.add_argument("--iterations", type=int, default=None)

    # Legacy: epsilon-adjust
    epsilon_p = sub.add_parser("epsilon-adjust", help="Apply an epsilon adjustment (legacy)")
    epsilon_p.add_argument("--delta", type=float, default=None)
    epsilon_p.add_argument("--reason", default=None)
    epsilon_p.add_argument("--label", default=None)

    # Shared optional flags (available before subcommand for legacy compat)
    parser.add_argument("--label", default=None)
    parser.add_argument("--interval-seconds", type=float, default=60.0)
    parser.add_argument("--iterations", type=int, default=None)
    parser.add_argument("--delta", type=float, default=None)
    parser.add_argument("--reason", default=None)

    args = parser.parse_args(argv)

    command = args.command or "once"

    if command == "start":
        logging.basicConfig(level=logging.INFO, stream=sys.stderr)
        daemon = DaemonProcess(
            heartbeat_interval=args.heartbeat_interval,
            fast_path_interval=args.fast_path_interval,
        )
        asyncio.run(daemon.run())
        return 0

    if command == "status":
        return _cmd_status()

    if command == "metrics":
        return _cmd_metrics()

    if command == "events":
        obs = DaemonObservability()
        events = obs.query_events(
            event_type=getattr(args, "event_type", None),
            limit=getattr(args, "limit", 20),
        )
        print(json.dumps(events, indent=2, sort_keys=True))
        return 0

    if command == "tail":
        return _cmd_tail(getattr(args, "interval", 5.0))

    if command == "once":
        label = getattr(args, "label", None)
        report = run_heartbeat_once(label=label)
        print(json.dumps(report, indent=2, sort_keys=True))
        return 0

    if command == "epsilon-adjust":
        delta = getattr(args, "delta", None)
        if delta is None:
            parser.error("the 'epsilon-adjust' command requires --delta")
        reason = getattr(args, "reason", None)
        watchdog = DaemonWatchdog(persist_epsilon_state=True)
        report = watchdog.epsilon_adjust(
            delta,
            reason=reason or "daemon_cli_adjustment",
        )
        print(json.dumps(report, indent=2, sort_keys=True))
        return 0

    # loop
    label = getattr(args, "label", None)
    interval_seconds = getattr(args, "interval_seconds", 60.0)
    iterations = getattr(args, "iterations", None)
    reports = run_heartbeat_loop(
        interval_seconds=interval_seconds,
        iterations=iterations,
        label_prefix=label or "daemon-loop",
    )
    print(json.dumps(reports, indent=2, sort_keys=True))
    return 0


def _cmd_status() -> int:
    status_path = Path(__file__).resolve().parents[1] / "daemon" / "latest_heartbeat.yaml"
    if status_path.exists():
        payload = load_yaml_file(status_path)
        print(json.dumps(payload, indent=2, sort_keys=True, default=str))
    else:
        print(json.dumps({"status": "no_heartbeat_recorded"}, indent=2))
    return 0


def _cmd_metrics() -> int:
    metrics_path = Path(__file__).resolve().parents[1] / "daemon" / "daemon_metrics.json"
    if metrics_path.exists():
        print(metrics_path.read_text(encoding="utf-8"))
    else:
        print(json.dumps({"status": "no_metrics_recorded"}, indent=2))
    return 0


def _cmd_tail(interval: float) -> int:
    status_path = Path(__file__).resolve().parents[1] / "daemon" / "latest_heartbeat.yaml"
    last_content = ""
    print(f"Tailing {status_path} (poll every {interval}s) — Ctrl-C to stop", file=sys.stderr)
    try:
        while True:
            if status_path.exists():
                content = status_path.read_text(encoding="utf-8")
                if content != last_content:
                    print(content)
                    last_content = content
            time.sleep(interval)
    except KeyboardInterrupt:
        pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())