#include "pirtm/dialect/acf_types.h"
#include "pirtm/dialect/pirtm_types.h"
#include "pirtm/dialect/pirtm_ops.h"

#include "mlir/IR/Builders.h"
#include "mlir/IR/Dialect.h"
#include "mlir/IR/OpImplementation.h"
#include "mlir/IR/Types.h"
#include "mlir/Support/LogicalResult.h"
#include "llvm/ADT/Hashing.h"
#include "llvm/ADT/TypeSwitch.h"

using namespace mlir;
using namespace mlir::pirtm;

// Forward declare dialect initialization
void registerPirtmDialect(DialectRegistry &registry);

//===----------------------------------------------------------------------===//
// Pirtm Dialect Definition
//===----------------------------------------------------------------------===//
void PirtmDialect::initialize() {
    addOperations<
        #define GET_OP(name, ident) name,
        #include "pirtm/dialect/pirtm_ops.cpp.inc"
        >();
    addTypes<
        #define GET_TYPE(name, default_keyword) name##Type,
        #include "pirtm/dialect/pirtm_types.cpp.inc"
        >();
    // Add ACF types and ops
    addOperations<
        #define GET_OP(name, ident) name,
        #include "pirtm/dialect/acf_types.cpp.inc"
        >();
    addTypes<
        #define GET_TYPE(name, default_keyword) name##Type,
        #include "pirtm/dialect/acf_types.cpp.inc"
        >();
}

    // Add ACF types and ops
    addOperations<
        #define GET_OP(name, ident) name,
        #include "pirtm/dialect/acf_types.cpp.inc"
        >();
    addTypes<
        #define GET_TYPE(name, default_keyword) name##Type,
        #include "pirtm/dialect/acf_types.cpp.inc"
        >();
}

//===----------------------------------------------------------------------===//
// Dialect Registration
//===----------------------------------------------------------------------===//

void registerPirtmDialect(DialectRegistry &registry) {
    registry.insert<PirtmDialect>();
}
