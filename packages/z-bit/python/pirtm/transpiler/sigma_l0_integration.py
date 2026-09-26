"""
ADR-012 Integration: Sigma Kernel → L0 Verification Pipeline

This module orchestrates the complete compilation pipeline for Sigma Kernel output:

1. Sigma Kernel produces RGFlowResult (cumulants + RG parameters)
2. CumulantEmitter transforms to MLIR + bytecode
3. SigmaL0Verifier validates all 8 L0 invariants (transpile-time gate)
4. Output: Verified MLIR module ready for contractivity-check and linking

This ensures NO Sigma output enters the PIRTM compilation pipeline without
satisfying all L0 invariants. Violations are reported with line numbers,
locations, and remediation guidance.

Related: ADR-010 (Sigma), ADR-011 (Cumulant Storage), ADR-012 (L0 Compliance)

Integration Points:
- Called by: Transpiler CLI or link-time phase orchestrator
- Calls: SigmaL0Verifier.verify_module()
- Produces: Verified module IR with audit trail
"""

from typing import Dict, Any, Optional, Tuple, List
from dataclasses import dataclass
import json
import sys

from pirtm.mlir.sigma_l0_verifier import (
    SigmaL0Verifier,
    L0AuditReport,
    L0CheckResult,
)
from pirtm.transpiler.pirtm_emitter_cumulants import CumulantEmitter


@dataclass
class SigmaCompilationResult:
    """Result of compiling Sigma output to verified MLIR."""
    
    module_name: str
    module_ir: Dict[str, Any]
    l0_audit: L0AuditReport
    is_valid: bool
    bytecode: Optional[bytes] = None
    
    def passed_l0(self) -> bool:
        """Check if module passed all L0 verification checks."""
        return self.l0_audit.all_pass


