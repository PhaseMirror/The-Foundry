"""
Layer-III Resonance Detectors.
Implements spectral analysis over ZRSD telemetry to detect resonance signatures.
"""

import numpy as np
import pandas as pd
from .modes import ResonanceMode

def resonance_score_expM(df: pd.DataFrame, mode: ResonanceMode,
                         bandwidth: float = 1.0) -> float:
    """
    Computes a resonance score by summing spectral power in exp_M around target gammas.
    """
    t = df["t"].to_numpy()
    m = df["exp_M"].to_numpy()

    if len(t) < 2:
        return 0.0

    # Detrend
    m = m - m.mean()

    # FFT
    dt = t[1] - t[0]
    n = len(t)
    freqs = np.fft.rfftfreq(n, d=dt)
    spectrum = np.abs(np.fft.rfft(m)) / n # Normalize

    score = 0.0
    for g in mode.gammas:
        # Convert angular frequency g to linear frequency f = g / (2*pi)
        f_target = g / (2 * np.pi)
        # Find the bin closest to the target frequency
        idx = np.argmin(np.abs(freqs - f_target))
        # Check if the closest bin is within bandwidth
        if np.abs(freqs[idx] - f_target) <= bandwidth:
            # Take a small window around the peak
            w = int(max(1, bandwidth / (freqs[1] - freqs[0])))
            start = max(0, idx - w)
            end = min(len(spectrum), idx + w + 1)
            score += float(np.sum(spectrum[start:end]))
    
    return score

def zeta_specificity(df_true: pd.DataFrame,
                     df_rand: pd.DataFrame,
                     mode_true: ResonanceMode,
                     mode_rand: ResonanceMode) -> float:
    """
    Return the scalar zeta-specificity score: Score(true) - Score(random).
    """
    s_true = resonance_score_expM(df_true, mode_true)
    s_rand = resonance_score_expM(df_rand, mode_rand)
    return s_true - s_rand

def compute_phase_lock_index(df: pd.DataFrame, gamma: float) -> float:
    """
    Compute a simple Phase-Lock Index (PLI) for the multiplicity signal
    relative to a target frequency (gamma).
    
    PLI = |1/N * sum exp(i * (phi_signal(t) - gamma * t))|
    """
    t = df["t"].to_numpy()
    m = df["exp_M"].to_numpy()
    
    if len(t) < 2:
        return 0.0
        
    # Detrend
    m = m - m.mean()
    
    # Compute analytic signal via Hilbert transform to get instantaneous phase
    from scipy.signal import hilbert
    analytic_signal = hilbert(m)
    phi_signal = np.angle(analytic_signal)
    
    # Reference phase
    phi_ref = (gamma * t) % (2 * np.pi)
    
    # PLI calculation
    phase_diff = phi_signal - phi_ref
    pli = np.abs(np.mean(np.exp(1j * phase_diff)))
    
    return float(pli)
