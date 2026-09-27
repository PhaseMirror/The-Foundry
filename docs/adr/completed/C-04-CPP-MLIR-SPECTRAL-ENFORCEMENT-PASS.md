# C-04: C++ MLIR Spectral Enforcement Pass Implementation

**Status**: Not started | **Phase**: 2 (Day 30) | **Risk**: 🔴 HIGH (Critical-path blocker)

---

## Objective

Implement a C++ MLIR pass (`spectral_enforcement_pass.cpp`) that runs before LLVM lowering and enforces the spectral radius condition: if `@spectral_radius >= 1 - @epsilon`, the pass emits a diagnostic error and fails. This is the link-time enforcement checkpoint that prevents non-contractive modules from being compiled to executable artifacts.

## Mathematical Anchor

**Spectral Small-Gain Theorem**: The condition $r(\Lambda) < 1 - \varepsilon$ must hold not just at transpile-time (Day 14) but at link-time (Day 30), before LLVM lowering. If a module's gain matrix is modified before lowering, the compiled artifact is unsafe. The C++ pass closes this gap by checking the spectral radius at the exact point MLIR is lowered to LLVM IR.

## Scope

### Current State
- `mlir/verify_contractivity_spec.cc` contains pseudocode spec of what the pass should do.
- No actual C++ `PassWrapper<>` implementation.
- No hook into `mlir-opt` invocation path.
- No TableGen pass definition.

### Deliverables

1. **C++ MLIR pass implementation** (`pirtm_compiler/mlir/spectral_enforcement_pass.cpp`):
   - `PassWrapper<>` that reads module attributes: `@spectral_radius`, `@epsilon`, `@prime_index`.
   - Checks: if spectral_radius ≥ 1 - epsilon, emit diagnostic and set pass failure.
   - Otherwise, pass succeeds and lower continues.
   - Diagnostic message includes module identity (prime_index) and actual spectral radius value.

2. **TableGen pass definition** (in `pirtm.td`):
   - Register pass with MLIR pass infrastructure.
   - Allow `mlir-opt` to discover and invoke it via `pirtm-spectral-enforce`.

3. **Header file** (`pirtm_compiler/mlir/spectral_enforcement_pass.h`):
   - Declare `createSpectralEnforcementPass()` factory function.
   - Document pass semantics.

4. **Build configuration**:
   - CMake or Bazel target to compile pass into plugin or main MLIR tool.
   - Link flag configuration.

5. **Integration test** (`tests/mlir/test_spectral_enforcement_pass.cpp`):
   - MLIR C++ test that creates a module with spectral_radius, runs pass, verifies error.

6. **Documentation**:
   - When the pass runs in the pipeline (before bufferization, after type verification).
   - How to invoke it: `mlir-opt -pass-pipeline='builtin.module(pirtm-spectral-enforce)'`.

### Non-Deliverables
- Do not change ADR-004 or L0 invariants.
- Do not modify type system or verifier (C-02).
- Do not add new operations.

## Acceptance Gate (Day 30 Hard Sub-Blocker)

✅ **Pass Implementation Complete**:
- C++ code compiles without warnings.
- `createSpectralEnforcementPass()` is linkable.

✅ **Boundary Case Tests**:
- `test_spectral_exactly_at_boundary()`: spectral_radius = 1.0 - epsilon (edge case, should fail).
- `test_spectral_just_below_threshold()`: spectral_radius = 1.0 - epsilon - 1e-10 (should pass).
- `test_spectral_well_below_threshold()`: spectral_radius = 0.5 (should pass).

✅ **Error Diagnostic Quality**:
- Diagnostic message includes spectral_radius value: `"error: spectral radius r(Λ) = 0.95, exceeds bound 1 - ε = 0.95 (prime_index=17)"`
- Message is helpful for debugging.
- No cryptic internal state leaks into message.

✅ **Integration with Pipeline**:
- Pass runs before `builtin.module` lowering.
- Pass can be invoked via `mlir-opt --pass-pipeline=...` command line.
- Subsequent lowering passes work if pass succeeds.
- Build fails if pass fails (non-zero exit code).

✅ **Performance**:
- Pass runs in < 10ms on typical modules.

## Implementation Path

### C++ Pass Header (`pirtm_compiler/mlir/spectral_enforcement_pass.h`)

