# ADR-ECHO-003: Enforce NF Stratification Gate

- Status: accepted
- Date: 2026-05-24
- Owners: @math-runtime
- Tags: [math, safety, types]
- Constitutional-Refs: ADR-AHGI-003
- Depends On: ADR-ECHO-001
- Supersedes: None

## Context
Type-dynamic rule systems can admit recursive evaluation loops unless membership-like edges preserve strict level ascent.

## Decision
Admit rule sets only when they satisfy a solvable level assignment where `member(x,y)` implies `level(y)=level(x)+1` and `equal(x,y)` implies equal levels.

## Consequences
Some expressive but unsafe rule sets remain explorable but not executable.
The validator becomes a non-negotiable kernel gate.
