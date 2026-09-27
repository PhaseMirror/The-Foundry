import ADR.Core
import ADR.Proofs
import ADR.ADR_0151_OSCAL_PrismPM_Mapping
import ADR.ADR_0152_PIRTM_Foundry_Kiln_Clay
import ADR.ADR_0153_Five_Step_Loop_PWEH
import ADR.ADR_0155_OSCAL_Workflow_Crypto_Module
import ADR.ADR_0156_Adjacent_Compilers
import ADR.ADR_0157_Ratify_Resolution_Capital
import ADR.ADR_0158_Sedona_Spine_Records_Kiln_Priv
import ADR.ADR_0159_Two_Persons_501c3
import ADR.ADR_0160_UCC_Foundry_Kernel_L0
import ADR.ADR_0161_90_Day_Operating_Plan
import ADR.ADR_0162_Executive_Decision_Brief
import ADR.ADR_0163_Technology_Portfolio
import ADR.ADR_0164_Foundry_Citizen_Gardens
import ADR.ADR_0165_Unified_Civic_Infrastructure
import ADR.ADR_0166_Verified_Action_Lifecycle
import ADR.ADR_0167_schema_import
import ADR.ADR_0168_Forge_Workbench

/-! # ADR 0151–0168 — Phase Mirror Governance Formalization Aggregator

Re-exports the formal ADR definitions and claims for the Phase Mirror governance
ADR set (ADR-0151 through ADR-0168), covering OSCAL/PrismPM mapping,
PIRTM/Foundry, Five-Step Loop, Honesty Engine, OSCAL Workflow, Adjacent
Compilers, Capital Authorization, Sedona Spine privacy, two-person rule,
UCC kernel L0, 90-day plan, executive decision, technology portfolio,
Foundry/Citizen Gardens relationship, unified civic infrastructure,
verified action lifecycle, schema.org imports, and the Twelve-Card Forge
Workbench.

Each imported module contributes:
- An `@[adr]`-tagged `ADR_<nnnn>` record (machine-checked metadata)
- One or more `@[proof]`-tagged theorems (consequence counts, invariant
  embeddings, traceability predicates)

This module is the single import surface for foundry-web's `adr-data.ts`
LeanDeclaration links.
-/

open ADR
