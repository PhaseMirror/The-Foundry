"""
Adapter to integrate HELIX Hamiltonian (helix_hamiltonian) with PIRTM.
Provides a bridge for PIRTM modules to invoke HELIX core logic.
"""

try:
    from helix_hamiltonian.core import KnotHamiltonian
    HAS_HELIX = True
except ImportError:
    KnotHamiltonian = None
    HAS_HELIX = False

def helix_hamiltonian_matrix(knot_type="3_1", n_qubits=1, omega_z=1.0, omega_fold=0.5, lambda_topo=0.3):
    """
    Construct a Hamiltonian matrix using HELIX's KnotHamiltonian.
    Returns None if HELIX is not available.
    """
    if not HAS_HELIX:
        raise ImportError("HELIX Hamiltonian not available in environment.")
    kh = KnotHamiltonian(knot_type=knot_type, n_qubits=n_qubits, omega_z=omega_z, omega_fold=omega_fold, lambda_topo=lambda_topo)
    return kh.construct()
