<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# I have added a react UI to the repo lets create a phased plan to wire it up.

Now I have a complete picture of the repo state and the detailed UI/UX blueprint. Let me build the phased wiring plan.

Here is a phased plan to wire the React UI to the Python `mis` backend in the [M-Solver repo](https://github.com/MultiplicityFoundation/M-Solver). The repo's default branch is `Multiplicity`, and the current state shows a fully scaffolded React frontend (Vite + TypeScript + Cytoscape.js + Recharts) alongside the Python `src/mis/` library — but **no FastAPI server or API layer connecting them yet** .

***

## Phase 0 — Repo Restructuring

The React files (`App.tsx`, `pages/`, `components/`, `types.ts`, `constants.tsx`) currently sit at the repo root alongside the Python `src/mis/` package . Per the blueprint, they should be moved into a `ui/` subdirectory to create clean monorepo separation.[^1]

- Move all React/TS files into `ui/src/` (App.tsx, index.tsx, pages/, components/, types.ts, constants.tsx)
- Move `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html` into `ui/`
- Add `ui/.env` with `VITE_API_BASE=http://localhost:8000/api` and `VITE_WS_BASE=ws://localhost:8000`
- Add `.gitignore` entries for `node_modules/`, `dist/`, `__pycache__/`
- Clean out committed `__pycache__/` and `.hypothesis/` directories

**Gate:** `npm run build` succeeds from `ui/` and `pytest` passes from root.

***

## Phase 1 — FastAPI Server Scaffold

Stand up the API server that wraps the `mis` library. This is the critical bridge — every React page calls the server, never the Python library directly.[^1]

```
server/
  main.py          # FastAPI app, CORS, lifespan
  config.py        # pydantic-settings (DB path, CORS origins)
  routers/
    ingest.py      # POST /api/ingest, GET /api/schema, POST /api/schema/migrate
    graph.py       # GET /api/graph, POST /api/operator/{type}
    intervention.py # POST /api/simulate, WS /ws/simulate/{hash}
    governance.py  # GET /api/gates, POST /api/signoff, POST /api/bias-audit
    audit.py       # GET /api/audit, GET /api/audit/{hash}, POST /api/audit/{hash}/reproduce
  schemas/         # Pydantic request/response models mirroring types.ts
  services/        # Thin wrappers calling src.mis.* modules
  middleware/
    audit_logger.py    # Auto-logs every API call to audit store
    governance_gate.py # Blocks operational endpoints if gates fail
```

The API contract maps 1:1 to the solver pillars:[^1]


| Endpoint Group | Key Routes | Serves Page |
| :-- | :-- | :-- |
| Ingest/Schema | `POST /api/ingest`, `GET /api/schema`, `GET /api/scv` | IngestPage |
| Graph/Operators | `GET /api/graph`, `POST /api/operator/pagerank` | GraphPage |
| Intervention | `POST /api/simulate`, `WS /ws/simulate/{hash}` | InterventionPage |
| Governance | `GET /api/gates`, `POST /api/bias-audit`, `POST /api/signoff` | GovernancePage |
| Audit | `GET /api/audit`, `POST /api/audit/{hash}/reproduce` | AuditPage |

**Gate:** All routers return stubbed 200 responses; `pytest` covers each endpoint; CORS allows `localhost:5173`.

***

## Phase 2 — API Client \& Zustand Stores

Wire the React frontend to consume the FastAPI endpoints.[^1]

- Create `ui/src/api/client.ts` — Axios/fetch base with auth headers and `VITE_API_BASE` config
- Create typed fetch wrappers: `ingest.ts`, `graph.ts`, `intervention.ts`, `governance.ts`, `audit.ts`
- Create Zustand stores mirroring the existing `types.ts` interfaces :
    - `schemaStore.ts` — ChannelConfig, SCV cache
    - `graphStore.ts` — Cytoscape elements, operator scores, spectral radius
    - `simulationStore.ts` — SimulationConfig, SimulationStep[], audit hash
    - `governanceStore.ts` — GateStatus[], BiasAuditResult
    - `auditStore.ts` — AuditEntry[] with pagination cursor
- Create `useWebSocket.ts` hook for live simulation streaming[^1]

**Gate:** Each store has unit tests (Vitest); mock API calls return typed responses matching `types.ts`.

***

## Phase 3 — Page-by-Page Wiring

Connect each page's hardcoded/mock state to live API calls, one page at a time.

### 3a — IngestPage → `/api/ingest` + `/api/schema`

- File upload triggers `POST /api/ingest` with column mapping
- Schema panel fetches `GET /api/schema` on mount; migration button calls `POST /api/schema/migrate`
- SCV preview table paginated via `GET /api/scv?page=&size=`
- Aggregation config sends scaling params to the backend for A1/A2 validation[^1]


### 3b — GraphPage → `/api/graph` + `/api/operator/*`

- `NetworkCanvas` loads Cytoscape elements from `GET /api/graph`
- Operator panel dispatches to `POST /api/operator/{type}` — response updates node scores and spectral radius
- `SpectralBadge` in TopBar reads `ρ(M)` from the operator response instead of the current random interval
- Layer toggles call `GET /api/graph/channel/{ch_id}` for per-channel subgraphs


### 3c — InterventionPage → `/api/simulate` + WebSocket

- Policy selector + budget slider compose a `SimulationConfig` and `POST /api/simulate`
- `useWebSocket` hook streams `SimulationStep` events to the simulation canvas
- Before/after comparison renders diff from stored pre/post graph snapshots
- Audit hash display populated from the simulation response


### 3d — GovernancePage → `/api/gates` + `/api/bias-audit`

- Gate stepper fetches `GET /api/gates` on mount; auto-checked gates refresh periodically
- Manual gates submit attestations via `POST /api/gates/{id}/verify`
- Bias audit panel triggers `POST /api/bias-audit` and renders Top-k Parity + Exposure Gap charts
- `OperationalLock` reads `GET /api/operational-status` instead of the current client-side spectral check


### 3e — AuditPage → `/api/audit`

- Timeline loads via `GET /api/audit?from=&to=&cursor=` with infinite scroll
- Event detail panel fetches `GET /api/audit/{hash}` on card click
- Reproduce button calls `POST /api/audit/{hash}/reproduce` and diff-checks output hashes

**Gate per sub-phase:** Page renders live data; Playwright E2E test confirms the full user flow.

***

## Phase 4 — Middleware \& Governance Enforcement

This phase makes governance operationally inseparable, not just a UI checkbox.[^1]

- `audit_logger.py` middleware auto-writes every API call (input hash, params, actor, timestamp) to the immutable audit store — the `AuditFooter` component reflects real event counts
- `governance_gate.py` middleware intercepts `/api/simulate`, `/api/audit/{hash}/export` and returns `403` if any gate is `fail` — this is **server-side enforcement** regardless of the React UI
- RBAC middleware validates JWT roles (Analyst/Reviewer/Admin) against endpoint permissions[^1]
- `RoleGuard.tsx` client-side component hides UI elements the user can't access (UX convenience, not security boundary)

**Gate:** Attempting an export with a failing gate returns 403; audit trail captures the blocked attempt.

***

## Phase 5 — Docker Compose \& CI

Package everything for reproducible development and deployment.[^1]

```yaml
# docker-compose.yml
services:
  server:
    build: ./server
    ports: ["8000:8000"]
    volumes: ["./src/mis:/app/mis"]
    environment:
      - CORS_ORIGINS=http://localhost:5173
  ui:
    build: ./ui
    ports: ["5173:5173"]
    environment:
      - VITE_API_BASE=http://localhost:8000/api
      - VITE_WS_BASE=ws://localhost:8000
```

- GitHub Actions CI: `pytest` (Python) → `vitest` (React) → `playwright` (E2E) → `npm run build`
- Production build: React static assets served by Nginx, FastAPI behind a reverse proxy
- Add a `Makefile` with `dev`, `test`, `lint`, `build` shortcuts

**Gate:** `docker compose up` starts both services; E2E tests pass against the containerized stack.

***

## Recommended Issue Breakdown

Each phase should become a GitHub issue (or set of sub-issues) on the [M-Solver repo](https://github.com/MultiplicityFoundation/M-Solver) to track progress. Want me to create these issues now, or should we refine the scope of any phase first?
<span style="display:none">[^2][^3][^4][^5][^6][^7]</span>

<div align="center">⁂</div>

[^1]: whats-an-appropriate-license-f-_PAr8W7mRnqV24pnABgyyA.md

[^2]: lets-expand-on-this-into-detai-L4CAaNIZQgWRIPfs7upVKA.md

[^3]: M-Integrative Coding Agent.pdf

[^4]: Core Data Structures \& Evidence Encoding.pdf

[^5]: A Mathematical Monograph.pdf

[^6]: The M-Integrative Solver.pdf

[^7]: A Policy Framework for the Ethical Deployment.pdf

