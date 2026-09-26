# C-09: pirtm.sigmoid MLIR Lowering (TableGen Pattern or C++)

**Status**: Not started | **Phase**: 3 (Day 90) | **Risk**: 🟡 HIGH (Architectural decision point)

---

## Objective

Implement lowering for the custom `pirtm.sigmoid` operation from MLIR to optimized machine code (via LLVM IR or C++ runtime). This is the highest-risk item for Day 90 because sigmoid is the only custom operation without a standard MLIR dialect lowering. Two paths: **(Path A)** TableGen lowering pattern (preserves pure MLIR compile path) or **(Path B)** C++ runtime sigmoid (faster, less architectural purity). The choice determines whether Day 90 achieves the 10× target and influences post-Day-90 optimization roadmap.

## Mathematical Anchor

The sigmoid function $\sigma(x) = \frac{1}{1 + e^{-x}}$ is $\frac{1}{4}$-Lipschitz and is the nonlinear activation in the recurrence:

$$
X_{t+1} = P(\Xi X_t + \Lambda T(X_t) + G_t), \quad T(x) = \sigma(x)
$$

On a 512-element vector, scalar sigmoid computation is $O(n)$ and must not dominate the total step time. BLAS matmul (C-08) achieves ~0.3 µs. Sigmoid must be ≤ 100 µs total (20% of budget) to hit the 10× target.

Vectorized sigmoid via AVX2 polynomial approximation: ~0.5 ns/element → 256 ns for 512-element vector. This is acceptable.

## Scope

### Current State
- `pirtm.sigmoid` operation is defined in MLIR dialect (`pirtm.td`).
- No lowering pattern; operation falls through to scalar interpreted path (slow).
- Estimated scalar sigmoid: ~10 ns/element → 5 µs for 512-element (too slow, eats BLAS gains).

### Two Implementation Paths

#### **Path A: TableGen Lowering Pattern (Preferred)**

Implement a `ConversionPattern` that lowers `pirtm.sigmoid(%arg)` to a vectorized lowering:
```mlir
%exp_neg = math.exp(arith.negf %arg)
%one = arith.constant 1.0 : f64
%denom = arith.addf %one, %exp_neg
%result = arith.divf %one, %denom
```

Vectorized via `vector.contract` or tiled `linalg.matvec` patterns.

**Advantages**: Pure MLIR, formally verified, future-proof for optimization.
**Disadvantages**: More complex TableGen, requires MLIR lowering infrastructure expertise, ~1–2 weeks.

#### **Path B: C++ Runtime Sigmoid (Fallback)**

Implement sigmoid in `libpirtm_runtime.cpp` as a helper function; bypass MLIR for this op:
```cpp
void sigmoid_inplace(double* vec, size_t dim) {
    for (size_t i = 0; i < dim; ++i) {
        vec[i] = 1.0 / (1.0 + std::exp(-vec[i]));
    }
}
```

Call from `step()` after matmul.

**Advantages**: Simple, ~2–3 days, guaranteed performance via AVX2 optimization.
**Disadvantages**: Breaks pure MLIR abstraction, less future-proof, but acceptable fallback.

### Deliverables (Choose Path A or B by Week 9)

**Both paths require:**

1. **Sigmoid implementation**:
   - Path A: TableGen lowering pattern in `pirtm.td` + C++ `ConversionPattern` class.
   - Path B: C++ helper function with AVX2 optimizations (or fast polynomial approximation).

2. **Numerical correctness**:
   - Output matches IEEE 754 sigmoid (error ≤ 2^-23 ULP).
   - Test against standard library `1.0 / (1.0 + exp(-x))`.

3. **Vectorized implementation** (both paths):
   - For Path A: LLVM IR emit should include `vector.contract` or `linalg` pass vectorization.
   - For Path B: Use AVX2 `_mm256` intrinsics or compiler vectorization.

4. **Integration into `step()`**:
   - Path A: MLIR emits sigmoid lowering inline into matmul chain.
   - Path B: Call `sigmoid_inplace()` after `cblas_dgemv()`.

5. **Latency measurement**:
   - Sigmoid on 512-dim vector ≤ 100 µs (20% of ~0.5 µs/step budget).
   - Verify vectorization actually occurs (benchmark, examine generated assembly).

6. **Test cases**:
   - Boundary values: sigmoid(-∞) ≈ 0, sigmoid(0) = 0.5, sigmoid(+∞) ≈ 1.
   - Random vectors; output matches reference.
   - Integrates with full `step()` without performance regression.

### Non-Deliverables
- Do not change the sigmoid function definition.
- Do not add new activation functions.
- Do not modify MLIR dialect beyond lowering patterns (for Path A).

## Acceptance Gate (Day 90 Performance Sub-Requirement)

✅ **Path Decision Made** (by Week 9):
- Path A (TableGen) selected if infrastructure confidence is high.
- Path B (C++) selected if Path A shows unforeseen gaps.
- Decision documented in ADR with rationale.

✅ **Implementation Complete** (both paths):
- Code compiles without warnings.
- All unit tests pass.
- Numerical accuracy: error vs. standard sigmoid ≤ 2^-23 ULP.

✅ **Vectorization Confirmed**:
- For Path A: MLIR lowers to vector instructions (confirmed via `llvm-objdump`).
- For Path B: Compiler generates AVX2 instructions (or explicit `_mm256` intrinsics used).

✅ **Performance Target**:
- Sigmoid on 512-dim ≤ 100 µs.
- Full `step()` time: 0.3 µs (matmul) + smaller sigmoid + clip = **≤ 0.5 µs total** (10× NumPy).

✅ **Integration Test**:
- Full `step()` with all components (matmul + sigmoid + clip) runs end-to-end.
- Output matches reference (expected behavior, numerical correctness).

## Implementation Path A: TableGen Lowering

### TableGen Definition (`pirtm.td`)

```tablegen
// Sigmoid lowering pattern
def : Pattern<
  (PIRTM_SigmoidOp $operand),
  (
    // %neg = negf %operand
    (CastToSignless (LLVM_NegOp $operand)),
    // %exp_neg = exp(%neg)
    (LLVM_ExpOp $neg),
    // %one = constant 1.0
    (LLVM_ConstantOp (f64 1.0)),
    // %denom = addf %one, %exp_neg
    (LLVM_AddOp $one, $exp_neg),
    // divf %one, %denom
    (LLVM_DivOp $one, $denom)
  ),
  [(f64 $operand), (f64 $result)]>;
```

### C++ Conversion Pattern (`pirtm_compiler/mlir/sigmoid_lowering.cpp`)

```cpp
#include "mlir/Conversion/LLVMCommon/ConversionTarget.h"
#include "mlir/Conversion/LLVMCommon/VectorPattern.h"
#include "mlir/Dialect/LLVM/IR/LLVMDialect.h"
#include "mlir/Dialect/Math/IR/Math.h"
#include "pirtm_compiler/mlir/dialect/pirtm_dialect.h"

namespace mlir::pirtm {

class SigmoidOpLowering : public ConversionPattern {
public:
  SigmoidOpLowering(MLIRContext *ctx)
      : ConversionPattern(pirtm::SigmoidOp::getOperationName(), 1, ctx) {}
  
  LogicalResult matchAndRewrite(
      Operation *op, ArrayRef<Value> operands,
      ConversionPatternRewriter &rewriter) const override {
    
    auto sigmoidOp = cast<pirtm::SigmoidOp>(op);
    Value input = operands.front();
    Location loc = op->getLoc();
    
    // Build: 1.0 / (1.0 + exp(-input))
    // Step 1: negate input
    auto negInput = rewriter.create<math::NegFOp>(loc, input);
    
    // Step 2: compute exp(-input)
    auto expNegInput = rewriter.create<math::ExpOp>(loc, negInput);
    
    // Step 3: create constant 1.0
    auto constOne = rewriter.create<LLVM::ConstantOp>(
        loc, input.getType(), rewriter.getFloatAttr(
            cast<Float64Type>(input.getType()), 1.0));
    
    // Step 4: add 1.0 + exp(-input)
    auto onePlusExp = rewriter.create<arith::AddFOp>(loc, constOne, expNegInput);
    
    // Step 5: divide 1.0 / (1.0 + exp(-input))
    auto result = rewriter.create<arith::DivFOp>(loc, constOne, onePlusExp);
    
    rewriter.replaceOp(op, result);
    return success();
  }
};

void populateSigmoidLoweringPatterns(RewritePatternSet &patterns) {
  patterns.add<SigmoidOpLowering>(patterns.getContext());
}

} // namespace mlir::pirtm
```

