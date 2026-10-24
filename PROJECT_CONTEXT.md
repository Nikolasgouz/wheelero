# Γύρνα. — context

Last updated: 2026-10-24. Implementation and verification in progress.
Product: Greek anonymous decision spinner, responsive PWA, no account required.
Stack: FastAPI/SQLAlchemy/Alembic/SQLite; React/TypeScript/Vite/Bun.
Architecture: cookie-isolated workspaces, CSRF, revisioned snapshots, idempotent draws,
IndexedDB local state and outbox, conflict copies, immutable revocable public snapshots.
No deployment or remote push authorized. The workspace was empty.

Implemented backend: anonymous cookie sessions, CSRF/Origin checks, owned wheel CRUD,
ordered options, revision/mutation-id sync, cryptographic idempotent draws, no-repeat,
offline-result ingestion, immutable revocable shares, templates, initial Alembic migration.
Backend API tests: 21 passed; separate real-process restart test passed after fixing
transaction scope to commit before sending a response. Full rerun underway.
Frontend typecheck/lint and production build passed. Geometry/random/import tests: 3 passed.
Browser: 1440px light/dark screenshots and axe checks passed. First long E2E flow reached
its final assertion but exceeded the slow-host timeout; increased runner budget and rerunning.
Remaining browser suite (mobile, offline, sharing, conflicts) underway.
Use backend port 8017: port 8000 belongs to an existing unrelated process.
