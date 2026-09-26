"""ADR-029 gate tests for the first Aspectual Counting Framework slice."""

from fractions import Fraction
import json
import tempfile
from pathlib import Path

from aspectual_counting import (
    Aspect,
    AuxiliaryConstraintHypergraph,
    AuxiliaryHypergraphSummary,
    alpha_preserving_automorphism,
    certified_tail_family_fixture,
    four_edge_mixed_size_certified_tail_family_fixture,
    high_fractional_auxiliary_hypergraph_fixture,
    join,
    meet,
    meet_join_bounds_hold,
    minimal_theseus_witness,
    mixed_size_certified_tail_family_fixture,
    overlapping_certified_tail_family_fixture,
    refinement_monotonicity,
    sample_conflict_hypergraph,
    serialize_auxiliary_hypergraph_summary,
    theseus_mus2_conflict_graph,
)
from pirtm.tools import pirtm_acf_review
from pirtm.transpiler.cli import PirtmCLI


class TestGate1AspectualInvariance:
    """Finite quotient counts must be invariant under aspect-preserving bijections."""

    def test_alpha_preserving_bijection_preserves_aspectual_count(self):
        aspect = Aspect.from_partition((("a0", "a1"), ("b0",), ("c0", "c1")))
        subset = {"a0", "b0", "c0"}
        automorphism = {
            "a0": "a1",
            "a1": "a0",
            "b0": "b0",
            "c0": "c1",
            "c1": "c0",
        }

        apply = alpha_preserving_automorphism(aspect, automorphism)
        assert aspect.count(subset) == 3
        assert aspect.count(apply(subset)) == 3
        assert aspect.union_identity_holds({"a0", "a1"}, {"a1", "b0"})


class TestGate2RefinementMonotonicity:
    """Finer aspects must not collapse more units than their coarsenings."""

    def test_refinement_monotonicity_holds_for_finite_fixture(self):
        refined = Aspect.from_partition((("p0",), ("p1",), ("q0", "q1")))
        coarse = Aspect.from_partition((("p0", "p1"), ("q0", "q1")))
        subset = {"p0", "p1", "q0"}

        assert refined.is_finer_than(coarse)
        assert refinement_monotonicity(refined, coarse, subset)
        assert refined.count(subset) == 3
        assert coarse.count(subset) == 2
        assert set(refined.refinement_map(coarse).values()) == {0, 1}


class TestGate3TheseusInconsistencyWitness:
    """The minimal Theseus bridge set must be unsatisfiable in a #-strict context."""

    def test_minimal_theseus_fixture_has_no_global_identity_model(self):
        witness = minimal_theseus_witness()

        assert witness.slices == ("s0", "s1", "s2")
        assert not witness.is_consistent()
        assert witness.contradictions() == {("s1", "s2")}


class TestGate4MeetJoinBounds:
    """Meet and join counts must satisfy the finite ACF count bounds."""

    def test_meet_and_join_satisfy_bound_identities(self):
        left = Aspect.from_partition((("x0", "x1"), ("y0", "y1"), ("z0",)))
        right = Aspect.from_partition((("x0",), ("x1", "y0"), ("y1", "z0")))
        subset = {"x0", "x1", "y0", "z0"}

        meet_aspect = meet(left, right)
        join_aspect = join(left, right)

        assert meet_join_bounds_hold(left, right, subset)
        assert left.count(subset) == 3
        assert right.count(subset) == 3
        assert meet_aspect.count(subset) == 4
        assert join_aspect.count(subset) == 1


class TestGate5MUS2ConflictGraphSelection:
    """In the MUS2 setting, satisfiable bridge sets must be exactly graph independent sets."""

    def test_theseus_conflict_reduces_to_graph_independent_set_selection(self):
        graph = theseus_mus2_conflict_graph()

        assert graph.is_independent_set(set())
        assert graph.is_independent_set({"continuity"})
        assert graph.is_independent_set({"material_provenance"})
        assert not graph.is_independent_set({"continuity", "material_provenance"})

        weights = {"continuity": 7, "material_provenance": 5}
        selection = graph.select_max_weight_independent_set(weights)

        assert selection.certified is True
        assert selection.method == "exact-mus2-independent-set"
        assert selection.selected_bridges == {"continuity"}
        assert selection.total_weight == 7


class TestGate6GeneralConflictHypergraph:
    """General MUS families must be handled as hypergraphs, not only pairwise conflicts."""

    def test_hypergraph_handles_size_three_mus_and_exact_selection(self):
        hypergraph = sample_conflict_hypergraph()
        weights = {
            "continuity": 8,
            "material": 7,
            "registry": 3,
            "display": 2,
        }

        assert hypergraph.helly_number() == 3
        assert hypergraph.is_feasible({"continuity", "material"})
        assert not hypergraph.is_feasible({"continuity", "material", "registry"})

        k_shadow = hypergraph.k_shadow(2)
        assert k_shadow.helly_number() == 2
        assert not k_shadow.is_feasible({"continuity", "material"})

        selection = hypergraph.select_max_weight_feasible_set(weights)
        assert selection.certified is True
        assert selection.method == "exact-hypergraph-independent-set"
        assert selection.selected_bridges == {"continuity", "material", "display"}
        assert selection.total_weight == 17