## Implementation Path B: C++ Runtime Sigmoid

### Helper Function (`src/runtime/libpirtm_runtime.cpp`)

```cpp
// Fast vectorized sigmoid using AVX2 (or scalar fallback)
static void sigmoid_inplace(double* vec, size_t dim) {
    #ifdef __AVX2__
    // AVX2 vectorized sigmoid (8 doubles per iteration)
    const __m256d ones = _mm256_set1_pd(1.0);
    const __m256d zeros = _mm256_set1_pd(0.0);
    
    for (size_t i = 0; i + 8 <= dim; i += 8) {
        // Load 8 doubles
        __m256d x = _mm256_loadu_pd(vec + i);
        
        // Compute: 1.0 / (1.0 + exp(-x))
        __m256d neg_x = _mm256_sub_pd(zeros, x);
        __m256d exp_neg_x = _mm256_exp_pd(neg_x);  // Requires sleef or own impl
        __m256d denom = _mm256_add_pd(ones, exp_neg_x);
        __m256d result = _mm256_div_pd(ones, denom);
        
        // Store result
        _mm256_storeu_pd(vec + i, result);
    }
    
    // Scalar remainder
    for (size_t i = (dim / 8) * 8; i < dim; ++i) {
        vec[i] = 1.0 / (1.0 + std::exp(-vec[i]));
    }
    
    #else
    // Scalar fallback
    for (size_t i = 0; i < dim; ++i) {
        vec[i] = 1.0 / (1.0 + std::exp(-vec[i]));
    }
    #endif
}

// Fast polynomial approximation (alternative if exp unavailable)
static void sigmoid_polynomial_inplace(double* vec, size_t dim) {
    // Approximation: sigmoid(x) ≈ 0.5 + 0.125x (for |x| < 2)
    // More accurate: tanh-based rational approximation
    for (size_t i = 0; i < dim; ++i) {
        double x = vec[i];
        if (x > 10.0) {
            vec[i] = 1.0;
        } else if (x < -10.0) {
            vec[i] = 0.0;
        } else {
            vec[i] = 1.0 / (1.0 + std::exp(-x));
        }
    }
}
```

### Integration into `step()`

```cpp
double PirtmState::step() {
#ifdef HAVE_BLAS
    // ... matmul via BLAS ...
    cblas_dgemv(...); // Compute gain_matrix * state_vec → temp_buf
    std::copy(temp_buf, temp_buf + dimension, state_vec);
#else
    // ... matmul via manual loop ...
#endif
    
    // ✅ Path B: Apply sigmoid activation
    sigmoid_inplace(state_vec, dimension);
    
    // Compute L2 norm
    double norm = 0.0;
    for (size_t i = 0; i < dimension; ++i) {
        norm += state_vec[i] * state_vec[i];
    }
    norm = std::sqrt(norm);
    
    // Clip to [-1, 1]
    for (size_t i = 0; i < dimension; ++i) {
        state_vec[i] = std::max(-1.0, std::min(1.0, state_vec[i]));
    }
    
    return norm;
}
```

## Test Plan

### Correctness Test (`tests/runtime/test_sigmoid.cpp`)

