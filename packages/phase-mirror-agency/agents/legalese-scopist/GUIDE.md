# Sedona Spine for Counsel: System Guarantees & Operating Guide

This guide explains the technical and legal foundation of the **Sedona Spine** within PhaseMirror-Legal. It defines the guarantees you can rely on when using this dashboard to manage ESI preservation, retention, and spoliation risk.

## 1. The Deterministic Core (The Rust Kernel)
Unlike standard legal tech that relies on heuristic or "AI-guessed" risk, the Sedona Spine is powered by a **high-integrity Rust kernel**. 
*   **The Guarantee:** Risk levels (Critical, High, Medium) and retention violations are computed using formal state-machine logic. If the system reports a `HoldNotImplemented` violation, it is because a mathematical comparison between your **YAML Retention Policy** and your **ESI System Logs** has failed.
*   **Counsel's Value:** You can represent to the Court that your preservation oversight is "deterministic and rule-based," rather than ad-hoc.

## 2. Sedona & FRCP 37(e) Compliance
The engine is explicitly designed around **Sedona Principle 2 (Proportionality)** and **Principle 5 (Preservation Duty)**.
*   **Proportionality:** Retention rules distinguish between "Core Unique ESI" (e.g., assignment chains, GPS logs) and "Routine Business Data."
*   **37(e) Triggering:** The system automatically escalates risk to **Critical** if auto-deletion is resumed *after* a duty to preserve has attached. This provides you with an immediate "Stop-the-Bleed" remedial checklist before spoliation becomes "intentional" under 37(e)(2).

## 3. The Agent-Engine Contract (AI Safety)
The **Legalese Scopist** agent is bound by a strict technical contract (`CONTRACT.md`).
*   **The Guarantee:** The AI is **forbidden** from re-calculating or improvising risk. It may only *transform* the engine's deterministic findings into narratives, checklists, and motion skeletons.
*   **Counsel's Value:** This eliminates "AI Hallucination" regarding ESI status. Every word in a draft motion is anchored in a specific system event (e.g., a database cron-job failure).

## 4. The Provenance Chain (Court-Ready Records)
Every preservation alert and risk level in the UI has a clear provenance chain:
1.  **Policy:** The specific YAML rule defining retention for that ESI type.
2.  **Event:** The specific log entry (Trigger, Hold, Deletion) that fired.
3.  **Computation:** The Rust engine's transition into a new risk state.
4.  **Narrative:** The agent's translation of that state into Sedona-citing legal prose.

## 5. Limitations & Counsel's Responsibility
*   **Garbage In, Garbage Out:** The system relies on accurate ESI inventories and system logs. If a data repository is not "known" to the engine, it cannot be audited.
*   **Legal Conclusion:** The Sedona Spine provides **factual findings** and **rule-based risk assessments**. The final legal conclusion and the decision to file a motion remain the sole responsibility of Counsel.

## 6. How to Use the Dashboard in Court
*   **To Defend Preservation:** Point to the "Sedona Lane" to show the Court your proactive, policy-driven monitoring.
*   **To Seek Sanctions:** Use the "Export Motion Skeleton" feature to obtain an argument structure that is already aligned with the engine's deterministic record of the opponent's spoliation.
