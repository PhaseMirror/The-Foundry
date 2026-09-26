"""Backward-compatible sigma L0 integration exports.

Historically some callers imported SigmaCompilationPipeline from pirtm.mlir,
while the implementation now lives under pirtm.transpiler.
"""

from pirtm.transpiler.sigma_l0_integration import *  # noqa: F401,F403
