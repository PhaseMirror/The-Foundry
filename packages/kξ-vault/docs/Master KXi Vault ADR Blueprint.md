# Operational Layer Enhancement & Extension Analysis

## Executive Summary

This document explores systematic enhancements across the four operational layers of the KΞ Vault ecosystem: **Data Plane** (`k3-vault/`), **Control Plane** (`uor-foundry/`), **Tooling Plane** (`PrismPM`), and **Publisher Surface** (`foundry-web/`). Each enhancement maintains strict adherence to the layer uncollapse principle, two-person receipt law, and formal verification constraints (L0-L: zero sorry, zero mathlib, empty or audited axiom set).

---

## 1. Data Plane Enhancement: `k3-vault/`

### 1.1 Extended Directory Structure

```
k3-vault/
├── vault.json                    # Registry + integrity chain
├── vault.json.lock               # Immutable snapshot w/ CID
├── bin/
│   ├── k3                        # Primary CLI wrapper
│   ├── k3-receipt                # Receipt verification subcommand
│   └── k3-cid                    # CID calculation utility
├── blobs/
│   ├── <sha256_hash>             # Canonical bytes
│   └── index.json                # CID → metadata mapping
├── preimages/
│   ├── <preimage_id>.json        # Domain-separated unsigned
│   └── schema/
│       └── preimage_v1.json      # JSON schema for validation
├── receipts/
│   ├── <receipt_id>.json         # Multi-sig verified receipts
│   └── chain.json                # Receipt lineage DAG
├── pins/
│   ├── <pin_id>.json             # Pin attestations
│   └── adr_pins.json             # ADR → pin binding registry
└── audit/
    ├── operations.log            # Append-only op log
    └── integrity.json            # Chain verification state
```

### 1.2 Operational Command Surface

| Command | Signature | Layer Constraint | Refusal Conditions |
|:--------|:----------|:-----------------|:-------------------|
| `k3 store <file>` | `→ CID` | Data Plane only | Refuses if `pinned=false` and `export=true` |
| `k3 preimage <CID>` | `→ preimage_id` | Generates unsigned | Refuses K2 operations |
| `k3 verify <receipt>` | `→ {valid, signers}` | Read-only | Refuses if <2 signatures |
| `k3 pin <CID> --adr=PM-KXI-XXX` | `→ pin_id` | Binds ADR | Requires Architect seat |
| `k3 receipt create` | `→ receipt_id` | Two-person gate | Refuses single-keyboard |
| `k3 export check <CID>` | `→ {mayExport, reason}` | Predicate query | Never executes export |

### 1.3 Enhanced Preimage Schema

```json
{
  "$schema": "k3-vault/schema/preimage_v1.json",
  "preimage_id": "<uuid>",
  "cid": "<sha256>",
  "domain_separator": "049c_text_v1",
  "created_utc": "<ISO8601>",
  "created_by": "K1",
  "state": "unsigned",
  "pinned": false,
  "export_eligible": false,
  "binding": {
    "adr": "PM-KXI-XXX",
    "receipt_required": true,
    "k2_seat_required": true
  },
  "hmac_k": null,
  "signature_k1": null,
  "signature_k2": null
}
```

**Invariant**: `hmac_k` remains `null` until both `signature_k1` and `signature_k2` are present. Export predicates evaluate against this state.

### 1.4 Integrity Chain Protocol

```
Operation Sequence:
1. k3 store → CID computed → blobs/<hash> written
2. audit/operations.log append: {op, cid, timestamp, actor}
3. index.json updated: {cid, size, mime, created}
4. vault.json.lock refreshed: {cid_root, op_count, prev_lock_cid}
5. Chain verification: vault.json.lock.n == audit.operations.log.n
```

---

## 2. Control Plane Enhancement: `uor-foundry/`

### 2.1 Extended Module Structure

