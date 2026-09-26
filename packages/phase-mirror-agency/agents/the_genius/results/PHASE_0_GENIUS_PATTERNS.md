# Phase-0 Genius Patterns Report
Date: 2026-05-26 18:05:56Z

## 1. Executive Summary
This report synthesizes telemetry from 4 governed MNIST scenarios to identify emergent 'Genius Types' at the PIRTM substrate level.

## 2. Scenario Comparison Matrix
| Scenario | Min Loss | Max PIRTM Norm | Correlation (L vs N) | Type |
| :--- | :--- | :--- | :--- | :--- |
| MNIST-Baseline | 2.1555 | 4.9686 | 0.1008 | Stochastic / Balanced |
| MNIST-G1-Baseline | 1.8069 | 4.4034 | -0.0677 | Stochastic / Balanced |
| MNIST-G2-ExtendedPrimes | 1.7617 | 4.3191 | 0.0033 | Stochastic / Balanced |
| MNIST-G3-RestrictedGuardian | 1.5868 | 2.7936 | -0.4266 | Exploratory (Safe) |
| MNIST-G4-HighZeta | 1.7061 | 4.4118 | 0.0344 | Stochastic / Balanced |
| MNIST-G5-Autopilot | 1.7623 | 2.7109 | -0.2628 | Stochastic / Balanced |

## 3. Emergent Insights
- **Guardian Impact:** Restricted bounds (MNIST-G3) lead to 'Over-Contracted' shapes with lower norm variance, potentially limiting discovery speed.
- **Primes Extension:** Extended prime sets (MNIST-G2) show richer substrate activation without immediate loss correlation shift.
- **Zeta Influence:** High zeta strength (MNIST-G4) maintains stable 'Balanced' exploration but requires careful monitoring of resonance proximity.

## 4. Stability Indicators
- **Healthy Band:** PIRTM Norms between 2.0 and 5.0 correlate with stable learning.
- **Veto Trigger:** Correlation spikes > 0.6 indicate a need for a Phoenix Reset (ADR-008).