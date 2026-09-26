"""Canonical daemon watchdog surface for Wave 2 PMD reconfiguration."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from contracts.shared.constants import (
    EPSILON_ADJUST_MAX_CUMULATIVE_10MIN,
    EPSILON_ADJUST_MAX_PER_CALL,
    EPSILON_DEFAULT,
    EPSILON_MAX,
    EPSILON_MIN,
    EPSILON_MIN_SAFE,
    MAX_CIRCUIT_STEPS,
)
from digital_twin.twin import DigitalTwin
from ensemble.system_events import EventBroadcaster, EventType, SystemEvent
from governance.ledger import AuditLedger, AuditLedgerEntry, record_epsilon_adjustment
from mcp_server._yaml import dump_yaml_file, load_yaml_file
from rollback.rollback_manager import RollbackManager, SystemStateSnapshot


REPO_ROOT = Path(__file__).resolve().parents[1]
DAEMON_DIR = REPO_ROOT / "daemon"
LATEST_HEARTBEAT_PATH = DAEMON_DIR / "latest_heartbeat.yaml"
STATE_DIR = REPO_ROOT / "state"
EPSILON_STATE_PATH = STATE_DIR / "epsilon_runtime.yaml"


@dataclass(frozen=True)
class EpsilonAdjustmentRecord:
    """Single epsilon adjustment event used for rolling-window enforcement."""

    recorded_at: datetime
    delta: float


@dataclass
class DaemonWatchdog:
    """Track daemon heartbeats and route drift into the rollback surface."""

    twin: DigitalTwin = field(default_factory=DigitalTwin)
    rollback_manager: RollbackManager = field(default_factory=RollbackManager)
    heartbeat_path: Path = LATEST_HEARTBEAT_PATH
    diff_threshold: float = 0.25
    twin_lag_max_seconds: float = 120.0
    epsilon_adjust_min_interval_seconds: float = 30.0
    epsilon_state_path: Path = EPSILON_STATE_PATH
    persist_epsilon_state: bool = False
    audit_ledger: AuditLedger = field(default_factory=AuditLedger)
    current_epsilon: float = EPSILON_DEFAULT
    epsilon_adjustments: list[EpsilonAdjustmentRecord] = field(default_factory=list)
    last_epsilon_adjustment_at: datetime | None = None
    last_sync_time: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    last_validator_sync: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __post_init__(self) -> None:
        if self.persist_epsilon_state:
            self._load_epsilon_state()
        EventBroadcaster.subscribe(self._on_event)

    def heartbeat(self, label: str | None = None) -> dict[str, Any]:
        """Record a heartbeat against the canonical digital twin state."""
        self.twin.ensure_state_surfaces()

        if not self.twin.latest_snapshot_path.exists():
            snapshot = self.twin.snapshot(label or "daemon-bootstrap")
            report = {
                "status": "baseline_established",
                "snapshot_id": snapshot["snapshot_id"],
                "diff_score": 0.0,
                "changed_keys": [],
                "rollback_status": "clear",
                "trigger": None,
                "current_epsilon": self.current_epsilon,
            }
            self._write_heartbeat(report)
            return report

        diff_report = self.twin.diff()
        diff_score = self._calculate_diff_score(diff_report)
        rollback_report = self.rollback_manager.evaluate(
            SystemStateSnapshot(diff_score=diff_score, threshold=self.diff_threshold)
        )
        report = {
            "status": "in_sync" if diff_report["is_in_sync"] else "drift_detected",
            "snapshot_id": diff_report["snapshot_id"],
            "diff_score": diff_score,
            "changed_keys": diff_report["changed_keys"],
            "rollback_status": rollback_report["status"],
            "trigger": rollback_report["trigger"],
            "current_epsilon": self.current_epsilon,
            "upgrade_permitted": self.can_permit_upgrade(),
        }
        self._write_heartbeat(report)
        return report

    def evaluate_runtime(
        self,
        *,
        L_Phi: float = 0.0,
        consecutive_failures: int = 0,
        fail_rate_60s: float = 0.0,
        operator_halt: bool = False,
        diff_score: float | None = None,
    ) -> dict[str, Any]:
        """Evaluate runtime metrics against canonical rollback triggers."""
        resolved_diff_score = diff_score
        if resolved_diff_score is None:
            heartbeat = self.heartbeat()
            resolved_diff_score = float(heartbeat["diff_score"])

        system_state = SystemStateSnapshot(
            L_Phi=L_Phi,
            consecutive_failures=consecutive_failures,
            fail_rate_60s=fail_rate_60s,
            diff_score=resolved_diff_score,
            threshold=self.diff_threshold,
            operator_halt=operator_halt,
        )
        rollback_report = self.rollback_manager.evaluate(system_state)
        return {
            "status": rollback_report["status"],
            "trigger": rollback_report["trigger"],
            "diff_score": resolved_diff_score,
            "threshold": self.diff_threshold,
            "current_epsilon": self.current_epsilon,
        }

    def _calculate_diff_score(self, diff_report: dict[str, Any]) -> float:
        live_state = load_yaml_file(self.twin.live_state_path)
        live_key_count = len(live_state) if isinstance(live_state, dict) else 0
        changed_key_count = len(diff_report["changed_keys"])
        return changed_key_count / max(live_key_count, 1)

    def _write_heartbeat(self, report: dict[str, Any]) -> None:
        payload = {
            "recorded_at": datetime.now(timezone.utc).isoformat(),
            **report,
        }
        dump_yaml_file(self.heartbeat_path, payload)

    def epsilon_adjust(
        self,
        delta: float,
        *,
        reason: str = "watchdog_adjustment",
        now: datetime | None = None,
    ) -> dict[str, Any]:
        """Apply a circuit-safe epsilon adjustment and record it to the audit ledger."""

        resolved_now = now or datetime.now(timezone.utc)
        previous_adjustment_count = len(self.epsilon_adjustments)
        self._prune_epsilon_adjustments(resolved_now)
        if self.persist_epsilon_state and len(self.epsilon_adjustments) != previous_adjustment_count:
            self._write_epsilon_state()

        if abs(delta) > EPSILON_ADJUST_MAX_PER_CALL:
            return {
                "status": "rejected",
                "reason": "per_call_limit_exceeded",
                "delta": delta,
                "limit": EPSILON_ADJUST_MAX_PER_CALL,
                "current_epsilon": self.current_epsilon,
            }

        if self.last_epsilon_adjustment_at is not None:
            elapsed_seconds = (resolved_now - self.last_epsilon_adjustment_at).total_seconds()
            if elapsed_seconds < self.epsilon_adjust_min_interval_seconds:
                return {
                    "status": "rejected",
                    "reason": "rate_limit_exceeded",
                    "delta": delta,
                    "current_epsilon": self.current_epsilon,
                    "min_interval_seconds": self.epsilon_adjust_min_interval_seconds,
                    "seconds_until_retry": round(
                        self.epsilon_adjust_min_interval_seconds - max(elapsed_seconds, 0.0),
                        6,
                    ),
                }

        new_epsilon = self.current_epsilon + delta
        if new_epsilon < EPSILON_MIN:
            return {
                "status": "rejected",
                "reason": "below_minimum",
                "delta": delta,
                "current_epsilon": self.current_epsilon,
                "new_epsilon": new_epsilon,
                "epsilon_min": EPSILON_MIN,
                "epsilon_min_safe": EPSILON_MIN_SAFE,
                "max_circuit_steps": MAX_CIRCUIT_STEPS,
            }
        if new_epsilon > EPSILON_MAX:
            return {
                "status": "rejected",
                "reason": "above_maximum",
                "delta": delta,
                "current_epsilon": self.current_epsilon,
                "new_epsilon": new_epsilon,
                "epsilon_max": EPSILON_MAX,
            }

        cumulative_adjustment = sum(abs(record.delta) for record in self.epsilon_adjustments)
        proposed_cumulative = cumulative_adjustment + abs(delta)
        if proposed_cumulative > EPSILON_ADJUST_MAX_CUMULATIVE_10MIN:
            return {
                "status": "rejected",
                "reason": "cumulative_limit_exceeded",
                "delta": delta,
                "current_epsilon": self.current_epsilon,
                "cumulative_adjustment": cumulative_adjustment,
                "proposed_cumulative_adjustment": proposed_cumulative,
                "limit": EPSILON_ADJUST_MAX_CUMULATIVE_10MIN,
            }

        self.current_epsilon = new_epsilon
        self.last_epsilon_adjustment_at = resolved_now
        self.epsilon_adjustments.append(
            EpsilonAdjustmentRecord(recorded_at=resolved_now, delta=delta)
        )
        ledger_entry = record_epsilon_adjustment(
            self.audit_ledger,
            delta=delta,
            new_epsilon=new_epsilon,
            reason=reason,
            epsilon_min_safe=EPSILON_MIN_SAFE,
            max_circuit_steps=MAX_CIRCUIT_STEPS,
            within_bounds=True,
            timestamp=resolved_now.isoformat(),
        )
        if self.persist_epsilon_state:
            self._write_epsilon_state()
        EventBroadcaster.emit(
            SystemEvent(
                type=EventType.EPSILON_ADJUST,
                source="watchdog",
                data={"delta": delta, "new_epsilon": new_epsilon, "reason": reason},
            )
        )
        return {
            "status": "accepted",
            "reason": reason,
            "delta": delta,
            "new_epsilon": new_epsilon,
            "epsilon_min": EPSILON_MIN,
            "epsilon_min_safe": EPSILON_MIN_SAFE,
            "epsilon_max": EPSILON_MAX,
            "max_circuit_steps": MAX_CIRCUIT_STEPS,
            "entry_hash": ledger_entry.entry_hash,
        }

    def _on_event(self, event: SystemEvent) -> None:
        if event.type not in {EventType.COMMIT, EventType.RESTORE, EventType.ROLLBACK}:
            return
        self._sync_twin_immediately(source=event.source, event_type=event.type)

    def _sync_twin_immediately(self, *, source: str, event_type: EventType) -> dict[str, Any]:
        sync_label = f"{event_type.value.lower()}-sync"
        report = self.twin.sync_to_live(label=sync_label, source=source)
        sync_time = datetime.now(timezone.utc)
        self.last_sync_time = sync_time
        self.last_validator_sync = sync_time
        return report

    def check_twin_lag(self, *, now: datetime | None = None, force_validator: bool = False) -> dict[str, Any]:
        resolved_now = now or datetime.now(timezone.utc)
        live_hash = self.twin.get_live_hash()
        twin_hash = self.twin.get_twin_hash()
        in_sync = live_hash == twin_hash

        if in_sync:
            self.last_sync_time = resolved_now
            return {
                "status": "in_sync",
                "live_hash": live_hash,
                "twin_hash": twin_hash,
                "lag_seconds": 0.0,
                "upgrade_permitted": True,
            }

        lag_seconds = max(0.0, (resolved_now - self.last_sync_time).total_seconds())
        validator_due = force_validator or (resolved_now - self.last_validator_sync) >= timedelta(seconds=300)
        sync_report: dict[str, Any] | None = None

        if lag_seconds > self.twin_lag_max_seconds or validator_due:
            sync_report = self.twin.sync_to_live(label="validator-sync", source="watchdog")
            sync_time = datetime.now(timezone.utc)
            self.last_validator_sync = sync_time
            self.last_sync_time = sync_time
            live_hash = self.twin.get_live_hash()
            twin_hash = self.twin.get_twin_hash()
            in_sync = live_hash == twin_hash

        return {
            "status": "in_sync" if in_sync else "lagging",
            "live_hash": live_hash,
            "twin_hash": twin_hash,
            "lag_seconds": 0.0 if in_sync else lag_seconds,
            "upgrade_permitted": in_sync,
            "validator_due": validator_due,
            "sync_report": sync_report,
        }

    def can_permit_upgrade(self, *, now: datetime | None = None) -> bool:
        return bool(self.check_twin_lag(now=now)["upgrade_permitted"])

    def _prune_epsilon_adjustments(self, now: datetime) -> None:
        cutoff = now - timedelta(minutes=10)
        self.epsilon_adjustments = [
            record for record in self.epsilon_adjustments if record.recorded_at >= cutoff
        ]

    def _load_epsilon_state(self) -> None:
        if not self.epsilon_state_path.exists():
            self._write_epsilon_state()
            return

        payload = load_yaml_file(self.epsilon_state_path)
        if not isinstance(payload, dict):
            self._write_epsilon_state()
            return

        stored_epsilon = payload.get("current_epsilon")
        if isinstance(stored_epsilon, (int, float)):
            self.current_epsilon = float(stored_epsilon)

        self.epsilon_adjustments = self._deserialize_adjustments(payload.get("recent_adjustments", []))
        self.audit_ledger.entries = self._deserialize_audit_entries(payload.get("audit_entries", []))
        self.last_epsilon_adjustment_at = self._deserialize_optional_datetime(payload.get("last_adjusted_at"))
        self._prune_epsilon_adjustments(datetime.now(timezone.utc))
        self._write_epsilon_state()

    def _write_epsilon_state(self) -> None:
        payload = {
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "current_epsilon": self.current_epsilon,
            "recent_adjustments": [
                {
                    "recorded_at": record.recorded_at.isoformat(),
                    "delta": record.delta,
                }
                for record in self.epsilon_adjustments
            ],
            "last_adjusted_at": self.last_epsilon_adjustment_at.isoformat()
            if self.last_epsilon_adjustment_at is not None
            else None,
            "audit_entries": [entry.to_dict() for entry in self.audit_ledger.entries],
        }
        dump_yaml_file(self.epsilon_state_path, payload)

    def _deserialize_adjustments(self, payload: Any) -> list[EpsilonAdjustmentRecord]:
        if not isinstance(payload, list):
            return []

        adjustments: list[EpsilonAdjustmentRecord] = []
        for item in payload:
            if not isinstance(item, dict):
                continue
            recorded_at = item.get("recorded_at")
            delta = item.get("delta")
            if not isinstance(recorded_at, str) or not isinstance(delta, (int, float)):
                continue
            try:
                parsed_recorded_at = datetime.fromisoformat(recorded_at)
            except ValueError:
                continue
            if parsed_recorded_at.tzinfo is None:
                parsed_recorded_at = parsed_recorded_at.replace(tzinfo=timezone.utc)
            adjustments.append(
                EpsilonAdjustmentRecord(
                    recorded_at=parsed_recorded_at,
                    delta=float(delta),
                )
            )
        return adjustments

    def _deserialize_audit_entries(self, payload: Any) -> list[AuditLedgerEntry]:
        if not isinstance(payload, list):
            return []

        entries: list[AuditLedgerEntry] = []
        for item in payload:
            if not isinstance(item, dict):
                continue
            timestamp = item.get("timestamp")
            report = item.get("report")
            if not isinstance(timestamp, str):
                continue
            entries.append(
                AuditLedgerEntry(
                    sequence_num=int(item.get("sequence_num", len(entries) + 1)),
                    evaluation_id=str(item.get("evaluation_id", f"persisted-{len(entries) + 1}")),
                    timestamp=timestamp,
                    report=report,
                    prev_hash=str(item.get("prev_hash", "")),
                    payload_hash=str(item.get("payload_hash", "")),
                    entry_hash=str(item.get("entry_hash", "")),
                    type=str(item.get("type", "audit_log")),
                )
            )
        return entries

    def _deserialize_optional_datetime(self, value: Any) -> datetime | None:
        if not isinstance(value, str):
            return None
        try:
            parsed = datetime.fromisoformat(value)
        except ValueError:
            return None
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed