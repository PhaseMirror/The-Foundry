"""
PIRTM Transpiler: Compose descriptors to verifiable code.

This module handles lowering PIRTM recurrence loops to various backends:
- MLIR (Phase 2): Compile to mlir-opt for verification
- LLVM (Phase 4): Machine code generation
- Circom (Future): zk-circuit integration

See: ADR-007-mlir-lowering.md
"""

from importlib import import_module

from .mlir_lowering import (
    MLIREmitter,
    MLIRConfig,
    MLIRRoundTripValidator,
    emit_mlir_test_fixture,
)

__all__ = [
    "MLIREmitter",
    "MLIRConfig",
    "MLIRRoundTripValidator",
    "emit_mlir_test_fixture",
    "PirtmCLI",
    "main",
]


def __getattr__(name: str):
    """Import CLI symbols lazily so non-CLI callers avoid optional tool deps."""

    if name in {"PirtmCLI", "main"}:
        cli = import_module(f"{__name__}.cli")
        value = getattr(cli, name)
        globals()[name] = value
        return value
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