```cpp
#include <gtest/gtest.h>
#include <cmath>

// Helper (for Path B, would be exported from libpirtm_runtime.h)
extern void sigmoid_inplace(double* vec, size_t dim);

TEST(Sigmoid, BoundaryValues) {
    double vals[] = {-100.0, -10.0, 0.0, 10.0, 100.0};
    const double expected[] = {0.0, 0.0000454, 0.5, 0.9999546, 1.0};
    
    for (int i = 0; i < 5; ++i) {
        double x = vals[i];
        double sigmoid_x = 1.0 / (1.0 + std::exp(-x));
        EXPECT_NEAR(sigmoid_x, expected[i], 1e-6);
    }
}

TEST(Sigmoid, VectorizedVersion) {
    const size_t DIM = 512;
    double* vec = new double[DIM];
    
    // Fill with range [-5, 5]
    for (size_t i = 0; i < DIM; ++i) {
        vec[i] = -5.0 + 10.0 * (i / (double)DIM);
    }
    
    // Apply sigmoid
    sigmoid_inplace(vec, DIM);
    
    // Verify all values in [0, 1]
    for (size_t i = 0; i < DIM; ++i) {
        EXPECT_GE(vec[i], 0.0) << "Sigmoid at index " << i << " is negative";
        EXPECT_LE(vec[i], 1.0) << "Sigmoid at index " << i << " > 1";
    }
    
    delete[] vec;
}
```

### Latency Benchmark (`tests/runtime/benchmark_sigmoid.cpp`)

```cpp
#include <benchmark/benchmark.h>
#include <cmath>

extern void sigmoid_inplace(double* vec, size_t dim);

static void BenchmarkSigmoid512(benchmark::State& state) {
    double* vec = new double[512];
    
    // Initialize with random values
    for (int i = 0; i < 512; ++i) {
        vec[i] = -5.0 + 10.0 * (i % 100) / 100.0;
    }
    
    for (auto _ : state) {
        sigmoid_inplace(vec, 512);
    }
    
    // Expected: ~0.5–1 µs for 512-dim (with AVX2 vectorization)
    // (Scalar: ~5 µs; too slow)
    
    delete[] vec;
}

BENCHMARK(BenchmarkSigmoid512)->Unit(benchmark::kMicrosecond);
```

## Decision Matrix (Path A vs. Path B)

| Aspect | Path A (TableGen) | Path B (C++) |
| :-- | :-- | :-- |
| **Implementation Time** | 1–2 weeks | 2–3 days |
| **Architectural Purity** | ✅ Full MLIR | ❌ Hybrid (MLIR + C++) |
| **Future Optimization** | ✅ Can optimize at MLIR level | ❌ Limited |
| **Vectorization** | ✅ LLVM backend handles it | ✅ Explicit intrinsics or compiler |
| **Risk** | 🟡 Infrastructure gaps possible | ✅ Low risk, proven technique |
| **Achieves 10× Target?** | ✅ If lowering works | ✅ Likely |

**Recommendation**: Start investigating Path A (TableGen) Week 8–9. If infrastructure gaps emerge or progress stalls, switch to Path B (C++) by Week 9 midpoint. Decision commitment by Week 9 end.

## Dependencies

- **Upstream**: C-07 (hot-path memory), C-08 (BLAS).
- **Downstream**: C-10 (performance testing).

## Success Criteria

| Criterion | Metric | Target |
| :-- | :-- | :-- |
| **Path Decision** | Made by Week 9 | Path A or B documented |
| **Numerical Accuracy** | Error vs. reference sigmoid | ≤ 2^-23 ULP |
| **Vectorization** | Assembly shows vector instructions | ✅ |
| **Latency** | 512-dim sigmoid duration | ≤ 100 µs |
| **Integration** | Works in full `step()` | 10× NumPy achieved |
| **Tests** | All correctness & benchmark pass | 100% pass |

---

**Next Step**: Week 8–9: investigate TableGen sigmoid lowering (Path A). Engage MLIR experts if needed. If progress stalls by mid-Week 9, commit to Path B (C++ runtime). Implement chosen path Week 9–10. Target completion by end of Week 10. Gate performance testing (C-10) on this.

