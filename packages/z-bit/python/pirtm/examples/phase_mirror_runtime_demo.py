#!/usr/bin/env python3
"""PIRTM Runtime Demo for Phase Mirror integration."""

import numpy as np
from pirtm.core.recurrence import step


def run_phase_mirror_runtime_demo() -> None:
    """Run a small stable PIRTM recurrence and print the result."""
    print("--- PIRTM Phase Mirror Runtime Demo ---")

    X0 = np.array([0.1, -0.1], dtype=np.float64)
    Xi = np.eye(2, dtype=np.float64) * 0.2
    Lambda = np.eye(2, dtype=np.float64) * 0.1
    G = np.zeros(2, dtype=np.float64)

    X_t = X0
    for t in range(3):
        X_t, metadata = step(X_t, Xi, Lambda, G, epsilon=0.05)
        print(f"step={t+1} X={X_t.tolist()} margin={metadata['margin']:.4f}")

    print("--- final stable state ---")
    print(X_t)
    print("backend:", metadata["backend"])


if __name__ == "__main__":
    run_phase_mirror_runtime_demo()
