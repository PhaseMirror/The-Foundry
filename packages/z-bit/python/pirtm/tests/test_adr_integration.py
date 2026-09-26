"""
Integration tests for ADR implementations.

Tests verify:
- ADR-001: margin field + debug flag in step()
- ADR-002: certify_state() operator signature
- ADR-003: parameterized projector
- ADR-004: PIRTMPolicy protocol enforcement
"""
import numpy as np
import pytest
from pirtm.backend import current_backend
from pirtm.core.recurrence import step, iterate
from pirtm.core.certify import certify_state, ContractivityCertificate
from pirtm.core.projection import project, bounded_state_check, ProjectorKind
from pirtm.policy import PIRTMPolicy


def create_test_operators(n=2):
    """Create small test operators."""
    backend = current_backend()
    Xi = backend.eye(n) * 0.3  # Small identity
    Lambda = backend.eye(n) * 0.2  # Small aggregation
    return Xi, Lambda


class MinimalPolicy:
    """Minimal policy for testing PIRTMPolicy protocol."""
    def __init__(self, Xi, Lambda, G=None):
        self.Xi = Xi
        self.Lambda = Lambda
        self.G = G if G is not None else np.zeros_like(Xi[0])
        self.goal_budget = 0.95
    
    def Xi_t(self, t):
        return self.Xi
    
    def Lambda_t(self, t):
        return self.Lambda
    
    def G_t(self, t):
        return self.G


# ============================================================================
# ADR-001 Tests: Margin field + debug flag
# ============================================================================

def test_step_margin_computed():
    """Verify margin is computed and present in metadata."""
    backend = current_backend()
    X_t = np.array([0.1, 0.2])
    Xi_t, Lambda_t = create_test_operators(2)
    
    X_next, metadata = step(X_t, Xi_t, Lambda_t, backend=backend, epsilon=0.05)
    
    # Check margin is present
    assert "margin" in metadata, "margin field missing from step() metadata"
    assert "q_t" in metadata, "q_t field missing from step() metadata"
    
    # Verify margin formula: (1.0 - epsilon) - q_t
    expected_margin = (1.0 - 0.05) - metadata["q_t"]
    assert np.isclose(metadata["margin"], expected_margin), \
        f"margin calculation wrong: expected {expected_margin}, got {metadata['margin']}"


def test_step_debug_gate():
    """Verify debug flag gates overhead norm calls."""
    backend = current_backend()
    X_t = np.array([0.1, 0.2])
    Xi_t, Lambda_t = create_test_operators(2)
    
    # With debug=False (default)
    X_next_no_debug, metadata_no_debug = step(
        X_t, Xi_t, Lambda_t, backend=backend, debug=False
    )
    assert "norm_X_t" not in metadata_no_debug, "norm_X_t should not be in metadata when debug=False"
    assert "norm_X_next" not in metadata_no_debug, "norm_X_next should not be in metadata when debug=False"
    assert "norm_Y_t" not in metadata_no_debug, "norm_Y_t should not be in metadata when debug=False"
    
    # With debug=True
    X_next_debug, metadata_debug = step(
        X_t, Xi_t, Lambda_t, backend=backend, debug=True
    )
    assert "norm_X_t" in metadata_debug, "norm_X_t missing when debug=True"
    assert "norm_X_next" in metadata_debug, "norm_X_next missing when debug=True"
    assert "norm_Y_t" in metadata_debug, "norm_Y_t missing when debug=True"
    
    # Both should produce same X_next
    assert np.allclose(X_next_no_debug, X_next_debug), \
        "debug flag should not affect recurrence computation"


def test_step_margin_warning():
    """Verify warning fires when margin < 0.05."""
    backend = current_backend()
    X_t = np.array([0.1, 0.2])
    
    # Create operators that push margin below threshold
    Xi_t = np.array([[0.7, 0.0], [0.0, 0.7]])
    Lambda_t = np.array([[0.2, 0.0], [0.0, 0.2]])
    
    # q_t ≈ 0.7 + 0.2 = 0.9, margin = 0.95 - 0.9 = 0.05 (should not warn)
    # Need q_t > 0.95 to trigger warning (margin < 0.05)
    Xi_t = np.array([[0.95, 0.0], [0.0, 0.95]])
    Lambda_t = np.array([[0.01, 0.0], [0.0, 0.01]])
    
    with pytest.warns(UserWarning, match="Contractivity margin.*< 0.05"):
        X_next, metadata = step(
            X_t, Xi_t, Lambda_t, backend=backend, epsilon=0.05
        )


