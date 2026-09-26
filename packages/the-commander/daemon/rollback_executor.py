"""
Rollback and Kill-Switch Trigger Implementation

Implements deterministic rollback execution with checkpoint validation,
policy gating, and escalation to kill-switch on failure.

Contracts:
- C1: Rollback executes only from valid checkpoint reference
- C2: Every rollback attempt is policy-gated before restore
- C3: Kill-switch halts all mutations until operator clearance
- C4: All decisions and actions fully auditable with correlation IDs
- C5: Repeated rollback failure escalates deterministically to kill-switch
"""

from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from enum import Enum


class TriggerCode(Enum):
    """Trigger families."""
    L_PHI_BREACH = "L_PHI_BREACH"
    LEDGER_WRITE_FAILURE = "LEDGER_WRITE_FAILURE"
    PHASE_MIRROR_FLOOD = "PHASE_MIRROR_FLOOD"
    TWIN_DIVERGENCE = "TWIN_DIVERGENCE"
    OPERATOR_HALT = "OPERATOR_HALT"


class DecisionCode(Enum):
    """Rollback decision outcomes."""
    NO_ACTION = "NO_ACTION"
    ROLLBACK_REQUIRED = "ROLLBACK_REQUIRED"
    KILL_SWITCH_REQUIRED = "KILL_SWITCH_REQUIRED"


class RollbackResult(Enum):
    """Rollback execution result codes."""
    SUCCESS = "SUCCESS"
    CHECKPOINT_INVALID = "CHECKPOINT_INVALID"
    POLICY_REJECTED = "POLICY_REJECTED"
    RESTORE_FAILED = "RESTORE_FAILED"


@dataclass
class Checkpoint:
    """Represents a saved system checkpoint."""
    checkpoint_id: str
    state_hash: str
    timestamp: str
    created_at: str
    valid: bool = True
    quarantined: bool = False
    quarantine_reason: Optional[str] = None
    
    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return asdict(self)


@dataclass
class TriggerDecision:
    """Result of trigger evaluation."""
    trigger_code: str
    decision_code: str
    reason: str
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    correlation_id: str = ""
    
    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return asdict(self)


@dataclass
class RollbackActionRecord:
    """Record of rollback action execution."""
    trigger_code: str
    target_checkpoint_id: str
    result_code: str
    restored_state_hash: str
    verification_pass: bool
    escalated_to_kill_switch: bool
    correlation_id: str
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    
    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return asdict(self)


class CheckpointStack:
    """LIFO Checkpoint stack with validity tracking."""
    
    def __init__(self):
        """Initialize empty checkpoint stack."""
        self.stack: List[Checkpoint] = []
        self.quarantine_set: set = set()
    
    def push(self, checkpoint: Checkpoint) -> bool:
        """
        Push checkpoint to stack (push-only during mutations).
        
        Contract 1: Only valid checkpoints accepted.
        """
        if not checkpoint.valid:
            return False
        
        self.stack.append(checkpoint)
        return True
    
    def peek_latest_valid(self) -> Optional[Checkpoint]:
        """
        Get latest valid checkpoint without removing (LIFO).
        
        Returns None if no valid checkpoint found.
        """
        for i in range(len(self.stack) - 1, -1, -1):
            checkpoint = self.stack[i]
            if checkpoint.valid and not checkpoint.quarantined:
                return checkpoint
        
        return None
    
    def pop(self, checkpoint_id: str) -> bool:
        """Remove checkpoint after successful restore."""
        self.stack = [c for c in self.stack if c.checkpoint_id != checkpoint_id]
        return True
    
    def quarantine(self, checkpoint_id: str, reason: str) -> None:
        """Mark checkpoint as quarantined; exclude from restore candidates."""
        for checkpoint in self.stack:
            if checkpoint.checkpoint_id == checkpoint_id:
                checkpoint.quarantined = True
                checkpoint.quarantine_reason = reason
                self.quarantine_set.add(checkpoint_id)
    
    def get_stack(self) -> List[Checkpoint]:
        """Get current stack state."""
        return self.stack.copy()


