import ADR.Core
import ADR.Proofs
import ADR.ADR_0151_OSCAL_PrismPM_Mapping
import ADR.ADR_0152_PIRTM_Foundry_Kiln_Clay
import ADR.ADR_0153_Five_Step_Loop_PWEH
import ADR.ADR_0155_OSCAL_Workflow_Crypto_Module
import ADR.ADR_0156_Adjacent_Compilers
import ADR.ADR_0157_Ratify_Resolution_Capital

/-! # ADR 0151–0157 — Phase Mirror Governance Formalization Aggregator

Re-exports the formal ADR definitions and claims for the Phase Mirror governance
ADR set (OSCAL/PrismPM mapping, PIRTM/Foundry, Five-Step Loop, Honesty Engine,
OSCAL Workflow, Adjacent Compilers, Capital Authorization).

Each imported module contributes:
- An `@[adr]`-tagged `ADR_<nnnn>` record (machine-checked metadata)
- One or more `@[proof]`-tagged theorems (consequence counts, invariant
  embeddings, traceability predicates)

This module is the single import surface for foundry-web's `adr-data.ts`
LeanDeclaration links.
-/

open ADR
