"""
Test Suite for ADR-011: Cumulant Storage and Persistence

Tests:
  1. Type validation (CumulantBundleType constraints)
  2. Round-trip serialization (determinism)
  3. Binary format compliance (pirtm-bc-v2.md)
  4. Emitter integration (Sigma output → MLIR)
  5. Linker integration (coupling matrix construction)
  6. Contractivity verification (spectral radius bounds)

Spec Reference:
  - ADR-011: Cumulant Storage and Persistence Model
  - docs/formats/pirtm-bc-v2.md: Binary format specification
  - AGENTS.md L0 invariants
"""

import pytest
import numpy as np
from blake3 import blake3
import struct

from pirtm.dialect.pirtm_types import (
    CumulantBundleType, create_cumulant_bundle, VerificationError, is_prime
)
from pirtm.transpiler.pirtm_emitter_cumulants import (
    CumulantEmitter, CumulantRecord, CumulantBytecodeSection
)
from pirtm.transpiler.pirtm_cumulant_linker import (
    CumulantLinkResolver, CumulantBundle, CouplingMatrix
)
from pirtm.sigma.wetterich_solver import WetterichSolver


# ===== Type Validation Tests =====

class TestCumulantBundleType:
    """Test CumulantBundleType constraints and verification."""
    
    def test_valid_bundle_creation(self):
        """Test creating a valid cumulant bundle."""
        bundle = create_cumulant_bundle(
            scale_k=1e16,
            prime_mod=7919,
            orders=[2, 3],
            spectral_radius=0.82,
            commitment="a" * 64  # Valid 64-char hex (all 'a's)
        )
        assert bundle.scale_k == 1e16
        assert bundle.prime_mod == 7919
        assert 2 in bundle.orders
        assert 3 in bundle.orders
        assert bundle.spectral_radius == 0.82
    
    def test_invalid_scale_k_negative(self):
        """Test that negative scale_k is rejected (L0 invariant #1)."""
        with pytest.raises(VerificationError, match="scale_k.*must be > 0"):
            create_cumulant_bundle(
                scale_k=-1e16,
                prime_mod=7919,
                orders=[2],
                spectral_radius=0.5,
                commitment="a" * 64
            )
    
    def test_invalid_scale_k_zero(self):
        """Test that zero scale_k is rejected."""
        with pytest.raises(VerificationError, match="scale_k.*must be > 0"):
            create_cumulant_bundle(
                scale_k=0.0,
                prime_mod=7919,
                orders=[2],
                spectral_radius=0.5,
                commitment="a" * 64
            )
    
    def test_invalid_prime_mod_composite(self):
        """Test that composite prime_mod is rejected (L0 invariant #1)."""
        with pytest.raises(VerificationError, match="is not prime"):
            create_cumulant_bundle(
                scale_k=1e16,
                prime_mod=7921,  # = 89 * 89 (not prime)
                orders=[2],
                spectral_radius=0.5,
                commitment="a" * 64
            )
    
    def test_invalid_order_too_small(self):
        """Test that order < 2 is rejected."""
        with pytest.raises(VerificationError, match="order.*invalid.*>= 2"):
            create_cumulant_bundle(
                scale_k=1e16,
                prime_mod=7919,
                orders=[1],  # Invalid (need n >= 2)
                spectral_radius=0.5,
                commitment="a" * 64
            )
    
    def test_invalid_spectral_radius_negative(self):
        """Test that negative spectral_radius is rejected."""
        with pytest.raises(VerificationError, match="spectral_radius.*out of range"):
            create_cumulant_bundle(
                scale_k=1e16,
                prime_mod=7919,
                orders=[2],
                spectral_radius=-0.1,
                commitment="a" * 64
            )
    
    def test_invalid_spectral_radius_too_large(self):
        """Test that ρ > 0.95 is rejected (contractivity margin δ ≥ 0.05)."""
        with pytest.raises(VerificationError, match="spectral_radius.*out of range"):
            create_cumulant_bundle(
                scale_k=1e16,
                prime_mod=7919,
                orders=[2],
                spectral_radius=0.96,  # Violates δ ≥ 0.05 bound
                commitment="a" * 64
            )
    
    def test_commitment_invalid_length(self):
        """Test that commitment with wrong length is rejected."""
        with pytest.raises(VerificationError, match="commitment.*64.*characters"):
            create_cumulant_bundle(
                scale_k=1e16,
                prime_mod=7919,
                orders=[2],
                spectral_radius=0.5,
                commitment="a" * 32  # Too short
            )
    
    def test_commitment_invalid_hex(self):
        """Test that non-hex commitment string is rejected."""
        with pytest.raises(VerificationError, match="commitment.*valid hex"):
            create_cumulant_bundle(
                scale_k=1e16,
                prime_mod=7919,
                orders=[2],
                spectral_radius=0.5,
                commitment="z" * 64  # 'z' is not hex character
            )
    
    def test_repr_string(self):
        """Test string representation."""
        bundle = create_cumulant_bundle(
            scale_k=1e16,
            prime_mod=7919,
            orders=[2, 3],
            spectral_radius=0.82,
            commitment="a" * 64
        )
        repr_str = repr(bundle)
        assert "1.00e+16" in repr_str
        assert "7919" in repr_str
        assert "[2, 3]" in repr_str
        assert "0.82" in repr_str


