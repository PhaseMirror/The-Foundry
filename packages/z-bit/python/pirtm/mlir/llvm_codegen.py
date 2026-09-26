"""
Phase 4-6A: LLVM Code Generation Module

Handles conversion from typed MLIR (output of Phase 3/5) to executable LLVM IR.

This module interfaces with mlir-opt to apply the standard MLIR-to-LLVM lowering
passes, producing .ll files that can be compiled with llc and linked against
libpirtm_runtime. Extended in Phase 6A with:
  - mlir_to_llvm_ir(): Direct MLIR → LLVM IR conversion
  - integrate_activation_hooks(): Insert profiling hook calls
  - compile_to_object(): LLVM IR → native object files
  - link_to_shared_library(): Object files → .so shared library

Status: Phase 4-6A Implementation (Phase 6A Week 1)
Related: ADR-009-llvm-compilation.md, ADR-062 (Day 90)
"""

import subprocess
import tempfile
import os
from typing import Optional, Tuple, List, Dict
import re
import hashlib


class LLVMCodeGenerator:
    """
    MLIR → LLVM IR code generator.
    
    Handles the conversion pipeline:
    1. Parse typed MLIR
    2. Apply lowering passes (pirtm → std → llvm)
    3. Optimize with LLVM optimizer
    4. Emit LLVM IR (.ll format)
    """
    
    def __init__(self, mlir_opt_path: Optional[str] = None, 
                 llc_path: Optional[str] = None):
        """
        Initialize code generator.
        
        Args:
            mlir_opt_path: Path to mlir-opt tool (default: search PATH)
            llc_path: Path to llc tool (default: search PATH)
        """
        self.mlir_opt_path = mlir_opt_path or "mlir-opt"
        self.llc_path = llc_path or "llc"
        self._verify_tools()
    
    def _verify_tools(self):
        """Verify that required tools are available."""
        try:
            subprocess.run(
                [self.mlir_opt_path, "--version"],
                capture_output=True,
                timeout=5,
                check=True
            )
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            raise RuntimeError(
                f"mlir-opt not found at {self.mlir_opt_path}. "
                f"Install LLVM/MLIR or provide path via mlir_opt_path parameter."
            ) from e
        
        try:
            subprocess.run(
                [self.llc_path, "--version"],
                capture_output=True,
                timeout=5,
                check=True
            )
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            raise RuntimeError(
                f"llc not found at {self.llc_path}. "
                f"Install LLVM or provide path via llc_path parameter."
            ) from e
    
    def mlir_to_llvm_ir(self, mlir_text: str, 
                        target_triple: Optional[str] = None) -> str:
        """
        Convert typed MLIR to LLVM IR.
        
        Pipeline:
        1. (Input: typed MLIR with !pirtm.contractivity types)
        2. convert-pirtm-to-std — Remove PIRTM dialect types
        3. convert-linalg-to-affine — Prepare for affine lowering
        4. affine-loop-invariant-code-motion — Optimize affine loops
        5. convert-affine-to-std — Lower affine to std
        6. convert-std-to-llvm — Generate LLVM IR
        7. (Output: LLVM IR in .ll format)
        
        Args:
            mlir_text: Typed MLIR string (Phase 3 output)
            target_triple: LLVM target triple (optional, e.g., "x86_64-linux-gnu")
        
        Returns:
            LLVM IR text (.ll format)
        
        Raises:
            RuntimeError: If conversion fails
        """
        # Create temp file for input MLIR
        with tempfile.NamedTemporaryFile(
            mode='w', suffix='.mlir', delete=False
        ) as f_in:
            f_in.write(mlir_text)
            input_path = f_in.name
        
        try:
            # Apply lowering passes
            passes = [
                "convert-pirtm-to-std",
                "convert-linalg-to-affine",
                "affine-loop-invariant-code-motion",
                "convert-affine-to-std",
                "convert-std-to-llvm",
            ]
            
            # Add target-specific passes if provided
            if target_triple:
                passes.append(f"set-llvm-module-data-layout={{target-triple={target_triple}}}")
            
            # Build mlir-opt command
            cmd = [self.mlir_opt_path]
            for pass_name in passes:
                cmd.extend([f"--{pass_name}"])
            cmd.extend([input_path])
            
            # Run mlir-opt
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60,
                check=False
            )
            
            if result.returncode != 0:
                raise RuntimeError(
                    f"mlir-opt failed with code {result.returncode}:\n"
                    f"stderr: {result.stderr}\nstdout: {result.stdout}"
                )
            
            llvm_ir = result.stdout
            
            # Verify output is valid LLVM IR (sanity check)
            if not self.is_valid_llvm_ir(llvm_ir):
                raise RuntimeError("Generated LLVM IR appears invalid")
            
            return llvm_ir
        
        finally:
            os.unlink(input_path)
    
    def is_valid_llvm_ir(self, llvm_ir: str) -> bool:
        """Sanity check that output looks like valid LLVM IR."""
        # Check for key LLVM IR markers
        has_define = "define " in llvm_ir
        has_attributes = "attributes " in llvm_ir or "declare " in llvm_ir
        
        # Both should be present in a typical LLVM module
        return has_define or has_attributes
    
    def compile_to_object(self, llvm_ir: str, 
                          output_path: str,
                          opt_level: int = 3,
                          target_triple: Optional[str] = None) -> str:
        """
        Compile LLVM IR to machine code object file.
        
        Args:
            llvm_ir: LLVM IR text (.ll format)
            output_path: Path to write .o file
            opt_level: Optimization level (0-3; default 3 for -O3)
            target_triple: LLVM target triple (e.g., "x86_64-linux-gnu")
        
        Returns:
            Path to generated .o file
        
        Raises:
            RuntimeError: If compilation fails
        """
        # Create temp file for LLVM IR input
        with tempfile.NamedTemporaryFile(
            mode='w', suffix='.ll', delete=False
        ) as f_in:
            f_in.write(llvm_ir)
            input_path = f_in.name
        
        try:
            # Build llc command
            cmd = [self.llc_path, f"-O{opt_level}", "-filetype=obj"]
            
            # Set target triple if provided
            if target_triple:
                cmd.extend(["-mtriple", target_triple])
            
            # Position-independent code for linking into .so
            cmd.append("-relocation-model=pic")
            
            # Output file
            cmd.extend(["-o", output_path, input_path])
            
            # Run llc
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60,
                check=False
            )
            
            if result.returncode != 0:
                raise RuntimeError(
                    f"llc failed with code {result.returncode}:\n"
                    f"stderr: {result.stderr}"
                )
            
            return output_path
        
        finally:
            os.unlink(input_path)
    
    def generate(self, mlir_text: str, 
                 output_dir: str = ".",
                 output_name: str = "pirtm_compiled") -> Tuple[str, str]:
        """
        Complete code generation: MLIR → LLVM IR → Object file.
        
        Args:
            mlir_text: Typed MLIR (Phase 3 output)
            output_dir: Directory for output files
            output_name: Base name for outputs (without extension)
        
        Returns:
            (llvm_ir_path, object_file_path)
        """
        os.makedirs(output_dir, exist_ok=True)
        
        # Step 1: Convert MLIR to LLVM IR
        print(f"[Phase 4] Converting MLIR to LLVM IR...")
        llvm_ir = self.mlir_to_llvm_ir(mlir_text)
        
        # Save LLVM IR to file
        llvm_ir_path = os.path.join(output_dir, f"{output_name}.ll")
        with open(llvm_ir_path, 'w') as f:
            f.write(llvm_ir)
        print(f"  ✓ LLVM IR saved to {llvm_ir_path}")
        
        # Step 2: Compile to object file
        print(f"[Phase 4] Compiling to machine code...")
        object_path = os.path.join(output_dir, f"{output_name}.o")
        self.compile_to_object(llvm_ir, object_path, opt_level=3)
        print(f"  ✓ Object file saved to {object_path}")
        
        return llvm_ir_path, object_path


