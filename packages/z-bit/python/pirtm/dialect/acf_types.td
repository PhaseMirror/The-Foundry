#ifndef PIRTM_ACF_TYPES
#define PIRTM_ACF_TYPES

include "mlir/IR/OpBase.td"

// Define the base type for ACF counts, likely a vector of integers or similar.
// This represents counts associated with specific aspects.
def PirtmAcfCountType : MLIR_Type<
    "PIRTM ACF Count Type",
    [TypeHasCanonicalType]
> {
  // Add fields if the type needs to carry data (e.g., prime index, aspect names)
  // For now, keeping it abstract.
}

// Define the !pirtm.acf.aspect operator.
// Represents a single aspect count.
def PirtmAcfAspectOp : SchedulersOp<"pirtm.acf.aspect"> {
  let summary = "Represents an aspectual count.";
  let arguments = (ins "I64":$aspect_id, "I64":$count);
  let results = (outs PirtmAcfCountType:$result);
}

// Define the !pirtm.acf.join operator.
// Represents the join operation (e.g., union or max) on aspect counts.
def PirtmAcfJoinOp : SchedulersOp<"pirtm.acf.join"> {
  let summary = "Computes the join of two ACF count types.";
  let arguments = (ins PirtmAcfCountType:$lhs, PirtmAcfCountType:$rhs);
  let results = (outs PirtmAcfCountType:$result);
}

// Define the !pirtm.acf.meet operator.
// Represents the meet operation (e.g., intersection or min) on aspect counts.
def PirtmAcfMeetOp : SchedulersOp<"pirtm.acf.meet"> {
  let summary = "Computes the meet of two ACF count types.";
  let arguments = (ins PirtmAcfCountType:$lhs, PirtmAcfCountType:$rhs);
  let results = (outs PirtmAcfCountType:$result);
}

// Define the !pirtm.acf.refinement_monotonicity check.
// This operation verifies a key invariant for ACF types.
def PirtmAcfRefinementMonotonicityOp : SchedulersOp<"pirtm.acf.refinement_monotonicity"> {
    let summary = "Checks if refinement is monotonic.";
    let arguments = (ins PirtmAcfCountType:$prev, PirtmAcfCountType:$next);
    let results = (outs "I1" : $result); // boolean result
}

#endif // PIRTM_ACF_TYPES
