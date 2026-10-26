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
Domain/hosting ownership and operator/privacy contact are not supplied.
No purchases, permanent deployment or store submission occurred.

Browser quota varies and is not unlimited. Persistent storage may be refused. Data is
origin-specific: JSON is the device/domain transfer mechanism. Old server-only uploads
are not accessible in the static app; historical files remain for operator recovery.
Android TWA/Bubblewrap and iOS Capacitor are separate future work.
