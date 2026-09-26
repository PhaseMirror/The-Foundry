# ADR-0122: Global Multiplicity Specification

**Status:** Proposed

## Context
UOR Foundry is R&D civic infrastructure where everyone is a Founder of their own uniqueness on the platform. The platform must support unlike missions (e.g., healthcare, teaching, farming, research) without collapsing into a franchise model that sells a playbook, a mark, and a royalty as one object. There is a need to clearly delineate what components of the architecture and governance travel globally, what stays local, and which altitude a founder is standing on when they declare themselves a Citizen Gardens node. Without these definitions, a protocol office could inadvertently become a regional manager, compromising the independence of local craft.

## Decision
We adopt the Global Multiplicity Specification (GMS-001) to codify the node blueprint and craft independence. We define three distinct operational altitudes:
* **Altitude A (Craft):** The local mission expressed in a place. Governed by local founders and node consent.
* **Altitude B (Commons Topology):** The shared grammar and protocols (e.g., Phase Mirror, Multiplicity counting) allowing nodes to interact without a central manager.
* **Altitude C (Compliance Envelope):** The fail-closed, non-waivable civic invariants (e.g., Civic L0, budget envelopes, dignity audits).

We mandate that a node is recognizable by publishing a standard "Node Blueprint" card containing standardized fields (Altitude C rules, Altitude B sponsor, and Altitude A craft statement and outcome metrics). Local founders retain control over their mission, tools, local seating, and metrics, but cannot waive the compliance envelope (e.g., NODE_CAP = 12, privacy zones, four doors on inbound money). The operator LLC is restricted to selling seats and managed services, and is explicitly prohibited from selling exclusive territories or using compliance packs as a gatekeeping mechanism for node existence.

## Consequences
* **Standardized Node Recognition:** Nodes publish a uniform card that serves as a standard, not a franchise agreement, enabling transparent global affiliation.
* **Protected Local Autonomy:** Local founders maintain absolute independence over their specific craft (Altitude A) and local regulatory compliance.
* **Uniform Compliance Envelope:** Strict invariants (Altitude C) such as NODE_CAP = 12, no cameras in privacy zones, and no member profit distribution are universally enforced and cannot be waived.
* **Restricted Operator Scope:** The operator's role is clearly bounded to hosting diagnostic services and selling seats, preventing the ecosystem from functioning as a territory-based franchise.
* **Shared Topology:** Altitude B ensures that diverse nodes (e.g., a garden in Colorado and a lab in Florida) can interface using the same verification stack without necessitating a regional translation layer.

## Traceability & Artifact Links
* **[Source Document]** `Codify_the_Global_Multiplicity_Specification_v1.0.docx` — Original proposed document
