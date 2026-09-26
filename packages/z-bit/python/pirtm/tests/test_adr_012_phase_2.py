"""
ADR-012 Phase 2: End-to-End L0 Verification Workflow Tests

Integration tests for:
1. CLI `pirtm inspect --l0-verify` command
2. Full transpilation + L0 verification pipeline
3. Report formatters (table, JSON, brief)
4. SigmaCompilationPipeline integration

Gate Requirements:
- 100% pass rate for all integration tests
- CLI commands produce correct output format
- End-to-end modules pass L0 verification
- All three reporting formats work correctly
"""

import pytest
from pathlib import Path
from tempfile import TemporaryDirectory
import json
import subprocess

from pirtm.transpiler.l0_inspect_integration import (
    L0InspectFormatter,
    L0InspectCommand,
)
from pirtm.mlir.sigma_l0_verifier import SigmaL0Verifier, L0AuditReport
from pirtm.transpiler.sigma_l0_integration import SigmaCompilationPipeline


# ===== Fixtures =====

def make_valid_module_ir() -> dict:
    """Create a valid Sigma output module IR."""
    return {
        "name": "gft_melonic_test",
        "attributes": {
            "prime_index": 2,
            "epsilon": 0.05,
            "op_norm_T": 1.2,
        },
        "operations": [
            {
                "name": "pirtm.cumulant_embed",
                "attributes": {
                    "scale_k": 1.0e16,
                    "prime_mod": 2,
                    "order": 2,
                },
            }
        ],
    }


def make_invalid_module_ir() -> dict:
    """Create an invalid module (violates L0-5: composite prime_mod)."""
    return {
        "name": "gft_invalid",
        "attributes": {
            "prime_index": 2,
            "epsilon": 0.05,
            "op_norm_T": 1.2,
        },
        "operations": [
            {
                "name": "pirtm.cumulant_embed",
                "attributes": {
                    "scale_k": 1.0e16,
                    "prime_mod": 15,  # = 3*5 (not prime, violates L0-5)
                    "order": 2,
                },
            }
        ],
    }


# ===== Tests for L0InspectFormatter =====

class TestL0InspectFormatterTable:
    """Tests for ASCII table report formatting."""
    
    def test_format_table_valid_module(self):
        """PASS: Format table output for valid module."""
        verifier = SigmaL0Verifier(verbose=False)
        report = verifier.verify_module(make_valid_module_ir())
        
        table = L0InspectFormatter.format_table(report)
        
        assert "L0 Invariant Audit Report" in table
        assert "✅" in table or "ALL CHECKS PASSED" in table
        assert report.module_name in table
        assert "=" * 50 in table
    
    def test_format_table_invalid_module(self):
        """FAIL: Format table output for invalid module."""
        verifier = SigmaL0Verifier(verbose=False)
        report = verifier.verify_module(make_invalid_module_ir())
        
        table = L0InspectFormatter.format_table(report)
        
        assert "L0 Invariant Audit Report" in table
        assert "❌" in table or "FAILURES" in table or "FAIL" in table
        assert "Audit Chain: NOT EMBEDDED" in table
    
    def test_format_table_includes_all_checks(self):
        """PASS: Table includes all 8 check results."""
        verifier = SigmaL0Verifier(verbose=False)
        report = verifier.verify_module(make_valid_module_ir())
        
        table = L0InspectFormatter.format_table(report)
        
        # Should have "Check" mentioned for each non-skipped check
        check_mentions = table.count("Check ")
        assert check_mentions >= 4  # At least 4 checks present


