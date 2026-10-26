# Wheelero context

Updated: 2026-10-26. User asked to remove backend storage, initially mentioned localStorage,
then preferred a larger local store. Decision: **IndexedDB for wheels/images/results;
localStorage for small preferences/drafts. No backend.** On 2026-10-26 the user subsequently
authorized GitHub setup/push to Nikolasgouz/wheelero and preparation for wheelero.com.

## Current implementation

- Existing React/TypeScript/Bun/Vite design/features preserved: PWA, 14 menu languages,
  12 templates, 1-10,000 entries, customization/images/sounds, no-repeat/restoration,
  local history, TXT/JSON backups, number/name/yes-no/team tools and public pages.
- No API client/requests. Bundled templates; Web Crypto draws. Sync controls, revisions,
  sessions and outbox fields removed from active frontend data.
- IndexedDB v10 migrates v1-v9 and retains the original record in legacy-backup/previous.
  Current record version 1 preserves IDs/configuration/history/removal jobs. An unfinished
  old server draw is reported, not fabricated. Historical SQLite is untouched.
- Writes publish after commit; quota failures preserve old data. Web Locks/BroadcastChannel
  coordinate tabs. Optimistic input edits retain caret and roll back failed writes.
- My wheels > Protect local storage calls navigator.storage.persist(); browser may refuse.
  JSON backups remain necessary; clearing browser data deletes local wheels.
- Sharing embeds versioned UTF-8/base64url in /#wheel=, with no uploads/history/other wheels.
  Recipient saves a new copy. Links are unencrypted and not revocable. Payloads above
  16,000 encoded characters use JSON files. Old ?share= links explain the change.
- Seven static routes plus 404/launch HTML, robots/sitemap/metadata/manifest/SW.
  PUBLIC_URL/PUBLIC_INDEXING are build-time inputs. No runtime Python.
- START_GYRNA.bat starts only Vite preview at localhost:4173/launch.html and stops any
  owned old backend on 8017. PWA updates preserve drafts and do not interrupt spins.
- Docker/Compose/Caddy serves static files. backend/ remains historical source/recovery;
  do not delete old DBs/volumes. Static hosting can replace a Droplet entirely.

## Important files

frontend/src/state/storage.ts: v10 migration, IndexedDB/recovery/quota handling.
state/store.ts: local transactions, draws, editing/removal/restoration and tab updates.
lib/sharing.ts: bounded/validated fragment links. App.tsx: storage/Share UI and spin timing.
types.ts: local/backup models. site.ts/scripts/pages.tsx/vite.config.ts: static SEO/404/PWA.
scripts/start-gyrna.ps1/public-preview.ps1: static launchers. Dockerfile/compose.yaml/
deploy/Caddyfile: optional static HTTPS hosting. backend/README.md: historical scope.

## Actual verification, 2026-10-26

- Bun typecheck/lint/build passed; 16 unit tests passed. PWA precaches 59 files (~2.4 MiB).
  Upstream Zod annotation warnings remain non-failing.
- Full Chromium E2E: **36 passed (3.7m)** against static hosting with backend 8017 stopped.
  Includes >5 MiB JSON import/persistence of three 10,000-entry wheels, quota-failure
  rollback, v1/v9 migration and original recovery record, no API traffic, fragment copies,
  offline reload/draws, customization/images/audio, result-pointer mapping, two-tab edits,
  cookie-independent storage, import/export and safe cross-tab PWA updates.
- Layout/keyboard/axe checks passed at 360/390/768/1440px in the full E2E run.
- START_GYRNA.bat lifecycle tested: builds and serves static files at 4173 without Python.
- Old Cloudflare tunnel expired (Tunnel not found). The static launcher was stopped and
  restarted successfully, verifying owned-process cleanup and exact Host allowlisting.
- New public HTTPS URL checked in Chromium: no API calls/session cookies, local draw,
  independent fragment recipient copy with no history, canonical URLs, real 404, offline
  yes/no draw and all four widths. Zero page errors. Historical Python preview stopped.
