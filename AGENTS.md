# Working in Wheelero

Use Python/FastAPI, SQLAlchemy, Alembic and SQLite in backend; React/TypeScript,
Vite and Bun in frontend. Never replace this stack or introduce hosted dependencies.
Keep code simple, readable and focused. No broad exception handlers, silent failures,
unnecessary normalization/type guards, compatibility shims or speculative parameters.
Inline single-use helpers unless they clarify substantial logic. Python lines <=100 chars.
Validate external inputs at boundaries; keep internal invariants explicit.
English is the default UI language; menus support fourteen languages through src/locale.ts
and src/locales/*.json. Keep UI labels centralized and translate interface text only.
Retain the Wheelero brand and all user-authored content. Templates and API messages
remain English; keep bundled/backend templates aligned.
Keep flag/audio assets local and preserve their credits/licenses under public/.
Do not add tests unless requested (the initial implementation explicitly requests tests).

Install: `python -m venv .venv`, `.venv/Scripts/python -m pip install -r backend/requirements.lock`;
`cd frontend; bun install --frozen-lockfile`.
Backend (from backend): `../.venv/Scripts/python -m alembic upgrade head`, then
`../.venv/Scripts/python -m uvicorn app.main:app --port 8017 --reload --no-access-log`.
Frontend: `bun run dev`. Checks: backend `../.venv/Scripts/python -m pytest`,
frontend `bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`, `bun run e2e`.
Unix: use `.venv/bin/python` instead of `.venv/Scripts/python`.
Windows launcher: `START_GYRNA.bat` always builds and opens `/api/launch` to bypass stale
PWA HTML; `STOP_GYRNA.bat` stops its servers. Never kill unrelated listeners or clear
browser storage to update the app. Launcher logs stay in ignored `artifacts/`.

All schema changes require explicit Alembic migrations. Never create tables at app startup.
Enforce ownership and CSRF on private writes. No tokens or private payloads in logs.
Offline results are client-reported; never label them as server-verified.
Preserve revisions, idempotency and conflict copies when changing sync.
Keep backend/frontend customization schemas aligned and versioned. Display projection
must never change draw eligibility; the wheel must land on the winning entry ID.
Post-result idle motion is decorative and must never change the recorded result.
Modal settings stay temporary until OK completes durable storage; removal jobs follow copies.
Do not commit databases, secrets, virtualenvs, dependencies, screenshots or build outputs.
Keep lockfiles, .env.example and migrations tracked. Make coherent local commits;
never push or deploy without instruction. Use a per-command automation author when
no Git identity is configured; do not change the user's global Git configuration.
Update README, PROJECT_CONTEXT and relevant docs after substantive changes.
Before finishing: remove unnecessary defensive code, one-use trivial helpers and unused params.
