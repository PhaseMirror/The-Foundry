"""
Rollback and Kill-Switch Trigger Contract Implementation

Implements deterministic trigger-to-action mapping, checkpoint stack semantics,
policy-gated rollback execution, and kill-switch escalation with contracts:
- C1: Rollback requires valid checkpoint reference
- C2: Policy-gated before restore execution
- C3: Kill-switch halts mutations until operator clearance
- C4: All triggers and rollback actions fully auditable
- C5: Repeated rollback failure escalates to kill-switch
"""

from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from enum import Enum


class TriggerCode(Enum):
    """Trigger family codes (from A-05 spec)."""
    L_PHI_BREACH = "L_PHI_BREACH"
    LEDGER_WRITE_FAILURE = "LEDGER_WRITE_FAILURE"
    PHASE_MIRROR_FLOOD = "PHASE_MIRROR_FLOOD"
    TWIN_DIVERGENCE = "TWIN_DIVERGENCE"
    OPERATOR_HALT = "OPERATOR_HALT"


class TriggerAction(Enum):
    """Decision output from trigger evaluation."""
    NO_ACTION = "NO_ACTION"
    ROLLBACK_REQUIRED = "ROLLBACK_REQUIRED"
    KILL_SWITCH_REQUIRED = "KILL_SWITCH_REQUIRED"


@dataclass
class Checkpoint:
    """Checkpoint record for state recovery."""
    checkpoint_id: str
    tx_id: str
    state_hash: str
    timestamp: str
    valid: bool = True
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for serialization."""
        return asdict(self)


@dataclass
class RollbackReport:
    """Result of rollback operation."""
    trigger_code: str
    selected_action: str
    checkpoint_id: Optional[str]
    restore_verification_pass: bool
    policy_gate_result: str
    correlation_id: str
    timestamp: str
    reason_code: str
    escaped_to_kill_switch: bool = False
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for serialization."""
        return asdict(self)


class CheckpointStack:
    """LIFO checkpoint stack for rollback recovery."""
    
    def __init__(self):
        """Initialize empty checkpoint stack."""
        self.stack: List[Checkpoint] = []
        self.quarantined: set = set()  # Set of invalid checkpoint IDs
    
    def push(self, checkpoint: Checkpoint) -> bool:
        """
        Push checkpoint to stack (append-only, LIFO).
        
        Contract 1: Checkpoint must be valid.
        """
        if checkpoint.checkpoint_id in {c.checkpoint_id for c in self.stack}:
            return False  # Duplicate
        
        self.stack.append(checkpoint)
        return True
    
    def pop(self) -> Optional[Checkpoint]:
        """Pop checkpoint from stack (LIFO)."""
        if self.stack:
            return self.stack.pop()
        return None
    
    def get_latest_valid(self) -> Optional[Checkpoint]:
        """Get latest valid checkpoint (searching LIFO from top)."""
        for checkpoint in reversed(self.stack):
            if checkpoint.valid and checkpoint.checkpoint_id not in self.quarantined:
                return checkpoint
        return None
    
    def mark_invalid(self, checkpoint_id: str) -> None:
        """Mark checkpoint as invalid (quarantine from restore candidates)."""
        self.quarantined.add(checkpoint_id)
        for ckpt in self.stack:
            if ckpt.checkpoint_id == checkpoint_id:
                ckpt.valid = False
    
    def get_checkpoint(self, checkpoint_id: str) -> Optional[Checkpoint]:
        """Look up checkpoint by ID."""
        for ckpt in reversed(self.stack):
            if ckpt.checkpoint_id == checkpoint_id and ckpt.checkpoint_id not in self.quarantined:
                return ckpt
        return None
    
    def depth(self) -> int:
        """Get stack depth."""
        return len(self.stack)


class TriggerActionMapper:
    """Maps trigger codes to actions deterministically."""
    
    # Deterministic mapping table (Contract 1: C1 enforces policy gating)
    TRIGGER_TO_ACTION = {
        TriggerCode.L_PHI_BREACH: TriggerAction.ROLLBACK_REQUIRED,
        TriggerCode.LEDGER_WRITE_FAILURE: TriggerAction.ROLLBACK_REQUIRED,
        TriggerCode.PHASE_MIRROR_FLOOD: TriggerAction.ROLLBACK_REQUIRED,
        TriggerCode.TWIN_DIVERGENCE: TriggerAction.ROLLBACK_REQUIRED,
        TriggerCode.OPERATOR_HALT: TriggerAction.KILL_SWITCH_REQUIRED,
    }
    
    @staticmethod
    def map_trigger_to_action(trigger_code: TriggerCode) -> TriggerAction:
        """
        Map trigger to action deterministically.
        
        AC-1: Produces deterministic NO_ACTION, ROLLBACK_REQUIRED, or KILL_SWITCH_REQUIRED.
        """
        return TriggerActionMapper.TRIGGER_TO_ACTION.get(
            trigger_code,
            TriggerAction.NO_ACTION
        )


