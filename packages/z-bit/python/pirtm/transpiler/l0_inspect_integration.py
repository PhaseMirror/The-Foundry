"""
ADR-012 Phase 2: L0 Verification CLI Integration

Extended `pirtm inspect` command with L0 invariant verification reporting.

Adds:
  pirtm inspect --l0-verify module.mlir      # Verify Sigma output for L0 compliance
  pirtm inspect --l0-report module.mlir      # Full L0 audit report (human-readable)
  pirtm inspect --l0-json module.mlir        # L0 audit in JSON format
  
Example Output:
  
  $ pirtm inspect --l0-verify gft_melonic.mlir
  
  L0 Invariant Audit Report
  ==================================================
  Module: gft_melonic_phi6_k_1e16
  Status: ✅ ALL CHECKS PASSED (8/8)
  
  Check 1: Single prime index
    ✅ PASS   prime_index = 2 (single, unique)
  
  Check 2: Pass sequencing  
    ✅ PASS   Passes ordered: sigma-verify → contractivity-check
  
  Check 3: Cert is prime-typed
    ✅ PASS   1 certificate found (type: !pirtm.cert<prime_mod:2>)
  
  [...6 more checks...]
  
  Audit Chain: NOT EMBEDDED — retrieve via pirtm audit <trace.log>
  ==================================================
"""

from typing import Dict, Any, Optional
from pathlib import Path
import json
import re
import sys

from pirtm.mlir.sigma_l0_verifier import SigmaL0Verifier, L0CheckResult, L0AuditReport


class L0InspectFormatter:
    """Format L0 audit reports for human and machine consumption."""
    
    @staticmethod
    def format_table(report: L0AuditReport, width: int = 50) -> str:
        """
        Format audit report as a clean ASCII table.
        
        Returns human-readable table suitable for terminal output.
        """
        lines = [
            "",
            "L0 Invariant Audit Report",
            "=" * width,
            f"Module: {report.module_name}",
        ]
        
        # Status line with color codes for terminal
        if report.all_pass:
            status_line = f"Status: ✅ ALL CHECKS PASSED ({len([c for c in report.checks.values() if c.status != L0CheckResult.SKIP])}/{len(report.checks)})"
        else:
            failed_count = len(report.failed_checks)
            total = len([c for c in report.checks.values() if c.status != L0CheckResult.SKIP])
            status_line = f"Status: ❌ {failed_count} FAILURES ({total - failed_count}/{total} passed)"
        
        lines.append(status_line)
        lines.append("")
        
        # Each check on a table row
        for check_num in sorted(report.checks.keys()):
            check = report.checks[check_num]
            if check.status == L0CheckResult.SKIP:
                continue
            
            symbol = "✅" if check.status == L0CheckResult.PASS else "❌"
            status_str = "PASS" if check.status == L0CheckResult.PASS else "FAIL"
            
            lines.append(f"Check {check_num}: {check.name}")
            lines.append(f"  {symbol} {status_str:4s}  {check.message}")
            
            if check.location:
                lines.append(f"           @ {check.location}")
            
            if check.evidence:
                lines.append(f"           evidence: {check.evidence}")
            
            lines.append("")
        
        # Summary
        summary = report.summary()
        lines.extend([
            summary,
            "Audit Chain: NOT EMBEDDED — retrieve via pirtm audit <trace.log>",
            "=" * width,
        ])
        
        return "\n".join(lines)
    
    @staticmethod
    def format_json(report: L0AuditReport) -> str:
        """
        Format audit report as JSON for programmatic consumption.
        
        Returns JSON string with full report details.
        """
        checks_data = {}
        for check_num, check in report.checks.items():
            checks_data[str(check_num)] = {
                "name": check.name,
                "status": check.status.value,
                "message": check.message,
                "location": check.location,
                "evidence": check.evidence,
            }
        
        output = {
            "module_name": report.module_name,
            "all_pass": report.all_pass,
            "summary": report.summary(),
            "checks": checks_data,
            "failed_checks": [
                {
                    "invariant": c.invariant_num,
                    "name": c.name,
                    "message": c.message,
                }
                for c in report.failed_checks
            ],
            "audit_chain_line": f"Audit Chain: NOT EMBEDDED — retrieve via pirtm audit <{report.module_name}.trace.log>",
        }
        
        return json.dumps(output, indent=2)
    
    @staticmethod
    def format_brief(report: L0AuditReport) -> str:
        """
        Format audit report as a single-line summary.
        
        Returns compact one-liner suitable for log files.
        """
        status = "✅ PASS" if report.all_pass else f"❌ FAIL ({len(report.failed_checks)} violations)"
        return f"{report.module_name}: {report.summary()} — {status}"


