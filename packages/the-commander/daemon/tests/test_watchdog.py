from datetime import datetime, timedelta, timezone

from daemon.watchdog import DaemonWatchdog
from digital_twin.twin import DigitalTwin
from ensemble.system_events import EventBroadcaster, EventType, SystemEvent
from mcp_server._yaml import dump_yaml_file, load_yaml_file
from rollback.rollback_manager import RollbackManager


def _make_watchdog(tmp_path, diff_threshold: float = 0.25) -> DaemonWatchdog:
    live_state_path = tmp_path / "state" / "live_state.yaml"
    epoch_index_path = tmp_path / "state" / "epoch_index.yaml"
    snapshot_store = tmp_path / "digital_twin" / "snapshot_store"
    latest_snapshot_path = tmp_path / "digital_twin" / "latest_snapshot.yaml"
    heartbeat_path = tmp_path / "daemon" / "latest_heartbeat.yaml"
    epsilon_state_path = tmp_path / "state" / "epsilon_runtime.yaml"

    twin = DigitalTwin(
        live_state_path=live_state_path,
        epoch_index_path=epoch_index_path,
        snapshot_store=snapshot_store,
        latest_snapshot_path=latest_snapshot_path,
    )
    rollback_manager = RollbackManager(twin=twin)
    return DaemonWatchdog(
        twin=twin,
        rollback_manager=rollback_manager,
        heartbeat_path=heartbeat_path,
        diff_threshold=diff_threshold,
        epsilon_state_path=epsilon_state_path,
        persist_epsilon_state=True,
    )


def _emit_commit_event() -> None:
    EventBroadcaster.emit(
        SystemEvent(
            type=EventType.COMMIT,
            source="ensemble",
            data={"old_version": "v1", "new_version": "v2"},
        )
    )


def test_heartbeat_establishes_baseline_when_snapshot_missing(tmp_path):
    watchdog = _make_watchdog(tmp_path)

    report = watchdog.heartbeat("unit")
    heartbeat_record = load_yaml_file(watchdog.heartbeat_path)

    assert report["status"] == "baseline_established"
    assert report["rollback_status"] == "clear"
    assert heartbeat_record["status"] == "baseline_established"
    assert heartbeat_record["snapshot_id"] == report["snapshot_id"]


def test_heartbeat_reports_twin_divergence(tmp_path):
    watchdog = _make_watchdog(tmp_path, diff_threshold=0.1)
    baseline = watchdog.heartbeat("unit")

    live_state = load_yaml_file(watchdog.twin.live_state_path)
    live_state["status"] = "drifted"
    dump_yaml_file(watchdog.twin.live_state_path, live_state)

    report = watchdog.heartbeat()

    assert baseline["status"] == "baseline_established"
    assert report["status"] == "drift_detected"
    assert report["trigger"] == "twin_divergence"
    assert report["rollback_status"] == "triggered"
    assert report["diff_score"] > watchdog.diff_threshold


def test_watchdog_persists_epsilon_state_across_instances(tmp_path):
    first_watchdog = _make_watchdog(tmp_path)

    first_result = first_watchdog.epsilon_adjust(0.01, reason="runtime_stabilization")
    second_watchdog = _make_watchdog(tmp_path)

    assert first_result["status"] == "accepted"
    assert second_watchdog.current_epsilon == first_result["new_epsilon"]
    assert len(second_watchdog.audit_ledger.entries) == 1


def test_watchdog_enforces_30_second_epsilon_rate_limit(tmp_path):
    watchdog = _make_watchdog(tmp_path)
    start = datetime(2026, 1, 1, tzinfo=timezone.utc)

    first = watchdog.epsilon_adjust(0.01, now=start, reason="watchdog_adjustment")
    second = watchdog.epsilon_adjust(0.01, now=start + timedelta(seconds=10), reason="watchdog_adjustment")
    third = watchdog.epsilon_adjust(0.01, now=start + timedelta(seconds=31), reason="watchdog_adjustment")

    assert first["status"] == "accepted"
    assert second["status"] == "rejected"
    assert second["reason"] == "rate_limit_exceeded"
    assert third["status"] == "accepted"


def test_commit_event_triggers_immediate_twin_sync(tmp_path, monkeypatch):
    EventBroadcaster.reset()
    watchdog = _make_watchdog(tmp_path)
    calls: list[tuple[str, str]] = []

    def _fake_sync_to_live(*, label: str | None = None, source: str = "watchdog"):
        calls.append((label or "", source))
        return {"status": "synced", "snapshot_id": "fake", "source": source}

    monkeypatch.setattr(watchdog.twin, "sync_to_live", _fake_sync_to_live)

    _emit_commit_event()

    assert calls
    assert calls[0][0] == "commit-sync"
    assert calls[0][1] == "ensemble"


def test_twin_lag_blocks_upgrade_when_sync_fails(tmp_path, monkeypatch):
    watchdog = _make_watchdog(tmp_path)
    now = datetime(2026, 1, 1, tzinfo=timezone.utc)
    watchdog.last_sync_time = now - timedelta(seconds=150)

    monkeypatch.setattr(watchdog.twin, "get_live_hash", lambda: "live")
    monkeypatch.setattr(watchdog.twin, "get_twin_hash", lambda: "twin")
    monkeypatch.setattr(
        watchdog.twin,
        "sync_to_live",
        lambda **_: {"status": "failed", "reason": "forced failure for test"},
    )

    report = watchdog.check_twin_lag(now=now)

    assert report["status"] == "lagging"
    assert report["upgrade_permitted"] is False