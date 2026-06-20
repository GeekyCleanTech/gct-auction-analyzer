# GCT Auction Buy Analysis

Interactive dashboard for analyzing SD Surplus Auction lots — filter by verdict (GCT Yay / Conditional / Pass), browse by category, search, and expand rows for market value, notes, and ROI verdicts.

Built with **React 18 + Vite**. Deploys to **Cloudflare Pages**.

## Local development

```bash
npm install
npm run dev
```

Open the printed local URL (default http://localhost:5173).

## Production build

```bash
npm run build      # outputs static files to dist/
npm run preview    # preview the production build locally
```

## Deploy to Cloudflare Pages

### Option A — Wrangler CLI (direct upload)

```bash
npm run deploy
```

This runs `vite build` then uploads `dist/` via `npx wrangler pages deploy`.
The first run opens a browser to authenticate with your Cloudflare account and,
if the project does not exist yet, creates one named `gct-auction-analyzer`.

### Option B — Connect a Git repository (recommended for CI)

1. Push this folder to a GitHub/GitLab repo.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**.
3. Use these build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Save and deploy. Every push triggers a new build.

## Project structure

```
index.html          # Vite entry HTML
src/main.jsx         # React entry point
src/App.jsx          # The auction analysis dashboard component
src/index.css        # Base style reset
public/_redirects    # SPA fallback for Cloudflare Pages
vite.config.js       # Vite + React plugin config
```