# ===== Emitter Tests =====

class TestCumulantEmitter:
    """Test cumulant emitter functionality."""
    
    @pytest.fixture
    def sigma_result(self):
        """Create a sample RGFlowResult from Sigma Kernel."""
        solver = WetterichSolver(coupling_4_init=0.045, coupling_6_init=0.032, prime_index=2)
        return solver.flow_to_scale(k_uv=1e10, k_ir=1e2, num_points=5)  # Small for speed
    
    def test_emitter_initialization(self):
        """Test emitter creation."""
        emitter = CumulantEmitter(prime_index=2)
        assert emitter.prime_index == 2
        assert len(emitter.timestamp) > 0
    
    def test_emit_mlir_ops(self, sigma_result):
        """Test MLIR operation emission."""
        emitter = CumulantEmitter(prime_index=2)
        ops = emitter.emit_mlir_ops(sigma_result)
        
        # Should have multiple ops (one per scale × order)
        assert len(ops) > 0
        
        # Each op should have required fields
        for op in ops:
            assert op["op_name"] == "pirtm.cumulant_embed"
            assert isinstance(op["bundle_type"], CumulantBundleType)
            assert "location" in op
            assert "commitment" in op
    
    def test_emit_bytecode_section(self, sigma_result):
        """Test bytecode section emission."""
        emitter = CumulantEmitter(prime_index=2)
        section = emitter.emit_bytecode_section(sigma_result)
        
        assert section.section_id == b"CMUR"
        assert len(section.records) > 0
        assert section.encoding == 1  # blake3
        
        # Each record should have valid structure
        for record in section.records:
            assert record.scale_k > 0
            assert record.prime_mod == 2
            assert record.order in [2, 3, 4]
            assert 0 <= record.spectral_radius <= 0.95
            assert len(record.commitment) == 64
    
    def test_serialize_deserialize_roundtrip(self, sigma_result):
        """
        MAIN GATE TEST: Deterministic round-trip serialization.
        
        Requirement (ADR-011):
        - Same cumulant set serialized twice → identical bytes
        - Round-trip deserialize → identical values
        - Hash commitment unchanged
        """
        emitter = CumulantEmitter(prime_index=2)
        section1 = emitter.emit_bytecode_section(sigma_result)
        
        # Serialize twice
        bytes1 = emitter.serialize_bytecode_section(section1)
        bytes2 = emitter.serialize_bytecode_section(section1)
        
        # Must be bit-for-bit identical
        assert bytes1 == bytes2, "Serialization not deterministic!"
        print(f"✓ Deterministic serialization: {len(bytes1)} bytes")
        
        # Deserialize
        section1_deser = emitter.deserialize_bytecode_section(bytes1)
        section2_deser = emitter.deserialize_bytecode_section(bytes2)
        
        # Verify structure
        assert len(section1_deser.records) == len(section1.records)
        
        # Verify data values match (float comparison with tolerance)
        for idx, record in enumerate(section1.records):
            deser_record = section1_deser.records[idx]
            
            assert record.scale_k == deser_record.scale_k
            assert record.prime_mod == deser_record.prime_mod
            assert record.order == deser_record.order
            assert record.spectral_radius == deser_record.spectral_radius
            
            np.testing.assert_allclose(
                record.data,
                deser_record.data,
                rtol=1e-15,
                atol=1e-15,
                err_msg=f"Round-trip mismatch at record {idx}"
            )
            
            assert record.commitment == deser_record.commitment
        
        print(f"✓ Round-trip serialization: all {len(section1.records)} records preserved")
    
    def test_hash_integrity(self, sigma_result):
        """Test that cumulant hashes are deterministic and correct."""
        emitter = CumulantEmitter(prime_index=2)
        section = emitter.emit_bytecode_section(sigma_result)
        
        # Serialize and deserialize
        bytecode = emitter.serialize_bytecode_section(section)
        section_deser = emitter.deserialize_bytecode_section(bytecode)
        
        # For each record, verify hash computation
        for record_orig, record_deser in zip(section.records, section_deser.records):
            data_bytes = emitter._serialize_cumulant_data(record_orig.data)
            expected_hash = blake3(data_bytes).hexdigest()
            
            assert record_deser.commitment == expected_hash
            assert record_deser.commitment == record_orig.commitment
        
        print(f"✓ Hash integrity: all {len(section.records)} hashes verified")


# ===== Linker Tests =====