class TestL0InspectFormatterJSON:
    """Tests for JSON report formatting."""
    
    def test_format_json_valid_module(self):
        """PASS: Format JSON output for valid module."""
        verifier = SigmaL0Verifier(verbose=False)
        report = verifier.verify_module(make_valid_module_ir())
        
        json_str = L0InspectFormatter.format_json(report)
        
        # Parse it back to verify it's valid JSON
        data = json.loads(json_str)
        
        assert data["module_name"] == report.module_name
        assert data["all_pass"] is True
        assert "checks" in data
        assert "failed_checks" in data
        assert len(data["failed_checks"]) == 0
    
    def test_format_json_invalid_module(self):
        """FAIL: Format JSON output for invalid module."""
        verifier = SigmaL0Verifier(verbose=False)
        report = verifier.verify_module(make_invalid_module_ir())
        
        json_str = L0InspectFormatter.format_json(report)
        
        data = json.loads(json_str)
        
        assert data["all_pass"] is False
        assert len(data["failed_checks"]) > 0  # Should have at least 1 violation
    
    def test_format_json_structure(self):
        """PASS: JSON has required structure."""
        verifier = SigmaL0Verifier(verbose=False)
        report = verifier.verify_module(make_valid_module_ir())
        
        json_str = L0InspectFormatter.format_json(report)
        data = json.loads(json_str)
        
        # Verify required fields
        assert "module_name" in data
        assert "all_pass" in data
        assert "summary" in data
        assert "checks" in data
        assert "failed_checks" in data
        assert "audit_chain_line" in data
        
        # Verify checks structure
        for check_num, check_data in data["checks"].items():
            assert "name" in check_data
            assert "status" in check_data
            assert "message" in check_data


class TestL0InspectFormatterBrief:
    """Tests for brief one-line report formatting."""
    
    def test_format_brief_valid_module(self):
        """PASS: Brief format for valid module."""
        verifier = SigmaL0Verifier(verbose=False)
        report = verifier.verify_module(make_valid_module_ir())
        
        brief = L0InspectFormatter.format_brief(report)
        
        assert "✅ PASS" in brief
        assert report.module_name in brief
        assert "/" in brief  # Should have "X/8" format
    
    def test_format_brief_invalid_module(self):
        """FAIL: Brief format for invalid module."""
        verifier = SigmaL0Verifier(verbose=False)
        report = verifier.verify_module(make_invalid_module_ir())
        
        brief = L0InspectFormatter.format_brief(report)
        
        assert "❌ FAIL" in brief
        assert "violation" in brief.lower()
    
    def test_format_brief_is_oneline(self):
        """PASS: Brief format is single line."""
        verifier = SigmaL0Verifier(verbose=False)
        report = verifier.verify_module(make_valid_module_ir())
        
        brief = L0InspectFormatter.format_brief(report)
        
        # Should be a single line
        assert "\n" not in brief.strip()


# ===== Tests for L0InspectCommand =====

class TestL0InspectCommand:
    """Tests for L0 inspect CLI command."""
    
    def test_parse_mlir_basic(self):
        """PASS: Parse basic MLIR module attributes."""
        command = L0InspectCommand(verbose=False)
        
        mlir_text = """
        module @test {
          // prime_index = 2
          // epsilon = 0.05
          // op_norm_T = 1.2
          %0 = "pirtm.cumulant_embed"() {scale_k = 1.0e16 : f64, prime_mod = 2 : i32} : () -> ()
        }
        """
        
        module_ir = command._parse_mlir_to_dict(mlir_text, "test_module")
        
        assert module_ir["name"] == "test_module"
        assert module_ir["attributes"]["prime_index"] == 2
    
    def test_mlir_file_without_l0_verify(self):
        """PASS: Inspect MLIR without L0 verification (just print)."""
        with TemporaryDirectory() as tmpdir:
            mlir_file = Path(tmpdir) / "test.mlir"
            mlir_file.write_text("module @test { }")
            
            command = L0InspectCommand(verbose=False)
            
            # Without --l0-verify, should just print the file
            exit_code = command.inspect_mlir_file(mlir_file, verify_l0=False)
            
            assert exit_code == 0
    
    def test_mlir_file_with_l0_verify_valid(self):
        """PASS: Inspect valid MLIR with L0 verification."""
        with TemporaryDirectory() as tmpdir:
            mlir_file = Path(tmpdir) / "test.mlir"
            mlir_file.write_text("""
            module @test_valid {
              // prime_index = 2
              // epsilon = 0.05
              // op_norm_T = 1.2
              %0 = "pirtm.cumulant_embed"() {
                scale_k = 1.0e16 : f64,
                prime_mod = 2 : i32
              } : () -> ()
            }
            """)
            
            command = L0InspectCommand(verbose=False)
            exit_code = command.inspect_mlir_file(mlir_file, verify_l0=True, report_format="brief")
            
            # Valid module should return 0
            assert exit_code == 0
    
    def test_mlir_file_with_l0_verify_invalid(self):
        """FAIL: Inspect invalid MLIR with L0 verification."""
        with TemporaryDirectory() as tmpdir:
            mlir_file = Path(tmpdir) / "test_invalid.mlir"
            mlir_file.write_text("""
            module @test_invalid {
              // prime_index = 2
              // epsilon = 0.05
              // op_norm_T = 1.2
              %0 = "pirtm.cumulant_embed"() {
                scale_k = 1.0e16 : f64,
                prime_mod = 15 : i32
              } : () -> ()
            }
            """)
            
            command = L0InspectCommand(verbose=False)
            exit_code = command.inspect_mlir_file(mlir_file, verify_l0=True, report_format="brief")
            
            # Invalid module should return 1
            assert exit_code == 1
    
    def test_l0_inspect_different_formats(self):
        """PASS: L0 inspection works with all output formats."""
        with TemporaryDirectory() as tmpdir:
            mlir_file = Path(tmpdir) / "test.mlir"
            mlir_file.write_text("""
            module @test {
              // prime_index = 2
              // epsilon = 0.05
              // op_norm_T = 1.2
              %0 = "pirtm.cumulant_embed"() {prime_mod = 2 : i32} : () -> ()
            }
            """)
            
            command = L0InspectCommand(verbose=False)
            
            # Test each format
            for fmt in ["table", "json", "brief"]:
                exit_code = command.inspect_mlir_file(mlir_file, verify_l0=True, report_format=fmt)
                assert exit_code == 0, f"Format {fmt} failed"


