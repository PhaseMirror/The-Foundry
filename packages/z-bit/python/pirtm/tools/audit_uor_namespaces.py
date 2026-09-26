#!/usr/bin/env python3
"""
Phase 0 Namespace Audit Helper

This script extracts individual counts from UOR-Framework spec/src/namespaces/*.rs
and generates the updated uor_proxy_config.py with verified counts.

Usage:
  python audit_uor_namespaces.py /path/to/UOR-Framework/spec/src/namespaces
"""

import os
import re
import sys
from pathlib import Path
from typing import Dict, Tuple
import argparse

# Namespaces to audit (in order)
NAMESPACES_TO_AUDIT = [
    "u", "schema", "op", "query", "resolver", "type_", "partition",
    "homology", "cohomology", "proof", "derivation", "trace",
    "cert", "morphism"
]

# Already confirmed
CONFIRMED_COUNTS = {
    "observable": 8,  # ✅ Confirmed
    "state": 7,       # ✅ Confirmed (excluded)
}


def count_individuals_in_file(file_path: Path) -> Tuple[int, list]:
    """
    Count named items (types, functions, constants) in a Rust namespace file.
    
    Heuristic: Count lines that define public items:
      - pub struct
      - pub enum
      - pub const
      - pub fn
      - pub type
      - pub trait
    
    Args:
        file_path: Path to .rs file
    
    Returns:
        (count, matching_lines) tuple
            count: Number of individuals found
            matching_lines: Lines that matched
    """
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Regex to match public definitions (rough heuristic)
    # Matches: pub struct X, pub enum Y, pub const Z, pub fn f(), pub type T, pub trait Tr
    patterns = [
        r'^\s*pub\s+(struct|enum|const|fn|type|use|trait|async\s+fn)\s+(\w+)',
    ]
    
    matches = []
    for line_num, line in enumerate(content.split('\n'), 1):
        for pattern in patterns:
            if re.search(pattern, line):
                matches.append((line_num, line.strip()))
                break
    
    return len(matches), matches


def audit_namespace(namespace: str, namespaces_dir: Path) -> Tuple[int, bool]:
    """
    Audit a single namespace file.
    
    Args:
        namespace: Namespace name (e.g., "u", "schema", "op")
        namespaces_dir: Path to spec/src/namespaces/ directory
    
    Returns:
        (count, success) tuple
    """
    if namespace in CONFIRMED_COUNTS:
        return CONFIRMED_COUNTS[namespace], True
    
    # Filename pattern: u.rs, schema.rs, type_.rs, etc.
    file_path = namespaces_dir / f"{namespace}.rs"
    
    try:
        count, matches = count_individuals_in_file(file_path)
        return count, True
    except FileNotFoundError:
        print(f"❌ File not found: {file_path}", file=sys.stderr)
        return 0, False
    except Exception as e:
        print(f"❌ Error auditing {namespace}: {e}", file=sys.stderr)
        return 0, False


def generate_updated_config(counts: Dict[str, int]) -> str:
    """Generate Python code snippet for updated NAMESPACE_ASSEMBLY_ORDER."""
    code_lines = []
    
    namespace_data = [
        (1, "u", "kernel", 1),
        (2, "schema", "kernel", 1),
        (3, "op", "kernel", 1),
        (4, "query", "bridge", 1),
        (5, "resolver", "bridge", 1),
        (6, "type_", "bridge", 1),
        (7, "partition", "bridge", 1),
        (8, "observable", "bridge", 2),
        (9, "homology", "bridge", 2),
        (10, "cohomology", "bridge", 2),
        (11, "proof", "bridge", 2),
        (12, "derivation", "bridge", 2),
        (13, "trace", "bridge", 2),
        (14, "cert", "user", 3),
        (15, "morphism", "user", 3),
        (16, "state", "user", 0),
    ]
    
    code_lines.append("NAMESPACE_ASSEMBLY_ORDER: List[NamespaceStep] = [")
    
    for index, namespace, space, split in namespace_data:
        count = counts.get(namespace, -1)
        status = "✅" if count > 0 else "🔍"
        
        code_lines.append(f'    # Step {index}: {namespace} — {status}')
        code_lines.append(f"    NamespaceStep(")
        code_lines.append(f"        index={index},")
        code_lines.append(f'        prefix="{namespace}",')
        code_lines.append(f'        space="{space}",')
        code_lines.append(f"        individual_count={count},")
        code_lines.append(f"        split={split},")
        code_lines.append(f"    ),")
    
    code_lines.append("]")
    
    return "\n".join(code_lines)


def main():
    parser = argparse.ArgumentParser(
        description="Audit UOR-Framework namespaces and generate config"
    )
    parser.add_argument(
        "namespaces_dir",
        type=Path,
        help="Path to spec/src/namespaces directory"
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("namespaces_config.py"),
        help="Output file for generated config"
    )
    
    args = parser.parse_args()
    namespaces_dir = args.namespaces_dir
    
    if not namespaces_dir.exists():
        print(f"❌ Directory not found: {namespaces_dir}", file=sys.stderr)
        sys.exit(1)
    
    print("=" * 70)
    print("UOR NAMESPACE AUDIT")
    print("=" * 70)
    print(f"\nAuditing namespace directory: {namespaces_dir}\n")
    
    all_counts = {}
    successful = 0
    
    for namespace in NAMESPACES_TO_AUDIT + ["observable", "state"]:
        count, success = audit_namespace(namespace, namespaces_dir)
        all_counts[namespace] = count
        
        status = "✅" if success and count > 0 else "❌"
        print(f"{status} {namespace:12s}: {count:3d} individuals")
        
        if success and count > 0:
            successful += 1
    
    print("\n" + "=" * 70)
    print(f"Audit Summary: {successful}/16 namespaces verified")
    print("=" * 70)
    
    if successful == 16:
        print("\n✅ All namespaces audited successfully!")
        total = sum(count for ns, count in all_counts.items() if ns != "state")
        print(f"   Total individuals (active): {total}")
        
        print("\nGenerated config snippet:")
        print("-" * 70)
        config = generate_updated_config(all_counts)
        print(config)
        print("-" * 70)
        
        # Write to output file if requested
        if args.output:
            with open(args.output, 'w') as f:
                f.write("# Generated by audit_uor_namespaces.py\n\n")
                f.write(config)
            print(f"\n✅ Config written to {args.output}")
    else:
        print(f"\n⚠️  Only {successful}/16 namespaces audited.")
        print("   Re-run with correct path to spec/src/namespaces/")
        sys.exit(1)


if __name__ == "__main__":
    main()