class TestGate7CertifiedVersusHeuristicConstraints:
    """The certification surface must separate heuristic proposals from certified unavoidable constraints."""

    def test_hypergraph_certification_marks_only_sound_constraints_as_certified(self):
        hypergraph = sample_conflict_hypergraph()
        weights = {
            "continuity": 8,
            "material": 7,
            "registry": 6,
            "display": 1,
        }

        result = hypergraph.certify_unavoidable_constraints(
            weights,
            (
                {"material", "registry"},
                {"material", "display"},
            ),
        )

        assert len(result.proposals) == 2
        assert all(proposal.certified is False for proposal in result.proposals)
        assert {proposal.source for proposal in result.proposals} == {"heuristic-candidate"}

        certified_members = {constraint.members for constraint in result.certified_constraints}
        assert certified_members == {frozenset({"material", "registry"})}
        certified_constraint = result.certified_constraints[0]
        assert certified_constraint.certified is True
        assert certified_constraint.source == "certified-unavoidable"
        assert certified_constraint.local_upper_bound == 9
        assert certified_constraint.total_weight == 13


class TestGate8AuxiliaryHypergraphLowerBound:
    """Certified unavoidable hyperedges must induce a fractional-matching lower bound on tails."""

    def test_fractional_matching_lower_bound_uses_certified_tail_family_fixture(self):
        hypergraph, weights, candidates, k, r = certified_tail_family_fixture()
        result = hypergraph.certify_unavoidable_constraints(weights, candidates)
        auxiliary = hypergraph.build_auxiliary_hypergraph(weights, k, result.certified_constraints, r)

        assert len(result.proposals) == 3
        assert {proposal.members for proposal in result.proposals} == {
            frozenset({"beta", "gamma"}),
            frozenset({"delta", "epsilon"}),
            frozenset({"beta", "delta"}),
        }
        assert {constraint.members for constraint in result.certified_constraints} == {
            frozenset({"beta", "gamma"}),
            frozenset({"delta", "epsilon"}),
        }

        assert auxiliary == AuxiliaryConstraintHypergraph(
            vertices=frozenset({"beta", "gamma", "delta", "epsilon"}),
            hyperedges=(
                frozenset({"beta", "gamma"}),
                frozenset({"delta", "epsilon"}),
            ),
        )

        assert auxiliary.integral_matching_number() == 2
        assert auxiliary.fractional_matching_lower_bound() == Fraction(2, 1)


class TestGate9KShadowInterpolation:
    """The k-shadow optimum must increase monotonically until it reaches the true hypergraph optimum."""

    def test_k_shadow_optima_progress_monotonically_to_true_optimum(self):
        hypergraph = sample_conflict_hypergraph()
        weights = {
            "continuity": 8,
            "material": 7,
            "registry": 3,
            "display": 2,
        }

        optimum_2 = hypergraph.shadow_optimum_weight(weights, 2)
        optimum_3 = hypergraph.shadow_optimum_weight(weights, 3)
        optimum_star = hypergraph.optimum_weight(weights)

        assert optimum_2 == 10
        assert optimum_2 <= optimum_3 <= optimum_star
        assert optimum_3 == optimum_star == 17


class TestGate10OverlappingCertifiedTailFamilies:
    """Overlapping certified tail families should produce a strict fractional-over-integral gap."""

    def test_overlapping_certified_tail_families_raise_fractional_lower_bound(self):
        hypergraph, weights, candidates, k, r = overlapping_certified_tail_family_fixture()
        result = hypergraph.certify_unavoidable_constraints(weights, candidates)
        auxiliary = hypergraph.build_auxiliary_hypergraph(weights, k, result.certified_constraints, r)

        assert {constraint.members for constraint in result.certified_constraints} == {
            frozenset({"u", "v"}),
            frozenset({"v", "w"}),
            frozenset({"u", "w"}),
        }
        assert {edge for edge in auxiliary.hyperedges} == {
            frozenset({"u", "v"}),
            frozenset({"v", "w"}),
            frozenset({"u", "w"}),
        }

        assert auxiliary.integral_matching_number() == 1
        assert auxiliary.fractional_matching_lower_bound() == Fraction(3, 2)
        assert auxiliary.fractional_matching_lower_bound() > auxiliary.integral_matching_number()


class TestGate11MixedSizeCertifiedTailFamilies:
    """Mixed-size certified families should build a mixed-edge auxiliary hypergraph from certification output."""

    def test_mixed_size_certified_tail_families_produce_mixed_edge_lower_bound(self):
        hypergraph, weights, candidates, k, r = mixed_size_certified_tail_family_fixture()
        result = hypergraph.certify_unavoidable_constraints(weights, candidates)
        auxiliary = hypergraph.build_auxiliary_hypergraph(weights, k, result.certified_constraints, r)

        assert {constraint.members for constraint in result.certified_constraints} == {
            frozenset({"u", "v"}),
            frozenset({"v", "w", "t"}),
            frozenset({"u", "w", "t"}),
        }
        assert {edge for edge in auxiliary.hyperedges} == {
            frozenset({"u", "v"}),
            frozenset({"v", "w", "t"}),
            frozenset({"u", "w", "t"}),
        }

        assert auxiliary.integral_matching_number() == 1
        assert auxiliary.fractional_matching_lower_bound() == Fraction(3, 2)
        assert auxiliary.fractional_matching_lower_bound() > auxiliary.integral_matching_number()


