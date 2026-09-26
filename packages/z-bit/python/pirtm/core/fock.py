"""
PIRTM Layer-II: Fock Space Bridge.

This module implements the second quantization of the multiplicity space H.
It provides the Fock space embedding, bosonic creation/annihilation operators,
and divergence prevention via Λ-stabilization.

Reference: MultiplicityLawfulRecursion.md (Layer-II Spec)
"""

from __future__ import annotations
from typing import List, Optional, Tuple, Dict
import numpy as np


class FockState:
    """
    Represents a state in the many-body Fock space F(H).
    
    In this implementation, we represent a Fock state as a mapping from 
    occupation number vectors (n_p1, n_p2, ...) to complex amplitudes.
    """
    
    def __init__(self, occupations: Dict[Tuple[int, ...], complex]):
        """
        Args:
            occupations: Dict where keys are tuples of occupation numbers 
                         for each prime p, and values are amplitudes.
        """
        self.occupations = occupations

    def __add__(self, other: FockState) -> FockState:
        new_occ = self.occupations.copy()
        for k, v in other.occupations.items():
            new_occ[k] = new_occ.get(k, 0j) + v
        return FockState(new_occ)

    def __mul__(self, scalar: complex) -> FockState:
        return FockState({k: v * scalar for k, v in self.occupations.items()})

    def norm(self) -> float:
        return float(np.sqrt(sum(abs(v)**2 for v in self.occupations.values())))

    def __repr__(self) -> str:
        return f"FockState(modes={len(self.occupations)})"


class FockSpaceBridge:
    """
    The Layer-II bridge implementing creation/annihilation operators.
    """

    def __init__(self, primes: List[int]):
        self.primes = sorted(primes)
        self.p_to_idx = {p: i for i, p in enumerate(self.primes)}
        self.num_modes = len(self.primes)

    def vacuum(self) -> FockState:
        """Create the vacuum state |0>."""
        zero_vec = (0,) * self.num_modes
        return FockState({zero_vec: 1.0 + 0j})

    def a_dag(self, p: int, state: FockState) -> FockState:
        """
        Creation operator a_p^\dagger.
        a_p^\dagger |n_p> = sqrt(n_p + 1) |n_p + 1>
        """
        if p not in self.p_to_idx:
            raise ValueError(f"Prime {p} not in mode set.")
        
        idx = self.p_to_idx[p]
        new_occupations = {}
        for occ, amp in state.occupations.items():
            n_p = occ[idx]
            new_occ = list(occ)
            new_occ[idx] += 1
            new_occupations[tuple(new_occ)] = amp * np.sqrt(n_p + 1)
        
        return FockState(new_occupations)

    def a(self, p: int, state: FockState) -> FockState:
        """
        Annihilation operator a_p.
        a_p |n_p> = sqrt(n_p) |n_p - 1>
        """
        if p not in self.p_to_idx:
            raise ValueError(f"Prime {p} not in mode set.")
        
        idx = self.p_to_idx[p]
        new_occupations = {}
        for occ, amp in state.occupations.items():
            n_p = occ[idx]
            if n_p > 0:
                new_occ = list(occ)
                new_occ[idx] -= 1
                new_occupations[tuple(new_occ)] = amp * np.sqrt(n_p)
        
        return FockState(new_occupations)

    def number_operator(self, state: FockState) -> float:
        """
        Number operator N = sum a_p^\dagger a_p.
        Returns the expected total number of particles.
        """
        total_n = 0.0
        for occ, amp in state.occupations.items():
            total_n += sum(occ) * (abs(amp)**2)
        return total_n

    def multiplicity_expectation(self, state: FockState) -> float:
        """
        Multiplicity operator M = sum (log p) a_p^\dagger a_p.
        Returns the expected multiplicity value.
        """
        total_m = 0.0
        for occ, amp in state.occupations.items():
            # occ is (n_p1, n_p2, ...)
            weighted_n = sum(n * np.log(p) for n, p in zip(occ, self.primes))
            total_m += weighted_n * (abs(amp)**2)
        return total_m

    def multiplicity_operator_diagonal(self) -> np.ndarray:
        """
        Returns the diagonal elements of the multiplicity operator M 
        in the prime-indexed mode basis.
        """
        return np.array([np.log(p) for p in self.primes])

    def get_multiplicity_matrix(self, basis: List[Tuple[int, ...]]) -> np.ndarray:
        """
        Returns the diagonal matrix M for a given basis.
        Basis is a list of occupation tuples.
        """
        diag = []
        for occ in basis:
            val = sum(n * np.log(p) for n, p in zip(occ, self.primes))
            diag.append(val)
        return np.diag(diag)

    def get_number_matrix(self, basis: List[Tuple[int, ...]]) -> np.ndarray:
        """
        Returns the diagonal total number operator matrix N for a given basis.
        """
        diag = [sum(occ) for occ in basis]
        return np.diag(diag)

    def get_ladder_matrices(self, basis: List[Tuple[int, ...]]) -> Tuple[List[np.ndarray], List[np.ndarray]]:
        """
        Returns lists of creation (a_dag) and annihilation (a) matrices for each prime.
        """
        dim = len(basis)
        a_dag_list = []
        a_list = []
        basis_idx = {occ: i for i, occ in enumerate(basis)}

        for i, p in enumerate(self.primes):
            a_dag = np.zeros((dim, dim))
            a = np.zeros((dim, dim))
            for j, occ in enumerate(basis):
                n_p = occ[i]
                target_occ = list(occ)
                target_occ[i] += 1
                target_tuple = tuple(target_occ)
                if target_tuple in basis_idx:
                    k = basis_idx[target_tuple]
                    val = np.sqrt(n_p + 1)
                    a_dag[k, j] = val
                    a[j, k] = val
            a_dag_list.append(a_dag)
            a_list.append(a)
        return a_dag_list, a_list

    def stabilized_update(self, state: FockState, lambda_m: float) -> FockState:
        """
        Divergence prevention via Λ-stabilization.
        Projects the state if N exceeds a contractive bound.
        """
        n_exp = self.number_operator(state)
        # Stabilization threshold derived from multiplicity limit
        if n_exp > 1.0 / (lambda_m + 1e-9):
            scale = (1.0 / (lambda_m * n_exp)) if n_exp > 0 else 1.0
            return state * scale
        return state


def fock_embedding(psi: np.ndarray, bridge: FockSpaceBridge) -> FockState:
    """
    Functor mapping from multiplicity space H to Fock space F(H).
    Maps a single-particle superposition to a Fock state.
    """
    state = bridge.vacuum() * 0j
    for i, p in enumerate(bridge.primes):
        if i < len(psi):
            # Create 1-particle component for each mode
            comp = bridge.a_dag(p, bridge.vacuum()) * psi[i]
            state = state + comp
    return state