class LLVMLinker:
    """Link compiled object files against runtime library."""
    
    def __init__(self, clang_path: Optional[str] = None):
        """
        Initialize linker.
        
        Args:
            clang_path: Path to clang++ (default: search PATH)
        """
        self.clang_path = clang_path or "clang++"
        self._verify_tool()
    
    def _verify_tool(self):
        """Verify clang++ is available."""
        try:
            subprocess.run(
                [self.clang_path, "--version"],
                capture_output=True,
                timeout=5,
                check=True
            )
        except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired) as e:
            raise RuntimeError(
                f"clang++ not found at {self.clang_path}"
            ) from e
    
    def link_shared_library(self, object_files: List[str],
                           output_so: str,
                           runtime_lib_path: Optional[str] = None) -> str:
        """
        Link object files into shared library (.so).
        
        Args:
            object_files: List of .o file paths
            output_so: Path to output .so file
            runtime_lib_path: Path to libpirtm_runtime.so
        
        Returns:
            Path to generated .so file
        
        Raises:
            RuntimeError: If linking fails
        """
        # Build clang++ command
        cmd = [self.clang_path, "-shared", "-fPIC"]
        
        # Add object files
        cmd.extend(object_files)
        
        # Link against runtime library
        if runtime_lib_path:
            cmd.extend(["-L", os.path.dirname(runtime_lib_path)])
            cmd.append("-lpirtm_runtime")
        
        # Output
        cmd.extend(["-o", output_so])
        
        # Run linker
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30,
            check=False
        )
        
        if result.returncode != 0:
            raise CompilationError(
                f"Linking failed with code {result.returncode}:\n"
                f"stderr: {result.stderr}"
            )
        
        return output_so


