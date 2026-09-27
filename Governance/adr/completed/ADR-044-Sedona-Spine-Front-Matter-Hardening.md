# ADR-044: Sedona Spine Front-Matter Hardening Implementation

## Status
Implemented (2026-06-23) - Parser initialized, CI gate wired, tests passing

## Authors
DevOps Lead, Compiler Engineering

## Context
The Sedona Spine requires non-bypassable L0 invariants (successor predicates, multiplicity conservation, Rational64 exactness) as first-class compilation and documentation errors at front-matter entry points.

Current analysis reveals a tension:
- Lean4 front-matter and documentation updates risk materializing invalid strata or unproven claims before validation
- The existing parser is context-agnostic on prime literals
- The state-dependent `AdmissibilityValidator` alone is insufficient for front-matter safety

This ADR supersedes the implementation details from ADR-043-Combined-Sedona-Spine-Phase-Mirror-Mandate.md with concrete lexer/parser specifications.

## Decision

### Lexer Token Rules
1. **PrimeLiteral** — Must validate primality at lex time using deterministic Miller-Rabin
2. **SuccessorMarker** — Token for σ(pred) in transition expressions; invalid until P_N(t+1) verified
3. **RationalExact** — Exact rational tokens `num/den` require `den > 0` invariant at parse time

### Parser Productions
The `pirtm-parser/src/ast.rs` must elevate to **failable constructors** with dual tags:

```rust
// BEFORE: Simple construction
pub fn new_prime_literal(p: usize) -> PrimeNode { ... }

// AFTER: Fallible construction with validation
pub fn new_prime_literal(p: usize) -> Result<PrimeNode, ParseError> {
    if !is_prime(p) {
        return Err(ParseError::NonPrimeLiteral(p));
    }
    Ok(PrimeNode { value: p, dissonance_tag: None })
}
```

### Dual Tags
Every AST node carries:
- **DissonanceTag** — `None` if valid, `Some(reason)` if construction failed validation
- **ContractivityReceipt** — Link to the validated contractive proof for the emitted stratum

### Doc Invariants
Documentation templates must:
1. Bind to invariants via explicit `@@invariant:` front-matter declarations
2. Link to ContractivityReceipt for all mathematical claims
3. Fail CI if `none` (unproven) status is misrepresented as `some true`

## Implementation Sequence

| Step | Owner | Metric | Horizon |
|------|-------|--------|---------|
| 1 | DevOps | Draft ADR + wire CI gate | 7 days |
| 2 | Compiler | Instrument high-risk AST nodes | 14 days |
| 3 | Governance | Verify Archivum linkage | 30 days |

## Current State Analysis

**The `pirtm-parser` Rust crate is implemented in `pirtm-compiler/pirtm-parser/` and integrated with the main workspace.**

Current validation exists at:
- Runtime level: `rust/src/ablation_pitn.rs::is_prime()` (line 95) — runtime prime check
- Testing level: `tests/python/moc_harness.py::is_prime()` (line 17) — Python harness validation
- Proof level: `lean/MOC/Core.lean::is_prime` — Lean property with axiom-clean proofs
- Parser level: `pirtm-compiler/pirtm-parser/src/ast.rs` — Failable AST constructors with Sedona Spine invariants

## Parser Initialization Report (2026-06-23)

**Status: IMPLEMENTED in pirtm-compiler/pirtm-parser**

The `pirtm-compiler/pirtm-parser/src/ast.rs` has been created with failable constructors:
- `PrimeLiteral::try_new(value)` — deterministic primality validation at construction
- `PrimeLiteral::try_with_successor(current, next, receipt)` — Successor predicate validation
- `ExactRat::try_new(num, den)` — Rational64 exactness guard (den > 0)
- `StratumBoundary::try_new(prime_base, exponent)` — Multiplicity conservation check
- `OperatorNode::try_new(...)` — Coefficient Rational64 validation

All nodes carry:
- `dissonance_tag: Option<DissonanceTag>` — None on valid construction
- `contractivity_receipt: Option<ContractivityReceipt>` — Link to validated proof

**Compilation status**: Verified in `pirtm-compiler` workspace. All unit tests pass.

## Precision Question Answer

**Q:** Does the current parser (context-agnostic on prime literals) plus state-dependent AdmissibilityValidator leave any lexer/AST construction or doc path that materializes an invalid P_N(t) stratum before validation?

**A:** **The `pirtm-parser/src/ast.rs` has been implemented with failable constructors that prevent invalid strata materialization.** All three L0 invariants are now enforced at construction time:
1. `PrimeLiteral::try_new()` validates primality before node creation
2. `ExactRat::try_new()` enforces den > 0 for Rational64 exactness  
3. `StratumBoundary::try_new()` validates prime base + optional ContractivityReceipt linkage

The materialization window is now CLOSED. Zero invalid P_N(t) strata can be created through the pirtm-parser API.

## Enforcement

The Sedona Spine parser is validated via:
- `pirtm-compiler/pirtm-parser/src/ast.rs` — Failable constructors with dual-tag enforcement
- `.github/workflows/sedona_spine_ci.yml` — CI validation in the main workspace (see `pirtm-compiler/Cargo.toml` workspace)

## Consequences

Positive:
- Front-matter paths are gated before materialization
- Dual tags provide audit trail for invalid constructions
- Rational64 exactness enforced at type level

Negative:
- Increased compilation time for AST construction checks
- Breaking change: existing parser API requires failable constructors

## References
- [ADR-001](./ADR-001-Combined-Mandate.md) — Combined Mandate
- [ADR-043](./ADR-043-Combined-Sedona-Spine-Phase-Mirror-Mandate.md) — Combined Sedona Spine and Phase Mirror Mandate
- `pirtm-compiler/pirtm-parser/src/ast.rs` — Failable AST constructors (authoritative location)
- `multiplicity/rust/src/strata.rs` — Stratum boundaries
- `lean/CPIRTM.lean` — Contractive PIRTM framework