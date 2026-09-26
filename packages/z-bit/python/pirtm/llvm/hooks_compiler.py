"""
Phase 6A-2: Activation Hooks Compiler

Compiles C++ activation_hooks.cpp to object files for linking into
compiled PIRTM .so binaries.

Provides integration with the LLVM code generation pipeline (6A-3).

Status: Phase 6A Week 2
"""

import subprocess
import os
import tempfile
from pathlib import Path
from typing import Optional, Tuple, List
import shutil


class HooksCompiler:
    """
    Compile and manage activation hooks for PIRTM.
    
    Pipeline:
        activation_hooks.cpp → object file (.o) → linked into .so
    """
    
    HOOKS_SOURCE = Path(__file__).parent / "activation_hooks.cpp"
    TEST_SOURCE = Path(__file__).parent / "test_hooks_compilation.cpp"
    CMAKE_FILE = Path(__file__).parent / "CMakeLists.txt"
    
    def __init__(self, compiler: str = "g++", opt_level: str = "-O3"):
        """
        Initialize hooks compiler.
        
        Args:
            compiler: C++ compiler to use (g++, clang++, etc.)
            opt_level: Optimization level (-O0, -O1, -O2, -O3)
        """
        self.compiler = compiler
        self.opt_level = opt_level
        self._verify_compiler()
    
    def _verify_compiler(self):
        """Verify compiler is available."""
        try:
            result = subprocess.run(
                [self.compiler, "--version"],
                capture_output=True,
                timeout=5,
                check=True
            )
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            raise RuntimeError(
                f"Compiler {self.compiler} not found or not functional"
            ) from e
    
    def compile_hooks_to_object(self, output_path: Optional[str] = None) -> str:
        """
        Compile activation_hooks.cpp to object file.
        
        Args:
            output_path: Path to write .o file (temp if None)
        
        Returns:
            Path to compiled object file
        """
        if not self.HOOKS_SOURCE.exists():
            raise FileNotFoundError(f"Hooks source not found: {self.HOOKS_SOURCE}")
        
        if output_path is None:
            output_path = os.path.join(tempfile.gettempdir(), "pirtm_hooks.o")
        
        # Create output directory
        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
        
        # Compile to object file
        cmd = [
            self.compiler,
            "-c",  # Compile only, don't link
            "-fPIC",  # Position-independent code
            self.opt_level,
            "-std=c++17",
            str(self.HOOKS_SOURCE),
            "-o", output_path
        ]
        
        print(f"[Phase 6A-2] Compiling hooks to {output_path}...")
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30,
            check=False
        )
        
        if result.returncode != 0:
            raise RuntimeError(
                f"Hook compilation failed:\n{result.stderr}"
            )
        
        if not os.path.exists(output_path):
            raise RuntimeError(f"Compilation succeeded but file not created: {output_path}")
        
        print(f"  ✓ Hooks compiled: {output_path}")
        return output_path
    
    def compile_hooks_to_shared_library(self, output_so: Optional[str] = None) -> str:
        """
        Compile activation_hooks.cpp to shared library (.so).
        
        Args:
            output_so: Path to write .so file (temp if None)
        
        Returns:
            Path to compiled shared library
        """
        if not self.HOOKS_SOURCE.exists():
            raise FileNotFoundError(f"Hooks source not found: {self.HOOKS_SOURCE}")
        
        if output_so is None:
            output_so = os.path.join(tempfile.gettempdir(), "pirtm_hooks.so")
        
        os.makedirs(os.path.dirname(output_so) or ".", exist_ok=True)
        
        # Compile directly to shared library
        cmd = [
            self.compiler,
            "-shared",
            "-fPIC",
            self.opt_level,
            "-std=c++17",
            str(self.HOOKS_SOURCE),
            "-o", output_so,
            "-lm"  # Link against math library
        ]
        
        print(f"[Phase 6A-2] Compiling hooks to shared library {output_so}...")
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30,
            check=False
        )
        
        if result.returncode != 0:
            raise RuntimeError(
                f"Shared library compilation failed:\n{result.stderr}"
            )
        
        if not os.path.exists(output_so):
            raise RuntimeError(f"Compilation succeeded but .so not created")
        
        print(f"  ✓ Hooks shared library: {output_so}")
        return output_so
    
    def build_with_cmake(self, build_dir: Optional[str] = None) -> Tuple[str, str]:
        """
        Build hooks using CMake (full build system).
        
        Args:
            build_dir: Build directory (temp if None)
        
        Returns:
            (path_to_shared_library, path_to_object_file)
        """
        if not self.CMAKE_FILE.exists():
            raise FileNotFoundError(f"CMakeLists.txt not found: {self.CMAKE_FILE}")
        
        if build_dir is None:
            build_dir = os.path.join(tempfile.gettempdir(), "pirtm_hooks_build")
        
        os.makedirs(build_dir, exist_ok=True)
        
        print(f"[Phase 6A-2] Building with CMake in {build_dir}...")
        
        # Configure
        configure_cmd = [
            "cmake",
            "-S", str(self.HOOKS_SOURCE.parent),
            "-B", build_dir,
            f"-DCMAKE_CXX_COMPILER={self.compiler}",
            f"-DCMAKE_CXX_FLAGS={self.opt_level}"
        ]
        
        result = subprocess.run(
            configure_cmd,
            capture_output=True,
            text=True,
            timeout=30,
            check=False
        )
        
        if result.returncode != 0:
            raise RuntimeError(f"CMake configure failed:\n{result.stderr}")
        
        print(f"  ✓ CMake configured")
        
        # Build
        build_cmd = ["cmake", "--build", build_dir, "--config", "Release"]
        
        result = subprocess.run(
            build_cmd,
            capture_output=True,
            text=True,
            timeout=60,
            check=False
        )
        
        if result.returncode != 0:
            raise RuntimeError(f"CMake build failed:\n{result.stderr}")
        
        print(f"  ✓ CMake build complete")
        
        # Find outputs
        so_file = os.path.join(build_dir, "lib", "libpirtm_hooks.so")
        obj_file = os.path.join(build_dir, "CMakeFiles", "pirtm_hooks.dir", 
                                "activation_hooks.cpp.o")
        
        return so_file, build_dir
    
    def test_hooks_compilation(self) -> bool:
        """
        Compile and run hook compilation test.
        
        Returns:
            True if all tests pass
        """
        if not self.TEST_SOURCE.exists():
            print("⚠ Test source not found, skipping validation")
            return True
        
        test_exe = os.path.join(tempfile.gettempdir(), "test_pirtm_hooks")
        
        print(f"[Phase 6A-2] Building hook compilation test...")
        
        cmd = [
            self.compiler,
            "-std=c++17",
            self.opt_level,
            str(self.TEST_SOURCE),
            str(self.HOOKS_SOURCE),
            "-o", test_exe,
            "-lm"
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30,
            check=False
        )
        
        if result.returncode != 0:
            print(f"❌ Test compilation failed:\n{result.stderr}")
            return False
        
        print(f"  ✓ Test built successfully")
        
        # Run test
        print(f"[Phase 6A-2] Running hook compilation test...")
        
        result = subprocess.run(
            [test_exe],
            capture_output=True,
            text=True,
            timeout=10,
            check=False
        )
        
        print(result.stdout)
        
        if result.returncode != 0:
            print(f"❌ Test failed with return code {result.returncode}")
            if result.stderr:
                print(f"stderr: {result.stderr}")
            return False
        
        print(f"  ✓ All hook tests passed")
        return True


def compile_hooks_object(output_path: Optional[str] = None) -> str:
    """
    Convenience function: Compile hooks to object file.
    
    Args:
        output_path: Output .o file path
    
    Returns:
        Path to compiled object file
    """
    compiler = HooksCompiler(compiler="g++", opt_level="-O3")
    return compiler.compile_hooks_to_object(output_path)


def compile_hooks_shared_library(output_so: Optional[str] = None) -> str:
    """
    Convenience function: Compile hooks to shared library.
    
    Args:
        output_so: Output .so file path
    
    Returns:
        Path to compiled shared library
    """
    compiler = HooksCompiler(compiler="g++", opt_level="-O3")
    return compiler.compile_hooks_to_shared_library(output_so)


def test_hooks() -> bool:
    """
    Compile and test hook compilation.
    
    Returns:
        True if tests pass
    """
    compiler = HooksCompiler(compiler="g++", opt_level="-O3")
    return compiler.test_hooks_compilation()