```cpp
#ifndef PIRTM_COMPILER_MLIR_SPECTRAL_ENFORCEMENT_PASS_H
#define PIRTM_COMPILER_MLIR_SPECTRAL_ENFORCEMENT_PASS_H

#include "mlir/Pass/Pass.h"
#include "mlir/IR/DialectRegistry.h"

namespace mlir::pirtm {

/// Create spectral enforcement pass.
/// 
/// This pass reads @spectral_radius and @epsilon attributes from pirtm.module
/// and enforces the condition: spectral_radius < 1 - epsilon.
/// If violated, emits a diagnostic error and fails.
std::unique_ptr<mlir::Pass> createSpectralEnforcementPass();

/// Register the spectral enforcement pass.
void registerSpectralEnforcementPass();

}  // namespace mlir::pirtm

#endif  // PIRTM_COMPILER_MLIR_SPECTRAL_ENFORCEMENT_PASS_H
```

### C++ Pass Implementation (`pirtm_compiler/mlir/spectral_enforcement_pass.cpp`)

```cpp
#include "pirtm_compiler/mlir/spectral_enforcement_pass.h"
#include "pirtm_compiler/mlir/dialect/pirtm_dialect.h"
#include "mlir/IR/Attributes.h"
#include "mlir/IR/Operation.h"
#include "mlir/IR/MLIRContext.h"
#include "mlir/Pass/Pass.h"

namespace mlir::pirtm {

namespace {

/// Spectral Enforcement Pass
/// 
/// Enforces: r(Λ) < 1 - ε at link-time (before LLVM lowering).
/// Mathematical basis: Spectral Small-Gain Theorem.
class SpectralEnforcementPass
    : public mlir::PassWrapper<SpectralEnforcementPass,
                              mlir::OperationPass<mlir::ModuleOp>> {
public:
  StringRef getArgument() const override { return "pirtm-spectral-enforce"; }
  StringRef getDescription() const override {
    return "Enforce spectral radius bound at link-time";
  }
  
  void runOnOperation() override {
    mlir::ModuleOp module = getOperation();
    
    // Visit all pirtm.module ops
    module.walk([&](mlir::Operation *op) {
      if (op->getName().getStringRef() == "pirtm.module") {
        checkSpectralRadius(op);
      }
    });
  }

private:
  void checkSpectralRadius(mlir::Operation *moduleOp) {
    // Extract @spectral_radius attribute
    auto spectralAttr = moduleOp->getAttrOfType<mlir::FloatAttr>("spectral_radius");
    if (!spectralAttr) {
      // No spectral radius attribute; this is a transpile-time module (OK at Day 30)
      return;
    }
    
    double spectralRadius = spectralAttr.getValueAsDouble();
    
    // Extract @epsilon attribute
    auto epsilonAttr = moduleOp->getAttrOfType<mlir::FloatAttr>("epsilon");
    if (!epsilonAttr) {
      moduleOp->emitError() 
          << "spectral radius check requires @epsilon attribute";
      return;
    }
    
    double epsilon = epsilonAttr.getValueAsDouble();
    
    // Extract @prime_index for diagnostic
    auto primeAttr = moduleOp->getAttrOfType<mlir::IntegerAttr>("prime_index");
    int64_t primeIndex = primeAttr ? primeAttr.getValue().getSExtValue() : -1;
    
    double threshold = 1.0 - epsilon;
    
    // Check spectral condition
    if (spectralRadius >= threshold) {
      // Condition violated: emit error and fail pass
      moduleOp->emitError()
          << "spectral radius r(Λ) = " << spectralRadius
          << ", exceeds bound 1 - ε = " << threshold
          << " (prime_index=" << primeIndex << ")";
      signalPassFailure();
    }
  }
};

} // anonymous namespace

std::unique_ptr<mlir::Pass> createSpectralEnforcementPass() {
  return std::make_unique<SpectralEnforcementPass>();
}

void registerSpectralEnforcementPass() {
  mlir::registerPass([]() -> std::unique_ptr<mlir::Pass> {
    return createSpectralEnforcementPass();
  });
}

} // namespace mlir::pirtm
```

### TableGen Pass Definition (in `pirtm.td`)

```tablegen
// Spectral Enforcement Pass
def SpectralEnforcementPass : Pass<"pirtm-spectral-enforce", "ModuleOp"> {
  let summary = "Enforce spectral radius bound at link-time";
  let description = [{
    This pass enforces the spectral small-gain condition: r(Λ) < 1 - ε.
    
    For each pirtm.module, reads @spectral_radius and @epsilon attributes.
    If spectral_radius >= 1 - epsilon, emits a diagnostic error and fails.
    
    This is the Day 30 link-time checkpoint: modules that pass Day 14
    transpile-time verification may still fail here if the gain matrix
    was modified before lowering.
  }];
  let constructor = "mlir::pirtm::createSpectralEnforcementPass()";
}
```

### CMake Build Configuration

```cmake
# In CMakeLists.txt
add_mlir_pass_library(MLIRPirtmSpectralEnforcementPass
  SHARED_LIBRARY
  INSTALL_WITH_MLIRLIB
  LINK_LIBS
  public
  MLIRPass
  MLIRDialect
  MLIRIRTransforms
  MLIRPirtmDialect
)
```

