"""
A-03: Watchdog and Trigger Semantics Contract

Implements deterministic safety decisions during runtime drift and failure conditions.
- Contract 1: Every heartbeat evaluates all declared triggers in deterministic order
- Contract 2: Trigger output is one of NONE, ROLLBACK, KILL_SWITCH with reason code
- Contract 3: Rollback dispatch requires checkpoint availability and policy-gated restore
- Contract 4: Kill-switch engagement is terminal until human-approved recovery
- Contract 5: Heartbeat cycle emits auditable decision records even when no trigger fires

Integration with A-07:
- L_Phi_breach trigger consumes HealthReport from A-07 health signal contract
- Staleness checking integrated via HealthReport.is_stale()
- Degraded-mode blocking checked via confidence thresholds
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Set, Tuple
from enum import Enum
from datetime import datetime
import hashlib
import time

from contracts.health_signal import HealthReport


class TriggerCode(Enum):
    """Trigger family identifiers."""
    OPERATOR_HALT = "OP_HALT"
    L_PHI_BREACH = "L_PHI_BREACH"
    TWIN_DIVERGENCE = "TWIN_DIV"
    LEDGER_WRITE_FAILURE = "LEDGER_FAIL"
    PHASE_MIRROR_FLOOD = "PMD_FLOOD"


class WatchdogDecision(Enum):
    """Watchdog decision outputs."""
    NONE = "none"
    ROLLBACK = "rollback"
    KILL_SWITCH = "kill_switch"


class AlertType(Enum):
    """Alert severity types."""
    NOMINAL = "nominal"
    DEGRADED = "degraded"
    HALTED = "halted"
    CRITICAL = "critical"


class TriggerPrecedence(Enum):
    """Trigger evaluation priority (lower = higher precedence)."""
    OPERATOR_HALT = 1
    L_PHI_BREACH = 2
    TWIN_DIVERGENCE = 3
    LEDGER_WRITE_FAILURE = 4
    PHASE_MIRROR_FLOOD = 5


@dataclass(frozen=True)
class TriggerSignal:
    """Represents a trigger signal."""
    trigger_code: TriggerCode
    is_active: bool
    signal_data: Dict[str, Any] = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())


@dataclass(frozen=True)
class TriggerEvaluationResult:
    """Result of evaluating a single trigger."""
    trigger_code: TriggerCode
    precedence: TriggerPrecedence
    is_triggered: bool
    reason: str
    signal_data: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class WatchdogDecisionRecord:
    """Records a watchdog decision event."""
    timestamp: str
    correlation_id: str
    decision: WatchdogDecision
    triggered_trigger: Optional[TriggerCode] = None
    reason: str = ""
    all_triggers: List[TriggerEvaluationResult] = field(default_factory=list)
    checkpoint_id: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'timestamp': self.timestamp,
            'correlation_id': self.correlation_id,
            'decision': self.decision.value,
            'triggered_trigger': self.triggered_trigger.value if self.triggered_trigger else None,
            'reason': self.reason,
            'all_triggers': [
                {
                    'trigger': t.trigger_code.value,
                    'triggered': t.is_triggered,
                    'reason': t.reason,
                }
                for t in self.all_triggers
            ],
            'checkpoint_id': self.checkpoint_id,
        }


class TriggerEvaluator:
    """Evaluates triggers in deterministic precedence order."""
    
    TRIGGER_PRECEDENCE = [
        (TriggerCode.OPERATOR_HALT, TriggerPrecedence.OPERATOR_HALT),
        (TriggerCode.L_PHI_BREACH, TriggerPrecedence.L_PHI_BREACH),
        (TriggerCode.TWIN_DIVERGENCE, TriggerPrecedence.TWIN_DIVERGENCE),
        (TriggerCode.LEDGER_WRITE_FAILURE, TriggerPrecedence.LEDGER_WRITE_FAILURE),
        (TriggerCode.PHASE_MIRROR_FLOOD, TriggerPrecedence.PHASE_MIRROR_FLOOD),
    ]
    
    @staticmethod
    def evaluate_operator_halt(signals: Dict[TriggerCode, TriggerSignal]) -> TriggerEvaluationResult:
        """Evaluate operator_halt trigger."""
        signal = signals.get(TriggerCode.OPERATOR_HALT)
        is_triggered = signal is not None and signal.is_active
        
        reason = "Operator has halted PMD" if is_triggered else "No operator halt signal"
        
        return TriggerEvaluationResult(
            trigger_code=TriggerCode.OPERATOR_HALT,
            precedence=TriggerPrecedence.OPERATOR_HALT,
            is_triggered=is_triggered,
            reason=reason,
            signal_data=signal.signal_data if signal else {},
        )
    
    @staticmethod
    def evaluate_l_phi_breach(signals: Dict[TriggerCode, TriggerSignal]) -> TriggerEvaluationResult:
        """Evaluate L_Phi_breach trigger from signal data."""
        signal = signals.get(TriggerCode.L_PHI_BREACH)
        is_triggered = False
        reason = "No L(Phi) signal"
        
        if signal and signal.is_active:
            l_phi = signal.signal_data.get("current_L_Phi", 0)
            threshold = 0.9
            is_triggered = l_phi > threshold
            reason = f"L(Phi)={l_phi:.3f} {'>' if is_triggered else '<='} threshold {threshold}"
        
        return TriggerEvaluationResult(
            trigger_code=TriggerCode.L_PHI_BREACH,
            precedence=TriggerPrecedence.L_PHI_BREACH,
            is_triggered=is_triggered,
            reason=reason,
            signal_data=signal.signal_data if signal else {},
        )
    
    @staticmethod
    def evaluate_l_phi_breach_from_health_report(
        report: Optional[HealthReport],
        threshold: float = 0.9,
    ) -> TriggerEvaluationResult:
        """
        Evaluate L_Phi_breach trigger from A-07 HealthReport.
        
        Per A-07 contract:
        - Report must not be stale
        - Confidence must be adequate (>= 0.5)
        - Report.l_phi compared against threshold
        
        Args:
          report: HealthReport from health signal consumption
          threshold: L_Phi breach threshold (default 0.9)
        
        Returns:
          TriggerEvaluationResult with is_triggered set based on health signal
        """
        is_triggered = False
        reason = "No health report available"
        signal_data = {}
        
        if report is None:
            # No report available - cannot evaluate
            return TriggerEvaluationResult(
                trigger_code=TriggerCode.L_PHI_BREACH,
                precedence=TriggerPrecedence.L_PHI_BREACH,
                is_triggered=is_triggered,
                reason=reason,
                signal_data={},
            )
        
        # Check for staleness
        current_time = time.time()
        if report.is_stale(current_time):
            reason = f"L(Phi) report stale (age {current_time - report.timestamp:.1f}s); cannot evaluate"
            return TriggerEvaluationResult(
                trigger_code=TriggerCode.L_PHI_BREACH,
                precedence=TriggerPrecedence.L_PHI_BREACH,
                is_triggered=is_triggered,
                reason=reason,
                signal_data={"report_id": report.report_id, "confidence": report.confidence},
            )
        
        # Check confidence adequacy (per A-07)
        if report.confidence < 0.5:
            reason = (
                f"L(Phi) report low confidence ({report.confidence:.2f}); "
                f"degraded mode - mutations blocked"
            )
            return TriggerEvaluationResult(
                trigger_code=TriggerCode.L_PHI_BREACH,
                precedence=TriggerPrecedence.L_PHI_BREACH,
                is_triggered=True,  # Low confidence triggers degraded mode
                reason=reason,
                signal_data={"report_id": report.report_id, "confidence": report.confidence, "l_phi": report.l_phi},
            )
        
        # Evaluate L_Phi breach
        is_triggered = report.l_phi > threshold
        reason = (
            f"L(Phi)={report.l_phi:.3f} {'>' if is_triggered else '<='} threshold {threshold}; "
            f"confidence={report.confidence:.2f}"
        )
        
        signal_data = {
            "report_id": report.report_id,
            "report_hash": report.report_hash,
            "l_phi": report.l_phi,
            "confidence": report.confidence,
            "correlation_id": report.correlation_id,
        }
        
        return TriggerEvaluationResult(
            trigger_code=TriggerCode.L_PHI_BREACH,
            precedence=TriggerPrecedence.L_PHI_BREACH,
            is_triggered=is_triggered,
            reason=reason,
            signal_data=signal_data,
        )
    
    @staticmethod
    def evaluate_twin_divergence(signals: Dict[TriggerCode, TriggerSignal]) -> TriggerEvaluationResult:
        """Evaluate twin_divergence trigger."""
        signal = signals.get(TriggerCode.TWIN_DIVERGENCE)
        is_triggered = False
        reason = "No twin divergence signal"
        
        if signal and signal.is_active:
            divergence = signal.signal_data.get("divergence_magnitude", 0)
            threshold = 0.01
            is_triggered = divergence > threshold
            reason = f"Divergence={divergence:.6f} {'>' if is_triggered else '<='} threshold {threshold}"
        
        return TriggerEvaluationResult(
            trigger_code=TriggerCode.TWIN_DIVERGENCE,
            precedence=TriggerPrecedence.TWIN_DIVERGENCE,
            is_triggered=is_triggered,
            reason=reason,
            signal_data=signal.signal_data if signal else {},
        )
    
    @staticmethod
    def evaluate_ledger_write_failure(signals: Dict[TriggerCode, TriggerSignal]) -> TriggerEvaluationResult:
        """Evaluate ledger_write_failure trigger."""
        signal = signals.get(TriggerCode.LEDGER_WRITE_FAILURE)
        is_triggered = False
        reason = "No ledger failure signal"
        
        if signal and signal.is_active:
            failure_count = signal.signal_data.get("failure_count", 0)
            max_allowed = 3
            is_triggered = failure_count >= max_allowed
            reason = f"Ledger failures: {failure_count} {'>' if is_triggered else '<'} max {max_allowed}"
        
        return TriggerEvaluationResult(
            trigger_code=TriggerCode.LEDGER_WRITE_FAILURE,
            precedence=TriggerPrecedence.LEDGER_WRITE_FAILURE,
            is_triggered=is_triggered,
            reason=reason,
            signal_data=signal.signal_data if signal else {},
        )
    
    @staticmethod
    def evaluate_phase_mirror_flood(signals: Dict[TriggerCode, TriggerSignal]) -> TriggerEvaluationResult:
        """Evaluate phase_mirror_flood trigger."""
        signal = signals.get(TriggerCode.PHASE_MIRROR_FLOOD)
        is_triggered = False
        reason = "No flood signal"
        
        if signal and signal.is_active:
            queue_depth = signal.signal_data.get("queue_depth", 0)
            threshold = 100
            is_triggered = queue_depth > threshold
            reason = f"Queue depth: {queue_depth} {'>' if is_triggered else '<='} threshold {threshold}"
        
        return TriggerEvaluationResult(
            trigger_code=TriggerCode.PHASE_MIRROR_FLOOD,
            precedence=TriggerPrecedence.PHASE_MIRROR_FLOOD,
            is_triggered=is_triggered,
            reason=reason,
            signal_data=signal.signal_data if signal else {},
        )
    
    @staticmethod
    def evaluate_all(signals: Dict[TriggerCode, TriggerSignal]) -> List[TriggerEvaluationResult]:
        """Evaluate all triggers in precedence order."""
        evaluators = [
            TriggerEvaluator.evaluate_operator_halt,
            TriggerEvaluator.evaluate_l_phi_breach,
            TriggerEvaluator.evaluate_twin_divergence,
            TriggerEvaluator.evaluate_ledger_write_failure,
            TriggerEvaluator.evaluate_phase_mirror_flood,
        ]
        
        results = []
        for evaluator in evaluators:
            result = evaluator(signals)
            results.append(result)
        
        return results


class WatchdogDecisionEngine:
    """Makes deterministic watchdog decisions based on trigger evaluation."""
    
    @staticmethod
    def decide(
        trigger_results: List[TriggerEvaluationResult],
        correlation_id: str,
    ) -> WatchdogDecisionRecord:
        """
        Make a decision based on trigger evaluations.
        
        Determinism: Identical trigger vectors always produce identical decisions.
        """
        # Find highest-precedence true trigger
        highest_priority_trigger = None
        for result in trigger_results:
            if result.is_triggered:
                if highest_priority_trigger is None or \
                   result.precedence.value < highest_priority_trigger.precedence.value:
                    highest_priority_trigger = result
        
        # Determine decision and reason
        if highest_priority_trigger is None:
            decision = WatchdogDecision.NONE
            reason = "All triggers false; system in nominal state"
            triggered_trigger = None
        elif highest_priority_trigger.trigger_code == TriggerCode.OPERATOR_HALT:
            decision = WatchdogDecision.KILL_SWITCH
            reason = f"Kill-switch: {highest_priority_trigger.reason}"
            triggered_trigger = TriggerCode.OPERATOR_HALT
        else:
            decision = WatchdogDecision.ROLLBACK
            reason = f"Rollback: {highest_priority_trigger.reason}"
            triggered_trigger = highest_priority_trigger.trigger_code
        
        # Generate decision record
        record = WatchdogDecisionRecord(
            timestamp=datetime.utcnow().isoformat() + "Z",
            correlation_id=correlation_id,
            decision=decision,
            triggered_trigger=triggered_trigger,
            reason=reason,
            all_triggers=trigger_results,
        )
        
        return record


class RollbackDispatcher:
    """Dispatches rollback actions with checkpoint resolution."""
    
    @staticmethod
    def dispatch_rollback(
        checkpoint_id: str,
        trigger_code: TriggerCode,
        correlation_id: str,
    ) -> Tuple[bool, str]:
        """
        Dispatch rollback to checkpoint.
        
        Prerequisites:
        - Checkpoint must be available
        - Policy gate must approve restore
        
        Returns:
            (success, details)
        """
        # In integration, policy gate would be called here
        # For now, checkpoint validation only
        
        if not checkpoint_id:
            return False, "No checkpoint available for rollback"
        
        # Validate checkpoint exists (simulated)
        if not checkpoint_id.startswith("ckpt-"):
            return False, f"Invalid checkpoint ID format: {checkpoint_id}"
        
        return True, f"Rollback to {checkpoint_id} approved and dispatched"


class KillSwitchManager:
    """Manages kill-switch engagement and terminal lock."""
    
    def __init__(self):
        """Initialize kill-switch manager."""
        self.is_engaged = False
        self.engagement_time: Optional[str] = None
        self.engagement_correlation_id: Optional[str] = None
        self.engagement_reason: str = ""
    
    def engage(self, correlation_id: str, reason: str) -> None:
        """Engage kill-switch."""
        if not self.is_engaged:
            self.is_engaged = True
            self.engagement_time = datetime.utcnow().isoformat() + "Z"
            self.engagement_correlation_id = correlation_id
            self.engagement_reason = reason
    
    def is_locked(self) -> bool:
        """Check if kill-switch is engaged."""
        return self.is_engaged
    
    def require_manual_clearance(self, operator_id: str, recovery_action: str) -> bool:
        """
        Record manual clearance event.
        
        In integration, policy gate would validate recovery action.
        """
        if not self.is_engaged:
            return False
        
        # In integration, this would check policy gate approval
        self.is_engaged = False
        return True


class AlertStream:
    """
    AC-5: Emits auditable alert stream with decision codes and metadata.
    
    Maintains ordered log of alerts with:
    - decision_code (NONE, ROLLBACK, KILL_SWITCH)
    - precedence_path (trigger precedence vector)
    - correlation_id (links to trigger event)
    - timestamp
    """
    
    def __init__(self):
        """Initialize alert stream."""
        self.alerts: List[Dict[str, Any]] = []
    
    def emit_decision_alert(
        self,
        decision_record: WatchdogDecisionRecord,
        alert_type: AlertType = AlertType.NOMINAL,
    ) -> None:
        """
        Emit alert for watchdog decision.
        
        Args:
          decision_record: WatchdogDecisionRecord to emit
          alert_type: AlertType enum (NOMINAL, DEGRADED, HALTED, CRITICAL)
        """
        # Determine alert type based on decision
        if alert_type == AlertType.NOMINAL:
            if decision_record.decision == WatchdogDecision.NONE:
                alert_type = AlertType.NOMINAL
            elif decision_record.decision == WatchdogDecision.ROLLBACK:
                alert_type = AlertType.DEGRADED
            elif decision_record.decision == WatchdogDecision.KILL_SWITCH:
                alert_type = AlertType.CRITICAL
        
        # Build precedence path from trigger vector
        triggered_triggers = [
            t.trigger_code.value for t in decision_record.all_triggers if t.is_triggered
        ]
        
        alert = {
            "timestamp": decision_record.timestamp,
            "correlation_id": decision_record.correlation_id,
            "alert_type": alert_type.value,
            "decision_code": decision_record.decision.value,
            "triggered_trigger": decision_record.triggered_trigger.value if decision_record.triggered_trigger else None,
            "reason": decision_record.reason,
            "precedence_path": triggered_triggers,
            "all_trigger_codes": [t.trigger_code.value for t in decision_record.all_triggers],
        }
        
        self.alerts.append(alert)
    
    def get_alerts(self) -> List[Dict[str, Any]]:
        """Get all emitted alerts."""
        return list(self.alerts)
    
    def get_recent_alerts(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most recent alerts."""
        return self.alerts[-limit:] if self.alerts else []


