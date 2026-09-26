"""
Tests for Layer-III Resonance Mapping.
Marks tests as speculative.
"""

import pytest
from zrsd.resonance.modes import true_zeta_mode
from zrsd.resonance.mapping import eeg_predictions_for_mode, behavior_predictions_for_mode

@pytest.mark.speculative
def test_eeg_mapping():
    mode = true_zeta_mode(k=2)
    preds = eeg_predictions_for_mode(mode)
    assert len(preds) == 2
    assert preds[0].direction == "increase"
    assert "14.13" in preds[0].comment

@pytest.mark.speculative
def test_behavior_mapping():
    mode = true_zeta_mode(k=1)
    preds = behavior_predictions_for_mode(mode)
    assert len(preds) > 0
    assert preds[0].metric == "reaction_time"
