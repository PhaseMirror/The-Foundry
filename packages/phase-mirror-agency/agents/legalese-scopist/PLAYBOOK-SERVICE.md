# Playbook: Service & Jurisdictional Defect (Matter-SVC-003)

This playbook outlines the end-to-end execution flow for a Service-Defect matter, completing the triad of disciplined reuse for the Legalese Scopist engine.

## 1. Scenario Setup: "The Sewer Service Log"
*   **Case Type:** Debt collection / Foreclosure (statutory threshold contest).
*   **Plaintiff:** Professional Process Service Agency (acting for Debt Buyer).
*   **Central Issue:** "Sewer service" allegations—Defendant claims they were never served at their primary residence.
*   **ESI Reality:** 
    *   `gps-archive` system has a "Low Storage" flag, triggering an emergency aggressive purge.
    *   Policy requires `infinite` retention for `GPSCoord` data once service is contested.
    *   The emergency purge ignored the litigation hold flag on the `gps-archive`.

## 2. Call Sequence & Data Flow

### Step 1: Ingest Multiplicity & Evidence Metadata
*   **System:** PhaseMirror-Legal / AI Metadata Auditor.
*   **Action:** Detects conflict between "Affidavit of Service" (stating delivery at 2:00 PM) and GPS metadata (showing the server 5 miles away at 2:00 PM).
*   **Multiplicity Impact:** $M_t$ updates to "Jurisdictional Conflict: Defective Service Metadata".

### Step 2: Sedona Retention Audit
*   **Call:** `RetentionAuditor.audit(service-defect.yaml, EsiInventory)`
*   **Input:** Current `gps-archive` purge (active due to emergency) vs. Policy (infinite for `GPSCoord`).
*   **Engine Output:** `RetentionViolation` { type: "PolicyConflict", system: "gps-archive", sedona: "Principle 2" }.

### Step 3: Spoliation Risk Assessment
*   **Call:** `LegalMatter.process_event(PreservationGapDetected { severity: Severe, description: "Emergency low-storage purge bypassed hold on GPS data." })`
*   **Engine Output:** `SpoliationRiskState` { current_risk_level: "Critical", gaps_detected: 1 }.

### Step 4: Agent Mobilization (Legalese Scopist)
*   **Input:** Agent receives $M_t$ (Conflict), `RetentionViolation` (PolicyConflict), and `Critical` risk state.
*   **Constraint:** Agent follows `CONTRACT.md` [PRESERVATION ALERT] protocol.

## 3. Expected Agent Output

### A. [PRESERVATION ALERT] (Immediate)
> **[CRITICAL PRESERVATION ALERT]**
> The spoliation risk level for Matter-SVC-003 has reached **CRITICAL**.
> **Finding:** An emergency "low-storage" purge on the `gps-archive` system has bypassed active litigation holds. 
> **Impact:** Loss of core `GPSCoord` data critical for verifying service integrity.
> **Remedial Action Required:** Immediately cease all emergency purge operations on the `gps-archive`. Initiate a forensic recovery attempt for the most recent 48 hours of deleted GPS logs.

### B. Litigation Narrative (Motion to Vacate / Dismiss)
> **Jurisdictional & Spoliation Analysis:** The Plaintiff's claim of jurisdiction rests on an Affidavit of Service that is contradicted by available metadata and further undermined by active spoliation.
> 1. **Threshold Defect:** Multiplicity analysis ($M_t$) reveals a 5-mile geographic discrepancy between the sworn affidavit and the server's actual location metadata.
> 2. **Systemic Spoliation:** The Sedona engine identifies a `PolicyConflict` where jurisdictional ESI (GPS logs) was purged despite an active hold. This loss of "unique ESI" (Sedona Principle 2) prevents a fair hearing on service.
> 3. **Sanctions & Dismissal:** We will move to Vacate Judgment / Dismiss for lack of service. The Plaintiff’s failure to preserve the only objective evidence of service (GPS logs) while simultaneously filing a contradictory affidavit warrants a dismissal with prejudice under FRCP 12(b)(5) and spoliation sanctions.

## 4. Summary of Triad Success
*   **Matter-DB-001 (Standing):** Proved state transitions and risk escalation.
*   **Matter-ARB-002 (Arbitration):** Proved zero-change domain reusability via YAML.
*   **Matter-SVC-003 (Service):** Proved emergency/systemic failure handling and jurisdictional threshold integration.
