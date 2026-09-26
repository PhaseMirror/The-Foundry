# ADR Development Plan After ADR-013

> Status: Proposed  
> Date: 2026-03-13  
> Authors: Phase Mirror Integration Team  
> Builds On: [ADR-013](ADR-013-end-to-end-integration-convergence-boundary.md), [ADR-005](ADR-005-adr-process-layout.md), [ADR-004 Context](ADR-004.md)

## Purpose

This document converts the prior roadmap into an ADR-first execution plan that extends ADR-013.

ADR-013 defines end-to-end integration and feedback closure. This plan defines the next implementation ADRs needed to enforce stratum correctness, CI guardrails, verification debt tracking, and staged delivery gates.

## Program Rule

All implementation ADRs in this plan are Tooling ADRs. They may refine process, CI, and implementation shape, but they must not redefine PIRTM semantics from the canonical spec referenced by ADR-013.

## Core Invariant Carried Forward

The program-level invariant to enforce in verifier work is:

$PRIME\_IDX[s(consumer)] \le PRIME\_IDX[s(producer)] + 1$

This invariant is implemented through verifier logic and validated through deterministic fixture-oracle tests.

## ADR Backlog Derived From The Roadmap

### ADR-014: Stratum Call Validity Verifier

Scope:
- Define verifier responsibilities for annotation presence and call-validity checks.
- Lock error-shape policy for deterministic fixture matching.
- Define walk behavior for operand owners and unresolved BlockArgument handling policy.

Primary deliverables:
- Verifier entrypoint behavior contract.
- Stratum extraction and validation algorithm contract.
- Call-validity check contract.
- Deterministic diagnostic acceptance strategy.

Dependencies:
- ADR-013 feedback-loop goals.
- BlockArgument policy decision captured in [AGENTS.md](../../AGENTS.md).

Acceptance criteria:
- Missing annotation and invalid consumer-producer stratum relation are both surfaced.
- No silent-accept path exists when annotation retrieval fails.
- Deterministic fixture-oracle comparison passes from outside repository working directory.

### ADR-015: CI Guardrail Scripts And Enforcement Layer Separation

Scope:
- Define script-level enforcement for path-scoped extern usage.
- Define generated-file marker compliance.
- Define authoring ratio gate and bootstrap behavior.
- Formalize why these checks are CI concerns rather than verifier concerns.

Primary deliverables:
- Script contracts for ratio measurement, extern scope, and generated marker checks.
- Bootstrap and failure code policy.
- CWD-independent invocation requirement.

Dependencies:
- ADR-005 process boundary between semantic and implementation enforcement.

Acceptance criteria:
- Guardrails run with consistent outcomes on tracked and untracked files.
- Bootstrap mode is explicit and non-crashing.
- Guardrails can execute from non-repo working directory.

### ADR-016: Oracle-Driven Diagnostics And Debt Governance

Scope:
- Define oracle matching contract for verifier stderr.
- Define failure taxonomy and mandatory debt capture behavior for non-implemented named fixes.
- Define escalation policy for unresolved Form-4 items.

Primary deliverables:
- Fixture expected-output policy.
- Oracle substring matching policy.
- Debt register protocol and overdue escalation behavior.

Dependencies:
- ADR-014 verifier diagnostic contracts.
- ADR-015 CI scripts for repeatable execution environment.

Acceptance criteria:
- Oracle comparator distinguishes missing diagnostics from unexpected diagnostics.
- Debt entries include named date, escalation date, artifact target, and blocking status.
- Validation checklist can be executed fully from outside repository root.

### ADR-017: Governance Twin Rewrite Gate

Scope:
- Define entry criteria for governance twin rewrite.
- Define authored-as-MLIR rule with stratum annotation requirement.
- Define pass acceptance as completion signal.

Primary deliverables:
- Preconditions that must be green before rewrite begins.
- Rewrite completion and acceptance definition.

Dependencies:
- ADR-014, ADR-015, ADR-016 all accepted and green.

Acceptance criteria:
- Twin artifacts satisfy verifier pass acceptance.
- No rewrite module bypasses verifier gate.

### ADR-018: DSL Round-Trip Equivalence Gate

Scope:
- Define DSL phase start criteria after governance twin acceptance.
- Define byte-equivalence requirement between DSL-generated IR and hand-authored rewrite IR.
- Define defect attribution rule for divergence.

Primary deliverables:
- Round-trip equivalence policy.
- Test acceptance strategy for divergence diagnosis.

Dependencies:
- ADR-017 accepted and passing.

Acceptance criteria:
- Byte-equivalent output is demonstrated on target twin set.
- Divergence is treated as DSL defect until proven otherwise.

## Sequencing Plan

### Wave 1: Enforcement Foundations

Order:
1. ADR-014
2. ADR-015
3. ADR-016

Outcome:
- Verifier and CI enforcement boundaries are explicit, testable, and reproducible.

### Wave 2: Rewrite Authorization And Execution

Order:
1. ADR-017

Outcome:
- Governance twin rewrite proceeds only after objective preconditions are green.

### Wave 3: DSL Surface And Equivalence

Order:
1. ADR-018

Outcome:
- DSL phase begins only after rewrite is accepted by the verifier program.

## Gate Mapping To Existing Program Milestones

Day 0 to Day 2:
- ADR-014 and ADR-015 drafted and accepted with executable acceptance checks.

Day 2 to Day 3:
- ADR-016 drafted and accepted with oracle and debt protocol in place.

Day 6 to Day 10:
- ADR-017 governs rewrite start and completion criteria.

Day 11 onward:
- ADR-018 governs DSL round-trip program.

## Definition Of Done For This ADR Plan

This plan is complete when:

1. ADR-014 through ADR-018 are each created as individual ADR documents using the project ADR template from [MADR-TEMPLATE.md](MADR-TEMPLATE.md).
2. Each ADR includes measurable acceptance criteria and dependency references.
3. The ADR index in [README.md](README.md) is updated to include all accepted items.
4. Execution begins strictly in order, without bypassing blocked dependencies.

## Review Checklist

1. Confirms this plan extends ADR-013 rather than redefining it.
2. Confirms verifier invariants are mapped to verifier-layer enforcement.
3. Confirms CI-only invariants remain in CI-layer ADR scope.
4. Confirms debt tracking and escalation are explicit before rewrite begins.
5. Confirms DSL phase start is gated by rewrite acceptance.
