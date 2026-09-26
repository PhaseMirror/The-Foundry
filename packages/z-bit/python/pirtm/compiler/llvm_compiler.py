"""
Phase 6A-3: Compilation & Linking Pipeline to Shared Library

Provides high-level compilation interface combining:
  1. MLIR → LLVM IR conversion
  2. LLVM IR → Object file compilation
  3. Object file → Shared library linking
  4. Hook integration for profiling

This module orchestrates the full pipeline from descriptor to executable .so.

Status: Phase 6A Week 2-3 Implementation
Related: ADR-062 (Day 90 Performance Baseline)
"""

import os
import subprocess
import tempfile
import json
from pathlib import Path
from typing import Dict, Optional, List
import hashlib

from pirtm.mlir.llvm_codegen import (
    mlir_to_llvm_ir,
    integrate_activation_hooks,
    compile_to_object,
    link_to_shared_library,
    extract_symbols,
    verify_compiled_binary,
)

# Phase 6A-2 hooks integration
try:
    from pirtm.llvm.hooks_compiler import (
        compile_hooks_object,
        compile_hooks_shared_library,
    )
    HOOKS_AVAILABLE = True
except ImportError:
    HOOKS_AVAILABLE = False


class CompilationPipeline:
    """
    Phase 6A-3: Descriptor → .so compilation pipeline with hook support.
    
    Pipeline stages:
        0. (Optional) Compile hooks (Phase 6A-2)
        1. descriptor.json → MLIR (via MLIREmitter)
        2. MLIR → LLVM IR (mlir-opt)
        3. LLVM IR → Object file (llc)
        4. Object file + hooks → .so (clang++)
    """
    
    def __init__(self, output_dir: Optional[str] = None, opt_level: str = "O3",
                 include_hooks: bool = True):
        """
        Initialize compilation pipeline.
        
        Args:
            output_dir: Directory for output files (temp if None)
            opt_level: LLVM optimization level ("O0", "O1", "O2", "O3")
            include_hooks: Whether to compile and include profiling hooks
        """
        self.output_dir = output_dir or tempfile.gettempdir()
        self.opt_level = opt_level
        self.include_hooks = include_hooks and HOOKS_AVAILABLE
        self.hooks_object_path = None
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Pre-compile hooks if requested
        if self.include_hooks:
            self._prepare_hooks()
    
    def _prepare_hooks(self):
        """
        Compile activation hooks to object file for linking.
        
        Phase 6A-2 integration: Pre-compile hooks once, reuse in all compilations.
        """
        try:
            print("[Phase 6A-3] Preparing activation hooks...")
            hooks_dir = os.path.join(self.output_dir, "hooks")
            os.makedirs(hooks_dir, exist_ok=True)
            
            self.hooks_object_path = os.path.join(hooks_dir, "pirtm_hooks.o")
            
            if not os.path.exists(self.hooks_object_path):
                compile_hooks_object(self.hooks_object_path)
                print(f"  ✓ Hooks compiled: {self.hooks_object_path}")
            else:
                print(f"  ℹ Using pre-compiled hooks: {self.hooks_object_path}")
        except Exception as e:
            print(f"  ⚠ Hook compilation failed (continuing without hooks): {e}")
            self.include_hooks = False
            self.hooks_object_path = None
    
    def generate_unique_name(self, descriptor: Dict) -> str:
        """Generate unique output name based on descriptor hash."""
        desc_str = json.dumps(descriptor, sort_keys=True)
        desc_hash = hashlib.md5(desc_str.encode()).hexdigest()[:8]
        return f"pirtm_{desc_hash}"
    
    def compile_descriptor_to_library(self, descriptor: Dict) -> str:
        """
        Compile descriptor to .so library with optional hook integration.
        
        Pipeline:
            Descriptor JSON → MLIR → LLVM IR → object → .so
            (optionally with activation hooks for profiling)
        
        Args:
            descriptor: Parsed descriptor configuration dict
        
        Returns:
            Path to generated .so file
        
        Raises:
            RuntimeError: If any compilation step fails
        """
        base_name = self.generate_unique_name(descriptor)
        
        print(f"[Phase 6A-3] Compiling descriptor to {base_name}.so...")
        
        # Step 1: Generate MLIR from descriptor
        print(f"  [Stage 1/4] Generating MLIR...")
        mlir_path = os.path.join(self.output_dir, f"{base_name}.mlir")
        mlir_text = self._descriptor_to_mlir(descriptor)
        with open(mlir_path, 'w') as f:
            f.write(mlir_text)
        print(f"    ✓ MLIR saved: {mlir_path}")
        
        # Step 2: Convert MLIR to LLVM IR
        print(f"  [Stage 2/4] Converting MLIR to LLVM IR...")
        llvm_ir = mlir_to_llvm_ir(mlir_text)
        
        # Integrate hooks into LLVM IR (Phase 6A-2)
        if self.include_hooks:
            print(f"    ✓ Integrating activation hooks...")
            llvm_ir = integrate_activation_hooks(llvm_ir)
        
        llvm_path = os.path.join(self.output_dir, f"{base_name}.ll")
        with open(llvm_path, 'w') as f:
            f.write(llvm_ir)
        print(f"    ✓ LLVM IR saved: {llvm_path}")
        
        # Step 3: Compile to object file
        print(f"  [Stage 3/4] Compiling to object file (opt={self.opt_level})...")
        obj_path = os.path.join(self.output_dir, f"{base_name}.o")
        compile_to_object(llvm_ir, obj_path, opt_level=self.opt_level)
        print(f"    ✓ Object file saved: {obj_path}")
        
        # Step 4: Link to shared library (with optional hooks)
        print(f"  [Stage 4/4] Linking shared library...")
        so_path = os.path.join(self.output_dir, f"{base_name}.so")
        
        # Add hooks object file if available
        object_files = [obj_path]
        if self.include_hooks and self.hooks_object_path:
            object_files.append(self.hooks_object_path)
            print(f"    ℹ Linking with hooks: {self.hooks_object_path}")
        
        link_to_shared_library(object_files, so_path)
        print(f"    ✓ Shared library saved: {so_path}")
        
        # Verify compilation succeeded
        if not verify_compiled_binary(so_path):
            raise RuntimeError(f"Compiled binary verification failed: {so_path}")
        
        print(f"  ✅ Compilation successful!")
        
        return so_path
    
    def verify_compiled_binary(self, so_path: str) -> bool:
        """
        Verify compiled binary is valid.
        
        Checks:
            - File exists
            - ELF magic number valid
            - Required symbols present
        """
        return verify_compiled_binary(so_path)
    
    def extract_symbols(self, so_path: str) -> Dict[str, int]:
        """Extract exported symbols from .so file."""
        return extract_symbols(so_path)
    
    def _descriptor_to_mlir(self, descriptor: Dict) -> str:
        """
        Convert descriptor dict to MLIR text.
        
        For Phase 6A, this is a placeholder that would integrate with
        the actual MLIREmitter from Phase 5.
        """
        # In production, this would:
        # 1. Validate descriptor structure
        # 2. Call MLIREmitter.emit()
        # 3. Return MLIR text
        
        # For now, return a minimal valid MLIR module
        return self._generate_minimal_mlir(descriptor)
    
    @staticmethod
    def _generate_minimal_mlir(descriptor: Dict) -> str:
        """Generate minimal MLIR for testing."""
        return """
module {
  func.func @pirtm_step(%X : memref<?x?xf32>, %iters : index) -> memref<?x?xf32> {
    %c0 = arith.constant 0 : index
    %c1 = arith.constant 1 : index
    
    %dim0 = memref.dim %X, %c0 : memref<?x?xf32>
    %dim1 = memref.dim %X, %c1 : memref<?x?xf32>
    
    scf.for %iter = %c0 to %iters step %c1 {
      scf.for %i = %c0 to %dim0 step %c1 {
        scf.for %j = %c0 to %dim1 step %c1 {
          %val = memref.load %X[%i, %j] : memref<?x?xf32>
          memref.store %val, %X[%i, %j] : memref<?x?xf32>
        }
      }
    }
    
    return %X : memref<?x?xf32>
  }
}
        """


def compile_descriptor_to_library(descriptor: Dict, 
                                   opt_level: str = "O3",
                                   output_dir: Optional[str] = None) -> str:
    """
    Convenience function: Compile descriptor to .so in one call.
    
    Args:
        descriptor: Parsed descriptor configuration
        opt_level: LLVM optimization level
        output_dir: Output directory for compiled artifacts
    
    Returns:
        Path to generated .so file
    """
    pipeline = CompilationPipeline(output_dir=output_dir, opt_level=opt_level)
    return pipeline.compile_descriptor_to_library(descriptor)
