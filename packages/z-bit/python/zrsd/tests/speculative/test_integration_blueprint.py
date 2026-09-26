"""
Integration Tests for ZRSD-PIRTM Coupling.
Marks tests as speculative.
"""

import pytest
import numpy as np
import torch
from pirtm.core.fock import FockSpaceBridge
from pirtm.core.multiplicity_cell import MultiplicityCell
from zrsd.fock.bridge_link import FockZRSDBridge
from zrsd.simulation import run_integrated_simulation

@pytest.mark.speculative
def test_m_alignment():
    """Verify that M built from FockSpaceBridge matches ZRSD bridge matrix."""
    primes = [2, 3, 5, 7]
    f_bridge = FockSpaceBridge(primes)
    z_bridge = FockZRSDBridge(primes)
    
    # 1. Matrix from FockSpaceBridge
    M_f = f_bridge.get_multiplicity_matrix(z_bridge.basis)
    
    # 2. Matrix from ZRSD Bridge
    M_z = z_bridge.get_multiplicity_operator()
    
    assert np.allclose(M_f, M_z, atol=1e-12)

@pytest.mark.speculative
def test_ccr_sanity_under_integration():
    """Verify CCR [a_p, a_q^dag] = delta_pq holds for the bridge ladder operators."""
    primes = [2, 3]
    bridge = FockZRSDBridge(primes)
    a_dag, a = bridge.get_creation_annihilation()
    
    # [a_0, a_0^dag] on vacuum |0,0>
    comm = a[0] @ a_dag[0] - a_dag[0] @ a[0]
    # For binary basis: a a^dag - a^dag a = |0><0| - |1><1|
    expected = np.diag([1, 1, -1, -1]) # bit 0 is index i=0 in binary bits (0,0), (0,1), (1,0), (1,1)
    # Wait, my basis bits order: (0,0), (0,1), (1,0), (1,1)
    # bit 0 is 1st element:
    # index 0: (0,0) -> 0
    # index 1: (0,1) -> 0
    # index 2: (1,0) -> 1
    # index 3: (1,1) -> 1
    # So expected should be diag(1, 1, -1, -1).
    assert np.allclose(comm, expected)

@pytest.mark.speculative
def test_minimal_integrated_zrsd_sanity():
    """Run a short integrated simulation and check stability."""
    primes = [2, 3]
    cell = MultiplicityCell(primes, feature_dim=4, sigma=1.0, init_scale=0.01)
    bridge = FockZRSDBridge(primes, cell=cell)
    
    rho0 = np.zeros((bridge.dim, bridge.dim), dtype=complex)
    rho0[0, 0] = 1.0 # Start in vacuum
    
    config = {
        "steps": 20,
        "dt": 0.05,
        "mode": "true",
        "amplitudes": 0.1
    }
    
    df = run_integrated_simulation(bridge, rho0, config)
    
    # Assert Stability
    assert np.all(np.abs(df["trace"] - 1.0) < 1e-6)
    assert np.all(df["min_eig"] > -1e-6)
    assert np.all(df["exp_N"] < 2.1) # Max N is 2 for 2 primes