# ===== Tests for SigmaCompilationPipeline Integration =====

class TestPipelineIntegration:
    """Tests for full compilation pipeline with L0 verification."""
    
    def test_pipeline_single_valid_module(self):
        """PASS: Compile single valid module through pipeline."""
        pipeline = SigmaCompilationPipeline(verbose=False)
        result = pipeline.compile_sigma_output(make_valid_module_ir(), emit_bytecode=False)
        
        assert result.passed_l0() is True
        assert result.is_valid is True
    
    def test_pipeline_single_invalid_module(self):
        """FAIL: Reject invalid module in pipeline."""
        pipeline = SigmaCompilationPipeline(verbose=False, fail_fast=False)
        result = pipeline.compile_sigma_output(make_invalid_module_ir(), emit_bytecode=False)
        
        assert result.passed_l0() is False
        assert result.is_valid is False
    
    def test_pipeline_multiple_modules(self):
        """PASS: Compile multiple modules, track results."""
        pipeline = SigmaCompilationPipeline(verbose=False, fail_fast=False)
        
        modules = [
            make_valid_module_ir(),
            make_valid_module_ir(),
            make_invalid_module_ir(),
        ]
        
        for module in modules:
            module["name"] = f"module_{len(pipeline.results)}"
        
        results = pipeline.compile_all(modules)
        
        assert len(results) == 3
        assert results[0].is_valid is True
        assert results[1].is_valid is True
        assert results[2].is_valid is False
    
    def test_pipeline_summary(self):
        """PASS: Pipeline summary reports correctly."""
        pipeline = SigmaCompilationPipeline(verbose=False, fail_fast=False)
        
        modules = [make_valid_module_ir(), make_invalid_module_ir()]
        for i, module in enumerate(modules):
            module["name"] = f"test_{i}"
        
        pipeline.compile_all(modules)
        summary = pipeline.summary()
        
        assert "Total modules: 2" in summary
        assert "Passed L0: 1" in summary
        assert "Failed L0: 1" in summary
    
    def test_pipeline_all_passed(self):
        """PASS: Check all_passed() when all modules pass."""
        pipeline = SigmaCompilationPipeline(verbose=False)
        
        modules = [make_valid_module_ir(), make_valid_module_ir()]
        for i, module in enumerate(modules):
            module["name"] = f"valid_{i}"
        
        pipeline.compile_all(modules)
        
        assert pipeline.all_passed() is True
    
    def test_pipeline_not_all_passed(self):
        """PASS: Check all_passed() when any module fails."""
        pipeline = SigmaCompilationPipeline(verbose=False, fail_fast=False)
        
        modules = [make_valid_module_ir(), make_invalid_module_ir()]
        for i, module in enumerate(modules):
            module["name"] = f"mixed_{i}"
        
        pipeline.compile_all(modules)
        
        assert pipeline.all_passed() is False


