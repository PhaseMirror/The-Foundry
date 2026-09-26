"""
Layer-III Resonance Protocols.
Reusable experiment blueprints for testing MTPI stack predictions.
"""

from dataclasses import dataclass
from typing import List, Any
from .mapping import EEGPrediction, BehaviorPrediction

@dataclass
class Protocol:
    """Blueprint for a candidate experiment."""
    name: str
    description: str
    tasks: List[str]
    eeg_predictions: List[EEGPrediction]
    behavior_predictions: List[BehaviorPrediction]

def prime_arithmetic_protocol(mode: Any) -> Protocol:
    """Blueprint for prime-rich mental arithmetic experiments."""
    from .mapping import eeg_predictions_for_mode, behavior_predictions_for_mode
    return Protocol(
        name="PrimeArithmeticProtocol",
        description="Mental arithmetic comparing prime-rich vs composite-rich operands.",
        tasks=["prime-heavy calculation", "composite-heavy calculation"],
        eeg_predictions=eeg_predictions_for_mode(mode),
        behavior_predictions=behavior_predictions_for_mode(mode)
    )

def ambiguous_sentence_protocol(mode: Any) -> Protocol:
    """Blueprint for linguistic ambiguity / garden-path sentence experiments."""
    from .mapping import eeg_predictions_for_mode
    return Protocol(
        name="AmbiguousSentenceProtocol",
        description="Linguistic processing of garden-path vs simple sentences.",
        tasks=["garden-path sentence reading", "control sentence reading"],
        eeg_predictions=eeg_predictions_for_mode(mode),
        behavior_predictions=[] # TBD
    )
