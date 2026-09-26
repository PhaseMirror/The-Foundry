"""
ZRSD Layer-III Resonance Runner.
High-level integration for running true-zeta vs null simulations and scoring specificity.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from ..simulation import run_integrated_simulation
from ..fock.bridge_link import FockZRSDBridge
from .modes import ResonanceMode, true_zeta_mode, randomized_mode
from .detectors import zeta_specificity

def run_mode_comparison(
    bridge: FockZRSDBridge,
    rho0: np.ndarray,
    base_config: Dict[str, Any],
    mode_true: ResonanceMode,
    mode_rand: ResonanceMode
) -> Tuple[pd.DataFrame, pd.DataFrame, float]:
    """
    Runs two simulations (true vs random) and computes zeta-specificity.
    """
    
    # 1. Run True Mode
    df_true = run_integrated_simulation(
        bridge, rho0, base_config, 
        gammas=np.array(mode_true.gammas), 
        amplitudes=np.array(mode_true.weights)
    )
    
    # 2. Run Random Mode
    df_rand = run_integrated_simulation(
        bridge, rho0, base_config, 
        gammas=np.array(mode_rand.gammas), 
        amplitudes=np.array(mode_rand.weights)
    )
    
    # 3. Compute Specificity
    score = zeta_specificity(df_true, df_rand, mode_true, mode_rand)
    
    return df_true, df_rand, score