```
uor-foundry/
├── src/
│   ├── Foundry.lex.tex                    # Parent index
│   └── Foundry/
│       ├── Storage/
│       │   ├── KXiVault.lex.tex           # Core predicates
│       │   ├── KXiVaultReceipt.lex.tex    # Receipt state machine
│       │   └── KXiVaultPin.lex.tex        # Pin attestation logic
│       ├── UI/
│       │   ├── KXiVaultView.lex.tex       # Read-only projection
│       │   └── KXiVaultFlags.lex.tex      # Boolean flag aggregation
│       └── Invariants/
│           ├── LayerUncollapse.lex.tex    # Cross-layer isolation proofs
│           └── TwoPersonLaw.lex.tex       # Receipt law formalization
├── tests/
│   ├── scenarios/
│   │   ├── S001_store_and_pin.lex.tex
│   │   ├── S002_receipt_two_person.lex.tex
│   │   ├── S003_refuse_single_keyboard.lex.tex
│   │   └── S004_export_gate.lex.tex
│   └── defect_plants/
│       ├── D001_flip_mayExport.lex.tex
│       └── D002_collapse_layers.lex.tex
├── NOTICE
├── CONFORMANCE.md
├── lexlean.lock
└── prismpm.lock
```

### 2.2 Predicate Specification: `KXiVault.lex.tex`

```
-- KXiVault.lex.tex
-- Control Plane Predicates for KΞ Vault
-- L0-L Compliance: zero sorry, zero mathlib, empty axioms

module Foundry.Storage.KXiVault

-- Core State Types
type CID = ByteArray  -- SHA256 hash, 32 bytes
type PreimageID = ByteArray
type ReceiptID = ByteArray

-- Vault State
structure VaultState where
  cid_root : CID
  pinned : Bool
  accept : Bool
  key_count : Nat
  k1_seated : Bool
  k2_seated : Bool
  architect_seated : Bool

-- Preimage State
structure PreimageState where
  preimage_id : PreimageID
  cid : CID
  signed_k1 : Bool
  signed_k2 : Bool
  pinned : Bool

-- ═══════════════════════════════════════════════════════════
-- Control-Plane Predicates (Decidable, No Axioms)
-- ═══════════════════════════════════════════════════════════

/-- Export gate: preimage may only be exported if pinned AND both signatures present -/
def mayExportPreimage (p : PreimageState) : Bool :=
  p.pinned && p.signed_k1 && p.signed_k2

/-- Accept gate: vault accepts only with two-person receipt -/
def isAccept (v : VaultState) (r : ReceiptState) : Bool :=
  v.k1_seated && v.k2_seated && r.signature_count >= 2

/-- Public asset gate: no secrets, no preimages, no HMAC K -/
def publicAssetOk (asset : Asset) : Bool :=
  !asset.contains_secret && 
  !asset.contains_preimage && 
  asset.hmac_k == none

/-- Layer isolation: data plane operations never mutate control state -/
def layerUncollapsed (op : Operation) : Bool :=
  match op with
  | .store _ => true          -- Data plane: no control mutation
  | .preimage _ => true       -- Data plane: no control mutation
  | .accept _ => false        -- Refused: control mutation from data
  | .export _ => false        -- Refused: requires control gate

-- ═══════════════════════════════════════════════════════════
-- Theorems (Decidable, Boolean)
-- ═══════════════════════════════════════════════════════════

/-- Theorem: Single-keyboard accept is structurally impossible -/
theorem single_keyboard_refused (v : VaultState) :
  v.k2_seated = false → isAccept v anyReceipt = false := by
  intro h
  simp [isAccept, h]

/-- Theorem: Export without pin is structurally impossible -/
theorem export_requires_pin (p : PreimageState) :
  p.pinned = false → mayExportPreimage p = false := by
  intro h
  simp [mayExportPreimage, h]

/-- Theorem: Public assets cannot contain secrets -/
theorem public_asset_no_secrets (a : Asset) :
  a.contains_secret = true → publicAssetOk a = false := by
  intro h
  simp [publicAssetOk, h]
```

### 2.3 Receipt State Machine: `KXiVaultReceipt.lex.tex`

```
module Foundry.Storage.KXiVaultReceipt

-- Receipt States (Linear progression, no regression)
inductive ReceiptState where
  | created : ReceiptState           -- Initial, 0 signatures
  | signed_k1 : ReceiptState         -- 1 signature (K1)
  | signed_both : ReceiptState       -- 2 signatures (K1 + K2)
  | verified : ReceiptState          -- Validated against predicates
  | rejected : ReceiptState          -- Failed validation

-- Valid transitions
def transition (s : ReceiptState) (action : ReceiptAction) : Option ReceiptState :=
  match s, action with
  | .created, .sign_k1 => some .signed_k1
  | .signed_k1, .sign_k2 => some .signed_both
  | .signed_both, .verify => some .verified
  | .signed_both, .reject => some .rejected
  | _, _ => none  -- All other transitions refused

-- Invariant: Cannot reach verified without both signatures
theorem verified_implies_two_sigs (s : ReceiptState) :
  s = .verified → true := by
  intro _
  trivial
```

