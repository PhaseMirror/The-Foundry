#!/usr/bin/env python3
"""
ADR-012 Phase 2: End-to-End Integration Tests

Full workflow verification with:
1. Real MLIR files from fixtures
2. CI/CD simulation
3. Batch processing scenarios
4. Report generation validation
5. Pipeline integration testing
"""

import pytest
from pathlib import Path
from tempfile import TemporaryDirectory
import json
import subprocess
import sys

from pirtm.transpiler.l0_inspect_integration import (
    L0InspectFormatter,
    L0InspectCommand,
)
from pirtm.mlir.sigma_l0_verifier import SigmaL0Verifier
from pirtm.mlir.sigma_l0_integration import SigmaCompilationPipeline


# ===== Fixtures Paths =====

FIXTURES_DIR = Path(__file__).parent / "fixtures"

VALID_MODULES = [
    FIXTURES_DIR / "gft_melonic_valid.mlir",
    FIXTURES_DIR / "tensor_contraction_valid.mlir",
    FIXTURES_DIR / "edge_case_large_prime.mlir",
]

INVALID_MODULES = [
    FIXTURES_DIR / "gft_invalid_composite.mlir",
    FIXTURES_DIR / "gft_invalid_missing_epsilon.mlir",
]


# ===== End-to-End Tests with Real MLIR Files =====

class TestEndToEndRealMLIR:
    """Tests using actual MLIR fixture files."""
    
    def test_valid_module_file_inspection_table(self):
        """PASS: Inspect real valid MLIR and verify table output."""
        if not VALID_MODULES[0].exists():
            pytest.skip("MLIR fixture file not found")
        
        command = L0InspectCommand(verbose=False)
        exit_code = command.inspect_mlir_file(
            VALID_MODULES[0],
            verify_l0=True,
            report_format="table"
        )
        
        assert exit_code == 0, f"Valid module should pass, got exit code {exit_code}"
    
    def test_valid_module_file_inspection_json(self):
        """PASS: Inspect real valid MLIR and verify JSON output."""
        if not VALID_MODULES[0].exists():
            pytest.skip("MLIR fixture file not found")
        
        command = L0InspectCommand(verbose=False)
        exit_code = command.inspect_mlir_file(
            VALID_MODULES[0],
            verify_l0=True,
            report_format="json"
        )
        
        assert exit_code == 0
    
    def test_valid_module_file_inspection_brief(self):
        """PASS: Inspect real valid MLIR and verify brief output."""
        if not VALID_MODULES[0].exists():
            pytest.skip("MLIR fixture file not found")
        
        command = L0InspectCommand(verbose=False)
        exit_code = command.inspect_mlir_file(
            VALID_MODULES[0],
            verify_l0=True,
            report_format="brief"
        )
        
        assert exit_code == 0
    
    def test_invalid_module_file_inspection_composite(self):
        """FAIL: Reject invalid MLIR with composite prime_mod."""
        if not INVALID_MODULES[0].exists():
            pytest.skip("MLIR fixture file not found")
        
        command = L0InspectCommand(verbose=False)
        exit_code = command.inspect_mlir_file(
            INVALID_MODULES[0],
            verify_l0=True,
            report_format="table"
        )
        
        assert exit_code == 1, "Invalid module should fail"
    
    def test_invalid_module_file_inspection_missing_epsilon(self):
        """FAIL: Reject invalid MLIR with missing epsilon."""
        if not INVALID_MODULES[1].exists():
            pytest.skip("MLIR fixture file not found")
        
        command = L0InspectCommand(verbose=False)
        exit_code = command.inspect_mlir_file(
            INVALID_MODULES[1],
            verify_l0=True,
            report_format="table"
        )
        
        assert exit_code == 1, "Missing epsilon should fail"
    
    def test_large_prime_module(self):
        """PASS: Handle large prime modulus (Miller-Rabin test)."""
        if not VALID_MODULES[2].exists():
            pytest.skip("MLIR fixture file not found")
        
        command = L0InspectCommand(verbose=False)
        exit_code = command.inspect_mlir_file(
            VALID_MODULES[2],
            verify_l0=True,
            report_format="brief"
        )
        
        assert exit_code == 0, "Large prime module should pass"


# ===== Batch Processing / Multi-Scenario Tests =====

