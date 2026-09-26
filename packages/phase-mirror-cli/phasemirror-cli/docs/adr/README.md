# ph-cli ADR Process & Layout

This directory contains the Architecture Decision Records (ADRs) for the `ph-cli` project.

## ADR Governance

We follow a structured decision-making process to ensure that architectural choices are documented, rationalized, and verified.

### Directory Structure

```
ph-cli/docs/adr/
├── README.md           # This process document
├── MADR-TEMPLATE.md    # Standard template for all future ADRs
├── ADR-0001-slug.md    # Initial ADRs...
└── ...
```

### ADR Lifecycle

1.  **Draft**: Create a new ADR using `MADR-TEMPLATE.md`.
2.  **Review**: Submit a PR for the ADR. Team members review for technical soundness and alignment with project goals.
3.  **Accept/Reject**: Once consensus is reached, the status is updated to `Accepted` or `Rejected`.
4.  **Deprecated**: If a decision is superseded by a later ADR, it is marked as `Deprecated` with a pointer to the new ADR.

### Naming Convention

- Format: `ADR-NNNN-descriptive-slug.md`
- Example: `ADR-0001-base-cli-architecture.md`

## ADR Template

Every ADR must follow the structure defined in [MADR-TEMPLATE.md](./MADR-TEMPLATE.md).

## Verification & Acceptance

Each ADR includes a set of **Acceptance Criteria**. These are testable conditions that must be met to consider the decision successfully implemented. These criteria should be integrated into the CI/CD pipeline where possible.