# ============================================================================
# ADR-002 Tests: Spectral certification reform
# ============================================================================

def test_certify_requires_operators():
    """Verify certify_state() requires Xi and Lambda parameters."""
    X = np.array([0.1, 0.2])
    Xi = np.eye(2) * 0.3
    Lambda = np.eye(2) * 0.2
    
    # Old signature should fail (missing Xi, Lambda)
    with pytest.raises(TypeError):
        certify_state(X, epsilon=0.05)
    
    # New signature should work
    cert = certify_state(X, Xi=Xi, Lambda=Lambda, epsilon=0.05)
    assert isinstance(cert, ContractivityCertificate)


def test_certify_spectral_radius_from_operators():
    """Verify spectral_radius is computed from operators, not state norm."""
    X = np.array([0.9, 0.95])  # Large state norm
    Xi = np.eye(2) * 0.1  # Small operator norm
    Lambda = np.eye(2) * 0.05
    
    cert = certify_state(X, Xi=Xi, Lambda=Lambda, op_norm_T=0.25, epsilon=0.05)
    
    # spectral_radius should be from operators, not state
    expected_spectral_radius = 0.1 + 0.05 * 0.25
    assert np.isclose(cert.spectral_radius, expected_spectral_radius), \
        f"spectral_radius should be from operators, got {cert.spectral_radius}, expected {expected_spectral_radius}"
    
    # state_norm should still be recorded
    assert np.isclose(cert.state_norm, np.linalg.norm(X)), \
        "state_norm should still be recorded"


def test_certify_spectral_equals_q_t():
    """Verify cert.spectral_radius matches q_t from step()."""
    backend = current_backend()
    X = np.array([0.1, 0.2])
    Xi = np.array([[0.3, 0.0], [0.0, 0.3]])
    Lambda = np.array([[0.2, 0.0], [0.0, 0.2]])
    
    # From step()
    X_next, metadata = step(X, Xi, Lambda, backend=backend)
    q_t_from_step = metadata["q_t"]
    
    # From certify_state()
    cert = certify_state(X, Xi=Xi, Lambda=Lambda, op_norm_T=1.0)  # Note: op_norm_T=1.0 for this test
    
    # They should match
    assert np.isclose(cert.spectral_radius, q_t_from_step), \
        f"spectral_radius should equal q_t: {cert.spectral_radius} vs {q_t_from_step}"


# ============================================================================
# ADR-003 Tests: Parameterized projector
# ============================================================================

def test_project_default_is_clip():
    """Verify default projector is 'clip'."""
    backend = current_backend()
    x = np.array([0.5, 2.0, -3.0])  # Out of bounds
    
    # Default should clip
    result = project(x, min_val=-1.0, max_val=1.0, backend=backend)
    expected = np.clip(x, -1.0, 1.0)
    assert np.allclose(result, expected), "default projector should be clip"


def test_project_explicit_projectors():
    """Verify explicit projector selection works."""
    backend = current_backend()
    x = np.array([0.5, 0.8])
    
    # Clip
    result_clip = project(x, projector="clip", backend=backend)
    assert np.allclose(result_clip, x), "clip should not change in-bounds values"
    
    # Ball (L2 norm projection)
    result_ball = project(x, max_val=1.0, projector="ball", backend=backend)
    norm_result = np.linalg.norm(result_ball)
    assert norm_result <= 1.0 + 1e-10, f"ball projector should respect radius bound, got norm {norm_result}"
    
    # Tanh
    result_tanh = project(x, projector="tanh", backend=backend)
    assert np.all(np.abs(result_tanh) < 1.0), "tanh should produce values in (-1, 1)"


def test_bounded_state_check_clip():
    """Verify bounded_state_check with clip projector."""
    backend = current_backend()
    
    # In bounds
    x_in = np.array([0.5, -0.5])
    assert bounded_state_check(x_in, projector="clip", backend=backend), \
        "in-bounds state should pass check"
    
    # Out of bounds
    x_out = np.array([0.5, 2.0])
    assert not bounded_state_check(x_out, projector="clip", backend=backend), \
        "out-of-bounds state should fail check"


def test_bounded_state_check_tanh():
    """Verify bounded_state_check with tanh projector."""
    backend = current_backend()
    
    # Any finite value passes tanh check (it's in (-1, 1))
    x = np.array([0.5, 0.8])
    assert bounded_state_check(x, projector="tanh", backend=backend), \
        "finite values should pass tanh check"
    
    # Large values also pass (tanh asymptotes to ±1)
    x_large = np.array([10.0, -10.0])
    assert bounded_state_check(x_large, projector="tanh", backend=backend), \
        "large values should pass tanh check (asymptotic to ±1)"