class RollbackExecutor:
    """
    Executes rollback operations with policy gating and escalation.
    
    Integrates:
    - Checkpoint validation (C1)
    - Policy gate enforcement (C2)
    - Kill-switch escalation (C5)
    - Audit trail (C4)
    """
    
    def __init__(self):
        """Initialize rollback executor."""
        self.audit_trail: List[RollbackActionRecord] = []
        self.failure_count: int = 0
        self.failure_threshold: int = 1  # Gate A safety mode: first failure escalates
    
    def validate_checkpoint(self, checkpoint: Optional[Checkpoint]) -> Tuple[bool, str]:
        """
        Validate checkpoint validity.
        
        Contract 1: Rollback may execute only from valid checkpoint reference.
        """
        if checkpoint is None:
            return False, "No checkpoint available"
        
        if checkpoint.quarantined:
            return False, f"Checkpoint quarantined: {checkpoint.quarantine_reason}"
        
        if not checkpoint.valid:
            return False, "Checkpoint marked invalid"
        
        if not checkpoint.state_hash:
            return False, "Checkpoint missing state hash"
        
        return True, "Checkpoint valid"
    
    def execute(
        self,
        trigger_decision: TriggerDecision,
        policy_context: Optional[Dict],
        checkpoint_stack: CheckpointStack,
        snapshot_manager = None,
        kill_switch_manager = None
    ) -> Tuple[RollbackResult, Optional[str], bool]:
        """
        Execute rollback based on trigger decision.
        
        Returns: (result_code, target_checkpoint_id, escalated_to_kill_switch)
        
        Contract 1: Validate checkpoint before restore
        Contract 2: Gate through policy_context
        Contract 4: Audit all actions
        Contract 5: Escalate on failure
        """
        escalated = False
        
        # Step 1: Checkpoint selection
        target_checkpoint = checkpoint_stack.peek_latest_valid()
        is_valid, validation_msg = self.validate_checkpoint(target_checkpoint)
        
        if not is_valid:
            self.failure_count += 1
            
            # Escalate to kill-switch on N consecutive failures
            if self.failure_count >= self.failure_threshold and kill_switch_manager:
                kill_switch_manager.engage(
                    reason_code="ROLLBACK_CHECKPOINT_UNAVAILABLE",
                    source_trigger="REPEATED_FAILURE_ESCALATION",
                    correlation_id=trigger_decision.correlation_id
                )
                escalated = True
            
            # Audit failure
            self.audit_trail.append(RollbackActionRecord(
                trigger_code=trigger_decision.trigger_code,
                target_checkpoint_id="",
                result_code=RollbackResult.CHECKPOINT_INVALID.value,
                restored_state_hash="",
                verification_pass=False,
                escalated_to_kill_switch=escalated,
                correlation_id=trigger_decision.correlation_id
            ))
            
            return RollbackResult.CHECKPOINT_INVALID, None, escalated
        
        # Step 2: Policy gate check
        if not policy_context or not policy_context.get("approved", False):
            self.failure_count += 1
            
            # Escalate to kill-switch on policy rejection
            if kill_switch_manager:
                kill_switch_manager.engage(
                    reason_code="POLICY_GATE_REJECTED",
                    source_trigger="POLICY_REJECTION",
                    correlation_id=trigger_decision.correlation_id
                )
                escalated = True
            
            # Audit rejection
            self.audit_trail.append(RollbackActionRecord(
                trigger_code=trigger_decision.trigger_code,
                target_checkpoint_id=target_checkpoint.checkpoint_id,
                result_code=RollbackResult.POLICY_REJECTED.value,
                restored_state_hash="",
                verification_pass=False,
                escalated_to_kill_switch=escalated,
                correlation_id=trigger_decision.correlation_id
            ))
            
            return RollbackResult.POLICY_REJECTED, target_checkpoint.checkpoint_id, escalated
        
        # Step 3: Restore execution
        if snapshot_manager is None:
            # Simulate successful restore
            restored_hash = target_checkpoint.state_hash
            verification_pass = True
        else:
            # Real restore via snapshot manager
            restore_report = snapshot_manager.restore(
                target_checkpoint.checkpoint_id,
                policy_context
            )
            
            if not restore_report.verification_pass:
                self.failure_count += 1
                
                # Escalate to kill-switch on restore failure
                if kill_switch_manager:
                    kill_switch_manager.engage(
                        reason_code="RESTORE_VERIFICATION_FAILED",
                        source_trigger="RESTORE_FAILURE",
                        correlation_id=trigger_decision.correlation_id
                    )
                    escalated = True
                
                # Audit failure
                self.audit_trail.append(RollbackActionRecord(
                    trigger_code=trigger_decision.trigger_code,
                    target_checkpoint_id=target_checkpoint.checkpoint_id,
                    result_code=RollbackResult.RESTORE_FAILED.value,
                    restored_state_hash=restore_report.restored_state_hash,
                    verification_pass=False,
                    escalated_to_kill_switch=escalated,
                    correlation_id=trigger_decision.correlation_id
                ))
                
                return RollbackResult.RESTORE_FAILED, target_checkpoint.checkpoint_id, escalated
            
            restored_hash = restore_report.restored_state_hash
            verification_pass = restore_report.verification_pass
        
        # Step 4: Success - reset failure count
        self.failure_count = 0
        
        # Step 5: Pop checkpoint from stack
        checkpoint_stack.pop(target_checkpoint.checkpoint_id)
        
        # Step 6: Audit success
        self.audit_trail.append(RollbackActionRecord(
            trigger_code=trigger_decision.trigger_code,
            target_checkpoint_id=target_checkpoint.checkpoint_id,
            result_code=RollbackResult.SUCCESS.value,
            restored_state_hash=restored_hash,
            verification_pass=verification_pass,
            escalated_to_kill_switch=escalated,
            correlation_id=trigger_decision.correlation_id
        ))
        
        return RollbackResult.SUCCESS, target_checkpoint.checkpoint_id, escalated
    
    def poll_failure_count(self) -> int:
        """Get current consecutive rollback failure count."""
        return self.failure_count
    
    def get_audit_trail(self) -> List[RollbackActionRecord]:
        """Get audit trail of all rollback actions."""
        return self.audit_trail.copy()


