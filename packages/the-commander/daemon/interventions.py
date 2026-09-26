"""G-06: Kill-switch and rollback integration.

Per ADR-031: All daemon-triggered governance interventions are routed
through the MCP tool surface so that governance integrity verification
fires on every call. Three intervention types are supported:

- **rollback** — restore the system to the most recent stable snapshot.
- **kill_switch** — halt all governance writes irreversibly until cleared.
- **operator_halt** — pause execution pending human review.

Every invocation is recorded in an immutable in-memory audit trail. The
kill-switch is idempotent; subsequent calls are logged but do not raise.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any, Callable

from daemon.governance_integrity import GovernanceIntegrityError, verify_tool


logger = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).resolve().parents[1]


class InterventionType(str, Enum):
    """Supported daemon-triggered intervention modes (ADR-031 G-06)."""

    ROLLBACK = "rollback"
    KILL_SWITCH = "kill_switch"
    OPERATOR_HALT = "operator_halt"


@dataclass(frozen=True)
class InterventionRecord:
    """Immutable audit record for a single intervention event."""

    intervention_type: InterventionType
    timestamp: float
    actor: str
    reason: str
    outcome: str  # "success" | "failed" | "already_active"
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "intervention_type": self.intervention_type.value,
            "timestamp": self.timestamp,
            "actor": self.actor,
            "reason": self.reason,
            "outcome": self.outcome,
            "metadata": self.metadata,
        }


class InterventionExecutor:
    """Execute governance interventions via the MCP tool surface.

    Args:
        call_tool: Callable ``(tool_name: str, params: dict) -> dict``
                   that dispatches to the MCP tool surface. When ``None``
                   the executor runs in local/test mode and simulates the
                   call.
        actor: Default actor identity recorded in audit entries.
    """

    def __init__(
        self,
        *,
        call_tool: Callable[[str, dict[str, Any]], dict[str, Any]] | None = None,
        actor: str = "daemon",
    ) -> None:
        self._call_tool = call_tool
        self._actor = actor
        self._kill_switch_active: bool = False
        self._operator_halt_active: bool = False
        self._interventions: list[InterventionRecord] = []

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    @property
    def kill_switch_active(self) -> bool:
        """True when the kill-switch has been engaged."""
        return self._kill_switch_active

    @property
    def operator_halt_active(self) -> bool:
        """True when an operator halt is in effect."""
        return self._operator_halt_active

    @property
    def interventions(self) -> list[InterventionRecord]:
        """Read-only view of the intervention audit trail."""
        return list(self._interventions)

    def trigger_rollback(
        self,
        *,
        snapshot_id: str | None = None,
        reason: str = "watchdog_triggered",
        actor: str | None = None,
    ) -> dict[str, Any]:
        """Trigger a rollback via the MCP tool surface.

        The kill-switch blocks rollback execution once engaged; operator
        halt does not (rollback is a remediation step).

        Args:
            snapshot_id: Target snapshot to restore. ``None`` means the
                         most recent stable snapshot.
            reason: Human-readable reason for the audit record.
            actor: Override for the default actor identity.

        Returns:
            dict with ``status``, ``outcome``, and ``mcp_result``.
        """
        if self._kill_switch_active:
            return self._record_and_return(
                InterventionType.ROLLBACK,
                actor=actor or self._actor,
                reason=reason,
                outcome="blocked_by_kill_switch",
                metadata={"snapshot_id": snapshot_id},
            )

        tool_name = "pmd:rollback"
        try:
            verify_tool(tool_name)
        except GovernanceIntegrityError as exc:
            logger.critical("Governance integrity FAILED on rollback dispatch: %s", exc)
            self.trigger_kill_switch(
                reason=f"integrity_failure_on_rollback: {exc}",
                actor=actor or self._actor,
            )
            return self._record_and_return(
                InterventionType.ROLLBACK,
                actor=actor or self._actor,
                reason=reason,
                outcome="integrity_failure",
                metadata={"error": str(exc)},
            )

        params: dict[str, Any] = {"reason": reason}
        if snapshot_id is not None:
            params["snapshot_id"] = snapshot_id

        mcp_result = self._dispatch(tool_name, params)
        outcome = "success" if mcp_result.get("status") != "error" else "failed"

        return self._record_and_return(
            InterventionType.ROLLBACK,
            actor=actor or self._actor,
            reason=reason,
            outcome=outcome,
            metadata={"snapshot_id": snapshot_id, "mcp_result": mcp_result},
        )

    def trigger_kill_switch(
        self,
        *,
        reason: str = "daemon_integrity_failure",
        actor: str | None = None,
    ) -> dict[str, Any]:
        """Engage the kill-switch to halt all governance writes (idempotent).

        Args:
            reason: Human-readable reason.
            actor: Override for the default actor identity.

        Returns:
            dict with ``status`` and ``outcome``.
        """
        if self._kill_switch_active:
            logger.warning("kill_switch already active; subsequent call is no-op")
            return self._record_and_return(
                InterventionType.KILL_SWITCH,
                actor=actor or self._actor,
                reason=reason,
                outcome="already_active",
            )

        self._kill_switch_active = True
        logger.critical("KILL-SWITCH ENGAGED — governance writes halted. Reason: %s", reason)

        tool_name = "pmd:kill_switch"
        # Integrity verification is skipped here intentionally: we are in the
        # kill-switch path because integrity already failed.  Attempting to
        # re-verify would loop.  The kill-switch tool itself is the safety net.
        mcp_result = self._dispatch(tool_name, {"reason": reason})
        outcome = "success" if mcp_result.get("status") != "error" else "failed"

        return self._record_and_return(
            InterventionType.KILL_SWITCH,
            actor=actor or self._actor,
            reason=reason,
            outcome=outcome,
            metadata={"mcp_result": mcp_result},
        )

    def trigger_operator_halt(
        self,
        *,
        reason: str = "operator_requested",
        actor: str | None = None,
    ) -> dict[str, Any]:
        """Pause daemon execution pending human review.

        Unlike kill-switch, operator halt is reversible: the operator can
        clear it to resume normal operation.

        Args:
            reason: Human-readable reason.
            actor: Override for the default actor identity.

        Returns:
            dict with ``status`` and ``outcome``.
        """
        if self._kill_switch_active:
            return self._record_and_return(
                InterventionType.OPERATOR_HALT,
                actor=actor or self._actor,
                reason=reason,
                outcome="blocked_by_kill_switch",
            )

        self._operator_halt_active = True
        logger.warning("OPERATOR HALT engaged. Reason: %s", reason)

        tool_name = "pmd:halt"
        try:
            verify_tool(tool_name)
        except GovernanceIntegrityError as exc:
            logger.critical("Governance integrity FAILED on operator halt dispatch: %s", exc)
            self.trigger_kill_switch(
                reason=f"integrity_failure_on_halt: {exc}",
                actor=actor or self._actor,
            )
            return self._record_and_return(
                InterventionType.OPERATOR_HALT,
                actor=actor or self._actor,
                reason=reason,
                outcome="integrity_failure",
                metadata={"error": str(exc)},
            )

        mcp_result = self._dispatch(tool_name, {"reason": reason})
        outcome = "success" if mcp_result.get("status") != "error" else "failed"

        return self._record_and_return(
            InterventionType.OPERATOR_HALT,
            actor=actor or self._actor,
            reason=reason,
            outcome=outcome,
            metadata={"mcp_result": mcp_result},
        )

    def clear_operator_halt(self) -> None:
        """Clear the operator halt flag to resume daemon execution."""
        self._operator_halt_active = False
        logger.info("Operator halt cleared; daemon execution resumed")

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _dispatch(self, tool_name: str, params: dict[str, Any]) -> dict[str, Any]:
        """Dispatch a tool call, using the MCP surface or local simulation."""
        if self._call_tool is not None:
            try:
                return self._call_tool(tool_name, params)
            except Exception as exc:
                logger.error("MCP dispatch failed for %s: %s", tool_name, exc)
                return {"status": "error", "error": str(exc)}
        # Local / test mode: simulate a successful response
        logger.debug("local_dispatch: %s %s", tool_name, params)
        return {"status": "ok", "tool": tool_name, "params": params}

    def _record_and_return(
        self,
        intervention_type: InterventionType,
        *,
        actor: str,
        reason: str,
        outcome: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        record = InterventionRecord(
            intervention_type=intervention_type,
            timestamp=time.time(),
            actor=actor,
            reason=reason,
            outcome=outcome,
            metadata=metadata or {},
        )
        self._interventions.append(record)
        logger.info(
            "intervention recorded: type=%s outcome=%s reason=%s",
            intervention_type.value,
            outcome,
            reason,
        )
        return {"status": outcome, "record": record.to_dict()}
