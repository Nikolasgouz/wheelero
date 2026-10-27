# Working in Wheelero

The user chose local browser storage and no backend. Keep React/TypeScript, Bun/Vite and
the existing design. Wheels/images/results use IndexedDB v12; small preferences/drafts
use localStorage. No network APIs/cloud sync. Historical backend/SQLite files stay intact
for recovery and are excluded from deployment.

Keep code simple, readable and focused. No broad exception handlers, silent failures,
unnecessary normalization/type guards, compatibility shims or speculative parameters.
Validate external inputs at boundaries; keep internal invariants explicit. Inline trivial
single-use helpers. Python lines <=100 chars if modifying historical tooling.
Do not add tests unless requested; storage/draw/import tests were explicitly requested
for this project. Update obsolete API expectations to actual local behavior.

English default with fourteen-language menus (locale.ts/locales/*.json). Preserve Wheelero
branding, user content and local asset licenses. Editorial content is in src/site.ts.
Keep one H1 and meaningful functionality per public page. No trackers.

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
Customization drafts save only on OK; timed removals use IDs. New PWA workers activate
automatically without reloading open pages. Reloading an open editor requires this tab's
action and completed writes; never interrupt a spin. Normal navigation fetches HTML with
HTTP revalidation and precached offline fallbacks, not a permanently cached homepage.

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
Update README/PROJECT_CONTEXT/docs before handoff. Remove unnecessary defensive code,
trivial helpers and unused parameters before finishing.

Latest user request (2026-10-27): revert the whole usability/classroom/localization commit
4f791de to b35e19f behavior, including the earlier wheel layout. Do not keep Classroom or
expanded public-copy translations from that commit. Preserve browser data via IndexedDB
v12 migration: snapshot v10/v11 before restoring the original wheel shape. Do not reopen
v10 on an upgraded v11 database. Do not reset/delete existing user data. Commit/push this
rollback using the existing main-branch deployment workflow; no force push or DNS changes.
Follow-up: fix stale normal-URL navigation while retaining that rollback and all local data.
