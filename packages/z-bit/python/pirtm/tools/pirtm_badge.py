#!/usr/bin/env python3
"""PIRTM Badge Registry Tool

Usage:
  pirtm badge issue --module <name> --prime <p> --issuer <name> --out registry.json
  pirtm badge revoke --id <badge_id> --reason <text> --issuer <name> --out registry.json
  pirtm badge status --id <badge_id> --registry registry.json
  pirtm badge list --registry registry.json

This tool supports badge issuance + revocation for the PMD Badge Registry.
"""

import argparse
import json
from pathlib import Path
import sys

from pirtm.governance.badge_registry import BadgeRegistry


def cmd_issue(args: argparse.Namespace) -> int:
    # Enforce governance pipeline: require successful clone-check + audit trace
    if not args.clone_check_report:
        print("Error: --clone-check-report is required for badge issuance", file=sys.stderr)
        return 1
    if not args.audit_trace:
        print("Error: --audit-trace is required for badge issuance", file=sys.stderr)
        return 1

    clone_check_path = Path(args.clone_check_report)
    if not clone_check_path.exists():
        print(f"Error: Clone-check report not found: {clone_check_path}", file=sys.stderr)
        return 1

    try:
        with open(clone_check_path, "r", encoding="utf-8") as f:
            report = json.load(f)
    except Exception as e:
        print(f"Error: Failed to read clone-check report: {e}", file=sys.stderr)
        return 1

    status = report.get("status")
    if status != "PASS":
        print(f"Error: Clone-check status must be PASS (found: {status})", file=sys.stderr)
        return 1

    audit_path = Path(args.audit_trace)
    if not audit_path.exists():
        print(f"Error: Audit trace not found: {audit_path}", file=sys.stderr)
        return 1

    registry = BadgeRegistry.load(Path(args.registry))
    entry = registry.issue_badge(
        module_name=args.module,
        prime_index=args.prime,
        issued_by=args.issuer,
        certificate_id=args.certificate_id,
        clone_check_id=report.get("fingerprint") or "",
        audit_trace=str(audit_path),
        metadata=json.loads(args.metadata) if args.metadata else {},
    )
    registry.save(Path(args.registry))
    print(json.dumps(entry.to_dict(), indent=2))
    return 0


def cmd_revoke(args: argparse.Namespace) -> int:
    registry = BadgeRegistry.load(Path(args.registry))
    entry = registry.revoke_badge(args.id, args.reason, args.issuer)
    if entry is None:
        print(f"Badge not found: {args.id}", file=sys.stderr)
        return 1
    registry.save(Path(args.registry))
    print(json.dumps(entry.to_dict(), indent=2))
    return 0


def cmd_status(args: argparse.Namespace) -> int:
    registry = BadgeRegistry.load(Path(args.registry))
    entry = registry.get(args.id)
    if entry is None:
        print(f"Badge not found: {args.id}", file=sys.stderr)
        return 1
    print(json.dumps(entry.to_dict(), indent=2))
    return 0


def cmd_list(args: argparse.Namespace) -> int:
    registry = BadgeRegistry.load(Path(args.registry))
    entries = registry.list_all() if args.all else registry.list_active()
    print(json.dumps([e.to_dict() for e in entries], indent=2))
    return 0


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        description="PIRTM Badge Registry (ADR-025)"
    )
    subparsers = parser.add_subparsers(dest="command")

    issue = subparsers.add_parser("issue", help="Issue a new badge")
    issue.add_argument("--module", required=True, help="Module name")
    issue.add_argument("--prime", required=True, type=int, help="Prime index")
    issue.add_argument("--issuer", required=True, help="Issuer identity")
    issue.add_argument("--certificate-id", help="Optional certificate ID")
    issue.add_argument("--clone-check-id", help="Optional clone-check ID")
    issue.add_argument("--audit-trace", help="Path to audit trace JSONL (required)")
    issue.add_argument(
        "--clone-check-report",
        required=False,
        help="Path to clone-check JSON report (required)",
    )
    issue.add_argument("--metadata", help="Optional JSON metadata")
    issue.add_argument("--registry", required=True, help="Registry JSON path")
    issue.set_defaults(func=cmd_issue)

    revoke = subparsers.add_parser("revoke", help="Revoke an existing badge")
    revoke.add_argument("--id", required=True, help="Badge ID")
    revoke.add_argument("--reason", required=True, help="Revocation reason")
    revoke.add_argument("--issuer", required=True, help="Revoker identity")
    revoke.add_argument("--registry", required=True, help="Registry JSON path")
    revoke.set_defaults(func=cmd_revoke)

    status = subparsers.add_parser("status", help="Show badge status")
    status.add_argument("--id", required=True, help="Badge ID")
    status.add_argument("--registry", required=True, help="Registry JSON path")
    status.set_defaults(func=cmd_status)

    listp = subparsers.add_parser("list", help="List badge entries")
    listp.add_argument("--registry", required=True, help="Registry JSON path")
    listp.add_argument("--all", action="store_true", help="Include revoked badges")
    listp.set_defaults(func=cmd_list)

    args = parser.parse_args(argv)
    if not hasattr(args, "func"):
        parser.print_help()
        return 0

    return args.func(args)


if __name__ == '__main__':
    sys.exit(main())
