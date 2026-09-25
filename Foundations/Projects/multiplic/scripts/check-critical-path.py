#!/usr/bin/env python3
"""
Parse config/critical-path.yaml and report which services and endpoints are
in scope for critical-path CI gating.  Called by the critical-path-check
workflow to avoid hard-coding registry membership in workflow prose.

The canonical source of truth is config/critical-path.yaml.
Policy rationale lives in sites/aiistech/docs/adr/backend-v1-adr.md.

Usage:
  python3 scripts/check-critical-path.py
      Print the full critical-path membership and exit 0.

  python3 scripts/check-critical-path.py --service sites/aiistech/mock-backend
      Exit 0 if the service is in scope, 1 if not.

  python3 scripts/check-critical-path.py --list-services
      Print one service path per line (machine-readable) and exit 0.
"""
import argparse
import sys

try:
    import yaml
except ImportError:
    print("PyYAML not found — install it with: pip install pyyaml", file=sys.stderr)
    sys.exit(2)

REGISTRY_PATH = "config/critical-path.yaml"


def load_registry(path=REGISTRY_PATH):
    try:
        with open(path) as fh:
            return yaml.safe_load(fh)
    except FileNotFoundError:
        print(f"Registry not found: {path}", file=sys.stderr)
        sys.exit(2)
    except yaml.YAMLError as exc:
        print(f"Invalid YAML in {path}: {exc}", file=sys.stderr)
        sys.exit(2)


def validate_registry(registry):
    """Basic structural validation — fail fast on a malformed registry."""
    errors = []
    if not isinstance(registry.get("version"), int):
        errors.append("'version' must be an integer")
    if not registry.get("scope"):
        errors.append("'scope' is required")
    cp = registry.get("critical_path")
    if not isinstance(cp, dict):
        errors.append("'critical_path' must be a mapping")
    elif not isinstance(cp.get("services"), list) or not cp["services"]:
        errors.append("'critical_path.services' must be a non-empty list")
    if errors:
        for err in errors:
            print(f"Registry validation error: {err}", file=sys.stderr)
        sys.exit(2)


def main():
    parser = argparse.ArgumentParser(
        description="Check critical-path registry scope for CI gating."
    )
    parser.add_argument(
        "--service",
        metavar="SERVICE_PATH",
        help="Exit 0 if the service is in the critical-path registry, 1 if not.",
    )
    parser.add_argument(
        "--list-services",
        action="store_true",
        help="Print one in-scope service path per line and exit 0.",
    )
    args = parser.parse_args()

    registry = load_registry()
    validate_registry(registry)

    cp = registry["critical_path"]
    services = cp.get("services", [])
    endpoints = cp.get("endpoints", [])
    out_of_scope = registry.get("out_of_scope", {})
    oos_endpoints = [
        e.get("path") if isinstance(e, dict) else e
        for e in out_of_scope.get("endpoints", [])
    ]

    if args.list_services:
        for svc in services:
            print(svc)
        sys.exit(0)

    # Human-readable summary (always printed)
    print(f"Registry: {REGISTRY_PATH}")
    print(f"Scope: {registry.get('scope')}")
    print(f"Policy: {registry.get('policy', {})}")
    print(f"In-scope services ({len(services)}):")
    for svc in services:
        print(f"  - {svc}")
    print(f"In-scope endpoints ({len(endpoints)}):")
    for ep in endpoints:
        print(f"  - {ep}")
    if oos_endpoints:
        print(f"Out-of-scope endpoints ({len(oos_endpoints)}):")
        for ep in oos_endpoints:
            rule = None
            for item in out_of_scope.get("endpoints", []):
                if isinstance(item, dict) and item.get("path") == ep:
                    rule = item.get("rule")
                    break
            suffix = f" [{rule}]" if rule else ""
            print(f"  - {ep}{suffix}")

    if args.service:
        if args.service in services:
            print(f"\n✓ '{args.service}' is in the critical-path registry.")
            sys.exit(0)
        else:
            print(f"\n✗ '{args.service}' is NOT in the critical-path registry.", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