class TestBatchProcessing:
    """Tests for CI/CD batch processing scenarios."""
    
    def test_mixed_batch_valid_and_invalid(self):
        """CICD: Process batch with mix of valid/invalid modules."""
        if not all(m.exists() for m in VALID_MODULES + INVALID_MODULES[:1]):
            pytest.skip("Some fixture files not found")
        
        modules_to_test = [
            VALID_MODULES[0],
            INVALID_MODULES[0],
            VALID_MODULES[1],
        ]
        
        command = L0InspectCommand(verbose=False)
        
        results = []
        for mlir_file in modules_to_test:
            exit_code = command.inspect_mlir_file(
                mlir_file,
                verify_l0=True,
                report_format="brief"
            )
            results.append((mlir_file.name, exit_code))
        
        # Verify: 2 valid (exit 0), 1 invalid (exit 1)
        assert results[0][1] == 0  # gft_melonic_valid
        assert results[1][1] == 1  # gft_invalid_composite
        assert results[2][1] == 0  # tensor_contraction_valid
    
    def test_batch_all_valid(self):
        """CICD: All modules in batch pass verification."""
        if not all(m.exists() for m in VALID_MODULES):
            pytest.skip("Some fixture files not found")
        
        command = L0InspectCommand(verbose=False)
        
        all_pass = True
        for mlir_file in VALID_MODULES:
            exit_code = command.inspect_mlir_file(
                mlir_file,
                verify_l0=True,
                report_format="brief"
            )
            if exit_code != 0:
                all_pass = False
                break
        
        assert all_pass, "All valid modules should pass"
    
    def test_batch_all_invalid(self):
        """CICD: All modules in batch fail verification."""
        if not all(m.exists() for m in INVALID_MODULES):
            pytest.skip("Some fixture files not found")
        
        command = L0InspectCommand(verbose=False)
        
        all_fail = True
        for mlir_file in INVALID_MODULES:
            exit_code = command.inspect_mlir_file(
                mlir_file,
                verify_l0=True,
                report_format="brief"
            )
            if exit_code == 0:
                all_fail = False
                break
        
        assert all_fail, "All invalid modules should fail"


# ===== CI/CD Integration Tests =====

class TestCICDIntegration:
    """Tests simulating CI/CD pipeline integration."""
    
    def test_cicd_gate_pass_all_valid(self):
        """CICD GATE: All valid modules → exit 0."""
        if not all(m.exists() for m in VALID_MODULES):
            pytest.skip("Some fixture files not found")
        
        # Simulate CI/CD gate: all modules must pass
        pipeline = SigmaCompilationPipeline(verbose=False, fail_fast=False)
        
        for mlir_file in VALID_MODULES:
            with open(mlir_file, 'r') as f:
                mlir_text = f.read()
            
            command = L0InspectCommand(verbose=False)
            # Parse MLIR to dict
            module_ir = command._parse_mlir_to_dict(
                mlir_text,
                mlir_file.stem
            )
            
            # Compile through pipeline
            result = pipeline.compile_sigma_output(module_ir, emit_bytecode=False)
        
        # Gate passes if all_passed() is True
        assert pipeline.all_passed(), "CI/CD gate failed: not all modules passed"
    
    def test_cicd_gate_fail_any_invalid(self):
        """CICD GATE: Any invalid module → exit 1."""
        if not (VALID_MODULES[0].exists() and INVALID_MODULES[0].exists()):
            pytest.skip("Some fixture files not found")
        
        pipeline = SigmaCompilationPipeline(verbose=False, fail_fast=False)
        
        # Process valid modules
        with open(VALID_MODULES[0], 'r') as f:
            mlir_text = f.read()
        command = L0InspectCommand(verbose=False)
        module_ir = command._parse_mlir_to_dict(mlir_text, "valid")
        pipeline.compile_sigma_output(module_ir, emit_bytecode=False)
        
        # Process invalid module
        with open(INVALID_MODULES[0], 'r') as f:
            mlir_text = f.read()
        module_ir = command._parse_mlir_to_dict(mlir_text, "invalid")
        pipeline.compile_sigma_output(module_ir, emit_bytecode=False)
        
        # Gate fails: at least one module failed
        assert not pipeline.all_passed(), "CI/CD gate should fail: invalid module present"
    
    def test_cicd_summary_reporting(self):
        """CICD: Generate clear batch summary."""
        if not all(m.exists() for m in VALID_MODULES[:1] + INVALID_MODULES[:1]):
            pytest.skip("Some fixture files not found")
        
        pipeline = SigmaCompilationPipeline(verbose=False, fail_fast=False)
        
        # Process one valid, one invalid
        for mlir_file in [VALID_MODULES[0], INVALID_MODULES[0]]:
            with open(mlir_file, 'r') as f:
                mlir_text = f.read()
            command = L0InspectCommand(verbose=False)
            module_ir = command._parse_mlir_to_dict(mlir_text, mlir_file.stem)
            pipeline.compile_sigma_output(module_ir, emit_bytecode=False)
        
        summary = pipeline.summary()
        
        # Summary must be human-readable and include results
        assert "Total modules" in summary or "modules" in summary.lower()
        assert "2" in summary  # 2 modules processed
    
    def test_cicd_exit_code_semantics(self):
        """CICD: Exit codes follow consistent semantics."""
        if not all(m.exists() for m in VALID_MODULES[:1]):
            pytest.skip("Some fixture files not found")
        
        command = L0InspectCommand(verbose=False)
        
        # Valid module → exit 0
        exit_0 = command.inspect_mlir_file(
            VALID_MODULES[0],
            verify_l0=True,
            report_format="brief"
        )
        assert exit_0 == 0
        
        # Invalid module → exit 1
        exit_1 = command.inspect_mlir_file(
            INVALID_MODULES[0],
            verify_l0=True,
            report_format="brief"
        )
        assert exit_1 == 1
        
        # Exit codes are binary (0 or 1)
        assert exit_0 in [0, 1]
        assert exit_1 in [0, 1]


