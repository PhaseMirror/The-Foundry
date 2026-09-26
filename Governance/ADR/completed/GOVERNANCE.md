# Substrates Governance Ledger

## 1. Immutable Anchors (ADR Governance)
The following manifest is the binding source of truth for all ADR-based governance in Substrates.

| Manifest Path | Status |
| :--- | :--- |
| `docs/adr/ADR-001-Combined-Mandate.md` | **BOUND** |
| `docs/adr/ADR-013-F1-Square-Signature-Check.md` | **BOUND** |
| `docs/adr/ADR-043-Combined-Sedona-Spine-Phase-Mirror-Mandate.md` | **BOUND** |

## 2. F1-Square Prime Track Governance
The F1-Square Prime production track is governed by its own ADR suite under `lean/F1_SQUARE/Prime/docs/adr/`.

| ADR | Title | Status |
| :--- | :--- | :--- |
| ADR-100 | F1-Square Conditional Proof Scaffold | **Accepted** |
| ADR-101 | Characteristic-1 Substrate Foundation | **Accepted** |
| ADR-102 | Missing Object Formalization | **Accepted** |
| ADR-103 | T3 Intersection Harness | **Accepted** |
| ADR-104 | Weil Explicit Formula Docking | **Accepted** |
| ADR-105 | Li Face Bright Line | **Accepted** |
| ADR-106 | Sovereign Stack | **Accepted** |
| ADR-107 | MT Central Tension Integration | **Proposed** |
| ADR-108 | Defensive Publication | **Accepted** |
| ADR-109 | F1-Surface Defensive Publication | **Accepted** |
| ADR-400 | Spectral Gap | **Accepted** |

## 3. Human-on-Exception (HoE) Triggers
- **Status**: **ACTIVE**
- **Trigger**: Any ADR boundary violation, axiom-cleanliness failure, or unauthorized unconditional claim on RH.
- **Protocol**: Halt all surface probes; escalate to ADR-100 conditional scaffold; run `scripts/honesty_audit.sh`.

## 4. Honesty Audit Gate
- **Audit Script**: `lean/scripts/honesty_audit.sh`
- **Axiom Audit**: `lean/scripts/audit_axioms.lean`
- **Last Audit Pass**: 2026-06-24T18:30:00-04:00
- **Coverage Delta**: 2806 theorems audited (previously 2803, +3)
- **Invariant**: Zero `sorry`, zero `native_decide`, zero stray axioms outside `{propext, Quot.sound}`.
- **Whitelist**: `F1Square_implies_RH` (the governing conditional axiom, surface axioms are open content).
- **Coverage**: All non-private proof-layer theorems must be `#print axioms`-ed in `audit_axioms.lean` (self-enforcing).
- **Smuggling Check**: Gate-A pairing (`gramOf` / `atlasPair`) must be λ-free (no spectral diagonal baked into the Geo pairing).
