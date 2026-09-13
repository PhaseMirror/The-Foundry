//! Founder OS Sovereign MCP — Fail-Closed Cryptographic Gateway
//!
//! A Model Context Protocol (MCP) server that acts as the sole execution
//! gateway for Founder OS workflows. Every state mutation is certified
//! through the following pipeline before any side effect is permitted:
//!
//! 1. **Policy binding** — brand invariants, funnel reachability, PII
//!    boundaries, and proof-of-practice action rules are checked and their
//!    canonical rule set hashed into the envelope (`policy_hash`).
//! 2. **UCC / L0 Constitutional Gate** — the proposed state transition must
//!    be contractive (`L_Phi < 1`) in ℚ under the Universal Closure
//!    Calculator zero-mode model. Non-contractive proposals fail closed.
//! 3. **PWEH lineage** — Prime-Weighted Execution Hash binds each operation
//!    set (order-, type-, and target-sensitive) to the previous state hash.
//! 4. **CRMF sealing** — a BCS-canonicalized envelope is sealed, including
//!    side-effect permissions, a reserved zero-knowledge anchor slot, and a
//!    cross-checkable BCS payload digest.
//! 5. **Append-only event log** — sealed envelopes are persisted to an
//!    append-only, tamper-evident JSON-lines ledger whose chain links are
//!    re-verifiable at any time.
//!
//! The LLM is deliberately demoted to a "replaceable reflex": its output is
//! treated as untrusted input and never touches state directly.

pub mod envelope;
pub mod eventlog;
pub mod policy;
pub mod poseidon;
pub mod protocol;
pub mod pweh;
pub mod registry;
pub mod tools;
pub mod ucc;

/// Human-readable certifier identity reported inside sealed envelopes.
pub const CERTIFIER_VERSION: &str = "founder-os-sovereign-mcp/0.3.0";