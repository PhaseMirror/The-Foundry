#!/usr/bin/env python3
"""PIRTM ACF review summary tool.

Emits stable reviewer-facing JSON summaries for ADR-029 fixtures.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

from aspectual_counting import (
    AuxiliaryHypergraphSummary,
    certified_tail_family_fixture,
    four_edge_mixed_size_certified_tail_family_fixture,
    high_fractional_auxiliary_hypergraph_fixture,
    mixed_size_certified_tail_family_fixture,
    overlapping_certified_tail_family_fixture,
    serialize_auxiliary_hypergraph_summary,
)


def _summary_from_certified_fixture(fixture_builder) -> AuxiliaryHypergraphSummary:
    hypergraph, weights, candidates, k, r = fixture_builder()
    result = hypergraph.certify_unavoidable_constraints(weights, candidates)
    return hypergraph.build_auxiliary_hypergraph_summary(weights, k, result.certified_constraints, r)


def build_summary(fixture_name: str) -> AuxiliaryHypergraphSummary:
    if fixture_name == "certified-tail":
        return _summary_from_certified_fixture(certified_tail_family_fixture)
    if fixture_name == "overlapping-tail":
        return _summary_from_certified_fixture(overlapping_certified_tail_family_fixture)
    if fixture_name == "mixed-size":
        return _summary_from_certified_fixture(mixed_size_certified_tail_family_fixture)
    if fixture_name == "four-edge-mixed":
        return _summary_from_certified_fixture(four_edge_mixed_size_certified_tail_family_fixture)
    if fixture_name == "high-fractional-direct":
        auxiliary = high_fractional_auxiliary_hypergraph_fixture()
        return AuxiliaryHypergraphSummary(
            auxiliary_hypergraph=auxiliary,
            integral_matching_number=auxiliary.integral_matching_number(),
            fractional_matching_lower_bound=auxiliary.fractional_matching_lower_bound(),
        )
    raise ValueError(f"Unknown ACF review fixture: {fixture_name}")


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        description="Emit stable reviewer-facing JSON summaries for ADR-029 ACF fixtures"
    )
    parser.add_argument(
        "--fixture",
        required=True,
        choices=[
            "certified-tail",
            "overlapping-tail",
            "mixed-size",
            "four-edge-mixed",
            "high-fractional-direct",
        ],
        help="Named ADR-029 fixture to summarize",
    )
    parser.add_argument(
        "--output",
        help="Optional output JSON path (prints to stdout if omitted)",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Pretty-print JSON instead of emitting the stable compact form",
    )
    args = parser.parse_args(argv)

    try:
        summary = build_summary(args.fixture)
        serialized = serialize_auxiliary_hypergraph_summary(summary)
        if args.pretty:
            serialized = json.dumps(json.loads(serialized), indent=2, sort_keys=True)

        if args.output:
            output_path = Path(args.output)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_text(serialized + "\n", encoding="utf-8")
        else:
            print(serialized)
        return 0
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())