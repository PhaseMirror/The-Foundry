# Playbook: Debt-Buyer Standing Matter (Matter-DB-001)

This playbook outlines the end-to-end execution flow for a Debt-Buyer Standing matter, integrating Multiplicity ($M_t$), ESI Risk (Sedona Engine), and the Legalese Scopist Agent.

## 1. Scenario Setup: "The Broken Chain"
*   **Plaintiff:** Example Debt Buyer LLC.
*   **Central Issue:** Standing to sue depends on a 4-party assignment chain.
*   **ESI Reality:** 
    *   M365 retention is set to "Standard" (7-year purge).
    *   A litigation hold was issued, but auto-purge was accidentally resumed on the Document Management System (DMS).
    *   AI-generated drafts of the "Assignment Affidavit" exist with conflicting metadata.

## 2. Call Sequence & Data Flow

### Step 1: Ingest Multiplicity & Evidence Metadata
*   **System:** PhaseMirror-Legal / AI Metadata Auditor.
*   **Action:** Detects metadata discrepancy in `Assignment_Affidavit_v2.docx`.
*   **Multiplicity Impact:** $M_t$ updates to reflect a "Factual Conflict" state regarding the 3rd assignment link.

### Step 2: Sedona Retention Audit
*   **Call:** `RetentionAuditor.audit(debt-buyer-standing.yaml, EsiInventory)`
*   **Input:** Current DMS configuration (auto-purge enabled) vs. Policy (infinite retention for `ChainOfTitle`).
*   **Engine Output:** `RetentionViolation` { type: "HoldNotImplemented", system: "DMS", sedona: "Principle 5" }.

### Step 3: Spoliation Risk Assessment
*   **Call:** `LegalMatter.process_event(AutoDeletionResumed { system: "DMS" })`
*   **Engine Output:** `SpoliationRiskState` { current_risk_level: "Critical", duty_triggered: true }.

### Step 4: Agent Mobilization (Legalese Scopist)
*   **Input:** Agent receives $M_t$, `RetentionViolation`, and `Critical` risk state.
*   **Constraint:** Agent checks `CONTRACT.md` and identifies the `Critical` risk override.

## 3. Expected Agent Output

### A. [PRESERVATION ALERT] (Immediate)
> **[CRITICAL PRESERVATION ALERT]**
> The spoliation risk level for Matter-DB-001 has escalated to **CRITICAL**. 
> **Finding:** Auto-deletion was resumed on the Document Management System (DMS) while a preservation duty is active.
> **Remedial Action Required:** Immediately suspend DMS auto-purge. All discovery strategy is secondary to halting ESI loss. Failure to act may result in an adverse inference instruction per FRCP 37(e).

### B. Litigation Narrative (Standing Defense)
> **Standing Analysis:** The Plaintiff's standing is fundamentally undermined by a combination of multiplicity conflicts and ESI violations. 
> 1. **Chain of Custody:** The DMS auto-purge violation (`HoldNotImplemented`) has potentially destroyed the original assignment records for the 3rd transfer link.
> 2. **Sedona Principle 2:** The burden of proof for standing is core; the Plaintiff's failure to preserve this "unique ESI" is disproportionately harmful to the defense.
> 3. **Sanctions Posture:** We recommend a Motion for Sanctions under 37(e)(2), as the resumption of auto-deletion suggests "intent to deprive" the defendant of standing-critical ESI.

## 4. Summary of Integrated Value
*   **Deterministic:** Risk isn't "guessed" by the agent; it's computed by the Rust kernel.
*   **Legally Legible:** Every alert cites Sedona Principles and FRCP 37(e) rationale.
*   **High-Leverage:** Counsel receives a direct "Remedial Action" checklist and a ready-made "Motion for Sanctions" narrative simultaneously.
