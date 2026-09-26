# ACF Reviewer Guide

This note explains how to read Aspectual Counting Framework outputs from the PIRTM review surface without consulting the ADR text.

## What Reviewers Will See

The current reviewer-facing ACF surface consists of three layers:

1. `HeuristicConstraintProposal`
2. `CertifiedUnavoidableConstraint`
3. `AuxiliaryHypergraphSummary`

These layers should be interpreted in that order.

## Heuristic vs Certified

`HeuristicConstraintProposal` means a candidate family was tested for coverage.

- It is useful for understanding the search process.
- It is not a proof-carrying result.
- It must not be treated as an unavoidable constraint.

`CertifiedUnavoidableConstraint` means the local soundness check succeeded.

- It is the proof-carrying ACF output.
- It supports the claim that every optimal feasible selection must intersect the reported set.
- It is the only ACF artifact class that reviewers should treat as mathematically established.

Operational rule:

- Heuristic candidates show what was explored.
- Certified constraints show what the math proved.

## Reading Auxiliary Hypergraphs

`AuxiliaryHypergraphSummary` packages the tail-family lower-bound surface into a stable JSON form.

It contains:

- `auxiliary_hypergraph.vertices`
- `auxiliary_hypergraph.hyperedges`
- `integral_matching_number`
- `fractional_matching_lower_bound`

### Vertices

Vertices are the tail elements relevant at the selected `k` level.

- A vertex may appear because it is part of the tail set even if it does not occur in every certified hyperedge.
- The vertex list is therefore broader than any single certified family.

Interpretation:

- vertices = the tail region under review

### Hyperedges

Each hyperedge is a certified unavoidable tail family.

- If a hyperedge appears in the summary, it passed certification.
- Hyperedges may have different sizes.
- Mixed edge sizes mean the certification surface found unavoidable families of different arities.

Interpretation:

- hyperedges = certified tail families that every optimal feasible selection must hit

## Reading the Lower Bounds

### Integral matching number

`integral_matching_number` is the size of the largest set of pairwise disjoint certified hyperedges.

Interpretation:

- at least this many tail hits are forced by disjoint certified constraints alone

### Fractional matching lower bound

`fractional_matching_lower_bound` is a stronger lower bound computed from the auxiliary hypergraph's fractional matching problem.

It is emitted in three forms:

- `numerator`
- `denominator`
- `rational`

Interpretation:

- this is the reviewer-facing rational lower bound
- it is never weaker than the integral matching number
- if it is strictly larger than the integral matching number, overlapping certified families are forcing more structure than disjoint packing alone can show

Examples:

- `1` means the lower-bound geometry is no stronger than forcing one tail hit.
- `3/2` means overlap structure increases the lower bound beyond a single disjoint certified edge.
- `2` means the auxiliary geometry forces at least two tail hits at the fractional level.

### Example JSON Summaries

The serializer emits stable JSON. Two representative cases are shown below.

`3/2` case:

```json
{
	"auxiliary_hypergraph": {
		"hyperedges": [
			["'u'", "'v'"],
			["'t'", "'u'", "'w'"],
			["'t'", "'v'", "'w'"],
			["'u'", "'v'", "'w'"]
		],
		"vertices": ["'b'", "'c'", "'t'", "'u'", "'v'", "'w'"]
	},
	"fractional_matching_lower_bound": {
		"denominator": 2,
		"numerator": 3,
		"rational": "3/2"
	},
	"integral_matching_number": 1
}
```

`2` case:

```json
{
	"auxiliary_hypergraph": {
		"hyperedges": [
			["'u'", "'v'"],
			["'u'", "'x'"],
			["'v'", "'w'"],
			["'w'", "'x'"]
		],
		"vertices": ["'u'", "'v'", "'w'", "'x'"]
	},
	"fractional_matching_lower_bound": {
		"denominator": 1,
		"numerator": 2,
		"rational": "2"
	},
	"integral_matching_number": 2
}
```

Interpretation:

- the `3/2` case shows overlap structure that is stronger than a single disjoint-packing witness but weaker than two full disjoint hits,
- the `2` case shows a stronger auxiliary geometry whose lower bound reaches two full tail hits.

## How To Review A Summary

1. Confirm the artifact class: heuristic proposal or certified constraint.
2. If the output is an `AuxiliaryHypergraphSummary`, read the hyperedges as certified unavoidable families only.
3. Check whether the fractional lower bound is strictly larger than the integral matching number.
4. If it is larger, note that overlapping certified constraints are doing real mathematical work beyond simple disjoint-packing arguments.

## Current Scope

The current implementation is exact on small finite fixtures used by ADR-029.

- It is suitable for reviewer interpretation and gate validation.
- It is not yet presented as a large-scale optimization backend.

For implementation details, see `aspectual_counting/conflict.py` and `pirtm/tests/test_adr_029_gate.py`.