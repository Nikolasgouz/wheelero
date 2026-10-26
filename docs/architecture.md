# Architecture

Current stack: React/TypeScript, Bun/Vite and static file hosting. There is no application
backend. Python/FastAPI/SQLite code remains in backend/ solely as historical source/recovery.

## Data and drawing

UI -> state/store.ts -> IndexedDB v10. The version-1 saved record holds wheels, current ID,
tool-page mappings, timed removals and removed-entry restoration data. No API client remains.
Templates are bundled. localStorage stores preferences/editor drafts, not the wheel database.

Web Locks serialize read-modify-write operations across tabs; BroadcastChannel refreshes
other views. The store publishes committed changes only after IndexedDB writes succeed.
Quota failures report an error and preserve the previous saved state. Text inputs keep a
temporary optimistic overlay for caret stability and revert it on failed writes.

Web Crypto rejection sampling determines the result independently of animation/display
projection. Duplicate entries retain separate chances. Geometry lands on the winning ID.
No-repeat, auto-removal and manual removal retain their existing behavior; removal jobs
identify their original wheel/entry/result and do not affect copies.

## Sharing

lib/sharing.ts serializes a validated title/options/settings snapshot with empty history,
encodes UTF-8/base64url into /#wheel=..., and validates it on receipt. The recipient explicitly
saves a new copy. The fragment is not sent to the static host. It is not encrypted and cannot
be revoked. A 16,000-character encoded-payload limit bounds parsing/link size; use JSON
export for larger wheels/images. Old ?share= server links show an explanatory message.

## Static pages and PWA

src/site.ts and SiteContent.tsx supply shared public content. scripts/pages.tsx pre-renders
seven routes and 404/launch HTML, robots and sitemap before Workbox precaching. PUBLIC_URL
and PUBLIC_INDEXING are build-time inputs. There is no runtime metadata templating service.

Vite preview serves real HTML routes and 404s with no API proxy. Production Caddy serves
the same dist directory. The service worker caches app files/assets, not user lists. Updates
require this tab's explicit action and completed writes; other tabs cannot force a reload.

## Storage persistence

IndexedDB quota depends on browser/device. navigator.storage.persist() is requested only
when the user presses Protect local storage; browser refusal is explained honestly.
Neither persistent storage nor PWA installation replaces JSON backups. Data is per-origin
and does not automatically move from a temporary preview URL to wheelero.com.
