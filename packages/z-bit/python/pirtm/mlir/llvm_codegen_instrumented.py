"""
Phase 5-02: Instrumented LLVM Code Generator with Profiling Hooks

Extends LLVMCodeGenerator with detailed performance metrics collection:
- Per-pass timing and resource usage
- IR size changes after each pass
- Memory consumption tracking
- Optimization effectiveness metrics

This module is designed for ADR-Phase5-02: Lowering Pipeline Optimization.

Usage:
    from llvm_codegen_instrumented import InstrumentedLLVMCodeGenerator
    gen = InstrumentedLLVMCodeGenerator()
    ir, metrics = gen.mlir_to_llvm_ir_with_metrics(mlir_text)

"""

import subprocess
import tempfile
import os
import time
import re
from typing import Optional, Tuple, List, Dict, Any
from dataclasses import dataclass, asdict
import json

try:
    import psutil
except ImportError:
    psutil = None


@dataclass
class PassMetrics:
    """Metrics for a single lowering pass."""
    pass_name: str
    duration_sec: float
    input_ir_size: int
    output_ir_size: int
    ir_line_count_before: int
    ir_line_count_after: int
    memory_used_mb: float = 0.0
    
    @property
    def size_reduction_percent(self) -> float:
        """Percentage reduction in IR size."""
        if self.input_ir_size == 0:
            return 0.0
        return 100 * (1 - self.output_ir_size / self.input_ir_size)
    
    @property
    def line_reduction_percent(self) -> float:
        """Percentage reduction in IR lines."""
        if self.input_ir_size == 0:
            return 0.0
        return 100 * (1 - self.ir_line_count_after / self.ir_line_count_before)