class TestCumulantLinker:
    """Test cumulant linker functionality."""
    
    @pytest.fixture
    def bytecode_sections(self):
        """Create sample bytecode sections from two modules."""
        solver1 = WetterichSolver(coupling_4_init=0.045, coupling_6_init=0.032, prime_index=2)
        result1 = solver1.flow_to_scale(k_uv=1e10, k_ir=1e2, num_points=3)
        
        solver2 = WetterichSolver(coupling_4_init=0.050, coupling_6_init=0.035, prime_index=5)
        result2 = solver2.flow_to_scale(k_uv=1e10, k_ir=1e2, num_points=3)
        
        emitter1 = CumulantEmitter(prime_index=2)
        emitter2 = CumulantEmitter(prime_index=5)
        
        section1 = emitter1.emit_bytecode_section(result1)
        section2 = emitter2.emit_bytecode_section(result2)
        
        return [section1, section2]
    
    def test_pass_1_collect(self, bytecode_sections):
        """Test Pass 1: Collection of cumulant bundles."""
        resolver = CumulantLinkResolver(verbose=True)
        bundles = resolver.pass_1_collect(bytecode_sections)
        
        # Should collect from both modules
        assert len(bundles) > 0
        
        # Check bundle keys
        for key, bundle in bundles.items():
            scale_k, prime_mod = key
            assert scale_k > 0
            assert prime_mod in [2, 5]
            assert len(bundle.orders) > 0
    
    def test_pass_2_construct_coupling_matrix(self, bytecode_sections):
        """Test Pass 2: Coupling matrix construction."""
        resolver = CumulantLinkResolver(verbose=True)
        resolver.pass_1_collect(bytecode_sections)
        
        coupling_matrix, scales, primes = resolver.pass_2_construct_coupling_matrix()
        
        # Check structure
        assert coupling_matrix.matrix.shape == (len(primes), len(primes))
        assert len(scales) > 0
        assert len(primes) == 2  # Two modules
        assert 2 in primes
        assert 5 in primes
        
        # Matrix should be non-negative (correlations)
        assert np.all(coupling_matrix.matrix >= -1e-10)
    
    def test_pass_3_global_spectral_radius(self, bytecode_sections):
        """Test Pass 3: Global spectral radius computation."""
        resolver = CumulantLinkResolver(verbose=True)
        resolver.pass_1_collect(bytecode_sections)
        coupling_matrix, _, _ = resolver.pass_2_construct_coupling_matrix()
        
        spectral_radius, is_safe = resolver.pass_3_global_spectral_radius(coupling_matrix)
        
        # Check bounds
        assert 0.0 <= spectral_radius <= 1.0
        
        # Should be contractile (given Sigma output)
        assert spectral_radius < 0.95
        assert is_safe
    
    def test_link_all_integration(self, bytecode_sections):
        """Test full linking pipeline (all three passes)."""
        resolver = CumulantLinkResolver(verbose=True)
        spectral_radius, is_safe, coupling_matrix = resolver.link_all(bytecode_sections)
        
        # Check results
        assert 0.0 <= spectral_radius <= 1.0
        assert is_safe
        assert coupling_matrix.spectral_radius == spectral_radius
        assert len(coupling_matrix.matrix) > 0
    
    def test_diagnostics_capture(self, bytecode_sections):
        """Test that diagnostics are captured during linking."""
        resolver = CumulantLinkResolver(verbose=True)  # Enable verbose to capture diagnostics
        resolver.link_all(bytecode_sections)
        
        diagnostics = resolver.get_diagnostics()
        assert len(diagnostics) >= 1  # At least one diagnostic captured
        
        # Check for expected messages (at least some should be present)
        diag_text = "\n".join(diagnostics)
        assert any(keyword in diag_text for keyword in ["Pass", "Collect", "Construct", "Spectral"])


# ===== Integration Tests =====

class TestADR011Integration:
    """End-to-end integration tests for ADR-011."""
    
    def test_sigma_to_emitter_to_linker_pipeline(self):
        """
        Full pipeline test: Sigma → Emitter → Bytecode → Linker.
        
        Requirement (ADR-011):
        - Sigma output can be emitted to bytecode
        - Bytecode round-trips deterministically
        - Linker can resolve multiple modules
        - Global spectral radius is contractile
        """
        # Create Sigma output for two modules
        primes = [2, 5]
        solvers = [
            WetterichSolver(coupling_4_init=0.045, coupling_6_init=0.032, prime_index=p)
            for p in primes
        ]
        
        results = [
            solver.flow_to_scale(k_uv=1e10, k_ir=1e2, num_points=4)
            for solver in solvers
        ]
        
        # Emit bytecode sections
        sections = []
        for prime, result in zip(primes, results):
            emitter = CumulantEmitter(prime_index=prime)
            section = emitter.emit_bytecode_section(result)
            sections.append(section)
        
        # Link all modules
        resolver = CumulantLinkResolver(verbose=True)
        spectral_radius, is_safe, coupling_matrix = resolver.link_all(sections)
        
        # Verification
        assert is_safe, f"Global ρ={spectral_radius} exceeds safe limit 0.95"
        assert spectral_radius < 0.95
        
        print(f"\n✓ Full pipeline test PASSED:")
        print(f"  - {len(primes)} modules linked")
        print(f"  - {len(coupling_matrix.scales)} scales integrated")
        print(f"  - Global spectral radius: ρ={spectral_radius:.4f}")
        print(f"  - Contractivity margin: δ={1-spectral_radius:.4f}")
        print(f"  - Coupling matrix condition: κ={coupling_matrix.condition_number:.4f}")


# ===== Pytest Configuration =====

if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
