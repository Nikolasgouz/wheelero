# Architecture

Browser → same-origin /api → FastAPI → SQLAlchemy → SQLite.
IndexedDB stores local wheels and pending operations. The service worker caches only
the app shell, never private API responses. See final implementation notes here.
