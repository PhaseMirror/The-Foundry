"""
MLIRDecompiler: Extract PIRTM descriptors from emitted MLIR.

Phase 5 Component 1: Descriptor → MLIR → Python AST → Execution

Purpose:
    Decompress MLIR back to Python representation, verify round-trip integrity,
    and compare execution results between Python and MLIR implementations.

Architecture:
    MLIR text
        ↓
    MLIRDecompiler.extract_config()
        ↓
    MLIRConfig (ε, prime_index, ‖T‖, confidence)
        ↓
    Reconstruct Python execution model
        ↓
    Compare outputs (fpt tolerance: ±1e-6)

Status: Phase 5 Implementation
Related: ADR-024-round-trip-validation.md
"""

import re
from typing import Dict, Tuple, Optional, Any
from dataclasses import dataclass
import numpy as np


@dataclass
class ExtractedConfig:
    """Configuration extracted from MLIR text."""
    
    # Basic contractivity metadata
    epsilon: float
    confidence: float
    op_norm_T: float
    prime_index: int
    
    # Operational parameters
    dimension: int = 512
    trace_id: Optional[str] = None
    witness_hash: Optional[str] = None
    
    # Execution parameters
    tolerance: float = 1e-6  # Floating-point comparison threshold
    max_iterations: int = 100
    convergence_threshold: float = 1e-8


