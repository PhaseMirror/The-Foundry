"""
ZRSD Phase 2: Algebra
Provides mapping from prime indices and occupation limits to matrix representations.
"""

import numpy as np
from itertools import product

def get_binary_basis(num_primes: int) -> list:
    """Return a basis of tuples representing binary occupation (0 or 1) for each prime."""
    return list(product([0, 1], repeat=num_primes))

def get_creation_annihilation(num_primes: int, basis: list) -> tuple:
    """
    Return creation (a_dag) and annihilation (a) operators for each prime.
    Each is a list of matrices.
    """
    dim = len(basis)
    a_dag_list = []
    a_list = []
    
    for i in range(num_primes):
        a_dag = np.zeros((dim, dim))
        a = np.zeros((dim, dim))
        for j, occ in enumerate(basis):
            if occ[i] == 0:
                # Find index where occ[i] is 1
                target_occ = list(occ)
                target_occ[i] = 1
                target_idx = basis.index(tuple(target_occ))
                a_dag[target_idx, j] = 1.0
                a[j, target_idx] = 1.0
        a_dag_list.append(a_dag)
        a_list.append(a)
        
    return a_dag_list, a_list
