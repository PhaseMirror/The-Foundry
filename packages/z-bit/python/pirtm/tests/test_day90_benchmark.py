"""
Day 90 Benchmark: pirtm.step ≥10× NumPy on 512-dim tensor (Gate 7).

This gate measures actual recurrence-step throughput for the standalone
runtime against a NumPy baseline implementing the same linear law:

  x_{k+1} = G x_k
"""

from __future__ import annotations

import time

import numpy as np
import pytest

from pirtm.bindings.pirtm_runtime_bindings import check_runtime_available
from pirtm.core.executor import Backend, ExecutionResult, PirtmExecutor


class BenchmarkKernel:
    """Kernel stub providing only the state dimension."""

    def __init__(self, n_features: int):
        self.n_features = n_features


class BenchmarkPolicy:
    """Policy stub returning a fixed gain matrix."""

    def __init__(self, gain_matrix: np.ndarray):
        self._gain_matrix = np.array(gain_matrix, dtype=np.float64)

    def compute_gain_matrix(self, _kernel):
        return self._gain_matrix


def build_stable_gain_matrix(dim: int) -> np.ndarray:
    """Construct a contractive gain matrix with spectral radius below one."""
    diagonal = np.linspace(0.72, 0.92, dim, dtype=np.float64)
    gain_matrix = np.diag(diagonal)
    gain_matrix += np.eye(dim, k=1, dtype=np.float64) * 0.02
    gain_matrix += np.eye(dim, k=-1, dtype=np.float64) * 0.02
    return gain_matrix


def numpy_step_baseline(
    gain_matrix: np.ndarray,
    initial_state: np.ndarray,
    steps: int,
) -> tuple[np.ndarray, float]:
    """Execute the linear recurrence in pure NumPy and return elapsed time."""
    state = np.array(initial_state, dtype=np.float64)
    start = time.perf_counter()
    for _ in range(steps):
        state = gain_matrix @ state
    elapsed = time.perf_counter() - start
    return state, elapsed


def benchmark_runtime_executor(
    descriptor: dict[str, float | int],
    policy: BenchmarkPolicy,
    kernel: BenchmarkKernel,
    initial_state: np.ndarray,
    steps: int,
) -> ExecutionResult:
    """Benchmark the LLVM runtime without trajectory bookkeeping overhead."""
    executor = PirtmExecutor(Backend.LLVM)
    result = executor.run(
        descriptor,
        policy,
        kernel,
        steps=steps,
        initial_state=initial_state,
        return_trajectory=False,
    )
    return ExecutionResult(result)


@pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
def test_day90_step_throughput_gate():
    """Gate 7: LLVM pirtm.step throughput is at least 10× the NumPy baseline."""
    dim = 512
    steps = 1024
    gain_matrix = build_stable_gain_matrix(dim)
    policy = BenchmarkPolicy(gain_matrix)
    kernel = BenchmarkKernel(n_features=dim)
    descriptor = {'state_dim': dim, 'epsilon': 0.05}
    initial_state = np.linspace(-0.5, 0.5, dim, dtype=np.float64)

    baseline_state, baseline_time = numpy_step_baseline(gain_matrix, initial_state, steps)
    llvm_result = benchmark_runtime_executor(descriptor, policy, kernel, initial_state, steps)

    np.testing.assert_allclose(llvm_result.state, baseline_state, rtol=1e-9, atol=1e-9)

    speedup = baseline_time / llvm_result.execution_time
    assert speedup >= 10.0, (
        f"Day 90 gate failed: pirtm.step speedup {speedup:.2f}x < 10x "
        f"(numpy={baseline_time:.6f}s, llvm={llvm_result.execution_time:.6f}s)"
    )


def test_day90_benchmark_measures_step_throughput_not_spectral_radius():
    """The benchmark surface is step throughput, reported as steps per second."""
    result = ExecutionResult(
        {
            'state': np.zeros(4),
            'final_norm': 0.0,
            'backend': 'llvm',
            'execution_time': 0.25,
            'steps_completed': 1000,
            'trajectory': None,
        }
    )

    assert result.throughput == pytest.approx(4000.0)