class MLIRDecompiler:
    """
    Extract PIRTM configuration from MLIR bytecode.
    
    Provides:
    - Parameter extraction (regex-based parsing)
    - Validation of extracted values
    - Reconstruction of Python execution model
    - Round-trip integrity verification
    """
    
    # Regex patterns for extraction
    EPSILON_PATTERNS = [
        r'@epsilon\s*=\s*([\d.eE+-]+)\s*:\s*(?:f32|f64)',
        r'@epsilon\s*=\s*([\d.eE+-]+)',
    ]
    CONFIDENCE_PATTERNS = [
        r'@confidence\s*=\s*([\d.eE+-]+)\s*:\s*(?:f32|f64)',
        r'@confidence\s*=\s*([\d.eE+-]+)',
    ]
    OP_NORM_PATTERNS = [
        r'@op_norm_T\s*=\s*([\d.eE+-]+)\s*:\s*(?:f32|f64)',
        r'@op_norm_T\s*=\s*([\d.eE+-]+)',
    ]
    PRIME_INDEX_PATTERNS = [
        r'prime_index\s*=\s*(\d+)\s*:\s*i64',
        r'@prime_index\s*=\s*(\d+)',
    ]
    DIMENSION_PATTERNS = [
        r'@dimension\s*=\s*(\d+)',
    ]
    TRACE_ID_PATTERNS = [
        r'@trace_id\s*=\s*"([^"]+)"',
    ]
    WITNESS_HASH_PATTERNS = [
        r'@witness_hash\s*=\s*"([^"]+)"',
    ]
    
    def __init__(self):
        """Initialize decompiler."""
        self.patterns = {
            'epsilon': self.EPSILON_PATTERNS,
            'confidence': self.CONFIDENCE_PATTERNS,
            'op_norm_T': self.OP_NORM_PATTERNS,
            'prime_index': self.PRIME_INDEX_PATTERNS,
            'dimension': self.DIMENSION_PATTERNS,
            'trace_id': self.TRACE_ID_PATTERNS,
            'witness_hash': self.WITNESS_HASH_PATTERNS,
        }
    
    def extract_config(self, mlir_text: str) -> Tuple[bool, Optional[ExtractedConfig], str]:
        """
        Extract configuration from MLIR module.
        
        Args:
            mlir_text: MLIR source code
        
        Returns:
            (success: bool, config: ExtractedConfig, message: str)
        """
        config_dict = {}
        errors = []
        
        # Required fields
        required = {
            'epsilon': ('epsilon', float),
            'confidence': ('confidence', float),
            'op_norm_T': ('op_norm_T', float),
            'prime_index': ('prime_index', int),
        }
        
        for key, (name, typ) in required.items():
            patterns = self.patterns.get(key, [])
            found = False
            for pattern in patterns:
                match = re.search(pattern, mlir_text)
                if match:
                    try:
                        value = typ(match.group(1))
                        config_dict[name] = value
                        found = True
                        break
                    except (ValueError, IndexError):
                        continue
            
            if not found:
                # Provide fallback for confidence if not found
                if key == 'confidence':
                    config_dict[name] = 1.0
                else:
                    errors.append(f"Missing required field: {key}")
        
        if errors:
            return False, None, "; ".join(errors)
        
        # Optional fields
        optional = {
            'dimension': ('dimension', int, 512),
            'trace_id': ('trace_id', str, None),
            'witness_hash': ('witness_hash', str, None),
        }
        
        for key, (name, typ, default) in optional.items():
            patterns = self.patterns.get(key, [])
            found = False
            for pattern in patterns:
                match = re.search(pattern, mlir_text)
                if match:
                    try:
                        config_dict[name] = typ(match.group(1))
                        found = True
                        break
                    except (ValueError, IndexError):
                        continue
            
            if not found:
                config_dict[name] = default
        
        config = ExtractedConfig(**config_dict)
        return True, config, "Configuration extracted successfully"
    
    def validate_contractivity(self, config: ExtractedConfig) -> Tuple[bool, str]:
        """
        Validate contractivity bounds.
        
        Args:
            config: Extracted configuration
        
        Returns:
            (is_valid: bool, message: str)
        """
        checks = [
            (0 < config.epsilon < 1.0, "Epsilon must be in (0, 1)"),
            (0 < config.confidence <= 1.0, "Confidence must be in (0, 1]"),
            (0 < config.op_norm_T <= 2.0, "‖T‖ must be in (0, 2]"),
            (config.prime_index > 1, "Prime index must be > 1"),
            (config.dimension > 0, "Dimension must be > 0"),
        ]
        
        failures = [msg for check, msg in checks if not check]
        
        if failures:
            return False, "; ".join(failures)
        
        return True, "All contractivity bounds valid"
    
    def reconstruct_execution_kwargs(self, config: ExtractedConfig) -> Dict[str, Any]:
        """
        Reconstruct keyword arguments for Python backend execution.
        
        Args:
            config: Extracted configuration
        
        Returns:
            Dictionary of kwargs for backend.pirtm_update()
        """
        return {
            'epsilon': config.epsilon,
            'confidence': config.confidence,
            'op_norm_T': config.op_norm_T,
            'prime_index': config.prime_index,
            'dimension': config.dimension,
            'max_iterations': config.max_iterations,
            'convergence_threshold': config.convergence_threshold,
            'trace_id': config.trace_id,
        }


def round_trip_compare(
    original_output: np.ndarray,
    mlir_output: np.ndarray,
    tolerance: float = 1e-6
) -> Tuple[bool, str]:
    """
    Compare outputs from Python and MLIR implementations.
    
    Args:
        original_output: NumPy reference output
        mlir_output: Output from MLIR execution
        tolerance: Maximum allowed difference
    
    Returns:
        (matches: bool, report: str)
    """
    if original_output.shape != mlir_output.shape:
        return False, f"Shape mismatch: {original_output.shape} vs {mlir_output.shape}"
    
    diff = np.abs(original_output - mlir_output)
    max_diff = np.max(diff)
    mean_diff = np.mean(diff)
    
    matches = max_diff <= tolerance
    
    report = (
        f"Round-trip comparison:\n"
        f"  Max difference: {max_diff:.2e}\n"
        f"  Mean difference: {mean_diff:.2e}\n"
        f"  Threshold: {tolerance:.2e}\n"
        f"  Status: {'✅ PASS' if matches else '❌ FAIL'}"
    )
    
    return matches, report
