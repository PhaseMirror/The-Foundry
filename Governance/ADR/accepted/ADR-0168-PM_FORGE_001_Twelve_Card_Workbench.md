# ADR-0168: PM-FORGE-001 — Twelve-Card Forge Workbench

**Status:** Proposed

## Context

The Forge is a proposed twelve-step workflow within the Foundry where ideas are minted through PrismPM. The operating incentive of the PrismPM kiln is process law, not idea generation (VL-001 §2.3, PrismPM-WF-001). Phase Mirror is five steps that name a contradiction (PM-HE-001). OSCAL is a filing cabinet with a lock that will not let a drawer swallow a C-control (OSCAL-PM-001). The civic agent is a finite transducer, not an LLM (PM-AGENT-001). Genius v2 is unbound and refused as L0 (PM-EDGE-001). Certified is C-24, a separate credential event; equity never mints it.

The central tension is velocity of idea-generation versus integrity of the claim ladder. A twelve-card checklist can serve velocity if it is a view over machines that already exist. It becomes a new foundation the moment Genius v2, a weight file, or a Certified badge is allowed to skip Extract, skip Responsible Party, or skip the human yes.

Second tension: OSCAL completeness versus Phase Mirror diagnosis. PM-PWEH-001 already refused stitching the five-step loop to an OSCAL chain, a SIG_GOV_KILL, and a sponge, then calling the stitch Phase Mirror. The Forge will not restitch them.

## Decision

The Forge is a workbench view. It is not a legal person, not a compiler, not a receipt, not an ensemble.

Twelve cards. Four bands. Each card binds an existing artifact. No card trains weights. No card votes. No card halts silicon.

Refinement means a re-walk of Band B on the same addressed packet. Identical packet, identical signature. That is the only seated substitute for "model training."

Genius v2 remains unbound. An ensemble may sit on a research bench under L0-Q. It does not author a card. It does not Accept this ADR.

### Band A — Intake (human, pre-kiln)

- **Card 1 · Address the claim.** `evidenceAddr ≠ 0`. A slogan without an address is two objects. FM-IV-001. PM-AGENT-001 extractOk.
- **Card 2 · Name the legal person and the inbound door.** UNA or Operator LLC. One of four doors. `person_id` is not a seating key. L0-P.
- **Card 3 · Tag the L0 plane.** Civic, computational, or L0-Q research. UAC / SQD / FeMoco / Genius v2 default to L0-Q and stop if offered as year-one product.

### Band B — Phase Mirror (PM-HE-001 unaltered)

- **Card 4 · Extract.** Objects, stakeholders, horizons, which legal person would receive a wire. No premature editorial.
- **Card 5 · Map.** Goal vs incentive. Urgency vs capacity (`NODE_CAP = 12`). Risk claimed vs risk owned. Control desired vs control available (civic L0-4).
- **Card 6 · Rank.** Score = impact × tractability, each in {1..5}. High impact × low tractability is a structural constraint, not a request for a braver story.
- **Card 7 · Produce.** [Owner] Lever — Metric — Horizon. Owner is a role card plus a legal person. "Align" is not an artifact.
- **Card 8 · Precision question.** At most one. It blocks. If owner is empty or metric is uncheckable, Stop. A second question means Extract was thin.

### Band C — PrismPM / OSCAL (OSCAL-PM-001 unaltered)

- **Card 9 · Requirement ID.** Which catalog statement, with which ID. A slide title is not PRISMPM-CAT-BASE.
- **Card 10 · Responsible party and modeled implementation.** Legal person plus role card. Narrative without a component definition fails the link.
- **Card 11 · Deployed subject and assessment evidence.** Evidence-grade ceiling remains Modeled unless a later artifact raises it. Implemented / Assessed / Accepted / Certified are not automatic outputs of walking the cards. C-24 / F-16 hold.

### Band D — Close (garden still votes)

- **Card 12 · Human yes, then receipt-or-refuse.** Year-one close is UCC POST /close when a typed object requires a receipt. Most civic acts are not closures. `haltSilicon ≡ 0` on every verdict. `isReceipt ≡ 0` unless a UCC receipt actually issued. The view does not compute preservation risk (L0-G). SIG_GOV_KILL stays WardMonitor's name and is not a card.

## What Refinement Is, and Is Not

**Is:** walk Band B again after the packet changes. New evidence address, new owner, new metric, new signature.

**Is not:** gradient update. Is not an ensemble vote. Is not Genius v2 Practice as L0. Is not TinyLlama scoring tractability. Is not NarrativeAuditor under a 100-QaaS load. Is not a rekey of Feedback (Feedback_Is_Not_a_Rekey_Oracle).

