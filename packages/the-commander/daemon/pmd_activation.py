"""
ADR-036: PMD Activation Architecture & Wiring Contract

Per ADR-036, enforces single ordered path for all self-modifications:
IDLE → PROPOSED → SIMULATED → CERTIFIED → GATED → CHECKPOINTED → COMMITTED → SYNCED → RECORDED → VERIFIED

Key invariants:
1. All self-updates must follow this exact ordering
2. Policy gate is upstream of ALL writes
3. Rollback checkpoint must exist before commit
4. Watchdog monitors post-commit stability
5. Failed policy gates route to quarantine (never to commit)
6. Out-of-order transitions are rejected

Integration points:
- ADR-028: Validation gates & kill switch
- ADR-030: Typed phase mirror policy
- ADR-032: Enforcement state machine
- ADR-033: Precedent contamination blocking
- ADR-034: Event sequence recording
- ADR-031: Watchdog fast paths
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum, auto
from typing import Optional, Dict, Any, List, Callable
import hashlib


class PMDActivationState(Enum):
    """10-state ordered protocol for self-modification lifecycle."""
    IDLE = auto()           # 0: Waiting for update trigger
    PROPOSED = auto()       # 1: Update proposal received
    SIMULATED = auto()      # 2: Simulation executed in sandbox
    CERTIFIED = auto()      # 3: Proof of safety generated
    GATED = auto()          # 4: Passed phase_mirror policy gate
    CHECKPOINTED = auto()   # 5: Rollback checkpoint created
    COMMITTED = auto()      # 6: Written to live state
    SYNCED = auto()         # 7: Digital twin synchronized
    RECORDED = auto()       # 8: Ledger entry written
    VERIFIED = auto()       # 9: Watchdog verification complete (terminal)


class PMDPolicyDecision(Enum):
    """Policy gate outcomes."""
    PASS = auto()           # Allowed to proceed
    FAIL = auto()           # Blocked; route to quarantine
    REVIEW = auto()         # Requires manual inspection
    SUPPRESS = auto()        # Emergency override (kill switch)


class PMDWatchdogStatus(Enum):
    """Post-commit watchdog outcomes."""
    HEALTHY = auto()        # System stable after commit
    DEGRADED = auto()       # Non-critical issues detected
    CRITICAL = auto()       # Stability bound violated; trigger rollback
    INCONCLUSIVE = auto()   # Unable to determine


@dataclass(frozen=True)
class PMDCheckpoint:
    """Immutable rollback checkpoint created before commit.
    
    Captures:
    - State snapshot before commit
    - Timestamp when created
    - Hash of state for verification
    - Rollback instructions
    """
    
    checkpoint_id: str
    state_before: Dict[str, Any]  # State snapshot
    timestamp: str  # ISO 8601
    state_hash: str  # SHA256 of state
    rollback_instructions: Optional[str] = None
    
    def __post_init__(self):
        if not self.checkpoint_id or len(self.checkpoint_id.strip()) == 0:
            raise ValueError("checkpoint_id required")
        
        try:
            datetime.fromisoformat(self.timestamp)
        except ValueError:
            raise ValueError("timestamp must be valid ISO 8601")
    
    def get_checkpoint_hash(self) -> str:
        """Get deterministic hash of checkpoint."""
        content = f"{self.checkpoint_id}:{self.timestamp}:{self.state_hash}"
        return hashlib.sha256(content.encode()).hexdigest()


@dataclass(frozen=True)
class PMDPolicyGateResult:
    """Decision from phase_mirror policy gate."""
    
    decision: PMDPolicyDecision
    timestamp: str  # ISO 8601
    gate_id: str  # Which gate made decision
    justification: str
    evidence_hash: Optional[str] = None  # Proof hash
    
    def __post_init__(self):
        if not self.gate_id or len(self.gate_id.strip()) == 0:
            raise ValueError("gate_id required")
        
        try:
            datetime.fromisoformat(self.timestamp)
        except ValueError:
            raise ValueError("timestamp must be valid ISO 8601")


@dataclass(frozen=True)
class PMDWatchdogResult:
    """Post-commit verification from watchdog."""
    
    status: PMDWatchdogStatus
    timestamp: str  # ISO 8601
    stability_bound: float  # Health metric (0.0 to 1.0)
    stability_threshold: float  # Minimum acceptable bound
    checks_passed: int
    checks_total: int
    failure_details: Optional[str] = None
    
    def __post_init__(self):
        if not (0.0 <= self.stability_bound <= 1.0):
            raise ValueError("stability_bound must be 0.0-1.0")
        
        if not (0.0 <= self.stability_threshold <= 1.0):
            raise ValueError("stability_threshold must be 0.0-1.0")
        
        try:
            datetime.fromisoformat(self.timestamp)
        except ValueError:
            raise ValueError("timestamp must be valid ISO 8601")
    
    def is_healthy(self) -> bool:
        """Check if post-commit health is acceptable."""
        return self.stability_bound >= self.stability_threshold


class PMDActivationStateMachine:
    """Enforces ordered 10-state self-modification protocol.
    
    Rejects any out-of-order transitions.
    Records all state changes as immutable audit trail.
    Integrates with:
    - Phase_mirror policy gate (at GATED state)
    - Enforcement state (delegates legitimacy checks)
    - Watchdog verification (at VERIFIED state)
    """
    
    # Define valid sequential transitions
    VALID_TRANSITIONS: Dict[PMDActivationState, List[PMDActivationState]] = {
        PMDActivationState.IDLE: [PMDActivationState.PROPOSED],
        PMDActivationState.PROPOSED: [PMDActivationState.SIMULATED],
        PMDActivationState.SIMULATED: [PMDActivationState.CERTIFIED],
        PMDActivationState.CERTIFIED: [PMDActivationState.GATED],
        PMDActivationState.GATED: [
            PMDActivationState.CHECKPOINTED,  # Success path
            # Failure path: GATED→QUARANTINE (handled separately)
        ],
        PMDActivationState.CHECKPOINTED: [PMDActivationState.COMMITTED],
        PMDActivationState.COMMITTED: [PMDActivationState.SYNCED],
        PMDActivationState.SYNCED: [PMDActivationState.RECORDED],
        PMDActivationState.RECORDED: [PMDActivationState.VERIFIED],
        PMDActivationState.VERIFIED: [],  # Terminal state
    }
    
    def __init__(self):
        """Initialize state machine in IDLE."""
        self.current_state = PMDActivationState.IDLE
        self.state_history: List[tuple] = [(self.current_state, datetime.utcnow())]
        self.checkpoint: Optional[PMDCheckpoint] = None
        self.policy_result: Optional[PMDPolicyGateResult] = None
        self.watchdog_result: Optional[PMDWatchdogResult] = None
        self.failed = False
        self.failure_reason: Optional[str] = None
        self.quarantined = False
    
    def can_transition_to(self, target_state: PMDActivationState) -> bool:
        """Check if transition from current to target is valid."""
        if self.failed or self.quarantined:
            return False
        
        if self.current_state not in self.VALID_TRANSITIONS:
            return False
        
        valid_targets = self.VALID_TRANSITIONS[self.current_state]
        return target_state in valid_targets
    
    def transition_to(self, target_state: PMDActivationState) -> bool:
        """Attempt transition to target state.
        
        Returns:
            True if transition succeeded
            
        Raises:
            ValueError: If transition is invalid
        """
        if not self.can_transition_to(target_state):
            raise ValueError(
                f"Invalid transition from {self.current_state.name} to {target_state.name}"
            )
        
        self.current_state = target_state
        self.state_history.append((target_state, datetime.utcnow()))
        return True
    
    def set_checkpoint(self, checkpoint: PMDCheckpoint) -> bool:
        """Set rollback checkpoint before COMMITTED transition.
        
        Args:
            checkpoint: Checkpoint created from previous state
            
        Returns:
            True if checkpoint was set
            
        Raises:
            ValueError: If checkpoint set at wrong state
        """
        if self.current_state != PMDActivationState.CHECKPOINTED:
            raise ValueError(
                f"Checkpoint can only be set at CHECKPOINTED state, not {self.current_state.name}"
            )
        
        self.checkpoint = checkpoint
        return True
    
    def apply_policy_gate(self, result: PMDPolicyGateResult) -> bool:
        """Apply policy gate decision at GATED state.
        
        Args:
            result: Decision from phase_mirror policy gate
            
        Returns:
            True if PASS (proceed), False otherwise
            
        Raises:
            ValueError: If applied at wrong state
        """
        if self.current_state != PMDActivationState.GATED:
            raise ValueError(
                f"Policy gate applies only at GATED state, not {self.current_state.name}"
            )
        
        self.policy_result = result
        
        match result.decision:
            case PMDPolicyDecision.PASS:
                return True  # Proceed to CHECKPOINTED
            case PMDPolicyDecision.FAIL:
                self.quarantined = True
                self.failed = True  # Mark as failed AND quarantined
                self.failure_reason = f"Policy gate failed: {result.justification}"
                return False
            case PMDPolicyDecision.REVIEW:
                self.quarantined = True
                self.failed = True
                self.failure_reason = f"Policy gate requires review: {result.justification}"
                return False
            case PMDPolicyDecision.SUPPRESS:
                # Kill switch override (emergency path)
                self.quarantined = True
                self.failed = True
                self.failure_reason = "Emergency suppression via kill switch"
                return False
    
    def apply_watchdog_verification(self, result: PMDWatchdogResult) -> bool:
        """Apply watchdog health check at VERIFIED state.
        
        Args:
            result: Health status from watchdog
            
        Returns:
            True if HEALTHY, False if CRITICAL (trigger rollback)
            
        Raises:
            ValueError: If applied at wrong state
        """
        if self.current_state != PMDActivationState.VERIFIED:
            raise ValueError(
                f"Watchdog applies at VERIFIED state, not {self.current_state.name}"
            )
        
        self.watchdog_result = result
        
        match result.status:
            case PMDWatchdogStatus.HEALTHY:
                return True  # Success!
            case PMDWatchdogStatus.DEGRADED:
                return True  # Alert but continue (operator will decide)
            case PMDWatchdogStatus.CRITICAL:
                self.failed = True
                self.failure_reason = f"Watchdog critical: {result.failure_details}"
                return False  # Trigger rollback path
            case PMDWatchdogStatus.INCONCLUSIVE:
                return True  # Unable to determine, trust interim checks
    
    def get_current_state_name(self) -> str:
        """Get human-readable current state name."""
        return self.current_state.name
    
    def is_terminal(self) -> bool:
        """Check if current state is terminal."""
        return self.current_state == PMDActivationState.VERIFIED or self.failed


class PMDActivationContext:
    """Complete context for one self-modification cycle.
    
    Orchestrates:
    - State machine transitions
    - Policy gating
    - Checkpoint management
    - Event recording
    - Watchdog verification
    """
    
    def __init__(self, update_id: str):
        """Initialize activation context.
        
        Args:
            update_id: Unique identifier for this update
        """
        self.update_id = update_id
        self.state_machine = PMDActivationStateMachine()
        self.events: List[Dict[str, Any]] = []
        self.start_time = datetime.utcnow()
    
    def record_event(self, event_type: str, details: Optional[Dict] = None) -> None:
        """Record event in this update context."""
        self.events.append({
            'type': event_type,
            'timestamp': datetime.utcnow().isoformat(),
            'state': self.state_machine.get_current_state_name(),
            'details': details or {},
        })
    
    def move_to_proposed(self, proposal_data: Dict[str, Any]) -> bool:
        """Move to PROPOSED state with update proposal."""
        if not self.state_machine.transition_to(PMDActivationState.PROPOSED):
            return False
        
        self.record_event('proposed', {'proposal': proposal_data})
        return True
    
    def move_to_simulated(self, simulation_result: Dict[str, Any]) -> bool:
        """Move to SIMULATED state after sandbox run."""
        if not self.state_machine.transition_to(PMDActivationState.SIMULATED):
            return False
        
        self.record_event('simulated', {'result': simulation_result})
        return True
    
    def move_to_certified(self, proof_hash: str) -> bool:
        """Move to CERTIFIED state with safety proof."""
        if not self.state_machine.transition_to(PMDActivationState.CERTIFIED):
            return False
        
        self.record_event('certified', {'proof_hash': proof_hash})
        return True
    
    def move_to_gated(self) -> bool:
        """Move to GATED state (ready for policy decision)."""
        if not self.state_machine.transition_to(PMDActivationState.GATED):
            return False
        
        self.record_event('gated')
        return True
    
    def apply_policy_and_checkpoint(
        self,
        policy_result: PMDPolicyGateResult,
        checkpoint: PMDCheckpoint,
    ) -> bool:
        """Apply policy gate and create checkpoint.
        
        Returns:
            True if policy passed AND checkpoint created
        """
        # Apply policy decision
        if not self.state_machine.apply_policy_gate(policy_result):
            self.record_event('policy_failed', {
                'decision': policy_result.decision.name,
                'justification': policy_result.justification,
            })
            return False  # Quarantine path
        
        # Move to CHECKPOINTED
        if not self.state_machine.transition_to(PMDActivationState.CHECKPOINTED):
            return False
        
        # Set checkpoint
        if not self.state_machine.set_checkpoint(checkpoint):
            return False
        
        self.record_event('checkpointed', {
            'checkpoint_id': checkpoint.checkpoint_id,
            'checkpoint_hash': checkpoint.get_checkpoint_hash(),
        })
        return True
    
    def move_to_committed(self) -> bool:
        """Move to COMMITTED state (write to live state)."""
        if not self.state_machine.transition_to(PMDActivationState.COMMITTED):
            return False
        
        self.record_event('committed')
        return True
    
    def move_to_synced(self) -> bool:
        """Move to SYNCED state (digital twin synchronized)."""
        if not self.state_machine.transition_to(PMDActivationState.SYNCED):
            return False
        
        self.record_event('synced')
        return True
    
    def move_to_recorded(self, ledger_entry: str) -> bool:
        """Move to RECORDED state (ledger written)."""
        if not self.state_machine.transition_to(PMDActivationState.RECORDED):
            return False
        
        self.record_event('recorded', {'ledger_entry': ledger_entry})
        return True
    
    def move_to_verified(self, watchdog_result: PMDWatchdogResult) -> bool:
        """Move to VERIFIED state with watchdog verification."""
        if not self.state_machine.transition_to(PMDActivationState.VERIFIED):
            return False
        
        # Apply watchdog
        if not self.state_machine.apply_watchdog_verification(watchdog_result):
            self.record_event('watchdog_critical', {
                'status': watchdog_result.status.name,
                'failure_details': watchdog_result.failure_details,
            })
            return False  # Trigger rollback path
        
        self.record_event('verified', {
            'stability_bound': watchdog_result.stability_bound,
            'checks_passed': watchdog_result.checks_passed,
        })
        return True
    
    def get_audit_trail(self) -> List[Dict[str, Any]]:
        """Get immutable audit trail of this update cycle."""
        return self.events.copy()
    
    def get_summary(self) -> Dict[str, Any]:
        """Get summary of update cycle."""
        elapsed = (datetime.utcnow() - self.start_time).total_seconds()
        
        return {
            'update_id': self.update_id,
            'final_state': self.state_machine.get_current_state_name(),
            'success': not self.state_machine.failed,
            'quarantined': self.state_machine.quarantined,
            'failure_reason': self.state_machine.failure_reason,
            'checkpoint': self.state_machine.checkpoint is not None,
            'events_recorded': len(self.events),
            'elapsed_seconds': elapsed,
            'policy_passed': self.state_machine.policy_result is not None and 
                            self.state_machine.policy_result.decision == PMDPolicyDecision.PASS,
            'watchdog_healthy': self.state_machine.watchdog_result is not None and
                               self.state_machine.watchdog_result.is_healthy(),
        }


# ─── Testing Helpers ──────────────────────────────────────────────────────


def create_test_checkpoint(
    checkpoint_id: str = "ckpt_001",
    state_hash: str = "abc123",
) -> PMDCheckpoint:
    """Helper to create test checkpoint."""
    return PMDCheckpoint(
        checkpoint_id=checkpoint_id,
        state_before={"version": "1.0", "state": "clean"},
        timestamp=datetime.utcnow().isoformat(),
        state_hash=state_hash,
    )


def create_passing_policy_result(
    gate_id: str = "phase_mirror_gate",
) -> PMDPolicyGateResult:
    """Helper to create passing policy decision."""
    return PMDPolicyGateResult(
        decision=PMDPolicyDecision.PASS,
        timestamp=datetime.utcnow().isoformat(),
        gate_id=gate_id,
        justification="All checks passed",
        evidence_hash="proof_hash_abc123",
    )


def create_healthy_watchdog_result(
    stability_bound: float = 0.95,
) -> PMDWatchdogResult:
    """Helper to create healthy watchdog result."""
    return PMDWatchdogResult(
        status=PMDWatchdogStatus.HEALTHY,
        timestamp=datetime.utcnow().isoformat(),
        stability_bound=stability_bound,
        stability_threshold=0.8,
        checks_passed=20,
        checks_total=20,
    )