# ===== Report Generation Tests =====

class TestReportGeneration:
    """Tests for report generation with real data."""
    
    def test_report_includes_module_name(self):
        """PASS: Reports include actual module name from MLIR."""
        if not VALID_MODULES[0].exists():
            pytest.skip("MLIR fixture file not found")
        
        command = L0InspectCommand(verbose=False)
        
        with open(VALID_MODULES[0], 'r') as f:
            mlir_text = f.read()
        
        module_ir = command._parse_mlir_to_dict(
            mlir_text,
            "gft_melonic_valid"
        )
        
        verifier = SigmaL0Verifier(verbose=False)
        report = verifier.verify_module(module_ir)
        
        # Module name should be in report
        assert report.module_name == "gft_melonic_valid"
        
        # Format reports and verify module name appears
        table = L0InspectFormatter.format_table(report)
        json_str = L0InspectFormatter.format_json(report)
        brief = L0InspectFormatter.format_brief(report)
        
        assert "gft_melonic_valid" in table
        assert "gft_melonic_valid" in json_str
        assert "gft_melonic_valid" in brief
    
    def test_json_report_parseable_from_file(self):
        """PASS: JSON report from real MLIR is valid and parseable."""
        if not VALID_MODULES[0].exists():
            pytest.skip("MLIR fixture file not found")
        
        command = L0InspectCommand(verbose=False)
        
        with open(VALID_MODULES[0], 'r') as f:
            mlir_text = f.read()
        
        module_ir = command._parse_mlir_to_dict(
            mlir_text,
            VALID_MODULES[0].stem
        )
        
        verifier = SigmaL0Verifier(verbose=False)
        report = verifier.verify_module(module_ir)
        
        json_str = L0InspectFormatter.format_json(report)
        
        # Must parse as valid JSON
        data = json.loads(json_str)
        
        # Must have expected structure
        assert "checks" in data
        assert "module_name" in data
        assert "all_pass" in data
        assert "audit_chain_line" in data


# ===== Full Integration Gate Tests =====

class TestFullIntegrationGates:
    """Master gate tests for end-to-end validation."""
    
    def test_e2e_with_real_fixtures(self):
        """GATE: End-to-end workflow with real MLIR files."""
        if not all(m.exists() for m in VALID_MODULES[:1]):
            pytest.skip("Some fixture files not found")
        
        # Step 1: Read real MLIR file
        mlir_file = VALID_MODULES[0]
        with open(mlir_file, 'r') as f:
            mlir_text = f.read()
        
        # Step 2: Create command and inspect
        command = L0InspectCommand(verbose=False)
        module_ir = command._parse_mlir_to_dict(mlir_text, mlir_file.stem)
        
        # Step 3: Verify module
        verifier = SigmaL0Verifier(verbose=False)
        report = verifier.verify_module(module_ir)
        
        # Step 4: Generate all report formats
        table = L0InspectFormatter.format_table(report)
        json_str = L0InspectFormatter.format_json(report)
        brief = L0InspectFormatter.format_brief(report)
        
        # Step 5: Verify all outputs are valid
        assert len(table) > 100
        assert json.loads(json_str) is not None
        assert len(brief) < 200
        
        # Step 6: Verify audit chain line present
        assert "Audit Chain: NOT EMBEDDED" in table
        assert "Audit Chain: NOT EMBEDDED" in json_str
        
        # Gate passes
        assert True
    
    def test_e2e_cicd_batch_workflow(self):
        """GATE: CI/CD batch workflow with mixed modules."""
        if not (VALID_MODULES[0].exists() and INVALID_MODULES[0].exists()):
            pytest.skip("Some fixture files not found")
        
        pipeline = SigmaCompilationPipeline(verbose=False, fail_fast=False)
        command = L0InspectCommand(verbose=False)
        
        # Process batch
        for mlir_file in [VALID_MODULES[0], INVALID_MODULES[0], VALID_MODULES[1]]:
            if mlir_file.exists():
                with open(mlir_file, 'r') as f:
                    mlir_text = f.read()
                
                module_ir = command._parse_mlir_to_dict(mlir_text, mlir_file.stem)
                pipeline.compile_sigma_output(module_ir, emit_bytecode=False)
        
        # Verify results
        summary = pipeline.summary()
        
        # Gate: Summary must be meaningful
        assert len(summary) > 0
        
        # Gate: Pipeline tracks failures
        assert not pipeline.all_passed()  # We included an invalid module
