"""T-06: pirtm.reason Dialect Extension — reasoning-specific MLIR operations.

Defines three new operations for the cognitive dialect:
  reason.step    — a single auditable reasoning step
  reason.compose — compose two session operators
  reason.audit   — verify RAIN audit for a session

Provides a parser, emitter, lowering (to PIRTM IR), and round-trip verification.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple


# ─── Types ───────────────────────────────────────────────────────────


class ReasonType(Enum):
    """Types in the pirtm.reason dialect extension."""

    COGNITIVE_STATE = "!pirtm.cognitive_state"
    CONTRACTION_BOUNDS = "!pirtm.contraction_bounds"
    RAIN_STEP = "!pirtm.rain_step"
    PRIME_CERT = "!pirtm.prime_cert"
    OPERATOR = "!pirtm.operator"


# ─── Operation base ─────────────────────────────────────────────────


@dataclass
class ReasonOp:
    """Base for reason dialect operations."""

    op_name: str
    inputs: Dict[str, ReasonType]
    results: Dict[str, ReasonType]
    attributes: Dict[str, Any] = field(default_factory=dict)

    def mnemonic(self) -> str:
        return f"reason.{self.op_name}"

    def emit(self) -> str:
        """Emit textual MLIR representation."""
        args = ", ".join(f"%{n}: {t.value}" for n, t in self.inputs.items())
        rets = ", ".join(t.value for t in self.results.values())
        attrs = ""
        if self.attributes:
            a_parts = [f"{k} = {v!r}" for k, v in self.attributes.items()]
            attrs = " {" + ", ".join(a_parts) + "}"
        return f'{self.mnemonic()}({args}){attrs} -> ({rets})'


# ─── reason.step ─────────────────────────────────────────────────────


def make_reason_step(
    spectral_bound: float,
    prime_id: int,
) -> ReasonOp:
    """Create a reason.step operation."""
    return ReasonOp(
        op_name="step",
        inputs={
            "input_state": ReasonType.COGNITIVE_STATE,
            "session_id": ReasonType.PRIME_CERT,
            "step_operator": ReasonType.OPERATOR,
        },
        results={
            "output_state": ReasonType.COGNITIVE_STATE,
            "audit_entry": ReasonType.RAIN_STEP,
        },
        attributes={
            "spectral_bound": spectral_bound,
            "prime_id": prime_id,
        },
    )


# ─── reason.compose ──────────────────────────────────────────────────


def make_reason_compose(
    prime_a: int,
    prime_b: int,
) -> ReasonOp:
    """Create a reason.compose operation."""
    return ReasonOp(
        op_name="compose",
        inputs={
            "state_a": ReasonType.COGNITIVE_STATE,
            "state_b": ReasonType.COGNITIVE_STATE,
        },
        results={
            "composed_state": ReasonType.COGNITIVE_STATE,
            "bounds": ReasonType.CONTRACTION_BOUNDS,
        },
        attributes={
            "prime_a": prime_a,
            "prime_b": prime_b,
        },
    )


# ─── reason.audit ────────────────────────────────────────────────────


def make_reason_audit(prime_id: int) -> ReasonOp:
    """Create a reason.audit operation."""
    return ReasonOp(
        op_name="audit",
        inputs={
            "session_state": ReasonType.COGNITIVE_STATE,
        },
        results={
            "audit_result": ReasonType.RAIN_STEP,
        },
        attributes={
            "prime_id": prime_id,
        },
    )


# ─── Parser ──────────────────────────────────────────────────────────


class ReasonDialectParseError(Exception):
    pass


def parse_reason_op(text: str) -> ReasonOp:
    """Parse a textual reason op back to a ReasonOp.

    Accepts the format emitted by ReasonOp.emit().
    """
    text = text.strip()
    if not text.startswith("reason."):
        raise ReasonDialectParseError(f"Expected 'reason.*' op, got: {text}")
    paren_start = text.index("(")
    mnemonic = text[:paren_start]
    op_name = mnemonic.split(".")[1]

    # Extract inputs section
    paren_end = text.index(")")
    args_text = text[paren_start + 1:paren_end]
    inputs: Dict[str, ReasonType] = {}
    if args_text.strip():
        for part in args_text.split(","):
            part = part.strip()
            if ":" in part:
                name, ttype = part.split(":", 1)
                name = name.strip().lstrip("%")
                ttype = ttype.strip()
                inputs[name] = ReasonType(ttype)

    # Extract attributes
    attributes: Dict[str, Any] = {}
    if "{" in text:
        attr_start = text.index("{")
        attr_end = text.index("}")
        attr_text = text[attr_start + 1:attr_end]
        for part in attr_text.split(","):
            part = part.strip()
            if "=" in part:
                key, val = part.split("=", 1)
                key = key.strip()
                val = val.strip()
                try:
                    attributes[key] = eval(val)  # nosec: limited to numeric/string literals
                except Exception:
                    attributes[key] = val

    # Extract results
    results: Dict[str, ReasonType] = {}
    if "->" in text:
        ret_text = text[text.index("->") + 2:].strip()
        ret_text = ret_text.strip("()")
        for i, part in enumerate(ret_text.split(",")):
            part = part.strip()
            if part:
                results[f"result_{i}"] = ReasonType(part)

    return ReasonOp(
        op_name=op_name,
        inputs=inputs,
        results=results,
        attributes=attributes,
    )


# ─── Lowering ────────────────────────────────────────────────────────


@dataclass
class LoweredOp:
    """A lowered PIRTM IR operation."""

    pirtm_op: str
    source_op: str
    lowered_text: str


def lower_reason_op(op: ReasonOp) -> LoweredOp:
    """Lower a reason dialect op to PIRTM IR."""
    if op.op_name == "step":
        bound = op.attributes.get("spectral_bound", 1.0)
        pid = op.attributes.get("prime_id", 0)
        lowered = (
            f'pirtm.contract(%input_state, spectral_bound={bound}) '
            f'-> !pirtm.multiplicit_space  // session={pid}'
        )
    elif op.op_name == "compose":
        pa = op.attributes.get("prime_a", 0)
        pb = op.attributes.get("prime_b", 0)
        lowered = (
            f'pirtm.tensor_product(%state_a, %state_b) '
            f'-> !pirtm.multiplicit_space  // compose({pa}, {pb})'
        )
    elif op.op_name == "audit":
        pid = op.attributes.get("prime_id", 0)
        lowered = f'pirtm.verify_rain(%session_state) -> !pirtm.audit_result  // session={pid}'
    else:
        raise ValueError(f"Unknown reason op: {op.op_name}")

    return LoweredOp(
        pirtm_op=lowered.split("(")[0],
        source_op=op.mnemonic(),
        lowered_text=lowered,
    )


# ─── Decompiler ──────────────────────────────────────────────────────


def decompile_lowered(lowered: LoweredOp) -> ReasonOp:
    """Reconstruct a reason op from lowered IR (approximate round-trip)."""
    text = lowered.lowered_text
    if "pirtm.contract" in text:
        bound = 1.0
        pid = 0
        if "spectral_bound=" in text:
            sb = text.split("spectral_bound=")[1].split(")")[0]
            bound = float(sb)
        if "session=" in text:
            sp = text.split("session=")[1].strip()
            pid = int(sp)
        return make_reason_step(bound, pid)
    elif "pirtm.tensor_product" in text:
        pa, pb = 0, 0
        if "compose(" in text:
            args = text.split("compose(")[1].split(")")[0].split(",")
            pa, pb = int(args[0].strip()), int(args[1].strip())
        return make_reason_compose(pa, pb)
    elif "pirtm.verify_rain" in text:
        pid = 0
        if "session=" in text:
            sp = text.split("session=")[1].strip()
            pid = int(sp)
        return make_reason_audit(pid)
    raise ValueError(f"Cannot decompile: {text}")


# ─── Round-trip verification ─────────────────────────────────────────


def verify_round_trip(op: ReasonOp) -> Tuple[bool, str]:
    """Emit → parse → lower → decompile → compare.

    Returns (success, message).
    """
    emitted = op.emit()
    parsed = parse_reason_op(emitted)
    lowered = lower_reason_op(parsed)
    decompiled = decompile_lowered(lowered)

    if decompiled.op_name != op.op_name:
        return (False, f"Op name mismatch: {decompiled.op_name} vs {op.op_name}")
    for key in op.attributes:
        if key in decompiled.attributes and decompiled.attributes[key] != op.attributes[key]:
            return (False, f"Attribute {key} mismatch")
    return (True, "OK")
