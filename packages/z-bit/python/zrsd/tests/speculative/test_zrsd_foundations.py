"""
Tests for ZRSD Phase 1-3.
Marks tests as speculative.
"""

import pytest
import numpy as np
from zrsd.speculative.zeta_data import get_zeta_zeros
from zrsd.speculative.observables import multiplicity_operator, expectation
from zrsd.speculative.algebra import get_binary_basis
from zrsd.speculative.null_models import run_comparison

@pytest.mark.speculative
def test_zeta_zeros():
    zeros = get_zeta_zeros(3)
    assert len(zeros) == 3
    assert zeros[0] > 14.0

@pytest.mark.speculative
def test_multiplicity_operator():
    primes = [2, 3]
    basis = get_binary_basis(2)
    M = multiplicity_operator(primes, basis)
    assert M.shape == (4, 4)
    # diag should be [0, log(3), log(2), log(6)]
    diag = np.diag(M)
    assert np.allclose(diag[0], 0.0)
    assert np.allclose(diag[1], np.log(3))
    assert np.allclose(diag[2], np.log(2))
    assert np.allclose(diag[3], np.log(6))

@pytest.mark.speculative
def test_comparison_run():
    # Test a very short run to ensure pipeline works
    primes = [2, 3]
    trackers = run_comparison(primes, steps=10, dt=0.1)
    assert "true" in trackers
    assert len(trackers["true"].frames) == 10
    
    # Check trace preservation
    for frame in trackers["true"].frames:
        assert abs(frame.trace - 1.0) < 1e-6