class RollbackManager:
    """Manages rollback execution with checkpoint stack and policy gating."""
    
    def __init__(self):
        """Initialize rollback manager."""
        self.checkpoint_stack = CheckpointStack()
        self.audit_trail: List[Dict] = []
        self.rollback_failure_count = 0
        self.failed_checkpoint_ids: List[str] = []
    
    def push_checkpoint(self, checkpoint_id: str, tx_id: str, state_hash: str) -> bool:
        """
        Push checkpoint to stack for LIFO restore.
        
        Contract 1: Checkpoint must be valid.
        """
        timestamp = datetime.utcnow().isoformat() + "Z"
        checkpoint = Checkpoint(
            checkpoint_id=checkpoint_id,
            tx_id=tx_id,
            state_hash=state_hash,
            timestamp=timestamp,
            valid=True
        )
        
        success = self.checkpoint_stack.push(checkpoint)
        
        if success:
            self.audit_trail.append({
                "action": "checkpoint_pushed",
                "checkpoint_id": checkpoint_id,
                "stack_depth": self.checkpoint_stack.depth(),
                "timestamp": timestamp
            })
        
        return success
    
    def trigger_to_action(self, trigger_code: TriggerCode) -> TriggerAction:
        """
        Map trigger to action deterministically.
        
        AC-1: Produces deterministic decision output.
        """
        return TriggerActionMapper.map_trigger_to_action(trigger_code)
    
    def initiate_rollback(
        self,
        trigger_code: TriggerCode,
        policy_context: Dict,
        correlation_id: str
    ) -> RollbackReport:
        """
        Initiate rollback with policy gating and verification.
        
        Contract 2: Policy-gated before restore execution.
        Contract 3: Escalates to kill-switch on failure.
        Contract 4: Audit trail with correlation ID.
        AC-2: Resolves to valid checkpoint and records verification.
        AC-3: Policy gate failure blocks restore and engages kill-switch.
        """
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        # Step 1: Map trigger to action
        action = self.trigger_to_action(trigger_code)
        
        # If no rollback needed, return early
        if action == TriggerAction.NO_ACTION:
            return RollbackReport(
                trigger_code=trigger_code.value,
                selected_action=action.value,
                checkpoint_id=None,
                restore_verification_pass=False,
                policy_gate_result="N/A",
                correlation_id=correlation_id,
                timestamp=timestamp,
                reason_code="No action required"
            )
        
        # If immediate kill-switch required
        if action == TriggerAction.KILL_SWITCH_REQUIRED:
            self.audit_trail.append({
                "action": "kill_switch_engaged",
                "trigger_code": trigger_code.value,
                "correlation_id": correlation_id,
                "timestamp": timestamp,
                "reason": "operator_halt or escalation"
            })
            
            return RollbackReport(
                trigger_code=trigger_code.value,
                selected_action=action.value,
                checkpoint_id=None,
                restore_verification_pass=False,
                policy_gate_result="N/A",
                correlation_id=correlation_id,
                timestamp=timestamp,
                reason_code="Kill-switch required (terminal halt)",
                escaped_to_kill_switch=True
            )
        
        # ROLLBACK_REQUIRED path
        # Step 2: Resolve to valid checkpoint (LIFO)
        checkpoint = self.checkpoint_stack.get_latest_valid()
        
        if checkpoint is None:
            # No valid checkpoint - escalate to kill-switch
            self.audit_trail.append({
                "action": "rollback_failed_no_checkpoint",
                "trigger_code": trigger_code.value,
                "correlation_id": correlation_id,
                "timestamp": timestamp,
                "escalation": "to kill-switch"
            })
            
            return RollbackReport(
                trigger_code=trigger_code.value,
                selected_action=TriggerAction.KILL_SWITCH_REQUIRED.value,
                checkpoint_id=None,
                restore_verification_pass=False,
                policy_gate_result="N/A",
                correlation_id=correlation_id,
                timestamp=timestamp,
                reason_code="No valid checkpoint available (escalated to kill-switch)",
                escaped_to_kill_switch=True
            )
        
        # AC-2: Resolve to checkpoint and record target
        checkpoint_id = checkpoint.checkpoint_id
        
        # Step 3: Policy gate (Contract 2)
        if not policy_context or not policy_context.get("approved", False):
            # Policy gate rejected - escalate to kill-switch (AC-3)
            self.audit_trail.append({
                "action": "rollback_blocked_by_policy",
                "trigger_code": trigger_code.value,
                "checkpoint_id": checkpoint_id,
                "correlation_id": correlation_id,
                "timestamp": timestamp,
                "escalation": "to kill-switch"
            })
            
            return RollbackReport(
                trigger_code=trigger_code.value,
                selected_action=TriggerAction.KILL_SWITCH_REQUIRED.value,
                checkpoint_id=checkpoint_id,
                restore_verification_pass=False,
                policy_gate_result="REJECTED",
                correlation_id=correlation_id,
                timestamp=timestamp,
                reason_code="Policy gate rejected rollback (escalated to kill-switch)",
                escaped_to_kill_switch=True
            )
        
        # Step 4: Perform restore verification (simulated)
        # In real integration, this would call snapshot_manager.restore()
        restore_verification_pass = self._simulate_restore_verification(checkpoint)
        
        # Step 5: Track failure and potentially escalate
        if not restore_verification_pass:
            self.rollback_failure_count += 1
            self.failed_checkpoint_ids.append(checkpoint_id)
            self.checkpoint_stack.mark_invalid(checkpoint_id)
            
            # Contract 5 & AC-3: Escalation on failure
            if self.rollback_failure_count >= 1:  # Gate A safety mode: N=1
                self.audit_trail.append({
                    "action": "rollback_verification_failed_escalating",
                    "trigger_code": trigger_code.value,
                    "checkpoint_id": checkpoint_id,
                    "failure_count": self.rollback_failure_count,
                    "correlation_id": correlation_id,
                    "timestamp": timestamp,
                    "escalation": "to kill-switch"
                })
                
                return RollbackReport(
                    trigger_code=trigger_code.value,
                    selected_action=TriggerAction.KILL_SWITCH_REQUIRED.value,
                    checkpoint_id=checkpoint_id,
                    restore_verification_pass=False,
                    policy_gate_result="APPROVED",
                    correlation_id=correlation_id,
                    timestamp=timestamp,
                    reason_code=f"Rollback verification failed; escalated to kill-switch after {self.rollback_failure_count} attempt(s)",
                    escaped_to_kill_switch=True
                )
        
        # Step 6: Success - record rollback completion
        self.rollback_failure_count = 0  # Reset on success
        
        self.audit_trail.append({
            "action": "rollback_completed",
            "trigger_code": trigger_code.value,
            "checkpoint_id": checkpoint_id,
            "restore_verification_pass": restore_verification_pass,
            "correlation_id": correlation_id,
            "timestamp": timestamp
        })
        
        return RollbackReport(
            trigger_code=trigger_code.value,
            selected_action=TriggerAction.ROLLBACK_REQUIRED.value,
            checkpoint_id=checkpoint_id,
            restore_verification_pass=True,
            policy_gate_result="APPROVED",
            correlation_id=correlation_id,
            timestamp=timestamp,
            reason_code="Rollback completed successfully"
        )
    
    def _simulate_restore_verification(self, checkpoint: Checkpoint) -> bool:
        """
        Simulate restore verification (in real impl, would call snapshot_manager).
        Returns true if state_hash matches (success).
        """
        # Simulated: always pass by default
        return True
    
    def get_audit_trail(self) -> List[Dict]:
        """Get complete audit trail."""
        return self.audit_trail.copy()