## Test Plan

### C++ Unit Tests (`tests/mlir/test_spectral_enforcement_pass.cpp`)

```cpp
#include <gtest/gtest.h>
#include "mlir/IR/MLIRContext.h"
#include "mlir/IR/Module.h"
#include "mlir/Pass/PassManager.h"
#include "pirtm_compiler/mlir/spectral_enforcement_pass.h"

namespace mlir::pirtm {

class SpectralEnforcementPassTest : public ::testing::Test {
protected:
  MLIRContext context;
};

TEST_F(SpectralEnforcementPassTest, PassValidModule) {
  // MLIR module with valid spectral radius
  auto moduleStr = R"mlir(
    builtin.module {
      pirtm.module {
        @spectral_radius = 0.50 : f64
        @epsilon = 0.05 : f64
        @prime_index = 17 : i64
        %0 = pirtm.clip(%arg0, -1.0, 1.0) : tensor<4x4xf64>
        pirtm.yield %0 : tensor<4x4xf64>
      }
    }
  )mlir";
  
  auto module = mlir::parseSourceString<ModuleOp>(moduleStr, &context);
  PassManager pm(&context);
  pm.addPass(createSpectralEnforcementPass());
  
  LogicalResult result = pm.run(module.get());
  EXPECT_TRUE(succeeded(result)) << "Expected pass to succeed for valid module";
}

TEST_F(SpectralEnforcementPassTest, FailExceedsThreshold) {
  // MLIR module with spectral radius >= 1 - epsilon
  auto moduleStr = R"mlir(
    builtin.module {
      pirtm.module {
        @spectral_radius = 0.95 : f64
        @epsilon = 0.05 : f64
        @prime_index = 17 : i64
        %0 = pirtm.clip(%arg0, -1.0, 1.0) : tensor<4x4xf64>
        pirtm.yield %0 : tensor<4x4xf64>
      }
    }
  )mlir";
  
  auto module = mlir::parseSourceString<ModuleOp>(moduleStr, &context);
  PassManager pm(&context);
  pm.addPass(createSpectralEnforcementPass());
  
  LogicalResult result = pm.run(module.get());
  EXPECT_TRUE(failed(result)) << "Expected pass to fail when spectral_radius >= threshold";
}

TEST_F(SpectralEnforcementPassTest, BoundaryCase) {
  // Spectral radius exactly at threshold: should fail (not strictly < )
  auto moduleStr = R"mlir(
    builtin.module {
      pirtm.module {
        @spectral_radius = 0.95 : f64
        @epsilon = 0.05 : f64
        @prime_index = 17 : i64
        %0 = pirtm.clip(%arg0, -1.0, 1.0) : tensor<4x4xf64>
        pirtm.yield %0 : tensor<4x4xf64>
      }
    }
  )mlir";
  
  auto module = mlir::parseSourceString<ModuleOp>(moduleStr, &context);
  PassManager pm(&context);
  pm.addPass(createSpectralEnforcementPass());
  
  LogicalResult result = pm.run(module.get());
  EXPECT_TRUE(failed(result)) << "Expected fail at boundary (not strictly <)";
}

}  // namespace mlir::pirtm
```

## Integration with Pipeline

The pass should run in the lowering pipeline **before** bufferization:

```bash
mlir-opt input.pirtm.mlir \
  -pass-pipeline='builtin.module(
    pirtm-contractivity-verify,
    pirtm-spectral-enforce,
    linalg-bufferize,
    convert-linalg-to-llvm
  )' \
  -o output.ll
```

## Dependencies

- **Upstream**: C-03 (Day 14 gate must pass first; this pass reads attributes that C-03 verifies).
- **Downstream**: C-05 (Link-time integration into pirtm_link.py).

## Success Criteria

| Criterion | Metric | Target |
| :-- | :-- | :-- |
| **C++ Compilation** | No warnings, no errors | Clean build |
| **Boundary Tests** | Edge cases at spectral_radius = 1 - epsilon | All pass correctly |
| **Error Diagnostics** | Include spectral radius value and prime_index | Clear, helpful |
| **Pipeline Integration** | `mlir-opt` discovers and runs pass | Exit 0 if valid, non-zero if invalid |
| **Performance** | Pass Runtime on typical modules | < 10ms |

---

**Next Step**: Once Day 14 gate (C-03) passes, implement C-04. Build and test in isolation via CMake. Target completion by Week 5–6. Gate Day 30 work on passing C-05 link-time integration.

**Escalation**: If MLIR infrastructure differs from expected (Pass registration, IRBuilder not available, etc.), escalate to core team and document workarounds.

