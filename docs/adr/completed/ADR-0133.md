# ADR-0133: Terminal Execution Is Allowlisted and Reports a Real Exit Code

**Status:** Accepted

## Context
app/api/terminal/route.ts passes the request body's `command` string directly to `execAsync(command, { cwd: process.cwd() })` with no allowlist, no argument validation, and no authentication. Any client that can reach the route can execute an arbitrary shell command in the server's working directory. The route also discards the child process exit code: on success it returns `success: true` with `stdout || stderr || 'Command executed with no output.'`, and on failure it returns HTTP 500 carrying `error.message`, so a non-zero exit is reported as a server error rather than as a command result. The consuming view, DashboardIdeView, renders `data.output` without reading `data.success`. The sibling package packages/foundry-web-example shows the opposite failure in the same component: it never calls the route and instead synthesizes results in the browser, pushing '[PASS] F-01 through F-18 predicate checks cleared.', '[OK] PRISMPM-PRF-BASE resolved with 24 C-controls.', and `Command executed: ${cmd}. Exit code 0.` for arbitrary input. That path is a fabricated result and is the reason a passing-looking terminal must never be accepted as evidence.

## Decision
Process execution is restricted to an explicit allowlist of commands with validated argument shapes, invoked without a shell, and never from a raw request string. The route returns the real exit code as a first-class field, reports a non-zero exit as a completed command with that code rather than as an HTTP failure, and the view renders the exit code alongside the output. No code path synthesizes a pass, a pass-shaped string, or an exit code. The example package's terminal is explicitly refused as a precedent: adopting its fabrication, or restoring it during a merge, is a regression against R2, under which a build claim is validated against its oracle and never asserted.

## Consequences
* Arbitrary command execution reachable from an unauthenticated request is closed; only allowlisted commands can run
* A failing command is reported as a real non-zero exit code, so a red terminal is evidence rather than an HTTP 500
* No UI path can display a pass that no process produced, which is the condition that made the example's fabrication dangerous
* The terminal is registered as a capability under the terminal-execution suite with negative scenarios for rejection and for non-zero exit, per ADR-0130 and R5

## Traceability & Artifact Links
* **[Source File]** `packages/foundry-web/foundry-web-main/app/api/terminal/route.ts` — Unvalidated execAsync of the request body; exit code discarded; failures returned as HTTP 500
* **[Source File]** `packages/foundry-web/foundry-web-main/components/DashboardIdeView.tsx` — Consumes the route and renders data.output without reading data.success or an exit code
* **[Source File]** `packages/foundry-web-example/components/DashboardIdeView.tsx` — Synthesizes '[PASS]' results and a hardcoded 'Exit code 0.' in the browser; refused as a precedent
* **[Specification Doc]** `packages/foundry-web/foundry-web-main/AGENTS.md` — R2 claim levels and R4 no-hidden-stub rule that the synthetic path violates