class TestGate12FourEdgeMixedSizeCertifiedTailFamilies:
    """A larger mixed-size certified family should yield a four-edge auxiliary hypergraph."""

    def test_four_edge_mixed_size_fixture_extends_auxiliary_lower_bound_surface(self):
        hypergraph, weights, candidates, k, r = four_edge_mixed_size_certified_tail_family_fixture()
        result = hypergraph.certify_unavoidable_constraints(weights, candidates)
        auxiliary = hypergraph.build_auxiliary_hypergraph(weights, k, result.certified_constraints, r)

        assert {constraint.members for constraint in result.certified_constraints} == {
            frozenset({"u", "v"}),
            frozenset({"v", "w", "t"}),
            frozenset({"u", "w", "t"}),
            frozenset({"u", "v", "w"}),
        }
        assert {edge for edge in auxiliary.hyperedges} == {
            frozenset({"u", "v"}),
            frozenset({"v", "w", "t"}),
            frozenset({"u", "w", "t"}),
            frozenset({"u", "v", "w"}),
        }

        assert len(auxiliary.hyperedges) == 4
        assert auxiliary.integral_matching_number() == 1
        assert auxiliary.fractional_matching_lower_bound() == Fraction(3, 2)
        assert auxiliary.fractional_matching_lower_bound() > auxiliary.integral_matching_number()


class TestGate13AuxiliarySummaryAndHighFractionalFixture:
    """Reviewer-facing summaries should expose the auxiliary hypergraph and its lower bounds directly."""

    def test_summary_helper_reports_precomputed_bounds_for_certified_family(self):
        hypergraph, weights, candidates, k, r = four_edge_mixed_size_certified_tail_family_fixture()
        result = hypergraph.certify_unavoidable_constraints(weights, candidates)
        summary = hypergraph.build_auxiliary_hypergraph_summary(weights, k, result.certified_constraints, r)

        assert isinstance(summary, AuxiliaryHypergraphSummary)
        assert summary.integral_matching_number == 1
        assert summary.fractional_matching_lower_bound == Fraction(3, 2)
        assert len(summary.auxiliary_hypergraph.hyperedges) == 4

        serialized = serialize_auxiliary_hypergraph_summary(summary)
        payload = json.loads(serialized)
        assert payload == {
            "auxiliary_hypergraph": {
                "vertices": ["'b'", "'c'", "'t'", "'u'", "'v'", "'w'"],
                "hyperedges": [
                    ["'u'", "'v'"],
                    ["'t'", "'u'", "'w'"],
                    ["'t'", "'v'", "'w'"],
                    ["'u'", "'v'", "'w'"],
                ],
            },
            "fractional_matching_lower_bound": {
                "denominator": 2,
                "numerator": 3,
                "rational": "3/2",
            },
            "integral_matching_number": 1,
        }

    def test_direct_four_edge_auxiliary_fixture_exercises_higher_fractional_geometry(self):
        auxiliary = high_fractional_auxiliary_hypergraph_fixture()

        assert len(auxiliary.hyperedges) == 4
        assert auxiliary.integral_matching_number() == 2
        assert auxiliary.fractional_matching_lower_bound() == Fraction(2, 1)
        assert auxiliary.fractional_matching_lower_bound() > Fraction(3, 2)


class TestGate14ACFReviewTooling:
    """ADR-029 summaries should be reachable through PIRTM tooling, not only Python imports."""

    def test_acf_review_tool_and_cli_emit_stable_json_summary(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            output_path = Path(tmpdir) / "acf-summary.json"
            fixture_path = Path(__file__).resolve().parent / "fixtures" / "acf_review_four_edge_mixed.json"

            rv = pirtm_acf_review.main([
                "--fixture",
                "four-edge-mixed",
                "--output",
                str(output_path),
            ])
            assert rv == 0

            payload = json.loads(output_path.read_text(encoding="utf-8"))
            expected_payload = json.loads(fixture_path.read_text(encoding="utf-8"))
            assert payload == expected_payload

            cli_output = Path(tmpdir) / "acf-summary-cli.json"
            cli = PirtmCLI()
            cli_rv = cli.cmd_acf_review(
                type("A", (), {
                    "fixture": "high-fractional-direct",
                    "output": str(cli_output),
                    "pretty": False,
                })
            )
            assert cli_rv == 0

            cli_payload = json.loads(cli_output.read_text(encoding="utf-8"))
            assert cli_payload["fractional_matching_lower_bound"]["rational"] == "2"
            assert cli_payload["integral_matching_number"] == 2