# Working in Wheelero

The user chose local browser storage and no backend. Keep React/TypeScript, Bun/Vite and
the existing design. Wheels/images/results use IndexedDB v11; small preferences/drafts
use localStorage. No network APIs/cloud sync. Historical backend/SQLite files stay intact
for recovery and are excluded from deployment.

Keep code simple, readable and focused. No broad exception handlers, silent failures,
unnecessary normalization/type guards, compatibility shims or speculative parameters.
Validate external inputs at boundaries; keep internal invariants explicit. Inline trivial
single-use helpers. Python lines <=100 chars if modifying historical tooling.
Do not add tests unless requested; storage/draw/import tests were explicitly requested
for this project. Update obsolete API expectations to actual local behavior.

English default with fourteen-language UI/content (locale.ts/locales/*.json). Preserve Wheelero
branding, user content and local asset licenses. Editorial content is in src/site.ts.
Keep one H1 and meaningful functionality per public page. No trackers.
Translate application copy in all thirteen catalogs; preserve placeholders. Never translate
stored user content. Localize templates only when displaying or creating a new wheel.

## Commands

From frontend/: bun install --frozen-lockfile; bun run dev.
Checks: bun run typecheck; bun run lint; bun run test; bun run build; bun run e2e.
Production preview: bun run preview --port 4173 --strictPort.
START_GYRNA.bat builds/opens localhost:4173/launch.html without Python. STOP_GYRNA.bat
stops verified owned processes. Legacy 8017 listeners are stopped, never restarted.
Do not kill unrelated processes or clear browser data to update.

## Storage/PWA invariants

Keep IndexedDB name gyrna. Schema changes need versioned migrations and recovery data.
Commit writes before publishing success; quota errors must retain previous data. Use
Web Locks/BroadcastChannel for multiple tabs. Never invent old pending server results.
Web Crypto chooses winners without bias. Display projection never changes eligibility;
land on the winning entry ID and reveal results only after animation. Lock editing,
customization/sound/fullscreen during draws. Respect reduced motion and global mute.
Customization drafts save only on OK; timed removals use IDs. PWA workers activate
automatically. Each tab reloads only after three idle seconds and completed writes;
never during a spin, focused editing, open dialog, fullscreen presentation or storage error.
Preserve per-tab view/tool drafts through automatic reload; do not restore a manual update button.
Classroom absence uses stable entry IDs separately from no-repeat active flags. New rounds
reset active flags, never attendance. Backups/copies retain attendance; class share links
include the whole roster but omit attendance/progress. Keep old version-1 imports valid.
Workspace sizing uses actual header/toolbar height on desktop; keep small-screen scrolling.

Share links embed unencrypted snapshots in fragments, excluding history/other wheels.
Validate/cap payloads, explain no revocation, use JSON for large wheels. Preserve backup
identifiers/versions. Keep source='server' on historical results; new draws are local.

## Delivery

scripts/pages.tsx emits HTML/robots/sitemap/404 before Workbox. PUBLIC_URL/PUBLIC_INDEXING
are build-time settings; previews are noindex. Do not assume domain ownership. Docker/
Caddy serves static files only. Do not build during E2E's worker-update regression.
Keep lockfiles and .env.example; never commit secrets, databases, dependencies, builds
or screenshots. The user authorized setup/push to Nikolasgouz/wheelero and preparation
for wheelero.com on 2026-10-26. Keep SSH keys ignored; never commit credentials or change
repository visibility without authorization. Hosting/DNS access must be verified.
Existing preview management is documented in docs/deployment.md.
Current authorization (2026-10-27): the user approved committing and pushing the reviewed
localization/usability changes to GitHub. Pushes to main trigger the existing verified
deployment workflow. Do not change hosting, DNS or purchase services as part of this release.
Update README/PROJECT_CONTEXT/docs before handoff. Remove unnecessary defensive code,
trivial helpers and unused parameters before finishing.
