"""
ZRSD Phase 2: Lindblad
Provides dissipators and master equation dynamics.
"""

import numpy as np

def commutator(A: np.ndarray, B: np.ndarray) -> np.ndarray:
    return A @ B - B @ A

def dissipator(L: np.ndarray, rho: np.ndarray) -> np.ndarray:
    Ld = L.conj().T
    return L @ rho @ Ld - 0.5 * (Ld @ L @ rho + rho @ Ld @ L)

def lindblad_rhs(rho: np.ndarray, H: np.ndarray, Ls: list) -> np.ndarray:
    """Compute the Lindblad RHS: d_rho/dt = -i[H, rho] + sum D[L_k](rho)."""
    out = -1j * commutator(H, rho)
    for L in Ls:
        out = out + dissipator(L, rho)
    return out

def get_h_zeta(M: np.ndarray, t: float, gammas: np.ndarray, 
               amplitudes: np.ndarray = None, alpha: float = 1.0, 
               phases: np.ndarray = None, J: np.ndarray = None,
               Np_ops: list = None, ladder_ops: tuple = None) -> np.ndarray:
    """
    Construct the Zeta-Resonant Hamiltonian with EchoBraid coupling:
    H_zeta(t) = alpha M + sum a_j cos(gamma_j t + phi_j) M + H_int
    H_int = sum J_pq (a_p^dag a_q + a_q^dag a_p)
    """
    if amplitudes is None:
        amplitudes = np.ones(len(gammas))
    if phases is None:
        phases = np.zeros(len(gammas))
    
    drive = np.zeros_like(M, dtype=complex)
    for a, g, ph in zip(amplitudes, gammas, phases):
        drive = drive + a * np.cos(g * t + ph) * M
    
    H = alpha * M + drive
    
    # EchoBraid coupling: sum J_pq (a_p^dag a_q + a_q^dag a_p)
    if J is not None and ladder_ops is not None:
        a_dag_list, a_list = ladder_ops
        n_primes = len(a_list)
        for i in range(n_primes):
            for j in range(i + 1, n_primes):
                if J[i, j] != 0:
                    # Hopping term
                    H_int = J[i, j] * (a_dag_list[i] @ a_list[j] + a_dag_list[j] @ a_list[i])
                    H = H + H_int
                    
    return H
