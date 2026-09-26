// PIRTM Runtime Functions for LLVM Lowering
// Provides C implementations for custom ops: pirtm_sigmoid, pirtm_clip
// Compile and link this with generated LLVM IR.

#include <math.h>
#include <stddef.h>

// Elementwise sigmoid: y[i] = 1 / (1 + exp(-x[i]))
void pirtm_sigmoid(const double* x, double* y, size_t n) {
    for (size_t i = 0; i < n; ++i) {
        y[i] = 1.0 / (1.0 + exp(-x[i]));
    }
}

// Elementwise clip: y[i] = min(max(x[i], bound_low), bound_high)
void pirtm_clip(const double* x, double* y, size_t n, double bound_low, double bound_high) {
    for (size_t i = 0; i < n; ++i) {
        double v = x[i];
        if (v < bound_low) v = bound_low;
        if (v > bound_high) v = bound_high;
        y[i] = v;
    }
}
