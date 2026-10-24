# Deployment

No public deployment has been made. Serve Vite `dist/` and FastAPI under one HTTPS origin,
proxying `/api` to Python. The API URL is relative; Vite's port 8017 proxy is development only.

- Persistent local volume for SQLite, writable only by the backend user.
- Absolute `DATABASE_URL` (Unix example: `sqlite:////data/gyrna.db`), outside static assets.
- `COOKIE_SECURE=true` and explicit HTTPS `ALLOWED_ORIGINS`.
- Apply `alembic upgrade head` before starting the upgraded backend.
- One backend instance with local SQLite. WAL improves readers; only one writer operates
  at a time. Network filesystems and horizontal replicas are not supported.
- Proxy body limit 9 MB for API requests (validated wheel snapshots are limited to 8 MB),
  request timeout >10 seconds and TLS. User images are embedded in private SQLite snapshots.
- SPA fallback to `index.html`, never for `/api`; revalidate HTML, service worker and
  manifest. Hashed assets may be immutable. CSP should permit self assets, `data:` images
  and dynamic styles. Gallery WebP assets are part of the offline precache.
- Disable/redact access logs containing share-token paths and sensitive headers. Keep
  useful startup/error logs. Never expose SQLite files through the web server.
- Use consistent SQLite backups (backup API or snapshot including WAL); verify restoration.

Outside localhost, Web Crypto, service workers and Web Locks require HTTPS. Native sharing,
install prompts and fullscreen vary by browser; copy-link/instructions provide alternatives.
The cookie is the anonymous access credential; clearing it loses access to the old space.
Local remaining data is copied to a new workspace. There is no cross-device recovery.

Before opening a public service, choose appropriate edge rate limits, storage quotas and
session/data retention. Anonymous writes consume disk. Account recovery, abuse operations
and multi-instance deployment belong to later versions.
