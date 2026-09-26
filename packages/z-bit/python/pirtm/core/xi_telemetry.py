"""
ADR-021 Phase 1: Ξ(t)-Core Execution Telemetry

Purpose:
    Collect runtime metrics for Ξ(t) execution to inform optimization.
    Metrics guide performance tuning and bottleneck identification.

Metrics collected:
    - xi_call_count: How many times was Ξ(t) called?
    - xi_avg_exec_time: Average time per execution
    - xi_cache_hit_rate: Fraction of calls that hit cache
    - xi_decay_distribution: Histogram of decay rates used
    - xi_memory_usage: Peak cache memory
    - xi_total_time: Cumulative time in Ξ(t)

Output format: JSON (machine-readable), human-readable summary

Provenance: MultiplicityFoundation/Meta-Relativity
Math Stack: Performance measurement, time-based analysis
Registry: github.com/MultiplicityFoundation/Meta-Relativity
Date: 2026-03-17
"""

import time
import json
import numpy as np
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional
from collections import defaultdict


# ============================================================================
# Data Structures
# ============================================================================

@dataclass
class ExecutionMetric:
    """Single metric capture point."""
    timestamp: float
    call_number: int
    prime_index: int
    time_t: float
    execution_time_us: float  # Microseconds
    cache_hit: bool
    output_norm: float
    decay_factor: float


@dataclass
class TelemetryReport:
    """Complete telemetry snapshot."""
    start_time: float
    end_time: float
    total_calls: int
    cache_hits: int
    cache_misses: int
    cache_hit_rate: float
    
    total_exec_time_ms: float  # Total time in Ξ(t)
    avg_exec_time_us: float    # Average per call
    min_exec_time_us: float
    max_exec_time_us: float
    
    primes_used: List[int]  # Unique primes
    decay_distribution: Dict  # Stats per prime
    
    peak_memory_mb: Optional[float] = None
    notes: str = ""
    metrics: List[ExecutionMetric] = field(default_factory=list)


# ============================================================================
# Telemetry Collector
# ============================================================================