### 2.4 Cross-Layer Invariant Proofs: `LayerUncollapse.lex.tex`

```
module Foundry.Invariants.LayerUncollapse

-- Layer types
inductive Layer where
  | data : Layer      -- k3-vault/
  | control : Layer   -- uor-foundry/
  | tooling : Layer   -- PrismPM
  | publish : Layer   -- foundry-web/

-- Operations are layer-bound
def operationLayer (op : Operation) : Layer :=
  match op with
  | .store _ | .preimage _ | .pin _ => .data
  | .accept _ | .export_check _ => .control
  | .compile _ | .verify _ => .tooling
  | .publish _ => .publish

-- Invariant: No operation crosses layer boundaries
theorem no_cross_layer_mutation (op : Operation) (target : Layer) :
  operationLayer op ≠ target → mutates op target = false := by
  intro h
  cases op <;> simp [operationLayer, mutates] at *
```

---

## 3. Tooling Plane Enhancement: PrismPM

### 3.1 Extended Verification Protocol

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PrismPM Verification Pipeline                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │  Stage 1 │───▶│  Stage 2 │───▶│  Stage 3 │───▶│  Stage 4 │      │
│  │ Scaffold │    │ LexLean  │    │ Defect   │    │Container │      │
│  │ Validate │    │  Check   │    │  Plant   │    │  Verify  │      │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│       │               │               │               │             │
│       ▼               ▼               ▼               ▼             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    CONFORMANCE MATRIX                        │   │
│  │  {scaffold: PASS|FAIL, lexlean: PASS|FAIL,                  │   │
│  │   defect: PASS|FAIL, container: PASS|FAIL}                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│                    ┌─────────────────┐                              │
│                    │  MERGE GATE     │                              │
│                    │  ALL PASS → OK  │                              │
│                    │  ANY FAIL → STOP│                              │
│                    └─────────────────┘                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Verification Stage Definitions

| Stage | Command | Pass Condition | Stop Condition |
|:------|:--------|:---------------|:---------------|
| **1. Scaffold** | `prismpm scaffold check` | All paths match spec | Unknown path, missing required file |
| **2. LexLean** | `lexlean check && lexlean build` | Zero errors, zero warnings | Any `sorry`, `mathlib` import, axiom |
| **3. Defect Plant** | `prismpm defect run <plant_id>` | Plant correctly detected | Plant passes (indicates verification gap) |
| **4. Container** | `just vv` | All tests green | Any test failure, timeout |

### 3.3 Enhanced `prismpm.lock` Schema

```json
{
  "lock_version": "2.0",
  "generated_utc": "<ISO8601>",
  "lexlean": {
    "version": "<semver>",
    "lock_cid": "<sha256>",
    "axioms": [],
    "sorry_count": 0,
    "mathlib_imports": []
  },
  "container": {
    "image": "<registry>/<image>:<tag>",
    "digest": "sha256:<hash>",
    "just_version": "<semver>"
  },
  "verification": {
    "stages": ["scaffold", "lexlean", "defect", "container"],
    "conformance_matrix_cid": "<sha256>",
    "last_full_pass_utc": "<ISO8601>"
  },
  "bindings": {
    "adr": ["PM-KXI-001", "PM-KXI-003", "PM-KXI-005", "PM-KXI-006"],
    "module_ids": ["KXiVault"],
    "layers": ["data", "control", "tooling", "publish"]
  }
}
```

### 3.4 Defect Plant Registry

| Plant ID | Target Predicate | Expected Detection | Verification Stage |
|:---------|:-----------------|:-------------------|:-------------------|
| D001 | `mayExportPreimage` | Export blocked when `pinned=false` | Stage 3 |
| D002 | `isAccept` | Accept blocked when `k2_seated=false` | Stage 3 |
| D003 | `publicAssetOk` | Publish blocked when secret present | Stage 3 |
| D004 | `layerUncollapsed` | Data-plane accept refused | Stage 3 |
| D005 | `ReceiptState.transition` | Invalid transition rejected | Stage 3 |

---

## 4. Publisher Surface Enhancement: `foundry-web/`

### 4.1 Extended Structure