- Git diff whitespace check passed. These application checks preceded GitHub setup.

Verified temporary URL:
https://fuzzy-market-model-demonstration.trycloudflare.com
Keep PC awake/online; state/process IDs: ignored artifacts/public-preview.json.

## Limits / next steps

Docker/TLS hosting and physical iOS/Android installation remain unverified.
Operator identity/privacy contact and Pages/DNS administration access are not supplied.
The owner has configured DNS to GitHub Pages; public workflow status is now readable.
No purchases, permanent live deployment or store submission occurred.

Browser quota varies and is not unlimited. Persistent storage may be refused. Data is
origin-specific: JSON is the device/domain transfer mechanism. Old server-only uploads
are not accessible in the static app; historical files remain for operator recovery.
Android TWA/Bubblewrap and iOS Capacitor are separate future work.

## GitHub setup, 2026-10-26

- User supplied an SSH deploy key for https://github.com/Nikolasgouz/wheelero. Fixed its
  Windows ACL, verified GitHub's host key against official docs, ignored ssh_keys/.
  Key contents were never printed/committed. History/working-tree secret-pattern scan passed.
- Initially empty remote now has main, including the preserved earlier Git history and
  local-first application commit 7483620. Push and remote HEAD were verified over SSH.
- .github/workflows/pages.yml uses Bun 1.4.2 and pinned actions. Build/typecheck/lint/unit
  checks precede four browser shards with two workers each (eight total, user's final
  preference). The @exclusive PWA update test runs alone after every shard passes.
  All jobs use the same build artifact. Every push to main deploys only after all checks;
  PAGES_ENABLED is unused. PRs check only. Custom domain must be wheelero.com.
- Local Playwright defaults to eight workers; --workers=2 reduces local resource use.
  Sixteen overloaded this PC and were stopped; eight initially yielded 33 passes/two
  timing failures/one dependent test not run. The spin-lock test now pauses its clock
  while asserting controls, avoiding dependence on CPU speed. CI spreads eight workers
  over four machines instead of saturating one runner. GitHub reporter exposes failures
  as annotations; failure traces are uploaded with seven-day retention.
- GitHub run 40378516624 failed before deployment: 35 passes, PWA update test failed as
  Save & update stayed visible. The click now checks registration.waiting directly after
  flushing writes, handling activation by another tab without relying on a delayed event.
  Reload still requires explicit consent and waits until the wheel is idle.
- SSH key cannot administer Pages/DNS; no noninteractive GitHub API credential available.
  Owner manages Pages settings. No repository variable is needed. Public API now permits
  reading job status, but raw log downloads return 403 without an account token.
- Authoritative DNS now verifies all four Pages A records and www CNAME
  nikolasgouz.github.io, retaining dns1.papaki.gr/dns2.papaki.gr. No agent DNS changes made.
  HTTPS reaches GitHub with a valid certificate; before deployment it returns GitHub 404.
- This deployment pass: typecheck/lint/16 unit tests and production build passed;
  wheelero.com metadata/indexing/manifest/404 checked. All 36 Chromium E2E tests passed
  again (3.7m), including offline/mobile/storage/update checks. actionlint passed for
  the new workflow. After the update fix, typecheck/lint/build and five consecutive PWA
  regression runs passed. Full local rerun passed all 36 tests in 2.2m with two local
  workers. GitHub run 40381218184 passed three shards; the fourth stalled downloading
  Ubuntu 26 font packages from azure.archive.ubuntu.com (owner supplied log).
- CI now uses Ubuntu 24.04 runners and the official Playwright 1.64.1 Noble container
  pinned by verified OCI digest. It matches bun.lock and needs no apt/browser installation.
  New pushes cancel older runs on the same branch. actionlint passed; new CI/deployment
  verification is pending.
- Next: verify the new CI run, then HTTPS/custom domain/offline on the actual live site;
  add real operator contact. Do not purchase hosting or change visibility without instructions.
