# Wheelero

**One spin, one decision.** A static React/TypeScript/Bun/Vite website and offline PWA.
The current application has **no backend, API calls, server sessions or SQLite dependency**.

## Local storage

Wheels, images, customization, results and removed entries live in **IndexedDB** on the
user's device. This offers substantially more capacity than localStorage; the actual quota
depends on the browser/device. localStorage holds small preferences and editor drafts.
My wheels > Protect local storage requests persistent storage where supported. The browser
may decline; even a grant cannot protect data from the user clearing browser storage.

Old browser databases migrate to IndexedDB v10. The migration retains a recovery copy of
the previous record. No names are uploaded. Existing server-only records are not fetched
or erased. The historical backend and ignored SQLite files remain on disk for recovery.

Use **Export JSON** for backups or moving between devices/domains. Import validates the
file and preserves customization/images/history. TXT result export works in Notepad.
Do not clear browser site data without a backup.

## Features

- 1-10,000 entries per wheel, inline editing, Excel/line paste, shuffle/sort, duplicates,
  templates, saved wheels, no-repeat rounds, result history and restoration of winners.
- Unbiased Web Crypto selection, pointer/result agreement, optional sound, themes/images,
  customizable duration, fullscreen, keyboard support and reduced motion.
- Name picker, yes/no, number-range and balanced-team tools, plus About, Privacy and FAQ.
- Share a copy in a URL fragment, without uploading it. History/other wheels are excluded.
  Links cannot be revoked. Wheels exceeding the 16,000-character payload limit use JSON
  files instead. Some messaging apps may truncate long links; JSON is the reliable option.
- Pre-rendered HTML, canonical/OG metadata, robots, sitemap, original icons/social image,
  actual 404 handling and installable/offline PWA.

## Install and run

Requires Bun 1.4.2+ and a modern browser. Python is not needed for the current app.

```powershell
cd frontend
bun install --frozen-lockfile
bun run dev
```

Development URL: http://localhost:5173. For the production-style local preview, double-click
**START_GYRNA.bat** in the project root. It builds and starts only the static frontend on
http://localhost:4173/launch.html. STOP_GYRNA.bat stops its owned processes. Existing filenames
and browser origin stay unchanged to preserve shortcuts and local data. The launcher also
stops the old project backend if it is still listening on 8017; it never restarts Python.

Manual preview:

```powershell
cd frontend
bun run build
bun run preview --port 4173 --strictPort
```

`launch.html` bypasses stale PWA navigation caches. Normal browsing/PWA start uses `/`.
Use Save & update in old installed tabs; close old tabs if the storage upgrade requests it.

## Static production build

Only copy `.env.example` to `.env` if no local configuration exists. Build settings:

| Variable | Purpose |
| --- | --- |
| PUBLIC_URL | Final HTTPS origin, used at build time for canonical URLs/OG/sitemap |
| PUBLIC_INDEXING | false for previews, true after final domain verification |
| SITE_HOST | Optional Docker/Caddy hostname; must match PUBLIC_URL |

```powershell
$env:PUBLIC_URL = 'https://wheelero.com'
$env:PUBLIC_INDEXING = 'true'
cd frontend
bun run build
```

Use wheelero.com only after confirming ownership/DNS. Upload **frontend/dist/** to static
hosting. No secrets belong in build variables. Static hosting can replace a Droplet entirely.
Alternatively, the included Docker/Caddy deployment serves files and HTTPS only; it contains
no Python process or application database. See [deployment](docs/deployment.md).

Source: [Nikolasgouz/wheelero](https://github.com/Nikolasgouz/wheelero). The GitHub Actions
workflow automatically checks, builds and deploys after each push to `main`, including
merged pull requests. Failed checks prevent deployment; pull requests only run checks.
No `PAGES_ENABLED` variable or manual workflow run is required. A local commit must be
pushed to GitHub to trigger deployment. The owner must first enable GitHub Pages with
GitHub Actions and set its custom domain to wheelero.com. Exact steps and Papaki DNS
records are in the deployment guide. SSH access alone cannot configure Pages or DNS.

## PWA

Use Install when offered, or the browser install menu. On iPhone/iPad: Safari > Share >
Add to Home Screen. Wait for Ready to use offline before testing without internet.
Save & update waits for local writes and is disabled during spins; activation from another
tab never forces a mid-spin reload. This is not App Store/Google Play publication.

## Checks

```powershell
cd frontend
bun run typecheck
bun run lint
bun run test
bun run build
bun run e2e
```

Install Chromium if needed with `bunx playwright install chromium`. E2E starts only the
static preview. Independent E2E tests run with 8 workers. The @exclusive service-worker
update test runs alone after they pass, because it temporarily modifies dist/sw.js.
Do not build during E2E. Override locally with `bun run e2e --workers=2` when needed.
GitHub uses four parallel shards with two workers each (eight total), then the isolated
PWA update check. Deployment waits for all checks; failures include annotations/traces.
Actual results/limitations are in [PROJECT_CONTEXT](PROJECT_CONTEXT.md).

## Public preview

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/public-preview.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/public-preview.ps1 -Stop
```

The temporary Cloudflare URL requires this PC awake/online. Its state is in ignored
artifacts/public-preview.json. No database is created. Restarting the tunnel changes the
origin; export JSON before moving between origins.

The `backend/` folder is historical and excluded from deployment. Its old tests and SQLite
backup script are retained for recovery; they are not part of the current runtime checks.
GitHub publication setup and domain requirements are documented in docs/deployment.md.
