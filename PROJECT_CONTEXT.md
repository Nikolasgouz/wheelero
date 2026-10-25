# Γύρνα. — context

Last updated: 2026-10-25. Home simplified; customization moved to Options.

## Product and implemented scope

Greek anonymous decision spinner, responsive installable PWA. FastAPI/SQLAlchemy/Alembic/
SQLite backend; React/TypeScript/Vite/Bun frontend. Includes editing/reordering/bulk input,
templates, multiple wheels, history/no-repeat, JSON backups, revocable public snapshots,
offline editing/draws, conflict copies and uncertain-request recovery. Supports 10,000
entries; display projects at most 1,000 without changing eligibility or winning ID.

Customize has During spin / After spin / Appearance tabs, temporary drafts, durable OK,
cancel, independent audio/preview/volume, duration/slow motion, duplicates/title visibility,
result popup/message/actions, confetti/animation, durable automatic winner removal,
palettes/themes, full-wheel/center/per-entry images, text policies, borders/shadow and
presentation background/gradient. Global mute and reduced motion take precedence.
Configuration/images survive refresh, copies, sharing, JSON and offline synchronization.
Reference inspection, feature mapping and deliberate differences: `docs/customization.md`.

The home screen now centers the wheel and spin button, with collapsed history. Editing,
templates, save/share and the Customize button live in Options on desktop and mobile.
The marketing intro, beta badge and redundant footer copy were removed. Offline status
and PWA install/update controls remain available. Hidden editor state stays mounted.

## Architecture and important files

- `backend/app/routes.py`, `schemas.py`, `security.py`: atomic revisioned API, validation,
  ownership/CSRF/Origin checks. `/docs` provides generated OpenAPI documentation.
- `models.py`, `database.py`, `migrations/`: SQLite WAL/foreign keys, serialized writes;
  DB dependencies commit before success responses. No startup table creation.
- `customization.py`: version 1 configuration and bounded raster validation. Migration
  `c72f1a9e4b02` preserves old wheels/results/shares and adds defaults/images/new limits.
- `services.py`: secure server RNG; immutable result snapshots survive entry removal.
- `frontend/src/state/store.ts`, `storage.ts`: IndexedDB v2, revisions, UUID outbox,
  Web Locks/BroadcastChannel, conflict/session-loss copies and durable removal jobs.
  Jobs follow conflict copies; manual and automatic removal share an atomic ID-based path.
- `lib/random.ts`, `geometry.ts`, `presentation.ts`: separate RNG, geometry and display
  projection. The projected wheel always contains the backend-selected entry ID.
- `components/Customize.tsx`, `ImagePicker.tsx`, `Wheel.tsx`: transactional settings,
  bounded uploads, actual renderer. OK waits for uploads and local durable storage.
- `customization.ts`, `customization.i18n.ts`: frontend schema/defaults and Greek labels.
- `lib/audio.ts`: original procedural sounds; `scripts/generate-gallery.mjs`: three
  original bundled WebP images. No third-party recordings or copied reference assets.
- `App.tsx`, `screens/`: application flow; `vite.config.ts`: prompt-update PWA with
  shell/fonts/gallery precache. Private APIs are never cached by the service worker.

Private images are embedded PNG/JPEG/WebP or known gallery paths, not public uploads.
Uploads <=10 MB become <=1024px/512 KB; wheel payload <=8 MB UTF-8; archives <=100 MB.
No-repeat allows a last single entry after winner removal if the wheel already has history.
A new one-entry draft cannot draw. Client/imported results remain explicitly offline.
Cookie loss copies local work to a new isolated workspace; no cross-device recovery.

## Actual verification

2026-10-25 layout change: TypeScript, ESLint and production build passed. All 30 existing
E2E scenarios passed with the new navigation (2.9 minutes). Home screenshots inspected
at 360/390/768/1440px and Options at mobile/desktop sizes, without horizontal overflow.
Responsive checks now also verify hidden editor/templates on home and Options-to-Customize.

- Backend (2026-10-24; unchanged by layout work): 41 pytest passed (12.56 s), including
  ownership, invalid configurations/images,
  migration from the old DB, persistence across process restart, idempotency, sharing/
  revocation, 10,000-entry eligibility and last-entry no-repeat. Alembic check passed.
- Frontend: TypeScript, ESLint and production build passed; 24 PWA precache entries,
  approximately 903 KiB. Unit tests (2026-10-24): 10 passed, including 6,600 projection/winner cases
  and 20,100 original geometry positions.
- Full Chromium production-PWA E2E (2026-10-25): 30 passed together in 2.9 minutes. Covers all
  customization tabs, cancel/refresh, real audio graph/volume/mute, image uploads,
  legacy IndexedDB, copies/JSON/shares, offline/resync, automatic/manual removal and
  conflict copies, 1,000 visible entries, palette/sizes/presentation, cookie loss,
  lost draw responses and actual waiting-service-worker update without lost editor work.
- Keyboard, reduced motion and axe WCAG A/AA scans passed at 360/390/768/1440px;
  screenshots at all four widths and dark mode inspected in ignored `artifacts/`.
- Python lines <=100 and Git diff checks passed. Secrets, databases, dependencies,
  screenshots and build outputs stay ignored. No remote push or deployment performed.
- Existing Windows launcher prerequisite/port checks were tested in the initial work;
  interactive double-click/browser launch was not exercised automatically.

## Differences, limits and next steps

No known failing tested path. Smaller original sound/image/theme collections than Wheel
of Names; no Unsplash integration. Duplicates collapse only visually, preserving required
probabilities. Above 48 entries the renderer uses numbered sectors plus a full-name legend.
Animation curves/center-size proportions are ours; native color picker, popup limit 200.
Human listening, real screen-reader use and physical iOS/Android installation/keyboard/
safe-area behavior remain unverified. These are the next validation steps.
Large archives load in memory; history pagination/quotas remain future work. Upstream
Starlette/httpx deprecation and two Rollup/Zod PURE warnings do not prevent checks.
Before public hosting: HTTPS/Secure cookie, exact origins, persistent SQLite volume,
consistent backups and deployment-specific rate limits. See deployment.md and roadmap.md.
Accounts, live rooms, payments, AI and app-store distribution remain outside this version.

## Run and continue

Use `START_GYRNA.bat` from the root or the exact README commands. Backend port **8017**
(8000 belongs to another project); frontend dev 5173, production preview 4173.
The launcher reuses the existing build: run `cd frontend; bun run build` after source edits.
Local preview: http://localhost:4173. No background deployment service was installed.
Keep backend/frontend schemas aligned, add migrations for schema changes and update this
file with actual results. AGENTS.md contains stable conventions and check commands.
