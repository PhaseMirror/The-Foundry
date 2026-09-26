"""
Tests for Layer-III Resonance Modes.
Marks tests as speculative.
"""

import pytest
import numpy as np
from zrsd.resonance.modes import true_zeta_mode, randomized_mode

@pytest.mark.speculative
def test_true_zeta_mode():
    mode = true_zeta_mode(k=3)
    assert len(mode.gammas) == 3
    assert len(mode.weights) == 3
    assert mode.gammas[0] == 14.134725
    assert mode.weights == [1.0, 1.0, 1.0]

@pytest.mark.speculative
def test_randomized_mode_determinism():
    mode1 = randomized_mode(seed=42, k=3)
    mode2 = randomized_mode(seed=42, k=3)
    assert mode1.gammas == mode2.gammas
    
    mode3 = randomized_mode(seed=43, k=3)
    assert mode1.gammas != mode3.gammas
