I have converted the provided text into the requested Architecture Decision Record format and saved it to the `docs/adr/` directory to adhere to the Phase Mirror methodology.

Here is the finalized ADR:

```markdown
# ADR-0121: Resolution and Capital Authorization

**Status:** Proposed

## Context
A request was made for the Board of Directors to authorize a foundational envelope for the Livermore parcel before moving capital. However, Citizen Gardens UNA operates under member ratification, not a shadow board. Day-one administrators are limited to contracts under $2,500, requiring a 14-day member vote for material assets such as land. There is a $250,000 budget drift between a prior $750,000 blended HQ proposal and the current $1,000,000 envelope ($800,000 for land acquisition, $200,000 for Phase 1 off-grid and site seeding). The Phase 2 barn is excluded from this initial envelope. Funds must arrive via four strict channels (gifts, sponsor dues, recoverable grants, operator remittance) to avoid unregistered capital or private equity extraction. The association must hold the title to prevent occupancy theater or commingling with the operator LLC. 

## Decision
We resolve to prepare a member-facing resolution packet (BR-CA-001) for the $1,000,000 Livermore parcel envelope that binds statutory safeguards and a three-way kill-switch. Specifically:
*   Adopt a strict ceiling for acquisition costs that resolves the $750,000 / $1,000,000 drift, and establish a separate not-to-exceed ceiling for Phase 1 kit, excluding the Phase 2 barn.
*   Enforce dual-control (two signatures) for every disbursement above $2,500, with no "land closing exception".
*   Lock all physical assets, kit, and data to the association title (Citizen Gardens UNA), prohibiting the pledging of these assets for operator or personal obligations.
*   Require inbound funds to be explicitly sourced from one of four named doors before closing can occur.
*   Implement a mandatory, quarterly, public three-way metric card evaluating Member Dignity, Community Outcome, and Solvency.
*   Enact a fail-closed kill-switch where two consecutive failed quarters on the metric card automatically pause local node draws from the envelope until a new public card and a Phase Mirror pass are published.

## Consequences
*   **Decentralized Ratification:** Ratification power is firmly placed in the hands of voting members after a 14-day notice, rather than an unapproved shadow board of directors.
*   **Strict Capital Control:** The strict $2,500 dual-control threshold and four-door funding policy prevent urgency from bypassing governance, eliminating the risk of founders executing unilateral land closings.
*   **Asset Protection:** Association title locks prevent private equity extraction, collateralization of the parcel for shop debt, or the commingling of public-goods accounts with an operator LLC's cap table.
*   **Automated Accountability:** The three-way metric card and fail-closed kill-switch guarantee that failures in member dignity or community outcomes will halt capital deployment, preventing solvency from masking operational or ethical failures.

## Traceability & Artifact Links
* **[Source Document]** `Ratify_Board_Resolution_and_Capital_Authorization_v1.0.docx` — Original proposed document
```

The document has also been persisted on-tree to [ADR-0121-Resolution-and-Capital-Authorization.md](file:///media/citizen/b361d448-7c51-413a-aa23-9515cb626930/home/citizen/Multiplicity/packages/uor-foundry-main/docs/adr/ADR-0121-Resolution-and-Capital-Authorization.md) for permanent traceability.
