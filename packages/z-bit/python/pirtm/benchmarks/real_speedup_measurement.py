"""
Phase 6A-5: Real Performance Measurement (C++ vs. NumPy)

Compares actual C++ compiled performance against NumPy reference.

Gate Requirement:
    Speedup ≥ 10.0× on ALL dimensions [64, 128, 256, 512, 1024]

Status: Phase 6A Week 1 Implementation
Related: ADR-062 (Day 90 Performance Baseline)
"""

import time
import numpy as np
from dataclasses import dataclass
from typing import Optional, List
import csv
from pathlib import Path
import json


@dataclass
class BenchmarkResult:
    """Single benchmark measurement result."""
    dimension: int
    numpy_time_ms: float
    cpp_time_ms: float
    speedup: float
    
    @property
    def target_achieved(self) -> bool:
        """Check if speedup >= 10.0x (Phase 6A-5 requirement)."""
        return self.speedup >= 10.0
    
    def __str__(self) -> str:
        """Human-readable result string."""
        status = "✅" if self.target_achieved else "❌"
        return (
            f"{status} dim={self.dimension:4d}: "
            f"NumPy={self.numpy_time_ms:7.3f}ms, "
            f"C++={self.cpp_time_ms:7.3f}ms, "
            f"speedup={self.speedup:6.1f}×"
        )


class PerformanceBenchmark:
    """
    Phase 6A-5: Real performance measurement suite.
    
    Compares:
      - NumPy reference implementation (baseline)
      - C++ compiled binary (actual)
    
    Computes speedup and validates against 10.0× target.
    """
    
    # Test dimensions matching Phase 5 and Phase 6A-5 spec
    BENCHMARK_DIMENSIONS = [64, 128, 256, 512, 1024]
    
    def __init__(self, num_runs: int = 3, num_iterations: int = 100):
        """
        Initialize benchmark suite.
        
        Args:
            num_runs: Number of runs per dimension (averaged)
            num_iterations: Recurrence iterations per run
        """
        self.num_runs = num_runs
        self.num_iterations = num_iterations
        self.results: List[BenchmarkResult] = []
    
    def benchmark_numpy_reference(self, dimension: int, num_iterations: int = 100) -> float:
        """
        Measure NumPy reference implementation performance.
        
        Args:
            dimension: Matrix dimension (N×N)
            num_iterations: Number of recurrence iterations
        
        Returns:
            Average time in milliseconds over self.num_runs
        """
        times = []
        
        for _ in range(self.num_runs):
            # Create random matrix
            X = np.random.randn(dimension, dimension).astype(np.float32)
            
            # Measure NumPy execution
            start = time.perf_counter()
            
            for _ in range(num_iterations):
                # Simulated recurrence: X ← sigmoid(X) (minimal operation)
                X = 1.0 / (1.0 + np.exp(-X))
                # Add some computation to match C++ overhead
                X = X @ X  # Matrix multiply
            
            end = time.perf_counter()
            times.append((end - start) * 1000)  # Convert to ms
        
        return np.mean(times)
    
    def benchmark_compiled(self, compiled_lib, dimension: int, 
                          num_iterations: int = 100) -> float:
        """
        Measure C++ compiled binary performance.
        
        Args:
            compiled_lib: PirtmCompiledModule instance
            dimension: Matrix dimension
            num_iterations: Number of recurrence iterations
        
        Returns:
            Average time in milliseconds over self.num_runs
        """
        times = []
        
        for _ in range(self.num_runs):
            # Create random matrix
            X = np.random.randn(dimension, dimension).astype(np.float32)
            
            # Measure C++ execution
            start = time.perf_counter()
            _ = compiled_lib.step(X, num_iterations=num_iterations)
            end = time.perf_counter()
            
            times.append((end - start) * 1000)  # Convert to ms
        
        return np.mean(times)
    
    def run_comparison(self, compiled_lib, dimensions: Optional[List[int]] = None) -> List[BenchmarkResult]:
        """
        Compare NumPy vs. C++ on specified dimensions.
        
        Args:
            compiled_lib: PirtmCompiledModule instance
            dimensions: Dimensions to benchmark (default: standard set)
        
        Returns:
            List of BenchmarkResult objects
        """
        if dimensions is None:
            dimensions = self.BENCHMARK_DIMENSIONS
        
        self.results = []
        
        print("\n" + "="*70)
        print("PHASE 6A-5: Real Speedup Measurement")
        print("="*70)
        print(f"Runs per dimension: {self.num_runs}")
        print(f"Iterations: {self.num_iterations}")
        print("="*70 + "\n")
        
        for dim in dimensions:
            print(f"Benchmarking dimension {dim}×{dim}...", end=" ", flush=True)
            
            # NumPy baseline
            numpy_time = self.benchmark_numpy_reference(dim, self.num_iterations)
            
            # C++ compiled
            cpp_time = self.benchmark_compiled(compiled_lib, dim, self.num_iterations)
            
            # Compute speedup
            speedup = numpy_time / cpp_time if cpp_time > 0 else 0
            
            # Create result
            result = BenchmarkResult(
                dimension=dim,
                numpy_time_ms=numpy_time,
                cpp_time_ms=cpp_time,
                speedup=speedup
            )
            self.results.append(result)
            
            print(result)
        
        return self.results
    
    def print_summary(self):
        """Print summary statistics."""
        if not self.results:
            print("No benchmark results available")
            return
        
        print("\n" + "="*70)
        print("SUMMARY")
        print("="*70)
        
        all_pass = all(r.target_achieved for r in self.results)
        
        for result in self.results:
            print(result)
        
        print("="*70)
        
        avg_speedup = np.mean([r.speedup for r in self.results])
        min_speedup = np.min([r.speedup for r in self.results])
        
        print(f"\nAverage speedup: {avg_speedup:.1f}×")
        print(f"Min speedup:     {min_speedup:.1f}×")
        print(f"Target (≥10.0×): {'✅ PASS' if all_pass else '❌ FAIL'}")
        
        print("="*70 + "\n")
        
        return all_pass
    
    def save_results(self, output_file: str):
        """
        Save benchmark results to CSV.
        
        Args:
            output_file: Path to CSV file
        """
        with open(output_file, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['dimension', 'numpy_ms', 'cpp_ms', 'speedup', 'pass'])
            
            for result in self.results:
                writer.writerow([
                    result.dimension,
                    f"{result.numpy_time_ms:.3f}",
                    f"{result.cpp_time_ms:.3f}",
                    f"{result.speedup:.1f}",
                    '✅' if result.target_achieved else '❌'
                ])
        
        print(f"Results saved to {output_file}")
    
    def to_dict(self) -> dict:
        """Export results as dictionary."""
        return {
            'config': {
                'num_runs': self.num_runs,
                'num_iterations': self.num_iterations,
                'dimensions': [r.dimension for r in self.results],
            },
            'results': [
                {
                    'dimension': r.dimension,
                    'numpy_ms': r.numpy_time_ms,
                    'cpp_ms': r.cpp_time_ms,
                    'speedup': r.speedup,
                    'target_achieved': r.target_achieved,
                }
                for r in self.results
            ],
            'summary': {
                'avg_speedup': float(np.mean([r.speedup for r in self.results])),
                'min_speedup': float(np.min([r.speedup for r in self.results])),
                'all_pass': all(r.target_achieved for r in self.results),
            }
        }
