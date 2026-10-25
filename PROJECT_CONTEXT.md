# Γύρνα. — context

Last updated: 2026-10-25. Larger wheel with Entries/Results sidebar implemented and verified.

## Product and current UI

Greek anonymous decision spinner, responsive installable PWA. FastAPI/SQLAlchemy/Alembic/
SQLite backend; React/TypeScript/Vite/Bun frontend. Up to 10,000 entries, templates,
multiple wheels, history/no-repeat, JSON backups, revocable public snapshots, offline
editing/draws, conflict copies and uncertain-request recovery. No accounts or deployment.

Home now has a wheel up to 760px and an Entries/Results sidebar on the right (>=1024px).
Below 1024px the sidebar sits underneath; on phones the wheel section uses compact flow.
Entries support edit/add/delete with 100-row pagination, shared autosave and draw locks.
Results show source/time, recent/all history and become selected after a completed draw.
Options remains a separate full editor with Customize, sharing and templates. Both entry
editors use distinct labels/draft keys and preserve incomplete input while hidden.

Customize has three transactional tabs: During spin / After spin / Appearance. Settings
include duration/visibility, 8 built-in spin sounds and 8 result sounds, volume/preview,
popup/confetti/winner actions, durable auto-removal, palettes/images/text/shadow/borders.
Global mute and reduced motion take precedence. Settings and private images survive
refresh, sharing, copies, JSON and offline sync. See docs/customization.md for parity.

## Architecture and important files

- `START_GYRNA.bat`, `STOP_GYRNA.bat`, `scripts/start-gyrna.ps1`: always build, verify
  listener ownership, restart only this project, migrate and launch hidden servers.
  Open `/api/launch` (backend/app/main.py) for latest no-store HTML, bypassing stale PWA
  navigation caches on the same origin. No browser storage deletion or forced tab reload.
- `backend/app/routes.py`, `schemas.py`, `security.py`: revisioned API, validation,
  ownership/CSRF/Origin checks. `/docs` is generated OpenAPI documentation.
- `models.py`, `database.py`, `migrations/`: SQLite WAL/foreign keys, serialized writes;
  DB dependencies commit before success responses. No startup table creation.
- `customization.py`: version 1 configuration/raster validation. Migration c72f1a9e4b02
  preserves old wheels/results/shares. New sound enum values need no SQL/schema migration.
- `services.py`: secure server RNG and immutable result snapshots.
- `frontend/src/state/store.ts`, `storage.ts`: IndexedDB v2, revisions/UUID outbox,
  Web Locks/BroadcastChannel, conflict copies and durable ID-based winner removal.
  Removal jobs follow conflict/session-loss copies and share the manual removal path.
- `lib/random.ts`, `geometry.ts`, `presentation.ts`: independent RNG, geometry and visual
  projection of at most 1,000 entries. All eligible entries retain their probability;
  the displayed wheel always contains the winning ID.
- `components/WheelSidebar.tsx`: home entries and history; `screens/Editor.tsx`: full editor.
- `components/Customize.tsx`, `ImagePicker.tsx`, `Wheel.tsx`: draft settings, bounded
  uploads and renderer. OK waits for uploads and local durable storage.
- `customization.ts`, `customization.i18n.ts`, `i18n.ts`: schemas/defaults and Greek labels.
- `lib/audio.ts`: original local sound scores, finished nodes released while looping.
  `scripts/generate-gallery.mjs`: three original bundled WebP images.
- `App.tsx`, `styles.css`: UI flow/layout; `vite.config.ts`: prompt-update PWA with
  shell/fonts/gallery precache. Private APIs never enter service-worker caches.

Private images are embedded PNG/JPEG/WebP or known gallery paths. Uploads <=10 MB become
<=1024px/512 KB; wheel schema <=8 MB UTF-8; archives <=100 MB. No-repeat allows a last
single entry after removals if history exists; a new one-entry draft cannot draw.
Client/imported results remain explicitly offline. Cookie loss copies local work to a
new isolated workspace; no cross-device recovery.

## Actual verification

Sidebar work: TypeScript, ESLint and production build passed (24 precached assets).
Full browser run: 28 passed, 2 timed out during bulk-input/mobile navigation. A targeted
rerun passed all 6 checks (both timeouts and all four responsive sizes) after compacting
phone spacing. All 30 distinct E2E cases therefore passed across these runs, including
sidebar edit/add/delete, draw locking, automatic Results selection, refresh persistence,
offline sync and real PWA updates. No timeout increases or backend changes were needed.
Screenshots inspected at 360/390/768/1440px; no horizontal overflow. At 1440x900 the
wheel stage increased from 440px to 580px; at 768x1000 it measures 680px.

- Latest backend run (2026-10-25, before sidebar-only work): 41 pytest passed in 23.96 s;
  Alembic check passed. Includes ownership, validation, old migration, process restart,
  idempotency/shares, 10,000-entry eligibility and no-repeat exhaustion.
- Unit baseline (2026-10-24): 10 passed, 6,600 projection and 20,100 geometry cases.
- Previous browser baseline: 30 E2E passed for simplified home; 9 targeted checks passed
  after adding all 16 sounds and centering, including audio graph, mute/stop/persistence.
- Launcher verified via cmd.exe: build, migration, startup, stop and browser-open command.
  Chromium cache test showed an old cached root page but current `/api/launch`, preserving
  private data and exposing all sounds. Probes use 127.0.0.1 to avoid PowerShell IPv6 timeout;
  browser URL stays localhost. Physical double-click/profile behavior is not automated.

## Limits and next steps

Smaller original sound/image/theme collections than Wheel of Names; no Unsplash.
Duplicate collapse affects display only. Above 48 entries use numbered sectors and a
full-name legend. Animation/size proportions and native color picker are ours.
Human listening, real screen-reader use and physical iOS/Android installation/keyboard/
safe-area checks remain next. Large archives load in memory; history quotas/pagination
remain future work. Starlette/httpx and two Rollup/Zod annotation warnings are upstream.
Before public hosting: HTTPS/Secure cookie, exact origins, persistent SQLite, backups and
hosting rate limits. Accounts/live rooms/payments/AI/app stores stay outside this version.

## Run and continue

Double-click START_GYRNA.bat; STOP_GYRNA.bat stops its hidden servers. Logs are in ignored
artifacts/launcher-*.log. Latest-build URL: http://localhost:4173/api/launch.
Normal PWA entry: http://localhost:4173. Backend port 8017 (8000 is another project), dev
frontend 5173. No Windows service, remote push or public deployment was installed.
Keep schemas aligned, add migrations for structural changes and update docs with actual
results. AGENTS.md and README contain stable conventions and exact commands.
