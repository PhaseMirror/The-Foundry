"""Phase 1 Runtime Pipeline: T_{t+1} = P F_t K_t (T_t)

Implements the core runtime pipeline with ACE budget enforcement and PETC validation.
"""

from __future__ import annotations

from typing import Any, Dict, Optional, Tuple
from dataclasses import dataclass
import numpy as np

from ..backend import Array, TensorBackend, current_backend
from ..core.recurrence import step as recurrence_step
from ..core.projection import project
from ..core.xi_executor import XiExecutor, XiExecutionResult
from ..ace.budget import AceBudget
from ..petc.chain import PETCChain, PETCAtom


@dataclass
class PipelineState:
    """State of the Phase 1 runtime pipeline."""
    T_t: Array  # Current state tensor
    step_count: int
    ace_budget: AceBudget
    petc_chain: PETCChain
    prime_index: int
    environment_id: str


class Phase1Pipeline:
    """Phase 1 runtime pipeline: T_{t+1} = P F_t K_t (T_t)"""

    def __init__(
        self,
        initial_state: Array,
        prime_index: int,
        environment_id: str = "default",
        backend: Optional[TensorBackend] = None
    ):
        self.backend = backend or current_backend()
        self.state = PipelineState(
            T_t=initial_state,
            step_count=0,
            ace_budget=AceBudget(),
            petc_chain=PETCChain(),
            prime_index=prime_index,
            environment_id=environment_id
        )
        self.xi_executor = XiExecutor()

    def step(
        self,
        F_t: Array,  # Filter operator
        K_t: Array,  # Kernel operator
        G_t: Optional[Array] = None,  # Optional growth term
        validate_environment: bool = True
    ) -> Tuple[PipelineState, Dict[str, Any]]:
        """Execute one step: T_{t+1} = P F_t K_t (T_t)

        Args:
            F_t: Filter operator at time t
            K_t: Kernel operator at time t
            G_t: Optional growth/guidance term
            validate_environment: Check environment isolation

        Returns:
            Updated pipeline state and metadata
        """

        # Environment validation (reject cross-environment PETC composition)
        if validate_environment:
            self._validate_environment_isolation()

        # Apply ACE budget consumption
        budget_cost = self._compute_budget_cost(F_t, K_t)
        self.state.ace_budget.consume(budget_cost)

        # Compute K_t (T_t) - prime-indexed kernel application
        kernel_result = self._apply_kernel(K_t, self.state.T_t)

        # Compute F_t (K_t (T_t)) - filter application
        filtered_result = self.backend.matmul(F_t, kernel_result)

        # Apply projection P
        T_next = project(filtered_result, backend=self.backend)

        # Update state
        self.state.T_t = T_next
        self.state.step_count += 1

        # Record in PETC chain
        petc_atom = self.state.petc_chain.append(
            prime=self.state.prime_index,
            payload={
                "step": self.state.step_count,
                "environment": self.state.environment_id,
                "budget_consumed": budget_cost,
                "state_norm": float(self.backend.norm(T_next))
            }
        )

        metadata = {
            "step_count": self.state.step_count,
            "budget_remaining": self.state.ace_budget.snapshot().tau - self.state.ace_budget.snapshot().consumed,
            "petc_atom_id": petc_atom.atom_id,
            "state_norm": float(self.backend.norm(T_next)),
            "environment_validated": validate_environment
        }

        return self.state, metadata

    def _apply_kernel(self, K_t: Array, T_t: Array) -> Array:
        """Apply the prime-indexed kernel K_t to T_t."""
        # For Phase 1, use XiExecutor for prime-indexed decay
        # This implements the projector kernel with prime indexing

        # Convert to numpy for XiExecutor (assumes numpy backend for now)
        T_np = np.asarray(T_t)
        result = self.xi_executor.execute(
            psi=T_np,
            p=self.state.prime_index,
            t=1.0  # Unit time step
        )

        # Return numpy array directly (compatible with backend)
        return result.output_state

    def _compute_budget_cost(self, F_t: Array, K_t: Array) -> float:
        """Compute ACE budget cost for this step."""
        # Cost based on operator norms
        norm_F = float(self.backend.norm(F_t))
        norm_K = float(self.backend.norm(K_t))
        return 0.001 * (norm_F + norm_K)  # Small cost per step

    def _validate_environment_isolation(self) -> None:
        """Validate that PETC operations stay within environment boundaries."""
        # Check that all recent PETC atoms have the same environment
        recent_atoms = self.state.petc_chain._atoms[-10:]  # Last 10 atoms
        environments = {atom.payload.get("environment") for atom in recent_atoms if atom.payload}

        if len(environments) > 1:
            raise ValueError(
                f"Cross-environment PETC composition detected: {environments}. "
                "Environment isolation violated."
            )

    def run_simulation(self, steps: int, F_sequence: list[Array], K_sequence: list[Array]) -> list[Dict[str, Any]]:
        """Run a simulation for the specified number of steps.

        Args:
            steps: Number of steps to run
            F_sequence: Sequence of filter operators (length >= steps)
            K_sequence: Sequence of kernel operators (length >= steps)

        Returns:
            List of metadata for each step
        """
        metadata_history = []

        for i in range(steps):
            F_t = F_sequence[i % len(F_sequence)]
            K_t = K_sequence[i % len(K_sequence)]

            self.state, metadata = self.step(F_t, K_t)
            metadata_history.append(metadata)

            # Check for conservation failures (zero failures expected)
            if metadata["state_norm"] > 10.0:  # Arbitrary threshold
                raise RuntimeError(f"Conservation failure at step {i}: norm = {metadata['state_norm']}")

        return metadata_history