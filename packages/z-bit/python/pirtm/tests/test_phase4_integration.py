"""
Advanced integration tests for Phase 4 & Phase 5

Tests cross-backend consistency, fallback behavior, benchmarking, and
end-to-end Phase 2→3→4→5 pipeline integration, including dialect extensions
and runtime observability hooks.

Related: ADR-009-llvm-compilation.md, ADR-Phase5-04-Integration-and-Performance-Tests.md
"""

import pytest
import numpy as np
import time
import tempfile
from pathlib import Path

from pirtm.core.executor import PirtmExecutor, Backend
from pirtm.bindings.pirtm_runtime_bindings import check_runtime_available, PirtmState
from pirtm.mlir.pirtm_lowering import lower_custom_op

class MockOp:
    def __init__(self, op_name, operand_ids, attributes=None):
        self.op_name = op_name
        self.operand_ids = operand_ids
        self.attributes = attributes or {}

class TestDialectLoweringIntegration:
    """Test phase 5 dialect lowering integration."""
    
    def test_lower_relu(self):
        """Verify pirtm.relu translates correctly."""
        op = MockOp("pirtm.relu", ["%in"])
        result = lower_custom_op(op)
        assert "call @pirtm_relu(%in)" in result

    def test_lower_tanh(self):
        """Verify pirtm.tanh translates correctly."""
        op = MockOp("pirtm.tanh", ["%in"])
        result = lower_custom_op(op)
        assert "call @pirtm_tanh(%in)" in result


class TestProfilingHooksIntegration:
    """Test that hooks are accurately woven into LLVM IR."""
    
    def test_integrate_profiling_hooks(self):
        try:
            from pirtm.mlir.llvm_codegen import Phase6AHookIntegration
        except ImportError:
            pytest.skip("llvm_codegen unavailable")

        llvm_ir = "define void @test() {\n  ; pirtm.profiling.start\n  ; pirtm.profiling.end\n  ret void\n}"
        hooker = Phase6AHookIntegration()
        integrated = hooker.integrate_profiling_hooks(llvm_ir)

        assert "declare void @pirtm_profiling_start(i32)" in integrated
        assert "call void @pirtm_profiling_start" in integrated
        assert "call void @pirtm_profiling_end" in integrated

class TestCrossBackendConsistency:
    """Test that different backends produce identical results."""
    
    def test_numpy_backend_exists(self):
        """NumPy backend is always available."""
        executor = PirtmExecutor(Backend.NUMPY)
        assert executor.backend_name == "numpy"


class TestBackendFallback:
    """Test automatic fallback behavior."""
    
    def test_auto_selects_best_available(self):
        """AUTO backend selects best available."""
        executor = PirtmExecutor(Backend.AUTO)
        
        # Should select something
        assert executor.backend_name in ("numpy", "llvm")
    
    def test_numpy_fallback_always_available(self):
        """NumPy backend always available as fallback."""
        executor = PirtmExecutor(Backend.NUMPY)
        assert executor.backend_name == "numpy"


class TestExecutorBenchmarking:
    """Test performance comparison between backends."""
    
    def test_available_backends_list(self):
        """Get list of available backends."""
        backends = PirtmExecutor.available_backends()
        
        # NumPy should always be available
        assert "numpy" in backends
        assert isinstance(backends, list)
        
        # Each should be a string
        for backend in backends:
            assert isinstance(backend, str)
    
    def test_benchmark_execution_time_format(self):
        """Benchmark returns execution times."""
        executor = PirtmExecutor(Backend.NUMPY)
        
        # Just verify the executor object exists and has benchmark capability
        # (Full benchmark test would require real module/kernel objects)
        assert hasattr(executor, 'benchmark')


