# Playbook: Arbitration & Assent Matter (Matter-ARB-002)

This playbook outlines the end-to-end execution flow for an Arbitration-Heavy matter, demonstrating the disciplined reuse of the Legalese Scopist engine without modifying the core Rust/WASM kernel.

## 1. Scenario Setup: "The Phantom Clickwrap"
*   **Defendant (Corporate):** Tech Platform Inc. (moving to compel arbitration).
*   **Plaintiff (Consumer):** Alleges they never saw the arbitration clause or class-action waiver during sign-up.
*   **Central Issue:** Contract formation and assent (state law vs. FAA).
*   **ESI Reality:** 
    *   Backend `session-logger` is on a strict 30-day rolling purge to save AWS costs.
    *   A litigation hold was issued internally, but the database engineering team failed to suspend the cron job purging `IPLog` and `ClickwrapAudit` tables.

## 2. Call Sequence & Data Flow

### Step 1: Ingest Multiplicity & Evidence Metadata
*   **System:** PhaseMirror-Legal / AI Metadata Auditor.
*   **Action:** Detects that the submitted "Terms of Service Screenshot" has creation metadata post-dating the plaintiff's sign-up date.
*   **Multiplicity Impact:** $M_t$ updates to reflect "Evidentiary Conflict: Authenticity of Assent Screen".

### Step 2: Sedona Retention Audit
*   **Call:** `RetentionAuditor.audit(arbitration-clause.yaml, EsiInventory)`
*   **Input:** Current `session-logger` configuration (30-day purge active) vs. Policy (infinite retention for `ClickwrapAudit` under hold).
*   **Engine Output:** `RetentionViolation` { type: "HoldNotImplemented", system: "session-logger", sedona: "Principle 5" }.

### Step 3: Spoliation Risk Assessment
*   **Call:** `LegalMatter.process_event(DeletionAfterDuty { system: "session-logger", reason: "30-day cron purge" })`
*   **Engine Output:** `SpoliationRiskState` { current_risk_level: "High", post_duty_deletions: 1 }.

### Step 4: Agent Mobilization (Legalese Scopist)
*   **Input:** Agent receives $M_t$, `RetentionViolation`, and `High` risk state.
*   **Constraint:** Agent complies with `CONTRACT.md` and generates outputs strictly derived from the engine's deterministic findings.

## 3. Expected Agent Output

### A. [PRESERVATION ALERT] (Immediate)
> **[HIGH PRESERVATION ALERT]**
> The spoliation risk level for Matter-ARB-002 is currently assessed as **HIGH**. 
> **Finding:** A `DeletionAfterDuty` event was recorded on the `session-logger` system (Reason: 30-day cron purge). This directly impacts `ClickwrapAudit` ESI.
> **Remedial Action Required:** Immediately escalate to Database Engineering to halt the 30-day cron purge. Document exactly which user session date ranges have been lost to assess the scope of prejudice.

### B. Litigation Narrative (Resisting Motion to Compel Arbitration)
> **Assent & Spoliation Analysis:** The Defendant's Motion to Compel Arbitration relies on proving the Plaintiff affirmatively clicked the "I Agree" button.
> 1. **Factual Vulnerability:** Multiplicity analysis ($M_t$) indicates the provided ToS screenshots are retroactively generated, not contemporaneous.
> 2. **ESI Spoliation:** The Sedona engine confirms a `HoldNotImplemented` violation on the `session-logger`. Crucially, backend audit logs proving the Plaintiff's specific IP and click-path have been purged post-duty.
> 3. **Strategic Posture:** We will oppose the Motion to Compel Arbitration. The Defendant cannot rely on generic ToS screenshots when they have actively spoliated the specific `ClickwrapAudit` data that Sedona Principle 2 identifies as the unique, definitive ESI for contract formation. We will seek an adverse inference that the purged logs would have shown no valid assent.

## 4. Summary of Disciplined Reuse
*   **Zero Kernel Changes:** The exact same Rust engine that processed the Debt-Buyer matter effortlessly handles the Arbitration matter. 
*   **Policy-Driven:** The legal context shifted entirely through the `arbitration-clause.yaml` policy, not through hardcoded AI prompts.
*   **Governance Maintained:** The agent remains constrained by the `CONTRACT.md`, preventing "vibes-based" arguments and ensuring all sanctions threats are anchored in actual database cron-job failures.
