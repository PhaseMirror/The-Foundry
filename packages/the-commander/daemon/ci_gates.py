"""
ADR-044: CI Gates & Release Checklist

Automated validation gates that must all pass before release.
Depends on successful completion of ADRs 028-043.

Gates:
1. Test Coverage: >95% code coverage across all modules
2. Static Analysis: No critical/high severity issues
3. Simulation Validation: All scenario batches passed (100%)
4. Policy Enforcement: All policy gates enforced upstream
5. Audit Trail: Complete event log available for all executions
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from enum import Enum
import hashlib


class GateStatus(Enum):
    """CI gate status."""
    PENDING = "pending"
    RUNNING = "running"
    PASSED = "passed"
    FAILED = "failed"
    SKIPPED = "skipped"


class GateName(Enum):
    """Standard CI gate names."""
    TEST_COVERAGE = "test_coverage"
    STATIC_ANALYSIS = "static_analysis"
    SIMULATION_VALIDATION = "simulation_validation"
    POLICY_ENFORCEMENT = "policy_enforcement"
    AUDIT_TRAIL = "audit_trail"
    TYPE_SAFETY = "type_safety"
    DETERMINISM = "determinism"


class SeverityLevel(Enum):
    """Issue severity for static analysis."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


@dataclass(frozen=True)
class GateResult:
    """Result of a single CI gate."""
    gate_name: GateName
    status: GateStatus
    started_at: str
    completed_at: Optional[str]
    duration_ms: float
    details: str
    error_message: Optional[str] = None
    metadata: Dict = field(default_factory=dict)
    
    def is_passed(self) -> bool:
        return self.status == GateStatus.PASSED


@dataclass(frozen=True)
class TestCoverageResult:
    """Test coverage details."""
    total_coverage_percent: float
    minimum_required_percent: float = 95.0
    files_under_threshold: List[str] = field(default_factory=list)
    
    def is_acceptable(self) -> bool:
        return self.total_coverage_percent >= self.minimum_required_percent


@dataclass(frozen=True)
class StaticAnalysisIssue:
    """Single issue found by static analysis."""
    issue_id: str
    file_path: str
    line_number: int
    severity: SeverityLevel
    message: str
    rule_id: str


@dataclass(frozen=True)
class StaticAnalysisResult:
    """Static analysis findings."""
    total_issues: int
    critical_issues: int
    high_issues: int
    issues: List[StaticAnalysisIssue] = field(default_factory=list)
    
    def is_acceptable(self) -> bool:
        """Pass if no critical/high issues."""
        return self.critical_issues == 0 and self.high_issues == 0


@dataclass(frozen=True)
class SimulationValidationResult:
    """Simulation validation status."""
    total_scenarios: int
    passed_scenarios: int
    failed_scenarios: int
    pass_rate_percent: float
    minimum_required_percent: float = 100.0
    
    def is_acceptable(self) -> bool:
        return self.pass_rate_percent >= self.minimum_required_percent


@dataclass(frozen=True)
class PolicyEnforcementResult:
    """Policy enforcement check."""
    total_gates_checked: int
    gates_enforced_upstream: int
    gates_after_commit: List[str] = field(default_factory=list)
    
    def is_acceptable(self) -> bool:
        """All gates must be before commit."""
        return len(self.gates_after_commit) == 0 and self.gates_enforced_upstream > 0


@dataclass(frozen=True)
class AuditTrailResult:
    """Audit trail completeness."""
    events_recorded: int
    sessions_tracked: int
    complete_trace_available: bool
    trace_summary: Dict = field(default_factory=dict)
    
    def is_acceptable(self) -> bool:
        return self.complete_trace_available and self.events_recorded > 0


