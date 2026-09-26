# ADR-0003: Spoliation Event & Transition Model

## Status
Proposed

## Context
Preservation behavior should be tracked as a risk trajectory rather than just ad-hoc logs. We need a formal model to represent events that trigger or affect the duty to preserve ESI, and how these events transition the overall spoliation risk state.

## Decision
We will implement a state machine in Rust that processes `SedonaEvent`s and updates a `SpoliationRiskState`.

### Core Types
- `SedonaEvent`: Enum representing legal milestones (Claim Noticed, Complaint Filed, Hold Issued, Deletion After Duty, etc.).
- `SpoliationRiskState`: Struct tracking duty status, active holds, gaps detected, and current risk level.
- `SedonaJustification`: Record of each event's impact and its Sedona context (e.g., "Principle 5: Duty to preserve attaches...").
- `SpoliationRiskLevel`: Enum (None, Low, Medium, High, Critical).

### Transition Logic
A pure function `apply_spoliation_event(risk, event) -> risk` ensures deterministic risk tracking. The engine now supports:
- **Risk Escalation**: Critical risk is triggered if auto-deletion resumes while a duty is active or if post-duty deletions exceed a threshold.
- **Audit Trails**: Every event generates a `SedonaJustification` with a human-readable explanation of its legal impact.
- **Weighted Events**: Distinguishes between potential claims and formal complaints.

## Consequences
- Enables proactive detection of preservation gaps.
- Provides a "risk trajectory" that can be surfaced to counsel.
- Every state change can emit a `SedonaJustification` snippet for reporting.
