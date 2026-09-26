# sigma-kernel-rs: Multiplicity Sigma Kernel

High-performance Rust implementation of the Sigma Kernel (L1) and FZS-MK (Functorial Zeno Sheaf with Memory Kernel).

## Features
- **Sigma Bilinear Form**: Canonical inner product $\sigma(x, y) = \sum_{p \in \mathcal{P}} \nu_p(x) \cdot \nu_p(y) \cdot (\log p)^{-1}$.
- **Sigma Norm**: Multiplicity-weighted norm $\|\cdot\|_\sigma$.
- **Memory Kernel (FZSKernel)**: Non-Markovian session governance with log-periodic temporal convolution.
- **Ward Monitor**: authoritative drift detection via KL-divergence residuals.
- **Zeno Projector**: State correction and manifold stability enforcement.

## Verification
```bash
cargo test
```

## Alignment
Aligned with **ADR-0007** and **ADR-MKT-Phase2-SigmaKernel**.