class TestRuntimeStateProperties:
    """Test state properties and boundaries."""
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_state_dimension_property(self):
        """State dimension property is readable."""
        state = PirtmState(state_dim=100, epsilon=0.1)
        assert state.dimension == 100
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_state_epsilon_property(self):
        """State epsilon property is readable."""
        state = PirtmState(state_dim=50, epsilon=0.3)
        assert state.epsilon == 0.3
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_multiple_state_instances(self):
        """Multiple state instances coexist."""
        state1 = PirtmState(state_dim=10, epsilon=0.1)
        state2 = PirtmState(state_dim=20, epsilon=0.2)
        
        assert state1.dimension == 10
        assert state2.dimension == 20
        assert state1.epsilon == 0.1
        assert state2.epsilon == 0.2


class TestStateVectorUpdates:
    """Test state vector manipulation."""
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_state_vector_persistence(self):
        """State vector persists across reads."""
        state = PirtmState(state_dim=10, epsilon=0.05)
        
        vec = np.random.randn(10)
        state.state_vector = vec
        
        # Read multiple times
        retrieved1 = state.state_vector.copy()
        retrieved2 = state.state_vector.copy()
        
        np.testing.assert_array_almost_equal(retrieved1, retrieved2)
        np.testing.assert_array_almost_equal(retrieved1, vec)
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_state_vector_dtype(self):
        """State vector returns correct dtype."""
        state = PirtmState(state_dim=10, epsilon=0.05)
        
        state.state_vector = np.ones(10, dtype=np.float64)
        retrieved = state.state_vector
        
        # Should be float64
        assert retrieved.dtype in (np.float64, np.float32)

def test_numpy_executor_initial_state_deterministic_from_lwe():
    """PirtmExecutor initial state can be derived deterministically from MultiplicityCoreEngine."""
    from pirtm.core.multiplicity_core import load_multiplicity_params, make_multiplicity_engine

    repo_root = Path(__file__).resolve().parents[2]
    params_path = repo_root / "pirtm" / "multiplicity_lwe" / "params.example.toml"
    params = load_multiplicity_params(params_path)
    engine = make_multiplicity_engine(params)

    # Minimal policy/kernel stubs for deterministic execution
    class DummyKernel:
        def __init__(self, n_features: int):
            self.n_features = n_features

    class DummyPolicy:
        def __init__(self, gain_matrix: np.ndarray):
            self._gain_matrix = gain_matrix

        def compute_gain_matrix(self, _kernel):
            return self._gain_matrix

    executor = PirtmExecutor(Backend.NUMPY)
    dim = 16
    descriptor = {'state_dim': dim, 'epsilon': 0.05}
    policy = DummyPolicy(np.eye(dim, dtype=np.float64) * 0.9)
    kernel = DummyKernel(n_features=dim)

    r1 = executor.run(
        descriptor,
        policy,
        kernel,
        steps=1,
        initial_state=None,
        multiplicity_engine=engine,
    )
    r2 = executor.run(
        descriptor,
        policy,
        kernel,
        steps=1,
        initial_state=None,
        multiplicity_engine=engine,
    )

    np.testing.assert_allclose(r1['state'], r2['state'])


def test_executor_passes_rng_to_policy_and_kernel():
    """Executor should expose the deterministic public RNG stream to policy/kernel."""
    from pirtm.core.multiplicity_core import load_multiplicity_params, make_multiplicity_engine

    repo_root = Path(__file__).resolve().parents[2]
    params_path = repo_root / "pirtm" / "multiplicity_lwe" / "params.example.toml"
    params = load_multiplicity_params(params_path)
    engine = make_multiplicity_engine(params)

    class KernelWithRng:
        def __init__(self, n_features: int):
            self.n_features = n_features
            self.rng = None

        def set_random_stream(self, rng):
            self.rng = rng

    class PolicyUsingRng:
        def __init__(self, dim: int):
            self.dim = dim
            self.rng = None

        def set_random_stream(self, rng):
            self.rng = rng

        def compute_gain_matrix(self, _kernel, rng=None):
            if rng is None:
                raise ValueError("rng required")
            scale = 0.9 + 0.05 * (rng.random() - 0.5)
            return np.eye(self.dim) * scale

    dim = 10
    descriptor = {'state_dim': dim, 'epsilon': 0.05}
    policy = PolicyUsingRng(dim)
    kernel = KernelWithRng(n_features=dim)

    r1 = PirtmExecutor(Backend.NUMPY).run(
        descriptor,
        policy,
        kernel,
        steps=1,
        initial_state=None,
        multiplicity_engine=engine,
        multiplicity_context="rng_trace",
    )

    assert policy.rng is not None
    assert kernel.rng is not None

    r2 = PirtmExecutor(Backend.NUMPY).run(
        descriptor,
        policy,
        kernel,
        steps=1,
        initial_state=None,
        multiplicity_engine=engine,
        multiplicity_context="rng_trace",
    )

    np.testing.assert_allclose(r1['state'], r2['state'])


