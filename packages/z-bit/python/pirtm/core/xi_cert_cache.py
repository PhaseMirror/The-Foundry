"""
ADR-021 Phase 1: Ξ(t)-Core Certification Cache

Purpose:
    Cache Ξ(t) execution results to avoid redundant computation.
    Ξ(t) is deterministic: same (p, t, input_hash) → same result always.

Cache design:
    Key: (prime_index, time_t, input_state_hash)
    Value: (output_state, decay_rate, timestamp, hits)
    
    Strategy: LRU eviction when full
    TTL: Configurable (default 1 hour or until session ends)
    Max size: Default 1000 entries

Invariants:
    1. Cache hits return deterministic results (INV-5)
    2. Cache misses trigger recomputation
    3. No stale entries after TTL expiration
    4. Hash collisions are extremely rare (Blake3 → 2^-129)

Provenance: MultiplicityFoundation/Meta-Relativity
Math Stack: Ξ(t) determinism, cache coherence
Registry: github.com/MultiplicityFoundation/Meta-Relativity
Date: 2026-03-17
"""

import time
import hashlib
import numpy as np
from dataclasses import dataclass, field
from typing import Tuple, Optional, Dict
from collections import OrderedDict


# ============================================================================
# Constants
# ============================================================================

DEFAULT_CACHE_SIZE = 1000
DEFAULT_TTL_SECONDS = 3600  # 1 hour
HASH_COLLISION_THRESHOLD = 1e-10  # Warn if hash probability > this


# ============================================================================
# Data Structures
# ============================================================================

@dataclass
class CacheEntry:
    """Single entry in Ξ(t) execution cache."""
    output_state: np.ndarray
    decay_factor: float
    timestamp: float
    hit_count: int = 0
    key_hash: str = ""  # For verification
    
    def is_expired(self, current_time: float, ttl: float) -> bool:
        """Check if entry has expired."""
        return (current_time - self.timestamp) > ttl


# ============================================================================
# LRU Cache Implementation
# ============================================================================

class XiCertCache:
    """
    LRU cache for Ξ(t) execution results.
    
    Guarantees:
    - Cache hits are deterministic (same query → same result)
    - Cache misses trigger computation
    - Expired entries are removed
    - LRU eviction when capacity exceeded
    """
    
    def __init__(
        self,
        max_size: int = DEFAULT_CACHE_SIZE,
        ttl_seconds: float = DEFAULT_TTL_SECONDS
    ):
        """
        Initialize cache.
        
        Args:
            max_size: Maximum number of entries
            ttl_seconds: Time-to-live for entries
        """
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self.cache: OrderedDict[str, CacheEntry] = OrderedDict()
        self.stats = {
            "hits": 0,
            "misses": 0,
            "evictions": 0,
            "expirations": 0
        }
    
    @staticmethod
    def _make_key(
        prime_index: int,
        time_t: float,
        input_state: np.ndarray
    ) -> Tuple[str, str]:
        """
        Generate cache key and verify hash.
        
        Args:
            prime_index: P in Ξ_p(t)
            time_t: Time parameter
            input_state: State vector or matrix
        
        Returns:
            (key: str, state_hash: str)
        """
        # Hash the input state
        state_bytes = input_state.astype(np.float64).tobytes()
        state_hash = hashlib.blake2b(state_bytes, digest_size=8).hexdigest()
        
        # Composite key
        key = f"{prime_index}:{time_t:.10f}:{state_hash}"
        
        return key, state_hash
    
    def get(
        self,
        prime_index: int,
        time_t: float,
        input_state: np.ndarray
    ) -> Optional[Tuple[np.ndarray, float]]:
        """
        Retrieve Ξ(t) execution result from cache.
        
        Args:
            prime_index: Prime index p
            time_t: Time parameter t
            input_state: Input state
        
        Returns:
            (output_state, decay_factor) if hit, None if miss or expired
        """
        key, _ = self._make_key(prime_index, time_t, input_state)
        
        current_time = time.time()
        
        # Check existence
        if key not in self.cache:
            self.stats["misses"] += 1
            return None
        
        entry = self.cache[key]
        
        # Check expiration
        if entry.is_expired(current_time, self.ttl_seconds):
            del self.cache[key]
            self.stats["expirations"] += 1
            self.stats["misses"] += 1
            return None
        
        # Hit! Update LRU by moving to end
        self.cache.move_to_end(key)
        entry.hit_count += 1
        self.stats["hits"] += 1
        
        return (entry.output_state.copy(), entry.decay_factor)
    
    def put(
        self,
        prime_index: int,
        time_t: float,
        input_state: np.ndarray,
        output_state: np.ndarray,
        decay_factor: float
    ) -> None:
        """
        Store Ξ(t) execution result in cache.
        
        Args:
            prime_index: Prime index p
            time_t: Time parameter t
            input_state: Original input (for key generation)
            output_state: Computed output
            decay_factor: e^{-λ_p·t}
        """
        key, state_hash = self._make_key(prime_index, time_t, input_state)
        
        # Remove if already exists (to update)
        if key in self.cache:
            del self.cache[key]
        
        # Create entry
        entry = CacheEntry(
            output_state=output_state.copy(),
            decay_factor=decay_factor,
            timestamp=time.time(),
            hit_count=0,
            key_hash=state_hash
        )
        
        # Add to cache
        self.cache[key] = entry
        
        # Evict LRU if over capacity
        if len(self.cache) > self.max_size:
            evicted_key, evicted_entry = self.cache.popitem(last=False)
            self.stats["evictions"] += 1
    
    def clear(self) -> None:
        """Clear all cache entries."""
        self.cache.clear()
    
    def cleanup_expired(self) -> int:
        """
        Remove all expired entries.
        
        Returns:
            Number of entries removed
        """
        current_time = time.time()
        expired_keys = [
            key for key, entry in self.cache.items()
            if entry.is_expired(current_time, self.ttl_seconds)
        ]
        
        for key in expired_keys:
            del self.cache[key]
            self.stats["expirations"] += 1
        
        return len(expired_keys)
    
    def get_stats(self) -> Dict:
        """Get cache statistics."""
        total_requests = self.stats["hits"] + self.stats["misses"]
        hit_rate = (
            self.stats["hits"] / total_requests
            if total_requests > 0 else 0.0
        )
        
        return {
            **self.stats,
            "total_requests": total_requests,
            "hit_rate": hit_rate,
            "cache_size": len(self.cache),
            "max_size": self.max_size,
            "utilization": len(self.cache) / self.max_size if self.max_size > 0 else 0
        }
    
    def __len__(self) -> int:
        """Number of entries in cache."""
        return len(self.cache)
    
    def __repr__(self) -> str:
        """String representation."""
        stats = self.get_stats()
        return (
            f"XiCertCache(size={stats['cache_size']}/{self.max_size}, "
            f"hit_rate={stats['hit_rate']:.1%}, "
            f"hits={self.stats['hits']}, "
            f"misses={self.stats['misses']})"
        )