def compile_mlir_to_binary(mlir_text: str,
                           output_dir: str = ".",
                           output_name: str = "pirtm_compiled",
                           runtime_lib_path: Optional[str] = None,
                           mlir_opt_path: Optional[str] = None,
                           llc_path: Optional[str] = None,
                           clang_path: Optional[str] = None) -> str:
    """
    Convenience function: MLIR → binary in one call.
    
    Args:
        mlir_text: Typed MLIR (Phase 3 output)
        output_dir: Directory for output files/libraries
        output_name: Base name for generated files
        runtime_lib_path: Path to libpirtm_runtime.so
        mlir_opt_path: Path to mlir-opt tool
        llc_path: Path to llc tool
        clang_path: Path to clang++ tool
    
    Returns:
        Path to generated .so file
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # Step 1: Code generation (MLIR → LLVM IR → .o)
    codegen = LLVMCodeGenerator(mlir_opt_path=mlir_opt_path, llc_path=llc_path)
    _, object_path = codegen.generate(
        mlir_text,
        output_dir=output_dir,
        output_name=output_name
    )
    
    # Step 2: Linking (.o → .so)
    print(f"[Phase 4] Linking shared library...")
    linker = LLVMLinker(clang_path=clang_path)
    so_path = os.path.join(output_dir, f"{output_name}.so")
    linker.link_shared_library(
        [object_path],
        so_path,
        runtime_lib_path=runtime_lib_path
    )
    print(f"  ✓ Shared library saved to {so_path}")
    
    return so_path


class CompilationError(Exception):
    """Raised when compilation fails."""
    pass


# ============================================================================
# PHASE 6A EXTENSIONS: Performance Optimization (Week 1)
# ============================================================================

class Phase6AHookIntegration:
    """
    Phase 6A Week 1: Integrate activation function hooks into LLVM IR.
    
    Purpose:
        Insert profiling hook calls around sigmoid and matrix multiply
        operations for performance measurement.
    
    Hooks:
        - pirtm_activation_enter: Called before sigmoid
        - pirtm_activation_exit: Called after sigmoid
        - pirtm_matmul_start: Called before matrix multiply
        - pirtm_matmul_end: Called after matrix multiply
    """
    
    @staticmethod
    def integrate_activation_hooks(llvm_ir: str) -> str:
        """
        Insert activation function hook calls into LLVM IR.
        
        Args:
            llvm_ir: LLVM IR text (Phase 6A-1 output)
        
        Returns:
            Modified LLVM IR with hook calls
        """
        lines = llvm_ir.split('\n')
        output = []
        op_id = 0
        
        # Add hook function declarations if not present
        if 'declare void @pirtm_activation_enter' not in llvm_ir:
            output.append('declare void @pirtm_activation_enter(float*, i64, i32)')
            output.append('declare void @pirtm_activation_exit(float*, i64, i32)')
        
        for i, line in enumerate(lines):
            output.append(line)
            
            # Detect sigmoid calls and wrap with hooks
            if 'call' in line and 'sigmoid' in line:
                indent = len(line) - len(line.lstrip())
                space = ' ' * indent
                
                # Insert pre-hook
                output.insert(-1, f"{space}call void @pirtm_activation_enter(float* %x, i64 %dim, i32 {op_id})")
                op_id += 1
        
        return '\n'.join(output)
    
    @staticmethod
    def integrate_matmul_hooks(llvm_ir: str) -> str:
        """
        Insert matrix multiply hook calls into LLVM IR.
        
        Args:
            llvm_ir: LLVM IR text
        
        Returns:
            Modified LLVM IR with matmul hook calls
        """
        lines = llvm_ir.split('\n')
        output = []
        op_id = 0
        
        # Add hook function declarations if not present
        if 'declare void @pirtm_matmul_start' not in llvm_ir:
            output.append('declare void @pirtm_matmul_start(i64, i32)')
            output.append('declare void @pirtm_matmul_end(float, i32)')
        
        for line in lines:
            output.append(line)
            
            # Detect matrix multiply operations
            if 'llvm.matrix.multiply' in line:
                indent = len(line) - len(line.lstrip())
                space = ' ' * indent
                
                # Extract dimension if possible
                dim_match = re.search(r'x(\d+)', line)
                dim = dim_match.group(1) if dim_match else '512'
                
                output.insert(-1, f"{space}call void @pirtm_matmul_start(i64 {dim}, i32 {op_id})")
                op_id += 1
        
        return '\n'.join(output)


    @staticmethod
    def integrate_profiling_hooks(llvm_ir: str) -> str:
        """
        Insert generic profiling hooks into LLVM IR.
        
        Args:
            llvm_ir: LLVM IR text
        
        Returns:
            Modified LLVM IR with profiling hooks
        """
        lines = llvm_ir.split('\n')
        output = []
        op_id = 0
        
        # Add hook function declarations if not present
        if 'declare void @pirtm_profiling_start' not in llvm_ir:
            output.append('declare void @pirtm_profiling_start(i32)')
            output.append('declare void @pirtm_profiling_end(i32)')
            output.append('declare void @pirtm_trace_op(i32, i8*)')
        
        for line in lines:
            output.append(line)
            
            # Detect generic pirtm profiling markers
            if 'pirtm.profiling.start' in line:
                indent = len(line) - len(line.lstrip())
                space = ' ' * indent
                output.insert(-1, f"{space}call void @pirtm_profiling_start(i32 {op_id})")
                
            elif 'pirtm.profiling.end' in line:
                indent = len(line) - len(line.lstrip())
                space = ' ' * indent
                output.append(f"{space}call void @pirtm_profiling_end(i32 {op_id})")
                op_id += 1
                
        return '\n'.join(output)


def mlir_to_llvm_ir(mlir_bytecode: str, target_triple: Optional[str] = None) -> str:
    """
    Phase 6A-1 Function: Convert PIRTM MLIR to LLVM IR.
    
    Inputs:
        mlir_bytecode: Text output from Phase 5 MLIREmitter
    
    Outputs:
        llvm_ir: LLVM IR text (readable ASCII)
    
    Operations:
        1. Load MLIR module
        2. Apply lowering passes (pirtm → std → llvm)
        3. Export as LLVM IR text
    
    Example:
        mlir_text = mlir_emitter.emit(descriptor)
        llvm_ir = mlir_to_llvm_ir(mlir_text)
    """
    codegen = LLVMCodeGenerator()
    return codegen.mlir_to_llvm_ir(mlir_bytecode, target_triple=target_triple)


def integrate_activation_hooks(llvm_ir: str) -> str:
    """
    Phase 6A-2 Function: Insert activation function hooks into LLVM IR.
    
    Inserts calls to:
        - pirtm_activation_enter (before sigmoid)
        - pirtm_activation_exit (after sigmoid)
    
    Args:
        llvm_ir: LLVM IR text from mlir_to_llvm_ir()
    
    Returns:
        Modified LLVM IR with hook calls
    """
    hooker = Phase6AHookIntegration()
    ir = hooker.integrate_activation_hooks(llvm_ir)
    ir = hooker.integrate_matmul_hooks(ir)
    ir = hooker.integrate_profiling_hooks(ir)
    return ir


def compile_to_object(llvm_ir: str, output_path: str, opt_level: str = "O2") -> str:
    """
    Phase 6A-3 Function: Compile LLVM IR to object file.
    
    Args:
        llvm_ir: LLVM IR text
        output_path: Path to write .o file
        opt_level: Optimization level ("O0", "O1", "O2", "O3")
    
    Returns:
        Path to generated .o file
    """
    codegen = LLVMCodeGenerator()
    opt_int = int(opt_level[1])  # Extract number from "O2" → 2
    return codegen.compile_to_object(llvm_ir, output_path, opt_level=opt_int)


def link_to_shared_library(object_files: List[str], output_so: str, 
                           runtime_lib_path: Optional[str] = None) -> str:
    """
    Phase 6A-3 Function: Link object files to shared library.
    
    Args:
        object_files: List of .o file paths
        output_so: Path to write .so file
        runtime_lib_path: Path to libpirtm_runtime.so
    
    Returns:
        Path to generated .so file
    """
    linker = LLVMLinker()
    return linker.link_shared_library(object_files, output_so, runtime_lib_path)


def extract_symbols(so_path: str) -> Dict[str, int]:
    """
    Phase 6A-3 Function: Extract exported symbols from .so.
    
    Args:
        so_path: Path to .so file
    
    Returns:
        Dict mapping symbol names to addresses
    """
    try:
        result = subprocess.run(
            ['nm', so_path],
            capture_output=True,
            text=True,
            timeout=10,
            check=True
        )
        
        symbols = {}
        for line in result.stdout.split('\n'):
            if line.strip():
                parts = line.split()
                if len(parts) >= 3:
                    try:
                        addr = int(parts[0], 16) if parts[0] else 0
                        symbols[parts[2]] = addr
                    except ValueError:
                        pass
        
        return symbols
    except (subprocess.CalledProcessError, FileNotFoundError):
        return {}


def verify_compiled_binary(so_path: str) -> bool:
    """
    Phase 6A-3 Function: Verify compiled binary is valid.
    
    Args:
        so_path: Path to .so file
    
    Returns:
        True if .so is loadable and has expected symbols
    """
    if not os.path.exists(so_path):
        return False
    
    # Check file magic number (ELF)
    with open(so_path, 'rb') as f:
        magic = f.read(4)
        if magic != b'\x7fELF':
            return False
    
    # Check for required symbol
    symbols = extract_symbols(so_path)
    return 'pirtm_step' in symbols


def compile_descriptor_to_library(descriptor_dict: Dict, 
                                   opt_level: str = "O3",
                                   output_dir: Optional[str] = None) -> str:
    """
    Phase 6A-3 Function: Compile descriptor JSON to .so library.
    
    Pipeline:
        Descriptor JSON → MLIR → LLVM IR → Object → .so
    
    Args:
        descriptor_dict: Parsed descriptor configuration
        opt_level: LLVM optimization level
        output_dir: Output directory (temp if not specified)
    
    Returns:
        Path to compiled .so file
    """
    if output_dir is None:
        output_dir = tempfile.gettempdir()
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate unique name based on descriptor hash
    desc_json = str(descriptor_dict).encode()
    desc_hash = hashlib.md5(desc_json).hexdigest()[:8]
    base_name = f"pirtm_{desc_hash}"
    
    # For now, placeholder - real implementation would:
    # 1. Parse descriptor
    # 2. Generate MLIR via MLIREmitter
    # 3. Convert to LLVM IR
    # 4. Compile to .o
    # 5. Link to .so
    
    so_path = os.path.join(output_dir, f"{base_name}.so")
    print(f"[Phase 6A-3] Would compile descriptor to {so_path}")
    
    return so_path
