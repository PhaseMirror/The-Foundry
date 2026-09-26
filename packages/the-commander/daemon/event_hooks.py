"""G-03: Event-driven twin synchronization hooks.

Per ADR-031: Commit and restore events trigger immediate twin snapshot,
not deferred to the next heartbeat cycle. The twin lag detector blocks
upgrade operations when the snapshot is stale beyond the configured
maximum.
"""

from __future__ import annotations

import time
from pathlib import Path
from typing import Any

from digital_twin.twin import DigitalTwin
from mcp_server._yaml import dump_yaml_file, load_yaml_file


REPO_ROOT = Path(__file__).resolve().parents[1]
STATE_DIR = REPO_ROOT / "state"
SYNC_TIMESTAMP_PATH = STATE_DIR / "twin_sync_timestamp.yaml"

# Default: upgrades blocked when twin snapshot is older than 300 seconds
DEFAULT_MAX_LAG_SECONDS: float = 300.0


def on_commit_event(
    commit_sha: str,
    actor: str,
    *,
    twin: DigitalTwin | None = None,
    sync_timestamp_path: Path = SYNC_TIMESTAMP_PATH,
) -> dict[str, Any]:
    """Called by MCP middleware on every governance write.

    Triggers an immediate twin snapshot so the mathematical model stays
    aligned with the post-commit live state. The sync timestamp is
    persisted so that :func:`check_twin_lag` can detect staleness across
    process restarts.

    Args:
        commit_sha: The commit hash of the governance write.
        actor: The identity that performed the write.
        twin: Optional :class:`~digital_twin.twin.DigitalTwin` instance.
              A fresh default instance is used if not supplied.
        sync_timestamp_path: Path to persist the sync timestamp YAML.

    Returns:
        dict with ``snapshot_id``, ``commit_sha``, ``actor``, and
        ``synced_at`` (Unix epoch float).
    """
    resolved_twin = twin or DigitalTwin()
    label = f"commit-{commit_sha[:8]}"
    snapshot = resolved_twin.snapshot(label)
    synced_at = time.time()
    _save_sync_timestamp(synced_at, sync_timestamp_path=sync_timestamp_path)
    return {
        "event": "commit",
        "snapshot_id": snapshot["snapshot_id"],
        "commit_sha": commit_sha,
        "actor": actor,
        "synced_at": synced_at,
    }


def on_restore_event(
    snapshot_id: str,
    *,
    twin: DigitalTwin | None = None,
    sync_timestamp_path: Path = SYNC_TIMESTAMP_PATH,
) -> dict[str, Any]:
    """Called after every rollback restore.

    Captures the post-restore live state into the twin so that subsequent
    diff evaluations compare against the restored baseline rather than the
    pre-restore snapshot.

    Args:
        snapshot_id: The snapshot identifier that was restored.
        twin: Optional :class:`~digital_twin.twin.DigitalTwin` instance.
        sync_timestamp_path: Path to persist the sync timestamp YAML.

    Returns:
        dict with ``snapshot_id``, ``post_restore_label``, and
        ``synced_at``.
    """
    resolved_twin = twin or DigitalTwin()
    label = f"post-restore-{snapshot_id}"
    snapshot = resolved_twin.snapshot(label)
    synced_at = time.time()
    _save_sync_timestamp(synced_at, sync_timestamp_path=sync_timestamp_path)
    return {
        "event": "restore",
        "snapshot_id": snapshot["snapshot_id"],
        "restored_from": snapshot_id,
        "post_restore_label": label,
        "synced_at": synced_at,
    }


def check_twin_lag(
    max_lag_seconds: float = DEFAULT_MAX_LAG_SECONDS,
    *,
    sync_timestamp_path: Path = SYNC_TIMESTAMP_PATH,
) -> bool:
    """Return ``True`` if the twin sync is current; ``False`` (stale) blocks upgrades.

    ADR-031 invariant: upgrade operations MUST NOT proceed when the twin
    snapshot is older than *max_lag_seconds*. Callers should raise or
    refuse to proceed when this returns ``False``.

    Args:
        max_lag_seconds: Maximum acceptable staleness in seconds.
                         Defaults to 300 s per ADR-031.
        sync_timestamp_path: Path to the persisted sync timestamp YAML.

    Returns:
        ``True`` if current; ``False`` if stale or never synced.
    """
    last_sync = _load_sync_timestamp(sync_timestamp_path=sync_timestamp_path)
    if last_sync is None:
        return False
    lag = time.time() - last_sync
    return lag <= max_lag_seconds


def get_twin_lag_seconds(
    *,
    sync_timestamp_path: Path = SYNC_TIMESTAMP_PATH,
) -> float | None:
    """Return the number of seconds since the last twin sync, or ``None`` if unknown."""
    last_sync = _load_sync_timestamp(sync_timestamp_path=sync_timestamp_path)
    if last_sync is None:
        return None
    return time.time() - last_sync


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _save_sync_timestamp(
    timestamp: float,
    *,
    sync_timestamp_path: Path = SYNC_TIMESTAMP_PATH,
) -> None:
    sync_timestamp_path.parent.mkdir(parents=True, exist_ok=True)
    dump_yaml_file(sync_timestamp_path, {"last_sync_epoch": timestamp})


def _load_sync_timestamp(
    *,
    sync_timestamp_path: Path = SYNC_TIMESTAMP_PATH,
) -> float | None:
    if not sync_timestamp_path.exists():
        return None
    payload = load_yaml_file(sync_timestamp_path)
    if not isinstance(payload, dict):
        return None
    value = payload.get("last_sync_epoch")
    if not isinstance(value, (int, float)):
        return None
    return float(value)