class XiTelemetry:
    """
    Collect and analyze Ξ(t) execution metrics.
    
    Usage:
        from pirtm.core.xi_telemetry import XiTelemetry
        
        telemetry = XiTelemetry()
        
        # Inside execution loop:
        with telemetry.timer(prime_index=7, time_t=0.5):
            result = executor.execute(psi, 7, 0.5)
        telemetry.record_cache_hit(hit=True)
        
        # After run:
        report = telemetry.get_report()
        print(report)
    """
    
    def __init__(self):
        """Initialize telemetry collector."""
        self.start_time = time.time()
        self.metrics: List[ExecutionMetric] = []
        
        self.call_number = 0
        self.cache_hits = 0
        self.cache_misses = 0
        
        # Current metric being recorded
        self._current_metric: Optional[ExecutionMetric] = None
        self._timer_start: Optional[float] = None
        self._timer_prime: Optional[int] = None
        self._timer_time_t: Optional[float] = None
    
    class Timer:
        """Context manager for timing execution."""
        
        def __init__(self, telemetry: 'XiTelemetry', prime_index: int, time_t: float):
            self.telemetry = telemetry
            self.prime_index = prime_index
            self.time_t = time_t
            self.start_time: Optional[float] = None
        
        def __enter__(self):
            self.start_time = time.perf_counter()
            self.telemetry._timer_start = self.start_time
            self.telemetry._timer_prime = self.prime_index
            self.telemetry._timer_time_t = self.time_t
            return self
        
        def __exit__(self, exc_type, exc_val, exc_tb):
            end_time = time.perf_counter()
            exec_time_us = (end_time - self.start_time) * 1e6
            
            self.telemetry._record_execution(
                prime_index=self.prime_index,
                time_t=self.time_t,
                execution_time_us=exec_time_us
            )
    
    def timer(self, prime_index: int, time_t: float) -> 'XiTelemetry.Timer':
        """
        Context manager for timing execution.
        
        Usage:
            with telemetry.timer(prime_index=7, time_t=0.5):
                result = executor.execute(...)
        """
        return self.Timer(self, prime_index, time_t)
    
    def _record_execution(
        self,
        prime_index: int,
        time_t: float,
        execution_time_us: float
    ) -> None:
        """Record single execution."""
        self.call_number += 1
        
        metric = ExecutionMetric(
            timestamp=time.time(),
            call_number=self.call_number,
            prime_index=prime_index,
            time_t=time_t,
            execution_time_us=execution_time_us,
            cache_hit=False,  # Will be updated
            output_norm=0.0,  # Can be updated later
            decay_factor=np.exp(-np.log(prime_index) * time_t)
        )
        
        self.metrics.append(metric)
        self._current_metric = metric
    
    def record_cache_hit(self, hit: bool) -> None:
        """Record cache hit/miss."""
        if self._current_metric is not None:
            self._current_metric.cache_hit = hit
        
        if hit:
            self.cache_hits += 1
        else:
            self.cache_misses += 1
    
    def record_output(self, output_norm: float) -> None:
        """Record output for metric collection."""
        if self._current_metric is not None:
            self._current_metric.output_norm = output_norm
    
    def get_report(self) -> TelemetryReport:
        """Generate comprehensive telemetry report."""
        end_time = time.time()
        
        if not self.metrics:
            return TelemetryReport(
                start_time=self.start_time,
                end_time=end_time,
                total_calls=0,
                cache_hits=0,
                cache_misses=0,
                cache_hit_rate=0.0,
                total_exec_time_ms=0.0,
                avg_exec_time_us=0.0,
                min_exec_time_us=0.0,
                max_exec_time_us=0.0,
                primes_used=[],
                decay_distribution={},
                notes="No executions recorded"
            )
        
        # Aggregate metrics
        exec_times = [m.execution_time_us for m in self.metrics]
        decay_factors = [m.decay_factor for m in self.metrics]
        primes = sorted(set(m.prime_index for m in self.metrics))
        
        total_exec_time_us = sum(exec_times)
        total_calls = self.cache_hits + self.cache_misses
        cache_hit_rate = (
            self.cache_hits / total_calls if total_calls > 0 else 0.0
        )
        
        # Decay distribution by prime
        decay_by_prime: Dict[int, List[float]] = defaultdict(list)
        for metric in self.metrics:
            decay_by_prime[metric.prime_index].append(metric.decay_factor)
        
        decay_distribution = {
            p: {
                "count": len(decays),
                "min": float(np.min(decays)),
                "max": float(np.max(decays)),
                "mean": float(np.mean(decays)),
                "median": float(np.median(decays)),
            }
            for p, decays in decay_by_prime.items()
        }
        
        report = TelemetryReport(
            start_time=self.start_time,
            end_time=end_time,
            total_calls=total_calls,
            cache_hits=self.cache_hits,
            cache_misses=self.cache_misses,
            cache_hit_rate=cache_hit_rate,
            total_exec_time_ms=total_exec_time_us / 1000,
            avg_exec_time_us=np.mean(exec_times),
            min_exec_time_us=np.min(exec_times),
            max_exec_time_us=np.max(exec_times),
            primes_used=primes,
            decay_distribution=decay_distribution,
            metrics=self.metrics
        )
        
        return report
    
    def to_json(self) -> str:
        """Export telemetry report as JSON."""
        report = self.get_report()
        
        # Convert for JSON serialization
        data = {
            "start_time": report.start_time,
            "end_time": report.end_time,
            "total_calls": report.total_calls,
            "cache_hits": report.cache_hits,
            "cache_misses": report.cache_misses,
            "cache_hit_rate": report.cache_hit_rate,
            "total_exec_time_ms": report.total_exec_time_ms,
            "avg_exec_time_us": report.avg_exec_time_us,
            "min_exec_time_us": report.min_exec_time_us,
            "max_exec_time_us": report.max_exec_time_us,
            "primes_used": report.primes_used,
            "decay_distribution": report.decay_distribution,
        }
        
        return json.dumps(data, indent=2)
    
    def print_summary(self) -> None:
        """Print human-readable telemetry summary."""
        report = self.get_report()
        
        lines = [
            "",
            "=" * 70,
            "ADR-021 Ξ(t)-CORE EXECUTION TELEMETRY",
            "=" * 70,
            f"Total Calls:        {report.total_calls:>10}",
            f"Cache Hits:         {report.cache_hits:>10} ({report.cache_hit_rate:.1%})",
            f"Cache Misses:       {report.cache_misses:>10}",
            "",
            f"Total Time:         {report.total_exec_time_ms:>10.3f} ms",
            f"Avg Time/Call:      {report.avg_exec_time_us:>10.3f} µs",
            f"Min Time/Call:      {report.min_exec_time_us:>10.3f} µs",
            f"Max Time/Call:      {report.max_exec_time_us:>10.3f} µs",
            "",
            f"Primes Used:        {', '.join(map(str, report.primes_used))}",
            "",
            "Decay Factor Distribution:",
        ]
        
        for prime in sorted(report.primes_used):
            if prime in report.decay_distribution:
                dist = report.decay_distribution[prime]
                lines.append(
                    f"  p={prime:5d}: "
                    f"n={dist['count']:5d}, "
                    f"min={dist['min']:.4f}, "
                    f"mean={dist['mean']:.4f}, "
                    f"max={dist['max']:.4f}"
                )
        
        lines.append("=" * 70)
        lines.append("")
        
        print("\n".join(lines))


# ============================================================================
# Global Telemetry Instance
# ============================================================================

_global_telemetry: Optional[XiTelemetry] = None


def get_global_telemetry() -> XiTelemetry:
    """Get or create global telemetry instance."""
    global _global_telemetry
    
    if _global_telemetry is None:
        _global_telemetry = XiTelemetry()
    
    return _global_telemetry


def reset_telemetry() -> None:
    """Reset global telemetry."""
    global _global_telemetry
    _global_telemetry = XiTelemetry()


if __name__ == "__main__":
    # Smoke test
    print("ADR-021 Xi Telemetry - Smoke Test")
    
    telemetry = XiTelemetry()
    
    # Simulate executions
    primes = [3, 7, 13]
    times = [0.1, 0.5, 1.0]
    
    for i in range(20):
        prime = primes[i % len(primes)]
        time_t = times[i % len(times)]
        
        # Simulate execution time
        with telemetry.timer(prime_index=prime, time_t=time_t):
            time.sleep(0.001)  # 1ms
        
        # Random cache hit/miss
        cache_hit = np.random.random() > 0.3
        telemetry.record_cache_hit(cache_hit)
    
    # Print report
    telemetry.print_summary()
    
    # Save JSON
    json_output = telemetry.to_json()
    print("JSON output sample (first 200 chars):")
    print(json_output[:200])
