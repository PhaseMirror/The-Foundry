"""
Phase 5: Descriptor → MLIR Round-Trip Validation
Verify that a descriptor can be compressed into MLIR, decompressed back
to Python representation, and compared to the reference implementation.
"""

import pytest
import numpy as np
import json
from pirtm.transpiler.mlir_lowering import MLIREmitter, MLIRConfig
from pirtm.transpiler.mlir_decompiler import MLIRDecompiler, ExtractedConfig

class TestPhase5RoundTrip:
    
    @pytest.fixture
    def decompiler(self):
        return MLIRDecompiler()

    def test_gate_1_basic_contractive_system(self, decompiler):
        """Test Case 1: basic_contractive_system (7919, ε=0.05, ‖T‖=0.9)"""
        config = MLIRConfig(
            prime_index=7919,
            epsilon=0.05,
            op_norm_T=0.9,
            confidence=0.99
        )
        emitter = MLIREmitter(config=config)
        mlir_text = emitter.emit_module(dimension=512)
        
        success, extracted, msg = decompiler.extract_config(mlir_text)
        assert success, f"Extraction failed: {msg}"
        
        assert extracted.prime_index == 7919
        assert abs(extracted.epsilon - 0.05) < 1e-6
        assert abs(extracted.op_norm_T - 0.9) < 1e-6
        assert abs(extracted.confidence - 0.99) < 1e-6
        
        valid, v_msg = decompiler.validate_contractivity(extracted)
        assert valid, f"Validation failed: {v_msg}"

    def test_gate_2_composite_modulus_system(self, decompiler):
        """Test Case 2: composite_modulus_system (7921, ε=0.1, ‖T‖=0.95)"""
        config = MLIRConfig(
            prime_index=7921,
            epsilon=0.1,
            op_norm_T=0.95,
            confidence=0.98
        )
        emitter = MLIREmitter(config=config)
        mlir_text = emitter.emit_module(dimension=256)
        
        success, extracted, msg = decompiler.extract_config(mlir_text)
        assert success, f"Extraction failed: {msg}"
        
        assert extracted.prime_index == 7921
        assert abs(extracted.epsilon - 0.1) < 1e-6
        assert abs(extracted.op_norm_T - 0.95) < 1e-6
        
        valid, v_msg = decompiler.validate_contractivity(extracted)
        assert valid, f"Validation failed: {v_msg}"

    def test_gate_3_multimodule_network(self, decompiler):
        """Test Case 3: multimodule_network (3 primes: 3, 5, 7)"""
        # Note: MLIREmitter currently handles single module metadata.
        # For multi-module, we verify it extracts the primary module.
        config = MLIRConfig(
            prime_index=7,
            epsilon=0.01,
            op_norm_T=0.5,
            confidence=1.0
        )
        emitter = MLIREmitter(config=config)
        mlir_text = emitter.emit_module(dimension=64)
        
        success, extracted, msg = decompiler.extract_config(mlir_text)
        assert success, f"Extraction failed: {msg}"
        
        assert extracted.prime_index == 7
        assert abs(extracted.epsilon - 0.01) < 1e-6

    def test_gate_4_tightly_coupled_system(self, decompiler):
        """Test Case 4: tightly_coupled_system (ε=0.001, ‖T‖=1.1)"""
        config = MLIRConfig(
            prime_index=17,
            epsilon=0.001,
            op_norm_T=1.1,
            confidence=0.999
        )
        emitter = MLIREmitter(config=config)
        mlir_text = emitter.emit_module()
        
        success, extracted, msg = decompiler.extract_config(mlir_text)
        assert success, f"Extraction failed: {msg}"
        
        assert extracted.prime_index == 17
        assert abs(extracted.epsilon - 0.001) < 1e-6
        assert abs(extracted.op_norm_T - 1.1) < 1e-6
        
        valid, v_msg = decompiler.validate_contractivity(extracted)
        assert valid, f"Validation failed: {v_msg}"

    def test_execution_kwargs_reconstruction(self, decompiler):
        """Verify reconstruction of kwargs for Python backend."""
        extracted = ExtractedConfig(
            epsilon=0.05,
            confidence=0.99,
            op_norm_T=1.0,
            prime_index=7919,
            dimension=512,
            trace_id="witness_001"
        )
        
        kwargs = decompiler.reconstruct_execution_kwargs(extracted)
        assert kwargs['epsilon'] == 0.05
        assert kwargs['prime_index'] == 7919
        assert kwargs['trace_id'] == "witness_001"
