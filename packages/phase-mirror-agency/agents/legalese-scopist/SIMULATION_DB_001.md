# Simulation: Live Procedural Posture (Matter-DB-001)

This document simulates a live hearing before a Special Master regarding ESI spoliation and standing in *Example Debt Buyer LLC v. [Defendant]*.

## 1. The Adversarial Setup
*   **Plaintiff's Position:** "We have provided affidavits of assignment. Any technical gaps in our document management system (DMS) logs are routine and do not prejudice the defense."
*   **Defendant's Position (PhaseMirror-Legal User):** "The Plaintiff has spoliated core unique ESI (assignment logs) post-duty, suggesting an intent to deprive us of evidence proving a broken chain of title."

## 2. The Sedona Spine Evidence (Generated via Engine)

### A. The Sedona Lane Report
*   **Finding:** `HoldNotImplemented` on DMS.
*   **Evidence:** System logs show `AutoDeletionResumed` on 2024-05-10, three days after the `PotentialClaimNoticed` trigger.
*   **Risk Level:** `CRITICAL`.
*   **Principle Cite:** Sedona Principle 5 ("Duty to preserve attaches...").

### B. The Legalese Scopist Motion (Drafted via SDK)
> "The Plaintiff resumed automated purges of its assignment database *after* receiving our demand letter. Per the Sedona-aware audit of their ESI regime, this constitutes a critical failure to implement a litigation hold. We seek an adverse inference under FRCP 37(e)(2) that the destroyed logs would have shown the third assignment link never occurred."

## 3. Simulated Neutral (Special Master) Response
*   **Reaction to Determinism:** "The Court finds the defense's presentation particularly compelling because it is grounded in a deterministic audit of the DMS logs rather than speculative 'AI-guesses'. The provenance from the YAML policy to the specific deletion event is clear."
*   **Reaction to Sedona Cites:** "The alignment with Sedona Principle 2 proportionality—recognizing assignment chains as the central 'unique ESI'—is well-taken. The Plaintiff's failure to stop-the-bleed on this specific data set, while purging noise, is problematic."
*   **Ruling:** "The Court orders an immediate forensic recovery attempt (as recommended by the system's Remedial Checklist) and reserves the right to issue a 37(e) instruction if the data is unrecoverable."

## 4. Key Learnings for PhaseMirror-Legal
1.  **Provenance is King:** The ability to show the "Policy → Event → Rationale" chain effectively neutralized the Plaintiff's "routine gap" defense.
2.  **Remedial Checklist as Good Faith:** Proposing the forensic recovery step *immediately* via the agent narrative increased the defense's credibility with the Neutral.
3.  **WASM Speed:** The live UI updates during the meet-and-confer allowed counsel to pinpoint the exact 48-hour window of data loss.
