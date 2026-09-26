# Benchmark plan: Fock contraction vs classical limits

## Goal
Compare certified discrete contraction in truncated Fock/PIRTM dynamics against classical dissipative baselines such as drift-diffusion or Fokker-Planck-style semigroup decay.

## Metrics
- Predicted contraction constant `c`
- Empirical max step ratio `max ||T(x)-T(y)|| / ||x-y||`
- Multi-step decay slope from log-distance regression
- Runtime cost as Hilbert/Fock cutoff increases

## Classical baseline
Use a simple discretized Ornstein-Uhlenbeck or linear drift-diffusion update as the classical reference. The comparison is not equation-level identity; it is a decay-rate comparison between certified quantum/Fock contraction and classical dissipative evolution.

## Suggested result table
| Model | State space | Certified constant | Empirical ratio | Decay slope | Runtime |
|---|---|---:|---:|---:|---:|
| PIRTM base | Hilbert | ... | ... | ... | ... |
| PIRTM Fock | Truncated Fock | ... | ... | ... | ... |
| Layer-III resonant | Truncated Fock | ... | ... | ... | ... |
| Classical OU/FP | Grid / state vector | n/a or derived | ... | ... | ... |

## Interpretation
The main question is whether the certified Fock-lifted contraction envelope remains competitive with classical dissipative decay under matched scaling and truncation.
