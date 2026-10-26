# Deployment

An explicitly requested temporary public preview is available through Cloudflare Quick
Tunnels. This runs on the user's computer; no permanent hosted deployment was made.

From the repository root on Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/public-preview.ps1
# Stop only the public tunnel and its separate backend:
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/public-preview.ps1 -Stop
```

The launcher verifies pinned cloudflared 2026.10.3 against its official SHA-256, builds
the frontend, obtains a random HTTPS URL, migrates a separate database and starts
`app.preview:app` on 127.0.0.1:8018. It uses Secure/HttpOnly cookies, the exact public
origin for CORS/CSRF, and an exact Host allowlist. Only `frontend/dist/` is served as
static content; the repository and SQLite files are not served. Access logs are disabled.
The original local services (8017/4173) and their database are unchanged.

The current URL/process IDs are in ignored `artifacts/public-preview.json`; data is
in `artifacts/public-preview.db`, logs in `artifacts/public-*.log`. Keep the computer
awake and online. Stopping/restarting creates a new URL and thus a new browser origin;
export wheels before ending a preview if they need to be carried to the next URL.
Each browser gets its own anonymous workspace; local wheels do not automatically appear
on another device. Import a JSON backup or use an explicit public-preview share snapshot.
`STOP_GYRNA.bat` stops only the local services, not this public preview.
See [Cloudflare Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/)
for the temporary URL lifecycle and testing-only service limitations.

For permanent hosting, serve Vite `dist/` and FastAPI under one HTTPS origin,
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
