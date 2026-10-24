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
Backend tests: first run 20 passed, 1 test-client API error (fixed; rerun pending).
Frontend implemented; production/browser verification still pending.
Use backend port 8017: port 8000 belongs to an existing unrelated process.
