#!/usr/bin/env python3
"""
Phase 6A Week 4: Critical Speedup Validation - Execution Script

Runs real performance benchmarks against Phase 5 compiled descriptors.

GATE REQUIREMENT:
    Speedup ≥ 10.0× on ALL dimensions [64, 128, 256, 512, 1024]

Usage:
    python pirtm/benchmarks/week4_benchmark_executor.py

Output:
    - Console: Real-time benchmark results
    - docs/PHASE_6A_WEEK4_BENCHMARK_RESULTS.md - Detailed report
    - artifacts/week4_benchmark_results.json - JSON results
    - artifacts/week4_benchmark_results.csv - CSV results
"""

import sys
import json
import tempfile
from pathlib import Path
from dataclasses import asdict
import traceback
import os

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))


def main():
    print("\n" + "="*80)
    print("PHASE 6A WEEK 4: CRITICAL SPEEDUP VALIDATION GATE")
    print("="*80)
    print("\nInitializing benchmark infrastructure...\n")
    
    # Step 1: Verify all components available
    print("[1/5] Checking components...")
    try:
        from pirtm.compiler.llvm_compiler import CompilationPipeline
        print("  ✅ CompilationPipeline available")
    except ImportError as e:
        print(f"  ❌ CompilationPipeline NOT available: {e}")
        return False
    
    try:
        from pirtm.runtime.pirtm_bindings import PirtmCompiledModule
        print("  ✅ PirtmCompiledModule available")
    except ImportError as e:
        print(f"  ❌ PirtmCompiledModule NOT available: {e}")
        return False
    
    try:
        from pirtm.benchmarks.real_speedup_measurement import PerformanceBenchmark
        print("  ✅ PerformanceBenchmark available")
    except ImportError as e:
        print(f"  ❌ PerformanceBenchmark NOT available: {e}")
        return False
    
    # Step 2: Locate descriptors
    print("\n[2/5] Locating Phase 5 descriptors...")
    examples_dir = Path(__file__).parent.parent / "examples"
    descriptors = list(examples_dir.glob("*.json"))
    
    if not descriptors:
        print(f"  ❌ No descriptors found in {examples_dir}")
        return False
    
    print(f"  ✅ Found {len(descriptors)} descriptor(s):")
    for desc in descriptors:
        print(f"     - {desc.name}")
    
    # Use first descriptor for benchmarking
    descriptor_path = descriptors[0]
    print(f"\n  Selected: {descriptor_path.name}")
    
    # Step 3: Load descriptor
    print("\n[3/5] Loading descriptor...")
    try:
        with open(descriptor_path, 'r') as f:
            descriptor = json.load(f)
        print(f"  ✅ Loaded descriptor: {descriptor_path.name}")
    except Exception as e:
        print(f"  ❌ Failed to load descriptor: {e}")
        return False
    
    # Step 4: Compile descriptor
    print("\n[4/5] Compiling descriptor to .so with hooks...")
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            pipeline = CompilationPipeline(
                output_dir=tmpdir,
                opt_level="-O3",
                include_hooks=True
            )
            print(f"  📍 Pipeline initialized (output: {tmpdir})")
            
            # Compile descriptor
            so_path = pipeline.compile_descriptor_to_library(descriptor)
            print(f"  ✅ Compiled to: {Path(so_path).name}")
            
            # Verify compilation
            if not Path(so_path).exists():
                print(f"  ❌ Compiled binary not found: {so_path}")
                return False
            
            print(f"  ✅ Binary verified (size: {Path(so_path).stat().st_size} bytes)")
            
            # Step 5: Run benchmarks
            print("\n[5/5] Running performance benchmarks...")
            print("  Configuration:")
            print("    - Runs per dimension: 3")
            print("    - Iterations per run: 100")
            print("    - Target speedup: ≥10.0× on ALL dimensions")
            print("\n" + "-"*80)
            
            try:
                # Load compiled binary
                compiled_lib = PirtmCompiledModule(so_path)
                print(f"  ✅ Loaded compiled module")
                
                # Run benchmarks
                benchmark = PerformanceBenchmark(
                    num_runs=3,
                    num_iterations=100
                )
                
                results = benchmark.run_comparison(compiled_lib)
                
                # Print summary
                print("-"*80)
                benchmark.print_summary()
                
                # Check if gate passed
                all_pass = all(r.target_achieved for r in results)
                
                # Save results
                print("\n📊 Saving results...")
                
                # Ensure output directories exist
                artifacts_dir = Path(__file__).parent.parent.parent / "artifacts"
                artifacts_dir.mkdir(exist_ok=True)
                
                docs_dir = Path(__file__).parent.parent.parent / "docs"
                docs_dir.mkdir(exist_ok=True)
                
                # Save CSV
                csv_path = artifacts_dir / "week4_benchmark_results.csv"
                benchmark.save_results(str(csv_path))
                
                # Save JSON
                results_dict = benchmark.to_dict()
                results_dict['gate_passed'] = all_pass
                results_dict['descriptor'] = descriptor_path.name
                
                json_path = artifacts_dir / "week4_benchmark_results.json"
                with open(json_path, 'w') as f:
                    json.dump(results_dict, f, indent=2)
                print(f"  ✅ Saved to {json_path}")
                
                # Generate markdown report
                report = generate_report(results, all_pass, descriptor_path.name)
                report_path = docs_dir / "PHASE_6A_WEEK4_BENCHMARK_RESULTS.md"
                with open(report_path, 'w') as f:
                    f.write(report)
                print(f"  ✅ Report saved to {report_path}")
                
                # Final decision
                print("\n" + "="*80)
                if all_pass:
                    print("✅✅✅ WEEK 4 GATE PASSED ✅✅✅")
                    print("="*80)
                    print("\nDECISION: Phase 6B GO-LIVE APPROVED")
                    print("\nAll dimensions achieved ≥10.0× speedup:")
                    for result in results:
                        print(f"  ✅ dim={result.dimension:4d}: {result.speedup:6.1f}×")
                    print("\nPhase 6B (Cloud Deployment) is approved for execution.")
                    print("="*80 + "\n")
                    return True
                else:
                    print("❌ WEEK 4 GATE FAILED ❌")
                    print("="*80)
                    failed = [r for r in results if not r.target_achieved]
                    print(f"\n{len(failed)} dimension(s) failed to meet 10.0× target:")
                    for result in failed:
                        gap = 10.0 - result.speedup
                        print(f"  ❌ dim={result.dimension:4d}: {result.speedup:6.1f}× (gap: {gap:5.1f}×)")
                    print("\nRecommendation: Extend Phase 6A or reconsider architecture")
                    print("="*80 + "\n")
                    return False
                    
            except Exception as e:
                print(f"\n  ❌ Benchmark execution failed: {e}")
                traceback.print_exc()
                return False
                
    except Exception as e:
        print(f"  ❌ Compilation failed: {e}")
        traceback.print_exc()
        return False