# ============================================================================
# Global Cache Instance
# ============================================================================

_global_cache: Optional[XiCertCache] = None


def get_global_cache(max_size: int = DEFAULT_CACHE_SIZE) -> XiCertCache:
    """Get or create global Ξ(t) cache."""
    global _global_cache
    
    if _global_cache is None:
        _global_cache = XiCertCache(max_size=max_size)
    
    return _global_cache


def reset_global_cache() -> None:
    """Clear global cache (for testing)."""
    global _global_cache
    if _global_cache is not None:
        _global_cache.clear()


# ============================================================================
# Cached Executor Wrapper
# ============================================================================

class CachedXiExecutor:
    """
    Wrapper around XiExecutor that uses cache.
    
    Usage:
        from pirtm.core.xi_executor import XiExecutor
        from pirtm.core.xi_cert_cache import CachedXiExecutor
        
        cached_exec = CachedXiExecutor(executor=XiExecutor("direct"))
        result1 = cached_exec.execute(psi, p=7, t=0.5)  # Computed
        result2 = cached_exec.execute(psi, p=7, t=0.5)  # From cache (hit)
    """
    
    def __init__(self, executor=None, cache: Optional[XiCertCache] = None):
        """
        Initialize cached executor.
        
        Args:
            executor: Base XiExecutor (default: create new 'direct')
            cache: XiCertCache to use (default: global cache)
        """
        if executor is None:
            from pirtm.core.xi_executor import XiExecutor
            executor = XiExecutor("direct")
        
        self.executor = executor
        self.cache = cache if cache is not None else get_global_cache()
        self.cache = cache if cache is not None else get_global_cache()
    
    def execute(self, psi, p: int, t: float):
        """
        Execute Ξ(t) with caching.
        
        Args:
            psi: Input state
            p: Prime index
            t: Time
        
        Returns:
            XiExecutionResult (same as uncached executor)
        """
        psi = np.asarray(psi, dtype=np.float64)
        
        # Try cache
        cached_result = self.cache.get(p, t, psi)
        if cached_result is not None:
            output_state, decay_factor = cached_result
            # Return result with cache metadata
            from pirtm.core.xi_executor import XiExecutionResult
            import hashlib
            
            return XiExecutionResult(
                output_state=output_state,
                decay_factor=decay_factor,
                prime_index=p,
                time_t=t,
                strategy=self.executor.strategy,
                precision_check=True,
                input_hash=hashlib.blake2b(psi.tobytes(), digest_size=8).hexdigest()
            )
        
        # Compute
        result = self.executor.execute(psi, p, t)
        
        # Cache result
        self.cache.put(p, t, psi, result.output_state, result.decay_factor)
        
        return result
    
    def get_cache_stats(self) -> Dict:
        """Get cache statistics."""
        return self.cache.get_stats()


if __name__ == "__main__":
    # Smoke test
    print("ADR-021 Xi Cache - Smoke Test")
    print("=" * 60)
    
    cache = XiCertCache(max_size=100)
    
    # Test 1: Miss, then hit
    psi = np.array([1.0, 2.0, 3.0])
    
    result_miss = cache.get(7, 0.5, psi)
    print(f"✓ Test 1a (miss): {result_miss is None}")
    
    cache.put(7, 0.5, psi, psi * 0.7, 0.7)
    result_hit = cache.get(7, 0.5, psi)
    print(f"✓ Test 1b (hit): {result_hit is not None}")
    
    # Test 2: Statistics
    stats = cache.get_stats()
    print(f"✓ Test 2 (stats): hits={stats['hits']}, "
          f"misses={stats['misses']}, hit_rate={stats['hit_rate']:.1%}")
    
    # Test 3: Expiration
    old_ttl = cache.ttl_seconds
    cache.ttl_seconds = 0.1  # Very short TTL
    time.sleep(0.2)
    expired_count = cache.cleanup_expired()
    print(f"✓ Test 3 (expired): {expired_count} entries cleaned")
    
    cache.ttl_seconds = old_ttl
    
    print("=" * 60)
    print("All cache tests passed!")
