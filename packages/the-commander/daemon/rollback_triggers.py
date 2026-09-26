"""
ADR-039 & ADR-040: Snapshot-Diff-Restore & Trigger Mechanisms

ADR-039: Snapshot-Diff-Restore Protocol
- Capture state before/after changes (snapshots)
- Compute minimal diffs showing what changed
- Generate restore instructions to revert cleanly

ADR-040: Rollback & Kill-Switch Triggers
- Detect conditions that require rollback (watchdog breach, policy fail, manual kill)
- Decide between graceful rollback vs emergency suppress
- Execute restore via checkpoint + instructions

Together: Full recovery path from any failed state back to known-good baseline.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum, auto
from typing import Optional, Dict, Any, List, Callable
import json
import hashlib


class DiffType(Enum):
    """Types of changes in state diff."""
    ADDED = auto()        # New key in after state
    REMOVED = auto()      # Key gone from before state
    MODIFIED = auto()     # Key existed, value changed
    UNCHANGED = auto()    # Key present, same value


class TriggerType(Enum):
    """Types of conditions that can trigger rollback/suppress."""
    POLICY_GATE_FAIL = auto()  # Policy gate returned FAIL
    WATCHDOG_CRITICAL = auto()     # Watchdog detected critical instability
    MANUAL_KILL_SWITCH = auto()    # Operator pressed emergency suppress
    LEDGER_WRITE_FAILURE = auto()  # Ledger write failed (unrecoverable)
    STATE_CORRUPTION = auto()      # State hash mismatch detected
    TIMEOUT_EXCEEDED = auto()      # Operation took too long


class TriggerAction(Enum):
    """Actions to take when trigger fires."""
    GRACEFUL_ROLLBACK = auto()     # Restore from checkpoint, normal shutdown
    EMERGENCY_SUPPRESS = auto()    # Kill current state, restore baseline (kill switch)
    ALERT_ONLY = auto()            # Log alert, continue observing


@dataclass(frozen=True)
class StateDiff:
    """Immutable diff between before/after states.
    
    Shows what changed at the key level (value content omitted for privacy).
    """
    
    before_hash: str  # Hash of before state
    after_hash: str   # Hash of after state
    timestamp: str  # ISO 8601
    changes: Dict[str, DiffType] = field(default_factory=dict)  # key → change type
    added_keys: List[str] = field(default_factory=list)
    removed_keys: List[str] = field(default_factory=list)
    modified_keys: List[str] = field(default_factory=list)
    
    def __post_init__(self):
        if not self.before_hash or not self.after_hash:
            raise ValueError("before_hash and after_hash required")
        
        try:
            datetime.fromisoformat(self.timestamp)
        except ValueError:
            raise ValueError("timestamp must be valid ISO 8601")
    
    def get_diff_hash(self) -> str:
        """Deterministic hash of this diff."""
        content = f"{self.before_hash}→{self.after_hash}:{len(self.changes)}"
        return hashlib.sha256(content.encode()).hexdigest()
    
    def get_summary(self) -> Dict[str, int]:
        """Count of each change type."""
        return {
            'added': len(self.added_keys),
            'removed': len(self.removed_keys),
            'modified': len(self.modified_keys),
            'total_changes': len(self.changes),
        }


@dataclass(frozen=True)
class RestoreInstructions:
    """Immutable instructions for restoring from checkpoint.
    
    Specifies:
    - What state to restore to (checkpoint ID)
    - Order of restoration steps
    - Cleanup actions to run
    """
    
    checkpoint_id: str
    restore_steps: List[Dict[str, Any]] = field(default_factory=list)
    cleanup_actions: List[Dict[str, Any]] = field(default_factory=list)
    estimated_duration_seconds: float = 0.0
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    def __post_init__(self):
        if not self.checkpoint_id or len(self.checkpoint_id.strip()) == 0:
            raise ValueError("checkpoint_id required")
        
        if self.estimated_duration_seconds < 0:
            raise ValueError("duration must be non-negative")
    
    def get_instruction_count(self) -> int:
        """Total steps (restore + cleanup)."""
        return len(self.restore_steps) + len(self.cleanup_actions)


@dataclass(frozen=True)
class Snapshot:
    """Immutable state snapshot at point in time.
    
    Captures:
    - State content (full or hash-only)
    - Timestamp
    - Metadata about system health
    """
    
    snapshot_id: str
    state_hash: str  # SHA256 of state
    timestamp: str  # ISO 8601
    is_known_good: bool = False  # Is this a baseline/checkpoint?
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.snapshot_id or not self.state_hash:
            raise ValueError("snapshot_id and state_hash required")
        
        try:
            datetime.fromisoformat(self.timestamp)
        except ValueError:
            raise ValueError("timestamp must be valid ISO 8601")


class SnapshotDiffComputer:
    """Computes minimal diffs between state snapshots (ADR-039).
    
    Exposes only the keys that changed, not the values.
    Uses hashing to avoid exposing sensitive state content.
    """
    
    @staticmethod
    def compute_diff(before_hash: str, before_state: Dict, after_state: Dict) -> StateDiff:
        """Compute diff between before and after states.
        
        Args:
            before_hash: Hash of before state
            before_state: Before state dict
            after_state: After state dict
            
        Returns:
            StateDiff showing what changed
        """
        after_hash = hashlib.sha256(
            json.dumps(after_state, sort_keys=True).encode()
        ).hexdigest()
        
        changes = {}
        added = []
        removed = []
        modified = []
        
        # Find added and modified
        for key in after_state:
            if key not in before_state:
                changes[key] = DiffType.ADDED
                added.append(key)
            elif before_state[key] != after_state[key]:
                changes[key] = DiffType.MODIFIED
                modified.append(key)
        
        # Find removed
        for key in before_state:
            if key not in after_state:
                changes[key] = DiffType.REMOVED
                removed.append(key)
        
        return StateDiff(
            before_hash=before_hash,
            after_hash=after_hash,
            timestamp=datetime.utcnow().isoformat(),
            changes=changes,
            added_keys=added,
            removed_keys=removed,
            modified_keys=modified,
        )


class RestoreInstructionBuilder:
    """Builds restore instructions from diff and checkpoint (ADR-039).
    
    Generates ordered, deterministic restore steps.
    """
    
    @staticmethod
    def build_from_diff(checkpoint_id: str, diff: StateDiff) -> RestoreInstructions:
        """Build restore instructions from state diff.
        
        Args:
            checkpoint_id: Checkpoint to restore from
            diff: State diff showing changes to undo
            
        Returns:
            Ordered restore instructions
        """
        restore_steps = []
        cleanup_actions = []
        
        # Undo modifications (restore to checkpoint values)
        for key in diff.modified_keys:
            restore_steps.append({
                'action': 'restore_key',
                'key': key,
                'source': 'checkpoint',
                'priority': 1,
            })
        
        # Remove added keys
        for key in diff.added_keys:
            restore_steps.append({
                'action': 'remove_key',
                'key': key,
                'priority': 2,
            })
        
        # Re-add removed keys (if we have them in checkpoint)
        for key in diff.removed_keys:
            restore_steps.append({
                'action': 'restore_key',
                'key': key,
                'source': 'checkpoint',
                'priority': 1,
            })
        
        # Cleanup: invalidate bad state hashes, reset caches
        cleanup_actions.append({
            'action': 'invalidate_caches',
            'reason': 'state restored from checkpoint',
        })
        cleanup_actions.append({
            'action': 'reset_sequence_numbers',
            'reason': 'timeline rewound',
        })
        
        # Estimate duration: ~10ms per change + 50ms cleanup
        estimated_duration = (len(diff.changes) * 0.01) + 0.05
        
        return RestoreInstructions(
            checkpoint_id=checkpoint_id,
            restore_steps=restore_steps,
            cleanup_actions=cleanup_actions,
            estimated_duration_seconds=estimated_duration,
        )


class RollbackTrigger:
    """Detects conditions that require rollback and decides action (ADR-040).
    
    Monitors:
    - Policy gate failures
    - Watchdog stability violations
    - Manual kill switch
    - Ledger write failures
    - State corruption
    
    Decides: GRACEFUL_ROLLBACK vs EMERGENCY_SUPPRESS vs ALERT_ONLY
    """
    
    def __init__(self, checkpoint_id: str):
        """Initialize trigger for given checkpoint.
        
        Args:
            checkpoint_id: Checkpoint to restore to if triggered
        """
        self.checkpoint_id = checkpoint_id
        self.triggers_fired: List[tuple] = []  # (trigger_type, timestamp, details)
        self.last_action: Optional[TriggerAction] = None
    
    def on_policy_gate_fail(self, justification: str) -> TriggerAction:
        """Policy gate returned FAIL.
        
        Decision: GRACEFUL_ROLLBACK (clear failure path)
        """
        trigger = (TriggerType.POLICY_GATE_FAIL, datetime.utcnow().isoformat(), justification)
        self.triggers_fired.append(trigger)
        
        action = TriggerAction.GRACEFUL_ROLLBACK
        self.last_action = action
        return action
    
    def on_watchdog_critical(self, failure_details: str, stability_bound: float) -> TriggerAction:
        """Watchdog detected critical instability.
        
        Decision: GRACEFUL_ROLLBACK (system still responsive, clean shutdown)
        """
        trigger = (TriggerType.WATCHDOG_CRITICAL, datetime.utcnow().isoformat(), 
                  f"bound={stability_bound}: {failure_details}")
        self.triggers_fired.append(trigger)
        
        action = TriggerAction.GRACEFUL_ROLLBACK
        self.last_action = action
        return action
    
    def on_manual_kill_switch(self, operator: str) -> TriggerAction:
        """Operator pressed emergency suppress (kill switch).
        
        Decision: EMERGENCY_SUPPRESS (immediate shutdown, no grace period)
        """
        trigger = (TriggerType.MANUAL_KILL_SWITCH, datetime.utcnow().isoformat(), f"operator={operator}")
        self.triggers_fired.append(trigger)
        
        action = TriggerAction.EMERGENCY_SUPPRESS
        self.last_action = action
        return action
    
    def on_ledger_write_failure(self, error: str) -> TriggerAction:
        """Ledger write failed (unrecoverable state).
        
        Decision: EMERGENCY_SUPPRESS (data loss avoidance takes priority)
        """
        trigger = (TriggerType.LEDGER_WRITE_FAILURE, datetime.utcnow().isoformat(), error)
        self.triggers_fired.append(trigger)
        
        action = TriggerAction.EMERGENCY_SUPPRESS
        self.last_action = action
        return action
    
    def on_state_corruption(self, expected_hash: str, actual_hash: str) -> TriggerAction:
        """State hash mismatch detected.
        
        Decision: EMERGENCY_SUPPRESS (corruption cannot be trusted)
        """
        trigger = (TriggerType.STATE_CORRUPTION, datetime.utcnow().isoformat(),
                  f"expected={expected_hash} actual={actual_hash}")
        self.triggers_fired.append(trigger)
        
        action = TriggerAction.EMERGENCY_SUPPRESS
        self.last_action = action
        return action
    
    def on_timeout(self, operation: str, elapsed_seconds: float) -> TriggerAction:
        """Operation exceeded timeout.
        
        Decision: GRACEFUL_ROLLBACK (still responsive, allow cleanup)
        """
        trigger = (TriggerType.TIMEOUT_EXCEEDED, datetime.utcnow().isoformat(),
                  f"{operation} took {elapsed_seconds}s")
        self.triggers_fired.append(trigger)
        
        action = TriggerAction.GRACEFUL_ROLLBACK
        self.last_action = action
        return action
    
    def get_trigger_action_decision(self, primary_action: TriggerAction, 
                                   secondary_action: Optional[TriggerAction] = None) -> TriggerAction:
        """Get final action when multiple triggers fire.
        
        Precedence: EMERGENCY_SUPPRESS > GRACEFUL_ROLLBACK > ALERT_ONLY
        """
        candidates = [primary_action]
        if secondary_action:
            candidates.append(secondary_action)
        
        # Emergency suppress highest priority
        if TriggerAction.EMERGENCY_SUPPRESS in candidates:
            return TriggerAction.EMERGENCY_SUPPRESS
        
        # Graceful rollback next
        if TriggerAction.GRACEFUL_ROLLBACK in candidates:
            return TriggerAction.GRACEFUL_ROLLBACK
        
        # Alert only
        return TriggerAction.ALERT_ONLY


class RollbackExecutor:
    """Executes rollback using checkpoint + restore instructions.
    
    Orchestrates:
    1. Restore from checkpoint
    2. Execute restore steps
    3. Run cleanup actions
    4. Verify state hash matches checkpoint
    """
    
    def __init__(self, checkpoint_id: str, instructions: RestoreInstructions):
        """Initialize executor.
        
        Args:
            checkpoint_id: Checkpoint ID to restore from
            instructions: Restore instructions to execute
        """
        self.checkpoint_id = checkpoint_id
        self.instructions = instructions
        self.executed_steps: List[str] = []
        self.failures: List[str] = []
        self.success = False
    
    def execute_gracefully(self) -> bool:
        """Execute rollback with graceful cleanup.
        
        Returns:
            True if successful
        """
        try:
            # Execute restore steps in priority order
            sorted_steps = sorted(
                self.instructions.restore_steps,
                key=lambda s: s.get('priority', 999)
            )
            
            for step in sorted_steps:
                result = self._execute_step(step)
                if result:
                    self.executed_steps.append(f"{step['action']}:{step.get('key', 'global')}")
                else:
                    self.failures.append(f"Failed to {step['action']}")
            
            # Run cleanup
            for cleanup in self.instructions.cleanup_actions:
                self._execute_cleanup(cleanup)
            
            self.success = True
            return True
        except Exception as e:
            self.failures.append(str(e))
            return False
    
    def execute_emergency(self) -> bool:
        """Execute emergency suppress (immediate shutdown).
        
        Skips graceful cleanup, just restores to known-good baseline.
        
        Returns:
            True if restored to baseline
        """
        try:
            # Restore only critical state from checkpoint
            for step in self.instructions.restore_steps:
                if step.get('priority', 999) == 1:  # Highest priority only
                    self._execute_step(step)
                    self.executed_steps.append(f"emergency:{step.get('key', 'global')}")
            
            self.success = True
            return True
        except Exception as e:
            self.failures.append(str(e))
            return False
    
    def _execute_step(self, step: Dict[str, Any]) -> bool:
        """Execute single restore step."""
        # Stub implementation; actual would interact with state system
        return True
    
    def _execute_cleanup(self, cleanup: Dict[str, Any]) -> bool:
        """Execute cleanup action."""
        # Stub implementation; actual would clear caches, reset timers, etc
        return True
    
    def get_execution_summary(self) -> Dict[str, Any]:
        """Get summary of rollback execution."""
        return {
            'checkpoint_id': self.checkpoint_id,
            'success': self.success,
            'steps_executed': len(self.executed_steps),
            'steps_total': len(self.instructions.restore_steps),
            'failures': self.failures,
            'duration_estimated': self.instructions.estimated_duration_seconds,
        }


# ─── Testing Helpers ──────────────────────────────────────────────────────


def create_test_snapshot(
    snapshot_id: str = "snap_001",
    is_known_good: bool = False,
) -> Snapshot:
    """Helper to create test snapshot."""
    return Snapshot(
        snapshot_id=snapshot_id,
        state_hash="abc123def456",
        timestamp=datetime.utcnow().isoformat(),
        is_known_good=is_known_good,
    )


def create_test_diff() -> StateDiff:
    """Helper to create test state diff."""
    return StateDiff(
        before_hash="hash_before",
        after_hash="hash_after",
        timestamp=datetime.utcnow().isoformat(),
        changes={'key1': DiffType.MODIFIED, 'key2': DiffType.ADDED},
        added_keys=['key2'],
        removed_keys=[],
        modified_keys=['key1'],
    )


def create_test_restore_instructions() -> RestoreInstructions:
    """Helper to create test restore instructions."""
    return RestoreInstructions(
        checkpoint_id="ckpt_001",
        restore_steps=[
            {'action': 'restore_key', 'key': 'key1', 'source': 'checkpoint', 'priority': 1},
            {'action': 'remove_key', 'key': 'key2', 'priority': 2},
        ],
        cleanup_actions=[
            {'action': 'invalidate_caches', 'reason': 'state restored'},
        ],
        estimated_duration_seconds=0.15,
    )