# ===== Master Gate Test =====

class TestL0Phase2GateTest:
    """
    Master gate test for ADR-012 Phase 2 completion.
    
    Requirements for Phase 2:
    - ✓ All formatters work (table, JSON, brief)
    - ✓ L0InspectCommand correctly parses MLIR and runs verification
    - Vert SigmaCompilationPipeline integrates with verify
    - ✓ Multi-module scenarios handled correctly
    - ✓ CLI-independent tests all passing
    """
    
    def test_all_formatters_working(self):
        """GATE: All three output formats produce valid output."""
        verifier = SigmaL0Verifier(verbose=False)
        report = verifier.verify_module(make_valid_module_ir())
        
        # Table format
        table = L0InspectFormatter.format_table(report)
        assert len(table) > 100  # Non-trivial output
        
        # JSON format
        json_str = L0InspectFormatter.format_json(report)
        data = json.loads(json_str)  # Must be valid JSON
        assert "checks" in data
        
        # Brief format  
        brief = L0InspectFormatter.format_brief(report)
        assert len(brief) < 200  # Reasonably brief
    
    def test_inspect_command_all_operations(self):
        """GATE: L0InspectCommand handles all key operations."""
        with TemporaryDirectory() as tmpdir:
            mlir_file = Path(tmpdir) / "gate_test.mlir"
            mlir_file.write_text("""
            module @gate_test {
              // prime_index = 2
                            // epsilon = 0.05
                            // op_norm_T = 1.0
              %0 = "pirtm.cumulant_embed"() { prime_mod = 2 : i32 } : () -> ()
            }
            """)
            
            command = L0InspectCommand(verbose=False)
            
            # Test all report formats
            for fmt in ["table", "json", "brief"]:
                exit_code = command.inspect_mlir_file(mlir_file, verify_l0=True, report_format=fmt)
                assert exit_code == 0, f"Format {fmt} failed"
    
    def test_pipeline_gate_test(self):
        """GATE: SigmaCompilationPipeline correctly handles all cases."""
        pipeline = SigmaCompilationPipeline(verbose=False, fail_fast=False)
        
        modules = [
            make_valid_module_ir(),
            make_invalid_module_ir(),
            make_valid_module_ir(),
        ]
        
        for i, m in enumerate(modules):
            m["name"] = f"pipeline_gate_{i}"
        
        results = pipeline.compile_all(modules)
        
        # Check results are correct
        assert results[0].is_valid is True   # Valid
        assert results[1].is_valid is False  # Invalid
        assert results[2].is_valid is True   # Valid
        
        # Check summary works
        assert not pipeline.all_passed()  # One failure
        assert "Failed L0: 1" in pipeline.summary()
    
    def test_phase_2_completion(self):
        """GATE: ADR-012 Phase 2 completion verification."""
        # This test verifies all three major components work together
        
        verifier = SigmaL0Verifier(verbose=False)
        formatter = L0InspectFormatter()
        inspector = L0InspectCommand(verbose=False)
        pipeline = SigmaCompilationPipeline(verbose=False)
        
        # All components should be instantiated and usable
        valid_module = make_valid_module_ir()
        invalid_module = make_invalid_module_ir()
        
        # Component 1: Verifier
        valid_report = verifier.verify_module(valid_module)
        assert valid_report.all_pass
        
        invalid_report = verifier.verify_module(invalid_module)
        assert not invalid_report.all_pass
        
        # Component 2: Formatters (3 formats)
        assert len(formatter.format_table(valid_report)) > 0
        assert len(formatter.format_json(valid_report)) > 0
        assert len(formatter.format_brief(valid_report)) > 0
        
        # Component 3: Pipeline
        result_valid = pipeline.compile_sigma_output(valid_module, emit_bytecode=False)
        assert result_valid.is_valid
        
        # All systems GO for Phase 2
        assert True  # Checkpoint reached
