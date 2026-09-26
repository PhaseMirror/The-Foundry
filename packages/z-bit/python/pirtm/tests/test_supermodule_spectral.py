"""
Cross-module spectral stability tests (ADR-005).

Verifies that SupermoduleCertificate enforces:
    ρ(C · diag(γ_1, ..., γ_n)) < 1

Using the public API from pirtm.sigma.session_spectral_gate.

See: docs/adr/completed/ADR-005-cross-module-spectral.md
"""
import numpy as np
import pytest

from pirtm.sigma.session_spectral_gate import (
    SupermoduleCertificate,
    SessionLevelInstabilityError,
)


def test_cross_module_spectral_failure():
    """
    Demonstrate that SupermoduleCertificate blocks unstable sessions.

    Three modules at primes p=2, p=3, p=5 (arbitrary labels).
    Per-module contraction rates γ_i < 1.0 individually (PASS).
    High off-diagonal coupling causes session-level instability —
    SupermoduleCertificate.certify() raises SessionLevelInstabilityError.
    """
    # Per-module contraction rates (all pass individually)
    gammas = np.array([0.8, 0.7, 0.75])
    assert all(g < 1.0 for g in gammas), (
        "Per-module contractivity required: all γ_i < 1.0"
    )

    # Interaction matrix: high cross-module coupling
    C = np.array([
        [0.0, 0.9, 0.9],
        [0.9, 0.0, 0.9],
        [0.9, 0.9, 0.0],
    ])

    # SupermoduleCertificate must reject this configuration
    with pytest.raises(SessionLevelInstabilityError) as exc_info:
        SupermoduleCertificate.certify(gammas, C, session_id="unstable-session")

    # Verify the error carries the right spectral radius (> 1.0)
    assert exc_info.value.spectral_radius > 1.0
    assert len(exc_info.value.modules) == 3


def test_cross_module_spectral_stable():
    """
    Counterexample: when cross-module spectral condition is satisfied.
    
    Same per-module γ, but weaker off-diagonal coupling.
    SupermoduleCertificate.certify() succeeds.
    """
    gammas = np.array([0.8, 0.7, 0.75])

    # Weak coupling: spectral radius of C·diag(γ) stays below 1
    C_weak = np.array([
        [0.0, 0.4, 0.4],
        [0.4, 0.0, 0.4],
        [0.4, 0.4, 0.0],
    ])

    cert = SupermoduleCertificate.certify(gammas, C_weak, session_id="stable-session")

    assert cert.stable is True
    assert cert.spectral_radius < 1.0
    assert len(cert.module_gammas) == 3
    assert cert.session_id == "stable-session"


def test_supermodule_shape_validation():
    """SupermoduleCertificate rejects mismatched gamma/matrix dimensions."""
    gammas = np.array([0.8, 0.7])
    C = np.eye(3)  # 3x3 but only 2 gammas

    with pytest.raises(ValueError, match="does not match"):
        SupermoduleCertificate.certify(gammas, C)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