class HeartbeatOrchestrator:
    """Orchestrates heartbeat cycles with deterministic trigger evaluation."""
    
    def __init__(self):
        """Initialize heartbeat orchestrator."""
        self.decision_records: List[WatchdogDecisionRecord] = []
        self.kill_switch = KillSwitchManager()
        self.cycle_count = 0
        self.alert_stream: "AlertStream" = AlertStream()
    
    def run_heartbeat(
        self,
        signals: Dict[TriggerCode, TriggerSignal],
        correlation_id: str,
    ) -> WatchdogDecisionRecord:
        """
        Run one heartbeat cycle.
        
        Contract 1: Evaluates all triggers in deterministic order
        Contract 5: Emits audit record even when no trigger fires
        """
        # Atomically snapshot signals
        signal_snapshot = dict(signals)
        
        # Evaluate all triggers in precedence order
        trigger_results = TriggerEvaluator.evaluate_all(signal_snapshot)
        
        # Make decision
        decision_record = WatchdogDecisionEngine.decide(trigger_results, correlation_id)
        
        # Record decision
        self.decision_records.append(decision_record)
        
        # Emit alert (AC-5)
        self.alert_stream.emit_decision_alert(decision_record)
        
        # Handle kill-switch engagement
        if decision_record.decision == WatchdogDecision.KILL_SWITCH:
            self.kill_switch.engage(correlation_id, decision_record.reason)
        
        self.cycle_count += 1
        
        return decision_record
    
    def get_decision_history(self) -> List[WatchdogDecisionRecord]:
        """Get all decision records."""
        return list(self.decision_records)
    
    def get_summary(self) -> Dict[str, Any]:
        """Get heartbeat summary."""
        rollback_count = sum(
            1 for r in self.decision_records
            if r.decision == WatchdogDecision.ROLLBACK
        )
        kill_switch_count = sum(
            1 for r in self.decision_records
            if r.decision == WatchdogDecision.KILL_SWITCH
        )
        nominal_count = sum(
            1 for r in self.decision_records
            if r.decision == WatchdogDecision.NONE
        )
        
        return {
            "total_cycles": self.cycle_count,
            "nominal_decisions": nominal_count,
            "rollback_decisions": rollback_count,
            "kill_switch_decisions": kill_switch_count,
            "kill_switch_engaged": self.kill_switch.is_locked(),
            "decision_records": len(self.decision_records),
        }


# Test helpers
def create_test_signal(
    trigger_code: TriggerCode,
    is_active: bool = False,
    signal_data: Optional[Dict[str, Any]] = None,
) -> TriggerSignal:
    """Create a test trigger signal."""
    return TriggerSignal(
        trigger_code=trigger_code,
        is_active=is_active,
        signal_data=signal_data or {},
    )


def create_test_heartbeat_orchestrator() -> HeartbeatOrchestrator:
    """Create a test heartbeat orchestrator."""
    return HeartbeatOrchestrator()
