# Roadmap: The Guardian System Layers

This document outlines the structured development phases for 'the_guardian', evolving it into a fully integrated, verifiable safety companion for 'the_genius'.

## Phase 1: IPC Orchestration (`lambda-ipc`)
**Goal:** Implement a high-performance IPC mechanism to link 'the_genius' and 'the_guardian'.
- **Design:** Use Unix Domain Sockets for low-latency communication.
- **Tasks:**
  - Define a binary protocol for proposal interop.
  - Implement a non-blocking request/response loop.

## Phase 2: Audit & Forensics (`lambda-audit`)
**Goal:** Establish machine-readable audit trails for all safety decisions.
- **Design:** Structured JSON-lines based logging.
- **Tasks:**
  - Create `AuditLog` trait for both services.
  - Implement immutable hashing of audit events (Chain-of-Custody).
  - forensic extraction tools for incident review.

## Phase 3: Advanced Policy Engine (`lambda-policy`)
**Goal:** Build a robust, domain-specific evaluation engine for complex policy sets.
- **Design:** YAML-backed, compiled-policy evaluation.
- **Tasks:**
  - Implement AST for declarative safety rules.
  - Performance optimization (pre-compilation of safety sets).
  - Hot-reloading of policies without service restarts.

## Phase 4: Formal Verification (`lambda-lean`)
**Goal:** Integrate the Lean4 proof verification layer.
- **Design:** Automated verification of policy adherence at runtime.
- **Tasks:**
  - Bridge Lean4 proofs to the 'the_guardian' service.
  - Runtime check for formal safety properties.
  - Proof-based policy generation for high-assurance environments.
