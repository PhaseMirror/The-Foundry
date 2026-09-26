"""
Layer-III Resonance Mapping.
Defines pure data structures for hypothesis-level mappings to observables.
"""

from dataclasses import dataclass
from typing import Tuple, List
from .modes import ResonanceMode

@dataclass
class EEGPrediction:
    """Declarative hypothesis for EEG signatures."""
    frequency_band: Tuple[float, float]
    effect_type: str      # 'power', 'PLV', 'CFC'
    direction: str        # 'increase', 'decrease'
    condition: str        # e.g. 'prime-heavy vs composite'
    comment: str

@dataclass
class BehaviorPrediction:
    """Declarative hypothesis for behavioral signatures."""
    metric: str           # 'RT', 'accuracy', 'learning_rate'
    direction: str
    condition: str
    comment: str

def eeg_predictions_for_mode(mode: ResonanceMode) -> List[EEGPrediction]:
    """Generates EEG power hypotheses based on mode frequencies."""
    preds = []
    for g in mode.gammas:
        # Band centered around the gamma frequency
        band = (g - 0.5, g + 0.5)
        preds.append(EEGPrediction(
            frequency_band=band,
            effect_type="power",
            direction="increase",
            condition="task with high prime-factor complexity",
            comment=f"Expect narrow-band power increase near {g:.2f} if zeta-resonant dynamics couple to EEG.",
        ))
    return preds

def behavior_predictions_for_mode(mode: ResonanceMode) -> List[BehaviorPrediction]:
    """Generates qualitative behavioral hypotheses."""
    return [
        BehaviorPrediction(
            metric="reaction_time",
            direction="decrease",
            condition="prime-rich stimulus processing",
            comment="Hypothesized resonance with prime modes may accelerate convergence/recognition."
        )
    ]
