# Operational Contract: Legalese Scopist Agent ↔ Sedona Engine

This contract defines the strict relationship between the **Legalese Scopist Agent** (AI) and the **Sedona/ESI Engine** (Rust/WASM Kernel). It ensures that all legal work product regarding ESI retention, preservation duties, and spoliation risk is anchored in deterministic, high‑integrity logic.

## 1. The "Source of Truth" Mandate
The Legalese Scopist agent MUST NOT independently calculate preservation risk levels, retention durations, or compliance statuses. It MUST use the following engine methods as its sole source of truth:

| Legal Question | Engine Interface (TS SDK) | Data Source |
| :--- | :--- | :--- |
| **"What is our current spoliation risk?"** | `LegalMatter.getRiskLevel()` | Matter event logs |
| **"Are we violating any retention duties?"** | `RetentionAuditor.audit()` | ESI Inventory + YAML Policy |
| **"Why is this flagged as a risk?"** | `LegalMatter.getJustificationHistory()` | Engine-generated `SedonaJustification` |
| **"What Sedona Principles apply?"** | `RetentionRule.sedonaPrinciples` | DSL Policy Definition |

## 2. Protocol for Legal Interpretation
When generating work product (Pleadings, Discovery Motions, Strategy Memos), the agent must follow these transformation rules:

### A. Narrative Construction
*   **Engine Fact:** `SpoliationRiskLevel::High` (Reason: `DeletionAfterDuty` detected on Slack).
*   **Agent Narrative:** "The spoliation risk is currently assessed as **High**. This escalation is driven by a detected deletion event on the Slack system occurring after the preservation duty attached on [Trigger Date], in violation of Sedona Principle 5."

### B. Motion Drafting
*   **Engine Fact:** `RetentionViolation` (Type: `HoldNotImplemented`).
*   **Agent Legal Argument:** "Opposing counsel's failure to implement a litigation‑hold override on their M365 auto‑purge policy constitutes a breach of the duty to preserve. Per the Sedona‑aware audit, this resulted in a 'HoldNotImplemented' violation, which we will use as the basis for our 37(e) sanctions motion."

## 3. Guarantees & Constraints
1.  **Immutability of Logic:** The agent cannot override the engine's risk thresholds (e.g., it cannot decide a `Critical` risk is actually `Low`).
2.  **Traceability:** Every claim made by the agent regarding ESI must be traceable to a specific `SedonaEvent` or `RetentionRule` ID in the engine's record.
3.  **Proactive Alerts:** If the agent detects a `Critical` risk level via the SDK, it must immediately prepend its response with a **[PRESERVATION ALERT]** and recommend specific remedial measures (e.g., "Suspend Slack auto‑purge immediately").
4.  **Layer-B Code Identity Mandate:** The agent shall not attest to any contract or statutory filing without a verified Layer-B immutable Git tag and content-addressed CID. Groth16 circuit proofs must never be claimed or treated as proofs of code identity.
5.  **Wyoming Statutory Membrane:** Zero residual human authority; all legal representations must be strictly grounded in machine-checked witnesses.

## 4. Test Case: Debt‑Buyer Standing
The agent will be tested against the `debt-buyer-standing-matter` scenario:
*   **Input:** Multi‑transfer chain of title + M365 retention logs.
*   **Requirement:** Agent must correctly identify the "gap" in the chain of custody (via the engine's `computeChainOfCustodyStatus`) and link it to a specific Sedona Principle 2 proportionality defense.

## 5. Flow Diagram
```mermaid
flowchart LR
    Engine[Engine (Rust)] --> SDK[SDK (TS/WASM)] --> Contract[Contract (CONTRACT.md)] --> UI[UI/Agent]
    classDef engine fill:#1E3A8A,color:#fff,stroke:#2563EB,stroke-width:2px;
    classDef sdk fill:#10B981,color:#fff,stroke:#059669,stroke-width:2px;
    classDef contract fill:#F59E0B,color:#fff,stroke:#D97706,stroke-width:2px;
    classDef ui fill:#6B21A8,color:#fff,stroke:#7C3AED,stroke-width:2px;
    class Engine engine;
    class SDK sdk;
    class Contract contract;
    class UI ui;
```
