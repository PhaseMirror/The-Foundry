/*
 * test_hooks_compilation.cpp
 *
 * Simple validation that activation_hooks.cpp compiles and links correctly.
 * Tests hook function signatures and basic operation.
 */

#include <cstdio>
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <cassert>
#include <cmath>

// Declare hook functions from activation_hooks.cpp
extern "C" {
    void pirtm_activation_enter(float* x, size_t size, uint32_t op_id);
    void pirtm_activation_exit(float* x, size_t size, uint32_t op_id);
    void pirtm_matmul_start(size_t N, uint32_t op_id);
    void pirtm_matmul_end(float elapsed_ns, uint32_t op_id);
    void pirtm_trace_op(uint32_t op_id, const char* op_name);
    void pirtm_profiling_start(uint32_t trace_id);
    void pirtm_profiling_end(uint32_t trace_id);
}

int main() {
    printf("=== Phase 6A-2: Activation Hooks Compilation Test ===\n\n");
    
    // Test 1: Hook function pointers are valid
    printf("[TEST 1] Hook function pointers...");
    assert(pirtm_activation_enter != nullptr);
    assert(pirtm_activation_exit != nullptr);
    assert(pirtm_matmul_start != nullptr);
    assert(pirtm_matmul_end != nullptr);
    assert(pirtm_trace_op != nullptr);
    assert(pirtm_profiling_start != nullptr);
    assert(pirtm_profiling_end != nullptr);
    printf(" ✓ PASSED\n");
    
    // Test 2: Call activation hooks
    printf("[TEST 2] Call activation_enter...");
    float test_data[10];
    for (int i = 0; i < 10; i++) {
        test_data[i] = 0.5f;
    }
    pirtm_activation_enter(test_data, 10, 1);
    printf(" ✓ PASSED\n");
    
    printf("[TEST 3] Call activation_exit...");
    pirtm_activation_exit(test_data, 10, 1);
    printf(" ✓ PASSED\n");
    
    // Test 3: Call matmul hooks
    printf("[TEST 4] Call matmul_start...");
    pirtm_matmul_start(512, 2);
    printf(" ✓ PASSED\n");
    
    printf("[TEST 5] Call matmul_end...");
    pirtm_matmul_end(1.23f, 2);
    printf(" ✓ PASSED\n");

    // Test 4: Call profiling/tracing hooks
    printf("[TEST 6] Call tracing and generic profiling...");
    pirtm_trace_op(42, "test_operation");
    pirtm_profiling_start(42);
    pirtm_profiling_end(42);
    printf(" ✓ PASSED\n");
    
    // Test 5: Hook can handle larger arrays
    printf("[TEST 7] Handle large array...");
    size_t large_size = 1024 * 1024;
    float* large_data = (float*)malloc(large_size * sizeof(float));
    if (large_data) {
        for (size_t i = 0; i < large_size; i++) {
            large_data[i] = (i % 256) / 256.0f;
        }
        pirtm_activation_enter(large_data, large_size, 100);
        pirtm_activation_exit(large_data, large_size, 100);
        free(large_data);
        printf(" ✓ PASSED\n");
    } else {
        printf(" ⚠ SKIPPED (malloc failed)\n");
    }
    
    printf("\n=== All Hook Compilation Tests PASSED ✅ ===\n");
    return 0;
}