class SigmaCompilationPipeline:
    """
    Complete pipeline: Sigma output → L0 verification → bytecode emission.
    
    This pipeline orchestrates three phases:
    1. Sigma Kernel (external: produces RGFlowResult)
    2. Cumulant Emission (MLIR representation + bytecode)
    3. L0 Verification (8-point invariant audit)
    
    If any phase fails, the module is rejected with detailed diagnostics.
    """
    
    def __init__(self, verbose: bool = False, fail_fast: bool = True):
        """
        Initialize compilation pipeline.
        
        Args:
            verbose: If True, emit detailed diagnostics for each phase
            fail_fast: If True, stop at first failure; otherwise collect all
        """
        self.verbose = verbose
        self.fail_fast = fail_fast
        self.cumulant_emitter = CumulantEmitter(verbose=verbose)
        self.l0_verifier = SigmaL0Verifier(verbose=verbose, fail_fast=fail_fast)
        self.results: List[SigmaCompilationResult] = []
    
    def compile_sigma_output(
        self,
        module_ir: Dict[str, Any],
        emit_bytecode: bool = True
    ) -> SigmaCompilationResult:
        """
        Compile and verify a single Sigma-produced module.
        
        Args:
            module_ir: MLIR module dict with operations and attributes
            emit_bytecode: If True, also emit bytecode section (default: True)
        
        Returns:
            SigmaCompilationResult with module IR, L0 audit, and bytecode
        
        Raises:
            L0ComplianceError if L0 verification fails and fail_fast=True
        """
        module_name = module_ir.get("name", "Unknown")
        
        if self.verbose:
            print(f"\n{'='*60}")
            print(f"Compiling: {module_name}")
            print(f"{'='*60}")
            print(f"Module has {len(module_ir.get('operations', []))} operations")
        
        # Phase 1: Pre-flight checks (module structure)
        if "attributes" not in module_ir:
            raise ValueError(f"Module '{module_name}' missing 'attributes' key")
        if "operations" not in module_ir:
            raise ValueError(f"Module '{module_name}' missing 'operations' key")
        
        # Phase 2: Run L0 verification (the critical gate)
        if self.verbose:
            print(f"\nPhase 1: L0 Invariant Verification...")
        
        l0_audit = self.l0_verifier.verify_module(module_ir)
        
        if self.verbose:
            print(l0_audit.full_report())
        
        # Check if L0 verification passed
        if not l0_audit.all_pass:
            error_msg = self._format_l0_failure(module_name, l0_audit)
            if self.fail_fast:
                raise L0ComplianceError(error_msg)
            else:
                print(f"WARNING: {error_msg}", file=sys.stderr)
                # Continue anyway for non-fail-fast mode
        
        # Phase 3: Emit bytecode (if requested)
        bytecode = None
        if emit_bytecode and l0_audit.all_pass:
            if self.verbose:
                print(f"\nPhase 2: Bytecode Emission...")
            
            try:
                # Optional: emit bytecode if cumulant data available
                # For now, this is a placeholder for ADR-011 integration
                bytecode = None  # Would call self.cumulant_emitter.emit_bytecode_section()
            except Exception as e:
                if self.verbose:
                    print(f"  Warning: Bytecode emission failed: {e}")
        
        # Create result
        result = SigmaCompilationResult(
            module_name=module_name,
            module_ir=module_ir,
            l0_audit=l0_audit,
            is_valid=l0_audit.all_pass,
            bytecode=bytecode
        )
        
        self.results.append(result)
        
        # Summary
        if self.verbose:
            print(f"\n{'='*60}")
            status = "✓ PASSED" if result.is_valid else "✗ REJECTED"
            print(f"Compilation Result: {status}")
            print(f"  Module: {module_name}")
            print(f"  L0 Compliance: {l0_audit.summary()}")
            if not result.is_valid:
                failed_checks = [f"L0-{c.invariant_num}: {c.name}" for c in l0_audit.failed_checks]
                print(f"  Failed Checks: {', '.join(failed_checks)}")
            print(f"{'='*60}\n")
        
        return result
    
    def compile_all(self, modules: List[Dict[str, Any]]) -> List[SigmaCompilationResult]:
        """
        Compile and verify multiple modules in sequence.
        
        Args:
            modules: List of MLIR module dicts
        
        Returns:
            List of SigmaCompilationResult objects
        """
        results = []
        for module in modules:
            try:
                result = self.compile_sigma_output(module)
                results.append(result)
            except L0ComplianceError as e:
                if self.fail_fast:
                    raise
                # In non-fail-fast mode, continue with next module
                results.append(SigmaCompilationResult(
                    module_name=module.get("name", "Unknown"),
                    module_ir=module,
                    l0_audit=None,  # type: ignore
                    is_valid=False,
                ))
        
        return results
    
    def all_passed(self) -> bool:
        """Check if all compiled modules passed L0 verification."""
        return all(r.is_valid for r in self.results)
    
    def summary(self) -> str:
        """Generate summary of all compilation results."""
        if not self.results:
            return "No modules compiled"
        
        total = len(self.results)
        passed = sum(1 for r in self.results if r.is_valid)
        failed = total - passed
        
        lines = [
            f"\nCompilation Summary",
            f"{'='*50}",
            f"Total modules: {total}",
            f"  Passed L0: {passed}",
            f"  Failed L0: {failed}",
        ]
        
        if failed > 0:
            lines.extend([
                f"\nFailed modules (L0 violations):",
            ])
            for result in self.results:
                if not result.is_valid:
                    failed_checks = [f"L0-{c.invariant_num}" for c in result.l0_audit.failed_checks]
                    checks_str = ", ".join(failed_checks)
                    lines.append(f"  • {result.module_name}: {checks_str}")
        
        lines.append(f"{'='*50}\n")
        
        return "\n".join(lines)
    
    @staticmethod
    def _format_l0_failure(module_name: str, audit: L0AuditReport) -> str:
        """Format L0 failure message with remediation guidance."""
        failed_checks = audit.failed_checks
        
        lines = [
            f"L0 COMPLIANCE FAILURE",
            f"  Module: {module_name}",
            f"  Failed checks: {len(failed_checks)}/{len(audit.checks)}",
            f"",
        ]
        
        for check in failed_checks:
            lines.extend([
                f"  ✗ L0-{check.invariant_num}: {check.name}",
                f"    Message: {check.message}",
                f"    Location: {check.location}",
            ])
        
        lines.extend([
            f"",
            f"REMEDIATION REQUIRED:",
            f"  1. Review error messages above for specific violations",
            f"  2. Modify Sigma Kernel output to comply with L0 invariants",
            f"  3. Re-compile and verify (this gate must pass 100%)",
            f"  4. If L0 invariant is incorrect, escalate to Architecture Committee",
        ])
        
        return "\n".join(lines)


class L0ComplianceError(Exception):
    """Raised when Sigma output fails L0 invariant verification."""
    pass


# ===== Integration with CLI =====

def integrate_l0_verifier_to_pipeline():
    """
    Integration instructions for adding L0 verification to compilation pipeline.
    
    Add this to your transpile command in cli.py:
    
    ```python
    from pirtm.transpiler.sigma_l0_integration import SigmaCompilationPipeline
    
    pipeline = SigmaCompilationPipeline(verbose=args.verbose, fail_fast=True)
    
    # Compile Sigma output module
    result = pipeline.compile_sigma_output(
        module_ir=sigma_result_as_dict,
        emit_bytecode=True
    )
    
    if not result.passed_l0():
        print("L0 VERIFICATION FAILED")
        print(result.l0_audit.full_report())
        sys.exit(1)
    
    # Continue to contractivity-check pass...
    ```
    """
    pass
