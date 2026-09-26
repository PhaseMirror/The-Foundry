"""
Phase 6A-4: Python ctypes Binding Layer

Provides Python interface to compiled PIRTM .so binaries via ctypes.

Allows calling compiled C++ functions from Python with:
  - Type-safe argument passing
  - Exception handling
  - Memory management
  - Performance measurement integration

Status: Phase 6A Week 1 Implementation
Related: ADR-062 (Day 90 Performance Baseline)
"""

import ctypes
import os
import numpy as np
from pathlib import Path
from typing import Optional, Dict, Any
import tempfile
import json


class PirtmCompiledModule:
    """
    Phase 6A-4: Load and execute compiled PIRTM descriptor via ctypes.
    
    Wraps a .so library produced by Phase 6A-3 compilation.
    Provides type-safe Python interface to pirtm_step() and related functions.
    """
    
    def __init__(self, so_path: str):
        """
        Load compiled PIRTM module from .so file.
        
        Args:
            so_path: Path to compiled .so file
        
        Raises:
            FileNotFoundError: If .so file doesn't exist
            OSError: If loading .so fails
        """
        if not os.path.exists(so_path):
            raise FileNotFoundError(f"Compiled module not found: {so_path}")
        
        self.so_path = so_path
        self.lib = ctypes.CDLL(so_path)
        self._setup_function_signatures()
    
    def _setup_function_signatures(self):
        """Define C function signatures and return types."""
        
        # pirtm_step(float* X, int dimension, int num_iterations) → int
        # Returns: 0 on success, < 0 on error
        self.lib.pirtm_step.argtypes = [
            ctypes.POINTER(ctypes.c_float),  # X (input/output array)
            ctypes.c_int,                     # dimension (matrix size)
            ctypes.c_int                      # num_iterations
        ]
        self.lib.pirtm_step.restype = ctypes.c_int
        
        # Hook functions (if present)
        try:
            self.lib.pirtm_activation_enter.argtypes = [
                ctypes.POINTER(ctypes.c_float),  # x
                ctypes.c_uint64,                  # size
                ctypes.c_uint32                   # op_id
            ]
            self.lib.pirtm_activation_enter.restype = None
        except AttributeError:
            self.lib.pirtm_activation_enter = None
        
        try:
            self.lib.pirtm_activation_exit.argtypes = [
                ctypes.POINTER(ctypes.c_float),  # x
                ctypes.c_uint64,                  # size
                ctypes.c_uint32                   # op_id
            ]
            self.lib.pirtm_activation_exit.restype = None
        except AttributeError:
            self.lib.pirtm_activation_exit = None
    
    def step(self, X: np.ndarray, num_iterations: int = 100) -> np.ndarray:
        """
        Execute one recurrence step (num_iterations iterations).
        
        Args:
            X: Input array (shape (N, N), dtype float32)
            num_iterations: Number of recurrence iterations
        
        Returns:
            Modified array X (in-place, also returns copy for convenience)
        
        Raises:
            RuntimeError: If pirtm_step returns error code
            TypeError: If X is not float32 array
        """
        # Validate input
        if not isinstance(X, np.ndarray):
            raise TypeError(f"Expected np.ndarray, got {type(X)}")
        
        if X.dtype != np.float32:
            raise TypeError(f"Expected float32 array, got {X.dtype}")
        
        if X.ndim != 2 or X.shape[0] != X.shape[1]:
            raise ValueError(f"Expected square matrix, got shape {X.shape}")
        
        # Make contiguous copy for C interface
        X_copy = np.ascontiguousarray(X, dtype=np.float32)
        dimension = X_copy.shape[0]
        
        # Call pirtm_step
        X_ptr = X_copy.ctypes.data_as(ctypes.POINTER(ctypes.c_float))
        ret = self.lib.pirtm_step(X_ptr, dimension, num_iterations)
        
        if ret != 0:
            raise RuntimeError(f"pirtm_step failed with code {ret}")
        
        return X_copy
    
    def step_inplace(self, X: np.ndarray, num_iterations: int = 100) -> int:
        """
        Execute one recurrence step, modifying X in-place.
        
        Args:
            X: Input array (must be C-contiguous float32 matrix)
            num_iterations: Number of recurrence iterations
        
        Returns:
            Return code (0 = success)
        
        Raises:
            TypeError: If X is not C-contiguous float32 array
        """
        if not X.flags['C_CONTIGUOUS'] or X.dtype != np.float32:
            raise TypeError("Input must be C-contiguous float32 array")
        
        if X.ndim != 2 or X.shape[0] != X.shape[1]:
            raise ValueError(f"Expected square matrix, got shape {X.shape}")
        
        dimension = X.shape[0]
        X_ptr = X.ctypes.data_as(ctypes.POINTER(ctypes.c_float))
        
        return self.lib.pirtm_step(X_ptr, dimension, num_iterations)
    
    def get_metadata(self) -> Dict[str, Any]:
        """
        Return metadata about this compiled module.
        
        Returns:
            Dict with keys:
              - 'so_path': Path to .so file
              - 'dir size': Size of .so file in bytes
              - 'symbols': Dict of exported symbols
        """
        so_size = os.path.getsize(self.so_path)
        
        # Try to extract symbols (requires objdump or nm)
        symbols = self._extract_symbols()
        
        return {
            'so_path': str(self.so_path),
            'so_size': so_size,
            'symbol_count': len(symbols),
            'symbols': symbols,
        }
    
    def _extract_symbols(self) -> Dict[str, int]:
        """Extract exported symbols from .so file."""
        try:
            import subprocess
            result = subprocess.run(
                ['nm', self.so_path],
                capture_output=True,
                text=True,
                timeout=5,
                check=False
            )
            
            symbols = {}
            for line in result.stdout.split('\n'):
                if line.strip():
                    parts = line.split()
                    if len(parts) >= 3:
                        try:
                            addr = int(parts[0], 16) if parts[0] else 0
                            symbols[parts[2]] = addr
                        except (ValueError, IndexError):
                            pass
            
            return symbols
        except Exception:
            return {}


def load_compiled_descriptor(descriptor_path: str) -> PirtmCompiledModule:
    """
    Load compiled descriptor .so.
    
    If descriptor is JSON, searches for .so in same directory.
    If descriptor is .so path, loads directly.
    
    Args:
        descriptor_path: Path to descriptor.json or .so file
    
    Returns:
        PirtmCompiledModule instance
    """
    path = Path(descriptor_path)
    
    if path.suffix == '.so':
        # Already a .so file
        so_path = descriptor_path
    elif path.suffix == '.json':
        # Search for compiled .so with same base name
        so_path = path.with_suffix('.so')
        if not so_path.exists():
            # Try in same directory with computed hash filename
            raise FileNotFoundError(
                f"No compiled .so found for descriptor {descriptor_path}"
            )
    else:
        raise ValueError(f"Unexpected file type: {descriptor_path}")
    
    return PirtmCompiledModule(str(so_path))


def create_test_module(dimension: int = 512, output_dir: Optional[str] = None) -> str:
    """
    Create a minimal compiled module for testing (placeholder).
    
    For now, returns a path where a .so would be created.
    In production, would compile an actual descriptor.
    
    Args:
        dimension: Matrix dimension  
        output_dir: Output directory (temp if None)
    
    Returns:
        Path to compiled .so file
    """
    if output_dir is None:
        output_dir = tempfile.gettempdir()
    
    # Placeholder: would call compile_descriptor_to_library
    so_path = os.path.join(output_dir, f"pirtm_test_dim{dimension}.so")
    return so_path
