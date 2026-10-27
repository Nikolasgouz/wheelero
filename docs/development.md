# Development

Use Bun for dependencies/scripts; preserve bun.lock. The active app is static React/TS.
Run bun install --frozen-lockfile, bun run dev from frontend/. No Python environment or
database migration is needed. START_GYRNA.bat builds and starts Vite preview at localhost:4173.
It stops only verified project listeners; unrelated processes/data are left alone.

Checks from frontend/: typecheck, lint, test, build, e2e. Playwright starts only Vite preview.
The browser project runs independent tests fully parallel with 8 workers, as requested.
The service-worker-update project depends on browser and runs @exclusive tests with one
worker, preventing shared dist/sw.js changes while other tests run. Each browser test
retains its own isolated context/storage. Use `bun run e2e --workers=2` for a smaller run.
GitHub CI distributes eight browser workers across four jobs (two per shard), avoiding
eight Chromium processes competing on one runner. PWA checks wait for every shard.
CI emits GitHub test annotations and keeps failure traces for seven days.
Browser jobs use the official Playwright 1.64.1 Noble container pinned by digest, matching
bun.lock, with browsers/system dependencies preinstalled. Update the image together with
Playwright dependency upgrades. New pushes cancel older workflow runs for the same branch.
The container bootstraps Bun with npm's global Bun package, avoiding setup-bun's unzip
requirement on a cache miss; all frontend dependencies and scripts still use Bun.
Do not rebuild while the worker-update test runs: it temporarily changes dist/sw.js and
restores it in finally. Browser emulation does not validate real iOS/Android installation.

## Storage changes

Keep the existing IndexedDB name. Bump its version and implement a transactionally safe
migration when changing stored schema. Keep backups/import validation aligned. Never reset
stored wheels to change the default example. Preserve entry IDs/images on edits/reordering.
Do not add API requests or hidden cloud sync: local-only storage is an explicit user choice.

The usability/Classroom commit was reverted at the user's request on 2026-10-27. Preserve
the earlier interface. IndexedDB v12 is intentionally newer than both UI revisions: it
captures v10/v11 in before-usability-rollback before restoring the original wheel shape.
Do not downgrade the openDB version or delete user data to match older frontend code.

store.ts is the only writer for wheels. Use Web Locks and write before publishing success;
surface quota errors without losing the previous saved record. Recovery backup export is
available on startup errors. Small language/theme/sound/editor preferences use localStorage.

Customization drafts stay temporary until OK completes a durable write. Preserve result
timing, pointer agreement, global mute, reduced motion and the pre-spin sidebar snapshot.
Keep input/toolbar changes locked during a draw. TXT exports include numbered winner names,
UTF-8 BOM and CRLF, with no dates/source labels; JSON preserves full history metadata.

## Public pages and links

src/site.ts owns public content. scripts/pages.tsx emits HTML before Workbox. PUBLIC_URL and
PUBLIC_INDEXING are read at build time; build again after changing them. New routes need
matching static output, PWA allowlist and useful functionality/content. Keep real 404s.

Share links embed validated payloads in a fragment. Do not send the fragment to a service,
claim encryption or offer revocation. Large payloads use JSON export. Keep bundled assets
local with their licenses. Existing fourteen-language menus remain; editorial copy is English.

Update README/PROJECT_CONTEXT/docs before handoff. Keep backend/ and ignored historical
databases intact for recovery. The user authorized GitHub pushes and automatic deployment
on main. Preserve the checks before deployment; never commit secrets or local data.
