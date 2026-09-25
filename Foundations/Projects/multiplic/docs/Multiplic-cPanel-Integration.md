# Multiplic cPanel Integration Strategy

The cPanel deployment strategy has been expanded into a production-grade ADR Implementation Scaffold. This architecture shifts from a Node.js-dependent routing engine to a high-performance, secure, and static-first model optimized for cPanel shared hosting constraints.

## 1. Architectural Decision Record (ADR 0015)
The official standard is established in `docs/adr/0015-cpanel-hybrid-deployment.md`. Key pillars include:
*   **Static-First**: Bypasses the outdated Node.js runtime on the server.
*   **Apache Native**: Uses native Document Root mapping for zero-overhead routing.
*   **PHP Security Bridge**: Introduces a PHP 8.3 proxy to protect Gemini API keys.
*   **Secure Secret Management**: Secrets are loaded via `getenv()` from cPanel's environment, avoiding insecure `.htaccess` storage.

## 2. Implementation: The Security Proxy
**File**: `infra/cpanel/proxy.php`
*   **Purpose**: Protects API keys by handling AI requests server-side.
*   **Function**: Frontend calls `proxy.php`, which appends `GEMINI_API_KEY` (stored safely in cPanel environment variables) and forwards to Google AI.
*   **Security**: Implements "Fail-Closed" logic—if the API key is missing, it returns a 500 error instead of leaking configuration or failing silently.

## 3. Implementation: The Deployment Scaffold
**File**: `infra/cpanel/deploy.sh`
This is a automated build and packaging tool for your local environment:
1.  **Reads**: `multiplic.json` to identify all sites and their paths.
2.  **Builds**: Each site locally using your modern Node.js/Vite environment.
3.  **Injects**: The PHP Proxy and a custom minimalist `.htaccess` into the build.
4.  **Packages**: Zips the results into `deploy_artifacts/`, ready for cPanel upload.

## 4. Configuration: multiplic.json
**File**: `multiplic.json`
*   Maintains the registry of sites, their paths, and target domains.
*   Validated against `infra/cpanel/multiplic.schema.json`.

## 5. Deployment Workflow
1.  **Configure API Key**: In cPanel, navigate to **Software → Select PHP Version → Options** or use the **Terminal** to set an environment variable named `GEMINI_API_KEY`.
2.  **Build Locally**: Run `bash infra/cpanel/deploy.sh` from the project root.
3.  **Upload Artifacts**: Take the `.zip` files from `deploy_artifacts/` and extract them into your cPanel `/home/citizen/public_html/` (or designated app) directory.
4.  **Verify**: The site should load immediately with clean SPA routing, and AI features will be proxied securely.

## 6. Deprecation Notice
The following legacy patterns are now deprecated in favor of the Hybrid Deployment Strategy:
*   `sites/aiistech/docs/hosting/DEPLOYMENT.md` (Legacy VPS-only)
*   `sites/aiistech/src/services/hosting/server/package.json` (Replaced by PHP Proxy)
*   `sites/aiistech/src/services/hosting/cli/package.json` (Replaced by `deploy.sh`)

---
*Last Updated: Thursday, May 21, 2026*

