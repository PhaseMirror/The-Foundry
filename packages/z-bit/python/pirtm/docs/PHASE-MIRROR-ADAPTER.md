# PIRTM Phase Mirror Adapter

This document explains the runtime-first integration surface that Phase Mirror
should rely on first, and separates MLIR dialect compilation from the core
Python runtime API.

## Runtime-first API

Phase Mirror should treat the Python runtime as the authoritative PIRTM interface.
That means:

- `pirtm.core.recurrence.step(...)` is the primary contractive recurrence API.
- `pirtm.core.recurrence.iterate(...)` is the default evaluation path for
  multi-step recurrence trajectories.
- Runtime usage should work with `pip install pirtm` and only requires `numpy`.
- MLIR is an optional optimization track, not a governance requirement.

### Recommended runtime imports

```python
from pirtm.core.recurrence import step, iterate
from pirtm.backend import current_backend
```

### Minimal runtime operations

- `step(X_t, Xi_t, Lambda_t, G_t, epsilon=0.05)`
  - Computes one contractive recurrence step.
  - Returns `(X_next, metadata)`.

- `iterate(X_0, policy, kernel, steps=3)`
  - Evaluates a recurrence trajectory using a `PIRTMPolicy` policy object.
  - Returns a dictionary with `trajectory`, `final_state`, and `metadata`.

## MLIR toolchain track

The MLIR path is intentionally separated from the runtime API.
Phase Mirror should only take the MLIR path when the toolchain is explicitly
requested and available.

The optional compiler API is located in:

```python
from pirtm.transpiler.mlir_lowering import MLIREmitter, MLIRConfig
```

A minimal compile-only workflow looks like:

```python
config = MLIRConfig(epsilon=0.05, confidence=0.9999, prime_index=17)
emitter = MLIREmitter(config=config)
mlir_module = emitter.emit_module(dimension=64)
```

### Key separation

- Runtime API: contractive evaluation, stability analysis, Python-native behavior.
- MLIR API: dialect emission, compile-time verification, optional backend.

Phase Mirror governance should not treat MLIR availability as a hard L0
requirement. MLIR is an optional path for accelerated analysis and audit
visibility.

## Phase Mirror integration guidance

- Default `PIRTM_BACKEND` should be `runtime`.
- If `PIRTM_BACKEND=mlir`, Phase Mirror should attempt an MLIR compile path.
- If MLIR fails or is unavailable, Phase Mirror must fall back to runtime.
- No governance invariant should depend exclusively on MLIR.

## Example runtime usage

```python
from pirtm.core.recurrence import step
import numpy as np

X0 = np.array([0.1, -0.1], dtype=np.float64)
Xi = np.eye(2, dtype=np.float64) * 0.2
Lambda = np.eye(2, dtype=np.float64) * 0.1
G = np.zeros(2, dtype=np.float64)

X1, metadata = step(X0, Xi, Lambda, G)
print("X1:", X1)
print("metadata:", metadata)
```

## Governance note

The Phase Mirror adapter should be designed around the runtime surface first.
MLIR should remain an explicit, experimental extension with graceful fallback
and clear failure modes.