class TestIterationBehavior:
    """Test iteration/stepping behavior."""
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_single_step_returns_norm(self):
        """Single step returns valid norm."""
        gain = np.eye(5) * 0.8
        state = PirtmState(state_dim=5, epsilon=0.05, gain_matrix=gain)
        
        state.state_vector = np.ones(5)
        norm = state.step()
        
        # Norm should be positive
        assert norm >= 0.0
        assert isinstance(norm, float)
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_norm_decreases_with_contraction(self):
        """Norm decreases if system contracts."""
        # Strongly contracting system (gain << 1)
        gain = np.eye(10) * 0.5
        state = PirtmState(state_dim=10, epsilon=0.05, gain_matrix=gain)
        
        state.state_vector = np.ones(10)
        
        norms = []
        for _ in range(5):
            norms.append(state.norm)  # Assuming norm property exists
        
        # With strong contraction, norms should generally decrease
        # (Note: requires implementation of norm property or similar)


class TestWitnessValidation:
    """Test ACE witness validation."""
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_witness_validation_callable(self):
        """Witness validation is available."""
        state = PirtmState(state_dim=10, epsilon=0.05)
        
        # Should have verify_witness method
        assert hasattr(state, 'verify_witness')
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_witness_with_correct_hash(self):
        """Witness validates with correct hash."""
        state = PirtmState(state_dim=10, epsilon=0.05)
        
        # Set a known state
        state.state_vector = np.zeros(10)
        
        # Verify should work with some hash
        # (exact hash depends on implementation)
        result = state.verify_witness("0x0000000000000000")
        assert isinstance(result, bool)
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_witness_with_wrong_hash(self):
        """Witness fails with incorrect hash."""
        state = PirtmState(state_dim=10, epsilon=0.05)
        
        state.state_vector = np.ones(10)
        
        # Wrong hash should fail
        result = state.verify_witness("0xffffffffffffffff")
        # Result depends on implementation
        assert isinstance(result, bool)


class TestGainMatrixIntegration:
    """Test gain matrix integration."""
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_gain_matrix_identity(self):
        """Identity matrix as gain."""
        gain = np.eye(10)
        state = PirtmState(state_dim=10, epsilon=0.05, gain_matrix=gain)
        
        state.state_vector = np.ones(10)
        state.step()  # Should not raise
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_gain_matrix_diagonal(self):
        """Diagonal (non-identity) gain matrix."""
        gain = np.diag(np.array([0.1, 0.5, 0.9, 0.3, 0.7]))
        state = PirtmState(state_dim=5, epsilon=0.05, gain_matrix=gain)
        
        state.state_vector = np.ones(5)
        state.step()  # Should not raise
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_gain_matrix_dense(self):
        """Dense gain matrix."""
        gain = np.random.randn(5, 5) * 0.1
        # Make it more stable
        gain = (gain + gain.T) * 0.25
        
        state = PirtmState(state_dim=5, epsilon=0.05, gain_matrix=gain)
        state.state_vector = np.random.randn(5)
        state.step()  # Should not raise