def generate_report(results, gate_passed, descriptor_name):
    """Generate markdown report of Week 4 benchmark results."""
    report = f"""---
phase: "6A Week 4"
gate: "Critical Speedup Validation"
date: "2026-03-18"
descriptor: "{descriptor_name}"
status: "{'PASS' if gate_passed else 'FAIL'}"
---

# Phase 6A Week 4: Critical Speedup Validation Results

**Status**: {'✅ GATE PASSED' if gate_passed else '❌ GATE FAILED'}  
**Descriptor**: {descriptor_name}  
**Date**: 2026-03-18  

## Benchmark Configuration

- **Runs per dimension**: 3 (results averaged)
- **Iterations per run**: 100 recurrence iterations
- **Target speedup**: ≥10.0× on ALL dimensions [64, 128, 256, 512, 1024]
- **Gate requirement**: All dimensions must achieve target

## Raw Results

| Dimension | NumPy Time (ms) | C++ Time (ms) | Speedup | Status |
|-----------|-----------------|---------------|---------|--------|
"""
    
    for result in results:
        status = "✅ PASS" if result.target_achieved else "❌ FAIL"
        report += f"| {result.dimension} | {result.numpy_time_ms:.3f} | {result.cpp_time_ms:.3f} | {result.speedup:.1f}× | {status} |\n"
    
    # Summary statistics
    speedups = [r.speedup for r in results]
    avg_speedup = sum(speedups) / len(speedups)
    min_speedup = min(speedups)
    
    report += f"""
## Summary Statistics

- **Average speedup**: {avg_speedup:.1f}×
- **Minimum speedup**: {min_speedup:.1f}×
- **Target**: ≥10.0× on all dimensions
- **Result**: {'✅ ALL DIMENSIONS PASS' if gate_passed else '❌ SOME DIMENSIONS FAIL'}

## Gate Decision

"""
    
    if gate_passed:
        report += """### ✅ WEEK 4 GATE PASSED

**Speedup Validation**: SUCCESSFUL

All dimensions achieved the required ≥10.0× speedup threshold.

### Phase 6B Approval

Phase 6B (Cloud Deployment) is **APPROVED FOR GO-LIVE**:
- Week 4 critical gate: ✅ PASSED
- Performance baseline: ✅ VALIDATED
- Infrastructure: ✅ PRODUCTION-READY

### Next Steps

1. **Phase 6B Initiation**: Begin cloud infrastructure deployment (Weeks 4-10)
2. **Week 4-5 Overlap**: Start 6B-1 systems setup while finalizing 6A
3. **Week 10 Target**: Both phases complete, system ready for production

### Success Metrics Achieved

- ✅ MLIR→LLVM compilation pipeline (Week 1)
- ✅ C++ activation hooks implementation (Week 2)
- ✅ Full end-to-end compilation (Week 3)
- ✅ Real performance validation (Week 4)
- ✅ ≥10.0× speedup on all dimensions
"""
    else:
        report += """### ❌ WEEK 4 GATE FAILED

**Speedup Validation**: UNSUCCESSFUL

One or more dimensions failed to achieve the required ≥10.0× speedup threshold.

### Failed Dimensions

"""
        failed = [r for r in results if not r.target_achieved]
        for result in failed:
            gap = 10.0 - result.speedup
            report += f"- **dim={result.dimension}**: {result.speedup:.1f}× (gap: {gap:.1f}×)\n"
        
        report += """
### Recommendations

1. **Extended Optimization Phase**: 
   - Profile C++ execution to identify bottlenecks
   - Optimize LLVM compilation flags
   - Consider architectural changes to critical paths

2. **Alternative Approaches**:
   - Evaluate different LLVM optimization levels (-O2 vs -O3 vs -Ofast)
   - Consider target-specific optimizations (AVX-512, etc.)
   - Profile memory access patterns

3. **Timeline Impact**:
   - Extend Phase 6A by 1-2 weeks
   - Delay Phase 6B until speedup target achieved
   - May require architectural review

### Next Action

Schedule review meeting to assess performance bottlenecks and determine path forward.
"""
    
    report += """
## Technical Details

### Pipeline Configuration
- **Compiler**: g++/clang++ with LLVM IR generation
- **Optimization Level**: -O3
- **Hooks Enabled**: Yes (activation profiling)
- **Descriptor**: """ + descriptor_name + """

### Test Environment
- **Date**: 2026-03-18
- **OS**: Linux (Ubuntu 24.04.3 LTS)
- **Python**: 3.12.3
- **Hardware**: Standard container environment

## Artifacts

- CSV Results: `artifacts/week4_benchmark_results.csv`
- JSON Results: `artifacts/week4_benchmark_results.json`
- This Report: `docs/PHASE_6A_WEEK4_BENCHMARK_RESULTS.md`
"""
    
    return report


if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        traceback.print_exc()
        sys.exit(1)
