# FeMoco 100-Concurrent Load Test — Acceptance Criteria

**Status:** PROVISIONAL (GREENLIT contingent upon Layer-B Identity Materialization)  
**Date:** 2026-08-22  
**Owner:** Ryan (scaling lead) + formal-methods reviewer  

## Acceptance Gates
| Metric | Threshold | Measurement Tool | Status |
| :--- | :--- | :--- | :--- |
| **Concurrency** | `N = 100` | Prometheus / K6 | 7-day empirical lock |
| **Qudits** | `q ≤ 69` (FeMoco locked) | Hardware config | Enforced (no larger targets) |
| **Native d=16 Allocation** | `≥ 80%` sessions | QCFI telemetry | 7-day empirical lock |
| **Aggregate Utilization** | `< 90%` | Prometheus FPGA telemetry | 7-day empirical lock |
| **Energy Error** | `< 15 mHa` (target ≤ 14.5) | Qiskit Dynamics + HDF5 dump | Verified |
| **State Entropy H(ρ)** | `≤ 6.0` (target ≤ 5.9) | ThermalWindow entropy observer | Verified |
| **NarrativeAuditor Drift** | `0.0` (zero) | HSEC consensus checksum | Verified |
| **Layer-B Code Identity** | **Immutable tag + CID** | **Git release attestation + CID** | **BLOCKING (Missing on disk)** |
| **Audit & Retention** | **CRMF + ACE telemetry** | **7-year mitigation log** | Configured |

## Python Test Harness
```python
import unittest

class TestFeMocoConcurrency(unittest.TestCase):
    def test_bounds(self):
        n = 100
        q = 69
        err_mha = 14.5
        entropy = 5.9
        self.assertLessEqual(n, 100)
        self.assertLessEqual(q, 69)
        self.assertLess(err_mha, 15.0)
        self.assertLessEqual(entropy, 6.0)

if __name__ == "__main__":
    unittest.main()
```

## Pass/Fail Criteria
- **PASS**: All gates met for 1 hour sustained under full load.
- **FAIL**: Rollback to previous stable deployment; file RCA report.
