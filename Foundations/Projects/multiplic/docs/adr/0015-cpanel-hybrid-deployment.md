# ADR 0015: cPanel Hybrid Deployment Strategy

## Status
Proposed

## Context
Deploying modern React/Vite applications to cPanel shared hosting presents several challenges:
1. **Outdated Node.js Runtimes**: cPanel often provides very old Node.js versions (e.g., 10.x) which are incompatible with modern build tools.
2. **Security Risks**: Exposing API keys (like GEMINI_API_KEY) in the frontend is a security violation.
3. **Routing Complexity**: SPA routing needs to be handled by Apache via `.htaccess`, which can be brittle on shared hosts.
4. **Secret Management**: `.htaccess` `SetEnv` is often restricted or insecure on shared hosting.

## Decision
We will adopt a "Hybrid Deployment Strategy" that leverages the strengths of both static assets and PHP:

1.  **Static-First Architecture**: We will build the frontend locally or in CI using modern Node.js and deploy only the static `dist/` folder. This bypasses the need for a Node.js runtime on the server.
2.  **PHP Security Bridge**: A lightweight PHP proxy (`proxy.php`) will handle sensitive API calls. The frontend will call this proxy, which will then append the `GEMINI_API_KEY` and forward the request to the upstream AI provider.
3.  **Secure Secret Management**: Secrets will be loaded via cPanel's Environment Variables UI or a non-web-accessible `.env` file, NOT through `.htaccess SetEnv`. The proxy will use `getenv()` and fail-closed if keys are missing.
4.  **Minimalist .htaccess**: We will use a strictly minimal `.htaccess` for SPA routing and security headers to avoid 500/403 errors caused by unsupported directives.

## Consequences
- **Positive**: High performance, zero Node.js overhead on server, secure API keys, and broad compatibility with shared hosts.
- **Negative**: Requires a local/CI build step before deployment; requires PHP support (which is standard on cPanel).
- **Constraint**: The `proxy.php` must implement strict origin checks and fail-closed logic.
- **Constraint**: `.htaccess` must NOT be used for secret storage.

## Implementation Details
- `infra/cpanel/proxy.php`: The security bridge.
- `infra/cpanel/deploy.sh`: Local build and packaging tool.
- `infra/cpanel/.htaccess.template`: The minimal routing configuration.