class L0InspectCommand:
    """Enhanced `pirtm inspect` subcommand for L0 verification."""
    
    def __init__(self, verbose: bool = False):
        """Initialize inspect command."""
        self.verbose = verbose
        self.verifier = SigmaL0Verifier(verbose=verbose, fail_fast=False)
    
    def inspect_mlir_file(
        self,
        filepath: Path,
        verify_l0: bool = False,
        report_format: str = "table"  # table, json, brief
    ) -> int:
        """
        Inspect MLIR file with optional L0 verification.
        
        Args:
            filepath: Path to .mlir file
            verify_l0: If True, run L0 verification
            report_format: Output format (table, json, brief)
        
        Returns:
            Exit code (0 = success, 1 = failure or L0 violations)
        """
        try:
            # Read MLIR file
            with open(filepath, "r") as f:
                mlir_text = f.read()
            
            if not verify_l0:
                # Just print the file
                print(mlir_text)
                return 0
            
            # Parse MLIR to module dict
            module_ir = self._parse_mlir_to_dict(mlir_text, filepath.stem)
            
            # Run L0 verification
            if self.verbose:
                print(f"Verifying {filepath.stem} against 8 L0 invariants...")
            
            report = self.verifier.verify_module(module_ir)
            
            # Format and print report
            if report_format == "json":
                output = L0InspectFormatter.format_json(report)
            elif report_format == "brief":
                output = L0InspectFormatter.format_brief(report)
            else:  # table
                output = L0InspectFormatter.format_table(report)
            
            print(output)
            
            # Return success/failure code
            return 0 if report.all_pass else 1
        
        except Exception as e:
            print(f"Error inspecting {filepath}: {e}", file=sys.stderr)
            return 1
    
    def _parse_mlir_to_dict(self, mlir_text: str, module_name: str) -> Dict[str, Any]:
        """
        Convert MLIR text to module dict for verification.
        
        Extracts:
        - Attributes (prime_index, epsilon, op_norm_T, etc.)
        - Operations (pirtm.cumulant_embed, pirtm.cert, etc.)
        """
        module_ir: Dict[str, Any] = {
            "name": module_name,
            "attributes": {},
            "operations": [],
        }
        
        # Extract module-level attributes from comments and attribute delimiters
        # Pattern: attribute "key" = <value>
        attr_pattern = r'%\d+ = "([^"]+)" = ([^\n]+)'
        attr_pattern2 = r'attributes\s*\{\s*([^}]+)\s*\}'
        
        # Look for attributes marked with # @
        for line in mlir_text.split('\n'):
            # Extract prime_index
            if 'prime_index' in line:
                match = re.search(r'prime_index["\']?\s*[=:]\s*(\d+)', line)
                if match:
                    module_ir["attributes"]["prime_index"] = int(match.group(1))
            
            # Extract epsilon
            if 'epsilon' in line.lower():
                match = re.search(r'epsilon["\']?\s*[=:]\s*([\d.]+)', line)
                if match:
                    module_ir["attributes"]["epsilon"] = float(match.group(1))

            # Extract op_norm_T
            if 'op_norm' in line.lower():
                match = re.search(
                    r'op_norm[_t]*["\']?\s*[=:]\s*([\d.]+)',
                    line,
                    re.IGNORECASE,
                )
                if match:
                    module_ir["attributes"]["op_norm_T"] = float(match.group(1))
            
            # Extract operations (single-line; multi-line handled below)
            if 'pirtm.' in line and '%' in line:
                op_dict = self._parse_mlir_op(line)
                if op_dict:
                    module_ir["operations"].append(op_dict)

        # Second pass: collect multi-line op blocks (e.g. pirtm.spectral_cert with {…})
        lines = mlir_text.split('\n')
        i = 0
        while i < len(lines):
            line = lines[i]
            if 'pirtm.' in line and '%' in line:
                open_count = line.count('{') - line.count('}')
                if open_count > 0:
                    # Multi-line block: accumulate until braces balance
                    block_lines = [line]
                    j = i + 1
                    while j < len(lines) and open_count > 0:
                        block_lines.append(lines[j])
                        open_count += lines[j].count('{') - lines[j].count('}')
                        j += 1
                    block_text = '\n'.join(block_lines)
                    op_dict = self._parse_mlir_op_block(block_text)
                    if op_dict:
                        # Replace single-line entry already added, if any
                        for existing in module_ir["operations"]:
                            if existing.get("name") == op_dict.get("name"):
                                existing["attributes"].update(op_dict["attributes"])
                                op_dict = None
                                break
                        if op_dict:
                            module_ir["operations"].append(op_dict)
                    i = j
                    continue
            i += 1
        return module_ir
    
    def _parse_mlir_op(self, line: str) -> Optional[Dict[str, Any]]:
        """Parse a single MLIR operation line."""
        # Extract operation name
        op_match = re.search(r'"(pirtm\.[^"]+)"', line)
        if not op_match:
            return None
        
        op_name = op_match.group(1)
        op_dict: Dict[str, Any] = {
            "name": op_name,
            "attributes": {},
        }
        
        # Extract attributes from operation
        # Pattern: key = value or key : value
        attr_pattern = r'(\w+)\s*[:=]\s*(["\']?)([^,\}"\'\s]+)\2'
        
        for match in re.finditer(attr_pattern, line):
            key = match.group(1)
            value = match.group(3)
            
            # Try to parse as number
            try:
                if '.' in value:
                    op_dict["attributes"][key] = float(value)
                else:
                    op_dict["attributes"][key] = int(value)
            except ValueError:
                # Keep as string
                op_dict["attributes"][key] = value
        
        return op_dict if op_dict["attributes"] else None

    def _parse_mlir_op_block(self, block: str) -> Optional[Dict[str, Any]]:
        """
        Parse a multi-line MLIR op block (op header + { attr... } body).
        Collects attributes from all lines in the block and adds them to
        the op dict produced by _parse_mlir_op from the first line.
        """
        first_line = block.split('\n')[0]
        op_dict = self._parse_mlir_op(first_line)
        if op_dict is None:
            # Try creating a minimal dict from the first line op name
            op_match = re.search(r'"(pirtm\.[^"]+)"', first_line)
            if not op_match:
                return None
            op_dict = {"name": op_match.group(1), "attributes": {}}

        attr_pattern = r'(\w+)\s*=\s*(-?[\d]+(?:\.[\d]+)?)\s*:'
        for line in block.split('\n')[1:]:
            stripped = line.strip()
            if not stripped or stripped.startswith('//') or stripped in ('{', '}'):
                continue
            for match in re.finditer(attr_pattern, stripped):
                key = match.group(1)
                raw = match.group(2)
                try:
                    op_dict["attributes"][key] = float(raw) if '.' in raw else int(raw)
                except ValueError:
                    op_dict["attributes"][key] = raw

        return op_dict if op_dict["attributes"] else None


def add_l0_verify_to_inspect_parser(inspect_subparser):
    """
    Add L0 verification arguments to the inspect subcommand parser.
    
    Call this during CLI parser setup to add:
      --l0-verify       Enable L0 verification
      --l0-format       Output format (table, json, brief)
      --l0-verbose      Verbose L0 verification
    """
    inspect_subparser.add_argument(
        "--l0-verify",
        action="store_true",
        help="Verify module against L0 invariants (Sigma-specific)",
    )
    
    inspect_subparser.add_argument(
        "--l0-format",
        type=str,
        choices=["table", "json", "brief"],
        default="table",
        help="L0 report format (default: table)",
    )
    
    inspect_subparser.add_argument(
        "--l0-verbose",
        action="store_true",
        help="Verbose L0 verification with detailed diagnostics",
    )
    
    inspect_subparser.add_argument(
        "--l0-fail-fast",
        action="store_true",
        default=False,
        help="Stop at first L0 violation (default: collect all)",
    )