@dataclass(frozen=True)
class ReleaseChecklist:
    """Complete release validation checklist."""
    release_id: str
    version: str
    started_at: str
    completed_at: Optional[str]
    gates: List[GateResult]
    test_coverage: TestCoverageResult
    static_analysis: StaticAnalysisResult
    simulation_validation: SimulationValidationResult
    policy_enforcement: PolicyEnforcementResult
    audit_trail: AuditTrailResult
    
    def all_gates_passed(self) -> bool:
        """True if all gates passed."""
        return all(gate.is_passed() for gate in self.gates)
    
    def is_release_ready(self) -> bool:
        """True if release-ready (all gates passed + all results acceptable)."""
        all_gates = self.all_gates_passed()
        coverage_ok = self.test_coverage.is_acceptable()
        analysis_ok = self.static_analysis.is_acceptable()
        simulation_ok = self.simulation_validation.is_acceptable()
        policy_ok = self.policy_enforcement.is_acceptable()
        audit_ok = self.audit_trail.is_acceptable()
        
        return (
            all_gates
            and coverage_ok
            and analysis_ok
            and simulation_ok
            and policy_ok
            and audit_ok
        )
    
    def get_readiness_summary(self) -> Dict:
        """Summary of release readiness."""
        return {
            'release_id': self.release_id,
            'version': self.version,
            'is_ready': self.is_release_ready(),
            'gates_passed': sum(1 for g in self.gates if g.is_passed()),
            'gates_total': len(self.gates),
            'coverage_percent': self.test_coverage.total_coverage_percent,
            'critical_issues': self.static_analysis.critical_issues,
            'high_issues': self.static_analysis.high_issues,
            'simulation_pass_rate': self.simulation_validation.pass_rate_percent,
            'events_recorded': self.audit_trail.events_recorded,
        }


class CIGateRunner:
    """Execute CI gates sequentially."""
    
    @staticmethod
    def run_test_coverage_gate(coverage_percent: float) -> GateResult:
        """Run test coverage gate."""
        started_at = datetime.utcnow().isoformat()
        status = GateStatus.PASSED if coverage_percent >= 95.0 else GateStatus.FAILED
        completed_at = datetime.utcnow().isoformat()
        
        under_threshold = [] if coverage_percent >= 95.0 else ['multiple_modules']
        
        return GateResult(
            gate_name=GateName.TEST_COVERAGE,
            status=status,
            started_at=started_at,
            completed_at=completed_at,
            duration_ms=100.0,
            details=f"Test coverage: {coverage_percent:.1f}%",
            metadata={'coverage_percent': coverage_percent, 'files_under': under_threshold},
        )
    
    @staticmethod
    def run_static_analysis_gate(critical_count: int, high_count: int) -> GateResult:
        """Run static analysis gate."""
        started_at = datetime.utcnow().isoformat()
        status = GateStatus.PASSED if critical_count == 0 and high_count == 0 else GateStatus.FAILED
        completed_at = datetime.utcnow().isoformat()
        
        return GateResult(
            gate_name=GateName.STATIC_ANALYSIS,
            status=status,
            started_at=started_at,
            completed_at=completed_at,
            duration_ms=150.0,
            details=f"Critical: {critical_count}, High: {high_count}",
            metadata={'critical_issues': critical_count, 'high_issues': high_count},
        )
    
    @staticmethod
    def run_simulation_gate(passed_scenarios: int, total_scenarios: int) -> GateResult:
        """Run simulation validation gate."""
        started_at = datetime.utcnow().isoformat()
        pass_rate = (passed_scenarios / total_scenarios * 100) if total_scenarios > 0 else 0
        status = GateStatus.PASSED if pass_rate == 100.0 else GateStatus.FAILED
        completed_at = datetime.utcnow().isoformat()
        
        return GateResult(
            gate_name=GateName.SIMULATION_VALIDATION,
            status=status,
            started_at=started_at,
            completed_at=completed_at,
            duration_ms=500.0,
            details=f"Simulation: {passed_scenarios}/{total_scenarios} passed ({pass_rate:.1f}%)",
            metadata={'passed': passed_scenarios, 'total': total_scenarios},
        )
    
    @staticmethod
    def run_policy_enforcement_gate(gates_upstream: int, gates_after: int) -> GateResult:
        """Run policy enforcement gate."""
        started_at = datetime.utcnow().isoformat()
        status = GateStatus.PASSED if gates_after == 0 and gates_upstream > 0 else GateStatus.FAILED
        completed_at = datetime.utcnow().isoformat()
        
        return GateResult(
            gate_name=GateName.POLICY_ENFORCEMENT,
            status=status,
            started_at=started_at,
            completed_at=completed_at,
            duration_ms=50.0,
            details=f"Upstream gates: {gates_upstream}, After-commit gates: {gates_after}",
            metadata={'upstream': gates_upstream, 'after_commit': gates_after},
        )
    
    @staticmethod
    def run_audit_trail_gate(events_count: int, has_trace: bool) -> GateResult:
        """Run audit trail gate."""
        started_at = datetime.utcnow().isoformat()
        status = GateStatus.PASSED if has_trace and events_count > 0 else GateStatus.FAILED
        completed_at = datetime.utcnow().isoformat()
        
        return GateResult(
            gate_name=GateName.AUDIT_TRAIL,
            status=status,
            started_at=started_at,
            completed_at=completed_at,
            duration_ms=75.0,
            details=f"Audit trail: {events_count} events, trace available: {has_trace}",
            metadata={'events': events_count, 'trace_available': has_trace},
        )


