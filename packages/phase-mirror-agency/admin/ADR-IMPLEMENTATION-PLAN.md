# Production-Grade ADR Implementation Plan: Citizen Gardens Admin Dashboard

## 1. Overview
This ADR (Architectural Decision Record) outlines the implementation strategy for equipping the Citizen Gardens Admin Dashboard with production-grade "wirings" to the Phase Mirror Agency. The goal is to provide a unified interface for governance, compliance, and architectural decision-making, strictly adhering to the Sedona Spine Mandate.

## 2. Architectural Objectives
- **Centralized Governance:** Provide a "Single Pane of Glass" for all ADRs, system tensions, and compliance audits.
- **Agency Integration:** Enable seamless dispatch of MissionProtocol requests from the dashboard.
- **Deterministic Validation:** All architectural decisions MUST be validated against the Rust engine (Sedona Spine) via the Agency Server.
- **Secure Communication:** Ensure all data exchange between the Dashboard (Frontend) and Agency (Backend) is authenticated and integrity-verified.

## 3. Implementation Phases

### Phase 1: Infrastructure & Wiring (Foundational)
- **Agency Service SDK:** Implement a lightweight TypeScript SDK in the admin dashboard to communicate with the Node.js Agency Server.
- **Contextual Dispatch:** Extend `CopilotPanel.tsx` to handle specific MissionProtocol request types (e.g., "Draft ADR", "Analyze Tensions").
- **Proxy/Tunneling:** Configure the development and production environments to securely route dashboard requests to the Agency Server (port 8082).

### Phase 2: ADR Workflow & Lifecycle (Core)
- **ADR Registry:** Refactor `Governance.tsx` to pull live ADR data from the Dissonance Graph/Engine instead of using mock data.
- **Drafting & Review:** Implement an "ADR Draft" mode in `Editor.tsx` where the Agency provides real-time suggestions based on current system policies.
- **Governance Status:** Display the `governance_status` (e.g., VERIFIED, DRIFT_DETECTED) directly in the UI for each ADR.

### Phase 3: Sedona Spine Enforcement (Compliance)
- **Invariants Monitoring:** Integrate the `PrimeLattice.tsx` and `DissonanceGraph.tsx` with live data from the Rust engine.
- **Spoliation Risk Logic:** Implement retention and litigation hold flags in the user management view, ensuring logic is computed by the Rust Engine, not the UI.
- **Witness Hashing:** Capture and store the `witness_hash` for every architectural decision to ensure a perfect provenance chain.

## 4. Technical Specifications

### Data Model (ADR)
```typescript
interface ArchitecturalDecision {
  id: string; // ADR-XXX
  title: string;
  status: 'draft' | 'tension' | 'accepted' | 'superseded';
  governance_status: 'VERIFIED' | 'WARNING' | 'FAILED';
  witness_hash: string; // From Rust Harness
  author: string;
  created_at: string;
  content: string; // Markdown content
  policies: string[]; // Linked YAML policies
}
```

### Agency Request Loop (Frontend)
1. **User Action:** Admin triggers a "Verify ADR" action.
2. **SDK Call:** Dashboard sends a `POST /v1/agency/coding-commander/completions` request.
3. **Dispatch:** Node.js server executes `coding-commander` (Rust) with ADR context.
4. **Validation:** Rust engine checks for policy violations or L0 drift.
5. **Response:** UI updates with `governance_status` and `witness_hash`.

## 5. Security & Governance
- **Zero Drift Rule:** The UI is strictly a *transformer* of engine-computed facts. It cannot override risk levels.
- **Provenance Chain:** Every change must be logged in the `GlobalActivity.tsx` with its corresponding Agency mission ID.

## 6. Next Steps
1. **[Action]** Scaffold the `AgencyService.ts` in `admin/src/services/`.
2. **[Action]** Update `Governance.tsx` to handle async loading states from the Agency.
3. **[Action]** Deploy a production-ready version of the Agency Server with HTTPS and API Key authentication.
