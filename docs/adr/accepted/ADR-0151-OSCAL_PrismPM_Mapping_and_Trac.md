I have converted the document into the strictly specified Architecture Decision Record (ADR) format. In adherence to the Phase Mirror methodology, I have saved it to both your `docs/adr/` and mirrored `artifacts/adr/` directories.

Here is the resulting ADR content:

```markdown
# ADR-0123: OSCAL and PrismPM Mapping

**Status:** Proposed

## Context
The Foundry must represent physical sites, digital services, and civic controls as machine-readable evidence. While OSCAL provides a public grammar for compliance documentation (catalogs, profiles, SSPs), relying on it alone permits silent exclusions of controls, diluting the baseline. There is a risk of treating imported catalogs (like NIST SP 800-53) as the baseline rather than additive material, or inappropriately minting "Certified" badges. The current bounding scope is limited strictly to the portal inventory (`app.uor.foundation`), managed by Operator LLC and custodied by Citizen Gardens UNA, with physical sites and computational nodes explicitly out of bounds.

## Decision
We will use OSCAL purely as the representational framework ("the filing cabinet") and PrismPM as the non-negotiable baseline ("the lock"). 
* Catalogs define, profiles select, and overlays cannot weaken controls. Any exclusion or reduction of a C-control (C-10) is a visible, recorded conflict, not a silent merge.
* Civic L0 and computational L0 must remain distinct.
* The claim ladder is strictly enforced. The current portal inventory is restricted to a ceiling of "Modeled" (E1 Modeled). Claims of "Implemented", "Assessed", or "Accepted" are forbidden on the current inventory.
* "Certified" cannot be emitted as an automatic profile output (F-16).
* A strict 5-step traceability sequence (Requirement → Responsible Party → Modeled Implementation → Deployed Subject → Assessment Evidence) will be used to identify and name conflicts using the Phase Mirror.

## Consequences
* **Fail-Closed on Weakening:** Missing C-controls (F-01) or overlays that loosen controls (F-07) will result in automatic failures in the profile machinery.
* **Visible POA&Ms:** Any divergence between the modeled implementation and the deployed subject must be recorded as a visible POA&M rather than handled quietly.
* **Accurate Scope Claims:** The SSP will reflect only the portal view generated from the registry, preventing the Foundation from being inaccurately portrayed as a single bounded SSP.
* **Restricted Terminology:** The phrases "Certified by Prism" and "FedRAMP-ready" are retired from public views. Zero-knowledge proofs are not considered statutory compliance evidence.
* **Controlled Advancement:** Advancing the inventory claim above "Modeled" requires a recorded rung-change, and the portal system owner must establish hosting provider and C-08 unit bindings first.

## Traceability & Artifact Links
* **[Source Document]** `OSCAL_PrismPM_Mapping_and_Traceability_v1.0.docx` — Original proposed document
```

The physical files have been recorded at:
- [docs/adr/ADR-0123-OSCAL-PrismPM-Mapping.md](file:///media/citizen/b361d448-7c51-413a-aa23-9515cb626930/home/citizen/Multiplicity/packages/uor-foundry-main/docs/adr/ADR-0123-OSCAL-PrismPM-Mapping.md)
- [artifacts/adr/ADR-0123-OSCAL-PrismPM-Mapping.md](file:///media/citizen/b361d448-7c51-413a-aa23-9515cb626930/home/citizen/Multiplicity/packages/uor-foundry-main/artifacts/adr/ADR-0123-OSCAL-PrismPM-Mapping.md)

Let me know if you would like me to adjust any of the wording or integrate this into other governance or verification registers!