class TriggerDecisionEngine:
    """Maps trigger codes to decision codes with escalation logic."""
    
    @staticmethod
    def evaluate_triggers(
        triggers_fired: Dict[str, bool],
        failure_count: int = 0,
        failure_threshold: int = 1
    ) -> TriggerDecision:
        """
        Evaluate triggers to determine decision outcome.
        
        AC-1: Produces deterministic NO_ACTION, ROLLBACK_REQUIRED, or KILL_SWITCH_REQUIRED.
        """
        # Check for operator halt (highest precedence, immediate kill-switch)
        if triggers_fired.get(TriggerCode.OPERATOR_HALT.value, False):
            return TriggerDecision(
                trigger_code=TriggerCode.OPERATOR_HALT.value,
                decision_code=DecisionCode.KILL_SWITCH_REQUIRED.value,
                reason="Operator halt signal received"
            )
        
        # Check for rollback triggers
        rollback_triggers = [
            TriggerCode.L_PHI_BREACH.value,
            TriggerCode.LEDGER_WRITE_FAILURE.value,
            TriggerCode.PHASE_MIRROR_FLOOD.value,
            TriggerCode.TWIN_DIVERGENCE.value
        ]
        
        for trigger in rollback_triggers:
            if triggers_fired.get(trigger, False):
                return TriggerDecision(
                    trigger_code=trigger,
                    decision_code=DecisionCode.ROLLBACK_REQUIRED.value,
                    reason=f"Trigger {trigger} fired"
                )
        
        # Check for failure escalation
        if failure_count >= failure_threshold:
            return TriggerDecision(
                trigger_code="REPEATED_FAILURE",
                decision_code=DecisionCode.KILL_SWITCH_REQUIRED.value,
                reason="Repeated rollback failure detected"
            )
        
        # No triggers fired
        return TriggerDecision(
            trigger_code="NONE",
            decision_code=DecisionCode.NO_ACTION.value,
            reason="All triggers inactive"
        )


# Test helpers
def create_test_checkpoint(checkpoint_id: str, variation: int = 0) -> Checkpoint:
    """Create a test checkpoint."""
    return Checkpoint(
        checkpoint_id=checkpoint_id,
        state_hash=f"hash_{checkpoint_id}_{variation}",
        timestamp=datetime.utcnow().isoformat() + "Z",
        created_at=datetime.utcnow().isoformat() + "Z",
        valid=True,
        quarantined=False
    )


def create_test_trigger_decision(
    trigger_code: str = "L_PHI_BREACH",
    decision_code: str = "ROLLBACK_REQUIRED"
) -> TriggerDecision:
    """Create a test trigger decision."""
    return TriggerDecision(
        trigger_code=trigger_code,
        decision_code=decision_code,
        reason=f"Test trigger: {trigger_code}",
        correlation_id="corr-test-001"
    )


def create_test_rollback_executor() -> RollbackExecutor:
    """Create a RollbackExecutor instance for testing."""
    return RollbackExecutor()


def create_test_checkpoint_stack() -> CheckpointStack:
    """Create a CheckpointStack instance for testing."""
    return CheckpointStack()
