# ADR 0004: Bind Desktop Triple Lock Machine to Witness Validation

## Status
Proposed

## Context
The `DesktopTripleLockMachine` implements the `TripleLockMachine` trait. Its `advance` method takes a witness but completely ignores it, unconditionally setting the internal phase to `Completed`. This bypasses all legislative engine checks.

## Decision
We will instantiate a `LegislativeEngine` within the `DesktopTripleLockMachine`. The `advance` method will pass the witness to `LegislativeEngine::transition`. State advancement will only occur if the transition returns `Ok`.

## Consequences
- The desktop application will be bound by the same cryptographic and invariant checks as the core protocol.
- Invalid witnesses will be correctly rejected by the desktop core.