class InstrumentedLLVMCodeGenerator:
    """
    MLIR → LLVM IR generator with built-in profiling instrumentation.
    
    Collects fine-grained metrics on each lowering pass:
    - Execution time
    - IR size changes
    - Memory consumption
    - Optimization effectiveness
    """
    
    def __init__(self, mlir_opt_path: Optional[str] = None,
                 llc_path: Optional[str] = None,
                 track_memory: bool = True):
        """
        Initialize instrumented code generator.
        
        Args:
            mlir_opt_path: Path to mlir-opt tool
            llc_path: Path to llc tool
            track_memory: Whether to track memory usage (requires psutil)
        """
        self.mlir_opt_path = mlir_opt_path or "mlir-opt"
        self.llc_path = llc_path or "llc"
        self.track_memory = track_memory and psutil is not None
        self._verify_tools()
        self.last_metrics = []
    
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
                f"mlir-opt not found at {self.mlir_opt_path}"
            ) from e
    
    def _run_single_pass(self, mlir_text: str, pass_name: str) -> Tuple[str, PassMetrics]:
        """
        Run a single MLIR lowering pass and collect metrics.
        
        Args:
            mlir_text: Input MLIR text
            pass_name: Name of the pass (without -- prefix)
        
        Returns:
            (output_ir, PassMetrics)
        """
        input_size = len(mlir_text)
        input_lines = mlir_text.count('\n')
        
        # Create temp file for input
        with tempfile.NamedTemporaryFile(mode='w', suffix='.mlir', delete=False) as f:
            f.write(mlir_text)
            input_path = f.name
        
        try:
            # Track memory if available
            process = None
            if self.track_memory:
                process = psutil.Process(os.getpid())
                mem_before = process.memory_info().rss / 1024 / 1024  # MB
            
            # Run pass
            start = time.perf_counter()
            cmd = [self.mlir_opt_path, f"--{pass_name}", input_path]
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300,
                check=False
            )
            duration = time.perf_counter() - start
            
            if self.track_memory and process:
                mem_after = process.memory_info().rss / 1024 / 1024  # MB
                mem_used = max(0, mem_after - mem_before)
            else:
                mem_used = 0.0
            
            if result.returncode != 0:
                raise RuntimeError(
                    f"Pass '{pass_name}' failed:\n{result.stderr}"
                )
            
            output_ir = result.stdout
            output_size = len(output_ir)
            output_lines = output_ir.count('\n')
            
            metrics = PassMetrics(
                pass_name=pass_name,
                duration_sec=duration,
                input_ir_size=input_size,
                output_ir_size=output_size,
                ir_line_count_before=input_lines,
                ir_line_count_after=output_lines,
                memory_used_mb=mem_used
            )
            
            return output_ir, metrics
        
        finally:
            os.unlink(input_path)
    
    def mlir_to_llvm_ir_with_metrics(
        self,
        mlir_text: str,
        passes: Optional[List[str]] = None,
        target_triple: Optional[str] = None
    ) -> Tuple[str, List[PassMetrics]]:
        """
        Convert MLIR to LLVM IR with detailed per-pass metrics.
        
        Args:
            mlir_text: Input typed MLIR
            passes: List of passes to apply (default: standard pipeline)
            target_triple: Target triple for set-llvm-module-data-layout
        
        Returns:
            (llvm_ir, list_of_pass_metrics)
        """
        if passes is None:
            passes = [
                "convert-pirtm-to-std",
                "convert-linalg-to-affine",
                "affine-loop-invariant-code-motion",
                "convert-affine-to-std",
                "convert-std-to-llvm",
            ]
        
        metrics = []
        current_ir = mlir_text
        
        for pass_name in passes:
            output_ir, pass_metrics = self._run_single_pass(current_ir, pass_name)
            metrics.append(pass_metrics)
            current_ir = output_ir
        
        self.last_metrics = metrics
        return current_ir, metrics
    
    def get_metrics_summary(self) -> Dict[str, Any]:
        """
        Get summary statistics from last conversion.
        
        Returns:
            Dict with totals and aggregates
        """
        if not self.last_metrics:
            return {}
        
        return {
            'total_passes': len(self.last_metrics),
            'total_time_sec': sum(m.duration_sec for m in self.last_metrics),
            'total_memory_mb': sum(m.memory_used_mb for m in self.last_metrics),
            'average_pass_time_sec': sum(m.duration_sec for m in self.last_metrics) / len(self.last_metrics),
            'slowest_pass': max(self.last_metrics, key=lambda m: m.duration_sec).pass_name,
            'slowest_pass_time_sec': max(m.duration_sec for m in self.last_metrics),
            'total_size_reduction_percent': (
                100 * (1 - self.last_metrics[-1].output_ir_size / self.last_metrics[0].input_ir_size)
                if self.last_metrics else 0
            ),
        }
    
    def print_metrics_report(self, metrics: List[PassMetrics] = None):
        """Print human-readable metrics report."""
        if metrics is None:
            metrics = self.last_metrics
        
        if not metrics:
            print("No metrics available")
            return
        
        print("\n" + "="*90)
        print("MLIR Lowering Pass Metrics".center(90))
        print("="*90)
        print(f"{'Pass':<40} {'Time (s)':<12} {'IR Size Change':<20} {'Reduction %':<12}")
        print("-"*90)
        
        for m in metrics:
            size_change = m.output_ir_size - m.input_ir_size
            size_change_str = f"{size_change:+,} bytes"
            print(
                f"{m.pass_name:<40} {m.duration_sec:<12.4f} {size_change_str:<20} {m.size_reduction_percent:<12.1f}%"
            )
        
        # Summary
        total_time = sum(m.duration_sec for m in metrics)
        total_size_change = metrics[-1].output_ir_size - metrics[0].input_ir_size
        print("-"*90)
        print(f"{'TOTAL':<40} {total_time:<12.4f} {total_size_change:<+20,} {100*(1-metrics[-1].output_ir_size/metrics[0].input_ir_size):<12.1f}%")
        print("="*90 + "\n")
    
    def export_metrics_json(self, output_path: str, metrics: List[PassMetrics] = None):
        """Export metrics to JSON file."""
        if metrics is None:
            metrics = self.last_metrics
        
        data = {
            'timestamp': time.strftime("%Y-%m-%d %H:%M:%S"),
            'total_passes': len(metrics),
            'summary': self.get_metrics_summary(),
            'passes': [asdict(m) for m in metrics],
        }
        
        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"✓ Metrics exported to {output_path}")


# Example usage and comparison function
def compare_pass_orders(mlir_text: str, pass_orders: Dict[str, List[str]]) -> Dict[str, Any]:
    """
    Compare performance across different pass orderings.
    
    Args:
        mlir_text: Input MLIR
        pass_orders: Dict mapping order name to list of passes
    
    Returns:
        Dict with comparison results
    """
    gen = InstrumentedLLVMCodeGenerator()
    results = {}
    
    for order_name, passes in pass_orders.items():
        print(f"\nTesting pass order: {order_name}")
        ir, metrics = gen.mlir_to_llvm_ir_with_metrics(mlir_text, passes=passes)
        results[order_name] = {
            'metrics': [asdict(m) for m in metrics],
            'summary': gen.get_metrics_summary(),
            'final_ir_size': len(ir),
        }
    
    return results


if __name__ == "__main__":
    print("InstrumentedLLVMCodeGenerator loaded. Use in your profiling scripts.")