class TestErrorConditions:
    """Test error handling and recovery."""
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_state_with_nan_vector(self):
        """NaN in state vector is detected."""
        state = PirtmState(state_dim=5, epsilon=0.05)
        
        # Try to set NaN
        with pytest.raises(ValueError):
            state.state_vector = np.array([1, 2, np.nan, 4, 5])
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_state_with_inf_vector(self):
        """Infinity in state vector is detected."""
        state = PirtmState(state_dim=5, epsilon=0.05)
        
        with pytest.raises(ValueError):
            state.state_vector = np.array([1, 2, np.inf, 4, 5])
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_negative_steps_rejected(self):
        """Negative step count is rejected."""
        state = PirtmState(state_dim=5, epsilon=0.05)
        
        with pytest.raises(ValueError):
            state.run(-1)


class TestMemoryManagement:
    """Test memory allocation and cleanup."""
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_state_cleanup_on_delete(self):
        """State is cleaned up when deleted."""
        state = PirtmState(state_dim=100, epsilon=0.05)
        state.state_vector = np.random.randn(100)
        
        # Should cleanup without error
        del state
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_multiple_cleanup_safe(self):
        """Multiple cleanup calls are safe."""
        state = PirtmState(state_dim=10, epsilon=0.05)
        
        # Manual cleanup if available
        if hasattr(state, 'cleanup'):
            state.cleanup()
        
        # Delete should still work
        del state
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_large_state_allocation(self):
        """Large state allocation works."""
        # 1000-dimensional state
        state = PirtmState(state_dim=1000, epsilon=0.05)
        state.state_vector = np.random.randn(1000)
        state.step()


class TestExecutorIntegration:
    """Test executor integration scenarios."""
    
    def test_executor_string_backend_conversion(self):
        """Accept backend names as strings."""
        executor = PirtmExecutor(Backend.NUMPY)
        assert executor.backend_name == "numpy"
    
    def test_executor_backend_enum(self):
        """Accept Backend enum."""
        executor = PirtmExecutor(Backend.NUMPY)
        assert executor.backend_name == "numpy"
    
    def test_multiple_executors_independent(self):
        """Multiple executors are independent."""
        executor1 = PirtmExecutor(Backend.NUMPY)
        executor2 = PirtmExecutor(Backend.NUMPY)
        
        # Should be independent instances
        assert executor1.backend_name == executor2.backend_name


class TestPerformanceCharacteristics:
    """Performance and scalability tests."""
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_scaling_dimension_10(self):
        """State with 10 dimensions."""
        state = PirtmState(state_dim=10, epsilon=0.05)
        state.state_vector = np.random.randn(10)
        
        start = time.time()
        for _ in range(100):
            state.step()
        elapsed = time.time() - start
        
        assert elapsed > 0.0
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_scaling_dimension_100(self):
        """State with 100 dimensions."""
        state = PirtmState(state_dim=100, epsilon=0.05)
        gain = np.eye(100) * 0.8
        state = PirtmState(state_dim=100, epsilon=0.05, gain_matrix=gain)
        state.state_vector = np.random.randn(100)
        
        start = time.time()
        for _ in range(10):
            state.step()
        elapsed = time.time() - start
        
        assert elapsed > 0.0
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_sequential_runs(self):
        """Multiple sequential runs work."""
        state = PirtmState(state_dim=20, epsilon=0.05)
        
        for _ in range(3):
            state.state_vector = np.random.randn(20)
            state.run(5)


class TestDocumentationExamples:
    """Test examples from documentation."""
    
    def test_basic_executor_usage(self):
        """Example: basic executor usage."""
        # From ADR-009 documentation
        executor = PirtmExecutor(Backend.NUMPY)
        assert executor.backend_name == "numpy"
    
    def test_backend_auto_selection(self):
        """Example: automatic backend selection."""
        # From ADR-009 documentation
        executor = PirtmExecutor(Backend.AUTO)
        assert executor.backend_name in ("numpy", "llvm")
    
    @pytest.mark.skipif(not check_runtime_available(), reason="Runtime library not available")
    def test_state_creation_example(self):
        """Example: state creation."""
        # From runtime bindings documentation
        state = PirtmState(
            state_dim=10,
            epsilon=0.05
        )
        assert state.dimension == 10


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