def test_projector_kind_type():
    """Verify ProjectorKind type is accessible."""
    from pirtm.core.projection import ProjectorKind
    
    # Should accept literals
    valid: ProjectorKind = "clip"
    valid = "ball"
    valid = "tanh"
    
    # Type hints work
    assert True


# ============================================================================
# ADR-004 Tests: PIRTMPolicy protocol
# ============================================================================

def test_policy_protocol_isinstance():
    """Verify PIRTMPolicy protocol works with isinstance()."""
    Xi = np.eye(2) * 0.3
    Lambda = np.eye(2) * 0.2
    policy = MinimalPolicy(Xi, Lambda)
    
    assert isinstance(policy, PIRTMPolicy), \
        "MinimalPolicy should satisfy PIRTMPolicy protocol"


def test_iterate_accepts_valid_policy():
    """Verify iterate() accepts valid PIRTMPolicy."""
    backend = current_backend()
    X_0 = np.array([0.1, 0.1])
    Xi = np.eye(2) * 0.3
    Lambda = np.eye(2) * 0.2
    G = np.zeros(2)
    
    policy = MinimalPolicy(Xi, Lambda, G)
    
    # Should not raise
    result = iterate(X_0, policy, kernel=None, steps=2, backend=backend)
    
    assert "trajectory" in result
    assert len(result["trajectory"]) == 3  # X_0, X_1, X_2


def test_iterate_rejects_invalid_policy():
    """Verify iterate() raises TypeError for invalid policy."""
    X_0 = np.array([0.1, 0.1])
    
    # Bare object without protocol
    class InvalidPolicy:
        pass
    
    policy = InvalidPolicy()
    
    with pytest.raises(TypeError, match="policy must implement PIRTMPolicy protocol"):
        iterate(X_0, policy, kernel=None, steps=1)


def test_iterate_policy_missing_attribute():
    """Verify iterate() catches policies missing required attributes."""
    X_0 = np.array([0.1, 0.1])
    
    # Policy with some but not all required attributes
    class PartialPolicy:
        def Xi_t(self, t):
            return np.eye(2) * 0.3
        
        def Lambda_t(self, t):
            return np.eye(2) * 0.2
        
        # Missing: G_t() and goal_budget
    
    policy = PartialPolicy()
    
    with pytest.raises(TypeError):
        iterate(X_0, policy, kernel=None, steps=1)


def test_policy_goal_budget_attribute():
    """Verify policy.goal_budget is accessible."""
    Xi = np.eye(2) * 0.3
    Lambda = np.eye(2) * 0.2
    policy = MinimalPolicy(Xi, Lambda)
    
    assert hasattr(policy, "goal_budget"), "policy should have goal_budget attribute"
    assert isinstance(policy.goal_budget, float), "goal_budget should be float"


# ============================================================================
# Integration Test: All ADRs working together
# ============================================================================

def test_full_integration():
    """Verify all ADRs work together in a realistic scenario."""
    backend = current_backend()
    
    # Create a valid policy
    Xi = np.array([[0.3, 0.0], [0.0, 0.3]])
    Lambda = np.array([[0.2, 0.0], [0.0, 0.2]])
    G = np.zeros(2)
    policy = MinimalPolicy(Xi, Lambda, G)
    
    # Run iteration
    X_0 = np.array([0.1, 0.15])
    result = iterate(X_0, policy, kernel=None, steps=3, backend=backend)
    
    # Check trajectory
    assert len(result["trajectory"]) == 4
    trajectory = result["trajectory"]
    
    # Certify first state
    cert = certify_state(trajectory[0], Xi=Xi, Lambda=Lambda, epsilon=0.05)
    assert isinstance(cert, ContractivityCertificate)
    assert cert.is_valid(), "certificate should be valid for small state"
    
    # Project final state with different projectors
    final_state = trajectory[-1]
    
    clipped = project(final_state, projector="clip", backend=backend)
    assert np.all(clipped >= -1.0) and np.all(clipped <= 1.0)
    
    balled = project(final_state, max_val=1.0, projector="ball", backend=backend)
    assert np.linalg.norm(balled) <= 1.0 + 1e-10
    
    tanhd = project(final_state, projector="tanh", backend=backend)
    assert np.all(np.abs(tanhd) < 1.0)
    
    # Verify all checks
    assert bounded_state_check(final_state, projector="tanh", backend=backend)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
