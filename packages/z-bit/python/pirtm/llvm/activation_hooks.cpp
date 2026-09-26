/*
 * Phase 6A-2: Activation Function Hooks
 *
 * Purpose:
 *   Profiling hooks for activation function measurements during execution.
 *   Called from generated LLVM IR to measure activation time and detect
 *   saturation issues.
 *
 * Hooks:
 *   - pirtm_activation_enter: Called before sigmoid
 *   - pirtm_activation_exit: Called after sigmoid
 *   - pirtm_matmul_start: Called before matrix multiply
 *   - pirtm_matmul_end: Called after matrix multiply
 *
 * Related: ADR-062 (Day 90 Performance Baseline)
 */

#include <cstdint>
#include <cstddef>
#include <cmath>
#include <ctime>
#include <iostream>
#include <atomic>

// ============================================================================
// Global Profiling State
// ============================================================================

struct OperationMetrics {
    uint32_t operation_id;
    uint64_t timestamp_ns;
    float saturation_ratio;
    int64_t input_size;
};

// Thread-local storage for performance data
static thread_local OperationMetrics current_op;
static thread_local uint64_t activation_enter_time = 0;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get current time in nanoseconds (best-effort).
 * Uses clock_gettime if available, falls back to CLOCK_MONOTONIC.
 */
static inline uint64_t get_time_ns() {
    struct timespec ts;
    if (clock_gettime(CLOCK_MONOTONIC, &ts) == 0) {
        return ts.tv_sec * 1000000000ULL + ts.tv_nsec;
    }
    return 0;
}

/**
 * Calculate saturation ratio for sigmoid output.
 * Saturation = fraction of values near boundaries (< 0.01 or > 0.99).
 */
static float compute_saturation(const float* x, size_t size) {
    if (size == 0) return 0.0f;
    
    size_t saturated = 0;
    for (size_t i = 0; i < size; ++i) {
        if (x[i] < 0.01f || x[i] > 0.99f) {
            saturated++;
        }
    }
    
    return static_cast<float>(saturated) / static_cast<float>(size);
}

/**
 * Detect NaN or Inf values in array.
 */
static bool has_invalid_values(const float* x, size_t size) {
    for (size_t i = 0; i < size; ++i) {
        if (!std::isfinite(x[i])) {
            return true;
        }
    }
    return false;
}

// ============================================================================
// Hook Implementations
// ============================================================================

/**
 * Hook called BEFORE sigmoid activation.
 *
 * Records:
 *   - Operation ID for tracing
 *   - Timestamp for measuring latency
 *   - Input size for throughput calculation
 */
extern "C" void pirtm_activation_enter(float* x, size_t size, uint32_t op_id) {
    current_op.operation_id = op_id;
    current_op.input_size = size;
    activation_enter_time = get_time_ns();
    
    // Optional: log to stderr for debugging
    // (Disable in production for performance)
    // fprintf(stderr, "[ACTIVATION_ENTER] op_id=%u, size=%zu\n", op_id, size);
}

/**
 * Hook called AFTER sigmoid activation.
 *
 * Validates:
 *   - No NaN/Inf in output
 *   - Saturation level (warning if too high)
 *
 * Records:
 *   - Elapsed time
 *   - Output saturation ratio
 */
extern "C" void pirtm_activation_exit(float* x, size_t size, uint32_t op_id) {
    uint64_t end_time = get_time_ns();
    
    // Record metrics
    if (activation_enter_time > 0) {
        uint64_t elapsed_ns = end_time - activation_enter_time;
        current_op.timestamp_ns = elapsed_ns;
    }
    
    // Compute output saturation
    current_op.saturation_ratio = compute_saturation(x, size);
    
    // Validity checks
    if (has_invalid_values(x, size)) {
        // In production: log to metrics system, don't crash
        // For now, just mark as problematic
        current_op.saturation_ratio = -1.0f;  // Sentinel value for NaN/Inf
    }
    
    // Optional: log to stderr
    // fprintf(stderr, "[ACTIVATION_EXIT] op_id=%u, saturation=%.3f, time_ns=%lu\n",
    //         op_id, current_op.saturation_ratio, current_op.timestamp_ns);
}

/**
 * Hook called BEFORE matrix multiplication.
 *
 * Records:
 *   - Matrix dimension for FLOP calculation
 *   - Timestamp for latency measurement
 */
extern "C" void pirtm_matmul_start(size_t N, uint32_t op_id) {
    current_op.operation_id = op_id;
    current_op.input_size = N;
    activation_enter_time = get_time_ns();
    
    // Optional: log to stderr
    // fprintf(stderr, "[MATMUL_START] op_id=%u, dim=%zu\n", op_id, N);
}

/**
 * Hook called AFTER matrix multiplication.
 *
 * Records:
 *   - Elapsed time
 */
extern "C" void pirtm_matmul_end(float elapsed_ns, uint32_t op_id) {
    current_op.operation_id = op_id;
    current_op.timestamp_ns = static_cast<uint64_t>(elapsed_ns);
    
    // Optional: log to stderr
    // fprintf(stderr, "[MATMUL_END] op_id=%u, time_ns=%lu\n",
    //         op_id, current_op.timestamp_ns);
}

/**
 * Tracing hook for arbitrary operations.
 */
extern "C" void pirtm_trace_op(uint32_t op_id, const char* op_name) {
    // Record trace event
    // fprintf(stderr, "[TRACE] op_id=%u, op_name=%s\n", op_id, op_name);
}

/**
 * Generic profiling start hook.
 */
extern "C" void pirtm_profiling_start(uint32_t trace_id) {
    current_op.operation_id = trace_id;
    activation_enter_time = get_time_ns();
}

/**
 * Generic profiling end hook.
 */
extern "C" void pirtm_profiling_end(uint32_t trace_id) {
    if (activation_enter_time > 0) {
        uint64_t elapsed_ns = get_time_ns() - activation_enter_time;
        // fprintf(stderr, "[PROFILE_END] trace_id=%u, elapsed_ns=%lu\n", trace_id, elapsed_ns);
    }
}

// ============================================================================
// No-op versions (if hooks not needed for performance)
// ============================================================================

/**
 * Compile with -DPIRTM_NO_HOOKS to use empty hook implementations.
 */
#ifdef PIRTM_NO_HOOKS

extern "C" void pirtm_activation_enter_noop(float* x, size_t size, uint32_t op_id) {}
extern "C" void pirtm_activation_exit_noop(float* x, size_t size, uint32_t op_id) {}
extern "C" void pirtm_matmul_start_noop(size_t N, uint32_t op_id) {}
extern "C" void pirtm_matmul_end_noop(float elapsed_ns, uint32_t op_id) {}
extern "C" void pirtm_trace_op_noop(uint32_t op_id, const char* op_name) {}
extern "C" void pirtm_profiling_start_noop(uint32_t trace_id) {}
extern "C" void pirtm_profiling_end_noop(uint32_t trace_id) {}

#endif  // PIRTM_NO_HOOKS