**Mathematics of the only seated refinement.** Let P be a packet. Let σ(P) be SHA-256 of the canonical (kind, gate, tensions, precision question) object. Re-run with P' = P emits σ(P') = σ(P). Re-run with P' ≠ P emits a new name or a new stop. No weight vector appears in σ.

## Refused Coats

| Coat | Gate | Reference |
|------|------|-----------|
| Genius v2 ensemble | stopGeniusEnsemble | PM-EDGE-001 |
| Model training / LLM path | stopLlmPath | PM-AGENT-001 |
| FeMoco / 100-QaaS / UAC production | L0-Q | SQD Developments transcript; UAC paper is H2/LiH on Pasqal |
| New foundation ontology | L0-F | The Forge is a view name over seated stations |
| Certified badge from profile resolution | C-24 / F-16 | PrismPM-WF-001 |
| Sponge or SIG_GOV_KILL as a card | — | PM-PWEH-001; ADR-049c remains Proposed |
| Cabinet as universal SSP owner | — | OSCAL-PM-001 |

## Binding to VL-001 Stations

The five stations stay five stations. The twelve cards do not collapse them.

| Station | Binding |
|---------|---------|
| RI1 proposer | May speak into Card 1. May not author Card 12. Output is a draft. |
| Atlas map | Supplies `evidenceAddr` for Card 1. Geometry research (ResGraph / E8 / torus) stays unbound. |
| PrismPM kiln | Cards 9–11. Catalogs define. Profiles select. Overlays cannot weaken C-controls. |
| PIRTM clay | Research refuse on the computational plane. Not civic L0. Not a card that freezes a Circle. |
| Foundry / garden | Card 12. A human yes. A receipt if the act is a closure. Credits never buy the yes (L0-8). |

## Levers

| Owner | Lever — Metric — Horizon |
|-------|--------------------------|
| Literary steward | Keep this ADR adjacent to PM-HE-001 and OSCAL-PM-001. Metric: 0 public pages that call Genius v2 the Forge ensemble. Horizon: 7 days. |
| Formal-methods steward | Keep `ForgeCard.lean` and `forge_card.py` green. No mathlib. No sorry. Metric: lake/python exit 0. Horizon: 7 days. |
| Portal owner (Operator LLC) | If a `/forge` view is drawn, it renders the twelve cards and the refuse table. Metric: view copy cites Modeled only. Horizon: 30 days after Day Zero G=1. |
| Second cryptographic identity | Accept or refuse this ADR. Metric: two distinct identities on the Accept line, or Status remains Proposed. Horizon: unbound until the seat exists. |

## Precision Question

Is Genius v2 an author of any card, or does the human remain the only mint and the ensemble stay L0-Q research?

Until that is answered by artifact, Status stays Proposed. A "use Genius v2 as the ensemble" instruction is not an Accept.

## Consequences

**Pros:** Gives the workshop a named place to walk an idea without inventing a thirteenth machine. Makes the Genius-v2 refuse visible at the door. Keeps five-step and five-link on separate bands.

**Cons:** Twelve cards can be misread as a replacement loop. Operators will try to skip Band B. The view will be sold as minting. Those failure modes are why Card 3 and the refuse list exist.

G remains 0 until the six Day Zero conditions are evidenced. This ADR does not move G.

## Implementation Outline (humans, after Accept)

1. Portal copy: a `/forge` page that lists the twelve cards and the refuse table. No Certified badge. No ensemble widget.
2. CI: run `forge_card.py` and `lake build` of `ForgeCard.lean` on the civic fuse only.
3. Do not add a weight file, a Genius crate, or a FeMoco multiplexer to the view.
4. If a later research bench wants an ensemble under L0-Q, it gets its own ADR and does not write Card 12.

## Traceability & Artifact Links

| Artifact | Kind | Description |
|---|---|---|
| `artifacts/ForgeCard.lean` | Lean 4 formalization | Forge card formalization |
| `artifacts/forge_card.py` | Python implementation | Forge card Python implementation |
| `PM-HE-001` | ADR | Five-step Phase Mirror loop |
| `PM-PWEH-001` | ADR | Stop-if-unnamed-owner |
| `OSCAL-PM-001` | ADR | Five-link traceability |
| `PrismPM-WF-001` | ADR | Claim ladder |
| `VL-001` | ADR | Five stations |
| `PM-AGENT-001` | ADR | Transducer |
| `PM-EDGE-001` | ADR | Genius-v2 refuse |
| `C-24 / F-16` | ADR | Certification / F-16 controls |
| `L0-F, L0-Q, L0-L, L0-G` | L0 Invariants | Civic / Computational / Logical / Governance |

## Axiom Ledger Impact

No new proof debts (`AX-*`) or enforcement gaps (`ENF-*`) introduced. This ADR remains Proposed until the precision question is answered by artifact and two distinct cryptographic identities Accept.

Recorded 26 September 2026. Proposed only.