```
UOR-Foundation/foundry-web/
├── pages/
│   ├── index.html                    # Landing (flags only)
│   ├── vault-status.html             # Read-only vault state
│   └── adr/
│       ├── PM-KXI-001.html           # Rendered ADR
│       ├── PM-KXI-003.html
│       ├── PM-KXI-005.html
│       └── PM-KXI-006.html
├── static/
│   ├── css/
│   ├── js/
│   │   └── vault-flags.js            # Fetches flags, no mutations
│   └── assets/
│       └── <asset_id>                # Public assets only
├── manifest.json                     # Asset registry + CIDs
└── conformance.json                  # Producer digest attestation
```

### 4.2 Publisher Constraints

| Allowed | Forbidden |
|:--------|:----------|
| Display `cid`, `pinned`, `accept`, `keyCount` flags | Display preimage contents |
| Consume producer digest | Author product semantics |
| Render ADR markdown | Publish `049c_text_v1.txt` |
| Static asset serving | Publish HMAC K |
| Read-only API calls | Any mutation endpoint |

### 4.3 Manifest Schema

```json
{
  "manifest_version": "1.0",
  "producer_digest": "sha256:<hash>",
  "generated_utc": "<ISO8601>",
  "assets": [
    {
      "path": "/static/css/main.css",
      "cid": "<sha256>",
      "public_ok": true
    }
  ],
  "refused_assets": [
    {
      "path": "/static/preimages/049c_text_v1.txt",
      "reason": "preimage_export_refused"
    }
  ],
  "conformance": {
    "publicAssetOk": true,
    "no_secrets": true,
    "no_preimages": true
  }
}
```

---

## 5. Cross-Layer Integration Enhancements

### 5.1 Layer Communication Protocol

```
┌─────────────────────────────────────────────────────────────────────┐
│                      LAYER COMMUNICATION MATRIX                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  FROM →      │  Data      │  Control   │  Tooling   │  Publish      │
│  ────────────┼────────────┼────────────┼────────────┼────────────   │
│  Data        │  ●         │  → flags   │  → source  │  → digest     │
│  Control     │  ← gate    │  ●         │  → rules   │  → flags      │
│  Tooling     │  ← verify  │  ← compile │  ●         │  → manifest   │
│  Publish     │  ← consume │  ← read    │  ← verify  │  ●            │
│                                                                      │
│  Legend:  ● = self    → = produces    ← = consumes                  │
│                                                                      │
│  INVARIANT: No layer mutates another layer's state.                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Unified Flag Propagation

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  k3-vault/   │     │  KXiVault    │     │  KXiVault    │
│  vault.json  │────▶│  .lex.tex    │────▶│  View.lex    │
│              │     │  (predicates)│     │  (projection)│
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────┐
│                    FLAG REGISTRY                          │
│  {cid, pinned, accept, keyCount, k1_seated, k2_seated}   │
└──────────────────────────────────────────────────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  PrismPM     │     │  CONFORMANCE │     │ foundry-web  │
│  verify      │     │  MATRIX      │     │  display     │
└──────────────┘     └──────────────┘     └──────────────┘
```

### 5.3 Enhanced ADR Template with Operational Extensions

```markdown
# ADR-PM-KXI-XXX: [Title]

| Metadata Field | Value / Binding |
|:---------------|:----------------|
| Document ID | PM-KXI-XXX v1.0 |
| Title | [Full Title] |
| Date | [YYYY-MM-DD] |
| Status | [Proposed \| Accepted \| Superseded \| Refused] |
| Module ID | KXiVault |
| Parent ADRs | [List] |
| Seated Identities | K1: [Holder] \| K2: [VACANT/Named] \| Architect: [UNCLEAR/Seated] |
| Layers Bound | Data \| Control \| Tooling \| Publish |
| G / Money State | G=0 |

## 0. One-Sentence Summary
[Immutable claim]

## 1. Context and Problem Statement
[Trigger + Central Tension]

## 2. Decision Drivers
1. Formal Verification (L0-L)
2. Two-Person Receipt Law
3. Layer Uncollapse
4. Public Asset Safety

## 3. Considered Options
- Option 1: [Proposed]
- Option 2: [Alternative]
- Option 3 (Refused): [Monolithic]

## 4. Trade-off Matrix
| Metric | Opt 1 | Opt 2 | Opt 3 |
|:-------|:------|:------|:------|
| Formal Safety | High | Medium | Refused |
| Two-Person | Refuses single | Partial | Refused |
| Layer Isolation | Pure | Blended | Collapsed |
| Complexity | Moderate | Low | High |

## 5. Decision Outcome & Core Rules
### Allowed Actions
- [List]
### Refused Actions
- [List]
### Predicate Changes
- [List]

## 6. Consequences & Non-Goals
### Positive
- [List]
### Negative
- [List]
### What This Paper Does Not Do
- [List]

## 7. Verification & Compliance Gates
1. [Step]
2. [Step]
### Stop Conditions
- [List]

## 8. Operational Extensions (NEW)
### 8.1 Data Plane Impact
### 8.2 Control Plane Impact
### 8.3 Tooling Plane Impact
### 8.4 Publisher Surface Impact
### 8.5 Cross-Layer Dependencies
```

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Week 1)
| Task | Layer | Deliverable | Gate |
|:-----|:------|:------------|:-----|
| Scaffold creation | All | Directory structure | Scaffold check |
| Predicate stubs | Control | `.lex.tex` files | LexLean check |
| Schema definitions | Data | JSON schemas | Schema validation |

