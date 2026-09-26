#include "pirtm/dialect/acf_types.cpp.inc"
#include "pirtm/dialect/pirtm_types.h"
#include "pirtm/dialect/pirtm_ops.cpp.inc"

#include "mlir/IR/Builders.h"
#include "mlir/IR/Dialect.h"
#include "mlir/IR/OpImplementation.h"
#include "mlir/IR/Types.h"
#include "mlir/Support/LogicalResult.h"
#include "llvm/ADT/Hashing.h"
#include "llvm/ADT/TypeSwitch.h"

using namespace mlir;
using namespace mlir::pirtm;

// === Type Definitions ===

#define GET_TYPED_DEFAULT_1(ty) ty

#define GET_TYPED_DEFAULT_2(ty1, ty2) ty1, ty2

#define GET_TYPED_DEFAULT_3(ty1, ty2, ty3) ty1, ty2, ty3

#define GET_TYPED_DEFAULT_4(ty1, ty2, ty3, ty4) ty1, ty2, ty3, ty4

#define GET_TYPED_DEFAULT_5(ty1, ty2, ty3, ty4, ty5) ty1, ty2, ty3, ty4, ty5

#define GET_TYPED_DEFAULT_6(ty1, ty2, ty3, ty4, ty5, ty6) ty1, ty2, ty3, ty4, ty5, ty6


#define GET_TYPE_ID_DEFS
#include "pirtm/dialect/acf_types.cpp.inc"

#define GET_TYPE_CLAUSES
#include "pirtm/dialect/acf_types.cpp.inc"

// === Operation Definitions ===

#define GET_OP_CLASSES
#include "pirtm/dialect/acf_types.cpp.inc"

// === Utility Functions ===

// Helper to check if a value is a valid prime index (e.of. for ACF aspect IDs)
static bool isValidPrimeIndex(int index) {
    if (index < 2) return false;
    for (int i = 2; i * i <= index; ++i) {
        if (index % i == 0) return false;
    }
    return true;
}

// === Type Implementations ===

// PirtmAcfCountType: Placeholder for a more complex type if needed
// For now, we assume it's a simple opaque type or relies on context.
// If it needs to store data, derive from Type and implement storage/parsing.
// As a basic placeholder, we'll make it an opaque type.
#define GET_TYPE(name, default_keyword) 
    Type name##Type::get(MLIRContext* context) { 
        return Base::get(context); 
    }
#include "pirtm/dialect/acf_types.cpp.inc"


// === Operation Implementations ===

// PirtmAcfAspectOp
OpFoldResult PirtmAcfAspectOp::fold(FoldAdaptor adaptor) {
    // This operation might not be directly foldable at IR level,
    // but its constituent parts could be constant-folded if inputs are constant.
    // For now, we return null to indicate no folding is performed here.
    return {};
}

// PirtmAcfJoinOp
OpFoldResult PirtmAcfJoinOp::fold(FoldAdaptor adaptor) {
    // The join operation logic would go here if it were directly foldable.
    // For example, if inputs are constants, compute the result.
    return {};
}

// PirtmAcfMeetOp
OpFoldResult PirtmAcfMeetOp::fold(FoldAdaptor adaptor) {
    // Similar to join, folding logic would be applied if inputs are constant.
    return {};
}

// PirtmAcfRefinementMonotonicityOp
OpFoldResult PirtmAcfRefinementMonotonicityOp::fold(FoldAdaptor adaptor) {
    // This operation checks an invariant, usually not directly foldable
    // unless inputs are very specific constants.
    // For now, return null.
    return {};
}

// === Dialect Definition ===

#define GET_REGISTER_DIALECT_OPS_1(ty) ty
#include "pirtm/dialect/acf_types.cpp.inc"

void mlir::pirtm::PirtmDialect::initialize() {
    addOperations<
        #define GET_OP(name, ident) 
            name,
        #include "pirtm/dialect/acf_types.cpp.inc"
        >();
    addTypes<
        #define GET_TYPE(name, default_keyword) 
            name##Type,
        #include "pirtm/dialect/acf_types.cpp.inc"
        >();
}
// Dialect registration and initialization would typically go in a separate file.
// This file focuses on the types and ops for the ACF dialect itself.
// You would then include this dialect in your MLIR context.

// Utility function to check if a prime index is valid.
LogicalResult verify(const PirtmAcfAspectOp &op) {
    if (!isValidPrimeIndex(op.getAspectId())) {
        return op.emitOpError("invalid prime index for aspect: ") << op.getAspectId();
    }
    return success();
}

LogicalResult verify(const PirtmAcfJoinOp &op) {
    // Add checks for join compatibility if necessary (e.g., types)
    return success();
}

LogicalResult verify(const PirtmAcfMeetOp &op) {
    // Add checks for meet compatibility if necessary
    return success();
}

LogicalResult verify(const PirtmAcfRefinementMonotonicityOp &op) {
    // Add checks for monotonicity (e.g., types must be compatible for comparison)
    return success();
