# Static deployment

Wheelero now requires static file hosting only. There is no application backend, server
database, session cookie, API proxy or background worker to deploy. GitHub can hold the
source; GitHub Pages or another static host can serve the built files. A Droplet is optional.

Production is live at **https://wheelero.com**. GitHub run
[40383010819](https://github.com/Nikolasgouz/wheelero/actions/runs/40383010819) passed build,
all four browser shards, the isolated PWA update check and deployment on 2026-10-26.
Live Chromium checks passed for local spin, fragment sharing, no API/cookies, offline
reload/draw, canonical metadata, real 404 and layouts at 360/390/768/1440px. Both HTTP
and https://www.wheelero.com redirect to the HTTPS apex. Physical installs remain untested.

Localization/classroom/usability release 4f791de was verified live after successful run
40474293357 on 2026-10-27, including Greek lower-page content at the normal root URL.
The automatic-update follow-up removes mandatory confirmation: new workers activate and
each tab safely reloads when idle. Already-running old clients need one normal refresh or
close/reopen to load that policy. Never ask users to clear IndexedDB/site data to update.

## Build for the real origin

After confirming ownership of the domain, set PUBLIC_URL=https://wheelero.com and
PUBLIC_INDEXING=true, then run from frontend/:

```sh
bun install --frozen-lockfile
bun run build
```

Upload the contents of frontend/dist, including route directories, 404.html, robots.txt,
sitemap.xml, manifest, worker and assets. Serve directory index files and a genuine 404
status for unknown paths; avoid a blanket SPA rewrite to index.html. Use HTTPS for Web
Crypto/PWA. Set sw.js and HTML to revalidate rather than caching them indefinitely.

PUBLIC_URL is built into metadata, not replaced by a server. Keep PUBLIC_INDEXING=false
for temporary previews. Local builds can leave PUBLIC_URL empty (relative metadata).
The user supplied wheelero.com as the intended domain. No registrar/DNS changes or
domain purchase have been performed by this work.

## GitHub Pages setup

Source repository: https://github.com/Nikolasgouz/wheelero, branch `main`.
`.github/workflows/pages.yml` installs locked dependencies with Bun 1.4.2, runs typecheck,
lint, 20 unit tests and production build. Four parallel browser jobs each run two workers
(eight total) against the same build artifact, split into four shards. The service-worker
update regression runs alone after all four jobs pass. Only then can Pages deploy. Only
frontend/dist is uploaded; historical Python code, keys and local data are not deployed.
Browser jobs use a digest-pinned Playwright 1.64.1 Noble image matching bun.lock. This
avoids apt downloads from the Azure Ubuntu mirror, which stalled an earlier run.
Runner OS is pinned to Ubuntu 24.04. New pushes replace older runs on the same branch.
Actions are pinned to verified commit SHAs. Every push to main (including a merged pull
request) automatically runs checks and deploys only if they all pass. Local commits need
to be pushed first. Pull requests run checks without deployment. Manual runs remain
available, but deployment/artifact upload is restricted to main.

The provided SSH deploy key authenticates to this repository only. It cannot change
Pages settings, repository variables, account plans or registrar DNS. No noninteractive
GitHub API credential was available. Complete these settings using the owner account:

1. Repository Settings > Pages > Build and deployment > Source: **GitHub Actions**.
2. Set **Custom domain: wheelero.com** in Pages. The build uses root-relative URLs,
   so the default `/wheelero/` project URL is not a substitute for this custom domain.
   With Actions deployment, a CNAME file does not configure the domain.
3. No repository variable is required. The former `PAGES_ENABLED` gate has been removed;
   any existing variable with that name is unused and may be deleted.
4. Push to `main` to deploy automatically. To retry after fixing Pages/DNS settings,
   use Actions > Verify and deploy Wheelero > Run workflow on `main`.
5. Once GitHub accepts the domain, set DNS below, wait for validation/certificate
   provisioning, then enable **Enforce HTTPS** in Pages. Verify the actual HTTPS site.

GitHub Pages requires a public repository on GitHub Free, or an eligible paid plan for
a private repository. Repository visibility has not been changed. Do not buy a plan or
make private source public automatically. If unavailable, use the included static Caddy
deployment on an existing Droplet instead; its IP/server access would be needed.

### DNS at Papaki

Verified 2026-10-26 after the owner's DNS changes: nameservers remain `dns1.papaki.gr`
and `dns2.papaki.gr`; apex A now has the four GitHub Pages addresses below and www has
the correct GitHub CNAME. HTTPS serves Wheelero after the successful deployment above.
**Keep the existing nameservers** and these records:

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | nikolasgouz.github.io |

Preserve unrelated email/MX/TXT records. Remove conflicting old website A/AAAA/CNAME
records only at the apex/www. No registrar credentials were supplied, so none were
changed. The GitHub Pages addresses above do not apply to a DigitalOcean Droplet.
Optional domain verification under GitHub account Settings > Pages provides a
user-specific TXT value; use the actual value GitHub displays, never invent one.

References: [GitHub custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site),
[Actions deployment](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Optional DigitalOcean / Docker / Caddy

On an existing host, create an untracked root .env with SITE_HOST=wheelero.com and
PUBLIC_INDEXING=true after DNS points to that host. Then:

```sh
docker compose config
docker compose up -d --build
```

The image builds with Bun, then Caddy serves /srv with HTTPS. Only certificate/config
volumes persist; there is no SQLite volume. Do not delete any old wheelero_data volume:
it may contain historical server uploads. Docker/TLS execution remains unverified here
because Docker/host/DNS access is unavailable. Review the image on the target host.

## Existing public preview

scripts/public-preview.ps1 builds for its temporary Cloudflare URL and starts a static
Vite preview on 127.0.0.1:8018. It no longer creates/migrates SQLite or starts FastAPI.
It adds only that exact hostname to Vite's allowed hosts; arbitrary hosts remain blocked.
The script can stop previously recorded Python preview processes during transition.
Local START/STOP scripts control only localhost:4173 and any old owned 8017 listener.
Keep the PC awake/online; restarting the tunnel changes its origin.
The previous tunnel expired on 2026-10-26 and was replaced. The current verified URL is
https://fuzzy-market-model-demonstration.trycloudflare.com (see PROJECT_CONTEXT for checks).

## Data and backups

Wheels belong to each browser's IndexedDB. User JSON export/import is the backup and
device/domain transfer mechanism. IndexedDB v10 preserves a recovery record when upgrading
old installations. Persistent storage requests reduce eviction risk when granted but do
not prevent user deletion. No new server backups of names are needed or performed.

Historical backend/SQLite files are untouched. scripts/database.py remains available for
consistent historical backup/restore into a new file, never over a live database. Existing
server-only links will not resolve in the static app; ask their author for a JSON/new link.

Remaining publication details: add real operator identity/privacy contact to About/Privacy.
The privacy text identifies GitHub Pages hosting. Canonical URLs, 404, sharing and offline
reload have been verified live; installation on physical devices remains to be checked.
Browser data does not transfer automatically between domains.
