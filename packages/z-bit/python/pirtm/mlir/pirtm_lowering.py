"""
PIRTM Lowering Pass: MLIR → LLVM for custom PIRTM ops

This module implements lowering for custom PIRTM dialect operations:
  - pirtm.sigmoid
  - pirtm.clip
  - pirtm.relu
  - pirtm.tanh

These are mapped to LLVM IR via runtime calls or inlined logic.

Extend as needed for additional custom ops.
"""

from typing import Any


def lower_pirtm_sigmoid(mlir_op: Any) -> str:
    """
    Lower a pirtm.sigmoid operation to LLVM IR (as a runtime call or inline math).
    Args:
        mlir_op: MLIR operation node
    Returns:
        LLVM IR string or call
    """
    # Example: call to runtime function (to be implemented)
    return f"call @pirtm_sigmoid({', '.join(mlir_op.operand_ids)})"


def lower_pirtm_clip(mlir_op: Any) -> str:
    """
    Lower a pirtm.clip operation to LLVM IR (as min/max or runtime call).
    Args:
        mlir_op: MLIR operation node
    Returns:
        LLVM IR string or call
    """
    # Example: pseudo-code for min/max lowering
    return f"call @pirtm_clip({', '.join(mlir_op.operand_ids)}, {mlir_op.attributes.get('bound_low')}, {mlir_op.attributes.get('bound_high')})"


def lower_pirtm_relu(mlir_op: Any) -> str:
    """
    Lower a pirtm.relu operation to LLVM IR.
    """
    return f"call @pirtm_relu({', '.join(mlir_op.operand_ids)})"


def lower_pirtm_tanh(mlir_op: Any) -> str:
    """
    Lower a pirtm.tanh operation to LLVM IR.
    """
    return f"call @pirtm_tanh({', '.join(mlir_op.operand_ids)})"


# Registry for lowering custom ops
CUSTOM_LOWERINGS = {
    "pirtm.sigmoid": lower_pirtm_sigmoid,
    "pirtm.clip": lower_pirtm_clip,
    "pirtm.relu": lower_pirtm_relu,
    "pirtm.tanh": lower_pirtm_tanh,
}

def lower_custom_op(mlir_op: Any) -> str:
    """
    Dispatch lowering for custom PIRTM ops.
    """
    fn = CUSTOM_LOWERINGS.get(mlir_op.op_name)
    if fn is None:
        raise NotImplementedError(f"No lowering for op: {mlir_op.op_name}")
    return fn(mlir_op)