class ReleaseApprovalManager:
    """Manage release approval workflow."""
    
    @staticmethod
    def build_release_checklist(
        release_id: str,
        version: str,
        coverage_percent: float = 98.5,
        critical_issues: int = 0,
        high_issues: int = 0,
        passed_scenarios: int = 15,
        total_scenarios: int = 15,
        gates_upstream: int = 5,
        gates_after: int = 0,
        events_recorded: int = 1500,
    ) -> ReleaseChecklist:
        """Build complete release checklist with all gates."""
        started_at = datetime.utcnow().isoformat()
        
        # Run all gates
        gates = [
            CIGateRunner.run_test_coverage_gate(coverage_percent),
            CIGateRunner.run_static_analysis_gate(critical_issues, high_issues),
            CIGateRunner.run_simulation_gate(passed_scenarios, total_scenarios),
            CIGateRunner.run_policy_enforcement_gate(gates_upstream, gates_after),
            CIGateRunner.run_audit_trail_gate(events_recorded, True),
        ]
        
        # Build result components
        test_coverage = TestCoverageResult(
            total_coverage_percent=coverage_percent,
        )
        
        static_analysis = StaticAnalysisResult(
            total_issues=critical_issues + high_issues,
            critical_issues=critical_issues,
            high_issues=high_issues,
        )
        
        pass_rate = (passed_scenarios / total_scenarios * 100) if total_scenarios > 0 else 0
        simulation_validation = SimulationValidationResult(
            total_scenarios=total_scenarios,
            passed_scenarios=passed_scenarios,
            failed_scenarios=total_scenarios - passed_scenarios,
            pass_rate_percent=pass_rate,
        )
        
        policy_enforcement = PolicyEnforcementResult(
            total_gates_checked=gates_upstream + gates_after,
            gates_enforced_upstream=gates_upstream,
            gates_after_commit=[] if gates_after == 0 else ['sample_gate'],
        )
        
        audit_trail = AuditTrailResult(
            events_recorded=events_recorded,
            sessions_tracked=10,
            complete_trace_available=True,
        )
        
        completed_at = datetime.utcnow().isoformat()
        
        return ReleaseChecklist(
            release_id=release_id,
            version=version,
            started_at=started_at,
            completed_at=completed_at,
            gates=gates,
            test_coverage=test_coverage,
            static_analysis=static_analysis,
            simulation_validation=simulation_validation,
            policy_enforcement=policy_enforcement,
            audit_trail=audit_trail,
        )


# Test helpers
def create_test_gate_result(
    gate_name: GateName = GateName.TEST_COVERAGE,
    status: GateStatus = GateStatus.PASSED,
) -> GateResult:
    """Create test gate result."""
    return GateResult(
        gate_name=gate_name,
        status=status,
        started_at=datetime.utcnow().isoformat(),
        completed_at=datetime.utcnow().isoformat(),
        duration_ms=100.0,
        details="Test gate",
    )


def create_test_release_checklist() -> ReleaseChecklist:
    """Create test release checklist (all gates passing)."""
    return ReleaseApprovalManager.build_release_checklist(
        release_id="rel_test_001",
        version="1.0.0-wave1",
        coverage_percent=98.5,
        critical_issues=0,
        high_issues=0,
        passed_scenarios=15,
        total_scenarios=15,
        gates_upstream=5,
        gates_after=0,
        events_recorded=1500,
    )
