# Multiplic

**A High-Performance Multi-Site Deployment.**

Multiplic is a platform designed for deploying multiple high-performance React/Vite and Angular applications. It is optimized for **cPanel Hybrid Deployment**, leveraging a "Static-First" architecture that bypasses server-side Node.js dependencies in favor of native Apache performance and secure PHP-based AI proxying.

---

## 🚀 Deployment Strategy: cPanel Hybrid

We utilize a **Hybrid Deployment Strategy** (see [ADR 0015](docs/adr/0015-cpanel-hybrid-deployment.md)) specifically designed for cPanel environments:

1.  **Static-First**: Build sites locally/CI and deploy static assets. Zero Node.js overhead on the server.
2.  **Security Bridge**: Sensitive API calls (like Google Gemini) are handled via a server-side PHP proxy (`proxy.php`).
3.  **Minimalist Apache**: SPA routing is handled by a super-minimal `.htaccess` to avoid shared-hosting 500/403 errors.

---

## 🛠️ cPanel Setup Instructions

### 1. Configure Secrets
Do **not** put API keys in `.htaccess`.
- Go to **cPanel → Software → Select PHP Version → Options**.
- Set an environment variable: `GEMINI_API_KEY = your_secret_key_here`.
- Alternatively, if your host supports it, use the **Terminal** or a `.env` file located *above* your `public_html` directory.

### 2. Build & Package (Local Machine)
Ensure you have Node.js 20+ and `jq` installed locally.
```bash
# From the project root
bash infra/cpanel/deploy.sh
```
This script will:
1. Build all sites defined in `multiplic.json`.
2. Inject the `proxy.php` security bridge.
3. Apply the minimal `.htaccess` template.
4. Create `.zip` artifacts in `deploy_artifacts/`.

### 3. Upload to cPanel
- Upload the generated `.zip` files to your cPanel File Manager.
- Extract them into your target domain's document root (e.g., `/public_html/` or a subdirectory).

---

## 📂 Repository Layout

```
multiplic/
├── multiplic.json          # Site registry (name, path, domain)
├── infra/cpanel/           # cPanel-specific deployment tools
│   ├── deploy.sh           # Automated build & packaging script
│   ├── proxy.php           # PHP-based Gemini API Security Bridge
│   └── .htaccess.template  # Super-minimal SPA routing template
├── sites/                  # Source code for all websites
├── docs/                   # Documentation & Architectural Records
│   ├── adr/                # cPanel Hybrid Deployment
│   └── Multiplic-cPanel-Integration.md  # Detailed Integration Guide
└── .github/workflows/      # CI/CD pipelines (Build & Test)
```

---

## 🧪 Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Run a specific site locally
cd sites/citizen-gardens
npm run dev

# 3. Test cPanel integration locally
# Ensure you have a local PHP server if testing proxy.php
```

## 📝 Documentation

- [cPanel Integration Guide](docs/Multiplic-cPanel-Integration.md)
- [ADR 0015: Hybrid Deployment](docs/adr/0015-cpanel-hybrid-deployment.md)
- [Legacy Architecture](docs/ARCHITECTURE.md) (Note: VPS/Node-server focused)

---
*Last Updated: May 28, 2026*
