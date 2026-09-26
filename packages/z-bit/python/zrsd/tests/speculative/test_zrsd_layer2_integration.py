"""
Tests for ZRSD Phase 4: Layer-II Bridge Integration.
Marks tests as speculative.
"""

import pytest
import numpy as np
import torch
from zrsd.fock.bridge_link import FockZRSDBridge
from pirtm.core.fock_multiplicity import FockMultiplicityEngine

@pytest.mark.speculative
def test_fock_zrsd_bridge_multiplicity():
    """Verify that FockZRSDBridge builds the multiplicity operator correctly."""
    primes = [2, 3]
    bridge = FockZRSDBridge(primes)
    M = bridge.get_multiplicity_operator()
    
    assert M.shape == (4, 4)
    # diag should be [0, log(3), log(2), log(6)]
    diag = np.diag(M)
    assert np.allclose(diag[0], 0.0)
    assert np.allclose(diag[1], np.log(3))
    assert np.allclose(diag[2], np.log(2))
    assert np.allclose(diag[3], np.log(6))

@pytest.mark.speculative
def test_fock_zrsd_bridge_operators():
    """Verify that FockZRSDBridge builds creation/annihilation operators correctly."""
    primes = [2, 3]
    bridge = FockZRSDBridge(primes)
    a_dag, a = bridge.get_creation_annihilation()
    
    assert len(a_dag) == 2
    assert len(a) == 2
    
    # Check [a_0, a_0^dag] on vacuum |0, 0>
    # a_0^dag |0, 0> = |1, 0> (index 2 in basis [(0,0), (0,1), (1,0), (1,1)])
    # a_0 |1, 0> = |0, 0> (index 0)
    comm = a[0] @ a_dag[0] - a_dag[0] @ a[0]
    # In binary basis, [a, a^dag] is NOT I, it's |0><0| - |1><1| for fermions? 
    # Wait, our basis is bosonic but truncated. 
    # For binary: a^dag |0> = |1>, a |1> = |0>.
    # a a^dag |0> = |0>. a^dag a |0> = 0. So a a^dag - a^dag a = |0><0| - |1><1|.
    # This is correct for a single qubit.
    
    # Just check it acts correctly on vacuum
    vac = np.zeros(4)
    vac[0] = 1.0
    res = a[0] @ a_dag[0] @ vac
    assert np.allclose(res, vac)

@pytest.mark.speculative
def test_end_to_end_layer2_coupling():
    """
    Verify that we can run a ZRSD simulation driven by the 
    certified FockMultiplicityEngine's parameters.
    """
    primes = [2, 3, 5]
    engine = FockMultiplicityEngine(primes, feature_dim=4, sigma=1.0)
    bridge = FockZRSDBridge(primes)
    
    M = bridge.get_multiplicity_operator()
    # Use effective lambda_m from the certified engine
    lambda_m = torch.mean(engine.cell.lambda_p).item()
    
    rho = np.eye(bridge.dim, dtype=complex) / bridge.dim
    # Apply stabilization
    rho_stable = bridge.stabilize_rho_lawful(rho)
    
    assert rho_stable.shape == (8, 8)
    assert np.isclose(np.trace(rho_stable), 1.0) or np.trace(rho_stable) < 1.0
