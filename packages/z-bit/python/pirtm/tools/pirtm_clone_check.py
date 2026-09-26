#!/usr/bin/env python3
"""PIRTM Clone-Check Automation Tool

Usage:
  pirtm clone-check --candidate <path> --reference <path> [--output report.json]

Output:
  - Human-readable report printed to stdout
  - Optional JSON report written to disk
"""

import argparse
import json
from pathlib import Path
import sys

from pirtm.governance.clone_check import clone_check_files


def format_report(result: dict) -> str:
    """Format the clone-check result as a human-readable report."""
    lines = []
    lines.append("Clone-Check Report")
    lines.append("=================")
    lines.append(f"Status: {result['status']}")
    lines.append(f"Token similarity: {result['token_similarity']:.4f}")
    lines.append(f"AST similarity: {result['ast_similarity']:.4f}")
    lines.append(f"Fingerprint: {result['fingerprint']}")
    lines.append("")

    if result['status'] == 'PASS':
        lines.append("Result: PASS — likely novel implementation")
    elif result['status'] == 'REVIEW':
        lines.append("Result: REVIEW — possible clone, needs human auditing")
    else:
        lines.append("Result: FAIL — likely clone (high similarity)")

    if 'details' in result:
        lines.append("")
        lines.append("Details:")
        for k, v in result['details'].items():
            lines.append(f"  {k}: {v}")

    return "\n".join(lines)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        description="PIRTM Clone-Check Automation (ADR-024)"
    )
    parser.add_argument(
        "--candidate",
        required=True,
        help="Path to candidate file to check",
    )
    parser.add_argument(
        "--reference",
        required=True,
        help="Path to reference file to compare against",
    )
    parser.add_argument(
        "--output",
        help="Optional path to write JSON report",
    )
    args = parser.parse_args(argv)

    result = clone_check_files(args.candidate, args.reference)
    result_dict = {
        "status": result.status,
        "token_similarity": result.token_similarity,
        "ast_similarity": result.ast_similarity,
        "fingerprint": result.fingerprint,
        "details": result.details,
    }

    print(format_report(result_dict))

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(result_dict, f, indent=2)

    return 0


if __name__ == '__main__':
    sys.exit(main())