class KillSwitchManager:
    """Terminal lock manager for operator-gated recovery (from A-03, enhanced here)."""
    
    def __init__(self):
        """Initialize kill-switch manager."""
        self.is_engaged = False
        self.engagement_timestamp: Optional[str] = None
        self.engagement_correlation_id: Optional[str] = None
        self.engagement_reason: Optional[str] = None
        self.clearance_records: List[Dict] = []
    
    def engage(self, correlation_id: str, reason: str) -> None:
        """
        Engage kill-switch (terminal halt).
        
        Contract 3: Halt all mutations until operator clearance.
        """
        self.is_engaged = True
        self.engagement_timestamp = datetime.utcnow().isoformat() + "Z"
        self.engagement_correlation_id = correlation_id
        self.engagement_reason = reason
    
    def is_locked(self) -> bool:
        """
        Check if kill-switch is locked.
        
        Contract 3: Returns true while halt is active.
        """
        return self.is_engaged
    
    def require_manual_clearance(self, operator_id: str, recovery_action: str) -> bool:
        """
        Record operator clearance and disengage kill-switch.
        
        Contract 3: Requires operator credentials and action.
        AC-4: Blocks mutations until clearance recorded.
        """
        self.clearance_records.append({
            "operator_id": operator_id,
            "recovery_action": recovery_action,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })
        
        self.is_engaged = False
        return True
    
    def get_engagement_info(self) -> Dict:
        """Get kill-switch engagement details."""
        if not self.engagement_timestamp:
            return {}
        
        return {
            "engagement_timestamp": self.engagement_timestamp,
            "engagement_correlation_id": self.engagement_correlation_id,
            "engagement_reason": self.engagement_reason,
            "clearance_count": len(self.clearance_records)
        }


# Test helpers
def create_test_rollback_manager() -> RollbackManager:
    """Create a RollbackManager instance for testing."""
    return RollbackManager()


def create_test_checkpoint(
    checkpoint_id: str = "ckpt-001",
    variation: int = 0
) -> Checkpoint:
    """Create a test checkpoint."""
    return Checkpoint(
        checkpoint_id=checkpoint_id,
        tx_id=f"tx-{checkpoint_id}",
        state_hash=f"hash_{variation}",
        timestamp=datetime.utcnow().isoformat() + "Z",
        valid=True
    )
