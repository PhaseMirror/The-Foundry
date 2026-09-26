# ADR 4: Formalizing Triple-Lock Verification (Replacing Dummy Logic)

## Context
The current Triple-Lock verification mechanism in `server.ts` checks for semantic violations by simply matching the strings `public`, `drop table`, and `execute`. This relies on a **Hidden Assumption** that the context of all plans is strictly SQL-based and that these three keywords adequately represent all adversarial or non-compliant intent. Furthermore, `server.ts` references non-existent policies `ADR-005` and `ADR-006` in its invariant validation logic. 

**Contradiction:** The system boasts a robust "Triple-Lock" architecture (Genius, Guardian, Examiner) but defaults to an overly simplistic string-matching simulation that passes trivially (`permission_bits: 15 & 3 === 3`).

## Decision
We will upgrade the Triple-Lock verification simulation to a generalized Phase Mirror state-machine:
1. **Semantic Context Awareness:** The verification logic must identify the *domain* of the plan (e.g., UI code, system command, or SQL) before applying violation heuristics.
2. **True Sub-Agents:** The Genius, Guardian, and Examiner phases will be implemented as distinct reasoning passes rather than relying on a monolithic simulation block.
3. **Formalize Missing ADRs:** The invariant rules referenced as `ADR-005` (Critical Schema Violation) and `ADR-006` (Compliance Policy Version) will be migrated into this ADR to serve as the unified source of truth for governance rules.

## Consequences
- The string-matching logic in `simulateTripleLockVerify` will be replaced with an AST parser or a more sophisticated prompt-based local check.
- The `permission_bits` system will be strictly documented so `15 & 3` isn't used as an automatic bypass.