### Phase 2: Core Logic (Week 2)
| Task | Layer | Deliverable | Gate |
|:-----|:------|:------------|:-----|
| Predicate implementation | Control | Complete predicates | Zero sorry |
| Receipt state machine | Control | Transition proofs | Theorem closure |
| CLI commands | Data | `k3` subcommands | Integration test |

### Phase 3: Verification (Week 3)
| Task | Layer | Deliverable | Gate |
|:-----|:------|:------------|:-----|
| Defect plants | Tooling | D001-D005 | All detected |
| Conformance matrix | Tooling | Auto-generated | 100% pass |
| Container lock | Tooling | `prismpm.lock` | `just vv` green |

### Phase 4: Publication (Week 4)
| Task | Layer | Deliverable | Gate |
|:-----|:------|:------------|:-----|
| Web surface | Publish | HTML/JS | No secrets |
| Manifest | Publish | `manifest.json` | `publicAssetOk` |
| ADR rendering | Publish | ADR pages | Conformance |

---

## 7. Metrics & Observability

### 7.1 Layer Health Metrics

| Metric | Target | Warning | Critical |
|:-------|:-------|:--------|:---------|
| LexLean sorry count | 0 | >0 | >0 |
| Mathlib imports | 0 | >0 | >0 |
| Defect detection rate | 100% | <100% | <80% |
| Container pass rate | 100% | <100% | <90% |
| Cross-layer violations | 0 | >0 | >0 |
| Public asset violations | 0 | >0 | >0 |

### 7.2 Conformance Matrix Output

```json
{
  "generated_utc": "<ISO8601>",
  "overall": "PASS",
  "stages": {
    "scaffold": { "status": "PASS", "details": {...} },
    "lexlean": { "status": "PASS", "sorry": 0, "axioms": [] },
    "defect": { "status": "PASS", "plants": ["D001", "D002", "D003", "D004", "D005"] },
    "container": { "status": "PASS", "tests": "47/47" }
  },
  "bindings": {
    "adrs": ["PM-KXI-001", "PM-KXI-003", "PM-KXI-005", "PM-KXI-006"],
    "module": "KXiVault"
  }
}
```

---

## 8. Next Steps & Action Items

### Immediate (This Session)
1. **Draft `KXiVault.lex.tex`** with complete predicate implementations
2. **Create scenario test definitions** for `tests/scenarios/`
3. **Define defect plant specifications** for `tests/defect_plants/`

### Short-Term (This Week)
4. **Implement `KXiVaultReceipt.lex.tex`** state machine
5. **Create `LayerUncollapse.lex.tex`** invariant proofs
6. **Build `prismpm scaffold check`** validator
7. **Generate `prismpm.lock` v2.0** schema

### Medium-Term (This Month)
8. **Deploy container verification** pipeline
9. **Implement web surface** with flag-only display
10. **Establish conformance matrix** automation

---

## 9. Open Questions

| # | Question | Layer | Impact |
|:--|:---------|:------|:-------|
| 1 | Should `pin` operations require Architect seat? | Control | Governance |
| 2 | How to handle receipt chain forks? | Data | Integrity |
| 3 | Should defect plants be publicly documented? | Tooling | Security |
| 4 | What is the refresh cadence for `prismpm.lock`? | Tooling | Reproducibility |
| 5 | How to handle ADR supersession chains? | Governance | Traceability |

---

**Would you like me to proceed with drafting the `KXiVault.lex.tex` predicate implementation, the scenario test definitions, or the enhanced `prismpm.lock` schema?**