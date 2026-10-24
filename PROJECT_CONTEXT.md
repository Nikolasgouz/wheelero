# Γύρνα. — context

Last updated: 2026-10-24. Local v1 implemented and verified; no pending implementation task.

## Product and scope

Greek decision spinner, no account required, responsive installable PWA. Implemented:
2–200-entry wheels (0–1-entry drafts), editing/reordering/bulk input/duplicate warning,
templates, library/copy/delete, history, no-repeat, JSON backups, theme/sound/presentation,
revocable public snapshots, offline editing/draws and conflict-preserving synchronization.
Stack: FastAPI/SQLAlchemy/Alembic/SQLite + React/TypeScript/Vite/Bun. No external services.
The workspace started empty. No remote push or public deployment was authorized or made.

## Decisions and file map

- `START_GYRNA.bat`: Windows double-click launcher; checks prerequisites/ports, runs
  migrations, builds missing frontend output, opens both servers and the browser.
  Uses the existing production build; rebuild explicitly after frontend source changes.
- `backend/app/routes.py`, `schemas.py`, `security.py`: API, validation, cookie ownership,
  CSRF and Origin checks. `/docs` is the generated API reference.
- `models.py`, `database.py`, `migrations/`: explicit schema, WAL/foreign keys and serialized
  writes. Function-scoped DB dependencies commit **before** sending success responses.
- `services.py`: secure server selection and snapshots; results survive option deletion.
- `frontend/src/state/store.ts`: IndexedDB outbox, mutation/result UUIDs, server revisions,
  tombstones, conflict copies, uncertain-draw recovery, Web Locks/BroadcastChannel.
  Synchronous edit overlays preserve the caret while serialized durable writes complete.
- `lib/random.ts`, `lib/geometry.ts`: independent unbiased offline RNG and wheel geometry.
- `App.tsx`, `screens/`, `components/`: actual UI; `i18n.ts` is the Greek copy dictionary.
- `vite.config.ts`: prompt-updated PWA; shell/fonts only are cached, never private APIs.
- `backend/tests`, `frontend/src/lib/*.test.ts`, `frontend/e2e`: automated verification.

Client-reported/imported results are explicitly `offline`. Public shares never include
history or original write access. A lost online draw response must be recovered with its
original ID; it is never replaced by a fresh offline draw. Losing the cookie creates a new
workspace and copies remaining local data. There is no cross-device account recovery.

## Verification

- Latest full verification (2026-10-24): backend pytest 22 passed, including ownership,
  validation, persistence, simultaneous
  idempotent retries, offline ingestion, rollback, shares/revocation and actual process restart.
  Restart verification retains the cookie in a fresh HTTP client after each server restart;
  it no longer reuses a stale keepalive connection to the terminated process.
- Alembic upgrade/drift check and Python compilation passed; Python lines <=100.
- Bun frozen install, TypeScript, ESLint and production build passed. PWA precache ~838 KiB.
- Unit tests: 3 passed, including all 20,100 sector positions for counts 1–200.
- Full Chromium E2E suite: 16 passed together (48.8 s), covering offline reload/resync,
  conflict copies, sharing/revocation, refresh persistence, JSON export/valid and malformed
  import, 200 entries, no-repeat, caret preservation, cookie loss, Unicode title copying,
  lost-response recovery and real service-worker updates preserving unsubmitted editor text.
- Light/dark axe WCAG A/AA scans, keyboard and reduced-motion checks passed at
  360/390/768/1440px. Screenshots are in ignored `artifacts/`; inspected locally.
- Latest Origin regression passed for 127.0.0.1 preview while rejecting an external origin.
- Git diff/ignore checks passed; no secrets, DBs, venv, dependencies or build outputs tracked.
- Windows launcher: Python/Bun resolution and free/occupied-port branches verified through
  cmd.exe; occupied ports fail with a visible message. Interactive browser launch not exercised.

## Limits and next steps

No known unresolved application failure in tested paths. Upstream warnings: Starlette deprecates the httpx test
adapter; Rollup removes two malformed PURE annotations in Zod. Neither prevented checks.
Physical iOS/Android installation, virtual-keyboard/safe-area behavior and human screen-reader
review are not verified by Chromium desktop emulation. Real-device checks remain next.
Large archives are loaded in full; history pagination and retention/quotas are later work.
Before public launch: persistent SQLite volume, HTTPS/Secure cookie, exact origins,
consistent backups and hosting-specific rate limits. Account/live-room/payment/AI/store
distribution features are deliberately excluded; see roadmap.

Use backend port **8017** (8000 belongs to an unrelated project), frontend dev 5173 or
production preview 4173. Exact setup/run/check commands are in README and AGENTS.md.
No background deployment was installed. Close both launcher console windows to stop it.
